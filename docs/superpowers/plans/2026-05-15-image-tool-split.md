# Image Tool Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the monolithic Image Compressor (`/image`) into three focused tools: Image Resizer (`/image-resize`), Image Compressor (`/image-compress`), and Image Converter (`/image-convert`).

**Architecture:** Extract shared logic into hooks (`useImageInput`, `useImageExport`) and components (`ImageDropZone`, `ImageInfoBar`, `CompareSlider`) under `components/image/`. Each tool page consumes these shared primitives with tool-specific state and controls. Existing `libs/image/` pure functions (encode, resize, format-support) remain unchanged.

**Tech Stack:** Next.js 16 App Router, TypeScript, React, Tailwind CSS, next-intl, lucide-react, rc-slider, file-selector, Vitest

**Spec:** `docs/superpowers/specs/2026-05-15-image-tool-split-design.md`

---

## File Structure

### New files (created in this plan)

```
components/image/
  useImageInput.ts            # Shared hook: file selection + bitmap lifecycle
  useImageExport.ts           # Shared hook: download + clipboard copy
  ImageDropZone.tsx           # Shared: drag-and-drop / click-to-select UI
  ImageInfoBar.tsx            # Shared: original vs result metadata display
  CompareSlider.tsx           # Compress-only: drag-to-compare preview

utils/
  format-size.ts              # Shared: file size formatting (B/KB/MB)

app/[locale]/image-resize/
  page.tsx                    # Route entry + SEO metadata + HowTo/FAQ JSON-LD
  image-resize-page.tsx       # Page component
app/[locale]/image-compress/
  page.tsx
  image-compress-page.tsx
app/[locale]/image-convert/
  page.tsx
  image-convert-page.tsx

public/locales/{locale}/
  image-resize.json           # × 10 locales
  image-compress.json         # × 10 locales
  image-convert.json          # × 10 locales
```

### Modified files

```
libs/image/types.ts           # Add InputFormat, INPUT_MIME_TYPES, FORMAT_EXTENSIONS, FORMAT_DISPLAY_NAMES, resolveOutputFormat
libs/tools.ts                 # Replace "image" with 3 new tools in TOOLS, TOOL_CATEGORIES, TOOL_RELATIONS
public/locales/{locale}/tools.json  # Replace "image" entry with 3 new entries (× 10 locales)
AGENTS.md                     # Update Available Tools, Tool Categories, libs/ tables
README.md                     # Update Tools table
```

### Deleted files

```
app/[locale]/image/           # Entire directory
public/locales/{locale}/image.json  # × 10 locales
```

### Unchanged files (reference only — do NOT modify)

```
libs/image/encode.ts          # Pure function, already generic
libs/image/resize.ts          # Pure function, already generic
libs/image/format-support.ts  # Pure function, already generic
libs/image/__tests__/resize.test.ts
```

---

## Reference: Existing Patterns

All page components follow the pattern established by QR Code (`app/[locale]/qrcode/`):

**page.tsx** — server component with `generatePageMeta()` + `buildToolSchemas()`:

```typescript
// See app/[locale]/qrcode/page.tsx (62 lines)
const PATH = "/tool-name";
const TOOL_KEY = "tool-name";
const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
export async function generateMetadata({ params }) { ... }
export default async function ToolRoute({ params }) { ... }
```

**tool-page.tsx** — client component with Layout, PrivacyBanner, DescriptionSection, RelatedTools:

```typescript
// See app/[locale]/qrcode/qrcode-page.tsx
export default function ToolPage() {
  const t = useTranslations("tools");
  return (
    <Layout title={t("tool.shortTitle")} categoryLabel={t("categories.visual")} categorySlug="visual-media">
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner variant="files" />
        <Conversion />
        <DescriptionSection namespace="tool-name" />
        <RelatedTools currentTool="tool-name" />
      </div>
    </Layout>
  );
}
```

**DescriptionSection** — `namespace` prop matches the tool's i18n namespace. Default `howToStepCount=3`, `faqCount=3`.

---

## Task 1: Foundation — Types + Utility

**Files:**

- Modify: `libs/image/types.ts`
- Create: `utils/format-size.ts`

- [ ] **Step 1: Add new types and constants to `libs/image/types.ts`**

Append after the existing `ImageDimensions` interface (line 15):

```typescript
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
  jpeg: ".jpg",
  webp: ".webp",
};

export const FORMAT_DISPLAY_NAMES: Record<string, string> = {
  png: "PNG",
  jpeg: "JPG",
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
```

- [ ] **Step 2: Create `utils/format-size.ts`**

```typescript
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
```

- [ ] **Step 3: Run type check to verify**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `libs/image/types.ts` or `utils/format-size.ts`.

- [ ] **Step 4: Commit**

```bash
git add libs/image/types.ts utils/format-size.ts
git commit -m "feat(image): add shared types, constants, and formatFileSize utility for tool split"
```

---

## Task 2: useImageInput Hook

**Files:**

- Create: `components/image/useImageInput.ts`

This hook extracts file selection, drag-and-drop, bitmap lifecycle, and toast warnings from the current monolithic `image-page.tsx` (lines 34-226).

- [ ] **Step 1: Create `components/image/useImageInput.ts`**

```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import { showToast } from "../../libs/toast";
import { fromEvent } from "file-selector";
import { INPUT_MIME_TYPES } from "../../libs/image/types";

const MAX_MEGAPIXELS = 50;

interface UseImageInputOptions {
  t: (key: string, params?: Record<string, string | number>) => string;
}

export interface UseImageInputReturn {
  sourceFile: File | null;
  sourceBitmap: ImageBitmap | null;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleReselect: () => void;
  dropZoneRef: React.RefObject<HTMLDivElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export function useImageInput({ t }: UseImageInputOptions): UseImageInputReturn {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceBitmap, setSourceBitmap] = useState<ImageBitmap | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Internal: process a selected file
  async function processFile(file: File) {
    if (!INPUT_MIME_TYPES.includes(file.type)) {
      showToast(t("formatNotSupported"), "danger");
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      setSourceBitmap(bitmap);
      setSourceFile(file);

      // Animated image toast (GIF + animated WebP)
      if (file.type === "image/gif") {
        showToast(t("firstFrameOnly"), "info", 3000);
      } else if (file.type === "image/webp" && (await isAnimatedWebP(file))) {
        showToast(t("firstFrameOnly"), "info", 3000);
      }

      // Large image warning (>50 megapixels)
      const megapixels = bitmap.width * bitmap.height;
      if (megapixels > MAX_MEGAPIXELS * 1_000_000) {
        showToast(t("largeImage", { w: bitmap.width, h: bitmap.height }), "info", 4000);
      }
    } catch {
      showToast(t("encodingFailed"), "danger");
    }
  }

  // Input change handler
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  // Reset file and bitmap state (tool-specific reset is handled by the caller)
  function handleReselect() {
    if (sourceBitmap) sourceBitmap.close();
    setSourceFile(null);
    setSourceBitmap(null);
  }

  // Set up drag-and-drop on dropZoneRef using file-selector
  useEffect(() => {
    const dz = dropZoneRef.current;
    if (!dz) return;

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const onDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const files = await fromEvent(e);
      if (files && files.length > 0) {
        processFile(files[0] as File);
      }
    };

    dz.addEventListener("dragover", onDragOver);
    dz.addEventListener("drop", onDrop);
    return () => {
      dz.removeEventListener("dragover", onDragOver);
      dz.removeEventListener("drop", onDrop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close bitmap on unmount
  useEffect(() => {
    return () => {
      if (sourceBitmap) {
        sourceBitmap.close();
      }
    };
  }, [sourceBitmap]);

  return {
    sourceFile,
    sourceBitmap,
    handleFileSelect,
    handleReselect,
    dropZoneRef,
    fileInputRef,
  };
}

/** Heuristic: check for ANIM chunk in WebP file header. */
async function isAnimatedWebP(file: File): Promise<boolean> {
  try {
    const buffer = await file.slice(0, 1024).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const text = new TextDecoder().decode(bytes);
    return text.includes("ANIM");
  } catch {
    return false;
  }
}
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors for `components/image/useImageInput.ts`.

- [ ] **Step 3: Commit**

```bash
git add components/image/useImageInput.ts
git commit -m "feat(image): add useImageInput shared hook for file selection and bitmap lifecycle"
```

---

## Task 3: useImageExport Hook

**Files:**

- Create: `components/image/useImageExport.ts`

This hook extracts download and clipboard copy from the current monolithic `image-page.tsx` (lines 244-282).

- [ ] **Step 1: Create `components/image/useImageExport.ts`**

```typescript
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
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors for `components/image/useImageExport.ts`.

- [ ] **Step 3: Commit**

```bash
git add components/image/useImageExport.ts
git commit -m "feat(image): add useImageExport shared hook for download and clipboard copy"
```

---

## Task 4: ImageDropZone Component

**Files:**

- Create: `components/image/ImageDropZone.tsx`

Purely presentational component that renders the drag-and-drop zone UI. Drag-and-drop event handling is managed by `useImageInput` hook's useEffect on `dropZoneRef`.

- [ ] **Step 1: Create `components/image/ImageDropZone.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/image/ImageDropZone.tsx
git commit -m "feat(image): add ImageDropZone shared component"
```

---

## Task 5: ImageInfoBar Component

**Files:**

- Create: `components/image/ImageInfoBar.tsx`

Shared metadata display showing original vs result info (file size, format, dimensions, saved percentage).

- [ ] **Step 1: Create `components/image/ImageInfoBar.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/image/ImageInfoBar.tsx
git commit -m "feat(image): add ImageInfoBar shared component"
```

---

## Task 6: CompareSlider Component

**Files:**

- Create: `components/image/CompareSlider.tsx`

Drag-to-compare slider for Image Compressor only. Extracted from current `image-page.tsx` lines 305-350, 574-643.

- [ ] **Step 1: Create `components/image/CompareSlider.tsx`**

```tsx
"use client";

import React, { useEffect, useRef } from "react";
import { ImageIcon, ArrowLeftRight } from "lucide-react";

interface CompareSliderProps {
  originalUrl: string | null;
  resultUrl: string | null;
  sliderPos: number;
  onSliderChange: (pos: number) => void;
  draggingRef: React.MutableRefObject<boolean>;
  containerRef: React.RefObject<HTMLDivElement>;
  aspectRatio: number;
  processing: boolean;
  t: (key: string) => string;
}

export default function CompareSlider({
  originalUrl,
  resultUrl,
  sliderPos,
  onSliderChange,
  draggingRef,
  containerRef,
  aspectRatio,
  processing,
  t,
}: CompareSliderProps) {
  function updatePosition(clientX: number) {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    onSliderChange(Math.max(0, Math.min(100, x)));
  }

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    draggingRef.current = true;
    updatePosition(e.clientX);
  }

  function onTouchStart(e: React.TouchEvent) {
    draggingRef.current = true;
    updatePosition(e.touches[0].clientX);
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!draggingRef.current) return;
      updatePosition(e.clientX);
    }
    function onMouseUp() {
      draggingRef.current = false;
    }
    function onTouchMove(e: TouchEvent) {
      if (!draggingRef.current) return;
      updatePosition(e.touches[0].clientX);
    }
    function onTouchEnd() {
      draggingRef.current = false;
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- image comparison slider (pointer only) */
    <div
      ref={containerRef}
      className="relative w-full rounded-lg border border-border-default bg-bg-surface overflow-hidden cursor-col-resize select-none"
      style={{ aspectRatio: `${aspectRatio}`, maxHeight: "500px" }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* Original image — visible on the left side */}
      {originalUrl && (
        <img
          src={originalUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-contain"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          draggable={false}
        />
      )}
      {/* Compressed image — visible on the right side */}
      {resultUrl && (
        <img
          src={resultUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-contain"
          style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
          draggable={false}
        />
      )}
      {!resultUrl && !processing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon size={48} className="opacity-30 text-fg-muted" />
        </div>
      )}

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-accent-cyan z-10 pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-bg-surface border-2 border-accent-cyan flex items-center justify-center shadow-lg pointer-events-none">
          <ArrowLeftRight size={12} className="text-accent-cyan" />
        </div>
      </div>

      {/* Labels */}
      {resultUrl && (
        <>
          <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded text-xs font-semibold bg-bg-base/70 text-fg-secondary pointer-events-none">
            {t("original")}
          </div>
          <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded text-xs font-semibold bg-bg-base/70 text-fg-secondary pointer-events-none">
            {t("compressed")}
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded text-xs text-fg-muted bg-bg-base/50 pointer-events-none">
            {t("dragToCompare")}
          </div>
        </>
      )}

      {/* Processing overlay */}
      {processing && (
        <div className="absolute inset-0 bg-bg-base/60 flex flex-col items-center justify-center gap-2 z-30">
          <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-fg-secondary">{t("processing")}</span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/image/CompareSlider.tsx
git commit -m "feat(image): add CompareSlider component for Image Compressor"
```

---

## Task 7: Tool Registration

**Files:**

- Modify: `libs/tools.ts`

Replace the single `image` tool entry with three new entries. Update categories, relations, and batch references.

- [ ] **Step 1: Update `libs/tools.ts` imports**

Add `Scaling`, `FileDown`, `RefreshCw` to the lucide-react import. Remove `ImageDown` (no longer used). At line 32, change:

```typescript
// BEFORE (line 32):
  ImageDown,
// AFTER:
  Scaling,
  FileDown,
  RefreshCw,
```

- [ ] **Step 2: Update TOOL_CATEGORIES (line 120)**

```typescript
// BEFORE:
  { key: "visual", tools: ["color", "image"] },
// AFTER:
  { key: "visual", tools: ["color", "image-resize", "image-compress", "image-convert"] },
```

- [ ] **Step 3: Update TOOL_RELATIONS**

Replace `image` entry and update `color` and `batch` references:

```typescript
// BEFORE:
  color: ["image", "numbase", "cssunit"],
  image: ["color", "qrcode", "checksum"],
  batch: ["recipe", "hashing", "base64", "image"],
// AFTER:
  color: ["image-resize", "image-compress", "image-convert", "numbase", "cssunit"],
  "image-resize": ["image-compress", "image-convert", "color"],
  "image-compress": ["image-resize", "image-convert", "checksum"],
  "image-convert": ["image-resize", "image-compress", "qrcode"],
  batch: ["recipe", "hashing", "base64", "image-resize", "image-compress"],
```

- [ ] **Step 4: Replace TOOLS array entry (line 364)**

```typescript
// BEFORE (line 364):
  { key: "image", path: "/image", icon: ImageDown, emoji: "🖼️", sameAs: [] },
// AFTER:
  { key: "image-resize", path: "/image-resize", icon: Scaling, emoji: "📐", sameAs: [] },
  { key: "image-compress", path: "/image-compress", icon: FileDown, emoji: "🗜️", sameAs: [] },
  { key: "image-convert", path: "/image-convert", icon: RefreshCw, emoji: "🔄", sameAs: [] },
```

- [ ] **Step 5: Run type check**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: Some errors from pages referencing old `image` tool — that's OK, those files will be deleted later. No errors in `libs/tools.ts` itself.

- [ ] **Step 6: Commit**

```bash
git add libs/tools.ts
git commit -m "feat(tools): register image-resize, image-compress, image-convert tools"
```

---

## Task 8: English i18n — Source of Truth

**Files:**

- Modify: `public/locales/en/tools.json`
- Create: `public/locales/en/image-resize.json`
- Create: `public/locales/en/image-compress.json`
- Create: `public/locales/en/image-convert.json`

- [ ] **Step 1: Update `public/locales/en/tools.json` — replace `image` entry**

Find the `"image"` key (around line 153) and replace it with three new entries:

```json
"image-resize": {
  "title": "Image Resizer - Resize Images Online",
  "shortTitle": "Image Resizer",
  "description": "Resize images by percentage or custom dimensions. Supports PNG, JPG, WebP input. All processing runs in your browser."
},
"image-compress": {
  "title": "Image Compressor - Compress PNG, JPG, WebP",
  "shortTitle": "Image Compressor",
  "description": "Compress images with adjustable quality. Drag-to-compare preview. Supports PNG, JPG, WebP. All processing runs in your browser."
},
"image-convert": {
  "title": "Image Format Converter - PNG, JPG, WebP",
  "shortTitle": "Image Converter",
  "description": "Convert images between PNG, JPG, and WebP formats. All processing runs in your browser."
},
```

Remove the old `"image"` entry entirely.

- [ ] **Step 2: Create `public/locales/en/image-resize.json`**

```json
{
  "dropImage": "Drop an image here or click to select",
  "supportedFormats": "Supports PNG, JPG, WebP, GIF, BMP, SVG",
  "resize": "Resize",
  "noResize": "Original size",
  "byPercent": "By percentage",
  "customSize": "Custom size",
  "width": "Width",
  "height": "Height",
  "keepAspectRatio": "Keep aspect ratio",
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
  "descriptions": {
    "title": "About Image Resizer",
    "aeoDefinition": "Image Resizer is a free online tool for resizing images by percentage or custom dimensions. Supports PNG, JPG, WebP input. All processing runs locally in your browser.",
    "whatIsTitle": "What is the Image Resizer?",
    "whatIs": "Resize images by percentage or custom dimensions directly in your browser. Maintain aspect ratio or set exact pixel dimensions. No data is uploaded to any server — all processing uses the HTML5 Canvas API.",
    "stepsTitle": "How to Resize an Image",
    "step1Title": "Drop or select an image",
    "step1Text": "Drag and drop an image onto the drop zone, or click to browse. Supports PNG, JPG, WebP, GIF, BMP, and SVG input.",
    "step2Title": "Set target dimensions",
    "step2Text": "Choose resize by percentage (1–400%) or enter exact width and height in pixels. Toggle aspect ratio lock as needed.",
    "step3Title": "Download resized image",
    "step3Text": "Preview the resized image and download it. The output format matches the input format.",
    "p1": "Resize images by percentage or custom dimensions directly in your browser. Compress images with [Image Compressor](/image-compress), or convert formats with [Image Converter](/image-convert).",
    "p2": "Supports PNG, JPG, and WebP output. Images in GIF, BMP, SVG, or AVIF format are automatically converted to PNG.",
    "faq1Q": "What image formats can I resize?",
    "faq1A": "You can resize PNG, JPG, WebP, GIF, BMP, SVG, and AVIF images. The output format matches the input format. Unsupported output formats (GIF, BMP, SVG, AVIF) are saved as PNG.",
    "faq2Q": "Are my images uploaded to a server?",
    "faq2A": "No. All image processing happens in your browser using the Canvas API. Your images never leave your device.",
    "faq3Q": "How do I resize without distorting the image?",
    "faq3A": "Enable the \"Keep aspect ratio\" option when using custom dimensions. The image will be resized to fit within the specified dimensions while maintaining its original proportions."
  }
}
```

- [ ] **Step 3: Create `public/locales/en/image-compress.json`**

```json
{
  "dropImage": "Drop an image here or click to select",
  "supportedFormats": "Supports PNG, JPG, WebP, GIF, BMP, SVG",
  "quality": "Quality",
  "pngLosslessHint": "PNG is lossless — switch to [Image Converter](/image-convert) to convert to WebP for smaller file size.",
  "reselect": "Reselect",
  "copyToClipboard": "Copy to clipboard",
  "copiedToClipboard": "Copied to clipboard as PNG",
  "original": "Original",
  "compressed": "Compressed",
  "dragToCompare": "Drag to compare",
  "processing": "Processing...",
  "encodingFailed": "Encoding failed for this format",
  "firstFrameOnly": "Animated image — only the first frame is used",
  "largeImage": "Large image ({w}×{h}) — processing may be slow",
  "formatNotSupported": "This image format is not supported. Please use PNG, JPG, WebP, GIF, BMP, or SVG.",
  "descriptions": {
    "title": "About Image Compressor",
    "aeoDefinition": "Image Compressor is a free online tool for compressing images with adjustable quality and drag-to-compare preview. Supports PNG, JPG, WebP. All processing runs locally in your browser.",
    "whatIsTitle": "What is the Image Compressor?",
    "whatIs": "Compress images with adjustable quality using a drag-to-compare preview. Supports PNG, JPG, and WebP formats. No data is uploaded to any server — all processing uses the HTML5 Canvas API.",
    "stepsTitle": "How to Compress an Image",
    "step1Title": "Drop or select an image",
    "step1Text": "Drag and drop an image onto the drop zone, or click to browse. Supports PNG, JPG, WebP, GIF, BMP, and SVG input.",
    "step2Title": "Adjust quality",
    "step2Text": "Use the quality slider to balance file size and image quality. Lower quality means smaller files. PNG input is lossless — the quality slider is hidden for PNG.",
    "step3Title": "Compare and download",
    "step3Text": "Drag the comparison slider to see original vs. compressed side by side. Download the result or copy it to clipboard.",
    "p1": "Compress images with adjustable quality and drag-to-compare preview directly in your browser. Resize images with [Image Resizer](/image-resize), or convert formats with [Image Converter](/image-convert).",
    "p2": "Supports PNG, JPG, and WebP output formats. WebP offers the best compression ratio for web images.",
    "p3": "Use the quality slider to balance file size and image quality. Lower quality means smaller files.",
    "faq1Q": "Why is the quality slider hidden for PNG?",
    "faq1A": "PNG is a lossless format — adjusting quality has no effect. To reduce PNG file size, convert to WebP using the [Image Converter](/image-convert).",
    "faq2Q": "Are my images uploaded to a server?",
    "faq2A": "No. All image processing happens in your browser using the Canvas API. Your images never leave your device.",
    "faq3Q": "What image formats are supported?",
    "faq3A": "Input: PNG, JPG, WebP, GIF, BMP, SVG, AVIF. Output format matches input format. GIF, BMP, SVG, and AVIF output as PNG."
  }
}
```

- [ ] **Step 4: Create `public/locales/en/image-convert.json`**

```json
{
  "dropImage": "Drop an image here or click to select",
  "supportedFormats": "Supports PNG, JPG, WebP, GIF, BMP, SVG",
  "outputFormat": "Output Format",
  "formatUnsupported": "Not supported in this browser",
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
  "descriptions": {
    "title": "About Image Converter",
    "aeoDefinition": "Image Converter is a free online tool for converting images between PNG, JPG, and WebP formats. All processing runs locally in your browser.",
    "whatIsTitle": "What is the Image Converter?",
    "whatIs": "Convert images between PNG, JPG, and WebP formats directly in your browser. Maintain original dimensions and quality. No data is uploaded to any server — all processing uses the HTML5 Canvas API.",
    "stepsTitle": "How to Convert an Image",
    "step1Title": "Drop or select an image",
    "step1Text": "Drag and drop an image onto the drop zone, or click to browse. Supports PNG, JPG, WebP, GIF, BMP, and SVG input.",
    "step2Title": "Choose output format",
    "step2Text": "Select PNG, JPG, or WebP as the output format. Unsupported formats in your browser are automatically disabled.",
    "step3Title": "Download converted image",
    "step3Text": "Preview the converted image and download it. JPEG and WebP output uses 90% quality by default.",
    "p1": "Convert images between PNG, JPG, and WebP formats directly in your browser. Resize images with [Image Resizer](/image-resize), or compress them with [Image Compressor](/image-compress).",
    "p2": "PNG is lossless with transparency support. JPG offers smaller file sizes for photos. WebP provides the best compression ratio for web images.",
    "faq1Q": "What is the output quality?",
    "faq1A": "JPEG and WebP output uses 90% quality for a good balance between file size and visual fidelity. PNG output is lossless.",
    "faq2Q": "Are my images uploaded to a server?",
    "faq2A": "No. All image processing happens in your browser using the Canvas API. Your images never leave your device.",
    "faq3Q": "Why is a format option disabled?",
    "faq3A": "Your browser does not support encoding that format. Most modern browsers support PNG, JPG, and WebP."
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add public/locales/en/tools.json public/locales/en/image-resize.json public/locales/en/image-compress.json public/locales/en/image-convert.json
git commit -m "feat(i18n): add English translations for image-resize, image-compress, image-convert"
```

---

## Task 9: Image Resizer Page

**Files:**

- Create: `app/[locale]/image-resize/page.tsx`
- Create: `app/[locale]/image-resize/image-resize-page.tsx`

- [ ] **Step 1: Create `app/[locale]/image-resize/page.tsx`**

```typescript
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import ImageResizePage from "./image-resize-page";

const PATH = "/image-resize";
const TOOL_KEY = "image-resize";
const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("image-resize.title"),
    description: t("image-resize.description"),
    ogImage: { type: "tool", key: TOOL_KEY },
  });
}

export default async function ImageResizeRoute({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "image-resize" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("image-resize.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("image-resize.description"),
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
      <ImageResizePage />
    </>
  );
}
```

- [ ] **Step 2: Create `app/[locale]/image-resize/image-resize-page.tsx`**

```tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import PrivacyBanner from "../../../components/privacy-banner";
import DescriptionSection from "../../../components/description-section";
import RelatedTools from "../../../components/related-tools";
import { Download, Clipboard, RefreshCw } from "lucide-react";
import { StyledInput, StyledCheckbox } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { encode } from "../../../libs/image/encode";
import { calculateDimensions } from "../../../libs/image/resize";
import type { ResizeMode, OutputFormat } from "../../../libs/image/types";
import { resolveOutputFormat, formatKeyFromMime } from "../../../libs/image/types";
import { useImageInput } from "../../../components/image/useImageInput";
import { useImageExport } from "../../../components/image/useImageExport";
import ImageDropZone from "../../../components/image/ImageDropZone";
import ImageInfoBar from "../../../components/image/ImageInfoBar";
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

function Conversion() {
  const t = useTranslations("image-resize");
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

  // Tool-specific state
  const [resizeMode, setResizeMode] = useState<ResizeMode>("percent");
  const [resizePercent, setResizePercent] = useState(100);
  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);

  const stalenessId = useRef(0);
  const prevBlobUrlRef = useRef<string | null>(null);
  const initialLoadRef = useRef(true);

  // Encode pipeline with debounce
  useEffect(() => {
    if (!sourceBitmap) return;

    const dims = calculateDimensions(
      sourceBitmap.width,
      sourceBitmap.height,
      resizeMode,
      resizePercent,
      targetWidth,
      targetHeight,
      keepAspectRatio
    );

    const isInitial = initialLoadRef.current;
    initialLoadRef.current = false;

    let cancelled = false;
    const timer = setTimeout(
      async () => {
        if (cancelled) return;
        const callId = ++stalenessId.current;
        setProcessing(true);

        try {
          const blob = await encode(sourceBitmap, {
            format: outputFormat,
            quality: 100,
            width: dims.width,
            height: dims.height,
          });

          if (callId !== stalenessId.current) return;

          if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
          prevBlobUrlRef.current = URL.createObjectURL(blob);
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
  }, [
    sourceBitmap,
    resizeMode,
    resizePercent,
    targetWidth,
    targetHeight,
    keepAspectRatio,
    outputFormat,
  ]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
    };
  }, []);

  // Full reselect handler (shared reset + tool-specific reset)
  function onReselect() {
    handleReselect();
    setResultBlob(null);
    setProcessing(false);
    setResizeMode("percent");
    setResizePercent(100);
    setTargetWidth(0);
    setTargetHeight(0);
    setKeepAspectRatio(true);
    initialLoadRef.current = true;
  }

  const previewUrl = prevBlobUrlRef.current;
  const dims = sourceBitmap
    ? calculateDimensions(
        sourceBitmap.width,
        sourceBitmap.height,
        resizeMode,
        resizePercent,
        targetWidth,
        targetHeight,
        keepAspectRatio
      )
    : { width: 0, height: 0 };
  const savedPercent =
    sourceFile && resultBlob && sourceFile.size > 0
      ? Math.round((1 - resultBlob.size / sourceFile.size) * 100)
      : 0;

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
          {/* Resize mode */}
          <div>
            <label className="block text-sm font-medium text-fg-secondary mb-2">
              {t("resize")}
            </label>
            <div className="flex gap-1">
              {(["percent", "custom"] as ResizeMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`flex-1 px-2 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                    resizeMode === mode
                      ? "bg-accent-cyan text-bg-base"
                      : "border border-border-default text-fg-muted hover:text-fg-secondary hover:border-fg-muted"
                  }`}
                  onClick={() => setResizeMode(mode)}
                >
                  {mode === "percent" ? t("byPercent") : t("customSize")}
                </button>
              ))}
            </div>
          </div>

          {/* Percent slider */}
          {resizeMode === "percent" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-fg-secondary">{t("byPercent")}</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={400}
                    value={resizePercent}
                    onChange={(e) =>
                      setResizePercent(Math.max(1, Math.min(400, Number(e.target.value))))
                    }
                    className="w-14 text-right font-mono text-sm font-bold text-accent-cyan bg-transparent border-b border-accent-cyan/40 outline-none focus:border-accent-cyan transition-colors"
                  />
                  <span className="text-sm text-fg-muted">%</span>
                </div>
              </div>
              <div className="px-1">
                <Slider
                  min={1}
                  max={400}
                  step={1}
                  value={resizePercent}
                  onChange={(v) => setResizePercent(typeof v === "number" ? v : v[0])}
                  styles={sliderStyles}
                />
              </div>
            </div>
          )}

          {/* Custom dimensions */}
          {resizeMode === "custom" && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <StyledInput
                  label={t("width")}
                  type="number"
                  min={1}
                  value={targetWidth || ""}
                  onChange={(e) => setTargetWidth(Math.max(0, Number(e.target.value)))}
                />
                <StyledInput
                  label={t("height")}
                  type="number"
                  min={1}
                  value={targetHeight || ""}
                  onChange={(e) => setTargetHeight(Math.max(0, Number(e.target.value)))}
                />
              </div>
              <StyledCheckbox
                label={t("keepAspectRatio")}
                checked={keepAspectRatio}
                onChange={(e) => setKeepAspectRatio(e.target.checked)}
              />
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
                dimensions: { width: sourceBitmap!.width, height: sourceBitmap!.height },
              }}
              result={{
                label: t("result"),
                fileSize: resultBlob.size,
                format: String(outputFormat),
                dimensions: dims,
              }}
              savedPercent={savedPercent}
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default function ImageResizePage() {
  const t = useTranslations("tools");
  return (
    <Layout
      title={t("image-resize.shortTitle")}
      categoryLabel={t("categories.visual")}
      categorySlug="visual-media"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner variant="files" />
        <Conversion />
        <DescriptionSection namespace="image-resize" />
        <RelatedTools currentTool="image-resize" />
      </div>
    </Layout>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\[locale\]/image-resize/
git commit -m "feat(image-resize): add Image Resizer tool page"
```

---

## Task 10: Image Compressor Page

**Files:**

- Create: `app/[locale]/image-compress/page.tsx`
- Create: `app/[locale]/image-compress/image-compress-page.tsx`

- [ ] **Step 1: Create `app/[locale]/image-compress/page.tsx`**

```typescript
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import ImageCompressPage from "./image-compress-page";

const PATH = "/image-compress";
const TOOL_KEY = "image-compress";
const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("image-compress.title"),
    description: t("image-compress.description"),
    ogImage: { type: "tool", key: TOOL_KEY },
  });
}

export default async function ImageCompressRoute({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "image-compress" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("image-compress.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("image-compress.description"),
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
      <ImageCompressPage />
    </>
  );
}
```

- [ ] **Step 2: Create `app/[locale]/image-compress/image-compress-page.tsx`**

```tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import PrivacyBanner from "../../../components/privacy-banner";
import DescriptionSection from "../../../components/description-section";
import RelatedTools from "../../../components/related-tools";
import { Download, Clipboard, RefreshCw } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { encode } from "../../../libs/image/encode";
import type { OutputFormat } from "../../../libs/image/types";
import { resolveOutputFormat, formatKeyFromMime } from "../../../libs/image/types";
import { useImageInput } from "../../../components/image/useImageInput";
import { useImageExport } from "../../../components/image/useImageExport";
import ImageDropZone from "../../../components/image/ImageDropZone";
import ImageInfoBar from "../../../components/image/ImageInfoBar";
import CompareSlider from "../../../components/image/CompareSlider";
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

function Conversion() {
  const t = useTranslations("image-compress");
  const tc = useTranslations("common");

  const { sourceFile, sourceBitmap, handleFileSelect, handleReselect, dropZoneRef, fileInputRef } =
    useImageInput({ t });
  const outputFormat: OutputFormat = sourceFile ? resolveOutputFormat(sourceFile.type) : "png";
  const { handleDownload, handleCopy } = useImageExport({ sourceFile, outputFormat, t, tc });

  const [quality, setQuality] = useState(80);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);

  const stalenessId = useRef(0);
  const prevBlobUrlRef = useRef<string | null>(null);
  const originalUrlRef = useRef<string | null>(null);
  const initialLoadRef = useRef(true);
  const draggingRef = useRef(false);
  const compareContainerRef = useRef<HTMLDivElement>(null);

  const isPngInput = sourceFile?.type === "image/png";

  // Manage original image URL for comparison slider
  useEffect(() => {
    if (sourceFile) {
      if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
      originalUrlRef.current = URL.createObjectURL(sourceFile);
    }
    return () => {
      if (originalUrlRef.current) {
        URL.revokeObjectURL(originalUrlRef.current);
        originalUrlRef.current = null;
      }
    };
  }, [sourceFile]);

  // Encode pipeline with debounce
  useEffect(() => {
    if (!sourceBitmap) return;

    const isInitial = initialLoadRef.current;
    initialLoadRef.current = false;

    let cancelled = false;
    const timer = setTimeout(
      async () => {
        if (cancelled) return;
        const callId = ++stalenessId.current;
        setProcessing(true);

        try {
          const blob = await encode(sourceBitmap, {
            format: outputFormat,
            quality,
            width: sourceBitmap.width,
            height: sourceBitmap.height,
          });

          if (callId !== stalenessId.current) return;

          if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
          prevBlobUrlRef.current = URL.createObjectURL(blob);
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
  }, [sourceBitmap, outputFormat, quality]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
      if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
    };
  }, []);

  function onReselect() {
    handleReselect();
    setResultBlob(null);
    setProcessing(false);
    setQuality(80);
    setSliderPos(50);
    initialLoadRef.current = true;
  }

  const previewUrl = prevBlobUrlRef.current;
  const originalUrl = originalUrlRef.current;
  const savedPercent =
    sourceFile && resultBlob && sourceFile.size > 0
      ? Math.round((1 - resultBlob.size / sourceFile.size) * 100)
      : 0;

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
        {/* Controls */}
        <div className="flex flex-col gap-4">
          {/* Quality slider — hidden for PNG input */}
          {!isPngInput ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-fg-secondary">{t("quality")}</label>
                <span className="font-mono text-sm font-bold text-accent-cyan">{quality}%</span>
              </div>
              <div className="px-1">
                <Slider
                  min={1}
                  max={100}
                  step={1}
                  value={quality}
                  onChange={(v) => setQuality(typeof v === "number" ? v : v[0])}
                  styles={sliderStyles}
                />
              </div>
            </div>
          ) : (
            <div className="text-xs text-fg-muted bg-bg-surface rounded-lg p-3 border border-border-default">
              {t("pngLosslessHint")}
            </div>
          )}

          {/* Actions */}
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

        {/* Preview with CompareSlider */}
        <div className="flex flex-col gap-3">
          <CompareSlider
            originalUrl={originalUrl}
            resultUrl={previewUrl}
            sliderPos={sliderPos}
            onSliderChange={setSliderPos}
            draggingRef={draggingRef}
            containerRef={compareContainerRef}
            aspectRatio={sourceBitmap.width / sourceBitmap.height}
            processing={processing}
            t={t}
          />
          {resultBlob && (
            <ImageInfoBar
              original={{
                label: t("original"),
                fileSize: sourceFile!.size,
                format: formatKeyFromMime(sourceFile!.type),
                dimensions: { width: sourceBitmap!.width, height: sourceBitmap!.height },
              }}
              result={{
                label: t("compressed"),
                fileSize: resultBlob.size,
                format: String(outputFormat),
                dimensions: { width: sourceBitmap!.width, height: sourceBitmap!.height },
              }}
              savedPercent={savedPercent}
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default function ImageCompressPage() {
  const t = useTranslations("tools");
  return (
    <Layout
      title={t("image-compress.shortTitle")}
      categoryLabel={t("categories.visual")}
      categorySlug="visual-media"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner variant="files" />
        <Conversion />
        <DescriptionSection namespace="image-compress" />
        <RelatedTools currentTool="image-compress" />
      </div>
    </Layout>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\[locale\]/image-compress/
git commit -m "feat(image-compress): add Image Compressor tool page with CompareSlider"
```

---

## Task 11: Image Converter Page

**Files:**

- Create: `app/[locale]/image-convert/page.tsx`
- Create: `app/[locale]/image-convert/image-convert-page.tsx`

- [ ] **Step 1: Create `app/[locale]/image-convert/page.tsx`**

```typescript
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import ImageConvertPage from "./image-convert-page";

const PATH = "/image-convert";
const TOOL_KEY = "image-convert";
const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("image-convert.title"),
    description: t("image-convert.description"),
    ogImage: { type: "tool", key: TOOL_KEY },
  });
}

export default async function ImageConvertRoute({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "image-convert" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("image-convert.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("image-convert.description"),
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
      <ImageConvertPage />
    </>
  );
}
```

- [ ] **Step 2: Create `app/[locale]/image-convert/image-convert-page.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import PrivacyBanner from "../../../components/privacy-banner";
import DescriptionSection from "../../../components/description-section";
import RelatedTools from "../../../components/related-tools";
import { Download, Clipboard, RefreshCw } from "lucide-react";
import { StyledSelect } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { encode } from "../../../libs/image/encode";
import { getSupportedEncodeFormats } from "../../../libs/image/format-support";
import type { OutputFormat } from "../../../libs/image/types";
import { formatKeyFromMime } from "../../../libs/image/types";
import { useImageInput } from "../../../components/image/useImageInput";
import { useImageExport } from "../../../components/image/useImageExport";
import ImageDropZone from "../../../components/image/ImageDropZone";
import ImageInfoBar from "../../../components/image/ImageInfoBar";

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPG" },
  { value: "webp", label: "WebP" },
];

function Conversion() {
  const t = useTranslations("image-convert");
  const tc = useTranslations("common");

  const { sourceFile, sourceBitmap, handleFileSelect, handleReselect, dropZoneRef, fileInputRef } =
    useImageInput({ t });

  const [outputFormat, setOutputFormat] = useState<OutputFormat>("webp");
  const [supportedFormats, setSupportedFormats] = useState<Set<OutputFormat> | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);

  const { handleDownload, handleCopy } = useImageExport({ sourceFile, outputFormat, t, tc });

  const stalenessId = useRef(0);
  const prevBlobUrlRef = useRef<string | null>(null);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    getSupportedEncodeFormats().then(setSupportedFormats);
  }, []);

  // Encode pipeline with debounce
  useEffect(() => {
    if (!sourceBitmap) return;

    const isInitial = initialLoadRef.current;
    initialLoadRef.current = false;

    let cancelled = false;
    const timer = setTimeout(
      async () => {
        if (cancelled) return;
        const callId = ++stalenessId.current;
        setProcessing(true);

        try {
          const blob = await encode(sourceBitmap, {
            format: outputFormat,
            quality: outputFormat === "png" ? 100 : 90,
            width: sourceBitmap.width,
            height: sourceBitmap.height,
          });

          if (callId !== stalenessId.current) return;

          if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
          prevBlobUrlRef.current = URL.createObjectURL(blob);
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
  }, [sourceBitmap, outputFormat]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
    };
  }, []);

  function onReselect() {
    handleReselect();
    setResultBlob(null);
    setProcessing(false);
    setOutputFormat("webp");
    initialLoadRef.current = true;
  }

  const previewUrl = prevBlobUrlRef.current;
  const savedPercent =
    sourceFile && resultBlob && sourceFile.size > 0
      ? Math.round((1 - resultBlob.size / sourceFile.size) * 100)
      : 0;

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
        {/* Controls */}
        <div className="flex flex-col gap-4">
          {/* Format selector */}
          <div>
            <label className="block text-sm font-medium text-fg-secondary mb-1">
              {t("outputFormat")}
            </label>
            <StyledSelect
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
            >
              {FORMAT_OPTIONS.map((opt) => {
                const disabled = supportedFormats ? !supportedFormats.has(opt.value) : false;
                return (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={disabled}
                    title={disabled ? t("formatUnsupported") : undefined}
                  >
                    {opt.label}
                  </option>
                );
              })}
            </StyledSelect>
          </div>

          {/* Actions */}
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
                dimensions: { width: sourceBitmap!.width, height: sourceBitmap!.height },
              }}
              result={{
                label: t("result"),
                fileSize: resultBlob.size,
                format: String(outputFormat),
                dimensions: { width: sourceBitmap!.width, height: sourceBitmap!.height },
              }}
              savedPercent={savedPercent}
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default function ImageConvertPage() {
  const t = useTranslations("tools");
  return (
    <Layout
      title={t("image-convert.shortTitle")}
      categoryLabel={t("categories.visual")}
      categorySlug="visual-media"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner variant="files" />
        <Conversion />
        <DescriptionSection namespace="image-convert" />
        <RelatedTools currentTool="image-convert" />
      </div>
    </Layout>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\[locale\]/image-convert/
git commit -m "feat(image-convert): add Image Converter tool page"
```

---

## Task 12: CJK i18n Translations

**Files:**

- Modify: `public/locales/zh-CN/tools.json`, `public/locales/zh-TW/tools.json`, `public/locales/ja/tools.json`, `public/locales/ko/tools.json`
- Create: 4 locale files per tool × 4 locales = 16 files

For each CJK locale, replace the `"image"` entry in `tools.json` with 3 new entries, and create 3 new tool-specific JSON files following the English template (Task 8) with localized translations.

- [ ] **Step 1: Update `public/locales/zh-CN/tools.json`**

Remove the `"image"` entry. Add three entries:

```json
"image-resize": {
  "title": "图片缩放 - 在线调整图片尺寸",
  "shortTitle": "图片缩放",
  "description": "按百分比或自定义尺寸缩放图片。支持 PNG、JPG、WebP 输入。所有处理在浏览器本地完成。",
  "searchTerms": "tupiansuofang tpsf suofang chicun daxiao"
},
"image-compress": {
  "title": "图片压缩 - 压缩 PNG、JPG、WebP",
  "shortTitle": "图片压缩",
  "description": "可调质量的图片压缩工具，支持拖拽对比预览。支持 PNG、JPG、WebP。所有处理在浏览器本地完成。",
  "searchTerms": "tupianyasuo tpyz yasuo webp zhiliang"
},
"image-convert": {
  "title": "图片格式转换 - PNG、JPG、WebP",
  "shortTitle": "图片格式转换",
  "description": "在 PNG、JPG、WebP 格式之间转换图片。所有处理在浏览器本地完成。",
  "searchTerms": "tupiangeshi tpgs geshi webp png jpg"
},
```

- [ ] **Step 2: Create `public/locales/zh-CN/image-resize.json`**

```json
{
  "dropImage": "拖放图片到此处，或点击选择",
  "supportedFormats": "支持 PNG、JPG、WebP、GIF、BMP、SVG",
  "resize": "缩放",
  "noResize": "原始尺寸",
  "byPercent": "按百分比",
  "customSize": "自定义尺寸",
  "width": "宽度",
  "height": "高度",
  "keepAspectRatio": "保持宽高比",
  "reselect": "重新选择",
  "copyToClipboard": "复制到剪贴板",
  "copiedToClipboard": "已复制到剪贴板（PNG 格式）",
  "original": "原始",
  "result": "结果",
  "processing": "处理中...",
  "encodingFailed": "此格式的编码失败",
  "firstFrameOnly": "动态图片 — 仅使用第一帧",
  "largeImage": "大图片（{w}×{h}）— 处理可能较慢",
  "formatNotSupported": "不支持此图片格式。请使用 PNG、JPG、WebP、GIF、BMP 或 SVG。",
  "descriptions": {
    "title": "关于图片缩放",
    "aeoDefinition": "图片缩放是一个免费的在线工具，可按百分比或自定义尺寸调整图片大小。支持 PNG、JPG、WebP 输入。所有处理在浏览器本地完成。",
    "whatIsTitle": "什么是图片缩放？",
    "whatIs": "在浏览器中直接按百分比或自定义尺寸缩放图片。可保持宽高比或设置精确的像素尺寸。所有数据不上传到任何服务器，全部使用 HTML5 Canvas API 处理。",
    "stepsTitle": "如何缩放图片",
    "step1Title": "拖放或选择图片",
    "step1Text": "将图片拖放到拖放区域，或点击浏览。支持 PNG、JPG、WebP、GIF、BMP、SVG 输入。",
    "step2Title": "设置目标尺寸",
    "step2Text": "选择按百分比缩放（1–400%）或输入精确的宽度和高度（像素）。按需切换宽高比锁定。",
    "step3Title": "下载缩放后的图片",
    "step3Text": "预览缩放后的图片并下载。输出格式与输入格式相同。",
    "p1": "在浏览器中直接按百分比或自定义尺寸缩放图片。使用 [图片压缩](/image-compress) 压缩图片，或使用 [图片格式转换](/image-convert) 转换格式。",
    "p2": "支持 PNG、JPG、WebP 输出格式。GIF、BMP、SVG、AVIF 格式的图片会自动转换为 PNG。",
    "faq1Q": "可以缩放哪些格式的图片？",
    "faq1A": "可以缩放 PNG、JPG、WebP、GIF、BMP、SVG、AVIF 图片。输出格式与输入格式相同。不支持的输出格式（GIF、BMP、SVG、AVIF）会保存为 PNG。",
    "faq2Q": "我的图片会上传到服务器吗？",
    "faq2A": "不会。所有图片处理都在浏览器中使用 Canvas API 完成。您的图片不会离开您的设备。",
    "faq3Q": "如何缩放时不变形？",
    "faq3A": "使用自定义尺寸时启用\"保持宽高比\"选项。图片将在指定尺寸内缩放，同时保持原始比例。"
  }
}
```

- [ ] **Step 3: Create `public/locales/zh-CN/image-compress.json`**

```json
{
  "dropImage": "拖放图片到此处，或点击选择",
  "supportedFormats": "支持 PNG、JPG、WebP、GIF、BMP、SVG",
  "quality": "质量",
  "pngLosslessHint": "PNG 是无损格式 — 使用 [图片格式转换](/image-convert) 转换为 WebP 可减小文件大小。",
  "reselect": "重新选择",
  "copyToClipboard": "复制到剪贴板",
  "copiedToClipboard": "已复制到剪贴板（PNG 格式）",
  "original": "原始",
  "compressed": "压缩后",
  "dragToCompare": "拖拽对比",
  "processing": "处理中...",
  "encodingFailed": "此格式的编码失败",
  "firstFrameOnly": "动态图片 — 仅使用第一帧",
  "largeImage": "大图片（{w}×{h}）— 处理可能较慢",
  "formatNotSupported": "不支持此图片格式。请使用 PNG、JPG、WebP、GIF、BMP 或 SVG。",
  "descriptions": {
    "title": "关于图片压缩",
    "aeoDefinition": "图片压缩是一个免费的在线工具，可调节质量压缩图片，支持拖拽对比预览。支持 PNG、JPG、WebP。所有处理在浏览器本地完成。",
    "whatIsTitle": "什么是图片压缩？",
    "whatIs": "使用可调质量设置和拖拽对比预览压缩图片。支持 PNG、JPG、WebP 格式。所有数据不上传到任何服务器，全部使用 HTML5 Canvas API 处理。",
    "stepsTitle": "如何压缩图片",
    "step1Title": "拖放或选择图片",
    "step1Text": "将图片拖放到拖放区域，或点击浏览。支持 PNG、JPG、WebP、GIF、BMP、SVG 输入。",
    "step2Title": "调整质量",
    "step2Text": "使用质量滑块平衡文件大小和图片质量。质量越低文件越小。PNG 输入时隐藏质量滑块。",
    "step3Title": "对比并下载",
    "step3Text": "拖拽对比滑块查看原始与压缩后的对比效果。下载结果或复制到剪贴板。",
    "p1": "在浏览器中直接使用可调质量和拖拽对比预览压缩图片。使用 [图片缩放](/image-resize) 调整尺寸，或使用 [图片格式转换](/image-convert) 转换格式。",
    "p2": "支持 PNG、JPG、WebP 输出格式。WebP 为网页图片提供最佳压缩比。",
    "p3": "使用质量滑块平衡文件大小和图片质量。质量越低文件越小。",
    "faq1Q": "为什么 PNG 没有质量滑块？",
    "faq1A": "PNG 是无损格式，调整质量没有效果。要减小 PNG 文件大小，请使用 [图片格式转换](/image-convert) 转换为 WebP。",
    "faq2Q": "我的图片会上传到服务器吗？",
    "faq2A": "不会。所有图片处理都在浏览器中使用 Canvas API 完成。您的图片不会离开您的设备。",
    "faq3Q": "支持哪些图片格式？",
    "faq3A": "输入：PNG、JPG、WebP、GIF、BMP、SVG、AVIF。输出格式与输入格式相同。GIF、BMP、SVG、AVIF 输出为 PNG。"
  }
}
```

- [ ] **Step 4: Create `public/locales/zh-CN/image-convert.json`**

```json
{
  "dropImage": "拖放图片到此处，或点击选择",
  "supportedFormats": "支持 PNG、JPG、WebP、GIF、BMP、SVG",
  "outputFormat": "输出格式",
  "formatUnsupported": "此浏览器不支持",
  "reselect": "重新选择",
  "copyToClipboard": "复制到剪贴板",
  "copiedToClipboard": "已复制到剪贴板（PNG 格式）",
  "original": "原始",
  "result": "结果",
  "processing": "处理中...",
  "encodingFailed": "此格式的编码失败",
  "firstFrameOnly": "动态图片 — 仅使用第一帧",
  "largeImage": "大图片（{w}×{h}）— 处理可能较慢",
  "formatNotSupported": "不支持此图片格式。请使用 PNG、JPG、WebP、GIF、BMP 或 SVG。",
  "descriptions": {
    "title": "关于图片格式转换",
    "aeoDefinition": "图片格式转换是一个免费的在线工具，可在 PNG、JPG、WebP 格式之间转换图片。所有处理在浏览器本地完成。",
    "whatIsTitle": "什么是图片格式转换？",
    "whatIs": "在浏览器中直接在 PNG、JPG、WebP 格式之间转换图片。保持原始尺寸和质量。所有数据不上传到任何服务器，全部使用 HTML5 Canvas API 处理。",
    "stepsTitle": "如何转换图片格式",
    "step1Title": "拖放或选择图片",
    "step1Text": "将图片拖放到拖放区域，或点击浏览。支持 PNG、JPG、WebP、GIF、BMP、SVG 输入。",
    "step2Title": "选择输出格式",
    "step2Text": "选择 PNG、JPG 或 WebP 作为输出格式。浏览器不支持的格式会自动禁用。",
    "step3Title": "下载转换后的图片",
    "step3Text": "预览转换后的图片并下载。JPEG 和 WebP 输出默认使用 90% 质量。",
    "p1": "在浏览器中直接在 PNG、JPG、WebP 格式之间转换图片。使用 [图片缩放](/image-resize) 调整尺寸，或使用 [图片压缩](/image-compress) 压缩图片。",
    "p2": "PNG 无损且支持透明。JPG 照片文件更小。WebP 为网页图片提供最佳压缩比。",
    "faq1Q": "输出质量是多少？",
    "faq1A": "JPEG 和 WebP 输出使用 90% 质量，在文件大小和视觉保真度之间取得良好平衡。PNG 输出为无损。",
    "faq2Q": "我的图片会上传到服务器吗？",
    "faq2A": "不会。所有图片处理都在浏览器中使用 Canvas API 完成。您的图片不会离开您的设备。",
    "faq3Q": "为什么某个格式选项被禁用？",
    "faq3A": "您的浏览器不支持编码该格式。大多数现代浏览器支持 PNG、JPG 和 WebP。"
  }
}
```

- [ ] **Step 5: Create remaining CJK locale files**

Follow the same pattern for **zh-TW**, **ja**, **ko** — use the spec's provided `shortTitle` and `searchTerms` for `tools.json`, and translate all tool-specific JSON keys idiomatically.

**zh-TW**: Use Traditional Chinese characters, adjust regional phrasing (e.g. "壓縮" not "压缩").

**ja**: Use appropriate formality level for developer tools. Translate descriptions and FAQ idiomatically.

**ko**: Use natural Korean phrasing with proper honorifics for UI context.

For each locale:

1. Replace `"image"` in `tools.json` with 3 new entries (use spec-provided values)
2. Create `image-resize.json`, `image-compress.json`, `image-convert.json`

- [ ] **Step 6: Commit**

```bash
git add public/locales/zh-CN/ public/locales/zh-TW/ public/locales/ja/ public/locales/ko/
git commit -m "feat(i18n): add CJK translations for image-resize, image-compress, image-convert"
```

---

## Task 13: Latin-script i18n Translations

**Files:**

- Modify: `public/locales/es/tools.json`, `public/locales/pt-BR/tools.json`, `public/locales/fr/tools.json`, `public/locales/de/tools.json`, `public/locales/ru/tools.json`
- Create: 3 locale files × 5 locales = 15 files

For each Latin-script locale, replace `"image"` in `tools.json` with 3 new entries, and create 3 tool-specific JSON files following the English template with idiomatic translations.

- [ ] **Step 1: Update `tools.json` for each locale**

Remove the `"image"` entry. Add three entries with translated `title`, `shortTitle`, `description`. No `searchTerms` needed for Latin-script languages (shortTitle is already searchable).

**es (Spanish)**:

```json
"image-resize": {
  "title": "Redimensionador de Imágenes - Redimensionar Imágenes Online",
  "shortTitle": "Redimensionador de Imágenes",
  "description": "Redimensiona imágenes por porcentaje o dimensiones personalizadas. Soporta PNG, JPG, WebP. Todo el procesamiento se realiza en tu navegador."
},
"image-compress": {
  "title": "Compresor de Imágenes - Comprimir PNG, JPG, WebP",
  "shortTitle": "Compresor de Imágenes",
  "description": "Comprime imágenes con calidad ajustable. Vista previa de comparación arrastrando. Soporta PNG, JPG, WebP. Todo el procesamiento se realiza en tu navegador."
},
"image-convert": {
  "title": "Convertidor de Formato de Imagen - PNG, JPG, WebP",
  "shortTitle": "Convertidor de Imágenes",
  "description": "Convierte imágenes entre formatos PNG, JPG y WebP. Todo el procesamiento se realiza en tu navegador."
},
```

**pt-BR**, **fr**, **de**, **ru**: Follow the same pattern with idiomatic translations.

- [ ] **Step 2: Create tool-specific JSON files for each locale**

For each locale, create `image-resize.json`, `image-compress.json`, `image-convert.json` following the English template (Task 8) with translated values. Use standard technical terminology for each language's developer community.

- [ ] **Step 3: Commit**

```bash
git add public/locales/es/ public/locales/pt-BR/ public/locales/fr/ public/locales/de/ public/locales/ru/
git commit -m "feat(i18n): add Latin-script translations for image-resize, image-compress, image-convert"
```

---

## Task 14: Delete Old Tool + Update Docs

**Files:**

- Delete: `app/[locale]/image/` directory
- Delete: `public/locales/*/image.json` (10 files)
- Modify: `AGENTS.md`
- Modify: `README.md`

- [ ] **Step 1: Delete old image tool pages**

```bash
rm -rf app/\[locale\]/image/
```

- [ ] **Step 2: Delete old image locale files**

```bash
rm public/locales/*/image.json
```

- [ ] **Step 3: Update `AGENTS.md`**

**Available Tools table** — replace the `/image` row with 3 rows:

```markdown
| `/image-resize` | Image Resizer | Resize images by percentage or custom dimensions |
| `/image-compress` | Image Compressor | Compress images with adjustable quality, drag-to-compare preview |
| `/image-convert` | Image Converter | Convert images between PNG, JPG, and WebP formats |
```

**Tool Categories table** — update Visual & Media row:

```markdown
| Visual & Media | `visual-media` | `color`, `image-resize`, `image-compress`, `image-convert` |
```

**libs/ table** — update image entry:

```markdown
| `image/` | Image processing (compress, resize, format conversion, shared components) |
```

- [ ] **Step 4: Update `README.md`**

**Tools table** — replace the Image Compressor row with 3 rows:

```markdown
| Image Resizer | Resize images by percentage or custom dimensions |
| Image Compressor | Compress images with adjustable quality, drag-to-compare preview |
| Image Converter | Convert images between PNG, JPG, and WebP formats |
```

**Project Structure** — replace `image/            # Image compressor` with 3 entries:

```markdown
image-resize/ # Image resizer
image-compress/ # Image compressor
image-convert/ # Image converter
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove old /image tool, update AGENTS.md and README.md for tool split"
```

---

## Task 15: Final Verification

- [ ] **Step 1: Run type check**

```bash
npx tsc --noEmit --pretty
```

Expected: Exit code 0, no errors.

- [ ] **Step 2: Run ESLint**

```bash
npx eslint app/\[locale\]/image-resize/ app/\[locale\]/image-compress/ app/\[locale\]/image-convert/ components/image/ --ext .ts,.tsx
```

Expected: No errors (warnings are acceptable).

- [ ] **Step 3: Run existing tests**

```bash
npm run test
```

Expected: All existing tests pass. The `libs/image/__tests__/resize.test.ts` should still pass unchanged.

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Manual verification checklist**

- [ ] `/image-resize` loads with drop zone, no errors in console
- [ ] `/image-compress` loads with drop zone, compare slider works
- [ ] `/image-convert` loads with drop zone, format selector works
- [ ] All 3 tools appear in ToolsDrawer search
- [ ] `/image` route returns 404 (old tool removed)
- [ ] i18n switching works for all 3 tools
- [ ] Download and copy-to-clipboard work on all 3 tools
- [ ] Large image warning toast appears for >50MP images
- [ ] GIF/animated WebP shows "first frame only" toast

- [ ] **Step 6: Commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: address verification issues from image tool split"
```
