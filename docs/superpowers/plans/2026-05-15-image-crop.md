# Image Crop Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an interactive image cropping tool at `/image-crop` with free crop, preset aspect ratios, and exact pixel dimensions — all processing client-side via Canvas API.

**Architecture:** Uses `react-image-crop` v11 for the interactive selection overlay. Follows the existing image tool pattern (image-resize): two-column layout with left controls panel (280px) and right preview panel. Shared hooks `useImageInput`/`useImageExport` handle file I/O. Business logic extracted to `libs/image/crop.ts` for unit testing. Encode pipeline uses the same `stalenessId` ref + 300ms debounce pattern as image-resize.

**Tech Stack:** React 19, Next.js 16, react-image-crop ^11.x, Canvas API, Tailwind CSS 4, next-intl

**Spec:** `docs/superpowers/specs/2026-05-15-image-crop-design.md`

---

## File Structure

### New files (14)

| File                                          | Purpose                                                    |
| --------------------------------------------- | ---------------------------------------------------------- |
| `app/[locale]/image-crop/page.tsx`            | Route entry — SEO metadata, JSON-LD schemas                |
| `app/[locale]/image-crop/image-crop-page.tsx` | Client page component (`"use client"`) — all UI and logic  |
| `libs/image/crop.ts`                          | Crop business logic — `clampCropRegion()` + `cropBitmap()` |
| `libs/image/__tests__/crop.test.ts`           | Unit tests for `clampCropRegion`                           |
| `public/locales/en/image-crop.json`           | English i18n strings                                       |
| `public/locales/zh-CN/image-crop.json`        | Simplified Chinese i18n                                    |
| `public/locales/zh-TW/image-crop.json`        | Traditional Chinese i18n                                   |
| `public/locales/ja/image-crop.json`           | Japanese i18n                                              |
| `public/locales/ko/image-crop.json`           | Korean i18n                                                |
| `public/locales/es/image-crop.json`           | Spanish i18n                                               |
| `public/locales/pt-BR/image-crop.json`        | Brazilian Portuguese i18n                                  |
| `public/locales/fr/image-crop.json`           | French i18n                                                |
| `public/locales/de/image-crop.json`           | German i18n                                                |
| `public/locales/ru/image-crop.json`           | Russian i18n                                               |

### Modified files (4 + 10 locale tools.json)

| File                                     | Change                                                               |
| ---------------------------------------- | -------------------------------------------------------------------- |
| `package.json`                           | Add `react-image-crop` dependency                                    |
| `app/globals.css`                        | Add CSS import + theme overrides for react-image-crop                |
| `libs/tools.ts`                          | Add `Crop` icon import, `image-crop` tool entry, category, relations |
| `public/locales/*/tools.json` (10 files) | Add `image-crop` entry (with `searchTerms` for CJK)                  |

### No changes needed

| File                                 | Reason                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------ |
| `vitest.config.ts`                   | `"libs/image/**/*.test.ts"` already covers `libs/image/__tests__/crop.test.ts` |
| `components/image/useImageInput.ts`  | Reused as-is                                                                   |
| `components/image/useImageExport.ts` | Reused as-is                                                                   |
| `components/image/ImageDropZone.tsx` | Reused as-is                                                                   |
| `components/image/ImageInfoBar.tsx`  | Reused as-is                                                                   |
| `libs/image/types.ts`                | Reused as-is (`OutputFormat`, `resolveOutputFormat`, `formatKeyFromMime`)      |

---

## Task 1: Install react-image-crop + CSS Integration

**Files:**

- Modify: `package.json`
- Modify: `app/globals.css`

- [ ] **Step 1: Install react-image-crop**

Run:

```bash
npm install react-image-crop
```

Expected: `react-image-crop` added to `dependencies` in `package.json`. Note the installed version (should be ^11.x).

- [ ] **Step 2: Verify CSS file path in the installed package**

Run:

```bash
ls node_modules/react-image-crop/dist/*.css
```

Look for either `ReactCrop.css` or `index.css`. Use whichever exists in Step 3.

- [ ] **Step 3: Add CSS import and theme overrides to globals.css**

Add immediately after the `@import "tailwindcss";` line (line 1) in `app/globals.css`:

```css
@import "tailwindcss";
@import "react-image-crop/dist/ReactCrop.css";
```

Then add the following theme overrides at the end of the file, before the `@media print` block (after the `.recipe-select-arrow` section around line 476):

```css
/* ===== react-image-crop Theme Overrides ===== */
.ReactCrop {
  --rc-border-color: #06d6a0;
  --rc-drag-handle-bg-colour: #06d6a0;
}

.ReactCrop__rule-of-thirds-hz::before,
.ReactCrop__rule-of-thirds-vt::before {
  background-color: rgba(6, 214, 160, 0.3);
}
```

> **Note:** Uses hardcoded `#06d6a0` (accent-cyan) instead of CSS variables because these overrides target a third-party library's CSS outside of Tailwind's `@theme` scope. `--rc-border-color` and `--rc-drag-handle-bg-colour` are react-image-crop v11's own CSS custom properties.

- [ ] **Step 4: Verify build succeeds**

Run:

```bash
npm run build
```

Expected: Build completes without CSS import errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json app/globals.css
git commit -m "chore: add react-image-crop dependency and CSS theme overrides"
```

---

## Task 2: Crop Business Logic + Tests (TDD)

**Files:**

- Create: `libs/image/crop.ts`
- Create: `libs/image/__tests__/crop.test.ts`

The `cropBitmap` function uses Canvas API (untestable in vitest's node environment — same as `encode.ts` which has no tests). We extract the pure clamping logic into `clampCropRegion` for unit testing.

- [ ] **Step 1: Write the failing test**

Create `libs/image/__tests__/crop.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { clampCropRegion } from "../crop";
import type { CropRegion } from "../crop";

describe("clampCropRegion", () => {
  const bitmapW = 1920;
  const bitmapH = 1080;

  it("returns unchanged crop when region is within bounds", () => {
    const crop: CropRegion = { x: 100, y: 50, width: 800, height: 600 };
    expect(clampCropRegion(crop, bitmapW, bitmapH)).toEqual(crop);
  });

  it("clamps x to 0 when negative", () => {
    const result = clampCropRegion({ x: -50, y: 0, width: 100, height: 100 }, bitmapW, bitmapH);
    expect(result.x).toBe(0);
  });

  it("clamps y to 0 when negative", () => {
    const result = clampCropRegion({ x: 0, y: -30, width: 100, height: 100 }, bitmapW, bitmapH);
    expect(result.y).toBe(0);
  });

  it("clamps x to bitmap width when exceeding", () => {
    const result = clampCropRegion({ x: 2000, y: 0, width: 100, height: 100 }, bitmapW, bitmapH);
    expect(result.x).toBe(bitmapW);
  });

  it("clamps y to bitmap height when exceeding", () => {
    const result = clampCropRegion({ x: 0, y: 1200, width: 100, height: 100 }, bitmapW, bitmapH);
    expect(result.y).toBe(bitmapH);
  });

  it("clamps width when crop exceeds right edge", () => {
    const result = clampCropRegion({ x: 1800, y: 0, width: 200, height: 100 }, bitmapW, bitmapH);
    expect(result.x).toBe(1800);
    expect(result.width).toBe(bitmapW - 1800);
  });

  it("clamps height when crop exceeds bottom edge", () => {
    const result = clampCropRegion({ x: 0, y: 1000, width: 100, height: 200 }, bitmapW, bitmapH);
    expect(result.y).toBe(1000);
    expect(result.height).toBe(bitmapH - 1000);
  });

  it("ensures minimum width of 1", () => {
    const result = clampCropRegion({ x: bitmapW, y: 0, width: 100, height: 100 }, bitmapW, bitmapH);
    expect(result.width).toBeGreaterThanOrEqual(1);
  });

  it("ensures minimum height of 1", () => {
    const result = clampCropRegion({ x: 0, y: bitmapH, width: 100, height: 100 }, bitmapW, bitmapH);
    expect(result.height).toBeGreaterThanOrEqual(1);
  });

  it("handles crop at origin (0, 0)", () => {
    const crop: CropRegion = { x: 0, y: 0, width: 500, height: 500 };
    expect(clampCropRegion(crop, bitmapW, bitmapH)).toEqual(crop);
  });

  it("handles crop at max corner", () => {
    const result = clampCropRegion({ x: 1420, y: 580, width: 500, height: 500 }, bitmapW, bitmapH);
    expect(result.x).toBe(1420);
    expect(result.y).toBe(580);
    expect(result.width).toBe(bitmapW - 1420);
    expect(result.height).toBe(bitmapH - 580);
  });

  it("handles zero-size crop by enforcing minimum 1x1", () => {
    const result = clampCropRegion({ x: 0, y: 0, width: 0, height: 0 }, bitmapW, bitmapH);
    expect(result.width).toBeGreaterThanOrEqual(1);
    expect(result.height).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npx vitest run libs/image/__tests__/crop.test.ts
```

Expected: FAIL — `Cannot find module '../crop'`

- [ ] **Step 3: Implement crop.ts**

Create `libs/image/crop.ts`:

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npx vitest run libs/image/__tests__/crop.test.ts
```

Expected: All 12 tests PASS.

- [ ] **Step 5: Verify existing tests still pass**

Run:

```bash
npx vitest run libs/image/
```

Expected: All existing image tests pass + 12 new crop tests pass.

- [ ] **Step 6: Commit**

```bash
git add libs/image/crop.ts libs/image/__tests__/crop.test.ts
git commit -m "feat(image-crop): add cropBitmap business logic with clamping tests"
```

---

## Task 3: Tool Registration

**Files:**

- Modify: `libs/tools.ts`

- [ ] **Step 1: Add Crop icon to lucide-react imports**

In `libs/tools.ts`, add `Crop` to the import from `lucide-react`. Add it alphabetically near the other icons starting with "C":

```typescript
import {
  // ... existing imports
  CaseSensitive,
  Crop, // ← add this
  // ... rest of existing imports
} from "lucide-react";
```

- [ ] **Step 2: Add image-crop entry to TOOLS array**

Find the `image-convert` entry in the TOOLS array and add the new entry immediately after it:

```typescript
{ key: "image-convert", path: "/image-convert", icon: RefreshCw, emoji: "🔄", sameAs: [] },
{ key: "image-crop", path: "/image-crop", icon: Crop, emoji: "✂️", sameAs: [] },
```

- [ ] **Step 3: Add image-crop to visual category**

Find the `TOOL_CATEGORIES` entry for `"visual"` and append `"image-crop"`:

```typescript
{ key: "visual", tools: ["color", "image-resize", "image-compress", "image-convert", "image-crop"] },
```

- [ ] **Step 4: Add TOOL_RELATIONS entries**

In the `TOOL_RELATIONS` object, add a new entry for `image-crop` and update the existing image tool entries:

```typescript
"image-crop": ["image-resize", "image-compress", "image-convert"],
```

Update existing entries to include `image-crop`:

```typescript
"image-resize": ["image-compress", "image-convert", "image-crop", "color"],
"image-compress": ["image-resize", "image-convert", "image-crop", "checksum"],
"image-convert": ["image-resize", "image-compress", "image-crop", "qrcode"],
```

- [ ] **Step 5: Verify no type errors**

Run:

```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: No errors related to `tools.ts`.

- [ ] **Step 6: Commit**

```bash
git add libs/tools.ts
git commit -m "feat(image-crop): register tool in TOOLS, categories, and relations"
```

---

## Task 4: English i18n

**Files:**

- Modify: `public/locales/en/tools.json`
- Create: `public/locales/en/image-crop.json`

- [ ] **Step 1: Add image-crop entry to en/tools.json**

Add this entry to `public/locales/en/tools.json` (no `searchTerms` for English — the `shortTitle` is already in English and fuzzysort matches it directly):

```json
"image-crop": {
  "title": "Image Cropper - Crop Images Online",
  "shortTitle": "Image Cropper",
  "description": "Crop images with free selection, preset aspect ratios, or exact pixel dimensions. Supports PNG, JPG, WebP. All processing runs in your browser."
}
```

- [ ] **Step 2: Create en/image-crop.json**

Create `public/locales/en/image-crop.json`:

```json
{
  "dropImage": "Drop an image here or click to select",
  "supportedFormats": "Supports PNG, JPG, WebP, GIF, BMP, SVG",
  "cropMode": "Crop Mode",
  "free": "Free",
  "presetRatio": "Preset",
  "exactSize": "Exact",
  "ratioOriginal": "Original",
  "ratio_1_1": "1:1",
  "ratio_16_9": "16:9",
  "ratio_4_3": "4:3",
  "ratio_3_2": "3:2",
  "ratio_2_3": "2:3",
  "ratio_9_16": "9:16",
  "ratio_21_9": "21:9",
  "width": "Width",
  "height": "Height",
  "keepAspectRatio": "Keep aspect ratio",
  "reselect": "Reselect",
  "copyToClipboard": "Copy to clipboard",
  "copiedToClipboard": "Copied to clipboard as PNG",
  "original": "Original",
  "result": "Result",
  "processing": "Processing...",
  "noSelection": "Draw a selection on the image to crop",
  "encodingFailed": "Encoding failed for this format",
  "firstFrameOnly": "Animated image — only the first frame is used",
  "largeImage": "Large image ({w}×{h}) — processing may be slow",
  "formatNotSupported": "This image format is not supported. Please use PNG, JPG, WebP, GIF, BMP, or SVG.",
  "descriptions": {
    "title": "About Image Cropper",
    "aeoDefinition": "Image Cropper is a free online tool for cropping images with free selection, preset aspect ratios, or exact pixel dimensions. Supports PNG, JPG, WebP. All processing runs locally in your browser.",
    "whatIsTitle": "What is the Image Cropper?",
    "whatIs": "Crop images with free selection, preset aspect ratios (1:1, 16:9, 4:3, etc.), or exact pixel dimensions directly in your browser. No data is uploaded to any server — all processing uses the HTML5 Canvas API.",
    "stepsTitle": "How to Crop an Image",
    "step1Title": "Drop or select an image",
    "step1Text": "Drag and drop an image onto the drop zone, or click to browse. Supports PNG, JPG, WebP, GIF, BMP, and SVG input.",
    "step2Title": "Select crop area",
    "step2Text": "Draw a selection rectangle on the image. Choose Free crop, a preset aspect ratio, or enter exact pixel dimensions.",
    "step3Title": "Download cropped image",
    "step3Text": "Preview the cropped image and download it. The output format matches the input format.",
    "p1": "Crop images with free selection, preset aspect ratios, or exact dimensions. Resize images with [Image Resizer](/image-resize), compress with [Image Compressor](/image-compress), or convert formats with [Image Converter](/image-convert).",
    "p2": "Supports PNG, JPG, and WebP output. Images in GIF, BMP, SVG, or AVIF format are automatically converted to PNG.",
    "faq1Q": "What image formats can I crop?",
    "faq1A": "You can crop PNG, JPG, WebP, GIF, BMP, SVG, and AVIF images. The output format matches the input format. Unsupported output formats (GIF, BMP, SVG, AVIF) are saved as PNG.",
    "faq2Q": "Are my images uploaded to a server?",
    "faq2A": "No. All image processing happens in your browser using the Canvas API. Your images never leave your device.",
    "faq3Q": "Can I crop to a specific aspect ratio?",
    "faq3A": "Yes. Use the Preset mode to select from common aspect ratios (1:1, 16:9, 4:3, etc.) or use Exact mode to enter specific pixel dimensions."
  }
}
```

- [ ] **Step 3: Validate JSON**

Run:

```bash
node -e "JSON.parse(require('fs').readFileSync('public/locales/en/image-crop.json','utf8')); console.log('Valid JSON')"
```

Expected: `Valid JSON`

- [ ] **Step 4: Commit**

```bash
git add public/locales/en/tools.json public/locales/en/image-crop.json
git commit -m "feat(image-crop): add English i18n strings"
```

---

## Task 5: Route Entry

**Files:**

- Create: `app/[locale]/image-crop/page.tsx`

This follows the exact pattern from `app/[locale]/image-resize/page.tsx`.

- [ ] **Step 1: Create the route entry file**

Create `app/[locale]/image-crop/page.tsx`:

```typescript
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import ImageCropPage from "./image-crop-page";

const PATH = "/image-crop";
const TOOL_KEY = "image-crop";
const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("image-crop.title"),
    description: t("image-crop.description"),
    ogImage: { type: "tool", key: TOOL_KEY },
  });
}

export default async function ImageCropRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "image-crop" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("image-crop.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("image-crop.description"),
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
      <ImageCropPage />
    </>
  );
}
```

- [ ] **Step 2: Verify no type errors**

Run:

```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: No errors related to `image-crop/page.tsx`.

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/image-crop/page.tsx"
git commit -m "feat(image-crop): add route entry with SEO metadata and JSON-LD"
```

---

## Task 6: Client Page Component

**Files:**

- Create: `app/[locale]/image-crop/image-crop-page.tsx`

This is the main implementation task. The component follows the image-resize pattern exactly:

- Same hooks: `useImageInput`, `useImageExport`
- Same layout: `grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6`
- Same action buttons pattern
- Same stalenessId encode pipeline (but always 300ms debounce, no initialLoadRef)
- Key difference: uses `ReactCrop` for the preview instead of a plain `<img>`

**react-image-crop v11 API notes** (verified from source code):

- `onChange(pixelCrop, percentCrop)` — stores `percentCrop` for responsive behavior
- `crop` prop accepts `Crop | undefined` — `undefined` means no selection
- `aspect` prop locks aspect ratio — `undefined` means free crop
- `minWidth`/`minHeight` are in pixels
- `makeAspectCrop` + `centerCrop` for initial preset ratio selection

- [ ] **Step 1: Create the client page component**

Create `app/[locale]/image-crop/image-crop-page.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import PrivacyBanner from "../../../components/privacy-banner";
import DescriptionSection from "../../../components/description-section";
import RelatedTools from "../../../components/related-tools";
import { Download, Clipboard, RefreshCw } from "lucide-react";
import { StyledInput, StyledCheckbox } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { cropBitmap } from "../../../libs/image/crop";
import type { OutputFormat } from "../../../libs/image/types";
import { resolveOutputFormat, formatKeyFromMime } from "../../../libs/image/types";
import { useImageInput } from "../../../components/image/useImageInput";
import { useImageExport } from "../../../components/image/useImageExport";
import ImageDropZone from "../../../components/image/ImageDropZone";
import ImageInfoBar from "../../../components/image/ImageInfoBar";
import ReactCrop, { centerCrop, makeAspectCrop, type Crop } from "react-image-crop";

type CropMode = "free" | "preset" | "exact";

const PRESET_RATIOS: { labelKey: string; value: number | null }[] = [
  { labelKey: "ratioOriginal", value: null },
  { labelKey: "ratio_1_1", value: 1 },
  { labelKey: "ratio_16_9", value: 16 / 9 },
  { labelKey: "ratio_4_3", value: 4 / 3 },
  { labelKey: "ratio_3_2", value: 3 / 2 },
  { labelKey: "ratio_2_3", value: 2 / 3 },
  { labelKey: "ratio_9_16", value: 9 / 16 },
  { labelKey: "ratio_21_9", value: 21 / 9 },
];

function Conversion() {
  const t = useTranslations("image-crop");
  const tc = useTranslations("common");

  // Shared hooks — same pattern as image-resize
  const { sourceFile, sourceBitmap, handleFileSelect, handleReselect, dropZoneRef, fileInputRef } =
    useImageInput({ t });
  const outputFormat: OutputFormat = sourceFile ? resolveOutputFormat(sourceFile.type) : "png";
  const { handleDownload, handleCopy } = useImageExport({ sourceFile, outputFormat, t, tc });

  // Tool-specific state
  const [cropMode, setCropMode] = useState<CropMode>("free");
  const [crop, setCrop] = useState<Crop>();
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [exactWidth, setExactWidth] = useState(0);
  const [exactHeight, setExactHeight] = useState(0);
  const [keepAspectRatio, setKeepAspectRatio] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Source image URL for ReactCrop
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  const stalenessId = useRef(0);
  const prevBlobUrlRef = useRef<string | null>(null);

  // Create source URL from file — clean up on file change or unmount
  useEffect(() => {
    if (sourceFile) {
      const url = URL.createObjectURL(sourceFile);
      setSourceUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setSourceUrl(null);
    return undefined;
  }, [sourceFile]);

  // Calculate aspect prop for ReactCrop
  const cropAspect =
    cropMode === "preset" && sourceBitmap
      ? (selectedRatio ?? sourceBitmap.width / sourceBitmap.height)
      : undefined;

  // Exact mode: update crop when dimensions change
  useEffect(() => {
    if (cropMode !== "exact" || !sourceBitmap) return;
    if (exactWidth <= 0 || exactHeight <= 0) {
      setCrop(undefined);
      return;
    }

    const w = Math.min(exactWidth, sourceBitmap.width);
    const h = Math.min(exactHeight, sourceBitmap.height);
    const xPct = ((sourceBitmap.width - w) / 2 / sourceBitmap.width) * 100;
    const yPct = ((sourceBitmap.height - h) / 2 / sourceBitmap.height) * 100;
    const wPct = (w / sourceBitmap.width) * 100;
    const hPct = (h / sourceBitmap.height) * 100;

    setCrop({ unit: "%", x: xPct, y: yPct, width: wPct, height: hPct });
  }, [cropMode, exactWidth, exactHeight, sourceBitmap]);

  // Encode pipeline — same stalenessId pattern as image-resize
  // Key difference: always 300ms debounce (no initialLoadRef), guard on crop existence
  useEffect(() => {
    if (!sourceBitmap || !crop) return;

    // Convert percentage crop to pixel coordinates
    const px = Math.round((crop.x / 100) * sourceBitmap.width);
    const py = Math.round((crop.y / 100) * sourceBitmap.height);
    const pw = Math.round((crop.width / 100) * sourceBitmap.width);
    const ph = Math.round((crop.height / 100) * sourceBitmap.height);

    if (pw <= 0 || ph <= 0 || pw < 10 || ph < 10) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      const callId = ++stalenessId.current;
      setProcessing(true);

      try {
        const blob = await cropBitmap(
          sourceBitmap,
          { x: px, y: py, width: pw, height: ph },
          outputFormat
        );
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
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sourceBitmap, crop, outputFormat]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
    };
  }, []);

  // Mode change: reset crop and result
  function handleCropModeChange(mode: CropMode) {
    setCropMode(mode);
    setCrop(undefined);
    setSelectedRatio(null);
    setResultBlob(null);
    if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
    prevBlobUrlRef.current = null;
    setPreviewUrl(null);
  }

  // Preset ratio: calculate max centered crop at the selected ratio
  function handleRatioSelect(ratio: number | null) {
    setSelectedRatio(ratio);
    if (!sourceBitmap) return;

    const aspect = ratio ?? sourceBitmap.width / sourceBitmap.height;
    const centered = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, aspect, sourceBitmap.width, sourceBitmap.height),
      sourceBitmap.width,
      sourceBitmap.height
    );
    setCrop(centered);
  }

  // Exact dimension handlers with optional aspect ratio lock
  function handleExactWidthChange(value: number) {
    const w = Math.max(0, value);
    setExactWidth(w);
    if (keepAspectRatio && sourceBitmap && w > 0) {
      const h = Math.round((w * sourceBitmap.height) / sourceBitmap.width);
      setExactHeight(Math.min(h, sourceBitmap.height));
    }
  }

  function handleExactHeightChange(value: number) {
    const h = Math.max(0, value);
    setExactHeight(h);
    if (keepAspectRatio && sourceBitmap && h > 0) {
      const w = Math.round((h * sourceBitmap.width) / sourceBitmap.height);
      setExactWidth(Math.min(w, sourceBitmap.width));
    }
  }

  // Full reselect — reset all state
  function onReselect() {
    handleReselect();
    setResultBlob(null);
    setPreviewUrl(null);
    setProcessing(false);
    setCropMode("free");
    setCrop(undefined);
    setSelectedRatio(null);
    setExactWidth(0);
    setExactHeight(0);
    setKeepAspectRatio(false);
  }

  // Crop result dimensions for ImageInfoBar
  const cropDimensions =
    sourceBitmap && crop
      ? {
          width: Math.round((crop.width / 100) * sourceBitmap.width),
          height: Math.round((crop.height / 100) * sourceBitmap.height),
        }
      : { width: 0, height: 0 };

  // Drop zone view (no image loaded)
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
        {/* Left panel — controls */}
        <div className="flex flex-col gap-4">
          {/* Crop mode selector */}
          <div>
            <label className="block text-sm font-medium text-fg-secondary mb-2">
              {t("cropMode")}
            </label>
            <div className="flex gap-1">
              {(["free", "preset", "exact"] as CropMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`flex-1 px-2 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                    cropMode === mode
                      ? "bg-accent-cyan text-bg-base"
                      : "border border-border-default text-fg-muted hover:text-fg-secondary hover:border-fg-muted"
                  }`}
                  onClick={() => handleCropModeChange(mode)}
                >
                  {mode === "free"
                    ? t("free")
                    : mode === "preset"
                      ? t("presetRatio")
                      : t("exactSize")}
                </button>
              ))}
            </div>
          </div>

          {/* Preset ratio grid */}
          {cropMode === "preset" && (
            <div className="grid grid-cols-4 gap-1.5">
              {PRESET_RATIOS.map((r) => (
                <button
                  key={r.labelKey}
                  type="button"
                  className={`px-2 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                    selectedRatio === r.value
                      ? "bg-accent-cyan text-bg-base"
                      : "border border-border-default text-fg-muted hover:text-fg-secondary hover:border-fg-muted"
                  }`}
                  onClick={() => handleRatioSelect(r.value)}
                >
                  {t(r.labelKey)}
                </button>
              ))}
            </div>
          )}

          {/* Exact dimension inputs */}
          {cropMode === "exact" && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <StyledInput
                  label={t("width")}
                  type="number"
                  min={1}
                  value={exactWidth || ""}
                  onChange={(e) => handleExactWidthChange(Number(e.target.value))}
                />
                <StyledInput
                  label={t("height")}
                  type="number"
                  min={1}
                  value={exactHeight || ""}
                  onChange={(e) => handleExactHeightChange(Number(e.target.value))}
                />
              </div>
              <StyledCheckbox
                label={t("keepAspectRatio")}
                checked={keepAspectRatio}
                onChange={(e) => setKeepAspectRatio(e.target.checked)}
              />
            </div>
          )}

          {/* Action buttons — same pattern as image-resize */}
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

        {/* Right panel — preview */}
        <div className="flex flex-col gap-3">
          <div
            className="relative w-full rounded-lg border border-border-default bg-bg-surface overflow-hidden"
            style={{ maxHeight: "500px" }}
          >
            {sourceUrl && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                aspect={cropAspect}
                ruleOfThirds
                minWidth={10}
                minHeight={10}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sourceUrl}
                  alt=""
                  style={{ maxWidth: "100%", maxHeight: "500px", display: "block" }}
                  draggable={false}
                />
              </ReactCrop>
            )}
            {processing && (
              <div className="absolute inset-0 bg-bg-base/60 flex flex-col items-center justify-center gap-2 z-30 pointer-events-none">
                <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-fg-secondary">{t("processing")}</span>
              </div>
            )}
          </div>

          {/* Cropped result preview */}
          {previewUrl && (
            <div className="rounded-lg border border-border-default bg-bg-surface overflow-hidden p-2">
              <p className="text-xs text-fg-muted mb-1">{t("result")}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt=""
                className="max-w-full max-h-64 object-contain"
                draggable={false}
              />
            </div>
          )}

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
                dimensions: cropDimensions,
              }}
            />
          )}

          {!crop && !resultBlob && (
            <p className="text-sm text-fg-muted text-center">{t("noSelection")}</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default function ImageCropPage() {
  const t = useTranslations("tools");
  return (
    <Layout
      title={t("image-crop.shortTitle")}
      categoryLabel={t("categories.visual")}
      categorySlug="visual-media"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner variant="files" />
        <Conversion />
        <DescriptionSection namespace="image-crop" />
        <RelatedTools currentTool="image-crop" />
      </div>
    </Layout>
  );
}
```

- [ ] **Step 2: Run ESLint**

Run:

```bash
npx eslint "app/[locale]/image-crop/image-crop-page.tsx"
```

Expected: No errors. If ESLint reports errors, fix them.

- [ ] **Step 3: Verify type checking**

Run:

```bash
npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: No type errors.

- [ ] **Step 4: Manual smoke test**

Run:

```bash
npm run dev
```

Open `http://localhost:3000/image-crop`. Verify:

1. Drop zone appears
2. Upload an image → ReactCrop overlay appears
3. Draw a selection → cropped preview appears after ~300ms
4. Switch to Preset mode → select 1:1 → centered square crop appears
5. Switch to Exact mode → enter 800×600 → centered crop appears
6. Download button works
7. Copy to clipboard works
8. Reselect resets everything

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/image-crop/image-crop-page.tsx"
git commit -m "feat(image-crop): add client page component with free/preset/exact crop modes"
```

---

## Task 7: Non-English Locales (9 languages)

**Files:**

- Modify: `public/locales/{zh-CN,zh-TW,ja,ko,es,pt-BR,fr,de,ru}/tools.json` (add `image-crop` entry)
- Create: `public/locales/{zh-CN,zh-TW,ja,ko,es,pt-BR,fr,de,ru}/image-crop.json`

This task creates 18 files. Each locale needs:

1. An `image-crop` entry in `tools.json` (with `searchTerms` for CJK languages)
2. A standalone `image-crop.json` file with all UI strings + descriptions

Follow the project i18n convention: English is the source of truth. Translate into each locale using natural, idiomatic phrasing for that developer community.

### CJK locales — tools.json entries (include `searchTerms`)

- [ ] **Step 1: Add image-crop to zh-CN/tools.json**

Add to `public/locales/zh-CN/tools.json`:

```json
"image-crop": {
  "title": "图片裁剪 - 在线裁剪图片",
  "shortTitle": "图片裁剪",
  "description": "自由裁剪、预设比例或精确像素尺寸裁剪图片。支持 PNG、JPG、WebP。所有处理在浏览器本地完成。",
  "searchTerms": "tupiancaijian tpccj caijian xuanqu qiege"
}
```

- [ ] **Step 2: Add image-crop to zh-TW/tools.json**

Add to `public/locales/zh-TW/tools.json`:

```json
"image-crop": {
  "title": "圖片裁剪 - 線上裁剪圖片",
  "shortTitle": "圖片裁剪",
  "description": "自由裁剪、預設比例或精確像素尺寸裁剪圖片。支援 PNG、JPG、WebP。所有處理在瀏覽器本機完成。",
  "searchTerms": "tupiancaijian tpccj caijian xuanqu qiege"
}
```

- [ ] **Step 3: Add image-crop to ja/tools.json**

Add to `public/locales/ja/tools.json`:

```json
"image-crop": {
  "title": "画像トリミング - オンラインで画像を切り抜き",
  "shortTitle": "画像トリミング",
  "description": "自由選択、プリセット比率、または正確なピクセル寸法で画像をトリミング。PNG、JPG、WebP対応。すべての処理はブラウザで実行されます。",
  "searchTerms": "gazoutorimingu gotrg torimingu gazou kado"
}
```

- [ ] **Step 4: Add image-crop to ko/tools.json**

Add to `public/locales/ko/tools.json`:

```json
"image-crop": {
  "title": "이미지 자르기 - 온라인 이미지 크롭",
  "shortTitle": "이미지 자르기",
  "description": "자유 선택, 미리 설정된 비율 또는 정확한 픽셀 크기로 이미지를 자릅니다. PNG, JPG, WebP 지원. 모든 처리는 브라우저에서 실행됩니다.",
  "searchTerms": "imijajareugi ijjrg jareugi sajin seontaeg"
}
```

### Latin-script locales — tools.json entries (no `searchTerms` needed)

- [ ] **Step 5: Add image-crop to es/tools.json**

```json
"image-crop": {
  "title": "Recortar Imagen - Recortar Imágenes Online",
  "shortTitle": "Recortar Imagen",
  "description": "Recorta imágenes con selección libre, relaciones de aspecto predefinidas o dimensiones exactas en píxeles. Compatible con PNG, JPG, WebP. Todo el procesamiento se realiza en tu navegador."
}
```

- [ ] **Step 6: Add image-crop to pt-BR/tools.json**

```json
"image-crop": {
  "title": "Recortar Imagem - Cortar Imagens Online",
  "shortTitle": "Recortar Imagem",
  "description": "Recorte imagens com seleção livre, proporções predefinidas ou dimensões exatas em pixels. Suporta PNG, JPG, WebP. Todo o processamento é feito no seu navegador."
}
```

- [ ] **Step 7: Add image-crop to fr/tools.json**

```json
"image-crop": {
  "title": "Recadrer une Image - Recadrage en Ligne",
  "shortTitle": "Recadrer une Image",
  "description": "Recadrez des images avec sélection libre, ratios prédéfinis ou dimensions exactes en pixels. Prend en charge PNG, JPG, WebP. Tout le traitement s'effectue dans votre navigateur."
}
```

- [ ] **Step 8: Add image-crop to de/tools.json**

```json
"image-crop": {
  "title": "Bild Zuschneiden - Bilder Online Zuschneiden",
  "shortTitle": "Bild Zuschneiden",
  "description": "Schneiden Sie Bilder mit freier Auswahl, voreingestellten Seitenverhältnissen oder genauen Pixelmaßen zu. Unterstützt PNG, JPG, WebP. Die gesamte Verarbeitung erfolgt in Ihrem Browser."
}
```

- [ ] **Step 9: Add image-crop to ru/tools.json**

```json
"image-crop": {
  "title": "Обрезка Изображений - Обрезать Картинку Онлайн",
  "shortTitle": "Обрезка Изображений",
  "description": "Обрезайте изображения свободным выделением, по предустановленным пропорциям или точным пиксельным размерам. Поддерживает PNG, JPG, WebP. Вся обработка выполняется в вашем браузере."
}
```

### Create all 9 image-crop.json files

- [ ] **Step 10: Create zh-CN/image-crop.json**

Create `public/locales/zh-CN/image-crop.json`:

```json
{
  "dropImage": "将图片拖放到此处或点击选择",
  "supportedFormats": "支持 PNG、JPG、WebP、GIF、BMP、SVG",
  "cropMode": "裁剪模式",
  "free": "自由",
  "presetRatio": "预设",
  "exactSize": "精确",
  "ratioOriginal": "原始",
  "ratio_1_1": "1:1",
  "ratio_16_9": "16:9",
  "ratio_4_3": "4:3",
  "ratio_3_2": "3:2",
  "ratio_2_3": "2:3",
  "ratio_9_16": "9:16",
  "ratio_21_9": "21:9",
  "width": "宽度",
  "height": "高度",
  "keepAspectRatio": "保持宽高比",
  "reselect": "重新选择",
  "copyToClipboard": "复制到剪贴板",
  "copiedToClipboard": "已复制到剪贴板（PNG 格式）",
  "original": "原始",
  "result": "结果",
  "processing": "处理中...",
  "noSelection": "在图片上绘制选区以进行裁剪",
  "encodingFailed": "该格式的编码失败",
  "firstFrameOnly": "动图 — 仅使用第一帧",
  "largeImage": "大图片（{w}×{h}）— 处理可能较慢",
  "formatNotSupported": "不支持该图片格式。请使用 PNG、JPG、WebP、GIF、BMP 或 SVG。",
  "descriptions": {
    "title": "关于图片裁剪",
    "aeoDefinition": "图片裁剪是一个免费的在线图片裁剪工具，支持自由选择、预设比例或精确像素尺寸裁剪。支持 PNG、JPG、WebP。所有处理均在浏览器本地完成。",
    "whatIsTitle": "什么是图片裁剪？",
    "whatIs": "使用自由选择、预设宽高比（1:1、16:9、4:3 等）或精确像素尺寸直接在浏览器中裁剪图片。数据不会上传到任何服务器 — 所有处理使用 HTML5 Canvas API。",
    "stepsTitle": "如何裁剪图片",
    "step1Title": "拖放或选择图片",
    "step1Text": "将图片拖放到拖放区，或点击浏览。支持 PNG、JPG、WebP、GIF、BMP 和 SVG 格式。",
    "step2Title": "选择裁剪区域",
    "step2Text": "在图片上绘制选区矩形。选择自由裁剪、预设宽高比或输入精确像素尺寸。",
    "step3Title": "下载裁剪后的图片",
    "step3Text": "预览裁剪后的图片并下载。输出格式与输入格式相同。",
    "p1": "使用自由选择、预设比例或精确尺寸裁剪图片。使用[图片缩放](/image-resize)调整大小，[图片压缩](/image-compress)压缩图片，或[图片转换](/image-convert)转换格式。",
    "p2": "支持 PNG、JPG 和 WebP 输出。GIF、BMP、SVG 或 AVIF 格式的图片会自动转换为 PNG。",
    "faq1Q": "支持裁剪哪些图片格式？",
    "faq1A": "可以裁剪 PNG、JPG、WebP、GIF、BMP、SVG 和 AVIF 图片。输出格式与输入格式相同。不支持的输出格式（GIF、BMP、SVG、AVIF）会保存为 PNG。",
    "faq2Q": "我的图片会上传到服务器吗？",
    "faq2A": "不会。所有图片处理均在您的浏览器中使用 Canvas API 完成。您的图片不会离开您的设备。",
    "faq3Q": "可以按特定宽高比裁剪吗？",
    "faq3A": "可以。使用预设模式选择常用宽高比（1:1、16:9、4:3 等），或使用精确模式输入特定的像素尺寸。"
  }
}
```

- [ ] **Step 11: Create zh-TW/image-crop.json**

Create `public/locales/zh-TW/image-crop.json`:

```json
{
  "dropImage": "將圖片拖放到此處或點擊選擇",
  "supportedFormats": "支援 PNG、JPG、WebP、GIF、BMP、SVG",
  "cropMode": "裁剪模式",
  "free": "自由",
  "presetRatio": "預設",
  "exactSize": "精確",
  "ratioOriginal": "原始",
  "ratio_1_1": "1:1",
  "ratio_16_9": "16:9",
  "ratio_4_3": "4:3",
  "ratio_3_2": "3:2",
  "ratio_2_3": "2:3",
  "ratio_9_16": "9:16",
  "ratio_21_9": "21:9",
  "width": "寬度",
  "height": "高度",
  "keepAspectRatio": "保持寬高比",
  "reselect": "重新選擇",
  "copyToClipboard": "複製到剪貼簿",
  "copiedToClipboard": "已複製到剪貼簿（PNG 格式）",
  "original": "原始",
  "result": "結果",
  "processing": "處理中...",
  "noSelection": "在圖片上繪製選取範圍以進行裁剪",
  "encodingFailed": "該格式的編碼失敗",
  "firstFrameOnly": "動圖 — 僅使用第一幀",
  "largeImage": "大圖片（{w}×{h}）— 處理可能較慢",
  "formatNotSupported": "不支援該圖片格式。請使用 PNG、JPG、WebP、GIF、BMP 或 SVG。",
  "descriptions": {
    "title": "關於圖片裁剪",
    "aeoDefinition": "圖片裁剪是一個免費的線上圖片裁剪工具，支援自由選擇、預設比例或精確像素尺寸裁剪。支援 PNG、JPG、WebP。所有處理均在瀏覽器本機完成。",
    "whatIsTitle": "什麼是圖片裁剪？",
    "whatIs": "使用自由選擇、預設寬高比（1:1、16:9、4:3 等）或精確像素尺寸直接在瀏覽器中裁剪圖片。資料不會上傳到任何伺服器 — 所有處理使用 HTML5 Canvas API。",
    "stepsTitle": "如何裁剪圖片",
    "step1Title": "拖放或選擇圖片",
    "step1Text": "將圖片拖放到拖放區，或點擊瀏覽。支援 PNG、JPG、WebP、GIF、BMP 和 SVG 格式。",
    "step2Title": "選擇裁剪區域",
    "step2Text": "在圖片上繪製選取矩形。選擇自由裁剪、預設寬高比或輸入精確像素尺寸。",
    "step3Title": "下載裁剪後的圖片",
    "step3Text": "預覽裁剪後的圖片並下載。輸出格式與輸入格式相同。",
    "p1": "使用自由選擇、預設比例或精確尺寸裁剪圖片。使用[圖片縮放](/image-resize)調整大小，[圖片壓縮](/image-compress)壓縮圖片，或[圖片轉換](/image-convert)轉換格式。",
    "p2": "支援 PNG、JPG 和 WebP 輸出。GIF、BMP、SVG 或 AVIF 格式的圖片會自動轉換為 PNG。",
    "faq1Q": "支援裁剪哪些圖片格式？",
    "faq1A": "可以裁剪 PNG、JPG、WebP、GIF、BMP、SVG 和 AVIF 圖片。輸出格式與輸入格式相同。不支援的輸出格式（GIF、BMP、SVG、AVIF）會儲存為 PNG。",
    "faq2Q": "我的圖片會上傳到伺服器嗎？",
    "faq2A": "不會。所有圖片處理均在您的瀏覽器中使用 Canvas API 完成。您的圖片不會離開您的裝置。",
    "faq3Q": "可以按特定寬高比裁剪嗎？",
    "faq3A": "可以。使用預設模式選擇常用寬高比（1:1、16:9、4:3 等），或使用精確模式輸入特定的像素尺寸。"
  }
}
```

- [ ] **Step 12: Create ja/image-crop.json**

Create `public/locales/ja/image-crop.json`:

```json
{
  "dropImage": "画像をここにドロップまたはクリックして選択",
  "supportedFormats": "PNG、JPG、WebP、GIF、BMP、SVG対応",
  "cropMode": "トリミングモード",
  "free": "フリー",
  "presetRatio": "プリセット",
  "exactSize": "サイズ指定",
  "ratioOriginal": "オリジナル",
  "ratio_1_1": "1:1",
  "ratio_16_9": "16:9",
  "ratio_4_3": "4:3",
  "ratio_3_2": "3:2",
  "ratio_2_3": "2:3",
  "ratio_9_16": "9:16",
  "ratio_21_9": "21:9",
  "width": "幅",
  "height": "高さ",
  "keepAspectRatio": "縦横比を保持",
  "reselect": "再選択",
  "copyToClipboard": "クリップボードにコピー",
  "copiedToClipboard": "PNG形式でクリップボードにコピーしました",
  "original": "元画像",
  "result": "結果",
  "processing": "処理中...",
  "noSelection": "画像上に選択範囲を描いてトリミングしてください",
  "encodingFailed": "この形式のエンコードに失敗しました",
  "firstFrameOnly": "アニメーション画像 — 最初のフレームのみ使用されます",
  "largeImage": "大きな画像（{w}×{h}）— 処理に時間がかかる場合があります",
  "formatNotSupported": "この画像形式はサポートされていません。PNG、JPG、WebP、GIF、BMP、SVGをご使用ください。",
  "descriptions": {
    "title": "画像トリミングについて",
    "aeoDefinition": "画像トリミングは、自由選択、プリセット比率、または正確なピクセル寸法で画像をトリミングできる無料オンラインツールです。PNG、JPG、WebP対応。すべての処理はブラウザでローカルに実行されます。",
    "whatIsTitle": "画像トリミングとは？",
    "whatIs": "自由選択、プリセットのアスペクト比（1:1、16:9、4:3など）、または正確なピクセル寸法でブラウザ上で直接画像をトリミング。データはサーバーにアップロードされません — すべての処理はHTML5 Canvas APIを使用します。",
    "stepsTitle": "画像のトリミング方法",
    "step1Title": "画像をドロップまたは選択",
    "step1Text": "画像をドロップゾーンにドラッグ＆ドロップするか、クリックして参照。PNG、JPG、WebP、GIF、BMP、SVG入力に対応。",
    "step2Title": "トリミング範囲を選択",
    "step2Text": "画像上に選択矩形を描画。フリー切り抜き、プリセットのアスペクト比、または正確なピクセル寸法を選択。",
    "step3Title": "トリミングした画像をダウンロード",
    "step3Text": "トリミング結果をプレビューしてダウンロード。出力形式は入力形式と同じです。",
    "p1": "自由選択、プリセット比率、またはサイズ指定で画像をトリミング。[画像リサイズ](/image-resize)でサイズ変更、[画像圧縮](/image-compress)で圧縮、[画像変換](/image-convert)で形式変換。",
    "p2": "PNG、JPG、WebPの出力に対応。GIF、BMP、SVG、AVIF形式の画像は自動的にPNGに変換されます。",
    "faq1Q": "どの画像形式をトリミングできますか？",
    "faq1A": "PNG、JPG、WebP、GIF、BMP、SVG、AVIF画像をトリミングできます。出力形式は入力形式と同じです。サポートされていない出力形式（GIF、BMP、SVG、AVIF）はPNGとして保存されます。",
    "faq2Q": "画像はサーバーにアップロードされますか？",
    "faq2A": "いいえ。すべての画像処理はブラウザのCanvas APIを使用して行われます。画像がデバイスを離れることはありません。",
    "faq3Q": "特定のアスペクト比でトリミングできますか？",
    "faq3A": "はい。プリセットモードで一般的なアスペクト比（1:1、16:9、4:3など）を選択するか、サイズ指定モードで正確なピクセル寸法を入力できます。"
  }
}
```

- [ ] **Step 13: Create ko/image-crop.json**

Create `public/locales/ko/image-crop.json`:

```json
{
  "dropImage": "이미지를 여기에 드롭하거나 클릭하여 선택",
  "supportedFormats": "PNG, JPG, WebP, GIF, BMP, SVG 지원",
  "cropMode": "자르기 모드",
  "free": "자유",
  "presetRatio": "프리셋",
  "exactSize": "정확히",
  "ratioOriginal": "원본",
  "ratio_1_1": "1:1",
  "ratio_16_9": "16:9",
  "ratio_4_3": "4:3",
  "ratio_3_2": "3:2",
  "ratio_2_3": "2:3",
  "ratio_9_16": "9:16",
  "ratio_21_9": "21:9",
  "width": "너비",
  "height": "높이",
  "keepAspectRatio": "가로세로 비율 유지",
  "reselect": "다시 선택",
  "copyToClipboard": "클립보드에 복사",
  "copiedToClipboard": "PNG로 클립보드에 복사됨",
  "original": "원본",
  "result": "결과",
  "processing": "처리 중...",
  "noSelection": "이미지에 선택 영역을 그려 자르기",
  "encodingFailed": "이 형식의 인코딩에 실패했습니다",
  "firstFrameOnly": "애니메이션 이미지 — 첫 번째 프레임만 사용됩니다",
  "largeImage": "큰 이미지({w}×{h}) — 처리가 느릴 수 있습니다",
  "formatNotSupported": "지원되지 않는 이미지 형식입니다. PNG, JPG, WebP, GIF, BMP 또는 SVG를 사용해 주세요.",
  "descriptions": {
    "title": "이미지 자르기 정보",
    "aeoDefinition": "이미지 자르기는 자유 선택, 미리 설정된 비율 또는 정확한 픽셀 크기로 이미지를 자를 수 있는 무료 온라인 도구입니다. PNG, JPG, WebP 지원. 모든 처리는 브라우저에서 로컬로 실행됩니다.",
    "whatIsTitle": "이미지 자르기란?",
    "whatIs": "자유 선택, 미리 설정된 가로세로 비율(1:1, 16:9, 4:3 등) 또는 정확한 픽셀 크기로 브라우저에서 직접 이미지를 자릅니다. 데이터는 서버에 업로드되지 않으며 HTML5 Canvas API를 사용합니다.",
    "stepsTitle": "이미지 자르기 방법",
    "step1Title": "이미지 드롭 또는 선택",
    "step1Text": "이미지를 드롭 영역에 드래그 앤 드롭하거나 클릭하여 찾아보기. PNG, JPG, WebP, GIF, BMP, SVG 입력 지원.",
    "step2Title": "자르기 영역 선택",
    "step2Text": "이미지에 선택 사각형을 그립니다. 자유 자르기, 미리 설정된 가로세로 비율 또는 정확한 픽셀 크기를 선택하세요.",
    "step3Title": "잘린 이미지 다운로드",
    "step3Text": "잘린 이미지를 미리 보고 다운로드. 출력 형식은 입력 형식과 동일합니다.",
    "p1": "자유 선택, 미리 설정된 비율 또는 정확한 크기로 이미지를 자르기. [이미지 리사이즈](/image-resize)로 크기 조절, [이미지 압축](/image-compress)으로 압축, [이미지 변환](/image-convert)으로 형식 변환.",
    "p2": "PNG, JPG, WebP 출력을 지원합니다. GIF, BMP, SVG, AVIF 형식의 이미지는 자동으로 PNG로 변환됩니다.",
    "faq1Q": "어떤 이미지 형식을 자를 수 있나요?",
    "faq1A": "PNG, JPG, WebP, GIF, BMP, SVG, AVIF 이미지를 자를 수 있습니다. 출력 형식은 입력 형식과 동일합니다. 지원되지 않는 출력 형식(GIF, BMP, SVG, AVIF)은 PNG로 저장됩니다.",
    "faq2Q": "이미지가 서버에 업로드되나요?",
    "faq2A": "아니요. 모든 이미지 처리는 브라우저의 Canvas API를 사용하여 이루어집니다. 이미지가 기기를 떠나지 않습니다.",
    "faq3Q": "특정 가로세로 비율로 자를 수 있나요?",
    "faq3A": "네. 프리셋 모드에서 일반적인 가로세로 비율(1:1, 16:9, 4:3 등)을 선택하거나 정확히 모드에서 특정 픽셀 크기를 입력할 수 있습니다."
  }
}
```

- [ ] **Step 14: Create es/image-crop.json**

Create `public/locales/es/image-crop.json`:

```json
{
  "dropImage": "Suelta una imagen aquí o haz clic para seleccionar",
  "supportedFormats": "Soporta PNG, JPG, WebP, GIF, BMP, SVG",
  "cropMode": "Modo de recorte",
  "free": "Libre",
  "presetRatio": "Preestablecido",
  "exactSize": "Exacto",
  "ratioOriginal": "Original",
  "ratio_1_1": "1:1",
  "ratio_16_9": "16:9",
  "ratio_4_3": "4:3",
  "ratio_3_2": "3:2",
  "ratio_2_3": "2:3",
  "ratio_9_16": "9:16",
  "ratio_21_9": "21:9",
  "width": "Ancho",
  "height": "Alto",
  "keepAspectRatio": "Mantener relación de aspecto",
  "reselect": "Seleccionar otro",
  "copyToClipboard": "Copiar al portapapeles",
  "copiedToClipboard": "Copiado al portapapeles como PNG",
  "original": "Original",
  "result": "Resultado",
  "processing": "Procesando...",
  "noSelection": "Dibuja una selección en la imagen para recortar",
  "encodingFailed": "Error de codificación para este formato",
  "firstFrameOnly": "Imagen animada — solo se usa el primer fotograma",
  "largeImage": "Imagen grande ({w}×{h}) — el procesamiento puede ser lento",
  "formatNotSupported": "Este formato de imagen no es compatible. Usa PNG, JPG, WebP, GIF, BMP o SVG.",
  "descriptions": {
    "title": "Acerca del Recortador de Imágenes",
    "aeoDefinition": "El Recortador de Imágenes es una herramienta online gratuita para recortar imágenes con selección libre, relaciones de aspecto predefinidas o dimensiones exactas en píxeles. Soporta PNG, JPG, WebP. Todo el procesamiento se ejecuta localmente en tu navegador.",
    "whatIsTitle": "¿Qué es el Recortador de Imágenes?",
    "whatIs": "Recorta imágenes con selección libre, relaciones de aspecto predefinidas (1:1, 16:9, 4:3, etc.) o dimensiones exactas en píxeles directamente en tu navegador. No se suben datos a ningún servidor — todo el procesamiento usa la API Canvas de HTML5.",
    "stepsTitle": "Cómo Recortar una Imagen",
    "step1Title": "Suelta o selecciona una imagen",
    "step1Text": "Arrastra y suelta una imagen en la zona de soltar, o haz clic para explorar. Soporta entrada PNG, JPG, WebP, GIF, BMP y SVG.",
    "step2Title": "Selecciona el área de recorte",
    "step2Text": "Dibuja un rectángulo de selección en la imagen. Elige recorte libre, una relación de aspecto predefinida o introduce dimensiones exactas en píxeles.",
    "step3Title": "Descarga la imagen recortada",
    "step3Text": "Previsualiza la imagen recortada y descárgala. El formato de salida coincide con el formato de entrada.",
    "p1": "Recorta imágenes con selección libre, relaciones predefinidas o dimensiones exactas. Redimensiona con [Redimensionador](/image-resize), comprime con [Compresor](/image-compress), o convierte formatos con [Conversor](/image-convert).",
    "p2": "Soporta salida PNG, JPG y WebP. Las imágenes en formato GIF, BMP, SVG o AVIF se convierten automáticamente a PNG.",
    "faq1Q": "¿Qué formatos de imagen puedo recortar?",
    "faq1A": "Puedes recortar imágenes PNG, JPG, WebP, GIF, BMP, SVG y AVIF. El formato de salida coincide con el de entrada. Los formatos de salida no compatibles (GIF, BMP, SVG, AVIF) se guardan como PNG.",
    "faq2Q": "¿Se suben mis imágenes a un servidor?",
    "faq2A": "No. Todo el procesamiento de imágenes ocurre en tu navegador usando la API Canvas. Tus imágenes nunca salen de tu dispositivo.",
    "faq3Q": "¿Puedo recortar con una relación de aspecto específica?",
    "faq3A": "Sí. Usa el modo Preestablecido para seleccionar relaciones de aspecto comunes (1:1, 16:9, 4:3, etc.) o el modo Exacto para introducir dimensiones específicas en píxeles."
  }
}
```

- [ ] **Step 15: Create pt-BR/image-crop.json**

Create `public/locales/pt-BR/image-crop.json`:

```json
{
  "dropImage": "Solte uma imagem aqui ou clique para selecionar",
  "supportedFormats": "Suporta PNG, JPG, WebP, GIF, BMP, SVG",
  "cropMode": "Modo de corte",
  "free": "Livre",
  "presetRatio": "Predefinido",
  "exactSize": "Exato",
  "ratioOriginal": "Original",
  "ratio_1_1": "1:1",
  "ratio_16_9": "16:9",
  "ratio_4_3": "4:3",
  "ratio_3_2": "3:2",
  "ratio_2_3": "2:3",
  "ratio_9_16": "9:16",
  "ratio_21_9": "21:9",
  "width": "Largura",
  "height": "Altura",
  "keepAspectRatio": "Manter proporção",
  "reselect": "Selecionar outro",
  "copyToClipboard": "Copiar para a área de transferência",
  "copiedToClipboard": "Copiado para a área de transferência como PNG",
  "original": "Original",
  "result": "Resultado",
  "processing": "Processando...",
  "noSelection": "Desenhe uma seleção na imagem para cortar",
  "encodingFailed": "Falha na codificação para este formato",
  "firstFrameOnly": "Imagem animada — apenas o primeiro quadro é usado",
  "largeImage": "Imagem grande ({w}×{h}) — o processamento pode ser lento",
  "formatNotSupported": "Este formato de imagem não é suportado. Use PNG, JPG, WebP, GIF, BMP ou SVG.",
  "descriptions": {
    "title": "Sobre o Recortador de Imagens",
    "aeoDefinition": "O Recortador de Imagens é uma ferramenta online gratuita para cortar imagens com seleção livre, proporções predefinidas ou dimensões exatas em pixels. Suporta PNG, JPG, WebP. Todo o processamento é executado localmente no seu navegador.",
    "whatIsTitle": "O que é o Recortador de Imagens?",
    "whatIs": "Corte imagens com seleção livre, proporções predefinidas (1:1, 16:9, 4:3, etc.) ou dimensões exatas em pixels diretamente no seu navegador. Nenhum dado é enviado a um servidor — todo o processamento usa a API Canvas do HTML5.",
    "stepsTitle": "Como Cortar uma Imagem",
    "step1Title": "Solte ou selecione uma imagem",
    "step1Text": "Arraste e solte uma imagem na zona de soltar, ou clique para navegar. Suporta entrada PNG, JPG, WebP, GIF, BMP e SVG.",
    "step2Title": "Selecione a área de corte",
    "step2Text": "Desenhe um retângulo de seleção na imagem. Escolha corte livre, uma proporção predefinida ou insira dimensões exatas em pixels.",
    "step3Title": "Baixe a imagem cortada",
    "step3Text": "Visualize a imagem cortada e baixe-a. O formato de saída corresponde ao formato de entrada.",
    "p1": "Corte imagens com seleção livre, proporções predefinidas ou dimensões exatas. Redimensione com [Redimensionador](/image-resize), comprima com [Compressor](/image-compress), ou converta formatos com [Conversor](/image-convert).",
    "p2": "Suporta saída PNG, JPG e WebP. Imagens em formato GIF, BMP, SVG ou AVIF são convertidas automaticamente para PNG.",
    "faq1Q": "Quais formatos de imagem posso cortar?",
    "faq1A": "Você pode cortar imagens PNG, JPG, WebP, GIF, BMP, SVG e AVIF. O formato de saída corresponde ao de entrada. Formatos de saída não suportados (GIF, BMP, SVG, AVIF) são salvos como PNG.",
    "faq2Q": "Minhas imagens são enviadas a um servidor?",
    "faq2A": "Não. Todo o processamento de imagens acontece no seu navegador usando a API Canvas. Suas imagens nunca saem do seu dispositivo.",
    "faq3Q": "Posso cortar com uma proporção específica?",
    "faq3A": "Sim. Use o modo Predefinido para selecionar proporções comuns (1:1, 16:9, 4:3, etc.) ou o modo Exato para inserir dimensões específicas em pixels."
  }
}
```

- [ ] **Step 16: Create fr/image-crop.json**

Create `public/locales/fr/image-crop.json`:

```json
{
  "dropImage": "Déposez une image ici ou cliquez pour sélectionner",
  "supportedFormats": "Prend en charge PNG, JPG, WebP, GIF, BMP, SVG",
  "cropMode": "Mode de recadrage",
  "free": "Libre",
  "presetRatio": "Préréglé",
  "exactSize": "Exact",
  "ratioOriginal": "Original",
  "ratio_1_1": "1:1",
  "ratio_16_9": "16:9",
  "ratio_4_3": "4:3",
  "ratio_3_2": "3:2",
  "ratio_2_3": "2:3",
  "ratio_9_16": "9:16",
  "ratio_21_9": "21:9",
  "width": "Largeur",
  "height": "Hauteur",
  "keepAspectRatio": "Conserver les proportions",
  "reselect": "Resélectionner",
  "copyToClipboard": "Copier dans le presse-papiers",
  "copiedToClipboard": "Copié dans le presse-papiers en PNG",
  "original": "Original",
  "result": "Résultat",
  "processing": "Traitement en cours...",
  "noSelection": "Dessinez une sélection sur l'image pour recadrer",
  "encodingFailed": "Échec de l'encodage pour ce format",
  "firstFrameOnly": "Image animée — seule la première image est utilisée",
  "largeImage": "Image volumineuse ({w}×{h}) — le traitement peut être lent",
  "formatNotSupported": "Ce format d'image n'est pas pris en charge. Utilisez PNG, JPG, WebP, GIF, BMP ou SVG.",
  "descriptions": {
    "title": "À propos du Recadreur d'Images",
    "aeoDefinition": "Le Recadreur d'Images est un outil en ligne gratuit pour recadrer des images avec sélection libre, ratios prédéfinis ou dimensions exactes en pixels. Prend en charge PNG, JPG, WebP. Tout le traitement s'effectue localement dans votre navigateur.",
    "whatIsTitle": "Qu'est-ce que le Recadreur d'Images ?",
    "whatIs": "Recadrez des images avec sélection libre, ratios prédéfinis (1:1, 16:9, 4:3, etc.) ou dimensions exactes en pixels directement dans votre navigateur. Aucune donnée n'est envoyée à un serveur — tout le traitement utilise l'API Canvas HTML5.",
    "stepsTitle": "Comment Recadrer une Image",
    "step1Title": "Déposez ou sélectionnez une image",
    "step1Text": "Glissez-déposez une image dans la zone de dépôt, ou cliquez pour parcourir. Prend en charge les formats PNG, JPG, WebP, GIF, BMP et SVG.",
    "step2Title": "Sélectionnez la zone de recadrage",
    "step2Text": "Dessinez un rectangle de sélection sur l'image. Choisissez le recadrage libre, un ratio prédéfini ou saisissez des dimensions exactes en pixels.",
    "step3Title": "Téléchargez l'image recadrée",
    "step3Text": "Prévisualisez l'image recadrée et téléchargez-la. Le format de sortie correspond au format d'entrée.",
    "p1": "Recadrez des images avec sélection libre, ratios prédéfinis ou dimensions exactes. Redimensionnez avec [Redimensionneur](/image-resize), compressez avec [Compresseur](/image-compress), ou convertissez les formats avec [Convertisseur](/image-convert).",
    "p2": "Prend en charge les sorties PNG, JPG et WebP. Les images aux formats GIF, BMP, SVG ou AVIF sont automatiquement converties en PNG.",
    "faq1Q": "Quels formats d'image puis-je recadrer ?",
    "faq1A": "Vous pouvez recadrer des images PNG, JPG, WebP, GIF, BMP, SVG et AVIF. Le format de sortie correspond au format d'entrée. Les formats de sortie non pris en charge (GIF, BMP, SVG, AVIF) sont enregistrés en PNG.",
    "faq2Q": "Mes images sont-elles envoyées à un serveur ?",
    "faq2A": "Non. Tout le traitement des images se fait dans votre navigateur via l'API Canvas. Vos images ne quittent jamais votre appareil.",
    "faq3Q": "Puis-je recadrer selon un ratio spécifique ?",
    "faq3A": "Oui. Utilisez le mode Préréglé pour sélectionner des ratios courants (1:1, 16:9, 4:3, etc.) ou le mode Exact pour saisir des dimensions précises en pixels."
  }
}
```

- [ ] **Step 17: Create de/image-crop.json**

Create `public/locales/de/image-crop.json`:

```json
{
  "dropImage": "Bild hierher ziehen oder klicken zum Auswählen",
  "supportedFormats": "Unterstützt PNG, JPG, WebP, GIF, BMP, SVG",
  "cropMode": "Zuschnittmodus",
  "free": "Frei",
  "presetRatio": "Vorlage",
  "exactSize": "Genau",
  "ratioOriginal": "Original",
  "ratio_1_1": "1:1",
  "ratio_16_9": "16:9",
  "ratio_4_3": "4:3",
  "ratio_3_2": "3:2",
  "ratio_2_3": "2:3",
  "ratio_9_16": "9:16",
  "ratio_21_9": "21:9",
  "width": "Breite",
  "height": "Höhe",
  "keepAspectRatio": "Seitenverhältnis beibehalten",
  "reselect": "Neu auswählen",
  "copyToClipboard": "In die Zwischenablage kopieren",
  "copiedToClipboard": "Als PNG in die Zwischenablage kopiert",
  "original": "Original",
  "result": "Ergebnis",
  "processing": "Verarbeitung...",
  "noSelection": "Zeichnen Sie eine Auswahl auf dem Bild zum Zuschneiden",
  "encodingFailed": "Kodierung für dieses Format fehlgeschlagen",
  "firstFrameOnly": "Animiertes Bild — nur das erste Bild wird verwendet",
  "largeImage": "Großes Bild ({w}×{h}) — Verarbeitung kann langsam sein",
  "formatNotSupported": "Dieses Bildformat wird nicht unterstützt. Bitte PNG, JPG, WebP, GIF, BMP oder SVG verwenden.",
  "descriptions": {
    "title": "Über den Bildzuschnitt",
    "aeoDefinition": "Der Bildzuschnitt ist ein kostenloses Online-Tool zum Zuschneiden von Bildern mit freier Auswahl, voreingestellten Seitenverhältnissen oder genauen Pixelmaßen. Unterstützt PNG, JPG, WebP. Die gesamte Verarbeitung erfolgt lokal in Ihrem Browser.",
    "whatIsTitle": "Was ist der Bildzuschnitt?",
    "whatIs": "Schneiden Sie Bilder mit freier Auswahl, voreingestellten Seitenverhältnissen (1:1, 16:9, 4:3 usw.) oder genauen Pixelmaßen direkt in Ihrem Browser zu. Es werden keine Daten an einen Server gesendet — die gesamte Verarbeitung verwendet die HTML5 Canvas-API.",
    "stepsTitle": "So schneiden Sie ein Bild zu",
    "step1Title": "Bild ablegen oder auswählen",
    "step1Text": "Ziehen Sie ein Bild in die Ablagezone oder klicken Sie zum Durchsuchen. Unterstützt PNG-, JPG-, WebP-, GIF-, BMP- und SVG-Eingabe.",
    "step2Title": "Zuschnittbereich auswählen",
    "step2Text": "Zeichnen Sie ein Auswahlrechteck auf dem Bild. Wählen Sie freien Zuschnitt, ein voreingestelltes Seitenverhältnis oder geben Sie genaue Pixelmaße ein.",
    "step3Title": "Zugeschnittenes Bild herunterladen",
    "step3Text": "Vorschau des zugeschnittenen Bildes anzeigen und herunterladen. Das Ausgabeformat entspricht dem Eingabeformat.",
    "p1": "Schneiden Sie Bilder mit freier Auswahl, voreingestellten Seitenverhältnissen oder genauen Maßen zu. Größe ändern mit [Bildgrößenänderung](/image-resize), komprimieren mit [Bildkompressor](/image-compress), oder Formate konvertieren mit [Bildkonverter](/image-convert).",
    "p2": "Unterstützt PNG-, JPG- und WebP-Ausgabe. Bilder im GIF-, BMP-, SVG- oder AVIF-Format werden automatisch in PNG konvertiert.",
    "faq1Q": "Welche Bildformate kann ich zuschneiden?",
    "faq1A": "Sie können PNG-, JPG-, WebP-, GIF-, BMP-, SVG- und AVIF-Bilder zuschneiden. Das Ausgabeformat entspricht dem Eingabeformat. Nicht unterstützte Ausgabeformate (GIF, BMP, SVG, AVIF) werden als PNG gespeichert.",
    "faq2Q": "Werden meine Bilder auf einen Server hochgeladen?",
    "faq2A": "Nein. Die gesamte Bildverarbeitung erfolgt in Ihrem Browser über die Canvas-API. Ihre Bilder verlassen nie Ihr Gerät.",
    "faq3Q": "Kann ich nach einem bestimmten Seitenverhältnis zuschneiden?",
    "faq3A": "Ja. Verwenden Sie den Vorlagen-Modus, um gängige Seitenverhältnisse (1:1, 16:9, 4:3 usw.) auszuwählen, oder den Genau-Modus, um bestimmte Pixelmaße einzugeben."
  }
}
```

- [ ] **Step 18: Create ru/image-crop.json**

Create `public/locales/ru/image-crop.json`:

```json
{
  "dropImage": "Перетащите изображение сюда или нажмите для выбора",
  "supportedFormats": "Поддерживает PNG, JPG, WebP, GIF, BMP, SVG",
  "cropMode": "Режим обрезки",
  "free": "Свободный",
  "presetRatio": "Предустановки",
  "exactSize": "Точный",
  "ratioOriginal": "Оригинал",
  "ratio_1_1": "1:1",
  "ratio_16_9": "16:9",
  "ratio_4_3": "4:3",
  "ratio_3_2": "3:2",
  "ratio_2_3": "2:3",
  "ratio_9_16": "9:16",
  "ratio_21_9": "21:9",
  "width": "Ширина",
  "height": "Высота",
  "keepAspectRatio": "Сохранять пропорции",
  "reselect": "Выбрать другое",
  "copyToClipboard": "Копировать в буфер обмена",
  "copiedToClipboard": "Скопировано в буфер обмена как PNG",
  "original": "Оригинал",
  "result": "Результат",
  "processing": "Обработка...",
  "noSelection": "Нарисуйте область выделения на изображении для обрезки",
  "encodingFailed": "Ошибка кодирования для этого формата",
  "firstFrameOnly": "Анимированное изображение — используется только первый кадр",
  "largeImage": "Большое изображение ({w}×{h}) — обработка может быть медленной",
  "formatNotSupported": "Этот формат изображения не поддерживается. Используйте PNG, JPG, WebP, GIF, BMP или SVG.",
  "descriptions": {
    "title": "Об обрезке изображений",
    "aeoDefinition": "Обрезка изображений — это бесплатный онлайн-инструмент для обрезки изображений с произвольным выделением, предустановленными пропорциями или точными пиксельными размерами. Поддерживает PNG, JPG, WebP. Вся обработка выполняется локально в вашем браузере.",
    "whatIsTitle": "Что такое обрезка изображений?",
    "whatIs": "Обрезайте изображения с произвольным выделением, предустановленными пропорциями (1:1, 16:9, 4:3 и т.д.) или точными пиксельными размерами прямо в браузере. Данные не загружаются на сервер — вся обработка использует HTML5 Canvas API.",
    "stepsTitle": "Как обрезать изображение",
    "step1Title": "Перетащите или выберите изображение",
    "step1Text": "Перетащите изображение в зону перетаскивания или нажмите для обзора. Поддерживает PNG, JPG, WebP, GIF, BMP и SVG.",
    "step2Title": "Выберите область обрезки",
    "step2Text": "Нарисуйте прямоугольник выделения на изображении. Выберите свободную обрезку, предустановленные пропорции или введите точные пиксельные размеры.",
    "step3Title": "Скачайте обрезанное изображение",
    "step3Text": "Просмотрите обрезанное изображение и скачайте его. Формат вывода совпадает с форматом ввода.",
    "p1": "Обрезайте изображения с произвольным выделением, предустановленными пропорциями или точными размерами. Изменяйте размер с помощью [Ресайза](/image-resize), сжимайте [Компрессором](/image-compress) или конвертируйте форматы [Конвертером](/image-convert).",
    "p2": "Поддерживает вывод в PNG, JPG и WebP. Изображения в формате GIF, BMP, SVG или AVIF автоматически конвертируются в PNG.",
    "faq1Q": "Какие форматы изображений можно обрезать?",
    "faq1A": "Вы можете обрезать изображения PNG, JPG, WebP, GIF, BMP, SVG и AVIF. Формат вывода совпадает с форматом ввода. Неподдерживаемые форматы вывода (GIF, BMP, SVG, AVIF) сохраняются как PNG.",
    "faq2Q": "Загружаются ли мои изображения на сервер?",
    "faq2A": "Нет. Вся обработка изображений происходит в вашем браузере с использованием Canvas API. Ваши изображения никогда не покидают ваше устройство.",
    "faq3Q": "Можно ли обрезать по определённым пропорциям?",
    "faq3A": "Да. Используйте режим Предустановок для выбора популярных пропорций (1:1, 16:9, 4:3 и т.д.) или режим Точный для ввода конкретных пиксельных размеров."
  }
}
```

- [ ] **Step 19: Validate all JSON files**

Run:

```bash
for f in public/locales/*/image-crop.json; do node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" || echo "INVALID: $f"; done && echo "All valid"
```

Expected: `All valid`

- [ ] **Step 20: Commit**

```bash
git add public/locales/
git commit -m "feat(image-crop): add i18n strings for all 10 locales"
```

---

## Self-Review Checklist

### Spec Coverage

| Spec Requirement                            | Task                                                  |
| ------------------------------------------- | ----------------------------------------------------- |
| Free crop mode                              | Task 6 (image-crop-page.tsx)                          |
| Preset aspect ratios (Original + 7 presets) | Task 6 (PRESET_RATIOS array + handleRatioSelect)      |
| Exact pixel dimensions with clamping        | Task 6 (handleExactWidthChange/HeightChange)          |
| Keep aspect ratio in exact mode             | Task 6 (StyledCheckbox + handler logic)               |
| react-image-crop ^11.x                      | Task 1 (npm install)                                  |
| Min selection 10×10 px                      | Task 6 (minWidth={10} minHeight={10})                 |
| Output format = input format                | Task 6 (resolveOutputFormat)                          |
| 100% quality (lossless)                     | Task 2 (cropBitmap: format === "png" ? undefined : 1) |
| 300ms debounce always                       | Task 6 (encode effect uses 300ms, no initialLoadRef)  |
| Staleness handling                          | Task 6 (stalenessId ref pattern)                      |
| Rule of thirds grid                         | Task 6 (ruleOfThirds prop on ReactCrop)               |
| Tool registration                           | Task 3                                                |
| Route entry with JSON-LD                    | Task 5                                                |
| English i18n                                | Task 4                                                |
| All 10 locales                              | Task 7                                                |
| CSS theme integration                       | Task 1                                                |
| Unit tests for cropBitmap clamping          | Task 2                                                |
| ImageInfoBar without savedPercent           | Task 6 (savedPercent prop omitted)                    |
| PrivacyBanner variant="files"               | Task 6                                                |
| RelatedTools + DescriptionSection           | Task 6                                                |

### Placeholder Scan

No TBD, TODO, "implement later", or "add validation" placeholders found. All code blocks contain complete implementations.

### Type Consistency

- `CropRegion` defined in Task 2 (`libs/image/crop.ts`) — used consistently in `cropBitmap` and `clampCropRegion`
- `Crop` from react-image-crop — used as `Crop | undefined` state in Task 6
- `CropMode` type `"free" | "preset" | "exact"` — used consistently in Task 6
- `OutputFormat` from `libs/image/types.ts` — used in Task 2 and Task 6
- `PRESET_RATIOS[].value: number | null` — `null` = Original (uses image's aspect ratio)
- `selectedRatio: number | null` — matches PRESET_RATIOS value type
