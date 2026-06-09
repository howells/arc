import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getRuleBySlug, getRules, sanitizeContent } from "@/lib/content";

import { DocumentContent } from "../../document-content";

const STRIP_HEADING_REGEX = /^#\s+.+\n+/;

export function generateStaticParams() {
  return getRules().map((r) => ({ slug: r.slug.split("/") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const rule = getRuleBySlug(slug.join("/"));
  if (!rule) {
    return {};
  }

  const description = `${rule.title} — coding rule for the Arc plugin.`;
  return {
    alternates: { canonical: `/rules/${slug.join("/")}` },
    description,
    openGraph: {
      description,
      title: `${rule.title} – Arc Rules`,
      url: `/rules/${slug.join("/")}`,
    },
    title: `${rule.title} – Arc Rules`,
  };
}

export default async function RulePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const rule = getRuleBySlug(slug.join("/"));
  if (!rule) {
    notFound();
  }

  // Strip the first heading (already shown in the header) and sanitize
  const body = rule.content.replace(STRIP_HEADING_REGEX, "");
  const cleaned = sanitizeContent(body);

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

        <header className="mb-[calc(var(--baseline)*2)] border-neutral-200 border-b pb-[calc(var(--baseline)*1)]">
          <h1 className="font-mono text-lg text-neutral-900">{rule.title}</h1>
          <p className="mt-2 text-neutral-500 text-sm">Rule</p>
        </header>

        <DocumentContent content={cleaned} />
      </div>
    </main>
  );
}
