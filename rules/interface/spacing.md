# Spacing Rules

Prescriptive requirements for spacing, layout, and whitespace in UI.

---

## Spacing Philosophy

### Start Generous

MUST start with more whitespace than you think you need. Remove space only when you have a specific, articulated reason.

"It feels empty" is not a reason. "These items need to appear grouped" is.

### Spacing Creates Grouping

Elements MUST be obviously closer to related content than to unrelated content. Ambiguous spacing forces users to think.

```
Bad:
  [Header]
         ← 20px
  [Related Content]
         ← 20px (same!)
  [Unrelated Footer]

Good:
  [Header]
         ← 8px
  [Related Content]

         ← 32px (clearly different)
  [Unrelated Footer]
```

---

## Base Unit

SHOULD use 4px as the atomic unit. All spacing values SHOULD be multiples of 4:

```
4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96...
```

16px is a comfortable default for most interface padding.

NEVER use arbitrary values like 13px or 27px. Stick to the scale.

---

## Spacing Scale (Tailwind)

Use Tailwind's built-in spacing scale. No custom tokens needed:

| Class | Value | Use Case |
|-------|-------|----------|
| `p-0.5`, `gap-0.5` | 2px | Micro adjustments |
| `p-1`, `gap-1` | 4px | Tight relationships |
| `p-2`, `gap-2` | 8px | Related elements |
| `p-3`, `gap-3` | 12px | Compact layouts |
| `p-4`, `gap-4` | 16px | Default padding |
| `p-6`, `gap-6` | 24px | Section spacing |
| `p-8`, `gap-8` | 32px | Generous separation |
| `p-12`, `gap-12` | 48px | Major sections |
| `p-16`, `gap-16` | 64px | Page-level spacing |

Reference: [Tailwind Spacing Scale](https://tailwindcss.com/docs/customizing-spacing)

---

## Component Spacing

### Buttons

```html
<button class="px-4 py-2">  <!-- Standard -->
<button class="px-3 py-1.5">  <!-- Small -->
<button class="px-6 py-3">  <!-- Large -->
```

### Cards

```html
<div class="p-4">  <!-- Compact -->
<div class="p-6">  <!-- Standard -->
<div class="p-8">  <!-- Spacious -->
```

### Form Fields

```html
<div class="space-y-4">  <!-- Vertical gap between fields -->
  <input class="px-3 py-2">
</div>
```

---

## Content Max-Width

MUST constrain readable content width. Optimal line length is 45-75 characters.

```html
<article class="max-w-prose">  <!-- ~65ch, ideal for reading -->
<div class="max-w-xl">  <!-- 576px, short-form content -->
<div class="max-w-2xl">  <!-- 672px, medium content -->
<div class="max-w-4xl">  <!-- 896px, wider layouts -->
```

NEVER let body text span the full viewport width on large screens.

---

## Anti-Patterns

NEVER:
- Use the same spacing between all elements (creates ambiguous grouping)
- Let content touch its container edges (always have padding)
- Scale spacing proportionally with screen size (larger screens need more absolute space, not proportionally more)
- Fill space just because it's available

---

## Responsive Spacing

SHOULD increase spacing on larger screens for breathing room:

```html
<section class="p-4 md:p-6 lg:p-8">
<div class="gap-4 md:gap-6">
```

Headlines and sections need more generous spacing at larger sizes—the proportions matter more than absolute values.
