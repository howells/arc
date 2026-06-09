# Interface: Layout

## Principles

- MUST: Deliberate alignment (grid/baseline/edges/optical centers)
- MUST: Verify mobile, laptop, ultra-wide (simulate at 50% zoom)
- MUST: Respect safe areas via `env(safe-area-inset-*)`
- MUST: No unwanted scrollbars — fix overflows
- SHOULD: Optical alignment: ±1px when perception beats geometry
- SHOULD: Balance icon/text lockups (stroke, weight, size, spacing, color)

## Viewport

- MUST: `h-dvh` not `h-screen` (respects mobile browser chrome)
- MUST: Fixed elements respect `safe-area-inset-*`

## Z-Index

MUST use fixed scale — no arbitrary values like `z-[999]`:

| Layer | Tailwind | CSS Variable |
|-------|----------|--------------|
| Base | `z-0` | — |
| Dropdown | `z-10` | `--z-dropdown: 100` |
| Sticky | `z-20` | — |
| Modal | `z-30` | `--z-modal: 200` |
| Toast | `z-40` | `--z-toast: 400` |
| Tooltip | `z-50` | `--z-tooltip: 300` |

### Avoiding Z-Index

- SHOULD: Use `isolate` (Tailwind) to create stacking context without z-index:

```jsx
<div className="isolate">
  {/* New stacking context, no global z-index conflict */}
</div>
```
