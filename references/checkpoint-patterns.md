# Checkpoint Patterns

When to pause for human input during plan execution, and when to keep going.

## The Automation-First Principle

> If it has a CLI or API and the current request authorizes it, the agent does it. Never ask the
> user to perform automatable work merely to transfer effort.

Automation capability does not imply mutation authority. Checkpoints cover human judgment,
human-only interaction, and explicit consent for destructive or external mutation.

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
  <files>none — reviews the UI produced by dependencies</files>
  <read_first>none — execution context comes from dependencies</read_first>
  <action>Agent starts the development server and presents the named responsive states.</action>
  <verify>
    Agent starts dev server automatically, then verify at http://localhost:3000/dashboard:
    1. Desktop (>1024px): Sidebar visible, content fills remaining space
    2. Tablet (768px): Sidebar collapses to hamburger menu
    3. Mobile (375px): Single column layout, bottom nav visible
  </verify>
  <done>User responds "approved" or describes issues</done>
  <commit>none — checkpoint creates no commit</commit>
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
  <files>none — records a direction before implementation</files>
  <read_first>docs/arc/specs/authentication-spec.md</read_first>
  <action>Present the bounded provider choices and their material trade-offs.</action>
  <options>
    1. Clerk -- Best DX, pre-built UI, paid after 10k MAU
    2. NextAuth -- Free, self-hosted, maximum control
    3. Supabase Auth -- Built-in if already using Supabase DB
  </options>
  <recommendation>Clerk (fastest to ship, handles edge cases)</recommendation>
  <verify>User selects exactly one named option.</verify>
  <done>User selects: clerk, nextauth, or supabase</done>
  <commit>none — checkpoint creates no commit</commit>
</task>
```

### 3. `checkpoint:action` (~1% of checkpoints)

Action checkpoints always emerge dynamically. They have two forms:

- **Human action/authentication:** no CLI/API alternative can complete the required interaction.
- **Mutation authority:** the agent can automate a destructive or external mutation, but the
  current request has not authorized the exact target and consequence.

**Use for:**

- Email verification clicks
- SMS 2FA codes
- OAuth browser approval flows
- Credit card 3DS challenges
- Physical device pairing
- **CLI tool authentication** (vercel login, gh auth login, neonctl auth, supabase login, etc.)
- Approval or rejection of an exact deployment, DNS write, repository creation, destructive
  command, or other external mutation

**Rules:**

- Never pre-plan these in the implementation plan.
- For authentication, provide exact manual steps, verify success, then redispatch the same task
  through the canonical `AUTH_GATE` protocol in `references/subagent-statuses.md`.
- For mutation authority, present the exact command/action, target, expected consequence, and
  rollback/recovery note. Ask `approve` or `decline`; approval authorizes only that proposed action.
- Missing mutation consent is context/authority to obtain before execution, not an auth failure.

The exact auth result mapping and redispatch flow are owned by
`references/subagent-statuses.md`; do not redefine them here.

**Example:**

```xml
<task id="8" depends="" type="checkpoint:action">
  <name>Complete email verification</name>
  <files>none — dynamic authentication gate</files>
  <read_first>none — controller supplies the failed command and error</read_first>
  <action>
    I configured the DNS records and triggered the verification email.
    Steps:
    1. Check inbox for verify@example.com
    2. Click the verification link
  </action>
  <verify>Controller checks the domain status after the user action.</verify>
  <done>User responds "done" (I'll verify the domain status)</done>
  <commit>none — checkpoint creates no commit</commit>
</task>
```

## Quick Reference: What's Automatable?

| Action                      | Automatable?             | Agent does it?          |
| --------------------------- | ------------------------ | ----------------------- |
| Deploy to Vercel            | Yes (vercel CLI)         | YES, after authority    |
| Run tests                   | Yes (pnpm test)          | YES                     |
| Write .env file             | Yes (Write tool)         | YES                     |
| Start dev server            | Yes (pnpm dev)           | YES                     |
| Create DNS records          | Yes (provider CLI/API)   | YES, after authority    |
| Install dependencies        | Yes (pnpm install)       | YES                     |
| Create GitHub repo          | Yes (gh CLI)             | YES, after authority    |
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
- **ACTION:** Exact manual steps, or exact proposed mutation/target/consequence

**User response format:**

- **VERIFY:** "approved" or describe issues to fix
- **DECIDE:** Select an option (e.g., "clerk", "option 2")
- **ACTION:** "done" after a manual step, or `approve` / `decline` for mutation authority

## When NOT to Checkpoint

Do not checkpoint for things verifiable programmatically:

- **Tests pass/fail** -- the test runner reports this
- **Build succeeds** -- the build tool reports this
- **Lint/type errors** -- static analysis catches these
- **File operations** -- the agent confirms success
- **Code correctness** -- tests and type checking cover this
- **Authorized, non-destructive work with a CLI or API** -- the agent runs it

An automatable command can still require authority. Read-only checks may run automatically;
an **external mutation** or destructive command needs authority in the current request or a
dynamic `checkpoint:action` immediately before execution.

## Placement Rules

1. **After automation completes, not before.** Set up the environment, then ask the human to verify.
2. **After UI buildout, before declaring a phase complete.** Human eyes catch what tests miss.
3. **Before dependent work.** Decisions must happen before the implementation that depends on them.
4. **At integration points.** After configuring external services that need manual verification.
5. **MAX one checkpoint per logical milestone.** Don't over-checkpoint. Batch related verifications into a single checkpoint rather than interrupting after every small change.

Never pause on a fixed batch or task cadence. Progress summaries are informational. An
instruction to continue unattended disables routine waits only; it never bypasses decisions,
authentication, external mutation/destructive authority, or subjective UI judgment.

## Anti-Patterns

| Anti-Pattern                      | Why It's Wrong                       | Instead                                                    |
| --------------------------------- | ------------------------------------ | ---------------------------------------------------------- |
| Checkpoint before running tests   | Tests are automatable                | Run tests, only checkpoint if human judgment needed        |
| "Please run pnpm dev"             | Agent can start the server           | Agent starts server, then presents verify checkpoint       |
| Checkpoint after every file       | Too granular, wastes human attention | Batch into logical milestones                              |
| Checkpoint for code review        | Agent has code-reviewer              | Use code-reviewer agent, checkpoint only for subjective UI |
| Pre-planning action checkpoints   | Can't predict auth or consent gates  | Create action checkpoints dynamically when needed          |
| Checkpoint without setup          | Human has to set up context          | Agent prepares everything, human only judges               |
| Skipping task on auth error       | Task is viable, just needs auth      | Report AUTH_GATE, user authenticates, retry same task      |
| Reporting BLOCKED for auth errors | BLOCKED means "change approach"      | AUTH_GATE means "unlock door, then retry same thing"       |

## Session resumption

Prefer a fresh session over repeated lossy compaction. Completed slices are durable through
their plan status and, when authorized, coherent commits. An interrupted slice remains
`status="in_progress"` and resumes through the implementation-baseline procedure in
`references/plan-lifecycle.md`. Never require a commit without prior user authority, and never
discard an interrupted worktree diff merely to make resumption tidy.
