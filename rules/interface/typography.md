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

## OpenType Features

Most developers don't know these exist. Use them for polish:

```html
<!-- Tailwind classes for OpenType features -->
<table class="tabular-nums">...</table>           <!-- Aligned columns in data -->
<span class="lining-nums">2024</span>              <!-- Uniform height numbers -->
<span class="oldstyle-nums">Chapter 3</span>       <!-- Blends with body text -->
<span class="diagonal-fractions">1/2 cup</span>    <!-- Proper fractions -->
<span class="ordinal">1st 2nd 3rd</span>           <!-- Superscript ordinals -->
```

```css
/* Features without Tailwind classes — use arbitrary values */
abbr { font-variant-caps: all-small-caps; }        /* Abbreviations */
code { font-variant-ligatures: none; }             /* Disable ligatures in code */
body { font-kerning: normal; }                     /* Enable kerning (be explicit) */
```

Check what features your font supports at [Wakamai Fondue](https://wakamaifondue.com/).

- MUST: `tabular-nums` for aligned numbers in tables, timers, prices
- SHOULD: `lining-nums` for numbers in headings, `oldstyle-nums` for numbers in body text
- SHOULD: Monospace font (Geist Mono) for numeric comparisons

## Font Pairing

**You often don't need a second font.** One well-chosen font family in multiple weights creates cleaner hierarchy than two competing typefaces. Only add a second font when you need genuine contrast (e.g., display headlines + body serif).

When pairing, contrast on multiple axes:
- Serif + Sans (structure contrast)
- Geometric + Humanist (personality contrast)
- Condensed display + Wide body (proportion contrast)

NEVER pair fonts that are similar but not identical (e.g., two geometric sans-serifs). They create visual tension without clear hierarchy.

### Better Google Fonts Alternatives

| Instead of | Try |
|---|---|
| Inter | Instrument Sans, Plus Jakarta Sans, Outfit |
| Roboto | Onest, Figtree, Urbanist |
| Open Sans | Source Sans 3, Nunito Sans, DM Sans |
| Editorial/premium | Fraunces, Newsreader, Lora |

## Font Loading

- MUST: `font-display: swap` or `optional` (prevents invisible text)
- SHOULD: Subset fonts by language
- SHOULD: Preload critical fonts:

```html
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
```

### Minimizing Layout Shift

Match fallback font metrics to your web font to prevent text reflow:

```css
@font-face {
  font-family: 'CustomFont-Fallback';
  src: local('Arial');
  size-adjust: 105%;
  ascent-override: 90%;
  descent-override: 20%;
  line-gap-override: 10%;
}

body {
  font-family: 'CustomFont', 'CustomFont-Fallback', sans-serif;
}
```

Tools like [Fontaine](https://github.com/unjs/fontaine) or Next.js `next/font` calculate these overrides automatically.

## Dark Mode Typography

- SHOULD: Increase `line-height` by 0.05-0.1 for light text on dark backgrounds (perceived weight is lighter, needs more breathing room)
- SHOULD: Reduce font weight slightly in dark mode (e.g., 350 instead of 400 for body)

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

## Tailwind-Specific Defaults

- MUST NOT: Use `text-xs` for body copy. Default to at least `text-sm`, and use `text-base` on mobile inputs and dense interactive text where zoom prevention matters.
- MUST NOT: Use `font-bold` for headings in product UI. Prefer `font-semibold` or `font-medium`.
- MUST NOT: Add explicit `leading-*` modifiers to headings unless a layout edge case truly requires it. Tailwind's default heading rhythm is the baseline.
- MUST: Use `text-balance` on headings and `text-pretty` on paragraph text.
- MUST: Use `tracking-tight` on headings larger than `text-xl` unless the chosen font is already condensed.
- MUST NOT: Default to `uppercase` + `tracking-wide`/`tracking-widest` eyebrows above section headings. This pattern is overused to the point of being a tell — the typographic equivalent of a purple-to-blue gradient. Most pages need zero eyebrows; many need one; almost none need them on every section.
- MUST NOT: Use `uppercase` eyebrow text on sans or serif fonts. Reserve uppercase eyebrows for **monospace** fonts only.
- SHOULD: When uppercase monospace eyebrows are used, pair with `tracking-wide` and use them sparingly (typically one per page, not as a section-divider habit).
- SHOULD: Prefer alternatives to the uppercase eyebrow — numeric labels (`01 / Pricing`), sentence-case kickers in the display font at smaller weight, a colored dot + label, or no eyebrow at all.
- SHOULD: Constrain long-form text with `max-w-[*ch]` or equivalent directly on the text element.

## Content Formatting

- MUST: Ellipsis character `…` (not `...`)
- MUST: Curly quotes `"` `"` and `'` `'` (not straight)
- MUST: Non-breaking spaces for units: `10\u00A0MB`, `⌘\u00A0K`
- SHOULD: Avoid widows/orphans in headings
