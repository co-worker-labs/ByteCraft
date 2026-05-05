# Deduplicate Lines Tool — Design Spec

## Overview

A browser-based tool to remove duplicate lines from text. Targets users processing logs, config files, and CSV data. Common search queries: "remove duplicate lines online", "在线去重行", "text deduplicator".

All processing runs client-side. No data leaves the browser.

## Scope

Pure line-by-line deduplication. No word-level, column-level, or custom delimiter modes.

## Route & Registration

- **Route**: `/deduplines`
- **Key**: `deduplines`
- **Category**: `text` (alongside json, regex, diff, markdown, textcase)
- **Icon**: `ListFilter` from lucide-react

## File Structure

| Operation | Path                                           | Purpose                                   |
| --------- | ---------------------------------------------- | ----------------------------------------- |
| New       | `app/[locale]/deduplines/page.tsx`             | Route entry — metadata + mount            |
| New       | `app/[locale]/deduplines/deduplines-page.tsx`  | Page component (Conversion + Description) |
| New       | `libs/deduplines/main.ts`                      | Pure dedup logic + stats computation      |
| New       | `public/locales/{locale}/deduplines.json` × 10 | Tool-specific translations                |
| Modify    | `libs/tools.ts`                                | Add to TOOLS array + TOOL_CATEGORIES      |
| Modify    | `public/locales/{locale}/tools.json` × 10      | Add title/shortTitle/description          |

### Route Entry (`page.tsx`)

Follows the project-wide pattern (see `textcase/page.tsx`):

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import DeduplinesPage from "./deduplines-page";

const PATH = "/deduplines";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("deduplines.title"),
    description: t("deduplines.description"),
  });
}

export default function DeduplinesRoute() {
  return <DeduplinesPage />;
}
```

Note: `params` is `Promise<{ locale: string }>` (Next.js 15+ async params). SEO/sitemap coverage is automatic — `sitemap.ts` iterates the `TOOLS` array.

## Core Logic (`libs/deduplines/main.ts`)

### Interface

```ts
interface DedupOptions {
  caseSensitive: boolean; // default: true
  trimLines: boolean; // default: true
  removeEmpty: boolean; // default: true
}

interface DedupResult {
  output: string; // deduplicated text, joined by \n
  originalCount: number; // total lines before dedup
  resultCount: number; // lines after dedup
  removedCount: number; // number of removed duplicates
}
```

### Algorithm

1. Normalize line endings: replace `\r\n` and `\r` with `\n`, then split by `\n`.
2. Record `originalCount = lines.length` (total lines from split, before any filtering).
3. If `removeEmpty`: filter out lines that are empty or whitespace-only.
4. Build a comparison key for each remaining line:
   - If `trimLines`: key = `line.trim()`
   - If `!caseSensitive`: key = `key.toLowerCase()`
5. Track seen keys with a `Set`. Only keep the first occurrence of each key.
6. Output preserves the original line text (comparison keys are separate from output).
7. `resultCount = output lines`, `removedCount = originalCount - resultCount`.
8. First-occurrence order is preserved (no sorting).

### Trailing newline handling

`"a\nb\n".split("\n")` produces `["a", "b", ""]`. When `removeEmpty=true`, the trailing empty string is filtered out — this is the correct behavior. When `removeEmpty=false`, the trailing empty string is preserved as a line and counts toward `originalCount`. This matches the split semantics and is consistent.

### Design Decisions

- `originalCount` is the raw line count from `split("\n")`, before any filtering. This gives the user a truthful "you had N lines" baseline regardless of which options are active.
- Comparison keys and original text are handled separately. Trimming and case folding apply only to comparison — the output retains original text.
- Pure function, no side effects, easily testable.

## UI Layout (`deduplines-page.tsx`)

### Approach

Top-to-bottom layout, consistent with urlencoder and other text tools. Real-time computation (no button — results update as the user types or changes options).

### Imports

```ts
import { useState } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import { StyledTextarea, StyledCheckbox } from "../../../components/ui/input";
import { CopyButton } from "../../../components/ui/copy-btn";
import { showToast } from "../../../libs/toast";
import { dedupLines } from "../../../libs/deduplines/main";
```

### Component Structure

Three components: `Conversion`, `Description`, `DeduplinesPage`.

### Conversion Component

```
┌──────────────────────────────────────────┐
│ ● Plain Text                    [Clear]  │  ← header with cyan dot + clear
├──────────────────────────────────────────┤
│ StyledTextarea (rows=8, font-mono)       │  ← input area
│                               [Copy]     │
├──────────────────────────────────────────┤
│ ☑ Case Sensitive  ☑ Trim  ☑ Remove Empty│  ← 3x StyledCheckbox
├──────────────────────────────────────────┤
│ Stats: 100 → 73 (-27)       [Copy Result]│  ← stats + output copy
├──────────────────────────────────────────┤
│ StyledTextarea (readOnly, rows=8)        │  ← output area
└──────────────────────────────────────────┘
```

**Key behaviors**:

- Input textarea: editable, placeholder text, monospace font.
- Three checkboxes control `DedupOptions`. All default to checked (`useState(true)` for each).
- Output textarea: read-only, auto-populated from `dedupLines(input, options)`.
- Stats line: shows `"100 lines → 73 lines (-27 duplicates)"` or `"100 lines → no duplicates found"`.
- Stats and output copy button share a row between checkboxes and output textarea.
- Clear button resets input textarea and shows toast: `showToast(tc("cleared"), "danger", 2000)` (following base64/urlencoder pattern).
- Stats hidden when input is empty.

### Description Component

Follows the standard project pattern (`<section id="description" className="mt-8">`), each subsection wrapped in `<div className="mb-4">` with `<h2 className="font-semibold text-fg-primary text-base">` and `<div className="mt-1 space-y-1.5 text-fg-secondary text-sm leading-relaxed">`.

Subsections:

- "What is Line Deduplication?" — brief explanation
- "How to Use" — explains each option
- "Common Use Cases" — log cleanup, config dedup, CSV row dedup, removing duplicates from lists

### DeduplinesPage Component (default export)

```tsx
export default function DeduplinesPage() {
  const t = useTranslations("tools");
  const tc = useTranslations("common");
  return (
    <Layout title={t("deduplines.shortTitle")}>
      <div className="container mx-auto px-4 pt-3 pb-6">
        <div className="flex items-start gap-2 border-l-2 border-accent-cyan bg-accent-cyan-dim/30 rounded-r-lg p-3 my-4">
          <span className="text-sm text-fg-secondary leading-relaxed">
            {tc("alert.notTransferred")}
          </span>
        </div>
        <Conversion />
        <Description />
      </div>
    </Layout>
  );
}
```

Privacy banner (`tc("alert.notTransferred")`) is standard across all tools and must be included.

## Translations

### `deduplines.json` (English baseline)

> **Note on pluralization**: The stats strings use "lines" for all counts. This matches the project convention (no ICU plural support in next-intl usage). For count=1 the grammar is imperfect ("1 lines") but acceptable — other tools in the project follow the same pattern.

```json
{
  "inputPlaceholder": "Paste your text here...",
  "outputPlaceholder": "Unique lines will appear here...",
  "stats": "{original} lines → {result} lines (-{removed} duplicates)",
  "statsNoDupes": "{original} lines → no duplicates found",
  "options": {
    "caseSensitive": "Case Sensitive",
    "trimLines": "Trim Whitespace",
    "removeEmpty": "Remove Empty Lines"
  },
  "descriptions": {
    "whatIsTitle": "What is Line Deduplication?",
    "whatIsP1": "Line deduplication removes duplicate lines from text, keeping only the first occurrence of each unique line. The original order is preserved.",
    "howTitle": "How to Use",
    "howP1": "Paste your text in the input area. The result updates in real time. Use the options to control comparison behavior.",
    "howCase": "Case Sensitive: When checked, 'Hello' and 'hello' are treated as different lines.",
    "howTrim": "Trim Whitespace: When checked, leading and trailing spaces are ignored during comparison.",
    "howEmpty": "Remove Empty Lines: When checked, empty lines and whitespace-only lines are removed.",
    "useCasesTitle": "Common Use Cases",
    "useCasesP1": "Removing duplicate entries from log files.",
    "useCasesP2": "Cleaning up configuration files with repeated directives.",
    "useCasesP3": "Deduplicating rows in CSV data before processing."
  }
}
```

### `tools.json` Entry

```json
"deduplines": {
  "title": "Remove Duplicate Lines - Deduplicate Text Online",
  "shortTitle": "Deduplicate Lines",
  "description": "Remove duplicate lines from text. Options for case sensitivity, trim, empty lines. 100% client-side."
}
```

### searchTerms (CJK only)

| Locale | searchTerms                                             | Derivation                                               |
| ------ | ------------------------------------------------------- | -------------------------------------------------------- |
| zh-CN  | `quchonghang qrch quchong chongfu wenben`               | 去重行 qrch 去重 重复 文本                               |
| zh-TW  | `quchonghang qrch quchong chongfu wenben`               | same as zh-CN (simplified pinyin covers traditional too) |
| ja     | `jufukudousakujyo jfkdsk joufuku dyuipuriku hairetsu`   | 重複行削除 jfkdsk 重複 デュプリケート 配列               |
| ko     | `jungbokhaeng jbhg jungbok jaegidoeeonaen jungbokjegeo` | 중복행 jbhg 중복 재거 (remove) 중복제거                  |

**Keyword rationale**:

- `quchonghang` / `quchong` — unique to this tool (去重行 / 去重)
- `chongfu` — "重复" (duplicate), discriminating keyword not shared with other tools
- `wenben` — "文本" (text), secondary context keyword
- `shanchu` was removed — "删除" (delete) is too generic, matches diff, checksum, etc.
- `jungbokhaeng` — "중복행" (duplicate lines), specific to this tool
- `jaegidoeeonaen` — "재거되어낸" was replaced with `jungbokjegeo` (중복제거), more recognizable
- `dyuipuriku` kept for ja — "デュプリケート" is a recognizable loanword for deduplication

## Tool Registration

### `libs/tools.ts`

Add to `TOOLS` array:

```ts
{ key: "deduplines", path: "/deduplines", icon: ListFilter }
```

Add `"deduplines"` to the `"text"` category in `TOOL_CATEGORIES`.

## Testing

Add test file at `libs/deduplines/__tests__/main.test.ts`.

Test cases:

- Empty input → empty output, 0 counts
- No duplicates → identical output, stats show "no duplicates found"
- Basic dedup with all options on
- Case sensitivity toggle: "Hello" vs "hello"
- Trim toggle: " hello " vs "hello"
- Remove empty toggle: empty lines preserved or removed
- Mixed line endings (\r\n, \r, \n) all handled
- Output preserves original text (not trimmed/lowercased version)
- Order preservation: first occurrence wins

Add `"libs/deduplines/**/*.test.ts"` to the `include` array in `vitest.config.ts` (follows the existing `"libs/<tool>/**/*.test.ts"` pattern).
