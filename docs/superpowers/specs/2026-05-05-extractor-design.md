# Email / URL / Phone Extractor — Design Spec

**Route:** `/extractor`  
**Category:** Text Processing  
**Date:** 2026-05-05

## Overview

A browser-based extraction tool that parses pasted text and pulls out emails, URLs, and phone numbers. Target users: data cleaning, marketing lead generation. All processing is client-side.

## Requirements

| Aspect               | Decision                                     |
| -------------------- | -------------------------------------------- |
| Extractable patterns | Email, URL, Phone number                     |
| Output format        | Flat list with type badges                   |
| Deduplication        | Unique by default, toggle to show duplicates |
| Export formats       | Copy to clipboard, TXT, CSV, JSON            |
| Route                | `/extractor`                                 |
| Category             | Text Processing                              |
| Approach             | Single unified extraction with toggle chips  |

## Architecture

### Business Logic (`libs/extractor/`)

```
libs/extractor/
├── main.ts              # Public API
└── __tests__/
    └── main.test.ts
```

**Types:**

```ts
type ExtractorType = "email" | "url" | "phone";

type ExtractionResult = {
  type: ExtractorType;
  value: string;
  index: number;
};
```

**Public API:**

```ts
function extract(input: string, types: ExtractorType[]): ExtractionResult[];
```

Pure function. No side effects, no DOM. Three regex patterns, returns all matches with type, value, and position. Deduplication and sorting happen in the UI layer.

### Regex Patterns

**Email** (permissive extraction, not validation):

```
/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
```

- Matches: `user@domain.com`, `user+tag@domain.co.uk`, `first.last@sub.domain.org`
- Does NOT match: `@domain.com` (no local part), bare `domain.com`

**URL** (common web URLs):

```
/https?:\/\/[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/g
```

- Matches: `http://`, `https://` schemes with paths, query strings, fragments

**Phone** (international formats):

```
/(?:\+?\d{1,4}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g
```

- Matches: `+1 (555) 123-4567`, `555-987-6543`, `+44 20 7946 0958`, `(555) 123.4567`
- Requires at least 7 digits total (avoids matching dates like `2024/01/05` or version strings like `3.14.159`)
- Does NOT use `/` as separator (slashes are not phone-number separators; excluding them prevents date false positives)

**Post-processing:**

1. Strip trailing punctuation (`.`, `,`, `;`, `)`) from matched values.
2. **Phone digit-count validation:** After stripping, count digits in the phone match. Discard if fewer than 7 digits (eliminates stray number fragments).

### Page Component (`app/[locale]/extractor/`)

```
app/[locale]/extractor/
├── page.tsx              # Route entry — generateMetadata + render client component
└── extractor-page.tsx    # Client component — all UI and state
```

**State model:**

```ts
const [input, setInput] = useState("");
const [enabledTypes, setEnabledTypes] = useState<Set<ExtractorType>>(
  new Set(["email", "url", "phone"])
);
const [showDuplicates, setShowDuplicates] = useState(false);
```

No manual memoization (React Compiler handles it). Derived computations:

1. `results = extract(input, [...enabledTypes])`
2. Deduped via `Map` keyed by `value`
3. Stats: `{ email: n, url: n, phone: n, unique: n, total: n }`

**Component structure:**

```
ExtractorPage
├── Layout wrapper (title from tools namespace)
├── Conversion
│   ├── Input textarea
│   ├── Toggle chips row (Email ✓ / URL ✓ / Phone ✓) + Show duplicates checkbox
│   ├── Results header (count summary + export buttons: Copy All, TXT, CSV, JSON)
│   ├── Results list (type badge + value + per-item count + copy button)
│   └── Summary stats bar (count per type + unique/total)
└── Description (supported formats reference + SEO)
```

**Toggle chip colors:**

| Type  | Color  | CSS variable                |
| ----- | ------ | --------------------------- |
| Email | Green  | `--accent-cyan` (#06d6a0)   |
| URL   | Purple | `--accent-purple` (#8b5cf6) |
| Phone | Blue   | #3b82f6                     |

**Export behavior:**

| Format | Content                                                        |
| ------ | -------------------------------------------------------------- |
| Copy   | Newline-joined values                                          |
| TXT    | Newline-joined values, downloaded as `.txt`                    |
| CSV    | `"type","value"` header + rows, RFC 4180 quoted fields, `.csv` |
| JSON   | `[{ "type": "email", "value": "..." }]` array                  |

- CSV: All fields are double-quoted per RFC 4180 to handle commas in URLs and phone formatting characters.
- JSON: Exports the current view — deduplicated list by default, includes duplicates if `showDuplicates` is on.

### Tool Registration (`libs/tools.ts`)

- **Key:** `"extractor"`
- **Path:** `"/extractor"`
- **Icon:** `Search` (lucide-react) — a general-purpose icon better suited to an extraction tool that handles emails, URLs, and phones
- **Category:** `"text"` group — appended after `textcase` in the `TOOL_CATEGORIES` array: `["json", "regex", "diff", "markdown", "textcase", "extractor"]`
- **Quick access:** Not added to `QUICK_ACCESS_DEFAULT` — extractor is useful but not among the top 6 most-used tools

### i18n

**10 locales × 2 files each.**

`public/locales/{locale}/tools.json` — add `extractor` entry:

```json
"extractor": {
  "title": "Email & URL Extractor — Extract Emails, URLs, Phone Numbers Online",
  "shortTitle": "Email / URL / Phone Extractor",
  "description": "Extract emails, URLs, and phone numbers from any text instantly. Free online extraction tool, 100% client-side."
}
```

`public/locales/{locale}/extractor.json` — UI strings:

- Input placeholder, toggle labels, export button labels
- Result count templates: `"{count} unique items found ({total} total matches)"`
- Type labels ("Email", "URL", "Phone")
- Summary templates: `"{count} emails"`, `"{count} URLs"`, `"{count} phones"`
- Description section headings and paragraphs (see Description section below)
- Empty state text

**searchTerms** (CJK locales only, max 5 tokens):

| Locale | searchTerms                       |
| ------ | --------------------------------- |
| zh-CN  | `youxiangtiqu yxtq url dianhua`   |
| zh-TW  | `youxiangtiqu yxtq url dianhua`   |
| ja     | `meeruchuushutsu mrchu url denwa` |
| ko     | `imeilchuchul imicc url jeonhwa`  |

- ja initials: メ(me) ー ル(ru) 抽(chū) 出(shutsu) → `m`, `r`, `ch`, `sh` → `mrchu` (treating ー as extending メ)
- ko initials: 이(i) 메(me) 일(il) 추(chu) 출(chul) → `i`, `m`, `i`, `c`, `c` → `imicc`

Latin-script locales (en, es, pt-BR, fr, de, ru): no searchTerms needed.

### Description Section

A static reference section below the Conversion area with:

1. **"Supported Formats" heading** — brief table showing what each extractor matches:
   - Email: local-part@domain.tld, supports `+` tags, subdomains
   - URL: http:// and https:// with paths, query strings, fragments
   - Phone: international formats with `+` country code, parentheses, dashes, dots, spaces
2. **"Tips" heading** — 2-3 bullet points:
   - Extraction is permissive (not validation) — all plausible matches are returned
   - Toggle individual types on/off with the chip buttons
   - Results are deduplicated by default; enable "Show duplicates" to see all occurrences

### Edge Cases

- **Empty input:** Show empty state, no error
- **No matches:** Show "No items found" message
- **Overlapping matches:** Both email and URL patterns run independently; both can appear in results
- **Trailing punctuation:** Strip `.`, `,`, `;`, `)` from matched values during post-processing
- **Large input:** No Web Worker needed — regex extraction is fast even on >1MB text
- **Phone false-positive mitigation:** Post-processing counts digits and discards matches with <7 digits. The regex also excludes `/` as a separator to avoid matching dates (e.g. `2024/01/05`)

### Testing

Vitest tests in `libs/extractor/__tests__/main.test.ts`:

- Each pattern against known good/bad inputs
- Multiple matches in single input
- Deduplication behavior
- Trailing punctuation stripping
- Empty input returns empty array
- Toggle filtering (extract only email, only url, etc.)
- International phone number formats
- Phone digit-count validation discards matches with fewer than 7 digits
- Phone regex false-positive resistance (dates, version strings)

## Files to Create/Modify

| File                                              | Action                                                 |
| ------------------------------------------------- | ------------------------------------------------------ |
| `libs/extractor/main.ts`                          | Create — extraction logic                              |
| `libs/extractor/__tests__/main.test.ts`           | Create — tests                                         |
| `app/[locale]/extractor/page.tsx`                 | Create — route entry                                   |
| `app/[locale]/extractor/extractor-page.tsx`       | Create — page component                                |
| `libs/tools.ts`                                   | Modify — add tool entry + category placement           |
| `vitest.config.ts`                                | Modify — add `libs/extractor/**/*.test.ts` to includes |
| `public/locales/en/tools.json`                    | Modify — add extractor metadata                        |
| `public/locales/en/extractor.json`                | Create — English UI strings                            |
| `public/locales/{9 other locales}/tools.json`     | Modify — add extractor metadata                        |
| `public/locales/{9 other locales}/extractor.json` | Create — localized UI strings                          |
