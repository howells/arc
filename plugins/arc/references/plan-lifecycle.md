# Plan Lifecycle

This reference owns durable plan/task state, implementation baselines, resumption, the plan
index, and drift checks. Agent result mapping lives in `references/subagent-statuses.md`.

## Plan index

`docs/arc/plans/INDEX.md` tracks only `*-implementation.md` plans.

| Column       | Content                                                  |
| ------------ | -------------------------------------------------------- |
| Plan         | Filename relative to `docs/arc/plans/`                   |
| Title        | Short imperative title                                   |
| Priority     | P1 / P2 / P3                                             |
| Effort       | S / M / L                                                |
| Depends on   | Plan filenames or `—`                                    |
| Status       | `TODO` / `IN PROGRESS` / `DONE` / `BLOCKED` / `REJECTED` |
| Last touched | Date of the latest status write                          |
| Notes        | One-line block, drift, verification, or concern context  |

`BLOCKED` and `REJECTED` require a reason. The index may also record recommended order and
dependency notes.

### Rejected ledger

A required section once anything has been rejected. It is what stops a dismissed finding
resurfacing every time a new report is read, so it must survive as long as the index does.

| Column   | Content                                                     |
| -------- | ----------------------------------------------------------- |
| Finding  | One-line description, enough to recognise a restatement of it |
| Evidence | `file:line` as originally cited                              |
| Reason   | Why it was rejected — by design, already fixed, not worth it |
| Date     | When the verdict was recorded                                |

Match new findings against this ledger before planning them. A finding that reappears with
materially new evidence may be reopened; note that in the Reason column rather than deleting the row.

### Deferred findings

Real findings not being planned yet. Same shape as the rejected ledger, with Reason replaced by
what would need to change for them to be picked up.

### Creating the index

When no index exists, create it: an H1 (`# Plan Index`), a one-line preamble, and the
8-column table. The Rejected ledger and Deferred findings sections are created on first
use — not empty at birth.

### Multi-writer discipline

- Re-read the index immediately before a write.
- Change only the row the current workflow owns.
- Update `Last touched` on every status write.
- Never delete the index or plan files during status maintenance.
- Verify an indexed plan file exists before selecting it.

## Durable task state

Absent status is the legacy spelling of pending.

```text
absent/pending -> status="in_progress" -> status="done"
                                      \-> status="blocked"
```

Set `status="in_progress"` before dispatch. `AUTH_GATE` and `NEEDS_CONTEXT` leave it in
progress; only an irrecoverable blocker becomes `blocked`. The exact agent-result mapping and
plan rollup live in `references/subagent-statuses.md`.

## Implementation baseline

Before changing files, capture and persist an **Implementation baseline** in the plan's
`## Implementation state` block:

- starting HEAD;
- declared task paths;
- pre-existing dirty paths and their initial fingerprints;
- current plan/index metadata paths, which are never implementation evidence.

For a saved plan, write this block before the first task becomes `in_progress`:

```markdown
## Implementation state

**Execution base:** <full starting HEAD>
**Declared scope:** <exact pathspecs for the selected tasks>
**Pre-existing dirty paths:**

- <path> — <initial content fingerprint>

**Excluded metadata:** <plan path and docs/arc/plans/INDEX.md>
**Commit posture:** authorized per-slice | uncommitted
**Last coherent commit:** <SHA or none>
**Closeout:** pending
```

Use `none` explicitly when there are no dirty paths or commits. During execution, update only
`Last coherent commit` and `Closeout`. After the fresh gate succeeds, set closeout to `passed`
with the date, attributable target fingerprint, and exact gate commands. This is a durable audit
marker, not a reusable verification receipt. An inline plan records the same block in controller
context; if it must survive outside that task/thread record, save it before editing.

Whole-implementation review compares the implementation base through current HEAD plus
attributable working-tree changes. `Planned at` is not the implementation base; it remains
the drift baseline.

Unchanged pre-existing dirty paths are excluded from review and verification receipts. If a
slice overlaps a pre-existing dirty path, report `NEEDS_CONTEXT` rather than overwrite,
discard, or guess which edits belong to whom.

## Interrupted-slice resumption

For `status="in_progress"`, read the task, declared paths, implementation baseline, last
coherent commit, current attributable diff, and decision log. Re-run focused evidence before
continuing. Never assume completion and never discard or overwrite an interrupted diff.
Slice-boundary recovery is the durable unit; Arc does not persist every red/green micro-step.

If a legacy interrupted plan has no implementation-state block, do not reconstruct ownership
from the current dirty tree. Report `NEEDS_CONTEXT` and ask the user to identify pre-existing
work before creating the missing baseline.

## Decision log

Every plan ends with `## Decision log`. Record drift, assurance escalation, legacy-kind
normalization, deviations, dirty-path overlap decisions, superseded legacy commit directives,
and non-obvious implementation choices. Do not log a task that ran exactly as planned.

## Drift check

The plan header field `Planned at: <short SHA>` records the planning commit.

1. Resolve it with `git cat-file -e <sha>^{commit}`. If this fails, report **cannot verify drift**
   and proceed with extra care; an erroring diff is never a clean result.
2. Check `git merge-base --is-ancestor <sha> HEAD`. Warn on divergent ancestry.
3. Run `git diff --stat <sha>..HEAD -- <in-scope paths>` against task files and read-first
   paths.
4. On drift, re-read current files and record the drift. Flag, **never re-baseline**:
   never silently update `Planned at`. It changes only with a human-visible plan refresh.

## Verification receipts

Receipt semantics live in `references/implementation-assurance.md`. Receipts are session-local
execution evidence, not durable plan state. Plan/index status writes never invalidate an
otherwise unchanged implementation receipt.
