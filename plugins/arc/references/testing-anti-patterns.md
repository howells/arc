# Testing Anti-Patterns

Tests that pass but prove nothing. Each anti-pattern includes a litmus test: **Would a different implementation producing the same behavior still pass?** If the answer is no, the test is coupled to implementation.

## 1. Testing Mocks Instead of Behavior

The test verifies that a mock was called, not that the system produced the right outcome.

<Bad>

```typescript
test("creates user", async () => {
  const mockDb = { insert: vi.fn().mockResolvedValue({ id: "1" }) };
  await createUser(mockDb, { name: "Alice" });

  expect(mockDb.insert).toHaveBeenCalledWith("users", { name: "Alice" });
});
```

Tests that `insert` was called with specific args. Refactor `createUser` to batch inserts? Test breaks, even if behavior is identical.

</Bad>

<Good>

```typescript
test("creates user", async () => {
  const db = createTestDb();
  await createUser(db, { name: "Alice" });

  const user = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);
  expect(user).toMatchObject({ name: "Alice" });
});
```

Tests observable outcome — a user exists in the database. Implementation can change freely.

</Good>

## 2. Verifying Through Implementation Instead of Interface

The test checks internal state instead of using the public API to observe results.

<Bad>

```typescript
test("adds item to cart", () => {
  const cart = new Cart();
  cart.add({ id: "abc", price: 10 });

  // Reaching into internals
  expect(cart._items).toHaveLength(1);
  expect(cart._items[0].id).toBe("abc");
});
```

Breaks if `_items` is renamed, restructured, or made truly private.

</Bad>

<Good>

```typescript
test("adds item to cart", () => {
  const cart = new Cart();
  cart.add({ id: "abc", price: 10 });

  expect(cart.getItems()).toHaveLength(1);
  expect(cart.getTotal()).toBe(10);
});
```

Uses the public interface. Any implementation that maintains the same behavior passes.

</Good>

## 3. Mocking Internal Collaborators

Using `vi.mock()` on your own modules instead of testing through the real code path.

<Bad>

```typescript
vi.mock("./email-service", () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

test("registers user and sends welcome email", async () => {
  await registerUser({ email: "alice@test.com" });

  expect(sendEmail).toHaveBeenCalledWith("alice@test.com", "Welcome!");
});
```

If `sendEmail` signature changes, this test still passes — it's testing the mock, not real integration. The mock also hides bugs where `registerUser` passes wrong arguments.

</Bad>

<Good>

```typescript
test("registers user and sends welcome email", async () => {
  const emailsSent: Array<{ to: string; subject: string }> = [];
  const emailService = {
    sendEmail: async (to: string, subject: string) => {
      emailsSent.push({ to, subject });
    },
  };

  await registerUser({ email: "alice@test.com" }, { emailService });

  expect(emailsSent).toEqual([{ to: "alice@test.com", subject: "Welcome!" }]);
});
```

Dependency injection with a simple fake. Tests real code path. Signature changes break the test correctly.

</Good>

## 4. Adding Test-Only Methods to Production Code

Exposing internals solely for testing convenience.

<Bad>

```typescript
class OrderProcessor {
  private queue: Order[] = [];

  // Added just for tests
  _getQueueForTesting(): Order[] {
    return this.queue;
  }

  async process(order: Order) {
    this.queue.push(order);
    // ... processing logic
  }
}
```

Production code now carries test baggage. The underscore convention doesn't prevent misuse.

</Bad>

<Good>

```typescript
class OrderProcessor {
  private queue: Order[] = [];

  async process(order: Order) {
    this.queue.push(order);
    // ... processing logic
  }

  getStatus(orderId: string): OrderStatus {
    // This is useful for production AND testing
    return this.queue.find((o) => o.id === orderId)?.status ?? "unknown";
  }
}
```

If the only way to observe behavior is through a test-only method, the class is missing a real feature. Add the method that production code also needs.

</Good>

## 5. Asserting Call Counts on Mocks

Verifying HOW MANY TIMES something was called instead of WHAT HAPPENED.

<Bad>

```typescript
test("processes batch", async () => {
  const mockProcessor = vi.fn();
  await processBatch(items, mockProcessor);

  expect(mockProcessor).toHaveBeenCalledTimes(3);
});
```

Test breaks if implementation switches from sequential to parallel, or batches calls differently. The user doesn't care about call count — they care that all items were processed.

</Bad>

<Good>

```typescript
test("processes batch", async () => {
  const results = await processBatch(items, processItem);

  expect(results).toEqual([
    { id: "1", status: "done" },
    { id: "2", status: "done" },
    { id: "3", status: "done" },
  ]);
});
```

Tests the outcome. Sequential, parallel, batched — doesn't matter as long as all items are processed correctly.

</Good>

## 6. Shallow Tests That Never Fail

Tests that render a component but assert nothing meaningful.

<Bad>

```typescript
test("renders without crashing", () => {
  render(<Dashboard />);
});

test("matches snapshot", () => {
  const { container } = render(<Dashboard />);
  expect(container).toMatchSnapshot();
});
```

"Renders without crashing" passes for an empty `<div>`. Snapshots fail on every change and get auto-updated without review.

</Bad>

<Good>

```typescript
test("shows loading state while data fetches", () => {
  render(<Dashboard />);
  expect(screen.getByRole("status")).toHaveTextContent("Loading");
});

test("displays user metrics after loading", async () => {
  render(<Dashboard />);
  expect(await screen.findByText("Active Users: 42")).toBeInTheDocument();
});
```

Tests specific, observable behavior. These tests fail when real functionality breaks, not when CSS changes.

</Good>

## 7. Tautological Test

The expected value is recomputed with the same logic under test, so the assertion can never disagree with the code.

<Bad>

```typescript
test("adds two numbers", () => {
  const a = 2;
  const b = 3;

  expect(add(a, b)).toBe(a + b);
});
```

The expected value is computed with the same arithmetic as `add`. Any implementation — including a broken one that mirrors this exact math — passes.

</Bad>

<Good>

```typescript
test("adds two numbers", () => {
  expect(add(2, 3)).toBe(5);
});
```

The expected value is a literal from an independent source of truth. A broken `add` can't accidentally satisfy it.

</Good>
