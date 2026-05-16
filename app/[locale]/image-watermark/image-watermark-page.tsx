"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import PrivacyBanner from "../../../components/privacy-banner";
import DescriptionSection from "../../../components/description-section";
import RelatedTools from "../../../components/related-tools";
import { Download, Clipboard, RefreshCw, Upload } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { resolveOutputFormat, formatKeyFromMime } from "../../../libs/image/types";
import type { OutputFormat } from "../../../libs/image/types";
import { useImageInput } from "../../../components/image/useImageInput";
import { useImageExport } from "../../../components/image/useImageExport";
import ImageDropZone from "../../../components/image/ImageDropZone";
import ImageInfoBar from "../../../components/image/ImageInfoBar";
import { renderWatermark } from "../../../libs/image/watermark";
import type {
  WatermarkMode,
  PositionPreset,
  TextWatermarkConfig,
  LogoWatermarkConfig,
  WatermarkOptions,
} from "../../../libs/image/watermark";
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

const FONT_OPTIONS = [
  { value: "Arial", key: "fontArial" },
  { value: "Helvetica", key: "fontHelvetica" },
  { value: "Georgia", key: "fontGeorgia" },
  { value: "Courier New", key: "fontCourierNew" },
  { value: "system-ui", key: "fontSystemUI" },
  { value: "sans-serif", key: "fontSansSerif" },
] as const;

const POSITION_PRESETS: PositionPreset[] = [
  "top-left",
  "top-center",
  "top-right",
  "left-center",
  "center",
  "right-center",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

function Conversion() {
  const t = useTranslations("image-watermark");
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

  // Watermark type
  const [watermarkType, setWatermarkType] = useState<"text" | "logo">("text");

  // Arrangement mode
  const [arrangementMode, setArrangementMode] = useState<WatermarkMode>("single");

  // Text watermark config
  const [textContent, setTextContent] = useState("© 2026");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(5);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [textOpacity, setTextOpacity] = useState(50);
  const [bold, setBold] = useState(false);

  // Logo watermark config
  const [logoBitmap, setLogoBitmap] = useState<ImageBitmap | null>(null);
  const [logoScale, setLogoScale] = useState(20);
  const [logoOpacity, setLogoOpacity] = useState(80);

  // Position (single mode)
  const [position, setPosition] = useState<PositionPreset>("bottom-right");

  // Tiled config
  const [rotation, setRotation] = useState(-30);
  const [tiledSpacing, setTiledSpacing] = useState(1.5);

  // Result state
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const stalenessId = useRef(0);
  const prevBlobUrlRef = useRef<string | null>(null);
  const initialLoadRef = useRef(true);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Logo bitmap cleanup on unmount
  useEffect(() => {
    return () => {
      logoBitmap?.close();
    };
  }, []);

  // Handle logo file upload
  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (logoBitmap) {
      logoBitmap.close();
      setLogoBitmap(null);
    }
    createImageBitmap(file).then((bitmap) => {
      setLogoBitmap(bitmap);
    });
  }

  // Render pipeline with debounce
  useEffect(() => {
    if (!sourceBitmap) return;

    // Build watermark config inside effect to avoid object identity causing infinite loops
    const watermark: TextWatermarkConfig | LogoWatermarkConfig | null =
      watermarkType === "text"
        ? {
            type: "text",
            text: textContent,
            fontFamily,
            fontSize,
            color: textColor,
            opacity: textOpacity,
            bold,
          }
        : logoBitmap
          ? { type: "logo", bitmap: logoBitmap, scale: logoScale, opacity: logoOpacity }
          : null;

    if (!watermark) return;

    const options: WatermarkOptions = {
      mode: arrangementMode,
      position,
      rotation,
      spacing: tiledSpacing,
    };

    const isInitial = initialLoadRef.current;
    initialLoadRef.current = false;

    let cancelled = false;
    const timer = setTimeout(
      async () => {
        if (cancelled) return;
        const callId = ++stalenessId.current;
        setProcessing(true);

        try {
          const blob = await renderWatermark(sourceBitmap, outputFormat, watermark, options);

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
    outputFormat,
    watermarkType,
    textContent,
    fontFamily,
    fontSize,
    textColor,
    textOpacity,
    bold,
    logoBitmap,
    logoScale,
    logoOpacity,
    arrangementMode,
    position,
    rotation,
    tiledSpacing,
  ]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
    };
  }, []);

  function onReselect() {
    handleReselect();
    setResultBlob(null);
    setPreviewUrl(null);
    setProcessing(false);
    initialLoadRef.current = true;
  }

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
          {/* Watermark type tabs */}
          <div>
            <div className="flex gap-1">
              {(["text", "logo"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`flex-1 px-2 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                    watermarkType === type
                      ? "bg-accent-cyan text-bg-base"
                      : "border border-border-default text-fg-muted hover:text-fg-secondary hover:border-fg-muted"
                  }`}
                  onClick={() => setWatermarkType(type)}
                >
                  {t(type === "text" ? "typeText" : "typeLogo")}
                </button>
              ))}
            </div>
          </div>

          {/* Arrangement mode */}
          <div>
            <div className="flex gap-1">
              {(["single", "tiled"] as WatermarkMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`flex-1 px-2 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                    arrangementMode === mode
                      ? "bg-accent-purple text-bg-base"
                      : "border border-border-default text-fg-muted hover:text-fg-secondary hover:border-fg-muted"
                  }`}
                  onClick={() => setArrangementMode(mode)}
                >
                  {t(mode === "single" ? "modeSingle" : "modeTiled")}
                </button>
              ))}
            </div>
          </div>

          {/* Text watermark config */}
          {watermarkType === "text" && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-fg-secondary mb-1">
                  {t("textContent")}
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-bg-input text-fg-primary rounded-lg border border-border-default outline-none focus:border-accent-cyan transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-fg-secondary mb-1">
                  {t("fontFamily")}
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-bg-input text-fg-primary rounded-lg border border-border-default outline-none focus:border-accent-cyan transition-colors"
                >
                  {FONT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.key)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-fg-secondary">{t("fontSize")}</label>
                  <span className="text-xs font-mono text-accent-cyan">{fontSize}%</span>
                </div>
                <div className="px-1">
                  <Slider
                    min={1}
                    max={20}
                    step={1}
                    value={fontSize}
                    onChange={(v) => setFontSize(typeof v === "number" ? v : v[0])}
                    styles={sliderStyles}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-fg-secondary">{t("color")}</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 rounded border border-border-default cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-fg-secondary">{t("opacity")}</label>
                  <span className="text-xs font-mono text-accent-cyan">{textOpacity}%</span>
                </div>
                <div className="px-1">
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={textOpacity}
                    onChange={(v) => setTextOpacity(typeof v === "number" ? v : v[0])}
                    styles={sliderStyles}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bold}
                  onChange={(e) => setBold(e.target.checked)}
                  className="w-4 h-4 rounded border-border-default accent-accent-cyan"
                />
                <span className="text-sm text-fg-secondary">{t("bold")}</span>
              </label>
            </div>
          )}

          {/* Logo watermark config */}
          {watermarkType === "logo" && (
            <div className="flex flex-col gap-3">
              <div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoSelect}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload size={14} />
                  {t("uploadLogo")}
                </Button>
                <p className="text-xs text-fg-muted mt-1">{t("logoSupportedFormats")}</p>
              </div>

              {logoBitmap && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-fg-secondary">
                        {t("logoScale")}
                      </label>
                      <span className="text-xs font-mono text-accent-cyan">{logoScale}%</span>
                    </div>
                    <div className="px-1">
                      <Slider
                        min={5}
                        max={50}
                        step={1}
                        value={logoScale}
                        onChange={(v) => setLogoScale(typeof v === "number" ? v : v[0])}
                        styles={sliderStyles}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-fg-secondary">
                        {t("opacity")}
                      </label>
                      <span className="text-xs font-mono text-accent-cyan">{logoOpacity}%</span>
                    </div>
                    <div className="px-1">
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={logoOpacity}
                        onChange={(v) => setLogoOpacity(typeof v === "number" ? v : v[0])}
                        styles={sliderStyles}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Position config (single mode) */}
          {arrangementMode === "single" && (
            <div>
              <label className="block text-sm font-medium text-fg-secondary mb-2">
                {t("position")}
              </label>
              <div className="grid grid-cols-3 gap-1">
                {POSITION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`px-1 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer ${
                      position === preset
                        ? "bg-accent-cyan text-bg-base font-semibold"
                        : "border border-border-default text-fg-muted hover:text-fg-secondary hover:border-fg-muted"
                    }`}
                    onClick={() => setPosition(preset)}
                  >
                    {t(
                      `position${preset.charAt(0).toUpperCase() + preset.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tiled config */}
          {arrangementMode === "tiled" && (
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-fg-secondary">{t("rotation")}</label>
                  <span className="text-xs font-mono text-accent-cyan">{rotation}°</span>
                </div>
                <div className="px-1">
                  <Slider
                    min={-45}
                    max={45}
                    step={1}
                    value={rotation}
                    onChange={(v) => setRotation(typeof v === "number" ? v : v[0])}
                    styles={sliderStyles}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-fg-secondary">
                    {t("tiledSpacing")}
                  </label>
                  <span className="text-xs font-mono text-accent-cyan">
                    {tiledSpacing.toFixed(1)}×
                  </span>
                </div>
                <div className="px-1">
                  <Slider
                    min={1.0}
                    max={3.0}
                    step={0.1}
                    value={tiledSpacing}
                    onChange={(v) => setTiledSpacing(typeof v === "number" ? v : v[0])}
                    styles={sliderStyles}
                  />
                </div>
              </div>
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
                dimensions: {
                  width: sourceBitmap!.width,
                  height: sourceBitmap!.height,
                },
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default function ImageWatermarkPage() {
  const t = useTranslations("tools");
  return (
    <Layout
      title={t("image-watermark.shortTitle")}
      categoryLabel={t("categories.visual")}
      categorySlug="visual-media"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner variant="files" />
        <Conversion />
        <DescriptionSection namespace="image-watermark" />
        <RelatedTools currentTool="image-watermark" />
      </div>
    </Layout>
  );
}
