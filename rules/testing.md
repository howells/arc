# Testing

- MUST: Write unit tests for core logic.
- SHOULD: Write integration tests for core logic.
- MUST: Write E2E tests with Playwright under `e2e/` or `apps/<app>/e2e/` for critical flows.
- SHOULD: Co-locate test files with source or use `__tests__` directories consistently.
- SHOULD: Run `pnpm test` (workspace-wide) or package-scoped tests before merging.

## Commands

Single app:
- `pnpm test` — run unit tests (vitest)
- `pnpm test:e2e` — run E2E tests (playwright)

Monorepo:
- `pnpm test` — run all tests across packages
- `pnpm --filter <pkg> test` — run tests for specific package
- `pnpm --filter <app> test:e2e` — run E2E tests for specific app

## Vitest 4.0+

Key features in Vitest 4:

- **Browser Mode (stable)** — Real browser testing, not JSDOM
- **Visual Regression Testing** — Built-in screenshot comparison
- **Playwright Traces** — `--browser.trace=on` for debugging
- **`toBeInViewport` matcher** — Assert element visibility

For component tests in real browsers:
```bash
pnpm add -D vitest @vitest/browser-playwright
```

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: "playwright",
      instances: [{ browser: "chromium" }],
    },
  },
});
```

## Playwright 1.57+

Key features:

- **Chrome for Testing** — Uses Chrome instead of Chromium on non-ARM
- **Node.js 18+** — Node 16 removed, 18 deprecated
- **`wait` field** — Regex matching for webServer readiness
- **Playwright Agents** — AI-assisted test generation

### Test IDs

- MUST: Use `data-testid` attributes for E2E test selectors.
- MUST: Configure Playwright to use `testid` as the attribute name.
- NEVER: Select by text content, CSS classes, or DOM structure—these change frequently.
- SHOULD: Use semantic locators (`getByRole`, `getByLabel`) for accessible elements.

```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  use: {
    testIdAttribute: "data-testid",
  },
});
```

In components:
```tsx
<button data-testid="submit-button">Submit</button>
<div data-testid="user-profile">{user.name}</div>
```

In tests:
```ts
// Preferred: test IDs for custom elements
await page.getByTestId("submit-button").click();
await expect(page.getByTestId("user-profile")).toContainText("John");

// Also good: semantic locators for standard elements
await page.getByRole("button", { name: "Submit" }).click();
await page.getByLabel("Email").fill("user@example.com");
```

### Generate tests interactively:
```bash
npx playwright codegen http://localhost:4000
```

### webServer with regex wait:
```ts
// playwright.config.ts
export default defineConfig({
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:4000",
    wait: /ready on/i, // Regex match on stdout
    reuseExistingServer: !process.env.CI,
  },
});
```

## Component Testing

**Vitest Browser Mode** — Unit/component tests in real browser:
```tsx
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Button } from "./button";

test("renders button", async () => {
  render(<Button>Click me</Button>);
  await expect.element(screen.getByRole("button")).toBeInViewport();
});
```

**Playwright Component Testing** — E2E-style component tests:
```bash
pnpm add -D @playwright/experimental-ct-react
```

Both support React 19.
