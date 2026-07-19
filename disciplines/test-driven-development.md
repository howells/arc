---
name: test-driven-development
description: Use for behavior, bugfix, and behavior-changing integration work before implementation code
---

# Test-Driven Development

TDD proves new or corrected behavior through an agreed observable seam. It is one evidence
technique inside Arc's work-kind matrix, not a ritual imposed on every file change.

Read `references/implementation-assurance.md` for posture and `references/testing-patterns.md`
for the canonical evidence matrix and seam agreement rules.

## When red is required

Use the canonical work-kind matrix to decide whether red evidence is required. This discipline
defines the red/green technique after that decision; it does not reclassify refactors,
integrations, artifacts, deployments, or documentation.

## Red, green, refactor

1. **RED:** write one minimal assertion at the agreed seam. Run it and confirm the expected
   failure is caused by missing or defective behavior, not a typo or harness error.
2. **GREEN:** implement the minimum behavior. Run the focused evidence and confirm it passes.
3. **REFACTOR:** improve structure without adding behavior. Keep affected evidence green.
4. Repeat vertically at the same seam until the coherent slice is complete.

If a new test passes immediately, determine whether the behavior already exists or the test is
wrong. Do not invent a failure. If no sensible seam exists, treat that as a design signal and
clarify the boundary before building.

## Test quality

- Assert observable results, not internal calls or mock choreography.
- Specify expected results independently of the implementation.
- Cover relevant error and boundary examples from the plan.
- Mock external boundaries only when a real or in-memory integration is impractical.
- A changed test must fail for the intended missing/defective behavior when red is required.

## Completion evidence

Report the focused red and green commands when required, the affected checks run at the slice
boundary, and any characterization coverage added. The controller—not an agent summary—mints
verification receipts.
