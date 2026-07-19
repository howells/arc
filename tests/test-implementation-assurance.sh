#!/bin/bash
# Contract tests for risk-proportional implementation assurance.

section "Implementation Assurance Contract Tests"

ASSURANCE="$PLUGIN_ROOT/references/implementation-assurance.md"
IMPLEMENT="$PLUGIN_ROOT/skills/implement/SKILL.md"
DETAIL="$PLUGIN_ROOT/skills/detail/SKILL.md"
TASKS="$PLUGIN_ROOT/references/task-granularity.md"
TESTING="$PLUGIN_ROOT/references/testing-patterns.md"
CHECKPOINTS="$PLUGIN_ROOT/references/checkpoint-patterns.md"
SUBAGENTS="$PLUGIN_ROOT/disciplines/subagent-driven-development.md"
PLAN_REVIEWER="$PLUGIN_ROOT/agents/workflow/plan-document-reviewer.md"
SPEC_REVIEWER="$PLUGIN_ROOT/agents/build/spec-reviewer.md"
CODE_REVIEWER="$PLUGIN_ROOT/agents/build/code-reviewer.md"
IMPLEMENTER="$PLUGIN_ROOT/agents/build/implementer.md"

assert_file_exists "$ASSURANCE" "canonical implementation assurance reference"

for posture in Lean Standard Guarded; do
    assert_file_contains "$ASSURANCE" "$posture" "assurance contract defines $posture"
done

assert_file_contains "$ASSURANCE" "Highest applicable risk wins" \
    "assurance uses highest-risk precedence"
assert_file_contains "$ASSURANCE" "session-local verification receipt" \
    "assurance defines session-local receipts"
assert_file_contains "$ASSURANCE" "Prompt-behavior scenario matrix" \
    "assurance includes reviewed behavior scenarios"

assert_file_contains "$IMPLEMENT" "references/implementation-assurance.md" \
    "implement loads canonical assurance"
assert_file_contains "$DETAIL" "references/implementation-assurance.md" \
    "detail loads canonical assurance"
assert_file_contains "$IMPLEMENT" "Planned assurance" \
    "implement records planned assurance"
assert_file_contains "$IMPLEMENT" "Effective assurance" \
    "implement records effective assurance"

assert_file_contains "$TASKS" 'kind="behavior"' "task schema includes work kind"
assert_file_contains "$TASKS" '<seam ref="' "task schema includes seam references"
assert_file_contains "$TASKS" 'type="checkpoint:' "task schema preserves checkpoints"
assert_file_contains "$TASKS" "Legacy auto tasks" "task schema documents legacy compatibility"
assert_file_not_contains "$TASKS" '| `<test_code>`  | Yes' \
    "test_code is not a required task element"
assert_file_not_contains "$DETAIL" "// exact test code" \
    "detail no longer emits exact test source"

assert_file_contains "$TESTING" 'Write an assertion at an agreed seam, watch it fail' \
    "behavior evidence keeps meaningful red requirement"
assert_file_contains "$TESTING" 'Reproduce the defect at the seam, verify the expected failure' \
    "bugfix evidence keeps defect reproduction requirement"
assert_file_contains "$TESTING" 'Require red only when local behavior changes' \
    "integration evidence keeps conditional red requirement"
assert_file_contains "$TESTING" 'Run affected tests before and after. Add characterization coverage only' \
    "refactor evidence keeps before-and-after requirement"
assert_file_contains "$TESTING" 'Use build, package, generation, schema, or mechanical verification.' \
    "artifact evidence keeps mechanical verification requirement"
assert_file_contains "$TESTING" 'Use authorized read-only smoke evidence. External mutation still requires authority.' \
    "deployment evidence keeps authority boundary"
assert_file_contains "$TESTING" 'Use content and link validation where applicable.' \
    "documentation evidence keeps content validation requirement"

assert_file_not_contains "$IMPLEMENT" "Default batch size: 3 tasks" \
    "implement has no fixed three-task batch"
assert_file_not_contains "$IMPLEMENT" "After every 3 tasks" \
    "implement has no fixed three-task pause"
assert_file_not_contains "$IMPLEMENT" "Do NOT dispatch implementer until a failing test exists" \
    "implement has no universal failing-test gate"
assert_file_not_contains "$SUBAGENTS" "Fresh subagent per task + two-stage review" \
    "subagent discipline has no mandatory per-task review chain"

assert_file_contains "$IMPLEMENT" "Test writers and specialist reviewers are conditional." \
    "implement makes specialist delegation conditional"
assert_file_contains "$IMPLEMENT" 'Run `spec-reviewer` and `code-reviewer` in parallel against that same target.' \
    "implement uses whole-implementation review"
assert_file_not_contains "$IMPLEMENT" "### Evidence during a slice" \
    "implement does not redefine the evidence matrix"
assert_file_contains "$IMPLEMENT" 'Plan schema: 2' \
    "implement distinguishes modern plans from legacy plans"
assert_file_contains "$IMPLEMENT" 'update `Effective assurance` in the plan' \
    "assurance escalation updates durable header"
assert_file_contains "$CHECKPOINTS" "fixed batch" \
    "checkpoint contract prohibits fixed batch pauses"
assert_file_contains "$CHECKPOINTS" "external mutation" \
    "checkpoint contract preserves external-mutation authority"

assert_file_not_contains "$PLAN_REVIEWER" "BLOCKER at 6+ files" \
    "plan reviewer has no file-count blocker"
assert_file_not_contains "$PLAN_REVIEWER" 'Test code in `<test_code>`' \
    "plan reviewer validates evidence rather than exact test code"

assert_frontmatter_value "$SPEC_REVIEWER" "model" "sonnet" \
    "whole-implementation spec reviewer uses sonnet"
assert_frontmatter_value "$CODE_REVIEWER" "model" "sonnet" \
    "whole-implementation standards reviewer uses sonnet"
assert_file_contains "$SPEC_REVIEWER" "skipped" \
    "spec reviewer absorbs skipped-slice verification"
assert_file_contains "$CODE_REVIEWER" "evidence" \
    "standards reviewer checks evidence quality"

assert_file_contains "$ASSURANCE" "controller verifies that result and alone updates durable status" \
    "controller alone owns durable status writes"
assert_file_contains "$CHECKPOINTS" "approve.*decline" \
    "action checkpoint supports explicit mutation authority"
assert_file_contains "$IMPLEMENT" "do not invent independent" \
    "implementation preserves visual-direction boundary"
assert_file_contains "$IMPLEMENTER" 'missing mutation consent' \
    "implementer maps missing mutation consent to context"
assert_file_not_contains "$IMPLEMENTER" 'AUTH_GATE.*external-mutation authority' \
    "implementer does not route mutation consent through AUTH_GATE"

assert_file_not_exists "$PLUGIN_ROOT/agents/build/plan-completion-reviewer.md" \
    "retired plan-completion reviewer"
