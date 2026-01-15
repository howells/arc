---
description: UI design and redesign workflow
references: references/ascii-ui-patterns.md, references/frontend-design.md
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

Before any code, create ASCII wireframe. See `references/ascii-ui-patterns.md`.

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
1. **Build now** → Use /arc:build or /implement
2. **Create plan** → Invoke detail workflow
3. **Just the design** → Save to docs/plans/ and stop

### Anti-Patterns to Avoid

From `references/frontend-design.md`:
- Inter, Roboto, Arial, system-ui defaults
- Purple-to-blue gradients on white
- White backgrounds with gray cards
- Rounded corners on everything
- Generic Heroicons
- Cookie-cutter component patterns

## Interop

- Can invoke **/build** for quick implementation
- Can invoke **/implement** for planned implementation
- Aesthetic direction feeds into implementation tasks
