#!/bin/bash
# Test that destructive skills have disable-model-invocation: true
#
# These skills should NOT be auto-invoked by Claude:
# - commit (user controls when to commit)
# - letsgo (production deployment)
# - legal (generates legal documents)
# - worktree (creates git worktrees)
# - tidy (deletes/archives files)
# - rules (modifies project files)

section "Invocation Control Tests"

# Skills that MUST have disable-model-invocation: true
PROTECTED_SKILLS=(
    "commit"
    "letsgo"
    "legal"
    "worktree"
    "tidy"
    "rules"
)

echo "Verifying destructive skills are protected..."
echo ""

for skill in "${PROTECTED_SKILLS[@]}"; do
    skill_file="$PLUGIN_ROOT/skills/$skill/SKILL.md"

    if [ -f "$skill_file" ]; then
        assert_frontmatter_value "$skill_file" "disable-model-invocation" "true" \
            "skill/$skill has disable-model-invocation: true"
    else
        fail "skill/$skill/SKILL.md not found"
    fi
done

# Skills that should NOT have disable-model-invocation (they're meant to be suggested)
echo ""
echo "Verifying non-destructive skills are NOT protected..."
UNPROTECTED_SKILLS=(
    "ideate"
    "build"
    "implement"
    "test"
    "suggest"
)

for skill in "${UNPROTECTED_SKILLS[@]}"; do
    skill_file="$PLUGIN_ROOT/skills/$skill/SKILL.md"

    if [ -f "$skill_file" ]; then
        frontmatter=$(get_frontmatter "$skill_file")
        if echo "$frontmatter" | grep -q "^disable-model-invocation: true"; then
            fail "skill/$skill should NOT have disable-model-invocation: true" \
                "This skill should be invocable by Claude"
        else
            pass "skill/$skill can be auto-invoked (correct)"
        fi
    else
        fail "skill/$skill/SKILL.md not found"
    fi
done
