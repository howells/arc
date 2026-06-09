"use client";

import { useMemo } from "react";

import type { Agent, Discipline, Rule, Skill } from "@/lib/types";

import { ContentBrowser } from "./content-browser";
import {
  ArcSheetsProvider,
  getContentId,
  useArcSheets,
} from "./unified-drawer";
import type { DrawerContent } from "./unified-drawer";

interface PageContentProps {
  agents: Agent[];
  disciplines: Discipline[];
  rules: Rule[];
  skills: Skill[];
}

function PageContentInner({
  skills,
  agents,
  rules,
  disciplines,
}: PageContentProps) {
  const { open } = useArcSheets();

  const skillsByName = useMemo(
    () => Object.fromEntries(skills.map((skill) => [skill.name, skill])),
    [skills]
  );

  const agentsByName = useMemo(
    () => Object.fromEntries(agents.map((agent) => [agent.name, agent])),
    [agents]
  );

  const openContent = (content: DrawerContent) => {
    open("detail", getContentId(content), {
      agentsByName,
      content,
      skillsByName,
    });
  };

  const openSkill = (skill: Skill) => {
    openContent({ data: skill, type: "skill" });
  };

  const openAgent = (agent: Agent) => {
    openContent({ data: agent, type: "agent" });
  };

  const openRule = (rule: Rule) => {
    openContent({ data: rule, type: "rule" });
  };

  return (
    <div className="mb-[calc(var(--baseline)*1.5)]">
      <ContentBrowser
        agents={agents}
        disciplines={disciplines}
        onAgentClick={openAgent}
        onRuleClick={openRule}
        onSkillClick={openSkill}
        rules={rules}
        skills={skills}
      />
    </div>
  );
}

export function PageContent({
  skills,
  agents,
  rules,
  disciplines,
}: PageContentProps) {
  return (
    <ArcSheetsProvider>
      <PageContentInner
        agents={agents}
        disciplines={disciplines}
        rules={rules}
        skills={skills}
      />
    </ArcSheetsProvider>
  );
}
