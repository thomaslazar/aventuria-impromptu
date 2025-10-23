# Bug DSA5-OPT-BUG-003 — Parser Handling of Adv/Disadv Splits & AKO Citations (Nepi-Luhan)

## Context
- Related run: `runs/2025-10-16T12-00-00-dsa5-optolith-converter`
- Sample: "Nepi-Luhan" entry in `planning/intake/specs/examples/dsa5-optolith-sample-stat-blocks.md`

## Description
The Nepi-Luhan stat block highlights two systemic parsing issues:

1. **Advantages/Disadvantages separated by `/`** — Input format lists advantages and disadvantages in a single line separated by a slash (e.g. `Richtungssinn / Schlechte Eigenschaft (Aberglaube)`). Current parser shoves the entire string into one bucket instead of splitting and matching each side individually.
2. **Source citations with AKO identifiers** — Entries such as `Auf Distanz halten IAKO151 (Tauchspeer)` include inline source references (`AKO151`, `AKO110`) that should be stripped before lookup. Presently the parser treats them as part of the name, leading to resolver failures.

## Acceptance Criteria
| Criterion | Gherkin phrasing | Status |
| --- | --- | --- |
| AC1 | Given a stat block line using `/` to separate advantages and disadvantages When parsing runs Then each side is evaluated independently and assigned to the correct bucket | open |
| AC2 | Given a stat block containing inline AKO citations (e.g. `IAKO151`) When parsing runs Then citations are removed prior to matching special abilities and combat abilities | open |
| AC3 | Given the Nepi-Luhan sample When the QA harness (`scripts/optolith/qa-samples.ts`) runs Then resolver warnings for `Richtungssinn / Schlechte Eigenschaft ...` and AKO-prefixed abilities disappear | open |
| AC4 | Given arbitrary advantages/disadvantages mixed in one line When parsing runs Then the parser gracefully handles ambiguous cases by trying both buckets and reporting if neither matches | open |

## Notes
- Build a reusable citation stripping utility (e.g. map known rulebook abbreviations) so future stat blocks are cleaned consistently.
- Update parser tests with a fixture capturing the Nepi-Luhan line, asserting advantage/disadvantage splits and cleaned ability names.
- After implementation, re-run the QA sample harness and refresh the analysis report.
