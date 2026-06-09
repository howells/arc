# Interface: Responsive Design

## Mobile-First

MUST write base styles for mobile, use `min-width` queries (Tailwind responsive prefixes) to layer complexity:

```html
<!-- Mobile-first: base → sm → md → lg -->
<div class="flex flex-col md:flex-row gap-4 md:gap-8">
```

Desktop-first means mobile loads unnecessary styles first.

---

## Content-Driven Breakpoints

Don't chase device sizes — let content tell you where to break. Start narrow, stretch until design breaks, add breakpoint there.

Three breakpoints usually suffice. Use `clamp()` for fluid values without breakpoints:

```html
<h1 class="text-[clamp(2rem,5vw,4.5rem)]">Fluid Heading</h1>
```

---

## Detect Input Method, Not Just Screen Size

Screen size doesn't tell you input method. A laptop with touchscreen, a tablet with keyboard — use pointer and hover queries:

```html
<!-- Tailwind: fine pointer (mouse, trackpad) -->
<button class="px-3 py-2 pointer-fine:px-2 pointer-fine:py-1.5">

<!-- Tailwind: coarse pointer (touch) — larger targets -->
<button class="min-h-11 pointer-coarse:min-h-12">
```

```css
/* Custom variant in Tailwind v4 */
@custom-variant pointer-fine (@media (pointer: fine));
@custom-variant pointer-coarse (@media (pointer: coarse));

/* Gate hover effects to devices that support hover */
@custom-variant hover-hover (@media (hover: hover) and (pointer: fine));
```

- NEVER: Rely on hover for functionality — touch users can't hover
- MUST: Gate hover styles behind `hover-hover:` or `@media (hover: hover)`

---

## Safe Areas

Modern phones have notches, rounded corners, and home indicators:

```html
<body class="pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
```

```html
<!-- Enable viewport-fit -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

```css
/* With fallback */
.footer { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
```

---

## Responsive Images

### srcset with Width Descriptors

```html
<img
  src="hero-800.jpg"
  srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1200.jpg 1200w"
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="Hero image"
  class="w-full object-cover"
>
```

- `srcset` lists available images with actual widths (`w` descriptors)
- `sizes` tells the browser how wide the image displays
- Browser picks the best file based on viewport AND device pixel ratio

### Art Direction with `<picture>`

When you need different crops/compositions (not just resolutions):

```html
<picture>
  <source media="(min-width: 768px)" srcset="hero-wide.jpg">
  <source media="(max-width: 767px)" srcset="hero-tall.jpg">
  <img src="hero-fallback.jpg" alt="..." class="w-full">
</picture>
```

---

## Layout Adaptation Patterns

### Navigation

Three stages:
- **Mobile**: Hamburger + drawer (`hidden md:flex` for nav, sheet/drawer for mobile menu)
- **Tablet**: Horizontal compact (icons + labels)
- **Desktop**: Full navigation with labels

### Tables

Transform to cards on mobile:

```html
<div class="hidden md:table"><!-- Full table --></div>
<div class="md:hidden space-y-4"><!-- Card stack --></div>
```

### Progressive Disclosure

Use `<details>/<summary>` for content that can collapse on mobile:

```html
<details class="md:open" open>
  <summary class="md:hidden">Show filters</summary>
  <div><!-- Filter content --></div>
</details>
```

---

## Testing

Don't trust DevTools alone. DevTools device emulation misses:

- Actual touch interactions
- Real CPU/memory constraints
- Font rendering differences
- Browser chrome/keyboard appearances

SHOULD test on: one real iPhone, one real Android, a tablet if relevant. Cheap Android phones reveal performance issues simulators hide.

---

## Anti-Patterns

- NEVER: Desktop-first CSS (base styles should be mobile)
- NEVER: Device detection instead of feature detection
- NEVER: Separate mobile/desktop codebases
- NEVER: Ignore tablet and landscape orientations
- NEVER: Assume all mobile devices are powerful
