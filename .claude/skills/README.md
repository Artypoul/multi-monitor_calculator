# Claude Code skills — multi-monitor_calculator

Набор skills для текущего репозитория. Каждый skill — каталог с `SKILL.md`; вызов в Claude Code: `/имя-каталога`.

Источник правды по проекту: [`AGENTS.md`](../../AGENTS.md) и [`CLAUDE.md`](../../CLAUDE.md). Краткая repo-шпаргалка: [`REFERENCE-gigma-front.md`](./REFERENCE-gigma-front.md).

## Рекомендуемый порядок

1. `/frontend-plan` — план до кода
2. реализация в основном чате
3. `/data-load-review` — если менялись `load`, local endpoints, server-side bridge, invalidate
4. `/affordance-review` — если менялись формы, split секций, списки, async UI
5. `/flow-debug-checklist` — для многошаговых flow, redirects, submit-цепочек
6. `/frontend-safety-check` — перед любым frontend PR
7. `/pr-finalize` — checks, docs, PR в `master` по явному запросу

## Важные примечания

- Skills перенесены из `C:\Users\Art\Documents\GitHub\vps_artpol\.claude\skills`, но адаптированы под текущий проект.
- Если в source-skills встречались старые product-specific кейсы, здесь они трактуются как шаблоны проверки flow-рисков, а не как literal contract текущего продукта.
- Для текущего проекта главное: существующий SMUI visual language, responsive `<=1024 / <=768 / <=480`, и server-side работа с Gigma без утечки токена в браузер.
