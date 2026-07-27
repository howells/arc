---
name: dispatching-parallel-agents
description: Use when splitting work across concurrent subagents — what can run in parallel, how wide to fan out, and how to integrate results
---

# Dispatching Parallel Agents

Parallel dispatch buys wall-clock time and a clean context window per problem. It costs coordination: you must reconcile changes you did not watch happen. Parallelize when that trade favours you.

## When parallel work pays

Each piece has to be genuinely independent:

- **Disjoint file footprints** — you can name in advance the files each agent may write, with no overlap.
- **No shared state** — no shared fixture, database, port, lockfile, or migration sequence.
- **Self-contained understanding** — an agent can do its piece without the others' findings.
- **Independent verification** — each piece has its own command that shows it working.

Read-only work is the easy case: reviewers and scanners never collide, so cost is the only constraint.

## When to keep it sequential

- **Related symptoms.** Failures with one plausible common cause: investigate together first. Three agents fixing three symptoms of one bug produce three patches and no diagnosis.
- **Whole-system judgment.** Work whose correctness depends on seeing the whole picture, like a boundary redesign, degrades when sliced.
- **Exploratory work.** If you don't know the shape of the problem yet, you can't write the scopes. Explore first, then parallelize what that reveals.
- **Overlapping writes.** See below.

## File footprint is the safety rule

Two agents writing the same file lose work — the later write lands on a file the earlier one already changed, or one agent undoes the other's edit while tidying. Neither summary will say so; both report success.

Before dispatch, write down each agent's expected write set and check for overlap. Where sets overlap, pick one:

- **Sequence them** — one after another, each seeing the previous result.
- **Isolate them** — a worktree or branch per agent, merged deliberately afterwards.
- **Re-cut the scopes** — often the overlap is one shared helper. Change it yourself first, then dispatch the rest in parallel.

Shared non-file state collides the same way: two agents migrating one database, or both regenerating a lockfile.

## How wide to fan out

Concurrency is not free even when the work is independent: each agent holds its own context and competes for the same rate limits, CPU, and file handles. Unbounded fan-out on heavyweight work produces timeouts, truncated reads, and half-finished reports — slower than a batched run and harder to trust.

Size the batch by how expensive each agent is, not by how many you have:

- **Heavyweight** — reads broadly across a codebase and reasons at length (audit reviewers, architecture analysis, whole-repo research): about **two at a time**, waiting for each batch before starting the next. That is why `skills/audit/SKILL.md` runs its reviewers in batches of 2.
- **Lightweight and bounded** — a named file or two, a short prompt, one verification command: 3-5 comfortably, more when tasks are trivial.

Underneath both: batch size is the number of agents whose combined reading you can afford in flight at once. If you can't state an agent's footprint, treat it as heavyweight; if a batch returns truncated output or resource errors, halve the width.

## What every dispatch prompt carries

An agent that has to guess produces work you redo. Five things:

1. **Scope** — the files, directory, or subsystem, and the boundary it must not cross.
2. **Context** — error output, manifests, project stage, conventions. Paste it; the agent inherits neither your context nor your rules, so pass `references/subagent-safety.md` to anything reading a repository.
3. **Constraints and non-goals** — "tests only, no production code", "leave the schema alone". The negative space keeps the footprint honest.
4. **Output shape** — the headings, fields, and evidence lines you will consume. Uniform shape makes many results mergeable.
5. **Verification** — the command that shows the work is done, and the instruction to run it.

`references/audit-reviewer-prompts.md` is a worked example of all five. Pick each agent's model from `references/model-strategy.md`: parallelism multiplies cost.

## Reviewing what comes back

An agent's summary is a claim. The diff is the evidence.

- Read the diff, not only the report. Agents overstate completion, understate what they touched, and — given the same prompt shape — make the same mistake at the same time.
- Check for cross-agent conflicts: anyone writing outside their declared footprint, two changes cancelling out.
- Re-run verification yourself over the whole target, not slice by slice: green in isolation and green together are different results.

## Sending fixes back

Return a wrong or incomplete result to the agent that produced it — it still holds the investigation: the reading, the discarded theories, the reason it chose this fix. Patching inline leaves a change nobody understands; a fresh agent re-covers the same ground and often decides differently.

Redispatch only after changing the conditions — more context, narrower scope, a different constraint; the same prompt returns the same result. `references/subagent-statuses.md` maps result signals to controller behaviour.

## Worked example: batched reviewer fan-out

Six reviewers for a large-codebase audit, each reading broadly and writing nothing.

```
Batch 1: performance-engineer, architecture-engineer   → wait
Batch 2: daniel-product-engineer, lee-nextjs-engineer  → wait
Batch 3: security-engineer, senior-engineer            → wait
```

Two at a time because each reviewer holds a whole-codebase context. Footprint safety is not the constraint — nothing is written — so batch width is purely a resource decision. Findings are consolidated and vetted afterwards, not trusted on arrival.

## Worked example: independent task fan-out

Six test failures across three files after a refactor, three distinct root causes.

One agent per file, each given its failing test names and output, a constraint against the other two files, and the command to verify that file. Footprints are disjoint by construction and each agent reads one test file and its subject, not the repo, so all three run at once.

On return: read all three diffs, confirm nobody strayed into a shared helper, run the full suite.
