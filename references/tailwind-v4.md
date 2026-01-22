# Tailwind CSS v4 Reference

Quick reference for Tailwind v4 syntax, breaking changes from v3, and new patterns.

---

## Build Setup

### Installation

Tailwind v4 uses dedicated packages instead of a single `tailwindcss` package:

```bash
# Vite projects (recommended)
npm install @tailwindcss/vite

# PostCSS projects
npm install @tailwindcss/postcss

# CLI
npm install @tailwindcss/cli
```

### Vite Configuration

```js
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'

export default {
  plugins: [tailwindcss()],
}
```

### PostCSS Configuration

```js
// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

### CSS Entry Point

Replace the v3 multi-directive approach:

```css
/* v3 (old) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4 (new) */
@import "tailwindcss";
```

---

## Breaking Syntax Changes

### Important Modifier Position

The `!` modifier now goes at the **end** of the class:

```html
<!-- v3 (old) -->
<div class="hover:!bg-red-500">

<!-- v4 (new) -->
<div class="hover:bg-red-500!">
```

### Arbitrary CSS Variables

Use parentheses instead of brackets for CSS variables:

```html
<!-- v3 (old) -->
<div class="bg-[--my-color]">

<!-- v4 (new) -->
<div class="bg-(--my-color)">
```

Brackets are still used for arbitrary literal values:

```html
<div class="w-[200px]">  <!-- literal value: brackets -->
<div class="w-(--width)"> <!-- CSS variable: parentheses -->
```

### Space-Separated Arbitrary Values

Use underscores for spaces in arbitrary values:

```html
<div class="grid-cols-[1fr_2fr_1fr]">
<div class="font-['Open_Sans']">
```

---

## Renamed Utilities

Shadow, blur, and rounded utilities shifted nomenclature:

| v3 | v4 | Notes |
|----|----|-------|
| `shadow-sm` | `shadow-xs` | |
| `shadow` | `shadow-sm` | |
| `shadow-md` | `shadow` | New default |
| `blur-sm` | `blur-xs` | |
| `blur` | `blur-sm` | |
| `rounded-sm` | `rounded-xs` | |
| `rounded` | `rounded-sm` | |
| `ring` | `ring-3` | Default width changed from 3px to 1px |
| `outline-none` | `outline-hidden` | |

---

## Removed Utilities

### Opacity Utilities

Standalone opacity utilities are removed. Use slash notation:

```html
<!-- v3 (old) -->
<div class="bg-black bg-opacity-50">
<div class="text-blue-500 text-opacity-75">

<!-- v4 (new) -->
<div class="bg-black/50">
<div class="text-blue-500/75">
```

This applies to:
- `bg-opacity-*`
- `text-opacity-*`
- `border-opacity-*`
- `divide-opacity-*`
- `ring-opacity-*`
- `placeholder-opacity-*`

---

## Default Behavior Changes

### Border and Ring Colors

Now default to `currentColor` instead of a themed gray:

```html
<!-- If you relied on the default gray, be explicit -->
<div class="border border-gray-200">
<div class="ring ring-gray-300">
```

### Ring Width

Default ring width is now 1px (was 3px). Use `ring-3` for the old default:

```html
<!-- v3 behavior -->
<div class="ring">        <!-- was 3px -->

<!-- v4 equivalent -->
<div class="ring-3">      <!-- explicit 3px -->
<div class="ring">        <!-- now 1px -->
```

### Cursor on Buttons

Buttons default to `cursor-default` (was `cursor-pointer`). Add explicitly if desired:

```html
<button class="cursor-pointer">Click me</button>
```

### Placeholder Opacity

Placeholders are 50% opacity of the text color (was a separate gray from theme).

### Hover on Touch Devices

`hover:*` variants are wrapped in `@media (hover: hover)` to prevent sticky hover states on touch devices.

---

## CSS-First Configuration

### Theme Customization

Use `@theme` blocks in CSS instead of JavaScript config:

```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-brand-50: oklch(0.97 0.02 250);
  --color-brand-500: oklch(0.55 0.15 250);
  --color-brand-900: oklch(0.25 0.08 250);

  /* Fonts */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Spacing scale additions */
  --spacing-18: 4.5rem;
  --spacing-128: 32rem;
}
```

### Custom Utilities

```css
@utility content-auto {
  content-visibility: auto;
}

@utility scrollbar-hidden {
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
```

### Custom Variants

```css
@custom-variant pointer-coarse (@media (pointer: coarse));
@custom-variant theme-dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

### Migrating from JavaScript Config

For gradual migration, import your v3 config:

```css
@import "tailwindcss";
@config "./tailwind.config.js";
```

---

## New Features

### Container Queries (Built-in)

No plugin required:

```html
<div class="@container">
  <div class="@lg:grid-cols-2">
    <!-- Responds to container width, not viewport -->
  </div>
</div>
```

### Build-Time Color Functions

```css
@theme {
  --color-primary-hover: --alpha(var(--color-primary) / 80%);
}
```

### Spacing Function

Reference spacing scale in custom CSS:

```css
.custom-element {
  padding: --spacing(4);  /* 1rem */
  margin: --spacing(8);   /* 2rem */
}
```

---

## Browser Support

Tailwind v4 targets modern browsers:
- Safari 16.4+
- Chrome 111+
- Firefox 128+

Uses features like `@property` and `color-mix()` that aren't polyfillable.

---

## Migration Checklist

1. Update build tooling to new packages
2. Replace CSS entry directives with `@import "tailwindcss"`
3. Move `!` modifiers to end of classes
4. Update CSS variable syntax: `[--var]` → `(--var)`
5. Rename shifted utilities (shadow, blur, rounded)
6. Replace opacity utilities with slash notation
7. Add explicit colors where you relied on defaults
8. Test hover states on touch devices
9. Migrate JavaScript config to `@theme` blocks (optional)
