---
name: tasklist
description: Persistent task backlog that survives across sessions. Git-committed, always available.
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
