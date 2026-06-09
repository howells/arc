/**
 * Sanitize markdown content for public display.
 * Strips XML-like instruction tags that are meant for Claude, not humans.
 *
 * Pure string manipulation — safe for both client and server.
 */
export function sanitizeContent(content: string): string {
  let result = content;

  // 1. Strip operational blocks entirely (tag + content) — these are Claude instructions
  const stripBlocks = [
    "tasklist_context",
    "rules_context",
    "required_reading",
    "tool_restrictions",
    "arc_log",
    "success_criteria",
  ];
  for (const tag of stripBlocks) {
    const re = new RegExp(`<${tag}>[\\s\\S]*?</${tag}>\\s*`, "gi");
    result = result.replace(re, "");
  }

  // 2. Unwrap content tags — keep inner text, remove markers
  const unwrapTags = [
    "advisory",
    "important",
    "principle",
    "key_principles",
    "output_format",
    "process",
    "agents",
    "example",
    "commentary",
  ];
  for (const tag of unwrapTags) {
    result = result.replaceAll(new RegExp(`<${tag}>\\s*`, "gi"), "");
    result = result.replaceAll(new RegExp(`\\s*</${tag}>`, "gi"), "");
  }

  // 3. Remove any remaining self-closing instruction tags
  result = result.replaceAll(/<[a-z_]+\s*\/>\s*/gi, "");

  // 4. Collapse 3+ consecutive newlines into 2
  result = result.replaceAll(/\n{3,}/g, "\n\n");

  return result.trim();
}
