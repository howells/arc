---
name: release
description: |
  Versioned releases of npm packages: semver bumps, changelogs, and multi-package
  releases for single-package repos and pnpm workspaces with changesets.
  Use when asked to "cut a release", "bump the version", "release the packages",
  "publish a new version", "run changesets", or "ship a versioned package".
license: MIT
argument-hint: "[dry-run]"
metadata:
  author: howells
website:
  order: 12
  desc: Versioned package releases
  summary: Cut versioned npm releases with reasoned semver bumps, changelogs, migration notes, and tarball verification before publishing.
  what: |
    Release detects what changed since the last tag, proposes a semver bump per package with reasoning, then authors the release — changeset files, version bumps, CHANGELOG entries, and a migration note for any breaking change. Before publishing it builds and packs each package, installs the tarball into a throwaway project, and smoke-tests the real published shape: entry points import, "use client" directives survive bundling, runtime/animation libs are peerDependencies, the exports map resolves, and the files array does not drop needed dist. Confirming the bumps authorizes the release commit and its push; publishing and tagging are each gated behind their own explicit choice.
  why: |
    Publishing is where invisible mistakes ship: a dropped "use client" directive, a runtime lib bundled as a dependency, an exports map that resolves for import but not require, a files array that ships no dist. Version numbers also carry a promise — a breaking change published as a minor breaks installs silently. Release turns publishing from a hopeful `npm publish` into a verified, reasoned step.
  decisions:
    - Semver is proposed with reasoning per package, confirmed in one question.
    - Every breaking change gets a migration note before it can publish.
    - Each package is packed and installed into a temp project before publishing.
    - Confirming the bumps authorizes the release commit and its push; publishing and tagging are separately offered, never silent.
    - Commit publishes an already-committed version; release owns version bumps and changelogs.
  workflow:
    position: utility
---

<arc_runtime>
Requires the full Arc bundle. Arc-owned paths (`agents/`, `references/`, `disciplines/`, `templates/`, `scripts/`, `rules/`, `skills/`) resolve from the plugin root — the directory containing `agents/` and `skills/`. Everything else is the user's repository.
</arc_runtime>

<platform_context>
Adapt the workflow to the current harness instead of assuming Claude-specific tool names.

- Use platform-native structured questions when available; otherwise ask one concise plain-text question at a time.
- Use the repo's detected package manager (`pnpm`, `npm`, `yarn`, `bun`) consistently for every command below. Commands are written with a `<pm>` placeholder — substitute the detected manager.
- Detect `<pm>` in this order: the `packageManager` field in `package.json`, then a lockfile (`pnpm-lock.yaml` → pnpm, `package-lock.json` → npm, `yarn.lock` → yarn, `bun.lockb` → bun), then default to `npm`.
- The changesets workspace-root install flag `-w` applies only under pnpm; drop it for npm, yarn, and bun.
- Publishing itself uses `npm publish` regardless of the install-time package manager. Changeset-driven publishes run through the detected manager (`<pm> changeset publish`).

</platform_context>

# Release Workflow

Cut a versioned release of one or more npm packages. `/arc:commit` publishes a package whose version is already committed and not yet on the registry. `/arc:release` owns bumping versions, changelogs, and coordinated multi-package releases.

The canonical order across both skills is **commit → push → publish → tag**. `/arc:commit` states the governing invariant — never publish before pushing the commit containing the package version — and this skill follows it.

Usage:

- `/arc:release` - Detect, propose bumps, author, verify, commit and push, then gate publish.
- `/arc:release dry-run` - Run everything up to and including `npm pack` verification, but never commit, publish, tag, or push.

$ARGUMENTS will be empty or "dry-run". Treat "dry-run" as a hard stop before any `publish`.

Resolve the run mode first: the `dry-run` argument, or any unattended gate fallback, sets mode = dry-run for the remainder of the run. In dry-run mode Steps 3 and 5 are skipped entirely, and Step 6 reports instead of publishing. Once set, the mode never clears — carry it to the report.

## Boundary

- Never bump a version, publish, tag, or push without an explicit user choice at a gate — the Step 2 gate authorizes the release commit and its push; publish and tag stay separately gated.
- If no user response is available (an unattended or non-interactive run), fall back to `dry-run` mode: continue read-only, report what would be bumped and published, and mutate nothing. The gate stays absolute for attended runs.
- Never publish a `private` package or a version already on the registry.
- Never use `--force`, `--no-verify`, or delete published versions.
- Do not invent changelog entries. Base them on actual commits and diffs.

## Step 1: Detect Release State

Establish what is being released before proposing anything.

```bash
git remote || echo "(no remote)"
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null)
if [ -n "$LAST_TAG" ]; then
  echo "last tag: $LAST_TAG"
  git log "$LAST_TAG"..HEAD --oneline
else
  echo "(no tags)"
  git log --oneline
fi
```

Never write the tag lookup as a bare `$(git describe ...)..HEAD` range: when there is no tag the range collapses to `..HEAD`, which exits 0 with no output, so a `||` fallback never fires and an unreleased repo reports zero commits. Branch on `$LAST_TAG` explicitly, as above.

Surface the remote result — Step 5 cannot push without one.

Determine the repo shape:

- **Single package**: one `package.json` at root, no workspace config.
- **Workspace/monorepo**: `pnpm-workspace.yaml`, or `workspaces` in root `package.json`.

For workspace repos, check for changesets:

```bash
test -f .changeset/config.json && echo "changesets present" || echo "no changesets"
```

- If changesets are present, read pending intents and status:
  ```bash
  LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null)
  if [ -n "$LAST_TAG" ]; then <pm> changeset status --since="$LAST_TAG"; else <pm> changeset status; fi
  ```
- If changesets are **absent** in a workspace repo, offer to scaffold on first run (`<pm> add -Dw @changesets/cli && <pm> changeset init`, dropping `-w` outside pnpm) via one question before continuing. Do not scaffold silently. If no user response is available, skip scaffolding, continue without changesets, and note the skipped offer in the report.

Identify which publishable packages changed since their last release. Prefer `changeset status`; fall back to diffing since the last tag filtered by each package's directory. With no tag there is no baseline to diff against — every tracked file is in scope:

```bash
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null)
if [ -n "$LAST_TAG" ]; then git diff --name-only "$LAST_TAG"..HEAD; else git ls-files; fi
```

Never substitute `HEAD~20` for a missing tag: it is a fatal error in any repo with fewer than 21 commits, which is exactly the young untagged repo the fallback is meant to cover.

A package is a release candidate only if its `package.json` has a `name`, a `version`, is not `"private": true`, **and** declares at least one entry point (`exports`, `main`, or `module`) or a `files` array. A package with none of those is an application, not a library — stop and ask before treating it as publishable; if no user response is available, report it and stop. Ignore generated dirs (`node_modules`, `dist`, `build`, `.next`, `.turbo`, coverage).

## Step 2: Propose Semver With Reasoning

For each changed package, inspect the diff and classify the change, then propose a bump with a one-line reason:

- **major** — removed or renamed an export, changed a signature, dropped a runtime, changed default behavior.
- **minor** — added a new export, prop, or option; backwards-compatible surface growth.
- **patch** — bug fix, internal change, docs, types-only fix with no surface change.

No tags and nothing on the registry → this is the first release. Propose publishing the current version as-is unless the change set argues for a bump, and note that pre-1.0 versions carry no compatibility promise under semver.

Confirm all packages in **one** structured question. List each package with its proposed bump; let the user override any of them.

```
AskUserQuestion:
  question: "Proposed version bumps. Confirming authorizes me to author, commit, and push the release — publishing and tagging are asked separately."
  header: "Bumps"
  options:
    - label: "Accept all"
      description: "e.g. @scope/ui minor (new prop), @scope/core patch (internal fix)"
    - label: "Override"
      description: "Tell me which package should be major / minor / patch instead"
    - label: "Stop"
      description: "Cancel the release"
```

A structured question returns only the chosen label, so "Override" carries no package or level. If the user selects Override, follow up with one question per package to collect its bump level before authoring anything.

If no user response is available, set mode = dry-run and continue: report the proposed bumps, skip Step 3 (no changesets, no version bumps, no `CHANGELOG.md` edits), and run Step 4's verification read-only against the current, pre-bump versions. Say so in the report.

## Step 3: Author The Release

Skip this step entirely in dry-run mode — it writes to the tree.

Once bumps are confirmed:

- **Changesets repo**: write a changeset file per package under `.changeset/` with the confirmed bump and a human summary, then run:
  ```bash
  <pm> changeset version
  ```
  This applies bumps and regenerates each `CHANGELOG.md`.
- **Single package**: bump the `version` field manually to the confirmed level and prepend a dated entry to `CHANGELOG.md` (create it if absent), grouping changes as Added / Changed / Fixed / Breaking.

If the repo ships a version-bump script (often paired with a manifest such as `.version-bump.json`; look in package.json `scripts` and a `scripts/` directory), run that script rather than editing `version` fields directly — hand-editing one file desynchronizes the rest.

For **any** breaking change, write a short migration note — how to upgrade, before/after, and what to search-and-replace. Append it to `MIGRATIONS.md` at the package root (create if absent), keyed by the new version. Keep it to the minimum a consumer needs to update.

## Step 4: Pre-Publish Verification

This step catches the failures a plain `npm publish` ships silently. Run it for every publishing package. Use the platform temp/scratch directory for the throwaway project.

For each package:

1. **Build**: run the package's `build` script if present. A real compile error stops the release. A `command not found` or a missing `node_modules` is an environment prerequisite, not a build failure — report "install dependencies first" as the next step and do not read it as a broken package.
2. **Pack**: create the real tarball and inspect its contents. Use `npm pack` regardless of the detected `<pm>` — yarn appends its own timing line and renames the file, and `bun pack` does not exist. Pack into a temp directory so no `.tgz` is left in the working tree for a later commit to sweep up, and pass the filename pack prints to `tar` exactly — a `*.tgz` glob breaks once a second tarball exists.
   ```bash
   PACK_DIR=$(mktemp -d)
   TARBALL="$PACK_DIR/$(npm pack --pack-destination "$PACK_DIR" | tail -1)"
   tar -tf "$TARBALL"
   ```
3. **Install into a throwaway project**: create a temp dir, `npm init -y` (the project is disposable, so it does not need the repo's package manager — and `pnpm init` rejects `-y`), and install the tarball by path so you exercise the published shape, not the source.
4. **Import-smoke each entry point**: for every path in the `exports` map (and `main`/`module`/`types`), import it and confirm it resolves and loads without throwing. Zero entry points is not a vacuous pass — a package nothing can import is not publishable. Stop and report.

Then check the traps that only appear in the packed output:

- **`"use client"` survives bundling**: if any source file declares `"use client"`, grep the packed `dist` for the directive. If the bundler stripped it, the package is broken for RSC consumers — stop and report.
- **Runtime/animation libs are peerDependencies**: libraries the consumer's app also renders with (React, React DOM, framer-motion, and similar runtime/animation libs) belong in `peerDependencies`, not `dependencies`, to avoid duplicate copies. Flag any that are misplaced.
- **Exports map resolves both conditions**: confirm both the `import` and `require` conditions resolve for each export entry, and that `types` points at real `.d.ts` files in the tarball.
- **Files array does not drop dist**: confirm the `files` array / `.npmignore` actually includes the built `dist` (and types) — the packed tarball listing from step 2 is the source of truth.
- **Tarball hygiene**: read the same listing for anything that should not be published — `.env` files, credentials or keys, internal `docs/`, notes, fixtures, or a tarball far larger than the built output justifies. Publishing is irreversible, so flag these before they ship.

Report every finding. Any hard failure (build fail, stripped directive, missing dist, unresolved export, secret in the tarball) blocks publish until fixed.

In dry-run mode, stop here and report the verification results. Do not proceed to commit or publish.

## Step 5: Commit And Push The Release

Do not enter this step in dry-run mode.

If the repo has no remote, stop BEFORE committing and report — the publish-after-push invariant cannot be satisfied without one, so committing here would only leave the tree mutated and publishing permanently blocked.

Step 3 wrote version bumps, `CHANGELOG.md` entries, and any migration note. Commit and push them before anything reaches the registry — publishing from a dirty tree leaves the released version uncommitted and any later tag pointing at a commit that does not contain it.

Stage the release deliberately, by name — never `git add -A`, which sweeps whatever else is in the tree into the release commit. Stage the version-bearing manifests (every file the bump touched), `CHANGELOG.md`, any migration note, and the changeset files `changeset version` consumed.

```bash
git add package.json CHANGELOG.md   # plus each bumped manifest, MIGRATIONS.md, and consumed .changeset/*.md
git commit -m "chore(release): vX.Y.Z"   # or "chore(release): <name>@<version>" per package
git push
```

Re-read `HEAD` after committing — a repo hook may have amended the commit and changed its hash.

Reaching this step means the user confirmed the bumps at the Step 2 gate, which authorizes committing and pushing that release. Publishing and tagging stay separately gated below.

Pushing by default here differs from `/arc:commit`, where push is opt-in. That is deliberate — a release exists to ship, and the push was consented to at the Step 2 gate.

Publish is blocked until the release commit exists and has been pushed. If the commit or push fails, stop and report; do not fall through to Step 6.

## Step 6: Publish

In dry-run mode, report what would be published and stop here — nothing was committed, so there is nothing to publish.

Otherwise gate publishing behind one explicit question:

```
AskUserQuestion:
  question: "Verification passed for <packages>. How do you want to proceed?"
  header: "Publish"
  options:
    - label: "Publish now"
      description: "Publish each verified package to the registry"
    - label: "Dry-run only"
      description: "Run publish with --dry-run and report, but do not publish"
    - label: "Stop"
      description: "Leave the release authored but unpublished"
```

If no user response is available, set mode = dry-run: report what would be published and stop without publishing.

On **Publish now**, publish each verified package from its directory. For changesets repos prefer `<pm> changeset publish` (it publishes only bumped packages and skips already-published versions). For single packages use `npm publish`, adding `--access public` for scoped public packages.

After a successful publish, **offer** to tag and push the tag — never do it silently. Single-package path only: `changeset publish` creates and pushes its own tags, so skip this offer on the changesets path.

```bash
# offered, not automatic:
git tag <name>@<version>   # or vX.Y.Z for single-package repos
git push --follow-tags
```

If no user response is available, skip tagging and report the exact tag and push commands for the user to run.

## Step 7: Report

Tell the user:

- Which packages were released and at what versions, with the reason for each bump.
- Migration notes written, if any.
- Verification results per package (packed contents, entry-point smoke, the five traps). If the run went to dry-run at the Step 2 gate, say that verification ran against the current, pre-bump versions.
- The release commit and its push status — mark both "n/a (dry-run)" when no commit was made.
- Publish status per package: published, dry-run, skipped (already on registry), or blocked.
- Tag status, or a reminder that tagging is still pending.
- Anything an unattended fallback skipped (changesets scaffolding, tagging) and what the user should run.
