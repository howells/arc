---
name: naming
description: |
  Generate and validate project names. Reads codebase context, produces candidates
  using tech naming strategies, and checks domain + GitHub availability.
  Use when naming a new project, renaming, or validating an existing name.
license: MIT
metadata:
  author: howells
website:
  order: 19
  desc: Project naming
  summary: Generate project name candidates and validate domain + GitHub availability.
  what: |
    Naming reads your codebase to understand what you're building, then generates 8-12 name candidates using proven tech naming strategies (verb, metaphor, portmanteau, compound, etc.). Each candidate is validated against domain availability across all Vercel-supported TLDs, checked for popular GitHub repos with the same name, and searched for existing product conflicts.
  why: |
    A good name is the first thing users see and the last thing they forget. But naming is hard — you need something short, memorable, spellable, and available. This skill removes the guesswork by generating candidates systematically and validating them before you get attached.
  decisions:
    - "Domain availability is checked via whois (.com) and dig (all other TLDs). Priority TLDs: .com, .dev, .app, .sh, .io."
    - "GitHub is checked for popular repos (1k+ stars), not username availability."
    - "Web search validates no existing products share the name in the same space."
---

# Naming Workflow

Generate and validate project/product name candidates using the naming agent.

## What This Does

1. Reads your project materials (README, package.json, vision doc)
2. Extracts naming seeds (core function, metaphors, audience, differentiators)
3. Generates 8-12 name candidates using tech naming strategies
4. **Checks domain availability** across all Vercel-supported TLDs
5. **Checks GitHub** for popular repos with the same name
6. **Searches for existing products** in the same space
7. Presents ranked recommendations with availability matrix

## Process

### Step 1: Read the Project

**Use Task tool to spawn the naming agent:**
```
Task agent: arc:research:naming
"Read the codebase at [path] and generate name candidates.
Check domain availability, GitHub popularity, and product conflicts.
Present ranked recommendations."
```

The agent handles the full naming process autonomously.

### Step 2: Present Results

The agent returns a structured report. Present it to the user as-is.

### Step 3: Explore Further

If the user likes a name, offer:
- "Want me to check more TLDs for [name]?"
- "Want me to generate more names in the [strategy] style?"

If the user wants to buy:
- "You can register [domain] via `vercel domains buy [domain]`"

## Usage

```
/arc:naming                     # Name the current project
/arc:naming ~/Sites/myproject   # Name a specific project
```

## Output

For each recommended name:
- **Strategy used** — Verb, Metaphor, Portmanteau, etc.
- **Why it works** — What makes this name fit the project
- **Domain availability** — Matrix across priority TLDs + all Vercel TLDs with no DNS
- **GitHub conflicts** — Popular repos (1k+ stars) sharing the name
- **Product conflicts** — Existing products in the same space

## When to Use

- Starting a new project and need a name
- Current name feels weak or generic
- Validating an existing name choice
- Rebranding or renaming
- Checking domain availability for a name you like
