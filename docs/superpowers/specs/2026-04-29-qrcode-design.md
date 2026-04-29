# QR Code Generator — Design Spec

## Overview

Add a QR Code generation tool to OmniKit at route `/qrcode`. Users can encode text, URLs, WiFi credentials, vCard contacts, email addresses, and SMS messages into styled QR codes with customizable appearance. All processing is client-side.

## Scope

- **In scope**: QR code generation with 5 content types, advanced visual styling, SVG/PNG/clipboard export
- **Out of scope**: QR code decoding/scanning, camera integration, barcode generation

## Technical Decision

**Library**: `qr-code-styling` (single dependency)

| Considered             | Rejected because                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `qrcode` (node-qrcode) | No built-in styling (colors, logo, gradients); would require custom Canvas drawing |
| `qrcode.react`         | No logo embedding, no gradient support, no rounded dots                            |

`qr-code-styling` provides SVG/PNG export, dot style customization, logo embedding, gradient fills, and corner styling out of the box.

## File Structure

```
app/[locale]/qrcode/
  page.tsx              # Route entry (generateMetadata + renders QrCodePage), pattern matches uuid/page.tsx
  qrcode-page.tsx       # Main page component (single file, internal sub-components — matches uuid-page.tsx convention)

libs/qrcode/
  types.ts              # ContentType, payload interfaces, StylingOptions
  encode.ts             # buildContent(payload) + per-type escape helpers (escapeWifi, escapeVcard, encodeMailto, encodeSms)
  styling.ts            # createQrCode() factory, DEFAULT_OPTIONS preset, capacity-table helpers
  capacity.ts           # Approximate capacity table (chars-per-EC-level for byte/numeric/alphanumeric modes)

public/locales/
  en/qrcode.json        # English translations
  zh-CN/qrcode.json     # Simplified Chinese translations
  zh-TW/qrcode.json     # Traditional Chinese translations
```

### Tool Registration

1. Add `{ key: "qrcode", path: "/qrcode" }` to `libs/tools.ts` TOOLS array.
2. Add the following keys to `public/locales/{en,zh-CN,zh-TW}/tools.json`:
   ```json
   "qrcode": {
     "title": "QR Code Generator - Free Online Tool",
     "shortTitle": "QR Code Generator",
     "description": "Generate styled QR codes for text, URLs, WiFi, vCard, email, and SMS. Custom colors, logos, and dot styles. 100% client-side."
   }
   ```
3. Lucide icon for the tool card and route: **`QrCode`** (already shipped with `lucide-react`).
4. Add storage key `qrcode: "okrun:qrcode"` to `libs/storage-keys.ts` for persisting the user's last styling choices (see Persistence below).

## Content Types

### Supported Types and Encoding

The Encoding Format column shows the **template** — values inside `{...}` are placeholders that go through the type-specific escape function from the next section before substitution.

| Type         | UI Fields                                                    | Encoding Format                                                                                                                                                                                                               |
| ------------ | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Text/URL** | Single textarea                                              | Raw text passed directly                                                                                                                                                                                                      |
| **WiFi**     | SSID, password, encryption (WPA/WEP/nopass), hidden checkbox | `WIFI:T:{encryption};S:{ssid};P:{password};H:true;;` — `H:` segment is **omitted entirely** when `hidden=false`. `P:` segment is **omitted** when `encryption=nopass`.                                                        |
| **vCard**    | First name, last name, phone, email, org, URL, address       | `BEGIN:VCARD\nVERSION:3.0\nN:{last};{first}\nFN:{first} {last}\nTEL:{phone}\nEMAIL:{email}\nORG:{org}\nURL:{url}\nADR:;;{address};;;;\nEND:VCARD` — empty optional lines (e.g. `TEL:`) **omitted** rather than emitted blank. |
| **Email**    | To, subject, body                                            | `mailto:{to}?subject={subject}&body={body}` — `?` and trailing params **omitted** when both `subject` and `body` empty.                                                                                                       |
| **SMS**      | Phone number, message                                        | `SMSTO:{phone}:{message}` — emit uppercase `SMSTO:` (most widely supported across iOS 17+, Android, and ZXing-based scanners).                                                                                                |

### Escape Rules (Critical for Scannability)

Naive string concatenation will break scanning when user input contains reserved characters. `libs/qrcode/encode.ts` MUST apply the following escapes before assembling the payload:

| Type      | Reserved chars in fields              | Escape rule                                                                                                                                                                                                |
| --------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **WiFi**  | `\` `;` `,` `:` `"` in SSID, password | Prefix each with `\` (per Wi-Fi Alliance "WPA QR Code" spec). `escapeWifi(s)` → `s.replace(/([\\;,":])/g, '\\$1')`. Apply to `ssid` and `password` only.                                                   |
| **vCard** | `\` `\n` `,` `;` in any field         | `escapeVcard(s)` → `s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')`. Order matters: backslash first.                                                             |
| **Email** | All chars in `subject`, `body`        | `encodeURIComponent` on `subject` and `body`. `to` left unescaped (must be a valid email address; validate with `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).                                                           |
| **SMS**   | All chars in `message`                | `encodeURIComponent` on `message`. `phone` stripped to `[+\d]` characters before insertion. Emit uppercase `SMSTO:` prefix (per ZXing convention; works on iOS 17+, Android, and major scanner libraries). |
| **Text**  | None                                  | Passed through verbatim. No escaping.                                                                                                                                                                      |

### Field Validation

Required fields per type (export buttons disabled if any required field empty):

| Type      | Required                                        | Optional          |
| --------- | ----------------------------------------------- | ----------------- |
| **Text**  | `content`                                       | —                 |
| **WiFi**  | `ssid`. `password` required unless `nopass`     | `hidden`          |
| **vCard** | At least one of: `firstName`, `lastName`, `org` | All other fields  |
| **Email** | `to` (must match email regex)                   | `subject`, `body` |
| **SMS**   | `phone` (≥3 digits after stripping)             | `message`         |

### Type System (`libs/qrcode/types.ts`)

```typescript
type ContentType = "text" | "wifi" | "vcard" | "email" | "sms";

interface TextPayload {
  type: "text";
  content: string;
}

interface WifiPayload {
  type: "wifi";
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
  hidden: boolean;
}

interface VCardPayload {
  type: "vcard";
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  org: string;
  url: string;
  address: string;
}

interface EmailPayload {
  type: "email";
  to: string;
  subject: string;
  body: string;
}

interface SmsPayload {
  type: "sms";
  phone: string;
  message: string;
}

type QrPayload = TextPayload | WifiPayload | VCardPayload | EmailPayload | SmsPayload;

interface StylingOptions {
  foregroundColor: string; // mapped to dotsOptions.color + cornersSquareOptions.color + cornersDotOptions.color
  backgroundColor: string; // mapped to backgroundOptions.color
  dotStyle: "square" | "rounded" | "dots" | "classy" | "classy-rounded";
  errorCorrection: "L" | "M" | "Q" | "H";
  size: number; // 128-512
  margin: number; // quiet-zone padding in px (default 10) — required for reliable scanning
  logo?: {
    dataUrl: string; // base64 data URL stored in state (NOT a blob URL — survives re-renders)
    size: number; // 0.2–0.5, fraction of QR size; default 0.4
    margin: number; // px around logo; default 4
    hideBackgroundDots: boolean; // default true (cleaner look, requires EC ≥ Q)
  };
}

// The factory function in styling.ts maps StylingOptions to qr-code-styling's nested format:
// foregroundColor → dotsOptions.color, cornersSquareOptions.color, cornersDotOptions.color
// backgroundColor → backgroundOptions.color
// dotStyle → dotsOptions.type
// errorCorrection → qrOptions.errorCorrectionLevel
// size → width, height
// margin → margin (top-level option for quiet zone)
// logo.dataUrl → image
// logo.size → imageOptions.imageSize
// logo.margin → imageOptions.margin
// logo.hideBackgroundDots → imageOptions.hideBackgroundDots
// imageOptions.crossOrigin defaults to "anonymous"
```

## Page UI Layout

### Component Structure

All sub-components live **inside `qrcode-page.tsx`** as internal function components (matches `uuid-page.tsx` convention — single-file tools keep navigation simple). No separate files under `app/[locale]/qrcode/` other than `page.tsx` and `qrcode-page.tsx`.

```
QrCodePage  (default export)
├── PrivacyBanner          — reuses uuid pattern: <Lock/> + border-l-2 border-accent-cyan + i18n key "localGenerated"
├── ContentTypeSelector    — pill buttons: Text | WiFi | vCard | Email | SMS
├── ContentForm            — switches fields based on active type
├── QrPreview              — live QR rendering + export buttons
├── StyleConfig            — collapsible panel
└── Description            — help section explaining QR code basics + per-type tips (matches uuid Description pattern)
```

### Content Input Area (left on desktop, top on mobile)

- **Type selector**: Horizontal pill button row (same pattern as UUID version selector). Active type highlighted with `bg-accent-cyan text-bg-base shadow-glow`.
- **Form fields**: Each content type renders its own set of fields using existing UI components from `components/ui/input.tsx`: `StyledTextarea`, `StyledInput`, `StyledSelect`, `StyledCheckbox`.
- **WiFi password field**: `type="password"` by default with eye-toggle button (`Eye` / `EyeOff` from lucide-react) to reveal. Disabled & emptied when encryption set to `nopass`.
- Content changes trigger QR update via debounce (**300ms** for content fields, **150ms** for color pickers and slider — see Update Flow below).

### QR Preview Area (right on desktop, below form on mobile)

- `qr-code-styling` instance mounted to a `<div ref={qrRef}>`.
- Real-time rendering updates when content or styling changes.
- **Initial state on mount**: before the user touches any field, the preview shows a seeded QR for `https://omnikit.run` so the page is never blank (mirrors UUID page's "auto-generate one on mount"). Tracked via a `userHasInteracted` flag.
- **Empty-required-fields state**: once `userHasInteracted === true`, if the active type's required fields are unmet, the preview area replaces the QR with a muted placeholder (`<QrCode/>` icon + i18n `preview.empty` text). Export buttons disabled.
- Export button row below preview:
  - **SVG Download**: `qrCode.download({ name: "qrcode", extension: "svg" })`
  - **PNG Download**: `qrCode.download({ name: "qrcode", extension: "png" })`
  - **Copy to Clipboard**: `qrCode.getRawData("png")` → `ClipboardItem` → `navigator.clipboard.write([item])`
- All export buttons disabled when required fields are empty.

### Style Configuration Panel (below preview, collapsible)

- **Error correction**: L / M / Q / H pill buttons (default: **Q** — robust against minor print damage and works with small logos out of the box; auto-bumped to **H** when a logo is uploaded — see Logo & EC Coupling below).
- **Foreground color**: `<input type="color">` (default: `#000000`).
- **Background color**: `<input type="color">` (default: `#ffffff`).
- **Dot style**: 5 presets in pill buttons — square, rounded, dots, classy, classy-rounded (default: **rounded**).
- **Size slider**: `rc-slider` from 128 to 512, step 16 (default: **300**). Same styling as UUID quantity slider.
- **Margin (quiet zone) slider**: 0 to 40 px, step 2 (default: **10**). Required for reliable scanning — exposing this prevents users from setting 0 and breaking scanability.
- **Logo upload**:
  - Accept `image/png`, `image/jpeg`, `image/svg+xml`, `image/webp`. Reject others with toast (`logoNotImage`).
  - Max **2MB**; toast `logoTooLarge` on rejection.
  - Drag-and-drop zone OR click-to-browse `<input type="file" accept="image/*">`.
  - File read via `FileReader.readAsDataURL` → stored as base64 data URL in state (NOT `URL.createObjectURL` — blob URLs invalidate on hot reload and are awkward to persist).
  - **Logo size slider**: 0.2 to 0.5, step 0.05 (default: **0.4**). Larger logos require higher EC.
  - **Hide background dots toggle**: default **on** (cleaner look behind logo).
  - **Remove Logo** button: clears `logo` from state; EC level kept at user's last manual choice (don't auto-revert).

### Logo & Error Correction Coupling

QR codes with embedded logos need higher error correction or they fail to scan. Behavior:

1. When user uploads a logo and current EC is `L` or `M`: auto-set EC to **`H`** and show toast `ecBumpedForLogo` ("Error correction raised to H for reliable scanning with logo"). User can manually lower it after.
2. When user manually selects EC `L` or `M` while a logo is present: show non-blocking warning toast `ecLowWithLogo` but allow the change.
3. When logo is removed: leave EC at user's last value.

### Responsive Layout

- Desktop (≥768px): Two-column — left: input form, right: preview + style
- Mobile (<768px): Single column stacked — input → preview → style

## Styling Engine

### Client-Only Library Loading (SSR Safety)

`qr-code-styling` directly references `document` / `window` at construction time. The Next.js App Router will SSR the page even with `"use client"` (it just becomes a CSR-after-hydration component), so the library MUST NOT be imported at the module top level. Pattern:

```tsx
// inside qrcode-page.tsx
import { useEffect, useRef, useState } from "react";
// NO top-level import of qr-code-styling

export default function QrCodePage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { default: QRCodeStyling } = await import("qr-code-styling");
      if (cancelled || !containerRef.current) return;
      const qr = new QRCodeStyling(buildOptions(state));
      qr.append(containerRef.current);
      qrRef.current = qr;
    })();
    return () => {
      cancelled = true;
      qrRef.current = null;
    };
  }, []); // mount-only init

  // subsequent updates call qrRef.current?.update(...)
}
```

This also keeps `qr-code-styling` (~70KB min+gz) out of the initial page bundle.

### Default Options (`libs/qrcode/styling.ts`)

```typescript
const DEFAULT_OPTIONS = {
  width: 300,
  height: 300,
  type: "svg" as const,
  data: "https://omnikit.run", // seed value so first paint is non-empty
  margin: 10, // quiet zone
  dotsOptions: { color: "#000000", type: "rounded" as const },
  backgroundOptions: { color: "#ffffff" },
  cornersSquareOptions: { type: "extra-rounded" as const },
  cornersDotOptions: { type: "dot" as const },
  qrOptions: { errorCorrectionLevel: "Q" as const },
  imageOptions: {
    crossOrigin: "anonymous" as const,
    margin: 4,
    hideBackgroundDots: true,
    imageSize: 0.4,
  },
};
```

### Update Flow

1. User changes content or style → state updates.
2. Two debounce buckets:
   - **Content fields** (textarea, inputs): 300ms debounce → re-encode + `update()`.
   - **Style controls** (color pickers, size slider, margin slider, logo size slider): 150ms debounce → `update()` only (no re-encode).
3. `qrRef.current?.update({ data, ...styleOptions })` updates the existing instance in-place; instance is created exactly once on mount.
4. DOM updates automatically via qr-code-styling internal rendering.
5. Each `update()` is wrapped in `try/catch`; on throw, show toast `generateFailed`.

### Capacity Detection

QR capacity depends on character mode AND error-correction level. We use a conservative byte-mode (UTF-8) lookup table to warn users **before** the library throws:

| EC Level | Approx. byte capacity (Version 40, byte mode) |
| -------- | --------------------------------------------- |
| L        | 2,953                                         |
| M        | 2,331                                         |
| Q        | 1,663                                         |
| H        | 1,273                                         |

Strategy in `libs/qrcode/capacity.ts`:

1. Compute `new TextEncoder().encode(payload).length` after `buildContent()`.
2. Compare against the table row for current EC level.
3. If `bytes > limit`: red border on active input + persistent toast `contentTooLong`. Skip the `update()` call (the library would throw anyway).
4. If `bytes > limit * 0.9`: yellow warning border + soft hint toast (one-time per session).

This is intentionally an approximation — the goal is "fail before the library fails", not exact-version selection.

### Export Implementation

- **SVG**: `qrCode.download({ name: "qrcode", extension: "svg" })` — native API.
- **PNG**: `qrCode.download({ name: "qrcode", extension: "png" })` — native API.
- **Clipboard**: Feature-detect `navigator.clipboard?.write && typeof ClipboardItem !== "undefined"`, then `qrCode.getRawData("png")` → `new ClipboardItem({ "image/png": blob })` → `navigator.clipboard.write([item])`. Button hidden if API unavailable. On success: toast `copied`. Note: Firefox lacks `ClipboardItem` support behind a flag, so feature detection is required (not optional).

## Persistence

State retained in `localStorage` under key `okrun:qrcode` (added to `libs/storage-keys.ts`):

```typescript
type PersistedStyling = Omit<StylingOptions, "logo">;

interface PersistedState {
  styling: PersistedStyling; // colors, dotStyle, EC, size, margin only
  lastContentType: ContentType;
  schemaVersion: 1; // bump on breaking changes; older versions discarded
}
```

- Saved on debounced state changes (500ms after last edit).
- Loaded on mount; falls back to defaults on parse error or `schemaVersion` mismatch.
- **Content payloads are NOT persisted** (privacy — vCard / WiFi may contain PII).
- **Logo is NOT persisted** (size + privacy concerns; users re-upload per session). The `Omit<StylingOptions, "logo">` type makes this a compile-time guarantee.

## Error Handling

| Scenario                               | Behavior                                                                                                       |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Required field empty                   | Preview shows `<QrCode/>` icon + `previewEmpty` text; export buttons disabled                                  |
| Content exceeds 90% of capacity        | Yellow border on input, one-time soft hint toast `contentNearLimit`                                            |
| Content exceeds capacity               | Red border + persistent toast `contentTooLong`; `update()` call skipped                                        |
| Email `to` invalid format              | Red border + inline `invalidEmail` text under field                                                            |
| WiFi SSID empty                        | Red border on SSID; export disabled                                                                            |
| Logo file > 2MB                        | Toast `logoTooLarge`; file rejected                                                                            |
| Logo file not in accepted MIME list    | Toast `logoNotImage`; file rejected                                                                            |
| Logo uploaded with EC ≤ M              | Auto-bump EC to H + toast `ecBumpedForLogo`                                                                    |
| User lowers EC while logo present      | Allow change but show warning toast `ecLowWithLogo`                                                            |
| Clipboard API unsupported              | Copy button hidden (feature detection on `navigator.clipboard?.write && typeof ClipboardItem !== "undefined"`) |
| `qr-code-styling` `update()` throws    | Try/catch around update; toast `generateFailed`; preview unchanged                                             |
| `qr-code-styling` dynamic import fails | Toast `libraryLoadFailed` with retry; preview shows error placeholder                                          |
| `localStorage` parse error on load     | Silently fall back to defaults; do not surface error                                                           |

## i18n

### Translation Keys (en/qrcode.json)

```json
{
  "shortTitle": "QR Code Generator",
  "title": "QR Code Generator - Free Online Tool",
  "description": "Generate styled QR codes for text, URLs, WiFi, vCard, email, and SMS. Custom colors, logos, and dot styles. 100% client-side.",
  "contentTypes": {
    "text": "Text / URL",
    "wifi": "WiFi",
    "vcard": "vCard",
    "email": "Email",
    "sms": "SMS"
  },
  "fields": {
    "content": "Content",
    "contentPlaceholder": "Enter text or URL...",
    "ssid": "Network Name (SSID)",
    "password": "Password",
    "encryption": "Encryption",
    "hidden": "Hidden Network",
    "firstName": "First Name",
    "lastName": "Last Name",
    "phone": "Phone",
    "email": "Email",
    "org": "Organization",
    "url": "Website",
    "address": "Address",
    "to": "To",
    "subject": "Subject",
    "body": "Body",
    "message": "Message"
  },
  "styling": {
    "title": "Style Options",
    "foreground": "Foreground",
    "background": "Background",
    "dotStyle": "Dot Style",
    "errorCorrection": "Error Correction",
    "size": "Size",
    "margin": "Margin (Quiet Zone)",
    "logo": "Logo",
    "logoUpload": "Drop image here or click to upload",
    "logoRemove": "Remove Logo",
    "logoSize": "Logo Size",
    "logoHideDots": "Hide dots behind logo",
    "showPassword": "Show password",
    "hidePassword": "Hide password"
  },
  "export": {
    "svg": "SVG",
    "png": "PNG",
    "clipboard": "Copy",
    "copied": "Copied to clipboard"
  },
  "preview": {
    "empty": "Fill in the required fields to generate a QR code"
  },
  "description": {
    "title": "About QR Codes",
    "intro": "QR codes encode text into a 2D matrix that smartphone cameras can decode. Higher error correction makes them readable even when partially obscured (by a logo, dirt, or damage).",
    "ecTitle": "Error Correction Levels",
    "ecL": "L — recovers ~7% damage. Smallest, no logo.",
    "ecM": "M — recovers ~15%. Suitable for clean prints.",
    "ecQ": "Q — recovers ~25%. Default; robust and supports small logos.",
    "ecH": "H — recovers ~30%. Required for sizable logos.",
    "tipsTitle": "Tips",
    "tipMargin": "Always keep a margin (quiet zone) of at least 4 modules — scanners need it to detect the code.",
    "tipContrast": "High contrast between foreground and background is essential. Avoid low-contrast pairs.",
    "tipLogo": "If embedding a logo, use error correction H and keep logo size ≤ 30% of the QR.",
    "tipTest": "Always test the generated QR with a real phone camera before printing or sharing widely."
  },
  "errors": {
    "contentTooLong": "Content is too long for QR code encoding",
    "contentNearLimit": "Content is approaching the QR capacity limit",
    "invalidEmail": "Invalid email address",
    "logoTooLarge": "Logo file must be smaller than 2MB",
    "logoNotImage": "Please upload a PNG, JPG, SVG, or WebP image",
    "ecBumpedForLogo": "Error correction raised to H for reliable scanning with logo",
    "ecLowWithLogo": "Low error correction with a logo may prevent scanning",
    "generateFailed": "Failed to generate QR code",
    "libraryLoadFailed": "Failed to load QR generator. Please reload the page."
  },
  "localGenerated": "Generated entirely in your browser. Your data never leaves your device."
}
```

Identical structure for `zh-CN` and `zh-TW` with translated values.

## Dependencies

| Package           | Version | Purpose                                 |
| ----------------- | ------- | --------------------------------------- |
| `qr-code-styling` | ^1.6.x  | QR code generation, styling, and export |

No other new dependencies. Reuses existing `rc-slider` (for size / margin / logo size sliders), Lucide icons (`QrCode`, `Eye`, `EyeOff`, `Upload`, `X`, `Lock`, `Info`, `Download`, `Clipboard`), and the `Styled*` components from `components/ui/input.tsx`.

## Verification Plan

The library can render an "invalid" QR (one that looks fine but won't scan) when escaping is wrong or EC is too low for a logo. Type checking won't catch this. Before marking the task complete:

1. **Manual scan test** — for each of the 5 content types, generate a QR with realistic input (including reserved chars: SSID `My;Net,work`, vCard with commas, email body with `&` and Chinese, etc.) and scan with a real phone camera (iOS Camera app + Android default). All 5 must round-trip exactly.
2. **Logo + EC scan test** — generate one QR with a logo at default settings (EC=H, hideBackgroundDots=true, imageSize=0.4); confirm it scans.
3. **Capacity boundary test** — paste a string just under and just over the byte limit for EC=Q (default); confirm warning then error states fire correctly.
4. **SSR test** — `next build` must succeed (catches accidental top-level imports of `qr-code-styling` — they would throw `document is not defined` during static page collection).
5. **Bundle test** — confirm `qr-code-styling` is in a separate chunk, not the initial route bundle (check `.next/` chunk output or use a bundle analyzer).
