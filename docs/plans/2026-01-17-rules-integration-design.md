# Rules Integration Design

## Problem Statement

Arc orchestrates development workflows but doesn't enforce coding standards during implementation. A comprehensive ruleset (React 19, Next.js 16, Tailwind v4, Vitest 4, Playwright 1.57) exists separately and must be manually copied to each project.

**Goals:**
1. Move rules into Arc under source control
2. Create `/arc:rules` skill to apply rules to projects
3. Update core implementation skills to reference relevant rules

## Approach

### 1. Rules Directory Structure

```
arc/
├── rules/
│   ├── code-style.md
│   ├── env.md
│   ├── git.md
│   ├── integrations.md
│   ├── nextjs.md
│   ├── react.md
│   ├── tailwind.md
│   ├── testing.md
│   ├── turborepo.md
│   ├── typescript.md
│   ├── versions.md
│   └── interface/
│       ├── index.md
│       ├── animation.md
│       ├── content-accessibility.md
│       ├── design.md
│       ├── forms.md
│       ├── interactions.md
│       ├── layout.md
│       ├── performance.md
│       └── typography.md
```

### 2. `/arc:rules` Skill

**Purpose:** Apply Arc's coding rules to the current project.

**Simplified Flow:**

```
Check .ruler/ exists?
    │
    ├─ No → Copy all rules, offer ruler apply, done
    │
    └─ Yes → "Update .ruler/ with Arc's latest rules? (y/n)"
              │
              ├─ y → Backup to .ruler.backup-TIMESTAMP/, overwrite, offer ruler apply
              └─ n → Exit (user can manually merge)
```

**Ruler is optional:**
```
Rules copied to .ruler/

Want me to run `npx ruler apply` to distribute to other AI agents? (y/n)
```

If ruler not installed:
```
Ruler not found. Rules are in .ruler/ — install ruler with `npm i -g ruler` if you want to distribute to other agents.
```

### 3. Stack Detection

Before reading rules, detect project stack:

| Check | Rule files to include |
|-------|----------------------|
| `next.config.*` exists | nextjs.md |
| `react` in dependencies | react.md |
| `tailwindcss` in dependencies | tailwind.md |
| `vitest` or `jest` in dependencies | testing.md |
| `turbo.json` exists | turborepo.md |
| Any TypeScript files | typescript.md |

**Always include:** code-style.md, git.md, env.md

**Skip rules that don't apply** — don't dump React rules on a Vue project.

### 4. Skills Integration (Phase 1)

Start with 3 core skills only. Expand later if valuable.

| Skill | Rules (stack-dependent) |
|-------|------------------------|
| `/arc:implement` | Detected stack rules + code-style.md |
| `/arc:build` | Detected stack rules + code-style.md |
| `/arc:test` | testing.md |

**Reading pattern:**

Skills read from `.ruler/` in the project. If `.ruler/` doesn't exist:
```
No coding rules found in this project.
Run /arc:rules to set up standards, or continue without rules.
```

This keeps rules optional — Arc works without them.

### 5. Phase 2 (Later)

If Phase 1 proves valuable, expand to:
- `/arc:design` — interface/*.md
- `/arc:figma` — interface/*.md
- `/arc:commit` — git.md
- `/arc:deslop` — code-style.md
- `/arc:letsgo` — all relevant rules
- `/arc:detail` — testing.md, typescript.md

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Ruler is optional | Don't fail if ruler isn't installed — just copy files |
| Backup before overwrite | Never lose user customizations silently |
| Detect stack | Only reference rules relevant to the project |
| Binary merge choice | Per-file review is overengineered — users can `git diff` |
| Phase 1 = 3 skills | Prove the pattern works before expanding |
| Rules are optional | Skills work without `.ruler/` for non-standard stacks |

## Implementation Tasks

1. Copy rules from `~/Obsi/Areas/Build/rules/` into `arc/rules/`
2. Create `skills/rules/SKILL.md`
3. Update plugin.json to register the new skill
4. Add rules reading to `/arc:implement`, `/arc:build`, `/arc:test`
5. Test on fresh project
6. Test on project with existing `.ruler/`
