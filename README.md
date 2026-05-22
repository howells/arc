<p align="center">
  <img alt="Arc" src="./assets/logo-light.svg#gh-light-mode-only" width="48" height="48">
  <img alt="Arc" src="./assets/logo-dark.svg#gh-dark-mode-only" width="48" height="48">
</p>

<h1 align="center">Arc</h1>

<br>

The full arc from idea to shipped code.

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code): install as a plugin and run `/arc:*` commands in Claude.
- Codex: this repo includes `.agents/skills` so the same `skills/*/SKILL.md` workflows can run directly in Codex (no Claude plugin install required).

Arc's canonical product definition and domain language live in [CONTEXT.md](./CONTEXT.md). This README is a user-facing summary.

## What It Does

Arc provides skills covering the complete development lifecycle:

```
ENTRY   /arc:go       - Main entry point, routes to right workflow
          ↓
WHY     /arc:vision     - High-level goals (500-700 words)
          ↓
WHAT    /arc:ideate     - From idea to design doc
          ↓
DO      /arc:implement  - Plan + execute with TDD
        /arc:design     - UI/UX design with wireframes, reusable UI patterns, and critique
        /arc:testing    - Test strategy and execution
        /arc:launch     - Go-live checklist

CROSS-CUTTING
        /arc:review     - Review a plan, spec, design, or approach
        /arc:audit      - Comprehensive codebase audit (includes hygiene)
        /arc:refactor   - Find structural refactoring opportunities
        /arc:browse     - Rendered app evaluation through an expert persona
        /arc:document   - Feature documentation
        /arc:suggest    - Project-local next-step triage
        /arc:responsive  - Mobile responsive audit & fix
        /arc:seo        - Deep SEO audit for web projects

TOOLS   /arc:commit     - Smart commit + push with auto-splitting
```

Arc also ships a small bootstrap skill, `using-arc`, which acts as the control plane for
session start. It keeps startup context small and routes into the richer workflows only
when they clearly apply.

## Key Principles

Arc's principles are defined in [CONTEXT.md](./CONTEXT.md). In short: keep the lifecycle visible, ask one focused question at a time, use TDD and verification for implementation work, weave review through the process, and keep specialist checks Arc-native.

## Install

### Claude Code (recommended)

```
claude plugins install arc@howells
```

Installs the full plugin: skills, agents, commands, references, and disciplines. This is the complete Arc experience — skills can dispatch specialized subagents, track tasks, and chain workflows together.

### Any agent (via skills.sh)

```bash
npx skills add howells/arc
```

Installs skill prompts to Claude Code, Codex, Cursor, Gemini CLI, Windsurf, Cline, and [40+ agents](https://github.com/vercel-labs/skills#supported-agents). This only copies `SKILL.md` files — you get the skill instructions but not the supporting agents or orchestration that power the full workflow.

## Install Modes

Arc has two support tiers. Pick the one that matches the workflows you want:

| Install mode | Claude plugin | Codex installer | `skills.sh` / prompt-only |
|---|---|---|---|
| Includes full Arc bundle (`agents/`, `references/`, `disciplines/`, `templates/`, `scripts/`) | Yes | Yes | No |
| Best for full-runtime workflows like `audit`, `review`, `implement`, `design`, `document`, `testing` | Yes | Yes | No |
| Best for lightweight prompt-only routing and simple workflows | Yes | Yes | Yes |

If a skill tells the agent to load Arc-owned files such as `agents/`, `references/`, `disciplines/`, `templates/`, or `scripts/`, treat that skill as **full-runtime**. Use the Claude plugin install or the Codex installer for those workflows.

### Codex

Codex discovers skills from `~/.agents/skills` (legacy `~/.codex/skills` still works, and repo-local `.agents/skills` is also discovered).

**Recommended (install once, use anywhere):**

Run:

```bash
curl -fsSL https://raw.githubusercontent.com/howells/arc/main/.codex/install.sh | bash -s -- --auto-update --interval-hours 6
```

Install once without auto-update:

```bash
curl -fsSL https://raw.githubusercontent.com/howells/arc/main/.codex/install.sh | bash
```

## Using In Codex

### Install Once (Recommended)

Follow `.codex/INSTALL.md` (or run the one-line installer above) for the supported Codex install, then invoke Arc skills in any project.

This is the **full-runtime** Codex install. It clones the Arc repo to `~/.codex/arc`, installs direct skill entries under `~/.codex/skills` for Codex Desktop discovery, and mirrors them into `~/.agents/skills` for compatibility. Workflows that need bundled agents, references, disciplines, templates, and scripts work the same way they do in Claude Code.

### Repo-Local (Project Skills)

If you open this repo itself in Codex, it includes `.agents/skills/*` symlinks so Codex can discover the skills without a global install.

### Invoking Skills

Invoke skills explicitly (recommended):
- In Codex, use `$<skill-name>`. Claude's `/arc:*` slash commands do not apply in Codex.
- In CLI/IDE: run `/skills` or type `$` to pick a skill
- In the Codex app: type `$<skill-name>` in chat

```
$go
$audit
$browse as a first-time user
$ideate add user authentication with magic links
$design polish the dashboard hierarchy
$implement
```

Codex loads the selected skill’s `SKILL.md` and follows its workflow. On supported
platforms, Arc also injects `using-arc` at session start so skill routing is consistent
without preloading the whole system.

Common Codex entry points:
- `$go`
- `$audit`
- `$browse`
- `$ideate`
- `$design`
- `$implement`
- `$review`
- `$testing`
- `$deps`

### Codex Notes

- These skills are stored in `skills/<name>/SKILL.md` for Claude Code; `.agents/skills/<name>` is a symlink to the same folder so Codex can discover them.
- The supported install exposes Arc as direct skill entries like `~/.codex/skills/audit`, `~/.codex/skills/ideate`, and `~/.codex/skills/design`.
- Arc also mirrors those links into `~/.agents/skills/*` because some Codex environments still surface home-local skills from that compatibility root.
- Some skills reference Claude-specific tooling (e.g. `TaskList`, `mcp__claude-in-chrome__*`). In Codex, use the closest equivalent:
  - terminal exploration instead of `Task` blocks
  - `agent-browser` first, then Playwright, instead of Claude-in-Chrome MCP
  - WireText MCP for wireframes when available; otherwise inline ASCII wireframes
- Prompt-only installs copied via `skills.sh` are best-effort. They do not include Arc's bundled `agents/`, `references/`, `disciplines/`, `templates/`, or `scripts/`, so full-runtime workflows should upgrade to the Codex installer or Claude plugin before running.

## Claude Code Dependencies (Optional)

Arc uses these plugins and MCP integrations for enhanced functionality:

| Integration | Used by |
|-------------|---------|
| **Figma** | `/arc:ideate`, `/arc:implement`, `/arc:design` |
| **Context7** | research and implementation workflows |
| **Claude in Chrome** | `/arc:design`, `/arc:responsive`, `/arc:browse`, `designer` review |
| **WireText MCP** | `/arc:design`, `/arc:ideate` wireframing |
| **agent-browser** | browser automation fallback outside Claude Code |

```
# Official plugins
/plugin install figma@claude-plugins-official
/plugin install context7@claude-plugins-official

# Chrome extension: https://chromewebstore.google.com/detail/claude-in-chrome/
```

Chrome remains the preferred rendered-browser verification path in Claude Code. Arc works without these integrations, but relevant features will fall back to `agent-browser`, Playwright, user screenshots, or inline wireframes depending on the workflow.

**Note:** Arc maintains an activity log (`.arc/log.md`, gitignored) for knowledge persistence across sessions. Every skill auto-appends a brief entry on completion.

### Optional: Vercel Labs Plugins

These plugins provide additional review capabilities:

| Plugin | Skill | Used by |
|--------|-------|---------|
| **[agent-skills](https://github.com/vercel-labs/agent-skills)** | `vercel-react-best-practices` | `/arc:implement`, `/arc:launch` |
| | `vercel-composition-patterns` | `/arc:implement`, `/arc:design` |
| | `vercel-react-native-skills` | `/arc:implement`, `/arc:launch`, `/arc:responsive` |
| **[web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines)** | `web-design-guidelines` | `/arc:design`, `/arc:implement`, `/arc:responsive` |

```
# Vercel Labs plugins (optional)
/plugin marketplace add vercel-labs/agent-skills
/plugin install agent-skills@vercel-labs-agent-skills

/plugin marketplace add vercel-labs/web-interface-guidelines
/plugin install web-interface-guidelines@vercel-labs-web-interface-guidelines
```

These plugins are optional and outside Arc's product definition. Arc workflows should remain self-contained when they are not installed.

## Getting Started

### Claude Code

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
- Claude asks if you want to continue to `/arc:implement` (plan and build)
- Implementation creates its own plan, then executes with TDD

You can also jump in at any point if you already have docs.

### Codex

1. Open your project in Codex.
2. Ensure `.agents/skills` is present (see ["Using In Codex"](#using-in-codex)).
3. Run skills in chat, e.g. `$start` or `$ideate ...`.

### Quick Examples

```bash
# Design a new feature (full flow)
/arc:ideate add a notification system

# Get suggestions for what to work on
/arc:suggest

# Evaluate a rendered app experience
/arc:browse as a designer

# Launch / go live
/arc:launch
```

### Tips for Newcomers

- **One question at a time** — Arc asks focused questions, not overwhelming lists
- **You're in control** — Suggestions are questions, not mandates. Say no if you disagree.
- **TDD by default** — Implementation writes tests first, then code
- **Documents are created** — Arc specs and plans go in `docs/arc/`, features in `docs/features/`

## Primary Flow

The main entry point is `/arc:ideate`, which flows through to implementation:

```
/arc:ideate → /arc:implement
```

Each step asks if you want to continue. You can also enter at any point:
- Have a design doc already? Start at `/arc:implement`
- Have an implementation plan? `/arc:implement` will use it

## Commands

| Command | When to use | Output |
|---------|-------------|--------|
| `/arc:go` | Main entry point, routes to workflow | Context-aware guidance |
| `/arc:vision` | Starting a new project | `docs/vision.md` |
| `/arc:ideate` | From idea to design doc | `docs/arc/specs/YYYY-MM-DD-<feature>-design.md` |
| `/arc:implement` | Scope-aware plan + execute with TDD | Code changes |
| `/arc:design` | UI/UX work | Wireframes + code |
| `/arc:testing` | Test strategy | Test files |
| `/arc:launch` | Launch / go live | Public URL readiness |
| `/arc:review` | Review a plan, spec, design, or approach | Updated plan file |
| `/arc:audit` | Comprehensive codebase audit | `docs/audits/YYYY-MM-DD-*.md` |
| `/arc:refactor` | Find structural refactoring opportunities | Refactor RFC / issue |
| `/arc:browse` | Evaluate rendered app experience through an expert persona | `docs/arc/browse/YYYY-MM-DD-*.md` |
| `/arc:document` | Document features | `docs/features/<feature>.md` |
| `/arc:suggest` | Project-local next-step triage | Recommendations |
| `/arc:commit` | Commit and push changes | Git commits |
| `/arc:responsive` | Mobile responsive audit & fix | Responsive code changes |
| `/arc:seo` | Deep SEO audit for web projects | `docs/audits/YYYY-MM-DD-seo.md` |

## Agents

Arc includes specialized agents across research, review, build, design, and workflow roles:

| Category | Agents |
|----------|--------|
| **Research** | docs-researcher, git-history-analyzer |
| **Review** | architecture-engineer, daniel-product-engineer, data-engineer, designer, lee-nextjs-engineer, performance-engineer, security-engineer, senior-engineer, seo-engineer, accessibility-engineer, test-quality-engineer |
| **Build** | implementer, fixer, debugger, ui-builder, figma-builder, design-specifier, unit-test-writer, integration-test-writer, e2e-test-writer, test-runner, e2e-runner, spec-reviewer, code-reviewer |
| **Workflow** | spec-flow-analyzer, e2e-test-runner, docs-writer, spec-document-reviewer, plan-document-reviewer |

## Disciplines

Implementation methodologies in `disciplines/`:

- **test-driven-development** — Red-green-refactor cycle
- **systematic-debugging** — Methodical bug investigation
- **verification-before-completion** — Prove it works before claiming done
- **finishing-a-development-branch** — Cleanup after work complete
- **subagent-driven-development** — Parallel agent execution
- **dispatching-parallel-agents** — Efficient multi-agent coordination
- **receiving-code-review** — Handling review feedback

## Interop

Commands work together:

- `/arc:suggest` reads project-local signals: current plans, progress, TODOs, failing checks, recent commits, and `/arc:vision`
- `/arc:ideate` flows to `/arc:implement` (which creates plans internally)
- `/arc:implement` scales from quick fixes to full plan-driven execution
- `/arc:launch` records whether `/arc:testing`, `/arc:audit`, `/arc:seo`, and `/arc:responsive` are done, missing, or intentionally deferred
- Claude Code uses TaskList for in-session task tracking.

### Linear Integration (Optional)

For complex projects, Arc integrates with Linear via MCP for issue tracking:

```json
// .mcp.json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@anthropic/linear-mcp"]
    }
  }
}
```

When Linear MCP is available, `/arc:audit` can create issues from findings.

## Acknowledgments

Arc builds on patterns and disciplines from:

- [superpowers](https://github.com/chadgauth/superpowers) — Implementation disciplines (TDD, debugging, verification)
- [compound-engineering](https://github.com/minuva/compound-engineering) — Agent patterns and workflows

## License

MIT
