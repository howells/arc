"use client";

// oxlint-disable-next-line import/no-namespace -- Radix UI requires namespace import
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
        <Tabs.Trigger className={TAB_TRIGGER_CLASSES} value="cursor">
          Cursor
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
            </p>
          </div>
        </div>
      </Tabs.Content>

      {/* Codex */}
      <Tabs.Content value="codex">
        <div className="max-w-lg space-y-[calc(var(--baseline)*1)]">
          <div>
            <h3 className="mb-[calc(var(--baseline)*0.5)] font-mono text-neutral-500 text-xs uppercase tracking-wider">
              Native plugin (recommended)
            </h3>
            <CodeBlock command="codex plugin marketplace add howells/arc && codex plugin add arc@howells" />
            <p className="mt-[calc(var(--baseline)*0.5)] text-pretty text-neutral-500 text-xs leading-relaxed">
              Full-runtime install into Codex&apos;s isolated plugin cache.
              Requires Codex CLI 0.117+.
            </p>
          </div>
          <div>
            <h3 className="mb-[calc(var(--baseline)*0.5)] font-mono text-neutral-500 text-xs uppercase tracking-wider">
              Clone-and-symlink fallback
            </h3>
            <CodeBlock command="curl -fsSL https://raw.githubusercontent.com/howells/arc/main/.codex/install.sh | bash -s -- --auto-update --interval-hours 6" />
            <p className="mt-[calc(var(--baseline)*0.5)] text-pretty text-neutral-500 text-xs leading-relaxed">
              For older Codex builds. Symlinks skills into{" "}
              <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.9375em]">
                ~/.agents/skills
              </code>
              .
            </p>
          </div>
        </div>
      </Tabs.Content>

      {/* Cursor */}
      <Tabs.Content value="cursor">
        <div className="max-w-lg space-y-[calc(var(--baseline)*1)]">
          <div>
            <h3 className="mb-[calc(var(--baseline)*0.5)] font-mono text-neutral-500 text-xs uppercase tracking-wider">
              Local plugin
            </h3>
            <CodeBlock command="git clone https://github.com/howells/arc.git ~/.cursor/plugins/local/arc" />
            <p className="mt-[calc(var(--baseline)*0.5)] text-pretty text-neutral-500 text-xs leading-relaxed">
              Full-runtime Cursor plugin (Cursor 2.5+): skills, commands,
              agents, and bundled references. Reload Cursor (
              <span className="font-mono">Developer: Reload Window</span>
              ), then invoke{" "}
              <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.9375em]">
                /ideate
              </code>
              ,{" "}
              <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.9375em]">
                /implement
              </code>
              ,{" "}
              <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.9375em]">
                /audit
              </code>{" "}
              — no{" "}
              <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.9375em]">
                /arc:
              </code>{" "}
              prefix. On Teams/Enterprise, import{" "}
              <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.9375em]">
                github.com/howells/arc
              </code>{" "}
              from the Cursor dashboard.
            </p>
          </div>
          <div>
            <h3 className="mb-[calc(var(--baseline)*0.5)] font-mono text-neutral-500 text-xs uppercase tracking-wider">
              From a checkout
            </h3>
            <CodeBlock command="bash .cursor/install.sh" />
            <p className="mt-[calc(var(--baseline)*0.5)] text-pretty text-neutral-500 text-xs leading-relaxed">
              Symlinks the current repo into{" "}
              <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.9375em]">
                ~/.cursor/plugins/local/arc
              </code>
              .
            </p>
          </div>
          <div>
            <h3 className="mb-[calc(var(--baseline)*0.5)] font-mono text-neutral-500 text-xs uppercase tracking-wider">
              Update
            </h3>
            <CodeBlock command="git -C ~/.cursor/plugins/local/arc pull" />
            <p className="mt-[calc(var(--baseline)*0.5)] text-pretty text-neutral-500 text-xs leading-relaxed">
              Symlink installs update when you pull the linked checkout. Then
              reload Cursor.
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
              the Claude, Codex, or Cursor plugin tabs above.
            </p>
          </div>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
}
