// Agent categories correspond to subdirectories under agents/
export const AGENT_CATEGORIES = [
  "review",
  "research",
  "build",
  "workflow",
] as const;
export type AgentCategory = (typeof AGENT_CATEGORIES)[number];

export const WORKFLOW_POSITIONS = ["spine", "branch", "utility"] as const;
export type WorkflowPosition = (typeof WORKFLOW_POSITIONS)[number];

export interface SkillWorkflow {
  after?: string; // spine only — preceding skill name
  joins?: string; // branch only — which spine skill to connect to
  position: WorkflowPosition;
}

export interface Skill {
  agents?: string[];
  content: string;
  decisions: string[];
  desc: string;
  invokable: boolean;
  name: string;
  order: number;
  summary: string;
  what: string;
  why: string;
  workflow?: SkillWorkflow;
}

export interface Agent {
  category: AgentCategory;
  content: string;
  desc: string;
  name: string;
  summary: string;
  usedBy?: string[];
  what: string;
  why: string;
}

export const RULE_CATEGORIES = ["core", "workflow", "interface"] as const;
export type RuleCategory = (typeof RULE_CATEGORIES)[number];

export interface Rule {
  category: RuleCategory;
  content: string;
  slug: string;
  title: string;
}

export const AGENT_CATEGORY_LABELS: Record<AgentCategory, string> = {
  build: "Build Agent",
  research: "Research Agent",
  review: "Review Agent",
  workflow: "Workflow Agent",
};

export interface Discipline {
  description: string;
  name: string;
  slug: string;
}
