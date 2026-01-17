---
name: audit
description: Comprehensive codebase audit. Spawns specialized reviewers in parallel against a scoped portion of the codebase, consolidates findings, and generates an actionable report.
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
  - A focus flag (e.g., `--security`, `--performance`, `--architecture`)
  - Both (e.g., `apps/web --security`)

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

**Summarize detection:**
```
Scope: [path or "full codebase"]
Project type: [Next.js / React / Python / etc.]
Has database: [yes/no]
Coding rules: [yes/no]
Focus: [all / security / performance / architecture]
```

## Phase 2: Select Reviewers

**Base reviewer selection by project type:**

| Project Type | Core Reviewers |
|--------------|----------------|
| Next.js | security-sentinel, performance-oracle, architecture-strategist, lee-nextjs-reviewer, daniel-product-engineer-reviewer |
| React/TypeScript | security-sentinel, performance-oracle, architecture-strategist, daniel-product-engineer-reviewer, senior-reviewer |
| Python | security-sentinel, performance-oracle, architecture-strategist, senior-reviewer |
| Rust/Go | security-sentinel, performance-oracle, architecture-strategist, senior-reviewer |
| General | security-sentinel, performance-oracle, architecture-strategist, senior-reviewer |

**Conditional additions:**
- If scope includes DB/migrations → add `data-integrity-guardian`
- If monorepo with shared packages → add `code-simplicity-reviewer`

**Focus flag overrides:**
- `--security` → only `security-sentinel`
- `--performance` → only `performance-oracle`
- `--architecture` → only `architecture-strategist`

**Final reviewer list:** Select 4-6 reviewers based on context.

## Phase 3: Run Parallel Audit

**Read agent prompts:**
For each selected reviewer, read:
```
${CLAUDE_PLUGIN_ROOT}/agents/review/[reviewer-name].md
```

**Spawn reviewers in parallel:**
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

Task [architecture-strategist] model: sonnet: "
Audit the following codebase for architectural issues.
[similar structure]
Focus on: Component boundaries, coupling, abstraction levels, scalability concerns.
"

[Additional reviewers as selected...]
```

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
- Security (from security-sentinel)
- Performance (from performance-oracle)
- Architecture (from architecture-strategist)
- Code Quality (from senior-reviewer, code-simplicity-reviewer)
- UI/UX (from daniel-product-engineer-reviewer, lee-nextjs-reviewer)
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

### UI/UX
[Summary of UI/UX findings, if applicable]

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
**Next:** [Create tasks / Focus on critical / Done]

---
```
</progress_append>

<success_criteria>
Audit is complete when:
- [ ] Scope detected (path, full codebase, or focus flag)
- [ ] Project type detected
- [ ] 4-6 reviewers selected based on context
- [ ] All reviewers spawned in parallel
- [ ] All reviewers completed
- [ ] Findings consolidated and deduplicated
- [ ] Report generated in `docs/audits/`
- [ ] Report committed to git
- [ ] Summary presented to user
- [ ] Next steps offered
- [ ] Progress journal updated
</success_criteria>
