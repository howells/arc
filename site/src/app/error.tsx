"use client";

export default function ErrorBoundaryFallback({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-[calc(var(--baseline)*2)]">
      <div className="text-center">
        <p className="font-mono text-neutral-500 text-sm">Error</p>
        <h1 className="mt-2 font-bold font-mono text-4xl tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-4 text-neutral-600 text-sm">
          An unexpected error occurred.
        </p>
        <button
          className="mt-6 inline-block font-mono text-sm underline underline-offset-4 transition-colors hover:text-[var(--color-accent)]"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
