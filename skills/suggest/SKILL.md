---
name: suggest
description: |
  Opinionated recommendations for what to work on next based on Linear issues, tasks, and codebase.
  Use when asked "what should I work on", "what's next", "suggest priorities",
  or when starting a session and unsure where to begin.
license: MIT
metadata:
  author: howells
website:
  order: 17
  desc: Opinionated next steps
  summary: Opinionated recommendations for what to work on next based on existing tasks and codebase. Includes a discovery mode that researches market trends and proposes new features.
  what: |
    Suggest checks your existing tasks, scans your codebase for TODOs and technical debt, and compares against your vision. It synthesizes this into 3-5 ranked recommendations with clear rationale and the command to start each one. When the normal cascade runs dry, it offers to research external trends and propose entirely new feature ideas.
  why: |
    Starting is the hardest part. When you sit down with an hour to code, decision fatigue can burn half of it. Suggest removes the "what should I work on?" loop.
  decisions:
    - "Priority cascade: Linear issues first, tasks second, codebase issues third, vision gaps fourth, discovery fifth."
    - Opinionated, not neutral. It picks winners and says why.
    - One click to act. Each suggestion includes the exact command to run.
    - Discovery mode researches externally — market trends, competitors, emerging tech — and proposes new features.
  workflow:
    position: utility
---

<arc_runtime>
This workflow requires the full Arc bundle, not a prompts-only install.

Paths in this skill use these conventions:
- `agents/...`, `references/...`, `disciplines/...`, `templates/...`, `scripts/...`, `rules/...`, `skills/<name>/...` are Arc-owned files at the plugin root. Resolve the plugin root from this skill's filesystem location — it's the directory containing `agents/` and `skills/`.
- `./...` is local to this skill's directory.
- `.ruler/...`, `docs/...`, `src/...`, or any project-relative path refers to the user's project repository.
</arc_runtime>

<arc_log>
**Use Read tool:** `.arc/log.md` (first 50 lines)

Check what was recently worked on to avoid re-suggesting completed work.
</arc_log>

# Suggest Workflow

Analyze Linear issues, tasks, codebase, and vision to give opinionated recommendations for what to work on next.

## Priority Cascade

1. **Linear issues** (highest priority, if MCP available) — Already triaged, most immediate
2. **Existing tasks** — Already noted, pending action
3. **Codebase issues** — Technical debt, gaps, patterns
4. **Vision gaps** — Goals not yet implemented
5. **Discovery** (lowest priority, opt-in) — New feature ideas from external research

## Process

### Step 1: Check Linear (if available)

**Check for Linear MCP:**
Look for `mcp__linear__*` tools in available tools.

**If Linear MCP available:**
```
mcp__linear__list_issues: { filter: { state: { type: { in: ["started", "unstarted"] } } }, first: 10 }
```

Prioritize issues marked as high priority or in current cycle.

**If Linear not available:** Check TaskList.

### Step 1b: Check Tasks

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

Only if no Linear issues/tasks exist AND codebase analysis found nothing urgent:

**Use Read tool:** `docs/vision.md`

Compare vision goals to current state. Identify gaps.

### Step 4: Synthesize Recommendations

Present top 3-5 suggestions:

```markdown
## Suggestions

### 1. [Top recommendation]
**Why:** [Brief rationale]
**Command:** /arc:ideate [topic]

### 2. [Second recommendation]
**Why:** [Brief rationale]
**Command:** [relevant command]

### 3. [Third recommendation]
**Why:** [Brief rationale]
**Command:** [relevant command]
```

### Step 5: Offer to Act

"Want me to dive deeper into any of these with `/arc:ideate`?"

If user picks one, invoke the relevant command.

## Suggestion Categories

**From Linear:**
- "High priority: [issue title] — ready to tackle it?"
- "Current cycle has [N] issues — start with [X]?"

**From Tasks:**
- "You noted [X] — ready to tackle it?"

**From Codebase:**
- "Found [N] TODOs in [area] — want to address them?"
- "Test coverage is thin in [area]"
- "Outdated pattern in [file] — could modernize"

**From Vision:**
- "Vision mentions [goal] but I don't see it implemented"
- "Vision says [X] is a non-goal but code does [X]"

**From Discovery:**
- "Competitors in [space] are adding [feature] — your architecture already supports it"
- "[Emerging tech] could unlock [capability] with [effort level] effort"
- "Revenue opportunity: [strategy] is trending in [domain] and fits your stack"

## What Suggest is NOT

- Not a code review (use /arc:audit or /arc:review)
- Not a test runner (use /arc:testing)
- Not a planner (use /arc:ideate)

It's a compass, not a map. Discovery mode just points the compass outward.
