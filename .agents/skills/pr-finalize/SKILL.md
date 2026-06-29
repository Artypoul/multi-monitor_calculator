---
name: pr-finalize
description: Финализация PR для repair calculator frontend — history.md, svelte-check, lint, vitest, gh pr create --base master. Не мерджит без явного «да». Подписка на активность PR после create, если доступен MCP GitHub.
when_to_use: код готов, нужен PR в master и при необходимости обновление docs
disable-model-invocation: true
allowed-tools: Read Glob Grep Bash Write
---

# Финализация PR (repair calculator frontend)

Только когда **локально зелёно** или пользователь принял известные красные пункты. PR base = **`master`**. Не **`git push --force`** на `main` / `master`.

## Pre-flight

```bash
git fetch origin master 2>/dev/null; git status -sb; git log origin/master..HEAD --oneline 2>/dev/null || git log -5 --oneline
```

```bash
git diff --check
```

```bash
npm run check 2>&1        # svelte-check (типы + Svelte-разметка)
```

```bash
npm run lint 2>&1
```

```bash
npm run test 2>&1         # vitest
```

Если CI-важно и время есть:

```bash
npm run test:e2e 2>&1     # playwright
```

При красном check / lint / test — **остановись**, верни лог пользователю; не коммить без явного «игнорируй».

## history.md

- Обнови **верх файла**: дата «Последнее обновление», TL;DR при необходимости, **строка таблицы PR** если это PR-релиз (см. AGENTS.md).
- Отдельный мини-PR только на docs — допустим по AGENTS.md (`docs(history.md): …`).

## Codex / retro (напоминание)

- На **этом** PR Codex не ждём.
- Сразу после `gh pr create` — если есть MCP GitHub: **`subscribe_pr_activity`** для ветки/PR (см. AGENTS.md), иначе поздние вебхуки теряются.
- Перед **следующей** задачей — retro по merged PR (3 канала: reviews, review comments, comments).

## Коммит

- Стиль сообщений — как в недавних коммитах репозитория; не `--no-verify` без причины.
- Не `git commit --amend` на уже запушенное без явной просьбы пользователя.

## Pull request

```bash
git push -u origin HEAD
gh pr create --base master --title "…" --body "$(cat <<'MD'
## Summary
- …

## Test plan
- [ ] npm run check (svelte-check)
- [ ] npm run lint
- [ ] npm run test
- [ ] (опционально) npm run test:e2e
- [ ] Responsive: ≤1024 / ≤768 / ≤480 — если менялся UI

## history.md
- …

MD
)"
```

Верни пользователю **URL PR**.

## Мердж

- **`gh pr merge --merge`** (обычный merge, **не squash**) — только после явного согласия пользователя.
- После merge — синхронизация ветки с `origin/master` по правилам из **AGENTS.md**.

## Деплой (Netlify)

- Если менялись сборка / `Dockerfile` / `adapter-netlify` — напомни проверить `npm run build` локально; деплой на Netlify выполняет пользователь.
