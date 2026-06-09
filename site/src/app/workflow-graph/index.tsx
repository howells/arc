"use client";

import type { Agent, Skill, WorkflowData } from "@/lib/types";

import { BranchEdge, SectionSeparatorLine, SpineLineEdge } from "./graph-edge";
import { AgentCategoryDots, GraphNode, KnowledgeNode } from "./graph-node";
import { useGraphLayout } from "./use-graph-layout";

interface WorkflowGraphProps {
  agents: Agent[];
  assetCounts: { references: number; disciplines: number };
  onSkillClick: (skill: Skill) => void;
  workflowData: WorkflowData;
}

export function WorkflowGraph({
  workflowData,
  agents,
  assetCounts,
  onSkillClick,
}: WorkflowGraphProps) {
  const layout = useGraphLayout(workflowData, agents, assetCounts);

  return (
    <section className="mb-[calc(var(--baseline)*4)]">
      <h2 className="mb-[calc(var(--baseline)*1)] font-mono text-neutral-500 text-xs uppercase leading-[var(--baseline)] tracking-wider">
        The workflow
      </h2>

      <div className="mb-[calc(var(--baseline)*2)]">
        <svg
          aria-label="Arc plugin workflow: skills connected from idea to ship"
          className="w-full max-w-md"
          role="img"
          viewBox={`0 0 ${layout.width} ${layout.height}`}
        >
          {/* Layer 1: Spine line (behind everything) */}
          <SpineLineEdge line={layout.spineLine} />

          {/* Layer 2: Branch curves */}
          {layout.branchEdges.map((edge, i) => (
            <BranchEdge
              edge={edge}
              index={i}
              key={`${edge.source}-${edge.target}`}
            />
          ))}

          {/* Layer 3: Section separators */}
          {layout.separators.map((sep) => (
            <SectionSeparatorLine key={sep.label} separator={sep} />
          ))}

          {/* Layer 4: Agent category labels + dots */}
          {layout.agentLabels.map((label, i) => (
            <AgentCategoryDots
              // biome-ignore lint/suspicious/noArrayIndexKey: position-based, no reorder
              key={i}
              label={label}
            />
          ))}

          {/* Layer 5: Nodes on top */}
          {layout.nodes.map((node, i) => (
            <GraphNode
              index={i}
              key={node.id}
              node={node}
              onClick={onSkillClick}
            />
          ))}

          {/* Layer 6: Knowledge items */}
          {layout.knowledgeItems.map((item, i) => (
            <KnowledgeNode index={i} item={item} key={item.label} />
          ))}
        </svg>
      </div>
    </section>
  );
}
