import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { load as yamlLoad } from "js-yaml";
import type {
  Agent,
  Discipline,
  Rule,
  RuleCategory,
  Skill,
  SkillWorkflow,
  WorkflowData,
} from "./types";
import { AGENT_CATEGORIES } from "./types";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));

// Resolve repo root once from this module location instead of process.cwd().
const ROOT = resolve(MODULE_DIR, "../../..");

// Regex patterns for custom YAML extraction (avoids issues with complex description fields)
const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---/;
const NAME_REGEX = /^name:\s*(.+)$/m;
const WEBSITE_REGEX = /^website:\n((?: {2}.+\n?)+)/m;
const MD_EXTENSION_REGEX = /\.md$/;
const HEADING_REGEX = /^#\s+(.+)$/m;

/**
 * Extract and parse only the website section from frontmatter.
 * This avoids YAML parsing issues with complex description fields
 * that contain unescaped colons, newlines, etc.
 */
function extractWebsiteSection(content: string): {
  name?: string;
  website?: Record<string, unknown>;
} | null {
  const match = content.match(FRONTMATTER_REGEX);
  if (!match) {
    return null;
  }

  const frontmatter = match[1];
  const nameMatch = frontmatter.match(NAME_REGEX);
  const name = nameMatch?.[1]?.trim();

  const websiteMatch = frontmatter.match(WEBSITE_REGEX);
  if (!websiteMatch) {
    return { name };
  }

  try {
    const websiteYaml = `website:\n${websiteMatch[1]}`;
    const parsed = yamlLoad(websiteYaml) as {
      website: Record<string, unknown>;
    };
    return { name, website: parsed.website };
  } catch {
    return { name };
  }
}

function readLocalFile(relativePath: string): string | null {
  const fullPath = resolve(ROOT, relativePath);
  if (!existsSync(fullPath)) {
    return null;
  }
  return readFileSync(fullPath, "utf-8");
}

/**
 * Get the set of skill names that have a command router in commands/.
 * These are user-invokable via /arc:<name>.
 */
function getInvokableSkills(): Set<string> {
  const commandsDir = resolve(ROOT, "commands");
  if (!existsSync(commandsDir)) {
    return new Set();
  }
  return new Set(
    readdirSync(commandsDir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(MD_EXTENSION_REGEX, ""))
  );
}

const CORE_RULES = new Set([
  "stack",
  "versions",
  "code-style",
  "typescript",
  "react",
  "nextjs",
  "tailwind",
]);

const _WORKFLOW_RULES = new Set([
  "testing",
  "git",
  "env",
  "security",
  "auth",
  "error-handling",
  "database",
  "turborepo",
  "integrations",
  "api",
  "cloudflare-workers",
  "cli",
  "plan-mode",
  "ai-sdk",
  "seo",
  "tooling",
]);

interface SkillFrontmatter {
  name: string;
  website?: {
    order: number;
    desc: string;
    summary: string;
    what: string;
    why: string;
    decisions: string[];
    agents?: string[];
    workflow?: {
      position: string;
      after?: string;
      joins?: string;
    };
  };
}

interface AgentFrontmatter {
  website?: {
    desc: string;
    summary: string;
    what: string;
    why: string;
    usedBy?: string[];
  };
}

/**
 * Auto-discover all skills from the filesystem.
 * Scans skills/ for subdirectories containing SKILL.md with a website: section.
 * Checks commands/ to determine which skills are user-invokable.
 */
export function getSkills(): Skill[] {
  const skillsDir = resolve(ROOT, "skills");
  if (!existsSync(skillsDir)) {
    return [];
  }

  const invokable = getInvokableSkills();
  const skills: Skill[] = [];
  const entries = readdirSync(skillsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const raw = readLocalFile(`skills/${entry.name}/SKILL.md`);
    if (!raw) {
      continue;
    }

    try {
      const { data, content: body } = matter(raw);
      const frontmatter = data as unknown as SkillFrontmatter;
      const website = frontmatter.website;

      if (website) {
        const name = frontmatter.name || entry.name;
        skills.push({
          name,
          order: website.order ?? 999,
          invokable: invokable.has(entry.name),
          desc: String(website.desc || ""),
          summary: String(website.summary || ""),
          what: String(website.what || ""),
          why: String(website.why || ""),
          decisions: (website.decisions || []).map((d) =>
            typeof d === "string" ? d : JSON.stringify(d)
          ),
          agents: website.agents,
          workflow: website.workflow
            ? {
                position: website.workflow
                  .position as SkillWorkflow["position"],
                after: website.workflow.after,
                joins: website.workflow.joins,
              }
            : undefined,
          content: body.trim(),
        });
      }
    } catch {
      // Skip files with YAML parsing errors
    }
  }

  return skills.sort((a, b) => a.order - b.order);
}

/**
 * Auto-discover all agents from the filesystem.
 * Scans agents/{category}/ for .md files with a website: section.
 */
export function getAgents(): Agent[] {
  const agentsDir = resolve(ROOT, "agents");
  if (!existsSync(agentsDir)) {
    return [];
  }

  const agents: Agent[] = [];

  for (const category of AGENT_CATEGORIES) {
    const categoryDir = resolve(agentsDir, category);
    if (!existsSync(categoryDir)) {
      continue;
    }

    const files = readdirSync(categoryDir).filter((f) => f.endsWith(".md"));

    for (const file of files) {
      const raw = readLocalFile(`agents/${category}/${file}`);
      if (!raw) {
        continue;
      }

      try {
        const extracted = extractWebsiteSection(raw);
        const website = extracted?.website as AgentFrontmatter["website"];

        if (website) {
          // Extract body after frontmatter
          const fmMatch = raw.match(FRONTMATTER_REGEX);
          const body = fmMatch ? raw.slice(fmMatch[0].length).trim() : raw;

          agents.push({
            name: extracted?.name || file.replace(MD_EXTENSION_REGEX, ""),
            category,
            desc: website.desc,
            summary: website.summary,
            what: website.what,
            why: website.why,
            usedBy: website.usedBy,
            content: body,
          });
        }
      } catch {
        // Skip files with YAML parsing errors
      }
    }
  }

  return agents;
}

/**
 * Auto-discover all rules from the filesystem.
 * Reads rules/*.md (Core + Workflow) and rules/interface/*.md (Interface Guidelines).
 * Skips README.md and index.md. Extracts title from first # heading.
 */
export function getRules(): Rule[] {
  const rulesDir = resolve(ROOT, "rules");
  if (!existsSync(rulesDir)) {
    return [];
  }

  const rules: Rule[] = [];

  // Top-level rules (Core + Workflow)
  const topFiles = readdirSync(rulesDir).filter(
    (f) => f.endsWith(".md") && f !== "README.md"
  );

  for (const file of topFiles) {
    const content = readLocalFile(`rules/${file}`);
    if (!content) {
      continue;
    }

    const slug = file.replace(MD_EXTENSION_REGEX, "");
    const titleMatch = content.match(HEADING_REGEX);
    const title = titleMatch?.[1] ?? slug;
    const category: RuleCategory = CORE_RULES.has(slug) ? "core" : "workflow";

    rules.push({ slug, title, category, content });
  }

  // Interface rules
  const interfaceDir = resolve(rulesDir, "interface");
  if (existsSync(interfaceDir)) {
    const interfaceFiles = readdirSync(interfaceDir).filter(
      (f) => f.endsWith(".md") && f !== "index.md"
    );

    for (const file of interfaceFiles) {
      const content = readLocalFile(`rules/interface/${file}`);
      if (!content) {
        continue;
      }

      const slug = `interface/${file.replace(MD_EXTENSION_REGEX, "")}`;
      const titleMatch = content.match(HEADING_REGEX);
      const title = titleMatch?.[1] ?? file.replace(MD_EXTENSION_REGEX, "");

      rules.push({ slug, title, category: "interface", content });
    }
  }

  return rules;
}

export function getSkillNames(): string[] {
  return getSkills().map((s) => s.name);
}

export function getSkillByName(name: string): Skill | null {
  return getSkills().find((s) => s.name === name) ?? null;
}

export function getAgentByName(name: string): Agent | null {
  return getAgents().find((a) => a.name === name) ?? null;
}

export function getRuleBySlug(slug: string): Rule | null {
  return getRules().find((r) => r.slug === slug) ?? null;
}

/**
 * Build structured workflow data from skill frontmatter.
 * Follows the linked list (after:) to order the spine,
 * groups branches by their joins target, and lists utilities separately.
 */
export function getWorkflowData(skills?: Skill[]): WorkflowData {
  const all = skills ?? getSkills();

  const spineSkills = all.filter((s) => s.workflow?.position === "spine");
  const branchSkills = all.filter((s) => s.workflow?.position === "branch");
  const utilities = all.filter((s) => s.workflow?.position === "utility");

  // Build spine by following the linked list
  const _byName = new Map(spineSkills.map((s) => [s.name, s]));
  const start = spineSkills.find((s) => !s.workflow?.after);
  const spine: Skill[] = [];

  if (start) {
    let current: Skill | undefined = start;
    const visited = new Set<string>();
    while (current && !visited.has(current.name)) {
      visited.add(current.name);
      spine.push(current);
      current = spineSkills.find((s) => s.workflow?.after === current?.name);
    }
  }

  // Group branches by their join target
  const branches: Record<string, Skill[]> = {};
  for (const branch of branchSkills) {
    const target = branch.workflow?.joins;
    if (target) {
      branches[target] = branches[target] ?? [];
      branches[target].push(branch);
    }
  }

  return { spine, branches, utilities };
}

// biome-ignore lint/performance/noBarrelFile: re-export used by page components
export { sanitizeContent } from "./sanitize";

/**
 * Auto-discover all disciplines from the filesystem.
 * Scans disciplines/ for .md files with name and description frontmatter.
 */
export function getDisciplines(): Discipline[] {
  const discsDir = resolve(ROOT, "disciplines");
  if (!existsSync(discsDir)) {
    return [];
  }

  const disciplines: Discipline[] = [];
  const files = readdirSync(discsDir).filter((f) => f.endsWith(".md"));

  for (const file of files) {
    const raw = readLocalFile(`disciplines/${file}`);
    if (!raw) {
      continue;
    }

    try {
      const { data } = matter(raw);
      const slug = file.replace(MD_EXTENSION_REGEX, "");
      disciplines.push({
        slug,
        name: String(data.name || slug),
        description: String(data.description || ""),
      });
    } catch {
      // Skip files with parsing errors
    }
  }

  return disciplines;
}

export function getAssetCounts(): { references: number; disciplines: number } {
  const refsDir = resolve(ROOT, "references");
  const discsDir = resolve(ROOT, "disciplines");
  return {
    references: existsSync(refsDir)
      ? readdirSync(refsDir).filter((f) => f.endsWith(".md")).length
      : 0,
    disciplines: existsSync(discsDir)
      ? readdirSync(discsDir).filter((f) => f.endsWith(".md")).length
      : 0,
  };
}

export function getVersion(): string | null {
  const content = readLocalFile(".claude-plugin/plugin.json");
  if (!content) {
    return null;
  }
  try {
    const parsed = JSON.parse(content) as { version?: string };
    return parsed.version ?? null;
  } catch {
    return null;
  }
}
