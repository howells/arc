---
name: vision
description: |
  Create or maintain a project's root CONTEXT.md — goals, product boundary,
  non-goals, decision principles, and a domain language glossary. Use when starting
  a new project, clarifying product direction, aligning a codebase for future agent
  work, defining a north star, pinning down domain terminology, or turning a vague
  idea into a durable project foundation.
license: MIT
metadata:
  author: howells
website:
  order: 2
  desc: Project north star
  summary: Define what the project is, who it serves, why it exists, its boundary, and its domain language in a durable root CONTEXT.md.
  what: |
    Vision turns a vague product, codebase, or initiative into a concise project foundation. It inspects existing project context before asking questions, then creates or maintains root CONTEXT.md — goals, product boundary, non-goals, decision principles, and a domain glossary — so future humans and agents have a concrete decision reference. For monorepos with several distinct contexts it can add a root CONTEXT-MAP.md pointing to per-package CONTEXT.md files.
  why: |
    Projects drift when their purpose is implicit. A good CONTEXT.md is short enough to read, specific enough to guide implementation, honest about constraints and non-goals, and precise about the domain terms the codebase actually uses. Keeping it at the root, where agents look first, is why it gets read and sustained.
  decisions:
    - Inspect the codebase before asking questions.
    - Do not run a long interview when existing context is enough for a credible draft.
    - Include non-goals and decision principles so the document can resolve tradeoffs.
    - Maintain root CONTEXT.md — extend an existing one rather than overwriting user content.
  workflow:
    position: spine
    after: using-arc
---

<tool_restrictions>
Ask one question at a time. In Claude Code use `AskUserQuestion`; elsewhere ask a single concise plain-text question. Keep any lead-in to 2-3 sentences. Don't narrate missing tools or fallbacks.
</tool_restrictions>

<arc_runtime>
Requires the full Arc bundle. Arc-owned paths (`agents/`, `references/`, `disciplines/`, `templates/`, `scripts/`, `rules/`, `skills/`) resolve from the plugin root — the directory containing `agents/` and `skills/`. Everything else is the user's repository.
</arc_runtime>

# Vision Workflow

Create or maintain a project's root `CONTEXT.md`: its goals, product boundary, non-goals, decision principles, and domain language. The output should be useful to future humans and agents: specific enough to guide decisions, short enough to be read, and honest about constraints.

## Start

When invoked:

1. State that you are using `/arc:vision`.
2. Determine which mode applies to the project's CONTEXT.md: review, extend, or start fresh.
3. Inspect existing project context before asking questions.
4. Ask one focused question at a time only when the direction is still unclear.

## Context To Inspect

Read what exists from this list. Do not fail if a file is absent:

- `CONTEXT.md`
- `CONTEXT-MAP.md`
- `docs/vision.md` (legacy — fold its content into CONTEXT.md if found)
- `README.md`
- `AGENTS.md`
- `docs/brand-system.md`
- `docs/design-context.md`
- `package.json`
- app, package, or domain folder names that reveal the product shape

If `CONTEXT.md` already exists, **read it first and preserve the user's content**. Update and extend it — sharpen goals, boundary, and glossary — rather than overwriting. If the user did not specify a mode, ask:

```
AskUserQuestion:
  question: "I found an existing CONTEXT.md. What would you like to do?"
  header: "Existing Context"
  options:
    - label: "Review"
      description: "Assess the current CONTEXT.md and suggest improvements without overwriting it"
    - label: "Extend"
      description: "Update and sharpen goals, boundary, and glossary, preserving existing content"
    - label: "Start fresh"
      description: "Replace it with a new CONTEXT.md"
```

If no user response is available (an unattended or non-interactive run), default to Review — the read-mostly mode — and say so in the output.

If a legacy `docs/vision.md` exists but no `CONTEXT.md`, offer to fold it into a new root `CONTEXT.md`. If no foundation exists and the user's intent is clear, draft from available context. Do not force a long interview.

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

Create or update root `CONTEXT.md` by default unless the user specifies another path.

Use this structure unless the project already has a better local convention:

```markdown
# <Project> Context

<One or two sentences: what this is and who it serves.>

## Goals

<Why it exists, what it should achieve, and what is true if it succeeds.>

## Product Boundary

<What this project owns, and what it deliberately does not become (non-goals + constraints).>

## Principles

<Decision rules that can resolve future tradeoffs.>

## Language

<Domain glossary: the terms the codebase and product actually use, each defined in one line.>

## Open Questions

<Unresolved assumptions the direction depends on.>
```

A good CONTEXT.md normally fits in 500-900 words.

### Multi-Context Monorepos

If the repo has several distinct contexts (e.g. separate apps or publishable packages with their own product shape), offer to create a root `CONTEXT-MAP.md` that points to per-package `CONTEXT.md` files:

```markdown
# Context Map

- `packages/<name>/CONTEXT.md` — <one-line scope>
- `apps/<name>/CONTEXT.md` — <one-line scope>
```

Keep the root `CONTEXT.md` for whole-project goals and boundary; let each package's CONTEXT.md hold its local goals and glossary. Only propose this when the repo genuinely has multiple contexts — do not split a single-context project.

## Writing Rules

- Describe the actual product, audience, and value, not a generic category.
- Prefer concrete nouns and decision language over marketing claims.
- Include non-goals. A vision without boundaries is not operational.
- Include decision principles that can resolve future tradeoffs.
- Separate facts from assumptions when the codebase or user input does not fully support a claim.
- Avoid hype phrases such as "revolutionary", "seamless", "cutting-edge", or "delightful" unless the product context proves they are precise.
- Do not invent business metrics, customer segments, compliance requirements, or committed timelines.
- Do not add broad documentation files beyond CONTEXT.md (and CONTEXT-MAP.md when the repo warrants it).
- Define domain terms the codebase actually uses; do not pad the glossary with generic vocabulary.
- Keep open questions explicit when direction depends on unresolved assumptions.

## Review Mode

When reviewing an existing CONTEXT.md, lead with issues:

1. Missing or vague audience.
2. Unclear problem statement.
3. No observable success criteria.
4. No non-goals or product boundary.
5. Claims contradicted by the codebase.
6. Language too generic to guide implementation.
7. Decision principles that are slogans rather than usable tradeoff rules.
8. A missing or stale domain glossary — terms the codebase uses but the document does not define.

If the user asked only for a review, do not overwrite the file. Provide findings and a proposed revision excerpt instead.

## Extend Mode

When extending an existing CONTEXT.md:

1. Read it first and preserve accurate, specific, user-authored claims.
2. Replace generic or outdated claims with codebase-backed language.
3. Sharpen the goals, product boundary, and glossary sections rather than rewriting the whole file.
4. Mark assumptions rather than presenting them as facts.
5. Keep the document concise even when the project is complex.
6. Save back to `CONTEXT.md` unless the user specified another path.

## Start Fresh Mode

When starting fresh — no CONTEXT.md exists, or the user chose to replace the existing one — write a new document using the structure in [Output](#output), then save it as described under [Save](#save).

## Save

When creating or updating, write to root `CONTEXT.md` unless another path was requested. Fold any legacy `docs/vision.md` content into it rather than maintaining both.

Offer to commit the change with one question — never commit silently:

```
AskUserQuestion:
  question: "CONTEXT.md is ready. Commit it now?"
  header: "Commit"
  options:
    - label: "Commit"
      description: "git add CONTEXT.md && commit with a docs message"
    - label: "Leave it"
      description: "Save the file but do not commit"
```

On "Commit":

```bash
git add CONTEXT.md
test -f CONTEXT-MAP.md && git add CONTEXT-MAP.md
git commit -m "docs: update project context"
```

## Interop

The project foundation lives in root `CONTEXT.md`. Downstream Arc skills should read it for product goals, boundary, and domain language.

- `/arc:ideate` reads CONTEXT.md for product and scope context.

<completion_check>
Before finishing, verify that CONTEXT.md:

- Names the product and audience.
- Explains why the project exists.
- States the product boundary and non-goals.
- Gives future agents enough context to make implementation decisions.
- Includes decision principles that can resolve tradeoffs.
- Defines the domain terms the codebase uses.
- Lists open questions when direction depends on unresolved assumptions.

</completion_check>
