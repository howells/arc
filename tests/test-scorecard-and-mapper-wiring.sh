#!/bin/bash
# Test that mapper and scorecard guidance is wired into Arc workflows.

section "Scorecard And Mapper Wiring Tests"

assert_file_contains "$PLUGIN_ROOT/skills/audit/SKILL.md" "scripts/codebase-map.py" \
    "audit workflow references codebase mapper"
assert_file_contains "$PLUGIN_ROOT/skills/refactor/SKILL.md" "scripts/codebase-map.py" \
    "refactor workflow references codebase mapper"
assert_file_contains "$PLUGIN_ROOT/skills/detail/SKILL.md" "scripts/codebase-map.py" \
    "detail workflow references codebase mapper"

assert_file_contains "$PLUGIN_ROOT/skills/audit/SKILL.md" "Codebase map:" \
    "audit summary includes codebase map status"
assert_file_contains "$PLUGIN_ROOT/skills/audit/SKILL.md" "## Codebase Map" \
    "audit report includes codebase map section"

assert_file_exists "$PLUGIN_ROOT/references/launch-scorecard.md" "launch-scorecard reference"
assert_file_contains "$PLUGIN_ROOT/skills/launch/SKILL.md" "references/launch-scorecard.md" \
    "launch workflow reads launch scorecard reference"
assert_file_contains "$PLUGIN_ROOT/skills/launch/SKILL.md" "## Launch Scorecard" \
    "launch output includes launch scorecard"
assert_file_contains "$PLUGIN_ROOT/skills/launch/SKILL.md" "Readiness Score" \
    "launch status includes readiness score"
