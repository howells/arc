---
name: prune-agents
disable-model-invocation: true
description: |
  Kill orphaned Claude subagent processes that didn't exit cleanly.
  Use when asked to "prune agents", "clean up agents", "kill orphaned processes",
  or when subagents accumulate from Task tool usage.
license: MIT
metadata:
  author: howells
website:
  order: 20
  desc: Kill orphaned agents
  summary: Kills Claude Code processes that have become detached from their terminal. Safe to run anytime.
  what: |
    Prune-agents finds and kills Claude Code processes that have become orphaned — detached from their terminal (TTY shows "??"). These accumulate when the Task tool spawns subagents that don't cleanly exit after completion.
  why: |
    Orphaned Claude processes consume memory and CPU in the background. Pruning periodically keeps your system clean without affecting active terminal sessions.
  workflow:
    position: utility
---

<arc_runtime>
This workflow requires the full Arc bundle, not a prompts-only install.

Paths in this skill use these conventions:
- `agents/...`, `references/...`, `disciplines/...`, `templates/...`, `scripts/...`, `rules/...`, `skills/<name>/...` are Arc-owned files at the plugin root. Resolve the plugin root from this skill's filesystem location — it's the directory containing `agents/` and `skills/`.
- `./...` is local to this skill's directory.
- `.ruler/...`, `docs/...`, `src/...`, or any project-relative path refers to the user's project repository.
</arc_runtime>

# Prune Orphaned Agents

Run the cleanup script to kill orphaned Claude agent processes.

```bash
scripts/cleanup-orphaned-agents.sh
```

This kills Claude Code processes that have become detached from their terminal (TTY shows "??"). These accumulate when the Task tool spawns subagents that don't cleanly exit after completion.

**Safe to run anytime** — only kills orphaned processes. Active terminal sessions are preserved.

After running, report the result to the user including how many processes were cleaned up.
