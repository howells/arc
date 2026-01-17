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
- SHOULD: Name components by their domain role: `FolderThumbnail`, `ProductCard`, `UserAvatar` — not `ItemContent`, `CardWrapper`.
- SHOULD: Part components should describe their role: `FolderActionMenu`, `DialogHeader`, `FormFieldError` — not just `Actions`, `Header`, `Error`.

## Design System First
- MUST: Check for the existence of design system primitives (`Stack`, `Grid`, `Container`, `Text`, `Heading`) in the project before using them.
- MUST: IF primitives exist: Use them for layout and typography instead of raw HTML.
- MUST: IF primitives DO NOT exist: Use raw HTML (`div`, `h1`, `p`) with utility classes.
- SHOULD: When missing a primitive, prefer defining it over one-off `className` usage if the pattern repeats.
- SHOULD: Use `Button` component variants instead of raw `<button>` with custom styling.
- SHOULD: Compose UI from design system primitives; only reach for custom `className` when design system doesn't cover the case.

## Styling Approach
- MUST: Minimize custom `className` usage in app components; rely on design system component props (if available).
- SHOULD: Use semantic props (`variant="muted"`, `size="sm"`) over utility classes.
- SHOULD: When custom classes are needed, keep them minimal and focused on layout/positioning only.


## State Management
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
- MUST: Avoid `useEffect` unless absolutely needed. Prefer derived state, event handlers, or server-side logic.
- SHOULD: Memoize only when necessary (`useMemo`/`useCallback`), and prefer moving logic into hooks first.

## JSX
- NEVER: Pass children as props. Nest children between opening and closing tags.
- NEVER: Define components inside other components.
- NEVER: Reassign props in components.
- NEVER: Add children to void elements (`<img>`, `<br>`, `<input>`).
- MUST: Add `key` prop to elements in iterables.
- NEVER: Use array indices as keys (use stable IDs).

## React 19
- MUST: Use ref-as-prop instead of legacy `forwardRef`
- MUST: Use `use()` hook for reading promises and context
- MUST: Use `<Context>` instead of `<Context.Provider>`
- SHOULD: Use `useActionState` for form handling with server actions

```tsx
// ref-as-prop (no forwardRef)
function Input({ ref, ...props }: Props & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}

// use() hook for context
function ThemeButton() {
  const theme = use(ThemeContext);
  return <button className={theme.buttonClass}>Click</button>;
}

// use() hook for promises in render
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);
  return <div>{user.name}</div>;
}

// Context without Provider
<ThemeContext value={theme}>
  {children}
</ThemeContext>

// useActionState for forms
function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  return (
    <form action={action}>
      <input name="email" />
      <button disabled={pending}>Log in</button>
      {state.error && <p>{state.error}</p>}
    </form>
  );
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

## Utilities, Hooks, Functions
- MUST: Keep utilities, hooks, and general functions single-purpose.
- SHOULD: Organize by responsibility in individual folders where appropriate (e.g., `hooks/use-thing/`, `utils/format-price/`).
- SHOULD: Co-locate utilities that are truly component-specific next to the component, otherwise place shared items under a common folder (e.g., `lib/`, `hooks/`, `utils/`).
