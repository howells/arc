# Installing Arc for Codex

Codex installs Arc as a native plugin from Arc's marketplace manifest
(`.claude-plugin/marketplace.json`, the shared marketplace format Codex and Claude Code
both read). This is the recommended path. A legacy clone-and-symlink installer remains
available for older Codex builds.

## Prerequisites

- Codex (CLI, IDE, or app) recent enough to include `codex plugin` (Codex CLI 0.117+)
- Git

## Native Plugin Install (Recommended)

```bash
codex plugin marketplace add howells/arc
codex plugin add arc@howells
```

`marketplace add` registers Arc's marketplace snapshot; `plugin add` installs the Arc
plugin into `~/.codex/plugins/cache/...`. Because the plugin ships Arc's bundled
`agents/`, `references/`, `disciplines/`, `templates/`, `scripts/`, and `rules/`, every
full-runtime workflow works without special-case copies.

Manage and update:

```bash
codex plugin list                    # what's available / installed
codex plugin marketplace upgrade     # refresh the marketplace snapshot
codex plugin remove arc              # uninstall
```

Restart Codex if skills do not appear immediately.

## Legacy Installer (older Codex without `codex plugin`)

```bash
curl -fsSL https://raw.githubusercontent.com/howells/arc/main/.codex/install.sh | bash -s -- --auto-update --interval-hours 6
```

What this does:

1. Clones Arc to `~/.codex/arc` (or fast-forwards if already installed).
2. Symlinks each Arc skill from `~/.codex/arc/.agents/skills/` into `~/.agents/skills/`
   — the directory Codex reads user-scope skills from.
3. Mirrors the same links into `~/.codex/skills/` for older builds that surfaced skills
   from there.
4. Configures scheduled updates (launchd on macOS, cron on Linux) when `--auto-update`
   is passed.

Prefer the native plugin install above when your Codex build supports it.

A prompts-only channel such as `npx skills add howells/arc` copies `SKILL.md` files only.
That is fine for lightweight routing, but it omits Arc's bundled `agents/`, `references/`,
`disciplines/`, `templates/`, `scripts/`, and `rules/`, so full-runtime workflows like
`audit`, `review`, `implement`, `refactor`, and `testing` will not have their supporting
material.

## Verify

```bash
codex plugin list
```

For a legacy install, confirm the user-scope symlinks instead:

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

## Uninstalling

Native plugin:

```bash
codex plugin remove arc
codex plugin marketplace remove howells
```

Legacy installer:

```bash
find ~/.agents/skills -maxdepth 1 -type l -lname "$HOME/.codex/arc/.agents/skills/*" -delete
find ~/.codex/skills  -maxdepth 1 -type l -lname "$HOME/.codex/arc/.agents/skills/*" -delete
rm -rf ~/.codex/arc
```
