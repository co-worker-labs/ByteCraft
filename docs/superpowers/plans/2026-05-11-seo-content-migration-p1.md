# SEO Content + Migration (Batch 1) — Plan 3 of 6

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full SEO content (whatIs, useCases, howToSteps, faq3) to the 6 neediest tools and migrate their Description components to the shared `DescriptionSection`. Update server `page.tsx` files with howToSteps JSON-LD, sameAs, and ogImage.

**Architecture:** Each tool gets 3 files changed: (1) English translation JSON — add missing description keys, (2) client `*-page.tsx` — replace hand-written Description with `DescriptionSection`, (3) server `page.tsx` — add dynamic FAQ, howToSteps, sameAs, ogImage. No new files created.

**Tech Stack:** Next.js 16 App Router, TypeScript, next-intl, Tailwind CSS

**Prerequisites:** Plan 1 (`DescriptionSection` component, `TOOLS` with emoji/sameAs, `buildToolSchemas` with sameAs/howToSteps support) and Plan 2 (`generatePageMeta` ogImage support, OG API route) must be complete.

---

## File Structure

| File                                          | Responsibility                                           | Status |
| --------------------------------------------- | -------------------------------------------------------- | ------ |
| `public/locales/en/textcase.json`             | Add whatIs, useCases, steps, faq3                        | Modify |
| `app/[locale]/textcase/textcase-page.tsx`     | Replace Description → DescriptionSection                 | Modify |
| `app/[locale]/textcase/page.tsx`              | Add howToSteps, sameAs, ogImage                          | Modify |
| `public/locales/en/checksum.json`             | Add whatIs, useCases, steps, faq3                        | Modify |
| `app/[locale]/checksum/checksum-page.tsx`     | Replace Description → DescriptionSection                 | Modify |
| `app/[locale]/checksum/page.tsx`              | Add howToSteps, sameAs, ogImage                          | Modify |
| `public/locales/en/hashing.json`              | Add whatIs, useCases, steps, faq3                        | Modify |
| `app/[locale]/hashing/hashing-page.tsx`       | Replace Description → DescriptionSection + extraSections | Modify |
| `app/[locale]/hashing/page.tsx`               | Add howToSteps, sameAs, ogImage                          | Modify |
| `public/locales/en/numbase.json`              | Add useCases, steps, faq2, faq3                          | Modify |
| `app/[locale]/numbase/numbase-page.tsx`       | Replace Description → DescriptionSection                 | Modify |
| `app/[locale]/numbase/page.tsx`               | Add howToSteps, sameAs, ogImage                          | Modify |
| `public/locales/en/htmlcode.json`             | Add whatIs, useCases, steps, faq3                        | Modify |
| `app/[locale]/htmlcode/htmlcode-page.tsx`     | Replace BottomDescription → DescriptionSection           | Modify |
| `app/[locale]/htmlcode/page.tsx`              | Add howToSteps, sameAs, ogImage                          | Modify |
| `public/locales/en/httpstatus.json`           | Add whatIs, useCases, steps, faq3                        | Modify |
| `app/[locale]/httpstatus/httpstatus-page.tsx` | Replace BottomDescription → DescriptionSection           | Modify |
| `app/[locale]/httpstatus/page.tsx`            | Add howToSteps, sameAs, ogImage                          | Modify |

---

## Task 1: textcase

**Files:**

- Modify: `public/locales/en/textcase.json`
- Modify: `app/[locale]/textcase/textcase-page.tsx`
- Modify: `app/[locale]/textcase/page.tsx`

- [ ] **Step 1: Update English translation JSON**

Replace the `descriptions` object in `public/locales/en/textcase.json`:

```json
  "descriptions": {
    "aeoDefinition": "Text Case Converter is a free online tool that converts text between camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, and more. Instant conversion with real-time preview. No data leaves your browser.",
    "whatIsTitle": "What is a Text Case Converter?",
    "whatIs": "A text case converter transforms strings between naming conventions used in programming and writing. It detects the input format automatically and shows conversions to camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case, dot.case, lower case, UPPER CASE, Title Case, Sentence case, and path/case — all updated in real time as you type.",
    "useCasesTitle": "Common Use Cases",
    "useCasesDesc1": "Language Migration",
    "useCasesP1": "Rename variables when migrating code between languages — convert Python snake_case to JavaScript camelCase with one paste.",
    "useCasesDesc2": "Naming Convention Enforcement",
    "useCasesP2": "Generate consistent URL slugs, CSS class names, or environment variable names from plain English input.",
    "stepsTitle": "How to Convert Text Case",
    "step1Title": "Paste your text",
    "step1Text": "Type or paste any string into the input field. The tool auto-detects the current case format.",
    "step2Title": "Review conversions",
    "step2Text": "All 11 case formats are displayed instantly in a table. The detected format is highlighted with a badge.",
    "step3Title": "Copy the result",
    "step3Text": "Click the copy button next to any converted string to copy it to your clipboard.",
    "faq1Q": "Can I convert multiple strings at once?",
    "faq1A": "Yes. Paste multiple lines and the tool converts each line independently. Multi-line conversion applies the selected case to every line.",
    "faq2Q": "Does it handle non-ASCII characters?",
    "faq2A": "Yes. The tool correctly handles Unicode characters including accented letters, CJK characters, and emojis in case conversions.",
    "faq3Q": "What case formats are supported?",
    "faq3A": "The converter supports 11 formats: camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case, dot.case, lower case, UPPER CASE, Title Case, Sentence case, and path/case."
  }
```

- [ ] **Step 2: Migrate textcase-page.tsx**

The current `Description` function contains aeoDefinition, a reference table, and FAQ. Extract the reference table into its own function, remove `Description`, and add `DescriptionSection`.

Replace the entire `app/[locale]/textcase/textcase-page.tsx` with:

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import { StyledInput } from "../../../components/ui/input";
import { CopyButton } from "../../../components/ui/copy-btn";
import { clipInput, detectFormats, convertAll } from "../../../libs/textcase/main";
import RelatedTools from "../../../components/related-tools";
import PrivacyBanner from "../../../components/privacy-banner";
import DescriptionSection from "../../../components/description-section";

const REFERENCE_ROWS: { key: string; example: string }[] = [
  { key: "camelCase", example: "myVariableName" },
  { key: "pascalCase", example: "MyVariableName" },
  { key: "snakeCase", example: "my_variable_name" },
  { key: "constantCase", example: "MY_VARIABLE_NAME" },
  { key: "kebabCase", example: "my-variable-name" },
  { key: "dotCase", example: "my.variable.name" },
  { key: "lowerCase", example: "my variable name" },
  { key: "upperCase", example: "MY VARIABLE NAME" },
  { key: "titleCase", example: "My Variable Name" },
  { key: "sentenceCase", example: "My variable name" },
  { key: "pathCase", example: "my/variable/name" },
];

function Conversion() {
  const t = useTranslations("textcase");
  const tc = useTranslations("common");
  const [rawInput, setRawInput] = useState("");

  const { value: input, clipped } = clipInput(rawInput);
  const detected = detectFormats(input);
  const detectedSet = new Set(detected);
  const results = convertAll(input);

  return (
    <section id="conversion">
      <div className="relative">
        <StyledInput
          autoFocus
          type="text"
          value={rawInput}
          placeholder={t("inputPlaceholder")}
          onChange={(e) => setRawInput(e.target.value)}
          className="text-base font-mono pr-9"
        />
        {rawInput && (
          <button
            type="button"
            aria-label={tc("clear")}
            onClick={() => setRawInput("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg-primary transition-colors cursor-pointer"
          >
            ×
          </button>
        )}
      </div>
      {clipped && <div className="mt-1 text-xs text-fg-muted font-mono">{t("inputClipped")}</div>}
      {detected.length === 1 && (
        <div className="mt-1 text-xs text-fg-muted font-mono">
          {t("detectedFormat", { format: t(detected[0]) })}
        </div>
      )}
      {input !== "" && (
        <div className="mt-4 rounded-lg border border-border-default overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default bg-bg-elevated/40">
                <th className="py-2 px-4 text-fg-muted text-xs font-mono font-medium text-left whitespace-nowrap uppercase tracking-wider">
                  {t("format")}
                </th>
                <th className="py-2 px-4 text-fg-muted text-xs font-mono font-medium text-left whitespace-nowrap uppercase tracking-wider">
                  {t("output")}
                </th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const isCurrent = detectedSet.has(r.key);
                return (
                  <tr
                    key={r.key}
                    className="border-b border-border-default last:border-b-0 odd:bg-bg-elevated/40 hover:bg-accent-cyan/10"
                  >
                    <th
                      scope="row"
                      className={`py-2.5 px-4 text-xs font-mono font-medium text-left whitespace-nowrap ${
                        isCurrent ? "text-accent-cyan" : "text-fg-secondary"
                      }`}
                    >
                      {t(r.key)}
                      {isCurrent && (
                        <span className="ms-2 inline-block rounded-full bg-accent-cyan/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent-cyan">
                          {t("current")}
                        </span>
                      )}
                    </th>
                    <td className="py-2.5 px-4 font-mono text-sm break-all">{r.output}</td>
                    <td className="py-2.5 px-2 align-middle">
                      <CopyButton
                        getContent={() => r.output}
                        className="opacity-60 hover:opacity-100 transition-opacity"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ReferenceTable() {
  const t = useTranslations("textcase");

  return (
    <section className="mt-6">
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border-default" />
        <span className="font-mono text-xs font-semibold text-fg-muted uppercase tracking-wider">
          {t("referenceTable")}
        </span>
        <div className="flex-1 h-px bg-border-default" />
      </div>
      <div className="rounded-lg border border-border-default overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-default bg-bg-elevated/40">
              <th className="py-2 px-4 text-fg-muted text-xs font-mono font-medium text-left whitespace-nowrap uppercase tracking-wider">
                {t("format")}
              </th>
              <th className="py-2 px-4 text-fg-muted text-xs font-mono font-medium text-left whitespace-nowrap uppercase tracking-wider">
                {t("example")}
              </th>
              <th className="py-2 px-4 text-fg-muted text-xs font-mono font-medium text-left whitespace-nowrap uppercase tracking-wider">
                {t("useCase")}
              </th>
            </tr>
          </thead>
          <tbody>
            {REFERENCE_ROWS.map((row) => (
              <tr
                key={row.key}
                className="border-b border-border-default last:border-b-0 odd:bg-bg-elevated/40 hover:bg-accent-cyan/10"
              >
                <th
                  scope="row"
                  className="py-2.5 px-4 text-fg-secondary text-xs font-mono font-medium text-left whitespace-nowrap"
                >
                  {t(row.key)}
                </th>
                <td className="py-2.5 px-4 font-mono text-sm break-all">{row.example}</td>
                <td className="py-2.5 px-4 text-sm text-fg-secondary">
                  {t(`useCases.${row.key}`)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function TextCasePage() {
  const t = useTranslations("tools");
  const title = t("textcase.shortTitle");
  return (
    <Layout title={title} categoryLabel={t("categories.text")} categorySlug="text-processing">
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner />
        <Conversion />
        <ReferenceTable />
        <DescriptionSection namespace="textcase" />
        <RelatedTools currentTool="textcase" />
      </div>
    </Layout>
  );
}
```

- [ ] **Step 3: Update page.tsx**

Replace the entire `app/[locale]/textcase/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import TextCasePage from "./textcase-page";

const PATH = "/textcase";
const TOOL_KEY = "textcase";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("textcase.title"),
    description: t("textcase.description"),
    ogImage: {
      title: t("textcase.shortTitle"),
      emoji: tool.emoji,
      desc: t("textcase.description"),
    },
  });
}

export default async function TextCaseRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "textcase" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

  const faqCount = 3;
  const faqItems = Array.from({ length: faqCount }, (_, i) => {
    const qKey = `descriptions.faq${i + 1}Q`;
    return tx.has(qKey) ? { q: tx(qKey), a: tx(`descriptions.faq${i + 1}A`) } : null;
  }).filter((item): item is { q: string; a: string } => item !== null);

  const howToStepCount = 3;
  const howToSteps = Array.from({ length: howToStepCount }, (_, i) => {
    const nameKey = `descriptions.step${i + 1}Title`;
    return tx.has(nameKey)
      ? {
          name: tx(nameKey),
          text: tx.has(`descriptions.step${i + 1}Text`) ? tx(`descriptions.step${i + 1}Text`) : "",
        }
      : null;
  }).filter((step): step is { name: string; text: string } => step !== null);

  const schemas = buildToolSchemas({
    name: t("textcase.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("textcase.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems,
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
      <TextCasePage />
    </>
  );
}
```

- [ ] **Step 4: Verify and commit**

```bash
npx next build 2>&1 | tail -5
git add public/locales/en/textcase.json "app/[locale]/textcase/textcase-page.tsx" "app/[locale]/textcase/page.tsx"
git commit -m "feat(seo): add full SEO content + DescriptionSection migration for textcase"
```

---

## Task 2: checksum

**Files:**

- Modify: `public/locales/en/checksum.json`
- Modify: `app/[locale]/checksum/checksum-page.tsx`
- Modify: `app/[locale]/checksum/page.tsx`

- [ ] **Step 1: Update English translation JSON**

Replace the `descriptions` object in `public/locales/en/checksum.json`:

```json
  "descriptions": {
    "aeoDefinition": "File Checksum is a free online tool for calculating MD5, SHA-1, SHA-256, and SHA-512 checksums for any file. Supports unlimited file size with 100% client-side processing.",
    "whatIsTitle": "What is a File Checksum?",
    "whatIs": "A file checksum is a fixed-size hash value computed from a file's contents using a cryptographic algorithm. Even a single byte change in the file produces a completely different checksum, making it ideal for verifying data integrity. This tool supports MD5, SHA-1, SHA-224, SHA-256, SHA-384, SHA-512, SHA3, and RIPEMD-160.",
    "useCasesTitle": "Common Use Cases",
    "useCasesDesc1": "Download Verification",
    "useCasesP1": "Verify downloaded files match the publisher's published checksum to confirm no corruption or tampering occurred during transfer.",
    "useCasesDesc2": "Backup Integrity",
    "useCasesP2": "Compare checksums before and after copying files to network storage, optical media, or cloud backups to ensure data fidelity.",
    "stepsTitle": "How to Calculate a File Checksum",
    "step1Title": "Select your file",
    "step1Text": "Drag and drop a file onto the drop zone, or click to browse. Multiple files are supported.",
    "step2Title": "Choose algorithms",
    "step2Text": "Check the hash algorithms you need. For large files, select only what you need to reduce processing time.",
    "step3Title": "Calculate and compare",
    "step3Text": "Click Calculate. Paste an expected checksum into the comparison field to instantly verify a match.",
    "faq1Q": "What is a file checksum?",
    "faq1A": "A checksum is a hash value computed from file contents. It's used to verify file integrity — if even one byte changes, the checksum changes completely.",
    "faq2Q": "Is there a file size limit?",
    "faq2A": "No hard limit. The tool processes files in chunks using the HTML5 File API, supporting unlimited file sizes limited only by your device's memory.",
    "faq3Q": "Which hash algorithm should I use?",
    "faq3A": "For integrity verification, SHA-256 is the standard choice. MD5 and SHA-1 are faster but considered cryptographically broken. Use SHA-512 or SHA3 for higher security requirements."
  }
```

- [ ] **Step 2: Migrate checksum-page.tsx**

Remove the `Description` function (lines 521–566), remove the `CircleHelp` import, add `DescriptionSection` import, and replace `<Description />` with `<DescriptionSection namespace="checksum" />` in the default export.

The `Accordion` import stays (used by `FileCalculator`). Remove the second `CircleHelp` import line (`import { CircleHelp } from "lucide-react";` at line 19 — note `X` is already imported from a separate line at line 15).

Update imports at top of `app/[locale]/checksum/checksum-page.tsx`:

Remove line 19:

```tsx
import { CircleHelp } from "lucide-react";
```

Add after the last import:

```tsx
import DescriptionSection from "../../../components/description-section";
```

Remove the entire `Description` function (lines 521–566).

In the `ChecksumPage` default export (line 568), replace:

```tsx
<Description />
```

with:

```tsx
<DescriptionSection namespace="checksum" />
```

The complete `ChecksumPage` export becomes:

```tsx
export default function ChecksumPage() {
  const tc = useTranslations("common");
  const t = useTranslations("tools");
  return (
    <Layout
      title={t("checksum.shortTitle")}
      categoryLabel={t("categories.security")}
      categorySlug="security-crypto"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner variant="files" />
        <div className="flex items-start gap-2 border-l-2 border-accent-purple bg-accent-purple-dim/30 rounded-r-lg p-3 my-4">
          <span className="text-sm text-fg-secondary leading-relaxed">
            {tc("alert.checksumInfo")}
          </span>
        </div>
        <FileCalculator />
        <DescriptionSection namespace="checksum" />
        <RelatedTools currentTool="checksum" />
      </div>
    </Layout>
  );
}
```

- [ ] **Step 3: Update page.tsx**

Replace the entire `app/[locale]/checksum/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import ChecksumPage from "./checksum-page";

const PATH = "/checksum";
const TOOL_KEY = "checksum";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("checksum.title"),
    description: t("checksum.description"),
    ogImage: {
      title: t("checksum.shortTitle"),
      emoji: tool.emoji,
      desc: t("checksum.description"),
    },
  });
}

export default async function ChecksumRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "checksum" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

  const faqCount = 3;
  const faqItems = Array.from({ length: faqCount }, (_, i) => {
    const qKey = `descriptions.faq${i + 1}Q`;
    return tx.has(qKey) ? { q: tx(qKey), a: tx(`descriptions.faq${i + 1}A`) } : null;
  }).filter((item): item is { q: string; a: string } => item !== null);

  const howToStepCount = 3;
  const howToSteps = Array.from({ length: howToStepCount }, (_, i) => {
    const nameKey = `descriptions.step${i + 1}Title`;
    return tx.has(nameKey)
      ? {
          name: tx(nameKey),
          text: tx.has(`descriptions.step${i + 1}Text`) ? tx(`descriptions.step${i + 1}Text`) : "",
        }
      : null;
  }).filter((step): step is { name: string; text: string } => step !== null);

  const schemas = buildToolSchemas({
    name: t("checksum.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("checksum.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems,
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
      <ChecksumPage />
    </>
  );
}
```

- [ ] **Step 4: Verify and commit**

```bash
npx next build 2>&1 | tail -5
git add public/locales/en/checksum.json "app/[locale]/checksum/checksum-page.tsx" "app/[locale]/checksum/page.tsx"
git commit -m "feat(seo): add full SEO content + DescriptionSection migration for checksum"
```

---

## Task 3: hashing

**Files:**

- Modify: `public/locales/en/hashing.json`
- Modify: `app/[locale]/hashing/hashing-page.tsx`
- Modify: `app/[locale]/hashing/page.tsx`

This tool NEEDS `extraSections` to preserve the HMAC section and algorithm descriptions (MD5, SHA-1, SHA-2, SHA-3) that currently render from the `common` namespace.

- [ ] **Step 1: Update English translation JSON**

Replace the `descriptions` object in `public/locales/en/hashing.json`:

```json
  "descriptions": {
    "aeoDefinition": "Hash Generator is a free online tool for generating MD5, SHA-1, SHA-256, SHA-512, SHA3, Keccak, and RIPEMD-160 hashes. Supports HMAC and file hashing. No data is sent to any server.",
    "whatIsTitle": "What is Cryptographic Hashing?",
    "whatIs": "Cryptographic hashing converts input data of any size into a fixed-size fingerprint called a hash. The same input always produces the same hash, but even a tiny change completely alters the output. Hashes are one-way — you cannot reverse a hash back to the original input. This tool generates hashes using MD5, SHA-1, SHA-224, SHA-256, SHA-384, SHA-512, SHA3, Keccak, and RIPEMD-160.",
    "useCasesTitle": "Common Use Cases",
    "useCasesDesc1": "Data Integrity Verification",
    "useCasesP1": "Verify data integrity by comparing hashes of original and received data to detect any changes during transmission or storage.",
    "useCasesDesc2": "Message Authentication",
    "useCasesP2": "Generate HMAC signatures using a secret passphrase to authenticate message origin and integrity.",
    "stepsTitle": "How to Generate a Hash",
    "step1Title": "Enter your text",
    "step1Text": "Paste or type the plain text you want to hash into the input field.",
    "step2Title": "Select algorithms",
    "step2Text": "Check the hash algorithms you need from the algorithm panel. Multiple algorithms can be selected simultaneously.",
    "step3Title": "Copy the hash",
    "step3Text": "The hash output is displayed instantly. Use the copy button or paste a hash to compare for verification.",
    "hmacTitle": "HMAC",
    "hmac": "Keyed-hash message authentication codes (HMAC) is a mechanism for message authentication using cryptographic hash functions.",
    "faq1Q": "What is cryptographic hashing?",
    "faq1A": "Cryptographic hashing converts input data into a fixed-size fingerprint (hash). The same input always produces the same hash, but even a tiny change completely alters the output.",
    "faq2Q": "Is hashing the same as encryption?",
    "faq2A": "No. Hashing is one-way — you cannot reverse a hash back to the original input. Encryption is two-way. Hashing is used for verification, not confidentiality.",
    "faq3Q": "What is the difference between SHA-2 and SHA-3?",
    "faq3A": "SHA-2 (SHA-256, SHA-512) uses the Merkle-Damgard construction, while SHA-3 uses the Keccak sponge construction. SHA-3 is not a replacement for SHA-2 — it is an alternative offering a different internal design. Both are considered secure."
  }
```

- [ ] **Step 2: Migrate hashing-page.tsx**

Remove the `Description` function (lines 402–449), add a `HashingExtraSections` function, remove `Accordion` and `CircleHelp` imports, add `DescriptionSection` import.

Remove lines 18–19:

```tsx
import { Accordion } from "../../../components/ui/accordion";
import { CircleHelp } from "lucide-react";
```

Add after the last import:

```tsx
import DescriptionSection from "../../../components/description-section";
```

Remove the entire `Description` function (lines 402–449). Add the following function before the `HashingPage` default export:

```tsx
function HashingExtraSections() {
  const tc = useTranslations("common");
  const t = useTranslations("hashing");
  return (
    <>
      <div className="mb-4">
        <h2 className="font-semibold text-fg-primary text-base">{tc("algorithms.md5Title")}</h2>
        <p className="text-fg-secondary text-sm mt-1">{tc("algorithms.md5")}</p>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold text-fg-primary text-base">{tc("algorithms.sha1Title")}</h2>
        <p className="text-fg-secondary text-sm mt-1">{tc("algorithms.sha1")}</p>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold text-fg-primary text-base">{tc("algorithms.sha2Title")}</h2>
        <p className="text-fg-secondary text-sm mt-1">{tc("algorithms.sha2")}</p>
        <p className="text-fg-secondary text-sm mt-1">{tc("algorithms.sha2extra")}</p>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold text-fg-primary text-base">{tc("algorithms.sha3Title")}</h2>
        <p className="text-fg-secondary text-sm mt-1">{tc("algorithms.sha3")}</p>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold text-fg-primary text-base">{t("descriptions.hmacTitle")}</h2>
        <p className="text-fg-secondary text-sm mt-1">{t("descriptions.hmac")}</p>
      </div>
    </>
  );
}
```

In the `HashingPage` default export, replace:

```tsx
<Description />
```

with:

```tsx
<DescriptionSection namespace="hashing" extraSections={<HashingExtraSections />} />
```

The complete `HashingPage` export becomes:

```tsx
export default function HashingPage() {
  const t = useTranslations("tools");
  const title = t("hashing.shortTitle");

  return (
    <Layout title={title} categoryLabel={t("categories.security")} categorySlug="security-crypto">
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner />
        <TextHashing />
        <DescriptionSection namespace="hashing" extraSections={<HashingExtraSections />} />
        <RelatedTools currentTool="hashing" />
      </div>
    </Layout>
  );
}
```

- [ ] **Step 3: Update page.tsx**

Replace the entire `app/[locale]/hashing/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import HashingPage from "./hashing-page";

const PATH = "/hashing";
const TOOL_KEY = "hashing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("hashing.title"),
    description: t("hashing.description"),
    ogImage: {
      title: t("hashing.shortTitle"),
      emoji: tool.emoji,
      desc: t("hashing.description"),
    },
  });
}

export default async function HashingRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "hashing" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

  const faqCount = 3;
  const faqItems = Array.from({ length: faqCount }, (_, i) => {
    const qKey = `descriptions.faq${i + 1}Q`;
    return tx.has(qKey) ? { q: tx(qKey), a: tx(`descriptions.faq${i + 1}A`) } : null;
  }).filter((item): item is { q: string; a: string } => item !== null);

  const howToStepCount = 3;
  const howToSteps = Array.from({ length: howToStepCount }, (_, i) => {
    const nameKey = `descriptions.step${i + 1}Title`;
    return tx.has(nameKey)
      ? {
          name: tx(nameKey),
          text: tx.has(`descriptions.step${i + 1}Text`) ? tx(`descriptions.step${i + 1}Text`) : "",
        }
      : null;
  }).filter((step): step is { name: string; text: string } => step !== null);

  const schemas = buildToolSchemas({
    name: t("hashing.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("hashing.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems,
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
      <HashingPage />
    </>
  );
}
```

- [ ] **Step 4: Verify and commit**

```bash
npx next build 2>&1 | tail -5
git add public/locales/en/hashing.json "app/[locale]/hashing/hashing-page.tsx" "app/[locale]/hashing/page.tsx"
git commit -m "feat(seo): add full SEO content + DescriptionSection migration with extraSections for hashing"
```

---

## Task 4: numbase

**Files:**

- Modify: `public/locales/en/numbase.json`
- Modify: `app/[locale]/numbase/numbase-page.tsx`
- Modify: `app/[locale]/numbase/page.tsx`

This tool already has `whatIsTitle` + `whatIs` and `twosComplementTitle` + `twosComplement`. The two's complement section is preserved as a standalone component rendered before `DescriptionSection`.

- [ ] **Step 1: Update English translation JSON**

Replace the `descriptions` object in `public/locales/en/numbase.json`:

```json
  "descriptions": {
    "whatIsTitle": "What is Number Base Conversion?",
    "aeoDefinition": "Number Base Converter is a free online tool for converting numbers between binary, octal, decimal, and hexadecimal. Supports 8/16/32/64-bit two's complement and a visual bit editor. Runs entirely in your browser.",
    "whatIs": "This tool converts numbers between binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16) in real time. It also supports 8/16/32/64-bit two's complement representation with a visual bit editor for toggling individual bits.",
    "twosComplementTitle": "Two's Complement",
    "twosComplement": "Two's complement is the standard way to represent signed integers in binary. The most significant bit (MSB) acts as the sign bit: 0 for positive, 1 for negative. To get the negative value, invert all bits and add 1. For example, in 8-bit mode, -1 is represented as 11111111 (0xFF).",
    "useCasesTitle": "Common Use Cases",
    "useCasesDesc1": "Systems Programming",
    "useCasesP1": "Debug low-level protocols, network packets, or binary file formats that use hexadecimal or octal notation.",
    "useCasesDesc2": "Hardware & Color",
    "useCasesP2": "Convert color values between hex and decimal, or calculate memory addresses and offsets during embedded development.",
    "stepsTitle": "How to Convert Number Bases",
    "step1Title": "Enter a value",
    "step1Text": "Type a number in any base — decimal, hexadecimal (0x prefix), octal (0o prefix), or binary (0b prefix). All other bases update instantly.",
    "step2Title": "Choose bit width",
    "step2Text": "Select 8, 16, 32, or 64-bit mode to see the two's complement representation and toggle individual bits in the visual editor.",
    "step3Title": "Copy the result",
    "step3Text": "Click the copy button next to any base conversion to copy the formatted value.",
    "faq1Q": "Can I edit individual bits?",
    "faq1A": "Yes. The bit editor shows the binary representation and lets you toggle individual bits, instantly updating all other base conversions.",
    "faq2Q": "What is two's complement used for?",
    "faq2A": "Two's complement is how computers represent signed integers. It lets the CPU use the same circuit for addition and subtraction, and avoids the +0/-0 problem of sign-magnitude representation.",
    "faq3Q": "Does it support negative numbers?",
    "faq3A": "Yes. Enter a negative decimal number and the tool displays the two's complement binary, hex, and octal representations based on the selected bit width."
  }
```

- [ ] **Step 2: Migrate numbase-page.tsx**

Remove the `Description` function, remove unused imports (`useLocale`, `renderLinkedText`, `Accordion`, `CircleHelp`), add `DescriptionSection` import, and add a `TwosComplementSection` function for the existing two's complement content.

Remove these import lines:

```tsx
import { useTranslations, useLocale } from "next-intl";
import { renderLinkedText } from "../../../utils/linked-text";
import { Accordion } from "../../../components/ui/accordion";
import { CircleHelp } from "lucide-react";
```

Replace with:

```tsx
import { useTranslations } from "next-intl";
import DescriptionSection from "../../../components/description-section";
```

Remove the entire `Description` function (lines 269–300). Add this function before the `NumbasePage` export:

```tsx
function TwosComplementSection() {
  const t = useTranslations("numbase");
  return (
    <div className="py-3">
      <h2 className="font-semibold text-fg-primary text-base">
        {t("descriptions.twosComplementTitle")}
      </h2>
      <p className="text-fg-secondary text-sm leading-relaxed">
        {t("descriptions.twosComplement")}
      </p>
    </div>
  );
}
```

In `NumbasePage`, replace `<Description />` with:

```tsx
        <TwosComplementSection />
        <DescriptionSection namespace="numbase" />
```

The complete `NumbasePage` export becomes:

```tsx
export default function NumbasePage() {
  const ts = useTranslations("tools");
  const title = ts("numbase.shortTitle");

  return (
    <Layout
      title={title}
      categoryLabel={ts("categories.encoding")}
      categorySlug="encoding-conversion"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <Converter />
        <TwosComplementSection />
        <DescriptionSection namespace="numbase" />
        <RelatedTools currentTool="numbase" />
        <ReferenceTable />
      </div>
    </Layout>
  );
}
```

- [ ] **Step 3: Update page.tsx**

Replace the entire `app/[locale]/numbase/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import NumbasePage from "./numbase-page";

const PATH = "/numbase";
const TOOL_KEY = "numbase";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("numbase.title"),
    description: t("numbase.description"),
    ogImage: {
      title: t("numbase.shortTitle"),
      emoji: tool.emoji,
      desc: t("numbase.description"),
    },
  });
}

export default async function NumbaseRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "numbase" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

  const faqCount = 3;
  const faqItems = Array.from({ length: faqCount }, (_, i) => {
    const qKey = `descriptions.faq${i + 1}Q`;
    return tx.has(qKey) ? { q: tx(qKey), a: tx(`descriptions.faq${i + 1}A`) } : null;
  }).filter((item): item is { q: string; a: string } => item !== null);

  const howToStepCount = 3;
  const howToSteps = Array.from({ length: howToStepCount }, (_, i) => {
    const nameKey = `descriptions.step${i + 1}Title`;
    return tx.has(nameKey)
      ? {
          name: tx(nameKey),
          text: tx.has(`descriptions.step${i + 1}Text`) ? tx(`descriptions.step${i + 1}Text`) : "",
        }
      : null;
  }).filter((step): step is { name: string; text: string } => step !== null);

  const schemas = buildToolSchemas({
    name: t("numbase.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("numbase.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems,
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
      <NumbasePage />
    </>
  );
}
```

- [ ] **Step 4: Verify and commit**

```bash
npx next build 2>&1 | tail -5
git add public/locales/en/numbase.json "app/[locale]/numbase/numbase-page.tsx" "app/[locale]/numbase/page.tsx"
git commit -m "feat(seo): add full SEO content + DescriptionSection migration for numbase"
```

---

## Task 5: htmlcode

**Files:**

- Modify: `public/locales/en/htmlcode.json`
- Modify: `app/[locale]/htmlcode/htmlcode-page.tsx`
- Modify: `app/[locale]/htmlcode/page.tsx`

This tool has a `TopDescription` component (expandable intro with p1/p2) that stays as-is. Only `BottomDescription` is replaced with `DescriptionSection`.

- [ ] **Step 1: Update English translation JSON**

Replace the `descriptions` object in `public/locales/en/htmlcode.json`:

```json
  "descriptions": {
    "p1": "HTML entities are special codes used to represent reserved characters in HTML. For example, &lt; for <, &amp; for &, and &quot; for \". See the [ASCII table](/ascii) for character codes, or [HTTP status codes](/httpstatus) for web response references.",
    "p2": "Before you use one of the below codes on your website, make sure your HTML document uses the correct encoding so you are sure that the HTML codes and HTML special codes are displayed properly. To make sure your HTML uses the correct encoding, you should make sure that you use the Unicode character set. This Unicode character set must be set in the head section of your HTML document. This is done by using a meta with the charset attribute and the value UTF-8. Just copy and paste the following meta into your head section and all the below HTML characters will be displayed perfectly so you're good to go.",
    "aeoDefinition": "HTML Entity Encoder is a free online tool for encoding and decoding HTML special characters and entities. Complete reference with numeric and named entities. Runs entirely in your browser.",
    "whatIsTitle": "What are HTML Entities?",
    "whatIs": "HTML entities are codes that represent characters reserved in HTML (like <, >, &) or characters that cannot be typed easily. They use the format &name; or &#number; — for example, &lt; renders as < and &#169; renders as the copyright symbol. This tool provides a complete reference of named entities, decimal codes, and hex codes across 8 categories.",
    "useCasesTitle": "Common Use Cases",
    "useCasesDesc1": "Escaping HTML",
    "useCasesP1": "Escape reserved HTML characters like <, >, &, and \" so they display as text instead of being parsed as markup.",
    "useCasesDesc2": "Special Characters",
    "useCasesP2": "Insert special symbols like currency signs, mathematical operators, or typographic marks into web pages using their entity codes.",
    "stepsTitle": "How to Find HTML Entities",
    "step1Title": "Choose a category",
    "step1Text": "Select a tab — Letters, Punctuation, Currencies, Mathematical, Pronunciations, Diacritics, ASCII, or Icons.",
    "step2Title": "Search or browse",
    "step2Text": "Use the search bar to filter by character, entity name, or code point. Or scroll through the full table.",
    "step3Title": "Copy the code",
    "step3Text": "Each row shows the character, named entity, decimal code, and hex code. Copy whichever format your project needs.",
    "faq1Q": "How many entities are documented?",
    "faq1A": "The tool provides a complete reference of HTML special characters including named entities (&amp;), decimal (&#38;), and hexadecimal (&#x26;) codes.",
    "faq2Q": "Can I search for specific characters?",
    "faq2A": "Yes. Search by character name, entity name, or code point to quickly find the HTML entity you need.",
    "faq3Q": "What is the difference between named and numeric entities?",
    "faq3A": "Named entities use a mnemonic like &amp; for & or &lt; for <. Numeric entities use the Unicode code point: &#38; (decimal) or &#x26; (hex). Named entities are more readable, but numeric entities work for all Unicode characters."
  }
```

- [ ] **Step 2: Migrate htmlcode-page.tsx**

Remove the `BottomDescription` function (lines 418–445), remove `Accordion` and `CircleHelp` imports (used only in BottomDescription), add `DescriptionSection` import.

Remove these import lines:

```tsx
import { Accordion } from "../../../components/ui/accordion";
import { CircleHelp } from "lucide-react";
```

Add after the last import:

```tsx
import DescriptionSection from "../../../components/description-section";
```

Remove the entire `BottomDescription` function (lines 418–445).

In the `HtmlCodePage` default export, replace:

```tsx
<BottomDescription />
```

with:

```tsx
<DescriptionSection namespace="htmlcode" />
```

The complete `HtmlCodePage` export becomes:

```tsx
export default function HtmlCodePage() {
  const t = useTranslations("tools");
  const th = useTranslations("htmlcode");
  const title = t("htmlcode.shortTitle");

  const letters = getLetters();
  const punctuations = getPunctuations();
  const currencies = getCurrencies();
  const mathematical = getMathematical();
  const diacritics = getDiacritics();
  const ascii = getAscii();
  const icons = getIcons();
  const pronunciations = getPronunciations();

  return (
    <Layout title={title} categoryLabel={t("categories.reference")} categorySlug="reference-lookup">
      <div className="container mx-auto px-4 pt-3 pb-6">
        <TopDescription />
        <section>
          <NeonTabs
            tabs={[
              {
                label: <span className="font-mono text-sm font-bold">{th("tabs.letters")}</span>,
                content: <PrintLetters list={letters} />,
              },
              {
                label: (
                  <span className="font-mono text-sm font-bold">{th("tabs.punctuation")}</span>
                ),
                content: (
                  <CharacterPrinter desc={th("tabDescriptions.punctuation")} list={punctuations} />
                ),
              },
              {
                label: <span className="font-mono text-sm font-bold">{th("tabs.currencies")}</span>,
                content: (
                  <CharacterPrinter desc={th("tabDescriptions.currencies")} list={currencies} />
                ),
              },
              {
                label: (
                  <span className="font-mono text-sm font-bold">{th("tabs.mathematical")}</span>
                ),
                content: (
                  <CharacterPrinter desc={th("tabDescriptions.mathematical")} list={mathematical} />
                ),
              },
              {
                label: (
                  <span className="font-mono text-sm font-bold">{th("tabs.pronunciations")}</span>
                ),
                content: (
                  <PronunciationPrinter
                    desc={th("tabDescriptions.pronunciations")}
                    list={pronunciations}
                  />
                ),
              },
              {
                label: <span className="font-mono text-sm font-bold">{th("tabs.diacritics")}</span>,
                content: (
                  <CharacterPrinter desc={th("tabDescriptions.diacritics")} list={diacritics} />
                ),
              },
              {
                label: <span className="font-mono text-sm font-bold">{th("tabs.ascii")}</span>,
                content: <CharacterPrinter desc={th("tabDescriptions.ascii")} list={ascii} />,
              },
              {
                label: <span className="font-mono text-sm font-bold">{th("tabs.icons")}</span>,
                content: <CharacterPrinter desc={th("tabDescriptions.icons")} list={icons} />,
              },
            ]}
          />
        </section>
        <DescriptionSection namespace="htmlcode" />
        <RelatedTools currentTool="htmlcode" />
      </div>
    </Layout>
  );
}
```

- [ ] **Step 3: Update page.tsx**

Replace the entire `app/[locale]/htmlcode/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import HtmlCodePage from "./htmlcode-page";

const PATH = "/htmlcode";
const TOOL_KEY = "htmlcode";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("htmlcode.title"),
    description: t("htmlcode.description"),
    ogImage: {
      title: t("htmlcode.shortTitle"),
      emoji: tool.emoji,
      desc: t("htmlcode.description"),
    },
  });
}

export default async function HtmlCodeRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "htmlcode" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

  const faqCount = 3;
  const faqItems = Array.from({ length: faqCount }, (_, i) => {
    const qKey = `descriptions.faq${i + 1}Q`;
    return tx.has(qKey) ? { q: tx(qKey), a: tx(`descriptions.faq${i + 1}A`) } : null;
  }).filter((item): item is { q: string; a: string } => item !== null);

  const howToStepCount = 3;
  const howToSteps = Array.from({ length: howToStepCount }, (_, i) => {
    const nameKey = `descriptions.step${i + 1}Title`;
    return tx.has(nameKey)
      ? {
          name: tx(nameKey),
          text: tx.has(`descriptions.step${i + 1}Text`) ? tx(`descriptions.step${i + 1}Text`) : "",
        }
      : null;
  }).filter((step): step is { name: string; text: string } => step !== null);

  const schemas = buildToolSchemas({
    name: t("htmlcode.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("htmlcode.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems,
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
      <HtmlCodePage />
    </>
  );
}
```

- [ ] **Step 4: Verify and commit**

```bash
npx next build 2>&1 | tail -5
git add public/locales/en/htmlcode.json "app/[locale]/htmlcode/htmlcode-page.tsx" "app/[locale]/htmlcode/page.tsx"
git commit -m "feat(seo): add full SEO content + DescriptionSection migration for htmlcode"
```

---

## Task 6: httpstatus

**Files:**

- Modify: `public/locales/en/httpstatus.json`
- Modify: `app/[locale]/httpstatus/httpstatus-page.tsx`
- Modify: `app/[locale]/httpstatus/page.tsx`

This tool has a `TopDescription` component (expandable intro) that stays as-is. Only `BottomDescription` is replaced with `DescriptionSection`.

- [ ] **Step 1: Update English translation JSON**

Replace the `descriptions` object in `public/locales/en/httpstatus.json`:

```json
  "descriptions": {
    "text": "A complete reference of HTTP status codes with descriptions, categories, and RFC specification links. Covers all IANA-registered codes plus common unofficial codes. Test APIs with the [HTTP Client](/httpclient), or encode URLs with the [URL Encoder](/urlencoder).",
    "aeoDefinition": "HTTP Status Codes is a free online reference for all HTTP status codes with descriptions, categories, and RFC links. Covers official IANA codes and common unofficial codes.",
    "whatIsTitle": "What are HTTP Status Codes?",
    "whatIs": "HTTP status codes are three-digit numbers returned by a server in response to a client request. They indicate whether the request was successful, redirected, or encountered an error. Codes are grouped into five classes: 1xx (Informational), 2xx (Success), 3xx (Redirection), 4xx (Client Error), and 5xx (Server Error). This reference covers all IANA-registered codes plus common unofficial codes from Nginx and Cloudflare.",
    "useCasesTitle": "Common Use Cases",
    "useCasesDesc1": "API Debugging",
    "useCasesP1": "Debug API responses by looking up unfamiliar status codes and understanding their meaning, common causes, and usage context.",
    "useCasesDesc2": "Error Handling Design",
    "useCasesP2": "Implement proper error handling in your application by understanding which codes to expect and how to respond to each.",
    "stepsTitle": "How to Use the HTTP Status Code Reference",
    "step1Title": "Search or filter",
    "step1Text": "Search by code number, status name, or description. Filter by category using the buttons: 1xx through 5xx, or unofficial codes.",
    "step2Title": "Review details",
    "step2Text": "Hover over a row (desktop) or tap it (mobile) to expand usage notes and common causes for that status code.",
    "step3Title": "Check the spec",
    "step3Text": "Each code links to its RFC specification. Click the spec link to read the authoritative definition.",
    "faq1Q": "How many status codes are documented?",
    "faq1A": "The tool covers all standard status codes across 5 categories: 1xx (Informational), 2xx (Success), 3xx (Redirection), 4xx (Client Error), and 5xx (Server Error).",
    "faq2Q": "Can I search for specific codes?",
    "faq2A": "Yes. Search by code number, phrase, or category to quickly find the status code you need.",
    "faq3Q": "What is the most common HTTP status code?",
    "faq3A": "200 OK is the most common — it means the request succeeded. 404 Not Found (resource doesn't exist) and 500 Internal Server Error (server-side failure) are also very common. Understanding these codes helps you diagnose issues faster."
  }
```

- [ ] **Step 2: Migrate httpstatus-page.tsx**

Remove the `BottomDescription` function (lines 281–308), remove `Accordion` and `CircleHelp` imports (used only in BottomDescription), add `DescriptionSection` import.

Remove these import lines:

```tsx
import { Accordion } from "../../../components/ui/accordion";
import { CircleHelp } from "lucide-react";
```

Add after the last import:

```tsx
import DescriptionSection from "../../../components/description-section";
```

Remove the entire `BottomDescription` function (lines 281–308).

In the `HttpStatusPage` default export, replace:

```tsx
<BottomDescription />
```

with:

```tsx
<DescriptionSection namespace="httpstatus" />
```

The complete `HttpStatusPage` export becomes:

```tsx
export default function HttpStatusPage() {
  const t = useTranslations("tools");
  const th = useTranslations("httpstatus");
  const title = t("httpstatus.shortTitle");

  return (
    <Layout title={title} categoryLabel={t("categories.reference")} categorySlug="reference-lookup">
      <div className="container mx-auto px-4 pt-3 pb-6">
        <TopDescription />
        <div className="flex items-start gap-2 border-l-2 border-accent-cyan bg-accent-cyan-dim/30 rounded-r-lg p-3 my-4">
          <span className="text-sm text-fg-secondary leading-relaxed">{th("tip")}</span>
        </div>
        <section>
          <StatusCodeTable />
        </section>
        <DescriptionSection namespace="httpstatus" />
        <RelatedTools currentTool="httpstatus" />
      </div>
    </Layout>
  );
}
```

- [ ] **Step 3: Update page.tsx**

Replace the entire `app/[locale]/httpstatus/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import HttpStatusPage from "./httpstatus-page";

const PATH = "/httpstatus";
const TOOL_KEY = "httpstatus";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("httpstatus.title"),
    description: t("httpstatus.description"),
    ogImage: {
      title: t("httpstatus.shortTitle"),
      emoji: tool.emoji,
      desc: t("httpstatus.description"),
    },
  });
}

export default async function HttpStatusRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "httpstatus" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

  const faqCount = 3;
  const faqItems = Array.from({ length: faqCount }, (_, i) => {
    const qKey = `descriptions.faq${i + 1}Q`;
    return tx.has(qKey) ? { q: tx(qKey), a: tx(`descriptions.faq${i + 1}A`) } : null;
  }).filter((item): item is { q: string; a: string } => item !== null);

  const howToStepCount = 3;
  const howToSteps = Array.from({ length: howToStepCount }, (_, i) => {
    const nameKey = `descriptions.step${i + 1}Title`;
    return tx.has(nameKey)
      ? {
          name: tx(nameKey),
          text: tx.has(`descriptions.step${i + 1}Text`) ? tx(`descriptions.step${i + 1}Text`) : "",
        }
      : null;
  }).filter((step): step is { name: string; text: string } => step !== null);

  const schemas = buildToolSchemas({
    name: t("httpstatus.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("httpstatus.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems,
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
      <HttpStatusPage />
    </>
  );
}
```

- [ ] **Step 4: Verify and commit**

```bash
npx next build 2>&1 | tail -5
git add public/locales/en/httpstatus.json "app/[locale]/httpstatus/httpstatus-page.tsx" "app/[locale]/httpstatus/page.tsx"
git commit -m "feat(seo): add full SEO content + DescriptionSection migration for httpstatus"
```

---

## Summary

| Task | Tool       | Files | Content Added                         | Special Handling                                                              |
| ---- | ---------- | ----- | ------------------------------------- | ----------------------------------------------------------------------------- |
| 1    | textcase   | 3     | whatIs, useCases (2), steps (3), faq3 | Reference table extracted as standalone component                             |
| 2    | checksum   | 3     | whatIs, useCases (2), steps (3), faq3 | Algorithm descriptions removed (replaced by structured content)               |
| 3    | hashing    | 3     | whatIs, useCases (2), steps (3), faq3 | extraSections preserves HMAC + algorithm descriptions from `common` namespace |
| 4    | numbase    | 3     | useCases (2), steps (3), faq2, faq3   | TwosComplement kept as standalone component; existing whatIs preserved        |
| 5    | htmlcode   | 3     | whatIs, useCases (2), steps (3), faq3 | TopDescription stays; BottomDescription replaced                              |
| 6    | httpstatus | 3     | whatIs, useCases (2), steps (3), faq3 | TopDescription stays; BottomDescription replaced                              |
