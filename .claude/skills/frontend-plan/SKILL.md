---
name: frontend-plan
description: План фронтенд-задачи для repair calculator (SvelteKit/Vite/TS) до написания кода. Читает CLAUDE.md, history.md (если есть) и git. Используй перед фичей, рефакторингом или «что делать дальше».
when_to_use: новая задача, крупный UI, интеграция с API, эпик
disable-model-invocation: true
allowed-tools: Read Glob Grep Bash
---

# План frontend-задачи (repair calculator)

Ты **не пишешь код** — только план. Стек: **SvelteKit** (Svelte 4), Vite, TypeScript; данные через `load` + form actions; состояние — Svelte stores; деплой Netlify.

## Живой контекст (выполни и используй вывод)

```bash
git status -sb 2>/dev/null || true
```

```bash
git fetch origin master 2>/dev/null; git log --oneline origin/master -12 2>/dev/null || git log --oneline -12
```

```bash
gh pr list --base master --state open --limit 15 2>/dev/null || echo "(gh недоступен — пропусти)"
```

## Обязательные шаги

1. Прочитай **`CLAUDE.md`** в корне — стек, PR workflow, responsive, history, affordance-matrix, form save scope.
2. Прочитай верх **`history.md`** (если есть) — TL;DR + последние строки таблицы PR, чтобы не дублировать незамерженную работу.
3. **Grep** по `src/` по ключевым словам фичи (компоненты `.svelte`, маршруты в `src/routes`, endpoints в `src/lib/api`) — не плодить дубли.
4. Если контракт API неясен — сверь с существующими обёртками в `src/lib/api/` и с владельцем API; не доверять описанию на словах.

## Формат ответа (согласуй с пользователем)

```markdown
## FP<n> — <краткое название>

**Скоуп:** одна задача; без несвязанного рефакторинга.

**Что трогаем:** routes (`src/routes/**`) / api (`src/lib/api`) / stores (`src/lib/stores`) / components (`src/lib/components`) / hooks (`hooks.server.ts`) / tests

**Контракты UI:** маршруты, что в `load` vs form action, loading/error (`+error.svelte`), a11y (клавиатура, роли)

**Affordance-matrix:** какие пункты 1–8 релевантны; что сохраняем / что TODO

**Form save scope:** debounce/abort только в родителе; мутации через form actions + `invalidate`

**Responsive:** явно — проверка **≤1024 / ≤768 / ≤480** после UI-изменений

**Намеренно не делаем:** …

**DoD:** `npm run check` (svelte-check) · lint · vitest (и e2e если трогали критичный flow) · history.md при осмысленном шаге · PR base = **master**

**После кода:** какие skills дернуть (`/data-load-review`, `/affordance-review`, `/pr-finalize`).
```

## Запреты

- Не предлагать PR base отличный от **`master`** без явной просьбы владельца репо.
- Не обещать «Codex дождёмся» — по CLAUDE.md Codex async, retro **после** merge на следующей задаче.
- Не игнорировать **retro 3 канала** при продолжении темы предыдущего PR (reviews, review comments, comments).
