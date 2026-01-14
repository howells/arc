<p align="center">
  <img alt="Arc" src="./assets/logo-light.svg#gh-light-mode-only" width="48" height="48">
  <img alt="Arc" src="./assets/logo-dark.svg#gh-dark-mode-only" width="48" height="48">
</p>

<h1 align="center">Arc</h1>

<br>

The full arc from idea to shipped code. A [Claude Code](https://docs.anthropic.com/en/docs/claude-code) plugin.

## What It Does

Arc provides 14 commands covering the complete development lifecycle:

```
WHY     /vision     - High-level goals (500-700 words)
          ↓
WHAT    /ideate     - Socratic exploration → PRD
          ↓
HOW     /detail     - Detailed implementation plan
          ↓
DO      /implement  - Execute the plan with TDD
        /design     - UI/UX design with wireframes
        /build      - Quick build (no formal plan)
        /test       - Test strategy and execution
        /letsgo     - Production readiness checklist
        /deslop     - Remove LLM artifacts

CROSS-CUTTING
        /tasklist   - Persistent task backlog
        /document   - Feature documentation
        /suggest    - Opinionated next-step recommendations

TOOLS   /commit     - Smart commit + push with auto-splitting
```

## Key Principles

- **Review is woven throughout, not bolted on at the end** — Each design section gets micro-reviewed before moving on
- **Reviewers advise, the user decides** — Suggestions are presented as questions, not mandates
- **One question at a time** — Never overwhelm with multiple questions
- **YAGNI where appropriate** — Simplifications suggested, but user has final say
- **TDD mandatory** — Tests first, implementation second
- **Frontend-design integrated** — Bold aesthetic direction, not generic AI slop

## Installation

```
/plugin marketplace add howells/arc
/plugin install arc@howells-arc
```

## Dependencies

Arc uses these plugins for enhanced functionality:

| Plugin | Used by |
|--------|---------|
| **Figma** | `/ideate`, `/detail`, `/figma` |
| **Context7** | `/implement` |
| **Episodic Memory** | `/ideate`, `/document` |
| **Chrome** | `figma-implement` agent |

```
# Official plugins
/plugin install figma@claude-plugins-official
/plugin install context7@claude-plugins-official

# Episodic memory (requires superpowers marketplace)
/plugin marketplace add obra/superpowers-marketplace
/plugin install episodic-memory@superpowers-marketplace

# Chrome extension: https://chromewebstore.google.com/detail/claude-in-chrome/
```

Arc works without these, but relevant features will be limited.

## Getting Started

If you're new to Claude Code, here's how Arc works:

### 1. Open your project

```bash
cd your-project
claude
```

This starts an interactive Claude Code session in your terminal.

### 2. Run a command

Commands start with `/`. Type the command and press Enter:

```
/ideate add user authentication with magic links
```

Claude will ask clarifying questions, explore your codebase, and create a design document.

### 3. Follow the flow

Arc commands chain together. After `/ideate` creates a design:
- Claude asks if you want to continue to `/detail` (implementation plan)
- Then to `/implement` (write the code with TDD)

You can also jump in at any point if you already have docs.

### Quick Examples

```bash
# Design a new feature (full flow)
/ideate add a notification system

# Quick build without formal planning
/build add a logout button to the header

# Get suggestions for what to work on
/suggest

# Ship to production
/letsgo
```

### Tips for Newcomers

- **One question at a time** — Arc asks focused questions, not overwhelming lists
- **You're in control** — Suggestions are questions, not mandates. Say no if you disagree.
- **TDD by default** — Implementation writes tests first, then code
- **Documents are created** — Plans go in `docs/plans/`, features in `docs/features/`

## Primary Flow

The main entry point is `/ideate`, which can flow all the way through:

```
/ideate → /detail → /implement
```

Each step asks if you want to continue. You can also enter at any point:
- Have a design doc already? Start at `/detail`
- Have an implementation plan? Start at `/implement`

## Commands

| Command | When to use | Output |
|---------|-------------|--------|
| `/vision` | Starting a new project | `docs/vision.md` |
| `/ideate` | Turn idea into design | `docs/plans/YYYY-MM-DD-<feature>.md` |
| `/detail` | Create implementation plan | `docs/plans/YYYY-MM-DD-<feature>-impl.md` |
| `/implement` | Execute a plan | Code changes |
| `/design` | UI/UX work | Wireframes + code |
| `/figma` | Implement from Figma | Code matching design |
| `/build` | Quick implementation | Code changes |
| `/test` | Test strategy | Test files |
| `/letsgo` | Ship to production | Deployment |
| `/deslop` | Clean LLM artifacts | Code cleanup |
| `/tasklist` | Manage backlog | `docs/tasklist.md` |
| `/document` | Document features | `docs/features/<feature>.md` |
| `/suggest` | What to work on next | Recommendations |
| `/commit` | Commit and push changes | Git commits |

## Agents

Arc includes 13 specialized agents:

| Category | Agents |
|----------|--------|
| **Research** | framework-docs-researcher, git-history-analyzer, duplicate-detector |
| **Review** | architecture-strategist, code-simplicity-reviewer, daniel-reviewer, data-integrity-guardian, lee-nextjs-reviewer, performance-oracle, security-sentinel, senior-reviewer |
| **Design** | figma-implement |
| **Workflow** | spec-flow-analyzer |

## Disciplines

Implementation methodologies in `skills/arc/disciplines/`:

- **test-driven-development** — Red-green-refactor cycle
- **systematic-debugging** — Methodical bug investigation
- **verification-before-completion** — Prove it works before claiming done
- **using-git-worktrees** — Isolated development branches
- **subagent-driven-development** — Parallel agent execution

## Interop

Commands work together:

- `/suggest` reads `/tasklist`, codebase, and `/vision` (priority cascade)
- `/ideate` can flow to `/detail` → `/implement`
- `/build` suggests `/ideate` if scope is too large
- `/letsgo` runs `/test` and `/deslop` as part of quality checks
- Any command can add to `/tasklist`

## Acknowledgments

Arc builds on patterns and disciplines from:

- [superpowers](https://github.com/chadgauth/superpowers) — Implementation disciplines (TDD, debugging, verification)
- [compound-engineering](https://github.com/minuva/compound-engineering) — Agent patterns and workflows

## License

MIT
