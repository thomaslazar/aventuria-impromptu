# 📘 DSA Namens-JSON Parsing-Regelwerk (Finale Version)

> **Dieses Regelwerk beschreibt vollständig, wie ChatGPT neue DSA-Namensregionen in dein JSON-Schema konvertieren muss.  
> Es basiert auf ALLEN bisher erstellten JSON-Dateien und gleicht alle Unterschiede an.**

---

## #️⃣ 1. Ziel
Wenn ich dir einen Textabschnitt aus *Aventurische Namen* gebe, sollst du daraus eine **komplette JSON-Datei** im folgenden Schema erzeugen — **ohne Hardcoding**, mit **generischen Platzhaltern**, **Suffix- und Partikel-Systemen**, und **allen abgeleiteten Namensregeln**.

---

## #️⃣ 2. JSON-Hauptschema

Jede Datei folgt dieser Struktur, das Schema sollte eingehalten werden, wenn es aber zu rigide ist, dann kann es, nach Rücksprache, erweitert werden:

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

## #️⃣ 3. Grundprinzip: KEIN HARDCODING

Du darfst **niemals** feste Wörter wie:

- „von“
- „ya“
- „di“
- „us“
- „a“
- „-ius“
- „von den“
- „…Leute“

direkt in ein Template schreiben.

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

Feste Wortteile wie „von“, „ya“, „ter“, Suffixe wie „-us“, „-a“ oder Plurale wie „-n“, „-ier“ werden **immer** über `particles` und `transforms` gesteuert, nie direkt im Template.

---

## #️⃣ 4. Partikel-System

Du verwendest IMMER diese Kategorien:

| Kategorie       | Beispiele                  | Verwendung                  |
|-----------------|---------------------------|-----------------------------|
| **noble**       | von, ya                   | echter Adel                 |
| **pseudo_noble**| di, da, de, della, ay, ash| bürgerlich-dekorativ        |
| **regional**    | ter                       | regionale Varianten         |
| **patrician**   | von den                   | bosparanische Geschlechter  |
| **generic**     | ibn, saba, brai, bren, dur| patronymisch, schamanisch   |

Alle diese Partikel liegen in:

```json
"particles": {
  "noble": [],
  "pseudo_noble": [],
  "regional": [],
  "patrician": [],
  "generic": []
}
```

Wenn ein Pattern eine bestimmte Partikelart nutzt, definierst du:

```json
"allowed_noble_particles": [],
"allowed_pseudo_noble_particles": [],
"allowed_regional_particles": [],
"allowed_patrician_particles": [],
"allowed_generic_particles": []
```

Beispiele:

```json
{
  "id": "noble_m_core",
  "template": "{given_m} {noble_particle} {noble_core}",
  "usage": ["noble"],
  "allowed_noble_particles": ["ya", "von"]
}
```

```json
{
  "id": "pseudo_common_m",
  "template": "{given_m} {pseudo_noble_particle} {surname}",
  "usage": ["common", "pseudo_noble"],
  "allowed_pseudo_noble_particles": ["di", "de", "da", "della", "delli", "ash", "ay"]
}
```

---

## #️⃣ 5. Transformations-System

### 5.1 Diminutives

Wenn im Text Kurzformen / Kosenamen erwähnt werden, z. B.:

> Asmodena (Asma), Celissa (Lissa)

Dann:

- `transforms.diminutives.female_suffixes` / `male_suffixes` können generelle Kose-Suffixe enthalten (falls im Text explicit genannt)
- Konkrete Kurzformen kommen nach:

```json
"given_diminutives_f": {
  "Asmodena": ["Asma"],
  "Celissa": ["Lissa"]
}
```

---

### 5.2 Herkunftssuffixe („aus X“ → Xus/Xa)

Wenn der Text beschreibt, dass Herkunftsnamen mit Suffixen gebildet werden (z. B. Bosparan → Bosparanius / Ragathium → Ragathia), dann:

```json
"transforms": {
  "origin": {
    "male_suffixes": ["us", "ius"],
    "female_suffixes": ["a", "ia"]
  }
}
```

Patterns verwenden diese Suffixe NICHT hart, sondern via Platzhalter:

```json
{
  "id": "origin_m",
  "template": "{given_m} {place}{origin_suffix_m}",
  "usage": ["origin", "common"]
}
```

```json
{
  "id": "origin_f",
  "template": "{given_f} {place}{origin_suffix_f}",
  "usage": ["origin", "common"]
}
```

---

### 5.3 Bosparanisierung

Wenn im Text steht, dass Namen „bosparanisiert“ werden können, z. B. durch typische Endungen:

```json
"bosparanization": {
  "male_suffixes": ["us", "ius"],
  "female_suffixes": ["a", "ea"]
}
```

Dann verwendest du:

```json
{
  "id": "bosparanized_m",
  "template": "{given_m}{bosparan_suffix_m}",
  "usage": ["bosparanized", "common"]
}
```

```json
{
  "id": "bosparanized_f",
  "template": "{given_f}{bosparan_suffix_f}",
  "usage": ["bosparanized", "common"]
}
```

---

### 5.4 Patrizierpluralsuffix

Für Geschlechter wie „Cervilier“ → „von den Cerviliern“:

```json
"patrician_plural_suffix": "n"
```

Und das Pattern nutzt es so:

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

**Beispiele:**

### Aranien
- männlich: `{given_m} ibn {given_m}`
- weiblich: `{given_f} saba {given_f}` oder `{given_f} {given_f}{matronymic_suffix}` (z. B. „-sunni“, „-sunya“)

### Ferkina
- männlich: `{given_m} iban {given_m}`
- weiblich: `{given_f} sabu {given_m}` (immer Vater als namensgebende Bezugsperson)

### Gjalsker
- männlich: `{given_m} bren {given_m}` (Sohn des)
- weiblich: `{given_f} brai {given_f}` (Tochter der)

### Schamanen (Gjalsker)
- `{given} dur {given}` (Hüter des Geistes von …)

Diese Partikel liegen im JSON unter:

```json
"particles": {
  "generic": ["iban", "sabu", "bren", "brai", "dur"]
}
```

Patterns definieren den erlaubten Partikel:

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

```json
{
  "id": "shaman_dur",
  "template": "{given_m} {generic_particle} {given_m}",
  "usage": ["shaman", "common"],
  "allowed_generic_particles": ["dur"]
}
```

---

## #️⃣ 7. `name_patterns`: IDs & Usage

JEDES Pattern in `name_patterns` hat:

- eine **eindeutige `id`** (String)
- ein **`template`**
- ein **`usage`-Array** mit einem oder mehreren Tags wie z. B.:
  - `"common"`, `"noble"`, `"pseudo_noble"`, `"regional"`,  
    `"origin"`, `"bosparanized"`, `"patrician"`, `"byname"`, `"tribal"`, `"patronymic"`, `"shaman"`

Beispiel:

```json
{
  "id": "common_f_1",
  "template": "{given_f}",
  "usage": ["common"]
}
```

```json
{
  "id": "noble_m_core",
  "template": "{given_m} {noble_particle} {noble_core}",
  "usage": ["noble"],
  "allowed_noble_particles": ["ya"]
}
```

```json
{
  "id": "byname_m",
  "template": "{given_m} {byname_article_m} {byname}",
  "usage": ["byname", "common"]
}
```

---

## #️⃣ 8. `pattern_weights`: IDs referenzieren

Im Objekt `pattern_weights` verwendest du IMMER die `id` der Pattern als Schlüssel.

Beispiel:

```json
"pattern_weights": {
  "common_f_1": 6,
  "common_f_2": 3,
  "common_f_3": 1,
  "common_m_1": 6,
  "common_m_2": 3,
  "common_m_3": 1,
  "common_f_surname": 4,
  "common_m_surname": 4,
  "origin_f": 3,
  "origin_m": 3,
  "byname_f": 2,
  "byname_m": 2
}
```

- **Jedes Pattern in `name_patterns` sollte idealerweise einen Eintrag im `pattern_weights` haben.**
- Die Gewichte steuern die relative Häufigkeit.

---

## #️⃣ 9. Namensmuster (wichtige Standard-Patterns)

Mindestens diese Namensarten solltest du modellieren, wenn sie zur Region passen:

### 9.1 Einfache Namen

```json
{ "id": "common_f_1", "template": "{given_f}", "usage": ["common"] }
{ "id": "common_m_1", "template": "{given_m}", "usage": ["common"] }
```

### 9.2 Mehrere Vornamen

```json
{ "id": "common_f_2", "template": "{given_f} {given_f}", "usage": ["common"] }
{ "id": "common_f_3", "template": "{given_f} {given_f} {given_f}", "usage": ["common"] }
```

### 9.3 Mit Nachnamen

```json
{ "id": "common_f_surname", "template": "{given_f} {surname}", "usage": ["common"] }
{ "id": "common_m_surname", "template": "{given_m} {surname}", "usage": ["common"] }
```

### 9.4 Adel ohne Partikel

```json
{ "id": "noble_f_name", "template": "{given_f} {noble_name}", "usage": ["noble"] }
```

### 9.5 Adel mit Partikel

```json
{
  "id": "noble_m_core",
  "template": "{given_m} {noble_particle} {noble_core}",
  "usage": ["noble"],
  "allowed_noble_particles": ["ya", "von"]
}
```

### 9.6 Pseudo-adelige Bürger

```json
{
  "id": "pseudo_common_m",
  "template": "{given_m} {pseudo_noble_particle} {surname}",
  "usage": ["pseudo_noble", "common"],
  "allowed_pseudo_noble_particles": ["di", "de", "da", "della", "delli"]
}
```

### 9.7 Regionale Partikel

```json
{
  "id": "regional_ter_m",
  "template": "{given_m} {regional_particle} {surname}",
  "usage": ["regional", "common"],
  "allowed_regional_particles": ["ter"]
}
```

### 9.8 Herkunftsnamen

```json
{
  "id": "origin_m",
  "template": "{given_m} {place}{origin_suffix_m}",
  "usage": ["origin", "common"]
}
```

### 9.9 Bosparanisierung (optional)

```json
{
  "id": "bosparanized_m",
  "template": "{given_m}{bosparan_suffix_m}",
  "usage": ["bosparanized", "common"]
}
```

### 9.10 Beinamen

```json
{
  "id": "byname_m",
  "template": "{given_m} {byname_article_m} {byname}",
  "usage": ["byname", "common"]
}
```

### 9.11 Stammesnamen (falls vorhanden)

```json
{
  "id": "tribal_m",
  "template": "{given_m} {tribe}",
  "usage": ["tribal", "common"]
}
```

---

## #️⃣ 10. Lexikon-Auswertung

Alle im Text gelisteten Inhalte müssen extrahiert werden:

- `given_f`: alle weiblichen Vornamen
- `given_m`: alle männlichen Vornamen
- `surnames`: Familiennamen / Nachnamen
- `noble_names`: vollständige Adelsnamen (inkl. Partikel, falls im Fließtext)
- `noble_cores`: Nur der Kernteil (z. B. „Costermana“, ohne „ya“)
- `patrician_names`: z. B. „Cervilier“
- `places`: Ortsnamen (für Herkunftsnamen)
- `bynames`: Beinamen ohne Artikel (z. B. „Stolze“, „Kurze“)
- `byname_articles_f/m`: z. B. `["die"]`, `["der"]`
- `given_diminutives_*`: Mapping Vollname → Kurzform(en)
- `status_suffix_*`: z. B. „Maior“, „Minor“, „Maiora“, „Minora“
- `tribes`, `sippen`, `honorifics`: falls im Text vorkommend
- `raw_text`: Kurzbeschreibung oder Originalzusammenfassung

---

## #️⃣ 11. Ausgabeformat

- Gib **immer genau eine vollständige JSON-Struktur** zurück.
- Nutze einen ` ```json `-Codeblock.
- Keine zusätzlichen Kommentare oder Erklärungen im gleichen Codeblock.
- Erklärungen (falls nötig) NUR außerhalb des Codeblocks.

---

## #️⃣ 12. Was du NIEMALS tun darfst

❌ Partikel hart in Templates einbauen  
❌ Suffixe hart in Templates einbauen  
❌ Namen erfinden oder verändern  
❌ Listen kürzen  
❌ Struktur des JSON-Schemas verändern  
❌ IDs in `pattern_weights` verwenden, die es in `name_patterns` nicht gibt (oder umgekehrt)

---

## #️⃣ 13. Was du IMMER tun musst

✔ generische Platzhalter (`{…}`) für Partikel und Suffixe verwenden  
✔ Suffixe und Plurale ausschließlich über `transforms` steuern  
✔ Partikel ausschließlich über `particles` + `allowed_*`-Felder nutzen  
✔ JEDES Pattern mit `id`, `template`, `usage` anlegen  
✔ `pattern_weights`-Schlüssel entsprechen **immer** Pattern-IDs  
✔ alle Namen und Listen vollständig übernehmen  
✔ `raw_text` mit einer kurzen Zusammenfassung befüllen  

---

## 🧪 Beispiel: Vollständiges JSON für eine fiktive Kultur

Das folgende Beispiel zeigt eine **vollständig ausgearbeitete** JSON-Datei für eine fiktive Kultur `"Beispielreich"`.  
Sie demonstriert:

- `name_patterns` mit `id`, `template`, `usage`
- `pattern_weights`, die sich auf diese IDs beziehen
- Partikel-Kategorien
- Herkunftssuffixe
- Beinamen mit Artikeln
- Diminutiv-Mappings

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
      "note": "Dieses JSON dient als Demonstration des Schemas."
    }
  },
  "rules": {
    "gender_modes": ["female", "male"],
    "name_patterns": [
      {
        "id": "common_f_1",
        "template": "{given_f}",
        "usage": ["common"]
      },
      {
        "id": "common_f_surname",
        "template": "{given_f} {surname}",
        "usage": ["common"]
      },
      {
        "id": "common_m_1",
        "template": "{given_m}",
        "usage": ["common"]
      },
      {
        "id": "common_m_surname",
        "template": "{given_m} {surname}",
        "usage": ["common"]
      },
      {
        "id": "origin_f",
        "template": "{given_f} {place}{origin_suffix_f}",
        "usage": ["origin", "common"]
      },
      {
        "id": "origin_m",
        "template": "{given_m} {place}{origin_suffix_m}",
        "usage": ["origin", "common"]
      },
      {
        "id": "byname_f",
        "template": "{given_f} {byname_article_f} {byname}",
        "usage": ["byname", "common"]
      },
      {
        "id": "byname_m",
        "template": "{given_m} {byname_article_m} {byname}",
        "usage": ["byname", "common"]
      },
      {
        "id": "noble_m_core",
        "template": "{given_m} {noble_particle} {noble_core}",
        "usage": ["noble"],
        "allowed_noble_particles": ["von"]
      }
    ],
    "pattern_weights": {
      "common_f_1": 6,
      "common_f_surname": 4,
      "common_m_1": 6,
      "common_m_surname": 4,
      "origin_f": 2,
      "origin_m": 2,
      "byname_f": 1,
      "byname_m": 1,
      "noble_m_core": 1
    },
    "particles": {
      "noble": [
        "von"
      ],
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
        "male_suffixes": ["us"],
        "female_suffixes": ["a"]
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
    "given_f": [
      "Alviera",
      "Bellana",
      "Cirella"
    ],
    "given_m": [
      "Alvian",
      "Bellinor",
      "Cirodan"
    ],
    "surnames": [
      "Eichenthal",
      "Falkenstrohm",
      "Greifenfurt"
    ],
    "places": [
      "Beispel",
      "Testoria"
    ],
    "patrician_names": [],
    "noble_names": [],
    "noble_cores": [
      "Testenberg"
    ],
    "bynames": [
      "Stolze",
      "Kluge",
      "Raue"
    ],
    "byname_articles_f": [
      "die"
    ],
    "byname_articles_m": [
      "der"
    ],
    "given_diminutives_f": {
      "Alviera": [
        "Alvi"
      ]
    },
    "given_diminutives_m": {
      "Cirodan": [
        "Ciro"
      ]
    },
    "status_suffix_f": [],
    "status_suffix_m": [],
    "tribes": [],
    "sippen": [],
    "honorifics": [],
    "raw_text": "Fiktive Beispielregion mit einfachen Vornamen, Familiennamen, Herkunftsnamen und Beinamen."
  }
}
```

---

## ✔️ Fertig.
Dieses Regelwerk ist vollständig und bereit für Copy/Paste in einen neuen Chat.  
Wenn du mir im neuen Chat einen Abschnitt aus *Aventurische Namen* gibst, wende ich GENAU diese Regeln an und liefere dir ein JSON nach diesem Schema. 
