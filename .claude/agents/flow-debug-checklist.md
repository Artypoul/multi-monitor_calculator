---
name: flow-debug-checklist
description: Чек-лист перед PR на flow-фичу (auth, onboarding, чекаут, навигация после мутации). Зеркало для чтения вне Claude Code; источник — .claude/skills/flow-debug-checklist/SKILL.md.
---

# flow-debug-checklist

Зеркало skill'а [`/flow-debug-checklist`](../skills/flow-debug-checklist/SKILL.md). См. там полный чек-лист.

Краткая выжимка (когда использовать):

- **Перед PR на flow-фичу** — sign-in / sign-up / onboarding / checkout, изменения в `hooks.server.ts` / `+layout.server.ts`, редирект после form action или `goto(...)`.
- **Шесть пунктов:** API contract table (curl), real flow vs test setup, pattern symmetry grep, failure mode table, sequence check, stop-phrases.
- **Лечит class of bugs:** «smoke прошёл, прод сломан» — когда тестовый setup (прямой URL / reload = полный SSR) отличается от реального пути (client-side навигация после `use:enhance`, где server load зовётся через fetch).

Триггер для skill: задача упоминает `sign-in`, `sign-up`, `onboarding`, `checkout`, route guard, `hooks.server`, `+layout.server`, token restore, редирект после мутации.

Меняй вместе с `.claude/skills/flow-debug-checklist/SKILL.md` в одном PR.
