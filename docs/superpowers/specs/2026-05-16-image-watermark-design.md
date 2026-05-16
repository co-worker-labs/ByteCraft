# Image Watermark Tool Design

## Overview

Add a new tool at `/image-watermark` that lets users add text or logo watermarks to images. All processing runs entirely in the browser using the Canvas API. No external watermark libraries.

## Decisions

| Decision          | Choice                                 | Rationale                                                             |
| ----------------- | -------------------------------------- | --------------------------------------------------------------------- |
| Watermark types   | Text + Logo (tab switch)               | Covers both copyright text and brand logo use cases                   |
| Arrangement       | Single position + Tiled (radio switch) | Single for branding, tiled for copyright protection                   |
| Batch processing  | Single image only                      | Matches existing image tools pattern, keeps scope manageable          |
| Output format     | Auto-preserve original format          | Zero config, user doesn't need to think about format                  |
| Preview           | Real-time with 300ms debounce          | Matches image-resize pattern, responsive UX                           |
| Implementation    | Pure Canvas self-implementation        | Core logic is ~200 lines, no benefit from external libraries          |
| EXIF preservation | Out of scope for v1                    | Adds significant complexity (piexifjs dependency), can be added later |

## Route & File Structure

**Route**: `/image-watermark`

### New files

```
app/[locale]/image-watermark/
├── page.tsx                       # Route entry (SEO metadata + JSON-LD)
└── image-watermark-page.tsx       # Main page component (client)

libs/image/
└── watermark.ts                   # Watermark rendering core logic (~200 lines)

public/locales/{locale}/
├── tools.json                     # Append image-watermark entry
└── image-watermark.json           # Tool translations (10 locales)
```

### Modified files

```
libs/tools.ts                      # Append tool registration + category + relations
```

### Reused infrastructure (no changes)

- `components/image/useImageInput` — file selection, drag-and-drop, ImageBitmap management
- `components/image/useImageExport` — download, copy to clipboard
- `components/image/ImageDropZone` — drag-and-drop upload zone
- `components/image/ImageInfoBar` — result info bar (file size, format, dimensions)
- `libs/image/encode.ts` — canvas-to-blob encoding helper
- `libs/image/types.ts` — OutputFormat, resolveOutputFormat, FORMAT_EXTENSIONS
- `components/layout` / `components/privacy-banner` / `components/description-section` / `components/related-tools`

## Core Rendering Logic (`libs/image/watermark.ts`)

### Types

```typescript
type WatermarkMode = "single" | "tiled";
type PositionPreset =
  | "center"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center"
  | "left-center"
  | "right-center";

interface TextWatermarkConfig {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number; // Percentage of image width (1-20)
  color: string; // HEX color
  opacity: number; // 0-100
  bold: boolean;
}

interface LogoWatermarkConfig {
  type: "logo";
  bitmap: ImageBitmap; // Uploaded logo
  scale: number; // Percentage of image width (5-50)
  opacity: number; // 0-100
}

interface WatermarkOptions {
  mode: WatermarkMode;
  position: PositionPreset; // Used in single mode
  rotation: number; // Used in tiled mode, degrees (-90 to 90)
  spacing: number; // Used in tiled mode, multiplier (1.0 to 3.0)
}
```

### Core function

```typescript
export function renderWatermark(
  sourceBitmap: ImageBitmap,
  outputFormat: OutputFormat,
  watermark: TextWatermarkConfig | LogoWatermarkConfig,
  options: WatermarkOptions
): Promise<Blob>;
```

### Rendering pipeline

1. Create offscreen canvas at original image resolution
2. Draw source image (fill white background first for JPEG)
3. Apply watermark based on mode:
   - **Single mode**: Render one watermark at the 9-grid preset position
   - **Tiled mode**: Render watermarks in a brick-pattern grid with rotation, covering the entire image with odd/even row offset
4. `canvas.toBlob()` with appropriate format and quality settings

### Key rendering details

- **Text font size**: Calculated as percentage of image width to ensure consistent visual size across resolutions. Minimum 12px.
- **Text shadow**: `rgba(0,0,0,0.5)` shadow ensures readability on both light and dark backgrounds.
- **Tiled pattern**: Brick-style interleaving — odd rows offset by half the horizontal spacing. Each tile rotated around its center.
- **Position calculation**: 9-grid positions computed with padding (5% of image dimension) from edges.
- **JPEG white fill**: Canvas alpha channel causes transparent regions to render black in JPEG. White fill applied before drawing source image.

## Page UI Layout

### Overall structure

Matches `image-resize` pattern: left control panel (280px) + right preview area.

```
┌─────────────────────────────────────────────┐
│  PrivacyBanner (variant="files")            │
├──────────┬──────────────────────────────────┤
│ Controls │  Preview                          │
│ (280px)  │                                  │
│          │  ┌──────────────────────┐        │
│ Type tab │  │                      │        │
│ Arr mode │  │   Real-time preview  │        │
│ Config   │  │                      │        │
│          │  └──────────────────────┘        │
│ Actions  │                                  │
│          │  ImageInfoBar                    │
├──────────┴──────────────────────────────────┤
│  DescriptionSection                         │
│  RelatedTools                               │
└─────────────────────────────────────────────┘
```

### Control panel sections

**1. Watermark Type (Tab switch)**

Two tabs: "Text" | "Logo". Controls which configuration section is shown below.

**2. Arrangement Mode (Radio)**

Two options: "Single" | "Tiled". Controls position/rotation controls below.

**3. Text Watermark Config (shown when type=text)**

| Control      | Type        | Default  | Range                                             |
| ------------ | ----------- | -------- | ------------------------------------------------- |
| Text content | Textarea    | "© 2024" | —                                                 |
| Font family  | Select      | "Arial"  | Arial, Helvetica, Georgia, Courier New, system-ui |
| Font size    | Slider      | 5        | 1%–20% of image width                             |
| Color        | Color input | #FFFFFF  | Any HEX                                           |
| Opacity      | Slider      | 50       | 0%–100%                                           |
| Bold         | Checkbox    | off      | —                                                 |

**4. Logo Watermark Config (shown when type=logo)**

| Control     | Type       | Default | Range                 |
| ----------- | ---------- | ------- | --------------------- |
| Upload logo | File input | —       | PNG, JPG, WebP, SVG   |
| Scale       | Slider     | 20      | 5%–50% of image width |
| Opacity     | Slider     | 80      | 0%–100%               |

**5. Position Config (shown when mode=single)**

3x3 grid of position preset buttons (visually representing top-left, top-center, ..., bottom-right).

**6. Tiled Config (shown when mode=tiled)**

| Control  | Type   | Default | Range       |
| -------- | ------ | ------- | ----------- |
| Rotation | Slider | -30     | -45° to 45° |
| Spacing  | Slider | 1.5     | 1.0x–3.0x   |

**7. Actions (fixed bottom)**

- Reselect image (secondary button)
- Download (primary button)
- Copy to clipboard (outline-cyan button)

### Preview area

- `<img>` element displaying the watermarked result
- `aspectRatio` matches source image dimensions
- `maxHeight: 500px` with `object-contain`
- Processing overlay (spinner + "Processing...") during rendering

## Real-time Preview Mechanism

Follows the exact same pattern as `image-resize`:

```
Parameter change (text/fontSize/opacity/position/...)
    │
    ▼
debounce 300ms (0ms on initial load)
    │
    ▼
renderWatermark(sourceBitmap, outputFormat, watermark, options)
    │
    ▼
Blob → URL.createObjectURL → previewUrl state
    │
    ▼
<img src={previewUrl}> renders immediately
```

- **Staleness guard**: `stalenessId.current` incremented on each render call. Result only applied if `callId === stalenessId.current`.
- **Initial load**: 0ms debounce for immediate first render.
- **Memory management**: Previous `previewUrl` revoked before setting new one. Cleanup on unmount via `useEffect` return.
- **Processing state**: `processing` boolean shows overlay during canvas operations.

## Tool Registration

### `libs/tools.ts` additions

```typescript
// TOOLS array — append:
{ key: "image-watermark", path: "/image-watermark", icon: Droplets, emoji: "💧", sameAs: [] }

// TOOL_CATEGORIES — append "image-watermark" to visual.tools array

// TOOL_RELATIONS — add new entry:
"image-watermark": ["image-resize", "image-compress", "image-convert", "color"]

// TOOL_RELATIONS — append "image-watermark" to existing image tool entries:
"image-resize": [...existing, "image-watermark"]
"image-compress": [...existing, "image-watermark"]
"image-convert": [...existing, "image-watermark"]
```

## i18n

### tools.json entry (per locale)

```json
{
  "image-watermark": {
    "title": "Image Watermark - Add Text or Logo Watermark",
    "shortTitle": "Image Watermark",
    "description": "Add text or logo watermarks to images. Customize position, opacity, rotation, and tiling. Supports PNG, JPG, WebP. All processing runs in your browser."
  }
}
```

### image-watermark.json structure

~60 keys covering:

- **Shared image keys**: dropImage, supportedFormats, reselect, copyToClipboard, original, result, processing, error toasts
- **Watermark type**: text/logo tab labels
- **Text config**: text input, font family options, font size, color, opacity, bold
- **Logo config**: upload label, scale, opacity
- **Arrangement**: single/tiled mode labels
- **Position**: 9 preset names (center, top-left, etc.)
- **Tiled**: rotation, spacing labels
- **Description section**: about title, what-is, 3 how-to steps, 2-3 paragraphs, 3 FAQs
- **searchTerms** (CJK locales only): romanized title + functional keywords

### Locale-specific notes

- **en**: No `searchTerms` needed (English title is directly searchable)
- **zh-CN/zh-TW**: Include `searchTerms` with pinyin romanization + keywords like `shuiyin`, `yinji`, `banquan`
- **ja**: Include `searchTerms` with romaji + `mizushi`, `shomei`
- **ko**: Include `searchTerms` with romanized Korean + `sutakka`, `ugin`
- **es/pt-BR/fr/de/ru**: Only include `searchTerms` if there are alternative search terms

## Out of Scope

These features are explicitly excluded from v1:

- **Batch processing**: Single image only (matches existing image tools)
- **EXIF preservation**: Canvas strips EXIF data. Preserving it requires piexifjs/exifr. Can be added in v2 if requested.
- **Custom font upload**: Only system fonts available (Arial, Helvetica, Georgia, Courier New, system-ui)
- **Draggable watermark positioning**: 9-grid presets only. Free positioning adds significant UI complexity.
- **Watermark stroke/outline**: Shadow is sufficient for readability. Stroke can be added later.
- **Output format selection**: Auto-preserve only. No manual format picker.
- **Quality slider**: No quality adjustment. PNG is lossless, JPEG/WebP use high quality (92).

## Testing

- **Unit tests** (`libs/image/__tests__/watermark.test.ts`): Test position calculation, tiling rect generation, rotation math
- **No visual regression tests**: Canvas output is deterministic for given inputs but pixel-level assertions are fragile
