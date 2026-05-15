# OmniKit

English | [简体中文](./README.zh-CN.md)

A collection of browser-based developer utilities, built with [Next.js](https://nextjs.org/).

## Tools

| Tool                          | Description                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| JSON Format / Compress        | Format, minify, and validate JSON/JSON5 with configurable indentation                                               |
| SQL Formatter                 | Format & minify SQL queries, syntax highlighting, multi-dialect                                                     |
| Regex Tester                  | Regex pattern testing with real-time matching, presets, and explain mode                                            |
| Text Diff                     | Side-by-side or inline text comparison with word-level highlights, Web Worker powered                               |
| Markdown Editor               | Live preview with GFM support, syntax highlighting, export to PDF/PNG                                               |
| Text Case Converter           | camelCase, PascalCase, snake_case, kebab-case, and more text format conversions                                     |
| Email / URL / Phone Extractor | Extract emails, URLs, and phone numbers from text, deduplicated with export                                         |
| Word Counter                  | Word/char/sentence count, reading time, keyword density                                                             |
| Token Counter                 | OpenAI GPT token count (o200k_base), BPE tokenization visualization                                                 |
| Deduplicate Lines             | Remove duplicate lines with case sensitivity, whitespace trim, empty line removal                                   |
| Base64 Encode/Decode          | Base64 encoding & decoding, Basic Authentication header generation                                                  |
| URL Encoder/Decoder           | URL encoding & decoding with Component, Whole URL, and Form modes                                                   |
| JSON to TypeScript            | Convert JSON/JSON5 to TypeScript interfaces & type definitions                                                      |
| CSV Converter                 | CSV ↔ JSON format conversion, nested objects, custom delimiters                                                     |
| CSV / Markdown Table          | CSV ↔ Markdown Table bidirectional conversion                                                                       |
| Number Base Converter         | BIN/OCT/DEC/HEX conversion, two's complement, bit editor                                                            |
| JSON / YAML Converter         | JSON ↔ YAML conversion, YAML 1.2 support, multi-document                                                            |
| Storage Unit Conversion       | Byte, KB, MB, GB, TB, PB conversion (SI & IEC)                                                                      |
| CSS Unit Converter            | px/rem/em/vw/vh conversion, batch CSS code conversion                                                               |
| JWT                           | Encode, decode, and verify JSON Web Tokens (HS/RS/ES/PS 256/384/512)                                                |
| Text Hashing                  | MD5, SHA-1/224/256/384/512, SHA3 family, Keccak, RIPEMD-160                                                         |
| Password Generator            | Secure, random, memorable password generation with strength check                                                   |
| SSH Key Generator             | Generate RSA & Ed25519 key pairs, passphrase, fingerprint                                                           |
| HD Wallet                     | BIP39 mnemonic & multi-chain address derivation (EVM, BTC, SOL, TRX, ATOM)                                          |
| Text Encrypt/Decrypt          | AES, DES, Triple DES, Rabbit, RC4, RC4Drop                                                                          |
| File Checksum                 | Unlimited files, unlimited file size                                                                                |
| UUID Generator                | UUID v1/v3/v4/v5/v7 generation (RFC 4122/9562)                                                                      |
| Cron                          | Build and decode Cron expressions (Standard, Spring, Quartz) with next-run preview                                  |
| Unix Timestamp                | Convert between Unix timestamps and dates with live clock, supports seconds & milliseconds                          |
| QR Code Generator             | Customizable QR code generation with logo overlay, SVG/PNG export                                                   |
| Color Tool                    | Color picker, multi-format conversion (HEX/RGB/HSL/OKLCH), image palette, contrast checker, color vision simulation |
| Image Resizer                 | Resize images by percentage or custom dimensions                                                                    |
| Image Compressor              | Compress images with adjustable quality, drag-to-compare preview                                                    |
| Image Converter               | Convert images between PNG, JPG, and WebP formats                                                                   |
| HTTP Status Codes             | HTTP status code reference with categories, search, and spec links                                                  |
| HTTP Client                   | REST API tester, GET/POST/PUT/DELETE with headers, body, auth                                                       |
| DB Viewer                     | SQLite database viewer with SQL editor, autocomplete, and CSV/JSON export                                           |
| ASCII Table                   | Complete ASCII reference with hex, octal, HTML, decimal conversions                                                 |
| HTML Code                     | HTML special characters and entity reference                                                                        |
| BIP39 Word List               | Complete BIP39 mnemonic word list (2048 words) with search                                                          |
| Subnet Calculator             | IPv4/IPv6 CIDR calculator, subnet splitter, VLSM allocator                                                          |

All operations run entirely in the browser — no data is sent to any server.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **i18n**: next-intl (en, zh-CN, zh-TW, ja, ko, es, pt-BR, fr, de, ru)
- **Crypto**: CryptoJS, jose (JWT), @noble/ed25519, @noble/hashes, @noble/secp256k1
- **PWA**: Serwist (Service Worker)
- **Editor**: CodeMirror 6 (SQL editor in DB Viewer)
- **Markdown**: markdown-it, mermaid, PrismJS
- **Database**: sql.js (client-side SQLite)
- **Diff**: diff (text comparison with Web Workers)
- **Color**: colord, react-colorful, colorthief
- **QR Code**: qr-code-styling
- **CSV**: papaparse
- **Search**: fuzzysort (fuzzy tool search)
- **Screenshot**: modern-screenshot (Markdown PDF/PNG export)
- **Analytics**: @vercel/analytics, @vercel/speed-insights
- **UI Components**: Headless UI, Lucide Icons, rc-slider, @tanstack/react-virtual

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                  | Description                          |
| ------------------------ | ------------------------------------ |
| `npm run dev`            | Start development server             |
| `npm run build`          | Production build                     |
| `npm run start`          | Start production server              |
| `npm run prepare`        | Install Git hooks (Husky)            |
| `npm run test`           | Run tests (Vitest)                   |
| `npm run test:watch`     | Run tests in watch mode              |
| `npm run test:a11y`      | Run accessibility tests (jsdom)      |
| `npm run icons:generate` | Generate PWA icons from source image |
| `npm run typecheck:sw`   | Type-check Service Worker code       |

## Project Structure

```
app/[locale]/       # Pages (one directory per tool)
  json/             # JSON formatter/compressor
  sqlformat/        # SQL formatter
  regex/            # Regex tester
  diff/             # Text diff comparison
  markdown/         # Markdown editor & preview
  textcase/         # Text case converter
  extractor/        # Email/URL/phone extractor
  wordcounter/      # Word counter
  token-counter/    # GPT token counter
  deduplines/       # Deduplicate lines
  base64/           # Base64 encode/decode
  urlencoder/       # URL encode/decode
  jsonts/           # JSON to TypeScript
  csv/              # CSV converter
  csv-md/           # CSV / Markdown table converter
  numbase/          # Number base converter
  yaml/             # JSON / YAML converter
  storageunit/      # Storage unit converter
  cssunit/          # CSS unit converter
  jwt/              # JWT debugger
  hashing/          # Text hashing
  password/         # Password generator
  sshkey/           # SSH key generator
  wallet/           # HD wallet
  cipher/           # Text encrypt/decrypt
  checksum/         # File checksum
  uuid/             # UUID generator
  cron/             # Cron expression builder
  unixtime/         # Unix timestamp converter
  qrcode/           # QR code generator
  color/            # Color tool
  image-resize/      # Image resizer
  image-compress/    # Image compressor
  image-convert/     # Image converter
  httpstatus/       # HTTP status codes
  httpclient/       # HTTP client
  dbviewer/         # SQLite database viewer
  ascii/            # ASCII table
  htmlcode/         # HTML entity reference
  bip39/            # BIP39 word list
  subnet/           # Subnet calculator
  text-processing/     # Text Processing category page
  encoding-conversion/ # Encoding & Conversion category page
  security-crypto/     # Security & Crypto category page
  generators/          # Generators category page
  visual-media/        # Visual & Media category page
  reference-lookup/    # Reference & Lookup category page
app/serwist/        # Serwist PWA runtime caching routes
components/         # Shared UI components
  ui/               # Reusable primitives (Button, Card, Tabs, etc.)
  color/            # Color-specific components (ColorPicker, etc.)
  httpclient/       # HTTP Client domain components (KeyValueEditor)
hooks/              # Custom React hooks
libs/               # Business logic (per-tool modules in subdirectories)
utils/              # Pure utility functions
i18n/               # Internationalization config & routing
styles/             # Global styles (PrismJS theme)
scripts/            # Build & generation scripts
public/locales/     # Translation files (en, zh-CN, zh-TW, ja, ko, es, pt-BR, fr, de, ru)
```

## i18n

Supports 10 locales:

| Locale         | Code    | URL             |
| -------------- | ------- | --------------- |
| English        | `en`    | `/` (no prefix) |
| 简体中文       | `zh-CN` | `/zh-CN`        |
| 繁體中文       | `zh-TW` | `/zh-TW`        |
| 日本語         | `ja`    | `/ja`           |
| 한국어         | `ko`    | `/ko`           |
| Español        | `es`    | `/es`           |
| Português (BR) | `pt-BR` | `/pt-BR`        |
| Français       | `fr`    | `/fr`           |
| Deutsch        | `de`    | `/de`           |
| Русский        | `ru`    | `/ru`           |

Locale prefix is `as-needed` — the default locale has no prefix in the URL.
