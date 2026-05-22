#!/bin/bash
# Test that destructive skills have explicit invocation protection
#
# These skills should NOT be auto-invoked:
# - commit (user controls when to commit)
# - launch (go-live checklist)

section "Invocation Control Tests"

# Skills that MUST opt out of implicit invocation
PROTECTED_SKILLS=(
    "commit"
    "launch"
)

echo "Verifying destructive skills are protected..."
echo ""

for skill in "${PROTECTED_SKILLS[@]}"; do
    skill_file="$PLUGIN_ROOT/skills/$skill/SKILL.md"
    openai_yaml="$PLUGIN_ROOT/skills/$skill/agents/openai.yaml"

    if [ ! -f "$skill_file" ]; then
        fail "skill/$skill/SKILL.md not found"
        continue
    fi

    if [ -f "$openai_yaml" ] && grep -q "allow_implicit_invocation: false" "$openai_yaml"; then
        pass "skill/$skill opts out of implicit invocation"
    else
        fail "skill/$skill must opt out of implicit invocation" \
            "Expected agents/openai.yaml policy.allow_implicit_invocation: false"
    fi
done

# Skills that should NOT opt out of implicit invocation (they're meant to be suggested)
echo ""
echo "Verifying non-destructive skills are NOT protected..."
UNPROTECTED_SKILLS=(
    "ideate"
    "implement"
    "testing"
)

for skill in "${UNPROTECTED_SKILLS[@]}"; do
    skill_file="$PLUGIN_ROOT/skills/$skill/SKILL.md"
    openai_yaml="$PLUGIN_ROOT/skills/$skill/agents/openai.yaml"

    if [ -f "$skill_file" ]; then
        frontmatter=$(get_frontmatter "$skill_file")
        if echo "$frontmatter" | grep -q "^disable-model-invocation: true"; then
            fail "skill/$skill should NOT disable invocation in frontmatter" \
                "This skill should be invocable by agents"
        elif [ -f "$openai_yaml" ] && grep -q "allow_implicit_invocation: false" "$openai_yaml"; then
            fail "skill/$skill should NOT opt out of implicit invocation" \
                "This skill should be invocable by agents"
        else
            pass "skill/$skill can be implicitly invoked (correct)"
        fi
    else
        fail "skill/$skill/SKILL.md not found"
    fi
done
