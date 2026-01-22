# Design Philosophy

Timeless principles for UI design, extracted from *Refactoring UI* by Adam Wathan & Steve Schoger.

---

## Starting From Scratch

### Start with a Feature, Not a Layout

The instinct when starting a new project is to design the shell first—navigation, sidebar, footer. Resist this. You don't know what those need to contain until you've designed what matters: the actual features.

Instead:
- Design the core functionality first
- Figure out where it lives later
- The shell should serve the content, not the reverse

### Detail Comes Later

Don't obsess over pixel-perfect details in early stages. This slows you down and creates attachment to decisions you haven't validated.

Work in cycles:
1. **Low fidelity first**: Grayscale, no shadows, system fonts
2. **Rough out the basics**: Get the structure right
3. **Make it real**: Add color, images, refined typography
4. **Polish**: Shadows, transitions, micro-interactions

Holding off on aesthetics forces you to focus on hierarchy and spacing—the bones of good design.

### Don't Design Too Much

Design what you need to build next, not the entire system.

- Work in short cycles
- Be a pessimist—expect things to change
- Designing features you might not build wastes time and creates attachment

### Choose a Personality

Every design has a personality, whether intentional or not. Be deliberate:

| Personality | Typography | Colors | Borders |
|------------|-----------|--------|---------|
| **Elegant/Classic** | Serif fonts | Muted, sophisticated | Subtle, minimal |
| **Playful/Fun** | Rounded sans-serif | Bright, saturated | Soft, curved |
| **Plain/Simple** | Neutral sans-serif | Minimal, monochrome | Clean, geometric |
| **Bold/Confident** | Heavy weights | Saturated, high contrast | Strong, defined |

### Limit Your Choices

Define systems up front—spacing, colors, typography. Then design by selecting from predefined options, not inventing new ones on the fly.

Constraints accelerate decision-making. Every time you reach for "whatever looks right," you slow down and introduce inconsistency.

---

## Hierarchy is Everything

### Not All Elements Are Equal

Before designing, classify every element:

- **Primary**: Main content, key actions (what users came for)
- **Secondary**: Supporting information
- **Tertiary**: Meta info, less critical content

This classification drives every visual decision.

### Size Isn't Everything

When everything is bold, nothing is bold. Relying too much on font size creates competition between elements.

Use the full toolkit:
- **Font weight**: Normal vs medium vs semibold
- **Color**: Black, grey, lighter grey
- **Spacing**: Grouping creates hierarchy

Two or three grays plus one primary color handles 90% of hierarchy needs.

### Emphasize by De-emphasizing

Sometimes the best way to highlight an element is to make everything else fade back. Instead of making a button louder, make the surrounding elements quieter.

This works because:
- There's a ceiling to how prominent you can make something
- De-emphasizing has no floor
- Subtraction often works better than addition

### Labels Are a Last Resort

Much data is self-explanatory:
- `user@example.com` is obviously an email
- `(555) 123-4567` is obviously a phone number
- `$49.99` is obviously a price

Only add labels when the format is ambiguous. When you must use labels, consider combining them with values rather than displaying separately.

### Separate Visual Hierarchy from Document Hierarchy

An `<h2>` doesn't have to be visually prominent. A button in an `<aside>` might be the most important action on the page.

- Style for clarity and visual communication
- Use semantic HTML for accessibility
- These are independent concerns

### Balance Weight and Contrast

A bold icon next to thin text looks unbalanced. Reduce contrast on heavier elements to maintain visual equilibrium:
- Soften heavy icons with grey instead of black
- Use lighter weights for large text
- Bold elements work better at lower contrast

---

## Layout and Spacing

### Start with Too Much White Space

White space is free. Cramped layouts feel cheap and amateur.

Start generous, then remove space only when you have a specific reason. "It feels too empty" isn't a reason—"users are missing the relationship between these items" is.

### Establish a Spacing System

Define a scale and stick to it religiously:

```
4, 8, 12, 16, 24, 32, 48, 64, 96, 128...
```

Using a linear scale (10, 20, 30, 40...) leads to hard decisions between adjacent values. A geometric-ish scale with larger jumps makes choices obvious.

16px is a comfortable default for interface elements. 4px works for tight relationships.

### You Don't Have to Fill the Whole Screen

Just because you have space doesn't mean you need to use it. Wide monitors don't require wide content.

Consider:
- Max-widths for readable content (45-75 characters)
- Fixed widths for form inputs
- Proportional layouts only where they genuinely help

### Grids Are Overrated

Don't force everything into 12 columns. Grids are one tool, not the only tool.

Use grids where they make sense (dashboards, galleries). Use fixed widths where they're simpler (forms, sidebars). Sometimes a component just needs to be 400px wide.

### Avoid Ambiguous Spacing

Elements must be *obviously* closer to their related content than to unrelated content. When spacing is ambiguous, users have to think.

```
Bad:  [Header]
              ← equal spacing
      [Content]
              ← equal spacing
      [Footer]

Good: [Header]
      [Content]  ← tight spacing

              ← large spacing
      [Footer]
```

---

## Working with Color

### Ditch Hex for HSL

HSL (Hue, Saturation, Lightness) is more intuitive than Hex:
- **Hue** (0-360): Position on the color wheel
- **Saturation** (0-100%): Color intensity
- **Lightness** (0-100%): Light to dark

With HSL, creating variations is straightforward. Need a lighter shade? Increase lightness. Need a muted version? Decrease saturation.

### You Need More Colors Than You Think

A complete palette includes:
- **Greys**: 8-10 shades (used most frequently)
- **Primary**: 5-10 shades
- **Semantic colors**: Red, yellow, green—5-10 shades each
- **Accent colors**: Any additional hues—5-10 shades each

### Don't Let Lightness Kill Saturation

As lightness approaches 0% or 100%, colors lose perceived saturation. To maintain vibrancy at the extremes:
- Increase saturation for very light shades
- Increase saturation for very dark shades

A 50% lightness blue at 80% saturation might need 95% saturation at 90% lightness to feel equally vivid.

### Use Perceived Brightness

Different hues have different perceived brightness at the same HSL lightness value:
- **Bright hues**: Yellow (60°), Cyan (180°), Magenta (300°)
- **Dark hues**: Red (0°), Green (120°), Blue (240°)

To create lighter shades, rotate hue toward the nearest bright point. To create darker shades, rotate toward the nearest dark point.

Don't rotate more than 20-30 degrees—you'll shift the color's identity.

### Greys Don't Have to Be Grey

Pure grey (0% saturation) often feels cold or dead. Saturate your greys:

- **Cool greys**: Add blue for professional, tech, modern feel
- **Warm greys**: Add yellow/orange for friendly, inviting feel

Match grey temperature to your brand. A legal site wants cool; a bakery wants warm.

### Don't Rely on Color Alone

Red/green colorblind users need alternative signals:
- Icons alongside color (checkmark for success, X for error)
- Position and grouping
- Text labels
- Patterns or textures for data visualization

---

## Creating Depth

### Shadows Convey Elevation

Shadow size communicates z-axis position:
- **Small, tight shadows**: Slightly raised (buttons, cards)
- **Medium shadows**: Floating (dropdowns, popovers)
- **Large, diffuse shadows**: Modal, capturing attention

Define 3-5 elevation levels and use them consistently.

### Two-Part Shadows

Natural shadows have two components:
1. **Large, soft shadow**: Simulates direct light source
2. **Tight, dark shadow**: Simulates blocked ambient light

At higher elevations, the ambient shadow becomes more subtle while the direct shadow grows.

### Even Flat Designs Can Have Depth

Without box-shadows:
- **Color**: Lighter elements feel closer, darker feel further
- **Solid shadows**: No blur, just offset
- **Layering**: Overlap and negative space

### Overlap Creates Layers

- Offset cards across background color transitions
- Let elements exceed their container bounds
- Use negative margin to create intentional overlap

When overlapping images, add an invisible border (matching the background) to prevent color clashes at the edge.

---

## Finishing Touches

### Add Color with Accent Borders

A single colored border transforms plain elements:
- Top of cards
- Left side of alerts or notifications
- Under active navigation items
- Top of the entire layout (brand strip)

### Don't Overlook Empty States

Empty states deserve design attention:
- Add illustrations or icons
- Write helpful copy explaining what will appear
- Include clear CTAs for adding content
- Hide UI that doesn't make sense until populated

Empty states are often the first thing users see. Make them good.

### Use Fewer Borders

Before adding a border, try:
- **Box shadows**: Outline without visual clutter
- **Background color differences**: Subtle distinction
- **Extra spacing**: Separation without elements

Borders add visual weight. Often the same separation is achievable with less.

### Think Outside the Box

Challenge component assumptions:
- Dropdowns don't have to be plain lists
- Tables can have hierarchy within cells
- Radio buttons can become selectable cards
- Inputs can contain buttons

The default implementation isn't always the best implementation.

---

## Leveling Up

### Study Decisions You Wouldn't Have Made

When viewing designs you admire, note the unexpected:
- Unconventional layouts
- Surprising color choices
- Atypical component implementations

These decisions are where skill lives. The obvious choices are easy; the surprising-yet-correct choices require expertise.

### Rebuild Interfaces You Like

Pick a design you admire and recreate it without inspecting the code:
1. Screenshot or reference only
2. Build from scratch
3. Compare your version to the original
4. Note every difference

The gaps between your version and theirs reveal what you need to learn.
