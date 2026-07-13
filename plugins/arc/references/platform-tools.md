# Platform Tool Mapping

Arc skills are written primarily for Claude Code naming, but the workflows should adapt to
the current harness instead of assuming one toolset.

## Capability Priority

Treat these as distinct capabilities, not interchangeable tools:

| Capability                    | Preferred                      | Fallbacks                                     | Notes                                              |
| ----------------------------- | ------------------------------ | --------------------------------------------- | -------------------------------------------------- |
| Rendered browser verification | Claude Chrome MCP              | `agent-browser`, Playwright, user screenshots | Use for reviewing the real UI after implementation |
| Browser automation            | `agent-browser`                | Playwright                                    | Prefer `agent-browser` outside Claude Code         |
| Design-source implementation  | Figma MCP                      | Screenshot/manual translation                 | Use when a Figma design exists                     |
| Low-fidelity wireframing      | WireText MCP                   | ASCII wireframes in docs                      | Use for planning structure, not fidelity review    |
| Task tracking                 | Platform-native task/todo tool | Plain progress notes                          | Do not make this a hard dependency                 |

## Claude Code

- `Skill` -> load the named skill
- `Task` -> dispatch a focused subagent
- `AskUserQuestion` -> structured one-question prompt
- `mcp__claude-in-chrome__*` -> preferred rendered browser capture and verification
- WireText MCP -> preferred wireframing tool when available

## Codex

- Native skill discovery loads `SKILL.md` files from `~/.agents/skills/`
- Terminal exploration replaces most `Read` / `Glob` / `Grep` examples
- Treat `AskUserQuestion` as a behavioral requirement, not a literal tool dependency
- Ask exactly one concise question at a time in plain text unless a structured question tool is actually available in the current Codex mode
- Never mention missing or unavailable tool names to the user as part of the fallback
- Use commentary updates for progress instead of Claude-specific question primitives
- Use the built-in plan/todo tools only when a workflow explicitly benefits from them
- Prefer `agent-browser` for browser automation and page capture
- Use Playwright when browser automation must be scripted directly
- Use WireText MCP for low-fidelity wireframes when available; otherwise write ASCII wireframes inline

## Cursor

- Full-runtime install is the Cursor plugin (`.cursor-plugin/`); local path `~/.cursor/plugins/local/arc` or a team marketplace import of `github.com/howells/arc`
- Invoke public workflows with `/<skill-name>` (no `/arc:` prefix): `/ideate`, `/implement`, `/audit`, `/commit`
- Skills and commands ship from the plugin; nested Arc agents are available for Task/subagent dispatch
- Arc's `rules/` corpus stays internal to workflows — it is not injected as always-on Cursor rules
- Treat `AskUserQuestion` as one concise question at a time; use structured prompts when available, otherwise plain text
- Prefer `agent-browser` or Playwright for browser automation; use Cursor browser MCP tools when they are the active harness
- Use WireText MCP for low-fidelity wireframes when available; otherwise write ASCII wireframes inline

## General Guidance

- Prefer the platform's native tool when a skill names an equivalent Claude tool
- Keep the workflow behavior the same even if tool names differ
- When a platform lacks a feature, degrade gracefully rather than inventing ceremony
- Keep Chrome MCP as the preferred path for rendered UI verification in Claude Code
- Do not use WireText as a substitute for rendered browser QA; it is for structural wireframes
