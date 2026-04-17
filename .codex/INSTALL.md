# Installing Arc for Codex

Enable Arc skills in Codex with the supported full-runtime install.

Codex best-practice path is `~/.agents/skills` (legacy `~/.codex/skills` still works).

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
2. Symlinks `~/.agents/skills/arc` to `~/.codex/arc/skills`.
3. Configures scheduled updates using launchd (macOS) or cron (Linux) when `--auto-update` is used.

This is the supported **full-runtime** install for Codex. Because the skills are discovered from the cloned Arc checkout, workflows that load bundled `agents/`, `references/`, `disciplines/`, `templates/`, and `scripts/` work without needing special-case copies.

If you install Arc through a prompts-only channel such as `skills.sh`, you only get `SKILL.md` files. That is useful for lightweight routing, but it is not sufficient for full-runtime workflows like `audit`, `review`, `implement`, `design`, `document`, and `testing`.

Restart Codex if skills do not appear immediately.

## Manual Install

```bash
git clone https://github.com/howells/arc.git ~/.codex/arc
mkdir -p ~/.agents/skills
ln -s ~/.codex/arc/skills ~/.agents/skills/arc
```

## Verify

```bash
ls -la ~/.agents/skills/arc
readlink ~/.agents/skills/arc
```

You should see a symlink pointing to `~/.codex/arc/skills`.

## Usage

Skills are discovered automatically. You can:

- In Codex, use `$<skill-name>`, not `/arc:<skill-name>`.
- Explicit invocation (recommended): `$go`, `$audit`, `$ideate`, `$design`, `$implement`, `$review`, `$testing`, `$deps`
- Implicit invocation: ask for a task that matches a skill description.

Arc also includes a lightweight bootstrap skill, `using-arc`, which is intended to be the
always-on control plane. It keeps startup context small and routes into the heavier Arc
skills only when they clearly apply.

## Updating

Manual update:

```bash
~/.codex/arc/.codex/update.sh
```

Enable or change auto-update later:

```bash
~/.codex/arc/.codex/enable-auto-update.sh --interval-hours 6
```

## Uninstalling

```bash
rm ~/.agents/skills/arc
rm -rf ~/.codex/arc
```
