# AGENTS.md — правила для AI-агентов в multi-monitor_calculator

Этот файл читают все агенты. Полные детали и workflow лежат в `CLAUDE.md` и в skill-папках:

- `.claude/skills/README.md`
- `.claude/agents/README.md`
- `.opencode/README.md`

Источник истины для этого репозитория: `AGENTS.md` + `CLAUDE.md`. Harness перенесён из `vps_artpol`, но адаптирован под текущий проект.

## Стек

- **SvelteKit** + **Vite** + **TypeScript** + **Svelte 4**.
- UI строится на **SMUI** и текущей theme-системе проекта (`src/lib/theme/*`, `static/smui.css`, `static/smui-dark.css`).
- Деплой и сборка ориентированы на **Netlify** (`adapter-netlify`), не на Docker/Timeweb.
- В проекте есть два слоя: исторический **multi-monitor calculator** и новый **repair estimate flow**.

## Канон для этого репозитория

- Сохранять **визуальный стиль текущего проекта**. Не переносить внешний редизайн буквально, если пользователь отдельно не просит.
- Переиспользовать существующие компоненты из `src/lib/components/*`, существующие SMUI-patterns и текущую theme-палитру.
- Если задача касается расчёта ремонта, смотреть:
  - `src/lib/repairFlow.ts` — frontend-формулы, шаги, категории, материалы;
  - `src/lib/server/repairEstimateMapping.ts` — mapping human scenario -> backend payload;
  - `src/routes/api/repair-estimate/calculate/+server.ts` — локальный server-side endpoint.

## Gigma и секреты

- `GIGMA_APP_TOKEN` живёт только на сервере, через `.env`.
- Браузер **не** ходит напрямую в Gigma.
- Все вызовы Gigma идут только через server-side код SvelteKit (`+server.ts`, `+page.server.ts`, `src/lib/server/*`).
- В UI не показывать технические id, `composition_id`, `quantity_source` и похожие backend-термины.

## Data flow

- Секреты, токены и внешние API с приватными ключами — только server-side.
- Если клиенту нужен headless backend-расчёт, клиент ходит в локальный route проекта, а route уже обращается наружу.
- Для обычных чтений и SSR использовать существующие SvelteKit-паттерны проекта. Не тянуть React/Redux/RTK Query-подходы.

## PR и ветки

- Базовая ветка — `master`, если пользователь явно не попросил другое.
- Merge — обычный, не squash, если нет отдельной команды.
- Тело PR: `## Summary` и `## Test plan`.

## Проверки

- После UI-правок проверять responsive на `<=1024`, `<=768`, `<=480`.
- Минимум прогонять `npm run build`.
- Если запускается `npm run check`, не прятать новые ошибки за уже известными старыми проблемами.

## Документация

- В этом репозитории сейчас нет обязательного `history.md`.
- Значимые решения, mapping и планы держать в `docs/` и при необходимости кратко отражать в `README.md`.

## Чего не делать

- Не тащить React / Next / Redux / RTK Query.
- Не класть токены в browser bundle, `localStorage` или публичные env.
- Не ломать существующий visual language проекта ради внешнего источника дизайна.
- Не копировать бизнес-логику “по аналогии”, не сверив текущий код и контракт.
