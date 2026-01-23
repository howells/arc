---
name: tasklist
description: |
  Persistent task backlog that survives across sessions. Git-committed, always available.
  Use when asked to "add a task", "show my tasks", "update the backlog", "prioritize",
  or when managing what needs to be done across sessions.
license: MIT
metadata:
  author: howells
  argument-hint: <add|review|done> <task>
website:
  desc: Persistent backlog
  summary: Persistent task backlog that survives across sessions. Git-committed, always available.
  what: |
    Tasklist maintains a simple markdown file (docs/tasklist.md) with your backlog. It's git-tracked, so it persists across sessions and machines. Add tasks, prioritize, mark done — all without leaving the terminal.
  why: |
    Memory is the enemy. You have great ideas at 2am, in the shower, during a meeting. Without capture, they're gone. Tasklist is the simplest possible backlog that actually gets used.
  decisions:
    - Markdown file over database. Readable, diffable, portable.
    - Git-committed. Your backlog travels with your code.
    - Simple priority sections (Up Next / Backlog / Ideas). No Jira-style complexity.
---

# Tasklist Workflow

Manage a persistent task backlog that survives across sessions. Git-committed, always available.

## File Location

`docs/tasklist.md`

## Process

### Step 1: Check for Existing Tasklist

**Use Read tool:** `docs/tasklist.md`

**If file exists:** Read and proceed.
**If not exists:** Create with template using Write tool.

### Step 2: Determine Action

Parse arguments or ask:
- **"add [task]"** → Add a new task
- **"review"** → Show current list, discuss priorities
- **"prioritize"** → Reorder tasks
- **"done [task]"** → Mark complete (remove or archive)
- **No argument** → Show list and ask what to do

### For "Add"

Add to appropriate section:
```markdown
## Backlog

- [ ] [New task description]
```

### For "Review"

Show current tasklist. Ask:
"Anything to add, remove, or reprioritize?"

### For "Prioritize"

Present current order. Ask:
"What should be the top 3 priorities?"

Reorder based on response.

### For "Done"

Options:
1. **Remove** — Delete from list entirely
2. **Archive** — Move to "## Completed" section

## Tasklist Format

```markdown
# Tasklist

## Up Next
[Top priority items, 1-3 max]
- [ ] Task 1
- [ ] Task 2

## Backlog
[Everything else, roughly prioritized]
- [ ] Task 3
- [ ] Task 4
- [ ] Task 5

## Ideas
[Things to consider, not committed]
- Task idea 1
- Task idea 2

## Completed
[Optional: archived done items]
- [x] Done task 1 (2026-01-14)
```

### Step 3: Save Changes

```bash
git add docs/tasklist.md
git commit -m "docs: update tasklist"
```

## Interop

- **/arc:suggest** reads tasklist as primary source
- **/arc:ideate** can add follow-up tasks
- **/arc:implement** can add discovered tasks
- Any workflow can add to tasklist
