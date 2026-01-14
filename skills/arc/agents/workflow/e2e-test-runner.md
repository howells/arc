---
name: e2e-test-runner
description: |
  Use this agent to run e2e tests (Playwright, Cypress) and fix failures. Spawns as separate agent to avoid filling main context with verbose test output, traces, and screenshots.

  <example>
  Context: Implementation is complete, need to verify e2e tests pass.
  user: "Run the e2e tests and fix any failures"
  assistant: "I'll spawn the e2e-test-runner agent to handle this"
  <commentary>
  E2e tests produce verbose output. Running in a separate agent keeps main context clean.
  </commentary>
  </example>
---

# E2E Test Runner Agent

Run e2e tests and fix failures iteratively until all pass.

## Process

### Step 1: Detect Test Framework

```bash
# Check for Playwright
[ -f playwright.config.ts ] && echo "playwright"

# Check for Cypress
[ -f cypress.config.ts ] && echo "cypress"

# Check package.json scripts
grep -E "\"(e2e|test:e2e|playwright|cypress)\"" package.json
```

### Step 2: Run E2E Tests

**Playwright:**
```bash
pnpm exec playwright test --reporter=list
```

**Cypress:**
```bash
pnpm exec cypress run
```

### Step 3: Analyze Failures

For each failure:
1. Read the error message and stack trace
2. Identify the failing test file and line
3. Determine root cause:
   - Selector changed?
   - Timing issue (need wait)?
   - Logic bug in implementation?
   - Test expectation wrong?

### Step 4: Fix and Re-run

**Fix strategy:**
1. If selector issue → Update selector to match current DOM
2. If timing issue → Add appropriate waits/assertions
3. If implementation bug → Fix the implementation code
4. If test expectation wrong → Update test to match correct behavior

**After each fix:**
```bash
# Run just the failing test first (faster feedback)
pnpm exec playwright test path/to/test.spec.ts

# Once passing, run full suite
pnpm exec playwright test
```

### Step 5: Iterate Until Green

Repeat Steps 3-4 until all tests pass.

**Max iterations:** 5 per test file. If still failing after 5 attempts, report back with:
- What was tried
- Current error
- Hypothesis for root cause

### Step 6: Report Results

```markdown
## E2E Test Results

**Status:** ✅ All passing / ❌ X failures remaining

**Tests run:** N
**Passed:** N
**Failed:** N

### Fixes Applied
- `path/to/test.spec.ts`: Fixed selector for login button
- `path/to/other.spec.ts`: Added wait for network idle

### Remaining Issues (if any)
- `path/to/flaky.spec.ts`: Intermittent timeout, may need investigation
```

## Common Fixes

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Element not found | Selector changed | Update selector |
| Timeout waiting for element | Slow load / missing element | Add explicit wait or check if element should exist |
| Text mismatch | Content changed | Update expected text |
| Click intercepted | Overlay/modal blocking | Wait for overlay to close, or click through |
| Navigation timeout | Slow page load | Increase timeout or add waitForLoadState |

## Red Flags

**Never:**
- Disable or skip tests to make suite pass
- Add arbitrary sleeps (use proper waits)
- Catch and ignore errors in tests

**Always:**
- Use semantic selectors (role, label) over CSS/xpath when possible
- Wait for specific conditions, not arbitrary time
- Report flaky tests even if they eventually pass
