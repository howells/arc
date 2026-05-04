#!/bin/bash

# Plugin validation script
# Run automatically in pre-commit or manually with .husky/validate-plugin.sh
# Aligned with Claude Code plugin best practices (2026-02)

set -e
shopt -s globstar nullglob 2>/dev/null || true

ERRORS=0
WARNINGS=0

error() {
  echo "❌ ERROR: $1"
  ERRORS=$((ERRORS + 1))
}

warn() {
  echo "⚠️  WARN: $1"
  WARNINGS=$((WARNINGS + 1))
}

ok() {
  echo "✓ $1"
}

echo "🔍 Validating plugin..."
echo ""

# ─── 1. plugin.json ───────────────────────────────────────────────────────────
echo "Checking plugin.json..."
if [ ! -f .claude-plugin/plugin.json ]; then
  error ".claude-plugin/plugin.json not found"
elif ! jq . .claude-plugin/plugin.json > /dev/null 2>&1; then
  error "plugin.json is not valid JSON"
else
  # Required fields per docs: name, description, version
  if ! jq -e '.name' .claude-plugin/plugin.json > /dev/null 2>&1; then
    error "plugin.json missing required 'name' field"
  fi
  if ! jq -e '.description' .claude-plugin/plugin.json > /dev/null 2>&1; then
    error "plugin.json missing required 'description' field"
  fi
  if ! jq -e '.version' .claude-plugin/plugin.json > /dev/null 2>&1; then
    error "plugin.json missing required 'version' field"
  fi
  ok "plugin.json valid"
fi

# ─── 2. marketplace.json ──────────────────────────────────────────────────────
if [ -f .claude-plugin/marketplace.json ]; then
  echo "Checking marketplace.json..."
  if ! jq . .claude-plugin/marketplace.json > /dev/null 2>&1; then
    error "marketplace.json is not valid JSON"
  else
    ok "marketplace.json valid"
  fi
fi

# ─── 3. Version sync ──────────────────────────────────────────────────────────
echo "Checking version sync..."
plugin_version=$(jq -r '.version // empty' .claude-plugin/plugin.json 2>/dev/null)
if [ -n "$plugin_version" ]; then
  if [ -f .claude-plugin/marketplace.json ]; then
    mp_version=$(jq -r '.metadata.version // empty' .claude-plugin/marketplace.json 2>/dev/null)
    if [ -n "$mp_version" ] && [ "$plugin_version" != "$mp_version" ]; then
      error "Version mismatch: plugin.json=$plugin_version marketplace.json=$mp_version"
    fi
  fi
  if [ -f package.json ]; then
    pkg_version=$(jq -r '.version // empty' package.json 2>/dev/null)
    if [ -n "$pkg_version" ] && [ "$plugin_version" != "$pkg_version" ]; then
      error "Version mismatch: plugin.json=$plugin_version package.json=$pkg_version"
    fi
  fi
  ok "Versions in sync ($plugin_version)"
fi

# ─── 4. No plugin components inside .claude-plugin/ ──────────────────────────
echo "Checking plugin layout..."
for bad_dir in .claude-plugin/skills .claude-plugin/commands .claude-plugin/agents .claude-plugin/hooks; do
  if [ -d "$bad_dir" ]; then
    error "$bad_dir/ should be at repo root, not inside .claude-plugin/"
  fi
done
ok "Plugin layout correct"

# ─── 5. Agent frontmatter ─────────────────────────────────────────────────────
echo "Checking agent frontmatter..."
agent_count=0
while IFS= read -r -d '' f; do
  agent_count=$((agent_count + 1))

  # Must start with ---
  if ! head -1 "$f" | grep -q "^---"; then
    error "$f missing YAML frontmatter (must start with ---)"
    continue
  fi

  # Must have closing ---
  frontmatter_end=$(head -50 "$f" | grep -n "^---$" | sed -n '2p' | cut -d: -f1)
  if [ -z "$frontmatter_end" ]; then
    error "$f frontmatter not closed (missing second --- within first 50 lines)"
    continue
  fi

  # Required: name
  if ! head -"$frontmatter_end" "$f" | grep -q "^name:"; then
    error "$f missing 'name:' in frontmatter"
  fi

  # Required: description
  if ! head -"$frontmatter_end" "$f" | grep -q "^description:"; then
    error "$f missing 'description:' in frontmatter"
  fi
done < <(find agents -name "*.md" -print0 2>/dev/null)
ok "Agents checked ($agent_count files)"

# ─── 6. Skill SKILL.md frontmatter ────────────────────────────────────────────
echo "Checking skill files..."
skill_count=0
while IFS= read -r -d '' f; do
  skill_count=$((skill_count + 1))

  # Must start with ---
  if ! head -1 "$f" | grep -q "^---"; then
    error "$f missing YAML frontmatter (must start with ---)"
    continue
  fi

  # Must have closing ---
  frontmatter_end=$(head -50 "$f" | grep -n "^---$" | sed -n '2p' | cut -d: -f1)
  if [ -z "$frontmatter_end" ]; then
    error "$f frontmatter not closed (missing second --- within first 50 lines)"
    continue
  fi

  # Required: name
  if ! head -"$frontmatter_end" "$f" | grep -q "^name:"; then
    error "$f missing 'name:' in frontmatter"
  fi

  # Required: description
  if ! head -"$frontmatter_end" "$f" | grep -q "^description:"; then
    error "$f missing 'description:' in frontmatter"
  fi
done < <(find skills -name "SKILL.md" -print0 2>/dev/null)
ok "Skills checked ($skill_count files)"

# ─── 7. Command files ─────────────────────────────────────────────────────────
echo "Checking command files..."
cmd_count=0
if [ -d commands ]; then
  for f in commands/*.md; do
    [ -f "$f" ] || continue
    cmd_count=$((cmd_count + 1))

    if ! head -1 "$f" | grep -q "^---"; then
      error "$f missing YAML frontmatter"
      continue
    fi

    frontmatter_end=$(head -50 "$f" | grep -n "^---$" | sed -n '2p' | cut -d: -f1)
    if [ -z "$frontmatter_end" ]; then
      error "$f frontmatter not closed"
      continue
    fi

    # Commands require description
    if ! head -"$frontmatter_end" "$f" | grep -q "^description:"; then
      error "$f missing 'description:' in frontmatter"
    fi
  done
fi
ok "Commands checked ($cmd_count files)"

# ─── 8. Optional config files ─────────────────────────────────────────────────
echo "Checking optional config files..."
for config in .mcp.json .lsp.json; do
  if [ -f "$config" ]; then
    if ! jq . "$config" > /dev/null 2>&1; then
      error "$config is not valid JSON"
    else
      ok "$config valid"
    fi
  fi
done

if [ -f hooks/hooks.json ]; then
  if ! jq . hooks/hooks.json > /dev/null 2>&1; then
    error "hooks/hooks.json is not valid JSON"
  else
    # Validate hook structure: each entry should have event and command/script
    hook_count=$(jq '. | length' hooks/hooks.json 2>/dev/null || echo "0")
    ok "hooks/hooks.json valid ($hook_count hooks)"
  fi
fi
ok "Config files checked"

# ─── 9. YAML frontmatter safety ───────────────────────────────────────────────
# YAML parses `- key: value` as an object, not a string. This breaks React rendering.
echo "Checking YAML frontmatter safety..."
yaml_issues=0
for search_dir in skills agents commands; do
  [ -d "$search_dir" ] || continue
  while IFS= read -r -d '' f; do
    frontmatter_end=$(head -50 "$f" | grep -n "^---$" | sed -n '2p' | cut -d: -f1)
    [ -z "$frontmatter_end" ] && continue

    bad_lines=$(head -"$frontmatter_end" "$f" | grep -n '^ *- [^"]*[a-zA-Z]: ' | grep -v '^ *- "' | grep -v 'http' || true)
    if [ -n "$bad_lines" ]; then
      while IFS= read -r line; do
        error "$f line ${line%%:*}: Unquoted colon in YAML list item will be parsed as object. Wrap in quotes."
        yaml_issues=$((yaml_issues + 1))
      done <<< "$bad_lines"
    fi
  done < <(find "$search_dir" -name "*.md" -print0 2>/dev/null)
done
ok "YAML frontmatter safe"

# ─── 10. Hardcoded paths ──────────────────────────────────────────────────────
echo "Checking for hardcoded paths..."
hardcoded=$(grep -r "/Users/\|/home/" skills/ commands/ agents/ .claude-plugin/ 2>/dev/null | grep -v ".git" | head -5 || true)
if [ -n "$hardcoded" ]; then
  echo "$hardcoded"
  error "Found hardcoded paths (use relative paths or \${CLAUDE_PLUGIN_ROOT})"
fi
ok "No hardcoded paths"

# ─── 11. Script permissions ───────────────────────────────────────────────────
echo "Checking script permissions..."
for search_dir in skills scripts; do
  [ -d "$search_dir" ] || continue
  while IFS= read -r -d '' f; do
    if [ ! -x "$f" ]; then
      error "$f is not executable (run: chmod +x $f)"
    fi
  done < <(find "$search_dir" -name "*.sh" -print0 2>/dev/null)
done
ok "Script permissions checked"

# ─── 12. Naming conventions ───────────────────────────────────────────────────
echo "Checking naming conventions..."
# Agents: kebab-case names
while IFS= read -r -d '' f; do
  frontmatter_end=$(head -50 "$f" | grep -n "^---$" | sed -n '2p' | cut -d: -f1)
  [ -z "$frontmatter_end" ] && continue
  name=$(head -"$frontmatter_end" "$f" | grep "^name:" | head -1 | sed 's/name: *//')
  if [ -n "$name" ]; then
    if echo "$name" | grep -q "[A-Z]"; then
      error "$f name '$name' should be lowercase (kebab-case)"
    fi
    if echo "$name" | grep -q "_"; then
      error "$f name '$name' should use hyphens not underscores"
    fi
    if echo "$name" | grep -q -- "--"; then
      error "$f name '$name' has consecutive hyphens"
    fi
  fi
done < <(find agents -name "*.md" -print0 2>/dev/null)

# Skills: directory names should be kebab-case
while IFS= read -r -d '' f; do
  dir_name=$(basename "$(dirname "$f")")
  if echo "$dir_name" | grep -q "[A-Z]"; then
    error "skills/$dir_name/ should be lowercase (kebab-case)"
  fi
  if echo "$dir_name" | grep -q "_"; then
    error "skills/$dir_name/ should use hyphens not underscores"
  fi
done < <(find skills -name "SKILL.md" -print0 2>/dev/null)
ok "Naming conventions checked"

# ─── 13. Internal references ──────────────────────────────────────────────────
echo "Checking internal references..."
ref_issues=0
for search_dir in skills agents; do
  [ -d "$search_dir" ] || continue
  while IFS= read -r -d '' f; do
    # Extract references: agents/, disciplines/, references/, templates/, rules/, skills/ paths
    # Supports ${CLAUDE_PLUGIN_ROOT}/ and ${ARC_ROOT}/ prefixes (both resolve to the plugin root).
    refs=$(grep -oE "(\\\$\{(CLAUDE_PLUGIN_ROOT|ARC_ROOT)\}/)?(agents|disciplines|workflows|references|templates|rules|skills)/[a-z0-9/_-]+\.md" "$f" 2>/dev/null || true)
    for ref in $refs; do
      clean_ref=$(echo "$ref" | sed -E 's/\$\{(CLAUDE_PLUGIN_ROOT|ARC_ROOT)\}\///')
      if [ ! -f "$clean_ref" ]; then
        warn "$f references '$clean_ref' which doesn't exist"
        ref_issues=$((ref_issues + 1))
      fi
    done
  done < <(find "$search_dir" -name "*.md" -print0 2>/dev/null)
done
ok "References checked ($ref_issues issues)"

# ─── 14. Codex symlinks ──────────────────────────────────────────────────────
if [ -d .agents/skills ]; then
  echo "Checking Codex symlinks..."
  symlink_issues=0
  for link in .agents/skills/*/; do
    [ -L "${link%/}" ] || continue
    if [ ! -e "${link%/}" ]; then
      error "Broken symlink: ${link%/}"
      symlink_issues=$((symlink_issues + 1))
    fi
  done
  ok "Codex symlinks checked ($symlink_issues issues)"
fi

# ─── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -gt 0 ]; then
  echo "❌ Validation failed: $ERRORS error(s), $WARNINGS warning(s)"
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo "⚠️  Validation passed with $WARNINGS warning(s)"
  exit 0
else
  echo "✅ Validation passed"
  exit 0
fi
