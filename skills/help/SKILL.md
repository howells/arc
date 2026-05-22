---
name: help
description: |
  Show all Arc commands with context-aware relevance. Reads the codebase to understand
  what's present (framework, tests, plans, design docs, etc.) and annotates each command
  with whether it's relevant right now. Use when asked "what can arc do", "help",
  "list commands", "what commands are available", or "how does arc work".
license: MIT
metadata:
  author: howells
website:
  order: 0
  desc: Context-aware command guide
  summary: Lists every Arc command with relevance to your current project. Shows what each does, when to use it, and which ones matter right now.
  what: |
    Help gathers lightweight context about your project (framework, existing plans, design docs, test setup, etc.) and presents the full Arc command catalog annotated with relevance signals. Commands that don't apply to your current situation are dimmed with a reason why.
  why: |
    Arc has 30+ commands. Nobody memorizes them all. Help gives you the full picture with context so you can find the right command without trial and error.
  decisions:
    - Lightweight context gathering. Quick checks, not deep analysis.
    - Shows ALL commands. Doesn't hide irrelevant ones — dims them with explanation.
    - No routing. Unlike /arc:go, this doesn't launch other skills — it just informs.
  workflow:
    position: utility
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## BANNED TOOLS — calling these is a skill violation:
- **`EnterPlanMode`** — BANNED. This skill outputs information directly.
- **`ExitPlanMode`** — BANNED. You are never in plan mode.
- **`AskUserQuestion`** — BANNED. This is a read-only info dump, not interactive.
</tool_restrictions>

# /arc:help

Show every Arc command with context-aware relevance annotations.

---

## Step 1: Gather Context (quick, parallel)

Run these checks in parallel. Keep it fast — no deep exploration.

```bash
# What framework/stack?
ls package.json next.config.* vite.config.* nuxt.config.* 2>/dev/null | head -5

# Arc artifacts?
ls docs/vision.md docs/arc/specs/*.md docs/arc/plans/*.md 2>/dev/null | head -10

# Design docs?
ls docs/design-context.md docs/arc/specs/design-*.md 2>/dev/null | head -5

# Test setup?
ls vitest.config.* jest.config.* playwright.config.* cypress.config.* 2>/dev/null | head -5

# Has UI? (React/Vue/Svelte components)
ls src/app/**/*.tsx app/**/*.tsx src/components/**/*.tsx components/**/*.tsx 2>/dev/null | head -3

# Has AI features?
grep -rl "from ['\"]ai['\"]" src/ app/ lib/ 2>/dev/null | head -3

# Git state
git log -1 --format=%ci 2>/dev/null
git diff --name-only HEAD~5 2>/dev/null | head -20

# CLAUDE.md or rules?
ls CLAUDE.md .claude/rules/**/*.md rules/**/*.md 2>/dev/null | head -5

# Progress journal?
head -20 docs/arc/progress.md 2>/dev/null
```

From these checks, build a mental model of what's **present** and what's **missing**.

---

## Step 2: Output the Command Guide

Present all commands in a single output. Use the context to annotate relevance.

### Format

For each command group, output:

```markdown
## [Group Name]

| Command | What it does | Relevance |
|---------|-------------|-----------|
| `/arc:command` | One-line description | **Relevant** — [why] |
| `/arc:command` | One-line description | *Low relevance* — [why] |
```

**Relevance rules:**
- **Relevant** — the project has the prerequisites AND there's a reason to use it now
- **Available** — the project has the prerequisites but no urgent reason
- *Low relevance* — project is missing prerequisites (e.g., no tests = no test execution)
- *Not applicable* — fundamentally doesn't apply (e.g., no codebase at all)

### The Catalog

Output ALL of these in order:

---

**ENTRY POINTS**

| Command | What it does | When to use |
|---------|-------------|-------------|
| `/arc:go` | Understands your codebase, asks what you want to do, routes to the right workflow | Starting a session, unsure where to begin |
| `/arc:help` | This command — shows all commands with context | When you want to see what's available |

**FOUNDATION**

| Command | What it does | When to use |
|---------|-------------|-------------|
| `/arc:vision` | Define project goals, purpose, and success criteria | New projects, or when goals are unclear |

**DESIGN**

| Command | What it does | When to use |
|---------|-------------|-------------|
| `/arc:ideate` | Turn an idea into a validated design through collaborative dialogue | New features that need thinking before building |

**EXECUTE**

| Command | What it does | When to use |
|---------|-------------|-------------|
| `/arc:implement` | Scope-aware planning and execution with TDD | Small fixes through substantial features |

**REVIEW**

| Command | What it does | When to use |
|---------|-------------|-------------|
| `/arc:review` | Expert review of a plan, spec, design, or implementation approach | Before implementation, when deciding whether a plan is sound |
| `/arc:audit` | Mechanical verification plus comprehensive codebase audit | Existing codebase health checks, risk assessment, before shipping |
| `/arc:refactor` | Inspect existing code to produce a structural refactor plan/RFC | When code feels tangled, shallow, duplicated, or hard to test |

**TEST**

| Command | What it does | When to use |
|---------|-------------|-------------|
| `/arc:testing` | Characterization tests and safety-net backfill for existing code | Before refactoring or changing under-tested code |

**SHIP**

| Command | What it does | When to use |
|---------|-------------|-------------|
| `/arc:launch` | Go-live and shareability checklist | Before sharing a public URL |

**CROSS-CUTTING**

| Command | What it does | When to use |
|---------|-------------|-------------|
| `/arc:commit` | Smart commit with auto-splitting across domains | When ready to commit changes |
| `/arc:suggest` | Project-local next-step triage from plans, progress, TODOs, checks, and vision | Starting a session, unsure what to tackle |

---

## Step 3: Contextual Recommendations

After the catalog, add a short section:

```markdown
## Recommended Right Now

Based on what I found in your project:

1. **[Command]** — [specific reason based on context]
2. **[Command]** — [specific reason based on context]
3. **[Command]** — [specific reason based on context]
```

Pick 2-4 commands that make the most sense given:
- What's **missing** (no vision doc → suggest `/arc:vision`)
- What's **stale** (old plans → mention them, but do not route to a cleanup workflow)
- What **just changed** (recent implementation edits → suggest `/arc:audit`; suggest `/arc:testing` if follow-up work needs a safety net)
- What **could be improved** (important existing behavior has no tests → suggest `/arc:testing`)

---

## Rules

- **Don't invoke any other skills.** This is information only.
- **Don't ask questions.** Output the catalog and recommendations, then stop.
- **Keep context gathering under 5 seconds.** Quick checks only, no deep exploration.
- **Show ALL commands.** Don't hide irrelevant ones — annotate them so users learn they exist.
- **Be specific about relevance.** "Low relevance — no UI components found" not just "Low relevance."
