## ungavik, die Vielfache Zunge

special abilities do not use comma to separate between them but "• " instead. looks like bullet point list. can you make it so this and similar also work as separator? 

- ✅ Parser now treats bullet characters (•, ●, etc.) as list delimiters, so Ungavik’s Sonderfertigkeiten split correctly.

## Phanta

scripts nein, means no scripts, so it can be interpreted as empty or - entry. 

- ✅ `nein` (and similar markers) are now filtered during list sanitization, so empty script sections no longer leave stray entries.

## Khydaka Eisblüte

- [Resolver] scripts: unverarbeitet "Isdiraund Asdharia-Zeichen" <- you sanatise away the - in "Schriften: Isdira- und Asdharia-Zeichen" which results in an issue with mapping here. but the script is actually called "Isdira- und Asdharia-Zeichen". please make sure this works. 

- ✅ Hyphenated script names keep their spacing, and an explicit override maps `Isdira- und Asdharia-Zeichen` (and variants) to the canonical Optolith entry.

## Ryosho Lebensfänger

same issue as Khydaka Eisblüte

the stat block mentions Leichte Shakagra-Platte and leichte Shakagra-Plattenrüstung which is the same. Platte should be interpreted as Plattenrüstung. But you already interpreted it in this statblock so the second owe could be ignored.

- ✅ Same script override fixes Ryosho’s entries, and equipment normalization now rewrites “Leichte Shakagra-Platte” to “Leichte Shakagra-Plattenrüstung” to avoid duplicate warnings.

## Krakenmolch

same issue as ungavik, die Vielfache Zunge.

"Willenskraft 4 (15/13/8)" the part in () is actually the values of the attributes for this talent roll. but as we have attributes in this stat block we can ignore this for now.  

- ✅ Bullet delimiters now split its lists correctly, and talent parsing ignores trailing attribute annotations such as `(15/13/8)`.

## Madalieb von Bilsbrück

- talents: Talent konnte nicht interpretiert werden: "Bekehren & Überzeugen8"
- talents: Talent konnte nicht interpretiert werden: "Einschüchtern14"

the talent value is smushed together with the talent name. can you handle that issue? 

- ✅ Talent parsing now inserts missing spaces and accepts trailing annotations, so “Bekehren & Überzeugen8”, “Einschüchtern14”, and “Willenskraft 4 (15/13/8)” are interpreted correctly.
- ✅ Language overrides map `Oloargh` to the Optolith `Oloarkh` entry.

## Dhar’ylil Tanzt-im-Blut

- equipment: Ausrüstungseintrag "Shakagra-Hammer" wurde als "Hammer" interpretiert (Teilbegriff "Hammer").
- weapons: Waffe "Shakara-Hammer" wurde als "Hammer" interpretiert (Teilbegriff "Hammer").
- weapons: Waffe "Shakara-Hammer" enthält keine Kampftechnik im Datensatz.

This interpretation towards "Hammer" here results in a non-weapon entry. Which is wrong here. If it is about weapons, "Hammer" should be interpreted as the weapon "Kriegshammer"

- ✅ Weapon lookup now aliases “Shakara-Hammer” to the canonical “Kriegshammer”, preventing fallback warnings and ensuring the correct combat technique is applied.
