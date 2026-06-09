<overview>
Design proceeds through five phases. Each phase builds on the previous. Don't skip phases - shortcuts lead to rework.
</overview>

<phase name="understanding">
**Goal:** Fully understand what the user wants to build.

**Techniques:**

- One question at a time
- Multiple choice when possible (easier to answer)
- Open-ended for exploration
- Repeat back understanding to confirm

**Good questions:**

- "What problem does this solve?"
- "Who uses this?"
- "What's the simplest version that's useful?"
- "What's explicitly out of scope?"

**Signals you're done:**

- You can explain the feature in one sentence
- You know what's in scope and what's not
- You understand the constraints
  </phase>

<phase name="exploration">
**Goal:** Consider multiple approaches before committing.

**Always propose 2-3 options:**

1. Your recommended approach (lead with this)
2. A simpler alternative (trade-off: less capability)
3. A more complex alternative (trade-off: more effort)

**For each option, explain:**

- What you gain
- What you lose
- Why you recommend or don't recommend it

**Don't just list options:** Have an opinion. "I recommend X because..."
</phase>

<phase name="incremental-design">
**Goal:** Design in chunks, validating each before continuing.

**Section size:** 200-300 words. Enough to be meaningful, small enough to review.

**After each section:** "Does this look right so far?"

**If user has concerns:** Address them before moving on. Don't accumulate problems.

**Common sections:**

- Problem statement / user story
- High-level approach
- Data model
- Component structure
- API surface
- Error handling
- Testing approach
  </phase>

<phase name="review">
**Goal:** Get expert perspective, but user has final say.

**Reviewer role:** Advisors, not decision-makers.

**Present findings as questions:**

- "Reviewer suggests X. Keep or change?"
- "Reviewer flags Y as unusual. Is there context?"

**Respect user decisions:** If they want to keep something despite reviewer concerns, that's valid. They know their domain.
</phase>

<phase name="finalization">
**Goal:** Document the design and prepare for implementation.

**Design doc should include:**

- Summary of what we're building
- Key decisions and reasoning
- Reviewer feedback and user decisions
- Open questions (if any)
- Implementation notes

**Location:** `docs/plans/YYYY-MM-DD-<topic>-design.md`
</phase>
