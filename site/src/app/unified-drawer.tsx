"use client";

import { createStacksheet, useSheetPanel } from "@patternmode/stacksheet";
import { ArrowRight, ChevronLeft, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { sanitizeContent } from "@/lib/sanitize";
import type { Agent, Rule, Skill } from "@/lib/types";
import { AGENT_CATEGORY_LABELS } from "@/lib/types";

import { DocumentContent } from "./document-content";

const remarkPlugins = [remarkGfm];
const HEADING_REGEX = /^#\s+.+\n+/;

type DrawerContent =
  | { type: "skill"; data: Skill }
  | { type: "agent"; data: Agent }
  | { type: "rule"; data: Rule };

interface ArcSheetMap {
  detail: {
    content: DrawerContent;
    skillsByName: Record<string, Skill>;
    agentsByName: Record<string, Agent>;
  };
  source: {
    contentUrl: string;
    sourceContent: string;
  };
}

const { StacksheetProvider, useSheet } = createStacksheet<ArcSheetMap>({
  ariaLabel: "Arc details",
  closeOnBackdrop: true,
  closeOnEscape: true,
  maxWidth: "100vw",
  onCloseComplete: () => {
    if (typeof window === "undefined") {
      return;
    }
    const path = window.location.pathname;
    if (
      path.startsWith("/skills/") ||
      path.startsWith("/agents/") ||
      path.startsWith("/rules/")
    ) {
      window.history.replaceState(null, "", "/");
    }
  },
  spring: "stiff",
  width: 640,
});

export function ArcSheetsProvider({ children }: { children: ReactNode }) {
  return (
    <StacksheetProvider
      classNames={{
        backdrop: "bg-black/20",
        panel:
          "overflow-hidden bg-white shadow-[-16px_0_64px_-16px_rgba(0,0,0,0.18)]",
      }}
      renderHeader={false}
      sheets={SHEET_COMPONENTS}
    >
      {children}
    </StacksheetProvider>
  );
}

export function useArcSheets() {
  return useSheet();
}

export function getContentId(content: DrawerContent): string {
  switch (content.type) {
    case "skill": {
      return `skill:${content.data.name}`;
    }
    case "agent": {
      return `agent:${content.data.name}`;
    }
    case "rule": {
      return `rule:${content.data.slug}`;
    }
    default: {
      return "detail";
    }
  }
}

function getContentUrl(content: DrawerContent): string {
  switch (content.type) {
    case "skill": {
      return `/skills/${content.data.name}`;
    }
    case "agent": {
      return `/agents/${content.data.name}`;
    }
    case "rule": {
      return `/rules/${content.data.slug}`;
    }
    default: {
      return "/";
    }
  }
}

function getSourceContent(content: DrawerContent): string | null {
  switch (content.type) {
    case "skill": {
      return content.data.content;
    }
    case "agent": {
      return content.data.content;
    }
    case "rule": {
      return content.data.content;
    }
    default: {
      return null;
    }
  }
}

function DetailSheet({
  content,
  skillsByName,
  agentsByName,
}: ArcSheetMap["detail"]) {
  const { close } = useSheetPanel();
  const { navigate, push } = useSheet();

  const contentUrl = getContentUrl(content);

  const openAgentByName = (name: string) => {
    const agent = agentsByName[name];
    if (!agent) {
      return;
    }

    const nextContent: DrawerContent = { data: agent, type: "agent" };
    navigate("detail", getContentId(nextContent), {
      agentsByName,
      content: nextContent,
      skillsByName,
    });
  };

  const openSkillByName = (name: string) => {
    const skill = skillsByName[name];
    if (!skill) {
      return;
    }

    const nextContent: DrawerContent = { data: skill, type: "skill" };
    navigate("detail", getContentId(nextContent), {
      agentsByName,
      content: nextContent,
      skillsByName,
    });
  };

  const openSource = () => {
    const rawSource = getSourceContent(content);
    if (!rawSource) {
      return;
    }

    push("source", `${getContentId(content)}:source`, {
      contentUrl,
      sourceContent: sanitizeContent(rawSource),
    });
  };

  return (
    <div className="relative flex h-full flex-col bg-white">
      <button
        aria-label="Close drawer"
        className="absolute top-4 right-4 z-10 rounded-full bg-white/80 p-2 text-neutral-500 backdrop-blur-sm transition-colors hover:bg-white hover:text-neutral-900"
        onClick={close}
        type="button"
      >
        <X className="size-5" />
      </button>

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-8 md:px-10 md:py-10">
          <ContentRenderer
            content={content}
            onAgentClick={openAgentByName}
            onSkillClick={openSkillByName}
            onViewSource={openSource}
          />
        </div>
      </div>
    </div>
  );
}

function SourceSheet({ contentUrl, sourceContent }: ArcSheetMap["source"]) {
  const { back, close } = useSheetPanel();

  useEffect(() => {
    window.history.pushState(null, "", contentUrl);
  }, [contentUrl]);

  return (
    <div className="relative flex h-full flex-col bg-white">
      <button
        aria-label="Close drawer"
        className="absolute top-4 right-4 z-10 rounded-full bg-white/80 p-2 text-neutral-500 backdrop-blur-sm transition-colors hover:bg-white hover:text-neutral-900"
        onClick={close}
        type="button"
      >
        <X className="size-5" />
      </button>

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-8 pr-14 md:px-10 md:py-10 md:pr-16">
          <button
            className="mb-[calc(var(--baseline)*1)] inline-flex items-center gap-1 font-mono text-neutral-400 text-xs transition-colors hover:text-[var(--color-accent)]"
            onClick={back}
            type="button"
          >
            <ChevronLeft className="size-3" />
            Back
          </button>

          <h2 className="mb-[calc(var(--baseline)*1)] font-mono text-neutral-400 text-xs uppercase tracking-wider">
            Source document
          </h2>

          <div className="prose">
            <Markdown remarkPlugins={remarkPlugins}>{sourceContent}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}

const SHEET_COMPONENTS = {
  detail: DetailSheet,
  source: SourceSheet,
};

function ContentRenderer({
  content,
  onAgentClick,
  onSkillClick,
  onViewSource,
}: {
  content: DrawerContent;
  onAgentClick?: (name: string) => void;
  onSkillClick?: (name: string) => void;
  onViewSource: () => void;
}) {
  switch (content.type) {
    case "skill": {
      return (
        <SkillContent
          onAgentClick={onAgentClick}
          onViewSource={onViewSource}
          skill={content.data}
        />
      );
    }
    case "agent": {
      return (
        <AgentContent
          agent={content.data}
          onSkillClick={onSkillClick}
          onViewSource={onViewSource}
        />
      );
    }
    case "rule": {
      return <RuleContent onViewSource={onViewSource} rule={content.data} />;
    }
    default: {
      return null;
    }
  }
}

function ViewSourceButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="mt-[calc(var(--baseline)*2)] border-neutral-200 border-t pt-[calc(var(--baseline)*1)]">
      <button
        className="group inline-flex items-center gap-2 font-mono text-neutral-500 text-xs transition-colors hover:text-[var(--color-accent)]"
        onClick={onClick}
        type="button"
      >
        View source document
        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}

function SkillContent({
  skill,
  onAgentClick,
  onViewSource,
}: {
  skill: Skill;
  onAgentClick?: (name: string) => void;
  onViewSource: () => void;
}) {
  return (
    <>
      <header className="mb-[calc(var(--baseline)*1.5)] border-neutral-200 border-b pb-[calc(var(--baseline)*1)]">
        <h2 className="flex items-center gap-2 font-mono text-neutral-900 text-sm">
          {skill.invokable ? (
            <>
              /arc:
              <span className="text-[var(--color-accent)]">{skill.name}</span>
            </>
          ) : (
            <span className="text-[var(--color-accent)]">{skill.name}</span>
          )}
          {!skill.invokable && (
            <span className="rounded bg-neutral-200 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500 leading-none">
              internal
            </span>
          )}
        </h2>
        <p className="mt-2 text-neutral-500 text-sm">{skill.desc}</p>
      </header>

      <div className="space-y-[calc(var(--baseline)*1.5)]">
        <section>
          <h3 className="mb-[calc(var(--baseline)*0.5)] flex items-center gap-3 text-sm">
            <span className="text-[var(--color-accent)]">-</span>
            <span className="text-neutral-900">What it does</span>
          </h3>
          <p className="pl-6 text-neutral-600 text-sm leading-relaxed">
            {skill.what}
          </p>
        </section>

        <section>
          <h3 className="mb-[calc(var(--baseline)*0.5)] flex items-center gap-3 text-sm">
            <span className="text-[var(--color-accent)]">-</span>
            <span className="text-neutral-900">Why it exists</span>
          </h3>
          <p className="pl-6 text-neutral-600 text-sm leading-relaxed">
            {skill.why}
          </p>
        </section>

        {skill.decisions && skill.decisions.length > 0 && (
          <section>
            <h3 className="mb-[calc(var(--baseline)*0.5)] flex items-center gap-3 text-sm">
              <span className="text-[var(--color-accent)]">-</span>
              <span className="text-neutral-900">Design decisions</span>
            </h3>
            <ul className="space-y-[calc(var(--baseline)*0.25)] pl-6">
              {skill.decisions.map((decision) => (
                <li
                  className="flex gap-3 text-neutral-600 text-sm leading-relaxed"
                  key={decision}
                >
                  <span className="select-none text-[var(--color-accent)]">
                    -
                  </span>
                  <span>{decision}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {skill.agents && skill.agents.length > 0 && (
          <section>
            <h3 className="mb-[calc(var(--baseline)*0.5)] flex items-center gap-3 text-sm">
              <span className="text-[var(--color-accent)]">-</span>
              <span className="text-neutral-900">Agents</span>
            </h3>
            <div className="flex flex-wrap gap-2 pl-6">
              {skill.agents.map((agentName) => (
                <button
                  className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-mono text-neutral-600 text-xs transition-colors hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/8 hover:text-[var(--color-accent)]"
                  key={agentName}
                  onClick={() => onAgentClick?.(agentName)}
                  type="button"
                >
                  {agentName}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <ViewSourceButton onClick={onViewSource} />
    </>
  );
}

function AgentContent({
  agent,
  onSkillClick,
  onViewSource,
}: {
  agent: Agent;
  onSkillClick?: (name: string) => void;
  onViewSource: () => void;
}) {
  return (
    <>
      <header className="mb-[calc(var(--baseline)*1.5)] border-neutral-200 border-b pb-[calc(var(--baseline)*1)]">
        <h2 className="font-mono text-neutral-900 text-sm">
          <span className="text-[var(--color-accent)]">{agent.name}</span>
        </h2>
        <p className="mt-2 text-neutral-500 text-sm">
          {AGENT_CATEGORY_LABELS[agent.category]}
        </p>
      </header>

      <div className="space-y-[calc(var(--baseline)*1.5)]">
        <section>
          <h3 className="mb-[calc(var(--baseline)*0.5)] flex items-center gap-3 text-sm">
            <span className="text-[var(--color-accent)]">-</span>
            <span className="text-neutral-900">What it does</span>
          </h3>
          <p className="pl-6 text-neutral-600 text-sm leading-relaxed">
            {agent.what}
          </p>
        </section>

        <section>
          <h3 className="mb-[calc(var(--baseline)*0.5)] flex items-center gap-3 text-sm">
            <span className="text-[var(--color-accent)]">-</span>
            <span className="text-neutral-900">Why it exists</span>
          </h3>
          <p className="pl-6 text-neutral-600 text-sm leading-relaxed">
            {agent.why}
          </p>
        </section>

        {agent.usedBy && agent.usedBy.length > 0 && (
          <section>
            <h3 className="mb-[calc(var(--baseline)*0.5)] flex items-center gap-3 text-sm">
              <span className="text-[var(--color-accent)]">-</span>
              <span className="text-neutral-900">Spawned by</span>
            </h3>
            <div className="flex flex-wrap gap-2 pl-6">
              {agent.usedBy.map((skillName) => (
                <button
                  className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-mono text-neutral-600 text-xs transition-colors hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/8 hover:text-[var(--color-accent)]"
                  key={skillName}
                  onClick={() => onSkillClick?.(skillName)}
                  type="button"
                >
                  /arc:{skillName}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <ViewSourceButton onClick={onViewSource} />
    </>
  );
}

function RuleContent({
  rule,
  onViewSource,
}: {
  rule: Rule;
  onViewSource: () => void;
}) {
  const body = rule.content.replace(HEADING_REGEX, "");

  return (
    <>
      <header className="mb-[calc(var(--baseline)*1.5)] border-neutral-200 border-b pb-[calc(var(--baseline)*1)]">
        <h2 className="font-mono text-neutral-900 text-sm">
          <span className="text-[var(--color-accent)]">{rule.title}</span>
        </h2>
        <p className="mt-2 text-neutral-500 text-sm">Rule</p>
      </header>

      <DocumentContent content={body} />

      <ViewSourceButton onClick={onViewSource} />
    </>
  );
}

export type { DrawerContent };
