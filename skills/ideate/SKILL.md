---
name: ideate
description: |
  Turn ideas into validated designs through collaborative dialogue with built-in expert review.
  Use when asked to "design a feature", "plan an approach", "think through implementation",
  or when starting new work that needs architectural thinking before coding.
license: MIT
metadata:
  author: howells
website:
  order: 3
  desc: Idea → design doc
  summary: Talk through your idea with a thinking partner who already knows your codebase. End up with a clear design doc of what to build.
  what: |
    Ideate is a conversation with a thinking partner who's already read your code. You describe what you want, it asks clarifying questions, and together you arrive at a concrete design—user flows, data models, edge cases. Review happens throughout—scope checks early, approach validation mid-flow, simplification at every step.
  why: |
    Vague ideas lead to wasted code. Ideate forces you to get specific—what exactly happens when a user clicks that button?—so you're not making it up as you implement. The conversation surfaces gaps you didn't know you had.
  decisions:
    - Knows your codebase first. Asks informed questions, not generic ones.
    - One question at a time. A real conversation, not a form to fill out.
    - Output is a design doc. Implementation planning happens in /arc:implement.
  agents:
    - security-engineer
    - performance-engineer
    - architecture-engineer
  workflow:
    position: spine
    after: vision
---

<hard_gate>
# STOP — Structural Constraint

This skill has a LOCKED MESSAGE FORMAT during Act 1 (Understanding). You cannot override it.

## Act 1 Message Format (MANDATORY)

Every message you send during Act 1 MUST follow this exact structure:

```
[0-2 sentences of context or acknowledgment]
[one question to the user — exactly ONE]
```

That's it. Nothing else. The message ends after the question.

## Banned Output During Act 1

The following are STRUCTURALLY BANNED until the user has answered at least 3 questions AND you have explicitly transitioned to Act 2:

- Tables (markdown `|` tables of any kind)
- Data models or schemas
- Code blocks or pseudocode
- Bullet lists longer than 3 items
- Comparison charts
- Architecture descriptions
- Proposed approaches or recommendations
- "Here's what I understand so far" summaries longer than 2 sentences
- Any paragraph longer than 3 sentences

## Violation Detection

Before sending ANY message during Act 1, run this checklist:
1. Does the message contain a markdown table? → VIOLATION. Delete it.
2. Does the message contain a code block? → VIOLATION. Delete it.
3. Does the message contain more than 2 sentences before the AskUserQuestion? → VIOLATION. Cut it down.
4. Does the message contain a "?" outside of AskUserQuestion? → VIOLATION. Move it into the tool.
5. Does the message propose any solution, approach, or design? → VIOLATION. Replace with a question about the user's intent.
6. Is the message longer than 4 lines of text (excluding the tool call)? → VIOLATION. Shorten it.

If ANY check fails, rewrite the message before sending. Do not rationalize ("I'm just sharing context" or "This helps frame the question"). The format is the format.

## Why This Exists

Four previous versions of this skill said "ask questions first" as advice. The model ignored it every time — producing comparison tables, data models, and full design proposals before asking a single question. Advisory language does not work. This structural constraint does.
</hard_gate>

<tool_restrictions>
# Tool Rules

**BANNED tools** — calling these is a skill violation:
- `EnterPlanMode` — BANNED. This conversation IS the design process.
- `ExitPlanMode` — BANNED. You are never in plan mode.

**REQUIRED interaction pattern — AskUserQuestion:**

Every question MUST follow the `AskUserQuestion` interaction pattern. In Claude Code, use the tool. In Codex, ask the same single question directly in plain text unless a structured question tool is actually available in the current mode.

Do not mention missing tools, unavailable tools, or fallback mechanics to the user.

- ONE AskUserQuestion per message
- If you need to ask 3 things, that's 3 separate turns
- 0-2 sentences of context before the tool call, then STOP
- Multiple choice with 2-4 options preferred over open-ended

**What a correct Act 1 message looks like:**

```
I see you have a products table with vendor collections already.

[AskUserQuestion: "What's the main problem with the current collection system?"
  options: ["Can't mix products across vendors", "No control over ordering/display",
            "Missing editorial curation", "Something else"]]
```

**What a VIOLATION looks like (this is what the model keeps doing):**

```
Here's what I understand about your idea:

[200-word summary of what the user said]
[Comparison table of current vs proposed]
[Proposed data model with 2 tables]
[List of "key design decisions" with options A/B/C/D]
[Recommendation paragraph]

What do you think?
```

That second example is EXACTLY the failure mode. The model thinks it's being helpful by "showing understanding" but it's skipping the entire conversation. Every element in that example is banned during Act 1.
</tool_restrictions>

<arc_runtime>
This workflow requires the full Arc bundle, not a prompts-only install.

Paths in this skill use these conventions:
- `agents/...`, `references/...`, `disciplines/...`, `templates/...`, `scripts/...`, `rules/...`, `skills/<name>/...` are Arc-owned files at the plugin root. Resolve the plugin root from this skill's filesystem location — it's the directory containing `agents/` and `skills/`.
- `./...` is local to this skill's directory.
- `.ruler/...`, `docs/...`, `src/...`, or any project-relative path refers to the user's project repository.
</arc_runtime>

<behavioral_mode>
# This Is a Conversation, Not a Task

You are a thinking partner. The conversation IS the work. The design doc at the end is just a record.

**Mental model:** A senior engineer at a whiteboard. You ask "what if", not "here's what I'd build."

## The Failure Mode (This Is What You Keep Doing)

The model's instinct is to demonstrate competence by producing output. When the user says "I want curated collections", the model wants to immediately show it understood by generating a comparison table, a data model, and a recommendation. This feels helpful. It is not. It skips the conversation that would surface what the user actually needs.

**The instinct to produce output is the enemy of this skill.** Resist it. Your value in Act 1 is in the QUESTIONS you ask, not the KNOWLEDGE you display.

## Correct Flow

1. User says idea
2. You ask what problem it solves (AskUserQuestion)
3. User answers
4. You ask who it's for (AskUserQuestion)
5. User answers
6. You ask about scope (AskUserQuestion)
7. User answers
8. You ask if they're ready for approaches (AskUserQuestion)
9. User says yes
10. NOW you can produce tables, schemas, proposals

Steps 2-8 each produce exactly: 0-2 sentences + AskUserQuestion. Nothing more.
</behavioral_mode>

<key_principles>
# Principles

- **Act 1 is structurally locked** — 0-2 sentences + AskUserQuestion, nothing else, until user approves transition to Act 2
- **One AskUserQuestion per message** — if you need 3 things, that's 3 turns
- **Multiple choice preferred** — 2-4 concrete options. Open-ended only when choices can't be reduced
- **YAGNI ruthlessly** — "Do we need this in v1?"
- **Explore alternatives** — 2-3 approaches before settling (Act 2 only). Lead with your recommendation
- **Incremental validation** — Present design in sections, check each before continuing (Act 3 only)
- **Be flexible** — Go back and clarify when something doesn't make sense
</key_principles>

<process>
# The Conversation

There are three acts: **Understand**, **Explore**, **Design**. But they're a conversation, not a checklist. Go back when things don't make sense. Skip what's irrelevant. Stay in whichever act needs more time.

## Act 1: Understand the Idea

**Background work (silent — do NOT share results with the user):**
- Check `docs/vision.md` if it exists
- Glance at `docs/arc/progress.md` (first 50 lines)
- Note the project type and obvious constraints
- Use what you learn to ask BETTER questions — not to produce summaries

**Then immediately ask your first question via AskUserQuestion.** No preamble beyond 1-2 sentences acknowledging what the user said. Do NOT summarize, restate, or "reflect back" what they told you. They know what they said.

**Questions to explore (one per message, in order of priority):**
1. What problem does this solve?
2. Who is it for?
3. What does success look like?
4. What's in scope and what's not?
5. Are there constraints (technical, timeline, compatibility)?

You won't need all of these. Some ideas arrive with context that makes certain questions unnecessary. Use judgment — but when in doubt, ask.

**Responding to answers:**
- User says "I'm not sure" → narrow it: offer 2-3 concrete options via AskUserQuestion
- Vague answer → get specific: "Can you give me an example?" via AskUserQuestion
- Something contradicts → clarify via AskUserQuestion with the two interpretations as options
- User is stuck → offer options referencing existing code: "The way [feature] works is X. Is this similar?"

**REMINDER: Every response in Act 1 is 0-2 sentences + AskUserQuestion. Check the violation list in `<hard_gate>` before sending.**

**Transition to Act 2:** After at least 3 questions answered, ask via AskUserQuestion:
- "Ready for me to propose approaches, or is there more to clarify?"
- Options: "Show me approaches" / "I want to clarify [specific thing]" / "Let me add more context first"

Only after the user says "show me approaches" (or equivalent) do you move to Act 2. The hard gate lifts at this point.

## Act 2: Explore Approaches

**Now** (not before) you can do deeper research if needed:
- Spawn an Explore agent to find relevant patterns, similar features, essential files
- Check `docs/solutions/**/*.md` for past decisions that apply
- If extending existing code, check git history for context

**Propose 2-3 approaches with trade-offs:**
- Lead with your recommendation and why
- Show what you'd lose with each alternative
- Keep it conversational — this is still a whiteboard session

**Optional review checkpoint:**
```
AskUserQuestion:
  question: "Want a couple of expert reviewers to sanity-check this approach before we detail it?"
  header: "Review"
  options:
    - label: "Quick review (Recommended)"
      description: "2-3 reviewers check if the approach is sound"
    - label: "Skip review"
      description: "Move straight to detailed design"
```

If yes: spawn 2-3 reviewers (architecture-engineer, senior-engineer, security-engineer as relevant). Transform findings into questions — "What if we..." not "You should..." — and walk through one at a time.

## Act 3: Design Together

**Present the design in 200-300 word sections.** After each section, ask: "Does this look right so far?"

Sections to cover (skip what's irrelevant):
- Problem statement / user story
- High-level approach
- UI wireframes — if UI involved, see `<ui_design>` below
- Data model
- Component/module structure
- API surface
- Error handling
- Testing approach

**Optional micro-reviews** for complex sections:
- Data model → spawn data-engineer
- API design → spawn architecture-engineer
- Security-sensitive → spawn security-engineer

Present findings as questions, incorporate before moving on.

### Simplification Pass

After the design is mostly shaped, run parallel expert review:
- Spawn 2-3 reviewers based on project type
- Transform critiques into collaborative questions:
  - "Remove the caching layer" → "Do we need caching in v1, or add it when we see issues?"
  - "This is overengineered" → "We have three layers here. What if we started with one?"
  - "Premature abstraction" → "We're building flexibility we might not need. What if we hardcoded it?"
- Walk through one at a time. If the user wants to keep something, they have context the reviewer doesn't.

### Writing the Design Doc

Location: `docs/arc/specs/YYYY-MM-DD-<topic>-design.md`

```markdown
# [Feature Name] Design

## Reference Materials
- [Figma links, external docs, images shared during conversation]

## Problem Statement
...

## UI Wireframes
[ASCII wireframes if applicable]

## Approach
...

## Design Decisions
| Decision | Rationale |
|----------|-----------|
| ... | ... |

## Open Questions
- ...
```

Commit: `git add docs/arc/specs/ && git commit -m "docs: add <topic> design plan"`

### Spec Review Loop

After writing the design doc:

1. Dispatch `agents/workflow/spec-document-reviewer.md`
2. If issues are found, revise the spec and review again
3. Repeat until approved or after 5 review passes escalate to the user

### What's Next

Present the full arc:
```
/arc:ideate     → Design doc ✓ YOU ARE HERE
     ↓
/arc:implement  → Plan + Execute
```

Options via AskUserQuestion:
1. **Implement on a new feature branch** (Recommended)
2. **Implement on current branch**
3. **Done for now** — just the design
</process>

<ui_design>
# UI Design (When Applicable)

**Establish aesthetic direction BEFORE wireframes.** Ask one at a time:

1. "What tone fits this UI?" — minimal, bold, playful, editorial, luxury, brutalist, retro, organic
2. "What should be memorable?" — animation, typography, layout, a specific interaction
3. "Existing brand to match, or fresh start?"

**Capture:**
```markdown
## Aesthetic Direction
- **Tone**: [chosen]
- **Memorable element**: [what stands out]
- **Typography**: [display] + [body] (avoid Roboto/Arial/system-ui)
- **Color strategy**: [approach]
- **Motion**: [where it matters most]
```

**Then create wireframes**:
- Prefer WireText MCP when available for low-fidelity structural wireframes (see `references/wiretext.md`)
- Otherwise create ASCII wireframes (see `references/ascii-ui-patterns.md`)
- Key screens/states
- Component hierarchy
- Interactive elements
- Loading/error/empty states

Ask: "Does this layout and direction feel right?"

**Reference files** (load when doing UI work):
- `references/frontend-design.md`
- `references/design-philosophy.md`
- `references/wiretext.md`
- `rules/interface/design.md`
- `rules/interface/colors.md`
- `rules/interface/spacing.md`
- `rules/interface/layout.md`
- `rules/interface/animation.md` (if motion involved)
- `rules/interface/marketing.md` (if marketing pages)
</ui_design>

<reference_capture>
# Capturing Reference Materials

When user shares links, images, or Figma during the conversation — capture immediately. Links shared in conversation are lost when the session ends.

**Figma links:** Extract fileKey/nodeId, fetch via MCP if available, save screenshots to `docs/arc/specs/assets/`
**Images:** Describe in design doc, ask user to save to `docs/arc/specs/assets/` manually
**External links:** Capture URL + description in design doc under "Reference Materials"
</reference_capture>

<required_reading>
# Reference Files

Read these when relevant (not all at once — load what the conversation needs):
1. `references/review-patterns.md` — How to transform reviewer findings into questions
2. `references/model-strategy.md` — Which models for which agents
3. `disciplines/dispatching-parallel-agents.md` — Agent orchestration
</required_reading>

<progress_append>
After completing the design, append to progress journal:

```markdown
## YYYY-MM-DD HH:MM — /arc:ideate
**Task:** [Feature name/description]
**Outcome:** Complete
**Files:** docs/arc/specs/YYYY-MM-DD-[topic]-design.md
**Decisions:**
- Approach: [chosen approach]
- [Key decision 1]
- [Key decision 2]
**Next:** /arc:implement

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

Agent: `agents/workflow/spec-flow-analyzer.md`

This step is optional — skip if the user declines or wants to move straight to implementation.
</spec_flow_analysis>

<success_criteria>
Design is complete when:
- [ ] User's idea is fully understood through dialogue (not assumed)
- [ ] 2-3 approaches were considered, trade-offs explained
- [ ] UI wireframes created (if UI involved)
- [ ] Design presented in sections, each validated by user
- [ ] Expert review completed, findings discussed as questions
- [ ] Design document written and committed
- [ ] User chose next step
</success_criteria>
