<process>
## Step 1: Understand the Approach

Ask user to describe their approach in 2-3 sentences, or share a brief summary.

## Step 2: Quick Context Check

Quickly scan project for:
- Project type (TypeScript/Python/Go)
- Existing patterns that might be relevant
- Constraints or conventions

## Step 3: Sanity Check

Spawn a single reviewer (architecture-strategist) for a quick sanity check:

```
Task: "Quick sanity check on this approach: [user's description].
Focus on: (1) fundamental issues that would require rework,
(2) missing pieces they should consider before diving in.
Keep it brief - just flag major concerns."
```

## Step 4: Present Findings

**If no major concerns:**
"Approach looks sound. Go ahead."

**If concerns found:**
Present each briefly:
- "Consider X before proceeding"
- "This might conflict with Y in the codebase"
- "You'll also need to handle Z"

Ask: "Want to proceed anyway, adjust the approach, or dive into full design mode?"

## Step 5: Route Based on Response

- Proceed anyway → Done, user continues
- Adjust → Discuss adjustments, then done
- Full design mode → Route to `workflows/ideate.md`
</process>

<success_criteria>
Quick validation is complete when:
- [ ] User's approach understood
- [ ] Quick review completed
- [ ] Findings presented (if any)
- [ ] User knows how to proceed
</success_criteria>
