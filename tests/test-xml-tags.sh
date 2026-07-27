#!/bin/bash
# Test that XML tags are used consistently across skills and agents
#
# Verifies:
# - All agents with Arc doc references keep them inside <required_reading> or <rules_context>
# - No files use retired tags (<mandatory_references>, <arc_log_context>, <arc_log>)
# - All review agents have <advisory> tag

section "XML Tag Consistency Tests"

# --- Test 1: No retired tags ---
echo "Checking for retired tags..."
echo ""

RETIRED_TAGS=("mandatory_references" "arc_log_context" "arc_log")

for tag in "${RETIRED_TAGS[@]}"; do
    files_with_retired=$(grep -rl "<${tag}>" "$PLUGIN_ROOT/skills" "$PLUGIN_ROOT/agents" 2>/dev/null)
    if [ -z "$files_with_retired" ]; then
        pass "No files use retired tag <${tag}>"
    else
        while IFS= read -r f; do
            [ -n "$f" ] || continue
            rel_path="${f#$PLUGIN_ROOT/}"
            fail "$rel_path uses retired tag <${tag}>"
        done <<< "$files_with_retired"
    fi
done

# --- Test 2: All review agents have <advisory> ---
echo ""
echo "Checking review agents for <advisory> tag..."
echo ""

for agent_file in "$PLUGIN_ROOT"/agents/review/*.md; do
    agent_name=$(basename "$agent_file" .md)
    if grep -q "<advisory>" "$agent_file"; then
        pass "review/$agent_name has <advisory>"
    else
        fail "review/$agent_name missing <advisory>"
    fi
done

# --- Test 3: Arc doc refs in agents are inside proper tags ---
echo ""
echo "Checking agent doc references are inside <required_reading> or <rules_context>..."
echo ""

tag_errors=0
tag_checked=0

for agent_file in "$PLUGIN_ROOT"/agents/*/*.md; do
    agent_name=$(basename "$agent_file" .md)
    category=$(basename "$(dirname "$agent_file")")

    body=$(body_without_frontmatter "$agent_file")

    # Only enforce tags for doc-loading references, not incidental mentions in frontmatter.
    if ! echo "$body" | grep -qE '(references|rules|disciplines)/[A-Za-z0-9][A-Za-z0-9/_.-]*'; then
        continue
    fi

    ((tag_checked++))

    # Check if it has <required_reading> or <rules_context>
    if echo "$body" | grep -q '<required_reading>\|<rules_context>'; then
        # Verify doc-loading references live inside the structured loading tags.
        in_tag=false
        has_loose_ref=false
        while IFS= read -r line; do
            if echo "$line" | grep -q '<required_reading>\|<rules_context>'; then
                in_tag=true
            elif echo "$line" | grep -q '</required_reading>\|</rules_context>'; then
                in_tag=false
            elif [ "$in_tag" = false ] && echo "$line" | grep -qE '(references|rules|disciplines)/[A-Za-z0-9][A-Za-z0-9/_.-]*'; then
                has_loose_ref=true
            fi
        done <<< "$body"

        if [ "$has_loose_ref" = true ]; then
            fail "$category/$agent_name has doc refs outside <required_reading>/<rules_context>"
            ((tag_errors++))
        else
            pass "$category/$agent_name file refs properly wrapped"
        fi
    else
        fail "$category/$agent_name has doc refs but no <required_reading> or <rules_context>"
        ((tag_errors++))
    fi
done

if [ $tag_errors -eq 0 ] && [ $tag_checked -gt 0 ]; then
    pass "All $tag_checked agents with file refs have them properly tagged"
fi

# --- Skills: no structural tag requirement (intentionally removed) ---
#
# Skills used to be required to carry a <required_reading> or <rules_context> tag
# whenever they cited a references/ or rules/ .md path. That requirement was dropped:
# it enforced a shape, not a guarantee, and the shape it enforced was upfront loading.
# Skills now cite references inline as "load X when you need Y" — progressive
# disclosure, per skills/using-arc/SKILL.md.
#
# The real guarantee — every cited Arc path resolves on disk — is enforced by
# tests/test-agents-and-refs.sh (extract_arc_refs / normalize_arc_ref). It is not
# duplicated here.
#
# Test 3 above still enforces tag containment for agents/*/*.md. That is deliberate:
# agents are dispatched as subagents, skip skills/using-arc/SKILL.md via <SUBAGENT-STOP>,
# and so depend on their own structured blocks for path grounding. Do not relax it to
# match the skills rule.
