---
name: arc
description: Complete development lifecycle from vision to shipped code. Covers ideation, design, implementation, testing, and production readiness.
---

# Arc

The full arc from idea to shipped code.

## Command Hierarchy

```
WHY     /arc:vision     - High-level goals (500-700 words)
          ↓
WHAT    /arc:ideate     - From idea to working implementation
          ↓
HOW     /arc:detail     - Detailed implementation plan
          ↓
DO      /arc:implement  - Execute the plan with TDD
        /arc:design     - UI/UX design with wireframes
        /arc:build      - Quick build (no formal plan)
        /arc:test       - Test strategy and execution
        /arc:letsgo     - Production readiness checklist
        /arc:deslop     - Remove LLM artifacts

CROSS-CUTTING
        /arc:review     - Review a plan for feasibility
        /arc:tasklist   - Persistent task backlog
        /arc:document   - Feature documentation
        /arc:suggest    - Opinionated next-step recommendations

TOOLS   /arc:commit     - Smart commit + push with auto-splitting
```

## Primary Flow

The main entry point is `/arc:ideate`, which can flow all the way through:

```
/arc:ideate → /arc:detail → /arc:implement
```

Each step asks if the user wants to continue to the next. The user can also enter at any point:
- Have a design doc already? Start at `/arc:detail`
- Have an implementation plan? Start at `/arc:implement`

## Quick Reference

| Command | When to use | Output location |
|---------|-------------|-----------------|
| /arc:vision | Starting a new project | `docs/arc:vision.md` |
| /arc:ideate | From idea to working implementation | `docs/plans/YYYY-MM-DD-<feature>.md` |
| /arc:detail | Create implementation plan | `docs/plans/YYYY-MM-DD-<feature>-impl.md` |
| /arc:implement | Execute a plan | Code changes |
| /arc:design | UI/UX work | Wireframes + code |
| /arc:build | Quick implementation | Code changes |
| /arc:test | Test strategy | Test files |
| /arc:letsgo | Ship to production | Deployment |
| /arc:deslop | Clean LLM artifacts | Code cleanup |
| /arc:review | Review a plan | Updated plan file |
| /arc:tasklist | Manage backlog | `docs/arc:tasklist.md` |
| /arc:document | Document features | `docs/features/<feature>.md` |
| /arc:suggest | What to work on next | Recommendations |
| /arc:commit | Commit and push changes | Git commits |

## Routing

Commands are handled by workflows in `workflows/`:

| Command | Workflow |
|---------|----------|
| /arc:vision | `workflows/arc:vision.md` |
| /arc:ideate | `workflows/arc:ideate.md` |
| /arc:detail | `workflows/arc:detail.md` |
| /arc:implement | `workflows/arc:implement.md` |
| /arc:design | `workflows/arc:design.md` |
| /arc:build | `workflows/arc:build.md` |
| /arc:test | `workflows/arc:test.md` |
| /arc:letsgo | `workflows/arc:letsgo.md` |
| /arc:deslop | `workflows/arc:deslop.md` |
| /arc:review | `workflows/arc:review.md` |
| /arc:tasklist | `workflows/arc:tasklist.md` |
| /arc:document | `workflows/arc:document.md` |
| /arc:suggest | `workflows/arc:suggest.md` |
| /arc:commit | `workflows/arc:commit.md` |

Supporting workflows:
- `workflows/expert-review.md` - Parallel expert review (used by `/arc:ideate` and `/arc:review`)
- `workflows/quick-validation.md` - Fast sanity check

## Essential Principles

**Review is woven throughout, not bolted on at the end.**
Design incrementally → Validate each section → Review findings inform next section

**Reviewers advise, the user decides.**
Present reviewer input as recommendations. The user knows their domain.

**One question at a time.**
Don't overwhelm. Prefer multiple choice when possible.

**YAGNI where appropriate.**
Suggest simplifications, but don't force them.

**TDD for implementation.**
Write tests first, then make them pass. See `disciplines/arc:test-driven-development.md`.

## Reviewer Selection

Select reviewers based on detected project type. Use local agent definitions in `agents/arc:review/`.

See `references/model-strategy.md` for which AI model to use for different tasks (haiku for mechanical, sonnet for review, opus for creative/arc:design).

**Daniel's projects (detected by `@materia/` imports or `.ruler/` directory):**
- `agents/arc:review/daniel-reviewer.md`
- `agents/arc:review/code-simplicity-reviewer.md`

**TypeScript/React projects:**
- `agents/arc:review/daniel-reviewer.md`
- `agents/arc:review/senior-reviewer.md`
- `agents/arc:review/architecture-strategist.md`

**Next.js projects:**
- `agents/arc:review/lee-nextjs-reviewer.md`
- `agents/arc:review/daniel-reviewer.md`
- `agents/arc:review/senior-reviewer.md`

**Python projects:**
- `agents/arc:review/senior-reviewer.md`
- `agents/arc:review/performance-oracle.md`
- `agents/arc:review/architecture-strategist.md`

**General/Unknown:**
- `agents/arc:review/senior-reviewer.md`
- `agents/arc:review/architecture-strategist.md`
- `agents/arc:review/code-simplicity-reviewer.md`

**Specialized agents:**
- `agents/arc:review/security-sentinel.md` — Security audits
- `agents/arc:review/data-integrity-guardian.md` — Database/migration reviews
- `agents/research/git-history-analyzer.md` — Git archaeology
- `agents/research/duplicate-detector.md` — Find semantic code duplication
- `agents/arc:design/figma-implement.md` — Implement UI from Figma designs
- `agents/workflow/spec-flow-analyzer.md` — Spec analysis

## Directory Structure

```
skills/arc/
├── SKILL.md              # This file - routing and principles
├── workflows/            # Command implementations
│   ├── vision.md
│   ├── ideate.md
│   ├── detail.md
│   ├── implement.md
│   ├── design.md
│   ├── figma.md
│   ├── build.md
│   ├── test.md
│   ├── letsgo.md
│   ├── deslop.md
│   ├── tasklist.md
│   ├── document.md
│   ├── suggest.md
│   ├── expert-review.md
│   └── quick-validation.md
├── agents/               # Specialized reviewers and researchers
│   ├── review/
│   ├── research/
│   ├── design/
│   └── workflow/
├── disciplines/          # Implementation methodologies
│   ├── test-driven-development.md
│   ├── systematic-debugging.md
│   ├── verification-before-completion.md
│   └── ...
├── references/           # Domain knowledge
│   ├── design-phases.md
│   ├── testing-patterns.md
│   ├── task-granularity.md
│   ├── model-strategy.md   # Which AI model for which task
│   └── ...
└── templates/            # Output templates
```

## Interop

Commands work together:

- `/arc:suggest` reads `/arc:tasklist`, codebase, and `/arc:vision` (priority cascade)
- `/arc:ideate` can flow to `/arc:detail` → `/arc:implement`
- `/arc:review` uses `workflows/expert-review.md` to review Claude Code plans or plans from `docs/plans/`
- `/arc:build` suggests `/arc:ideate` if scope is too large
- `/arc:letsgo` runs `/arc:test` and `/arc:deslop` as part of quality checks
- `/arc:implement` follows `disciplines/arc:test-driven-development.md`
- Any command can add to `/arc:tasklist`

## Knowledge Loop

```
vision → ideate → detail → implement → encounter problem → solve → document
   ↑                                                                   |
   └───────────────────────────────────────────────────────────────────┘
                    informs future design sessions
```

When starting `/arc:ideate`, episodic-memory searches `docs/` to surface past learnings.
