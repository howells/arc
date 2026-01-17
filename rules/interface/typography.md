# Interface: Typography

Source references:
- Vercel Web Interface Guidelines: https://vercel.com/design/guidelines
- Rauno Freiberg: https://interfaces.rauno.me/

## Rendering

- MUST: Apply font smoothing for legibility:

```css
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
```

- MUST: Prevent iOS landscape zoom:

```css
html {
  -webkit-text-size-adjust: 100%;
}
```

## Font Weight

- MUST: Minimum body font weight: 400
- SHOULD: Medium headings: 500–600 weight
- MUST: Maintain consistent weight on hover/selection (no layout shift from bold)

## Fluid Sizing

- SHOULD: Use `clamp()` for responsive typography:

```css
h1 {
  font-size: clamp(2rem, 5vw, 4.5rem);
}

p {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
}
```

## Numeric Content

- MUST: Use tabular figures for aligned numbers:

```css
.table-cell,
.timer,
.price {
  font-variant-numeric: tabular-nums;
}
```

- SHOULD: Use a monospace font (like Geist Mono) for numeric comparisons

## Font Loading

- SHOULD: Subset fonts based on language and content to reduce payload
- MUST: Use `font-display: swap` or `optional` to prevent invisible text
- SHOULD: Preload critical fonts:

```html
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
```

## Selection

- SHOULD: Style `::selection` for brand consistency:

```css
::selection {
  background: hsl(var(--primary) / 0.2);
  color: inherit;
}
```

- MUST: Unset gradients on `::selection` (not supported, looks broken)

## Text Wrapping

- SHOULD: Use `text-balance` on headings (native orphan/widow control)
- SHOULD: Use `text-pretty` on body/paragraph text
- SHOULD: Use `truncate` or `line-clamp-*` for dense UI with predictable overflow

## Content Formatting

- MUST: Use the ellipsis character `…` (not `...`)
- MUST: Use curly quotes `"` `"` and `'` `'` (not straight quotes)
- SHOULD: Avoid widows/orphans in headings
- MUST: Use non-breaking spaces to glue units: `10\u00A0MB`, `⌘\u00A0K`
