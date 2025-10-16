# Story DSA5-OPT-002

## Priority
- P1 (MVP import pipeline)

## Context
- Related run: `runs/20251016-dsa5-optolith-converter`
- Source: `intake/specs/dsa5-optolith-converter.md`

## Description
As a game master I want stat block text parsed into a normalized internal model so that the converter can map attributes, combat values, talents, and narrative segments reliably.

## Acceptance Criteria
| Criterion | Gherkin phrasing | Status |
| --- | --- | --- |
| AC1 | Given a representative DSA5 stat block with headings, abbreviations, and German umlauts When the parser runs Then it extracts structured fields for attributes, combat stats, talents, advantages/disadvantages, special abilities, spells, blessings, equipment, social status, and narrative notes | open |
| AC2 | Given extraneous whitespace, bullet characters, or line-break artifacts in the input When parsing completes Then the resulting model is normalized without losing data or crashing | open |
| AC3 | Given a stat block that misses an expected section When the parser runs Then it records the omission in a machine-readable warning collection without throwing | open |
| AC4 | Given the parser tooling is installed When maintainers run the dedicated parser harness with bundled samples Then it executes from the command line and outputs machine-readable diagnostics suitable for automated tests | open |

## Dependencies
- Sample stat blocks stored under `agents/project-planning/intake/specs/examples/` (mundane, cleric, plus forthcoming elementalist and demon variants) for parser validation.

## Notes
- Persist narrative snippets separately so exporter can place them into Optolith-safe notes without HTML or Markdown.
- Include unit tests to guard against regressions in parsing abbreviations and roman numerals.
- Provide a Vitest helper or fixture loader that powers both CLI harness checks and snapshot comparisons.
