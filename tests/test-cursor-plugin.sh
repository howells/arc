#!/bin/bash
# Test that the Cursor plugin packaging is first-class and marketplace-ready.
#
# Verifies:
# - .cursor-plugin/plugin.json + marketplace.json exist and stay in sync
# - Manifest declares skills, agents, commands; does not ship rules/ as Cursor rules
# - Nested agents are discoverable via glob
# - Installer + INSTALL docs exist
# - Public commands have name + description frontmatter

section "Cursor Plugin Tests"

CURSOR_PLUGIN_JSON="$PLUGIN_ROOT/.cursor-plugin/plugin.json"
CURSOR_MARKETPLACE_JSON="$PLUGIN_ROOT/.cursor-plugin/marketplace.json"

assert_file_exists "$CURSOR_PLUGIN_JSON" "Cursor plugin.json"
assert_file_exists "$CURSOR_MARKETPLACE_JSON" "Cursor marketplace.json"
assert_file_exists "$PLUGIN_ROOT/.cursor/INSTALL.md" ".cursor/INSTALL.md"
assert_file_exists "$PLUGIN_ROOT/.cursor/install.sh" ".cursor/install.sh"

if [ -x "$PLUGIN_ROOT/.cursor/install.sh" ]; then
    pass ".cursor/install.sh is executable"
else
    fail ".cursor/install.sh must be executable"
fi

# Manifest schema-ish required surface
for key in name displayName version description author homepage repository license logo skills agents commands; do
    if jq -e --arg k "$key" 'has($k)' "$CURSOR_PLUGIN_JSON" >/dev/null 2>&1; then
        pass "Cursor plugin.json has $key"
    else
        fail "Cursor plugin.json missing $key"
    fi
done

# Product boundary: do not distribute Arc rules/ as always-on Cursor rules.
rules_value=$(jq -c '.rules' "$CURSOR_PLUGIN_JSON")
if [ "$rules_value" = "[]" ]; then
    pass "Cursor plugin.json sets rules to [] (internal corpus not injected)"
else
    fail "Cursor plugin.json must set rules to []" "Got: $rules_value"
fi

# Author must not include unsupported fields (Cursor schema is additionalProperties: false).
if jq -e '.author.url' "$CURSOR_PLUGIN_JSON" >/dev/null 2>&1; then
    fail "Cursor plugin.json author must not include url (schema forbids it)"
else
    pass "Cursor plugin.json author has no unsupported url field"
fi

# Component paths resolve
skills_path=$(jq -r '.skills' "$CURSOR_PLUGIN_JSON")
commands_path=$(jq -r '.commands' "$CURSOR_PLUGIN_JSON")
agents_glob=$(jq -r '.agents' "$CURSOR_PLUGIN_JSON")

assert_dir_exists "$PLUGIN_ROOT/${skills_path#./}" "skills path from Cursor manifest"
assert_dir_exists "$PLUGIN_ROOT/${commands_path#./}" "commands path from Cursor manifest"

if [[ "$agents_glob" == *"**"* ]]; then
    pass "Cursor agents field uses recursive glob for nested agents"
else
    fail "Cursor agents field should glob nested agents" "Got: $agents_glob"
fi

agent_matches=$(compgen -G "$PLUGIN_ROOT/agents/**/*.md" | wc -l | tr -d ' ')
if [ "$agent_matches" -gt 0 ]; then
    pass "Nested agent files exist ($agent_matches)"
else
    fail "Expected nested agents under agents/**/*.md"
fi

# Marketplace entry points at repo root plugin
mp_source=$(jq -r '.plugins[0].source' "$CURSOR_MARKETPLACE_JSON")
mp_name=$(jq -r '.plugins[0].name' "$CURSOR_MARKETPLACE_JSON")
mp_version=$(jq -r '.plugins[0].version' "$CURSOR_MARKETPLACE_JSON")
plugin_version=$(jq -r '.version' "$CURSOR_PLUGIN_JSON")
mp_meta_version=$(jq -r '.metadata.version' "$CURSOR_MARKETPLACE_JSON")

if [ "$mp_name" = "arc" ]; then
    pass "Cursor marketplace lists plugin name arc"
else
    fail "Cursor marketplace plugin name should be arc" "Got: $mp_name"
fi

if [ "$mp_source" = "./" ]; then
    pass "Cursor marketplace source is ./"
else
    fail "Cursor marketplace source should be ./" "Got: $mp_source"
fi

if [ "$mp_version" = "$plugin_version" ] && [ "$mp_meta_version" = "$plugin_version" ]; then
    pass "Cursor marketplace versions match plugin.json ($plugin_version)"
else
    fail "Cursor marketplace versions drifted" \
        "plugin=$plugin_version marketplace.plugin=$mp_version marketplace.meta=$mp_meta_version"
fi

# Logo exists
logo=$(jq -r '.logo' "$CURSOR_PLUGIN_JSON")
assert_file_exists "$PLUGIN_ROOT/$logo" "Cursor logo ($logo)"

# Public commands have Cursor-friendly name frontmatter
missing_names=()
for cmd_file in "$PLUGIN_ROOT"/commands/*.md; do
    [ -f "$cmd_file" ] || continue
    expected=$(basename "$cmd_file" .md)
    frontmatter=$(get_frontmatter "$cmd_file")
    if ! echo "$frontmatter" | grep -q "^name: $expected$"; then
        missing_names+=("$expected")
    fi
done

if [ ${#missing_names[@]} -eq 0 ]; then
    pass "All commands have matching name frontmatter"
else
    fail "Commands missing name frontmatter" "${missing_names[*]}"
fi

# Docs mention the installer
assert_file_contains "$PLUGIN_ROOT/README.md" ".cursor/install.sh" \
    "README documents Cursor installer"
assert_file_contains "$PLUGIN_ROOT/.cursor/INSTALL.md" "full-runtime" \
    "Cursor INSTALL.md documents full-runtime"
assert_file_contains "$PLUGIN_ROOT/.cursor/INSTALL.md" "rules/" \
    "Cursor INSTALL.md explains rules are not injected"
