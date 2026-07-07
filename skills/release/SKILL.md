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
    Release detects what changed since the last tag, proposes a semver bump per package with reasoning, then authors the release — changeset files, version bumps, CHANGELOG entries, and a migration note for any breaking change. Before publishing it builds and packs each package, installs the tarball into a throwaway project, and smoke-tests the real published shape: entry points import, "use client" directives survive bundling, runtime/animation libs are peerDependencies, the exports map resolves, and the files array does not drop needed dist. Publishing, tagging, and pushing are each gated behind an explicit choice.
  why: |
    Publishing is where invisible mistakes ship: a dropped "use client" directive, a runtime lib bundled as a dependency, an exports map that resolves for import but not require, a files array that ships no dist. Version numbers also carry a promise — a breaking change published as a minor breaks installs silently. Release turns publishing from a hopeful `npm publish` into a verified, reasoned step.
  decisions:
    - Semver is proposed with reasoning per package, confirmed in one question.
    - Every breaking change gets a migration note before it can publish.
    - Each package is packed and installed into a temp project before publishing.
    - Publishing, tagging, and pushing are always offered, never silent.
    - Commit owns simple unversioned publish; release owns version bumps and changelogs.
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

<required_reading>
**Read this reference NOW:**

1. `references/platform-tools.md`
   </required_reading>

<platform_context>
Adapt the workflow to the current harness instead of assuming Claude-specific tool names.

- Use platform-native structured questions when available; otherwise ask one concise plain-text question at a time.
- Use the repo's detected package manager (`pnpm`, `npm`, `yarn`, `bun`) consistently for every command below.
  </platform_context>

# Release Workflow

Cut a versioned release of one or more npm packages. Owns semver bumps, changelogs, and multi-package releases. Commits, pushes, and simple unversioned publishing belong to `/arc:commit`.

Usage:

- `/arc:release` - Detect, propose bumps, author, verify, then gate publish.
- `/arc:release dry-run` - Run everything up to and including `pnpm pack` verification, but never publish.

$ARGUMENTS will be empty or "dry-run". Treat "dry-run" as a hard stop before any `publish`.

## Boundary

- Never bump a version, publish, tag, or push without an explicit user choice at the gate.
- Never publish a `private` package or a version already on the registry.
- Never use `--force`, `--no-verify`, or delete published versions.
- Do not invent changelog entries. Base them on actual commits and diffs.

## Step 1: Detect Release State

Establish what is being released before proposing anything.

```bash
git describe --tags --abbrev=0 2>/dev/null || echo "(no tags)"
git log $(git describe --tags --abbrev=0 2>/dev/null)..HEAD --oneline 2>/dev/null || git log --oneline -20
```

Determine the repo shape:

- **Single package**: one `package.json` at root, no workspace config.
- **Workspace/monorepo**: `pnpm-workspace.yaml`, or `workspaces` in root `package.json`.

For workspace repos, check for changesets:

```bash
test -f .changeset/config.json && echo "changesets present" || echo "no changesets"
```

- If changesets are present, read pending intents and status:
  ```bash
  pnpm changeset status --since=$(git describe --tags --abbrev=0 2>/dev/null || echo HEAD~20)
  ```
- If changesets are **absent** in a workspace repo, offer to scaffold on first run (`pnpm add -Dw @changesets/cli && pnpm changeset init`) via one question before continuing. Do not scaffold silently.

Identify which publishable packages changed since their last release. Prefer `changeset status`; fall back to diffing since the last tag filtered by each package's directory:

```bash
git diff --name-only $(git describe --tags --abbrev=0 2>/dev/null || echo HEAD~20)..HEAD
```

A package is a release candidate only if its `package.json` has a `name`, a `version`, and is not `"private": true`. Ignore generated dirs (`node_modules`, `dist`, `build`, `.next`, `.turbo`, coverage).

## Step 2: Propose Semver With Reasoning

For each changed package, inspect the diff and classify the change, then propose a bump with a one-line reason:

- **major** — removed or renamed an export, changed a signature, dropped a runtime, changed default behavior.
- **minor** — added a new export, prop, or option; backwards-compatible surface growth.
- **patch** — bug fix, internal change, docs, types-only fix with no surface change.

Confirm all packages in **one** structured question. List each package with its proposed bump; let the user override any of them.

```
AskUserQuestion:
  question: "Proposed version bumps. Adjust any before I author the release."
  header: "Bumps"
  options:
    - label: "Accept all"
      description: "e.g. @scope/ui minor (new prop), @scope/core patch (internal fix)"
    - label: "Override"
      description: "Tell me which package should be major / minor / patch instead"
    - label: "Stop"
      description: "Cancel the release"
```

## Step 3: Author The Release

Once bumps are confirmed:

- **Changesets repo**: write a changeset file per package under `.changeset/` with the confirmed bump and a human summary, then run:
  ```bash
  pnpm changeset version
  ```
  This applies bumps and regenerates each `CHANGELOG.md`.
- **Single package**: bump the `version` field manually to the confirmed level and prepend a dated entry to `CHANGELOG.md` (create it if absent), grouping changes as Added / Changed / Fixed / Breaking.

For **any** breaking change, write a short migration note — how to upgrade, before/after, and what to search-and-replace. Append it to `MIGRATIONS.md` at the package root (create if absent), keyed by the new version. Keep it to the minimum a consumer needs to update.

## Step 4: Pre-Publish Verification

This step catches the failures a plain `npm publish` ships silently. Run it for every publishing package. Use the platform temp/scratch directory for the throwaway project.

For each package:

1. **Build**: run the package's `build` script if present. A failed build stops the release.
2. **Pack**: create the real tarball and inspect its contents.
   ```bash
   pnpm pack
   tar -tf *.tgz
   ```
3. **Install into a throwaway project**: create a temp dir, `npm init -y`, and install the tarball by path so you exercise the published shape, not the source.
4. **Import-smoke each entry point**: for every path in the `exports` map (and `main`/`module`/`types`), import it and confirm it resolves and loads without throwing.

Then check the traps that only appear in the packed output:

- **`"use client"` survives bundling**: if any source file declares `"use client"`, grep the packed `dist` for the directive. If the bundler stripped it, the package is broken for RSC consumers — stop and report.
- **Runtime/animation libs are peerDependencies**: libraries the consumer's app also renders with (React, React DOM, framer-motion, and similar runtime/animation libs) belong in `peerDependencies`, not `dependencies`, to avoid duplicate copies. Flag any that are misplaced.
- **Exports map resolves both conditions**: confirm both the `import` and `require` conditions resolve for each export entry, and that `types` points at real `.d.ts` files in the tarball.
- **Files array does not drop dist**: confirm the `files` array / `.npmignore` actually includes the built `dist` (and types) — the packed tarball listing from step 2 is the source of truth.

Report every finding. Any hard failure (build fail, stripped directive, missing dist, unresolved export) blocks publish until fixed.

If `$ARGUMENTS` is "dry-run", stop here and report the verification results. Do not proceed to publish.

## Step 5: Publish

Gate publishing behind one explicit question:

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

On **Publish now**, publish each verified package from its directory using the detected package manager. For changesets repos prefer `pnpm changeset publish` (it publishes only bumped packages and skips already-published versions). For single packages use `npm publish`, adding `--access public` for scoped public packages.

After a successful publish, **offer** to tag and push — never do it silently:

```bash
# offered, not automatic:
git tag <name>@<version>   # or vX.Y.Z for single-package repos
git push --follow-tags
```

## Step 6: Report

Tell the user:

- Which packages were released and at what versions, with the reason for each bump.
- Migration notes written, if any.
- Verification results per package (packed contents, entry-point smoke, the four traps).
- Publish status per package: published, dry-run, skipped (already on registry), or blocked.
- Tag/push status, or a reminder that tagging and pushing are still pending.
