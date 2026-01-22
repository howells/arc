# Animation Patterns Reference

Deep patterns and decision frameworks for web animation. Companion to `rules/interface/animation.md`.

Source: animations.dev by Emil Kowalski

## The Three Pillars

Great animations are:

1. **Natural** — Mirror real-world physics. Objects accelerate and decelerate; they don't move at constant speeds.
2. **Purposeful** — Clear reason to exist. If you can't articulate why, don't animate.
3. **Tasteful** — Refined judgment developed through deliberate practice.

> "An animation feels right when you are not surprised by it, because it feels familiar."

## The Purpose Test

Before adding animation, ask:

1. What does this animation communicate?
2. Would the user miss it if gone?
3. How often will they see it?
4. Does it help or hinder their goal?

**If you can't answer clearly → don't animate.**

### When TO Animate

- State changes (help users understand what changed)
- Spatial relationships (show where something came from/went)
- Feedback (confirm an action was received)
- Attention (draw focus to important changes)
- Continuity (maintain context during transitions)

### When NOT TO Animate

- Everything
- High-frequency actions (50+ times/day)
- For "delight" without function
- Critical paths where speed matters
- Without clear communicative purpose

## Easing Deep Dive

Easing describes the rate of change over time. It can make a bad animation great, and a great animation bad.

### Perceived Performance

Same duration (300ms) feels faster with ease-out than ease-in. The perception of speed is often more important than actual performance.

### Custom Cubic Bezier

```css
/* Standard curves */
ease-out:    cubic-bezier(0, 0, 0.2, 1)
ease-in:     cubic-bezier(0.4, 0, 1, 1)
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)

/* More dramatic */
ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1)
ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1)
```

### The Easing Decision Tree

```
Is something entering the screen?
  → Yes: ease-out (fast start, responsive)

Is something leaving the screen?
  → Yes: ease-in (slow start, accelerates away)

Is something moving while staying visible?
  → Yes: ease-in-out or spring

Is it just color or opacity?
  → Yes: linear (no movement involved)

Is it interactive (drag, gesture, button)?
  → Yes: spring (alive, interruptible)
```

## Spring Physics

### Why Springs Feel Better

CSS easings require fixed duration, but movement in the real world doesn't have fixed duration. Springs are based on physics of an object attached to a spring:

- Feel natural by definition
- No fixed duration (settle when physics dictates)
- More fluid
- Handle interruption gracefully

### Parameter Mental Models

**Traditional (stiffness/damping/mass):**

| Parameter | Effect |
|-----------|--------|
| Stiffness | How tight the spring — higher = snappier |
| Damping | How quickly oscillation stops — higher = less bounce |
| Mass | Weight of object — higher = slower, more momentum |

**Apple-style (duration/bounce):**

| Parameter | Effect |
|-----------|--------|
| Duration | Approximate length of animation |
| Bounce | Amount of overshoot (0 = none) |

### Spring Presets Library

```jsx
// Default / General purpose
{ type: "spring", stiffness: 300, damping: 20 }

// Snappy / UI responses
{ type: "spring", stiffness: 400, damping: 25 }

// Gentle / Subtle movements
{ type: "spring", stiffness: 200, damping: 20 }

// Bouncy / Playful (use sparingly)
{ type: "spring", stiffness: 300, damping: 10 }

// Apple-style
{ type: "spring", duration: 0.4, bounce: 0.2 }
{ type: "spring", duration: 0.5, bounce: 0.25 } // More bounce
```

### Spring vs Tween Decision

| Use Spring When | Use Tween When |
|-----------------|----------------|
| Responding to user input | Fixed timing required (video sync) |
| Drag and drop | Opacity-only changes |
| Gestures | Very short animations (<100ms) |
| May be interrupted | Orchestrated sequences |
| Variable distance movements | Predictable timing needed |

## Orchestration Patterns

### Staggered Reveals

One well-orchestrated animation beats scattered micro-interactions.

```jsx
// Container controls timing
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,    // Delay between each child
      delayChildren: 0.1        // Initial delay before first child
    }
  }
};

// Each child animates the same way
const item = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

<motion.ul variants={container} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.li key={item.id} variants={item} />
  ))}
</motion.ul>
```

**Stagger timing guidelines:**
- Lists: `0.03–0.05s`
- Cards/larger items: `0.05–0.08s`
- Hero sections: `0.1–0.15s`

### Crossfade Pattern

More polished than sequential show/hide:

```jsx
<AnimatePresence mode="wait">
  {activeView === "a" ? (
    <motion.div
      key="a"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  ) : (
    <motion.div
      key="b"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )}
</AnimatePresence>
```

### Toast/Notification Stacking (Sonner Pattern)

```jsx
// Stack effect: each toast scales slightly smaller
const getScale = (index) => 1 - (index * 0.05);
const getY = (index) => index * -10;

<motion.div
  style={{
    scale: getScale(index),
    y: getY(index),
    zIndex: toasts.length - index
  }}
/>
```

## Component Patterns

### Button Press

```jsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Click me
</motion.button>
```

### Modal/Dialog Entry

```jsx
// Backdrop
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="backdrop"
/>

// Dialog
<motion.div
  initial={{ opacity: 0, scale: 0.95, y: 20 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.95, y: 10 }}
  transition={{ type: "spring", damping: 25, stiffness: 300 }}
  className="dialog"
/>
```

### Dropdown Menu

```jsx
<motion.div
  initial={{ opacity: 0, scale: 0.95, y: -10 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.95, y: -10 }}
  transition={{ duration: 0.15, ease: "easeOut" }}
  style={{ transformOrigin: "top" }}
/>
```

### Tooltip

```jsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.1, ease: "easeOut" }}
/>
```

### Expandable Card

```jsx
<motion.div layout>
  <motion.h3 layout="position">Title</motion.h3>
  <AnimatePresence>
    {isExpanded && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
      >
        Content
      </motion.div>
    )}
  </AnimatePresence>
</motion.div>
```

## High-Performance Patterns

### useMotionValue for Gestures

Updates outside React render cycle — essential for smooth 60fps:

```jsx
import { useMotionValue, useSpring, useTransform } from "framer-motion";

function DraggableCard() {
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  return (
    <motion.div
      drag="x"
      style={{ x: springX, rotate, opacity }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 100) {
          // Dismissed
        }
      }}
    />
  );
}
```

### Cursor Following

```jsx
function CursorFollower() {
  const x = useSpring(0, { stiffness: 300, damping: 30 });
  const y = useSpring(0, { stiffness: 300, damping: 30 });

  useEffect(() => {
    const handleMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return <motion.div style={{ x, y }} className="cursor" />;
}
```

## CSS Animation Patterns

### CSS Transforms Reference

```css
/* Position */
transform: translateX(100px);
transform: translateY(50%);    /* Percentage = element's own size */
transform: translate3d(x, y, z);

/* Scale */
transform: scale(1.1);
transform: scaleX(0.9);

/* Rotation */
transform: rotate(45deg);
transform: rotateX(180deg);    /* 3D flip */
transform: rotateY(180deg);

/* Combine */
transform: translateY(-10px) scale(0.98);
```

### Transition vs Keyframe Decision

| Use Transitions When | Use Keyframes When |
|---------------------|-------------------|
| A → B state change | Multi-step sequence |
| Hover/focus/active | Looping animations |
| Simple enter/exit | Complex choreography |
| Need retargeting | Specific timing control |

**Key insight:** Transitions can be retargeted mid-animation (like springs). Keyframes run to completion.

### CSS Timing Tokens

```css
:root {
  --duration-instant: 50ms;
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;

  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Developing Taste

Animation taste is refined judgment — developed through deliberate practice, not innate talent.

### How to Build It

1. **Collect References** — Save animations you admire (apps, websites, motion design)
2. **Analyze** — For each: What makes it feel good? Timing? Easing? What would make it worse?
3. **Recreate** — Match animations you admire. The gap between attempt and original teaches you.
4. **Get Feedback** — Fresh eyes catch what you've become blind to.
5. **Iterate** — Small adjustments compound. Tweak timing, easing, distance. Feel the difference.

### The Taste Test

> "Would I notice this animation after using the product for a week?"
>
> If yes → probably too much
> If no → probably right

### Warning Signs of Poor Taste

- Animations for "delight" without function
- Bouncy/playful when context is serious
- Slow animations for frequent actions
- Inconsistent timing across similar elements
- Motion that draws attention to itself

## Tool Selection

### CSS vs Framer Motion

| Choose CSS When | Choose Framer Motion When |
|-----------------|--------------------------|
| Simple hover/focus states | Exit animations needed |
| No JS required | Layout animations |
| Bundle size critical | Gesture-driven motion |
| Static state transitions | Orchestrated sequences |
| Performance-critical loops | Spring physics |
| Server components | Shared element transitions |

### Library Landscape

| Library | Best For |
|---------|----------|
| CSS Transitions | Simple state changes |
| CSS Keyframes | Looping, multi-step |
| Framer Motion | React, full-featured |
| motion/react | Lightweight Framer alternative |
| React Spring | Complex physics |
| GSAP | Timeline-based, legacy |
| Web Animation API | Native, performant |

## Accessibility Patterns

### Reduced Motion Implementation

```jsx
// Component-level
import { useReducedMotion, MotionConfig } from "framer-motion";

function App() {
  const shouldReduce = useReducedMotion();

  return (
    <MotionConfig reducedMotion={shouldReduce ? "always" : "never"}>
      {children}
    </MotionConfig>
  );
}
```

### Reduced Motion Fallbacks

Instead of removing animation entirely, simplify:

| Full Motion | Reduced Motion |
|-------------|----------------|
| Slide + fade | Fade only |
| Spring bounce | Quick ease-out |
| Parallax scroll | Static |
| Auto-playing | User-triggered |

## Quick Reference Card

```
ENTERING       → ease-out (fast start)
LEAVING        → ease-in (accelerate away)
MOVING         → ease-in-out or spring
INTERACTIVE    → spring
COLOR/OPACITY  → linear

DURATION
Micro          → 100-200ms
Small UI       → 150-300ms
Medium         → 200-400ms
Large          → 300-500ms
DEFAULT        → 200ms

SPRING PRESETS
Snappy         → { stiffness: 400, damping: 25 }
Gentle         → { stiffness: 200, damping: 20 }
Bouncy         → { stiffness: 300, damping: 10 }

THE PURPOSE TEST
"Why does this animation exist?"
If no clear answer → don't animate.

PERFORMANCE
CHEAP (GPU):     transform, opacity
EXPENSIVE:       width, height, top, left, margin, padding
```
