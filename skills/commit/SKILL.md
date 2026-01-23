---
name: commit
description: |
  Smart commit and push with auto-splitting across domains. Creates atomic commits.
  Use when asked to "commit", "push changes", "save my work", or after completing
  implementation work. Automatically groups changes into logical commits.
license: MIT
metadata:
  author: howells
  argument-hint: <optional-message>
website:
  order: 14
  desc: Smart commits
  summary: Commit your changes with auto-splitting. Groups related changes into atomic commits with clear messages—so your git history actually makes sense.
  what: |
    Commit looks at your staged changes and groups them logically—feature code in one commit, tests in another, config changes in a third. Each gets a clear message following conventional commit format (feat:, fix:, refactor:, etc.). The result is a git history you can actually read, bisect, and cherry-pick from.
  why: |
    Messy commits make git history useless. You can't bisect to find a bug if every commit touches 15 unrelated files. You can't revert a broken feature if it's tangled with a refactor. Developers know this but batch changes anyway because splitting is tedious. Commit does the tedious part—you get clean history without the effort.
  decisions:
    - Auto-detects domains. Feature code, tests, docs, config—grouped by what changed.
    - Conventional commit format. Enables automated changelogs and clear history.
    - Each commit is atomic. Independently revertable, cherry-pickable, bisectable.
---

<progress_context>
**Use Read tool:** `docs/progress.md` (first 50 lines)

Check recent work context to inform commit message writing.
</progress_context>

# Commit Changes

Commit and push changes, intelligently splitting into separate commits when changes span multiple domains.

Usage:
- `/arc:commit` - Auto-analyze and commit (may create multiple commits)
- `/arc:commit [message]` - Single commit with provided message

$ARGUMENTS will contain the optional commit message.

## Instructions

### 1. Analyze Changes

Run these commands to understand the changes:
```bash
git status --porcelain
git diff --stat
git log --oneline -5
```

### 2. Determine Commit Strategy

**Single commit** if:
- $ARGUMENTS contains a commit message, OR
- All changes are in the same domain/area, OR
- Changes are tightly coupled (e.g., feature + its tests)

**Multiple commits** if $ARGUMENTS is empty AND changes span multiple unrelated domains:
- Different packages (e.g., `packages/ui`, `packages/api`)
- Different apps (e.g., `apps/web`, `apps/admin`)
- Config vs source changes
- Unrelated features or fixes

### 3. Group Files by Domain

Common groupings:
- `packages/<name>/**` - Package-specific changes
- `apps/<name>/**` - App-specific changes
- Root config files (`.eslintrc`, `turbo.json`, etc.) - Config
- `*.stories.tsx` with their component - Same commit as component
- `*.test.ts` with their source - Same commit as source

### 4. Create Commits

For each logical group:

1. Stage only files for that group:
   ```bash
   git add [files...]
   ```

2. Create commit with conventional message format:
   ```bash
   git commit -m "$(cat <<'EOF'
   type(scope): description
   EOF
   )"
   ```

**Commit types:**
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code refactoring
- `chore` - Maintenance, deps, config
- `docs` - Documentation
- `test` - Tests
- `style` - Formatting, no code change
- `perf` - Performance improvement
- `ci` - CI/CD changes

**Commit message rules:**
- Use imperative mood: "add" not "added", "fix" not "fixed"
- First line under 72 characters
- Each commit should be atomic (single purpose)
- If you need "and" in the message, consider splitting the commit

### 5. Handle Pre-commit Hook Failures

If TypeScript or lint errors block the commit:

**CRITICAL RULES:**
- NEVER use `--no-verify` or skip hooks
- NEVER use force casting (e.g., `as unknown as`, `as any`)
- NEVER use `@ts-ignore`, `@ts-expect-error`, or eslint-disable comments
- NEVER use type assertions to bypass errors
- NEVER add empty catch blocks or suppress errors
- Fix the ROOT CAUSE of each error

**Fixing Process:**
1. Read the error output carefully
2. Identify the exact files and line numbers with issues
3. For TypeScript errors:
   - Read the file and understand the type error
   - Fix the types properly by adding correct type annotations
   - If a type is unclear, use `unknown` and narrow it with type guards
   - Update interfaces/types as needed
4. For lint errors:
   - Read the file and understand the lint rule violation
   - Fix the code to comply with the rule properly
   - Refactor if needed to follow best practices
5. Stage the fixes with the relevant commit
6. Retry the commit
7. Repeat until all errors are resolved

### 6. Push Changes

After all commits are created:
```bash
git push
```

If the branch has no upstream:
```bash
git push -u origin $(git branch --show-current)
```

If push fails (e.g., diverged history), report the issue - do NOT force push unless explicitly authorized.

### 7. Report Results

Tell the user:
- How many commits were created
- Summary of each commit (hash, message)
- Push status

<progress_append>
After committing changes, append to progress journal:

```markdown
## YYYY-MM-DD HH:MM — /arc:commit
**Task:** Commit changes
**Outcome:** Complete
**Files:** [N] commits created
**Decisions:**
- [commit message summaries]
**Next:** Continue working

---
```
</progress_append>

## Failure Scenarios

If you cannot fix an error properly:
- Explain why the error exists
- Describe what the proper fix would require (e.g., architectural changes, missing types, etc.)
- Ask for guidance
- Do NOT commit with workarounds
