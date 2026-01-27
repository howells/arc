---
name: implement
description: |
  Execute an implementation plan task-by-task with TDD and continuous quality checks.
  Use when asked to "implement the plan", "execute the tasks", "start building from the plan",
  or after /arc:detail has created an implementation plan ready for execution.
license: MIT
metadata:
  author: howells
website:
  order: 6
  desc: Execute the plan
  summary: Execute your plan task by task. Tests first, then implementation—and with an LLM, writing tests is finally easy.
  what: |
    Implement takes your plan from /arc:detail and executes it task by task. For each task: write the test, make it pass, run type checks and lint. The AI writes the tests for you—TDD used to be tedious, but LLMs make it trivial. You get the benefits of test coverage without the friction.
  why: |
    TDD produces better code, but developers skip it because writing tests is boring. LLMs remove that excuse. Implement enforces the discipline—test first, then code—while the AI handles the tedious parts. You end up with tested, working code and a clean git history.
  decisions:
    - Test-first is mandatory. The AI writes them, so there's no reason to skip.
    - One task at a time. Each task is committed before moving to the next.
    - Quality gates after every task. TypeScript and lint errors don't accumulate.
---

<required_reading>
**Read these reference files NOW:**
1. ${CLAUDE_PLUGIN_ROOT}/references/testing-patterns.md
2. ${CLAUDE_PLUGIN_ROOT}/references/frontend-design.md (if UI work involved)
3. ${CLAUDE_PLUGIN_ROOT}/disciplines/dispatching-parallel-agents.md
4. ${CLAUDE_PLUGIN_ROOT}/disciplines/finishing-a-development-branch.md
5. ${CLAUDE_PLUGIN_ROOT}/disciplines/receiving-code-review.md
</required_reading>

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

These rules define MUST/SHOULD/NEVER constraints. Follow them during implementation.

**If `.ruler/` doesn't exist:**
```
No coding rules found. Run /arc:rules to set up standards, or continue without rules.
```

Rules are optional — proceed without them if the user prefers.

**For UI/frontend work, also load interface rules:**

| Check | Read from `${CLAUDE_PLUGIN_ROOT}/rules/interface/` |
|-------|---------------------------------------------------|
| Building components/pages | design.md, colors.md, spacing.md, layout.md |
| Typography changes | typography.md |
| Adding animations | animation.md, performance.md |
| Form work | forms.md, interactions.md |
| Interactive elements | interactions.md |
| Marketing pages | marketing.md |

Reference: `${CLAUDE_PLUGIN_ROOT}/references/frontend-design.md` for fonts and anti-patterns.
Reference: `${CLAUDE_PLUGIN_ROOT}/references/component-design.md` for React component patterns.
Reference: `${CLAUDE_PLUGIN_ROOT}/references/animation-patterns.md` for motion design.
Reference: `${CLAUDE_PLUGIN_ROOT}/references/tailwind-v4.md` for Tailwind v4 syntax (if using Tailwind).
</rules_context>

<process>

**Announce at start:** "I'm using the implement skill to execute the plan task-by-task with TDD."

**You are here in the arc:**
```
/arc:ideate     → Design doc (on main) ✓
     ↓
/arc:detail     → Implementation plan ✓
     ↓
/arc:review     → Review (optional) ✓
     ↓
/arc:implement  → Execute task-by-task ← YOU ARE HERE
```

## Phase 1: Setup

**If not already in worktree:**
```bash
# Check current location
git branch --show-current

# If on main/dev, create worktree
git worktree add .worktrees/<feature-name> -b feature/<feature-name>
cd .worktrees/<feature-name>
```

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

**Read implementation plan:**
`docs/plans/YYYY-MM-DD-<topic>-implementation.md`

**Create tasks with TaskCreate:**
One task per task in the plan. Mark first as `in_progress` with TaskUpdate.

## Phase 3: Execute in Batches

**Default batch size: 3 tasks**

For each task:

### Step 1: Mark in_progress
Update task with TaskUpdate.

### Step 2: Follow TDD cycle exactly

Read `${CLAUDE_PLUGIN_ROOT}/disciplines/test-driven-development.md` for full methodology.

<tdd_enforcement>
**THE IRON LAW: No production code without a failing test first.**

The FIRST file you touch for each task MUST be the test file. Not the implementation file.

If the plan includes test code, use it. If the plan doesn't include test code, write it yourself — but write it BEFORE the implementation.

**Cycle — follow exactly, every time:**

1. **Write the test file first.** Create/open the `.test.ts` file. Write one failing test (copy from plan if available, otherwise write it yourself).
2. **Run test → verify FAIL.** If it passes immediately, the test is wrong — fix it or the behavior already exists.
   ```bash
   pnpm vitest run path/to/file.test.ts  # or jest/playwright equivalent
   ```
3. **Now write implementation** (copy from plan, adapt as needed). Only the minimum code to pass the test.
4. **Run test → verify PASS.**
   ```bash
   pnpm vitest run path/to/file.test.ts
   ```
5. **Fix TypeScript + lint** (see below)
6. **Commit with message from plan**

**Self-check gate — before moving to next task:**
- [ ] Test file was created/modified BEFORE implementation file
- [ ] Test was run and observed to FAIL before implementation
- [ ] Test failure was because feature was missing (not typo/import error)
- [ ] Only enough code was written to pass the test

If any answer is "no" — delete the implementation, write the test first.
</tdd_enforcement>

<continuous_quality>
**After every implementation, before commit:**

**TypeScript check:**
```bash
pnpm tsc --noEmit
# or: pnpm typecheck (if script exists)
```

**Biome lint + format:**
```bash
pnpm biome check --write .
# or: pnpm lint:fix (if script exists)
```

**If issues found:**
- Fix immediately
- Don't accumulate debt
- If stuck on a type issue → spawn a quick agent:
  ```
  Task general-purpose model: haiku: "Fix TypeScript error in [file]: [error message]"
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

**If test doesn't pass after implementation:**
Spawn debugger agent immediately:
```
Task general-purpose model: sonnet: "Test failing unexpectedly.
Test file: [path]
Test name: [name]
Error: [error message]
Implementation: [path]
Debug and fix."
```

If debugger can't resolve after one attempt → stop and ask user

### Step 3: Mark completed
Update task with TaskUpdate.

### Step 4: Checkpoint after batch

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

## Phase 4: Quality Checkpoints

**After completing data/types tasks:**
- Spawn data-engineer for quick review
- Present findings as questions

**Before starting UI tasks — INVOKE ARC:DESIGN FOR BUILD:**

```
Skill arc:design: "Build UI components for [feature].

Aesthetic Direction (from design doc):
- Tone: [tone]
- Memorable element: [what stands out]
- Typography: [fonts]
- Color strategy: [approach]
- Motion: [philosophy]

Figma: [URL if available]
Files to create: [list from implementation plan]

Apply the aesthetic direction to every decision. Make it memorable, not generic."
```

**Why invoke the skill, not just follow principles:**
- The skill has creative energy and specific guidance
- It makes bold decisions, not safe ones
- It catches generic patterns as they're written, not after

**Fetch Figma context:**
```
mcp__figma__get_design_context: fileKey, nodeId
mcp__figma__get_screenshot: fileKey, nodeId
```

**After each UI task, quick self-check:**
- [ ] Would a designer call this "generic AI slop"?
- [ ] Is the memorable element actually memorable?
- [ ] Did I avoid Roboto/Arial/system-ui and purple gradients?

**After completing ALL UI tasks — INVOKE ARC:DESIGN FOR REVIEW:**

```
Task general-purpose model: opus: "Review the completed UI implementation.

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

- Run playwright visual test if available
- Take screenshots of key states
- Compare against Figma screenshot
- Address any review findings before proceeding

**Optional: Web Interface Guidelines Review**
If `web-design-guidelines` skill is available:
```
Skill web-design-guidelines: "Review [components] for Web Interface Guidelines compliance"
```

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

**Always run (in parallel agents for speed):**

```
Task general-purpose model: haiku: "Run TypeScript check (tsc --noEmit) and fix any errors"
Task general-purpose model: haiku: "Run Biome check (biome check --write .) and fix any issues"
Task general-purpose model: haiku: "Run test suite and report results"
```

Wait for all agents to complete. If issues found, fix before proceeding.

**Optional: React/Next.js Performance Review**
For React/Next.js projects, if `vercel-react-best-practices` skill is available:
```
Skill vercel-react-best-practices: "Review implementation for React/Next.js performance patterns"
```

## Phase 5b: E2E Tests (If Created)

If e2e tests were created as part of this implementation:

**Spawn dedicated agent to run and fix e2e tests:**
```
Task Bash run_in_background: true: "Run e2e tests for the feature we just implemented. Fix any failures and iterate until all pass."
```

**Why a separate agent?**
- E2E tests produce verbose output (traces, screenshots, DOM snapshots)
- Fixing may require multiple iterations
- Keeps main conversation context clean

Wait for agent to complete. Review its summary of fixes applied.

## Phase 6: Expert Review (Optional)

For significant features, offer parallel review:

"Feature complete. Run expert review before PR?"

If yes, spawn in parallel (all use sonnet for balanced cost/quality):
- simplicity-engineer (model: sonnet)
- architecture-engineer or domain-specific reviewer (model: sonnet)
- security-engineer if auth/data involved (model: sonnet)

Present findings as Socratic questions (see `${CLAUDE_PLUGIN_ROOT}/references/review-patterns.md`).

## Phase 7: Finish the Branch

Follow `${CLAUDE_PLUGIN_ROOT}/disciplines/finishing-a-development-branch.md`

**First, verify tests pass:**
```bash
pnpm test
pnpm lint
```

**If tests fail:** Stop. Cannot proceed until tests pass.

**If tests pass, present the 4 options:**

**Use AskUserQuestion tool:**
```
Question: "Implementation complete. What would you like to do?"
Header: "Finish"
Options:
  1. "Merge to main locally" — Merge, delete branch, cleanup worktree
  2. "Push and create PR" (Recommended) — Push branch, open PR for review
  3. "Keep branch as-is" — I'll handle it later
  4. "Discard this work" — Delete branch and worktree (requires confirmation)
```

### Option 1: Merge Locally

```bash
git checkout main
git pull
git merge feature/<feature-name>
pnpm test  # Verify tests pass on merged result
git branch -d feature/<feature-name>
```

Then cleanup worktree (see below).

### Option 2: Push and Create PR

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

Report PR URL to user. Keep worktree until PR is merged.

### Option 3: Keep As-Is

Report: "Keeping branch [name]. Worktree preserved at [path]."

Don't cleanup worktree.

### Option 4: Discard

**Require typed confirmation:**
```
This will permanently delete:
- Branch [name]
- All commits since [base]
- Worktree at [path]

Type 'discard' to confirm.
```

Wait for exact confirmation. If confirmed:
```bash
git checkout main
git branch -D feature/<feature-name>
```

Then cleanup worktree.

### Worktree Cleanup (Options 1, 2, 4)

```bash
# Only for options 1, 2, and 4
cd ..
git worktree remove .worktrees/<feature-name>
```

**Report to user:**
- What happened (merged/PR created/discarded)
- Summary of what was built
- Any follow-up items
</process>

<when_to_stop>
**STOP and ask user when:**
- Test fails unexpectedly
- Implementation doesn't match plan
- Stuck after 2 debug attempts
- Plan has ambiguity
- New requirement discovered
- Security concern identified

**Don't guess. Ask.**
</when_to_stop>

<progress_context>
**Use Read tool:** `docs/progress.md` (first 50 lines)

Look for related ideate/detail sessions and any prior implementation attempts.
</progress_context>

<tasklist_context>
**Use TaskList tool** to check for existing tasks related to this work.

If a related task exists, note its ID and mark it `in_progress` with TaskUpdate when starting.
</tasklist_context>

<tasklist_update>
**After implementation completes (or pauses):**

1. **If feature complete** → Use **TaskUpdate** to mark related task as `completed`
2. **If discovered new tasks** → Use **TaskCreate** for each:
   - **subject:** Brief imperative title
   - **description:** What needs to be done and why
   - **activeForm:** Present continuous form
3. **If blocked** → Use **TaskCreate** for the blocker
</tasklist_update>

<progress_append>
After completing implementation (or pausing), append to progress journal:

```markdown
## YYYY-MM-DD HH:MM — /arc:implement
**Task:** [Feature name]
**Outcome:** [Complete / In Progress (X/Y tasks) / Blocked]
**Files:** [Key files created/modified]
**Decisions:**
- [Key implementation decision]
**Next:** [PR created / Continue tomorrow / Blocked on X]

---
```
</progress_append>

<success_criteria>
Execution is complete when:
- [ ] All tasks marked completed with TaskUpdate
- [ ] All tests passing
- [ ] Linting passes
- [ ] PR created
- [ ] User informed of completion
- [ ] Progress journal updated
</success_criteria>
