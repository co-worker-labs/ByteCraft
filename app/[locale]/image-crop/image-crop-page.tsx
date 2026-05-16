"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import PrivacyBanner from "../../../components/privacy-banner";
import DescriptionSection from "../../../components/description-section";
import RelatedTools from "../../../components/related-tools";
import { Download, Clipboard, RefreshCw } from "lucide-react";
import { StyledInput, StyledCheckbox } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { cropBitmap } from "../../../libs/image/crop";
import type { OutputFormat } from "../../../libs/image/types";
import { resolveOutputFormat, formatKeyFromMime } from "../../../libs/image/types";
import { useImageInput } from "../../../components/image/useImageInput";
import { useImageExport } from "../../../components/image/useImageExport";
import ImageDropZone from "../../../components/image/ImageDropZone";
import ImageInfoBar from "../../../components/image/ImageInfoBar";
import ReactCrop, { centerCrop, makeAspectCrop, type Crop } from "react-image-crop";

type CropMode = "free" | "preset" | "exact";

const PRESET_RATIOS: { labelKey: string; value: number | null }[] = [
  { labelKey: "ratioOriginal", value: null },
  { labelKey: "ratio_1_1", value: 1 },
  { labelKey: "ratio_16_9", value: 16 / 9 },
  { labelKey: "ratio_4_3", value: 4 / 3 },
  { labelKey: "ratio_3_2", value: 3 / 2 },
  { labelKey: "ratio_2_3", value: 2 / 3 },
  { labelKey: "ratio_9_16", value: 9 / 16 },
  { labelKey: "ratio_21_9", value: 21 / 9 },
];

function Conversion() {
  const t = useTranslations("image-crop");
  const tc = useTranslations("common");

  // Shared hooks — same pattern as image-resize
  const { sourceFile, sourceBitmap, handleFileSelect, handleReselect, dropZoneRef, fileInputRef } =
    useImageInput({ t });
  const outputFormat: OutputFormat = sourceFile ? resolveOutputFormat(sourceFile.type) : "png";
  const { handleDownload, handleCopy } = useImageExport({ sourceFile, outputFormat, t, tc });

  // Tool-specific state
  const [cropMode, setCropMode] = useState<CropMode>("free");
  const [crop, setCrop] = useState<Crop>();
  const [selectedRatio, setSelectedRatio] = useState<number | null | undefined>(undefined);
  const [exactWidth, setExactWidth] = useState(0);
  const [exactHeight, setExactHeight] = useState(0);
  const [keepAspectRatio, setKeepAspectRatio] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Source image URL for ReactCrop
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  const stalenessId = useRef(0);
  const prevBlobUrlRef = useRef<string | null>(null);

  // Create source URL from file — clean up on file change or unmount
  useEffect(() => {
    if (sourceFile) {
      const url = URL.createObjectURL(sourceFile);
      const timer = setTimeout(() => setSourceUrl(url), 0);
      return () => {
        clearTimeout(timer);
        URL.revokeObjectURL(url);
      };
    }
    const timer = setTimeout(() => setSourceUrl(null), 0);
    return () => clearTimeout(timer);
  }, [sourceFile]);

  // Calculate aspect prop for ReactCrop
  const cropAspect =
    cropMode === "preset" && selectedRatio != null && sourceBitmap
      ? selectedRatio
      : cropMode === "exact" && keepAspectRatio && exactWidth > 0 && exactHeight > 0
        ? exactWidth / exactHeight
        : undefined;

  // Exact mode: update crop when dimensions change
  useEffect(() => {
    if (cropMode !== "exact" || !sourceBitmap) return;
    if (exactWidth <= 0 || exactHeight <= 0) {
      const timer = setTimeout(() => setCrop(undefined), 0);
      return () => clearTimeout(timer);
    }

    const w = Math.min(exactWidth, sourceBitmap.width);
    const h = Math.min(exactHeight, sourceBitmap.height);
    const xPct = ((sourceBitmap.width - w) / 2 / sourceBitmap.width) * 100;
    const yPct = ((sourceBitmap.height - h) / 2 / sourceBitmap.height) * 100;
    const wPct = (w / sourceBitmap.width) * 100;
    const hPct = (h / sourceBitmap.height) * 100;

    const timer = setTimeout(
      () => setCrop({ unit: "%", x: xPct, y: yPct, width: wPct, height: hPct }),
      0
    );
    return () => clearTimeout(timer);
  }, [cropMode, exactWidth, exactHeight, sourceBitmap]);

  function clearResult() {
    if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
    prevBlobUrlRef.current = null;
    setPreviewUrl(null);
    setResultBlob(null);
  }

  function handleCropChange(_crop: Crop, percentCrop: Crop) {
    setCrop(percentCrop);

    if (cropMode === "exact" && sourceBitmap && percentCrop.width > 0 && percentCrop.height > 0) {
      setExactWidth(Math.round((percentCrop.width / 100) * sourceBitmap.width));
      setExactHeight(Math.round((percentCrop.height / 100) * sourceBitmap.height));
    }
  }

  // Encode pipeline — same stalenessId pattern as image-resize
  // Key difference: always 300ms debounce (no initialLoadRef), guard on crop existence
  useEffect(() => {
    if (!sourceBitmap || !crop) return;

    // Convert percentage crop to pixel coordinates
    const px = Math.round((crop.x / 100) * sourceBitmap.width);
    const py = Math.round((crop.y / 100) * sourceBitmap.height);
    const pw = Math.round((crop.width / 100) * sourceBitmap.width);
    const ph = Math.round((crop.height / 100) * sourceBitmap.height);

    if (pw <= 0 || ph <= 0 || pw < 10 || ph < 10) {
      let cancelled = false;
      const timer = setTimeout(() => {
        if (cancelled) return;
        clearResult();
      }, 0);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      const callId = ++stalenessId.current;
      setProcessing(true);

      try {
        const blob = await cropBitmap(
          sourceBitmap,
          { x: px, y: py, width: pw, height: ph },
          outputFormat
        );
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
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sourceBitmap, crop, outputFormat]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
    };
  }, []);

  // Mode change: preserve existing crop selection
  function handleCropModeChange(mode: CropMode) {
    setCropMode(mode);
    setSelectedRatio(undefined);
    clearResult();

    if (mode === "exact" && sourceBitmap) {
      const w = crop ? Math.round((crop.width / 100) * sourceBitmap.width) : sourceBitmap.width;
      const h = crop ? Math.round((crop.height / 100) * sourceBitmap.height) : sourceBitmap.height;
      setExactWidth(w);
      setExactHeight(h);
    }
  }

  // Preset ratio: calculate max centered crop at the selected ratio
  function handleRatioSelect(ratio: number | null) {
    setSelectedRatio(ratio);
    if (!sourceBitmap) return;

    if (ratio === null) {
      setCrop({ unit: "%", x: 0, y: 0, width: 100, height: 100 });
      return;
    }

    const centered = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, ratio, sourceBitmap.width, sourceBitmap.height),
      sourceBitmap.width,
      sourceBitmap.height
    );
    setCrop(centered);
  }

  // Exact dimension handlers with optional aspect ratio lock
  function handleExactWidthChange(value: number) {
    const w = Math.max(0, value);
    setExactWidth(w);
    if (keepAspectRatio && sourceBitmap && w > 0) {
      const h = Math.round((w * sourceBitmap.height) / sourceBitmap.width);
      setExactHeight(Math.min(h, sourceBitmap.height));
    }
  }

  function handleExactHeightChange(value: number) {
    const h = Math.max(0, value);
    setExactHeight(h);
    if (keepAspectRatio && sourceBitmap && h > 0) {
      const w = Math.round((h * sourceBitmap.width) / sourceBitmap.height);
      setExactWidth(Math.min(w, sourceBitmap.width));
    }
  }

  // Full reselect — reset all state
  function onReselect() {
    handleReselect();
    setResultBlob(null);
    setPreviewUrl(null);
    setProcessing(false);
    setCropMode("free");
    setCrop(undefined);
    setSelectedRatio(undefined);
    setExactWidth(0);
    setExactHeight(0);
    setKeepAspectRatio(false);
  }

  // Crop result dimensions for ImageInfoBar
  const cropDimensions =
    sourceBitmap && crop
      ? {
          width: Math.round((crop.width / 100) * sourceBitmap.width),
          height: Math.round((crop.height / 100) * sourceBitmap.height),
        }
      : { width: 0, height: 0 };

  // Drop zone view (no image loaded)
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
        {/* Left panel — controls (below crop area on mobile) */}
        <div className="flex flex-col gap-4 order-2 md:order-1">
          {/* Crop mode selector */}
          <div>
            <label className="block text-sm font-medium text-fg-secondary mb-2">
              {t("cropMode")}
            </label>
            <div className="flex gap-1">
              {(["free", "preset", "exact"] as CropMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`flex-1 px-2 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                    cropMode === mode
                      ? "bg-accent-cyan text-bg-base"
                      : "border border-border-default text-fg-muted hover:text-fg-secondary hover:border-fg-muted"
                  }`}
                  onClick={() => handleCropModeChange(mode)}
                >
                  {mode === "free"
                    ? t("free")
                    : mode === "preset"
                      ? t("presetRatio")
                      : t("exactSize")}
                </button>
              ))}
            </div>
          </div>

          {/* Preset ratio grid */}
          {cropMode === "preset" && (
            <div className="grid grid-cols-4 gap-1.5">
              {PRESET_RATIOS.map((r) => (
                <button
                  key={r.labelKey}
                  type="button"
                  className={`px-2 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                    selectedRatio === r.value
                      ? "bg-accent-cyan text-bg-base"
                      : "border border-border-default text-fg-muted hover:text-fg-secondary hover:border-fg-muted"
                  }`}
                  onClick={() => handleRatioSelect(r.value)}
                >
                  {t(r.labelKey)}
                </button>
              ))}
            </div>
          )}

          {/* Exact dimension inputs */}
          {cropMode === "exact" && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <StyledInput
                  label={t("width")}
                  type="number"
                  min={1}
                  value={exactWidth || ""}
                  onChange={(e) => handleExactWidthChange(Number(e.target.value))}
                />
                <StyledInput
                  label={t("height")}
                  type="number"
                  min={1}
                  value={exactHeight || ""}
                  onChange={(e) => handleExactHeightChange(Number(e.target.value))}
                />
              </div>
              <StyledCheckbox
                label={t("keepAspectRatio")}
                checked={keepAspectRatio}
                onChange={(e) => setKeepAspectRatio(e.target.checked)}
              />
            </div>
          )}

          {/* Action buttons — same pattern as image-resize */}
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

        {/* Right panel — preview (shown first on mobile) */}
        <div className="flex flex-col gap-3 order-1 md:order-2">
          <div
            className="relative w-full flex items-center justify-center rounded-lg border border-border-default bg-bg-surface overflow-hidden"
            style={{ maxHeight: "500px" }}
          >
            {sourceUrl && (
              <ReactCrop
                crop={crop}
                onChange={handleCropChange}
                aspect={cropAspect}
                ruleOfThirds
                minWidth={10}
                minHeight={10}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sourceUrl}
                  alt=""
                  style={{ maxWidth: "100%", maxHeight: "500px", display: "block" }}
                  draggable={false}
                />
              </ReactCrop>
            )}
            {processing && (
              <div className="absolute inset-0 bg-bg-base/60 flex flex-col items-center justify-center gap-2 z-30 pointer-events-none">
                <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-fg-secondary">{t("processing")}</span>
              </div>
            )}

            {/* Floating result thumbnail — md+ only (picture-in-picture) */}
            {previewUrl && (
              <div className="hidden md:flex absolute bottom-3 right-3 w-36 rounded-lg border-2 border-accent-cyan/50 shadow-lg overflow-hidden bg-bg-surface/90 backdrop-blur-sm flex-col z-20 pointer-events-none">
                <p className="text-[10px] text-fg-muted px-1.5 pt-1">{t("result")}</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt=""
                  className="w-full object-contain max-h-28"
                  draggable={false}
                />
              </div>
            )}
          </div>

          {/* Result preview — mobile only (independent row) */}
          {previewUrl && (
            <div className="md:hidden rounded-lg border border-border-default bg-bg-surface overflow-hidden p-2">
              <p className="text-xs text-fg-muted mb-1">{t("result")}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt=""
                className="max-w-full max-h-40 object-contain"
                draggable={false}
              />
            </div>
          )}

          <ImageInfoBar
            original={{
              label: t("original"),
              fileSize: sourceFile!.size,
              format: formatKeyFromMime(sourceFile!.type),
              dimensions: { width: sourceBitmap!.width, height: sourceBitmap!.height },
            }}
            result={{
              label: t("result"),
              fileSize: resultBlob?.size ?? 0,
              format: String(outputFormat),
              dimensions: cropDimensions,
            }}
          />
        </div>
      </div>
    </section>
  );
}

export default function ImageCropPage() {
  const t = useTranslations("tools");
  return (
    <Layout
      title={t("image-crop.shortTitle")}
      categoryLabel={t("categories.visual")}
      categorySlug="visual-media"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner variant="files" />
        <Conversion />
        <DescriptionSection namespace="image-crop" />
        <RelatedTools currentTool="image-crop" />
      </div>
    </Layout>
  );
}
