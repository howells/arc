# Arc

The full arc from idea to shipped code, shipped as a plugin for Claude Code, Codex, and Cursor. `CONTEXT.md` is the canonical product definition, domain language, and operating boundary - read it before changing workflow behaviour. Treat this file as contributor guidance, not a competing definition.

## Shape

- Each skill in `skills/<name>/SKILL.md` is one `/arc:<name>` command, routed by a thin `commands/<name>.md`. Never fork behaviour between the two.
- Commands: `/arc:ideate`, `/arc:review`, `/arc:implement`, `/arc:testing`, `/arc:audit`, `/arc:improve`, `/arc:refactor`, `/arc:commit`, `/arc:release`, `/arc:launch`, `/arc:vision`.
- Canonical flow is `ideate -> (review) -> implement`. `audit`, `improve`, `commit`, `release`, and `refactor` are cross-cutting and available anytime.
- Skills draw on `agents/` (subagents), `references/` (domain knowledge, catalogued in `references/index.md`), `rules/`, `disciplines/` (methodologies), and `templates/` (output structures).
- `skills/using-arc/` is the session control plane; `skills/detail/` is internal to `implement`. Neither has a command router.
- Site work is isolated under `site/` with its own Next.js scripts.
- `rules/` is Arc's internal corpus, loaded selectively by workflows. It's shipped in the plugin payload but never injected as always-on Cursor rules - `tests/test-cursor-plugin.sh` enforces that.

## Gotchas

- **Rebuild the Codex mirror after any change to `skills/`, `agents/`, `references/`, `rules/`, `disciplines/`, `templates/`, `scripts/`, or `commands/`.** Run `pnpm build:codex`. The pre-commit hook and `tests/test-codex-mirror.sh` both fail on a stale mirror, and the failure names the diffing file rather than the real cause.
- **`plugins/arc/` is generated. Never edit it by hand** - `scripts/build-codex-plugin.sh` overwrites it wholesale.
- **Version bumps touch five manifests.** Use `bash scripts/bump-version.sh <version>`, never a manual edit: it updates `package.json`, `.claude-plugin/`, `.codex-plugin/`, `.cursor-plugin/` (plugin *and* marketplace), and the generated `plugins/arc/.codex-plugin/`. Verify with `bash scripts/bump-version.sh --check`. A post-commit hook auto-bumps the patch version and amends content commits.
- **Adding a skill needs more than a `SKILL.md`.** It also needs a `commands/<name>.md` router, a `.agents/skills/<name>` symlink, and entries in the plugin manifests - `tests/test-skill-loading.sh` hardcodes the expected skill list and fails on any unexpected directory.
- **Agents are not skills.** Every file in `agents/*/*.md` keeps its own `<arc_runtime>` and unconditionally loads `references/subagent-safety.md`. That's deliberate: agents are dispatched as subagents and skip `using-arc` via its `<SUBAGENT-STOP>` block, so those local blocks are their only path grounding and injection defence. `tests/test-xml-tags.sh` enforces tag containment for agents but not for skills, for the same reason.
- **Skills must stay self-sufficient.** `audit`, `improve`, and `refactor` carry `context: fork` and run isolated; command routers also invoke skills cold. Don't centralise a skill's `<arc_runtime>` into `using-arc` - path resolution would silently break.
- Adding a required reference to a skill means the file must exist and the skill must say when to read it. `tests/test-agents-and-refs.sh` checks the first half.

## Editing constraints

- Keep Arc self-contained. Core workflows must not depend on optional external plugins or skills.
- Don't copy project-local rules into Arc unless they're general Arc runtime rules.
- Mastra may be reviewed by Arc agents, but Arc itself must not become a Mastra runtime.
- When changing command behaviour, name the matching skill, command stub, agents, references, and tests affected.

## Search order

- `skills/<workflow>/SKILL.md` before changing command docs.
- `references/` and `disciplines/` before writing new methodology text.
- `references/arc-paths.md` is the canonical artifact-location reference.

## Commands

- `pnpm test` - the bash suite in `tests/`. Run before committing.
- `pnpm lint` / `pnpm lint:fix` / `pnpm format`
- `pnpm build:codex` - build the Codex plugin package.
- `pnpm dev` - documentation site from `site/`.
- `pnpm --dir site typecheck`

## Publishing

Bump the version, run `pnpm build:codex`, commit and push. Users update via `claude plugins update`, `codex plugin marketplace upgrade`, or `git -C ~/.cursor/plugins/local/arc pull`.
