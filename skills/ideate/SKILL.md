---
name: ideate
description: Turn ideas into validated designs through collaborative dialogue with built-in expert review. Use when you have a concept and want a clear technical approach before implementation.
---

<required_reading>
**Read these reference files NOW:**
1. ${CLAUDE_PLUGIN_ROOT}/references/design-phases.md
2. ${CLAUDE_PLUGIN_ROOT}/references/review-patterns.md
3. ${CLAUDE_PLUGIN_ROOT}/references/frontend-design.md (if UI work involved)
</required_reading>

<process>
## Phase 1: Context Gathering

**Search episodic memory for past decisions:**
```
Task episodic-memory:search-conversations: "Search for past conversations
about [topic/feature]. Look for: previous design decisions, rejected
approaches, lessons learned, related features."
```

**Spawn Explore agent for codebase understanding (in parallel):**
```
Task Explore: "Analyze codebase structure, key patterns, and conventions.
Focus on: architecture patterns, component organization, state management,
testing approach, and any similar features that already exist.

Structure your findings as:
## Architecture Patterns
- Pattern with `file:line` reference

## Existing Similar Features
- Feature and where it lives

## Essential Files for This Feature
List 5-10 files most critical to understand before implementing:
- `file.ts` — why it matters for this feature
"
```

**If extending existing feature, also spawn:**
```
Task git-history-analyzer: "Analyze git history for [related files/feature].
Look for: why patterns exist, key contributors, evolution of approach,
any gotchas or issues that were fixed."
```

**While agents run, gather basics:**
- Identify project type (TypeScript/Python/Go) for reviewer selection
- Note any obvious constraints from project structure

**When Explore completes:**
- Review findings for relevant patterns
- Note what can be reused vs. built fresh
- Identify any constraints that affect design
- **Share the Essential Files list with user** — these are required reading before implementation

**Understand the idea:**
- Ask questions **one at a time** to refine understanding
- Prefer multiple choice questions when possible
- Focus on: purpose, constraints, success criteria, scope boundaries

<reference_capture>
**Capture all reference materials as they're shared:**

When user shares a **Figma link**:
1. Immediately extract and store: `figma_url: [full URL]`
2. Extract fileKey and nodeId from URL
3. Fetch design context:
   ```
   mcp__figma__get_design_context: fileKey, nodeId
   mcp__figma__get_screenshot: fileKey, nodeId
   ```
4. Save screenshot to `docs/plans/assets/YYYY-MM-DD-<topic>/figma-[node-id].png`
5. Include in design doc under "## Reference Materials"

When user shares **any image**:
1. Note the image was shared (can't be persisted, but acknowledge)
2. Describe what the image shows in the design doc
3. Ask user to save important images to `docs/plans/assets/` manually

When user shares **external links** (docs, examples, inspiration):
1. Capture URL and brief description
2. Include in design doc under "## Reference Materials"

**Why capture immediately:**
- Links shared in conversation are lost when session ends
- Implementation may happen in different session/worktree
- Design doc becomes single source of truth
</reference_capture>

**Decision gate:**
After 3-5 questions, ask:
"I think I understand. Ready for me to propose approaches, or do you want to clarify more?"

## Phase 2: Approach Exploration

**Propose 2-3 approaches with trade-offs:**
- Lead with your recommendation
- Explain why you recommend it
- Show what you'd lose with each alternative
- Keep it conversational, not a formal document

**Quick validation checkpoint:**
Before diving into detailed design, run a sanity check:
"Let me quickly validate this approach makes sense..."

Use Task tool to spawn a single reviewer agent (architecture-strategist or relevant domain expert) to catch fundamental issues early. Present any concerns to user before proceeding.

## Phase 3: Incremental Design with Micro-Reviews

**Present design in 200-300 word sections:**

For each major section:
1. Write the section (data model, API design, component structure, etc.)
2. Ask: "Does this look right so far?"
3. If user approves, continue
4. If user has concerns, address them before moving on

**Micro-reviews (optional, for complex sections):**
After completing a major section that warrants it:
- Data model → spawn data-integrity-guardian for quick review
- API design → spawn architecture-strategist for quick review
- Security-sensitive → spawn security-sentinel for quick review

Present micro-review findings immediately. Incorporate feedback before next section.

**Sections to cover:**
- Problem statement / user story
- High-level approach
- **UI wireframes (ASCII)** - if any UI involved
- Data model (if applicable)
- Component/module structure
- API surface (if applicable)
- Error handling strategy
- Testing approach

<ui_wireframes>
**For any UI work, establish aesthetic direction BEFORE wireframes.**

See `${CLAUDE_PLUGIN_ROOT}/references/frontend-design.md` for full principles.

<aesthetic_direction>
**Ask the user (one at a time):**

1. "What tone fits this UI?"
   - Offer options: minimal, bold/maximalist, playful, editorial, luxury, brutalist, retro, organic
   - Or ask them to describe the feeling they want

2. "What should be memorable about this?"
   - The animation? The typography? The layout? A specific interaction?

3. "Any existing brand/style to match, or fresh start?"

**Capture decisions:**
```markdown
## Aesthetic Direction
- **Tone**: [chosen direction]
- **Memorable element**: [what stands out]
- **Typography**: [display font] + [body font] (avoid Inter/Roboto/Arial)
- **Color strategy**: [approach - NOT purple gradients on white]
- **Motion**: [where animation matters most]
```
</aesthetic_direction>

**Then create ASCII wireframes:**

See `${CLAUDE_PLUGIN_ROOT}/references/ascii-ui-patterns.md` for patterns.

**Why ASCII:**
- Forces thinking about layout and flow
- Easy to iterate in conversation
- No tooling required
- Captures structure before aesthetics

**What to include:**
- Key screens/states
- Component hierarchy
- Interactive elements
- Loading/error/empty states
- Notes on where motion/memorable elements appear

**Example with aesthetic notes:**
```
┌─────────────────────────────────────┐
│  Logo        [Search...]    [Menu]  │  ← subtle hover animations
├─────────────────────────────────────┤
│                                     │
│  ┌─────────┐  ┌─────────┐          │  ← staggered fade-in on load
│  │  Card   │  │  Card   │  ...     │
│  │  -----  │  │  -----  │          │
│  │  desc   │  │  desc   │          │
│  └─────────┘  └─────────┘          │
│                                     │
│  [Load More]                        │  ← satisfying click feedback
└─────────────────────────────────────┘
```

Ask: "Does this layout and aesthetic direction feel right?"
</ui_wireframes>

## Phase 4: Collaborative Simplification

**The same Socratic dialogue that built the design now simplifies it.**

Run parallel expert review to gather raw input:

**Detect project type and select reviewers** (see SKILL.md `<reviewer_selection>`).

Use Task tool to spawn 3 reviewer agents in parallel:
```
Task: "Review this design plan for [specific concerns based on reviewer specialty]"
Subagent: [appropriate agent from reviewer_selection]
```

**Transform findings into collaborative questions:**

See `${CLAUDE_PLUGIN_ROOT}/references/review-patterns.md` for the Socratic approach.

Instead of presenting reviewer critiques:
- Turn findings into exploratory questions
- Same collaborative spirit as the design phase
- "What if we..." not "You should..."

**Example transformations:**
- Reviewer: "Remove the caching layer"
  → "Do we need caching in v1, or could we add it when we see performance issues?"
- Reviewer: "This is overengineered"
  → "We have three layers here. What if we started with one?"
- Reviewer: "Premature abstraction"
  → "We're building for flexibility we might not need. What if we hardcoded it for now?"

**Walk through together:**
Present questions one at a time. Listen to reasoning. If user wants to keep something, they probably have context the reviewer doesn't.

**Track decisions:**
- Note what was simplified and why
- Note what was kept and why
- Both inform the final design doc

## Phase 5: Finalization

**Write the validated design:**
- Location: `docs/plans/YYYY-MM-DD-<topic>-design.md`
- Include:
  - **Reference Materials** section (Figma links, screenshots, external docs)
  - ASCII UI wireframes
  - Reviewer sign-off summary
  - Any open questions

**Design doc template:**
```markdown
# [Feature Name] Design

## Reference Materials
- Figma: [URL] (screenshot: `./assets/figma-*.png`)
- [Any other links/docs shared]

## Problem Statement
...

## UI Wireframes
[ASCII wireframes here]

## Approach
...

## Design Decisions
| Decision | Rationale |
|----------|-----------|
| ... | ... |

## Open Questions
- ...
```

**Commit the design:**
```bash
git add docs/plans/
git commit -m "docs: add <topic> design plan"
```

**Implementation handoff:**

Before implementation, set up an isolated workspace. Follow `${CLAUDE_PLUGIN_ROOT}/disciplines/using-git-worktrees.md`:

```
"Design ready! I recommend creating a feature branch and worktree to keep main clean and allow easy rollback."
```

Options:
1. **Set up worktree and continue** (Recommended) → Follow `${CLAUDE_PLUGIN_ROOT}/disciplines/using-git-worktrees.md`, then route to `/arc:detail`
2. **Skip worktree, just plan** → Route to `/arc:detail` directly
3. **Done for now** → Just the design

**If setting up worktree:**
1. Follow the directory selection process in `${CLAUDE_PLUGIN_ROOT}/disciplines/using-git-worktrees.md`
2. Create branch: `feature/<topic-slug>`
3. Run project setup (auto-detect from package.json, Cargo.toml, etc.)
4. Verify clean baseline (tests pass)
5. Then proceed to implementation planning

If creating implementation plan:
- Detect test frameworks (vitest, playwright, jest, etc.)
- Create bite-sized TDD tasks
- Save to `docs/plans/YYYY-MM-DD-<topic>-implementation.md`
</process>

<success_criteria>
Design is complete when:
- [ ] User's idea is fully understood (no ambiguity)
- [ ] 2-3 approaches were considered, trade-offs explained
- [ ] ASCII UI wireframes created (if UI involved)
- [ ] Design presented in sections, each validated by user
- [ ] Expert review completed, findings discussed collaboratively
- [ ] Design document written and committed
- [ ] User offered implementation plan creation
</success_criteria>
