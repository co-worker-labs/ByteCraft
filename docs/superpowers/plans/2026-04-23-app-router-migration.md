# Pages Router → App Router + next-intl Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate w3tools from Next.js Pages Router + next-i18next to App Router + next-intl with `[locale]` routing.

**Architecture:** Replace `pages/` with `app/[locale]/` directory. All tool pages are client components (hooks-heavy). Server components handle metadata generation and layout. next-intl provides locale-aware routing with `localePrefix: 'as-needed'` (default locale `en` has no prefix).

**Tech Stack:** Next.js 16.2.4, React 19.2.5, next-intl (replacing next-i18next), Tailwind CSS 4.2.4

---

## Transformation Reference

Every page follows this transformation pattern. Memorize it — all page migrations are mechanical:

### Import changes

```
REMOVE: import { GetStaticProps, InferGetStaticPropsType } from "next";
REMOVE: import { useTranslation } from "next-i18next/pages";
REMOVE: import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
REMOVE: import Head from "next/head";
REMOVE: import { ToolPageHeadBuilder } from "../components/head_builder";
ADD:    import { useTranslations } from "next-intl";
CHANGE: import { useRouter } from "next/router" → import { useRouter } from "../../i18n/navigation";
CHANGE: import Link from "next/link" → import { Link } from "../../i18n/navigation";
```

### Hook changes

```
CHANGE: const { t } = useTranslation("namespace") → const t = useTranslations("namespace")
```

### Cross-namespace access

```
BEFORE: const { t } = useTranslation(["storageunit", "tools"]);
        t("common:common.reset")

AFTER:  const t = useTranslations("storageunit");
        const tc = useTranslations("common");
        tc("common.reset")
```

### File structure (each page becomes 2 files)

```
app/[locale]/storageunit/page.tsx          ← server component (generateMetadata)
app/[locale]/storageunit/storageunit-page.tsx ← 'use client' (original page content)
```

### getStaticProps → removed

All current `getStaticProps` only load translations. next-intl handles this automatically. Any data computed in `getStaticProps` (like `toolData`, `printableCharacters`) should be computed directly in the client component by importing the source functions.

---

## Phase 1: Install & Configure next-intl

### Task 1: Install dependencies

- [ ] **Step 1: Install next-intl, remove next-i18next**

```bash
npm install next-intl
npm uninstall next-i18next
```

- [ ] **Step 2: Verify installation**

```bash
npm ls next-intl
npm ls next-i18next  # should show "UNMET DEPENDENCY"
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): replace next-i18next with next-intl"
```

### Task 2: Create i18n configuration files

- [ ] **Step 1: Create `i18n/routing.ts`**

```typescript
// i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh-CN", "zh-TW"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});
```

- [ ] **Step 2: Create `i18n/navigation.ts`**

```typescript
// i18n/navigation.ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

- [ ] **Step 3: Create `i18n/request.ts`**

Loads all namespaces from `public/locales/{locale}/{namespace}.json`:

```typescript
// i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

const namespaces = [
  "common",
  "tools",
  "home",
  "password",
  "hashing",
  "base64",
  "ascii",
  "htmlcode",
  "checksum",
  "cipher",
  "storageunit",
  "terms",
  "privacy",
];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  const messages: Record<string, unknown> = {};
  for (const ns of namespaces) {
    messages[ns] = (await import(`../public/locales/${locale}/${ns}.json`)).default;
  }

  return {
    locale,
    messages,
  };
});
```

- [ ] **Step 4: Commit**

```bash
git add i18n/
git commit -m "feat(i18n): add next-intl routing and request configuration"
```

### Task 3: Create middleware

- [ ] **Step 1: Create `middleware.ts` at project root**

```typescript
// middleware.ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat(i18n): add next-intl middleware for locale routing"
```

### Task 4: Update next.config.js

- [ ] **Step 1: Replace next.config.js content**

```javascript
// next.config.js
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 2: Delete `next-i18next.config.js`** (no longer needed)

```bash
rm next-i18next.config.js
```

- [ ] **Step 3: Commit**

```bash
git add next.config.js
git rm next-i18next.config.js
git commit -m "chore: update next.config.js for next-intl, remove i18next config"
```

---

## Phase 2: App Layout Infrastructure

### Task 5: Create app directory structure

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p app/[locale]/{storageunit,base64,ascii,checksum,cipher,hashing,htmlcode,password,tnc/{terms,privacy}}
```

- [ ] **Step 2: Copy globals.css to app/**

```bash
cp styles/globals.css app/globals.css
```

### Task 6: Create root layout

- [ ] **Step 1: Create `app/layout.tsx`**

Minimal root layout — only defines `<html>` and `<body>`. The locale-specific layout handles providers.

```tsx
// app/layout.tsx
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
```

> **Note:** In next-intl with `[locale]` routing, the `[locale]/layout.tsx` defines `<html>` and `<body>`. The root layout must NOT define them, or you'll get a "multiple html/body" error.

### Task 7: Create providers component

- [ ] **Step 1: Create `app/providers.tsx`**

```tsx
// app/providers.tsx
"use client";

import { useEffect } from "react";
import { ThemeProvider } from "../libs/theme";
import { ToastProvider, useToastContext } from "../components/ui/toast";
import { registerToastFn } from "../libs/toast";

function ToastBridge() {
  const { addToast } = useToastContext();
  useEffect(() => {
    registerToastFn(addToast);
  }, [addToast]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ToastBridge />
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
}
```

### Task 8: Create locale layout

- [ ] **Step 1: Create `app/[locale]/layout.tsx`**

```tsx
// app/[locale]/layout.tsx
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";
import { Providers } from "../providers";
import "../globals.css";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta property="og:image" content="/og-image.svg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('bytecraft-theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

> **Key changes from `_app.tsx` + `_document.tsx`:**
>
> - `appWithTranslation` HOC → `NextIntlClientProvider`
> - Theme init script from `_document.tsx` → inline `<script>` in `<head>`
> - OG/Twitter meta tags from `_document.tsx` → `<head>` in layout
> - `ThemeProvider` + `ToastProvider` → `Providers` wrapper (client component)
> - `generateStaticParams` pre-renders all locale variants at build time

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx app/[locale]/layout.tsx app/providers.tsx app/globals.css
git commit -m "feat: create App Router layout with next-intl providers"
```

---

## Phase 3: Component Migration

### Task 9: Update libs/tools.ts

- [ ] **Step 1: Update `libs/tools.ts`**

Replace `TFunction` import and update `getTranslatedTools` to accept next-intl's translator:

```typescript
// libs/tools.ts — changes only
// REMOVE: import { TFunction } from "i18next";
// ADD:
import type { Translator } from "next-intl";

// CHANGE signature:
export function getTranslatedTools(t: Translator): ToolData[] {
  return toolsList.map((tool) => {
    const key = pathToToolKey(tool.path);
    return {
      ...tool,
      title: t(`tools:${key}.title`), // same key format works
      description: t(`tools:${key}.description`),
    };
  });
}
```

> **Note:** next-intl's `Translator` type is compatible with the current key format `tools:key.title`. Verify at runtime that nested key access works — if not, flatten the call: `t("tools", { key: key + ".title" })`.

### Task 10: Update components/layout.tsx

- [ ] **Step 1: Update imports and router usage**

Changes needed:

1. `import { useRouter } from "next/router"` → `import { usePathname } from "../../i18n/navigation"`
2. `router.asPath` → `usePathname()`
3. Add `"use client"` directive

```diff
+ "use client";

  import { CSSProperties, ReactNode, useCallback, useEffect } from "react";
  import Footer, { FooterPosition } from "./footer";
  import Header, { HeaderPosition } from "./header";
  import { Context, createContext, useContext, useState } from "react";
  import { ArrowUp } from "lucide-react";
- import { useRouter } from "next/router";
+ import { usePathname } from "../../i18n/navigation";
  import { pathTrim } from "../utils/path";

  // ... in Layout component:
- const router = useRouter();
- const path = pathTrim(router.asPath);
+ const pathname = usePathname();
+ const path = pathTrim(pathname);
```

### Task 11: Update components/header.tsx

- [ ] **Step 1: Update all imports and hooks**

```diff
+ "use client";

  import Link from "next/link";
- import { useRouter } from "next/router";
+ import { useRouter } from "../../i18n/navigation";
  import { LayoutGrid, Sun, Moon } from "lucide-react";
  import { getTranslatedTools } from "../libs/tools";
  import { useTheme } from "../libs/theme";
- import { useTranslation } from "next-i18next/pages";
+ import { useTranslations } from "next-intl";
  import LanguageSwitcher from "./language_switcher";
  import { Dropdown } from "./ui/dropdown";

  // ... in Header component:
- const { t } = useTranslation("common");
+ const t = useTranslations("common");

- const currentPath = router.asPath;
+ const currentPath = useRouter().pathname; // or usePathname()
```

> **Important:** Import `Link` from `../../i18n/navigation` instead of `next/link` for locale-aware routing.

### Task 12: Update components/footer.tsx

- [ ] **Step 1: Update imports**

```diff
+ "use client";

- import Link from "next/link";
- import { useTranslation } from "next-i18next/pages";
+ import { Link } from "../../i18n/navigation";
+ import { useTranslations } from "next-intl";

  // ... in Footer component:
- const { t } = useTranslation("common");
+ const t = useTranslations("common");
```

### Task 13: Update components/language_switcher.tsx

- [ ] **Step 1: Rewrite using next-intl navigation**

```tsx
// components/language_switcher.tsx
"use client";

import { useRouter, usePathname } from "../../i18n/navigation";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { Dropdown } from "./ui/dropdown";

const languages = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "zh-CN", label: "简体中文", shortLabel: "中" },
  { code: "zh-TW", label: "繁體中文", shortLabel: "繁" },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  function switchLocale(locale: string) {
    router.replace(pathname, { locale });
  }

  return (
    <Dropdown
      trigger={
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-secondary hover:text-accent-cyan hover:bg-accent-cyan/10 transition-colors"
          aria-label="Language"
        >
          <Globe size={16} />
        </button>
      }
      items={languages.map((lang) => ({
        label: lang.label,
        onClick: () => switchLocale(lang.code),
        active: lang.code === currentLocale,
      }))}
    />
  );
}
```

### Task 14: Delete components/head_builder.tsx

- [ ] **Step 1: Remove the file**

```bash
rm components/head_builder.tsx
```

> **Reason:** `ToolPageHeadBuilder` uses `next/head` + `useTranslation`. In App Router, SEO is handled by `generateMetadata` in each page's server component. No component replacement needed.

- [ ] **Step 2: Commit all component changes**

```bash
git add -A
git commit -m "refactor: migrate components to next-intl and App Router navigation"
```

---

## Phase 4: Page Migration

### Page Migration Template

Every page follows this exact pattern. The subagent should apply this template for each page.

**Server component** (`app/[locale]/xxx/page.tsx`):

```tsx
import { getTranslations } from "next-intl/server";
import XxxPage from "./xxx-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t("xxx.title"),
    description: t("xxx.description"),
    keywords: "",
  };
}

export default function XxxRoute() {
  return <XxxPage />;
}
```

**Client component** (`app/[locale]/xxx/xxx-page.tsx`):

- Add `"use client"` directive
- Remove all `getStaticProps` / `serverSideTranslations` / `GetStaticProps` / `InferGetStaticPropsType` / `Head` / `ToolPageHeadBuilder`
- Replace `useTranslation` → `useTranslations`
- Replace `useRouter` import → `import { useRouter } from "../../../i18n/navigation"`
- Compute any data previously from props directly (import the source function)
- Remove `toolData` from function params if it was only used for translations

### Task 15: Migrate index page

- [ ] **Step 1: Create `app/[locale]/page.tsx`**

```tsx
// app/[locale]/page.tsx
import { getTranslations } from "next-intl/server";
import HomePage from "./home-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: t("title"),
    description: t("metaDescription"),
  };
}

export default function HomeRoute() {
  return <HomePage />;
}
```

- [ ] **Step 2: Create `app/[locale]/home-page.tsx`**

Transform `pages/index.tsx`:

- Add `"use client"`
- Remove `Head`, `getStaticProps`, `serverSideTranslations`, `InferGetStaticPropsType`
- `useTranslation` → `useTranslations`
- `useRouter` → from `../../i18n/navigation`
- `tools` prop → compute via `listMatchedTools("")` directly
- Remove `<Head>` block (handled by generateMetadata)
- `router.push(value.path)` → still works with next-intl's useRouter

```tsx
// app/[locale]/home-page.tsx
"use client";

import Layout from "../../components/layout";
import { listMatchedTools, ToolData } from "../../libs/tools";
import { useRouter } from "../../i18n/navigation";
import { useTranslations } from "next-intl";
import { getTranslatedTools } from "../../libs/tools";
import { Card } from "../../components/ui/card";

import { Hash, FileCode, Lock, KeyRound, FileCheck, Type, Code, HardDrive } from "lucide-react";

// toolIcons stays the same
const toolIcons: Record<string, React.ReactNode> = {
  "/hashing": <Hash size={28} className="text-accent-cyan" />,
  "/base64": <FileCode size={28} className="text-accent-cyan" />,
  "/cipher": <Lock size={28} className="text-accent-cyan" />,
  "/password": <KeyRound size={28} className="text-accent-cyan" />,
  "/checksum": <FileCheck size={28} className="text-accent-cyan" />,
  "/ascii": <Type size={28} className="text-accent-cyan" />,
  "/htmlcode": <Code size={28} className="text-accent-cyan" />,
  "/storageunit": <HardDrive size={28} className="text-accent-cyan" />,
};

function Introduce() {
  const t = useTranslations("home");
  return (
    // ... same JSX as before, just t("subtitle") instead of t("home:subtitle")
  );
}

function ToolCollection() {
  const router = useRouter();
  const t = useTranslations("tools");
  const data = getTranslatedTools(t);

  return (
    // ... same JSX, router.push(value.path) works as-is
  );
}

export default function HomePage() {
  const tHome = useTranslations("home");
  const tools: ToolData[] = listMatchedTools("");
  const keywords: string[] = [];
  tools.forEach((value: ToolData) => {
    value.keywords.forEach((kw) => {
      if (!keywords.includes(kw)) {
        keywords.push(kw);
      }
    });
  });

  return (
    <Layout headerPosition="none">
      <Introduce />
      <ToolCollection />
    </Layout>
  );
}
```

### Task 16: Migrate tool pages (batch)

All 8 tool pages follow the same pattern. Create a server component wrapper + transform the client component.

Pages to migrate:

1. `pages/storageunit.tsx` → `app/[locale]/storageunit/`
2. `pages/base64.tsx` → `app/[locale]/base64/`
3. `pages/ascii.tsx` → `app/[locale]/ascii/`
4. `pages/checksum.tsx` → `app/[locale]/checksum/`
5. `pages/cipher.tsx` → `app/[locale]/cipher/`
6. `pages/hashing.tsx` → `app/[locale]/hashing/`
7. `pages/htmlcode.tsx` → `app/[locale]/htmlcode/`
8. `pages/password.tsx` → `app/[locale]/password/`

For each page, the subagent must:

- [ ] **Step A: Create server component `page.tsx`** with `generateMetadata`
- [ ] **Step B: Create client component `<name>-page.tsx`** with all the transformation rules applied
- [ ] **Step C: Apply specific per-page fixes:**

| Page            | Specific fixes                                                                                                                     |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **base64**      | `import codingTableImg from "../public/base64/..."` → remove import, use `src="/base64/..."`. Add `width` + `height` to `<Image>`. |
| **checksum**    | `const CryptoJS = require("crypto-js")` → `import CryptoJS from "crypto-js"`                                                       |
| **cipher**      | `const CryptoJS = require("crypto-js")` → `import CryptoJS from "crypto-js"`                                                       |
| **hashing**     | `const CryptoJS = require("crypto-js")` → `import CryptoJS from "crypto-js"`                                                       |
| **ascii**       | Import `getPrintableCharacters`, `getControlCodes` from libs directly instead of receiving via props                               |
| **htmlcode**    | Import all data functions (`getLetters`, `getPunctuations`, etc.) from libs directly instead of via props                          |
| **password**    | `import "rc-slider/assets/index.css"` → keep import in client component file                                                       |
| **storageunit** | No special fixes needed (simplest page, good migration starting point)                                                             |

- [ ] **Step D: Commit each page or batch**

```bash
git add app/[locale]/storageunit/
git commit -m "feat: migrate storageunit page to App Router"
# repeat for each page...
```

### Task 17: Migrate legal pages

- [ ] **Step 1: Create `app/[locale]/tnc/terms/page.tsx`**

```tsx
// app/[locale]/tnc/terms/page.tsx
import { getTranslations } from "next-intl/server";
import TermsPage from "./terms-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return {
    title: t("title"),
  };
}

export default function TermsRoute() {
  return <TermsPage />;
}
```

- [ ] **Step 2: Create `app/[locale]/tnc/terms/terms-page.tsx`**

Transform `pages/tnc/terms.tsx`:

- Add `"use client"`
- Remove `getStaticProps`, `serverSideTranslations`, `Head`
- `useTranslation("terms")` → `useTranslations("terms")`
- Update relative import paths (../../components/layout)

- [ ] **Step 3: Create `app/[locale]/tnc/privacy/page.tsx` + `privacy-page.tsx`**

Same pattern as terms.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/tnc/
git commit -m "feat: migrate legal pages to App Router"
```

---

## Phase 5: Cleanup

### Task 18: Remove Pages Router artifacts

- [ ] **Step 1: Delete pages/ directory**

```bash
rm -rf pages/
```

- [ ] **Step 2: Delete old styles/ directory** (moved to app/)

```bash
rm -rf styles/
```

- [ ] **Step 3: Delete next-i18next.config.js** (already done in Task 4)

- [ ] **Step 4: Verify no remaining imports of removed packages**

```bash
grep -r "next-i18next" --include="*.ts" --include="*.tsx" .
grep -r "next/head" --include="*.ts" --include="*.tsx" .
grep -r "next/router" --include="*.ts" --include="*.tsx" .
grep -r "next/document" --include="*.ts" --include="*.tsx" .
grep -r "getStaticProps" --include="*.ts" --include="*.tsx" .
grep -r "serverSideTranslations" --include="*.ts" --include="*.tsx" .
```

All should return empty. Fix any remaining references.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove Pages Router artifacts"
```

---

## Phase 6: Verification

### Task 19: Build & test

- [ ] **Step 1: Run ESLint**

```bash
npx eslint .
```

Fix any errors.

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Fix any type errors.

- [ ] **Step 3: Run production build**

```bash
npm run build
```

Fix any build errors. Expected: all pages pre-rendered for 3 locales.

- [ ] **Step 4: Run dev server and test manually**

```bash
npm run dev
```

Test matrix:

- [ ] `/` loads (English, no locale prefix)
- [ ] `/base64` loads
- [ ] `/storageunit` loads
- [ ] `/zh-CN` redirects/loads Chinese homepage
- [ ] `/zh-CN/base64` loads Chinese base64 page
- [ ] `/zh-TW` loads Traditional Chinese
- [ ] Language switcher works (locale changes, URL updates)
- [ ] Theme toggle works (dark/light)
- [ ] Navigation between pages works (no hard refresh)
- [ ] Back to top button works
- [ ] All tool functionality works (encode/decode, hash, etc.)
- [ ] Footer links work

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete Pages Router to App Router migration"
```

---

## File Change Summary

### New files (create)

| File                                            | Purpose                               |
| ----------------------------------------------- | ------------------------------------- |
| `i18n/routing.ts`                               | next-intl locale routing config       |
| `i18n/navigation.ts`                            | Locale-aware Link, useRouter, etc.    |
| `i18n/request.ts`                               | Server-side i18n request config       |
| `middleware.ts`                                 | Locale detection & routing middleware |
| `app/layout.tsx`                                | Root layout (passthrough)             |
| `app/[locale]/layout.tsx`                       | Locale layout with providers, meta    |
| `app/[locale]/page.tsx`                         | Homepage server component             |
| `app/[locale]/home-page.tsx`                    | Homepage client component             |
| `app/[locale]/storageunit/page.tsx`             | Storage unit server component         |
| `app/[locale]/storageunit/storageunit-page.tsx` | Storage unit client component         |
| `app/[locale]/base64/page.tsx`                  | Base64 server component               |
| `app/[locale]/base64/base64-page.tsx`           | Base64 client component               |
| `app/[locale]/ascii/page.tsx`                   | ASCII server component                |
| `app/[locale]/ascii/ascii-page.tsx`             | ASCII client component                |
| `app/[locale]/checksum/page.tsx`                | Checksum server component             |
| `app/[locale]/checksum/checksum-page.tsx`       | Checksum client component             |
| `app/[locale]/cipher/page.tsx`                  | Cipher server component               |
| `app/[locale]/cipher/cipher-page.tsx`           | Cipher client component               |
| `app/[locale]/hashing/page.tsx`                 | Hashing server component              |
| `app/[locale]/hashing/hashing-page.tsx`         | Hashing client component              |
| `app/[locale]/htmlcode/page.tsx`                | HTML code server component            |
| `app/[locale]/htmlcode/htmlcode-page.tsx`       | HTML code client component            |
| `app/[locale]/password/page.tsx`                | Password server component             |
| `app/[locale]/password/password-page.tsx`       | Password client component             |
| `app/[locale]/tnc/terms/page.tsx`               | Terms server component                |
| `app/[locale]/tnc/terms/terms-page.tsx`         | Terms client component                |
| `app/[locale]/tnc/privacy/page.tsx`             | Privacy server component              |
| `app/[locale]/tnc/privacy/privacy-page.tsx`     | Privacy client component              |
| `app/providers.tsx`                             | ThemeProvider + ToastProvider wrapper |
| `app/globals.css`                               | Global styles (copied from styles/)   |

### Modified files (update)

| File                               | Changes                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| `next.config.js`                   | Replace i18n config with `createNextIntlPlugin`                                       |
| `libs/tools.ts`                    | `TFunction` → next-intl `Translator` type                                             |
| `components/layout.tsx`            | `"use client"`, useRouter → usePathname from i18n/navigation                          |
| `components/header.tsx`            | `"use client"`, Link/useRouter from i18n/navigation, useTranslation → useTranslations |
| `components/footer.tsx`            | `"use client"`, Link from i18n/navigation, useTranslation → useTranslations           |
| `components/language_switcher.tsx` | Full rewrite with next-intl useLocale + router.replace                                |
| `package.json`                     | Remove next-i18next, add next-intl                                                    |

### Deleted files (remove)

| File                          | Reason                                            |
| ----------------------------- | ------------------------------------------------- |
| `pages/` (entire directory)   | Replaced by `app/[locale]/`                       |
| `styles/globals.css`          | Moved to `app/globals.css`                        |
| `next-i18next.config.js`      | Replaced by `i18n/routing.ts` + `i18n/request.ts` |
| `components/head_builder.tsx` | Replaced by `generateMetadata` in each page       |
