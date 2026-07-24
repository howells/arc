# React Performance Rules

Scope: React and Next.js apps. Pass to `daniel-product-engineer`, `performance-engineer`, and `lee-nextjs-engineer` during audits.

## Memoization Defeats

Inline props on `React.memo`'d components silently defeat memoization. Every render creates a new reference:

- MUST NOT: Pass inline functions as props to memo'd children (`onClick={() => doThing()}`)
- MUST NOT: Pass inline objects/arrays as props (`style={{ color: 'red' }}`, `items={[a, b]}`)
- MUST NOT: Pass inline JSX as props (`icon={<Icon />}`)
- FIX: Hoist to module-level constants, use `useCallback`/`useMemo`, or accept primitives instead

## Bundle Size

- MUST: Import `m` + `LazyMotion` from `motion/react` instead of full `motion` export — saves ~30kb
- MUST: Lazy-load heavy libraries with `React.lazy` or `next/dynamic`:
  - Chart libraries: chart.js, recharts, nivo, visx
  - 3D: three.js, @react-three/fiber
  - Data: d3, xlsx, pdf-lib
  - Editors: monaco-editor, codemirror, tiptap, lexical
- MUST: Import from source modules, not barrel/index files — barrel imports defeat tree-shaking
  - Wrong: `import { Button } from '@/components'`
  - Right: `import { Button } from '@/components/button'`
- MUST: Use `lodash/functionName` instead of full `import _ from 'lodash'`
- SHOULD: Replace moment.js with date-fns or dayjs (moment ships ~300kb)

## Iteration Anti-Patterns

- SHOULD: Combine `.filter().map()` into single `.reduce()` or `for...of` — avoids iterating twice
- SHOULD: Use `array.toSorted()` (ES2023) instead of `[...array].sort()` — clearer intent, same result
- MUST NOT: Use `arr[arr.sort()[0]]` to find min/max — use `Math.min(...arr)` / `Math.max(...arr)`
- SHOULD: Hoist `new RegExp()` out of loops to module-level constants

## Object & State Hot Paths

- SHOULD: Avoid deep object nesting (4+ levels) in frequently-accessed data — flatten for faster reads
- SHOULD: Cache repeated `localStorage.getItem()` / `sessionStorage.getItem()` calls in a variable
- SHOULD: Use `startTransition` to wrap non-urgent state updates that trigger expensive re-renders
- SHOULD: Use refs for high-frequency DOM reads or interaction state that does not affect rendered output
- SHOULD: Use lazy state initialization for expensive initial values (`useState(() => buildIndex(items))`)
- MUST: Hydration-sensitive client state (theme, tabs, accordions, viewport-derived values, timestamps) must avoid a flash of wrong content on refresh

## Async Patterns

- SHOULD: Run independent `await` calls with `Promise.all` instead of sequential awaits:
  ```ts
  // Wrong — sequential, ~2x slower
  const a = await fetchA();
  const b = await fetchB();

  // Right — parallel
  const [a, b] = await Promise.all([fetchA(), fetchB()]);
  ```
- SHOULD: Defer non-critical awaits until after early exits so cheap invalid cases return before expensive work runs.

## Core Web Vitals

- MUST NOT: Hide an LCP candidate (hero image, headline) behind hydration or begin its entrance animation at `opacity: 0` — the LCP timestamp is when the element renders visibly, so an entrance animation on the hero silently destroys the metric
- MUST NOT: Lazy-load above-the-fold content or the LCP image
- SHOULD: Triage web-vitals work in impact order: LCP, then INP, then CLS, then transferred bytes and cache efficiency
- MUST: Set immutable/one-year cache headers only on content-hashed or versioned asset URLs. If the release process doesn't rename an asset when its contents change, its URL must not be immutable.
- SHOULD: Batch browser geometry reads and writes with `requestAnimationFrame` — interleaved reads and writes force synchronous layout (layout thrashing)
- MUST: Respect `prefers-reduced-motion` in both CSS and JavaScript-driven animation

## Event Listeners

- MUST: Add `{ passive: true }` to `touchstart`, `touchmove`, `wheel`, and `scroll` listeners — omitting it blocks scrolling performance
- SHOULD: Debounce `resize` and `scroll` handlers, or use `ResizeObserver` / `IntersectionObserver`

## CSS Performance

- MUST NOT: Use `transition: all` — specify exact properties (`transition: opacity 200ms, transform 200ms`)
- SHOULD: Prefer `transform` and `opacity` for animations — they run on the compositor thread
- MUST NOT: Leave `will-change` permanently enabled. Toggle it only around the interaction that needs layer promotion.
- MUST NOT: Animate layout properties (`width`, `height`, `top`, `left`, `margin`, `padding`) when transform/opacity can express the motion.
- SHOULD: Avoid large animated blurs and scale-from-zero entrances on production UI.
