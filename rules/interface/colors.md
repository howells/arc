# Interface: Colors

## Required Categories

| Category | Purpose |
|----------|---------|
| Primary | Brand identity, main actions, links |
| Neutral (grey) | Text, backgrounds, borders |
| Semantic | Red (error), yellow (warning), green/teal (success) |
| Accent (optional) | Categorization, highlights |

## Shade Scale

MUST define 9 shades (100-900) per category:

| Shade | Usage |
|-------|-------|
| 50/100 | Tinted backgrounds |
| 200-300 | Borders, dividers, disabled |
| 400-500 | Icons, secondary text |
| 600-700 | Body text, buttons |
| 800-900 | Headings |

- NEVER: Use `lighten()` / `darken()` functions

## Building Scales

1. **Base (500)**: Works as button background with white text
2. **Edges**: 900 for text on white, 50 for subtle backgrounds
3. **Fill gaps**: Split difference between existing shades

### Saturation at Extremes

Increase saturation as lightness approaches 0% or 100%:
```
Lightness 50% + saturation 60% → vivid
Lightness 95% + saturation 60% → washed out
Lightness 95% + saturation 80% → maintains vibrancy
```

### Hue Rotation

| Goal | Rotate Toward |
|------|---------------|
| Lighter | Yellow (60°), Cyan (180°), Magenta (300°) |
| Darker | Red (0°), Green (120°), Blue (240°) |

- SHOULD NOT: Rotate more than 20-30° (preserves identity)

## Grey Temperature

- MUST: Saturate greys (5-15%). Pure grey looks dead.
- Cool greys (blue): Professional, tech-forward
- Warm greys (yellow/orange): Friendly, inviting
- NEVER: Mix warm and cool greys in same interface
- MUST NOT: Default to `gray-*` or `slate-*` for product neutrals. Prefer `zinc-*` or `neutral-*` unless an existing system already committed elsewhere.

## Semantic Colors

| Color | Requirements |
|-------|--------------|
| Red | MUST differ from primary. Dark for text, light for backgrounds. |
| Yellow | MUST ensure contrast (yellow on white fails). Often needs darker text shade. |
| Green/Teal | SHOULD differ from primary if primary is green/teal. Teal often preferable. |

## Accessibility

### Contrast Ratios (WCAG AA)

| Element | Ratio |
|---------|-------|
| Normal text (<18px) | 4.5:1 |
| Large text (≥18px bold, ≥24px) | 3:1 |
| UI components | 3:1 |

### Color Independence

- NEVER: Rely on color alone — pair with icons, text, position
- 8% of males have red-green deficiency

## Starter Palette: Blue-Grey

```css
--grey-50: #F0F4F8;
--grey-100: #D9E2EC;
--grey-200: #BCCCDC;
--grey-300: #9FB3C8;
--grey-400: #829AB1;
--grey-500: #627D98;
--grey-600: #486581;
--grey-700: #334E68;
--grey-800: #243B53;
--grey-900: #102A43;
```

## Dark Mode

Use numerical scale (1-12) so variables flip cleanly:

```css
:root {
  --gray-1: #fafafa;
  --gray-12: #171717;
}

[data-theme="dark"] {
  --gray-1: #171717;
  --gray-12: #fafafa;
}
```

- NEVER: Use Tailwind `dark:` modifier. Flip variables instead:

```css
/* Good */
.button { background: var(--gray-12); color: var(--gray-1); }

/* Avoid */
.button { @apply bg-gray-900 dark:bg-gray-100; }
```

## OKLCH-First Color Definition

MUST define colors in OKLCH. It's perceptually uniform — equal steps in lightness *look* equal, unlike HSL where 50% lightness in yellow looks bright while 50% in blue looks dark.

```css
/* OKLCH: lightness (0-1), chroma (0-0.4+), hue (0-360) */
--color-primary: oklch(0.60 0.15 250);       /* Blue */
--color-primary-light: oklch(0.85 0.08 250);  /* Same hue, lighter — reduce chroma */
--color-primary-dark: oklch(0.35 0.12 250);   /* Same hue, darker */
```

Key insight: As lightness approaches 0% or 100%, **reduce chroma**. High chroma at extreme lightness looks garish.

### Tinted Neutrals

Pure grey is dead. Add a subtle hint of your brand hue to all neutrals:

```css
/* Tailwind v4 @theme */
@theme {
  /* Warm-tinted greys (friendly, inviting) */
  --color-gray-50: oklch(0.95 0.01 60);
  --color-gray-100: oklch(0.90 0.01 60);
  --color-gray-200: oklch(0.82 0.01 60);
  --color-gray-300: oklch(0.70 0.01 60);
  --color-gray-400: oklch(0.58 0.01 60);
  --color-gray-500: oklch(0.48 0.01 60);
  --color-gray-600: oklch(0.38 0.01 60);
  --color-gray-700: oklch(0.30 0.01 60);
  --color-gray-800: oklch(0.22 0.01 60);
  --color-gray-900: oklch(0.15 0.01 60);
  --color-gray-950: oklch(0.10 0.01 60);

  /* Cool-tinted greys (professional, tech) — change hue to 250 */
}
```

Chroma of 0.01 is tiny but perceptible. It creates subconscious cohesion between brand and UI.

## The 60-30-10 Rule

This rule is about **visual weight**, not pixel count:

- **60%**: Neutral backgrounds, white space, base surfaces
- **30%**: Secondary — text, borders, inactive states
- **10%**: Accent — CTAs, highlights, focus states

The common mistake: using accent color everywhere because it's "the brand color." Accent colors work *because* they're rare. Overuse kills their power.

## Dangerous Combinations

These commonly fail contrast or cause readability issues:

- Light grey text on white (the #1 accessibility fail)
- **Grey text on any colored background** — grey looks washed out on color. Use a darker shade of the background's hue, or transparency
- Red text on green background (8% of men can't distinguish)
- Blue text on red background (vibrates visually)
- Yellow text on white (almost always fails)
- Thin light text on images (unpredictable contrast)
- **Placeholder text** still needs 4.5:1 — that light grey placeholder usually fails WCAG

## Alpha Is A Design Smell

Heavy use of transparency (`rgba`, `hsla`, `/ 0.5`) usually means an incomplete palette. Alpha creates:
- Unpredictable contrast on different backgrounds
- Performance overhead from compositing
- Inconsistency across contexts

SHOULD: Define explicit overlay colors for each context instead.

Exception: Focus rings and interactive states where see-through is genuinely needed.

## Tailwind Integration

```css
/* Tailwind v4 — OKLCH-first */
@theme {
  --color-brand-50: oklch(0.97 0.02 250);
  --color-brand-100: oklch(0.93 0.04 250);
  --color-brand-200: oklch(0.86 0.07 250);
  --color-brand-300: oklch(0.76 0.10 250);
  --color-brand-400: oklch(0.66 0.13 250);
  --color-brand-500: oklch(0.55 0.15 250);
  --color-brand-600: oklch(0.47 0.14 250);
  --color-brand-700: oklch(0.39 0.12 250);
  --color-brand-800: oklch(0.31 0.09 250);
  --color-brand-900: oklch(0.25 0.08 250);
  --color-brand-950: oklch(0.18 0.06 250);
}
```

Note chroma curve: peaks at 500 (0.15), reduces toward both extremes. This keeps light tints from looking garish and dark shades from looking muddy.

## Anti-Patterns

- NEVER: Pure black (#000) for text — too harsh. Use `oklch(0.15 0.01 hue)`
- NEVER: Pure white (#FFF) for large backgrounds — too stark. Use `oklch(0.98 0.005 hue)`
- NEVER: Define colors in hex without OKLCH equivalent
- NEVER: Create shades by adjusting only lightness (also adjust chroma and hue)
- NEVER: Multiple primary colors (dilutes hierarchy)
- NEVER: Default to indigo as the brand or accent color unless the project already uses it or the user asked for it
- NEVER: Invent colors on the fly — use defined palette
- NEVER: Heavy alpha/transparency as a substitute for proper palette shades
