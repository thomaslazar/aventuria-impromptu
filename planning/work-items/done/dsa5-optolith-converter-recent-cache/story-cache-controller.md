# Story DSA5-OPT-006

## Context
- Related spec: `planning/intake/specs/dsa5-optolith-converter-recent-cache.md`

## Description
As a converter maintainer I want a browser-local cache that stores the last 10 successful conversions so that users can reopen recent stat blocks and JSON outputs without rerunning the converter.

## Acceptance Criteria
| Criterion | Gherkin phrasing | Status |
| --- | --- | --- |
| AC1 | Given a successful conversion completes When the cache controller runs Then the conversion (timestamp, inferred name, stat block, JSON payload, warning summary) is saved locally and older entries beyond 10 are discarded | done |
| AC2 | Given cached conversions exist When the converter boots Then the controller initializes by reading up to 10 entries and exposing them in order of newest to oldest | done |
| AC3 | Given local storage APIs are unavailable (e.g. private mode) When initialization occurs Then the controller reports a disabled state and the rest of the app continues functioning without errors | done |
| AC4 | Given the user triggers “Clear history” When the action completes Then all cached entries are removed and subsequent requests report an empty list | done |
| AC5 | Given the cache schema changes in future releases When initialization runs Then incompatible entries are pruned gracefully using a version key without breaking the converter | done |

## Dependencies
- Existing conversion pipeline must emit the stat block text, generated JSON, and warnings for persistence.

## Notes
- Prefer IndexedDB for storage; if JSON payload sizes remain small enough, evaluate localStorage as a fallback but abstract behind a single interface.
- Capture warning metadata as a summarized structure (counts and severities) for display in the UI story.
- Expose events or hooks so the UI can react to cache updates without manual refreshes.
- Groomed on 2025-10-22; developer to publish a typed warning summary interface alongside controller implementation.

## Implementation Notes (2025-10-22)
- Added `src/services/optolith/conversionCache.ts` to manage IndexedDB-backed cache with localStorage fallback, warning summaries, and trim logic.
- Introduced cache domain types in `src/types/optolith/cache.ts` and refactored the Optolith converter view to consume the new controller (replacing single-entry localStorage usage).
- Persisted conversions on worker success and restored the most recent entry on load for parity with previous behaviour.

## Verification
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run build`

## QA Notes
- Manual spot-check: verified caching persists 10 entries, clear-history resets list, and disabled-state message appears when simulating storage errors.
