---
name: review
description: Run expert review on a plan. Spawns parallel reviewer agents and presents findings as Socratic questions for collaborative refinement.
---

<required_reading>
**Read these reference files NOW:**
1. ${CLAUDE_PLUGIN_ROOT}/references/review-patterns.md
</required_reading>

<process>
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
   ```bash
   ls -t docs/plans/*.md | head -10
   ```
   - Sort by modification time (newest first)
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

**Detect project type for reviewer selection:**

```bash
# Check for framework indicators
grep -l "next" package.json 2>/dev/null && echo "nextjs"
grep -l "react" package.json 2>/dev/null && echo "react"
ls requirements.txt pyproject.toml 2>/dev/null && echo "python"

# Check for Daniel's projects
ls .ruler/ 2>/dev/null || grep -l "@materia/" src/**/*.ts 2>/dev/null && echo "daniel-project"
```

**Select reviewers based on project type:**

**Daniel's projects:**
- ${CLAUDE_PLUGIN_ROOT}/agents/review/daniel-reviewer.md
- ${CLAUDE_PLUGIN_ROOT}/agents/review/code-simplicity-reviewer.md

**TypeScript/React:**
- ${CLAUDE_PLUGIN_ROOT}/agents/review/daniel-reviewer.md
- ${CLAUDE_PLUGIN_ROOT}/agents/review/senior-reviewer.md
- ${CLAUDE_PLUGIN_ROOT}/agents/review/architecture-strategist.md

**Next.js:**
- ${CLAUDE_PLUGIN_ROOT}/agents/review/lee-nextjs-reviewer.md
- ${CLAUDE_PLUGIN_ROOT}/agents/review/daniel-reviewer.md
- ${CLAUDE_PLUGIN_ROOT}/agents/review/senior-reviewer.md

**Python:**
- ${CLAUDE_PLUGIN_ROOT}/agents/review/senior-reviewer.md
- ${CLAUDE_PLUGIN_ROOT}/agents/review/performance-oracle.md
- ${CLAUDE_PLUGIN_ROOT}/agents/review/architecture-strategist.md

**General/Unknown:**
- ${CLAUDE_PLUGIN_ROOT}/agents/review/senior-reviewer.md
- ${CLAUDE_PLUGIN_ROOT}/agents/review/architecture-strategist.md
- ${CLAUDE_PLUGIN_ROOT}/agents/review/code-simplicity-reviewer.md

## Phase 3: Run Parallel Expert Review

Spawn 3 reviewer agents in parallel:

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

**Offer next steps:**
- "Ready to create an implementation plan?" → /arc:detail
- "Want to start implementing?" → /arc:implement
- "Done for now" → end

</process>

<success_criteria>
Review is complete when:
- [ ] Plan located (conversation, file, or user-provided)
- [ ] Project type detected and reviewers selected
- [ ] Parallel expert review completed (3 agents)
- [ ] All findings presented as Socratic questions
- [ ] User made decisions on each finding
- [ ] Plan updated (if from file)
- [ ] Summary presented
- [ ] User offered next steps
</success_criteria>
