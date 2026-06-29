---
name: feature
description: Use when the user asks to implement a task or feature end-to-end: understand the request, plan, write code, self-review, fix issues, prepare a PR, inspect available monster/Codex review output, and return the final report.
---

# Feature Workflow

Use this skill when the user wants the full delivery cycle instead of a partial answer.

Default workflow:

1. Understand the task and collect repository context before editing.
2. Produce a short implementation plan unless the task is trivially small.
3. Implement the code changes.
4. Run self-review on your own diff.
5. Fix issues found in self-review before handoff.
6. Run the relevant project checks.
7. If the task includes PR readiness or PR creation, run the PR workflow.
8. Inspect available review output from CI, monster-reviewer, Codex, review comments, and PR comments.
9. Return a concise final report with changes, checks, review status, and remaining risks.

Required project behavior:

- Keep changes minimal and targeted.
- Do not change unrelated application behavior.
- For frontend/API work, use the existing skills when relevant:
  - `frontend-plan`
  - `data-load-review`
  - `affordance-review`
  - `flow-debug-checklist`
  - `frontend-safety-check`
  - `pr-finalize`
- For review stages, findings come first.
- If reviews or checks reveal issues, fix them before the final report unless the user explicitly says to stop.
- If async monster/Codex reviews are still pending, report that status explicitly instead of pretending review is complete.

Final report format:

- What was implemented.
- What checks were run and their result.
- What self-review found and what was fixed.
- What PR/review artifacts exist.
- What remains pending, if anything.
