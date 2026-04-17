#!/bin/bash
# Test that Codex-discoverable skill symlinks mirror the skill directories

section "Codex Skill Symlink Tests"

echo "Checking .agents/skills mirrors skills/..."
echo ""

for skill_dir in "$PLUGIN_ROOT"/skills/*/; do
    skill_name=$(basename "$skill_dir")
    symlink_path="$PLUGIN_ROOT/.agents/skills/$skill_name"

    if [ -L "$symlink_path" ]; then
        target=$(readlink "$symlink_path")
        if [ "$target" = "../../skills/$skill_name" ]; then
            pass ".agents/skills/$skill_name points to ../../skills/$skill_name"
        else
            fail ".agents/skills/$skill_name has unexpected target" "Found: $target"
        fi
    else
        fail ".agents/skills/$skill_name missing" "Expected symlink: $symlink_path"
    fi
done
