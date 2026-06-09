# Interface: Surfaces

Surface treatment communicates depth, grouping, and pace. Use it sparingly and consistently.

## Surface Ladder

- MUST: Define a clear ladder such as canvas -> surface -> raised -> overlay.
- MUST: Keep neighboring steps visually close enough that hierarchy feels coherent.
- SHOULD: Use borders, tinted fills, and whitespace before introducing stronger shadows.

## Cards, Panels, And Dividers

- MUST NOT: Wrap every content block in a card.
- SHOULD: Use open layouts with spacing and dividers for routine sectioning.
- SHOULD: Reserve card treatments for repeated items, settings clusters, or genuinely framed tools.
- MUST: Divider treatments stay quiet; they support grouping, not visual branding.
- MUST: Nested cards need a strong product reason.

## Breakpoint Reconfiguration

- SHOULD: Reduce visual framing as screen real estate tightens.
- MUST: Re-evaluate card density, padding, and borders at smaller breakpoints instead of merely stacking the same desktop treatment.
- SHOULD: Merge adjacent surfaces on mobile when extra chrome slows scanning.

## Visual Weight

- MUST: Use surface contrast to clarify priority, not decorate empty space.
- SHOULD: Let whitespace do work before adding more borders or fills.
- MUST NOT: Create a checkerboard of alternating panels without information hierarchy to justify it.

## Empty And Loading States

- MUST: Empty and loading states inherit the same surface ladder as the populated state.
- SHOULD: Skeletons and placeholders match the eventual container structure.

## Review Questions

- Could whitespace or a divider replace this card?
- Does the current surface treatment make scanning faster?
- Is any surface visually louder than the content it contains?
