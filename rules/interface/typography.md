# Interface: Typography

## Rendering

- MUST: `antialiased` class on body (Tailwind) or:

```css
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
```

- MUST: Prevent iOS landscape zoom:

```css
html { -webkit-text-size-adjust: 100%; }
```

## Font Weight

| Usage | Weight |
|-------|--------|
| Body minimum | 400 |
| Headings | 500–600 |

- MUST: No weight change on hover/selection (prevents layout shift)
- SHOULD: Define as CSS variables:

```css
:root {
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

## Letter Spacing

Larger text needs tighter spacing; smaller text looser. Font-dependent.

```tsx
// Handle in Text component
<Text size="lg">Heading</Text> // Pairs size with optimal letter-spacing
```

## Fluid Sizing

- SHOULD: Use `clamp()`:

```css
h1 { font-size: clamp(2rem, 5vw, 4.5rem); }
p { font-size: clamp(1rem, 2.5vw, 1.25rem); }
```

## Numeric Content

- MUST: `tabular-nums` (Tailwind) for aligned numbers in tables, timers, prices
- SHOULD: Monospace font (Geist Mono) for numeric comparisons

## Font Loading

- MUST: `font-display: swap` or `optional` (prevents invisible text)
- SHOULD: Subset fonts by language
- SHOULD: Preload critical fonts:

```html
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
```

## Selection

- SHOULD: Style `::selection` for brand:

```css
::selection {
  background: hsl(var(--primary) / 0.2);
  color: inherit;
}
```

- MUST: Unset gradients on `::selection` (not supported)

## Text Wrapping

| Element | Class/Property |
|---------|---------------|
| Headings | `text-balance` |
| Body text | `text-pretty` |
| Dense UI | `truncate` or `line-clamp-*` |

## Content Formatting

- MUST: Ellipsis character `…` (not `...`)
- MUST: Curly quotes `"` `"` and `'` `'` (not straight)
- MUST: Non-breaking spaces for units: `10\u00A0MB`, `⌘\u00A0K`
- SHOULD: Avoid widows/orphans in headings
