---
name: flow-debug-checklist
description: Чек-лист перед PR на flow-фичу с несколькими состояниями, шагами или редиректами. Лечит class of bugs «smoke прошёл, прод сломан» — когда тест-setup отличается от реального пользовательского пути.
when_to_use: multistep flow, route guard, redirect после form action, goto(), post-submit navigation, сложный SSR/client transition
disable-model-invocation: true
allowed-tools: Read Glob Grep Bash
---

# /flow-debug-checklist

Использовать **перед** открытием PR. Лечит класс багов «smoke прошёл, прод сломан» — когда тестовый setup отличается от реального пользовательского пути.

Триггеры: изменения в `hooks.server.ts` / `+layout.server.ts` (guard, token restore), редирект после `use:enhance` / form action, любой `goto(...)` после мутации.

## 1. API contract table

Перед написанием `load` / action выписать таблицу источников правды:

```
| Поле                  | Гарантированно есть в      | Может отсутствовать в    |
| --------------------- | -------------------------- | ------------------------ |
| user.needs_onboarding | GET /api/user              | POST /api/login.user     |
| user.access_token     | POST /api/login.user       | GET /api/user.user       |
```

Проверка делается **curl'ом**, не на доверии к описанию в письме / документации.

```bash
curl -s -H "Authorization: Bearer $TOK" -H "Accept: application/json" \
  <local-or-remote-endpoint> | jq '.'
```

Сравнить три варианта: без токена (публичный?), с токеном свежесозданного юзера (new user), с токеном уже-завершившего флоу (returning user).

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
grep -rn "redirect(3" src/routes              # все редиректы в load / actions
grep -rn "invalidate\|invalidateAll" src/      # где обновляем данные после мутации
grep -rn "locals.user\|locals.session" src/    # где читаем сессию
```

Если паттерн нужен в N местах — применить во **всех** N сразу. Локальная слепота — частая причина регрессий через 2 PR.

## 4. Failure mode table

```
| Сценарий                     | Что произойдёт             | Защита                           |
| ---------------------------- | -------------------------- | -------------------------------- |
| 200 без нужного поля         | undefined → ветка else     | refetch из надёжного endpoint    |
| 422 с errors.field           | field error                | parseFieldErrors → fail(422, …)  |
| Network failure (нет ответа) | бросок в load              | +error.svelte / try-catch        |
| 401 в публичном endpoint     | глобальный редирект мешает | флаг «не редиректить» в client   |
| 403 для не-владельца         | общий редирект             | локальное сообщение, если важно  |
```

Пустая клетка «защита» — починить ДО PR.

## 5. Sequence check

Для многошагового flow расписать:

```
- Что выполняется в hooks.server.ts на каждый запрос (сессия)?
- Какой load server-only (+page.server.ts), какой universal (+page.ts)?
- Что инвалидируется после мутации (invalidate / invalidateAll)?
- Какой переход — client-side (goto) vs full reload (location)?
```

Особенно для: token-restore (refresh, прямой URL), цепочек редиректов (A→B→C по условию), guard в `+layout.server.ts` (он отрабатывает на каждую серверную загрузку лэйаута — но проверь, что целевой роут реально под этим лэйаутом).

## 6. Stop-phrases

Встретил про свой код — **починить или явно протестировать сейчас**:

- «работает по такому же паттерну как в X» — открыть X и сравнить буква-в-букву.
- «smoke прошёл» — проверить, что smoke = real flow (см. п.2).
- «бэк гарантированно вернёт» — проверить curl'ом (см. п.1).
- «layout.server поймает» — проверить, что целевой роут под этим лэйаутом и `load` реально перезапустится в этом flow.
- «после мутации обновится» — проверить, что есть `invalidate` (SvelteKit не перечитывает `load` сам).

## История уроков (из React-предшественника gigma-new — принципы переносятся)

- **needs_onboarding**: handler читал поле из `login.user`, но контракт гарантирует его только в `GET /api/user`. Юзер минул онбординг. Урок: контракт — curl'ом (п.1), после login дочитать `/api/user`.
- **PR base = ветка другого PR**: после merge коммиты ушли не в main. Урок: PR base = master всегда.
- **«работает как в X» без сверки**: реально было иначе. Урок: «по такому же паттерну» = открыть оба файла и сравнить.
