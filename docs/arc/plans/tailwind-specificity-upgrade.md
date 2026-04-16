# Plan: Arc Consolidation + Specificity Upgrade

Two problems, one plan.

**Problem 1 — Overlapping skills:** `build` and `implement` do the same thing at different scales. `verify`, `harden`, and `audit` all check quality through different lenses. Users (including the creator) don't reach for some of these. The decision overhead ("is this a build or an implement?") hurts more than it helps.

**Problem 2 — Specificity gap:** Arc's interface rules are principles ("use clear hierarchy"). LLMs also need prescriptions ("use `px-3 py-2` not `px-4 py-2`", "one primary button per page"). Without class-level rules, implementations fall back to generic defaults.

## What Changes

### Skill Consolidation (3 skills removed, 0 capabilities lost)

| Removed | Absorbed Into | How |
|---------|---------------|-----|
| `/arc:build` | `/arc:implement` | Implement detects scope — lightweight inline planning for small work, full plan+TDD for large |
| `/arc:verify` | `/arc:audit` | Audit gains a `quick` mode (build+types+lint+tests) and `pre-commit`/`pre-pr` modes |
| `/arc:harden` | `/arc:audit` | Harden's 7 dimensions become audit checklist items — reviewers check for resilience issues |

Design also gains a "polish" mode for code cleanup after implementation (new capability, not a removal).

### New Rules Files (4 new, 3 updated)

| File | Purpose |
|------|---------|
| `rules/interface/tailwind-authoring.md` | NEW — Class-level Tailwind style guide |
| `rules/interface/buttons.md` | NEW — Button sizing, hierarchy, focus, touch targets |
| `rules/interface/surfaces.md` | NEW — Surface hierarchy, cards vs dividers vs whitespace |
| `rules/interface/sections.md` | NEW — Page section composition and cross-section consistency |
| `rules/interface/typography.md` | UPDATE — Add prescriptive Tailwind rules |
| `rules/interface/colors.md` | UPDATE — Add default-avoidance rules |
| `rules/interface/index.md` | UPDATE — Add new files to index |

### Design Skill Improvements

- Style definition briefs for exploration mode
- Component-level fast-path (skip ceremony for small scope)
- Progress updates during long sessions
- Polish mode for code cleanup

### Command Table After

```
go, help, vision, brand, ideate, design, review, implement, ai,
testing, letsgo, naming, responsive, seo, audit, commit,
suggest, document, tidy, rules, deps, hooks, prune-agents
```

23 user-facing commands (down from 26). More importantly: zero "which one do I use?" decisions.

---

## Track A: Skill Consolidation

### Task A.1: Implement absorbs Build

**What build does that implement doesn't:** Lightweight inline planning (no separate plan document, no `/arc:detail`, no worktree). Scope check that suggests ideate if too large.

**What implement does that build doesn't:** Full plan creation via detail skill, worktree setup, phase-heavy orchestration, plan completion verification, expert review, PR creation.

**The merge:** Implement gains scope detection at the start. The user's intent doesn't change — they say "implement this" and the skill decides how much ceremony is appropriate.

**Changes to `skills/implement/SKILL.md`:**

1. Add a **Phase 0.5: Scope Detection** before the current Phase 0 (planning):

```markdown
## Phase 0: Scope Detection

Assess what's being asked:

| Signal | Small Scope | Large Scope |
|--------|-------------|-------------|
| Files affected | 1-5 | 6+ |
| New patterns | No | Yes |
| Design decisions | Minimal | Significant |
| Spec/design doc exists | Maybe | Should |

**If small scope:**
- Skip worktree (work on current branch or create a simple feature branch)
- Create inline build plan (same format as current build skill Phase 2)
- Share plan, confirm, execute with same per-task loop
- Skip plan-completion-reviewer (unnecessary for <4 tasks)
- Skip expert review phase (offer it, but don't push)

**If large scope:**
- Check for existing plan/spec, create via detail skill if missing
- Recommend review before building
- Full worktree + TDD + quality gates + plan completion verification
```

2. Merge build's scope check table ("When to use Build vs Ideate") into implement as a general scope guide

3. Absorb build's lighter `<required_reading>` — implement already loads these contextually, just ensure the conditional loading covers the same files

4. Keep implement's full process for large scope but allow the lighter path for small scope — same agents, same TDD, same quality gates, less planning overhead

**Changes to `skills/build/`:** Delete the directory. Remove from `commands/`, `CLAUDE.md`, plugin.json if referenced.

**Changes to `skills/design/SKILL.md`:** Update the "When to Use" section — remove references to `/arc:build`, point to `/arc:implement`.

**Key constraint:** The per-task loop (test → build → TDD → fix → spec → quality → commit) stays identical for both paths. Quality gates are not reduced, only planning ceremony.

---

### Task A.2: Audit absorbs Verify

**What verify does:** Sequential mechanical checks — build, typecheck, lint, tests, debug log audit, git status, secrets scan. Modes: quick, full, pre-commit, pre-pr. No agents. No subjectivity.

**What audit does:** Comprehensive reviewer-based analysis — security, performance, architecture, design, data. Spawns specialist agents. Generates reports with severity ratings.

**The merge:** Audit gains verify's mechanical checks as a first phase, and verify's modes as flags.

**Changes to `skills/audit/SKILL.md`:**

1. Add verify's modes to argument parsing:

```markdown
| Argument | Mode | What Runs |
|----------|------|-----------|
| `quick` | Quick | Build + typecheck + lint (no agents) |
| `pre-commit` | Pre-commit | Build + types + lint + debug logs (no agents) |
| `pre-pr` | Pre-PR | Full mechanical checks + secrets scan (no agents) |
| (none) | Full | Mechanical checks THEN reviewer agents |
| `--security` etc. | Focused | Mechanical checks THEN specific reviewer(s) |
```

2. Insert verify's Phase 2 (Run Checks) as a new **Phase 1.5: Mechanical Checks** — runs BEFORE reviewer agents, so reviewers don't waste time on things tsc would catch:

```markdown
## Phase 1.5: Mechanical Checks

Run sequential verification. Stop on critical failures.

### Tooling Detection
[verify's Step 0 — detect package manager, linter, test framework, etc.]

### Checks (in order)
1. Build — STOP if fails
2. Type check — report errors, continue
3. Lint — auto-fix first, report remaining
4. Tests — report pass/fail (skip in quick/pre-commit modes)
5. Debug log audit — scan for console.log/debug/dir/table (skip in quick mode)
6. Git status — report uncommitted changes
7. Secrets scan — pre-pr mode only

### Summary Table
[verify's Step 3 format]

**If mode is `quick`, `pre-commit`, or `pre-pr`:** Report summary and STOP. No reviewer agents.
**If mode is full or focused:** Continue to Phase 2 (Select Reviewers).
```

3. Absorb harden's dimensions into audit's reviewer prompts and/or a new `--harden` focus flag:

```markdown
| `--harden` | Harden | Resilience audit: text overflow, empty states, loading, errors, i18n, edge cases, validation (no agents, interactive) |
```

When `--harden` is set (or when doing a full audit of UI-heavy code), run harden's Phase 2 checklist either:
- As part of the `designer` and `daniel-product-engineer` reviewer prompts (they already check for missing states), OR
- As a standalone interactive pass after reviewer agents complete

**My recommendation:** Harden's 7 dimensions should be split:
- **Dimensions that reviewers can check** (empty states, loading states, error states, touch targets) → add to `designer` and `daniel-product-engineer` reviewer prompts as mandatory checklist items
- **Dimensions that need interactive decisions** (which overflow strategy for which element, i18n readiness, specific edge cases) → keep as a `--harden` flag that runs the interactive audit after mechanical checks, using harden's current Phase 2-3 format

This way a full audit naturally catches resilience issues, and `--harden` gives the focused interactive experience when you specifically want to harden a component.

**Critical: `--harden` must preserve harden's interactive flow.** When `--harden` is set:
- Do NOT use audit's `context: fork` / agent-spawning flow
- Do NOT spawn reviewer agents
- Run harden's Phase 2 checklist directly (user-interactive, not delegated)
- Use AskUserQuestion for each fix (apply / skip / apply all), exactly as harden does now
- This is a completely separate code path from the reviewer-based audit — it just lives in the same skill

**Preserve existing audit focus flags.** The current audit already supports `--docs`, `--copy`, `--hygiene`, `--organization`, `--accessibility`. These must remain in the argument table alongside the new verify-derived modes (`quick`, `pre-commit`, `pre-pr`) and `--harden`.

**Changes to `skills/verify/`:** Delete the directory. Remove from `commands/`, `CLAUDE.md`.
**Changes to `skills/harden/`:** Delete the directory. Remove from `commands/`, `CLAUDE.md`.

**Key constraint:** The `quick` and `pre-commit` modes must be fast — no agent spawning, no detection ceremony beyond tooling. Just run the commands.

---

### Task A.3: Design gains Polish mode

**What polish does:** Component extraction, deduplication, form control consolidation, margin externalization, class merging, Tailwind class cleanup via `canonicalize`, existing component reuse.

**Why it belongs in design:** Design is the visual lifecycle skill — direction → wireframe → spec → (implement) → polish. Cleaning up the code after UI implementation is the natural final step of the design workflow.

**Changes to `skills/design/SKILL.md`:**

1. Add a **Phase 0.5: Mode Detection** before Phase 0:

```markdown
## Mode Detection

Detect which mode this invocation needs:

**Design mode (default):** User asks to "design", "create a layout", "wireframe", "establish visual direction"
→ Proceed through all design phases (current flow)

**Polish mode:** User asks to "clean up", "componentize", "organize", "extract components", "reduce duplication", "polish"
→ Skip to Polish workflow below
```

2. Add **Polish workflow** as a separate section after Phase 8:

```markdown
## Polish Workflow

Tighten up UI code after implementation. Not visual changes — code structure and craft.

### P.1: Scan Current State

Read all files in scope. Identify:
- Large components (>200 lines) that should be broken up
- Repeated patterns across files (same card shell, same heading group, same button style)
- Form controls that should be consolidated (multiple input components → one `Input`)
- Components that bake in margins (should use `className` prop at call site)
- Existing project components that aren't being reused

### P.2: Extract Components

- Break large page components into focused, reusable pieces
- Extract repeated patterns into shared components
- Consolidate form controls: one `Input` for all input types, one `Select`, one `Textarea`
- Every component accepts `className` prop, merges with `clsx` or equivalent
- Components never bake in margins — margins applied at call site

### P.3: Deduplicate

- Repeated section wrappers → shared `Section` component
- Repeated heading groups (eyebrow + heading + subheading) → shared `HeadingGroup`
- Repeated card shells → shared `Card`
- Repeated button styles → use existing button variants or create new ones
- Search project for existing components before creating ANY new one

### P.4: Clean Classes

**First, verify `canonicalize` is available:**
\`\`\`bash
npx @tailwindcss/cli canonicalize --help 2>/dev/null
\`\`\`

If available, run Tailwind class canonicalization:
\`\`\`bash
npx @tailwindcss/cli canonicalize "class-string"
\`\`\`

- Collapses shorthands (`mt-2 mr-2 mb-2 ml-2` → `m-2`)
- Resolves overrides (`py-3 p-1 px-3` → `p-3`)
- Canonicalizes arbitrary values to named utilities
- Sorts classes

If `canonicalize` is not available (older Tailwind version), apply these optimizations manually using the rules from `rules/interface/tailwind-authoring.md`.

### P.5: Verify

- No broken imports
- No duplicate component names
- All tests still pass
- Lint clean
```

3. Update the skill description to mention polish mode
4. Update the Interop section to mention polish

---

### Task A.4: Update supporting files

1. **`CLAUDE.md`** — Update command table:
   - Remove build, verify, harden
   - Update implement description ("Plan + execute, scope-aware")
   - Update audit description ("Codebase audit + verification, all modes")
   - Update design description ("Visual direction + code polish")

2. **`skills/go/SKILL.md`** — Update routing logic to remove references to build, verify, harden

3. **`skills/help/SKILL.md`** — Update command list

4. **`commands/`** — Remove command files for build, verify, harden (`commands/build.md`, `commands/verify.md`, `commands/harden.md`)

5. **`.claude-plugin/plugin.json`** — Remove references if present

6. **`skills/letsgo/SKILL.md`** — Update any references to verify/harden (point to audit)

7. **`skills/suggest/SKILL.md`** — Update any references to removed skills

8. **`skills/using-arc/SKILL.md`** — Update workflow routing table. Currently says `Small scoped change -> build`; change to `Small scoped change -> implement`

9. **`README.md`** — Remove `/arc:build` from command overview, command table, and interop section. Update `/arc:verify` and `/arc:harden` references to point to audit modes.

10. **Tests:**
    - `tests/test-skill-loading.sh` — Remove `"build"`, `"verify"`, `"harden"` from `EXPECTED_SKILLS` array
    - `tests/test-context-fork.sh` — Remove `"build"` from `NON_FORKED_SKILLS`

11. **Site copy** — `site/src/app/page.tsx` contains visible `/arc:build` references. Update to reflect consolidated command set.

---

## Track B: Specificity Rules

### Task B.1: Create `rules/interface/tailwind-authoring.md`

Class-level Tailwind style guide. Not migration (that's `references/tailwind-v4.md`), but authoring discipline.

**Contents:**

**Markup hygiene:**
- `text-*`, `leading-*` only on block elements — never `<span>`, `<a>`, `<strong>`, `<em>`
- No redundant display classes (`block` on `<div>`, `inline` on `<span>`)
- No conflicting classes for the same property without a distinguishing variant
- `role="list"` on `<ul>`/`<ol>` unless `list-style-*` is applied
- `antialiased` on root element
- `isolate` on main app container

**Class preferences:**
- `gap-*` on parent, never `mt-*`/`mb-*` between flex/grid children
- `size-{n}` over `h-{n} w-{n}` when both match
- Shorthand over split: `p-8` not `px-8 py-8`; split only when a variant overrides one axis
- Bare values over arbitrary: `z-999` not `z-[999]`
- Bare opacity modifiers: `bg-neutral-950/2` not `bg-neutral-950/[0.02]`
- `rem` for arbitrary font sizes: `text-[0.8125rem]` not `text-[13px]`
- Theme variable refs for arbitrary radii: `var(--radius-xl)` not `16px`
- `not-*` variants over base+override
- `data-closed:…` over `data-[closed]:…`
- `min-h-dvh`/`svh`/`lvh`, never `min-h-screen`
- `bg-linear-*`, never `bg-gradient-*`
- `shrink-*` not `flex-shrink-*`, `grow-*` not `flex-grow-*`
- Whole-number grid ratios: `grid-cols-[21fr_19fr]` not `grid-cols-[1.05fr_0.95fr]`
- No named line-heights (`tight`, `snug`) — use spacing scale (`leading-6`, `text-sm/5`)
- `tabular-nums` on elements with changing numbers

**CSS variable patterns:**
- `--spacing()` function, never `calc(var(--spacing)*…)` or `theme(spacing.…)`
- CSS variables for color in arbitrary values, never `theme()`
- Arbitrary property syntax for static CSS variables, not inline styles
- Dynamic values: CSS variable + class reference (`class="w-(--progress)" style="--progress: 72%"`)

**Custom utilities:**
- `@utility` over plain class selectors
- `@utility my-utility-*` with `--value()` / `--modifier()` for parameterized utilities
- `@variant` inside `@utility` for existing variants
- `@custom-variant` for genuinely new variants
- Never nest `@utility` inside `@media` or `@supports`

**Import order:**
- Remote `@import` URLs at the top, before `@import "tailwindcss"`

---

### Task B.2: Create `rules/interface/buttons.md`

(Content as specified in the original plan — sizing, hierarchy, focus, touch targets, shadows.)

### Task B.3: Create `rules/interface/surfaces.md`

(Content as specified — hierarchy ladder, when not to use cards, divider treatment, breakpoint reconfiguration.)

### Task B.4: Create `rules/interface/sections.md`

(Content as specified — two-element pattern, cross-section consistency, alignment rules.)

### Task B.5: Update agents to load new rules (CRITICAL)

The new rules are useless if the agents that write UI code don't load them. Update the rules loading tables in:

**Build agents:**
- `agents/build/ui-builder.md` — Add to rules table:
  - `tailwind-authoring.md` → Any component (always load)
  - `buttons.md` → Components with buttons/CTAs
  - `surfaces.md` → Components with cards, panels, dividers
  - `sections.md` → Page layouts, landing pages
- `agents/build/design-specifier.md` — Add `tailwind-authoring.md`, `buttons.md`, `surfaces.md` to its rules list

**Review agents:**
- `agents/review/designer.md` — Add new rules to its interface rules table
- `agents/review/daniel-product-engineer.md` — Add `tailwind-authoring.md`, `buttons.md`, `surfaces.md`

**Skills:**
- `skills/implement/SKILL.md` — Add new rules to its `<rules_context>` table under "Building components/pages"
- `skills/build/SKILL.md` — N/A (being deleted, implement inherits)

### Task B.6: Update `rules/interface/typography.md`
(was B.5)

Add:
- NEVER `text-xs` for body text — minimum `text-sm` at `sm:`, `text-base` on mobile
- NEVER `font-bold` for headings — use `font-semibold` or `font-medium`
- NEVER `leading-*` modifiers on headings — use Tailwind's default
- MUST `text-balance` on headings, `text-pretty` on paragraph text
- MUST `tracking-tight` on headings larger than `text-xl` (unless condensed font)
- NEVER `uppercase` on eyebrow text unless monospace; monospace + uppercase needs `tracking-wide`
- SHOULD constrain text width with `max-w-[*ch]` directly on the element

### Task B.7: Update `rules/interface/colors.md`

Add:
- NEVER default to indigo as brand/accent — only if project uses it or user requests
- NEVER default to `gray-*` or `slate-*` for neutrals — prefer `zinc-*` or `neutral-*`

### Task B.8: Update `rules/interface/index.md`

Add new files to the table:
- `tailwind-authoring.md` — Tailwind class-level style guide
- `buttons.md` — Button sizing, hierarchy, focus patterns
- `surfaces.md` — Surface hierarchy, cards, dividers
- `sections.md` — Page section composition and consistency

---

## Track C: Design Skill Improvements

### Task C.1: Style definition briefs for exploration mode

In `skills/design/SKILL.md`, update exploration mode (Phase 2, Question 0) to require structured briefs per direction.

Each direction needs a written style definition covering:
- Layout, typography character, color direction, spacing strategy
- Surface treatment, shape language, personality

With good/bad examples showing vague vs specific.

### Task C.2: Component-level fast-path

Add scope detection to design skill. If designing a single component (not a full page/product):
- Load only the 2-3 relevant rules files for the component type (buttons.md for buttons, surfaces.md for cards, etc.) — **skip the full Phase 0 mandatory reading**
- Skip visual reconnaissance
- Skip research phase
- Compress gather-direction to 1-2 questions
- Proceed through wireframe → spec → critique → handoff as normal

**Note:** This means the Phase 0 "MUST read" list applies to full design mode only. The fast-path explicitly overrides it by loading targeted rules instead. Update the Phase 0 language to say "In full design mode, read ALL of these" rather than unconditional "MUST read."

### Task C.3: Progress updates

Add guidance: "During longer design sessions, post a one-line status before each major phase."

### Task C.4: Update required reading

Add new rules files to Phase 0:
- `rules/interface/tailwind-authoring.md`
- `rules/interface/buttons.md`
- `rules/interface/surfaces.md`
- `rules/interface/sections.md`

---

## Execution Order

```
Track B (rules)          — Foundation. Everything else references these.
  ↓
Track A.1 (implement)    — Absorb build into implement.
Track A.2 (audit)        — Absorb verify + harden into audit.
Track A.3 (design)       — Add polish mode.
  ↓
Track A.4 (cleanup)      — Remove deleted skills, update ALL references.
  ↓
Track C (design improvements) — References new rules and consolidated structure.
```

Tracks A.1, A.2, and A.3 are independent and can run in parallel.
Track B should complete first since the new rules are referenced by A.3 and C.

**Critical sequencing:** Within each A.* task, modify the absorbing skill FIRST, then delete the absorbed skill's directory and command file in the SAME task (not deferred to A.4). A.4 handles the supporting files that reference deleted skills (using-arc, go, help, README, tests, site). This prevents a window where the skill directory is deleted but the absorbing skill hasn't been updated yet.

## Risk: What Could Go Wrong

**Implement scope detection guesses wrong.** User asks to "implement this tiny thing" but it touches 12 files. Mitigation: scope detection recommends, doesn't decide. Always shows the plan and asks for confirmation. The existing "if scope grows, suggest ideate" pattern from build carries forward.

**Audit quick mode is too slow.** If audit loads all its detection machinery just to run `tsc`, quick mode loses its purpose. Mitigation: quick/pre-commit/pre-pr modes skip ALL of audit's Phase 1 (detection, hotspots, knip) and jump straight to mechanical checks. No agents, no detection, just run the commands.

**Harden dimensions get lost in audit.** Spreading 7 hardening dimensions across reviewer prompts might mean none of them own it. Mitigation: keep `--harden` as a focused interactive mode that runs harden's exact current checklist. Full audits add harden items to reviewer prompts as supplementary checks, not primary responsibility.

**Polish mode in design is confusing.** "Design" implies visual work; polish is code structure. Mitigation: mode detection is explicit — if the user says "clean up" or "componentize", they get polish mode, not design phases. The skill announces which mode it's in.

**`canonicalize` may not exist in all Tailwind versions.** The polish workflow references `npx @tailwindcss/cli canonicalize` which may not be available. Mitigation: verify availability before use, fall back to manual optimization using tailwind-authoring.md rules.

## Review History

Plan reviewed by Codex (GPT-5.4) on 2026-04-15. Findings addressed:
- Fixed: skill count (3 removed, not 4 — polish never existed)
- Fixed: command count math (23, not 20)
- Fixed: `audit quick` mode inconsistency (now includes lint)
- Fixed: fast-path vs required-reading contradiction (fast-path overrides Phase 0)
- Added: Task B.5 — agents must load new rules (was the biggest gap)
- Added: Task A.4 items 8-11 — using-arc routing, README, tests, site copy
- Added: `--harden` interactive flow preservation (explicit separate code path)
- Added: existing audit flags preservation (`--docs`, `--copy`, `--hygiene`, etc.)
- Added: canonicalize availability check
- Added: execution order sequencing fix (delete in same task as absorb, not deferred)
