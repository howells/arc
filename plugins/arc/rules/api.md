# API Design

Rules for HTTP APIs, tRPC routers, and server actions.

## Design Principles

- MUST: Consistent error format across all endpoints (see Error Shape below).
- SHOULD: Version via URL prefix (`/v1/`) only when introducing breaking changes.
- SHOULD: Prefer cursor-based pagination over offset-based.

## HTTP Conventions

- MUST: Use appropriate status codes — `201` for creation, `204` for deletion, `409` for conflicts, `422` for semantic errors.
- MUST: `401` for missing/invalid auth, `403` for insufficient permissions. Never conflate them.

## Error Shape

All API errors MUST return:

```json
{
  "error": {
    "code": "auth/token-expired",
    "message": "Your session has expired. Please sign in again.",
    "details": {}
  }
}
```

- MUST: `code` is machine-readable, namespaced (`domain/error-name`).
- MUST: `message` is human-readable, safe to display.
- SHOULD: `details` provides structured context (field errors, limits, etc.).

## tRPC

- MUST: Use `@trpc/tanstack-react-query` with `queryOptions`/`mutationOptions`.
- MUST: Zod for all input validation.
- MUST: Use `queryKey()` for cache invalidation — never manual string arrays.
- SHOULD: Organize routers by domain (`user`, `posts`, `billing`).
- SHOULD: Use `superjson` as transformer for Date/Map/Set serialization.
- SHOULD: Prefer optimistic updates for mutations that modify displayed data.
- See [integrations.md](integrations.md) for adapter error handling rules.

## OpenAPI

- MUST: Generate OpenAPI specs from code — never hand-write them.
- SHOULD: Use `zod-openapi` for Zod-first HTTP APIs, `trpc-openapi` for tRPC REST exposure.
- SHOULD: Serve the spec at `/api/openapi.json` for tooling and agent consumption.
- SHOULD: Document rate limits, auth requirements, and pagination in the spec.

## CLI Surface

Every project with an API SHOULD ship a CLI that exposes it. See [cli.md](cli.md).
