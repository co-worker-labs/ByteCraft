# SEO/AEO P0+P1 Optimization Design

> Date: 2026-05-07
> Status: Approved

## Overview

Full implementation of P0 and P1 tasks from the SEO/AEO optimization plan. 7 tasks across 6 independent modules, executed in dependency order.

### Key Decisions

| Decision               | Choice                                                               |
| ---------------------- | -------------------------------------------------------------------- |
| Scope                  | P0 all (3 tasks) + P1 all (4 tasks)                                  |
| Schema injection point | Server-side in `page.tsx`                                            |
| Related Tools mapping  | Manual configuration table                                           |
| Privacy Badge style    | Compact Banner (option B)                                            |
| Related Tools position | Below Description section                                            |
| Bundle optimization    | Full (dynamic imports + Prism.js on-demand + lucide optimization)    |
| httpclient migration   | Migrate to new `buildToolSchemas` pattern, remove old JSX components |

### Implementation Order

1. Font optimization (P0-3)
2. Schema deployment (P0-1)
3. Related Tools (P0-2)
4. Privacy Badge (P1-6)
5. Content layer + Homepage (P1-4/5)
6. Bundle optimization (P1-7)

---

## Module 1: Font Optimization (P0-3)

### Goal

Eliminate CSS `@import url()` render-blocking, replace with `next/font/google` auto-preload.

### File Changes

| File                      | Change                                                      |
| ------------------------- | ----------------------------------------------------------- |
| `app/globals.css`         | Delete line 1 `@import url(...)`                            |
| `app/[locale]/layout.tsx` | Add `next/font/google` imports for Inter and JetBrains Mono |

### Design

In `layout.tsx`, load fonts via `next/font/google`:

```ts
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
```

Add `className={`${inter.variable} ${jetbrainsMono.variable}`}` to `<html>` element. Update `globals.css` `@theme` to reference CSS variables:

```css
--font-family-sans: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
--font-family-mono: var(--font-mono), ui-monospace, monospace;
```

### Expected Impact

FCP improvement 100-300ms. CSS no longer blocks font download.

---

## Module 2: Schema Structured Data Deployment (P0-1)

### Goal

- All 31 tool pages: `WebApplication` + `SoftwareApplication` + `BreadcrumbList` schema
- Pages with FAQ: `FAQPage` schema
- Pages with step guides: `HowTo` schema
- Migrate httpclient to new pattern, remove old JSX components

### File Changes

| File                                          | Change                                                                      |
| --------------------------------------------- | --------------------------------------------------------------------------- |
| `components/json-ld.tsx`                      | Refactor: add `buildToolSchemas()` pure function, remove old JSX components |
| `libs/seo.ts`                                 | No change needed (schemas output directly in page.tsx)                      |
| 31 tool `page.tsx` files                      | Add JSON-LD `<script>` injection                                            |
| `app/[locale]/httpclient/httpclient-page.tsx` | Remove old `WebApplicationJsonLd` / `BreadcrumbJsonLd` usage                |

### Architecture

#### buildToolSchemas function

```ts
// components/json-ld.tsx
export function buildToolSchemas(options: {
  name: string;
  description: string;
  path: string;
  locale: string;
  faqItems?: { q: string; a: string }[];
  howToSteps?: { name: string; text: string }[];
}): object[] {
  const { name, description, path, locale, faqItems, howToSteps } = options;
  const url = `${SITE_URL}${path}`;

  const schemas: object[] = [];

  // WebApplication + SoftwareApplication
  schemas.push({
    "@context": "https://schema.org",
    "@type": ["WebApplication", "SoftwareApplication"],
    name,
    description,
    url,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    browserRequirements: "Requires JavaScript. Requires HTML5.",
  });

  // BreadcrumbList
  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "OmniKit", item: SITE_URL },
      { "@type": "ListItem", position: 2, name, item: url },
    ],
  });

  // FAQPage (optional)
  if (faqItems && faqItems.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
  }

  // HowTo (optional)
  if (howToSteps && howToSteps.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name,
      description,
      step: howToSteps.map((step, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: step.name,
        text: step.text,
      })),
    });
  }

  return schemas;
}
```

#### page.tsx injection pattern

```tsx
import { buildToolSchemas } from "../../../components/json-ld";

export default function ToolRoute() {
  const schemas = buildToolSchemas({
    name: t("json.title"),
    description: t("json.description"),
    path: PATH,
    locale,
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
      <ToolPage />
    </>
  );
}
```

#### FAQ schema targets

| Tool     | FAQ count | Schema  |
| -------- | --------- | ------- |
| password | 5         | FAQPage |
| sshkey   | 4         | FAQPage |

#### HowTo schema targets

| Tool     | Steps          | Schema |
| -------- | -------------- | ------ |
| password | 5              | HowTo  |
| sshkey   | 4              | HowTo  |
| base64   | Has step guide | HowTo  |

#### httpclient migration

Remove `WebApplicationJsonLd` and `BreadcrumbJsonLd` JSX component imports from `httpclient-page.tsx`. Move schema generation to `httpclient/page.tsx` using `buildToolSchemas`. Delete old JSX component exports from `json-ld.tsx`.

#### dateModified

Use build timestamp: `new Date().toISOString()` at build time, passed via environment variable or computed in `buildToolSchemas`.

---

## Module 3: Related Tools Internal Links (P0-2)

### Goal

Each tool page shows 3-5 semantically related tools below the Description section, enhancing internal link structure.

### File Changes

| File                           | Change                                                       |
| ------------------------------ | ------------------------------------------------------------ |
| `libs/tools.ts`                | Add `TOOL_RELATIONS: Record<string, string[]>` mapping table |
| `components/related-tools.tsx` | New component                                                |
| 31 tool `*-page.tsx` files     | Add `<RelatedTools currentTool="xxx" />` after Description   |

### Architecture

#### Mapping table (`libs/tools.ts`)

Manual configuration per tool, 3-5 relations each. Same-category priority + cross-category semantic links. No self-reference.

```ts
export const TOOL_RELATIONS: Record<string, string[]> = {
  json: ["csv", "yaml", "diff", "regex"],
  base64: ["urlencoder", "hashing", "cipher"],
  jwt: ["base64", "hashing", "password"],
  regex: ["json", "textcase", "diff"],
  uuid: ["password", "qrcode", "hashing"],
  hashing: ["checksum", "cipher", "base64", "jwt"],
  urlencoder: ["base64", "numbase", "textcase"],
  unixtime: ["cron", "uuid"],
  diff: ["json", "regex", "csv"],
  password: ["jwt", "sshkey", "uuid", "hashing"],
  sshkey: ["password", "hashing", "jwt"],
  color: ["image", "numbase"],
  cron: ["unixtime", "regex"],
  markdown: ["json", "diff", "htmlcode"],
  qrcode: ["uuid", "urlencoder", "password"],
  textcase: ["regex", "extractor", "wordcounter"],
  deduplines: ["extractor", "textcase", "wordcounter"],
  csv: ["json", "yaml", "diff"],
  "csv-md": ["csv", "markdown", "json"],
  cipher: ["hashing", "base64", "password"],
  numbase: ["color", "storageunit", "ascii"],
  dbviewer: ["csv", "json", "yaml"],
  checksum: ["hashing", "cipher"],
  storageunit: ["numbase", "checksum"],
  httpstatus: ["httpclient", "urlencoder"],
  yaml: ["json", "csv", "markdown"],
  image: ["color", "qrcode", "checksum"],
  htmlcode: ["ascii", "httpstatus", "markdown"],
  ascii: ["htmlcode", "numbase", "httpstatus"],
  extractor: ["regex", "textcase", "deduplines"],
  wordcounter: ["textcase", "extractor", "deduplines"],
  httpclient: ["httpstatus", "urlencoder", "json"],
};
```

#### Component (`components/related-tools.tsx`)

```tsx
"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { TOOLS, TOOL_RELATIONS, getToolIconColor } from "../libs/tools";

interface RelatedToolsProps {
  currentTool: string;
}

export default function RelatedTools({ currentTool }: RelatedToolsProps) {
  const t = useTranslations("tools");
  const locale = useLocale();
  const relatedKeys = TOOL_RELATIONS[currentTool];
  if (!relatedKeys || relatedKeys.length === 0) return null;

  const relatedTools = relatedKeys.map((key) => TOOLS.find((t) => t.key === key)).filter(Boolean);

  // Render: horizontal row of clickable pill/card with icon + name
  // Uses Link for navigation, icon from TOOLS entry, color from getToolIconColor
  // Locale-aware path prefix
}
```

Visual: horizontal row of small cards with tool icon + name, clickable links to tool pages. Responsive: wraps on mobile.

---

## Module 4: Privacy Trust Signal Enhancement (P1-6)

### Goal

Replace existing italic alert text with a more prominent Compact Banner. Unify privacy signals across all tool pages.

### File Changes

| File                            | Change                                        |
| ------------------------------- | --------------------------------------------- |
| `components/privacy-banner.tsx` | New shared component                          |
| `public/locales/*/common.json`  | Update alert text in all 10 locales           |
| 19+ tool `*-page.tsx` files     | Replace inline alert with `<PrivacyBanner />` |

### Architecture

#### Component (`components/privacy-banner.tsx`)

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
    <div className="flex items-center gap-2 border border-accent-cyan/20 bg-accent-cyan-dim/20 rounded-lg p-3 my-4">
      <Lock size={16} className="text-accent-cyan shrink-0" />
      <span className="text-sm text-fg-secondary leading-relaxed">{text}</span>
    </div>
  );
}
```

#### Translation updates

English (`public/locales/en/common.json`):

```json
"alert": {
  "notTransferred": "No data sent to servers — All processing happens in your browser",
  "filesNotTransferred": "Your files stay local — All processing happens in your browser"
}
```

Other 9 locales: translate idiomatically, same meaning.

#### Migration mapping

| Current pattern                                       | New pattern                               |
| ----------------------------------------------------- | ----------------------------------------- |
| Inline `<div>` with `tc("alert.notTransferred")`      | `<PrivacyBanner />`                       |
| Inline `<div>` with `tc("alert.filesNotTransferred")` | `<PrivacyBanner variant="files" />`       |
| `password-page.tsx` custom banner with Lock icon      | `<PrivacyBanner />` (unified)             |
| `checksum-page.tsx` purple extra banner               | Keep (functional tip, not privacy signal) |
| `dbviewer/FileUpload.tsx` inline privacy text         | `<PrivacyBanner variant="files" />`       |

---

## Module 5: Content Layer Completion + Homepage Enhancement (P1-4/5)

### Goal

- Add Description for 5 tools missing it
- Add FAQ (3 items) to all tools that lack FAQ
- Homepage: Organization schema + brand description + tool count + homepage FAQ

### File Changes

| File                                   | Change                                           |
| -------------------------------------- | ------------------------------------------------ |
| 5 tool `*-page.tsx` files              | Add `Description` component                      |
| 31 tool translation files (10 locales) | Add FAQ translation keys                         |
| `components/json-ld.tsx`               | Add `buildOrganizationSchema()` function         |
| `app/[locale]/layout.tsx`              | Inject Organization schema                       |
| Homepage files                         | Add brand description + tool count + FAQ section |

### Architecture

#### 5a. Missing Descriptions

Tools: wordcounter, storageunit, ascii, dbviewer, uuid. Follow existing Style A pattern:

```tsx
function Description() {
  const t = useTranslations("tool-name");
  return (
    <section id="description" className="mt-8">
      <div className="mb-4">
        <h2 className="font-semibold text-fg-primary text-base">{t("descriptions.whatIsTitle")}</h2>
        <div className="mt-1 space-y-1.5 text-fg-secondary text-sm leading-relaxed">
          <p>{t("descriptions.whatIsP1")}</p>
          <p>{t("descriptions.whatIsP2")}</p>
        </div>
      </div>
    </section>
  );
}
```

Translation keys needed in each tool's locale file:

- `descriptions.whatIsTitle`: "What is [Tool Name]?"
- `descriptions.whatIsP1`: First paragraph explaining the tool
- `descriptions.whatIsP2`: Second paragraph with use cases or technical details

#### 5b. FAQ Addition

All tools without existing FAQ get 3 basic FAQ items. Follow password/sshkey FAQ UI pattern (CircleHelp icon + Accordion).

Translation keys in tool-specific files:

```json
{
  "descriptions.faqTitle": "Frequently Asked Questions",
  "descriptions.faq1Q": "...",
  "descriptions.faq1A": "...",
  "descriptions.faq2Q": "...",
  "descriptions.faq2A": "...",
  "descriptions.faq3Q": "...",
  "descriptions.faq3A": "..."
}
```

FAQ content strategy per tool:

- Q1: "What is [tool]?" / basic definition
- Q2: "Is [tool] free/secure?" / trust question
- Q3: Tool-specific common question (e.g., "What hash algorithms are supported?" for Hashing)

Existing FAQ tools (password, sshkey) keep their current FAQ count. Base64 keeps HowTo steps.

#### 5c. Homepage Enhancement

**Organization schema** in `layout.tsx` (global, server-side):

```ts
export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "OmniKit",
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512x512.png`,
    sameAs: ["https://github.com/nickvore"],
    description: "A collection of free, browser-based developer tools.",
  };
}
```

**Homepage content additions:**

- "What is OmniKit?" description paragraph (under 100 words)
- Tool count text: "32+ free developer tools"
- Homepage FAQ section (3-5 general questions about OmniKit)

**FAQ schema for homepage:** Use `FAQPage` schema with the homepage FAQ items.

---

## Module 6: Bundle Optimization (P1-7)

### Goal

Full optimization: dynamic imports for large dependencies, on-demand Prism.js language loading, lucide icon optimization.

### File Changes

| File                               | Change                           |
| ---------------------------------- | -------------------------------- |
| Pages using `@uiw/react-json-view` | `dynamic()` import               |
| Pages using `json5`                | `dynamic()` import               |
| Pages using `rc-slider`            | `dynamic()` import               |
| Markdown tool Prism.js loading     | On-demand language pack loading  |
| `libs/tools.ts`                    | Lucide icon loading optimization |

### Architecture

#### 7a. Large dependency dynamic imports

```tsx
import dynamic from "next/dynamic";

const JsonView = dynamic(() => import("@uiw/react-json-view"), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse bg-bg-input rounded" />,
});

// json5 — dynamic import with async usage
const parseJson5 = async (input: string) => {
  const { default: JSON5 } = await import("json5");
  return JSON5.parse(input);
};

const RcSlider = dynamic(() => import("rc-slider"), { ssr: false });
```

Target pages:

- `json-page.tsx` — `@uiw/react-json-view` + `json5`
- `color-page.tsx` — `rc-slider`

#### 7b. Prism.js on-demand loading

Replace static imports of 13 language packs with dynamic loading:

```ts
async function loadPrismLanguage(lang: string): Promise<void> {
  if (Prism.languages[lang]) return;
  try {
    await import(`prismjs/components/prism-${lang}`);
  } catch {
    // Language not available, fallback to plain text
  }
}
```

Load only when user selects a specific language in the Markdown tool.

#### 7c. Lucide icon optimization

Current: `libs/tools.ts` statically imports 31 lucide icons, all loaded on homepage.

Option: Convert tool cards to lazy-load icons. Since icons are only needed on the homepage card grid, use `next/dynamic` for each icon or use a single SVG sprite.

Approach: Create lightweight icon wrappers that use `dynamic()`:

```tsx
// libs/tool-icons.tsx
import dynamic from "next/dynamic";

const icons = {
  json: dynamic(() => import("lucide-react").then((m) => m.FileJson)),
  base64: dynamic(() => import("lucide-react").then((m) => m.FileCode)),
  // ... 31 entries
};

export function getToolIcon(key: string) {
  return icons[key];
}
```

Update `libs/tools.ts` to use `getToolIcon(key)` instead of direct imports. The `TOOLS` array no longer holds icon references, only keys.

#### 7d. Measurement

Before/after comparison via:

- `next build` output (bundle size per route)
- `@next/bundle-analyzer` for chunk visualization
- Lighthouse score comparison

---

## Cross-Cutting Concerns

### i18n

All new UI text goes through next-intl. English first, then translate to 9 other locales. Follow existing translation file structure (`public/locales/{locale}/`).

### Testing

- Schema output: Vitest tests for `buildToolSchemas()` verifying correct JSON-LD structure
- Related Tools: Vitest test for `TOOL_RELATIONS` completeness (every tool has an entry)
- Privacy Banner: Smoke test for component rendering
- Bundle: Manual verification via `next build` output

### Backward Compatibility

- `WebsiteJsonLd` component in layout.tsx stays (global WebSite schema)
- httpclient old pattern removed as part of migration
- No breaking changes to public API or routes
