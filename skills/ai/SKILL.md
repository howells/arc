---
name: ai
description: |
  AI SDK guidance for building AI-powered features. Loads correct patterns, warns about
  deprecated APIs, and guides through chat UIs, agents, structured output, and streaming.
  Use when building AI features, debugging AI SDK errors, or before implementing any AI work.
license: MIT
metadata:
  author: howells
website:
  order: 16
  desc: AI SDK guide
  summary: Load correct AI SDK 6 patterns and avoid deprecated APIs. For chat UIs, agents, structured output, and streaming.
  what: |
    AI loads the right patterns for Vercel AI SDK 6 — the version that renamed ~15 core APIs. It detects your installed version, warns about deprecated APIs, and provides guided reference for chat UIs (useChat v6), agents (ToolLoopAgent), structured output (Output.object), streaming, and OpenRouter integration. Run it before building any AI feature to avoid broken code.
  why: |
    AI SDK v6 renamed or removed ~15 core APIs. Every AI coding tool has memorized the old APIs and will reliably generate broken code. This skill loads the correct patterns so agents produce working code on the first try.
  decisions:
    - Cross-cutting skill. Available anytime, like /arc:deps or /arc:responsive.
    - Loads both patterns (reference) and constraints (rules). Patterns teach what to do. Rules prevent what not to do.
    - Version-aware. Checks installed AI SDK version and warns about v5 → v6 migration.
  workflow:
    position: utility
---

<tool_restrictions>
# MANDATORY Tool Restrictions

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

AI SDK 6 guidance for building AI-powered features.

<required_reading>
**Read after detecting AI SDK (Step 1):**
1. references/ai-sdk.md — Patterns and code examples
2. rules/ai-sdk.md — MUST/NEVER constraints
</required_reading>

<process>

## Step 1: Detect AI SDK

**Check package.json for AI SDK:**

```bash
grep -E '"ai"' package.json
```

**If not found:**
```
AI SDK (`ai` package) not found in this project.

1. Install it — `pnpm add ai @ai-sdk/react @openrouter/ai-sdk-provider`
2. Skip — I'll explain the patterns without a project context
```

Wait for user choice. If install, run the command and continue.

**If found, extract version:**
```bash
grep -A1 '"ai"' package.json | grep -oE '[0-9]+\.[0-9]+\.[0-9]+'
```

**If version < 6:**
```
⚠ AI SDK version [version] detected. Version 6 has breaking changes that affect
almost every API. The patterns I'll load are for v6+.

If you're migrating, I'll highlight what changed. If you're staying on v5, some
patterns won't apply.

Continue with v6 patterns? (recommended even for planning a migration)
```

## Step 2: Load Reference & Rules

**Read the patterns reference:**
```
Read: references/ai-sdk.md
```

**Read the rules (MUST/NEVER constraints):**
```
Read: rules/ai-sdk.md
```

## Step 3: Understand What the User Is Building

Ask what they're working on:

```
AI SDK reference loaded. What are you building?

1. Chat UI — useChat, message rendering, streaming
2. Agent — tool loops, multi-step reasoning
3. Structured output — typed responses from LLMs
4. Streaming API — streamText, server routes
5. All of the above — full reference
6. Debugging — something isn't working
```

Use the AskUserQuestion interaction pattern with these options.

## Step 4: Present Relevant Patterns

Based on user selection, highlight the most relevant sections from the reference:

**Chat UI:** Focus on useChat v6 setup (DefaultChatTransport, manual input state, sendMessage), toUIMessageStreamResponse, typed tool parts.

**Agent:** Focus on ToolLoopAgent, stopWhen: stepCountIs(n), InferAgentUIMessage, createAgentUIStreamResponse with uiMessages.

**Structured output:** Focus on Output.object, Output.array, Output.choice, accessing result.output.

**Streaming:** Focus on streamText, toUIMessageStreamResponse, createAgentUIStreamResponse.

**All:** Present the quick migration table and note which sections are available.

**Debugging:** Ask for the error message. Common issues:
- `toDataStreamResponse is not a function` → renamed to `toUIMessageStreamResponse`
- `Cannot read property 'args'` → renamed to `input`
- `generateObject is not a function` → use `generateText` with `Output.object`
- `maxSteps is not a valid option` → use `stopWhen: stepCountIs(n)`
- Request hangs silently → check prompt size (>100K tokens causes silent failures on OpenRouter)

## Step 5: Load Project Rules (if .ruler/ exists)

**Check for project rules:**
```bash
ls .ruler/ai-sdk.md 2>/dev/null
```

If `.ruler/ai-sdk.md` exists, it's already loaded by build agents. Note this to the user.

If it doesn't exist but `.ruler/` does exist:
```
Your project has coding rules (.ruler/) but no AI SDK rules yet.
I can consult Arc's internal AI SDK rules selectively if they are relevant.
```

## Step 6: Offer Next Steps

```
AI SDK context loaded. Ready to build.

1. Start building → /arc:implement
2. Review existing AI code → I'll check for deprecated API usage
3. Set up from scratch → I'll scaffold the provider, route, and component
```

If user selects "Review existing AI code":
- Grep for deprecated patterns: `generateObject`, `maxTokens`, `maxSteps`, `toDataStreamResponse`, `addToolResult`, `part.args`, `part.result`, `tool-invocation`
- Report findings with file:line references and the correct v6 replacement

</process>

<notes>
- This skill is cross-cutting — invoke anytime, not just during implementation
- The reference file (references/ai-sdk.md) is also loaded by /arc:implement when it detects `ai` in package.json
- The rules file (rules/ai-sdk.md) is Arc-owned reference material. Consult it selectively when AI SDK work needs those conventions.
- OpenRouter is the default provider per stack.md. The patterns use it throughout.
</notes>
