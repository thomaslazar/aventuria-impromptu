# Planning Workflow Playbook

All agents use this playbook to coordinate work items stored under
`planning/work-items/`.

## States and Owners

| State | Primary Owner | Entry Criteria | Exit Criteria |
| --- | --- | --- | --- |
| `new/` | Product Owner | Idea captured using story template; open questions documented. | Grooming session scheduled and completed. |
| `backlog/` | Product Owner + Planning Agent | Story groomed, acceptance criteria agreed, dependencies noted. | Await maintainer scheduling; no agent moves items forward. |
| `to-do/` | Maintainer (human) | Maintainer selects a backlog item for the next development cycle and confirms prerequisites. | Developer agent moves the item to `in-progress/` when work begins. |
| `in-progress/` | Developer | Maintainer-provided branch or workspace in place; implementation underway. | Local lint/typecheck/test/build complete and change summary recorded for review. |
| `in-code-review/` | Code Review Agent | Developer supplied local diff summary and verification notes. | Findings recorded; on approval the reviewer or maintainer signals readiness for QA, otherwise return to `in-progress/`. |
| `in-qa-testing/` | QA Agent | Code review accepted; QA instructions and build steps documented. | QA passes and evidence logged (move to `done/`) or defects logged and item returned to `in-progress/`. |
| `done/` | Maintainer or QA | Acceptance criteria satisfied, QA complete, maintainer confirms merge/readiness. | Only move out if regression discovered (return to `in-progress/`). |

## Transition Responsibilities

1. **`new/` → `backlog/` (Grooming)**
   - Planning or product owner agent leads the session.
   - Capture decisions and remaining risks directly in the item; skip story points/estimates.
   - Document unresolved actions; leave the item in `new/` if blockers remain.

2. **`backlog/` → `to-do/` (Maintainer Selection)**
   - Maintainer chooses which vetted items should run next and moves them manually.
   - Note any branch names or local workspace instructions in the item.
   - Notify the developer agent once the item is in `to-do/`.

3. **`to-do/` → `in-progress/` (Kickoff)**
   - Developer claims ownership inside the story.
   - Reference the maintainer-supplied branch or confirm the local workspace being used; agents must not create branches.
   - Keep acceptance criteria up to date as implementation details emerge.

4. **`in-progress/` → `in-code-review/` (Handoff)**
   - Developer ensures local lint/typecheck/test/build commands pass.
   - Provide a concise local diff summary, verification notes, and outstanding concerns in the story.
   - If review returns actionable feedback, reviewer moves the item back to `in-progress/` with comments.

5. **`in-code-review/` → `in-qa-testing/` (Approval)**
   - Reviewer documents approval and highlights any follow-up for the maintainer (e.g. rebase, additional manual checks).
   - Developer or reviewer notes build artefacts or environment instructions for QA; no GitHub PRs are involved.

6. **`in-qa-testing/` → `done/` (Validation)**
   - QA agent executes documented scenarios, recording results within the story.
   - Failures push the item back to `in-progress/` with findings listed.
   - On pass, QA moves the item to `done/` and references the executed checklist; maintainer handles any merge or release actions.

## General Guidance

- Store each work item as a Markdown file or folder containing story context, acceptance criteria, and links to specs or runs.
- Use ISO 8601 timestamps with time (`YYYY-MM-DDTHH-mm-ss`) in run folder names and generated artefacts to avoid overwriting earlier sessions.
- When moving items, prefer `git mv` or equivalent so history follows the file.
- Update cross-links inside the item (e.g. local diff summaries, test evidence) when state changes.
- Keep supporting assets (specs, questions, run logs) under `planning/intake/` and `planning/runs/`; reference them relative to the repository root.

Following this playbook ensures every agent understands the current status of planning artefacts and how to progress them responsibly.
