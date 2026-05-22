# Stack

Preferred technologies for new projects. See [versions.md](versions.md) for minimum version requirements.

## Foundation (MUST)

Every project uses these. Non-negotiable.

| Technology | Purpose | Notes |
|------------|---------|-------|
| Next.js | Framework | App Router, Turbopack, proxy.ts. See [nextjs.md](nextjs.md) |
| React | UI | ref-as-prop, use() hook, useActionState. See [versions.md](versions.md) |
| TypeScript | Language | Strict mode. See [typescript.md](typescript.md) |
| Tailwind CSS | Styling | CSS-first config, @theme, @source. See [tailwind.md](tailwind.md) |
| Zod | Validation | Schema validation for forms, env, API boundaries |
| pnpm | Package manager | Not npm or yarn |
| Biome + Ultracite | Formatting/linting | Single tool, Rust-based. See [code-style.md](code-style.md) |
| Vercel | Hosting | Deployment, preview environments, cron jobs |
| TanStack React Query | Server state | MUST for all client-side data fetching |

## Default (SHOULD)

Strong preference. Use unless there's a specific reason not to.

### Database

- **Neon** — Serverless PostgreSQL with branching and instant scaling
- **Drizzle ORM** — Type-safe, SQL-like syntax, `db:push` workflow for development

### Auth

- **Clerk** — Pre-built UI components, social logins, organizations, webhook sync

### API

- **tRPC 11** — Typesafe client data layer. See [api.md](api.md) for conventions.
- **OpenAPI 3.1** — Specification for HTTP APIs. Generate from code, never hand-write.

### CLI

- **Commander + Ink** — Dual-mode CLI (scripted + interactive). See [cli.md](cli.md) for conventions.

### UI

- **shadcn** — Scaffolded components copied into the project, not a dependency
- **Radix UI** — Accessible primitives for dialogs, dropdowns, popovers, etc.
- **CVA** (class-variance-authority) — Component variant definitions
- **Motion** — Animation library, respects `prefers-reduced-motion`
- Alternative: Base UI as an unstyled primitive option

### State

- **nuqs** — Type-safe URL search params. Use for filters, tabs, pagination, expanded panels. URL is the source of truth.
- **Zustand** — Global client state (persistence, selectors, devtools)

### Forms

- Native `<form>` + Zod for simple forms
- **React Hook Form** + Zod for complex multi-step forms

### Code Quality

- **Husky + lint-staged** — Pre-commit hooks
- **Playwright** — E2E testing
- **Vitest** — Unit testing

## Contextual (MAY)

Proven options for specific needs. Install when the project requires them.

### Edge / Workers

- **Cloudflare Workers** — Edge compute for API gateways, proxies, and lightweight services. See [cloudflare-workers.md](cloudflare-workers.md)
- **Hono** — Lightweight web framework for Workers (alternative to raw fetch handler)

### Monorepo

- **Turborepo** — When the app demands multiple packages/apps, or could demand it in the near future

### Analytics & Monitoring

- **PostHog** — Product analytics, user identification, feature flags
- **Sentry** — Error tracking, source maps, session replay

### Email

- **Resend** — Transactional email delivery
- **React Email** — Email templates as React components

### Files

- **Stow** — Managed file upload and delivery

### Native

- **React Native** — Cross-platform native apps
- **Expo** — Managed workflow, OTA updates, build service
- For React Native patterns, install the `vercel-react-native-skills` skill

## Rejected Alternatives (NEVER)

When AI agents or contributors suggest these, redirect to the preferred option.

| Never | Use Instead | Why |
|-------|-------------|-----|
| Prisma | Drizzle | Lighter, SQL-like, better serverless perf |
| ESLint / Prettier | Biome | Single tool, faster, zero config with Ultracite |
| npm / yarn | pnpm | Faster installs, strict dependency resolution |
| NextAuth / Auth.js | Clerk | Pre-built UI, managed infrastructure, orgs |
| Redux / MobX | Zustand (or server state) | Simpler API, smaller bundle, no boilerplate |
| Styled Components / CSS Modules | Tailwind | Utility-first, no runtime cost, design tokens via CSS |
| Jest | Vitest | Faster, ESM-native, compatible API |
| Cypress | Playwright | Faster, multi-browser, better DX |
