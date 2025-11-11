# Aventuria Impromptu Release Notes

Curated highlights of the most significant feature drops. Minor fixes, copy tweaks, and build housekeeping are intentionally omitted so this document stays focused on capabilities that change what the app can do.

## 0.4.4 — Loot UI Consolidation (2025-11-11)

- Consolidated the separate "Loot: NPC" and "Loot: Treasure" navigation tabs into a single "Loot" tab with sub-tabs for NPC and Treasure loot, streamlining the navigation experience while preserving all existing functionality.
- Enhanced the loot interface with tabbed navigation that dynamically updates intro text based on the active tab, maintaining the contextual descriptions users expect for each loot type.

## 0.4.3 — Optolith Cantrip Support (2025-11-11)

- Improved stat block parsing with support for inline talent markers, hardened special ability splitting, and validation warnings for incomplete entries.
- Added dedicated cantrip parsing and resolution across the Optolith converter pipeline, enabling stat blocks with cantrip references to be accurately converted into Optolith-compatible JSON.
- Updated the Optolith dataset extraction to include missing data, ensuring more comprehensive data coverage.
- Consolidated Optolith spell datasets to improve data consistency and streamline maintenance.

## 0.4.2 — Optolith Dataset Refresh (2025-11-09)

- Updated the Optolith dataset to the newest upstream release, adding 10 new special abilities so converter imports stay in sync with the latest lore.

## 0.4.1 — Optolith UX Polish (2025-11-07)

- Seeded the converter textarea with a full “Horasische Hafenwache” sample stat block placeholder so first-time users immediately see the expected format without pasting anything.
- Added clipboard success feedback for both the main JSON result and each cached history entry, making copy actions obvious in long sessions.
- Updated the Roll20 callout to clarify that humanoid NSC stat blocks provide the best results and that FoundryVTT usage is possible but still untested.
- Hardened the Optolith parser/resolver: weapon lines are detected anywhere in the stat block, explicit “Kampftechniken” ratings feed combat-tech inference, and script sections now map to SA_27 entries like Kusliker Zeichen alongside standard languages.

## 0.4.0 — Optolith Equipment & Techniques (2025-11-07)

- Added a multi-line weapon/armor parser that understands hyphenated names, plural quantities, attribute abbreviations, and inline notes so exotic stat blocks (“Tauchspeer”, “Immanschläger, den er als Knüppel nutzt”, etc.) can be normalized without manual cleanup.
- Expanded the resolver + exporter to match parsed equipment against the Optolith dataset, emit hydrated belongings (template IDs, RS/BE, encumbrance), surface clearer warnings for natural armor or adjusted loads, and keep the recent-conversions cache schema in sync.
- Introduced combat technique inference: derived base CT values from weapon AT/PA/FK, MU/FF modifiers, and weapon-specific attack modifiers, then wrote the values into Optolith JSON so NPC imports arrive with correct melee and ranged proficiencies.
- Polished the converter UI with a dedicated “Recent conversions” tab, slimmer result cards, a JSON copy button, and accessible warning callouts so large histories stay scannable even when results are collapsed.

## 0.3.2 — GitHub Issue Reporting (2025-11-05)

- Added a GitHub issues link in the Optolith converter to help users report stat block conversion bugs, including localized guidance in German and English for submitting problematic stat blocks.

## 0.3.1 — Optolith Conversion History (2025-10-22)

- Introduced tabbed navigation on the Optolith converter with a dedicated “Recent conversions” view, matching the site-wide pill styling.
- Persisted the ten most recent conversion results client-side, exposing stat block previews, warning counts, re-downloads, and editor reloads without rerunning the worker.
- Normalized warning deduplication so the badge count mirrors the warning list, fixing mismatches seen on cached entries like “Messerstecher”.

## 0.3.0 — Optolith Converter (2025-10-20)

- Added the Optolith converter pipeline and UI for transforming German DSA5 stat blocks into Optolith-compatible NPC JSON, including background worker execution, QA samples, and import-ready data packs (`fe1b310`).
- Localized the converter experience with German and English guidance, warnings, and action labels so the workflow stays accessible to both language audiences (`c856319`).

## 0.2.0 — Localization Rollout (2025-10-14)

- Introduced Vue I18n across the application with German and English locale packs, updated tables, and a language switcher to keep the random generators and chrome bilingual (`bf49efc`).

## 0.1.0 — Aventurian Codex Refresh (2025-10-13)

- Shipped the Aventurian Codex theme revamp, refreshing layout, typography, and component styling across all views to match the project’s new identity (`fb8192c`).
- Expanded the tavern generator with curated name generation, plural handling, and detail presentation so every rolled locale reads like a real Aventurian establishment (`175f21f`, `8d20af3`, `c7eff6e`).
- Streamlined treasure loot generation by unifying material breakdowns into a single output and tightening the supporting tests (`8a254d0`).

## 0.0.1 — First Throw at Generators (2022-05-16)

- Seeded the very first tavern and loot generators, complete with the original Vue routing, favicon, and dice logic foundation before the Codex refresh (`1de52b9`, `4552f30`, `e1cc150`, `b36ed2e`).
