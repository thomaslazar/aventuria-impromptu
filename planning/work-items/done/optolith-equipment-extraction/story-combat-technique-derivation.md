# Story OPT-Equip-004 — Derive Combat Techniques from Weapons

## Context
- Spec lineage: `planning/intake/specs/optolith-equipment-extraction.md`
- Follows stories OPT-Equip-001..003 (parser, resolver, exporter equipment).

## Description
As a converter maintainer I want the converter to infer combat technique base values from the parsed weapons so exported Optolith JSON exposes consistent `ct` ratings even when the source stat block only lists AT/PA/FK numbers.

## Acceptance Criteria
| Criterion | Gherkin phrasing | Status |
| --- | --- | --- |
| AC1 | Given a melee weapon entry with AT/PA When the converter processes the stat block Then the originating combat technique value is derived by removing MU-based modifiers and item bonuses/penalties | open |
| AC2 | Given a ranged weapon entry with FK When the converter processes the stat block Then the combat technique value is derived by removing FF-based modifiers and item adjustments | open |
| AC3 | Given unarmed attacks (“Waffenlos”) When the converter processes the stat block Then the combat technique `CT_9` (Raufen) is populated with the inferred value | open |
| AC4 | Given multiple weapons mapping to the same combat technique When their derived values differ Then the converter keeps the highest inferred combat technique score and logs exporter warnings for inconsistent inputs | open |
| AC5 | Given derived combat techniques When the Optolith export is generated Then the `hero.ct` map contains the computed values (even if they were absent in the original stat block) | open |
| AC6 | Given derived combat techniques and weapons When the Optolith JSON is imported Then the `belongings` entries include the full template payload (weight, price, modifiers, etc.) so the Optolith desktop app matches the in-app re-addition | open |

## Domain Rules
- Base combat technique starts at 6 for every character (per DSA5).
- Attack modifiers: +1 AT for every full 3 MU above 8 (MU ≤ 10 → +0; 11-13 → +1; 14-16 → +2; 17-19 → +3; etc.).
- Parry modifiers: `floor((CT / 2))` rounded up plus +1 per full 3 points over 8 in the technique’s lead attribute (usually GE or KK).
- Ranged modifiers: +1 FK per full 3 FF above 8.
- Item-specific AT/FK modifiers (e.g., Richtschwert `at: -2`) adjust the observed stat block numbers before comparing with the base CT value.
- Mapping table (non-exhaustive):
  | Combat Technique | Lead Attribute(s) | Dataset ID (examples) |
  | --- | --- | --- |
  | Dolche | GE | `CT_3` |
  | Raufen | GE / KK | `CT_9` |
  | Schwerter | GE / KK | `CT_12` |
  | Zweihandschwerter | KK | `CT_16` |
  | Hiebwaffen | KK | `CT_10` |
  | Wurfwaffen | FF | `CT_8` |
  | Armbrüste | FF | `CT_1` |

## Notes
- Implement helper to enumerate all weapons (including unarmed) and map them to Optolith combat techniques.
- Inference workflow:
  1. Resolve item template and combat technique ID (`resolver` already exposes these).
  2. Remove stat-mod bonuses (MU/FF) and item adjustments to back-solve the base CT.
  3. Clamp to minimum 6 unless evidence supports lower.
  4. Keep highest derived value per technique; emit warning for contradictory data.
- Update exporter to populate `hero.ct` with derived scores while preserving existing defaults and hydrate belongings with the full template metadata rather than minimal references.
- Provide localized warnings when inference is impossible (missing attributes or conflicting modifiers).
- Extend unit tests covering paired AT/FK examples (e.g., Mengbilar, Richtschwert, Schwere Armbrust, Waffenlos).
