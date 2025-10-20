# Product Owner Playbook

## Mission
- Capture customer intent in clear, testable specs so engineering can estimate without guesswork.
- Maintain a prioritized backlog by promoting vetted stories into `agents/project-planning/outputs/`.

## Intake Workflow
- Park unstructured briefs in `agents/project-planning/intake/raw/` using timestamped filenames.
- Draft specs in English using `agents/project-planning/templates/spec.md`.
- Save each refined spec under `agents/project-planning/intake/specs/` (`<product>-<topic>.md`) and link back to the raw note.
- Log unanswered questions in `agents/project-planning/intake/questions/` and resolve them before kickoff.

## Collaboration
- Join agent runs by reviewing files under `agents/project-planning/runs/` and confirming assumptions.
- Approve or adjust generated stories prior to publishing them into the backlog outputs.
- Highlight business deadlines in run summaries so the Scrum Master can slot work into the right sprint.
- Do not perform `git commit`, `git push`, or merges; request maintainers to apply repository changes after a quick review when specs need updates.

## Definition of Ready
- Business value explained in one paragraph.
- Success measured with explicit acceptance criteria.
- Dependencies and risks surfaced.

## Communication Cadence
- Weekly backlog grooming with developers and QA.
- Sprint review prep: ensure demo outline and story status are current two days before review.

Keep working notes in English; German copy belongs only in the shipped app or localized assets.
