# Touch Targets & Hit Areas Reference

Techniques for expanding clickable areas without affecting visual layout.

---

## Minimum Target Sizes

| Standard        | Min Size | Context                                  |
| --------------- | -------- | ---------------------------------------- |
| WCAG 2.2 AAA    | 44×44px  | Recommended for all interactive elements |
| Apple HIG       | 44×44pt  | iOS touch targets                        |
| Material Design | 48×48dp  | Android touch targets                    |
| WCAG 2.2 AA     | 24×24px  | Absolute minimum (avoid)                 |

**Default to 44×44px minimum.** This accommodates fingers, styluses, and motor-impaired users.

---

## Pseudo-Element Hit Target Expansion

Expand clickable areas without extra DOM nodes or visual changes using `::before` or `::after`:

```css
/* Expand a small icon button to 44×44px touch target */
.icon-button {
  position: relative;
  /* Visual size can be smaller */
  width: 24px;
  height: 24px;
}

.icon-button::before {
  content: "";
  position: absolute;
  /* Negative inset expands outward from the element */
  inset: -10px;
  /* Makes the pseudo-element the click target */
}
```

### How It Works

The `::before` pseudo-element with negative `inset` creates an invisible clickable area larger than the visible element. Because pseudo-elements are children of their parent, clicks on the pseudo-element trigger the parent's click handler.

### Tailwind Implementation

```html
<!-- Icon button with expanded touch target -->
<button class="relative size-6">
  <span class="absolute -inset-2.5" aria-hidden="true"></span>
  <Icon class="size-6" />
</button>

<!-- Link with expanded touch target -->
<a href="/page" class="relative">
  <span class="absolute -inset-x-3 -inset-y-2" aria-hidden="true"></span>
  Link text
</a>
```

**Note:** With Tailwind, use an actual `<span>` instead of a pseudo-element since Tailwind's `before:` variant is verbose. Add `aria-hidden="true"` to hide it from screen readers.

### Asymmetric Expansion

Expand differently per side based on context:

```css
/* More horizontal expansion for narrow text links */
.text-link::before {
  content: "";
  position: absolute;
  inset: -4px -12px; /* 4px vertical, 12px horizontal */
}

/* More vertical expansion for items in horizontal menus */
.menu-item::before {
  content: "";
  position: absolute;
  inset: -12px -4px; /* 12px vertical, 4px horizontal */
}
```

---

## Z-Index Layering for Overlapping Targets

When expanded hit areas overlap, use `z-index` on pseudo-elements to control which target takes precedence:

```css
/* Higher z-index = wins the click */
.primary-action::before {
  z-index: 1;
}

.secondary-action::before {
  z-index: 0;
}
```

---

## Common Scenarios

### Dense Lists

```html
<!-- Each list item is fully clickable via pseudo-element -->
<li class="group relative py-2">
  <a href="/item" class="text-sm">
    <span class="absolute inset-0" aria-hidden="true"></span>
    Item text
  </a>
  <!-- Action buttons sit above the full-row link -->
  <button class="relative z-10">Edit</button>
</li>
```

### Card Links

Make entire card clickable while keeping inner buttons interactive:

```html
<div class="group relative">
  <h3>
    <a href="/details">
      <span class="absolute inset-0" aria-hidden="true"></span>
      Card Title
    </a>
  </h3>
  <p>Card description...</p>
  <!-- Inner button floats above the card link -->
  <button class="relative z-10">Action</button>
</div>
```

### Small Checkboxes

```css
/* Visual checkbox is 16px, touch target is 44px */
.checkbox {
  position: relative;
  width: 16px;
  height: 16px;
}

.checkbox::before {
  content: "";
  position: absolute;
  inset: -14px; /* (44 - 16) / 2 = 14px expansion */
}
```

---

## Spacing Between Targets

Expanded hit areas must not overlap **unless** intentional (with z-index control). Ensure minimum spacing:

```
Visual gap:       [Button]  8px  [Button]
With expansion:   [====Button====][====Button====]
                  ↑ these overlap! ↑

Fix: Either reduce expansion or add more visual spacing
```

**Rule of thumb:** Visual gap between targets ≥ 2× the expansion amount. If expanding by 10px per side, visual gap should be ≥ 20px.

---

## Mobile-Specific Patterns

### Bottom-of-screen actions

Place primary actions in the thumb zone (bottom third of screen):

```
┌──────────────┐
│              │  ← Hard to reach
│   Content    │
│              │
│──────────────│
│ [Primary CTA]│  ← Thumb zone
└──────────────┘
```

### Full-width buttons on mobile

```html
<button class="w-full py-3 md:w-auto md:py-2">Save Changes</button>
```

### Touch-friendly spacing in lists

```html
<ul class="divide-y">
  <li class="py-4">
    <!-- 16px top + content + 16px bottom = easily tappable -->
    <a href="/item" class="block">Item</a>
  </li>
</ul>
```
