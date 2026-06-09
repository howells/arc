import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAgentByName, getAgents, sanitizeContent } from "@/lib/content";
import { AGENT_CATEGORY_LABELS } from "@/lib/types";

import { DocumentContent } from "../../document-content";

export function generateStaticParams() {
  return getAgents().map((a) => ({ name: a.name }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const agent = getAgentByName(name);
  if (!agent) {
    return {};
  }

  return {
    alternates: { canonical: `/agents/${name}` },
    description: agent.desc,
    openGraph: {
      description: agent.desc,
      title: `${agent.name} – Arc`,
      url: `/agents/${name}`,
    },
    title: `${agent.name} – Arc`,
  };
}

export default async function AgentPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const agent = getAgentByName(name);
  if (!agent) {
    notFound();
  }

  const cleaned = sanitizeContent(agent.content);

  return (
    <main className="min-h-screen p-[calc(var(--baseline)*1)] md:p-[calc(var(--baseline)*2)] lg:p-[calc(var(--baseline)*3)]">
      <div className="mx-auto max-w-3xl">
        <nav className="mb-[calc(var(--baseline)*2)]">
          <Link
            className="font-mono text-neutral-400 text-xs transition-colors hover:text-[var(--color-accent)]"
            href="/"
          >
            &larr; Arc
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-[calc(var(--baseline)*2)] border-neutral-200 border-b pb-[calc(var(--baseline)*1)]">
          <h1 className="font-mono text-lg text-neutral-900">{agent.name}</h1>
          <p className="mt-2 text-neutral-500 text-sm">
            {AGENT_CATEGORY_LABELS[agent.category]}
          </p>
        </header>

        {/* Structured overview */}
        <div className="mb-[calc(var(--baseline)*2)] space-y-[calc(var(--baseline)*1.5)]">
          <section>
            <h3 className="mb-[calc(var(--baseline)*0.5)] flex items-center gap-3 text-sm">
              <span className="text-[var(--color-accent)]">—</span>
              <span className="text-neutral-900">What it does</span>
            </h3>
            <p className="pl-6 text-neutral-600 text-sm leading-relaxed">
              {agent.what}
            </p>
          </section>

          <section>
            <h3 className="mb-[calc(var(--baseline)*0.5)] flex items-center gap-3 text-sm">
              <span className="text-[var(--color-accent)]">—</span>
              <span className="text-neutral-900">Why it exists</span>
            </h3>
            <p className="pl-6 text-neutral-600 text-sm leading-relaxed">
              {agent.why}
            </p>
          </section>

          {agent.usedBy && agent.usedBy.length > 0 && (
            <section>
              <h3 className="mb-[calc(var(--baseline)*0.5)] flex items-center gap-3 text-sm">
                <span className="text-[var(--color-accent)]">—</span>
                <span className="text-neutral-900">Spawned by</span>
              </h3>
              <div className="flex flex-wrap gap-2 pl-6">
                {agent.usedBy.map((skillName) => (
                  <Link
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-mono text-neutral-600 text-xs transition-colors hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/8 hover:text-[var(--color-accent)]"
                    href={`/skills/${skillName}`}
                    key={skillName}
                  >
                    /arc:{skillName}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Source document */}
        <div className="border-neutral-200 border-t pt-[calc(var(--baseline)*1.5)]">
          <h2 className="mb-[calc(var(--baseline)*1)] font-mono text-neutral-400 text-xs uppercase tracking-wider">
            Source document
          </h2>
          <DocumentContent content={cleaned} />
        </div>
      </div>
    </main>
  );
}
