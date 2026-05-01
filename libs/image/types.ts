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
