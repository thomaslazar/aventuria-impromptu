# Bug DSA5-OPT-BUG-006 — Language Fallback, Tier Placement, and Talent Typo Tolerance

## Context
- QA references:
  - `planning/runs/2025-10-16T12-00-00-dsa5-optolith-converter/sample-analysis-2025-10-20-09-39-26.md`
- Affected samples: Stammeskrieger der Achaz, Regulario, Kopfgeldjäger

## Description
Recent QA still surfaces three classes of resolver misses:

1. **Languages outside dedicated sections.** `Stammeskrieger der Achaz` lists `Mohisch I` under special abilities (alongside `Muttersprache Rssahh`). Because we only look for `^Muttersprache` prefixes, the plain language entry is misfiled and ends up unresolved.
2. **Advantage tiers inserted before select options.** `Regulario` encodes `Verbesserte Regeneration I (Lebensenergie)` — the level is between the base label and the option, so the current normalization yields `Verbesserte Regeneration I` (missing the option) and fails to match the canonical `Verbesserte Regeneration (Lebensenergie)`.
3. **Strict talent name matching.** `Kopfgeldjäger` contains the typo `Fährtensuchern`, which differs by one character from `Fährtensuchen`. With exact matching we generate an unresolved talent despite a clear intent.

## Acceptance Criteria
| Criterion | Gherkin phrasing | Status |
| --- | --- | --- |
| AC1 | Given language-like entries appear outside the language section When resolution runs Then they are matched against the language select list before being marked unresolved | open |
| AC2 | Given advantage strings follow `<base> <tier> (<option>)` When resolution runs Then the base, option, and tier are recombined so that canonical advantage IDs resolve | open |
| AC3 | Given a talent label differs from a canonical name by small edit distance When resolution runs Then the best match within a safe tolerance is selected and a soft warning is emitted instead of an unresolved error | open |

## Implementation Notes
- Build a reusable language detector that checks sanitized tokens against `lookups.languages` and `lookups.scripts` after the initial section classification. If a match is found, drop the entry from the original bucket and add it to the languages list with the detected tier (default 1).
- Update `parseEntryComponents` (or a new helper) to recognise `Verbesserte Regeneration I (Lebensenergie)` by pulling the trailing parenthetical detail forward and appending the highest tier at the end (e.g. `Verbesserte Regeneration (Lebensenergie) I`). Guard against entries that already follow the expected format to avoid double-appending.
- Introduce a tolerant talent resolver: start with exact matches, then attempt a fuzzy lookup (e.g. Damerau-Levenshtein distance ≤ 1 or a locale-insensitive spell-check) before declaring an unresolved talent. Log a resolver warning when a fuzzy match is applied so downstream users can review the fixup.

## Testing
1. Extend `src/services/optolith/__tests__/resolver.spec.ts` with fixtures covering the three scenarios (`Mohisch I`, `Verbesserte Regeneration I (Lebensenergie)`, `Fährtensuchern`).
2. Run `npm run test:unit`, `npm run typecheck`, `npm run lint`, and `npm run optolith:convert -- --sample regulario`.
3. Regenerate the QA report via `node dist/scripts/scripts/optolith/qa-samples.js` and confirm the named samples have no resolver warnings.***
