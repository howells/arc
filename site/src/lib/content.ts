import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { load as yamlLoad } from "js-yaml";

import type {
  Agent,
  Discipline,
  Rule,
  RuleCategory,
  Skill,
  WorkflowPosition,
} from "./types";
import { AGENT_CATEGORIES, WORKFLOW_POSITIONS } from "./types";

const MODULE_DIR = import.meta.dirname;

// Resolve repo root once from this module location instead of process.cwd().
const ROOT = path.resolve(MODULE_DIR, "../../..");

// Regex patterns for custom YAML extraction (avoids issues with complex description fields)
const FRONTMATTER_REGEX = /^---\n(?<body>[\s\S]*?)\n---/;
const NAME_REGEX = /^name:\s*(?<value>.+)$/m;
const WEBSITE_REGEX = /^website:\n(?<body>(?: {2}.+\n?)+)/m;
const MD_EXTENSION_REGEX = /\.md$/;
const HEADING_REGEX = /^#\s+(?<title>.+)$/m;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toStringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function toStringArray(value: unknown): string[] | undefined {
  return Array.isArray(value)
    ? value.map((item) =>
        typeof item === "string" ? item : JSON.stringify(item)
      )
    : undefined;
}

function toNumber(value: unknown, fallback: number): number {
  return typeof value === "number" ? value : fallback;
}

function isWorkflowPosition(value: unknown): value is WorkflowPosition {
  return WORKFLOW_POSITIONS.some((position) => position === value);
}

/**
 * Extract and parse only the website section from frontmatter.
 * This avoids YAML parsing issues with complex description fields
 * that contain unescaped colons, newlines, etc.
 */
function extractWebsiteSection(content: string): {
  name?: string;
  website?: Record<string, unknown>;
} | null {
  const match = FRONTMATTER_REGEX.exec(content);
  if (!match) {
    return null;
  }

  const frontmatter = match.groups?.body ?? "";
  const nameMatch = NAME_REGEX.exec(frontmatter);
  const name = nameMatch?.groups?.value?.trim();

  const websiteMatch = WEBSITE_REGEX.exec(frontmatter);
  if (!websiteMatch) {
    return { name };
  }

  try {
    const websiteYaml = `website:\n${websiteMatch.groups?.body ?? ""}`;
    const parsed: unknown = yamlLoad(websiteYaml);
    if (isRecord(parsed) && isRecord(parsed.website)) {
      return { name, website: parsed.website };
    }
    return { name };
  } catch {
    return { name };
  }
}

function readLocalFile(relativePath: string): string | null {
  const fullPath = path.resolve(ROOT, relativePath);
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
  const commandsDir = path.resolve(ROOT, "commands");
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

/**
 * Auto-discover all skills from the filesystem.
 * Scans skills/ for subdirectories containing SKILL.md with a website: section.
 * Checks commands/ to determine which skills are user-invokable.
 */
export function getSkills(): Skill[] {
  const skillsDir = path.resolve(ROOT, "skills");
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
    if (raw === null) {
      continue;
    }

    try {
      const { data, content: body } = matter(raw);
      if (!isRecord(data)) {
        continue;
      }
      const website = data.website;
      if (!isRecord(website)) {
        continue;
      }

      const nameValue = toStringValue(data.name);
      const name = nameValue === "" ? entry.name : nameValue;
      const workflow = website.workflow;

      skills.push({
        agents: toStringArray(website.agents),
        content: body.trim(),
        decisions: toStringArray(website.decisions) ?? [],
        desc: toStringValue(website.desc),
        invokable: invokable.has(entry.name),
        name,
        order: toNumber(website.order, 999),
        summary: toStringValue(website.summary),
        what: toStringValue(website.what),
        why: toStringValue(website.why),
        workflow: isRecord(workflow)
          ? {
              position: isWorkflowPosition(workflow.position)
                ? workflow.position
                : "utility",
              after: toOptionalString(workflow.after),
              joins: toOptionalString(workflow.joins),
            }
          : undefined,
      });
    } catch {
      // Skip files with YAML parsing errors
    }
  }

  return [...skills].sort((a, b) => a.order - b.order);
}

/**
 * Auto-discover all agents from the filesystem.
 * Scans agents/{category}/ for .md files with a website: section.
 */
export function getAgents(): Agent[] {
  const agentsDir = path.resolve(ROOT, "agents");
  if (!existsSync(agentsDir)) {
    return [];
  }

  const agents: Agent[] = [];

  for (const category of AGENT_CATEGORIES) {
    const categoryDir = path.resolve(agentsDir, category);
    if (!existsSync(categoryDir)) {
      continue;
    }

    const files = readdirSync(categoryDir).filter((f) => f.endsWith(".md"));

    for (const file of files) {
      const raw = readLocalFile(`agents/${category}/${file}`);
      if (raw === null) {
        continue;
      }

      try {
        const extracted = extractWebsiteSection(raw);
        const website = extracted?.website;

        if (isRecord(website)) {
          // Extract body after frontmatter
          const fmMatch = FRONTMATTER_REGEX.exec(raw);
          const body = fmMatch ? raw.slice(fmMatch[0].length).trim() : raw;
          const extractedName = extracted?.name;

          agents.push({
            category,
            content: body,
            desc: toStringValue(website.desc),
            name:
              extractedName !== undefined && extractedName !== ""
                ? extractedName
                : file.replace(MD_EXTENSION_REGEX, ""),
            summary: toStringValue(website.summary),
            usedBy: toStringArray(website.usedBy),
            what: toStringValue(website.what),
            why: toStringValue(website.why),
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
  const rulesDir = path.resolve(ROOT, "rules");
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
    if (content === null) {
      continue;
    }

    const slug = file.replace(MD_EXTENSION_REGEX, "");
    const titleMatch = HEADING_REGEX.exec(content);
    const title = titleMatch?.groups?.title ?? slug;
    const category: RuleCategory = CORE_RULES.has(slug) ? "core" : "workflow";

    rules.push({ category, content, slug, title });
  }

  // Interface rules
  const interfaceDir = path.resolve(rulesDir, "interface");
  if (existsSync(interfaceDir)) {
    const interfaceFiles = readdirSync(interfaceDir).filter(
      (f) => f.endsWith(".md") && f !== "index.md"
    );

    for (const file of interfaceFiles) {
      const content = readLocalFile(`rules/interface/${file}`);
      if (content === null) {
        continue;
      }

      const slug = `interface/${file.replace(MD_EXTENSION_REGEX, "")}`;
      const titleMatch = HEADING_REGEX.exec(content);
      const title =
        titleMatch?.groups?.title ?? file.replace(MD_EXTENSION_REGEX, "");

      rules.push({ category: "interface", content, slug, title });
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

// oxlint-disable-next-line oxc/no-barrel-file -- re-export used by page components
export { sanitizeContent } from "./sanitize";

/**
 * Auto-discover all disciplines from the filesystem.
 * Scans disciplines/ for .md files with name and description frontmatter.
 */
export function getDisciplines(): Discipline[] {
  const discsDir = path.resolve(ROOT, "disciplines");
  if (!existsSync(discsDir)) {
    return [];
  }

  const disciplines: Discipline[] = [];
  const files = readdirSync(discsDir).filter((f) => f.endsWith(".md"));

  for (const file of files) {
    const raw = readLocalFile(`disciplines/${file}`);
    if (raw === null) {
      continue;
    }

    try {
      const { data } = matter(raw);
      const slug = file.replace(MD_EXTENSION_REGEX, "");
      if (!isRecord(data)) {
        continue;
      }
      const nameValue = toStringValue(data.name);
      disciplines.push({
        description: toStringValue(data.description),
        name: nameValue === "" ? slug : nameValue,
        slug,
      });
    } catch {
      // Skip files with parsing errors
    }
  }

  return disciplines;
}

export function getVersion(): string | null {
  const content = readLocalFile(".claude-plugin/plugin.json");
  if (content === null) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(content);
    if (isRecord(parsed) && typeof parsed.version === "string") {
      return parsed.version;
    }
    return null;
  } catch {
    return null;
  }
}
