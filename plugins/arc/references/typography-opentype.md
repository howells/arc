# Typography & OpenType Reference

Advanced typography features for polished, professional interfaces. Companion to `rules/interface/typography.md` for baseline rules.

---

## OpenType Feature Settings

OpenType features unlock professional typographic refinements. Use `font-feature-settings` for fine control or `font-variant-*` for standardized features.

### Numeric Formatting

| Feature | Property                                   | Effect                   | Use When                              |
| ------- | ------------------------------------------ | ------------------------ | ------------------------------------- |
| `tnum`  | `font-variant-numeric: tabular-nums`       | Fixed-width digits       | Data tables, prices, timers, counters |
| `lnum`  | `font-variant-numeric: lining-nums`        | Uniform height digits    | Tables, UI elements                   |
| `onum`  | `font-variant-numeric: oldstyle-nums`      | Varying height digits    | Running body text, editorial          |
| `frac`  | `font-variant-numeric: diagonal-fractions` | Proper fractions (½)     | Recipes, measurements                 |
| `ordn`  | `font-variant-numeric: ordinal`            | Ordinal indicators (1st) | Dates, rankings                       |

```css
/* Data tables — digits align vertically */
.data-cell {
  font-variant-numeric: tabular-nums lining-nums;
}

/* Tailwind */
<td class="tabular-nums">1,234.56</td>

/* Body text — digits blend with lowercase */
.prose {
  font-variant-numeric: oldstyle-nums proportional-nums;
}
```

**Most important rule:** Always use `tabular-nums` for:

- Prices and currency
- Timers and countdowns
- Table columns with numbers
- Statistics and metrics
- Any numbers that animate or change

Without `tabular-nums`, changing digits cause layout shift because `1` is narrower than `0`.

### Ligatures

| Feature | Property                                          | Effect                        |
| ------- | ------------------------------------------------- | ----------------------------- |
| `liga`  | `font-variant-ligatures: common-ligatures`        | Standard ligatures (fi, fl)   |
| `dlig`  | `font-variant-ligatures: discretionary-ligatures` | Decorative ligatures          |
| `clig`  | `font-variant-ligatures: contextual`              | Context-dependent connections |

```css
/* Enable standard ligatures (usually on by default) */
body {
  font-variant-ligatures: common-ligatures;
}

/* Disable ligatures in code */
code,
pre {
  font-variant-ligatures: none;
}
```

**Always disable ligatures in monospace/code text.** `fi` as a ligature in code is misleading.

### Small Caps

```css
/* True small caps (not fake scaled-down capitals) */
.small-caps {
  font-variant-caps: small-caps;
}

/* Labels, dates, abbreviations */
<span class="small-caps">NASA</span>
<time class="small-caps">3:45 PM</time>
```

Only use if the font has designed small cap glyphs. Faked small caps (scaled capitals) look bad.

---

## Kerning

```css
/* Enable font-level kerning */
body {
  font-kerning: normal;
}

/* Tailwind */
<h1 class="tracking-tight">Tight Headlines</h1>
```

### Manual Tracking Adjustments

| Context                    | Tracking                         | Why                                  |
| -------------------------- | -------------------------------- | ------------------------------------ |
| Large display text (>48px) | Tighter (`-0.02em` to `-0.04em`) | Large text has too much visual space |
| Body text (14-18px)        | Default (0)                      | Designed for this range              |
| Small text (<12px)         | Looser (`0.01em` to `0.02em`)    | Improves legibility at small sizes   |
| All caps                   | Looser (`0.05em` to `0.1em`)     | Caps need more breathing room        |
| Buttons/labels (caps)      | Looser (`0.02em` to `0.05em`)    | Improves readability                 |

```css
/* Headline */
h1 {
  letter-spacing: -0.02em;
}

/* All-caps label */
.label {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

---

## Text Wrapping

### `text-wrap` Values

| Value     | Use For              | Effect                               |
| --------- | -------------------- | ------------------------------------ |
| `balance` | Headings, short text | Evenly distributes text across lines |
| `pretty`  | Body paragraphs      | Avoids orphaned words on last line   |
| `stable`  | Editable content     | Doesn't reflow as user types         |

```css
/* Headings: balanced wrapping */
h1,
h2,
h3 {
  text-wrap: balance;
}

/* Body: avoid orphans */
p {
  text-wrap: pretty;
}
```

```html
<!-- Tailwind -->
<h1 class="text-balance">A heading that wraps nicely across lines</h1>
<p class="text-pretty">
  Body text that avoids leaving a single word on the last line
</p>
```

**Performance note:** `text-wrap: balance` has a performance cost on very long text (it tries multiple layouts). Only use on headings and short text blocks, not on entire pages of prose.

### Hyphenation

```css
/* Enable hyphenation for narrow columns */
.narrow-column {
  hyphens: auto;
  -webkit-hyphens: auto;
  overflow-wrap: break-word;
}
```

Use hyphenation for:

- Narrow sidebar text
- Mobile layouts where words exceed container width
- Multi-column layouts

Avoid for:

- Headlines (use `text-balance` instead)
- Code or technical terms
- Short labels

---

## Line Height Relationships

Line height should relate to the type scale:

| Text Size   | Line Height | Ratio        |
| ----------- | ----------- | ------------ |
| 12px (xs)   | 16px        | 1.33         |
| 14px (sm)   | 20px        | 1.43         |
| 16px (base) | 24px        | 1.5          |
| 18px (lg)   | 28px        | 1.56         |
| 20px (xl)   | 28px        | 1.4          |
| 24px (2xl)  | 32px        | 1.33         |
| 30px (3xl)  | 36px        | 1.2          |
| 36px (4xl)  | 40px        | 1.11         |
| 48px (5xl)  | 48px        | 1.0          |
| 60px+       | 1.0–1.1     | Nearly solid |

**Pattern:** As text gets larger, line height ratio decreases. Large display text at 1.5 line height looks excessively spaced.

---

## Viewport-Based Sizing

Use `clamp()` for responsive typography without breakpoints:

```css
/* Fluid heading: 24px at 320px viewport, 48px at 1440px */
h1 {
  font-size: clamp(1.5rem, 1rem + 2vw, 3rem);
}

/* Fluid body: 14px minimum, 18px maximum */
body {
  font-size: clamp(0.875rem, 0.8rem + 0.25vw, 1.125rem);
}
```

**Rules:**

- Always set a minimum (`clamp` first value) — viewport units alone can make text unreadable on small screens
- Always set a maximum — text shouldn't grow forever on large screens
- Body text range: 14px–18px
- Heading text range: 24px–64px depending on hierarchy level

---

## Performance

### Font Loading Strategy

```css
/* Prevent FOIT (Flash of Invisible Text) */
@font-face {
  font-family: "Custom Font";
  src: url("/fonts/custom.woff2") format("woff2");
  font-display: swap; /* Show fallback immediately, swap when loaded */
}
```

| `font-display` | Behavior                              | Use When                         |
| -------------- | ------------------------------------- | -------------------------------- |
| `swap`         | Fallback immediately, swap when ready | Body text (readability > style)  |
| `optional`     | Fallback if not cached, no swap       | Performance-critical pages       |
| `block`        | Brief invisible period, then swap     | Display/brand fonts (short text) |

### Subsetting

Only load the characters you need:

```css
/* Latin-only subset */
@font-face {
  unicode-range: U+0000-00FF, U+0131, U+0152-0153;
}
```

Next.js `next/font` handles subsetting automatically.

---

## Quick Reference

```
NUMBERS IN TABLES     → tabular-nums (always)
NUMBERS IN PROSE      → oldstyle-nums (if font supports)
LIGATURES IN CODE     → disabled (always)
LARGE HEADINGS        → tighter tracking (-0.02em)
ALL CAPS              → wider tracking (+0.05em)
HEADINGS WRAPPING     → text-balance
BODY WRAPPING         → text-pretty
LINE HEIGHT           → decreases as text size increases
FLUID SIZING          → clamp(min, preferred, max)
FONT DISPLAY          → swap for body, optional for perf-critical
```
