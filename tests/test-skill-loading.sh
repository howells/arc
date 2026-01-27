#!/bin/bash
# Test that all Arc skills are properly structured
#
# Verifies:
# - All expected skill directories exist
# - Each skill has a SKILL.md file
# - Each SKILL.md has required frontmatter

section "Skill Loading Tests"

# Expected skills
EXPECTED_SKILLS=(
    "arc"
    "audit"
    "build"
    "commit"
    "design"
    "detail"
    "document"
    "figma"
    "ideate"
    "implement"
    "legal"
    "letsgo"
    "progress"
    "review"
    "rules"
    "suggest"
    "test"
    "tidy"
    "vision"
    "worktree"
)

echo "Checking ${#EXPECTED_SKILLS[@]} expected skills..."
echo ""

for skill in "${EXPECTED_SKILLS[@]}"; do
    skill_dir="$PLUGIN_ROOT/skills/$skill"
    skill_file="$skill_dir/SKILL.md"

    # Check directory exists
    if [ -d "$skill_dir" ]; then
        # Check SKILL.md exists
        if [ -f "$skill_file" ]; then
            # Check required frontmatter
            frontmatter=$(get_frontmatter "$skill_file")

            # Must have name
            if echo "$frontmatter" | grep -q "^name:"; then
                # Must have description
                if echo "$frontmatter" | grep -q "^description:"; then
                    pass "skill/$skill has valid structure"
                else
                    fail "skill/$skill missing description in frontmatter"
                fi
            else
                fail "skill/$skill missing name in frontmatter"
            fi
        else
            fail "skill/$skill missing SKILL.md"
        fi
    else
        fail "skill/$skill directory not found"
    fi
done

# Verify no unexpected skills (optional but useful)
echo ""
echo "Checking for unexpected skill directories..."
for dir in "$PLUGIN_ROOT/skills"/*/; do
    skill_name=$(basename "$dir")
    found=false
    for expected in "${EXPECTED_SKILLS[@]}"; do
        if [ "$skill_name" = "$expected" ]; then
            found=true
            break
        fi
    done
    if [ "$found" = false ]; then
        echo -e "${YELLOW}⚠${NC} Unexpected skill: $skill_name (not in expected list)"
    fi
done
