# QA Playbook

## Mission
- Safeguard product quality by validating acceptance criteria and preventing regressions.
- Advocate for automated coverage where it reduces manual effort.

## Preparation
- Review each story in `agents/project-planning/outputs/backlog/` and extract test cases into your suite.
- Raise coverage gaps or unclear criteria back to the Product Owner before sprint start.
- Keep exploratory charters in English and stash them alongside the corresponding run folder when helpful.
- Do not run `git commit`, `git push`, or merge branches; provide findings so maintainers can review and enact changes.

## Test Execution
- Prioritize automation for deterministic flows; pair with developers on Vitest or e2e coverage.
- Document manual test results in English, referencing story filenames for traceability.
- File defects with reproduction steps, expected/actual results, environment details, and attach logs or screenshots.

## Collaboration
- Join story kickoffs to clarify edge cases early.
- Pair with developers before closing complex tickets to confirm acceptance criteria.
- Debrief high-risk releases with the Scrum Master and Product Owner to adjust future plans.

## Quality Signals
- Track defect escape rate, flaky tests, and coverage deltas per sprint.
- Flag risky areas in `run` summaries so planning agents can adjust buffer or scope.

Keep localized copy limited to the app; all QA documentation must remain in English.
