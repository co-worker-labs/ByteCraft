"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import PrivacyBanner from "../../../components/privacy-banner";
import DescriptionSection from "../../../components/description-section";
import RelatedTools from "../../../components/related-tools";
import { Download, Clipboard, RefreshCw } from "lucide-react";
import { StyledSelect } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { encode } from "../../../libs/image/encode";
import { getSupportedEncodeFormats } from "../../../libs/image/format-support";
import type { OutputFormat } from "../../../libs/image/types";
import { formatKeyFromMime } from "../../../libs/image/types";
import { useImageInput } from "../../../components/image/useImageInput";
import { useImageExport } from "../../../components/image/useImageExport";
import ImageDropZone from "../../../components/image/ImageDropZone";
import ImageInfoBar from "../../../components/image/ImageInfoBar";

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPG" },
  { value: "webp", label: "WebP" },
];

function Conversion() {
  const t = useTranslations("image-convert");
  const tc = useTranslations("common");

  const { sourceFile, sourceBitmap, handleFileSelect, handleReselect, dropZoneRef, fileInputRef } =
    useImageInput({ t });

  const [outputFormat, setOutputFormat] = useState<OutputFormat>("webp");
  const [supportedFormats, setSupportedFormats] = useState<Set<OutputFormat> | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { handleDownload, handleCopy } = useImageExport({ sourceFile, outputFormat, t, tc });

  const stalenessId = useRef(0);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    getSupportedEncodeFormats().then(setSupportedFormats);
  }, []);

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
            quality: outputFormat === "png" ? 100 : 90,
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
  }, [sourceBitmap, outputFormat]);

  function onReselect() {
    handleReselect();
    setResultBlob(null);
    setProcessing(false);
    setOutputFormat("webp");
    setPreviewUrl(null);
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
          {/* Format selector */}
          <div>
            <label className="block text-sm font-medium text-fg-secondary mb-1">
              {t("outputFormat")}
            </label>
            <StyledSelect
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
            >
              {FORMAT_OPTIONS.map((opt) => {
                const disabled = supportedFormats ? !supportedFormats.has(opt.value) : false;
                return (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={disabled}
                    title={disabled ? t("formatUnsupported") : undefined}
                  >
                    {opt.label}
                  </option>
                );
              })}
            </StyledSelect>
          </div>

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
                dimensions: { width: sourceBitmap!.width, height: sourceBitmap!.height },
              }}
              result={{
                label: t("result"),
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

export default function ImageConvertPage() {
  const t = useTranslations("tools");
  return (
    <Layout
      title={t("image-convert.shortTitle")}
      categoryLabel={t("categories.visual")}
      categorySlug="visual-media"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner variant="files" />
        <Conversion />
        <DescriptionSection namespace="image-convert" />
        <RelatedTools currentTool="image-convert" />
      </div>
    </Layout>
  );
}
