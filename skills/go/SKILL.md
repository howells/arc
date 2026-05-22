---
name: go
description: |
  The main entry point. Understands your codebase and routes to the right workflow.
  Use when starting a session, saying "let's work on something", or unsure which
  Arc command to use. Gathers context and asks what you want to do.
license: MIT
metadata:
  author: howells
website:
  order: 1
  desc: Main entry point
  summary: The front door to Arc. Understands your codebase, reads recent project-local context, and routes you to the right workflow.
  what: |
    Go explores your codebase to understand what you're working with, reads recent progress and existing plans, and asks what you want to do. Based on your answer, it routes you to the appropriate Arc command—ideate for new features, implement for execution, suggest if you're unsure.
  why: |
    Starting is the hardest part. Go gives you context immediately and asks one focused question: what do you want to work on? No need to remember which Arc command does what.
  decisions:
    - Codebase exploration first. Knows your stack before asking questions.
    - Project-local context only. Use repository signals, plans, progress, and staleness.
    - Routes, doesn't replace. Points you to the right command, then gets out of the way.
  workflow:
    position: spine
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## REQUIRED TOOLS — use these when indicated:
- **`AskUserQuestion`** — Preserve the one-question-at-a-time interaction pattern. In Claude Code, use the tool. In Codex, ask one concise plain-text question at a time unless a structured question tool is actually available in the current mode. Do not narrate missing tools or fallbacks to the user.
</tool_restrictions>

# /arc:go

The front door to Arc. Understands context, asks what you want to do, routes to the right workflow.

## Process

### Step 1: Gather Context (in parallel)

**Explore the codebase:**
```
Task Explore model: haiku: "Quick overview of this codebase:
- What is this project? (framework, language, purpose)
- Key directories and their purposes
- Any obvious patterns or conventions
- Is this an empty/minimal project with no framework set up?
  (e.g. just a package.json with no src/, no app framework, no pages)

Keep it brief — 5-10 bullet points max."
```

**Check for existing Arc artifacts:**
```bash
ls docs/vision.md docs/arc/specs/*.md docs/arc/plans/*.md docs/plans/*.md 2>/dev/null | head -10
```

**Read progress journal for recent work:**
```bash
head -50 docs/arc/progress.md 2>/dev/null
```

**Check repo staleness:**
```bash
# Last commit date (ISO format)
git log -1 --format=%ci 2>/dev/null
# Stale branches (merged or no commits in 30+ days)
git branch --list --format='%(refname:short) %(committerdate:relative)' | head -10
```

A repo is considered **stale** if the last commit was more than 2 weeks ago.

### Step 2: Present Context

Briefly share what you found:
- Project type and key patterns
- Any existing plans or tasks
- Recent work from progress journal (if found)

### Step 3: Ask What They Want to Do

Present options based on context using AskUserQuestion. Evaluate conditions in order — use the **first** that matches.

**If repo is stale (last commit > 2 weeks ago):**
```
AskUserQuestion:
  question: "This repo hasn't been touched in a while (last commit: [date]). What would you like to do?"
  header: "Returning to [project name]"
  options:
    - label: "Run a health check"
      description: "Check if it builds, review outdated deps, and surface what needs attention"
    - label: "I know what I want to work on"
      description: "Skip the checkup and jump straight in"
    - label: "See suggestions"
      description: "Run /arc:suggest for ideas on what to work on"
```

**If recent plans exist:**
```
AskUserQuestion:
  question: "I found a plan for [topic]. What would you like to do?"
  header: "Existing Plan Found"
  options:
    - label: "Continue that work"
      description: "Pick up where you left off on [topic]"
    - label: "Start something different"
      description: "Set the existing plan aside and work on something new"
```

**If empty/minimal codebase (no framework detected):**
```
AskUserQuestion:
  question: "This project doesn't have a framework set up yet. What would you like to do?"
  header: "Empty Project"
  options:
    - label: "Set up a new project"
      description: "Scaffold a framework (Next.js, etc.) and get started"
    - label: "Define a vision first"
      description: "Run /arc:vision to clarify project goals before building"
    - label: "I know what I want to build"
      description: "Describe the feature and jump straight in"
```

**If fresh codebase (has framework but no Arc artifacts):**
```
AskUserQuestion:
  question: "What would you like to work on?"
  header: "Ready to Go"
  options:
    - label: "Build a feature"
      description: "Describe a feature or change you want to make"
    - label: "Fix a bug"
      description: "Describe the bug you want to fix"
    - label: "Explore what needs work"
      description: "Run /arc:suggest to discover what could be improved"
```

### Step 3.5: Scope Posture (feature work only)

**Skip this step** if the user's intent is a quick fix, continuing an existing plan, running tests, shipping, reviewing a plan, or assessing existing code. Only ask when routing to `/arc:ideate` or `/arc:implement` for a new feature.

Ask one question:

```
AskUserQuestion:
  question: "How should I approach this?"
  header: "Scope Posture"
  options:
    - label: "Expand"
      description: "Find the bigger product hiding inside this. Push the ambition up."
    - label: "Reduce"
      description: "Find the minimum viable version. Strip everything else."
    - label: "Just build what I described"
      description: "Take the request as-is, no scope change. (Default if you skip this.)"
```

Pass the chosen posture as context when invoking the downstream skill:
```
Skill arc:[chosen]: "[user's description] [Posture: expand|reduce|as-described]"
```

**Rules:**
- If the user doesn't engage with the question or says something like "just do it", default to **as-described** and move on. Don't slow them down.
- Never ask this for small changes, bug fixes, or continuation of existing work.

### Step 4: Route to Workflow

Based on their answer:

| Intent | Route to |
|--------|----------|
| "Run a health check" | Health check flow (see below) |
| "Set up a new project" | /arc:implement with scaffolding context |
| "I want to build [feature]" | /arc:ideate (with posture from Step 3.5) |
| "Quick fix/small change" | /arc:implement |
| "Continue [existing plan]" | /arc:implement |
| "Not sure what to work on" | /arc:suggest |
| "Review a plan/spec/approach" | /arc:review |
| "Assess existing code quality/risk" | /arc:audit |
| "Find refactoring opportunities" | /arc:refactor |
| "Make it responsive/fix mobile" | /arc:responsive |
| "Launch / go live" | /arc:launch |
| "Run tests" | /arc:testing |

**Invoke the skill:**
```
Skill arc:[chosen]: "[user's description]"
```

#### Health Check Flow

When the user picks "Run a health check", run these sequentially — stop and report if anything critical fails:

1. **Run a codebase audit** — `Skill arc:audit`
   - Mechanical checks run first, then Arc surfaces the most relevant codebase risks.
   - If critical failures appear, report them and ask if the user wants to fix before continuing.

2. **Check dependencies** — `Skill arc:deps`
   - Outdated packages, known CVEs, major version bumps available.
   - Present the deps report but don't auto-apply upgrades.

3. **Surface what needs attention** — `Skill arc:suggest`
   - TODOs, technical debt, stale plans, vision gaps.
   - Gives the user a prioritized list of what to tackle.

After all three, summarize:

```markdown
## Health Check Summary

**Build:** [passing / failing — brief detail if failing]
**Dependencies:** [N outdated, N with CVEs — or "all current"]
**What needs attention:** [top 2-3 items from suggest]
```

Then ask:

```
AskUserQuestion:
  question: "What would you like to tackle?"
  header: "Health Check Complete"
  options:
    - label: "[Top suggestion from results]"
      description: "[Brief rationale]"
    - label: "[Second suggestion]"
      description: "[Brief rationale]"
    - label: "Something else"
      description: "Tell me what you want to work on"
```

## What /arc:go is NOT

- Not a replacement for specific commands — it routes TO them
- Not for when you already know what command to use

## Interop

- Routes to all other /arc:* commands
- Reads project-local plans, /arc:vision, and progress for context
- Uses /arc:suggest when user is unsure
- Chains /arc:audit → /arc:deps → /arc:suggest for stale repo health checks
