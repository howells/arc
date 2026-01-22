# Interface: Animation

## Core Principles

- MUST: Honor `prefers-reduced-motion` (provide reduced variant)
- MUST: Animate compositor-friendly props only (`transform`, `opacity`)
- MUST: Every animation answers "Why does this exist?" — if no clear answer, don't animate
- MUST: Animations are interruptible and input-driven (avoid autoplay)
- MUST: Correct `transform-origin` (motion starts where it "physically" should)
- SHOULD: Prefer CSS for simple transitions; use `motion/react` when JS control is required
- SHOULD: Add animation only when explicitly requested or clearly purposeful
- NEVER: Animate for "delight" without function — users have goals, not expectations of entertainment

## Easing Selection

Easing is the most important part of any animation. Match easing to animation type:

| Animation Type | Easing | Why |
|----------------|--------|-----|
| **Entering** screen | `ease-out` | Fast start feels responsive |
| **Leaving** screen | `ease-in` | Slow start, accelerates away |
| **Moving** while visible | `ease-in-out` | Natural acceleration/deceleration |
| **Color/opacity** changes | `linear` | No movement, perceptually linear |
| **Interactive** elements | `spring` | Alive, responsive, interruptible |

- MUST: Use `ease-out` for user-initiated actions (dropdowns, modals, tooltips)
- MUST: Use `ease-in` only for exit animations
- SHOULD: Use springs for drag, gestures, and interactive elements
- NEVER: Use `ease-in` for entering animations (feels sluggish)

```css
/* Entering */
transition: transform 200ms ease-out;
transition: transform 200ms cubic-bezier(0, 0, 0.2, 1);

/* Moving */
transition: transform 300ms ease-in-out;
transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);

/* Exiting */
transition: opacity 200ms ease-in;
```

## Duration Guidelines

- SHOULD: Default to 200ms for most UI interactions
- SHOULD: Keep duration under 200ms for immediacy
- SHOULD: Skip animations for frequent, low-novelty interactions
- MUST: Avoid transitions when switching themes (flash of intermediate state)

| Animation Type | Duration |
|----------------|----------|
| Micro-interactions (hover, click) | 100–200ms |
| Small UI (dropdowns, tooltips) | 150–300ms |
| Medium (modals, panels) | 200–400ms |
| Large (page transitions) | 300–500ms |

**Frequency Rule:** The more often users see an animation, the shorter (or absent) it should be. A 200ms hover animation feels fine in a demo but becomes friction when triggered 50 times per day.

## Spring Animations

Springs feel more natural because real-world objects don't have fixed durations. Use for interactive, gesture-driven, or interruptible animations.

### Presets

```jsx
// Snappy (buttons, UI responses)
{ type: "spring", stiffness: 400, damping: 25 }

// Gentle (subtle movements)
{ type: "spring", stiffness: 200, damping: 20 }

// Bouncy (playful, use sparingly)
{ type: "spring", stiffness: 300, damping: 10 }

// Apple-style (duration/bounce model)
{ type: "spring", duration: 0.4, bounce: 0.2 }
```

### When to Use Springs

- SHOULD: Use springs for interactive elements (buttons, toggles, sliders)
- SHOULD: Use springs for drag and drop, pull-to-refresh, gestures
- SHOULD: Use springs when animations may be interrupted mid-flight
- SHOULD: Use tweens for fixed timing (video sync, staggered sequences)
- SHOULD: Use tweens for opacity-only or very short (<100ms) animations

## Scale Values

Use consistent scale transforms across the UI:

| Element | Scale on press/hide |
|---------|---------------------|
| Dialogs, modals | `0.95`–`0.98` + opacity |
| Buttons | `0.96`–`0.98` |
| Cards, list items | `0.98`–`0.99` |
| Tooltips, popovers | `0.95` + opacity |

```jsx
// Button press
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
transition={{ type: "spring", stiffness: 400, damping: 17 }}
```

- NEVER: Animate from `scale(0)` — always start from at least `0.95`
- SHOULD: Combine scale with opacity for enter/exit animations

## Common Patterns

### Fade + Slide Up (Modal Entry)

```jsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: 10 }}
transition={{ type: "spring", damping: 25, stiffness: 300 }}
```

### Dropdown

```jsx
initial={{ opacity: 0, scale: 0.95, y: -10 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: -10 }}
transition={{ duration: 0.15, ease: "easeOut" }}
```

### Staggered List

```jsx
const container = {
  visible: { transition: { staggerChildren: 0.03 } }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};
```

- SHOULD: Use `staggerChildren: 0.03–0.05` for list reveals
- SHOULD: Keep stagger delays short to avoid sluggishness

## Performance

- MUST: Animate only `transform` and `opacity` (GPU-composited)
- MUST: Pause looping animations when off-screen (Intersection Observer)
- NEVER: Animate `width`, `height`, `top`, `left`, `margin`, `padding` (trigger layout)
- SHOULD: Use `will-change: transform` sparingly for known animations
- SHOULD: Prefer CSS/WAAPI over JS for simple animations (hardware acceleration)

| Don't Animate | Animate Instead |
|---------------|-----------------|
| `width` | `scaleX` |
| `height` | `scaleY` |
| `top`/`left` | `translateX`/`translateY` |
| `margin` | `transform` + padding |

```css
/* Force GPU acceleration (use sparingly) */
.animated {
  will-change: transform;
  /* or */
  transform: translateZ(0);
}
```

## Accessibility

- MUST: Respect `prefers-reduced-motion` system preference
- MUST: Provide functional UI without animation (animation enhances, never gates)
- SHOULD: Use opacity fades as reduced-motion fallback (still conveys change)
- NEVER: Use flashing animations (especially >3Hz)

### Safe Properties (Reduced Motion)

- Opacity fades
- Small color changes
- Subtle scale (under 10%)

### Problematic (Require Caution)

- Large movements across screen
- Parallax effects
- Zoom animations
- Spinning/rotating elements

### Implementation

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

```jsx
import { useReducedMotion } from "framer-motion";

const shouldReduceMotion = useReducedMotion();

<motion.div
  animate={{ opacity: 1, y: shouldReduceMotion ? 0 : 20 }}
  transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
/>
```

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Delight trap | Bouncy animations everywhere without purpose | Ask "why does this exist?" |
| Over-animation | Too many things moving at once | Animate one thing at a time |
| Wrong easing | ease-in for entering feels sluggish | Match easing to animation type |
| Too slow | Demo-friendly timing becomes friction | Consider frequency of use |
| Inconsistent timing | Same elements at different speeds | Define timing tokens |
| Expensive properties | Animating width/height causes jank | Use transform/opacity only |

## Scroll Behavior

```css
html {
  scroll-behavior: smooth;
}

[id] {
  scroll-margin-top: 80px; /* Account for fixed header */
}
```

- SHOULD: Use `scroll-behavior: smooth` with appropriate `scroll-margin-top`
- SHOULD: Consider disabling smooth scroll for reduced-motion users
