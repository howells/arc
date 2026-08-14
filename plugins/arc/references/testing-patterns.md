<overview>
Evidence is mandatory; its form follows the task's work kind. Behavior and bug fixes use
test-first evidence at an agreed seam. Refactors, artifacts, deployments, and documentation
use the evidence that can actually prove their outcome without manufacturing a synthetic red
test. Framework patterns below remain available when automated tests are the right evidence.
</overview>

<seams>
## Agreed observable seams

A seam is the observable boundary through which evidence proves behavior. It may be an
existing internal interface, API, UI flow, command, or integration contract; it does not need
to become a newly exported public API.

A seam is agreed when it is named in an approved spec/plan, declared before implementation
against an existing observable interface, or confirmed by the user when it introduces a new
public or architectural boundary. New plans register seams using the XML contract in
`references/task-granularity.md`.
</seams>

<evidence_by_kind>

## Evidence by work kind

| Kind            | Required evidence                                                                                                                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `behavior`      | Write an assertion at an agreed seam, watch it fail for the missing behavior, implement, then watch it pass.                                                                                                                     |
| `bugfix`        | Reproduce the defect at the seam, verify the expected failure, fix it, then keep the regression green.                                                                                                                           |
| `integration`   | Use observable contract/integration evidence at a named seam. Require red only when local behavior changes and a meaningful pre-change failure can be demonstrated. Otherwise record the baseline and targeted passing evidence. |
| `refactor`      | Run affected tests before and after. Add characterization coverage only where behavior lacks a safety net (see the proportionality note below).                                                                                  |
| `artifact`      | Use build, package, generation, schema, or mechanical verification.                                                                                                                                                              |
| `deployment`    | Use authorized read-only smoke evidence. External mutation still requires authority.                                                                                                                                             |
| `documentation` | Use content and link validation where applicable.                                                                                                                                                                                |

Legacy auto tasks without `kind` use their existing verify/test guidance. Do not manufacture
a seam or red run solely because a legacy task lacks classification.

Proportionality note (refactor): on a Lean-assurance plan, when the cheapest honest
characterization harness would still exceed the change itself, the plan may substitute
mechanical verification plus a recorded before/after comparison — stating that choice and its
reason so the plan reviewer judges the tradeoff rather than the omission. Check runtime
built-ins first (`node:test`, `python -m unittest`): a harness they can carry costs nothing
and is not an exemption case.
</evidence_by_kind>

<detection>
**Detect test runner from project files:**

| File                   | Runner     |
| ---------------------- | ---------- |
| `vitest.config.ts`     | vitest     |
| `vitest.config.js`     | vitest     |
| `playwright.config.ts` | playwright |
| `jest.config.js`       | jest       |
| `cypress.config.ts`    | cypress    |

**Detect package manager:**

| File                | Manager | Command prefix |
| ------------------- | ------- | -------------- |
| `pnpm-lock.yaml`    | pnpm    | `pnpm`         |
| `yarn.lock`         | yarn    | `yarn`         |
| `package-lock.json` | npm     | `npm run`      |

</detection>

<vitest_patterns>
**File naming:** `[name].test.ts` or `[name].test.tsx`

**Basic test structure:**

```typescript
import { describe, it, expect } from "vitest";
import { myFunction } from "./my-function";

describe("myFunction", () => {
  it("should handle basic case", () => {
    const result = myFunction("input");
    expect(result).toBe("expected");
  });

  it("should handle edge case", () => {
    const result = myFunction("");
    expect(result).toBeNull();
  });
});
```

**React component test:**

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MyComponent } from "./my-component";

describe("MyComponent", () => {
  it("should render title", () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("should call onClick when button clicked", async () => {
    const onClick = vi.fn();
    render(<MyComponent onClick={onClick} />);

    await userEvent.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

**Commands:**

```bash
# Run all tests
pnpm vitest run

# Run single file
pnpm vitest run src/path/to/file.test.tsx

# Run matching tests
pnpm vitest run -t "should handle"

# Watch mode
pnpm vitest

# With coverage
pnpm vitest run --coverage
```

</vitest_patterns>

<vitest_gotchas>

## vi.mock() Hoisting

vi.mock() is hoisted above imports. Variables declared before the mock call aren't available inside it:

```typescript
// ❌ BROKEN — mockFn doesn't exist when vi.mock runs
const mockFn = vi.fn();
vi.mock("./module", () => ({ doThing: mockFn }));

// ✅ CORRECT — use vi.hoisted() for variables used in mocks
const { mockFn } = vi.hoisted(() => ({ mockFn: vi.fn() }));
vi.mock("./module", () => ({ doThing: mockFn }));
```

## Async False Positives

Forgetting to `await` an async assertion silently passes:

```typescript
// ❌ BROKEN — test passes even if assertion would fail
it("should reject", () => {
  expect(asyncFn()).rejects.toThrow(); // missing await!
});

// ✅ CORRECT
it("should reject", async () => {
  await expect(asyncFn()).rejects.toThrow();
});
```

## Fake Timers

```typescript
import { vi, beforeEach, afterEach } from "vitest";

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

it("should debounce", () => {
  const fn = vi.fn();
  const debounced = debounce(fn, 300);
  debounced();
  vi.advanceTimersByTime(300);
  expect(fn).toHaveBeenCalledOnce();
});
```

</vitest_gotchas>

<playwright_patterns>
**File naming:** `[name].spec.ts`

**Basic E2E test:**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test("should complete user flow", async ({ page }) => {
    // Navigate
    await page.goto("/feature");

    // Interact
    await page.getByRole("button", { name: "Start" }).click();

    // Fill form
    await page.getByLabel("Email").fill("test@example.com");

    // Submit
    await page.getByRole("button", { name: "Submit" }).click();

    // Assert
    await expect(page.getByText("Success")).toBeVisible();
  });
});
```

**With fixtures:**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Setup: login or seed data
    await page.goto("/login");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();
  });

  test("should show user data", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Welcome")).toBeVisible();
  });
});
```

**Commands:**

```bash
# Run all tests
pnpm playwright test

# Run single file
pnpm playwright test tests/feature.spec.ts

# Run matching tests
pnpm playwright test -g "should complete"

# With UI
pnpm playwright test --ui

# Debug mode
pnpm playwright test --debug

# Generate code
pnpm playwright codegen http://localhost:3000
```

</playwright_patterns>

<playwright_gotchas>

## Next.js Hydration

In Next.js apps, the server-rendered HTML is visible before client-side JavaScript hydrates event handlers. Clicking before hydration completes causes missed interactions:

```typescript
// ✅ Wait for a known interactive element before interacting
await page.goto("/dashboard");
await page.waitForFunction(() => document.readyState === "complete");
// Or wait for a specific interactive element:
await expect(page.getByRole("button", { name: "Save" })).toBeEnabled();
```

## Trace Viewer for CI

Enable traces for failed tests in CI — shows timeline, screenshots, DOM snapshots, and network:

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    trace: "on-first-retry", // or "on" for all
  },
});
```

```bash
# View traces locally
npx playwright show-trace test-results/trace.zip
```

## API Auth (Fast Setup)

Authenticate via API in globalSetup instead of UI login (~100ms vs 2-5s):

```typescript
// tests/auth.setup.ts
setup("authenticate", async ({ request }) => {
  const response = await request.post("/api/auth/test-login", {
    data: { email: process.env.TEST_USER_EMAIL },
  });
  // Save cookies for workers
  await request.storageState({ path: authFile });
});
```

</playwright_gotchas>

<tdd_cycle>
**Red-Green-Refactor:**

**1. RED - Write failing test first:**

```typescript
it("should calculate total with tax", () => {
  const result = calculateTotal(100, 0.1);
  expect(result).toBe(110);
});
```

Run: `pnpm vitest run -t "calculate total"`
Expected: FAIL (function doesn't exist)

**2. GREEN - Minimal implementation:**

```typescript
export function calculateTotal(amount: number, taxRate: number): number {
  return amount + amount * taxRate;
}
```

Run: `pnpm vitest run -t "calculate total"`
Expected: PASS

**3. REFACTOR - Improve if needed:**

```typescript
export function calculateTotal(amount: number, taxRate: number): number {
  const tax = amount * taxRate;
  return amount + tax;
}
```

Run: `pnpm vitest run -t "calculate total"`
Expected: Still PASS
</tdd_cycle>

<what_to_test>
**Unit tests (vitest):**

- Pure functions
- Business logic
- Data transformations
- Utility functions
- Hooks (with renderHook)
- Components (with testing-library)

**E2E tests (playwright):**

- Critical user flows
- Form submissions
- Navigation flows
- Authentication
- Error handling from user perspective

**Don't test:**

- Implementation details
- Third-party libraries
- Trivial getters/setters
- Framework behavior
  </what_to_test>
