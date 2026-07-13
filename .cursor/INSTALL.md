# Installing Arc for Cursor

Arc is a first-class Cursor plugin (Cursor 2.5+). A local or team install clones
the full repo, so skills can resolve Arc-owned agents, references, disciplines,
templates, scripts, and rules — the same full-runtime model as Claude Code and
Codex. Arc's `rules/` corpus stays internal to workflows; it is not injected as
always-on Cursor rules.

## Prerequisites

- Cursor 2.5+
- Git

## Local Plugin Install (Recommended for individuals)

Symlink this repo (or a clone) into Cursor's local plugin directory:

```bash
bash .cursor/install.sh
```

Or manually:

```bash
mkdir -p ~/.cursor/plugins/local
ln -sfn /path/to/arc ~/.cursor/plugins/local/arc
```

Then reload Cursor (**Developer: Reload Window**).

Fresh clone without a local checkout:

```bash
git clone https://github.com/howells/arc.git ~/.cursor/plugins/local/arc
```

Update a clone install with `git -C ~/.cursor/plugins/local/arc pull`. Symlink
installs update when you pull the linked checkout.

## Team / Enterprise Marketplace

On Teams or Enterprise:

1. Open **Dashboard → Plugins → Add Marketplace**
2. **Import from Repo** → `github.com/howells/arc`
3. Review the `arc` plugin, set access and install mode (Default Off / On / Required)
4. Optionally enable **Auto Refresh** (Cursor GitHub App required)

Developers then install from **Customize** in the sidebar.

## Public Marketplace

Submit / request listing at [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish).
Public marketplace updates are manually reviewed.

## In-session Install

In Agent chat or the Cursor CLI session:

```text
/add-plugin howells/arc
```

or paste the GitHub URL. Prefer the local symlink or team marketplace for a
stable full-runtime install.

## Verify

After reload, open **Customize** and confirm the Arc plugin shows skills,
commands, and agents. In Agent chat:

```text
/ideate
/implement
/audit
/commit
```

Cursor invokes public workflows as `/<name>` (no `/arc:` prefix). Internal
supporting skills (`detail`, `using-arc`) load when workflows need them.

## Uninstalling

```bash
rm -f ~/.cursor/plugins/local/arc
# or, if it was a clone rather than a symlink:
rm -rf ~/.cursor/plugins/local/arc
```

Then reload Cursor. Team-marketplace installs are removed from **Customize** or
by an admin changing marketplace install mode.

## Prompt-Only Channel (Not Full-Runtime)

`npx skills add howells/arc` copies skill prompts only. Prefer the Cursor plugin
install above for audit, review, implement, refactor, and testing workflows.
