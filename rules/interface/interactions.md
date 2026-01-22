# Interface: Interactions

## Keyboard

- MUST: Full keyboard support per [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/)
- MUST: Visible focus rings via `focus-visible:ring-2`
- MUST: Focus trap in modals; return focus on close

## Touch Targets

- MUST: Minimum `min-h-6 min-w-6` (24px), mobile `min-h-11 min-w-11` (44px)
- MUST: Expand hit area if visual element is smaller:

```jsx
<button className="relative">
  <span className="absolute -inset-2.5" /> {/* Expands hit area */}
  <Icon className="size-4" />
</button>
```

## Input

- MUST: `text-base` minimum on mobile inputs (prevents iOS zoom)
- MUST: `touch-manipulation` on controls (prevents double-tap zoom)

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
```

Global in CSS:
```css
@layer base {
  * { -webkit-tap-highlight-color: transparent; }
}
```

## Hover States

- MUST: Gate hover styles:

```jsx
<button className="@media(hover:hover):hover:bg-gray-100">
  {/* Or use Tailwind plugin / custom variant */}
</button>
```

Or define custom variant in Tailwind config:
```js
// tailwind.config.js
'hover-hover': '@media (hover: hover) and (pointer: fine)',
```

- NEVER: Rely on hover for functionality — hover enhances only

## State & Navigation

- MUST: URL reflects state (filters, tabs, pagination). Use [nuqs](https://nuqs.dev)
- MUST: Back/Forward restores scroll position
- MUST: Use `<a>/<Link>` for navigation (supports Cmd-click)

## Feedback

- SHOULD: Optimistic UI with rollback on failure
- MUST: `AlertDialog` for destructive actions (not `Dialog`)
- MUST: `aria-live="polite"` for toasts/validation
- SHOULD: Ellipsis for follow-up actions ("Rename…", "Loading…")

## Time-Limited Actions

- MUST: Pause timers when tab hidden:

```js
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseTimer();
  else resumeTimer();
});
```

## Drag/Scroll

- MUST: `overscroll-contain` in modals/drawers
- MUST: During drag: `select-none`, set `inert` on container
- MUST: No dead zones — if it looks clickable, it is

### `inert` Attribute

Disables all interaction on element and children:

```jsx
<div inert={!isVisible}>{/* non-interactive when inert */}</div>
```

Use for: hidden panels, content behind modals, drag containers.

## Tooltips

- MUST: 200ms delay before showing
- MUST: After first tooltip opens, subsequent tooltips show immediately (warm state)
- SHOULD: Clear warm state 300ms after all tooltips close

## Menus

- SHOULD: Trigger on `mousedown` (not `click`)
- MUST: No dead zones between menu items — use `py-*` not `space-y-*`
- SHOULD: Safe-area triangle for submenu diagonal movement

### Submenu Safe Triangle

Prevents menu from closing when moving diagonally to submenu:

```css
/* On the submenu trigger item */
.menu-item-with-submenu::after {
  content: "";
  position: absolute;
  inset: 0;
  right: -100%;
  clip-path: polygon(
    0 0,           /* top left */
    100% 0,        /* top right */
    100% 100%,     /* bottom right - submenu position */
    0 100%         /* bottom left */
  );
  pointer-events: auto;
}
```

For dynamic positioning, calculate clip-path in JS based on submenu position.

## Interactive Elements

- SHOULD: `select-none` on buttons, tabs
- MUST: `pointer-events-none` on decorative overlays
- SHOULD: Toggles take effect immediately (no confirmation)
