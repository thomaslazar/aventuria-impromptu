# Story DSA5-OPT-003

## Priority
- P1 (MVP import pipeline)

## Context
- Related run: `runs/20251016-dsa5-optolith-converter`
- Source: `intake/specs/dsa5-optolith-converter.md`

## Description
As a converter maintainer I want parsed stat block elements resolved against the derived Optolith dataset so that the resulting model references canonical IDs, select options, and normalized names.

## Acceptance Criteria
| Criterion | Gherkin phrasing | Status |
| --- | --- | --- |
| AC1 | Given the parsed model and the derived Optolith dataset When resolution runs Then talents, combat techniques, advantages/disadvantages, special abilities (including leveled roman numerals), languages, scripts, and blessings produce canonical IDs with correct `sid`/`sid2` metadata | open |
| AC2 | Given shorthand or legacy naming such as “Tradition (Gott)” When resolution completes Then the output uses the canonical Optolith label configured in the mapping table | open |
| AC3 | Given an entry that has no match in the derived dataset When resolution runs Then the item is placed into the warning log and appended to narrative notes while the process continues | open |
| AC4 | Given the derived dataset manifest lists domain chunks When the resolver loads data Then it resolves through the typed access layer using the manifest-defined paths and handles missing chunks by returning structured warnings (no runtime throws) | open |

## Dependencies
- Story DSA5-OPT-001 for generating the derived Optolith dataset.
- Story DSA5-OPT-002 for the structured input model.

## Notes
- Record the Optolith schema version used in resolution output so downstream exporters can flag mismatches.
- Provide a typed result object containing resolved entries, unresolved items, and normalization notes.
- Define a dataset path contract (e.g. `@/data/optolith/<domain>.json`) and ensure Vite bundling preserves chunking without pulling in unused sections.
- Generate TypeScript definitions from the manifest so consumers get compile-time safety when referencing dataset chunks.
- Implement non-console logging hooks (e.g. structured logger interface) for missing IDs so they can be surfaced without polluting production builds.
