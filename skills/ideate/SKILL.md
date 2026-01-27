---
name: ideate
description: |
  Turn ideas into validated designs through collaborative dialogue.
  Use when asked to "design a feature", "plan an approach", "think through implementation",
  or when starting new work that needs architectural thinking before coding.
license: MIT
metadata:
  author: howells
website:
  order: 3
  desc: Idea → spec
  summary: Talk through your idea with a thinking partner who already knows your codebase. End up with a clear spec of what to build.
  what: |
    Ideate is a conversation with a thinking partner who's already read your code. You describe what you want, it asks clarifying questions, and together you arrive at a concrete spec—user flows, data models, edge cases. Review happens throughout—scope checks early, approach validation mid-flow, simplification at every step.
  why: |
    Vague ideas lead to wasted code. Ideate forces you to get specific—what exactly happens when a user clicks that button?—so you're not making it up as you implement. The conversation surfaces gaps you didn't know you had.
  decisions:
    - Knows your codebase first. Asks informed questions, not generic ones.
    - One question at a time. A real conversation, not a form to fill out.
    - Output is a spec, not code. Implementation comes later with /arc:detail.
  agents:
    - security-engineer
    - performance-engineer
    - architecture-engineer
---

<key_principles>
# Key Principles

These govern every interaction. Return to them constantly.

- **One question at a time** — Don't overwhelm with multiple questions. If a topic needs more exploration, break it into multiple questions across multiple messages.
- **Multiple choice preferred** — Easier to answer than open-ended when possible. Offer 2-4 options.
- **YAGNI ruthlessly** — Remove unnecessary features from all designs. "Do we need this in v1?"
- **Explore alternatives** — Always propose 2-3 approaches before settling. Lead with your recommendation.
- **Review at every stage** — Don't batch feedback at the end. Each phase includes validation before moving forward.
- **Incremental validation** — Present design in 200-300 word sections. Check each before continuing.
- **Be flexible** — Go back and clarify when something doesn't make sense. This is a conversation, not a checklist.
</key_principles>

<vision_context>
**Use Glob tool:** `docs/vision.md`

If `docs/vision.md` exists, read it. Anchor the design conversation to the project's stated goals and constraints. This isn't mandatory — just useful context to ask better questions and keep the design aligned.
</vision_context>

<required_reading>
**Read these reference files NOW:**
1. ${CLAUDE_PLUGIN_ROOT}/references/design-phases.md
2. ${CLAUDE_PLUGIN_ROOT}/references/review-patterns.md
3. ${CLAUDE_PLUGIN_ROOT}/references/model-strategy.md

**For UI work, also load:**
- ${CLAUDE_PLUGIN_ROOT}/references/frontend-design.md
- ${CLAUDE_PLUGIN_ROOT}/references/design-philosophy.md
- ${CLAUDE_PLUGIN_ROOT}/rules/interface/design.md
- ${CLAUDE_PLUGIN_ROOT}/rules/interface/colors.md
- ${CLAUDE_PLUGIN_ROOT}/rules/interface/spacing.md
- ${CLAUDE_PLUGIN_ROOT}/rules/interface/layout.md
</required_reading>

<process>
# The Conversation

This is collaborative dialogue, not a form to fill out. The conversation IS the process.

## Starting Out

**Get oriented so you can ask informed questions (not generic ones):**
- Glance at project structure — what patterns exist? What's the architecture?
- Check `docs/tasklist.md` briefly — if this idea exists there, acknowledge it
- Note similar features that already exist — you'll reference these in questions
- Identify project type (TypeScript/Python/Go) for later reviewer selection

This context-gathering should be **fast and invisible**. Don't dump findings on the user. Use them to ask better questions.

**Then start the conversation:**

"Tell me what you're thinking."

**Wait for their response. Then ask ONE question to clarify.**

The first question should show you understand the codebase:
- "I see you have [existing feature]. Is this related, or completely separate?"
- "The current architecture uses [pattern]. Should this follow that, or is there a reason to diverge?"
- "There's already [similar thing]. Should we extend it or build fresh?"

## Understanding the Idea

Ask questions **one at a time** to refine understanding:
- Purpose: "What problem does this solve?"
- Users: "Who uses this?"
- Scope: "What's the simplest version that's useful?"
- Constraints: "What's explicitly out of scope?"
- Success: "How will you know it's working?"

**Prefer multiple choice when possible:**
```
"Which of these matters most for v1?
A) Speed of implementation
B) Flexibility for future changes
C) Perfect UX
D) Something else?"
```

**Keep going until you can explain the idea in one sentence.** Don't rush to propose solutions. Understanding first.

<conversation_flow>
**When to dig deeper:**
- User says "I'm not sure" → explore together: "What are you trying to avoid?"
- User gives vague answer → get specific: "Can you give me an example?"
- Something doesn't add up → clarify: "Earlier you said X, but this sounds like Y. Which is it?"

**When to move on:**
- You could explain the feature to someone else
- You know what's in scope and what's not
- You understand the constraints and success criteria

**When user is stuck:**
- Offer options: "Would it be more like A or B?"
- Reference what exists: "The way [existing feature] works is... Is this similar?"
- Paint a picture: "So a user would... and then... Is that right?"

**Never assume.** If you're not sure, ask. One more question is better than building the wrong thing.
</conversation_flow>

<scope_check>
**Before proposing solutions, check scope:**

"Before we dive into solutions—is there anything here that's nice-to-have vs must-have?"

If user is unsure, help them clarify:
- "What's the smallest version that would be useful?"
- "If we had to ship in a day, what would we cut?"
- "Which part solves the core problem?"

**Why do this now:** Scope creep is easier to catch before any design work begins. Once you've invested in detailed approaches, it's harder to cut scope without feeling like wasted effort.
</scope_check>

<reference_capture>
**As you talk, capture reference materials:**

When user shares a **Figma link**:
1. Extract fileKey and nodeId from URL
2. Fetch context: `mcp__figma__get_design_context` and `mcp__figma__get_screenshot`
3. Save screenshot to `docs/plans/assets/YYYY-MM-DD-<topic>/`
4. Note in design doc under "## Reference Materials"

When user shares **any link or image**:
1. Acknowledge it
2. Note URL/description for the design doc
3. Ask user to save important images to `docs/plans/assets/` if needed

**Why capture immediately:** Links shared in conversation are lost when session ends. The design doc becomes the single source of truth.
</reference_capture>

**Decision gate:**
When you feel you understand, check:
"I think I understand: [one sentence summary]. Ready for me to propose some approaches, or should we clarify more?"

## Exploring Approaches

**Propose 2-3 approaches with trade-offs:**

Lead with your recommendation and explain why:
"I'd recommend Option A because [reason]. Here's what we'd lose with the alternatives..."

For each option:
- What you gain
- What you lose
- Why you do or don't recommend it

**Keep it conversational.** This isn't a formal document yet.

**Ask which direction appeals to them.** Listen to their reasoning — they have context you don't.

<early_review>
**Once they've chosen an approach, offer a quick sanity check:**

"Before we detail this out—want me to have a couple reviewers sanity-check the approach? Quick check, not a full audit."

**Why now, not later:** Catching architectural issues before investing in detailed design saves significant rework. A 2-minute review now can prevent a 20-minute redesign later.

**If yes:**
- Spawn 2-3 reviewers based on project type:
  - TypeScript/React: architecture-engineer, simplicity-engineer
  - Python: architecture-engineer, simplicity-engineer
  - General: architecture-engineer, security-engineer
- Focus review on: "Is this approach sound for the problem stated?"
- Transform findings into questions (see `${CLAUDE_PLUGIN_ROOT}/references/review-patterns.md`)
- Walk through **one at a time**: "Looking at the approach, one reviewer asked: [question]. What do you think?"

**If no:** Move straight to detailed design. User can always request review later.
</early_review>

## Presenting the Design

Once you've agreed on an approach, present the design **in 200-300 word sections**.

After each section, ask: "Does this look right? Anything here we could simplify or defer to v2?"

If they have concerns → address them before continuing.
If they want to simplify → discuss what to cut and update the section.
If they approve → move to the next section.

**Why ask about simplification per-section:** Complexity is easier to cut before you've built a whole design around it. Each section is a chance to question whether every piece earns its place.

**Sections to cover (as relevant):**
- Problem statement / user story
- High-level approach
- Data model (if applicable)
- Component/module structure
- API surface (if applicable)
- Error handling strategy
- Testing approach

<ui_design>
**For UI work, establish aesthetic direction FIRST:**

Ask (one at a time):
1. "What tone fits this UI?" — minimal, bold, playful, editorial, luxury, brutalist, retro, organic?
2. "What should be memorable about this?" — animation, typography, layout, a specific interaction?
3. "Any existing brand/style to match, or fresh start?"

**Then create ASCII wireframes:**

See `${CLAUDE_PLUGIN_ROOT}/references/ascii-ui-patterns.md` for patterns.

```
┌─────────────────────────────────────┐
│  Logo        [Search...]    [Menu]  │  ← subtle hover animations
├─────────────────────────────────────┤
│                                     │
│  ┌─────────┐  ┌─────────┐          │  ← staggered fade-in
│  │  Card   │  │  Card   │  ...     │
│  └─────────┘  └─────────┘          │
│                                     │
│  [Load More]                        │  ← satisfying click feedback
└─────────────────────────────────────┘
```

Include: key screens, component hierarchy, interactive elements, loading/error/empty states.

Ask: "Does this layout feel right?"
</ui_design>

## Finalization

**Write the design doc:**
Location: `docs/plans/YYYY-MM-DD-<topic>-design.md`

```markdown
# [Feature Name] Design

## Reference Materials
- Figma: [URL] (screenshot: `./assets/figma-*.png`)
- [Any other links shared]

## Problem Statement
[One paragraph]

## Approach
[What we're building and why]

## UI Wireframes
[ASCII wireframes if applicable]

## Design Decisions
| Decision | Rationale |
|----------|-----------|
| ... | ... |

## Open Questions
- [Anything still unresolved]
```

**Commit the design to main:**
```bash
git add docs/plans/
git commit -m "docs: add <topic> design plan"
```

The design doc stays on main — it's the canonical "what we're building."

## What Happens Next

**Present the options clearly:**

"Design committed. There are two paths forward:

**Option A: Create implementation plan first** (Recommended for complex features)
- I'll set up a worktree for isolated development
- Then create a detailed plan with exact file paths and TDD tasks
- You'll review the plan before any code is written

**Option B: Start building directly** (For simpler features)
- I'll set up a worktree and start implementing
- Good when the design is straightforward and you want to move fast

Which fits this feature better?"

**Use AskUserQuestion tool:**
```
Question: "How would you like to proceed?"
Header: "Next step"
Options:
  1. "Create implementation plan first" (Recommended) — Worktree + detailed TDD plan before coding
  2. "Start building directly" — Worktree + implement without formal plan
  3. "Done for now" — Keep just the design, continue later
```

<next_step_routing>
**IMPORTANT: Do NOT automatically invoke skills. Wait for the user to choose, then perform the setup steps only.**

**If Option 1 (implementation plan):**
1. Create worktree: follow `${CLAUDE_PLUGIN_ROOT}/disciplines/using-git-worktrees.md`
2. Branch name: `feature/<topic-slug>`
3. Copy design doc to worktree: `docs/plans/`
4. **STOP.** Tell the user: "Worktree ready. Run `/arc:detail` to create the implementation plan."
5. Do NOT invoke `/arc:detail` yourself — wait for the user to do so.

**If Option 2 (start building):**
1. Create worktree: follow `${CLAUDE_PLUGIN_ROOT}/disciplines/using-git-worktrees.md`
2. Branch name: `feature/<topic-slug>`
3. **STOP.** Tell the user: "Worktree ready. Run `/arc:build` to start implementing."
4. Do NOT invoke `/arc:build` yourself — wait for the user to do so.

**If Option 3 (done for now):**
- Design is complete and committed
- **STOP.** Tell the user they can return later with `/arc:detail` or `/arc:build`
</next_step_routing>
</process>

<progress_append>
After completing the design, append to `docs/progress.md`:

```markdown
## YYYY-MM-DD HH:MM — /arc:ideate
**Task:** [Feature name]
**Outcome:** Complete
**Files:** docs/plans/YYYY-MM-DD-[topic]-design.md
**Decisions:**
- [Key decisions made]
**Next:** /arc:detail or /arc:implement

---
```
</progress_append>

<spec_flow_analysis>
After the design document is written and committed, offer optional user flow analysis:

"Would you like me to analyze this design for missing user flows?"

If the user accepts:
1. Spawn the spec-flow-analyzer agent with the design doc content
2. Present the gaps found
3. Offer to update the design doc with any missing flows

Agent: `${CLAUDE_PLUGIN_ROOT}/agents/workflow/spec-flow-analyzer.md`

This step is optional — skip if the user declines or wants to move straight to implementation.
</spec_flow_analysis>

<success_criteria>
Design is complete when:
- [ ] User's idea is fully understood (you can explain it in one sentence)
- [ ] Scope clarified before proposing solutions
- [ ] 2-3 approaches were considered, trade-offs explained
- [ ] Approach sanity-checked (if user opted for early review)
- [ ] Design presented in sections, each validated with simplification check
- [ ] Design document written and committed to main
- [ ] User chose next step (plan in worktree, build directly, or done)
- [ ] If continuing: worktree created and routed to appropriate skill
</success_criteria>
