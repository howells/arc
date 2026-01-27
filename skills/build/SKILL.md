---
name: build
description: |
  Quick build for small-to-medium scope work without formal planning. Still uses TDD and verification.
  Use when asked to "build this", "add a quick feature", "make this change", or for straightforward
  implementation tasks that don't need extensive design work.
license: MIT
metadata:
  author: howells
website:
  order: 7
  desc: Quick implementation
  summary: Fast implementation for small-to-medium scope work without formal planning.
  what: |
    Build is for when the path is clear and you want to move fast. It still uses test-driven development and runs TypeScript checks after every change, but skips the formal planning phase that /arc:detail and /arc:implement require.
  why: |
    Not everything needs a plan document. Small features, bug fixes, and refactors benefit from momentum. Build gives you TDD discipline without bureaucratic overhead.
  decisions:
    - Tests first, always—even in 'quick' mode. No exceptions.
    - Type checks after every file change catch drift early.
    - No plan file means no audit trail. Use /arc:implement for anything you might need to explain later.
---

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

**If `.ruler/` doesn't exist:** Continue without rules — they're optional.

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
Reference: `${CLAUDE_PLUGIN_ROOT}/references/tailwind-v4.md` for Tailwind v4 syntax (if using Tailwind).
</rules_context>

# Build Workflow

Quick build for small-to-medium scope work. No formal plan, but still uses TDD and verification disciplines.

**Announce at start:** "I'm using the build skill for quick implementation with TDD."

## Process

### Step 1: Assess Scope

Read the request. Consider:
- How many files will this touch?
- How many distinct components/features?
- Are there complex interactions?
- Is there significant new architecture?

**If scope is large** (>5 files, multiple features, new patterns):
```
"This looks substantial. It would benefit from proper design and planning.
Want me to run /arc:ideate instead?"
```
Wait for response. If yes, invoke ideate workflow.

**If scope is small/medium:** Proceed to Step 2.

### Step 1b: Consider Worktree

If not already on a feature branch:

```bash
git branch --show-current
```

**If on main/master:**

**Use AskUserQuestion tool:**
```
Question: "You're on main. Want to create a worktree for this work?"
Header: "Worktree"
Options:
  1. "Yes, set up worktree" (Recommended) — Keeps main clean, easy rollback
  2. "No, work on main" — Fine for trivial single-file fixes
```

**If option 1:** Follow `${CLAUDE_PLUGIN_ROOT}/disciplines/using-git-worktrees.md`
**If option 2:** Proceed on main

### Step 2: Verify Test Infrastructure

Before writing any code, confirm the project can run tests:

```bash
# Check for test runner in package.json
grep -E '"vitest"|"jest"|"playwright"' package.json
```

**If no test runner found:**
```
"This project has no test runner configured. I need to set one up before I can build with TDD.
Want me to add vitest (recommended for most projects)?"
```
Wait for user response. Set up the runner before proceeding.

**If test runner found:** Note the runner and its test command for use in Step 4.

### Step 3: Quick Mental Model

Briefly outline (don't write a doc):
- What needs to change
- What to test (be specific: which behaviors, which edge cases)
- What order to do it

Share with user: "Here's my approach: [2-3 bullets]. Sound right?"

### Step 4: Build with TDD

Read `${CLAUDE_PLUGIN_ROOT}/disciplines/test-driven-development.md` for full methodology.

<tdd_enforcement>
**THE IRON LAW: No production code without a failing test first.**

Writing code before its test? Delete it. Start over. No exceptions:
- Don't keep it as "reference"
- Don't "adapt" it while writing tests
- Delete means delete

**For each piece of work, the FIRST file you touch MUST be the test file.** Not the implementation file. The test file.

**Cycle — follow exactly, every time:**

1. **Create/open the test file first.** Write one failing test.
2. **Run the test. Watch it fail.** If it passes, your test is wrong — fix the test.
   ```bash
   pnpm vitest run path/to/file.test.ts  # or jest/playwright equivalent
   ```
3. **Now open the implementation file.** Write the minimum code to make the test pass.
4. **Run the test. Watch it pass.** If it fails, fix the implementation, not the test.
   ```bash
   pnpm vitest run path/to/file.test.ts
   ```
5. **Run TypeScript + lint before moving on:**
   ```bash
   pnpm tsc --noEmit
   pnpm biome check --write .
   ```
   Fix any issues immediately.
6. Repeat for the next behavior.

**Self-check after each cycle:**
- [ ] Did I write the test BEFORE the implementation?
- [ ] Did I watch the test fail?
- [ ] Did the test fail because the feature is missing (not a typo or import error)?
- [ ] Did I write only enough code to pass?

If any answer is "no" — STOP. Delete the implementation. Write the test first.
</tdd_enforcement>

### Step 5: Verify Before Done

Follow `${CLAUDE_PLUGIN_ROOT}/disciplines/verification-before-completion.md`:
- Run full test suite
- Check all tests pass
- Confirm no TypeScript errors
- Confirm no lint errors

Only then claim completion.

### Step 5b: E2E Tests (If Any)

If e2e tests exist for the changed code:

```
Task Bash run_in_background: true: "Run e2e tests and report any failures"
```

Spawning a background task keeps verbose e2e output from filling context.

### Step 5b: React/Next.js Performance Check (Optional)

For React/Next.js projects, if `vercel-react-best-practices` skill is available:
```
Skill vercel-react-best-practices: "Quick review of [component/feature] for performance issues"
```

### Step 6: Offer Next Steps

**Use AskUserQuestion tool:**
```
Question: "Build complete. What's next?"
Header: "Next step"
multiSelect: false
Options:
  1. "Verify test coverage" — Run /arc:test
  2. "Document what we built" — Run /arc:document
  3. "Add follow-up tasks" — Update /arc:tasklist
  4. "Done for now" — End session
```

<progress_context>
**Use Read tool:** `docs/progress.md` (first 50 lines)

Check for related prior work.
</progress_context>

<progress_append>
After completing the build, append to progress journal:

```markdown
## YYYY-MM-DD HH:MM — /arc:build
**Task:** [What was built]
**Outcome:** Complete
**Files:** [Key files created/modified]
**Decisions:**
- [Key decision if any]
**Next:** Continue working

---
```
</progress_append>

## What Build is NOT

- Not for large features (use /arc:ideate)
- Not for exploratory work (use /arc:ideate)
- Not for things needing design review
- Not a shortcut to skip quality
