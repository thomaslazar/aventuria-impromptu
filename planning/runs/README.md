# Runs

Each folder captures a single execution where an agent turns a spec into planning artefacts.

## Folder name
Use `YYYY-MM-DDTHH-mm-ss-<product>-<topic>` so runs stay chronological and unique. Example: `2025-02-18T14-30-00-tabletop-upgrade`.

## Expected files
- `summary.md`: context, assumptions, risks, and follow-up suggestions.
- Story files: generated epics/user stories with acceptance criteria (name them to match the eventual work items).
- Optional supporting notes (e.g. `questions.md`, spike notes, exploratory analysis).

Agents may add diagrams or spreadsheets as needed. Once the polished artefacts
are captured as items on the GitHub Kanban board (and optional maintainer
summaries into `outputs/plans/`), the run folder serves as historical context
only. Reference the project item URL/ID inside `summary.md` so downstream agents
can trace decisions quickly.
