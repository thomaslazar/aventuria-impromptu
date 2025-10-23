# Run 2025-10-16T12-00-00-dsa5-optolith-converter

## Context
- Source spec: `planning/intake/specs/dsa5-optolith-converter.md`
- Related raw note: `planning/intake/raw/2025-10-14T09-00-00-dsa5-to-optolith-converter.md`
- Referenced asset: `planning/intake/assets/dsa5-optolith-converter/optolith-data.zip`

## Objectives
- Decompose the converter initiative into backlog-ready stories.
- Define how the Optolith data ZIP is ingested and transformed without redistributing the original archive.
- Surface open questions requiring product owner follow-up.

## Key Decisions
- Run the Optolith data ZIP through a maintainer-only extraction pipeline that emits a derived dataset checked into the repo or distributed separately for runtime use.
- Confirmed with Product Owner that redistributing only the derived dataset satisfies licensing constraints, enabling us to store outputs in-repo.
- Split implementation across extraction, parsing, data resolution, JSON emission, and error-handling to enable incremental validation.
- Capture schema/version uncertainties as explicit acceptance checks rather than assumptions.

## Risks & Follow-Ups
- Schema version alignment for Optolith import remains unknown; flagged in story AC for product owner confirmation.
- Product Owner supplied sample stat blocks in `planning/intake/specs/examples/dsa5-optolith-sample-stat-blocks.md`; ensure engineering references them during implementation.
- Flag for maintainer if a technical spike is required when the Optolith schema evolves faster than our local cadence.

## Backlog Outcome
- Published four ready stories under `planning/work-items/done/dsa5-optolith-converter/` (migrated from the previous backlog location).
- Tagged each story with priority bucket (P1/P2) pending grooming.
