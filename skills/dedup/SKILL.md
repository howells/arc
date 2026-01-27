---
name: dedup
disable-model-invocation: true
description: |
  Detect semantic code duplication — functions that do the same thing but have
  different names or implementations. Use when asked to "find duplicates",
  "check for duplicate functions", "consolidate utilities", or before major
  refactoring efforts.
license: MIT
metadata:
  author: howells
website:
  order: 21
  desc: Semantic duplicate finder
  summary: Finds functions that do the same thing but have different names or implementations.
  what: |
    Dedup scans your codebase for semantic duplicates — functions that serve the same purpose with different names or implementations. It extracts a function catalog, categorizes by domain, identifies consolidation opportunities with confidence ratings, and presents a prioritized list of what to merge.
  why: |
    Codebases accumulate duplicates organically. Three different formatDate functions, five string sanitizers, two path normalizers. This command finds them so you can consolidate before the codebase becomes unmaintainable.
---

<progress_context>
**Use Read tool:** `docs/progress.md` (first 50 lines)

Check for recent refactoring context that might inform duplicate detection scope.
</progress_context>

# Duplicate Detection Workflow

Run the 5-phase duplicate detection process using the duplicate-detector research agent.

## Process

1. **Spawn the duplicate-detector agent** with the current codebase scope
2. **Present consolidated results** — grouped by domain with confidence ratings
3. **Offer consolidation plan** — suggest which duplicates to merge and into what

## Execution

Spawn the duplicate-detector agent:

```
Agent: ${CLAUDE_PLUGIN_ROOT}/agents/research/duplicate-detector.md
```

Pass the codebase scope (default: full codebase, or user-specified path).

## After Detection

Present results in this format:

```markdown
## Duplicate Detection Results

### High Confidence (≥90%)
| Function A | Function B | Domain | Recommendation |
|-----------|-----------|--------|---------------|
| formatDate() in utils/date.ts | formatTimestamp() in helpers/time.ts | Date formatting | Consolidate into formatDate() |

### Medium Confidence (70-89%)
[Same table format]

### Low Confidence (50-69%)
[Same table format — mention these but don't recommend action]
```

Ask the user which duplicates they want to consolidate, then offer to create a plan.

---

<progress_append>
After running duplicate detection, append to progress journal:

```markdown
## YYYY-MM-DD HH:MM — /arc:dedup
**Task:** Duplicate detection
**Outcome:** Found X duplicate groups (Y high confidence, Z medium)
**Scope:** [path or "full codebase"]
**Next:** Consolidate [N] duplicate groups

---
```
</progress_append>
