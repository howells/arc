---
name: figma
description: |
  Implement UI directly from Figma designs using the Figma MCP with pixel-perfect fidelity.
  Use when given a Figma URL, asked to "implement from Figma", "match the design",
  or when building UI that needs to precisely match design specs.
license: MIT
metadata:
  author: howells
  argument-hint: <figma-url-or-description>
website:
  desc: Design → code
  summary: Implement UI directly from Figma designs using the Figma MCP with pixel-perfect fidelity.
  what: |
    Figma connects to your Figma file via the Figma MCP server, extracts design tokens and component structure, and generates React components that match the design exactly. It handles spacing, typography, colors, and responsive breakpoints.
  why: |
    Design-to-code handoff is where fidelity dies. Figma eliminates the telephone game by reading the source of truth directly.
  decisions:
    - Requires Figma MCP server connection. No screenshot-based guessing.
    - Extracts design tokens first, then components. Systematic over ad-hoc.
    - Pixel-perfect means pixel-perfect. Visual diff verification against the source design.
  agents:
    - figma-implement
---

# Figma Implementation Workflow

Implement UI components directly from Figma designs using the Figma MCP.

<required_reading>
**Load interface rules for UI implementation:**
- ${CLAUDE_PLUGIN_ROOT}/rules/interface/design.md — Visual principles
- ${CLAUDE_PLUGIN_ROOT}/rules/interface/colors.md — Color methodology
- ${CLAUDE_PLUGIN_ROOT}/rules/interface/spacing.md — Spacing system
- ${CLAUDE_PLUGIN_ROOT}/rules/interface/typography.md — Typography rules
- ${CLAUDE_PLUGIN_ROOT}/rules/interface/layout.md — Layout patterns
- ${CLAUDE_PLUGIN_ROOT}/rules/interface/animation.md — If implementing motion
- ${CLAUDE_PLUGIN_ROOT}/rules/interface/forms.md — If implementing forms
- ${CLAUDE_PLUGIN_ROOT}/rules/interface/interactions.md — Touch, keyboard, hover
- ${CLAUDE_PLUGIN_ROOT}/references/frontend-design.md — Fonts and anti-patterns
- ${CLAUDE_PLUGIN_ROOT}/references/component-design.md — React component patterns
</required_reading>

## Prerequisites — CHECK FIRST

**Before doing anything else, verify Figma MCP is available:**

1. **Check MCP Server Installation**
   - Look for `mcp__figma__*` tools in your available tools
   - If no Figma MCP tools exist, **STOP** and notify the user:
     > "The Figma MCP server is not installed. To use /arc:figma, you need to install the Figma MCP server. See: https://github.com/figma/figma-mcp"

2. **Check Authentication**
   - Attempt a simple Figma MCP call (e.g., `mcp__figma__get_design_context` with the provided file)
   - If you receive an authentication error, **STOP** and notify the user:
     > "The Figma MCP server needs authentication. Please configure your Figma access token in the MCP server settings."

3. **Do NOT proceed** if either check fails
   - Do not attempt to implement designs without Figma access
   - Do not guess at design specs
   - Simply halt and inform the user what's needed

## Process

**Only proceed with the following if Figma MCP is available and authenticated.**

Follow the instructions in `${CLAUDE_PLUGIN_ROOT}/agents/design/figma-implement.md`:

1. **Extract Design Intent** — Use Figma MCP to get specs (colors, typography, spacing, shadows, component hierarchy)

2. **Understand Codebase Context** — Find existing design system, component patterns, styling methodology

3. **Implement with Fidelity** — Write code using existing tokens, get padding/spacing right (most commonly missed)

4. **Review and Compare** — Screenshot the result, compare against Figma, fix discrepancies, iterate until matching

## Required Input

- Figma URL (file or specific node)
- OR description of what to find in an already-shared Figma file

## Usage

```
/arc:figma https://figma.com/design/xxx/yyy?node-id=123-456
```

Or if Figma file already shared:
```
/arc:figma "the header component"
```

## Figma MCP Commands

**Get design context:**
```
mcp__figma__get_design_context: fileKey, nodeId
```

**Get screenshot for comparison:**
```
mcp__figma__get_screenshot: fileKey, nodeId
```

**Extract specific values:**
- Colors, gradients
- Typography (font, size, weight, line-height)
- Spacing (padding, margins, gaps)
- Shadows, borders, radii
- Component structure

<progress_context>
**Use Read tool:** `docs/progress.md` (first 50 lines)

Check for related prior UI/design work.
</progress_context>

<progress_append>
After completing the Figma implementation, append to progress journal:

```markdown
## YYYY-MM-DD HH:MM — /arc:figma
**Task:** [Component/screen implemented from Figma]
**Outcome:** [Complete / In Progress / Blocked]
**Files:** [Key files created/modified]
**Decisions:**
- [Design system tokens used]
- [Any deviations from design and why]
**Next:** [Follow-up work if any]

---
```
</progress_append>

## Interop

- Use **/arc:design** if you need to create a design from scratch (no Figma reference)
- Use **/arc:build** for quick implementations without Figma
- Use **/arc:implement** for planned multi-step implementations
