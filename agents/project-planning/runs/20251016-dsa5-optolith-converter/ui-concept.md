# UI Concept — DSA5 Stat Block Converter

## Goals
- Allow users to paste a German DSA5 stat block and retrieve an Optolith-compatible JSON export without leaving the browser.
- Surface resolver warnings (unresolved references, normalization notes) in a clear, actionable list.
- Keep the conversion flow fully client-side, failing gracefully when local assets are missing or corrupted.

## High-Level Flow
1. User navigates to **Tools → Optolith Converter** (new route `/tools/optolith-converter`).
2. User pastes or uploads stat block text into a primary text area (support optional `.txt` drag-and-drop).
3. User triggers “Convert Stat Block” CTA. UI disables input and shows progress spinner.
4. Front-end calls converter service method:
   - Parses text (Story OPT-002) in the browser via a web worker for responsiveness.
   - Resolves model against derived dataset (Story OPT-003).
   - Produces JSON export + warnings (Story OPT-004).
5. On success:
   - UI renders summary card showing detected NPC name and inferred archetype (when available).
   - Warnings/errors list surfaces unresolved entities, schema mismatches, and normalization notes.
   - “Download Optolith JSON” button streams `application/json` file.
6. On failure:
   - UI shows inline error banner indicating conversion failure and suggests retrying later.
   - Keeps parsed content and allows user edits/retry.

## UI Structure
- **Header**: Title plus brief instructions for pasting a single stat block.
- **Input Panel**:
  - Text area with placeholder example (toggle to load sample from `examples.md`).
  - Secondary action to upload `.txt` file.
  - Character count, validation states (empty, likely multi-stat-block).
- **Actions**:
  - Primary button “Convert Stat Block” (disabled until non-empty input).
  - Secondary “Reset Form”.
- **Output Panel** (tabs):
  - **Result**: JSON preview (code block limited to first 120 lines) + download button.
  - **Warnings**: Table with type (unresolved, schema mismatch), message, suggestion.
  - **Raw Model** (optional): Expandable debug view to aid maintainers.
- **Footer**: Links to documentation, sample stat blocks, licensing note.

## Technical Design
- **Routing**: Add route to Vue Router; lazy-load view.
- **State Management**: Local component state backed by composables; no global store required.
- **Conversion Engine**:
  - Bundle parser/resolver/exporter into a reusable module `@/services/optolithConverter`.
  - Use dedicated web worker (`optolithConverter.worker.ts`) to keep UI responsive; message passing via structured clone.
  - Worker loads derived dataset chunks via `fetch` from `/data/optolith/*.json` as defined by manifest.
- **Download Handling**: Create blob from exporter result and trigger client-side download (file name suggestion `<npc-name>-optolith.json`).
## Validation & Error Handling
- Input validation: detect empty input, suspicious multiple NPC separators, unsupported characters (non-UTF8).
- Dataset validation: check manifest presence and schema version before conversion; if missing/outdated, show a generic failure message and disable conversion.
- Conversion errors: Standardized error objects (type, title, message) returned from worker.
- Warning types:
  - `unresolvedReference`
  - `schemaMismatch`
  - `normalizationApplied`
  - Provide “Copy warnings” button for quick sharing.

## Performance & UX Considerations
- Web worker initialization is asynchronous; display “Preparing converter…” for first run.
- Cache manifest fetch for session to avoid redundant requests (no user-facing output).
- Limit JSON preview to avoid locking UI (use `v-code` component with virtualization or collapsed view).
- Offer keyboard shortcuts (`Ctrl+Enter` to convert, `Ctrl+Backspace` to reset).
- Ensure accessible labels, error states, and screen-reader announcements on conversion completion/failure.

## Implementation Tasks (Backlog Candidate DSA5-OPT-005)
- Create Optolith converter view component with routing + layout.
- Implement conversion worker + service abstraction.
- Wire manifest fetch, dataset loading, and failure handling when assets are unavailable.
- Build warning summary UI and download flow.
- Add optional localStorage cache of the most recent successful conversion for quick re-access (client-side only).
- Add Vitest/component tests for form validation, worker interaction, and cache behavior.
- Document usage in README and link to extractor instructions.

## Open Questions
- No runtime dataset updates; maintainers regenerate assets and redeploy the app.
- No authentication/authorization is required—tool is stateless beyond client cache.
- Target max stat block length: ~3× average sample size; reject inputs exceeding this limit with guidance.
- Optional: store the most recent conversions in localStorage for convenience, ensuring everything remains client-side.

## Next Steps
- Align with Product Owner on copy/wording for warnings and dataset stale messaging.
- Finalize worker-module boundaries once Stories OPT-001–004 code exists.
- Prepare acceptance criteria (Story DSA5-OPT-005) and slot into backlog.
