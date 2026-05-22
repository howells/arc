---
name: vision
description: |
  Create or review a high-level vision document capturing project goals and purpose.
  Use when asked to "define the vision", "what is this project", "set goals",
  or when starting a new project that needs clarity on purpose and direction.
license: MIT
metadata:
  author: howells
website:
  order: 2
  desc: Project north star
  summary: Define what you're building and why. This document guides every future decision—yours and the AI's.
  what: |
    Vision creates a concise document (500-700 words) capturing why the project exists, who it's for, and what you're explicitly NOT building. Arc reads this document in future sessions, so the AI always understands the bigger picture when making implementation decisions.
  why: |
    Projects drift. Features creep. Without a reference point, both you and the AI lose sight of the goal. The vision document is that reference—something you return to when decisions get hard, and something Arc consults to stay aligned with your intent.
  decisions:
    - "Written for two audiences: you and the AI. Clear enough for both to act on."
    - Non-goals section mandatory. What you won't build prevents scope creep.
    - Lives in docs/vision.md. Arc reads it automatically in future sessions.
  workflow:
    position: spine
    after: go
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## REQUIRED TOOLS:
- **`AskUserQuestion`** — Preserve the one-question-at-a-time interaction pattern for every question in this skill, including gathering context and validating drafts. In Claude Code, use the tool. In Codex, ask one concise plain-text question at a time unless a structured question tool is actually available in the current mode. Keep context before the question to 2-3 sentences max, and do not narrate missing tools or fallbacks to the user.
</tool_restrictions>

<arc_runtime>
This workflow requires the full Arc bundle, not a prompts-only install.

Paths in this skill use these conventions:
- `agents/...`, `references/...`, `disciplines/...`, `templates/...`, `scripts/...`, `rules/...`, `skills/<name>/...` are Arc-owned files at the plugin root. Resolve the plugin root from this skill's filesystem location — it's the directory containing `agents/` and `skills/`.
- `./...` is local to this skill's directory.
- `.ruler/...`, `docs/...`, `src/...`, or any project-relative path refers to the user's project repository.
</arc_runtime>

# Vision Workflow

Create or review a 500-700 word vision document that captures the high-level goals and purpose of the app or codebase.

<progress_context>
**Use Read tool:** `docs/arc/progress.md` (first 50 lines)

Check for recent work that might inform vision decisions.
</progress_context>

## Process

### Step 1: Check for Existing Vision

**Use Read tool:** `docs/vision.md`

**If file exists:** Read it, then ask:
```
AskUserQuestion:
  question: "I found an existing vision document. What would you like to do?"
  header: "Existing Vision"
  options:
    - label: "Review and discuss"
      description: "Walk through the current vision and talk through it"
    - label: "Update"
      description: "Revise the vision based on a new direction"
    - label: "Start fresh"
      description: "Discard the current vision and write a new one"
```

**If not exists:** Proceed to Step 2.

### Step 2: Gather Context

Ask one question at a time. Wait for the user's response before asking the next question.

**Question 1:**
```
AskUserQuestion:
  question: "What is this project? (one sentence)"
  header: "Project Identity"
  options:
    - label: "I'll describe it"
      description: "Type a one-sentence description of what you're building"
```

**Question 2:**
```
AskUserQuestion:
  question: "Who is it for?"
  header: "Target Audience"
  options:
    - label: "I'll describe them"
      description: "Type who the target users or audience are"
```

**Question 3:**
```
AskUserQuestion:
  question: "What problem does it solve?"
  header: "Core Problem"
  options:
    - label: "I'll explain"
      description: "Type the problem this project addresses"
```

**Question 4:**
```
AskUserQuestion:
  question: "What does success look like?"
  header: "Success Criteria"
  options:
    - label: "I'll define it"
      description: "Type what success means for this project"
```

**Question 5:**
```
AskUserQuestion:
  question: "Any constraints or non-goals?"
  header: "Constraints"
  options:
    - label: "Yes, I have some"
      description: "Type constraints or things you're explicitly not building"
    - label: "None right now"
      description: "Skip this and move on to drafting"
```

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

Present the draft in sections. After each section, ask:
```
AskUserQuestion:
  question: "Does this capture it?"
  header: "Section Review"
  options:
    - label: "Yes, looks good"
      description: "Move on to the next section"
    - label: "Needs changes"
      description: "I'll tell you what to adjust"
    - label: "Start this section over"
      description: "Rewrite this section from scratch"
```

### Step 5: Save

```bash
mkdir -p docs
# Write to docs/vision.md
git add docs/vision.md
git commit -m "docs: add project vision"
```

<arc_log>
**After completing this skill, append to the activity log.**
See: `references/arc-log.md`

Entry: `/arc:vision — [Created / Updated] vision document`
</arc_log>

## Interop

- **/arc:ideate** reads vision for context
- **/arc:suggest** references vision as lowest-priority source
- **/arc:launch** checks vision alignment
