## Schläger

- ✅ Parser now splits comma/“und” separated disadvantage details. `Schlechte Eigenschaft (Goldgier, Jähzorn)` produces two independent entries and both resolve against the canonical disadvantage list.

## Malrizio ya Duridanya

- ✅ Script resolver now rewrites `Isdira`/`Asdharia` to `Isdira- und Asdharia-Zeichen` and `Rogolan` to `Rogolan-Runen`, so the exported JSON references the Optolith IDs.
- ✅ `Schlechte Eigenschaften (Spielsucht, Verschwendungssucht)` is split just like the Schläger fix above.

## Galigoa Ghamotta

- ✅ `Verpflichtungen` details that are not in the canned dropdown (e.g. `Lyceum Azizel`) are now preserved as custom options in the exported JSON. When a detail matches one of the official obligations, the resolver still links it to the canonical option.

## Ildebran Regotis

- ✅ Same handling as above – free-text obligations remain attached to the disadvantage and show up in Optolith’s custom option field.

## Melsine Durenald 

- ✅ The resolver now detects `Begabung` targets for talents, spells, or liturgies. `Begabung (Rechnen)` is exported with a custom option pointing at the Rechnen talent so the selection survives in Optolith.

## Siranya Ager

- ℹ️ The “widersprüchliche Werte” warning comes from the exporter deriving combat technique values from weapon AT/PA to catch inconsistencies. The formula is:
  ```
  abgeleiteter KT-Wert = Waffen-AT − Attributsbonus − Waffenmodifikator
  ```
  For Siranya’s Rapier:
  - reported AT: 15
  - attribute bonus (MU) : +1
  - weapon modifier (Rapier) : 0
  → derived KT value = 14
  
  The extra +1 AT on the weapon stems from `Einhändiger Kampf`, so the mismatch is expected. The exporter still keeps the manual KT value (14) but leaves the warning so users know where the difference originates.

## Bonnaro Glitzerglanz

- ⚠️ The Optolith dataset currently does not expose cantrips/Zaubertricks as a dedicated section, so the converter still cannot emit them. We’ll revisit this once the upstream data includes the necessary references.
- ✅ `Schlechte Angewohnheit (Taktlos)` now keeps the custom detail via the new detail-splitting logic.
- ✅ `Schlechte Eigenschaften (Neugier, Spielsucht)` is covered by the same improvement as Schläger.
- ✅ If a stat block includes AsP or the `Zauberer` advantage but no `Tradition (…)`, the resolver now surfaces a warning reminding the user to add the tradition manually in Optolith.

## Svartjok

- ✅ `-` entries in special abilities (and any other section) are stripped during parsing, so no warnings are emitted.
- ✅ `Lebensmittelverarbeitung` automatically maps to the Optolith talent `Lebensmittelbearbeitung`.
- ✅ `Schlechte Angewohnheit (Leichtgläubig)` is preserved as a custom option via the detail-splitting logic.
