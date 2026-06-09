import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getSkillByName, getSkills, sanitizeContent } from "@/lib/content";

import { DocumentContent } from "../../document-content";

export function generateStaticParams() {
  return getSkills().map((s) => ({ name: s.name }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const skill = getSkillByName(name);
  if (!skill) {
    return {};
  }

  const title = skill.invokable ? `/arc:${skill.name}` : skill.name;
  return {
    alternates: { canonical: `/skills/${name}` },
    description: skill.desc,
    openGraph: {
      description: skill.desc,
      title: `${title} – Arc`,
      url: `/skills/${name}`,
    },
    title: `${title} – Arc`,
  };
}

export default async function SkillPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const skill = getSkillByName(name);
  if (!skill) {
    notFound();
  }

  const title = skill.invokable ? `/arc:${skill.name}` : skill.name;
  const cleaned = sanitizeContent(skill.content);

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
          <h1 className="flex items-center gap-2 font-mono text-lg text-neutral-900">
            {title}
            {!skill.invokable && (
              <span className="rounded bg-neutral-200 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500 leading-none">
                internal
              </span>
            )}
          </h1>
          <p className="mt-2 text-neutral-500 text-sm">{skill.desc}</p>
        </header>

        {/* Structured overview */}
        <div className="mb-[calc(var(--baseline)*2)] space-y-[calc(var(--baseline)*1.5)]">
          <section>
            <h3 className="mb-[calc(var(--baseline)*0.5)] flex items-center gap-3 text-sm">
              <span className="text-[var(--color-accent)]">—</span>
              <span className="text-neutral-900">What it does</span>
            </h3>
            <p className="pl-6 text-neutral-600 text-sm leading-relaxed">
              {skill.what}
            </p>
          </section>

          <section>
            <h3 className="mb-[calc(var(--baseline)*0.5)] flex items-center gap-3 text-sm">
              <span className="text-[var(--color-accent)]">—</span>
              <span className="text-neutral-900">Why it exists</span>
            </h3>
            <p className="pl-6 text-neutral-600 text-sm leading-relaxed">
              {skill.why}
            </p>
          </section>

          {skill.decisions && skill.decisions.length > 0 && (
            <section>
              <h3 className="mb-[calc(var(--baseline)*0.5)] flex items-center gap-3 text-sm">
                <span className="text-[var(--color-accent)]">—</span>
                <span className="text-neutral-900">Design decisions</span>
              </h3>
              <ul className="space-y-[calc(var(--baseline)*0.25)] pl-6">
                {skill.decisions.map((decision) => (
                  <li
                    className="flex gap-3 text-neutral-600 text-sm leading-relaxed"
                    key={decision}
                  >
                    <span className="select-none text-[var(--color-accent)]">
                      —
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
                <span className="text-[var(--color-accent)]">—</span>
                <span className="text-neutral-900">Agents</span>
              </h3>
              <div className="flex flex-wrap gap-2 pl-6">
                {skill.agents.map((agentName) => (
                  <Link
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-mono text-neutral-600 text-xs transition-colors hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/8 hover:text-[var(--color-accent)]"
                    href={`/agents/${agentName}`}
                    key={agentName}
                  >
                    {agentName}
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
