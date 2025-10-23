# Work Item Pipeline

This directory models the lifecycle of product planning artefacts. Each
subfolder represents a discrete workflow state:

- `new/`: freshly captured ideas waiting for their first grooming pass.
- `backlog/`: items collaboratively groomed and approved for future work.
- `to-do/`: reviewed backlog entries ready for engineering to pick up next.
- `in-progress/`: items currently being implemented by a development agent.
- `in-code-review/`: completed development changes pending code review feedback.
- `in-qa-testing/`: stories that passed review and are undergoing QA validation.
- `done/`: delivered artefacts that cleared development, review, and QA.

Move each item by relocating its folder or file into the corresponding state
directory. See `../PLAYBOOK.md` for the detailed responsibilities tied to each
transition. Maintainers decide when a backlog item is promoted to `to-do/`;
agents should not move work into that folder on their own.
