# Planning Workflow Playbook

All agents now coordinate work through the GitHub Projects Kanban board
**aventuria-impromptu** (`https://github.com/users/thomaslazar/projects/2`,
Project ID `PVT_kwHOAAizhM4BHrU0`). File-based folders in `planning/work-items/`
are retained only as historical artefacts.

## Board States and Owners

| Status (Project column) | Primary Owner | Entry Criteria | Exit Criteria |
| --- | --- | --- | --- |
| Backlog | Product Owner + Planning Agent | Story groomed, acceptance criteria agreed, dependencies noted. | Await maintainer scheduling; no agent moves items forward. |
| Ready | Maintainer (human) | Maintainer selects a backlog item for the next development cycle and confirms prerequisites. | Developer agent pulls the item when work begins. |
| In progress | Developer | Maintainer-provided branch or workspace in place; implementation underway. | Local lint/typecheck/test/build complete and change summary recorded for review. |
| In review | Code Review Agent | Developer supplied local diff summary and verification notes. | Findings recorded; on approval the reviewer or maintainer signals readiness for QA, otherwise return to In progress. |
| Done | QA Agent + Maintainer | Acceptance criteria satisfied, QA evidence logged, maintainer confirms merge/readiness. | Only move out if regression discovered (return to In progress). |

Status field metadata (needed for `gh project item-edit`):

| Status | Option ID |
| --- | --- |
| Backlog | `f75ad846` |
| Ready | `61e4505c` |
| In progress | `47fc9ee4` |
| In review | `df73e18b` |
| Done | `98236657` |

Project field ID for Status: `PVTSSF_lAHOAAizhM4BHrU0zg4XGK4`.

## Transition Responsibilities

1. **Intake → Backlog (Grooming)**
   - Planning or product owner agent drafts the story using `planning/templates/story.md`.
   - Create a draft item via `gh project item-create 2 --owner thomaslazar --title "<story>" --body "$(cat draft.md)"`.
   - Capture decisions and remaining risks directly in the item body; leave it in Backlog until blockers are cleared.

2. **Backlog → Ready (Maintainer Selection)**
   - Maintainer moves vetted items by updating the Status option to `61e4505c`.
   - Note any branch names or local workspace instructions in the item body or comments.

3. **Ready → In progress (Kickoff)**
   - Developer documents ownership in the item (comment or body update) before changing Status to `47fc9ee4`.
   - Keep acceptance criteria and scope synchronized with implementation notes.

4. **In progress → In review (Handoff)**
   - Developer ensures `npm run lint && npm run typecheck && npm run test:unit && npm run build` pass locally.
   - Update the item body with a diff summary plus verification commands, then set Status to `df73e18b`.
   - Reviewers return actionable feedback by commenting and, if needed, switching Status back to In progress.

5. **In review → Done (Approval + QA)**
   - Reviewer records findings; on approval, QA executes the documented checks.
   - QA adds evidence (logs, commands, screenshots) and moves the Status to `98236657`.
   - Regressions move the item back to In progress with explicit defects.

## General Guidance

- Store each work item as Markdown content inside the project item body; attach links to specs, runs, or assets within the repository.
- Use ISO 8601 timestamps (`YYYY-MM-DDTHH-mm-ss`) for run folders and reference them from the project item.
- Update cross-links and verification notes directly inside the GitHub project item whenever the status changes.
- Keep supporting artefacts (specs, questions, run logs) under `planning/intake/` and `planning/runs/`; link to them rather than duplicating content.

## GitHub CLI Reference

```bash
# Authenticate (one-time)
gh auth login   # or export GH_TOKEN/GITHUB_TOKEN (Codex exposes GITHUB_MCP_PAT)

# List items on the board
GH_TOKEN=$GITHUB_MCP_PAT gh project item-list 2 --owner thomaslazar --format json

# Create a draft item from a local story file
GH_TOKEN=$GITHUB_MCP_PAT gh project item-create 2 --owner thomaslazar \
  --title "Story: Optolith cache UI" \
  --body "$(cat planning/templates/story.md)"

# Move an item to a new status
GH_TOKEN=$GITHUB_MCP_PAT gh project item-edit \
  --id <item-id> \
  --project-id PVT_kwHOAAizhM4BHrU0 \
  --field-id PVTSSF_lAHOAAizhM4BHrU0zg4XGK4 \
  --single-select-option-id 47fc9ee4   # In progress

# Delete an obsolete draft item
GH_TOKEN=$GITHUB_MCP_PAT gh project item-delete --id <item-id>
```

Use `gh project item-edit --field-id <Priority/Size field>` to manage optional sizing data (see `gh project field-list 2 --owner thomaslazar --format json` for IDs).

Following this playbook ensures every agent understands the current status of planning artefacts and how to progress them responsibly.
