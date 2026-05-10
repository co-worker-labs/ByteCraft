# Plan 4: Content Layer Completion + Homepage Enhancement

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add missing Description sections to 5 tools, add FAQ sections to all 32 tools, and enhance the homepage with brand description, tool count, and FAQ.

**Architecture:** Follow existing Description patterns (Style A: static paragraphs for most tools, Style B: Steps+FAQ for password/sshkey). Add `Description` component + FAQ `Accordion` to tools missing them. For the homepage, add "What is OmniKit?" section, tool count, and FAQ with Organization schema. All new UI text uses next-intl with English as source of truth.

**Depends on:** Plan 1 (Schema Foundation) — FAQPage schema needs `buildToolSchemas()`.

**Tech Stack:** React, next-intl, Accordion component, Tailwind CSS, Vitest

---

## File Structure

| File                                              | Responsibility                                   | Status |
| ------------------------------------------------- | ------------------------------------------------ | ------ |
| 5 tool `*-page.tsx` files                         | Add `Description` component                      | Modify |
| 32 tool translation files (10 locales × 32 tools) | Add FAQ translation keys                         | Modify |
| `components/json-ld.tsx`                          | Add `buildOrganizationSchema()`                  | Modify |
| `app/[locale]/layout.tsx`                         | Inject Organization schema                       | Modify |
| `app/[locale]/page.tsx`                           | Add Organization + FAQPage schema injection      | Modify |
| `app/[locale]/home-page.tsx`                      | Add brand description + tool count + FAQ section | Modify |
| `public/locales/*/home.json` (10 files)           | Add homepage content translations                | Modify |

---

## Task 1: Add Description to 5 Missing Tools

**Files:**

- Modify: `wordcounter/wordcounter-page.tsx`
- Modify: `storageunit/storageunit-page.tsx`
- Modify: `ascii/ascii-page.tsx`
- Modify: `dbviewer/dbviewer-page.tsx`
- Modify: `uuid/uuid-page.tsx`
- Modify: Each tool's translation files (10 locales each)

These 5 tools have no `Description` component. Add one following the standard Style A pattern.

### Step 1a: Add translation keys for each tool (English first)

For each tool, add a `descriptions` object to its translation file. Below are the English source texts:

**wordcounter (`public/locales/en/wordcounter.json`)** — add:

```json
"descriptions": {
  "whatIsTitle": "What is the Word Counter?",
  "whatIsP1": "The Word Counter is a free online tool that provides real-time text analysis including word count, character count, sentence count, paragraph count, and reading time estimation.",
  "whatIsP2": "It also supports CJK (Chinese, Japanese, Korean) character counting, keyword frequency analysis, and custom keyword tracking — making it ideal for writers, students, and translators."
}
```

**storageunit (`public/locales/en/storageunit.json`)** — add:

```json
"descriptions": {
  "whatIsTitle": "What is the Storage Unit Converter?",
  "whatIsP1": "The Storage Unit Converter lets you instantly convert between digital storage units — bytes, KB, MB, GB, TB, PB — supporting both decimal (SI) and binary (IEC) standards.",
  "whatIsP2": "Whether you're comparing file sizes, provisioning disk space, or understanding data transfer limits, this tool gives you accurate conversions at a glance."
}
```

**ascii (`public/locales/en/ascii.json`)** — add `descriptions` (note: file already has `description` singular — add `descriptions` plural as a new object):

```json
"descriptions": {
  "whatIsTitle": "What is the ASCII Table?",
  "whatIsP1": "ASCII (American Standard Code for Information Interchange) is a character encoding standard that assigns numeric values to letters, digits, punctuation, and control codes. It covers 128 characters from 0 to 127.",
  "whatIsP2": "This tool provides a complete interactive ASCII reference table with search, character-to-code conversion, and categorized sections for printable characters and control codes."
}
```

**dbviewer (`public/locales/en/dbviewer.json`)** — add:

```json
"descriptions": {
  "whatIsTitle": "What is the SQLite Viewer?",
  "whatIsP1": "The SQLite Viewer lets you open and explore SQLite database files directly in your browser — no server upload required. Run SQL queries, browse tables, and export data as CSV or JSON.",
  "whatIsP2": "Powered by sql.js (SQLite compiled to WebAssembly), it supports autocomplete, query history, pagination, and handles databases up to browser memory limits."
}
```

**uuid (`public/locales/en/uuid.json`)** — add `descriptions` object:

```json
"descriptions": {
  "whatIsTitle": "What is the UUID Generator?",
  "whatIsP1": "UUID (Universally Unique Identifier) is a 128-bit identifier standard defined in RFC 4122 and RFC 9562. This tool generates UUID v4 (random) and v7 (time-ordered) in bulk.",
  "whatIsP2": "UUIDs are widely used as database primary keys, distributed system identifiers, and session tokens. With 2^122 possible values, collision probability is negligible."
}
```

### Step 1b: Translate to other 9 locales

For each tool, translate the 3 keys into all 9 non-English locales. Use idiomatic translations as described in AGENTS.md Translation Workflow.

### Step 1c: Add Description component to each tool's page

For each of the 5 tools, add a `Description` function component following Style A pattern:

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

**Placement in each tool's default export JSX:**

- Add `<Description />` at the end of the container `<div>`, after all existing content
- For `uuid-page.tsx`: the file currently has inline description sections at the bottom — add the new `Description` component after those inline sections

### Step 1d: Verify each tool

Run: `npm run dev`
Visit each tool and verify the Description section renders correctly.

### Step 1e: Commit

```bash
git add app/\[locale\]/wordcounter/ app/\[locale\]/storageunit/ app/\[locale\]/ascii/ app/\[locale\]/dbviewer/ app/\[locale\]/uuid/ public/locales/*/{wordcounter,storageunit,ascii,dbviewer,uuid}.json
git commit -m "feat(content): add Description section to wordcounter, storageunit, ascii, dbviewer, uuid"
```

---

## Task 2: Add FAQ Section to All 32 Tools

**Files:**

- Modify: 32 tool `*-page.tsx` files (add FAQ section to Description)
- Modify: 32 tool translation files × 10 locales (add FAQ keys)

### FAQ Strategy

**Tools with existing FAQ (keep as-is):**

- password: 5 FAQ items
- sshkey: 4 FAQ items

**Tools getting new 3-item FAQ (30 tools):**

Each tool gets 3 FAQ items following the pattern:

- Q1: "What is [tool]?" — basic definition
- Q2: "Is [tool] free/secure?" — trust question (emphasize client-side, no data sent)
- Q3: Tool-specific question

### Step 2a: Add English FAQ translation keys to all 30 tool files

For each of the 30 tools below, add these keys to `public/locales/en/{tool}.json` under the `descriptions` object:

```json
"descriptions": {
  ...existing keys...,
  "faqTitle": "Frequently Asked Questions",
  "faq1Q": "[What is tool-specific Q1]",
  "faq1A": "[What is tool-specific A1]",
  "faq2Q": "[Is this tool secure/free Q2]",
  "faq2A": "[Is this tool secure/free A2]",
  "faq3Q": "[Tool-specific Q3]",
  "faq3A": "[Tool-specific A3]"
}
```

**English FAQ content per tool:**

**json:**

```
faq1Q: "What is JSON formatting?"
faq1A: "JSON formatting transforms raw or minified JSON into a readable, indented structure. This tool supports configurable indentation (2, 4, 8 spaces or tabs), minification, and validation — including JSON5 syntax."
faq2Q: "Is my JSON data sent to a server?"
faq2A: "No. All JSON formatting, validation, and minification happens entirely in your browser. Your data never leaves your device."
faq3Q: "What is the difference between JSON and JSON5?"
faq3A: "JSON5 is a superset of JSON that supports comments, trailing commas, unquoted keys, and more relaxed syntax. This tool can parse and format both standard JSON and JSON5."
```

**base64:**

```
faq1Q: "What is Base64 encoding?"
faq1A: "Base64 is a binary-to-text encoding scheme that represents binary data using 64 ASCII characters (A-Z, a-z, 0-9, +, /). It's commonly used to embed data in URLs, HTML, and JSON."
faq2Q: "Is Base64 encryption?"
faq2A: "No. Base64 is encoding, not encryption. It provides no security — anyone can decode it. Use the Encrypt/Decrypt tool for actual data protection."
faq3Q: "Does Base64 encoding increase file size?"
faq3A: "Yes. Base64 encoding increases data size by approximately 33%. Every 3 bytes of input become 4 characters of output."
```

**jwt:**

```
faq1Q: "What is a JWT?"
faq1A: "JSON Web Token (JWT) is an open standard (RFC 7519) for securely transmitting information between parties as a JSON object. It's commonly used for authentication and information exchange."
faq2Q: "Are JWTs secure for sensitive data?"
faq2A: "JWT payloads are Base64Url-encoded, not encrypted — anyone can read them. Never store sensitive data in a JWT unless you use JWE (JSON Web Encryption). This tool runs entirely in your browser."
faq3Q: "What JWT algorithms are supported?"
faq3A: "This tool supports HS256/384/512 (HMAC), RS256/384/512 (RSA), ES256/384/512 (ECDSA), and PS256/384/512 (RSA-PSS) for signing and verification."
```

**regex:**

```
faq1Q: "What is a regular expression?"
faq1A: "A regular expression (regex) is a sequence of characters that defines a search pattern. It's used for string matching, validation, search-and-replace, and text extraction."
faq2Q: "Can I test regex with flags?"
faq2A: "Yes. This tool supports all standard JavaScript regex flags: g (global), i (case-insensitive), m (multiline), s (dotAll), u (unicode), and y (sticky)."
faq3Q: "What is the Explain mode?"
faq3A: "Explain mode breaks down your regex pattern into human-readable descriptions, showing what each token matches and how quantifiers and groups work."
```

**uuid:**

```
faq1Q: "What is a UUID?"
faq1A: "UUID (Universally Unique Identifier) is a 128-bit identifier standard. This tool generates v4 (random) and v7 (time-ordered) UUIDs that are unique without central coordination."
faq2Q: "How many UUIDs can I generate at once?"
faq2A: "You can generate up to 1,000 UUIDs in a single batch. All generation happens in your browser using crypto.getRandomValues()."
faq3Q: "Should I use UUID v4 or v7?"
faq3A: "Use v4 for general-purpose random IDs. Use v7 for database primary keys or when time-ordering matters — v7 includes a millisecond timestamp prefix for sortable uniqueness."
```

**hashing:**

```
faq1Q: "What is cryptographic hashing?"
faq1A: "Cryptographic hashing converts input data into a fixed-size fingerprint (hash). The same input always produces the same hash, but even a tiny change completely alters the output."
faq2Q: "What hash algorithms are supported?"
faq2A: "This tool supports MD5, SHA-1, SHA-224, SHA-256, SHA-384, SHA-512, SHA3-224/256/384/512, Keccak-224/256/384/512, and RIPEMD-160. HMAC variants are also available."
faq3Q: "Is hashing the same as encryption?"
faq3A: "No. Hashing is one-way — you cannot reverse a hash back to the original input. Encryption is two-way. Hashing is used for verification, not confidentiality."
```

**urlencoder:**

```
faq1Q: "What is URL encoding?"
faq1A: "URL encoding (percent-encoding) converts characters into a format that can be transmitted over the internet. Special characters like spaces, quotes, and non-ASCII are replaced with %XX sequences."
faq2Q: "What encoding modes are available?"
faq2A: "Three modes: Component (encodes all reserved characters), Whole URL (preserves URL structure like ://, ?, &), and Form (space becomes + instead of %20)."
faq3Q: "When should I use URL encoding?"
faq3A: "Use URL encoding when passing data in query parameters, embedding URLs in HTML, or handling special characters in API calls."
```

**unixtime:**

```
faq1Q: "What is a Unix timestamp?"
faq1A: "A Unix timestamp is the number of seconds (or milliseconds) elapsed since January 1, 1970 UTC (the Unix epoch). It's a universal, timezone-independent way to represent time."
faq2Q: "Does this tool handle timezones?"
faq2A: "Yes. The tool shows both UTC and your local timezone. You can convert timestamps to dates in either timezone."
faq3Q: "What is the Unix timestamp range?"
faq3A: "Standard 32-bit signed integers support timestamps up to January 19, 2038 (the Year 2038 problem). This tool supports a much wider range using JavaScript's Date object."
```

**diff:**

```
faq1Q: "What is a text diff tool?"
faq1A: "A diff tool compares two texts and highlights the differences between them. This tool shows additions, deletions, and modifications at the word or character level."
faq2Q: "What diff modes are available?"
faq2A: "Two modes: Side-by-side (shows both texts with differences highlighted) and Inline (shows merged differences in a single view). Both support word-level granularity."
faq3Q: "Is there a file size limit?"
faq3A: "Diff computation runs entirely in your browser using a Web Worker. Performance depends on your device, but texts up to several hundred KB work smoothly."
```

**password:**
Already has 5 FAQ items — skip.

**sshkey:**
Already has 4 FAQ items — skip.

**color:**

```
faq1Q: "What is the Color Tool?"
faq1A: "The Color Tool is a comprehensive color utility that supports HEX, RGB, HSL, and OKLCH color models with a visual picker, conversions, and contrast checking."
faq2Q: "What is OKLCH color space?"
faq2A: "OKLCH is a perceptually uniform color space that better matches human vision than HSL or RGB. It produces more consistent lightness gradients and accessible palettes."
faq3Q: "Can I extract colors from an image?"
faq3A: "Yes. Drag and drop any image onto the palette extraction area to get the dominant colors. You can also simulate color vision deficiencies (protanopia, deuteranopia, tritanopia)."
```

**cron:**

```
faq1Q: "What is a Cron expression?"
faq1A: "A Cron expression is a string of 5-7 fields that defines a schedule for recurring tasks. It's used by cron daemons, job schedulers, and frameworks like Spring and Quartz."
faq2Q: "What Cron dialects are supported?"
faq2A: "Three: Standard (5-field), Spring (6-field with seconds), and Quartz (7-field with seconds and year). The tool auto-detects the dialect and shows next run times."
faq3Q: "How accurate are the next-run predictions?"
faq3A: "Predictions are computed client-side and match standard cron behavior. The tool shows the next 5 scheduled execution times for your expression."
```

**markdown:**

```
faq1Q: "What is the Markdown Editor?"
faq1A: "A live Markdown editor with split-pane preview, supporting GFM (GitHub Flavored Markdown), syntax highlighting, task lists, and Mermaid diagrams."
faq2Q: "Can I export Markdown to PDF?"
faq2A: "Yes. Use the export buttons to save as PDF or PNG. The PDF export respects print styles for clean, formatted output."
faq3Q: "What Markdown extensions are supported?"
faq3A: "GFM tables, task lists, strikethrough, autolinks, and code syntax highlighting for 12+ programming languages including TypeScript, Python, Go, Rust, and SQL."
```

**qrcode:**

```
faq1Q: "What is the QR Code Generator?"
faq1A: "A customizable QR code generator that supports text, URLs, WiFi credentials, and vCards. Add logos, change colors, and export as SVG or PNG."
faq2Q: "What is the maximum QR code capacity?"
faq2A: "Capacity depends on error correction level and data type. Numeric: up to 7,089 characters. Alphanumeric: up to 4,296. Binary: up to 2,953 bytes. Kanji: up to 1,817 characters."
faq3Q: "Can I add a logo to my QR code?"
faq2A: "Yes. Upload a logo image to place it in the center of the QR code. The tool automatically adjusts error correction to maintain scannability."
```

**textcase:**

```
faq1Q: "What text case conversions are available?"
faq1A: "camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case, path/case, Title Case, Sentence case, UPPER CASE, lower case, and more."
faq2Q: "Can I convert multiple strings at once?"
faq2A: "Yes. Paste multiple lines and the tool converts each line independently. Multi-line conversion applies the selected case to every line."
faq3Q: "Does it handle non-ASCII characters?"
faq3A: "Yes. The tool correctly handles Unicode characters including accented letters, CJK characters, and emojis in case conversions."
```

**deduplines:**

```
faq1Q: "What does the Deduplicate Lines tool do?"
faq1A: "It removes duplicate lines from your text while offering options to preserve or remove empty lines, trim whitespace, and sort the output."
faq2Q: "Is the deduplication case-sensitive?"
faq2A: "By default, yes. You can toggle case-insensitive mode to treat 'Hello' and 'hello' as duplicates."
faq3Q: "Can I see what was removed?"
faq2A: "The tool shows the cleaned output and the count of duplicates removed. You can compare input and output to verify the results."
```

**csv:**

```
faq1Q: "What is the CSV Converter?"
faq1A: "A tool to convert CSV data to JSON, Markdown tables, or TSV format and back. It handles quoted fields, custom delimiters, and nested objects."
faq2Q: "What CSV dialects are supported?"
faq2A: "RFC 4180 standard CSV with customizable delimiters (comma, semicolon, tab, pipe). Quoted fields, escaped quotes, and multiline values are all supported."
faq3Q: "Can I flatten nested JSON to CSV?"
faq2A: "Yes. The tool can flatten nested JSON objects into dot-notation columns for CSV export, and unflatten them back."
```

**csv-md:**

```
faq1Q: "What is the CSV to Markdown Table converter?"
faq1A: "A specialized tool that converts CSV data into formatted Markdown tables with alignment options, header rows, and clean pipe-delimited output."
faq2Q: "Can I customize column alignment?"
faq2A: "Yes. Choose left, center, or right alignment per column. The tool generates the correct Markdown alignment syntax."
faq3Q: "Does it support large CSV files?"
faq2A: "Processing happens entirely in your browser. Files up to several MB work well, limited only by your device's memory."
```

**cipher:**

```
faq1Q: "What encryption algorithms are supported?"
faq1A: "AES, DES, Triple DES (3DES), Rabbit, RC4, and RC4Drop — using CryptoJS. AES-256 is recommended for modern security requirements."
faq2Q: "Is my data sent to a server during encryption?"
faq2A: "No. All encryption and decryption happens entirely in your browser using the CryptoJS library. Your data and passphrase never leave your device."
faq3Q: "What is the difference between AES and DES?"
faq2A: "AES supports 128/192/256-bit keys and is the modern standard. DES uses 56-bit keys and is considered insecure. Always prefer AES for new applications."
```

**numbase:**

```
faq1Q: "What number bases are supported?"
faq1A: "Binary (base 2), Octal (base 8), Decimal (base 10), and Hexadecimal (base 16) with real-time conversion across all four."
faq2Q: "Can I edit individual bits?"
faq2A: "Yes. The bit editor shows the binary representation and lets you toggle individual bits, instantly updating all other base conversions."
faq3Q: "Does it support two's complement?"
faq2A: "Yes. The tool can display signed integers in two's complement representation for 8-bit, 16-bit, 32-bit, and 64-bit word sizes."
```

**dbviewer:**

```
faq1Q: "What databases can I view?"
faq1A: "The tool supports SQLite database files (.db, .sqlite, .sqlite3). Open any SQLite file to browse tables, run queries, and export data."
faq2Q: "Is my database uploaded to a server?"
faq2A: "No. The database is loaded into browser memory using sql.js (SQLite compiled to WebAssembly). All operations happen locally."
faq3Q: "What SQL features are supported?"
faq2A: "Full SQLite SQL syntax including SELECT, INSERT, UPDATE, DELETE, JOINs, subqueries, aggregations, and transactions. The editor provides autocomplete for table and column names."
```

**checksum:**

```
faq1Q: "What is a file checksum?"
faq1A: "A checksum is a hash value computed from file contents. It's used to verify file integrity — if even one byte changes, the checksum changes completely."
faq2Q: "What hash algorithms are available?"
faq2A: "MD5, SHA-1, SHA-256, SHA-384, SHA-512, SHA3-256, SHA3-512, and CRC32. Multiple algorithms can run simultaneously on the same file."
faq3Q: "Is there a file size limit?"
faq2A: "No hard limit. The tool processes files in chunks using the HTML5 File API, supporting unlimited file sizes limited only by your device's memory."
```

**storageunit:**

```
faq1Q: "What storage units can I convert?"
faq1A: "Bits, Bytes, KB, MB, GB, TB, and PB. The tool supports both decimal (1 KB = 1000 bytes) and binary (1 KiB = 1024 bytes) standards."
faq2Q: "Why are there two conversion standards?"
faq2A: "Decimal (SI) uses powers of 1000 and is used by storage manufacturers. Binary (IEC) uses powers of 1024 and is what operating systems typically report."
faq3Q: "What is the difference between KB and KiB?"
faq2A: "KB (kilobyte) = 1000 bytes. KiB (kibibyte) = 1024 bytes. The IEC introduced KiB/MiB/GiB to disambiguate, but KB/MB/GB are still commonly used for both."
```

**httpstatus:**

```
faq1Q: "What are HTTP status codes?"
faq1A: "HTTP status codes are 3-digit numbers returned by a server in response to a client request. They indicate whether the request was successful, redirected, or encountered an error."
faq2Q: "How many status codes are documented?"
faq2A: "The tool covers all standard status codes across 5 categories: 1xx (Informational), 2xx (Success), 3xx (Redirection), 4xx (Client Error), and 5xx (Server Error)."
faq3Q: "Can I search for specific codes?"
faq2A: "Yes. Search by code number, phrase, or category to quickly find the status code you need."
```

**yaml:**

```
faq1Q: "What is YAML?"
faq1A: "YAML (YAML Ain't Markup Language) is a human-readable data serialization format commonly used for configuration files, CI/CD pipelines, and data exchange."
faq2Q: "Can I convert YAML to JSON?"
faq2A: "Yes. This tool supports YAML-to-JSON and JSON-to-YAML conversion with support for multi-document YAML streams (--- separators)."
faq3Q: "Does it support YAML anchors and aliases?"
faq2A: "The parser handles standard YAML including anchors (&) and aliases (*). Complex features like merge keys (<<:) are supported where applicable."
```

**image:**

```
faq1Q: "What can I do with the Image Tool?"
faq1A: "Resize, compress, and convert images directly in your browser. Supports JPEG, PNG, WebP, and BMP formats with adjustable quality and dimensions."
faq2Q: "Are my images uploaded to a server?"
faq2A: "No. All image processing happens in your browser using the Canvas API. Your images never leave your device."
faq3Q: "What image formats are supported?"
faq2A: "Input: JPEG, PNG, WebP, BMP, GIF. Output: JPEG, PNG, WebP. You can convert between formats while adjusting quality."
```

**htmlcode:**

```
faq1Q: "What are HTML character entities?"
faq1A: "HTML entities are special codes (like &amp; for &) used to represent characters that have special meaning in HTML or cannot be typed directly."
faq2Q: "How many entities are documented?"
faq2A: "The tool provides a complete reference of HTML special characters including named entities (&amp;), decimal (&#38;), and hexadecimal (&#x26;) codes."
faq3Q: "Can I search for specific characters?"
faq2A: "Yes. Search by character name, entity name, or code point to quickly find the HTML entity you need."
```

**ascii:**

```
faq1Q: "What is ASCII?"
faq1A: "ASCII (American Standard Code for Information Interchange) is a 7-bit character encoding standard covering 128 characters: English letters, digits, punctuation, and control codes."
faq2Q: "What control characters are included?"
faq2A: "All 33 control codes (0-31 and 127) including NUL, TAB, LF, CR, ESC, and DEL, with descriptions of their original teletype functions."
faq3Q: "How is ASCII different from Unicode?"
faq2A: "ASCII covers 128 characters for English. Unicode extends this to over 140,000 characters covering virtually all writing systems. ASCII is a subset of Unicode (the first 128 code points match)."
```

**extractor:**

```
faq1Q: "What does the Text Extractor do?"
faq1A: "Extracts specific patterns from text using regex-based extractors: emails, URLs, IP addresses, phone numbers, numbers, and custom patterns."
faq2Q: "Can I define custom extraction patterns?"
faq2A: "Yes. Write your own regex pattern to extract any text format. The tool highlights matches and shows capture groups."
faq3Q: "What built-in patterns are available?"
faq2A: "Email addresses, URLs, IPv4/IPv6 addresses, phone numbers, hex colors, numbers, and dates. Each pattern is pre-configured for common use cases."
```

**wordcounter:**

```
faq1Q: "How does the word count work?"
faq1A: "The tool splits text by whitespace and counts tokens. For CJK text (Chinese, Japanese, Korean), it counts individual characters separately."
faq2Q: "What metrics are shown?"
faq2A: "Words, characters, characters without spaces, sentences, paragraphs, CJK characters, reading time, and speaking time — all updated in real-time as you type."
faq3Q: "Can I track specific keywords?"
faq2A: "Yes. Add custom keywords to track their frequency and count across your text. The Keywords tab shows the top words and 2-word phrases."
```

**httpclient:**

```
faq1Q: "What is the HTTP Client tool?"
faq1A: "A browser-based HTTP client for testing APIs. Send GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS requests with custom headers, query parameters, and request bodies."
faq2Q: "Can I use authentication?"
faq2A: "Yes. Supports Basic Auth, Bearer tokens, API keys (header and query), and custom authentication headers. All credentials stay in your browser."
faq3Q: "Does it support request history?"
faq2A: "Yes. All requests are saved to local storage with full request/response details. You can bookmark frequently used requests for quick access."
```

**json (extra from Description — also add FAQ):**
Already listed above in the json FAQ section.

**hashing (extra — also add FAQ):**
Already listed above in the hashing FAQ section.

### Step 2b: Translate FAQ to other 9 locales

For each of the 30 tools, translate the 6 FAQ keys into all 9 non-English locales.

### Step 2c: Add FAQ UI to all 30 tool page components

For each tool, add a FAQ section after the existing Description content. Follow the pattern from password/sshkey:

```tsx
import { CircleHelp } from "lucide-react";
import { Accordion } from "../../../components/ui/accordion";

// Inside Description function or as a separate section:
const faqItems = [1, 2, 3].map((i) => ({
  title: t(`descriptions.faq${i}Q`),
  content: <p>{t(`descriptions.faq${i}A`)}</p>,
}));

// JSX:
<div className="mt-8">
  <div className="flex items-center gap-2 mb-4">
    <CircleHelp size={16} className="text-accent-cyan shrink-0" aria-hidden="true" />
    <h2 className="font-semibold text-fg-primary text-base text-pretty">
      {t("descriptions.faqTitle")}
    </h2>
  </div>
  <Accordion items={faqItems} />
</div>;
```

**For tools that already have a Description function** (27 tools): Add the FAQ section inside the existing `Description` function, after existing content.

**For the 5 tools that got new Description in Task 1**: The FAQ section goes after the `whatIs` paragraphs within the same `Description` function.

- [ ] **Step 2d: Commit**

```bash
git add app/\[locale\]/*/\*-page.tsx public/locales/*/
git commit -m "feat(content): add FAQ sections to all 30 tools without existing FAQ"
```

---

## Task 3: Add FAQ Schema to Tool page.tsx Files

**Files:**

- Modify: All 32 tool `page.tsx` files (add `faqItems` to `buildToolSchemas` call)

**Depends on:** Plan 1 (buildToolSchemas already deployed)

### Step 3a: Update page.tsx for tools with NEW FAQ (30 tools)

For each of the 30 tools that got new FAQ in Task 2, update the `page.tsx` to pass `faqItems` to `buildToolSchemas`:

```tsx
export default async function XxxRoute() {
  const t = await getTranslations({ namespace: "tools" });
  const tx = await getTranslations({ namespace: "xxx" }); // tool-specific namespace
  const schemas = buildToolSchemas({
    name: t("xxx.title"),
    description: t("xxx.description"),
    path: PATH,
    faqItems: [1, 2, 3].map((i) => ({
      q: tx(`descriptions.faq${i}Q`),
      a: tx(`descriptions.faq${i}A`),
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
      <XxxPage />
    </>
  );
}
```

**Note:** `password/page.tsx`, `sshkey/page.tsx`, and `base64/page.tsx` already have FAQ/HowTo schema from Plan 1 Task 5 — no change needed.

### Step 3b: Commit

```bash
git add app/\[locale\]/*/page.tsx
git commit -m "feat(schema): add FAQPage schema to all tool pages with FAQ content"
```

---

## Task 4: Homepage Enhancement

**Files:**

- Modify: `components/json-ld.tsx` (add `buildOrganizationSchema`)
- Modify: `app/[locale]/layout.tsx` (inject Organization schema)
- Modify: `app/[locale]/page.tsx` (add Organization + FAQPage schema)
- Modify: `app/[locale]/home-page.tsx` (add brand description + tool count + FAQ)
- Modify: `public/locales/*/home.json` (10 files — add new content keys)

### Step 4a: Add buildOrganizationSchema to json-ld.tsx

In `components/json-ld.tsx`, add:

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

### Step 4b: Inject Organization schema in layout.tsx

In `app/[locale]/layout.tsx`, add the Organization schema alongside the existing WebsiteJsonLd:

```tsx
import { WebsiteJsonLd, buildOrganizationSchema } from "../../components/json-ld";

// In the <head> section, after <WebsiteJsonLd />:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationSchema()) }}
/>;
```

### Step 4c: Add homepage content translations

In `public/locales/en/home.json`, add:

```json
"brandDescription": "OmniKit is a collection of 32+ free, browser-based developer tools. No sign-up, no tracking — all processing happens locally in your browser.",
"toolCount": "32+ free developer tools",
"faqTitle": "Frequently Asked Questions",
"faq1Q": "What is OmniKit?",
"faq1A": "OmniKit is a free collection of browser-based developer tools including JSON formatter, Base64 encoder, password generator, hash calculator, and more. All tools run entirely in your browser with no data sent to servers.",
"faq2Q": "Is OmniKit free to use?",
"faq2A": "Yes, all tools are completely free with no sign-up required. OmniKit is open source and will remain free forever.",
"faq3Q": "Is my data safe?",
"faq3A": "All processing happens entirely in your browser using client-side JavaScript. No data is ever sent to any server. Your files and text never leave your device.",
"faq4Q": "Do I need to install anything?",
"faq4A": "No installation needed. OmniKit works in any modern browser and can be installed as a Progressive Web App (PWA) for quick access."
```

Translate to other 9 locales following AGENTS.md Translation Workflow.

### Step 4d: Add homepage content UI to home-page.tsx

In `app/[locale]/home-page.tsx`, add the following sections after the tool grid (inside `<Layout>`):

1. **Brand description** — after the CategorySections or ViewAll grid:

```tsx
<section className="mt-16 mx-auto max-w-3xl text-center">
  <h2 className="text-lg font-semibold text-fg-primary">{tHome("toolCount")}</h2>
  <p className="mt-3 text-sm text-fg-secondary leading-relaxed">{tHome("brandDescription")}</p>
</section>
```

2. **FAQ section** — after brand description:

```tsx
<section className="mt-12 mx-auto max-w-3xl">
  <div className="flex items-center gap-2 mb-4">
    <CircleHelp size={16} className="text-accent-cyan shrink-0" aria-hidden="true" />
    <h2 className="font-semibold text-fg-primary text-base">{tHome("faqTitle")}</h2>
  </div>
  <Accordion
    items={[1, 2, 3, 4].map((i) => ({
      title: tHome(`faq${i}Q`),
      content: <p>{tHome(`faq${i}A`)}</p>,
    }))}
  />
</section>
```

Required imports:

```tsx
import { CircleHelp } from "lucide-react";
import { Accordion } from "../../components/ui/accordion";
```

### Step 4e: Add FAQPage schema to homepage page.tsx

In `app/[locale]/page.tsx`:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../libs/seo";
import { buildToolSchemas } from "../../components/json-ld";
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

export default async function HomeRoute() {
  const t = await getTranslations({ namespace: "home" });
  const schemas = buildToolSchemas({
    name: t("title"),
    description: t("metaDescription"),
    path: PATH || "/",
    faqItems: [1, 2, 3, 4].map((i) => ({
      q: t(`faq${i}Q`),
      a: t(`faq${i}A`),
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
      <HomeClient />
    </>
  );
}
```

### Step 4f: Commit

```bash
git add components/json-ld.tsx app/\[locale\]/layout.tsx app/\[locale\]/page.tsx app/\[locale\]/home-page.tsx public/locales/*/home.json
git commit -m "feat(homepage): add Organization schema, brand description, and FAQ section"
```

---

## Task 5: Run Lint and Full Test Suite

- [ ] **Step 5a: Run ESLint**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 5b: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 5c: Run build**

Run: `npm run build`
Expected: Build completes without errors.

- [ ] **Step 5d: Visual verification**

Run: `npm run dev`

- Visit `/wordcounter` → verify Description + FAQ render
- Visit `/dbviewer` → verify Description + FAQ render
- Visit `/` → verify brand description, tool count, and FAQ section render
- View page source on `/` → verify Organization + WebApplication + BreadcrumbList + FAQPage schemas
