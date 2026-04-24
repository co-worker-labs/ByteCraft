# URL Encoder/Decoder Tool Design

## Overview

A new standalone tool for the ByteCraft suite that lets users encode and decode URL strings using three industry-standard modes (Component, Whole URL, Form). Following the existing patterns established by the Base64 tool.

## Problem Statement

Developers regularly need to:

- Prepare query string parameters (component-level encoding)
- Encode an entire URL while preserving structural characters like `:` `/` `?` `#`
- Encode form bodies where spaces are represented as `+` instead of `%20`

Native browser tools force users to remember which JavaScript function to call. A unified UI with explicit mode selection removes that friction and doubles as a teaching surface for the encoding rules.

## Solution

A client-side encoding tool with a single mode selector that simultaneously controls encode and decode behavior, mirroring the layout and ergonomics of the Base64 tool.

## Architecture

### File Structure

- New route directory: `app/[locale]/urlencoder/`
- Server route file: `app/[locale]/urlencoder/page.tsx`
- Client component file: `app/[locale]/urlencoder/urlencoder-page.tsx`

### Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 (inherited from project)
- **i18n**: `next-intl` with translation files at `public/locales/{locale}/urlencoder.json`
- **UI Components**: Reuses `StyledTextarea`, `StyledCheckbox`, `Button`, `CopyButton` from `components/ui/`

## Encoding Modes

The tool exposes three modes via a single segmented control. The selected mode applies to **both** the encode and decode operations.

| Mode                    | Encode                            | Decode                            |
| ----------------------- | --------------------------------- | --------------------------------- |
| **Component** (default) | `encodeURIComponent(input)`       | `decodeURIComponent(input)`       |
| **Whole URL**           | `encodeURI(input)`                | `decodeURI(input)`                |
| **Form**                | see `encodeForm` pseudocode below | see `decodeForm` pseudocode below |

```typescript
// Form mode: strict application/x-www-form-urlencoded per the HTML
// form-submission algorithm (WHATWG URL Standard serializer + HTML-level
// CRLF normalization preprocessing).
function encodeForm(input: string): string {
  // HTML form submission normalizes all newlines to CRLF before serializing.
  // URLSearchParams itself does NOT do this — it's an HTML-layer step.
  const normalized = input.replace(/\r\n|\r|\n/g, "\r\n");
  // Using a throwaway key "v=" and slicing it off avoids hand-writing the
  // application/x-www-form-urlencoded percent-encode set.
  return new URLSearchParams({ v: normalized }).toString().slice(2);
}

function decodeForm(input: string): string {
  // Raw input may contain literal `&` or `=` — URLSearchParams would
  // interpret them as pair/k-v delimiters and truncate the value. Escape
  // them back to their percent forms so they pass through as data.
  const escaped = input.replace(/&/g, "%26").replace(/=/g, "%3D");
  return new URLSearchParams("v=" + escaped).get("v") ?? "";
}
```

**Mode selection rationale**:

- **Component** is the default because it is the most common developer need (query parameter values, path segments).
- **Whole URL** preserves URL-structural characters; appropriate when encoding a full URL string.
- **Form** matches `application/x-www-form-urlencoded` body encoding semantics as defined by the HTML form-submission algorithm (which layers CRLF normalization on top of the WHATWG URL Standard serializer).

**Why `URLSearchParams` (+ manual CRLF normalization) for Form mode** — not the naive `encodeURIComponent(...).replace(/%20/g, "+")`:

- `encodeURIComponent` leaves `!` `'` `(` `)` `~` unencoded, but the WHATWG url-encoded serializer encodes all of them. Some servers reject or misparse non-conformant bodies.
- The naive form does not normalize newlines; the HTML form-submission spec mandates CRLF normalization (all `\n` / `\r` / `\r\n` → `\r\n`) before serialization.
- `URLSearchParams` is a browser-native primitive with zero dependency cost, and applying manual CRLF normalization on top of it is a one-liner.

**Exact character-level delta between `encodeURIComponent` and `URLSearchParams`** (important because the Reserved Characters Table depends on this):

- `URLSearchParams` encodes `!` `'` `(` `)` `~` that `encodeURIComponent` does not.
- `URLSearchParams` does NOT encode `*` (both primitives leave it alone).
- `URLSearchParams` encodes space as `+`; `encodeURIComponent` encodes it as `%20`.

**CRLF normalization asymmetry (must be documented in the description section)**:

- **Form mode** normalizes `\n` / `\r` / `\r\n` to `\r\n` (encoded as `%0D%0A`) **via the manual preprocess step in `encodeForm` above** — this is the HTML form-submission spec.
- **Component and Whole URL modes** preserve `\n` and `\r` byte-for-byte (encoded as `%0A` / `%0D`). These modes wrap JavaScript's native `encodeURIComponent` / `encodeURI` without interference, because altering their behavior would break round-tripping for legitimately encoded content.

## Components

### Server Route Handler (`page.tsx`)

Follows the existing Base64 pattern verbatim: `keywords` is intentionally `""` to match the rest of the tools; if project-wide SEO keyword metadata is added later it should be addressed as a cross-tool change rather than introduced on a single new tool.

```typescript
import { getTranslations } from "next-intl/server";
import UrlencoderPage from "./urlencoder-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t("urlencoder.title"),
    description: t("urlencoder.description"),
    keywords: "",
  };
}

export default function UrlencoderRoute() {
  return <UrlencoderPage />;
}
```

### Client Component (`urlencoder-page.tsx`)

#### State Management

- `rawContent: string` — input/decoded text (top textarea)
- `encodedContent: string` — output/encoded text (bottom textarea)
- `mode: "component" | "url" | "form"` — encoding mode (default `"component"`)
- `isTrimRaw: boolean` — trim raw input on encode (default `true`)
- Translations via `useTranslations("urlencoder")` and `useTranslations("common")`

#### Core Functions

1. `updateRawContent(value: string)` — sets `rawContent`.
2. `updateEncodedContent(value: string)` — sets `encodedContent`.
3. `doEncode()` — applies the encode function for the current mode (see the pseudocode in the Encoding Modes section), optionally after trimming. Writes to `encodedContent`. Shows success toast on completion.
4. `doDecode()` — trims `encodedContent` first, then applies the decode function for the current mode inside try/catch. **On success: writes the result to `rawContent`** (the upper, plaintext area). On failure: shows error toast with the message from `urlencoder.decodeFailed`; original input is preserved.
   - **Deviation from Base64 note**: the Base64 tool does NOT wrap its decode in try/catch and silently produces garbled output on invalid input. This spec deliberately adds try/catch because `URIError` is a realistic outcome of URL decoding (any lone `%` or malformed `%XX` triggers it in Component / Whole URL modes) — the correct user experience is a clear error, not garbled text.
   - **Form-mode error-handling note**: `URLSearchParams` does NOT throw on malformed percent-sequences; it silently preserves them as literal text. In Form mode, the try/catch is effectively a no-op, and input like `"v=%"` round-trips as `"%"`. This is W3C-spec behavior and acceptable — Form-mode decode will never surface `decodeFailed` toast.
5. **Mode switching** does NOT modify either textarea. `rawContent` and `encodedContent` are preserved across mode changes; the user must explicitly press Encode or Decode under the new mode to regenerate the opposite field. Rationale: aligns with Base64's "output only changes when a button is pressed" mental model and supports the A/B/C mode-comparison workflow.
6. Disabled-state helpers — use correct spelling `isDisabledEncode` / `isDisabledDecode` / `isDisabledClear` in this new file. Do NOT propagate the `isDiabledDecode` / `isDiabledClear` typos that exist in `base64-page.tsx`; those are not fixed in this change to avoid unrelated diffs.
   - `isDisabledEncode()` — true when raw input is empty (after trim if enabled)
   - `isDisabledDecode()` — true when encoded input is empty
   - `isDisabledClear()` — true when both fields are empty

#### Decode-Side Preprocessing

- **Trim leading/trailing whitespace** before decoding (covers the common copy-paste-from-email case).
- **Do not** strip internal whitespace or newlines — they may be part of legitimately encoded content.

#### Error Handling

- `doDecode()` wraps the decode call in try/catch.
- On `URIError`, surface a toast using the i18n key `urlencoder.decodeFailed`.
- Empty-input guard prevents needless work.
- Original input is never mutated on error.

#### UI Layout (top to bottom)

1. **"Not transferred" alert banner** — reuses `tc("alert.notTransferred")` with the standard `border-l-2 border-accent-cyan bg-accent-cyan-dim/30` treatment. Matches Base64, Cipher, and Hashing pages.
2. **Plaintext section** — section heading (cyan dot, "Plain Text") + trim checkbox + per-section clear button + textarea with `CopyButton`.
3. **Mode selector + action row** — segmented control for `Component / Whole URL / Form` on the left, then `Encode`, `Decode`, `Clear All` buttons. Layout matches the Base64 control row (grid, rounded-full buttons, `ChevronsDown` / `ChevronsUp` / `X` icons).
4. **Encoded section** — section heading (purple dot, "Encoded Text") + per-section clear button + textarea with `CopyButton`.
5. **Description section** — five subsections (see below).

The mode selector is implemented inline using existing `Button` variants — active option uses `variant="primary"`, inactive options use `variant="outline"` — since the project does not currently have a dedicated segmented-control component. Three buttons grouped with shared rounded corners and a `role="radiogroup"` wrapper for accessibility.

## Project Integration Points

These touch points are **mandatory** for the tool to be reachable; missing any of them breaks the home page or i18n loading. As of this spec, the project already ships 10 tools (base64, uuid, hashing, password, checksum, htmlcode, storageunit, ascii, cipher, and the existing list); `urlencoder` is the 11th and should be appended in each location below.

### 1. Register the i18n namespace

Add `"urlencoder"` to the `namespaces` array in `i18n/request.ts`. The `getRequestConfig` loop already handles loading `public/locales/{locale}/urlencoder.json` for each locale once the namespace is registered.

### 2. Register the tool in the home grid

Append an entry to the `TOOLS` array in `libs/tools.ts`:

```ts
{ key: "urlencoder", path: "/urlencoder" },
```

### 3. Register the home-page icon

Append an entry to the `toolIcons` map in `app/[locale]/home-page.tsx`:

```tsx
"/urlencoder": <Percent size={28} className="text-accent-cyan" />,
```

Imported from `lucide-react`. `Percent` is chosen over `Link` because it visually cues "percent-encoding" — the actual mechanic of the tool — and it does not collide with a future short-link/URL-shortener tool that would more naturally claim the `Link` glyph. Remember to add `Percent` to the lucide-react import statement.

### 4. Add `tools.json` keys for all three locales

For each of `en`, `zh-CN`, `zh-TW`, append a `urlencoder` block to `public/locales/{locale}/tools.json`:

```json
"urlencoder": {
  "title": "URL Encoder/Decoder - Free Online Tool",
  "shortTitle": "URL Encoder",
  "description": "Encode and decode URL strings with Component, Whole URL, and Form modes. Free online URL encoder/decoder, 100% client-side."
}
```

Title uses the project's standard `"X - Free Online Tool"` pattern (see `base64`, `checksum`, `storageunit`) rather than a technical/SEO-heavy variant. All three fields (`title`, `shortTitle`, `description`) **must be fully translated** for `zh-CN` and `zh-TW`, matching how every existing tool in `tools.json` is handled.

## Internationalization

### Namespace: `urlencoder`

Files: `public/locales/{en,zh-CN,zh-TW}/urlencoder.json`.

Required keys:

| Key                                                                                                                  | Purpose                                                                                             |
| -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `plainText`                                                                                                          | Section heading for the input area                                                                  |
| `encodedText`                                                                                                        | Section heading for the output area                                                                 |
| `plainTextPlaceholder`                                                                                               | Textarea placeholder for raw input                                                                  |
| `encodedOutput`                                                                                                      | Textarea placeholder for encoded output                                                             |
| `encode`                                                                                                             | Encode button label                                                                                 |
| `decode`                                                                                                             | Decode button label                                                                                 |
| `mode.label`                                                                                                         | `aria-label` for the `role="radiogroup"` wrapper, e.g. "Encoding mode"                              |
| `mode.component`                                                                                                     | Segmented label: "Component"                                                                        |
| `mode.url`                                                                                                           | Segmented label: "Whole URL"                                                                        |
| `mode.form`                                                                                                          | Segmented label: "Form (+ for spaces)"                                                              |
| `decodeFailed`                                                                                                       | Error toast message on decode failure                                                               |
| `descriptions.whatIsTitle` / `whatIsP1..P2`                                                                          | Section 1 (see Description below)                                                                   |
| `descriptions.howTitle` / `howIntro` / `howComponent` / `howUrl` / `howForm`                                         | Section 2                                                                                           |
| `descriptions.tableTitle` / `tableCaption` / `tableChar` / `tableComponent` / `tableUrl` / `tableForm` / `tableNote` | Section 3 — four column headers (`Char` / `Component` / `Whole URL` / `Form`) plus caption and note |
| `descriptions.useCasesTitle` / `useCasesP1..P3`                                                                      | Section 4                                                                                           |
| `descriptions.limitationsTitle` / `limitationsP1..P2`                                                                | Section 5                                                                                           |

Existing common keys (`encoded`, `decoded`, `cleared`, `allCleared`, `clear`, `clearAll`, `trimWhiteSpace`, `alert.notTransferred`) are reused from the `common` namespace — no new common keys required.

## Description Section Structure

Five subsections, mirroring the density of the Base64 tool's description block.

1. **What is URL Encoding?**
   Two paragraphs. Define percent-encoding, explain why it exists (URL-unsafe characters, RFC 3986 reserved set), and clarify it is not encryption.

2. **How to choose a mode**
   Short intro paragraph + one paragraph per mode explaining when to pick it:
   - **Component** — encoding individual query values, path segments, fragment values.
   - **Whole URL** — encoding a full URL while keeping `:` `/` `?` `#` `&` `=` intact.
   - **Form** — building an `application/x-www-form-urlencoded` request body, where spaces become `+`.

3. **Reserved Characters Table** (four-column per-mode comparison)
   A table with columns `Char` / `Component` / `Whole URL` / `Form`. Each row shows the encoded output (or `—` if unchanged / `+` for space in Form mode) in each of the three modes, so the user can see at a glance which modes diverge on a given character. This cross-mode comparison is the single most teaching-dense element of the description and justifies the extra layout cost.

   Rows to include (representative, not exhaustive):
   - (space), `!`, `"`, `#`, `$`, `%`, `&`, `'`, `(`, `)`, `*`, `+`, `,`, `/`, `:`, `;`, `=`, `?`, `@`, `[`, `]`
   - Newline (`\n`) — shows `%0A` / `%0A` / `%0D%0A` to expose the Form-mode CRLF normalization
   - One multibyte example: `中` → `%E4%B8%AD` in all three modes (non-ASCII is uniformly encoded)

   Caption/note below the table must explicitly state:
   - **Component** encodes everything except the JavaScript `encodeURIComponent` unreserved set `A–Z a–z 0–9 - _ . ! ~ * ' ( )`.
   - **Whole URL** preserves the URL-structural set `; , / ? : @ & = + $ # !` in addition to the unreserved set.
   - **Form** encodes the WHATWG url-encoded set: on top of Component's coverage it additionally encodes `!` `'` `(` `)` `~`, leaves `*` unencoded (same as Component), converts space to `+` instead of `%20`, and normalizes `\n` / `\r` / `\r\n` to `\r\n` (serialized as `%0D%0A`). This matches what the browser sends when you submit an HTML form with `Content-Type: application/x-www-form-urlencoded`.

4. **Common Use Cases**
   Three short paragraphs:
   - Building safe query strings programmatically.
   - Embedding URLs as parameter values (encoding a URL inside another URL).
   - Submitting form data via `fetch` with `Content-Type: application/x-www-form-urlencoded`.

5. **Limitations**
   Two paragraphs:
   - URL encoding is not encryption; encoded output is fully reversible by anyone.
   - Choice of mode matters — encoding a whole URL with Component mode breaks the URL; encoding a query value with Whole URL mode leaves reserved characters dangerous.

## Data Flow

### Encoding

1. User pastes/types into the plaintext textarea.
2. User selects a mode (or uses the default `Component`).
3. User clicks **Encode**.
4. `doEncode()` reads `rawContent` (trimmed if `isTrimRaw`), applies the encode function for the current mode, writes result to `encodedContent`, fires `tc("encoded")` toast.

### Decoding

1. User pastes encoded text into the encoded textarea (or uses output of a prior encode).
2. User selects the matching mode.
3. User clicks **Decode**.
4. `doDecode()` reads `encodedContent`, trims leading/trailing whitespace, applies the decode function for the current mode inside try/catch.
   - On success: writes the decoded plaintext to `rawContent`, fires `tc("decoded")` toast.
   - On `URIError`: fires error toast with `t("decodeFailed")`; both fields untouched.

### Clear Operations

- Per-section "Clear" links above each textarea reset only that field.
- "Clear All" button resets both fields and fires `tc("allCleared")` danger toast.

## Styling & Components

- Reuses `StyledTextarea`, `StyledCheckbox`, `Button`, `CopyButton` from `components/ui/`.
- Does **not** use `StyledSelect` (no charset choice — UTF-8 is implicit in JavaScript's URI functions and in `URLSearchParams`) or `StyledInput` (no Basic-Auth-style sub-fields).
- Color tokens follow Base64: input section uses `accent-cyan`, output section uses `accent-purple`.
- Action buttons use `rounded-full font-bold` with lucide-react icons (`ChevronsDown` for encode, `ChevronsUp` for decode, `X` for clear-all).
- Layout title is sourced via `t("urlencoder.shortTitle")` from the `tools` namespace and passed to `<Layout title={...}>`, matching every other tool page.

## Security Considerations

- All processing is client-side; nothing leaves the browser.
- Functions used (`encodeURIComponent`, `encodeURI`, `decodeURIComponent`, `decodeURI`) are platform built-ins with well-defined behavior.
- No third-party dependencies introduced.

## Accessibility

- Each textarea has a corresponding visible label and an `id` matched by `htmlFor`.
- The mode segmented control uses `role="radiogroup"` semantics; each option is keyboard-focusable.
- Buttons retain visible focus rings inherited from the project's `Button` component.
- Color contrast follows the existing accent token system, which already meets WCAG AA in light and dark themes.

## Open Questions

None remaining at design time. Decisions resolved during brainstorming:

- Route: `/urlencoder` (chosen for SEO weight + project naming consistency)
- Three explicit modes with a single shared selector
- **Form mode uses `URLSearchParams` plus a manual CRLF-normalization preprocess** (not naive `encodeURIComponent` + `%20→+`), to guarantee conformance with the HTML form-submission algorithm (layered on top of the WHATWG url-encoded serializer). Form-mode decode also escapes literal `&` and `=` before calling `URLSearchParams.get()` to avoid pair/k-v delimiter ambiguity.
- Component and Whole URL modes do **not** normalize CRLF — they wrap the native `encodeURIComponent` / `encodeURI` without interference to preserve round-trip fidelity
- Mode switching does **not** modify either textarea; output only changes when the user presses Encode/Decode
- Decode wraps the call in try/catch and surfaces `URIError` via toast (deliberate improvement over Base64's silent-garble behavior)
- Decode-side preprocessing: trim only, do not strip internal whitespace
- Spelling: use correct `isDisabled*` in this new file; pre-existing typos in `base64-page.tsx` remain untouched
- Reserved Characters Table is a four-column per-mode comparison (the teaching-dense element)
- Top-of-page reuses `tc("alert.notTransferred")` banner, matching Base64/Cipher/Hashing
- `page.tsx` `keywords` is `""` to match the existing pattern (SEO keyword metadata is a separate, cross-tool concern)
- Home-page icon is `Percent` (lucide-react), cueing percent-encoding and leaving `Link` available for a future short-link tool
- `tools.json` title follows the project's `"X - Free Online Tool"` naming convention
- No automated test plan in this spec (project has no test framework yet; introducing one is a separate effort)

## Related Tools

- **Base64**: structurally the closest sibling; this tool intentionally mirrors its layout, color usage, and toast messaging.
- **HTML Code**: same domain (escaping for transport); complementary, not overlapping.
- **Cipher / Hashing**: also in the encoding/transformation family.

## Future Enhancements (out of scope)

- History of recent encodings via `localStorage`
- Batch mode (one input per line)
- "Auto-detect mode" heuristic that inspects the input shape
- Diff view showing which characters changed between input and output
