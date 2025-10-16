# Project Planning Agent Workspace

This area lets product owners drop specs while agents turn them into Scrum-ready artifacts.

## Workflow
- **Intake:** Place each new requirement under `intake/specs/` using `templates/spec.md`. Open questions belong in `intake/questions/` so clarifications stay near the source.
- **Run:** When an agent processes a spec, create a timestamped folder in `runs/` (format `YYYYMMDD-<slug>`). Capture the working notes plus generated stories, acceptance criteria, and plans inside that folder using the supplied templates.
- **Publish:** Once wording stabilises, copy refined user stories into `outputs/backlog/` and planning material (release or sprint) into `outputs/plans/`. Keep these files organized by spec or sprint id for quick lookup.
- **Update templates:** If you refine formats, adjust the matching file in `templates/` so the next run inherits the improvement. Note the change in the run summary.

## Naming
- Specs: `intake/specs/<product>-<topic>.md`
- Runs: `runs/YYYYMMDD-<product>-<topic>/...`
- Stories: `outputs/backlog/<product>-<topic>-story-<n>.md`
- Plans: `outputs/plans/<sprint-or-release-id>.md`

This structure keeps intake, active work, and published artefacts separate so multiple agents can collaborate without overwriting each other.
