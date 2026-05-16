"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import PrivacyBanner from "../../../components/privacy-banner";
import DescriptionSection from "../../../components/description-section";
import RelatedTools from "../../../components/related-tools";
import { Download, Clipboard, RefreshCw } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { encode } from "../../../libs/image/encode";
import type { OutputFormat } from "../../../libs/image/types";
import { resolveOutputFormat, formatKeyFromMime } from "../../../libs/image/types";
import { useImageInput } from "../../../components/image/useImageInput";
import { useImageExport } from "../../../components/image/useImageExport";
import ImageDropZone from "../../../components/image/ImageDropZone";
import ImageInfoBar from "../../../components/image/ImageInfoBar";
import CompareSlider from "../../../components/image/CompareSlider";
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
  const t = useTranslations("image-compress");
  const tc = useTranslations("common");

  const { sourceFile, sourceBitmap, handleFileSelect, handleReselect, dropZoneRef, fileInputRef } =
    useImageInput({ t });
  const outputFormat: OutputFormat = sourceFile ? resolveOutputFormat(sourceFile.type) : "png";
  const { handleDownload, handleCopy } = useImageExport({ sourceFile, outputFormat, t, tc });

  const [quality, setQuality] = useState(80);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  const stalenessId = useRef(0);
  const initialLoadRef = useRef(true);
  const draggingRef = useRef(false);
  const compareContainerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const originalUrlCleanupRef = useRef<string | null>(null);

  const isPngInput = sourceFile?.type === "image/png";

  // Manage original image URL for comparison slider
  useEffect(() => {
    if (!sourceFile) return;
    const url = URL.createObjectURL(sourceFile);
    originalUrlCleanupRef.current = url;
    // Defer setState to avoid react-hooks/set-state-in-effect
    const id = requestAnimationFrame(() => setOriginalUrl(url));
    return () => {
      cancelAnimationFrame(id);
      if (originalUrlCleanupRef.current) {
        URL.revokeObjectURL(originalUrlCleanupRef.current);
        originalUrlCleanupRef.current = null;
      }
    };
  }, [sourceFile]);

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
          const blob = await encode(sourceBitmap, {
            format: outputFormat,
            quality,
            width: sourceBitmap.width,
            height: sourceBitmap.height,
          });

          if (callId !== stalenessId.current) return;

          setPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });
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
  }, [sourceBitmap, outputFormat, quality]);

  function onReselect() {
    handleReselect();
    setResultBlob(null);
    setProcessing(false);
    setQuality(80);
    setSliderPos(50);
    setPreviewUrl(null);
    setOriginalUrl(null);
    initialLoadRef.current = true;
  }

  const savedPercent =
    sourceFile && resultBlob && sourceFile.size > 0
      ? Math.round((1 - resultBlob.size / sourceFile.size) * 100)
      : 0;

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
        {/* Controls */}
        <div className="flex flex-col gap-4">
          {/* Quality slider — hidden for PNG input */}
          {!isPngInput ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-fg-secondary">{t("quality")}</label>
                <span className="font-mono text-sm font-bold text-accent-cyan">{quality}%</span>
              </div>
              <div className="px-1">
                <Slider
                  min={1}
                  max={100}
                  step={1}
                  value={quality}
                  onChange={(v) => setQuality(typeof v === "number" ? v : v[0])}
                  styles={sliderStyles}
                />
              </div>
            </div>
          ) : (
            <div className="text-xs text-fg-muted bg-bg-surface rounded-lg p-3 border border-border-default">
              {t("pngLosslessHint")}
            </div>
          )}

          {/* Actions */}
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

        {/* Preview with CompareSlider */}
        <div className="flex flex-col gap-3">
          <CompareSlider
            originalUrl={originalUrl}
            resultUrl={previewUrl}
            sliderPos={sliderPos}
            onSliderChange={setSliderPos}
            draggingRef={draggingRef}
            containerRef={compareContainerRef}
            aspectRatio={sourceBitmap.width / sourceBitmap.height}
            processing={processing}
            t={t}
          />
          {resultBlob && (
            <ImageInfoBar
              original={{
                label: t("original"),
                fileSize: sourceFile!.size,
                format: formatKeyFromMime(sourceFile!.type),
                dimensions: { width: sourceBitmap!.width, height: sourceBitmap!.height },
              }}
              result={{
                label: t("compressed"),
                fileSize: resultBlob.size,
                format: String(outputFormat),
                dimensions: { width: sourceBitmap!.width, height: sourceBitmap!.height },
              }}
              savedPercent={savedPercent}
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default function ImageCompressPage() {
  const t = useTranslations("tools");
  return (
    <Layout
      title={t("image-compress.shortTitle")}
      categoryLabel={t("categories.visual")}
      categorySlug="visual-media"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner variant="files" />
        <Conversion />
        <DescriptionSection namespace="image-compress" />
        <RelatedTools currentTool="image-compress" />
      </div>
    </Layout>
  );
}
