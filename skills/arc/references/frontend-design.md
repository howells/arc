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

**Recommended fonts:**

| Category | Options |
|----------|---------|
| Sans | Inter, DM Sans, Sohne, Scto Grotesk, Instrument Sans, Space Grotesk, Bricolage Grotesque, Outfit |
| Serif | Instrument Serif, Newsreader, Fraunces, Cormorant, Crimson Pro, Libre Baskerville |
| Display | Novarese, Editorial New |
| Mono | Geist Mono, IBM Plex Mono, JetBrains Mono, Fira Code |

**Commercial foundries (require license):**
- **Grilli Type**: GT America, GT Walsheim, GT Sectra, GT Flexa
- **Commercial Type**: Graphik, Canela, Dala Floda, Austin
- **Klim**: Söhne, Untitled Sans, Tiempos
- **Colophon**: Apercu, Reader, Basis Grotesque
- **Dinamo**: ABC Favorit, ABC Diatype, ABC Arizona
- **Sharp Type**: Sharp Grotesk, Sharp Sans

**If user has a fonts folder**, check it for available licensed fonts before selecting. Pair a display font with a refined body font.

## Color

**Never:** Purple-to-blue gradients on white (AI cliché)

**Do:**
- Commit to a cohesive palette with dominant + sharp accents
- Use CSS variables for consistency
- Consider unexpected color combinations that reinforce the tone

## Motion

- Focus on high-impact moments (page load, reveals)
- One well-orchestrated animation > scattered micro-interactions
- Use `animation-delay` for staggered reveals
- CSS-only when possible; Motion library for React

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
- Generic icons (Heroicons defaults, etc.)
- Cookie-cutter component patterns
- Safe, forgettable choices

**If you catch yourself making any of these choices, stop and reconsider.**
