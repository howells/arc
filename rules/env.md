# Environment Rules

Scope: All apps and packages.

## Goals
- Single source of truth for environment schemas.
- No ad-hoc `process.env` reads in app/package code.
- Clear separation between server-only vars and client-safe vars.

## Packages vs Apps
- MUST: In packages and server libraries, import from a shared env package (e.g., `@project/env/server`).
- SHOULD: In Next.js apps, import from the env package's next export (e.g., `@project/env/next`).
- SHOULD: Apps create their own `env.ts` files for app-specific variables.
- NEVER: Read `process.env.X` directly in feature code. Only the env schema files should touch `process.env`.

## Schemas and Sources
- Shared package: `packages/env`
  - `/server` — server-only variables (Node/server contexts)
  - `/next` — Next.js app variables (server + client)
- App-local schema: `apps/<app>/env.ts` for app-specific variables (optional).

## Client vs Server
- MUST: Client-available vars MUST be prefixed `NEXT_PUBLIC_`.
- MUST: Do not expose secrets (API keys, DB URLs) to the client.
- SHOULD: Narrow exposure: only export what the client needs.

## Adding Variables
1. Decide the scope and add the key to the correct schema.
2. Update `runtimeEnv` mapping for every added key.
3. Use the typed import in code (no direct `process.env`).

## Safety
- NEVER: Log secrets.
- NEVER: Commit `.env` files.
- SHOULD: Fail fast on validation errors (default behavior).

Rationale: Centralizing schema validation improves safety, DX, and consistency across the monorepo and prevents silent runtime errors.
