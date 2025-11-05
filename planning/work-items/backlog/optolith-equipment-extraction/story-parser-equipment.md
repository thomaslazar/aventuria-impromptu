# Story OPT-Equip-001 — Parse Weapons & Armor

## Context
- Spec: `planning/intake/specs/optolith-equipment-extraction.md`
- Focus: Extend parser model to capture equipment data.

## Description
As a converter maintainer I want the stat block parser to extract weapon and armor details so downstream resolver and exporter stages can operate on structured equipment data.

## Acceptance Criteria
| Criterion | Gherkin phrasing | Status |
| --- | --- | --- |
| AC1 | Given the sample stat blocks When the parser runs Then weapon lines are captured with name, attack/parry, damage, range, and raw text | open |
| AC2 | Given the sample stat blocks When the parser runs Then RS/BE values and optional armor descriptions are captured | open |
| AC3 | Given stat blocks without weapons or armor When the parser runs Then equipment arrays remain empty without throwing | open |
| AC4 | Given the Messerstecher and other samples with line wraps When the parser runs Then multi-line weapon entries are parsed correctly | open |

## Dependencies
- None (first slice of equipment work).

## Notes
- Update parser interfaces in `src/services/optolith/statBlockParser.ts` and related types.
- Add Vitest coverage using samples (`Tauchspeer`, `Blasrohr`, `Haumesser`, `Waffenlos`, RS/BE variations).
- Break implementation into subtasks before starting:
  1. Weapon line extraction (single + multi-line handling).
  2. RS/BE parsing (including parentheses descriptions).
  3. Parser model & serialization updates + test sweep.
- Groomed 2025-10-22 (ref: `planning/runs/2025-10-22T12-00-00-weapon-armor-grooming/grooming-2025-10-22T12-00-00.md`).
