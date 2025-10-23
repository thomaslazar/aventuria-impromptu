# Planning Workspace

Product planning assets live under this directory so agents can move seamlessly
from ideation to delivery. Pair this overview with `PLAYBOOK.md` for the
workflow details.

## Directory Map
- `intake/`: Specs, assets, raw notes, and outstanding questions gathered from stakeholders.
- `runs/`: Timestamped planning sessions capturing grooming notes and draft artefacts (folders named `YYYY-MM-DDTHH-mm-ss-<slug>`).
- `templates/`: Canonical markdown templates for specs and stories; optional plan formats remain for maintainer use.
- `work-items/`: Kanban-style folders tracking story lifecycle states (`new/` → `done/`).
- `outputs/plans/`: Optional maintainer summaries; agents generally rely on the work-item pipeline instead of formal release plans.

## Suggested Flow
1. Capture briefs in `intake/` using the provided templates.
2. During a planning run, work inside `runs/YYYY-MM-DDTHH-mm-ss-<slug>/`.
3. Promote refined stories or tasks into `work-items/new/`.
4. Progress items through the workflow states documented in `PLAYBOOK.md`; the maintainer alone promotes items from `backlog/` to `to-do/`.
5. (Optional) If the maintainer wants an overview, publish a note under `outputs/plans/` and link back to the originating run.

This structure separates intake, active planning, lifecycle tracking, and final
outputs so multiple agents can collaborate without stepping on each other’s work.
