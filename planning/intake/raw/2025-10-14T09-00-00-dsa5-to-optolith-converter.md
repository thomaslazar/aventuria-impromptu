
# DSA5 → Optolith NPC Converter
## Status
- Spec: Draft
- Linked spec: `planning/intake/specs/dsa5-optolith-converter.md`

## PO Notes
- Captured the available summary, goals, and non-goals in the linked spec; awaiting the full detailed specification referenced but not included here.
- Optolith data ZIP remains staged under `planning/intake/assets/dsa5-optolith-converter/optolith-data.zip`. Engineering must build an extraction pipeline that converts the archive into an internal dataset the app can consume without redistributing the original ZIP.
- Open questions cover delivery format, Optolith schema version targeting, priority adventure coverage, and data-pack update cadence—need follow-up with stakeholders or source document.
- Ready for clarification pass before promoting to `Spec Ready`.

## Product Specification (v1.0)

### 1) Summary
Build a tool that converts **DSA5 adventure stat blocks** (plain text) into **import-ready Optolith Hero JSON** (single hero/NPC).
The tool accepts an **Optolith DSA5 Data ZIP** (extracted from the app’s `.asar`) as input to an extraction step that produces an internal, license-compliant dataset used at runtime to resolve canonical IDs for talents, combat techniques, advantages, disadvantages, special abilities (including select options), languages, scripts, liturgies, blessings, item templates, social statuses, etc.

It enforces **faithful mapping and normalization rules**, computes certain **inferred values** (e.g., deducing CT from AT using MU-based bonus), and **preserves narrative** text safely.

---

## 2) Goals & Non-Goals

### Goals
- Parse DSA5 stat block text (German) into structured internal model.
- Resolve all rules objects using IDs from a **user-supplied Optolith DB ZIP**.
- Output a **valid single-hero Optolith JSON** (no arrays/markdown).
- Apply rule-based normalization (e.g., **Tradition (God)** → **Tradition (Godkirche)** for clerics).
- Handle **tiered/leveled** SAs/Disads via roman numerals.
- Fill **languages/scripts** via SA_29/SA_27; **Fertigkeitsspezialisierung** via SA_9 with `sid`/`sid2`.
- **Auto-fill standard blessings** when only a count is provided.
- Capture non-mappable narrative into safe notes **without breaking import**.

### Non-Goals
- No calculation of derived pools/boxes (LeP/AsP/KaP totals, INI strings, movement): **Optolith derives them**.
- No multi-hero containers; each output is a **single** hero object.
- No translation/localization of stat block language (expects German text).

---

## 3) Personas & Primary Use Cases
... (The full specification continues, identical to the detailed description provided in the chat above.)
