---
name: suggest
description: |
  Opinionated recommendations for what to work on next based on existing tasks and codebase.
  Use when asked "what should I work on", "what's next", "suggest priorities",
  or when starting a session and unsure where to begin.
license: MIT
metadata:
  author: howells
website:
  order: 17
  desc: Opinionated next steps
  summary: Opinionated recommendations for what to work on next based on existing tasks and codebase.
  what: |
    Suggest checks your existing tasks, scans your codebase for TODOs and technical debt, and compares against your vision. It synthesizes this into 3-5 ranked recommendations with clear rationale and the command to start each one.
  why: |
    Starting is the hardest part. When you sit down with an hour to code, decision fatigue can burn half of it. Suggest removes the "what should I work on?" loop.
  decisions:
    - "Priority cascade: Tasklist first, codebase issues second, vision gaps third."
    - Opinionated, not neutral. It picks winners and says why.
    - One click to act. Each suggestion includes the exact command to run.
---

<progress_context>
**Use Read tool:** `docs/progress.md` (first 50 lines)

Check what was recently worked on to avoid re-suggesting completed work.
</progress_context>

# Suggest Workflow

Analyze tasks, codebase, and vision to give opinionated recommendations for what to work on next.

## Priority Cascade

1. **Existing tasks** (highest priority) — Already noted, most immediate
2. **Codebase issues** — Technical debt, gaps, patterns
3. **Vision gaps** (lowest priority) — Only if 1 & 2 are empty

## Process

### Step 1: Check Tasks

**Use TaskList tool** to check for existing tasks.

If tasks exist with status `pending`:
→ Recommend those first with brief rationale

### Step 2: Analyze Codebase

**Use Task tool to spawn exploration agent:**
```
Task Explore model: haiku: "Analyze this codebase for:
- Incomplete features (TODOs, FIXMEs)
- Technical debt (outdated patterns, missing tests)
- Quality issues (type escapes, inconsistencies)
- Missing documentation
- Performance concerns

Prioritize by impact."
```

### Step 3: Read Vision (if needed)

Only if no tasks exist AND codebase analysis found nothing urgent:

**Use Read tool:** `docs/vision.md`

Compare vision goals to current state. Identify gaps.

### Step 4: Synthesize Recommendations

Present top 3-5 suggestions:

```markdown
## Suggestions

### 1. [Top recommendation]
**Why:** [Brief rationale]
**Command:** /arc:ideate [topic] or /arc:build [thing]

### 2. [Second recommendation]
**Why:** [Brief rationale]
**Command:** [relevant command]

### 3. [Third recommendation]
**Why:** [Brief rationale]
**Command:** [relevant command]
```

### Step 5: Offer to Act

"Which of these interests you? Or tell me something else."

If user picks one, invoke the relevant command.

## Suggestion Categories

**From Tasks:**
- "You noted [X] — ready to tackle it?"

**From Codebase:**
- "Found [N] TODOs in [area] — want to address them?"
- "Test coverage is thin in [area]"
- "Outdated pattern in [file] — could modernize"

**From Vision:**
- "Vision mentions [goal] but I don't see it implemented"
- "Vision says [X] is a non-goal but code does [X]"

## What Suggest is NOT

- Not a code review (use /arc:deslop or /arc:review)
- Not a test runner (use /arc:test)
- Not a planner (use /arc:ideate)

It's a compass, not a map.
