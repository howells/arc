#!/bin/bash
# Run all Arc plugin tests
#
# Usage: ./tests/run-skill-tests.sh
#        ./tests/run-skill-tests.sh test-skill-loading.sh  # Run specific test

# Don't use set -e as tests may have non-zero exit codes

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Source helpers
source ./test-helpers.sh

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║            Arc Plugin Test Suite                          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Plugin root: $PLUGIN_ROOT"
echo ""

# If specific test file provided, run only that
if [ -n "$1" ]; then
    if [ -f "$1" ]; then
        source "$1"
    else
        echo "Test file not found: $1"
        exit 1
    fi
else
    # Run all test files
    for test_file in test-*.sh; do
        if [ "$test_file" != "test-helpers.sh" ]; then
            source "./$test_file"
        fi
    done
fi

# Print summary and exit with appropriate code
print_summary
exit $?
