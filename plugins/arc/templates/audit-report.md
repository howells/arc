# Audit Report Template

The structure `/arc:audit` writes to `docs/arc/audits/YYYY-MM-DD-[scope-slug]-audit.md`.
Bracketed values are placeholders to fill, not text to reproduce.

---

# Audit Report: [scope]

**Date:** YYYY-MM-DD
**Reviewers:** [list of agents used]
**Scope:** [path or "full codebase"]
**Project Type:** [detected type]
**Project Stage:** [prototype / development / pre-launch / production]

> Severity ratings have been calibrated for the **[stage]** stage. Issues marked with ↓ were downgraded from their production-level severity.

## Structural Hotspots

- **Long files >600 LOC:** [count]
- **Severe long files >1000 LOC:** [count]
- **Files >2000 LOC (strongest signal):** [count]
- **Suspicious boundary files:** [count]
- **Suspicious + long overlap:** [count]
- **Page-shape findings (thin page/layout → god client):** [count]

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
