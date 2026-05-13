# Recipe Page i18n Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all hardcoded/untranslated English strings in the Recipe page and add a DescriptionSection.

**Architecture:** Pure i18n fix — add missing translation keys to all 10 locale files, then update 4 component files to use `t()` calls instead of hardcoded strings. No structural changes.

**Tech Stack:** next-intl (useTranslations), existing recipe.json locale files

---

## File Structure

| File                                  | Change | Purpose                                                           |
| ------------------------------------- | ------ | ----------------------------------------------------------------- |
| `public/locales/en/recipe.json`       | Modify | Add toast, ago, descriptions, download, searchSteps, options keys |
| `public/locales/zh-CN/recipe.json`    | Modify | Same keys, zh-CN translations                                     |
| `public/locales/zh-TW/recipe.json`    | Modify | Same keys, zh-TW translations                                     |
| `public/locales/ja/recipe.json`       | Modify | Same keys, ja translations                                        |
| `public/locales/ko/recipe.json`       | Modify | Same keys, ko translations                                        |
| `public/locales/es/recipe.json`       | Modify | Same keys, es translations                                        |
| `public/locales/pt-BR/recipe.json`    | Modify | Same keys, pt-BR translations                                     |
| `public/locales/fr/recipe.json`       | Modify | Same keys, fr translations                                        |
| `public/locales/de/recipe.json`       | Modify | Same keys, de translations                                        |
| `public/locales/ru/recipe.json`       | Modify | Same keys, ru translations                                        |
| `components/recipe/step-picker.tsx`   | Modify | Use `t("steps.${def.id}.desc")` and `t("searchSteps")`            |
| `components/recipe/recipe-panel.tsx`  | Modify | Localize toast, formatRelativeTime, download filenames            |
| `components/recipe/step-card.tsx`     | Modify | Localize select option labels via `t.has()`                       |
| `app/[locale]/recipe/recipe-page.tsx` | Modify | Add DescriptionSection component                                  |

---

### Task 1: Add missing i18n keys to English recipe.json

**Files:**

- Modify: `public/locales/en/recipe.json`

- [ ] **Step 1: Add all missing keys to en/recipe.json**

Add these keys to the existing JSON. The new keys go inside the existing `options` object, and new top-level keys are added at the end (before the closing `}`).

The complete file should be:

```json
{
  "title": "Recipe",
  "input": "Input",
  "output": "Output",
  "addStep": "Add Step",
  "save": "Save",
  "delete": "Delete",
  "untitled": "Untitled Recipe",
  "expandAll": "Expand All",
  "collapseAll": "Collapse All",
  "disabled": "Step disabled — skipped in recipe",
  "waitingInput": "Waiting for input...",
  "computing": "Computing...",
  "addStepsToBuild": "Add steps to build your recipe",
  "guideInput": "Enter text or drop a file in the input area",
  "guideAddStep": "Click \"Add Step\" to chain processing steps",
  "guideOutput": "Final output appears here in real time",
  "noOutputYet": "No output yet",
  "sourceStepOnlyAtStart": "Source steps can only be placed at the beginning",
  "typeMismatch": "Expected {expected} input, but received {received} output",
  "dropImageHere": "Drop image here or click to select",
  "dropFileHere": "Drop file here",
  "dropTextOrImage": "Drop text or image file",
  "uploadFile": "Upload",
  "noInputNeeded": "No input needed — source steps generate data",
  "searchSteps": "Search steps...",
  "toast": {
    "enterName": "Please enter a name",
    "noSteps": "No steps to save",
    "saved": "Recipe saved"
  },
  "ago": {
    "seconds": "{count}s ago",
    "minutes": "{count}m ago",
    "hours": "{count}h ago",
    "days": "{count}d ago"
  },
  "downloadImageName": "recipe-output.png",
  "downloadTextName": "recipe-output.txt",
  "categories": {
    "encoding": "Encoding",
    "crypto": "Crypto",
    "text": "Text",
    "format": "Format",
    "generators": "Generators",
    "visual": "Visual"
  },
  "steps": {
    "base64-encode": { "name": "Base64 Encode", "desc": "Encode text to Base64" },
    "base64-decode": { "name": "Base64 Decode", "desc": "Decode Base64 to text" },
    "url-encode-component": { "name": "URL Encode (Component)", "desc": "Encode URL component" },
    "url-decode-component": { "name": "URL Decode (Component)", "desc": "Decode URL component" },
    "url-encode-full": { "name": "URL Encode (Full)", "desc": "Encode full URL" },
    "url-decode-full": { "name": "URL Decode (Full)", "desc": "Decode full URL" },
    "hash-md5": { "name": "MD5 Hash", "desc": "Generate MD5 hash" },
    "hash-sha1": { "name": "SHA-1 Hash", "desc": "Generate SHA-1 hash" },
    "hash-sha256": { "name": "SHA-256 Hash", "desc": "Generate SHA-256 hash" },
    "hash-sha512": { "name": "SHA-512 Hash", "desc": "Generate SHA-512 hash" },
    "aes-encrypt": { "name": "AES Encrypt", "desc": "Encrypt text with AES" },
    "aes-decrypt": { "name": "AES Decrypt", "desc": "Decrypt AES-encrypted text" },
    "hmac-sha256": { "name": "HMAC-SHA256", "desc": "Generate HMAC-SHA256 signature" },
    "password-gen": { "name": "Password Generator", "desc": "Generate a secure password" },
    "text-camel": { "name": "camelCase", "desc": "Convert to camelCase" },
    "text-pascal": { "name": "PascalCase", "desc": "Convert to PascalCase" },
    "text-snake": { "name": "snake_case", "desc": "Convert to snake_case" },
    "text-kebab": { "name": "kebab-case", "desc": "Convert to kebab-case" },
    "text-upper": { "name": "UPPERCASE", "desc": "Convert to uppercase" },
    "text-lower": { "name": "lowercase", "desc": "Convert to lowercase" },
    "regex-replace": { "name": "Regex Replace", "desc": "Find and replace using regex" },
    "dedup-lines": { "name": "Remove Duplicate Lines", "desc": "Remove duplicate lines from text" },
    "extract-emails": { "name": "Extract Emails", "desc": "Extract email addresses from text" },
    "extract-urls": { "name": "Extract URLs", "desc": "Extract URLs from text" },
    "json-format": { "name": "JSON Format", "desc": "Format and beautify JSON" },
    "json-minify": { "name": "JSON Minify", "desc": "Minify JSON to compact form" },
    "json-yaml": { "name": "JSON → YAML", "desc": "Convert JSON to YAML" },
    "yaml-json": { "name": "YAML → JSON", "desc": "Convert YAML to JSON" },
    "json-ts": { "name": "JSON → TypeScript", "desc": "Generate TypeScript interfaces from JSON" },
    "json-csv": { "name": "JSON → CSV", "desc": "Convert JSON to CSV" },
    "csv-json": { "name": "CSV → JSON", "desc": "Convert CSV to JSON" },
    "sql-format": { "name": "SQL Format", "desc": "Format SQL query" },
    "sql-minify": { "name": "SQL Minify", "desc": "Minify SQL query" },
    "uuid-gen": { "name": "UUID Generator", "desc": "Generate UUID v4 or v7" },
    "qrcode-gen": { "name": "QR Code Generator", "desc": "Generate QR code from text" },
    "image-compress": { "name": "Image Compress", "desc": "Compress and resize images" }
  },
  "params": {
    "key": "Key",
    "length": "Length",
    "pattern": "Pattern",
    "replacement": "Replacement",
    "indent": "Indent",
    "delimiter": "Delimiter",
    "dialect": "Dialect",
    "quality": "Quality",
    "size": "Size",
    "errorLevel": "Error Correction",
    "format": "Format",
    "version": "Version",
    "count": "Count",
    "caseSensitive": "Case Sensitive",
    "trimWhitespace": "Trim Whitespace",
    "flags": "Flags",
    "rootName": "Root Name",
    "maxWidth": "Max Width",
    "maxHeight": "Max Height",
    "uppercase": "Uppercase (A-Z)",
    "lowercase": "Lowercase (a-z)",
    "numbers": "Numbers (0-9)",
    "symbols": "Symbols (!@#)"
  },
  "options": {
    "yes": "Yes",
    "no": "No",
    "none": "None",
    "byPercent": "By Percent",
    "custom": "Custom",
    "lowL": "Low (L)",
    "mediumM": "Medium (M)",
    "quartileQ": "Quartile (Q)",
    "highH": "High (H)",
    "uuidV4": "UUID v4",
    "uuidV7": "UUID v7",
    "size300": "300 × 300",
    "size600": "600 × 600",
    "size1024": "1024 × 1024"
  },
  "descriptions": {
    "aeoDefinition": "Recipe is a free online visual pipeline builder that chains developer tools together — encode, hash, format, transform text, and generate data — all in one automated workflow that runs entirely in your browser.",
    "whatIsTitle": "What is Recipe?",
    "whatIsP1": "Recipe is a visual pipeline builder that lets you chain multiple processing steps together. Feed in text or an image, add steps like Base64 encode, SHA-256 hash, JSON format, or image compress, and see the output update in real time.",
    "whatIsP2": "Each step's output becomes the next step's input. You can save and reload entire pipelines as reusable recipes — perfect for repetitive multi-step workflows.",
    "useCasesTitle": "Common Use Cases",
    "useCasesP1": "Build data processing pipelines: encode text to Base64, hash it with SHA-256, and format the result in one flow.",
    "useCasesP2": "Chain text transformations: convert to lowercase, remove duplicate lines, then extract all URLs from the result.",
    "useCasesP3": "Automate image workflows: resize, compress, and convert image formats through a single recipe.",
    "stepsTitle": "How to Build a Recipe",
    "step1Title": "Add your input",
    "step1Text": "Enter text or drag and drop a file (including images) into the input area.",
    "step2Title": "Chain processing steps",
    "step2Text": "Click \"Add Step\" to add processing steps. Each step transforms the output of the previous one.",
    "step3Title": "Save and reuse",
    "step3Text": "Save your pipeline as a recipe. Load it later to run the same workflow on new data.",
    "faq1Q": "What is a Recipe pipeline?",
    "faq1A": "A recipe is a sequence of processing steps chained together. Each step takes the output of the previous step as its input, transforming data progressively. You can add, remove, reorder, and disable steps freely.",
    "faq2Q": "What types of data can I process?",
    "faq2A": "Recipes support text and image data. Steps are automatically filtered based on compatibility — for example, image compression only accepts image input and outputs an image.",
    "faq3Q": "Is my data sent to any server?",
    "faq3A": "No. All processing runs entirely in your browser using client-side JavaScript. No data is ever sent to a server. Saved recipes are stored in your browser's localStorage."
  },
  "sendToRecipe": "Send to Recipe",
  "savedRecipes": "Saved Recipes",
  "stepsCount": "{count} steps",
  "replace": "Replace",
  "append": "Append"
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `python3 -c "import json; json.load(open('public/locales/en/recipe.json')); print('OK')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add public/locales/en/recipe.json
git commit -m "feat(recipe): add missing i18n keys to en/recipe.json"
```

---

### Task 2: Add missing i18n keys to zh-CN recipe.json

**Files:**

- Modify: `public/locales/zh-CN/recipe.json`

- [ ] **Step 1: Add all missing keys to zh-CN/recipe.json**

The complete file should be:

```json
{
  "title": "Recipe",
  "input": "输入",
  "output": "输出",
  "addStep": "添加步骤",
  "save": "保存",
  "delete": "删除",
  "untitled": "未命名 Recipe",
  "expandAll": "全部展开",
  "collapseAll": "全部折叠",
  "disabled": "步骤已禁用 — 将在配方中跳过",
  "waitingInput": "等待输入...",
  "computing": "计算中...",
  "addStepsToBuild": "添加步骤来构建你的配方",
  "guideInput": "在输入区输入文本或拖放文件",
  "guideAddStep": "点击「添加步骤」串联处理步骤",
  "guideOutput": "最终输出将实时显示在这里",
  "noOutputYet": "暂无输出",
  "sourceStepOnlyAtStart": "源步骤只能放在开头",
  "typeMismatch": "需要 {expected} 输入，但收到 {received} 输出",
  "dropImageHere": "拖放图片到此处或点击选择",
  "dropFileHere": "拖放文件到此处",
  "dropTextOrImage": "拖放文本或图片文件",
  "uploadFile": "上传",
  "noInputNeeded": "无需输入 — 源步骤会自动生成数据",
  "searchSteps": "搜索步骤...",
  "toast": {
    "enterName": "请输入名称",
    "noSteps": "没有可保存的步骤",
    "saved": "Recipe 已保存"
  },
  "ago": {
    "seconds": "{count}秒前",
    "minutes": "{count}分钟前",
    "hours": "{count}小时前",
    "days": "{count}天前"
  },
  "downloadImageName": "recipe-output.png",
  "downloadTextName": "recipe-output.txt",
  "categories": {
    "encoding": "编码",
    "crypto": "加密",
    "text": "文本",
    "format": "格式化",
    "generators": "生成器",
    "visual": "图像"
  },
  "steps": {
    "base64-encode": { "name": "Base64 编码", "desc": "将文本编码为 Base64" },
    "base64-decode": { "name": "Base64 解码", "desc": "将 Base64 解码为文本" },
    "url-encode-component": { "name": "URL 编码（组件）", "desc": "编码 URL 组件" },
    "url-decode-component": { "name": "URL 解码（组件）", "desc": "解码 URL 组件" },
    "url-encode-full": { "name": "URL 编码（完整）", "desc": "编码完整 URL" },
    "url-decode-full": { "name": "URL 解码（完整）", "desc": "解码完整 URL" },
    "hash-md5": { "name": "MD5 哈希", "desc": "生成 MD5 哈希值" },
    "hash-sha1": { "name": "SHA-1 哈希", "desc": "生成 SHA-1 哈希值" },
    "hash-sha256": { "name": "SHA-256 哈希", "desc": "生成 SHA-256 哈希值" },
    "hash-sha512": { "name": "SHA-512 哈希", "desc": "生成 SHA-512 哈希值" },
    "aes-encrypt": { "name": "AES 加密", "desc": "使用 AES 加密文本" },
    "aes-decrypt": { "name": "AES 解密", "desc": "解密 AES 加密的文本" },
    "hmac-sha256": { "name": "HMAC-SHA256", "desc": "生成 HMAC-SHA256 签名" },
    "password-gen": { "name": "密码生成器", "desc": "生成安全密码" },
    "text-camel": { "name": "camelCase", "desc": "转换为驼峰命名" },
    "text-pascal": { "name": "PascalCase", "desc": "转换为帕斯卡命名" },
    "text-snake": { "name": "snake_case", "desc": "转换为下划线命名" },
    "text-kebab": { "name": "kebab-case", "desc": "转换为短横线命名" },
    "text-upper": { "name": "大写", "desc": "转换为大写" },
    "text-lower": { "name": "小写", "desc": "转换为小写" },
    "regex-replace": { "name": "正则替换", "desc": "使用正则表达式查找替换" },
    "dedup-lines": { "name": "去除重复行", "desc": "移除文本中的重复行" },
    "extract-emails": { "name": "提取邮箱", "desc": "从文本中提取邮箱地址" },
    "extract-urls": { "name": "提取 URL", "desc": "从文本中提取 URL" },
    "json-format": { "name": "JSON 格式化", "desc": "格式化美化 JSON" },
    "json-minify": { "name": "JSON 压缩", "desc": "压缩 JSON 为紧凑格式" },
    "json-yaml": { "name": "JSON → YAML", "desc": "将 JSON 转换为 YAML" },
    "yaml-json": { "name": "YAML → JSON", "desc": "将 YAML 转换为 JSON" },
    "json-ts": { "name": "JSON → TypeScript", "desc": "从 JSON 生成 TypeScript 接口" },
    "json-csv": { "name": "JSON → CSV", "desc": "将 JSON 转换为 CSV" },
    "csv-json": { "name": "CSV → JSON", "desc": "将 CSV 转换为 JSON" },
    "sql-format": { "name": "SQL 格式化", "desc": "格式化 SQL 查询" },
    "sql-minify": { "name": "SQL 压缩", "desc": "压缩 SQL 查询" },
    "uuid-gen": { "name": "UUID 生成器", "desc": "生成 UUID v4 或 v7" },
    "qrcode-gen": { "name": "二维码生成器", "desc": "从文本生成二维码" },
    "image-compress": { "name": "图片压缩", "desc": "压缩和调整图片大小" }
  },
  "params": {
    "key": "密钥",
    "length": "长度",
    "pattern": "模式",
    "replacement": "替换",
    "indent": "缩进",
    "delimiter": "分隔符",
    "dialect": "方言",
    "quality": "质量",
    "size": "尺寸",
    "errorLevel": "纠错等级",
    "format": "格式",
    "version": "版本",
    "count": "数量",
    "caseSensitive": "区分大小写",
    "trimWhitespace": "去除空白",
    "flags": "标志",
    "rootName": "根名称",
    "maxWidth": "最大宽度",
    "maxHeight": "最大高度",
    "uppercase": "大写字母 (A-Z)",
    "lowercase": "小写字母 (a-z)",
    "numbers": "数字 (0-9)",
    "symbols": "符号 (!@#)"
  },
  "options": {
    "yes": "是",
    "no": "否",
    "none": "无",
    "byPercent": "按百分比",
    "custom": "自定义",
    "lowL": "低 (L)",
    "mediumM": "中 (M)",
    "quartileQ": "较高 (Q)",
    "highH": "高 (H)",
    "uuidV4": "UUID v4",
    "uuidV7": "UUID v7",
    "size300": "300 × 300",
    "size600": "600 × 600",
    "size1024": "1024 × 1024"
  },
  "descriptions": {
    "aeoDefinition": "Recipe 是一个免费的可视化流水线构建工具，可以将编码、哈希、格式化、文本转换和图像处理等开发者工具串联成自动化工作流，全部在浏览器中运行。",
    "whatIsTitle": "什么是 Recipe？",
    "whatIsP1": "Recipe 是一个可视化流水线构建器，允许你将多个处理步骤串联在一起。输入文本或图片，添加 Base64 编码、SHA-256 哈希、JSON 格式化或图片压缩等步骤，即可实时查看输出结果。",
    "whatIsP2": "每个步骤的输出会成为下一个步骤的输入。你可以将整个流水线保存为可复用的配方，非常适合重复性的多步骤工作流。",
    "useCasesTitle": "常见用例",
    "useCasesP1": "构建数据处理流水线：将文本编码为 Base64、用 SHA-256 哈希、然后格式化结果，一步到位。",
    "useCasesP2": "串联文本转换：先转小写、再去重行、最后提取所有 URL。",
    "useCasesP3": "自动化图像处理：通过一个配方完成图片调整大小、压缩和格式转换。",
    "stepsTitle": "如何构建 Recipe",
    "step1Title": "添加输入",
    "step1Text": "在输入区输入文本或拖放文件（包括图片）。",
    "step2Title": "串联处理步骤",
    "step2Text": "点击「添加步骤」添加处理步骤。每个步骤会转换上一步的输出。",
    "step3Title": "保存和复用",
    "step3Text": "将流水线保存为配方，以后可以对新数据运行相同的工作流。",
    "faq1Q": "什么是 Recipe 流水线？",
    "faq1A": "Recipe 是一系列串联的处理步骤。每个步骤将上一步的输出作为输入，逐步转换数据。你可以自由添加、删除、重排和禁用步骤。",
    "faq2Q": "支持哪些数据类型？",
    "faq2A": "Recipe 支持文本和图片数据。步骤会根据兼容性自动过滤——例如图片压缩只接受图片输入并输出图片。",
    "faq3Q": "我的数据会发送到服务器吗？",
    "faq3A": "不会。所有处理都在浏览器中使用客户端 JavaScript 运行，数据不会发送到任何服务器。保存的配方存储在浏览器的 localStorage 中。"
  },
  "sendToRecipe": "发送到 Recipe",
  "savedRecipes": "已保存的 Recipe",
  "stepsCount": "{count} 个步骤",
  "replace": "替换",
  "append": "追加"
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `python3 -c "import json; json.load(open('public/locales/zh-CN/recipe.json')); print('OK')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add public/locales/zh-CN/recipe.json
git commit -m "feat(recipe): add missing i18n keys to zh-CN/recipe.json"
```

---

### Task 3: Add missing i18n keys to zh-TW recipe.json

**Files:**

- Modify: `public/locales/zh-TW/recipe.json`

- [ ] **Step 1: Add all missing keys to zh-TW/recipe.json**

The complete file should be:

```json
{
  "title": "Recipe",
  "input": "輸入",
  "output": "輸出",
  "addStep": "新增步驟",
  "save": "儲存",
  "delete": "刪除",
  "untitled": "未命名 Recipe",
  "expandAll": "全部展開",
  "collapseAll": "全部收合",
  "disabled": "步驟已停用 — 將在配方中跳過",
  "waitingInput": "等待輸入...",
  "computing": "計算中...",
  "addStepsToBuild": "新增步驟來建構你的配方",
  "guideInput": "在輸入區輸入文字或拖放檔案",
  "guideAddStep": "點擊「新增步驟」串聯處理步驟",
  "guideOutput": "最終輸出將即時顯示在這裡",
  "noOutputYet": "尚無輸出",
  "sourceStepOnlyAtStart": "來源步驟只能放在開頭",
  "typeMismatch": "需要 {expected} 輸入，但收到 {received} 輸出",
  "dropImageHere": "拖放圖片到此處或點擊選擇",
  "dropFileHere": "拖放檔案到此處",
  "dropTextOrImage": "拖放文字或圖片檔案",
  "uploadFile": "上傳",
  "noInputNeeded": "無需輸入 — 來源步驟會自動產生資料",
  "searchSteps": "搜尋步驟...",
  "toast": {
    "enterName": "請輸入名稱",
    "noSteps": "沒有可儲存的步驟",
    "saved": "Recipe 已儲存"
  },
  "ago": {
    "seconds": "{count}秒前",
    "minutes": "{count}分鐘前",
    "hours": "{count}小時前",
    "days": "{count}天前"
  },
  "downloadImageName": "recipe-output.png",
  "downloadTextName": "recipe-output.txt",
  "categories": {
    "encoding": "編碼",
    "crypto": "加密",
    "text": "文字",
    "format": "格式化",
    "generators": "產生器",
    "visual": "圖像"
  },
  "steps": {
    "base64-encode": { "name": "Base64 編碼", "desc": "將文字編碼為 Base64" },
    "base64-decode": { "name": "Base64 解碼", "desc": "將 Base64 解碼為文字" },
    "url-encode-component": { "name": "URL 編碼（元件）", "desc": "編碼 URL 元件" },
    "url-decode-component": { "name": "URL 解碼（元件）", "desc": "解碼 URL 元件" },
    "url-encode-full": { "name": "URL 編碼（完整）", "desc": "編碼完整 URL" },
    "url-decode-full": { "name": "URL 解碼（完整）", "desc": "解碼完整 URL" },
    "hash-md5": { "name": "MD5 雜湊", "desc": "產生 MD5 雜湊值" },
    "hash-sha1": { "name": "SHA-1 雜湊", "desc": "產生 SHA-1 雜湊值" },
    "hash-sha256": { "name": "SHA-256 雜湊", "desc": "產生 SHA-256 雜湊值" },
    "hash-sha512": { "name": "SHA-512 雜湊", "desc": "產生 SHA-512 雜湊值" },
    "aes-encrypt": { "name": "AES 加密", "desc": "使用 AES 加密文字" },
    "aes-decrypt": { "name": "AES 解密", "desc": "解密 AES 加密的文字" },
    "hmac-sha256": { "name": "HMAC-SHA256", "desc": "產生 HMAC-SHA256 簽章" },
    "password-gen": { "name": "密碼產生器", "desc": "產生安全密碼" },
    "text-camel": { "name": "camelCase", "desc": "轉換為駝峰命名" },
    "text-pascal": { "name": "PascalCase", "desc": "轉換為帕斯卡命名" },
    "text-snake": { "name": "snake_case", "desc": "轉換為底線命名" },
    "text-kebab": { "name": "kebab-case", "desc": "轉換為短橫線命名" },
    "text-upper": { "name": "大寫", "desc": "轉換為大寫" },
    "text-lower": { "name": "小寫", "desc": "轉換為小寫" },
    "regex-replace": { "name": "正則替換", "desc": "使用正則表達式查找替換" },
    "dedup-lines": { "name": "去除重複行", "desc": "移除文字中的重複行" },
    "extract-emails": { "name": "提取信箱", "desc": "從文字中提取信箱地址" },
    "extract-urls": { "name": "提取 URL", "desc": "從文字中提取 URL" },
    "json-format": { "name": "JSON 格式化", "desc": "格式化美化 JSON" },
    "json-minify": { "name": "JSON 壓縮", "desc": "壓縮 JSON 為緊湊格式" },
    "json-yaml": { "name": "JSON → YAML", "desc": "將 JSON 轉換為 YAML" },
    "yaml-json": { "name": "YAML → JSON", "desc": "將 YAML 轉換為 JSON" },
    "json-ts": { "name": "JSON → TypeScript", "desc": "從 JSON 產生 TypeScript 介面" },
    "json-csv": { "name": "JSON → CSV", "desc": "將 JSON 轉換為 CSV" },
    "csv-json": { "name": "CSV → JSON", "desc": "將 CSV 轉換為 JSON" },
    "sql-format": { "name": "SQL 格式化", "desc": "格式化 SQL 查詢" },
    "sql-minify": { "name": "SQL 壓縮", "desc": "壓縮 SQL 查詢" },
    "uuid-gen": { "name": "UUID 產生器", "desc": "產生 UUID v4 或 v7" },
    "qrcode-gen": { "name": "QR Code 產生器", "desc": "從文字產生 QR Code" },
    "image-compress": { "name": "圖片壓縮", "desc": "壓縮和調整圖片大小" }
  },
  "params": {
    "key": "金鑰",
    "length": "長度",
    "pattern": "模式",
    "replacement": "替換",
    "indent": "縮排",
    "delimiter": "分隔符",
    "dialect": "方言",
    "quality": "品質",
    "size": "尺寸",
    "errorLevel": "糾錯等級",
    "format": "格式",
    "version": "版本",
    "count": "數量",
    "caseSensitive": "區分大小寫",
    "trimWhitespace": "去除空白",
    "flags": "旗標",
    "rootName": "根名稱",
    "maxWidth": "最大寬度",
    "maxHeight": "最大高度",
    "uppercase": "大寫字母 (A-Z)",
    "lowercase": "小寫字母 (a-z)",
    "numbers": "數字 (0-9)",
    "symbols": "符號 (!@#)"
  },
  "options": {
    "yes": "是",
    "no": "否",
    "none": "無",
    "byPercent": "按百分比",
    "custom": "自訂",
    "lowL": "低 (L)",
    "mediumM": "中 (M)",
    "quartileQ": "較高 (Q)",
    "highH": "高 (H)",
    "uuidV4": "UUID v4",
    "uuidV7": "UUID v7",
    "size300": "300 × 300",
    "size600": "600 × 600",
    "size1024": "1024 × 1024"
  },
  "descriptions": {
    "aeoDefinition": "Recipe 是一個免費的視覺化管線建構工具，可以將編碼、雜湊、格式化、文字轉換和影像處理等開發者工具串聯成自動化工作流，全部在瀏覽器中執行。",
    "whatIsTitle": "什麼是 Recipe？",
    "whatIsP1": "Recipe 是一個視覺化管線建構器，讓你將多個處理步驟串聯在一起。輸入文字或圖片，新增 Base64 編碼、SHA-256 雜湊、JSON 格式化或圖片壓縮等步驟，即可即時查看輸出結果。",
    "whatIsP2": "每個步驟的輸出會成為下一個步驟的輸入。你可以將整個管線儲存為可重複使用的配方，非常適合重複性的多步驟工作流。",
    "useCasesTitle": "常見用途",
    "useCasesP1": "建構資料處理管線：將文字編碼為 Base64、用 SHA-256 雜湊、然後格式化結果，一次完成。",
    "useCasesP2": "串聯文字轉換：先轉小寫、再去除重複行、最後提取所有 URL。",
    "useCasesP3": "自動化影像處理：透過一個配方完成圖片調整大小、壓縮和格式轉換。",
    "stepsTitle": "如何建構 Recipe",
    "step1Title": "新增輸入",
    "step1Text": "在輸入區輸入文字或拖放檔案（包括圖片）。",
    "step2Title": "串聯處理步驟",
    "step2Text": "點擊「新增步驟」加入處理步驟。每個步驟會轉換上一步的輸出。",
    "step3Title": "儲存與重複使用",
    "step3Text": "將管線儲存為配方，以後可以對新資料執行相同的工作流。",
    "faq1Q": "什麼是 Recipe 管線？",
    "faq1A": "Recipe 是一系列串聯的處理步驟。每個步驟將上一步的輸出作為輸入，逐步轉換資料。你可以自由新增、刪除、重排和停用步驟。",
    "faq2Q": "支援哪些資料類型？",
    "faq2A": "Recipe 支援文字和圖片資料。步驟會根據相容性自動過濾——例如圖片壓縮只接受圖片輸入並輸出圖片。",
    "faq3Q": "我的資料會傳送到伺服器嗎？",
    "faq3A": "不會。所有處理都在瀏覽器中使用用戶端 JavaScript 執行，資料不會傳送到任何伺服器。儲存的配方存放在瀏覽器的 localStorage 中。"
  },
  "sendToRecipe": "傳送到 Recipe",
  "savedRecipes": "已儲存的 Recipe",
  "stepsCount": "{count} 個步驟",
  "replace": "取代",
  "append": "附加"
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `python3 -c "import json; json.load(open('public/locales/zh-TW/recipe.json')); print('OK')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add public/locales/zh-TW/recipe.json
git commit -m "feat(recipe): add missing i18n keys to zh-TW/recipe.json"
```

---

### Task 4: Add missing i18n keys to ja recipe.json

**Files:**

- Modify: `public/locales/ja/recipe.json`

- [ ] **Step 1: Add all missing keys to ja/recipe.json**

Add these new keys to the existing file. Insert `searchSteps`, `toast`, `ago`, `downloadImageName`, `downloadTextName` as top-level keys. Expand the `options` object. Add `descriptions` block and the 3 missing `guide*` keys.

New top-level keys to add:

```json
"guideInput": "入力エリアにテキストを入力するかファイルをドロップ",
"guideAddStep": "「ステップを追加」をクリックして処理ステップをチェーン",
"guideOutput": "最終出力はリアルタイムでここに表示されます",
"searchSteps": "ステップを検索...",
"toast": {
  "enterName": "名前を入力してください",
  "noSteps": "保存するステップがありません",
  "saved": "レシピを保存しました"
},
"ago": {
  "seconds": "{count}秒前",
  "minutes": "{count}分前",
  "hours": "{count}時間前",
  "days": "{count}日前"
},
"downloadImageName": "recipe-output.png",
"downloadTextName": "recipe-output.txt"
```

Expanded `options`:

```json
"options": {
  "yes": "はい",
  "no": "いいえ",
  "none": "なし",
  "byPercent": "パーセント指定",
  "custom": "カスタム",
  "lowL": "低 (L)",
  "mediumM": "中 (M)",
  "quartileQ": "やや高 (Q)",
  "highH": "高 (H)",
  "uuidV4": "UUID v4",
  "uuidV7": "UUID v7",
  "size300": "300 × 300",
  "size600": "600 × 600",
  "size1024": "1024 × 1024"
}
```

New `descriptions` block:

```json
"descriptions": {
  "aeoDefinition": "Recipe は無料のオンラインビジュアルパイプラインビルダーで、エンコード、ハッシュ、フォーマット、テキスト変換、画像処理などの開発者ツールを一つの自動化ワークフローにチェーンできます。すべてブラウザで実行されます。",
  "whatIsTitle": "Recipe とは？",
  "whatIsP1": "Recipe は複数の処理ステップをチェーンできるビジュアルパイプラインビルダーです。テキストや画像を入力し、Base64 エンコード、SHA-256 ハッシュ、JSON 整形、画像圧縮などのステップを追加すると、リアルタイムで出力を確認できます。",
  "whatIsP2": "各ステップの出力が次のステップの入力になります。パイプライン全体をレシピとして保存・再利用でき、反復的なマルチステップワークフローに最適です。",
  "useCasesTitle": "一般的なユースケース",
  "useCasesP1": "データ処理パイプラインの構築：テキストを Base64 にエンコード、SHA-256 でハッシュ、結果をフォーマット — 一つのフローで完結。",
  "useCasesP2": "テキスト変換のチェーン：小文字に変換、重複行を削除、URL を抽出。",
  "useCasesP3": "画像ワークフローの自動化：リサイズ、圧縮、フォーマット変換を一つのレシピで。",
  "stepsTitle": "レシピの作り方",
  "step1Title": "入力を追加",
  "step1Text": "入力エリアにテキストを入力するか、ファイル（画像を含む）をドラッグ＆ドロップ。",
  "step2Title": "処理ステップをチェーン",
  "step2Text": "「ステップを追加」をクリックして処理ステップを追加。各ステップは前のステップの出力を変換します。",
  "step3Title": "保存して再利用",
  "step3Text": "パイプラインをレシピとして保存。後で新しいデータで同じワークフローを実行できます。",
  "faq1Q": "レシピパイプラインとは？",
  "faq1A": "レシピは一連の処理ステップをチェーンしたものです。各ステップは前のステップの出力を入力として受け取り、データを段階的に変換します。ステップの追加、削除、並べ替え、無効化が自由に行えます。",
  "faq2Q": "どのデータタイプを処理できますか？",
  "faq2A": "テキストと画像データに対応しています。ステップは互換性に基づいて自動的にフィルタリングされます。例えば、画像圧縮は画像入力のみを受け付け、画像を出力します。",
  "faq3Q": "データはサーバーに送信されますか？",
  "faq3A": "いいえ。すべての処理はクライアント側の JavaScript でブラウザ内で実行されます。データがサーバーに送信されることはありません。保存されたレシピはブラウザの localStorage に保存されます。"
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `python3 -c "import json; json.load(open('public/locales/ja/recipe.json')); print('OK')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add public/locales/ja/recipe.json
git commit -m "feat(recipe): add missing i18n keys to ja/recipe.json"
```

---

### Task 5: Add missing i18n keys to ko recipe.json

**Files:**

- Modify: `public/locales/ko/recipe.json`

- [ ] **Step 1: Add all missing keys to ko/recipe.json**

New top-level keys:

```json
"guideInput": "입력 영역에 텍스트를 입력하거나 파일을 드롭하세요",
"guideAddStep": "\"단계 추가\"를 클릭하여 처리 단계를 연결하세요",
"guideOutput": "최종 출력이 여기에 실시간으로 표시됩니다",
"searchSteps": "단계 검색...",
"toast": {
  "enterName": "이름을 입력해주세요",
  "noSteps": "저장할 단계가 없습니다",
  "saved": "레시피가 저장되었습니다"
},
"ago": {
  "seconds": "{count}초 전",
  "minutes": "{count}분 전",
  "hours": "{count}시간 전",
  "days": "{count}일 전"
},
"downloadImageName": "recipe-output.png",
"downloadTextName": "recipe-output.txt"
```

Expanded `options`:

```json
"options": {
  "yes": "예",
  "no": "아니요",
  "none": "없음",
  "byPercent": "비율로",
  "custom": "사용자 지정",
  "lowL": "낮음 (L)",
  "mediumM": "보통 (M)",
  "quartileQ": "높음 (Q)",
  "highH": "매우 높음 (H)",
  "uuidV4": "UUID v4",
  "uuidV7": "UUID v7",
  "size300": "300 × 300",
  "size600": "600 × 600",
  "size1024": "1024 × 1024"
}
```

New `descriptions` block:

```json
"descriptions": {
  "aeoDefinition": "Recipe는 무료 온라인 비주얼 파이프라인 빌더로, 인코딩, 해시, 포맷, 텍스트 변환, 이미지 처리 등 개발자 도구를 하나의 자동화된 워크플로우로 연결할 수 있습니다. 모든 작업은 브라우저에서 실행됩니다.",
  "whatIsTitle": "Recipe란?",
  "whatIsP1": "Recipe는 여러 처리 단계를 연결할 수 있는 비주얼 파이프라인 빌더입니다. 텍스트나 이미지를 입력하고 Base64 인코딩, SHA-256 해시, JSON 포맷, 이미지 압축 등의 단계를 추가하면 실시간으로 출력을 확인할 수 있습니다.",
  "whatIsP2": "각 단계의 출력이 다음 단계의 입력이 됩니다. 전체 파이프라인을 레시피로 저장하고 재사용할 수 있어 반복적인 다단계 워크플로우에 적합합니다.",
  "useCasesTitle": "일반적인 사용 사례",
  "useCasesP1": "데이터 처리 파이프라인 구축: 텍스트를 Base64로 인코딩, SHA-256으로 해시, 결과 포맷 — 하나의 흐름으로 완료.",
  "useCasesP2": "텍스트 변환 체인: 소문자로 변환, 중복 행 제거, URL 추출.",
  "useCasesP3": "이미지 워크플로우 자동화: 리사이즈, 압축, 형식 변환을 하나의 레시피로.",
  "stepsTitle": "레시피 만드는 방법",
  "step1Title": "입력 추가",
  "step1Text": "입력 영역에 텍스트를 입력하거나 파일(이미지 포함)을 드래그 앤 드롭하세요.",
  "step2Title": "처리 단계 연결",
  "step2Text": "\"단계 추가\"를 클릭하여 처리 단계를 추가합니다. 각 단계는 이전 단계의 출력을 변환합니다.",
  "step3Title": "저장 및 재사용",
  "step3Text": "파이프라인을 레시피로 저장하고 나중에 새 데이터로 같은 워크플로우를 실행할 수 있습니다.",
  "faq1Q": "레시피 파이프라인이란?",
  "faq1A": "레시피는 일련의 처리 단계를 연결한 것입니다. 각 단계는 이전 단계의 출력을 입력으로 받아 데이터를 점진적으로 변환합니다. 단계를 자유롭게 추가, 삭제, 재정렬, 비활성화할 수 있습니다.",
  "faq2Q": "어떤 데이터 유형을 처리할 수 있나요?",
  "faq2A": "텍스트와 이미지 데이터를 지원합니다. 단계는 호환성에 따라 자동으로 필터링됩니다. 예를 들어 이미지 압축은 이미지 입력만 허용하고 이미지를 출력합니다.",
  "faq3Q": "데이터가 서버로 전송되나요?",
  "faq3A": "아니요. 모든 처리는 클라이언트 측 JavaScript를 사용하여 브라우저에서 실행됩니다. 데이터가 서버로 전송되지 않습니다. 저장된 레시피는 브라우저의 localStorage에 저장됩니다."
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `python3 -c "import json; json.load(open('public/locales/ko/recipe.json')); print('OK')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add public/locales/ko/recipe.json
git commit -m "feat(recipe): add missing i18n keys to ko/recipe.json"
```

---

### Task 6: Add missing i18n keys to es recipe.json

**Files:**

- Modify: `public/locales/es/recipe.json`

- [ ] **Step 1: Add all missing keys to es/recipe.json**

New top-level keys:

```json
"guideInput": "Introduce texto o arrastra un archivo en el área de entrada",
"guideAddStep": "Haz clic en \"Añadir paso\" para encadenar pasos de procesamiento",
"guideOutput": "La salida final aparece aquí en tiempo real",
"searchSteps": "Buscar pasos...",
"toast": {
  "enterName": "Introduce un nombre",
  "noSteps": "No hay pasos para guardar",
  "saved": "Receta guardada"
},
"ago": {
  "seconds": "hace {count}s",
  "minutes": "hace {count}min",
  "hours": "hace {count}h",
  "days": "hace {count}d"
},
"downloadImageName": "receta-salida.png",
"downloadTextName": "receta-salida.txt"
```

Expanded `options`:

```json
"options": {
  "yes": "Sí",
  "no": "No",
  "none": "Ninguno",
  "byPercent": "Por porcentaje",
  "custom": "Personalizado",
  "lowL": "Bajo (L)",
  "mediumM": "Medio (M)",
  "quartileQ": "Cuartil (Q)",
  "highH": "Alto (H)",
  "uuidV4": "UUID v4",
  "uuidV7": "UUID v7",
  "size300": "300 × 300",
  "size600": "600 × 600",
  "size1024": "1024 × 1024"
}
```

New `descriptions` block:

```json
"descriptions": {
  "aeoDefinition": "Recipe es una herramienta gratuita de construcción visual de pipelines que encadena herramientas de desarrollador — codificación, hashing, formateo, transformación de texto y generación de datos — en un flujo de trabajo automatizado que se ejecuta completamente en tu navegador.",
  "whatIsTitle": "¿Qué es Recipe?",
  "whatIsP1": "Recipe es un constructor visual de pipelines que te permite encadenar múltiples pasos de procesamiento. Introduce texto o una imagen, añade pasos como codificación Base64, hash SHA-256, formateo JSON o compresión de imagen, y observa la salida actualizada en tiempo real.",
  "whatIsP2": "La salida de cada paso se convierte en la entrada del siguiente. Puedes guardar y recargar pipelines completas como recetas reutilizables, perfecto para flujos de trabajo repetitivos de múltiples pasos.",
  "useCasesTitle": "Casos de uso comunes",
  "useCasesP1": "Construir pipelines de procesamiento de datos: codificar texto a Base64, hashear con SHA-256 y formatear el resultado en un solo flujo.",
  "useCasesP2": "Encadenar transformaciones de texto: convertir a minúsculas, eliminar líneas duplicadas y luego extraer todas las URLs del resultado.",
  "useCasesP3": "Automatizar flujos de trabajo de imagen: redimensionar, comprimir y convertir formatos de imagen a través de una sola receta.",
  "stepsTitle": "Cómo construir una receta",
  "step1Title": "Añade tu entrada",
  "step1Text": "Introduce texto o arrastra y suelta un archivo (incluyendo imágenes) en el área de entrada.",
  "step2Title": "Encadena pasos de procesamiento",
  "step2Text": "Haz clic en \"Añadir paso\" para agregar pasos de procesamiento. Cada paso transforma la salida del anterior.",
  "step3Title": "Guarda y reutiliza",
  "step3Text": "Guarda tu pipeline como receta. Cárgala después para ejecutar el mismo flujo de trabajo con datos nuevos.",
  "faq1Q": "¿Qué es un pipeline de Recipe?",
  "faq1A": "Una receta es una secuencia de pasos de procesamiento encadenados. Cada paso toma la salida del paso anterior como entrada, transformando los datos progresivamente. Puedes agregar, eliminar, reordenar y desactivar pasos libremente.",
  "faq2Q": "¿Qué tipos de datos puedo procesar?",
  "faq2A": "Las recetas soportan datos de texto e imagen. Los pasos se filtran automáticamente según la compatibilidad — por ejemplo, la compresión de imagen solo acepta entrada de imagen y produce una imagen.",
  "faq3Q": "¿Se envían mis datos a algún servidor?",
  "faq3A": "No. Todo el procesamiento se ejecuta completamente en tu navegador usando JavaScript del lado del cliente. Ningún dato se envía a un servidor. Las recetas guardadas se almacenan en el localStorage de tu navegador."
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `python3 -c "import json; json.load(open('public/locales/es/recipe.json')); print('OK')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add public/locales/es/recipe.json
git commit -m "feat(recipe): add missing i18n keys to es/recipe.json"
```

---

### Task 7: Add missing i18n keys to pt-BR recipe.json

**Files:**

- Modify: `public/locales/pt-BR/recipe.json`

- [ ] **Step 1: Add all missing keys to pt-BR/recipe.json**

New top-level keys:

```json
"guideInput": "Digite texto ou arraste um arquivo na área de entrada",
"guideAddStep": "Clique em \"Adicionar etapa\" para encadear etapas de processamento",
"guideOutput": "A saída final aparece aqui em tempo real",
"searchSteps": "Pesquisar etapas...",
"toast": {
  "enterName": "Digite um nome",
  "noSteps": "Nenhuma etapa para salvar",
  "saved": "Receita salva"
},
"ago": {
  "seconds": "{count}s atrás",
  "minutes": "{count}min atrás",
  "hours": "{count}h atrás",
  "days": "{count}d atrás"
},
"downloadImageName": "receita-saida.png",
"downloadTextName": "receita-saida.txt"
```

Expanded `options`:

```json
"options": {
  "yes": "Sim",
  "no": "Não",
  "none": "Nenhum",
  "byPercent": "Por porcentagem",
  "custom": "Personalizado",
  "lowL": "Baixo (L)",
  "mediumM": "Médio (M)",
  "quartileQ": "Quartil (Q)",
  "highH": "Alto (H)",
  "uuidV4": "UUID v4",
  "uuidV7": "UUID v7",
  "size300": "300 × 300",
  "size600": "600 × 600",
  "size1024": "1024 × 1024"
}
```

New `descriptions` block:

```json
"descriptions": {
  "aeoDefinition": "Recipe é uma ferramenta gratuita de construção visual de pipelines que encadeia ferramentas de desenvolvedor — codificação, hashing, formatação, transformação de texto e geração de dados — em um fluxo de trabalho automatizado que roda inteiramente no seu navegador.",
  "whatIsTitle": "O que é o Recipe?",
  "whatIsP1": "Recipe é um construtor visual de pipelines que permite encadear múltiplas etapas de processamento. Insira texto ou uma imagem, adicione etapas como codificação Base64, hash SHA-256, formatação JSON ou compressão de imagem, e veja a saída atualizada em tempo real.",
  "whatIsP2": "A saída de cada etapa se torna a entrada da próxima. Você pode salvar e recarregar pipelines inteiras como receitas reutilizáveis — perfeito para fluxos de trabalho repetitivos de múltiplas etapas.",
  "useCasesTitle": "Casos de uso comuns",
  "useCasesP1": "Construir pipelines de processamento de dados: codificar texto em Base64, gerar hash SHA-256 e formatar o resultado em um único fluxo.",
  "useCasesP2": "Encadear transformações de texto: converter para minúsculas, remover linhas duplicadas e extrair todas as URLs do resultado.",
  "useCasesP3": "Automatizar fluxos de trabalho de imagem: redimensionar, comprimir e converter formatos de imagem por uma única receita.",
  "stepsTitle": "Como construir uma receita",
  "step1Title": "Adicione sua entrada",
  "step1Text": "Digite texto ou arraste e solte um arquivo (incluindo imagens) na área de entrada.",
  "step2Title": "Encadeie etapas de processamento",
  "step2Text": "Clique em \"Adicionar etapa\" para adicionar etapas de processamento. Cada etapa transforma a saída da anterior.",
  "step3Title": "Salve e reutilize",
  "step3Text": "Salve seu pipeline como uma receita. Carregue depois para executar o mesmo fluxo de trabalho com novos dados.",
  "faq1Q": "O que é um pipeline de Recipe?",
  "faq1A": "Uma receita é uma sequência de etapas de processamento encadeadas. Cada etapa recebe a saída da etapa anterior como entrada, transformando dados progressivamente. Você pode adicionar, remover, reordenar e desativar etapas livremente.",
  "faq2Q": "Quais tipos de dados posso processar?",
  "faq2A": "Receitas suportam dados de texto e imagem. As etapas são filtradas automaticamente com base na compatibilidade — por exemplo, compressão de imagem só aceita entrada de imagem e gera uma imagem.",
  "faq3Q": "Meus dados são enviados a algum servidor?",
  "faq3A": "Não. Todo o processamento roda inteiramente no seu navegador usando JavaScript do lado do cliente. Nenhum dado é enviado a um servidor. Receitas salvas são armazenadas no localStorage do navegador."
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `python3 -c "import json; json.load(open('public/locales/pt-BR/recipe.json')); print('OK')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add public/locales/pt-BR/recipe.json
git commit -m "feat(recipe): add missing i18n keys to pt-BR/recipe.json"
```

---

### Task 8: Add missing i18n keys to fr recipe.json

**Files:**

- Modify: `public/locales/fr/recipe.json`

- [ ] **Step 1: Add all missing keys to fr/recipe.json**

New top-level keys:

```json
"guideInput": "Saisissez du texte ou glissez-déposez un fichier dans la zone d'entrée",
"guideAddStep": "Cliquez sur \"Ajouter une étape\" pour chaîner les étapes de traitement",
"guideOutput": "La sortie finale s'affiche ici en temps réel",
"searchSteps": "Rechercher des étapes...",
"toast": {
  "enterName": "Veuillez saisir un nom",
  "noSteps": "Aucune étape à sauvegarder",
  "saved": "Recette sauvegardée"
},
"ago": {
  "seconds": "il y a {count}s",
  "minutes": "il y a {count}min",
  "hours": "il y a {count}h",
  "days": "il y a {count}j"
},
"downloadImageName": "recette-sortie.png",
"downloadTextName": "recette-sortie.txt"
```

Expanded `options`:

```json
"options": {
  "yes": "Oui",
  "no": "Non",
  "none": "Aucun",
  "byPercent": "Par pourcentage",
  "custom": "Personnalisé",
  "lowL": "Bas (L)",
  "mediumM": "Moyen (M)",
  "quartileQ": "Quartile (Q)",
  "highH": "Élevé (H)",
  "uuidV4": "UUID v4",
  "uuidV7": "UUID v7",
  "size300": "300 × 300",
  "size600": "600 × 600",
  "size1024": "1024 × 1024"
}
```

New `descriptions` block:

```json
"descriptions": {
  "aeoDefinition": "Recipe est un outil gratuit de construction visuelle de pipelines qui chaîne des outils de développement — encodage, hachage, formatage, transformation de texte et génération de données — en un flux de travail automatisé entièrement exécuté dans votre navigateur.",
  "whatIsTitle": "Qu'est-ce que Recipe ?",
  "whatIsP1": "Recipe est un constructeur visuel de pipelines qui vous permet de chaîner plusieurs étapes de traitement. Saisissez du texte ou une image, ajoutez des étapes comme l'encodage Base64, le hachage SHA-256, le formatage JSON ou la compression d'image, et observez la sortie mise à jour en temps réel.",
  "whatIsP2": "La sortie de chaque étape devient l'entrée de la suivante. Vous pouvez sauvegarder et recharger des pipelines entières en tant que recettes réutilisables — idéal pour les flux de travail répétitifs à plusieurs étapes.",
  "useCasesTitle": "Cas d'utilisation courants",
  "useCasesP1": "Construire des pipelines de traitement de données : encoder du texte en Base64, le hacher avec SHA-256 et formater le résultat en un seul flux.",
  "useCasesP2": "Chaîner des transformations de texte : convertir en minuscules, supprimer les lignes en double, puis extraire toutes les URL du résultat.",
  "useCasesP3": "Automatiser les flux de travail d'image : redimensionner, compresser et convertir des formats d'image via une seule recette.",
  "stepsTitle": "Comment construire une recette",
  "step1Title": "Ajoutez votre entrée",
  "step1Text": "Saisissez du texte ou glissez-déposez un fichier (y compris des images) dans la zone d'entrée.",
  "step2Title": "Chaînez les étapes de traitement",
  "step2Text": "Cliquez sur \"Ajouter une étape\" pour ajouter des étapes de traitement. Chaque étape transforme la sortie de la précédente.",
  "step3Title": "Sauvegardez et réutilisez",
  "step3Text": "Sauvegardez votre pipeline en tant que recette. Chargez-la ultérieurement pour exécuter le même flux de travail sur de nouvelles données.",
  "faq1Q": "Qu'est-ce qu'un pipeline Recipe ?",
  "faq1A": "Une recette est une séquence d'étapes de traitement chaînées. Chaque étape prend la sortie de l'étape précédente comme entrée, transformant les données progressivement. Vous pouvez librement ajouter, supprimer, réorganiser et désactiver des étapes.",
  "faq2Q": "Quels types de données puis-je traiter ?",
  "faq2A": "Les recettes prennent en charge les données texte et image. Les étapes sont filtrées automatiquement selon la compatibilité — par exemple, la compression d'image n'accepte que les entrées image et produit une image.",
  "faq3Q": "Mes données sont-elles envoyées à un serveur ?",
  "faq3A": "Non. Tout le traitement s'exécute entièrement dans votre navigateur en JavaScript côté client. Aucune donnée n'est envoyée à un serveur. Les recettes sauvegardées sont stockées dans le localStorage de votre navigateur."
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `python3 -c "import json; json.load(open('public/locales/fr/recipe.json')); print('OK')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add public/locales/fr/recipe.json
git commit -m "feat(recipe): add missing i18n keys to fr/recipe.json"
```

---

### Task 9: Add missing i18n keys to de recipe.json

**Files:**

- Modify: `public/locales/de/recipe.json`

- [ ] **Step 1: Add all missing keys to de/recipe.json**

New top-level keys:

```json
"guideInput": "Text eingeben oder Datei in den Eingabebereich ziehen",
"guideAddStep": "Klicke auf \"Schritt hinzufügen\", um Verarbeitungsschritte zu verketten",
"guideOutput": "Die finale Ausgabe erscheint hier in Echtzeit",
"searchSteps": "Schritte suchen...",
"toast": {
  "enterName": "Bitte gib einen Namen ein",
  "noSteps": "Keine Schritte zum Speichern",
  "saved": "Rezept gespeichert"
},
"ago": {
  "seconds": "vor {count}s",
  "minutes": "vor {count}Min",
  "hours": "vor {count}Std",
  "days": "vor {count}T"
},
"downloadImageName": "rezept-ausgabe.png",
"downloadTextName": "rezept-ausgabe.txt"
```

Expanded `options`:

```json
"options": {
  "yes": "Ja",
  "no": "Nein",
  "none": "Keine",
  "byPercent": "Nach Prozent",
  "custom": "Benutzerdefiniert",
  "lowL": "Niedrig (L)",
  "mediumM": "Mittel (M)",
  "quartileQ": "Quartil (Q)",
  "highH": "Hoch (H)",
  "uuidV4": "UUID v4",
  "uuidV7": "UUID v7",
  "size300": "300 × 300",
  "size600": "600 × 600",
  "size1024": "1024 × 1024"
}
```

New `descriptions` block:

```json
"descriptions": {
  "aeoDefinition": "Recipe ist ein kostenloses visuelles Pipeline-Bauwerkzeug, das Entwickler-Tools — Kodierung, Hashing, Formatierung, Texttransformation und Datengenerierung — in einen automatisierten Workflow verkettet, der vollständig in deinem Browser läuft.",
  "whatIsTitle": "Was ist Recipe?",
  "whatIsP1": "Recipe ist ein visueller Pipeline-Builder, der es dir ermöglicht, mehrere Verarbeitungsschritte zu verketten. Gib Text oder ein Bild ein, füge Schritte wie Base64-Kodierung, SHA-256-Hash, JSON-Formatierung oder Bildkomprimierung hinzu und sieh die Ausgabe in Echtzeit.",
  "whatIsP2": "Die Ausgabe jedes Schritts wird zur Eingabe des nächsten. Du kannst gesamte Pipelines als wiederverwendbare Rezepte speichern und laden — perfekt für wiederkehrende Multi-Step-Workflows.",
  "useCasesTitle": "Häufige Anwendungsfälle",
  "useCasesP1": "Datenverarbeitungs-Pipelines erstellen: Text in Base64 kodieren, mit SHA-256 hashen und das Ergebnis formatieren — in einem Flow.",
  "useCasesP2": "Texttransformationen verketten: in Kleinbuchstaben umwandeln, doppelte Zeilen entfernen, dann alle URLs extrahieren.",
  "useCasesP3": "Bild-Workflows automatisieren: Größe ändern, komprimieren und Bildformate über ein einziges Rezept konvertieren.",
  "stepsTitle": "So erstellst du ein Rezept",
  "step1Title": "Eingabe hinzufügen",
  "step1Text": "Gib Text ein oder ziehe eine Datei (einschließlich Bilder) per Drag & Drop in den Eingabebereich.",
  "step2Title": "Verarbeitungsschritte verketten",
  "step2Text": "Klicke auf \"Schritt hinzufügen\", um Verarbeitungsschritte hinzuzufügen. Jeder Schritt transformiert die Ausgabe des vorherigen.",
  "step3Title": "Speichern und wiederverwenden",
  "step3Text": "Speichere deine Pipeline als Rezept. Lade sie später, um denselben Workflow mit neuen Daten auszuführen.",
  "faq1Q": "Was ist eine Recipe-Pipeline?",
  "faq1A": "Ein Rezept ist eine verkettete Sequenz von Verarbeitungsschritten. Jeder Schritt nimmt die Ausgabe des vorherigen Schritts als Eingabe und transformiert die Daten schrittweise. Du kannst Schritte frei hinzufügen, entfernen, umordnen und deaktivieren.",
  "faq2Q": "Welche Datentypen kann ich verarbeiten?",
  "faq2A": "Rezepte unterstützen Text- und Bilddaten. Schritte werden automatisch nach Kompatibilität gefiltert — z. B. akzeptiert Bildkomprimierung nur Bildeingaben und gibt ein Bild aus.",
  "faq3Q": "Werden meine Daten an einen Server gesendet?",
  "faq3A": "Nein. Die gesamte Verarbeitung läuft vollständig in deinem Browser mit clientseitigem JavaScript. Es werden keine Daten an einen Server gesendet. Gespeicherte Rezepte werden im localStorage deines Browsers gespeichert."
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `python3 -c "import json; json.load(open('public/locales/de/recipe.json')); print('OK')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add public/locales/de/recipe.json
git commit -m "feat(recipe): add missing i18n keys to de/recipe.json"
```

---

### Task 10: Add missing i18n keys to ru recipe.json

**Files:**

- Modify: `public/locales/ru/recipe.json`

- [ ] **Step 1: Add all missing keys to ru/recipe.json**

New top-level keys:

```json
"guideInput": "Введите текст или перетащите файл в область ввода",
"guideAddStep": "Нажмите \"Добавить шаг\" для цепочки шагов обработки",
"guideOutput": "Итоговый вывод появляется здесь в реальном времени",
"searchSteps": "Поиск шагов...",
"toast": {
  "enterName": "Введите название",
  "noSteps": "Нет шагов для сохранения",
  "saved": "Рецепт сохранён"
},
"ago": {
  "seconds": "{count}с назад",
  "minutes": "{count}мин назад",
  "hours": "{count}ч назад",
  "days": "{count}д назад"
},
"downloadImageName": "recipe-output.png",
"downloadTextName": "recipe-output.txt"
```

Expanded `options`:

```json
"options": {
  "yes": "Да",
  "no": "Нет",
  "none": "Нет",
  "byPercent": "По проценту",
  "custom": "Пользовательский",
  "lowL": "Низкий (L)",
  "mediumM": "Средний (M)",
  "quartileQ": "Квартиль (Q)",
  "highH": "Высокий (H)",
  "uuidV4": "UUID v4",
  "uuidV7": "UUID v7",
  "size300": "300 × 300",
  "size600": "600 × 600",
  "size1024": "1024 × 1024"
}
```

New `descriptions` block:

```json
"descriptions": {
  "aeoDefinition": "Recipe — это бесплатный визуальный конвейер, который объединяет инструменты разработчика — кодирование, хеширование, форматирование, преобразование текста и генерацию данных — в автоматизированный рабочий процесс, полностью выполняемый в вашем браузере.",
  "whatIsTitle": "Что такое Recipe?",
  "whatIsP1": "Recipe — это визуальный конструктор конвейеров, позволяющий объединять несколько шагов обработки. Введите текст или изображение, добавьте шаги: кодирование Base64, хеширование SHA-256, форматирование JSON или сжатие изображений — и наблюдайте результат в реальном времени.",
  "whatIsP2": "Выход каждого шага становится входом следующего. Вы можете сохранять и загружать целые конвейеры как повторно используемые рецепты — идеально для повторяющихся многошаговых рабочих процессов.",
  "useCasesTitle": "Типичные сценарии использования",
  "useCasesP1": "Создание конвейеров обработки данных: кодирование текста в Base64, хеширование SHA-256 и форматирование результата в одном потоке.",
  "useCasesP2": "Цепочка текстовых преобразований: перевод в нижний регистр, удаление дубликатов строк, извлечение всех URL из результата.",
  "useCasesP3": "Автоматизация обработки изображений: изменение размера, сжатие и конвертация форматов через один рецепт.",
  "stepsTitle": "Как создать рецепт",
  "step1Title": "Добавьте входные данные",
  "step1Text": "Введите текст или перетащите файл (включая изображения) в область ввода.",
  "step2Title": "Объедините шаги обработки",
  "step2Text": "Нажмите \"Добавить шаг\" для добавления шагов обработки. Каждый шаг преобразует выход предыдущего.",
  "step3Title": "Сохраните и используйте повторно",
  "step3Text": "Сохраните конвейер как рецепт. Загрузите позже для выполнения того же рабочего процесса с новыми данными.",
  "faq1Q": "Что такое конвейер Recipe?",
  "faq1A": "Рецепт — это последовательность объединённых шагов обработки. Каждый шаг принимает выход предыдущего шага как вход, постепенно преобразуя данные. Вы можете свободно добавлять, удалять, переупорядочивать и отключать шаги.",
  "faq2Q": "Какие типы данных можно обрабатывать?",
  "faq2A": "Рецепты поддерживают текстовые данные и изображения. Шаги автоматически фильтруются по совместимости — например, сжатие изображений принимает только вход изображения и выдаёт изображение.",
  "faq3Q": "Отправляются ли мои данные на сервер?",
  "faq3A": "Нет. Вся обработка выполняется полностью в вашем браузере с использованием клиентского JavaScript. Никакие данные не отправляются на сервер. Сохранённые рецепты хранятся в localStorage вашего браузера."
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `python3 -c "import json; json.load(open('public/locales/ru/recipe.json')); print('OK')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add public/locales/ru/recipe.json
git commit -m "feat(recipe): add missing i18n keys to ru/recipe.json"
```

---

### Task 11: Fix step-picker.tsx — localize step description and search placeholder

**Files:**

- Modify: `components/recipe/step-picker.tsx:80` (search placeholder)
- Modify: `components/recipe/step-picker.tsx:127` (step description)

- [ ] **Step 1: Replace hardcoded search placeholder**

In `components/recipe/step-picker.tsx`, line 80, change:

```
placeholder="Search steps..."
```

to:

```
placeholder={t("searchSteps")}
```

- [ ] **Step 2: Replace hardcoded step description**

In `components/recipe/step-picker.tsx`, line 127, change:

```
{def.description}
```

to:

```
{t(`steps.${def.id}.desc`)}
```

- [ ] **Step 3: Commit**

```bash
git add components/recipe/step-picker.tsx
git commit -m "fix(recipe): localize step description and search placeholder in StepPicker"
```

---

### Task 12: Fix recipe-panel.tsx — localize toast messages, formatRelativeTime, download filenames

**Files:**

- Modify: `components/recipe/recipe-panel.tsx:35-46` (formatRelativeTime)
- Modify: `components/recipe/recipe-panel.tsx:162-179` (toast messages)
- Modify: `components/recipe/recipe-panel.tsx:208,216` (download filenames)

- [ ] **Step 1: Modify formatRelativeTime to accept a translation function**

Replace the existing `formatRelativeTime` function (lines 35-46):

```typescript
function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
```

with:

```typescript
function formatRelativeTime(timestamp: number, t: ReturnType<typeof useTranslations>): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return t("ago.seconds", { count: seconds });
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("ago.minutes", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("ago.hours", { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 30) return t("ago.days", { count: days });
  return new Date(timestamp).toLocaleDateString();
}
```

- [ ] **Step 2: Localize toast messages**

In `handleSave` function (around lines 160-180), replace:

```typescript
showToast("Please enter a name", "warning");
```

with:

```typescript
showToast(t("toast.enterName"), "warning");
```

Replace:

```typescript
showToast("No steps to save", "warning");
```

with:

```typescript
showToast(t("toast.noSteps"), "warning");
```

Replace:

```typescript
showToast("Recipe saved", "success");
```

with:

```typescript
showToast(t("toast.saved"), "success");
```

- [ ] **Step 3: Localize download filenames**

In `handleDownload` function (around lines 203-219), replace:

```typescript
a.download = "recipe-output.png";
```

with:

```typescript
a.download = t("downloadImageName");
```

Replace:

```typescript
a.download = "recipe-output.txt";
```

with:

```typescript
a.download = t("downloadTextName");
```

- [ ] **Step 4: Update formatRelativeTime call site**

The function is called on line 344:

```typescript
{
  formatRelativeTime(recipe.updatedAt);
}
```

Change to:

```typescript
{
  formatRelativeTime(recipe.updatedAt, t);
}
```

- [ ] **Step 5: Commit**

```bash
git add components/recipe/recipe-panel.tsx
git commit -m "fix(recipe): localize toast messages, relative time, and download filenames"
```

---

### Task 13: Fix step-card.tsx — localize select option labels

**Files:**

- Modify: `components/recipe/step-card.tsx:210-214` (select option rendering)

The step definitions in `libs/recipe/steps/*.ts` have hardcoded English option labels. We need a mapping from each `(paramId, value)` pair to a translation key. The approach: define a static map of `paramId + "." + value` → i18n key, then use `t.has()` to check.

- [ ] **Step 1: Add option label translation map and update select rendering**

In `components/recipe/step-card.tsx`, add a constant at the top of the file (after the imports and before the `CATEGORY_COLORS` constant):

```typescript
const OPTION_KEY_MAP: Record<string, string> = {
  "caseSensitive.true": "options.yes",
  "caseSensitive.false": "options.no",
  "trimWhitespace.true": "options.yes",
  "trimWhitespace.false": "options.no",
  "resizeMode.none": "options.none",
  "resizeMode.percent": "options.byPercent",
  "resizeMode.custom": "options.custom",
  "errorLevel.L": "options.lowL",
  "errorLevel.M": "options.mediumM",
  "errorLevel.Q": "options.quartileQ",
  "errorLevel.H": "options.highH",
  "version.v4": "options.uuidV4",
  "version.v7": "options.uuidV7",
  "size.300": "options.size300",
  "size.600": "options.size600",
  "size.1024": "options.size1024",
};
```

Then find the select option rendering (lines 210-214):

```tsx
{
  param.options?.map((opt) => (
    <option key={opt.value} value={opt.value}>
      {opt.label}
    </option>
  ));
}
```

Replace with:

```tsx
{
  param.options?.map((opt) => {
    const key = OPTION_KEY_MAP[`${param.id}.${opt.value}`];
    const label = key && t.has(key) ? t(key) : opt.label;
    return (
      <option key={opt.value} value={opt.value}>
        {label}
      </option>
    );
  });
}
```

This preserves the fallback to the original `opt.label` for options not in the map (like SQL dialect names that are universal: "SQL", "MySQL", "PostgreSQL", etc., and format names like "PNG", "JPEG", "WebP", "SVG").

- [ ] **Step 2: Commit**

```bash
git add components/recipe/step-card.tsx
git commit -m "fix(recipe): localize select option labels via t.has() guard"
```

---

### Task 14: Add DescriptionSection to recipe-page.tsx

**Files:**

- Modify: `app/[locale]/recipe/recipe-page.tsx`

- [ ] **Step 1: Add import for DescriptionSection**

Add this import after the existing imports (after line 8):

```typescript
import DescriptionSection from "../../../components/description-section";
```

- [ ] **Step 2: Add DescriptionSection to the page layout**

After the closing `</div>` of the main grid container (the one with `className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8"`), and before the closing `</div>` of the container div, add:

```tsx
<DescriptionSection namespace="recipe" />
```

The resulting structure at the bottom of the return should look like:

```tsx
<div className="min-h-[calc(100vh-4rem)]">
  <div className="container mx-auto px-4 py-6 lg:py-8">
    <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
      {/* ... existing grid content ... */}
    </div>
    <DescriptionSection namespace="recipe" />
  </div>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add app/\\[locale\\]/recipe/recipe-page.tsx
git commit -m "feat(recipe): add DescriptionSection with SEO/FAQ content"
```

---

### Task 15: Final verification

- [ ] **Step 1: Run ESLint to check for errors**

Run: `npx eslint components/recipe/step-picker.tsx components/recipe/recipe-panel.tsx components/recipe/step-card.tsx app/\\[locale\\]/recipe/recipe-page.tsx`
Expected: No errors

- [ ] **Step 2: Run build to verify no type errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Verify all locale files are valid JSON**

Run: `for f in public/locales/*/recipe.json; do python3 -c "import json; json.load(open('$f'))" && echo "OK: $f" || echo "FAIL: $f"; done`
Expected: All 10 files show OK

- [ ] **Step 4: Final commit (if any lint fixes were needed)**

```bash
git add -A
git commit -m "chore(recipe): lint fixes after i18n changes"
```
