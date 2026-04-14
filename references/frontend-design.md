# Frontend Design Reference

Create distinctive, production-grade frontend interfaces. Avoid generic AI aesthetics.

## Core Principle

Frontend work requires intentional aesthetic direction. Generic "AI slop" (purple gradients, predictable layouts) is unacceptable. Every UI decision should be deliberate and memorable.

## Aesthetic Direction Template

```markdown
## Aesthetic Direction
- **Tone**: [chosen direction]
- **Memorable element**: [what makes it unforgettable]
- **Typography**: [display font] + [body font]
- **Color strategy**: [dominant + accent approach]
- **Motion philosophy**: [where/how animation is used]
```

## Tone Options

- Brutally minimal
- Maximalist chaos
- Retro-futuristic
- Organic/natural
- Luxury/refined
- Playful/toy-like
- Editorial/magazine
- Brutalist/raw
- Art deco/geometric
- Soft/pastel
- Industrial/utilitarian

## Typography

**Never use:** Roboto, Arial, system-ui defaults

**Recommended UI fonts:**

| Category | Options |
|----------|---------|
| Sans | Inter, Geist, DM Sans, Instrument Sans, Outfit |
| Mono | Geist Mono, IBM Plex Mono, JetBrains Mono, Fira Code |

For brand/identity typography (display, headlines, wordmarks), see `references/brand-identity.md`.

**If user has a fonts folder**, check it for available licensed fonts before selecting.

## Icons

**Recommended:** Lucide icons for consistency and quality. They're well-designed, comprehensive, and work well at all sizes.

**Avoid:** Mixing icon libraries or using low-quality/inconsistent icon sets.

## Color

**Never:** Purple-to-blue gradients on white (AI cliché)

**Do:**
- Commit to a cohesive palette with dominant + sharp accents
- Use CSS variables for consistency
- Consider unexpected color combinations that reinforce the tone

## Motion

See [Animation Patterns Reference](animation-patterns.md) for comprehensive guidance.

**Key principles:**
- Focus on high-impact moments (page load, reveals)
- One well-orchestrated animation > scattered micro-interactions
- Every animation must answer: "Why does this exist?"
- Use `ease-out` for entering, `ease-in` for exiting, springs for interactive
- CSS-only when possible; `motion/react` when JS control required

**Quick decisions:**
- Entering screen → ease-out (200ms)
- Interactive elements → spring ({ stiffness: 400, damping: 25 })
- Staggered lists → staggerChildren: 0.03-0.05

## Spatial Composition

- Unexpected layouts, asymmetry, overlap
- Grid-breaking elements
- Generous negative space OR controlled density
- Never predictable/cookie-cutter

## Backgrounds and Details

Create atmosphere and depth:
- Gradient meshes, noise textures, geometric patterns
- Layered transparencies, dramatic shadows
- Custom cursors, grain overlays where appropriate

## Implementation Matching

Match code complexity to aesthetic vision:

- **Maximalist design** → elaborate code, extensive animations, rich effects
- **Minimalist design** → restraint, precision, perfect spacing/typography

Elegance = executing the vision fully, not hedging.

## Anti-Patterns

**Generic AI aesthetics to avoid:**
- Roboto/Arial/system-ui defaults
- Purple-to-blue gradients
- White backgrounds with gray cards
- Predictable grid layouts
- Rounded corners on everything
- Mixed or inconsistent icon styles
- Cookie-cutter component patterns
- Safe, forgettable choices

**If you catch yourself making any of these choices, stop and reconsider.**

### Concrete AI Slop Checks

When reviewing or building, scan for these specific code-level tells. See `rules/interface/design.md` → "AI Slop Detection" for the full table.

- `transition-all` → specify exact properties
- `bg-gradient-to-*` used decoratively → justify or remove
- `shadow-[0_0_*]` glow effects → real UIs use shadows for depth, not glow
- Same `rounded-*` / padding / shadow on every card → vary visual weight
- Placeholder text still present (`"Lorem ipsum"`, `"Your text here"`)
- Emoji used as section icons → use actual iconography
- `blur-*` > `blur-xl` on decorative elements → performance cost, no purpose
- Hero → Features → Testimonials → CTA landing page formula → break the mold

## Design Review Checklist

Use this checklist when reviewing UI implementations.

### Red Flags (Fail)

These indicate generic "AI slop" design:

- [ ] Uses Roboto/Arial/system-ui as primary font
- [ ] Purple-to-blue gradient present (the AI cliché)
- [ ] White background + gray cards pattern throughout
- [ ] Uniform rounded corners on everything (no variation)
- [ ] Mixed or inconsistent icon styles across the UI
- [ ] Could be mistaken for any AI-generated landing page
- [ ] No discernible aesthetic direction
- [ ] Cookie-cutter hero → features → testimonials → CTA layout

### Yellow Flags (Question)

These warrant discussion:

- [ ] No memorable element identified — what makes this stick?
- [ ] Typography pairing unclear or default-feeling
- [ ] Color palette lacks cohesion or intention
- [ ] Motion is scattered micro-interactions, not orchestrated (see [animation-patterns.md](animation-patterns.md))
- [ ] Spacing feels arbitrary rather than systematic
- [ ] Layout is "safe" — no unexpected decisions
- [ ] Illustrations feel stock rather than curated

### Green Flags (Pass)

These indicate intentional design:

- [ ] Clear aesthetic direction that could be articulated
- [ ] Typography choices are deliberate and create hierarchy
- [ ] Color palette reinforces the intended tone
- [ ] At least one memorable/distinctive element
- [ ] Layout has at least one unexpected decision
- [ ] Spacing is consistent and generous where needed
- [ ] Motion (if present) is purposeful and orchestrated
- [ ] Would not be mistaken for a generic template
