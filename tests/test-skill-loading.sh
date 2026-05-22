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
    "ai"
    "audit"
    "browse"
    "commit"
    "deps"
    "design"
    "detail"
    "document"
    "go"
    "help"
    "ideate"
    "implement"
    "launch"
    "progress"
    "refactor"
    "responsive"
    "review"
    "seo"
    "suggest"
    "testing"
    "using-arc"
    "vision"
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

echo ""
echo "Checking skill frontmatter parses as YAML..."
if command -v ruby >/dev/null 2>&1; then
    yaml_errors=$(ruby -e '
        require "yaml"
        ARGV.each do |file|
          text = File.read(file, encoding: "UTF-8")
          next unless text.start_with?("---\n")
          frontmatter = text.split(/^---\s*$/, 3)[1]
          begin
            YAML.safe_load(frontmatter, permitted_classes: [], aliases: false)
          rescue => e
            warn "#{file}: #{e.class}: #{e.message}"
            exit 1
          end
        end
    ' "$PLUGIN_ROOT"/skills/*/SKILL.md 2>&1)

    if [ $? -eq 0 ]; then
        pass "all skill frontmatter parses as YAML"
    else
        fail "skill frontmatter must parse as YAML" "$yaml_errors"
    fi
else
    skip "Ruby unavailable; skipping YAML parser validation"
fi

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
