---
name: launch
description: |
  Go-live and shareability checklist covering the basics needed to make a project visitable,
  shareable, and ready for a first real audience. Use when asked to "launch", "go live",
  "make this shareable", "get this ready to show people", or prepare a project for a public URL.
license: MIT
metadata:
  author: howells
website:
  order: 11
  desc: Launch checklist
  summary: "Check the basics needed for a public URL: deployment, domain, env vars, social previews, favicons, placeholders, and production settings for detected services."
  workflow:
    position: spine
    after: testing
---

<tool_restrictions>
Ask one question at a time. In Claude Code use `AskUserQuestion`; elsewhere ask a single concise plain-text question. Keep any lead-in to 2-3 sentences. Don't narrate missing tools or fallbacks.
</tool_restrictions>

<arc_runtime>
Requires the full Arc bundle. Arc-owned paths (`agents/`, `references/`, `disciplines/`, `templates/`, `scripts/`, `rules/`, `skills/`) resolve from the plugin root — the directory containing `agents/` and `skills/`. Everything else is the user's repository.
</arc_runtime>

<required_reading>
Read this reference before building the final status:

1. `references/launch-scorecard.md`

</required_reading>

# Launch Workflow

Prepare a project to go live and be shareable. This is a checklist workflow, not a deep remediation workflow.

<boundary>
Launch is a passive readiness checklist unless the user explicitly asks for action.

- Do not start a dev server, preview server, tunnel, deployment, or browser session just to answer `/arc:launch`.
- Do not run exploratory UI QA or say the app "looks good" from a shallow homepage check.
- Do not create, update, or redeploy hosting resources unless the user explicitly asks.
- Do not change DNS, environment variables, provider dashboard settings, auth callbacks, payment webhooks, robots policy, or metadata unless the user explicitly asks.
- If a local or public URL is already provided, you may record it as evidence. If none is known, mark the public URL as `Missing` or `Needs user`.
- If rendered verification would be useful, list it as a next action instead of doing it automatically.

</boundary>

Launch should answer:

- Can someone visit it at a public URL?
- Can someone share it and get a decent preview?
- Are obvious placeholders, local-only settings, access gates, and missing assets gone?
- Are detected services configured for the public URL?
- Are accidental launch blockers such as `noindex`, disallow rules, maintenance mode, or preview passwords absent or intentional?
- Have deeper checks been run or intentionally deferred?

If the work turns into deep code health, security remediation, or safety-net test backfill, route outside launch instead:

- Codebase health, risk, and security remediation -> `/arc:audit`
- Untested behavior that needs a safety net -> `/arc:testing`

## Process

### Step 1: Detect The Project

Scan the codebase passively for:

```text
Framework: package.json, app/router files, static site config
Deployment: vercel.json, netlify.toml, wrangler.toml, Dockerfile, package scripts
Domain/public URL: env vars, metadata base URL, README, config
Access gates: password protection, preview deployment protection, maintenance mode, robots/noindex settings
Auth: auth libraries, OAuth config, callback URLs
Payments: Stripe, Paddle, Lemon Squeezy
Email: Resend, SendGrid, Postmark, Nodemailer
Database: Prisma, Drizzle, Supabase, Neon, PlanetScale
Analytics/monitoring: PostHog, Plausible, GA, Sentry
Share assets: metadata, OG images, favicon, app icons, manifest
Content: TODOs, lorem ipsum, placeholder URLs, example copy, support/contact links
Legal/compliance: privacy policy, terms, cookie notice (Arc ships fill-in templates under `templates/` for any that are missing; when one is required is decided once, under Detected Services)
Prior Arc reports: docs/arc/audits/*-audit.md (newest first), read for outcome
```

Report what was found in 5-10 bullets. Keep it factual. Do not start the app to gather these facts unless the user explicitly asked you to run or inspect the app.

For a prior audit report, read its outcome rather than noting that it exists: Critical/High findings with no evidence of remediation are launch Blockers, and the Deeper Checks item records that outcome — not the mere fact a report was found.

### Step 2: Ask Missing Launch Facts

Only ask what cannot be discovered. Ask one question at a time.

Prioritize:

1. Public URL or intended domain.
2. Launch type: private share, soft launch, public launch, or migration.
3. Whether email/auth/payments are active for this launch.
4. Whether analytics or error monitoring are required before sharing.
5. Whether the launch collects personal data, tracks visitors, or takes payments.

If no user response is available (an unattended or non-interactive run), answer conservatively and say which answers were assumed:

- Launch type: assume a public launch and score against that bar.
- Analytics or error monitoring: assume required for anything reaching a real audience.
- Email/auth/payments active: answer from code evidence, and treat a wired service as active when the evidence is ambiguous.

### Step 3: Build The Checklist

Emit all seven sections; a section with nothing applicable says so in one line rather than disappearing. Mark each item:

- `Done` when verified in the project.
- `Missing` when required and absent.
- `Deferred` when not needed for this launch or explicitly postponed.
- `Needs user` when it depends on credentials, DNS, legal review, or an external dashboard.

Use this shape:

```markdown
## Launch Checklist

### Public URL

- [status] Item — evidence or next step

### Shareability

- [status] Item — evidence or next step

### Basic Content Readiness

- [status] Item — evidence or next step

### Detected Services

- [status] Item — evidence or next step

### Operations Readiness

- [status] Item — evidence or next step

### Agent & Bundle Surfaces

- [status] Item — evidence or next step

### Deeper Checks

- [status] Item — evidence or next step
```

Then offer, in one question, to write the checklist to `docs/arc/launch/YYYY-MM-DD-launch-checklist.md`, creating `docs/arc/launch/` if it does not exist. If no user response is available, write it and say where it went.

## Checklist Areas

### Public URL

- Domain or deployment URL exists.
- DNS points to the hosting provider.
- HTTPS/SSL is active.
- Canonical domain redirects are intentional (`www` vs apex, old domains, preview URLs).
- Production environment variables are set.
- Production build status is known from existing evidence, or a build command is listed as the next verification step.
- Password protection, maintenance mode, or preview deployment protection is off or intentionally kept.
- Preview/local-only URLs are not hardcoded in metadata, callbacks, or share links.

### Shareability

- Page title and description are set.
- `metadataBase` or canonical public URL is configured when the framework needs it.
- Open Graph title, description, and image are set.
- Twitter/X card metadata is set when relevant.
- Favicon and touch icon exist.
- `robots.txt`, route metadata, and headers do not accidentally block public indexing when public discovery matters.
- Open Graph/Twitter metadata is present in code — that is what is verifiable statically — and the external-validator pass is recorded as a post-deploy next action.

### Basic Content Readiness

- Placeholder copy is removed.
- TODO/FIXME/demo labels are not visible in user-facing screens.
- Demo/seed/fixture data is not what real visitors will see — module-scope generated data counts even when no TODO/lorem strings exist.
- Product name casing is consistent.
- The primary CTA's target is known from existing evidence (route, handler, or link destination exists), or checking it is listed as the next verification step.
- Contact, support, or feedback path exists when the project expects real users.
- 404/error pages exist in the codebase and their content is acceptable for a first audience, or reviewing them rendered is listed as the next verification step.

### Detected Services

Only include sections for services the project actually uses:

- Auth: production callback URLs, cookie/session domain, provider dashboard URLs.
- Payments: live keys, webhook URL, signing secret, test purchase plan.
- Email: sending domain, SPF/DKIM/DMARC, verified From address.
- Database: production connection string, migrations applied. Backup posture verified — PITR or a scheduled dump — and a migration journal exists (see `references/database-lifecycle.md`).
- Analytics/monitoring: provider key, environment separation, basic event/error capture.
- Legal/support: privacy policy, terms, cookie notice, refund/support links. This is the one place legal gating is decided. A document is REQUIRED on current behaviour — the project collects personal data, tracks visitors, or takes payments today. Intent without behaviour (payment keys wired but no checkout, an `identify()` call with no live endpoint) is not yet a requirement: record it as a pending trigger that flips the moment real data arrives. Generate legal documents only with a user present — placeholders like company name and contact email are undiscoverable from a repo. When one is missing but required and a user is present, offer to generate it from Arc's ready-made templates — `templates/privacy-policy.md`, `templates/terms-of-service.md`, `templates/cookie-policy.md` — filling the placeholders from detected facts (product name, company, contact email, data collected, payment/analytics providers) and asking only for the facts that cannot be discovered. In an unattended run, record the document as `Needs user` ("requires user input") and move on.
- (Emit this item even when no services are detected — env fallbacks are a launch risk on their own.) No service or config is wired to a hardcoded fallback that would silently "work" in production (`process.env.X || default`, placeholder keys) — a missing env var should fail loudly, not point at localhost.

### Operations Readiness

Check against `references/operations-playbook.md`. Absence of CI or gates is a finding, not a reason to skip the section:

- CI exists and runs the repo's check gate (e.g. `pnpm check` / `check:affected`).
- Gates are enforced (husky pre-push, fail-on-red, boundary checks).
- Env is validated (an `env:check` / Envy schema, not scattered `process.env` reads).
- Scheduled/cron jobs have failure alerting.
- The data-readiness gate passes (migrations applied, seed/reference data present).

### Agent & Bundle Surfaces

When the project exposes no agent surface and publishes nothing, the section is a one-line `Deferred — not applicable`. Otherwise:

- Is the agent-facing surface (API / MCP / `llms.txt`) current with shipped behavior?
- Have published component bundles been verified post-build (the built artifact, not just source)?

### Deeper Checks

Do not run every specialist workflow automatically. Record each one's outcome — done and clean, done with findings still open, missing, or intentionally deferred — not merely whether a report exists:

- `/arc:testing`
- `/arc:audit` — read the newest `docs/arc/audits/*-audit.md`; unremediated Critical/High findings are launch Blockers.

## Launch Scorecard

After building the checklist, score launch readiness using `references/launch-scorecard.md`.

Operations Readiness and Agent & Bundle Surfaces are advisory sections with no scorecard axis. They never move the score, so a high total does not mean they passed — surface their failures in the output alongside the score, and name them in Blockers or Deferred as appropriate.

Advisory failures never change the number, but they qualify the verdict: a wholly failing advisory section makes the status `Ready, with operations caveats`, never a bare `Ready`.

Score only what has concrete evidence from the repository, user-provided facts, or existing reports. Do not give full credit for DNS, dashboards, credentials, social preview validators, production env vars, auth callbacks, payment webhooks, or monitoring settings unless they were verified or explicitly supplied by the user.

Use this shape:

```markdown
## Launch Scorecard

| Axis              |  Score   | Evidence                                                                      |
| ----------------- | :------: | ----------------------------------------------------------------------------- |
| Public URL        |   X/3    | [verified URL/DNS/HTTPS/access-gate evidence or gap]                          |
| Shareability      |   X/3    | [metadata, OG image, favicon, canonical, robots evidence or gap]              |
| Content Readiness |   X/3    | [placeholder/CTA/contact/error-state evidence or gap]                         |
| Detected Services |   X/3    | [auth/payment/email/db/analytics public-setting evidence or gap]              |
| Deeper Checks     |   X/3    | [`/arc:testing` and `/arc:audit` status or deferral]                          |
| **Total**         | **X/15** | **Ready / Ready, with operations caveats / Shareable with caveats / Blocked** |
```

## Output

End with:

```markdown
## Launch Status

Status: Ready / Ready, with operations caveats / Blocked / Shareable with caveats
Readiness Score: X/15
Public URL: [url or missing]
Advisory: [Operations Readiness and Agent & Bundle Surfaces verdicts]
Blockers: [short list]
Deferred: [short list]
Next action: [one concrete next step]
```

If follow-up work is needed, offer to create tasks or start the highest-priority blocker. Do not deploy, change DNS, or create external accounts unless the user explicitly asks.

Do not end with broad reassurance such as "everything looks good" unless every required checklist item has concrete evidence. Prefer `Shareable with caveats` when some checks are inferred, unrun, or require external dashboards.

<success_criteria>
Launch is complete when:

- [ ] Project and launch type are detected or clarified
- [ ] Public URL/domain status is known
- [ ] Access gates, robots/noindex blockers, share metadata, favicon, and obvious placeholders are checked
- [ ] Detected services have public-URL settings checked
- [ ] Deeper checks are recorded as done, missing, or deferred
- [ ] Final launch status is presented with one next action

</success_criteria>
