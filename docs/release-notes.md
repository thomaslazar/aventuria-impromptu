# Aventuria Impromptu Release Notes

Curated highlights of the most significant feature drops. Minor fixes, copy tweaks, and build housekeeping are intentionally omitted so this document stays focused on capabilities that change what the app can do.

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
