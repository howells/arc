"use client";

import type { Rule, RuleCategory } from "@/lib/types";

interface RuleListProps {
  onRuleClick: (rule: Rule) => void;
  rules: Rule[];
}

const categoryLabels: Record<RuleCategory, string> = {
  core: "Core",
  interface: "Interface",
  workflow: "Workflow",
};

const categoryOrder: RuleCategory[] = ["core", "workflow", "interface"];

export function RuleList({ rules, onRuleClick }: RuleListProps) {
  const grouped = categoryOrder.reduce<Record<RuleCategory, Rule[]>>(
    (acc, category) => {
      acc[category] = rules.filter((r) => r.category === category);
      return acc;
    },
    { core: [], interface: [], workflow: [] }
  );

  return (
    <div className="space-y-[calc(var(--baseline)*1.5)]">
      {categoryOrder.map((category) => {
        const categoryRules = grouped[category];
        if (categoryRules.length === 0) {
          return null;
        }

        return (
          <div key={category}>
            <h3 className="mb-2 font-mono text-neutral-400 text-xs uppercase tracking-wider">
              {categoryLabels[category]}
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categoryRules.map((rule) => (
                <button
                  className="group rounded-lg border border-neutral-200 px-4 py-3 text-left transition-colors duration-200 hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/8"
                  key={rule.slug}
                  onClick={() => {
                    onRuleClick(rule);
                  }}
                  type="button"
                >
                  <span className="block font-mono text-neutral-800 text-sm transition-colors group-hover:text-[var(--color-accent)]">
                    {rule.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
