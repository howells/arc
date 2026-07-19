# Implementation Assurance

This reference owns Arc's implementation assurance policy: posture calculation, risk floors,
slice ownership, reviewer selection, the verification ladder, and session-local verification
receipts. It is prompt guidance, not an executable risk engine.

## Contract ownership

| Contract                                                  | Canonical source                         |
| --------------------------------------------------------- | ---------------------------------------- |
| Assurance posture, ownership, review, verification ladder | `references/implementation-assurance.md` |
| Plan and task XML, slice cohesion                         | `references/task-granularity.md`         |
| Seams and evidence techniques by work kind                | `references/testing-patterns.md`         |
| Durable task/plan state, implementation baseline, drift   | `references/plan-lifecycle.md`           |
| Agent result vocabulary and durable-state mapping         | `references/subagent-statuses.md`        |

Consumers cite these references. They do not redefine the tables locally.

## Assurance posture

**Highest applicable risk wins.** File count and task count never select assurance by
themselves.

| Posture      | Use when                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Lean**     | Familiar, reversible work using established project patterns and boundaries, including large mechanical changes.                                                   |
| **Standard** | Several related seams, integrations, source-compatible public behavior, or a new use of an established pattern.                                                    |
| **Guarded**  | Schema/data, auth/security, permissions, destructive or external mutation, externally consumed or versioned contracts, or new/unfamiliar architectural boundaries. |

Every full or inline plan records `Planned assurance`, `Effective assurance`, and a short
rationale. `implement` reassesses risk after drift inspection and against the final
attributable diff. Automatic reassessment may only raise assurance. The user may explicitly
downgrade it above the Guarded floor; no confirmation can cross a Guarded risk floor.

Legacy plans without assurance receive planned Standard, then undergo the same fresh risk
assessment before execution. A Guarded signal always raises effective assurance.

## One owner per slice

One implementation owner reads context, searches for existing patterns, creates the
required evidence, implements vertically, runs focused checks, self-reviews, and reports a
transient result. The controller verifies that result and alone updates durable status. The
owner creates a coherent commit only when the user authorized commits.

Test writers are conditional specialists for complex harnesses, browser/E2E work, difficult
integration fixtures, or test-suite work. Fixers and debuggers are used after an actual
failure, not as routine handoffs.

Before execution, ask once whether per-slice commits are authorized. Without that authority,
leave work uncommitted. Review fixes use an explicit corrective commit when commits are
authorized; never amend or rewrite history without separate authority.

## Review posture

Lean and Standard run two whole-implementation axes in parallel against the same attributable
target:

- **Spec axis:** requirements, skipped slices, partial wiring, substantive implementation,
  and scope creep.
- **Standards axis:** maintainability, boundaries, repository conventions, test
  effectiveness, and evidence appropriate to each work kind.

Guarded adds the relevant security, data, performance, Mastra, or product/browser specialist
and may review the risky seam earlier. Any later in-scope source, test, documentation,
configuration, or generated change invalidates both axes. Rerun affected specialists when
their scope changes.

## Verification ladder

1. Before edits, run affected baseline checks. Do not run the full repository suite merely
   to begin. Stop on unexplained affected failures unless fixing them is the task.
2. During a behavior cycle, run the focused test after meaningful red and green steps.
3. At a slice boundary, run affected package type, lint, and boundary checks.
4. Before an authorized commit, run scoped non-mutating checks.
5. Regenerate required artifacts before whole-implementation review.
6. After all review fixes, run one fresh repository verification set on the unchanged
   target, plus a separate production build when applicable.

A failed closeout command may be fixed and rerun. Any in-scope fix returns through both
review axes before the next planned green closeout attempt.

## Session-local verification receipt

A session-local verification receipt records:

- **Exact command** and working directory.
- Scope and implementation base.
- Exit status and concise result.
- **Current HEAD**.
- Fingerprint of attributable tracked changes and non-ignored untracked content.
- Relevant command and configuration identity.

Only controller-observed command output can mint a receipt; an agent summary cannot. Reuse
is allowed only in the **same uninterrupted session** while HEAD, command/config identity,
and attributable target content remain unchanged. A restart, merge, rebase, later edit, or
scope change invalidates it. Exclude unchanged pre-existing dirty paths and plan/index status
writes.

## Human gates

Progress reports are informational. Never pause on a fixed task cadence. Unattended execution
skips routine waits only; it never bypasses unresolved decisions, authentication, destructive
or external-mutation authority, or subjective UI judgment.

Read-only deployment verification may be automatic. Any command that mutates an external
system requires authority in the current request or a dynamic `checkpoint:action` immediately
before the mutation.

## Prompt-behavior scenario matrix

These scenarios document expected model judgment. Structural shell tests confirm that the
contract and its consumers agree; they do not execute or prove model judgment.

| Scenario                                                      | Expected posture/evidence                             |
| ------------------------------------------------------------- | ----------------------------------------------------- |
| Twenty-file mechanical rename using established patterns      | Lean; mechanical verification, no synthetic red test  |
| Established-pattern integration across related seams          | Standard; named-seam contract evidence                |
| Auth, schema, permission, or versioned public-contract change | Guarded; risk-specific evidence and specialist        |
| Legacy documentation/artifact/refactor task without `kind`    | Legacy evidence path using existing verify guidance   |
| Legacy checkpoint without `kind`                              | Checkpoint protocol; no seam or work-kind requirement |
| Interrupted slice with attributable dirty files               | Resume from implementation base and current diff      |
| Slice overlaps a pre-existing dirty path                      | `NEEDS_CONTEXT`; never overwrite or guess             |
| External mutation without current authority                   | Dynamic action checkpoint before mutation             |
