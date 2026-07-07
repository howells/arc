# Database Lifecycle

Safe schema evolution, seeding, and backup posture. Load this when a change touches the database — migrations, backfills, or the data model. Pairs with [operations-playbook.md](operations-playbook.md) (data-readiness gate) and the `database` rule.

## Schema changes go through migrations

- **Generated + reviewed migrations only** for anything shared. Generate the migration from the schema diff (e.g. `drizzle-kit generate`, `prisma migrate dev`), then **read the generated SQL** before committing. A generator can propose a destructive step (drop column, narrow type) that a human must catch.
- Every migration is committed to version control and reviewed like code. The diff is the record of what changed and why.

### `db:push` is for throwaway DBs only

`db:push` (schema push without a migration file) skips the migration history. It is acceptable **only** on a local, disposable database you own.

- **NEVER `db:push` a shared or production database.** It leaves no journal, can silently drop data, and diverges environments.
- This is flagged **"dangerous — ask first"** in every one of the user's project `AGENTS.md` files. Treat any request to push against a non-local DB as a checkpoint: stop and confirm.

## Migration journal

- Maintain a committed, ordered history of applied migrations (the migrations folder + the framework's journal/meta file). This is the source of truth for what has run where.
- Migrations are **append-only** once merged. Never edit a migration that has run in any shared environment — write a new one that corrects it.
- The applied set in each environment should match the journal. Drift (a migration in the folder that never ran, or a manual change with no migration) is an incident to reconcile.

## Seed & backfill safety

- **Idempotent** — re-running a seed/backfill converges to the same state (upsert on a stable key). Never assume it runs exactly once.
- **Dry-run first** — support a mode that reports what _would_ change (counts, sample rows) without writing. Inspect it before the real run.
- **Row-count sanity checks** — capture `before`/`after` counts and assert they're in the expected range. A backfill that touches 10× more rows than expected should abort, not proceed.
- **Batched + checkpointed** for large backfills, so an interruption resumes (see operations-playbook resumable-batch discipline).

## Backup posture

Before any risky migration, and as standing practice:

- **Managed Postgres (e.g. Neon):** verify PITR / branch retention is enabled and covers a useful window. On Neon, take a branch before a destructive migration — it's a cheap instant rollback point.
- **Otherwise:** a scheduled logical dump (`pg_dump`) with verified, restorable output. A backup you've never test-restored is a hope, not a backup.
- Know the restore path _before_ you need it: how long it takes and who can run it.
