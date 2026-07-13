#!/bin/bash
# Test that the plugin structure is correct
#
# Verifies:
# - commands/ directory exists (explicit command registration)
# - plugin.json references both skills and commands
# - skills/ directory exists and is referenced

section "Plugin Structure Tests"

echo "Verifying plugin structure after skills/commands merge..."
echo ""

# The commands/ directory should exist (explicit command registration)
assert_dir_exists "$PLUGIN_ROOT/commands" "commands/ directory"

# The skills/ directory SHOULD exist
assert_dir_exists "$PLUGIN_ROOT/skills" "skills/ directory"

# Claude plugin.json should exist
PLUGIN_JSON="$PLUGIN_ROOT/.claude-plugin/plugin.json"
assert_file_exists "$PLUGIN_JSON" "Claude plugin.json"

# plugin.json should contain "commands" key
assert_file_contains "$PLUGIN_JSON" '"commands"' \
    "plugin.json references commands"

# plugin.json should contain "skills" key
assert_file_contains "$PLUGIN_JSON" '"skills"' \
    "plugin.json references skills"

# Codex plugin.json should exist and point at the shared skills directory
CODEX_PLUGIN_JSON="$PLUGIN_ROOT/.codex-plugin/plugin.json"
assert_file_exists "$CODEX_PLUGIN_JSON" "Codex plugin.json"
assert_file_contains "$CODEX_PLUGIN_JSON" '"skills"' \
    "Codex plugin.json references skills"

# Cursor plugin.json should exist and declare the full Cursor surface
CURSOR_PLUGIN_JSON="$PLUGIN_ROOT/.cursor-plugin/plugin.json"
assert_file_exists "$CURSOR_PLUGIN_JSON" "Cursor plugin.json"
assert_file_contains "$CURSOR_PLUGIN_JSON" '"skills"' \
    "Cursor plugin.json references skills"
assert_file_contains "$CURSOR_PLUGIN_JSON" '"agents"' \
    "Cursor plugin.json references agents"
assert_file_contains "$CURSOR_PLUGIN_JSON" '"commands"' \
    "Cursor plugin.json references commands"
assert_file_exists "$PLUGIN_ROOT/.cursor-plugin/marketplace.json" \
    "Cursor marketplace.json"

# Version should be present
echo ""
echo "Checking version..."
version=$(grep '"version"' "$PLUGIN_JSON" | head -1 | sed 's/.*"version": *"\([^"]*\)".*/\1/')
if [ -n "$version" ]; then
    pass "plugin.json has version: $version"
else
    fail "Could not extract version from plugin.json"
fi

cursor_version=$(jq -r '.version // empty' "$CURSOR_PLUGIN_JSON" 2>/dev/null)
if [ -n "$cursor_version" ] && [ "$cursor_version" = "$version" ]; then
    pass "Cursor plugin.json version matches Claude ($cursor_version)"
else
    fail "Cursor plugin.json version mismatch" "claude=$version cursor=$cursor_version"
fi
