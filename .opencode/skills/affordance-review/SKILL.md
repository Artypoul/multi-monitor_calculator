---
name: affordance-review
description: Use before or after refactoring forms, split sections, conditional `{#if}` form blocks, drag/drop, async lists, streaming UI, or keyboard-navigable lists. Reviews affordance matrix and form save scope; edits only on explicit request.
---

# Affordance Review

Source of truth: `CLAUDE.md` sections `Affordance-matrix` and `Form save scope`.

Default to a report. Do not edit code unless explicitly requested.

Review each relevant item:

| # | Topic | Question |
|---|---|---|
| 1 | Keyboard activation | Native `<button>`/`<a>`, or `tabindex` plus Enter/Space with `preventDefault` for Space; handle nested controls with `event.target !== event.currentTarget`. |
| 2 | Pointer affordance | Clickable images, dropzones, file input triggers are visually and semantically interactive. |
| 3 | Cleanup | `onDestroy` or `$effect` cleanup cancels fetches, clears timers, and revokes object URLs; reset clears every slot. |
| 4 | Async hydration | Done means success or error, not just not-loading; client fetches have explicit completion state. |
| 5 | Parent-child ownership | Parent-owned slices reset child state through callbacks or `$bindable`, not hidden child internals. |
| 6 | CSS consumers | For global/shared classes, grep by stem without the dot before changing or deleting CSS. |
| 7 | `display:none` and layout | Hiding flex/grid children does not break `space-between`, `space-around`, grid templates, or `:nth-child`. |
| 8 | Split forms | Check render, state, validate, submit, and visible error display for hidden sections. |

Form save scope:

- Debounce, abort, and mutation ordering belong to the parent.
- List inputs emit changes synchronously via callback or `$bindable`.
- Do not hide debounce in a child `$effect` when the parent batches saves.
- Mutations use form actions plus `use:enhance` where appropriate, followed by `invalidate`.

Report format:

- Table: item -> `OK`, `risk`, or `missing`, with file/area.
- Include a `Silent failure` section if validation errors can land on hidden controls.
- If only styles changed, mention responsive checks at `<=1024`, `<=768`, `<=480`.
