import { motion, useReducedMotion } from "motion/react";

import type { Skill } from "@/lib/types";

import {
  AGENT_DOT_GAP,
  AGENT_DOT_RADIUS,
  APPLE_EASE,
  BRANCH_RADIUS,
  NODE_STAGGER,
  SPINE_RADIUS,
  UTILITY_RADIUS,
} from "./constants";
import type { AgentLabel, KnowledgeItem, LayoutNode } from "./types";

interface GraphNodeProps {
  index: number;
  node: LayoutNode;
  onClick: (skill: Skill) => void;
}

function AgentCategoryDots({ label }: { label: AgentLabel }) {
  return (
    <g
      aria-label={`${label.category}: ${label.count} agent${label.count === 1 ? "" : "s"}`}
    >
      <text
        className="fill-neutral-400 font-mono text-[10px]"
        dominantBaseline="central"
        x={label.x}
        y={label.y}
      >
        {label.category}
      </text>
      {Array.from({ length: label.count }, (_, i) => (
        <circle
          className="graph-agent-dot"
          cx={label.dotStartX + i * AGENT_DOT_GAP}
          cy={label.y}
          fill="var(--color-accent)"
          // biome-ignore lint/suspicious/noArrayIndexKey: static dots never reorder
          key={i}
          opacity={0.25}
          r={AGENT_DOT_RADIUS}
        />
      ))}
    </g>
  );
}

function getNodeRadius(nodeType: LayoutNode["nodeType"]): number {
  if (nodeType === "spine") {
    return SPINE_RADIUS;
  }
  if (nodeType === "branch") {
    return BRANCH_RADIUS;
  }
  return UTILITY_RADIUS;
}

function NodeCircle({
  nodeType,
  x,
  y,
  radius,
}: {
  nodeType: LayoutNode["nodeType"];
  x: number;
  y: number;
  radius: number;
}) {
  if (nodeType === "spine") {
    return <circle cx={x} cy={y} fill="var(--color-accent)" r={radius} />;
  }

  if (nodeType === "branch") {
    return (
      <circle
        className="stroke-neutral-400"
        cx={x}
        cy={y}
        fill="none"
        r={radius}
        strokeWidth={1}
      />
    );
  }

  // utility
  return (
    <circle
      className="stroke-neutral-300"
      cx={x}
      cy={y}
      fill="none"
      r={radius}
      strokeWidth={1}
    />
  );
}

export function GraphNode({ node, index, onClick }: GraphNodeProps) {
  const prefersReducedMotion = useReducedMotion();
  const { skill, x, y, nodeType } = node;
  const delay = index * NODE_STAGGER;
  const radius = getNodeRadius(nodeType);

  const label = skill.invokable ? `/arc:${skill.name}` : skill.name;

  const textClass =
    nodeType === "spine" ? "fill-neutral-800" : "fill-neutral-500";

  return (
    <motion.g
      animate={{ opacity: 1, y: 0 }}
      aria-label={`${label}: ${skill.desc}`}
      className="graph-node cursor-pointer"
      initial={
        prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }
      }
      onClick={() => onClick(skill)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(skill);
        }
      }}
      role="button"
      tabIndex={0}
      transition={{
        delay,
        duration: 0.4,
        ease: APPLE_EASE,
      }}
    >
      {/* Node circle */}
      <NodeCircle nodeType={nodeType} radius={radius} x={x} y={y} />

      {/* Label */}
      <text
        className={`font-mono text-xs ${textClass}`}
        dominantBaseline="central"
        x={x + radius + 12}
        y={y}
      >
        {label}
      </text>

      {/* Description — visible on hover via CSS */}
      <text
        className="graph-node-desc fill-neutral-400 font-sans text-[10px]"
        dominantBaseline="hanging"
        x={x + radius + 12}
        y={y + 10}
      >
        {skill.desc}
      </text>

      {/* Invisible hit area */}
      <rect
        fill="transparent"
        height={28}
        width={160}
        x={x - radius - 4}
        y={y - 14}
      />
    </motion.g>
  );
}

interface KnowledgeNodeProps {
  index: number;
  item: KnowledgeItem;
}

export function KnowledgeNode({ item, index }: KnowledgeNodeProps) {
  const prefersReducedMotion = useReducedMotion();
  const delay = 0.8 + index * NODE_STAGGER;

  return (
    <motion.g
      animate={{ opacity: 1 }}
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
      transition={{ delay, duration: 0.4, ease: APPLE_EASE }}
    >
      {/* Diamond marker */}
      <polygon
        className="stroke-neutral-300"
        fill="none"
        points={`${item.x},${item.y - 3.5} ${item.x + 3.5},${item.y} ${item.x},${item.y + 3.5} ${item.x - 3.5},${item.y}`}
        strokeWidth={1}
      />
      <text
        className="fill-neutral-500 font-mono text-xs"
        dominantBaseline="central"
        x={item.x + 16}
        y={item.y}
      >
        {item.label}
      </text>
    </motion.g>
  );
}

export { AgentCategoryDots };
