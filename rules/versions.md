# Versions

Mandatory version requirements for all new projects. These are floors (hard minimums), not
targets — prefer the current active LTS / latest stable within each major line.

## Minimum Versions

- MUST: Next.js 16.0.0+ — Turbopack stable, proxy.ts, `use cache`. See [nextjs.md](nextjs.md).
- MUST: React 19.0.0+ — ref-as-prop, use() hook, no forwardRef. See [react.md](react.md).
- MUST: TypeScript 5.8.0+
- MUST: Tailwind CSS 4.0.0+ — config-free, CSS-first. See [tailwind.md](tailwind.md).
- MUST: Zod 4.0.0+ — breaking inference changes from v3.
- MUST: Node.js 24.0.0+ — track the active LTS line.
- MUST: pnpm 11+ as package manager (not npm or yarn).
- MUST: @biomejs/biome 2.0.0+ (not ESLint/Prettier).

## Package.json

- MUST: Specify `engines.node` >= 24.0.0.
- SHOULD: Specify `packageManager` field, pinned to the pnpm version in use.

```json
{
  "engines": { "node": ">=24.0.0" },
  "packageManager": "pnpm@11.5.2"
}
```
