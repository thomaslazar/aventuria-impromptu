## Gerion Mtoto

- [Parser] talents: Abschnitt "talents" nicht gefunden. <- the talents are actually found in the middle of the line "Sonderfertigkeiten: Finte I (Waffenlos, Haumesser), Geländekunde (Dschungelkundig), Ortskenntnis (Östliches Altoum), Verbessertes Ausweichen I Talente: Fährtensuchen 8, Fesseln 8, Klettern 7, Kör- perbeherrschung 5, Kraftakt 5, Menschenkenntnis 6, Orientierung 10, Schwimmen 4, Selbstbeherrschung 6, Sinnesschärfe 8, Überreden 6, Verbergen 7, Wild- nisleben 9, Willenskraft 2"

is there a way to make talent parsing more resilient? so it doesn't rely on a "Talente:" block to find out that there are talents? couldn't you just look for all talents in the whole stat block and when you find them, parse them? 

- ✅ Parser now honors inline `Talente:` markers embedded inside other sections (e.g. at the tail of `Sonderfertigkeiten`), so Gerion’s block no longer triggers a missing-section warning and the talents continue to be parsed.

## Nepi-Luhan

- combatSpecialAbilities: Eintrag "Präziser Schuss/Wurf I (Blasrohr)" enthielt "oder"; alle Varianten wurden übernommen. <- this is not correct. "Präziser Schuss/Wurf" is a dedicated special ability. you should do the oder parsing after you made sure you didn't already find it as exact special ability

- ✅ Resolver now attempts an exact lookup before splitting entries on "oder"/"/", so canonical abilities such as "Präziser Schuss/Wurf" stay intact and no longer generate duplicate warnings.

## Schamane

has KaP but no corresponding special ability Tradition and also not an advantage that would give KaP like Geweihter. Give a warning for this similar to the Zauberer, AsP and Tradition thing. 

- ✅ Added a Karma check: stat blocks that list KaP but neither a Tradition special ability nor the Geweihter advantage now emit a dedicated warning to prompt adding the missing Tradition.

## Djer’kem (Kemi-Späher)

- specialAbilities: Eintrag "Präziser Schuss/Wurf I+II (Kurzbogen)" enthielt "oder"; alle Varianten wurden übernommen. <- same issue as with Nepi-Luhan

- ✅ Exact-match-before-split logic fixes this entry as well; the resolver now keeps the combined ability untouched and avoids redundant warnings.

## Stammeskrieger der Keke-Wanaq

- specialAbilities: Eintrag "Präziser Schuss/Wurf I (Blasrohr, Kurzbogen)" enthielt "oder"; alle Varianten wurden übernommen. <- same issue as with Nepi-Luhan. probably compounded due to Blasrohr, Kurzbogen, which are irrelevant for this special ability.

- ✅ Same slash-handling fix prevents the Stammeskrieger abilities from being split; only the legitimate weapon options remain.
