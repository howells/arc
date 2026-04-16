# Designer Browsing Strategy

How to navigate a web app through a designer's lens. This file defines the session
structure — what to look at, in what order, and what questions to ask at each step.
Judgment criteria come from `agents/review/designer.md` and its required reading.

## Before You Start

You have already:
- Read the codebase and synthesized an App Context summary
- Read `agents/review/designer.md` for evaluation criteria
- Opened the browser to the target URL

Keep the App Context visible. Every observation should be grounded in
whether the rendered result matches the codebase's design intent.

## Session Flow

### Step 1: First Impression (do not click anything yet)

Take a screenshot. Then evaluate:

- **Visual hierarchy:** Does your eye know where to go? Is there a clear primary element, or is everything competing equally?
- **Spacing system:** Does the spacing feel systematic (consistent increments) or arbitrary (different gaps everywhere)?
- **Typography hierarchy:** Is there a clear typographic scale — headings, subheadings, body — or is everything roughly the same size/weight?
- **Distinctiveness:** Would you remember this page tomorrow? What, if anything, makes it stick? If the answer is "nothing," note that.
- **AI slop check:** Purple gradients? White cards on white backgrounds? System fonts with no personality? Cookie-cutter layout that could be any SaaS app?

Write your first observation based on the screenshot. Reference the App Context — does this match the design system noted there?

### Step 2: Scroll the Full Page

Scroll through the entire page, taking screenshots at meaningful sections.

- **Rhythm:** Do sections breathe? Is there a pattern of content density followed by whitespace, or is it monotonous?
- **Dead zones:** Are there areas with no visual weight — empty space that feels accidental rather than intentional?
- **Section transitions:** Do sections feel like they belong to the same page, or do they look like different designs stitched together?
- **Color usage:** Is color applied with intent (drawing attention, grouping, status) or scattered randomly?
- **Border audit:** Are borders the only tool for separation? Could spacing or background shifts do the same job with less visual noise?

### Step 3: Interact With a Primary Action

Find the most prominent action on the page (a button, a form, a CTA). Interact with it.

- **Hover state:** Does the element respond on hover? Is the response subtle and intentional, or does it jump?
- **Active/pressed state:** Is there a press state, or does clicking feel flat?
- **Loading state:** If the action triggers a network request, is there a loading indicator? Does the layout shift?
- **Success/completion state:** After the action completes, is the result communicated clearly? Does the page change in a way that confirms what happened?
- **Error state:** If you can trigger an error (empty form, invalid input), is the error state designed or just a browser default?

Take a screenshot of each state transition you can observe.

### Step 4: Navigate to 2-3 More Pages

Follow the primary navigation to different sections of the app.

- **Consistency:** Do the pages feel like part of the same system? Same spacing, same typography, same component patterns?
- **Component reuse:** Are the same components (cards, tables, modals) styled consistently, or do they drift between pages?
- **Navigation feedback:** Is it clear which page/section I'm currently on? Active states in nav?
- **Layout coherence:** Do pages use a common grid/layout system, or does each page invent its own structure?

### When to Go Deeper

If you notice a cluster of issues in one area (e.g., all forms look unstyled, or one section is clearly newer than the rest), investigate that area more thoroughly. Depth on a real problem is more valuable than breadth across superficial observations.

## Screenshot Guidance

- Take a screenshot **before** interacting (baseline)
- Take a screenshot **after** each state change
- Use annotated screenshots when available (Chrome MCP or agent-browser `--annotate`)
- Reference screenshots in every observation — evidence is non-negotiable
