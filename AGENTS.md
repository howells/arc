# Arc Plugin - Agent Instructions

## Communication Expectations
- State which Arc workflow or artifact you are changing before editing.
- Keep workflow explanations precise; Arc is lifecycle machinery, not generic project documentation.
- When changing command behavior, mention the matching skill, command stub, agents, references, and tests affected.

## How To Work In This Codebase
- Read `CONTEXT.md` for product boundary and language before changing workflow behavior.
- Slash commands in `commands/` route to skills in `skills/`; do not fork behavior between them.
- Runtime support files live in `agents/`, `disciplines/`, `references/`, `rules/`, `templates/`, `scripts/`, and `tests/`.
- Site work is isolated under `site/` and uses its own Next.js scripts.

## Editing Constraints
- Keep Arc self-contained. Do not make core workflows depend on optional external plugins or skills.
- Do not copy project-local rules into Arc unless they are general Arc runtime rules.
- When adding a required reference to a skill, make sure the referenced file exists and the skill tells agents when to read it.
- Keep generated plugin packaging files consistent with `.codex`, command stubs, and skill paths.

## Search Preferences
- Search `skills/<workflow>/SKILL.md` before changing command docs.
- Search `references/` and `disciplines/` before creating new methodology text.
- For path questions, use `references/arc-paths.md` as the canonical artifact-location reference.

## Commands
- `pnpm test` - run skill tests.
- `pnpm lint` / `pnpm lint:fix` / `pnpm format` - shared lint and format lanes.
- `pnpm build:codex` - build Codex plugin package.
- `pnpm dev` - run the documentation site from `site/`.
- `pnpm --dir site typecheck` - site TypeScript check.

## Repo-Specific Rules
- Canonical Arc flow: vision, ideate, review, implement, testing, launch, with audit, refactor, and commit as cross-cutting workflows.
- Small workflow edits still need verification against command routing and tests.
- Prefer concise operational instructions over broad coaching prose.
- Mastra may be reviewed by Arc agents, but Arc itself should not become a Mastra runtime.
