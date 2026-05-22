# Arc Artifact Paths

Arc keeps its own generated artifacts in `docs/arc/` so they do not compete with product
docs or user-authored project documents.

## Canonical Locations

- Specs: `docs/arc/specs/`
- Plans: `docs/arc/plans/`
- Archive: `docs/arc/archive/`

## Compatibility

During migration, workflows may read from legacy locations if the canonical file does not
exist yet:

- `docs/plans/`

Always prefer `docs/arc/` for new writes.
