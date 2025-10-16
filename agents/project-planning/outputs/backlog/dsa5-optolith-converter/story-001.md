# Story DSA5-OPT-001

## Priority
- P1 (MVP import pipeline)

## Context
- Related run: `runs/20251016-dsa5-optolith-converter`
- Source: `intake/specs/dsa5-optolith-converter.md`

## Description
As an Aventuria tools maintainer I want to extract the Optolith data ZIP into a normalized dataset so that the converter can resolve canonical IDs without redistributing the source archive.

## Acceptance Criteria
| Criterion | Gherkin phrasing | Status |
| --- | --- | --- |
| AC1 | Given `agents/project-planning/intake/assets/dsa5-optolith-converter/optolith-data.zip` is available When the extraction tool runs Then a deterministic derived dataset (e.g. `data/optolith-derived.json`) is generated containing IDs, labels, and select-option metadata | open |
| AC2 | Given the derived dataset is created When maintainers inspect the output Then it records the Optolith schema/version and timestamp used for traceability | open |
| AC3 | Given the extraction tool runs against a missing or incompatible ZIP When the process completes Then it fails with an actionable error message describing the remediation steps | open |

## Dependencies
- Access to the official Optolith data ZIP and confirmation that derived datasets may be redistributed.

## Notes
- Implement the extractor as a Node 20 script or CLI so it fits existing tooling.
- Store outputs under `data/` or `src/data/` to keep application runtime free from raw Optolith assets.
