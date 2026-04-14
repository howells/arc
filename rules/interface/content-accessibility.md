# Interface: Content & Accessibility

## HTML Antipatterns (WCAG Quick Reference)

Common patterns that fail accessibility, mapped to WCAG success criteria. Use as a grep-friendly checklist.

### Critical (Must Fix)

| Pattern | WCAG | What to grep for |
|---------|------|------------------|
| Images without alt | 1.1.1 | `<img>` missing `alt` attribute |
| Icon-only buttons | 4.1.2 | `<button>` containing only SVG/icon, no `aria-label` |
| Unlabeled form inputs | 1.3.1 | `<input>`, `<select>`, `<textarea>` without `<label>` or `aria-label` |
| Non-semantic click handlers | 2.1.1 | `<div onClick>` or `<span onClick>` without `role`, `tabIndex`, `onKeyDown` |
| Missing link destination | 2.1.1 | `<a>` with only `onClick`, no `href` |
| `aria-hidden` on focusable | 4.1.2 | `aria-hidden="true"` on element with `tabIndex` or native focusability |

### Serious (Should Fix)

| Pattern | WCAG | What to grep for |
|---------|------|------------------|
| Focus outline removed | 2.4.7 | `outline-none` or `outline: none` without `focus-visible:ring` replacement |
| Missing keyboard handlers | 2.1.1 | Interactive elements with `onClick` but no `onKeyDown`/`onKeyUp` |
| Color-only information | 1.4.1 | Status/error indicated by color alone (no icon or text) |
| Touch target too small | 2.5.5 | Clickable elements smaller than 44×44px |
| Heading hierarchy skipped | 1.3.1 | `h1` followed by `h3` (skipping `h2`) |

### Moderate (Consider Fixing)

| Pattern | WCAG | What to grep for |
|---------|------|------------------|
| Positive tabIndex | 2.4.3 | `tabIndex` > 0 (disrupts natural tab order) |
| Role without required attrs | 4.1.2 | `role="button"` without `tabIndex="0"` |
| Placeholder-only labels | 1.3.1 | `<input placeholder="...">` without visible `<label>` |
| Auto-playing media | 1.4.2 | `<video autoPlay>` or `<audio autoPlay>` without pause control |

## ARIA

- NEVER: Use `aria-hidden="true"` on focusable elements
- MUST: Label elements need text and an associated input
- MUST: All anchors must be valid and navigable
- MUST: Accurate names (`aria-label`), decorative elements `aria-hidden`, verify in the Accessibility Tree
- MUST: Icon-only buttons have descriptive `aria-label`
- NEVER: Add tooltips to disabled buttons (inaccessible to keyboard users)
- MUST: Tooltips shouldn't contain interactive content
- MUST: HTML illustrations need explicit `aria-label` (raw DOM is announced otherwise)

## Focus

- SHOULD: Use `box-shadow` for focus rings instead of `outline` (respects border-radius):

```css
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--ring);
}
```

- MUST: Enable arrow-key navigation (↑↓) in sequential focusable lists
- SHOULD: Enable ⌘/Ctrl+Backspace deletion in sequential lists

## UX Copy & Writing Voice

Follow the [Chicago Manual of Style](https://www.chicagomanualofstyle.org/) for UX copy (labels, tooltips, empty states, error messages, marketing pages). For fiction-specific CMOS rules, see `~/Sites/fiction/skills/references/style-guides/chicago-manual.md`.

### Avoid LLM-Sounding Copy

AI-generated text has recognizable patterns that erode trust. Avoid these tells:

- NEVER: Em dashes (—) in UX copy. Use commas, periods, or parentheses instead. Em dashes are the most recognizable LLM tell
- NEVER: "Delve", "leverage", "streamline", "empower", "elevate", "robust", "seamless", "cutting-edge"
- NEVER: "In order to" (just use "to")
- NEVER: Filler hedges like "It's worth noting that", "Interestingly,", "It's important to note"
- NEVER: Starting with "So," or "Great question!"
- SHOULD: Prefer short, direct sentences. If it sounds like a press release, rewrite it
- SHOULD: Read copy aloud. If it sounds unnatural, it reads unnatural

## Content & Accessibility
- SHOULD: Inline help first; tooltips last resort
- MUST: Skeletons mirror final content to avoid layout shift
- MUST: `<title>` matches current context
- MUST: No dead ends; always offer next step/recovery
- MUST: Design empty/sparse/dense/error states
- SHOULD: Curly quotes (" "); avoid widows/orphans
- MUST: Tabular numbers for comparisons (`font-variant-numeric: tabular-nums` or a mono like Geist Mono)
- MUST: Redundant status cues (not color-only); icons have text labels
- MUST: Don't ship the schema—visuals may omit labels but accessible names still exist
- MUST: Use the ellipsis character `…` (not `...`)
- MUST: `scroll-margin-top` on headings for anchored links; include a "Skip to content" link; hierarchical `<h1–h6>`
- MUST: Resilient to user-generated content (short/avg/very long)
- MUST: Locale-aware dates/times/numbers/currency
- SHOULD: Right-clicking the nav logo surfaces brand assets
- MUST: Use non-breaking spaces to glue terms: `10\u00A0MB`, `⌘\u00A0+\u00A0K`, `Vercel\u00A0SDK`
