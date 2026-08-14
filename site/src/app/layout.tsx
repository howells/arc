import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { mono, sans } from "@/lib/fonts";

export const metadata: Metadata = {
  description:
    "Arc is a deprecated software development workflow archive. For maintained, focused agent skills, use Howells Skills.",
  metadataBase: new URL("https://usearc.dev"),
  openGraph: {
    description:
      "Arc is a deprecated software development workflow archive. For maintained, focused agent skills, use Howells Skills.",
    locale: "en_US",
    siteName: "Arc",
    title: "Arc – Deprecated workflow archive",
    type: "website",
    url: "https://usearc.dev",
  },
  title: "Arc – Deprecated workflow archive",
  twitter: {
    card: "summary_large_image",
    creator: "@howells",
    description:
      "Arc is a deprecated software development workflow archive. For maintained, focused agent skills, use Howells Skills.",
    title: "Arc – Deprecated workflow archive",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={`${sans.variable} ${mono.variable} min-h-svh touch-manipulation`}
      lang="en"
    >
      <body className="isolate break-words bg-neutral-100 text-neutral-950 antialiased">
        <aside className="bg-neutral-950 px-5 py-3 text-center text-neutral-200 text-sm leading-relaxed">
          <strong className="font-medium text-white">Arc is deprecated.</strong>{" "}
          It remains available as an archive, but is no longer maintained. For
          maintained, focused agent skills, use{" "}
          <a
            className="underline decoration-neutral-500 underline-offset-4 transition-colors hover:decoration-neutral-200"
            href="https://github.com/howells/skills"
            rel="noopener noreferrer"
            target="_blank"
          >
            Howells Skills
          </a>
          .
        </aside>
        {children}
      </body>
    </html>
  );
}
