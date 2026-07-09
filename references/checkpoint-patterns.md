# Checkpoint Patterns

When to pause for human input during plan execution, and when to keep going.

## The Automation-First Principle

> If it has a CLI or API, the agent does it. Never ask the user to perform automatable work.

The agent's job is to handle everything a machine can handle. Checkpoints exist only for the gap between what machines can do and what requires human judgment.

## Three Checkpoint Types

### 1. `checkpoint:verify` (~90% of checkpoints)

The agent completed automated work. The human confirms it works visually or functionally.

**Use for:**

- UI checks (layout, responsiveness, visual correctness)
- Interactive flow testing (click-through, form behavior)
- Animation smoothness and timing
- Accessibility testing (screen reader, keyboard nav)

**Rules:**

- Agent sets up the verification environment BEFORE presenting the checkpoint (start dev server, deploy preview, etc.)
- User only does what requires human judgment
- Never ask the user to run CLI commands

**Example:**

```xml
<task id="5" depends="1,2,3,4" type="checkpoint:verify">
  <name>Verify dashboard layout</name>
  <verify>
    Agent starts dev server automatically, then verify at http://localhost:3000/dashboard:
    1. Desktop (>1024px): Sidebar visible, content fills remaining space
    2. Tablet (768px): Sidebar collapses to hamburger menu
    3. Mobile (375px): Single column layout, bottom nav visible
  </verify>
  <done>User responds "approved" or describes issues</done>
</task>
```

### 2. `checkpoint:decide` (~9% of checkpoints)

The human must make a choice that affects implementation direction. The agent cannot proceed without a selection.

**Use for:**

- Technology selection (auth provider, database, hosting)
- Architecture decisions (monorepo vs polyrepo, server vs client)
- Design choices (layout approach, color scheme, animation style)
- Feature prioritization (which scope to cut, what to defer)

**Rules:**

- Present structured options with pros/cons
- Include a recommendation when the agent has enough context
- Agent waits for selection before continuing

**Example:**

```xml
<task id="3" depends="" type="checkpoint:decide">
  <name>Select authentication provider</name>
  <options>
    1. Clerk -- Best DX, pre-built UI, paid after 10k MAU
    2. NextAuth -- Free, self-hosted, maximum control
    3. Supabase Auth -- Built-in if already using Supabase DB
  </options>
  <recommendation>Clerk (fastest to ship, handles edge cases)</recommendation>
  <done>User selects: clerk, nextauth, or supabase</done>
</task>
```

### 3. `checkpoint:action` (~1% of checkpoints)

An action has NO CLI/API alternative and requires human-only interaction. These are rare and **always emerge dynamically during execution** — never pre-planned.

**Use for:**

- Email verification clicks
- SMS 2FA codes
- OAuth browser approval flows
- Credit card 3DS challenges
- Physical device pairing
- **CLI tool authentication** (vercel login, gh auth login, neonctl auth, supabase login, etc.)

**Rules:**

- NEVER use for things the agent can automate
- NEVER pre-plan these in the implementation plan — they're created dynamically when an agent reports `AUTH_GATE`
- Provide exact steps for the manual action
- Agent verifies the action succeeded before continuing
- After verification, the SAME task is re-dispatched — the task is NOT skipped

**Auth Gate Flow:**

```
Agent attempts: vercel deploy
         ↓
Agent receives: "Error: not authenticated"
         ↓
Agent reports: AUTH_GATE (not BLOCKED)
         ↓
Controller creates: dynamic task with type="checkpoint:action"
         ↓
User runs: vercel login
         ↓
Controller verifies: vercel whoami → success
         ↓
Controller re-dispatches: same task to agent
```

**CRITICAL:** The difference between AUTH_GATE and BLOCKED:

- `AUTH_GATE` = "the task works, a human just needs to unlock a door" → retry after auth
- `BLOCKED` = "the task itself can't be done this way" → change the approach

If an agent skips a task because of an auth error, that's a bug in the agent. Auth errors should always produce AUTH_GATE, never BLOCKED, and AUTH_GATE always retries.

**Example:**

```xml
<task id="8" depends="" type="checkpoint:action">
  <name>Complete email verification</name>
  <action>
    I configured the DNS records and triggered the verification email.
    Steps:
    1. Check inbox for verify@example.com
    2. Click the verification link
  </action>
  <done>User responds "done" (I'll verify the domain status)</done>
</task>
```

## Quick Reference: What's Automatable?

| Action                      | Automatable?             | Agent does it?          |
| --------------------------- | ------------------------ | ----------------------- |
| Deploy to Vercel            | Yes (vercel CLI)         | YES                     |
| Run tests                   | Yes (pnpm test)          | YES                     |
| Write .env file             | Yes (Write tool)         | YES                     |
| Start dev server            | Yes (pnpm dev)           | YES                     |
| Create DNS records          | Yes (provider CLI/API)   | YES                     |
| Install dependencies        | Yes (pnpm install)       | YES                     |
| Create GitHub repo          | Yes (gh CLI)             | YES                     |
| Click email verification    | No                       | NO -- checkpoint:action |
| Enter SMS 2FA code          | No                       | NO -- checkpoint:action |
| Visual UI check             | No (requires human eyes) | NO -- checkpoint:verify |
| Animation feel check        | No (subjective judgment) | NO -- checkpoint:verify |
| Choose auth provider        | N/A (decision)           | NO -- checkpoint:decide |
| Pick between design options | N/A (decision)           | NO -- checkpoint:decide |

## Checkpoint Presentation Format

```
--- CHECKPOINT: [Type] ----------------------------------------
Progress: X/Y tasks complete
Task: [Current task name]

[Type-specific content]

-> [What user should do]
----------------------------------------------------------------
```

**Type-specific content:**

- **VERIFY:** What was built, what to look at, verification steps
- **DECIDE:** Options with pros/cons, recommendation if applicable
- **ACTION:** What was attempted, what blocked, exact manual steps

**User response format:**

- **VERIFY:** "approved" or describe issues to fix
- **DECIDE:** Select an option (e.g., "clerk", "option 2")
- **ACTION:** "done" when the manual step is complete

## When NOT to Checkpoint

Do not checkpoint for things verifiable programmatically:

- **Tests pass/fail** -- the test runner reports this
- **Build succeeds** -- the build tool reports this
- **Lint/type errors** -- static analysis catches these
- **File operations** -- the agent confirms success
- **Code correctness** -- tests and type checking cover this
- **Anything with a CLI or API** -- the agent runs it

## Placement Rules

1. **After automation completes, not before.** Set up the environment, then ask the human to verify.
2. **After UI buildout, before declaring a phase complete.** Human eyes catch what tests miss.
3. **Before dependent work.** Decisions must happen before the implementation that depends on them.
4. **At integration points.** After configuring external services that need manual verification.
5. **MAX one checkpoint per logical milestone.** Don't over-checkpoint. Batch related verifications into a single checkpoint rather than interrupting after every small change.

## Anti-Patterns

| Anti-Pattern                      | Why It's Wrong                       | Instead                                                    |
| --------------------------------- | ------------------------------------ | ---------------------------------------------------------- |
| Checkpoint before running tests   | Tests are automatable                | Run tests, only checkpoint if human judgment needed        |
| "Please run pnpm dev"             | Agent can start the server           | Agent starts server, then presents verify checkpoint       |
| Checkpoint after every file       | Too granular, wastes human attention | Batch into logical milestones                              |
| Checkpoint for code review        | Agent has code-reviewer              | Use code-reviewer agent, checkpoint only for subjective UI |
| Pre-planning action checkpoints   | Can't predict auth gates             | Create action checkpoints dynamically when blocked         |
| Checkpoint without setup          | Human has to set up context          | Agent prepares everything, human only judges               |
| Skipping task on auth error       | Task is viable, just needs auth      | Report AUTH_GATE, user authenticates, retry same task      |
| Reporting BLOCKED for auth errors | BLOCKED means "change approach"      | AUTH_GATE means "unlock door, then retry same thing"       |

## Session Resumption: Clear, Don't Compact

A context that compacts into a summary drifts from peak performance with each compaction — detail is lost and the agent re-reasons from a lossy digest. When the context runs long, clear it and resume from the plan file instead.

Checkpoint discipline is what makes clearing cheap: atomic commits hold the code, and the plan file holds live per-task status plus the decision log (see the implement skill, Step 7). Together they let a fresh session pick up where the last one stopped without re-exploring.

**When the context runs long:**

1. Finish the current task — do not clear mid-task.
2. Commit the work.
3. Write status back into the plan file: mark the task done, record deviations and non-obvious decisions in the decision log.
4. Start a fresh session and resume from the plan file.

Do NOT compact and push on. Compaction trades context quality for a longer run; a clean resume from committed code and an up-to-date plan keeps every task at full capability.
