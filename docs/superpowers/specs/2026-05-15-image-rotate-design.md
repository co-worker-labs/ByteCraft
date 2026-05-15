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

Rotation logic lives entirely in the page component. Does not modify `libs/image/encode.ts` or any shared files. The transform is simple Canvas API (`translate` + `rotate` + `scale` + `drawImage`) — too trivial to warrant a shared module.

### Canvas transform logic

```
Canvas dimensions:
  0° or 180° → width × height (original orientation)
  90° or 270° → height × width (swapped)

Transform sequence:
  1. ctx.translate(canvasWidth / 2, canvasHeight / 2)
  2. ctx.rotate(rotation * Math.PI / 180)
  3. ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
  4. ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2)

JPEG: fill white background before drawing (no alpha support).
```

### State

```typescript
// Shared hooks (unchanged from other image tools)
useImageInput({ t })   → sourceFile, sourceBitmap, handleFileSelect, handleReselect, ...
useImageExport({ sourceFile, outputFormat, t, tc })  → handleDownload, handleCopy

// Tool-specific state
const [rotation, setRotation] = useState(0);       // 0 | 90 | 180 | 270
const [flipH, setFlipH] = useState(false);
const [flipV, setFlipV] = useState(false);
const [resultBlob, setResultBlob] = useState<Blob | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
const [processing, setProcessing] = useState(false);
```

Reactive encode pipeline with 300ms debounce + stalenessId guard (same pattern as image-resize).

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

| File                                                                     | Purpose                               |
| ------------------------------------------------------------------------ | ------------------------------------- |
| `app/[locale]/image-rotate/page.tsx`                                     | Route entry: metadata + JSON-LD       |
| `app/[locale]/image-rotate/image-rotate-page.tsx`                        | Client component: UI + rotation logic |
| `public/locales/en/image-rotate.json`                                    | English i18n strings                  |
| `public/locales/{zh-CN,zh-TW,ja,ko,es,pt-BR,fr,de,ru}/image-rotate.json` | Translated i18n strings               |

### Modified files

| File                                  | Change                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------- |
| `libs/tools.ts`                       | Add `image-rotate` entry to `TOOLS`, `TOOL_CATEGORIES.visual.tools`, `TOOL_RELATIONS` |
| `public/locales/en/tools.json`        | Add `image-rotate` block (title, shortTitle, description)                             |
| `public/locales/{9 langs}/tools.json` | Add `image-rotate` block + `searchTerms` for CJK locales                              |

### Unchanged files

All shared image infrastructure: `libs/image/encode.ts`, `libs/image/resize.ts`, `libs/image/types.ts`, `components/image/*`.

## Tool Registration

```typescript
// libs/tools.ts — TOOLS array
{
  key: "image-rotate",
  path: "/image-rotate",
  icon: RotateCcw,  // from lucide-react (RotateCw is used by image-convert)
  emoji: "🔄",
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
  "supportedFormats": "Supports PNG, JPG, WebP, GIF, BMP, SVG",
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
    "p1": "Rotate and flip images directly in your browser. Resize images with [Image Resizer](/image-resize), or convert formats with [Image Converter](/image-convert).",
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
| ko     | `imijesuhwheon ijsh 90do 180do sangbanyeohp` |

## Testing

- No unit tests required (pure Canvas API transform, no custom business logic module)
- Manual QA: verify rotation + flip combinations produce correct output
- Verify JPEG output has white background (no transparent corners)
