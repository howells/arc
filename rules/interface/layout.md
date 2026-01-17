# Interface: Layout

Source references:
- Vercel Design – Web Interface Guidelines: https://vercel.com/design/guidelines
- Web Interface Guidelines: https://github.com/vercel-labs/web-interface-guidelines

## Principles
- SHOULD: Optical alignment; adjust by ±1px when perception beats geometry
- MUST: Deliberate alignment to grid/baseline/edges/optical centers—no accidental placement
- SHOULD: Balance icon/text lockups (stroke/weight/size/spacing/color)
- MUST: Verify mobile, laptop, ultra-wide (simulate ultra-wide at 50% zoom)
- MUST: Respect safe areas (use `env(safe-area-inset-*)`)
- MUST: Avoid unwanted scrollbars; fix overflows

## Viewport Units

- MUST: Use `h-dvh` instead of `h-screen` (respects dynamic mobile viewport with browser chrome)
- MUST: Fixed elements must respect `safe-area-inset-*`

## Z-Index Scale

- MUST: Use a fixed z-index scale; no arbitrary values like `z-[999]`
- Example scale: `z-0` (base) → `z-10` (dropdown) → `z-20` (sticky) → `z-30` (modal) → `z-40` (toast) → `z-50` (tooltip)
