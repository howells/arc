#!/bin/bash
# Test that long-running skills have context: fork
#
# The audit skill spawns many agents and should run in an isolated context

section "Context Fork Tests"

echo "Verifying long-running skills have context: fork..."
echo ""

# Skills that SHOULD have context: fork
FORKED_SKILLS=(
    "audit"
)

for skill in "${FORKED_SKILLS[@]}"; do
    skill_file="$PLUGIN_ROOT/skills/$skill/SKILL.md"

    if [ -f "$skill_file" ]; then
        assert_frontmatter_value "$skill_file" "context" "fork" \
            "skill/$skill has context: fork"
    else
        fail "skill/$skill/SKILL.md not found"
    fi
done

# Skills that should NOT have context: fork (need conversation context)
echo ""
echo "Verifying interactive skills don't fork..."
NON_FORKED_SKILLS=(
    "ideate"
    "commit"
    "build"
)

for skill in "${NON_FORKED_SKILLS[@]}"; do
    skill_file="$PLUGIN_ROOT/skills/$skill/SKILL.md"

    if [ -f "$skill_file" ]; then
        frontmatter=$(get_frontmatter "$skill_file")
        if echo "$frontmatter" | grep -q "^context: fork"; then
            fail "skill/$skill should NOT have context: fork" \
                "This skill needs conversation context"
        else
            pass "skill/$skill correctly does not fork"
        fi
    fi
done
