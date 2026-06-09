# Security

Rules for application security. The `security-engineer` agent reviews for OWASP compliance; these rules codify the baseline.

## Authentication & Sessions

For Clerk, WorkOS, and provider-specific rules, see [auth.md](auth.md).

- MUST: Store auth tokens in httpOnly cookies, not localStorage or sessionStorage.
- MUST: Set `Secure`, `SameSite=Lax` (or `Strict`) on auth cookies.
- MUST: Invalidate sessions server-side on logout — don't just delete the client cookie.
- MUST: Verify webhook signatures before processing payloads. Use the provider's SDK verification, not manual HMAC.
- MUST: Enforce RBAC at the data layer (queries/mutations), not just at route or middleware level.
- NEVER: Store secrets, tokens, or API keys in client-accessible code or bundles.
- SHOULD: Use short-lived access tokens with refresh token rotation.
- SHOULD: Rotate refresh tokens on each use (one-time use tokens).

## Input & Output

- MUST: Validate and sanitize all user input at system boundaries (API routes, server actions, form handlers).
- SHOULD: Use Zod schemas at every API boundary. See [api.md](api.md).

## CSRF & CORS

- MUST: Use `SameSite` cookies or CSRF tokens for state-changing requests.
- SHOULD: Prefer server actions or `SameSite=Lax` cookies over manual CSRF tokens in Next.js.

## Secrets

- MUST: All secrets live in environment variables, never in source code. See [env.md](env.md).
- MUST: Distinguish server-only env access from client-reachable code. Server env reads are fine; non-public env vars in `"use client"` files, browser bundles, Vite client code, or React Native bundles are exposure risks.
- MUST: Client-exposed env vars use the framework's public prefix (`NEXT_PUBLIC_`, `VITE_`, `REACT_APP_`, or project equivalent) and contain only values safe to publish.

## Rate Limiting

- SHOULD: Rate-limit authentication endpoints (login, signup, password reset).
- SHOULD: Rate-limit expensive operations (file uploads, AI calls, email sends).
- SHOULD: Return `429 Too Many Requests` with `Retry-After` header.

## Dependencies

- SHOULD: Run `pnpm audit` regularly. See [stack.md](stack.md) for approved packages.
