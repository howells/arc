# React Rules

Scope: All apps and packages.

## Component Design
- MUST: Each component does one thing well (single responsibility). Keep it minimal and "dumb" by default (rendering-focused).
- MUST: When logic grows, extract business logic into custom hooks. Components focus on composition and render.
- MUST: Avoid massive JSX blocks. Compose smaller, focused components instead.
- SHOULD: Colocate code that changes together (component + hook + types in same folder).
- SHOULD: Organize complex components in a folder:
  - `components/complex-component/complex-component-root.tsx`
  - `components/complex-component/complex-component-item.tsx`
  - `components/complex-component/index.ts`

## Component Naming
- MUST: Use specific, descriptive names that convey purpose. Avoid generic suffixes like `-content`, `-wrapper`, `-container`, `-component`.
- NEVER: Create "god components" with vague names like `PageContent`, `MainWrapper`, `ComponentContainer`.
- NEVER: Create boundary-hack components (for example `DashboardShell`, `DashboardWrapper`, `PageContent`, `ClientLayout`) whose primary purpose is hosting `"use client"` for an entire route.
- SHOULD: Name components by their domain role: `FolderThumbnail`, `ProductCard`, `UserAvatar` — not `ItemContent`, `CardWrapper`.
- SHOULD: Part components should describe their role: `FolderActionMenu`, `DialogHeader`, `FormFieldError` — not just `Actions`, `Header`, `Error`.

## Reuse First

LLMs default to creating new components instead of finding existing ones. This rule exists to counteract that bias.

- MUST: **Before creating any component, hook, or utility**, search the codebase for existing implementations that serve the same or similar purpose. Use Glob and Grep — not memory.
- MUST: If a similar component exists, extend it with a variant/prop rather than creating a new one. A `Button` with `variant="danger"` is better than a new `DangerButton`.
- MUST: If the same visual pattern appears in 2+ places, extract a shared component immediately. Do not wait — duplication becomes divergence.
- MUST: Place shared components in a central location (`components/`, `packages/ui/`, or the project's established shared directory), not next to the first consumer.
- NEVER: Create a single-use component that duplicates an existing pattern. If it looks like something that already exists, it probably does — search first.
- NEVER: Fork an existing component into a copy with small modifications. Add a prop/variant to the original.

## Design System First
- MUST: Check for the existence of design system primitives (`Stack`, `Grid`, `Container`, `Text`, `Heading`) in the project before using them.
- MUST: IF primitives exist: Use them for layout and typography instead of raw HTML.
- MUST: IF primitives DO NOT exist: Use raw HTML (`div`, `h1`, `p`) with utility classes.
- MUST: When missing a primitive and the pattern repeats (or will repeat), define the primitive rather than using one-off `className` usage.
- MUST: Use `Button` component variants instead of raw `<button>` with custom styling.
- MUST: Compose UI from design system primitives; only reach for custom `className` when design system doesn't cover the case.

## Styling Approach
- MUST: Minimize custom `className` usage in app components; rely on design system component props (if available).
- SHOULD: Use semantic props (`variant="muted"`, `size="sm"`) over utility classes.
- SHOULD: When custom classes are needed, keep them minimal and focused on layout/positioning only.


## State Management
- MUST: URL-visible state (filters, tabs, pagination, modals) goes in search params via [nuqs](https://nuqs.dev). URL is the source of truth.
- MUST: Wrap the app in `NuqsAdapter` (from `nuqs/adapters/next/app`). Without it, hooks silently fail.
- MUST: In Server Components, use `createSearchParamsCache` — call `parse()` at the page level, then `get()` in nested components.
- MUST: Use `throttleMs` on rapid-update inputs (search boxes, sliders) to avoid browser History API rate limiting.
- SHOULD: Set `shallow: false` when URL state changes should trigger a server re-render.
- SHOULD: Use `useState` for strictly local, ephemeral UI state.
- SHOULD: Use Zustand stores for shared state across the app (or across non-trivial feature boundaries).
- SHOULD: For complex component-internal sharing, provide a local Context or a local Zustand store/provider that is scoped to the component tree.
- MUST: Avoid prop drilling for widely shared state; prefer Context or Zustand.

## Props & Types
- MUST: Properly type all props (no `any`). Reuse shared types where possible.
- SHOULD: Avoid passing large or generic objects in props. Prefer clear, specific props (IDs or primitives) and derive the rest inside.
- SHOULD: Keep prop surfaces stable to reduce re-renders (prefer primitives/IDs over new object/array instances).

## Documentation
- SHOULD: Include minimal JSDoc at the component/hook level to explain intent and any non-obvious behavior.
- SHOULD: Document props that have constraints, side-effects, or require non-obvious usage.

## Hooks & Effects
- MUST: Prefer custom hooks for business logic, data fetching, and side-effects.
- MUST: Avoid `useEffect` unless synchronizing with an external system. Before writing one, ask: "Does this run because the component was displayed, or because of a user interaction?" If the latter, it belongs in an event handler.
- MUST: See `react-correctness.md` § State & Effects for the full list of effect anti-patterns — derived state, key resets, effect chains, parent notification, store subscriptions, and more.
- SHOULD: Memoize only when necessary (`useMemo`/`useCallback`), and prefer moving logic into hooks first.

## JSX
- NEVER: Pass children as props. Nest children between opening and closing tags.
- NEVER: Reassign props in components.
- SHOULD: Avoid components whose correctness depends on inspecting or transforming arbitrary `children`. Prefer explicit props, context, or named slots.
- MUST NOT: Flip an input between controlled and uncontrolled over its lifetime.

## React 19
- MUST: Use ref-as-prop instead of legacy `forwardRef`.
- MUST: Use `use()` hook for reading promises and context.
- MUST: Use `<Context value={...}>` instead of `<Context.Provider value={...}>`.
- SHOULD: Use `useActionState` for form handling with server actions.
- NEVER: Use `cloneElement` — it silently injects props and breaks with wrappers/fragments. Use context, render props, or explicit composition.
- NEVER: Use `Children.map`/`forEach`/`toArray`/`count`/`only` — child traversal is fragile. Use explicit props or context.

```tsx
// ref-as-prop (no forwardRef needed)
function Input({ ref, ...props }: Props & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}
```

## Imports & Hooks Usage
- MUST: Do not use namespace access for hooks in app code (e.g., `React.useCallback`, `React.useMemo`, `React.useState`). Import hooks directly.
  - Correct: `import { useCallback, useMemo, useState } from "react";`
  - Avoid: `import * as React from "react";` then `React.useCallback(...)`
- SHOULD: If JSX runtime requires it, use `import React from "react";` plus named hooks — or `import type React` when only typing is needed.

## File & Naming
- SHOULD: One file per component by default; group complex components in a folder.
- SHOULD: Use kebab-case filenames, `component-name.tsx`.

## Component Attributes
- MUST: Add `data-component` to root element (kebab-case, matches filename) for DevTools identification.
- MUST: Add `data-testid` to testable elements for Playwright (see testing.md).
- SHOULD: Prefix child test IDs with component name: `user-profile-edit`, `product-card-add-to-cart`.

## Gotchas
- NEVER: Use `&&` for conditional rendering with numbers. `{count && <Badge />}` renders `0` when count is 0. Use ternary: `{count > 0 ? <Badge /> : null}`.
- MUST: Use lazy initializer for expensive `useState`: `useState(() => buildIndex(items))`, not `useState(buildIndex(items))` — the non-lazy form runs on every render.
- SHOULD: Use `startTransition` to wrap non-urgent state updates (search results, filtered lists) so they don't block user input.

## Utilities, Hooks, Functions
- MUST: Keep utilities, hooks, and general functions single-purpose.
- SHOULD: Organize by responsibility in individual folders where appropriate (e.g., `hooks/use-thing/`, `utils/format-price/`).
- SHOULD: Co-locate utilities that are truly component-specific next to the component, otherwise place shared items under a common folder (e.g., `lib/`, `hooks/`, `utils/`).

## Further Reading

For 57 detailed React/Next.js performance rules with code examples, agents can reference the `vercel-react-best-practices` skill. For advanced composition patterns (compound components, dependency injection via providers), reference the `vercel-composition-patterns` skill.

For React-specific performance anti-patterns, agents can reference `react-performance.md`.
For React correctness rules and common bugs, agents can reference `react-correctness.md`.

Deeper background lives in Arc's references — load when the task needs it:

| Reference | Use when |
|-----------|----------|
| `references/tanstack-query-trpc.md` | Wiring TanStack Query or tRPC data flow |
| `references/tanstack-table.md` | Building data tables with TanStack Table v8 |
| `references/component-design.md` | Designing component APIs |
