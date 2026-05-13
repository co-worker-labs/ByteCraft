import type { BatchResultItem } from "./types";

export function applyFilenameTemplate(template: string, filename: string): string {
  const dotIndex = filename.lastIndexOf(".");
  const base = dotIndex > 0 ? filename.slice(0, dotIndex) : filename;
  return template.replace(/\{name\}/g, filename).replace(/\{base\}/g, base);
}

export function mergeTextResults(results: BatchResultItem[]): string {
  return results
    .filter((r) => r.status === "success" && r.output !== undefined)
    .map((r) => r.output!)
    .join("\n");
}

const MIME_TO_EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "image/bmp": ".bmp",
  "image/avif": ".avif",
};

function extractMimeFromDataUrl(dataUrl: string): string | null {
  const match = dataUrl.match(/^data:([^;,]+)/);
  return match ? match[1] : null;
}

export async function createZipFromResults(
  results: BatchResultItem[],
  filenameTemplate: string,
  inputs: { id: string; name: string }[]
): Promise<Blob> {
  const fflate = await import("fflate");
  const files: Record<string, Uint8Array> = {};
  for (const result of results) {
    if (result.status !== "success" || !result.output) continue;
    const input = inputs.find((i) => i.id === result.id);
    let name = input
      ? applyFilenameTemplate(filenameTemplate, input.name)
      : `output-${result.id}.txt`;
    if (result.output.startsWith("data:")) {
      const mime = extractMimeFromDataUrl(result.output);
      const ext = mime ? MIME_TO_EXT[mime] : undefined;
      if (ext && !name.toLowerCase().endsWith(ext)) {
        name += ext;
      }
      const base64 = result.output.split(",")[1];
      files[name] = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    } else {
      files[name] = new TextEncoder().encode(result.output);
    }
  }
  const zipped = fflate.zipSync(files);
  return new Blob([zipped.buffer as ArrayBuffer], { type: "application/zip" });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
