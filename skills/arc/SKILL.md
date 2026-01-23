---
name: arc
description: |
  The main entry point. Understands your codebase and routes to the right workflow.
  Use when starting a session, saying "let's work on something", or unsure which
  Arc command to use. Gathers context and asks what you want to do.
license: MIT
metadata:
  author: howells
website:
  order: 1
  desc: Start here
  summary: Start here—whether it's an empty folder or an existing codebase. Arc understands your context and guides you to what's next.
  what: |
    Arc works in an empty folder or a mature codebase. It gathers context (or notes the absence of it), then kicks off an interactive process to figure out what you're building and how to get there. You'll end up in the right workflow—vision for new projects, ideate for new features, build for quick work.
  why: |
    Starting is the hardest part. Arc removes the "where do I begin?" paralysis by meeting you where you are—blank slate or legacy monolith—and guiding you forward through conversation.
  decisions:
    - Works with nothing. An empty folder is a valid starting point.
    - Interactive, not prescriptive. Asks what you want to build rather than assuming.
    - Context-aware routing. Existing plans, tasklists, and code inform the recommendation.
---

# /arc

The front door to Arc. Understands context, asks what you want to do, routes to the right workflow.

## Process

### Step 1: Gather Context (in parallel)

**Explore the codebase:**
```
Task Explore model: haiku: "Quick overview of this codebase:
- What is this project? (framework, language, purpose)
- Key directories and their purposes
- Any obvious patterns or conventions

Keep it brief — 5-10 bullet points max."
```

**Check for existing Arc artifacts:**
```bash
ls docs/vision.md docs/tasklist.md docs/plans/*.md 2>/dev/null | head -10
```

**Read progress journal for recent work:**
```bash
head -50 docs/progress.md 2>/dev/null
```

### Step 2: Present Context

Briefly share what you found:
- Project type and key patterns
- Any existing plans or tasks
- Recent work from progress journal (if found)

### Step 3: Ask What They Want to Do

Present options based on context:

**If tasklist has items:**
"You have [N] items in your tasklist. Want to:"
1. Work on one of those
2. Start something new
3. See suggestions (/arc:suggest)

**If recent plans exist:**
"I found a plan for [topic]. Want to:"
1. Continue that work
2. Start something different

**If fresh codebase:**
"What would you like to work on?"
- Describe a feature or change
- Fix a bug
- Explore what needs work (/arc:suggest)

### Step 4: Route to Workflow

Based on their answer:

| Intent | Route to |
|--------|----------|
| "I want to build [feature]" | /arc:ideate |
| "Quick fix/small change" | /arc:build |
| "Continue [existing plan]" | /arc:implement or /arc:detail |
| "Not sure what to work on" | /arc:suggest |
| "Review/improve existing code" | /arc:deslop or /arc:review |
| "Ship to production" | /arc:letsgo |
| "Run tests" | /arc:test |

**Invoke the skill:**
```
Skill arc:[chosen]: "[user's description]"
```

## What /arc is NOT

- Not a replacement for specific commands — it routes TO them
- Not for when you already know what command to use
- Not a status dashboard (use /arc:suggest for that)

## Interop

- Routes to all other /arc:* commands
- Reads /arc:tasklist, /arc:vision, /arc:progress for context
- Uses /arc:suggest when user is unsure
