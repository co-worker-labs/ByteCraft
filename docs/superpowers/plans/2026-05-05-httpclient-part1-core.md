# HTTP Client — Part 1: Core Engine & Infrastructure

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the type definitions, pure fetch-engine functions with full test coverage, tool registration, and route entry page for the HTTP Client tool.

**Architecture:** Pure functions in `libs/httpclient/fetch-engine.ts` handle request building and response parsing — fully testable without browser APIs. Types are centralized in `types.ts`. The hook and UI will consume these in Part 2.

**Tech Stack:** TypeScript, Vitest, Next.js App Router, next-intl, Lucide React icons

---

## File Map

| Action | File                                             | Responsibility                                                                     |
| ------ | ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Create | `libs/httpclient/types.ts`                       | All type definitions for the HTTP Client                                           |
| Create | `libs/httpclient/fetch-engine.ts`                | Pure functions: buildRequest, parseResponse, detectBodyType, parseSetCookieHeaders |
| Create | `libs/httpclient/__tests__/fetch-engine.test.ts` | Full test coverage for fetch-engine                                                |
| Modify | `libs/tools.ts`                                  | Register httpclient in TOOLS array and TOOL_CATEGORIES                             |
| Modify | `libs/storage-keys.ts`                           | Add httpclientHistory storage key                                                  |
| Modify | `vitest.config.ts`                               | Add httpclient test include path                                                   |
| Create | `app/[locale]/httpclient/page.tsx`               | Route entry with SEO metadata                                                      |

---

### Task 1: Type Definitions

**Files:**

- Create: `libs/httpclient/types.ts`

- [ ] **Step 1: Create the types file**

```typescript
// libs/httpclient/types.ts

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export interface KeyValue {
  key: string;
  value: string;
  enabled: boolean;
}

export type BodyType = "none" | "json" | "form-data" | "urlencoded" | "raw";

export type AuthType = "none" | "bearer" | "basic";

export interface RequestConfig {
  method: HttpMethod;
  url: string;
  params: KeyValue[];
  headers: KeyValue[];
  bodyType: BodyType;
  bodyContent: string;
  formData: KeyValue[];
  authType: AuthType;
  bearerToken: string;
  basicUser: string;
  basicPass: string;
}

export interface TimingInfo {
  ttfb?: number;
  download?: number;
  total: number;
}

export type ResponseBodyType = "json" | "html" | "xml" | "text" | "binary";

export interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  bodyType: ResponseBodyType;
  size: number;
  timing: TimingInfo;
  cookies: CookieData[];
  redirected: boolean;
  finalUrl: string;
  timestamp: number;
}

export interface CookieData {
  name: string;
  value: string;
  path?: string;
  expires?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: string;
}

export interface RequestError {
  message: string;
  isCors: boolean;
  isTimeout: boolean;
  timestamp: number;
}

export interface HistoryEntry {
  id: string;
  request: RequestConfig;
  responseStatus: number;
  responseStatusText: string;
  createdAt: number;
}

export const DEFAULT_REQUEST_CONFIG: RequestConfig = {
  method: "GET",
  url: "",
  params: [],
  headers: [],
  bodyType: "none",
  bodyContent: "",
  formData: [],
  authType: "none",
  bearerToken: "",
  basicUser: "",
  basicPass: "",
};

export const HTTP_METHODS: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
];

export const TIMEOUT_OPTIONS: { label: string; value: number | null }[] = [
  { label: "5s", value: 5000 },
  { label: "10s", value: 10000 },
  { label: "30s", value: 30000 },
  { label: "60s", value: 60000 },
  { label: "120s", value: 120000 },
  { label: "∞", value: null },
];

export const COMMON_HEADERS: string[] = [
  "Content-Type",
  "Accept",
  "Authorization",
  "Cache-Control",
  "User-Agent",
  "Accept-Encoding",
  "Accept-Language",
  "Connection",
  "Host",
  "Origin",
  "Referer",
  "X-Requested-With",
];

export const BODY_TYPE_OPTIONS: BodyType[] = ["none", "json", "form-data", "urlencoded", "raw"];

export const AUTH_TYPE_OPTIONS: AuthType[] = ["none", "bearer", "basic"];

export function emptyKeyValue(): KeyValue {
  return { key: "", value: "", enabled: true };
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit libs/httpclient/types.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add libs/httpclient/types.ts
git commit -m "feat(httpclient): add type definitions and constants"
```

---

### Task 2: detectBodyType — Tests First

**Files:**

- Create: `libs/httpclient/__tests__/fetch-engine.test.ts`
- Create: `libs/httpclient/fetch-engine.ts` (partial — detectBodyType only)

- [ ] **Step 1: Write failing tests for detectBodyType**

```typescript
// libs/httpclient/__tests__/fetch-engine.test.ts
import { describe, it, expect } from "vitest";
import { detectBodyType } from "../fetch-engine";

describe("detectBodyType", () => {
  it("detects JSON from Content-Type header", () => {
    expect(detectBodyType("application/json", '{"ok":true}')).toBe("json");
  });

  it("detects JSON from charset variant", () => {
    expect(detectBodyType("application/json; charset=utf-8", "{}")).toBe("json");
  });

  it("detects JSON from vendor type", () => {
    expect(detectBodyType("application/vnd.api+json", '{"data":[]}')).toBe("json");
  });

  it("detects HTML from Content-Type", () => {
    expect(detectBodyType("text/html", "<html></html>")).toBe("html");
  });

  it("detects XML from Content-Type", () => {
    expect(detectBodyType("application/xml", "<root/>")).toBe("xml");
  });

  it("detects XML from text/xml", () => {
    expect(detectBodyType("text/xml", "<root/>")).toBe("xml");
  });

  it("detects binary from application/octet-stream", () => {
    expect(detectBodyType("application/octet-stream", new ArrayBuffer(8))).toBe("binary");
  });

  it("detects binary from image/png", () => {
    expect(detectBodyType("image/png", new ArrayBuffer(8))).toBe("binary");
  });

  it("detects binary from application/pdf", () => {
    expect(detectBodyType("application/pdf", new ArrayBuffer(8))).toBe("binary");
  });

  it("falls back to text for text/plain", () => {
    expect(detectBodyType("text/plain", "hello")).toBe("text");
  });

  it("falls back to text for unknown Content-Type with string body", () => {
    expect(detectBodyType("", "hello world")).toBe("text");
  });

  it("detects JSON body by sniffing when Content-Type is generic", () => {
    expect(detectBodyType("text/plain", '{"key": "value"}')).toBe("json");
  });

  it("detects HTML body by sniffing when Content-Type is generic", () => {
    expect(detectBodyType("", "<!DOCTYPE html><html><body></body></html>")).toBe("html");
  });

  it("detects XML body by sniffing when Content-Type is generic", () => {
    expect(detectBodyType("", '<?xml version="1.0"?><root/>')).toBe("xml");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run libs/httpclient/__tests__/fetch-engine.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement detectBodyType**

```typescript
// libs/httpclient/fetch-engine.ts
import type { RequestConfig, ResponseBodyType, CookieData } from "./types";

export function detectBodyType(contentType: string, body: string | ArrayBuffer): ResponseBodyType {
  const ct = contentType.toLowerCase();

  if (
    ct.includes("application/json") ||
    (ct.includes("application/vnd.") && ct.includes("+json"))
  ) {
    return "json";
  }
  if (ct.includes("text/html")) {
    return "html";
  }
  if (ct.includes("application/xml") || ct.includes("text/xml")) {
    return "xml";
  }
  if (
    ct.includes("application/octet-stream") ||
    ct.includes("image/") ||
    ct.includes("video/") ||
    ct.includes("audio/") ||
    ct.includes("application/pdf") ||
    ct.includes("application/zip") ||
    ct.includes("application/gzip") ||
    body instanceof ArrayBuffer
  ) {
    return "binary";
  }

  if (typeof body === "string") {
    const trimmed = body.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        JSON.parse(trimmed);
        return "json";
      } catch {
        // not valid JSON
      }
    }
    if (trimmed.startsWith("<!doctype") || trimmed.startsWith("<html")) {
      return "html";
    }
    if (trimmed.startsWith("<?xml")) {
      return "xml";
    }
  }

  return "text";
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run libs/httpclient/__tests__/fetch-engine.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add libs/httpclient/fetch-engine.ts libs/httpclient/__tests__/fetch-engine.test.ts
git commit -m "feat(httpclient): add detectBodyType with tests"
```

---

### Task 3: parseSetCookieHeaders — Tests First

**Files:**

- Modify: `libs/httpclient/__tests__/fetch-engine.test.ts`
- Modify: `libs/httpclient/fetch-engine.ts`

- [ ] **Step 1: Add failing tests for parseSetCookieHeaders**

Append to `libs/httpclient/__tests__/fetch-engine.test.ts`:

```typescript
import { parseSetCookieHeaders } from "../fetch-engine";

describe("parseSetCookieHeaders", () => {
  it("returns empty array when no Set-Cookie headers", () => {
    const headers = new Headers();
    expect(parseSetCookieHeaders(headers)).toEqual([]);
  });

  it("parses a simple Set-Cookie header", () => {
    const headers = new Headers();
    headers.append("Set-Cookie", "session=abc123");
    const result = parseSetCookieHeaders(headers);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: "session",
      value: "abc123",
    });
  });

  it("parses Set-Cookie with all attributes", () => {
    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      "token=xyz; Path=/api; Expires=Wed, 09 Jun 2026 10:18:14 GMT; HttpOnly; Secure; SameSite=Strict"
    );
    const result = parseSetCookieHeaders(headers);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: "token",
      value: "xyz",
      path: "/api",
      expires: "Wed, 09 Jun 2026 10:18:14 GMT",
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
  });

  it("parses multiple Set-Cookie headers", () => {
    const headers = new Headers();
    headers.append("Set-Cookie", "a=1");
    headers.append("Set-Cookie", "b=2; HttpOnly");
    const result = parseSetCookieHeaders(headers);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("a");
    expect(result[1].name).toBe("b");
    expect(result[1].httpOnly).toBe(true);
  });

  it("handles cookie value with equals sign", () => {
    const headers = new Headers();
    headers.append("Set-Cookie", "data=base64==abc; Path=/");
    const result = parseSetCookieHeaders(headers);
    expect(result[0].value).toBe("base64==abc");
    expect(result[0].path).toBe("/");
  });

  it("handles SameSite=Lax", () => {
    const headers = new Headers();
    headers.append("Set-Cookie", "sid=123; SameSite=Lax");
    const result = parseSetCookieHeaders(headers);
    expect(result[0].sameSite).toBe("Lax");
  });

  it("handles SameSite=None", () => {
    const headers = new Headers();
    headers.append("Set-Cookie", "sid=123; SameSite=None");
    const result = parseSetCookieHeaders(headers);
    expect(result[0].sameSite).toBe("None");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run libs/httpclient/__tests__/fetch-engine.test.ts`
Expected: FAIL — parseSetCookieHeaders not found or tests for it fail

- [ ] **Step 3: Implement parseSetCookieHeaders**

Append to `libs/httpclient/fetch-engine.ts`:

```typescript
export function parseSetCookieHeaders(headers: Headers): CookieData[] {
  const setCookie = headers.getSetCookie?.();
  if (!setCookie || setCookie.length === 0) {
    return [];
  }

  return setCookie.map((header: string) => {
    const parts = header.split(";").map((p) => p.trim());
    const [nameValue, ...attributes] = parts;
    const eqIndex = nameValue.indexOf("=");
    const name = eqIndex >= 0 ? nameValue.substring(0, eqIndex) : nameValue;
    const value = eqIndex >= 0 ? nameValue.substring(eqIndex + 1) : "";

    const cookie: CookieData = { name, value };

    for (const attr of attributes) {
      const attrLower = attr.toLowerCase();
      if (attrLower === "httponly") {
        cookie.httpOnly = true;
      } else if (attrLower === "secure") {
        cookie.secure = true;
      } else if (attrLower.startsWith("samesite=")) {
        cookie.sameSite = attr.substring("samesite=".length);
      } else if (attrLower.startsWith("path=")) {
        cookie.path = attr.substring("path=".length);
      } else if (attrLower.startsWith("expires=")) {
        cookie.expires = attr.substring("expires=".length);
      }
    }

    return cookie;
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run libs/httpclient/__tests__/fetch-engine.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add libs/httpclient/fetch-engine.ts libs/httpclient/__tests__/fetch-engine.test.ts
git commit -m "feat(httpclient): add parseSetCookieHeaders with tests"
```

---

### Task 4: buildRequest — Tests First

**Files:**

- Modify: `libs/httpclient/__tests__/fetch-engine.test.ts`
- Modify: `libs/httpclient/fetch-engine.ts`

- [ ] **Step 1: Add failing tests for buildRequest**

Append to `libs/httpclient/__tests__/fetch-engine.test.ts`:

```typescript
import { buildRequest } from "../fetch-engine";
import type { RequestConfig } from "../types";
import { DEFAULT_REQUEST_CONFIG } from "../types";

describe("buildRequest", () => {
  const baseConfig: RequestConfig = {
    ...DEFAULT_REQUEST_CONFIG,
    url: "https://api.example.com/users",
  };

  it("builds a basic GET request", () => {
    const { request, controller } = buildRequest(baseConfig, 30000);
    expect(request.method).toBe("GET");
    expect(request.url).toBe("https://api.example.com/users");
    controller.abort();
  });

  it("merges params into URL query string", () => {
    const config: RequestConfig = {
      ...baseConfig,
      params: [
        { key: "page", value: "1", enabled: true },
        { key: "limit", value: "10", enabled: true },
      ],
    };
    const { request, controller } = buildRequest(config, null);
    expect(request.url).toBe("https://api.example.com/users?page=1&limit=10");
    controller.abort();
  });

  it("skips disabled params", () => {
    const config: RequestConfig = {
      ...baseConfig,
      params: [
        { key: "page", value: "1", enabled: true },
        { key: "disabled", value: "x", enabled: false },
      ],
    };
    const { request, controller } = buildRequest(config, null);
    expect(request.url).toBe("https://api.example.com/users?page=1");
    controller.abort();
  });

  it("preserves existing query params in URL", () => {
    const config: RequestConfig = {
      ...baseConfig,
      url: "https://api.example.com/users?existing=yes",
      params: [{ key: "new", value: "1", enabled: true }],
    };
    const { request, controller } = buildRequest(config, null);
    expect(request.url).toContain("existing=yes");
    expect(request.url).toContain("new=1");
    controller.abort();
  });

  it("adds JSON body with Content-Type header", async () => {
    const config: RequestConfig = {
      ...baseConfig,
      method: "POST",
      bodyType: "json",
      bodyContent: '{"name":"test"}',
    };
    const { request, controller } = buildRequest(config, null);
    expect(request.method).toBe("POST");
    expect(request.headers.get("Content-Type")).toBe("application/json");
    const body = await request.text();
    expect(body).toBe('{"name":"test"}');
    controller.abort();
  });

  it("adds urlencoded body with Content-Type header", async () => {
    const config: RequestConfig = {
      ...baseConfig,
      method: "POST",
      bodyType: "urlencoded",
      formData: [
        { key: "user", value: "john", enabled: true },
        { key: "pass", value: "secret", enabled: true },
      ],
    };
    const { request, controller } = buildRequest(config, null);
    expect(request.headers.get("Content-Type")).toBe("application/x-www-form-urlencoded");
    const body = await request.text();
    expect(body).toBe("user=john&pass=secret");
    controller.abort();
  });

  it("adds raw body without Content-Type header", async () => {
    const config: RequestConfig = {
      ...baseConfig,
      method: "POST",
      bodyType: "raw",
      bodyContent: "plain text body",
    };
    const { request, controller } = buildRequest(config, null);
    expect(request.headers.get("Content-Type")).toBeNull();
    const body = await request.text();
    expect(body).toBe("plain text body");
    controller.abort();
  });

  it("adds no body for none type", () => {
    const config: RequestConfig = {
      ...baseConfig,
      method: "GET",
      bodyType: "none",
    };
    const { request, controller } = buildRequest(config, null);
    expect(request.body).toBeNull();
    controller.abort();
  });

  it("adds Bearer auth header", () => {
    const config: RequestConfig = {
      ...baseConfig,
      authType: "bearer",
      bearerToken: "my-token-123",
    };
    const { request, controller } = buildRequest(config, null);
    expect(request.headers.get("Authorization")).toBe("Bearer my-token-123");
    controller.abort();
  });

  it("adds Basic auth header", () => {
    const config: RequestConfig = {
      ...baseConfig,
      authType: "basic",
      basicUser: "user",
      basicPass: "pass",
    };
    const { request, controller } = buildRequest(config, null);
    expect(request.headers.get("Authorization")).toBe(`Basic ${btoa("user:pass")}`);
    controller.abort();
  });

  it("adds custom headers from config", () => {
    const config: RequestConfig = {
      ...baseConfig,
      headers: [
        { key: "X-Custom", value: "value1", enabled: true },
        { key: "X-Another", value: "value2", enabled: true },
      ],
    };
    const { request, controller } = buildRequest(config, null);
    expect(request.headers.get("X-Custom")).toBe("value1");
    expect(request.headers.get("X-Another")).toBe("value2");
    controller.abort();
  });

  it("skips disabled custom headers", () => {
    const config: RequestConfig = {
      ...baseConfig,
      headers: [
        { key: "X-Enabled", value: "yes", enabled: true },
        { key: "X-Disabled", value: "no", enabled: false },
      ],
    };
    const { request, controller } = buildRequest(config, null);
    expect(request.headers.get("X-Enabled")).toBe("yes");
    expect(request.headers.get("X-Disabled")).toBeNull();
    controller.abort();
  });

  it("creates AbortController with timeout", () => {
    const { controller } = buildRequest(baseConfig, 5000);
    expect(controller.signal.aborted).toBe(false);
    controller.abort();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run libs/httpclient/__tests__/fetch-engine.test.ts`
Expected: FAIL — buildRequest not found

- [ ] **Step 3: Implement buildRequest**

Append to `libs/httpclient/fetch-engine.ts`:

```typescript
export function buildRequest(
  config: RequestConfig,
  timeoutMs: number | null
): { request: Request; controller: AbortController } {
  const controller = new AbortController();

  const url = buildUrl(config.url, config.params);

  const headers = new Headers();
  for (const h of config.headers) {
    if (h.enabled && h.key) {
      headers.set(h.key, h.value);
    }
  }

  if (config.authType === "bearer" && config.bearerToken) {
    headers.set("Authorization", `Bearer ${config.bearerToken}`);
  } else if (config.authType === "basic" && config.basicUser) {
    headers.set("Authorization", `Basic ${btoa(`${config.basicUser}:${config.basicPass}`)}`);
  }

  let body: BodyInit | null = null;
  if (config.bodyType === "json") {
    headers.set("Content-Type", "application/json");
    body = config.bodyContent;
  } else if (config.bodyType === "urlencoded") {
    headers.set("Content-Type", "application/x-www-form-urlencoded");
    const enabled = config.formData.filter((p) => p.enabled && p.key);
    body = enabled
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join("&");
  } else if (config.bodyType === "form-data") {
    const fd = new FormData();
    for (const p of config.formData) {
      if (p.enabled && p.key) {
        fd.append(p.key, p.value);
      }
    }
    body = fd;
  } else if (config.bodyType === "raw") {
    body = config.bodyContent;
  }

  const request = new Request(url, {
    method: config.method,
    headers,
    body: config.method === "GET" || config.method === "HEAD" ? null : body,
    signal: controller.signal,
  });

  if (timeoutMs !== null) {
    setTimeout(() => controller.abort(), timeoutMs);
  }

  return { request, controller };
}

function buildUrl(baseUrl: string, params: RequestConfig["params"]): string {
  const url = new URL(baseUrl, "http://localhost");

  for (const p of params) {
    if (p.enabled && p.key) {
      url.searchParams.append(p.key, p.value);
    }
  }

  const result = url.toString();
  if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) {
    return result.replace("http://localhost", "");
  }
  return result;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run libs/httpclient/__tests__/fetch-engine.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add libs/httpclient/fetch-engine.ts libs/httpclient/__tests__/fetch-engine.test.ts
git commit -m "feat(httpclient): add buildRequest with tests"
```

---

### Task 5: parseResponse — Tests First

**Files:**

- Modify: `libs/httpclient/__tests__/fetch-engine.test.ts`
- Modify: `libs/httpclient/fetch-engine.ts`

- [ ] **Step 1: Add failing tests for parseResponse**

Append to `libs/httpclient/__tests__/fetch-engine.test.ts`:

```typescript
import { parseResponse } from "../fetch-engine";

describe("parseResponse", () => {
  it("parses a JSON response", async () => {
    const raw = new Response('{"status":"ok"}', {
      status: 200,
      statusText: "OK",
      headers: { "Content-Type": "application/json" },
    });
    const startTime = Date.now() - 50;
    const result = await parseResponse(raw, startTime);
    expect(result.status).toBe(200);
    expect(result.statusText).toBe("OK");
    expect(result.bodyType).toBe("json");
    expect(result.body).toBe('{"status":"ok"}');
    expect(result.size).toBe('{"status":"ok"}'.length);
    expect(result.timing.total).toBeGreaterThanOrEqual(50);
    expect(result.redirected).toBe(false);
    expect(result.cookies).toEqual([]);
  });

  it("parses response headers into a record", async () => {
    const raw = new Response("hello", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "X-Custom": "value",
      },
    });
    const result = await parseResponse(raw, Date.now());
    expect(result.headers["content-type"]).toBe("text/plain");
    expect(result.headers["x-custom"]).toBe("value");
  });

  it("detects HTML response", async () => {
    const raw = new Response("<html><body>Hello</body></html>", {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
    const result = await parseResponse(raw, Date.now());
    expect(result.bodyType).toBe("html");
  });

  it("stores the final URL and redirect status", async () => {
    const raw = new Response("ok", {
      status: 200,
    });
    Object.defineProperty(raw, "url", { value: "https://example.com/final", writable: false });
    Object.defineProperty(raw, "redirected", { value: true, writable: false });
    const result = await parseResponse(raw, Date.now());
    expect(result.finalUrl).toBe("https://example.com/final");
    expect(result.redirected).toBe(true);
  });

  it("records timestamp", async () => {
    const raw = new Response("ok", { status: 200 });
    const before = Date.now();
    const result = await parseResponse(raw, Date.now());
    expect(result.timestamp).toBeGreaterThanOrEqual(before);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run libs/httpclient/__tests__/fetch-engine.test.ts`
Expected: FAIL — parseResponse not found

- [ ] **Step 3: Implement parseResponse**

Append to `libs/httpclient/fetch-engine.ts`:

```typescript
export async function parseResponse(response: Response, startTime: number): Promise<ResponseData> {
  const contentType = response.headers.get("Content-Type") || "";
  let body: string;
  let size: number;

  const tentativeType = detectBodyType(contentType, "");
  if (tentativeType === "binary") {
    const buffer = await response.arrayBuffer();
    body = bufferToString(buffer);
    size = buffer.byteLength;
  } else {
    body = await response.text();
    size = new TextEncoder().encode(body).length;
  }

  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const bodyType = detectBodyType(contentType, body);

  return {
    status: response.status,
    statusText: response.statusText,
    headers,
    body,
    bodyType,
    size,
    timing: { total: Date.now() - startTime },
    cookies: parseSetCookieHeaders(response.headers),
    redirected: response.redirected,
    finalUrl: response.url,
    timestamp: Date.now(),
  };
}

function bufferToString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const lines: string[] = [];
  for (let offset = 0; offset < bytes.length && offset < 4096; offset += 16) {
    const slice = bytes.slice(offset, Math.min(offset + 16, bytes.length));
    const hex = Array.from(slice)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ");
    const ascii = Array.from(slice)
      .map((b) => (b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : "."))
      .join("");
    const addr = offset.toString(16).padStart(8, "0");
    lines.push(`${addr}  ${hex.padEnd(48)}  |${ascii}|`);
  }
  if (bytes.length > 4096) {
    lines.push(`... (${bytes.length - 4096} more bytes)`);
  }
  return lines.join("\n");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run libs/httpclient/__tests__/fetch-engine.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add libs/httpclient/fetch-engine.ts libs/httpclient/__tests__/fetch-engine.test.ts
git commit -m "feat(httpclient): add parseResponse with tests"
```

---

### Task 6: Tool Registration

**Files:**

- Modify: `libs/tools.ts`
- Modify: `libs/storage-keys.ts`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Add httpclient to TOOLS array in `libs/tools.ts`**

Add `Send` to the lucide-react import at line 3-31:

```typescript
import {
  FileJson,
  FileCode,
  FileBraces,
  ShieldCheck,
  Percent,
  FingerprintPattern,
  Regex,
  QrCode,
  GitCompare,
  Hash,
  KeyRound,
  CaseSensitive,
  Lock,
  Clock,
  Timer,
  FileText,
  Database,
  FileCheck,
  HardDrive,
  Type,
  Code,
  Globe,
  Palette,
  Binary,
  Table,
  FileSpreadsheet,
  ImageDown,
  Send,
} from "lucide-react";
```

Add entry to `TOOLS` array after the `ascii` entry (line 112):

```typescript
  { key: "httpclient", path: "/httpclient", icon: Send },
```

Add `"httpclient"` to `reference` category in `TOOL_CATEGORIES` (line 63):

```typescript
  { key: "reference", tools: ["httpstatus", "httpclient", "dbviewer", "ascii", "htmlcode"] },
```

- [ ] **Step 2: Add storage key in `libs/storage-keys.ts`**

Add `httpclientHistory` key after `homeViewMode` (line 11):

```typescript
export const STORAGE_KEYS = {
  savedPasswords: "okrun:sp",
  diff: "okrun:diff",
  markdown: "okrun:md",
  dbviewerHistory: "okrun:dbviewer:history",
  cron: "okrun:cron",
  qrcode: "okrun:qrcode",
  color: "okrun:color:history",
  floatingToolbarPosition: "okrun:ftp",
  recentTools: "okrun:recent-tools",
  homeViewMode: "okrun:home-view",
  httpclientHistory: "okrun:httpclient:history",
} as const;
```

- [ ] **Step 3: Add test include in `vitest.config.ts`**

Add `"libs/httpclient/**/*.test.ts"` to the include array (after line 15):

```typescript
    include: [
      "libs/dbviewer/**/*.test.ts",
      "libs/unixtime/**/*.test.ts",
      "libs/cron/**/*.test.ts",
      "libs/qrcode/**/*.test.ts",
      "libs/textcase/**/*.test.ts",
      "libs/color/**/*.test.ts",
      "libs/regex/**/*.test.ts",
      "libs/csv/**/*.test.ts",
      "libs/numbase/**/*.test.ts",
      "libs/image/**/*.test.ts",
      "libs/httpclient/**/*.test.ts",
      "libs/__tests__/*.test.ts",
      "hooks/**/*.test.ts",
    ],
```

- [ ] **Step 4: Run all tests to verify nothing broke**

Run: `npx vitest run libs/httpclient/__tests__/fetch-engine.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add libs/tools.ts libs/storage-keys.ts vitest.config.ts
git commit -m "feat(httpclient): register tool, storage key, and test config"
```

---

### Task 7: Route Entry Page

**Files:**

- Create: `app/[locale]/httpclient/page.tsx`

- [ ] **Step 1: Create the route entry page**

```typescript
// app/[locale]/httpclient/page.tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import HttpClientPage from "./httpclient-page";

const PATH = "/httpclient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("httpclient.title"),
    description: t("httpclient.description"),
  });
}

export default function HttpClientRoute() {
  return <HttpClientPage />;
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: May have errors because `httpclient-page.tsx` doesn't exist yet — that's OK for Part 1. The page component will be created in Part 2.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/httpclient/page.tsx
git commit -m "feat(httpclient): add route entry page"
```

---

## Self-Review Checklist

**1. Spec coverage:**

- ✅ All type definitions from spec Data Model section
- ✅ `buildRequest` — request building with all body types, auth, params
- ✅ `parseResponse` — response parsing with body detection
- ✅ `detectBodyType` — content type detection
- ✅ `parseSetCookieHeaders` — cookie parsing
- ✅ Tool registration in TOOLS and TOOL_CATEGORIES
- ✅ Storage key for history
- ✅ Vitest config update
- ✅ Route entry page

**2. Placeholder scan:** No TBD/TODO found. All steps contain complete code.

**3. Type consistency:** All exports use types from `types.ts`. Function signatures match across test and implementation.
