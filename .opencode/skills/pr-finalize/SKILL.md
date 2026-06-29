---
name: pr-finalize
description: Use when code is ready and the user asks to finalize a PR. Updates `history.md`, runs checks, commits/pushes/creates a PR to `master`, and never merges without explicit approval.
---

# PR Finalize

Use only when the user asks to finalize a PR or prepare the branch for PR.

Rules:

- PR base is always `master` unless the user explicitly says otherwise.
- Do not merge without explicit approval.
- Do not force-push `main` or `master`.
- Do not amend published commits unless explicitly requested.
- If a PR for the branch already exists, return that URL instead of creating a duplicate.

Pre-flight:

- Inspect `git status`, `git diff`, and `git log --oneline -10` before committing.
- Run `git diff --check`.
- Run `npm run check` for Svelte/TypeScript.
- Run `npm run lint`.
- Run `npm run test`.
- Run `npm run test:e2e` only if relevant or requested.
- If checks fail, stop and report the log unless the user explicitly accepts the failure.

History:

- Update the top of `history.md` after meaningful work.
- Include last update date, TL;DR when needed, and PR table row for PR releases.

Commit and PR:

- Match recent repository commit-message style.
- Stage only intended files.
- Push the current branch when requested.
- Create PR with base `master` and body sections `## Summary` and `## Test plan`.
- Include responsive checks for UI changes: `<=1024`, `<=768`, `<=480`.

After PR creation:

- Return the PR URL.
- If GitHub MCP subscription is available, subscribe to PR activity.
- Do not wait for async Codex feedback on the same PR.
- Before the next task, retro-check the previous merged PR in reviews, review comments, and comments.

Deployment note:

- If `Dockerfile`, build settings, or adapter-netlify config changed, remind the user to verify `npm run build` locally and deploy to Netlify through their normal process.
