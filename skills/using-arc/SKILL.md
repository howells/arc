---
name: using-arc
description: Use when starting any conversation - establishes Arc's skill routing, instruction priority, and bootstrap rules
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

<arc_runtime>
Arc-owned files live under the Arc install root for full-runtime installs.

Set `${ARC_ROOT}` to that root and use `${ARC_ROOT}/...` for Arc bundle files such as
`references/`, `disciplines/`, `agents/`, `templates/`, `scripts/`, and `rules/`.

Project-local files stay relative to the user's repository.
</arc_runtime>

# Using Arc

Arc has a broad workflow surface. Use this skill as the small control plane that decides
how to route work without loading every workflow into context at once.

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

## Platform Adaptation

<required_reading>
Arc skills may mention Claude Code tool names. For platform mappings and equivalents, read:

`${ARC_ROOT}/references/platform-tools.md`
</required_reading>

When a skill says `AskUserQuestion`, preserve the behavior rather than the literal tool name.
In Codex, ask one concise plain-text question at a time unless a structured question tool is actually available in the current mode.
Do not narrate tool fallbacks or tell the user that a question tool is unavailable.

## Arc Runtime

Arc supports two install classes:

- **Full-runtime installs**: Claude plugin and Codex installer. These include Arc-owned `${ARC_ROOT}/agents/`, `${ARC_ROOT}/references/`, `${ARC_ROOT}/disciplines/`, `${ARC_ROOT}/templates/`, and `${ARC_ROOT}/scripts/`.
- **Prompt-only installs**: `skills.sh` and similar prompt distributors. These copy `SKILL.md` files only.

When a workflow needs Arc-owned files, resolve the Arc install root from the loaded skill's location and refer to it as `${ARC_ROOT}`. Use `${ARC_ROOT}/...` for Arc bundle files, and keep project-local paths such as `.ruler/` or `rules/` scoped to the user's repository.

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
- Production readiness -> `letsgo`
- Unsure what to do -> `go` or `suggest`

## Artifact Locations

Arc-owned artifacts live under:

- `docs/arc/specs/`
- `docs/arc/plans/`
- `docs/arc/archive/`
- `docs/arc/progress.md`

If a workflow references legacy `docs/plans/` or `docs/progress.md`, treat those as
compatibility fallbacks while the repo migrates.
