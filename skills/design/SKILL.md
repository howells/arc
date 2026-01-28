---
name: design
description: |
  Create distinctive, non-generic UI designs with aesthetic direction and ASCII wireframes.
  Use when asked to "design the UI", "create a layout", "wireframe this", or when building
  UI that should be memorable rather than generic. Avoids AI slop patterns.
license: MIT
metadata:
  author: howells
website:
  order: 8
  desc: Visual design direction
  summary: Establish the visual identity for your UI—colors, typography, spacing, tone. Comes with opinionated references to avoid generic AI aesthetics.
  what: |
    Design walks you through visual decisions: What's the tone? What makes this memorable? From there it produces a design direction document—color palette, typography scale, spacing system, and ASCII wireframes for key screens. It draws from built-in references on font pairing, component patterns, and animation. As you build, it can screenshot via Chrome to verify implementation matches intent.
  why: |
    AI-generated UI tends toward the same safe choices—the same gradients, the same card layouts, the same hero sections. Design fights this by forcing you to make distinctive choices upfront and documenting them. The references help you avoid common pitfalls and give the AI better taste.
  decisions:
    - Opinionated references built in. Font choices, spacing scales, animation patterns—not starting from scratch.
    - ASCII wireframes over mockups. Version-controllable, forces focus on structure.
    - Visual verification via screenshots. Catches when implementation drifts from intent.
---

# Design Workflow

Create distinctive, non-generic UI. Avoids AI slop (purple gradients, cookie-cutter layouts).

**Announce at start:** "I'm using the design skill to create distinctive, non-generic UI."

<rules_context>
**Load interface rules for UI work:**

**Use Read tool:** `${CLAUDE_PLUGIN_ROOT}/rules/interface/index.md`

Then load relevant rules based on the task:
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/design.md` — Visual principles
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/colors.md` — Color palettes
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/spacing.md` — Spacing system
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/typography.md` — Typography rules
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/layout.md` — Layout patterns, z-index
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/animation.md` — If motion is involved
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/forms.md` — If designing forms
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/interactions.md` — Touch, keyboard, hover patterns
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/marketing.md` — If designing marketing pages

Also load references:
- `${CLAUDE_PLUGIN_ROOT}/references/design-philosophy.md` — Timeless principles
- `${CLAUDE_PLUGIN_ROOT}/references/frontend-design.md` — Fonts, checklist, anti-patterns
- `${CLAUDE_PLUGIN_ROOT}/references/component-design.md` — React component patterns
</rules_context>

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

Capture **concrete visual decisions**, not conceptual themes. No metaphors, no "vibes."

```markdown
## Aesthetic Direction
- **Tone**: [chosen - e.g., "minimal", "bold", "editorial"]
- **Memorable element**: [specific - e.g., "oversized typography", "micro-interactions on hover"]
- **Typography**: [actual fonts - e.g., "Inter for body, Tiempos for headings"]
- **Colors**: [specific palette - e.g., "Near-black (#0a0a0a) background, amber (#f59e0b) accents"]
- **Spacing**: [system - e.g., "8px base unit, generous padding (24-48px)"]
- **Motion**: [where and how - e.g., "subtle fade-ins on scroll, no bounce effects"]
```

**❌ Bad:** "Direction: Darkroom / Metaphor: Photo emerging from developer bath / Vibe: Analog, craft"
**✅ Good:** "Dark UI with warm red accents (#dc2626), high contrast text, Söhne font family"

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

**Use AskUserQuestion tool:**
```
Question: "Design ready. What would you like to do with it?"
Header: "Next step"
Options:
  1. "Build now" (Recommended) — Jump to /arc:build or /arc:implement
  2. "Create implementation plan" — Run /arc:detail for detailed task breakdown
  3. "Save design only" — Save to docs/plans/ and stop here
```

**IMPORTANT: Do NOT automatically invoke skills. Save the design, then STOP.**

**If option 1:** Save design doc, then tell the user: "Run `/arc:build` to start building."
**If option 2:** Save design doc, then tell the user: "Run `/arc:detail` to create a detailed implementation plan."
**If option 3:** Save design doc and tell the user they can return later.

**Do NOT invoke `/arc:build`, `/arc:implement`, or `/arc:detail` yourself — wait for the user to do so.**

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

**🚫 Never use sparkles/stars to denote AI or ML features.** This visual cliché has become the "clip art" of AI interfaces—overused, meaningless, and instantly dated. Find distinctive ways to communicate intelligence: motion, progressive disclosure, conversational patterns, or simply letting the capability speak for itself without decorative badges.

**🚫 Never propose conceptual "themes" with metaphors unless explicitly requested.** Avoid outputs like "Direction: Darkroom / Metaphor: Photo emerging from developer bath" or "Direction: Geode / Metaphor: Crystal beauty inside rough stone." This is overwrought and impractical. Instead, make direct visual decisions: "Dark background with warm accent colors" or "High contrast with generous whitespace." Themes and metaphors are creative exercises that rarely translate to good UI—stick to concrete visual choices (colors, typography, spacing, layout) that can actually be implemented.

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

<success_criteria>
Design is complete when:
- [ ] Aesthetic direction established (tone, memorable element, typography, color)
- [ ] ASCII wireframes created and approved
- [ ] Design direction document saved
- [ ] Implementation started or handed off to /arc:build or /arc:implement
- [ ] Progress journal updated
</success_criteria>

## Interop

- Can invoke **/arc:build** for quick implementation
- Can invoke **/arc:implement** for planned implementation
- Aesthetic direction feeds into implementation tasks
- Can invoke **web-design-guidelines** skill for compliance review (if available)
- Uses **Chrome MCP** (`mcp__claude-in-chrome__*`) for visual verification throughout
