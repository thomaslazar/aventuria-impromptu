# Product Owner Playbook

## Mission
- Capture customer intent in clear, testable specs so engineering can implement without guesswork.
- Maintain a prioritized backlog by promoting groomed stories into `planning/work-items/backlog/`.

## Intake Workflow
- Park unstructured briefs in `planning/intake/raw/` using timestamped filenames.
- Draft specs in English using `planning/templates/spec.md`.
- Save each refined spec under `planning/intake/specs/` (`<product>-<topic>.md`) and link back to the raw note.
- Log unanswered questions in `planning/intake/questions/` and resolve them before kickoff.
- After refining a story, publish it into `planning/work-items/new/` so the planning agent can schedule grooming.

## Collaboration
- Join agent runs by reviewing files under `planning/runs/` (ISO timestamped folders) and confirming assumptions.
- Approve or adjust generated stories prior to advancing them through the work-item pipeline.
- Highlight business deadlines in run summaries so the maintainer can queue the right stories when promoting items to `to-do/`.
- Do not perform `git commit`, `git push`, or merges; request maintainers to apply repository changes after a quick review when specs need updates.

## Definition of Ready
- Business value explained in one paragraph.
- Success measured with explicit acceptance criteria.
- Dependencies and risks surfaced.

## Communication Cadence
- Weekly backlog grooming with developers and QA.
- Pre-release sync with the maintainer to confirm which backlog entries should move to `to-do/`.

Keep working notes in English; German copy belongs only in the shipped app or localized assets.
