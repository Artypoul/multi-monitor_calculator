---
name: frontend-plan
description: Use before implementing a Gigma/multi-monitor_calculator frontend task, major UI change, API integration, refactor, or “what next” planning request. Produces a plan only; does not write code.
---

# Frontend Plan

You do not write code in this skill. Produce a plan for a SvelteKit/Vite/TypeScript task.

Read and use:

- `CLAUDE.md` and `AGENTS.md` for stack, PR workflow, responsive rules, affordance matrix, and form save scope.
- Recent docs in `docs/` and the current `README.md` when the task affects user flow, mapping, or setup.
- `git status`, recent commits, and open PRs if available; prefer `gh pr list --base master --state open --limit 15` for duplicate-PR checks.
- Existing code in `src/routes`, `src/routes/api`, `src/lib/server`, `src/lib/stores`, `src/lib/components`, and related files found by grep.

Required checks:

- Identify routes, components, stores, API wrappers, hooks, tests, and docs affected by the task.
- Decide what belongs in `load`, `+page.server.ts` form actions, client handlers, and `invalidate`/`depends`.
- If API contract is unclear, require verification from existing wrappers or backend contract; do not guess from wording.
- List relevant affordance-matrix items from `CLAUDE.md`.
- State form save scope: debounce, abort, and request ordering belong to the parent.
- State responsive checks for UI changes: `<=1024`, `<=768`, `<=480`.

Output format:

```markdown
## FP<n> — <short name>

**Scope:** one task; no unrelated refactor.

**Touch points:** routes / api / stores / components / hooks / tests / docs.

**UI and data contracts:** routes, load vs action, loading/empty/error, a11y.

**Affordance-matrix:** relevant items and what is preserved or TODO.

**Form save scope:** parent-owned debounce/abort/order; actions + invalidate.

**Responsive:** checks at <=1024 / <=768 / <=480.

**Intentionally not doing:** ...

**DoD:** npm run check, lint, tests, docs/README updates when relevant, PR base master.

**After code:** skills/checks to run next.
```

Never propose a PR base other than `master` unless the user explicitly asks.
