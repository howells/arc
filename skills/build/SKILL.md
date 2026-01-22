---
name: build
description: |
  Quick build for small-to-medium scope work without formal planning. Still uses TDD and verification.
  Use when asked to "build this", "add a quick feature", "make this change", or for straightforward
  implementation tasks that don't need extensive design work.
license: MIT
metadata:
  author: howells
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
