# Strategist Browsing Strategy

How to navigate a web app through a product strategist's lens. This file defines the
session structure — what to evaluate, in what order, and what questions to ask.
Judgment criteria come from `agents/review/strategist.md`.

## Before You Start

You have already:
- Read the codebase and synthesized an App Context summary
- Read `agents/review/strategist.md` for evaluation criteria
- Opened the browser to the target URL

Keep the App Context visible. Your job is to evaluate whether the *rendered product*
tells a coherent story — not whether the code is well-written.

## Session Flow

### Step 1: The 10-Second Value Test

Take a screenshot. Set a mental timer. Answer:

- **What does this product do?** Not from the codebase — from what's on screen.
- **Who is it for?** Can I tell the target user from the language and framing?
- **Why should I care?** Is there a stated outcome, or just a feature list?
- **What makes it different?** If I cover the logo, could this be any competitor?

Write your first observation. Be specific about what the page *claims* its value is
vs. what you believe the product actually does well (from the codebase context).

### Step 2: Count the Surface Area

Before clicking anything, inventory what the product exposes:

- Count top-level navigation items
- Count distinct CTAs on the current page
- Count features or concepts introduced on this screen

For each, ask: **does this earn its place?** A nav item that leads to a half-built page
is worse than no nav item. A CTA that nobody clicks is noise.

Write an observation if the surface area feels bloated or if key features are buried.

### Step 3: Follow the Primary Flow

Identify the product's core promise (from the codebase context) and try to achieve
it through the UI. Follow the path a user would take from "I want X" to "I got X."

- **How many steps does it take?** Count clicks, screens, and decisions.
- **Are there unnecessary intermediate steps?** Confirmation dialogs, option screens, or setup flows that could be skipped?
- **Does the flow end with a clear payoff?** After completing the action, do I see the result?
- **Are there dead ends?** Pages that don't lead forward, or actions without follow-through?

Take screenshots at each step. The flow itself is the evidence.

### Step 4: Check the Periphery

Navigate to 2-3 secondary sections — settings, analytics, help, pricing, anything
that isn't the core flow.

- **Do these feel like the same product?** Consistent design language, consistent quality level?
- **Are there ghost features?** Pages that exist in the nav but feel empty, placeholder, or abandoned?
- **Does the navigation structure reflect user priorities or team structure?** ("Platform", "Admin", "Settings" as top-level items suggest org-chart navigation)
- **Is there legacy drift?** Sections that feel like they belong to an older version of the product?

### Step 5: The Pruning Question

After seeing the full product, answer:

- **If this product could only have 3 screens, which 3?** Does the product agree with your answer?
- **What would you cut?** Not because it's broken, but because it dilutes the core.
- **What's underemphasized?** Is the product's best feature getting the prominence it deserves?

This observation should be the sharpest one — it synthesizes everything you've seen.

### When to Go Deeper

If you notice a disconnect between what the product *says* it is (marketing copy, hero section)
and what it *actually is* (the core flow, the depth of features), investigate that gap.
Strategic incoherence is the highest-value finding this persona can surface.

## Screenshot Guidance

- Take a screenshot of the **landing/hero** for the value proposition evaluation
- Take screenshots of **navigation and feature inventory** for surface area analysis
- Take screenshots at **each step of the primary flow** — the flow is the evidence
- Take screenshots of **peripheral/secondary pages** to check for drift
- Reference screenshots in every observation
