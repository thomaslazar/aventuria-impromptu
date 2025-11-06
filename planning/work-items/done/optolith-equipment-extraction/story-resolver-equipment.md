# Story OPT-Equip-002 — Resolve Equipment to Optolith Dataset

## Context
- Spec: `planning/intake/specs/optolith-equipment-extraction.md`
- Depends on Story OPT-Equip-001.

## Description
As a converter maintainer I want parsed weapons and armor resolved against the Optolith dataset so export data references canonical IDs and combat techniques.

## Acceptance Criteria
| Criterion | Gherkin phrasing | Status |
| --- | --- | --- |
| AC1 | Given parsed weapon entries When the resolver runs Then matching Optolith IDs and combat techniques are assigned or warnings recorded | done |
| AC2 | Given parsed armor entries with RS/BE When the resolver runs Then armor is matched to the dataset (including derived BE) or unresolved warnings are emitted | done |
| AC3 | Given “Waffenlos” and unmapped weapons When the resolver runs Then the unarmed template or warning metadata is produced accordingly | done |
| AC4 | Given resolver output When exported warnings are aggregated Then unique warning keys (e.g. Messerstecher) reflect actual list size | done |

## Dependencies
- Parser enhancements (Story OPT-Equip-001).
- Optolith dataset lookups (advantages/combat techniques/equipment).

## Notes
- Update `src/services/optolith/resolver.ts`, extend lookup utilities, add TypeScript guardrails.
- Reference Optolith schema examples (`Deidre-Ardan.json`, `Goswin-Parchenter.json`, `Nyrociel.json`).
- Produce localized warnings for unknown equipment and RS/BE mismatches.
- QA: add manual regression checklist entries for weapon talent mapping and armor resolution when moving to `in-progress`.
- Groomed 2025-10-22 (ref: `planning/runs/2025-10-22T12-00-00-weapon-armor-grooming/grooming-2025-10-22T12-00-00.md`).
