# Merge PDF Tool Design

Add a browser-based PDF merge tool to OmniKit. Users upload multiple PDF files, see thumbnail previews, reorder via drag-and-drop, optionally exclude individual files, and merge into a single PDF for download.

## Decisions

| Decision                    | Choice                                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Tool key                    | `pdf-merge` — follows `{noun}-{verb}` pattern consistent with `image-resize` / `image-compress` / `image-convert`                           |
| Route                       | `/pdf-merge`                                                                                                                                |
| Category                    | `visual` (visual-media)                                                                                                                     |
| Merge library               | `pdf-lib` (~174KB gzip, static import)                                                                                                      |
| Thumbnail rendering         | `pdfjs-dist` v4.x (~500KB–1MB gzip for main lib + worker, dynamic import on file upload)                                                    |
| pdfjs-dist version          | **v4.x** (e.g. `^4.9.0`) — v5.x has a blocking webpack bug with Next.js 16 ([pdf.js#20478](https://github.com/mozilla/pdf.js/issues/20478)) |
| Merge granularity           | File-level — each PDF is an atomic unit, users reorder files not pages                                                                      |
| File exclusion              | Toggle per file — disabled files stay in list (grayed out) but skip merge                                                                   |
| File count limit            | No hard limit; UI remains performant with 50+ files via virtualized list if needed                                                          |
| Drag reorder                | HTML5 Drag and Drop API                                                                                                                     |
| Drag-and-drop file handling | `file-selector` library (already used by `checksum` tool via `fromEvent()`)                                                                 |
| Thumbnail source            | First page of each PDF, rendered via pdfjs-dist canvas                                                                                      |
| Progress feedback           | `onProgress(current, total)` callback during merge                                                                                          |
| Bundle strategy             | pdf-lib in initial chunk; pdfjs-dist dynamically imported after first file upload                                                           |
| Icon                        | `FileStack` (lucide-react) — avoids collision with `FileDown` used by `image-compress`; semantically fits "merge multiple files"            |
| Emoji                       | 📑 — avoids collision with 📄 used by `diff` and `yaml`; "multiple pages" connotation                                                       |

## Architecture

### File Structure

```
app/[locale]/pdf-merge/
├── page.tsx                # SEO metadata + JSON-LD + route entry
└── pdf-merge-page.tsx      # Client component: UI + interaction logic

libs/pdf-merge/
├── types.ts                # PdfFileEntry, MergeProgress types
├── merge.ts                # pdf-lib merge logic + getPdfPageCount
├── thumbnail.ts            # pdfjs-dist v4 thumbnail rendering (dynamic import)
└── __tests__/
    └── merge.test.ts       # Unit tests for merge logic
```

### Dependencies

- `pdf-lib` (^1.17.1) — static import, handles PDF merge and page count. Cannot render PDFs (creation/modification only), hence pdfjs-dist is required for thumbnails.
- `pdfjs-dist` (^4.9.0) — dynamic import only, renders first-page thumbnails. v4.x chosen over v5.x due to v5's blocking webpack compatibility issue with Next.js 16.

### Build Configuration

**`next.config.js`** changes:

```javascript
// Required for pdfjs-dist
transpilePackages: ['pdfjs-dist'],
webpack: (config) => {
  config.resolve.alias.canvas = false;  // Browser doesn't need node-canvas
  return config;
},
// If turbopack is also used:
turbopack: {
  resolveAlias: {
    canvas: false,
  },
},
```

**Worker setup** (pdfjs-dist v4):

Copy worker file to `public/` via build script:

```json
// package.json scripts
{
  "copy-pdf-worker": "cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs",
  "predev": "npm run copy-pdf-worker",
  "prebuild": "npm run copy-pdf-worker"
}
```

Set worker source in thumbnail.ts:

```typescript
const pdfjs = await import("pdfjs-dist");
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
```

> **Note**: CMaps and standard fonts are NOT needed for thumbnail rendering (first-page rasterization only). This avoids ~2MB of extra static assets.

### Data Model

```typescript
interface PdfFileEntry {
  id: string; // crypto.randomUUID()
  file: File; // Original file reference
  name: string; // File name
  size: number; // Size in bytes
  pageCount: number; // Total pages (from pdf-lib PDFDocument.load() → getPageCount())
  thumbnailUrl: string | null; // First-page thumbnail object URL (null while rendering)
  arrayBuffer: ArrayBuffer; // File binary data
  enabled: boolean; // true = included in merge, false = excluded but visible
}
```

### Component State

```typescript
const [files, setFiles] = useState<PdfFileEntry[]>([]);
const [merging, setMerging] = useState(false);
const [progress, setProgress] = useState<MergeProgress | null>(null);
const [resultBlob, setResultBlob] = useState<Blob | null>(null);
const [error, setError] = useState<string | null>(null);
```

## User Flow

### States

1. **Empty** — Drop zone displayed ("Drop PDF files here or click to select")
2. **Files loaded** — File list with thumbnails, drag handles, enable/disable toggles, delete buttons
3. **Merging** — Progress bar showing current/total files
4. **Complete** — Result summary with download and "New Merge" buttons

### Interaction Details

- **Upload**: Drop zone + file input (`accept=".pdf"`, `multiple`). Uses `file-selector` library (`fromEvent()`) for drag-and-drop handling, consistent with `checksum` tool. Only `.pdf` files accepted.
- **Thumbnail**: First page rendered at ~120×160px via pdfjs-dist canvas. Rendered asynchronously with concurrency limit of 3.
- **Drag reorder**: HTML5 Drag and Drop on each file entry. Drag handle on the left side.
- **Enable/Disable toggle**: Each file has a toggle (eye icon or checkbox). Disabled files are visually dimmed (reduced opacity), remain in position, but are excluded from merge.
- **Delete**: [×] button on each entry. Removes file and revokes thumbnailUrl.
- **Add more**: "Add more files" button at bottom of file list, appends additional PDFs.
- **Merge button**: Enabled when `files.filter(f => f.enabled).length >= 2`. Shows total enabled files and total pages.
- **Download**: Creates object URL from result Blob, triggers download as `merged.pdf`.
- **New Merge**: Clears all state back to empty.

### UI Layout (ASCII wireframe)

```
┌─────────────────────────────────────────────┐
│  Layout (title, categoryLabel, categorySlug)│
│  ┌───────────────────────────────────────┐   │
│  │  PrivacyBanner                        │   │
│  └───────────────────────────────────────┘   │
│                                               │
│  [Empty state]                               │
│  ┌───────────────────────────────────────┐   │
│  │  📑 Drop PDF files here               │   │
│  │     or click to select                │   │
│  │     Supports PDF only                 │   │
│  └───────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Layout (title, categoryLabel, categorySlug)│
│  ┌───────────────────────────────────────┐   │
│  │  PrivacyBanner                        │   │
│  └───────────────────────────────────────┘   │
│                                               │
│  [Files loaded]                              │
│  ┌──────┐  ✅ report.pdf    12页  2.3MB [×] │
│  │ 缩略图│  ≡ drag handle                    │
│  └──────┘                                    │
│  ┌──────┐  ⬜ invoice.pdf   3页  450KB  [×]  │
│  │ 缩略图│  ≡ (dimmed — excluded from merge) │
│  └──────┘                                    │
│  ┌──────┐  ✅ contract.pdf  8页  1.1MB  [×]  │
│  │ 缩略图│  ≡ drag handle                    │
│  └──────┘                                    │
│                                              │
│  [+ Add more files]                          │
│                                              │
│  Merging: 2 files / 20 pages (1 excluded)    │
│  [🔀 Merge & Download]                       │
│                                               │
│  ┌───────────────────────────────────────┐   │
│  │  DescriptionSection / Description      │   │
│  │  (whatIs, useCases, howTo, FAQ)        │   │
│  └───────────────────────────────────────┘   │
│                                               │
│  ┌───────────────────────────────────────┐   │
│  │  RelatedTools (currentTool="pdf-merge")│   │
│  └───────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  [Merge complete]                            │
│  ✅ Merged successfully!                     │
│  merged.pdf — 20 pages, 3.8MB               │
│  [📥 Download]  [🔄 New Merge]              │
└─────────────────────────────────────────────┘
```

## Business Logic

### `libs/pdf-merge/merge.ts`

- `mergePdfs(files: ArrayBuffer[], onProgress?): Promise<Uint8Array>` — Creates new PDFDocument, iterates input files, copies all pages via `copyPages()` + `addPage()`, calls `save()`.
- `getPdfPageCount(data: ArrayBuffer): Promise<number>` — Calls `PDFDocument.load(data)` (which fully parses the document) then `getPageCount()` to read the /Page tree count. For large files this has non-trivial cost but is necessary as pdf-lib has no header-only parse mode.

### `libs/pdf-merge/thumbnail.ts`

- `renderThumbnail(data: ArrayBuffer, maxWidth?: number, maxHeight?: number): Promise<string>` — Dynamic imports pdfjs-dist v4, renders first page to off-screen canvas at constrained dimensions, returns data URL string.
- The dynamic import ensures pdfjs-dist is only fetched when the user actually uploads a file.
- **Worker path**: Worker file (`pdf.worker.min.mjs`) copied to `public/` via build script. Set `pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"` before rendering. See Build Configuration section for details.

### `libs/pdf-merge/types.ts`

- `PdfFileEntry` — File metadata + state
- `MergeProgress` — `{ current: number; total: number }` for progress UI

## Error Handling

| Scenario                         | Handling                                                                                      |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| Non-PDF file uploaded            | Filter at input level (`accept=".pdf"`), toast "Only PDF files are supported"                 |
| Encrypted/password-protected PDF | pdf-lib `load()` throws → catch → toast "This PDF is encrypted and cannot be merged"          |
| Corrupted PDF                    | Same as encrypted — catch load error, show friendly message                                   |
| 0 or 1 enabled files             | Merge button disabled, minimum 2 enabled files required                                       |
| Large files (>100MB each)        | Allowed, progress bar shown during merge                                                      |
| Many files (50+)                 | No hard limit; if performance becomes an issue, consider virtualized list in future iteration |
| Duplicate file names             | Allowed, each entry has unique id                                                             |
| Merge failure                    | Catch exception → toast error → user can retry or remove problematic file                     |
| Memory cleanup                   | `URL.revokeObjectURL(thumbnailUrl)` on file delete and component unmount                      |

## Performance Strategy

1. **pdfjs-dist dynamic import**: Not included in initial bundle. Loaded after first file upload.
2. **Thumbnail concurrency**: Max 3 simultaneous renders to avoid memory pressure.
3. **Merge progress**: `onProgress(current, total)` drives progress bar, keeps UI responsive.
4. **Object URL cleanup**: Revoke thumbnail URLs on delete and unmount.
5. **pdf-lib direct ArrayBuffer load**: No redundant file reads.

## Tool Registration

### `libs/tools.ts`

- Add to `TOOLS`:
  ```typescript
  {
    key: "pdf-merge",
    path: "/pdf-merge",
    icon: FileStack,  // import { FileStack } from "lucide-react"
    emoji: "📑",
    sameAs: [
      "https://en.wikipedia.org/wiki/PDF",
      "https://developer.mozilla.org/en-US/docs/Glossary/PDF",
    ],
  }
  ```
- Add to `TOOL_CATEGORIES` visual group: `["color", "image-resize", "image-compress", "image-convert", "pdf-merge"]`
- Add to `TOOL_RELATIONS`:
  ```
  "pdf-merge": ["image-compress", "image-convert", "checksum"]
  ```
- **Reverse relations** (must update existing entries to maintain bidirectional symmetry per `tool-relations.test.ts`):
  - `"image-compress"`: add `"pdf-merge"`
  - `"image-convert"`: add `"pdf-merge"`
  - `"checksum"`: add `"pdf-merge"`
- Verify relation counts stay within 2–5 per tool (test constraint).

### i18n (10 locales)

#### `public/locales/{locale}/tools.json`

```json
{
  "pdf-merge": {
    "title": "PDF Merger - Combine Multiple PDFs into One",
    "shortTitle": "PDF Merger",
    "description": "Merge multiple PDF files into a single document. Drag-and-drop reorder, thumbnail preview, and instant download. All processing runs in your browser."
  }
}
```

- CJK locales include `searchTerms`:
  - zh-CN: `"pdfhebing pdfhb hebing pdf"` (romanized full + initials + domain keywords)
  - zh-TW: `"pdfhebing pdfhb hebing pdf"`
  - ja: `"pdfgattai pdfgt gattai pdf"`
  - ko: `"pdfhapche pdfhc hapche pdf"`
- Latin-script locales (`en`, `es`, `pt-BR`, `fr`, `de`, `ru`): no `searchTerms` needed (shortTitle is already searchable).

#### `public/locales/{locale}/pdf-merge.json`

Tool-specific UI strings:

```json
{
  "dropPdf": "Drop PDF files here or click to select",
  "supportedFormats": "Supports PDF files only",
  "addMoreFiles": "Add more files",
  "mergeButton": "Merge & Download",
  "mergeButtonInfo": "{count} files / {pages} pages",
  "excludedCount": "{count} excluded",
  "merging": "Merging...",
  "mergeProgress": "Processing file {current} of {total}...",
  "mergeSuccess": "Merged successfully!",
  "mergedResult": "{name} — {pages} pages, {size}",
  "download": "Download",
  "newMerge": "New Merge",
  "onlyPdfSupported": "Only PDF files are supported",
  "encryptedPdf": "This PDF is encrypted and cannot be merged",
  "corruptedPdf": "This PDF file is corrupted and cannot be read",
  "mergeFailed": "Merge failed. Please try removing the problematic file.",
  "pages": "{count} pages",
  "descriptions": {
    "title": "About PDF Merger",
    "aeoDefinition": "PDF Merger is a free online tool for combining multiple PDF files into a single document. Drag-and-drop to reorder, preview thumbnails, and download the merged result. All processing runs locally in your browser.",
    "whatIsTitle": "What is the PDF Merger?",
    "whatIs": "Combine multiple PDF files into a single document directly in your browser. Upload your PDFs, drag to reorder, toggle individual files on or off, and download the merged result. No data is uploaded to any server — all processing uses the pdf-lib library.",
    "useCases": "When to use PDF Merger",
    "useCasesP1": "Combine multiple reports, invoices, or contracts into a single file for easy sharing.",
    "useCasesP2": "Merge scanned documents or printouts into one cohesive PDF.",
    "stepsTitle": "How to Merge PDFs",
    "step1Title": "Upload files",
    "step1Text": "Drag and drop your PDF files or click to select them from your computer.",
    "step2Title": "Arrange and configure",
    "step2Text": "Drag to reorder files. Toggle off any files you want to exclude from the merge.",
    "step3Title": "Merge and download",
    "step3Text": "Click the Merge button to combine all enabled files into a single PDF and download it.",
    "faq1Q": "Is there a file size limit?",
    "faq1A": "No. PDF merging runs entirely in your browser, so there is no server-side file size limit. Very large files may take longer to process.",
    "faq2Q": "Can I reorder pages within a PDF?",
    "faq2A": "No. This tool merges entire PDF files in the order you arrange them. Each PDF is treated as an atomic unit — all its pages stay together.",
    "faq3Q": "Are my files uploaded to a server?",
    "faq3A": "No. All processing happens locally in your browser using the pdf-lib library. Your files never leave your device."
  }
}
```

#### `public/locales/{locale}/categories.json`

Update `visual` category:

- `intro`: Update tool count from current to include pdf-merge (e.g. "5 visual and media tools..." — count color + image-resize + image-compress + image-convert + pdf-merge)
- `title`: Update to include PDF Merger (e.g. "Visual & Media Tools - Color Converter, Image Compressor, PDF Merger")
- `faq1A`: Update tool listing to include pdf-merge

### SEO

#### `app/[locale]/pdf-merge/page.tsx`

```typescript
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import PdfMergePage from "./pdf-merge-page";

const PATH = "/pdf-merge";
const TOOL_KEY = "pdf-merge";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("pdf-merge.title"),
    description: t("pdf-merge.description"),
    ogImage: { type: "tool", key: TOOL_KEY },
  });
}

export default async function PdfMergeRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "pdf-merge" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("pdf-merge.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("pdf-merge.description"),
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
      <PdfMergePage />
    </>
  );
}
```

#### `app/[locale]/pdf-merge/pdf-merge-page.tsx` component structure

```tsx
"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { renderLinkedText } from "../../../utils/linked-text";
import Layout from "../../../components/layout";
import { showToast } from "../../../libs/toast";
import { fromEvent } from "file-selector";
import RelatedTools from "../../../components/related-tools";
import PrivacyBanner from "../../../components/privacy-banner";
// ... other imports

export default function PdfMergePage() {
  const t = useTranslations("tools");
  const title = t("pdf-merge.shortTitle");
  return (
    <Layout title={title} categoryLabel={t("categories.visual")} categorySlug="visual-media">
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner />
        <Conversion />
        <Description />
        <RelatedTools currentTool="pdf-merge" />
      </div>
    </Layout>
  );
}
```

- Sitemap auto-generated from `TOOLS` registry (no manual change needed).

## Test Scope

### `libs/pdf-merge/__tests__/merge.test.ts`

| Test case              | Description                                                                      |
| ---------------------- | -------------------------------------------------------------------------------- |
| Normal merge (2 PDFs)  | Two valid PDFs → merged output has sum of pages                                  |
| Normal merge (5+ PDFs) | Multiple files merge correctly                                                   |
| Single file            | `mergePdfs` with 1 file returns a valid PDF with correct page count              |
| Empty array            | `mergePdfs([])` returns empty PDF or throws with clear error                     |
| Encrypted PDF          | pdf-lib `load()` throws → error caught and identified as encrypted               |
| Corrupted PDF          | pdf-lib `load()` throws → error caught with friendly message                     |
| Page count accuracy    | `getPdfPageCount()` returns correct count for 1-page, multi-page, and large PDFs |
| Progress callback      | `onProgress` called once per file with correct (current, total)                  |
| Order preservation     | Merged PDF page order matches input file order                                   |
| Error messages i18n    | Error message keys are returned (not hardcoded English strings)                  |

### Vitest config

Add `"pdf-merge"` to `vitest.config.ts` test scopes.
