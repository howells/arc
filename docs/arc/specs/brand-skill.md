# /arc:brand — Visual Identity Skill

**Status:** Design spec
**Author:** howells
**Date:** 2026-03-18

---

## Problem

Arc's `/arc:design` creates per-feature UI, but there's no upstream identity workflow. Users either:
- Start `/arc:design` with no brand foundation, making ad-hoc aesthetic choices
- Copy brand decisions manually into `design-context.md` without a guided process
- End up with generic tech-startup aesthetics because nothing pushed them toward distinctiveness

## Solution

A new `/arc:brand` skill that guides users through brand discovery and produces a complete visual identity system — not a generic guidelines doc, but an opinionated, applied identity with generated assets.

## Workflow Position

**Peer to `/arc:design`** — they do different things but inform each other.

```
/arc:vision (project goals)
    ↕
/arc:brand (visual identity system) ←→ /arc:design (feature UI)
    ↓                                      ↓
docs/brand-system.md                  docs/design-context.md
+ tokens + assets                     + wireframes + specs + reusable UI patterns
```

- `/arc:brand` establishes identity: who you are visually
- `/arc:design` applies identity: how features look
- Either can run first; each reads the other's output if it exists
- `/arc:design` inherits from `brand-system.md` when present, never re-asks brand questions

---

## Phases

### Phase 0: Gather References

**Images are first-class inputs.** The skill asks for:
- Screenshots of brands/sites they admire
- Logos or wordmarks they like
- Color palettes or swatches
- Fonts they're drawn to
- Physical objects, packaging, spaces (not just digital)

Also reads existing context:
- `docs/brand-system.md` (existing brand — offer to evolve, not replace)
- `docs/design-context.md` (existing design decisions)
- `docs/vision.md` (project goals, audience)
- Any fonts already in the project (check `public/fonts/`, `next.config`, CSS imports)

If no references provided, the skill asks probing questions about the *feeling* they want — but always pushes toward concrete visual references over abstract adjectives.

### Phase 1: Brand Discovery

Collaborative dialogue (not a form fill) exploring:

1. **Who is this for?** — Not demographics, but the person's taste level and expectations
2. **What world does this live in?** — Editorial, industrial, luxury, craft, institutional, playful
3. **What should it feel like to use?** — Calm authority, energetic discovery, quiet confidence, bold expression
4. **What must it never be?** — Anti-references are as important as references

The skill is **strongly opinionated**:
- If someone gravitates toward Inter + blue, it doesn't block them but actively presents alternatives: "Inter is excellent for UI text, but for brand identity it's invisible — here's what gives you Inter's clarity with actual personality"
- Warns when choices are trending toward generic tech aesthetics
- Has a curated knowledge of fonts, palettes, and visual systems that goes beyond the usual Google Fonts suggestions

### Phase 2: Generate 5 Directions

The skill generates **5 distinct but aligned brand directions**. Each explores a different axis while staying true to the references and discovery:

Each direction includes:
- **Name** — A short evocative label (e.g., "Quiet Authority", "Raw Craft", "Warm Editorial")
- **Palette** — 5-7 colors in OKLCH with semantic roles (brand, accent, surface, text, muted)
- **Typography** — Display + body + mono fonts with rationale
- **Tone** — One-sentence personality description
- **Mood image** — Generated via `motif` to visualize the direction
- **Type specimen** — How the fonts feel at headline, body, and caption scales

**Presentation:**
- If the project supports it (Next.js, Vite, etc.): generate a **comparison page** at a temporary route (e.g., `/brand-explore`) that renders all 5 directions with live fonts, real colors, and type specimens. User browses and picks in Chrome.
- Fallback: generate a markdown doc with motif mood images, hex swatches, and font specimens. User picks in conversation.

**Direction generation rules:**
- All 5 must be genuinely different — not 5 shades of the same idea
- At least one should be unexpected/challenging (pushes the user's comfort zone)
- None should be generic (no "clean modern minimal" with Inter + gray + blue)
- All should be achievable with available fonts (Google Fonts or fonts already in the project)
- Each must respect the anti-references from Phase 1

### Phase 3: Refine & Converge

User picks a direction (or mixes elements from multiple). The skill then:

1. **Deepens the chosen direction:**
   - Full shade scale (50-900) for each color in OKLCH
   - Tinted neutrals derived from brand colors
   - Complete type hierarchy (display sizes, body, caption, UI, mono)
   - Recommended font weights and tracking per context
   - Border radius, shadow style, line width character

2. **Tests with the user:**
   - Shows the palette applied to common UI patterns (card, button, nav, form)
   - Shows dark mode variant (auto-generated from the palette)
   - Shows the brand at small scale (favicon, avatar) and large scale (hero, OG image)

3. **Iterates** until the user is satisfied

### Phase 4: Generate Assets

Auto-generate using `motif` (with fallback guidance if not available):

| Asset | Tool | Specs |
|-------|------|-------|
| Logo/wordmark | `motif` | SVG-style, brand colors, clean geometry |
| Roundel/avatar | `motif` | Square crop, works at 32px and 512px |
| OG image template | `motif --og` | 1200×630, brand palette, type specimen |
| Favicon | Generated from roundel | 32×32, 180×180, SVG |
| Mood/hero image | `motif` | Brand palette, atmospheric, non-generic |

If `motif` is not available, provide detailed prompts the user can run elsewhere.

### Phase 5: Produce Outputs

#### 1. Brand System Document (`docs/brand-system.md`)

```markdown
# Brand System

## Identity
- **Name:** [project name]
- **Personality:** [2-3 sentence description]
- **Tone:** [one-word label]
- **Anti-patterns:** [what this brand must never be]

## Color Palette

### Brand Colors
| Role | Name | OKLCH | Hex | Usage |
|------|------|-------|-----|-------|
| Brand | [name] | oklch(0.65 0.15 250) | #4A7BF5 | Primary actions, brand marks |
| Accent | [name] | ... | ... | Highlights, interactive elements |
| Surface | [name] | ... | ... | Backgrounds, cards |
| Text | [name] | ... | ... | Body text, headings |
| Muted | [name] | ... | ... | Secondary text, borders |

### Shade Scales
[Full 50-900 scales for each brand color]

### Tinted Neutrals
[Warm/cool neutrals derived from brand hue]

### Dark Mode
[Inverted palette with adjusted lightness/saturation]

## Typography

### Font Stack
| Role | Font | Weight | Tracking | Usage |
|------|------|--------|----------|-------|
| Display | [font] | 600-700 | -0.02em | Headlines, hero text |
| Body | [font] | 400-500 | 0 | Paragraphs, UI text |
| Mono | [font] | 400 | 0 | Code, data, timestamps |

### Type Scale
[Fluid sizes with clamp() values]

### Hierarchy Rules
[When to use display vs body, weight vs size for emphasis]

## Visual Character
- **Border radius:** [sharp/subtle/rounded]
- **Shadow style:** [none/subtle/layered/dramatic]
- **Line weight:** [thin/medium/bold]
- **Density:** [airy/balanced/dense]
- **Motion:** [still/subtle/expressive]

## Logo Usage
- **Clear space:** [minimum padding around logo]
- **Minimum size:** [smallest legible size]
- **Color variants:** [full color, mono, reversed]
- **Don'ts:** [distort, recolor, add effects]

## Brand Voice (brief)
- **Writing style:** [concise/conversational/formal/playful]
- **Capitalization:** [sentence case/title case/lowercase]
- **Terminology:** [key terms and how to use them]
```

#### 2. Design Tokens (CSS/Tailwind)

Generate a token file compatible with the project's setup:
- Tailwind v4: `@theme` block in CSS
- Tailwind v3: `tailwind.config.ts` extend
- Plain CSS: custom properties on `:root`

Includes: colors (all scales), typography (font-family, sizes, weights, tracking), spacing, shadows, radii, motion (durations, easings).

#### 3. Generated Assets

Saved to a `brand/` directory (or `public/brand/`):
- Logo variants (primary, mono, reversed)
- Roundel/avatar
- Favicon set
- OG image template
- Mood image(s)

#### 4. Brand Page (optional, if project supports)

Offer to generate a `/brand` page in the project that showcases:
- Logo and wordmark
- Color palette with swatches
- Typography specimens
- Component examples in brand colors
- Dark mode toggle
- Do/don't examples

This serves as a living style guide within the project.

---

## Taste Engine

The skill has built-in opinions about what makes a brand distinctive:

### Font Intelligence
- Knows which Google Fonts are overused (Inter, Roboto, Poppins, Montserrat)
- Has a curated list of distinctive alternatives per category
- Understands font personality (Fraunces = craft/warmth, Space Grotesk = technical/modern, Newsreader = editorial/authority)
- Can recommend commercial foundries when budget allows (Grilli Type, Klim, Colophon, Dinamo)

### Color Intelligence
- Knows which palettes are "AI slop" (purple-blue gradient, teal-coral, indigo-pink)
- Understands color psychology beyond basics (not just "blue = trust")
- Can derive unexpected but cohesive palettes from reference images
- Works in OKLCH for perceptually uniform scales

### Pattern Recognition
- Detects when 5 directions are converging toward sameness
- Flags when a chosen direction matches common templates
- Knows which visual patterns are trending (and which are already tired)

---

## Integration Points

| Skill | How brand integrates |
|-------|---------------------|
| `/arc:design` | Reads `brand-system.md`, inherits palette/typography, skips brand questions |
| `/arc:responsive` | Applies brand across breakpoints |
| `/arc:seo` | Uses brand assets for OG images, favicon |
| `designer` agent | Reviews against brand system, not generic taste |

---

## What This Skill Is NOT

- Not a logo design tool (motif generates imagery, but a real logo may need a designer)
- Not a marketing strategy skill (no positioning, messaging, GTM)
- Not a component library builder (that's `/arc:design` + `/arc:implement`)
- Not a print design tool (focused on digital identity)

---

## Technical Requirements

- `motif` CLI for asset generation (graceful fallback if unavailable)
- Chrome MCP or agent-browser for comparison page review
- Read tool for ingesting reference images
- Font availability check (Google Fonts API or local font directory)

---

## Open Questions

1. Should the skill support evolving an existing brand (v2 of a brand) or only creating new ones?
   - **Proposed:** Support both — detect existing `brand-system.md` and offer "evolve" vs "replace"

2. Should the comparison page persist or be temporary?
   - **Proposed:** Temporary during selection, then offer to convert to permanent brand page

3. Should the skill check font licensing?
   - **Proposed:** Flag commercial fonts as requiring a license, but don't block selection
