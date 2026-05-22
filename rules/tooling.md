# Project Tooling

Rules for development tooling and integrations.

## Issue Tracking

- SHOULD: Use Linear MCP for projects with multiple features in flight or team collaboration
- SHOULD: Connect Linear issues to Arc workflows when persistent issue tracking is useful (`/arc:audit` can create issues)
- MAY: Skip issue tracking for small solo projects or quick prototypes

**Linear MCP setup:**
```json
// .mcp.json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@anthropic/linear-mcp"]
    }
  }
}
```

## When to Use Linear

| Project Type | Recommendation |
|--------------|----------------|
| Solo prototype | Skip — overhead not worth it |
| Solo project (>1 week) | Consider — helps track context across sessions |
| Team project | Use — essential for coordination |
| Client project | Use — creates audit trail |
| Complex feature work | Use — breaks work into trackable chunks |

## Arc + Linear Workflow

1. Create issues in Linear for planned work
2. `/arc:ideate` creates design docs linked to issues
3. `/arc:implement` executes with issue context
4. `/arc:audit` creates issues from findings

## Other MCP Integrations

- **Figma MCP** — For design-to-code workflows (referenced in `/arc:design`)
- **Context7 MCP** — For library documentation lookup during implementation
- **GitHub MCP** — For PR workflows and issue tracking (alternative to Linear)
