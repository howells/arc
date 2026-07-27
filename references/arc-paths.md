# Arc Artifact Paths

Arc keeps its own generated artifacts under `docs/arc/` so they do not compete with product
docs or user-authored project documents. The vision artifact is the exception — it lives at
the repo root by convention.

## Canonical Locations

- Vision: root `CONTEXT.md` (single context) + `CONTEXT-MAP.md` for multi-context monorepos
- Specs: `docs/arc/specs/`
- Plans: `docs/arc/plans/YYYY-MM-DD-<slug>-implementation.md`
- Plan index: `docs/arc/plans/INDEX.md` (schema and write rules in `references/plan-lifecycle.md`)
- Audits: `docs/arc/audits/`
- Decisions (ADRs): `docs/adr/`

Decisions are the one artifact that does **not** live under `docs/arc/`. Architecture
decision records use the community-standard `docs/adr/` path, not `docs/arc/decisions/`.
Migration note: if a repo has both, treat `docs/adr/` as canonical and move any stray
`docs/arc/decisions/` records into it.

## Compatibility

During migration, workflows may read from legacy locations if the canonical file does not
exist yet:

- `docs/plans/` → `docs/arc/plans/`
- `docs/vision.md` → root `CONTEXT.md`

Always prefer the canonical locations above for new writes.
