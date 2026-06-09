# Interaction Physics Reference

Hard rules for animation timing, spring vs easing decisions, exit patterns, and container measurement. Companion to `animation-patterns.md` which covers broader patterns and taste.

---

## The 300ms Ceiling (Doherty Threshold)

**User-initiated animations must not exceed 300ms.** Beyond this, the interaction feels laggy.

| Interaction Type       | Max Duration | Typical   |
| ---------------------- | ------------ | --------- |
| Button press/toggle    | 150ms        | 100ms     |
| Hover state change     | 150ms        | 100-150ms |
| Menu open/close        | 200ms        | 150ms     |
| Modal entrance         | 250ms        | 200ms     |
| Page transition        | 300ms        | 250ms     |
| Staggered list (total) | 500ms        | 300-400ms |

**Shorten duration before adjusting the curve.** If an animation feels slow, reduce the duration first. Only then tweak the easing. A fast animation with basic easing beats a slow animation with perfect easing.

---

## Spring vs Easing: The Decision

This is not a preference — it's a physics decision based on the type of motion.

### Use Springs For:

- **Gesture-driven motion** (drag, swipe, flick, pinch)
- **Interruptible animations** (user can change direction mid-motion)
- **Variable-distance movements** (same spring, different distances)
- **Physics-simulated motion** (bouncing, settling)

Springs preserve velocity when interrupted. If a user flicks a card right then immediately flicks left, the spring naturally decelerates and reverses. Easing can't do this — it would snap to the new target.

```tsx
// Spring for gesture — preserves momentum
<motion.div
  drag="x"
  transition={{ type: "spring", stiffness: 300, damping: 25 }}
/>
```

**Balanced spring parameters:**

| Feel     | Stiffness | Damping | Use Case                |
| -------- | --------- | ------- | ----------------------- |
| Snappy   | 400       | 25-30   | UI responses, menus     |
| Balanced | 300       | 20-25   | General purpose         |
| Gentle   | 200       | 20      | Subtle movements        |
| Bouncy   | 300       | 10      | Playful (use sparingly) |

### Use Easing For:

- **System state changes** (not user-initiated — notifications, status changes)
- **Fixed-timing sequences** (coordinated multi-element choreography)
- **Opacity/color transitions** (no physics analogue)
- **Predictable timing needed** (synchronized with audio, video)

```css
/* Easing for system state change */
.notification-enter {
  transition: transform 200ms cubic-bezier(0, 0, 0.2, 1); /* ease-out */
}
```

### Direction-Specific Easing

| Direction                    | Easing                 | Why                                             |
| ---------------------------- | ---------------------- | ----------------------------------------------- |
| **Entering** (appearing)     | `ease-out`             | Arrives fast, settles gently — feels responsive |
| **Exiting** (disappearing)   | `ease-in`              | Accelerates away — gets out of the way          |
| **Moving** (staying visible) | `ease-in-out`          | Smooth start and end                            |
| **Linear**                   | Only for progress bars | No physical object moves at constant speed      |

**Never use linear easing for object motion.** It looks mechanical and unnatural. The only valid use is progress indicators where the rate should appear constant.

---

## Exit Animation Rules

### AnimatePresence is Required

Conditional elements **must** be wrapped in `<AnimatePresence>` for exit animations to fire. Without it, React removes the DOM node before the animation can play.

```tsx
// CORRECT — exit animation fires
<AnimatePresence>
  {isVisible && (
    <motion.div
      key="panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )}
</AnimatePresence>;

// WRONG — instantly removed, no exit animation
{
  isVisible && (
    <motion.div exit={{ opacity: 0 }} /> // exit never fires
  );
}
```

### Exit Must Have a Unique Key

Every element inside `AnimatePresence` needs a unique `key`. Without it, React can't distinguish entering from exiting elements, causing animation conflicts.

### Exit Should Mirror Entrance

The exit state should reverse the entrance. If something slides in from left, it should slide out to left. If it fades and scales up, it should fade and scale down.

```tsx
// Symmetric entrance/exit
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: 10 }}  // exits downward, slightly less travel
```

### Exit Duration = 75% of Entrance

Exits should be faster than entrances. Users have already seen the element — they don't need a slow goodbye.

### Disable Interactions During Exit

An exiting element should not be interactive. Disable pointer events and remove from tab order during exit animations.

```tsx
<motion.div exit={{ opacity: 0, pointerEvents: "none" }} />
```

---

## Container Animation: The Two-Div Pattern

**Never measure and animate the same element.** This creates a circular dependency: ResizeObserver fires → animation updates size → ResizeObserver fires again → infinite loop.

### The Pattern

```tsx
// Outer div: receives animated dimensions
<motion.div animate={{ height: measuredHeight }} style={{ overflow: "hidden" }}>
  {/* Inner div: measured by ResizeObserver */}
  <div ref={measureRef}>{children}</div>
</motion.div>
```

### Rules

1. **Outer animated div** — receives the animation values (`height`, `width`)
2. **Inner measured div** — contains the `ResizeObserver` ref, reports actual content size
3. **`overflow: hidden`** on the outer div — clips content during animation
4. **Guard against zero** — initial measurement may be `0` before content renders; don't animate from zero
5. **Use callback refs** — for reliable measurement attachment

```tsx
function AnimatedContainer({ children }) {
  const [height, setHeight] = useState<number | "auto">("auto");
  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      animate={{ height }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{ overflow: "hidden" }}
    >
      <div ref={measureRef}>{children}</div>
    </motion.div>
  );
}
```

### Don't Overuse ResizeObserver

- Only attach to elements that actually change size
- Disconnect observers on unmount
- Debounce if you're seeing excessive callbacks
- Use `transition-delay` on the outer div to let measurement settle before animating

---

## Velocity-Based Gesture Thresholds

When implementing drag-to-dismiss, swipe actions, or flick gestures, use **velocity** (not just distance) to detect intent:

```tsx
onDragEnd={(_, info) => {
  const velocity = Math.abs(info.velocity.x);
  const offset = Math.abs(info.offset.x);

  // Fast flick OR long drag = dismiss
  const shouldDismiss = velocity > 500 || offset > 100;
}}
```

| Threshold            | Value            | Purpose                       |
| -------------------- | ---------------- | ----------------------------- |
| Quick flick velocity | 500px/s          | Detects intentional swipe     |
| Slow drag distance   | 100px            | Fallback for deliberate drags |
| Vertical swipe-down  | 300px/s or 150px | Dismiss bottom sheet          |

**Why velocity matters:** A user who quickly flicks a card 30px clearly wants to dismiss it. A user who slowly drags 30px and releases probably doesn't. Distance alone can't distinguish intent.

---

## Quick Reference

```
HARD RULES
  Max UI animation:       300ms (Doherty Threshold)
  Exit duration:          75% of entrance
  Linear easing:          ONLY for progress bars
  Bounce/elastic:         Avoid (feels dated)

SPRING vs EASING
  Gesture/drag/swipe:     Spring (preserves velocity)
  System state change:    Easing (predictable timing)
  Opacity/color:          Easing (no physics needed)
  Interactive element:    Spring (interruptible)

ENTER/EXIT
  Entering:               ease-out (fast start, gentle settle)
  Exiting:                ease-in (accelerate away)
  AnimatePresence:        REQUIRED for exit animations
  Unique key:             REQUIRED per animated element

CONTAINER
  Measure + animate:      Two separate divs (NEVER same element)
  Outer div:              Animated, overflow hidden
  Inner div:              Measured by ResizeObserver

GESTURE DETECTION
  Flick threshold:        500px/s velocity
  Drag threshold:         100px offset
  Use velocity + offset:  Either triggers action
```
