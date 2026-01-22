# Color Rules

Prescriptive requirements for color palettes and usage in UI.

---

## Palette Structure

### Required Color Categories

Every project MUST define:

1. **Primary color** — Brand identity, main actions, links
2. **Neutral (grey) scale** — Text, backgrounds, borders, secondary elements
3. **Semantic colors** — Red (error), yellow (warning), green/teal (success)

Projects SHOULD also define:
- **Accent colors** — For categorization, highlights, secondary actions

### Shade Scale Requirements

Each color category MUST have a 9-shade scale using the 100-900 naming convention:

| Shade | Usage |
|-------|-------|
| 50/100 | Tinted backgrounds, subtle fills |
| 200-300 | Borders, dividers, disabled states |
| 400-500 | Icons, secondary text, button backgrounds |
| 600-700 | Body text, primary actions |
| 800-900 | Headings, high-emphasis text |

NEVER rely on `lighten()` or `darken()` functions. Define explicit shade values.

---

## Building a Color Scale

### Step 1: Choose a Base (500)

Pick a shade that works as a button background with white text. This is your 500.

### Step 2: Find the Edges

- **900**: Works for text on white backgrounds
- **50/100**: Works as a subtle tinted background

### Step 3: Fill the Gaps

Work inward, splitting the difference between existing shades.

### Maintaining Saturation at Extremes

As HSL lightness approaches 0% or 100%, increase saturation to maintain perceived vibrancy:

```
Lightness 50% at saturation 60% → vivid
Lightness 95% at saturation 60% → washed out
Lightness 95% at saturation 80% → maintains vibrancy
```

### Rotating Hue for Perceived Brightness

Different hues have different perceived brightness at the same lightness:

**Bright hues** (appear lighter): Yellow (60°), Cyan (180°), Magenta (300°)
**Dark hues** (appear darker): Red (0°), Green (120°), Blue (240°)

To create lighter shades: rotate hue toward the nearest bright point
To create darker shades: rotate hue toward the nearest dark point

SHOULD NOT rotate more than 20-30° to avoid shifting the color's identity.

---

## Grey Temperature

Neutral greys MUST be saturated with a tint. Pure grey (0% saturation) looks dead.

### Cool Greys (Recommended Default)

Add blue saturation (5-15%) for professional, modern, tech-forward feel.

### Warm Greys

Add yellow/orange saturation for friendly, inviting, approachable feel.

Match grey temperature to brand personality. NEVER mix warm and cool greys in the same interface.

---

## Semantic Colors

### Red (Error/Destructive)

- MUST be obviously different from primary color
- Use for: errors, destructive actions, alerts
- Dark shades for text, light shades for backgrounds

### Yellow (Warning)

- MUST maintain sufficient contrast (yellow on white is problematic)
- Use for: warnings, pending states, attention
- Often needs a darker shade than other colors for text contrast

### Green or Teal (Success)

- SHOULD be distinct from primary if primary is green/teal
- Use for: success messages, positive actions, confirmations
- Teal often works better than pure green (less saturated, more sophisticated)

---

## Accessibility Requirements

### Contrast Ratios

MUST meet WCAG AA minimum:
- **4.5:1** for normal text (< 18px)
- **3:1** for large text (>= 18px bold, >= 24px regular)
- **3:1** for UI components and graphical objects

### Color Independence

NEVER rely on color alone to convey meaning:
- Pair color with icons (checkmark for success, X for error)
- Use position and grouping as additional signals
- Include text labels for critical status
- Support colorblind users (8% of males have red-green deficiency)

---

## Curated Starter Palettes

These palettes are starting points. SHOULD build your own using the methodology above.

### Blue-Grey Neutrals (Recommended)

A versatile, professional neutral scale:

```css
/* CSS Variables */
--grey-50: #F0F4F8;   /* hsl(210, 36%, 96%) */
--grey-100: #D9E2EC;  /* hsl(212, 33%, 89%) */
--grey-200: #BCCCDC;  /* hsl(210, 31%, 80%) */
--grey-300: #9FB3C8;  /* hsl(211, 27%, 70%) */
--grey-400: #829AB1;  /* hsl(209, 23%, 60%) */
--grey-500: #627D98;  /* hsl(210, 22%, 49%) */
--grey-600: #486581;  /* hsl(209, 28%, 39%) */
--grey-700: #334E68;  /* hsl(209, 34%, 30%) */
--grey-800: #243B53;  /* hsl(211, 39%, 23%) */
--grey-900: #102A43;  /* hsl(209, 61%, 16%) */
```

Usage:
- 900: Primary headings
- 700-800: Body text
- 500-600: Secondary text, labels
- 200-400: Borders, dividers
- 50-100: Backgrounds, fills

### Semantic Colors (Minimal Set)

```css
/* Errors/Destructive */
--red-50: #FFEEEE;
--red-500: #BA2525;
--red-900: #610404;

/* Warnings */
--yellow-50: #FFFAEB;
--yellow-500: #E9B949;
--yellow-900: #513C06;

/* Success */
--teal-50: #EFFCF6;
--teal-500: #27AB83;
--teal-900: #014D40;
```

---

## Implementation

### CSS Custom Properties

MUST define colors as CSS custom properties for theme support:

```css
:root {
  --color-primary-500: oklch(0.55 0.15 250);
  --color-grey-900: oklch(0.25 0.05 250);
}
```

### Dark Mode

SHOULD use semantic naming that swaps values, not separate color sets:

```css
:root {
  --color-text-primary: var(--grey-900);
  --color-bg-primary: var(--grey-50);
}

[data-theme="dark"] {
  --color-text-primary: var(--grey-100);
  --color-bg-primary: var(--grey-900);
}
```

### Tailwind Integration

When using Tailwind, extend the theme in CSS (v4) or config (v3):

```css
/* Tailwind v4 */
@theme {
  --color-brand-50: oklch(0.97 0.02 250);
  --color-brand-500: oklch(0.55 0.15 250);
  --color-brand-900: oklch(0.25 0.08 250);
}
```

---

## Anti-Patterns

NEVER:
- Use pure black (#000) for text—too harsh
- Use pure white (#FFF) for large backgrounds—too stark
- Define colors as hex without documenting HSL/OKLCH equivalent
- Create shades by only adjusting lightness (also adjust saturation and hue)
- Use more than one primary color (it dilutes hierarchy)
- Invent colors on the fly—always pull from the defined palette
