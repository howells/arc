# React Audit Signals

Arc-native checklist for React, Next.js, TanStack Query, and React Native audits. This is inspired by React Doctor's public rule taxonomy, but reviewers should apply it as judgment-guided audit guidance, not as a substitute for code evidence.

## How To Use

- Treat every item as a signal to inspect, not an automatic finding.
- When the audit ran react-doctor (see the audit skill's optional scanner step), treat its output as the mechanical layer: confirm or refute its leads instead of re-deriving the same patterns, and spend reviewer attention on what the scanner cannot see.
- Report only when there is a concrete file/line and the code path makes the issue real.
- Consolidate repeated findings by pattern and count.
- Respect generated, vendored, fixture, Storybook, and test-only files unless the issue can affect production behavior.
- In `--diff` audits, surface only issues introduced or touched by the diff unless the user asked for a full audit.

## State And Effects

- Derived values should be computed during render, not copied into state via `useEffect`.
- Event-caused behavior belongs in event handlers, not in state flags that trigger effects.
- Avoid chains of effects where one effect sets state that triggers another effect.
- Do not notify parents from effects after local state changes; call callbacks in the same handler that changes state.
- Do not fetch server data in `useEffect` when the project has Server Components, React Query, SWR, tRPC, loaders, or another data layer.
- Effects that subscribe, listen, observe, poll, or start timers must clean up.
- Mutable objects, refs, or freshly-created objects in dependency arrays are suspicious; check whether the effect is stable and intentional.
- Prefer `useSyncExternalStore` for browser/external-store subscriptions.
- Prefer `useReducer` or a single state object when several state variables change as one domain.
- Prefer lazy `useState(() => expensive())` for expensive initial state.
- In React 19+ projects, prefer Effect Events or stable refs for effect-only callbacks that should not retrigger the effect.

## Rendering And Component Correctness

- Never set state during render.
- Avoid nested component definitions inside render functions; they create a new component identity on every render.
- Avoid render helpers that return JSX from inside the component when a focused child component would provide a reconciliation boundary.
- Do not use array indexes as keys for dynamic lists.
- Avoid `count && <Thing />` when `count` can be `0`; it renders `0`.
- Avoid uncontrolled/controlled input flips.
- Avoid direct state mutation and mutation of props.
- Avoid children-as-prop and fragile polymorphic child inspection unless the component has a very explicit composition contract.
- React 19 migrations: flag legacy class lifecycles, legacy context, deprecated `react-dom` APIs, `defaultProps` on function components, `forwardRef` where ref-as-prop is available, `cloneElement`, and `React.Children.*` traversal.

## Rerender And Hydration

- Inline object, array, function, style, or JSX props passed to `React.memo` children defeat memoization.
- Cheap `useMemo` / `useCallback` around simple expressions adds noise; expensive work should be measured.
- Memoization must happen before early returns when hooks are needed by later render paths.
- Use functional `setState` when the next value depends on the previous value.
- Use refs for high-frequency reads that should not drive render output.
- Use `startTransition` for non-urgent expensive UI updates, and make pending/loading states visible.
- Hydration-sensitive values such as `Date.now()`, random IDs, viewport state, locale formatting, and persisted UI state need SSR-safe initial values or explicit `suppressHydrationWarning`.
- Persisted client UI state should not flash the wrong tab/theme/toggle on refresh.

## Next.js And Server Boundaries

- Client components must not be async.
- `useSearchParams()` in App Router client components must be under a Suspense boundary when static rendering can apply.
- Prefer Server Components for data needed at page load; avoid client fetches for server data.
- Server Actions and mutation-capable route handlers must authenticate before mutation. Accept project-specific guard names when they are clearly auth guards.
- Avoid redirect/notFound inside broad `try/catch` blocks that accidentally catch framework control-flow exceptions.
- GET route handlers should not mutate durable state. Setting headers on a local response object is fine; database writes, analytics writes, queue jobs, and cache mutations need scrutiny.
- Avoid mutable module-level state in server/request code unless it is immutable config or a deliberately shared cache with clear invalidation.
- `React.cache()` and server cache helpers should receive primitive/stable arguments, not fresh object literals that defeat dedupe.
- Independent server awaits should run in parallel unless ordering is required.
- Do not pass large objects over the RSC boundary when the client uses only a few fields.
- Use framework primitives: `next/image`, `next/link`, `next/font`, `next/script`, metadata API, and CSS imports through supported channels.

## TanStack Query And Data Clients

- Do not call queries from effects when a query hook or loader should own the fetch.
- Do not use `useQuery` to perform mutations.
- Query functions must return data; `void` query functions usually mean cache state is meaningless.
- Mutations that affect cached lists or detail views need invalidation, cache updates, or a documented reason not to.
- The `QueryClient` should be stable across renders, usually via lazy state or module setup depending on framework.
- Avoid rest destructuring query results when it defeats tracked property optimizations.
- Prefer query/mutation option factories so keys, invalidation, prefetching, and tests share one source of truth.

## Performance And Bundle Size

- Avoid barrel imports for large internal modules or libraries when they defeat tree shaking.
- Dynamic import paths should be statically analyzable.
- Avoid full `lodash` and `moment` imports in client bundles.
- Heavy editors, charts, maps, 3D, PDF, spreadsheet, and analytics tools should be lazily loaded unless above-the-fold and essential.
- Prefer `LazyMotion` and the `m` export for Motion when possible.
- Independent awaits should use `Promise.all` unless sequence matters.
- Avoid DOM read/write interleaving that forces layout thrashing.
- Cache repeated storage and property reads on hot paths.
- Use `Set` / `Map` for repeated membership lookups in large collections.
- Hoist `RegExp`, `Intl.*`, and expensive constants out of render/loops.
- Add passive listeners for scroll, wheel, touchstart, and touchmove when `preventDefault` is not required.

## Security

- `eval`, `new Function`, and string-based timers are high-risk.
- `dangerouslySetInnerHTML` needs a clear sanitization path.
- Secret scanning should distinguish client-reachable files from server-only modules; do not flag safe server env access as client leakage.
- Never expose non-public env vars to client bundles. Prefix conventions such as `NEXT_PUBLIC_`, `VITE_`, and `REACT_APP_` matter.
- Local storage values that shape auth, entitlements, billing, or cross-version app behavior need schema/version handling and server validation.

## UI, Accessibility, And Design Hygiene

- Icon-only buttons need accessible names.
- Vague labels like "Click here", "Submit", or "Learn more" are weak when context is not programmatically clear.
- Avoid disabling zoom.
- Avoid `outline-none` unless a visible replacement focus style is present.
- Avoid tiny text for interactive or important content.
- Avoid `transition: all`; specify exact properties.
- Avoid animating layout properties when transform/opacity can express the motion.
- Avoid permanent `will-change`.
- Avoid huge animated blurs and scale-from-zero entrances.
- Avoid `z-index: 9999`; use a defined stacking scale.
- Treat pure black backgrounds, default Tailwind palettes, gradient text, excessive glow, justified text, and redundant Tailwind axis shorthands as design-quality signals, not blockers.

## Design Slop Signals

Generated UI has recognizable tells. These are quality signals for frontend reviewers on marketing/product surfaces — advisory, deliberately overridable by an intentional design direction, and never scored as correctness findings.

**Decoration without intent:**

- Decorative blur orbs, glow fields, or repeating gradient blobs behind hero content.
- Default purple/indigo page gradients and purple-blue icon gradients that no brand token asked for.
- Gradient text on headings; decorative pulse/ping animations on static content.
- Emoji as heading decoration or repeated emoji feature tiles.
- Fake browser-chrome frames around screenshots; fabricated persona quotes and placeholder marketing copy ("Trusted by 10,000+ teams") presented as real.

**Template structure:**

- Hero eyebrow chip + oversized centered headline + two-button row as the default page opening.
- Uniform feature-card grids where every card is an icon tile + heading + two lines.
- Repeated glass/card surfaces and nested card-within-card shells; empty card shells wrapping a single element.
- Numbered section markers and repeated kicker labels structuring every section identically.

**Typography and spacing tells:**

- Flat type scale (page renders as one or two sizes); all-caps body text; tiny uppercase tracked labels everywhere.
- Crushed or overwide letter-spacing on display type; tight body leading; text measure wider than ~75ch.
- Monotonous page spacing — every section identically padded regardless of content weight.

**Interaction tells:**

- Hover-only reveals of essential content; the same hover scale on every interactive element.
- Layout-shifting interaction states (borders/size appearing on hover or focus).
- Long transition durations on small interactions; ease-in on entrances; smooth scroll without a reduced-motion guard.

## React Native

- Apply React Native rules per package/workspace. In mixed web/native monorepos, do not flag web files just because another workspace is native.
- Raw text must be inside text-capable components, except inside explicit web-only platform branches.
- Large lists should use `FlatList`, `FlashList`, or another virtualized/recyclable list, not `ScrollView` with mapped rows.
- Avoid inline `renderItem`, inline item styles/objects, and per-row callback creation in hot list paths.
- Prefer `Pressable` over legacy touchables unless the project has a wrapper.
- Prefer Expo Image / platform image primitives where they are the established stack.
- Prefer Reanimated/native-driver patterns for animation-heavy native UI.
- Avoid `Dimensions.get` snapshots for responsive layout; prefer hooks/subscriptions that update.
- Avoid legacy shadow styles when the platform supports modern `boxShadow`.
