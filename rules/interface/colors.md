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

## Tailwind Integration

```css
/* Tailwind v4 */
@theme {
  --color-brand-50: oklch(0.97 0.02 250);
  --color-brand-500: oklch(0.55 0.15 250);
  --color-brand-900: oklch(0.25 0.08 250);
}
```

## Anti-Patterns

- NEVER: Pure black (#000) for text — too harsh
- NEVER: Pure white (#FFF) for large backgrounds — too stark
- NEVER: Define hex without HSL/OKLCH equivalent
- NEVER: Create shades by adjusting only lightness (also saturation/hue)
- NEVER: Multiple primary colors (dilutes hierarchy)
- NEVER: Invent colors on the fly — use defined palette
