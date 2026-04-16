# /arc:browse Design

## Problem Statement

Arc's reviewer agents evaluate code. agent-browser's dogfood evaluates rendered pages for defects. Neither evaluates the **rendered experience through an expert lens** — the gap between "technically works" and "actually good."

Dogfood's taxonomy is defect-oriented: broken buttons, console errors, typos, clipped text. These are binary (broken/not broken). What's missing is **quality assessment** — things that work but aren't good enough. "This flow feels confusing." "The visual hierarchy is wrong." "A first-time user wouldn't know what to do here." These require expert judgment, not a defect checklist.

`/arc:browse` fills this gap by letting you pick a persona, read the codebase for intent, then systematically operate the app through that persona's judgment.

## Approach

```
/arc:browse [url] [--persona designer|first-time]

1. CONTEXT    Read codebase -> distill intent into pinned summary
2. PERSONA    Select (or recommend) -> load evaluation criteria from agents/review/
3. BROWSER    Open Chrome MCP (try first) -> ask user if fallback to agent-browser
4. SESSION    Navigate through persona's evaluation framework
5. REPORT     Experience report — observations with evidence, not defects
```

### V1 Scope: Two Personas

| Persona | Agent source | Focus |
|---------|-------------|-------|
| **Designer** | `agents/review/designer.md` | Visual hierarchy, spacing, typography, distinctiveness, "AI slop" detection |
| **First-time User** | `agents/review/first-time-user.md` (new) | Discoverability, clarity, cognitive load, recovery |

Designer + First-time User are the most orthogonal: designer knows the codebase and evaluates craft; first-time knows nothing and evaluates clarity.

### V2 Personas (deferred)

| Persona | Agent source | Rationale for deferral |
|---------|-------------|----------------------|
| Product | `agents/review/daniel-product-engineer.md` | Overlaps with `/arc:audit --design` |
| Accessibility | `agents/review/accessibility-engineer.md` | Overlaps with `/arc:audit --accessibility` |

Ship these once the experience report format is proven with v1.

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Skill, not dispatched agent | Browser interaction requires the same context window as the report — splitting across agent boundaries loses context |
| 2 personas in v1, not 4 | Designer + First-time are most orthogonal; Product + A11y overlap with existing audit modes |
| Read agent files at runtime | One source of truth — `agents/review/*.md` define what to evaluate, `skills/browse/` defines how to browse |
| Context synthesis step | Raw file content gets evicted from attention; distilled 3-5 bullet summary persists through the session |
| Chrome MCP first with explicit gate | Try Chrome MCP -> if unavailable, ask user to switch to agent-browser or abort. No silent degradation |
| Observations, not defects | "What did you notice?" produces quality judgments. "What's broken?" produces defect lists |
| No confidence scores | LLM self-assigned confidence on visual observations is noise. Evidence (screenshots) carries the weight |
| `/arc:browse` = browser, `/arc:review` = code | They share agent knowledge files but don't call each other. Clear boundary |

## Phase Details

### Phase 1: Context Scan

Before browsing, read a **fixed list** (not open-ended codebase scan):

1. `app/**/page.tsx` or equivalent routes file -> map of screens
2. `git log --oneline -10` -> what changed recently
3. Design tokens file (tailwind config, CSS variables) -> spacing/color system
4. `docs/arc/specs/` -> any existing design docs for the feature
5. `package.json` -> stack context

Then **synthesize** into a pinned summary (3-5 bullets):

```markdown
## App Context (pinned)
- **Intent:** Dashboard app for managing deployments, information-dense
- **Key flows:** Create deployment, view logs, manage team
- **Recent changes:** Redesigned sidebar navigation (3 days ago)
- **Design system:** 4px spacing, custom palette, Inter + mono
- **Stack:** Next.js 16, Tailwind v4, motion/react
```

This summary stays in scope throughout the session. Raw file content is discarded.

### Phase 2: Persona Selection

The skill reads the selected persona's agent file at runtime:
- Designer: read `agents/review/designer.md` for judgment criteria
- First-time User: read `agents/review/first-time-user.md` for evaluation criteria

The `skills/browse/references/` directory holds only **browsing strategies** — how to navigate, what order to evaluate, how to structure the session. The judgment criteria come from the agent files.

**Persona recommendation:** If the user doesn't specify, recommend based on recent changes:
- UI/styling changes -> suggest designer
- New feature/page -> suggest first-time user

### Phase 3: Browser Setup

```
1. Check if Chrome MCP tools are available (mcp__claude-in-chrome__*)
2. If available: use Chrome MCP (recommend to user)
3. If unavailable: ask user —
   "Chrome MCP isn't available. Switch to agent-browser, or abort?"
4. If agent-browser: start session with agent-browser --session browse-{timestamp}
```

Tool mappings (Chrome MCP vs agent-browser) are implementation detail — defined in `SKILL.md`, not here.

### Phase 4: The Session

Each persona follows its own evaluation framework, defined in `skills/browse/references/{persona}-session.md`. These are not checklists — they're structured ways of paying attention. The SKILL.md loads the relevant session reference at runtime.

**Designer session** (`references/designer-session.md`):
1. Land on page. Before clicking: does the visual hierarchy guide your eye? Is there a spacing system? Would you remember this page?
2. Scroll the full page: is there rhythm? Dead zones? Typography hierarchy?
3. Interact with a primary action: do state changes have design thought?
4. Navigate to 2-3 more pages: design consistency? Cohesive system?

**First-time User session** (`references/first-time-session.md`):
1. Arrive at landing/entry point. Without reading docs: what is this app? What should I do first?
2. Try the most obvious action. Is it clear what happened? What to do next?
3. Make a deliberate mistake. Can I recover? Is the error message helpful?
4. Try to find a secondary feature. Is navigation discoverable?

The 4-step outlines above are the core content of each session reference file. The reference files expand each step with specific prompting questions and screenshot guidance.

### Phase 5: Experience Report

Output format — observations with evidence, not defect lists:

```markdown
## Experience Report: [App Name]
**Persona:** Designer | **Date:** YYYY-MM-DD | **URL:** ...
**App context:** [1-2 sentence summary from Phase 1]

---

### Observation 1: [Short title]
**Screen:** [page/route]
**What I noticed:** [Description through the persona's lens]
**Why it matters:** [Impact — not "broken" but "undermines X"]
**Evidence:** [screenshot path]
**Suggestion:** [Optional — what would make this better]

---

### Observation 2: ...

---

## Summary
[2-3 sentence overall impression — what's working, what's not, one key recommendation]
```

Report lives at: `docs/arc/browse/YYYY-MM-DD-[persona]-[app].md`

Template at: `skills/browse/templates/experience-report.md`

## File Structure

```
skills/browse/
  SKILL.md                          # Skill definition
  references/
    designer-session.md             # Browsing strategy for designer persona
    first-time-session.md           # Browsing strategy for first-time user persona
  templates/
    experience-report.md            # Report template

agents/review/
  first-time-user.md                # NEW: evaluation criteria for first-time user persona
  designer.md                       # EXISTING: evaluation criteria (read at runtime)
```

## V1 Decisions (closed)

| Question | Decision | Rationale |
|----------|----------|-----------|
| Session length | 5-8 observations, 4-6 pages | Enough depth without session fatigue. Quality over count |
| GIF recording | Deferred to v2 | Chrome MCP GIF support exists but adds complexity. Screenshots are sufficient for v1 |
| Repeat-run diffing | Deferred to v2 | Requires report format to stabilize first |

## Open Questions

1. **Session reference depth** — How much detail should each session reference file contain beyond the 4-step framework? Too much and the agent follows a checklist; too little and output varies wildly between runs.

## First-time User Agent Spec

`agents/review/first-time-user.md` — new file, evaluation criteria:

**Mental model:** Someone who just landed on this app for the first time. No docs, no onboarding call, no context. They have general web literacy but zero domain knowledge of this specific product.

**Evaluation criteria:**
- **Orientation:** Can I tell what this app does within 5 seconds? Is there a clear entry point?
- **Discoverability:** Can I find core features without being told they exist? Are navigation labels self-explanatory?
- **Action clarity:** When I click something, is it obvious what happened? Do I know what to do next?
- **Error recovery:** If I make a mistake, is the error message helpful? Can I undo or go back?
- **Cognitive load:** How many concepts do I need to hold in my head at once? Are there too many options competing for attention?
- **Progressive disclosure:** Does the app reveal complexity gradually, or dump everything on screen at once?
- **Terminology:** Are labels and copy written for users, or for the team that built it? (Internal jargon = failure)

**What this persona does NOT evaluate:**
- Visual design quality (that's the designer)
- Code quality or technical implementation
- Accessibility compliance (deferred persona)
- Performance (deferred persona)

## Next

```
/arc:ideate     -> Design doc (YOU ARE HERE)
     |
/arc:implement  -> Build the skill + first-time-user agent + templates
```
