# BIP39 Word List Tool — Design Spec

## Summary

Add a new standalone tool at `/bip39` that displays the complete BIP39 English word list (2048 words) in a searchable grid layout. The wallet tool page links to it for reference and SEO discoverability.

## Approach

Client-side only. Import `wordlist` directly from `@scure/bip39/wordlists/english.js` in the page component — no new libs files needed. Consistent with how ASCII Table (`libs/ascii.ts`) and HTML Code (`libs/htmlcode.ts`) handle static reference data.

## File Structure

```
app/[locale]/bip39/
├── page.tsx          # Route entry, SEO metadata, JSON-LD
└── bip39-page.tsx    # Page component: top description + word grid + bottom description
```

No new `libs/` files.

## Tool Registration

In `libs/tools.ts`:

- `TOOLS` array: add `{ key: "bip39", path: "/bip39", icon: BookOpen }` (or similar list/reference icon)
- `TOOL_CATEGORIES`: add `"bip39"` to the `reference` category (alongside `httpstatus`, `ascii`, `htmlcode`)
- `TOOL_RELATIONS`:
  - `wallet` array: add `"bip39"`
  - `bip39` array: add `["wallet", "password"]`

## page.tsx

Follows the same pattern as `ascii/page.tsx` and `httpstatus/page.tsx`:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import BIP39Page from "./bip39-page";

const PATH = "/bip39";
const TOOL_KEY = "bip39";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("bip39.title"),
    description: t("bip39.description"),
  });
}

export default async function BIP39Route({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "bip39" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const schemas = buildToolSchemas({
    name: t("bip39.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("bip39.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems: [1, 2].map((i) => ({
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
      <BIP39Page />
    </>
  );
}
```

## Page Component: bip39-page.tsx

### Structure

Follows the reference tool pattern (see `ascii-page.tsx`, `httpstatus-page.tsx`): TopDescription with expand/collapse → tip → main content → BottomDescription with FAQ → RelatedTools.

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import Layout from "../../../components/layout";
import { StyledInput } from "../../../components/ui/input";
import { Accordion } from "../../../components/ui/accordion";
import RelatedTools from "../../../components/related-tools";
import { CircleHelp } from "lucide-react";
import { wordlist } from "@scure/bip39/wordlists/english";

const WORDS: string[] = wordlist;

function TopDescription() {
  // Expand/collapse intro text with gradient fade (same pattern as ascii, httpstatus)
}

function WordGrid() {
  // Search input + filtered word grid
}

function BottomDescription() {
  // BIP39 explanation sections + FAQ accordion
}

export default function BIP39Page() {
  const t = useTranslations("tools");
  return (
    <Layout
      title={t("bip39.shortTitle")}
      categoryLabel={t("categories.reference")}
      categorySlug="reference-lookup"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <TopDescription />
        <WordGrid />
        <BottomDescription />
        <RelatedTools currentTool="bip39" />
      </div>
    </Layout>
  );
}
```

### TopDescription Component

Expand/collapse pattern matching `ascii-page.tsx:310-356` and `httpstatus-page.tsx:238-278`:

- `max-h-20` collapsed with gradient fade overlay
- ChevronDown/ChevronUp toggle with `tc("showMore")` / `tc("showLess")`
- Content from `t("descriptions.text")`

### WordGrid Component

**Search bar:** `StyledInput` with `Search` icon at top, placeholder from i18n key `searchPlaceholder`.

**Stats line:** Below the grid — `"{count} / 2048 words"` (matches `ascii-page.tsx:267-269` and `httpstatus-page.tsx:231-233` pattern).

**Grid layout:** Responsive CSS grid.

| Breakpoint | Columns |
| ---------- | ------- |
| Mobile     | 3       |
| Tablet     | 4       |
| Desktop    | 5–6     |

**Grid cell:** Each cell shows:

- Word index (1-based): `text-fg-muted text-xs`
- Word text: `text-fg-primary font-mono text-sm`
- Hover: `bg-bg-elevated/60` highlight (matches table hover pattern)
- Search match highlight: matched portion in `text-accent-cyan`

**Search logic:**

- Input trimmed, lowercased
- `filter(word => word.includes(query))` — `includes` (not `startsWith`) so users can search by substring (e.g. search "tion" to find all words ending in -tion)
- Empty query shows all 2048 words
- React Compiler auto-memoizes the filtered list

**Empty state:** When no words match, show centered `t("noResults")` text (matches `httpstatus-page.tsx:218-226` pattern).

### BottomDescription Component

Same pattern as `httpstatus-page.tsx:281-308`:

- `aeoDefinition` in border-left highlight box
- Description sections with `whatIsTitle` / `whatIs`, etc.
- FAQ Accordion with `CircleHelp` icon header

## Wallet Page Integration

### RelatedTools

Already covered by `TOOL_RELATIONS` mapping — the `<RelatedTools currentTool="wallet" />` component will automatically show the bip39 link.

### Description Link

Add a sentence in the wallet page's BIP39 description section linking to `/bip39`. Update i18n key `descriptions.bip39` to include link text like "View the complete BIP39 word list →".

Two options for implementation:

- Option A: Use a rich-text i18n approach (e.g., splitting the key into `bip39Prefix` + `bip39LinkText`)
- Option B: Keep it simple — add the link as a separate element below the paragraph, not embedded in the translated string

**Chosen: Option B** — add a small link element after the BIP39 description paragraph. Avoids complex ICU message formatting for a single link.

## i18n

### New file: `public/locales/{locale}/bip39.json`

Keys:

- `searchPlaceholder` — "Search BIP39 words..."
- `noResults` — "No words found"
- `descriptions.text` — TopDescription intro text (expand/collapse section)
- `descriptions.aeoDefinition` — SEO description for JSON-LD (e.g. "BIP39 Word List is a free online reference for the complete BIP39 mnemonic word list with search...")
- `descriptions.whatIsTitle` / `descriptions.whatIs` — What is BIP39
- `descriptions.purposeTitle` / `descriptions.purpose` — Purpose of the word list
- `descriptions.securityTitle` / `descriptions.security` — Security notes
- `descriptions.faq1Q` / `descriptions.faq1A` — FAQ items (2 items)

### Update: `public/locales/{locale}/tools.json`

Add `bip39` entry with:

- `shortTitle` — "BIP39 Word List"
- `description` — "Complete BIP39 mnemonic word list reference with search"
- `searchTerms` (CJK only) — romanized tokens per AGENTS.md convention

### Update: `public/locales/{locale}/wallet.json`

- Add `viewWordList` key — "View complete BIP39 word list →" (used in wallet description link)

### Locales

All 10 locales: en, zh-CN, zh-TW, ja, ko, es, pt-BR, fr, de, ru.

## SEO

- `page.tsx` uses `generatePageMeta()` for canonical URL, alternates, OG, Twitter
- `buildToolSchemas()` for JSON-LD (WebApplication, BreadcrumbList)
- `app/sitemap.ts` automatically includes the new route via tool registry

## Files Modified

| File                                  | Change                                             |
| ------------------------------------- | -------------------------------------------------- |
| `libs/tools.ts`                       | Register bip39 tool, icon, category, related tools |
| `app/[locale]/bip39/page.tsx`         | New — route entry                                  |
| `app/[locale]/bip39/bip39-page.tsx`   | New — page component                               |
| `app/[locale]/wallet/wallet-page.tsx` | Add link to bip39 in Description                   |
| `public/locales/{locale}/bip39.json`  | New × 10 — tool translations                       |
| `public/locales/{locale}/tools.json`  | Update × 10 — bip39 entry                          |
| `public/locales/{locale}/wallet.json` | Update × 10 — add viewWordList key                 |
