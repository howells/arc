# Spacing Rules

Prescriptive requirements for spacing, layout, and whitespace in UI.

---

## Spacing Philosophy

### Start Generous

MUST start with more whitespace than you think you need. Remove space only when you have a specific, articulated reason.

"It feels empty" is not a reason. "These items need to appear grouped" is.

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

## Vertical Rhythm in Content Stacks

When elements form a vertical content stack (e.g., logo → subtitle → body → actions), spacing must reflect hierarchy and relationship.

### Heading Belongs to Its Body

A heading MUST be closer to the content it introduces than to the content above it. Space above a heading > space below it.

```
Bad (equal spacing):
  [Section Title]
         ← 24px
  [Body Text]
         ← 24px
  [Next Section Title]

Good (heading attached to its body):
  [Section Title]
         ← 12px
  [Body Text]

         ← 32px
  [Next Section Title]
         ← 12px
  [Body Text]
```

### Use a Consistent Ratio

Gaps within a content stack SHOULD follow a ratio (2:1 is clean and easy to maintain):

| Relationship | Spacing | Why |
|---|---|---|
| Display element → subtitle | Larger (e.g., `mb-6 lg:mb-8`) | Different visual scales |
| Subtitle → body text | Smaller (e.g., `mt-3 lg:mt-4`) | Same thought, different detail |
| Last content → different group | Matches the largest gap | Group boundary separation |

The ratio between adjacent gaps matters more than the absolute values. Pick a ratio and apply it consistently within a stack.

### Group Boundaries

When a content group meets a different functional group (e.g., copy → action buttons), the gap SHOULD be equal to or greater than the largest within-group gap. Borders, dividers, or background changes reinforce group boundaries and reduce the space needed.

---

## Container Queries

Viewport queries are for page layouts. **Container queries are for components**:

```html
<!-- Tailwind v4 container queries -->
<div class="@container">
  <div class="grid gap-4 @md:grid-cols-[120px_1fr]">
    <!-- Card adapts to its container, not the viewport -->
  </div>
</div>
```

A card in a narrow sidebar stays compact; the same card in main content expands — automatically, without viewport hacks.

SHOULD: Prefer `@container` over viewport breakpoints for reusable components.

---

## Optical Alignment

### Text Alignment

Text at `margin-left: 0` often looks indented due to letterform whitespace. Use negative margin to optically align:

```html
<h1 class="-ml-[0.05em] text-5xl font-bold">Headline</h1>
```

### Icon Centering

Geometrically centered icons often look off-center:
- Play icons need to shift right (`translate-x-px`)
- Arrows shift toward their direction
- Circular icons in square containers may need visual nudging

### Touch Targets vs Visual Size

Buttons can look small but need large touch targets (44px minimum). Expand with padding or pseudo-elements:

```html
<button class="relative size-6">
  <span class="absolute -inset-2.5" /> <!-- Expands tap target to 44px -->
  <Icon class="size-4" />
</button>
```

---

## The Squint Test

Blur your eyes (or screenshot and blur). Can you still identify:
- The most important element?
- The second most important?
- Clear groupings?

If everything looks the same weight blurred, you have a hierarchy problem. Combine multiple dimensions for strong hierarchy:

| Tool | Strong | Weak |
|------|--------|------|
| Size | 3:1+ ratio | <2:1 ratio |
| Weight | Bold vs Regular | Medium vs Regular |
| Color | High contrast | Similar tones |
| Space | Surrounded by whitespace | Crowded |

The best hierarchy uses 2-3 dimensions at once.

---

## Cards Are Not Required

Cards are overused. Spacing and alignment create visual grouping naturally. Use cards only when:
- Content is truly distinct and actionable
- Items need visual comparison in a grid
- Content needs clear interaction boundaries

NEVER nest cards inside cards — use spacing, typography, and subtle dividers for hierarchy within a card.

---

## Anti-Patterns

NEVER:
- Use the same spacing between all elements (creates ambiguous grouping)
- Scale spacing proportionally with screen size (larger screens need more absolute space, not proportionally more)
- Fill space just because it's available
- Use arbitrary Tailwind values (`p-[13px]`) — stick to the scale

---

## Responsive Spacing

SHOULD increase spacing on larger screens for breathing room:

```html
<section class="p-4 md:p-6 lg:p-8">
<div class="gap-4 md:gap-6">
```

Headlines and sections need more generous spacing at larger sizes—the proportions matter more than absolute values.
