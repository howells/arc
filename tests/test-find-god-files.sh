#!/bin/bash
# Test the read-only god-file / duplicate-block scanner used by refactor/audit.

section "Find God Files Tests"

FINDER="$PLUGIN_ROOT/scripts/find-god-files.py"
assert_file_exists "$FINDER" "find-god-files.py"

if [ -f "$FINDER" ]; then
    if python3 -m py_compile "$FINDER" 2>/dev/null; then
        pass "find-god-files.py compiles"
    else
        fail "find-god-files.py has syntax errors"
    fi
fi

god_tmpdir="$(make_test_tmpdir)"
mkdir -p "$god_tmpdir/src"

# A source file whose regex literal contains `//`. Comment stripping in the
# duplicate scanner must NOT truncate this at the embedded slashes (task: regex
# literal tracking in strip_line_comment).
cat >"$god_tmpdir/src/regex.js" <<'JS'
const doubleSlash = /\/\//;
export function matchDoubleSlash(input) {
  return doubleSlash.test(input); // trailing comment is fine to drop
}
JS
cat >"$god_tmpdir/src/util.ts" <<'TS'
export function add(a: number, b: number) { return a + b; }
export function sub(a: number, b: number) { return a - b; }
TS

god_json="$(python3 "$FINDER" "$god_tmpdir" --json 2>/dev/null)"

if echo "$god_json" | python3 -m json.tool >/dev/null 2>&1; then
    pass "find-god-files.py emits valid JSON"
else
    fail "find-god-files.py JSON output is invalid" "$god_json"
fi

if echo "$god_json" | grep -q '"candidates"'; then
    pass "find-god-files.py reports candidates section"
else
    fail "find-god-files.py missing candidates section"
fi

if echo "$god_json" | grep -q '"duplicateBlocks"'; then
    pass "find-god-files.py reports duplicate blocks section"
else
    fail "find-god-files.py missing duplicate blocks section"
fi

# Regression: a `//` inside a regex literal must be preserved by
# strip_line_comment() (otherwise the duplicate scanner mis-normalizes code).
regex_check="$(python3 - "$FINDER" <<'PY'
import importlib.util
import sys

spec = importlib.util.spec_from_file_location("find_god_files", sys.argv[1])
module = importlib.util.module_from_spec(spec)
# Register before exec so dataclass field-type resolution can find the module.
sys.modules[spec.name] = module
spec.loader.exec_module(module)

line = r"const doubleSlash = /\/\//;"
result = module.strip_line_comment(line)
print("OK" if result == line else "TRUNCATED::" + repr(result))

# A genuine trailing comment must still be stripped.
commented = module.strip_line_comment("return x; // note")
print("COMMENT_OK" if commented.strip() == "return x;" else "COMMENT_BAD::" + repr(commented))
PY
)"

if echo "$regex_check" | grep -q "^OK$"; then
    pass "find-god-files.py preserves // inside regex literals"
else
    fail "find-god-files.py truncates regex literal at //" "$regex_check"
fi

if echo "$regex_check" | grep -q "^COMMENT_OK$"; then
    pass "find-god-files.py still strips genuine trailing comments"
else
    fail "find-god-files.py broke trailing comment stripping" "$regex_check"
fi
