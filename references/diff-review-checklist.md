# Pre-Landing Diff Review Checklist

Structural review of a diff for issues that pass CI but break in production.

Scope it to whatever change you are about to land: `git diff origin/main` before opening a PR,
or the working tree and staged diff before a commit. `/arc:commit` applies it to the latter.

## How to Use

1. Get the full diff for the change you are landing (`git fetch origin main --quiet && git diff origin/main`, or `git diff` / `git diff --staged` pre-commit)
2. **Read the FULL diff before flagging anything.** Do not flag issues already addressed in the diff.
3. Apply Pass 1 (CRITICAL), then Pass 2 (INFORMATIONAL)
4. Be terse: one line for the problem, one line for the fix

## Output Format

```
Pre-Landing Diff Review: N issues (X critical, Y informational)
# Emit this block when the checklist is the deliverable. When a workflow applies it inline
# (as /arc:commit does), fold the findings into that workflow's own output instead.

**CRITICAL** (blocking):
- [file:line] Problem description
  Fix: suggested fix

**INFORMATIONAL** (non-blocking):
- [file:line] Problem description
  Fix: suggested fix
```

If no issues: `Pre-Landing Diff Review: No issues found.`

---

## Pass 1 — CRITICAL

### Race Conditions & Atomicity

- Check-then-set patterns without atomic operations (read a value, check it, then write — another request can interleave)
- `findOrCreate` / `upsert` patterns on columns without unique DB constraints
- Status transitions that don't use atomic `WHERE old_status = ? UPDATE SET new_status`
- Concurrent access to shared mutable state without locks or transactions

### Trust Boundary Violations

- User-controlled input written to DB or passed to system commands without validation
- LLM-generated values (emails, URLs, names) persisted without format checks
- Structured data from external APIs accepted without type/shape validation
- `html_safe` / `dangerouslySetInnerHTML` on user-controlled strings (XSS)
- Webhook payloads processed without signature verification

### Data Safety

- String interpolation in SQL (even with `.to_i` / `.to_f` — use parameterized queries)
- `update_column` / raw updates bypassing model validations on constrained fields
- Destructive operations (DELETE, DROP, TRUNCATE) without confirmation or soft-delete
- Missing transaction boundaries around multi-step writes that must be atomic

---

## Pass 2 — INFORMATIONAL

### Conditional Side Effects

- Code paths that branch on a condition but forget to apply a side effect on one branch (e.g., sets a status but only attaches a URL in one branch — the other branch creates an inconsistent record)
- Log messages that claim an action happened but the action was conditionally skipped

### Stale References

- Comments or docstrings that describe old behavior after the code changed
- Error messages used as query filters elsewhere (grep for the string — anything matching on it?)
- Constants or config values defined in multiple places that could drift

### Test Gaps

- New code paths without corresponding tests
- Tests that assert type/status but not side effects (URL attached? callback fired? record created?)
- Security enforcement features (auth, rate limiting, blocking) without integration tests verifying the enforcement path

### Dead Code Introduced

- Variables assigned but never read
- Functions added but never called
- Imports added but unused
- Feature flags that are always true/false

### Performance Signals

- N+1 queries: associations used in loops without eager loading
- O(n\*m) lookups in views (Array.find inside a loop instead of building an index)
- Missing DB indexes on columns used in WHERE or JOIN clauses in new queries

---

## Suppressions — DO NOT Flag

- Harmless redundancy that aids readability (e.g., `present?` redundant with `length > 20`)
- "Add a comment explaining why this threshold was chosen" — thresholds change during tuning, comments rot
- "This assertion could be tighter" when the assertion already covers the behavior
- Consistency-only suggestions (wrapping a value in a guard to match how another value is guarded)
- "Regex doesn't handle edge case X" when the input is constrained and X never occurs in practice
- Anything already addressed in the diff being reviewed — read the FULL diff before commenting
- Style preferences (formatting, naming conventions) unless they introduce ambiguity
