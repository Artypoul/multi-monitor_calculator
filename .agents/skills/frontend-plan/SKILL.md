---
name: frontend-plan
description: План фронтенд-задачи для multi-monitor_calculator (SvelteKit/Vite/TS) до написания кода. Читает AGENTS.md, CLAUDE.md и git. Используй перед фичей, рефакторингом или «что делать дальше».
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

1. Прочитай **`AGENTS.md`** и **`CLAUDE.md`** в корне — стек, PR workflow, responsive, affordance-matrix, form save scope.
2. Посмотри свежие документы в **`docs/`** и актуальный **`README.md`**, если задача касается пользовательского сценария, mapping или setup.
3. **Grep** по `src/` по ключевым словам фичи (компоненты `.svelte`, маршруты в `src/routes`, endpoints в `src/routes/api`, server helpers в `src/lib/server`) — не плодить дубли.
4. Если контракт API неясен — сверь с существующими server-side helpers и local endpoints; не доверять описанию на словах.

## Формат ответа (согласуй с пользователем)

```markdown
## FP<n> — <краткое название>

**Скоуп:** одна задача; без несвязанного рефакторинга.

**Что трогаем:** routes (`src/routes/**`) / api (`src/routes/api/**`, `src/lib/server/**`) / stores (`src/lib/stores`) / components (`src/lib/components`) / tests

**Контракты UI:** маршруты, что в `load` vs form action, loading/error (`+error.svelte`), a11y (клавиатура, роли)

**Affordance-matrix:** какие пункты 1–8 релевантны; что сохраняем / что TODO

**Form save scope:** debounce/abort только в родителе; мутации через form actions + `invalidate`

**Responsive:** явно — проверка **≤1024 / ≤768 / ≤480** после UI-изменений

**Намеренно не делаем:** …

**DoD:** `npm run check` (svelte-check) · lint · vitest (и e2e если трогали критичный flow) · docs/README при осмысленном шаге · PR base = **master**

**После кода:** какие skills дернуть (`/data-load-review`, `/affordance-review`, `/pr-finalize`).
```

## Запреты

- Не предлагать PR base отличный от **`master`** без явной просьбы владельца репо.
- Не обещать «Codex дождёмся» — по AGENTS.md Codex async, retro **после** merge на следующей задаче.
- Не игнорировать **retro 3 канала** при продолжении темы предыдущего PR (reviews, review comments, comments).
