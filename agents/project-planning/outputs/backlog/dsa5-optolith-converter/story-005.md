# Story DSA5-OPT-005

## Priority
- P1 (UI integration for MVP)

## Context
- Related run: `runs/20251016-dsa5-optolith-converter`
- Source: `runs/20251016-dsa5-optolith-converter/ui-concept.md`

## Description
As a game master I want a web UI that converts a DSA5 stat block into a downloadable Optolith JSON so that I can generate NPC imports without running command-line tools.

## Acceptance Criteria
| Criterion | Gherkin phrasing | Status |
| --- | --- | --- |
| AC1 | Given I open `/tools/optolith-converter` When the page loads Then I see instructions and a form to paste a stat block | open |
| AC2 | Given I paste a valid stat block and click “Convert Stat Block” When the converter completes Then I can download the resulting Optolith JSON file and preview the first portion inline | open |
| AC3 | Given the resolver returns warnings (e.g. unresolved references) When the conversion finishes Then the UI lists each warning with type and remediation guidance | open |
| AC4 | Given the derived dataset is missing or corrupted When I attempt to convert Then the UI shows a failure banner and instructs me to try again later | open |
| AC5 | Given the converter encounters a parsing or export error When the process fails Then the UI surfaces an actionable error message without losing my input text | open |

## Dependencies
- Story DSA5-OPT-001 (derived dataset & manifest availability)
- Story DSA5-OPT-002 (parser module)
- Story DSA5-OPT-003 (resolver module)
- Story DSA5-OPT-004 (exporter module)

## Notes
- Implement converter logic in a web worker to keep the UI responsive and allow progress states.
- Respect the manifest-defined dataset chunk paths and the logging hooks introduced in earlier stories.
- Reuse sample stat blocks from `agents/project-planning/intake/specs/examples/dsa5-optolith-sample-stat-blocks.md` as quick-fill examples for QA/demo.
- Cache the most recent successful conversion in localStorage (client-only) so users can re-download without re-running the worker.
- Add component and worker interaction tests (Vitest) to cover happy path, warning path, dataset-missing path, and cache usage.
