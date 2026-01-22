# Interface: Interactions

## Keyboard
- MUST: Full keyboard support per WAI-ARIA APG patterns
  - https://www.w3.org/WAI/ARIA/apg/patterns/
- MUST: Visible focus rings (`:focus-visible`; group with `:focus-within`)
- MUST: Manage focus (trap, move, and return) per APG patterns

## Targets & Input
- MUST: Hit target ≥24px (mobile ≥44px). If visual <24px, expand hit area
- MUST: Mobile `<input>` font-size ≥16px to avoid zoom-on-focus
- MUST: Set viewport meta for app-like consistency (locks zoom):

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
```

- MUST: `touch-action: manipulation` to prevent double-tap zoom; set `-webkit-tap-highlight-color` to match design

## State & Navigation
- MUST: URL reflects state (deep-link filters/tabs/pagination/expanded panels). Prefer libs like https://nuqs.dev
- MUST: Back/Forward restores scroll
- MUST: Links are links—use `<a>/<Link>` for navigation (support Cmd/Ctrl/middle-click)

## Feedback
- SHOULD: Optimistic UI; reconcile on response; on failure show error and rollback or offer Undo
- MUST: Use `AlertDialog` (not `Dialog`) for destructive/irreversible actions; alternatively provide Undo window
- MUST: Use polite `aria-live` for toasts/inline validation
- SHOULD: Ellipsis (`…`) for options that open follow-ups (e.g., "Rename…") and loading states (e.g., "Loading…", "Saving…", "Generating…")

## Touch/Drag/Scroll

- MUST: Design forgiving interactions (generous targets, clear affordances; avoid finickiness)
- MUST: Delay first tooltip in a group; subsequent peers no delay
- MUST: Intentional `overscroll-behavior: contain` in modals/drawers
- MUST: During drag, disable text selection and set `inert` on dragged element/containers
- MUST: No "dead-looking" interactive zones—if it looks clickable, it is
- SHOULD: Hide hover states on touch devices:

```css
@media (hover: hover) {
  .button:hover {
    background: var(--hover-bg);
  }
}
```

- MUST: Replace default tap highlight with custom style:

```css
* {
  -webkit-tap-highlight-color: transparent;
}
```

## Menus & Dropdowns

- SHOULD: Trigger dropdown menus on `mousedown`, not `click` (feels more responsive)
- SHOULD: Use "prediction cone" pattern for nested menus (delay close when moving toward submenu)
- MUST: Eliminate dead zones between list items—increase padding instead of margins

## Interactive Elements

- SHOULD: Apply `user-select: none` to interactive element text (buttons, tabs)
- MUST: Apply `pointer-events: none` on decorative elements (glows, gradients, overlays)
- SHOULD: Toggles take immediate effect without confirmation dialogs
