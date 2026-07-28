# Audit Reviewer Prompts

Shapes for reviewer dispatch prompts. Every prompt carries scope, project type, project stage,
the stage calibration block, applicable coding rules, and the scorecard axis that reviewer owns.

Critical and High findings without an `Excerpt:` line cannot be vetted and are downgraded.

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
  Excerpt: [the exact source line(s) you saw]

### High
- [file:line] Issue description
  Excerpt: [the exact source line(s) you saw]

### Medium
- [file:line] Issue description

### Low
- [file:line] Issue description

Critical and High findings without an Excerpt line cannot be vetted and will be downgraded.

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


---

## What Every Reviewer Prompt Carries

Context to pass at dispatch, and the per-reviewer emphasis that makes each manifest
actionable in that reviewer's domain.


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
- Long files 600+ LOC: [list]
- Severe long files 1000+ LOC: [list]
- Files 2000+ LOC (strongest signal): [list]
- Suspicious boundary files: [list]
- Suspicious + long overlap: [list]
- Suspicious + "use client" overlap: [list]
- Page-shape findings (thin page/layout → god client): [list]
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

Pass `references/maintainability-review.md` to `architecture-engineer`, `senior-engineer`, and `daniel-product-engineer`. They should apply it as a demanding code-health lens: file size sets how hard to look (presumptive god file past 600 lines, severe past 1000, strongest signal past 2000 — generated, vendored, and data-only files exempt), but the finding comes from reading the file and confirming responsibilities are actually mixed. God files, god page-clients, ad-hoc branching, weak abstractions, misplaced ownership, and avoidable duplication should be reported when evidence-backed.

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

Scanner leads (only when react-doctor ran):
[Paste the scanner findings relevant to this reviewer's axis]

Important: These are inspection prompts, not automatic findings. Report only concrete, reproducible issues with file/line evidence. When scanner leads are present, confirm or refute them instead of re-deriving the same mechanical patterns.
```

**Include database lifecycle guidance in data-engineer prompts (projects with a database).**

Pass `references/database-lifecycle.md` to `data-engineer`. Beyond migration safety, flag `db:push`-only schema management (schema pushed directly with no committed migration files), a missing migration journal, and absent backup/PITR posture as concrete findings when the evidence is present.

**Include agent-drift guidance in mastra-agent-engineer prompts (Mastra projects).**

When Mastra is detected, pass `references/agent-evals.md` to `mastra-agent-engineer` and have it check for agents-outside-Mastra drift — application agents running outside the registered Mastra instance — plus eval/golden-set coverage for the registered agents.
