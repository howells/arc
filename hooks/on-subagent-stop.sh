#!/bin/bash
# Arc Plugin: SubagentStop Hook
# Logs when subagents complete for visibility into agent lifecycle.
#
# Note: This hook cannot terminate processes - that's controlled by Claude Code.
# It provides visibility so users know when agents have finished their work.

set -euo pipefail

# Read input from stdin
input=$(cat)

# Extract session info
session_id=$(echo "$input" | jq -r '.session_id // "unknown"')
reason=$(echo "$input" | jq -r '.reason // "completed"')

# Log to temp file for debugging (optional - can be removed if noisy)
log_file="/tmp/arc-subagent-completions.log"
timestamp=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$timestamp] Subagent stopped: session=$session_id reason=$reason" >> "$log_file"

# Keep log file from growing too large (keep last 100 lines)
if [ -f "$log_file" ]; then
  tail -100 "$log_file" > "$log_file.tmp" 2>/dev/null && mv "$log_file.tmp" "$log_file" || true
fi

# Return success - allow the subagent to stop
echo '{"decision": "approve"}'
exit 0
