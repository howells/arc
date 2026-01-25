---
name: tidy
disable-model-invocation: true
description: |
  Clean up completed plans in docs/plans/. Archives or deletes finished plans.
  Use when asked to "clean up plans", "tidy the docs", "archive old plans",
  or after completing implementation to remove stale planning documents.
license: MIT
metadata:
  author: howells
website:
  order: 19
  desc: Plan cleanup
  summary: Clean up completed plans in docs/plans/. Archives or deletes finished plans.
  what: |
    Tidy analyzes your docs/plans/ folder, checks which plans have been implemented (by looking for the files they describe), and offers to archive or delete completed ones. One plan at a time, always with confirmation.
  why: |
    Planning documents accumulate. After implementation, they become clutter that obscures current work. Tidy keeps your plans folder relevant by archiving what's done.
  decisions:
    - One at a time presentation. Never bulk-deletes without review.
    - Evidence-based status detection. Checks if planned files exist and have commits.
    - Archive over delete. Completed plans move to docs/plans/archive/ by default.
---

# Tidy Workflow

Clean up the docs/plans/ folder by analyzing which plans have been implemented. Archive what's done, keep what matters.

## Modes

1. **Full mode** (default): Review all plans
2. **Quick mode** (`--quick`): Only show implemented plans ready to archive

## Process

### Step 1: Discover Plans

**Use Glob tool:** `docs/plans/*.md`

**Handle empty states:**
- No `docs/plans/`: "No plans folder found. Nothing to tidy!"
- Empty folder: "Your plans folder is already spotless!"

**Preview:**
```
Let me tidy up your plans folder...

Found [N] plans in docs/plans/
```

### Step 2: Analyze Each Plan

For each plan file:

**1. Parse metadata from filename:**
- Date: `YYYY-MM-DD` prefix
- Topic: middle slug
- Type: `-design.md` or `-implementation.md` suffix

**2. Extract signals from plan content:**
- File paths in "Create:", "File:", "Modify:" sections
- Function/component/type names mentioned
- Test file paths

**3. Check implementation status:**

**Use Glob tool:** Check if planned files exist (use paths from plan)

**Use Bash for git history:**
```bash
git log --after="YYYY-MM-DD" --oneline -- [file-paths]
```

**Use Grep tool:** Pattern `identifier` in `[file-paths]` — check for key identifiers

**4. Determine status:**

| Condition | Status |
|-----------|--------|
| 70%+ signals positive | Implemented |
| 30-70% signals positive | Partial |
| 0 signals positive | Outstanding |
| Cannot parse/analyze | Unknown |

### Step 3: Present to User (One at a Time)

```markdown
## Plan: [Topic] ([YYYY-MM-DD])

[1-3 sentence summary from plan]

**Status:** [status]

**Evidence:**
- [file] exists (planned to create)
- [file] modified after plan date
- [N] commits after plan date
- OR: No activity found on planned files

---

What should I do?
1. Archive (move to docs/plans/archive/)
2. Delete (remove file and assets)
3. Keep (leave in place)
4. Skip (decide later)
```

Wait for user response before proceeding to next plan.

### Step 4: Execute Actions

**Archive:**
```bash
mkdir -p docs/plans/archive/
mv docs/plans/[plan].md docs/plans/archive/
# Move associated assets if they exist
mv docs/plans/assets/[topic]/ docs/plans/archive/assets/ 2>/dev/null
```

**Delete:**
```bash
rm docs/plans/[plan].md
rm -rf docs/plans/assets/[topic]/ 2>/dev/null
```

**Keep/Skip:** No action, continue to next plan.

### Step 5: Summary

After all plans processed:

```markdown
## Tidy Complete!

| Action | Count |
|--------|-------|
| Archived | X |
| Deleted | Y |
| Kept | Z |
| Skipped | W |

Your plans folder is now tidy!
```

**Offer to commit:**
```
Want me to commit these changes?
```

If yes:
```bash
git add docs/plans/
git commit -m "docs: tidy up completed plans"
```

## Edge Cases

**Paired design + implementation:**
- If both exist for same topic, analyze implementation plan
- Offer to archive/delete both together

**Plans with assets:**
- Check `docs/plans/assets/YYYY-MM-DD-topic/`
- Include in archive/delete actions

**Very old plans (>60 days, no activity):**
- Add note: "This plan is [N] days old with no activity"

**Unparseable plans:**
- Show filename and first few lines
- Let user decide: Keep or Delete

## Personality

Friendly, unobtrusive:
- "Let me tidy up around here..."
- "This one looks done. Ready to archive it?"
- "Your plans folder is now spotless!"

NOT: overly cute, emoji-heavy, or verbose.

## What Tidy Does NOT Do

- Modify plan contents
- Create new plans
- Touch anything outside `docs/plans/`
- Make decisions without asking
- Auto-delete without confirmation

## Interop

- **/arc:ideate** creates design plans
- **/arc:detail** creates implementation plans
- **/arc:implement** executes plans
- **/arc:tidy** cleans up after implementation
