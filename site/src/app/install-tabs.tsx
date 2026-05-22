"use client";

// biome-ignore lint/performance/noNamespaceImport: Radix UI requires namespace import
import * as Tabs from "@radix-ui/react-tabs";
import Link from "next/link";
import { CopyButton } from "./copy-button";

function CodeBlock({
  command,
  light = true,
}: {
  command: string;
  light?: boolean;
}) {
  return (
    <div className="relative rounded bg-neutral-800">
      <div className="overflow-hidden px-4 py-3 pr-20 font-mono text-neutral-100 text-sm">
        <span className="flex min-w-0 items-center gap-2 whitespace-nowrap">
          <span className="shrink-0 text-neutral-500">$</span>
          <span className="truncate">{command}</span>
        </span>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-12 w-16 bg-gradient-to-l from-neutral-800 to-transparent"
      />
      <div className="absolute inset-y-0 right-4 flex items-center">
        <CopyButton light={light} text={command} />
      </div>
    </div>
  );
}

const TAB_TRIGGER_CLASSES =
  "border-transparent border-b-2 px-3 pb-2 font-mono text-neutral-400 text-xs uppercase tracking-wider transition-colors hover:text-neutral-600 data-[state=active]:border-[var(--color-accent)] data-[state=active]:text-neutral-900";

export function InstallTabs() {
  return (
    <Tabs.Root defaultValue="claude">
      <Tabs.List className="mb-[calc(var(--baseline)*1)] flex gap-1 border-neutral-200 border-b">
        <Tabs.Trigger className={TAB_TRIGGER_CLASSES} value="claude">
          Claude Code
        </Tabs.Trigger>
        <Tabs.Trigger className={TAB_TRIGGER_CLASSES} value="codex">
          Codex
        </Tabs.Trigger>
        <Tabs.Trigger className={TAB_TRIGGER_CLASSES} value="any">
          Any Agent
        </Tabs.Trigger>
      </Tabs.List>

      {/* Claude Code */}
      <Tabs.Content value="claude">
        <div className="max-w-lg space-y-[calc(var(--baseline)*1)]">
          <div>
            <h3 className="mb-[calc(var(--baseline)*0.5)] font-mono text-neutral-500 text-xs uppercase tracking-wider">
              Install
            </h3>
            <CodeBlock command="claude plugins install arc@howells" />
            <p className="mt-[calc(var(--baseline)*0.5)] text-pretty text-neutral-500 text-xs leading-relaxed">
              Full plugin: skills, agents, commands, references, and
              disciplines. Requires{" "}
              <Link
                className="prose-link"
                href="https://docs.anthropic.com/en/docs/claude-code"
                rel="noopener noreferrer"
                target="_blank"
              >
                Claude Code
              </Link>{" "}
              2.1.16+.
            </p>
          </div>
          <div>
            <h3 className="mb-[calc(var(--baseline)*0.5)] font-mono text-neutral-500 text-xs uppercase tracking-wider">
              Update
            </h3>
            <CodeBlock command="claude plugins update arc@howells" />
            <p className="mt-[calc(var(--baseline)*0.5)] text-pretty text-neutral-500 text-xs leading-relaxed">
              Claude Code auto-updates plugins, but you can trigger it manually.
              In Cursor, use this command — it doesn&apos;t auto-update.
            </p>
          </div>
        </div>
      </Tabs.Content>

      {/* Codex */}
      <Tabs.Content value="codex">
        <div className="max-w-lg space-y-[calc(var(--baseline)*1)]">
          <div>
            <h3 className="mb-[calc(var(--baseline)*0.5)] font-mono text-neutral-500 text-xs uppercase tracking-wider">
              Install with auto-update
            </h3>
            <CodeBlock command="curl -fsSL https://raw.githubusercontent.com/howells/arc/main/.codex/install.sh | bash -s -- --auto-update --interval-hours 6" />
            <p className="mt-[calc(var(--baseline)*0.5)] text-pretty text-neutral-500 text-xs leading-relaxed">
              Installs to{" "}
              <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.9375em]">
                ~/.agents/skills
              </code>{" "}
              with auto-update every 6 hours. This is the full Codex install, so
              Arc workflows that depend on bundled agents, references,
              disciplines, templates, and scripts work out of the box.
            </p>
          </div>
          <div>
            <h3 className="mb-[calc(var(--baseline)*0.5)] font-mono text-neutral-500 text-xs uppercase tracking-wider">
              Install once (no auto-update)
            </h3>
            <CodeBlock command="curl -fsSL https://raw.githubusercontent.com/howells/arc/main/.codex/install.sh | bash" />
          </div>
          <div>
            <h3 className="mb-[calc(var(--baseline)*0.5)] font-mono text-neutral-500 text-xs uppercase tracking-wider">
              Manual update
            </h3>
            <CodeBlock command="~/.codex/arc/.codex/update.sh" />
            <p className="mt-[calc(var(--baseline)*0.5)] text-pretty text-neutral-500 text-xs leading-relaxed">
              If you installed with{" "}
              <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.9375em]">
                --auto-update
              </code>
              , this runs automatically on a schedule.
            </p>
          </div>
        </div>
      </Tabs.Content>

      {/* Any Agent */}
      <Tabs.Content value="any">
        <div className="max-w-lg space-y-[calc(var(--baseline)*1)]">
          <div>
            <h3 className="mb-[calc(var(--baseline)*0.5)] font-mono text-neutral-500 text-xs uppercase tracking-wider">
              Install via skills.sh
            </h3>
            <CodeBlock command="npx skills add howells/arc" />
            <p className="mt-[calc(var(--baseline)*0.5)] text-pretty text-neutral-500 text-xs leading-relaxed">
              Installs skill prompts to Claude Code, Codex, Cursor, Gemini CLI,
              Windsurf, Cline, and{" "}
              <Link
                className="prose-link"
                href="https://github.com/vercel-labs/skills#supported-agents"
                rel="noopener noreferrer"
                target="_blank"
              >
                40+ agents
              </Link>
              . This copies{" "}
              <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.9375em]">
                SKILL.md
              </code>{" "}
              files only — you get the skill instructions but not the supporting
              agents or orchestration. Best for lightweight prompt-only usage.
              Full-runtime workflows that load Arc-owned `agents/`,
              `references/`, `disciplines/`, `templates/`, or `scripts/` require
              the Claude plugin or Codex installer tabs above.
            </p>
          </div>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
}
