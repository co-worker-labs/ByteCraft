"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, FileUp, ChevronDown } from "lucide-react";
import type { BatchInputItem } from "../../libs/batch/types";
import { parseTextInput } from "../../libs/batch/input-parser";
import { useMultiFileDrop } from "../../hooks/use-multi-file-drop";
import { MAX_BATCH_ITEMS } from "../../libs/batch/engine";
import { Button } from "../ui/button";
import { StyledTextarea } from "../ui/input";

interface InputPanelProps {
  inputs: BatchInputItem[];
  onInputsChange: (inputs: BatchInputItem[]) => void;
  inputType: "text" | "image";
}

export default function InputPanel({ inputs, onInputsChange, inputType }: InputPanelProps) {
  const t = useTranslations("batch");
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePasteSubmit() {
    if (!pasteText.trim()) return;
    const newItems = parseTextInput(pasteText).slice(0, MAX_BATCH_ITEMS - inputs.length);
    onInputsChange([...inputs, ...newItems]);
    setPasteText("");
    setShowPaste(false);
  }

  function handleRemoveItem(id: string) {
    onInputsChange(inputs.filter((item) => item.id !== id));
  }

  function handleRemoveAll() {
    onInputsChange([]);
  }

  const handleFiles = useCallback(
    (files: File[]) => {
      const remaining = MAX_BATCH_ITEMS - inputs.length;
      const toProcess = files.slice(0, remaining);
      let loaded = 0;
      const newItems: BatchInputItem[] = [];

      toProcess.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          newItems.push({
            id: `batch-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name: file.name,
            content: reader.result as string,
            type: file.type.startsWith("image/") ? "image" : "text",
            size: file.size,
          });
          loaded++;
          if (loaded === toProcess.length) {
            onInputsChange([...inputs, ...newItems]);
          }
        };
        if (file.type.startsWith("image/")) {
          reader.readAsDataURL(file);
        } else {
          reader.readAsText(file);
        }
      });
    },
    [inputs, onInputsChange]
  );

  const { isDragging, onDragOver, onDragEnter, onDragLeave, onDrop } =
    useMultiFileDrop(handleFiles);

  return (
    <div
      role="region"
      aria-label={t("inputPanel.title")}
      className={`relative rounded-xl border bg-bg-surface transition-colors ${isDragging ? "border-accent-cyan" : "border-border-default"}`}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="text-sm font-semibold text-fg-primary">
          {t("inputPanel.title")}
          {inputs.length > 0 && (
            <span className="ml-2 text-xs font-normal text-fg-muted">
              {t("inputPanel.itemCount", { count: inputs.length })}
            </span>
          )}
        </h3>
        {inputs.length > 0 && (
          <button
            type="button"
            onClick={handleRemoveAll}
            className="text-xs text-danger hover:underline cursor-pointer"
          >
            {t("inputPanel.removeAll")}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 px-4 pb-3">
        {inputType === "text" && (
          <Button variant="outline-cyan" size="sm" onClick={() => setShowPaste(!showPaste)}>
            <Plus size={12} />
            {t("inputPanel.pasteText")}
          </Button>
        )}
        <Button variant="outline-cyan" size="sm" onClick={() => fileInputRef.current?.click()}>
          <FileUp size={12} />
          {t("inputPanel.dropFiles")}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length > 0) handleFiles(files);
            e.target.value = "";
          }}
        />
        {inputs.length >= MAX_BATCH_ITEMS && (
          <span className="text-xs text-danger">
            {t("inputPanel.maxItemsWarning", { max: MAX_BATCH_ITEMS })}
          </span>
        )}
      </div>

      {inputType === "text" && showPaste && (
        <div className="px-4 pb-3">
          <button
            type="button"
            className="flex items-center gap-1 mb-2 cursor-pointer text-xs text-fg-muted hover:text-fg-secondary"
            onClick={() => setShowPaste(false)}
          >
            <ChevronDown size={12} className="rotate-180" />
            <span>Close</span>
          </button>
          <StyledTextarea
            rows={4}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={t("inputPanel.pastePlaceholder")}
          />
          <div className="mt-2 flex justify-end">
            <Button variant="primary" size="sm" onClick={handlePasteSubmit}>
              {t("inputPanel.pasteText")}
            </Button>
          </div>
        </div>
      )}

      {inputs.length > 0 && (
        <div className="border-t border-border-default/60 max-h-64 overflow-y-auto">
          {inputs.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 px-4 py-2 border-b border-border-default/30 last:border-b-0 hover:bg-bg-elevated/50 transition-colors"
            >
              <span className="flex-1 text-sm text-fg-primary truncate min-w-0">{item.name}</span>
              <span className="text-[11px] text-fg-muted shrink-0">{formatSize(item.size)}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                className="p-1 rounded text-fg-muted/40 hover:text-danger hover:bg-red-500/10 transition-all duration-200 cursor-pointer shrink-0"
                aria-label={t("inputPanel.removeItem")}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-surface/80 rounded-xl pointer-events-none">
          <p className="text-sm text-accent-cyan font-medium">{t("inputPanel.dropFiles")}</p>
        </div>
      )}
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
