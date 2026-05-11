"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
      <h1 className="text-2xl font-bold text-fg-primary">Something went wrong</h1>
      <p className="text-fg-secondary text-sm">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-full bg-accent-cyan px-6 py-2 text-sm font-semibold text-bg-base hover:bg-accent-cyan/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
