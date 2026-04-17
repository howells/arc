---
name: brand
description: |
  Create a visual identity system — palette, typography, tone, and generated assets.
  Produces 5 distinct brand directions for the user to choose from, then converges to
  a complete brand system with tokens and assets. Strongly opinionated against generic
  tech aesthetics. Use when asked to "create a brand", "define the visual identity",
  "design the brand", "set up colors and fonts", or before /arc:design for new projects.
license: MIT
argument-hint: "<references-or-description>"
metadata:
  author: howells
website:
  order: 7
  desc: Visual identity system
  summary: Define your brand's visual identity — palette, typography, tone, and assets. Generates 5 distinct directions to choose from, then produces a complete brand system with design tokens and generated assets.
  what: |
    Brand guides you through identity discovery using visual references (images, screenshots, fonts you admire) and collaborative dialogue. It generates 5 genuinely different brand directions — each with a mood image, color palette, and type specimen — presented on a live comparison page or as a document. After you pick a direction, it produces a complete brand system: full shade scales, tinted neutrals, dark mode, type hierarchy, and generated assets (logo, OG image, favicon) via motif.
  why: |
    Most AI-generated projects look the same: Inter, blue, white cards, purple gradient. /arc:design does excellent feature-level UI, but without an upstream identity system, every feature starts from scratch. Brand establishes who you are visually so every subsequent design decision has a foundation.
  decisions:
    - Images are first-class inputs. Screenshots, logos, mood boards — not just adjectives.
    - 5 genuinely different directions. Not 5 shades of the same idea.
    - Strongly opinionated. Pushes against generic choices with curated alternatives.
    - Peer to /arc:design. Either can run first; each reads the other's output.
    - motif for asset generation. Graceful fallback if unavailable.
  workflow:
    position: branch
    joins: design
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## REQUIRED TOOLS — use these, do not skip:
- **`AskUserQuestion`** — Preserve the one-question-at-a-time interaction pattern for all user decisions. Brand is deeply subjective, so the user must drive every choice. In Claude Code, use the tool. In Codex, ask one concise plain-text question at a time unless a structured question tool is actually available in the current mode. Keep context before the question to 2-3 sentences max, and do not narrate missing tools or fallbacks to the user.

## BANNED TOOLS — calling these is a skill violation:
- **`EnterPlanMode`** — BANNED. Execute phases below directly.
- **`ExitPlanMode`** — BANNED. You are never in plan mode.
</tool_restrictions>

<arc_runtime>
Arc-owned files live under the Arc install root for full-runtime installs.

Set `${ARC_ROOT}` to that root and use `${ARC_ROOT}/...` for Arc bundle files such as
`references/`, `disciplines/`, `agents/`, `templates/`, `scripts/`, and `rules/`.

Project-local files stay relative to the user's repository.
</arc_runtime>

# Brand Workflow

Create a visual identity system. Not a generic guidelines doc — an opinionated, applied identity.

**Announce at start:** "I'm using the brand skill to create a visual identity system."

<important>
**This skill is user-interactive. Do NOT spawn agents for brand decisions.**

Brand identity is the most subjective design work. Every choice must be driven by the user.
The skill's job is to present excellent options and push against mediocrity — not to decide.

**The 5 directions must be genuinely different.** If they're all variations of "clean modern minimal", you've failed. Push across axes: warm/cool, serif/sans, dense/airy, bold/subtle, structured/organic.
</important>

---

## Phase 0: Load References & Existing Context

<required_reading>
**Read ALL of these using the Read tool:**

1. `${ARC_ROOT}/references/brand-identity.md` — Brand typography, color psychology, visual character, distinctiveness criteria
2. `${ARC_ROOT}/references/design-philosophy.md` — Hierarchy, color theory, personality choices
3. `${ARC_ROOT}/references/typography-opentype.md` — OpenType features, tracking, text-wrap, fluid sizing
4. `rules/interface/colors.md` — OKLCH palettes, tinted neutrals, 60-30-10 rule
5. `rules/interface/typography.md` — Font loading, OpenType features, type scale
</required_reading>

**Check for existing brand/design context:**
```bash
ls docs/brand-system.md docs/design-context.md docs/vision.md 2>/dev/null
```

If `brand-system.md` exists:
```yaml
AskUserQuestion:
  question: "You already have a brand system. What would you like to do?"
  header: "Existing brand"
  options:
    - label: "Evolve it"
      description: "Keep the core identity but refresh or extend it"
    - label: "Replace it"
      description: "Start fresh with a new identity"
    - label: "Review it"
      description: "Audit the current brand for issues or inconsistencies"
```

**Check for fonts in the project (local fonts are premium — prefer them over Google Fonts):**
```bash
# Check all common font locations — local fonts are a major asset
ls public/fonts/ src/fonts/ fonts/ app/fonts/ 2>/dev/null | head -30
# Also check nested font dirs (projects often organize by family)
find . -path '*/fonts/*' -name '*.otf' -o -name '*.ttf' -o -name '*.woff2' 2>/dev/null | head -30
# Check what's already loaded
grep -r "font-family\|@font-face\|next/font\|localFont\|google.*font" src/ app/ --include='*.{ts,tsx,css}' -l 2>/dev/null | head -10
```

If the project has local font files from premium foundries (Klim, Commercial Type, Grilli, etc.),
these are a significant brand asset. **Use them in the 5 directions** rather than defaulting to
Google Fonts. Document which fonts are available so you can reference them in the comparison page.

---

## Phase 1: Gather References

**Ask for visual references first.** Images > adjectives.

```yaml
AskUserQuestion:
  question: "Do you have visual references — screenshots of brands you admire, logos, fonts, color palettes, or anything that captures the feeling you want?"
  header: "References"
  options:
    - label: "Yes, let me share"
      description: "I have images, links, or files to share"
    - label: "I have ideas but no images"
      description: "I can describe what I'm going for"
    - label: "No idea yet"
      description: "Help me discover what I want"
```

**If they share images:** Read them using the Read tool. Analyze:
- Dominant colors and palette character
- Typography style (serif, sans, display, monospace)
- Visual density (airy vs dense)
- Mood (warm, cool, energetic, calm, luxurious, raw)
- What makes each reference distinctive

**If they describe verbally:** Probe deeper. Don't accept adjectives alone:
- "Modern" → "Modern like Apple (restrained, spatial) or modern like Stripe (technical, precise)?"
- "Clean" → "Clean like Aesop (warm minimalism) or clean like Linear (cold precision)?"
- "Professional" → "Law firm professional or design agency professional?"

**If they need discovery:** Ask about the world their product lives in:

```yaml
AskUserQuestion:
  question: "If your product were a physical space, what would it feel like?"
  header: "Brand world"
  options:
    - label: "A gallery"
      description: "Curated, spacious, quiet authority. White walls, considered objects."
    - label: "A workshop"
      description: "Craft, tools, raw materials. Honest, functional, warm."
    - label: "A bookshop"
      description: "Editorial, layered, rich. Typography-forward, intellectual."
    - label: "A studio"
      description: "Creative, expressive, bold. Color-confident, dynamic."
```

Follow up with:

```yaml
AskUserQuestion:
  question: "What must this brand NEVER feel like?"
  header: "Anti-references"
  options:
    - label: "Generic tech startup"
      description: "No Inter + blue + white cards + purple gradients"
    - label: "Corporate enterprise"
      description: "No gray suits, no stock photos, no committee decisions"
    - label: "Trendy/disposable"
      description: "No whatever's hot on Dribbble this month"
    - label: "Something else"
      description: "I'll describe what to avoid"
```

---

## Phase 2: Brand Discovery

With references in hand, explore through conversation:

**Who is this for?** Not demographics — taste and expectations:
- What do they already use? (informs visual language they'll find familiar)
- What would surprise and delight them?
- What would make them distrust you?

**What's the brand's core tension?** Great brands hold a tension:
- Accessible expertise (smart but not intimidating)
- Playful precision (fun but not unserious)
- Raw refinement (honest but not crude)
- Warm authority (trustworthy but not cold)

Identify the tension and use it to anchor the 5 directions.

---

## Phase 3: Generate 5 Directions

Generate 5 genuinely different brand directions. Each explores a different axis while staying true to the references.

### Direction Structure

For each direction, define:

```markdown
### Direction [N]: [Evocative Name]

**Personality:** [One sentence capturing the tension]

**Palette:**
| Role | Color | OKLCH | Hex |
|------|-------|-------|-----|
| Brand | [name] | oklch(...) | #... |
| Accent | [name] | oklch(...) | #... |
| Surface | [name] | oklch(...) | #... |
| Text | [name] | oklch(...) | #... |
| Muted | [name] | oklch(...) | #... |

**Typography:**
- Display: [font] — [why this font for this direction]
- Body: [font] — [why]
- Mono: [font]

**Visual character:** [border radius, shadow style, line weight, density]

**Mood image prompt:** [detailed motif prompt for this direction]
```

### Direction Diversity Rules

The 5 directions MUST vary across these axes:
- **Temperature:** At least one warm, one cool
- **Typography:** At least one serif-led, one sans-led
- **Density:** At least one airy, one dense
- **Energy:** At least one calm, one energetic
- **Surprise:** At least one that pushes the user's comfort zone

### Generate Mood Images

For each direction, run motif to generate **atmospheric mood images** — NOT logos or marks.
Mood images should evoke the *feeling* of the direction (a greenhouse, a letterpress studio, a material palette)
without attempting to render wordmarks, monograms, or brand names. AI-generated text in logos is
unusable and wastes the user's time.

```bash
# GOOD: atmospheric, no text
motif "warm greenhouse interior, morning light through glass, terracotta pots, fern fronds, editorial photography" --landscape

# BAD: attempts a logo — will produce garbled text
motif "Acme Corp logo, botanical leaf mark, clean vector" --square
```

For each direction, run motif:
```bash
motif "[atmospheric scene evoking this direction's mood — NO brand names, NO text, NO logos]" --landscape
```

### Present to User — COMPARISON PAGE IS MANDATORY

<important>
**You MUST build a live comparison page.** Do NOT present directions as markdown tables in the
conversation. The user cannot evaluate typography and color from text descriptions — they need to
SEE real fonts rendered at real sizes with real colors in the browser.
</important>

**If the project has Next.js or Vite (check for this — most projects do):**

Generate a comparison page at `app/brand-explore/page.tsx` (Next.js) or `brand-explore.html` (Vite/static). This page MUST:

1. **Load actual project fonts** — check `app/fonts/`, `public/fonts/`, `src/fonts/` for local font files first.
   Use `next/font/local` or `@font-face` to load them. Only fall back to Google Fonts if the project
   has no local fonts. Premium local fonts (Canela, Schnyder, Lyon Display, etc.) are far more
   distinctive than Google Fonts — use them.
2. **Render color swatches** as filled divs with hex/oklch labels
3. **Render type specimens** at three scales: display headline, body paragraph, and small caption/label.
   Use the actual font proposed for each direction, not a placeholder.
4. **Include the mood image** for each direction (from motif)
5. **Show a mini component preview** — at minimum a button and a card in each direction's colors/type
6. **Be self-contained** — all styles inline or in a `<style>` block, no external dependencies beyond fonts

Tell the user to open the page in the browser before asking them to pick.

**Fallback (no framework):** Present directions as an HTML file the user can open directly, or use
Chrome MCP to render specimens and screenshot them. Markdown tables in conversation are a LAST resort.

```yaml
AskUserQuestion:
  question: "Which direction resonates most?"
  header: "Pick a direction"
  options:
    - label: "[Direction 1 name]"
      description: "[One-line personality summary]"
    - label: "[Direction 2 name]"
      description: "[One-line personality summary]"
    - label: "[Direction 3 name]"
      description: "[One-line personality summary]"
    - label: "Mix elements"
      description: "I want to combine parts from different directions"
```

---

## Phase 4: Refine & Deepen

Take the chosen direction and build it out:

### 4.1 Full Color System

Generate complete shade scales (50-900) in OKLCH:
```
brand-50:  oklch(0.97 0.02 [hue])
brand-100: oklch(0.93 0.04 [hue])
brand-200: oklch(0.87 0.07 [hue])
brand-300: oklch(0.78 0.10 [hue])
brand-400: oklch(0.68 0.13 [hue])
brand-500: oklch(0.58 0.15 [hue])  ← base
brand-600: oklch(0.50 0.14 [hue])
brand-700: oklch(0.42 0.12 [hue])
brand-800: oklch(0.33 0.10 [hue])
brand-900: oklch(0.25 0.08 [hue])
```

Plus:
- **Tinted neutrals** — grays with a hint of the brand hue
- **Dark mode palette** — not inverted, rebalanced for dark surfaces
- **Semantic colors** — success, warning, error, info (harmonized with brand)

### 4.2 Typography System

- Full type scale with `clamp()` for fluid sizing
- Weight assignments per context (headline, body, label, caption)
- Tracking adjustments per size (tighter for large, looser for small/caps)
- Line height ratios (decreasing as size increases)
- Font loading strategy (`font-display`, fallback stack)

### 4.3 Visual Character

- Border radius tokens (none/sm/md/lg/full)
- Shadow style and elevation scale
- Line weight for borders, dividers, icons
- Density (component padding, gap defaults)
- Motion personality (still/subtle/expressive, spring params if applicable)

### 4.4 Test the System

Show the brand applied to common patterns:
- A card component
- A button set (primary, secondary, ghost)
- A navigation bar
- A form with inputs
- Dark mode variants

Use Chrome MCP to screenshot if available.

```yaml
AskUserQuestion:
  question: "How does this feel applied to real UI?"
  header: "Brand check"
  options:
    - label: "Feels right"
      description: "This is the brand. Let's finalize."
    - label: "Needs adjustment"
      description: "Close but some things need tweaking"
    - label: "Too [something]"
      description: "I'll tell you what needs to change"
```

---

## Phase 5: Generate Assets

Auto-generate brand assets using `motif`. If `motif` is not available, provide detailed prompts and instructions.

```bash
# Check if motif is available
which motif 2>/dev/null
```

### If motif is available:

<important>
**AI image generation CANNOT produce usable logos or wordmarks.** Generated text is garbled,
letterforms are inconsistent, and the results look amateur. Do NOT attempt to generate logos,
wordmarks, or monograms with motif.

Instead, use motif for **atmospheric and textural assets** where AI excels:
</important>

```bash
# OG image — atmospheric, NO text
motif "[brand mood scene], [brand colors], editorial photography, atmospheric" --og

# Hero/mood image — NO text, NO logos
motif "[brand world scene], [brand colors], [visual texture]" --landscape

# Texture/pattern — abstract, useful as backgrounds
motif "abstract [brand texture], [brand colors], subtle, seamless feel" --square
```

**For logos, wordmarks, and monograms** — build these as SVG components in code or as
hand-crafted SVG files. Code-built SVGs are:
- Infinitely scalable
- Editable (colors, sizes via props)
- Crisp at every resolution
- Version-controllable

If the brand needs a botanical mark, illustrative monogram, or symbolic icon, build it with
SVG path commands. Simple, geometric marks are achievable in code. Complex illustrated marks
should be flagged as needing a designer.

### If motif is NOT available:

Provide atmospheric prompts for the user to run manually. For logos/marks, build SVG in code.

### Additional assets to create:

- **Logo/mark:** SVG component (React) or standalone `.svg` file — built in code
- **Favicon:** SVG favicon (scales perfectly, supports dark mode via `prefers-color-scheme`)
- **OG image:** Use Satori (`@vercel/og`) to generate dynamic OG images from the brand tokens —
  this produces crisp text using actual fonts, unlike motif

---

## Phase 6: Produce Outputs

### 1. Brand System Document

Write to `docs/brand-system.md` with the full brand system (see spec for structure).

### 2. Design Tokens

Detect the project's CSS setup and generate appropriate tokens:

**Tailwind v4 (CSS @theme):**
```css
@theme {
  --color-brand-50: oklch(0.97 0.02 250);
  /* ... full scale ... */
  --font-display: "Lyon Display", serif;
  --font-body: "Untitled Sans", sans-serif;
  --font-mono: "Geist Mono", monospace;
  /* ... spacing, shadows, radii ... */
}
```

**Tailwind v3 (config):**
```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: { 50: '...', /* ... */ },
      },
      fontFamily: {
        display: ['Lyon Display', 'serif'],
        // ...
      },
    },
  },
}
```

**Plain CSS:**
```css
:root {
  --brand-50: oklch(0.97 0.02 250);
  /* ... */
}
```

### 3. Assets Directory

Save generated assets:
```
public/brand/
├── logo.png
├── logo-dark.png (reversed for dark backgrounds)
├── roundel.png
├── og-template.png
├── favicon.svg
├── hero.png
└── palette.png
```

### 4. Brand Page (optional)

```yaml
AskUserQuestion:
  question: "Want me to create a /brand page in your project that showcases the identity system?"
  header: "Brand page"
  options:
    - label: "Yes, create it"
      description: "A beautiful page showing palette, typography, logo usage, and component examples"
    - label: "No, the docs are enough"
      description: "The brand-system.md and tokens are sufficient"
```

If yes, generate a page at `app/brand/page.tsx` (or equivalent) that displays:
- Logo and wordmark with clear space rules
- Full color palette with swatches and values
- Typography specimens at all scales
- Component examples in brand colors
- Dark mode toggle
- Do/don't examples for brand application

### 5. Clean Up

If a comparison page was generated in Phase 3, offer to remove it:
```yaml
AskUserQuestion:
  question: "Remove the brand-explore comparison page?"
  header: "Cleanup"
  options:
    - label: "Remove it"
      description: "Delete the temporary comparison page"
    - label: "Keep it"
      description: "Keep it around for reference"
```

---

## The Taste Engine

The taste engine is not a hardcoded list — it draws from the references loaded in Phase 0. The key principle: **challenge generic choices with curated alternatives from the references.**

### Typography Taste

Consult `${ARC_ROOT}/references/brand-identity.md` for:
- The "Never use for brand identity" list
- Recommended brand fonts with character descriptions and use cases
- Commercial foundries for premium projects
- Font pairing principles

Consult `${ARC_ROOT}/references/typography-opentype.md` for:
- Tracking adjustments per context (tighter for display, looser for all-caps)
- Font loading strategy decisions
- OpenType features that add typographic polish

**The brand typography principle:** `brand-identity.md` separates UI fonts from brand fonts. UI fonts (Inter, Geist, DM Sans) disappear — they're excellent for body text. Brand fonts (display, headlines, wordmarks) must express personality. When a user picks a UI font for brand identity, present alternatives from `brand-identity.md` with their character descriptions. Don't block the choice — explain the distinction and offer refined alternatives.

### Color Taste

Consult `${ARC_ROOT}/references/brand-identity.md` for:
- Color psychology beyond basics (hue ranges, when they work, when they don't)
- Generic palette patterns to avoid
- How to build a brand palette (meaning → dominant → accent → derive → scale)
- OKLCH for brand work

Consult `rules/interface/colors.md` for:
- OKLCH shade scale generation
- Tinted neutrals (adding brand hue to grays)
- The 60-30-10 rule for visual weight
- Dangerous combinations to avoid

**The brand color principle:** If you can swap the logo and the palette still feels generic, push harder. Derive color meaning from the brand's domain, not from what's trending.

### Visual Character Taste

Push users past safe defaults with questions, not mandates:

- "What if only *some* things are rounded? Sharp cards with round buttons creates tension."
- "What if no shadows? Or dramatic, layered shadows instead of subtle everywhere?"
- "What if the surface has color or texture instead of white + gray cards?"
- "What if borders are the character — thick, thin, dotted, or absent entirely?"

---

## NEVER

- Generate 5 directions that all look like variations of the same tech startup
- Accept "clean and modern" without pushing for what makes it *this* clean, *this* modern
- Use purple-to-blue gradients in any direction
- Default to Inter for brand typography (it's fine for UI, not for identity)
- Skip the reference gathering phase — images are the foundation
- Generate assets without user approval of the direction
- Produce a brand system that could belong to any company
- **Present directions as markdown tables in the conversation** — build the comparison page
- **Use motif to generate logos, wordmarks, or text-based marks** — AI text generation in images is unusable
- **Dump direction specs into chat and ask the user to imagine the fonts** — render them live
- **Ignore local/premium fonts** in favor of Google Fonts when the project has better options available
- **Skip the comparison page** because it takes effort — it IS the deliverable of Phase 3

---

<arc_log>
**After completing this skill, append to the activity log.**
See: `${ARC_ROOT}/references/arc-log.md`

Entry: `/arc:brand — [Project] brand identity created ([chosen direction name], [key characteristics])`
</arc_log>

<success_criteria>
Brand is complete when:
- [ ] References gathered (images or detailed descriptions)
- [ ] Brand discovery completed (audience, world, tension, anti-references)
- [ ] Local/premium fonts inventoried (if project has them, they MUST be used)
- [ ] 5 genuinely different directions generated with atmospheric mood images (NOT logo marks)
- [ ] **Live comparison page built and viewable in browser** (NOT markdown in conversation)
- [ ] User has chosen and refined a direction (after viewing the comparison page)
- [ ] Full color system produced (shade scales, tinted neutrals, dark mode)
- [ ] Typography system defined (display, body, mono with scale and weights)
- [ ] Visual character established (radius, shadow, density, motion)
- [ ] Assets generated (logo, roundel, OG image, favicon)
- [ ] `docs/brand-system.md` written
- [ ] Design tokens generated for project's CSS setup
- [ ] Assets saved to project
- [ ] Brand page offered (and generated if accepted)
</success_criteria>
