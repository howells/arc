<overview>
Review is a collaborative refinement, not a critique. The same Socratic dialogue that built the design is used to simplify it.
</overview>

<philosophy>
**Build together, then simplify together.**

The design phase builds up the solution through questions:

- "What if we also handled X?"
- "Should this support Y?"
- "Do you need Z?"

The review phase simplifies through the same questioning style:

- "Do we actually need X, or could we start without it?"
- "What if we simplified Y to just handle the common case?"
- "Is Z core to the solution, or could it be a fast-follow?"

**Same collaborative spirit, different direction.**
</philosophy>

<socratic_review>
**Transform reviewer findings into exploratory questions:**

Instead of: "The simplicity reviewer says remove the caching layer."
Say: "Looking at this again - do we need caching in v1, or could we add it when we see performance issues?"

Instead of: "The architecture reviewer flags this as overengineered."
Say: "We have three layers here. What if we started with just one and added complexity when we hit limits?"

Instead of: "This abstraction is premature."
Say: "We're creating a generic solution for one use case. What if we hardcoded it for now and extracted later if we need to?"

**The question invites reflection, not defense.**
</socratic_review>

<simplification_dialogue>
**Questions that encourage simplification:**

Scope:

- "What's the smallest version that's useful?"
- "If we had to ship in a day, what would we keep?"
- "Which of these is nice-to-have vs must-have?"

Complexity:

- "What if we started with the simple version?"
- "Do we need this flexibility, or are we guessing?"
- "What breaks if we remove this?"

Timing:

- "Does this need to be in v1?"
- "Could this be a fast-follow once we validate the core?"
- "What would we learn from shipping without this?"

**These aren't rhetorical.** Listen to the answers. Sometimes the complexity is justified.
</simplification_dialogue>

<respecting_decisions>
**When the user wants to keep something:**

If user says "I need this because X":

- Acknowledge the reasoning
- Note it in the design doc
- Move on

If user says "I'm not sure, but I think we need it":

- Explore together: "What scenario requires it?"
- If they can't articulate: "Want to try without it and see?"
- If they can articulate: "Got it, let's keep it."

**Never argue.** Present perspective, accept decision.
</respecting_decisions>

<presenting_findings>
**Group and prioritize:**

1. **Things that might not work** (blockers)
   - "The data model doesn't handle X. How should we address that?"

2. **Things that could be simpler** (suggestions)
   - "We could simplify this by... What do you think?"

3. **Things that are fine but unconventional** (awareness)
   - "This is unusual but not wrong. Just flagging in case you want to discuss."

**For each, ask:** "Keep as-is, modify, or discuss further?"
</presenting_findings>

<anti_patterns>
**Don't do these:**

- Present reviewer feedback as mandates
- Use "should" or "must" for simplification suggestions
- Make the user defend their choices
- Batch all feedback at the end (present as you go)
- Assume reviewers are right and user is wrong
- Override user decisions
  </anti_patterns>
