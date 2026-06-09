import { motion, useReducedMotion } from "motion/react";

import { APPLE_EASE, EDGE_STAGGER, SPINE_X } from "./constants";
import type {
  BranchEdge as BranchEdgeType,
  SectionSeparator,
  SpineLine as SpineLineType,
} from "./types";

interface SpineLineProps {
  line: SpineLineType;
}

export function SpineLineEdge({ line }: SpineLineProps) {
  const prefersReducedMotion = useReducedMotion();
  const d = `M ${line.x} ${line.startY} L ${line.x} ${line.endY}`;

  return (
    <motion.path
      animate={{ opacity: 1, pathLength: 1 }}
      className="fill-none stroke-neutral-300"
      d={d}
      initial={
        prefersReducedMotion ? { opacity: 1 } : { opacity: 0, pathLength: 0 }
      }
      strokeWidth={1.5}
      transition={{
        duration: 0.8,
        ease: APPLE_EASE,
      }}
    />
  );
}

interface BranchEdgeProps {
  edge: BranchEdgeType;
  index: number;
}

export function BranchEdge({ edge, index }: BranchEdgeProps) {
  const prefersReducedMotion = useReducedMotion();
  const { bx, by, sx, sy } = edge;
  const midY = by + (sy - by) * 0.5;
  const d = `M ${bx} ${by} C ${bx} ${midY}, ${sx} ${midY}, ${sx} ${sy}`;
  const delay = index * EDGE_STAGGER;

  return (
    <motion.path
      animate={{ opacity: 1, pathLength: 1 }}
      className="fill-none stroke-neutral-300"
      d={d}
      initial={
        prefersReducedMotion ? { opacity: 1 } : { opacity: 0, pathLength: 0 }
      }
      strokeWidth={1}
      transition={{
        delay,
        duration: 0.5,
        ease: APPLE_EASE,
      }}
    />
  );
}

interface SectionSeparatorLineProps {
  separator: SectionSeparator;
}

export function SectionSeparatorLine({ separator }: SectionSeparatorLineProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.g
      animate={{ opacity: 1 }}
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
      transition={{ delay: 0.6, duration: 0.4, ease: APPLE_EASE }}
    >
      <line
        className="text-neutral-300"
        stroke="currentColor"
        strokeDasharray="3 3"
        x1={SPINE_X}
        x2={SPINE_X + separator.width}
        y1={separator.y}
        y2={separator.y}
      />
      <text
        className="fill-neutral-400 font-mono text-[10px]"
        dominantBaseline="central"
        x={SPINE_X}
        y={separator.y - 10}
      >
        {separator.label}
      </text>
    </motion.g>
  );
}
