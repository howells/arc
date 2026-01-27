# Plan: `/arc:naming` Skill

## Summary

A new skill that generates project/product name candidates by reading the codebase, then validates them against domain availability (Vercel), popular GitHub repos with the same name, and existing product names (web search).

## Files to Create

### 1. `skills/naming/SKILL.md` — User-facing skill

The lightweight command entry point. Follows the same frontmatter pattern as other skills (see `suggest/SKILL.md` for reference).

**Frontmatter:**
```yaml
name: naming
description: |
  Generate and validate project names. Reads codebase context, produces candidates
  using tech naming strategies, and checks domain + GitHub availability.
  Use when naming a new project, renaming, or validating an existing name.
license: MIT
metadata:
  author: howells
website:
  order: 19
  desc: Project naming
  summary: Generate project name candidates and validate domain + GitHub availability.
```

**Content:** Documents what the skill does, usage examples, and delegates to the naming agent for the heavy lifting.

### 2. `agents/research/naming.md` — Naming specialist agent

The detailed agent with naming strategies, validation logic, and output format. Uses these tools:
- `Read`, `Glob` — Read codebase context
- `Bash` — Run `vercel domains inspect`, `gh search repos`
- `WebSearch` — Check for existing products

**Naming strategies (tech-adapted):**

| # | Strategy | Pattern | Examples |
|---|----------|---------|---------|
| 1 | The Verb | What it *does* | Stripe, Render, Fetch |
| 2 | The Metaphor | Physical → digital | Slack, Buffer, Notion |
| 3 | The Portmanteau | Invented word | Vercel, Figma, Spotify |
| 4 | The Short Word | Real word, new context | Arc, Warp, Deno |
| 5 | The Compound | Two concepts merged | GitHub, Postmark, Tailwind |
| 6 | The Prefix/Suffix | Tech modifier + root | Supabase, Cloudflare, Fastly |
| 7 | The Reference | Myth/culture/science | Apollo, Mercury, Atlas |
| 8 | The Sound | Phonetically punchy | Zed, Bun, Zig |

**Validation steps:**

1. **Domain check** — `vercel domains inspect <name>.com` (and `.dev`, `.app`)
   - Parse output for availability + price
   - Rate: ✅ Available, ⚠️ Premium, ❌ Taken

2. **GitHub check** — `gh search repos <name> --sort stars --limit 5`
   - Look for repos with significant stars (1k+) that share the name
   - ✅ Clear — no popular repos with this name
   - ⚠️ Caution — a repo exists with moderate stars
   - ❌ Conflict — well-known project already uses this name

3. **Product uniqueness** — `WebSearch "<name> app"`, `"<name> software"`
   - ✅ Clear — no existing products
   - ⚠️ Caution — something exists but different domain
   - ❌ Conflict — well-known product with same name

**Output format:**

```markdown
# Name Options for [Project]

## Top Recommendations

### 1. [Name] ✅
**Strategy:** [Which approach]
**Why:** [1-2 sentences on why it fits this project]
**Domains:** name.com ✅ | name.dev ✅ | name.app ⚠️ ($2,400)
**GitHub:** No popular repos found ✅
**Conflicts:** None found

### 2. [Name] ⚠️
...

## All Candidates

| Name | Strategy | .com | .dev | .app | GitHub | Conflicts |
|------|----------|------|------|------|--------|-----------|
| ... | ... | ✅ | ✅ | ❌ | ✅ | None |

## Name Quality Checklist
- Easy to say aloud
- Easy to spell (no ambiguous spelling)
- Works as a domain
- Memorable after one hearing
- Not embarrassing to say in meetings
- Googleable (distinct enough to rank)
- Works internationally (no unfortunate meanings)
```

## Updates to Existing Files

### 3. `CLAUDE.md` — Add to command list

Add `/arc:naming` to the cross-cutting commands section.

### 4. `.claude-plugin/plugin.json` — Bump version

Bump to 1.0.73.

## Workflow Position

Cross-cutting skill, most natural early in a project:

```
/arc:vision  → define what you're building
/arc:naming  → name it
/arc:design  → design the UI (now has a name)
```

## Technical Details

- **`vercel domains inspect`** (not `buy`) — safe, no purchase risk, shows availability + price
- **`gh search repos <name> --sort stars --limit 5`** — checks for popular existing projects with the same name
- **Default TLDs:** `.com`, `.dev`, `.app`
- **Agent model:** sonnet (fast enough, good at creative naming)
