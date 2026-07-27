# Templates

Two distinct kinds of file live here. Don't confuse them.

## Skill output structures

The shape a workflow writes its artifact in. Bracketed values are placeholders to fill, not text
to reproduce — these constrain structure, not content.

| Template | Written by | Artifact |
|----------|-----------|----------|
| [audit-report.md](audit-report.md) | `/arc:audit` | `docs/arc/audits/YYYY-MM-DD-[scope]-audit.md` |
| [refactor-rfc.md](refactor-rfc.md) | `/arc:refactor` | `docs/arc/plans/YYYY-MM-DD-[scope]-refactor-rfc.md` |
| [safety-net.md](safety-net.md) | `/arc:testing` | In-conversation plan and result |

## Legal documents

Boilerplate copied into a user's project by `/arc:launch`, then edited for their specifics.
These are starting drafts, not legal advice.

| Template | Purpose |
|----------|---------|
| [privacy-policy.md](privacy-policy.md) | Privacy policy starting draft |
| [terms-of-service.md](terms-of-service.md) | Terms of service starting draft |
| [cookie-policy.md](cookie-policy.md) | Cookie policy starting draft |
