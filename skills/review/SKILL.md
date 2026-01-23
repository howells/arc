---
name: review
description: |
  Run expert review on a plan with parallel reviewer agents. Presents findings as Socratic questions.
  Use when asked to "review the plan", "get feedback on the design", "check this approach",
  or before implementation to validate architectural decisions.

  Optional argument: reviewer name (e.g., `/arc:review daniel-product-engineer` to use a specific reviewer)
license: MIT
metadata:
  author: howells
---

<required_reading>
**Read these reference files NOW:**
1. ${CLAUDE_PLUGIN_ROOT}/references/review-patterns.md
2. ${CLAUDE_PLUGIN_ROOT}/disciplines/dispatching-parallel-agents.md
3. ${CLAUDE_PLUGIN_ROOT}/disciplines/receiving-code-review.md
</required_reading>

<progress_context>
**Use Read tool:** `docs/progress.md` (first 50 lines)

Check for context on what led to the plan being reviewed.
</progress_context>

<process>
## Phase 0: Check for Specific Reviewer

**If argument provided** (e.g., `daniel-product-engineer`):
- Look for `${CLAUDE_PLUGIN_ROOT}/agents/review/{argument}.md`
- If found → use only this reviewer, skip Phase 2 detection
- If not found → list available reviewers from `${CLAUDE_PLUGIN_ROOT}/agents/review/` and ask user to pick

**Available reviewers:**
- `daniel-product-engineer` — Type safety, UI completeness, React patterns
- `lee-nextjs-engineer` — Next.js App Router, server-first architecture
- `senior-engineer` — Asymmetric strictness, review discipline
- `architecture-engineer` — System design, component boundaries
- `simplicity-engineer` — YAGNI, minimalism
- `performance-engineer` — Bottlenecks, scalability
- `security-engineer` — Vulnerabilities, OWASP
- `data-engineer` — Migrations, transactions

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

2. **Search docs/plans/ folder** — Look for plan files

   **Use Glob tool:** `docs/plans/*.md`

   - Sort results by modification time (newest first)
   - Show all plan files (design, implementation, etc.)

3. **Present options if multiple found:**
   - List up to 5 most recent plans
   - Show: filename, modification date, brief preview
   - Ask user: "Which plan should I review?"

4. **If no plans found:**
   - "I couldn't find any plans in the conversation or in `docs/plans/`.
   - Can you point me to a plan file, or paste the plan you'd like me to review?"

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
- `.ruler/*.md` → daniel-project (has coding rules)

**Use Grep tool on `src/**/*.ts`:**
- Pattern: `@materia/` → daniel-project

**Select reviewers based on project type:**

**Daniel's projects:**
- ${CLAUDE_PLUGIN_ROOT}/agents/review/daniel-product-engineer.md
- ${CLAUDE_PLUGIN_ROOT}/agents/review/simplicity-engineer.md

**TypeScript/React:**
- ${CLAUDE_PLUGIN_ROOT}/agents/review/daniel-product-engineer.md
- ${CLAUDE_PLUGIN_ROOT}/agents/review/senior-engineer.md
- ${CLAUDE_PLUGIN_ROOT}/agents/review/architecture-engineer.md

**Next.js:**
- ${CLAUDE_PLUGIN_ROOT}/agents/review/lee-nextjs-engineer.md
- ${CLAUDE_PLUGIN_ROOT}/agents/review/daniel-product-engineer.md
- ${CLAUDE_PLUGIN_ROOT}/agents/review/senior-engineer.md

**Python:**
- ${CLAUDE_PLUGIN_ROOT}/agents/review/senior-engineer.md
- ${CLAUDE_PLUGIN_ROOT}/agents/review/performance-engineer.md
- ${CLAUDE_PLUGIN_ROOT}/agents/review/architecture-engineer.md

**General/Unknown:**
- ${CLAUDE_PLUGIN_ROOT}/agents/review/senior-engineer.md
- ${CLAUDE_PLUGIN_ROOT}/agents/review/architecture-engineer.md
- ${CLAUDE_PLUGIN_ROOT}/agents/review/simplicity-engineer.md

## Phase 3: Run Expert Review

**If specific reviewer from Phase 0:** Spawn single reviewer agent.

**Otherwise:** Spawn 3 reviewer agents in parallel:

```
Task [reviewer-1] model: sonnet: "Review this plan for [specialty concerns].
Plan:
[plan content]

Focus on: [specific area based on reviewer type]"

Task [reviewer-2] model: sonnet: "Review this plan for [specialty concerns]..."

Task [reviewer-3] model: sonnet: "Review this plan for [specialty concerns]..."
```

## Phase 4: Consolidate and Present

**Transform findings into Socratic questions:**

See `${CLAUDE_PLUGIN_ROOT}/references/review-patterns.md` for approach.

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
- Commit: `git commit -m "docs: update <plan> based on review"`

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

**Show remaining arc (if reviewing implementation plan):**
```
/arc:ideate     → Design doc (on main) ✓
     ↓
/arc:detail     → Implementation plan ✓
     ↓
/arc:review     → Review implementation plan ✓ YOU ARE HERE
     ↓
/arc:implement  → Execute task-by-task
```

**Offer next steps based on what was reviewed:**

If reviewed a **design doc**:
- "Ready to create an implementation plan?" → `/arc:detail`
- "Done for now" → end

If reviewed an **implementation plan**:
- "Ready to implement?" → `/arc:implement`
- "Done for now" → end

## Phase 7: Cleanup

**Kill orphaned subagent processes:**

After spawning reviewer agents, some may not exit cleanly. Run cleanup:

```bash
${CLAUDE_PLUGIN_ROOT}/scripts/cleanup-orphaned-agents.sh
```

</process>

<progress_append>
After completing the review, append to progress journal:

```markdown
## YYYY-MM-DD HH:MM — /arc:review
**Task:** Review [plan name]
**Outcome:** Complete
**Files:** [Plan file if updated]
**Decisions:**
- [Key change 1]
- [Key change 2]
**Next:** /arc:implement or done

---
```
</progress_append>

<success_criteria>
Review is complete when:
- [ ] Plan located (conversation, file, or user-provided)
- [ ] Project type detected and reviewers selected
- [ ] Parallel expert review completed (3 agents)
- [ ] All findings presented as Socratic questions
- [ ] User made decisions on each finding
- [ ] Plan updated (if from file)
- [ ] Summary presented
- [ ] Remaining arc shown (based on plan type)
- [ ] User chose next step (detail/implement or done)
- [ ] Progress journal updated
- [ ] Orphaned agents cleaned up
</success_criteria>
