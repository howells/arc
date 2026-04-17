#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/howells/arc.git"
BRANCH="main"
ARC_HOME="${ARC_HOME:-$HOME/.codex/arc}"
SKILLS_ROOT="${SKILLS_ROOT:-$HOME/.agents/skills}"
AUTO_UPDATE="false"
INTERVAL_HOURS="6"

usage() {
  cat <<'EOF'
Install Arc skills for Codex.

Usage:
  install.sh [options]

Options:
  --auto-update                 Enable scheduled auto-updates after install.
  --interval-hours <hours>      Update interval in hours (default: 6).
  --repo-url <url>              Override Arc repository URL.
  --branch <name>               Branch to track (default: main).
  --arc-home <path>             Install/update clone location.
  --skills-root <path>          Codex skills root (default: ~/.agents/skills).
  -h, --help                    Show this help.
EOF
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --auto-update)
      AUTO_UPDATE="true"
      shift
      ;;
    --interval-hours)
      INTERVAL_HOURS="${2:-}"
      shift 2
      ;;
    --repo-url)
      REPO_URL="${2:-}"
      shift 2
      ;;
    --branch)
      BRANCH="${2:-}"
      shift 2
      ;;
    --arc-home)
      ARC_HOME="${2:-}"
      shift 2
      ;;
    --skills-root)
      SKILLS_ROOT="${2:-}"
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

if ! [[ "$INTERVAL_HOURS" =~ ^[0-9]+$ ]] || [[ "$INTERVAL_HOURS" -lt 1 ]]; then
  echo "--interval-hours must be a positive integer" >&2
  exit 1
fi

require_cmd git

if [[ -d "$ARC_HOME/.git" ]]; then
  echo "Updating existing Arc clone at $ARC_HOME..."
  if [[ -n "$(git -C "$ARC_HOME" status --porcelain --untracked-files=no)" ]]; then
    echo "Local tracked changes detected in $ARC_HOME; skipping pull."
  else
    git -C "$ARC_HOME" fetch --prune origin
    if ! git -C "$ARC_HOME" checkout "$BRANCH" >/dev/null 2>&1; then
      echo "Could not switch to branch '$BRANCH' in $ARC_HOME." >&2
      echo "Switch branches manually, then re-run install.sh." >&2
      exit 1
    fi
    git -C "$ARC_HOME" pull --ff-only origin "$BRANCH"
  fi
elif [[ -e "$ARC_HOME" ]]; then
  echo "Path exists but is not a git repository: $ARC_HOME" >&2
  exit 1
else
  echo "Cloning Arc into $ARC_HOME..."
  mkdir -p "$(dirname "$ARC_HOME")"
  git clone --branch "$BRANCH" "$REPO_URL" "$ARC_HOME"
fi

mkdir -p "$SKILLS_ROOT"
SKILLS_SOURCE="$ARC_HOME/.agents/skills"
LEGACY_LINK="$SKILLS_ROOT/arc"

if [[ ! -d "$SKILLS_SOURCE" ]]; then
  echo "Arc Codex skill links not found at $SKILLS_SOURCE" >&2
  exit 1
fi

if [[ -L "$LEGACY_LINK" ]]; then
  echo "Removing legacy bundle symlink: $LEGACY_LINK"
  rm "$LEGACY_LINK"
elif [[ -e "$LEGACY_LINK" ]]; then
  BACKUP_PATH="${LEGACY_LINK}.backup.$(date +%Y%m%d%H%M%S)"
  echo "Legacy path at $LEGACY_LINK is not a symlink. Backing up to $BACKUP_PATH"
  mv "$LEGACY_LINK" "$BACKUP_PATH"
fi

for skill_path in "$SKILLS_SOURCE"/*; do
  skill_name="$(basename "$skill_path")"
  skill_link="$SKILLS_ROOT/$skill_name"

  if [[ -L "$skill_link" ]]; then
    current_target="$(readlink "$skill_link")"
    if [[ "$current_target" != "$skill_path" ]]; then
      echo "Repointing skill symlink: $skill_link -> $skill_path"
      ln -sfn "$skill_path" "$skill_link"
    fi
  elif [[ -e "$skill_link" ]]; then
    backup_path="${skill_link}.backup.$(date +%Y%m%d%H%M%S)"
    echo "Existing path at $skill_link is not a symlink. Backing up to $backup_path"
    mv "$skill_link" "$backup_path"
    ln -s "$skill_path" "$skill_link"
  else
    ln -s "$skill_path" "$skill_link"
  fi
done

for existing_link in "$SKILLS_ROOT"/*; do
  [[ -L "$existing_link" ]] || continue
  current_target="$(readlink "$existing_link")"
  if [[ "$current_target" == "$ARC_HOME/.agents/skills/"* ]] && [[ ! -e "$current_target" ]]; then
    echo "Removing stale Arc skill symlink: $existing_link"
    rm "$existing_link"
  fi
done

echo "Arc skills linked into: $SKILLS_ROOT"

if [[ "$AUTO_UPDATE" == "true" ]]; then
  if [[ ! -x "$ARC_HOME/.codex/enable-auto-update.sh" ]]; then
    echo "Auto-update helper not found: $ARC_HOME/.codex/enable-auto-update.sh" >&2
    echo "Update Arc and re-run with --auto-update." >&2
    exit 1
  fi
  "$ARC_HOME/.codex/enable-auto-update.sh" --interval-hours "$INTERVAL_HOURS" --arc-home "$ARC_HOME"
fi

echo "Done. Restart Codex if skills do not appear immediately."
