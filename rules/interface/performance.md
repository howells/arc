# Interface: Performance

## Principles

- MUST: Profile with CPU/network throttling
- MUST: Measure reliably (disable extensions that skew runtime)
- MUST: Track re-renders (React DevTools/React Scan)
- MUST: Batch layout reads/writes — avoid reflows/repaints
- MUST: Mutations (`POST/PATCH/DELETE`) < 500ms
- MUST: Virtualize large lists (`@tanstack/react-virtual` or `virtua`)
- MUST: Preload above-fold images; lazy-load rest
- MUST: Prevent CLS (explicit image dimensions)
- SHOULD: Test iOS Low Power Mode and macOS Safari
- SHOULD: Prefer uncontrolled inputs; make controlled loops cheap

## CSS

- SHOULD: Avoid large `blur()` values (GPU-heavy)
- SHOULD: Replace blurred rectangles with radial gradients
- SHOULD: `transform: translateZ(0)` sparingly for GPU layer promotion
- SHOULD: Toggle `will-change` only during scroll, then remove

### Transitions

- NEVER: `transition: all` — causes accidental animations

```css
/* Bad */
.button { transition: all 200ms ease; }

/* Good */
.button { transition: background-color 200ms ease, transform 200ms ease; }
```

Or Tailwind: `transition-colors duration-200` instead of `transition-all`

### CSS Variables

- NEVER: Animate global CSS variables — triggers style recalc on ALL descendants (F-Tier)
- CSS variables ALWAYS trigger paint, even inside `opacity: var(--x)`
- If unavoidable, use `@property { inherits: false }` to prevent cascade

### Thrashing (F-Tier)

- NEVER: Interleave DOM reads and writes (read-write-read-write)
- MUST: Batch all reads, then all writes

```js
// Bad: Thrashing
element.style.width = "100px"
const width = element.offsetWidth // Forces layout
element.style.width = width * 2 + "px"

// Good: Batched
const width = element.offsetWidth // Read first
element.style.width = width * 2 + "px" // Then write
```

### Theme Switching

- MUST: Disable transitions during theme change (see `animation.md`)

## Video & Media

- MUST: Pause/unmount off-screen videos (especially iOS)
- MUST: `muted playsinline` for iOS autoplay:

```html
<video autoplay loop muted playsinline>
  <source src="video.mp4" type="video/mp4">
</video>
```

## React

- SHOULD: Refs for real-time DOM updates that bypass render (mouse position, scroll)
- SHOULD: Detect/adapt to device capabilities and network conditions

### Motion/Framer Motion

Motion uses WAAPI (S-Tier) for most animations. However, "independent transforms" (`x`, `y`, `rotate`, `scale`) use a main-thread approach (A-Tier).

```jsx
// S-Tier: WAAPI, compositor thread
<motion.div animate={{ transform: "translateX(100px)" }} />
<motion.div animate={{ opacity: 1 }} />

// A-Tier: Main thread (independent transforms)
<motion.div animate={{ x: 100 }} />
```

For performance-critical transforms, prefer string syntax to ensure WAAPI.
