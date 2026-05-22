"use client";

// biome-ignore lint/performance/noNamespaceImport: Radix UI requires namespace import
import * as Tabs from "@radix-ui/react-tabs";
import type { Agent, Discipline, Rule, Skill } from "@/lib/types";
import { AgentList } from "./agent-list";
import { RuleList } from "./rule-list";
import { SkillList } from "./skill-list";

interface ContentBrowserProps {
  agents: Agent[];
  disciplines: Discipline[];
  onAgentClick: (agent: Agent) => void;
  onRuleClick: (rule: Rule) => void;
  onSkillClick: (skill: Skill) => void;
  rules: Rule[];
  skills: Skill[];
}

const TAB_CLASSES =
  "border-transparent border-b-2 px-3 pb-2 font-mono text-neutral-400 text-xs uppercase tracking-wider transition-colors hover:text-neutral-600 data-[state=active]:border-[var(--color-accent)] data-[state=active]:text-neutral-900";

export function ContentBrowser({
  skills,
  agents,
  rules,
  disciplines,
  onSkillClick,
  onAgentClick,
  onRuleClick,
}: ContentBrowserProps) {
  return (
    <Tabs.Root defaultValue="skills">
      <Tabs.List className="mb-[calc(var(--baseline)*1.5)] flex gap-1 border-neutral-200 border-b">
        <Tabs.Trigger className={TAB_CLASSES} value="skills">
          {skills.length} Skills
        </Tabs.Trigger>
        <Tabs.Trigger className={TAB_CLASSES} value="agents">
          {agents.length} Agents
        </Tabs.Trigger>
        <Tabs.Trigger className={TAB_CLASSES} value="rules">
          {rules.length} Rules
        </Tabs.Trigger>
        <Tabs.Trigger className={TAB_CLASSES} value="disciplines">
          {disciplines.length} Disciplines
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="skills">
        <p className="mb-[calc(var(--baseline)*1)] max-w-lg text-pretty text-neutral-600 text-sm leading-relaxed">
          Skills are workflows and capabilities. Most are user-invokable via{" "}
          <span className="font-mono text-neutral-800">/arc:name</span>
          —they orchestrate the development process: gathering context, asking
          questions, spawning agents, and guiding implementation.
        </p>
        <SkillList onSkillClick={onSkillClick} skills={skills} />
      </Tabs.Content>

      <Tabs.Content value="agents">
        <p className="mb-[calc(var(--baseline)*1)] max-w-lg text-pretty text-neutral-600 text-sm leading-relaxed">
          Agents are specialists spawned by skills. Each has deep expertise in
          one domain: security, performance, architecture, or workflow
          automation. They run in parallel to maximize coverage while minimizing
          time.
        </p>
        <AgentList agents={agents} onAgentClick={onAgentClick} />
      </Tabs.Content>

      <Tabs.Content value="rules">
        <p className="mb-[calc(var(--baseline)*1)] max-w-lg text-pretty text-neutral-600 text-sm leading-relaxed">
          Opinionated coding rules using RFC 2119 terms (MUST/SHOULD/NEVER),
          kept as Arc-owned reference material for workflows to load
          selectively.
        </p>
        <RuleList onRuleClick={onRuleClick} rules={rules} />
      </Tabs.Content>

      <Tabs.Content value="disciplines">
        <p className="mb-[calc(var(--baseline)*1)] max-w-lg text-pretty text-neutral-600 text-sm leading-relaxed">
          Implementation methodologies that skills follow. Not what to build,
          but how to build it well.
        </p>
        <div className="grid gap-px sm:grid-cols-2">
          {disciplines.map((d) => (
            <div
              className="border-neutral-200 border-b py-[calc(var(--baseline)*0.75)] pr-4"
              key={d.slug}
            >
              <span className="font-mono text-neutral-900 text-sm">
                {d.name}
              </span>
            </div>
          ))}
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
}
