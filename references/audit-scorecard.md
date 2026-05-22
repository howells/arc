# Audit Scorecard

7 core axes, each scored 0-3. Total range: 0-21.

Reviewers score their mapped axis using the criteria tables below.
The consolidation step sums scores and interprets the total.

## Axis-Reviewer Mapping

| # | Axis | Primary Reviewer(s) |
|---|------|---------------------|
| 1 | Security Posture | security-engineer |
| 2 | Performance | performance-engineer |
| 3 | Architecture | architecture-engineer, lee-nextjs-engineer |
| 4 | Code Quality | senior-engineer, daniel-product-engineer |
| 5 | Test Health | test-quality-engineer + mechanical checks |
| 6 | Resilience | daniel-product-engineer |
| 7 | Operations | mechanical checks (build, typecheck, lint, CI) |

When multiple reviewers map to one axis, use the **lower** score (conservative).

## Bonus Axes (conditional, not in /21 total)

| Axis | When | Primary Reviewer(s) |
|------|------|---------------------|
| Accessibility | Frontend projects | accessibility-engineer |

Bonus axes are reported separately as `+N` (e.g., `14/21 +3/3`).

---

## Scoring Criteria

### 1. Security Posture

Can attackers exploit the codebase?

| Score | Criteria |
|-------|----------|
| 0 | Critical vulnerabilities — exposed secrets, injection attacks, missing auth on protected routes, no input validation at boundaries |
| 1 | Auth exists but has bypasses or inconsistencies. Input validation is partial. Dependencies have known high/critical CVEs |
| 2 | Auth covers all routes, inputs validated at boundaries, no known CVEs. Missing hardening like CSP, rate limiting, or CSRF protection |
| 3 | Defense in depth — auth + authorization, comprehensive input validation, CSP headers, rate limiting, secrets managed properly, clean dependency audit |

### 2. Performance

Will this hold up under real-world load?

| Score | Criteria |
|-------|----------|
| 0 | Critical bottlenecks — N+1 queries, unbounded data fetching, no code splitting, blocking renders, no caching |
| 1 | Noticeable issues — large bundles, missing indexes, client-side fetching where server would work, render waterfalls |
| 2 | Solid baseline — code splitting, lazy loading, indexed queries, reasonable bundles. Room for caching, streaming, or edge optimization |
| 3 | Optimized — efficient queries with caching, streaming responses, optimized bundles, measured and profiled |

### 3. Architecture

Is the codebase organized for change?

| Score | Criteria |
|-------|----------|
| 0 | God files (>400 LOC components), circular dependencies, no module boundaries, business logic tangled with UI |
| 1 | Some structure but boundaries are leaky — mixed concerns, server/client boundary hacks (`*-wrapper`, `*-client`), deep coupling between modules |
| 2 | Clear module boundaries and proper server/client split. Some areas of high coupling or unclear ownership remain |
| 3 | Clean separation of concerns, well-defined interfaces, dependency direction enforced. Adding features doesn't require touching unrelated code |

### 4. Code Quality

Is the code readable, correct, and maintainable?

| Score | Criteria |
|-------|----------|
| 0 | No type safety or `any` throughout, no linting, dead code everywhere, inconsistent patterns |
| 1 | Types exist but gaps — some `any`/casts, lint warnings, inconsistent naming or patterns, dead exports |
| 2 | Strong types, lint-clean, consistent patterns, minimal dead code. Some complexity hotspots (>250 LOC files) |
| 3 | Strict types throughout, zero lint issues, consistent patterns, no dead code, complexity under control across the board |

### 5. Test Health

Can you refactor with confidence?

| Score | Criteria |
|-------|----------|
| 0 | No tests, or tests that exist but don't assert meaningful behavior |
| 1 | Some tests covering happy paths. Low coverage, flaky tests, or poor isolation |
| 2 | Good coverage of critical paths. Tests are isolated, reliable, and assert behavior. Gaps in edge cases or integration testing |
| 3 | Comprehensive — unit, integration, and e2e. Meaningful assertions, fast and reliable runs, edge cases covered |

### 6. Resilience

Does the app handle the unhappy path?

| Score | Criteria |
|-------|----------|
| 0 | No error handling — unhandled rejections, blank screens on failure, no loading states, crashes on empty data |
| 1 | Inconsistent — some loading spinners, some try/catch, but many paths show raw errors, hang on failure, or ignore empty states |
| 2 | Error boundaries in place, loading/error states for most async flows, network failures degrade gracefully. Empty states or rare edge cases still missing |
| 3 | Every async operation has loading/error/empty states. Error boundaries at appropriate levels. Retry logic where warranted. Users always know what's happening |

### 7. Operations

Is this ready to run and maintain?

| Score | Criteria |
|-------|----------|
| 0 | Build broken or fragile, type errors in CI, no automated checks, no deployment config |
| 1 | Build passes but with warnings. Basic CI exists. Deployment config is minimal or manual |
| 2 | Clean build, types, lint. CI runs tests. Deployment configured and repeatable. Missing monitoring or structured logging |
| 3 | Full pipeline — clean build, comprehensive CI, monitoring/alerting, structured logging, deployment with rollback capability |

---

### Bonus: Accessibility (Frontend only)

Can everyone use this?

| Score | Criteria |
|-------|----------|
| 0 | No semantic HTML, keyboard navigation broken, no alt text, no ARIA labels |
| 1 | Some semantic elements, basic alt text, but keyboard nav broken, poor contrast, no focus management |
| 2 | Semantic HTML, keyboard navigable, proper ARIA, good contrast. Missing prefers-reduced-motion or focus trapping in modals |
| 3 | WCAG 2.1 AA — screen reader tested, reduced-motion support, skip links, focus management, form accessibility complete |

## Interpreting the Total

| Range | Rating | Description |
|-------|--------|-------------|
| 0-7 | **Fragile** | Critical gaps across multiple areas. High risk of incidents, security breaches, or cascading failures |
| 8-12 | **Developing** | Foundation exists but notable weaknesses. Functional for development, risky for production |
| 13-17 | **Solid** | Well-built with specific areas to improve. Ready for production with known trade-offs |
| 18-21 | **Production-grade** | Comprehensive quality across the board. Maintainable, resilient, and secure |

## Score Derivation Rules

1. **Criteria-based, not just finding-based.** Each reviewer scores their axis using the criteria table. The score reflects the *overall posture* of that axis, not just the worst single finding. A single medium-severity issue in an otherwise strong area doesn't force a low score.
2. **Multi-reviewer axes.** When multiple reviewers map to one axis (Architecture, Code Quality), use the **lower** score.
3. **Mechanical overrides.** Operations (axis 7) and Test Health (axis 5) incorporate mechanical check results directly:
   - Build broken -> Operations capped at 0
   - Type errors without build failure -> Operations capped at 1
   - No test files found -> Test Health capped at 0
   - Test failures -> Test Health capped at 1
4. **Stage context is interpretation, not scoring.** A prototype scoring 10/21 is expected and healthy. A production app scoring 10/21 needs attention. The score is absolute; stage context goes in the written interpretation.
5. **Bonus axes** are reported as `+N/M` after the core score. Not included in the /21 total to keep the core score comparable across project types.
