# Arc Plugin

The full arc from idea to shipped code. This plugin provides 15 commands for the complete development lifecycle.

## Structure

```
arc/
├── .claude-plugin/
│   └── plugin.json        # Plugin metadata
├── skills/
│   └── arc/               # Main skill (commands auto-registered as /arc:*)
│       ├── SKILL.md       # Router and principles
│       ├── workflows/     # Command implementations
│       │   ├── vision.md
│       │   ├── ideate.md
│       │   ├── detail.md
│       │   ├── implement.md
│       │   ├── design.md
│       │   ├── figma.md
│       │   ├── build.md
│       │   ├── test.md
│       │   ├── letsgo.md
│       │   ├── deslop.md
│       │   ├── review.md
│       │   ├── tasklist.md
│       │   ├── document.md
│       │   ├── suggest.md
│       │   └── commit.md
│       ├── agents/        # Specialized reviewers
│       │   ├── review/
│       │   ├── research/
│       │   ├── design/
│       │   └── workflow/
│       ├── disciplines/   # Implementation methodologies
│       ├── references/    # Domain knowledge
│       └── templates/     # Output templates
├── CLAUDE.md              # This file
├── README.md              # Documentation
└── LICENSE                # MIT
```

## Command Hierarchy

All commands use the `/arc:` namespace prefix:

```
WHY     /arc:vision     - High-level goals
WHAT    /arc:ideate     - From idea to working implementation
HOW     /arc:detail     - Detailed implementation plan
DO      /arc:implement, /arc:design, /arc:figma, /arc:build, /arc:test, /arc:letsgo, /arc:deslop
CROSS   /arc:review, /arc:tasklist, /arc:document, /arc:suggest
TOOLS   /arc:commit     - Smart commit + push
```

## Development

To test changes locally:
1. Edit workflows in `skills/arc/workflows/`
2. Run the corresponding command (e.g., `/arc:ideate`)
3. Iterate based on results

## Key Principles

- **Reviewers advise, user decides** — Suggestions are questions, not mandates
- **One question at a time** — Never overwhelm
- **TDD mandatory** — Tests first, implementation second
- **Continuous quality** — TS/lint after every task
- **Knowledge compounds** — Solved problems documented for future sessions

## Publishing

1. Bump version in `.claude-plugin/manifest.json`
2. Commit and push to GitHub
3. Users update via `claude plugins update`
