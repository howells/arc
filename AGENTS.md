# Arc Plugin

The full arc from idea to shipped code. Arc's canonical product definition, domain language, and operating boundary live in `CONTEXT.md`. Treat this file as contributor guidance, not a competing definition.

## Structure

```
arc/
├── .claude-plugin/
│   └── plugin.json         # Plugin metadata
├── .agents/                # Codex skill symlinks
├── commands/               # Slash command routers (invoke skills)
├── skills/                  # Each skill = one /arc:* command
│   ├── go/SKILL.md         # 1. Entry point
│   ├── using-arc/SKILL.md  # Bootstrap control plane
│   ├── vision/SKILL.md     # 2. Foundation: project goals
│   ├── ideate/SKILL.md     # 3. Design: idea → validated design
│   ├── detail/SKILL.md     # 4. Plan (internal, invoked by implement)
│   ├── review/SKILL.md     # 5. Review: validate before execution
│   ├── implement/SKILL.md  # 6. Execute: plan + TDD implementation
│   ├── design/SKILL.md     # 6. Execute: distinctive UI
│   ├── ai/SKILL.md         # 6. Execute: AI SDK patterns
│   ├── testing/SKILL.md    # 7. Test: strategy & execution
│   ├── launch/SKILL.md     # 8. Launch: go-live checklist
│   ├── naming/SKILL.md     # Cross-cutting: project naming
│   ├── refactor/SKILL.md   # Cross-cutting: structural refactor planning
│   ├── responsive/SKILL.md # Cross-cutting: mobile responsive audit
│   ├── browse/SKILL.md     # Cross-cutting: rendered app experience evaluation
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
├── hooks/                   # Codex hooks (statusline, context monitor)
├── disciplines/             # Implementation methodologies
├── references/              # Domain knowledge
├── templates/               # Output templates
├── AGENTS.md                # This file
├── README.md                # Documentation
└── LICENSE                  # MIT
```

## Command Workflow

All commands use the `/arc:` namespace prefix. The typical workflow:

```
0. HELP       /arc:help       → Context-aware guide to all commands
1. ENTRY      /arc:go         → Routes to right workflow based on context
2. FOUNDATION /arc:vision     → Define project goals (one-time setup)
3. DESIGN     /arc:ideate     → Turn idea into validated design doc
4. REVIEW     /arc:review     → Expert validation before execution
5. EXECUTE    /arc:implement  → Plan + TDD implementation
              /arc:design     → Create distinctive UI
              /arc:ai         → AI SDK patterns and guidance
6. TEST       /arc:testing    → Test strategy and execution
7. SHIP       /arc:launch     → Go-live checklist

CROSS-CUTTING (available anytime):
              /arc:naming     → Generate and validate project names
              /arc:responsive → Mobile responsive audit & fix
              /arc:browse     → Evaluate rendered app experience through a persona
              /arc:seo        → Deep SEO audit
              /arc:audit      → Comprehensive codebase audit
              /arc:commit     → Smart commits with auto-splitting
              /arc:suggest    → What to work on next (+ discovery mode)
              /arc:document   → Capture solved problems
              /arc:tidy       → Clean up completed plans
              /arc:rules      → Apply coding standards
              /arc:refactor   → Discover friction, propose structural refactors
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

See `CONTEXT.md` for Arc's canonical principles. In contributor work, preserve the same boundary: Arc is self-contained, lifecycle-focused, and uses `using-arc` as a small control plane.

## Optional External Plugins

External plugins can provide useful extra checks, but they are not part of Arc's product definition and Arc should not depend on them for core behavior.

- **[agent-skills](https://github.com/vercel-labs/agent-skills)** — `vercel-react-best-practices`, `vercel-composition-patterns`, `vercel-react-native-skills`
- **[web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines)** — `web-design-guidelines` skill for UI compliance review

When an external plugin is available, use it only as an optional enhancement. Keep Arc workflows understandable and usable without it.

## Browser And Wireframe Tools

- In Codex, prefer `mcp__claude-in-chrome__*` for rendered-page verification.
- Outside Codex, prefer `agent-browser` for browser automation before dropping to Playwright.
- Use WireText MCP for low-fidelity wireframes only. It does not replace Chrome-based rendered review.

## Publishing

1. Bump version in `.claude-plugin/plugin.json`
2. Commit and push to GitHub
3. Users update via their plugin manager
