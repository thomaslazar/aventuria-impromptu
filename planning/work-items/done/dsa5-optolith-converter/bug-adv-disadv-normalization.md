# Bug DSA5-OPT-BUG-005 — Advantage/Disadvantage Normalization & Tier Parsing

## Context
- Related run: `runs/2025-10-16T12-00-00-dsa5-optolith-converter`
- QA references: `planning/runs/2025-10-16T12-00-00-dsa5-optolith-converter/sample-analysis-2025-10-16T11-30-00-post-fixes.md`
- Affected samples: Gerion Mtoto, Achaz-Krieger, Maru-Kriegerin, Jupopu-Lokan, Chr’ho, Djer’kem

## Description
Current mapping of advantages/disadvantages is heuristic and misclassifies several entries:
- `Schlechte Eigenschaften (Neugier)` (plural) should resolve to `Schlechte Eigenschaft (Neugier)`.
- Entries like `Eingeschränkter Sinn (Gehör)` (disadvantage), `Beidhändig`, `Dunkelsicht`, `Blutrausch`, `Kälteempfindlich`, `Zäher Hund` need list-based validation instead of keyword guesses.
- Special ability tiers expressed as `I+II`, `I+II+III` must collapse to the highest tier (e.g. Wuchtschlag II).
- Citations (`AKOII128`) and weapon lists appended to SF names should be scrubbed before matching.
- `Muttersprache Garethi III` should resolve to language SA at tier 3.

## Acceptance Criteria
| Criterion | Gherkin phrasing | Status |
| --- | --- | --- |
| AC1 | Given any advantage/disadvantage parsed When resolution runs Then the label is matched against canonical lists (advantages/disadvantages) before falling back to heuristics | open |
| AC2 | Given tier strings like `I+II` or `I+II+III` When resolution runs Then the highest tier is selected and recorded | open |
| AC3 | Given entries containing citations (`AKO…`) or weapon hints When resolution runs Then citations are removed and weapon text ignored for SF matching | open |
| AC4 | Given `Muttersprache <Language> III` When resolution runs Then language SA receives the correct select option and tier = 3 | open |
| AC5 | Given the QA sample set When the harness runs Then advantage/disadvantage warnings caused by pluralization/typos disappear | open |

## Notes
- Build canonical lookup tables from dataset (advantages/disadvantages lists) to check classification.
- Introduce a tier parser that interprets combos (`I+II`, `I`, `II+III`, etc.) consistently.
- Capture unresolved cases for future mapping rather than silently accepting heuristics.
