---
name: change-impact-testing
description: Use after making any code change to identify, run, and if needed create tests whose surface area is touched by the change
---

# Change Impact Testing

## Overview

Every code change has a blast radius. Find the tests that cover it and run them.

**Core principle:** If you changed code, find every test that touches it. Run them. If none exist, write them.

**Violating the letter of this rule is violating the spirit of this rule.**

## The Iron Law

```
NO CHANGE WITHOUT RUNNING AFFECTED TESTS
```

Changed a function? Run its unit tests. Changed a query? Run integration tests that use it. Changed a user flow? Run the E2E tests that cover it. No tests exist? Create them before moving on.

## When to Apply

**Every time you:**
- Modify a function, method, or class
- Change a SQL query, database migration, or data model
- Alter an API endpoint or its response shape
- Update a component's props, state, or rendering logic
- Refactor shared utilities or helpers
- Change configuration that affects runtime behavior
- Modify middleware, hooks, or interceptors

## The Process

### 1. Identify the Blast Radius

Map what the change touches:

```
Changed code
  → Direct callers (functions that call this)
  → Data consumers (components, APIs that use this data)
  → Side effects (database writes, external calls, events)
  → Downstream flows (user journeys that pass through here)
```

**For a SQL change:** What queries run through this table? What API endpoints return this data? What UI renders it?

**For a utility function:** What modules import it? What behavior depends on its output?

**For a component change:** What pages render it? What user flows interact with it?

### 2. Find Existing Tests

Search for tests that cover the blast radius:

```bash
# Find tests importing the changed module
grep -r "import.*from.*[changed-module]" --include="*.test.*" --include="*.spec.*"

# Find tests referencing the function name
grep -r "[function-name]" --include="*.test.*" --include="*.spec.*"

# Find E2E tests covering the affected route/feature
grep -r "[route-or-feature]" --include="*.spec.ts" e2e/
```

### 3. Run Affected Tests

Run every test identified in step 2:

```bash
# Specific unit tests
pnpm vitest run path/to/affected.test.ts

# Specific E2E tests
pnpm playwright test path/to/affected.spec.ts

# All tests matching a pattern
pnpm vitest run -t "feature name"
```

**All must pass.** If any fail, determine: did you break something, or was the test already broken?

### 4. Assess Coverage Gaps

If the blast radius includes behavior with no tests, you have a gap.

| Change Type | Missing Test Type | Action |
|-------------|-------------------|--------|
| Pure function logic | Unit test | Write unit test covering the change |
| Database query | Integration test | Write test verifying query results |
| API response shape | Integration test | Write test asserting response structure |
| User-facing flow | E2E test | Write E2E test covering the flow |
| Error handling path | Unit or integration | Write test triggering the error case |

### 5. Create Missing Tests

Follow TDD discipline even for gap-filling:

1. Write the test asserting expected behavior
2. Run it — it should **pass** (behavior already exists from your change)
3. Temporarily revert your change
4. Run test — it should **fail** (proves the test actually covers the change)
5. Restore your change
6. Run test — passes again

This proves the test is meaningfully connected to the change, not just exercising unrelated code.

## SQL and Database Changes

Database changes deserve special attention because their blast radius is often wider than it appears.

| Change | Test Surface |
|--------|-------------|
| Column added/modified | Queries selecting from table, API serialization, UI rendering |
| Index added/removed | Query performance tests (if any), no functional change |
| Migration (data transform) | Before/after data shape assertions |
| Query logic changed | Every endpoint/service that calls this query |
| Relation changed | Joins, cascades, all dependent queries |

**Write an integration test for any query change.** Unit tests can't prove a query works — they mock the database. Integration tests with a real database (or test database) prove the query returns what you expect.

## Common Mistakes

| Mistake | Reality |
|---------|---------|
| Only running the test you wrote | Other tests may cover the same code |
| Skipping E2E because unit tests pass | Unit tests don't prove the user flow works |
| Assuming no tests = no problem | No tests = unknown risk. Write them. |
| Running all tests instead of targeted | Slow, hides signal in noise. Run affected first. |
| Trusting "nothing else uses this" | Search the codebase. You're probably wrong. |
| Ignoring test failures as "flaky" | Investigate. Flaky tests hide real regressions. |

## Selector Discipline in E2E Tests

When creating or modifying E2E tests, **always use `data-testid` attributes**. String comparisons against UI text (button labels, headings, placeholder copy) are the #1 source of flaky tests. A copywriter changes "Submit" to "Save" and the suite breaks.

```typescript
// GOOD: Stable, decoupled from UI copy
await page.getByTestId("submit-button").click();
await expect(page.getByTestId("success-message")).toBeVisible();

// ACCEPTABLE: Semantic locators for accessible elements
await page.getByRole("button", { name: "Submit" }).click();
await page.getByLabel("Email").fill("test@example.com");

// BAD: Fragile, breaks on any copy or style change
await page.getByText("Submit your application").click();
await page.locator(".btn-primary").click();
await page.locator("div > form > button:first-child").click();
```

When adding `data-testid` to components for a new test, that's part of the change — include it in the blast radius assessment.

## Red Flags - STOP

- Changed code without checking for affected tests
- Tests failed and you moved on
- Assumed the change was "too small to break anything"
- Found no tests and didn't create any
- Only ran the test file you edited, not other affected tests
- Changed a database query without running integration tests
- Changed shared code without checking all consumers

## Verification

Before considering the change complete:

- [ ] Identified full blast radius of the change
- [ ] Found all existing tests covering the blast radius
- [ ] Ran all affected tests — all pass
- [ ] Identified coverage gaps
- [ ] Created tests for uncovered behavior
- [ ] Verified new tests are meaningfully connected to the change (red-green)
- [ ] No test failures remaining
