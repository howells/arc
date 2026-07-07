#!/bin/bash
# Test that commands and skills are paired correctly.
#
# Verifies:
# - Every commands/X.md has a backing skills/X/SKILL.md
# - Every skills/X/ has a commands/X.md router, EXCEPT the documented internal
#   skills that are invoked by other skills rather than exposed as a slash command.

section "Command <-> Skill Pairing Tests"

# Internal skills that intentionally have NO /arc:X command router:
#   - detail:    the planning skill, invoked internally by implement
#   - using-arc: the bootstrap control plane
SKILL_ONLY_INTERNALS=("detail" "using-arc")

echo "Checking every command has a backing skill..."
echo ""

for cmd_file in "$PLUGIN_ROOT"/commands/*.md; do
    [ -f "$cmd_file" ] || continue
    cmd_name=$(basename "$cmd_file" .md)
    skill_file="$PLUGIN_ROOT/skills/$cmd_name/SKILL.md"
    if [ -f "$skill_file" ]; then
        pass "command/$cmd_name has skills/$cmd_name/SKILL.md"
    else
        fail "command/$cmd_name has no backing skill" "Expected: skills/$cmd_name/SKILL.md"
    fi
done

echo ""
echo "Checking every skill has a command router (except documented internals)..."
echo ""

for skill_file in "$PLUGIN_ROOT"/skills/*/SKILL.md; do
    skill_name=$(basename "$(dirname "$skill_file")")

    is_internal=false
    for internal in "${SKILL_ONLY_INTERNALS[@]}"; do
        if [ "$skill_name" = "$internal" ]; then
            is_internal=true
            break
        fi
    done

    cmd_file="$PLUGIN_ROOT/commands/$skill_name.md"
    if [ "$is_internal" = true ]; then
        if [ -f "$cmd_file" ]; then
            fail "internal skill/$skill_name should NOT have a command router" \
                "detail and using-arc are invoked internally, not via a slash command"
        else
            pass "internal skill/$skill_name correctly has no command router"
        fi
    else
        if [ -f "$cmd_file" ]; then
            pass "skill/$skill_name has commands/$skill_name.md router"
        else
            fail "skill/$skill_name missing command router" "Expected: commands/$skill_name.md"
        fi
    fi
done
