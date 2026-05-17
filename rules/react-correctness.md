# React Correctness Rules

Scope: React and Next.js apps. Pass to `daniel-product-engineer`, `lee-nextjs-engineer`, `security-engineer`, and `senior-engineer` during audits.

## Keys & Rendering

- MUST: Use stable unique IDs as `key`, not array index — index keys cause state bugs on reorder/insert/delete
  - Exception: Static lists generated from `Array.from()` placeholders where items never reorder
- MUST NOT: Use `&&` with numbers for conditional rendering — `{count && <Badge />}` renders `0`
  - FIX: `{count > 0 ? <Badge /> : null}`

## State & Effects

The guiding question: **does this code run because the component was displayed, or because of a specific user interaction?** Only the former belongs in an Effect. If no external system is involved, you probably don't need an Effect.

### Derived state — compute during render, not in effects

- MUST NOT: Use `useEffect` + `setState` to compute values from other state/props — calculate inline:
  ```ts
  // Wrong — unnecessary effect + extra re-render
  const [fullName, setFullName] = useState('');
  useEffect(() => setFullName(`${first} ${last}`), [first, last]);

  // Right — derive during render (no state, no effect, no memo)
  const fullName = `${first} ${last}`;
  ```
- SHOULD: Only reach for `useMemo` when the computation is genuinely expensive (≥1ms measured with `console.time`):
  ```ts
  const visibleTodos = useMemo(
    () => getFilteredTodos(todos, filter),
    [todos, filter],
  );
  ```

### Reset state with `key`, not effects

- MUST NOT: Clear state in an effect when a prop changes — causes a flash of stale UI before the effect fires:
  ```ts
  // Wrong — renders stale comment, then clears
  useEffect(() => { setComment(''); }, [userId]);

  // Right — React resets all state when key changes
  <Profile userId={userId} key={userId} />
  ```

### Adjust partial state by storing IDs

- MUST NOT: Reset a selection in an effect when items change:
  ```ts
  // Wrong
  useEffect(() => { setSelection(null); }, [items]);

  // Right — store the ID, derive the object during render
  const [selectedId, setSelectedId] = useState(null);
  const selection = items.find(item => item.id === selectedId) ?? null;
  ```

### Event handler logic belongs in event handlers

- MUST NOT: Move shared logic into an effect because multiple handlers need it — extract a plain function instead:
  ```ts
  // Wrong — runs on every state change, not just user actions
  useEffect(() => {
    if (product.isInCart) showNotification('Added!');
  }, [product]);

  // Right — call from each handler
  function buyProduct() {
    addToCart(product);
    showNotification('Added!');
  }
  ```
- MUST NOT: Route form submissions or mutations through state + effect — call the API directly from the event handler:
  ```ts
  // Wrong
  const [payload, setPayload] = useState(null);
  useEffect(() => {
    if (payload !== null) post('/api/register', payload);
  }, [payload]);

  // Right
  function handleSubmit() { post('/api/register', formData); }
  ```

### No effect chains (dominoes)

- MUST NOT: Chain effects where each sets state that triggers the next — consolidate into one event handler:
  ```ts
  // Wrong — three effects, three extra renders
  useEffect(() => { if (card?.gold) setGoldCardCount(c => c + 1); }, [card]);
  useEffect(() => { if (goldCardCount > 3) { setRound(r => r + 1); setGoldCardCount(0); } }, [goldCardCount]);
  useEffect(() => { if (round > 5) setIsGameOver(true); }, [round]);

  // Right — derive what you can, consolidate the rest
  const isGameOver = round > 5;
  function handlePlaceCard(nextCard) {
    // all game logic in one handler
  }
  ```

### Notify parents in handlers, not effects

- MUST NOT: Call an `onChange` callback inside an effect after updating local state — causes an extra render cycle:
  ```ts
  // Wrong
  useEffect(() => { onChange(isOn); }, [isOn, onChange]);

  // Right — update both in the same handler
  function handleToggle() {
    const next = !isOn;
    setIsOn(next);
    onChange(next);
  }
  ```
- SHOULD: Prefer lifting state to the parent entirely (fully controlled component) over syncing via callbacks.

### Parent owns data, passes it down

- MUST NOT: Fetch data in a child, then send it up via a callback effect — this inverts React's data flow:
  ```ts
  // Wrong
  function Child({ onFetched }) {
    const data = useSomeAPI();
    useEffect(() => { if (data) onFetched(data); }, [onFetched, data]);
  }

  // Right — parent fetches, passes down as props
  ```

### External store subscriptions

- MUST: Use `useSyncExternalStore` for subscribing to browser APIs or third-party stores — not manual `addEventListener` in an effect:
  ```ts
  // Wrong
  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { /* cleanup */ };
  }, []);

  // Right
  const isOnline = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true, // server snapshot
  );
  ```

### Effect stability and cleanup

- MUST: Clean up effects that subscribe, listen, observe, poll, or start timers.
- MUST NOT: Put freshly-created mutable objects or arrays in an effect dependency list. Stabilize the value or move the logic so the effect represents a real external synchronization.
- SHOULD: Use React 19 Effect Events or stable refs for effect-only callbacks that should see latest values without retriggering the subscription effect.

### App initialization

- SHOULD: Run one-time startup logic at module scope, not in a component effect (Strict Mode runs effects twice):
  ```ts
  // Right — runs once at module load
  if (typeof window !== 'undefined') {
    checkAuthToken();
    loadDataFromLocalStorage();
  }
  ```

### General state rules

- SHOULD: Consolidate 3+ related `useState` calls into `useReducer` or a single state object
- SHOULD: Batch multiple `setState` calls in one handler into a single update (React 18+ batches automatically in most cases, but verify in async callbacks)
- MUST NOT: Fetch data in `useEffect` — use React Query, SWR, or server components instead
- MUST NOT: Mutate React state or props directly. Create a new object/array and set it.
- SHOULD: Use functional `setState` when the next value depends on the previous value.

## Naming & Structure

- SHOULD: Name event handlers by what they do, not what they handle:
  - Wrong: `handleClick`, `handleChange`
  - Right: `handleSubmitOrder`, `handleUpdateQuantity`
- SHOULD: Break components over 250 lines into smaller focused components
- MUST NOT: Use inline render functions in JSX (`{renderItems()}`) — extract to a named component
  - Inline render functions don't get their own reconciliation boundary, causing unnecessary re-renders of siblings

## Security

- MUST NOT: Use `eval()`, `new Function()`, or string-argument `setTimeout`/`setInterval` — code injection risk
- MUST NOT: Hardcode secrets in source — detected by variable name patterns: `API_KEY`, `SECRET`, `TOKEN`, `PASSWORD`, `PRIVATE_KEY`
  - FIX: Use environment variables via `process.env` or `.env` files
- MUST: Flag every `dangerouslySetInnerHTML` usage for security review — ensure input is sanitized (DOMPurify or equivalent)

## Server Components & Actions (Next.js)

- MUST NOT: Make client components async — `"use client"` components cannot be async (they return a Promise, not JSX)
- MUST: Add auth check at the top of every server action — `auth()`, `getSession()`, or equivalent before any data mutation
- SHOULD: Use `next/image` instead of `<img>` — provides automatic optimization, lazy loading, and layout shift prevention
- SHOULD: Use `next/link` instead of `<a>` for internal navigation — enables client-side transitions and prefetching
- SHOULD: Use `next/font` instead of `<link>` Google Font tags — eliminates layout shift from font loading

## Error Handling

- MUST: Wrap async operations in try/catch with meaningful error handling — no empty catch blocks
- SHOULD: Add error boundaries around feature sections that can fail independently
- MUST NOT: Silently swallow errors — at minimum log them; prefer surfacing to the user
