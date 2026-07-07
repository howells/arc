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

> Code examples for these live in [testing-patterns.md](../references/testing-patterns.md) `<vitest_gotchas>` — the single source. Keep this list to the one-line rules.

- MUST: Always `await`/`return` promises in tests (forgetting = silent false pass).
- MUST: Use `vi.hoisted()` for variables referenced inside `vi.mock()`.
- MUST: Use `vi.mocked(fn)` for typed access to mock methods instead of casting.
- SHOULD: Prefer `happy-dom` over `jsdom` for component tests (faster).
- SHOULD: Use `vi.useFakeTimers()` for time-dependent code; restore with `vi.useRealTimers()` in `afterEach`.
- SHOULD: Use `expect.assertions(N)` in async tests to catch skipped assertions.
- SHOULD: Use `// @vitest-environment jsdom` to override environment per file.
- SHOULD: Use `--shard=1/N` in CI to distribute tests across runners.

## Playwright

- MUST: Use `data-testid` attributes for E2E selectors.
- MUST: Use kebab-case for test IDs, matching component filenames. See [react.md](react.md).
- NEVER: Select by text content, CSS classes, or DOM structure — these change frequently.
- SHOULD: Use semantic locators (`getByRole`, `getByLabel`) for accessible elements.
- SHOULD: Prefix child element test IDs with the parent component name.

### Playwright Gotchas

> Code examples live in [testing-patterns.md](../references/testing-patterns.md) `<playwright_gotchas>` — the single source. Keep this list to the one-line rules.

- MUST: Wait for hydration before interacting in Next.js apps.
- MUST: Use `--trace on` (or `on-first-retry`) in CI for failed-test debugging.
- SHOULD: Authenticate via API in `globalSetup`, not UI login (~100ms vs 2-5s per worker).
- SHOULD: Store auth with `storageState` and load per worker for parallel isolation.
- SHOULD: Use `--shard=1/N` to distribute E2E tests across CI machines.
- SHOULD: Block unnecessary requests (analytics, images) with `page.route()` + `route.abort()`.
- SHOULD: Use `expect.soft()` for non-blocking assertions to collect multiple failures.

## E2E with External APIs

Scope note: this section covers real-API E2E for critical flows. Unit and integration tests mock these same boundaries instead — see [Mocking Boundaries](#mocking-boundaries) below.

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

Scope note: this section covers unit/integration tests. Critical E2E flows deliberately hit real external APIs instead of mocking them — see [E2E with External APIs](#e2e-with-external-apis) above.

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
