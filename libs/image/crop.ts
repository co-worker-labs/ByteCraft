import type { OutputFormat } from "./types";

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Clamp a crop region to bitmap boundaries (pure function, testable).
 */
export function clampCropRegion(
  crop: CropRegion,
  bitmapWidth: number,
  bitmapHeight: number
): CropRegion {
  const clampedX = Math.max(0, Math.min(crop.x, bitmapWidth));
  const clampedY = Math.max(0, Math.min(crop.y, bitmapHeight));
  const clampedW = Math.max(1, Math.min(crop.width, bitmapWidth - clampedX));
  const clampedH = Math.max(1, Math.min(crop.height, bitmapHeight - clampedY));
  return { x: clampedX, y: clampedY, width: clampedW, height: clampedH };
}

/**
 * Crop a bitmap to the specified region and encode as Blob.
 * Source region crop via canvas.drawImage(bitmap, sx, sy, sw, sh, 0, 0, dw, dh).
 */
export function cropBitmap(
  bitmap: ImageBitmap,
  crop: CropRegion,
  format: OutputFormat
): Promise<Blob> {
  const clamped = clampCropRegion(crop, bitmap.width, bitmap.height);

  const canvas = document.createElement("canvas");
  canvas.width = clamped.width;
  canvas.height = clamped.height;
  const ctx = canvas.getContext("2d")!;

  // Fill white background for JPEG (no alpha channel support)
  if (format === "jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, clamped.width, clamped.height);
  }

  ctx.drawImage(
    bitmap,
    clamped.x,
    clamped.y,
    clamped.width,
    clamped.height,
    0,
    0,
    clamped.width,
    clamped.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Crop encoding failed"))),
      `image/${format}`,
      format === "png" ? undefined : 1
    );
  });
}
