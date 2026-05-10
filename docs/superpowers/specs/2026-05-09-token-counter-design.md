# Token Counter — Design Spec

## Summary

A new tool at `/token-counter` that counts OpenAI LLM tokens for given text, with real-time token visualization using colored highlighting. Uses `gpt-tokenizer` (o200k_base encoding) for pure-JS BPE tokenization.

## Technology Choice

**Library**: `gpt-tokenizer` (v3.x)

| Factor              | gpt-tokenizer      | js-tiktoken       | @dqbd/tiktoken       |
| ------------------- | ------------------ | ----------------- | -------------------- |
| Bundle size         | **~50KB** gzipped  | ~200KB            | ~1.2MB               |
| Implementation      | Pure JS            | Pure JS           | WASM (Rust)          |
| Short text speed    | **1.05 µs/iter**   | Slower            | Slower (WASM init)   |
| Memory management   | No `free()` needed | Requires `free()` | Requires `free()`    |
| Edge/Next.js compat | Full               | Full              | WASM issues possible |

Rationale: smallest bundle, fastest for typical prompt-length inputs, zero WASM risk, richest API (`encode`, `decode`, `encodeChat`, `estimateCost`).

**Encoding**: o200k_base only (GPT-4o, GPT-4.1, o1, o3, o4-mini, GPT-5).

## File Structure

```
app/[locale]/token-counter/
├── page.tsx                       # Route entry + SEO metadata + JSON-LD
└── token-counter-page.tsx         # Page component

libs/token-counter/
└── main.ts                        # Tokenize logic wrapper

public/locales/{locale}/
├── token-counter.json             # Tool-specific translations
└── tools.json                     # Updated with tokencounter entry
```

## Architecture

### Route & Registration

- Route: `/token-counter`
- Key: `tokencounter`
- Category: `text` (inserted after `wordcounter`, before `deduplines` in `TOOL_CATEGORIES`)
- Icon: `Hash` (from lucide-react — represents counting/hashing)
- `TOOLS` array entry: `{ key: "tokencounter", path: "/token-counter", icon: Hash }`
- `TOOL_RELATIONS`: `tokencounter: ["wordcounter", "regex", "textcase"]` + update `wordcounter` relations to include `tokencounter`

### Core Module (`libs/token-counter/main.ts`)

```ts
interface TokenInfo {
  id: number;
  text: string;
}

interface TokenResult {
  tokenCount: number;
  charCount: number;
  tokens: TokenInfo[];
}

const CONTEXT_WINDOW = 128_000;
```

Exports a single `tokenize(text: string): TokenResult` function:

- Empty string returns `{ tokenCount: 0, charCount: 0, tokens: [] }`
- Uses `gpt-tokenizer`'s `encode()` which returns token ID array
- Maps each token ID back to its text slice via `decode([id])` to get the original token string
- `charCount` is `text.length`

The mapping from IDs to text is done by iterating the ID array and calling `decode([id])` for each token individually. This preserves the original byte-pair encoding boundaries.

### Page Component (`token-counter-page.tsx`)

Follows standard tool page pattern:

```tsx
export default function TokenCounterPage() {
  const t = useTranslations("tools");
  const title = t("tokencounter.shortTitle");
  return (
    <Layout title={title} categoryLabel={t("categories.text")} categorySlug="text-processing">
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner />
        <Conversion />
        <Description />
        <RelatedTools currentTool="tokencounter" />
      </div>
    </Layout>
  );
}
```

### Route Entry (`page.tsx`)

Full SEO pattern matching existing tools (e.g., wordcounter):

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import TokenCounterPage from "./token-counter-page";

const PATH = "/token-counter";
const TOOL_KEY = "tokencounter";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("tokencounter.title"),
    description: t("tokencounter.description"),
  });
}

export default async function TokenCounterRoute({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "tokencounter" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const schemas = buildToolSchemas({
    name: t("tokencounter.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("tokencounter.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems: [1, 2, 3].map((i) => ({
      q: tx(`descriptions.faq${i}Q`),
      a: tx(`descriptions.faq${i}A`),
    })),
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
      <TokenCounterPage />
    </>
  );
}
```

## UI Layout

### 1. Stats Cards (top)

4 cards in a grid (`grid-cols-2 md:grid-cols-4`):

| Card          | Value                                            | Example  |
| ------------- | ------------------------------------------------ | -------- |
| Tokens        | token count                                      | `47`     |
| Characters    | character count                                  | `231`    |
| Chars/Token   | ratio (chars per token, higher = more efficient) | `4.91`   |
| Context Usage | percentage of 128K context window                | `0.037%` |

Style matches existing stat cards (wordcounter pattern): `bg-bg-surface border border-border-default rounded-xl p-4 text-center`, value in `text-accent-cyan font-mono text-2xl font-bold`.

Implementation pattern:

```tsx
const statCards = [
  { label: t("tokens"), value: result.tokenCount },
  { label: t("characters"), value: result.charCount },
  {
    label: t("charsPerToken"),
    value: result.charCount > 0 ? (result.charCount / result.tokenCount).toFixed(2) : "0",
  },
  { label: t("contextUsage"), value: `${((result.tokenCount / 128000) * 100).toFixed(3)}%` },
];
```

### 2. Text Input (middle)

- `StyledTextarea` with `font-mono h-[30vh] resize-y`
- File drag-and-drop via `useDropZone` hook (from `hooks/useDropZone`)
- Hidden `<input type="file">` triggered by "Load File" button
- "Load File" button (top-left, `FolderOpen` icon) + "Clear" button (top-right, `Trash2` icon, conditional on text)
- Accepted file types: `.txt,.md,.log,.csv,.json,.html,.xml,.yaml,.yml,.text`
- **File size limit**: 10MB. If exceeded, show toast with error message.
- Real-time tokenization on every keystroke (no debounce needed — gpt-tokenizer is fast enough)

File loading pattern (matches wordcounter):

```tsx
const fileInputRef = useRef<HTMLInputElement>(null);
const dropZone = useDropZone(async (file) => {
  if (file.size > 10 * 1024 * 1024) {
    showToast(tc("fileTooLarge"), "error", 3000);
    return;
  }
  const content = await file.text();
  setText(content);
  showToast(tc("fileLoaded"), "success", 2000);
});
```

### 3. Token Visualization (bottom)

**Colored token highlighting:**

Each token rendered as an inline `<span>` with:

- Background: `var(--tool-icon-{index % 20})` at 0.25 opacity
- `rounded px-0.5 mx-px` spacing
- `title` attribute with token metadata for hover tooltip

Special character rendering:

- Newlines → `↵` symbol + `<br/>`
- Leading/trailing spaces → visible with subtle background
- Consecutive spaces → preserved as-is with background color making them visible

**Hover tooltip** (native `title` attribute):

```
Token #3
Text: " world"
ID: 995
```

**Performance guard:**

- Maximum 2000 tokens rendered in visualization
- If exceeded: show notice "Showing first 2000 of {total} tokens"
- Stats cards always reflect full text (not truncated)

### 4. Description Component

Follows the standard Description pattern (matches wordcounter):

```tsx
function Description() {
  const t = useTranslations("tokencounter");
  const tc = useTranslations("common");
  const locale = useLocale();

  const faqItems = [1, 2, 3].map((i) => ({
    title: t(`descriptions.faq${i}Q`),
    content: <p>{t(`descriptions.faq${i}A`)}</p>,
  }));

  return (
    <section id="description" className="mt-8">
      {/* AEO Definition */}
      <div className="border-l-2 border-accent-cyan/40 pl-4 py-2.5 mb-4">
        <p className="text-fg-secondary text-sm leading-relaxed">
          {t("descriptions.aeoDefinition")}
        </p>
      </div>

      {/* What is */}
      <div className="mb-4">
        <h2 className="font-semibold text-fg-primary text-base">{t("descriptions.whatIsTitle")}</h2>
        <div className="mt-1 space-y-1.5 text-fg-secondary text-sm leading-relaxed">
          <p>{renderLinkedText(t("descriptions.whatIsP1"), locale)}</p>
          <p>{t("descriptions.whatIsP2")}</p>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <CircleHelp size={16} className="text-accent-cyan shrink-0" aria-hidden="true" />
          <h2 className="font-semibold text-fg-primary text-base text-pretty">
            {tc("descriptions.faqTitle")}
          </h2>
        </div>
        <Accordion items={faqItems} />
      </div>
    </section>
  );
}
```

Imports needed for Description: `renderLinkedText` from `utils/linked-text`, `CircleHelp` from `lucide-react`, `Accordion` from `components/ui/accordion`.

## i18n

### Translation Keys (`token-counter.json`)

```json
{
  "textareaPlaceholder": "Enter or paste text to count tokens...",
  "tokens": "Tokens",
  "characters": "Characters",
  "charsPerToken": "Chars/Token",
  "contextUsage": "Context Usage",
  "contextWindow": "Based on GPT-4o 128K context window",
  "showingPartial": "Showing first {limit} of {total} tokens",
  "descriptions": {
    "aeoDefinition": "...",
    "whatIsTitle": "...",
    "whatIsP1": "...",
    "whatIsP2": "...",
    "faq1Q": "...",
    "faq1A": "...",
    "faq2Q": "...",
    "faq2A": "...",
    "faq3Q": "...",
    "faq3A": "..."
  }
}
```

### tools.json Entry

English:

```json
"tokencounter": {
  "title": "Token Counter - OpenAI GPT Token Count & BPE Visualization",
  "shortTitle": "Token Counter",
  "description": "Count OpenAI GPT tokens (o200k_base) with real-time BPE tokenization visualization"
}
```

Note: `title` is required for SEO metadata (`generatePageMeta` uses `t("tokencounter.title")`). It should be a full SEO-optimized title. `shortTitle` is used for page heading and tool cards.

CJK searchTerms follow the project convention (romanized full + initials + 2-3 discriminating keywords).

### Common Keys

No new common keys needed — reuse `loadFile`, `clear`, `fileLoaded`, `cleared`, `dropActive`.

## SEO

- `page.tsx` generates metadata via `generatePageMeta()` for OG/Twitter/canonical
- `page.tsx` generates JSON-LD schemas via `buildToolSchemas()` (WebApplication + BreadcrumbList + FAQPage)
- `Description` component with `aeoDefinition` blockquote + FAQ accordion
- Sitemap auto-covered by existing `app/sitemap.ts`
- JSON-LD FAQ items sourced from translation keys `descriptions.faq{1-3}Q/A`

## Files to Modify

1. **New**: `app/[locale]/token-counter/page.tsx` — route entry with `generateMetadata` + `buildToolSchemas`
2. **New**: `app/[locale]/token-counter/token-counter-page.tsx` — page component with Conversion + Description
3. **New**: `libs/token-counter/main.ts` — `tokenize()` function, `TokenInfo`/`TokenResult` interfaces
4. **New**: `public/locales/{10 locales}/token-counter.json` — tool-specific translations
5. **Modify**: `libs/tools.ts`:
   - Add `{ key: "tokencounter", path: "/token-counter", icon: Hash }` to `TOOLS` array
   - Add `"tokencounter"` to `TOOL_CATEGORIES` text array (after `"wordcounter"`, before `"deduplines"`)
   - Add `tokencounter: ["wordcounter", "regex", "textcase"]` to `TOOL_RELATIONS`
   - Update `wordcounter` relations to include `"tokencounter"`
6. **Modify**: `public/locales/{10 locales}/tools.json` — add `tokencounter` entry with `title`, `shortTitle`, `description`, and locale-specific `searchTerms`
7. **Install**: `npm install gpt-tokenizer`
