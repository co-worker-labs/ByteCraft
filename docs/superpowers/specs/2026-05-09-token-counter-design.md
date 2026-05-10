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
├── page.tsx                       # Route entry
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
- Category: `text` (added to end of text tools list)
- Icon: `Hash` (from lucide-react — represents counting/hashing)
- TOOL_RELATIONS: `tokencounter: ["wordcounter", "regex", "textcase"]` + update `wordcounter` relations to include `tokencounter`

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
```

Exports a single `tokenize(text: string): TokenResult` function. Wraps `gpt-tokenizer`'s `encode()` and maps each token ID back to its text slice.

### Page Component (`token-counter-page.tsx`)

Follows standard tool page pattern:

```tsx
export default function TokenCounterPage() {
  return (
    <Layout title={...} categoryLabel={...} categorySlug="text-processing">
      <PrivacyBanner />
      <Conversion />
      <Description />
      <RelatedTools currentTool="tokencounter" />
    </Layout>
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

### 2. Text Input (middle)

- `StyledTextarea` with `font-mono h-[30vh] resize-y`
- File drag-and-drop via `useDropZone` hook
- "Load File" button (top-left) + "Clear" button (top-right, conditional on text)
- Accepted file types: `.txt,.md,.log,.csv,.json,.html,.xml,.yaml,.yml,.text`
- Real-time tokenization on every keystroke (no debounce needed — gpt-tokenizer is fast enough)

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
  "shortTitle": "Token Counter",
  "description": "Count OpenAI GPT tokens (o200k_base) with real-time BPE tokenization visualization"
}
```

CJK searchTerms follow the project convention (romanized full + initials + 2-3 discriminating keywords).

### Common Keys

No new common keys needed — reuse `loadFile`, `clear`, `fileLoaded`, `cleared`, `dropActive`.

## SEO

- `page.tsx` uses `generatePageMeta()` for OG/Twitter/canonical metadata
- `Description` component with `aeoDefinition` blockquote + FAQ accordion
- Sitemap auto-covered by existing `app/sitemap.ts`
- JSON-LD auto-covered by existing component

## Files to Modify

1. **New**: `app/[locale]/token-counter/page.tsx`
2. **New**: `app/[locale]/token-counter/token-counter-page.tsx`
3. **New**: `libs/token-counter/main.ts`
4. **New**: `public/locales/{10 locales}/token-counter.json`
5. **Modify**: `libs/tools.ts` — add tool entry, category, relations
6. **Modify**: `public/locales/{10 locales}/tools.json` — add tokencounter entry
7. **Install**: `npm install gpt-tokenizer`
