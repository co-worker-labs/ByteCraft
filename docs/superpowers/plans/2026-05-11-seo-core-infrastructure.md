# SEO Core Infrastructure — Plan 1 of 6

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the shared code infrastructure that Plans 2–6 depend on: extend `ToolEntry` with `emoji`/`sameAs`, update JSON-LD schemas, create the shared `DescriptionSection` component, and add loading/error boundaries.

**Architecture:** Progressive enhancement on existing files. No new abstraction layers beyond the `DescriptionSection` shared component. All changes are additive — no breaking changes to existing APIs.

**Tech Stack:** Next.js 16 App Router, TypeScript, next-intl, Tailwind CSS, Vitest

---

## File Structure

| File                                 | Responsibility                                    | Status |
| ------------------------------------ | ------------------------------------------------- | ------ |
| `libs/tools.ts`                      | Add `emoji` + `sameAs` to `ToolEntry` and `TOOLS` | Modify |
| `components/json-ld.tsx`             | Add `sameAs` to `buildToolSchemas`, update descs  | Modify |
| `components/description-section.tsx` | Shared DescriptionSection component               | Create |
| `app/[locale]/loading.tsx`           | Suspense loading fallback                         | Create |
| `app/[locale]/error.tsx`             | Error boundary                                    | Create |
| `app/[locale]/layout.tsx`            | Update default OG image reference                 | Modify |
| `app/[locale]/page.tsx`              | Add AboutPage schema                              | Modify |
| `libs/__tests__/json-ld.test.ts`     | Tests for sameAs support                          | Modify |

---

## Task 1: libs/tools.ts — Add `emoji` and `sameAs` to ToolEntry

**Files:**

- Modify: `libs/tools.ts` (interface at lines 48–52, TOOLS array at lines 157–193)

- [ ] **Step 1: Update the ToolEntry interface**

Replace the `ToolEntry` interface in `libs/tools.ts` (lines 48–52):

```ts
export interface ToolEntry {
  key: string;
  path: string;
  icon: LucideIcon;
  emoji: string;
  sameAs?: string[];
}
```

- [ ] **Step 2: Update the TOOLS array with emoji + sameAs for all 35 entries**

Replace the `TOOLS` array in `libs/tools.ts` (lines 157–193):

```ts
export const TOOLS: ToolEntry[] = [
  {
    key: "json",
    path: "/json",
    icon: FileJson,
    emoji: "{}",
    sameAs: ["https://www.json.org", "https://datatracker.ietf.org/doc/html/rfc8259"],
  },
  {
    key: "base64",
    path: "/base64",
    icon: FileCode,
    emoji: "🔢",
    sameAs: ["https://datatracker.ietf.org/doc/html/rfc4648"],
  },
  {
    key: "jwt",
    path: "/jwt",
    icon: ShieldCheck,
    emoji: "🔐",
    sameAs: [
      "https://datatracker.ietf.org/doc/html/rfc7519",
      "https://en.wikipedia.org/wiki/JSON_Web_Token",
    ],
  },
  {
    key: "regex",
    path: "/regex",
    icon: Regex,
    emoji: "🔍",
    sameAs: ["https://en.wikipedia.org/wiki/Regular_expression"],
  },
  {
    key: "uuid",
    path: "/uuid",
    icon: FingerprintPattern,
    emoji: "🆔",
    sameAs: [
      "https://datatracker.ietf.org/doc/html/rfc4122",
      "https://datatracker.ietf.org/doc/html/rfc9562",
    ],
  },
  {
    key: "hashing",
    path: "/hashing",
    icon: Hash,
    emoji: "#️⃣",
    sameAs: ["https://en.wikipedia.org/wiki/Cryptographic_hash_function"],
  },
  {
    key: "urlencoder",
    path: "/urlencoder",
    icon: Percent,
    emoji: "🔗",
    sameAs: ["https://developer.mozilla.org/en-US/docs/Glossary/percent-encoding"],
  },
  {
    key: "unixtime",
    path: "/unixtime",
    icon: Timer,
    emoji: "⏱️",
    sameAs: ["https://en.wikipedia.org/wiki/Unix_time"],
  },
  {
    key: "diff",
    path: "/diff",
    icon: GitCompare,
    emoji: "📄",
    sameAs: ["https://en.wikipedia.org/wiki/Diff_utility"],
  },
  {
    key: "password",
    path: "/password",
    icon: KeyRound,
    emoji: "🔑",
    sameAs: ["https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html"],
  },
  {
    key: "sshkey",
    path: "/sshkey",
    icon: Terminal,
    emoji: "🖥️",
    sameAs: ["https://datatracker.ietf.org/doc/html/rfc4251"],
  },
  {
    key: "color",
    path: "/color",
    icon: Palette,
    emoji: "🎨",
    sameAs: ["https://www.w3.org/TR/css-color-4/"],
  },
  {
    key: "cron",
    path: "/cron",
    icon: Clock,
    emoji: "⏰",
    sameAs: ["https://en.wikipedia.org/wiki/Cron"],
  },
  {
    key: "markdown",
    path: "/markdown",
    icon: FileText,
    emoji: "📝",
    sameAs: ["https://commonmark.org/"],
  },
  {
    key: "qrcode",
    path: "/qrcode",
    icon: QrCode,
    emoji: "📱",
    sameAs: ["https://en.wikipedia.org/wiki/QR_code", "https://www.iso.org/standard/62021.html"],
  },
  { key: "textcase", path: "/textcase", icon: CaseSensitive, emoji: "🔤", sameAs: [] },
  { key: "deduplines", path: "/deduplines", icon: ListFilter, emoji: "🧹", sameAs: [] },
  {
    key: "csv",
    path: "/csv",
    icon: FileSpreadsheet,
    emoji: "📊",
    sameAs: ["https://datatracker.ietf.org/doc/html/rfc4180"],
  },
  {
    key: "csv-md",
    path: "/csv-md",
    icon: Table,
    emoji: "📋",
    sameAs: ["https://datatracker.ietf.org/doc/html/rfc4180"],
  },
  {
    key: "cipher",
    path: "/cipher",
    icon: Lock,
    emoji: "🔒",
    sameAs: ["https://en.wikipedia.org/wiki/Encryption"],
  },
  { key: "numbase", path: "/numbase", icon: Binary, emoji: "🔢", sameAs: [] },
  { key: "dbviewer", path: "/dbviewer", icon: Database, emoji: "🗄️", sameAs: [] },
  {
    key: "checksum",
    path: "/checksum",
    icon: FileCheck,
    emoji: "✅",
    sameAs: ["https://en.wikipedia.org/wiki/Checksum"],
  },
  { key: "storageunit", path: "/storageunit", icon: HardDrive, emoji: "💾", sameAs: [] },
  {
    key: "httpstatus",
    path: "/httpstatus",
    icon: Globe,
    emoji: "🌐",
    sameAs: ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Status"],
  },
  { key: "yaml", path: "/yaml", icon: FileBraces, emoji: "📄", sameAs: ["https://yaml.org/spec/"] },
  { key: "image", path: "/image", icon: ImageDown, emoji: "🖼️", sameAs: [] },
  { key: "htmlcode", path: "/htmlcode", icon: Code, emoji: "🔖", sameAs: [] },
  {
    key: "ascii",
    path: "/ascii",
    icon: Type,
    emoji: "⌨️",
    sameAs: ["https://en.wikipedia.org/wiki/ASCII"],
  },
  { key: "extractor", path: "/extractor", icon: Search, emoji: "🔎", sameAs: [] },
  { key: "wordcounter", path: "/wordcounter", icon: AlignLeft, emoji: "📏", sameAs: [] },
  { key: "httpclient", path: "/httpclient", icon: Send, emoji: "📡", sameAs: [] },
  { key: "tokencounter", path: "/token-counter", icon: Hash, emoji: "🪙", sameAs: [] },
  {
    key: "wallet",
    path: "/wallet",
    icon: Wallet,
    emoji: "👛",
    sameAs: ["https://en.wikipedia.org/wiki/Cryptocurrency_wallet"],
  },
  {
    key: "bip39",
    path: "/bip39",
    icon: BookOpen,
    emoji: "📖",
    sameAs: ["https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki"],
  },
];
```

- [ ] **Step 3: Verify existing tests still pass**

Run: `npx vitest run libs/__tests__/`

Expected: All existing tests pass (tools-aeo, json-ld, etc.)

- [ ] **Step 4: Commit**

```bash
git add libs/tools.ts
git commit -m "feat(seo): add emoji and sameAs fields to ToolEntry and TOOLS array"
```

---

## Task 2: components/json-ld.tsx — Add sameAs + update descriptions

**Files:**

- Modify: `components/json-ld.tsx`
- Modify: `libs/__tests__/json-ld.test.ts`

- [ ] **Step 1: Write the failing test for sameAs support**

Add to `libs/__tests__/json-ld.test.ts` (append after the existing `buildCategorySchema` describe block):

```ts
describe("buildToolSchemas — sameAs", () => {
  const base = {
    name: "JSON Formatter",
    description: "Format and validate JSON online",
    path: "/json",
  };

  it("injects sameAs into WebApplication schema when provided", () => {
    const schemas = buildToolSchemas({
      ...base,
      sameAs: ["https://www.json.org", "https://datatracker.ietf.org/doc/html/rfc8259"],
    });
    const webApp = schemas[0] as Record<string, unknown>;
    expect(webApp.sameAs).toEqual([
      "https://www.json.org",
      "https://datatracker.ietf.org/doc/html/rfc8259",
    ]);
  });

  it("omits sameAs when not provided", () => {
    const schemas = buildToolSchemas(base);
    const webApp = schemas[0] as Record<string, unknown>;
    expect(webApp.sameAs).toBeUndefined();
  });

  it("omits sameAs when empty array", () => {
    const schemas = buildToolSchemas({ ...base, sameAs: [] });
    const webApp = schemas[0] as Record<string, unknown>;
    expect(webApp.sameAs).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run libs/__tests__/json-ld.test.ts`

Expected: FAIL — `sameAs` is not yet in the WebApplication schema

- [ ] **Step 3: Update buildToolSchemas to accept and inject sameAs**

In `components/json-ld.tsx`, replace the `buildToolSchemas` function (lines 41–116) with:

```tsx
export function buildToolSchemas(options: {
  name: string;
  description: string;
  path: string;
  faqItems?: { q: string; a: string }[];
  howToSteps?: { name: string; text: string }[];
  categoryName?: string;
  categoryPath?: string;
  sameAs?: string[];
}): object[] {
  const { name, description, path, faqItems, howToSteps, categoryName, categoryPath, sameAs } =
    options;
  const url = `${SITE_URL}${path}`;

  const schemas: object[] = [];

  const webApp: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["WebApplication", "SoftwareApplication"],
    name,
    description,
    url,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    browserRequirements: "Requires JavaScript. Requires HTML5.",
  };

  if (sameAs && sameAs.length > 0) {
    webApp.sameAs = sameAs;
  }

  schemas.push(webApp);

  const breadcrumbItems: object[] = [
    { "@type": "ListItem", position: 1, name: "OmniKit", item: SITE_URL },
  ];
  if (categoryName && categoryPath) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 2,
      name: categoryName,
      item: `${SITE_URL}${categoryPath}`,
    });
    breadcrumbItems.push({ "@type": "ListItem", position: 3, name, item: url });
  } else {
    breadcrumbItems.push({ "@type": "ListItem", position: 2, name, item: url });
  }

  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
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

- [ ] **Step 4: Update WebsiteJsonLd description**

In `components/json-ld.tsx`, replace the `WebsiteJsonLd` function (lines 3–27) with:

```tsx
function WebsiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "OmniKit",
    url: SITE_URL,
    description:
      "Free online developer tools that run entirely in your browser. JSON formatter, Base64 encoder, password generator, hash calculator, JWT debugger, and 30+ more utilities. No data sent to any server.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

- [ ] **Step 5: Update buildOrganizationSchema description**

In `components/json-ld.tsx`, replace the `buildOrganizationSchema` function (lines 29–39) with:

```tsx
export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "OmniKit",
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512x512.png`,
    sameAs: ["https://github.com/nickvore"],
    description: "Browser-based developer tools platform",
  };
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run libs/__tests__/json-ld.test.ts`

Expected: PASS (all old + new tests)

- [ ] **Step 7: Commit**

```bash
git add components/json-ld.tsx libs/__tests__/json-ld.test.ts
git commit -m "feat(seo): add sameAs to buildToolSchemas, update WebsiteJsonLd and Organization descriptions"
```

---

## Task 3: components/description-section.tsx — Shared DescriptionSection component

**Files:**

- Create: `components/description-section.tsx`

This component replaces the per-tool `Description` function pattern with a shared component that reads translation keys from a namespace and renders aeoDefinition, WhatIs, UseCases, HowTo Steps, extraSections slot, and FAQ sections — all guarded by `t.has()` checks.

- [ ] **Step 1: Create the DescriptionSection component**

Create `components/description-section.tsx`:

```tsx
"use client";

import { type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CircleHelp } from "lucide-react";
import { Accordion } from "./ui/accordion";

export type DescriptionSectionProps = {
  namespace: string;
  faqCount?: number;
  howToStepCount?: number;
  extraSections?: ReactNode;
  showWhatIs?: boolean;
  showUseCases?: boolean;
  showHowTo?: boolean;
  showFaq?: boolean;
};

export default function DescriptionSection({
  namespace,
  faqCount = 3,
  howToStepCount = 3,
  extraSections,
  showWhatIs = true,
  showUseCases = true,
  showHowTo = true,
  showFaq = true,
}: DescriptionSectionProps) {
  const t = useTranslations(namespace);
  const tc = useTranslations("common");
  const ns = "descriptions";

  const hasAeoDefinition = t.has(`${ns}.aeoDefinition`);
  const hasWhatIsMulti = t.has(`${ns}.whatIsP1`);
  const hasWhatIsSingle = t.has(`${ns}.whatIs`);
  const hasUseCasesMulti = t.has(`${ns}.useCasesDesc1`);
  const hasUseCasesPlain = t.has(`${ns}.useCasesP1`);
  const hasFaq = showFaq && t.has(`${ns}.faq1Q`);

  const steps: { title: string; text: string }[] = [];
  if (showHowTo) {
    for (let i = 1; i <= howToStepCount; i++) {
      if (t.has(`${ns}.step${i}Title`)) {
        steps.push({
          title: t(`${ns}.step${i}Title`),
          text: t.has(`${ns}.step${i}Text`) ? t(`${ns}.step${i}Text`) : "",
        });
      }
    }
  }

  const faqItems = [];
  if (hasFaq) {
    for (let i = 1; i <= faqCount; i++) {
      if (t.has(`${ns}.faq${i}Q`)) {
        faqItems.push({
          title: t(`${ns}.faq${i}Q`),
          content: <p>{t(`${ns}.faq${i}A`)}</p>,
        });
      }
    }
  }

  if (
    !hasAeoDefinition &&
    !hasWhatIsMulti &&
    !hasWhatIsSingle &&
    !hasUseCasesMulti &&
    !hasUseCasesPlain &&
    steps.length === 0 &&
    !extraSections &&
    faqItems.length === 0
  ) {
    return null;
  }

  return (
    <section id="description" className="mt-8">
      {hasAeoDefinition && (
        <div className="border-l-2 border-accent-cyan/40 pl-4 py-2.5 mb-4">
          <p className="text-fg-secondary text-sm leading-relaxed">{t(`${ns}.aeoDefinition`)}</p>
        </div>
      )}

      {showWhatIs && hasWhatIsMulti && (
        <div className="mb-4">
          {t.has(`${ns}.whatIsTitle`) && (
            <h2 className="font-semibold text-fg-primary text-base">{t(`${ns}.whatIsTitle`)}</h2>
          )}
          <div className="mt-1 space-y-1.5 text-fg-secondary text-sm leading-relaxed">
            {[1, 2, 3, 4, 5].map(
              (i) => t.has(`${ns}.whatIsP${i}`) && <p key={i}>{t(`${ns}.whatIsP${i}`)}</p>
            )}
          </div>
        </div>
      )}

      {showWhatIs && !hasWhatIsMulti && hasWhatIsSingle && (
        <div className="mb-4">
          {t.has(`${ns}.whatIsTitle`) && (
            <h2 className="font-semibold text-fg-primary text-base">{t(`${ns}.whatIsTitle`)}</h2>
          )}
          <p className="text-fg-secondary text-sm mt-1 leading-relaxed">{t(`${ns}.whatIs`)}</p>
        </div>
      )}

      {showUseCases && hasUseCasesMulti && (
        <div className="mb-4">
          {t.has(`${ns}.useCasesTitle`) && (
            <h2 className="font-semibold text-fg-primary text-base">{t(`${ns}.useCasesTitle`)}</h2>
          )}
          <div className="mt-1 space-y-3 text-fg-secondary text-sm leading-relaxed">
            {[1, 2, 3, 4, 5].map(
              (i) =>
                t.has(`${ns}.useCasesP${i}`) && (
                  <div key={i}>
                    <p className="font-medium text-fg-primary">{t(`${ns}.useCasesDesc${i}`)}</p>
                    <p className="mt-0.5">{t(`${ns}.useCasesP${i}`)}</p>
                  </div>
                )
            )}
          </div>
        </div>
      )}

      {showUseCases && !hasUseCasesMulti && hasUseCasesPlain && (
        <div className="mb-4">
          {t.has(`${ns}.useCasesTitle`) && (
            <h2 className="font-semibold text-fg-primary text-base">{t(`${ns}.useCasesTitle`)}</h2>
          )}
          <div className="mt-1 space-y-1.5 text-fg-secondary text-sm leading-relaxed">
            {[1, 2, 3, 4, 5].map(
              (i) => t.has(`${ns}.useCasesP${i}`) && <p key={i}>{t(`${ns}.useCasesP${i}`)}</p>
            )}
          </div>
        </div>
      )}

      {steps.length > 0 && (
        <div className="mb-4">
          {t.has(`${ns}.stepsTitle`) && (
            <h2 className="font-semibold text-fg-primary text-base">{t(`${ns}.stepsTitle`)}</h2>
          )}
          <ol className="mt-2 space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-cyan/20 text-xs font-semibold text-accent-cyan">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-fg-primary text-sm">{step.title}</p>
                  {step.text && <p className="text-fg-secondary text-sm mt-0.5">{step.text}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {extraSections}

      {faqItems.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <CircleHelp size={16} className="text-accent-cyan shrink-0" aria-hidden="true" />
            <h2 className="font-semibold text-fg-primary text-base text-pretty">
              {tc("descriptions.faqTitle")}
            </h2>
          </div>
          <Accordion items={faqItems} />
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`

Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add components/description-section.tsx
git commit -m "feat(seo): add shared DescriptionSection component with t.has() guards"
```

---

## Task 4: app/[locale]/loading.tsx — Suspense loading fallback

**Files:**

- Create: `app/[locale]/loading.tsx`

This file is NOT a client component. Next.js auto-wraps it as a Suspense boundary. No Layout wrapper needed — it's rendered within the layout.

- [ ] **Step 1: Create the loading file**

Create `app/[locale]/loading.tsx`:

```tsx
export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
      <p className="text-fg-muted text-sm">Loading...</p>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`

Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/loading.tsx"
git commit -m "feat(seo): add Suspense loading fallback"
```

---

## Task 5: app/[locale]/error.tsx — Error boundary

**Files:**

- Create: `app/[locale]/error.tsx`

This file MUST be "use client". It receives the error and reset function from Next.js.

- [ ] **Step 1: Create the error file**

Create `app/[locale]/error.tsx`:

```tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
      <h1 className="text-2xl font-bold text-fg-primary">Something went wrong</h1>
      <p className="text-fg-secondary text-sm">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-full bg-accent-cyan px-6 py-2 text-sm font-semibold text-bg-base hover:bg-accent-cyan/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`

Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/error.tsx"
git commit -m "feat(seo): add error boundary with retry button"
```

---

## Task 6: app/[locale]/layout.tsx — Update default OG image reference

**Files:**

- Modify: `app/[locale]/layout.tsx` (line 69)

Plan 2 creates the OG API route. This step updates the reference so layout.tsx points to the new dynamic OG image endpoint.

- [ ] **Step 1: Update the OG image reference**

In `app/[locale]/layout.tsx`, replace line 69:

From:

```ts
      images: [{ url: "/og-image.svg", width: 1200, height: 630 }],
```

To:

```ts
      images: [{ url: "/api/og?title=OmniKit&icon=🛠&desc=Free+online+developer+tools", width: 1200, height: 630 }],
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`

Expected: Build succeeds (the OG API route will be created in Plan 2, but the build won't fail on the metadata reference)

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/layout.tsx"
git commit -m "feat(seo): update default OG image to dynamic API route"
```

---

## Task 7: app/[locale]/page.tsx — Add AboutPage schema

**Files:**

- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Add SITE_URL import and AboutPage schema**

Replace the entire `app/[locale]/page.tsx` file with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../libs/seo";
import { buildToolSchemas } from "../../components/json-ld";
import { SITE_URL } from "../../libs/site";
import HomeClient from "./home-page";

const PATH = "";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return generatePageMeta({
    locale,
    path: PATH,
    description: t("metaDescription"),
  });
}

export default async function HomeRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  const schemas = buildToolSchemas({
    name: "OmniKit",
    description: t("metaDescription"),
    path: "/",
    faqItems: [1, 2, 3, 4].map((i) => ({
      q: t(`faq${i}Q`),
      a: t(`faq${i}A`),
    })),
  });

  schemas.push({
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About OmniKit",
    description: t("metaDescription"),
    url: `${SITE_URL}`,
    mainEntity: {
      "@type": "Organization",
      name: "OmniKit",
      url: SITE_URL,
    },
  });

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <HomeClient />
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`

Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/page.tsx"
git commit -m "feat(seo): add AboutPage schema to homepage"
```

---

## Summary

| Task | File(s)                              | What Changes                                                                                        |
| ---- | ------------------------------------ | --------------------------------------------------------------------------------------------------- |
| 1    | `libs/tools.ts`                      | Add `emoji: string` + `sameAs?: string[]` to `ToolEntry`; populate all 35 tools                     |
| 2    | `components/json-ld.tsx`, test file  | Add `sameAs` to `buildToolSchemas`; update `WebsiteJsonLd` + `buildOrganizationSchema` descriptions |
| 3    | `components/description-section.tsx` | New shared component with aeoDefinition, WhatIs, UseCases, HowTo, extraSections, FAQ                |
| 4    | `app/[locale]/loading.tsx`           | New Suspense fallback with spinner                                                                  |
| 5    | `app/[locale]/error.tsx`             | New error boundary with retry button                                                                |
| 6    | `app/[locale]/layout.tsx`            | Update OG image to `/api/og?...`                                                                    |
| 7    | `app/[locale]/page.tsx`              | Add AboutPage schema + import SITE_URL                                                              |
