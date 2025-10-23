# Grooming Session Playbook

## Purpose
Provide a repeatable structure for backlog grooming sessions regardless of the feature area in focus. Facilitates consistent documentation and stakeholder alignment.

## Preparation Checklist
- Confirm target backlog items and ensure stories are accessible to participants.
- Sync with the Product Owner and maintainer to scope conversation goals.
- Gather recent artefacts (run summaries, specs, sample data, manifests).
- Seed grooming file name using `grooming-<YYYY-MM-DDTHH-mm-ss>.md` (UTC timestamp).
- Invite roles: facilitator (Scrum Master or maintainer), Product Owner, Developer(s), QA; expand as needed.

## Suggested Agenda (45 minutes)
1. **Kickoff (5 min)** – Facilitator confirms scope, desired outcomes, timeboxes.
2. **Story Review (25 min)** – Iterate through backlog items; capture findings round-robin per participant.
3. **Action Items (10 min)** – Identify updates to stories, dependencies, follow-ups.
4. **Wrap-up (5 min)** – Confirm owners, deadlines, next grooming checkpoint.

## Recording Template
```
# Grooming Notes — <YYYY-MM-DD> <Focus>
Participants:
- Facilitator (Scrum Master or maintainer)
- Product Owner (scope)
- Developer A (focus)
- Developer B (focus)
- QA Agent (testing)
- [Optional roles]

Backlog Under Review:
- <Story ID/Title>

Rounds:
1. <Role>: <feedback/action>
...

Action Items:
- <Owner> – <Task>

Follow-Up:
- <Planned check-in or dependency>
```

## Best Practices
- Encourage concise, actionable feedback; avoid design deep-dives unless scoped.
- Use consistent terminology from stories/specs to reduce translation errors.
- Document any required story updates immediately after session.
- Capture timestamps automatically via filename; note if multiple sessions occur same day.
- Rotate developer/QA perspectives to maintain coverage across domains.

## Post-Session Tasks
- Update backlog stories with agreed acceptance criteria or notes.
- Commit grooming notes with timestamped filename.
- Notify stakeholders of decisions and next steps.
- Schedule next grooming if dependencies remain unresolved.
