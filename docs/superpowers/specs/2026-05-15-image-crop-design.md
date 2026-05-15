# Image Crop Tool — Design Spec

**Date**: 2026-05-15
**Route**: `/image-crop`
**Category**: Visual & Media

## Summary

Add an image cropping tool to OmniKit. Users upload an image, select a crop region via an interactive selection box, and download the cropped result. Supports free crop, preset aspect ratios, and exact pixel dimensions. All processing runs client-side via Canvas API.

## Requirements

| Dimension          | Decision                                                                            |
| ------------------ | ----------------------------------------------------------------------------------- |
| Crop modes         | Free crop + preset aspect ratios + exact pixel dimensions                           |
| Interaction        | Selection box (react-image-crop). Drag/resize corners and edges to define crop area |
| Output format      | Keep input format (PNG→PNG, JPG→JPG, WebP→WebP)                                     |
| Output quality     | 100% (lossless crop)                                                                |
| Library            | react-image-crop ^11.x (~5KB gzip, 0 dependencies)                                  |
| Min selection size | 10×10 px (enforced via react-image-crop `minWidth`/`minHeight` in pixel crop)       |

## File Structure

### New files

| File                                          | Purpose                                                   |
| --------------------------------------------- | --------------------------------------------------------- |
| `app/[locale]/image-crop/page.tsx`            | Route entry — SEO metadata, JSON-LD schemas               |
| `app/[locale]/image-crop/image-crop-page.tsx` | Client page component (`"use client"`) — all UI and logic |
| `libs/image/crop.ts`                          | Crop business logic — `cropBitmap()` function             |
| `public/locales/*/image-crop.json`            | i18n strings for 10 locales                               |

### Modified files

| File                          | Change                                                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `libs/tools.ts`               | Add `Crop` to lucide-react imports; add `image-crop` entry to `TOOLS`, `TOOL_CATEGORIES.visual`, `TOOL_RELATIONS` |
| `public/locales/*/tools.json` | Add `image-crop` title, shortTitle, description per locale                                                        |
| `package.json`                | Add `react-image-crop` dependency                                                                                 |
| `app/globals.css`             | Add `@import "react-image-crop/dist/index.css"` plus theme overrides                                              |

### Reused modules (no changes)

| Module                               | Usage                                                      |
| ------------------------------------ | ---------------------------------------------------------- |
| `components/image/useImageInput.ts`  | File upload, ImageBitmap conversion, drag-drop             |
| `components/image/useImageExport.ts` | Download + clipboard copy                                  |
| `components/image/ImageDropZone.tsx` | Drag-and-drop upload zone                                  |
| `components/image/ImageInfoBar.tsx`  | Original vs result metadata comparison                     |
| `libs/image/types.ts`                | `OutputFormat`, `resolveOutputFormat`, `formatKeyFromMime` |

Note: `libs/image/encode.ts` is NOT reused directly — it draws the full bitmap into a resized canvas. Crop needs a source-region `drawImage` overload. Instead, `libs/image/crop.ts` encapsulates the crop-specific Canvas logic (see below).

## UI Layout

Follows existing image tool pattern: `grid-cols-1 md:grid-cols-[280px_1fr] gap-6`.

### Full page structure

```
<Layout title={t("image-crop.shortTitle")} categoryLabel={...} categorySlug="visual-media">
  <div className="container mx-auto px-4 pt-3 pb-6">
    <PrivacyBanner variant="files" />
    <Conversion />
    <DescriptionSection namespace="image-crop" />
    <RelatedTools currentTool="image-crop" />
  </div>
</Layout>
```

### Left panel (280px controls)

```
┌─────────────────────────┐
│ Crop Mode               │
│ [Free] [Preset] [Exact] │
├─────────────────────────┤
│ (mode-specific controls)│
├─────────────────────────┤
│ Reselect                │
│ Download                │
│ Copy to Clipboard       │
└─────────────────────────┘
```

### Right panel (preview)

- `react-image-crop` `ReactCrop` component renders image with selection overlay
- Semi-transparent mask outside selection
- 8 drag handles (4 corners + 4 edge midpoints)
- Rule-of-thirds grid lines via `ruleOfThirds` prop (built into react-image-crop)
- `locked` prop disabled — user can always drag/resize the selection
- Selection constrained to image boundaries (default react-image-crop behavior)

### Below preview

- `ImageInfoBar` showing original vs cropped dimensions, file size, format
- `savedPercent` passed as `undefined` — crop is not a size-optimization operation so file size delta is not meaningful to display

## Crop Modes

### Free Crop

- No initial selection — user draws rectangle on image
- No aspect ratio constraint
- `react-image-crop` crop state in percentage units (`unit: '%'`)
- `minWidth` / `minHeight` set to enforce minimum 10px selection

### Preset Ratios

Available presets: `Original`, `1:1`, `16:9`, `4:3`, `3:2`, `2:3`, `9:16`, `21:9`

- Displayed as a button grid in the controls panel
- **Original**: calculates the source image's own aspect ratio and locks to it — useful for cropping without distortion
- On selection: auto-generate a centered crop area covering the maximum possible area at the chosen ratio
- `react-image-crop` `aspect` prop locks the ratio
- User drags to reposition, drags corners to resize (ratio preserved)

### Exact Dimensions

- Two `StyledInput` fields: width and height (pixels)
- Optional "Keep aspect ratio" checkbox
- **Clamping**: if entered dimensions exceed source bitmap dimensions, clamp to bitmap size
- **Keep aspect ratio behavior**: when checked, entering width auto-calculates height (and vice versa) based on the proportional relationship, then clamps to bitmap boundaries
- **Update timing**: crop area updates on input `onChange` (real-time), debounced at 300ms for encode pipeline
- On input: auto-center a crop area matching the entered dimensions
- If either field is 0 or empty, skip encode (no output)

## Data Flow

```
User uploads image
    → useImageInput: sourceFile + sourceBitmap
    → react-image-crop renders image + selection overlay
    → onChange: crop state updates (percentage coords)
    → skip if crop is null or crop area < 10×10 px
    → debounce 300ms (always — no initial 0ms skip, since crop has no "default" output)
    → calculate pixel crop region from percentage + bitmap dimensions
    → cropBitmap() from libs/image/crop.ts
    → resultBlob
    → preview URL + download/copy via useImageExport
```

### Crop logic (libs/image/crop.ts)

Extracted to `libs/image/crop.ts` to match existing pattern (`encode.ts`, `resize.ts`) and enable unit testing.

```typescript
import type { OutputFormat } from "./types";

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
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
  const { x, y, width, height } = crop;

  // Clamp to bitmap boundaries (defensive)
  const clampedX = Math.max(0, Math.min(x, bitmap.width));
  const clampedY = Math.max(0, Math.min(y, bitmap.height));
  const clampedW = Math.max(1, Math.min(width, bitmap.width - clampedX));
  const clampedH = Math.max(1, Math.min(height, bitmap.height - clampedY));

  const canvas = document.createElement("canvas");
  canvas.width = clampedW;
  canvas.height = clampedH;
  const ctx = canvas.getContext("2d")!;

  // Fill white background for JPEG (no alpha channel support)
  if (format === "jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, clampedW, clampedH);
  }

  ctx.drawImage(bitmap, clampedX, clampedY, clampedW, clampedH, 0, 0, clampedW, clampedH);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Crop encoding failed"))),
      `image/${format}`,
      format === "png" ? undefined : 1
    );
  });
}
```

### Staleness handling

Uses the same `stalenessId` ref pattern as image-resize to cancel stale encode operations.

**Key difference from image-resize**: image-resize has a default "100%" resize on initial load (0ms debounce). Crop has no default selection — the encode pipeline only fires when the user has drawn a selection (crop state is non-null). Therefore:

- **No `initialLoadRef`** — always debounce at 300ms
- Encode effect guard: `if (!sourceBitmap || !crop) return;`
- Additional guard: `if (pixelCrop.width < 10 || pixelCrop.height < 10) return;`

## Route Entry (app/[locale]/image-crop/page.tsx)

Follows the exact pattern from `image-resize/page.tsx`:

```typescript
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import ImageCropPage from "./image-crop-page";

const PATH = "/image-crop";
const TOOL_KEY = "image-crop";
const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
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

## CSS & Theme Integration

### globals.css

```css
@import "react-image-crop/dist/index.css";
```

### Theme overrides

react-image-crop uses CSS classes for the selection overlay, handles, and mask. Override these to match OmniKit's accent-cyan theme. Add overrides after the import:

```css
/* Override react-image-crop styles to match OmniKit theme */
.ReactCrop {
  /* Selection border — accent cyan */
  --rc-border-color: var(--accent-cyan);
}

.ReactCrop__drag-handle::after {
  /* Handle dots — accent cyan */
  background-color: var(--accent-cyan);
}

.ReactCrop__crop-selection {
  border-color: var(--accent-cyan);
  /* Semi-transparent dark mask outside selection */
}

.ReactCrop__rule-of-thirds-hz::before,
.ReactCrop__rule-of-thirds-vt::before {
  background-color: rgba(6, 214, 160, 0.3); /* accent-cyan at 30% opacity */
}
```

Note: exact class names depend on the react-image-crop version — verify against the installed version's actual CSS classes. The above are based on v11.x conventions. If class names differ, adjust selectors accordingly during implementation.

### SSR note

`ReactCrop` from react-image-crop uses DOM APIs. The page component (`image-crop-page.tsx`) is already `"use client"`, and `ReactCrop` only renders when `sourceBitmap` is non-null (after user upload), so no dynamic import is needed — it never renders on the server.

## Error Handling & Edge Cases

| Scenario                                  | Handling                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------ | --- | ------------------------------- |
| No selection yet (initial state)          | No encode, no preview — show source image in crop component, action buttons disabled |
| Selection too small (<10×10 px)           | Skip encode, keep previous result or show nothing                                    |
| Exact dimensions exceed bitmap            | Clamp width/height to bitmap dimensions                                              |
| Exact dimensions input is 0 or empty      | Skip encode, clear preview                                                           |
| Reselect (new image)                      | Reset all state: crop, cropMode, resultBlob, previewUrl, exact width/height          |
| Animated input (GIF, animated WebP)       | `useImageInput` already handles toast ("first frame only")                           |
| Unsupported input format (AVIF, BMP, SVG) | `useImageInput` already rejects; `resolveOutputFormat` falls back to PNG             |
| Crop encoding failure                     | Toast "encodingFailed", clear resultBlob                                             |
| Zero-area crop (dragged to edge)          | Guard in encode effect: `if (pixelCrop.width <= 0                                    |     | pixelCrop.height <= 0) return;` |

## Tool Registration

### libs/tools.ts

```typescript
// Add to lucide-react imports at top:
import { ..., Crop } from "lucide-react";

// TOOLS array entry (add after image-convert)
{
  key: "image-crop",
  path: "/image-crop",
  icon: Crop,
  emoji: "✂️",
  sameAs: []
}

// TOOL_CATEGORIES.visual.tools — append
{ key: "visual", tools: ["color", "image-resize", "image-compress", "image-convert", "image-crop"] }

// TOOL_RELATIONS — add new entry + update existing image tool entries
"image-crop": ["image-resize", "image-compress", "image-convert"]
"image-resize": [...existing, "image-crop"]      // was: ["image-compress", "image-convert", "color"]
"image-compress": [...existing, "image-crop"]     // was: ["image-resize", "image-convert", "checksum"]
"image-convert": [...existing, "image-crop"]      // was: ["image-resize", "image-compress", "qrcode"]
```

### i18n (public/locales/en/tools.json)

```json
{
  "image-crop": {
    "title": "Image Cropper - Crop Images Online",
    "shortTitle": "Image Cropper",
    "description": "Crop images with free selection, preset aspect ratios, or exact pixel dimensions. Supports PNG, JPG, WebP. All processing runs in your browser."
  }
}
```

### i18n (public/locales/en/image-crop.json)

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

### CJK searchTerms

Follow project convention: romanized full + initials + tool-specific keywords (max 5 tokens).

- **zh-CN**: `tupiancaijian tpccj caijian xuanqu qiege`
  - tupiancaijian = 图片裁剪 (full), tpccj = initials, caijian = 裁剪 (crop-specific), xuanqu = 选取 (select region, crop-specific), qiege = 切割
- **zh-TW**: `tupiancaijian tpccj caijian xuanqu qiege`
  - Same romanization (traditional characters share same pinyin)
- **ja**: `gazoutorimingu gotrg torimingu gazou kado`
  - gazoutorimingu = 画像トリミング (full), gotrg = initials, torimingu = トリミング (trimming, crop-specific), gazou = 画像 (image), kado = 角度
- **ko**: `imijajareugi ijjrg jareugi sayjeom sonsaeg`
  - imijajareugi = 이미지 자르기 (full), ijjrg = initials, jareugi = 자르기 (cut/crop), sayjeon = 사진 (photo), sonsaeg = 선택 (selection)

## Dependencies

| Package          | Version | Size (gzip) | License |
| ---------------- | ------- | ----------- | ------- |
| react-image-crop | ^11.x   | ~5KB        | ISC     |

No other new dependencies. The library is zero-dependency.

**Version note**: Verify the latest stable version on npm before installation. The API (`PixelCrop` type, `ruleOfThirds` prop, CSS class names) is based on v11.x conventions.

## Testing

- Add `image-crop` scope to `vitest.config.ts` test scopes
- Unit tests for `libs/image/crop.ts`:
  - Crop region within bounds → correct output dimensions
  - Crop region exceeding bitmap → clamped to bitmap boundaries
  - JPEG format → white background fill for transparent areas
  - PNG format → no background fill
  - Crop region at edge (0,0) and (maxX, maxY)
- Existing `libs/image/__tests__/` tests continue to pass unchanged

## Out of Scope

- Zoom / rotate controls (not needed for a crop tool; users can use image-resize or image-convert for other adjustments)
- Round/circular crop (not in requirements; can be added later)
- Batch crop (out of scope for single-tool design)
- Crop history / undo
