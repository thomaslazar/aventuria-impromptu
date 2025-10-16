# Intake Assets

Use this directory to store binary or structured reference data tied to intake specs (e.g. Optolith exports, CSV inventories). Keep filenames descriptive and note the source inside the paired spec or PO notes.

Guidelines:
- Place large attachments in a nested subfolder named after the spec (`dsa5-optolith-converter/optolith-data-<version>.zip`).
- Include a short plaintext `ABOUT.txt` or similar if licensing or provenance details are relevant.
- Do not commit personal data; scrub or anonymise artifacts before adding them.

For the DSA5 → Optolith NPC Converter work, drop the Optolith data ZIP under:
`agents/project-planning/intake/assets/dsa5-optolith-converter/optolith-data.zip`

Agents can reference the asset path from specs and runs without duplicating the archive.
