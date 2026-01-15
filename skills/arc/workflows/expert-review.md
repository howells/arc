<required_reading>
**Read these reference files NOW:**
1. references/review-patterns.md
</required_reading>

<process>
## Step 1: Load the Plan

**Plan can come from multiple sources:**

1. **Passed as argument** — Plan file path or content provided by calling workflow (e.g., from `/arc:review`)
   - If file path → read the file
   - If content → use directly

2. **Conversation context** — Claude Code's plan mode output
   - Look for plan structure in recent messages
   - Extract and use

3. **User input** — If no plan found
   - Ask user for the plan file path or to paste the plan content

**Store:**
- Plan content
- Source (file path, conversation, or user-provided)

## Step 2: Detect Project Type

Check for project markers:
- `package.json` with Next.js/React → TypeScript
- `pyproject.toml` or `requirements.txt` → Python
- `go.mod` → Go
- None of above → General

Select reviewers based on project type (see SKILL.md `<reviewer_selection>`).

## Step 3: Run Parallel Expert Review

Spawn 3 reviewer agents in parallel using Task tool.

**Model selection for reviewers:**
- Most reviewers: `model: sonnet` (balanced cost/quality for code review)
- Architecture strategist: `model: sonnet` (systems thinking)
- Daniel reviewer (for Daniel's projects): `model: sonnet`

Each reviewer gets:
- The full plan content
- Instructions to focus on their specialty
- Reminder that they're providing recommendations, not requirements

## Step 4: Consolidate and Present

<critical_principle>
**Reviewers advise, the user decides.**

Present all findings as questions, not mandates:
- "Simplicity reviewer suggests removing X. Is this intentional complexity or should we simplify?"
- "Architecture reviewer flags Y as unusual. Is there context they're missing?"
- "Security reviewer notes Z. Is this a real concern for your use case?"
</critical_principle>

**Group findings by category:**
1. **Security flags** - Things that might be vulnerabilities
2. **Architecture concerns** - Structural issues or anti-patterns
3. **Simplification suggestions** - Features reviewers think are unnecessary
4. **Style/convention notes** - Minor improvements

**For each finding, ask:**
"Do you want to: (1) Accept this change, (2) Keep as-is, (3) Discuss further?"

## Step 5: Apply User Decisions

For accepted changes:
- Update the plan document
- Note the change and reasoning

For kept items:
- Document the user's reasoning
- Add to "Design Decisions" section of plan

## Step 6: Finalize

**If plan came from a file:**
- Write updated plan with accepted changes
- Add "## Review Notes" section:
  - Date reviewed
  - Reviewers consulted
  - Key decisions and rationale
- Commit changes:
  ```bash
  git add docs/plans/
  git commit -m "docs: review and update [plan name]"
  ```

**If plan came from conversation (Claude Code plan mode):**
- Summarize recommended changes
- Note: "These are suggestions for your plan. You can accept them in plan mode before proceeding."

**If plan was user-provided:**
- Summarize recommended changes
- User can apply to their plan as they see fit

**Present summary:**
```
Review complete!

✓ Accepted changes: [count]
→ Kept as-is: [count]
💬 Discussed: [count]

[Brief summary of key decisions]
```
</process>

<success_criteria>
Review is complete when:
- [ ] All reviewer findings presented to user
- [ ] User made decision on each finding
- [ ] Plan updated with accepted changes
- [ ] User reasoning documented for rejected suggestions
</success_criteria>
