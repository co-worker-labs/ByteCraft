"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import { showToast } from "../../../libs/toast";
import { fromEvent } from "file-selector";
import { formatBytes } from "../../../utils/storage";
import { Button } from "../../../components/ui/button";
import { Plus, X, GripVertical, Eye, EyeOff, Download, RotateCw } from "lucide-react";
import RelatedTools from "../../../components/related-tools";
import PrivacyBanner from "../../../components/privacy-banner";
import DescriptionSection from "../../../components/description-section";
import { mergePdfs, getPdfPageCount } from "../../../libs/pdf-merge/merge";
import { renderThumbnail } from "../../../libs/pdf-merge/thumbnail";
import type { PdfFileEntry, MergeProgress } from "../../../libs/pdf-merge/types";

const THUMBNAIL_CONCURRENCY = 3;

function releaseEntry(entry: PdfFileEntry) {
  entry.thumbnailUrl = null;
  entry.arrayBuffer = new ArrayBuffer(0);
}

async function processFiles(
  files: File[],
  existingCount: number,
  onEntry: (entry: PdfFileEntry, index: number) => void
): Promise<void> {
  const entries: PdfFileEntry[] = [];

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    entries.push({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      pageCount: 0,
      thumbnailUrl: null,
      arrayBuffer,
      enabled: true,
    });
  }

  let running = 0;
  let idx = 0;

  await new Promise<void>((resolve) => {
    function next() {
      while (running < THUMBNAIL_CONCURRENCY && idx < entries.length) {
        const entry = entries[idx];
        const currentIdx = existingCount + idx;
        idx++;
        running++;

        (async () => {
          try {
            entry.pageCount = await getPdfPageCount(entry.arrayBuffer);
          } catch {
            entry.pageCount = 0;
          }
          onEntry(entry, currentIdx);

          try {
            entry.thumbnailUrl = await renderThumbnail(entry.arrayBuffer);
            onEntry(entry, currentIdx);
          } catch {
            // thumbnail rendering failed — entry already has null thumbnailUrl
          }

          running--;
          if (running === 0 && idx >= entries.length) resolve();
          else next();
        })();
      }
      if (running === 0 && idx >= entries.length) resolve();
    }
    next();
  });
}

function Conversion() {
  const t = useTranslations("pdf-merge");
  const tc = useTranslations("common");

  const [files, setFiles] = useState<PdfFileEntry[]>([]);
  const [merging, setMerging] = useState(false);
  const [progress, setProgress] = useState<MergeProgress | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultPages, setResultPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  const dragItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);

  const filesRef = useRef<PdfFileEntry[]>([]);
  const resultBlobRef = useRef<Blob | null>(null);

  const enabledFiles = files.filter((f) => f.enabled);
  const totalPages = enabledFiles.reduce((sum, f) => sum + f.pageCount, 0);
  const canMerge = enabledFiles.length >= 2 && !merging;

  // Sync refs for cleanup and release on unmount
  useEffect(() => {
    filesRef.current = files;
  }, [files]);
  useEffect(() => {
    resultBlobRef.current = resultBlob;
  }, [resultBlob]);
  // Release all entries only on unmount
  useEffect(() => {
    return () => {
      for (const entry of filesRef.current) releaseEntry(entry);
      filesRef.current = [];
      resultBlobRef.current = null;
    };
  }, []);

  // Drag-and-drop file handling
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const onDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const dropped = await fromEvent(e);
      if (!dropped || dropped.length === 0) return;
      const pdfFiles = (dropped as File[]).filter((f) => f.name.toLowerCase().endsWith(".pdf"));
      if (pdfFiles.length === 0) {
        showToast(t("onlyPdfSupported"), "warning");
        return;
      }
      if (pdfFiles.length < (dropped as File[]).length) {
        showToast(t("onlyPdfSupported"), "warning");
      }
      await processFiles(pdfFiles, files.length, (entry, _idx) => {
        setFiles((prev) => {
          const existing = prev.findIndex((f) => f.id === entry.id);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = entry;
            return updated;
          }
          return [...prev, entry];
        });
      });
    };

    dropZone.addEventListener("dragover", onDragOver);
    dropZone.addEventListener("drop", onDrop);
    return () => {
      dropZone.removeEventListener("dragover", onDragOver);
      dropZone.removeEventListener("drop", onDrop);
    };
  }, [files.length, t]);

  async function handleFileInput(fileList: FileList | null, isAddMore = false) {
    if (!fileList || fileList.length === 0) return;
    const pdfFiles = Array.from(fileList).filter((f) => f.name.toLowerCase().endsWith(".pdf"));
    if (pdfFiles.length === 0) {
      showToast(t("onlyPdfSupported"), "warning");
      return;
    }
    const startIdx = isAddMore ? files.length : 0;
    await processFiles(pdfFiles, startIdx, (entry, _idx) => {
      setFiles((prev) => {
        const existing = prev.findIndex((f) => f.id === entry.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = entry;
          return updated;
        }
        return [...prev, entry];
      });
    });
  }

  function handleDelete(id: string) {
    setFiles((prev) => {
      const entry = prev.find((f) => f.id === id);
      if (entry) releaseEntry(entry);
      return prev.filter((f) => f.id !== id);
    });
  }

  function handleToggle(id: string) {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)));
  }

  function handleDragStart(index: number) {
    dragItemRef.current = index;
  }

  function handleDragEnter(index: number) {
    dragOverItemRef.current = index;
  }

  function handleDragEnd() {
    if (dragItemRef.current === null || dragOverItemRef.current === null) return;
    const from = dragItemRef.current;
    const to = dragOverItemRef.current;
    if (from === to) return;

    setFiles((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });

    dragItemRef.current = null;
    dragOverItemRef.current = null;
  }

  async function handleMerge() {
    if (!canMerge) return;
    const pagesAtMerge = totalPages;
    const buffers = enabledFiles.map((f) => f.arrayBuffer);
    setMerging(true);
    setProgress(null);
    setError(null);
    setResultBlob(null);
    setResultPages(0);

    try {
      const result = await mergePdfs(buffers, (current, total) => {
        setProgress({ current, total });
      });
      const blob = new Blob([new Uint8Array(result)], { type: "application/pdf" });
      setResultBlob(blob);
      setResultPages(pagesAtMerge);
      for (const entry of files) releaseEntry(entry);
      setFiles([]);
    } catch (e) {
      setError(t("mergeFailed"));
      showToast(t("mergeFailed"), "danger");
    } finally {
      setMerging(false);
      setProgress(null);
    }
  }

  function handleDownload() {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "merged.pdf";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function handleNewMerge() {
    for (const entry of files) releaseEntry(entry);
    setFiles([]);
    setResultBlob(null);
    setResultPages(0);
    setError(null);
    setProgress(null);
    setMerging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (addMoreInputRef.current) addMoreInputRef.current.value = "";
  }

  // Result state
  if (resultBlob) {
    return (
      <section className="mt-4">
        <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan-dim/10 p-6 text-center">
          <div className="text-2xl mb-2">✅</div>
          <p className="text-fg-primary font-semibold text-lg mb-2">{t("mergeSuccess")}</p>
          <p className="text-fg-secondary text-sm mb-6">
            {t("mergedResult", {
              name: "merged.pdf",
              pages: resultPages,
              size: formatBytes(resultBlob.size),
            })}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="primary" size="md" onClick={handleDownload}>
              <Download size={16} className="me-1.5" />
              {t("download")}
            </Button>
            <Button variant="outline" size="md" onClick={handleNewMerge}>
              <RotateCw size={16} className="me-1.5" />
              {t("newMerge")}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Empty state — drop zone
  const dropZone = (
    <div
      ref={dropZoneRef}
      className="relative text-xl rounded-lg border-2 border-dashed border-accent-cyan/30 bg-accent-cyan-dim/10 text-accent-cyan"
      style={{ width: "100%", height: "12rem" }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center px-4 pointer-events-none">
        <span className="text-3xl mb-2">📑</span>
        <span className="font-bold">{t("dropPdf")}</span>
        <span className="text-sm mt-1 text-accent-cyan/70">{t("supportedFormats")}</span>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
        onClick={() => {
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        onChange={(e) => handleFileInput(e.target.files)}
      />
    </div>
  );

  return (
    <section className="mt-4">
      {files.length === 0 ? (
        dropZone
      ) : (
        <>
          {/* File list */}
          <div className="space-y-2">
            {files.map((file, index) => (
              /* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- drag-and-drop reorder */
              <div
                key={file.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`flex items-center gap-3 rounded-lg border border-border-default bg-bg-surface p-3 transition-opacity ${
                  !file.enabled ? "opacity-50" : ""
                }`}
              >
                {/* Drag handle */}
                <button
                  type="button"
                  className="cursor-grab text-fg-muted hover:text-fg-secondary shrink-0"
                  aria-label="Drag to reorder"
                >
                  <GripVertical size={18} />
                </button>

                {/* Thumbnail */}
                <div className="w-[60px] h-[80px] shrink-0 rounded border border-border-default bg-bg-input flex items-center justify-center overflow-hidden">
                  {file.thumbnailUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element -- data URL thumbnail */
                    <img
                      src={file.thumbnailUrl}
                      alt={file.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-5 h-5 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-fg-primary truncate">{file.name}</p>
                  <p className="text-xs text-fg-muted mt-0.5">
                    {file.pageCount > 0 ? t("pages", { count: file.pageCount }) : "..."} ·{" "}
                    {formatBytes(file.size, 1000, 2)}
                  </p>
                </div>

                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggle(file.id)}
                  className="shrink-0 text-fg-muted hover:text-fg-secondary transition-colors"
                  title={file.enabled ? "Exclude from merge" : "Include in merge"}
                >
                  {file.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(file.id)}
                  className="shrink-0 text-fg-muted hover:text-danger transition-colors"
                  title="Remove"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Add more button + file/page count */}
          <div className="mt-3 flex items-center justify-between">
            <div>
              <input
                ref={addMoreInputRef}
                type="file"
                accept=".pdf"
                multiple
                className="hidden"
                onChange={(e) => handleFileInput(e.target.files, true)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (addMoreInputRef.current) addMoreInputRef.current.click();
                }}
              >
                <Plus size={14} className="me-1" />
                {t("addMoreFiles")}
              </Button>
            </div>
            <div className="text-sm text-fg-secondary">
              <span className="font-medium">
                {t("mergeButtonInfo", { count: enabledFiles.length, pages: totalPages })}
              </span>
              {files.length - enabledFiles.length > 0 && (
                <span className="ml-2 text-fg-muted">
                  ({t("excludedCount", { count: files.length - enabledFiles.length })})
                </span>
              )}
            </div>
          </div>

          {/* Merge progress bar */}
          {merging && progress && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-fg-muted mb-1">
                <span>
                  {t("mergeProgress", { current: progress.current, total: progress.total })}
                </span>
                <span>{Math.round((progress.current / progress.total) * 100)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-bg-input overflow-hidden">
                <div
                  className="h-full bg-accent-cyan rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Merge button */}
          <div className="mt-4 flex justify-center">
            <Button
              variant="primary"
              size="lg"
              disabled={!canMerge}
              onClick={handleMerge}
              className="w-full max-w-md rounded-full uppercase font-bold"
            >
              {merging ? t("merging") : t("mergeButton")}
            </Button>
          </div>

          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </>
      )}
    </section>
  );
}

function Description() {
  return <DescriptionSection namespace="pdf-merge" />;
}

export default function PdfMergePage() {
  const t = useTranslations("tools");
  const title = t("pdf-merge.shortTitle");
  return (
    <Layout title={title} categoryLabel={t("categories.visual")} categorySlug="visual-media">
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner variant="files" />
        <Conversion />
        <Description />
        <RelatedTools currentTool="pdf-merge" />
      </div>
    </Layout>
  );
}
