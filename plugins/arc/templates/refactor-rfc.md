# Refactor RFC Template

Output structure for `/arc:refactor`, written to
`docs/arc/plans/YYYY-MM-DD-[scope]-refactor-rfc.md`. Bracketed values are placeholders.

```markdown
# Refactor RFC: [scope] — [YYYY-MM-DD]

## Problem

[Describe the architectural friction — which modules are shallow and coupled,
what integration risk exists, why this makes the codebase harder to navigate]

## Proposed Interface

[The chosen interface option — signature, usage example, what it hides.
A small ASCII before/after sketch is optional — include one only when it
lends support the prose can't carry on its own. If the explanation reads
clearly without it, leave it out.]

## Options Considered

[One paragraph per competing option from Step 7 — what the option was, and why it lost.
The chosen option gets its paragraph too, stated as what it was.]

## Decision Status

- **Chosen option**: [which one]
- **Why it beat the alternatives**: [the reason, not a restatement of its trade-offs]
- **Confirmation**: [confirmed by user | unconfirmed — unattended run, list every skipped
  confirmation]
- **Open questions**: [questions carried over from the Step 5 grilling loop, or "none"]

## Package / Module Extraction

[If applicable: where the new package/module lives, what it owns, what remains in callers, and how imports migrate]

## Dependency Strategy

[Which category applies and how dependencies are handled]

## Testing Strategy

- **Characterization tests to write first**: [current behaviours that must be pinned before splitting]
- **New boundary tests to write**: [behaviours to verify at the interface]
- **Old tests to delete**: [shallow module tests that become redundant — if any exist; in an
  untested codebase, say so, since the safety-net gap is itself an input to `/arc:testing`]
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
