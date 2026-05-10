# Token Counter — Plan 2: Page Component & English i18n

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the route entry (`page.tsx`), page component (`token-counter-page.tsx`), and English translation files so that `/token-counter` renders a fully working page.

**Prerequisite:** Plan 1 completed — `gpt-tokenizer` installed, `libs/token-counter/main.ts` exists, tool registered in `libs/tools.ts`.

**Architecture:** Follows the standard two-file page pattern (`page.tsx` for SEO/route + `<tool>-page.tsx` for UI). The Conversion component tokenizes text in real-time and renders colored BPE token spans. The Description component provides AEO content and FAQ accordion.

**Tech Stack:** React (Next.js App Router), next-intl, Tailwind CSS, lucide-react, gpt-tokenizer

---

## File Structure

| Action | File                                                | Responsibility                                                    |
| ------ | --------------------------------------------------- | ----------------------------------------------------------------- |
| Create | `app/[locale]/token-counter/page.tsx`               | Route entry: `generateMetadata` + `buildToolSchemas` JSON-LD      |
| Create | `app/[locale]/token-counter/token-counter-page.tsx` | Page component: `Conversion` + `Description` + `TokenCounterPage` |
| Create | `public/locales/en/token-counter.json`              | English tool-specific translations                                |
| Modify | `public/locales/en/tools.json`                      | Add `tokencounter` entry with title/shortTitle/description        |

---

### Task 1: English i18n Files

**Files:**

- Create: `public/locales/en/token-counter.json`
- Modify: `public/locales/en/tools.json`

- [ ] **Step 1: Create `public/locales/en/token-counter.json`**

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
    "aeoDefinition": "Token Counter is a free online tool that counts OpenAI GPT tokens using the o200k_base encoding (GPT-4o, GPT-4.1, o1, o3, o4-mini, GPT-5). Visualize how text is split into BPE tokens with colored highlighting. No data is sent to any server.",
    "whatIsTitle": "What is a Token Counter?",
    "whatIsP1": "A Token Counter measures how many tokens your text will consume when sent to OpenAI models like GPT-4o and GPT-4.1. Understanding token count helps optimize prompts and avoid exceeding context limits. Pair it with the [Text Diff](/diff) tool to compare token usage between prompt versions.",
    "whatIsP2": "This tool uses the o200k_base encoding, which is the tokenizer used by GPT-4o, o1, o3, o4-mini, and GPT-5. Each colored segment in the visualization represents one BPE (Byte Pair Encoding) token.",
    "faq1Q": "What are tokens?",
    "faq1A": "Tokens are the basic units that language models use to process text. In English, a token is approximately 4 characters or 0.75 words. Common words are single tokens, while rare or complex words may be split into multiple tokens.",
    "faq2Q": "Which models use the o200k_base encoding?",
    "faq2A": "The o200k_base encoding is used by GPT-4o, GPT-4.1, o1, o3, o4-mini, and GPT-5. It supports a vocabulary of approximately 200,000 tokens with improved multilingual coverage compared to the earlier cl100k_base encoding.",
    "faq3Q": "How accurate is the token count?",
    "faq3A": "The count is highly accurate for standard text. It uses the same BPE algorithm as OpenAI's tokenizer. Minor discrepancies may occur for chat-formatted messages (system/user/assistant roles) since this tool counts raw text tokens, not chat template tokens."
  }
}
```

- [ ] **Step 2: Add `tokencounter` entry to `public/locales/en/tools.json`**

Insert between the `"wordcounter"` entry (ends at line 152) and the `"sshkey"` entry (starts at line 153). Add a comma after the `wordcounter` closing brace and insert:

```json
  "tokencounter": {
    "title": "Token Counter - OpenAI GPT Token Count & BPE Visualization",
    "shortTitle": "Token Counter",
    "description": "Count OpenAI GPT tokens (o200k_base) with real-time BPE tokenization visualization. Supports GPT-4o, GPT-4.1, o1, o3, o4-mini, GPT-5."
  },
```

No `searchTerms` needed for English — the spec says: "English: Omit `searchTerms` entirely."

The surrounding context should look like:

```json
  "wordcounter": {
    "title": "Word Counter - Character Count, Reading Time, Keyword Density",
    "shortTitle": "Word Counter",
    "description": "Count words, characters, sentences, and paragraphs. Estimate reading and speaking time. Analyze keyword frequency and density for SEO."
  },
  "tokencounter": {
    "title": "Token Counter - OpenAI GPT Token Count & BPE Visualization",
    "shortTitle": "Token Counter",
    "description": "Count OpenAI GPT tokens (o200k_base) with real-time BPE tokenization visualization. Supports GPT-4o, GPT-4.1, o1, o3, o4-mini, GPT-5."
  },
  "sshkey": {
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/en/token-counter.json public/locales/en/tools.json
git commit -m "feat(token-counter): add English i18n translations"
```

---

### Task 2: Route Entry (page.tsx)

**Files:**

- Create: `app/[locale]/token-counter/page.tsx`

**Reference pattern:** This follows the exact same pattern as `app/[locale]/wordcounter/page.tsx` — read that file for comparison if needed.

- [ ] **Step 1: Create the route entry file**

Create `app/[locale]/token-counter/page.tsx`:

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

export default async function TokenCounterRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
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

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit --pretty 2>&1 | grep -i "token-counter" || echo "No token-counter errors"
```

Expected: "No token-counter errors" (page.tsx won't fully compile yet because `token-counter-page.tsx` doesn't exist, but tsc may not report errors for unused imports in app router).

- [ ] **Step 3: Commit**

```bash
git add app/\[locale\]/token-counter/page.tsx
git commit -m "feat(token-counter): add route entry with SEO metadata and JSON-LD"
```

---

### Task 3: Page Component (token-counter-page.tsx)

**Files:**

- Create: `app/[locale]/token-counter/token-counter-page.tsx`

**Reference pattern:** Follows `app/[locale]/wordcounter/wordcounter-page.tsx` structure. Read that file for comparison.

**Key design decisions:**

- Stats cards: 4-card grid matching wordcounter style
- File upload: `useDropZone` with 10MB size limit, matching wordcounter pattern
- Token visualization: colored spans using `--tool-icon-{i % 20}` CSS variables at 25% opacity via `color-mix()`
- Performance guard: max 2000 tokens rendered, stats always reflect full text
- Special character rendering: newlines → `↵` + `<br/>`

- [ ] **Step 1: Create the page component**

Create `app/[locale]/token-counter/token-counter-page.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { renderLinkedText } from "../../../utils/linked-text";
import { FolderOpen, Upload, X, CircleHelp } from "lucide-react";
import Layout from "../../../components/layout";
import { StyledTextarea } from "../../../components/ui/input";
import { showToast } from "../../../libs/toast";
import { useDropZone } from "../../../hooks/useDropZone";
import { tokenize, CONTEXT_WINDOW } from "../../../libs/token-counter/main";
import type { TokenInfo } from "../../../libs/token-counter/main";
import RelatedTools from "../../../components/related-tools";
import PrivacyBanner from "../../../components/privacy-banner";
import { Accordion } from "../../../components/ui/accordion";

const MAX_VIS_TOKENS = 2000;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function renderTokenText(tokenText: string) {
  const lines = tokenText.split("\n");
  const nodes: React.ReactNode[] = [];
  lines.forEach((line, i) => {
    if (i > 0) {
      nodes.push(
        <span key={`nl-${i}`} className="text-fg-muted">
          {"\u21B5"}
        </span>
      );
      nodes.push(<br key={`br-${i}`} />);
    }
    if (line) nodes.push(line);
  });
  return nodes;
}

function Conversion() {
  const t = useTranslations("tokencounter");
  const tc = useTranslations("common");
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const result = tokenize(text);

  const dropZone = useDropZone(async (file) => {
    if (file.size > MAX_FILE_SIZE) {
      showToast(tc("tooLarge"), "error", 3000);
      return;
    }
    const content = await file.text();
    setText(content);
    showToast(tc("fileLoaded"), "success", 2000);
  });

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      showToast(tc("tooLarge"), "error", 3000);
      e.target.value = "";
      return;
    }
    file.text().then((content) => {
      setText(content);
      showToast(tc("fileLoaded"), "success", 2000);
    });
    e.target.value = "";
  }

  const showPartial = result.tokens.length > MAX_VIS_TOKENS;
  const displayTokens = result.tokens.slice(0, MAX_VIS_TOKENS);

  const statCards = [
    { label: t("tokens"), value: result.tokenCount },
    { label: t("characters"), value: result.charCount },
    {
      label: t("charsPerToken"),
      value: result.tokenCount > 0 ? (result.charCount / result.tokenCount).toFixed(2) : "0",
    },
    {
      label: t("contextUsage"),
      value: `${((result.tokenCount / CONTEXT_WINDOW) * 100).toFixed(3)}%`,
    },
  ];

  return (
    <section id="conversion">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-bg-surface border border-border-default rounded-xl p-4 text-center"
          >
            <div className="text-xs text-fg-muted mb-1">{card.label}</div>
            <div className="text-2xl font-bold text-accent-cyan font-mono">{card.value}</div>
          </div>
        ))}
      </div>

      <div
        className="relative"
        onDragOver={dropZone.onDragOver}
        onDragEnter={dropZone.onDragEnter}
        onDragLeave={dropZone.onDragLeave}
        onDrop={dropZone.onDrop}
      >
        {dropZone.isDragging && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl border-2 border-dashed border-accent-cyan bg-accent-cyan/5 backdrop-blur-sm pointer-events-none">
            <div className="text-center">
              <Upload size={40} className="mx-auto mb-3 text-accent-cyan" />
              <p className="text-lg font-semibold text-accent-cyan">{tc("dropActive")}</p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mb-1.5">
          <button
            type="button"
            className="text-fg-secondary text-xs hover:text-fg-primary transition-colors cursor-pointer inline-flex items-center gap-1"
            onClick={() => fileInputRef.current?.click()}
          >
            <FolderOpen size={12} />
            {tc("loadFile")}
          </button>
          {text && (
            <button
              type="button"
              className="text-danger text-xs hover:text-danger/80 transition-colors cursor-pointer inline-flex items-center gap-1"
              onClick={() => {
                setText("");
                showToast(tc("cleared"), "danger", 2000);
              }}
            >
              <X size={12} />
              {tc("clear")}
            </button>
          )}
        </div>
        <StyledTextarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("textareaPlaceholder")}
          className="font-mono h-[30vh] resize-y"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.log,.csv,.json,.html,.xml,.yaml,.yml,.text"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {result.tokens.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-fg-muted mb-2 font-mono">{t("contextWindow")}</div>
          {showPartial && (
            <div className="text-xs text-fg-muted mb-2">
              {t("showingPartial", { limit: MAX_VIS_TOKENS, total: result.tokens.length })}
            </div>
          )}
          <div className="bg-bg-surface border border-border-default rounded-xl p-4 font-mono text-sm leading-relaxed break-all">
            {displayTokens.map((token, i) => (
              <span
                key={i}
                className="rounded px-0.5 mx-px"
                style={{
                  backgroundColor: `color-mix(in srgb, var(--tool-icon-${i % 20}) 25%, transparent)`,
                }}
                title={`Token #${i}\nText: "${token.text}"\nID: ${token.id}`}
              >
                {renderTokenText(token.text)}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

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
      <div className="border-l-2 border-accent-cyan/40 pl-4 py-2.5 mb-4">
        <p className="text-fg-secondary text-sm leading-relaxed">
          {t("descriptions.aeoDefinition")}
        </p>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold text-fg-primary text-base">{t("descriptions.whatIsTitle")}</h2>
        <div className="mt-1 space-y-1.5 text-fg-secondary text-sm leading-relaxed">
          <p>{renderLinkedText(t("descriptions.whatIsP1"), locale)}</p>
          <p>{t("descriptions.whatIsP2")}</p>
        </div>
      </div>
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

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit --pretty 2>&1 | grep -i "token-counter" || echo "No token-counter errors"
```

Expected: No errors.

- [ ] **Step 3: Verify the dev server renders the page**

```bash
npm run dev &
sleep 8
curl -s http://localhost:3000/token-counter | grep -o "Token Counter" | head -1
kill %1
```

Expected: Outputs `Token Counter`.

- [ ] **Step 4: Commit**

```bash
git add app/\[locale\]/token-counter/token-counter-page.tsx
git commit -m "feat(token-counter): add page component with token visualization"
```

---

## Verification

After completing all tasks:

- [ ] **Run linter**

```bash
npm run lint
```

Expected: No new errors.

- [ ] **Run build**

```bash
npm run build
```

Expected: Build succeeds, `/token-counter` route is listed in output.

- [ ] **Manual smoke test**

1. Open `/token-counter` in browser
2. Type "hello world" — expect 2+ tokens in stats, colored spans in visualization
3. Hover a token span — expect tooltip with Token #, Text, ID
4. Paste a longer text — expect stats update in real-time
5. Drag a `.txt` file onto the textarea — expect content loads
6. Scroll to description — expect FAQ accordion works
7. Check Related Tools section — expect links to wordcounter, regex, textcase
