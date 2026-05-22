<p align="center">
  <img alt="Arc" src="./assets/logo-light.svg#gh-light-mode-only" width="48" height="48">
  <img alt="Arc" src="./assets/logo-dark.svg#gh-dark-mode-only" width="48" height="48">
</p>

<h1 align="center">Arc</h1>

<br>

The full arc from idea to shipped code.

Arc is a self-contained software development lifecycle for coding agents. It helps move work from early project clarity through ideation, implementation, review, testing, launch readiness, and clean commits.

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code): install as a plugin and run `/arc:*` commands.
- Codex: install Arc as skills or as a native Codex plugin, then invoke workflows with `$<skill-name>`.

Arc's canonical product definition and operating boundary live in [CONTEXT.md](./CONTEXT.md). This README is the user-facing guide.

## Workflow

```
WHY     /arc:vision     - Define the project's purpose, audience, and non-goals
          ↓
WHAT    /arc:ideate     - Turn an idea into a validated feature spec
          ↓
DO      /arc:implement  - Plan and build with TDD and verification
        /arc:testing    - Backfill safety-net tests around existing code
        /arc:launch     - Check go-live and shareability basics

REVIEW  /arc:review     - Review a plan, spec, or implementation approach
        /arc:audit      - Verify and audit current codebase health
        /arc:refactor   - Find structural friction and propose refactors

TOOLS   /arc:commit     - Create clean commits, optionally push and publish
```

`using-arc` and `detail` are supporting skills. They keep startup context small and create implementation plans, but they are not normally invoked directly.

## What Arc Is For

Arc owns the software development cycle:

- Clarify why the work matters.
- Shape ideas into concrete specs and implementation plans.
- Implement with tests, review checkpoints, and verification.
- Backfill characterization tests before risky changes to old code.
- Audit codebase health when you need a current-state report.
- Prepare a project to be visitable, shareable, and ready for a first real audience.
- Commit work in atomic, readable commits.

Arc deliberately does not own every adjacent specialist practice. Brand identity, visual design systems, dependency upgrade campaigns, deep SEO, AI framework guidance, generated documentation, browser QA, and machine/editor automation are better handled by dedicated tools. Arc may notice those concerns during implementation, review, audit, or launch, but its public workflow stays focused on software delivery.

## Install

### Claude Code

```bash
claude plugins install arc@howells
```

This installs the full Arc plugin: skills, slash commands, agents, references, disciplines, templates, scripts, and rules.

### Codex

Recommended full-runtime install:

```bash
curl -fsSL https://raw.githubusercontent.com/howells/arc/main/.codex/install.sh | bash -s -- --auto-update --interval-hours 6
```

Install once without auto-update:

```bash
curl -fsSL https://raw.githubusercontent.com/howells/arc/main/.codex/install.sh | bash
```

The Codex installer clones Arc to `~/.codex/arc`, exposes direct skills under `~/.codex/skills`, and mirrors them into `~/.agents/skills` for compatibility.
Arc also includes `.codex-plugin/plugin.json` for native Codex plugin hosts that install from plugin manifests.

### Prompt-Only Install

```bash
npx skills add howells/arc
```

This copies `SKILL.md` prompts to supported agents. It is useful for lightweight guidance, but it does not include Arc's bundled agents, references, disciplines, templates, scripts, or rules. Workflows such as `audit`, `review`, `implement`, `refactor`, and `testing` work best with the Claude plugin, native Codex plugin, or Codex full-runtime install.

## Invoking Arc

### Claude Code

Use slash commands:

```text
/arc:ideate add magic-link login
/arc:implement
/arc:audit
/arc:commit push
```

### Codex

Use skill names:

```text
$ideate add magic-link login
$implement
$audit
$commit push
```

Common Codex entry points:

- `$ideate`
- `$implement`
- `$review`
- `$audit`
- `$refactor`
- `$testing`
- `$launch`
- `$commit`

If you open this repo itself in Codex, `.agents/skills/*` symlinks let Codex discover the local skills without a global install.

## Commands

| Command | Use when | Output |
|---------|----------|--------|
| `/arc:vision` | A project needs a concise north star | `docs/vision.md` |
| `/arc:ideate` | An idea needs to become a concrete feature spec | `docs/arc/specs/...` |
| `/arc:review` | A plan, spec, or implementation approach needs expert challenge | Prioritized review findings |
| `/arc:implement` | You are ready to build or continue implementation | Code changes with TDD and checks |
| `/arc:testing` | Existing code needs characterization tests before change | Safety-net tests and risk notes |
| `/arc:launch` | A project needs to be ready for a public URL | Launch readiness checklist |
| `/arc:audit` | You need a verified current-state codebase health report | `docs/audits/...` |
| `/arc:refactor` | Code feels tangled, shallow, duplicated, oversized, or ready for package/module extraction | Refactor plan/RFC |
| `/arc:commit` | You are ready to commit, push, or publish changed npm packages | Atomic git commits |

## Typical Flows

### Start A New Feature

```text
/arc:ideate add team invitations
/arc:review
/arc:implement
/arc:commit
```

### Continue From An Existing Plan

```text
/arc:implement docs/arc/plans/team-invitations.md
```

### Refactor Old Code Safely

```text
/arc:testing src/billing
/arc:refactor src/billing
/arc:implement
```

`/arc:testing` is intentionally about existing code. For new feature work, `/arc:implement` owns the TDD loop.

### Prepare To Share

```text
/arc:audit
/arc:launch
/arc:commit push
```

## Full-Runtime Contents

Arc's full install includes:

- `skills/` — user-facing and supporting workflows.
- `commands/` — Claude slash-command stubs that invoke skills.
- `agents/` — specialist reviewers, implementers, test writers, runners, and workflow reviewers.
- `disciplines/` — implementation practices such as TDD, systematic debugging, verification, and branch finishing.
- `references/` — Arc-owned guidance for architecture, testing, review, auditing, platform tools, and related delivery concerns.
- `rules/` — internal rule corpus used by Arc workflows.
- `templates/` and `scripts/` — reusable workflow support.

Prompt-only installs receive only the skill prompts, so full-runtime workflows may not have all supporting material.

## Agents

Arc includes specialist agents for work that benefits from focused review or delegation:

| Category | Agents |
|----------|--------|
| **Research** | docs-researcher, git-history-analyzer |
| **Review** | accessibility-engineer, architecture-engineer, daniel-product-engineer, data-engineer, lee-nextjs-engineer, performance-engineer, security-engineer, senior-engineer, test-quality-engineer |
| **Build** | implementer, fixer, debugger, unit-test-writer, integration-test-writer, e2e-test-writer, test-runner, e2e-runner, spec-reviewer, code-reviewer, plan-completion-reviewer |
| **Workflow** | spec-flow-analyzer, spec-document-reviewer, plan-document-reviewer, e2e-test-runner |

Agents are support machinery. Arc workflows decide when they are useful; users normally start with a command or skill.

## Disciplines

Arc's implementation workflows draw on:

- **test-driven-development** — red-green-refactor implementation.
- **systematic-debugging** — methodical bug investigation.
- **verification-before-completion** — prove work before claiming completion.
- **finishing-a-development-branch** — cleanup and integration checks.
- **subagent-driven-development** — parallel execution for independent tasks.
- **dispatching-parallel-agents** — efficient multi-agent coordination.
- **receiving-code-review** — evaluating and applying review feedback.
- **change-impact-testing** — selecting tests from change blast radius.

## Notes

- Arc asks one focused question at a time when clarification is needed.
- Review is advisory. The user decides.
- Implementation uses TDD and continuous verification.
- Launch checks the basics needed for a public URL: deployment, domain, HTTPS, environment variables, access gates, metadata, social previews, favicons, placeholders, robots/noindex blockers, and detected service settings.
- Activity is logged to `.arc/log.md` when workflows complete. The file is gitignored.

## Optional Integrations

Arc is self-contained, but it can use connected tools when available:

| Integration | Used for |
|-------------|----------|
| Browser automation / Playwright | Rendered verification, E2E checks, launch evidence |
| Context/documentation search | Research during implementation or review |
| Project-local task planning | Turning audit findings into implementation plans |
| Git tooling | Commit and push workflows |
| npm registry | Publishing changed packages after a successful push |

External skills and plugins can add specialist depth, but Arc should still remain understandable and usable without them.

## Acknowledgments

Arc builds on patterns and disciplines from:

- [superpowers](https://github.com/chadgauth/superpowers) — implementation disciplines such as TDD, debugging, and verification.
- [compound-engineering](https://github.com/minuva/compound-engineering) — agent patterns and workflows.

## License

MIT
