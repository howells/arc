<p align="center">
  <img alt="Arc" src="./assets/logo-light.svg#gh-light-mode-only" width="48" height="48">
  <img alt="Arc" src="./assets/logo-dark.svg#gh-dark-mode-only" width="48" height="48">
</p>

<h1 align="center">Arc</h1>

<br>

The full arc from idea to shipped code. A [Claude Code](https://docs.anthropic.com/en/docs/claude-code) plugin.

## What It Does

Arc provides 15 commands covering the complete development lifecycle:

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
| **Figma** | `/arc:ideate`, `/arc:detail`, `/arc:figma` |
| **Context7** | `/arc:implement` |
| **Episodic Memory** | `/arc:ideate`, `/arc:document` |
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

### Optional: Vercel Labs Plugins

These plugins provide additional review capabilities:

| Plugin | Skill | Used by |
|--------|-------|---------|
| **[agent-skills](https://github.com/vercel-labs/agent-skills)** | `vercel-react-best-practices` | `/arc:implement`, `/arc:build`, `/arc:letsgo` |
| **[web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines)** | `web-design-guidelines` | `/arc:design`, `/arc:implement` |

```
# Vercel Labs plugins (optional)
/plugin marketplace add vercel-labs/agent-skills
/plugin install agent-skills@vercel-labs-agent-skills

/plugin marketplace add vercel-labs/web-interface-guidelines
/plugin install web-interface-guidelines@vercel-labs-web-interface-guidelines
```

When installed, Arc commands will automatically use these skills for React/Next.js performance reviews and UI compliance checks.

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
/arc:ideate add user authentication with magic links
```

Claude will ask clarifying questions, explore your codebase, and create a design document.

### 3. Follow the flow

Arc commands chain together. After `/arc:ideate` creates a design:
- Claude asks if you want to continue to `/arc:detail` (implementation plan)
- Then to `/arc:implement` (write the code with TDD)

You can also jump in at any point if you already have docs.

### Quick Examples

```bash
# Design a new feature (full flow)
/arc:ideate add a notification system

# Quick build without formal planning
/arc:build add a logout button to the header

# Get suggestions for what to work on
/arc:suggest

# Ship to production
/arc:letsgo
```

### Tips for Newcomers

- **One question at a time** — Arc asks focused questions, not overwhelming lists
- **You're in control** — Suggestions are questions, not mandates. Say no if you disagree.
- **TDD by default** — Implementation writes tests first, then code
- **Documents are created** — Plans go in `docs/plans/`, features in `docs/features/`

## Primary Flow

The main entry point is `/arc:ideate`, which can flow all the way through:

```
/arc:ideate → /arc:detail → /arc:implement
```

Each step asks if you want to continue. You can also enter at any point:
- Have a design doc already? Start at `/arc:detail`
- Have an implementation plan? Start at `/arc:implement`

## Commands

| Command | When to use | Output |
|---------|-------------|--------|
| `/arc:vision` | Starting a new project | `docs/vision.md` |
| `/arc:ideate` | From idea to working implementation | `docs/plans/YYYY-MM-DD-<feature>.md` |
| `/arc:detail` | Create implementation plan | `docs/plans/YYYY-MM-DD-<feature>-impl.md` |
| `/arc:implement` | Execute a plan | Code changes |
| `/arc:design` | UI/UX work | Wireframes + code |
| `/arc:figma` | Implement from Figma | Code matching design |
| `/arc:build` | Quick implementation | Code changes |
| `/arc:test` | Test strategy | Test files |
| `/arc:letsgo` | Ship to production | Deployment |
| `/arc:deslop` | Clean LLM artifacts | Code cleanup |
| `/arc:review` | Review a plan for feasibility | Updated plan file |
| `/arc:tasklist` | Manage backlog | `docs/tasklist.md` |
| `/arc:document` | Document features | `docs/features/<feature>.md` |
| `/arc:suggest` | What to work on next | Recommendations |
| `/arc:commit` | Commit and push changes | Git commits |

## Agents

Arc includes 14 specialized agents:

| Category | Agents |
|----------|--------|
| **Research** | framework-docs-researcher, git-history-analyzer, duplicate-detector |
| **Review** | architecture-strategist, code-simplicity-reviewer, daniel-reviewer, data-integrity-guardian, lee-nextjs-reviewer, performance-oracle, security-sentinel, senior-reviewer |
| **Design** | figma-implement |
| **Workflow** | spec-flow-analyzer, e2e-test-runner |

## Disciplines

Implementation methodologies in `disciplines/`:

- **test-driven-development** — Red-green-refactor cycle
- **systematic-debugging** — Methodical bug investigation
- **verification-before-completion** — Prove it works before claiming done
- **using-git-worktrees** — Isolated development branches
- **subagent-driven-development** — Parallel agent execution

## Interop

Commands work together:

- `/arc:suggest` reads `/arc:tasklist`, codebase, and `/arc:vision` (priority cascade)
- `/arc:ideate` can flow to `/arc:detail` → `/arc:implement`
- `/arc:build` suggests `/arc:ideate` if scope is too large
- `/arc:letsgo` runs `/arc:test` and `/arc:deslop` as part of quality checks
- Any command can add to `/arc:tasklist`

## Acknowledgments

Arc builds on patterns and disciplines from:

- [superpowers](https://github.com/chadgauth/superpowers) — Implementation disciplines (TDD, debugging, verification)
- [compound-engineering](https://github.com/minuva/compound-engineering) — Agent patterns and workflows

## License

MIT
