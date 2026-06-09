# Testing

## Strategy

- MUST: Write unit tests for core logic.
- SHOULD: Write integration tests for features that cross boundaries.
- MUST: Write E2E tests with Playwright for critical user flows.
- SHOULD: Co-locate test files with source or use `__tests__` directories consistently.
- SHOULD: Run `pnpm test` before merging.

## Commands

| Scope | Unit | E2E |
|-------|------|-----|
| Single app | `pnpm test` | `pnpm test:e2e` |
| Monorepo (all) | `pnpm test` | — |
| Monorepo (scoped) | `pnpm --filter <pkg> test` | `pnpm --filter <app> test:e2e` |

## Vitest

- MUST: Use Vitest for unit and integration tests.
- SHOULD: Use Browser Mode (`@vitest/browser-playwright`) for component tests that need a real DOM.
- SHOULD: Use `expect.element()` with `toBeInViewport()` for visibility assertions in browser mode.

### Vitest Gotchas

- MUST: Always `await` or `return` promises in tests. Forgetting causes tests to exit before assertions run (silent false pass).
- MUST: Use `vi.hoisted()` for variables referenced inside `vi.mock()` — mock calls are hoisted above imports, so normal `const` declarations aren't available yet.
- MUST: Use `vi.mocked(fn)` to access mock methods with full TypeScript types instead of casting.
- SHOULD: Use `happy-dom` over `jsdom` for component tests — significantly faster, sufficient for most cases.
- SHOULD: Use `vi.useFakeTimers()` for time-dependent code (debounce, throttle, setTimeout). Call `vi.useRealTimers()` in `afterEach`.
- SHOULD: Use `expect.assertions(N)` in async tests to catch cases where assertions never execute.
- SHOULD: Use `// @vitest-environment jsdom` comment to override environment per file when most tests use `node`.
- SHOULD: Use `--shard=1/N` in CI to distribute tests across parallel runners.

## Playwright

- MUST: Use `data-testid` attributes for E2E selectors.
- MUST: Use kebab-case for test IDs, matching component filenames. See [react.md](react.md).
- NEVER: Select by text content, CSS classes, or DOM structure — these change frequently.
- SHOULD: Use semantic locators (`getByRole`, `getByLabel`) for accessible elements.
- SHOULD: Prefix child element test IDs with the parent component name.

### Playwright Gotchas

- MUST: Wait for hydration before interacting in Next.js apps. Clicking before hydration completes causes missed event handlers. Use `page.waitForFunction(() => document.readyState === 'complete')` or wait for a known interactive element.
- MUST: Use `--trace on` in CI for failed test debugging. Trace viewer shows timeline, screenshots, DOM snapshots, and network — essential for diagnosing CI-only failures.
- SHOULD: Authenticate via API calls in `globalSetup`, not UI login flows. API auth takes ~100ms vs 2-5s for UI login per worker.
- SHOULD: Store auth state with `storageState` and load it per worker for parallel test isolation.
- SHOULD: Use `--shard=1/N` to distribute E2E tests across CI machines.
- SHOULD: Block unnecessary requests (analytics, tracking pixels, images) with `page.route()` + `route.abort()` to speed up tests.
- SHOULD: Use `expect.soft()` for non-blocking assertions when you want to collect multiple failures in one run.

## E2E with External APIs

Tests that hit real external APIs MUST run — don't skip them because "no live API". Use fail-fast patterns to control cost:

- MUST: Run E2E tests against real APIs for critical flows. Mocks hide real failures.
- MUST: Use aggressive timeouts (15s max for API calls, 30s max per test).
- MUST: Run AI/LLM-dependent tests serially (`test.describe.configure({ mode: "serial" })`).
- MUST: Set `retries: 0` for API-dependent tests — no burning credits on flaky upstream.
- SHOULD: Include an API health check as the first test to abort early if service is down.
- SHOULD: Centralize timeout constants (`TIMEOUT.API_RESPONSE`, `TIMEOUT.PAGE_LOAD`).

## Test Quality

- SHOULD: Use MSW for API mocking in integration tests, not manual fetch stubs.

## Mocking Boundaries

Mock at system boundaries. Never mock your own code.

**Litmus test:** Would a different implementation producing the same behavior still pass this test? If not, you're testing implementation.

### Where to Mock

| Boundary | Mock Tool | Example |
|----------|-----------|---------|
| External HTTP APIs | MSW (`http.get(...)`) | Third-party REST/GraphQL services |
| Database | Test database or in-memory adapter | Postgres, Redis, SQLite |
| Time | `vi.useFakeTimers()` | Debounce, expiry, scheduled jobs |
| File system | `memfs` or temp directories | File uploads, log writing |
| Randomness | Seeded values or `vi.spyOn(Math, 'random')` | UUIDs, tokens, shuffling |
| Environment | `vi.stubEnv()` | `NODE_ENV`, feature flags |

### Where NOT to Mock

| Don't Mock | Do This Instead |
|------------|-----------------|
| Your own modules (`vi.mock('./utils')`) | Import and call the real code |
| Internal collaborators | Use dependency injection, test through the public API |
| Simple data transformations | Test input → output directly |
| Framework internals (React, Next.js) | Use testing-library, render real components |

### Rules

- MUST: Mock only at system boundaries — external APIs, databases, time, file system, randomness.
- NEVER: Mock your own modules or internal collaborators. If you need `vi.mock('./my-module')`, your design needs dependency injection instead.
- SHOULD: Design APIs as SDK-style interfaces (`{ getUser, createOrder }`) that accept a client parameter, not hardcoded `fetch` calls.
- SHOULD: Accept dependencies as parameters — functions that take a `db` or `client` argument are trivially testable with real or fake implementations.
- SHOULD: Prefer fakes (simplified real implementations) over mocks when a boundary is complex. A fake in-memory store is more trustworthy than `vi.fn()` with `.mockResolvedValue()`.
