<required_reading>
**Read these reference files NOW:**
1. references/testing-patterns.md
2. references/frontend-design.md (if UI work involved)
</required_reading>

<process>
## Phase 1: Setup

**If not already in worktree:**
```bash
# Check current location
git branch --show-current

# If on main/dev, create worktree
git worktree add .worktrees/<feature-name> -b feature/<feature-name>
cd .worktrees/<feature-name>
```

**Install dependencies:**
```bash
pnpm install  # or yarn/npm based on lockfile
```

**Verify clean baseline:**
```bash
pnpm test     # or relevant test command
```

If tests fail before you start → stop and ask user.

## Phase 2: Load Plan and Create Todos

**Read implementation plan:**
`docs/plans/YYYY-MM-DD-<topic>-implementation.md`

**Create TodoWrite tasks:**
One todo per task in the plan. Mark first as `in_progress`.

## Phase 3: Execute in Batches

**Default batch size: 3 tasks**

For each task:

### Step 1: Mark in_progress
Update TodoWrite.

### Step 2: Follow TDD cycle exactly

```
1. Write the test (copy from plan)
2. Run test → verify FAIL
3. Write implementation (copy from plan, adapt as needed)
4. Run test → verify PASS
5. Fix TypeScript + lint (see below)
6. Commit with message from plan
```

<continuous_quality>
**After every implementation, before commit:**

**TypeScript check:**
```bash
pnpm tsc --noEmit
# or: pnpm typecheck (if script exists)
```

**Biome lint + format:**
```bash
pnpm biome check --write .
# or: pnpm lint:fix (if script exists)
```

**If issues found:**
- Fix immediately
- Don't accumulate debt
- If stuck on a type issue → spawn a quick agent:
  ```
  Task general-purpose model: haiku: "Fix TypeScript error in [file]: [error message]"
  ```

**Why continuous:**
- Catching TS errors early is easier than fixing 20 at once
- Biome auto-fix keeps code consistent
- Each commit is clean and deployable
</continuous_quality>

**If test doesn't fail when expected:**
- Test might be wrong
- Implementation might already exist
- Stop and ask user

**If test doesn't pass after implementation:**
Spawn debugger agent immediately:
```
Task debugging-toolkit:debugger model: sonnet: "Test failing unexpectedly.
Test file: [path]
Test name: [name]
Error: [error message]
Implementation: [path]
Debug and fix."
```

If debugger can't resolve after one attempt → stop and ask user

### Step 3: Mark completed
Update TodoWrite.

### Step 4: Checkpoint after batch

After every 3 tasks:

```
Completed:
- Task 1: [description] ✓
- Task 2: [description] ✓
- Task 3: [description] ✓

Tests passing: [X/X]

Ready for feedback before continuing?
```

Wait for user confirmation or adjustments.

## Phase 4: Quality Checkpoints

**After completing data/types tasks:**
- Spawn data-integrity-guardian for quick review
- Present findings as questions

**Before starting UI tasks — INVOKE FRONTEND-DESIGN FOR BUILD:**

```
Skill frontend-design: "Build UI components for [feature].

Aesthetic Direction (from design doc):
- Tone: [tone]
- Memorable element: [what stands out]
- Typography: [fonts]
- Color strategy: [approach]
- Motion: [philosophy]

Figma: [URL if available]
Files to create: [list from implementation plan]

Apply the aesthetic direction to every decision. Make it memorable, not generic."
```

**Why invoke the skill, not just follow principles:**
- The skill has creative energy and specific guidance
- It makes bold decisions, not safe ones
- It catches generic patterns as they're written, not after

**Fetch Figma context:**
```
mcp__figma__get_design_context: fileKey, nodeId
mcp__figma__get_screenshot: fileKey, nodeId
```

**After each UI task, quick self-check:**
- [ ] Would a designer call this "generic AI slop"?
- [ ] Is the memorable element actually memorable?
- [ ] Did I avoid Inter/Roboto/Arial and purple gradients?

**After completing ALL UI tasks — INVOKE FRONTEND-DESIGN FOR REVIEW:**

```
Task compound-engineering:frontend-design model: opus: "Review the completed UI implementation.

Aesthetic Direction (from design doc):
- Tone: [tone]
- Memorable element: [what stands out]
- Typography: [fonts]
- Color strategy: [approach]

Files: [list of UI component files]
Figma: [URL if available]

Check for:
- Generic AI aesthetics (Inter, purple gradients, cookie-cutter layouts)
- Deviation from aesthetic direction
- Missing memorable moments
- Inconsistent application of design system
- Accessibility concerns
- Missing states (loading, error, empty)"
```

- Run playwright visual test if available
- Take screenshots of key states
- Compare against Figma screenshot
- Address any review findings before proceeding

**When implementing unfamiliar library APIs:**
```
mcp__context7__resolve-library-id: "[library name]"
mcp__context7__get-library-docs: "[library ID]" topic: "[specific feature]"
```
Use current documentation to ensure correct API usage.

**After completing all tasks:**
- Run full test suite
- Run linting

## Phase 5: Final Quality Sweep

**Always run (in parallel agents for speed):**

```
Task general-purpose model: haiku: "Run TypeScript check (tsc --noEmit) and fix any errors"
Task general-purpose model: haiku: "Run Biome check (biome check --write .) and fix any issues"
Task general-purpose model: haiku: "Run test suite and report results"
```

Wait for all agents to complete. If issues found, fix before proceeding.

## Phase 5b: E2E Tests (If Created)

If e2e tests were created as part of this implementation:

**Spawn dedicated agent to run and fix e2e tests:**
```
Task e2e-test-runner model: sonnet: "Run e2e tests for the feature we just implemented. Fix any failures and iterate until all pass."
```

**Why a separate agent?**
- E2E tests produce verbose output (traces, screenshots, DOM snapshots)
- Fixing may require multiple iterations
- Keeps main conversation context clean

Wait for agent to complete. Review its summary of fixes applied.

## Phase 6: Expert Review (Optional)

For significant features, offer parallel review:

"Feature complete. Run expert review before PR?"

If yes, spawn in parallel (all use sonnet for balanced cost/quality):
- code-simplicity-reviewer (model: sonnet)
- architecture-strategist or domain-specific reviewer (model: sonnet)
- security-sentinel if auth/data involved (model: sonnet)

Present findings as Socratic questions (see `references/review-patterns.md`).

## Phase 7: Ship

**Ensure all tests pass:**
```bash
pnpm test
pnpm lint
```

**Create PR:**
```bash
git push -u origin feature/<feature-name>

gh pr create --title "feat: <description>" --body "$(cat <<'EOF'
## Summary
- What was built
- Key decisions

## Testing
- [X] Unit tests added
- [X] E2E tests added (if applicable)
- [X] All tests passing

## Screenshots
[Include if UI changes]

## Design Doc
[Link to design doc]

## Implementation Plan
[Link to implementation plan]
EOF
)"
```

**Report to user:**
- PR URL
- Summary of what was built
- Any follow-up items

**Cleanup worktree (optional):**
```bash
cd ..
git worktree remove .worktrees/<feature-name>
```
</process>

<when_to_stop>
**STOP and ask user when:**
- Test fails unexpectedly
- Implementation doesn't match plan
- Stuck after 2 debug attempts
- Plan has ambiguity
- New requirement discovered
- Security concern identified

**Don't guess. Ask.**
</when_to_stop>

<success_criteria>
Execution is complete when:
- [ ] All tasks marked completed in TodoWrite
- [ ] All tests passing
- [ ] Linting passes
- [ ] PR created
- [ ] User informed of completion
</success_criteria>
