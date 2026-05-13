"use client";

import { useTranslations } from "next-intl";
import type { BatchResultItem, BatchInputItem } from "../../libs/batch/types";
import type { DataType } from "../../libs/recipe/types";

interface BatchSummaryProps {
  results: BatchResultItem[];
  inputs: BatchInputItem[];
  outputType: DataType;
  duration: number;
}

export default function BatchSummary({ results, inputs, outputType, duration }: BatchSummaryProps) {
  const t = useTranslations("batch");

  if (results.length === 0) return null;

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;
  const timeStr = (duration / 1000).toFixed(1);

  const totalSaved =
    outputType === "image" && successCount > 0 ? computeSavings(results, inputs) : null;

  return (
    <div className="mt-3 flex items-center gap-4 text-xs text-fg-muted">
      <span className="text-fg-secondary font-medium">
        {t("summary.success", { success: successCount, total: results.length })}
      </span>
      {errorCount > 0 && (
        <span className="text-danger">{t("summary.errors", { errors: errorCount })}</span>
      )}
      <span>{t("summary.duration", { time: timeStr })}</span>
      {totalSaved && (
        <span className="text-accent-cyan">
          {t("summary.totalSaved", {
            before: formatSize(totalSaved.before),
            after: formatSize(totalSaved.after),
            percent: totalSaved.percent,
          })}
        </span>
      )}
    </div>
  );
}

function computeSavings(
  results: BatchResultItem[],
  inputs: BatchInputItem[]
): { before: number; after: number; percent: number } | null {
  let before = 0;
  let after = 0;
  for (const r of results) {
    if (r.status !== "success" || !r.output) continue;
    const input = inputs.find((i) => i.id === r.id);
    if (!input) continue;
    before += input.size;
    if (r.output.startsWith("data:")) {
      const base64 = r.output.split(",")[1] ?? "";
      after += Math.ceil((base64.length * 3) / 4);
    } else {
      after += new TextEncoder().encode(r.output).byteLength;
    }
  }
  if (before === 0) return null;
  return { before, after, percent: Math.round(((before - after) / before) * 100) };
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
