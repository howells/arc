# Refactor RFC Template

Output structure for `/arc:refactor`, written to
`docs/arc/plans/YYYY-MM-DD-[scope]-refactor-rfc.md`. Bracketed values are placeholders.

```markdown
## Problem

[Describe the architectural friction — which modules are shallow and coupled,
what integration risk exists, why this makes the codebase harder to navigate]

## Proposed Interface

[The chosen interface option — signature, usage example, what it hides.
A small ASCII before/after sketch is optional — include one only when it
lends support the prose can't carry on its own. If the explanation reads
clearly without it, leave it out.]

## Package / Module Extraction

[If applicable: where the new package/module lives, what it owns, what remains in callers, and how imports migrate]

## Dependency Strategy

[Which category applies and how dependencies are handled]

## Testing Strategy

- **Characterization tests to write first**: [current behaviours that must be pinned before splitting]
- **New boundary tests to write**: [behaviours to verify at the interface]
- **Old tests to delete**: [shallow module tests that become redundant]
- **Test environment needs**: [local stand-ins or adapters required]

## Decomposition Order

1. [First safe extraction]
2. [Second safe extraction]
3. [Import migration / cleanup]

[For a wide mechanical change — one whose blast radius fans across many call
sites at once — sequence it as expand → migrate in batches → contract instead
of a single edit. See Safe Split Order.]

## Implementation Recommendations

[Durable guidance NOT coupled to current file paths:

- What the module should own (responsibilities)
- What it should hide (implementation details)
- What it should expose (the interface contract)
- How callers should migrate]
```
