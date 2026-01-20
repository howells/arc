---
name: vision
description: |
  Create or review a high-level vision document capturing project goals and purpose.
  Use when asked to "define the vision", "what is this project", "set goals",
  or when starting a new project that needs clarity on purpose and direction.
license: MIT
metadata:
  author: howells
---

# Vision Workflow

Create or review a 500-700 word vision document that captures the high-level goals and purpose of the app or codebase.

<progress_context>
**Use Read tool:** `docs/progress.md` (first 50 lines)

Check for recent work that might inform vision decisions.
</progress_context>

## Process

### Step 1: Check for Existing Vision

**Use Read tool:** `docs/vision.md`

**If file exists:** Read it, then ask:
"I found an existing vision document. Would you like to:"
1. Review and discuss it
2. Update it based on new direction
3. Start fresh

**If not exists:** Proceed to Step 2.

### Step 2: Gather Context

Ask one question at a time:

1. "What is this project? (one sentence)"
2. "Who is it for?"
3. "What problem does it solve?"
4. "What does success look like?"
5. "Any constraints or non-goals?"

### Step 3: Draft Vision

Write a 500-700 word vision document covering:

```markdown
# Vision

## Purpose
[One paragraph: What is this and why does it exist?]

## Goals
[3-5 bullet points: What are we trying to achieve?]

## Target Users
[Who is this for? What do they need?]

## Success Criteria
[How do we know if we've succeeded?]

## Non-Goals
[What are we explicitly NOT trying to do?]

## Principles
[2-3 guiding principles for decisions]
```

### Step 4: Validate

Present the draft in sections. After each: "Does this capture it?"

### Step 5: Save

```bash
mkdir -p docs
# Write to docs/vision.md
git add docs/vision.md
git commit -m "docs: add project vision"
```

<progress_append>
After creating or updating the vision, append to progress journal:

```markdown
## YYYY-MM-DD HH:MM — /arc:vision
**Task:** [Create / Update] vision document
**Outcome:** Complete
**Files:** docs/vision.md
**Decisions:**
- Purpose: [one-liner]
**Next:** /arc:ideate or continue

---
```
</progress_append>

## Interop

- **/arc:ideate** reads vision for context
- **/arc:suggest** references vision as lowest-priority source
- **/arc:letsgo** checks vision alignment
