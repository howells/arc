# Arc Activity Log

Skills append to `.arc/log.md` on completion to maintain a running history of what Arc has done.

## Log Location

`.arc/log.md` in the project root (gitignored)

## Entry Format

```markdown
## YYYY-MM-DD HH:MM
/arc:[skill] — [Brief description of what was done]
Files: [comma-separated list of key files]

---
```

## Append Mechanism

After completing the skill's main work:

1. **Ensure .arc/ exists and is gitignored:**
```bash
mkdir -p .arc
if ! grep -q "^\.arc/$" .gitignore 2>/dev/null; then
  echo ".arc/" >> .gitignore
fi
```

2. **Prepend the new entry** (newest first):
```bash
# Create entry
cat > /tmp/arc-log-entry.md << 'EOF'
## YYYY-MM-DD HH:MM
/arc:[skill] — [description]
Files: [files]

---

EOF

# Prepend to log
if [ -f .arc/log.md ]; then
  cat .arc/log.md >> /tmp/arc-log-entry.md
fi
mv /tmp/arc-log-entry.md .arc/log.md
```

## Reading the Log

Skills that benefit from context should read recent entries:

```bash
head -50 .arc/log.md 2>/dev/null
```

Look for:
- Recent work on related features
- Decisions that affect current work
- Patterns in what's been done

## What Gets Logged

| Skill | What to Log |
|-------|-------------|
| `/arc:ideate` | Feature designed, approach chosen |
| `/arc:detail` | Plan created, task count |
| `/arc:implement` | Tasks completed, remaining |
| `/arc:test` | Test results, coverage |
| `/arc:review` | Plan reviewed, changes |
| `/arc:audit` | Issue counts by severity |
| `/arc:design` | UI designed, aesthetic direction |
| `/arc:letsgo` | Deployment status |
| `/arc:document` | Solution documented |
| `/arc:commit` | What was committed |
| `/arc:vision` | Vision created/updated |
| `/arc:figma` | Components implemented |
| `/arc:seo` | SEO audit results |
| `/arc:deps` | Dependency audit results |

## What Doesn't Get Logged

- `/arc:go` (routing only)
- `/arc:suggest` (read-only)
- `/arc:prune-agents` (utility)
- `/arc:tidy` (utility)
- `/arc:rules` (one-time setup)
- `/arc:naming` (standalone)

/arc:commit — 2 commits (`feat(web): clarify backend completion dashboard`, `feat(scrape): harden winners graph ingestion`)
