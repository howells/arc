#!/bin/bash
# Arc Plugin: SessionEnd Hook
# Logs session end and provides cleanup summary.
#
# Note: By the time this runs, the session is ending anyway.
# This is primarily for logging/debugging purposes.

set -euo pipefail

# Read input from stdin
input=$(cat)

session_id=$(echo "$input" | jq -r '.session_id // "unknown"')

# Log session end
log_file="/tmp/arc-subagent-completions.log"
timestamp=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$timestamp] Session ended: $session_id" >> "$log_file"

# Count how many subagents ran this session (from the log)
if [ -f "$log_file" ]; then
  subagent_count=$(grep -c "session=$session_id" "$log_file" 2>/dev/null || echo "0")
  echo "[$timestamp] Total subagents in session: $subagent_count" >> "$log_file"
fi

# Clean up old log entries (older than 1 day)
if [ -f "$log_file" ]; then
  # Keep only recent entries
  tail -500 "$log_file" > "$log_file.tmp" 2>/dev/null && mv "$log_file.tmp" "$log_file" || true
fi

exit 0
