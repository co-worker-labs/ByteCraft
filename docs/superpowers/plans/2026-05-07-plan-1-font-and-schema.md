# Plan 1: Font Optimization + Schema Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate CSS `@import url()` render-blocking for fonts, and deploy JSON-LD structured data schemas to all 32 tool pages.

**Architecture:** Replace Google Fonts CSS import with `next/font/google` in `layout.tsx` (auto-preload, zero render-blocking). Refactor `components/json-ld.tsx` from 3 JSX components to a pure `buildToolSchemas()` function. Inject schemas server-side in each tool's `page.tsx`. Migrate httpclient from old JSX pattern to new pattern.

**Tech Stack:** Next.js 16 App Router, `next/font/google`, next-intl server translations, schema.org JSON-LD, Vitest

---

## File Structure

| File                                          | Responsibility                                                               | Status |
| --------------------------------------------- | ---------------------------------------------------------------------------- | ------ |
| `app/globals.css`                             | Delete `@import url(...)` line 1, update `@theme` font-family vars           | Modify |
| `app/[locale]/layout.tsx`                     | Add `next/font/google` imports, apply font CSS vars to `<html>`              | Modify |
| `components/json-ld.tsx`                      | Add `buildToolSchemas()` + `buildOrganizationSchema()`, keep `WebsiteJsonLd` | Modify |
| 32 tool `page.tsx` files                      | Add JSON-LD `<script>` injection via `buildToolSchemas()`                    | Modify |
| `app/[locale]/httpclient/httpclient-page.tsx` | Remove old `WebApplicationJsonLd` / `BreadcrumbJsonLd` imports and usage     | Modify |
| `libs/__tests__/json-ld.test.ts`              | Unit tests for `buildToolSchemas()`                                          | Create |

---

## Task 1: Font Optimization

**Files:**

- Modify: `app/globals.css:1` (delete @import), `app/globals.css:114-115` (update @theme font vars)
- Modify: `app/[locale]/layout.tsx:1,79` (add font imports, apply className)

- [ ] **Step 1: Add `next/font/google` imports to layout.tsx**

Add these imports at the top of `app/[locale]/layout.tsx`, after the existing imports (line 16):

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

- [ ] **Step 2: Apply font CSS variable classes to `<html>` element**

In `app/[locale]/layout.tsx` line 79, change:

```tsx
<html lang={locale} className={initialTheme === "dark" ? "dark" : ""} suppressHydrationWarning>
```

to:

```tsx
<html lang={locale} className={`${inter.variable} ${jetbrainsMono.variable}${initialTheme === "dark" ? " dark" : ""}`} suppressHydrationWarning>
```

- [ ] **Step 3: Delete CSS @import in globals.css**

Delete line 1 of `app/globals.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap");
```

- [ ] **Step 4: Update `@theme` font-family in globals.css**

In `app/globals.css` `@theme` block (lines 114-115), change:

```css
--font-family-mono: "JetBrains Mono", monospace;
--font-family-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
```

to:

```css
--font-family-mono: var(--font-mono), ui-monospace, monospace;
--font-family-sans: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
```

- [ ] **Step 5: Verify dev server starts**

Run: `npm run dev`
Expected: Server starts without errors, fonts render correctly in browser.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css app/\[locale\]/layout.tsx
git commit -m "perf: replace CSS @import fonts with next/font/google"
```

---

## Task 2: Refactor json-ld.tsx — Add buildToolSchemas

**Files:**

- Modify: `components/json-ld.tsx`
- Create: `libs/__tests__/json-ld.test.ts`

- [ ] **Step 1: Write failing tests for buildToolSchemas**

Create `libs/__tests__/json-ld.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildToolSchemas } from "../../components/json-ld";

describe("buildToolSchemas", () => {
  const base = {
    name: "JSON Formatter",
    description: "Format and validate JSON online",
    path: "/json",
  };

  it("returns WebApplication + BreadcrumbList schemas", () => {
    const schemas = buildToolSchemas(base);
    expect(schemas).toHaveLength(2);

    const webApp = schemas[0] as Record<string, unknown>;
    expect(webApp["@type"]).toEqual(["WebApplication", "SoftwareApplication"]);
    expect(webApp.name).toBe("JSON Formatter");
    expect(webApp.url).toBe("https://omnikit.run/json");
    expect(webApp.applicationCategory).toBe("DeveloperApplication");
    expect(webApp.offers).toEqual({
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    });

    const breadcrumb = schemas[1] as Record<string, unknown>;
    expect(breadcrumb["@type"]).toBe("BreadcrumbList");
    const items = breadcrumb.itemListElement as Record<string, unknown>[];
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe("OmniKit");
    expect(items[1].name).toBe("JSON Formatter");
  });

  it("includes FAQPage schema when faqItems provided", () => {
    const schemas = buildToolSchemas({
      ...base,
      faqItems: [
        { q: "What is JSON?", a: "A data format" },
        { q: "Is it free?", a: "Yes" },
      ],
    });
    expect(schemas).toHaveLength(3);

    const faq = schemas[2] as Record<string, unknown>;
    expect(faq["@type"]).toBe("FAQPage");
    const entities = faq.mainEntity as Record<string, unknown>[];
    expect(entities).toHaveLength(2);
    expect(entities[0].name).toBe("What is JSON?");
  });

  it("includes HowTo schema when howToSteps provided", () => {
    const schemas = buildToolSchemas({
      ...base,
      howToSteps: [
        { name: "Open tool", text: "Navigate to the page" },
        { name: "Paste JSON", text: "Paste your JSON string" },
      ],
    });
    expect(schemas).toHaveLength(3);

    const howTo = schemas[2] as Record<string, unknown>;
    expect(howTo["@type"]).toBe("HowTo");
    const steps = howTo.step as Record<string, unknown>[];
    expect(steps).toHaveLength(2);
    expect(steps[0].position).toBe(1);
    expect(steps[1].position).toBe(2);
  });

  it("includes all 4 schemas when both faq and howTo provided", () => {
    const schemas = buildToolSchemas({
      ...base,
      faqItems: [{ q: "Q1", a: "A1" }],
      howToSteps: [{ name: "Step 1", text: "Do something" }],
    });
    expect(schemas).toHaveLength(4);
    expect((schemas[0] as Record<string, unknown>)["@type"]).toEqual([
      "WebApplication",
      "SoftwareApplication",
    ]);
    expect((schemas[1] as Record<string, unknown>)["@type"]).toBe("BreadcrumbList");
    expect((schemas[2] as Record<string, unknown>)["@type"]).toBe("FAQPage");
    expect((schemas[3] as Record<string, unknown>)["@type"]).toBe("HowTo");
  });

  it("omits FAQPage when faqItems is empty array", () => {
    const schemas = buildToolSchemas({ ...base, faqItems: [] });
    expect(schemas).toHaveLength(2);
  });

  it("uses SITE_URL env or default for absolute URLs", () => {
    const schemas = buildToolSchemas(base);
    const webApp = schemas[0] as Record<string, unknown>;
    expect(webApp.url as string).toContain("omnikit.run/json");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run libs/__tests__/json-ld.test.ts`
Expected: FAIL — `buildToolSchemas` is not exported from `components/json-ld`

- [ ] **Step 3: Add `buildToolSchemas()` to json-ld.tsx**

In `components/json-ld.tsx`, add the following import at the top (already imported: `SITE_URL` from `"../libs/site"`), then add the function after `BreadcrumbJsonLd` and before the `export` line. **Keep** `WebsiteJsonLd`, `WebApplicationJsonLd`, and `BreadcrumbJsonLd` exports for now (httpclient migration is Task 4).

Add between the `BreadcrumbJsonLd` function closing brace and the `export` line:

```ts
export function buildToolSchemas(options: {
  name: string;
  description: string;
  path: string;
  faqItems?: { q: string; a: string }[];
  howToSteps?: { name: string; text: string }[];
}): object[] {
  const { name, description, path, faqItems, howToSteps } = options;
  const url = `${SITE_URL}${path}`;

  const schemas: object[] = [];

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

  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "OmniKit", item: SITE_URL },
      { "@type": "ListItem", position: 2, name, item: url },
    ],
  });

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

- [ ] **Step 4: Update vitest.config.ts to include the new test**

Add `"libs/__tests__/json-ld.test.ts"` to the `include` array in `vitest.config.ts`. Note: the pattern `"libs/__tests__/*.test.ts"` already exists, so the test will be picked up automatically. Verify by running:

Run: `npx vitest run libs/__tests__/json-ld.test.ts`
Expected: PASS (all 6 tests)

- [ ] **Step 5: Commit**

```bash
git add components/json-ld.tsx libs/__tests__/json-ld.test.ts
git commit -m "feat(schema): add buildToolSchemas pure function with tests"
```

---

## Task 3: Inject Schema into All 32 Tool page.tsx Files

**Files:**

- Modify: All 32 `app/[locale]/{tool}/page.tsx` files

Each tool's `page.tsx` currently follows this exact pattern:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import XxxPage from "./xxx-page";

const PATH = "/xxx";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("xxx.title"),
    description: t("xxx.description"),
  });
}

export default function XxxRoute() {
  return <XxxPage />;
}
```

The target pattern adds `buildToolSchemas` import and schema injection:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import XxxPage from "./xxx-page";

const PATH = "/xxx";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("xxx.title"),
    description: t("xxx.description"),
  });
}

export default function XxxRoute() {
  const t = use(getTranslations({ namespace: "tools" }));
  const schemas = buildToolSchemas({
    name: t("xxx.title"),
    description: t("xxx.description"),
    path: PATH,
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
      <XxxPage />
    </>
  );
}
```

**Important:** `page.tsx` is a server component. We need `getTranslations` (async, from `next-intl/server`) called inside the default export. We can use React `use()` to unwrap the promise, OR restructure to make the component async. Since these are already using `async` for `generateMetadata`, the simplest approach is to make the default export `async` too:

```tsx
export default async function XxxRoute() {
  const t = await getTranslations({ namespace: "tools" });
  const schemas = buildToolSchemas({
    name: t("xxx.title"),
    description: t("xxx.description"),
    path: PATH,
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
      <XxxPage />
    </>
  );
}
```

- [ ] **Step 3a: Inject schema into `json/page.tsx`**

Change `app/[locale]/json/page.tsx` to:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import JsonPage from "./json-page";

const PATH = "/json";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("json.title"),
    description: t("json.description"),
  });
}

export default async function JsonRoute() {
  const t = await getTranslations({ namespace: "tools" });
  const schemas = buildToolSchemas({
    name: t("json.title"),
    description: t("json.description"),
    path: PATH,
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
      <JsonPage />
    </>
  );
}
```

- [ ] **Step 3b: Apply the same pattern to all remaining 31 tool page.tsx files**

For each tool below, apply the identical transformation:

1. Add `import { buildToolSchemas } from "../../../components/json-ld";`
2. Change `export default function XxxRoute()` → `export default async function XxxRoute()`
3. Add `const t = await getTranslations({ namespace: "tools" });`
4. Add `const schemas = buildToolSchemas({ name: t("xxx.title"), description: t("xxx.description"), path: PATH });`
5. Wrap `<XxxPage />` in `<>` with schema `<script>` tags

**Tool list (key → component name → path):**

| #   | Tool key    | Component import | PATH         |
| --- | ----------- | ---------------- | ------------ |
| 1   | base64      | Base64Page       | /base64      |
| 2   | jwt         | JwtPage          | /jwt         |
| 3   | regex       | RegexPage        | /regex       |
| 4   | uuid        | UuidPage         | /uuid        |
| 5   | hashing     | HashingPage      | /hashing     |
| 6   | urlencoder  | UrlEncoderPage   | /urlencoder  |
| 7   | unixtime    | UnixTimePage     | /unixtime    |
| 8   | diff        | DiffPage         | /diff        |
| 9   | password    | PasswordPage     | /password    |
| 10  | sshkey      | SshKeyPage       | /sshkey      |
| 11  | color       | ColorPage        | /color       |
| 12  | cron        | CronPage         | /cron        |
| 13  | markdown    | MarkdownPage     | /markdown    |
| 14  | qrcode      | QrCodePage       | /qrcode      |
| 15  | textcase    | TextCasePage     | /textcase    |
| 16  | deduplines  | DedupLinesPage   | /deduplines  |
| 17  | csv         | CsvPage          | /csv         |
| 18  | csv-md      | CsvMdPage        | /csv-md      |
| 19  | cipher      | CipherPage       | /cipher      |
| 20  | numbase     | NumBasePage      | /numbase     |
| 21  | dbviewer    | DbViewerPage     | /dbviewer    |
| 22  | checksum    | ChecksumPage     | /checksum    |
| 23  | storageunit | StorageUnitPage  | /storageunit |
| 24  | httpstatus  | HttpStatusPage   | /httpstatus  |
| 25  | yaml        | YamlPage         | /yaml        |
| 26  | image       | ImagePage        | /image       |
| 27  | htmlcode    | HtmlCodePage     | /htmlcode    |
| 28  | ascii       | AsciiPage        | /ascii       |
| 29  | extractor   | ExtractorPage    | /extractor   |
| 30  | wordcounter | WordCounterPage  | /wordcounter |
| 31  | httpclient  | HttpClientPage   | /httpclient  |

**Important for httpclient (tool #31):** This is the migration target in Task 4. Apply the same pattern here — the old `WebApplicationJsonLd` / `BreadcrumbJsonLd` usage in `httpclient-page.tsx` will be cleaned up in Task 4.

For each tool, verify the exact component import name by reading the current file's import line. The pattern is always: `import XxxPage from "./xxx-page";`

- [ ] **Step 3c: Verify dev server and spot-check**

Run: `npm run dev`
Visit `/json` → View page source → verify `<script type="application/ld+json">` present with correct WebApplication + BreadcrumbList schema.

- [ ] **Step 3d: Commit**

```bash
git add app/\[locale\]/*/page.tsx
git commit -m "feat(schema): inject JSON-LD structured data into all 32 tool pages"
```

---

## Task 4: Migrate httpclient — Remove Old JSON-LD JSX Components

**Files:**

- Modify: `app/[locale]/httpclient/httpclient-page.tsx:41,880-889`
- Modify: `components/json-ld.tsx:34-87` (remove old components)

- [ ] **Step 4a: Remove old JSON-LD imports and usage from httpclient-page.tsx**

In `app/[locale]/httpclient/httpclient-page.tsx`:

Remove line 41:

```tsx
import { WebApplicationJsonLd, BreadcrumbJsonLd } from "../../../components/json-ld";
```

Remove line 42:

```tsx
import { SITE_URL } from "../../../libs/site";
```

Remove lines 880-890 (the `<WebApplicationJsonLd>` and `<BreadcrumbJsonLd>` elements inside the `<Layout>` tag):

```tsx
      <WebApplicationJsonLd
        name={t("httpclient.title")}
        description={t("httpclient.description")}
        url={`${SITE_URL}/httpclient`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "OmniKit", url: SITE_URL },
          { name: t("httpclient.shortTitle"), url: `${SITE_URL}/httpclient` },
        ]}
      />
```

After removal, the `<Layout>` children should start directly with `<div className="container...">`.

- [ ] **Step 4b: Remove old JSX component exports from json-ld.tsx**

In `components/json-ld.tsx`, delete:

- The `WebApplicationJsonLd` function (lines 34-65)
- The `BreadcrumbJsonLd` function (lines 67-85)
- Update the export line to only export `WebsiteJsonLd`:

Change:

```ts
export { WebsiteJsonLd, WebApplicationJsonLd, BreadcrumbJsonLd };
```

to:

```ts
export { WebsiteJsonLd };
```

- [ ] **Step 4c: Verify no remaining references**

Run: `grep -r "WebApplicationJsonLd\|BreadcrumbJsonLd" --include="*.tsx" app/ components/`
Expected: No results.

- [ ] **Step 4d: Run tests**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 4e: Commit**

```bash
git add app/\[locale\]/httpclient/httpclient-page.tsx components/json-ld.tsx
git commit -m "refactor(schema): migrate httpclient to buildToolSchemas, remove old JSX components"
```

---

## Task 5: Add FAQ/HowTo Schema for password, sshkey, base64

**Files:**

- Modify: `app/[locale]/password/page.tsx`
- Modify: `app/[locale]/sshkey/page.tsx`
- Modify: `app/[locale]/base64/page.tsx`

These 3 tools have extra schema types beyond the basic WebApplication+BreadcrumbList:

| Tool     | Extra schemas                       |
| -------- | ----------------------------------- |
| password | FAQPage (5 items) + HowTo (5 steps) |
| sshkey   | FAQPage (4 items) + HowTo (4 steps) |
| base64   | HowTo (4 steps)                     |

- [ ] **Step 5a: Add FAQ+HowTo schema to password/page.tsx**

The password tool needs 5 FAQ items and 5 HowTo steps. The translations are already in `public/locales/en/password.json` under `descriptions.faq{N}Q/A` and `descriptions.step{N}Title/Desc`.

In `app/[locale]/password/page.tsx`, update the `buildToolSchemas` call:

```tsx
export default async function PasswordRoute() {
  const t = await getTranslations({ namespace: "tools" });
  const tp = await getTranslations({ namespace: "password" });
  const schemas = buildToolSchemas({
    name: t("password.title"),
    description: t("password.description"),
    path: PATH,
    faqItems: [1, 2, 3, 4, 5].map((i) => ({
      q: tp(`descriptions.faq${i}Q`),
      a: tp(`descriptions.faq${i}A`),
    })),
    howToSteps: [1, 2, 3, 4, 5].map((i) => ({
      name: tp(`descriptions.step${i}Title`),
      text: tp(`descriptions.step${i}Desc`),
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
      <PasswordPage />
    </>
  );
}
```

- [ ] **Step 5b: Add FAQ+HowTo schema to sshkey/page.tsx**

Same pattern, 4 FAQ items and 4 HowTo steps from `public/locales/en/sshkey.json`:

```tsx
export default async function SshKeyRoute() {
  const t = await getTranslations({ namespace: "tools" });
  const ts = await getTranslations({ namespace: "sshkey" });
  const schemas = buildToolSchemas({
    name: t("sshkey.title"),
    description: t("sshkey.description"),
    path: PATH,
    faqItems: [1, 2, 3, 4].map((i) => ({
      q: ts(`descriptions.faq${i}Q`),
      a: ts(`descriptions.faq${i}A`),
    })),
    howToSteps: [1, 2, 3, 4].map((i) => ({
      name: ts(`descriptions.step${i}Title`),
      text: ts(`descriptions.step${i}Desc`),
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
      <SshKeyPage />
    </>
  );
}
```

- [ ] **Step 5c: Add HowTo schema to base64/page.tsx**

Base64 has 4 HowTo steps but no FAQ:

```tsx
export default async function Base64Route() {
  const t = await getTranslations({ namespace: "tools" });
  const tb = await getTranslations({ namespace: "base64" });
  const schemas = buildToolSchemas({
    name: t("base64.title"),
    description: t("base64.description"),
    path: PATH,
    howToSteps: [1, 2, 3, 4].map((i) => ({
      name: tb(`descriptions.howStep${i}`),
      text: tb(`descriptions.howStep${i}`),
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
      <Base64Page />
    </>
  );
}
```

**Note:** Verify the exact translation keys for base64 HowTo steps by reading `public/locales/en/base64.json`. The keys should be `descriptions.howStep1` through `descriptions.howStep4`.

- [ ] **Step 5d: Verify with page source**

Run: `npm run dev`
Visit `/password` → View page source → verify 4 `<script type="application/ld+json">` tags (WebApplication, BreadcrumbList, FAQPage, HowTo).
Visit `/sshkey` → verify same pattern with 4 schemas.
Visit `/base64` → verify 3 `<script>` tags (WebApplication, BreadcrumbList, HowTo).

- [ ] **Step 5e: Commit**

```bash
git add app/\[locale\]/password/page.tsx app/\[locale\]/sshkey/page.tsx app/\[locale\]/base64/page.tsx
git commit -m "feat(schema): add FAQPage and HowTo schema for password, sshkey, base64"
```

---

## Task 6: Run Lint and Full Test Suite

- [ ] **Step 6a: Run ESLint**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 6b: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass, including new `json-ld.test.ts`.

- [ ] **Step 6c: Run build (optional but recommended)**

Run: `npm run build`
Expected: Build completes without errors. All 32 tool routes generate successfully.
