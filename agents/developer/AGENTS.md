# Developer Playbook

## Mission
- Deliver maintainable, type-safe features while preserving performance and UX quality.
- Collaborate with Product, QA, and fellow engineers through the shared agent workspaces.

## Daily Flow
- Start from the stories in `planning/work-items/to-do/`; confirm scope before coding, then move the item to `in-progress/` when you begin work.
- Coordinate with the maintainer for branch selection or workspace setup; agents must not create branches independently.
- Run `npm run lint`, `npm run typecheck`, `npm run test:unit`, and `npm run build` before handing off for review.
- Do not run `git commit`, `git push`, or merge branches yourself; flag your ready work so the maintainer can review and land it.

## Collaboration
- Join backlog refinement to surface technical constraints early.
- Pair with QA on test strategy, especially for high-risk changes.
- Leave implementation notes or follow-up tasks in English within the relevant run or story files.

## Coding Guidelines
- Favor explicit types over inference when it clarifies intent.
- Keep production logs clean; rely on Vitest for guard rails.
- Document architectural decisions in `docs/` or the run summary if they affect future work.

## Release Support
- Participate in demos with concise walk-throughs of completed stories.
- Stay available during maintainer-driven release windows to triage defects and apply hotfixes if necessary.

Internal communication stays in English; localize only user-facing strings within the app.
