# Plan 3: Privacy Banner Unification

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all inline privacy alert variants with a unified `<PrivacyBanner />` component. Standardize the visual presentation as a compact banner with Lock icon across all tool pages.

**Architecture:** Create a shared `PrivacyBanner` client component with `variant` prop (`"text"` or `"files"`). Migrate all 25+ tool pages from 4 different inline patterns to this single component. Update i18n text in all 10 locales.

**Tech Stack:** React (client component), next-intl, Lucide Lock icon, Tailwind CSS

---

## File Structure

| File                                      | Responsibility                                                     | Status |
| ----------------------------------------- | ------------------------------------------------------------------ | ------ |
| `components/privacy-banner.tsx`           | Shared PrivacyBanner component                                     | Create |
| `public/locales/*/common.json` (10 files) | Update `alert.notTransferred` and `alert.filesNotTransferred` text | Modify |
| 25+ tool `*-page.tsx` files               | Replace inline alerts with `<PrivacyBanner />`                     | Modify |

---

## Current State Analysis

There are 4 inline privacy alert variants across tool pages:

### Variant A: Standard text alert (20 tools)

```tsx
<div className="flex items-start gap-2 border-l-2 border-accent-cyan bg-accent-cyan-dim/30 rounded-r-lg p-3 my-4">
  <span className="text-sm text-fg-secondary leading-relaxed">{tc("alert.notTransferred")}</span>
</div>
```

**Tools:** json, base64, urlencoder, jwt, regex, hashing, textcase, cipher, markdown, dbviewer, color, csv, diff, yaml, image, extractor, wordcounter, deduplines, checksum (files variant), sshkey (plain text)

### Variant B: Lock icon + localGenerated (3 tools)

```tsx
<div className="flex items-start gap-2 border-l-2 border-accent-cyan bg-accent-cyan-dim/30 rounded-r-lg p-3 my-4">
  <Lock size={18} className="text-accent-cyan mt-0.5 shrink-0" />
  <span className="text-sm text-fg-secondary leading-relaxed">{t("localGenerated")}</span>
</div>
```

**Tools:** password, uuid, qrcode

### Variant C: Plain text span (1 tool)

```tsx
<span className="text-sm text-fg-secondary leading-relaxed">{t("localGenerated")}</span>
```

**Tools:** sshkey

### Variant D: Double alert — cyan + purple (1 tool)

```tsx
{
  /* Cyan - files */
}
<div className="flex items-start gap-2 border-l-2 border-accent-cyan bg-accent-cyan-dim/30 rounded-r-lg p-3 my-4">
  <span className="text-sm text-fg-secondary leading-relaxed">
    {tc("alert.filesNotTransferred")}
  </span>
</div>;
{
  /* Purple - functional tip (KEEP as-is) */
}
<div className="flex items-start gap-2 border-l-2 border-accent-purple bg-accent-purple-dim/30 rounded-r-lg p-3 my-4">
  <span className="text-sm text-fg-secondary leading-relaxed">{tc("alert.checksumInfo")}</span>
</div>;
```

**Tools:** checksum (cyan → PrivacyBanner, purple → keep as-is)

### No alert (7 tools)

**Tools:** cron, unixtime, storageunit, ascii, htmlcode, httpstatus, numbase, httpclient, csv-md

---

## Task 1: Create PrivacyBanner Component

**Files:**

- Create: `components/privacy-banner.tsx`

- [ ] **Step 1: Create the component**

Create `components/privacy-banner.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";

interface PrivacyBannerProps {
  variant?: "text" | "files";
}

export default function PrivacyBanner({ variant = "text" }: PrivacyBannerProps) {
  const tc = useTranslations("common");
  const text = variant === "files" ? tc("alert.filesNotTransferred") : tc("alert.notTransferred");

  return (
    <div className="flex items-start gap-2 border-l-2 border-accent-cyan bg-accent-cyan-dim/30 rounded-r-lg p-3 my-4">
      <Lock size={16} className="text-accent-cyan mt-0.5 shrink-0" />
      <span className="text-sm text-fg-secondary leading-relaxed">{text}</span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/privacy-banner.tsx
git commit -m "feat(ui): create PrivacyBanner shared component"
```

---

## Task 2: Update English Translation Text

**Files:**

- Modify: `public/locales/en/common.json`

- [ ] **Step 1: Update alert text in English**

In `public/locales/en/common.json`, update the `alert` section:

Change:

```json
"alert": {
  "notTransferred": "* Your content are not transferred to the server. All calculations are performed directly in the browser",
  "filesNotTransferred": "* Your selected files are not transferred to the server. All calculations are performed directly in the browser",
  ...
}
```

to:

```json
"alert": {
  "notTransferred": "No data sent to servers — All processing happens in your browser",
  "filesNotTransferred": "Your files stay local — All processing happens in your browser",
  "checksumInfo": "This is html5 file online checksum, which supports an unlimited number of files and unlimited file size.",
  "invalidCipher": "Invalid ciphertext, passphrase or settings"
}
```

Key changes:

- Removed leading `*` (asterisk)
- Shorter, punchier copy
- "files" variant emphasizes file locality
- "checksumInfo" and "invalidCipher" unchanged

- [ ] **Step 2: Update translations in all other 9 locales**

For each locale, update the equivalent text. The key structure stays the same.

**zh-CN:**

```json
"notTransferred": "数据不发送至服务器 — 所有处理均在浏览器中完成",
"filesNotTransferred": "文件保留在本地 — 所有处理均在浏览器中完成"
```

**zh-TW:**

```json
"notTransferred": "資料不傳送至伺服器 — 所有處理均在瀏覽器中完成",
"filesNotTransferred": "檔案保留在本機 — 所有處理均在瀏覽器中完成"
```

**ja:**

```json
"notTransferred": "データはサーバーに送信されません — すべての処理はブラウザで実行されます",
"filesNotTransferred": "ファイルはローカルに保持 — すべての処理はブラウザで実行されます"
```

**ko:**

```json
"notTransferred": "데이터는 서버로 전송되지 않습니다 — 모든 처리는 브라우저에서 이루어집니다",
"filesNotTransferred": "파일은 로컬에 유지됩니다 — 모든 처리는 브라우저에서 이루어집니다"
```

**es:**

```json
"notTransferred": "No se envían datos a servidores — Todo el procesamiento se realiza en tu navegador",
"filesNotTransferred": "Tus archivos permanecen locales — Todo el procesamiento se realiza en tu navegador"
```

**pt-BR:**

```json
"notTransferred": "Nenhum dado é enviado a servidores — Todo o processamento ocorre no seu navegador",
"filesNotTransferred": "Seus arquivos ficam locais — Todo o processamento ocorre no seu navegador"
```

**fr:**

```json
"notTransferred": "Aucune donnée envoyée aux serveurs — Tout le traitement se fait dans votre navigateur",
"filesNotTransferred": "Vos fichiers restent en local — Tout le traitement se fait dans votre navigateur"
```

**de:**

```json
"notTransferred": "Keine Daten an Server gesendet — Alle Verarbeitung erfolgt im Browser",
"filesNotTransferred": "Ihre Dateien bleiben lokal — Alle Verarbeitung erfolgt im Browser"
```

**ru:**

```json
"notTransferred": "Данные не отправляются на серверы — Вся обработка выполняется в браузере",
"filesNotTransferred": "Файлы остаются локально — Вся обработка выполняется в браузере"
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/*/common.json
git commit -m "feat(i18n): update privacy alert text across all 10 locales"
```

---

## Task 3: Migrate Variant A Tools (Standard text alert)

**Files:**

- Modify: 18+ tool `*-page.tsx` files

These tools use `tc("alert.notTransferred")` in a bare `<div>` without Lock icon.

**Migration pattern for each tool:**

1. Add import: `import PrivacyBanner from "../../../components/privacy-banner";`
2. Remove the inline `<div className="flex items-start gap-2 border-l-2 border-accent-cyan...">` block
3. Replace with `<PrivacyBanner />`
4. If `Lock` import from lucide-react was only used for this alert, remove it (but check — most Variant A tools don't import Lock)
5. If `tc = useTranslations("common")` was only used for this alert, remove it (but check — some tools use `tc` for other things like copy/download labels)

**Tools to migrate (Variant A — `tc("alert.notTransferred")`):**

| Tool        | File                               | Notes                                 |
| ----------- | ---------------------------------- | ------------------------------------- |
| json        | `json/json-page.tsx`               | `tc` also used for copy labels — keep |
| base64      | `base64/base64-page.tsx`           | `tc` also used — keep                 |
| urlencoder  | `urlencoder/urlencoder-page.tsx`   | Check `tc` usage                      |
| jwt         | `jwt/jwt-page.tsx`                 | Check `tc` usage                      |
| regex       | `regex/regex-page.tsx`             | Check `tc` usage                      |
| hashing     | `hashing/hashing-page.tsx`         | Check `tc` usage                      |
| textcase    | `textcase/textcase-page.tsx`       | Check `tc` usage                      |
| cipher      | `cipher/cipher-page.tsx`           | Check `tc` usage                      |
| markdown    | `markdown/markdown-page.tsx`       | Check `tc` usage                      |
| dbviewer    | `dbviewer/dbviewer-page.tsx`       | Check `tc` usage                      |
| color       | `color/color-page.tsx`             | Check `tc` usage                      |
| csv         | `csv/csv-page.tsx`                 | Check `tc` usage                      |
| diff        | `diff/diff-page.tsx`               | Check `tc` usage                      |
| yaml        | `yaml/yaml-page.tsx`               | Check `tc` usage                      |
| image       | `image/image-page.tsx`             | Check `tc` usage                      |
| extractor   | `extractor/extractor-page.tsx`     | Check `tc` usage                      |
| wordcounter | `wordcounter/wordcounter-page.tsx` | Check `tc` usage                      |
| deduplines  | `deduplines/deduplines-page.tsx`   | Check `tc` usage                      |

- [ ] **Step 3a: Migrate each tool**

For each tool above:

1. Read the file to find the exact inline alert block
2. Add `import PrivacyBanner from "../../../components/privacy-banner";`
3. Replace the `<div className="flex items-start gap-2 border-l-2...">...</div>` with `<PrivacyBanner />`
4. Clean up unused imports (if `tc` was only for alert, remove `useTranslations("common")`)

- [ ] **Step 3b: Verify visually**

Run: `npm run dev`
Visit `/json` → verify PrivacyBanner renders with Lock icon and updated text.
Visit `/hashing` → verify same.

- [ ] **Step 3c: Commit**

```bash
git add app/\[locale\]/*/\*-page.tsx
git commit -m "refactor(privacy): migrate Variant A tools to PrivacyBanner component"
```

---

## Task 4: Migrate Variant B Tools (Lock icon + localGenerated)

**Files:**

- Modify: `password/password-page.tsx`, `uuid/uuid-page.tsx`, `qrcode/qrcode-page.tsx`

These tools use `Lock` icon + `t("localGenerated")` (tool-specific namespace).

**Migration pattern:**

1. Add import: `import PrivacyBanner from "../../../components/privacy-banner";`
2. Replace the `<div>` block with `<PrivacyBanner />`
3. Remove `Lock` from lucide-react import **only if** it's not used elsewhere in the file
4. Keep `t("localGenerated")` translation key in tool-specific files (it may be used for other UI text) — but verify

**Important for password-page.tsx:** It has TWO additional alerts below tabs (cyan with `KeyRound` + purple with `ShieldCheck`) — these are **functional tips, not privacy signals**. Keep them as-is. Only replace the top-level Lock + `localGenerated` alert.

- [ ] **Step 4a: Migrate password-page.tsx**

In `app/[locale]/password/password-page.tsx`:

- Add `import PrivacyBanner from "../../../components/privacy-banner";`
- Replace the Lock + `t("localGenerated")` alert block with `<PrivacyBanner />`
- Check if `Lock` is used elsewhere (the KeyRound and ShieldCheck alerts use different icons) — if Lock is only in this alert, remove from import

- [ ] **Step 4b: Migrate uuid-page.tsx**

In `app/[locale]/uuid/uuid-page.tsx`:

- Add `import PrivacyBanner from "../../../components/privacy-banner";`
- Replace the Lock + `t("localGenerated")` alert block with `<PrivacyBanner />`
- Check if `Lock` is used elsewhere — if only in alert, remove from import

- [ ] **Step 4c: Migrate qrcode-page.tsx**

In `app/[locale]/qrcode/qrcode-page.tsx`:

- Add `import PrivacyBanner from "../../../components/privacy-banner";`
- Replace the Lock + `t("localGenerated")` alert block with `<PrivacyBanner />`
- Check if `Lock` is used elsewhere — if only in alert, remove from import

- [ ] **Step 4d: Commit**

```bash
git add app/\[locale\]/password/password-page.tsx app/\[locale\]/uuid/uuid-page.tsx app/\[locale\]/qrcode/qrcode-page.tsx
git commit -m "refactor(privacy): migrate password, uuid, qrcode to PrivacyBanner"
```

---

## Task 5: Migrate Variant C Tool (sshkey plain text)

**Files:**

- Modify: `sshkey/sshkey-page.tsx`

- [ ] **Step 5a: Migrate sshkey-page.tsx**

In `app/[locale]/sshkey/sshkey-page.tsx`:

- Add `import PrivacyBanner from "../../../components/privacy-banner";`
- Replace `<span className="text-sm text-fg-secondary leading-relaxed">{t("localGenerated")}</span>` with `<PrivacyBanner />`
- This upgrades the plain text to the full banner with Lock icon

- [ ] **Step 5b: Commit**

```bash
git add app/\[locale\]/sshkey/sshkey-page.tsx
git commit -m "refactor(privacy): migrate sshkey to PrivacyBanner"
```

---

## Task 6: Migrate Variant D Tool (checksum double alert)

**Files:**

- Modify: `checksum/checksum-page.tsx`

- [ ] **Step 6a: Migrate checksum-page.tsx**

In `app/[locale]/checksum/checksum-page.tsx`:

- Add `import PrivacyBanner from "../../../components/privacy-banner";`
- Replace the cyan `tc("alert.filesNotTransferred")` alert block with `<PrivacyBanner variant="files" />`
- **KEEP** the purple `tc("alert.checksumInfo")` alert as-is (functional tip, not privacy signal)

- [ ] **Step 6b: Commit**

```bash
git add app/\[locale\]/checksum/checksum-page.tsx
git commit -m "refactor(privacy): migrate checksum to PrivacyBanner, keep functional tip"
```

---

## Task 7: Run Lint and Full Test Suite

- [ ] **Step 7a: Run ESLint**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 7b: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 7c: Run build**

Run: `npm run build`
Expected: Build completes without errors.

- [ ] **Step 7d: Visual spot-check**

Run: `npm run dev`
Visit these pages and verify PrivacyBanner renders correctly:

- `/json` (text variant)
- `/password` (was Lock + localGenerated)
- `/checksum` (files variant + purple functional tip kept)
- `/sshkey` (was plain text, now full banner)
