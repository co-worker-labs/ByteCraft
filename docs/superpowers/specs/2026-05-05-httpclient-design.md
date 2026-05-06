# HTTP Client — Online REST API Tester

## Overview

A lightweight, browser-based HTTP client for testing REST APIs. Users can compose and send HTTP requests with full control over method, headers, body, and auth — then inspect responses with timing details, headers, and cookies.

All requests execute via browser `fetch()`. No data is sent to any server. Only CORS-friendly APIs are supported; CORS-blocked requests show a clear error message.

**Route:** `/httpclient`

## Architecture

### File Structure

```
app/[locale]/httpclient/
├── page.tsx                  # Route entry
└── httpclient-page.tsx       # Page component

components/httpclient/
└── key-value-editor.tsx      # Reusable Key-Value pair editor

libs/httpclient/
├── types.ts                  # Type definitions
├── use-http-client.ts        # Core hook (request config, response, history)
├── fetch-engine.ts           # Request building & execution (pure functions)
└── __tests__/
    └── fetch-engine.test.ts  # Tests for request building logic

public/locales/{locale}/
├── httpclient.json           # Tool-specific translations
└── tools.json               # Add httpclient entry
```

### Data Flow

1. User fills in request config (method, URL, headers, body) in the request panel
2. Click Send → `fetch-engine.ts` builds a `Request` object → executes `fetch()` with `AbortController` timeout
3. `use-http-client.ts` collects the response, extracts timing from `PerformanceResourceTiming`, writes to history, updates UI state

### Tool Registration

- `libs/tools.ts` → TOOLS array: `{ key: "httpclient", path: "/httpclient", icon: Send }`
- `libs/tools.ts` → TOOL_CATEGORIES: add `"httpclient"` to `reference` category (grouped with `httpstatus`)
- Lucide icon: `Send`
- `libs/storage-keys.ts` → add `httpclientHistory: "okrun:httpclient:history"`
- `vitest.config.ts` → add `"libs/httpclient/**/*.test.ts"` to `include`

### State Management

Approach: flat `useState` + custom hook `useHttpClient`. No `useReducer`, no external state library. React Compiler handles memoization automatically.

```typescript
const [requestConfig, setRequestConfig] = useState<RequestConfig>(defaultConfig);
const [response, setResponse] = useState<ResponseData | null>(null);
const [error, setError] = useState<RequestError | null>(null);
const [loading, setLoading] = useState(false);
const [history, setHistory] = useState<HistoryEntry[]>([]); // localStorage persisted
const [timeout, setTimeout] = useState<number | null>(30000); // default 30s
```

## Data Model

```typescript
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

interface KeyValue {
  key: string;
  value: string;
  enabled: boolean;
}

type BodyType = "none" | "json" | "form-data" | "urlencoded" | "raw";

interface RequestConfig {
  method: HttpMethod;
  url: string;
  params: KeyValue[];
  headers: KeyValue[];
  bodyType: BodyType;
  bodyContent: string; // Raw text / JSON string
  formData: KeyValue[]; // For form-data / urlencoded
  authType: "none" | "bearer" | "basic";
  bearerToken: string;
  basicUser: string;
  basicPass: string;
}

interface TimingInfo {
  ttfb?: number; // undefined when PerformanceResourceTiming unavailable (cross-origin without Timing-Allow-Origin)
  download?: number; // undefined when unavailable
  total: number; // Wall-clock total via Date.now() delta — always available
}

interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  bodyType: "json" | "html" | "xml" | "text" | "binary";
  size: number; // bytes
  timing: TimingInfo;
  cookies: CookieData[]; // Only populated for same-origin or CORS responses with exposed Set-Cookie
  redirected: boolean;
  finalUrl: string; // Final URL after redirects (response.url)
  timestamp: number;
}

interface CookieData {
  name: string;
  value: string;
  path?: string;
  expires?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: string;
}

interface RequestError {
  message: string;
  isCors: boolean;
  isTimeout: boolean;
  timestamp: number;
}

interface HistoryEntry {
  id: string;
  request: RequestConfig;
  responseStatus: number;
  responseStatusText: string;
  createdAt: number;
}
```

**Timing limitations:** `PerformanceResourceTiming` only exposes detailed timing (`responseStart`, `responseEnd`) for cross-origin requests when the server returns `Timing-Allow-Origin` header. Most APIs lack this header, so `ttfb` and `download` will be `undefined`. `total` is always available via `Date.now()` delta. The Timing tab gracefully handles missing data by showing "N/A" for unavailable metrics.

**Cookie limitations:** Browser security prevents reading `Set-Cookie` headers from cross-origin responses via JavaScript. `response.headers.get('Set-Cookie')` returns `null` for most cross-origin APIs. Cookies are only available when the response includes `Access-Control-Expose-Headers: Set-Cookie` or for same-origin requests. The Cookies tab shows a note when no cookies are accessible.

**Redirect limitations:** `fetch()` does not expose intermediate redirect URLs. Only `response.redirected` (boolean) and `response.url` (final URL) are available. The Redirects tab shows whether a redirect occurred and the final URL, but cannot list intermediate hops.

**Binary response handling:** When `detectBodyType` identifies a binary response, `response.arrayBuffer()` is used instead of `response.text()`. The body is displayed as a hex dump preview (first 4KB), and the Download button saves the raw binary file.

## UI Layout: Vertical Split (Top/Bottom)

### Page Structure

```tsx
<Layout title={title}>
  <div className="container mx-auto px-4 pt-3 pb-6">
    <div className="flex items-start gap-2 border-l-2 border-accent-cyan bg-accent-cyan-dim/30 rounded-r-lg p-3 my-4">
      <span className="text-sm text-fg-secondary leading-relaxed">
        {tc("alert.notTransferred")}
      </span>
    </div>
    <RequestPanel />
    <ResponsePanel />
    <Description />
  </div>
</Layout>
```

### Mobile Adaptation

On mobile (`useIsMobile()` — 768px breakpoint):

- **Request/Response panels:** Stacked vertically with collapsible sections. Request panel collapses after sending, response panel expands. A toggle button allows switching between the two.
- **History drawer:** Opens as a full-screen overlay instead of a side drawer.
- **KV editor:** Horizontal scroll for key-value rows; delete button shrinks to icon-only.

### Request Panel (Top Half)

**URL Bar (always visible):**

```
[GET ▼] [ https://api.example.com/users           ] [30s ▼] [Send]
```

- Method selector dropdown: GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS
  - Color coding: GET=green, POST=yellow, PUT/PATCH=blue, DELETE=red, HEAD/OPTIONS=gray
- URL input: accepts full URL with query string; query params auto-sync to Params tab
- Timeout selector: dropdown with options 5s, 10s, 30s (default), 60s, 120s, no timeout
- Send button: purple primary button, spinner during loading

**Tab Area (NeonTabs) below URL bar:**

| Tab         | Content                                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Params**  | Key-Value editor (each row toggleable). Auto-synced with URL query string.                                                                                                                   |
| **Headers** | Key-Value editor with autocomplete suggestions for common headers (`Content-Type`, `Accept`, `Authorization`, `Cache-Control`, `User-Agent`, etc.).                                          |
| **Body**    | Sub-selector: none / JSON / Form-Data / x-www-form-urlencoded / Raw. JSON mode uses Textarea with syntax hints. Form modes use Key-Value editor.                                             |
| **Auth**    | Sub-selector: none / Bearer Token / Basic Auth. Bearer shows single token input. Basic shows username + password inputs. Auth values are injected into request headers by `fetch-engine.ts`. |

**Key-Value Editor (`components/httpclient/key-value-editor.tsx`):**

Reusable component shared across Params, Headers, Body (form), and potentially other future tools.

Props:

```typescript
interface KeyValueEditorProps {
  pairs: KeyValue[];
  onChange: (pairs: KeyValue[]) => void;
  suggestions?: string[]; // Autocomplete options for key field
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}
```

Behavior:

- Each row: `[✓] [key input] [value input] [🗑]`
- Empty last row auto-creates new row on input
- Delete button removes the row
- When `suggestions` is provided, key input shows a filtered dropdown list

### Response Panel (Bottom Half)

**Status Bar (always visible):**

```
[200 OK]  [142ms]  [1.2 KB]  [JSON]            [Copy] [Download]
```

- Status code color: 2xx=green, 3xx=blue, 4xx=yellow, 5xx=red
- Timing + size + content type label
- Copy button + Download button (save response body as file)

**Tab Area:**

| Tab           | Content                                                                                                                                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Body**      | JSON auto-formatted with syntax highlighting (reuses `json-view-theme.ts`). Non-JSON shown as plain text. Binary shown as hex dump preview. Responses >1MB show a warning and render only the first 100KB. |
| **Headers**   | Read-only Key-Value list of response headers.                                                                                                                                                              |
| **Cookies**   | Parsed from `Set-Cookie` headers when accessible. Shows Name / Value / Path / Expires / HttpOnly / Secure / SameSite. Shows a limitation note when no cookies are readable.                                |
| **Timing**    | Visual timeline bar chart: TTFB → Download phases. Uses `PerformanceResourceTiming`. Shows "N/A (cross-origin)" when detailed timing is unavailable. Only `total` is always shown.                         |
| **Redirects** | Shows `response.redirected` status and final URL (`response.url`) when redirect occurred. Shows a note that intermediate hops are not visible in browser fetch.                                            |

### Error State

- **CORS error:** Prominent message: "CORS policy blocked this request. The target API does not allow cross-origin requests from browsers."
- **Network error:** Display the error message.
- **Timeout:** Implemented via `AbortController` + `setTimeout`. Error message: "Request timed out after 30s." with `isTimeout: true`.

### Empty State

When no request has been sent yet, the response panel shows a friendly empty state with instructions (e.g., "Enter a URL and click Send to get started").

## History

**Storage:** localStorage key `okrun:httpclient:history` (registered in `libs/storage-keys.ts` as `STORAGE_KEYS.httpclientHistory`), max **50 entries**, FIFO eviction.

**Entry:** Stores request config + response status code + timestamp. Response body is NOT stored to avoid localStorage bloat.

**UI:** Clock icon button next to URL bar opens a side drawer (full-screen overlay on mobile) listing history entries:

```
[GET]  https://api.example.com/users     200 OK  2min ago
[POST] https://api.example.com/login     401     1h ago
```

- Click entry → restore request config to the panel (does NOT auto-send)
- Clear history button at the bottom

## CORS Strategy

Pure browser `fetch()`. No proxy, no server-side component.

- Only APIs with proper CORS headers will work
- CORS errors are detected by checking if `fetch` throws a `TypeError` (browser behavior for CORS violations)
- `isCors` flag set to `true` when error message contains "CORS" or "NetworkError" or is a generic `TypeError` from fetch
- Clear user-facing message explaining the limitation

## fetch-engine.ts (Pure Functions)

This module contains request-building and response-parsing logic as pure/testable functions. Timing extraction is intentionally excluded — it depends on `PerformanceResourceTiming` (browser API) and is handled by the hook layer.

- `buildRequest(config: RequestConfig, timeoutMs: number | null): { request: Request; controller: AbortController }` — builds a `Request` object from `RequestConfig`, merges params into URL, adds auth headers, constructs body based on `bodyType`:
  - `json`: sets `Content-Type: application/json`, uses `bodyContent` as-is
  - `form-data`: constructs `FormData` from `formData` KeyValue pairs, lets browser set `Content-Type` with boundary
  - `urlencoded`: sets `Content-Type: application/x-www-form-urlencoded`, URL-encodes `formData` pairs
  - `raw`: uses `bodyContent` directly, no `Content-Type` header added
  - `none`: no body
  - Auth: `bearer` → adds `Authorization: Bearer <token>`; `basic` → adds `Authorization: Basic <btoa(user:pass)>`
  - Timeout: creates `AbortController`, attaches `setTimeout(() => controller.abort(), timeoutMs)` if timeout is set
- `parseResponse(response: Response, startTime: number): Promise<ResponseData>` — extracts headers, reads body as text (or `arrayBuffer` for binary), detects content type, computes `total` timing from `startTime` delta. Does NOT extract `PerformanceResourceTiming` data.
- `detectBodyType(contentType: string, body: string | ArrayBuffer): ResponseData["bodyType"]` — auto-detect JSON/XML/HTML/text/binary from `Content-Type` header and body content
- `parseSetCookieHeaders(headers: Headers): CookieData[]` — parses `Set-Cookie` headers into structured cookie objects. Returns empty array when headers are not accessible.

All functions are pure and testable without browser APIs (mock `Request`/`Response`/`Headers`).

### Timing Extraction (Hook Layer)

Timing extraction is handled in `use-http-client.ts` (not `fetch-engine.ts`) because it depends on the browser `PerformanceResourceTiming` API:

```typescript
function extractTiming(url: string, startTime: number, endTime: number): TimingInfo {
  const total = endTime - startTime;
  const entries = performance.getEntriesByName(url, "resource") as PerformanceResourceTiming[];
  const entry = entries[entries.length - 1]; // Most recent entry for this URL
  if (entry && entry.responseStart > 0) {
    return {
      ttfb: entry.responseStart - entry.startTime,
      download: entry.responseEnd - entry.responseStart,
      total,
    };
  }
  return { total }; // Cross-origin without Timing-Allow-Origin
}
```

## i18n

10 locale files: `public/locales/{locale}/httpclient.json`

**English translations include:** tab labels, button text, error messages, placeholders, description section content.

**searchTerms for CJK locales:**

| Locale | searchTerms                   |
| ------ | ----------------------------- |
| zh-CN  | `httpkehuduan hkt rest api`   |
| zh-TW  | `httpkehuduan hkt rest api`   |
| ja     | `httpkuraianto hk rest api`   |
| ko     | `httpkeulaieondu hk rest api` |

Latin-script locales (en, es, pt-BR, fr, de, ru): `shortTitle` is sufficient for fuzzy search.

## SEO

- `generatePageMeta()` with title: "HTTP Client - Online REST API Tester"
- Description: "Send HTTP requests and test REST APIs directly in your browser. Supports GET, POST, PUT, DELETE with headers, body, and auth. Free, no data sent to servers."
- 10 locale alternates
- `WebApplicationJsonLd` component with `{ name, description, url }` props
- `BreadcrumbJsonLd` component with tool breadcrumb

## Description Section

A static help section below the main panels (following the project's `<Conversion />` + `<Description />` pattern), containing:

- What this tool does (browser-based HTTP client)
- CORS limitations explanation
- Supported features (methods, auth types, body formats)

## Testing

- `libs/httpclient/__tests__/fetch-engine.test.ts` — tests for `buildRequest`, `parseResponse`, `detectBodyType`, `parseSetCookieHeaders`
- Uses Vitest (existing project config)
- Mock `Request`/`Response`/`Headers` constructors for unit testing pure functions
- `vitest.config.ts` must include `"libs/httpclient/**/*.test.ts"` in the `include` array
