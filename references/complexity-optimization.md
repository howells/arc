# Complexity Optimization

Use this reference when reviewing algorithmic complexity, performance hotspots, rendering churn, repeated scans, or N+1 data access. Treat static signals as leads, not proof.

## Core Rule

Optimize only when the current behavior is understood and can be preserved. Prefer a small, measured improvement with tests over a broad rewrite with unclear correctness.

Report-only analysis must not modify files. Implementation requires an explicit user request.

## Report Shape

For each real opportunity, report:

- Location.
- Current pattern and why it may be costly.
- Estimated current complexity.
- Recommended change.
- Estimated complexity after the change.
- Why behavior should remain equivalent.
- Risk level.
- Tests, benchmarks, or manual checks needed.

Rank by likely impact. Prioritize hot paths, large input paths, rendering loops, database/API loops, and shared utilities. Separate algorithmic complexity from constant-factor cleanup.

## Common Transformations

### Nested Lookup Loops

Symptom: for each item in one collection, scan another collection to find a match.

Preferred fix: build a map from the lookup collection once, then perform stable key lookups.

Complexity: `O(a*b)` to `O(a+b)`.

Check:
- Are duplicate keys possible?
- Did the original choose first match, last match, or all matches?
- Is ordering observable?
- Is key normalization required?

### Repeated Membership Checks

Symptom: `includes`, `indexOf`, `find`, `findIndex`, `in`, or equivalent inside a loop.

Preferred fix: convert the membership collection to a set or map once, when equality semantics are stable.

Complexity: `O(n*m)` to `O(n+m)`.

Check:
- Does equality change after conversion?
- Are object identity, hashability, or normalization relevant?

### Sorting Inside Loops

Symptom: sorting the same or growing collection repeatedly.

Preferred fix: sort once outside the loop, maintain a heap, or use binary search/insertion when intermediate ordering matters.

Complexity: often `O(n^2 log n)` to `O(n log n)`, or `O(n log k)` with a heap.

Check:
- Is each intermediate sorted state externally observed?
- Does the comparator depend on loop-local state?

### Pairwise Comparisons

Symptom: compare every pair to find overlaps, nearest values, conflicts, or ranges.

Preferred fixes:
- Sort plus two pointers for pair or range matching.
- Sweep line for interval overlaps.
- Spatial or hash bucketing for local-neighborhood checks.
- Union-find for connectivity.

Complexity: commonly `O(n^2)` to `O(n log n)` or `O(n alpha(n))`.

### Rendering Churn

Symptom: filters, sorts, grouping, expensive transforms, unstable object props, or callbacks run on every render.

Preferred fixes:
- Memoize derived values with correct dependencies.
- Move derivation to selectors, loaders, or server-side preparation.
- Virtualize long lists.
- Stabilize props only when child renders are measurably affected.
- Move expensive work out of render paths.

Check:
- Dependency arrays include every semantic input.
- Memoization does not hide mutation of mutable input objects.

### N+1 Database Or API Calls

Symptom: query, fetch, or request inside a loop.

Preferred fixes:
- Bulk fetch by IDs and join in memory.
- Use joins, includes, preloads, dataloaders, or batched endpoints.
- Cache only when there is a valid invalidation strategy.

Check:
- Tenant, permission, soft-delete, pagination, sorting, and filtering constraints are preserved.
- Missing-record behavior stays the same.
- Rate-limit and retry semantics stay acceptable.

## Safety Checklist

Before editing, confirm:

- Data sizes are large enough for complexity to matter.
- The path is hot enough to justify added structure.
- Output ordering is preserved where callers may rely on it.
- Object identity, mutability, and reference sharing are not public behavior.
- Cache invalidation is explicit.
- Deduplication does not collapse distinct records that merely share a label.
- Database batching preserves tenant, permission, soft-delete, pagination, sorting, and filtering constraints.

After editing:

- Run the narrow relevant test first.
- Run the broadest relevant test/build command.
- Compare before/after benchmark numbers when a benchmark exists or the improvement is performance-critical.
- Keep the patch localized and avoid formatting churn.

## What Not To Do

- Do not replace clear linear code with complex structures when inputs are tiny or the path is cold.
- Do not cache without invalidation.
- Do not use JSON serialization as a general-purpose key unless the key format is stable and collision-safe for the domain.
- Do not change public ordering unless tests and callers prove it is irrelevant.
- Do not trade `O(n)` for `O(n log n)` unless it removes a larger bottleneck or enables batching.
