---
name: worktree
disable-model-invocation: true
description: |
  Create an isolated git worktree for feature development. Use proactively when starting
  any non-trivial work on main branch, when asked to "create a branch", "set up a worktree",
  or when implementing features that should be isolated from the main workspace.
license: MIT
metadata:
  author: howells
website:
  order: 20
  desc: Isolated workspaces
  summary: Create isolated git worktrees for feature development, keeping main clean.
  what: |
    Worktree creates an isolated workspace sharing the same repository, allowing you to work on a feature branch without affecting your main workspace. It handles directory selection, .gitignore verification, dependency installation, and baseline test verification.
  why: |
    Working directly on main is risky for non-trivial changes. Worktrees let you experiment freely, abandon work cleanly if needed, and keep your main branch always deployable. The isolation also makes it easy to context-switch between features.
  decisions:
    - Proactive suggestion. When you're on main and about to do multi-file work, worktree is offered.
    - Smart directory selection. Checks existing directories, CLAUDE.md preferences, or asks.
    - Safety verification. Ensures worktree directories are gitignored before creating.
---

# Worktree Workflow

Create isolated git worktrees for feature development.

**Announce at start:** "I'm using the worktree skill to set up an isolated workspace."

## When to Use

**Proactively offer worktree when:**
- User is on main/master and about to implement something non-trivial
- Work will touch multiple files
- Feature should be easily abandonable
- User asks to "create a branch" or "set up for feature work"

**Skip worktree for:**
- Single-file trivial fixes
- Documentation-only changes
- User explicitly wants to stay on main

## Process

### Step 1: Verify Current Branch

```bash
git branch --show-current
```

**If already on feature branch:**
```
"You're already on branch [name]. Continue here or create a new worktree?"
```

Use AskUserQuestion:
- Continue on current branch (Recommended)
- Create new worktree for different feature

**If on main/master:** Continue to Step 2.

### Step 2: Follow the Discipline

Read and follow: `${CLAUDE_PLUGIN_ROOT}/disciplines/using-git-worktrees.md`

The discipline covers:
1. Directory selection (existing > CLAUDE.md > ask)
2. Safety verification (gitignore check)
3. Worktree creation
4. Dependency installation
5. Baseline test verification

### Step 3: Report Ready

```
Worktree ready at [path]
Branch: [feature/name]
Tests passing: [N] tests, 0 failures
Ready to implement.
```

### Step 4: Offer Next Steps

Use AskUserQuestion to present options:

| Option | When |
|--------|------|
| Design the feature (/arc:ideate) | New feature needing design |
| Create implementation plan (/arc:detail) | Have design, need tasks |
| Start building (/arc:build) | Small/clear scope |
| Done for now | Just wanted the worktree |

## Integration

**Called by:**
- `/arc:ideate` (Phase 5) — After design approved
- `/arc:build` (Step 1b) — When on main
- `/arc:detail` (Step 7) — When plan ready but on main
- Any workflow starting non-trivial work

**Pairs with:**
- `finishing-a-development-branch` discipline — REQUIRED cleanup after work complete

## Quick Reference

| Situation | Action |
|-----------|--------|
| On main, multi-file work | Offer worktree |
| On feature branch already | Ask to continue or new worktree |
| Trivial single-file fix | Skip worktree |
| User declines worktree | Proceed on current branch |

<progress_append>
After creating a worktree, append to progress journal:

```markdown
## YYYY-MM-DD HH:MM — /arc:worktree
**Task:** Create worktree for [feature]
**Outcome:** Complete
**Files:** [worktree path]
**Decisions:**
- Branch: [branch name]
- Location: [.worktrees or global]
**Next:** [ideate/detail/build/implement]

---
```
</progress_append>
