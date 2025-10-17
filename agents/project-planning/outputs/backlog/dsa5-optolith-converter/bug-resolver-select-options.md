# Bug DSA5-OPT-BUG-001 — Resolver Select-Option Gaps

## Context
- Related run: `runs/20251016-dsa5-optolith-converter`
- Source: QA sample sweep (`sample-analysis-20251016.md`)

## Description
As a converter maintainer I need select-option lookups to succeed so that advantages and special abilities resolve to canonical IDs even when the stat block uses localized free text (e.g. "Verpflichtungen II (Universität von Al’Anfa)").

Currently the resolver/exporter drop the `sid` metadata when the option name is not found in the dataset, producing warnings and Optolith JSON that fails to import cleanly.

## Acceptance Criteria
| Criterion | Gherkin phrasing | Status |
| --- | --- | --- |
| AC1 | Given a stat block with `Verpflichtungen II (Universität von Al’Anfa)` When the converter runs Then the exported JSON contains the correct select-option reference for `DISADV_50` or stores the raw text in a schema-compliant way that Optolith accepts | open |
| AC2 | Given a stat block with `Schriftstellerei (Fachpublikationen)` When the converter runs Then the exporter captures the selected Fachgebiet without triggering unresolved-option warnings | open |
| AC3 | Given the QA sample set in `sample-analysis-20251016.md` When the conversion harness runs Then resolver warnings for select-option mismatches are eliminated or downgraded to documented fallbacks | open |

## Notes
- Catalogue unresolved cases from the QA report (Muttersprache, Hruruzat, etc.) as part of the fix.
- Add regression tests (Vitest/CLI harness) verifying the resolved `sid` or fallback payload.
- Coordinate with exporter to confirm Optolith import succeeds after resolution.
