# Claude Code: сценарии для multi-monitor_calculator

> Для Claude Code используй skills из [`.claude/skills/`](../skills/). Здесь — человекочитаемое зеркало сценариев и ролей.

Набор перенесён из `vps_artpol`, но адаптирован под текущий репозиторий: SvelteKit, SMUI, legacy monitor UI и новый repair estimate flow.

## Состав

| Агент | Когда | Что делает |
| --- | --- | --- |
| [`frontend-planner`](./frontend-planner.md) | Перед задачей | План без кода, файлы, риски, DoD |
| [`data-load-reviewer`](./data-load-reviewer.md) | После правок data flow | Ревью `load`, server routes, local API bridge |
| [`affordance-reviewer`](./affordance-reviewer.md) | Формы, split секций, сложный UI | Проверка affordance и form-save scope |
| [`flow-debug-checklist`](./flow-debug-checklist.md) | Перед PR на multistep flow | Проверка реального пользовательского пути |
| [`frontend-safety-check`](./frontend-safety-check.md) | Перед любым frontend PR | Контракт, состояния, payload safety, reuse UI |
| [`history-and-pr-finalizer`](./history-and-pr-finalizer.md) | В конце ветки | Checks, docs, commit/push/PR в `master` |

## Типовой flow

```text
1. /frontend-plan
2. реализация
3. /data-load-review           если трогали data flow или server-side bridge
4. /affordance-review          если трогали формы / секции / сложное взаимодействие
5. /flow-debug-checklist       если есть multistep flow, redirect, post-submit navigation
6. /frontend-safety-check      перед любым PR
7. /pr-finalize                checks, docs, PR в master
```

## Важные оговорки

- Base branch: `master`.
- В репозитории нет обязательного `history.md`; вместо этого обновляй `docs/` и `README.md`, когда меняется логика или setup.
- Если в импортированных skill-примерах встречаются auth/onboarding/specialization-сценарии, для этого проекта это просто примеры flow-рисков, а не literal product contract.
