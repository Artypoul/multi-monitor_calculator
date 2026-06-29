---
name: frontend-safety-check
description: Зеркало skill'а frontend-safety-check для чтения вне Claude Code. Источник — `.claude/skills/frontend-safety-check/SKILL.md`.
---

# frontend-safety-check

Зеркало skill'а [`/frontend-safety-check`](../skills/frontend-safety-check/SKILL.md). Полный чек-лист — в источнике.

## Краткая выжимка

Применять перед **любым** frontend PR. Принципы — из серии нарушений в React-предшественнике (gigma-new); механика здесь SvelteKit.

### Главная формула

```
Сначала проверяем код и контракт.
Потом делаем UI.
Потом ломаем свой сценарий как ревьюер.
Только потом открываем PR.
```

### 10 пунктов чек-листа

1. Routes / pages / components — что уже есть, не плодить дубликаты
2. Слой данных (`load` / `src/lib/api`) — какие endpoint'ы подключены
3. Backend contract — `curl`'ом, **не на доверии**
4. Loading state
5. Empty state (включая `exists: false` — не ошибка!)
6. Error state (network, 5xx) → `+error.svelte` / inline
7. 401 / 403 / 422 — каждый по-своему
8. Новый пользователь после регистрации
9. Пользователь с заполненными данными
10. Payload не затирает omitted-поля

### Payload safety

Различать `undefined` (не трогаем) vs `null` (явная очистка) vs `""` (черновик?). Особенно `0` и `false` — валидные значения, **нельзя терять** при фильтрации falsy.

### Specialization-aware UI

Активная специализация (коды `AGENCY` / `CONTRACTOR` / `VENUE` / `ARTIST` / `PRIVATE_ORGANIZER`, см. `src/lib/types/index.ts`; `MUSICIAN` не существует, «музыкант» = `ARTIST`) влияет на меню, профиль, title, quick actions. Источник — серверная сессия (`active_specialization_id`), не хардкод по месту. Канон — `specialization`, не `participant_type`.

### Frontend safety check в self-review

После `gh pr create` отдельным комментарием в PR публиковать checklist из 9 чекбоксов (см. полный skill). Каждый — либо ✓ либо «не делал, потому что X».

Меняй вместе с `.claude/skills/frontend-safety-check/SKILL.md` в одном PR.
