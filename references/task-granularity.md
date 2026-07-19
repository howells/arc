# Task Granularity and Plan XML

Tasks are executable prompts. A task is one coherent implementation slice with one owner,
one observable outcome, and one commit boundary. It may contain several small evidence and
implementation cycles at the same seam. Fifteen to forty-five minutes is a planning heuristic,
not a validator or assurance signal.

## Schema version

New saved and inline plans declare `Plan schema: 2` in their header. Schema 2 enforces `kind`
and the modern seam/evidence fields for automatic tasks. An absent schema header, or explicit
schema 1, is legacy and follows the compatibility path; a newly written schema-2 task may not
omit `kind` and claim legacy treatment.

## Plan-level seams

A seam is an observable boundary through which evidence can prove behavior. It may be an
internal interface; it does not need to become a newly exported public API.

```xml
<seams>
  <seam id="provider">
    <interface>MaterialProvider observable methods</interface>
    <behavior>Maps SDK responses into MaterialDesk domain values</behavior>
    <test>packages/materials/src/mg-client.test.ts</test>
  </seam>
</seams>
```

Seam agreement and availability are owned by `references/testing-patterns.md`. This reference
owns only the XML registry and reference shape.

## New automatic tasks

```xml
<task id="2" depends="1" type="auto" kind="behavior">
  <name>Map catalogue reads to the SDK</name>
  <files>
    <modify>packages/materials/src/mg-client.ts</modify>
    <test>packages/materials/src/mg-client.test.ts</test>
  </files>
  <read_first>
    packages/materials/src/material-provider.ts
    packages/materials/src/mg-client.ts
  </read_first>
  <action>
    Preserve the MaterialProvider contract while mapping catalogue reads to the SDK.
    Reuse existing domain-value constructors and error handling.
  </action>
  <seams>
    <seam ref="provider" />
  </seams>
  <behavior>
    Search, material lookup, siblings, pairings, colour, and taxonomy return the same
    MaterialProvider domain values through SDK-backed reads.
  </behavior>
  <examples>
    A known catalogue request produces independently specified domain values.
    An SDK error preserves the provider's existing error contract.
  </examples>
  <verify>
    pnpm vitest run packages/materials/src/mg-client.test.ts — all pass
    pnpm --filter materials typecheck — no errors
  </verify>
  <done>Catalogue reads use the SDK and preserve the provider contract</done>
  <commit>feat(materials): map catalogue reads to sdk</commit>
</task>
```

### Attributes and elements

| Field                                 | Requirement                                                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `id`                                  | Required unique integer.                                                                                                       |
| `depends`                             | Required; comma-separated task IDs or empty.                                                                                   |
| `type`                                | Required: `auto`, `checkpoint:verify`, `checkpoint:decide`, or dynamically created `checkpoint:action`.                        |
| `kind`                                | Required for new `type="auto"`: `behavior`, `bugfix`, `integration`, `refactor`, `artifact`, `deployment`, or `documentation`. |
| `<name>`                              | Required descriptive slice name.                                                                                               |
| `<files>`                             | Required; checkpoint tasks may use explicit `none`.                                                                            |
| `<read_first>`                        | Required; may be empty for pure creation or explicit `none` for checkpoints.                                                   |
| `<action>`                            | Required self-contained implementation direction.                                                                              |
| `<seams>`, `<behavior>`, `<examples>` | Required for behavior, bugfix, and integration; optional for other auto kinds.                                                 |
| `<verify>`                            | Required concrete commands or observable states.                                                                               |
| `<done>`                              | Required observable completion statement.                                                                                      |
| `<commit>`                            | Required proposed commit message; checkpoints may use explicit `none`; execution still needs commit authority.                 |

Exact source in `<test_code>` is not part of the new schema. Planning specifies behavior and
independent examples; the implementation owner writes exact evidence during execution.

## Checkpoint tasks

New schema-2 checkpoint tasks keep `type="checkpoint:verify"`, `type="checkpoint:decide"`, or
the dynamic `type="checkpoint:action"`. They retain the common task fields, but have no `kind`,
seam, behavior, examples, or evidence-kind requirement. Use `none` for files, read-first paths,
or a proposed commit when the checkpoint creates none. Existing checkpoint tasks remain
compatible without adding fields. See `references/checkpoint-patterns.md`.

```xml
<task id="5" depends="1,2" type="checkpoint:verify">
  <name>Verify dashboard layout</name>
  <files>none — reviews the UI produced by tasks 1 and 2</files>
  <read_first>none — execution context comes from dependencies</read_first>
  <action>Start the dev server and present the implemented responsive states.</action>
  <verify>User approves the named desktop, tablet, and mobile states or describes issues.</verify>
  <done>User judgment recorded</done>
  <commit>none — checkpoint creates no commit</commit>
</task>
```

## Legacy auto tasks

Plans without `kind` use the legacy evidence path. Their existing `<verify>` and optional
`<test_code>` are advisory execution context. Do not manufacture a seam or red test merely
because `kind` is absent. Infer and persist a modern kind only when intent is unambiguous.
Legacy adjacent tasks may share one owner while every task ID and durable status remains intact.

## Slice cohesion

A coherent slice:

- delivers one behavior or milestone through one primary seam;
- can be owned and reviewed as one unit;
- has concrete focused verification;
- creates a coherent commit when commits are authorized;
- does not mix independent subsystems merely to reduce task count.

File count alone never forces a split or raises assurance. Split when responsibilities,
seams, owners, or independently shippable outcomes diverge.

## Ordering

Use dependencies, not a universal horizontal order. Prefer vertical tracer slices when a
feature crosses layers or uses an unfamiliar boundary. Use foundation-first ordering when
the architecture is already proven and later slices genuinely depend on shared types or utilities.

## Status

Durable task status is absent/pending, `status="in_progress"`, `status="done"`, or
`status="blocked"`. The state machine lives in `references/plan-lifecycle.md`; build-agent
result mapping lives in `references/subagent-statuses.md`.
