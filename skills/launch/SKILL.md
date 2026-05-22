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
# MANDATORY Tool Restrictions

## REQUIRED TOOLS — use these when specified in the process:
- **`AskUserQuestion`** — Preserve the one-question-at-a-time interaction pattern. In Claude Code, use the tool. In Codex, ask one concise plain-text question at a time unless a structured question tool is actually available.
</tool_restrictions>

<arc_runtime>
This workflow requires the full Arc bundle, not a prompts-only install.

Paths in this skill use these conventions:
- `agents/...`, `references/...`, `disciplines/...`, `templates/...`, `scripts/...`, `rules/...`, and `skills/<name>/...` are Arc-owned files at the plugin root.
- `.ruler/...`, `docs/...`, `src/...`, or the user's own project paths are relative to the user's repository.
</arc_runtime>

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

If the work turns into deep code health, safety-net test backfill, mobile layout, security remediation, or deep search optimization, route outside launch instead:

- Codebase health and risk -> `/arc:audit`
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
Legal/compliance: privacy policy, terms, cookie notice only when the project collects data, tracks visitors, or takes payments
```

Report what was found in 5-10 bullets. Keep it factual. Do not start the app to gather these facts unless the user explicitly asked you to run or inspect the app.

### Step 2: Ask Missing Launch Facts

Only ask what cannot be discovered. Ask one question at a time.

Prioritize:

1. Public URL or intended domain.
2. Launch type: private share, soft launch, public launch, or migration.
3. Whether email/auth/payments are active for this launch.
4. Whether analytics or error monitoring are required before sharing.
5. Whether the launch collects personal data, tracks visitors, or takes payments.

### Step 3: Build The Checklist

Generate only relevant checklist sections. Mark each item:

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

### Detected Services
- [status] Item — evidence or next step

### Before Sharing
- [status] Item — evidence or next step
```

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
- Social preview has been checked or is ready to check in external validators.

### Basic Content Readiness

- Placeholder copy is removed.
- TODO/FIXME/demo labels are not visible in user-facing screens.
- Product name casing is consistent.
- Primary CTA works.
- Contact, support, or feedback path exists when the project expects real users.
- 404/error pages are acceptable for a first audience.

### Detected Services

Only include sections for services the project actually uses:

- Auth: production callback URLs, cookie/session domain, provider dashboard URLs.
- Payments: live keys, webhook URL, signing secret, test purchase plan.
- Email: sending domain, SPF/DKIM/DMARC, verified From address.
- Database: production connection string, migrations applied, backup posture noted.
- Analytics/monitoring: provider key, environment separation, basic event/error capture.
- Legal/support: privacy policy, terms, cookie notice, refund/support links only when the detected services or launch type require them.

### Deeper Checks

Do not run every specialist workflow automatically. Record whether each is done, missing, or intentionally deferred:

- `/arc:testing`
- `/arc:audit`

## Output

End with:

```markdown
## Launch Status

Status: Ready / Blocked / Shareable with caveats
Public URL: [url or missing]
Blockers: [short list]
Deferred: [short list]
Next action: [one concrete next step]
```

If follow-up work is needed, offer to create tasks or start the highest-priority blocker. Do not deploy, change DNS, or create external accounts unless the user explicitly asks.

Do not end with broad reassurance such as "everything looks good" unless every required checklist item has concrete evidence. Prefer `Shareable with caveats` when some checks are inferred, unrun, or require external dashboards.

<arc_log>
**After completing this skill, append to the activity log.**
See: `references/arc-log.md`

Entry: `/arc:launch — [Ready / Blocked / Shareable with caveats] ([public URL or missing])`
</arc_log>

<success_criteria>
Launch is complete when:
- [ ] Project and launch type are detected or clarified
- [ ] Public URL/domain status is known
- [ ] Access gates, robots/noindex blockers, share metadata, favicon, and obvious placeholders are checked
- [ ] Detected services have public-URL settings checked
- [ ] Deeper checks are recorded as done, missing, or deferred
- [ ] Final launch status is presented with one next action
</success_criteria>
