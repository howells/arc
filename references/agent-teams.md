<overview>
Agent teams enable multiple Claude Code instances to work as teammates — debating, challenging, and refining each other's findings before results are returned. This reference covers when to use teams vs subagents, how to compose teams, and how to fall back gracefully.
</overview>

<when_to_use>
## Teams vs Subagents — Decision Table

| Condition | Use | Why |
|-----------|-----|-----|
| Tasks are independent, no overlap | **Subagents** | No benefit from communication — teams add cost without value |
| Findings might conflict across reviewers | **Teams** | Reviewers debate and self-resolve with richer rationale |
| Cross-validation improves output quality | **Teams** | Peer scrutiny catches false positives and strengthens real findings |
| Sequential task dependencies | **Subagents** | Teams can't help with ordering constraints |
| Single-domain analysis | **Subagents** | No second perspective to debate with |
| 2+ domains analyzing overlapping code | **Teams** | Same code seen through different lenses benefits from reconciliation |

**Rule of thumb:** If the current skill has a "resolve conflicts between reviewers" section, it's a candidate for teams. If findings are simply collected and concatenated, subagents are sufficient.

**Strong team candidates in Arc:**
- `/arc:audit` — Multiple reviewers analyze overlapping code with different priorities. Conflict resolution table exists precisely because independent review produces contradictions.
- `/arc:review` — 3 reviewers produce findings that become Socratic questions. Pre-debated findings produce stronger questions.

**Not worth it:**
- `/arc:implement` — Sequential tasks with dependencies
- `/arc:document` — Independent writing, no debate needed
- `/arc:test`, `/arc:responsive` — Independent parallel work
- `/arc:suggest`, `/arc:detail` — Sequential research pipelines
</when_to_use>

<team_composition>
## Team Composition Patterns

### Audit Team

All selected reviewers join as teammates. Team name: `arc-audit-[scope-slug]`

```
Teammates: security-engineer, performance-engineer, architecture-engineer, ...
           (same reviewers as subagent mode — selection logic unchanged)
```

Each reviewer maintains their domain expertise and prompt. The difference is communication, not analysis.

### Review Team

The 3 selected reviewers join as teammates. Team name: `arc-review-[plan-slug]`

```
Teammates: [reviewer-1], [reviewer-2], [reviewer-3]
           (same selection logic from Phase 2 — project type determines reviewers)
```

Smaller team = tighter debate. Three perspectives is ideal — enough diversity without noise.
</team_composition>

<communication_pattern>
## Communication Pattern

Teams follow a two-round protocol:

### Round 1: Initial Analysis
Each teammate performs their standard analysis independently (same prompts as subagent mode). This produces their domain-specific findings.

### Round 2: Cross-Review
Each teammate reads the others' findings and responds:
- **Confirms** — "My analysis supports this finding because [evidence]"
- **Challenges** — "This finding is incorrect/overstated because [code-level evidence]"
- **Extends** — "This finding is correct and also affects [additional area]"
- **Reconciles** — "My finding conflicts with yours — here's how both can be addressed: [synthesis]"

After Round 2, findings are already peer-reviewed. The skill receives debated, not raw, results.
</communication_pattern>

<conflict_resolution>
## Conflict Resolution in Teams

When teammates disagree, resolution follows evidence hierarchy:

1. **Code-level evidence wins over principle-based reasoning.** A reviewer citing specific lines, runtime behavior, or test results outweighs one arguing from general best practices.

2. **Domain authority wins within domain.** security-engineer's security judgment outweighs architecture-engineer's security opinion. architecture-engineer's structural judgment outweighs security-engineer's architecture opinion.

3. **Project context breaks ties.** When evidence is equal, the reviewer whose concern is most relevant to the project's current stage wins. Security concerns at production stage outweigh simplicity concerns; simplicity concerns at prototype stage outweigh architecture concerns.

4. **Explicit rationale required.** No silent dismissals. When a finding is challenged and dropped, the challenger must state why. This rationale flows through to the final report.
</conflict_resolution>

<cost_awareness>
## Cost Awareness

Teams cost significantly more than subagents:

| Mode | Token Multiplier | Why |
|------|-----------------|-----|
| Subagents (batched) | 1x | Each agent runs independently |
| Subagents (parallel) | 1x | Same work, just concurrent |
| **Teams** | **3-5x** | Round 2 cross-review multiplies context per agent |

**Only use teams when debate genuinely improves output.** The 3-5x cost is justified when:
- Reviewers historically produce conflicting findings that need manual resolution
- False positives are expensive (user wastes time on invalid findings)
- The audit/review is high-stakes (pre-launch, production)

**Don't use teams when:**
- Cost sensitivity is high
- Reviewers analyze non-overlapping code areas
- Quick feedback is more valuable than deeply validated feedback
</cost_awareness>

<fallback>
## Fallback Behavior

Agent teams are an experimental feature. If team creation fails:

1. **Fail silently** — Do not surface errors about teams to the user
2. **Fall back to subagent dispatch** — Use the standard batched or parallel execution mode
3. **No user notification needed** — The standard mode produces quality output; teams are an enhancement, not a requirement
4. **Log the fallback** — Note in the arc log that team mode was attempted but fell back to standard

```
# Pseudocode for team fallback
attempt to create team "arc-audit-[scope]"
if team creation fails:
    proceed with standard subagent dispatch (batched or parallel)
    # No error message to user — standard mode is the baseline
```

**Detection:** Skills should check for team availability before offering the team mode option. If teams aren't available, the standard mode runs without any mention of teams — the user sees the same experience as before.
</fallback>
