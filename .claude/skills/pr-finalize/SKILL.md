---
name: pr-finalize
description: Финализация PR для multi-monitor_calculator frontend — docs/README, svelte-check, lint, vitest, gh pr create --base master. Не мерджит без явного «да». Подписка на активность PR после create, если доступен MCP GitHub.
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
node -e "const s=require('./package.json').scripts||{}; console.log(JSON.stringify({test:!!s.test,e2e:!!s['test:e2e']}))"
```

Если `test` или `test:e2e` есть в `package.json`, запусти соответствующую команду. В текущем проекте этих scripts может не быть — тогда явно напиши, что тест-команда отсутствует, и не блокируй PR только из-за этого.

При красном check / lint / существующих test scripts — **остановись**, верни лог пользователю; не коммить без явного «игнорируй».

## Docs

- Обнови **`docs/`** и/или **`README.md`**, если менялись пользовательский сценарий, mapping, setup или repo-правила.
- Отдельный мини-PR только на docs — допустим, если продуктовый код уже готов.

## Codex / retro (напоминание)

- На **этом** PR Codex не ждём.
- Сразу после `gh pr create` — если есть MCP GitHub: **`subscribe_pr_activity`** для ветки/PR (см. AGENTS.md / CLAUDE.md), иначе поздние вебхуки теряются.
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
- [ ] npm run test — если script есть
- [ ] npm run test:e2e — если script есть и flow критичный
- [ ] Responsive: ≤1024 / ≤768 / ≤480 — если менялся UI

## Docs
- …

MD
)"
```

Верни пользователю **URL PR**.

## Мердж

- **`gh pr merge --merge`** (обычный merge, **не squash**) — только после явного согласия пользователя.
- После merge — синхронизация ветки с `origin/master` по правилам из **AGENTS.md / CLAUDE.md**.

## Деплой (Netlify)

- Если менялись сборка / `adapter-netlify` / Netlify settings — напомни проверить `npm run build` локально; деплой на Netlify выполняет пользователь.
