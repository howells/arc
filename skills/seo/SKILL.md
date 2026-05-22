---
name: seo
description: |
  Deep SEO audit for web projects. Analyzes codebase for crawlability, indexability, on-page SEO,
  structured data, social previews, and technical foundations. Optionally runs Lighthouse and
  PageSpeed against a live URL. Reports findings with severity, offers direct fixes or /arc:detail plans.
  Use when asked to "audit SEO", "check SEO", "review SEO", or "is my site SEO-ready".
license: MIT
metadata:
  author: howells
website:
  order: 12
  desc: Deep SEO audit
  summary: Comprehensive SEO audit covering crawlability, meta tags, structured data, social previews, and optional live site analysis with Lighthouse and PageSpeed.
  what: |
    SEO audits your marketing pages across six categories: crawlability (robots.txt, sitemaps, noindex), indexability (canonicals, duplicates, hreflang), on-page (titles, descriptions, headings, alt text, URLs), structured data (JSON-LD, schema types), social previews (OG tags, Twitter Cards), and technical foundations (lang, viewport, charset). It distinguishes marketing pages from app pages—you tell it which is which. Optionally runs Lighthouse and PageSpeed against a live URL, with results folded into the report. Findings are severity-graded, and you can fix quick wins directly or generate an /arc:detail plan for larger efforts.
  why: |
    Your app works perfectly but Google can't find it. Your blog post is shared on Twitter with a broken preview. Your pricing page has the same meta description as your homepage. SEO problems are invisible until someone searches for you—this audit catches them before that.
  decisions:
    - You classify pages. The skill detects routes and asks which are marketing vs app. No fragile auto-detection.
    - Live checks are optional but blocking. If you provide a URL and opt in, Lighthouse/PageSpeed results go in the report. You wait, but you get a complete picture.
    - Fix scale determines next step. 1-3 files, fix now. 4-10, your choice. 10+, generate a plan.
  agents:
    - seo-engineer
  workflow:
    position: utility
---

<arc_runtime>
This workflow requires the full Arc bundle, not a prompts-only install.

Paths in this skill use these conventions:
- `agents/...`, `references/...`, `disciplines/...`, `templates/...`, `scripts/...`, `rules/...`, `skills/<name>/...` are Arc-owned files at the plugin root. Resolve the plugin root from this skill's filesystem location — it's the directory containing `agents/` and `skills/`.
- `./...` is local to this skill's directory.
- `.ruler/...`, `docs/...`, `src/...`, or any project-relative path refers to the user's project repository.
</arc_runtime>

<tasklist_context>
**Use TaskList tool** to check for existing tasks related to this work.

If a related task exists, note its ID and mark it `in_progress` with TaskUpdate when starting.
</tasklist_context>

<rules_context>
**Read SEO rules NOW:**

**Use Read tool:** `rules/seo.md`

This defines page classification (marketing vs app), all required vitals, and configuration requirements. The skill goes deeper than these rules, but they are the shared baseline.
</rules_context>

<progress_context>
**Use Read tool:** `docs/arc/progress.md` (first 50 lines)

Check for recent changes that might affect SEO (new pages, redesigns, migrations).
</progress_context>

# SEO Audit Workflow

Deep SEO audit for web projects. Analyzes codebase for technical SEO compliance, content optimization, and social sharing readiness. Optionally validates against a live site.

## Process

### Phase 1: Detect & Classify

#### Step 1: Detect Framework

**Use Glob + Grep to detect project type:**

| Check | Tool | Pattern |
|-------|------|---------|
| Next.js | Grep | `"next"` in `package.json` |
| Remix | Grep | `"@remix-run"` in `package.json` |
| Astro | Grep | `"astro"` in `package.json` |
| SvelteKit | Grep | `"@sveltejs/kit"` in `package.json` |
| Nuxt | Grep | `"nuxt"` in `package.json` |
| Static HTML | Glob | `*.html` in root or `public/` |

Record framework — this determines where to look for routes, meta tags, and config.

#### Step 2: Find All Routes/Pages

**Framework-specific route discovery:**

| Framework | Glob Pattern | Route Pattern |
|-----------|-------------|---------------|
| Next.js (App Router) | `app/**/page.{tsx,jsx,ts,js}` | Directory = route |
| Next.js (Pages Router) | `pages/**/*.{tsx,jsx,ts,js}` | File = route |
| Remix | `app/routes/**/*.{tsx,jsx,ts,js}` | File = route |
| Astro | `src/pages/**/*.{astro,md,mdx}` | File = route |
| SvelteKit | `src/routes/**/+page.svelte` | Directory = route |
| Static HTML | `**/*.html` | File = route |

Present discovered routes to user.

#### Step 3: Classify Pages

**Ask the user to classify pages:**

Present the route list and ask which are app-only (authenticated/gated). Use the AskUserQuestion interaction pattern with concise multi-option choices.

Default: treat all as marketing unless user marks as app-only.

Example:
```
"I found these routes. Which are app pages (authenticated/gated)?
Marketing pages get full SEO audit. App pages get basics only (title, noindex)."

Routes:
- / (homepage)
- /about
- /pricing
- /blog
- /blog/[slug]
- /dashboard
- /settings
- /api/*
```

API routes are automatically excluded from SEO checks.

#### Step 4: Check Existing SEO Config

**Scan for what's already in place:**

| Check | Where to Look |
|-------|--------------|
| robots.txt | `public/robots.txt`, `app/robots.ts` (Next.js) |
| sitemap | `public/sitemap.xml`, `app/sitemap.ts` (Next.js) |
| Meta setup | Root layout, page-level metadata exports |
| Structured data | JSON-LD in layouts or pages |
| OG images | `app/opengraph-image.*`, static OG images in public/ |
| Favicons | `app/icon.*`, `app/favicon.ico`, `public/favicon.ico` |
| Google Search Console | `<meta name="google-site-verification">` in root layout, `public/google*.html` verification file |

Report what exists:
```markdown
## Existing SEO Config
- ✓ robots.txt present
- ✓ Meta titles in root layout
- ✗ sitemap.xml missing
- ✗ No structured data found
- ✗ OG images not configured
- ✗ Google Search Console not verified
```

#### Step 5: Ask for Live URL

"Do you have a live URL (dev or production) for this site? If so, I can run Lighthouse and PageSpeed for additional analysis. This is optional."

If provided, store for Phase 2.

### Phase 2: Audit

Run checks against the codebase, organized by category. Marketing pages get full treatment. App pages get basics only.

#### Category 1: Crawlability

- **robots.txt** — Present? Any marketing paths blocked? Sitemap referenced?
- **Meta robots** — Any marketing pages with `noindex`? Common pitfall: Vercel preview noindex leaking to production.
- **Sitemap** — Present? Lists all marketing pages? Doesn't list app pages? Dynamically generated or static?
- **Redirect chains** — Any 301 → 301 → page chains? (Check middleware, vercel.json, next.config redirects)
- **Google Search Console** — Site verification detected? (meta tag `google-site-verification` or `public/google*.html` file). If not verified, flag as **High** — without Search Console, Google won't notify you of indexing issues, manual actions, or crawl errors.

#### Category 2: Indexability

- **Canonical tags** — Present on every marketing page? Absolute URLs? Self-referencing where appropriate?
- **Duplicate content** — Same title or description on multiple pages? Multiple URLs serving identical content?
- **Hreflang** — If i18n detected (next-intl, i18next, locale folders): hreflang tags present? Return links correct?

#### Category 3: On-Page

- **Titles** — Present? Unique per page? Under 60 chars? Not generic ("Home", "Page", "Untitled")? Descriptive of page content?
- **Meta descriptions** — Present? Unique per page? Under 160 chars? Not boilerplate? Includes call-to-action where appropriate?
- **Heading hierarchy** — Single h1 per page? Logical nesting (h1 → h2 → h3)? No skipped levels? h1 content meaningful?
- **Image alt text** — All meaningful images have descriptive alt? Decorative images use alt=""? No generic alt ("image", "photo")?
- **URL structure** — Clean, readable URLs? No UUIDs? No excessive nesting? No query params for content pages?

#### Category 4: Structured Data

- **Presence** — JSON-LD blocks present on key page types?
- **Schema types** — Appropriate for content?
  - Homepage: Organization or WebSite
  - Blog posts: Article or BlogPosting
  - Product pages: Product
  - FAQ pages: FAQPage
  - About: Organization or Person
- **Coverage gaps** — Some page types have structured data but others don't?
- **Validity** — Required properties present for each schema type?

#### Category 5: Social & Meta

- **Open Graph** — og:title, og:description, og:image set on all marketing pages?
- **OG image** — 1200x630 dimensions? Exists and loads?
- **Twitter Cards** — twitter:card type set (summary or summary_large_image)? twitter:title, twitter:description, twitter:image present?
- **Consistency** — OG title/description match or complement the page title/description?

#### Category 6: Technical Foundations

- **Language** — `<html lang="...">` set to correct language code?
- **Viewport** — `<meta name="viewport" content="width=device-width, initial-scale=1">` present?
- **Charset** — `<meta charset="utf-8">` or equivalent declared?
- **HTTPS** — Site enforces HTTPS? No mixed content?

#### Live Site Checks (Optional)

If user provided a live URL and wants live checks:

"Running Lighthouse and PageSpeed on `[URL]`. This may take a moment."

**Run programmatic tools (blocking — results go into the report):**

```bash
# Lighthouse SEO audit
npx lighthouse [URL] --output=json --only-categories=seo --chrome-flags="--headless=new" 2>/dev/null

# Lighthouse Performance (Core Web Vitals)
npx lighthouse [URL] --output=json --only-categories=performance --chrome-flags="--headless=new" 2>/dev/null
```

**PageSpeed Insights API (no key needed for light usage):**
```
GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=[URL]&category=seo&strategy=mobile
GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=[URL]&category=seo&strategy=desktop
```

**If user wants full-site crawl:**
```bash
npx unlighthouse --site [URL] --reporter jsonExpanded
```

**Failure handling:** If any check fails (timeout, auth wall, network error), note in the report: "Could not access [URL] — [reason]. Skipping live check." Continue with codebase-only findings.

**Extract from Lighthouse JSON:**
- SEO score (0-100)
- Specific audit failures (missing meta descriptions, missing alt text, etc.)
- Core Web Vitals (LCP, CLS, INP)

**Extract from PageSpeed API:**
- Mobile and desktop SEO scores
- Opportunities for improvement

### Phase 3: Report & Act

#### Step 1: Generate Report

**Create:** `docs/audits/YYYY-MM-DD-seo-audit.md`

```markdown
# SEO Audit Report

**Date:** YYYY-MM-DD
**Framework:** [detected framework]
**Marketing pages:** [count]
**App pages:** [count] (basics only)
**Live URL:** [URL or "not provided"]
**Live checks:** [run / not run]

## Summary

[1-2 paragraph overview of findings]

- **Critical:** X issues
- **High:** X issues
- **Medium:** X issues

## Critical Issues

> Indexing is broken or severely impaired

### [Issue Title]
**File:** `path/to/file.ts:123`
**Category:** [Crawlability / Indexability / On-page / etc.]
**Issue:** [What's wrong]
**Impact:** [How this affects SEO]
**Fix:** [Specific change needed]

## High Priority

> Core SEO elements missing

[Same format per finding]

## Medium Priority

> Suboptimal but not broken

[Same format per finding]

## Live Site Results

> From Lighthouse and PageSpeed (if run)

**Lighthouse SEO Score:** [X/100]
**Core Web Vitals:**
- LCP: [value] — [good/needs improvement/poor]
- CLS: [value] — [good/needs improvement/poor]
- INP: [value] — [good/needs improvement/poor]

**PageSpeed:**
- Mobile SEO: [X/100]
- Desktop SEO: [X/100]

[Specific audit failures from Lighthouse]

## Google Search Console

**Status:** [Verified / Not verified]

If not verified, submit your site now:
→ **Add your site:** [https://search.google.com/search-console/welcome](https://search.google.com/search-console/welcome)

After verification, submit your sitemap:
→ **Submit sitemap:** `https://search.google.com/search-console/sitemaps?resource_id=https://[DOMAIN]/`

Without Search Console, Google won't alert you to indexing problems, crawl errors, or manual actions. This is not optional for any site that needs organic traffic.

## Manual Validation Tools

Check these tools for additional validation:
- [Google Rich Results Test](https://search.google.com/test/rich-results?url=[URL])
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/?q=[URL])
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

## Framework-Specific Recommendations

[Tailored to detected framework — Next.js Metadata API, Astro SEO patterns, etc.]
```

#### Step 2: Determine Fix Approach

Count the number of files affected by findings.

**Fix heuristic:**
- **1-3 files affected:** Offer to fix directly. "I found [N] issues across [N] files. I can fix these now. Should I?"
- **4-10 files affected:** Give the user a choice. "There are [N] issues across [N] files. Want me to fix them now, or create an implementation plan with `/arc:detail`?"
- **10+ files affected:** Recommend a plan. "There are [N] issues across [N] files. This needs a structured approach. Want me to create an implementation plan with `/arc:detail`?"

**Use the AskUserQuestion interaction pattern** to present the appropriate options based on file count.

#### Step 3: Framework-Specific Advice

Tailor recommendations to the detected framework:

**Next.js (App Router):**
- Use Metadata API (`export const metadata` or `generateMetadata`)
- Use `opengraph-image.tsx` for dynamic OG images
- Use `robots.ts` for programmatic robots.txt
- Use `sitemap.ts` for dynamic sitemap generation
- Use `icon.tsx` for dynamic favicons

**Next.js (Pages Router):**
- Use `next/head` for meta tags
- Use `next-seo` package or custom SEO component
- Static sitemap generation with `next-sitemap`

**Remix:**
- Use `meta` function exports per route
- Handle OG images in resource routes

**Astro:**
- Use `<head>` in layout components
- SEO component pattern for reusable meta
- Built-in sitemap integration (`@astrojs/sitemap`)

**Other:**
- Standard HTML meta tag patterns
- Suggest popular SEO packages if applicable

#### Step 4: Commit Report

```bash
mkdir -p docs/audits
git add docs/audits/YYYY-MM-DD-seo-audit.md
git commit -m "docs: add SEO audit report"
```

#### Step 5: Present Summary & Next Steps

```
## SEO Audit Complete

**Scope:** [N] marketing pages, [N] app pages
**Live checks:** [Yes — score X/100 / No]
**Report:** docs/audits/YYYY-MM-DD-seo-audit.md

### Findings
- Critical: X | High: X | Medium: X
- Files affected: X

### [Fix option based on heuristic]
```

<success_criteria>
SEO audit is complete when:
- [ ] Framework detected
- [ ] Routes discovered and classified (marketing vs app)
- [ ] Existing SEO config checked
- [ ] All 6 categories audited against marketing pages
- [ ] App pages checked for basics (title, noindex)
- [ ] Live site checks run (if opted in) and results in report
- [ ] Report generated in docs/audits/
- [ ] Report committed
- [ ] Fix approach offered (direct fix, plan, or done)
- [ ] Framework-specific recommendations included
- [ ] Manual validation tool links included (with pre-filled URLs if live URL provided)
- [ ] Google Search Console verification checked; if missing, user given direct link to submit
- [ ] Progress journal updated
</success_criteria>

## Interop

- Reads **rules/seo.md** for baseline vitals
- References **/arc:detail** for creating implementation plans (10+ file fixes)
- Can be invoked after **/arc:launch** for deeper analysis
- SEO agent (**seo-engineer**) handles the lighter audit in `/arc:audit`

<arc_log>
**After completing this skill, append to the activity log.**
See: `references/arc-log.md`

Entry: `/arc:seo — [scope] audit ([N] issues)`
</arc_log>
