---
name: document
description: |
  Capture solved problems as searchable documentation for future reference.
  Use when a problem is solved, after saying "that worked", "it's fixed", or when
  you want to document a solution so it can inform future sessions.
license: MIT
metadata:
  author: howells
website:
  order: 18
  desc: Capture solutions
  summary: Capture solved problems as searchable documentation for future reference.
  what: |
    Document captures non-trivial problems you've solved — the symptom, what didn't work, the root cause, and the fix. It creates searchable markdown in docs/solutions/ so future sessions can find it.
  why: |
    You solve the same problems twice because you forget you solved them. Document builds institutional knowledge that compounds across sessions. Next time you hit the same error, Arc finds the fix.
  decisions:
    - Triggered by success phrases ("that worked", "it's fixed"). Capture while context is fresh.
    - Includes failed attempts. Knowing what doesn't work saves time.
    - Categorized by type (build-error, test-failure, runtime-error, etc.). Searchable structure.
---

<required_reading>
**Read these reference files NOW:**
- ${CLAUDE_PLUGIN_ROOT}/references/solution-schema.md
- ${CLAUDE_PLUGIN_ROOT}/templates/solution-template.md
</required_reading>

<progress_context>
**Use Read tool:** `docs/progress.md` (first 50 lines)

Check if similar problems were already documented.
</progress_context>

<objective>
Capture solved problems as searchable documentation immediately after confirmation. Builds institutional knowledge that informs future design sessions.
</objective>

<triggers>
**Auto-invoke after phrases:**
- "that worked"
- "it's fixed"
- "working now"
- "problem solved"
- "that did it"

**Manual:** `/arc:document` command

**Only for non-trivial problems:**
- Multiple investigation attempts needed
- Tricky debugging that took time
- Non-obvious solution
- Future sessions would benefit

**Skip for:** Typos, obvious syntax errors, trivial fixes.
</triggers>

<process>
## Step 1: Gather Context

Extract from conversation history:

**Required:**
- **Symptom**: Observable error/behavior (exact error messages)
- **Investigation**: What didn't work and why
- **Root cause**: Technical explanation
- **Solution**: What fixed it (code/config changes)
- **Prevention**: How to avoid in future

**If critical context missing, ask:**
```
I need a few details to document this:

1. What was the exact error message or symptom?
2. What did you try that didn't work?
3. What was the root cause?
```

## Step 2: Classify Problem

Determine problem type (maps to folder):

| Type | Folder | Examples |
|------|--------|----------|
| `build-error` | `docs/solutions/build-errors/` | TypeScript errors, bundler issues |
| `test-failure` | `docs/solutions/test-failures/` | Flaky tests, mocking issues |
| `runtime-error` | `docs/solutions/runtime-errors/` | Crashes, exceptions |
| `performance` | `docs/solutions/performance/` | Slow queries, memory leaks |
| `ui-bug` | `docs/solutions/ui-bugs/` | Layout issues, state bugs |
| `integration` | `docs/solutions/integrations/` | API issues, auth problems |
| `config` | `docs/solutions/config/` | Environment, tooling setup |

## Step 3: Generate Filename

Format: `[problem-summary]-[YYYYMMDD].md`

Examples:
- `drizzle-migration-not-running-20260114.md`
- `clerk-session-not-persisting-20260114.md`
- `tailwind-classes-not-applying-20260114.md`

## Step 4: Create Documentation

```bash
mkdir -p docs/solutions/[category]
```

Use `${CLAUDE_PLUGIN_ROOT}/templates/solution-template.md` structure:

```markdown
---
date: YYYY-MM-DD
problem_type: [build-error|test-failure|runtime-error|performance|ui-bug|integration|config]
severity: [critical|high|medium|low]
tags: [keyword1, keyword2]
stack: [next, drizzle, clerk, etc.]
---

# [Clear Problem Title]

## Problem
[1-2 sentence description]

## Symptoms
- [What you saw]
- [Error messages]

## What Didn't Work
**Attempt 1:** [Description]
- Why it failed: [Reason]

## Solution
[The fix that worked]

```typescript
// Before (broken):
...

// After (fixed):
...
```

## Why This Works
[Root cause explanation]

## Prevention
- [How to avoid this]
- [What to watch for]

## Related
- [Links to similar issues if any]
```

## Step 5: Present Options

```
✓ Solution documented

File: docs/solutions/[category]/[filename].md

What's next?
1. Continue working (default)
2. View documentation
3. Link to related issue
4. Other
```
</process>

<integration>
**The Knowledge Loop:**

```
ideate (design) → implement → encounter problem → solve → /arc:document (document)
                                                              ↓
                                         informs future ideate sessions
```

When starting new ideate sessions, the progress journal and `docs/solutions/` are read to surface past learnings and context.
</integration>

<tasklist_update>
If follow-up work is identified, use **TaskCreate**:
- **subject:** Brief imperative title
- **description:** What needs to be done and why
- **activeForm:** Present continuous form
</tasklist_update>

<progress_append>
After documenting a solution, append to progress journal:

```markdown
## YYYY-MM-DD HH:MM — /arc:document
**Task:** Documented solution for [problem summary]
**Outcome:** Complete
**Files:** docs/solutions/[category]/[filename].md
**Decisions:**
- Problem type: [category]
- Severity: [level]
**Next:** Continue working

---
```
</progress_append>

<success_criteria>
- [ ] YAML frontmatter complete (date, type, severity, tags)
- [ ] Problem clearly described with exact error messages
- [ ] Failed attempts documented (helps avoid wrong paths)
- [ ] Solution includes code examples
- [ ] Root cause explained (why, not just what)
- [ ] Prevention guidance included
</success_criteria>
