# OmniKit

A collection of browser-based developer utilities, built with [Next.js](https://nextjs.org/).

## Tools

| Tool                    | Description                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| JSON Format / Compress  | Format, minify, and validate JSON/JSON5 with configurable indentation                      |
| Base64 Encode/Decode    | Base64 encoding & decoding, Basic Authentication header generation                         |
| JWT                     | Encode, decode, and verify JSON Web Tokens (HS/RS/ES/PS 256/384/512)                       |
| URL Encoder/Decoder     | URL encoding & decoding with Component, Whole URL, and Form modes                          |
| UUID Generator          | UUID v1/v3/v4/v5/v7 generation (RFC 4122/9562)                                             |
| Text Diff               | Side-by-side or inline text comparison with word-level highlights, Web Worker powered      |
| Text Hashing            | MD5, SHA-1/224/256/384/512, SHA3 family, Keccak, RIPEMD-160                                |
| Password Generator      | Secure, random, memorable password generation                                              |
| Text Encrypt/Decrypt    | AES, DES, Triple DES, Rabbit, RC4, RC4Drop                                                 |
| Cron                    | Build and decode Cron expressions (Standard, Spring, Quartz) with next-run preview         |
| Unix Timestamp          | Convert between Unix timestamps and dates with live clock, supports seconds & milliseconds |
| Markdown Editor         | Live preview with GFM support, syntax highlighting, export to PDF/PNG                      |
| DB Viewer               | SQLite database viewer with SQL editor, autocomplete, and CSV/JSON export                  |
| File Checksum           | Unlimited files, unlimited file size                                                       |
| Storage Unit Conversion | Byte, kilobyte, megabyte, terabyte, petabyte and more                                      |
| ASCII Table             | Complete ASCII reference with hex, octal, HTML, decimal conversions                        |
| HTML Code               | HTML special characters and entity reference                                               |

All operations run entirely in the browser — no data is sent to any server.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **i18n**: next-intl (English, 简体中文, 繁體中文)
- **Crypto**: CryptoJS, jose (JWT)
- **PWA**: Serwist (Service Worker)
- **Editor**: CodeMirror 6 (SQL editor in DB Viewer)
- **Markdown**: markdown-it, mermaid, PrismJS
- **Database**: sql.js (client-side SQLite)
- **Diff**: diff (text comparison with Web Workers)
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
| `npm run icons:generate` | Generate PWA icons from source image |
| `npm run typecheck:sw`   | Type-check Service Worker code       |

## Project Structure

```
app/[locale]/       # Pages (one directory per tool)
  json/             # JSON formatter/compressor
  base64/           # Base64 encode/decode
  jwt/              # JWT debugger
  urlencoder/       # URL encode/decode
  uuid/             # UUID generator
  diff/             # Text diff comparison
  hashing/          # Text hashing
  password/         # Password generator
  cipher/           # Text encrypt/decrypt
  cron/             # Cron expression builder
  unixtime/         # Unix timestamp converter
  markdown/         # Markdown editor & preview
  dbviewer/         # SQLite database viewer
  checksum/         # File checksum
  storageunit/      # Storage unit converter
  ascii/            # ASCII table
  htmlcode/         # HTML entity reference
app/serwist/        # Serwist PWA runtime caching routes
components/         # Shared UI components
  ui/               # Reusable primitives (Button, Card, Tabs, etc.)
hooks/              # Custom React hooks (useFullscreen, useIsMobile)
libs/               # Business logic (per-tool modules in subdirectories)
utils/              # Pure utility functions
i18n/               # Internationalization config & routing
styles/             # Global styles (PrismJS theme)
scripts/            # Build & generation scripts
public/locales/     # Translation files (en, zh-CN, zh-TW)
```

## i18n

Supports three locales:

- `en` — English (default)
- `zh-CN` — 简体中文
- `zh-TW` — 繁體中文

Locale prefix is `as-needed` — the default locale has no prefix in the URL.
