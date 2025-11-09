# Planning Workspace

Product planning assets live under this directory so agents can move seamlessly
from ideation to delivery. The work item source of truth now lives on the
GitHub Projects Kanban board **aventuria-impromptu**
(`https://github.com/users/thomaslazar/projects/2`). Pair this overview with
`PLAYBOOK.md` for detailed workflows and GitHub CLI instructions.

## Directory Map
- `intake/`: Specs, assets, raw notes, and outstanding questions gathered from stakeholders.
- `runs/`: Timestamped planning sessions capturing grooming notes and draft artefacts (folders named `YYYY-MM-DDTHH-mm-ss-<slug>`).
- `templates/`: Canonical markdown templates for specs and stories; optional plan formats remain for maintainer use.
- `work-items/`: Legacy file-based backlog kept only for historical context. New items must be tracked on the GitHub Kanban board.
- `outputs/plans/`: Optional maintainer summaries; agents generally rely on the work-item pipeline instead of formal release plans.

## Canonical Kanban Board
- **Location:** `https://github.com/users/thomaslazar/projects/2`
- **Columns:** Backlog → Ready → In progress → In review → Done
- **Authentication:** Run `gh auth login` or export `GH_TOKEN`/`GITHUB_TOKEN` once in your shell profile (e.g. `~/.bash_profile`) so every command inherits it. Codex automatically exposes `GITHUB_MCP_PAT` if you need a token value.
- **Quick actions:**
  - List items: `gh project item-list 2 --owner thomaslazar --format json`
  - Create draft item: `gh project item-create 2 --owner thomaslazar --title "Story title" --body "$(cat path/to/story.md)"`
  - Move item: `gh project item-edit --id <item-id> --project-id PVT_kwHOAAizhM4BHrU0 --field-id PVTSSF_lAHOAAizhM4BHrU0zg4XGK4 --single-select-option-id <status-option-id>`
  - Delete item: `gh project item-delete 2 --owner thomaslazar --id <item-id>`

Status option IDs (needed for moves) are documented in `PLAYBOOK.md`.

## Suggested Flow
1. Capture briefs in `intake/` using the provided templates.
2. During a planning run, work inside `runs/YYYY-MM-DDTHH-mm-ss-<slug>/`.
3. Once a story is vetted, publish it as a draft item on the GitHub Kanban board (include links back to the originating spec/run folder).
4. Progress items by updating the board Status field according to `PLAYBOOK.md`; maintainers alone move work into the `Ready` column.
5. (Optional) If the maintainer wants an overview, publish a note under `outputs/plans/` and link back to the originating run and board item IDs.

This structure separates intake, active planning, lifecycle tracking, and final
outputs so multiple agents can collaborate without stepping on each other’s work.
