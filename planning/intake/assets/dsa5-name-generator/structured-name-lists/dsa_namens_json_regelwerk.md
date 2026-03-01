# 📘 DSA Namens-JSON Parsing-Regelwerk (Aktuelle Version)

> **Dieses Regelwerk beschreibt vollständig, wie ChatGPT neue DSA-Namensregionen in dein JSON-System konvertieren muss.**  
> Es konsolidiert die bisherigen Erkenntnisse und Korrekturen aus allen bis jetzt erstellten JSONs (u. a. Splitting für Adel, Silbenbaukasten, Bühnen-/Künstlernamen, flexible Schema-Erweiterungen nach Rücksprache, Beiname-Splitting bei Maraskan).

---

## #️⃣ 1. Ziel

Wenn ich dir einen Textabschnitt aus *Aventurische Namen* (oder die relevanten PDF-Seiten) gebe, erzeugst du daraus **eine komplette JSON-Datei** nach diesem Regelwerk:

- **kein Hardcoding**
- **generische Platzhalter**
- **Partikel- & Suffix-System**
- **vollständige Lexikon-Extraktion**
- **realistische `pattern_weights`**
- **Silbenbaukasten** (wenn vorhanden) wird extrahiert **und** in Patterns nutzbar gemacht
- Spezialfälle (z. B. Adel-Vornamen, Bühnen-/Künstlernamen) werden **separat** abgebildet, nicht „normalisiert“.

---

## #️⃣ 2. JSON-Hauptschema (Basis)

Jede Datei folgt grundsätzlich dieser Struktur.  
**Wichtig:** Das Schema soll eingehalten werden. Wenn es **zu rigide** ist, darf es **nur nach expliziter Rücksprache** erweitert werden. (Kleinere Erweiterungen als „Spezialfälle“ sind zulässig, wenn sie zwingend sind, aber müssen in `meta.extraction.note` dokumentiert werden.)

```json
{
  "meta": {
    "version": "1.0",
    "source": "VS6 - Aventurische Namen.pdf",
    "culture": "",
    "key": "",
    "extraction": {
      "kind": "chapter",
      "hint": "",
      "note": ""
    }
  },
  "rules": {
    "gender_modes": ["female", "male"],
    "name_patterns": [],
    "pattern_weights": {},
    "particles": {
      "noble": [],
      "pseudo_noble": [],
      "regional": [],
      "patrician": [],
      "generic": []
    },
    "transforms": {
      "diminutives": {
        "female_suffixes": [],
        "male_suffixes": []
      },
      "origin": {
        "male_suffixes": [],
        "female_suffixes": []
      },
      "bosparanization": {
        "male_suffixes": [],
        "female_suffixes": []
      },
      "patrician_plural_suffix": ""
    },
    "patronymic": {
      "enabled": false,
      "male_patterns": [],
      "female_patterns": []
    }
  },
  "lexicon": {
    "given_f": [],
    "given_m": [],
    "surnames": [],
    "places": [],
    "patrician_names": [],
    "noble_names": [],
    "noble_cores": [],
    "bynames": [],
    "byname_articles_f": [],
    "byname_articles_m": [],
    "given_diminutives_f": {},
    "given_diminutives_m": {},
    "status_suffix_f": [],
    "status_suffix_m": [],
    "tribes": [],
    "sippen": [],
    "honorifics": [],
    "raw_text": ""
  }
}
```

---

## #️⃣ 2.1 Erlaubte, dokumentierte Erweiterungen (nur wenn nötig)

### A) Adel-spezifische Vornamen / Zweitnamen (Splitting)
Wenn der Text zwischen „gewöhnlichen“ und „adeligen“ Vor-/Zweitnamen unterscheidet oder die adelige Namensbildung sonst nicht korrekt funktioniert, werden zusätzliche Lexikon-Felder genutzt:

- `noble_given_f`, `noble_given_m` (adelige Vornamen)
- `noble_middle_f`, `noble_middle_m` (adelige Zweitnamen)

**Regel:**  
- Normale Leute → `given_*` + `surnames`  
- Adel → `noble_given_*` / `noble_middle_*` + `noble_names` / `noble_cores`  
- Niemals alle Namen stumpf in `given_*` packen, wenn dadurch adelige Patterns kaputtgehen.

> Diese Felder sind eine „Spezialfall-Erweiterung“. Wenn verwendet, muss in `meta.extraction.note` stehen, dass diese Felder genutzt wurden.

### B) Silbenbaukasten / Syllables
Wenn im Text ein Silbenbaukasten vorhanden ist, wird er als `lexicon.syllables` ergänzt (analog zum bestehenden System in `andergast.json`):

```json
"syllables": {
  "given_f": { "prefix": [], "suffix": [] },
  "given_m": { "prefix": [], "suffix": [] },
  "surnames": { "prefix": [], "suffix": [] }
}
```

(Je nach Quelle können nur Teile existieren, z. B. nur `surnames`.)

**Wichtig:**  
- Silben werden vollständig extrahiert.  
- Silbenbaukasten wird zusätzlich in `name_patterns` integriert (siehe Abschnitt 9.12).

### C) Bühnen- & Künstlernamen: Stage-System (Option K3)
Wenn ein Abschnitt explizit Bühnen-/Künstlernamen beschreibt, wird ein zusätzlicher Block genutzt:

```json
"stage": {
  "prefixes": [],
  "suffixes": [],
  "connectors": []
}
```

- `connectors` nur, wenn im Text ausdrücklich Verbindungswörter/Zeichen vorkommen (z. B. Bindestrich-Logik, „der/die“, „von“, etc. – niemals hardcoden, siehe Hardcoding-Regeln).
- Epitheta können weiterhin als `bynames` laufen, sofern es echte Beinamen sind.

### D) Beinamen nach Genus (z. B. Maraskan)
Wenn Beinamen im Text explizit nach Geschlechtern/Neutralformen getrennt sind oder eine Normalisierung grammatikalisch unhandlich wäre:

- `bynames_f`, `bynames_m`, `bynames_n`  
Statt einem einzigen `bynames`.

**Regel:** Nicht normalisieren, wenn dadurch deutsche Grammatik implodiert.  
Wenn trotzdem `bynames` genutzt wird, müssen weibliche und männliche Formen klar unterscheidbar bleiben.

---

## #️⃣ 3. Grundprinzip: KEIN HARDCODING

Du darfst **niemals** feste Wörter oder Endungen direkt in Templates schreiben, wenn sie als Partikel/Suffix systemisch abbildbar sind.

Beispiele für verbotene Hardcodings im Template:

- Partikel: „von“, „ya“, „di“, „ter“, „von den“
- Suffixe: „-us“, „-a“, „-ius“, Plural „-n“, „-ier“
- formelhafte Patronymik-Partikel (ibn, saba, bren, brai, dur)
- Herkunftspartikel, wenn sie als Partikel geführt werden (z. B. „Ni“, „char“, „aus“)

**Verboten (falsch):**

```json
{
  "id": "patrician_f_wrong",
  "template": "{given_f} von den {patrician_name}n",
  "usage": ["patrician"]
}
```

**Erlaubt (richtig):**

```json
{
  "id": "patrician_f",
  "template": "{given_f} {patrician_particle} {patrician_name}{patrician_plural_suffix}",
  "usage": ["patrician"],
  "allowed_patrician_particles": ["von den"]
}
```

**Ausnahme:**  
In sehr wenigen Fällen sind feste Wörter Teil einer **sprachlich unvermeidbaren Konstruktion**, die nicht als Partikel/Suffix modelliert werden kann. Dann ist Rücksprache erforderlich.

---

## #️⃣ 4. Partikel-System

Du verwendest IMMER diese Kategorien:

| Kategorie        | Beispiele                          | Verwendung |
|-----------------|------------------------------------|-----------|
| **noble**        | von, ya, zu, vom                   | echter Adel |
| **pseudo_noble** | di, da, de, della, ay, ash         | bürgerlich-dekorativ |
| **regional**     | ter, aus, Ni, char                 | regionale Varianten / Herkunftsmarker |
| **patrician**    | von den                            | bosparanische Geschlechter |
| **generic**      | ibn, saba, bren, brai, dur, iban   | patronymisch, schamanisch |

Alle Partikel liegen in:

```json
"particles": {
  "noble": [],
  "pseudo_noble": [],
  "regional": [],
  "patrician": [],
  "generic": []
}
```

Wenn ein Pattern eine Partikelart nutzt, definierst du die zulässigen Partikel:

```json
"allowed_noble_particles": [],
"allowed_pseudo_noble_particles": [],
"allowed_regional_particles": [],
"allowed_patrician_particles": [],
"allowed_generic_particles": []
```

Beispiel:

```json
{
  "id": "noble_m_core",
  "template": "{given_m} {noble_particle} {noble_core}",
  "usage": ["noble"],
  "allowed_noble_particles": ["ya", "von"]
}
```

---

## #️⃣ 5. Transformations-System

### 5.1 Diminutives / Kosenamen
Wenn der Text Kurzformen nennt:

- Allgemeine Kose-Suffixe (nur wenn explizit genannt) → `transforms.diminutives.*_suffixes`
- Konkrete Zuordnungen → `lexicon.given_diminutives_*`

```json
"given_diminutives_f": {
  "Asmodena": ["Asma"]
}
```

### 5.2 Herkunftssuffixe (Suffix-basiert, z. B. Xus/Xa)
Wenn der Text Herkunftsnamen über Suffixe bildet:

```json
"origin": {
  "male_suffixes": ["us", "ius"],
  "female_suffixes": ["a", "ia"]
}
```

Pattern:

```json
{
  "id": "origin_m",
  "template": "{given_m} {place}{origin_suffix_m}",
  "usage": ["origin", "common"]
}
```

### 5.3 Bosparanisierung
Wenn im Text „bosparanisiert“:

```json
"bosparanization": {
  "male_suffixes": ["us", "ius"],
  "female_suffixes": ["a", "ea"]
}
```

Pattern:

```json
{
  "id": "bosparanized_m",
  "template": "{given_m}{bosparan_suffix_m}",
  "usage": ["bosparanized", "common"]
}
```

### 5.4 Patrizierpluralsuffix
Wenn Geschlechter pluralisiert werden (z. B. -n):

```json
"patrician_plural_suffix": "n"
```

Pattern:

```json
{
  "id": "patrician_f",
  "template": "{given_f} {patrician_particle} {patrician_name}{patrician_plural_suffix}",
  "usage": ["patrician"],
  "allowed_patrician_particles": ["von den"]
}
```

---

## #️⃣ 6. Patronymische Systeme

Patronymik wird NUR aktiviert, wenn der Text sie explizit beschreibt.

- Aktivierung über `rules.patronymic.enabled = true`
- Partikel gehören in `particles.generic`
- Patterns definieren `allowed_generic_particles`

Beispiele:

```json
{
  "id": "pat_m_iban",
  "template": "{given_m} {generic_particle} {given_m}",
  "usage": ["patronymic", "common"],
  "allowed_generic_particles": ["iban"]
}
```

```json
{
  "id": "pat_f_sabu",
  "template": "{given_f} {generic_particle} {given_m}",
  "usage": ["patronymic", "common"],
  "allowed_generic_particles": ["sabu"]
}
```

---

## #️⃣ 7. `name_patterns`: IDs, Usage und Konsistenz

JEDES Pattern hat:

- eindeutige `id`
- `template`
- `usage` (Array von Tags)

Typische `usage`-Tags:

- `"common"`, `"noble"`, `"pseudo_noble"`, `"regional"`, `"origin"`, `"bosparanized"`,
  `"patrician"`, `"byname"`, `"tribal"`, `"sippe"`, `"patronymic"`, `"shaman"`, `"stage"`

---

## #️⃣ 8. `pattern_weights`

- Schlüssel sind immer Pattern-IDs
- idealerweise hat jedes Pattern ein Gewicht
- realistische Häufigkeit:
  - häufig: 5–8
  - regulär: 3–4
  - selten: 1–2

---

## #️⃣ 9. Standard-Patterns (wenn passend)

### 9.1 Einfache Namen
```json
{ "id": "common_f_single", "template": "{given_f}", "usage": ["common"] }
{ "id": "common_m_single", "template": "{given_m}", "usage": ["common"] }
```

### 9.2 Mehrere Vornamen (nur wenn Kultur es plausibel nutzt)
```json
{ "id": "common_f_double", "template": "{given_f} {given_f}", "usage": ["common"] }
{ "id": "common_m_double", "template": "{given_m} {given_m}", "usage": ["common"] }
```

### 9.3 Mit Familiennamen
```json
{ "id": "common_f_surname", "template": "{given_f} {surname}", "usage": ["common"] }
{ "id": "common_m_surname", "template": "{given_m} {surname}", "usage": ["common"] }
```

### 9.4 Adel (mit Partikel)
```json
{
  "id": "noble_f",
  "template": "{noble_given_f} {noble_particle} {noble_name}",
  "usage": ["noble"],
  "allowed_noble_particles": ["von", "vom", "zu"]
}
```

```json
{
  "id": "noble_m",
  "template": "{noble_given_m} {noble_particle} {noble_name}",
  "usage": ["noble"],
  "allowed_noble_particles": ["von", "vom", "zu"]
}
```

> Falls `noble_given_*` nicht genutzt wird (weil nicht nötig), dann `{given_*}` verwenden.

### 9.5 Pseudo-Adel
```json
{
  "id": "pseudo_m",
  "template": "{given_m} {pseudo_noble_particle} {surname}",
  "usage": ["pseudo_noble", "common"],
  "allowed_pseudo_noble_particles": ["di", "de", "da", "della", "delli", "ash", "ay"]
}
```

### 9.6 Regionale Partikel / Herkunftsmarker
Beispiel (z. B. „aus“, „Ni“, „char“ – je nach Kultur):
```json
{
  "id": "regional_origin_m",
  "template": "{given_m} {regional_particle} {place}",
  "usage": ["origin", "common"],
  "allowed_regional_particles": ["aus"]
}
```

### 9.7 Herkunftssuffix (Suffix-basiert)
```json
{
  "id": "origin_suffix_m",
  "template": "{given_m} {place}{origin_suffix_m}",
  "usage": ["origin", "common"]
}
```

### 9.8 Bosparanisierung
```json
{
  "id": "bosparanized_m",
  "template": "{given_m}{bosparan_suffix_m}",
  "usage": ["bosparanized", "common"]
}
```

### 9.9 Beinamen (klassisch)
```json
{
  "id": "byname_f",
  "template": "{given_f} {byname_article_f} {byname}",
  "usage": ["byname", "common"]
}
```

### 9.10 Sippen-Formel (wenn im Text explizit)
Wenn die Kultur Formeln wie „X aus Y Sippe“ nutzt, muss dies als Pattern modelliert werden, ohne Hardcoding der Partikel:

```json
{
  "id": "sippe_m",
  "template": "{given_m} {regional_particle} der Sippe {sippe}",
  "usage": ["sippe", "common"],
  "allowed_regional_particles": ["aus"]
}
```

> Wenn „der Sippe“ als feste sprachliche Fügung nicht sauber partikelisierbar ist, ist das eine der seltenen Ausnahmen. Dann in `meta.extraction.note` dokumentieren.

### 9.11 Bühnen-/Künstlernamen (Option K3)
Wenn `lexicon.stage` vorhanden ist:

```json
{
  "id": "stage_f",
  "template": "{stage_prefix}{given_f}{stage_suffix}",
  "usage": ["stage", "common"]
}
```

Optional mit Connectors, wenn im Text explizit:

```json
{
  "id": "stage_m_connector",
  "template": "{stage_prefix}{given_m}{stage_connector}{stage_suffix}",
  "usage": ["stage", "common"]
}
```

### 9.12 Silbenbaukasten in Patterns integrieren
Wenn ein Silbenbaukasten für Familiennamen existiert:

```json
{
  "id": "common_m_syllabic_surname",
  "template": "{given_m} {surname_prefix}{surname_suffix}",
  "usage": ["common", "syllabic"]
}
```

Analog für weiblich.

**Wichtig:** Der Silbenbaukasten ersetzt nicht echte `surnames`, sondern ergänzt sie. Beide Patternarten sind zulässig.

---

## #️⃣ 10. Lexikon-Auswertung (vollständig)

Alles, was im Text gelistet ist, muss extrahiert werden – ohne Erfindungen, ohne Umformungen, ohne Kürzen.

- `given_f`, `given_m`: normale Vornamen
- `surnames`: Familiennamen (bei Kulturen ohne Familiennamen bleibt leer)
- `places`: Orte (für Herkunft)
- `noble_names`: Adelsgeschlechter / Adelsnamen
- `noble_cores`: Kernteile für Partikel-Adel
- `patrician_names`: patrizische Geschlechter
- `bynames`: Beinamen **ohne Artikel**
- `byname_articles_f/m`: Artikel getrennt
- `given_diminutives_*`: konkrete Kurzformen
- `status_suffix_*`: Status-/Rangzusätze
- `tribes`, `sippen`, `honorifics`: falls vorhanden
- `raw_text`: kurze Zusammenfassung + ggf. relevante Sprachhinweise

**Spezialfälle:**
- Adel-Splitting: `noble_given_*`, `noble_middle_*`
- Bühnen-/Künstler: `stage.*`
- Silbenbaukasten: `syllables.*`
- Beiname-Splitting: `bynames_f/m/n` (wenn nötig)

---

## #️⃣ 11. Ausgabeformat

- pro Kultur genau **ein vollständiges JSON** im ` ```json ` Codeblock
- zusätzlich immer den **Dateinamen** in Klartext (außerhalb des Codeblocks)
- keine Kommentare im JSON
- Erklärungen (wenn nötig) nur außerhalb des JSON

---

## #️⃣ 12. Was du NIEMALS tun darfst

❌ Partikel hart in Templates einbauen  
❌ Suffixe hart in Templates einbauen  
❌ Namen erfinden, „korrigieren“ oder normalisieren, wenn es die Quelle nicht hergibt  
❌ Listen kürzen oder zusammenfassen  
❌ Schema ohne Rücksprache ändern (Ausnahmen nur als dokumentierte Spezialfälle)  
❌ `pattern_weights`-IDs ohne dazugehörige Patterns (oder umgekehrt)  
❌ männliche/weibliche Beiname-Formen „glattziehen“, wenn Grammatik dadurch kompliziert wird (z. B. Maraskan)

---

## #️⃣ 13. Was du IMMER tun musst

✔ generische Platzhalter (`{...}`) für Partikel und Suffixe verwenden  
✔ Partikel ausschließlich über `particles` + `allowed_*`  
✔ Suffixe/Plural ausschließlich über `transforms`  
✔ Patterns so wählen, dass sie **realistisch klingende Namen** erzeugen  
✔ Adel-spezifische Vornamen getrennt behandeln, wenn sonst Patterns nicht funktionieren  
✔ Silbenbaukasten vollständig extrahieren und **in Patterns nutzbar machen**  
✔ alle im Text gelisteten Namen vollständig übernehmen  
✔ `raw_text` befüllen und Besonderheiten der Namensbildung dokumentieren  
✔ Dateiname immer mitliefern

---

## 🧪 Beispiel (Kurzbeispiel – nur zur Illustration)
Dieses Beispiel ist nur zur Demonstration des Mechanismus (Partikel, Suffixe, Silben, Gewichte) – nicht als harte Vorlage.

```json
{
  "meta": {
    "version": "1.0",
    "source": "VS6 - Aventurische Namen.pdf",
    "culture": "Beispielreich",
    "key": "beispielreich",
    "extraction": {
      "kind": "chapter",
      "hint": "Fiktives Beispielkapitel",
      "note": "Demonstration für Pattern/Weights/Particles/Transforms/Syllables."
    }
  },
  "rules": {
    "gender_modes": ["female", "male"],
    "name_patterns": [
      { "id": "common_f_single", "template": "{given_f}", "usage": ["common"] },
      { "id": "common_m_single", "template": "{given_m}", "usage": ["common"] },
      { "id": "common_f_surname", "template": "{given_f} {surname}", "usage": ["common"] },
      { "id": "common_m_surname", "template": "{given_m} {surname}", "usage": ["common"] },
      { "id": "common_m_syllabic_surname", "template": "{given_m} {surname_prefix}{surname_suffix}", "usage": ["common", "syllabic"] },
      { "id": "noble_m", "template": "{noble_given_m} {noble_particle} {noble_name}", "usage": ["noble"], "allowed_noble_particles": ["von"] }
    ],
    "pattern_weights": {
      "common_f_single": 3,
      "common_m_single": 3,
      "common_f_surname": 6,
      "common_m_surname": 6,
      "common_m_syllabic_surname": 3,
      "noble_m": 2
    },
    "particles": {
      "noble": ["von"],
      "pseudo_noble": [],
      "regional": [],
      "patrician": [],
      "generic": []
    },
    "transforms": {
      "diminutives": { "female_suffixes": [], "male_suffixes": [] },
      "origin": { "male_suffixes": ["us"], "female_suffixes": ["a"] },
      "bosparanization": { "male_suffixes": [], "female_suffixes": [] },
      "patrician_plural_suffix": ""
    },
    "patronymic": { "enabled": false, "male_patterns": [], "female_patterns": [] }
  },
  "lexicon": {
    "given_f": ["Alviera"],
    "given_m": ["Cirodan"],
    "surnames": ["Eichenthal"],
    "places": ["Testoria"],
    "patrician_names": [],
    "noble_names": ["Testenberg"],
    "noble_cores": ["Testenberg"],
    "bynames": [],
    "byname_articles_f": ["die"],
    "byname_articles_m": ["der"],
    "given_diminutives_f": {},
    "given_diminutives_m": {},
    "status_suffix_f": [],
    "status_suffix_m": [],
    "tribes": [],
    "sippen": [],
    "honorifics": [],
    "syllables": {
      "surnames": { "prefix": ["Eich"], "suffix": ["thal"] }
    },
    "raw_text": "Fiktive Beispielregion zur Demonstration."
  }
}
```
