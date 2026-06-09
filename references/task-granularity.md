<overview>
Each task is one TDD cycle: 2-5 minutes of focused work. Small enough to complete confidently, large enough to be meaningful.

Tasks are **executable prompts, not documentation**. A fresh-context agent with zero prior knowledge should be able to execute a task from its XML alone.
</overview>

<task_structure>
**Every task uses this XML structure:**

```xml
<task id="1" depends="" type="auto">
  <name>Create user authentication types</name>
  <files>
    <create>src/types/auth.ts</create>
    <test>src/types/auth.test.ts</test>
  </files>
  <read_first>
    src/lib/db.ts
    src/types/user.ts
  </read_first>
  <action>
    Define LoginCredentials, AuthSession, and AuthError types.
    LoginCredentials: { email: string; password: string }
    AuthSession: { userId: string; token: string; expiresAt: Date }
    AuthError: { code: "INVALID_CREDENTIALS" | "EXPIRED_SESSION" | "RATE_LIMITED"; message: string }

    Export all types. Use zod schemas for runtime validation.
    Import User type from src/types/user.ts.
  </action>
  <test_code>
    import { describe, it, expect } from "vitest";
    import { LoginCredentialsSchema } from "./auth";

    describe("LoginCredentialsSchema", () => {
      it("validates correct credentials", () => {
        const result = LoginCredentialsSchema.safeParse({
          email: "test@example.com",
          password: "securepass123",
        });
        expect(result.success).toBe(true);
      });

      it("rejects invalid email", () => {
        const result = LoginCredentialsSchema.safeParse({
          email: "not-an-email",
          password: "securepass123",
        });
        expect(result.success).toBe(false);
      });
    });
  </test_code>
  <verify>
    pnpm vitest run src/types/auth.test.ts — all pass
    pnpm tsc --noEmit — no type errors
  </verify>
  <done>Auth types exported, zod schemas validate at runtime, tests pass</done>
  <commit>feat(auth): add authentication types with zod validation</commit>
</task>
```

### Required XML elements

| Element        | Required | Purpose                                                                     |
| -------------- | -------- | --------------------------------------------------------------------------- |
| `<name>`       | Yes      | Descriptive task name                                                       |
| `<files>`      | Yes      | `<create>`, `<modify>`, and/or `<test>` children                            |
| `<read_first>` | Yes\*    | Files to verify before acting. \*Can be empty for pure-creation tasks       |
| `<action>`     | Yes      | What to do — with **inline values** (env vars, signatures, library choices) |
| `<test_code>`  | Yes\*\*  | Exact test code. \*\*Omit only for checkpoint tasks                         |
| `<verify>`     | Yes      | Concrete, observable acceptance criteria — commands to run, states to check |
| `<done>`       | Yes      | Grep-verifiable completion marker                                           |
| `<commit>`     | Yes      | Exact commit message                                                        |

### Task attributes

| Attribute | Values                                                                | Purpose                                                  |
| --------- | --------------------------------------------------------------------- | -------------------------------------------------------- |
| `id`      | Integer                                                               | Unique task identifier                                   |
| `depends` | Comma-separated IDs                                                   | Tasks that must complete first (empty = no dependencies) |
| `type`    | `auto`, `checkpoint:verify`, `checkpoint:decide`, `checkpoint:action` | Execution type                                           |

### Key principles for task content

**`<read_first>` — verify before acting:**

- List every file the agent needs to read before implementing
- The agent MUST check these files exist and match expectations
- If a file doesn't exist or has unexpected content → `NEEDS_CONTEXT`, don't assume

**`<action>` — self-contained with inline values:**

- Include exact env var names, function signatures, library choices with rationale
- Never write "look up the config" or "check the existing implementation" — put the value inline
- If a choice was made during design (e.g., "use jose not jsonwebtoken"), state it and why

**`<verify>` — concrete and observable:**

- Every criterion must be a command that produces output or a state that can be checked
- Bad: "works correctly", "looks good", "as expected"
- Good: `curl -X POST localhost:3000/api/auth returns 200`, `pnpm vitest run path/file.test.ts — all pass`

**`<done>` — grep-verifiable:**

- Should be checkable without running the code
- Describes the observable outcome, not the process
  </task_structure>

<granularity_examples>
**Too big (don't do this):**

```
Task 1: Create user authentication system
- Add login form
- Add registration form
- Add password reset
- Add session management
- Add tests
```

**Right size:**

```
Task 1: Create User type
Task 2: Create login form component (UI only)
Task 3: Add login form validation
Task 4: Add login API call
Task 5: Add login success redirect
Task 6: Add login error handling
Task 7: Create registration form component (UI only)
... etc
```

**Each task = one thing that can fail.**
</granularity_examples>

<ordering>
**Build from foundation up:**

1. **Types/Interfaces** - Define the shape of data
2. **Utilities** - Pure functions for business logic
3. **Components (dumb)** - UI without logic
4. **Components (smart)** - UI with state/effects
5. **Integration** - Wire components together
6. **E2E tests** - Full user flows

**Why this order:**

- Types catch errors early
- Utilities can be tested in isolation
- Dumb components are easy to test
- Smart components use tested utilities
- Integration uses tested components
- E2E validates the whole chain
  </ordering>

<ordering_strategy>
**Choose ordering based on feature complexity:**

**Bottom-up (default)** — Types → utilities → components → integration. Use for well-understood features where the data shape and boundaries are clear.

**Tracer bullet (complex features)** — Implement one complete behavior through ALL layers first (type → utility → component → API → E2E test), then expand. Use when:

- Feature spans 3+ layers (e.g., new form → API route → database → email)
- Architecture is unproven (new pattern, unfamiliar library, first feature of its kind)
- User expresses uncertainty about the right approach

**Why tracer bullet works:** It proves the architecture early. If the database schema is wrong or the API shape doesn't fit the UI, you discover it on task 1 — not task 15. The first vertical slice is the hardest; every subsequent slice is faster because the pattern is proven.

**Example — adding a comments feature:**

Bottom-up:

```
Task 1: Create Comment type
Task 2: Create CommentList component (UI only)
Task 3: Create CommentForm component (UI only)
Task 4: Create comments API route
Task 5: Wire CommentForm to API
Task 6: Wire CommentList to API
Task 7: E2E test for commenting flow
```

Tracer bullet:

```
Task 1: Create Comment type + API route + CommentForm + E2E test (one comment, end-to-end)
Task 2: Add CommentList with real data
Task 3: Add validation and error handling
Task 4: Add editing and deletion
Task 5: Add pagination
```

When suggesting tracer bullet, explain the tradeoff: "The first task is bigger, but it proves the whole architecture works before we invest in details."
</ordering_strategy>

<commit_messages>
**Use conventional commits:**

```
feat(scope): add new feature
fix(scope): fix specific bug
refactor(scope): improve code without changing behavior
test(scope): add or update tests
docs(scope): update documentation
```

**Scope = feature area:**

- `feat(auth): add login form`
- `feat(cart): add quantity selector`
- `fix(checkout): handle empty cart`

**Keep messages short but descriptive:**

- Good: `feat(auth): add password visibility toggle`
- Bad: `add stuff`
- Bad: `feat(auth): add a toggle button that allows users to see their password when they click on an eye icon in the password input field`
  </commit_messages>

<checkpoints>
**After every 3 tasks, pause:**

```
Completed:
- Task 1: Create User type ✓
- Task 2: Create login form UI ✓
- Task 3: Add form validation ✓

Tests passing: 3/3
TypeScript: clean
Lint: clean

Ready for feedback?
```

**Why checkpoints:**

- Catch mistakes early
- Get user input before going too far
- Natural pause for questions
- Prevents runaway implementation
  </checkpoints>
