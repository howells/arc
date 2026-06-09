# Interface: Interactions

## The Eight Interactive States

Every interactive element needs these states designed:

| State | When | Tailwind Treatment |
|-------|------|-------------------|
| **Default** | At rest | Base styling |
| **Hover** | Pointer over (not touch) | `hover-hover:hover:bg-gray-100` |
| **Focus** | Keyboard/programmatic focus | `focus-visible:ring-2 focus-visible:ring-offset-2` |
| **Active** | Being pressed | `active:scale-[0.97]` |
| **Disabled** | Not interactive | `disabled:opacity-50 disabled:pointer-events-none` |
| **Loading** | Processing | Spinner, skeleton, `aria-busy="true"` |
| **Error** | Invalid state | `aria-invalid:border-red-500` |
| **Success** | Completed | Green check, confirmation |

Common miss: Designing hover without focus, or vice versa. Keyboard users never see hover states.

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
- MUST: During drag: `select-none`, disable text selection, set `inert` on dragged element/container
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

## Focus Rings

NEVER `outline: none` without replacement. Use `:focus-visible` to show focus only for keyboard:

```jsx
<button className="outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900">
```

Focus ring requirements:
- High contrast (3:1 minimum against adjacent colors)
- 2-3px thick
- Offset from element (not inside it)
- Consistent across all interactive elements

## Native Popover API

For tooltips, dropdowns, and non-modal overlays, prefer native popovers:

```html
<button popovertarget="menu">Open menu</button>
<div id="menu" popover class="p-4 rounded-lg shadow-lg">
  <button>Option 1</button>
  <button>Option 2</button>
</div>
```

Benefits: Light-dismiss (click outside closes), proper stacking, no z-index wars, accessible by default.

## Roving Tabindex

For component groups (tabs, menu items, radio groups), one item is tabbable; arrow keys move within:

```html
<div role="tablist">
  <button role="tab" tabindex="0">Tab 1</button>
  <button role="tab" tabindex="-1">Tab 2</button>
  <button role="tab" tabindex="-1">Tab 3</button>
</div>
```

Arrow keys move `tabindex="0"` between items. Tab moves to the next component entirely.

## Destructive Actions: Undo > Confirm

SHOULD prefer undo over confirmation dialogs — users click through confirmations mindlessly:

1. Remove from UI immediately
2. Show undo toast
3. Actually delete after toast expires

Use confirmation only for truly irreversible actions (account deletion), high-cost actions, or batch operations.

## Gesture Discoverability

Swipe-to-delete and similar gestures are invisible. Hint at their existence:

- **Partially reveal**: Show delete button peeking from edge
- **Onboarding**: Coach marks on first use
- **Alternative**: Always provide a visible fallback (menu with "Delete")

NEVER rely on gestures as the only way to perform actions.

## Interactive Elements

- SHOULD: `select-none` on buttons, tabs
- MUST: `pointer-events-none` on decorative overlays
- SHOULD: Toggles take effect immediately (no confirmation)
