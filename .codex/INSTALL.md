# Installing Arc for Codex

The supported install is the full-runtime installer below. It clones Arc and links its
skills into the directory Codex reads user-scope skills from (`~/.agents/skills`), so
every workflow has Arc's bundled `agents/`, `references/`, `disciplines/`, `templates/`,
`scripts/`, and `rules/`. Native `codex plugin` install is experimental (see the end).

## Prerequisites

- Git
- Codex (CLI, IDE, or app)
- macOS/Linux for the one-command installer below

## Quick Install (Recommended)

Install Arc and enable scheduled auto-updates every 6 hours:

```bash
curl -fsSL https://raw.githubusercontent.com/howells/arc/main/.codex/install.sh | bash -s -- --auto-update --interval-hours 6
```

Install once without auto-update:

```bash
curl -fsSL https://raw.githubusercontent.com/howells/arc/main/.codex/install.sh | bash
```

What this does:

1. Clones Arc to `~/.codex/arc` (or fast-forwards if already installed).
2. Symlinks each Arc skill from `~/.codex/arc/.agents/skills/` into `~/.agents/skills/`
   — the directory Codex reads user-scope skills from.
3. Mirrors the same links into `~/.codex/skills/` for older builds that surfaced skills
   from there.
4. Configures scheduled updates (launchd on macOS, cron on Linux) when `--auto-update`
   is passed.

Because the skills are discovered from the cloned checkout, full-runtime workflows that
load Arc-owned `agents/`, `references/`, `disciplines/`, `templates/`, and `scripts/`
work without special-case copies.

A prompts-only channel such as `npx skills add howells/arc` copies `SKILL.md` files only.
That is fine for lightweight routing, but it omits Arc's bundled material, so workflows
like `audit`, `review`, `implement`, `refactor`, and `testing` will not have their
supporting files.

Restart Codex if skills do not appear immediately.

## Manual Install

```bash
git clone https://github.com/howells/arc.git ~/.codex/arc
mkdir -p ~/.agents/skills ~/.codex/skills
for skill in ~/.codex/arc/.agents/skills/*; do
  ln -s "$skill" ~/.agents/skills/$(basename "$skill")   # Codex user scope
  ln -s "$skill" ~/.codex/skills/$(basename "$skill")    # compatibility mirror
done
```

## Verify

```bash
ls -la ~/.agents/skills/{audit,ideate,implement}
readlink ~/.agents/skills/audit   # -> ~/.codex/arc/.agents/skills/audit
```

## Usage

Skills are discovered automatically.

- In Codex, invoke a skill with `$<skill-name>`, not `/arc:<skill-name>`.
- Explicit invocation: `$audit`, `$ideate`, `$implement`, `$review`, `$refactor`,
  `$testing`, `$launch`, `$commit`, `$vision`.
- Implicit invocation: describe a task that matches a skill's description.

Arc also includes a lightweight bootstrap skill, `using-arc`, the always-on control
plane. It keeps startup context small and routes into heavier Arc skills only when they
clearly apply.

## Updating

```bash
~/.codex/arc/.codex/update.sh                                  # manual
~/.codex/arc/.codex/enable-auto-update.sh --interval-hours 6   # enable/adjust schedule
```

## Uninstalling

```bash
find ~/.agents/skills -maxdepth 1 -type l -lname "$HOME/.codex/arc/.agents/skills/*" -delete
find ~/.codex/skills  -maxdepth 1 -type l -lname "$HOME/.codex/arc/.agents/skills/*" -delete
rm -rf ~/.codex/arc
```

## Native Plugin Install (Experimental)

Arc ships a `.claude-plugin/marketplace.json` (the marketplace format shared with Claude
Code) and a `.codex-plugin/plugin.json` manifest. On current Codex builds:

```bash
codex plugin marketplace add howells/arc
```

registers the source, but `codex plugin add arc@howells` does not yet resolve the plugin,
because Codex's native marketplace discovery currently expects an `.agents/plugins/`
layout rather than the shared `.claude-plugin/marketplace.json`. Until that path
stabilizes, use the full-runtime installer above.
