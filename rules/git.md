# Git Workflow

## Commits

- NEVER: Auto-commit changes; allow review first.
- MUST: Stage and review changes before committing.
- SHOULD: Use conventional commit messages when practical.
- SHOULD: Use `gh` CLI for GitHub operations (PRs, issues, etc.).

## Pre-commit Hooks

- MUST: New projects use Husky + lint-staged for pre-commit checks.
- MUST: Run lint (Biome/Ultracite) on staged files before commit.
- SHOULD: Run typecheck (`tsc --noEmit`) on commit for small/new projects.
- SHOULD: Move typecheck to pre-push hook for larger projects (>200 files).
- NEVER: Disable hooks permanently; use `--no-verify` sparingly for WIP commits.

### Setup

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

### Pre-commit Hook (.husky/pre-commit)

```bash
#!/bin/sh
pnpm lint-staged
pnpm typecheck
```

### lint-staged Config (package.json)

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["pnpm exec ultracite fix"],
    "*.{json,jsonc,css,md,mdx}": ["pnpm exec biome format --write"]
  }
}
```
