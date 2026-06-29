# Project rules

Primary email for status / digests: **2141349@mail.ru**

## Стек и архитектура

- **SvelteKit** + **Vite** + **TypeScript** + **Svelte 4**.
- UI: **SMUI** и локальная theme-система (`src/lib/theme/*`, `static/smui.css`, `static/smui-dark.css`).
- Deploy target: **Netlify** (`adapter-netlify`), не Docker/Timeweb.
- Приложение смешанное: исторический калькулятор мониторов и новый flow расчёта ремонта.

## Frontend rules

- Сначала читать существующий код и переиспользовать текущие паттерны проекта.
- Не приносить в проект чужой дизайн как отдельную дизайн-систему; UI должен выглядеть как часть `multi-monitor_calculator`.
- Для layout и form controls предпочитать уже используемые SMUI-компоненты.
- После UI-правок проверять `<=1024 / <=768 / <=480`.

## Repair estimate rules

- Gigma используется как headless backend.
- `GIGMA_APP_TOKEN` хранится только на сервере через `.env`.
- Браузер не ходит напрямую в Gigma; только в локальные SvelteKit routes/actions.
- Mapping сценариев живёт отдельно от UI:
  - `src/lib/repairFlow.ts` — пользовательский flow, площади, категории, материалы;
  - `src/lib/server/repairEstimateMapping.ts` — технический mapping;
  - `src/routes/api/repair-estimate/calculate/+server.ts` — server-side bridge.
- В пользовательском интерфейсе не показывать технические backend-слова и id.

## Data and secrets

- Всё, что требует секрета, токена или приватного API, должно жить в `src/lib/server/*`, `+server.ts` или `+page.server.ts`.
- Для SvelteKit data flow:
  - SSR/server data — через `load` или server routes;
  - клиентский сценарий с приватным backend — через локальный endpoint проекта;
  - после мутаций и пересчётов не оставлять UI в “старом” состоянии.

## Skills and harness

- Используй `.claude/skills/README.md` как карту сценариев.
- `.claude/agents/README.md` и `.opencode/README.md` — зеркала того же harness.
- Harness приехал из `vps_artpol`; если в imported skill-примерах встречаются auth/onboarding/specialization-кейсы, трактуй их как **паттерны ревью flow-рисков**, а не как буквальное описание этого продукта.

## PR workflow

- Base branch: `master`.
- PR body: `## Summary` + `## Test plan`.
- Merge: обычный merge, не squash, если пользователь отдельно не попросил иное.
- Не дублировать PR на ту же ветку.

## Checks

- Минимум: `npm run build`.
- При релевантных изменениях: `npm run check`, `npm run lint`.
- Если в репозитории уже есть известные старые ошибки, явно отделять их от новых.

## Docs

- В этом репозитории нет обязательного `history.md`.
- Планы, mapping, review notes и правила фич держать в `docs/`.
- `README.md` обновлять, когда меняется пользовательский сценарий, setup или server-side contract.

## Graphify

Если в проекте появится `graphify-out/graph.json`, сначала использовать `graphify query`, `graphify explain` и `graphify path`, а уже потом сырой grep по коду. После заметных структурных изменений обновлять граф командой `graphify update .`.

## Чего избегать

- React / Next / Redux / RTK Query-паттерны.
- Прямые browser-вызовы в Gigma.
- Публичные токены и client-side секреты.
- “Просто такой же экран, как в источнике” без сверки текущего visual language проекта.
