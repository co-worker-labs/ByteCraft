"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import PrivacyBanner from "../../../components/privacy-banner";
import DescriptionSection from "../../../components/description-section";
import RelatedTools from "../../../components/related-tools";
import { Download, Clipboard, RefreshCw, FlipHorizontal2, FlipVertical2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { OutputFormat } from "../../../libs/image/types";
import { resolveOutputFormat, formatKeyFromMime } from "../../../libs/image/types";
import { useImageInput } from "../../../components/image/useImageInput";
import { useImageExport } from "../../../components/image/useImageExport";
import ImageDropZone from "../../../components/image/ImageDropZone";
import ImageInfoBar from "../../../components/image/ImageInfoBar";

function Conversion() {
  const t = useTranslations("image-rotate");
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
  const [rotation, setRotation] = useState(0); // 0 | 90 | 180 | 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Encode pipeline refs (same pattern as image-resize)
  const stalenessId = useRef(0);
  const prevBlobUrlRef = useRef<string | null>(null);
  const initialLoadRef = useRef(true);

  // Encode pipeline with debounce
  useEffect(() => {
    if (!sourceBitmap) return;

    const isInitial = initialLoadRef.current;
    initialLoadRef.current = false;

    let cancelled = false;
    const timer = setTimeout(
      async () => {
        if (cancelled) return;
        const callId = ++stalenessId.current;
        setProcessing(true);

        try {
          const bitmap = sourceBitmap;
          const swapped = rotation === 90 || rotation === 270;
          const canvasW = swapped ? bitmap.height : bitmap.width;
          const canvasH = swapped ? bitmap.width : bitmap.height;

          const canvas = document.createElement("canvas");
          canvas.width = canvasW;
          canvas.height = canvasH;
          const ctx = canvas.getContext("2d")!;

          // JPEG: fill white background (no alpha support)
          if (outputFormat === "jpeg") {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvasW, canvasH);
          }

          // Canvas transforms execute bottom-up: scale → rotate → translate
          ctx.translate(canvasW / 2, canvasH / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
          ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);

          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (b) => (b ? resolve(b) : reject(new Error("Encoding failed"))),
              `image/${outputFormat}`,
              outputFormat === "png" ? undefined : 1
            );
          });

          if (callId !== stalenessId.current) return;

          // Cleanup previous preview URL
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
  }, [sourceBitmap, rotation, flipH, flipV, outputFormat]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
    };
  }, []);

  // Reselect handler
  function onReselect() {
    handleReselect();
    setResultBlob(null);
    setPreviewUrl(null);
    setProcessing(false);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    initialLoadRef.current = true;
  }

  // Transformed dimensions for preview and ImageInfoBar
  const swapped = rotation === 90 || rotation === 270;
  const previewW = sourceBitmap ? (swapped ? sourceBitmap.height : sourceBitmap.width) : 0;
  const previewH = sourceBitmap ? (swapped ? sourceBitmap.width : sourceBitmap.height) : 0;

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

  const rotationAngles = [0, 90, 180, 270] as const;

  return (
    <section className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Controls panel */}
        <div className="flex flex-col gap-4">
          {/* Rotation angle */}
          <div>
            <label className="block text-sm font-medium text-fg-secondary mb-2">
              {t("rotate")}
            </label>
            <div className="grid grid-cols-4 gap-1">
              {rotationAngles.map((angle) => (
                <button
                  key={angle}
                  type="button"
                  className={`px-2 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                    rotation === angle
                      ? "bg-accent-cyan text-bg-base"
                      : "border border-border-default text-fg-muted hover:text-fg-secondary hover:border-fg-muted"
                  }`}
                  onClick={() => setRotation(angle)}
                >
                  {angle}°
                </button>
              ))}
            </div>
          </div>

          {/* Flip toggles */}
          <div>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                className={`flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                  flipH
                    ? "bg-accent-cyan text-bg-base"
                    : "border border-border-default text-fg-muted hover:text-fg-secondary hover:border-fg-muted"
                }`}
                onClick={() => setFlipH(!flipH)}
              >
                <FlipHorizontal2 size={14} />
                {t("flipHorizontal")}
              </button>
              <button
                type="button"
                className={`flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                  flipV
                    ? "bg-accent-cyan text-bg-base"
                    : "border border-border-default text-fg-muted hover:text-fg-secondary hover:border-fg-muted"
                }`}
                onClick={() => setFlipV(!flipV)}
              >
                <FlipVertical2 size={14} />
                {t("flipVertical")}
              </button>
            </div>
          </div>

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
              aspectRatio: `${previewW} / ${previewH}`,
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
                dimensions: { width: previewW, height: previewH },
              }}
              savedPercent={savedPercent}
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default function ImageRotatePage() {
  const t = useTranslations("tools");
  return (
    <Layout
      title={t("image-rotate.shortTitle")}
      categoryLabel={t("categories.visual")}
      categorySlug="visual-media"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner variant="files" />
        <Conversion />
        <DescriptionSection namespace="image-rotate" />
        <RelatedTools currentTool="image-rotate" />
      </div>
    </Layout>
  );
}
