# Strict Maintainability Review

Use this reference when judging whether code is becoming harder to change, harder to test, or harder to understand. The posture is intentionally demanding: working code is not enough if it leaves the project structurally worse.

## Approval Bar

Do not approve or normalize changes that introduce obvious maintainability debt when a cleaner structure is visible. Treat these as presumptive blockers until justified:

- An authored source-code file crosses 600 lines (presumptive god file at 600+, severe at 1000+, strongest signal at 2000+). Size sets how hard to look, not the verdict — read the file and report whether responsibilities are actually mixed. Generated, vendored, and data-only files are exempt.
- A change adds ad-hoc branches or feature checks into unrelated flows.
- A feature leaks implementation logic into a shared or canonical layer.
- A new abstraction hides little and forces callers to understand the same complexity.
- Types rely on `any`, casts, loose optionality, or silent fallbacks where an explicit boundary would clarify the invariant.
- The implementation duplicates an existing helper, component, schema, query, formatter, or package concept.
- Orchestration becomes more sequential, less atomic, or more stateful without a clear reason.

Generated, vendored, data-only, snapshot, lock, plan, and documentation files are exempt from this size ladder. Dense source-code files may be valid, but they must have one coherent responsibility and a strong reason to stay whole.

## Core Questions

Ask these questions before accepting the current structure:

- Can a reframe delete branches, modes, wrappers, helpers, or layers?
- Is this logic in the canonical module, package, service, or component?
- Did the change make a cohesive module more coupled, more stateful, or harder to scan?
- Is a large file actually one dense responsibility, or a god file mixing unrelated responsibilities?
- Is duplication revealing a missing shared concept?
- Does the abstraction earn its keep, or is it pass-through indirection?
- Are type boundaries making invariants obvious?
- Can independent work run in parallel without making the flow harder to reason about?
- Can related updates become atomic so partial state is impossible or clearly handled?

## God Files

Use `god file` as the umbrella term for oversized or tangled source files. Classify confirmed cases precisely:

- `god-component` - a React component mixes rendering, data shaping, effects, mutations, validation, routing, and subview control.
- `god-page-client` - a Next.js page or layout is a thin pass-through to one oversized `"use client"` component, hoisting the route's interactivity to the top instead of composing client leaves into a server page.
- `god-script` - a script mixes argument parsing, configuration, I/O, domain transformation, and output formatting.
- `god-module` - a non-UI module owns multiple unrelated responsibilities or change reasons.
- `duplication` - repeated logic indicates a shared concept should have one implementation.

Do not split files merely because they are long. Split when the file has multiple responsibilities, duplicated logic, unstable change reasons, hard-to-test branches, or an interface that can become smaller.

## Preferred Remedies

Prefer remedies that reduce the number of concepts a maintainer must hold:

- Delete a layer of indirection instead of polishing it.
- Move ownership to the module, package, or service that already owns the concept.
- Replace special-case branches with a clearer model or dispatcher.
- Extract duplicated behavior after confirming the copies have the same domain meaning.
- Split god files one behavioral boundary at a time.
- Separate orchestration from domain logic.
- Replace loose object shapes with explicit typed contracts.
- Reuse canonical helpers and shared components before creating new ones.
- Parallelize independent work when it also simplifies the orchestration.
- Make related updates atomic when partial state would be hard to reason about.

## Safe Decomposition

Before changing risky or under-tested code, add characterization tests through public interfaces. Then split in this order when applicable:

1. Extract pure helpers.
2. Extract duplicated logic.
3. Extract hooks or state machines before child components when state is tangled.
4. Extract leaf subcomponents before layout shells when JSX is large.
5. Extract I/O adapters away from domain logic in scripts.
6. Keep public imports stable until checks pass, then clean up barrels and exports.

Stop at a plan when the user asked for an audit or refactor proposal. Implement only when the user explicitly asks for changes.
