# TypeScript Rules

## Type Definitions
- MUST: Use `interface` over `type` for object type definitions.
- MUST: Use `type` for unions, mapped types, and conditional types.
- MUST: Use `as const` for literal type assertions.
- MUST: Use `import type` and `export type` for type-only imports/exports.
- NEVER: Use `unknown` as a generic constraint (e.g., `T extends unknown`).

## Type Safety
- NEVER: Use `any`. Prefer precise types or `unknown` with narrowing.
- NEVER: Cast to `any` (`as any`, `as unknown as`). Fix types at the source.
- NEVER: Use unsafe `as` casts to bypass errors. Wrong types = wrong code.
- NEVER: Use non-null assertions (`!`). Fix types at source.
- NEVER: Shadow variables from outer scope.

## Error Handling
- NEVER: Add unnecessary `try`/`catch`. Let errors propagate.
- SHOULD: Only catch when you can recover, transform, or report.

## Simplicity
- SHOULD: Only create abstractions when actually needed. Inline is fine.
- SHOULD: Avoid helper functions when a simple inline expression suffices.

## Style
- SHOULD: Use numeric separators in large number literals (e.g., `1_000_000`).
