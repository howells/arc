"use client";

import type { ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const remarkPlugins = [remarkGfm];

const RFC_KEYWORD_REGEX = /^(MUST NOT|MUST|SHOULD NOT|SHOULD|NEVER|MAY):\s*/;

const keywordColors: Record<string, string> = {
  MAY: "text-neutral-500 bg-neutral-50 border-neutral-200",
  MUST: "text-[#3D6B5E] bg-[#EEF4F1] border-[#C8DCD4]",
  "MUST NOT": "text-[#8B4E55] bg-[#F5EEEF] border-[#DCC8CB]",
  NEVER: "text-[#8B4E55] bg-[#F5EEEF] border-[#DCC8CB]",
  SHOULD: "text-[#5A6B7B] bg-[#EEF1F5] border-[#C8D0DC]",
  "SHOULD NOT": "text-[#7B6A5A] bg-[#F3F0EC] border-[#DCD4C8]",
};

function RfcListItem({ children }: { children?: ReactNode }) {
  // Children is typically [string | ReactNode[]]
  // We need to check if the first text node starts with an RFC keyword
  const childArray = Array.isArray(children) ? children : [children];
  const first = childArray[0];

  if (typeof first === "string") {
    const match = first.match(RFC_KEYWORD_REGEX);
    if (match) {
      const keyword = match[1];
      const rest = first.slice(match[0].length);
      const colors = keywordColors[keyword] ?? keywordColors.MAY;
      return (
        <li
          className="flex items-start gap-2"
          style={{ listStyle: "none", marginLeft: "-1.5em" }}
        >
          <span
            className={`mt-[3px] shrink-0 rounded border px-1.5 py-px font-medium font-mono text-[10px] leading-tight ${colors}`}
          >
            {keyword}
          </span>
          <span>
            {rest}
            {childArray.slice(1)}
          </span>
        </li>
      );
    }
  }

  return <li>{children}</li>;
}

const markdownComponents = {
  li: RfcListItem,
};

interface DocumentContentProps {
  content: string;
}

export function DocumentContent({ content }: DocumentContentProps) {
  return (
    <div className="prose">
      <Markdown components={markdownComponents} remarkPlugins={remarkPlugins}>
        {content}
      </Markdown>
    </div>
  );
}
