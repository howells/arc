# Subagent Statuses

Build-agent results are transient controller signals. Durable task state is stored in the
plan XML and plan-level state is stored in `docs/arc/plans/INDEX.md`.

## Result mapping

| Agent result         | Controller behavior                                                      | Durable task status                | Plan status                                                |
| -------------------- | ------------------------------------------------------------------------ | ---------------------------------- | ---------------------------------------------------------- |
| `DONE`               | Accept evidence, record result                                           | `done`                             | `IN PROGRESS` until every task is done                     |
| `DONE_WITH_CONCERNS` | Inspect and resolve or explicitly record concerns                        | `done` after resolution/acceptance | `IN PROGRESS`, then `DONE` with note when all tasks finish |
| `NEEDS_CONTEXT`      | Provide context and redispatch the same task                             | `in_progress`                      | `IN PROGRESS`                                              |
| `AUTH_GATE`          | Present dynamic action checkpoint, verify auth, redispatch the same task | `in_progress`                      | `IN PROGRESS`                                              |
| `BLOCKED`            | Change task/approach/capability or escalate                              | `blocked` only when irrecoverable  | `BLOCKED` with reason                                      |

Set `status="in_progress"` before dispatch. Never silently retry without changing the
conditions. `AUTH_GATE` and `NEEDS_CONTEXT` are resumable, not terminal blockers.

## Plan rollup

- All tasks absent/pending: plan `TODO`.
- Any `in_progress` task and no irrecoverable blocker: plan `IN PROGRESS`.
- Any `done` task plus any absent/pending task, with no blocker: plan `IN PROGRESS`.
- Any irrecoverable `blocked` task: plan `BLOCKED`, with a one-line reason.
- During whole-implementation review and the fresh closeout gate, keep the plan `IN PROGRESS`
  even when slice tasks are done. After the gate passes, all tasks `done` rolls to plan `DONE`.
- Accepted `DONE_WITH_CONCERNS`: plan `DONE` with a one-line concerns note after all tasks finish.

`implement` writes this mapping; `improve` reads it. Neither invents another rollup.

## AUTH_GATE protocol

An auth gate report includes the attempted command, error, required human action, verify
command, and retry command. The controller presents `checkpoint:action`, waits for the user,
runs the verify command, then redispatches the **same task**. Auth failure is never permission
to skip work or mark it `blocked`.
