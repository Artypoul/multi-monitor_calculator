# REFERENCE: multi-monitor_calculator

Краткая шпаргалка по текущему репозиторию.

## Стек

- SvelteKit + Vite + TypeScript + Svelte 4
- SMUI + локальные темы в `src/lib/theme/*`
- Deploy: Netlify (`adapter-netlify`)

## Важные зоны кода

| Что | Где |
| --- | --- |
| Главная страница / основной user flow | `src/routes/+page.svelte` |
| Общий shell | `src/routes/+layout.svelte` |
| Компоненты legacy monitor UI | `src/lib/components/*` |
| Repair flow formulas и шаги | `src/lib/repairFlow.ts` |
| Server-side env и Gigma client | `src/lib/server/env.ts`, `src/lib/server/gigma.ts` |
| Mapping сценариев ремонта | `src/lib/server/repairEstimateMapping.ts` |
| Локальный repair estimate endpoint | `src/routes/api/repair-estimate/calculate/+server.ts` |
| Theme | `src/lib/theme/light/*`, `src/lib/theme/dark/*` |

## Команды

| Команда | Что делает |
| --- | --- |
| `npm run dev -- --port 5173 --host 127.0.0.1` | Локальная разработка |
| `npm run build` | Прод-сборка |
| `npm run check` | Svelte/type checks |
| `npm run lint` | Prettier + ESLint |

## Особые правила

- Gigma token только на сервере.
- Браузер не ходит напрямую в Gigma.
- Новый repair UI должен выглядеть как часть текущего проекта, а не как внешний редизайн.
