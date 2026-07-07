import { getAgents, getRules, getSkills, getVersion } from "@/lib/content";

export function GET() {
  const skills = getSkills();
  const agents = getAgents();
  const rules = getRules();
  const version = getVersion();

  const lines = [
    "# Arc",
    "",
    `> The full arc from idea to shipped code. For Claude Code and Codex, with ${skills.length} skills, ${agents.length} agents, and ${rules.length} rules.${version !== null && version !== "" ? ` v${version}.` : ""}`,
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
    "- Install (Codex): curl -fsSL https://raw.githubusercontent.com/howells/arc/main/.codex/install.sh | bash -s -- --auto-update --interval-hours 6",
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
