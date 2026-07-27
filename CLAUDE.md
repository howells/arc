# Arc Plugin

The full arc from idea to shipped code. Arc's canonical product definition, domain language, and
operating boundary live in `CONTEXT.md` — treat this file as contributor guidance, not a competing
definition.

Each skill in `skills/<name>/SKILL.md` is one `/arc:<name>` command, routed by a thin
`commands/<name>.md`. Skills draw on `agents/` (subagents), `references/` (domain knowledge,
catalogued in `references/index.md`), `rules/`, `disciplines/` (methodologies), and `templates/`
(output structures). `skills/using-arc/` is the session control plane; `skills/detail/` is
internal to `implement`. Neither has a command router.

The canonical flow is `ideate → (review) → implement`. `audit`, `improve`, `commit`, `release`,
and `refactor` are cross-cutting and available anytime.

## Gotchas

**The Codex mirror must be rebuilt after any change to `skills/`, `agents/`, `references/`,
`rules/`, `disciplines/`, `templates/`, `scripts/`, or `commands/`.** Run `pnpm build:codex`. The
pre-commit hook and `tests/test-codex-mirror.sh` both fail on a stale mirror, and the failure
message names the diffing file rather than the real cause.

**`plugins/arc/` is generated. Never edit it by hand** — `scripts/build-codex-plugin.sh` overwrites
it wholesale.

**Version bumps touch five manifests.** Use `bash scripts/bump-version.sh <version>`, never a
manual edit: it updates `package.json`, `.claude-plugin/`, `.codex-plugin/`, `.cursor-plugin/`
(plugin *and* marketplace), and the generated `plugins/arc/.codex-plugin/`. Verify with
`bash scripts/bump-version.sh --check`. A post-commit hook auto-bumps the patch version and amends
content commits.

**Adding a skill needs more than a `SKILL.md`.** It also needs a `commands/<name>.md` router, a
`.agents/skills/<name>` symlink, and entries in the plugin manifests — `tests/test-skill-loading.sh`
hardcodes the expected skill list and fails on any unexpected directory.

**Agents are not skills.** All 25 files in `agents/*/*.md` keep their own `<arc_runtime>` and
unconditionally load `references/subagent-safety.md`. That is deliberate: agents are dispatched as
subagents and skip `using-arc` via its `<SUBAGENT-STOP>` block, so those local blocks are their
only path grounding and injection defence. `tests/test-xml-tags.sh` enforces tag containment for
agents but not for skills, for the same reason.

**Skills must stay self-sufficient.** `audit`, `improve`, and `refactor` carry `context: fork` and
run isolated; command routers also invoke skills cold. Don't centralise a skill's `<arc_runtime>`
into `using-arc` — path resolution would silently break.

## Development

Edit the skill, run the command, iterate. Run `pnpm test` (the bash suite in `tests/`) before
committing.

## Publishing

Bump the version, run `pnpm build:codex`, commit and push. Users update via
`claude plugins update`, `codex plugin marketplace upgrade`, or
`git -C ~/.cursor/plugins/local/arc pull`.
