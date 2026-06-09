import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { mono, sans } from "@/lib/fonts";

export const metadata: Metadata = {
  description:
    "A software development workflow for Claude Code and Codex. Commands and agents that handle vision, ideation, implementation, testing, review, refactoring, audit, launch, and commit.",
  metadataBase: new URL("https://usearc.dev"),
  openGraph: {
    description:
      "A software development workflow for Claude Code and Codex. Commands and agents that handle vision, ideation, implementation, testing, review, refactoring, audit, launch, and commit.",
    locale: "en_US",
    siteName: "Arc",
    title: "Arc – The full arc from idea to shipped code",
    type: "website",
    url: "https://usearc.dev",
  },
  title: "Arc – The full arc from idea to shipped code",
  twitter: {
    card: "summary_large_image",
    creator: "@howells",
    description:
      "A software development workflow for Claude Code and Codex. Commands and agents that handle vision, ideation, implementation, testing, review, refactoring, audit, launch, and commit.",
    title: "Arc – The full arc from idea to shipped code",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={`${sans.variable} ${mono.variable} min-h-svh touch-manipulation`}
      lang="en"
    >
      <body className="isolate break-words bg-neutral-100 text-neutral-950 antialiased">
        {children}
      </body>
    </html>
  );
}
