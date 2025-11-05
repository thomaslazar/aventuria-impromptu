# Optolith Converter — Weapon & Armor Extraction

## Context
- Product / initiative: Aventuria Impromptu tooling — Optolith converter
- Author: Planning Agent
- Date: 2025-10-22

## Problem Statement
The Optolith converter currently ignores weapon and armor data present in published DSA5 stat blocks. Generated NPC JSON lacks equipment entries, combat techniques inferred from weapons, and armor representation, forcing manual edits in Optolith and undermining fidelity to the source material.

## Goals
- Parse weapon and armor information from stat blocks (including attack/parry, damage, range, RS/BE).
- Resolve parsed equipment to canonical Optolith dataset entries, inferring combat techniques or equipment IDs where possible.
- Export resolved weapons and armor into Optolith JSON so NPCs are ready for import without manual equipment adjustments.
- Surface actionable warnings for unmapped equipment or inconsistent RS/BE values.

## Non-Goals
- No UI redesign beyond optional equipment display in the converter result card.
- No server-side storage or sharing of equipment data; remain browser-only.
- No changes to Optolith dataset extraction pipeline beyond lookups needed for equipment.

## User Flows / Scenarios
1. A stat block lists multiple weapons (e.g. “Tauchspeer”, “Blasrohr”, “Dolch”) with AT/PA/TP/RW lines. The converter recognises each weapon, maps them to Optolith items, and sets the appropriate combat technique values in the export.
2. A stat block states `RS/BE 0/0`. Converter stores “no armor” and leaves equipment empty without warnings.
3. A stat block states `RS/BE 3/2 (Kettenhemd)`; converter maps the armor to the dataset, validates BE, and adds the armor entry to equipment. If BE differs from canonical, it logs a warning.
4. “Waffenlos” entry is parsed and mapped to the unarmed template, ensuring import-ready combat technique values.

## Functional Requirements
- Extend parser model to capture:
  - Weapon entries (name, AT, PA, TP, RW, raw fallback).
  - Armor descriptor (RS, BE, description text, raw fallback).
- Update parser logic to identify weapon lines and RS/BE blocks across sample formatting patterns.
- Resolver enhancements:
  - Lookup weapon names to Optolith dataset IDs, inferring associated combat techniques.
  - Map armor descriptions when RS > 0; derive BE from dataset if omitted.
  - Record unresolved weapons/armor with warning metadata.
- Exporter updates:
  - Populate Optolith `belongings` (weapons, armor) with resolved data.
  - Include raw notes or warnings when equipment cannot be mapped.
- Cache schema bump to store equipment and new warnings in recent conversion history, clearing incompatible cache entries.

## Technical Constraints
- Maintain browser-only storage; IndexedDB/localStorage cache must handle schema versioning.
- Respect existing Optolith dataset structure; use `planning/intake/specs/examples/json-schema/*.json` as canonical examples (`Deidre-Ardan`, `Goswin-Parchenter`, `Nyrociel`).
- Ensure strict TypeScript model updates propagate through parser/resolver/exporter without `any` escapes.

## Acceptance Criteria (High-Level)
- Given a stat block with weapon lines, when a conversion completes, the exported JSON contains corresponding weapon items with inferred combat techniques and Optolith IDs.
- Given a stat block with armor description, when a conversion completes, the armor is represented in the export with RS/BE matching the dataset (or warning if mismatch).
- Given an unknown weapon or armor, the converter surfaces a resolver warning and preserves raw text in notes.
- Given recent conversions cache schema update, when old entries are encountered, the controller clears/repairs history to avoid stale structures.

## Risks & Assumptions
- Optolith dataset may not contain every adventure weapon; expect unresolved warnings for exotic items.
- Stat block formatting variations might require iterative parser refinement; initial implementation should be resilient to line wrapping.
- Derived BE values assume dataset accuracy; mismatch handling must not block conversion.

## Open Questions
- Should equipment stats be displayed in the converter UI for quick validation?
- Do we need override hooks for adventures that rename standard weapons (e.g. custom enchantments)?
- How should we handle weapon talents when multiple techniques could apply (e.g. improvised weapons)?

## Attachments
- Sample stat blocks: `planning/intake/specs/examples/dsa5-optolith-sample-stat-blocks.md`
- Optolith schema references with equipment:  
  `planning/intake/specs/examples/json-schema/Deidre-Ardan.json`  
  `planning/intake/specs/examples/json-schema/Goswin-Parchenter.json`  
  `planning/intake/specs/examples/json-schema/Nyrociel.json`
