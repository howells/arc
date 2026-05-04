---
name: deps
description: |
  Dependency audit, alternative discovery, and batch upgrades with test verification.
  Use when asked to "check dependencies", "audit packages", "update dependencies",
  "find outdated packages", or "check for CVEs". Generates a prioritized report,
  then optionally walks through batch upgrades with rollback on failure.
license: MIT
argument-hint: "[--apply] [--cve-only]"
metadata:
  author: howells
website:
  order: 15
  desc: Dependency audit
  summary: Audit dependencies for CVEs, outdated packages, and modern alternatives. Optionally batch-upgrade with test verification and rollback.
  what: |
    Deps audits your project's dependencies across four dimensions: known vulnerabilities (CVEs), staleness (major/minor/patch behind), deprecation status, and modern alternatives (lodash → es-toolkit, moment → date-fns). It generates a prioritized report with pre-computed upgrade batches, then optionally walks you through applying them—with test verification after each batch and automatic rollback on failure.
  why: |
    Dependency management is neglected until something breaks. npm audit is noisy, npm outdated gives raw data without context, and nobody proactively checks whether their dependencies have lighter, modern alternatives. Deps gives you the full picture in one command.
  decisions:
    - Report first, act later. The report is useful standalone—batches are pre-computed so you can work through them manually or let the tool apply them.
    - Curated alternatives for common cases. A maintained reference file covers lodash, moment, chalk, and other common swaps instantly. Web search catches the long tail.
    - Rollback on failure. Each batch is checkpointed. If tests break, the upgrade is reverted and the next batch proceeds.
  workflow:
    position: utility
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## BANNED TOOLS — calling these is a skill violation:
- **`EnterPlanMode`** — BANNED. Do NOT call this tool. This skill has its own structured process. Execute the steps below directly.
- **`ExitPlanMode`** — BANNED. You are never in plan mode.
</tool_restrictions>

<arc_runtime>
This workflow requires the full Arc bundle, not a prompts-only install.

Paths in this skill use these conventions:
- `agents/...`, `references/...`, `disciplines/...`, `templates/...`, `scripts/...`, `rules/...`, `skills/<name>/...` are Arc-owned files at the plugin root. Resolve the plugin root from this skill's filesystem location — it's the directory containing `agents/` and `skills/`.
- `./...` is local to this skill's directory.
- `.ruler/...`, `docs/...`, `src/...`, or any project-relative path refers to the user's project repository.
</arc_runtime>

<required_reading>
Read during Phase 2 (Alternative Discovery):
- `references/dependency-alternatives.md` — Curated table of known package replacements with migration effort ratings
</required_reading>

<process>

**Announce at start:** "I'm using the deps skill to audit your dependencies for vulnerabilities, outdated packages, and modern alternatives."

## Phase 1: Audit & Outdated Detection

**Parse arguments:**
- `$ARGUMENTS` may contain:
  - `--apply` — Skip straight to batch apply after report (no interactive menu)
  - `--cve-only` — Only report and fix CVE vulnerabilities, skip alternatives and outdated

**Detect package manager:**

**Use Glob tool in parallel:**

| Pattern | Package Manager |
|---------|----------------|
| `pnpm-lock.yaml` | pnpm |
| `yarn.lock` | yarn |
| `package-lock.json` | npm |
| `bun.lockb` | bun |

If multiple found, prefer pnpm > yarn > npm > bun.

**Run vulnerability audit:**

```bash
# pnpm
pnpm audit --json 2>/dev/null

# npm
npm audit --json 2>/dev/null

# yarn
yarn audit --json 2>/dev/null
```

Filter to **critical and high severity only.** Ignore moderate and low — they create noise without actionable urgency.

**Run outdated check:**

```bash
# pnpm
pnpm outdated --json 2>/dev/null

# npm
npm outdated --json 2>/dev/null

# yarn
yarn outdated --json 2>/dev/null
```

**Read package.json** for full dependency list (both `dependencies` and `devDependencies`).

**Detect environment:**

```bash
node --version
```

**Detect test runner** (needed for batch apply phase):

**Use Glob tool:**

| Pattern | Test Runner |
|---------|-------------|
| `vitest.config.*` | vitest |
| `jest.config.*` | jest |
| `playwright.config.*` | playwright |
| `cypress.config.*` | cypress |

Also check `package.json` scripts for `test` command.

**Classify findings into severity buckets:**

| Category | Criteria | Priority |
|----------|----------|----------|
| Critical CVE | Known vulnerability, critical/high severity | Must fix |
| Deprecated | Package marked deprecated on npm registry | Should consider |
| Has modern alternative | Match found in curated list or web search | Should consider |
| Major outdated | 2+ major versions behind current | Should consider |
| Minor/patch outdated | Behind on minor or patch version | Worth noting |

**Summarize detection:**
```
Package manager: [pnpm/npm/yarn/bun]
Node version: [version]
Test runner: [vitest/jest/playwright/none detected]
Total dependencies: N (N prod, N dev)
Critical/high CVEs: N
Outdated packages: N (N major, N minor, N patch)
```

## Phase 2: Alternative Discovery

**If `--cve-only` flag is set, skip this phase entirely.**

**Load curated alternatives** (from `<required_reading>` above).

**For each dependency in the project:**

1. Check if the package name appears in the curated alternatives table
2. If found → record the alternative, reason, and migration effort
3. If NOT found → check whether this package is flagged (any of: 2+ major versions outdated, critical/high CVE, deprecated)

**For flagged packages NOT in the curated table:**

Use WebSearch to discover alternatives:

```
WebSearch: "alternative to [package-name] npm 2026"
```

For each search result:
- If a clear, well-maintained alternative exists → record it with reason and estimated migration effort
- If no clear alternative → record "no clear alternative found" and move on

**Skip web search for packages that are:**
- Current and healthy (not outdated, no CVEs, not deprecated)
- In the "do not flag" list from the reference file (react, next, typescript, etc.)
- devDependencies that are only minor/patch behind

**Compile alternatives list:**

For each alternative found (curated or discovered):

| Package | Current Version | Alternative | Reason | Migration Effort | Source |
|---------|----------------|-------------|--------|-----------------|--------|
| lodash | 4.17.21 | es-toolkit | 97% smaller, modern ESM | Medium | Curated |
| legacy-pkg | 1.2.0 | modern-pkg | Actively maintained replacement | Medium | Web search |

## Phase 3: Report Generation

**Create report directory:**

```bash
mkdir -p docs/audits
```

**Generate report file:** `docs/audits/YYYY-MM-DD-deps-audit.md`

Use today's date. The report follows this structure:

```markdown
# Dependency Audit Report

**Date:** YYYY-MM-DD
**Package Manager:** [detected]
**Total dependencies:** N (N prod, N dev)
**Node version:** [detected]

## Summary

- Critical CVEs: N
- Deprecated packages: N
- Modern alternatives available: N
- Major version outdated: N
- Minor/patch outdated: N

## Must Fix — CVEs

> Known vulnerabilities with critical or high severity

### [package-name] ([current] → [fixed version])
**CVE:** [CVE ID]
**Severity:** [Critical/High]
**Description:** [Brief description of the vulnerability]
**Fix:** `[package-manager] update [package-name]`
**Alternative:** [If a modern alternative exists, mention it here]

[Repeat for each CVE]

## Should Consider — Alternatives

> Modern replacements for heavy, deprecated, or outdated packages

### [package-name] ([current version])
**Status:** [Deprecated / Outdated / Heavy]
**Alternative:** [replacement package or built-in]
**Reason:** [Why the alternative is better]
**Migration effort:** [Low / Medium / High]
**Bundle impact:** [Estimated size reduction if known]
**Source:** [Curated / Web search]

[Repeat for each alternative]

## Should Consider — Major Outdated

> Packages 2+ major versions behind

### [package-name] ([current] → [latest])
**Behind:** [N major versions]
**Risk:** [Low / Medium / High — based on changelog breaking changes]
**Key changes:** [1-2 most important breaking changes from changelog]

[Repeat for each]

## Worth Noting — Minor Outdated

| Package | Current | Latest | Behind | Type |
|---------|---------|--------|--------|------|
| [name] | [ver] | [ver] | [minor/patch] | [prod/dev] |

[Table of all minor/patch outdated packages]

## Upgrade Batches

Pre-computed batches for the interactive apply phase.

### Batch 1: Safe Patches (low risk)
Apply together, test once.

| Package | Current | Target | Type |
|---------|---------|--------|------|
| [name] | [ver] | [ver] | [minor/patch] |

**Command:** `[package-manager] update [list of packages]`

### Batch 2: CVE Fixes (high priority)
Apply together, test once.

| Package | Current | Target | CVE |
|---------|---------|--------|-----|
| [name] | [ver] | [ver] | [CVE ID] |

**Command:** `[package-manager] update [list of packages]`

### Batch 3: Major Upgrades (test carefully)
Apply individually, test after each.

| Package | Current | Target | Breaking Changes |
|---------|---------|--------|-----------------|
| [name] | [ver] | [ver] | [key changes] |

### Batch 4: Replacements (separate work)
These require code changes — flagged for manual migration.

| Current Package | Alternative | Migration Effort |
|----------------|-------------|-----------------|
| [name] | [replacement] | [Low/Medium/High] |

**Note:** Replacements are not auto-applied. Install the alternative, migrate imports, then remove the old package.
```

**Commit the report:**

```bash
git add docs/audits/
git commit -m "docs: add dependency audit report"
```

## Phase 4: Present Summary & Interactive Walkthrough

**Present summary to user:**

```
Dependency audit complete.
Report: docs/audits/YYYY-MM-DD-deps-audit.md

Summary:
- Critical CVEs: N
- Deprecated: N
- Modern alternatives: N
- Major outdated: N
- Minor/patch outdated: N

Suggested batches:
1. Safe patches (N packages) — low risk
2. CVE fixes (N packages) — high priority
3. Major upgrades (N packages) — test carefully
4. Replacements (N packages) — needs code changes
```

**If `--apply` flag was set:** Skip the menu and go straight to walking through all batches.

**If `--cve-only` flag was set:** Skip the menu and apply only Batch 2 (CVE fixes).

**Otherwise, offer next steps via AskUserQuestion:**

```
Question: "How would you like to proceed?"
Header: "Next step"
Options:
  1. "Apply safe patches" (Recommended) — Batch 1: minor/patch updates, low risk
  2. "Walk through all batches" — Review each batch, approve or skip
  3. "Apply CVE fixes only" — Just the security-critical updates
  4. "Done for now" — Report is committed, come back later
```

### Batch Apply Cycle

For each approved batch, execute this cycle:

**Step 1: Git checkpoint**

```bash
git add -A && git commit -m "checkpoint: before [batch description] upgrade" --allow-empty
```

**Step 2: Run upgrade commands**

Use the detected package manager from Phase 1:

```bash
# For Batch 1 (safe patches) and Batch 2 (CVE fixes):
[package-manager] update [list of packages]

# For Batch 3 (major upgrades) — one at a time:
[package-manager] install [package]@latest

# For Batch 4 (replacements):
[package-manager] install [alternative-package]
# Do NOT remove old package — user must migrate imports first
```

**Step 3: Type check (if TypeScript project)**

```bash
# Check if tsconfig.json exists first
tsc --noEmit
```

If type check fails → this may be expected for major upgrades. Note the errors but don't auto-rollback on type errors alone. Report them to the user.

**Step 4: Run tests**

Use the detected test runner from Phase 1:

```bash
# vitest
pnpm vitest run

# jest
pnpm jest

# playwright
pnpm exec playwright test

# npm script fallback
pnpm test
```

**Step 5: Evaluate result**

**If tests pass:**
```bash
git add -A && git commit -m "deps: [batch description]"
```

Report: "[batch description] applied successfully. Tests passing."

**If tests fail:**
```bash
# Rollback to checkpoint
git reset --hard HEAD~1
```

Report which package(s) likely caused the failure:
```
Batch [N] failed — tests broke after upgrading [packages].
Rolled back to checkpoint. You may want to upgrade these individually
to isolate the breaking package.
```

Continue to next batch — one failure shouldn't block the rest.

### Replacement Handling (Batch 4)

Replacements are NOT auto-migrated. For each approved replacement:

1. Install the new package:
   ```bash
   [package-manager] install [alternative-package]
   ```

2. Report to user:
   ```
   Installed [alternative]. [old-package] is still in package.json.

   To complete the migration:
   1. Replace [old-package] imports with [alternative] equivalents
   2. Run tests to verify
   3. Remove [old-package]: [package-manager] remove [old-package]

   Consider running /arc:implement to handle the import migration.
   ```

3. Do NOT remove the old package or modify imports automatically.

### Final Summary

After all batches are processed:

```
## Dependency Update Summary

Packages upgraded: N
Batches applied: N/N
Batches skipped: N
Failures rolled back: N
Replacements flagged: N (need manual migration)

Report: docs/audits/YYYY-MM-DD-deps-audit.md
```

</process>

<arc_log>
**After completing this skill, append to the activity log.**
See: `references/arc-log.md`

Entry: `/arc:deps — Dependency audit ([N] CVEs, [N] outdated)`
</arc_log>

<success_criteria>
Dependency audit is complete when:
- [ ] Package manager detected
- [ ] Vulnerability audit run (critical/high only)
- [ ] Outdated check run
- [ ] Curated alternatives matched
- [ ] Web search run for flagged unlisted deps
- [ ] Report generated in docs/audits/
- [ ] Report committed
- [ ] Summary presented to user
- [ ] Next steps offered
- [ ] Batches applied (if user chose to apply)
- [ ] Test verification after each batch
- [ ] Rollback on failure
- [ ] Progress journal updated
</success_criteria>
