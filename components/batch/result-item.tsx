"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, Download } from "lucide-react";
import type { BatchResultItem as BatchResultItemType } from "../../libs/batch/types";
import type { DataType } from "../../libs/recipe/types";
import { CopyButton } from "../ui/copy-btn";

interface ResultItemProps {
  item: BatchResultItemType;
  inputName: string;
  outputType: DataType;
}

export default function ResultItem({ item, inputName, outputType }: ResultItemProps) {
  const t = useTranslations("recipe");

  if (item.status === "error") {
    return (
      <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/5 border border-danger/20">
        <AlertCircle size={13} className="text-danger shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-fg-secondary truncate">{inputName}</p>
          <p className="text-xs text-danger mt-0.5">
            {t.has(`errors.${item.error}`) ? t(`errors.${item.error}`) : item.error}
          </p>
        </div>
      </div>
    );
  }

  const output = item.output ?? "";

  if (outputType === "image" && output.startsWith("data:")) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-default/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={output} alt={inputName} className="max-h-10 rounded object-contain shrink-0" />
        <span className="flex-1 text-sm text-fg-primary truncate min-w-0">{inputName}</span>
        <button
          type="button"
          onClick={() => {
            const a = document.createElement("a");
            a.href = output;
            a.download = inputName;
            a.click();
          }}
          className="p-1.5 rounded-lg text-fg-muted hover:text-accent-cyan hover:bg-accent-cyan-dim/30 transition-all cursor-pointer"
          aria-label={t("output")}
        >
          <Download size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-default/50">
      <pre className="flex-1 text-xs font-mono text-fg-primary truncate min-w-0">
        {output.length > 500 ? output.slice(0, 500) + "..." : output}
      </pre>
      <CopyButton getContent={() => output} className="shrink-0" />
    </div>
  );
}
