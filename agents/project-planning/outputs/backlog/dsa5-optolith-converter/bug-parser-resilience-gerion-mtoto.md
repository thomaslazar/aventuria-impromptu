# Bug DSA5-OPT-BUG-002 — Parser Resilience for Gerion Mtoto (Poorly Formatted Stat Block)

## Context
- Related run: `runs/20251016-dsa5-optolith-converter`
- Source sample: "Gerion Mtoto" in `agents/project-planning/intake/specs/examples/dsa5-optolith-sample-stat-blocks.md`

## Description
The stat block for Gerion Mtoto contains line breaks and hyphenation artefacts (e.g. `Kör- perbeherrschung 5`) that confuse the parser. As a result:
- Talents get misinterpreted as special abilities because they appear on the same wrapped line (`Verbessertes Ausweichen I Talente: …`).
- Hyphenated words break talent lookup (`Kör- perbeherrschung` instead of `Körperbeherrschung`).
- Missing `Sprachen` section generates avoidable warnings even though the stat block legitimately omits it.

## Acceptance Criteria
| Criterion | Gherkin phrasing | Status |
| --- | --- | --- |
| AC1 | Given the Gerion Mtoto stat block When parsing runs Then hyphenated words are normalized (e.g. `Kör- perbeherrschung` → `Körperbeherrschung`) | open |
| AC2 | Given lines that combine special abilities and talents When parsing runs Then the parser separates them correctly so talents populate the talent bucket instead of special abilities | open |
| AC3 | Given the sample stat block lacks a `Sprachen` section When parsing runs Then no warning is emitted for missing languages | open |
| AC4 | Given the converter processes the Gerion Mtoto sample When the QA harness runs Then resolver warnings for misclassified talents disappear | open |

## Notes
- Consider pre-processing the raw text to merge hard line breaks and hyphenated continuations before section detection.
- Update tests to include a fixture for this sample and assert the normalized talent names.
- Coordinate with QA to re-run `scripts/optolith/qa-samples.ts` after the parser fix and update the QA report.
