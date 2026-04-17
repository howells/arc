---
name: audit
context: fork
description: |
  Comprehensive codebase audit with verification and specialized reviewers.
  Generates actionable reports.
  Use when asked to "audit the codebase", "review code quality", "check for issues",
  "security review", or "performance audit". Accepts path scope like "apps/web".

  Verification-only modes (`quick`, `pre-commit`, `pre-pr`) skip reviewer agents and run
  the mechanical checks directly. Full and focused modes run those checks first, then the
  reviewer agents. `--harden` preserves the interactive UI resilience flow.
license: MIT
argument-hint: [quick|pre-commit|pre-pr|<path-or-focus>] [--parallel] [--diff [base]] [--stage=prototype|development|pre-launch|production] [--security|--performance|--architecture|--organization|--design|--accessibility|--hygiene|--seo|--docs|--copy|--harden]
metadata:
  author: howells
website:
  order: 13
  desc: Codebase audit
  summary: Verification plus specialist review with a scored scorecard. Run fast mechanical checks, focused audits, or the full multi-reviewer pass from one command.
  what: |
    Audit now handles both the old "verify" path and the reviewer-driven audit path. In quick modes it runs build, typecheck, lint, tests, debug-log scanning, git status, and secrets scanning without spawning agents — and produces a partial scorecard. In full or focused modes it runs those mechanical checks first, then dispatches the relevant reviewers, consolidates findings, and produces a scored scorecard across 7 axes (0-21) with optional bonus axes for UI, accessibility, and SEO.
  why: |
    Mechanical checks catch obvious breakage. Reviewers catch the judgment calls that linters miss. Putting both in one workflow removes the "verify or audit?" decision and keeps the fast path fast.
  decisions:
    - `quick`, `pre-commit`, and `pre-pr` are verification-only modes. No agents.
    - Full and focused audits run mechanical checks before reviewers.
    - `--harden` stays interactive and does not fork into reviewer mode.
  agents:
    - security-engineer
    - performance-engineer
    - architecture-engineer
    - daniel-product-engineer
    - lee-nextjs-engineer
    - senior-engineer
    - designer
    - data-engineer
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
Resolve the Arc install root from this skill's location and refer to it as `${ARC_ROOT}`.
Use `${ARC_ROOT}/...` for Arc-owned files such as `references/`, `disciplines/`, `agents/`, `templates/`, and `scripts/`.
Use project-local paths such as `.ruler/` or `rules/` for the user's repository.
</arc_runtime>

<platform_context>
**Read this reference NOW:**
1. `${ARC_ROOT}/references/platform-tools.md`

Adapt the workflow to the current harness instead of assuming Claude-specific tool names.
- Use platform-native task tracking only when available; otherwise continue without it.
- Use platform-native structured questions when available; otherwise ask concise plain-text questions.
- Use the platform's subagent/delegation primitives when available; otherwise run the review steps locally.
</platform_context>

<tasklist_context>
**If the current platform has a native task/todo tool, use it** to check for existing tasks related to this work.

If a related task exists, note its ID and mark it `in_progress` when starting.
If no native task/todo tool exists, skip task tracking and continue with the audit.
</tasklist_context>

<required_reading>
**Read these reference files NOW:**
1. `${ARC_ROOT}/disciplines/dispatching-parallel-agents.md`
2. `${ARC_ROOT}/references/audit-stage-calibration.md`
3. `${ARC_ROOT}/references/audit-scorecard.md`
</required_reading>

<progress_context>
**If `docs/arc/progress.md` exists, read the first 50 lines.**

Check for recent changes that should be included in audit scope.
If the file does not exist, continue without it.
</progress_context>

<rules_context>
**Check for project coding rules:**

**Use Glob tool:** `.ruler/*.md`

**Determine rules source:**
- **If `.ruler/` exists:** Read rules from `.ruler/`
- **If `.ruler/` doesn't exist:** Read rules from `rules/`

**Detect stack and read relevant rules from the rules source:**

| Check | Read |
|-------|------|
| Always | code-style.md, stack.md |
| `next.config.*` exists | nextjs.md |
| `react` in package.json | react.md |
| `tailwindcss` in package.json | tailwind.md |
| `.ts` or `.tsx` files | typescript.md |
| `vitest` or `jest` in package.json | testing.md |
| `drizzle` or `prisma` in package.json | api.md |
| `.env*` files exist | env.md |

Pass relevant rules to each reviewer agent.

**For each reviewer, pass domain-specific core rules:**

| Reviewer | Core Rules to Pass |
|----------|-------------------|
| security-engineer | api.md, env.md, integrations.md, auth.md (if Clerk/WorkOS), react-correctness.md (security section) |
| architecture-engineer | stack.md, turborepo.md |
| lee-nextjs-engineer | nextjs.md, api.md, react-correctness.md (Next.js-specific rules) |
| senior-engineer | code-style.md, typescript.md, react.md, error-handling.md, ai-sdk.md (if AI SDK) |
| data-engineer | testing.md, api.md |
| daniel-product-engineer | react.md, typescript.md, ai-sdk.md (if AI SDK), react-performance.md, react-correctness.md |
| performance-engineer | react-performance.md |
| seo-engineer | seo.md |

**For UI/frontend audits, also load interface rules:**

| Reviewer | Interface Rules to Pass |
|----------|------------------------|
| designer | design.md, colors.md, typography.md, marketing.md, tailwind-authoring.md, buttons.md, surfaces.md, sections.md |
| daniel-product-engineer | forms.md, interactions.md, animation.md, performance.md, tailwind-authoring.md, buttons.md, surfaces.md |
| lee-nextjs-engineer | layout.md, performance.md |
Interface rules location: `rules/interface/`

Pass relevant rules to each UI reviewer in their prompt. These inform what to look for, not mandates to redesign.

**UI polish checks — include in prompts for designer and daniel-product-engineer:**

In addition to their domain-specific rules, both UI reviewers should verify:
- No layout shift on dynamic content (hardcoded dimensions, `tabular-nums`, no font-weight changes on hover)
- Animations have `prefers-reduced-motion` support
- Touch targets are 44px minimum
- Hover effects gated behind `@media (hover: hover)`
- Keyboard navigation works (tab order, focus trap in modals, arrow keys in lists)
- Icon-only buttons have `aria-label`
- Forms submit with Enter; textareas with ⌘/Ctrl+Enter
- Inputs are `text-base` (16px+) to prevent iOS zoom
- No `transition: all` — specify exact properties
- z-index uses fixed scale or `isolation: isolate`
- No flash on refresh for interactive state (tabs, theme, toggles)
- Destructive actions require confirmation (`AlertDialog`, not `confirm()`)
</rules_context>

<process>
## Phase 0: Mode Detection

Parse `$ARGUMENTS` first and choose the correct path.

| Argument | Mode | What Runs |
|----------|------|-----------|
| `quick` | Quick | Build + typecheck + lint |
| `pre-commit` | Pre-commit | Build + typecheck + lint + debug logs |
| `pre-pr` | Pre-PR | Build + typecheck + lint + tests + debug logs + secrets scan |
| `--harden` | Harden | Interactive UI resilience pass, no reviewer agents |
| anything else / none | Full or focused audit | Mechanical checks, then reviewers |

**Critical behavior:**
- `quick`, `pre-commit`, and `pre-pr` skip scope detection, hotspots, knip, and reviewer dispatch.
- `--harden` is a separate interactive code path. Do not spawn review agents. Preserve the user-interactive hardening flow.

## Phase 1: Detect Scope & Project Type

**Parse arguments (full / focused audit path only):**
- `$ARGUMENTS` may contain:
  - A path (e.g., `apps/web`, `packages/ui`, `src/`)
  - A focus flag (e.g., `--security`, `--performance`, `--architecture`, `--design`)
  - `--parallel` flag to run all reviewers simultaneously (resource-intensive)
  - `--diff` or `--diff [base]` flag to scope audit to only changed files vs a base branch
  - A stage override (e.g., `--stage=production`, `--stage=prototype`)
  - Combinations (e.g., `apps/web --security`, `src/ --parallel`, `--design`, `--diff develop`)

**If `--diff` flag is set:**

Determine changed files:
```bash
# Default base is main, user can override with --diff develop
git diff --name-only --diff-filter=ACMR ${base:-main}...HEAD | grep -E '\.(tsx?|jsx?|py|go|rs)$'
```

Store the file list. Pass it to every reviewer agent as a scope constraint:
```
IMPORTANT: Only review these files (changed in current branch):
[file list]

Do not flag issues in files not on this list.
```

If `--diff` produces 0 files, report "No changed files found vs [base]" and exit.

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

**Check for AI SDK:**

**Use Grep tool:** `"ai"` in `package.json` → has-ai-sdk

If detected, run a quick deprecated API scan:
```bash
grep -rn --include='*.ts' --include='*.tsx' -E 'generateObject|maxTokens[^A-Z]|toDataStreamResponse|addToolResult|maxSteps[^A-Z]|part\.args|part\.result[^s]' src/ app/ 2>/dev/null | head -20
```

If deprecated APIs found, include count in the detection summary and flag for reviewers. These are mechanical fixes — load `rules/ai-sdk.md` and pass the migration table to the implementing agent.

**Run dependency vulnerability scan (critical/high only):**

```bash
# Node.js projects
npm audit --json 2>/dev/null | jq '[.vulnerabilities | to_entries[] | select(.value.severity == "critical" or .value.severity == "high")] | length'

# Python projects
pip-audit --format json 2>/dev/null | jq '[.[] | select(.vulns[].fix_versions)] | length'

# Or use: pnpm audit --json, yarn audit --json
```

Only surface **critical** and **high** severity vulnerabilities. Ignore moderate/low — they create noise without actionable urgency.

**Run dead code detection (JS/TS projects only):**

```bash
npx -y knip --no-progress --reporter compact 2>/dev/null | head -40
```

If knip is already a project dependency, use `npx knip` instead. Knip detects:
- Unused files (not imported anywhere)
- Unused exports (exported but never imported)
- Unused types (exported types never referenced)
- Unused dependencies (in package.json but not imported)
- Duplicate exports (same thing exported multiple ways)

Include dead code count in the detection summary. Pass findings to relevant reviewers:
- `architecture-engineer` — unused files, exports indicating poor module boundaries
- `senior-engineer` — general dead code cleanup

If knip finds >20 unused exports, flag as a separate task cluster rather than distributing across reviewers.

If `--diff` flag is set, cross-reference knip results with the changed file list (knip does not support diff mode natively, so run on full project but only surface findings that touch changed files).

**Run structural hotspot scan (JS/TS/TSX/JSX projects):**

This is a cheap mechanical pass to surface "probably worth interrogating" files before reviewer agents start. The goal is not to auto-convict large files, but to give reviewers a map of where complexity is likely hiding.

```bash
# Long files (exclude node_modules, build output, vendored/generated folders)
find ${scope:-.} -type f \
  \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  | grep -vE 'node_modules|\\.git|dist|build|coverage|\\.next|generated' \
  | xargs wc -l \
  | sort -nr \
  | head -20

# Suspicious client-boundary escape hatches
find ${scope:-.} -type f \
  \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  | grep -E '(^|/)[^/]*(-client|-wrapper|-content|-shell|-ui)\\.(tsx?|jsx?)$'

# Check which suspicious files are explicit client components
grep -rl --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' \
  '^["'\"'\"']use client["'\"'\"'];\\?$' ${scope:-.} 2>/dev/null
```

Interpretation guidance:
- Treat files **>250 lines** as audit hotspots. Treat files **>400 lines** as severe complexity hotspots, especially when they are React components, pages, layouts, or route handlers.
- `*-client.*` and `*-wrapper.*` are explicit red flags. They often mean "I needed a client boundary, so I wrapped the real component instead of pushing interactivity down."
- `*-content.*`, `*-shell.*`, and `*-ui.*` are weaker signals, but worth interrogating when they are also long or marked `"use client"`.
- When a file is both **long** and suspiciously named, elevate it as a probable god-component / server-client-boundary smell.
- In `--diff` mode, still run the scan on the requested scope, but only surface hotspots that intersect the changed files.

Store a **structural hotspot manifest** with:
- Long files over 250 LOC
- Severe long files over 400 LOC
- Suspicious boundary files matching `*-client`, `*-wrapper`, `*-content`, `*-shell`, `*-ui`
- Overlap set: suspiciously named files that are also long
- `"use client"` overlap: suspiciously named files that also opt into a client boundary

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
- Small projects: Skip `architecture-engineer` (no complex boundaries to review)
- No tests present + small project: Don't flag missing tests as critical
- Single developer: Skip `senior-engineer` (no code review discipline needed)

**Detect project lifecycle stage:**

If `--stage=<stage>` was provided in arguments, use that directly. Otherwise, infer the stage from heuristic signals:

| Signal | Tool | Indicates |
|--------|------|-----------|
| CI/CD config (`.github/workflows/*`, `Jenkinsfile`, `.gitlab-ci.yml`) | Glob | pre-launch+ |
| Deployment config (`vercel.json`, `Dockerfile`, `fly.toml`, `render.yaml`, `k8s/`) | Glob | pre-launch+ |
| Monitoring/observability (`sentry`, `datadog`, `newrelic` in deps) | Grep in package.json | production |
| Production env references (`.env.production`, `NODE_ENV` guards) | Glob + Grep | pre-launch+ |
| Test coverage > 0 (test files exist) | Glob (`**/*.test.*`, `**/*.spec.*`) | development+ |
| Git history depth | `git rev-list --count HEAD` | maturity signal |
| Custom domain / production URL in config | Grep | production |
| Rate limiting, caching, or queue deps in package.json | Grep (`rate-limit`, `redis`, `bull`) | production |

**Stage classification:**

| Stage | Description | Typical Signals |
|-------|-------------|-----------------|
| `prototype` | Exploring ideas, validating concepts | < 30 commits, no CI, no deploy config, no tests |
| `development` | Actively building features, not yet shipped | Has some tests, may have CI, no production deploy |
| `pre-launch` | Feature-complete, preparing to ship | Has CI, has deploy config, has tests, no monitoring |
| `production` | Live and serving real users | Has monitoring, production env, rate limiting, mature git history (200+ commits) |

Default to `development` if signals are ambiguous. When in doubt, err toward the earlier stage — it's better to under-flag than to overwhelm with premature requirements.

**Confirm stage with user:**

After detection, briefly confirm:
```
Detected project stage: [stage] (based on [key signals])
```

If the user corrects it, use their override.

**Summarize detection:**
```
Scope: [path or "full codebase"] [diff vs [base] if --diff]
Project type: [Next.js / React / Python / etc.]
Project scale: [small / medium / large]
Project stage: [prototype / development / pre-launch / production]
Has database: [yes/no]
Has AI SDK: [yes/no + deprecated API count if any]
Has tests: [yes/no]
Dead code: [X unused files, Y unused exports, Z unused deps] or "N/A (not JS/TS)"
Structural hotspots: [X long files >250 LOC, Y severe >400 LOC, Z suspicious boundary files, W suspicious+long overlap]
Coding rules: [yes/no]
Focus: [all / security / performance / architecture / design]
Execution mode: [batched (default) / parallel / team]
```

## Phase 1.5: Mechanical Checks

Run these before any reviewer agents so obvious breakage gets caught cheaply.

### Tooling Detection
- Detect package manager from lockfiles
- Detect build command from `package.json`
- Detect typechecker from `tsconfig.json`
- Detect linter from Biome / ESLint config
- Detect tests from Vitest / Jest config

### Check Order
1. Build — stop immediately if it fails
2. Typecheck — report errors and continue
3. Lint — auto-fix first, then report remaining issues
4. Tests — skip in `quick` and `pre-commit`
5. Debug log audit — skip in `quick`
6. Git status
7. Secrets scan — `pre-pr` only

### Mode Behavior
- `quick`, `pre-commit`, `pre-pr`: report the summary table with **partial scorecard** and stop. No reviewers.
- Full or focused audit: include the mechanical summary in reviewer context, then continue.

**Partial scorecard for quick modes:**

Derive scores for mechanically-evaluable axes only:

| Axis | Signal |
|------|--------|
| 4. Code Quality | Lint results (clean = 2, warnings = 1, errors = 0). Bump to 3 if lint clean + no dead code |
| 5. Test Health | `pre-pr` only: tests exist + pass = 2, exist + fail = 1, no tests = 0 |
| 7. Operations | Build pass + types clean + lint clean = 2, any failure = 0-1 |

Report as: `X/9 (partial — 3 of 7 axes)`. Other axes show `--`.

```
## Quick Check — X/9 (partial)

Quality: X | Tests: X | Ops: X
Security: -- | Perf: -- | Arch: -- | Resilience: --

Run full audit for complete scorecard.
```

## Phase 2: Select Reviewers

**Base reviewer selection by project scale:**

| Scale | Core Reviewers |
|-------|----------------|
| Small | security-engineer, performance-engineer |
| Medium | security-engineer, performance-engineer, architecture-engineer |
| Large | security-engineer, performance-engineer, architecture-engineer, senior-engineer |

**Add framework-specific reviewers (medium/large only):**

| Project Type | Additional Reviewers |
|--------------|---------------------|
| Next.js | lee-nextjs-engineer, daniel-product-engineer |
| React/TypeScript | daniel-product-engineer |
| Python/Rust/Go | (none additional) |

**Conditional additions:**
- If scope includes DB/migrations → add `data-engineer`
- If UI-heavy (React/Next.js, medium/large) → add `designer`
- If UI-heavy (React/Next.js, medium/large) → add `accessibility-engineer`
- If test files detected (medium/large) → add `test-quality-engineer`
- If project has marketing/public pages (pre-launch/production stage) → add `seo-engineer`

**Focus flag overrides:**
- `--security` → only `security-engineer`
- `--performance` → only `performance-engineer`
- `--architecture` → only `architecture-engineer`
- `--design` → only `designer`
- `--accessibility` → only `accessibility-engineer`
- `--seo` → only `seo-engineer`

**Final reviewer list:**
- Small projects: 2-3 reviewers
- Medium projects: 3-4 reviewers
- Large projects: 4-6 reviewers

## Phase 2.5: Team Mode Check

<team_mode_check>
**Check if agent teams are available** by attempting to detect team support in the current environment.

**If teams are available**, offer the user a choice:

```
Execution mode:
1. Team mode — Reviewers debate findings before consolidation (higher quality, 3-5x token cost)
2. Standard mode — Independent reviewers, batched or parallel (faster, lower cost)
```

Use the platform's structured question prompt if available. Otherwise ask a concise plain-text question with the same two options:
- **"Team mode (Recommended for pre-launch/production)"** — Reviewers cross-review and challenge each other's findings. Conflicts resolved with evidence-based rationale. Best for high-stakes audits.
- **"Standard mode"** — Independent reviewers run in batches (default) or parallel (--parallel). Faster and cheaper. Findings consolidated by the skill.

**If teams are NOT available**, proceed silently with standard mode. Do not mention teams to the user.

**If team mode selected**, read the team reference:
```
${ARC_ROOT}/references/agent-teams.md
```
</team_mode_check>

## Phase 3: Run Audit

**Read agent prompts:**
For each selected reviewer, read:
```
${ARC_ROOT}/agents/review/[reviewer-name].md
```

**Execution strategy:**

By default, reviewers run in **batches of 2** to avoid resource exhaustion on large codebases. If `--parallel` flag is set, all reviewers run simultaneously. If user opted into **team mode**, reviewers collaborate as teammates.

### Batched Execution (Default)

Split reviewers into batches of 2. Run each batch, wait for completion, then run next batch.

**Example with 6 reviewers:**
```
Batch 1: security-engineer, performance-engineer
  → Wait for both to complete
Batch 2: architecture-engineer, daniel-product-engineer
  → Wait for both to complete
Batch 3: lee-nextjs-engineer, senior-engineer
  → Wait for both to complete
```

**Model selection per reviewer:**

| Reviewer | Model | Why |
|----------|-------|-----|
| security-engineer | sonnet | Pattern recognition + context |
| performance-engineer | sonnet | Algorithmic reasoning |
| architecture-engineer | sonnet | Structural analysis |
| daniel-product-engineer | sonnet | Code quality judgment |
| lee-nextjs-engineer | sonnet | Framework pattern recognition |
| senior-engineer | sonnet | Code review reasoning |
| data-engineer | sonnet | Data safety reasoning |
| **designer** | **opus** | **Aesthetic judgment requires premium model** |
| seo-engineer | sonnet | Pattern recognition for SEO elements |

**Include project stage in every reviewer prompt.**

Each reviewer must receive the stage context so they can calibrate their severity ratings. Read the matching stage calibration block from:
```
${ARC_ROOT}/references/audit-stage-calibration.md
```

Include in every reviewer prompt:
```
Project stage: [prototype / development / pre-launch / production]

SEVERITY CALIBRATION FOR THIS STAGE:
[Paste the matching stage block from audit-stage-calibration.md]
```

**Include the structural hotspot manifest in every reviewer prompt.**

Every reviewer should receive the precomputed hotspot list so they can decide whether it matters in their domain instead of rediscovering it independently.

Include:
```
Structural hotspots:
- Long files >250 LOC: [list]
- Severe long files >400 LOC: [list]
- Suspicious boundary files: [list]
- Suspicious + long overlap: [list]
- Suspicious + "use client" overlap: [list]
```

Reviewer-specific emphasis:
- `lee-nextjs-engineer`: interrogate `*-client.*` and `*-wrapper.*` first. Ask whether they are "escape hatches" around App Router server-first architecture and whether the real fix is to push interactivity down to leaf client components.
- `daniel-product-engineer`: treat suspiciously named long files as probable god components and inspect for mixed responsibilities, mode props, and unreadable UI shape.
- `architecture-engineer`: use long-file and suspicious-name hotspots to find poor module boundaries and misplaced orchestration.
- Other reviewers: use the manifest opportunistically; only report if it matters to your domain.

**For each batch, dispatch 2 reviewer subagents in parallel when the platform supports delegation.**
If the platform does not support subagents, run the same reviewer prompts locally one reviewer at a time and continue with consolidation.

**Scorecard scoring:** Every reviewer prompt must include the scorecard axis they are responsible for
scoring. Include the criteria table for their axis from `audit-scorecard.md` and ask them to score it
at the end of their response.

Example reviewer prompts:
```
Task [security-engineer] model: sonnet: "
Audit the following codebase for security issues.

Scope: [path]
Project type: [type]
Project stage: [stage]
Coding rules: [rules content if any]

[Stage calibration block from above]

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

## Scorecard
Score the Security Posture axis (0-3) using these criteria:
[Paste Security Posture criteria table from audit-scorecard.md]

Axis: Security Posture
Score: [0-3]
Rationale: [1 sentence explaining the score based on the criteria]
"

Task [performance-engineer] model: sonnet: "
Audit the following codebase for performance issues.
[similar structure, including stage calibration block]
Focus on: N+1 queries, missing indexes, memory leaks, bundle size, render performance.
[Include Scorecard section with Performance criteria table]
"

Task [designer] model: opus: "
Review UI implementation for visual design quality.
[similar structure, including stage calibration block]
Focus on: aesthetic direction, memorable elements, typography, color cohesion, AI slop patterns.
[Include Scorecard section with UI/Design BONUS criteria table]
"
```

**Scorecard axis assignments per reviewer:**

| Reviewer | Scores Axis |
|----------|-------------|
| security-engineer | 1. Security Posture |
| performance-engineer | 2. Performance |
| architecture-engineer | 3. Architecture |
| lee-nextjs-engineer | 3. Architecture (second opinion) |
| senior-engineer | 4. Code Quality |
| daniel-product-engineer | 4. Code Quality (second opinion) + 6. Resilience |
| test-quality-engineer | 5. Test Health |
| designer | Bonus: UI/Design |
| accessibility-engineer | Bonus: Accessibility |
| seo-engineer | Bonus: SEO |

When a reviewer scores two axes (daniel-product-engineer), include both criteria tables and ask for both scores.

**Wait for batch to complete before starting next batch.**

Repeat for remaining batches:
- Batch 2: architecture-engineer + senior-engineer
- Batch 3: UI reviewers (daniel-product-engineer, lee-nextjs-engineer)
- Batch 4: remaining reviewers (senior-engineer, designer, data-engineer)

### Parallel Execution (--parallel flag)

Only if `--parallel` flag is explicitly set, spawn all reviewers simultaneously:

```
Task [security-engineer] model: sonnet: "..."
Task [performance-engineer] model: sonnet: "..."
Task [architecture-engineer] model: sonnet: "..."
[All additional reviewers in same message...]
```

⚠️ **Warning:** Parallel execution spawns 4-6 Claude instances simultaneously. This can cause system unresponsiveness on resource-constrained machines or large codebases.

**Wait for all agents to complete.**

### Team Execution (Agent Teams mode)

Only if user opted into team mode in Phase 2.5.

**Round 1 — Initial Analysis:**

Create team `arc-audit-[scope-slug]` with all selected reviewers as teammates. Each reviewer performs their standard analysis using the same prompts as subagent mode (including stage calibration, coding rules, and domain-specific focus areas).

```
Create team: arc-audit-[scope-slug]
Teammates: [all selected reviewers]

Each teammate runs their initial analysis independently.
Same prompts, same model selection as batched/parallel mode.
```

**Round 2 — Cross-Review:**

Each reviewer reads the others' findings and responds:
- **Confirms** findings with supporting evidence from their domain
- **Challenges** findings they believe are incorrect or overstated, citing code-level evidence
- **Reconciles** conflicting findings by synthesizing both perspectives into a resolution

```
Each teammate reviews others' Round 1 findings.
Responses: confirm (with evidence), challenge (with code citations), or reconcile (with synthesis).
```

**Resolution rules:**
- Code-level evidence wins over principle-based reasoning
- Domain authority wins within domain (security-engineer's security judgment > architecture-engineer's security opinion)
- Project stage context breaks ties
- Every challenge must include explicit rationale

**Round 2 output:** Each finding is now annotated with peer review status — confirmed, modified after challenge, or dropped with rationale.

**Wait for team to complete.**

### Structural Diff Checklist (--diff mode only)

**Skip this section if `--diff` is not active.**

After all reviewer agents complete, run an additional structural pass using the diff checklist. This catches mechanical issues (race conditions, trust boundary violations, dead code) that domain-specific reviewers may not focus on.

1. **Read the checklist:**
   ```
   Read: ${ARC_ROOT}/references/diff-review-checklist.md
   ```

2. **Get the full diff:**
   ```bash
   git diff origin/${base:-main}
   ```

3. **Apply the two-pass review** from the checklist against the diff:
   - Pass 1 (CRITICAL): Race conditions, trust boundaries, data safety
   - Pass 2 (INFORMATIONAL): Conditional side effects, stale references, test gaps, dead code, performance

4. **Merge findings** into the reviewer agent results before consolidation:
   - Checklist CRITICAL findings → treated as Critical severity
   - Checklist INFORMATIONAL findings → treated as Medium severity
   - Attribute these as "structural-checklist" in the flagged-by column
   - Deduplicate against reviewer findings (if a reviewer already flagged the same file:line, keep the reviewer's finding)

## Phase 4: Consolidate Findings

**Collect all agent outputs.**

<team_consolidation>
**If team mode was used**, consolidation is simplified — reviewers already did the hard work:

- **Deduplication: already done.** Reviewers identified overlapping findings during cross-review.
- **Conflict resolution: already done.** Contradictory findings were debated with evidence-based rationale. Each resolution includes the reasoning from both sides.
- **Severity validation: still needed.** Apply the stage-based severity calibration table below as a final sanity check.
- **Task clustering: still needed.** Group debated findings into work clusters.

Skip the deduplication and conflict resolution steps below and proceed directly to "Validate severity against project stage."
</team_consolidation>

**If standard mode was used**, proceed with full consolidation:

**Deduplicate:**
- Same file:line mentioned by multiple reviewers → merge into single finding
- Note which reviewers flagged each issue

**Validate severity against project stage:**

Use the severity validation table and conflict resolution rules from:
```
${ARC_ROOT}/references/audit-stage-calibration.md
```

Downgrade findings that are rated higher than the stage warrants. Add note: `[Severity adjusted for [stage] stage — would be [original] in production]`

**Categorize by severity (after stage adjustment):**
1. **Critical** — Security vulnerabilities, data loss risks, breaking issues
2. **High** — Performance blockers, architectural violations
3. **Medium** — Technical debt, code quality issues
4. **Low** — Suggestions, minor improvements

**Advisory tone and conflict resolution:** Follow the advisory tone guidelines and conflict resolution rules in `audit-stage-calibration.md`. Key principle: reviewers advise, user decides. Use "must fix" sparingly (security/data loss only), "should consider" for real problems, "worth noting" for suggestions.

When dismissing conflicting or irrelevant findings, include them in a collapsed "Dismissed" section with a one-line reason.

**Cluster findings into task groups:**

Do NOT group by reviewer domain (security, performance, etc.). Instead, group by **what you'd work on together** — files and concerns that would be addressed as a unit.

Clustering strategy:
1. **By area of code** — Findings touching the same files/modules cluster together regardless of which reviewer flagged them. E.g., three findings in `src/auth/` from security-engineer, performance-engineer, and architecture-engineer become one cluster: "Auth flow hardening."
2. **By type of work** — If multiple findings across different files require the same kind of change (e.g., "add error boundaries to 5 components"), cluster those together.
3. **By dependency** — If fixing finding A is a prerequisite for fixing finding B, they belong in the same cluster with A first.

Each cluster becomes a task group with:
- A descriptive name (e.g., "Auth flow hardening", "API input validation", "Dashboard performance")
- The findings it contains (with severity and file references)
- A suggested order of implementation within the cluster

Aim for 3-8 clusters. If you have more than 8, merge the smallest ones. If you have fewer than 3, that's fine — don't force artificial grouping.

**Derive scorecard:**

Collect axis scores from reviewer outputs and apply derivation rules from `audit-scorecard.md`:

1. **Reviewer-scored axes (1-4, 6):** Take the score each reviewer returned. For multi-reviewer axes (Architecture, Code Quality), use the **lower** score.
2. **Test Health (axis 5):** Use reviewer score if test-quality-engineer ran. Apply mechanical overrides:
   - No test files found → cap at 0
   - Test failures in mechanical checks → cap at 1
3. **Operations (axis 7):** Derive from mechanical check results:
   - Build broken → 0
   - Type errors or lint failures → 1
   - Clean build + CI exists → 2
   - Full pipeline with monitoring/logging → 3
4. **Bonus axes:** Collect from designer, accessibility-engineer, seo-engineer if they ran.
5. **Sum** the 7 core scores for the total. Report bonus axes as `+N/M` separately.

If a core axis had no reviewer (e.g., small project skipped architecture-engineer), score it based on the mechanical signals available or mark as `--` (not evaluated). Adjust the denominator: `X/18` if one axis skipped, etc.

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
**Project Stage:** [prototype / development / pre-launch / production]

> Severity ratings have been calibrated for the **[stage]** stage. Issues marked with ↓ were downgraded from their production-level severity.

## Structural Hotspots

- **Long files >250 LOC:** [count]
- **Severe long files >400 LOC:** [count]
- **Suspicious boundary files:** [count]
- **Suspicious + long overlap:** [count]

[Optional short table of the top hotspots with file path, LOC, and why they were flagged]

## Scorecard: X/21 — [Rating]

| # | Axis | Score | |
|---|------|:-----:|-|
| 1 | Security Posture | X/3 | [one-line rationale] |
| 2 | Performance | X/3 | [one-line rationale] |
| 3 | Architecture | X/3 | [one-line rationale] |
| 4 | Code Quality | X/3 | [one-line rationale] |
| 5 | Test Health | X/3 | [one-line rationale] |
| 6 | Resilience | X/3 | [one-line rationale] |
| 7 | Operations | X/3 | [one-line rationale] |
| | **Total** | **X/21** | **[Fragile / Developing / Solid / Production-grade]** |

[If bonus axes were scored:]

| Bonus | Score | |
|-------|:-----:|-|
| UI/Design | X/3 | [rationale] |
| Accessibility | X/3 | [rationale] |
| SEO | X/3 | [rationale] |
| **Bonus** | **+X/9** | |

## Executive Summary

[1-2 paragraph overview of findings, noting the stage context and scorecard highlights]

- **Critical:** X issues
- **High:** X issues
- **Medium:** X issues
- **Low:** X issues

## Must Fix

> Genuinely dangerous — security holes, data loss, credential exposure

### [Issue Title]
**File:** `path/to/file.ts:123`
**Flagged by:** security-engineer, architecture-engineer
**Description:** [What's wrong and why it matters]
**Recommendation:** [How to fix]

[Repeat for each critical/high issue that warrants "must fix"]

## Should Consider

> Will cause real problems if the project progresses — performance cliffs, missing error handling on critical paths, architectural dead ends

[Same format]

## Worth Noting

> Suggestions and improvements — no pressure

[Same format]

## Low Priority / Suggestions

> Nice to have

[Same format]

---

## Task Clusters

> Findings grouped by what you'd tackle together, ordered by priority.

### 1. [Cluster Name]

**Why:** [1 sentence — what's wrong in this area and why it matters]

| # | Severity | File | Issue | Flagged by |
|---|----------|------|-------|------------|
| 1 | Critical | `path/to/file.ts:123` | Issue description | security-engineer |
| 2 | High | `path/to/file.ts:456` | Issue description | performance-engineer |
| 3 | Medium | `path/to/other.ts:78` | Issue description | architecture-engineer |

**Suggested approach:** [1-2 sentences on how to tackle this cluster]

### 2. [Cluster Name]

[Same format]

[Repeat for each cluster]

---

<details>
<summary>Dismissed findings ([N] items)</summary>

| Finding | Reviewer | Reason Dismissed |
|---------|----------|-----------------|
| [description] | [reviewer] | Conflicts with [other reviewer]'s recommendation — [resolution reasoning] |
| [description] | [reviewer] | Contradicts project coding rules in `.ruler/` |
| [description] | [reviewer] | Not relevant at [stage] stage |

</details>

---

## Next Steps

1. [Prioritized action item]
2. [Prioritized action item]
3. [Prioritized action item]
```

**Do not auto-commit the report unless the user explicitly asks for a commit.**
You may stage it or leave it unstaged based on the user's preferences and the platform workflow.

## Phase 6: Present & Offer Actions

**Show summary to user:**
```
## Audit Complete — X/21 [Rating]

Reviewed: [scope]
Reviewers: [count] agents
Project stage: [stage]
Report: docs/audits/YYYY-MM-DD-[scope]-audit.md

### Scorecard
Security: X | Perf: X | Arch: X | Quality: X | Tests: X | Resilience: X | Ops: X
[+X/9 bonus if applicable]

### Findings
- Critical: X | High: X | Medium: X | Low: X
- Dismissed: X (conflicts/irrelevant)
- Task clusters: X

### Task Clusters (by priority)
1. [Cluster name] — X issues (X critical, X high)
2. [Cluster name] — X issues
3. [Cluster name] — X issues
[...]
```

**Offer next steps using the platform's structured question prompt when available.**
Otherwise ask a concise plain-text question with the same options:

Present these options (include all that apply):

1. **Tackle critical cluster now** → Jump straight into fixing the highest-priority cluster. Invoke `/arc:detail` scoped to the files and issues in that cluster.

2. **Write full task plan** → Write all clusters as a structured plan to `docs/arc/plans/YYYY-MM-DD-audit-tasks.md` for systematic implementation. Each cluster becomes a section with its findings, suggested approach, and a checkbox list.

3. **Add to tasks** → Use **TaskCreate** to create tasks for critical/high clusters. Each cluster becomes a task with findings in the description. Lower severity clusters are omitted — they're in the audit report if needed later.

4. **Create Linear issues** → If Linear MCP is available (`mcp__linear__*` tools exist), create Linear issues for critical/high findings. Each cluster becomes an issue with findings in the description.

5. **Deep dive on a cluster** → User picks a cluster to explore in detail. Show full findings, relevant code snippets, and discuss approach before committing to action.

5. **Done for now** → End session. Report is saved, user can return to it later.

**If user selects "Tackle critical cluster now":**
- Identify the cluster with the most critical/high findings
- Invoke `/arc:detail` with the cluster's files and issues as scope
- The detail plan will be scoped to just that cluster, not the entire audit

**If user selects "Write full task plan":**

Create `docs/arc/plans/YYYY-MM-DD-audit-tasks.md`:

```markdown
# Audit Task Plan

**Source:** docs/audits/YYYY-MM-DD-[scope]-audit.md
**Date:** YYYY-MM-DD
**Project Stage:** [stage]
**Total clusters:** X | **Total findings:** X

---

## Cluster 1: [Name] `[priority: critical/high/medium]`

**Why this matters:** [1 sentence]

- [ ] [Finding 1 — file:line — description]
- [ ] [Finding 2 — file:line — description]
- [ ] [Finding 3 — file:line — description]

**Approach:** [1-2 sentences]

---

## Cluster 2: [Name] `[priority]`

[Same format]

---

[Repeat for all clusters]
```

Do not auto-commit the plan unless the user explicitly asks for a commit.

**If user selects "Add to tasks":**
- Use the platform's native task/todo creation flow for each critical/high cluster when available
- Each task gets the cluster name as subject, findings as description, and present continuous activeForm
- Lower severity clusters stay in the audit report only
- If no native task/todo creation flow exists, offer the plan file or Linear issue path instead

**If user selects "Deep dive on a cluster":**
- Ask which cluster (by number or name)
- Show the full findings with code context (read relevant files)
- Discuss the approach before taking action
- After discussion, offer to start implementing or return to the action menu

## Phase 7: Cleanup

**Kill orphaned subagent processes:**

After spawning multiple reviewer agents, some may not exit cleanly. Run cleanup to prevent memory accumulation:

```bash
${ARC_ROOT}/scripts/cleanup-orphaned-agents.sh
```

This is especially important after `--parallel` runs or when auditing large codebases.

</process>

<arc_log>
**After completing this skill, append to the activity log.**
See: `${ARC_ROOT}/references/arc-log.md`
Entry: `/arc:audit — [scope] ([N] critical, [N] high)`
</arc_log>

<success_criteria>
Audit is complete when:
- [ ] Scope detected (path, full codebase, or focus flag)
- [ ] Project type detected
- [ ] Execution mode determined (batched default, --parallel, or team)
- [ ] 4-6 reviewers selected based on context
- [ ] Reviewers run in batches of 2 (or all at once if --parallel)
- [ ] All reviewers completed
- [ ] Findings consolidated and deduplicated
- [ ] Scorecard derived (7 core axes + bonus if applicable)
- [ ] Report generated in `docs/audits/` with scorecard
- [ ] Report saved and optionally staged
- [ ] Summary presented to user
- [ ] Next steps offered
- [ ] Progress journal checked if present
- [ ] Orphaned agents cleaned up (run cleanup script)
</success_criteria>
