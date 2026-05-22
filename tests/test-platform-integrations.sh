#!/bin/bash
# Test that platform/browser integration guidance stays current

section "Platform Integration Tests"

assert_file_exists "$PLUGIN_ROOT/references/platform-tools.md" "references/platform-tools.md"
assert_file_exists "$PLUGIN_ROOT/references/wiretext.md" "references/wiretext.md"

assert_file_contains "$PLUGIN_ROOT/references/platform-tools.md" "agent-browser" \
    "platform tools references agent-browser"
assert_file_contains "$PLUGIN_ROOT/references/platform-tools.md" "WireText MCP" \
    "platform tools references WireText"
assert_file_contains "$PLUGIN_ROOT/references/platform-tools.md" "Claude Chrome MCP" \
    "platform tools keeps Chrome as preferred Claude path"

assert_file_not_contains "$PLUGIN_ROOT/README.md" "figma-implement" \
    "README has no stale figma-implement reference"
assert_file_not_contains "$PLUGIN_ROOT/CLAUDE.md" "vercel:deploy" \
    "CLAUDE.md has no stale vercel:deploy reference"
assert_file_not_contains "$PLUGIN_ROOT/skills/launch/SKILL.md" "vercel:deploy" \
    "launch has no stale vercel:deploy reference"
