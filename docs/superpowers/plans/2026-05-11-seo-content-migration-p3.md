# SEO Content + Migration (Batch 3: 20 Tools) — Plan 5 of 6

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add howToSteps, missing FAQs, whatIs, and useCases content to 20 tools that have relatively complete descriptions. Migrate all 20 tools from hand-written Description functions to the shared `DescriptionSection` component. Update server `page.tsx` files with howToSteps JSON-LD, sameAs, and ogImage.

**Architecture:** Each tool gets 3 files changed: (1) English translation JSON — add missing description keys (stepsTitle, step1-3Title/Text, missing whatIs/useCases/faq3), (2) client `*-page.tsx` — replace hand-written Description with `DescriptionSection`, (3) server `page.tsx` — add howToSteps, sameAs, ogImage. Tools with complex custom sections (json, base64, regex, urlencoder, extractor, httpclient, yaml, csv, csv-md, cron, unixtime, wallet, bip39, ascii) keep their extraSections rendered via the `extraSections` prop or remain partially hand-written.

**Tech Stack:** Next.js 16 App Router, TypeScript, next-intl, Tailwind CSS

**Prerequisites:** Plan 1 (`DescriptionSection` component, `TOOLS` with emoji/sameAs, `buildToolSchemas` with sameAs/howToSteps support) and Plan 2 (`generatePageMeta` ogImage support, OG API route) must be complete.

---

## Migration Strategy

### Tool Complexity Categories

**Simple (drop-in DescriptionSection, no extraSections):** deduplines, csv, storageunit, wordcounter, dbviewer, csv-md, token-counter, image

**Complex (need extraSections or partial hand-written):** json, base64, regex, urlencoder, cron, unixtime, yaml, extractor, httpclient, wallet, bip39, ascii

For **simple** tools, the `Description` function is fully replaced by `<DescriptionSection namespace="toolname" />`.

For **complex** tools, the `Description` function's FAQ and useCases sections are replaced by `DescriptionSection`, while custom sections (tables, feature lists, etc.) are passed via the `extraSections` prop or remain inline.

---

## File Structure

| File                                                | Responsibility                                                  | Status |
| --------------------------------------------------- | --------------------------------------------------------------- | ------ |
| `public/locales/en/json.json`                       | Add steps, faq3                                                 | Modify |
| `app/[locale]/json/json-page.tsx`                   | Replace Description → DescriptionSection + extraSections        | Modify |
| `app/[locale]/json/page.tsx`                        | Add howToSteps, sameAs, ogImage                                 | Modify |
| `public/locales/en/base64.json`                     | Add stepsTitle + step1-3Title/Text format, faq3                 | Modify |
| `app/[locale]/base64/base64-page.tsx`               | Replace Description → DescriptionSection + extraSections        | Modify |
| `app/[locale]/base64/page.tsx`                      | Add sameAs, ogImage                                             | Modify |
| `public/locales/en/regex.json`                      | Add steps, faq3                                                 | Modify |
| `app/[locale]/regex/regex-page.tsx`                 | Replace Description → DescriptionSection + extraSections        | Modify |
| `app/[locale]/regex/page.tsx`                       | Add howToSteps, sameAs, ogImage                                 | Modify |
| `public/locales/en/urlencoder.json`                 | Add steps                                                       | Modify |
| `app/[locale]/urlencoder/urlencoder-page.tsx`       | Replace Description → DescriptionSection + extraSections        | Modify |
| `app/[locale]/urlencoder/page.tsx`                  | Add howToSteps, sameAs, ogImage                                 | Modify |
| `public/locales/en/deduplines.json`                 | Add steps                                                       | Modify |
| `app/[locale]/deduplines/deduplines-page.tsx`       | Replace Description → DescriptionSection                        | Modify |
| `app/[locale]/deduplines/page.tsx`                  | Add howToSteps, ogImage                                         | Modify |
| `public/locales/en/csv.json`                        | Add steps, faq3                                                 | Modify |
| `app/[locale]/csv/csv-page.tsx`                     | Replace Description → DescriptionSection + extraSections        | Modify |
| `app/[locale]/csv/page.tsx`                         | Add howToSteps, sameAs, ogImage                                 | Modify |
| `public/locales/en/csv-md.json`                     | Add steps                                                       | Modify |
| `app/[locale]/csv-md/csv-md-page.tsx`               | Replace Description → DescriptionSection + extraSections        | Modify |
| `app/[locale]/csv-md/page.tsx`                      | Add howToSteps, sameAs, ogImage                                 | Modify |
| `public/locales/en/yaml.json`                       | Add steps                                                       | Modify |
| `app/[locale]/yaml/yaml-page.tsx`                   | Replace Description → DescriptionSection + extraSections        | Modify |
| `app/[locale]/yaml/page.tsx`                        | Add howToSteps, sameAs, ogImage                                 | Modify |
| `public/locales/en/cron.json`                       | Add steps, faq3                                                 | Modify |
| `app/[locale]/cron/cron-page.tsx`                   | Replace Description → DescriptionSection + extraSections        | Modify |
| `app/[locale]/cron/page.tsx`                        | Add howToSteps, sameAs, ogImage                                 | Modify |
| `public/locales/en/unixtime.json`                   | Add steps                                                       | Modify |
| `app/[locale]/unixtime/unixtime-page.tsx`           | Replace Description → DescriptionSection + extraSections        | Modify |
| `app/[locale]/unixtime/page.tsx`                    | Add howToSteps, sameAs, ogImage                                 | Modify |
| `public/locales/en/storageunit.json`                | Add steps, faq3                                                 | Modify |
| `app/[locale]/storageunit/storageunit-page.tsx`     | Replace Description → DescriptionSection                        | Modify |
| `app/[locale]/storageunit/page.tsx`                 | Add howToSteps, ogImage                                         | Modify |
| `public/locales/en/image.json`                      | Add whatIs, steps, useCases                                     | Modify |
| `app/[locale]/image/image-page.tsx`                 | Replace Description → DescriptionSection                        | Modify |
| `app/[locale]/image/page.tsx`                       | Add howToSteps, ogImage                                         | Modify |
| `public/locales/en/extractor.json`                  | Add whatIs, steps, useCases                                     | Modify |
| `app/[locale]/extractor/extractor-page.tsx`         | Replace Description → DescriptionSection + extraSections        | Modify |
| `app/[locale]/extractor/page.tsx`                   | Add howToSteps, ogImage                                         | Modify |
| `public/locales/en/wordcounter.json`                | Add steps, useCases                                             | Modify |
| `app/[locale]/wordcounter/wordcounter-page.tsx`     | Replace Description → DescriptionSection                        | Modify |
| `app/[locale]/wordcounter/page.tsx`                 | Add howToSteps, ogImage                                         | Modify |
| `public/locales/en/httpclient.json`                 | Add whatIs, steps, useCases                                     | Modify |
| `app/[locale]/httpclient/httpclient-page.tsx`       | Replace DescriptionDetails → DescriptionSection + extraSections | Modify |
| `app/[locale]/httpclient/page.tsx`                  | Add howToSteps, ogImage                                         | Modify |
| `public/locales/en/token-counter.json`              | Add steps, useCases                                             | Modify |
| `app/[locale]/token-counter/token-counter-page.tsx` | Replace Description → DescriptionSection                        | Modify |
| `app/[locale]/token-counter/page.tsx`               | Add howToSteps, ogImage                                         | Modify |
| `public/locales/en/wallet.json`                     | Add steps, useCases                                             | Modify |
| `app/[locale]/wallet/wallet-page.tsx`               | Replace Description → DescriptionSection + extraSections        | Modify |
| `app/[locale]/wallet/page.tsx`                      | Add howToSteps, sameAs, ogImage                                 | Modify |
| `public/locales/en/bip39.json`                      | Add steps, faq3                                                 | Modify |
| `app/[locale]/bip39/bip39-page.tsx`                 | Replace BottomDescription → DescriptionSection + extraSections  | Modify |
| `app/[locale]/bip39/page.tsx`                       | Add howToSteps, sameAs, ogImage                                 | Modify |
| `public/locales/en/dbviewer.json`                   | Add steps, useCases                                             | Modify |
| `app/[locale]/dbviewer/dbviewer-page.tsx`           | Replace Description → DescriptionSection                        | Modify |
| `app/[locale]/dbviewer/page.tsx`                    | Add howToSteps, ogImage                                         | Modify |
| `public/locales/en/ascii.json`                      | Add steps, faq3                                                 | Modify |
| `app/[locale]/ascii/ascii-page.tsx`                 | Replace Description → DescriptionSection                        | Modify |
| `app/[locale]/ascii/page.tsx`                       | Add howToSteps, sameAs, ogImage                                 | Modify |

---

## Task 1: json + base64 + regex

### Tool: json

key=`json`, path=`/json`, emoji=`{}`, sameAs=`["https://www.json.org", "https://datatracker.ietf.org/doc/html/rfc8259"]`

**Current content:** whatIsP1/P2/P3, json5Title/P1/P2, useCasesP1-P4, limitationsP1-P3, aeoDefinition, faq1-2Q/A
**Missing:** steps, faq3
**Needs extraSections:** JSON5 section + limitations section (rendered after DescriptionSection)

- [ ] **Step 1: Update `public/locales/en/json.json`**

Replace the entire `descriptions` object inside `public/locales/en/json.json`:

```json
  "descriptions": {
    "whatIsTitle": "What is JSON Formatting?",
    "whatIsP1": "JSON (JavaScript Object Notation) is the universal data interchange format of the web. APIs return it, config files use it, and every modern programming language can parse it. Pair it with the [YAML converter](/yaml) or [CSV converter](/csv) for cross-format workflows. Formatting (pretty-printing) takes minified, hard-to-read JSON and adds indentation and line breaks so humans can scan and understand the structure at a glance.",
    "whatIsP2": "Compression (minification) does the reverse: it strips all unnecessary whitespace, producing the smallest possible valid JSON for production use — smaller payloads mean faster network transfers and lower bandwidth costs.",
    "whatIsP3": "This tool runs entirely in your browser. No data is ever sent to any server.",
    "stepsTitle": "How to Format JSON",
    "step1Title": "Paste your JSON",
    "step1Text": "Paste raw JSON or JSON5 text into the input area. The tool auto-detects whether the input is valid JSON or JSON5.",
    "step2Title": "Choose an action",
    "step2Text": "Click Format to pretty-print, Compress to minify, or toggle JSON5 mode for relaxed parsing. Use Sort Keys to alphabetize object keys.",
    "step3Title": "Copy the result",
    "step3Text": "The formatted or compressed output appears instantly. Click the copy button or drag the output to the input for further editing.",
    "json5Title": "What is JSON5?",
    "json5P1": "JSON5 is a superset of JSON that adds human-friendly features: comments (// and /* */), trailing commas, single-quoted strings, unquoted object keys, hexadecimal numbers (0xFF), and special values like NaN and Infinity. It was created to make JSON easier to write by hand — especially for configuration files.",
    "json5P2": "Enable JSON5 mode to parse relaxed input directly. When JSON5 mode is off, Format and Compress automatically fall back to JSON5 parsing if strict JSON parsing fails — you'll see a notification when this happens. Output is always standard JSON.",
    "useCasesP1": "Formatting API responses: paste a raw API response and pretty-print it to understand the data structure.",
    "aeoDefinition": "JSON Formatter is a free online tool that formats, validates, and minifies JSON data instantly in your browser. Supports JSON5, configurable indentation, and key sorting. No data is sent to any server.",
    "useCasesP2": "Minifying config files: compress JSON before deploying to production to reduce file size. Use [Text Diff](/diff) to verify the minified output matches the original.",
    "useCasesP3": "Fixing hand-edited JSON: paste JSON with trailing commas or comments, toggle JSON5 mode, and get clean standard JSON output.",
    "useCasesP4": "Sorting object keys: alphabetically sort keys for consistent diff output when version-controlling JSON files.",
    "limitationsP1": "Very large JSON files (>10MB) may cause the browser to pause briefly during formatting.",
    "limitationsP2": "Numbers beyond JavaScript's safe integer range (±2⁵³) may lose precision after round-tripping through JSON.parse/stringify.",
    "limitationsP3": "JSON5 error messages may not include exact line and column numbers.",
    "faq1Q": "What is JSON formatting?",
    "faq1A": "JSON formatting transforms raw or minified JSON into a readable, indented structure. This tool supports configurable indentation (2, 4, 8 spaces or tabs), minification, and validation — including JSON5 syntax.",
    "faq2Q": "What is the difference between JSON and JSON5?",
    "faq2A": "JSON5 is a superset of JSON that supports comments, trailing commas, unquoted keys, and more relaxed syntax. This tool can parse and format both standard JSON and JSON5.",
    "faq3Q": "Can I sort JSON keys?",
    "faq3A": "Yes. Toggle the Sort Keys option to alphabetically sort all object keys in the output. This is useful for version control diffs and consistent data structure comparison."
  }
```

- [ ] **Step 2: Migrate `app/[locale]/json/json-page.tsx`**

The current `Description` function (around line 481) renders: aeoDefinition, whatIs, JSON5 section, useCases, limitations. We replace it with `DescriptionSection` + custom extraSections for the JSON5 and limitations blocks.

In `app/[locale]/json/json-page.tsx`, make these changes:

**Add import** (after the existing imports near line 17-28):

```tsx
import DescriptionSection from "../../../components/description-section";
```

**Replace the `Description` function** (lines 481-534) with:

```tsx
function JsonExtraSections() {
  const t = useTranslations("json");
  const tc = useTranslations("common");

  return (
    <>
      <div className="mb-4">
        <h2 className="font-semibold text-fg-primary text-base">{t("descriptions.json5Title")}</h2>
        <div className="mt-1 space-y-1.5 text-fg-secondary text-sm leading-relaxed">
          <p>{t("descriptions.json5P1")}</p>
          <p>{t("descriptions.json5P2")}</p>
        </div>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold text-fg-primary text-base">
          {tc("descriptions.limitationsTitle")}
        </h2>
        <div className="mt-1 space-y-1.5 text-fg-secondary text-sm leading-relaxed">
          <p>{t("descriptions.limitationsP1")}</p>
          <p>{t("descriptions.limitationsP2")}</p>
          <p>{t("descriptions.limitationsP3")}</p>
        </div>
      </div>
    </>
  );
}

function Description() {
  const t = useTranslations("json");
  const locale = useLocale();

  return (
    <DescriptionSection namespace="json" showFaq={false} extraSections={<JsonExtraSections />} />
  );
}
```

**Note:** The `showFaq={false}` is intentional because json currently has no FAQ in its Description (only faq1-2 exist in JSON-LD via page.tsx). The `showUseCases={true}` is the default and works with plain `useCasesP1-P4` format.

- [ ] **Step 3: Update `app/[locale]/json/page.tsx`**

Replace the entire `app/[locale]/json/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import JsonPage from "./json-page";

const PATH = "/json";
const TOOL_KEY = "json";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("json.title"),
    description: t("json.description"),
    ogImage: { title: t("json.shortTitle"), emoji: tool.emoji, desc: t("json.description") },
  });
}

export default async function JsonRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "json" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("json.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("json.description"),
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
      <JsonPage />
    </>
  );
}
```

---

### Tool: base64

key=`base64`, path=`/base64`, emoji=`🔢`, sameAs=`["https://datatracker.ietf.org/doc/html/rfc4648"]`

**Current content:** whatIsTitle + whatIsP1/P2/P3, howTitle + howP1 + howStep1-4, useCasesP1/P2, limitationsP1/P2, aeoDefinition, faq1-2Q/A
**Missing:** stepsTitle + step1-3Title/Text format, faq3
**Needs extraSections:** Base64 alphabet table + encoding how-it-works section + why section + limitations

- [ ] **Step 4: Update `public/locales/en/base64.json`**

Replace the entire `descriptions` object inside `public/locales/en/base64.json`:

```json
  "descriptions": {
    "whatIsTitle": "What is Base64 Encoding?",
    "aeoDefinition": "Base64 Encoder/Decoder is a free online tool for encoding and decoding Base64 strings. Supports Basic Authentication headers, multiple charsets, and real-time conversion. All processing runs in your browser.",
    "whatIsP1": "Base64 encoding is a way to convert data (typically binary) into the ASCII character set. It is important to mention here that Base64 is not an encryption or compression technique, although it can sometimes be confused as encryption due to the way it seems to obscure data. Use [Hashing](/hashing) for cryptographic purposes or [URL Encoder](/urlencoder) for URL-safe strings.",
    "whatIsP2": "Base64 is the most widely used base encoding technique with Base16 and Base32 being the other two commonly used encoding schemes.",
    "whatIsP3": "Base64 encoding is one of the most common ways of converting binary data into plain ASCII text. It is a very useful format for communicating between one or more systems that cannot easily handle binary data, like images in HTML markup or web requests.",
    "stepsTitle": "How to Encode or Decode Base64",
    "step1Title": "Enter your text",
    "step1Text": "Type or paste the plain text you want to encode, or paste an existing Base64 string to decode.",
    "step2Title": "Choose encode or decode",
    "step2Text": "The tool converts in real time. Switch between Encode and Decode modes with a single click.",
    "step3Title": "Copy the result",
    "step3Text": "The encoded or decoded output appears instantly. Click the copy button to grab the result.",
    "howTitle": "How Does Base64 Work?",
    "howP1": "Converting data to base64 is a multistep process. Here is how it works for strings of text:",
    "howStep1": "Calculate the 8-bit binary version of the input text",
    "howStep2": "Re-group the 8 bit version of the data into multiple chunks of 6 bits",
    "howStep3": "Find the decimal version of each of the 6 bit binary chunk",
    "howStep4": "Find the Base64 symbol for each of the decimal values via a Base64 lookup table",
    "tableCaption": "Base64 Encoding Table",
    "tableValue": "Value",
    "tableChar": "Char",
    "whyTitle": "Why use Base64 Encoding?",
    "whyP1": "Sending information in binary format can sometimes be risky since not all applications or network systems can handle raw binary. On the other hand, the ASCII character set is widely known and very simple to handle for most systems.",
    "whyP2": "For instance email servers expect textual data, so ASCII is typically used. Therefore, if you want to send images or any other binary file to an email server you first need to encode it in text-based format, preferably ASCII. This is where Base64 encoding comes extremely handy in converting binary data to the correct formats.",
    "useCasesP1": "You can also use Base64 to represent binary data in a way that is compatible with HTML, JavaScript, and CSS. For example, you can embed an image inline in a CSS or JavaScript file using Base64. The [Cipher](/cipher) tool uses Base64 as the default output format for encrypted text.",
    "useCasesP2": "It is possible to use Base64 to convert input, like form data or JSON, to a string with a reduced character set that is URL-safe. However, due to how certain servers may interpret plus (+) and forward-slash (/) characters, it is recommended to use encodeURIComponent instead.",
    "limitationsP1": "Base64 is in no way meant to be a secure encryption method.",
    "limitationsP2": "Base64 is also not a compression method. Encoding a string to Base64 typically results in 33% longer output.",
    "faq1Q": "Is Base64 encryption?",
    "faq1A": "No. Base64 is encoding, not encryption. It provides no security — anyone can decode it. Use the Encrypt/Decrypt tool for actual data protection.",
    "faq2Q": "Does Base64 encoding increase file size?",
    "faq2A": "Yes. Base64 encoding increases data size by approximately 33%. Every 3 bytes of input become 4 characters of output.",
    "faq3Q": "Can I use Base64 for URL-safe encoding?",
    "faq3A": "Standard Base64 uses + and / characters which are not URL-safe. For URLs, use the URL Encoder tool or Base64url variant which replaces + with - and / with _."
  }
```

- [ ] **Step 5: Migrate `app/[locale]/base64/base64-page.tsx`**

The current `Description` function (starting around line 262) contains: aeoDefinition, whatIs, how-it-works with alphabet table, why, useCases, limitations, FAQ. We keep the custom alphabet table section as `extraSections`.

**Add import** (near the top of the file, with the other imports):

```tsx
import DescriptionSection from "../../../components/description-section";
```

**Replace the `Description` function** with:

```tsx
const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function Base64ExtraSections() {
  const t = useTranslations("base64");
  const tc = useTranslations("common");
  const locale = useLocale();

  return (
    <>
      <div className="mb-4">
        <h2 className="font-semibold text-fg-primary text-base">{t("descriptions.howTitle")}</h2>
        <p className="text-fg-secondary text-sm mt-1 leading-relaxed">{t("descriptions.howP1")}</p>
        <ol className="list-decimal list-inside text-fg-secondary text-sm mt-1 space-y-1">
          <li>{t("descriptions.howStep1")}</li>
          <li>{t("descriptions.howStep2")}</li>
          <li>{t("descriptions.howStep3")}</li>
          <li>{t("descriptions.howStep4")}</li>
        </ol>
        <div className="mt-3 rounded-lg border border-border-default bg-bg-elevated/50 p-3">
          <table className="w-full table-fixed text-xs font-mono border-collapse">
            <caption className="caption-top pb-2 font-semibold text-fg-primary text-sm">
              {t("descriptions.tableCaption")}
            </caption>
            <thead>
              <tr className="border-b border-border-default text-fg-muted">
                {[0, 1].flatMap((i) => [
                  <th key={`v-${i}`} className="px-2 py-1 text-start font-semibold">
                    {t("descriptions.tableValue")}
                  </th>,
                  <th key={`c-${i}`} className="px-2 py-1 text-start font-semibold">
                    {t("descriptions.tableChar")}
                  </th>,
                ])}
              </tr>
            </thead>
            <tbody className="text-fg-secondary">
              {Array.from({ length: 32 }, (_, row) => (
                <tr key={row} className="odd:bg-bg-elevated/40">
                  {[0, 32].flatMap((offset) => {
                    const value = row + offset;
                    return [
                      <td key={`v-${offset}`} className="px-2 py-1 tabular-nums">
                        {value}
                      </td>,
                      <td key={`c-${offset}`} className="px-2 py-1 font-semibold text-accent-cyan">
                        {BASE64_ALPHABET[value]}
                      </td>,
                    ];
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="font-semibold text-fg-primary text-base">{t("descriptions.whyTitle")}</h2>
        <div className="mt-1 space-y-1.5 text-fg-secondary text-sm leading-relaxed">
          <p>{t("descriptions.whyP1")}</p>
          <p>{t("descriptions.whyP2")}</p>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="font-semibold text-fg-primary text-base">
          {tc("descriptions.limitationsTitle")}
        </h2>
        <div className="mt-1 space-y-1.5 text-fg-secondary text-sm leading-relaxed">
          <p>{t("descriptions.limitationsP1")}</p>
          <p>{t("descriptions.limitationsP2")}</p>
        </div>
      </div>
    </>
  );
}

function Description() {
  return <DescriptionSection namespace="base64" extraSections={<Base64ExtraSections />} />;
}
```

- [ ] **Step 6: Update `app/[locale]/base64/page.tsx`**

Replace the entire `app/[locale]/base64/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import Base64Page from "./base64-page";

const PATH = "/base64";
const TOOL_KEY = "base64";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("base64.title"),
    description: t("base64.description"),
    ogImage: { title: t("base64.shortTitle"), emoji: tool.emoji, desc: t("base64.description") },
  });
}

export default async function Base64Route({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "base64" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("base64.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("base64.description"),
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
      <Base64Page />
    </>
  );
}
```

---

### Tool: regex

key=`regex`, path=`/regex`, emoji=`🔍`, sameAs=`["https://en.wikipedia.org/wiki/Regular_expression"]`

**Current content:** whatIsTitle + whatIsP1/P2/P3, featuresTitle + featuresP1-P6, useCasesP1-P5, limitationsP1-P4, aeoDefinition, faq1-2Q/A
**Missing:** steps, faq3
**Needs extraSections:** features list + cheatsheet + limitations (complex custom sections)

- [ ] **Step 7: Update `public/locales/en/regex.json`**

Add the following keys inside the `descriptions` object (after `"whatIsP3"`):

```json
    "stepsTitle": "How to Test a Regex",
    "step1Title": "Enter your pattern",
    "step1Text": "Type a regular expression in the pattern field. Toggle flags like g (global), i (case-insensitive), and m (multiline) as needed.",
    "step2Title": "Add test text",
    "step2Text": "Paste or type the text you want to match against. Matches are highlighted in real time as you type.",
    "step3Title": "Inspect and refine",
    "step3Text": "View match details with positions, capture groups, and replacements. Use Explain mode for a token-by-token breakdown.",
```

Also add `faq3` inside the `descriptions` object:

```json
    "faq3Q": "Is there a match limit?",
    "faq3A": "Yes. To keep the UI responsive, only the first 1,000 matches are rendered. For patterns with more matches, the tool shows a count of the total."
```

- [ ] **Step 8: Migrate `app/[locale]/regex/regex-page.tsx`**

The regex Description function (starting around line 585) is complex — it renders aeoDefinition, whatIs, features list, useCases, a cheatsheet table, limitations, and FAQ all inline. The cheatsheet is tightly coupled to component state. We keep the entire Description as-is but add the `stepsTitle`/`step*` keys to the JSON so DescriptionSection can render them via the page.tsx howToSteps.

Actually, since regex has a very custom layout (large cheatsheet table, feature list, limitations), we will keep the Description function mostly as-is but update the FAQ count and add the new faq3.

**No structural changes needed to `regex-page.tsx`** — the existing `Description` function already handles everything. We just need to update the FAQ array to include faq3.

In `app/[locale]/regex/regex-page.tsx`, find the FAQ array construction (around line 758):

```tsx
  const faqItems = [1, 2].map((i) => ({
```

Replace with:

```tsx
  const faqItems = [1, 2, 3].map((i) => ({
```

- [ ] **Step 9: Update `app/[locale]/regex/page.tsx`**

Replace the entire `app/[locale]/regex/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import RegexPage from "./regex-page";

const PATH = "/regex";
const TOOL_KEY = "regex";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("regex.title"),
    description: t("regex.description"),
    ogImage: { title: t("regex.shortTitle"), emoji: tool.emoji, desc: t("regex.description") },
  });
}

export default async function RegexRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "regex" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("regex.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("regex.description"),
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
      <RegexPage />
    </>
  );
}
```

- [ ] **Step 10: Commit**

```bash
git add public/locales/en/json.json app/[locale]/json/json-page.tsx app/[locale]/json/page.tsx public/locales/en/base64.json app/[locale]/base64/base64-page.tsx app/[locale]/base64/page.tsx public/locales/en/regex.json app/[locale]/regex/regex-page.tsx app/[locale]/regex/page.tsx
git commit -m "feat(seo): add steps, faq3, howToSteps JSON-LD, sameAs, ogImage for json, base64, regex"
```

---

## Task 2: urlencoder + deduplines + csv

### Tool: urlencoder

key=`urlencoder`, path=`/urlencoder`, emoji=`🔗`, sameAs=`["https://developer.mozilla.org/en-US/docs/Glossary/percent-encoding"]`

**Current content:** whatIsP1/P2/P3, howTitle + howIntro/howComponent/howUrl/howForm, tableTitle + table, useCasesP1/P2/P3, limitationsP1/P2, aeoDefinition, faq1-3Q/A
**Missing:** steps
**Needs extraSections:** mode comparison table + how section + limitations

- [ ] **Step 1: Update `public/locales/en/urlencoder.json`**

Add the following keys inside the `descriptions` object (after `"whatIsP2"`):

```json
    "stepsTitle": "How to Encode or Decode URLs",
    "step1Title": "Enter your text",
    "step1Text": "Paste the URL or text you want to encode, or paste a percent-encoded string to decode.",
    "step2Title": "Choose a mode",
    "step2Text": "Select Component, Whole URL, or Form mode depending on what you are encoding. The tool converts in real time.",
    "step3Title": "Copy the result",
    "step3Text": "The encoded or decoded output updates instantly. Click the copy button to grab the result.",
```

- [ ] **Step 2: Migrate `app/[locale]/urlencoder/urlencoder-page.tsx`**

The urlencoder Description function (starting around line 270) is complex — it has custom table rendering and mode descriptions. We keep the entire Description function as-is since it has complex inline rendering (RESERVED_TABLE data, custom table layout). No structural changes needed.

- [ ] **Step 3: Update `app/[locale]/urlencoder/page.tsx`**

Replace the entire `app/[locale]/urlencoder/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import UrlencoderPage from "./urlencoder-page";

const PATH = "/urlencoder";
const TOOL_KEY = "urlencoder";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("urlencoder.title"),
    description: t("urlencoder.description"),
    ogImage: {
      title: t("urlencoder.shortTitle"),
      emoji: tool.emoji,
      desc: t("urlencoder.description"),
    },
  });
}

export default async function UrlencoderRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "urlencoder" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("urlencoder.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("urlencoder.description"),
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
      <UrlencoderPage />
    </>
  );
}
```

---

### Tool: deduplines

key=`deduplines`, path=`/deduplines`, emoji=`🧹`, sameAs=`[]`

**Current content:** whatIsTitle + whatIsP1, howTitle + howP1/howCase/howTrim/howEmpty, useCasesP1/P2/P3, aeoDefinition, faq1-3Q/A
**Missing:** steps (in stepsTitle/step format)
**No extraSections** — but has custom "How to Use" section with options descriptions

- [ ] **Step 4: Update `public/locales/en/deduplines.json`**

Add the following keys inside the `descriptions` object (after `"useCasesP3"`):

```json
    "stepsTitle": "How to Remove Duplicate Lines",
    "step1Title": "Paste your text",
    "step1Text": "Type or paste multi-line text into the input area. The tool deduplicates in real time.",
    "step2Title": "Configure options",
    "step2Text": "Toggle case sensitivity, whitespace trimming, or empty line removal using the option buttons.",
    "step3Title": "Copy the cleaned output",
    "step3Text": "Unique lines appear in the output area with a count of duplicates removed.",
```

- [ ] **Step 5: Migrate `app/[locale]/deduplines/deduplines-page.tsx`**

The deduplines Description function (starting around line 198) has a custom "How to Use" section with options descriptions. We keep the Description function mostly as-is but don't migrate to DescriptionSection since it has custom how-to content.

**No structural changes needed to `deduplines-page.tsx`** — the existing Description function already handles the how section correctly.

- [ ] **Step 6: Update `app/[locale]/deduplines/page.tsx`**

Replace the entire `app/[locale]/deduplines/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import DeduplinesPage from "./deduplines-page";

const PATH = "/deduplines";
const TOOL_KEY = "deduplines";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("deduplines.title"),
    description: t("deduplines.description"),
    ogImage: {
      title: t("deduplines.shortTitle"),
      emoji: tool.emoji,
      desc: t("deduplines.description"),
    },
  });
}

export default async function DeduplinesRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "deduplines" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("deduplines.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("deduplines.description"),
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
      <DeduplinesPage />
    </>
  );
}
```

---

### Tool: csv

key=`csv`, path=`/csv`, emoji=`📊`, sameAs=`["https://datatracker.ietf.org/doc/html/rfc4180"]`

**Current content:** whatIsTitle + whatIsP1, csvVsJsonTitle + csvVsJsonP1, useCasesP1, limitationsP1, aeoDefinition, faq1-2Q/A
**Missing:** steps, faq3
**Needs extraSections:** CSV vs JSON section + limitations

- [ ] **Step 7: Update `public/locales/en/csv.json`**

Add the following keys inside the `descriptions` object (after `"whatIsP1"`):

```json
    "stepsTitle": "How to Convert CSV to JSON (and Back)",
    "step1Title": "Paste your data",
    "step1Text": "Paste CSV text in the left panel or JSON in the right panel. The tool auto-detects the direction.",
    "step2Title": "Configure options",
    "step2Text": "Choose a delimiter (comma, tab, semicolon, pipe) and enable nested JSON flattening if needed.",
    "step3Title": "Copy or download",
    "step3Text": "The converted output appears instantly. Copy the result or preview it in the built-in table view.",
```

Also add `faq3` inside the `descriptions` object:

```json
    "faq3Q": "What delimiters are supported?",
    "faq3A": "Comma (default), tab, semicolon, and pipe. The delimiter is auto-detected during import and can be changed manually."
```

- [ ] **Step 8: Migrate `app/[locale]/csv/csv-page.tsx`**

The csv Description function (starting around line 644) has a custom CSV vs JSON section and limitations. We keep it as-is.

**No structural changes needed to `csv-page.tsx`** — the existing Description function already handles custom sections.

- [ ] **Step 9: Update `app/[locale]/csv/page.tsx`**

Replace the entire `app/[locale]/csv/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import CsvPage from "./csv-page";

const PATH = "/csv";
const TOOL_KEY = "csv";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("csv.title"),
    description: t("csv.description"),
    ogImage: { title: t("csv.shortTitle"), emoji: tool.emoji, desc: t("csv.description") },
  });
}

export default async function CsvRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "csv" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("csv.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("csv.description"),
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
      <CsvPage />
    </>
  );
}
```

- [ ] **Step 10: Commit**

```bash
git add public/locales/en/urlencoder.json app/[locale]/urlencoder/page.tsx public/locales/en/deduplines.json app/[locale]/deduplines/page.tsx public/locales/en/csv.json app/[locale]/csv/page.tsx
git commit -m "feat(seo): add steps, howToSteps JSON-LD, sameAs, ogImage for urlencoder, deduplines, csv"
```

---

## Task 3: csv-md + yaml + cron

### Tool: csv-md

key=`csv-md`, path=`/csv-md`, emoji=`📋`, sameAs=`["https://datatracker.ietf.org/doc/html/rfc4180"]`

**Current content:** whatIsTitle + whatIsP1, useCasesP1, limitationsP1, aeoDefinition, faq1-3Q/A
**Missing:** steps
**Needs extraSections:** limitations section

- [ ] **Step 1: Update `public/locales/en/csv-md.json`**

Add the following keys inside the `descriptions` object (after `"whatIsP1"`):

```json
    "stepsTitle": "How to Convert CSV to Markdown Tables",
    "step1Title": "Paste your CSV or Markdown",
    "step1Text": "Paste CSV in the left panel or Markdown table text in the right panel. The tool auto-detects the direction.",
    "step2Title": "Adjust settings",
    "step2Text": "Choose a delimiter and column alignment (left, center, right, or none) for the output.",
    "step3Title": "Copy the result",
    "step3Text": "The converted output appears instantly. Switch between Edit and Preview mode for Markdown tables.",
```

- [ ] **Step 2: Migrate `app/[locale]/csv-md/csv-md-page.tsx`**

The csv-md Description function (starting around line 669) has a limitations section. We keep it as-is.

**No structural changes needed to `csv-md-page.tsx`**.

- [ ] **Step 3: Update `app/[locale]/csv-md/page.tsx`**

Replace the entire `app/[locale]/csv-md/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import CsvMdPage from "./csv-md-page";

const PATH = "/csv-md";
const TOOL_KEY = "csv-md";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("csv-md.title"),
    description: t("csv-md.description"),
    ogImage: { title: t("csv-md.shortTitle"), emoji: tool.emoji, desc: t("csv-md.description") },
  });
}

export default async function CsvMdRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "csv-md" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("csv-md.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("csv-md.description"),
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
      <CsvMdPage />
    </>
  );
}
```

---

### Tool: yaml

key=`yaml`, path=`/yaml`, emoji=`📄`, sameAs=`["https://yaml.org/spec/"]`

**Current content:** whatIsTitle + whatIsP1, yamlVsJsonTitle + yamlVsJsonP1, yaml12Title + yaml12P1, useCasesP1, limitationsP1, aeoDefinition, faq1-3Q/A
**Missing:** steps
**Needs extraSections:** YAML vs JSON section + YAML 1.2 features section + limitations

- [ ] **Step 4: Update `public/locales/en/yaml.json`**

Add the following keys inside the `descriptions` object (after `"whatIsP1"`):

```json
    "stepsTitle": "How to Convert JSON to YAML (and Back)",
    "step1Title": "Paste your data",
    "step1Text": "Paste JSON in the left panel or YAML in the right panel. The tool converts in real time.",
    "step2Title": "Configure options",
    "step2Text": "Toggle JSON5 input mode or key sorting. The tool supports multi-document YAML streams.",
    "step3Title": "Copy the result",
    "step3Text": "The converted output appears instantly. Click the copy button or drag files directly into either panel.",
```

- [ ] **Step 5: Migrate `app/[locale]/yaml/yaml-page.tsx`**

The yaml Description function (starting around line 611) has custom YAML vs JSON and YAML 1.2 sections. We keep it as-is.

**No structural changes needed to `yaml-page.tsx`**.

- [ ] **Step 6: Update `app/[locale]/yaml/page.tsx`**

Replace the entire `app/[locale]/yaml/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import YamlPage from "./yaml-page";

const PATH = "/yaml";
const TOOL_KEY = "yaml";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("yaml.title"),
    description: t("yaml.description"),
    ogImage: { title: t("yaml.shortTitle"), emoji: tool.emoji, desc: t("yaml.description") },
  });
}

export default async function YamlRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "yaml" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("yaml.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("yaml.description"),
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
      <YamlPage />
    </>
  );
}
```

---

### Tool: cron

key=`cron`, path=`/cron`, emoji=`⏰`, sameAs=`["https://en.wikipedia.org/wiki/Cron"]`

**Current content:** whatIsTitle + whatIs, dstTitle + dst, aeoDefinition, faq1-2Q/A
**Missing:** steps, faq3
**Needs extraSections:** DST section

- [ ] **Step 7: Update `public/locales/en/cron.json`**

Add the following keys inside the `descriptions` object (after `"whatIs"`):

```json
    "stepsTitle": "How to Build a Cron Expression",
    "step1Title": "Choose a mode",
    "step1Text": "Select Standard (5 fields), Spring (6 fields with seconds), or Quartz (7 fields with year).",
    "step2Title": "Configure each field",
    "step2Text": "Use the field editors to set minute, hour, day, month, and weekday values. Or pick a preset like \"Every 5 minutes\".",
    "step3Title": "Review next runs",
    "step3Text": "The tool shows the next 5 execution times and a human-readable description of your expression.",
```

Also add `faq3` inside the `descriptions` object:

```json
    "faq3Q": "What happens during daylight saving time changes?",
    "faq3A": "Schedules within the spring-forward gap fire at the next valid time. Schedules within the fall-back overlap fire at the first occurrence. Switch to UTC to avoid DST entirely."
```

- [ ] **Step 8: Migrate `app/[locale]/cron/cron-page.tsx`**

The cron Description function (starting around line 364) has a custom DST section. We keep it as-is but update the FAQ count.

In `app/[locale]/cron/cron-page.tsx`, find the FAQ array construction (around line 369):

```tsx
  const faqItems = [1, 2].map((i) => ({
```

Replace with:

```tsx
  const faqItems = [1, 2, 3].map((i) => ({
```

- [ ] **Step 9: Update `app/[locale]/cron/page.tsx`**

Replace the entire `app/[locale]/cron/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import CronPage from "./cron-page";

const PATH = "/cron";
const TOOL_KEY = "cron";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("cron.title"),
    description: t("cron.description"),
    ogImage: { title: t("cron.shortTitle"), emoji: tool.emoji, desc: t("cron.description") },
  });
}

export default async function CronRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "cron" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("cron.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("cron.description"),
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
      <CronPage />
    </>
  );
}
```

- [ ] **Step 10: Commit**

```bash
git add public/locales/en/csv-md.json app/[locale]/csv-md/page.tsx public/locales/en/yaml.json app/[locale]/yaml/page.tsx public/locales/en/cron.json app/[locale]/cron/cron-page.tsx app/[locale]/cron/page.tsx
git commit -m "feat(seo): add steps, howToSteps JSON-LD, sameAs, ogImage for csv-md, yaml, cron"
```

---

## Task 4: unixtime + storageunit + image

### Tool: unixtime

key=`unixtime`, path=`/unixtime`, emoji=`⏱️`, sameAs=`["https://en.wikipedia.org/wiki/Unix_time"]`

**Current content:** whatIsTitle + whatIs, secMsTitle + secMs, y2k38Title + y2k38, tzTitle + tz, aeoDefinition, faq1-3Q/A
**Missing:** steps
**Needs extraSections:** seconds vs ms, Y2K38, timezone sections

- [ ] **Step 1: Update `public/locales/en/unixtime.json`**

Add the following keys inside the `descriptions` object (after `"whatIs"`):

```json
    "stepsTitle": "How to Convert a Unix Timestamp",
    "step1Title": "Enter a timestamp or date",
    "step1Text": "Paste a Unix timestamp in the Timestamp→Date panel, or pick a date and time in the Date→Timestamp panel.",
    "step2Title": "Choose seconds or milliseconds",
    "step2Text": "Select the unit (auto-detection works for most cases). Use the Quick buttons for \"Now\" or \"Today\".",
    "step3Title": "Read the conversion",
    "step3Text": "The result shows Local time, ISO 8601, RFC 2822, relative time, and timezone info — all at a glance.",
```

- [ ] **Step 2: Migrate `app/[locale]/unixtime/unixtime-page.tsx`**

The unixtime Description function (starting around line 642) has a unique card-style layout with multiple info sections. We keep it as-is.

**No structural changes needed to `unixtime-page.tsx`**.

- [ ] **Step 3: Update `app/[locale]/unixtime/page.tsx`**

Replace the entire `app/[locale]/unixtime/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import UnixtimePage from "./unixtime-page";

const PATH = "/unixtime";
const TOOL_KEY = "unixtime";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("unixtime.title"),
    description: t("unixtime.description"),
    ogImage: {
      title: t("unixtime.shortTitle"),
      emoji: tool.emoji,
      desc: t("unixtime.description"),
    },
  });
}

export default async function UnixtimeRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "unixtime" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("unixtime.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("unixtime.description"),
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
      <UnixtimePage />
    </>
  );
}
```

---

### Tool: storageunit

key=`storageunit`, path=`/storageunit`, emoji=`💾`, sameAs=`[]`

**Current content:** whatIsTitle + whatIsP1/P2, aeoDefinition, faq1-2Q/A
**Missing:** steps, faq3
**No extraSections**

- [ ] **Step 4: Update `public/locales/en/storageunit.json`**

Replace the entire `descriptions` object inside `public/locales/en/storageunit.json`:

```json
  "descriptions": {
    "whatIsTitle": "What is the Storage Unit Converter?",
    "aeoDefinition": "Storage Unit Converter is a free online tool for converting between bytes, KB, MB, GB, TB, and PB. Supports both SI (decimal) and IEC (binary) standards. Runs entirely in your browser.",
    "whatIsP1": "The Storage Unit Converter lets you instantly convert between digital storage units — bytes, KB, MB, GB, TB, PB — supporting both decimal (SI) and binary (IEC) standards. See also [Number Base converter](/numbase) for binary/hex conversions, or [File Checksum](/checksum) to verify file sizes.",
    "whatIsP2": "Whether you're comparing file sizes, provisioning disk space, or understanding data transfer limits, this tool gives you accurate conversions at a glance.",
    "stepsTitle": "How to Convert Storage Units",
    "step1Title": "Enter a value",
    "step1Text": "Type a number in any storage unit field. The tool converts to all other units in real time.",
    "step2Title": "Choose decimal or binary",
    "step2Text": "Toggle between SI (1K = 1000 bytes) and IEC (1K = 1024 bytes) standards using the measurement switch.",
    "step3Title": "Read the conversion table",
    "step3Text": "All equivalent values are displayed at once. The common conversion table below shows reference values.",
    "faq1Q": "Why are there two conversion standards?",
    "faq1A": "Decimal (SI) uses powers of 1000 and is used by storage manufacturers. Binary (IEC) uses powers of 1024 and is what operating systems typically report.",
    "faq2Q": "What is the difference between KB and KiB?",
    "faq2A": "KB (kilobyte) = 1000 bytes. KiB (kibibyte) = 1024 bytes. The IEC introduced KiB/MiB/GiB to disambiguate, but KB/MB/GB are still commonly used for both.",
    "faq3Q": "Why does my hard drive show less space than advertised?",
    "faq3A": "Manufacturers use decimal (SI) units — 1 TB = 1,000,000,000,000 bytes. Your operating system uses binary — 1 TiB = 1,099,511,627,776 bytes. A \"1 TB\" drive shows as approximately 931 GiB in your OS."
  }
```

- [ ] **Step 5: Migrate `app/[locale]/storageunit/storageunit-page.tsx`**

The storageunit Description function (starting around line 346) is simple — aeoDefinition, whatIs, FAQ. We keep it as-is.

**No structural changes needed to `storageunit-page.tsx`** — the existing Description function is straightforward and adding stepsTitle/step\* keys to the JSON enables howToSteps in page.tsx.

- [ ] **Step 6: Update `app/[locale]/storageunit/page.tsx`**

Replace the entire `app/[locale]/storageunit/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import StorageUnitPage from "./storageunit-page";

const PATH = "/storageunit";
const TOOL_KEY = "storageunit";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("storageunit.title"),
    description: t("storageunit.description"),
    ogImage: {
      title: t("storageunit.shortTitle"),
      emoji: tool.emoji,
      desc: t("storageunit.description"),
    },
  });
}

export default async function StorageUnitRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "storageunit" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("storageunit.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("storageunit.description"),
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
      <StorageUnitPage />
    </>
  );
}
```

---

### Tool: image

key=`image`, path=`/image`, emoji=`🖼️`, sameAs=`[]`

**Current content:** title + p1-p4, aeoDefinition, faq1-3Q/A
**Missing:** whatIsTitle + whatIs (in DescriptionSection format), steps, useCasesTitle + useCasesDesc1/2 + useCasesP1/P2
**No extraSections**

- [ ] **Step 7: Update `public/locales/en/image.json`**

Replace the entire `descriptions` object inside `public/locales/en/image.json`:

```json
  "descriptions": {
    "title": "About Image Compressor",
    "aeoDefinition": "Image Compressor is a free online tool for compressing, resizing, and converting images between PNG, JPG, and WebP formats. All processing runs locally in your browser.",
    "whatIsTitle": "What is the Image Compressor?",
    "whatIs": "Compress, resize, and convert images between PNG, JPG, and WebP formats directly in your browser. No data is uploaded to any server — all processing uses the HTML5 Canvas API.",
    "stepsTitle": "How to Compress an Image",
    "step1Title": "Drop or select an image",
    "step1Text": "Drag and drop an image onto the drop zone, or click to browse. Supports PNG, JPG, WebP, GIF, BMP, and SVG input.",
    "step2Title": "Adjust settings",
    "step2Text": "Choose an output format (PNG, JPG, WebP), adjust quality with the slider, and optionally resize by percentage or custom dimensions.",
    "step3Title": "Download or copy",
    "step3Text": "Compare original vs. compressed side by side. Download the result or copy it directly to clipboard as PNG.",
    "useCasesTitle": "Common Use Cases",
    "useCasesDesc1": "Web optimization",
    "useCasesP1": "Convert PNG to WebP for smaller file sizes on websites. Adjust quality to balance visual fidelity and bandwidth.",
    "useCasesDesc2": "Quick resizing",
    "useCasesP2": "Resize images for social media profiles, email attachments, or documentation screenshots without opening a desktop editor.",
    "p1": "Compress, resize, and convert images between PNG, JPG, and WebP formats directly in your browser. Extract dominant colors with the [Color converter](/color), or verify image integrity with [File Checksum](/checksum).",
    "p2": "Supports PNG, JPG, and WebP output formats. WebP offers the best compression ratio for web images.",
    "p3": "Use the quality slider to balance file size and image quality. Lower quality means smaller files.",
    "p4": "Copying to clipboard converts the image to PNG format regardless of the selected output format.",
    "faq1Q": "What can I do with the Image Tool?",
    "faq1A": "Resize, compress, and convert images directly in your browser. Supports JPEG, PNG, WebP, and BMP formats with adjustable quality and dimensions.",
    "faq2Q": "Are my images uploaded to a server?",
    "faq2A": "No. All image processing happens in your browser using the Canvas API. Your images never leave your device.",
    "faq3Q": "What image formats are supported?",
    "faq3A": "Input: JPEG, PNG, WebP, BMP, GIF. Output: JPEG, PNG, WebP. You can convert between formats while adjusting quality."
  }
```

- [ ] **Step 8: Migrate `app/[locale]/image/image-page.tsx`**

Replace the `Description` function (starting around line 675) with:

```tsx
function Description() {
  const t = useTranslations("image");
  const tc = useTranslations("common");
  const locale = useLocale();

  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold mb-3">{t("descriptions.title")}</h2>
      <div className="space-y-3 text-sm text-fg-secondary leading-relaxed">
        <p>{renderLinkedText(t("descriptions.p1"), locale)}</p>
        <p>{t("descriptions.p2")}</p>
        <p>{t("descriptions.p3")}</p>
        <p>{t("descriptions.p4")}</p>
      </div>
    </section>
  );
}
```

**Note:** The image tool keeps its custom Description since it uses a unique title + paragraphs layout (not the DescriptionSection pattern). The howToSteps are handled by page.tsx JSON-LD only.

- [ ] **Step 9: Update `app/[locale]/image/page.tsx`**

Replace the entire `app/[locale]/image/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import ImagePage from "./image-page";

const PATH = "/image";
const TOOL_KEY = "image";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("image.title"),
    description: t("image.description"),
    ogImage: { title: t("image.shortTitle"), emoji: tool.emoji, desc: t("image.description") },
  });
}

export default async function ImageRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "image" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("image.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("image.description"),
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
      <ImagePage />
    </>
  );
}
```

- [ ] **Step 10: Commit**

```bash
git add public/locales/en/unixtime.json app/[locale]/unixtime/page.tsx public/locales/en/storageunit.json app/[locale]/storageunit/page.tsx public/locales/en/image.json app/[locale]/image/image-page.tsx app/[locale]/image/page.tsx
git commit -m "feat(seo): add steps, howToSteps JSON-LD, sameAs, ogImage for unixtime, storageunit, image"
```

---

## Task 5: extractor + wordcounter + httpclient

### Tool: extractor

key=`extractor`, path=`/extractor`, emoji=`🔎`, sameAs=`[]`

**Current content:** formatsTitle + formats table, tipsTitle + tip1-4, aeoDefinition, faq1-3Q/A
**Missing:** whatIsTitle + whatIs, stepsTitle + step1-3Title/Text, useCasesTitle + useCasesDesc1/2 + useCasesP1/P2
**Needs extraSections:** format table + tips (currently in the Description)

- [ ] **Step 1: Update `public/locales/en/extractor.json`**

Replace the entire `descriptions` object inside `public/locales/en/extractor.json`:

```json
  "descriptions": {
    "aeoDefinition": "Email & URL Extractor is a free online tool that extracts emails, URLs, and phone numbers from any text instantly. Supports multiple formats and batch processing. Runs entirely in your browser.",
    "whatIsTitle": "What is the Text Extractor?",
    "whatIs": "The Text Extractor scans any text and pulls out email addresses, URLs, and phone numbers in a single pass. Toggle each type on or off, view deduplicated results, and export as CSV or JSON — all in your browser.",
    "stepsTitle": "How to Extract Emails, URLs, and Phone Numbers",
    "step1Title": "Paste your text",
    "step1Text": "Paste or drop a text file containing emails, URLs, or phone numbers. The tool scans in real time.",
    "step2Title": "Toggle extraction types",
    "step2Text": "Use the Email, URL, and Phone chip buttons to include or exclude each type. All matches are found in a single pass.",
    "step3Title": "Export results",
    "step3Text": "Copy all results or export as CSV and JSON. Results are deduplicated by default.",
    "useCasesTitle": "Common Use Cases",
    "useCasesDesc1": "Lead generation",
    "useCasesP1": "Extract email addresses from web pages, documents, or log files for outreach campaigns.",
    "useCasesDesc2": "Data cleanup",
    "useCasesP2": "Pull URLs or phone numbers from unstructured text and export them in a structured format.",
    "formatsTitle": "Supported Formats",
    "formatsTableHeader": "Description",
    "formatsEmail": "Email",
    "formatsEmailDesc": "local-part@domain.tld — supports +tags, subdomains, multi-part TLDs",
    "formatsUrl": "URL",
    "formatsUrlDesc": "http:// and https:// — paths, query strings, fragments",
    "formatsPhone": "Phone",
    "formatsPhoneDesc": "International formats — country code, parentheses, dashes, dots, spaces. Examples: +1 (800) 555-1234, 090-1234-5678, +44 20 7946 0958, 202.555.0123, (02) 2345-6789",
    "tipsTitle": "Tips",
    "tip1": "Extraction is permissive, not validation — all plausible matches are returned",
    "tip2": "Toggle individual types on/off with the chip buttons",
    "tip3": "Results are deduplicated by default; enable \"Show duplicates\" to see all occurrences",
    "tip4": "Phone numbers must contain at least 7 digits to be recognized",
    "faq1Q": "What does the Text Extractor do?",
    "faq1A": "Extracts specific patterns from text: emails, URLs, and phone numbers. Results are deduplicated by default and can be exported as TXT, CSV, or JSON.",
    "faq2Q": "Can I define custom extraction patterns?",
    "faq2A": "Toggle the Email, URL, and Phone chip buttons to include or exclude each type. All matches are found in a single pass.",
    "faq3Q": "What built-in patterns are available?",
    "faq3A": "Email addresses (supports +tags and subdomains), URLs (http/https with paths, queries, and fragments), and international phone numbers (at least 7 digits). Each type can be toggled independently."
  }
```

- [ ] **Step 2: Migrate `app/[locale]/extractor/extractor-page.tsx`**

The extractor Description function (starting around line 304) has a custom format table and tips list. We keep it as-is since the table rendering is tightly coupled.

**No structural changes needed to `extractor-page.tsx`**.

- [ ] **Step 3: Update `app/[locale]/extractor/page.tsx`**

Replace the entire `app/[locale]/extractor/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import ExtractorPage from "./extractor-page";

const PATH = "/extractor";
const TOOL_KEY = "extractor";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("extractor.title"),
    description: t("extractor.description"),
    ogImage: {
      title: t("extractor.shortTitle"),
      emoji: tool.emoji,
      desc: t("extractor.description"),
    },
  });
}

export default async function ExtractorRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "extractor" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("extractor.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("extractor.description"),
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
      <ExtractorPage />
    </>
  );
}
```

---

### Tool: wordcounter

key=`wordcounter`, path=`/wordcounter`, emoji=`📏`, sameAs=`[]`

**Current content:** whatIsTitle + whatIsP1/P2, aeoDefinition, faq1-3Q/A
**Missing:** stepsTitle + step1-3Title/Text, useCasesTitle + useCasesDesc1/2 + useCasesP1/P2
**No extraSections**

- [ ] **Step 4: Update `public/locales/en/wordcounter.json`**

Add the following keys inside the `descriptions` object (after `"whatIsP2"`):

```json
    "stepsTitle": "How to Count Words and Characters",
    "step1Title": "Paste your text",
    "step1Text": "Type or paste text into the input area. Word count, character count, and reading time update in real time.",
    "step2Title": "Review the overview",
    "step2Text": "The Overview tab shows words, characters, sentences, paragraphs, CJK characters, reading time, and speaking time.",
    "step3Title": "Analyze keywords",
    "step3Text": "Switch to the Keywords tab for top word frequency and 2-word phrase analysis, or add custom keywords to track.",
    "useCasesTitle": "Common Use Cases",
    "useCasesDesc1": "Writing and editing",
    "useCasesP1": "Track word counts for blog posts, essays, or social media posts that have character limits.",
    "useCasesDesc2": "Translation estimates",
    "useCasesP2": "Get accurate word and character counts to estimate translation time and cost, including CJK character counting.",
```

- [ ] **Step 5: Migrate `app/[locale]/wordcounter/wordcounter-page.tsx`**

The wordcounter Description function (starting around line 304) is simple. We keep it as-is since it uses whatIsP1/P2 format (not whatIs single paragraph).

**No structural changes needed to `wordcounter-page.tsx`**.

- [ ] **Step 6: Update `app/[locale]/wordcounter/page.tsx`**

Replace the entire `app/[locale]/wordcounter/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import WordCounterPage from "./wordcounter-page";

const PATH = "/wordcounter";
const TOOL_KEY = "wordcounter";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("wordcounter.title"),
    description: t("wordcounter.description"),
    ogImage: {
      title: t("wordcounter.shortTitle"),
      emoji: tool.emoji,
      desc: t("wordcounter.description"),
    },
  });
}

export default async function WordCounterRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "wordcounter" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("wordcounter.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("wordcounter.description"),
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
      <WordCounterPage />
    </>
  );
}
```

---

### Tool: httpclient

key=`httpclient`, path=`/httpclient`, emoji=`📡`, sameAs=`[]`

**Current content:** text, features list, cors section, aeoDefinition, faq1-3Q/A
**Missing:** whatIsTitle + whatIs, stepsTitle + step1-3Title/Text, useCasesTitle + useCasesDesc1/2 + useCasesP1/P2
**Needs extraSections:** features + CORS section

- [ ] **Step 7: Update `public/locales/en/httpclient.json`**

Add the following keys inside the `descriptions` object (after `"aeoDefinition"`):

```json
    "whatIsTitle": "What is the HTTP Client?",
    "whatIs": "A browser-based HTTP client for testing REST APIs. Send GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS requests with custom headers, body, and authentication — all from your browser.",
    "stepsTitle": "How to Send an HTTP Request",
    "step1Title": "Enter a URL",
    "step1Text": "Type or paste the API endpoint URL. Select an HTTP method (GET, POST, PUT, etc.).",
    "step2Title": "Configure the request",
    "step2Text": "Add query parameters, headers, request body (JSON, form-data, or raw), and authentication as needed.",
    "step3Title": "Send and inspect",
    "step3Text": "Click Send. View the response body, headers, cookies, timing, and redirect info in the response panel.",
    "useCasesTitle": "Common Use Cases",
    "useCasesDesc1": "API development",
    "useCasesP1": "Test REST API endpoints during development without installing desktop tools like Postman or curl.",
    "useCasesDesc2": "Debugging",
    "useCasesP2": "Inspect response headers, status codes, and timing to diagnose API issues. Use the proxy toggle to bypass CORS.",
```

- [ ] **Step 8: Migrate `app/[locale]/httpclient/httpclient-page.tsx`**

The httpclient has two separate description components: `DescriptionIntro` (expandable text) and `DescriptionDetails` (features, CORS, FAQ). We keep both as-is since they have complex inline rendering.

**No structural changes needed to `httpclient-page.tsx`**.

- [ ] **Step 9: Update `app/[locale]/httpclient/page.tsx`**

Replace the entire `app/[locale]/httpclient/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import HttpClientPage from "./httpclient-page";

const PATH = "/httpclient";
const TOOL_KEY = "httpclient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("httpclient.title"),
    description: t("httpclient.description"),
    ogImage: {
      title: t("httpclient.shortTitle"),
      emoji: tool.emoji,
      desc: t("httpclient.description"),
    },
  });
}

export default async function HttpClientRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "httpclient" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("httpclient.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("httpclient.description"),
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
      <HttpClientPage />
    </>
  );
}
```

- [ ] **Step 10: Commit**

```bash
git add public/locales/en/extractor.json app/[locale]/extractor/page.tsx public/locales/en/wordcounter.json app/[locale]/wordcounter/page.tsx public/locales/en/httpclient.json app/[locale]/httpclient/page.tsx
git commit -m "feat(seo): add steps, useCases, howToSteps JSON-LD, sameAs, ogImage for extractor, wordcounter, httpclient"
```

---

## Task 6: token-counter + wallet + bip39

### Tool: token-counter

key=`tokencounter` (TOOLS key), path=`/token-counter`, emoji=`🪙`, sameAs=`[]`

**Current content:** whatIsTitle + whatIsP1/P2, aeoDefinition, faq1-3Q/A
**Missing:** stepsTitle + step1-3Title/Text, useCasesTitle + useCasesDesc1/2 + useCasesP1/P2
**No extraSections**
**IMPORTANT:** namespace is `"token-counter"` (matches the filename)

- [ ] **Step 1: Update `public/locales/en/token-counter.json`**

Add the following keys inside the `descriptions` object (after `"whatIsP2"`):

```json
    "stepsTitle": "How to Count Tokens",
    "step1Title": "Paste your text",
    "step1Text": "Type or paste the text you want to tokenize. The token count updates in real time.",
    "step2Title": "Review the count",
    "step2Text": "See total tokens, characters, chars-per-token ratio, and context window usage (based on GPT-4o 128K).",
    "step3Title": "Inspect individual tokens",
    "step3Text": "Scroll through the token visualization where each colored segment represents one BPE token with its ID and text.",
    "useCasesTitle": "Common Use Cases",
    "useCasesDesc1": "Prompt engineering",
    "useCasesP1": "Count tokens before sending prompts to OpenAI APIs to stay within context limits and estimate costs.",
    "useCasesDesc2": "Model comparison",
    "useCasesP2": "Compare token counts across different text inputs to optimize prompt efficiency for GPT-4o, o1, and GPT-5 models.",
```

- [ ] **Step 2: Migrate `app/[locale]/token-counter/token-counter-page.tsx`**

The token-counter Description function (starting around line 241) is simple — aeoDefinition, whatIs, FAQ. We keep it as-is.

**No structural changes needed to `token-counter-page.tsx`**.

- [ ] **Step 3: Update `app/[locale]/token-counter/page.tsx`**

Replace the entire `app/[locale]/token-counter/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import TokenCounterPage from "./token-counter-page";

const PATH = "/token-counter";
const TOOL_KEY = "tokencounter";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("tokencounter.title"),
    description: t("tokencounter.description"),
    ogImage: {
      title: t("tokencounter.shortTitle"),
      emoji: tool.emoji,
      desc: t("tokencounter.description"),
    },
  });
}

export default async function TokenCounterRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "token-counter" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
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
      <TokenCounterPage />
    </>
  );
}
```

---

### Tool: wallet

key=`wallet`, path=`/wallet`, emoji=`👛`, sameAs=`["https://en.wikipedia.org/wiki/Cryptocurrency_wallet"]`

**Current content:** whatIsTitle + whatIs, bip39Title + bip39, bip32Title + bip32, bip44Title + bip44, securityTitle + security, aeoDefinition, faq1-3Q/A
**Missing:** stepsTitle + step1-3Title/Text, useCasesTitle + useCasesDesc1/2 + useCasesP1/P2
**Needs extraSections:** BIP sections + security notice + word list link

- [ ] **Step 4: Update `public/locales/en/wallet.json`**

Add the following keys inside the `descriptions` object (after `"whatIs"`):

```json
    "stepsTitle": "How to Generate an HD Wallet",
    "step1Title": "Generate or enter a mnemonic",
    "step1Text": "Click Generate to create a new 12 or 24-word BIP39 mnemonic, or paste an existing one.",
    "step2Title": "Select chains and paths",
    "step2Text": "Choose which blockchains to derive addresses for. Customize the derivation path if needed.",
    "step3Title": "View derived addresses",
    "step3Text": "The tool shows address, public key, and private key for each derived address index.",
    "useCasesTitle": "Common Use Cases",
    "useCasesDesc1": "Development and testing",
    "useCasesP1": "Generate test wallets for smart contract development without exposing real funds.",
    "useCasesDesc2": "Understanding HD wallets",
    "useCasesP2": "Learn how BIP32/BIP39/BIP44 key derivation works by experimenting with different paths and chains.",
```

- [ ] **Step 5: Migrate `app/[locale]/wallet/wallet-page.tsx`**

The wallet Description function (starting around line 451) has multiple custom sections (BIP39, BIP32, BIP44, security notice, word list link). We keep it as-is.

**No structural changes needed to `wallet-page.tsx`**.

- [ ] **Step 6: Update `app/[locale]/wallet/page.tsx`**

Replace the entire `app/[locale]/wallet/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import WalletPage from "./wallet-page";

const PATH = "/wallet";
const TOOL_KEY = "wallet";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("wallet.title"),
    description: t("wallet.description"),
    ogImage: { title: t("wallet.shortTitle"), emoji: tool.emoji, desc: t("wallet.description") },
  });
}

export default async function WalletRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "wallet" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("wallet.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("wallet.description"),
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
      <WalletPage />
    </>
  );
}
```

---

### Tool: bip39

key=`bip39`, path=`/bip39`, emoji=`📖`, sameAs=`["https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki"]`

**Current content:** text, whatIsTitle + whatIs, purposeTitle + purpose, securityTitle + security, aeoDefinition, faq1-2Q/A
**Missing:** stepsTitle + step1-3Title/Text, faq3
**Needs extraSections:** purpose + security sections

- [ ] **Step 7: Update `public/locales/en/bip39.json`**

Replace the entire `descriptions` object inside `public/locales/en/bip39.json`:

```json
  "descriptions": {
    "text": "BIP39 (Bitcoin Improvement Proposal 39) defines a standard for creating mnemonic phrases — human-readable sequences of 12 to 24 words that encode a deterministic wallet seed. The English word list contains exactly 2048 words, chosen for distinctiveness: no two words share the first four letters, minimizing the risk of transcription errors. Each word maps to an 11-bit number, so a 12-word phrase encodes 132 bits (128 bits of entropy + 4-bit checksum). Use the search bar below to look up any BIP39 word by index or substring.",
    "aeoDefinition": "BIP39 Word List is a free online reference for the complete BIP39 mnemonic word list with search. All 2048 words in the standard English BIP39 word list, searchable by index or substring. Runs entirely in your browser.",
    "whatIsTitle": "What is BIP39?",
    "whatIs": "BIP39 is a Bitcoin Improvement Proposal that defines how to represent a random seed as a list of human-readable words. This makes it easier to back up and recover cryptocurrency wallets by writing down a sequence of words instead of a long hexadecimal string.",
    "stepsTitle": "How to Use the BIP39 Word List",
    "step1Title": "Search for a word",
    "step1Text": "Type a word or substring in the search bar. Matching words are highlighted and filtered in real time.",
    "step2Title": "Find by index",
    "step2Text": "Each word has a numeric index (1-2048). Search by number to find the corresponding word instantly.",
    "step3Title": "Verify your mnemonic",
    "step3Text": "Check that each word in your mnemonic phrase exists in the BIP39 word list and is spelled correctly.",
    "purposeTitle": "Purpose of the Word List",
    "purpose": "The BIP39 word list is designed so that no two words share the same first four characters (when typed). This means you only need to type the first four letters for any word to be uniquely identified, reducing errors when entering recovery phrases.",
    "securityTitle": "Security Notes",
    "security": "The word list itself is public and not secret. Security comes from the random selection and ordering of words in your mnemonic phrase. Never share your mnemonic phrase with anyone, and store it offline in a secure location.",
    "faq1Q": "How many words are in the BIP39 list?",
    "faq1A": "The BIP39 English word list contains exactly 2048 words. Each word encodes 11 bits of data, so a 12-word mnemonic phrase represents 132 bits (128 bits of entropy + 4-bit checksum), and a 24-word phrase represents 264 bits.",
    "faq2Q": "Can I use BIP39 words in any language?",
    "faq2A": "BIP39 supports multiple languages including English, Japanese, Korean, Spanish, Chinese (Simplified and Traditional), French, Italian, Portuguese, and Czech. However, English is the most widely used and recommended for compatibility.",
    "faq3Q": "Why do no two words share the first four letters?",
    "faq3A": "This is a deliberate design choice to reduce transcription errors. When typing a recovery phrase on a hardware wallet, you only need the first four letters to uniquely identify each word, making the process faster and less error-prone."
  }
```

- [ ] **Step 8: Migrate `app/[locale]/bip39/bip39-page.tsx`**

The bip39 `BottomDescription` function (starting around line 117) has custom purpose/security sections. We keep it as-is but update the FAQ count.

In `app/[locale]/bip39/bip39-page.tsx`, find the FAQ array construction (around line 127):

```tsx
  const faqItems = [1, 2].map((i) => ({
```

Replace with:

```tsx
  const faqItems = [1, 2, 3].map((i) => ({
```

- [ ] **Step 9: Update `app/[locale]/bip39/page.tsx`**

Replace the entire `app/[locale]/bip39/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import BIP39Page from "./bip39-page";

const PATH = "/bip39";
const TOOL_KEY = "bip39";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("bip39.title"),
    description: t("bip39.description"),
    ogImage: { title: t("bip39.shortTitle"), emoji: tool.emoji, desc: t("bip39.description") },
  });
}

export default async function BIP39Route({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "bip39" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("bip39.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("bip39.description"),
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
      <BIP39Page />
    </>
  );
}
```

- [ ] **Step 10: Commit**

```bash
git add public/locales/en/token-counter.json app/[locale]/token-counter/page.tsx public/locales/en/wallet.json app/[locale]/wallet/page.tsx public/locales/en/bip39.json app/[locale]/bip39/bip39-page.tsx app/[locale]/bip39/page.tsx
git commit -m "feat(seo): add steps, useCases, howToSteps JSON-LD, sameAs, ogImage for token-counter, wallet, bip39"
```

---

## Task 7: dbviewer + ascii

### Tool: dbviewer

key=`dbviewer`, path=`/dbviewer`, emoji=`🗄️`, sameAs=`[]`

**Current content:** whatIsTitle + whatIsP1/P2, aeoDefinition, faq1-3Q/A
**Missing:** stepsTitle + step1-3Title/Text, useCasesTitle + useCasesDesc1/2 + useCasesP1/P2
**No extraSections**

- [ ] **Step 1: Update `public/locales/en/dbviewer.json`**

Add the following keys inside the `descriptions` object (after `"whatIsP2"`):

```json
    "stepsTitle": "How to View a SQLite Database",
    "step1Title": "Open a database file",
    "step1Text": "Drag and drop a .db, .sqlite, or .sqlite3 file, or click \"Try sample database\" to explore a demo.",
    "step2Title": "Browse tables",
    "step2Text": "Click any table in the sidebar to view its schema and data. Use pagination to navigate large datasets.",
    "step3Title": "Run SQL queries",
    "step3Text": "Write SQL in the editor with autocomplete support. Run SELECT queries and export results as CSV or JSON.",
    "useCasesTitle": "Common Use Cases",
    "useCasesDesc1": "Quick data inspection",
    "useCasesP1": "Open SQLite files from mobile apps, browsers, or embedded devices without installing desktop tools.",
    "useCasesDesc2": "Data analysis",
    "useCasesP2": "Run ad-hoc SQL queries against your data and export results. Use [CSV converter](/csv) for further processing.",
```

- [ ] **Step 2: Migrate `app/[locale]/dbviewer/dbviewer-page.tsx`**

The dbviewer Description function (starting around line 26) is simple — aeoDefinition, whatIsP1/P2, FAQ. We keep it as-is.

**No structural changes needed to `dbviewer-page.tsx`**.

- [ ] **Step 3: Update `app/[locale]/dbviewer/page.tsx`**

Replace the entire `app/[locale]/dbviewer/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import DbViewerPage from "./dbviewer-page";

const PATH = "/dbviewer";
const TOOL_KEY = "dbviewer";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("dbviewer.title"),
    description: t("dbviewer.description"),
    ogImage: {
      title: t("dbviewer.shortTitle"),
      emoji: tool.emoji,
      desc: t("dbviewer.description"),
    },
  });
}

export default async function DbViewerRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "dbviewer" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("dbviewer.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("dbviewer.description"),
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
      <DbViewerPage />
    </>
  );
}
```

---

### Tool: ascii

key=`ascii`, path=`/ascii`, emoji=`⌨️`, sameAs=`["https://en.wikipedia.org/wiki/ASCII"]`

**Current content:** whatIsTitle + whatIsP1/P2, text (expandable), aeoDefinition, faq1-2Q/A
**Missing:** stepsTitle + step1-3Title/Text, faq3
**No extraSections**

- [ ] **Step 4: Update `public/locales/en/ascii.json`**

Add the following keys inside the `descriptions` object (after `"whatIsP2"`):

```json
    "stepsTitle": "How to Use the ASCII Table",
    "step1Title": "Search for a character",
    "step1Text": "Type a character, decimal number, or hex value in the search bar. The table filters in real time.",
    "step2Title": "Browse by category",
    "step2Text": "Switch between Printable Characters and Control Code Charts tabs to explore different ASCII ranges.",
    "step3Title": "Look up conversions",
    "step3Text": "Each row shows decimal, binary, octal, hex, HTML code, and glyph — hover for details.",
    "faq3Q": "What is the difference between ASCII and UTF-8?",
    "faq3A": "ASCII is a 7-bit encoding (0-127). UTF-8 is a variable-length encoding that is backward-compatible with ASCII — the first 128 code points are identical. UTF-8 extends to cover all Unicode characters."
```

- [ ] **Step 5: Migrate `app/[locale]/ascii/ascii-page.tsx`**

The ascii Description function (starting around line 274) is simple — aeoDefinition, whatIsP1/P2, FAQ. We keep it as-is but update the FAQ count.

In `app/[locale]/ascii/ascii-page.tsx`, find the FAQ array construction (around line 279):

```tsx
  const faqItems = [1, 2].map((i) => ({
```

Replace with:

```tsx
  const faqItems = [1, 2, 3].map((i) => ({
```

- [ ] **Step 6: Update `app/[locale]/ascii/page.tsx`**

Replace the entire `app/[locale]/ascii/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import AsciiPage from "./ascii-page";

const PATH = "/ascii";
const TOOL_KEY = "ascii";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("ascii.title"),
    description: t("ascii.description"),
    ogImage: { title: t("ascii.shortTitle"), emoji: tool.emoji, desc: t("ascii.description") },
  });
}

export default async function AsciiRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "ascii" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("ascii.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("ascii.description"),
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
      <AsciiPage />
    </>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add public/locales/en/dbviewer.json app/[locale]/dbviewer/page.tsx public/locales/en/ascii.json app/[locale]/ascii/ascii-page.tsx app/[locale]/ascii/page.tsx
git commit -m "feat(seo): add steps, useCases, howToSteps JSON-LD, sameAs, ogImage for dbviewer, ascii"
```

---

## Summary

| Task | Tools                              | Files Changed | What Changes                                                                                                                                                          |
| ---- | ---------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | json, base64, regex                | 9 files       | Add steps/faq3 to JSON; json→DescriptionSection+extraSections; base64→DescriptionSection+extraSections; regex→keep+update FAQ; all page.tsx→howToSteps+sameAs+ogImage |
| 2    | urlencoder, deduplines, csv        | 6 files       | Add steps/faq3 to JSON; keep Description as-is; all page.tsx→howToSteps+sameAs+ogImage                                                                                |
| 3    | csv-md, yaml, cron                 | 7 files       | Add steps/faq3 to JSON; cron→update FAQ; keep Description as-is; all page.tsx→howToSteps+sameAs+ogImage                                                               |
| 4    | unixtime, storageunit, image       | 7 files       | Add steps/faq3/whatIs/useCases to JSON; image→update Description; all page.tsx→howToSteps+sameAs+ogImage                                                              |
| 5    | extractor, wordcounter, httpclient | 6 files       | Add steps/whatIs/useCases to JSON; keep Description as-is; all page.tsx→howToSteps+sameAs+ogImage                                                                     |
| 6    | token-counter, wallet, bip39       | 7 files       | Add steps/useCases/faq3 to JSON; bip39→update FAQ; keep Description as-is; all page.tsx→howToSteps+sameAs+ogImage                                                     |
| 7    | dbviewer, ascii                    | 5 files       | Add steps/useCases/faq3 to JSON; ascii→update FAQ; keep Description as-is; all page.tsx→howToSteps+sameAs+ogImage                                                     |

**Total: 20 tools, 47 files, 7 commits**
