# UX Laws Reference

Psychology-based principles for interface design. Use these as review criteria and design constraints.

---

## Fitts's Law

**The time to acquire a target is a function of its size and distance.**

- Larger targets are faster to click/tap
- Closer targets are faster to reach
- Edge and corner targets are effectively infinite size (screen boundaries act as walls)

**Application:**

- Primary actions should be large and prominent
- Destructive actions should be small and distant from primary actions
- Place frequent actions near the user's current focus
- Use full-width buttons on mobile for easy thumb reach
- Place navigation at screen edges (infinite target area)

**Common violations:**

- Tiny icon-only buttons for primary actions
- Important actions buried in overflow menus
- Equal-sized buttons for "Save" and "Cancel"

---

## Hick's Law

**Decision time increases logarithmically with the number of options.**

`RT = a + b × log₂(n)`

- Every additional option adds cognitive load
- This applies to menus, settings, form fields, navigation items

**Application:**

- Limit primary navigation to 5–7 items
- Break complex forms into multi-step wizards
- Use progressive disclosure — show only what's needed now
- Highlight recommended options to short-circuit decisions
- Group related options to reduce perceived count

**Common violations:**

- Settings page with 30+ ungrouped toggles
- Dropdown with 50 flat options (use search or categories)
- Modal with 5+ action buttons

---

## Doherty Threshold

**Productivity soars when response time is under 400ms.**

| Latency    | Perception                                     |
| ---------- | ---------------------------------------------- |
| < 100ms    | Instant — no feedback needed                   |
| 100–300ms  | Slight delay — show state change immediately   |
| 300–1000ms | Noticeable — show loading indicator            |
| > 1000ms   | Disruptive — show progress, allow cancellation |

**Application:**

- User-initiated animations must complete within 300ms
- Optimistic UI for mutations (show result before server confirms)
- Skeleton loading for content fetches > 300ms
- Progress bars for operations > 1000ms
- Never block the UI without feedback

**The 300ms ceiling:** All micro-interactions (button press, toggle, menu open) should complete within 300ms. Beyond this, the user perceives lag.

---

## Gestalt Principles

How humans perceive visual grouping:

### Proximity

Elements close together are perceived as related. **This is the most powerful grouping tool.**

```
Bad:  [Header]     ← equal spacing
      [Content]    ← equal spacing
      [Footer]

Good: [Header]
      [Content]    ← tight spacing (grouped)

                   ← large spacing (separated)
      [Footer]
```

### Similarity

Elements that look alike are perceived as related.

- Consistent styling for same-function elements
- Different styling signals different function
- Color, size, shape, and weight all contribute

### Continuation

The eye follows smooth lines and curves.

- Align elements along clear axes
- Consistent left edges in forms
- Visual flow guides reading order

### Closure

The mind completes incomplete shapes.

- Icons don't need every detail — suggestion works
- Card shadows imply boundaries without full borders
- Progress indicators work because we mentally complete the circle

### Common Region

Elements within a shared boundary are perceived as grouped.

- Cards, containers, and backgrounds create groups
- Use background color differences instead of borders when possible
- Nested containers create hierarchy of grouping

### Figure/Ground

We separate foreground from background instinctively.

- Modal overlays use this (dark backdrop = ground, modal = figure)
- Shadows lift elements from the page
- Contrast determines which layer feels "in front"

---

## Jakob's Law

**Users spend most of their time on other sites. They prefer your site to work like sites they already know.**

- Follow platform conventions (don't reinvent navigation)
- Use standard icons for standard actions (gear = settings, pencil = edit)
- Place navigation where users expect it
- Form patterns should match what users encounter elsewhere

**Exception:** When you have a genuinely better pattern AND can teach it quickly. But the bar is very high.

---

## Progressive Disclosure

**Show only what's needed at each step. Reveal complexity as it becomes relevant.**

Levels:

1. **Default view** — essential information and primary actions
2. **On demand** — secondary info behind expandable sections, "Show more", or hover
3. **Deep dive** — advanced settings, detailed data behind dedicated pages

**Application:**

- Forms: show required fields first, optional behind "More options"
- Settings: group by frequency of use, hide advanced
- Tables: show key columns, let users add more
- Error messages: show summary, expandable details for debugging

---

## Cognitive Load

**Working memory holds ~4 items. Minimize what users must hold in their heads.**

Three types:

1. **Intrinsic** — complexity inherent to the task (can't reduce)
2. **Extraneous** — caused by poor design (eliminate this)
3. **Germane** — effort spent learning/understanding (support this)

**Reduce extraneous load:**

- Don't make users remember information between steps
- Show context inline (don't make them navigate to find it)
- Use recognition over recall (dropdowns > text input for known options)
- Chunk information into digestible groups
- Remove unnecessary visual noise

---

## Von Restorff Effect (Isolation Effect)

**An item that stands out from its peers is more memorable.**

- Use for CTAs: one bold button among subtle ones
- Use for errors: red among neutral colors
- Use for new features: badges, highlights
- **Don't overuse:** If everything is highlighted, nothing is

---

## Peak-End Rule

**People judge experiences primarily by their peak moment and ending.**

- Invest design effort in the completion moment (success state, confirmation)
- Make onboarding's first win feel great
- Error recovery should end on a positive note ("You're all set now")
- Exit flows matter: cancellation and sign-out should be graceful

---

## Miller's Law

**The average person can hold ~7 (±2) items in working memory.**

- Chunk phone numbers: `(555) 123-4567` not `5551234567`
- Group navigation into categories
- Limit tabs/segments to 5–7
- Use pagination or infinite scroll for long lists

---

## Aesthetic-Usability Effect

**Users perceive aesthetically pleasing designs as more usable.**

- Beautiful interfaces get more patience for issues
- Polish communicates competence
- But beauty can't substitute for actual usability
- A beautiful but broken interface is worse than an ugly working one

---

## Postel's Law (Robustness Principle)

**Be liberal in what you accept, conservative in what you produce.**

- Accept varied date formats in inputs
- Trim whitespace from pasted values
- Don't reject input that can be reasonably interpreted
- Output consistently formatted, well-structured data
- Never block paste into fields

---

## Quick Reference: Which Law Applies When

| Design Decision                 | Primary Law                  |
| ------------------------------- | ---------------------------- |
| Button sizing and placement     | Fitts's Law                  |
| Number of menu items            | Hick's Law                   |
| Loading and feedback timing     | Doherty Threshold            |
| Visual grouping and spacing     | Gestalt (Proximity)          |
| Navigation patterns             | Jakob's Law                  |
| Form complexity                 | Progressive Disclosure       |
| Information density             | Cognitive Load, Miller's Law |
| CTA prominence                  | Von Restorff Effect          |
| Onboarding and completion flows | Peak-End Rule                |
| Input validation                | Postel's Law                 |
| Visual polish priority          | Aesthetic-Usability Effect   |
