# Interface: Design

## Shadows

- SHOULD: Layer shadows (ambient + direct): `shadow-[0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.1)]`
- SHOULD: Prefer `box-shadow` over `border` for subtle edges — shadows blend with backgrounds and avoid subpixel rendering issues:

```css
/* Preferred: shadow blends with any background */
box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);

/* Also works: inset variant */
box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);

/* Fallback: explicit border when shadow isn't practical */
border: 1px solid rgb(0 0 0 / 0.05);
```

## Borders

- SHOULD: Hairline borders on retina:

```css
:root {
  --border-hairline: 1px;
  @media (min-resolution: 2dppx) { --border-hairline: 0.5px; }
}
```

## Radii

- SHOULD: Nested radii: `innerRadius = outerRadius - padding`

## Contrast

- MUST: APCA contrast compliance ([apcacontrast.com](https://apcacontrast.com))
- MUST: Increase contrast on `:hover/:active/:focus`
- MUST: Color-blind friendly chart palettes

## Gradients

- SHOULD: Eased gradients to avoid banding ([tool](https://larsenwork.com/easing-gradients))
- SHOULD: `mask-image` over gradient for fades:

```css
.fade-bottom { mask-image: linear-gradient(to bottom, black 80%, transparent); }
```

- NEVER: Fade on scrollable content

## Scrollbars

- NEVER: Custom page scrollbar
- SHOULD: Custom scrollbar only in contained elements (code blocks)

## Focus

- NEVER: Colored focus outlines (use grey/black/white only)

## Color Restraint

- SHOULD: One accent color per view
- SHOULD: Use existing tokens before adding new
- NEVER: Purple gradients, multicolor gradients (AI slop)
- NEVER: Glow effects as affordances

## AI Slop Detection

Concrete patterns that signal AI-generated design. Grep-friendly — each is a specific code smell, not a vibe.

### Visual Tells

| Pattern | What to look for | Why it's slop |
|---------|-----------------|---------------|
| Gratuitous gradients | `bg-gradient-to-*` or `linear-gradient` used decoratively, not functionally | AI defaults to gradients for "visual interest" instead of actual design |
| Glow effects | `shadow-[0_0_*]`, `drop-shadow`, `box-shadow` with blur >20px and color | Glow as decoration is a ChatGPT-era tell — real UIs use shadows for depth |
| `transition: all` | `transition-all` or `transition: all` | Lazy blanket transitions cause jank and unintended animations; specify properties |
| Visual monotony | Every card/section uses identical padding, radius, shadow | AI reuses the same container recipe everywhere — vary visual weight |
| Placeholder text shipped | `"Lorem ipsum"`, `"Your text here"`, `"Description goes here"` | AI leaves placeholder copy; real products have real content |
| Emoji as design | Emoji used as section icons or feature illustrations | AI substitutes emoji for actual iconography or illustration |

### Structural Tells

| Pattern | What to look for | Why it's slop |
|---------|-----------------|---------------|
| Hero → Features → Testimonials → CTA | Cookie-cutter landing page structure | Every AI landing page uses this exact layout |
| Uniform border-radius | Same `rounded-*` on every element | AI applies one radius globally instead of varying by context |
| White cards on white bg | Cards with `bg-white` on a `bg-white` or `bg-gray-50` parent | Creates a flat, lifeless hierarchy with no real depth |
| Centered everything | Every section center-aligned with `text-center mx-auto` | AI defaults to center alignment; real layouts use asymmetry |
| System font stack | No custom fonts loaded; falls back to `system-ui` or `sans-serif` | Zero typographic personality |

### Code Tells

- NEVER: `transition-all` — specify exact properties (`transition-colors`, `transition-transform`)
- NEVER: `isolation: isolate` used as a "just in case" stacking context — use only when you can explain why
- NEVER: `blur-*` > `blur-xl` (20px) on decorative elements — large blurs tank performance for no purpose
- NEVER: Multiple gradient overlays stacked — simplify to one or use a solid color with opacity

## Decorative Elements

- MUST: `pointer-events: none` on decorative overlays
- SHOULD: `user-select: none` on code illustrations

## Primitives

- NEVER: Mix component libraries (Radix + Headless + Base UI)
- MUST: Use project's existing primitives
- MUST: Use accessible primitives (Radix, Base UI) for keyboard/focus behavior
