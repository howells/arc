import { useMemo } from "react";

import type { Agent, AgentCategory, Skill, WorkflowData } from "@/lib/types";

import {
  AGENT_DOT_X,
  AGENT_LABEL_X,
  BRANCH_GAP,
  BRANCH_MERGE_GAP,
  BRANCH_X,
  KNOWLEDGE_GAP,
  PADDING_Y,
  RANK_GAP,
  SECTION_GAP,
  SPINE_X,
  UTILITY_GAP,
  VIEW_WIDTH,
} from "./constants";
import type {
  AgentLabel,
  BranchEdge,
  GraphLayout,
  KnowledgeItem,
  LayoutNode,
  SectionSeparator,
  SpineLine,
} from "./types";

/** Accumulator passed between layout phases */
interface LayoutState {
  agentLabels: AgentLabel[];
  branchEdges: BranchEdge[];
  currentY: number;
  knowledgeItems: KnowledgeItem[];
  nodes: LayoutNode[];
  separators: SectionSeparator[];
  spinePositions: Map<string, number>;
}

function buildAgentCategoryMap(agents: Agent[]): Map<string, AgentCategory> {
  const map = new Map<string, AgentCategory>();
  for (const agent of agents) {
    map.set(agent.name, agent.category);
  }
  return map;
}

function getDominantCategory(
  agentNames: string[],
  categoryMap: Map<string, AgentCategory>
): { category: string; count: number } | null {
  if (agentNames.length === 0) {
    return null;
  }

  const counts = new Map<string, number>();
  for (const name of agentNames) {
    const cat = categoryMap.get(name) ?? "review";
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
  }

  let best = "";
  let bestCount = 0;
  for (const [cat, count] of counts) {
    if (count > bestCount) {
      best = cat;
      bestCount = count;
    }
  }

  return { category: best, count: agentNames.length };
}

function pushAgentLabel(
  skill: Skill,
  y: number,
  categoryMap: Map<string, AgentCategory>,
  agentLabels: AgentLabel[]
): void {
  const names = skill.agents ?? [];
  const dominant = getDominantCategory(names, categoryMap);
  if (dominant) {
    agentLabels.push({
      category: dominant.category,
      count: dominant.count,
      dotStartX: AGENT_DOT_X,
      x: AGENT_LABEL_X,
      y,
    });
  }
}

function findBranchesTargeting(
  spineSkillName: string,
  branches: WorkflowData["branches"]
): Skill[] {
  const result: Skill[] = [];
  for (const [_parentName, branchSkills] of Object.entries(branches)) {
    for (const branch of branchSkills) {
      const joinsTarget = branch.workflow?.joins ?? _parentName;
      if (joinsTarget === spineSkillName) {
        result.push(branch);
      }
    }
  }
  return result;
}

/** Lay out the main spine and its branches. */
function layoutSpine(
  state: LayoutState,
  spine: Skill[],
  branches: WorkflowData["branches"],
  categoryMap: Map<string, AgentCategory>
): void {
  for (let i = 0; i < spine.length; i++) {
    const skill = spine[i];

    if (i > 0) {
      state.currentY += RANK_GAP;
    }

    const branchesForNode = findBranchesTargeting(skill.name, branches);
    layoutBranches(state, branchesForNode, skill.name, categoryMap);

    state.nodes.push({
      agentCount: skill.agents?.length ?? 0,
      id: skill.name,
      nodeType: "spine",
      skill,
      x: SPINE_X,
      y: state.currentY,
    });

    state.spinePositions.set(skill.name, state.currentY);
    pushAgentLabel(skill, state.currentY, categoryMap, state.agentLabels);
  }

  // Fix branch edge target Y positions after all spine nodes are placed
  for (const edge of state.branchEdges) {
    const targetY = state.spinePositions.get(edge.target);
    if (targetY !== undefined) {
      edge.sy = targetY;
    }
  }
}

/** Lay out branches for a single spine node. */
function layoutBranches(
  state: LayoutState,
  branchesForNode: Skill[],
  targetName: string,
  categoryMap: Map<string, AgentCategory>
): void {
  for (const branch of branchesForNode) {
    state.nodes.push({
      agentCount: branch.agents?.length ?? 0,
      id: branch.name,
      nodeType: "branch",
      skill: branch,
      x: BRANCH_X,
      y: state.currentY,
    });

    state.branchEdges.push({
      bx: BRANCH_X,
      by: state.currentY,
      source: branch.name,
      sx: SPINE_X,
      sy:
        state.currentY +
        BRANCH_MERGE_GAP +
        (branchesForNode.length - 1 - branchesForNode.indexOf(branch)) *
          BRANCH_GAP,
      target: targetName,
    });

    pushAgentLabel(branch, state.currentY, categoryMap, state.agentLabels);
    state.currentY += BRANCH_GAP;
  }

  if (branchesForNode.length > 0) {
    state.currentY += BRANCH_MERGE_GAP - BRANCH_GAP;
  }
}

/** Lay out the "available anytime" utility section. */
function layoutUtilities(
  state: LayoutState,
  utilities: Skill[],
  categoryMap: Map<string, AgentCategory>
): void {
  if (utilities.length === 0) {
    return;
  }

  state.currentY += SECTION_GAP;
  state.separators.push({
    label: "available anytime",
    width: VIEW_WIDTH - SPINE_X * 2,
    y: state.currentY,
  });

  state.currentY += SECTION_GAP * 0.6;

  for (let i = 0; i < utilities.length; i++) {
    const skill = utilities[i];

    if (i > 0) {
      state.currentY += UTILITY_GAP;
    }

    state.nodes.push({
      agentCount: skill.agents?.length ?? 0,
      id: skill.name,
      nodeType: "utility",
      skill,
      x: SPINE_X,
      y: state.currentY,
    });

    pushAgentLabel(skill, state.currentY, categoryMap, state.agentLabels);
  }
}

/** Lay out the knowledge section (references + disciplines). */
function layoutKnowledge(
  state: LayoutState,
  assetCounts: { references: number; disciplines: number }
): void {
  const hasKnowledge =
    assetCounts.references > 0 || assetCounts.disciplines > 0;

  if (!hasKnowledge) {
    return;
  }

  state.currentY += SECTION_GAP;
  state.separators.push({
    label: "knowledge",
    width: VIEW_WIDTH - SPINE_X * 2,
    y: state.currentY,
  });

  state.currentY += SECTION_GAP * 0.6;

  if (assetCounts.references > 0) {
    state.knowledgeItems.push({
      label: `${assetCounts.references} references`,
      x: SPINE_X,
      y: state.currentY,
    });
    state.currentY += KNOWLEDGE_GAP;
  }

  if (assetCounts.disciplines > 0) {
    state.knowledgeItems.push({
      label: `${assetCounts.disciplines} disciplines`,
      x: SPINE_X,
      y: state.currentY,
    });
  }
}

function computeLayout(
  workflowData: WorkflowData,
  agents: Agent[],
  assetCounts: { references: number; disciplines: number }
): GraphLayout {
  const { spine, branches, utilities } = workflowData;
  const categoryMap = buildAgentCategoryMap(agents);

  const state: LayoutState = {
    agentLabels: [],
    branchEdges: [],
    currentY: PADDING_Y,
    knowledgeItems: [],
    nodes: [],
    separators: [],
    spinePositions: new Map(),
  };

  layoutSpine(state, spine, branches, categoryMap);
  layoutUtilities(state, utilities, categoryMap);
  layoutKnowledge(state, assetCounts);

  const firstSpineY =
    state.spinePositions.get(spine[0]?.name ?? "") ?? PADDING_Y;

  // Spine line extends from first spine node through the last utility
  const lastUtilityNode = utilities.length > 0 ? state.nodes.at(-1) : undefined;
  const lastSpineY =
    lastUtilityNode?.nodeType === "utility"
      ? lastUtilityNode.y
      : (state.spinePositions.get(spine.at(-1)?.name ?? "") ?? state.currentY);

  const spineLine: SpineLine = {
    endY: lastSpineY,
    startY: firstSpineY,
    x: SPINE_X,
  };

  return {
    agentLabels: state.agentLabels,
    branchEdges: state.branchEdges,
    height: state.currentY + PADDING_Y,
    knowledgeItems: state.knowledgeItems,
    nodes: state.nodes,
    separators: state.separators,
    spineLine,
    width: VIEW_WIDTH,
  };
}

export function useGraphLayout(
  workflowData: WorkflowData,
  agents: Agent[],
  assetCounts: { references: number; disciplines: number }
): GraphLayout {
  return useMemo(
    () => computeLayout(workflowData, agents, assetCounts),
    [workflowData, agents, assetCounts]
  );
}
