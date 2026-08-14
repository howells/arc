# Arc Reference Index

Every Arc reference, grouped by what you'd be doing when you need it. Load a file when the
active task actually needs it — do not read this tree up front.

Skills cite the references they routinely need directly. Use this index for the other case:
you need background and can't name the file.

## Workflow & Planning

| Reference                                                  | Use when                                             |
| ---------------------------------------------------------- | ---------------------------------------------------- |
| [arc-paths.md](arc-paths.md)                               | Deciding where an Arc artifact belongs on disk       |
| [plan-lifecycle.md](plan-lifecycle.md)                     | Managing plan status, resumption, and the plan index |
| [task-granularity.md](task-granularity.md)                 | Sizing tasks and writing plan XML                    |
| [implementation-assurance.md](implementation-assurance.md) | Choosing an assurance tier and verification receipt  |
| [checkpoint-patterns.md](checkpoint-patterns.md)           | Placing checkpoints in a long execution              |
| [question-loops.md](question-loops.md)                     | Running a one-question-at-a-time interview           |
| [platform-tools.md](platform-tools.md)                     | Mapping Claude tool names onto Codex or Cursor       |

## Review & Audit

| Reference                                                | Use when                                                        |
| -------------------------------------------------------- | --------------------------------------------------------------- |
| [audit-scorecard.md](audit-scorecard.md)                 | Scoring the 7 codebase-health axes                              |
| [audit-stage-calibration.md](audit-stage-calibration.md) | Calibrating severity to project stage                           |
| [audit-detection.md](audit-detection.md)                 | Detecting project scale, lifecycle stage, and the security gate |
| [audit-signals.md](audit-signals.md)                     | Running the Phase 1 mechanical scan passes                      |
| [audit-reviewer-rules.md](audit-reviewer-rules.md)       | Choosing which coding rules each reviewer receives              |
| [audit-reviewer-prompts.md](audit-reviewer-prompts.md)   | Composing reviewer dispatch prompts                             |
| [finding-vetting.md](finding-vetting.md)                 | Confirming a finding before reporting it                        |
| [maintainability-review.md](maintainability-review.md)   | Judging structural code health and file size                    |
| [code-smells.md](code-smells.md)                         | Establishing a shared review baseline                           |
| [diff-review-checklist.md](diff-review-checklist.md)     | Reviewing a diff before it lands                                |
| [review-patterns.md](review-patterns.md)                 | Turning findings into Socratic questions                        |
| [complexity-optimization.md](complexity-optimization.md) | Ranking algorithmic improvements by impact                      |
| [verification-patterns.md](verification-patterns.md)     | Detecting stubs and placeholder implementations                 |
| [launch-scorecard.md](launch-scorecard.md)               | Scoring go-live readiness                                       |
| [operations-playbook.md](operations-playbook.md)         | Remediating CI, env, and alerting gaps                          |

## Architecture & Frontend

| Reference                                            | Use when                                                |
| ---------------------------------------------------- | ------------------------------------------------------- |
| [architecture-patterns.md](architecture-patterns.md) | Judging module boundaries and system shape              |
| [component-design.md](component-design.md)           | Designing React component APIs                          |
| [react-audit-signals.md](react-audit-signals.md)     | Inspecting React/Next.js hotspots during audit          |
| [nextjs-app-router.md](nextjs-app-router.md)         | Working with App Router, RSC, and server-first patterns |
| [tanstack-query-trpc.md](tanstack-query-trpc.md)     | Wiring TanStack Query or tRPC data flow                 |
| [tanstack-table.md](tanstack-table.md)               | Building data tables with TanStack Table v8             |
| [prefetch-patterns.md](prefetch-patterns.md)         | Tuning navigation prefetch and perceived speed          |
| [authentication.md](authentication.md)               | Implementing auth flows (Clerk, WorkOS, sessions)       |
| [database-lifecycle.md](database-lifecycle.md)       | Judging migrations, journals, and backup posture        |

## Design & Interface

| Reference                                        | Use when                                           |
| ------------------------------------------------ | -------------------------------------------------- |
| [design-philosophy.md](design-philosophy.md)     | Establishing timeless visual direction             |
| [frontend-design.md](frontend-design.md)         | Applying the component checklist and anti-patterns |
| [ux-laws.md](ux-laws.md)                         | Reasoning about Fitts, Hick, and friends           |
| [interaction-physics.md](interaction-physics.md) | Tuning motion feel, easing, and responsiveness     |
| [animation-patterns.md](animation-patterns.md)   | Implementing deeper animation and motion systems   |
| [typography-opentype.md](typography-opentype.md) | Setting type scale and OpenType features           |
| [touch-targets.md](touch-targets.md)             | Sizing hit areas for touch and pointer input       |
| [ascii-ui-patterns.md](ascii-ui-patterns.md)     | Sketching layout as ASCII wireframes during design |
| [tailwind-v4.md](tailwind-v4.md)                 | Migrating to or authoring for Tailwind v4          |

See also `rules/interface/index.md` for the enforceable interface rules these references sit behind.

## Testing

| Reference                                            | Use when                                     |
| ---------------------------------------------------- | -------------------------------------------- |
| [testing-patterns.md](testing-patterns.md)           | Choosing test shape and evidence             |
| [testing-anti-patterns.md](testing-anti-patterns.md) | Diagnosing tests that pass but catch nothing |
| [llm-api-testing.md](llm-api-testing.md)             | Testing code that calls an LLM API           |

## Agents & Delegation

| Reference                                    | Use when                                            |
| -------------------------------------------- | --------------------------------------------------- |
| [subagent-safety.md](subagent-safety.md)     | Dispatching any subagent (prompt-injection defence) |
| [subagent-statuses.md](subagent-statuses.md) | Interpreting and propagating subagent status        |
| [model-strategy.md](model-strategy.md)       | Choosing a model tier per agent                     |
| [agent-teams.md](agent-teams.md)             | Composing a team with fallback behaviour            |
| [agent-evals.md](agent-evals.md)             | Building golden sets and evals for agents           |

Disciplines (methodologies rather than domain knowledge) live in `disciplines/`.
