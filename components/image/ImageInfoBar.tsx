"use client";

import { formatFileSize } from "../../utils/format-size";
import { FORMAT_DISPLAY_NAMES } from "../../libs/image/types";

export interface ImageInfoProps {
  label: string;
  fileSize: number;
  format: string;
  dimensions: { width: number; height: number };
}

interface ImageInfoBarProps {
  original: ImageInfoProps;
  result: ImageInfoProps;
  savedPercent?: number;
}

export default function ImageInfoBar({ original, result, savedPercent }: ImageInfoBarProps) {
  const displayName = (fmt: string) => FORMAT_DISPLAY_NAMES[fmt] ?? fmt.toUpperCase();

  return (
    <div className="flex items-center justify-between gap-4 text-xs text-fg-muted px-1">
      <span>
        {original.label}: {formatFileSize(original.fileSize)} · {displayName(original.format)} ·{" "}
        {original.dimensions.width}×{original.dimensions.height}
      </span>
      <span>
        {result.label}: {formatFileSize(result.fileSize)} · {displayName(result.format)} ·{" "}
        {result.dimensions.width}×{result.dimensions.height}
      </span>
      {savedPercent !== undefined && savedPercent !== 0 && (
        <span
          className={
            savedPercent > 0 ? "text-accent-cyan font-semibold" : "text-danger font-semibold"
          }
        >
          {savedPercent > 0 ? "↓" : "↑"} {Math.abs(savedPercent)}%
        </span>
      )}
    </div>
  );
}
