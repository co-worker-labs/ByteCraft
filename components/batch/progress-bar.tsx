"use client";

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-fg-muted">
        <span>
          {current}/{total} processed
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-border-default rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-cyan rounded-full transition-all duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
