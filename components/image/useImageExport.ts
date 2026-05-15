"use client";

import { showToast } from "../../libs/toast";
import { FORMAT_EXTENSIONS } from "../../libs/image/types";
import type { OutputFormat } from "../../libs/image/types";

interface UseImageExportOptions {
  sourceFile: File | null;
  outputFormat: OutputFormat;
  t: (key: string) => string;
  tc: (key: string) => string;
}

export function useImageExport({ sourceFile, outputFormat, t, tc }: UseImageExportOptions) {
  function handleDownload(blob: Blob) {
    if (!sourceFile) return;
    const baseName = sourceFile.name.replace(/\.[^.]+$/, "");
    const ext = FORMAT_EXTENSIONS[outputFormat] || ".png";
    const filename = baseName + ext;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopy(blob: Blob) {
    try {
      // Clipboard API only supports image/png — convert if needed
      let pngBlob: Blob = blob;
      if (blob.type !== "image/png") {
        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
        bitmap.close();
        pngBlob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), "image/png")
        );
      }
      await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
      showToast(t("copiedToClipboard"), "success", 1500);
    } catch {
      showToast(tc("copyFailed"), "danger", 1500);
    }
  }

  return { handleDownload, handleCopy };
}
