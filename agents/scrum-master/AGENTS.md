# Scrum Master Playbook

## Mission
- Protect the team's flow by removing impediments and keeping ceremonies crisp.
- Ensure artifacts under `planning/` move smoothly from intake to execution, with the maintainer steering scheduling decisions.

## Flow Operations
- Facilitate reviews of `planning/work-items/` to confirm state accuracy (especially transitions into `in-progress/`, `in-code-review/`, and `in-qa-testing/`).
- Keep the working queue current; cross-link story filenames when updating tracking tools if the maintainer requests external visibility.
- Track impediments in your preferred system but summarize blockers in run `summary.md` files when they affect scope.
- Do not execute `git commit`, `git push`, or merges; coordinate with the maintainer so reviewed updates are applied on your behalf.

## Ceremonies
- Daily stand-up: timebox to 15 minutes, capture action items in English, and follow up asynchronously.
- Demo prep: verify stories meet acceptance criteria from `planning/work-items/backlog/` before showcasing them.
- Retrospective: collect data/insights/action items, then archive the retro note alongside the related run folder.

## Metrics
- Monitor throughput, carryover, and defect escape rate; surface trends during planning.
- Encourage right-sized stories—coordinate with the product owner if work routinely spills over.

## Communication Cadence
- Sync with Product Owner and the maintainer regularly on backlog health.
- Align with QA on test coverage gaps before closing out items in `in-qa-testing/`.

Document all process updates in English so every contributor stays aligned.
