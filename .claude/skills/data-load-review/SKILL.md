---
name: data-load-review
description: Ревью слоя данных в multi-monitor_calculator (SvelteKit) — load-функции, local endpoints, server-side API bridge, invalidate/depends, типы ответов, гонки запросов. Не правит код без явного запроса; выдаёт отчёт и приоритеты.
when_to_use: после правок src/routes/api/, src/lib/server/, load (+page.ts/+page.server.ts), form actions, кэша/инвалидации
disable-model-invocation: true
allowed-tools: Read Glob Grep
---

# Ревью слоя данных (repair calculator, SvelteKit)

Ты **не обязан править код** — по умолчанию отчёт. Правки — только если пользователь явно попросил «исправь».

## Что проверить

1. **`src/lib/server/*` и `src/routes/api/*`** (server-side bridge)
   - Секреты и токены живут только server-side, **не** в browser storage.
   - Единая обработка ошибок: не-2xx → понятная ошибка; тело ошибки не глотать.
   - Локальный endpoint не должен протаскивать technical ids или private env в клиент.

2. **`load`-функции (`+page.ts` / `+page.server.ts`)**
   - Server vs universal выбран осознанно: секреты/cookie → только `+page.server.ts`.
   - Используется переданный в `load` аргумент `fetch` (а не глобальный) — иначе ломаются SSR, куки и относительные URL.
   - Зависимости помечены (`depends('app:thing')`) там, где нужна точечная `invalidate`.
   - Ошибки через `error(status, …)`, а не «тихий» возврат пустого результата.

3. **Мутации (form actions)**
   - Пишущие операции — через `actions` в `+page.server.ts` + `use:enhance`, а не «голый» клиентский fetch, где это возможно.
   - После мутации — `invalidate` / `invalidateAll` или возврат свежих данных; иначе на экране старое.
   - Порядок важен (несколько подряд)? Sequencing у родителя: `await` по очереди или отмена предыдущего.

4. **Типы**
   - `response: any` / `as any` на ответе API — зафиксируй риск; предложи тип ответа или `unknown` + сужение.
   - Поля контракта (optional / nullable / omitted) типизированы честно, особенно для form actions.

## Формат отчёта

- **P0 / P1 / P2** — блокеры / важно / желательно.
- **Файл:строка** — где проблема (приблизительно, после grep/read).
- **Краткий фикс** — одно предложение на пункт; без больших патчей, если не просили.

## Запреты

- Не предлагать «оставим `any` везде» без плана сужения типов.
- Не пропускать 401 / 403 без единого согласованного пути обработки.
- Не одобрять клиентский fetch для мутаций там, где уместен form action.
