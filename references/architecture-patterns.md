# Architecture Patterns Reference

Rules for maintaining clean, predictable codebases. These apply especially to monorepos with apps and packages.

## Import Depth Rule

**Deep relative imports indicate architectural problems.**

```typescript
// RED FLAG — This is a problem
import { cropFromBoundingBoxServer } from "../../../../../../../apps/web/features/match/lib/crop-server";

// The depth (7+ levels) tells you something is wrong:
// 1. This code is reaching across architectural boundaries
// 2. The imported module probably belongs in a shared package
// 3. Or the importing code is in the wrong place
```

### What to do when you see deep imports

| Depth | Assessment | Action |
|-------|------------|--------|
| 1-2 levels (`../`, `../../`) | Normal | Fine |
| 3-4 levels | Suspicious | Consider if this belongs in a shared location |
| 5+ levels | Architectural smell | Refactor — move to shared package or restructure |

### Solutions

1. **Move the shared code to a package**
   ```
   packages/
     shared/
       crop-server.ts  ← Move here
   ```
   ```typescript
   // Clean import from anywhere
   import { cropFromBoundingBoxServer } from "@repo/shared/crop-server";
   ```

2. **Move the importing code closer to what it needs**
   If code in `packages/foo` needs something from `apps/web`, maybe that code belongs in `apps/web`.

3. **Create a new package for the shared concern**
   If multiple places need the same thing, that's a package waiting to be born.

## One-Way Dependency Rule

**Dependencies must flow in one direction to avoid circular dependencies and maintain predictability.**

### The Hierarchy

```
┌─────────────────────────────────────────────┐
│  apps/                                       │  ← Top level (can import from below)
│    web/                                      │
│    api/                                      │
├─────────────────────────────────────────────┤
│  packages/                                   │  ← Middle level
│    ui/           (can import: utils, core)  │
│    core/         (can import: utils)        │
│    utils/        (can import: nothing)      │  ← Bottom level
└─────────────────────────────────────────────┘

Arrows point DOWN = allowed
Arrows point UP = forbidden
```

### Rules

| From | To | Allowed? |
|------|----|----------|
| `apps/*` | `packages/*` | Yes |
| `packages/*` | `apps/*` | **NO — Never** |
| `packages/ui` | `packages/utils` | Yes (lower level) |
| `packages/utils` | `packages/ui` | **NO — Would create cycle** |
| `apps/web` | `apps/api` | **NO — Apps don't import from apps** |

### Why This Matters

**Without one-way deps:**
```
packages/ui imports packages/core
packages/core imports packages/ui  ← Circular!

Result: Build failures, runtime errors, impossible to reason about
```

**With one-way deps:**
```
packages/ui imports packages/core
packages/core imports packages/utils
packages/utils imports nothing

Result: Clear hierarchy, predictable builds, easy to understand
```

### Detecting Violations

Signs of one-way dependency violations:

1. **Import paths going "up" the hierarchy**
   ```typescript
   // In packages/utils/something.ts
   import { Button } from "@repo/ui";  // utils importing ui = violation
   ```

2. **Packages importing from apps**
   ```typescript
   // In packages/core/auth.ts
   import { config } from "../../apps/web/config";  // Package → App = violation
   ```

3. **Circular dependency errors at build time**
   ```
   Error: Circular dependency detected: A -> B -> C -> A
   ```

### Fixing Violations

1. **Invert the dependency** — If A needs B and B needs A, one of them is wrong
2. **Extract the shared piece** — Create a new lower-level package both can import
3. **Pass as parameter** — Instead of importing, accept as a function argument
4. **Use dependency injection** — Configure at runtime instead of import time

## Package Boundary Rule

**Each package should have a clear, single responsibility.**

```
packages/
  ui/          ← React components only
  utils/       ← Pure functions, no framework deps
  core/        ← Business logic, domain types
  api-client/  ← API communication only
```

**Violations:**
- `packages/ui` containing business logic
- `packages/utils` importing React
- `packages/core` making API calls directly

## Monorepo Import Style

**Always use package aliases, never relative paths across package boundaries.**

```typescript
// GOOD — Uses workspace alias
import { Button } from "@repo/ui";
import { formatDate } from "@repo/utils";

// BAD — Relative path crossing package boundary
import { Button } from "../../../packages/ui/src/button";
```

Configure in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@repo/ui": ["../../packages/ui/src"],
      "@repo/utils": ["../../packages/utils/src"]
    }
  }
}
```

## Review Checklist

When reviewing code for architectural health:

- [ ] No imports with 5+ levels of `../`
- [ ] No packages importing from apps
- [ ] No lower-level packages importing from higher-level ones
- [ ] All cross-package imports use aliases, not relative paths
- [ ] Each package has a single, clear responsibility
- [ ] No circular dependencies (check build output)
