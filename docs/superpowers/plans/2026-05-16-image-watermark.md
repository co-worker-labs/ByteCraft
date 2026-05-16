# Image Watermark Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `/image-watermark` tool that lets users add text or logo watermarks to images, with real-time preview, single/tiled arrangement modes, and all processing running in the browser via Canvas API.

**Architecture:** Pure Canvas rendering pipeline in `libs/image/watermark.ts` — no external libraries. Page component follows `image-resize` pattern (left controls + right preview) with shared hooks (`useImageInput`, `useImageExport`) and 300ms debounced real-time preview. Tool registered in `libs/tools.ts` with i18n in 10 locales.

**Tech Stack:** TypeScript, Canvas API, React (client component), next-intl, Tailwind CSS 4, rc-slider, Vitest

---

## File Structure

### New files

| File                                                    | Responsibility                                                                     |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `libs/image/watermark.ts`                               | Types + pure helpers (position, tiling grid) + `renderWatermark()` canvas function |
| `libs/image/__tests__/watermark.test.ts`                | Unit tests for `calculatePosition` and `generateTilingGrid`                        |
| `app/[locale]/image-watermark/page.tsx`                 | Route entry — metadata, SEO, JSON-LD                                               |
| `app/[locale]/image-watermark/image-watermark-page.tsx` | Page component — UI + business logic (client)                                      |
| `public/locales/en/image-watermark.json`                | English translations                                                               |
| `public/locales/zh-CN/image-watermark.json`             | Simplified Chinese translations                                                    |
| `public/locales/zh-TW/image-watermark.json`             | Traditional Chinese translations                                                   |
| `public/locales/ja/image-watermark.json`                | Japanese translations                                                              |
| `public/locales/ko/image-watermark.json`                | Korean translations                                                                |
| `public/locales/es/image-watermark.json`                | Spanish translations                                                               |
| `public/locales/pt-BR/image-watermark.json`             | Brazilian Portuguese translations                                                  |
| `public/locales/fr/image-watermark.json`                | French translations                                                                |
| `public/locales/de/image-watermark.json`                | German translations                                                                |
| `public/locales/ru/image-watermark.json`                | Russian translations                                                               |

### Modified files

| File                              | Change                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| `libs/tools.ts`                   | Add `Droplets` import, append tool entry, update `TOOL_CATEGORIES`, update `TOOL_RELATIONS` |
| `public/locales/en/tools.json`    | Append `image-watermark` entry                                                              |
| `public/locales/zh-CN/tools.json` | Append `image-watermark` entry with `searchTerms`                                           |
| `public/locales/zh-TW/tools.json` | Append `image-watermark` entry with `searchTerms`                                           |
| `public/locales/ja/tools.json`    | Append `image-watermark` entry with `searchTerms`                                           |
| `public/locales/ko/tools.json`    | Append `image-watermark` entry with `searchTerms`                                           |
| `public/locales/es/tools.json`    | Append `image-watermark` entry                                                              |
| `public/locales/pt-BR/tools.json` | Append `image-watermark` entry                                                              |
| `public/locales/fr/tools.json`    | Append `image-watermark` entry                                                              |
| `public/locales/de/tools.json`    | Append `image-watermark` entry                                                              |
| `public/locales/ru/tools.json`    | Append `image-watermark` entry                                                              |

---

## Task 1: Watermark Types + Pure Helpers + Tests

**Files:**

- Create: `libs/image/watermark.ts`
- Create: `libs/image/__tests__/watermark.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `libs/image/__tests__/watermark.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { calculatePosition, generateTilingGrid } from "../watermark";
import type { PositionPreset } from "../watermark";

describe("calculatePosition", () => {
  const cw = 1000;
  const ch = 800;
  const mw = 100;
  const mh = 50;

  it("returns center of canvas for center preset", () => {
    const pos = calculatePosition("center", cw, ch, mw, mh);
    expect(pos).toEqual({ x: 500, y: 400 });
  });

  it("returns padded top-left position", () => {
    const pos = calculatePosition("top-left", cw, ch, mw, mh);
    // padX = 50, padY = 40
    // x = padX + mw/2 = 100, y = padY + mh/2 = 65
    expect(pos).toEqual({ x: 100, y: 65 });
  });

  it("returns padded top-center position", () => {
    const pos = calculatePosition("top-center", cw, ch, mw, mh);
    expect(pos).toEqual({ x: 500, y: 65 });
  });

  it("returns padded top-right position", () => {
    const pos = calculatePosition("top-right", cw, ch, mw, mh);
    expect(pos).toEqual({ x: 900, y: 65 });
  });

  it("returns padded left-center position", () => {
    const pos = calculatePosition("left-center", cw, ch, mw, mh);
    expect(pos).toEqual({ x: 100, y: 400 });
  });

  it("returns padded right-center position", () => {
    const pos = calculatePosition("right-center", cw, ch, mw, mh);
    expect(pos).toEqual({ x: 900, y: 400 });
  });

  it("returns padded bottom-left position", () => {
    const pos = calculatePosition("bottom-left", cw, ch, mw, mh);
    expect(pos).toEqual({ x: 100, y: 735 });
  });

  it("returns padded bottom-center position", () => {
    const pos = calculatePosition("bottom-center", cw, ch, mw, mh);
    expect(pos).toEqual({ x: 500, y: 735 });
  });

  it("returns padded bottom-right position", () => {
    const pos = calculatePosition("bottom-right", cw, ch, mw, mh);
    expect(pos).toEqual({ x: 900, y: 735 });
  });

  it("handles larger mark dimensions correctly", () => {
    const pos = calculatePosition("top-left", cw, ch, 200, 100);
    // x = 50 + 100 = 150, y = 40 + 50 = 90
    expect(pos).toEqual({ x: 150, y: 90 });
  });
});

describe("generateTilingGrid", () => {
  const cw = 1000;
  const ch = 800;
  const mw = 100;
  const mh = 50;

  it("generates grid points for a canvas", () => {
    const points = generateTilingGrid(cw, ch, mw, mh, 2.0);
    expect(points.length).toBeGreaterThan(0);
  });

  it("extends grid beyond canvas bounds for overflow coverage", () => {
    const points = generateTilingGrid(cw, ch, mw, mh, 2.0);
    const hasNegativeX = points.some((p) => p.x < 0);
    const hasNegativeY = points.some((p) => p.y < 0);
    const hasBeyondRight = points.some((p) => p.x > cw);
    const hasBeyondBottom = points.some((p) => p.y > ch);
    expect(hasNegativeX || hasNegativeY || hasBeyondRight || hasBeyondBottom).toBe(true);
  });

  it("offsets odd rows by half the horizontal step", () => {
    const points = generateTilingGrid(1000, 800, 100, 50, 2.0);
    const hStep = 100 * 2.0; // 200
    const vStep = 50 * 2.0; // 100

    // Find row 0 and row 1 points
    const row0Y = -1 * vStep;
    const row1Y = 0 * vStep;
    const row0Points = points.filter((p) => Math.abs(p.y - row0Y) < 0.01);
    const row1Points = points.filter((p) => Math.abs(p.y - row1Y) < 0.01);

    // Row 0 (r=-1): offset = hStep/2 = 100 (since -1 % 2 !== 0)
    // Row 1 (r=0): offset = 0 (since 0 % 2 === 0)
    if (row0Points.length > 0 && row1Points.length > 0) {
      expect(row0Points[0].x).toBeCloseTo(row1Points[0].x + hStep / 2);
    }
  });

  it("generates more points with smaller spacing", () => {
    const dense = generateTilingGrid(cw, ch, mw, mh, 1.0);
    const sparse = generateTilingGrid(cw, ch, mw, mh, 3.0);
    expect(dense.length).toBeGreaterThan(sparse.length);
  });

  it("returns empty array for zero mark dimensions", () => {
    const points = generateTilingGrid(cw, ch, 0, mh, 2.0);
    expect(points).toEqual([]);
  });

  it("returns empty array for zero spacing", () => {
    const points = generateTilingGrid(cw, ch, mw, mh, 0);
    expect(points).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run libs/image/__tests__/watermark.test.ts`
Expected: FAIL — `Cannot find module "../watermark"`

- [ ] **Step 3: Write types + pure helpers**

Create `libs/image/watermark.ts`:

```typescript
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run libs/image/__tests__/watermark.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add libs/image/watermark.ts libs/image/__tests__/watermark.test.ts
git commit -m "feat(watermark): add types, pure helpers, render function, and unit tests"
```

---

## Task 2: Tool Registration

**Files:**

- Modify: `libs/tools.ts`

- [ ] **Step 1: Add `Droplets` import and tool entry to `libs/tools.ts`**

Add `Droplets` to the lucide-react import block (after `FileStack`):

```typescript
import {
  // ... existing imports ...
  FileStack,
  Droplets,
} from "lucide-react";
```

Append to the `TOOLS` array (before the closing `];`):

```typescript
  {
    key: "image-watermark",
    path: "/image-watermark",
    icon: Droplets,
    emoji: "💧",
    sameAs: [],
  },
```

Update `TOOL_CATEGORIES` — insert `"image-watermark"` after `"image-convert"`, before `"image-crop"` in the `visual` category:

```typescript
  {
    key: "visual",
    tools: [
      "color",
      "image-resize",
      "image-compress",
      "image-convert",
      "image-watermark",
      "image-crop",
      "image-rotate",
      "pdf-merge",
    ],
  },
```

Update `TOOL_RELATIONS` — add new entry and update existing image tool entries:

```typescript
  "image-watermark": ["image-resize", "image-compress", "image-convert", "image-crop", "image-rotate", "color"],
  "image-resize": ["image-compress", "image-convert", "image-crop", "image-rotate", "image-watermark"],
  "image-compress": ["image-resize", "image-convert", "image-crop", "image-rotate", "pdf-merge", "image-watermark"],
  "image-convert": ["image-resize", "image-compress", "image-crop", "image-rotate", "pdf-merge", "image-watermark"],
  "image-crop": ["image-resize", "image-compress", "image-convert", "image-rotate", "image-watermark"],
  "image-rotate": ["image-resize", "image-compress", "image-convert", "image-crop", "image-watermark"],
  "color": ["image-resize", "image-compress", "image-convert", "image-watermark", "numbase", "cssunit"],
```

Note: Replace the existing entries for `image-resize`, `image-compress`, `image-convert`, `image-crop`, `image-rotate`, and `color` — only append `"image-watermark"` to each existing array, do not remove any existing relations.

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to tools.ts

- [ ] **Step 3: Commit**

```bash
git add libs/tools.ts
git commit -m "feat(watermark): register image-watermark tool in tools registry"
```

---

## Task 3: English i18n

**Files:**

- Modify: `public/locales/en/tools.json`
- Create: `public/locales/en/image-watermark.json`

- [ ] **Step 1: Append entry to `public/locales/en/tools.json`**

Add the `image-watermark` entry to the JSON object (after the last existing entry):

```json
  "image-watermark": {
    "title": "Image Watermark - Add Text or Logo Watermark",
    "shortTitle": "Image Watermark",
    "description": "Add text or logo watermarks to images. Customize position, opacity, rotation, and tiling. Supports PNG, JPG, WebP. All processing runs in your browser."
  }
```

- [ ] **Step 2: Create `public/locales/en/image-watermark.json`**

```json
{
  "dropImage": "Drop an image here or click to select",
  "supportedFormats": "Supports PNG, JPG, WebP, GIF, BMP, SVG",
  "reselect": "Reselect",
  "copyToClipboard": "Copy to clipboard",
  "copiedToClipboard": "Copied to clipboard as PNG",
  "original": "Original",
  "result": "Result",
  "processing": "Processing...",
  "encodingFailed": "Encoding failed for this format",
  "firstFrameOnly": "Animated image — only the first frame is used",
  "largeImage": "Large image ({w}×{h}) — processing may be slow",
  "formatNotSupported": "This image format is not supported. Please use PNG, JPG, WebP, GIF, BMP, or SVG.",
  "typeText": "Text",
  "typeLogo": "Logo",
  "modeSingle": "Single",
  "modeTiled": "Tiled",
  "textContent": "Text",
  "fontFamily": "Font",
  "fontArial": "Arial",
  "fontHelvetica": "Helvetica",
  "fontGeorgia": "Georgia",
  "fontCourierNew": "Courier New",
  "fontSystemUI": "System UI",
  "fontSansSerif": "Sans Serif",
  "fontSize": "Size",
  "color": "Color",
  "opacity": "Opacity",
  "bold": "Bold",
  "uploadLogo": "Upload Logo",
  "logoSupportedFormats": "PNG, JPG, WebP",
  "logoScale": "Scale",
  "position": "Position",
  "positionCenter": "C",
  "positionTopLeft": "↖",
  "positionTopCenter": "↑",
  "positionTopRight": "↗",
  "positionLeftCenter": "←",
  "positionRightCenter": "→",
  "positionBottomLeft": "↙",
  "positionBottomCenter": "↓",
  "positionBottomRight": "↘",
  "rotation": "Rotation",
  "tiledSpacing": "Spacing",
  "descriptions": {
    "title": "About Image Watermark",
    "aeoDefinition": "Image Watermark is a free online tool for adding text or logo watermarks to images with customizable position, opacity, rotation, and tiling. All processing runs locally in your browser.",
    "whatIsTitle": "What is Image Watermark?",
    "whatIs": "Add text or logo watermarks to your images directly in the browser. Choose from single placement or tiled patterns, adjust opacity, rotation, and position. Supports PNG, JPG, and WebP formats. No data is uploaded — all processing uses the HTML5 Canvas API.",
    "stepsTitle": "How to Add a Watermark to an Image",
    "step1Title": "Drop or select an image",
    "step1Text": "Drag and drop an image onto the drop zone, or click to browse. Supports PNG, JPG, WebP, GIF, BMP, and SVG input.",
    "step2Title": "Configure your watermark",
    "step2Text": "Choose between text or logo watermark. Adjust font, size, color, opacity, and position. Use tiled mode for copyright protection with repeated watermarks across the image.",
    "step3Title": "Download or copy",
    "step3Text": "Preview the result in real-time, then download the watermarked image or copy it to your clipboard.",
    "p1": "Add text or logo watermarks to images directly in your browser. Resize images with [Image Resizer](/image-resize), compress with [Image Compressor](/image-compress), or convert formats with [Image Converter](/image-convert).",
    "p2": "Supports PNG, JPG, and WebP output. The output format matches the input format automatically. Text watermarks include a shadow for readability on any background.",
    "faq1Q": "Does this tool upload my images?",
    "faq1A": "No. All image processing happens in your browser using the Canvas API. Your images never leave your device.",
    "faq2Q": "Can I use a custom font for text watermarks?",
    "faq2A": "Currently, only system fonts are available (Arial, Helvetica, Georgia, Courier New, System UI, Sans Serif). Custom font upload may be added in a future update.",
    "faq3Q": "What is tiled watermark mode?",
    "faq3A": "Tiled mode repeats your watermark across the entire image in a diagonal pattern. This is useful for copyright protection, as the watermark cannot be easily cropped out."
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/en/tools.json public/locales/en/image-watermark.json
git commit -m "feat(watermark): add English i18n translations"
```

---

## Task 4: Route Entry Page

**Files:**

- Create: `app/[locale]/image-watermark/page.tsx`

- [ ] **Step 1: Create `app/[locale]/image-watermark/page.tsx`**

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import ImageWatermarkPage from "./image-watermark-page";

const PATH = "/image-watermark";
const TOOL_KEY = "image-watermark";
const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("image-watermark.title"),
    description: t("image-watermark.description"),
    ogImage: { type: "tool", key: TOOL_KEY },
  });
}

export default async function ImageWatermarkRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "image-watermark" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("image-watermark.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("image-watermark.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems: [1, 2, 3].map((i) => ({
      q: tx(`descriptions.faq${i}Q`),
      a: tx(`descriptions.faq${i}A`),
    })),
    howToSteps,
    sameAs: tool.sameAs,
  });

  return (
    <>
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
      <ImageWatermarkPage />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/image-watermark/page.tsx
git commit -m "feat(watermark): add route entry with SEO metadata and JSON-LD"
```

---

## Task 5: Main Page Component

**Files:**

- Create: `app/[locale]/image-watermark/image-watermark-page.tsx`

- [ ] **Step 1: Create `app/[locale]/image-watermark/image-watermark-page.tsx`**

```tsx
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

  // Build watermark config
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

  // Options
  const options: WatermarkOptions = {
    mode: arrangementMode,
    position,
    rotation,
    spacing: tiledSpacing,
  };

  // Render pipeline with debounce
  useEffect(() => {
    if (!sourceBitmap || !watermark) return;

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
  }, [sourceBitmap, outputFormat, watermark, options]);

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
```

- [ ] **Step 2: Verify the page renders**

Run: `npm run dev`
Navigate to `http://localhost:3000/image-watermark`
Expected: Page loads with drop zone, no console errors

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/image-watermark/image-watermark-page.tsx
git commit -m "feat(watermark): add main page component with controls and preview"
```

---

## Task 6: Simplified Chinese (zh-CN) i18n

**Files:**

- Modify: `public/locales/zh-CN/tools.json`
- Create: `public/locales/zh-CN/image-watermark.json`

- [ ] **Step 1: Append entry to `public/locales/zh-CN/tools.json`**

```json
  "image-watermark": {
    "title": "图片水印 - 添加文字或 Logo 水印",
    "shortTitle": "图片水印",
    "description": "为图片添加文字或 Logo 水印，自定义位置、透明度、旋转和平铺。支持 PNG、JPG、WebP。所有处理在浏览器本地完成。",
    "searchTerms": "tupianshuiyin tpsy shuiyin yinji banquan"
  }
```

- [ ] **Step 2: Create `public/locales/zh-CN/image-watermark.json`**

```json
{
  "dropImage": "拖放图片到此处，或点击选择",
  "supportedFormats": "支持 PNG、JPG、WebP、GIF、BMP、SVG",
  "reselect": "重新选择",
  "copyToClipboard": "复制到剪贴板",
  "copiedToClipboard": "已复制到剪贴板（PNG 格式）",
  "original": "原图",
  "result": "结果",
  "processing": "处理中...",
  "encodingFailed": "此格式编码失败",
  "firstFrameOnly": "动态图片 — 仅使用第一帧",
  "largeImage": "大尺寸图片（{w}×{h}）— 处理可能较慢",
  "formatNotSupported": "不支持此图片格式，请使用 PNG、JPG、WebP、GIF、BMP 或 SVG。",
  "typeText": "文字",
  "typeLogo": "Logo",
  "modeSingle": "单个",
  "modeTiled": "平铺",
  "textContent": "文字",
  "fontFamily": "字体",
  "fontArial": "Arial",
  "fontHelvetica": "Helvetica",
  "fontGeorgia": "Georgia",
  "fontCourierNew": "Courier New",
  "fontSystemUI": "系统字体",
  "fontSansSerif": "无衬线",
  "fontSize": "大小",
  "color": "颜色",
  "opacity": "透明度",
  "bold": "加粗",
  "uploadLogo": "上传 Logo",
  "logoSupportedFormats": "PNG、JPG、WebP",
  "logoScale": "缩放",
  "position": "位置",
  "positionCenter": "中",
  "positionTopLeft": "↖",
  "positionTopCenter": "↑",
  "positionTopRight": "↗",
  "positionLeftCenter": "←",
  "positionRightCenter": "→",
  "positionBottomLeft": "↙",
  "positionBottomCenter": "↓",
  "positionBottomRight": "↘",
  "rotation": "旋转",
  "tiledSpacing": "间距",
  "descriptions": {
    "title": "关于图片水印工具",
    "aeoDefinition": "图片水印是一个免费的在线工具，用于为图片添加文字或 Logo 水印，支持自定义位置、透明度、旋转和平铺。所有处理在浏览器本地完成。",
    "whatIsTitle": "什么是图片水印工具？",
    "whatIs": "在浏览器中直接为图片添加文字或 Logo 水印。支持单个放置和平铺模式，可调整透明度、旋转角度和位置。支持 PNG、JPG、WebP 格式。所有处理使用 HTML5 Canvas API，不上传任何数据。",
    "stepsTitle": "如何为图片添加水印",
    "step1Title": "拖放或选择图片",
    "step1Text": "将图片拖放到上传区域，或点击浏览文件。支持 PNG、JPG、WebP、GIF、BMP、SVG 输入。",
    "step2Title": "配置水印",
    "step2Text": "选择文字或 Logo 水印类型，调整字体、大小、颜色、透明度和位置。使用平铺模式可在整个图片上重复水印，用于版权保护。",
    "step3Title": "下载或复制",
    "step3Text": "实时预览效果后，下载水印图片或复制到剪贴板。",
    "p1": "在浏览器中直接为图片添加文字或 Logo 水印。使用 [图片缩放](/image-resize) 调整尺寸，[图片压缩](/image-compress) 压缩文件，或 [图片转换](/image-convert) 转换格式。",
    "p2": "支持 PNG、JPG、WebP 输出格式。输出格式自动匹配输入格式。文字水印自带阴影，确保在任何背景上清晰可见。",
    "faq1Q": "这个工具会上传我的图片吗？",
    "faq1A": "不会。所有图片处理都在浏览器中通过 Canvas API 完成，图片不会离开你的设备。",
    "faq2Q": "可以使用自定义字体吗？",
    "faq2A": "目前仅支持系统字体（Arial、Helvetica、Georgia、Courier New、系统字体、无衬线字体）。自定义字体上传功能可能会在未来版本中添加。",
    "faq3Q": "什么是平铺水印模式？",
    "faq3A": "平铺模式在整个图片上以对角线方式重复水印。适用于版权保护，因为水印无法被轻易裁剪掉。"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/zh-CN/tools.json public/locales/zh-CN/image-watermark.json
git commit -m "feat(watermark): add Simplified Chinese i18n"
```

---

## Task 7: Traditional Chinese (zh-TW) i18n

**Files:**

- Modify: `public/locales/zh-TW/tools.json`
- Create: `public/locales/zh-TW/image-watermark.json`

- [ ] **Step 1: Append entry to `public/locales/zh-TW/tools.json`**

```json
  "image-watermark": {
    "title": "圖片浮水印 - 新增文字或 Logo 浮水印",
    "shortTitle": "圖片浮水印",
    "description": "為圖片新增文字或 Logo 浮水印，自訂位置、透明度、旋轉和拼貼。支援 PNG、JPG、WebP。所有處理在瀏覽器本機完成。",
    "searchTerms": "tupianfushuiyin tpfyy fushuiyin yinji banquan"
  }
```

- [ ] **Step 2: Create `public/locales/zh-TW/image-watermark.json`**

```json
{
  "dropImage": "拖放圖片到此處，或點擊選擇",
  "supportedFormats": "支援 PNG、JPG、WebP、GIF、BMP、SVG",
  "reselect": "重新選擇",
  "copyToClipboard": "複製到剪貼簿",
  "copiedToClipboard": "已複製到剪貼簿（PNG 格式）",
  "original": "原圖",
  "result": "結果",
  "processing": "處理中...",
  "encodingFailed": "此格式編碼失敗",
  "firstFrameOnly": "動態圖片 — 僅使用第一幀",
  "largeImage": "大尺寸圖片（{w}×{h}）— 處理可能較慢",
  "formatNotSupported": "不支援此圖片格式，請使用 PNG、JPG、WebP、GIF、BMP 或 SVG。",
  "typeText": "文字",
  "typeLogo": "Logo",
  "modeSingle": "單個",
  "modeTiled": "拼貼",
  "textContent": "文字",
  "fontFamily": "字型",
  "fontArial": "Arial",
  "fontHelvetica": "Helvetica",
  "fontGeorgia": "Georgia",
  "fontCourierNew": "Courier New",
  "fontSystemUI": "系統字型",
  "fontSansSerif": "無襯線",
  "fontSize": "大小",
  "color": "顏色",
  "opacity": "透明度",
  "bold": "粗體",
  "uploadLogo": "上傳 Logo",
  "logoSupportedFormats": "PNG、JPG、WebP",
  "logoScale": "縮放",
  "position": "位置",
  "positionCenter": "中",
  "positionTopLeft": "↖",
  "positionTopCenter": "↑",
  "positionTopRight": "↗",
  "positionLeftCenter": "←",
  "positionRightCenter": "→",
  "positionBottomLeft": "↙",
  "positionBottomCenter": "↓",
  "positionBottomRight": "↘",
  "rotation": "旋轉",
  "tiledSpacing": "間距",
  "descriptions": {
    "title": "關於圖片浮水印工具",
    "aeoDefinition": "圖片浮水印是一個免費的線上工具，用於為圖片新增文字或 Logo 浮水印，支援自訂位置、透明度、旋轉和拼貼。所有處理在瀏覽器本機完成。",
    "whatIsTitle": "什麼是圖片浮水印工具？",
    "whatIs": "在瀏覽器中直接為圖片新增文字或 Logo 浮水印。支援單個放置和拼貼模式，可調整透明度、旋轉角度和位置。支援 PNG、JPG、WebP 格式。所有處理使用 HTML5 Canvas API，不上傳任何資料。",
    "stepsTitle": "如何為圖片新增浮水印",
    "step1Title": "拖放或選擇圖片",
    "step1Text": "將圖片拖放到上傳區域，或點擊瀏覽檔案。支援 PNG、JPG、WebP、GIF、BMP、SVG 輸入。",
    "step2Title": "設定浮水印",
    "step2Text": "選擇文字或 Logo 浮水印類型，調整字型、大小、顏色、透明度和位置。使用拼貼模式可在整個圖片上重複浮水印，用於版權保護。",
    "step3Title": "下載或複製",
    "step3Text": "即時預覽效果後，下載浮水印圖片或複製到剪貼簿。",
    "p1": "在瀏覽器中直接為圖片新增文字或 Logo 浮水印。使用 [圖片縮放](/image-resize) 調整尺寸，[圖片壓縮](/image-compress) 壓縮檔案，或 [圖片轉換](/image-convert) 轉換格式。",
    "p2": "支援 PNG、JPG、WebP 輸出格式。輸出格式自動匹配輸入格式。文字浮水印自帶陰影，確保在任何背景上清晰可見。",
    "faq1Q": "這個工具會上傳我的圖片嗎？",
    "faq1A": "不會。所有圖片處理都在瀏覽器中透過 Canvas API 完成，圖片不會離開您的裝置。",
    "faq2Q": "可以使用自訂字型嗎？",
    "faq2A": "目前僅支援系統字型（Arial、Helvetica、Georgia、Courier New、系統字型、無襯線字型）。自訂字型上傳功能可能會在未來版本中新增。",
    "faq3Q": "什麼是拼貼浮水印模式？",
    "faq3A": "拼貼模式在整個圖片上以對角線方式重複浮水印。適用於版權保護，因為浮水印無法被輕易裁剪掉。"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/zh-TW/tools.json public/locales/zh-TW/image-watermark.json
git commit -m "feat(watermark): add Traditional Chinese i18n"
```

---

## Task 8: Japanese (ja) i18n

**Files:**

- Modify: `public/locales/ja/tools.json`
- Create: `public/locales/ja/image-watermark.json`

- [ ] **Step 1: Append entry to `public/locales/ja/tools.json`**

```json
  "image-watermark": {
    "title": "画像ウォーターマーク - テキスト・ロゴ透かし追加",
    "shortTitle": "画像ウォーターマーク",
    "description": "画像にテキストまたはロゴのウォーターマークを追加。位置、透明度、回転、タイル配置をカスタマイズ。PNG、JPG、WebP対応。全ての処理はブラウザで実行。",
    "searchTerms": "gazouotamaku gotmk mizushi shomei rogo"
  }
```

- [ ] **Step 2: Create `public/locales/ja/image-watermark.json`**

```json
{
  "dropImage": "画像をドロップまたはクリックして選択",
  "supportedFormats": "PNG、JPG、WebP、GIF、BMP、SVG対応",
  "reselect": "再選択",
  "copyToClipboard": "クリップボードにコピー",
  "copiedToClipboard": "PNG形式でクリップボードにコピーしました",
  "original": "元画像",
  "result": "結果",
  "processing": "処理中...",
  "encodingFailed": "この形式のエンコードに失敗しました",
  "firstFrameOnly": "アニメーション画像 — 最初のフレームのみ使用",
  "largeImage": "大きな画像（{w}×{h}）— 処理に時間がかかる場合があります",
  "formatNotSupported": "この画像形式はサポートされていません。PNG、JPG、WebP、GIF、BMP、SVGをご利用ください。",
  "typeText": "テキスト",
  "typeLogo": "ロゴ",
  "modeSingle": "単一",
  "modeTiled": "タイル",
  "textContent": "テキスト",
  "fontFamily": "フォント",
  "fontArial": "Arial",
  "fontHelvetica": "Helvetica",
  "fontGeorgia": "Georgia",
  "fontCourierNew": "Courier New",
  "fontSystemUI": "システムUI",
  "fontSansSerif": "Sans Serif",
  "fontSize": "サイズ",
  "color": "色",
  "opacity": "透明度",
  "bold": "太字",
  "uploadLogo": "ロゴをアップロード",
  "logoSupportedFormats": "PNG、JPG、WebP",
  "logoScale": "スケール",
  "position": "位置",
  "positionCenter": "中",
  "positionTopLeft": "↖",
  "positionTopCenter": "↑",
  "positionTopRight": "↗",
  "positionLeftCenter": "←",
  "positionRightCenter": "→",
  "positionBottomLeft": "↙",
  "positionBottomCenter": "↓",
  "positionBottomRight": "↘",
  "rotation": "回転",
  "tiledSpacing": "間隔",
  "descriptions": {
    "title": "画像ウォーターマークについて",
    "aeoDefinition": "画像ウォーターマークは、画像にテキストやロゴの透かしを追加できる無料オンラインツールです。位置、透明度、回転、タイル配置をカスタマイズ可能。全ての処理はブラウザで実行されます。",
    "whatIsTitle": "画像ウォーターマークとは？",
    "whatIs": "ブラウザ上で画像にテキストまたはロゴのウォーターマークを追加。単一配置とタイル配置に対応し、透明度、回転角度、位置を調整できます。PNG、JPG、WebP形式に対応。データはアップロードされず、HTML5 Canvas APIで処理されます。",
    "stepsTitle": "画像にウォーターマークを追加する方法",
    "step1Title": "画像をドロップまたは選択",
    "step1Text": "ドロップゾーンに画像をドラッグ＆ドロップ、またはクリックしてファイルを選択。PNG、JPG、WebP、GIF、BMP、SVGに対応しています。",
    "step2Title": "ウォーターマークを設定",
    "step2Text": "テキストまたはロゴを選択し、フォント、サイズ、色、透明度、位置を調整します。タイルモードを使うと、画像全体にウォーターマークを繰り返し配置でき、著作権保護に有効です。",
    "step3Title": "ダウンロードまたはコピー",
    "step3Text": "リアルタイムプレビューで確認後、ウォーターマーク付き画像をダウンロードまたはクリップボードにコピーします。",
    "p1": "ブラウザ上で画像にテキストやロゴのウォーターマークを追加。[画像リサイズ](/image-resize)でサイズ変更、[画像圧縮](/image-compress)で圧縮、[画像変換](/image-convert)で形式変換も。",
    "p2": "PNG、JPG、WebPの出力に対応。出力形式は入力形式に自動的に合わせられます。テキストウォーターマークには影が付き、どんな背景でも読みやすくなります。",
    "faq1Q": "画像はサーバーにアップロードされますか？",
    "faq1A": "いいえ。全ての画像処理はCanvas APIによりブラウザ上で行われます。画像が外部に送信されることはありません。",
    "faq2Q": "カスタムフォントは使えますか？",
    "faq2A": "現在はシステムフォントのみ対応しています（Arial、Helvetica、Georgia、Courier New、System UI、Sans Serif）。カスタムフォントのアップロードは今後のアップデートで追加される可能性があります。",
    "faq3Q": "タイルウォーターマークモードとは？",
    "faq3A": "タイルモードは、画像全体にウォーターマークを斜めパターンで繰り返し配置します。ウォーターマークを簡単に切り抜けないため、著作権保護に適しています。"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/ja/tools.json public/locales/ja/image-watermark.json
git commit -m "feat(watermark): add Japanese i18n"
```

---

## Task 9: Korean (ko) i18n

**Files:**

- Modify: `public/locales/ko/tools.json`
- Create: `public/locales/ko/image-watermark.json`

- [ ] **Step 1: Append entry to `public/locales/ko/tools.json`**

```json
  "image-watermark": {
    "title": "이미지 워터마크 - 텍스트 또는 로고 워터마크 추가",
    "shortTitle": "이미지 워터마크",
    "description": "이미지에 텍스트 또는 로고 워터마크를 추가합니다. 위치, 투명도, 회전, 타일 배치를 맞춤 설정. PNG, JPG, WebP 지원. 모든 처리는 브라우저에서 실행됩니다.",
    "searchTerms": "imijiwoteomakeu ijwtk sutakka ugin rogo"
  }
```

- [ ] **Step 2: Create `public/locales/ko/image-watermark.json`**

```json
{
  "dropImage": "이미지를 드롭하거나 클릭하여 선택",
  "supportedFormats": "PNG, JPG, WebP, GIF, BMP, SVG 지원",
  "reselect": "다시 선택",
  "copyToClipboard": "클립보드에 복사",
  "copiedToClipboard": "PNG 형식으로 클립보드에 복사됨",
  "original": "원본",
  "result": "결과",
  "processing": "처리 중...",
  "encodingFailed": "이 형식의 인코딩에 실패했습니다",
  "firstFrameOnly": "애니메이션 이미지 — 첫 번째 프레임만 사용",
  "largeImage": "큰 이미지({w}×{h}) — 처리가 느릴 수 있습니다",
  "formatNotSupported": "지원되지 않는 이미지 형식입니다. PNG, JPG, WebP, GIF, BMP, SVG를 사용해 주세요.",
  "typeText": "텍스트",
  "typeLogo": "로고",
  "modeSingle": "단일",
  "modeTiled": "타일",
  "textContent": "텍스트",
  "fontFamily": "글꼴",
  "fontArial": "Arial",
  "fontHelvetica": "Helvetica",
  "fontGeorgia": "Georgia",
  "fontCourierNew": "Courier New",
  "fontSystemUI": "시스템 UI",
  "fontSansSerif": "Sans Serif",
  "fontSize": "크기",
  "color": "색상",
  "opacity": "투명도",
  "bold": "굵게",
  "uploadLogo": "로고 업로드",
  "logoSupportedFormats": "PNG, JPG, WebP",
  "logoScale": "크기 조절",
  "position": "위치",
  "positionCenter": "중",
  "positionTopLeft": "↖",
  "positionTopCenter": "↑",
  "positionTopRight": "↗",
  "positionLeftCenter": "←",
  "positionRightCenter": "→",
  "positionBottomLeft": "↙",
  "positionBottomCenter": "↓",
  "positionBottomRight": "↘",
  "rotation": "회전",
  "tiledSpacing": "간격",
  "descriptions": {
    "title": "이미지 워터마크 정보",
    "aeoDefinition": "이미지 워터마크는 이미지에 텍스트 또는 로고 워터마크를 추가할 수 있는 무료 온라인 도구입니다. 위치, 투명도, 회전, 타일 배치를 맞춤 설정할 수 있습니다. 모든 처리는 브라우저에서 로컬로 실행됩니다.",
    "whatIsTitle": "이미지 워터마크란?",
    "whatIs": "브라우저에서 이미지에 텍스트 또는 로고 워터마크를 바로 추가합니다. 단일 배치와 타일 패턴을 선택하고, 투명도, 회전, 위치를 조절하세요. PNG, JPG, WebP 형식을 지원합니다. 데이터는 업로드되지 않으며, HTML5 Canvas API로 처리됩니다.",
    "stepsTitle": "이미지에 워터마크 추가하는 방법",
    "step1Title": "이미지를 드롭하거나 선택",
    "step1Text": "드롭존에 이미지를 드래그 앤 드롭하거나 클릭하여 파일을 선택하세요. PNG, JPG, WebP, GIF, BMP, SVG 입력을 지원합니다.",
    "step2Title": "워터마크 설정",
    "step2Text": "텍스트 또는 로고 워터마크를 선택하고 글꼴, 크기, 색상, 투명도, 위치를 조절합니다. 타일 모드를 사용하면 이미지 전체에 워터마크를 반복 배치하여 저작권 보호에 효과적입니다.",
    "step3Title": "다운로드 또는 복사",
    "step3Text": "실시간 미리보기로 확인한 후, 워터마크가 적용된 이미지를 다운로드하거나 클립보드에 복사하세요.",
    "p1": "브라우저에서 이미지에 텍스트 또는 로고 워터마크를 바로 추가합니다. [이미지 리사이즈](/image-resize)로 크기 조절, [이미지 압축](/image-compress)으로 압축, [이미지 변환](/image-convert)으로 형식 변환도 가능합니다.",
    "p2": "PNG, JPG, WebP 출력을 지원합니다. 출력 형식은 입력 형식에 자동으로 맞춰집니다. 텍스트 워터마크에는 그림자가 포함되어 어떤 배경에서도 읽기 쉽습니다.",
    "faq1Q": "이 도구는 제 이미지를 서버에 업로드하나요?",
    "faq1A": "아니요. 모든 이미지 처리는 Canvas API를 통해 브라우저에서 이루어집니다. 이미지가 기기를 떠나지 않습니다.",
    "faq2Q": "사용자 정의 글꼴을 사용할 수 있나요?",
    "faq2A": "현재는 시스템 글꼴만 지원됩니다 (Arial, Helvetica, Georgia, Courier New, System UI, Sans Serif). 사용자 정의 글꼴 업로드는 향후 업데이트에서 추가될 수 있습니다.",
    "faq3Q": "타일 워터마크 모드란?",
    "faq3A": "타일 모드는 이미지 전체에 대각선 패턴으로 워터마크를 반복 배치합니다. 워터마크를 쉽게 잘라낼 수 없어 저작권 보호에 유용합니다."
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/ko/tools.json public/locales/ko/image-watermark.json
git commit -m "feat(watermark): add Korean i18n"
```

---

## Task 10: Spanish (es) i18n

**Files:**

- Modify: `public/locales/es/tools.json`
- Create: `public/locales/es/image-watermark.json`

- [ ] **Step 1: Append entry to `public/locales/es/tools.json`**

```json
  "image-watermark": {
    "title": "Marca de Agua - Añadir Texto o Logo a Imágenes",
    "shortTitle": "Marca de Agua",
    "description": "Añade marcas de agua de texto o logo a imágenes. Personaliza posición, opacidad, rotación y mosaico. Soporta PNG, JPG, WebP. Todo el procesamiento se ejecuta en tu navegador."
  }
```

- [ ] **Step 2: Create `public/locales/es/image-watermark.json`**

```json
{
  "dropImage": "Suelta una imagen aquí o haz clic para seleccionar",
  "supportedFormats": "Soporta PNG, JPG, WebP, GIF, BMP, SVG",
  "reselect": "Seleccionar otra",
  "copyToClipboard": "Copiar al portapapeles",
  "copiedToClipboard": "Copiado al portapapeles como PNG",
  "original": "Original",
  "result": "Resultado",
  "processing": "Procesando...",
  "encodingFailed": "Error de codificación para este formato",
  "firstFrameOnly": "Imagen animada — solo se usa el primer fotograma",
  "largeImage": "Imagen grande ({w}×{h}) — el procesamiento puede ser lento",
  "formatNotSupported": "Formato de imagen no soportado. Usa PNG, JPG, WebP, GIF, BMP o SVG.",
  "typeText": "Texto",
  "typeLogo": "Logo",
  "modeSingle": "Individual",
  "modeTiled": "Mosaico",
  "textContent": "Texto",
  "fontFamily": "Fuente",
  "fontArial": "Arial",
  "fontHelvetica": "Helvetica",
  "fontGeorgia": "Georgia",
  "fontCourierNew": "Courier New",
  "fontSystemUI": "Sistema",
  "fontSansSerif": "Sans Serif",
  "fontSize": "Tamaño",
  "color": "Color",
  "opacity": "Opacidad",
  "bold": "Negrita",
  "uploadLogo": "Subir Logo",
  "logoSupportedFormats": "PNG, JPG, WebP",
  "logoScale": "Escala",
  "position": "Posición",
  "positionCenter": "C",
  "positionTopLeft": "↖",
  "positionTopCenter": "↑",
  "positionTopRight": "↗",
  "positionLeftCenter": "←",
  "positionRightCenter": "→",
  "positionBottomLeft": "↙",
  "positionBottomCenter": "↓",
  "positionBottomRight": "↘",
  "rotation": "Rotación",
  "tiledSpacing": "Espaciado",
  "descriptions": {
    "title": "Sobre Marca de Agua",
    "aeoDefinition": "Marca de Agua es una herramienta online gratuita para añadir marcas de agua de texto o logo a imágenes con posición, opacidad, rotación y mosaico personalizables. Todo el procesamiento se ejecuta localmente en tu navegador.",
    "whatIsTitle": "¿Qué es la herramienta de Marca de Agua?",
    "whatIs": "Añade marcas de agua de texto o logo a tus imágenes directamente en el navegador. Elige entre colocación individual o patrón en mosaico, ajusta opacidad, rotación y posición. Soporta PNG, JPG y WebP. Los datos no se suben — todo el procesamiento usa la API Canvas de HTML5.",
    "stepsTitle": "Cómo añadir una marca de agua a una imagen",
    "step1Title": "Suelta o selecciona una imagen",
    "step1Text": "Arrastra y suelta una imagen en la zona de carga, o haz clic para explorar. Soporta PNG, JPG, WebP, GIF, BMP y SVG.",
    "step2Title": "Configura tu marca de agua",
    "step2Text": "Elige entre marca de agua de texto o logo. Ajusta fuente, tamaño, color, opacidad y posición. Usa el modo mosaico para protección de derechos de autor con marcas de agua repetidas.",
    "step3Title": "Descarga o copia",
    "step3Text": "Previsualiza el resultado en tiempo real, luego descarga la imagen con marca de agua o cópiala al portapapeles.",
    "p1": "Añade marcas de agua de texto o logo a imágenes directamente en tu navegador. Redimensiona con [Redimensionador](/image-resize), comprime con [Compresor](/image-compress), o convierte formatos con [Convertidor](/image-convert).",
    "p2": "Soporta salida en PNG, JPG y WebP. El formato de salida coincide automáticamente con el de entrada. Las marcas de agua de texto incluyen sombra para legibilidad sobre cualquier fondo.",
    "faq1Q": "¿Esta herramienta sube mis imágenes?",
    "faq1A": "No. Todo el procesamiento de imágenes ocurre en tu navegador usando la API Canvas. Tus imágenes nunca salen de tu dispositivo.",
    "faq2Q": "¿Puedo usar una fuente personalizada?",
    "faq2A": "Actualmente solo están disponibles las fuentes del sistema (Arial, Helvetica, Georgia, Courier New, System UI, Sans Serif). La subida de fuentes personalizadas puede añadirse en futuras actualizaciones.",
    "faq3Q": "¿Qué es el modo de marca de agua en mosaico?",
    "faq3A": "El modo mosaico repite tu marca de agua por toda la imagen en un patrón diagonal. Es útil para protección de derechos de autor, ya que la marca de agua no se puede recortar fácilmente."
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/es/tools.json public/locales/es/image-watermark.json
git commit -m "feat(watermark): add Spanish i18n"
```

---

## Task 11: Brazilian Portuguese (pt-BR) i18n

**Files:**

- Modify: `public/locales/pt-BR/tools.json`
- Create: `public/locales/pt-BR/image-watermark.json`

- [ ] **Step 1: Append entry to `public/locales/pt-BR/tools.json`**

```json
  "image-watermark": {
    "title": "Marca d'Água - Adicionar Texto ou Logo",
    "shortTitle": "Marca d'Água",
    "description": "Adicione marcas d'água de texto ou logo em imagens. Personalize posição, opacidade, rotação e mosaico. Suporta PNG, JPG, WebP. Todo o processamento é feito no seu navegador."
  }
```

- [ ] **Step 2: Create `public/locales/pt-BR/image-watermark.json`**

```json
{
  "dropImage": "Solte uma imagem aqui ou clique para selecionar",
  "supportedFormats": "Suporta PNG, JPG, WebP, GIF, BMP, SVG",
  "reselect": "Selecionar outra",
  "copyToClipboard": "Copiar para a área de transferência",
  "copiedToClipboard": "Copiado para a área de transferência como PNG",
  "original": "Original",
  "result": "Resultado",
  "processing": "Processando...",
  "encodingFailed": "Falha na codificação deste formato",
  "firstFrameOnly": "Imagem animada — apenas o primeiro quadro é usado",
  "largeImage": "Imagem grande ({w}×{h}) — o processamento pode ser lento",
  "formatNotSupported": "Formato de imagem não suportado. Use PNG, JPG, WebP, GIF, BMP ou SVG.",
  "typeText": "Texto",
  "typeLogo": "Logo",
  "modeSingle": "Individual",
  "modeTiled": "Mosaico",
  "textContent": "Texto",
  "fontFamily": "Fonte",
  "fontArial": "Arial",
  "fontHelvetica": "Helvetica",
  "fontGeorgia": "Georgia",
  "fontCourierNew": "Courier New",
  "fontSystemUI": "Sistema",
  "fontSansSerif": "Sans Serif",
  "fontSize": "Tamanho",
  "color": "Cor",
  "opacity": "Opacidade",
  "bold": "Negrito",
  "uploadLogo": "Enviar Logo",
  "logoSupportedFormats": "PNG, JPG, WebP",
  "logoScale": "Escala",
  "position": "Posição",
  "positionCenter": "C",
  "positionTopLeft": "↖",
  "positionTopCenter": "↑",
  "positionTopRight": "↗",
  "positionLeftCenter": "←",
  "positionRightCenter": "→",
  "positionBottomLeft": "↙",
  "positionBottomCenter": "↓",
  "positionBottomRight": "↘",
  "rotation": "Rotação",
  "tiledSpacing": "Espaçamento",
  "descriptions": {
    "title": "Sobre Marca d'Água",
    "aeoDefinition": "Marca d'Água é uma ferramenta online gratuita para adicionar marcas d'água de texto ou logo em imagens com posição, opacidade, rotação e mosaico personalizáveis. Todo o processamento é feito localmente no seu navegador.",
    "whatIsTitle": "O que é a ferramenta de Marca d'Água?",
    "whatIs": "Adicione marcas d'água de texto ou logo às suas imagens diretamente no navegador. Escolha entre colocação individual ou padrão em mosaico, ajuste opacidade, rotação e posição. Suporta PNG, JPG e WebP. Nenhum dado é enviado — todo o processamento usa a API Canvas do HTML5.",
    "stepsTitle": "Como adicionar uma marca d'água a uma imagem",
    "step1Title": "Solte ou selecione uma imagem",
    "step1Text": "Arraste e solte uma imagem na área de upload, ou clique para navegar. Suporta PNG, JPG, WebP, GIF, BMP e SVG.",
    "step2Title": "Configure sua marca d'água",
    "step2Text": "Escolha entre marca d'água de texto ou logo. Ajuste fonte, tamanho, cor, opacidade e posição. Use o modo mosaico para proteção de direitos autorais com marcas d'água repetidas.",
    "step3Title": "Baixe ou copie",
    "step3Text": "Visualize o resultado em tempo real e baixe a imagem com marca d'água ou copie para a área de transferência.",
    "p1": "Adicione marcas d'água de texto ou logo em imagens diretamente no navegador. Redimensione com [Redimensionador](/image-resize), comprima com [Compressor](/image-compress), ou converta formatos com [Conversor](/image-convert).",
    "p2": "Suporta saída em PNG, JPG e WebP. O formato de saída corresponde automaticamente ao formato de entrada. Marcas d'água de texto incluem sombra para legibilidade sobre qualquer fundo.",
    "faq1Q": "Esta ferramenta envia minhas imagens?",
    "faq1A": "Não. Todo o processamento de imagens acontece no seu navegador usando a API Canvas. Suas imagens nunca saem do seu dispositivo.",
    "faq2Q": "Posso usar uma fonte personalizada?",
    "faq2A": "Atualmente, apenas fontes do sistema estão disponíveis (Arial, Helvetica, Georgia, Courier New, System UI, Sans Serif). O upload de fontes personalizadas pode ser adicionado em atualizações futuras.",
    "faq3Q": "O que é o modo de marca d'água em mosaico?",
    "faq3A": "O modo mosaico repete sua marca d'água por toda a imagem em um padrão diagonal. É útil para proteção de direitos autorais, pois a marca d'água não pode ser facilmente recortada."
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/pt-BR/tools.json public/locales/pt-BR/image-watermark.json
git commit -m "feat(watermark): add Brazilian Portuguese i18n"
```

---

## Task 12: French (fr) i18n

**Files:**

- Modify: `public/locales/fr/tools.json`
- Create: `public/locales/fr/image-watermark.json`

- [ ] **Step 1: Append entry to `public/locales/fr/tools.json`**

```json
  "image-watermark": {
    "title": "Filigrane - Ajouter un Texte ou Logo sur Image",
    "shortTitle": "Filigrane",
    "description": "Ajoutez des filigranes texte ou logo sur vos images. Personnalisez position, opacité, rotation et motif en mosaïque. Supporte PNG, JPG, WebP. Tout le traitement s'exécute dans votre navigateur."
  }
```

- [ ] **Step 2: Create `public/locales/fr/image-watermark.json`**

```json
{
  "dropImage": "Déposez une image ici ou cliquez pour sélectionner",
  "supportedFormats": "Supporte PNG, JPG, WebP, GIF, BMP, SVG",
  "reselect": "Resélectionner",
  "copyToClipboard": "Copier dans le presse-papiers",
  "copiedToClipboard": "Copié dans le presse-papiers en PNG",
  "original": "Original",
  "result": "Résultat",
  "processing": "Traitement en cours...",
  "encodingFailed": "Échec de l'encodage pour ce format",
  "firstFrameOnly": "Image animée — seule la première image est utilisée",
  "largeImage": "Image volumineuse ({w}×{h}) — le traitement peut être lent",
  "formatNotSupported": "Format d'image non supporté. Utilisez PNG, JPG, WebP, GIF, BMP ou SVG.",
  "typeText": "Texte",
  "typeLogo": "Logo",
  "modeSingle": "Unique",
  "modeTiled": "Mosaïque",
  "textContent": "Texte",
  "fontFamily": "Police",
  "fontArial": "Arial",
  "fontHelvetica": "Helvetica",
  "fontGeorgia": "Georgia",
  "fontCourierNew": "Courier New",
  "fontSystemUI": "Système",
  "fontSansSerif": "Sans Serif",
  "fontSize": "Taille",
  "color": "Couleur",
  "opacity": "Opacité",
  "bold": "Gras",
  "uploadLogo": "Importer un Logo",
  "logoSupportedFormats": "PNG, JPG, WebP",
  "logoScale": "Échelle",
  "position": "Position",
  "positionCenter": "C",
  "positionTopLeft": "↖",
  "positionTopCenter": "↑",
  "positionTopRight": "↗",
  "positionLeftCenter": "←",
  "positionRightCenter": "→",
  "positionBottomLeft": "↙",
  "positionBottomCenter": "↓",
  "positionBottomRight": "↘",
  "rotation": "Rotation",
  "tiledSpacing": "Espacement",
  "descriptions": {
    "title": "À propos du Filigrane",
    "aeoDefinition": "Filigrane est un outil en ligne gratuit pour ajouter des filigranes texte ou logo sur des images avec position, opacité, rotation et mosaïque personnalisables. Tout le traitement s'exécute localement dans votre navigateur.",
    "whatIsTitle": "Qu'est-ce que l'outil Filigrane ?",
    "whatIs": "Ajoutez des filigranes texte ou logo à vos images directement dans le navigateur. Choisissez un placement unique ou en mosaïque, ajustez l'opacité, la rotation et la position. Supporte PNG, JPG et WebP. Aucune donnée n'est envoyée — tout le traitement utilise l'API Canvas HTML5.",
    "stepsTitle": "Comment ajouter un filigrane à une image",
    "step1Title": "Déposez ou sélectionnez une image",
    "step1Text": "Glissez-déposez une image dans la zone de chargement, ou cliquez pour parcourir. Supporte PNG, JPG, WebP, GIF, BMP et SVG.",
    "step2Title": "Configurez votre filigrane",
    "step2Text": "Choisissez entre filigrane texte ou logo. Ajustez la police, la taille, la couleur, l'opacité et la position. Le mode mosaïque répète le filigrane sur toute l'image pour la protection des droits d'auteur.",
    "step3Title": "Téléchargez ou copiez",
    "step3Text": "Prévisualisez le résultat en temps réel, puis téléchargez l'image avec filigrane ou copiez-la dans le presse-papiers.",
    "p1": "Ajoutez des filigranes texte ou logo à vos images directement dans le navigateur. Redimensionnez avec le [Redimensionneur](/image-resize), compressez avec le [Compresseur](/image-compress), ou convertissez les formats avec le [Convertisseur](/image-convert).",
    "p2": "Supporte la sortie en PNG, JPG et WebP. Le format de sortie correspond automatiquement au format d'entrée. Les filigranes texte incluent une ombre pour une lisibilité sur tout fond.",
    "faq1Q": "Cet outil envoie-t-il mes images ?",
    "faq1A": "Non. Tout le traitement d'image se fait dans votre navigateur via l'API Canvas. Vos images ne quittent jamais votre appareil.",
    "faq2Q": "Puis-je utiliser une police personnalisée ?",
    "faq2A": "Actuellement, seules les polices système sont disponibles (Arial, Helvetica, Georgia, Courier New, System UI, Sans Serif). L'import de polices personnalisées pourra être ajouté dans une prochaine mise à jour.",
    "faq3Q": "Qu'est-ce que le mode filigrane en mosaïque ?",
    "faq3A": "Le mode mosaïque répète votre filigrane sur toute l'image en motif diagonal. Utile pour la protection des droits d'auteur, car le filigrane ne peut pas être facilement recadré."
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/fr/tools.json public/locales/fr/image-watermark.json
git commit -m "feat(watermark): add French i18n"
```

---

## Task 13: German (de) i18n

**Files:**

- Modify: `public/locales/de/tools.json`
- Create: `public/locales/de/image-watermark.json`

- [ ] **Step 1: Append entry to `public/locales/de/tools.json`**

```json
  "image-watermark": {
    "title": "Bildwasserzeichen - Text oder Logo hinzufügen",
    "shortTitle": "Wasserzeichen",
    "description": "Fügen Sie Text- oder Logo-Wasserzeichen zu Bildern hinzu. Passen Sie Position, Deckkraft, Drehung und Kachelung an. Unterstützt PNG, JPG, WebP. Die gesamte Verarbeitung erfolgt in Ihrem Browser."
  }
```

- [ ] **Step 2: Create `public/locales/de/image-watermark.json`**

```json
{
  "dropImage": "Bild hier ablegen oder klicken zum Auswählen",
  "supportedFormats": "Unterstützt PNG, JPG, WebP, GIF, BMP, SVG",
  "reselect": "Neu auswählen",
  "copyToClipboard": "In die Zwischenablage kopieren",
  "copiedToClipboard": "Als PNG in die Zwischenablage kopiert",
  "original": "Original",
  "result": "Ergebnis",
  "processing": "Verarbeitung läuft...",
  "encodingFailed": "Kodierung für dieses Format fehlgeschlagen",
  "firstFrameOnly": "Animiertes Bild — nur das erste Bild wird verwendet",
  "largeImage": "Großes Bild ({w}×{h}) — Verarbeitung kann langsam sein",
  "formatNotSupported": "Dieses Bildformat wird nicht unterstützt. Bitte PNG, JPG, WebP, GIF, BMP oder SVG verwenden.",
  "typeText": "Text",
  "typeLogo": "Logo",
  "modeSingle": "Einzel",
  "modeTiled": "Kachel",
  "textContent": "Text",
  "fontFamily": "Schriftart",
  "fontArial": "Arial",
  "fontHelvetica": "Helvetica",
  "fontGeorgia": "Georgia",
  "fontCourierNew": "Courier New",
  "fontSystemUI": "System",
  "fontSansSerif": "Sans Serif",
  "fontSize": "Größe",
  "color": "Farbe",
  "opacity": "Deckkraft",
  "bold": "Fett",
  "uploadLogo": "Logo hochladen",
  "logoSupportedFormats": "PNG, JPG, WebP",
  "logoScale": "Skalierung",
  "position": "Position",
  "positionCenter": "M",
  "positionTopLeft": "↖",
  "positionTopCenter": "↑",
  "positionTopRight": "↗",
  "positionLeftCenter": "←",
  "positionRightCenter": "→",
  "positionBottomLeft": "↙",
  "positionBottomCenter": "↓",
  "positionBottomRight": "↘",
  "rotation": "Drehung",
  "tiledSpacing": "Abstand",
  "descriptions": {
    "title": "Über Bildwasserzeichen",
    "aeoDefinition": "Bildwasserzeichen ist ein kostenloses Online-Tool zum Hinzufügen von Text- oder Logo-Wasserzeichen zu Bildern mit anpassbarer Position, Deckkraft, Drehung und Kachelung. Die gesamte Verarbeitung erfolgt lokal in Ihrem Browser.",
    "whatIsTitle": "Was ist das Bildwasserzeichen-Tool?",
    "whatIs": "Fügen Sie Text- oder Logo-Wasserzeichen direkt im Browser zu Ihren Bildern hinzu. Wählen Sie zwischen einzelner Platzierung oder Kachelmuster, passen Sie Deckkraft, Drehung und Position an. Unterstützt PNG, JPG und WebP. Kein Daten-Upload — die gesamte Verarbeitung verwendet die HTML5 Canvas API.",
    "stepsTitle": "So fügen Sie ein Wasserzeichen zu einem Bild hinzu",
    "step1Title": "Bild ablegen oder auswählen",
    "step1Text": "Ziehen Sie ein Bild in die Ablagezone oder klicken Sie zum Durchsuchen. Unterstützt PNG, JPG, WebP, GIF, BMP und SVG.",
    "step2Title": "Wasserzeichen konfigurieren",
    "step2Text": "Wählen Sie zwischen Text- oder Logo-Wasserzeichen. Passen Sie Schriftart, Größe, Farbe, Deckkraft und Position an. Der Kachelmodus wiederholt das Wasserzeichen über das gesamte Bild für Urheberrechtsschutz.",
    "step3Title": "Herunterladen oder kopieren",
    "step3Text": "Zeigen Sie das Ergebnis in der Echtzeitvorschau an und laden Sie das Bild mit Wasserzeichen herunter oder kopieren Sie es in die Zwischenablage.",
    "p1": "Fügen Sie Text- oder Logo-Wasserzeichen direkt im Browser zu Bildern hinzu. Größe ändern mit [Bildgrößenänderung](/image-resize), komprimieren mit [Bildkompressor](/image-compress), oder Formate konvertieren mit [Bildkonverter](/image-convert).",
    "p2": "Unterstützt PNG-, JPG- und WebP-Ausgabe. Das Ausgabeformat entspricht automatisch dem Eingabeformat. Text-Wasserzeichen haben einen Schatten für gute Lesbarkeit auf jedem Hintergrund.",
    "faq1Q": "Lädt dieses Tool meine Bilder hoch?",
    "faq1A": "Nein. Die gesamte Bildverarbeitung erfolgt in Ihrem Browser über die Canvas API. Ihre Bilder verlassen niemals Ihr Gerät.",
    "faq2Q": "Kann ich eine benutzerdefinierte Schriftart verwenden?",
    "faq2A": "Aktuell sind nur Systemschriftarten verfügbar (Arial, Helvetica, Georgia, Courier New, System UI, Sans Serif). Das Hochladen benutzerdefinierter Schriftarten kann in einem zukünftigen Update hinzugefügt werden.",
    "faq3Q": "Was ist der Kachel-Wasserzeichenmodus?",
    "faq3A": "Der Kachelmodus wiederholt Ihr Wasserzeichen diagonal über das gesamte Bild. Dies ist nützlich für den Urheberrechtsschutz, da das Wasserzeichen nicht einfach zugeschnitten werden kann."
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/de/tools.json public/locales/de/image-watermark.json
git commit -m "feat(watermark): add German i18n"
```

---

## Task 14: Russian (ru) i18n

**Files:**

- Modify: `public/locales/ru/tools.json`
- Create: `public/locales/ru/image-watermark.json`

- [ ] **Step 1: Append entry to `public/locales/ru/tools.json`**

```json
  "image-watermark": {
    "title": "Водяной знак - Добавить Текст или Логотип",
    "shortTitle": "Водяной знак",
    "description": "Добавляйте текстовые водяные знаки или логотипы на изображения. Настройте позицию, прозрачность, поворот и мозаику. Поддерживает PNG, JPG, WebP. Вся обработка выполняется в браузере."
  }
```

- [ ] **Step 2: Create `public/locales/ru/image-watermark.json`**

```json
{
  "dropImage": "Перетащите изображение или нажмите для выбора",
  "supportedFormats": "Поддерживает PNG, JPG, WebP, GIF, BMP, SVG",
  "reselect": "Выбрать другое",
  "copyToClipboard": "Копировать в буфер обмена",
  "copiedToClipboard": "Скопировано в буфер обмена как PNG",
  "original": "Оригинал",
  "result": "Результат",
  "processing": "Обработка...",
  "encodingFailed": "Ошибка кодирования для этого формата",
  "firstFrameOnly": "Анимированное изображение — используется только первый кадр",
  "largeImage": "Большое изображение ({w}×{h}) — обработка может занять время",
  "formatNotSupported": "Формат изображения не поддерживается. Используйте PNG, JPG, WebP, GIF, BMP или SVG.",
  "typeText": "Текст",
  "typeLogo": "Логотип",
  "modeSingle": "Одиночный",
  "modeTiled": "Мозаика",
  "textContent": "Текст",
  "fontFamily": "Шрифт",
  "fontArial": "Arial",
  "fontHelvetica": "Helvetica",
  "fontGeorgia": "Georgia",
  "fontCourierNew": "Courier New",
  "fontSystemUI": "Системный",
  "fontSansSerif": "Sans Serif",
  "fontSize": "Размер",
  "color": "Цвет",
  "opacity": "Прозрачность",
  "bold": "Жирный",
  "uploadLogo": "Загрузить логотип",
  "logoSupportedFormats": "PNG, JPG, WebP",
  "logoScale": "Масштаб",
  "position": "Позиция",
  "positionCenter": "Ц",
  "positionTopLeft": "↖",
  "positionTopCenter": "↑",
  "positionTopRight": "↗",
  "positionLeftCenter": "←",
  "positionRightCenter": "→",
  "positionBottomLeft": "↙",
  "positionBottomCenter": "↓",
  "positionBottomRight": "↘",
  "rotation": "Поворот",
  "tiledSpacing": "Интервал",
  "descriptions": {
    "title": "О водяных знаках",
    "aeoDefinition": "Водяной знак — бесплатный онлайн-инструмент для добавления текстовых водяных знаков или логотипов на изображения с настраиваемой позицией, прозрачностью, поворотом и мозаикой. Вся обработка выполняется локально в вашем браузере.",
    "whatIsTitle": "Что такое инструмент Водяной знак?",
    "whatIs": "Добавляйте текстовые водяные знаки или логотипы к изображениям прямо в браузере. Выбирайте одиночное размещение или мозаичный паттерн, настраивайте прозрачность, поворот и позицию. Поддерживает PNG, JPG и WebP. Данные не загружаются — вся обработка использует HTML5 Canvas API.",
    "stepsTitle": "Как добавить водяной знак к изображению",
    "step1Title": "Перетащите или выберите изображение",
    "step1Text": "Перетащите изображение в зону загрузки или нажмите для выбора файла. Поддерживает PNG, JPG, WebP, GIF, BMP и SVG.",
    "step2Title": "Настройте водяной знак",
    "step2Text": "Выберите текстовый водяной знак или логотип. Настройте шрифт, размер, цвет, прозрачность и позицию. Мозаичный режим повторяет водяной знак по всему изображению для защиты авторских прав.",
    "step3Title": "Скачайте или скопируйте",
    "step3Text": "Просмотрите результат в реальном времени, затем скачайте изображение с водяным знаком или скопируйте в буфер обмена.",
    "p1": "Добавляйте текстовые водяные знаки или логотипы к изображениям прямо в браузере. Изменяйте размер с помощью [Ресайзера](/image-resize), сжимайте [Компрессором](/image-compress) или конвертируйте форматы [Конвертером](/image-convert).",
    "p2": "Поддерживает вывод в PNG, JPG и WebP. Формат вывода автоматически соответствует формату ввода. Текстовые водяные знаки имеют тень для читаемости на любом фоне.",
    "faq1Q": "Загружает ли этот инструмент мои изображения?",
    "faq1A": "Нет. Вся обработка изображений выполняется в вашем браузере через Canvas API. Изображения никогда не покидают ваше устройство.",
    "faq2Q": "Можно ли использовать пользовательский шрифт?",
    "faq2A": "Сейчас доступны только системные шрифты (Arial, Helvetica, Georgia, Courier New, System UI, Sans Serif). Загрузка пользовательских шрифтов может быть добавлена в будущих обновлениях.",
    "faq3Q": "Что такое мозаичный режим водяного знака?",
    "faq3A": "Мозаичный режим повторяет ваш водяной знак по всему изображению диагональным паттерном. Это полезно для защиты авторских прав, так как водяной знак нельзя легко обрезать."
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/ru/tools.json public/locales/ru/image-watermark.json
git commit -m "feat(watermark): add Russian i18n"
```

---

## Self-Review Checklist

### 1. Spec Coverage

| Spec Requirement                                     | Task                           |
| ---------------------------------------------------- | ------------------------------ |
| Watermark types (text + logo tabs)                   | Task 5 (page component)        |
| Arrangement (single + tiled)                         | Task 5 (page component)        |
| Text config (text, font, size, color, opacity, bold) | Task 5 (page component)        |
| Logo config (upload, scale, opacity)                 | Task 5 (page component)        |
| 3×3 position grid (single mode)                      | Task 5 (page component)        |
| Tiled config (rotation, spacing)                     | Task 5 (page component)        |
| Real-time preview with 300ms debounce                | Task 5 (page component)        |
| Staleness guard                                      | Task 5 (page component)        |
| Logo ImageBitmap lifecycle                           | Task 5 (page component)        |
| Canvas rendering pipeline                            | Task 1 (watermark.ts)          |
| JPEG white fill                                      | Task 1 (watermark.ts)          |
| Auto-preserve output format                          | Task 1 (watermark.ts) + Task 5 |
| ImageInfoBar without savedPercent                    | Task 5 (page component)        |
| Tool registration (TOOLS, CATEGORIES, RELATIONS)     | Task 2                         |
| SEO metadata + JSON-LD                               | Task 4                         |
| i18n for 10 locales                                  | Tasks 3, 6–14                  |
| Unit tests for pure helpers                          | Task 1                         |
| searchTerms for CJK locales                          | Tasks 6–9                      |

### 2. Placeholder Scan

No TBD, TODO, "implement later", "fill in details", "add appropriate error handling" found. All code steps contain complete implementation.

### 3. Type Consistency

- `TextWatermarkConfig` and `LogoWatermarkConfig` defined in Task 1, used consistently in Task 5
- `WatermarkOptions` defined in Task 1, used consistently in Task 5
- `PositionPreset` type defined in Task 1, used in both `calculatePosition` and page component
- `WatermarkMode` type defined in Task 1, used in both `generateTilingGrid` check and page component
- `OutputFormat` imported from `libs/image/types` consistently
- i18n key names match between JSON files and page component `t()` calls
