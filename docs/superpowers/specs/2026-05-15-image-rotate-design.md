# Image Rotate — Design Spec

## Overview

New tool for rotating and flipping images. Route: `/image-rotate`, category: Visual & Media.

## Features

- **Fixed-angle rotation**: 0°, 90°, 180°, 270° (mutually exclusive, default 0°)
- **Horizontal flip**: toggle, composable with rotation
- **Vertical flip**: toggle, composable with rotation
- **Transform order**: flip first, then rotate (standard image editor convention)
- **Input formats**: PNG, JPG, WebP, AVIF, GIF, BMP, SVG (via shared `useImageInput`)
- **Output format**: matches input format (unsupported output formats auto-convert to PNG)
- **Export**: download + copy to clipboard (via shared `useImageExport`)

## Architecture

### No shared library changes

Rotation logic lives entirely in the page component. **Does not use `libs/image/encode.ts`** — the shared `encode()` function only supports resize (scales and draws), not rotation transforms. Instead, the page component performs Canvas transforms directly (`translate` + `rotate` + `scale` + `drawImage`) and calls `canvas.toBlob()` itself. Does not modify any shared files.

### Canvas transform logic

```
Canvas dimensions:
  0° or 180° → width × height (original orientation)
  90° or 270° → height × width (swapped)

Transform sequence (Canvas transforms execute bottom-up: scale → rotate):
   1. ctx.translate(canvasWidth / 2, canvasHeight / 2)
   2. ctx.rotate(rotation * Math.PI / 180)   // applied second
   3. ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)  // applied FIRST → flip then rotate
   4. ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2)

JPEG: fill white background before drawing (no alpha support).

Result dimensions for ImageInfoBar and preview aspectRatio:
  rotatedW = (rotation === 90 || rotation === 270) ? sourceBitmap.height : sourceBitmap.width
  rotatedH = (rotation === 90 || rotation === 270) ? sourceBitmap.width : sourceBitmap.height
```

### State

```typescript
// Shared hooks (unchanged from other image tools)
const { sourceFile, sourceBitmap, handleFileSelect, handleReselect, dropZoneRef, fileInputRef } =
  useImageInput({ t });

// Output format derived from input MIME (GIF/BMP/SVG/AVIF → PNG)
const outputFormat: OutputFormat = sourceFile ? resolveOutputFormat(sourceFile.type) : "png";

const { handleDownload, handleCopy } = useImageExport({ sourceFile, outputFormat, t, tc });
// handleDownload(blob) — downloads blob with original filename + correct extension
// handleCopy(blob) — copies to clipboard (auto-converts to PNG if needed)

// Tool-specific state
const [rotation, setRotation] = useState(0); // 0 | 90 | 180 | 270
const [flipH, setFlipH] = useState(false);
const [flipV, setFlipV] = useState(false);
const [resultBlob, setResultBlob] = useState<Blob | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
const [processing, setProcessing] = useState(false);

// Encode pipeline refs (same pattern as image-resize)
const stalenessId = useRef(0); // guards against stale results
const prevBlobUrlRef = useRef<string | null>(null); // tracks preview URL for cleanup
const initialLoadRef = useRef(true); // skip debounce on first load
```

### Encode pipeline

Reactive encode pipeline with 300ms debounce + stalenessId guard (same pattern as image-resize). On first load (`initialLoadRef`), encode immediately without debounce.

```typescript
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
        // Canvas transform (see "Canvas transform logic" above)
        const bitmap = sourceBitmap;
        const swapped = rotation === 90 || rotation === 270;
        const canvasW = swapped ? bitmap.height : bitmap.width;
        const canvasH = swapped ? bitmap.width : bitmap.height;

        const canvas = document.createElement("canvas");
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext("2d")!;

        // JPEG: fill white background
        if (outputFormat === "jpeg") {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvasW, canvasH);
        }

        ctx.translate(canvasW / 2, canvasH / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("Encoding failed"))),
            `image/${outputFormat}`,
            outputFormat === "png" ? undefined : 1
          );
        });

        if (callId !== stalenessId.current) return;

        // Cleanup previous preview URL to prevent memory leak
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
}, [sourceBitmap, rotation, flipH, flipV, outputFormat]);

// Cleanup blob URL on unmount
useEffect(() => {
  return () => {
    if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
  };
}, []);
```

### Reselect handler

```typescript
function onReselect() {
  handleReselect(); // clears sourceFile + sourceBitmap
  setResultBlob(null);
  setPreviewUrl(null);
  setProcessing(false);
  setRotation(0); // reset tool-specific state
  setFlipH(false);
  setFlipV(false);
  initialLoadRef.current = true;
}
```

### Preview aspectRatio

Use **transformed** dimensions for the preview container (not original bitmap dimensions):

```typescript
const swapped = rotation === 90 || rotation === 270;
const previewW = swapped ? sourceBitmap.height : sourceBitmap.width;
const previewH = swapped ? sourceBitmap.width : sourceBitmap.height;

// Preview container
<div style={{ aspectRatio: `${previewW} / ${previewH}`, maxHeight: "500px" }}>
```

### ImageInfoBar

```typescript
// Pass savedPercent to show file size change (may be negative for JPEG with different dimensions)
const savedPercent = sourceFile && resultBlob && sourceFile.size > 0
  ? Math.round((1 - resultBlob.size / sourceFile.size) * 100)
  : 0;

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
    dimensions: { width: previewW, height: previewH },
  }}
  savedPercent={savedPercent}
/>
```

## UI Layout

`grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6` — identical to image-resize.

### Left panel (280px)

1. **Rotation angle** — 4-button grid: 0°, 90°, 180°, 270°. Active state: `bg-accent-cyan text-bg-base`.
2. **Flip** — 2-button grid: horizontal ↔, vertical ↕. Toggle buttons (active = `bg-accent-cyan text-bg-base`, inactive = bordered).
3. **Actions** — Reselect / Download / Copy to Clipboard (same button pattern as image-resize).

### Right panel

1. **Preview** — `<img>` in aspect-ratio container, max-height 500px. Loading spinner overlay while processing.
2. **ImageInfoBar** — original vs result (file size, format, dimensions).

## Files

### New files

| File                                                                     | Purpose                                                                                                                                            |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/[locale]/image-rotate/page.tsx`                                     | Route entry: metadata + JSON-LD (follow `image-resize/page.tsx` pattern: `generatePageMeta` + `buildToolSchemas` with `howToSteps` and `faqItems`) |
| `app/[locale]/image-rotate/image-rotate-page.tsx`                        | Client component: UI + rotation logic                                                                                                              |
| `public/locales/en/image-rotate.json`                                    | English i18n strings                                                                                                                               |
| `public/locales/{zh-CN,zh-TW,ja,ko,es,pt-BR,fr,de,ru}/image-rotate.json` | Translated i18n strings                                                                                                                            |

### Modified files

| File                                  | Change                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------- |
| `libs/tools.ts`                       | Add `image-rotate` entry to `TOOLS`, `TOOL_CATEGORIES.visual.tools`, `TOOL_RELATIONS` |
| `public/locales/en/tools.json`        | Add `image-rotate` block (title, shortTitle, description)                             |
| `public/locales/{9 langs}/tools.json` | Add `image-rotate` block + `searchTerms` for CJK locales                              |

### Unchanged files

All shared image infrastructure: `libs/image/encode.ts`, `libs/image/resize.ts`, `libs/image/types.ts`, `libs/image/format-support.ts`, `components/image/*`.

## Tool Registration

```typescript
// libs/tools.ts — TOOLS array
{
  key: "image-rotate",
  path: "/image-rotate",
  icon: RotateCw,  // from lucide-react (RotateCcw is counterclockwise; RotateCw matches the 90° clockwise default)
  emoji: "🔃",     // "🔄" is already used by image-convert
  sameAs: [],
}

// TOOL_CATEGORIES — visual.tools
["color", "image-resize", "image-compress", "image-convert", "image-rotate"]

// TOOL_RELATIONS
"image-rotate": ["image-resize", "image-compress", "image-convert"],
// Also add "image-rotate" to existing image tools' relation arrays:
"image-resize": [...existing, "image-rotate"],
"image-compress": [...existing, "image-rotate"],
"image-convert": [...existing, "image-rotate"],
```

## i18n Keys (en/image-rotate.json)

```json
{
  "dropImage": "Drop an image here or click to select",
  "supportedFormats": "Supports PNG, JPG, WebP, AVIF, GIF, BMP, SVG",
  "rotate": "Rotate",
  "flipHorizontal": "Flip horizontal",
  "flipVertical": "Flip vertical",
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
    "title": "About Image Rotate",
    "aeoDefinition": "Image Rotate is a free online tool for rotating and flipping images. Supports 90°, 180°, 270° rotation and horizontal/vertical flip. All processing runs locally in your browser.",
    "whatIsTitle": "What is Image Rotate?",
    "whatIs": "Rotate images by 90°, 180°, or 270° and flip them horizontally or vertically. Combine rotation and flip for precise image orientation. No data is uploaded — all processing uses the HTML5 Canvas API.",
    "stepsTitle": "How to Rotate an Image",
    "step1Title": "Drop or select an image",
    "step1Text": "Drag and drop an image onto the drop zone, or click to browse. Supports PNG, JPG, WebP, GIF, BMP, and SVG input.",
    "step2Title": "Choose rotation and flip",
    "step2Text": "Select a rotation angle (0°, 90°, 180°, 270°) and optionally toggle horizontal or vertical flip.",
    "step3Title": "Download rotated image",
    "step3Text": "Preview the rotated image and download it. The output format matches the input format.",
    "p1": "Rotate and flip images by 90°, 180°, or 270° directly in your browser. Compress rotated images with [Image Compressor](/image-compress), or convert formats with [Image Converter](/image-convert).",
    "p2": "Supports PNG, JPG, and WebP output. Images in GIF, BMP, SVG, or AVIF format are automatically converted to PNG.",
    "faq1Q": "What image formats can I rotate?",
    "faq1A": "You can rotate PNG, JPG, WebP, GIF, BMP, SVG, and AVIF images. The output format matches the input format. Unsupported output formats (GIF, BMP, SVG, AVIF) are saved as PNG.",
    "faq2Q": "Are my images uploaded to a server?",
    "faq2A": "No. All image processing happens in your browser using the Canvas API. Your images never leave your device.",
    "faq3Q": "Can I combine rotation and flip?",
    "faq3A": "Yes. You can apply both rotation (0°, 90°, 180°, 270°) and flip (horizontal, vertical) at the same time. The flip is applied first, then the rotation."
  }
}
```

## CJK searchTerms

| Locale | searchTerms                                  |
| ------ | -------------------------------------------- |
| zh-CN  | `tupianxuanzhuan tpxz 90du 180du fanzhuan`   |
| zh-TW  | `tupianxuanzhuan tpxz 90du 180du fanzhuan`   |
| ja     | `gazoukaiten gzk 90do 180do tentou`          |
| ko     | `imijehoejeon ijhj 90do 180do sangjohoejeon` |

## Testing

- No unit tests required (pure Canvas API transform, no custom business logic module)
- No `vitest.config.ts` changes needed (no new `libs/image/*.ts` module to register)
- Manual QA: verify rotation + flip combinations produce correct output
- Verify JPEG output has white background (no transparent corners)
- Verify 90°/270° rotation produces correctly swapped dimensions in preview and ImageInfoBar
