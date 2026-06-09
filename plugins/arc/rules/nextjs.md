# Next.js Rules

## Components
- MUST: Use Server Components by default. Add `"use client"` only when needed.
- MUST: Use App Router metadata API for `<head>` content, not `next/head`.
- NEVER: Use async client components. Use Server Components for async operations.
- MUST: Wrap App Router client components that call `useSearchParams()` in a Suspense boundary when static rendering can apply.
- MUST: `app/**/page.tsx` and `app/**/layout.tsx` own the route's visual shape and remain Server Components.
- MUST: When interactivity is needed in a route, keep `page.tsx`/`layout.tsx` server-side and compose focused client leaves/providers inside them.
- MUST: For route-wide client state, use a scoped Context or scoped Zustand store/provider, not prop drilling through route structure.
- NEVER: Create catch-all client wrappers (`*Shell`, `*Wrapper`, `*Content`, `*ClientLayout`, `*UI`) just to avoid putting `"use client"` in route files.
- NEVER: Move route structure out of `page.tsx`/`layout.tsx` into a client "god component".

## Assets & Loading
- MUST: Use `next/font` for fonts and `next/script` for third-party scripts.
- MUST: Use `next/image` for all images.
- MUST NOT: Use raw `<script>`, `<link rel="stylesheet">`, Google Font `<link>` tags, or `next/head` in App Router code when Next.js provides a framework primitive.
- MUST: Every `<Image>` must have a `sizes` prop. Without it, the browser requests the largest srcSet candidate (up to 3840px) regardless of viewport. Example: `sizes="(max-width: 768px) 100vw, 50vw"`.
- SHOULD: Above-the-fold images use `loading="eager"` or `fetchPriority="high"`. Use `priority` sparingly.

## Proxy (replaces Middleware in Next.js 16+)
- MUST: New projects use `proxy.ts` instead of `middleware.ts`
- MUST: Export function named `proxy`, not `middleware`
- NOTE: Runs on Node.js only (Edge runtime not supported)
- SHOULD: Migrate existing middleware.ts using codemod

```tsx
// src/proxy.ts (Next.js 16+)
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // Auth check, redirects, rewrites, etc.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### Migration from middleware.ts

```bash
npx @next/codemod@latest upgrade latest
```

Or manually:
1. Rename `middleware.ts` → `proxy.ts`
2. Rename exported function `middleware` → `proxy`
3. Remove Edge runtime APIs (not supported in proxy)

## Caching (Next.js 16+)
- MUST: Use `use cache` directive for explicit caching (opt-in model)
- MUST: Enable `cacheComponents: true` in next.config.ts for component caching
- SHOULD: Use `use cache: remote` in serverless for shared cache
- NEVER: Access cookies()/headers()/searchParams inside cached scope

```tsx
// Explicit caching with use cache directive
async function getData(id: string) {
  "use cache";
  return db.query.items.findFirst({ where: eq(items.id, id) });
}

// Component-level caching
async function CachedComponent() {
  "use cache";
  const data = await getData();
  return <div>{data.title}</div>;
}
```

## Bundle Optimization

- MUST: Never import from barrel files for large icon/component libraries. `import { Check } from 'lucide-react'` loads 1,500+ modules. Import directly: `import { Check } from 'lucide-react/dist/esm/icons/check'`. Or use `optimizePackageImports` in next.config:
  ```js
  experimental: { optimizePackageImports: ['lucide-react', '@mui/material'] }
  ```
- MUST: Use `next/dynamic` with `{ ssr: false }` for heavy client-only components (editors, charts, maps). Keeps them out of the initial bundle.
- SHOULD: Defer non-critical third-party scripts (analytics, tracking) by dynamically importing them with `{ ssr: false }`.
- SHOULD: Preload heavy modules on hover/focus when a user interaction will trigger them (e.g., preload editor on "Open Editor" button hover).

## Server Performance

- MUST: Authenticate inside Server Actions — they are public endpoints. Always call `verifySession()` or equivalent before any mutation.
- MUST: When using `React.cache()`, pass primitives not objects. `cache(async (params: { id: string }) => ...)` always misses — use `cache(async (id: string) => ...)`.
- MUST NOT: Keep mutable request/user data in module scope. Module state is shared across requests and users in long-lived runtimes.
- MUST NOT: Put `redirect()` or `notFound()` inside a broad `try/catch` that catches Next.js control-flow exceptions. Validate first, then call framework control flow outside the catch.
- MUST: GET route handlers must not mutate durable state. If logging, analytics, queueing, or cache mutation is required, isolate it and verify it cannot affect request correctness.
- SHOULD: Run independent server awaits in parallel with `Promise.all` unless one result is required to compute the next request.
- SHOULD: Only pass fields the client component actually uses across the RSC boundary, not entire objects. `<Profile name={user.name} />` not `<Profile user={user} />`.
- SHOULD: Use `after()` from `next/server` to schedule non-blocking work (logging, analytics) that runs after the response is sent.

## Feature Structure
- SHOULD: Add new features under `apps/<app>/features/<feature>/`.
- SHOULD: Within a feature, organize by kind: `components/`, `hooks/`, `utils/`, `lib/`, `types/`.
- SHOULD: Prefer feature-local state (Context or local Zustand) scoped to the feature tree.
- SHOULD: Place shared components in `apps/<app>/components/` rather than a feature folder.
