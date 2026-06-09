---
name: vision
description: |
  Create, review, or revise a concise project vision document that captures what
  a project is, who it is for, why it exists, success criteria, constraints,
  non-goals, and decision principles. Use when starting a new project, clarifying
  product direction, aligning a codebase for future agent work, defining a north
  star, or turning a vague idea into docs/vision.md.
license: MIT
metadata:
  author: howells
website:
  order: 2
  desc: Project north star
  summary: Define what the project is, who it serves, why it exists, and what future decisions should optimize for.
  what: |
    Vision turns a vague product, codebase, or initiative into a concise project north star. It inspects existing project context before asking questions, then creates, reviews, or revises docs/vision.md so future humans and agents have a concrete decision reference.
  why: |
    Projects drift when their purpose is implicit. A good vision document is short enough to read, specific enough to guide implementation, and honest about constraints, non-goals, and unresolved assumptions.
  decisions:
    - Inspect the codebase before asking questions.
    - Do not run a long interview when existing context is enough for a credible draft.
    - Include non-goals and decision principles so the document can resolve tradeoffs.
    - Keep the artifact focused on docs/vision.md unless the user specifies another path.
  workflow:
    position: spine
    after: go
---

<tool_restrictions>

# MANDATORY Tool Restrictions

## REQUIRED TOOLS:

- **`AskUserQuestion`** — Preserve the one-question-at-a-time interaction pattern for every question in this skill, including mode selection, missing context, and draft validation. In Claude Code, use the tool. In Codex, ask one concise plain-text question at a time unless a structured question tool is actually available in the current mode. Keep context before the question to 2-3 sentences max, and do not narrate missing tools or fallbacks to the user.
  </tool_restrictions>

<arc_runtime>
This workflow requires the full Arc bundle, not a prompts-only install.

Paths in this skill use these conventions:

- `agents/...`, `references/...`, `disciplines/...`, `templates/...`, `scripts/...`, `rules/...`, `skills/<name>/...` are Arc-owned files at the plugin root. Resolve the plugin root from this skill's filesystem location — it's the directory containing `agents/` and `skills/`.
- `./...` is local to this skill's directory.
- `.ruler/...`, `docs/...`, `src/...`, or any project-relative path refers to the user's project repository.
  </arc_runtime>

# Vision Workflow

Create, review, or revise a project vision document. The output should be useful to future humans and agents: specific enough to guide decisions, short enough to be read, and honest about constraints.

## Start

When invoked:

1. State that you are using `/arc:vision`.
2. Determine whether the user wants to create, review, or revise a vision.
3. Inspect existing project context before asking questions.
4. Ask one focused question at a time only when the direction is still unclear.

## Context To Inspect

Read what exists from this list. Do not fail if a file is absent:

- `docs/vision.md`
- `docs/arc/vision.md`
- `README.md`
- `AGENTS.md`
- `CONTEXT.md`
- `docs/brand-system.md`
- `docs/design-context.md`
- `package.json`
- app, package, or domain folder names that reveal the product shape

If `docs/vision.md` exists and the user did not specify a mode, ask:

```
AskUserQuestion:
  question: "I found an existing vision document. What would you like to do?"
  header: "Existing Vision"
  options:
    - label: "Review"
      description: "Assess the current vision and suggest improvements without overwriting it"
    - label: "Revise"
      description: "Update the vision based on current context or a new direction"
    - label: "Start fresh"
      description: "Replace it with a new vision document"
```

If no existing vision exists and the user's intent is clear, draft from available context. Do not force a long interview.

## Useful Questions

Ask only the questions needed to fill real gaps:

- What is the project?
- Who is it for?
- What problem does it solve?
- What should be true if it succeeds?
- What should it deliberately not become?
- What constraints should future work respect?
- What tradeoffs should future decisions optimize for?

## Output

Create or update `docs/vision.md` by default unless the user specifies another path.

Use this structure unless the project already has a better local convention:

```markdown
# Vision

## What This Is

## Who It Serves

## Why It Exists

## Success

## Principles

## Non-Goals

## Open Questions
```

A good Arc vision document normally fits in 500-900 words.

## Writing Rules

- Describe the actual product, audience, and value, not a generic category.
- Prefer concrete nouns and decision language over marketing claims.
- Include non-goals. A vision without boundaries is not operational.
- Include decision principles that can resolve future tradeoffs.
- Separate facts from assumptions when the codebase or user input does not fully support a claim.
- Avoid hype phrases such as "revolutionary", "seamless", "cutting-edge", or "delightful" unless the product context proves they are precise.
- Do not invent business metrics, customer segments, compliance requirements, or committed timelines.
- Do not add broad documentation files beyond the requested vision artifact.
- Keep open questions explicit when direction depends on unresolved assumptions.

## Review Mode

When reviewing an existing vision, lead with issues:

1. Missing or vague audience.
2. Unclear problem statement.
3. No observable success criteria.
4. No non-goals or constraints.
5. Claims contradicted by the codebase.
6. Language too generic to guide implementation.
7. Decision principles that are slogans rather than usable tradeoff rules.

If the user asked only for a review, do not overwrite the file. Provide findings and a proposed revision excerpt instead.

## Revise Mode

When revising:

1. Preserve accurate, specific claims from the existing document.
2. Replace generic or outdated claims with codebase-backed language.
3. Mark assumptions rather than presenting them as facts.
4. Keep the document concise even when the project is complex.
5. Save the final revision to `docs/vision.md` unless the user specified another path.

## Save

When creating or revising:

```bash
mkdir -p docs
# Write to docs/vision.md unless another path was requested.
```

Commit the vision document when the user has asked Arc to own the change or when continuing an Arc workflow where committing is expected:

```bash
git add docs/vision.md
git commit -m "docs: update project vision"
```

## Interop

- `/arc:ideate` reads vision for product and scope context.
- `/arc:launch` checks whether launch posture still matches the project intent.

<completion_check>
Before finishing, verify that the vision:

- Names the product and audience.
- Explains why the project exists.
- Gives future agents enough context to make implementation decisions.
- Includes non-goals or constraints.
- Includes decision principles that can resolve tradeoffs.
- Lists open questions when the vision depends on unresolved assumptions.
  </completion_check>
