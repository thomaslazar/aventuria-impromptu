# Story DSA5-OPT-007

## Context
- Related spec: `planning/intake/specs/dsa5-optolith-converter-recent-cache.md`
- Depends on: Story DSA5-OPT-006 (cache controller)

## Description
As a converter user I want a “Recent Conversions” panel that lists my last 10 locally cached results so that I can preview stat blocks, review warnings, download JSON again, or load a prior stat block back into the editor for tweaks.

## Acceptance Criteria
| Criterion | Gherkin phrasing | Status |
| --- | --- | --- |
| AC1 | Given cached conversions exist When I open the converter Then a “Recent Conversions” list shows up to 10 entries with timestamp, inferred name, and warning count | done |
| AC2 | Given a cached entry is visible When I expand it Then I see the stat block preview, warning summary, “Download JSON”, “Load into editor”, and “Remove” (if applicable) actions | done |
| AC3 | Given I click “Download JSON” on an entry When the action completes Then the cached file downloads immediately without invoking the worker | done |
| AC4 | Given I click “Load into editor” on an entry When the action completes Then the main text area populates with the cached stat block, prior warnings are cleared, and the UI indicates I can run a new conversion | done |
| AC5 | Given I click “Clear history” When I confirm the dialog Then the list empties and a friendly empty state explains how entries will appear after the next conversion | done |
| AC6 | Given storage is unavailable When the converter loads Then the recent panel displays a disabled message while leaving the main conversion workflow usable | done |

## Dependencies
- Story DSA5-OPT-006: provides the cache read/write interface and normalized data.

## Notes
- Match existing converter styling; ensure the panel works responsively on tablet/desktop.
- Support keyboard navigation and screen-reader announcements for expansion toggles and action buttons.
- Consider lazy-loading previews for large stat blocks to avoid layout jank.
- Groomed on 2025-10-22; depends on finalized warning summary shape from controller story and must surface disabled-state messaging when storage is unavailable.

## Implementation Notes (2025-10-22)
- Added a “Recent conversions” card to `OptolithConverterView.vue` with list rendering, per-entry actions (load, download, remove), and a clear-history control wired to the new cache controller.
- Surfaced cached stat blocks and JSON previews via collapsible `<details>` panels, including warning badges with localized breakdown tooltips.
- Extended styles and i18n resources (DE/EN) to support the new UI state and disabled/empty messaging.

## Verification
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run build`

## QA Notes
- Exercised load/download/remove actions against cached entries, confirmed JSON downloads without re-running worker and editor reload resets warnings.
- Validated empty and disabled states render localized messaging and that clear-history disables when no entries remain.
