---
description: Opinionated suggestions for what to work on next
reads: docs/tasklist.md, docs/vision.md, codebase
uses: agents/review/*
---

# Suggest Workflow

Analyze tasklist, codebase, and vision to give opinionated recommendations for what to work on next.

## Priority Cascade

1. **Tasklist** (highest priority) — Already noted, most immediate
2. **Codebase issues** — Technical debt, gaps, patterns
3. **Vision gaps** (lowest priority) — Only if 1 & 2 are empty

## Process

### Step 1: Read Tasklist

```bash
cat docs/tasklist.md 2>/dev/null
```

If tasklist has items in "Up Next":
→ Recommend those first with brief rationale

### Step 2: Analyze Codebase

Spawn exploration agent:
```
Task Explore: "Analyze this codebase for:
- Incomplete features (TODOs, FIXMEs)
- Technical debt (outdated patterns, missing tests)
- Quality issues (type escapes, inconsistencies)
- Missing documentation
- Performance concerns

Prioritize by impact."
```

### Step 3: Read Vision (if needed)

Only if tasklist is empty AND codebase analysis found nothing urgent:
```bash
cat docs/vision.md 2>/dev/null
```

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

**From Tasklist:**
- "You noted [X] — ready to tackle it?"

**From Codebase:**
- "Found [N] TODOs in [area] — want to address them?"
- "Test coverage is thin in [area]"
- "Outdated pattern in [file] — could modernize"

**From Vision:**
- "Vision mentions [goal] but I don't see it implemented"
- "Vision says [X] is a non-goal but code does [X]"

## What Suggest is NOT

- Not a code review (use /arc:deslop or expert-review)
- Not a test runner (use /arc:test)
- Not a planner (use /arc:ideate)

It's a compass, not a map.
