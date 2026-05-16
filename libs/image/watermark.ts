import type { OutputFormat } from "./types";

// --- Types ---

export type WatermarkMode = "single" | "tiled";

export type PositionPreset =
  | "center"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center"
  | "left-center"
  | "right-center";

export interface TextWatermarkConfig {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number; // Percentage of image width (1-20)
  color: string; // HEX color
  opacity: number; // 0-100
  bold: boolean;
}

export interface LogoWatermarkConfig {
  type: "logo";
  bitmap: ImageBitmap; // Uploaded logo (caller manages lifecycle)
  scale: number; // Percentage of image width (5-50)
  opacity: number; // 0-100
}

export interface WatermarkOptions {
  mode: WatermarkMode;
  position: PositionPreset; // Used in single mode
  rotation: number; // Used in tiled mode, degrees (-90 to 90)
  spacing: number; // Used in tiled mode, multiplier (1.0 to 3.0)
}

// --- Pure helpers (unit-testable) ---

/**
 * Calculate the center position for a watermark given a 9-grid preset.
 * Padding is 5% of each canvas dimension from the edge.
 */
export function calculatePosition(
  preset: PositionPreset,
  canvasWidth: number,
  canvasHeight: number,
  markWidth: number,
  markHeight: number
): { x: number; y: number } {
  const padX = canvasWidth * 0.05;
  const padY = canvasHeight * 0.05;

  const positions: Record<PositionPreset, { x: number; y: number }> = {
    center: { x: canvasWidth / 2, y: canvasHeight / 2 },
    "top-left": { x: padX + markWidth / 2, y: padY + markHeight / 2 },
    "top-center": { x: canvasWidth / 2, y: padY + markHeight / 2 },
    "top-right": { x: canvasWidth - padX - markWidth / 2, y: padY + markHeight / 2 },
    "left-center": { x: padX + markWidth / 2, y: canvasHeight / 2 },
    "right-center": { x: canvasWidth - padX - markWidth / 2, y: canvasHeight / 2 },
    "bottom-left": { x: padX + markWidth / 2, y: canvasHeight - padY - markHeight / 2 },
    "bottom-center": { x: canvasWidth / 2, y: canvasHeight - padY - markHeight / 2 },
    "bottom-right": {
      x: canvasWidth - padX - markWidth / 2,
      y: canvasHeight - padY - markHeight / 2,
    },
  };

  return positions[preset];
}

/**
 * Generate a brick-pattern tiling grid of center points for tiled watermark mode.
 * Odd rows are offset by half the horizontal step.
 * Grid extends 1 unit beyond canvas bounds in each direction for rotation coverage.
 */
export function generateTilingGrid(
  canvasWidth: number,
  canvasHeight: number,
  markWidth: number,
  markHeight: number,
  spacing: number
): Array<{ x: number; y: number }> {
  const hStep = markWidth * spacing;
  const vStep = markHeight * spacing;

  if (hStep <= 0 || vStep <= 0) return [];

  const points: Array<{ x: number; y: number }> = [];
  const cols = Math.ceil(canvasWidth / hStep) + 2;
  const rows = Math.ceil(canvasHeight / vStep) + 2;

  for (let r = -1; r <= rows; r++) {
    const offset = r % 2 !== 0 ? hStep / 2 : 0;
    for (let c = -1; c <= cols; c++) {
      points.push({
        x: c * hStep + offset,
        y: r * vStep,
      });
    }
  }

  return points;
}

// --- Canvas rendering (internal helpers) ---

/**
 * Measure watermark dimensions in canvas pixels.
 */
function measureWatermark(
  ctx: CanvasRenderingContext2D,
  watermark: TextWatermarkConfig | LogoWatermarkConfig,
  canvasWidth: number
): { width: number; height: number } {
  if (watermark.type === "text") {
    const fontSizePx = Math.max(12, (watermark.fontSize / 100) * canvasWidth);
    const weight = watermark.bold ? "bold" : "normal";
    ctx.font = `${weight} ${fontSizePx}px ${watermark.fontFamily}`;
    const metrics = ctx.measureText(watermark.text);
    return { width: metrics.width, height: fontSizePx };
  } else {
    const scaledWidth = (watermark.scale / 100) * canvasWidth;
    const aspectRatio = watermark.bitmap.height / watermark.bitmap.width;
    return { width: scaledWidth, height: scaledWidth * aspectRatio };
  }
}

/**
 * Draw a watermark centered at (cx, cy) on the canvas.
 */
function drawWatermark(
  ctx: CanvasRenderingContext2D,
  watermark: TextWatermarkConfig | LogoWatermarkConfig,
  canvasWidth: number,
  cx: number,
  cy: number
): void {
  ctx.save();

  if (watermark.type === "text") {
    const fontSizePx = Math.max(12, (watermark.fontSize / 100) * canvasWidth);
    const weight = watermark.bold ? "bold" : "normal";
    ctx.font = `${weight} ${fontSizePx}px ${watermark.fontFamily}`;
    ctx.fillStyle = watermark.color;
    ctx.globalAlpha = watermark.opacity / 100;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = fontSizePx / 10;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText(watermark.text, cx, cy);
  } else {
    const scaledWidth = (watermark.scale / 100) * canvasWidth;
    const aspectRatio = watermark.bitmap.height / watermark.bitmap.width;
    const scaledHeight = scaledWidth * aspectRatio;
    ctx.globalAlpha = watermark.opacity / 100;
    ctx.drawImage(
      watermark.bitmap,
      cx - scaledWidth / 2,
      cy - scaledHeight / 2,
      scaledWidth,
      scaledHeight
    );
  }

  ctx.restore();
}

// --- Main render function ---

/**
 * Render a watermark onto a source image and return the result as a Blob.
 *
 * Pipeline: create canvas → draw source → apply watermark → toBlob.
 *
 * Why not reuse `encode()` from `libs/image/encode.ts`?
 * Watermark rendering requires inserting draw calls between drawing the source image
 * and calling `toBlob()`, which makes `encode()` unsuitable.
 */
export async function renderWatermark(
  sourceBitmap: ImageBitmap,
  outputFormat: OutputFormat,
  watermark: TextWatermarkConfig | LogoWatermarkConfig,
  options: WatermarkOptions
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = sourceBitmap.width;
  canvas.height = sourceBitmap.height;
  const ctx = canvas.getContext("2d")!;

  // Fill white background for JPEG (canvas alpha renders as black in JPEG)
  if (outputFormat === "jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw source image
  ctx.drawImage(sourceBitmap, 0, 0);

  // Measure watermark dimensions
  const { width: markWidth, height: markHeight } = measureWatermark(ctx, watermark, canvas.width);

  if (options.mode === "single") {
    // Single mode: one watermark at the 9-grid preset position
    const center = calculatePosition(
      options.position,
      canvas.width,
      canvas.height,
      markWidth,
      markHeight
    );
    drawWatermark(ctx, watermark, canvas.width, center.x, center.y);
  } else {
    // Tiled mode: brick-pattern grid with rotation
    const grid = generateTilingGrid(
      canvas.width,
      canvas.height,
      markWidth,
      markHeight,
      options.spacing
    );
    const radians = (options.rotation * Math.PI) / 180;

    for (const point of grid) {
      ctx.save();
      ctx.translate(point.x, point.y);
      ctx.rotate(radians);
      drawWatermark(ctx, watermark, canvas.width, 0, 0);
      ctx.restore();
    }
  }

  // Encode to blob
  return new Promise<Blob>((resolve, reject) => {
    const mimeType = `image/${outputFormat}`;
    const quality = outputFormat === "png" ? undefined : 0.92;

    canvas.toBlob(
      (blob) => {
        if (blob === null) {
          // Fallback to PNG if format not supported
          canvas.toBlob((fallbackBlob) => {
            if (fallbackBlob === null) {
              reject(new Error("Encoding failed"));
              return;
            }
            resolve(fallbackBlob);
          }, "image/png");
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}
