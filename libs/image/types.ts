export type OutputFormat = "png" | "jpeg" | "webp";

export type ResizeMode = "none" | "percent" | "custom";

export interface EncodeOptions {
  format: OutputFormat;
  quality: number;
  width: number;
  height: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

// --- New types and constants for tool split ---

export type InputFormat = "png" | "jpeg" | "webp" | "avif" | "gif" | "bmp" | "svg+xml";

export const INPUT_MIME_TYPES: readonly string[] = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/bmp",
  "image/svg+xml",
] as const;

export const FORMAT_EXTENSIONS: Record<OutputFormat, string> = {
  png: ".png",
  jpeg: ".jpeg",
  webp: ".webp",
};

export const FORMAT_DISPLAY_NAMES: Record<string, string> = {
  png: "PNG",
  jpeg: "JPEG",
  webp: "WebP",
  avif: "AVIF",
  gif: "GIF",
  bmp: "BMP",
  "svg+xml": "SVG",
};

/** Map input MIME type to OutputFormat. Falls back to PNG for unsupported output formats. */
export function resolveOutputFormat(mimeType: string): OutputFormat {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/jpeg") return "jpeg";
  if (mimeType === "image/webp") return "webp";
  return "png"; // GIF, BMP, SVG, AVIF → PNG
}

/** Extract format key from MIME type for display (e.g. "image/png" → "png"). */
export function formatKeyFromMime(mimeType: string): string {
  return mimeType.replace("image/", "");
}
