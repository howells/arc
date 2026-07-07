---
name: using-arc
description: Use when starting any conversation - establishes Arc's skill routing, instruction priority, and bootstrap rules
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

<arc_runtime>
Arc-owned files live at the Arc plugin root for full-runtime installs.

Skills and agents reference Arc-owned files using bare relative paths from the plugin root: `agents/`, `references/`, `disciplines/`, `templates/`, `scripts/`, `rules/`, and `skills/<name>/`. Resolve the plugin root by walking up from a SKILL.md or agent file's location (it's the directory containing `agents/` and `skills/`).

Project-local files stay relative to the user's repository (`.ruler/`, `docs/`, `src/`, etc.).
</arc_runtime>

# Using Arc

Arc's canonical product definition, domain language, and operating boundary live in
`CONTEXT.md` at the Arc repository root. This skill applies that context at session
startup.

Arc has a broad workflow surface. Use this skill as the small control plane that decides
how to route work without loading every workflow into context at once.

Arc is self-contained and lifecycle-focused. Its job is to move software work from idea
to shipped code through Arc-owned workflows, not to act as a general registry for
external personal skills. When a specialist practice is useful, absorb it into the
relevant Arc workflow in Arc's own language.

## Instruction Priority

When instructions conflict, use this order:

1. User instructions in the conversation
2. Project instructions (`AGENTS.md`, `CLAUDE.md`, repo docs)
3. Arc skills
4. Default system behavior

The user stays in control. Arc provides process, not authority over explicit user intent.

## The Rule

Before substantial work, decide whether an Arc skill clearly applies.

- If the user names an Arc skill, use it.
- If the task clearly matches an Arc workflow, use that skill before acting.
- If the task is small, direct, or outside Arc's workflows, respond normally.

Arc should improve routing, not create ceremony for every trivial request.

Do not route users to external skill collections as part of Arc's normal operation.
External skills can inspire Arc workflow design, but Arc workflows must remain usable on
their own.

## Platform Adaptation

<required_reading>
Arc skills may mention Claude Code tool names. For platform mappings and equivalents, read:

`references/platform-tools.md`
</required_reading>

When a skill says `AskUserQuestion`, preserve the behavior rather than the literal tool name.
In Codex, ask one concise plain-text question at a time unless a structured question tool is actually available in the current mode.
Do not narrate tool fallbacks or tell the user that a question tool is unavailable.

## Arc Runtime

Arc supports two install classes:

- **Full-runtime installs**: Claude plugin and Codex installer. These include Arc-owned `agents/`, `references/`, `disciplines/`, `templates/`, and `scripts/`.
- **Prompt-only installs**: `skills.sh` and similar prompt distributors. These copy `SKILL.md` files only.

When a workflow needs Arc-owned files, resolve the Arc plugin root by walking up from the loaded skill's filesystem location (it's the directory containing `agents/` and `skills/`). Skills reference Arc-owned files using bare relative paths from that root: `agents/...`, `references/...`, `disciplines/...`, `templates/...`, `scripts/...`, `rules/...`, `skills/<name>/...`. Project-local paths such as `.ruler/`, `docs/`, `src/`, or the user's own `rules/` stay scoped to the user's repository.

If the requested workflow depends on Arc-owned files and the environment only has prompt-only skills, stop early and tell the user to upgrade to the full Claude plugin or Codex installer.

For UI work, keep these roles separate:

- WireText -> low-fidelity wireframes and layout exploration
- Chrome MCP -> preferred rendered-page verification in Claude Code
- `agent-browser` -> preferred browser automation fallback outside Claude Code
- Playwright -> scripted browser fallback when needed
- Figma MCP -> implementation from real design files

## Progressive Disclosure

Do not preload large Arc workflows.

- Start with the smallest relevant skill
- Load reference files only when the active task actually needs them
- Prefer targeted rules and references over broad up-front reading

## Workflow Routing

Use these defaults:

- New feature or product thinking -> `ideate`
- Plan execution -> `implement`
- Small scoped change -> `implement`
- Architecture or quality review -> `review` or `audit`
- Testing work -> `testing`
- Go-live/shareability readiness -> `launch`
- Commit, push, or simple publish -> `commit` (cross-cutting)
- Version bumps, changelogs, or coordinated multi-package releases -> `release` (cross-cutting)
- Unsure what to do -> ask one focused question, then route to the smallest matching workflow

When a task needs a specialist lens, keep the routing Arc-native:

- Ambiguous product intent -> `vision`, `ideate`, or `review` with one focused clarifying question
- Reuse or duplicated UI patterns -> `implement`, `review`, or `audit`
- Public API documentation -> package-focused `implement` or external documentation skills
- Architecture boundaries or oversized modules -> `review`, `audit`, or `implement`
- Rendered UX, browser behavior, and responsive issues -> `implement` when tied to Arc UI work, otherwise external rendered-app QA skills

**Library track:** For a single-package repo (a library or CLI rather than a deployed app), the common lifecycle is `ideate` (light) -> `implement` -> `release`. Vision and launch carry explicitly optional weight here — a library has no go-live URL, so reach for them only when they genuinely help.

## Artifact Locations

Arc-owned artifacts live under:

- `docs/arc/specs/`
- `docs/arc/plans/`
- `docs/arc/audits/`
- `docs/arc/archive/`

The vision artifact is the repository's root `CONTEXT.md` (plus `CONTEXT-MAP.md` for multi-context monorepos), not a `docs/` file.

Architectural decisions live in `docs/adr/` — that is the canonical location. Do not create or route to `docs/arc/decisions/`. If a repo already has both `docs/adr/` and a legacy `docs/arc/decisions/`, treat `docs/adr/` as canonical and migrate decisions out of `docs/arc/decisions/`.

If a workflow references legacy `docs/plans/`, treat it as a compatibility fallback while the repo migrates.
