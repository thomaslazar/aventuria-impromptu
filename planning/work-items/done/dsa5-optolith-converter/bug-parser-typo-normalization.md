# Bug DSA5-OPT-BUG-004 — Typo Normalization in Stat Blocks

## Context
- Related run: `runs/2025-10-16T12-00-00-dsa5-optolith-converter`
- Trigger: “Stammeskriegerin der Napewanha” sample (typo `Sinesschärfe` vs `Sinnesschärfe`)

## Description
Some stat blocks contain simple typos or missing letters that still point to canonical entries (e.g. `Sinesschärfe` should resolve to the talent `Sinnesschärfe`). Right now the parser/resolver treats these as distinct strings and fails to match them, producing warnings.

## Acceptance Criteria
| Criterion | Gherkin phrasing | Status |
| --- | --- | --- |
| AC1 | Given a stat block containing `Sinesschärfe` When the converter runs Then the parser/resolver normalizes the typo and resolves `Sinnesschärfe` successfully | open |
| AC2 | Given a list of common typo patterns (e.g. double consonants dropped) When parsing runs Then the normalizer applies them before lookup | open |
| AC3 | Given a talent/special ability that truly does not exist in the dataset (e.g. “Hauch des Elements” missing from liturgies) When the converter runs Then a warning persists so we can track dataset coverage gaps | open |

## Notes
- Maintain a small typo-correction dictionary (e.g. map `Sinesschärfe` → `Sinnesschärfe`) and apply before matching.
- Re-run QA harness after implementation to ensure the Nepi-Luhan & Napewanha warnings disappear except for genuinely missing entries.
