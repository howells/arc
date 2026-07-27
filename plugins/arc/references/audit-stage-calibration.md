# Audit Stage Calibration

Stage-specific severity calibration for audit reviewers. Include the matching block in every reviewer prompt.

## Prototype Stage

```
This project is in PROTOTYPE stage — exploring ideas and validating concepts.

Severity calibration:
- Only flag issues that could cause data loss, credential leaks, or make the prototype non-functional
- Do NOT flag: missing rate limiting, incomplete error handling, lack of input validation on non-auth flows, missing tests, architectural purity, performance optimization, accessibility, code organization
- \* Exception: structural defects that carry a scorecard cap in `audit-scorecard.md` (god files, god page-clients, circular dependencies) are still **reported and still cap the axis** at every stage. Prototype calibration downgrades their severity; it does not suppress them. Dropping them would make the score silently disagree with the findings.
- Compress what would normally be High/Medium findings down to Low/Suggestion
- Focus: "Does this work?" and "Could this leak secrets?" — nothing else matters yet
- Respect the experiment. The project may be exploring an unconventional idea. Don't penalize it for being impractical — just flag genuine dangers.
```

## Development Stage

```
This project is in DEVELOPMENT stage — actively building features, not yet shipped.

Severity calibration:
- Critical: Only actual security vulnerabilities (SQL injection, XSS, credential exposure, auth bypass)
- High: Data integrity issues, bugs that would corrupt state
- Medium: Performance issues that would block usability, missing error boundaries
- Low: Everything else (architecture suggestions, missing tests, rate limiting, caching, monitoring)
- Do NOT flag as High/Critical: missing rate limiting, incomplete logging, lack of monitoring, missing CI checks, production hardening concerns — these are premature for this stage
- If the project is conceptual or experimental, use advisory language ("worth considering") rather than prescriptive ("must fix") for anything that isn't a security or data integrity issue
```

## Pre-launch Stage

```
This project is in PRE-LAUNCH stage — feature-complete, preparing to ship.

Severity calibration:
- Apply standard severity ratings for most issues
- Production hardening concerns (rate limiting, error handling, input validation) are now relevant but should be Medium, not Critical
- Missing monitoring/observability is Medium (should be set up, but not blocking)
- Architecture and performance issues at full severity
- Flag any missing error states in user-facing flows as High
```

## Production Stage

```
This project is in PRODUCTION stage — live and serving real users.

Severity calibration:
- Apply full severity ratings — all concerns are relevant
- Missing rate limiting, monitoring, error handling are legitimate High/Critical concerns
- Security issues at maximum severity
- Performance regressions are High
- No downgrading — if it affects real users, it matters
```

## Severity Validation Table

Use during consolidation to sanity-check reviewer findings:

| Finding Type                        | Prototype | Development | Pre-launch | Production |
| ----------------------------------- | --------- | ----------- | ---------- | ---------- |
| Missing rate limiting               | Drop      | Low         | Medium     | High       |
| Missing monitoring                  | Drop      | Drop        | Medium     | High       |
| Missing input validation (non-auth) | Drop      | Low         | High       | Critical   |
| Missing error boundaries            | Low       | Medium      | High       | High       |
| Missing tests                       | Drop      | Low         | Medium     | High       |
| Credential exposure                 | Critical  | Critical    | Critical   | Critical   |
| SQL injection / XSS                 | Critical  | Critical    | Critical   | Critical   |
| Architecture concerns               | Drop*     | Low         | Medium     | High       |
| Performance optimization            | Drop      | Low         | Medium     | High       |
| Accessibility gaps                  | Drop      | Low         | Medium     | High       |

If a reviewer rated something higher than the stage warrants, **downgrade it** during consolidation. Add a note: `[Severity adjusted for [stage] stage — would be [original] in production]`

## Advisory Tone

Not every project is trying to be production software. The audit must respect that.

- **Most findings should be advisory.** Frame as "you may want to consider X", not "you must do X".
- **Don't fight the user's intent.** Don't penalize unconventional approaches — flag genuine risks only.
- **Push hard only when genuinely dangerous.** Reserve forceful language for credential exposure, data corruption, injection attacks.
- **YAGNI still applies.** Don't recommend infrastructure the project doesn't need yet.

Language hierarchy:

- **"Must fix"** — Only genuinely dangerous (security holes, data loss). Used sparingly.
- **"Should consider"** — Real problems if the project progresses.
- **"Worth noting"** — Suggestions. No pressure.

## Conflict Resolution

| Conflict Pattern                                                               | Resolution                                                                      |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| security says "add validation" vs simplicity says "remove abstraction"         | Security wins at pre-launch/production. At prototype/dev, Low — user decides.   |
| performance says "cache aggressively" vs architecture says "keep stateless"    | Hot path = performance wins. Rarely called = architecture wins.                 |
| lee-nextjs says "Server Component" vs daniel says "needs client interactivity" | Check for useState/onClick. If client APIs used, daniel wins. If not, lee wins. |
| Two reviewers flag same area with different fixes                              | Pick simpler fix. Note alternative.                                             |
| Reviewer flags something .ruler/ explicitly allows                             | Dismiss entirely. Project rules override.                                       |
