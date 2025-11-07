# Story OPT-Converter-UX — Clipboard Feedback & Guidance

## Context
- Feature area: Optolith Converter UX
- Motivation: Reduce user confusion when copying JSON, clarify supported stat blocks, and highlight FoundryVTT possibilities.

## Description
As a product owner I want clearer affordances and usage guidance in the Optolith converter so users know when JSON copy actions succeeded, what kind of stat blocks work best, and how the output might be used beyond Optolith.

## Acceptance Criteria
| Criterion | Description | Status |
| --- | --- | --- |
| AC1 | After pressing the “Copy JSON” button, the UI provides immediate success feedback (e.g., toast, inline notice, or icon state change) so users know the clipboard action worked. | pending |
| AC2 | The stat block textarea contains a localized sample stat block (invented but plausible, e.g., a “Horasische Hafenwache” with realistic MU/KL/IN values) by default to illustrate the expected formatting, rather than an empty placeholder string. | pending |
| AC3 | The converter view shows guidance that the workflow is optimized for humanoid NSC stat blocks and that monster stat blocks may only partially convert (attributes/talents). | pending |
| AC4 | Documentation/UI copy explains that the exported JSON may be usable in FoundryVTT but is currently untested. | pending |

## Dependencies
- Existing Optolith converter UI components and i18n strings.
- Clipboard helper that already handles JSON copy actions.

## Notes
- Consider reusing the existing warning/info callout styles for the “humanoid NSC” guidance so it’s visible but unobtrusive.
- For sample stat block content, craft an original yet plausible humanoid stat block (e.g., “Horasische Hafenwache”) that demonstrates multi-line weapons, RS/BE, and special abilities; include a clear button so users can start fresh.
- Confirm the clipboard success feedback also works for history entries (recent conversions tab) since they share the same helper.
- When mentioning FoundryVTT, be explicit that it’s untested to manage expectations.
