"use client";

import { useTranslations } from "next-intl";
import { Download, FileArchive } from "lucide-react";
import type { BatchResultItem, BatchInputItem } from "../../libs/batch/types";
import type { DataType } from "../../libs/recipe/types";
import { CopyButton } from "../ui/copy-btn";
import { Button } from "../ui/button";
import ResultItem from "./result-item";
import { mergeTextResults, createZipFromResults, downloadBlob } from "../../libs/batch/output";

interface ResultPanelProps {
  results: BatchResultItem[];
  inputs: BatchInputItem[];
  outputType: DataType;
  filenameTemplate: string;
}

export default function ResultPanel({
  results,
  inputs,
  outputType,
  filenameTemplate,
}: ResultPanelProps) {
  const t = useTranslations("batch");
  const successCount = results.filter((r) => r.status === "success").length;

  async function handleDownloadZip() {
    const blob = await createZipFromResults(results, filenameTemplate, inputs);
    downloadBlob(blob, "batch-output.zip");
  }

  function handleDownloadText() {
    const text = mergeTextResults(results);
    const blob = new Blob([text], { type: "text/plain" });
    downloadBlob(blob, "batch-output.txt");
  }

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface">
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="text-sm font-semibold text-fg-primary">
          {t("resultPanel.title")}
          {results.length > 0 && (
            <span className="ml-2 text-xs font-normal text-fg-muted">
              {successCount}/{results.length}
            </span>
          )}
        </h3>
        {successCount > 0 && (
          <div className="flex items-center gap-2">
            {outputType === "text" && (
              <>
                <CopyButton
                  getContent={() => mergeTextResults(results)}
                  label={t("resultPanel.copyAll")}
                  toast={false}
                />
                <Button variant="secondary" size="sm" onClick={handleDownloadText}>
                  <Download size={12} />
                  {t("resultPanel.downloadAll")}
                </Button>
              </>
            )}
            {outputType === "image" && (
              <Button variant="secondary" size="sm" onClick={handleDownloadZip}>
                <FileArchive size={12} />
                {t("resultPanel.downloadZip")}
              </Button>
            )}
          </div>
        )}
      </div>

      {results.length === 0 ? (
        <div className="px-4 pb-4">
          <p className="text-xs text-fg-muted">{t("resultPanel.noResults")}</p>
        </div>
      ) : (
        <div className="px-4 pb-4 space-y-1.5">
          {results.map((result) => {
            const input = inputs.find((i) => i.id === result.id);
            return (
              <ResultItem
                key={result.id}
                item={result}
                inputName={input?.name ?? ""}
                outputType={outputType}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
