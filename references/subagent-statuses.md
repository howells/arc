# Subagent Statuses

Build agents should report one of these statuses so the controller can react consistently.

## Status Values

- `DONE` -> work completed, proceed to review
- `DONE_WITH_CONCERNS` -> work completed, but the agent has correctness or maintainability concerns that should be read before review
- `NEEDS_CONTEXT` -> the task is viable, but required context was missing
- `BLOCKED` -> the agent cannot complete the task without changing the task, approach, or model capability
- `AUTH_GATE` -> the agent attempted an automated action that requires human authentication before it can proceed

## Controller Behavior

- `DONE` -> send to spec review, then code review
- `DONE_WITH_CONCERNS` -> inspect concerns first, then decide whether to clarify or review
- `NEEDS_CONTEXT` -> provide targeted context and re-dispatch
- `BLOCKED` -> either split the task, upgrade model capability, or escalate to the human
- `AUTH_GATE` -> present a dynamic CHECKPOINT:ACTION to the user, verify auth succeeded, then re-dispatch the same task

Never ignore `BLOCKED`, `NEEDS_CONTEXT`, or `AUTH_GATE`. Change something before retrying.

## Plan-Level Rollup

Task statuses above are per-task. When a whole plan's status is written to the plan index
(`docs/arc/plans/INDEX.md` — see `references/plan-lifecycle.md`), collapse the plan's task
statuses with this rollup:

- All tasks `DONE` → plan `DONE`
- Mix of `DONE` and `DONE_WITH_CONCERNS` → plan `DONE`, with a one-line note on the concerns
- Any unresolved `BLOCKED`, `AUTH_GATE`, or `NEEDS_CONTEXT` → plan `BLOCKED`, with the reason

`implement` writes this rollup; `improve`'s reconcile reads it. Neither invents its own.

## AUTH_GATE Protocol

`AUTH_GATE` is NOT `BLOCKED`. The distinction matters:

- `BLOCKED` = "this task can't be done, change the approach"
- `AUTH_GATE` = "this task CAN be done, but a human needs to unlock a door first"

When an agent reports `AUTH_GATE`, it MUST include:

```markdown
### Status: AUTH_GATE

**Attempted:** [exact command that failed]
**Error:** [the error message received]
**Human action:** [what the user needs to do — e.g., run `vercel login`]
**Verify:** [command to confirm auth succeeded — e.g., `vercel whoami`]
**Retry:** [exact command to re-run after auth]
```

The controller:

1. Presents a CHECKPOINT:ACTION with the human action
2. Waits for user to confirm "done"
3. Runs the verify command to confirm auth succeeded
4. Re-dispatches the SAME task to the agent (not the next task)

Common auth gates:

- `vercel deploy` → `vercel login`
- `gh pr create` → `gh auth login`
- `neonctl` → `neonctl auth`
- `supabase` → `supabase login`
- Any API key → user sets env var
- Any OAuth flow → browser approval
