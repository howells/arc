---
name: suggest
description: |
  Opinionated project-local recommendations for what to work on next.
  Use when asked "what should I work on", "what's next", "suggest priorities",
  or when starting a session and unsure where to begin.
license: MIT
metadata:
  author: howells
website:
  order: 17
  desc: Next-step triage
  summary: "Opinionated recommendations for what to work on next based on project-local signals: current plans, progress, TODOs, failing checks, recent commits, and vision gaps."
  what: |
    Suggest scans the current repository for visible work signals and turns them into 3-5 ranked recommendations with clear rationale and the Arc command to start each one.
  why: |
    Starting is the hardest part. When you sit down with an hour to code, decision fatigue can burn half of it. Suggest removes the "what should I work on?" loop.
  decisions:
    - "Project-local cascade: active plans, recent progress, failing checks, TODOs, codebase gaps, then vision gaps."
    - Opinionated, not neutral. Pick winners and say why.
    - Each suggestion includes the exact Arc command to run.
    - No external discovery, competitor research, market trend research, or Linear priority queue ownership.
  workflow:
    position: cross-cutting
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

Analyze project-local signals to give opinionated recommendations for what to work on next.

## Priority Cascade

1. **Current plans** — In-progress or ready plans under `docs/arc/plans/` or `docs/plans/`
2. **Recent progress** — Work noted in `.arc/log.md`, `docs/arc/progress.md`, or recent commits
3. **Failing checks** — Known test, typecheck, lint, build, or CI failures visible in the repo
4. **Codebase signals** — TODOs, FIXMEs, missing tests, stale patterns, incomplete features
5. **Vision gaps** — Goals in `docs/vision.md`, `docs/arc/vision.md`, or `CONTEXT.md` not reflected in the code

## Process

### Step 1: Read Current Work

Check for active planning and progress:

```bash
find docs/arc/plans docs/plans -maxdepth 1 -type f -name "*.md" 2>/dev/null
ls .arc/log.md docs/arc/progress.md docs/vision.md docs/arc/vision.md CONTEXT.md 2>/dev/null
git log --oneline -5
```

Read only the files that exist. Prefer recent progress and unfinished plans over speculative ideas.

### Step 2: Check Known Failures

Inspect project scripts and recent status for obvious broken checks:

```bash
git status --short
cat package.json 2>/dev/null
find . -maxdepth 3 \( -name "vitest.config.*" -o -name "jest.config.*" -o -name "playwright.config.*" -o -name "turbo.json" \) 2>/dev/null
```

Do not run expensive checks by default. If a check should be run before ranking work, ask or state it as the first recommended action.

### Step 3: Analyze Codebase Signals

Search locally:

```bash
rg -n "TODO|FIXME|HACK|XXX|@ts-expect-error|@ts-ignore|eslint-disable|any\\b|Not implemented|throw new Error\\(\"TODO" .
```

Sample enough files to understand clusters. Do not turn this into a full audit; use `/arc:audit` for comprehensive review.

### Step 4: Compare Vision

If no immediate plan, progress, failure, or codebase signal dominates, compare vision goals to current repo state and identify concrete next steps.

### Step 5: Synthesize Recommendations

Present top 3-5 suggestions:

```markdown
## Suggestions

### 1. [Top recommendation]
**Why:** [Brief rationale]
**Evidence:** [file:line, plan title, recent commit, or visible check signal]
**Command:** /arc:ideate [topic]

### 2. [Second recommendation]
**Why:** [Brief rationale]
**Command:** [relevant command]

### 3. [Third recommendation]
**Why:** [Brief rationale]
**Command:** [relevant command]
```

Recommendations should be concrete work items, not generic quality advice. Include the smallest useful next command:
- `/arc:implement` for a clear scoped code change
- `/arc:ideate` when the idea needs shaping
- `/arc:refactor` when structural planning is needed
- `/arc:audit`, `/arc:testing`, or `/arc:launch` when the next action is a specialist check

### Step 6: Offer to Act

"Want me to start the top recommendation?"

If user picks one, route to the relevant Arc workflow.

## Suggestion Categories

**From plans/progress:**
- "The current plan for [topic] is ready to execute — start with `/arc:implement`?"
- "Recent progress ended with [follow-up] — continue there?"

**From Codebase:**
- "Found [N] TODOs in [area] — want to address them?"
- "Test coverage is thin in [area]"
- "Outdated pattern in [file] — could modernize"
- "Recent commits touched [area] but no tests changed — run `/arc:testing`?"

**From Vision:**
- "Vision mentions [goal] but I don't see it implemented"
- "Vision says [X] is a non-goal but code does [X]"

## What Suggest is NOT

- Not a code review (use /arc:audit or /arc:review)
- Not a test runner (use /arc:testing)
- Not a planner (use /arc:ideate)
- Not a Linear triage tool
- Not external discovery, market research, or competitor analysis

It's a project-local compass, not a map.
