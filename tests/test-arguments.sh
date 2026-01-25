#!/bin/bash
# Test that skills with arguments have proper argument-hint at root level
#
# Verifies:
# - argument-hint is at root level (not nested in metadata)
# - Skills that accept arguments have the hint defined

section "Argument Handling Tests"

# Skills that MUST have argument-hint at root level
SKILLS_WITH_ARGS=(
    "audit:<path-or-focus>"
    "figma:<figma-url"
    "tasklist:<add|review|done>"
    "commit:<optional-message>"
    "progress:<note-to-add>"
)

echo "Verifying argument-hint is at root level..."
echo ""

for entry in "${SKILLS_WITH_ARGS[@]}"; do
    skill="${entry%%:*}"
    expected_pattern="${entry#*:}"
    skill_file="$PLUGIN_ROOT/skills/$skill/SKILL.md"

    if [ -f "$skill_file" ]; then
        frontmatter=$(get_frontmatter "$skill_file")

        # Check argument-hint is at root level (not indented)
        if echo "$frontmatter" | grep -q "^argument-hint:"; then
            # Check it contains expected pattern
            if echo "$frontmatter" | grep "^argument-hint:" | grep -q "$expected_pattern"; then
                pass "skill/$skill has argument-hint at root level"
            else
                fail "skill/$skill argument-hint doesn't contain expected pattern" \
                    "Expected: $expected_pattern"
            fi
        else
            fail "skill/$skill missing argument-hint at root level" \
                "Should have: argument-hint: <...>"
        fi

        # Verify it's NOT still in metadata (old format)
        if echo "$frontmatter" | grep -A1 "^metadata:" | grep -q "argument-hint"; then
            fail "skill/$skill still has argument-hint nested in metadata" \
                "Should be at root level, not under metadata:"
        fi
    else
        fail "skill/$skill/SKILL.md not found"
    fi
done

# Skills that should NOT have argument-hint (they don't accept arguments)
echo ""
echo "Verifying skills without arguments don't have hints..."
SKILLS_NO_ARGS=(
    "vision"
    "design"
)

for skill in "${SKILLS_NO_ARGS[@]}"; do
    skill_file="$PLUGIN_ROOT/skills/$skill/SKILL.md"

    if [ -f "$skill_file" ]; then
        frontmatter=$(get_frontmatter "$skill_file")
        if echo "$frontmatter" | grep -q "^argument-hint:"; then
            echo -e "${YELLOW}⚠${NC} skill/$skill has argument-hint but may not need it"
        else
            pass "skill/$skill correctly has no argument-hint"
        fi
    fi
done
