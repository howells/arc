# Model Strategy for Agents

**Always specify a model when spawning agents.** This optimizes cost and speed without sacrificing quality where it matters.

## Quick Reference

| Task Type                                         | Model  | Why                                         |
| ------------------------------------------------- | ------ | ------------------------------------------- |
| Explore codebase                                  | haiku  | Pattern matching, file finding              |
| Run TS/lint checks (fixer)                        | haiku  | Mechanical error fixing                     |
| Run test suites (test-runner)                     | haiku  | Execute + parse output                      |
| Whole-implementation standards (code-reviewer)    | sonnet | Boundaries, conventions, effective evidence |
| Code review (all review agents)                   | sonnet | Needs domain judgment                       |
| Debug failing tests (debugger)                    | sonnet | Requires reasoning                          |
| Security/performance analysis                     | sonnet | Pattern recognition + context               |
| Whole-implementation spec (spec-reviewer)         | sonnet | Requirements, wiring, scope, completeness   |
| Write unit tests (unit-test-writer)               | sonnet | Behavior coverage, edge cases               |
| Write integration tests (integration-test-writer) | sonnet | Cross-boundary flows, MSW mocking           |
| Spec flow analysis (spec-flow-analyzer)           | sonnet | User-journey mapping + gap reasoning        |
| Plan doc review (plan-document-reviewer)          | sonnet | Structural pre-validation                   |
| Spec doc review (spec-document-reviewer)          | sonnet | Completeness + YAGNI judgment               |
| Docs research (docs-researcher)                   | sonnet | Synthesizing library docs                   |
| Git history analysis (git-history-analyzer)       | sonnet | Archaeological reasoning over commits       |
| Implementation (implementer)                      | opus   | Production code quality matters most        |
| E2E tests (e2e-test-writer + e2e-runner)          | opus   | Complex user flows, flaky test diagnosis    |

## Model Tiers

| Model      | Cost     | Use Case                                                     |
| ---------- | -------- | ------------------------------------------------------------ |
| **haiku**  | Cheapest | Mechanical tasks, simple checks, pattern matching            |
| **sonnet** | Balanced | Code review, debugging, moderate reasoning                   |
| **opus**   | Premium  | Creative decisions, complex architecture, aesthetic judgment |

## Task Allocation

### Haiku (fast, cheap)

- TypeScript error fixing
- Lint/format checks
- Running test suites
- Simple file operations
- Pattern-based fixes

```
Task general-purpose model: haiku: "Run tsc --noEmit and fix errors"
```

### Sonnet (balanced)

- All review agents (architecture, security, performance, etc.)
- Debugging failing tests
- Spec compliance checks
- Writing unit and integration tests
- Research agents (docs, git history)

```
Task debugger model: sonnet: "Debug failing test..."
Task senior-engineer model: sonnet: "Review this code..."
```

### Opus (full power)

- Implementation (production code)
- E2E test writing and running

```
Task implementer model: opus: "Implement [feature]..."
Task e2e-test-writer model: opus: "Write E2E tests for [flow]..."
```

## Rationale

**Why not opus everywhere?**

- Cost: Opus is ~10-20x more expensive than haiku
- Speed: Haiku responds faster for simple tasks
- Diminishing returns: Mechanical tasks don't benefit from more intelligence

**Why not haiku everywhere?**

- Quality: Code review needs nuanced judgment
- Context: Debugging requires reasoning across multiple files
- Creativity: Design work needs aesthetic sensibility

**Why sonnet is the default for reviews?**

- Hits the sweet spot for code analysis
- Understands patterns and anti-patterns well
- Cost-effective for multiple parallel reviewers

## When to Override

Use `model: inherit` when you want the agent to match the parent conversation's model. Useful when:

- User is already on opus and wants consistent quality
- Testing with a specific model
