# Runs

Each folder captures a single execution where an agent turns a spec into planning artefacts.

## Folder name
Use `YYYYMMDD-<product>-<topic>` so runs sort chronologically. Example: `20250218-tabletop-upgrade`.

## Expected files
- `summary.md`: context, assumptions, risks, and follow-up suggestions.
- `stories.md`: generated epics/user stories with acceptance criteria.
- `plan.md`: sprint or release breakdown, milestones, and estimates.
- `questions.md` (optional): unresolved clarifications moved back to `intake/questions/`.

Agents may add supporting docs (mind maps, diagrams) as needed. Everything in a run is disposable once the polished artefacts land under `outputs/`.
