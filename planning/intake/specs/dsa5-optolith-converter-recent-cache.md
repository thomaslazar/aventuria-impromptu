# DSA5 Optolith Converter — Recent Results Cache

## Context
- Product / initiative: Aventuria Impromptu tooling — Optolith converter UX
- Author: Product Owner Agent
- Date: 2025-10-22

## Problem Statement
After running a conversion, users who switch tabs or close the converter lose direct access to the generated Optolith JSON. They must re-run the conversion (which reprocesses the stat block and dataset) even when no changes are required. This wastes time and introduces the risk of inconsistencies if the dataset changes between runs.

## Goals
- Persist the last 10 successful conversions in the user’s browser so they can be revisited without reprocessing.
- Present each saved entry with its original stat block input and a way to download the previously generated JSON.
- Respect privacy and licensing constraints by keeping all cached data local to the browser; no server-side storage or sync.
- Provide clear UI affordances that help users differentiate between the active conversion and prior results.

## Non-Goals
- No server-side history, sharing, or synchronization across devices.
- No automatic clean-up of conversions beyond the rolling window of 10 entries.
- No changes to the conversion pipeline itself (parser/resolver/exporter logic remains untouched).

## User Flows / Scenarios
1. After a successful conversion, the result is added to the top of a “Recent Conversions” list. The user can reopen the list later in the session to download the same JSON or review the stat block.
2. The user returns to the converter on a subsequent day. The recent list still shows up to 10 prior conversions stored locally. Selecting one loads its stat block preview and offers a download button without rerunning the worker.
3. Once the user performs an 11th conversion, the oldest cached entry is dropped automatically.
4. The user clears browser storage (site data); the recent list appears empty and the UI communicates that no history is available.

## Functional Requirements
- Store conversions in a browser-only cache (IndexedDB or localStorage, whichever meets size/performance needs) with a maximum of 10 entries.
- Each stored entry must include:
  - ISO timestamp of conversion completion.
  - NPC name or identifier (if inferred), falling back to “Unnamed conversion”.
  - Original stat block text.
  - Generated Optolith JSON payload.
- Converter warning metadata (e.g. counts or severity summary) captured from the last run.
- Provide UI to browse the cached entries (e.g. side panel or collapsible section) showing at least timestamp and name/title.
- Selecting an entry reveals:
  - Stat block preview (expanded/collapsed view).
  - “Download JSON” button that streams the cached payload directly.
  - Metadata summary including timestamp and warning count.
  - “Load into editor” button to restore the stat block (and optionally the JSON preview) into the active workspace for further edits.
- Display an empty state when no cached conversions exist with guidance on how entries appear.
- Ensure the active conversion flow remains usable while interacting with history (e.g. no destructive replacements of current text area content unless the user opts to load it).

## Technical Constraints
- Data must remain client-side only; do not send caches to any backend or analytics endpoint.
- Storage mechanism must handle up to 10 entries without performance degradation; prefer IndexedDB for larger payloads, but allow falling back to localStorage if JSON sizes remain modest.
- Cache write should occur only after a successful conversion with valid JSON output.
- Include migration handling if storage schema changes (e.g. version key in cache).
- Support browsers already targeted by the converter; degrade gracefully if storage is unavailable (incognito/private mode).

## Acceptance Criteria (High-Level)
- Given up to 10 conversions have been performed, When the user opens the recent results list Then each entry displays timestamp, stat block preview trigger, and download control.
- Given a stored entry, When the user clicks “Download JSON” Then the cached file downloads without rerunning the converter worker.
- Given a stored entry, When the user clicks “Load into editor” Then the input area reflects the cached stat block, cached warnings are cleared from the UI, and the user can run a new conversion.
- Given the user executes an 11th conversion, When cache update completes Then the oldest entry is removed and the list still shows at most 10 items.
- Given local storage is unavailable or cleared, When the converter loads Then the recent results UI shows an empty state and conversion still works normally.
- Given a stored entry contains warning metadata, When the user views the recent list Then the warning count is visible without opening the detail view.

## Risks & Assumptions
- Assumes Optolith JSON payload sizes remain manageable for client storage; monitor for oversized outputs.
- Users might expect cross-device availability; the UI must clarify that history is local-only.
- Need to ensure cached data does not expose sensitive adventure spoilers if other users access the same browser profile; provide a manual “Clear history” action.

## Open Questions
- Pinning conversions is out of scope; the rolling window remains fixed at 10 entries.
- Converter warnings must be surfaced both in the list and detail views.
- Loading a cached stat block replaces the current editor content via the “Load into editor” button.

## Attachments
- References: Existing converter UI concept (`planning/runs/2025-10-16T12-00-00-dsa5-optolith-converter/ui-concept.md`) for integration context.
