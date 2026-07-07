#!/bin/bash
# Test that the committed Codex mirror (plugins/arc) is in sync with the root
# payload it is generated from.
#
# build-codex-plugin.sh copies the root Arc payload (skills, agents, references,
# etc.) into plugins/arc as real files for Codex. If a root payload file changes
# without rebuilding, the mirror drifts. This test regenerates the mirror into a
# throwaway directory and diffs it against the committed one — any difference is
# a failure. Regenerate with `scripts/build-codex-plugin.sh` to fix.

section "Codex Mirror Freshness Tests"

BUILD="$PLUGIN_ROOT/scripts/build-codex-plugin.sh"
COMMITTED="$PLUGIN_ROOT/plugins/arc"

assert_file_exists "$BUILD" "build-codex-plugin.sh"
assert_dir_exists "$COMMITTED" "plugins/arc committed mirror"

mirror_tmpdir="$(make_test_tmpdir)"
fresh="$mirror_tmpdir/arc"

# Build into a throwaway dir; ARC_CODEX_OUT keeps the committed mirror and the
# repo-level marketplace manifest untouched.
if ARC_CODEX_OUT="$fresh" bash "$BUILD" >/dev/null 2>&1; then
    pass "build-codex-plugin.sh builds into a redirected output dir"
else
    fail "build-codex-plugin.sh failed to build into a redirected output dir"
fi

if [ -d "$fresh" ]; then
    mirror_diff="$(diff -r "$COMMITTED" "$fresh" 2>&1)"
    if [ -z "$mirror_diff" ]; then
        pass "plugins/arc mirror is in sync with root payload"
    else
        fail "plugins/arc mirror is stale — run scripts/build-codex-plugin.sh" \
            "$(echo "$mirror_diff" | head -20)"
    fi
else
    fail "redirected mirror build produced no output directory"
fi
