---
name: hooks
disable-model-invocation: true
description: |
  Install Claude Code hooks and git hooks for automatic formatting, linting, and context monitoring.
  Use when setting up a project, after "install hooks", "set up hooks", "add auto-formatting",
  "add git hooks", "set up husky", or when starting a new project that uses Biome.
license: MIT
argument-hint: "[--remove | --git-only | --claude-only]"
metadata:
  author: howells
website:
  order: 21
  desc: Auto-format hooks
  summary: Install Claude Code hooks (auto-format, lint-on-stop, context monitor) AND git hooks (Husky pre-commit/pre-push with typecheck + lint). Biome-powered, zero token cost.
  what: |
    Hooks installs two layers of protection:

    **Claude Code hooks** (.claude/settings.json):
    1. PostToolUse — runs biome format on every edited file (zero tokens, instant)
    2. Stop — runs biome check --fix and tsc --noEmit when the conversation ends
    3. PreToolUse — blocks destructive git operations (force push, reset --hard, etc.)
    4. Context monitor — warns the agent when context window is running low

    **Git hooks** (Husky or Vite+):
    1. pre-commit — runs lint-staged (biome format on staged files)
    2. pre-push — runs full typecheck + lint (catches errors before sharing)
    3. turbo.json — disables cache for typecheck/lint tasks (prevents false green)
  why: |
    Two separate failure modes need two layers of protection:
    - Claude Code hooks prevent the AI from writing unformatted code or destroying git state.
    - Git hooks prevent humans (and AI commits) from pushing type errors or lint violations.
    Turborepo cache on typecheck/lint is the #1 cause of errors slipping through — turbo replays a cached "success" without actually running tsc. Disabling cache for these tasks is mandatory.
  decisions:
    - Biome only. Arc is opinionated. Biome handles formatting and linting in one tool.
    - Git guard blocks force push, reset --hard, clean -f, checkout . — enforcement, not discipline.
    - Merges into existing settings. Never clobbers user permissions or MCP config.
    - Context monitor is optional but recommended. Users can skip it.
    - turbo.json typecheck/lint cache always disabled. Non-negotiable.
    - Vite+ projects use .vite-hooks instead of .husky — auto-detected.
  workflow:
    position: utility
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## REQUIRED TOOLS — use these, do not skip:
- **`AskUserQuestion`** — Preserve the one-question-at-a-time interaction pattern for user choices. In Claude Code, use the tool. In Codex, ask one concise plain-text question at a time unless a structured question tool is actually available in the current mode. Do not narrate missing tools or fallbacks to the user.

## BANNED TOOLS — calling these is a skill violation:
- **`EnterPlanMode`** — BANNED. Do NOT call this tool. This skill has its own structured process. Execute the steps below directly.
- **`ExitPlanMode`** — BANNED. You are never in plan mode.
</tool_restrictions>

<process>

## Step 0: Handle flags

**`--remove`:** Remove all Arc-installed hooks (Claude Code + git hooks). Read `.claude/settings.json`, remove Arc hooks, write back. Remove Arc-created git hooks from `.husky/` or `.vite-hooks/`. Report what was removed. Done — skip all other steps.

**`--git-only`:** Skip Claude Code hooks (Steps 1-7). Jump directly to Step 8 (git hooks).

**`--claude-only`:** Install only Claude Code hooks (Steps 1-7). Skip Step 8 (git hooks).

**No flag (default):** Install both Claude Code hooks AND git hooks.

## Step 1: Detect Biome

```bash
grep -q '"@biomejs/biome"' package.json 2>/dev/null
```

**If Biome is in package.json:** Continue to Step 2.

**If Biome is NOT found:**

```yaml
AskUserQuestion:
  question: "Biome not found in package.json. Arc hooks require Biome for auto-formatting and linting. How would you like to proceed?"
  header: "Biome Required"
  options:
    - label: "Install Biome and continue"
      description: "Add @biomejs/biome as a dev dependency and set up all hooks"
    - label: "Skip formatting hooks"
      description: "Install context monitor and git guard only, skip Biome-dependent hooks"
    - label: "Cancel"
      description: "Exit without installing any hooks"
```

**If user picks "Install Biome and continue":**
```bash
# Detect package manager from lockfile
if [ -f pnpm-lock.yaml ]; then
  pnpm add -D @biomejs/biome
elif [ -f yarn.lock ]; then
  yarn add -D @biomejs/biome
else
  npm install -D @biomejs/biome
fi
```

Then check for `biome.json` / `biome.jsonc`. If missing:
```bash
npx @biomejs/biome init
```

**If user picks "Skip formatting hooks":** Set `SKIP_BIOME=true`, continue to Step 3.

**If user picks "Cancel":** Stop. Do not install any hooks.

## Step 2: Verify Biome works

```bash
./node_modules/.bin/biome --version
```

If this fails, the binary isn't available. Tell the user and offer to reinstall.

Also check for biome config:
```bash
ls biome.json biome.jsonc 2>/dev/null
```

If no config exists, note this — biome will use defaults, which is fine.

## Step 3: Build the hooks config

Build the hooks object to merge into `.claude/settings.json`.

**Biome format hook (PostToolUse, Edit|Write):**
```json
{
  "matcher": "Edit|Write|NotebookEdit",
  "hooks": [
    {
      "type": "command",
      "command": "jq -r '.tool_input.file_path // .tool_input.filePath // empty' | { read file_path; case \"$file_path\" in *.js|*.ts|*.jsx|*.tsx|*.json|*.jsonc|*.css|*.graphql) ./node_modules/.bin/biome format --write \"$file_path\" 2>/dev/null || true ;; esac; }"
    }
  ]
}
```

**Biome lint hook (Stop):**
```json
{
  "hooks": [
    {
      "type": "command",
      "command": "git diff --name-only --diff-filter=d HEAD 2>/dev/null | grep -E '\\.(js|ts|jsx|tsx|json|jsonc|css|graphql)$' | xargs -r ./node_modules/.bin/biome check --fix --unsafe 2>/dev/null || true"
    }
  ]
}
```

**TypeScript check hook (Stop):**

Only include this if the project has TypeScript (`tsconfig.json` exists).

```json
{
  "hooks": [
    {
      "type": "command",
      "command": "npx tsc --noEmit 2>&1 | tail -20 || true"
    }
  ]
}
```

**Git guard hook (PreToolUse, Bash):**

This hook blocks destructive git operations before they execute. Always install — not dependent on Biome.

```json
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "command": "jq -r '.tool_input.command' | grep -qE 'git\\s+(reset\\s+--hard|push\\s+(-f|--force)|clean\\s+-f|checkout\\s+\\.)' && echo '{\"decision\":\"block\",\"reason\":\"Destructive git operation blocked by Arc hooks. Ask the user first.\"}' || true"
    }
  ]
}
```

**Context monitor hook (PostToolUse, all tools):**

Determine the absolute path to Arc's `hooks/` directory by resolving the Arc install root from this skill's location. Use that resolved path as `${ARC_HOOKS_PATH}`.

Read `hooks/arc-context-monitor.js` from the resolved Arc install root to confirm it exists.

```json
{
  "matcher": "",
  "hooks": [
    {
      "type": "command",
      "command": "node ${ARC_HOOKS_PATH}/arc-context-monitor.js"
    }
  ]
}
```

Where `${ARC_HOOKS_PATH}` is the resolved absolute path to the Arc plugin's `hooks/` directory.

**Statusline hook:**
```json
{
  "type": "command",
  "command": "node ${ARC_HOOKS_PATH}/arc-statusline.js"
}
```

**If SKIP_BIOME is true:** Only include the git guard, context monitor, and statusline hooks. The tsc hook is independent of Biome — include it if `tsconfig.json` exists.

## Step 4: Read existing settings

```bash
cat .claude/settings.json 2>/dev/null
```

**If file doesn't exist:**
```bash
mkdir -p .claude
```
Start with an empty object `{}`.

**If file exists:** Parse the JSON. Preserve ALL existing fields (permissions, enabledMcpjsonServers, enableAllProjectMcpServers, enabledPlugins, etc.).

## Step 5: Merge hooks into settings

This is the critical step. NEVER clobber existing hooks — merge with them.

**Read the existing `hooks` object** (may be undefined).

**For PreToolUse:**
- Get existing `hooks.PreToolUse` array (or empty array)
- Check if an Arc git guard hook already exists (command contains `git.*reset.*--hard`)
- Add only if it doesn't exist

**For PostToolUse:**
- Get existing `hooks.PostToolUse` array (or empty array)
- Check if an Arc biome format hook already exists (command contains `biome format`)
- Check if an Arc context monitor hook already exists (command contains `arc-context-monitor`)
- Add new entries only if they don't already exist
- Biome format hook and context monitor hook are separate entries (different matchers)

**For Stop:**
- Get existing `hooks.Stop` array (or empty array)
- Check if an Arc biome lint hook already exists (command contains `biome check`)
- Check if an Arc tsc hook already exists (command contains `tsc --noEmit`)
- Add each only if it doesn't exist
- If no `tsconfig.json` in the project, skip the tsc hook

**For Statusline:**
- Get existing `hooks.Statusline` array (or empty array)
- Check if Arc statusline already exists (command contains `arc-statusline`)
- Add only if it doesn't exist

**Write the merged settings back:**
Use the Write tool to write the complete JSON (pretty-printed with 2-space indent).

**CRITICAL: Preserve all non-hook fields exactly as they were.** Do not add, remove, or modify anything outside the `hooks` key.

## Step 6: Verify installation

Read back `.claude/settings.json` and confirm the hooks are present.

Count installed hooks:
- PreToolUse entries
- PostToolUse entries
- Stop entries
- Statusline entries

## Step 7: Report

```
Arc hooks installed in .claude/settings.json

  PreToolUse  (Bash)        →  blocks destructive git ops (force push, reset --hard)
  PostToolUse (Edit|Write)  →  biome format --write on edited file
  PostToolUse (all tools)   →  context monitor (warns at 35%/25% remaining)
  Stop                      →  biome check --fix --unsafe on all changed files
  Stop                      →  tsc --noEmit (if tsconfig.json exists)
  Statusline                →  context bar showing usage

Hooks run automatically — zero token cost, zero agent effort.

To remove: /arc:hooks --remove
```

If `SKIP_BIOME` was true:
```
Arc hooks installed in .claude/settings.json

  PreToolUse  (Bash)        →  blocks destructive git ops (force push, reset --hard)
  PostToolUse (all tools)   →  context monitor (warns at 35%/25% remaining)
  Statusline                →  context bar showing usage

Biome hooks skipped (not installed). Run /arc:hooks again after adding Biome.

To remove: /arc:hooks --remove
```

## Step 8: Install git hooks (Husky or Vite+)

This step installs pre-commit and pre-push git hooks to enforce typecheck + lint at the git level. This catches errors that Claude Code hooks can't — like commits made outside Claude, or when the AI session ends before running Stop hooks.

### Step 8a: Detect hook system

Check which hook system the project uses:

1. **Vite+ project:** `.vite-hooks/` directory exists, OR `package.json` has `"prepare": "vp config"` → use Vite+ hooks
2. **Husky project:** `.husky/` directory exists, OR `package.json` has `"prepare": "husky"` → use Husky hooks
3. **Neither:** Install Husky (see Step 8b)

### Step 8b: Ensure hook infrastructure exists

**For Husky projects (or new installs):**

Check if husky is installed:
```bash
grep -q '"husky"' package.json 2>/dev/null
```

If not installed:
```bash
# Detect package manager
if [ -f pnpm-lock.yaml ]; then
  pnpm add -D husky lint-staged
elif [ -f bun.lockb ] || [ -f bun.lock ]; then
  bun add -D husky lint-staged
elif [ -f yarn.lock ]; then
  yarn add -D husky lint-staged
else
  npm install -D husky lint-staged
fi
```

Ensure `prepare` script exists in package.json:
```json
"scripts": { "prepare": "husky" }
```

Ensure `.husky/` directory exists:
```bash
mkdir -p .husky
```

**For Vite+ projects:** Hooks go in `.vite-hooks/`. Ensure directory exists:
```bash
mkdir -p .vite-hooks
```

### Step 8c: Configure lint-staged

Check if lint-staged config exists in `package.json`. If not, add it:

```json
"lint-staged": {
  "*.{js,ts,jsx,tsx,json,jsonc,css}": "biome format --write --no-errors-on-unmatched"
}
```

**For Vite+ projects:** lint-staged is handled by `vp staged` configured through `vite.config.ts`. Do not add lint-staged config to package.json. If `vp staged` is not configured, check vite.config.ts for staged config. If missing, note this to the user.

### Step 8d: Create hook files

Determine the hooks directory (`$HOOKS_DIR`):
- Husky: `.husky/`
- Vite+: `.vite-hooks/`

**pre-commit** (`$HOOKS_DIR/pre-commit`):

For Husky projects:
```sh
pnpm lint-staged
pnpm typecheck && pnpm lint
```

For Vite+ projects:
```sh
vp staged
```

For bun-based projects (detected by `bun.lockb` or `bun.lock`):
```sh
bun run typecheck && bunx lint-staged
```

**pre-push** (`$HOOKS_DIR/pre-push`):

For Husky projects:
```sh
pnpm typecheck || exit 1
pnpm lint || exit 1
```

For Vite+ projects (adapt to the project's existing scripts):
```sh
pnpm typecheck || exit 1
pnpm lint || exit 1
```

Make both files executable:
```bash
chmod +x $HOOKS_DIR/pre-commit $HOOKS_DIR/pre-push
```

**Important:** If hook files already exist, read them first. Only overwrite if they are missing typecheck or lint steps. Never remove project-specific steps that are already present (like env validation, SDK guards, test runs, etc.).

### Step 8e: Fix turbo.json cache (Turborepo projects only)

If `turbo.json` exists, ensure `typecheck` and `lint` tasks have `cache: false`:

```bash
# Read turbo.json and check cache settings
```

For each task (`typecheck`, `lint`, `check-types`):
- If the task exists and `cache` is not `false`, set `cache: false`
- If the task does not exist, skip it (don't add tasks that aren't defined)

**This is non-negotiable.** Turborepo caching on typecheck/lint is the #1 cause of type errors slipping through git hooks. Turbo replays a cached success exit code without actually running tsc or biome, making hooks pass when they should fail.

**Do NOT disable cache on `build` or `test` tasks** — those have legitimate outputs and benefit from caching.

### Step 8f: Report git hooks

```
Git hooks installed in $HOOKS_DIR/

  pre-commit  →  lint-staged (biome format on staged files) + typecheck + lint
  pre-push    →  full typecheck + lint (safety net before push)
  turbo.json  →  cache: false for typecheck/lint (if applicable)

Errors will now be caught before they leave your machine.
```

</process>

<notes>
## Claude Code hooks
- The biome format hook uses `jq` to extract the file path from the tool input. This is standard on macOS (via Homebrew) and most Linux distros. If jq is missing, the hook silently fails (|| true).
- The Stop hook uses `xargs -r` which is a no-op if there are no files. On macOS, `xargs` without `-r` still works (just runs biome with no args, which exits cleanly).
- The context monitor hooks reference files inside the Arc plugin. If the user uninstalls Arc, these hooks will silently fail (node script not found → exit 1, but hooks don't block).
- `--unsafe` in the Stop hook enables Biome's unsafe fixes (like removing unused imports). This is intentional — at conversation end, we want maximum cleanup.
- The PostToolUse format hook handles both `file_path` (Edit tool) and `filePath` (NotebookEdit) via jq fallback.
- The tsc hook uses `tail -20` to avoid flooding the stop output — just enough to see if there are errors and what they are.
- The git guard uses PreToolUse with `decision: block` to stop destructive commands before execution. This is especially important for users running with `--dangerously-skip-permissions` or liberal auto-approve settings.
- The git guard blocks: `git reset --hard`, `git push --force` / `git push -f`, `git clean -f`, `git checkout .`. These are the operations that destroy uncommitted work with no undo.

## Git hooks
- Husky v9 uses a flat `.husky/` directory — hook files are directly in `.husky/pre-commit`, `.husky/pre-push`, etc. No `_` subdirectory or `husky.sh` sourcing needed.
- Vite+ uses `.vite-hooks/` with a `_/` subdirectory containing the hook runner. `git config core.hooksPath` is set to `.vite-hooks/_` by `vp config`. User hooks go directly in `.vite-hooks/pre-commit`, `.vite-hooks/pre-push`, etc.
- The pre-commit hook runs `pnpm lint-staged` first (fast — only formats staged files), then `pnpm typecheck && pnpm lint` (catches errors before commit).
- The pre-push hook runs the same typecheck + lint as a safety net. It uses `|| exit 1` instead of `&&` so each step reports its own failure.
- **Turborepo cache: false is the most important fix.** Without it, `turbo typecheck` in a git hook may return a cached success from a previous run, silently passing despite new type errors. This is the #1 cause of type errors getting through hooks.
- `cache: false` should ONLY be set on `typecheck`, `lint`, and `check-types` tasks. `build` and `test` tasks should keep their cache — those have real outputs and benefit from caching.
- Never remove project-specific pre-push steps (env validation, SDK guards, case-sensitivity checks, unit tests). Only add missing typecheck/lint steps.
</notes>
