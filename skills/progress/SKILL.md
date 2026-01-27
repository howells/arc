---
name: progress
description: |
  View and manage the progress journal for knowledge persistence across sessions.
  Use when asked to "show progress", "what have we done", "add a note",
  or when you need context from previous sessions.
license: MIT
argument-hint: <note-to-add>
metadata:
  author: howells
website:
  order: 15
  desc: Session journal
  summary: A running log of what Arc has done. Every skill appends to it, so you (and the AI) always know where you left off.
  what: |
    Progress maintains a journal at docs/progress.md—a timeline of what's been done. Tasks completed, decisions made, files changed. Every Arc skill appends to it automatically. When you start a new session, Arc reads the recent entries to understand context. You can also add manual notes or review what happened.
  why: |
    LLMs have no memory between sessions. Without a record, every conversation starts from zero—you re-explain context, the AI re-explores your codebase. Progress fixes this. Arc writes down what it did, so the next session picks up where the last one left off. Come back after a week and the journal tells you (and the AI) exactly what was happening.
  decisions:
    - Auto-maintained. Every Arc skill appends—you never have to remember to write notes.
    - Newest first. Recent context is what matters when resuming.
    - Auto-archives at 50 entries. Old history moves to progress-archive.md.
---

# /arc:progress

The progress journal maintains a lightweight record of what Arc has done, decisions made, and context that should persist across sessions.

## The Journal

**Location:** `docs/progress.md`

**Format:**
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

[Older entries below...]
```

## Process

### Viewing Progress

**If no arguments:**

**Use Read tool:** `docs/progress.md` (first 100 lines)

Show the 10 most recent entries with summary:
```
## Recent Progress

1. [date] /arc:ideate — Add user authentication
   Outcome: Complete → Created design doc

2. [date] /arc:build — Add logout button
   Outcome: Complete

3. [date] /arc:implement — Magic link auth (3/7 tasks)
   Outcome: In Progress → Paused at email sending

[Show more with /arc:progress --all]
```

### Adding Manual Notes

**If arguments provided:**
```
/arc:progress Working on the API refactor, decided to use tRPC instead of REST
```

Append to journal:
```markdown
## YYYY-MM-DD HH:MM — Manual Note
**Note:** Working on the API refactor, decided to use tRPC instead of REST

---
```

### Trimming Old Entries

**If journal exceeds 50 entries or ~20KB:**

1. Count entries:

   **Use Grep tool:** Pattern `^## [0-9]` in `docs/progress.md` with output_mode: "count"

2. If >50 entries, offer to archive:
   ```
   "The progress journal has [N] entries. Want me to archive older entries to docs/progress-archive.md?"
   ```

3. If yes:
   - Move entries older than 30 days to `docs/progress-archive.md`
   - Keep recent 30 entries in `docs/progress.md`

## Appending Entries (For Other Skills)

**All Arc skills should append to the progress journal on completion.**

Use this pattern at the end of any skill:

```markdown
<progress_append>
After completing the skill's main work, append to the progress journal:

```bash
# Create if doesn't exist
mkdir -p docs
touch docs/progress.md
```

**Entry format:**
```markdown
## YYYY-MM-DD HH:MM — /arc:[skill-name]
**Task:** [What was requested]
**Outcome:** [Complete / In Progress / Blocked]
**Files:** [Key files, comma-separated]
**Decisions:**
- [Decision 1]
- [Decision 2]
**Next:** [Suggested next step]

---

```

**Prepend to file** (newest first):
```bash
# Create temp file with new entry + existing content
cat > /tmp/progress-entry.md << 'EOF'
[new entry]
EOF
cat docs/progress.md >> /tmp/progress-entry.md 2>/dev/null
mv /tmp/progress-entry.md docs/progress.md
```
</progress_append>
```

## Reading Progress (For Context)

**Skills that benefit from progress context should read recent entries first.**

**Use Read tool:** `docs/progress.md` (first 50 lines)

Look for:
- Recent work on related features
- Decisions that affect current work
- In-progress items that might be continued
- Patterns in what's been done

## What Gets Logged

| Skill | What to Log |
|-------|-------------|
| `/arc:ideate` | Feature designed, key decisions, approach chosen |
| `/arc:detail` | Plan created, task count, scope |
| `/arc:implement` | Tasks completed, tasks remaining, blockers |
| `/arc:build` | What was built, files changed |
| `/arc:test` | Test results, coverage changes |
| `/arc:review` | Plan reviewed, changes made |
| `/arc:audit` | Audit completed, issue counts by severity |
| `/arc:design` | UI designed, aesthetic direction |
| `/arc:letsgo` | Deployment status, checklist progress |
| `/arc:deslop` | Files cleaned, patterns removed |
| `/arc:document` | Solution documented, category |
| `/arc:commit` | What was committed, branch |

## What Doesn't Get Logged

- `/arc:progress` itself (meta-circular)
- `/arc:suggest` (read-only)
- Failed/abandoned attempts (unless valuable context)

## Success Criteria

- [ ] Journal exists at `docs/progress.md`
- [ ] Recent entries shown (if viewing)
- [ ] New entry appended (if adding note)
- [ ] Old entries archived (if trimming)
