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
2. Click Send → `fetch-engine.ts` builds a `Request` object → executes `fetch()`
3. `use-http-client.ts` collects the response, writes to history, updates UI state

### Tool Registration

- `libs/tools.ts` → TOOLS array: `{ key: "httpclient", path: "/httpclient", icon: Send }`
- Category: `reference` (grouped with `httpstatus`)
- Lucide icon: `Send`

### State Management

Approach: flat `useState` + custom hook `useHttpClient`. No `useReducer`, no external state library. React Compiler handles memoization automatically.

```typescript
const [requestConfig, setRequestConfig] = useState<RequestConfig>(defaultConfig);
const [response, setResponse] = useState<ResponseData | null>(null);
const [error, setError] = useState<RequestError | null>(null);
const [loading, setLoading] = useState(false);
const [history, setHistory] = useState<HistoryEntry[]>([]); // localStorage persisted
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
  ttfb: number; // Time to first byte (from PerformanceResourceTiming)
  download: number; // Download time
  total: number; // Wall-clock total
}

interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  bodyType: "json" | "html" | "xml" | "text" | "binary";
  size: number; // bytes
  timing: TimingInfo;
  cookies: string[]; // From Set-Cookie headers
  redirected: boolean;
  redirectChain: string[];
  timestamp: number;
}

interface RequestError {
  message: string;
  isCors: boolean;
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

**Timing details:** Browser `fetch` does not expose DNS/TCP/TLS breakdown. `PerformanceResourceTiming` API provides `startTime`, `responseStart`, `responseEnd` for TTFB and download calculation. `total` uses `Date.now()` delta. The redirect chain is captured via `response.redirected` and manual tracking of `Response.url` changes.

## UI Layout: Vertical Split (Top/Bottom)

### Request Panel (Top Half)

**URL Bar (always visible):**

```
[GET ▼] [ https://api.example.com/users           ] [Send]
```

- Method selector dropdown: GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS
  - Color coding: GET=green, POST=yellow, PUT/PATCH=blue, DELETE=red, HEAD/OPTIONS=gray
- URL input: accepts full URL with query string; query params auto-sync to Params tab
- Send button: purple primary button, spinner during loading

**Tab Area (NeonTabs) below URL bar:**

| Tab         | Content                                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Params**  | Key-Value editor (each row toggleable). Auto-synced with URL query string.                                                                                                                   |
| **Headers** | Key-Value editor. Common headers like `Content-Type` shown as suggestions.                                                                                                                   |
| **Body**    | Sub-selector: none / JSON / Form-Data / x-www-form-urlencoded / Raw. JSON mode uses Textarea with syntax hints. Form modes use Key-Value editor.                                             |
| **Auth**    | Sub-selector: none / Bearer Token / Basic Auth. Bearer shows single token input. Basic shows username + password inputs. Auth values are injected into request headers by `fetch-engine.ts`. |

**Key-Value Editor:**

- Each row: `[✓] [key input] [value input] [🗑]`
- Empty last row auto-creates new row on input
- Delete button removes the row

### Response Panel (Bottom Half)

**Status Bar (always visible):**

```
[200 OK]  [142ms]  [1.2 KB]  [JSON]            [Copy] [Download]
```

- Status code color: 2xx=green, 3xx=blue, 4xx=yellow, 5xx=red
- Timing + size + content type label
- Copy button + Download button (save response body as file)

**Tab Area:**

| Tab           | Content                                                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Body**      | JSON auto-formatted with syntax highlighting (reuses `json-view-theme.ts`). Non-JSON shown as plain text. Responses >1MB show a warning and render only the first 100KB. |
| **Headers**   | Read-only Key-Value list of response headers.                                                                                                                            |
| **Cookies**   | Parsed from `Set-Cookie` headers. Shows Name / Value / Path / Expires.                                                                                                   |
| **Timing**    | Visual timeline bar chart: TTFB → Download phases. Data from `PerformanceResourceTiming`.                                                                                |
| **Redirects** | Redirect chain list (if applicable). Each hop shows URL + status code.                                                                                                   |

### Error State

- **CORS error:** Prominent message: "CORS policy blocked this request. The target API does not allow cross-origin requests from browsers."
- **Network error:** Display the error message.
- **Timeout:** Default 30s. Configurable via a small input field next to the Send button (e.g., `[30s ▼]`). Options: 5s, 10s, 30s, 60s, 120s, no timeout.

### Empty State

When no request has been sent yet, the response panel shows a friendly empty state with instructions (e.g., "Enter a URL and click Send to get started").

## History

**Storage:** localStorage key `omnikit-httpclient-history`, max **50 entries**, FIFO eviction.

**Entry:** Stores request config + response status code + timestamp. Response body is NOT stored to avoid localStorage bloat.

**UI:** Clock icon button next to URL bar opens a side drawer listing history entries:

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

This module contains all request-building and response-parsing logic as pure/testable functions:

- `buildRequest(config: RequestConfig): Request` — builds a `Request` object from `RequestConfig`, merges params into URL, adds auth headers, constructs body based on `bodyType`
- `parseResponse(response: Response, startTime: number): Promise<ResponseData>` — extracts headers, reads body, detects content type, computes timing from Performance API
- `detectBodyType(body: string): ResponseData["bodyType"]` — auto-detect JSON/XML/HTML/text from content
- `parseSetCookieHeaders(headers: Headers): string[]` — extracts cookie values from Set-Cookie headers

All functions are pure and testable without browser APIs (mock `Request`/`Response`/`Headers`).

## i18n

10 locale files: `public/locales/{locale}/httpclient.json`

**English translations include:** tab labels, button text, error messages, placeholders, description section content.

**searchTerms for CJK locales:**

| Locale | searchTerms                              |
| ------ | ---------------------------------------- |
| zh-CN  | `httpkehu duan hkt rest api qingqiu`     |
| zh-TW  | `httpkehu duan hkt rest api qingqiu`     |
| ja     | `http kiraiant hk rest api rikesuto`     |
| ko     | `http kulaieondu hk rest api yongcheong` |

Latin-script locales (en, es, pt-BR, fr, de, ru): `shortTitle` is sufficient for fuzzy search.

## SEO

- `generatePageMeta()` with title: "HTTP Client - Online REST API Tester"
- Description: "Send HTTP requests and test REST APIs directly in your browser. Supports GET, POST, PUT, DELETE with headers, body, and auth. Free, no data sent to servers."
- 10 locale alternates
- JSON-LD structured data via existing `JsonLd` component

## Testing

- `libs/httpclient/__tests__/fetch-engine.test.ts` — tests for `buildRequest`, `parseResponse`, `detectBodyType`, `parseSetCookieHeaders`
- Uses Vitest (existing project config)
- Mock `Request`/`Response`/`Headers` constructors for unit testing pure functions
