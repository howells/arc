# Interface: Tailwind Authoring

Class-level Tailwind guidance for writing cleaner, more consistent UI code.

## Markup Hygiene

- MUST: Put `text-*` and `leading-*` classes on block-level text containers, not inline formatting tags like `<span>`, `<a>`, `<strong>`, or `<em>` unless the inline element is intentionally acting as a text container.
- MUST NOT: Add redundant display classes such as `block` on `<div>` or `inline` on `<span>` unless a variant changes them.
- MUST NOT: Stack conflicting classes for the same property unless a variant, breakpoint, or state distinguishes them.
- SHOULD: Keep semantics first. If a list is really a list, use `<ul>` or `<ol>`.
- SHOULD: Add `role="list"` to `<ul>` / `<ol>` when list styling is intentionally removed.
- MUST: Apply `antialiased` on the app root.
- SHOULD: Apply `isolate` on the main app shell so overlays and layering stay predictable.

## Class Preferences

- MUST: Prefer `gap-*` on the parent over `mt-*` / `mb-*` between flex or grid children.
- MUST: Prefer `size-*` over paired `h-*` and `w-*` when both dimensions match.
- MUST: Prefer shorthands like `p-6` over split axis classes when values are identical.
- SHOULD: Split axes only when one axis genuinely differs or is overridden by a variant.
- MUST: Prefer named scale values over arbitrary values whenever the scale can express the intent.
- MUST: Prefer `z-50` style classes over `z-[50]`; use arbitrary z values only when no scale value works.
- MUST: Prefer slash opacity modifiers like `bg-neutral-950/5` over bracket opacity syntax.
- MUST: Use `rem` for arbitrary font sizes, not pixel literals.
- MUST: Reference design tokens for arbitrary radii, spacing, and colors rather than raw pixel literals.
- SHOULD: Prefer `not-*` variants over a base class immediately overridden elsewhere.
- SHOULD: Prefer `data-closed:*` style variants over bracket syntax when Tailwind exposes a named variant.
- MUST: Use `min-h-dvh`, `min-h-svh`, or `min-h-lvh` for full-height layouts; avoid `min-h-screen`.
- MUST: Use `bg-linear-*` utilities, not legacy `bg-gradient-*`.
- MUST: Use `shrink-*` / `grow-*`, not `flex-shrink-*` / `flex-grow-*`.
- SHOULD: Keep grid ratios whole-number and readable when using arbitrary fractional tracks.
- MUST NOT: Use named line-height shorthands like `leading-tight` for product UI. Use scale-backed values such as `leading-6` or combined text/leading shorthands.
- MUST: Add `tabular-nums` anywhere numbers change over time or compare against neighboring numbers.

## CSS Variable Patterns

- MUST: Use the `--spacing()` helper when available instead of `calc(var(--spacing) * n)`.
- MUST: Prefer CSS variables for arbitrary colors; do not call `theme()` inside authored UI code.
- SHOULD: Express static CSS variables with arbitrary property syntax rather than inline styles.
- MUST: For dynamic values, set a CSS variable inline and reference it from the class (`class="w-(--progress)" style="--progress: 72%"`).

## Custom Utilities

- MUST: Prefer `@utility` to ad hoc class selectors in authored Tailwind CSS.
- SHOULD: Use parameterized `@utility` definitions with `--value()` / `--modifier()` when the pattern repeats.
- SHOULD: Use `@variant` inside `@utility` when wiring into existing variants.
- MUST: Use `@custom-variant` only for genuinely new semantics.
- MUST NOT: Nest `@utility` inside `@media` or `@supports`.

## Import Order

- MUST: Put remote `@import` URLs at the top of the stylesheet, before `@import "tailwindcss"`.

## Review Questions

- Are repeated child spacing rules expressed as parent `gap-*`?
- Are arbitrary values justified, or should they be promoted to tokens or scale values?
- Would a second engineer read this class string and immediately understand the intended hierarchy?
