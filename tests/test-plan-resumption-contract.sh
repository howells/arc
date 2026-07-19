#!/bin/bash
# Contract tests for durable plan execution and safe resumption.

section "Plan Resumption Contract Tests"

LIFECYCLE="$PLUGIN_ROOT/references/plan-lifecycle.md"
STATUSES="$PLUGIN_ROOT/references/subagent-statuses.md"
ASSURANCE="$PLUGIN_ROOT/references/implementation-assurance.md"
IMPLEMENT="$PLUGIN_ROOT/skills/implement/SKILL.md"
IMPROVE="$PLUGIN_ROOT/skills/improve/SKILL.md"
FINISH="$PLUGIN_ROOT/disciplines/finishing-a-development-branch.md"
VERIFY="$PLUGIN_ROOT/disciplines/verification-before-completion.md"

assert_file_contains "$LIFECYCLE" 'status="in_progress"' \
    "plan lifecycle persists in-progress tasks"
assert_file_contains "$LIFECYCLE" "Implementation baseline" \
    "plan lifecycle defines execution baseline"
assert_file_contains "$LIFECYCLE" "## Implementation state" \
    "implementation baseline has a durable plan location"
assert_file_contains "$LIFECYCLE" "Commit posture" \
    "implementation state persists commit authority"
assert_file_contains "$LIFECYCLE" "Closeout" \
    "implementation state persists closeout completion"
assert_file_contains "$LIFECYCLE" "pre-existing dirty" \
    "plan lifecycle preserves pre-existing dirty paths"
assert_file_contains "$LIFECYCLE" "cannot verify drift" \
    "plan lifecycle preserves unresolved drift warning"
assert_file_contains "$LIFECYCLE" "never re-baseline" \
    "plan lifecycle forbids silent drift rebasing"

assert_file_contains "$STATUSES" 'AUTH_GATE.*in_progress' \
    "auth gates keep durable task in progress"
assert_file_contains "$STATUSES" 'NEEDS_CONTEXT.*in_progress' \
    "missing context keeps durable task in progress"
assert_file_contains "$STATUSES" 'BLOCKED.*blocked' \
    "irrecoverable blocker maps to blocked"
assert_file_contains "$STATUSES" 'DONE.*done' \
    "completed agent result maps to done"
assert_file_contains "$STATUSES" "same task" \
    "auth recovery redispatches the same task"

assert_file_contains "$IMPLEMENT" 'status="in_progress"' \
    "implement marks a slice in progress before dispatch"
assert_file_contains "$IMPLEMENT" "Implementation baseline" \
    "implement captures the execution baseline"
assert_file_contains "$IMPLEMENT" "pre-existing dirty" \
    "implement detects dirty-path overlap"
assert_file_contains "$IMPROVE" 'status="in_progress"' \
    "improve recognizes interrupted tasks"
assert_file_contains "$IMPROVE" "done.*absent/pending.*IN PROGRESS" \
    "improve rolls partially completed plans forward"
assert_file_contains "$IMPROVE" "schema-2 all-done with closeout pending or absent" \
    "schema-2 adoption keeps unclosed plans in progress"
assert_file_contains "$IMPROVE" "verified through legacy path" \
    "legacy completed plans retain historical reconciliation"
assert_file_contains "$IMPROVE" "expect no implementation-state metadata" \
    "legacy reconciliation does not require schema-2 state"
assert_file_contains "$IMPROVE" "absence of a commit is not a failure" \
    "improve reconciles user-authorized uncommitted work"

assert_file_contains "$ASSURANCE" "Exact command" \
    "receipt records exact command identity"
assert_file_contains "$ASSURANCE" "Current HEAD" \
    "receipt records current HEAD"
assert_file_contains "$ASSURANCE" "same uninterrupted session" \
    "receipt reuse is session-local"
assert_file_contains "$ASSURANCE" "controller-observed" \
    "agent summaries cannot mint receipts"

assert_file_contains "$VERIFY" "verification receipt" \
    "completion discipline understands receipts"
assert_file_not_contains "$VERIFY" "run the verification command in this message" \
    "completion discipline does not force duplicate same-message gates"
assert_file_contains "$FINISH" "verification receipt" \
    "branch finishing avoids unchanged duplicate gates"
