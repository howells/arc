# Agent Evals

Evaluating LLM-agent systems so changes are measured, not vibes. Load this when a repo ships an agent, RAG pipeline, or LLM-backed feature and needs a regression signal. Core stance: **a prompt edit is a code change** — it goes through the same eval gate as any other diff.

## Golden set

The foundation. Everything else scores against it.

- **Curated input → expected pairs** drawn from _real traffic_, not invented examples. Mine logs for representative and edge cases; the distribution should look like production.
- **Versioned in-repo** (e.g. `evals/golden/*.jsonl`) so the set evolves with the code and every run is reproducible. A golden set living in someone's notebook is not a golden set.
- Grow it from failures: every shipped bug becomes a new golden case so it can't silently regress.
- Keep expected outputs about _behaviour_, not exact strings, where the output is non-deterministic (assert on required facts / structure, not verbatim text).

## Scorers: deterministic vs judge

- **Deterministic scorers first.** Exact match, JSON-schema validity, regex/contains, tool-call correctness, latency, cost. Cheap, stable, no calibration needed. Use them wherever the correct answer is checkable.
- **LLM judges** only for genuinely subjective dimensions (helpfulness, tone, faithfulness). A judge is itself a model that can be wrong.
- **Calibrate the judge before trusting it:** spot-check judge verdicts against human labels on a sample and measure agreement. If judge-vs-human agreement is low, fix the rubric before using the judge as a gate — an uncalibrated judge is a random number generator with a confident voice.

## Groundedness (retrieval-backed agents)

For RAG / tool-augmented agents, score whether the answer is _supported by the retrieved context_:

- **Groundedness / faithfulness** — is every claim traceable to a retrieved source, or is the model confabulating?
- **Context relevance** — did retrieval surface the right documents in the first place? A grounded answer over the wrong context is still wrong.
- Track these separately: a drop in groundedness and a drop in retrieval quality demand different fixes.

## Smoke vs full

- **Smoke evals** — a small, cheap slice that runs on **every CI run**. Deterministic scorers on a few dozen golden cases. Catches gross regressions in seconds without burning budget.
- **Full evals** — the whole golden set, judges included, run **scheduled or pre-release**. This is the real quality bar; it's too slow/expensive for every commit.
- Gate merges on smoke; gate releases on full.

## Track scores across changes

- Record each eval run against the commit/prompt version. A prompt tweak that lifts one metric often quietly drops another — you only see it if you diff runs.
- Fail the gate on **regression**, not just an absolute floor: "this change lowered groundedness from 0.92 to 0.85" is a blocker even if 0.85 clears a nominal bar.
- Treat prompts, tool definitions, and model-version bumps as versioned inputs — pin them, and re-run evals when any of them change.
