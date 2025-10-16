# Story DSA5-OPT-004

## Priority
- P1 (MVP import pipeline)

## Context
- Related run: `runs/20251016-dsa5-optolith-converter`
- Source: `intake/specs/dsa5-optolith-converter.md`

## Description
As a rules editor I want the converter to emit Optolith-compliant hero JSON with actionable validation errors so that NPC imports succeed or fail with clear remediation steps.

## Acceptance Criteria
| Criterion | Gherkin phrasing | Status |
| --- | --- | --- |
| AC1 | Given a resolved model from Story DSA5-OPT-003 When the exporter runs Then it produces a single-hero JSON file that Optolith imports without manual edits in the happy path scenario | open |
| AC2 | Given unresolved references reported by the resolver When the exporter runs Then it writes the unresolved elements into Optolith-safe notes and returns a warning summary to the user | open |
| AC3 | Given the Optolith schema version recorded in the derived dataset differs from the expected version When the exporter runs Then it blocks the export and prompts for dataset regeneration or version override | open |

## Dependencies
- Story DSA5-OPT-001 for the derived dataset generation workflow.
- Story DSA5-OPT-003 for normalized resolver output.

## Notes
- Validate the JSON against Optolith’s schema definition or representative fixtures before completing the story.
- Provide CLI and programmatic entry points so the converter can be wired into future UI flows.
