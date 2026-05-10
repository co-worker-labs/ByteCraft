# Background Remover Tool Design

Date: 2026-05-10

## Overview

A new independent tool at `/bgremover` that uses AI to remove image backgrounds in the browser, with optional background replacement (solid color, gradient, or custom image). All processing happens client-side — no data leaves the device.

## Requirements

- AI-powered background removal using `@imgly/background-removal` (RMBG-1.4 model)
- Background replacement: solid color, gradient (two colors + direction), custom image
- Export formats: PNG and WebP
- Upload-and-go: image is processed automatically on upload
- Web Worker for AI inference to keep UI responsive
- Model download progress indicator for first-time users (~30MB, cached after)
- Full i18n support (10 locales)
- Mobile responsive (< 768px single column)

## Architecture

### File Structure

```
app/[locale]/bgremover/
├── page.tsx              # Route entry + SEO metadata
└── bgremover-page.tsx    # "use client" page component

libs/bgremover/
├── main.ts              # Core logic: background removal orchestration, compositing, export
├── worker.ts            # Web Worker: AI model inference (@imgly/background-removal)
└── __tests__/
    └── main.test.ts     # Unit tests for compositing and format conversion

components/bgremover/
├── dropzone.tsx          # Image upload dropzone
├── preview-panel.tsx     # Result preview (checkerboard for transparency)
└── background-options.tsx # Background replacement panel (solid/gradient/image)

public/locales/{locale}/
├── bgremover.json        # Tool-specific translations
└── tools.json            # New bgremover entry added
```

### Data Flow

```
User uploads image
  → Main thread: validate file (MIME + size ≤ 10MB)
  → Main thread: create Image object, extract dimensions
  → Web Worker: load @imgly/background-removal model
    → First time: download ~30MB model (progress reported via postMessage)
    → Subsequent: browser cache hit, instant load
  → Web Worker: removeBackground(imageBlob)
  → Web Worker: return processed Blob (PNG with alpha)
  → Main thread: create Object URL → display in preview panel
  → Main thread: store original alpha mask for compositing
```

### Background Replacement (Canvas Compositing)

All compositing happens on the main thread via Canvas API:

- **Solid color**: `ctx.fillStyle = color` → fill → `drawImage(foreground)`
- **Gradient**: `ctx.createLinearGradient(color1, color2, direction)` → fill → `drawImage(foreground)`
- **Custom image**: draw background image (cover mode) → `drawImage(foreground)`

Output: `canvas.toBlob('png' | 'webp')` → download.

### State

```
originalImage: HTMLImageElement      // Uploaded original
foregroundBlob: Blob                // AI-processed foreground
alphaMask: ImageData                // Alpha channel for compositing
isProcessing: boolean               // Processing state
modelProgress: number               // Model load progress 0-100
backgroundType: 'transparent' | 'solid' | 'gradient' | 'image'
backgroundColor: string             // Solid color value
gradientColors: [string, string]    // Gradient color pair
gradientDirection: string           // Gradient direction
backgroundImage: HTMLImageElement   // Custom background image
exportFormat: 'png' | 'webp'       // Export format
```

## Web Worker Protocol

```
Main → Worker:
  { type: 'remove', payload: { imageBlob: Blob } }

Worker → Main:
  { type: 'progress', payload: { progress: number, status: string } }
  { type: 'result', payload: { foregroundBlob: Blob } }
  { type: 'error', payload: { message: string } }
```

Worker lifecycle:

- No preloading — model loads on first image upload
- Progress bar during first download ("Downloading AI model... 45%")
- Worker instance reused across uploads within same page session
- Model cached in browser (IndexedDB/Cache API) after first download

## Components

```
BgRemoverPage
├── PrivacyBanner
├── Dual-panel area
│   ├── Dropzone (left: upload / original preview)
│   │   ├── Empty: drag-drop hint + click to upload
│   │   ├── Processing: progress bar + loading animation
│   │   └── Done: original preview + "Change Image" button
│   └── PreviewPanel (right: result preview)
│       ├── Empty: placeholder text
│       ├── Transparent: checkerboard CSS pattern
│       └── Replaced: composited result
├── BackgroundOptions (Accordion, collapsed by default)
│   ├── Tabs: Solid | Gradient | Image
│   ├── Solid Tab: preset swatches + color picker (react-colorful)
│   ├── Gradient Tab: dual color pickers + direction selector (→ ↘ ↓ ↙)
│   └── Image Tab: upload background image
└── Export bar
    ├── Format toggle: PNG / WebP
    └── DownloadButton
```

### Mobile (< 768px)

- Single column: original on top, result below
- Background options accordion collapsed by default
- Uses existing `useIsMobile` hook

## File Constraints

- Supported formats: PNG, JPG, WebP
- Max file size: 10MB (higher than other tools since background removal benefits from higher resolution)
- Background image upload: same 10MB limit

## Error Handling

| Scenario              | Response                                        |
| --------------------- | ----------------------------------------------- |
| Unsupported file type | `showToast` error                               |
| File exceeds 10MB     | `showToast` error                               |
| Model download fails  | Error message with retry prompt (no auto-retry) |
| Inference crash (OOM) | `showToast` suggesting smaller image            |
| Browser lacks WASM    | Detection → fallback message                    |

## Tool Registration

5 locations updated in `libs/tools.ts`:

1. `TOOLS` array: `{ key: "bgremover", path: "/bgremover", icon: Eraser }`
2. `TOOL_CATEGORIES`: add to `visual` category
3. `TOOL_RELATIONS`: `bgremover: ["image", "color", "qrcode"]` + reciprocal links

## Dependencies

| Package                     | Size                                           | Purpose               |
| --------------------------- | ---------------------------------------------- | --------------------- |
| `@imgly/background-removal` | ~100KB (library; model ~30MB runtime download) | AI background removal |

No other new dependencies. Background compositing uses native Canvas API. Color picker reuses existing `react-colorful`.

## i18n

New file `public/locales/{locale}/bgremover.json` with keys for all UI strings.

`tools.json` entry for each locale with `shortTitle`, `title`, `description`.

searchTerms (CJK only):

- zh-CN: `beijingyichuqj bjycq yichu beijing moban`
- zh-TW: `beijingyichuqj bjycq yichu beijing moban`
- ja: `haikeinukitori hkntr haikei syashin`
- ko: `baegyeongchegeoq bgcgaq chegeo sajin`

## SEO

- `page.tsx`: `generatePageMeta()` for standard meta tags
- JSON-LD: WebApplication + HowTo schema
- No AEO/FAQ content needed

## Testing

- `libs/bgremover/__tests__/main.test.ts`: Vitest unit tests for:
  - Solid color compositing
  - Gradient compositing
  - Image compositing
  - PNG/WebP format export
- Web Worker and AI model: manual testing only (runtime-dependent)

## Future (v2)

- Server-side processing option for users who prefer not to download the model
- Additional replacement options (blur background, pattern backgrounds)
