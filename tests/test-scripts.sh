#!/bin/bash
# Test that functional scripts are well-formed and behave correctly
#
# Verifies:
# - All scripts exist, are executable, and pass bash -n syntax check
# - validate-plugin.sh runs cleanly on our own plugin

section "Script Existence & Permissions Tests"

FUNCTIONAL_SCRIPTS=(
    ".husky/validate-plugin.sh"
    "scripts/bump-version.sh"
    "scripts/build-codex-plugin.sh"
)

for script in "${FUNCTIONAL_SCRIPTS[@]}"; do
    full_path="$PLUGIN_ROOT/$script"
    if [ -f "$full_path" ]; then
        pass "$script exists"

        # Check executable permission
        if [ -x "$full_path" ]; then
            pass "$script is executable"
        else
            fail "$script is not executable" "Run: chmod +x $script"
        fi

        # Syntax check (bash -n parses without executing)
        if bash -n "$full_path" 2>/dev/null; then
            pass "$script passes syntax check"
        else
            fail "$script has syntax errors"
        fi
    else
        fail "$script not found"
    fi
done

section "Validate Plugin Script Tests"

VALIDATE="$PLUGIN_ROOT/.husky/validate-plugin.sh"

# Running it against our own plugin should pass (exit 0)
if (cd "$PLUGIN_ROOT" && bash "$VALIDATE") >/dev/null 2>&1; then
    pass "validate-plugin.sh passes on own plugin"
else
    fail "validate-plugin.sh fails on own plugin" \
        "The plugin itself should pass its own validation"
fi

# Must define error() and warn() helper functions
assert_file_contains "$VALIDATE" "^error()" \
    "validate-plugin.sh defines error() function"
assert_file_contains "$VALIDATE" "^warn()" \
    "validate-plugin.sh defines warn() function"

# Must check for plugin.json
assert_file_contains "$VALIDATE" "plugin.json" \
    "validate-plugin.sh checks plugin.json"

# Must check for required frontmatter in skills
assert_file_contains "$VALIDATE" "frontmatter" \
    "validate-plugin.sh validates frontmatter"

section "Version Bump Script Tests"

BUMP="$PLUGIN_ROOT/scripts/bump-version.sh"

# --check reports current versions and exits 0 when declared files are in sync.
if (cd "$PLUGIN_ROOT" && bash "$BUMP" --check) >/dev/null 2>&1; then
    pass "bump-version.sh --check exits 0 (versions in sync)"
else
    fail "bump-version.sh --check exited non-zero" \
        "Declared version files should be in sync (drift detected)"
fi
