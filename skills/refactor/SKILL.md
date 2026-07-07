---
name: refactor
context: fork
description: |
  Discover architectural friction and propose structural refactors with competing interface options.
  Focuses on deepening shallow modules, extracting grouped concerns into packages/modules,
  breaking up god files, reducing duplication, and improving testability.
  Use when asked to "improve the architecture", "find refactoring opportunities", "deepen modules",
  "consolidate coupling", "break up god components", "extract this into a package",
  "make this more testable", or "find architectural friction".
argument-hint: [<path-or-focus>]
license: MIT
metadata:
  author: howells
website:
  order: 15
  desc: Architectural refactoring
  summary: Explore for shallow modules, package/module extraction, god files, duplication, and create a project-local refactor RFC.
  what: |
    Explores the codebase with project context loaded — noting where understanding requires bouncing between
    too many files, where modules are shallow, where grouped concerns deserve a discrete package/module,
    where god components or scripts mix responsibilities, and where duplication hides a missing shared
    concept. Generates competing interface options when useful, then writes a project-local RFC or
    refactoring plan for the chosen approach.
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
3. `references/maintainability-review.md` — strict god-file, duplication, and structural simplification bar
4. `references/complexity-optimization.md` — safe optimization patterns and behavior-preservation checks

Also read, when present in the target project:

- `CONTEXT.md` or the relevant context from `CONTEXT-MAP.md`
- `docs/adr/*.md` or area-specific ADRs
  </required_reading>

# Architectural Refactoring

Discover structural friction, propose deep-module refactors, and create project-local RFCs.

<boundary>
This workflow reviews existing code with the explicit goal of creating a refactoring plan or RFC.

- If the primary issue is reusable UI component cataloguing, missed shared UI package usage, or design-system component extraction, recommend the dedicated componentization workflow instead.
- If the primary issue is an overgrown component, script, module, or duplicated implementation logic, keep it in `/arc:refactor`.
- If the primary issue is broad codebase health, security, performance, or test coverage, recommend `/arc:audit`.
- If the user wants implementation, stop at a clear plan unless they explicitly ask to start implementing.
- Do not create external tracker issues unless the user explicitly asks.
  </boundary>

## Architecture Language

Use these terms consistently:

- **Module** — anything with an interface and an implementation: a function, class, package, app slice, or tier-spanning feature.
- **Interface** — everything a caller must know to use the module correctly: types, invariants, ordering, error modes, config, and performance characteristics.
- **Implementation** — the code inside a module.
- **Depth** — leverage at the interface. A deep module gives callers a lot of behavior through a small interface; a shallow module exposes nearly as much complexity as it hides.
- **Seam** — where an interface lives; a place behavior can be altered without editing in place.
- **Adapter** — a concrete thing satisfying an interface at a seam.
- **Leverage** — what callers get from depth.
- **Locality** — what maintainers get from depth: change, bugs, knowledge, and verification concentrated in one place.

From John Ousterhout's _A Philosophy of Software Design_:

A **deep module** has a small interface hiding a large implementation. Deep modules are:

- More testable (test at the boundary, not inside)
- More navigable (fewer files to understand a concept)
- More maintainable (changes stay internal)

A **shallow module** has an interface nearly as complex as its implementation. Shallow modules:

- Force callers to understand implementation details
- Create coupling between files that should be independent
- Make testing harder (you test internals, not behaviour)

Apply the **deletion test** to suspected shallow modules: if deleting the module makes complexity vanish, it was pass-through indirection; if deleting it spreads complexity across callers, it was earning its keep.

## Restraint

This workflow adds structure — extracting, deepening, creating packages. Its native failure mode is proposing structure for its own sake. Every candidate and every interface option must clear these gates before you propose it:

- **Does the new structure earn its name?** Extracting a helper or module only pays off if it gives a concept a name a reader will reach for. An extraction that just relocates code without making either side easier to understand is churn — drop it.
- **Fewer files and fewer lines are not the goal; faster comprehension is.** If a proposed split would be harder to follow than the original, or would scatter one concept across more files, it is over-decomposition. Reject it the same way you'd reject a god file.
- **Verify intent before proposing removal or consolidation (Chesterton's Fence).** If a candidate hinges on deleting or merging existing code, check why it exists first — `git blame`, the originating ADR, or the test that pins it. If you can't establish the original intent, mark the candidate low-confidence rather than guessing.
- **Never refactor away a safety boundary.** Input validation at trust boundaries, error handling that prevents data loss, authorization/escaping/sanitization, and accessibility affordances are not "duplication" or "shallow indirection" to be consolidated away. Preserve them even when a restructuring would otherwise be cleaner.

## Process

### Step 1 — Load domain and decision context

Read the project context before judging architecture:

- If `CONTEXT-MAP.md` exists, use it to find the relevant `CONTEXT.md`.
- Otherwise read root `CONTEXT.md` if present.
- Read ADRs in `docs/adr/` or the relevant area if the candidate touches a documented decision.

Use the project's domain vocabulary when naming candidate modules. If a better module name uses a concept not in `CONTEXT.md`, note that the context should be updated during the grilling loop.

**Pre-refactor archaeology.** Before proposing structural change to established code, dispatch `agents/research/git-history-analyzer.md` on the target area to understand why the code looks the way it does — when the current shape was introduced, what churned it, and which decisions or constraints shaped it. This is the Chesterton's Fence check applied up front: know the intent before proposing to move or delete it.

### Step 2 — Scan for decomposition candidates

For JavaScript/TypeScript projects, run the Arc-owned god-file and duplication scanner when available:

```bash
python3 scripts/find-god-files.py . --max-files 40
```

Use `--include-tests` only when the user asks about duplicated tests or test-suite cleanup.

The scanner is heuristic. It ranks likely candidates; it does not decide. Read the highest-ranked files before proposing changes.

Also run the Arc-owned read-only codebase mapper when available:

```bash
python3 scripts/codebase-map.py ${scope:-.} --format markdown
```

Use the map to orient exploration around route surfaces, services, data layer, largest files, high fan-in/fan-out modules, and import cycles. The mapper output is not a finding by itself. Read the relevant files before proposing any refactor.

Classify confirmed candidates:

- `god-component` — React component doing rendering, data shaping, effects, mutations, validation, and subview control in one file.
- `god-script` — CLI/build/migration script mixing argument parsing, I/O, domain logic, formatting, and side effects.
- `god-module` — non-UI module with multiple unrelated responsibilities.
- `duplication` — repeated functions, schemas, UI fragments, query builders, scripts, or formatting logic.
- `shallow-module` — interface nearly as complex as the implementation.
- `package-extraction` — grouped behavior that belongs in a discrete package/module because it has a coherent concept, multiple callers, and a stable interface.

### Step 3 — Explore for architectural friction

Use the Agent tool with `subagent_type=Explore` to navigate the codebase. If the user provided a
path or focus area, start there. Otherwise, explore broadly.

Do NOT follow rigid heuristics. Explore organically and note where you experience friction:

- Where does understanding one concept require bouncing between many small files?
- Where are modules so shallow that the interface is nearly as complex as the implementation?
- Where have pure functions been extracted just for testability, but the real bugs hide in how they're called?
- Where do tightly-coupled modules create integration risk in the seams between them?
- Where is a coherent concern spread across an app and ready to become a discrete package/module?
- Where are god components, god scripts, oversized modules, or mixed responsibilities making changes risky?
- Where is duplication a sign that a shared concept needs one implementation?
- Where does code reimplement something that already exists — an existing util, a shared helper, or a language/runtime primitive — instead of calling it?
- Where does a single unit mix levels of abstraction, interleaving high-level orchestration with low-level detail so the reader has to shift altitude mid-read?
- Where do repeated scans, nested lookups, sorting inside loops, rendering churn, or N+1 calls indicate a better data structure or boundary?
- Where are there deep relative imports (5+ levels) indicating boundary violations?
- Which parts of the codebase are untested, or hard to test?
- Where do barrel files re-export everything, hiding the real dependency graph?

The friction you encounter IS the signal.

### Step 4 — Present candidates

Present a numbered list of refactoring opportunities. For each candidate:

| Field                   | Description                                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Cluster**             | Which modules/concepts are involved                                                                                   |
| **Type**                | shallow-module, package-extraction, god-component, god-script, god-module, duplication                                |
| **Evidence**            | Line count, responsibility mix, duplicated blocks, import depth, call patterns, shared types                          |
| **Problem**             | Why the current shape causes friction                                                                                 |
| **Proposed direction**  | Plain-English description of what would change                                                                        |
| **Dependency category** | See categories below                                                                                                  |
| **Locality / leverage** | What change gets concentrated, and what callers gain                                                                  |
| **Test impact**         | What existing tests would be replaced by boundary tests, or what characterization tests are needed first              |
| **Complexity impact**   | Current complexity, proposed complexity, and behavior-preservation risk when performance is part of the refactor      |
| **Severity**            | How much this costs day-to-day                                                                                        |
| **Confidence**          | How sure you are the friction is real and the direction is right — lower it when intent is unverified (see Restraint) |

Before listing a candidate, run it through the **Restraint** gates above. Drop candidates that add structure without improving comprehension; mark candidates whose intent you couldn't verify as low confidence rather than omitting the caveat.

Ask the user: **"Which of these would you like to explore?"**

Do NOT propose final interfaces yet. The point is to choose which candidate deserves deeper work.

### Step 5 — Grill the chosen candidate

Use a grilling loop before writing the RFC. Ask one question at a time, with your recommended answer included. Resolve:

- What concept should the new module/package own?
- What should stay behind the interface?
- Which callers should know less after the refactor?
- Whether this is one package/module or several.
- Whether the seam is real: do we need multiple adapters, or would one adapter be fake indirection?
- Which behavior must be characterized before splitting.
- Why any code slated for removal or consolidation exists today — confirm intent via `git blame`, the originating ADR, or the test that pins it before the RFC assumes it's safe to drop.
- Which tests become redundant once the new interface is tested.
- Whether `CONTEXT.md` should gain or sharpen a term.
- Whether an ADR should record a rejected or surprising direction.

Update project context inline only for durable domain language, not temporary implementation details.

### Step 6 — Frame the problem space

Before spawning interface-option agents, write a user-facing explanation of the chosen candidate:

- The constraints any new interface would need to satisfy
- The dependencies it would need to rely on
- A rough illustrative code sketch to make the constraints concrete — this is NOT a proposal, just grounding

Show this to the user, then immediately proceed to Step 7.

### Step 7 — Generate competing interface options

Spawn 3+ sub-agents in parallel using the Agent tool. Each must produce a **radically different**
interface for the deepened module.

Give each agent a technical brief (file paths, coupling details, dependency category, what's being
hidden) plus a different interface constraint:

| Agent                   | Constraint                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| Agent 1                 | "Minimise the interface — aim for 1-3 entry points max and maximise leverage per entry point" |
| Agent 2                 | "Maximise flexibility — support many use cases and extension"                                 |
| Agent 3                 | "Optimise for the most common caller — make the default case trivial"                         |
| Agent 4 (if applicable) | "Use ports & adapters for cross-boundary dependencies"                                        |

Each sub-agent outputs:

1. **Interface signature** — types, methods, params
2. **Usage example** — how callers use it
3. **What complexity it hides** — what's internal
4. **Dependency strategy** — how deps are handled (see categories below)
5. **Trade-offs** — what you gain and what you lose

Present all options, then compare them in prose. **Give your own recommendation** — which option is
strongest and why. If elements from different options combine well, propose a hybrid. Be opinionated.

Apply the **Restraint** gates when judging the options: prefer the one that buys the most comprehension
for the least added structure. Reject any option whose interface is more elaborate than the friction it
removes, even if it scores well on flexibility.

### Step 8 — User picks an interface

### Step 9 — Write RFC

Create a refactor RFC in `docs/arc/plans/YYYY-MM-DD-[scope]-refactor-rfc.md`:

```markdown
## Problem

[Describe the architectural friction — which modules are shallow and coupled,
what integration risk exists, why this makes the codebase harder to navigate]

## Proposed Interface

[The chosen interface option — signature, usage example, what it hides]

## Package / Module Extraction

[If applicable: where the new package/module lives, what it owns, what remains in callers, and how imports migrate]

## Dependency Strategy

[Which category applies and how dependencies are handled]

## Testing Strategy

- **Characterization tests to write first**: [current behaviours that must be pinned before splitting]
- **New boundary tests to write**: [behaviours to verify at the interface]
- **Old tests to delete**: [shallow module tests that become redundant]
- **Test environment needs**: [local stand-ins or adapters required]

## Decomposition Order

1. [First safe extraction]
2. [Second safe extraction]
3. [Import migration / cleanup]

## Implementation Recommendations

[Durable guidance NOT coupled to current file paths:

- What the module should own (responsibilities)
- What it should hide (implementation details)
- What it should expose (the interface contract)
- How callers should migrate]
```

Save the RFC and summarize the recommendation. Do not auto-commit it unless the user asks.

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

- Write characterization tests before splitting behavior that is currently under-tested or risky.
- Old unit tests on shallow modules are waste once boundary tests exist — delete them
- Write new tests at the deepened module's interface boundary
- Tests assert on observable outcomes through the public interface, not internal state
- Tests should survive internal refactors — they describe behaviour, not implementation

## Safe Split Order

- Extract pure helpers first.
- Extract duplicated logic before moving callers.
- Extract hooks/state machines before child components when state is tangled.
- Extract leaf subcomponents before layout shells when JSX is large.
- Extract I/O adapters away from domain logic in scripts.
- Keep public imports stable until tests pass, then clean up barrels/exports.
- Move grouped concerns into a package/module only after the interface and callers are clear.

## Signals That Indicate Deepening Opportunities

From the architecture patterns reference:

| Signal                                                                  | What it means                                      |
| ----------------------------------------------------------------------- | -------------------------------------------------- |
| 5+ levels of `../` imports                                              | Code is reaching across boundaries                 |
| Barrel file re-exporting everything                                     | Hiding the real dependency graph                   |
| Test file longer than source file                                       | Testing internals, not behaviour                   |
| "Utils" folder with 20+ files                                           | Shallow modules masquerading as shared code        |
| Type file imported by 10+ modules                                       | Hidden coupling through shared types               |
| Feature spread across 8+ files                                          | Over-decomposition, shallow modules                |
| Mock setup longer than test body                                        | Integration seams are in the wrong place           |
| Large component mixes effects, validation, mutation, and rendering      | God component                                      |
| Script mixes CLI parsing, I/O, transformation, and output formatting    | God script                                         |
| Same schema/query/formatting code appears in several places             | Missing shared module                              |
| Same concept used from multiple apps/packages                           | Candidate package/module extraction                |
| Hand-rolled logic an existing util or stdlib/runtime primitive provides | Reimplementation instead of reuse                  |
| One function interleaves orchestration with low-level detail            | Altitude mismatch — inconsistent abstraction level |
