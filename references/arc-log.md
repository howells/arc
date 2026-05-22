# Arc Activity Log

Skills append to `.arc/log.md` on completion to maintain a running history of what Arc has done.

## Log Location

`.arc/log.md` in the project root (gitignored)

## Entry Format

```markdown
## YYYY-MM-DD HH:MM
/arc:[skill] — [Brief description of what was done]
Files: [comma-separated list of key files]

---
```

## Append Mechanism

After completing the skill's main work:

1. **Ensure .arc/ exists and is gitignored:**
```bash
mkdir -p .arc
if ! grep -q "^\.arc/$" .gitignore 2>/dev/null; then
  echo ".arc/" >> .gitignore
fi
```

2. **Prepend the new entry** (newest first):
```bash
# Create entry
cat > /tmp/arc-log-entry.md << 'EOF'
## YYYY-MM-DD HH:MM
/arc:[skill] — [description]
Files: [files]

---

EOF

# Prepend to log
if [ -f .arc/log.md ]; then
  cat .arc/log.md >> /tmp/arc-log-entry.md
fi
mv /tmp/arc-log-entry.md .arc/log.md
```

## Reading the Log

Skills that benefit from context should read recent entries:

```bash
head -50 .arc/log.md 2>/dev/null
```

Look for:
- Recent work on related features
- Decisions that affect current work
- Patterns in what's been done

## What Gets Logged

| Skill | What to Log |
|-------|-------------|
| `/arc:ideate` | Feature designed, approach chosen |
| `/arc:detail` | Plan created, task count |
| `/arc:implement` | Tasks completed, remaining |
| `/arc:test` | Test results, coverage |
| `/arc:review` | Plan reviewed, changes |
| `/arc:audit` | Issue counts by severity |
| `/arc:design` | UI designed, aesthetic direction |
| `/arc:launch` | Public URL status |
| `/arc:document` | Solution documented |
| `/arc:commit` | What was committed |
| `/arc:vision` | Vision created/updated |
| `/arc:figma` | Components implemented |
| `/arc:seo` | SEO audit results |
| `/arc:deps` | Dependency audit results |

## What Doesn't Get Logged

- `/arc:go` (routing only)
- `/arc:suggest` (read-only)
- `/arc:tidy` (utility)

/arc:commit — 2 commits (`feat(web): clarify backend completion dashboard`, `feat(scrape): harden winners graph ingestion`)
/arc:commit — 1 commit (`docs: structure Agent Surface documentation`)
/arc:commit — 1 commit (`docs(strategy): refresh material docs inventory`)
/arc:commit — 5 commits (`feat(ai): add provider model constants`, `chore(web): document exported surfaces`, `docs(packages): document exported APIs`, `chore(docs): remove completed plans`, `docs(audit): add AI package audit`)
/arc:commit — 11 commits (Workflow Lab, single-source capability registry, sqlite cleanup, and hook fixes)
/arc:commit — 5 commits (routerbase-ai 0.1.5 publish, MaterialVision image matching API, Materia routerbase standardization)
/arc:commit — 1 commit (`docs(guides): expand agent reference coverage`)
/arc:commit — 0 commits created, pushed 2 existing commits (`MG-1 ship schema registry v0.3`, `MG-11 make Linear the planning source of truth`)
/arc:commit — 1 commit (`feat(materialvision): host analysis images with UploadThing`)
/arc:commit — 1 commit (`fix(materialvision): use Flash 3 for vision jobs`)
/arc:commit — 1 commit (`fix: enforce project isolation`)
/arc:commit — 2 commits (`feat(imports): configure R2 asset storage`, `docs: reconcile asset storage model`)
/arc:commit — 1 commit (`chore(materialvision): publish scoped package`)
/arc:commit — 1 commit (`chore(materialvision): ignore pnpm lockfile`)
/arc:commit — 1 commit (`docs: record architecture decisions`)
/arc:commit — 1 commit (`feat(evaluation): add depth policy`)
/arc:seo — Architizer SEO audit completed: sitemap coverage is the launch blocker; canonical/social metadata, Search Console verification, detail-page metadata, and structured data coverage need a focused SEO infrastructure pass.
/arc:commit — 1 commit (`docs(surface): refresh skill workflow`)
/arc:commit — 1 commit (`feat(home): add agentic primitives section`)
/arc:commit — 1 commit (`feat: add provider-aware generation matrix`)
/arc:commit — 2 commits (`feat: add ai cli`, `chore: normalize cli bin paths`)
/arc:commit — 2 commits (`refactor(ai): standardize material vision integrations`, `chore(agents): add surface skill bundle`)
/arc:commit — 5 commits (`fix(cli): harden api input and discovery`, `fix(web): normalize category routes`, `fix(web): render og images from R2`, `chore(web): tune sentry runtime config`, `chore(agents): migrate to howells ai`)
/arc:commit — 2 commits (`chore: ignore generated browser artifacts`, `fix(cli): integrate howells cli errors`)
/arc:commit — 1 commit (`chore: remove duplicate workspace scripts`)
/arc:commit — 1 commit (`refactor(colors): centralize search policy`)
/arc:commit — 1 commit (`fix(colors): limit embedding backfill to main images`)
/arc:commit — 1 commit (`feat(mtag): add demo microfrontend shell`)
/arc:commit — 1 commit (`fix(web): refine AI crawler robots policy`)
/arc:commit — 2 commits (`feat(sidebar): align project navigation`, `fix(landing): stabilize circling element hydration`)
/arc:commit — 5 commits (`feat(api): add rpc gateway route`, `feat(nav): add mobile navigation overlay`, `feat(studio): add Vercel host app`, `chore(deps): use scoped private packages`, `chore(api): update generated route types`)
/arc:commit — 1 commit (`feat(enrichment): add agentic firm enrichment`)
/arc:commit — 4 commits (Colorscope core package rename, server-only naming catalogues, docs cleanup, and Materia client-safe colour search)
/arc:commit — 1 commit (`feat(ops): wire ingestion control surface`)
/arc:commit — 2 commits (`feat(runtime): add brand catalog ingest workflow`, `feat(ops): expose agentic control surface`)
/arc:commit — 5 commits (MaterialVision classification, Materia API canonicalization, search/colour planning, agent capability catalogue, and vision adapter)
