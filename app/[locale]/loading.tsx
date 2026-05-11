export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
      <p className="text-fg-muted text-sm">Loading...</p>
    </div>
  );
}
