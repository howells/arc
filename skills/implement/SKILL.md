---
name: implement
description: |
  Scope-aware implementation workflow with TDD and continuous quality checks.
  Use when asked to "implement this", "build this feature", "execute the plan",
  or after /arc:ideate has created a design doc. For small work it creates a
  lightweight inline plan; for larger work it creates or loads a full implementation
  plan and executes task-by-task with build agents.
license: MIT
metadata:
  author: howells
website:
  order: 5
  desc: Plan + execute
  summary: Scope-aware planning plus execution with TDD. Small changes get a lightweight inline plan; larger changes get the full implementation workflow.
  what: |
    Implement decides how much ceremony the work needs before it starts building. Small, well-bounded changes get an inline plan and the same TDD + quality gates without forcing a separate plan document. Larger features still use the full detail-driven implementation flow: plan creation, task execution, review checkpoints, and whole-plan verification. In both paths the loop is the same: tests first, then implementation, then typecheck, lint, review, and commit.
  why: |
    The quality bar should stay constant even when the scope changes. TDD produces better code, but developers skip it because writing tests is boring and heavyweight workflows feel like overkill for small tasks. Implement keeps the discipline while scaling the planning ceremony to the work.
  decisions:
    - Planning is built in. Uses inline planning for small scope, full plans for large scope.
    - Test-first is mandatory. The AI writes them, so there's no reason to skip.
    - Quality gates after every task. TypeScript and lint errors don't accumulate.
    - Strongly recommends review before building larger work.
  workflow:
    position: spine
    after: review
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## REQUIRED TOOLS — use these when specified in the process:
- **`AskUserQuestion`** — Preserve the one-question-at-a-time interaction pattern at every decision point marked with `AskUserQuestion:` in the process below. In Claude Code, use the tool. In Codex, ask one concise plain-text question at a time unless a structured question tool is actually available in the current mode. Do not narrate missing tools or fallbacks to the user.

## BANNED TOOLS — calling these is a skill violation:
- **`EnterPlanMode`** — BANNED. Do NOT call this tool. This skill has its own structured process — planning (via detail skill) and execution (via build agents). Claude's built-in plan mode would bypass this entire orchestration. Follow the phases below instead.
- **`ExitPlanMode`** — BANNED. You are never in plan mode. There is nothing to exit.

If you feel the urge to "plan before acting" — that urge is satisfied by following the `<process>` phases below. Phase 0 creates the plan via the detail skill. Phases 1-7 execute it. Execute them directly.
</tool_restrictions>

<arc_runtime>
This workflow requires the full Arc bundle, not a prompts-only install.

Paths in this skill use these conventions:
- `agents/...`, `references/...`, `disciplines/...`, `templates/...`, `scripts/...`, `rules/...`, `skills/<name>/...` are Arc-owned files at the plugin root. Resolve the plugin root from this skill's filesystem location — it's the directory containing `agents/` and `skills/`.
- `./...` is local to this skill's directory.
- `.ruler/...`, `docs/...`, `src/...`, or any project-relative path refers to the user's project repository.
</arc_runtime>

<required_reading>
**Read these reference files NOW:**
1. references/testing-patterns.md
2. references/task-granularity.md
3. references/checkpoint-patterns.md
4. references/subagent-statuses.md
5. references/arc-paths.md

**Load these only when relevant:**
- references/frontend-design.md — if UI work is involved
- references/model-strategy.md — when choosing build models
- disciplines/dispatching-parallel-agents.md — when parallel reviewers/build agents are needed
- disciplines/finishing-a-development-branch.md — before finalizing the branch
- disciplines/subagent-driven-development.md — when executing through build agents
- disciplines/verification-before-completion.md — before closing the work
</required_reading>

<build_agents>
**Available build agents in `agents/build/`:**

| Agent | Model | Use For |
|-------|-------|---------|
| `implementer` | opus | General task execution — utilities, services, APIs, business logic |
| `fixer` | haiku | TypeScript errors, lint issues — fast mechanical fixes |
| `debugger` | sonnet | Failing tests — systematic root cause analysis |
| `unit-test-writer` | sonnet | Unit tests (vitest) — pure functions, components |
| `integration-test-writer` | sonnet | Integration tests (vitest + MSW) — API, auth |
| `e2e-test-writer` | opus | E2E tests (Playwright) — user journeys |
| `ui-builder` | opus | UI components from design spec — anti-slop, memorable |
| `design-specifier` | opus | Design decisions when no spec exists — empty states, visual direction |
| `figma-builder` | opus | Build UI directly from Figma URL |
| `test-runner` | haiku | Run vitest, analyze failures |
| `e2e-runner` | opus | Playwright tests — iterate until green or report blockers |
| `spec-reviewer` | sonnet | Spec compliance check — nothing missing, nothing extra |
| `code-reviewer` | haiku | Quick code quality gate — no `any`, proper error handling, tests exist |
| `plan-completion-reviewer` | sonnet | Whole-plan gate — all tasks built, nothing skipped, no scope creep |

**Before spawning a build agent:**
1. Read the agent file: `agents/build/[agent-name].md`
2. Use the model specified in the agent's frontmatter
3. Include relevant context from the task

**Spawn syntax:**
```
Task [agent-name] model: [model]: "[task description with context]"
```
</build_agents>

<rules_context>
**Check for project coding rules:**

**Use Glob tool:** `.ruler/*.md`

**If `.ruler/` exists, detect stack and read relevant rules:**

| Check | Read from `.ruler/` |
|-------|---------------------|
| Always | code-style.md |
| `next.config.*` exists | nextjs.md |
| `react` in package.json | react.md |
| `tailwindcss` in package.json | tailwind.md |
| `.ts` or `.tsx` files | typescript.md |
| `vitest` or `jest` in package.json | testing.md |
| Always | error-handling.md |
| Always | security.md |
| `drizzle` or `prisma` in package.json | database.md |
| `wrangler.toml` exists | cloudflare-workers.md |
| `ai` in package.json | ai-sdk.md |
| `@clerk/nextjs` or `@workos-inc/authkit-nextjs` in package.json | auth.md |

These rules define MUST/SHOULD/NEVER constraints. Follow them during implementation.

**If `.ruler/` doesn't exist:**
```
No coding rules found. Run /arc:rules to set up standards, or continue without rules.
```

Rules are optional — proceed without them if the user prefers.

**For UI/frontend work, also load interface rules:**

| Check | Read from `rules/interface/` |
|-------|---------------------------------------------------|
| Building components/pages | design.md, colors.md, spacing.md, layout.md, tailwind-authoring.md, surfaces.md, sections.md |
| Typography changes | typography.md |
| Adding animations | animation.md, performance.md |
| Form work | forms.md, interactions.md, buttons.md |
| Interactive elements | interactions.md, buttons.md |
| Marketing pages | marketing.md |

**Additional references (load as needed):**
- `references/component-design.md` — React component patterns
- `references/animation-patterns.md` — Motion design
- `references/nextjs-app-router.md` — Next.js App Router patterns (if using Next.js)
- `references/tanstack-query-trpc.md` — TanStack Query + tRPC patterns (if data fetching)
- `references/tanstack-table.md` — TanStack Table v8 patterns (if data tables)
- `references/ai-sdk.md` — AI SDK 6 patterns (if `ai` in package.json)
</rules_context>

<process>

**You are here in the arc:**
```
/arc:ideate     → Design doc (on main) ✓
     ↓
/arc:implement  → Plan + Execute ← YOU ARE HERE
     ↓
/arc:review     → Review (optional, can run anytime)
```

## Phase 0: Scope Detection

Assess what is being asked before choosing the heavier workflow.

| Signal | Small Scope | Large Scope |
|--------|-------------|-------------|
| Files affected | 1-5 | 6+ |
| New patterns | No | Yes |
| Design decisions | Minimal | Significant |
| Spec or design doc exists | Maybe | Should |

**Use the small-scope path when the change is bounded and the implementation shape is already obvious:**
- Stay in the current shared workspace. Create a simple feature branch if needed.
- Create an inline plan instead of requiring a saved implementation plan.
- Keep the same per-task loop: test -> build -> TDD -> fix -> spec -> quality -> commit.
- Skip plan-completion-reviewer for fewer than 4 tasks unless the user explicitly wants it.
- Offer review, but don't push it as hard as the large-scope flow.

**Use the large-scope path when the work introduces new patterns, significant product decisions, or multiple moving parts:**
- Load an existing implementation plan or create one via `detail`.
- Strongly recommend `/arc:review` before building.
- Use the full task execution flow, checkpoints, and plan-completion verification.

**When in doubt:** make a recommendation, show the chosen posture in the plan, and let the user correct it before coding.

## Phase 0.5: Planning

**Check for existing implementation plan:**
```bash
ls docs/arc/plans/*-implementation.md docs/plans/*-implementation.md 2>/dev/null | tail -1
```

**If plan exists:** Skip to Phase 1.

**If no plan exists:** Follow the detail skill to create one:

```
Read: skills/detail/SKILL.md
```

The detail skill will:
1. Load design document
2. Detect project stack
3. Find reusable patterns
4. Break down into TDD tasks
5. Save implementation plan

After a large-scope plan is created, strongly recommend review:

```
AskUserQuestion:
  question: "Implementation plan ready. I strongly recommend reviewing the plan before building — it's much cheaper to catch issues now than after writing code."
  header: "Review Before Building?"
  options:
    - label: "Review first"
      description: "Run /arc:review on the plan before implementing (recommended)"
    - label: "Skip review"
      description: "Start implementing immediately"
```

If "Review first" → invoke `/arc:review`, then return here.

---

**If the work is small scope and no plan exists, create an inline plan instead of stopping:**

```markdown
## Inline Build Plan: [Feature Name]

### Scope posture
- Small scope because: [1-2 concrete reasons]

### Files to create/modify
| File | Action | Purpose |
|------|--------|---------|

### Implementation approach
1. [Step]
2. [Step]
3. [Step]

### Test coverage
- Unit:
- Integration:
- E2E:

### Quality gates
- Failing test before implementation
- `pnpm tsc --noEmit`
- `pnpm biome check --write .`
```

Share the inline plan, confirm it looks right, then proceed directly to execution.

## Phase 1: Setup

**If not already on a feature branch:**
```bash
# Check current location
git branch --show-current

# If on main/dev, create a feature branch
git checkout -b feature/<feature-name>
```

**Codex note:** In shared-workspace environments, work in the current working directory on a feature branch so the user sees edits immediately.

**Install dependencies:**
```bash
pnpm install  # or yarn/npm based on lockfile
```

**Verify test infrastructure exists:**
```bash
# Check for test runner in package.json
grep -E '"vitest"|"jest"|"playwright"' package.json
```

If no test runner → stop and ask user. Cannot proceed with TDD without a runner.

**Verify clean baseline:**
```bash
pnpm test     # or relevant test command
```

If tests fail before you start → stop and ask user.

## Phase 2: Load Plan and Create Todos

**Read implementation plan** (created in Phase 0 or pre-existing):
`docs/arc/plans/YYYY-MM-DD-<topic>-implementation.md` (fallback: `docs/plans/...`)

**Parse XML tasks:**
The plan contains `<task>` elements with structured fields. For each task:
- Extract `id`, `depends`, `type` attributes
- Note `<read_first>` files, `<action>` instructions, `<verify>` criteria
- Build a dependency graph from `depends` attributes

**Create TodoWrite tasks:**
One todo per `<task>` in the plan. Mark first as `in_progress`.

**Before implementation starts, confirm the plan includes:**
- a file structure section
- XML tasks with all required elements (`<name>`, `<files>`, `<read_first>`, `<action>`, `<verify>`, `<done>`, `<commit>`)
- `<verify>` criteria that are concrete (no "works correctly", "looks good")
- checkpoint tasks only where human judgment is required

If any of those are missing, fix the plan before dispatching build agents.

## Phase 2b: Plan Test Coverage

**Before implementation, identify test needs:**

```markdown
## Test Coverage Plan

### Unit Tests (per task)
| Task | Test File | What to Test |
|------|-----------|--------------|
| Task 1: Create utility | src/utils/x.test.ts | Input/output, edge cases |
| Task 2: Create component | src/components/x.test.tsx | Rendering, props |

### Integration Tests (per feature)
| Feature | Test File | What to Test |
|---------|-----------|--------------|
| Signup form | src/features/auth/signup.integration.test.ts | Form + API + validation |

### E2E Tests (critical flows only)
| Flow | Test File | What to Test |
|------|-----------|--------------|
| User signup → dashboard | tests/signup.spec.ts | Full journey |
```

**Determine auth testing needs:**
- Uses Clerk? → integration-test-writer with Clerk mocks
- Uses WorkOS? → integration-test-writer with WorkOS mocks
- Has protected routes? → e2e-test-writer with auth.setup.ts

This plan guides which test agent to spawn for each task.

## Phase 2c: Handle Build-Agent Statuses

Build agents must report one of:

- `DONE`
- `DONE_WITH_CONCERNS`
- `NEEDS_CONTEXT`
- `BLOCKED`
- `AUTH_GATE`

Controller behavior:
- `DONE` → continue to review
- `DONE_WITH_CONCERNS` → read concerns, then decide whether to clarify or review
- `NEEDS_CONTEXT` → provide the missing context and re-dispatch
- `BLOCKED` → split the task, upgrade model capability, or escalate to the user
- `AUTH_GATE` → present dynamic CHECKPOINT:ACTION, verify auth, re-dispatch same task

Never silently retry a blocked task without changing the conditions.

### AUTH_GATE Handling

When an agent reports `AUTH_GATE`, the task is NOT skipped. Follow this protocol:

1. **Read the agent's report** — it includes: attempted command, error, human action, verify command, retry command
2. **Present CHECKPOINT:ACTION to user:**
```
AskUserQuestion:
  question: "The agent tried `[attempted command]` but hit an auth wall: [error]. Please [human action], then confirm."
  header: "Authentication Required"
  options:
    - label: "Done"
      description: "I've completed the authentication step"
    - label: "Need help"
      description: "I need more guidance"
```
3. **After user confirms "Done"** — run the verify command (e.g., `vercel whoami`) to confirm auth succeeded
4. **If verify passes** — re-dispatch the SAME task to the agent (not the next task)
5. **If verify fails** — tell the user what went wrong, ask them to try again

**CRITICAL:** Never skip a task because of an auth error. Never move to the next task. The whole point of AUTH_GATE is that the task is viable — it just needs a human to unlock a door.

## Phase 3: Execute in Batches

**Default batch size: 3 tasks**

**Per-task loop:**
```
┌─────────────────────────────────────────────────────────┐
│  1. CLASSIFY  → what type of task? what test level?     │
│  2. TEST      → spawn test agent (unit/integration/e2e) │
│  3. BUILD     → implementer / ui-builder / specialized  │
│  4. TDD       → run test (fail→impl→pass)               │
│  5. FIX       → fixer (TS/lint cleanup)                 │
│  6. SPEC      → spec-reviewer (matches spec?)           │
│       ↳ issues? → fix → re-review                       │
│  7. QUALITY   → code-reviewer (well-built?)             │
│       ↳ issues? → fix → re-review                       │
│  8. COMMIT    → atomic commit, mark complete            │
└─────────────────────────────────────────────────────────┘
```

For each task:

### Step 1: Mark in_progress
Update TodoWrite.

### Step 2: Classify Task Type

Determine which build agent(s) may be needed:

| Task Type | Primary Agent | When to Use |
|-----------|---------------|-------------|
| General implementation | implementer | Utilities, services, APIs, business logic |
| Write unit tests | unit-test-writer | Pure functions, components, hooks |
| Write integration tests | integration-test-writer | API mocking, auth states |
| Write E2E tests | e2e-test-writer | User journeys, Playwright |
| Build UI from spec | ui-builder | UI components with existing design direction |
| Build UI from Figma | figma-builder | Figma URL provided |
| Design decisions needed | design-specifier | No spec exists (empty states, visual direction) |
| Fix TS/lint errors | fixer | Mechanical cleanup |
| Debug failing tests | debugger | Test failures |
| Run E2E tests | e2e-runner | Playwright test suites |
| Verify spec compliance | spec-reviewer | After implementation, before code quality |

**Agent selection flow:**
1. Is this general code (no UI)? → implementer
2. Is this UI with Figma? → figma-builder
3. Is this UI with design spec? → ui-builder
4. Is this UI with no spec? → design-specifier first, then ui-builder
5. Did something break? → debugger or fixer
6. Task complete? → spec-reviewer to verify

### Step 3: Write Tests First (TDD)

**Determine test type based on task:**

| Task Type | Test Agent | Framework |
|-----------|------------|-----------|
| Pure function/utility | unit-test-writer | vitest |
| Component with props | unit-test-writer | vitest + testing-library |
| Component + API/state | integration-test-writer | vitest + MSW |
| Auth-related feature | integration-test-writer | vitest + Clerk/WorkOS mocks |
| User flow/journey | e2e-test-writer | Playwright |

**Spawn appropriate test writer:**

For unit tests:
```
Task [unit-test-writer] model: sonnet: "Write unit tests for [function/component].

Behavior to test:
- [expected behavior from plan]
- [edge cases]
- [error cases]

File to create: [path/to/module.test.ts]
Follow vitest patterns from testing-patterns.md"
```

For integration tests (API/auth):
```
Task [integration-test-writer] model: sonnet: "Write integration tests for [feature].

Behavior to test:
- [component + API interaction]
- [auth states: loading, signed in, signed out]
- [error handling]

Auth: [Clerk/WorkOS/none]
API endpoints to mock: [list]
File to create: [path/to/feature.integration.test.ts]"
```

For E2E tests (critical flows):
```
Task [e2e-test-writer] model: opus: "Write E2E tests for [user journey].

Flow to test:
- [step 1]
- [step 2]
- [expected outcome]

Auth setup: [Clerk/WorkOS/none]
File to create: [tests/feature.spec.ts]"
```

### Step 4: TDD Cycle (MANDATORY)

**Hard gate:** Do NOT dispatch implementer/ui-builder until a failing test exists for the task. Test file first, implementation second. No exceptions.

```
1. Tests written (from Step 3)
2. Run test → verify FAIL
3. Write implementation (copy from plan, adapt as needed)
4. Run test → verify PASS
5. Fix TypeScript + lint (spawn fixer if issues)
6. Commit with message from plan
```

<continuous_quality>
**After every implementation, before commit:**

**TypeScript check:**
```bash
pnpm tsc --noEmit
```

**Biome lint + format:**
```bash
pnpm biome check --write .
```

**If issues found — spawn fixer:**
```
Task [fixer] model: haiku: "Fix TypeScript and lint errors.

Files with issues: [list files]
Errors: [paste error output]

Project rules: .ruler/typescript.md, .ruler/code-style.md"
```

**Why continuous:**
- Catching TS errors early is easier than fixing 20 at once
- Biome auto-fix keeps code consistent
- Each commit is clean and deployable
</continuous_quality>

**If test doesn't fail when expected:**
- Test might be wrong
- Implementation might already exist
- Stop and ask user

**If test doesn't pass after implementation — spawn debugger:**
```
Task [debugger] model: sonnet: "Test failing unexpectedly.

Test file: [path]
Test name: [name]
Error: [paste full error]
Implementation file: [path]

Investigate root cause and fix. See disciplines/systematic-debugging.md"
```

If debugger can't resolve after one attempt → stop and ask user.

### Step 5: Spec Compliance Check

After implementation, spawn spec-reviewer:
```
Task [spec-reviewer] model: sonnet: "Verify implementation matches spec.

Task spec:
[paste full <task> XML element]

Files created/modified: [list]

Check against <verify> and <done> criteria: nothing missing, nothing extra."
```

If spec-reviewer finds issues → fix with implementer/fixer → re-run spec-reviewer.
If compliant → proceed to code quality.

### Step 6: Code Quality Gate

After spec compliance passes, spawn code-reviewer:
```
Task [code-reviewer] model: haiku: "Quick code quality check.

Files: [list of files created/modified]

Check: no any types, error handling, tests exist, style consistent."
```

If code-reviewer finds issues → fix with fixer → re-run code-reviewer.
If approved → commit and mark complete.

### Step 7: Commit and Mark Complete

```bash
git add [files]
git commit -m "feat(scope): [description from plan]"
```

Update TodoWrite to mark task completed.

### Step 8: Checkpoint after batch

After every 3 tasks:

```
Completed:
- Task 1: [description] ✓
- Task 2: [description] ✓
- Task 3: [description] ✓

Tests passing: [X/X]

Ready for feedback before continuing?
```

Wait for user confirmation or adjustments.

### Step 8b: Handle Checkpoint Tasks

If the current task is a checkpoint type (`[CHECKPOINT:VERIFY]`, `[CHECKPOINT:DECIDE]`, `[CHECKPOINT:ACTION]`):

**For VERIFY:**
1. Ensure verification environment is running (dev server started, etc.)
2. Present what was built and verification steps
3. Ask for approval:
```
AskUserQuestion:
  question: "[Summary of what was built and how to verify it]"
  header: "Verify Implementation"
  options:
    - label: "Approved"
      description: "Implementation looks correct, continue to next task"
    - label: "Has issues"
      description: "There are problems that need fixing before continuing"
```
4. If "Has issues" → ask for description, fix, then re-present checkpoint
5. If "Approved" → continue to next task

**For DECIDE:**
1. Present options with pros/cons from the plan using AskUserQuestion:
```
AskUserQuestion:
  question: "[Context and trade-offs for this decision]"
  header: "Decision Required"
  options:
    - label: "[Option A name]"
      description: "[Pros/cons summary for option A]"
    - label: "[Option B name]"
      description: "[Pros/cons summary for option B]"
```
2. Record decision in progress journal
3. Continue implementation using selected option

**For ACTION:**
1. Explain what was attempted and what blocked (auth gate, etc.)
2. Provide exact steps for the manual action
3. Wait for confirmation:
```
AskUserQuestion:
  question: "[What manual action is needed and the exact steps to perform it]"
  header: "Manual Action Required"
  options:
    - label: "Done"
      description: "I've completed the manual action"
    - label: "Need help"
      description: "I need more guidance on this step"
```
4. If "Done" → verify the action succeeded (e.g., `vercel whoami`)
5. If "Need help" → provide additional guidance, then re-present checkpoint
6. Retry the blocked operation and continue

See `references/checkpoint-patterns.md` for full protocol.

## Phase 4: Quality Checkpoints

**Before creating new utility functions or services:**
Search the codebase (Glob + Grep) for existing functions that serve the same or similar purpose. If found → reuse existing code instead of creating new functions.

**After completing data/types tasks:**
- Spawn data-engineer (from review agents) for quick review
- Present findings as questions

**Before starting UI tasks:**

**If design spec exists** — spawn ui-builder:
```
Read: agents/build/ui-builder.md
```

**If no design spec** (empty states, undefined visuals) — spawn design-specifier first:
```
Task [design-specifier] model: opus: "Create design spec for [component].

Context: [what this is for, user's emotional state]
Existing patterns: [what it should feel like]
Project aesthetic: [tone from design doc]

Output actionable spec for ui-builder to implement."
```

Then spawn ui-builder with the design-specifier's output.

**If Figma URL provided** — spawn figma-builder:
```
Read: agents/build/figma-builder.md
Task [figma-builder] model: opus: "Implement from Figma: [URL]"
```

**For ui-builder, spawn:
```
Task [ui-builder] model: opus: "Build UI components for [feature].

Aesthetic Direction (from design doc):
- Tone: [tone]
- Memorable element: [what stands out]
- Typography: [fonts]
- Color strategy: [approach]
- Motion: [philosophy]

Figma: [URL if available]
Files to create: [list from implementation plan]

Interface rules: rules/interface/ (include tailwind-authoring.md, buttons.md, surfaces.md, sections.md when relevant)
Project rules: .ruler/react.md, .ruler/tailwind.md

Apply the aesthetic direction to every decision. Make it memorable, not generic."
```

**Fetch Figma context (if available):**
```
mcp__figma__get_design_context: fileKey, nodeId
mcp__figma__get_screenshot: fileKey, nodeId
```

**After completing ALL UI tasks — spawn designer review:**
```
Task [designer] model: opus: "Review the completed UI implementation.

Aesthetic Direction (from design doc):
- Tone: [tone]
- Memorable element: [what stands out]
- Typography: [fonts]
- Color strategy: [approach]

Files: [list of UI component files]
Figma: [URL if available]

Check for:
- Generic AI aesthetics (Inter, purple gradients, cookie-cutter layouts)
- Deviation from aesthetic direction
- Missing memorable moments
- Inconsistent application of design system
- Accessibility concerns
- Missing states (loading, error, empty)"
```

Address any review findings before proceeding.

**When implementing unfamiliar library APIs:**
```
mcp__context7__resolve-library-id: "[library name]"
mcp__context7__get-library-docs: "[library ID]" topic: "[specific feature]"
```
Use current documentation to ensure correct API usage.

**After completing all tasks:**
- Run full test suite
- Run linting

## Phase 5: Final Quality Sweep

**Spawn parallel build agents for speed:**

```
Task [fixer] model: haiku: "Run TypeScript check (tsc --noEmit) and fix any errors. Report results."

Task [fixer] model: haiku: "Run Biome check (biome check --write .) and fix any issues. Report results."
```

Wait for agents to complete. If issues found, fix before proceeding.

**Run test suite:**
```bash
pnpm test
```

If tests fail, spawn debugger to investigate.

## Phase 5.5: Plan Completion Verification

Skip this phase for small-scope executions with fewer than 4 tasks unless the user explicitly asks for the whole-plan gate.

**This is the whole-plan gate. Per-task spec reviews catch issues within tasks — this catches tasks that were skipped, partially implemented, or scope that crept in.**

1. **Re-read the original implementation plan** (the file from Phase 2)
2. **Get the list of all files changed:**
```bash
git diff --name-only main...HEAD
```
3. **Spawn plan-completion-reviewer:**
```
Task [plan-completion-reviewer] model: sonnet: "Verify the entire implementation matches the original plan.

ORIGINAL PLAN:
[paste full plan text]

FILES CHANGED:
[paste git diff file list]

TEST RESULTS:
[paste test summary — N passing, N failing]

Read each file referenced in the plan. Verify every task was implemented substantively.
Check for skipped tasks, partial implementations, and scope creep.
See agents/build/plan-completion-reviewer.md"
```

**If plan-completion-reviewer finds issues:**
- Skipped tasks → implement them now
- Partial implementations → complete them
- Scope creep → ask user if extras should stay or be removed
- Re-run plan-completion-reviewer after fixes

**Do NOT proceed to Phase 6 until plan-completion-reviewer passes.**

## Phase 5b: E2E Tests (If Created)

If e2e tests were created as part of this implementation:

**Spawn e2e-runner agent:**
```
Task [e2e-runner] model: opus: "Run E2E tests for the feature we just implemented.

Test files: [list e2e test files]
Feature: [brief description]

Run tests, fix any failures, and iterate until all pass or report blockers.
See agents/build/e2e-runner.md for protocol."
```

**Why a separate agent?**
- E2E tests produce verbose output (traces, screenshots, DOM snapshots)
- Fixing may require multiple iterations
- Keeps main conversation context clean

Wait for agent to complete. Review its summary of fixes applied.

## Phase 6: Expert Review (Optional)

For significant features, offer parallel review:

"Feature complete. Run expert review before PR?"

If yes, spawn review agents in parallel (all use sonnet):

```
Task [senior-engineer] model: sonnet: "Review implementation for unnecessary complexity and code quality.
Files: [list of new/modified files]
See agents/review/senior-engineer.md"

Task [architecture-engineer] model: sonnet: "Review implementation for architectural concerns.
Files: [list of new/modified files]
See agents/review/architecture-engineer.md"
```

**Add a conditional third reviewer based on what was built:**

| If the implementation includes... | Also spawn |
|----------------------------------|------------|
| Auth, sessions, API keys, user data | security-engineer |
| Significant UI (components, pages) | senior-engineer |
| Database migrations, data models | data-engineer |

Present findings as Socratic questions (see `references/review-patterns.md`).
Blockers → fix → re-verify (max 2 cycles). Should-fix → fix if quick, otherwise note as follow-up.

## Post-Completion: Doc Staleness Check

Before shipping, check if documentation may need updating:

1. **Get modified files** from git status
2. **Check for existing docs** — Glob for `docs/**/*.md`, `docs/**/*.mdx`, `content/**/*.md`
3. **If docs exist** — Search doc files for references to modified file paths, exported function names, or component names
4. **If matches found** — Ask user: "These docs reference code you just changed. Update them?"
5. **If user says yes** — Read each stale doc and the changed source. Rewrite only affected sections.

## Phase 7: Ship

**Ensure all tests pass:**
```bash
pnpm test
pnpm lint
```

**Create PR:**
```bash
git push -u origin feature/<feature-name>

gh pr create --title "feat: <description>" --body "$(cat <<'EOF'
## Summary
- What was built
- Key decisions

## Testing
- [X] Unit tests added
- [X] E2E tests added (if applicable)
- [X] All tests passing

## Screenshots
[Include if UI changes]

## Design Doc
[Link to design doc]

## Implementation Plan
[Link to implementation plan]
EOF
)"
```

**Report to user:**
- PR URL
- Summary of what was built
- Any follow-up items

**Cleanup branch (optional):**
```bash
git checkout main
git branch -d feature/<feature-name>
```

## Phase 8: Cleanup

**Kill orphaned subagent processes:**

After spawning multiple build agents, some may not exit cleanly. Run cleanup:

```bash
scripts/cleanup-orphaned-agents.sh
```

This is especially important after parallel agent runs.

</process>

<when_to_stop>
**STOP and ask user when:**
- Test fails unexpectedly and debugger can't resolve
- Implementation doesn't match plan
- Stuck after 2 debug attempts
- Plan has ambiguity
- New requirement discovered
- Security concern identified

**Don't guess. Ask.**
</when_to_stop>

<progress_context>
**Use Read tool:** `docs/arc/progress.md` (first 50 lines)

Look for related ideate sessions and any prior implementation attempts.
</progress_context>

<progress_append>
After completing implementation (or pausing), append to progress journal:

```markdown
## YYYY-MM-DD HH:MM — /arc:implement
**Task:** [Feature name]
**Outcome:** [Complete / In Progress (X/Y tasks) / Blocked]
**Files:** [Key files created/modified]
**Agents spawned:** [list of agents used]
**Decisions:**
- [Key implementation decision]
**Next:** [PR created / Continue tomorrow / Blocked on X]

---
```
</progress_append>

<arc_log>
**After completing this skill, append to the activity log.**
See: `references/arc-log.md`

Entry: `/arc:implement — [Feature name] ([X/Y] tasks complete)`
</arc_log>

<success_criteria>
Execution is complete when:
- [ ] All tasks marked completed in TodoWrite
- [ ] All tests passing
- [ ] Linting passes
- [ ] Plan completion verification passed when the full-plan path was used
- [ ] PR created
- [ ] User informed of completion
- [ ] Progress journal updated
- [ ] Orphaned agents cleaned up
</success_criteria>

<tool_restrictions_reminder>
REMINDER: You must NEVER call `EnterPlanMode` or `ExitPlanMode` at any point during this skill — not at the start, not after creating the plan, not before implementation, not at the end. This skill manages its own flow. All output goes directly to the user as normal messages.
</tool_restrictions_reminder>
