# Recipe System — Part 6: Non-English i18n (9 Locales)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-step. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add recipe translation files for the 9 non-English locales: zh-CN, zh-TW, ja, ko, es, pt-BR, fr, de, ru. Also update each locale's `tools.json` with the recipe tool entry.

**Architecture:** Follow existing i18n patterns. Each locale gets a `recipe.json` with translated step names, descriptions, param labels, and UI strings. Also update each locale's `tools.json` with recipe `shortTitle` and `description`. For CJK locales, add `searchTerms` to the tools.json entry following the project's searchTerms convention.

**Tech Stack:** next-intl

**Depends on:** Part 3 (English translations as source of truth)

**Produces:** Complete i18n coverage for Recipe tool across all 10 locales.

---

## File Structure

For each locale `{L}`, create/modify:

- Create: `public/locales/{L}/recipe.json`
- Modify: `public/locales/{L}/tools.json` (add recipe entry)

---

### Task 1: zh-CN (Simplified Chinese)

**Files:**

- Create: `public/locales/zh-CN/recipe.json`
- Modify: `public/locales/zh-CN/tools.json`

- [ ] **Step 1: Create zh-CN/recipe.json**

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
  "disabled": "步骤已禁用 — 将在管道中跳过",
  "waitingInput": "等待输入...",
  "computing": "计算中...",
  "sourceStepOnlyAtStart": "源步骤只能放在开头",
  "typeMismatch": "需要 {expected} 输入，但收到 {received} 输出",
  "dropImageHere": "拖放图片到此处或点击选择",
  "noInputNeeded": "无需输入 — 源步骤会自动生成数据",
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
    "no": "否"
  },
  "sendToRecipe": "发送到 Recipe",
  "savedRecipes": "已保存的 Recipe",
  "stepsCount": "{count} 个步骤"
}
```

- [ ] **Step 2: Add recipe entry to zh-CN/tools.json**

Add to `zh-CN/tools.json`:

```json
  "recipe": {
    "title": "Recipe - 数据管道构建器",
    "shortTitle": "Recipe 管道",
    "description": "将多个操作串联成管道。以 CyberChef 风格组合文本和图像处理步骤，构建数据处理管道。所有数据均在浏览器中处理。",
    "searchTerms": "recipe guandao liushuian chuli buzhou"
  }
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/zh-CN/recipe.json public/locales/zh-CN/tools.json
git commit -m "feat(recipe): add zh-CN translations"
```

---

### Task 2: zh-TW (Traditional Chinese)

**Files:**

- Create: `public/locales/zh-TW/recipe.json`
- Modify: `public/locales/zh-TW/tools.json`

- [ ] **Step 1: Create zh-TW/recipe.json**

Same structure as zh-CN but with Traditional Chinese characters and Taiwan regional phrasing. Key differences: use 儲存 instead of 保存, 壓縮 instead of 压缩, etc.

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
  "collapseAll": "全部摺疊",
  "disabled": "步驟已停用 — 將在管線中跳過",
  "waitingInput": "等待輸入...",
  "computing": "計算中...",
  "sourceStepOnlyAtStart": "來源步驟只能放在開頭",
  "typeMismatch": "需要 {expected} 輸入，但收到 {received} 輸出",
  "dropImageHere": "拖放圖片到此處或點擊選擇",
  "noInputNeeded": "無需輸入 — 來源步驟會自動產生資料",
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
    "regex-replace": { "name": "正規表示式替換", "desc": "使用正規表示式查找替換" },
    "dedup-lines": { "name": "移除重複行", "desc": "移除文字中的重複行" },
    "extract-emails": { "name": "擷取信箱", "desc": "從文字中擷取信箱地址" },
    "extract-urls": { "name": "擷取 URL", "desc": "從文字中擷取 URL" },
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
    "delimiter": "分隔符號",
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
    "no": "否"
  },
  "sendToRecipe": "傳送到 Recipe",
  "savedRecipes": "已儲存的 Recipe",
  "stepsCount": "{count} 個步驟"
}
```

- [ ] **Step 2: Add recipe entry to zh-TW/tools.json**

```json
  "recipe": {
    "title": "Recipe - 資料管線建構工具",
    "shortTitle": "Recipe 管線",
    "description": "將多個操作串聯成管線。以 CyberChef 風格組合文字和圖像處理步驟，建構資料處理管線。所有資料均在瀏覽器中處理。",
    "searchTerms": "recipe guanxian chuli buzhou liushui"
  }
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/zh-TW/recipe.json public/locales/zh-TW/tools.json
git commit -m "feat(recipe): add zh-TW translations"
```

---

### Task 3: ja (Japanese)

**Files:**

- Create: `public/locales/ja/recipe.json`
- Modify: `public/locales/ja/tools.json`

- [ ] **Step 1: Create ja/recipe.json**

Japanese translations using developer-friendly casual/polite mix. Use standard technical terminology.

```json
{
  "title": "Recipe",
  "input": "入力",
  "output": "出力",
  "addStep": "ステップを追加",
  "save": "保存",
  "delete": "削除",
  "untitled": "無題の Recipe",
  "expandAll": "すべて展開",
  "collapseAll": "すべて折りたたむ",
  "disabled": "ステップ無効 — パイプラインでスキップされます",
  "waitingInput": "入力待ち...",
  "computing": "計算中...",
  "sourceStepOnlyAtStart": "ソースステップは先頭にのみ配置できます",
  "typeMismatch": "{expected} 入力が必要ですが、{received} 出力を受信しました",
  "dropImageHere": "画像をドロップまたはクリックして選択",
  "noInputNeeded": "入力不要 — ソースステップがデータを生成します",
  "categories": {
    "encoding": "エンコーディング",
    "crypto": "暗号",
    "text": "テキスト",
    "format": "フォーマット",
    "generators": "ジェネレーター",
    "visual": "画像"
  },
  "steps": {
    "base64-encode": { "name": "Base64 エンコード", "desc": "テキストを Base64 にエンコード" },
    "base64-decode": { "name": "Base64 デコード", "desc": "Base64 をテキストにデコード" },
    "url-encode-component": {
      "name": "URL エンコード（コンポーネント）",
      "desc": "URL コンポーネントをエンコード"
    },
    "url-decode-component": {
      "name": "URL デコード（コンポーネント）",
      "desc": "URL コンポーネントをデコード"
    },
    "url-encode-full": { "name": "URL エンコード（全体）", "desc": "URL 全体をエンコード" },
    "url-decode-full": { "name": "URL デコード（全体）", "desc": "URL 全体をデコード" },
    "hash-md5": { "name": "MD5 ハッシュ", "desc": "MD5 ハッシュを生成" },
    "hash-sha1": { "name": "SHA-1 ハッシュ", "desc": "SHA-1 ハッシュを生成" },
    "hash-sha256": { "name": "SHA-256 ハッシュ", "desc": "SHA-256 ハッシュを生成" },
    "hash-sha512": { "name": "SHA-512 ハッシュ", "desc": "SHA-512 ハッシュを生成" },
    "aes-encrypt": { "name": "AES 暗号化", "desc": "AES でテキストを暗号化" },
    "aes-decrypt": { "name": "AES 復号", "desc": "AES 暗号化テキストを復号" },
    "hmac-sha256": { "name": "HMAC-SHA256", "desc": "HMAC-SHA256 署名を生成" },
    "password-gen": { "name": "パスワード生成", "desc": "安全なパスワードを生成" },
    "text-camel": { "name": "キャメルケース", "desc": "キャメルケースに変換" },
    "text-pascal": { "name": "パスカルケース", "desc": "パスカルケースに変換" },
    "text-snake": { "name": "スネークケース", "desc": "スネークケースに変換" },
    "text-kebab": { "name": "ケバブケース", "desc": "ケバブケースに変換" },
    "text-upper": { "name": "大文字", "desc": "大文字に変換" },
    "text-lower": { "name": "小文字", "desc": "小文字に変換" },
    "regex-replace": { "name": "正規表現置換", "desc": "正規表現で検索・置換" },
    "dedup-lines": { "name": "重複行削除", "desc": "テキストから重複行を削除" },
    "extract-emails": { "name": "メール抽出", "desc": "テキストからメールアドレスを抽出" },
    "extract-urls": { "name": "URL 抽出", "desc": "テキストから URL を抽出" },
    "json-format": { "name": "JSON フォーマット", "desc": "JSON を整形・美化" },
    "json-minify": { "name": "JSON 圧縮", "desc": "JSON をコンパクトに圧縮" },
    "json-yaml": { "name": "JSON → YAML", "desc": "JSON を YAML に変換" },
    "yaml-json": { "name": "YAML → JSON", "desc": "YAML を JSON に変換" },
    "json-ts": {
      "name": "JSON → TypeScript",
      "desc": "JSON から TypeScript インターフェースを生成"
    },
    "json-csv": { "name": "JSON → CSV", "desc": "JSON を CSV に変換" },
    "csv-json": { "name": "CSV → JSON", "desc": "CSV を JSON に変換" },
    "sql-format": { "name": "SQL フォーマット", "desc": "SQL クエリを整形" },
    "sql-minify": { "name": "SQL 圧縮", "desc": "SQL クエリを圧縮" },
    "uuid-gen": { "name": "UUID ジェネレーター", "desc": "UUID v4/v7 を生成" },
    "qrcode-gen": { "name": "QR コード生成", "desc": "テキストから QR コードを生成" },
    "image-compress": { "name": "画像圧縮", "desc": "画像を圧縮・リサイズ" }
  },
  "params": {
    "key": "キー",
    "length": "長さ",
    "pattern": "パターン",
    "replacement": "置換文字",
    "indent": "インデント",
    "delimiter": "区切り文字",
    "dialect": "ダイアレクト",
    "quality": "品質",
    "size": "サイズ",
    "errorLevel": "誤り訂正レベル",
    "format": "フォーマット",
    "version": "バージョン",
    "count": "件数",
    "caseSensitive": "大文字小文字を区別",
    "trimWhitespace": "空白をトリム",
    "flags": "フラグ",
    "rootName": "ルート名",
    "maxWidth": "最大幅",
    "maxHeight": "最大高さ",
    "uppercase": "大文字 (A-Z)",
    "lowercase": "小文字 (a-z)",
    "numbers": "数字 (0-9)",
    "symbols": "記号 (!@#)"
  },
  "options": {
    "yes": "はい",
    "no": "いいえ"
  },
  "sendToRecipe": "Recipe に送信",
  "savedRecipes": "保存済み Recipe",
  "stepsCount": "{count} ステップ"
}
```

- [ ] **Step 2: Add recipe entry to ja/tools.json**

```json
  "recipe": {
    "title": "Recipe - データパイプラインビルダー",
    "shortTitle": "Recipe パイプライン",
    "description": "複数の処理をパイプラインに連鎖させます。CyberChef スタイルでテキスト・画像処理ステップを組み合わせます。すべてのデータはブラウザ内で処理されます。",
    "searchTerms": "recipe piperain buzhou rensa shori"
  }
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/ja/recipe.json public/locales/ja/tools.json
git commit -m "feat(recipe): add ja translations"
```

---

### Task 4: ko, es, pt-BR, fr, de, ru

**Files:**

- Create: 6 `recipe.json` files
- Modify: 6 `tools.json` files

The engineer should follow the same pattern as Tasks 1-3 for each remaining locale. Each translation should use native, natural phrasing for developer tools in that language.

- [ ] **Step 1: ko (Korean)** — Create `public/locales/ko/recipe.json` and update `ko/tools.json`. Use natural Korean phrasing with proper honorifics for UI context. Add `searchTerms` with romanized Korean + keywords.

- [ ] **Step 2: es (Spanish)** — Create `public/locales/es/recipe.json` and update `es/tools.json`. Use standard technical terminology for Spanish developer community.

- [ ] **Step 3: pt-BR (Brazilian Portuguese)** — Create `public/locales/pt-BR/recipe.json` and update `pt-BR/tools.json`. Use Brazilian Portuguese developer terminology.

- [ ] **Step 4: fr (French)** — Create `public/locales/fr/recipe.json` and update `fr/tools.json`. Use French developer terminology (e.g., "Chiffrer" not "Encrypter").

- [ ] **Step 5: de (German)** — Create `public/locales/de/recipe.json` and update `de/tools.json`. Use German developer terminology (e.g., "Verschlüsseln" not "Encrypt").

- [ ] **Step 6: ru (Russian)** — Create `public/locales/ru/recipe.json` and update `ru/tools.json`. Use Russian developer terminology.

- [ ] **Step 7: Commit all remaining locales**

```bash
git add public/locales/ko/ public/locales/es/ public/locales/pt-BR/ public/locales/fr/ public/locales/de/ public/locales/ru/
git commit -m "feat(recipe): add ko, es, pt-BR, fr, de, ru translations"
```

---

### Task 5: Verify Build

- [ ] **Step 1: Run build**

Run: `npm run build 2>&1 | tail -30`
Expected: Build succeeds with all locale JSON valid

- [ ] **Step 2: Run all tests**

Run: `npm run test`
Expected: All tests pass
