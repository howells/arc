---
name: subagent-driven-development
description: Use when an implementation plan benefits from fresh owners or conditional specialists
---

# Slice-Owned Development

Execute coherent plan slices with one implementation owner per slice. Fresh ownership is a
context tool, not a mandatory handoff chain. Assurance posture and the controller determine
which specialists are justified.

Read `references/implementation-assurance.md`, `references/task-granularity.md`, and
`references/subagent-statuses.md` before dispatching.

## Owner loop

For each ready slice:

1. Mark its durable state `in_progress`.
2. Give one owner the complete task, relevant scene-setting context, implementation baseline,
   rules, and commit posture.
3. The owner reads first, searches existing patterns, creates the required evidence, implements
   vertically, runs focused checks, self-reviews, and reports a canonical result.
4. The controller verifies the report against the worktree and records durable state.
5. Continue according to dependencies. Progress updates do not wait for approval.

Legacy adjacent tasks may share an owner while retaining every task ID and status. Do not run
multiple mutating owners in parallel when their paths or dependencies can overlap.

## Conditional specialists

- Test writer: complex harness, browser/E2E flow, difficult integration fixture, or test-suite work.
- Debugger/fixer: an observed failing test, typecheck, or lint result.
- Early risk reviewer: Guarded seam where waiting until closeout would make rework dangerous.

Ordinary slices do not dispatch a separate test writer, spec reviewer, and standards reviewer.

## Whole-implementation review

After root sources and generated artifacts are current, run the spec and standards axes in
parallel against the same attributable target. Guarded work adds the relevant specialist.
Any in-scope change invalidates both axes; rerun affected specialists when their scope changes.

## Failure and resumption

- Apply the canonical transient-to-durable mapping; do not reproduce it here. Change the
  conditions before any redispatch.
- Interrupted work resumes using `references/plan-lifecycle.md`; never discard a shared
  worktree diff automatically.

## Commit authority

Ask once before execution whether slice commits are authorized. If not, owners leave changes
uncommitted. Never let a subagent infer commit, amend, push, or history-rewrite authority.
