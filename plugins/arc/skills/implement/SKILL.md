---
name: implement
description: |
  Risk-proportional implementation workflow with coherent slice ownership, work-kind evidence,
  durable resumption, whole-implementation review, and one fresh closeout gate.
  Use when asked to implement, build, execute a plan, or continue from an Arc feature spec.
license: MIT
metadata:
  author: howells
website:
  order: 6
  desc: Plan + execute
  summary: Select assurance by risk, plan coherent slices, and execute each with one owner and evidence appropriate to the work.
  what: |
    Implement selects Lean, Standard, or Guarded assurance from actual risk rather than file
    or task count. New behavior stays test-first at an agreed seam, while refactors, artifacts,
    deployments, and documentation use evidence that can genuinely prove their outcome. One
    owner executes each coherent slice, followed by whole-implementation spec and standards review.
  why: |
    Quality comes from relevant evidence and review, not multiplying agents and broad gates for
    every tiny task. Risk-proportional assurance keeps Arc disciplined, durable, and faster.
  decisions:
    - Planning is built in; inline and saved plans use the same XML contract.
    - Assurance is Lean, Standard, or Guarded; highest applicable risk wins.
    - One owner handles evidence, implementation, focused verification, self-review, and status per slice.
    - Test writers and specialist reviewers are conditional.
    - Final review uses parallel spec and standards axes on the whole attributable implementation.
    - One fresh repository gate runs after final review fixes.
  workflow:
    position: spine
    after: review
---

<tool_restrictions>

Use the available user-question mechanism for decisions. `EnterPlanMode` and `ExitPlanMode` are
banned because Arc owns its planning and execution process.

</tool_restrictions>

<arc_runtime>
Requires the full Arc bundle. Arc-owned paths (`agents/`, `references/`, `disciplines/`, `templates/`, `scripts/`, `rules/`, `skills/`) resolve from the plugin root — the directory containing `agents/` and `skills/`. Everything else is the user's repository.
</arc_runtime>

<required_reading>
Read before execution:

1. `references/implementation-assurance.md` — posture, ownership, review, verification ladder
2. `references/task-granularity.md` — normative XML and legacy compatibility
3. `references/testing-patterns.md` — seams and work-kind evidence
4. `references/checkpoint-patterns.md` — genuine human gates
5. `references/subagent-statuses.md` — result-to-state mapping
6. `references/arc-paths.md` — artifact locations
7. `references/plan-lifecycle.md` — baseline, drift, resumption, index writes

Load when relevant:

- `references/model-strategy.md` before delegating.
- `disciplines/subagent-driven-development.md` before using slice owners.
- `disciplines/verification-before-completion.md` before completion claims.
- `disciplines/finishing-a-development-branch.md` before shipping.
- `references/index.md` — the full reference catalogue, when the work needs background you can't name a file for.
  </required_reading>

<available_agents>

| Agent                                                            | Default use                                                                |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `implementer`                                                    | Own a coherent implementation slice end-to-end.                            |
| `unit-test-writer`, `integration-test-writer`, `e2e-test-writer` | **Conditional** complex harness, fixture, browser/E2E, or test-suite work. |
| `debugger`, `fixer`                                              | An observed failing test, typecheck, or lint result.                       |
| `test-runner`, `e2e-runner`                                      | Verbose or iterative focused execution when useful.                        |
| `spec-reviewer`                                                  | Sonnet whole-implementation spec/completion axis.                          |
| `code-reviewer`                                                  | Sonnet whole-implementation standards/evidence axis.                       |

Read an agent file before dispatching it. Never run multiple mutating owners in parallel when
their declared paths or dependencies overlap.
</available_agents>

<process>

## 0. Load or create the plan

If the user provided a saved plan or an approved plan in conversation, use it. Otherwise:

- check the plan index, then canonical/legacy plan locations;
- use `skills/detail/SKILL.md` for a full plan when the change needs durable cross-session work;
- create an inline plan for bounded work using the same header, seam registry, and XML task
  representation as a saved plan.

Do not invent a separate small-scope schema. Before implementation, ensure new auto tasks have
valid kinds and evidence, checkpoint tasks require human input, dependencies resolve, and verify
commands are concrete.

### Legacy plans

Plans with `Plan schema: 2` validate modern tasks strictly. An absent schema header or schema 1
uses the legacy path. Legacy plans without assurance receive **Planned assurance: Standard**,
then undergo a fresh risk assessment. Legacy auto tasks without `kind` use their existing
`<verify>` and advisory `<test_code>`; do not force a seam or red run merely because
classification is absent. Infer and record a modern kind only when intent is unambiguous. Legacy
checkpoints remain exempt.

## 1. Select effective assurance

Use `references/implementation-assurance.md`. Announce Planned assurance, Effective assurance,
and the concrete rationale before edits. Reassess after drift inspection. Highest applicable
risk wins. Automatic reassessment only raises effective assurance; a user-confirmed downgrade
cannot cross a Guarded floor. When assurance rises, update `Effective assurance` in the plan
header before risky execution and append the rationale to the decision log. Never change
`Planned assurance` during execution.

## 2. Establish execution authority and baseline

Check project rules and the current branch. Do not alter unrelated user changes.

Ask once whether per-slice commits are authorized. If the user already gave explicit commit
instructions, follow them. Otherwise leave work uncommitted. Never infer push, PR, amend, or
history-rewrite authority.

Persist the **Implementation baseline** in `## Implementation state` before edits:

- starting HEAD;
- all declared task paths;
- pre-existing dirty paths and their initial fingerprints;
- plan/index metadata paths excluded from implementation evidence.

Also persist commit posture and last coherent commit. If a legacy `in_progress` plan has no
baseline, return `NEEDS_CONTEXT` rather than guessing attribution.

If a task overlaps a pre-existing dirty path, report `NEEDS_CONTEXT`; never overwrite, discard,
or guess ownership. Run affected baseline checks only. Stop on unexplained affected failures
unless fixing them is the task.

For saved plans, run the canonical drift check and mark the owned index row `IN PROGRESS` using
the per-row write discipline.

## 3. Execute coherent slices

Follow dependencies. Legacy adjacent tasks may share one owner while retaining every task ID.

For each ready slice:

1. Write `status="in_progress"` before dispatch or local execution.
2. Give one owner the task, scene-setting context, applicable rules, implementation baseline,
   effective assurance, and commit posture.
3. The owner reads first, searches for existing patterns, creates work-kind evidence, implements
   vertically at the same seam, runs focused checks, self-reviews, and reports a canonical result.
4. The controller inspects the attributable diff and command evidence; an agent summary cannot
   mint a verification receipt.
5. Map the result through `references/subagent-statuses.md`, update the task status, update the
   index row, and log only drift, escalation, deviations, legacy normalization, dirty-path
   decisions, or other non-obvious choices.
6. Create the proposed coherent commit only when commit authority exists.

Progress summaries are informational and never wait on a fixed cadence.

Apply the work-kind evidence matrix in `references/testing-patterns.md`; do not restate or
reinterpret it locally.

Run the focused test after meaningful red/green cycles. At stable slice boundaries, run affected
package type, lint, and boundary checks. Before an authorized commit, run scoped non-mutating
checks. Do not run broad workspace gates per slice.

### Result handling

- `DONE` and resolved/accepted `DONE_WITH_CONCERNS` become `done`.
- `NEEDS_CONTEXT` and `AUTH_GATE` remain `in_progress`; change conditions and redispatch the same task.
- Only irrecoverable `BLOCKED` becomes `blocked` and rolls the plan to `BLOCKED`.

For interrupted `in_progress` work, inspect declared paths, implementation baseline, last coherent
commit, decision log, and attributable diff. Re-run focused evidence before continuing. Never
assume completion or discard the diff.

## 4. Human and external-action gates

Use `checkpoint:verify` for subjective judgment and `checkpoint:decide` for unresolved direction.
Authentication creates a dynamic `checkpoint:action`: verify auth, then redispatch the same task.

Read-only deployment checks may be automatic. Any external mutation or destructive command needs
authority in the current request or a dynamic action checkpoint immediately before execution.
Missing mutation consent is `NEEDS_CONTEXT`, not an authentication failure. `AUTH_GATE` is
reserved for credentials or authorization errors encountered while performing an already
authorized action.
Unattended instructions suppress routine waits only; they never bypass these gates.

For UI slices, consume the feature spec, existing project pattern, or supplied visual source.
When a required visual decision has no source, request direction; do not invent independent
visual direction.

## 5. Regenerate and review the attributable implementation

After all slices are built:

1. Regenerate required packaging/generated artifacts from root sources.
2. Capture one review target from the implementation base through current HEAD plus attributable
   worktree changes, excluding unchanged pre-existing dirty paths.
3. Run `spec-reviewer` and `code-reviewer` in parallel against that same target.
4. Guarded work adds the relevant security, data, performance, Mastra, or product/browser
   specialist and rechecks Guarded signals against the actual diff.
5. Return findings to an implementation owner, fix root sources, regenerate artifacts, and rerun
   both axes. Rerun affected specialists when their scope changes.

Any in-scope source, test, documentation, configuration, or generated change invalidates both
whole-implementation axes.

## 6. Fresh closeout gate

After final review fixes and regeneration, run one fresh repository verification set on the
unchanged target. Run a separate production build once when applicable and not already part of
that set. Run targeted E2E/browser/smoke checks only when the feature or Guarded risk justifies them.

A failed closeout command may be fixed and rerun. Any in-scope fix returns through both review
axes before the next planned green closeout attempt.

Record a session-local verification receipt using `references/implementation-assurance.md`.
Immediate completion/branch workflows may reuse it only while the exact command, cwd, HEAD,
configuration, and attributable fingerprint remain unchanged in the same uninterrupted session.
After the gate succeeds, persist `Closeout: passed` with the date, target fingerprint, and exact
commands in `## Implementation state`. The marker records that closeout occurred but never
substitutes for a valid session-local receipt.

## 7. Close plan and offer shipping

Set the plan `DONE` only when every durable task is done and the fresh closeout target passes.
Update only the owned index row and `Last touched`. Report the attributable files, evidence,
review axes, specialist results, and closeout commands.

Ask how the user wants to ship: push and open a PR, keep authorized commits local, or stop here.
Never push or open a PR without explicit authority.

</process>

<success_criteria>

- Planned/effective assurance and rationale are explicit.
- Implementation baseline and pre-existing dirty paths are captured.
- Every slice has one owner and evidence appropriate to its kind.
- Durable state and resumption follow the shared lifecycle.
- No routine fixed-cadence wait or broad per-slice workspace gate occurs.
- Generated artifacts precede whole-implementation review.
- Both review axes approve the exact final attributable target; Guarded specialists approve their scope.
- One fresh repository gate passes after review fixes.
- Commits, push, and PR actions have explicit authority.

</success_criteria>
