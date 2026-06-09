# Turborepo

Scope: Monorepo tasks and package setup.

## Just-in-Time Packages

- MUST: Export source TypeScript from packages via `exports` (no `dist` builds).
- SHOULD: Use source-mapped imports for better DX.

```json
{
  "name": "@project/utils",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.ts"
  }
}
```

## Task Configuration

- MUST: `dev` tasks are persistent and uncached.
- MUST: `build`, `typecheck`, `lint`, `test` depend on upstream (`^task`).
- SHOULD: Keep `turbo.json` minimal — only define tasks that need configuration.

## Caching

- MUST: Declare `outputs` for every task that writes to disk (`"outputs": ["dist/**"]`). Without this, results aren't cached.
- MUST: Include environment variables in `env` key so cache invalidates on change. Use `globalEnv` for variables affecting all tasks.
- MUST: Add `.env` files to `inputs` — Turbo doesn't auto-detect `.env` changes.
- SHOULD: Avoid root `.env` files. Place them in packages that need them for explicit dependency tracking.

## Package Configuration

- SHOULD: Use package-level `turbo.json` with `"extends": ["//"]` for package-specific overrides instead of `package#task` entries in root config.
- MUST: Declare workspace dependencies in `package.json` (`"@repo/types": "workspace:*"`) for `^build` to trigger correctly.

## CI

- SHOULD: Use `turbo run build` (not `turbo build`) in scripts and CI for reproducibility.
- SHOULD: Use `--affected` in CI to run only changed packages plus their dependents.
- MUST: Use `pnpm install --frozen-lockfile` in CI for reproducible builds.

## Anti-Patterns

| Never | Why | Instead |
|-------|-----|---------|
| Chain with `&&` in root scripts | Bypasses Turbo's dependency graph | Use `turbo run` |
| `prebuild` scripts building deps | Duplicates Turbo's work | Declare package dependencies |
| `../` in `inputs` | Implicit cross-package deps | Use `$TURBO_ROOT$/` |
| `--parallel` flag | Ignores dependency order | Configure `dependsOn` |
| Cross-package relative imports | Tight coupling | Import from package entry points |
