"use client";

import React from "react";
import { ImagePlus } from "lucide-react";

interface ImageDropZoneProps {
  dropZoneRef: React.RefObject<HTMLDivElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  t: (key: string) => string;
}

export default function ImageDropZone({
  dropZoneRef,
  fileInputRef,
  onInputChange,
  t,
}: ImageDropZoneProps) {
  return (
    <section className="mt-4">
      <div
        ref={dropZoneRef}
        className="relative text-xl rounded-lg border-2 border-dashed border-accent-cyan/30 bg-accent-cyan-dim/10 text-accent-cyan cursor-pointer"
        style={{ width: "100%", height: "14rem" }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-none">
          <ImagePlus size={32} />
          <span className="font-bold text-base">{t("dropImage")}</span>
          <span className="text-sm text-accent-cyan/60">{t("supportedFormats")}</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/bmp,image/svg+xml"
          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
          onChange={onInputChange}
        />
      </div>
    </section>
  );
}
