# Audit Detection

Project scale, lifecycle stage, and the security readiness gate. Phase 1 of `/arc:audit` uses
these to decide reviewer depth and which reviewers run at all.

**Detect project scale:**

Use file counts to determine appropriate audit depth:

```bash
# Count source files (exclude node_modules, .git, dist, build)
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.py" -o -name "*.go" -o -name "*.rs" \) | grep -v node_modules | grep -v .git | wc -l
```

| File Count   | Scale  | Audit Approach                                  |
| ------------ | ------ | ----------------------------------------------- |
| < 20 files   | Small  | 2-3 reviewers max, skip architecture/simplicity |
| 20-100 files | Medium | 3-4 reviewers, standard audit                   |
| > 100 files  | Large  | Full reviewer suite, batched execution          |

**Scale-appropriate signals:**

- Small projects: Skip `architecture-engineer` (no complex boundaries to review)
- No tests present + small project: Don't flag missing tests as critical
- Single developer: Skip `senior-engineer` (no code review discipline needed)

**Detect project lifecycle stage:**

Infer the project stage from heuristic signals:

| Signal                                                                             | Tool                                 | Indicates                                                                     |
| ---------------------------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------- |
| CI/CD config (`.github/workflows/*`, `Jenkinsfile`, `.gitlab-ci.yml`)              | Glob                                 | pre-launch+                                                                   |
| Deployment config (`vercel.json`, `Dockerfile`, `fly.toml`, `render.yaml`, `k8s/`) | Glob                                 | pre-launch+                                                                   |
| Monitoring/observability (`sentry`, `datadog`, `newrelic` in deps)                 | Grep in package.json                 | production                                                                    |
| Production env references (`.env.production`, `NODE_ENV` guards)                   | Glob + Grep                          | pre-launch+                                                                   |
| Test coverage > 0 (test files exist)                                               | Glob (`**/*.test.*`, `**/*.spec.*`)  | development+                                                                  |
| Git history depth                                                                  | `git rev-list --count HEAD`          | maturity signal                                                               |
| Not a git repository (command errors)                                              | `git rev-parse --git-dir`            | treat as unknown, not as shallow history — do not count it toward `prototype` |
| Custom domain / production URL in config                                           | Grep                                 | production                                                                    |
| Rate limiting, caching, or queue deps in package.json                              | Grep (`rate-limit`, `redis`, `bull`) | production                                                                    |

**Stage classification:**

| Stage         | Description                                 | Typical Signals                                                                  |
| ------------- | ------------------------------------------- | -------------------------------------------------------------------------------- |
| `prototype`   | Exploring ideas, validating concepts        | < 30 commits, no CI, no deploy config, no tests                                  |
| `development` | Actively building features, not yet shipped | Has some tests, may have CI, no production deploy                                |
| `pre-launch`  | Feature-complete, preparing to ship         | Has CI, has deploy config, has tests, no monitoring                              |
| `production`  | Live and serving real users                 | Has monitoring, production env, rate limiting, mature git history (200+ commits) |

Default to `development` if signals are ambiguous. When in doubt, err toward the earlier stage — it's better to under-flag than to overwhelm with premature requirements.

**Detect security readiness gate:**

Run a lightweight security gate before reviewer selection. This gate decides whether to include the full `security-engineer` reviewer. Mechanical secrets and critical/high dependency scans still run for every audit.

Security reviewer is **included** when any of these are true:

- User focus includes security, auth, privacy, compliance, payments, production, launch, or public release.
- Project stage is `pre-launch` or `production`.
- Public/launch signals exist: custom domain, production URL, deployment config plus production env references, preview protection/public access settings, or launch checklist artifacts.
- Sensitive surface exists: auth, payments, webhooks, user accounts, multi-tenancy, admin areas, file uploads, email sending, public write APIs, database-backed user data, or third-party secrets.
- Mechanical checks find critical/high dependency vulnerabilities, likely hardcoded credentials, unsafe HTML/eval patterns, auth packages, or server endpoints handling untrusted input.

Security reviewer is **skipped** when all of these are true:

- Project stage is `prototype` or `development`.
- No user security focus was requested.
- No public/launch signal is present.
- No sensitive surface is detected.
- Mechanical secret and critical/high vulnerability scans are clean.

When skipped, record `Security gate: lightweight only` in the detection summary and score Security Posture as `--` unless mechanical evidence supports a concrete score. Do not let skipped production-hardening concerns lower the audit score.

**Confirm stage with user:**

After detection, briefly confirm:

```
Detected project stage: [stage] (based on [key signals])
```

If the user corrects it, use their override. With no user response available, proceed with the
detected stage and mark it unconfirmed in the report header — stage drives every severity rating.
