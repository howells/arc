---
name: refactor
context: fork
description: |
  Discover architectural friction and propose structural refactors with competing interface designs.
  Focuses on deepening shallow modules, consolidating coupled code, and improving testability.
  Use when asked to "improve the architecture", "find refactoring opportunities", "deepen modules",
  "consolidate coupling", "make this more testable", or "find architectural friction".
argument-hint: [<path-or-focus>]
license: MIT
metadata:
  author: howells
website:
  order: 14
  desc: Architectural refactoring
  summary: Explore for shallow modules, propose deep-module refactors with competing interface designs, and create RFC issues.
  what: |
    Explores the codebase organically — noting where understanding requires bouncing between too many files,
    where modules are so shallow their interface is as complex as their implementation, and where coupling
    creates integration risk. Generates competing interface designs via parallel agents, then creates a
    GitHub issue RFC for the chosen refactor.
  why: |
    Most refactoring is reactive — fixing pain after it's acute. This workflow is proactive: it finds
    architectural friction before it compounds, and produces actionable proposals rather than vague
    "we should clean this up" comments.
  agents:
    - architecture-engineer
  workflow:
    position: utility
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## BANNED TOOLS — calling these is a skill violation:
- **`EnterPlanMode`** — BANNED. Do NOT call this tool. This skill has its own structured process.
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
Before starting, read these references:
1. `references/architecture-patterns.md` — import depth rules, boundary violations
2. `references/component-design.md` — compound vs simple component patterns
</required_reading>

# Architectural Refactoring

Discover structural friction, propose deep-module refactors, and create RFC issues.

## Core Concept: Deep Modules

From John Ousterhout's *A Philosophy of Software Design*:

A **deep module** has a small interface hiding a large implementation. Deep modules are:
- More testable (test at the boundary, not inside)
- More navigable (fewer files to understand a concept)
- More maintainable (changes stay internal)

A **shallow module** has an interface nearly as complex as its implementation. Shallow modules:
- Force callers to understand implementation details
- Create coupling between files that should be independent
- Make testing harder (you test internals, not behaviour)

## Process

### Step 1 — Explore for friction

Use the Agent tool with `subagent_type=Explore` to navigate the codebase. If the user provided a
path or focus area, start there. Otherwise, explore broadly.

Do NOT follow rigid heuristics. Explore organically and note where you experience friction:

- Where does understanding one concept require bouncing between many small files?
- Where are modules so shallow that the interface is nearly as complex as the implementation?
- Where have pure functions been extracted just for testability, but the real bugs hide in how they're called?
- Where do tightly-coupled modules create integration risk in the seams between them?
- Where are there deep relative imports (5+ levels) indicating boundary violations?
- Which parts of the codebase are untested, or hard to test?
- Where do barrel files re-export everything, hiding the real dependency graph?

The friction you encounter IS the signal.

### Step 2 — Present candidates

Present a numbered list of deepening opportunities. For each candidate:

| Field | Description |
|-------|-------------|
| **Cluster** | Which modules/concepts are involved |
| **Why they're coupled** | Shared types, call patterns, co-ownership of a concept |
| **Dependency category** | See categories below |
| **Import depth** | Max relative import depth between coupled modules |
| **Test impact** | What existing tests would be replaced by boundary tests |
| **Severity** | How much this coupling costs day-to-day |

Ask the user: **"Which of these would you like to explore?"**

### Step 3 — Frame the problem space

Before spawning design agents, write a user-facing explanation of the chosen candidate:

- The constraints any new interface would need to satisfy
- The dependencies it would need to rely on
- A rough illustrative code sketch to make the constraints concrete — this is NOT a proposal, just grounding

Show this to the user, then immediately proceed to Step 4.

### Step 4 — Design competing interfaces

Spawn 3+ sub-agents in parallel using the Agent tool. Each must produce a **radically different**
interface for the deepened module.

Give each agent a technical brief (file paths, coupling details, dependency category, what's being
hidden) plus a different design constraint:

| Agent | Constraint |
|-------|-----------|
| Agent 1 | "Minimise the interface — aim for 1-3 entry points max" |
| Agent 2 | "Maximise flexibility — support many use cases and extension" |
| Agent 3 | "Optimise for the most common caller — make the default case trivial" |
| Agent 4 (if applicable) | "Design around ports & adapters for cross-boundary dependencies" |

Each sub-agent outputs:

1. **Interface signature** — types, methods, params
2. **Usage example** — how callers use it
3. **What complexity it hides** — what's internal
4. **Dependency strategy** — how deps are handled (see categories below)
5. **Trade-offs** — what you gain and what you lose

Present all designs, then compare them in prose. **Give your own recommendation** — which design is
strongest and why. If elements from different designs combine well, propose a hybrid. Be opinionated.

### Step 5 — User picks an interface

### Step 6 — Create RFC issue

Create a refactor RFC as a GitHub issue using `gh issue create`:

```markdown
## Problem

[Describe the architectural friction — which modules are shallow and coupled,
what integration risk exists, why this makes the codebase harder to navigate]

## Proposed Interface

[The chosen interface design — signature, usage example, what it hides]

## Dependency Strategy

[Which category applies and how dependencies are handled]

## Testing Strategy

- **New boundary tests to write**: [behaviours to verify at the interface]
- **Old tests to delete**: [shallow module tests that become redundant]
- **Test environment needs**: [local stand-ins or adapters required]

## Implementation Recommendations

[Durable guidance NOT coupled to current file paths:
- What the module should own (responsibilities)
- What it should hide (implementation details)
- What it should expose (the interface contract)
- How callers should migrate]
```

Do NOT ask the user to review before creating — just create it and share the URL.

## Dependency Categories

When assessing a candidate, classify its dependencies:

### 1. In-process

Pure computation, in-memory state, no I/O. Always deepenable — merge the modules and test directly.

### 2. Local-substitutable

Dependencies with local test stand-ins (PGLite for Postgres, in-memory filesystem). Deepenable
if the stand-in exists. Test with the local stand-in running in the test suite.

### 3. Remote but owned (Ports & Adapters)

Your own services across a network boundary. Define a port (interface) at the module boundary.
The deep module owns the logic; the transport is injected. Tests use an in-memory adapter.

### 4. True external (Mock)

Third-party services (Stripe, Twilio) you don't control. Mock at the boundary. The deepened module
takes the external dependency as an injected port; tests provide a mock.

## Testing Strategy

The core principle: **replace, don't layer.**

- Old unit tests on shallow modules are waste once boundary tests exist — delete them
- Write new tests at the deepened module's interface boundary
- Tests assert on observable outcomes through the public interface, not internal state
- Tests should survive internal refactors — they describe behaviour, not implementation

## Signals That Indicate Deepening Opportunities

From the architecture patterns reference:

| Signal | What it means |
|--------|--------------|
| 5+ levels of `../` imports | Code is reaching across boundaries |
| Barrel file re-exporting everything | Hiding the real dependency graph |
| Test file longer than source file | Testing internals, not behaviour |
| "Utils" folder with 20+ files | Shallow modules masquerading as shared code |
| Type file imported by 10+ modules | Hidden coupling through shared types |
| Feature spread across 8+ files | Over-decomposition, shallow modules |
| Mock setup longer than test body | Integration seams are in the wrong place |
