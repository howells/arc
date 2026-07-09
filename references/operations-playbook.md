# Operations Playbook

Remediation patterns for the **Operations** axis of `/arc:audit`. When a repo scores low on CI, gating, env hygiene, scheduled-job reliability, or data readiness, this is the canonical shape to move it toward. Adapt commands to the repo's actual package manager and gate script — don't invent new ones.

## (a) CI scaffold

Run the repo's **existing** gate (`pnpm check` / `pnpm check:affected`) on push and PR. Don't add a parallel set of checks CI-only.

```yaml
# .github/workflows/check.yml
name: check
on:
  push: { branches: [main] }
  pull_request:
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .node-version
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm check:affected || pnpm check
```

- Pin Node via `.node-version` (single source with local dev), not a hardcoded version.
- Use `--frozen-lockfile` so CI fails on lockfile drift instead of silently resolving.

## (b) Gate enforcement

- **Pre-push hook** (husky) runs the same gate locally so red never reaches the remote:

  ```sh
  # .husky/pre-push
  pnpm check:affected || pnpm check
  ```

- **Fail-on-red discipline:** the gate is a hard boundary. No `--no-verify`, no "fix in a follow-up." A red gate blocks merge.
- **Keep the gate fast and minimal:** an agent idling on CI stalls the whole loop. Prefer local test runs in the agent loop for iteration, with CI as the final backstop. When the gate grows slow, treat that as an operations defect worth fixing.
- **Boundaries:** for JS/TS workspaces, the gate SHOULD include an architecture-boundary check so illegal imports fail the build, not review. Where boundaries are configured (`boundaries`/`fenceline`), wire that check into the gate. Where none is configured, recommend initializing one (`boundaries init --dry-run` from `@howells/boundaries`, reviewed before applying).

## (c) Env convention (one canonical shape)

- **Typed schema** — one `env.schema.ts` (envy-style) is the single source of truth. Parse `process.env` through it at startup; fail fast with a readable error listing missing/invalid vars.
- **`env:check` script** — validates the current environment against the schema without booting the app. Run it in CI and in the pre-push gate.
- **env-doctor** — a command that reports which vars are set, missing, or malformed (never printing secret values), so onboarding and drift debugging are one command.
- **Vercel sync/drift** — a check that diffs the schema's required keys against the Vercel project env (`vercel env ls`) and flags keys present in one but not the other. Run before promotion.

## (d) Scheduled jobs

- **Registry** — keep one list of every recurring job: Vercel crons (`vercel.json` `crons`) and GitHub `schedule` workflows. An undocumented cron is an outage waiting to happen.
- **Every job alerts on failure.** No silent crons. Minimum viable alerting:

  ```yaml
  # in a scheduled workflow
  - name: notify on failure
    if: failure()
    run: gh issue create --title "cron failed: ${{ github.workflow }}" --body "Run ${{ github.run_id }}" --label ops
  ```

  For Vercel crons, the invoked route reports its own failure (issue, webhook, or log-based alert) — a 500 that nobody sees is not alerting.

## (e) Data-readiness gate

Before a demo or launch, verify the data is actually seeded and consistent — not just that the app boots.

- A `status --strict` (or `doctor --strict`) command that checks row counts, required seed records, referential consistency, and any "must exist before launch" invariants, and exits non-zero if anything is off.
- Wire it into the launch checklist so "looks fine locally" can't hide an empty or half-migrated database.

## (f) Resumable batch jobs

Long-running backfills/imports must be safe to re-run:

- **Idempotent** — re-processing a row produces the same result (upsert on a stable key, not blind insert).
- **Checkpointed** — persist progress (last processed id/cursor) so a crash resumes instead of restarting.
- **Safe to re-run to completion** — running it twice end-to-end leaves the same final state; no double-charges, no duplicate rows.
- Log a running tally (processed / skipped / failed) so an interrupted run is diagnosable.
