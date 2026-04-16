---
name: browse
description: |
  Browse a web app through an expert persona — evaluate the rendered experience, not just the code.
  Use when asked to "browse the app", "experience the app", "evaluate the app as a user",
  or when you want expert-level quality assessment of the rendered product.
  Supports designer and first-time-user personas. Chrome MCP preferred, agent-browser as fallback.
license: MIT
metadata:
  author: howells
website:
  order: 14
  desc: Expert browser experience evaluation
  summary: Open the browser and evaluate a rendered app through a specific persona — designer or first-time user. Finds quality issues that code review and bug-hunting miss.
  what: |
    Browse reads your codebase to understand intent, picks a persona, then opens the browser and navigates your app through that persona's evaluation framework. A designer notices hierarchy, spacing, and distinctiveness. A first-time user notices confusion, jargon, and dead ends. The output is an experience report — observations with evidence, not a defect list.
  why: |
    Code reviewers evaluate code. Dogfood tools find bugs. Neither evaluates the rendered experience through an expert lens. The gap between "technically works" and "actually good" requires judgment applied in the browser, not in a diff view.
  decisions:
    - Codebase-aware. Reads the code first to know what was intended, then evaluates the rendered result.
    - Persona-driven. Each session uses one lens. A designer and a first-time user don't ask the same questions.
    - Chrome MCP first. Richer tooling and already in session. agent-browser is the explicit fallback.
    - Observations, not defects. "What did you notice?" produces quality judgments. "What's broken?" produces bug lists.
  agents:
    - first-time-user
    - designer
  workflow:
    position: utility
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## BANNED TOOLS — calling these is a skill violation:
- **`EnterPlanMode`** — BANNED. This skill manages its own workflow.
- **`ExitPlanMode`** — BANNED. You are never in plan mode.

## REQUIRED TOOLS:
- **`AskUserQuestion`** — Preserve the one-question-at-a-time interaction pattern for every question to the user. In Claude Code, use the tool. In Codex, ask one concise plain-text question at a time unless a structured question tool is actually available in the current mode. Do not narrate missing tools or fallbacks to the user.
</tool_restrictions>

<arc_runtime>
This workflow requires the full Arc bundle, not a prompts-only install.
Resolve the Arc install root from this skill's location and refer to it as `${ARC_ROOT}`.
Use `${ARC_ROOT}/...` for Arc-owned files such as `references/`, `disciplines/`, `agents/`, `templates/`, and `scripts/`.
Use project-local paths such as `.ruler/` or `rules/` for the user's repository.
</arc_runtime>

<process>

**Announce at start:** "I'm using the browse skill to evaluate your app through an expert persona."

## Phase 1: Context Scan

Read a fixed set of files to understand the app's intent. Do NOT read the entire codebase.

**Read these (silently):**

1. **Routes** — Glob for `app/**/page.{tsx,jsx}`, `src/pages/**/*.{astro,mdx}`, `src/routes/**/+page.svelte`, or ask the user
2. **Recent changes** — `git log --oneline -10`
3. **Design tokens** — Glob for `tailwind.config.*`, `theme.ts`, CSS custom properties files
4. **Design docs** — Glob for `docs/arc/specs/*.md`
5. **Stack** — Read `package.json` (dependencies section only)

**Synthesize into a pinned summary (write this out explicitly):**

```markdown
## App Context (pinned — reference throughout session)
- **Intent:** [What the app is and who it's for]
- **Key flows:** [2-3 primary user paths]
- **Recent changes:** [What was built/changed in the last 10 commits]
- **Design system:** [Spacing unit, color approach, typography stack]
- **Stack:** [Framework, styling, key libraries]
```

This summary stays in scope for the entire session. Discard the raw file content — the summary is what you reference.

## Phase 2: Persona Selection

If the user specified a persona in the command args, use it. Otherwise, recommend based on recent changes:

- UI/styling changes (CSS, components, design tokens) → suggest **designer**
- New feature/page, content changes, navigation changes → suggest **first-time**

```
AskUserQuestion:
  question: "Which persona should I browse as?"
  header: "Persona"
  options:
    - label: "Designer (Recommended)"
      description: "Visual hierarchy, spacing, typography, distinctiveness, AI slop detection"
    - label: "First-time User"
      description: "Discoverability, clarity, cognitive load, error recovery, terminology"
```

**After selection, load the persona's knowledge:**

For **Designer:**
1. Read `${ARC_ROOT}/agents/review/designer.md` — judgment criteria
2. Read `${ARC_ROOT}/skills/browse/references/designer-session.md` — browsing strategy

For **First-time User:**
1. Read `${ARC_ROOT}/agents/review/first-time-user.md` — evaluation criteria
2. Read `${ARC_ROOT}/skills/browse/references/first-time-session.md` — browsing strategy

## Phase 3: Browser Setup

### Step 1: Select Browser Tool

Prefer Chrome MCP in Claude Code (`mcp__claude-in-chrome__*` tools).

**If Chrome MCP is available:**
- Use `mcp__claude-in-chrome__tabs_context_mcp` to check existing tabs
- Navigate with `mcp__claude-in-chrome__navigate`
- Screenshot with `mcp__claude-in-chrome__computer` (action: screenshot)
- Read page with `mcp__claude-in-chrome__read_page` or `mcp__claude-in-chrome__get_page_text`
- Interact with `mcp__claude-in-chrome__computer` (action: click, type)
- Console with `mcp__claude-in-chrome__read_console_messages`

**If Chrome MCP is unavailable:**

```
AskUserQuestion:
  question: "Chrome MCP isn't available. Switch to agent-browser, or stop here?"
  header: "Browser"
  options:
    - label: "Use agent-browser"
      description: "CLI browser automation — works headless"
    - label: "Stop"
      description: "I'll set up Chrome MCP and try again later"
```

If agent-browser:
- Navigate with `agent-browser --session browse open {URL}`
- Screenshot with `agent-browser --session browse screenshot --annotate {path}`
- Read page with `agent-browser --session browse snapshot`
- Interact with `agent-browser --session browse click/fill/type`
- Console with `agent-browser --session browse console`

### Step 2: Confirm Target URL

```
AskUserQuestion:
  question: "What URL should I browse?"
  header: "URL"
  options:
    - label: "localhost:3000"
      description: "Default Next.js dev server"
    - label: "localhost:5173"
      description: "Default Vite dev server"
```

Navigate to the URL. If the page doesn't load, tell the user to start their dev server and try again.

## Phase 4: The Session

Follow the browsing strategy loaded in Phase 2 (`references/designer-session.md` or `references/first-time-session.md`). The session reference defines the step-by-step flow.

**General rules for all personas:**

- **Screenshot every observation.** No observation without evidence.
- **Write observations incrementally.** Don't batch for the end. If the session is interrupted, findings are preserved.
- **Target 5-8 observations across 4-6 pages.** Depth on real issues beats breadth on superficial ones.
- **Stay in character.** The designer notices design. The first-time user notices confusion. Don't mix lenses.
- **Reference the App Context.** Every observation should connect to whether the rendered result matches the codebase's intent.
- **Go deeper when you find a cluster.** If one area has multiple issues, investigate further rather than moving on to cover ground.

**After each observation, write it immediately in the report format:**

```markdown
### Observation N: [Short title]
**Screen:** [page/route]
**What I noticed:** [Through the persona's lens]
**Why it matters:** [Impact — what this undermines]
**Evidence:** [screenshot reference]
**Suggestion:** [Optional]
```

## Phase 5: Experience Report

After completing the session (5-8 observations):

1. **Copy the report template:**
   Read `${ARC_ROOT}/skills/browse/templates/experience-report.md`

2. **Create the report:**
   Write to `docs/arc/browse/YYYY-MM-DD-[persona]-[app-name].md`
   Fill in all fields. Include every observation from Phase 4.

3. **Write the summary:**
   2-3 sentences — what's working, what's not, one key recommendation.

4. **Present to the user:**
   Show a brief summary of findings and the report path.

```
AskUserQuestion:
  question: "Report written. What next?"
  header: "Next"
  options:
    - label: "Browse as another persona"
      description: "Run again with a different lens on the same app"
    - label: "Fix the issues"
      description: "Start implementing fixes for the observations"
    - label: "Done"
      description: "Just the report — I'll act on it later"
```

</process>

<progress_append>
After completing the session, append to progress journal:

```markdown
## YYYY-MM-DD HH:MM — /arc:browse
**Task:** Browse [app name] as [persona]
**Outcome:** Complete — [N] observations
**Files:** docs/arc/browse/YYYY-MM-DD-[persona]-[app].md
**Key findings:**
- [Top 2-3 observations]
**Next:** [User's chosen next step]

---
```
</progress_append>

<arc_log>
**After completing this skill, append to the activity log.**
See: `${ARC_ROOT}/references/arc-log.md`

Entry: `/arc:browse — [persona] session on [app] ([N] observations)`
</arc_log>
