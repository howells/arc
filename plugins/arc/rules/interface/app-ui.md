# Interface: App UI

**Quality bar:** Build app interfaces worthy of Linear, Vercel, or Notion. Functional, clear, refined — and distinctly *this product*, not a template.

## Intent First

Before any visual decisions, answer explicitly:

- **Who is this human?** Specific role and context, not "users"
- **What must they accomplish?** Specific verb — create, monitor, configure, analyze
- **What should this feel like?** Concrete descriptors, not clichés

If your answer is "it's common" or "it's clean" — you haven't chosen. You've defaulted.

## Product Domain Exploration

Every product exists in a world. Discover it before designing:

- **Domain vocabulary:** 5+ concepts, metaphors, or terms from the product's actual world (not its features)
- **Color world:** Colors that naturally exist in the physical version of this product space
- **Signature element:** One visual, structural, or interaction element unique to THIS product
- **Defaults to avoid:** Name 3 obvious choices for this interface type — to consciously avoid them

**Test:** Remove the product name from the design. Can someone identify what it's for?

## The Swap Test

For every visual choice, ask: if I substituted the alternative, would the design's meaning change?

- Same font as every other SaaS dashboard → defaulted
- Same sidebar layout as the last 5 projects → defaulted
- Same gray palette with blue accent → defaulted

If the swap wouldn't matter, the choice isn't a choice.

## Depth Strategy

Pick ONE approach and commit across the entire app:

| Strategy | Feel | When to use |
|----------|------|-------------|
| Borders only | Technical, precise | Developer tools, data-heavy apps |
| Subtle shadows | Approachable, soft | General SaaS, collaborative tools |
| Layered shadows | Premium, dimensional | Design tools, luxury products |

- NEVER: Mix strategies in the same interface
- NEVER: Dramatic elevation jumps between adjacent surfaces

## Subtle Layering

Surfaces should be barely different but still distinguishable. Study Vercel, Supabase, Linear for whisper-quiet hierarchy.

- SHOULD: Squint test — blur your eyes and still perceive hierarchy without harshness
- SHOULD: Background differences of 2-4% lightness between layers
- NEVER: Pure white cards on colored backgrounds (dead contrast)
- NEVER: Harsh borders as the only separator

## Navigation

Navigation teaches users how to think about the product space. It IS the product, not around it.

- MUST: Current location always visible
- MUST: Consistent placement across all screens
- SHOULD: Breadcrumbs for 3+ level depth
- SHOULD: Navigation structure mirrors the mental model of the domain, not the database schema
- NEVER: Navigation that requires scrolling to find

## Information Density

- MUST: Match density to context (sparse for onboarding, dense for dashboards)
- SHOULD: Consistent density within a screen
- NEVER: Mix sparse and dense patterns in the same view without clear hierarchy

## States

- MUST: Design empty states with helpful CTAs — these are onboarding moments
- MUST: Loading states — skeleton preferred over spinners for layouts
- MUST: Error states with recovery actions (not just "something went wrong")
- SHOULD: Partial/permission states if applicable
- SHOULD: Empty states that teach the product, not just fill space

## Data Display

- MUST: Tables sortable by at least one column
- SHOULD: Pagination or virtualization for 50+ items
- SHOULD: Filters visible, not buried in menus
- SHOULD: Numbers with context — what's good, what's bad, what changed
- NEVER: Truncate data without tooltip or expansion
- NEVER: Display raw data without considering what action the user takes with it

## Interactive Patterns

- MUST: Hover states on all clickable elements
- MUST: Loading indicator for async actions
- SHOULD: Optimistic updates where safe
- SHOULD: Undo for destructive actions instead of confirmation dialogs
- SHOULD: Keyboard shortcuts for frequent actions

## Typography

- SHOULD: Body text 14-16px (not smaller for prolonged use)
- SHOULD: Labels 12-13px, medium weight or caps for differentiation
- SHOULD: Monospace for data that needs alignment (IDs, timestamps, code)
- SHOULD: Tabular numerals for columns of numbers
- NEVER: Display-size fonts in app chrome (save for marketing)

## Color

- MUST: Semantic colors for status (success, warning, error, info)
- SHOULD: Muted palette — color draws attention, so use it sparingly
- SHOULD: Accent color for primary actions only
- SHOULD: Saturated greys (warm or cool) rather than dead neutral
- NEVER: Decorative color that doesn't convey meaning
- NEVER: Color as the only indicator of status (accessibility)

## Token Naming

CSS variable names are design decisions. They carry meaning:

```css
/* Evokes a world */
--ink: #1a1a1a;
--surface: #fafafa;
--accent: #e11d48;

/* Evokes a template */
--gray-700: #374151;
--white: #ffffff;
--blue-500: #3b82f6;
```

- SHOULD: Name tokens by role, not by value
- SHOULD: Names that a designer would understand without a color picker

## The 8-Hour Test

Could someone use this interface for 8 hours without visual fatigue? If not:

- Reduce contrast between background layers
- Soften borders
- Check for competing visual weight
- Ensure the eye has clear resting places
