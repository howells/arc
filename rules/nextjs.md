# Next.js Rules

## Components
- SHOULD: Use Server Components by default. Add `"use client"` only when needed.
- MUST: Use App Router metadata API for `<head>` content, not `next/head`.
- NEVER: Use async client components. Use Server Components for async operations.

## Assets & Loading
- MUST: Use `next/font` for fonts and `next/script` for third-party scripts.
- MUST: Use `next/image` for all images.
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

## Feature Structure
- SHOULD: Add new features under `apps/<app>/features/<feature>/`.
- SHOULD: Within a feature, organize by kind: `components/`, `hooks/`, `utils/`, `lib/`, `types/`.
- SHOULD: Prefer feature-local state (Context or local Zustand) scoped to the feature tree.
- SHOULD: Place shared components in `apps/<app>/components/` rather than a feature folder.
