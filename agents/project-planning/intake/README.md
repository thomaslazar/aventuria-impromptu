# Intake

Drop raw material for upcoming work here so agents can pick it up without searching the repo.

- `raw/`: Dump unstructured briefs (interview notes, chatbot dumps). Keep the original text, then add a short `## PO Notes` section with next steps.
- `specs/`: Authoritative product requirements. Use the `templates/spec.md` skeleton and include context, goals, non-goals, and acceptance conditions.
- `questions/`: Clarifications awaiting product owner responses. Group follow-up notes by spec and remove the file once resolved.

Keep specs immutable once an agent starts a run. Add deltas at the bottom under a `## Updates` heading to preserve history.
