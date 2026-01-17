# Arc Plugin

The full arc from idea to shipped code. This plugin provides 19 commands for the complete development lifecycle.

## Structure

```
arc/
├── .claude-plugin/
│   └── plugin.json         # Plugin metadata
├── skills/                  # Each skill = one /arc:* command
│   ├── vision/SKILL.md     # /arc:vision
│   ├── ideate/SKILL.md     # /arc:ideate
│   ├── detail/SKILL.md     # /arc:detail
│   ├── implement/SKILL.md  # /arc:implement
│   ├── design/SKILL.md     # /arc:design
│   ├── figma/SKILL.md      # /arc:figma
│   ├── build/SKILL.md      # /arc:build
│   ├── test/SKILL.md       # /arc:test
│   ├── letsgo/SKILL.md     # /arc:letsgo
│   ├── deslop/SKILL.md     # /arc:deslop
│   ├── review/SKILL.md     # /arc:review
│   ├── audit/SKILL.md      # /arc:audit
│   ├── progress/SKILL.md   # /arc:progress
│   ├── tasklist/SKILL.md   # /arc:tasklist
│   ├── document/SKILL.md   # /arc:document
│   ├── suggest/SKILL.md    # /arc:suggest
│   ├── commit/SKILL.md     # /arc:commit
│   ├── rules/SKILL.md      # /arc:rules
│   └── tidy/SKILL.md       # /arc:tidy
├── agents/                  # Specialized reviewers
│   ├── review/
│   ├── research/
│   ├── design/
│   └── workflow/
├── disciplines/             # Implementation methodologies
├── references/              # Domain knowledge
├── templates/               # Output templates
├── CLAUDE.md                # This file
├── README.md                # Documentation
└── LICENSE                  # MIT
```

## Command Hierarchy

All commands use the `/arc:` namespace prefix:

```
WHY     /arc:vision     - High-level goals
WHAT    /arc:ideate     - From idea to working implementation
HOW     /arc:detail     - Detailed implementation plan
DO      /arc:implement, /arc:design, /arc:figma, /arc:build, /arc:test, /arc:letsgo, /arc:deslop
CROSS   /arc:review, /arc:audit, /arc:progress, /arc:tasklist, /arc:document, /arc:suggest, /arc:tidy
TOOLS   /arc:commit, /arc:rules
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

## Complementary Plugins

Arc focuses on the development lifecycle. For specialized domains, consider these Vercel Labs plugins:

- **[agent-skills](https://github.com/vercel-labs/agent-skills)** — `vercel-react-best-practices` skill for React/Next.js performance patterns
- **[web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines)** — `web-design-guidelines` skill for UI compliance review

**When installed, Arc commands will suggest these skills:**
| Arc Command | Complementary Skill | Use Case |
|-------------|-------------------|----------|
| `/arc:design` | `web-design-guidelines` | UI compliance review |
| `/arc:build` | `vercel-react-best-practices` | React/Next.js performance |
| `/arc:implement` | Both | Quality checkpoints |
| `/arc:letsgo` | `vercel-react-best-practices`, `vercel:deploy` | Production readiness |

## Publishing

1. Bump version in `.claude-plugin/plugin.json`
2. Commit and push to GitHub
3. Users update via `claude plugins update`
