---
name: testing
description: |
  Characterization testing and safety-net backfill for existing code. Use when legacy,
  under-tested, or risky code needs tests before a refactor, bug fix, or behavior change.
  Captures current behavior through public interfaces, identifies coverage gaps, and adds
  focused unit, integration, or E2E tests without replacing TDD implementation workflows.
license: MIT
metadata:
  author: howells
website:
  order: 10
  desc: Backfill safety-net tests
  summary: Add focused tests around existing code before changing it. Characterizes current behavior, finds coverage gaps, and creates a safety net for refactors or risky fixes.
  what: |
    Testing is for old or under-tested code that needs a safety net before you touch it. It discovers the public behavior, runs the current suite, identifies the riskiest gaps, then adds focused characterization tests one vertical slice at a time. It can use unit, integration, and E2E tests, but only where they protect real behavior.
  why: |
    New feature work already belongs in /arc:implement and its TDD loop. This skill brings something different: it makes existing behavior observable before refactoring or changing fragile code, so you know whether later edits preserved behavior or intentionally changed it.
  decisions:
    - This is not the default path for new feature TDD. Use /arc:implement for that.
    - Characterize through public interfaces first. Tests should protect behavior users or callers can observe.
    - Add tests in vertical slices. Avoid broad horizontal plans that write every test outline before proving any one behavior.
    - Use the smallest useful test level. Prefer unit or integration tests unless only an E2E flow proves the risk.
    - Existing behavior tests may pass immediately; prove they are sensitive before trusting them.
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

# Characterization Testing Workflow

Backfill focused tests around existing code before a risky change. The goal is not "more tests" in the abstract; it is a trustworthy safety net around behavior that must survive a refactor, migration, or bug fix.

Use this skill when:

- Existing code has little or no test coverage.
- A refactor needs a behavior-preserving safety net first.
- A god file, duplicated implementation, or tangled module needs characterization before decomposition.
- A performance optimization needs current behavior pinned before changing data structures, batching, memoization, caching, or ordering.
- A bug fix touches unclear behavior and you need to capture the current contract before changing it.
- Coverage reports show gaps around important public behavior.
- Auth, API, state, or browser flows need targeted tests before launch or audit remediation.

Do not use this skill as the normal new-feature workflow. For new work, use `/arc:implement` or a dedicated TDD skill so RED/GREEN/REFACTOR remains the governing loop.

<required_reading>
**Read before testing:**

1. `references/testing-patterns.md` — Test philosophy, vitest/playwright patterns
2. `references/testing-anti-patterns.md` — What weak or misleading tests look like
3. `rules/testing.md` — Arc testing conventions
4. `disciplines/change-impact-testing.md` — Blast radius analysis for code changes
5. `references/llm-api-testing.md` — If testing LLM integrations
6. `references/maintainability-review.md` — If tests are being added before decomposing a god file or tangled module
7. `references/complexity-optimization.md` — If tests are being added before optimizing algorithmic complexity, rendering churn, or N+1 behavior
   </required_reading>

## Agents

Use specialist agents only when the slice is large enough to justify delegation:

| Agent                     | Model  | Purpose                                                           | Framework    |
| ------------------------- | ------ | ----------------------------------------------------------------- | ------------ |
| `unit-test-writer`        | sonnet | Characterize pure functions, hooks, or isolated components        | vitest       |
| `integration-test-writer` | sonnet | Characterize API, auth, state, and component integration behavior | vitest + MSW |
| `e2e-test-writer`         | opus   | Characterize critical browser journeys                            | Playwright   |
| `test-runner`             | haiku  | Run unit/integration suites and analyze failures                  | vitest       |
| `e2e-runner`              | opus   | Run Playwright, inspect screenshots/traces, iterate on failures   | Playwright   |

<rules_context>
**Check for project testing rules:**

**Use Glob tool:** `.ruler/testing.md`

If it exists, read it for MUST/SHOULD/NEVER constraints.

**Detect test framework:**

| File                   | Framework                      |
| ---------------------- | ------------------------------ |
| `vitest.config.*`      | vitest                         |
| `jest.config.*`        | jest                           |
| `playwright.config.*`  | Playwright                     |
| `package.json` scripts | Project-specific test commands |

</rules_context>

## Process

### Step 1: Confirm The Safety-Net Target

Ask one question only if the target is unclear:

```
AskUserQuestion:
  question: "What existing code or behavior needs a safety net before we change it?"
  header: "Test Target"
  options:
    - label: "A specific file/module"
      description: "Point me at the file, component, or module you're about to change"
    - label: "A route or API surface"
      description: "An endpoint, page, or public interface whose behavior must survive the change"
    - label: "A user flow"
      description: "An end-to-end journey (auth, checkout, signup) that needs pinning before a refactor"
    - label: "Something else"
      description: "Describe the behavior or blast radius you want protected"
```

Then identify:

- The files, routes, packages, components, or commands involved.
- The planned change or refactor the tests must protect.
- The public interfaces where behavior is observable.
- Any business-critical, auth, persistence, payment, data, or browser-flow risk.
- Any ordering, duplication, identity, mutability, pagination, permission, cache invalidation, or tenant/filtering behavior that an optimization must preserve.

### Step 2: Establish The Baseline

Gather evidence before writing tests:

- Read the target code and nearby tests.
- Read recent commits or plans when they explain the intended behavior.
- Run the smallest existing relevant test command.
- If no test command exists, identify the project’s likely framework and package manager.
- Note current failures separately from new failures.

Do not silently fix production behavior during baseline work. If you discover an obvious bug, capture it as either:

- A current-behavior characterization test if the change is meant to preserve it.
- A failing desired-behavior test if the user is asking for the bug to be fixed.

### Step 3: Map Public Behavior

List behavior in terms of callers or users, not internal implementation details:

```markdown
## Safety Net: [Target]

### Planned Change

- [Refactor / bug fix / migration / cleanup]

### Public Interfaces

- [Function/component/API route/page/CLI command]

### Current Observable Behavior

| Behavior   | Evidence                                       | Risk              |
| ---------- | ---------------------------------------------- | ----------------- |
| [behavior] | [code path, existing test, manual observation] | [high/medium/low] |

### Test Slices

| Slice          | Level                  | Why this level         |
| -------------- | ---------------------- | ---------------------- |
| [one behavior] | [unit/integration/e2e] | [fastest useful proof] |
```

### Step 4: Add Tests One Vertical Slice At A Time

For each slice:

1. Choose one public behavior.
2. Choose the smallest useful test level.
3. Write the test.
4. Run only the relevant test.
5. Prove the test is sensitive:
   - For current-behavior characterization, the test may pass immediately. Temporarily perturb the assertion, fixture, or input to prove it fails for the right reason, then restore it.
   - For desired behavior or bug fixes, follow RED/GREEN/REFACTOR. Do not change production code before the failing test exists.
6. Commit no temporary mutations.
7. Move to the next slice only after the current slice is trustworthy.

### Step 5: Keep Test Seams Small

If existing code is hard to test:

- Prefer testing through an existing public interface.
- Extract only the smallest seam needed to observe behavior.
- Preserve behavior while extracting.
- Avoid large refactors before the safety net exists.
- Avoid mocking internal modules just to force a unit test.

Mocks are acceptable for true boundaries: network, time, filesystem, database, auth providers, payment providers, and external LLM APIs. Prefer real code inside the project boundary.

### Step 6: Run Scoped Then Broader Verification

Run checks in widening order:

1. The single new test file or test name.
2. The relevant package or feature test suite.
3. The project’s normal test command.
4. E2E only when the risk is browser-level or cross-system.

When E2E output is verbose or flaky, dispatch `e2e-runner` with the exact test file and failure evidence.

### Step 7: Report The Safety Net

End with a concise report:

```markdown
## Safety Net Result

**Target:** [code/feature]
**Reason:** [refactor/bug fix/legacy coverage/launch risk]
**Tests added:** [files]
**Behavior characterized:**

- [behavior]

**Verification:**

- [command] — [pass/fail]

**Remaining risk:**

- [untested behavior or reason it was deferred]

**Ready for next change:** [yes/no]
```

## Mastra Agent Surfaces

If a Mastra agent surface is detected (`packages/mastra`, or `@mastra/*` in `package.json`), the useful safety net is often an eval/golden-set, not a conventional characterization test. Offer to load `references/agent-evals.md` and backfill an eval/golden-set that pins current agent behavior (expected outputs, tool-call shape, scorers) before the agent is changed.

## Choosing Test Level

| Level       | Use when                                                                          | Avoid when                                                              |
| ----------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Unit        | Pure functions, deterministic formatting, isolated hooks, small state transitions | Behavior depends on routing, browser, API, auth, or multiple components |
| Integration | Component + state, API routes, auth states, form submissions, data adapters       | A single pure function is enough or only a real browser proves it       |
| E2E         | Critical user journeys, auth flows, checkout/signup, routing/browser behavior     | The behavior can be proven faster below the browser                     |

### Coverage Guidelines

| Feature Type      | First Useful Backfill          | Notes                                                                |
| ----------------- | ------------------------------ | -------------------------------------------------------------------- |
| Utility functions | Unit                           | Cover edge cases and invariants through exported functions           |
| UI components     | Integration                    | Prefer user-visible behavior over snapshots                          |
| Forms             | Integration                    | Add E2E only for critical end-to-end flows                           |
| API routes        | Integration                    | Exercise request/response behavior and error paths                   |
| Auth flows        | Integration + selective E2E    | Mock provider states below browser; use real/browser flow sparingly  |
| Checkout/payment  | Integration + E2E              | Mock external provider below browser; keep one critical browser path |
| LLM integrations  | Unit/integration with fixtures | Avoid live calls unless explicitly required                          |

## Auth Testing Quick Reference

Use this only when auth behavior is part of the safety net.

### Clerk Testing

**Integration tests:**

- Mock `useAuth` and `useUser` hooks.
- Test loading, signed-in, and signed-out states.
- Mock `getToken` for API calls.

**E2E tests:**

- Create `tests/auth.setup.ts` for login flow.
- Store session in `playwright/.auth/user.json`.
- Use `storageState` in `playwright.config.ts`.

**Common issues:**

- Trying to mock `ClerkProvider` instead of hooks.
- Missing the `isLoaded: false` state.
- Hardcoding tokens instead of using a `getToken` mock.

### WorkOS Testing

**Integration tests:**

- Mock `getUser` from `@workos-inc/authkit-nextjs`.
- Test with full user object including `organizationId`, `role`, and `permissions`.
- Test SSO redirect behavior.

**E2E tests:**

- SSO flows are slow; consider a test bypass endpoint.
- Create `/api/auth/test-login` for faster auth in test environments only.
- Store session state after auth.

**Common issues:**

- Missing `organizationId` in org-level features.
- Not testing permission checks.
- SSO redirect timing issues without proper waits.

### Bypass Auth For Speed

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

## Fail-Fast Configuration

Tests must fail fast. Never:

- Use global timeouts of minutes.
- Add many retries to mask flakiness.
- Use arbitrary sleeps.

**Playwright config:**

```typescript
export default defineConfig({
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    actionTimeout: 10_000,
  },
});
```

---

<success_criteria>
The safety-net pass is complete when:

- [ ] Target behavior and planned change are clear
- [ ] Current relevant test baseline is known
- [ ] Public interfaces are identified
- [ ] Highest-risk behavior has focused tests
- [ ] New characterization tests were proven sensitive
- [ ] Scoped and relevant broader checks were run
- [ ] Remaining untested risks are stated plainly
      </success_criteria>
