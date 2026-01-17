# Versions

Mandatory version requirements for all new projects.

## Minimum Versions (Non-Negotiable)

- MUST: Use Next.js 16.0.0 or higher (Turbopack stable, async params/headers)
- MUST: Use React 19.0.0 or higher (ref-as-prop, no forwardRef, use() hook)
- MUST: Use TypeScript 5.8.0 or higher
- MUST: Use Tailwind CSS 4.0.0 or higher (config-free, CSS-first)
- MUST: Use Zod 4.0.0 or higher (breaking inference changes from v3)
- MUST: Use Node.js 20.9.0 or higher
- MUST: Use pnpm as package manager (not npm or yarn)
- MUST: Use @biomejs/biome 2.0.0 or higher (not ESLint/Prettier)

## React 19 Patterns

- NEVER: Use `forwardRef`—ref is a regular prop in React 19
- MUST: Use `use()` hook for reading promises and context
- MUST: Use `<Context>` not `<Context.Provider>`
- SHOULD: Use `useActionState` for form handling

```tsx
// Correct React 19 pattern
function Input({ ref, ...props }: Props & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />
}
```

## Next.js 16 Patterns

- MUST: Await `params` and `searchParams` in page/layout components
- MUST: Await `cookies()` and `headers()` from next/headers
- SHOULD: Use `next.config.ts` (TypeScript config)

```tsx
// Correct Next.js 16 pattern
export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <div>{id}</div>
}
```

## Tailwind v4 Patterns

- NEVER: Create `tailwind.config.js`—use CSS-based config
- MUST: Use `@import 'tailwindcss'` in globals.css
- MUST: Use `@theme` for design tokens
- MUST: Use `@source` for content paths
- MUST: Use `gray-*` palette only (not slate/zinc/neutral)

```css
@import 'tailwindcss';

@source '../components/**/*.tsx';

@theme {
  --font-sans: 'Inter', sans-serif;
}
```

## Package.json Requirements

- MUST: Specify engines.node >= 20.9.0
- SHOULD: Specify packageManager field

```json
{
  "engines": {
    "node": ">=20.9.0"
  },
  "packageManager": "pnpm@10.11.0"
}
```
