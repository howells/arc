---
name: testing
description: |
  Comprehensive testing strategy. Creates test plans covering unit, integration, and E2E.
  Uses specialist agents for each test type. Supports vitest and Playwright with auth testing
  guidance for Clerk and WorkOS.
license: MIT
metadata:
  author: howells
website:
  order: 10
  desc: Run & fix tests
  summary: Run your tests, fix failures, or create a test strategy. Supports vitest, jest, playwright—with special handling for auth testing (Clerk, WorkOS).
  what: |
    Testing runs your test suite and helps fix what's broken. For unit tests (vitest, jest), it's straightforward—run, read failures, fix. For e2e tests (playwright), it spawns a dedicated agent that can handle the verbose output, retry flaky tests, and work through failures methodically. Includes specialized guidance for auth testing with Clerk and WorkOS.
  why: |
    E2e tests are painful—slow, flaky, verbose output that fills your context. Testing handles this by running playwright in a background agent that can retry, screenshot failures, and fix issues without overwhelming your main session. Auth testing gets special treatment because mocking Clerk/WorkOS is tricky.
  decisions:
    - Framework detection is automatic. It finds your test config and runs the right thing.
    - E2e tests get special treatment. Background agent handles retries and verbose output.
    - Auth testing guidance built in. Clerk mocks, WorkOS mocks, test bypass endpoints.
  agents:
    - unit-test-writer
    - integration-test-writer
    - e2e-test-writer
    - test-runner
    - e2e-runner
  workflow:
    position: spine
    after: implement
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## REQUIRED TOOLS — use these when indicated:
- **`AskUserQuestion`** — Preserve the one-question-at-a-time interaction pattern. In Claude Code, use the tool. In Codex, ask one concise plain-text question at a time unless a structured question tool is actually available in the current mode. Do not narrate missing tools or fallbacks to the user.

## BANNED TOOLS — calling these is a skill violation:
- **`EnterPlanMode`** — BANNED. Do NOT call this tool. This skill has its own structured testing workflow. Execute it directly.
- **`ExitPlanMode`** — BANNED. You are never in plan mode.
</tool_restrictions>

<arc_runtime>
This workflow requires the full Arc bundle, not a prompts-only install.

Paths in this skill use these conventions:
- `agents/...`, `references/...`, `disciplines/...`, `templates/...`, `scripts/...`, `rules/...`, `skills/<name>/...` are Arc-owned files at the plugin root. Resolve the plugin root from this skill's filesystem location — it's the directory containing `agents/` and `skills/`.
- `./...` is local to this skill's directory.
- `.ruler/...`, `docs/...`, `src/...`, or any project-relative path refers to the user's project repository.
</arc_runtime>

# Testing Strategy Workflow

Create comprehensive test strategies covering the full test pyramid. Execute with specialist agents.

<required_reading>
**Read before planning:**
1. `references/testing-patterns.md` — Test philosophy, vitest/playwright patterns
2. `rules/testing.md` — Project conventions
3. `references/llm-api-testing.md` — If testing LLM integrations
4. `disciplines/change-impact-testing.md` — Blast radius analysis for code changes
</required_reading>

## Agents

**This skill uses 3 writers + 2 runners:**

| Agent | Model | Purpose | Framework |
|-------|-------|---------|-----------|
| `unit-test-writer` | sonnet | Write unit tests | vitest |
| `integration-test-writer` | sonnet | Write integration tests (API, auth) | vitest + MSW |
| `e2e-test-writer` | opus | Write E2E tests | Playwright |
| `test-runner` | haiku | Run vitest, analyze failures | vitest |
| `e2e-runner` | opus | Run Playwright, fix issues, iterate | Playwright |

**Test Pyramid:**
```
         /\
        /  \       E2E (few)
       /────\      - Critical user journeys
      /      \     - Auth flows
     /────────\    Integration (some)
    /          \   - API interactions
   /────────────\  - Component + state
  /              \ Unit (many)
 /────────────────\- Pure functions
                   - Isolated components
```

<rules_context>
**Check for project testing rules:**

**Use Glob tool:** `.ruler/testing.md`

If exists, read for MUST/SHOULD/NEVER constraints.

**Detect test framework:**

| File | Framework |
|------|-----------|
| `vitest.config.*` | vitest (unit + integration) |
| `playwright.config.*` | Playwright (E2E) |
</rules_context>

## Process

### Step 1: Determine Intent

```
AskUserQuestion:
  question: "What would you like to do?"
  header: "Testing Intent"
  options:
    - label: "Create test strategy"
      description: "Full test plan across unit, integration, and E2E — then dispatch agents"
    - label: "Run tests"
      description: "Execute existing tests with the appropriate runner"
    - label: "Fix failing tests"
      description: "Dispatch debugger or e2e-runner to fix broken tests"
    - label: "Review coverage"
      description: "Analyze gaps in test coverage and recommend improvements"
```

### Step 2: Understand What's Being Tested

Gather context:
1. What feature or component?
2. Does it have auth? (Clerk, WorkOS, custom)
3. Does it call APIs?
4. Does it have critical user flows?
5. What's the risk level?

### Step 3: Create Test Plan

**For each feature, plan across all levels:**

```markdown
## Test Plan: [Feature Name]

### Risk Assessment
- **Criticality**: [high/medium/low]
- **Has Auth**: [yes/no — Clerk/WorkOS/custom]
- **Has API Calls**: [yes/no]
- **User-Facing**: [yes/no]

### Unit Tests (vitest)
**Agent:** unit-test-writer

| Test Case | What it Verifies |
|-----------|------------------|
| `should [behavior]` | [Pure function/component behavior] |
| `should [behavior]` | [Edge case handling] |
| `should [behavior]` | [Error throwing] |

**Files to create:**
- `src/[path]/[module].test.ts`

### Integration Tests (vitest + MSW)
**Agent:** integration-test-writer

| Test Case | What it Verifies |
|-----------|------------------|
| `should [behavior]` | [Component + API interaction] |
| `should [behavior]` | [Auth state handling] |
| `should [behavior]` | [Error from API] |

**Mocking required:**
- API endpoints: [list]
- Auth: [Clerk/WorkOS mock setup]

**Files to create:**
- `src/[path]/[feature].integration.test.ts`

### E2E Tests (Playwright)
**Agent:** e2e-test-writer

| Test Case | What it Verifies |
|-----------|------------------|
| `should [complete flow]` | [Happy path journey] |
| `should [handle error]` | [User-visible error] |
| `should [auth flow]` | [Login/logout if applicable] |

**Auth setup required:**
- Provider: [Clerk/WorkOS/none]
- Test user: [env var names]

**Files to create:**
- `tests/[feature].spec.ts`
- `tests/auth.setup.ts` (if auth needed)
```

### Step 4: Execute Test Plan

Dispatch specialists in order:

**1. Unit tests first (fastest feedback):**
```
Task [unit-test-writer] model: sonnet: "Write unit tests for [feature].

Test cases from plan:
[paste unit test cases]

Files to create: [paths]
Follow vitest patterns from testing-patterns.md"
```

**2. Integration tests second:**
```
Task [integration-test-writer] model: sonnet: "Write integration tests for [feature].

Test cases from plan:
[paste integration test cases]

Auth: [Clerk/WorkOS/none]
API mocking: [endpoints to mock]
Files to create: [paths]"
```

**3. E2E tests last:**
```
Task [e2e-test-writer] model: opus: "Write E2E tests for [feature].

Test cases from plan:
[paste e2e test cases]

Auth: [Clerk/WorkOS/none]
Fixtures needed: [list]
Files to create: [paths]"
```

### Step 5: Run and Verify

**Unit + Integration (inline):**
```bash
pnpm vitest run
```

**E2E (background agent — avoids terminal issues):**
```
Task [e2e-runner] model: opus: "Run E2E tests and fix any failures.

Test files: [list]
Iterate until green or report blockers."
```

---

## Auth Testing Quick Reference

### Clerk Testing

**Integration tests (vitest):**
- Mock `useAuth` and `useUser` hooks
- Test loading, signed in, signed out states
- Mock `getToken` for API calls

**E2E tests (Playwright):**
- Create `tests/auth.setup.ts` for login flow
- Store session in `playwright/.auth/user.json`
- Use `storageState` in playwright.config.ts

**Common issues:**
- ❌ Trying to mock ClerkProvider (mock hooks instead)
- ❌ Not handling `isLoaded: false` state
- ❌ Hardcoding tokens (use `getToken` mock)

### WorkOS Testing

**Integration tests (vitest):**
- Mock `getUser` from `@workos-inc/authkit-nextjs`
- Test with full user object including `organizationId`, `role`, `permissions`
- Test SSO redirect behavior

**E2E tests (Playwright):**
- SSO flows are slow — consider test bypass endpoint
- Create `/api/auth/test-login` for faster auth (test env only)
- Store session state after auth

**Common issues:**
- ❌ Forgetting `organizationId` in mock (required for org-level features)
- ❌ Not testing permission checks
- ❌ SSO redirect timing issues (add proper waits)

### Bypass Auth for Speed

For faster E2E tests, create a test-only auth endpoint:

```typescript
// app/api/auth/test-login/route.ts
// ONLY available in test/development
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }
  // Create session directly without SSO flow
}
```

---

## Test Patterns

### What to Test at Each Level

| Level | Test | Don't Test |
|-------|------|------------|
| **Unit** | Pure functions, isolated components, hooks | API calls, multi-component flows |
| **Integration** | Component + API, auth states, form submissions | Full user journeys |
| **E2E** | Critical paths, auth flows, checkout/signup | Every possible input |

### Coverage Guidelines

| Feature Type | Unit | Integration | E2E |
|--------------|------|-------------|-----|
| Utility functions | ✅ heavy | ❌ none | ❌ none |
| UI components | ✅ rendering | ✅ with state | ❌ only if critical |
| Forms | ✅ validation | ✅ submission | ✅ critical forms |
| API routes | ✅ handlers | ✅ with mocking | ❌ via E2E |
| Auth flows | ❌ none | ✅ mock states | ✅ real flow |
| Checkout/payment | ✅ calculations | ✅ flow | ✅ full journey |

### Fail-Fast Configuration

**Tests must fail fast. Never:**
- Global timeout of minutes
- 5+ retries to mask flakiness
- Arbitrary sleeps

**Playwright config:**
```typescript
export default defineConfig({
  timeout: 30_000,        // 30s max per test
  expect: {
    timeout: 5_000,       // 5s for assertions
  },
  use: {
    actionTimeout: 10_000, // 10s per action
  },
});
```

---

<progress_append>
After creating test strategy or running tests:

```markdown
## YYYY-MM-DD HH:MM — /arc:testing
**Task:** [Create strategy / Run tests / Fix failing]
**Feature:** [What was tested]
**Coverage:**
- Unit: [N] tests
- Integration: [N] tests
- E2E: [N] tests
**Auth:** [Clerk/WorkOS/none]
**Result:** [All passing / X failing]
**Next:** [Fix failures / Done]

---
```
</progress_append>

<success_criteria>
Test strategy is complete when:
- [ ] Risk assessment done
- [ ] Unit test cases identified
- [ ] Integration test cases identified (with mocking plan)
- [ ] E2E test cases identified (with auth setup if needed)
- [ ] Specialist agents dispatched
- [ ] All tests written and passing
- [ ] Coverage gaps noted
</success_criteria>
