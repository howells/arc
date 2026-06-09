# Versions

Mandatory version requirements for all new projects.

## Minimum Versions

- MUST: Next.js 16.0.0+ — Turbopack stable, proxy.ts, `use cache`. See [nextjs.md](nextjs.md).
- MUST: React 19.0.0+ — ref-as-prop, use() hook, no forwardRef. See [react.md](react.md).
- MUST: TypeScript 5.8.0+
- MUST: Tailwind CSS 4.0.0+ — config-free, CSS-first. See [tailwind.md](tailwind.md).
- MUST: Zod 4.0.0+ — breaking inference changes from v3.
- MUST: Node.js 20.9.0+
- MUST: pnpm as package manager (not npm or yarn).
- MUST: @biomejs/biome 2.0.0+ (not ESLint/Prettier).

## Package.json

- MUST: Specify `engines.node` >= 20.9.0.
- SHOULD: Specify `packageManager` field.

```json
{
  "engines": { "node": ">=20.9.0" },
  "packageManager": "pnpm@10.11.0"
}
```
