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
    - accessibility-engineer
    - test-quality-engineer
  workflow:
    position: utility
---

<tool_restrictions>
`EnterPlanMode` and `ExitPlanMode` are banned. This skill is Arc's own structured process.
</tool_restrictions>

<arc_runtime>
Requires the full Arc bundle. Arc-owned paths (`agents/`, `references/`, `disciplines/`, `templates/`, `scripts/`, `rules/`, `skills/`) resolve from the plugin root — the directory containing `agents/` and `skills/`. Everything else is the user's repository.
</arc_runtime>

<platform_context>
Adapt to the current harness rather than assuming Claude tool names — task tracking, structured
questions, and subagent delegation each degrade gracefully when absent. Load
`references/platform-tools.md` when a mapping isn't obvious.

Where native task tracking exists, check for an existing task for this audit and mark it
`in_progress` before starting.
</platform_context>

<required_reading>
Load each at the phase that needs it, not up front:

| Phase | Load |
| ----- | ---- |
| 1 — detect | `references/audit-detection.md`, `references/audit-signals.md` |
| 3 — dispatch | `references/audit-reviewer-rules.md`, `references/audit-reviewer-prompts.md`, `disciplines/dispatching-parallel-agents.md`, `references/maintainability-review.md` |
| 3 and 4 — score and calibrate | `references/audit-scorecard.md`, `references/audit-stage-calibration.md` |
| 4 — vet | `references/finding-vetting.md` |
| 5 — report | `templates/audit-report.md` |

Load when relevant:

- `references/react-audit-signals.md` — React, Next.js, TanStack Query, or React Native projects. Pass the relevant sections into reviewer prompts as audit signals.
- `references/index.md` — the full reference catalogue, when a finding needs background you can't name a file for.
  </required_reading>

<rules_context>
Project coding rules come from `.ruler/` when it exists, otherwise Arc's own `rules/`.

`references/audit-reviewer-rules.md` lists which rules each reviewer receives and the frontend
implementation checks for `daniel-product-engineer` and `accessibility-engineer`. Load it before
composing reviewer prompts.

These inform implementation and accessibility checks only. Do not score visual taste, invent a
visual direction, or create redesign findings; defer visual direction to the project's design
source of truth.
</rules_context>

<process>
## Phase 1: Detect Scope & Project Type

**Parse arguments:**

- `$ARGUMENTS` may contain:
  - A path (e.g., `apps/web`, `packages/ui`, `src/`)
  - A plain-language focus (e.g., "security", "performance", "architecture", "accessibility")

Do not advertise audit flags or variants. If the user provides a path or focus, treat it as scope guidance for the same default audit workflow.

**Gardening modes (lightweight, run periodically):**

The harness that earns trust decays: docs drift from code, rules go stale. When the focus is "doc gardening" or "rule gardening", skip reviewer dispatch and run the matching cheap pass instead. These are cheap enough to run on a cadence, not only when something is wrong.

- **Doc gardening** — walk the project's documentation (`README`, `docs/`, `AGENTS.md`, `CONTEXT.md`, package docs) and, for each claim, check it against the code. Fix what is clearly stale (wrong paths, renamed commands, dead links); flag what needs a human decision.
- **Rule gardening** — check that the project's written rules (`.ruler/` or `rules/`) are still followed. For each violation, ask whether it is intentional before flagging. Flag dead rules for deletion: never triggered, no longer relevant, or already enforced mechanically elsewhere (linter, boundaries, CI).

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

Collect the Phase 1 signal manifests using `references/audit-signals.md` — React/Next signals,
dependency vulnerabilities, dead code (knip), structural hotspots, page shape, code policy,
fail-fast determinism, complexity hotspots, and the read-only codebase map from
`scripts/codebase-map.py`. Run only the scans that apply to the detected project type, and carry
each stored manifest forward into reviewer context.

Treat every manifest as orientation, not evidence. Reviewers still inspect files before reporting.

**Detect project scale, lifecycle stage, and the security gate:**

Load `references/audit-detection.md` and apply it — file-count thresholds that set reviewer
depth, the lifecycle-stage signal table, and the security readiness gate that decides whether
`security-engineer` runs at all. Confirm the detected stage with the user before proceeding; if
they correct it, use their override. With no user response available, proceed with the detected
stage and mark it unconfirmed in the report header — stage drives every severity rating.

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
Structural hotspots: [X long files 600+ LOC, Y severe 1000+ LOC, Z at 2000+ LOC, V suspicious boundary files, W suspicious+long overlap]
Page shape: [X thin page/layout pass-throughs, Y to god clients 600+ LOC, Z to god clients 1000+ LOC] or "N/A (not React/Next)"
Code policy: [X useless barrels, env-typing: yes/no, Y dynamic imports, Z generic-suffix components] or "N/A (not JS/TS)"
Determinism: [X env-default fallbacks, Y swallowed catches, Z legacy/compat aliases] or "N/A (not JS/TS)"
Pipeline coverage: [X/Y workspaces with lint+typecheck configured]
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

### Pipeline Coverage (every app & package)

Linting and typechecking must be configured in **every** app and package — not just at the repo root. A monorepo where the root has lint/typecheck scripts but individual `apps/*` / `packages/*` do not is a real gap: those workspaces ship unchecked.

For the root and every workspace with a `package.json`:

```bash
# Enumerate workspaces and check for lint + typecheck wiring
for pkg in $(find . apps packages -maxdepth 3 -name package.json 2>/dev/null | grep -vE 'node_modules'); do
  dir=$(dirname "$pkg")
  grep -qE '"lint"\s*:' "$pkg" && lint=yes || lint=no
  grep -qE '"(typecheck|type-check|tsc)"\s*:' "$pkg" && tc=yes || tc=no
  test -f "$dir/tsconfig.json" && tsc=yes || tsc=no
  echo "$dir  lint=$lint  typecheck=$tc  tsconfig=$tsc"
done
```

Flag any app/package missing a `lint` script, a `typecheck` script, or (for TS workspaces) a `tsconfig.json`. Then confirm these actually run in CI (`.github/workflows/*`, or the Turborepo `turbo.json` pipeline) — a script that exists but is never executed in CI is a soft gap. Record per-workspace coverage in the mechanical summary and map gaps to **Operations** (see the Operations cap rule in the scorecard).

### Check Order

1. Build — stop immediately if it fails
2. Typecheck — report errors and continue
3. Lint — auto-fix first, then report remaining issues
4. Tests — run when test tooling is detected
5. Debug log audit
6. Git status
7. Secrets scan — run when a suitable scanner or safe grep fallback is available
8. React scanner — optional, React projects only; see below

Include the mechanical summary in reviewer context, then continue to reviewer selection.

### Optional React Scanner (react-doctor)

For React/Next.js/React Native projects, [react-doctor](https://github.com/millionco/react-doctor) provides a deterministic scan across state/effects, performance, architecture, security, and accessibility — the mechanized counterpart of `references/react-audit-signals.md`. It is an optional enhancement, never a dependency: the audit must produce the same scorecard without it.

- **Availability**: use it when it is already wired into the project (a dependency, `doctor.config.ts`, or a react-doctor CI workflow). Otherwise offer it with one question — running `npx react-doctor@latest` downloads and executes third-party code and reports telemetry, so never start that silently. Skip without comment if declined or offline.
- **Run**: `npx react-doctor@latest --no-telemetry` at the project root (omit `--no-telemetry` if the project's own config opts in).
- **Findings are leads, not proof**: attach the scanner output to the mechanical summary and reviewer context. Reviewers confirm each lead against the code path before it becomes a finding, and skip re-deriving mechanical patterns the scanner already covers — their attention belongs on what static analysis cannot see (cross-file semantics, architecture, product intent).
- **Scoring**: scanner output alone never moves a scorecard axis; only reviewer-confirmed findings do.

### External-Surface Checks

When the project exposes an agent-facing surface or ships published bundles, add these one-line checks to the mechanical summary:

- Is the agent-facing surface (API / MCP / `llms.txt`) current with shipped behavior?
- Have published component bundles been verified post-build (the built artifact, not just source)?

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

These are typical counts, not caps — the selection rules above decide. A medium Next.js project
with a database and a security gate legitimately reaches seven — `accessibility-engineer` joins
any frontend-heavy medium/large project.

- Small projects: typically 2-3 reviewers
- Medium projects: typically 3-4 reviewers
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
| accessibility-engineer  | sonnet | WCAG and interaction-hygiene review                                    |
| test-quality-engineer   | sonnet | Assertion and coverage judgment                                        |

**Compose each prompt from `references/audit-reviewer-prompts.md`.** It covers what every
reviewer receives — project stage and its calibration block, the structural hotspot manifest, the
codebase map, and the domain references each reviewer needs — plus the per-reviewer emphasis for
reading those manifests.

**For each batch, dispatch 2 reviewer subagents in parallel when the platform supports delegation.**
If the platform does not support subagents, run the same reviewer prompts locally one reviewer at a time and continue with consolidation.

**Scorecard scoring:** Every reviewer prompt must include the scorecard axis they are responsible for
scoring. Include the criteria table for their axis from `audit-scorecard.md` and ask them to score it
at the end of their response.

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

**Wait for batch to complete before starting next batch.** Continue dispatching the remaining selected reviewers two at a time, waiting between batches, until all have run.

## Phase 4: Consolidate Findings

**Collect all agent outputs.**

**Deduplicate:**

- Same file:line mentioned by multiple reviewers → merge into single finding
- Note which reviewers flagged each issue

**Vet before presenting** — apply `references/finding-vetting.md`:

- Re-open the cited `file:line` for every Critical and High finding and confirm it against
  the current code, using the finding's `Excerpt:` line. Reviewers over-report; an unvetted
  citation is a lead, not a fact.
- Hunt the three failure classes from the reference: by-design behavior (including tradeoffs
  recorded in `docs/adr/` or `CONTEXT.md` — settled, not findings, though code drifted from a
  stale ADR IS a finding), mis-attributed evidence (re-locate and correct, or dismiss if
  unlocatable), and cross-session duplicates (already tracked in `docs/arc/plans/INDEX.md`
  or its rejected ledger). The same-run dedup above is separate and stays as is.
- Route corrections and dismissals to the report's Dismissed section with a one-line reason.
- The report must state the vet scope: Medium/Low findings are unverified citations.

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
mkdir -p docs/arc/audits
```

File: `docs/arc/audits/YYYY-MM-DD-[scope-slug]-audit.md`

Write the report using the structure in `templates/audit-report.md`, which includes the
`## Codebase Map` section. Follow the template's section list rather than any list restated here —
it is the source of truth for report shape.

**Do not auto-commit the report unless the user explicitly asks for a commit.**
You may stage it or leave it unstaged based on the user's preferences and the platform workflow.

## Phase 6: Present & Offer Actions

**Show summary to user:**

```
## Audit Complete — X/21 [Rating]

Reviewed: [scope]
Reviewers: [count] agents
Project stage: [stage]
Report: docs/arc/audits/YYYY-MM-DD-[scope]-audit.md

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

1. **Tackle critical cluster now** → Jump straight into fixing the highest-priority cluster. Invoke `/arc:implement` scoped to the files and issues in that cluster.

2. **Build an improvement backlog** → Invoke `/arc:improve` with this audit report as intake. Improve vets the findings, prioritizes by leverage, writes selected ones as executable implementation plans via the detail skill, and tracks them in `docs/arc/plans/INDEX.md`.

3. **Add to tasks** → Use the platform's native task/todo flow to create tasks for critical/high clusters. Each cluster becomes a task with findings in the description. Lower severity clusters are omitted — they're in the audit report if needed later.

4. **Remediate operations now** → Only when the report has Operations findings. Load `references/operations-playbook.md` and generate the actual files rather than describing them.

5. **Deep dive on a cluster** → User picks a cluster to explore in detail. Show full findings, relevant code snippets, and discuss approach before committing to action.

6. **Done for now** → End session. Report is saved, user can return to it later.

**If user selects "Tackle critical cluster now":**

- Identify the cluster with the most critical/high findings
- Invoke `/arc:implement` with the cluster's files and issues as scope — implement owns scope detection and can inline-plan the cluster
- The work stays scoped to just that cluster, not the entire audit

**If user selects "Remediate operations now":**

- Load `references/operations-playbook.md` and generate the concrete files the Operations findings call for: a CI workflow wiring whatever check/verify scripts the repo already declares, gate enforcement, an env-doctor check, and cron/scheduled-job failure alerting. Match the project's existing package manager and scripts rather than inventing new ones, and offer the files as changes for the user to review before committing.

**If user selects "Build an improvement backlog":**

- Invoke the improve skill (`skills/improve/SKILL.md`) with this session's audit report as
  its intake source — its Critical/High findings arrive pre-vetted from Phase 4, so improve
  spot-checks those; Medium/Low findings still need improve's full vet.
- Improve owns everything from there: leverage ordering, plan writing via detail, and the
  index. Do not also write a separate task plan from this skill.

**If user selects "Add to tasks":**

- Use the platform's native task/todo creation flow for each critical/high cluster when available
- Each task gets the cluster name as subject, findings as description, and present continuous activeForm
- Lower severity clusters stay in the audit report only
- If no native task/todo creation flow exists, offer the improvement backlog route instead

**If user selects "Deep dive on a cluster":**

- Ask which cluster (by number or name)
- Show the full findings with code context (read relevant files)
- Discuss the approach before taking action
- After discussion, offer to start implementing or return to the action menu

</process>

<success_criteria>
Audit is complete when:

- [ ] Scope detected (path, full codebase, or focus)
- [ ] Project type detected
- [ ] Reviewers selected based on scope and project scale
- [ ] Reviewers run in batches of 2, or locally one at a time where delegation is unavailable
- [ ] All reviewers completed
- [ ] Findings consolidated and deduplicated
- [ ] Critical/High findings vetted against the cited code (`references/finding-vetting.md`)
- [ ] Scorecard derived (7 core axes + bonus if applicable)
- [ ] Report generated in `docs/arc/audits/` with scorecard
- [ ] Report saved and optionally staged
- [ ] Summary presented to user
- [ ] Next steps offered
- [ ] Any delegated reviewer work has completed or blockers are reported
      </success_criteria>
