---
name: detail
description: Create a detailed implementation plan with exact file paths, test code, and TDD cycles. Turns a design into executable tasks.
---

<required_reading>
**Read these reference files NOW:**
1. ${CLAUDE_PLUGIN_ROOT}/references/testing-patterns.md
2. ${CLAUDE_PLUGIN_ROOT}/references/task-granularity.md
3. ${CLAUDE_PLUGIN_ROOT}/references/frontend-design.md (if UI work involved)
</required_reading>

<process>
## Step 1: Detect Project Stack

**Run detection in parallel:**

```bash
# Test frameworks
ls vitest.config.* 2>/dev/null    # vitest
ls playwright.config.* 2>/dev/null # playwright
ls jest.config.* 2>/dev/null       # jest
ls cypress.config.* 2>/dev/null    # cypress

# Package manager
ls pnpm-lock.yaml 2>/dev/null      # pnpm
ls yarn.lock 2>/dev/null           # yarn
ls package-lock.json 2>/dev/null   # npm

# Framework
grep -l "next" package.json 2>/dev/null   # Next.js
grep -l "react" package.json 2>/dev/null  # React
ls requirements.txt pyproject.toml 2>/dev/null  # Python
```

**Record detected stack:**
- Test runner: [vitest/jest/playwright/cypress/pytest]
- Package manager: [pnpm/yarn/npm/pip/uv]
- Framework: [next/react/fastapi/etc]

## Step 2: Load Design Document

Read the design document created in the previous phase:
`docs/plans/YYYY-MM-DD-<topic>-design.md`

Extract:
- User stories / acceptance criteria
- ASCII UI wireframes
- Data model
- Component structure
- API surface

## Step 2.5: Find Reusable Patterns (Parallel Agents)

**Spawn agents to find existing code to leverage:**

```
Task Explore: "Find existing patterns in this codebase that we can
reuse for: [list components/features from design].
Look for: similar components, utility functions, hooks, types, test patterns.

Structure your findings as:
## Reusable Code
- `file:line` — what it provides and how to use it

## Similar Implementations
- Feature and entry point file:line

## Essential Files for This Feature
List 5-10 files most critical to understand before implementing:
- `file.ts` — why it matters
"

Task Explore: "Analyze coding conventions in this project. What naming patterns,
file organization, and architectural patterns should new code follow?"
```

**If using unfamiliar libraries/APIs:**
```
Task general-purpose: "Gather documentation and best practices for
[library name] focusing on [specific feature needed]."
```

**When agents complete:**
- List reusable code (with file paths)
- Note conventions to follow
- **Share Essential Files list** — these should be read before implementation
- Update task breakdown to use existing utilities

## Step 3: Break Down Into Tasks

**Each task = one TDD cycle (2-5 minutes):**

```
Task N: [Descriptive Name]

Files:
- Create: `exact/path/to/file.tsx`
- Modify: `exact/path/to/existing.tsx:42-58`
- Test: `exact/path/to/file.test.tsx`

Step 1: Write failing test
[exact test code]

Step 2: Run test, verify it fails
[exact command with expected output]

Step 3: Implement minimal code
[exact implementation code]

Step 4: Run test, verify it passes
[exact command with expected output]

Step 5: Commit
[exact commit command with message]
```

**Task ordering:**
1. Data/types first (foundation)
2. Core logic (business rules)
3. UI components (presentation)
4. Integration (wiring together)
5. E2E tests (full flow verification)

## Step 4: Generate Test Commands

<test_commands>
**Based on detected test runner:**

**vitest:**
```bash
# Single test file
pnpm vitest run src/path/to/file.test.tsx

# Single test
pnpm vitest run src/path/to/file.test.tsx -t "test name"

# Watch mode (for development)
pnpm vitest src/path/to/file.test.tsx
```

**playwright:**
```bash
# Single test file
pnpm playwright test tests/path/to/file.spec.tsx

# Single test
pnpm playwright test tests/path/to/file.spec.tsx -g "test name"

# With UI
pnpm playwright test --ui
```

**jest:**
```bash
# Single test file
pnpm jest src/path/to/file.test.tsx

# Single test
pnpm jest src/path/to/file.test.tsx -t "test name"
```
</test_commands>

## Step 5: Include UI References

For each UI task, include all relevant visual + aesthetic references:

```
Task N: Create ProductCard Component

Aesthetic Direction (from design doc):
- Tone: [e.g., "luxury/refined"]
- Memorable: [e.g., "hover lift with shadow bloom"]
- Typography: [e.g., "GT Sectra display + IBM Plex Sans body"]
- Color: [e.g., "warm neutrals, gold accent"]
- Motion: [e.g., "subtle hover states, no page transitions"]

Figma Reference:
- URL: https://figma.com/design/xxx/yyy?node-id=123-456
- Screenshot: docs/plans/assets/YYYY-MM-DD-topic/figma-123-456.png
- To fetch fresh context during implementation:
  mcp__figma__get_design_context: fileKey="xxx", nodeId="123:456"

ASCII Wireframe (from design):
┌─────────────────┐
│   [image]       │
├─────────────────┤
│ Product Name    │
│ $99.00          │
│ [Add to Cart]   │  ← hover lift + shadow bloom
└─────────────────┘

Implementation Notes:
- AVOID: Inter/Roboto, purple gradients, generic shadows
- ENSURE: The hover effect is the memorable moment

Files:
- Create: `src/components/product-card.tsx`
- Test: `src/components/product-card.test.tsx`
...
```

**Why all three (aesthetic + Figma + ASCII):**
- Aesthetic direction = the creative vision
- ASCII = structure and layout intent
- Figma = exact implementation details
- All three ensure the result is intentional, not generic

## Step 6: Write Implementation Plan

**Header:**
```markdown
# [Feature Name] Implementation Plan

> **For Claude:** Use /arc:implement to implement this plan task-by-task.

**Design:** [Link to design doc]
**Goal:** [One sentence]
**Stack:** [Framework] + [Test runner] + [Package manager]

---
```

**Tasks section:**
Write all tasks following the template from Step 3.

**Save to:** `docs/plans/YYYY-MM-DD-<topic>-implementation.md`

## Step 7: Commit and Offer Execution

```bash
git add docs/plans/
git commit -m "docs: add <topic> implementation plan"
```

**Check workspace:**
```bash
git branch --show-current
```

**If on main/master and plan involves multiple files:**
```
"Implementation plan ready. Before executing, I recommend setting up a worktree to keep main clean."
```

Options:
1. **Set up worktree and execute** (Recommended) → Follow `${CLAUDE_PLUGIN_ROOT}/disciplines/using-git-worktrees.md`, then route to `/arc:implement`
2. **Execute on current branch** → Route to `/arc:implement` directly
3. **Review plan first** → Open for user review, then decide
4. **Done for now** → End session

**If already on feature branch:**
```
"Implementation plan ready. How would you like to proceed?"
```

Options:
1. **Execute now** → Route to `/arc:implement`
2. **Review plan first** → Open for user review
3. **Done for now** → End session
</process>

<success_criteria>
Implementation plan is complete when:
- [ ] Test framework detected
- [ ] Design document loaded
- [ ] Tasks broken into TDD cycles (2-5 min each)
- [ ] Each task has exact file paths
- [ ] Each task has test code + implementation code
- [ ] Each task has exact test commands
- [ ] ASCII UI references included for UI tasks
- [ ] Plan committed to git
- [ ] User offered execution options
</success_criteria>
