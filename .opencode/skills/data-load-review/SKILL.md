---
name: data-load-review
description: Use after changes to `src/routes/api`, `src/lib/server`, `+page.ts`, `+page.server.ts`, form actions, caching, or invalidation. Reviews data loading and mutation risks; edits only on explicit request.
---

# Data Load Review

Default to a report. Do not edit code unless the user explicitly asks to fix issues.

Check:

- `src/lib/server/*` and local `src/routes/api/*` handlers: secrets stay server-side, non-2xx handling is consistent, and no private env or technical ids leak to the browser.
- `load` functions: server vs universal choice, use the provided `fetch`, no global fetch in `load`, `depends` where targeted invalidation is needed, real errors via `error(status, ...)` instead of silent empty data.
- Mutations: use form actions plus `use:enhance` where appropriate, refresh with `invalidate`/`invalidateAll` or returned fresh data, parent-owned sequencing/cancellation for ordered requests.
- Types: flag `any`/`as any` on API responses, dishonest optional/nullable/omitted fields, and unsafe form action payloads.
- Auth/security: secrets and cookies stay server-side; public endpoints do not accidentally trigger private 401 redirects.

Report format:

- Findings first, ordered as P0/P1/P2.
- Include `file:line` references where possible.
- Give a one-sentence fix for each finding.
- If no findings, say so and list residual risks or unchecked areas.

Do not approve client-only fetch mutations when a SvelteKit form action is the correct project pattern.
