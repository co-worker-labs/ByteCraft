# JSON to TypeScript — Plan 3: UI Pages

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the route entry (`page.tsx`) and client page component (`jsonts-page.tsx`) so that `/jsonts` renders a fully working tool.

**Prerequisite:** Plan 1 (core engine) and Plan 2 (registration + i18n) completed.

**Architecture:** Follows the standard two-file page pattern. Real-time conversion — no Convert button. Input and options trigger immediate re-computation via `useEffect`. Uses `DescriptionSection` component for SEO content.

**Tech Stack:** React (Next.js App Router), next-intl, Tailwind CSS, lucide-react

---

## File Structure

| Action | File                                  | Responsibility                                               |
| ------ | ------------------------------------- | ------------------------------------------------------------ |
| Create | `app/[locale]/jsonts/page.tsx`        | Route entry: `generateMetadata` + `buildToolSchemas` JSON-LD |
| Create | `app/[locale]/jsonts/jsonts-page.tsx` | Client component: Conversion + Description + JsontsPage      |

---

### Task 1: Route Entry (page.tsx)

**Files:**

- Create: `app/[locale]/jsonts/page.tsx`

- [ ] **Step 1: Create the route entry file**

Create `app/[locale]/jsonts/page.tsx`:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import JsontsPage from "./jsonts-page";

const PATH = "/jsonts";
const TOOL_KEY = "jsonts";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("jsonts.title"),
    description: t("jsonts.description"),
    ogImage: { title: t("jsonts.shortTitle"), emoji: tool.emoji, desc: t("jsonts.description") },
  });
}

export default async function JsontsRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "jsonts" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("jsonts.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("jsonts.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems: [1, 2, 3].map((i) => ({
      q: tx(`descriptions.faq${i}Q`),
      a: tx(`descriptions.faq${i}A`),
    })),
    howToSteps,
    sameAs: tool.sameAs,
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
      <JsontsPage />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/jsonts/page.tsx
git commit -m "feat(jsonts): add route entry with SEO metadata and JSON-LD"
```

---

### Task 2: Client Page Component (jsonts-page.tsx)

**Files:**

- Create: `app/[locale]/jsonts/jsonts-page.tsx`

- [ ] **Step 1: Create the page component**

Create `app/[locale]/jsonts/jsonts-page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

import Layout from "../../../components/layout";
import DescriptionSection from "../../../components/description-section";
import RelatedTools from "../../../components/related-tools";
import PrivacyBanner from "../../../components/privacy-banner";
import { CopyButton } from "../../../components/ui/copy-btn";
import { Button } from "../../../components/ui/button";
import { StyledTextarea, StyledInput } from "../../../components/ui/input";
import { showToast } from "../../../libs/toast";
import { jsonToTs, PRIMITIVE_ERROR } from "../../../libs/jsonts/main";

type OutputMode = "interface" | "type";

function Conversion() {
  const t = useTranslations("jsonts");
  const tc = useTranslations("common");

  const [jsonInput, setJsonInput] = useState("");
  const [tsOutput, setTsOutput] = useState("");
  const [rootName, setRootName] = useState("Root");
  const [outputMode, setOutputMode] = useState<OutputMode>("interface");
  const [exportKeyword, setExportKeyword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jsonInput.trim()) {
      setTsOutput("");
      setError(null);
      return;
    }
    const result = jsonToTs(jsonInput, {
      rootName: rootName || "Root",
      useTypeAlias: outputMode === "type",
      exportKeyword,
    });
    if (result.success) {
      setTsOutput(result.types ?? "");
      setError(null);
    } else {
      setTsOutput("");
      setError(result.error ?? "Unknown error");
    }
  }, [jsonInput, rootName, outputMode, exportKeyword]);

  return (
    <section id="conversion">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan/60" />
              <span className="font-mono text-sm font-semibold text-accent-cyan">
                {t("jsonInput")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="text-danger text-xs hover:text-danger/80 transition-colors cursor-pointer"
                onClick={() => {
                  setJsonInput("");
                  setError(null);
                  showToast(tc("cleared"), "danger", 2000);
                }}
              >
                {tc("clear")}
              </button>
            </div>
          </div>
          <div className="relative">
            <StyledTextarea
              id="jsonInput"
              placeholder={t("jsonPlaceholder")}
              rows={15}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="font-mono text-sm"
            />
            <CopyButton getContent={() => jsonInput} className="absolute end-2 top-2" />
          </div>
          {error && (
            <div role="alert" aria-live="polite" className="text-danger text-sm mt-2">
              {error === PRIMITIVE_ERROR ? t("primitiveError") : `${t("invalidJson")}: ${error}`}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-purple/60" />
              <span className="font-mono text-sm font-semibold text-accent-purple">
                {t("tsOutput")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="text-danger text-xs hover:text-danger/80 transition-colors cursor-pointer"
                onClick={() => {
                  setTsOutput("");
                  showToast(tc("cleared"), "danger", 2000);
                }}
              >
                {tc("clear")}
              </button>
            </div>
          </div>
          <div className="relative">
            <StyledTextarea
              id="tsOutput"
              placeholder={t("tsPlaceholder")}
              rows={15}
              value={tsOutput}
              readOnly
              className="font-mono text-sm"
            />
            <CopyButton getContent={() => tsOutput} className="absolute end-2 top-2" />
          </div>
        </div>
      </div>

      <div className="mt-4 px-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-4 rounded-full bg-accent-cyan" />
          <span className="font-mono text-xs font-semibold text-fg-muted uppercase tracking-wider">
            Options
          </span>
        </div>
        <div className="w-full h-px bg-border-default" />
        <div className="flex flex-wrap items-center gap-6 px-3 mt-3">
          <div className="flex items-center gap-2">
            <label htmlFor="rootName" className="font-mono text-sm font-medium text-fg-secondary">
              {t("rootName")}
            </label>
            <StyledInput
              id="rootName"
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
              className="w-28 font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <div
              role="radiogroup"
              aria-label="Output format"
              className="inline-flex rounded-full border border-border-default p-0.5 text-xs font-mono font-semibold"
            >
              <button
                type="button"
                role="radio"
                aria-checked={outputMode === "interface"}
                onClick={() => setOutputMode("interface")}
                className={`px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                  outputMode === "interface"
                    ? "bg-accent-cyan text-bg-base shadow-glow"
                    : "text-fg-muted hover:text-fg-secondary"
                }`}
              >
                {t("interface")}
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={outputMode === "type"}
                onClick={() => setOutputMode("type")}
                className={`px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                  outputMode === "type"
                    ? "bg-accent-cyan text-bg-base shadow-glow"
                    : "text-fg-muted hover:text-fg-secondary"
                }`}
              >
                {t("type")}
              </button>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={exportKeyword}
            aria-label={t("addExport")}
            onClick={() => setExportKeyword(!exportKeyword)}
            className={
              "rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer border font-mono " +
              (exportKeyword
                ? "bg-accent-purple text-bg-base border-accent-purple"
                : "bg-transparent text-fg-muted border-border-default hover:text-fg-secondary hover:bg-bg-elevated")
            }
          >
            {t("addExport")}
          </button>

          <div className="flex-1" />

          <Button
            variant="danger"
            size="sm"
            disabled={!jsonInput.trim() && !tsOutput.trim()}
            onClick={() => {
              setJsonInput("");
              setTsOutput("");
              setError(null);
              setRootName("Root");
              setOutputMode("interface");
              setExportKeyword(false);
              showToast(tc("allCleared"), "danger", 2000);
            }}
            className="rounded-full font-bold"
          >
            {tc("clearAll")}
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function JsontsPage() {
  const t = useTranslations("tools");
  const title = t("jsonts.shortTitle");

  return (
    <Layout
      title={title}
      categoryLabel={t("categories.encoding")}
      categorySlug="encoding-conversion"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner />
        <Conversion />
        <DescriptionSection namespace="jsonts" />
        <RelatedTools currentTool="jsonts" />
      </div>
    </Layout>
  );
}
```

- [ ] **Step 2: Verify the page builds**

Run:

```bash
npx tsc --noEmit --pretty 2>&1 | tail -20
```

Expected: No errors related to jsonts files.

- [ ] **Step 3: Run tests (ensure nothing broke)**

Run:

```bash
npx vitest run libs/jsonts --reporter=verbose
```

Expected: All existing jsonts tests still PASS.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/jsonts/jsonts-page.tsx
git commit -m "feat(jsonts): add client page component with real-time conversion UI"
```

---

### Task 3: Verify Full Build

- [ ] **Step 1: Run ESLint**

Run:

```bash
npx next lint --dir app/[locale]/jsonts --dir libs/jsonts 2>&1 | tail -20
```

Expected: No errors or warnings.

- [ ] **Step 2: Run full test suite**

Run:

```bash
npx vitest run --reporter=verbose 2>&1 | tail -30
```

Expected: All tests PASS.

- [ ] **Step 3: Run dev server and manually verify**

Run:

```bash
npm run dev
```

Open `http://localhost:3000/jsonts` and verify:

1. Page loads with title "JSON / TypeScript"
2. Paste `{"name":"John","age":30}` → TypeScript output appears instantly
3. Toggle interface/type → output updates
4. Toggle export → `export` keyword appears
5. Change root name → type name updates
6. Paste invalid JSON → error message appears
7. Paste `"hello"` (string root) → error message
8. Paste JSON5 `{name:'hello',}` → parses and converts
9. Description section renders
10. Related tools (json, csv, yaml) appear at bottom
