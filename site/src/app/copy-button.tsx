"use client";

import { useState } from "react";

interface CopyButtonProps {
  light?: boolean;
  text: string;
}

export function CopyButton({ text, light }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setFailed(true);
      setTimeout(() => {
        setFailed(false);
      }, 2000);
    }
  };

  const baseClasses =
    light === true
      ? "text-neutral-500 hover:text-neutral-300"
      : "text-neutral-400 hover:text-neutral-600";

  let stateClasses = baseClasses;
  if (copied) {
    stateClasses = "text-[var(--color-accent)]";
  } else if (failed) {
    stateClasses = "text-red-500";
  }

  let ariaLabel = "Copy to clipboard";
  if (copied) {
    ariaLabel = "Copied";
  } else if (failed) {
    ariaLabel = "Copy failed";
  }

  return (
    <>
      <button
        aria-label={ariaLabel}
        className={`transition-colors ${stateClasses}`}
        onClick={() => {
          void handleCopy();
        }}
        type="button"
      >
        {copied ? (
          <svg
            aria-hidden="true"
            fill="none"
            height="16"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            fill="none"
            height="16"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect height="14" rx="2" ry="2" width="14" x="8" y="8" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        )}
      </button>
      <output aria-live="polite" className="sr-only">
        {copied && "Copied to clipboard"}
        {failed && "Copy failed"}
      </output>
    </>
  );
}
