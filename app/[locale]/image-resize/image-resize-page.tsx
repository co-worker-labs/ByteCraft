"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import PrivacyBanner from "../../../components/privacy-banner";
import DescriptionSection from "../../../components/description-section";
import RelatedTools from "../../../components/related-tools";
import { Download, Clipboard, RefreshCw } from "lucide-react";
import { StyledInput, StyledCheckbox } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { encode } from "../../../libs/image/encode";
import { calculateDimensions } from "../../../libs/image/resize";
import type { ResizeMode, OutputFormat } from "../../../libs/image/types";
import { resolveOutputFormat, formatKeyFromMime } from "../../../libs/image/types";
import { useImageInput } from "../../../components/image/useImageInput";
import { useImageExport } from "../../../components/image/useImageExport";
import ImageDropZone from "../../../components/image/ImageDropZone";
import ImageInfoBar from "../../../components/image/ImageInfoBar";
import "rc-slider/assets/index.css";

const Slider = dynamic(() => import("rc-slider"), {
  ssr: false,
  loading: () => <div className="h-6 w-full animate-pulse bg-bg-input rounded" />,
});

const sliderStyles = {
  rail: { backgroundColor: "var(--border-default)", height: 4 },
  track: { backgroundColor: "var(--accent-cyan)", height: 4 },
  handle: {
    borderColor: "var(--accent-cyan)",
    backgroundColor: "var(--bg-surface)",
    height: 16,
    width: 16,
    marginLeft: -6,
    marginTop: -6,
    boxShadow: "0 0 4px var(--accent-cyan)",
  },
};

function Conversion() {
  const t = useTranslations("image-resize");
  const tc = useTranslations("common");

  // Shared hooks
  const { sourceFile, sourceBitmap, handleFileSelect, handleReselect, dropZoneRef, fileInputRef } =
    useImageInput({ t });
  const outputFormat: OutputFormat = sourceFile ? resolveOutputFormat(sourceFile.type) : "png";
  const { handleDownload, handleCopy } = useImageExport({
    sourceFile,
    outputFormat,
    t,
    tc,
  });

  // Tool-specific state
  const [resizeMode, setResizeMode] = useState<ResizeMode>("percent");
  const [resizePercent, setResizePercent] = useState(100);
  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const stalenessId = useRef(0);
  const prevBlobUrlRef = useRef<string | null>(null);
  const initialLoadRef = useRef(true);

  // Encode pipeline with debounce
  useEffect(() => {
    if (!sourceBitmap) return;

    const dims = calculateDimensions(
      sourceBitmap.width,
      sourceBitmap.height,
      resizeMode,
      resizePercent,
      targetWidth,
      targetHeight,
      keepAspectRatio
    );

    const isInitial = initialLoadRef.current;
    initialLoadRef.current = false;

    let cancelled = false;
    const timer = setTimeout(
      async () => {
        if (cancelled) return;
        const callId = ++stalenessId.current;
        setProcessing(true);

        try {
          const blob = await encode(sourceBitmap, {
            format: outputFormat,
            quality: 100,
            width: dims.width,
            height: dims.height,
          });

          if (callId !== stalenessId.current) return;

          if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
          const url = URL.createObjectURL(blob);
          prevBlobUrlRef.current = url;
          setPreviewUrl(url);
          setResultBlob(blob);
        } catch {
          if (callId !== stalenessId.current) return;
        } finally {
          if (callId === stalenessId.current) setProcessing(false);
        }
      },
      isInitial ? 0 : 300
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    sourceBitmap,
    resizeMode,
    resizePercent,
    targetWidth,
    targetHeight,
    keepAspectRatio,
    outputFormat,
  ]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
    };
  }, []);

  // Full reselect handler (shared reset + tool-specific reset)
  function onReselect() {
    handleReselect();
    setResultBlob(null);
    setPreviewUrl(null);
    setProcessing(false);
    setResizeMode("percent");
    setResizePercent(100);
    setTargetWidth(0);
    setTargetHeight(0);
    setKeepAspectRatio(true);
    initialLoadRef.current = true;
  }

  const dims = sourceBitmap
    ? calculateDimensions(
        sourceBitmap.width,
        sourceBitmap.height,
        resizeMode,
        resizePercent,
        targetWidth,
        targetHeight,
        keepAspectRatio
      )
    : { width: 0, height: 0 };
  const savedPercent =
    sourceFile && resultBlob && sourceFile.size > 0
      ? Math.round((1 - resultBlob.size / sourceFile.size) * 100)
      : 0;

  // Drop zone view
  if (!sourceBitmap) {
    return (
      <ImageDropZone
        dropZoneRef={dropZoneRef}
        fileInputRef={fileInputRef}
        onInputChange={handleFileSelect}
        t={t}
      />
    );
  }

  return (
    <section className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Controls panel */}
        <div className="flex flex-col gap-4">
          {/* Resize mode */}
          <div>
            <label className="block text-sm font-medium text-fg-secondary mb-2">
              {t("resize")}
            </label>
            <div className="flex gap-1">
              {(["percent", "custom"] as ResizeMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`flex-1 px-2 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                    resizeMode === mode
                      ? "bg-accent-cyan text-bg-base"
                      : "border border-border-default text-fg-muted hover:text-fg-secondary hover:border-fg-muted"
                  }`}
                  onClick={() => {
                    if (mode === "custom" && resizeMode !== "custom" && sourceBitmap) {
                      const current = calculateDimensions(
                        sourceBitmap.width,
                        sourceBitmap.height,
                        resizeMode,
                        resizePercent,
                        targetWidth,
                        targetHeight,
                        keepAspectRatio
                      );
                      setTargetWidth(current.width);
                      setTargetHeight(current.height);
                    }
                    setResizeMode(mode);
                  }}
                >
                  {mode === "percent" ? t("byPercent") : t("customSize")}
                </button>
              ))}
            </div>
          </div>

          {/* Percent slider */}
          {resizeMode === "percent" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-fg-secondary">{t("byPercent")}</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={400}
                    value={resizePercent}
                    onChange={(e) =>
                      setResizePercent(Math.max(1, Math.min(400, Number(e.target.value))))
                    }
                    className="w-14 text-right font-mono text-sm font-bold text-accent-cyan bg-transparent border-b border-accent-cyan/40 outline-none focus:border-accent-cyan transition-colors"
                  />
                  <span className="text-sm text-fg-muted">%</span>
                </div>
              </div>
              <div className="px-1">
                <Slider
                  min={1}
                  max={400}
                  step={1}
                  value={resizePercent}
                  onChange={(v) => setResizePercent(typeof v === "number" ? v : v[0])}
                  styles={sliderStyles}
                />
              </div>
            </div>
          )}

          {/* Custom dimensions */}
          {resizeMode === "custom" && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <StyledInput
                  label={t("width")}
                  type="number"
                  min={1}
                  value={targetWidth || ""}
                  onChange={(e) => setTargetWidth(Math.max(0, Number(e.target.value)))}
                />
                <StyledInput
                  label={t("height")}
                  type="number"
                  min={1}
                  value={targetHeight || ""}
                  onChange={(e) => setTargetHeight(Math.max(0, Number(e.target.value)))}
                />
              </div>
              <StyledCheckbox
                label={t("keepAspectRatio")}
                checked={keepAspectRatio}
                onChange={(e) => setKeepAspectRatio(e.target.checked)}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-border-default">
            <Button variant="secondary" size="md" onClick={onReselect}>
              <RefreshCw size={14} />
              {t("reselect")}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => resultBlob && handleDownload(resultBlob)}
              disabled={!resultBlob || processing}
            >
              <Download size={14} />
              {tc("download")}
            </Button>
            <Button
              variant="outline-cyan"
              size="md"
              onClick={() => resultBlob && handleCopy(resultBlob)}
              disabled={!resultBlob || processing}
            >
              <Clipboard size={14} />
              {t("copyToClipboard")}
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col gap-3">
          <div
            className="relative w-full rounded-lg border border-border-default bg-bg-surface overflow-hidden"
            style={{
              aspectRatio: `${sourceBitmap.width} / ${sourceBitmap.height}`,
              maxHeight: "500px",
            }}
          >
            {previewUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previewUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-contain"
                draggable={false}
              />
            ) : !processing ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
              </div>
            ) : null}
            {processing && (
              <div className="absolute inset-0 bg-bg-base/60 flex flex-col items-center justify-center gap-2 z-30">
                <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-fg-secondary">{t("processing")}</span>
              </div>
            )}
          </div>

          {resultBlob && (
            <ImageInfoBar
              original={{
                label: t("original"),
                fileSize: sourceFile!.size,
                format: formatKeyFromMime(sourceFile!.type),
                dimensions: {
                  width: sourceBitmap!.width,
                  height: sourceBitmap!.height,
                },
              }}
              result={{
                label: t("result"),
                fileSize: resultBlob.size,
                format: String(outputFormat),
                dimensions: dims,
              }}
              savedPercent={savedPercent}
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default function ImageResizePage() {
  const t = useTranslations("tools");
  return (
    <Layout
      title={t("image-resize.shortTitle")}
      categoryLabel={t("categories.visual")}
      categorySlug="visual-media"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner variant="files" />
        <Conversion />
        <DescriptionSection namespace="image-resize" />
        <RelatedTools currentTool="image-resize" />
      </div>
    </Layout>
  );
}
