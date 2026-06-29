---
name: flow-debug-checklist
description: Use before PRs touching auth, sign-in, sign-up, onboarding, checkout, route guards, token restore, redirects after form actions, or `goto()`. Checks real user flow against test setup.
---

# Flow Debug Checklist

Use before opening a PR for flow-sensitive work.

Triggers include changes in `hooks.server.ts`, `+layout.server.ts`, route guards, token restore, redirects after `use:enhance` or form actions, and any post-mutation `goto(...)`.

Checklist:

1. API contract table

- Verify endpoint shape with curl when credentials are available; do not rely on emails or memory.
- Compare unauthenticated, new-user, and returning-user cases.
- Record guaranteed, optional, nullable, and omitted fields.

2. Real flow vs test setup

- Real user path: already on site -> form submit with `use:enhance` -> server action -> redirect/goto -> client-side navigation and server load fetch.
- Test path: direct URL or reload -> full SSR with hooks and server load from scratch.
- Passing one path does not prove the other path.

3. Pattern symmetry grep

- Search related redirects, invalidation calls, and `locals.user`/`locals.session` usage.
- If a new pattern is needed in multiple places, apply it consistently.

4. Failure modes

- 200 without an expected field.
- 401 on private and public endpoints.
- 403 for unauthorized owner/admin cases.
- 422 field errors from form actions.
- Network failure, 5xx, malformed JSON.

5. Sequence check

- What runs in `hooks.server.ts` on each request?
- Which loads are server-only and which are universal?
- What is invalidated after mutation?
- Is navigation client-side or full reload?

Stop phrases to challenge immediately:

- “Works like X” -> open X and compare exactly.
- “Smoke passed” -> verify smoke matched the real flow.
- “Backend guarantees it” -> verify the contract.
- “Layout.server catches it” -> verify target route and load rerun.
- “After mutation it updates” -> verify `invalidate` or returned fresh data.

Output a concise risk report and mark any unverified assumptions.
