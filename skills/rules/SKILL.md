---
name: rules
disable-model-invocation: true
description: |
  Apply Arc's coding rules to the current project. Copies rules to .ruler/ directory.
  Use when asked to "set up coding rules", "apply standards", "configure rules",
  or when starting a project that should follow Arc's conventions.
license: MIT
metadata:
  author: howells
website:
  order: 20
  desc: Apply standards
  summary: Apply Arc's coding standards to your project. TypeScript, React, Next.js, testing patterns, UI conventions—all in .ruler/ where every AI tool can read them.
  what: |
    Rules copies Arc's coding standards to your project's .ruler/ directory: TypeScript patterns, React conventions, Next.js best practices, Tailwind usage, testing strategies, and UI design guidelines. Every Arc skill reads from .ruler/ when generating or reviewing code—so the AI follows your project's standards, not generic ones.
  why: |
    Without shared standards, every AI-generated file is inconsistent. Rules puts the playbook in one place that all AI tools can read. Combined with Ruler (optional), these standards propagate to Copilot, Cursor, and other agents—so your whole toolchain follows the same conventions.
  decisions:
    - Copy, not symlink. Projects can customize rules for their needs.
    - Backup on update. Your customizations are never lost.
    - Optional Ruler integration. Distributes rules to Copilot, Cursor, and other agents.
  workflow:
    position: utility
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## REQUIRED TOOLS — use these, do not skip:
- **`AskUserQuestion`** — Preserve the one-question-at-a-time interaction pattern for user decisions such as update confirmation and Ruler offers. In Claude Code, use the tool. In Codex, ask one concise plain-text question at a time unless a structured question tool is actually available in the current mode. Do not narrate missing tools or fallbacks to the user.

## BANNED TOOLS — calling these is a skill violation:
- **`EnterPlanMode`** — BANNED. Do NOT call this tool. This skill has its own structured process. Execute the steps below directly.
- **`ExitPlanMode`** — BANNED. You are never in plan mode.
</tool_restrictions>

<arc_runtime>
This workflow requires the full Arc bundle, not a prompts-only install.

Paths in this skill use these conventions:
- `agents/...`, `references/...`, `disciplines/...`, `templates/...`, `scripts/...`, `rules/...`, `skills/<name>/...` are Arc-owned files at the plugin root. Resolve the plugin root from this skill's filesystem location — it's the directory containing `agents/` and `skills/`.
- `./...` is local to this skill's directory.
- `.ruler/...`, `docs/...`, `src/...`, or any project-relative path refers to the user's project repository.
</arc_runtime>

```

───────────────────────────────────────────────────────────
```

Apply Arc's coding standards to the current project.

<process>

## Step 1: Check for existing rules

**Use Glob tool:** `.ruler/*.md`

**If `.ruler/` does not exist:** Go to Step 2 (Fresh Install)

**If `.ruler/` exists:** Go to Step 3 (Update Flow)

## Step 2: Fresh Install

Resolve the Arc plugin root from this skill's filesystem location (it's the directory containing `agents/` and `skills/`) — `rules/` is a sibling of that directory.

Copy all rules from Arc to the project:

```bash
cp -r "rules/" .ruler/
```

Tell the user:
```
Rules copied to .ruler/

Files added:
- stack.md, api.md, ai-sdk.md, cli.md, code-style.md, env.md, git.md, integrations.md, tooling.md
- nextjs.md, react.md, tailwind.md, testing.md
- turborepo.md, typescript.md, versions.md
- interface/ (animation, design, forms, interactions, layout, performance, typography)
```

Go to Step 4 (Offer Ruler)

## Step 3: Update Flow

Existing `.ruler/` found. Ask the user:

```yaml
AskUserQuestion:
  question: "Found existing .ruler/ in this project. Update with Arc's latest rules? This will backup current rules and overwrite with Arc's latest. You can review changes with `git diff .ruler/` after."
  header: "Update Rules"
  options:
    - label: "Update rules"
      description: "Backup current rules to .ruler.backup-TIMESTAMP/ and overwrite with Arc's latest"
    - label: "Keep existing"
      description: "Keep your current rules unchanged"
```

**If user picks "Update rules":**
```bash
# Create backup
cp -r .ruler/ ".ruler.backup-$(date +%Y%m%d-%H%M%S)/"

# Copy fresh rules
rm -rf .ruler/
cp -r "rules/" .ruler/
```

Tell the user:
```
Rules updated. Backup saved to .ruler.backup-YYYYMMDD-HHMMSS/

Review changes with: git diff .ruler/
```

Go to Step 4 (Offer Ruler)

**If user picks "Keep existing":**
```
Keeping existing rules. You can manually compare with Arc's rules at:
rules/
```

Done.

## Step 4: Offer Ruler

Ask the user:

```yaml
AskUserQuestion:
  question: "Want to distribute rules to other AI agents (Copilot, Cursor, etc.) via Ruler?"
  header: "Distribute Rules"
  options:
    - label: "Run ruler apply"
      description: "Run npx ruler apply to distribute rules to other AI tools"
    - label: "Skip"
      description: "Keep rules in .ruler/ only, distribute later if needed"
```

**If user picks "Run ruler apply":**
```bash
npx ruler apply
```

If ruler is not installed (command fails):
```
Ruler not found. Rules are in .ruler/ and ready for use.

To distribute to other AI agents, install ruler:
  npm install -g ruler

Then run:
  npx ruler apply
```

**If user picks "Skip":**
```
Rules are ready in .ruler/. Run `npx ruler apply` later if you want to distribute to other agents.
```

## Step 5: Suggest Linear (for complex projects)

After rules are set up, check project complexity:

```bash
# Count source files
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | grep -v node_modules | wc -l
```

**If >50 files or monorepo detected:**
```
This looks like a complex project. Consider setting up Linear MCP for issue tracking:

1. Add to .mcp.json:
   {
     "mcpServers": {
       "linear": {
         "command": "npx",
         "args": ["-y", "@anthropic/linear-mcp"]
       }
     }
   }

2. Arc will then:
   - Query active issues in /arc:suggest
   - Create issues from /arc:audit findings
   - Link work to issues for context

See .ruler/tooling.md for details.
```

**If small project:** Skip this suggestion.

Done.

</process>

<notes>
- Rules are copied, not symlinked, so projects can customize
- Backup ensures user customizations are never lost
- Ruler is optional — Arc works without it
- After copying, rules are immediately available to Arc skills that read from `.ruler/`
</notes>
