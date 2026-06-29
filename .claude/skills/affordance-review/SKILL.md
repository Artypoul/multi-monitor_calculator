---
name: affordance-review
description: Чеклист affordance-matrix и form save scope из CLAUDE.md перед/после рефакторинга форм, split секций, списков, стриминга. Отчёт P0–P2; правки только по запросу.
when_to_use: условные секции формы ({#if}), drag-drop, async-списки, streaming LLM, списки с клавиатурной навигацией
disable-model-invocation: true
allowed-tools: Read Glob Grep
---

# Affordance + формы (repair calculator, SvelteKit)

Источник: **`CLAUDE.md`** — разделы **Affordance-matrix** и **Form save scope**.

## Матрица (отметь каждый релевантный пункт)

| # | Тема | Вопрос |
|---|------|--------|
| 1 | Клавиатура | Нативные `<button>` / `<a>` или `tabindex` + `onkeydown` Enter/Space, `event.preventDefault()` для Space, `e.target !== e.currentTarget` при вложенных контролах |
| 2 | Pointer | Кликабельные зоны, dropzone, триггер file input — не только декоративная картинка |
| 3 | Очистка состояния | `onDestroy` / возврат из `$effect`: `AbortController`, таймеры, `URL.revokeObjectURL`; reset очищает все слоты |
| 4 | Async-гидратация | «готово» = успех или ошибка (не «просто не loading»); в `load` рендер после settle, на клиенте — явный флаг готовности (`ok` / `err`) |
| 5 | Родитель ↔ ребёнок | Сегмент/вкладка у родителя — сброс дочерней формы через колбэк-проп или `$bindable`, не внутренним стейтом ребёнка |
| 6 | Потребители CSS | Scoped по умолчанию; для общих/`:global` — grep по стему без точки (ловит и селектор, и `class` / `class:`) |
| 7 | `display: none` + flex | Один видимый child + `space-between` — не уезжает ли к краю → `margin: auto` / `center`; проверить `grid-template-*`, `:nth-child` |
| 8 | Split формы по секциям | Пять подконтрактов: render (`{#if}`) / state (`$state` хранит значение) / validate (скоуп на видимую) / submit (без `value!.id` для скрытых) / **видимая** ошибка для скрытых полей |

## Form save scope

- Debounce / abort / порядок мутаций — **у родителя**.
- Лист: синхронный `onChange`-колбэк (или `$bindable`) в тот же тик; **не** `$effect` + debounce внутри листа при batch-save родителя.
- Мутации через **form actions** + `use:enhance`; после успеха — `invalidate`. Параллельные запросы не сливаются сами — явная отмена/последовательность у родителя.

## Формат отчёта

- Таблица: пункт → **OK / риск / пропущено** + файл/область.
- Отдельный блок **«Silent failure»**, если ошибка валидации может остаться на скрытом поле.
- Если трогали **только** стили — напомни про responsive **≤1024 / ≤768 / ≤480**.

## Запреты

- Не одобрять `value!.id` для полей, которые могут быть скрыты `{#if}`.
- Не пропускать streaming/async без пункта про abort на `onDestroy` / смену источника.
