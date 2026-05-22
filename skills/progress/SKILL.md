---
name: progress
description: |
  Internal skill for progress journal management. Other skills append to docs/arc/progress.md
  for cross-session context. Not invoked directly by users.
internal: true
license: MIT
metadata:
  author: howells
---

# Progress Journal

Internal patterns for maintaining cross-session context via `docs/arc/progress.md`.

## Journal Format

**Location:** `docs/arc/progress.md`

```markdown
# Progress Journal

## YYYY-MM-DD HH:MM — /arc:[command]
**Task:** [Brief description]
**Outcome:** [Complete / In Progress / Blocked]
**Files:** [Key files created/modified]
**Decisions:**
- [Key decision 1]
- [Key decision 2]
**Next:** [What comes next, if any]

---
```

## Appending Entries

**All Arc skills should append to the progress journal on completion.**

Use this pattern at the end of any skill:

```markdown
<progress_append>
After completing the skill's main work, append to the progress journal:

**Entry format:**
## YYYY-MM-DD HH:MM — /arc:[skill-name]
**Task:** [What was requested]
**Outcome:** [Complete / In Progress / Blocked]
**Files:** [Key files, comma-separated]
**Decisions:**
- [Decision 1]
**Next:** [Suggested next step]

---
</progress_append>
```

## Reading Progress (For Context)

**Skills that benefit from progress context should read recent entries first.**

```markdown
<progress_context>
**Use Read tool:** `docs/arc/progress.md` (first 50 lines)

Look for:
- Recent work on related features
- Decisions that affect current work
- In-progress items that might be continued
</progress_context>
```

## What Gets Logged

| Skill | What to Log |
|-------|-------------|
| `/arc:ideate` | Feature designed, key decisions, approach chosen |
| `/arc:implement` | Tasks completed, tasks remaining, blockers |
| `/arc:testing` | Test results, coverage changes |
| `/arc:review` | Plan reviewed, changes made |
| `/arc:audit` | Audit completed, issue counts by severity |
| `/arc:design` | UI designed, aesthetic direction |
| `/arc:launch` | Public URL status, checklist progress |
| `/arc:commit` | What was committed, branch |

## What Doesn't Get Logged

- `/arc:suggest` (read-only)
- Linear issues (external system)
- Failed/abandoned attempts (unless valuable context)
