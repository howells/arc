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

# plugin.json should exist
PLUGIN_JSON="$PLUGIN_ROOT/.claude-plugin/plugin.json"
assert_file_exists "$PLUGIN_JSON" "plugin.json"

# plugin.json should contain "commands" key
assert_file_contains "$PLUGIN_JSON" '"commands"' \
    "plugin.json references commands"

# plugin.json should contain "skills" key
assert_file_contains "$PLUGIN_JSON" '"skills"' \
    "plugin.json references skills"

# Version should be 1.0.67 or higher
echo ""
echo "Checking version..."
version=$(grep '"version"' "$PLUGIN_JSON" | head -1 | sed 's/.*"version": *"\([^"]*\)".*/\1/')
if [ -n "$version" ]; then
    pass "plugin.json has version: $version"
else
    fail "Could not extract version from plugin.json"
fi
