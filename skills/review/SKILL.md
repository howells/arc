---
name: review
description: |
  Run expert review on a plan, spec, or implementation approach with parallel reviewer agents. Presents findings as Socratic questions.
  Use when asked to "review the plan", "check this approach",
  or before implementation to validate architectural decisions.

  Optional argument: reviewer name (e.g., `/arc:review daniel-product-engineer`)
license: MIT
metadata:
  author: howells
website:
  order: 5
  desc: Get expert eyes
  summary: Get feedback from specialized reviewers—security, performance, architecture, and more. Runs automatically during ideate, or on-demand for plans and implementation approaches.
  what: |
    Review spins up specialized agents based on the plan, spec, or approach being evaluated—a new auth flow gets security and architecture reviewers, a database change gets the data engineer. Each agent reviews independently, then their feedback is consolidated into a prioritized list of concrete items: things to fix, questions to answer, risks to consider.
  why: |
    No single perspective catches everything. Review gives you a panel of experts without the scheduling overhead. It runs automatically at the end of /arc:ideate, but you can also invoke it on a plan, spec, or approach you're unsure about.
  decisions:
    - Runs during ideate automatically. You don't have to remember to ask for review.
    - Agent selection is dynamic. It picks reviewers based on the plan scope.
    - Output is prioritized and concrete. Not vague concerns—specific items you can act on.
  agents:
    - security-engineer
    - performance-engineer
    - architecture-engineer
    - data-engineer
    - mastra-agent-engineer
    - senior-engineer
  workflow:
    position: spine
    after: ideate
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

<required_reading>
**Read these reference files NOW:**
1. references/review-patterns.md
2. disciplines/dispatching-parallel-agents.md
3. disciplines/receiving-code-review.md
</required_reading>

<rules_context>
**Check for project coding rules:**

**Use Glob tool:** `.ruler/*.md`

**Determine rules source:**
- **If `.ruler/` exists:** Read rules from `.ruler/`
- **If `.ruler/` doesn't exist:** Read rules from `rules/`

**Pass relevant core rules to each reviewer:**

| Reviewer | Rules to Pass |
|----------|--------------|
| daniel-product-engineer | react.md, typescript.md, code-style.md |
| lee-nextjs-engineer | nextjs.md, api.md |
| senior-engineer | code-style.md, typescript.md, react.md |
| architecture-engineer | stack.md, turborepo.md |
| mastra-agent-engineer | api.md, integrations.md, typescript.md |
| security-engineer | security.md, api.md, env.md |
| data-engineer | database.md, testing.md, api.md |
| senior-engineer | cloudflare-workers.md (if wrangler.toml exists) |
| accessibility-engineer | (interface rules only — already in agent prompt) |
</rules_context>

<scope_discipline>
## Scope Discipline

Reviewers must respect the plan's scope. This is non-negotiable:

- **Do not silently argue for less work.** If you think the plan is overbuilt, raise it once in a "Scope Check" early in the review. After the user responds, commit to their decision.
- **Do not sneak in additional scope.** Don't suggest features, enhancements, or "while you're at it" additions beyond what the plan covers.
- **Your job is to make this plan succeed, not to lobby for a different plan.** Once scope is agreed, optimize within it — find bugs, catch edge cases, improve the architecture — but don't re-litigate what gets built.
- **Include this principle in every reviewer prompt:** "Respect the plan's scope. Flag scope concerns once, then commit to making the plan succeed."
</scope_discipline>

<process>
## Phase 0: Check for Specific Reviewer

**If argument provided** (e.g., `daniel-product-engineer`):
- Look for `agents/review/{argument}.md`
- If found → use only this reviewer, skip Phase 2 detection
- If not found → list available reviewers from `agents/review/` and ask user to pick

**Available reviewers:**
- `daniel-product-engineer` — Type safety, UI completeness, React patterns
- `lee-nextjs-engineer` — Next.js App Router, server-first architecture
- `senior-engineer` — Asymmetric strictness, review discipline
- `architecture-engineer` — System design, component boundaries
- `performance-engineer` — Bottlenecks, scalability
- `security-engineer` — Vulnerabilities, OWASP
- `data-engineer` — Migrations, transactions
- `mastra-agent-engineer` — Mastra, agents, workflows, tools, memory/RAG, MCP, agent-readable surfaces

## Phase 1: Find the Plan

**Check if plan file path provided as argument:**
- If yes → read that file and proceed to Phase 2
- If no → search for plans

**Search strategy:**

1. **Check conversation context first** — Look for Claude Code plan mode output
   - Look back through recent conversation messages
   - Search for plan structure markers:
     - "# Plan" or "## Plan" headings
     - "Implementation Steps" sections
     - Task lists with implementation details
     - Step-by-step procedures
   - If found → extract the plan content and proceed to Phase 2

2. **Search Arc plan folders** — Look for plan files

   **Use Glob tool:** `docs/arc/plans/*.md`
   **Fallback:** `docs/plans/*.md`

   - Sort results by modification time (newest first)
   - Show all plan/spec files (feature specs, implementation plans, etc.)

3. **Present options if multiple found:**
   - List up to 5 most recent plans
   - Show: filename, modification date, brief preview
   - Ask user: "Which plan should I review?"

4. **If no plans found:**
   - "I couldn't find a plan to review. Can you point me to a plan file, paste the plan, or describe the approach you'd like reviewed?"

**Once plan located:**
- Store the plan content
- Note the source (conversation, file path, or user-provided)
- Proceed to Phase 2

## Phase 2: Detect Project Type

**Skip if specific reviewer provided in Phase 0.**

**Detect project type for reviewer selection:**

**Use Grep tool on `package.json`:**
- Pattern: `"next"` → nextjs
- Pattern: `"react"` → react

**Use Glob tool:**
- `requirements.txt`, `pyproject.toml` → python

**Select reviewers based on project type:**

**TypeScript/React:**
- agents/review/daniel-product-engineer.md
- agents/review/senior-engineer.md
- agents/review/architecture-engineer.md

**Next.js:**
- agents/review/lee-nextjs-engineer.md
- agents/review/daniel-product-engineer.md
- agents/review/senior-engineer.md

**Python:**
- agents/review/senior-engineer.md
- agents/review/performance-engineer.md
- agents/review/architecture-engineer.md

**General/Unknown:**
- agents/review/senior-engineer.md
- agents/review/architecture-engineer.md

**Conditional addition (all UI project types):**
- If plan involves UI components, forms, or user-facing features → add `agents/review/accessibility-engineer.md`

**Conditional addition (all project types):**
- If `package.json` includes `@mastra/*` or the plan involves agents, tools, workflows, memory, RAG, MCP, model routing, browser/sandbox capabilities, or agent-readable software surfaces → add `agents/review/mastra-agent-engineer.md`

## Phase 3: Run Expert Review

**If specific reviewer from Phase 0:** Spawn single reviewer agent.

**Otherwise:** Spawn selected reviewer agents in parallel:

```
Task [reviewer-1] model: sonnet: "Review this plan for [specialty concerns].
Plan:
[plan content]

Focus on: [specific area based on reviewer type]"

Task [reviewer-2] model: sonnet: "Review this plan for [specialty concerns]..."

Task [reviewer-3] model: sonnet: "Review this plan for [specialty concerns]..."

Task [conditional-reviewer] model: sonnet: "Review this plan for [specialty concerns]..."
```

## Phase 4: Consolidate and Present

**Transform findings into Socratic questions:**

See `references/review-patterns.md` for approach.

Instead of presenting critiques:
- Turn findings into exploratory questions
- "What if we..." not "You should..."
- Collaborative spirit, not adversarial

**Example transformations:**
- Reviewer: "This is overengineered"
  → "We have three layers here. What if we started with one?"
- Reviewer: "Missing error handling"
  → "What happens if the API call fails? Should we handle that now or later?"
- Reviewer: "Security concern"
  → "This stores the token in localStorage. Is that acceptable for this use case?"

**Present questions one at a time:**
- Wait for user response
- If user wants to keep something, they probably have context
- Track decisions as you go

## Phase 5: Apply Decisions

For each decision:
- Note what was changed
- Note what was kept and why

If plan came from a file:
- Update the file with changes
- Leave git commit decisions to `/arc:commit` or the user.

## Phase 6: Summary and Next Steps

```markdown
## Review Summary

**Reviewed:** [plan name/source]
**Reviewers:** [list]

### Changes Made
- [Change 1]
- [Change 2]

### Kept As-Is
- [Decision 1]: [reason]

### Open Questions
- [Any unresolved items]
```

**Show remaining arc:**
```
/arc:ideate     → Feature spec ✓
     ↓
/arc:review     → Review ✓ YOU ARE HERE
     ↓
/arc:implement  → Plan + Execute task-by-task
```

**Offer next steps based on what was reviewed:**

If reviewed a **feature spec**:
- "Ready to implement?" → `/arc:implement` (which will create the plan internally)
- "Done for now" → end

If reviewed an **implementation plan**:
- "Ready to implement?" → `/arc:implement`
- "Done for now" → end

</process>

<arc_log>
**After completing this skill, append to the activity log.**
See: `references/arc-log.md`

Entry: `/arc:review — [Plan name] reviewed`
</arc_log>

<success_criteria>
**Plan review** is complete when:
- [ ] Plan located (conversation, file, or user-provided)
- [ ] Project type detected and reviewers selected
- [ ] Parallel expert review completed (selected agents)
- [ ] All findings presented as Socratic questions
- [ ] User made decisions on each finding
- [ ] Plan updated (if from file)
- [ ] Summary presented
- [ ] Remaining arc shown (based on plan type)
- [ ] User chose next step (`/arc:implement` or done)
- [ ] Orphaned agents cleaned up
</success_criteria>
