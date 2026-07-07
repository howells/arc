---
name: commit
description: |
  Smart commit, push, and npm publish with auto-splitting across domains.
  Creates atomic commits. Use when asked to "commit", "push changes", "publish",
  "save my work", or after completing implementation work. Automatically groups
  changes into logical commits.
license: MIT
argument-hint: "[push|publish]"
metadata:
  author: howells
website:
  order: 14
  desc: Commit, push, publish
  summary: Commit your changes with auto-splitting, push when asked, and publish changed npm packages after a successful push.
  what: |
    Commit looks at your staged changes and groups them logically—feature code in one commit, tests in another, config changes in a third. Each gets a clear message following conventional commit format (feat:, fix:, refactor:, etc.). When asked to push, it pushes the branch and then publishes any changed npm package whose package metadata says it is publishable and whose version is not already on the registry.
  why: |
    Messy commits make git history useless. You can't bisect to find a bug if every commit touches 15 unrelated files. You can't revert a broken feature if it's tangled with a refactor. Developers know this but batch changes anyway because splitting is tedious. Commit does the tedious part—you get clean history without the effort.
  decisions:
    - Auto-detects domains. Feature code, tests, docs, config—grouped by what changed.
    - Conventional commit format. Enables automated changelogs and clear history.
    - Each commit is atomic. Independently revertable, cherry-pickable, bisectable.
    - Publishing happens only after a successful push.
    - Private packages and already-published versions are skipped.
  workflow:
    position: utility
---

<arc_runtime>
This workflow requires the full Arc bundle, not a prompts-only install.

Paths in this skill use these conventions:

- `agents/...`, `references/...`, `disciplines/...`, `templates/...`, `scripts/...`, `rules/...`, `skills/<name>/...` are Arc-owned files at the plugin root. Resolve the plugin root from this skill's filesystem location — it's the directory containing `agents/` and `skills/`.
- `./...` is local to this skill's directory.
- `.ruler/...`, `docs/...`, `src/...`, or any project-relative path refers to the user's project repository.
  </arc_runtime>

<rules_context>
**Load before committing:**

- `rules/git.md` — commit-message, husky, and lint-staged conventions this skill must respect.
- `references/diff-review-checklist.md` — apply during the pre-commit review step (step 1).
  </rules_context>

# Commit Changes

Commit, push, and publish changes, intelligently splitting into separate commits when changes span multiple domains.

Usage:

- `/arc:commit` - Auto-analyze and commit (may create multiple commits)
- `/arc:commit push` - Commit, push, then publish changed npm packages if present
- `/arc:commit publish` - Alias for the push-and-publish path

Commit owns commits, push, and simple publishing of an already-versioned package. Version bumps, changelogs, and multi-package/coordinated releases belong to `/arc:release` — route there instead of bumping versions here.

Read the user's invocation: no argument means commit only; "push" or "publish" both mean the push-and-publish path.

## Inspect Current Git State

Run these commands first and read the output before deciding on a commit strategy:

```bash
git status --porcelain 2>/dev/null || echo "(no changes)"
git diff --stat 2>/dev/null | head -20 || echo "(no diff)"
git log --oneline -5 2>/dev/null || echo "(no commits)"   # style reference
```

If there are no changes, tell the user and stop.

## Instructions

### 1. Analyze Changes

Review the git state above. If you need more detail on what changed, inspect the working tree — e.g. `git diff` for unstaged changes, `git diff --staged` for staged changes, or `git diff <path>` to focus on a file. Apply `references/diff-review-checklist.md` as you read the diff so obvious issues (debug logs, secrets, stray files) are caught before they land in a commit.

### 2. Determine Commit Strategy

**Single commit** if:

- All changes are in the same domain/area, OR
- Changes are tightly coupled (e.g., feature + its tests)

**Multiple commits** if changes span multiple unrelated domains:

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

### 6. Push Changes (only if `push` or `publish` argument provided)

**Skip this step** unless the user asked to "push" or "publish".

If pushing:

```bash
git push
```

If the branch has no upstream:

```bash
git push -u origin $(git branch --show-current)
```

If push fails (e.g., diverged history), report the issue - do NOT force push unless explicitly authorized.

### 7. Publish npm Packages (only if `push` or `publish` argument provided)

**Skip this step** unless the user asked to "push" or "publish".

Publish only after commits and push have succeeded.

**Detect candidate packages:**

- Look for changed `package.json` files and changed files under directories containing a `package.json`.
- Ignore generated directories such as `node_modules`, `dist`, `build`, `.next`, `.turbo`, and coverage output.
- A package is publishable only if `package.json` has a `name`, a `version`, and does not have `"private": true`.
- Prefer packages with a `publishConfig`, `files`, `bin`, `exports`, or an explicit package-level `prepublishOnly` / `prepare` / `build` script. If package intent is unclear, ask before publishing.

**Pre-publish checks for each candidate:**

1. Read the package's `package.json`.
2. Confirm the package has an npm package name and version.
3. Check whether that exact version is already published:

   ```bash
   npm view <package-name>@<version> version
   ```

   - If the version exists, skip publishing and report it.
   - If npm returns 404/not found, continue.
   - If npm auth/network fails, stop and report the blocker.

4. Run package-local verification when scripts exist, using the repo's detected package manager consistently:
   - `test` if a `test` script exists
   - `build` if a `build` script exists
   - `typecheck` if a `typecheck` script exists
5. Publish from the package directory:
   ```bash
   npm publish
   ```
   Use `npm publish --access public` for scoped public packages when `publishConfig.access` is `public` or the existing package is public.

**Publishing rules:**

- NEVER publish a private package.
- NEVER publish before pushing the commit containing the package version.
- NEVER bump a package version unless the user explicitly asked for a version bump.
- NEVER publish if the working tree has uncommitted files that belong to that package.
- NEVER use `--force` or delete registry versions.
- If multiple changed packages exist, publish each confirmed publishable package once.

### 8. Report Results

Tell the user:

- How many commits were created
- Summary of each commit (hash, message)
- Push status (if pushed), or remind them to push when ready
- Publish status for each package (if publish was requested): published, skipped, or blocked

## Failure Scenarios

If you cannot fix an error properly:

- Explain why the error exists
- Describe what the proper fix would require (e.g., architectural changes, missing types, etc.)
- Ask for guidance
- Do NOT commit with workarounds
