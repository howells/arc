# Audit Signals

Cheap mechanical passes run in Phase 1 of `/arc:audit`, before any reviewer is dispatched. Each
scan is paired with how to read it and which manifest to store.

**These are signals, not findings.** Reviewers must inspect the code and report only
evidence-backed issues with file/line references. A scan hit is a lead to check, never a verdict.

Run only the scans that apply to the detected project type.

**Collect React audit signal manifest (React/Next.js/React Native projects only):**

This pass gives reviewers concrete hotspots for React Doctor-style rule families without running React Doctor.

```bash
# High-signal React/Next/TanStack/security/frontend patterns. Scope to source-like files.
rg -n --glob '*.{ts,tsx,js,jsx}' \
  "useEffect\\(|dangerouslySetInnerHTML|\\beval\\(|new Function\\(|setTimeout\\(|setInterval\\(|useSearchParams\\(|new QueryClient\\(|useQuery\\(|useMutation\\(|<Image\\b|<img\\b|transition-all|outline-none|will-change|z-\\[?9999|localStorage|sessionStorage" \
  ${scope:-.} 2>/dev/null | head -120

# Suspicious client/server boundary spread.
rg -n --glob '*.{ts,tsx,js,jsx}' "^[\"']use client[\"'];?$" ${scope:-.} 2>/dev/null | head -80

# Legacy/deprecated React surface.
rg -n --glob '*.{ts,tsx,js,jsx}' \
  'React\.Children\.|cloneElement\(|forwardRef\(|defaultProps\b|class\s+\w+\s+extends\s+(React\.)?(Component|PureComponent)|ReactDOM\.render|findDOMNode' \
  ${scope:-.} 2>/dev/null | head -80
```

Store a **React audit signal manifest** with:

- State/effect hotspots: `useEffect`, effect-driven data fetching, effect cleanup candidates
- Boundary hotspots: `"use client"` files, async client components, suspicious client wrappers
- Data-client hotspots: TanStack Query/tRPC hooks, unstable `QueryClient`, mutations/invalidation
- Security hotspots: `dangerouslySetInnerHTML`, eval-like calls, client storage, secret-shaped identifiers in client-reachable files
- Frontend/performance hotspots: `next/image`, raw `<img>`, transition/will-change/z-index/focus classes, heavy client imports
- Legacy React hotspots: deprecated React/ReactDOM APIs and fragile child traversal

**Run dependency vulnerability scan (critical/high only):**

```bash
# Node.js projects
npm audit --json 2>/dev/null | jq '[.vulnerabilities | to_entries[] | select(.value.severity == "critical" or .value.severity == "high")] | length'

# Python projects
pip-audit --format json 2>/dev/null | jq '[.[] | select(.vulns[].fix_versions)] | length'

# Or use: pnpm audit --json, yarn audit --json
```

Only surface **critical** and **high** severity vulnerabilities. Ignore moderate/low — they create noise without actionable urgency.

**Run dead code detection (JS/TS projects only):**

```bash
npx -y knip --no-progress --reporter compact 2>/dev/null | head -40
```

`npx -y` downloads and executes third-party code. Use it without asking only when knip is already
a project dependency or is configured in the repo; otherwise offer it in one question first, and
skip without comment if declined or offline. Record `Dead code: skipped (not installed)` in the
detection summary. This matches the consent rule the react-doctor scanner follows — the two
should not disagree.

If knip is already a project dependency, use `npx knip` instead. Knip detects:

- Unused files (not imported anywhere)
- Unused exports (exported but never imported)
- Unused types (exported types never referenced)
- Unused dependencies (in package.json but not imported)
- Duplicate exports (same thing exported multiple ways)

Include dead code count in the detection summary. Pass findings to relevant reviewers:

- `architecture-engineer` — unused files, exports indicating poor module boundaries
- `senior-engineer` — general dead code cleanup

If knip finds >20 unused exports, flag as a separate task cluster rather than distributing across reviewers.

**Run structural hotspot scan (JS/TS/TSX/JSX projects):**

This is a cheap mechanical pass to surface "probably worth interrogating" files before reviewer agents start. The goal is not to auto-convict large files, but to give reviewers a map of where complexity is likely hiding.

```bash
# Long files (exclude node_modules, build output, vendored/generated folders)
find ${scope:-.} -type f \
  \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  | grep -vE 'node_modules|\\.git|dist|build|coverage|\\.next|generated' \
  | xargs wc -l \
  | sort -nr \
  | head -20

# Suspicious client-boundary escape hatches
find ${scope:-.} -type f \
  \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  | grep -E '(^|/)[^/]*(-client|-wrapper|-content|-shell|-ui)\\.(tsx?|jsx?)$'

# Check which suspicious files are explicit client components
grep -rl --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' \
  '^["'\"'\"']use client["'\"'\"'];\\?$' ${scope:-.} 2>/dev/null
```

Interpretation guidance — the file-size ladder. These bands say how hard to look, not what to
conclude. Size correlates with mixed responsibility; it does not establish it. Open the file and
judge whether it has one coherent responsibility, then report what you found — a 2000-line file
with one job is fine, and a 300-line file doing four things is not.

Bands are non-overlapping; the upper bound of each is exclusive, matching the scorecard's
`600–1000 LOC band` and `> 1000 LOC` criteria.

| Band | How hard to look |
| ---- | ---------------- |
| ≤ 300 LOC | Normal. No attention needed on size alone. |
| 301–600 LOC | Hotspot. Confirm one coherent responsibility. |
| 601–1000 LOC | Presumptive god file. Read it; expect to justify keeping it whole. |
| 1001–2000 LOC | Severe. Near-certain god file — say so unless the code refutes it. |
| over 2000 LOC | Strongest signal available. Default finding is "split this"; argue the exception in the writeup if the file earns it. |

Standing exemptions at every band: generated, vendored, data-only, or a structure the codebase
demonstrably needs.

Counting note: this ladder uses **raw `wc -l`** (blank lines included) on purpose — a giant file is
giant regardless of what's on each line, so the audit is intentionally stricter than a line-count
rule that skips blank and comment lines. When `wc -l` and `scripts/codebase-map.py` disagree at a
band edge, `wc -l` is authoritative for the ladder.

- `*-client.*` and `*-wrapper.*` are explicit red flags. They often mean "I needed a client boundary, so I wrapped the real component instead of pushing interactivity down."
- `*-content.*`, `*-shell.*`, and `*-ui.*` are weaker signals, but worth interrogating when they are also long or marked `"use client"`.
- When a file is both **long** and suspiciously named, elevate it as a probable god-component / server-client-boundary smell.

Store a **structural hotspot manifest** with:

- Long files over 600 LOC
- Severe long files over 1000 LOC
- Files over 2000 LOC (strongest signal)
- Suspicious boundary files matching `*-client`, `*-wrapper`, `*-content`, `*-shell`, `*-ui`
- Overlap set: suspiciously named files that are also long
- `"use client"` overlap: suspiciously named files that also opt into a client boundary

**Assess page & component shape (Next.js / React projects):**

The point of this pass is to confirm you can see the **shape of a page** and the **shape of a component** from the code — its composition tree — rather than one opaque god component that swallows the whole route. Client components should be composed as _leaves into_ pages, not hoisted into a single massive client boundary at the top.

The anti-pattern: a `page.tsx` (or `layout.tsx`) hits the "Server Components can't use hooks/state" wall and, instead of pushing interactivity _down_ to leaf client components, dumps the entire route into one giant `"use client"` component — `MassivePageClient`, `GeneralLayoutShell`, `PageContent`, etc. — leaving the page a one-line pass-through that fetches and composes nothing on the server. This is not about banning client components; it is about whether the page's shape is composed and legible, or hidden inside one god client.

```bash
# Next.js pages/layouts that are a one-line pass-through to a single imported component
rg -n -U --glob 'app/**/{page,layout}.tsx' \
  'export default (async )?function \w+\([^)]*\)\s*\{\s*return\s*<[A-Z]\w+\s*/?>;?\s*\}' \
  ${scope:-.} 2>/dev/null

# Generically-named would-be god clients (then resolve, confirm "use client", and wc -l)
find ${scope:-.} -type f \( -name '*.tsx' -o -name '*.jsx' \) \
  | grep -viE 'node_modules' \
  | grep -iE '(page-?client|layout-?shell|page-?content|.*-client|.*-shell)\.(tsx|jsx)$'
```

For each thin page/layout, resolve the single returned component, confirm it is a `"use client"` module, then judge by composition **and** the file-size ladder above:

| Situation                                                                                     | Verdict                                                                                      |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Page composes several components / fetches server-side; client parts are leaves               | Healthy — shape is visible                                                                   |
| Thin page → single client component, small                                                    | Low — note it; often a legitimately interactive route                                        |
| Thin page → single client component **600+ LOC**                                              | **High** — route interactivity hoisted to one boundary instead of composed down              |
| Thin page → single client component **1000+ LOC**, and/or named `*Client`/`*Shell`/`*Content` | **Must-Fix** — god page-client; the server boundary was pushed to the top to dodge RSC rules |

Store these as **page-shape findings** in the structural hotspot manifest. Map to `architecture-engineer` and `lee-nextjs-engineer`. The remedy is always the same: move `"use client"` down to the smallest interactive leaves and let the page fetch and compose on the server.

**Run code-policy scan (JS/TS projects):**

These structural rules surface as findings, framed by **intent**, not raw counts:

- **Useless barrels** — re-export-only `index.{ts,tsx}` files that add an indirection layer without being a real public API surface. A package's single public entrypoint barrel is fine; a barrel per folder that just re-exports its siblings is the smell.
- **No env typing strategy** — direct `process.env` reads scattered across app code with no typed env contract (Envy or equivalent). The finding is the _missing strategy_, not each read; if a typed env module exists and reads go through it, this is clean.
- **Too many runtime dynamic imports** — `import()` beyond a couple of legitimate lazy-load sites. A smell when pervasive, not zero-tolerance.
- **Generic component suffixes** — `Wrapper`/`Container`/`Manager`/`Component` component names that hide responsibility (the `*Client`/`*Shell` cases are handled by the page-shape pass above).
- **Function-level limits** — surface functions over ~120 lines, over ~45 statements, or cyclomatic complexity over ~15.

```bash
# Candidate useless barrels: index files that are ONLY re-exports (then confirm they aren't a real public entrypoint)
for f in $(rg -l --glob '**/index.{ts,tsx,js,jsx}' '.' ${scope:-.} 2>/dev/null); do
  total=$(grep -cve '^\s*$' "$f"); reexp=$(grep -cE '^\s*export (\*|\{[^}]*\}) from' "$f")
  [ "$total" -gt 0 ] && [ "$reexp" -eq "$total" ] && echo "$f"
done

# process.env reads outside an env schema/typed env module
rg -n --glob '*.{ts,tsx,js,jsx}' 'process\.env' ${scope:-.} 2>/dev/null \
  | grep -vE 'env/schema|env\.ts|\.d\.ts' | head -40

# runtime dynamic imports
rg -n --glob '*.{ts,tsx,js,jsx}' 'import\(' ${scope:-.} 2>/dev/null | head -40
```

Store a **code-policy manifest**: useless barrels, env-typing-strategy status, dynamic-import count, generic-suffix components, function-limit violations. Map to `architecture-engineer` and `senior-engineer`. These feed the Code Quality cap rule (pervasive → cap at 2); isolated cases are reported without a cap.

**Run fail-fast determinism scan (JS/TS projects):**

Hidden fallback behavior makes a codebase non-deterministic and hard to reason about. This pass surfaces fallbacks that should instead be an explicit contract, a validation error, or a deletion.

```bash
rg -n --glob '*.{ts,tsx,js,jsx}' \
  'process\.env\.\w+\s*(\|\||\?\?)|catch\s*\([^)]*\)\s*\{\s*\}|//\s*(legacy|deprecated|backwards.?compat|fallback)' \
  ${scope:-.} 2>/dev/null | head -60
```

Classify each candidate: `remove` (dead compat, legacy aliases, fallback branches with no live caller), `require` (missing config/input — make it a validation error or required input), `validate` (boundary input that must reject invalid states clearly), `keep` (documented product behavior, real external API compatibility, or an owned migration with a removal date). Store a **determinism manifest**: env-default fallbacks, empty/swallowing catch blocks, legacy/compat aliases, optional-dependency silent degradation. Map to `senior-engineer` and `daniel-product-engineer`; feeds Resilience and Code Quality. Report remaining fallbacks explicitly — do not leave them invisible.

**Collect complexity hotspot signals (source projects only):**

This is a cheap first pass for performance reviewers. These are **signals, not findings**. Reviewers must inspect surrounding code and report only evidence-backed issues.

```bash
# Repeated scans, nested iteration, sorting in loops, and data access inside loops.
rg -n --glob '*.{ts,tsx,js,jsx,py,go,rb,php,java,cs,cpp,c,swift}' \
  "forEach\\(|\\.map\\(|\\.filter\\(|\\.reduce\\(|\\.some\\(|\\.every\\(|\\.find\\(|\\.findIndex\\(|\\.includes\\(|\\.indexOf\\(|\\.sort\\(|sorted\\(|findMany\\(|findUnique\\(|query\\(|execute\\(|fetch\\(|axios\\." \
  ${scope:-.} 2>/dev/null | head -160
```

Store a **complexity signal manifest** with:

- Repeated membership/search calls inside loop-like code
- Nested lookup or pairwise comparison candidates
- Sorting or grouping work that may repeat
- Query/fetch/request calls near loops
- Expensive render-path derivations in React/Next.js components
- Shared utilities where complexity improvement would compound across callers

**Build read-only codebase map (when Arc full runtime is available):**

Run the Arc-owned mapper to orient reviewers around project shape, routes, services, data layer, import hotspots, and circular dependencies:

```bash
python3 scripts/codebase-map.py ${scope:-.} --format markdown
```

If it succeeds, store the output as the **codebase map manifest**. If it fails or the script is unavailable in a prompt-only install, record `Codebase map: unavailable` and continue with the existing detection passes.

Treat the map as orientation, not evidence by itself. Reviewers must still inspect files before reporting findings.

