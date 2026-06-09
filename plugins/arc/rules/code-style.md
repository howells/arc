# Code Style

## Formatting & Syntax
- MUST: Use Biome as the single source of truth for formatting.
- MUST: Use double quotes for strings and include semicolons.
- MUST: Include trailing commas (ES5: objects, arrays, function params).
- SHOULD: Wrap all arrow function parameters in parentheses.
- MUST: Use kebab-case ASCII filenames. Components: `component-name.tsx`; utilities: `util-name.ts`.
- SHOULD: Order imports external → internal → relative, and MUST use `node:` for Node builtins (Biome organizes imports).

## Naming & Comments
- MUST: Prefer clear function/variable names over inline comments.
- SHOULD: Include brief inline comments only when behavior is non-obvious.
- SHOULD: Use JSDoc for exported functions/components when additional context improves DX.
- MUST: Keep comments minimal and focused on "why" rather than "what".
- NEVER: Create `.md` documentation files for application code (README.md files for packages and the `.ruler` system are allowed).
- NEVER: Use emojis in code or commit messages.

## Canonical Code Principle
- MUST: Code is always canonical. No backward compatibility layers, deprecation warnings, or legacy patterns.
- MUST: When updating patterns or APIs, update ALL usage sites immediately. No migration periods.
- NEVER: Leave comments about "old way" vs "new way". The current code IS the way.
- NEVER: Add compatibility shims or adapters for old patterns. Remove old patterns entirely.
- MUST: Refactor fearlessly. The codebase reflects current best practices only.

## Patterns
- SHOULD: Use regex literals over `RegExp` constructor.
- MUST: Use `indexOf`/`lastIndexOf` for simple value lookups (not `findIndex`/`findLastIndex`).
- MUST: Use `.flatMap()` over `map().flat()`.

## Bug Ownership
- NEVER: Dismiss errors as "pre-existing bugs" and move on. If you encounter a failing test, type error, or broken behavior during your session, you caused it or your changes exposed it. Fix it.
- NEVER: Work around a bug instead of fixing it. No `// @ts-ignore`, no `as any` casts, no skipped tests to silence errors you introduced.
- MUST: If a test, build, or lint check fails, treat it as your responsibility. Investigate, identify the root cause, and fix it before continuing.

## Cleanup
- SHOULD: Use `knip` to find and remove unused code when making large changes.
