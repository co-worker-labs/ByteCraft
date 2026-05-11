# SEO Content Migration — Plan 4 of 6

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add complete SEO content (useCases, howToSteps, whatIs, FAQs) and migrate all 9 tools to use the shared `DescriptionSection` component, with `howToSteps`/`sameAs`/`ogImage` in route files.

**Architecture:** For each tool: (1) update `public/locales/en/{tool}.json` descriptions section, (2) replace hand-written `Description` function in `*-page.tsx` with `<DescriptionSection namespace="tool" />`, (3) update `page.tsx` to extract `howToSteps`, pass `sameAs` and `ogImage`. Tools with custom sections use the `extraSections` prop.

**Tech Stack:** Next.js 16 App Router, TypeScript, next-intl, DescriptionSection (from Plan 1), buildToolSchemas (Plan 1), generatePageMeta with ogImage (Plan 2), TOOLS with emoji/sameAs (Plan 1)

---

## Prerequisites (from Plans 1–3)

These must be merged before starting:

| Prerequisite                           | Plan          | File                                 |
| -------------------------------------- | ------------- | ------------------------------------ |
| `ToolEntry.emoji` + `ToolEntry.sameAs` | Plan 1 Task 1 | `libs/tools.ts`                      |
| `buildToolSchemas` accepts `sameAs`    | Plan 1 Task 2 | `components/json-ld.tsx`             |
| `DescriptionSection` component         | Plan 1 Task 3 | `components/description-section.tsx` |
| `generatePageMeta` accepts `ogImage`   | Plan 2 Task 2 | `libs/seo.ts`                        |
| OG image API route                     | Plan 2 Task 1 | `app/api/og/route.tsx`               |

---

## Task 1: JWT (`/jwt`)

**Files:**

- Modify: `public/locales/en/jwt.json` (descriptions section)
- Modify: `app/[locale]/jwt/jwt-page.tsx` (replace Description function)
- Modify: `app/[locale]/jwt/page.tsx` (add howToSteps, sameAs, ogImage)

### Step 1: Update English content

- [ ] Replace the `descriptions` object in `public/locales/en/jwt.json` with:

```json
"descriptions": {
  "whatIsTitle": "What is JWT?",
  "aeoDefinition": "JWT Debugger is a free online tool for encoding, decoding, and verifying JSON Web Tokens. Supports HS256, RS256, ES256 and more algorithms. All processing runs in your browser — no tokens are sent to any server.",
  "whatIs": "JSON Web Token (JWT) is an open standard (RFC 7519) for securely transmitting information between parties as a JSON object. JWTs are commonly used for authentication and authorization in web applications. Debug tokens here, then verify payloads with [Base64](/base64) decoding or check key integrity with [Hashing](/hashing).",
  "useCasesTitle": "Common Use Cases",
  "useCasesP1": "Authenticating API requests — include a JWT in the Authorization header (Bearer token) to verify the caller's identity and permissions.",
  "useCasesP2": "Decoding and debugging tokens during development — inspect the header and payload claims (iss, sub, exp, iat) without writing code.",
  "useCasesP3": "Verifying token signatures against a shared secret (HMAC) or public key (RSA/ECDSA) to ensure integrity before trusting the claims.",
  "stepsTitle": "How to Decode a JWT",
  "step1Title": "Paste your JWT",
  "step1Desc": "Copy the full JWT string (three Base64URL segments separated by dots) and paste it into the Decode tab input field.",
  "step2Title": "Inspect the header and payload",
  "step2Desc": "The tool automatically decodes the header (algorithm, type) and payload (claims) into readable JSON. Check the exp claim to see if the token has expired.",
  "step3Title": "Verify the signature (optional)",
  "step3Desc": "Switch to the Verify section, enter the secret or public key, and click Verify to confirm the token was signed by the expected party.",
  "faq1Q": "Are JWTs secure for sensitive data?",
  "faq1A": "JWT payloads are Base64Url-encoded, not encrypted — anyone can read them. Never store sensitive data in a JWT unless you use JWE (JSON Web Encryption).",
  "faq2Q": "What's the difference between HMAC and RSA JWT algorithms?",
  "faq2A": "HMAC algorithms (HS256/384/512) use a shared secret — both the issuer and verifier know the same key. RSA algorithms (RS256/384/512) use a public/private key pair — the issuer signs with the private key, and anyone with the public key can verify. Use HMAC for server-to-server, RSA for distributed systems where the verifier shouldn't be able to create tokens.",
  "faq3Q": "What happens when a JWT expires?",
  "faq3A": "The exp claim in the payload specifies the expiration timestamp. After that time, the token should be rejected by the server. This tool shows you the decoded exp so you can check whether a token is still valid. Note that JWT expiration is a claim, not enforced by the token itself — the server must validate it."
}
```

### Step 2: Migrate jwt-page.tsx

- [ ] In `app/[locale]/jwt/jwt-page.tsx`, replace the import of `renderLinkedText` and the entire `Description` function with a `DescriptionSection` import. Keep all other imports and code unchanged.

Add this import near the top of the file (after the existing imports):

```tsx
import DescriptionSection from "../../../components/description-section";
```

Remove the import of `renderLinkedText`:

```tsx
// Remove this line:
import { renderLinkedText } from "../../../utils/linked-text";
```

Remove the entire `Description` function (approximately lines 458–505 — from `function Description()` through its closing `}`).

In `export default function JwtPage()`, replace `<Description />` with:

```tsx
<DescriptionSection namespace="jwt" />
```

### Step 3: Update page.tsx

- [ ] Replace the entire `app/[locale]/jwt/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import JwtPage from "./jwt-page";

const PATH = "/jwt";
const TOOL_KEY = "jwt";
const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("jwt.title"),
    description: t("jwt.description"),
    ogImage: { title: t("jwt.shortTitle"), emoji: tool.emoji, desc: t("jwt.description") },
  });
}

export default async function JwtRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "jwt" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Desc`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("jwt.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("jwt.description"),
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
      <JwtPage />
    </>
  );
}
```

### Step 4: Verify and commit

- [ ] Run: `npx next build 2>&1 | tail -5`
- [ ] Commit:

```bash
git add public/locales/en/jwt.json app/\[locale\]/jwt/jwt-page.tsx app/\[locale\]/jwt/page.tsx
git commit -m "feat(seo): migrate JWT to DescriptionSection with howToSteps, sameAs, ogImage"
```

---

## Task 2: QR Code (`/qrcode`)

**Files:**

- Modify: `public/locales/en/qrcode.json` (descriptions section)
- Modify: `app/[locale]/qrcode/qrcode-page.tsx` (replace Description function)
- Modify: `app/[locale]/qrcode/page.tsx` (add howToSteps, sameAs, ogImage)

### Step 1: Update English content

- [ ] Replace the `descriptions` object in `public/locales/en/qrcode.json` with:

```json
"descriptions": {
  "whatIsTitle": "What is a QR Code?",
  "aeoDefinition": "QR Code Generator is a free online tool for creating QR codes for text, URLs, WiFi, vCard, and more. Supports custom colors, logos, and dot styles with SVG/PNG export. No data is sent to any server.",
  "whatIs": "QR (Quick Response) codes are two-dimensional barcodes that store data in a pattern of black and white squares. Invented by Denso Wave in 1994, they can encode URLs, text, contact info, WiFi credentials, and more — scan them with any smartphone camera.",
  "useCasesTitle": "Common Use Cases",
  "useCasesP1": "Sharing a website URL — put a QR code on a business card, flyer, or poster so people can open the link instantly.",
  "useCasesP2": "WiFi network sharing — encode the SSID, password, and encryption type so guests can connect by scanning.",
  "useCasesP3": "vCard contact exchange — embed your name, phone, email, and organization into a scannable code.",
  "stepsTitle": "How to Create a QR Code",
  "step1Title": "Choose your content type",
  "step1Desc": "Select Text/URL, WiFi, vCard, Email, SMS, or WhatsApp depending on what you want to encode.",
  "step2Title": "Enter your data",
  "step2Desc": "Fill in the required fields. For URLs, paste the full link. For WiFi, enter the network name and password.",
  "step3Title": "Customize the appearance",
  "step3Desc": "Adjust colors, dot style, error correction level, and optionally add a logo. Higher error correction (Q or H) is recommended when using logos.",
  "faq1Q": "What is the maximum QR code capacity?",
  "faq1A": "Capacity depends on error correction level and data type. Numeric: up to 7,089 characters. Alphanumeric: up to 4,296. Binary: up to 2,953 bytes. Kanji: up to 1,817 characters.",
  "faq2Q": "Should I use SVG or PNG export?",
  "faq2A": "Use SVG for print materials — it scales to any size without pixelation. Use PNG for digital display, social media, or when you need a fixed-resolution raster image. The PNG export supports up to 1024px resolution for high-quality printing.",
  "faq3Q": "Can I put a logo inside my QR code?",
  "faq3A": "Yes. Upload a logo image and the tool will overlay it at the center. Error correction is automatically raised to H (30% recovery) to maintain scannability. Keep the logo size at or below 30% of the QR code area for best results."
}
```

### Step 2: Migrate qrcode-page.tsx

- [ ] In `app/[locale]/qrcode/qrcode-page.tsx`, add import:

```tsx
import DescriptionSection from "../../../components/description-section";
```

Remove the entire `Description` function (approximately lines 721–776 — from `function Description()` through its closing `}`).

In `export default function QrCodePage()`, replace `<Description />` with:

```tsx
<DescriptionSection namespace="qrcode" />
```

### Step 3: Update page.tsx

- [ ] Replace the entire `app/[locale]/qrcode/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import QrCodePage from "./qrcode-page";

const PATH = "/qrcode";
const TOOL_KEY = "qrcode";
const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("qrcode.title"),
    description: t("qrcode.description"),
    ogImage: { title: t("qrcode.shortTitle"), emoji: tool.emoji, desc: t("qrcode.description") },
  });
}

export default async function QrCodeRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "qrcode" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Desc`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("qrcode.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("qrcode.description"),
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
      <QrCodePage />
    </>
  );
}
```

### Step 4: Verify and commit

- [ ] Run: `npx next build 2>&1 | tail -5`
- [ ] Commit:

```bash
git add public/locales/en/qrcode.json app/\[locale\]/qrcode/qrcode-page.tsx app/\[locale\]/qrcode/page.tsx
git commit -m "feat(seo): migrate QR Code to DescriptionSection with howToSteps, sameAs, ogImage"
```

---

## Task 3: Markdown (`/markdown`)

**Files:**

- Modify: `public/locales/en/markdown.json` (descriptions section)
- Modify: `app/[locale]/markdown/markdown-page.tsx` (replace Description function)
- Modify: `app/[locale]/markdown/page.tsx` (add howToSteps, sameAs, ogImage)

### Step 1: Update English content

- [ ] Replace the `descriptions` object in `public/locales/en/markdown.json` with:

````json
"descriptions": {
  "whatIsTitle": "What is Markdown?",
  "aeoDefinition": "Markdown Editor is a free online tool for writing and previewing Markdown with GitHub Flavored Markdown support. Includes syntax highlighting, live preview, and PDF/PNG export. Runs entirely in your browser.",
  "whatIsP1": "Markdown is a lightweight markup language that lets you format plain text using simple, readable syntax. It's the de-facto standard for READMEs, documentation, and notes — easy to write, easy to [diff](/diff), and renders beautifully across platforms.",
  "useCasesTitle": "Common Use Cases",
  "useCasesP1": "Writing and previewing README files for GitHub or GitLab repositories before committing.",
  "useCasesP2": "Drafting documentation or blog posts with live formatting — see rendered output side by side with your text.",
  "useCasesP3": "Converting Markdown notes to PDF or PNG for sharing with people who don't have a Markdown viewer.",
  "stepsTitle": "How to Use the Markdown Editor",
  "step1Title": "Write or paste your Markdown",
  "step1Desc": "Type directly in the editor or drop a .md file. The preview updates in real time as you type.",
  "step2Title": "Choose your view mode",
  "step2Desc": "Switch between Edit, Preview, and Split layouts. Split gives you side-by-side editing with live rendering.",
  "step3Title": "Export your document",
  "step3Desc": "Download as .md, export the rendered preview as PDF or PNG, or copy the raw Markdown to your clipboard.",
  "faq1Q": "Can I export Markdown to PDF?",
  "faq1A": "Yes. Use the export buttons to save as PDF or PNG. The PDF export respects print styles for clean, formatted output.",
  "faq2Q": "Does this editor support Mermaid diagrams?",
  "faq2A": "Yes. Use a ```mermaid code block and the preview will render flowcharts, sequence diagrams, class diagrams, state diagrams, ER diagrams, Gantt charts, pie charts, and git graphs automatically.",
  "faq3Q": "Is there a file size limit?",
  "faq3A": "Live preview works for content up to a reasonable size. Very large documents show a 'Render now' button instead of auto-rendering to keep the page responsive. All processing happens in your browser — nothing is sent to a server."
}
````

### Step 2: Migrate markdown-page.tsx

- [ ] In `app/[locale]/markdown/markdown-page.tsx`, add import:

```tsx
import DescriptionSection from "../../../components/description-section";
```

Remove the import of `renderLinkedText`:

```tsx
// Remove this line:
import { renderLinkedText } from "../../../utils/linked-text";
```

Remove the entire `Description` function (approximately lines 427–462 — from `function Description()` through its closing `}`).

In `export default function MarkdownPage()`, replace `<Description />` with:

```tsx
<DescriptionSection namespace="markdown" />
```

### Step 3: Update page.tsx

- [ ] Replace the entire `app/[locale]/markdown/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import MarkdownPage from "./markdown-page";

const PATH = "/markdown";
const TOOL_KEY = "markdown";
const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("markdown.title"),
    description: t("markdown.description"),
    ogImage: {
      title: t("markdown.shortTitle"),
      emoji: tool.emoji,
      desc: t("markdown.description"),
    },
  });
}

export default async function MarkdownRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "markdown" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Desc`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("markdown.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("markdown.description"),
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
      <MarkdownPage />
    </>
  );
}
```

### Step 4: Verify and commit

- [ ] Run: `npx next build 2>&1 | tail -5`
- [ ] Commit:

```bash
git add public/locales/en/markdown.json app/\[locale\]/markdown/markdown-page.tsx app/\[locale\]/markdown/page.tsx
git commit -m "feat(seo): migrate Markdown to DescriptionSection with howToSteps, sameAs, ogImage"
```

---

## Task 4: Diff (`/diff`)

**Files:**

- Modify: `public/locales/en/diff.json` (descriptions section)
- Modify: `app/[locale]/diff/diff-page.tsx` (replace Description function)
- Modify: `app/[locale]/diff/page.tsx` (add howToSteps, sameAs, ogImage)

### Step 1: Update English content

- [ ] Replace the `descriptions` object in `public/locales/en/diff.json` with:

```json
"descriptions": {
  "whatIsTitle": "What is a diff?",
  "aeoDefinition": "Text Diff is a free online tool for comparing two texts with line-level and word-level precision. Side-by-side or inline view with highlighted changes. Runs entirely in your browser — no data is sent to any server.",
  "whatIsP1": "A diff is a structured comparison between two pieces of text that highlights what was added, what was removed, and what stayed the same. Developers use it every day to review code changes, audit configuration drift, and compare [JSON](/json) or [CSV](/csv) files.",
  "whatIsP2": "This tool runs the comparison entirely in your browser using the jsdiff library. Nothing you paste or upload is sent to any server.",
  "useCasesTitle": "Common Use Cases",
  "useCasesP1": "Comparing two configuration files ([JSON](/json), [YAML](/yaml), .env) to spot drift between environments.",
  "useCasesP2": "Reviewing a code change before pasting it into a commit, especially when working outside an editor.",
  "useCasesP3": "Reconciling two versions of a document, log, or query result side by side.",
  "stepsTitle": "How to Compare Two Texts",
  "step1Title": "Paste or upload your texts",
  "step1Desc": "Enter your original text in Text A and the modified version in Text B. You can also drag and drop files directly onto either input.",
  "step2Title": "Choose your view",
  "step2Desc": "Toggle between side-by-side (shows both texts with aligned changes) and inline (shows additions and deletions in a single stream).",
  "step3Title": "Review the highlighted changes",
  "step3Desc": "Added lines appear in green, removed lines in red. Word-level highlights within changed lines show exactly which words differ — the same convention used by GitHub pull requests.",
  "limitationsP1": "The tool diffs text only. Binary files are detected and rejected to keep the result meaningful.",
  "limitationsP2": "Inputs are capped at 5MB per side. Inputs above 512KB run in a background Web Worker; the page stays responsive but the diff itself takes proportionally longer for very large inputs.",
  "limitationsP3": "Differences in line endings (CRLF vs LF) and trailing whitespace are normalized away — they will never appear as changes.",
  "faq1Q": "Is there a file size limit?",
  "faq1A": "Diff computation runs entirely in your browser using a Web Worker. Inputs up to 5MB per side are accepted; texts up to a few MB diff smoothly. Performance depends on your device.",
  "faq2Q": "Can I ignore whitespace or case differences?",
  "faq2A": "Yes. Use the Options menu to toggle 'Ignore whitespace' and 'Ignore case'. These settings filter out superficial changes so you can focus on meaningful differences.",
  "faq3Q": "What algorithm does the diff use?",
  "faq3A": "The tool uses the Myers diff algorithm via the jsdiff library. It first computes a line-level diff, then runs a second word-level pass on adjacent changed lines to highlight which specific words were added or removed."
}
```

### Step 2: Migrate diff-page.tsx

- [ ] In `app/[locale]/diff/diff-page.tsx`, add import:

```tsx
import DescriptionSection from "../../../components/description-section";
```

Remove the import of `renderLinkedText`:

```tsx
// Remove this line:
import { renderLinkedText } from "../../../utils/linked-text";
```

Remove the entire `Description` function (approximately lines 252–312 — from `function Description()` through its closing `}`).

In `export default function DiffPage()`, replace `<Description />` with:

```tsx
<DescriptionSection namespace="diff" />
```

### Step 3: Update page.tsx

- [ ] Replace the entire `app/[locale]/diff/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import DiffPage from "./diff-page";

const PATH = "/diff";
const TOOL_KEY = "diff";
const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("diff.title"),
    description: t("diff.description"),
    ogImage: { title: t("diff.shortTitle"), emoji: tool.emoji, desc: t("diff.description") },
  });
}

export default async function DiffRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "diff" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Desc`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("diff.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("diff.description"),
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
      <DiffPage />
    </>
  );
}
```

### Step 4: Verify and commit

- [ ] Run: `npx next build 2>&1 | tail -5`
- [ ] Commit:

```bash
git add public/locales/en/diff.json app/\[locale\]/diff/diff-page.tsx app/\[locale\]/diff/page.tsx
git commit -m "feat(seo): migrate Diff to DescriptionSection with howToSteps, sameAs, ogImage"
```

---

## Task 5: Cipher (`/cipher`)

**Files:**

- Modify: `public/locales/en/cipher.json` (descriptions section)
- Modify: `app/[locale]/cipher/cipher-page.tsx` (replace Description function, add CipherExtras)
- Modify: `app/[locale]/cipher/page.tsx` (add howToSteps, sameAs, ogImage)

This tool needs `extraSections` for the algorithm descriptions (AES, DES, Triple DES, Rabbit, RC4, RC4Drop) which are custom content that DescriptionSection doesn't handle.

### Step 1: Update English content

- [ ] Replace the `descriptions` object in `public/locales/en/cipher.json` with:

```json
"descriptions": {
  "aeoDefinition": "Encrypt/Decrypt is a free online tool for encrypting and decrypting text using AES, DES, Triple DES, Rabbit, RC4, and RC4Drop. All processing runs in your browser — no data is sent to any server.",
  "whatIsTitle": "What is encryption?",
  "whatIs": "Encryption transforms readable plaintext into unreadable ciphertext using a cryptographic algorithm and a secret key. Only someone with the correct key can decrypt the ciphertext back to the original plaintext. This tool supports symmetric encryption — the same key encrypts and decrypts.",
  "useCasesTitle": "Common Use Cases",
  "useCasesP1": "Encrypting sensitive text before sharing it — the recipient needs the same passphrase to decrypt.",
  "useCasesP2": "Verifying encryption output or decrypting ciphertext you received, without installing any software.",
  "useCasesP3": "Testing and learning how different algorithms (AES, DES, RC4) behave with various block modes and padding schemes.",
  "stepsTitle": "How to Encrypt or Decrypt Text",
  "step1Title": "Choose your algorithm",
  "step1Desc": "Select AES (recommended), DES, Triple DES, Rabbit, RC4, or RC4Drop. For block ciphers, also pick a mode (CBC, CFB, CTR, OFB, ECB) and padding scheme.",
  "step2Title": "Enter your text and passphrase",
  "step2Desc": "Type or paste the plaintext (to encrypt) or ciphertext (to decrypt). Enter the passphrase — the same passphrase is required to reverse the operation.",
  "step3Title": "Encrypt or decrypt",
  "step3Desc": "Click the Encrypt or Decrypt button. The result appears immediately. Copy the output or clear the fields to start over. All processing happens in your browser.",
  "aesTitle": "AES",
  "aes": "The Advanced Encryption Standard (AES) is a U.S. Federal Information Processing Standard (FIPS). It was selected after a 5-year process where 15 competing designs were evaluated.",
  "desTitle": "DES, Triple DES",
  "des": "DES is a previously dominant algorithm for encryption, and was published as an official Federal Information Processing Standard (FIPS). DES is now considered to be insecure due to the small key size.",
  "tripleDes": "Triple DES applies DES three times to each block to increase the key size. The algorithm is believed to be secure in this form.",
  "rabbitTitle": "Rabbit",
  "rabbit": "Rabbit is a high-performance stream cipher and a finalist in the eSTREAM Portfolio. It is one of the four designs selected after a 3 1/2-year process where 22 designs were evaluated.",
  "rc4Title": "RC4, RC4Drop",
  "rc4": "RC4 is a widely-used stream cipher. It's used in popular protocols such as SSL and WEP. Although remarkable for its simplicity and speed, the algorithm's history doesn't inspire confidence in its security.",
  "rc4drop": "It was discovered that the first few bytes of keystream are strongly non-random and leak information about the key. We can defend against this attack by discarding the initial portion of the keystream. This modified algorithm is traditionally called RC4-drop.",
  "rc4dropConfig": "By default, 192 words (768 bytes) are dropped, but you can configure the algorithm to drop any number of words.",
  "faq1Q": "Is my data sent to a server during encryption?",
  "faq1A": "No. All encryption and decryption happens entirely in your browser using the CryptoJS library. Your data and passphrase never leave your device.",
  "faq2Q": "Which algorithm should I use?",
  "faq2A": "Use AES for any new project — it's the modern standard, widely supported, and considered secure. DES is obsolete (56-bit key). Triple DES is acceptable for legacy systems. RC4 has known vulnerabilities; use RC4Drop if you must use RC4. Rabbit is fast but less commonly audited.",
  "faq3Q": "What is a block cipher mode?",
  "faq3A": "Block ciphers (AES, DES) encrypt data in fixed-size blocks (typically 8 or 16 bytes). The mode defines how multiple blocks are chained together. CBC is the most common and recommended for general use. ECB encrypts each block independently — avoid it, as identical plaintext blocks produce identical ciphertext."
}
```

### Step 2: Migrate cipher-page.tsx with CipherExtras

- [ ] In `app/[locale]/cipher/cipher-page.tsx`, add import:

```tsx
import DescriptionSection from "../../../components/description-section";
```

Remove the entire `Description` function (approximately lines 448–489 — from `function Description()` through its closing `}`).

Add the following `CipherExtras` function **before** `export default function CipherPage()`:

```tsx
function CipherExtras() {
  const t = useTranslations("cipher");
  return (
    <section className="mt-6 space-y-4">
      <div className="mb-4">
        <h2 className="font-semibold text-fg-primary text-base">{t("descriptions.aesTitle")}</h2>
        <p className="text-fg-secondary text-sm mt-1 leading-relaxed">{t("descriptions.aes")}</p>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold text-fg-primary text-base">{t("descriptions.desTitle")}</h2>
        <p className="text-fg-secondary text-sm mt-1 leading-relaxed">{t("descriptions.des")}</p>
        <p className="text-fg-secondary text-sm mt-1 leading-relaxed">
          {t("descriptions.tripleDes")}
        </p>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold text-fg-primary text-base">{t("descriptions.rabbitTitle")}</h2>
        <p className="text-fg-secondary text-sm mt-1 leading-relaxed">{t("descriptions.rabbit")}</p>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold text-fg-primary text-base">{t("descriptions.rc4Title")}</h2>
        <p className="text-fg-secondary text-sm mt-1 leading-relaxed">{t("descriptions.rc4")}</p>
        <p className="text-fg-secondary text-sm mt-1 leading-relaxed">
          {t("descriptions.rc4drop")}
        </p>
        <p className="text-fg-secondary text-sm mt-1 leading-relaxed">
          {t("descriptions.rc4dropConfig")}
        </p>
      </div>
    </section>
  );
}
```

In `export default function CipherPage()`, replace `<Description />` with:

```tsx
<DescriptionSection namespace="cipher" extraSections={<CipherExtras />} />
```

### Step 3: Update page.tsx

- [ ] Replace the entire `app/[locale]/cipher/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import CipherPage from "./cipher-page";

const PATH = "/cipher";
const TOOL_KEY = "cipher";
const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("cipher.title"),
    description: t("cipher.description"),
    ogImage: { title: t("cipher.shortTitle"), emoji: tool.emoji, desc: t("cipher.description") },
  });
}

export default async function CipherRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "cipher" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Desc`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("cipher.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("cipher.description"),
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
      <CipherPage />
    </>
  );
}
```

### Step 4: Verify and commit

- [ ] Run: `npx next build 2>&1 | tail -5`
- [ ] Commit:

```bash
git add public/locales/en/cipher.json app/\[locale\]/cipher/cipher-page.tsx app/\[locale\]/cipher/page.tsx
git commit -m "feat(seo): migrate Cipher to DescriptionSection with CipherExtras, howToSteps, sameAs, ogImage"
```

---

## Task 6: Color (`/color`)

**Files:**

- Modify: `public/locales/en/color.json` (descriptions section)
- Modify: `app/[locale]/color/color-page.tsx` (replace Description function, add ColorExtras)
- Modify: `app/[locale]/color/page.tsx` (add sameAs, ogImage)

This tool needs `extraSections` for color spaces, contrast, and vision simulation content. Color already has 3 FAQs. No howToSteps (color tool is exploratory, not step-based). We set `showHowTo={false}`.

### Step 1: Update English content

- [ ] Replace the `descriptions` object in `public/locales/en/color.json` with:

```json
"descriptions": {
  "aeoDefinition": "Color Converter is a free online tool for converting between HEX, RGB, HSL, OKLCH and other color spaces. Includes a visual picker, image palette extraction, WCAG contrast checker, and color-blindness preview. Runs entirely in your browser.",
  "whatIsTitle": "What is the Color Tool?",
  "whatIs": "A comprehensive color utility that converts between 7 color spaces (HEX, RGB, HSL, HSV, CMYK, LAB, OKLCH), generates color harmonies, checks contrast ratios for accessibility, simulates color vision deficiencies, and extracts palettes from images.",
  "useCasesTitle": "Common Use Cases",
  "useCasesP1": "Picking and converting colors for web development — get the exact HEX, RGB, HSL, or OKLCH value you need for CSS or Tailwind.",
  "useCasesP2": "Checking text contrast against a background color to meet WCAG accessibility guidelines (AA/AAA) or the newer APCA standard.",
  "useCasesP3": "Extracting dominant colors from an image to build a cohesive design palette, then generating complementary, analogous, or triadic harmonies.",
  "introP1": "This color tool converts between 7 color spaces, generates harmonies, checks contrast ratios (WCAG and APCA), simulates color blindness, and extracts palettes from images. See [Number Base converter](/numbase) for hex calculations, or [Image compressor](/image) for image processing.",
  "spacesTitle": "Color Spaces",
  "spaceHex": "HEX — compact 6/8-digit RGB notation. The default for CSS.",
  "spaceRgb": "RGB — additive primaries 0–255. Maps directly to display pixels.",
  "spaceHsl": "HSL — hue/saturation/lightness. Easier for humans to reason about than RGB.",
  "spaceHsv": "HSV — hue/saturation/value. Common in design tools but not a CSS function.",
  "spaceCmyk": "CMYK — subtractive primaries used in print. Approximate when converted from RGB.",
  "spaceLab": "LAB — perceptually uniform; equal numeric distance ≈ equal visual distance.",
  "spaceOklch": "OKLCH — modern perceptual space; preferred by Tailwind v4 and CSS Color Module Level 4.",
  "contrastTitle": "Contrast (WCAG vs APCA)",
  "contrastP1": "WCAG 2.1 uses a luminance ratio (1:1 to 21:1) with thresholds for AA/AAA. It is widely supported but doesn't fully account for perception of small text or dark mode.",
  "contrastP2": "APCA is a candidate for WCAG 3 with a polarity-aware Lc score. It correlates better with readability for thin or small text.",
  "visionP1": "Roughly 1 in 12 men and 1 in 200 women have a form of color vision deficiency. The Vision toggle simulates protanopia, deuteranopia, tritanopia, and achromatopsia so you can verify your design holds up.",
  "tipsTitle": "Tips",
  "tipEyedropper": "Use the eyedropper to pick a color from any pixel on your screen (Chromium browsers).",
  "tipImage": "Drop an image into the Palette tab to extract its 6 dominant colors via median-cut quantization.",
  "tipOklch": "Tailwind v4 emits colors in OKLCH for perceptual smoothness — copy the @theme block to align with that workflow.",
  "faq1Q": "What is the Color Tool?",
  "faq1A": "The Color Tool is a comprehensive color utility that supports HEX, RGB, HSL, and OKLCH color models with a visual picker, conversions, and contrast checking.",
  "faq2Q": "What is OKLCH color space?",
  "faq2A": "OKLCH is a perceptually uniform color space that better matches human vision than HSL or RGB. It produces more consistent lightness gradients and accessible palettes.",
  "faq3Q": "Can I extract colors from an image?",
  "faq3A": "Yes. Drag and drop any image onto the palette extraction area to get the dominant colors. You can also simulate color vision deficiencies (protanopia, deuteranopia, tritanopia)."
}
```

### Step 2: Migrate color-page.tsx with ColorExtras

- [ ] In `app/[locale]/color/color-page.tsx`, add import:

```tsx
import DescriptionSection from "../../../components/description-section";
```

Remove the entire `Description` function (approximately lines 421–493 — from `function Description()` through its closing `}`).

Add the following `ColorExtras` function **before** `function ImagePaletteSection(...)`:

```tsx
function ColorExtras() {
  const t = useTranslations("color.descriptions");
  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-start gap-2 border-l-2 border-accent-purple bg-accent-purple-dim/30 rounded-r-lg p-4">
        <Info size={18} className="text-accent-purple mt-0.5 shrink-0" />
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-fg-primary">{t("title")}</h3>
          <p className="text-sm text-fg-secondary leading-relaxed">{t("introP1")}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-4 rounded-full bg-accent-cyan" />
          <span className="font-mono text-xs font-semibold text-fg-muted uppercase tracking-wider">
            {t("spacesTitle")}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(
            [
              "spaceHex",
              "spaceRgb",
              "spaceHsl",
              "spaceHsv",
              "spaceCmyk",
              "spaceLab",
              "spaceOklch",
            ] as const
          ).map((k) => (
            <div
              key={k}
              className="rounded-lg border border-border-default bg-bg-elevated/30 p-3 text-sm text-fg-secondary leading-relaxed"
            >
              {t(k)}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-4 rounded-full bg-accent-cyan" />
          <span className="font-mono text-xs font-semibold text-fg-muted uppercase tracking-wider">
            {t("contrastTitle")}
          </span>
        </div>
        <p className="text-sm text-fg-secondary leading-relaxed">{t("contrastP1")}</p>
        <p className="text-sm text-fg-secondary leading-relaxed mt-2">{t("contrastP2")}</p>
      </div>

      <div className="flex items-start gap-2 border-l-2 border-accent-cyan bg-accent-cyan-dim/30 rounded-r-lg p-4">
        <div className="space-y-2 text-sm text-fg-secondary leading-relaxed">
          <h3 className="text-sm font-semibold text-fg-primary">{t("tipsTitle")}</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>{t("tipEyedropper")}</li>
            <li>{t("tipImage")}</li>
            <li>{t("tipOklch")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

In `export default function ColorPage()`, replace `<Description />` with:

```tsx
<DescriptionSection namespace="color" showHowTo={false} extraSections={<ColorExtras />} />
```

### Step 3: Update page.tsx

- [ ] Replace the entire `app/[locale]/color/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import ColorPage from "./color-page";

const PATH = "/color";
const TOOL_KEY = "color";
const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("color.title"),
    description: t("color.description"),
    ogImage: { title: t("color.shortTitle"), emoji: tool.emoji, desc: t("color.description") },
  });
}

export default async function ColorRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "color" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const schemas = buildToolSchemas({
    name: t("color.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("color.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems: [1, 2, 3].map((i) => ({
      q: tx(`descriptions.faq${i}Q`),
      a: tx(`descriptions.faq${i}A`),
    })),
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
      <ColorPage />
    </>
  );
}
```

### Step 4: Verify and commit

- [ ] Run: `npx next build 2>&1 | tail -5`
- [ ] Commit:

```bash
git add public/locales/en/color.json app/\[locale\]/color/color-page.tsx app/\[locale\]/color/page.tsx
git commit -m "feat(seo): migrate Color to DescriptionSection with ColorExtras, sameAs, ogImage"
```

---

## Task 7: UUID (`/uuid`)

**Files:**

- Modify: `public/locales/en/uuid.json` (descriptions section)
- Modify: `app/[locale]/uuid/uuid-page.tsx` (replace Description function)
- Modify: `app/[locale]/uuid/page.tsx` (add howToSteps, sameAs, ogImage)

### Step 1: Update English content

- [ ] Replace the `descriptions` object in `public/locales/en/uuid.json` with:

```json
"descriptions": {
  "whatIsTitle": "What is the UUID Generator?",
  "aeoDefinition": "UUID Generator is a free online tool for generating v1, v3, v4, v5, and v7 UUIDs in bulk. Conforms to RFC 4122/9562. Runs entirely in your browser.",
  "whatIsP1": "UUID (Universally Unique Identifier) is a 128-bit identifier standard defined in RFC 4122 and RFC 9562. This tool generates UUID v4 (random) and v7 (time-ordered) in bulk. Use generated IDs as [Password](/password) seeds, encode them in [QR codes](/qrcode), or verify uniqueness with [Hashing](/hashing).",
  "whatIsP2": "UUIDs are widely used as database primary keys, distributed system identifiers, and session tokens. With 2^122 possible values, collision probability is negligible.",
  "useCasesTitle": "Common Use Cases",
  "useCasesP1": "Database primary keys — UUIDs avoid ID collisions in distributed databases without requiring a central coordinator.",
  "useCasesP2": "Distributed system identifiers — generate unique IDs across multiple services, regions, or data centers with zero coordination.",
  "useCasesP3": "Session tokens and request tracing — use UUIDs as correlation IDs that are guaranteed unique across your entire infrastructure.",
  "stepsTitle": "How to Generate UUIDs",
  "step1Title": "Select your UUID version",
  "step1Desc": "Choose v4 (random, general-purpose), v7 (time-ordered, database-friendly), v3/v5 (deterministic from namespace + name), or v1 (timestamp + MAC).",
  "step2Title": "Set the quantity and format",
  "step2Desc": "Adjust the slider to generate up to 100 UUIDs at once. Choose standard, no-hyphens, or braces format, and toggle uppercase if needed.",
  "step3Title": "Copy or download",
  "step3Desc": "Click the copy button for a single UUID, or download all generated UUIDs as a .txt file for bulk use.",
  "faq1Q": "How many UUIDs can I generate at once?",
  "faq1A": "You can generate up to 1,000 UUIDs in a single batch. All generation happens in your browser using crypto.getRandomValues().",
  "faq2Q": "Should I use UUID v4 or v7?",
  "faq2A": "Use v4 for general-purpose random IDs. Use v7 for database primary keys or when time-ordering matters — v7 includes a millisecond timestamp prefix for sortable uniqueness.",
  "faq3Q": "Can I generate the same UUID every time?",
  "faq3A": "Yes. Use v3 (MD5) or v5 (SHA-1) with the same namespace and name input — they always produce the same deterministic UUID. This is useful for generating consistent identifiers from known inputs like URLs or domain names."
}
```

### Step 2: Migrate uuid-page.tsx

- [ ] In `app/[locale]/uuid/uuid-page.tsx`, add import:

```tsx
import DescriptionSection from "../../../components/description-section";
```

Remove the import of `renderLinkedText`:

```tsx
// Remove this line:
import { renderLinkedText } from "../../../utils/linked-text";
```

Remove the entire `Description` function (approximately lines 34–68 — from `function Description()` through its closing `}`).

In `export default function UuidPage()`, replace `<Description />` with:

```tsx
<DescriptionSection namespace="uuid" />
```

### Step 3: Update page.tsx

- [ ] Replace the entire `app/[locale]/uuid/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import UuidPage from "./uuid-page";

const PATH = "/uuid";
const TOOL_KEY = "uuid";
const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("uuid.title"),
    description: t("uuid.description"),
    ogImage: { title: t("uuid.shortTitle"), emoji: tool.emoji, desc: t("uuid.description") },
  });
}

export default async function UuidRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "uuid" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Desc`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("uuid.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("uuid.description"),
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
      <UuidPage />
    </>
  );
}
```

### Step 4: Verify and commit

- [ ] Run: `npx next build 2>&1 | tail -5`
- [ ] Commit:

```bash
git add public/locales/en/uuid.json app/\[locale\]/uuid/uuid-page.tsx app/\[locale\]/uuid/page.tsx
git commit -m "feat(seo): migrate UUID to DescriptionSection with howToSteps, sameAs, ogImage"
```

---

## Task 8: Password (`/password`)

**Files:**

- Modify: `public/locales/en/password.json` (descriptions section)
- Modify: `app/[locale]/password/password-page.tsx` (replace Description function)
- Modify: `app/[locale]/password/page.tsx` (add sameAs, ogImage)

Password already has stepsTitle + step1-5Title/Desc and faq1-3Q/A. Only needs whatIs + useCases added. This is the "gold standard" tool.

### Step 1: Update English content

- [ ] Replace the `descriptions` object in `public/locales/en/password.json` with:

```json
"descriptions": {
  "aeoDefinition": "Password Generator is a free online tool for creating cryptographically secure passwords. Supports random, memorable, and PIN generation with a built-in strength checker. Runs entirely in your browser.",
  "whatIsTitle": "What makes a strong password?",
  "whatIs": "A strong password uses enough entropy (randomness) to resist brute-force and dictionary attacks. Length matters more than complexity — a 20-character random password is stronger than an 8-character password with symbols. This tool generates passwords using crypto.getRandomValues(), the same cryptographic primitive used by TLS and SSH.",
  "useCasesTitle": "Common Use Cases",
  "useCasesP1": "Generating unique passwords for each online account — never reuse the same password across services.",
  "useCasesP2": "Creating memorable passphrases (diceware-style) for master passwords that you need to type manually.",
  "useCasesP3": "Checking the strength of an existing password with the built-in zxcvbn analyzer to see how long it would take to crack.",
  "stepsTitle": "How to Create a Strong Password",
  "step1Title": "Choose your password length",
  "step1Desc": "Select at least 16 characters. Longer passwords are exponentially harder to crack.",
  "step2Title": "Enable all character types",
  "step2Desc": "Combine uppercase, lowercase, numbers, and symbols to maximize entropy.",
  "step3Title": "Avoid ambiguous characters",
  "step3Desc": "Enable \"Avoid Ambiguous\" to exclude easily confused characters like 0/O and 1/l/I.",
  "step4Title": "Check password strength",
  "step4Desc": "Use the Strength Checker tab to verify your password resists common attack patterns.",
  "step5Title": "Use unique passwords",
  "step5Desc": "Never reuse passwords across different services.",
  "faq1Q": "What is the difference between random and memorable passwords?",
  "faq1A": "Random passwords mix all character types for maximum entropy per character but are hard to remember. Memorable passwords combine dictionary words (diceware style, like \"correct-horse-battery-staple\") for easier recall. Both are secure when long enough — 4-5 random words can match a 12-character random password in strength. The key is total entropy, not the format.",
  "faq2Q": "Why should I avoid personal information in passwords?",
  "faq2A": "Passwords containing birthdays, names, pet names, or other personal details are far less secure. Attackers can easily find this information on social media and use it in targeted attacks. Always use randomly generated passwords instead.",
  "faq3Q": "Are online password generators safe?",
  "faq3A": "This generator runs entirely in your browser using crypto.getRandomValues(), a cryptographically secure random number generator. No data is sent to any server. Your passwords are never transmitted over the internet."
}
```

### Step 2: Migrate password-page.tsx

- [ ] In `app/[locale]/password/password-page.tsx`, add import:

```tsx
import DescriptionSection from "../../../components/description-section";
```

Remove the entire `Description` function (approximately lines 837–884 — from `function Description()` through its closing `}`).

In `export default function PasswordPage()`, replace `<Description />` with:

```tsx
<DescriptionSection namespace="password" howToStepCount={5} faqCount={3} />
```

### Step 3: Update page.tsx

- [ ] Replace the entire `app/[locale]/password/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import PasswordPage from "./password-page";

const PATH = "/password";
const TOOL_KEY = "password";
const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("password.title"),
    description: t("password.description"),
    ogImage: {
      title: t("password.shortTitle"),
      emoji: tool.emoji,
      desc: t("password.description"),
    },
  });
}

export default async function PasswordRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tp = await getTranslations({ locale, namespace: "password" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = [1, 2, 3, 4, 5].map((i) => ({
    name: tp(`descriptions.step${i}Title`),
    text: tp(`descriptions.step${i}Desc`),
  }));
  const schemas = buildToolSchemas({
    name: t("password.title"),
    description: tp.has("descriptions.aeoDefinition")
      ? tp("descriptions.aeoDefinition")
      : t("password.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems: [1, 2, 3].map((i) => ({
      q: tp(`descriptions.faq${i}Q`),
      a: tp(`descriptions.faq${i}A`),
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
      <PasswordPage />
    </>
  );
}
```

### Step 4: Verify and commit

- [ ] Run: `npx next build 2>&1 | tail -5`
- [ ] Commit:

```bash
git add public/locales/en/password.json app/\[locale\]/password/password-page.tsx app/\[locale\]/password/page.tsx
git commit -m "feat(seo): migrate Password to DescriptionSection with sameAs, ogImage, whatIs, useCases"
```

---

## Task 9: SSH Key (`/sshkey`)

**Files:**

- Modify: `public/locales/en/sshkey.json` (descriptions section)
- Modify: `app/[locale]/sshkey/sshkey-page.tsx` (replace Description function)
- Modify: `app/[locale]/sshkey/page.tsx` (add sameAs, ogImage)

SSH Key already has stepsTitle + step1-4Title/Desc and faq1-4Q/A. Only needs whatIs + useCases added. It has 4 FAQs and 4 steps, so we set `faqCount={4}` and `howToStepCount={4}`.

### Step 1: Update English content

- [ ] Replace the `descriptions` object in `public/locales/en/sshkey.json` with:

```json
"descriptions": {
  "aeoDefinition": "SSH Key Generator is a free online tool for generating RSA and Ed25519 SSH key pairs entirely in your browser. Supports passphrase encryption and fingerprint display. No data is sent to any server.",
  "whatIsTitle": "What is an SSH key?",
  "whatIs": "An SSH key pair consists of a private key and a public key used for secure authentication to servers and services (Git platforms, cloud providers, remote machines). The private key stays on your device; the public key is placed on the server. SSH keys are more secure than passwords because they resist brute-force and phishing attacks.",
  "useCasesTitle": "Common Use Cases",
  "useCasesP1": "Authenticating to Git platforms (GitHub, GitLab, Bitbucket) without typing your password on every push or pull.",
  "useCasesP2": "Secure shell access to remote servers — add your public key to ~/.ssh/authorized_keys and log in without a password.",
  "useCasesP3": "CI/CD deployment keys — generate a dedicated key pair for automated systems to access repositories or servers without shared credentials.",
  "stepsTitle": "How to Generate & Deploy SSH Keys",
  "step1Title": "Choose your key type",
  "step1Desc": "Select Ed25519 (recommended — more secure, faster key generation) or RSA (broader compatibility with legacy systems), then set the key size if using RSA.",
  "step2Title": "Generate your key pair",
  "step2Desc": "Click Generate Key Pair. Keys are created entirely in your browser using the Web Crypto API — your private key never leaves your device.",
  "step3Title": "Copy your public key",
  "step3Desc": "Copy the public key content. It is ready to paste into target servers, Git platforms (GitHub, GitLab, Bitbucket), or cloud providers.",
  "step4Title": "Deploy to your server",
  "step4Desc": "Use ssh-copy-id -i ~/.ssh/id_ed25519.pub user@host or manually append the public key to ~/.ssh/authorized_keys on the target machine.",
  "faq1Q": "Ed25519 vs RSA: Which SSH key type should I use?",
  "faq1A": "Ed25519 is recommended for most use cases. It offers 128-bit security (comparable to RSA 3072), produces shorter keys, and generates signatures much faster. RSA 4096 is only needed for compatibility with older systems or services that do not yet support Ed25519. GitHub, GitLab, and all major cloud providers support Ed25519.",
  "faq2Q": "Do I need a passphrase for my SSH key?",
  "faq2A": "Not required, but strongly recommended. A passphrase encrypts your private key on disk. If your device is lost, stolen, or compromised, the private key cannot be used without the passphrase. Use a strong passphrase of 12+ characters for best protection.",
  "faq3Q": "How do I add my SSH key to GitHub?",
  "faq3A": "Go to Settings → SSH and GPG keys → New SSH key. Give it a descriptive title, paste your public key content (the entire line starting with ssh-ed25519 or ssh-rsa), and click Add SSH key. Alternatively, use the GitHub CLI: gh ssh-key add ~/.ssh/id_ed25519.pub.",
  "faq4Q": "Is it safe to generate SSH keys in the browser?",
  "faq4A": "Yes. This tool uses the Web Crypto API, which provides the same cryptographic primitives used by OpenSSL and OpenSSH. Key generation happens entirely in browser memory — no data is sent to any server. Generated keys are lost when you close or refresh the page, so download or copy them before leaving."
}
```

### Step 2: Migrate sshkey-page.tsx

- [ ] In `app/[locale]/sshkey/sshkey-page.tsx`, add import:

```tsx
import DescriptionSection from "../../../components/description-section";
```

Remove the entire `Description` function (approximately lines 390–437 — from `function Description()` through its closing `}`).

In `export default function SshKeyPage()`, replace `<Description />` with:

```tsx
<DescriptionSection namespace="sshkey" howToStepCount={4} faqCount={4} />
```

### Step 3: Update page.tsx

- [ ] Replace the entire `app/[locale]/sshkey/page.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import SshKeyPage from "./sshkey-page";

const PATH = "/sshkey";
const TOOL_KEY = "sshkey";
const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("sshkey.title"),
    description: t("sshkey.description"),
    ogImage: { title: t("sshkey.shortTitle"), emoji: tool.emoji, desc: t("sshkey.description") },
  });
}

export default async function SshKeyRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const ts = await getTranslations({ locale, namespace: "sshkey" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = [1, 2, 3, 4].map((i) => ({
    name: ts(`descriptions.step${i}Title`),
    text: ts(`descriptions.step${i}Desc`),
  }));
  const schemas = buildToolSchemas({
    name: t("sshkey.title"),
    description: ts.has("descriptions.aeoDefinition")
      ? ts("descriptions.aeoDefinition")
      : t("sshkey.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems: [1, 2, 3, 4].map((i) => ({
      q: ts(`descriptions.faq${i}Q`),
      a: ts(`descriptions.faq${i}A`),
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
      <SshKeyPage />
    </>
  );
}
```

### Step 4: Verify and commit

- [ ] Run: `npx next build 2>&1 | tail -5`
- [ ] Commit:

```bash
git add public/locales/en/sshkey.json app/\[locale\]/sshkey/sshkey-page.tsx app/\[locale\]/sshkey/page.tsx
git commit -m "feat(seo): migrate SSH Key to DescriptionSection with sameAs, ogImage, whatIs, useCases"
```

---

## Summary

| Task | Tool     | JSON Content Added              | Page Migration                    | extras                       | FAQ | Steps |
| ---- | -------- | ------------------------------- | --------------------------------- | ---------------------------- | --- | ----- |
| 1    | JWT      | useCases, steps, faq2-3         | DescriptionSection                | —                            | 3   | 3     |
| 2    | QR Code  | whatIs, useCases, steps, faq2-3 | DescriptionSection                | —                            | 3   | 3     |
| 3    | Markdown | useCases, steps, faq2-3         | DescriptionSection                | —                            | 3   | 3     |
| 4    | Diff     | steps, faq2-3                   | DescriptionSection                | —                            | 3   | 3     |
| 5    | Cipher   | whatIs, useCases, steps, faq2-3 | DescriptionSection + CipherExtras | CipherExtras                 | 3   | 3     |
| 6    | Color    | whatIs, useCases                | DescriptionSection + ColorExtras  | ColorExtras, showHowTo=false | 3   | 0     |
| 7    | UUID     | useCases, steps, faq3           | DescriptionSection                | —                            | 3   | 3     |
| 8    | Password | whatIs, useCases                | DescriptionSection                | howToStepCount=5             | 3   | 5     |
| 9    | SSH Key  | whatIs, useCases                | DescriptionSection                | howToStepCount=4, faqCount=4 | 4   | 4     |

All 9 tools receive: `sameAs` (from TOOLS), `ogImage` (dynamic OG), `howToSteps` (HowTo schema), complete FAQs (FAQPage schema), and the unified `DescriptionSection` component.
