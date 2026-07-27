# Git Workflow

## Commits

- MUST: Review changes before committing. A commit is a claim about what changed, so read the diff first.
- MUST: Stage deliberately — group related changes, don't `git add -A` by reflex.
- Note: `/arc:commit` satisfies the review requirement — reading and grouping the diff *is* its first step. This rule targets committing without looking, not automation as such.
- SHOULD: Use conventional commit messages when practical.
- SHOULD: Use `gh` CLI for GitHub operations (PRs, issues, etc.).

## Pre-commit Hooks

- MUST: Use Husky + lint-staged for pre-commit checks.
- MUST: lint-staged runs format only (`biome format --write`), not `biome check`. Lint and typecheck run separately on the full project.
- SHOULD: Run typecheck (`tsc --noEmit`) on commit for small projects, pre-push for large ones (>200 files).
- NEVER: Write manual `git stash push/pop` in hooks — lint-staged handles this safely.
- NEVER: Disable hooks permanently. `--no-verify` is for a local WIP commit you will amend before pushing — never for landing work, where it hides the defect the hook found.

## Claude Code Hooks

- SHOULD: Configure PostToolUse hooks to run `biome check --fix --unsafe` on Edit/Write.
- MUST: Use `biome check --fix` (combined format + lint), not separate `biome format` + `biome lint`.
