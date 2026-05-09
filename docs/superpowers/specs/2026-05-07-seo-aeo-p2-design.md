# SEO/AEO P2 Design — AEO Content Architecture + Category Pages + Semantic Links

> OmniKit P2 中长期 SEO/AEO 优化设计，聚焦三项：AEO 答案先行内容架构、工具分类聚合页、语义链接图谱。生成于 2026-05-07。

---

## Overview

This spec covers three interrelated P2 SEO/AEO features:

1. **#8 AEO Answer-First Content** — Embed concise AI-crawlable definitions in every tool page
2. **#9 Category Aggregation Pages** — Create 6 dedicated category landing pages with SEO metadata
3. **#10 Semantic Link Graph** — Add inline tool links within Description text for cross-linking

Language scope: **en + zh-CN** first. Remaining 8 locales to follow.

Approach: **Progressive enhancement** on existing architecture — no new abstraction layers, no content migration.

---

## 1. AEO Answer-First Content Architecture

### Goal

Enable AI search engines (Perplexity, Google AI Overview, ChatGPT Search) to extract and cite precise tool definitions directly from tool pages.

### 1.1 i18n: New `aeoDefinition` field

Add a new key `descriptions.aeoDefinition` to every tool's locale file:

```json
// public/locales/en/json.json
{
  "descriptions": {
    "aeoDefinition": "JSON Formatter is a free online tool that formats, validates, and minifies JSON data instantly in your browser. No data is sent to any server."
  }
}
```

**Writing rules:**

- 40–60 words in English
- Format: `[Tool Name] is a [one-line definition]. [Key differentiator].`
- Must directly answer "What is X?"
- Mention "free" and "browser-based" / "online" / "in your browser"
- Privacy statement: include "no data is sent" or "100% client-side" where natural

**Per-locale adaptation:**

- zh-CN: 60–100 characters, same information density
- Example: "JSON 格式化工具是一个免费的在线 JSON 处理器，可以在浏览器中即时格式化、验证和压缩 JSON 数据。所有操作均在本地完成，不会上传任何数据。"

### 1.2 Description rendering

In each tool's `*-page.tsx` Description function, add the AEO definition as the **first element** inside the `<section id="description">`, before any existing headings:

```tsx
<p className="text-fg-primary text-sm leading-relaxed font-medium">
  {t("descriptions.aeoDefinition")}
</p>
```

- No heading — just a standalone paragraph
- `font-medium` for visual distinction from subsequent content
- This is the first content block AI crawlers encounter in the description area

### 1.3 Schema enhancement

In `buildToolSchemas()` (called from `page.tsx`), update the WebApplication schema's `description` field:

```ts
// In page.tsx, pass aeoDefinition to buildToolSchemas
const schemas = buildToolSchemas({
  name: t("json.title"),
  description: tx("descriptions.aeoDefinition") || t("json.description"),
  path: PATH,
  // ...
});
```

The `description` parameter in `buildToolSchemas` will prefer `aeoDefinition` when available, falling back to the existing `description` from tools.json.

### 1.4 Content production

| Item                     | Count | Scope      |
| ------------------------ | ----- | ---------- |
| `aeoDefinition` per tool | 32    | en + zh-CN |
| Total entries            | 64    | —          |

---

## 2. Category Aggregation Pages

### Goal

Create dedicated landing pages for each of the 6 tool categories, providing SEO-targeted content for category-level keywords and strengthening internal link structure.

### 2.1 URL mapping

Based on `TOOL_CATEGORIES` in `libs/tools.ts`:

| Category key | URL slug               | English title                 |
| ------------ | ---------------------- | ----------------------------- |
| `text`       | `/text-processing`     | Text Processing Tools         |
| `encoding`   | `/encoding-conversion` | Encoding & Conversion Tools   |
| `security`   | `/security-crypto`     | Security & Cryptography Tools |
| `generators` | `/generators`          | Generator Tools               |
| `visual`     | `/visual-media`        | Visual & Media Tools          |
| `reference`  | `/reference-lookup`    | Reference & Lookup Tools      |

Add slug mapping to `libs/tools.ts`:

```ts
export const CATEGORY_SLUGS: Record<ToolCategory, string> = {
  text: "text-processing",
  encoding: "encoding-conversion",
  security: "security-crypto",
  generators: "generators",
  visual: "visual-media",
  reference: "reference-lookup",
};
```

### 2.2 File structure

Each category gets its own route directory with a `page.tsx`, sharing a single `CategoryPage` component:

```
components/
└── category-page.tsx          # Shared client component (accepts categoryKey prop)

app/[locale]/
├── text-processing/
│   └── page.tsx               # Route entry: generateMetadata + schema + render
├── encoding-conversion/
│   └── page.tsx
├── security-crypto/
│   └── page.tsx
├── generators/
│   └── page.tsx
├── visual-media/
│   └── page.tsx
└── reference-lookup/
    └── page.tsx
```

Each `page.tsx` imports and renders the shared `<CategoryPage categoryKey="..." />`.

### 2.3 Route entry (`page.tsx`)

Responsibilities:

1. `generateMetadata()` — calls `generatePageMeta()` with category-specific title/description
2. Default export — builds JSON-LD schemas, renders `<CategoryPage categoryKey="..." />`

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildCategorySchema } from "../../../components/json-ld";
import CategoryPage from "../../../components/category-page";

const CATEGORY_KEY = "text";
const PATH = "/text-processing";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "categories" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t(`${CATEGORY_KEY}.title`),
    description: t(`${CATEGORY_KEY}.description`),
  });
}

export default async function TextProcessingRoute({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tc = await getTranslations({ locale, namespace: "categories" });

  // Build tools array for schema using server-side translations
  const categoryTools = TOOL_CATEGORIES.find((c) => c.key === CATEGORY_KEY)!;
  const toolSchemas = categoryTools.tools.map((key) => ({
    name: t(`${key}.shortTitle`),
    url: `${SITE_URL}/${TOOLS.find((tool) => tool.key === key)!.path}`,
  }));

  const schemas = buildCategorySchema({
    name: tc(`${CATEGORY_KEY}.shortTitle`),
    description: tc(`${CATEGORY_KEY}.description`),
    path: PATH,
    tools: toolSchemas,
    faqItems: [1, 2, 3]
      .map((i) =>
        tc.has(`${CATEGORY_KEY}.faq${i}Q`)
          ? {
              q: tc(`${CATEGORY_KEY}.faq${i}Q`),
              a: tc(`${CATEGORY_KEY}.faq${i}A`),
            }
          : null
      )
      .filter(Boolean),
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
      <CategoryPage categoryKey={CATEGORY_KEY} />
    </>
  );
}
```

### 2.4 Shared client component (`components/category-page.tsx`)

```
Layout (title={category shortTitle})
└── container
    ├── Category Description     ← 100–200 word intro paragraph
    ├── Tool Cards Grid          ← Grid of tool cards in this category
    │   └── Each card = existing Card component with icon + title + description + link
    └── FAQ Section              ← 2–3 category-level FAQ items (Accordion)
```

Props: `{ categoryKey: ToolCategory }`

Uses `useTranslations("categories")` for content, `useTranslations("tools")` for tool card titles, and `useLocale()` for locale-prefixed links. Tool cards reuse the same `Card` component and `getToolCardsByKeys()` function from the homepage.

### 2.5 New schema: `buildCategorySchema()`

Add to `components/json-ld.tsx`:

```ts
export function buildCategorySchema(options: {
  name: string;
  description: string;
  path: string;
  tools: { name: string; url: string }[];
  faqItems?: { q: string; a: string }[];
}): object[];
```

Generates:

- **CollectionPage** schema — page type
- **ItemList** schema — ordered list of tools in the category
- **BreadcrumbList** schema — OmniKit > {Category Name}
- **FAQPage** schema — if `faqItems` provided

### 2.6 i18n: New `categories.json`

Create `public/locales/{locale}/categories.json`:

```json
{
  "text": {
    "title": "Text Processing Tools - JSON, Regex, Diff & More | OmniKit",
    "shortTitle": "Text Processing",
    "description": "Free online text processing tools for developers. Format JSON, test regex, compare diffs, convert cases, and more. All tools run 100% in your browser.",
    "intro": "A suite of text processing tools designed for developers...",
    "faq1Q": "What text processing tools does OmniKit offer?",
    "faq1A": "OmniKit provides 8 text processing tools including JSON Formatter, Regex Tester, Text Diff, Markdown Editor, Case Converter, Text Extractor, Word Counter, and Deduplicate Lines.",
    "faq2Q": "Are these text processing tools free?",
    "faq2A": "Yes, all OmniKit text processing tools are completely free and run entirely in your browser. No data is sent to any server."
  },
  "encoding": { ... },
  "security": { ... },
  "generators": { ... },
  "visual": { ... },
  "reference": { ... }
}
```

Each category: 1 title, 1 shortTitle, 1 description, 1 intro, 2–3 FAQ pairs.

### 2.6.1 Namespace registration

Add `"categories"` to the `namespaces` array in `i18n/request.ts`:

```ts
const namespaces = [
  "common",
  "tools",
  "categories", // ← new
  "home",
  // ... existing tool namespaces
];
```

This is required for both `useTranslations("categories")` (client) and `getTranslations({ namespace: "categories" })` (server) to resolve.

### 2.7 Sitemap update

Add 6 category pages to `app/sitemap.ts`, following the existing pattern of iterating over all locales:

```ts
// Category pages: priority 0.7
for (const locale of routing.locales) {
  const localePrefix = locale === routing.defaultLocale ? "" : `/${locale}`;

  for (const [key, slug] of Object.entries(CATEGORY_SLUGS)) {
    const path = `/${slug}`;
    urls.push({
      url: `${SITE_URL}${localePrefix}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: makeAlternates(path),
    });
  }
}
```

### 2.8 Navigation integration

- **Homepage**: Category section headers become links to category pages. In `app/[locale]/home-page.tsx`, replace the current `<span>` with a `<Link>`. Use `useLocale()` for locale prefix:

  ```tsx
  // Before
  <span className="text-sm font-medium text-fg-muted uppercase tracking-wider">
    {categoryNames[cat.key] ?? cat.key}
  </span>

  // After
  <Link
    href={`${prefix}/${CATEGORY_SLUGS[cat.key]}`}
    className="text-sm font-medium text-fg-muted uppercase tracking-wider hover:text-accent-cyan transition-colors"
  >
    {categoryNames[cat.key] ?? cat.key}
  </Link>
  ```

- **Tool pages**: A category badge appears after the AEO definition paragraph in Description, linking to the category page. Uses the existing `Badge` component:

  ```tsx
  import Link from "next/link";
  import { Badge } from "../../../components/ui/badge";
  import { useLocale, useTranslations } from "next-intl";
  import { CATEGORY_SLUGS } from "../../../libs/tools";

  // Inside Description function:
  const locale = useLocale();
  const tc = useTranslations("tools");
  const prefix = locale === "en" ? "" : `/${locale}`;
  const categorySlug = CATEGORY_SLUGS[categoryKey]; // categoryKey determined per tool

  <Link href={`${prefix}/${categorySlug}`}>
    <Badge>{tc(`categories.${categoryKey}`)}</Badge>
  </Link>;
  ```

  The badge sits inline after the AEO `<p>`, before the first `<h2>`. Style: existing `Badge` variant, clickable, subtle hover effect via parent `Link`.

- **ToolsDrawer**: No change (already flat list with search)

### 2.9 Content production

| Item                    | Count       | Scope      |
| ----------------------- | ----------- | ---------- |
| Category descriptions   | 6           | en + zh-CN |
| Category FAQ (2–3 each) | 12–18 pairs | en + zh-CN |
| Total entries           | ~48         | —          |

---

## 3. Semantic Link Graph (Inline Description Links)

### Goal

Embed natural inline links to related tools within Description paragraph text, strengthening the internal link network and improving user discovery paths.

### 3.1 Rendering function: `renderLinkedText()`

Create `utils/linked-text.tsx`:

```tsx
import Link from "next/link";
import { TOOL_PATHS } from "../libs/tools";

// Parses [text](/path) patterns in i18n text and renders them as <Link>
// Only matches paths that are valid tool routes
export function renderLinkedText(text: string, locale: string): React.ReactNode[] {
  const prefix = locale === "en" ? "" : `/${locale}`;
  const pattern = /\[([^\]]+)\]\((\/[^)]+)\)/g;
  // Split text by matches, replace valid tool paths with <Link>,
  // leave invalid matches as plain text
}
```

Add `TOOL_PATHS` export to `libs/tools.ts` (avoids importing the full `TOOLS` array with 32 lucide icons into client components):

```ts
export const TOOL_PATHS = new Set(TOOLS.map((t) => t.path));
```

**Validation**: `TOOL_PATHS` is derived from the canonical `TOOLS` array. Only paths in this set are rendered as links. Invalid paths remain as plain text. This prevents broken links from i18n typos and avoids manual path maintenance.

### 3.2 i18n link syntax

Use markdown-style `[text](path)` syntax in Description paragraph values:

```
"JSON is widely used for APIs and configuration. Use the [CSV converter](/csv) to transform JSON into spreadsheets, or [YAML formatter](/yaml) for YAML output."
```

**Rules:**

- 2–4 inline links per tool, in 2–3 selected paragraphs
- Links must flow naturally in text — never forced
- Prioritize links to tools in `TOOL_RELATIONS`
- Only add links to paragraphs where a related tool mention is natural (typically `whatIsP1` and `useCasesP1`)
- No links in FAQ text (keep FAQ concise)
- Path format: `/tool-key` (always English path, locale prefix added at render time)

### 3.3 Usage in page components

In tool `*-page.tsx` Description functions, wrap appropriate paragraphs. Use `useLocale()` from `next-intl` to get the current locale (Description is a `"use client"` component that does not receive locale as a prop):

```tsx
import { useLocale, useTranslations } from "next-intl";
import { renderLinkedText } from "../../../utils/linked-text";

function Description() {
  const t = useTranslations("json");
  const locale = useLocale();

  // Before
  <p className="text-fg-secondary text-sm leading-relaxed">{t("descriptions.whatIsP1")}</p>

  // After
  <p className="text-fg-secondary text-sm leading-relaxed">{renderLinkedText(t("descriptions.whatIsP1"), locale)}</p>
}
```

Not every paragraph needs `renderLinkedText` — only those containing link syntax. Plain paragraphs remain unchanged.

### 3.4 Content production

| Item                  | Count                            | Scope      |
| --------------------- | -------------------------------- | ---------- |
| Paragraphs with links | ~64–96 (2–3 per tool × 32 tools) | en + zh-CN |
| Total inline links    | ~128–192                         | en + zh-CN |

---

## 4. Integration: BreadcrumbList Upgrade

### Current (2-level)

```json
{ "position": 1, "name": "OmniKit", "item": "https://omnikit.run" }
{ "position": 2, "name": "JSON Formatter", "item": "https://omnikit.run/json" }
```

### New (3-level)

```json
{ "position": 1, "name": "OmniKit", "item": "https://omnikit.run" }
{ "position": 2, "name": "Text Processing", "item": "https://omnikit.run/text-processing" }
{ "position": 3, "name": "JSON Formatter", "item": "https://omnikit.run/json" }
```

### Changes to `buildToolSchemas()`

Add optional `categoryName` and `categoryPath` parameters:

```ts
export function buildToolSchemas(options: {
  name: string;
  description: string;
  path: string;
  faqItems?: { q: string; a: string }[];
  howToSteps?: { name: string; text: string }[];
  categoryName?: string;
  categoryPath?: string;
}): object[];
```

When `categoryName` + `categoryPath` are provided, BreadcrumbList becomes 3-level. Otherwise falls back to current 2-level (backward compatible).

Each tool's `page.tsx` passes the category info:

```ts
import { TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";

// Find category for this tool
const category = TOOL_CATEGORIES.find(c => c.tools.includes("json"))!;
const categorySlug = CATEGORY_SLUGS[category.key];

const schemas = buildToolSchemas({
  name: t("json.title"),
  description: tx("descriptions.aeoDefinition") || t("json.description"),
  path: PATH,
  categoryName: tc(`${category.key}.shortTitle`),
  categoryPath: `/${categorySlug}`,
  faqItems: [...],
});
```

### Helper function

Add to `libs/tools.ts`:

```ts
export function getToolCategory(toolKey: string): ToolCategory | undefined {
  return TOOL_CATEGORIES.find((c) => c.tools.includes(toolKey))?.key;
}
```

---

## 5. Files Modified/Created

### New files

| File                                        | Purpose                        |
| ------------------------------------------- | ------------------------------ |
| `utils/linked-text.tsx`                     | Inline link rendering function |
| `components/category-page.tsx`              | Shared category page component |
| `public/locales/en/categories.json`         | English category page content  |
| `public/locales/zh-CN/categories.json`      | Chinese category page content  |
| `app/[locale]/text-processing/page.tsx`     | Text Processing category route |
| `app/[locale]/encoding-conversion/page.tsx` | Encoding category route        |
| `app/[locale]/security-crypto/page.tsx`     | Security category route        |
| `app/[locale]/generators/page.tsx`          | Generators category route      |
| `app/[locale]/visual-media/page.tsx`        | Visual category route          |
| `app/[locale]/reference-lookup/page.tsx`    | Reference category route       |

### Modified files

| File                                       | Change                                                                                          |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `libs/tools.ts`                            | Add `CATEGORY_SLUGS` mapping + `TOOL_PATHS` set + `getToolCategory()` helper                    |
| `i18n/request.ts`                          | Add `"categories"` to namespaces array                                                          |
| `components/json-ld.tsx`                   | Add `buildCategorySchema()`, update `buildToolSchemas()` for 3-level breadcrumb                 |
| `app/sitemap.ts`                           | Add 6 category page entries                                                                     |
| `app/[locale]/home-page.tsx`               | Category headers become links                                                                   |
| 32 × `app/[locale]/{tool}/{tool}-page.tsx` | Add AEO definition paragraph + category badge + `renderLinkedText()` on selected paragraphs     |
| 32 × `app/[locale]/{tool}/page.tsx`        | Pass `categoryName`/`categoryPath` to `buildToolSchemas()`, use `aeoDefinition` for description |
| 32 × `public/locales/en/{tool}.json`       | Add `descriptions.aeoDefinition`, add inline links in Description paragraphs                    |
| 32 × `public/locales/zh-CN/{tool}.json`    | Same as English                                                                                 |

---

## 6. Content Production Plan

### Phase 1: Architecture (no content dependencies)

- `utils/linked-text.tsx`
- `libs/tools.ts` changes (CATEGORY_SLUGS, getToolCategory)
- `components/json-ld.tsx` changes (buildCategorySchema, 3-level breadcrumb)
- `components/category-page.tsx` shared component (reused by all 6 routes via `categoryKey` prop)
- 6 × `page.tsx` route entries
- `app/sitemap.ts` update
- `home-page.tsx` link update

### Phase 2: en content

- `public/locales/en/categories.json` (6 categories)
- 32 × `public/locales/en/{tool}.json` (aeoDefinition + inline links)
- 32 × `*-page.tsx` and `page.tsx` updates

### Phase 3: zh-CN content

- `public/locales/zh-CN/categories.json` (6 categories)
- 32 × `public/locales/zh-CN/{tool}.json` (aeoDefinition + inline links)

### Remaining 8 locales

- Deferred — will be populated in a follow-up task using the en content as source

---

## 7. Out of Scope

- **#11 Recipe system (CyberChef-style)** — deferred to separate spec due to architectural complexity
- **`SpeakableSpecification` schema** — Google has deprecated this type
- **New Description section** — AEO definition embeds in existing Description
- **Automated link generation** — all inline links are manually curated for quality
- **Changes to RelatedTools component** — bottom-of-page related tools remain unchanged
- **Remaining 8 locale translations** — deferred to follow-up
