# Interface: Animation

Source references:
- Vercel Web Interface Guidelines: https://vercel.com/design/guidelines
- Rauno Freiberg: https://interfaces.rauno.me/

## Principles

- MUST: Honor `prefers-reduced-motion` (provide reduced variant)
- SHOULD: Prefer CSS for simple transitions; use `motion/react` when JS animation is required
- MUST: Animate compositor-friendly props (`transform`, `opacity`); avoid layout/repaint props (`top/left/width/height`)
- SHOULD: Animate only to clarify cause/effect or add deliberate delight
- SHOULD: Add animation only when explicitly requested or clearly purposeful—avoid decorative motion
- SHOULD: Choose easing to match the change (size/distance/trigger)
- MUST: Animations are interruptible and input-driven (avoid autoplay)
- MUST: Correct `transform-origin` (motion starts where it "physically" should)

## Duration & Timing

- SHOULD: Keep animation duration under 200ms for immediacy
- SHOULD: Skip animations entirely for frequent, low-novelty interactions (right-click menus, list reorders)
- MUST: Avoid transitions when switching themes (flash of intermediate state)

## Scale Values

Use consistent scale transforms:

| Element | Scale on press/hide |
|---------|---------------------|
| Dialogs, modals | `0.95`–`0.98` + opacity |
| Buttons | `0.96`–`0.98` |
| Cards, list items | `0.98`–`0.99` |
| Tooltips, popovers | `0.95` + opacity |

```css
.dialog[data-state="closed"] {
  opacity: 0;
  transform: scale(0.96);
}
```

## Performance

- MUST: Pause looping animations when off-screen (use Intersection Observer)
- SHOULD: Use `scroll-behavior: smooth` with appropriate `scroll-margin-top` for anchor navigation

```css
html {
  scroll-behavior: smooth;
}

[id] {
  scroll-margin-top: 80px; /* Account for fixed header */
}
```
