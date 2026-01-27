---
name: cleanup
disable-model-invocation: true
description: |
  Kill orphaned Claude subagent processes that didn't exit cleanly.
  Use when asked to "clean up agents", "kill orphaned processes",
  or when subagents accumulate from Task tool usage.
license: MIT
metadata:
  author: howells
website:
  order: 20
  desc: Kill orphaned agents
  summary: Kills Claude Code processes that have become detached from their terminal. Safe to run anytime.
  what: |
    Cleanup finds and kills Claude Code processes that have become orphaned — detached from their terminal (TTY shows "??"). These accumulate when the Task tool spawns subagents that don't cleanly exit after completion.
  why: |
    Orphaned Claude processes consume memory and CPU in the background. Running cleanup periodically keeps your system clean without affecting active terminal sessions.
---

# Cleanup Orphaned Agents

Run the cleanup script to kill orphaned Claude agent processes.

```bash
${CLAUDE_PLUGIN_ROOT}/scripts/cleanup-orphaned-agents.sh
```

This kills Claude Code processes that have become detached from their terminal (TTY shows "??"). These accumulate when the Task tool spawns subagents that don't cleanly exit after completion.

**Safe to run anytime** — only kills orphaned processes. Active terminal sessions are preserved.

After running, report the result to the user including how many processes were cleaned up.
