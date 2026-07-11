# Finding Vetting

Vet-and-prioritize discipline for any workflow that consolidates findings from subagents
before presenting them or turning them into plans. Used by `/arc:audit` (Phase 4) and
`/arc:improve` (intake vetting). Subagents over-report — an unvetted finding is a lead,
not a fact.

## The vet pass

Before a finding is presented as Critical/High (audit) or selected for planning (improve),
the orchestrator MUST re-open the cited `file:line` and confirm the finding against the
current code. Never present or plan from a subagent's citation alone.

To make this comparison honest, Critical/High findings must carry an excerpt:

```
Excerpt: <the exact source line(s) the reviewer saw>
```

The vet compares the excerpt against the live file — "is what the reviewer saw still there,
and does it mean what they said?" — instead of re-deriving intent from a bare line number.

## Three failure classes

Expect these; hunt for them explicitly:

1. **By-design.** Standard platform conventions (honoring `https_proxy`, reading `~/.netrc`,
   a dev tool shelling out to configured package managers) and tradeoffs explicitly recorded
   in an ADR (`docs/adr/`) or `CONTEXT.md` are settled decisions, not findings. Flag them only
   when the implementation adds risk beyond the convention or the documented decision. One
   exception cuts the other way: a **stale ADR is itself a finding** — if the code has drifted
   from what the decision doc says, report the drift; don't use the doc to suppress it.

2. **Mis-attributed.** The issue is real but the citation is wrong (wrong file, wrong line,
   stale excerpt). If you can re-locate the issue, correct the citation and keep the finding
   with a note. If you cannot re-locate it, dismiss it — an unlocatable finding cannot be
   planned or fixed.

3. **Cross-session duplicate.** The finding is already tracked (an existing plan or index row)
   or was already considered and rejected (the rejected ledger). Drop it and say so. This is
   distinct from same-run deduplication across subagents — merging two reviewers flagging the
   same `file:line` in one run stays where it already happens, in the consolidating workflow.

Corrections and dismissals are recorded with reasons — audit routes them to its Dismissed
findings block; improve routes rejections to the index's rejected ledger.

## Leverage prioritization

Order vetted findings by **leverage = impact ÷ effort, discounted by confidence and fix-risk**.

- **Impact**: what is being paid because of this, concretely — not "suboptimal".
- **Effort**: S (hours) / M (a day-ish) / L (multi-day), for the fix including tests.
- **Confidence**: HIGH (read the code, certain) / MED (strong signal, needs verification) /
  LOW (smell, needs investigation). LOW-confidence findings get an "investigate" plan, never
  a "fix" plan.
- **Fix-risk**: what the fix could break; a risky fix on a modest problem sinks in the order.

Tiebreakers:

1. Findings that unblock other findings (verification baseline, characterization tests) float up.
2. Prefer findings whose fix has a clean verification story — executors succeed at those.

## "Not worth doing" is a verdict

A short list of high-confidence, high-leverage findings beats a long one. Recording a finding
as not worth doing — with one line of reasoning, in the rejected ledger — is a valid and
valuable outcome: it stops the same finding from being re-surfaced and re-litigated on every
future run.

## Say what was vetted

The presented output must state the vet scope explicitly. If only Critical/High findings were
re-read, say so — e.g. "Medium/Low findings are unverified citations." A reader must never
assume "vetted" applies uniformly when it doesn't.
