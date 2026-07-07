#!/bin/bash
# Test helper functions for Arc plugin tests

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Get the plugin root directory
_HELPER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(cd "$_HELPER_DIR/.." && pwd)"

# Print a test result
pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_RUN++))
    ((TESTS_PASSED++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    if [ -n "$2" ]; then
        echo -e "  ${YELLOW}→${NC} $2"
    fi
    ((TESTS_RUN++))
    ((TESTS_FAILED++))
}

skip() {
    echo -e "${YELLOW}○${NC} $1 (skipped)"
}

# Print test summary
print_summary() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}All $TESTS_RUN tests passed${NC}"
    else
        echo -e "${RED}$TESTS_FAILED of $TESTS_RUN tests failed${NC}"
    fi
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    return $TESTS_FAILED
}

# Check if a file exists
assert_file_exists() {
    local file="$1"
    local name="${2:-$file}"
    if [ -f "$file" ]; then
        pass "$name exists"
        return 0
    else
        fail "$name does not exist" "Expected: $file"
        return 1
    fi
}

# Check if a directory exists
assert_dir_exists() {
    local dir="$1"
    local name="${2:-$dir}"
    if [ -d "$dir" ]; then
        pass "$name exists"
        return 0
    else
        fail "$name does not exist" "Expected: $dir"
        return 1
    fi
}

# Check if a file does NOT exist
assert_file_not_exists() {
    local file="$1"
    local name="${2:-$file}"
    if [ ! -f "$file" ]; then
        pass "$name does not exist (as expected)"
        return 0
    else
        fail "$name should not exist" "Found: $file"
        return 1
    fi
}

# Check if a directory does NOT exist
assert_dir_not_exists() {
    local dir="$1"
    local name="${2:-$dir}"
    if [ ! -d "$dir" ]; then
        pass "$name does not exist (as expected)"
        return 0
    else
        fail "$name should not exist" "Found: $dir"
        return 1
    fi
}

# Check if a file contains a pattern
assert_file_contains() {
    local file="$1"
    local pattern="$2"
    local name="${3:-$file contains '$pattern'}"
    if grep -q "$pattern" "$file" 2>/dev/null; then
        pass "$name"
        return 0
    else
        fail "$name" "Pattern not found: $pattern"
        return 1
    fi
}

# Check if a file does NOT contain a pattern
assert_file_not_contains() {
    local file="$1"
    local pattern="$2"
    local name="${3:-$file does not contain '$pattern'}"
    if ! grep -q "$pattern" "$file" 2>/dev/null; then
        pass "$name"
        return 0
    else
        fail "$name" "Pattern should not be present: $pattern"
        return 1
    fi
}

# Extract frontmatter from a skill file (returns YAML between the leading --- pair).
# Uses an awk state machine that stops at the FIRST closing --- so standalone
# --- lines later in the body don't re-arm the range (mirrors body_without_frontmatter).
get_frontmatter() {
    local file="$1"
    awk '
        NR == 1 && $0 == "---" { in_frontmatter = 1; next }
        in_frontmatter && $0 == "---" { exit }
        in_frontmatter { print }
    ' "$file"
}

# Check if frontmatter contains a key
assert_frontmatter_has() {
    local file="$1"
    local key="$2"
    local name="${3:-$file has frontmatter key '$key'}"
    local frontmatter
    frontmatter=$(get_frontmatter "$file")
    if echo "$frontmatter" | grep -q "^$key:"; then
        pass "$name"
        return 0
    else
        fail "$name" "Key not found in frontmatter"
        return 1
    fi
}

# Check if frontmatter contains a key with specific value
assert_frontmatter_value() {
    local file="$1"
    local key="$2"
    local expected="$3"
    local name="${4:-$file has $key: $expected}"
    local frontmatter
    frontmatter=$(get_frontmatter "$file")
    if echo "$frontmatter" | grep -q "^$key: $expected"; then
        pass "$name"
        return 0
    else
        fail "$name" "Expected $key: $expected"
        return 1
    fi
}

# --- Temp directory management -----------------------------------------------
# Every test-*.sh is sourced into ONE shell, so a per-file `trap ... EXIT` would
# clobber any previously registered trap (bash traps don't stack). Register temp
# dirs here instead and let a single shared EXIT trap clean them all up.
_TEST_TMPDIRS=()

_test_cleanup_tmpdirs() {
    local dir
    for dir in "${_TEST_TMPDIRS[@]}"; do
        [ -n "$dir" ] && rm -rf "$dir"
    done
}
trap _test_cleanup_tmpdirs EXIT

# Create a temp dir that is auto-removed by the shared EXIT trap. Echoes the path.
make_test_tmpdir() {
    local dir
    dir="$(mktemp -d)"
    _TEST_TMPDIRS+=("$dir")
    printf '%s\n' "$dir"
}

# Print section header
section() {
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo " $1"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
}

# Extract Arc-internal path references from markdown/instruction files.
# Supports repo-relative refs plus the few runtime-specific variables still used.
extract_arc_refs() {
    local file="$1"
    grep -oE '(\$\{CLAUDE_PLUGIN_ROOT\}/|\$\{ARC_ROOT\}/|\./)?(references|rules|agents|disciplines|templates|scripts|skills)/[A-Za-z0-9][A-Za-z0-9/_.-]*' "$file" 2>/dev/null | sort -u
}

# Normalize an Arc reference to a repo-relative path for existence checks.
normalize_arc_ref() {
    local ref="$1"
    ref="${ref#\$\{CLAUDE_PLUGIN_ROOT\}/}"
    ref="${ref#\$\{ARC_ROOT\}/}"
    ref="${ref#./}"
    echo "$ref"
}

# Return file body with YAML frontmatter stripped so structural tests only inspect instructions.
body_without_frontmatter() {
    local file="$1"
    awk '
        NR == 1 && $0 == "---" { in_frontmatter = 1; next }
        in_frontmatter && $0 == "---" { in_frontmatter = 0; next }
        !in_frontmatter { print }
    ' "$file"
}
