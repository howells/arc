# Error Handling

Rules for error handling across the stack. See [api.md](api.md) for API error format and [typescript.md](typescript.md) for type-level rules.

## Philosophy

- MUST: Let errors propagate unless you can recover, transform, or report.
- MUST: Distinguish between expected errors (validation, 404, auth) and unexpected crashes (null ref, network failure).
- MUST: **Fail fast.** Surface bugs immediately. A crash with a stack trace is better than silent wrong behavior.
- NEVER: Swallow errors silently. No empty `catch {}` blocks.
- NEVER: Use fallback values to hide failures. If data is missing and shouldn't be, throw — don't return `[]`, `null`, or a default.

## Silent Fallbacks (LLM Anti-Pattern)

LLM-generated code systematically hides bugs behind defensive fallbacks. These patterns make code "always work" by silently degrading instead of surfacing the real problem. **Every fallback must be intentional and justified — not a safety blanket.**

### Patterns to Reject

```typescript
// BAD: Hides a broken API response behind an empty array
const users = response.data?.users ?? [];

// GOOD: If users should exist, crash loudly
const users = response.data.users; // TypeError if missing = good, you'll find the bug

// GOOD: If it's genuinely optional, be explicit about why
const users = response.data?.users ?? []; // API returns null for new accounts with no users
```

```typescript
// BAD: Catch-and-return-default hides the actual error
try {
  const config = await loadConfig();
} catch {
  return DEFAULT_CONFIG; // Bug in loadConfig() now invisible forever
}

// GOOD: Let it throw — the caller should know config loading failed
const config = await loadConfig();

// GOOD: If you must catch, catch specifically and re-throw unknown errors
try {
  const config = await loadConfig();
} catch (error) {
  if (error instanceof FileNotFoundError) {
    return DEFAULT_CONFIG; // Intentional: first run has no config file
  }
  throw error; // Unknown errors propagate
}
```

```typescript
// BAD: Optional chaining as a band-aid
const title = post?.metadata?.title ?? "Untitled";

// GOOD: If post and metadata should exist at this point, access directly
const title = post.metadata.title; // Crash = bug in data loading upstream
```

```typescript
// BAD: try/catch around trusted internal code
try {
  const result = formatUserName(user);
} catch {
  return "Unknown User"; // formatUserName bug now invisible
}

// GOOD: Trust internal code. If it throws, that's a bug to fix.
const result = formatUserName(user);
```

### When Fallbacks ARE Correct

- **System boundaries:** External API responses, user input, webhook payloads — you can't trust the shape.
- **Graceful degradation by design:** Feature flags, optional enhancements, progressive loading.
- **Documented optionality:** The value is genuinely nullable by design, not because something failed.

**The test:** Can you explain *why* this fallback exists without saying "just in case"? If not, remove it.

## Server-Side

- MUST: API errors use the standard error shape. See [api.md](api.md).
- MUST: Log unexpected errors with stack traces and request context (user ID, route, timestamp).
- SHOULD: Use an error tracking service (Sentry) for production. Alert on new error patterns, not every occurrence.
- NEVER: Catch errors just to re-throw them unchanged.

## Client-Side

- MUST: Add React error boundaries at route-level to catch render crashes.
- SHOULD: Use toast notifications for recoverable errors (failed saves, network issues).
- SHOULD: Use full-page error states for unrecoverable errors (auth expired, 500).
- SHOULD: Provide a retry action where the operation is idempotent.

## Error Pages

- MUST: Custom 404 page with navigation back to a working state.
- SHOULD: Custom 500 page that doesn't depend on any data fetching.
- SHOULD: `error.tsx` (Next.js) or equivalent at the root layout level.

## Forms

- MUST: Show field-level validation errors inline, not in alerts or toasts.
- SHOULD: Validate on blur for individual fields, on submit for the full form.
