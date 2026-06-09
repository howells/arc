# Authentication

Scope: Projects using Clerk (`@clerk/nextjs`), WorkOS (`@workos-inc/authkit-nextjs`), or any auth provider. The `security-engineer` agent loads these rules when auth packages are detected.

## General (All Providers)

- MUST: Perform auth checks server-side for all data access. Client-side auth is for UX gating only.
- MUST: Invalidate sessions server-side on logout — don't rely on cookie deletion alone.
- MUST: Verify webhook signatures before processing payloads. Use the provider's SDK verification, not manual HMAC.
- MUST: Return 401 for unauthenticated requests and 403 for insufficient permissions. Never return 404 to hide resources from unauthorized users without explicit reason.
- MUST: Enforce RBAC at the data layer (queries/mutations), not just at route or middleware level. Middleware can be bypassed; data-layer checks cannot.
- SHOULD: Rate-limit auth endpoints (login, signup, password reset, token refresh).
- SHOULD: Rotate refresh tokens on each use (one-time use tokens).
- SHOULD: Include `userId` in cache keys for any user-specific cached data.
- NEVER: Trust auth state from client components for data decisions. Always re-verify server-side.

## Clerk

- MUST: `await auth()` — it's async in Next.js 15+ (App Router). Forgetting `await` returns a pending Promise that's always truthy.
- MUST: Use `auth.protect()` in Server Actions, not just `auth()`. `protect()` throws on failure; `auth()` returns null.
- MUST: Keep webhook routes public in Clerk middleware matcher. Webhook endpoints must not require auth.
- MUST: Handle all user lifecycle webhook events (`user.created`, `user.updated`, `user.deleted`) when syncing to a database.
- MUST: Use `pk_test_*` / `sk_test_*` keys in development. Production keys in dev environments create real user records.
- SHOULD: Configure proxy matcher to protect routes explicitly. Default `publicRoutes` approach is error-prone — prefer `matcher` config. (Note: Next.js renamed `middleware.ts` to `proxy.ts`.)
- SHOULD: Use `setupClerkTestingToken()` in Playwright tests for fast auth without UI login.
- NEVER: Expose `CLERK_SECRET_KEY` in client bundles. It starts with `sk_` — any env without `NEXT_PUBLIC_` prefix is safe, but verify bundler config.
- NEVER: Use `useAuth()` for page-load access control. It runs client-side after render — use `auth()` in Server Components or middleware instead.

## WorkOS

- MUST: Wrap root layout with `AuthKitProvider`. Missing provider causes silent auth failures — no error, just no auth.
- MUST: Add `authkitMiddleware()` to `proxy.ts` (formerly `middleware.ts`). Without it, auth state is never populated. It fails silently.
- MUST: Set `WORKOS_COOKIE_PASSWORD` to 32+ characters. Shorter values cause cryptic runtime errors.
- MUST: Ensure `WORKOS_REDIRECT_URI` matches the redirect URI configured in the WorkOS dashboard exactly, including trailing slashes.
- MUST: Use the correct env prefix for your build tool: `NEXT_PUBLIC_` for Next.js, `VITE_` for Vite, `REACT_APP_` for CRA.
- SHOULD: Use `await createClient()` — it's async. Missing `await` returns a Promise, not a client.
- SHOULD: Use `withAuth()` for page-level protection instead of manual redirect logic.
- NEVER: Use `authLoader` for fetching user data. It's only for handling OAuth callbacks.

## Further Reading

For complete patterns, code examples, and anti-patterns, see [`references/authentication.md`](../references/authentication.md).
