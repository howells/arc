# Plan Lifecycle

The shared contracts for plans that live beyond a single session. This file is the single
source of truth for the plan index schema and the drift-check procedure. `detail` (writes
plan headers), `implement` (selects and executes plans), and `improve` (builds and reconciles
the backlog) all cite this file — none of them redefines these rules locally.

## The plan index: `docs/arc/plans/INDEX.md`

The index tracks executable implementation plans across sessions. Only `*-implementation.md`
files get rows — refactor RFCs (`*-refactor-rfc.md`) and other documents in `docs/arc/plans/`
are never indexed; an RFC becomes indexable only after it passes through `detail` into an
implementation plan.

### Status table

| Column | Content |
| ------------ | ------------------------------------------------------------------ |
| Plan | Filename (relative to `docs/arc/plans/`) |
| Title | Short imperative title |
| Priority | P1 / P2 / P3 |
| Effort | S / M / L |
| Depends on | Plan filenames, or `—` |
| Status | `TODO` \| `IN PROGRESS` \| `DONE` \| `BLOCKED` \| `REJECTED` |
| Last touched | YYYY-MM-DD of the most recent status write |
| Notes | One line of status context: block reason, rejection rationale, drift flag, verification stamp, spot-check result, or rollup concerns |

Statuses are **plan-level**. They are not the per-task build-agent statuses (`DONE`,
`DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, `BLOCKED`, `AUTH_GATE`) — the rollup from task
statuses to a plan status is defined in `references/subagent-statuses.md`.

- `BLOCKED` and `REJECTED` rows always carry a one-line reason in Notes.
- `REJECTED` covers both "approach abandoned" and "fixed independently".

### Other index sections

- **Recommended order** — execution order when dependencies allow a choice.
- **Dependency notes** — why plan B needs plan A, one line each.
- **Considered and rejected** — the rejected-findings ledger: findings judged not worth
  doing, one line of reasoning each, so they are not re-surfaced by future runs.
- **Deferred findings** — vetted findings the user chose not to plan yet: title, evidence
  `file:line`, and vet date. Future intake starts here instead of re-deriving and re-vetting
  them from scratch; a deferred finding graduates to a plan row or moves to the rejected
  ledger on a later run.

### Per-task status markers (inside a plan file)

Plan-level status lives in the index; per-task status lives in the plan itself. When
`implement` completes or blocks a task, it sets a `status` attribute on that task's XML
element — `<task id="2" ... status="done">` or `status="blocked"` — and an absent attribute
means the task has not run. This attribute is what improve's first-run adoption and
reconcile's stale-`IN PROGRESS` check read; nothing else in a plan is a status marker.

### Write discipline

The index is multi-writer (improve creates and reconciles it; implement updates rows as it
executes). To avoid lost updates:

- **Per-row writes only.** Re-read `INDEX.md` immediately before writing, and change only the
  row for the plan you own. Never rewrite the whole table from an earlier in-session read.
- Update `Last touched` on every status write.
- Reconcile (in `improve`) is the self-healing backstop for lost updates — not a substitute
  for this rule.
- **Never delete the index or plan files** as part of status maintenance. Rows are corrected
  or marked `REJECTED`; files stay as the record.

Before executing a plan selected from the index, verify the plan file exists — a user may
have deleted or renamed it by hand. If it is missing, flag the row and fall back to normal
plan discovery.

## Drift check

Plans are written against a moment in the repo's history. The header field:

```
Planned at: <short SHA>
```

records that moment (`git rev-parse --short HEAD` at plan-writing time). Anyone consuming
the plan later — implement before execution, improve during reconcile — runs this procedure
against the plan's in-scope paths (its `<files>` and `<read_first>` lists):

1. **Resolve the SHA**: `git cat-file -e <sha>^{commit}`. If it fails (shallow clone, rebased
   or garbage-collected history), report **"cannot verify drift"** and proceed with extra
   care. Never treat an erroring diff as "no drift" — an empty stdout from a failed command
   is not a clean result.
2. **Check ancestry**: `git merge-base --is-ancestor <sha> HEAD`. If the planned-at commit is
   not an ancestor of HEAD, the diff spans divergent branches and will include unrelated
   changes — warn instead of trusting the numbers.
3. **Diff the scope**: `git diff --stat <sha>..HEAD -- <in-scope paths>`. No output means no
   drift in scope.
4. **On drift: flag, never re-baseline.** Re-verify the current state of the drifted files
   (the plan's `<read_first>` discipline) before acting, and record the drift where the
   consumer keeps its log (implement's decision log; improve's index Notes). Do **not**
   silently update `Planned at:` to the current HEAD — that hides the drift from the next
   check. The SHA is only updated when a human-visible refresh of the plan's content happens
   with it.
