# Story DSA5-OPT-001

## Priority
- P1 (MVP import pipeline)

## Context
- Related run: `runs/2025-10-16T12-00-00-dsa5-optolith-converter`
- Source: `planning/intake/specs/dsa5-optolith-converter.md`

## Description
As an Aventuria tools maintainer I want to extract the Optolith data ZIP into a normalized dataset so that the converter can resolve canonical IDs without redistributing the source archive.

## Acceptance Criteria
| Criterion | Gherkin phrasing | Status |
| --- | --- | --- |
| AC1 | Given `planning/intake/assets/dsa5-optolith-converter/optolith-data.zip` is available When the extraction tool runs Then a deterministic derived dataset (e.g. `data/optolith-derived.json`) is generated containing IDs, labels, and select-option metadata | open |
| AC2 | Given the derived dataset is created When maintainers inspect the output Then it records the Optolith schema/version and timestamp used for traceability | open |
| AC3 | Given the extraction tool runs against the supplied ZIP When the process completes Then it verifies the archive checksum and aborts with an actionable error if validation fails | open |
| AC4 | Given the extraction tool runs successfully When the outputs are generated Then a manifest file listing dataset sections, schema version, source checksum, and generation timestamp is emitted alongside the data | open |
| AC5 | Given a previous derived dataset exists When the extraction tool runs with the `--diff` flag Then a human-readable change report (added/removed/changed entries) is produced for the product owner | open |
| AC6 | Given the extraction tool runs against a missing or incompatible ZIP When the process completes Then it fails with an actionable error message describing the remediation steps | open |

## Dependencies
- Access to the official Optolith data ZIP and confirmation that derived datasets may be redistributed.

## Notes
- Implement the extractor as a Node 20 script or CLI so it fits existing tooling.
- Expose CLI flags for checksum verification, diff generation, and output path configuration so the process can run in CI.
- Store outputs under `data/` or `src/data/` to keep application runtime free from raw Optolith assets.
- Produce the manifest in a typed format (e.g. JSON with interface definitions) so downstream code generation can consume it.
- Plan for monthly extractor runs; surface manifest and diff artefacts to the product owner for review.
