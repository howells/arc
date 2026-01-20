---
name: design
description: |
  Create distinctive, non-generic UI designs with aesthetic direction and ASCII wireframes.
  Use when asked to "design the UI", "create a layout", "wireframe this", or when building
  UI that should be memorable rather than generic. Avoids AI slop patterns.
license: MIT
metadata:
  author: howells
---

# Design Workflow

Create distinctive, non-generic UI. Avoids AI slop (purple gradients, cookie-cutter layouts).

<progress_context>
**Use Read tool:** `docs/progress.md` (first 50 lines)

Check for related prior design work and aesthetic decisions.
</progress_context>

## Prerequisites

- **Dev server running** — Ensure the app is running locally so you can visually verify changes
- **Chrome MCP available** — Use browser automation to screenshot and check layouts frequently

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
- **Typography**: [display] + [body] (NOT Roboto/Arial/system-ui)
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

### Step 5b: Visual Verification (During Build)

**Use Chrome MCP tools liberally** to check how the layout actually looks as you build:

1. **After each significant change** — Take a screenshot to verify:
   ```
   mcp__claude-in-chrome__computer action=screenshot
   ```

2. **Check responsive behavior** — Resize and screenshot:
   ```
   mcp__claude-in-chrome__resize_window width=375 height=812  # Mobile
   mcp__claude-in-chrome__computer action=screenshot
   mcp__claude-in-chrome__resize_window width=1440 height=900 # Desktop
   ```

3. **Verify spacing, alignment, typography** — Don't assume it looks right. See it.

4. **Check for visual conflicts** — Look for:
   - Components overlapping or clipping each other
   - Elements clashing with existing UI (headers, footers, sidebars)
   - Z-index issues causing unexpected layering
   - Scroll containers behaving unexpectedly
   - Fixed/sticky elements interfering with content

5. **Iterate visually** — If something looks off, fix it immediately before moving on.

**When to screenshot:**
- After implementing a new component
- After adding responsive styles
- After adjusting spacing/layout
- Before declaring a section "done"
- When something feels uncertain

The goal: **never commit UI code without visually verifying it looks correct.**

### Anti-Patterns to Avoid

See `${CLAUDE_PLUGIN_ROOT}/references/frontend-design.md` for the full list of anti-patterns and the design review checklist.

### Step 6: Optional UI Compliance Review

If the `web-design-guidelines` skill is available:
```
Skill web-design-guidelines: "Review the design against Web Interface Guidelines.
Focus on: [specific areas of concern]"
```

This provides external validation against established UI best practices.

<progress_append>
After completing the design work, append to progress journal:

```markdown
## YYYY-MM-DD HH:MM — /arc:design
**Task:** [UI/component designed]
**Outcome:** Complete
**Files:** [Design doc or component files]
**Decisions:**
- Tone: [aesthetic direction]
- Memorable: [key element]
**Next:** /arc:build or /arc:implement

---
```
</progress_append>

## Interop

- Can invoke **/arc:build** for quick implementation
- Can invoke **/arc:implement** for planned implementation
- Aesthetic direction feeds into implementation tasks
- Can invoke **web-design-guidelines** skill for compliance review (if available)
- Uses **Chrome MCP** (`mcp__claude-in-chrome__*`) for visual verification throughout
