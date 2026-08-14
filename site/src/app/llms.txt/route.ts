import { getAgents, getRules, getSkills, getVersion } from "@/lib/content";

export function GET() {
  const skills = getSkills();
  const agents = getAgents();
  const rules = getRules();
  const version = getVersion();

  const lines = [
    "# Arc",
    "",
    "> DEPRECATED: Arc is preserved as an archive and remains available, but it is no longer maintained. Use https://github.com/howells/skills for maintained, focused agent skills.",
    "",
    `> The full arc from idea to shipped code. For Claude Code, Codex, and Cursor, with ${skills.length} skills, ${agents.length} agents, and ${rules.length} rules.${version !== null && version !== "" ? ` v${version}.` : ""}`,
    "",
    "## Skills",
    "",
    ...skills.map(
      (s) =>
        `- [${s.invokable ? `/arc:${s.name}` : s.name}](https://github.com/howells/arc/blob/main/skills/${s.name}/SKILL.md): ${s.desc}`
    ),
    "",
    "## Agents",
    "",
    ...agents.map(
      (a) =>
        `- [${a.name}](https://github.com/howells/arc/blob/main/agents/${a.category}/${a.name}.md): ${a.desc}`
    ),
    "",
    "## Rules",
    "",
    ...rules.map(
      (r) =>
        `- [${r.title}](https://github.com/howells/arc/blob/main/rules/${r.slug}.md)`
    ),
    "",
    "## Links",
    "",
    "- Install (Claude): claude plugins install arc@howells",
    "- Install (Codex): codex plugin marketplace add howells/arc && codex plugin add arc@howells",
    "- Install (Cursor): git clone https://github.com/howells/arc.git ~/.cursor/plugins/local/arc",
    "- Invoke (Claude): /arc:<skill>",
    "- Invoke (Codex): $<skill>",
    "- Invoke (Cursor): /<skill>",
    "- GitHub: https://github.com/howells/arc",
    "- Docs: https://usearc.dev",
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
