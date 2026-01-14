---
name: design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use when building web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
---

<overview>
Frontend work requires intentional aesthetic direction. Generic "AI slop" (purple gradients, predictable layouts) is unacceptable. Every UI decision should be deliberate and memorable.

**This skill guides all frontend implementation work.** Apply these principles whether building from scratch or modifying existing UI.
</overview>

<intake>
Before writing any UI code, establish the design direction.

**Ask the user:**
1. What's the purpose of this UI? Who uses it?
2. What tone fits best? (minimal, bold, editorial, playful, luxury, brutalist, etc.)
3. What's the ONE thing someone should remember about this design?
4. Do you have a fonts folder with licensed fonts I can check?

**Wait for response before proceeding.**
</intake>

<design_thinking>
**Capture the aesthetic direction:**

```markdown
## Aesthetic Direction
- **Tone**: [chosen direction]
- **Memorable element**: [what makes it unforgettable]
- **Typography**: [display font] + [body font]
- **Color strategy**: [dominant + accent approach]
- **Motion philosophy**: [where/how animation is used]
```

**Tone options:**
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
</design_thinking>

<typography>
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
</typography>

<color>
**Never:** Purple-to-blue gradients on white (AI cliché)

**Do:**
- Commit to a cohesive palette with dominant + sharp accents
- Use CSS variables for consistency
- Consider unexpected color combinations that reinforce the tone
</color>

<motion>
- Focus on high-impact moments (page load, reveals)
- One well-orchestrated animation > scattered micro-interactions
- Use `animation-delay` for staggered reveals
- CSS-only when possible; Motion library for React
</motion>

<spatial_composition>
- Unexpected layouts, asymmetry, overlap
- Grid-breaking elements
- Generous negative space OR controlled density
- Never predictable/cookie-cutter
</spatial_composition>

<backgrounds_and_details>
Create atmosphere and depth:
- Gradient meshes, noise textures, geometric patterns
- Layered transparencies, dramatic shadows
- Custom cursors, grain overlays where appropriate
</backgrounds_and_details>

<implementation_matching>
**Match code complexity to aesthetic vision:**

- **Maximalist design** → elaborate code, extensive animations, rich effects
- **Minimalist design** → restraint, precision, perfect spacing/typography

Elegance = executing the vision fully, not hedging.
</implementation_matching>

<anti_patterns>
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
</anti_patterns>

<workflow>
1. **Establish direction** - Run through intake questions
2. **Document aesthetic** - Capture in design doc format
3. **Check fonts** - Look in user's fonts folder if provided
4. **Build with intention** - Every choice should reinforce the tone
5. **Review against anti-patterns** - Before delivering, verify you avoided generic choices
</workflow>
