---
description: Kill orphaned Claude subagent processes that didn't exit cleanly.
---

Run the cleanup script to kill orphaned Claude agents:

```bash
${CLAUDE_PLUGIN_ROOT}/scripts/cleanup-orphaned-agents.sh
```

This kills Claude Code processes that have become detached from their terminal (TTY shows "??"). These accumulate when the Task tool spawns subagents that don't cleanly exit after completion.

**Safe to run anytime** - only kills orphaned processes. Active terminal sessions are preserved.

After running, report the result to the user.
