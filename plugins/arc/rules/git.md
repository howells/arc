# Git Workflow

## Commits

- NEVER: Auto-commit changes; allow review first.
- MUST: Stage and review changes before committing.
- SHOULD: Use conventional commit messages when practical.
- SHOULD: Use `gh` CLI for GitHub operations (PRs, issues, etc.).

## Pre-commit Hooks

- MUST: Use Husky + lint-staged for pre-commit checks.
- MUST: lint-staged runs format only (`biome format --write`), not `biome check`. Lint and typecheck run separately on the full project.
- SHOULD: Run typecheck (`tsc --noEmit`) on commit for small projects, pre-push for large ones (>200 files).
- NEVER: Write manual `git stash push/pop` in hooks — lint-staged handles this safely.
- NEVER: Disable hooks permanently; use `--no-verify` sparingly for WIP commits.

## Claude Code Hooks

- SHOULD: Configure PostToolUse hooks to run `biome check --fix --unsafe` on Edit/Write.
- MUST: Use `biome check --fix` (combined format + lint), not separate `biome format` + `biome lint`.
