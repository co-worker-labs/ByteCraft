# Plan 2: Dynamic OG Image Generation & Homepage Enhancement

**Date**: 2026-05-11
**Scope**: OG image API route, seo.ts ogImage support, homepage content update, Why OmniKit + Explore by Category sections, AboutPage schema

---

## Task 1: Create OG Image API Route (`app/api/og/route.tsx`)

### Step 1: Create the API route file

- [ ] Create `app/api/og/route.tsx` with the following complete content:

```tsx
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "OmniKit";
  const icon = searchParams.get("icon") || "🛠️";
  const desc = searchParams.get("desc") || "Free Online Developer Tools";

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom, #0b0f1a, #111827)",
        padding: "60px",
      }}
    >
      <div style={{ fontSize: 80, marginBottom: 24, lineHeight: 1 }}>{icon}</div>
      <div
        style={{
          fontSize: 52,
          fontWeight: 700,
          color: "#f1f5f9",
          fontFamily: "monospace",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 22,
          color: "#94a3b8",
          marginTop: 16,
          maxWidth: 860,
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        {desc}
      </div>
      <div
        style={{
          fontSize: 16,
          color: "#06d6a0",
          marginTop: "auto",
          letterSpacing: "0.05em",
        }}
      >
        OmniKit · omnikit.run
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
```

### Step 2: Verify the OG image route

- [ ] Run `npm run dev`
- [ ] Open `http://localhost:3000/api/og` in browser — should render a default brand OG image (🛠️ icon, "OmniKit" title, "Free Online Developer Tools" desc, cyan "OmniKit · omnikit.run" footer)
- [ ] Open `http://localhost:3000/api/og?title=JSON%20Formatter&icon=%F0%9F%93%9D&desc=Format%20and%20validate%20JSON` — should render a tool-specific OG image

---

## Task 2: Update `libs/seo.ts` — Add ogImage Support

### Step 1: Replace `libs/seo.ts` with the updated version

The change adds `ogImage?: { title: string; emoji: string; desc: string }` to the options type and sets `openGraph.images` + `twitter.images` when provided.

- [ ] Replace the entire content of `libs/seo.ts` with:

```ts
import type { Metadata } from "next";
import { SITE_URL } from "./site";
import { routing } from "../i18n/routing";

type GenerateMetaOptions = {
  locale: string;
  path: string;
  title?: string;
  description: string;
  ogImage?: {
    title: string;
    emoji: string;
    desc: string;
  };
};

const OG_LOCALES: Record<string, string> = {
  en: "en_US",
  "zh-CN": "zh_CN",
  "zh-TW": "zh_TW",
  ja: "ja_JP",
  ko: "ko_KR",
  es: "es_ES",
  "pt-BR": "pt_BR",
  fr: "fr_FR",
  de: "de_DE",
  ru: "ru_RU",
};

export function generatePageMeta({
  locale,
  path,
  title,
  description,
  ogImage,
}: GenerateMetaOptions): Metadata {
  const { defaultLocale, locales } = routing;

  const languages: Record<string, string> = {
    "x-default": `${SITE_URL}${path}`,
  };
  for (const loc of locales) {
    const prefix = loc === defaultLocale ? "" : `/${loc}`;
    languages[loc] = `${SITE_URL}${prefix}${path}`;
  }

  const localePrefix = locale === defaultLocale ? "" : `/${locale}`;
  const canonicalUrl = `${SITE_URL}${localePrefix}${path}`;

  const result: Metadata = {
    description,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "OmniKit",
      locale: OG_LOCALES[locale] || "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
    },
  };

  if (title) {
    result.title = title;
  }

  if (ogImage) {
    const ogImageUrl = `/api/og?title=${encodeURIComponent(ogImage.title)}&icon=${encodeURIComponent(ogImage.emoji)}&desc=${encodeURIComponent(ogImage.desc)}`;
    result.openGraph!.images = [ogImageUrl];
    result.twitter!.images = [ogImageUrl];
  }

  return result;
}
```

### Step 2: Verify seo.ts changes

- [ ] Run `npm run lint` — should pass with no errors
- [ ] Run `npx tsc --noEmit` — should pass with no type errors

---

## Task 3: Update `public/locales/en/home.json`

### Step 1: Replace the English home.json with updated content

- [ ] Replace the entire content of `public/locales/en/home.json` with:

```json
{
  "title": "OmniKit - Free Online JSON, Base64, JWT, Regex Developer Tools",
  "metaDescription": "Free browser-based developer tools: JSON formatter, Base64 encoder, JWT debugger, regex tester, QR generator, hash calculator, and 25+ more. No data leaves your browser.",
  "badge": "Free & Open Source",
  "subtitle": "Your Swiss Army Knife for Dev",
  "tagline": "No sign-up, no tracking — just results.",
  "searchPlaceholder": "Search tools...",
  "noResults": "No tools matching \"{query}\"",
  "resultsCount": "{count} tools found",
  "allTools": "All Tools",
  "viewGrouped": "Grouped",
  "viewAll": "All",
  "clearSearch": "Clear search",
  "quickAccess": "Quick Access",
  "toolCount": "35+ free developer tools",
  "brandDescription": "OmniKit is a collection of 35+ free, browser-based developer tools — all processing happens locally in your browser. No sign-up, no tracking, no data ever leaves your device. Tools include a JSON formatter and validator, Base64 encoder and decoder, JWT debugger with signature verification, regex tester with real-time matching, QR code generator with logo support, hash calculator supporting MD5 through SHA-512 and beyond, encryption and decryption for AES and other ciphers, UUID generator, cron expression builder, text diff viewer, and many more. Built as a PWA, OmniKit works offline after the first visit. Open source and free forever.",
  "whyTitle": "Why OmniKit?",
  "whyPrivacyTitle": "Privacy First",
  "whyPrivacyDesc": "All processing happens in your browser. No data is ever sent to any server.",
  "whyOfflineTitle": "Works Offline",
  "whyOfflineDesc": "Install as a PWA and use tools without internet connection.",
  "whyFreeTitle": "Free Forever",
  "whyFreeDesc": "Open source, no sign-up, no tracking, no premium tiers.",
  "categoryIntroTitle": "Explore by Category",
  "catTextProcessing": "Format, transform, and analyze text and code with tools for JSON, regex, diff, and more.",
  "catEncodingConversion": "Convert between encodings and formats — Base64, URL encoding, number bases, YAML, CSV.",
  "catSecurityCrypto": "Encrypt, hash, and secure your data with JWT, hashing, cipher, SSH key, and password tools.",
  "catGenerators": "Generate UUIDs, QR codes, cron expressions, and timestamps.",
  "catVisualMedia": "Work with colors, images, and visual content.",
  "catReferenceLookup": "Look up ASCII codes, HTTP status codes, HTML entities, and more.",
  "faqTitle": "Frequently Asked Questions",
  "faq1Q": "What is OmniKit?",
  "faq1A": "OmniKit is a free collection of browser-based developer tools including JSON formatter, Base64 encoder, password generator, hash calculator, and more. All tools run entirely in your browser with no data sent to servers.",
  "faq2Q": "Is OmniKit free to use?",
  "faq2A": "Yes, all tools are completely free with no sign-up required. OmniKit is open source and will remain free forever.",
  "faq3Q": "Is my data safe?",
  "faq3A": "All processing happens entirely in your browser using client-side JavaScript. No data is ever sent to any server. Your files and text never leave your device.",
  "faq4Q": "Do I need to install anything?",
  "faq4A": "No installation needed. OmniKit works in any modern browser and can be installed as a Progressive Web App (PWA) for quick access."
}
```

### Step 2: Verify JSON validity

- [ ] Run `node -e "JSON.parse(require('fs').readFileSync('public/locales/en/home.json','utf8')); console.log('Valid JSON')"` — should output "Valid JSON"

---

## Task 4: Update `app/[locale]/home-page.tsx` — Add New Sections

### Step 1: Add Lucide icon imports

- [ ] In `app/[locale]/home-page.tsx`, replace line 21:

Old:

```tsx
import { Search, X, LayoutGrid, Grid3X3, CircleHelp } from "lucide-react";
```

New:

```tsx
import { Search, X, LayoutGrid, Grid3X3, CircleHelp, Shield, Wifi, Heart } from "lucide-react";
```

### Step 2: Insert Why OmniKit + Explore by Category sections

- [ ] In `app/[locale]/home-page.tsx`, find the closing `</section>` of the brandDescription section (line 537) and the opening `<section` of the FAQ section (line 539). Insert the following between them — after line 537 `</section>` and before line 539 `<section className="mx-auto mt-12`:

```tsx

            <section className="mx-auto mt-16 max-w-4xl">
              <h2 className="text-center text-lg font-semibold text-fg-primary mb-8">
                {tHome("whyTitle")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border-default bg-bg-surface p-6 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-cyan/10">
                    <Shield size={20} className="text-accent-cyan" />
                  </div>
                  <h3 className="text-sm font-semibold text-fg-primary">{tHome("whyPrivacyTitle")}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-fg-secondary">{tHome("whyPrivacyDesc")}</p>
                </div>
                <div className="rounded-xl border border-border-default bg-bg-surface p-6 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-cyan/10">
                    <Wifi size={20} className="text-accent-cyan" />
                  </div>
                  <h3 className="text-sm font-semibold text-fg-primary">{tHome("whyOfflineTitle")}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-fg-secondary">{tHome("whyOfflineDesc")}</p>
                </div>
                <div className="rounded-xl border border-border-default bg-bg-surface p-6 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-cyan/10">
                    <Heart size={20} className="text-accent-cyan" />
                  </div>
                  <h3 className="text-sm font-semibold text-fg-primary">{tHome("whyFreeTitle")}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-fg-secondary">{tHome("whyFreeDesc")}</p>
                </div>
              </div>
            </section>

            <section className="mx-auto mt-16 max-w-4xl">
              <h2 className="text-center text-lg font-semibold text-fg-primary mb-8">
                {tHome("categoryIntroTitle")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TOOL_CATEGORIES.map((cat) => {
                  const slug = CATEGORY_SLUGS[cat.key];
                  const descKey =
                    "cat" +
                    slug
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join("");
                  return (
                    <div key={cat.key} className="rounded-xl border border-border-default bg-bg-surface p-5">
                      <h3 className="text-sm font-semibold text-fg-primary">
                        {categoryNames[cat.key] ?? cat.key}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-fg-secondary">{tHome(descKey)}</p>
                    </div>
                  );
                })}
              </div>
            </section>
```

### Step 3: Verify homepage renders correctly

- [ ] Run `npm run lint` — should pass
- [ ] Run `npm run dev`
- [ ] Open `http://localhost:3000` — homepage should show:
  - Existing HeroSection, QuickAccess, Categories unchanged
  - "Why OmniKit?" section with 3 cards (Privacy First, Works Offline, Free Forever) with cyan icons
  - "Explore by Category" section with 6 items in a 2-column grid, each showing category name + description
  - Existing FAQ section below, unchanged

---

## Task 5: Update `app/[locale]/page.tsx` — Metadata & AboutPage Schema

### Step 1: Replace `app/[locale]/page.tsx` with updated version

Changes: add `title: t("title")` to metadata call, import `SITE_URL`, add AboutPage schema.

> **Note**: If Plan 1 already adds an AboutPage schema, skip the `schemas.push({...AboutPage...})` block.

- [ ] Replace the entire content of `app/[locale]/page.tsx` with:

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
    title: t("title"),
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
    url: SITE_URL,
    mainEntity: {
      "@type": "WebApplication",
      name: "OmniKit",
      url: SITE_URL,
      description: t("metaDescription"),
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
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

### Step 2: Verify page.tsx changes

- [ ] Run `npm run lint` — should pass
- [ ] Run `npm run build` — production build should succeed
- [ ] Open `http://localhost:3000`, view page source — should see:
  - `<title>OmniKit - Free Online JSON, Base64, JWT, Regex Developer Tools</title>`
  - AboutPage JSON-LD in a `<script type="application/ld+json">` tag
  - WebApplication + BreadcrumbList + FAQPage JSON-LD schemas (unchanged)

---

## Final Verification

- [ ] Run `npm run lint` — all files pass
- [ ] Run `npm run build` — production build succeeds with no errors
- [ ] Open `http://localhost:3000/api/og` — renders default OG image PNG
- [ ] Open `http://localhost:3000/api/og?title=Base64&icon=%E2%9A%99%EF%B8%8F&desc=Encode%20and%20decode` — renders tool-specific OG image
- [ ] Open `http://localhost:3000` — homepage shows "Why OmniKit?" and "Explore by Category" sections
- [ ] View page source on homepage — title updated, AboutPage schema present
- [ ] Check `<meta property="og:title">` in page source — should be "OmniKit - Free Online JSON, Base64, JWT, Regex Developer Tools"
