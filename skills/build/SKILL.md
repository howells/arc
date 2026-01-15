---
name: build
description: Quick build for small-to-medium scope work without formal planning. Still uses TDD and verification disciplines.
---

# Build Workflow

Quick build for small-to-medium scope work. No formal plan, but still uses TDD and verification disciplines.

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
```
"I recommend creating a feature branch and worktree for this work. Keeps main clean and allows easy rollback."
```

Options:
1. **Yes, set up worktree** (Recommended for multi-file changes) → Follow `${CLAUDE_PLUGIN_ROOT}/disciplines/using-git-worktrees.md`
2. **No, work on main** → Proceed (fine for trivial single-file fixes)

### Step 2: Quick Mental Model

Briefly outline (don't write a doc):
- What needs to change
- What order to do it
- What to test

Share with user: "Here's my approach: [2-3 bullets]. Sound right?"

### Step 3: Build with TDD

Follow `${CLAUDE_PLUGIN_ROOT}/disciplines/test-driven-development.md`:

For each piece:
1. Write failing test
2. Verify it fails
3. Write minimal code to pass
4. Verify it passes
5. Refactor if needed

### Step 4: Continuous Quality

After each implementation:
```bash
pnpm tsc --noEmit    # TypeScript check
pnpm biome check .   # Lint
```

Fix issues immediately.

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

"Build complete. Would you like to:"
1. Run /arc:test to verify coverage
2. Run /arc:document to capture what we built
3. Add follow-up items to /arc:tasklist
4. Done for now

## What Build is NOT

- Not for large features (use /arc:ideate)
- Not for exploratory work (use /arc:ideate)
- Not for things needing design review
- Not a shortcut to skip quality
