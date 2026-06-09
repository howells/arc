# Tailwind v4

## Configuration

- MUST: Use config-free setup only; do not add `tailwind.config.*` files.
- MUST: Use PostCSS with `@tailwindcss/postcss` plugin.
- MUST: Configure source paths with `@source` directives in CSS.
- MUST: App imports Tailwind CSS once (e.g., in `globals.css`).

## Source Paths

- MUST: `@source` globs cover every directory where class names appear.
- NEVER: Safelist classes — fix `@source` or token mapping instead.

```css
@import "tailwindcss";
@source "../**/*.{ts,tsx}";
```

For monorepos, add `@source` entries for shared UI packages and app sources.

## Theme Tokens

- MUST: Map CSS variables to Tailwind tokens via `@theme` so utilities like `bg-primary` work.
- MUST: Token mappings cover the utilities your components use.

```css
@theme {
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
}
```

## Gray Palette

- MUST: Pick one neutral palette (e.g., `gray`, `zinc`, `slate`) and use it consistently.
- NEVER: Mix multiple neutral palettes in the same project.

## Utilities

- MUST: Use `cn` utility (`clsx` + `tailwind-merge`) for conditional class logic.
- MUST: Use `cva` (class-variance-authority) for component variants.
- SHOULD: Use `size-*` for square elements instead of `w-* h-*`.
- NEVER: Rely on `important` hacks.
