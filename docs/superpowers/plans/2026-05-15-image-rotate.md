# Image Rotate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an image rotation/flip tool at `/image-rotate` that supports 90°/180°/270° rotation and horizontal/vertical flip, composable together.

**Architecture:** Canvas-based transform (`translate` + `rotate` + `scale` + `drawImage`) with reactive encode pipeline. No shared library changes — all logic lives in the page component. Uses existing `useImageInput` and `useImageExport` hooks.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons, next-intl, HTML5 Canvas API

---

## File Structure

### New files

| File                                              | Purpose                                    |
| ------------------------------------------------- | ------------------------------------------ |
| `app/[locale]/image-rotate/page.tsx`              | Route entry: SEO metadata + JSON-LD        |
| `app/[locale]/image-rotate/image-rotate-page.tsx` | Client component: UI + rotation/flip logic |
| `public/locales/en/image-rotate.json`             | English i18n strings                       |
| `public/locales/zh-CN/image-rotate.json`          | Simplified Chinese i18n strings            |
| `public/locales/zh-TW/image-rotate.json`          | Traditional Chinese i18n strings           |
| `public/locales/ja/image-rotate.json`             | Japanese i18n strings                      |
| `public/locales/ko/image-rotate.json`             | Korean i18n strings                        |
| `public/locales/es/image-rotate.json`             | Spanish i18n strings                       |
| `public/locales/pt-BR/image-rotate.json`          | Portuguese (BR) i18n strings               |
| `public/locales/fr/image-rotate.json`             | French i18n strings                        |
| `public/locales/de/image-rotate.json`             | German i18n strings                        |
| `public/locales/ru/image-rotate.json`             | Russian i18n strings                       |

### Modified files

| File                              | Change                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------ |
| `libs/tools.ts`                   | Add `image-rotate` to TOOLS array, TOOL_CATEGORIES, TOOL_RELATIONS; import `RotateCw` icon |
| `public/locales/en/tools.json`    | Add `image-rotate` block (title, shortTitle, description)                                  |
| `public/locales/zh-CN/tools.json` | Add `image-rotate` block + `searchTerms`                                                   |
| `public/locales/zh-TW/tools.json` | Add `image-rotate` block + `searchTerms`                                                   |
| `public/locales/ja/tools.json`    | Add `image-rotate` block + `searchTerms`                                                   |
| `public/locales/ko/tools.json`    | Add `image-rotate` block + `searchTerms`                                                   |
| `public/locales/es/tools.json`    | Add `image-rotate` block                                                                   |
| `public/locales/pt-BR/tools.json` | Add `image-rotate` block                                                                   |
| `public/locales/fr/tools.json`    | Add `image-rotate` block                                                                   |
| `public/locales/de/tools.json`    | Add `image-rotate` block                                                                   |
| `public/locales/ru/tools.json`    | Add `image-rotate` block                                                                   |

---

## Task 1: Tool Registration (`libs/tools.ts`)

**Files:**

- Modify: `libs/tools.ts`

- [ ] **Step 1: Add `RotateCw` to the lucide-react import**

In `libs/tools.ts`, add `RotateCw` to the import block from `lucide-react` (around line 3-45). The import already includes `RefreshCw` at line 34. Add `RotateCw` right after it:

```typescript
  RefreshCw,
  RotateCw,
```

- [ ] **Step 2: Add `image-rotate` entry to the TOOLS array**

After the `image-convert` entry (line 370), add:

```typescript
  { key: "image-rotate", path: "/image-rotate", icon: RotateCw, emoji: "🔃", sameAs: [] },
```

The full context should look like:

```typescript
  { key: "image-resize", path: "/image-resize", icon: Scaling, emoji: "📐", sameAs: [] },
  { key: "image-compress", path: "/image-compress", icon: FileDown, emoji: "🗜️", sameAs: [] },
  { key: "image-convert", path: "/image-convert", icon: RefreshCw, emoji: "🔄", sameAs: [] },
  { key: "image-rotate", path: "/image-rotate", icon: RotateCw, emoji: "🔃", sameAs: [] },
```

- [ ] **Step 3: Add `image-rotate` to TOOL_CATEGORIES visual.tools**

At line 122, change:

```typescript
  { key: "visual", tools: ["color", "image-resize", "image-compress", "image-convert"] },
```

to:

```typescript
  { key: "visual", tools: ["color", "image-resize", "image-compress", "image-convert", "image-rotate"] },
```

- [ ] **Step 4: Add `image-rotate` relations and update existing image tool relations**

In `TOOL_RELATIONS` (around lines 162-164), change the existing image entries and add the new one:

```typescript
  "image-resize": ["image-compress", "image-convert", "image-rotate", "color"],
  "image-compress": ["image-resize", "image-convert", "image-rotate", "checksum"],
  "image-convert": ["image-resize", "image-compress", "image-rotate", "qrcode"],
  "image-rotate": ["image-resize", "image-compress", "image-convert"],
```

- [ ] **Step 5: Verify the build compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`

Expected: No errors related to `RotateCw` or `image-rotate`.

- [ ] **Step 6: Commit**

```bash
git add libs/tools.ts
git commit -m "feat(image-rotate): register tool in TOOLS, categories, and relations"
```

---

## Task 2: English i18n — Tool Entry + Page Strings

**Files:**

- Modify: `public/locales/en/tools.json`
- Create: `public/locales/en/image-rotate.json`

- [ ] **Step 1: Add `image-rotate` entry to `public/locales/en/tools.json`**

After the `image-convert` block (around line 163-167), add:

```json
  "image-rotate": {
    "title": "Image Rotator - Rotate & Flip Images Online",
    "shortTitle": "Image Rotate",
    "description": "Rotate images by 90°, 180°, or 270° and flip horizontally or vertically. Supports PNG, JPG, WebP. All processing runs in your browser."
  },
```

- [ ] **Step 2: Create `public/locales/en/image-rotate.json`**

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

- [ ] **Step 3: Commit**

```bash
git add public/locales/en/tools.json public/locales/en/image-rotate.json
git commit -m "feat(image-rotate): add English i18n strings"
```

---

## Task 3: CJK i18n — Tool Entries + Page Strings

**Files:**

- Modify: `public/locales/zh-CN/tools.json`
- Create: `public/locales/zh-CN/image-rotate.json`
- Modify: `public/locales/zh-TW/tools.json`
- Create: `public/locales/zh-TW/image-rotate.json`
- Modify: `public/locales/ja/tools.json`
- Create: `public/locales/ja/image-rotate.json`
- Modify: `public/locales/ko/tools.json`
- Create: `public/locales/ko/image-rotate.json`

- [ ] **Step 1: Add `image-rotate` entry to `public/locales/zh-CN/tools.json`**

After the `image-convert` block (around line 189-194), add:

```json
  "image-rotate": {
    "title": "图片旋转 - 在线旋转和翻转图片",
    "shortTitle": "图片旋转",
    "description": "按 90°、180°、270° 旋转图片，支持水平/垂直翻转。支持 PNG、JPG、WebP。所有处理在浏览器本地完成。",
    "searchTerms": "tupianxuanzhuan tpxz 90du 180du fanzhuan"
  },
```

- [ ] **Step 2: Create `public/locales/zh-CN/image-rotate.json`**

```json
{
  "dropImage": "拖放图片到此处，或点击选择",
  "supportedFormats": "支持 PNG、JPG、WebP、AVIF、GIF、BMP、SVG",
  "rotate": "旋转",
  "flipHorizontal": "水平翻转",
  "flipVertical": "垂直翻转",
  "reselect": "重新选择",
  "copyToClipboard": "复制到剪贴板",
  "copiedToClipboard": "已以 PNG 格式复制到剪贴板",
  "original": "原图",
  "result": "结果",
  "processing": "处理中...",
  "encodingFailed": "此格式编码失败",
  "firstFrameOnly": "动态图片 — 仅使用第一帧",
  "largeImage": "大尺寸图片（{w}×{h}）— 处理可能较慢",
  "formatNotSupported": "不支持此图片格式，请使用 PNG、JPG、WebP、GIF、BMP 或 SVG。",
  "descriptions": {
    "title": "关于图片旋转工具",
    "aeoDefinition": "图片旋转工具是一个免费的在线工具，用于旋转和翻转图片。支持 90°、180°、270° 旋转和水平/垂直翻转。所有处理均在浏览器本地运行。",
    "whatIsTitle": "什么是图片旋转工具？",
    "whatIs": "按 90°、180° 或 270° 旋转图片，并可水平或垂直翻转。可组合旋转和翻转实现精确的图片方向调整。数据不会上传到任何服务器，所有处理使用 HTML5 Canvas API 完成。",
    "stepsTitle": "如何旋转图片",
    "step1Title": "拖入或选择图片",
    "step1Text": "将图片拖放到上传区域，或点击浏览。支持 PNG、JPG、WebP、GIF、BMP 和 SVG 输入。",
    "step2Title": "选择旋转和翻转",
    "step2Text": "选择旋转角度（0°、90°、180°、270°），可选开启水平或垂直翻转。",
    "step3Title": "下载旋转后的图片",
    "step3Text": "预览旋转后的图片并下载。输出格式与输入格式一致。",
    "p1": "在浏览器中直接旋转和翻转图片。使用 [图片压缩](/image-compress) 压缩图片，或使用 [图片格式转换](/image-convert) 转换格式。",
    "p2": "支持 PNG、JPG 和 WebP 输出。GIF、BMP、SVG 或 AVIF 格式的图片会自动转换为 PNG。",
    "faq1Q": "支持旋转哪些图片格式？",
    "faq1A": "可以旋转 PNG、JPG、WebP、GIF、BMP、SVG 和 AVIF 图片。输出格式与输入格式一致。不支持的输出格式（GIF、BMP、SVG、AVIF）会保存为 PNG。",
    "faq2Q": "图片会上传到服务器吗？",
    "faq2A": "不会。所有图片处理使用 Canvas API 在浏览器中完成，图片不会离开你的设备。",
    "faq3Q": "可以同时旋转和翻转吗？",
    "faq3A": "可以。你可以同时应用旋转（0°、90°、180°、270°）和翻转（水平、垂直）。翻转先执行，再执行旋转。"
  }
}
```

- [ ] **Step 3: Add `image-rotate` entry to `public/locales/zh-TW/tools.json`**

After the `image-convert` block, add:

```json
  "image-rotate": {
    "title": "圖片旋轉 - 線上旋轉和翻轉圖片",
    "shortTitle": "圖片旋轉",
    "description": "按 90°、180°、270° 旋轉圖片，支援水平/垂直翻轉。支援 PNG、JPG、WebP。所有處理在瀏覽器本機完成。",
    "searchTerms": "tupianxuanzhuan tpxz 90du 180du fanzhuan"
  },
```

- [ ] **Step 4: Create `public/locales/zh-TW/image-rotate.json`**

```json
{
  "dropImage": "拖放圖片到此處，或點擊選擇",
  "supportedFormats": "支援 PNG、JPG、WebP、AVIF、GIF、BMP、SVG",
  "rotate": "旋轉",
  "flipHorizontal": "水平翻轉",
  "flipVertical": "垂直翻轉",
  "reselect": "重新選擇",
  "copyToClipboard": "複製到剪貼簿",
  "copiedToClipboard": "已以 PNG 格式複製到剪貼簿",
  "original": "原圖",
  "result": "結果",
  "processing": "處理中...",
  "encodingFailed": "此格式編碼失敗",
  "firstFrameOnly": "動態圖片 — 僅使用第一幀",
  "largeImage": "大尺寸圖片（{w}×{h}）— 處理可能較慢",
  "formatNotSupported": "不支援此圖片格式，請使用 PNG、JPG、WebP、GIF、BMP 或 SVG。",
  "descriptions": {
    "title": "關於圖片旋轉工具",
    "aeoDefinition": "圖片旋轉工具是一個免費的線上工具，用於旋轉和翻轉圖片。支援 90°、180°、270° 旋轉和水平/垂直翻轉。所有處理均在瀏覽器本機執行。",
    "whatIsTitle": "什麼是圖片旋轉工具？",
    "whatIs": "按 90°、180° 或 270° 旋轉圖片，並可水平或垂直翻轉。可組合旋轉和翻轉實現精確的圖片方向調整。資料不會上傳到任何伺服器，所有處理使用 HTML5 Canvas API 完成。",
    "stepsTitle": "如何旋轉圖片",
    "step1Title": "拖入或選擇圖片",
    "step1Text": "將圖片拖放到上傳區域，或點擊瀏覽。支援 PNG、JPG、WebP、GIF、BMP 和 SVG 輸入。",
    "step2Title": "選擇旋轉和翻轉",
    "step2Text": "選擇旋轉角度（0°、90°、180°、270°），可選開啟水平或垂直翻轉。",
    "step3Title": "下載旋轉後的圖片",
    "step3Text": "預覽旋轉後的圖片並下載。輸出格式與輸入格式一致。",
    "p1": "在瀏覽器中直接旋轉和翻轉圖片。使用 [圖片壓縮](/image-compress) 壓縮圖片，或使用 [圖片格式轉換](/image-convert) 轉換格式。",
    "p2": "支援 PNG、JPG 和 WebP 輸出。GIF、BMP、SVG 或 AVIF 格式的圖片會自動轉換為 PNG。",
    "faq1Q": "支援旋轉哪些圖片格式？",
    "faq1A": "可以旋轉 PNG、JPG、WebP、GIF、BMP、SVG 和 AVIF 圖片。輸出格式與輸入格式一致。不支援的輸出格式（GIF、BMP、SVG、AVIF）會儲存為 PNG。",
    "faq2Q": "圖片會上傳到伺服器嗎？",
    "faq2A": "不會。所有圖片處理使用 Canvas API 在瀏覽器中完成，圖片不會離開你的裝置。",
    "faq3Q": "可以同時旋轉和翻轉嗎？",
    "faq3A": "可以。你可以同時套用旋轉（0°、90°、180°、270°）和翻轉（水平、垂直）。翻轉先執行，再執行旋轉。"
  }
}
```

- [ ] **Step 5: Add `image-rotate` entry to `public/locales/ja/tools.json`**

After the `image-convert` block, add:

```json
  "image-rotate": {
    "title": "画像回転 - オンラインで画像を回転・反転",
    "shortTitle": "画像回転",
    "description": "画像を 90°、180°、270° 回転し、水平・垂直に反転。PNG、JPG、WebP 対応。すべての処理はブラウザで実行されます。",
    "searchTerms": "gazoukaiten gzk 90do 180do tentou"
  },
```

- [ ] **Step 6: Create `public/locales/ja/image-rotate.json`**

```json
{
  "dropImage": "画像をここにドロップするか、クリックして選択",
  "supportedFormats": "PNG、JPG、WebP、AVIF、GIF、BMP、SVG 対応",
  "rotate": "回転",
  "flipHorizontal": "左右反転",
  "flipVertical": "上下反転",
  "reselect": "再選択",
  "copyToClipboard": "クリップボードにコピー",
  "copiedToClipboard": "PNG としてクリップボードにコピーしました",
  "original": "元画像",
  "result": "結果",
  "processing": "処理中...",
  "encodingFailed": "この形式のエンコードに失敗しました",
  "firstFrameOnly": "アニメーション画像 — 最初のフレームのみ使用されます",
  "largeImage": "大きな画像（{w}×{h}）— 処理に時間がかかる場合があります",
  "formatNotSupported": "この画像形式はサポートされていません。PNG、JPG、WebP、GIF、BMP、SVG を使用してください。",
  "descriptions": {
    "title": "画像回転ツールについて",
    "aeoDefinition": "画像回転ツールは、画像の回転と反転を行う無料のオンラインツールです。90°、180°、270° の回転と水平/垂直反転に対応。すべての処理はブラウザ上でローカルに実行されます。",
    "whatIsTitle": "画像回転ツールとは？",
    "whatIs": "画像を 90°、180°、270° 回転し、水平または垂直に反転できます。回転と反転を組み合わせて正確な画像の向きを調整できます。データはアップロードされず、すべて HTML5 Canvas API で処理されます。",
    "stepsTitle": "画像の回転方法",
    "step1Title": "画像をドロップまたは選択",
    "step1Text": "画像をドロップゾーンにドラッグ＆ドロップするか、クリックして参照します。PNG、JPG、WebP、GIF、BMP、SVG 入力に対応。",
    "step2Title": "回転と反転を選択",
    "step2Text": "回転角度（0°、90°、180°、270°）を選択し、必要に応じて水平または垂直反転を切り替えます。",
    "step3Title": "回転した画像をダウンロード",
    "step3Text": "回転した画像をプレビューしてダウンロードします。出力形式は入力形式と同じです。",
    "p1": "ブラウザ上で画像を 90°、180°、270° 回転・反転。[画像圧縮](/image-compress)で圧縮、[画像フォーマット変換](/image-convert)で形式変換もできます。",
    "p2": "PNG、JPG、WebP 出力に対応。GIF、BMP、SVG、AVIF 形式の画像は自動的に PNG に変換されます。",
    "faq1Q": "どの画像形式を回転できますか？",
    "faq1A": "PNG、JPG、WebP、GIF、BMP、SVG、AVIF 画像を回転できます。出力形式は入力形式と同じです。未対応の出力形式（GIF、BMP、SVG、AVIF）は PNG として保存されます。",
    "faq2Q": "画像はサーバーにアップロードされますか？",
    "faq2A": "いいえ。すべての画像処理は Canvas API を使用してブラウザ上で行われます。画像がデバイス外に出ることはありません。",
    "faq3Q": "回転と反転を組み合わせられますか？",
    "faq3A": "はい。回転（0°、90°、180°、270°）と反転（水平、垂直）を同時に適用できます。反転が先に適用され、その後に回転が適用されます。"
  }
}
```

- [ ] **Step 7: Add `image-rotate` entry to `public/locales/ko/tools.json`**

After the `image-convert` block, add:

```json
  "image-rotate": {
    "title": "이미지 회전 - 온라인 이미지 회전 및 뒤집기",
    "shortTitle": "이미지 회전",
    "description": "이미지를 90°, 180°, 270° 회전하고 수평/수직으로 뒤집기. PNG, JPG, WebP 지원. 모든 처리는 브라우저에서 실행됩니다.",
    "searchTerms": "imijehoejeon ijhj 90do 180do sangjohoejeon"
  },
```

- [ ] **Step 8: Create `public/locales/ko/image-rotate.json`**

```json
{
  "dropImage": "이미지를 여기에 드롭하거나 클릭하여 선택",
  "supportedFormats": "PNG, JPG, WebP, AVIF, GIF, BMP, SVG 지원",
  "rotate": "회전",
  "flipHorizontal": "좌우 뒤집기",
  "flipVertical": "상하 뒤집기",
  "reselect": "다시 선택",
  "copyToClipboard": "클립보드에 복사",
  "copiedToClipboard": "PNG로 클립보드에 복사됨",
  "original": "원본",
  "result": "결과",
  "processing": "처리 중...",
  "encodingFailed": "이 형식의 인코딩에 실패했습니다",
  "firstFrameOnly": "애니메이션 이미지 — 첫 번째 프레임만 사용됩니다",
  "largeImage": "큰 이미지({w}×{h}) — 처리가 느릴 수 있습니다",
  "formatNotSupported": "지원되지 않는 이미지 형식입니다. PNG, JPG, WebP, GIF, BMP, SVG를 사용해 주세요.",
  "descriptions": {
    "title": "이미지 회전 도구 정보",
    "aeoDefinition": "이미지 회전 도구는 이미지를 회전하고 뒤집는 무료 온라인 도구입니다. 90°, 180°, 270° 회전 및 수평/수직 뒤집기를 지원합니다. 모든 처리는 브라우저에서 로컬로 실행됩니다.",
    "whatIsTitle": "이미지 회전 도구란?",
    "whatIs": "이미지를 90°, 180°, 270° 회전하고 수평 또는 수직으로 뒤집을 수 있습니다. 회전과 뒤집기를 조합하여 정확한 이미지 방향을 조정할 수 있습니다. 데이터는 업로드되지 않으며, 모든 처리는 HTML5 Canvas API를 사용합니다.",
    "stepsTitle": "이미지 회전 방법",
    "step1Title": "이미지를 드롭하거나 선택",
    "step1Text": "이미지를 드롭존에 드래그 앤 드롭하거나 클릭하여 찾아보기합니다. PNG, JPG, WebP, GIF, BMP, SVG 입력을 지원합니다.",
    "step2Title": "회전 및 뒤집기 선택",
    "step2Text": "회전 각도(0°, 90°, 180°, 270°)를 선택하고 필요에 따라 수평 또는 수직 뒤집기를 전환합니다.",
    "step3Title": "회전된 이미지 다운로드",
    "step3Text": "회전된 이미지를 미리 보고 다운로드합니다. 출력 형식은 입력 형식과 동일합니다.",
    "p1": "브라우저에서 이미지를 90°, 180°, 270°로 회전하고 뒤집습니다. [이미지 압축](/image-compress)으로 압축하거나 [이미지 포맷 변환](/image-convert)으로 형식을 변환할 수도 있습니다.",
    "p2": "PNG, JPG, WebP 출력을 지원합니다. GIF, BMP, SVG, AVIF 형식의 이미지는 자동으로 PNG로 변환됩니다.",
    "faq1Q": "어떤 이미지 형식을 회전할 수 있나요?",
    "faq1A": "PNG, JPG, WebP, GIF, BMP, SVG, AVIF 이미지를 회전할 수 있습니다. 출력 형식은 입력 형식과 동일합니다. 지원되지 않는 출력 형식(GIF, BMP, SVG, AVIF)은 PNG로 저장됩니다.",
    "faq2Q": "이미지가 서버에 업로드되나요?",
    "faq2A": "아니요. 모든 이미지 처리는 Canvas API를 사용하여 브라우저에서 수행됩니다. 이미지가 기기를 떠나지 않습니다.",
    "faq3Q": "회전과 뒤집기를 조합할 수 있나요?",
    "faq3A": "네. 회전(0°, 90°, 180°, 270°)과 뒤집기(수평, 수직)를 동시에 적용할 수 있습니다. 뒤집기가 먼저 적용된 후 회전이 적용됩니다."
  }
}
```

- [ ] **Step 9: Commit**

```bash
git add public/locales/zh-CN/ public/locales/zh-TW/ public/locales/ja/ public/locales/ko/
git commit -m "feat(image-rotate): add CJK i18n strings (zh-CN, zh-TW, ja, ko)"
```

---

## Task 4: Latin i18n — Tool Entries + Page Strings

**Files:**

- Modify: `public/locales/es/tools.json`
- Create: `public/locales/es/image-rotate.json`
- Modify: `public/locales/pt-BR/tools.json`
- Create: `public/locales/pt-BR/image-rotate.json`
- Modify: `public/locales/fr/tools.json`
- Create: `public/locales/fr/image-rotate.json`
- Modify: `public/locales/de/tools.json`
- Create: `public/locales/de/image-rotate.json`
- Modify: `public/locales/ru/tools.json`
- Create: `public/locales/ru/image-rotate.json`

- [ ] **Step 1: Add `image-rotate` entry to `public/locales/es/tools.json`**

After the `image-convert` block (around line 158-162), add:

```json
  "image-rotate": {
    "title": "Rotador de Imágenes - Rotar y Voltear Imágenes Online",
    "shortTitle": "Rotador de Imágenes",
    "description": "Rota imágenes 90°, 180° o 270° y voltea horizontal o verticalmente. Soporta PNG, JPG, WebP. Todo el procesamiento se realiza en tu navegador."
  },
```

- [ ] **Step 2: Create `public/locales/es/image-rotate.json`**

```json
{
  "dropImage": "Suelta una imagen aquí o haz clic para seleccionar",
  "supportedFormats": "Soporta PNG, JPG, WebP, AVIF, GIF, BMP, SVG",
  "rotate": "Rotar",
  "flipHorizontal": "Voltear horizontal",
  "flipVertical": "Voltear vertical",
  "reselect": "Seleccionar otra",
  "copyToClipboard": "Copiar al portapapeles",
  "copiedToClipboard": "Copiado al portapapeles como PNG",
  "original": "Original",
  "result": "Resultado",
  "processing": "Procesando...",
  "encodingFailed": "Error de codificación para este formato",
  "firstFrameOnly": "Imagen animada — solo se usa el primer fotograma",
  "largeImage": "Imagen grande ({w}×{h}) — el procesamiento puede ser lento",
  "formatNotSupported": "Este formato de imagen no es compatible. Usa PNG, JPG, WebP, GIF, BMP o SVG.",
  "descriptions": {
    "title": "Acerca del Rotador de Imágenes",
    "aeoDefinition": "El Rotador de Imágenes es una herramienta online gratuita para rotar y voltear imágenes. Soporta rotación de 90°, 180°, 270° y volteo horizontal/vertical. Todo el procesamiento se ejecuta localmente en tu navegador.",
    "whatIsTitle": "¿Qué es el Rotador de Imágenes?",
    "whatIs": "Rota imágenes 90°, 180° o 270° y voltea horizontal o verticalmente. Combina rotación y volteo para orientar la imagen con precisión. No se suben datos — todo el procesamiento usa la API Canvas de HTML5.",
    "stepsTitle": "Cómo rotar una imagen",
    "step1Title": "Suelta o selecciona una imagen",
    "step1Text": "Arrastra y suelta una imagen en la zona de carga, o haz clic para explorar. Soporta PNG, JPG, WebP, GIF, BMP y SVG.",
    "step2Title": "Elige rotación y volteo",
    "step2Text": "Selecciona un ángulo de rotación (0°, 90°, 180°, 270°) y opcionalmente activa el volteo horizontal o vertical.",
    "step3Title": "Descarga la imagen rotada",
    "step3Text": "Previsualiza la imagen rotada y descárgala. El formato de salida coincide con el formato de entrada.",
    "p1": "Rota y voltea imágenes 90°, 180° o 270° directamente en tu navegador. Comprime imágenes rotadas con el [Compresor de Imágenes](/image-compress), o convierte formatos con el [Convertidor de Imágenes](/image-convert).",
    "p2": "Soporta salida PNG, JPG y WebP. Las imágenes en formato GIF, BMP, SVG o AVIF se convierten automáticamente a PNG.",
    "faq1Q": "¿Qué formatos de imagen puedo rotar?",
    "faq1A": "Puedes rotar imágenes PNG, JPG, WebP, GIF, BMP, SVG y AVIF. El formato de salida coincide con el de entrada. Los formatos de salida no compatibles (GIF, BMP, SVG, AVIF) se guardan como PNG.",
    "faq2Q": "¿Se suben mis imágenes a un servidor?",
    "faq2A": "No. Todo el procesamiento de imágenes se realiza en tu navegador usando la API Canvas. Tus imágenes nunca salen de tu dispositivo.",
    "faq3Q": "¿Puedo combinar rotación y volteo?",
    "faq3A": "Sí. Puedes aplicar rotación (0°, 90°, 180°, 270°) y volteo (horizontal, vertical) al mismo tiempo. El volteo se aplica primero, luego la rotación."
  }
}
```

- [ ] **Step 3: Add `image-rotate` entry to `public/locales/pt-BR/tools.json`**

After the `image-convert` block, add:

```json
  "image-rotate": {
    "title": "Rotacionador de Imagens - Rotacionar e Espelhar Imagens Online",
    "shortTitle": "Rotacionador de Imagens",
    "description": "Rotacione imagens em 90°, 180° ou 270° e espelhe horizontal ou verticalmente. Suporta PNG, JPG, WebP. Todo processamento é feito no seu navegador."
  },
```

- [ ] **Step 4: Create `public/locales/pt-BR/image-rotate.json`**

```json
{
  "dropImage": "Solte uma imagem aqui ou clique para selecionar",
  "supportedFormats": "Suporta PNG, JPG, WebP, AVIF, GIF, BMP, SVG",
  "rotate": "Rotacionar",
  "flipHorizontal": "Espelhar horizontal",
  "flipVertical": "Espelhar vertical",
  "reselect": "Selecionar outra",
  "copyToClipboard": "Copiar para a área de transferência",
  "copiedToClipboard": "Copiado para a área de transferência como PNG",
  "original": "Original",
  "result": "Resultado",
  "processing": "Processando...",
  "encodingFailed": "Falha na codificação para este formato",
  "firstFrameOnly": "Imagem animada — apenas o primeiro quadro é usado",
  "largeImage": "Imagem grande ({w}×{h}) — o processamento pode ser lento",
  "formatNotSupported": "Este formato de imagem não é suportado. Use PNG, JPG, WebP, GIF, BMP ou SVG.",
  "descriptions": {
    "title": "Sobre o Rotacionador de Imagens",
    "aeoDefinition": "O Rotacionador de Imagens é uma ferramenta online gratuita para rotacionar e espelhar imagens. Suporta rotação de 90°, 180°, 270° e espelhamento horizontal/vertical. Todo processamento é executado localmente no seu navegador.",
    "whatIsTitle": "O que é o Rotacionador de Imagens?",
    "whatIs": "Rotacione imagens em 90°, 180° ou 270° e espelhe horizontal ou verticalmente. Combine rotação e espelhamento para orientar a imagem com precisão. Nenhum dado é enviado — todo processamento usa a API Canvas do HTML5.",
    "stepsTitle": "Como rotacionar uma imagem",
    "step1Title": "Solte ou selecione uma imagem",
    "step1Text": "Arraste e solte uma imagem na área de upload, ou clique para navegar. Suporta PNG, JPG, WebP, GIF, BMP e SVG.",
    "step2Title": "Escolha rotação e espelhamento",
    "step2Text": "Selecione um ângulo de rotação (0°, 90°, 180°, 270°) e opcionalmente ative o espelhamento horizontal ou vertical.",
    "step3Title": "Baixe a imagem rotacionada",
    "step3Text": "Visualize a imagem rotacionada e baixe-a. O formato de saída corresponde ao formato de entrada.",
    "p1": "Rotacione e espelhe imagens em 90°, 180° ou 270° diretamente no seu navegador. Comprima imagens rotacionadas com o [Compressor de Imagens](/image-compress), ou converta formatos com o [Conversor de Imagens](/image-convert).",
    "p2": "Suporta saída PNG, JPG e WebP. Imagens em formato GIF, BMP, SVG ou AVIF são convertidas automaticamente para PNG.",
    "faq1Q": "Quais formatos de imagem posso rotacionar?",
    "faq1A": "Você pode rotacionar imagens PNG, JPG, WebP, GIF, BMP, SVG e AVIF. O formato de saída corresponde ao de entrada. Formatos de saída não suportados (GIF, BMP, SVG, AVIF) são salvos como PNG.",
    "faq2Q": "Minhas imagens são enviadas para um servidor?",
    "faq2A": "Não. Todo processamento de imagens acontece no seu navegador usando a API Canvas. Suas imagens nunca saem do seu dispositivo.",
    "faq3Q": "Posso combinar rotação e espelhamento?",
    "faq3A": "Sim. Você pode aplicar rotação (0°, 90°, 180°, 270°) e espelhamento (horizontal, vertical) ao mesmo tempo. O espelhamento é aplicado primeiro, depois a rotação."
  }
}
```

- [ ] **Step 5: Add `image-rotate` entry to `public/locales/fr/tools.json`**

After the `image-convert` block, add:

```json
  "image-rotate": {
    "title": "Rotation d'Images - Rotationner et Retourner des Images en Ligne",
    "shortTitle": "Rotation d'Images",
    "description": "Rotationnez les images de 90°, 180° ou 270° et retournez-les horizontalement ou verticalement. Supporte PNG, JPG, WebP. Tout le traitement s'effectue dans votre navigateur."
  },
```

- [ ] **Step 6: Create `public/locales/fr/image-rotate.json`**

```json
{
  "dropImage": "Déposez une image ici ou cliquez pour sélectionner",
  "supportedFormats": "Supporte PNG, JPG, WebP, AVIF, GIF, BMP, SVG",
  "rotate": "Rotation",
  "flipHorizontal": "Retourner horizontalement",
  "flipVertical": "Retourner verticalement",
  "reselect": "Resélectionner",
  "copyToClipboard": "Copier dans le presse-papiers",
  "copiedToClipboard": "Copié dans le presse-papiers en PNG",
  "original": "Original",
  "result": "Résultat",
  "processing": "Traitement en cours...",
  "encodingFailed": "Échec de l'encodage pour ce format",
  "firstFrameOnly": "Image animée — seule la première image est utilisée",
  "largeImage": "Image volumineuse ({w}×{h}) — le traitement peut être lent",
  "formatNotSupported": "Ce format d'image n'est pas supporté. Veuillez utiliser PNG, JPG, WebP, GIF, BMP ou SVG.",
  "descriptions": {
    "title": "À propos de l'outil Rotation d'Images",
    "aeoDefinition": "L'outil Rotation d'Images est un outil en ligne gratuit pour rotationner et retourner des images. Supporte la rotation de 90°, 180°, 270° et le retournement horizontal/vertical. Tout le traitement s'exécute localement dans votre navigateur.",
    "whatIsTitle": "Qu'est-ce que l'outil Rotation d'Images ?",
    "whatIs": "Rotationnez les images de 90°, 180° ou 270° et retournez-les horizontalement ou verticalement. Combinez rotation et retournement pour un positionnement précis. Aucune donnée n'est envoyée — tout le traitement utilise l'API Canvas HTML5.",
    "stepsTitle": "Comment rotationner une image",
    "step1Title": "Déposez ou sélectionnez une image",
    "step1Text": "Glissez-déposez une image dans la zone de dépôt, ou cliquez pour parcourir. Supporte PNG, JPG, WebP, GIF, BMP et SVG.",
    "step2Title": "Choisissez la rotation et le retournement",
    "step2Text": "Sélectionnez un angle de rotation (0°, 90°, 180°, 270°) et activez optionnellement le retournement horizontal ou vertical.",
    "step3Title": "Téléchargez l'image rotationnée",
    "step3Text": "Prévisualisez l'image rotationnée et téléchargez-la. Le format de sortie correspond au format d'entrée.",
    "p1": "Rotationnez et retournez les images de 90°, 180° ou 270° directement dans votre navigateur. Compressez les images rotationnées avec le [Compresseur d'Images](/image-compress), ou convertissez les formats avec le [Convertisseur d'Images](/image-convert).",
    "p2": "Supporte la sortie PNG, JPG et WebP. Les images en GIF, BMP, SVG ou AVIF sont automatiquement converties en PNG.",
    "faq1Q": "Quels formats d'image puis-je rotationner ?",
    "faq1A": "Vous pouvez rotationner les images PNG, JPG, WebP, GIF, BMP, SVG et AVIF. Le format de sortie correspond au format d'entrée. Les formats de sortie non supportés (GIF, BMP, SVG, AVIF) sont enregistrés en PNG.",
    "faq2Q": "Mes images sont-elles envoyées à un serveur ?",
    "faq2A": "Non. Tout le traitement des images s'effectue dans votre navigateur via l'API Canvas. Vos images ne quittent jamais votre appareil.",
    "faq3Q": "Puis-je combiner rotation et retournement ?",
    "faq3A": "Oui. Vous pouvez appliquer la rotation (0°, 90°, 180°, 270°) et le retournement (horizontal, vertical) en même temps. Le retournement est appliqué en premier, puis la rotation."
  }
}
```

- [ ] **Step 7: Add `image-rotate` entry to `public/locales/de/tools.json`**

After the `image-convert` block, add:

```json
  "image-rotate": {
    "title": "Bildrotierung - Bilder online drehen und spiegeln",
    "shortTitle": "Bilder drehen",
    "description": "Drehen Sie Bilder um 90°, 180° oder 270° und spiegeln Sie sie horizontal oder vertikal. Unterstützt PNG, JPG, WebP. Die gesamte Verarbeitung erfolgt in Ihrem Browser."
  },
```

- [ ] **Step 8: Create `public/locales/de/image-rotate.json`**

```json
{
  "dropImage": "Bild hierher ziehen oder klicken zum Auswählen",
  "supportedFormats": "Unterstützt PNG, JPG, WebP, AVIF, GIF, BMP, SVG",
  "rotate": "Drehen",
  "flipHorizontal": "Horizontal spiegeln",
  "flipVertical": "Vertikal spiegeln",
  "reselect": "Neu auswählen",
  "copyToClipboard": "In die Zwischenablage kopieren",
  "copiedToClipboard": "Als PNG in die Zwischenablage kopiert",
  "original": "Original",
  "result": "Ergebnis",
  "processing": "Verarbeitung...",
  "encodingFailed": "Kodierung für dieses Format fehlgeschlagen",
  "firstFrameOnly": "Animiertes Bild — nur das erste Frame wird verwendet",
  "largeImage": "Großes Bild ({w}×{h}) — die Verarbeitung kann langsam sein",
  "formatNotSupported": "Dieses Bildformat wird nicht unterstützt. Bitte verwenden Sie PNG, JPG, WebP, GIF, BMP oder SVG.",
  "descriptions": {
    "title": "Über das Bildrotierungstool",
    "aeoDefinition": "Das Bildrotierungstool ist ein kostenloses Online-Tool zum Drehen und Spiegeln von Bildern. Unterstützt 90°-, 180°-, 270°-Drehung und horizontale/vertikale Spiegelung. Die gesamte Verarbeitung erfolgt lokal in Ihrem Browser.",
    "whatIsTitle": "Was ist das Bildrotierungstool?",
    "whatIs": "Drehen Sie Bilder um 90°, 180° oder 270° und spiegeln Sie sie horizontal oder vertikal. Kombinieren Sie Drehung und Spiegelung für eine präzise Bildausrichtung. Kein Datenupload — die gesamte Verarbeitung verwendet die HTML5 Canvas-API.",
    "stepsTitle": "So drehen Sie ein Bild",
    "step1Title": "Bild ablegen oder auswählen",
    "step1Text": "Ziehen Sie ein Bild in die Ablagezone oder klicken Sie zum Durchsuchen. Unterstützt PNG, JPG, WebP, GIF, BMP und SVG.",
    "step2Title": "Drehung und Spiegelung wählen",
    "step2Text": "Wählen Sie einen Drehwinkel (0°, 90°, 180°, 270°) und schalten Sie optional horizontale oder vertikale Spiegelung um.",
    "step3Title": "Gedrehtes Bild herunterladen",
    "step3Text": "Zeigen Sie eine Vorschau des gedrehten Bildes an und laden Sie es herunter. Das Ausgabeformat entspricht dem Eingabeformat.",
    "p1": "Drehen und spiegeln Sie Bilder um 90°, 180° oder 270° direkt in Ihrem Browser. Komprimieren Sie gedrehte Bilder mit dem [Bildkompressor](/image-compress) oder konvertieren Sie Formate mit dem [Bildkonverter](/image-convert).",
    "p2": "Unterstützt PNG-, JPG- und WebP-Ausgabe. Bilder in GIF-, BMP-, SVG- oder AVIF-Format werden automatisch in PNG konvertiert.",
    "faq1Q": "Welche Bildformate kann ich drehen?",
    "faq1A": "Sie können PNG-, JPG-, WebP-, GIF-, BMP-, SVG- und AVIF-Bilder drehen. Das Ausgabeformat entspricht dem Eingabeformat. Nicht unterstützte Ausgabeformate (GIF, BMP, SVG, AVIF) werden als PNG gespeichert.",
    "faq2Q": "Werden meine Bilder auf einen Server hochgeladen?",
    "faq2A": "Nein. Die gesamte Bildverarbeitung erfolgt in Ihrem Browser über die Canvas-API. Ihre Bilder verlassen niemals Ihr Gerät.",
    "faq3Q": "Kann ich Drehung und Spiegelung kombinieren?",
    "faq3A": "Ja. Sie können gleichzeitig Drehung (0°, 90°, 180°, 270°) und Spiegelung (horizontal, vertikal) anwenden. Die Spiegelung wird zuerst angewendet, dann die Drehung."
  }
}
```

- [ ] **Step 9: Add `image-rotate` entry to `public/locales/ru/tools.json`**

After the `image-convert` block, add:

```json
  "image-rotate": {
    "title": "Поворот изображений - Повернуть и отразить изображения онлайн",
    "shortTitle": "Поворот изображений",
    "description": "Поворачивайте изображения на 90°, 180° или 270° и отражайте по горизонтали или вертикали. Поддерживает PNG, JPG, WebP. Вся обработка выполняется в браузере."
  },
```

- [ ] **Step 10: Create `public/locales/ru/image-rotate.json`**

```json
{
  "dropImage": "Перетащите изображение сюда или нажмите для выбора",
  "supportedFormats": "Поддерживает PNG, JPG, WebP, AVIF, GIF, BMP, SVG",
  "rotate": "Повернуть",
  "flipHorizontal": "Отразить по горизонтали",
  "flipVertical": "Отразить по вертикали",
  "reselect": "Выбрать другое",
  "copyToClipboard": "Копировать в буфер обмена",
  "copiedToClipboard": "Скопировано в буфер обмена как PNG",
  "original": "Оригинал",
  "result": "Результат",
  "processing": "Обработка...",
  "encodingFailed": "Ошибка кодирования для этого формата",
  "firstFrameOnly": "Анимированное изображение — используется только первый кадр",
  "largeImage": "Большое изображение ({w}×{h}) — обработка может быть медленной",
  "formatNotSupported": "Этот формат изображения не поддерживается. Используйте PNG, JPG, WebP, GIF, BMP или SVG.",
  "descriptions": {
    "title": "О инструменте поворота изображений",
    "aeoDefinition": "Инструмент поворота изображений — бесплатный онлайн-инструмент для поворота и отражения изображений. Поддерживает поворот на 90°, 180°, 270° и отражение по горизонтали/вертикали. Вся обработка выполняется локально в вашем браузере.",
    "whatIsTitle": "Что такое инструмент поворота изображений?",
    "whatIs": "Поворачивайте изображения на 90°, 180° или 270° и отражайте по горизонтали или вертикали. Комбинируйте поворот и отражение для точной ориентации изображения. Данные не отправляются — вся обработка использует HTML5 Canvas API.",
    "stepsTitle": "Как повернуть изображение",
    "step1Title": "Перетащите или выберите изображение",
    "step1Text": "Перетащите изображение в зону загрузки или нажмите для выбора. Поддерживает PNG, JPG, WebP, GIF, BMP и SVG.",
    "step2Title": "Выберите поворот и отражение",
    "step2Text": "Выберите угол поворота (0°, 90°, 180°, 270°) и при необходимости включите отражение по горизонтали или вертикали.",
    "step3Title": "Скачайте повёрнутое изображение",
    "step3Text": "Просмотрите повёрнутое изображение и скачайте его. Формат вывода соответствует формату ввода.",
    "p1": "Поворачивайте и отражайте изображения на 90°, 180° или 270° прямо в браузере. Сожмите повёрнутые изображения с помощью [Сжатия изображений](/image-compress) или конвертируйте форматы с помощью [Конвертера изображений](/image-convert).",
    "p2": "Поддерживает вывод в PNG, JPG и WebP. Изображения в формате GIF, BMP, SVG или AVIF автоматически конвертируются в PNG.",
    "faq1Q": "Какие форматы изображений можно повернуть?",
    "faq1A": "Можно повернуть изображения PNG, JPG, WebP, GIF, BMP, SVG и AVIF. Формат вывода соответствует формату ввода. Неподдерживаемые форматы вывода (GIF, BMP, SVG, AVIF) сохраняются как PNG.",
    "faq2Q": "Загружаются ли мои изображения на сервер?",
    "faq2A": "Нет. Вся обработка изображений выполняется в браузере с использованием Canvas API. Ваши изображения никогда не покидают ваше устройство.",
    "faq3Q": "Можно ли комбинировать поворот и отражение?",
    "faq3A": "Да. Можно одновременно применить поворот (0°, 90°, 180°, 270°) и отражение (горизонтальное, вертикальное). Сначала применяется отражение, затем поворот."
  }
}
```

- [ ] **Step 11: Commit**

```bash
git add public/locales/es/ public/locales/pt-BR/ public/locales/fr/ public/locales/de/ public/locales/ru/
git commit -m "feat(image-rotate): add Latin i18n strings (es, pt-BR, fr, de, ru)"
```

---

## Task 5: Route Entry Page (`page.tsx`)

**Files:**

- Create: `app/[locale]/image-rotate/page.tsx`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p app/\[locale\]/image-rotate
```

- [ ] **Step 2: Create `app/[locale]/image-rotate/page.tsx`**

This follows the exact pattern from `app/[locale]/image-resize/page.tsx`:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import ImageRotatePage from "./image-rotate-page";

const PATH = "/image-rotate";
const TOOL_KEY = "image-rotate";
const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("image-rotate.title"),
    description: t("image-rotate.description"),
    ogImage: { type: "tool", key: TOOL_KEY },
  });
}

export default async function ImageRotateRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "image-rotate" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("image-rotate.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("image-rotate.description"),
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
      <ImageRotatePage />
    </>
  );
}
```

- [ ] **Step 3: Verify no type errors in the new file**

Run: `npx tsc --noEmit --pretty 2>&1 | grep -i "image-rotate" | head -10`

Expected: No errors (there may be an import error for `image-rotate-page` since it doesn't exist yet — that's expected and will be fixed in Task 6).

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/image-rotate/page.tsx
git commit -m "feat(image-rotate): add route entry with SEO metadata and JSON-LD"
```

---

## Task 6: Client Component — Main Page (`image-rotate-page.tsx`)

**Files:**

- Create: `app/[locale]/image-rotate/image-rotate-page.tsx`

This is the core implementation. It follows the `image-resize-page.tsx` pattern but replaces resize controls with rotation/flip controls and uses Canvas transforms instead of `encode()`.

- [ ] **Step 1: Create `app/[locale]/image-rotate/image-rotate-page.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import PrivacyBanner from "../../../components/privacy-banner";
import DescriptionSection from "../../../components/description-section";
import RelatedTools from "../../../components/related-tools";
import { Download, Clipboard, RefreshCw, FlipHorizontal2, FlipVertical2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { OutputFormat } from "../../../libs/image/types";
import { resolveOutputFormat, formatKeyFromMime } from "../../../libs/image/types";
import { useImageInput } from "../../../components/image/useImageInput";
import { useImageExport } from "../../../components/image/useImageExport";
import ImageDropZone from "../../../components/image/ImageDropZone";
import ImageInfoBar from "../../../components/image/ImageInfoBar";

function Conversion() {
  const t = useTranslations("image-rotate");
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
  const [rotation, setRotation] = useState(0); // 0 | 90 | 180 | 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Encode pipeline refs (same pattern as image-resize)
  const stalenessId = useRef(0);
  const prevBlobUrlRef = useRef<string | null>(null);
  const initialLoadRef = useRef(true);

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
          const bitmap = sourceBitmap;
          const swapped = rotation === 90 || rotation === 270;
          const canvasW = swapped ? bitmap.height : bitmap.width;
          const canvasH = swapped ? bitmap.width : bitmap.height;

          const canvas = document.createElement("canvas");
          canvas.width = canvasW;
          canvas.height = canvasH;
          const ctx = canvas.getContext("2d")!;

          // JPEG: fill white background (no alpha support)
          if (outputFormat === "jpeg") {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvasW, canvasH);
          }

          // Canvas transforms execute bottom-up: scale → rotate → translate
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

          // Cleanup previous preview URL
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

  // Reselect handler
  function onReselect() {
    handleReselect();
    setResultBlob(null);
    setPreviewUrl(null);
    setProcessing(false);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    initialLoadRef.current = true;
  }

  // Transformed dimensions for preview and ImageInfoBar
  const swapped = rotation === 90 || rotation === 270;
  const previewW = sourceBitmap ? (swapped ? sourceBitmap.height : sourceBitmap.width) : 0;
  const previewH = sourceBitmap ? (swapped ? sourceBitmap.width : sourceBitmap.height) : 0;

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

  const rotationAngles = [0, 90, 180, 270] as const;

  return (
    <section className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Controls panel */}
        <div className="flex flex-col gap-4">
          {/* Rotation angle */}
          <div>
            <label className="block text-sm font-medium text-fg-secondary mb-2">
              {t("rotate")}
            </label>
            <div className="grid grid-cols-4 gap-1">
              {rotationAngles.map((angle) => (
                <button
                  key={angle}
                  type="button"
                  className={`px-2 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                    rotation === angle
                      ? "bg-accent-cyan text-bg-base"
                      : "border border-border-default text-fg-muted hover:text-fg-secondary hover:border-fg-muted"
                  }`}
                  onClick={() => setRotation(angle)}
                >
                  {angle}°
                </button>
              ))}
            </div>
          </div>

          {/* Flip toggles */}
          <div>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                className={`flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                  flipH
                    ? "bg-accent-cyan text-bg-base"
                    : "border border-border-default text-fg-muted hover:text-fg-secondary hover:border-fg-muted"
                }`}
                onClick={() => setFlipH(!flipH)}
              >
                <FlipHorizontal2 size={14} />
                {t("flipHorizontal")}
              </button>
              <button
                type="button"
                className={`flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                  flipV
                    ? "bg-accent-cyan text-bg-base"
                    : "border border-border-default text-fg-muted hover:text-fg-secondary hover:border-fg-muted"
                }`}
                onClick={() => setFlipV(!flipV)}
              >
                <FlipVertical2 size={14} />
                {t("flipVertical")}
              </button>
            </div>
          </div>

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
              aspectRatio: `${previewW} / ${previewH}`,
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
                dimensions: { width: previewW, height: previewH },
              }}
              savedPercent={savedPercent}
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default function ImageRotatePage() {
  const t = useTranslations("tools");
  return (
    <Layout
      title={t("image-rotate.shortTitle")}
      categoryLabel={t("categories.visual")}
      categorySlug="visual-media"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner variant="files" />
        <Conversion />
        <DescriptionSection namespace="image-rotate" />
        <RelatedTools currentTool="image-rotate" />
      </div>
    </Layout>
  );
}
```

- [ ] **Step 2: Verify the build compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`

Expected: No errors. Both `page.tsx` and `image-rotate-page.tsx` should be error-free.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/image-rotate/image-rotate-page.tsx
git commit -m "feat(image-rotate): add page component with rotation and flip logic"
```

---

## Task 7: Final Verification

- [ ] **Step 1: Run TypeScript check on the entire project**

Run: `npx tsc --noEmit --pretty 2>&1 | tail -20`

Expected: No errors.

- [ ] **Step 2: Run ESLint on new files**

Run: `npx eslint "app/[locale]/image-rotate/**" --max-warnings=0`

Expected: No warnings or errors.

- [ ] **Step 3: Run the dev server and verify the page loads**

Run: `npm run dev`

Then open `http://localhost:3000/image-rotate` and verify:

1. Drop zone renders with correct text
2. Upload an image → preview shows at 0° rotation
3. Click 90° → preview swaps dimensions, image rotates
4. Click 180° → image flips upside down
5. Click 270° → preview swaps dimensions, image rotates
6. Toggle horizontal flip → image mirrors left-right
7. Toggle vertical flip → image mirrors top-bottom
8. Combine rotation + flip → both transforms apply
9. Download button works → file has correct extension
10. Copy to clipboard works
11. Reselect resets all state
12. ImageInfoBar shows correct original/result dimensions
13. JPEG images have white background (no transparent corners after rotation)
14. Description section renders with FAQ
15. Related tools section shows image-resize, image-compress, image-convert

- [ ] **Step 4: Verify tool appears in navigation**

1. Open the Tools Drawer (search icon)
2. Search "rotate" → image-rotate should appear
3. Open `/visual-media` category page → image-rotate should be listed last

- [ ] **Step 5: Commit any fixes if needed**

```bash
git add -A
git commit -m "fix(image-rotate): address verification findings"
```
