# Interface: Design

## Visual Design
- SHOULD: Layered shadows (ambient + direct)
  - *Example:* `shadow-[0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.1)]`
- SHOULD: Crisp edges via semi-transparent borders + shadows
  - *Example:* `border border-black/5 dark:border-white/10`
- SHOULD: Nested radii: child ≤ parent; concentric
  - *Math:* `outerRadius - padding = innerRadius`
- SHOULD: Hue consistency: tint borders/shadows/text toward bg hue
- MUST: Accessible charts (color-blind-friendly palettes)
- MUST: Meet contrast—prefer APCA over WCAG 2
  - https://apcacontrast.com/
- MUST: Increase contrast on `:hover/:active/:focus`
- SHOULD: Match browser UI to bg
- SHOULD: Avoid gradient banding (use masks when needed)

## Color Restraint
- SHOULD: Limit accent colors to one per view unless design specifies otherwise
- SHOULD: Use existing theme colors before introducing new tokens
- NEVER: Use purple or multicolor gradients (common AI-generated slop)
- SHOULD: Avoid decorative gradients unless specifically requested
- NEVER: Use glow effects as primary affordances

## Component Primitives
- NEVER: Mix primitive systems in the same interaction surface (e.g., Radix + Headless UI + Base UI)
- MUST: Prefer project's existing primitives before introducing new libraries
- MUST: Use accessible component primitives (Radix, Base UI, etc.) for anything with keyboard or focus behavior

