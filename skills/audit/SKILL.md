---
name: audit
description: |
  Comprehensive codebase audit with specialized reviewers. Generates actionable reports.
  Use when asked to "audit the codebase", "review code quality", "check for issues",
  "security review", or "performance audit". Accepts path scope like "apps/web".

  Reviewers run in batches of 2 by default to avoid resource exhaustion.
  Use --parallel to run all reviewers simultaneously (resource-intensive).
license: MIT
metadata:
  author: howells
  argument-hint: <path-or-focus> [--parallel] [--security|--performance|--architecture|--design]
---

<required_reading>
**Read these reference files NOW:**
1. ${CLAUDE_PLUGIN_ROOT}/disciplines/dispatching-parallel-agents.md
</required_reading>

<rules_context>
**Check for project coding rules:**

**Use Glob tool:** `.ruler/*.md`

**If `.ruler/` exists, detect stack and read relevant rules:**

| Check | Read from `.ruler/` |
|-------|---------------------|
| Always | code-style.md |
| `next.config.*` exists | nextjs.md |
| `react` in package.json | react.md |
| `tailwindcss` in package.json | tailwind.md |
| `.ts` or `.tsx` files | typescript.md |
| `vitest` or `jest` in package.json | testing.md |

Pass relevant rules to each reviewer agent.

**If `.ruler/` doesn't exist:** Continue without rules — they're optional.
</rules_context>

<process>
## Phase 1: Detect Scope & Project Type

**Parse arguments:**
- `$ARGUMENTS` may contain:
  - A path (e.g., `apps/web`, `packages/ui`, `src/`)
  - A focus flag (e.g., `--security`, `--performance`, `--architecture`, `--design`)
  - `--parallel` flag to run all reviewers simultaneously (resource-intensive)
  - Combinations (e.g., `apps/web --security`, `src/ --parallel`, `--design`)

**If no scope provided:**

**Use Glob tool to detect structure:**
- `apps/*`, `packages/*` → monorepo (audit both)
- `src/*` → standard (audit src/)
- Neither → audit current directory

**Detect project type with Glob + Grep:**

| Check | Tool | Pattern |
|-------|------|---------|
| Next.js | Grep | `"next"` in `package.json` |
| React | Grep | `"react"` in `package.json` |
| Python | Glob | `requirements.txt`, `pyproject.toml` |
| Rust | Glob | `Cargo.toml` |
| Go | Glob | `go.mod` |

**Check for database/migrations:**

**Use Glob tool:** `prisma/*`, `drizzle/*`, `migrations/*` → has-db

**Run dependency vulnerability scan (critical/high only):**

```bash
# Node.js projects
npm audit --json 2>/dev/null | jq '[.vulnerabilities | to_entries[] | select(.value.severity == "critical" or .value.severity == "high")] | length'

# Python projects
pip-audit --format json 2>/dev/null | jq '[.[] | select(.vulns[].fix_versions)] | length'

# Or use: pnpm audit --json, yarn audit --json
```

Only surface **critical** and **high** severity vulnerabilities. Ignore moderate/low — they create noise without actionable urgency.

**Detect project scale:**

Use file counts to determine appropriate audit depth:

```bash
# Count source files (exclude node_modules, .git, dist, build)
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.py" -o -name "*.go" -o -name "*.rs" \) | grep -v node_modules | grep -v .git | wc -l
```

| File Count | Scale | Audit Approach |
|------------|-------|----------------|
| < 20 files | Small | 2-3 reviewers max, skip architecture/simplicity |
| 20-100 files | Medium | 3-4 reviewers, standard audit |
| > 100 files | Large | Full reviewer suite, batched execution |

**Scale-appropriate signals:**
- Small projects: Skip `architecture-strategist` (no complex boundaries to review)
- Small projects: Skip `code-simplicity-reviewer` (not enough code to over-engineer)
- No tests present + small project: Don't flag missing tests as critical
- Single developer: Skip `senior-reviewer` (no code review discipline needed)

**Summarize detection:**
```
Scope: [path or "full codebase"]
Project type: [Next.js / React / Python / etc.]
Project scale: [small / medium / large]
Has database: [yes/no]
Has tests: [yes/no]
Coding rules: [yes/no]
Focus: [all / security / performance / architecture / design]
Execution mode: [batched (default) / parallel]
```

## Phase 2: Select Reviewers

**Base reviewer selection by project scale:**

| Scale | Core Reviewers |
|-------|----------------|
| Small | security-sentinel, performance-oracle |
| Medium | security-sentinel, performance-oracle, architecture-strategist |
| Large | security-sentinel, performance-oracle, architecture-strategist, senior-reviewer |

**Add framework-specific reviewers (medium/large only):**

| Project Type | Additional Reviewers |
|--------------|---------------------|
| Next.js | lee-nextjs-reviewer, daniel-product-engineer-reviewer |
| React/TypeScript | daniel-product-engineer-reviewer |
| Python/Rust/Go | (none additional) |

**Conditional additions:**
- If scope includes DB/migrations → add `data-integrity-guardian`
- If monorepo with shared packages (large only) → add `code-simplicity-reviewer`
- If UI-heavy (React/Next.js, medium/large) → add `design-quality-reviewer`
- If recent AI-assisted work or branch audit → add `llm-artifact-reviewer` (deslop)

**Focus flag overrides:**
- `--security` → only `security-sentinel`
- `--performance` → only `performance-oracle`
- `--architecture` → only `architecture-strategist`
- `--design` → only `design-quality-reviewer`
- `--deslop` → only `llm-artifact-reviewer`

**Final reviewer list:**
- Small projects: 2-3 reviewers
- Medium projects: 3-4 reviewers
- Large projects: 4-6 reviewers

## Phase 3: Run Audit

**Read agent prompts:**
For each selected reviewer, read:
```
${CLAUDE_PLUGIN_ROOT}/agents/review/[reviewer-name].md
```

**Execution strategy:**

By default, reviewers run in **batches of 2** to avoid resource exhaustion on large codebases. If `--parallel` flag is set, all reviewers run simultaneously.

### Batched Execution (Default)

Split reviewers into batches of 2. Run each batch, wait for completion, then run next batch.

**Example with 6 reviewers:**
```
Batch 1: security-sentinel, performance-oracle
  → Wait for both to complete
Batch 2: architecture-strategist, daniel-product-engineer-reviewer
  → Wait for both to complete
Batch 3: lee-nextjs-reviewer, senior-reviewer
  → Wait for both to complete
```

**Model selection per reviewer:**

| Reviewer | Model | Why |
|----------|-------|-----|
| security-sentinel | sonnet | Pattern recognition + context |
| performance-oracle | sonnet | Algorithmic reasoning |
| architecture-strategist | sonnet | Structural analysis |
| daniel-product-engineer-reviewer | sonnet | Code quality judgment |
| lee-nextjs-reviewer | sonnet | Framework pattern recognition |
| senior-reviewer | sonnet | Code review reasoning |
| code-simplicity-reviewer | sonnet | Complexity analysis |
| data-integrity-guardian | sonnet | Data safety reasoning |
| **design-quality-reviewer** | **opus** | **Aesthetic judgment requires premium model** |
| llm-artifact-reviewer | sonnet | Pattern recognition for AI artifacts |

**For each batch, spawn 2 agents in parallel:**
```
Task [security-sentinel] model: sonnet: "
Audit the following codebase for security issues.

Scope: [path]
Project type: [type]
Coding rules: [rules content if any]

Focus on: OWASP top 10, authentication/authorization, input validation, secrets handling, injection vulnerabilities.

Return findings in this format:
## Findings
### Critical
- [file:line] Issue description

### High
- [file:line] Issue description

### Medium
- [file:line] Issue description

### Low
- [file:line] Issue description

## Summary
[1-2 sentences]
"

Task [performance-oracle] model: sonnet: "
Audit the following codebase for performance issues.
[similar structure]
Focus on: N+1 queries, missing indexes, memory leaks, bundle size, render performance.
"

Task [design-quality-reviewer] model: opus: "
Review UI implementation for visual design quality.
[similar structure]
Focus on: aesthetic direction, memorable elements, typography, color cohesion, AI slop patterns.
"
```

**Wait for batch to complete before starting next batch.**

Repeat for remaining batches:
- Batch 2: architecture-strategist + UI reviewer (if applicable)
- Batch 3: remaining reviewers

### Parallel Execution (--parallel flag)

Only if `--parallel` flag is explicitly set, spawn all reviewers simultaneously:

```
Task [security-sentinel] model: sonnet: "..."
Task [performance-oracle] model: sonnet: "..."
Task [architecture-strategist] model: sonnet: "..."
[All additional reviewers in same message...]
```

⚠️ **Warning:** Parallel execution spawns 4-6 Claude instances simultaneously. This can cause system unresponsiveness on resource-constrained machines or large codebases.

**Wait for all agents to complete.**

## Phase 4: Consolidate Findings

**Collect all agent outputs.**

**Deduplicate:**
- Same file:line mentioned by multiple reviewers → merge into single finding
- Note which reviewers flagged each issue

**Categorize by severity:**
1. **Critical** — Security vulnerabilities, data loss risks, breaking issues
2. **High** — Performance blockers, architectural violations
3. **Medium** — Technical debt, code quality issues
4. **Low** — Suggestions, minor improvements

**Group by domain:**
- Security (from security-sentinel + dependency scan)
- Performance (from performance-oracle)
- Architecture (from architecture-strategist)
- Code Quality (from senior-reviewer, code-simplicity-reviewer)
- LLM Artifacts (from llm-artifact-reviewer) — AI-generated slop
- UI/UX Code (from daniel-product-engineer-reviewer, lee-nextjs-reviewer)
- Design Quality (from design-quality-reviewer) — visual/aesthetic concerns
- Data Integrity (from data-integrity-guardian)

## Phase 5: Generate Report

**Create audit report:**

```bash
mkdir -p docs/audits
```

File: `docs/audits/YYYY-MM-DD-[scope-slug]-audit.md`

```markdown
# Audit Report: [scope]

**Date:** YYYY-MM-DD
**Reviewers:** [list of agents used]
**Scope:** [path or "full codebase"]
**Project Type:** [detected type]

## Executive Summary

[1-2 paragraph overview of findings]

- **Critical:** X issues
- **High:** X issues
- **Medium:** X issues
- **Low:** X issues

## Critical Issues

> Immediate action required

### [Issue Title]
**File:** `path/to/file.ts:123`
**Flagged by:** security-sentinel, architecture-strategist
**Description:** [What's wrong and why it matters]
**Recommendation:** [How to fix]

[Repeat for each critical issue]

## High Priority

> Should fix soon

[Same format as Critical]

## Medium Priority

> Technical debt

[Same format]

## Low Priority / Suggestions

> Nice to have

[Same format]

---

## Domain Breakdown

### Security
[Summary of security findings]

### Performance
[Summary of performance findings]

### Architecture
[Summary of architecture findings]

### Code Quality
[Summary of code quality findings]

### LLM Artifacts
[Summary of AI-generated slop: unnecessary comments, defensive checks in trusted codepaths, type escapes]

### UI/UX Code
[Summary of UI/UX code findings, if applicable]

### Design Quality
[Summary of visual/aesthetic findings, if applicable]

### Data Integrity
[Summary of data integrity findings, if applicable]

---

## Next Steps

1. [Prioritized action item]
2. [Prioritized action item]
3. [Prioritized action item]
```

**Commit the report:**
```bash
git add docs/audits/
git commit -m "docs: add audit report for [scope]"
```

## Phase 6: Present & Offer Actions

**Show summary to user:**
```
## Audit Complete

Reviewed: [scope]
Reviewers: [count] agents
Report: docs/audits/YYYY-MM-DD-[scope]-audit.md

### Summary
- Critical: X
- High: X
- Medium: X
- Low: X

### Top Issues
1. [Critical issue 1]
2. [Critical issue 2]
3. [High issue 1]
```

**Offer next steps:**

```
What would you like to do?

1. **Create tasks from findings** → Add critical/high issues to /arc:tasklist
2. **Focus on critical issues** → Create implementation plan for critical fixes
3. **Deep dive on [domain]** → Explore specific domain findings
4. **Done for now** → End session
```

If user selects:
- **Create tasks** → Write critical/high issues to `docs/tasklist.md`
- **Focus on critical** → Invoke `/arc:detail` with critical issues as scope
- **Deep dive** → Show full findings for selected domain
- **Done** → End session

</process>

<progress_append>
After completing the audit, append to progress journal:

```markdown
## YYYY-MM-DD HH:MM — /arc:audit
**Task:** Audit [scope]
**Outcome:** Complete
**Files:** docs/audits/YYYY-MM-DD-[scope]-audit.md
**Decisions:**
- Critical: [N] issues
- High: [N] issues
- Reviewers: [list]
- Execution mode: [batched / parallel]
**Next:** [Create tasks / Focus on critical / Done]

---
```
</progress_append>

<success_criteria>
Audit is complete when:
- [ ] Scope detected (path, full codebase, or focus flag)
- [ ] Project type detected
- [ ] Execution mode determined (batched default, or --parallel)
- [ ] 4-6 reviewers selected based on context
- [ ] Reviewers run in batches of 2 (or all at once if --parallel)
- [ ] All reviewers completed
- [ ] Findings consolidated and deduplicated
- [ ] Report generated in `docs/audits/`
- [ ] Report committed to git
- [ ] Summary presented to user
- [ ] Next steps offered
- [ ] Progress journal updated
</success_criteria>
