# Turborepo Configuration Rules

Scope: Monorepo tasks and package setup.

## Just-in-Time Packages
- MUST: Export source TypeScript from packages via `exports` (no `dist` builds).
- SHOULD: Use source-mapped imports for better DX.

## Exports Example

```json
{
  "name": "@project/utils",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.ts"
  }
}
```

For packages with both `.ts` and `.tsx`:

```json
{
  "exports": {
    "./*": {
      "types": "./src/*.ts",
      "default": "./src/*.tsx"
    }
  }
}
```

Rationale: JIT packages enable fast dev loops, simpler builds, and precise types across package boundaries.

## turbo.json Example

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^test"]
    }
  }
}
```
