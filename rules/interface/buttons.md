# Interface: Buttons

Buttons define action hierarchy. Treat them as deliberate system primitives, not one-off decorations.

## Sizing

- MUST: Provide at least three control heights across the system: compact, default, and prominent.
- SHOULD: Use `min-h-11` or larger for primary actions on touch surfaces.
- MUST: Hit targets reach 44px minimum in both axes.
- SHOULD: Use horizontal padding that matches the control height (`px-3` / `px-4` / `px-5`), not oversized pill padding by default.
- MUST: Keep button labels on one line unless the layout explicitly supports wrapped CTAs.

## Hierarchy

- MUST: One primary button per view or action cluster.
- MUST: Secondary actions read quieter than the primary through contrast, fill, and weight.
- MUST: Destructive buttons use destructive semantics and a confirmation step when the action cannot be undone.
- SHOULD: Tertiary actions use ghost or text treatments only when a stronger button would add visual noise.
- MUST NOT: Present multiple visually primary buttons in the same cluster.

## Typography

- MUST: Use `font-medium` or `font-semibold`; avoid `font-bold`.
- SHOULD: Keep labels short and action-oriented.
- MUST: Use `tabular-nums` when labels contain counts or changing numbers.

## Focus And Interaction

- MUST: Visible focus ring on every interactive button state.
- MUST: Preserve contrast in hover, active, disabled, and loading states.
- MUST: Show loading without shrinking or relabeling the button.
- SHOULD: Use precise transitions (`transition-colors`, `transition-shadow`, `transition-transform`) instead of `transition-all`.
- MUST: Gate hover-only affordances behind hover-capable input.

## Shape And Surface

- SHOULD: Keep radius modest by default; large pill buttons need a product-level reason.
- MUST: Button shadows, if any, be functional and subtle.
- MUST NOT: Fake hierarchy with gradients when contrast and spacing should carry the structure.

## Accessibility

- MUST: Icon-only buttons have `aria-label`.
- MUST: Disabled buttons still communicate why the action is unavailable when context requires it.
- SHOULD: Pair destructive buttons with reinforcing copy, not color alone.

## Review Questions

- Is the primary action unmistakable?
- Are adjacent buttons clearly ordered by importance?
- Would the button still feel intentional in keyboard-only and touch-only use?
