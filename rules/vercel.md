# Vercel Rules

Conventions for projects deployed on Vercel. See [operations-playbook.md](../references/operations-playbook.md) for the CI/env remediation shapes and [env.md](env.md) for the typed schema.

## Environment Variables

- MUST: Validate every env var against the typed schema (`env.schema.ts`) at startup — never read `process.env` raw in app code.
- MUST: Keep the Vercel project env in sync with the schema. Run a drift check (diff schema's required keys against `vercel env ls`) before promoting to production.
- MUST: Set env vars per-environment (Development / Preview / Production) — don't reuse a production secret in preview.
- NEVER: Commit `.env.local`, `.env.production`, or OIDC tokens. They belong in Vercel's env store, not the repo.
- SHOULD: Prefer Vercel OIDC / connected-account tokens over long-lived secrets where the integration supports it.

## Cron Routes

- MUST: Declare scheduled work in `vercel.json` `crons`, not ad-hoc external schedulers.
- MUST: Authenticate every cron route. Verify a `CRON_SECRET` (Vercel sends it as `Authorization: Bearer $CRON_SECRET`) and reject unauthenticated calls — cron routes are public URLs.
- MUST: Alert on cron failure. A cron route that 500s must surface it (issue, webhook, or monitored log), never fail silently. See operations-playbook (d).
- SHOULD: Keep cron handlers idempotent — Vercel may retry, and schedules can overlap.

```ts
// app/api/cron/reconcile/route.ts
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  // ... idempotent work
  return new Response("ok");
}
```

## Deployment Flow

- MUST: Ship through preview deployments first — every PR gets a preview URL; verify there before promoting.
- MUST: Promote a **built** preview to production (promote the deployment, don't rebuild) so what you tested is what ships.
- SHOULD: Keep the gate (`pnpm check`) green as a required check before merge — Vercel building green is not the same as the code gate passing.
- SHOULD: Know the rollback path — promoting the previous production deployment is instant; use it rather than hotfix-forward under pressure.

## vercel.json Hygiene

- MUST: Keep `vercel.json` minimal and reviewed — `crons`, `regions`, `headers`, `redirects` only when they earn their place.
- SHOULD: Pin `regions` deliberately when the app is latency- or data-locality-sensitive; otherwise leave the default.
- SHOULD: Set security headers (CSP, HSTS, `X-Content-Type-Options`) via `headers` or the framework, and keep them in one place.
- NEVER: Encode secrets or environment-specific values in `vercel.json` — it's committed.
