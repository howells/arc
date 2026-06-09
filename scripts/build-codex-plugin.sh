#!/usr/bin/env bash
#
# build-codex-plugin.sh — generate the self-contained Codex plugin tree.
#
# Codex installs a plugin by COPYING its directory into the plugin cache, so the
# plugin must be self-contained (no symlinks escaping its root). Arc's content
# lives at the repo root for the Claude Code plugin; this script mirrors the
# Codex-relevant payload into ./plugins/arc as real files and writes the Codex
# marketplace manifest at ./.agents/plugins/marketplace.json.
#
# Run after a version bump (it copies the bumped .codex-plugin/plugin.json).
# The generated ./plugins/arc and ./.agents/plugins/marketplace.json are
# committed so `codex plugin marketplace add howells/arc` works from GitHub.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/plugins/arc"

# Payload the Codex plugin needs: the plugin manifest, the workflows, and the
# Arc-owned files those workflows load at runtime.
PAYLOAD=(.codex-plugin skills agents references disciplines templates scripts rules commands)
FILES=(CONTEXT.md)

echo "Building Codex plugin tree at plugins/arc ..."
rm -rf "$OUT"
mkdir -p "$OUT"

# cp -RL dereferences any symlinks so the tree is fully self-contained.
for d in "${PAYLOAD[@]}"; do
  if [ -d "$ROOT/$d" ]; then
    cp -RL "$ROOT/$d" "$OUT/$d"
  fi
done
for f in "${FILES[@]}"; do
  if [ -f "$ROOT/$f" ]; then
    cp "$ROOT/$f" "$OUT/$f"
  fi
done

# Drop build cruft that may live under scripts/.
rm -rf "$OUT/scripts/__pycache__"

# Codex marketplace manifest (shares the repo with the Claude plugin).
mkdir -p "$ROOT/.agents/plugins"
cat >"$ROOT/.agents/plugins/marketplace.json" <<'JSON'
{
  "name": "howells",
  "interface": {
    "displayName": "Arc"
  },
  "plugins": [
    {
      "name": "arc",
      "source": {
        "source": "local",
        "path": "./plugins/arc"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_USE"
      },
      "category": "Productivity"
    }
  ]
}
JSON

echo "Done. plugins/arc payload: ${PAYLOAD[*]} + ${FILES[*]}"
