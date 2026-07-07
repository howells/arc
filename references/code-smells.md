# Code Smells — Review Baseline

A shared vocabulary for structural review, adapted from Fowler's _Refactoring_ (ch. 3). Load this when reviewing a diff for design quality (not correctness — that's a separate pass).

## Two binding rules

1. **A documented repo standard always wins.** If `CONTEXT.md`, an ADR, or a rules file sanctions a pattern, that overrides this baseline. Do not flag against house style.
2. **Every smell is a labelled judgement call, never a hard violation.** Report each as a suggestion with a reason, not a blocker. And skip anything tooling already enforces (formatting, unused vars, import order, cyclomatic thresholds a linter checks) — don't spend review attention on what CI catches.

Phrase findings as "possible <smell>: <evidence> → <suggested fix>". The author decides.

## The twelve smells (what it is → how to fix)

1. **Mysterious Name** — a name doesn't reveal its purpose or reads as a lie. → Rename to what it does. If no honest name comes, the design underneath is murky — fix the design, not just the label.
2. **Duplicated Code** — the same logic _shape_ appears in more than one place (not just identical text). → Extract the shared shape into one function/module; parameterise the differences.
3. **Feature Envy** — a method reaches into another object's data more than its own. → Move the method to the object whose data it wants; or extract the envious part and move that.
4. **Data Clumps** — the same group of fields or parameters keep travelling together. → Bundle them into one type/object. If three params always appear as a trio, they're a concept without a name.
5. **Primitive Obsession** — a bare `string`/`number` stands in for a domain concept (money, email, id, duration). → Give it a type. A `UserId` that can't be confused with an `OrderId` prevents a class of bugs.
6. **Repeated Switches** — the same `switch`/`if`-cascade over the same tag recurs in several places. → Replace with polymorphism, or one shared lookup map, so adding a case is a single edit.
7. **Shotgun Surgery** — one conceptual change forces small edits scattered across many files. → Gather the scattered responsibility into one module so the change lands in one place.
8. **Divergent Change** — one module gets edited for several unrelated reasons. → Split it along the axes of change so each module has one reason to change. (The inverse of Shotgun Surgery.)
9. **Speculative Generality** — abstraction, hooks, or config built for needs that don't exist yet. → Delete or inline it. Add the flexibility when the second real case arrives, not before.
10. **Message Chains** — long `a.b().c().d()` navigation couples the caller to a deep structure. → Hide the walk behind one method on the first object (ask, don't traverse).
11. **Middle Man** — a class/module that mostly just delegates to another. → Cut out the middle man; let callers talk to the real object. (Keep it only if it earns its place — an interface seam, a facade with real policy.)
12. **Refused Bequest** — a subclass/implementer ignores most of what it inherits. → Prefer composition over inheritance; take only the behaviour you actually use.

## Using this in review

- One pass, ranked by blast radius: Shotgun Surgery / Divergent Change (whole-module) before Mysterious Name (local).
- Cite the specific lines. A smell without evidence is noise.
- If a smell and rule #1 conflict, rule #1 wins silently — don't even raise it.
