#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/howells/arc.git"
BRANCH="main"
PLUGIN_NAME="arc"
CURSOR_LOCAL_ROOT="${CURSOR_LOCAL_ROOT:-$HOME/.cursor/plugins/local}"
PLUGIN_LINK="${CURSOR_LOCAL_ROOT}/${PLUGIN_NAME}"
MODE="symlink"
SOURCE_DIR=""

usage() {
  cat <<'EOF'
Install Arc as a Cursor local plugin.

Usage:
  install.sh [options]

Options:
  --symlink                 Symlink this checkout into ~/.cursor/plugins/local/arc (default when run from a clone).
  --clone                   Clone/update github.com/howells/arc into ~/.cursor/plugins/local/arc.
  --repo-url <url>          Override repository URL for --clone.
  --branch <name>           Branch to track for --clone (default: main).
  --source <path>           Explicit checkout to symlink (default: repo containing this script).
  --local-root <path>       Override ~/.cursor/plugins/local.
  -h, --help                Show this help.

After install, reload Cursor (Developer: Reload Window), then invoke /ideate, /implement, etc.
See .cursor/INSTALL.md for team marketplace and uninstall steps.
EOF
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_DIR="$REPO_ROOT"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --symlink)
      MODE="symlink"
      shift
      ;;
    --clone)
      MODE="clone"
      shift
      ;;
    --repo-url)
      REPO_URL="${2:-}"
      shift 2
      ;;
    --branch)
      BRANCH="${2:-}"
      shift 2
      ;;
    --source)
      SOURCE_DIR="${2:-}"
      shift 2
      ;;
    --local-root)
      CURSOR_LOCAL_ROOT="${2:-}"
      PLUGIN_LINK="${CURSOR_LOCAL_ROOT}/${PLUGIN_NAME}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

require_cmd mkdir
mkdir -p "$CURSOR_LOCAL_ROOT"

if [[ "$MODE" == "clone" ]]; then
  require_cmd git
  if [[ -e "$PLUGIN_LINK" && ! -d "$PLUGIN_LINK/.git" ]]; then
    echo "Refusing to overwrite non-git path: $PLUGIN_LINK" >&2
    echo "Remove it or use --symlink against a local checkout." >&2
    exit 1
  fi
  if [[ -d "$PLUGIN_LINK/.git" ]]; then
    git -C "$PLUGIN_LINK" fetch origin
    git -C "$PLUGIN_LINK" checkout "$BRANCH"
    git -C "$PLUGIN_LINK" pull --ff-only origin "$BRANCH"
  else
    git clone --branch "$BRANCH" "$REPO_URL" "$PLUGIN_LINK"
  fi
else
  if [[ ! -f "$SOURCE_DIR/.cursor-plugin/plugin.json" ]]; then
    echo "No Cursor plugin manifest at $SOURCE_DIR/.cursor-plugin/plugin.json" >&2
    exit 1
  fi
  if [[ -e "$PLUGIN_LINK" || -L "$PLUGIN_LINK" ]]; then
    rm -rf "$PLUGIN_LINK"
  fi
  ln -sfn "$SOURCE_DIR" "$PLUGIN_LINK"
fi

if [[ ! -f "$PLUGIN_LINK/.cursor-plugin/plugin.json" ]]; then
  echo "Install failed: missing $PLUGIN_LINK/.cursor-plugin/plugin.json" >&2
  exit 1
fi

echo "Arc installed for Cursor at $PLUGIN_LINK"
echo "Reload Cursor (Developer: Reload Window), then try /ideate"
