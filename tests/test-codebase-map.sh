#!/bin/bash
# Test the read-only codebase mapper used by audit/refactor/detail workflows.

section "Codebase Map Tests"

MAPPER="$PLUGIN_ROOT/scripts/codebase-map.py"
assert_file_exists "$MAPPER" "codebase-map.py"

if [ -f "$MAPPER" ]; then
    if python3 -m py_compile "$MAPPER" 2>/dev/null; then
        pass "codebase-map.py compiles"
    else
        fail "codebase-map.py has syntax errors"
    fi
fi

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

mkdir -p "$tmpdir/src/api" "$tmpdir/src/lib" "$tmpdir/prisma"
cat >"$tmpdir/package.json" <<'JSON'
{
  "dependencies": {
    "next": "15.0.0",
    "react": "19.0.0",
    "stripe": "18.0.0",
    "openai": "5.0.0"
  },
  "devDependencies": {
    "vitest": "3.0.0"
  }
}
JSON
cat >"$tmpdir/pnpm-lock.yaml" <<'LOCK'
lockfileVersion: '9.0'
LOCK
cat >"$tmpdir/src/api/users.ts" <<'TS'
import { router } from "../lib/router";
import { helper } from "../lib/a";
import Stripe from "stripe";

router.get("/users", listUsers);
router.post("/users", createUser);
export function listUsers() { return helper(); }
export function createUser() { return new Stripe("sk_test").customers; }
TS
cat >"$tmpdir/src/lib/a.ts" <<'TS'
import { b } from "./b";
export function helper() { return b(); }
TS
cat >"$tmpdir/src/lib/b.ts" <<'TS'
import { helper } from "./a";
export function b() { return helper; }
TS
cat >"$tmpdir/prisma/schema.prisma" <<'PRISMA'
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    String @id
  email String
}
PRISMA

json_output="$(python3 "$MAPPER" "$tmpdir" --format json)"

if echo "$json_output" | python3 -m json.tool >/dev/null 2>&1; then
    pass "codebase-map.py emits valid JSON"
else
    fail "codebase-map.py JSON output is invalid" "$json_output"
fi

if echo "$json_output" | grep -q '"framework": "Next.js"'; then
    pass "codebase-map.py detects framework"
else
    fail "codebase-map.py did not detect Next.js"
fi

if echo "$json_output" | grep -q '"path": "/users"'; then
    pass "codebase-map.py detects routes"
else
    fail "codebase-map.py did not detect sample route"
fi

if echo "$json_output" | grep -q '"name": "Stripe"'; then
    pass "codebase-map.py detects services"
else
    fail "codebase-map.py did not detect Stripe service"
fi

if echo "$json_output" | grep -q '"cycles"'; then
    pass "codebase-map.py reports dependency cycles section"
else
    fail "codebase-map.py missing dependency cycles section"
fi

markdown_output="$(python3 "$MAPPER" "$tmpdir" --format markdown)"

if echo "$markdown_output" | grep -q "## Codebase Map"; then
    pass "codebase-map.py emits markdown heading"
else
    fail "codebase-map.py markdown missing heading"
fi

if echo "$markdown_output" | grep -q "Routes"; then
    pass "codebase-map.py markdown includes route summary"
else
    fail "codebase-map.py markdown missing routes"
fi

nested_tmpdir="$(mktemp -d)"
mkdir -p "$nested_tmpdir/site"
cat >"$nested_tmpdir/package.json" <<'JSON'
{ "name": "root-only" }
JSON
cat >"$nested_tmpdir/site/package.json" <<'JSON'
{
  "dependencies": {
    "next": "15.0.0",
    "react": "19.0.0"
  }
}
JSON
nested_output="$(python3 "$MAPPER" "$nested_tmpdir" --format json)"

if echo "$nested_output" | grep -q '"framework": "Next.js"'; then
    pass "codebase-map.py detects nested package framework"
else
    fail "codebase-map.py did not detect nested Next.js package"
fi
