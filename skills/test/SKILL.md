---
name: test
description: Test strategy and execution. Create test plans, run test suites, or fix failing tests. Supports vitest, playwright, jest, and cypress.
---

<rules_context>
**Check for project testing rules:**

**Use Glob tool:** `.ruler/testing.md`

**If file exists:** Read it for MUST/SHOULD/NEVER constraints on testing patterns, frameworks, and conventions.

**If `.ruler/` doesn't exist:** Continue without rules — they're optional.
</rules_context>

# Test Workflow

Create or review test strategy. Optionally run test suite. Supports vitest and playwright primarily.

## Process

### Step 1: Detect Test Setup

**Use Glob tool to find test framework config:**

| Glob Pattern | Framework |
|-------------|-----------|
| `vitest.config.*` | vitest |
| `playwright.config.*` | playwright |
| `jest.config.*` | jest |
| `cypress.config.*` | cypress |

### Step 2: Determine Intent

"What would you like to do?"
1. **Review strategy** — Analyze current test coverage and approach
2. **Create strategy** — Design test plan for a feature
3. **Run tests** — Execute test suite
4. **Fix failing tests** — Debug and fix

### For "Review Strategy"

**Analyze test coverage:**

**Use Glob tool:** `**/*.test.*`, `**/*.spec.*` — count test files

**Use Grep tool:** Pattern `coverage` in `vitest.config.*`, `playwright.config.*` — check coverage config

**Report:**
- Number of test files
- Unit vs E2E balance
- Coverage gaps (if measurable)
- Missing test patterns

### For "Create Strategy"

For the given feature:

1. **Unit tests** (vitest)
   - Pure functions
   - Component rendering
   - Hooks behavior

2. **Integration tests** (vitest)
   - Component interactions
   - API mocking

3. **E2E tests** (playwright)
   - Critical user flows
   - Happy path + key error states

Output test plan:
```markdown
## Test Strategy: [Feature]

### Unit Tests
- [ ] [Test case]: [What it verifies]

### Integration Tests
- [ ] [Test case]: [What it verifies]

### E2E Tests
- [ ] [Test case]: [What it verifies]
```

### For "Run Tests"

**Determine test type from context or ask:**
- Unit/Integration tests → Run inline
- E2E tests → Run as background agent (prevents terminal crashes)

**Unit/Integration (vitest/jest) — Run inline:**
```bash
# Vitest
pnpm vitest run

# With coverage
pnpm vitest run --coverage
```

**E2E tests (playwright/cypress) — Run as background agent:**
```
Task Bash run_in_background: true: "Run playwright e2e tests and report results.

Commands:
pnpm playwright test

If tests fail, capture:
- Which tests failed
- Error messages
- Screenshot paths (if any)

Report summary when complete."
```

**Why background agent for E2E:**
- Playwright spawns browsers which can consume significant resources
- If tests hang or crash, your main session continues
- Verbose trace output doesn't fill your context
- You can continue working while tests run

Report results. If failures, offer to debug.

### For "Fix Failing Tests"

Follow `${CLAUDE_PLUGIN_ROOT}/disciplines/systematic-debugging.md`:
1. Read error message carefully
2. Understand what test expects
3. Determine if test or code is wrong
4. Fix at source

## Test Patterns

From `${CLAUDE_PLUGIN_ROOT}/references/testing-patterns.md`:

**Good tests:**
- Test behavior, not implementation
- One assertion per concept
- Clear names describing what's tested
- Real code over mocks when possible

**Bad tests:**
- Testing mock behavior
- Vague names ("test1", "it works")
- Implementation details in assertions

<progress_append>
After running tests or creating strategy, append to progress journal:

```markdown
## YYYY-MM-DD HH:MM — /arc:test
**Task:** [Run tests / Create strategy / Fix failing]
**Outcome:** [Complete / X tests passing / Y failing]
**Files:** [Test files if created/modified]
**Decisions:**
- [Coverage gaps identified]
**Next:** [Fix failures / Continue]

---
```
</progress_append>
