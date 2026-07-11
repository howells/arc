# Arc Plugin

The full arc from idea to shipped code. Arc's canonical product definition, domain language, and operating boundary live in `CONTEXT.md`. Treat this file as contributor guidance, not a competing definition.

## Structure

```
arc/
├── .claude-plugin/
│   ├── plugin.json         # Plugin metadata
│   └── marketplace.json    # Claude Code marketplace manifest
├── .codex/                 # Codex clone-and-symlink installer scripts
├── .codex-plugin/          # Codex plugin manifest
├── .cursor-plugin/         # Cursor plugin manifest
├── .agents/                # Codex skill symlinks
├── .husky/                 # Git hooks (validate-plugin, version bump)
├── commands/               # Slash command routers (invoke skills)
├── skills/                 # Each skill = one /arc:* command
│   ├── using-arc/SKILL.md  # Bootstrap control plane (internal)
│   ├── vision/SKILL.md     # Foundation: goals + domain language → CONTEXT.md
│   ├── ideate/SKILL.md     # Spec: idea → validated feature spec
│   ├── detail/SKILL.md     # Plan (internal, invoked by implement)
│   ├── review/SKILL.md     # Review: validate before execution
│   ├── implement/SKILL.md  # Execute: plan + TDD implementation
│   ├── testing/SKILL.md    # Test: safety-net backfill
│   ├── launch/SKILL.md     # Launch: go-live checklist
│   ├── refactor/SKILL.md   # Cross-cutting: structural refactor planning
│   ├── audit/SKILL.md      # Cross-cutting: codebase audit
│   ├── improve/SKILL.md    # Cross-cutting: findings → plan backlog + reconcile
│   ├── commit/SKILL.md     # Cross-cutting: smart commits
│   └── release/SKILL.md    # Cross-cutting: versioned package releases
├── agents/                 # Specialized subagents
│   ├── build/
│   ├── review/
│   ├── research/
│   └── workflow/
├── disciplines/            # Implementation methodologies
├── references/             # Domain knowledge
├── rules/                  # Internal rule corpus loaded by workflows
├── templates/              # Output templates
├── scripts/                # Build, version-bump, and analysis tooling
├── tests/                  # Plugin test suite (bash)
├── site/                   # Marketing/docs site (Next.js, pnpm workspace member)
├── plugins/arc/            # GENERATED Codex marketplace payload — never edit by hand
├── CONTEXT.md              # Canonical product definition and boundary
├── AGENTS.md               # Agent operating instructions
├── CLAUDE.md               # This file
├── README.md               # Documentation
└── LICENSE                 # MIT
```

## Command Workflow

All commands use the `/arc:` namespace prefix. The typical workflow:

```
FOUNDATION /arc:vision     → Define goals + domain language in CONTEXT.md (one-time setup)
SPEC       /arc:ideate     → Turn idea into validated feature spec
REVIEW     /arc:review     → Expert validation (cross-cutting: before or during execution)
EXECUTE    /arc:implement  → Plan + TDD implementation
TEST       /arc:testing    → Backfill safety-net tests for existing code
SHIP       /arc:launch     → Go-live checklist

CROSS-CUTTING (available anytime):
           /arc:audit      → Comprehensive codebase audit
           /arc:improve    → Findings → vetted plan backlog; reconcile across sessions
           /arc:commit     → Smart commits and push
           /arc:release    → Version, changelog, verify, publish packages
           /arc:refactor   → Discover friction, propose structural refactors
```

The canonical flow is `ideate → (review) → implement`; review is cross-cutting and optional. `detail` and `using-arc` are internal supporting skills, not public lifecycle stages.

## Development

To test changes locally:
1. Edit the skill in `skills/<command>/SKILL.md`
2. Run the corresponding command (e.g. `/arc:ideate`)
3. Iterate based on results
4. Run `pnpm test` (the bash suite in `tests/`) before committing

## Key Principles

See `CONTEXT.md` for Arc's canonical principles. In contributor work, preserve the same boundary: Arc is self-contained, lifecycle-focused, and uses `using-arc` as a small control plane.

## Optional External Plugins

External plugins can provide useful extra checks, but they are not part of Arc's product definition and Arc should not depend on them for core behavior.

- **[agent-skills](https://github.com/vercel-labs/agent-skills)** — `vercel-react-best-practices`, `vercel-composition-patterns`, `vercel-react-native-skills`

When an external plugin is available, use it only as an optional enhancement. Keep Arc workflows understandable and usable without it.

## Browser Tools

- In Claude Code, prefer `mcp__claude-in-chrome__*` for rendered-page verification.
- Outside Claude Code, prefer `agent-browser` for browser automation before dropping to Playwright.

## Publishing

1. Bump the version: `bash scripts/bump-version.sh <new-version>` — it updates all seven version fields (`package.json`, `.claude-plugin/plugin.json` + `marketplace.json`, `.codex-plugin/`, `.cursor-plugin/`, and the generated `plugins/arc/.codex-plugin/`). Verify with `bash scripts/bump-version.sh --check`.
2. Regenerate the Codex payload: `pnpm build:codex` (rebuilds `plugins/arc/` and `.agents/plugins/marketplace.json`). Required after ANY change to skills, agents, references, rules, disciplines, templates, or scripts — the pre-commit hook and `tests/test-codex-mirror.sh` will fail if the mirror is stale.
3. Commit and push to GitHub.
4. Users update via `claude plugins update` (Claude Code) or `codex plugin marketplace upgrade` (Codex).
