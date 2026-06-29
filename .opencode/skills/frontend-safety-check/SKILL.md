---
name: frontend-safety-check
description: Use before any frontend PR, especially new pages, forms, local endpoint changes, payload changes, or redirects after mutation. Checks backend contract, UI states, payload safety, and component reuse.
---

# Frontend Safety Check

Run this before opening any frontend PR.

Main formula:

```text
First check code and contract.
Then build UI.
Then break your own scenario like a reviewer.
Only then open the PR.
```

Checklist:

1. Routes, pages, and components: inspect existing `src/routes` and `src/lib/components`; do not duplicate screens or widgets.
2. Data layer: inspect existing `load` functions, local `src/routes/api`, and `src/lib/server`; reuse the existing server-side bridge.
3. Backend contract: verify endpoint response shapes where possible, including required, optional, nullable, and omitted fields.
4. Loading state: no blank screen while data is pending.
5. Empty state: empty data or `exists: false` is handled as normal, not as an error.
6. Error state: network, 5xx, and malformed JSON have visible handling.
7. 401/403/422: unified auth path, clear no-permission state, field errors via `fail(422, ...)` when applicable.
8. New user: no-data state after registration/onboarding is explicit.
9. Returning user: existing data is prefilled and not lost.
10. Payload safety: omitted fields are not sent as `null`; `0`, `false`, `""`, `[]`, and `{}` are handled intentionally.

Payload safety rules:

- Field unchanged -> do not send it, or send the original intentionally.
- Field cleared by the user -> send `null` or empty string intentionally.
- Field temporarily not loaded -> do not send it as `null`.
- Do not filter out valid falsy values such as `0` or `false`.

Repo-aware UI:

- For repair estimate flow, keep Gigma token usage and technical mapping on the server side.
- Do not surface backend ids or technical terms in user-facing UI.
- Keep new UI inside the current SMUI/theme visual language instead of transplanting an external redesign literally.

Self-review block for PRs:

```markdown
## Frontend safety check

- [ ] Checked backend endpoint and response shape
- [ ] Checked loading / empty / error states
- [ ] Checked 401 / 403 / 422
- [ ] Checked new user after registration
- [ ] Checked returning user with existing data
- [ ] Checked form payload does not wipe omitted fields
- [ ] Checked null / undefined / 0 / false / "" / [] / {}
- [ ] Checked responsive at 1024 / 768 / 480
- [ ] Reused existing components and visual patterns
```

If any item is not checked, state why.
