# Interface: Performance

## Principles

- SHOULD: Test iOS Low Power Mode and macOS Safari
- MUST: Measure reliably (disable extensions that skew runtime)
- MUST: Track and minimize re-renders (React DevTools/React Scan)
- MUST: Profile with CPU/network throttling
- MUST: Batch layout reads/writes; avoid unnecessary reflows/repaints
- MUST: Mutations (`POST/PATCH/DELETE`) target <500 ms
- SHOULD: Prefer uncontrolled inputs; make controlled loops cheap (keystroke cost)
- MUST: Virtualize large lists (e.g., TanStack Virtual or `virtua`)
- MUST: Preload only above-the-fold images; lazy-load the rest
- MUST: Prevent CLS from images (explicit dimensions or reserved space)

## CSS Performance

- SHOULD: Avoid large `blur()` values on filters/backdrops (GPU-heavy)
- SHOULD: Replace blurred rectangles with radial gradients when possible (avoids banding)
- SHOULD: Use `transform: translateZ(0)` sparingly for GPU layer promotion
- SHOULD: Toggle `will-change` only during unperformant scroll animations, then remove

```css
/* Only during scroll */
.scrolling .heavy-element {
  will-change: transform;
}
```

## Video & Media

- MUST: Pause/unmount off-screen videos (especially on iOS)
- MUST: Use `muted` and `playsinline` for iOS autoplay:

```html
<video autoplay loop muted playsinline>
  <source src="video.mp4" type="video/mp4">
</video>
```

## React-Specific

- SHOULD: Use refs for real-time DOM updates that bypass render cycles (e.g., mouse position, scroll)
- SHOULD: Detect and adapt to user device capabilities and network conditions
