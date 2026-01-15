---
name: design
description: Create distinctive, non-generic UI designs. Establishes aesthetic direction, creates ASCII wireframes, and avoids AI slop patterns.
---

# Design Workflow

Create distinctive, non-generic UI. Avoids AI slop (Inter, purple gradients, cookie-cutter layouts).

## Process

### Step 1: Understand Scope

"What are we designing?"
1. New component/page from scratch
2. Redesign existing UI
3. Review and refine current implementation

### Step 2: Gather Aesthetic Direction

Ask one at a time:

1. "What tone fits this UI?"
   - Minimal, bold, playful, editorial, luxury, brutalist, retro, organic

2. "What should be memorable about this?"
   - The animation? Typography? Layout? A specific interaction?

3. "Any existing brand/style to match, or fresh start?"

4. "Any reference designs or inspiration?"
   - Capture Figma links, screenshots, URLs immediately

### Step 3: Capture Direction

```markdown
## Aesthetic Direction
- **Tone**: [chosen]
- **Memorable element**: [what stands out]
- **Typography**: [display] + [body] (NOT Inter/Roboto/Arial)
- **Color strategy**: [approach - NOT purple gradients]
- **Motion**: [where animation matters]
```

### Step 4: ASCII Wireframe First

Before any code, create ASCII wireframe. See `${CLAUDE_PLUGIN_ROOT}/references/ascii-ui-patterns.md`.

```
┌─────────────────────────────────┐
│  Header                         │
├─────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐      │
│  │  Card   │  │  Card   │      │
│  └─────────┘  └─────────┘      │
└─────────────────────────────────┘
```

Ask: "Does this layout feel right?"

### Step 5: Build or Hand Off

Options:
1. **Build now** → Use /arc:build or /arc:implement
2. **Create plan** → Invoke /arc:detail
3. **Just the design** → Save to docs/plans/ and stop

### Anti-Patterns to Avoid

From `${CLAUDE_PLUGIN_ROOT}/references/frontend-design.md`:
- Inter, Roboto, Arial, system-ui defaults
- Purple-to-blue gradients on white
- White backgrounds with gray cards
- Rounded corners on everything
- Generic Heroicons
- Cookie-cutter component patterns

### Step 6: Optional UI Compliance Review

If the `web-design-guidelines` skill is available:
```
Skill web-design-guidelines: "Review the design against Web Interface Guidelines.
Focus on: [specific areas of concern]"
```

This provides external validation against established UI best practices.

## Interop

- Can invoke **/arc:build** for quick implementation
- Can invoke **/arc:implement** for planned implementation
- Aesthetic direction feeds into implementation tasks
- Can invoke **web-design-guidelines** skill for compliance review (if available)
