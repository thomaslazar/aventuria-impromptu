# Story OPT-Equip-003 — Export Equipment & Update Cache/UI

## Context
- Spec: `planning/intake/specs/optolith-equipment-extraction.md`
- Depends on Stories OPT-Equip-001 and OPT-Equip-002.

## Description
As a converter maintainer I want resolved equipment to appear in the Optolith export, cache, and recent conversions UI so users see accurate weapons/armor and cached warning counts stay correct.

## Acceptance Criteria
| Criterion | Gherkin phrasing | Status |
| --- | --- | --- |
| AC1 | Given resolved equipment When the exporter runs Then weapons and armor populate the Optolith JSON `belongings` section | done |
| AC2 | Given the cache controller saves conversions When schema version differs Then the controller clears or migrates entries to avoid stale structures | done |
| AC3 | Given resolved warnings When the recent conversions list renders Then warning counts and breakdowns match the detailed list | done |
| AC4 | (Optional) Given equipment data exists When the UI displays conversion results Then key equipment details are visible for validation | done |

## Dependencies
- Parser and resolver equipment stories.

## Notes
- Update `src/services/optolith/exporter.ts`, `conversionCache.ts`, and `OptolithConverterView.vue` as needed.
- Ensure localization strings cover new warnings and any UI additions.
- Coordinate with QA for manual validation checklist.
- Prepare cache schema migration notes (documented in PR/README) and include helper to clear history with user-facing message.
- Groomed 2025-10-22 (ref: `planning/runs/2025-10-22T12-00-00-weapon-armor-grooming/grooming-2025-10-22T12-00-00.md`).
- Groomed 2025-10-22 (ref: `planning/runs/2025-10-22T12-00-00-weapon-armor-grooming/grooming-2025-10-22T12-00-00.md`).
- QA sweep: `planning/runs/2025-10-16T12-00-00-dsa5-optolith-converter/sample-analysis-2025-11-06T08-27-27.md`.
