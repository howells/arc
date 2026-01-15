---
name: figma
description: Implement UI directly from Figma designs using the Figma MCP. Extracts specs and builds with pixel-perfect fidelity.
---

# Figma Implementation Workflow

Implement UI components directly from Figma designs using the Figma MCP.

## Process

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

## Interop

- Use **/arc:design** if you need to create a design from scratch (no Figma reference)
- Use **/arc:build** for quick implementations without Figma
- Use **/arc:implement** for planned multi-step implementations
