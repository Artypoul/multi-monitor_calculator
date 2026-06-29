---
name: flow-debug-checklist
description: Чек-лист перед PR на flow-фичу с несколькими состояниями, шагами или редиректами. Лечит class of bugs «smoke прошёл, прод сломан» — когда тест-setup отличается от реального пользовательского пути.
when_to_use: multistep flow, route guard, redirect после form action, goto(), post-submit navigation, сложный SSR/client transition
disable-model-invocation: true
allowed-tools: Read Glob Grep Bash
---

# /flow-debug-checklist

Использовать **перед** открытием PR. Лечит класс багов «smoke прошёл, прод сломан» — когда тестовый setup отличается от реального пользовательского пути.

Триггеры: изменения в `hooks.server.ts` / `+layout.server.ts`, server endpoint bridge, редирект после `use:enhance` / form action, любой `goto(...)` после мутации.

## 1. API contract table

Перед написанием `load` / action выписать таблицу источников правды:

```
| Поле                  | Гарантированно есть в       | Может отсутствовать в    |
| --------------------- | --------------------------- | ------------------------ |
| result.total          | 200 success response        | 4xx/5xx error response   |
| errors.<field>        | 422 validation response     | 200 success response     |
| warnings              | success response, если есть | empty/legacy response    |
```

Проверка делается **curl'ом**, не на доверии к описанию в письме / документации.

```bash
curl -s -H "Authorization: Bearer $TOK" -H "Accept: application/json" \
  <local-or-remote-endpoint> | jq '.'
```

Сравнить варианты: валидный payload, минимальный payload, невалидные поля, недоступный backend/ERP. Если endpoint публичный, не добавлять пользовательскую авторизацию только ради теста.

## 2. Real flow vs test setup

В SvelteKit «как ты открыл страницу» меняет, какой код выполнится:

**Real path (пользователь кликает по UI):**

```
Уже на сайте → submit формы (use:enhance) → action на сервере → redirect / goto
  → client-side навигация: SvelteKit зовёт server load целевой страницы (fetch),
    hooks.server отрабатывает на этот запрос; полного SSR-перерендера нет
```

**Test path (прямой URL / reload / location.href):**

```
Чистая загрузка → полный SSR: hooks.server + server load + рендер с нуля
```

Это **разные пути**. Если smoke прошёл через прямой переход / reload — это **не подтверждает** реальный клиентский flow (и наоборот). Для каждого редиректа после мутации проверить вручную **через UI** или явно отметить «test setup отличается от real flow в X».

## 3. Pattern symmetry grep

Добавил паттерн в одном месте — `grep` похожие:

```bash
rg -n "redirect\\(3" src/routes                 # все редиректы в load / actions
rg -n "invalidate|invalidateAll" src/           # где обновляем данные после мутации
rg -n "GIGMA_APP_TOKEN|Token:" src/             # токены только server-side
```

Если паттерн нужен в N местах — применить во **всех** N сразу. Локальная слепота — частая причина регрессий через 2 PR.

## 4. Failure mode table

```
| Сценарий                     | Что произойдёт             | Защита                           |
| ---------------------------- | -------------------------- | -------------------------------- |
| 200 без нужного поля         | undefined → ветка else     | refetch из надёжного endpoint    |
| 422 с errors.field           | field error                | parseFieldErrors → fail(422, …)  |
| Network failure (нет ответа) | бросок в load              | +error.svelte / try-catch        |
| 401 от внешнего API          | общий fallback             | human-readable error, token server-only |
| 403 от внешнего API          | общий fallback             | понятное сообщение, если важно   |
```

Пустая клетка «защита» — починить ДО PR.

## 5. Sequence check

Для многошагового flow расписать:

```
- Что выполняется в local server endpoint / action на каждый запрос?
- Какой load server-only (+page.server.ts), какой universal (+page.ts)?
- Что инвалидируется после мутации (invalidate / invalidateAll)?
- Какой переход — client-side (goto) vs full reload (location)?
```

Особенно для: server-side bridge к ERP, цепочек редиректов (A→B→C по условию), guards в `+layout.server.ts` (если они есть — проверь, что целевой роут реально под этим лэйаутом).

## 6. Stop-phrases

Встретил про свой код — **починить или явно протестировать сейчас**:

- «работает по такому же паттерну как в X» — открыть X и сравнить буква-в-букву.
- «smoke прошёл» — проверить, что smoke = real flow (см. п.2).
- «бэк гарантированно вернёт» — проверить curl'ом (см. п.1).
- «layout.server поймает» — проверить, что целевой роут под этим лэйаутом и `load` реально перезапустится в этом flow.
- «после мутации обновится» — проверить, что есть `invalidate` (SvelteKit не перечитывает `load` сам).

## История уроков

- **Поле прочитали не из того response**: handler ожидал поле там, где контракт его не гарантировал. Урок: контракт — curl'ом (п.1), real flow проверить кликами.
- **PR base = ветка другого PR**: после merge коммиты ушли не в main. Урок: PR base = master всегда.
- **«работает как в X» без сверки**: реально было иначе. Урок: «по такому же паттерну» = открыть оба файла и сравнить.
