# Image Tool Split Design

Split the monolithic Image Compressor (`/image`) into three focused, independent tools: Image Resizer, Image Compressor, and Image Converter.

## Decisions

| Decision            | Choice                                                                        |
| ------------------- | ----------------------------------------------------------------------------- |
| Routes              | `/image-resize`, `/image-compress`, `/image-convert`                          |
| Function boundaries | Strict — each tool does one thing only                                        |
| Old `/image` tool   | Completely removed                                                            |
| Compare slider      | Only on Compress tool                                                         |
| Approach            | Shared components + independent pages                                         |
| HowTo steps         | 3 independent steps per tool                                                  |
| ImageInfoBar        | Universal — all 3 tools show original + result: file size, format, dimensions |
| Animated images     | GIF + animated WebP: toast "first frame only"                                 |
| Debounce            | 300ms delay + stalenessId cancellation (preserve existing behavior)           |
| Large image warning | >50 megapixels threshold (preserve existing behavior)                         |
| AVIF handling       | Input only — not in OutputFormat, falls back to PNG                           |
| Description content | Each tool gets its own DescriptionSection with tool-specific FAQ              |

## Tool Definitions

### Image Resizer (`/image-resize`)

**Route**: `/image-resize`
**Icon**: `Scaling` (lucide-react)
**Emoji**: 📐
**Category**: `visual` (visual-media)

**Function**: Resize images by percentage or custom dimensions. Output format matches input.

**Controls (left panel)**:

- Resize mode toggle: percentage / custom size
- Percentage mode: 1-400% slider
- Custom mode: width + height inputs + keep aspect ratio checkbox
- Reselect button
- Download button
- Copy to clipboard button

**Preview (right panel)**:

- Single image preview (no compare slider)
- `ImageInfoBar`: original (size · format · dimensions) → result (size · format · dimensions) + size change %

**State**: `resizeMode`, `resizePercent`, `targetWidth`, `targetHeight`, `keepAspectRatio`

**Output logic**: Keep original format at quality 100%. If input format is not in output range (GIF/BMP/SVG/AVIF), default to PNG.

**HowTo Steps**:

1. Drop or select an image
2. Set target dimensions
3. Download resized image

### Image Compressor (`/image-compress`)

**Route**: `/image-compress`
**Icon**: `FileDown` (lucide-react)
**Emoji**: 🗜️
**Category**: `visual` (visual-media)

**Function**: Compress images with adjustable quality. Keep original dimensions and format.

**Controls (left panel)**:

- Quality slider: 1-100%
- Hidden when input is PNG (PNG is lossless). Show i18n hint with link to Image Converter: "PNG is lossless — switch to Image Converter to convert to WebP for smaller file size."
- Reselect button
- Download button
- Copy to clipboard button

**Preview (right panel)**:

- `CompareSlider`: original vs compressed drag-to-compare
- `ImageInfoBar`: original (size · format · dimensions) → result (size · format · dimensions) + size change %

**State**: `quality`, `sliderPos`, `draggingRef`

**Output logic**: Same format, same dimensions, adjusted quality.

**HowTo Steps**:

1. Drop or select an image
2. Adjust quality
3. Compare and download

### Image Converter (`/image-convert`)

**Route**: `/image-convert`
**Icon**: `RefreshCw` (lucide-react)
**Emoji**: 🔄
**Category**: `visual` (visual-media)

**Function**: Convert images between PNG, JPG, and WebP formats. Keep original dimensions and quality.

**Controls (left panel)**:

- Output format selector: PNG / JPG / WebP (unsupported formats auto-disabled with tooltip)
- Reselect button
- Download button
- Copy to clipboard button

**Preview (right panel)**:

- Single image preview (no compare slider)
- `ImageInfoBar`: original (size · format · dimensions) → result (size · format · dimensions) + size change %

**State**: `outputFormat`, `supportedFormats`

**Output logic**: Format conversion at quality 90% (JPEG/WebP). PNG uses lossless encoding.

**HowTo Steps**:

1. Drop or select an image
2. Choose output format
3. Download converted image

## File Structure

### New files

```
app/[locale]/image-resize/
  page.tsx                    # Route entry + SEO metadata + HowTo steps
  image-resize-page.tsx       # Page component
app/[locale]/image-compress/
  page.tsx
  image-compress-page.tsx
app/[locale]/image-convert/
  page.tsx
  image-convert-page.tsx

components/image/
  ImageDropZone.tsx           # Shared: drag-and-drop / click-to-select
  ImageInfoBar.tsx            # Shared: original vs result metadata display
  CompareSlider.tsx           # Compress-only: drag-to-compare preview
  useImageInput.ts            # Shared hook: file selection + bitmap lifecycle
  useImageExport.ts           # Shared hook: download + clipboard copy

utils/
  format-size.ts              # Shared: file size formatting (B/KB/MB)

public/locales/{locale}/
  image-resize.json           # × 10 languages
  image-compress.json         # × 10 languages
  image-convert.json          # × 10 languages
```

### Modified files

```
libs/image/types.ts           # Add InputFormat, INPUT_MIME_TYPES, FORMAT_EXTENSIONS, FORMAT_DISPLAY_NAMES
libs/tools.ts                 # Replace "image" with 3 new tools in TOOLS, CATEGORIES, RELATIONS
public/locales/{locale}/tools.json  # Replace "image" entry with 3 new entries (× 10)
AGENTS.md                     # Update Available Tools table, Tool Categories, libs/ table
README.md                     # Update Tools table (3 entries replace 1)
```

### Deleted files

```
app/[locale]/image/           # Entire directory
public/locales/{locale}/image.json  # × 10 languages
```

### Unchanged files

```
libs/image/encode.ts          # Pure function, already generic
libs/image/resize.ts          # Pure function, already generic
libs/image/format-support.ts  # Pure function, already generic
libs/image/__tests__/resize.test.ts
```

## Standard Page Structure

Every tool page follows the same structure (matching existing OmniKit patterns):

```tsx
"use client";

import Layout from "../../../components/layout";
import DescriptionSection from "../../../components/description-section";
import RelatedTools from "../../../components/related-tools";
import PrivacyBanner from "../../../components/privacy-banner";

function Conversion() {
  // Main UI + business logic
}

function Description() {
  return <DescriptionSection namespace="tool-name" />;
}

export default function ToolPage() {
  const t = useTranslations("tools");
  return (
    <Layout
      title={t("tool-name.shortTitle")}
      categoryLabel={t("categories.visualMedia")}
      categorySlug="visual-media"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner variant="files" />
        <Conversion />
        <Description />
        <RelatedTools currentTool="tool-name" />
      </div>
    </Layout>
  );
}
```

**Standard elements included in every tool page**:

- `Layout` — full-screen support built-in, breadcrumb with category
- `PrivacyBanner variant="files"` — "All data stays in your browser" with file variant
- `DescriptionSection` — tool-specific description + FAQ accordion
- `RelatedTools` — links based on `TOOL_RELATIONS`

## Shared Components

### `useImageInput()` hook

```typescript
interface UseImageInputReturn {
  sourceFile: File | null;
  sourceBitmap: ImageBitmap | null;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleReselect: () => void;
  dropZoneRef: React.RefObject<HTMLDivElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
}
```

**Responsibilities**:

- File drag-and-drop handling (using `file-selector` library)
- File type validation (`INPUT_MIME_TYPES`)
- `ImageBitmap` creation and lifecycle — **must close on unmount** (fixes existing bug)
- Large image warning (>50 megapixels) — info toast, 4s duration
- Animated image toast (GIF + animated WebP) — info toast, 3s duration
- Empty file input reset before click (allows re-selecting same file)

### `useImageExport()` hook

```typescript
interface UseImageExportOptions {
  sourceFile: File | null;
  outputFormat: OutputFormat;
}

interface UseImageExportReturn {
  handleDownload: (blob: Blob) => void;
  handleCopy: (blob: Blob) => Promise<void>;
}
```

**Responsibilities**:

- Download with correct filename extension (`FORMAT_EXTENSIONS`)
- Copy to clipboard (auto-convert to PNG for Clipboard API limitation)
- Success/error toasts
- JPEG: force PNG copy with toast message "Copied to clipboard as PNG"

### `ImageDropZone` component

```typescript
interface ImageDropZoneProps {
  onFileSelect: (file: File) => void;
  dropZoneRef: React.RefObject<HTMLDivElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  t: (key: string) => string; // i18n translations
}
```

Drag-and-drop zone with click-to-browse fallback. Shows supported formats text. Dashed border container with ImagePlus icon + "Drop an image here or click to select" text + supported formats subtitle.

### `ImageInfoBar` component

```typescript
interface ImageInfoProps {
  label: string; // "Original" or "Compressed" / "Result"
  fileSize: number; // bytes
  format: string; // "PNG" | "JPG" | "WebP" | "GIF" etc.
  dimensions: { width: number; height: number };
  highlight?: boolean; // highlight changed values
}

interface ImageInfoBarProps {
  original: ImageInfoProps;
  result: ImageInfoProps;
  savedPercent?: number; // positive = smaller, negative = larger
}
```

**Layout** (below preview area):

```
┌──────────────────────────────────────────────────┐
│  Original: 2.4 MB · PNG · 1920×1080              │
│  Result:   890 KB · WebP · 1920×1080     ↓ 63%   │
└──────────────────────────────────────────────────┘
```

**Rules**:

- File size formatted via `formatFileSize()` (shared utility)
- Format uses display names: `PNG`, `JPG`, `WebP`, `GIF`, `BMP`, `SVG`, `AVIF`
- Dimensions: `{width}×{height}` format
- Saved percentage: green if positive (smaller), red if negative (larger), hidden if 0%
- Only shown when `result` data is available (after first processing)

### `CompareSlider` component

```typescript
interface CompareSliderProps {
  originalUrl: string;
  resultUrl: string;
  sliderPos: number; // 0-100
  onSliderChange: (pos: number) => void;
  draggingRef: React.MutableRefObject<boolean>;
  containerRef: React.RefObject<HTMLDivElement>;
  aspectRatio: number; // width / height
  t: (key: string) => string;
}
```

Drag-to-compare slider showing original (left) vs result (right). Only used by Image Compressor. Labels: "Original" / "Compressed" / "Drag to compare". Uses `clipPath` for split view. Supports mouse + touch drag.

### `formatFileSize()` utility

```typescript
// utils/format-size.ts
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
```

Extracted from current inline implementation. Shared across all 3 tools + potential future use.

## libs/image/types.ts Changes

```typescript
// Existing (unchanged)
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

// New
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

// Display names for ImageInfoBar
export const FORMAT_DISPLAY_NAMES: Record<string, string> = {
  png: "PNG",
  jpeg: "JPG",
  webp: "WebP",
  avif: "AVIF",
  gif: "GIF",
  bmp: "BMP",
  "svg+xml": "SVG",
};
```

## Edge Cases

| Case                                  | Behavior                                                       |
| ------------------------------------- | -------------------------------------------------------------- |
| Animated GIF                          | Toast: "Animated image — only the first frame is used"         |
| Animated WebP                         | Toast: "Animated image — only the first frame is used"         |
| Large image (>50MP)                   | Toast: "Large image ({w}×{h}) — processing may be slow"        |
| PNG input in Compressor               | Hide quality slider. Show hint linking to Converter            |
| AVIF input                            | Output falls back to PNG (not in OutputFormat)                 |
| SVG input                             | Rasterized via ImageBitmap, output as PNG                      |
| JPEG output                           | Auto-fill white background (no transparency)                   |
| Clipboard copy                        | Force PNG conversion (Clipboard API limitation)                |
| Same input/output format in Converter | Still encode (may change size due to quality re-encode)        |
| Browser doesn't support WebP/AVIF     | Disable format option with tooltip                             |
| Unchanged dimensions/quality          | Still produce output blob (consistent behavior)                |
| Re-select same file                   | Clear input value before click to allow re-triggering onChange |

## Processing Pipeline

Each tool follows: `file → ImageBitmap → calculate → encode → Blob`

**Debounce**: 300ms delay before encoding (skip on initial load). Cancelled via `stalenessId` — each parameter change increments the ID; if stale, the result is discarded.

**Lifecycle**:

1. User selects file → `useImageInput` creates `ImageBitmap`
2. Parameter changes → debounced encode pipeline
3. `resultBlob` produced → displayed in preview + info bar
4. User clicks download/copy → `useImageExport` handles output
5. User reselects → old bitmap closed, new one created
6. Component unmounts → bitmap closed, blob URLs revoked

## Tool Registration

### libs/tools.ts

**TOOL_CATEGORIES**:

```typescript
{ key: "visual", tools: ["color", "image-resize", "image-compress", "image-convert"] }
```

**TOOL_RELATIONS**:

```typescript
"image-resize": ["image-compress", "image-convert", "color"],
"image-compress": ["image-resize", "image-convert", "checksum"],
"image-convert": ["image-resize", "image-compress", "qrcode"],
// Also update batch:
batch: ["recipe", "hashing", "base64", "image-resize", "image-compress"],
```

**TOOLS array** (replace `image` entry):

```typescript
{ key: "image-resize",   path: "/image-resize",   icon: Scaling,   emoji: "📐", sameAs: [] },
{ key: "image-compress", path: "/image-compress", icon: FileDown,  emoji: "🗜️", sameAs: [] },
{ key: "image-convert",  path: "/image-convert",  icon: RefreshCw, emoji: "🔄", sameAs: [] },
```

## i18n

### tools.json entries

**English**:

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
}
```

**Chinese (zh-CN)**:

```json
"image-resize": {
  "shortTitle": "图片缩放",
  "searchTerms": "tupiansuofang tpsf suofang chicun daxiao"
},
"image-compress": {
  "shortTitle": "图片压缩",
  "searchTerms": "tupianyasuo tpyz yasuo webp zhiliang"
},
"image-convert": {
  "shortTitle": "图片格式转换",
  "searchTerms": "tupiangeshi tpgs geshi webp png jpg"
}
```

**Traditional Chinese (zh-TW)**:

```json
"image-resize": {
  "shortTitle": "圖片縮放",
  "searchTerms": "tupiansuofang tpsf suofang chicun daxiao"
},
"image-compress": {
  "shortTitle": "圖片壓縮",
  "searchTerms": "tupianyasuo tpyz yasuo webp zhiliang"
},
"image-convert": {
  "shortTitle": "圖片格式轉換",
  "searchTerms": "tupiangeshi tpgs geshi webp png jpg"
}
```

**Japanese (ja)**:

```json
"image-resize": {
  "shortTitle": "画像リサイズ",
  "searchTerms": "gazourisize gzrs rsize saizu henko"
},
"image-compress": {
  "shortTitle": "画像圧縮",
  "searchTerms": "gazouasshuku gzash assyuku hoshitsushitsu"
},
"image-convert": {
  "shortTitle": "画像フォーマット変換",
  "searchTerms": "gazouformat gzfmt henkan fomat webp png"
}
```

**Korean (ko)**:

```json
"image-resize": {
  "shortTitle": "이미지 크기 조절",
  "searchTerms": "imijikeugigeojeol ijkjgj resize saijeu"
},
"image-compress": {
  "shortTitle": "이미지 압축",
  "searchTerms": "imijiapsong ijac apsong pilyong"
},
"image-convert": {
  "shortTitle": "이미지 포맷 변환",
  "searchTerms": "imijipomat imifmt pyeonhwan format webp"
}
```

**Spanish (es)**, **Portuguese (pt-BR)**, **French (fr)**, **German (de)**, **Russian (ru)**:
These Latin-script languages use `shortTitle` in their own language. `searchTerms` omitted unless alternative terms are needed (e.g., abbreviations, English aliases commonly used in that developer community).

### Per-tool i18n keys (each tool's `{tool}.json`)

Each tool needs these key groups:

**Drop zone**:

- `dropImage` — "Drop an image here or click to select"
- `supportedFormats` — "Supports PNG, JPG, WebP, GIF, BMP, SVG"

**Controls**:

- `outputFormat` — "Output Format"
- `formatUnsupported` — tooltip for disabled format
- `quality` — "Quality"
- `resize` — "Resize"
- `noResize` — "Original size"
- `byPercent` — "By percentage"
- `customSize` — "Custom size"
- `width` — "Width"
- `height` — "Height"
- `keepAspectRatio` — "Keep aspect ratio"
- `pngLosslessHint` — "PNG is lossless — switch to Image Converter to convert to WebP for smaller file size." (Compressor only)

**Actions**:

- `reselect` — "Reselect"
- `download` — "Download"
- `copyToClipboard` — "Copy to clipboard"
- `copiedToClipboard` — "Copied to clipboard as PNG"

**Preview**:

- `original` — "Original"
- `compressed` / `result` — "Compressed" / "Result"
- `saved` — "Saved {percent}%"
- `dragToCompare` — "Drag to compare" (Compressor only)

**Toasts**:

- `processing` — "Processing..."
- `encodingFailed` — "Failed to encode image"
- `firstFrameOnly` — "Animated image — only the first frame is used"
- `largeImage` — "Large image ({w}×{h}) — processing may be slow"
- `formatNotSupported` — "This image format is not supported"
- `copyFailed` — "Failed to copy to clipboard"

**Description section** (via `DescriptionSection` component):

- `descriptions.title` — "About {Tool Name}"
- `descriptions.whatIsTitle` — "What is {Tool Name}?"
- `descriptions.whatIs` — explanation paragraph
- `descriptions.stepsTitle` — "How to use"
- `descriptions.step1Title` / `step1Text` — HowTo steps (3 per tool)
- `descriptions.step2Title` / `step2Text`
- `descriptions.step3Title` / `step3Text`
- `descriptions.faq1Q` / `faq1A` — FAQ items (2-3 per tool)
- `descriptions.faq2Q` / `faq2A`
- `descriptions.p1` / `p2` — additional paragraphs with internal links to related tools

## SEO

- `app/sitemap.ts` auto-generates from TOOLS array — no manual changes needed
- `generatePageMeta()` in each `page.tsx` handles alternates, OG tags
- JSON-LD `HowTo` schema auto-generated from 3 steps per tool
- No 301 redirect needed for old `/image` route
- Each `page.tsx` generates structured data:
  - `HowTo` schema from step1-3Title/step1-3Text
  - `FAQ` schema from faq1-3Q/faq1-3A
  - AEO definition from `descriptions.aeoDefinition` (if present)

## AGENTS.md Updates

**Available Tools table**: Replace `| /image | Image Compressor | ... |` with 3 rows:

```markdown
| `/image-resize` | Image Resizer | Resize images by percentage or custom dimensions |
| `/image-compress` | Image Compressor | Compress images with adjustable quality, drag-to-compare preview |
| `/image-convert` | Image Converter | Convert images between PNG, JPG, and WebP formats |
```

**Tool Categories table**: Update `Visual & Media` row:

```markdown
| Visual & Media | `visual-media` | `color`, `image-resize`, `image-compress`, `image-convert` |
```

**libs/ table**: Update image entry to note shared components:

```markdown
| `image/` | Image processing (compress, resize, format conversion, shared components) |
```

## README.md Updates

**Tools table**: Replace Image Compressor row with 3 rows:

```markdown
| Image Resizer | Resize images by percentage or custom dimensions |
| Image Compressor | Compress images with adjustable quality, drag-to-compare preview |
| Image Converter | Convert images between PNG, JPG, and WebP formats |
```
