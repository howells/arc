---
name: audit
context: fork
description: |
  Comprehensive codebase audit with verification and specialized reviewers.
  Generates actionable reports.
  Use when asked to "audit the codebase", "review code quality", "check for issues",
  "security review", or "performance audit". By default, run the complete audit:
  mechanical checks first, then specialist reviewers, then a scored report.
license: MIT
argument-hint: "[<path-or-focus>]"
metadata:
  author: howells
website:
  order: 13
  desc: Codebase audit
  summary: Mechanical verification plus specialist review with a scored codebase health report.
  what: |
    Audit runs build, typecheck, lint, tests, debug-log scanning, git status, secrets scanning, and cheap structural signal collection first. It then dispatches relevant specialist reviewers, consolidates findings, and produces a scored scorecard across 7 codebase-health axes (0-21) with an optional accessibility axis for frontend projects.
  why: |
    Mechanical checks catch obvious breakage. Reviewers catch the judgment calls that linters miss. Keeping both in one default workflow removes the "verify or audit?" decision.
  decisions:
    - Audit has one public default path.
    - Mechanical checks always run before reviewers.
    - Optional focus text may narrow reviewer selection, but the workflow stays the same.
    - Security is gated by launch and sensitive-surface signals so early development audits do not become premature production-hardening reviews.
  agents:
    - security-engineer
    - performance-engineer
    - architecture-engineer
    - daniel-product-engineer
    - lee-nextjs-engineer
    - mastra-agent-engineer
    - senior-engineer
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

Paths in this skill use these conventions:

- `agents/...`, `references/...`, `disciplines/...`, `templates/...`, `scripts/...`, `rules/...`, `skills/<name>/...` are Arc-owned files at the plugin root. Resolve the plugin root from this skill's filesystem location — it's the directory containing `agents/` and `skills/`.
- `./...` is local to this skill's directory.
- `.ruler/...`, `docs/...`, `src/...`, or any project-relative path refers to the user's project repository.
  </arc_runtime>

<platform_context>
**Read this reference NOW:**

1. `references/platform-tools.md`

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

1. `disciplines/dispatching-parallel-agents.md`
2. `references/audit-stage-calibration.md`
3. `references/audit-scorecard.md`
4. `references/maintainability-review.md`

**Load when relevant:**

- `references/react-audit-signals.md` — React, Next.js, TanStack Query, or React Native projects. Pass the relevant sections into reviewer prompts as audit signals.
  </required_reading>

<rules_context>
**Check for project coding rules:**

**Use Glob tool:** `.ruler/*.md`

**Determine rules source:**

- **If `.ruler/` exists:** Read rules from `.ruler/`
- **If `.ruler/` doesn't exist:** Read rules from `rules/`

**Detect stack and read relevant rules from the rules source:**

| Check                                 | Read                    |
| ------------------------------------- | ----------------------- |
| Always                                | code-style.md, stack.md |
| `next.config.*` exists                | nextjs.md               |
| `react` in package.json               | react.md                |
| `tailwindcss` in package.json         | tailwind.md             |
| `.ts` or `.tsx` files                 | typescript.md           |
| `vitest` or `jest` in package.json    | testing.md              |
| `drizzle` or `prisma` in package.json | api.md                  |
| `.env*` files exist                   | env.md                  |

Pass relevant rules to each reviewer agent.

**For each reviewer, pass domain-specific core rules:**

| Reviewer                | Core Rules to Pass                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| security-engineer       | api.md, env.md, integrations.md, auth.md (if Clerk/WorkOS), react-correctness.md (security section) |
| architecture-engineer   | stack.md, turborepo.md                                                                              |
| lee-nextjs-engineer     | nextjs.md, api.md, react-correctness.md (Next.js-specific rules)                                    |
| senior-engineer         | code-style.md, typescript.md, react.md, error-handling.md                                           |
| data-engineer           | testing.md, api.md                                                                                  |
| daniel-product-engineer | react.md, typescript.md, react-performance.md, react-correctness.md                                 |
| mastra-agent-engineer   | api.md, integrations.md, typescript.md, error-handling.md                                           |
| performance-engineer    | react-performance.md                                                                                |

**For frontend implementation audits, also load code-level interface rules:**

| Reviewer                | Interface Rules to Pass                                                      |
| ----------------------- | ---------------------------------------------------------------------------- |
| daniel-product-engineer | forms.md, interactions.md, performance.md, tailwind-authoring.md, buttons.md |
| lee-nextjs-engineer     | performance.md                                                               |

Interface rules location: `rules/interface/`

Pass relevant rules to each frontend reviewer in their prompt. These inform implementation and accessibility checks only. Do not score visual taste, invent a visual direction, or create redesign findings; defer visual design direction to the project's design source of truth.

**Frontend implementation checks — include in prompts for daniel-product-engineer and accessibility-engineer:**

In addition to their domain-specific rules, frontend reviewers should verify:

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
## Phase 1: Detect Scope & Project Type

**Parse arguments:**

- `$ARGUMENTS` may contain:
  - A path (e.g., `apps/web`, `packages/ui`, `src/`)
  - A plain-language focus (e.g., "security", "performance", "architecture", "accessibility")

Do not advertise audit flags or variants. If the user provides a path or focus, treat it as scope guidance for the same default audit workflow.

**If no scope provided:**

**Use Glob tool to detect structure:**

- `apps/*`, `packages/*` → monorepo (audit both)
- `src/*` → standard (audit src/)
- Neither → audit current directory

**Detect project type with Glob + Grep:**

| Check   | Tool | Pattern                              |
| ------- | ---- | ------------------------------------ |
| Next.js | Grep | `"next"` in `package.json`           |
| React   | Grep | `"react"` in `package.json`          |
| Python  | Glob | `requirements.txt`, `pyproject.toml` |
| Rust    | Glob | `Cargo.toml`                         |
| Go      | Glob | `go.mod`                             |

**Check for database/migrations:**

**Use Glob tool:** `prisma/*`, `drizzle/*`, `migrations/*` → has-db

**Collect React audit signal manifest (React/Next.js/React Native projects only):**

This pass gives reviewers concrete hotspots for React Doctor-style rule families without running React Doctor. These are **signals, not findings**. Reviewers must still inspect code and report only evidence-backed issues.

```bash
# High-signal React/Next/TanStack/security/frontend patterns. Scope to source-like files.
rg -n --glob '*.{ts,tsx,js,jsx}' \
  "useEffect\\(|dangerouslySetInnerHTML|\\beval\\(|new Function\\(|setTimeout\\(|setInterval\\(|useSearchParams\\(|new QueryClient\\(|useQuery\\(|useMutation\\(|<Image\\b|<img\\b|transition-all|outline-none|will-change|z-\\[?9999|localStorage|sessionStorage" \
  ${scope:-.} 2>/dev/null | head -120

# Suspicious client/server boundary spread.
rg -n --glob '*.{ts,tsx,js,jsx}' "^[\"']use client[\"'];?$" ${scope:-.} 2>/dev/null | head -80

# Legacy/deprecated React surface.
rg -n --glob '*.{ts,tsx,js,jsx}' \
  'React\.Children\.|cloneElement\(|forwardRef\(|defaultProps\b|class\s+\w+\s+extends\s+(React\.)?(Component|PureComponent)|ReactDOM\.render|findDOMNode' \
  ${scope:-.} 2>/dev/null | head -80
```

Store a **React audit signal manifest** with:

- State/effect hotspots: `useEffect`, effect-driven data fetching, effect cleanup candidates
- Boundary hotspots: `"use client"` files, async client components, suspicious client wrappers
- Data-client hotspots: TanStack Query/tRPC hooks, unstable `QueryClient`, mutations/invalidation
- Security hotspots: `dangerouslySetInnerHTML`, eval-like calls, client storage, secret-shaped identifiers in client-reachable files
- Frontend/performance hotspots: `next/image`, raw `<img>`, transition/will-change/z-index/focus classes, heavy client imports
- Legacy React hotspots: deprecated React/ReactDOM APIs and fragile child traversal

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

Store a **structural hotspot manifest** with:

- Long files over 250 LOC
- Severe long files over 400 LOC
- Suspicious boundary files matching `*-client`, `*-wrapper`, `*-content`, `*-shell`, `*-ui`
- Overlap set: suspiciously named files that are also long
- `"use client"` overlap: suspiciously named files that also opt into a client boundary

**Collect complexity hotspot signals (source projects only):**

This is a cheap first pass for performance reviewers. These are **signals, not findings**. Reviewers must inspect surrounding code and report only evidence-backed issues.

```bash
# Repeated scans, nested iteration, sorting in loops, and data access inside loops.
rg -n --glob '*.{ts,tsx,js,jsx,py,go,rb,php,java,cs,cpp,c,swift}' \
  "forEach\\(|\\.map\\(|\\.filter\\(|\\.reduce\\(|\\.some\\(|\\.every\\(|\\.find\\(|\\.findIndex\\(|\\.includes\\(|\\.indexOf\\(|\\.sort\\(|sorted\\(|findMany\\(|findUnique\\(|query\\(|execute\\(|fetch\\(|axios\\." \
  ${scope:-.} 2>/dev/null | head -160
```

Store a **complexity signal manifest** with:

- Repeated membership/search calls inside loop-like code
- Nested lookup or pairwise comparison candidates
- Sorting or grouping work that may repeat
- Query/fetch/request calls near loops
- Expensive render-path derivations in React/Next.js components
- Shared utilities where complexity improvement would compound across callers

**Build read-only codebase map (when Arc full runtime is available):**

Run the Arc-owned mapper to orient reviewers around project shape, routes, services, data layer, import hotspots, and circular dependencies:

```bash
python3 scripts/codebase-map.py ${scope:-.} --format markdown
```

If it succeeds, store the output as the **codebase map manifest**. If it fails or the script is unavailable in a prompt-only install, record `Codebase map: unavailable` and continue with the existing detection passes.

Treat the map as orientation, not evidence by itself. Reviewers must still inspect files before reporting findings.

**Detect project scale:**

Use file counts to determine appropriate audit depth:

```bash
# Count source files (exclude node_modules, .git, dist, build)
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.py" -o -name "*.go" -o -name "*.rs" \) | grep -v node_modules | grep -v .git | wc -l
```

| File Count   | Scale  | Audit Approach                                  |
| ------------ | ------ | ----------------------------------------------- |
| < 20 files   | Small  | 2-3 reviewers max, skip architecture/simplicity |
| 20-100 files | Medium | 3-4 reviewers, standard audit                   |
| > 100 files  | Large  | Full reviewer suite, batched execution          |

**Scale-appropriate signals:**

- Small projects: Skip `architecture-engineer` (no complex boundaries to review)
- No tests present + small project: Don't flag missing tests as critical
- Single developer: Skip `senior-engineer` (no code review discipline needed)

**Detect project lifecycle stage:**

Infer the project stage from heuristic signals:

| Signal                                                                             | Tool                                 | Indicates       |
| ---------------------------------------------------------------------------------- | ------------------------------------ | --------------- |
| CI/CD config (`.github/workflows/*`, `Jenkinsfile`, `.gitlab-ci.yml`)              | Glob                                 | pre-launch+     |
| Deployment config (`vercel.json`, `Dockerfile`, `fly.toml`, `render.yaml`, `k8s/`) | Glob                                 | pre-launch+     |
| Monitoring/observability (`sentry`, `datadog`, `newrelic` in deps)                 | Grep in package.json                 | production      |
| Production env references (`.env.production`, `NODE_ENV` guards)                   | Glob + Grep                          | pre-launch+     |
| Test coverage > 0 (test files exist)                                               | Glob (`**/*.test.*`, `**/*.spec.*`)  | development+    |
| Git history depth                                                                  | `git rev-list --count HEAD`          | maturity signal |
| Custom domain / production URL in config                                           | Grep                                 | production      |
| Rate limiting, caching, or queue deps in package.json                              | Grep (`rate-limit`, `redis`, `bull`) | production      |

**Stage classification:**

| Stage         | Description                                 | Typical Signals                                                                  |
| ------------- | ------------------------------------------- | -------------------------------------------------------------------------------- |
| `prototype`   | Exploring ideas, validating concepts        | < 30 commits, no CI, no deploy config, no tests                                  |
| `development` | Actively building features, not yet shipped | Has some tests, may have CI, no production deploy                                |
| `pre-launch`  | Feature-complete, preparing to ship         | Has CI, has deploy config, has tests, no monitoring                              |
| `production`  | Live and serving real users                 | Has monitoring, production env, rate limiting, mature git history (200+ commits) |

Default to `development` if signals are ambiguous. When in doubt, err toward the earlier stage — it's better to under-flag than to overwhelm with premature requirements.

**Detect security readiness gate:**

Run a lightweight security gate before reviewer selection. This gate decides whether to include the full `security-engineer` reviewer. Mechanical secrets and critical/high dependency scans still run for every audit.

Security reviewer is **included** when any of these are true:

- User focus includes security, auth, privacy, compliance, payments, production, launch, or public release.
- Project stage is `pre-launch` or `production`.
- Public/launch signals exist: custom domain, production URL, deployment config plus production env references, preview protection/public access settings, or launch checklist artifacts.
- Sensitive surface exists: auth, payments, webhooks, user accounts, multi-tenancy, admin areas, file uploads, email sending, public write APIs, database-backed user data, or third-party secrets.
- Mechanical checks find critical/high dependency vulnerabilities, likely hardcoded credentials, unsafe HTML/eval patterns, auth packages, or server endpoints handling untrusted input.

Security reviewer is **skipped** when all of these are true:

- Project stage is `prototype` or `development`.
- No user security focus was requested.
- No public/launch signal is present.
- No sensitive surface is detected.
- Mechanical secret and critical/high vulnerability scans are clean.

When skipped, record `Security gate: lightweight only` in the detection summary and score Security Posture as `--` unless mechanical evidence supports a concrete score. Do not let skipped production-hardening concerns lower the audit score.

**Confirm stage with user:**

After detection, briefly confirm:

```
Detected project stage: [stage] (based on [key signals])
```

If the user corrects it, use their override.

**Summarize detection:**

```
Scope: [path or "full codebase"]
Project type: [Next.js / React / Python / etc.]
Project scale: [small / medium / large]
Project stage: [prototype / development / pre-launch / production]
Security gate: [full reviewer / lightweight only] ([reason])
Has database: [yes/no]
Has tests: [yes/no]
Dead code: [X unused files, Y unused exports, Z unused deps] or "N/A (not JS/TS)"
Structural hotspots: [X long files >250 LOC, Y severe >400 LOC, Z suspicious boundary files, W suspicious+long overlap]
Complexity signals: [X repeated scans, Y sorting/grouping, Z data-access/render-path candidates] or "N/A"
React audit signals: [X state/effect, Y boundary, Z data-client, W security/frontend/perf hotspots] or "N/A (not React)"
Codebase map: [available / unavailable]
Coding rules: [yes/no]
Focus: [all / security / performance / architecture / accessibility / user-provided focus]
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
4. Tests — run when test tooling is detected
5. Debug log audit
6. Git status
7. Secrets scan — run when a suitable scanner or safe grep fallback is available

Include the mechanical summary in reviewer context, then continue to reviewer selection.

## Phase 2: Select Reviewers

**Apply security readiness gate first:**

- If the gate says `full reviewer`, include `security-engineer`.
- If the gate says `lightweight only`, do not include `security-engineer`; carry forward the mechanical secrets/dependency scan summary and any concrete dangerous findings.
- If a concrete dangerous finding appears after reviewer selection, add `security-engineer` back before Phase 3.

**Base reviewer selection by project scale:**

| Scale  | Core Reviewers                                               |
| ------ | ------------------------------------------------------------ |
| Small  | performance-engineer                                         |
| Medium | performance-engineer, architecture-engineer                  |
| Large  | performance-engineer, architecture-engineer, senior-engineer |

**Add framework-specific reviewers (medium/large only):**

| Project Type         | Additional Reviewers                         |
| -------------------- | -------------------------------------------- |
| Next.js              | lee-nextjs-engineer, daniel-product-engineer |
| React/TypeScript     | daniel-product-engineer                      |
| Mastra/agent systems | mastra-agent-engineer                        |
| Python/Rust/Go       | (none additional)                            |

**Conditional additions:**

- If security gate says `full reviewer` → add `security-engineer`
- If scope includes DB/migrations → add `data-engineer`
- If frontend-heavy (React/Next.js, medium/large) → add `accessibility-engineer`
- If test files detected (medium/large) → add `test-quality-engineer`
- If `@mastra/*`, Mastra config/code, MCP servers, agent/tool/workflow definitions, memory/RAG, model routing, browser/sandbox tools, or agent-readable surfaces are detected → add `mastra-agent-engineer`

**Focus guidance:**

- Security focus → prioritize `security-engineer`
- Performance focus → prioritize `performance-engineer`
- Architecture focus → prioritize `architecture-engineer`
- Agent systems or Mastra focus → prioritize `mastra-agent-engineer`
- Accessibility focus → prioritize `accessibility-engineer`

**Final reviewer list:**

- Small projects: 2-3 reviewers
- Medium projects: 3-4 reviewers
- Large projects: 4+ reviewers as needed for the scope
- Early prototype/development projects with no sensitive surface may have no security reviewer. This is intentional. The audit should preserve cadence while still surfacing concrete dangerous issues from mechanical checks.

## Phase 3: Run Audit

**Read agent prompts:**
For each selected reviewer, read:

```
agents/review/[reviewer-name].md
```

**Execution strategy:**

Run reviewers in **batches of 2** to avoid resource exhaustion on large codebases. Do not ask the user to choose an execution strategy.

**Example with 6 reviewers:**

```
Batch 1: performance-engineer, architecture-engineer
  → Wait for both to complete
Batch 2: daniel-product-engineer, lee-nextjs-engineer
  → Wait for both to complete
Batch 3: security-engineer, senior-engineer
  → Wait for both to complete
```

If the security gate skipped `security-engineer`, omit that reviewer from the batches instead of replacing it with another security pass.

**Model selection per reviewer:**

| Reviewer                | Model  | Why                                                                    |
| ----------------------- | ------ | ---------------------------------------------------------------------- |
| security-engineer       | sonnet | Pattern recognition + context; only when the security gate includes it |
| performance-engineer    | sonnet | Algorithmic reasoning                                                  |
| architecture-engineer   | sonnet | Structural analysis                                                    |
| daniel-product-engineer | sonnet | Code quality judgment                                                  |
| lee-nextjs-engineer     | sonnet | Framework pattern recognition                                          |
| mastra-agent-engineer   | sonnet | Mastra API verification and agent-system judgment                      |
| senior-engineer         | sonnet | Code review reasoning                                                  |
| data-engineer           | sonnet | Data safety reasoning                                                  |

**Include project stage in every reviewer prompt.**

Each reviewer must receive the stage context so they can calibrate their severity ratings. Read the matching stage calibration block from:

```
references/audit-stage-calibration.md
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
- `daniel-product-engineer`: treat suspiciously named long files as probable god components and inspect for mixed responsibilities, mode props, and unreadable frontend behavior.
- `architecture-engineer`: use long-file and suspicious-name hotspots to find poor module boundaries and misplaced orchestration.
- Other reviewers: use the manifest opportunistically; only report if it matters to your domain.

**Include the codebase map manifest in reviewer prompts when available.**

Every reviewer should receive:

```markdown
Codebase map:
[Paste scripts/codebase-map.py markdown output]
```

Reviewer-specific emphasis:

- `architecture-engineer`: inspect dependency cycles, high fan-in/fan-out files, route/data/service boundaries, and whether the map reveals misplaced ownership.
- `performance-engineer`: use routes, services, and data-layer signals to prioritize real request paths over isolated code smells.
- `security-engineer`: inspect detected services, routes, and data boundaries before reporting auth/input/secrets findings.
- `mastra-agent-engineer`: inspect detected agents, workflows, tools, memory/RAG, MCP, model routing, browser/sandbox capabilities, API/CLI/docs surfaces, and whether Mastra APIs were verified against installed packages.
- `senior-engineer` and `daniel-product-engineer`: use largest files and dependency hotspots to find maintainability concerns with file/line evidence.

The map is not an automatic finding source. It is a navigation aid.

**Include strict maintainability guidance in architecture, senior, and product reviewer prompts.**

Pass `references/maintainability-review.md` to `architecture-engineer`, `senior-engineer`, and `daniel-product-engineer`. They should apply it as a demanding code-health lens: authored source-code files crossing 1000 lines are presumptive blockers unless generated, vendored, data-only, or structurally justified; god files, ad-hoc branching, weak abstractions, misplaced ownership, and avoidable duplication should be reported when evidence-backed.

**Include complexity optimization guidance in performance reviewer prompts.**

Pass `references/complexity-optimization.md` and the complexity signal manifest to `performance-engineer`. The reviewer should rank opportunities by likely impact, inspect surrounding code before reporting, and include current pattern, estimated current complexity, recommended change, estimated complexity after, risk, and tests or benchmarks needed. Do not report micro-optimizations, cold-path linear code, or scanner-only findings.

**Include React audit signals for React/Next.js/React Native projects.**

Read `references/react-audit-signals.md` and pass the relevant sections plus the React audit signal manifest to reviewers. The goal is to make Arc's own audit pick up React Doctor-style issues through reviewer inspection.

Reviewer-specific emphasis:

- `daniel-product-engineer`: state/effects, rendering correctness, TanStack Query misuse, frontend behavior completeness, legacy React APIs.
- `lee-nextjs-engineer`: server/client boundaries, async client components, Suspense around `useSearchParams`, Server Action auth, route handler side effects, RSC payload shape, Next.js primitives.
- `performance-engineer`: rerender hotspots, memoization defeats, hydration flicker, bundle imports, async waterfalls, DOM/CSS performance.
- `security-engineer`: client-reachable secrets, unsafe HTML, eval-like execution, storage-backed trust, Server Action and route-handler auth.
- `accessibility-engineer`: accessibility and interaction hygiene signals. Do not critique visual direction.
- `architecture-engineer`: god components, boundary escape hatches, data-client placement, mutable server module state, duplicate query/mutation patterns.

Include in each React reviewer prompt:

```
React audit signals:
[Paste relevant manifest entries]

React signal guidance:
[Paste only the relevant sections from references/react-audit-signals.md]

Important: These are inspection prompts, not automatic findings. Report only concrete, reproducible issues with file/line evidence.
```

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

```

**Scorecard axis assignments per reviewer:**

| Reviewer                | Scores Axis                                                   |
| ----------------------- | ------------------------------------------------------------- |
| security-engineer       | 1. Security Posture                                           |
| performance-engineer    | 2. Performance                                                |
| architecture-engineer   | 3. Architecture                                               |
| lee-nextjs-engineer     | 3. Architecture (second opinion)                              |
| mastra-agent-engineer   | 3. Architecture (agent-system second opinion) + 6. Resilience |
| senior-engineer         | 4. Code Quality                                               |
| daniel-product-engineer | 4. Code Quality (second opinion) + 6. Resilience              |
| test-quality-engineer   | 5. Test Health                                                |
| accessibility-engineer  | Bonus: Accessibility                                          |

When a reviewer scores two axes (`daniel-product-engineer` or `mastra-agent-engineer`), include both criteria tables and ask for both scores.

If `security-engineer` was skipped by the security readiness gate, do not fabricate a full Security Posture score from absence of review. Use `--` for axis 1 and adjust the denominator, unless mechanical evidence gives a concrete security result:

- Critical/high vulnerability or likely credential exposure found → add `security-engineer` before scoring.
- Clean dependency scan and clean secret scan in a prototype/development project with no sensitive surface → mark `Security Posture: -- (lightweight gate clean; full security review deferred)`.

**Wait for batch to complete before starting next batch.**

Repeat for remaining batches:

- Batch 2: architecture-engineer + senior-engineer
- Batch 3: frontend reviewers (daniel-product-engineer, lee-nextjs-engineer)
- Batch 4: remaining reviewers (senior-engineer, data-engineer)

## Phase 4: Consolidate Findings

**Collect all agent outputs.**

**Deduplicate:**

- Same file:line mentioned by multiple reviewers → merge into single finding
- Note which reviewers flagged each issue

**Validate severity against project stage:**

Use the severity validation table and conflict resolution rules from:

```
references/audit-stage-calibration.md
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
   - If Security Posture had no reviewer because the security readiness gate skipped it, mark it `--` and adjust the denominator unless mechanical evidence triggered a full security review.
2. **Test Health (axis 5):** Use reviewer score if test-quality-engineer ran. Apply mechanical overrides:
   - No test files found → cap at 0
   - Test failures in mechanical checks → cap at 1
3. **Operations (axis 7):** Derive from mechanical check results:
   - Build broken → 0
   - Type errors or lint failures → 1
   - Clean build + CI exists → 2
   - Full pipeline with monitoring/logging → 3
4. **Bonus axes:** Collect from accessibility-engineer if it ran.
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

## Codebase Map

[Paste the concise codebase map manifest, or `Unavailable — [reason]`.]

## Scorecard: X/21 — [Rating]

| #   | Axis             |  Score   |                                                       |
| --- | ---------------- | :------: | ----------------------------------------------------- |
| 1   | Security Posture |   X/3    | [one-line rationale]                                  |
| 2   | Performance      |   X/3    | [one-line rationale]                                  |
| 3   | Architecture     |   X/3    | [one-line rationale]                                  |
| 4   | Code Quality     |   X/3    | [one-line rationale]                                  |
| 5   | Test Health      |   X/3    | [one-line rationale]                                  |
| 6   | Resilience       |   X/3    | [one-line rationale]                                  |
| 7   | Operations       |   X/3    | [one-line rationale]                                  |
|     | **Total**        | **X/21** | **[Fragile / Developing / Solid / Production-grade]** |

[If bonus axes were scored:]

| Bonus         |  Score   |             |
| ------------- | :------: | ----------- |
| Accessibility |   X/3    | [rationale] |
| **Bonus**     | **+X/3** |             |

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

| #   | Severity | File                  | Issue             | Flagged by            |
| --- | -------- | --------------------- | ----------------- | --------------------- |
| 1   | Critical | `path/to/file.ts:123` | Issue description | security-engineer     |
| 2   | High     | `path/to/file.ts:456` | Issue description | performance-engineer  |
| 3   | Medium   | `path/to/other.ts:78` | Issue description | architecture-engineer |

**Suggested approach:** [1-2 sentences on how to tackle this cluster]

### 2. [Cluster Name]

[Same format]

[Repeat for each cluster]

---

<details>
<summary>Dismissed findings ([N] items)</summary>

| Finding       | Reviewer   | Reason Dismissed                                                          |
| ------------- | ---------- | ------------------------------------------------------------------------- |
| [description] | [reviewer] | Conflicts with [other reviewer]'s recommendation — [resolution reasoning] |
| [description] | [reviewer] | Contradicts project coding rules in `.ruler/`                             |
| [description] | [reviewer] | Not relevant at [stage] stage                                             |

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
[+X/3 bonus if applicable]

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

4. **Deep dive on a cluster** → User picks a cluster to explore in detail. Show full findings, relevant code snippets, and discuss approach before committing to action.

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
- If no native task/todo creation flow exists, offer the plan file instead

**If user selects "Deep dive on a cluster":**

- Ask which cluster (by number or name)
- Show the full findings with code context (read relevant files)
- Discuss the approach before taking action
- After discussion, offer to start implementing or return to the action menu

</process>

<arc_log>
**After completing this skill, append to the activity log.**
See: `references/arc-log.md`
Entry: `/arc:audit — [scope] ([N] critical, [N] high)`
</arc_log>

<success_criteria>
Audit is complete when:

- [ ] Scope detected (path, full codebase, or focus)
- [ ] Project type detected
- [ ] Reviewers selected based on scope and project scale
- [ ] Reviewers run in batches of 2
- [ ] All reviewers completed
- [ ] Findings consolidated and deduplicated
- [ ] Scorecard derived (7 core axes + bonus if applicable)
- [ ] Report generated in `docs/audits/` with scorecard
- [ ] Report saved and optionally staged
- [ ] Summary presented to user
- [ ] Next steps offered
- [ ] Any delegated reviewer work has completed or blockers are reported
      </success_criteria>
