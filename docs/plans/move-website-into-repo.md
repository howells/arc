# Move usearc.dev Website into Arc Repo

## Problem

The Arc marketing site lives in a separate repo (`~/Sites/usearc`). This creates friction:

- Content changes in arc require a separate deploy of usearc
- The website fetches SKILL.md and agent files from GitHub raw URLs with 1-hour revalidation — meaning content is always stale by up to an hour
- Two repos to maintain for one product

Moving the site into the arc repo collapses this into a single source of truth: edit a skill, the website content updates in the same commit.

## Solution

Move the Next.js site into `site/` at the root of the arc repo. Rewrite the content layer to read from the local filesystem instead of GitHub. Exclude commercial fonts (Söhne, Lyon Text, Signifier) from the open-source repo — replace with system/Google fonts or a `.gitignore`d fonts directory.

---

## Inventory: What Moves

### Files from `~/Sites/usearc` → `site/`

```
site/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home page (server component)
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Tailwind v4 + custom CSS
│   │   ├── animated-hero.tsx     # Client: rotating command name
│   │   ├── content-browser.tsx   # Client: commands/agents grid + drawer
│   │   ├── command-list.tsx      # Client: command grid
│   │   ├── agent-list.tsx        # Client: agent grid by category
│   │   ├── unified-drawer.tsx    # Client: vaul drawer for details
│   │   ├── copy-button.tsx       # Client: clipboard copy
│   │   ├── error.tsx             # Error boundary
│   │   ├── global-error.tsx      # Global error boundary
│   │   ├── not-found.tsx         # 404 page
│   │   ├── opengraph-image.tsx   # OG image generation
│   │   ├── robots.ts             # robots.txt
│   │   ├── sitemap.ts            # sitemap.xml
│   │   ├── icon.svg              # Favicon
│   │   └── llms.txt/
│   │       └── route.ts          # /llms.txt API route
│   ├── lib/
│   │   ├── content.ts            # ← REWRITE: local fs reads
│   │   └── fonts.ts              # ← REWRITE: replace Söhne
│   └── fonts/                    # ← GITIGNORED (commercial fonts)
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── biome.json
└── .gitignore                    # site-specific ignores
```

### What does NOT move

| Item | Reason |
|------|--------|
| `src/fonts/Sohne-*.woff2` (16 files) | Commercial font (Klim Type Foundry) — not open-sourceable |
| `src/fonts/LyonText-*.woff2` (6 files) | Commercial font (Commercial Type) — not used in CSS anyway |
| `src/fonts/Signifier-*.woff2` (6 files) | Commercial font (Klim Type Foundry) — not used in CSS anyway |
| `.next/` | Build output |
| `.vercel/` | Deployment config (will be recreated) |
| `.git/` | Separate git history |
| `node_modules/` | Dependencies |
| `pnpm-lock.yaml` | Will regenerate |

---

## Key Changes

### 1. Font Strategy — Replace Söhne with Open-Source Alternative

The current site uses **Söhne** (Klim Type Foundry) as its primary sans-serif. This is a commercial font that can't ship in an open-source repo.

**Approach**: Replace with **Inter** via `next/font/google`.

- Inter is geometrically similar to Söhne — clean, neutral sans-serif
- Widely used in developer tooling sites
- The CSS variable system (`--font-sans`, `--font-sohne`) makes this a single-point change
- IBM Plex Mono (already from Google Fonts) stays as-is

**Changes to `fonts.ts`**:
```ts
// Before: localFont with 16 Söhne woff2 files
export const sohne = localFont({ src: [...] })

// After: Google Fonts
import { Inter, IBM_Plex_Mono } from "next/font/google"
export const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" })
export const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" })
```

**Changes to `globals.css`**:
```css
/* Before */
--font-sans: var(--font-sohne), system-ui, sans-serif;

/* After */
--font-sans: var(--font-inter), system-ui, sans-serif;
```

**Changes to `layout.tsx`**:
```tsx
// Before
<html className={`${sohne.variable} ${ibmPlexMono.variable}`}>

// After
<html className={`${sans.variable} ${mono.variable}`}>
```

**Alternative**: Keep the `src/fonts/` directory but `.gitignore` it, and have `fonts.ts` try local fonts with a Google Fonts fallback. This lets you (Daniel) keep using Söhne locally while the open-source version falls back to Inter. This is more complex but preserves your design intent on production. Your call.

### 2. Content Layer — Local Filesystem Reads

Currently `content.ts` fetches from `https://raw.githubusercontent.com/howells/arc/main/...`. After the move, skills and agents are siblings in the same repo.

**Approach**: Replace `fetch()` calls with `fs.readFileSync()` using `path.resolve()` from `site/` up to root.

```ts
// Before
const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/howells/arc/main";
async function fetchFile(path: string): Promise<string | null> {
  const url = `${GITHUB_RAW_BASE}/${path}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  ...
}

// After
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(process.cwd(), "..");  // site/ → arc/

function readLocalFile(relativePath: string): string | null {
  const fullPath = resolve(ROOT, relativePath);
  if (!existsSync(fullPath)) return null;
  return readFileSync(fullPath, "utf-8");
}
```

**Benefits**:
- Zero network calls during build
- Content is always exactly in sync (same commit)
- Works offline
- Faster builds (no fetch latency, no revalidation)

**The `getVersion()` function** also switches from fetch to local read of `../.claude-plugin/plugin.json`.

### 3. Monorepo Structure

The arc repo becomes a lightweight monorepo:

```
arc/
├── skills/          # Plugin skills (existing)
├── agents/          # Plugin agents (existing)
├── commands/        # Command routers (existing)
├── rules/           # Coding rules (existing)
├── references/      # Domain knowledge (existing)
├── disciplines/     # Methodologies (existing)
├── templates/       # Legal templates (existing)
├── tests/           # Plugin tests (existing)
├── scripts/         # Plugin scripts (existing)
├── assets/          # Logo/social images (existing)
├── site/            # ← NEW: Next.js marketing site
│   ├── src/
│   ├── package.json
│   ├── next.config.ts
│   └── ...
├── .claude-plugin/  # Plugin metadata (existing)
├── package.json     # Root (existing — husky)
├── CLAUDE.md
├── README.md
└── LICENSE
```

This is **not** a pnpm workspace monorepo (no `pnpm-workspace.yaml`). The root `package.json` stays as-is (just husky). The `site/` directory is a standalone Next.js app with its own `package.json` and `node_modules/`.

### 4. Root `.gitignore` Updates

Add site-specific ignores to the root `.gitignore`:

```gitignore
# Existing
.DS_Store
*.log
.arc/
node_modules/

# Site
site/.next/
site/node_modules/
site/.vercel/
site/src/fonts/       # Commercial fonts — not open-source
site/.env
site/.env.local
site/.env.*.local
site/*.tsbuildinfo
```

### 5. Path Alias Update

The site uses `@/*` → `./src/*` in tsconfig. This stays the same since tsconfig lives inside `site/`.

The content layer's `ROOT` resolution needs to point up one directory:

```ts
// Inside site/src/lib/content.ts
const ROOT = resolve(process.cwd(), "..");
// process.cwd() = /path/to/arc/site
// ROOT = /path/to/arc
```

### 6. Dev Workflow

```bash
# From arc repo root:
cd site && pnpm dev    # Starts dev server on port 7001

# Or add a convenience script to root package.json:
# "dev:site": "cd site && pnpm dev"
```

---

## Implementation Tasks

### Task 1: Create `site/` directory and copy files
- Copy all source files from `~/Sites/usearc/src/` → `site/src/`
- Copy config files: `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `biome.json`
- **Do NOT copy**: `src/fonts/` (commercial fonts), `.next/`, `.vercel/`, `node_modules/`, `pnpm-lock.yaml`, `.git/`

### Task 2: Rewrite `fonts.ts` — replace Söhne with Inter
- Replace `localFont()` Söhne import with `Inter` from `next/font/google`
- Keep `IBM_Plex_Mono` as-is
- Update CSS variable name from `--font-sohne` to `--font-inter` (or keep `--font-sans` direct)
- Update `layout.tsx` class names
- Update `globals.css` `--font-sans` variable

### Task 3: Rewrite `content.ts` — local filesystem reads
- Replace `fetch()` with `fs.readFileSync()`
- Resolve paths relative to repo root (one directory up from `site/`)
- Remove `REVALIDATE_SECONDS` (no longer needed)
- Keep the same exported interfaces (`Command`, `Agent`)
- Keep the same YAML parsing logic (gray-matter + custom extraction)
- Update skill and agent name lists if they've changed since the site was last updated

### Task 4: Update `.gitignore`
- Add `site/.next/`, `site/node_modules/`, `site/.vercel/`, `site/src/fonts/`, etc.
- Keep existing ignores

### Task 5: Create `site/.gitignore`
- `.next/`, `node_modules/`, `.vercel/`, `src/fonts/`, `.env*`, `*.tsbuildinfo`

### Task 6: Install dependencies and verify build
- `cd site && pnpm install`
- `pnpm build` — verify the site builds with local content
- `pnpm dev` — verify dev server works

### Task 7: Verify content sync
- Check that all skills with `website:` frontmatter sections appear on the site
- Check that all agents with `website:` frontmatter sections appear
- Verify the version number reads correctly from `../.claude-plugin/plugin.json`

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Font change affects visual fidelity | Inter is geometrically similar; or use the `.gitignore` approach to keep Söhne locally |
| `process.cwd()` may differ in Vercel builds | Use `__dirname` or `path.resolve(import.meta.dirname, "../..")` as fallback |
| Skill/agent lists in content.ts may be stale | Auto-discover from filesystem (`fs.readdirSync`) instead of hardcoded arrays |
| Root package.json conflicts | Site has its own package.json; no workspace needed |

---

## Decisions (Confirmed)

1. **Fonts**: Replace Söhne with Inter from Google Fonts. Clean swap, no fallback complexity.
2. **Auto-discovery**: `content.ts` will auto-discover skills and agents from the filesystem. No hardcoded lists to maintain — if a skill/agent has a `website:` frontmatter section, it appears on the site.
3. **Vercel**: Re-link existing Vercel project with root directory set to `site/`.
