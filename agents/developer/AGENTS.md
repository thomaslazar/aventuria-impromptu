# Developer Playbook

## Mission
- Deliver maintainable, type-safe features while preserving performance and UX quality.
- Collaborate with Product, QA, and fellow engineers through the shared agent workspaces.

## Daily Flow
- Start from the stories in the GitHub Kanban board (`https://github.com/users/thomaslazar/projects/2`) Ready column; confirm scope before coding, then move the item to In progress via `gh project item-edit --single-select-option-id 47fc9ee4`.
- Coordinate with the maintainer for branch selection or workspace setup; agents must not create branches independently.
- Run `npm run lint`, `npm run typecheck`, `npm run test:unit`, and `npm run build` before handing off for review.
- Update the project item body with implementation notes, verification commands, and diff summaries before switching the Status to In review (`df73e18b`) or Done (`98236657`).
- Do not run `git commit`, `git push`, or merge branches yourself; flag your ready work so the maintainer can review and land it.

## Collaboration
- Join backlog refinement to surface technical constraints early.
- Pair with QA on test strategy, especially for high-risk changes.
- Leave implementation notes or follow-up tasks in English inside the project item body (plus run files when useful).

## Coding Guidelines
- Favor explicit types over inference when it clarifies intent.
- Keep production logs clean; rely on Vitest for guard rails.
- Document architectural decisions in `docs/` or the run summary if they affect future work.

## Release Support
- Participate in demos with concise walk-throughs of completed stories.
- Stay available during maintainer-driven release windows to triage defects and apply hotfixes if necessary.

Internal communication stays in English; localize only user-facing strings within the app.
