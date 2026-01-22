# Interface: Animation

## Core Rules

- MUST: Honor `prefers-reduced-motion`
- MUST: Animate only `transform` and `opacity`
- MUST: Every animation answers "why does this exist?"
- MUST: Correct `transform-origin` for element's entry point
- SHOULD: CSS for simple transitions; `motion/react` when JS control needed
- NEVER: Animate for "delight" without function

## Easing Decision

| Context | Easing | Curve |
|---------|--------|-------|
| Entering/appearing | `ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` |
| Exiting/disappearing | `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` |
| Moving while visible | `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Color/opacity only | `linear` | — |
| Interactive/gesture | `spring` | See presets below |

- NEVER: Use `ease-in` for enter animations

### Easing Variables

```css
--ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-out-cubic: cubic-bezier(0.215, 0.61, 0.355, 1);
--ease-out-quart: cubic-bezier(0.165, 0.84, 0.44, 1);
--ease-out-quint: cubic-bezier(0.23, 1, 0.32, 1);
--ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);

--ease-in-out-quad: cubic-bezier(0.455, 0.03, 0.515, 0.955);
--ease-in-out-cubic: cubic-bezier(0.645, 0.045, 0.355, 1);
--ease-in-out-quart: cubic-bezier(0.77, 0, 0.175, 1);
```

Order: quad → cubic → quart → quint → expo (subtle → dramatic)

## Duration

| Element | Duration |
|---------|----------|
| Micro (hover, click) | 100–150ms |
| Small (tooltip, dropdown) | 150–200ms |
| Medium (modal, panel) | 200–300ms |
| Large (page transition) | 300–400ms |

- SHOULD: Default to 200ms
- MUST: Skip animation if user triggers 100+ times/day
- MUST: Paired elements share identical duration and easing

## Spring Presets

```jsx
// Snappy (buttons, toggles)
{ type: "spring", stiffness: 400, damping: 25 }

// Gentle (subtle movement)
{ type: "spring", stiffness: 200, damping: 20 }

// Bouncy (use sparingly)
{ type: "spring", stiffness: 300, damping: 10 }
```

Use springs for: drag/drop, gestures, interruptible animations.
Use tweens for: fixed timing, opacity-only, <100ms.

## Scale Values

| Element | Scale |
|---------|-------|
| Modal/dialog | `0.95`–`0.98` |
| Button press | `0.97`–`0.98` |
| Card/list item | `0.98`–`0.99` |
| Tooltip | `0.95` |

- NEVER: Scale from `0` — minimum `0.95`

## Patterns

### Modal Entry
```jsx
initial={{ opacity: 0, y: 20, scale: 0.98 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, y: 10, scale: 0.98 }}
```

### Dropdown
```jsx
initial={{ opacity: 0, scale: 0.95, y: -8 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
transition={{ duration: 0.15, ease: "easeOut" }}
style={{ transformOrigin: "top" }}
```

### Staggered List
```jsx
const container = { visible: { transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } };
```

### AnimatePresence

| Mode | Use |
|------|-----|
| `sync` | Default, simultaneous enter/exit |
| `wait` | Exit completes before enter |
| `popLayout` | Exiting element pops from layout |

Use `popLayout` for lists with exit animations.

### Drag Dismiss
```jsx
onDragEnd={(_, info) => {
  if (info.velocity.x > 500 || Math.abs(info.offset.x) > 100) dismiss();
}}
```

## Theme Switching

- MUST: Disable transitions during theme change

```js
function setTheme(theme) {
  document.documentElement.classList.add('no-transitions');
  document.documentElement.setAttribute('data-theme', theme);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('no-transitions');
    });
  });
}
```

```css
.no-transitions, .no-transitions * { transition: none !important; }
```

## Reduced Motion

- MUST: Provide reduced-motion fallback for every animation
- SHOULD: Use opacity fade as fallback

```jsx
const shouldReduce = useReducedMotion();
<motion.div animate={{ opacity: 1, y: shouldReduce ? 0 : 20 }} />
```

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Buttons feel dead | `active:scale-[0.97]` |
| Element appears from nowhere | Start at `scale(0.95)`, not `0` |
| Jittery/shaky animation | Add `will-change: transform` |
| Hover causes flicker | Animate child, not parent |
| Popover scales from wrong point | Set `transform-origin` to trigger location |
| Sequential tooltips feel slow | Skip delay after first (warm state) |
| Touch targets too small | 44px minimum via pseudo-element |
| Something still feels off | Subtle blur (<20px) can mask issues |
| Hover fires on mobile | `@media (hover: hover) and (pointer: fine)` |

## Performance

- MUST: Animate only `transform`, `opacity`
- MUST: Pause looping animations when off-screen
- NEVER: Animate `width`, `height`, `top`, `left`, `margin`, `padding`

| Don't | Do |
|-------|-----|
| `width` | `scaleX` |
| `height` | `scaleY` |
| `top`/`left` | `translate` |

### Performance Tiers

| Tier | Techniques | Thread |
|------|------------|--------|
| **S** | `transform`, `opacity`, `filter`, `clip-path` via CSS/WAAPI/Motion | Compositor |
| **A** | Same values via rAF/GSAP on layered elements | Main |
| **B** | FLIP/layout animations (setup + S/A) | Main → Compositor |
| **C** | `background-color`, CSS variables, SVG `d` | Paint |
| **D** | `width`, `height`, `margin`, layout | Full pipeline |
| **F** | Style/layout thrashing | Avoid completely |

- MUST: Prefer `motion/react` (uses WAAPI) — S-Tier, smooth under main thread load
- SHOULD: Avoid rAF-based libraries (GSAP, anime.js) — A-Tier, vulnerable to jank

### CSS Variables Warning

- NEVER: Animate CSS variables for `transform`/`opacity` — always triggers paint (C-Tier)
- NEVER: Animate global CSS variables — inheritance triggers style recalc on ALL descendants (F-Tier)

```css
/* F-Tier: Inheritance bomb */
html { --progress: 0; }
.box { transform: translateY(calc(var(--progress) * 100px)); }

/* Safe: Disable inheritance */
@property --progress {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}
```

If you must use CSS variables, use `@property { inherits: false }` to prevent cascade.
