# Arc Plugin

The full arc from idea to shipped code. This plugin provides a skills-based workflow for the complete development lifecycle.

## Structure

```
arc/
├── .claude-plugin/
│   └── plugin.json         # Plugin metadata
├── commands/               # Slash command routers (invoke skills)
├── skills/                  # Each skill = one /arc:* command
│   ├── go/SKILL.md         # 1. Entry point
│   ├── using-arc/SKILL.md  # Bootstrap control plane
│   ├── vision/SKILL.md     # 2. Foundation: project goals
│   ├── brand/SKILL.md      # 3. Brand: visual identity system
│   ├── ideate/SKILL.md     # 3. Design: idea → validated design
│   ├── detail/SKILL.md     # 4. Plan (internal, invoked by implement)
│   ├── review/SKILL.md     # 5. Review: validate before execution
│   ├── implement/SKILL.md  # 6. Execute: plan + TDD implementation
│   ├── design/SKILL.md     # 6. Execute: distinctive UI
│   ├── build/SKILL.md      # 6. Execute: quick builds
│   ├── ai/SKILL.md         # 6. Execute: AI SDK patterns
│   ├── testing/SKILL.md    # 7. Test: strategy & execution
│   ├── verify/SKILL.md     # 7. Test: build + typecheck + lint runner
│   ├── letsgo/SKILL.md     # 8. Ship: production readiness
│   ├── harden/SKILL.md     # Refine: production resilience
│   ├── naming/SKILL.md     # Cross-cutting: project naming
│   ├── browse/SKILL.md     # Cross-cutting: expert browser experience evaluation
│   ├── responsive/SKILL.md # Cross-cutting: mobile responsive audit
│   ├── seo/SKILL.md        # Cross-cutting: SEO audit
│   ├── audit/SKILL.md      # Cross-cutting: codebase audit
│   ├── commit/SKILL.md     # Cross-cutting: smart commits
│   ├── suggest/SKILL.md    # Cross-cutting: what to work on
│   ├── document/SKILL.md   # Cross-cutting: capture solutions
│   ├── tidy/SKILL.md       # Cross-cutting: cleanup plans
│   ├── rules/SKILL.md      # Cross-cutting: coding standards
│   ├── deps/SKILL.md       # Cross-cutting: dependency audit
│   ├── hooks/SKILL.md      # Cross-cutting: auto-format + context hooks
│   ├── help/SKILL.md       # Utility: context-aware command guide
│   ├── prune-agents/SKILL.md # Utility: kill orphaned subagents
│   └── progress/SKILL.md   # internal (progress journal)
├── agents/                  # Specialized subagents
│   ├── build/
│   ├── review/
│   ├── research/
│   └── workflow/
├── hooks/                   # Claude Code hooks (statusline, context monitor)
├── disciplines/             # Implementation methodologies
├── references/              # Domain knowledge
├── templates/               # Output templates
├── CLAUDE.md                # This file
├── README.md                # Documentation
└── LICENSE                  # MIT
```

## Command Workflow

All commands use the `/arc:` namespace prefix. The typical workflow:

```
0. HELP       /arc:help       → Context-aware guide to all commands
1. ENTRY      /arc:go         → Routes to right workflow based on context
2. FOUNDATION /arc:vision     → Define project goals (one-time setup)
3. DESIGN     /arc:brand      → Visual identity system (palette, type, assets)
              /arc:ideate     → Turn idea into validated design doc
4. REVIEW     /arc:review     → Expert validation before execution
5. EXECUTE    /arc:implement  → Plan + TDD implementation
              /arc:design     → Create distinctive UI
              /arc:ai         → AI SDK patterns and guidance
6. TEST       /arc:testing    → Test strategy and execution
7. SHIP       /arc:letsgo     → Production readiness checklist

CROSS-CUTTING (available anytime):
              /arc:browse     → Expert browser experience evaluation
              /arc:naming     → Generate and validate project names
              /arc:responsive → Mobile responsive audit & fix
              /arc:seo        → Deep SEO audit
              /arc:audit      → Comprehensive codebase audit
              /arc:commit     → Smart commits with auto-splitting
              /arc:suggest    → What to work on next (+ discovery mode)
              /arc:document   → Capture solved problems
              /arc:tidy       → Clean up completed plans
              /arc:rules      → Apply coding standards
              /arc:deps       → Dependency audit with batch upgrades
              /arc:hooks      → Auto-format, lint, and context monitor hooks
              /arc:help        → Context-aware guide to all commands
              /arc:prune-agents → Kill orphaned subagent processes
```

## Development

To test changes locally:
1. Edit the skill in `skills/<command>/SKILL.md`
2. Run the corresponding command (e.g., `/arc:ideate`)
3. Iterate based on results

## Key Principles

- **Reviewers advise, user decides** — Suggestions are questions, not mandates
- **One question at a time** — Never overwhelm
- **TDD mandatory** — Tests first, implementation second
- **Continuous quality** — TS/lint after every task
- **Knowledge compounds** — Solved problems documented for future sessions
- **Small control plane** — `using-arc` handles startup routing; richer workflows load on demand

## Complementary Plugins

Arc focuses on the development lifecycle. For specialized domains, consider these Vercel Labs plugins:

- **[agent-skills](https://github.com/vercel-labs/agent-skills)** — `vercel-react-best-practices`, `vercel-composition-patterns`, `vercel-react-native-skills`
- **[web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines)** — `web-design-guidelines` skill for UI compliance review

**When installed, Arc commands will suggest these skills:**
| Arc Command | Complementary Skill | Use Case |
|-------------|-------------------|----------|
| `/arc:design` | `web-design-guidelines`, `vercel-composition-patterns` | UI compliance, component architecture |
| `/arc:implement` | All agent-skills + `web-design-guidelines` | Quality checkpoints |
| `/arc:letsgo` | `vercel-react-best-practices`, `vercel-react-native-skills`, `vercel-deploy` | Production readiness |
| `/arc:responsive` | `web-design-guidelines`, `vercel-react-native-skills` | Mobile audit |

## Browser And Wireframe Tools

- In Claude Code, prefer `mcp__claude-in-chrome__*` for rendered-page verification.
- Outside Claude Code, prefer `agent-browser` for browser automation before dropping to Playwright.
- Use WireText MCP for low-fidelity wireframes only. It does not replace Chrome-based rendered review.

## Publishing

1. Bump version in `.claude-plugin/plugin.json`
2. Commit and push to GitHub
3. Users update via `claude plugins update`
