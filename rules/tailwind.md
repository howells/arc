# Tailwind v4

Pithy rules for agents. Follow these and styles will work across apps.

## Configuration Rules
- MUST: Use config-free setup only; do not add `tailwind.config.*` files.
- MUST: Use PostCSS with `@tailwindcss/postcss` plugin.
- MUST: Configure source paths with `@source` directives in CSS.

## Source Path Configuration
- MUST: Tailwind v4 only generates classes it finds under `@source`. Point to all places where class names live.

For single apps:
```css
@import "tailwindcss";

@source "../**/*.{ts,tsx}";
```

For monorepos with shared config:
```css
@import "tailwindcss";

/* Scan UI package and any apps that include Tailwind classes */
@source "../ui/src/**/*.{ts,tsx}";                      /* UI components */
@source "../../apps/**/src/**/*.{ts,tsx,mdx}";          /* app sources */
@source "../../apps/**/**/*.stories.@(ts|tsx|mdx)";     /* stories */
```

If spacing/radius/colors are missing anywhere, your `@source` paths are wrong.

## Theme Tokens

Map CSS variables to Tailwind v4 tokens so utilities like `bg-primary` work:

```css
@theme {
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
}
```

## Gray Palette
- MUST: Use `gray-*` for all neutral/gray colors (e.g., `bg-gray-100`, `text-gray-500`).
- NEVER: Use other gray-like palettes (`neutral`, `zinc`, `slate`, `stone`) — standardize on `gray`.

## Prohibitions
- NEVER: Safelist classes — fix `@source` or token mapping instead.
- NEVER: Add `tailwind.config.js` or `tailwind.config.ts` files.
- NEVER: Rely on `important` hacks.

## Sizing

- SHOULD: Use `size-*` for square elements instead of `w-* h-*` (e.g., `size-8` not `w-8 h-8`)

## Class Utilities

- MUST: Use `cn` utility (`clsx` + `tailwind-merge`) for conditional class logic
- MUST: Use `cva` (class-variance-authority) for component variants

```ts
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## Quick Checklist
- MUST: App imports Tailwind CSS once (e.g., in `globals.css`).
- MUST: App has PostCSS plugin `{ "@tailwindcss/postcss": {} }`.
- MUST: `@source` globs cover any new package/app paths you add.
- MUST: Token mappings cover the utilities your components use.
