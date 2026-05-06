import { describe, it, expect } from "vitest";
import {
  detectBodyType,
  parseSetCookieHeaders,
  buildProxyPayload,
  parseProxyResponse,
} from "../fetch-engine";
import type { RequestConfig } from "../types";
import { DEFAULT_REQUEST_CONFIG } from "../types";

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

  it("detects JSON from body content when no Content-Type hint", () => {
    expect(detectBodyType("text/plain", '{"key":"value"}')).toBe("json");
  });

  it("detects JSON array from body content", () => {
    expect(detectBodyType("text/plain", "[1,2,3]")).toBe("json");
  });

  it("detects HTML from body content starting with <!doctype", () => {
    expect(detectBodyType("text/plain", "<!DOCTYPE html>")).toBe("html");
  });

  it("detects HTML from body content starting with <html", () => {
    expect(detectBodyType("text/plain", "<html><body>")).toBe("html");
  });

  it("detects XML from body starting with <?xml", () => {
    expect(detectBodyType("text/plain", '<?xml version="1.0"?>')).toBe("xml");
  });

  it("returns text for unrecognized content", () => {
    expect(detectBodyType("application/unknown", "some data")).toBe("text");
  });

  it("returns text for empty string", () => {
    expect(detectBodyType("text/plain", "")).toBe("text");
  });
});

describe("parseSetCookieHeaders", () => {
  it("parses a simple cookie", () => {
    const result = parseSetCookieHeaders(["session=abc123"]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("session");
    expect(result[0].value).toBe("abc123");
  });

  it("parses cookie with attributes", () => {
    const result = parseSetCookieHeaders(["sid=xyz; Path=/; HttpOnly; Secure"]);
    expect(result[0].path).toBe("/");
    expect(result[0].httpOnly).toBe(true);
    expect(result[0].secure).toBe(true);
  });

  it("handles SameSite=Lax", () => {
    const result = parseSetCookieHeaders(["sid=123; SameSite=Lax"]);
    expect(result[0].sameSite).toBe("Lax");
  });

  it("handles SameSite=None", () => {
    const result = parseSetCookieHeaders(["sid=123; SameSite=None"]);
    expect(result[0].sameSite).toBe("None");
  });

  it("returns empty array for empty input", () => {
    expect(parseSetCookieHeaders([])).toEqual([]);
  });

  it("parses multiple cookies", () => {
    const result = parseSetCookieHeaders(["a=1", "b=2"]);
    expect(result).toHaveLength(2);
  });

  it("parses Expires attribute", () => {
    const result = parseSetCookieHeaders(["sid=123; Expires=Wed, 09 Jun 2021 10:18:14 GMT"]);
    expect(result[0].expires).toBe("Wed, 09 Jun 2021 10:18:14 GMT");
  });

  it("handles cookie with no value", () => {
    const result = parseSetCookieHeaders(["flag"]);
    expect(result[0].name).toBe("flag");
    expect(result[0].value).toBe("");
  });
});

describe("buildProxyPayload", () => {
  const baseConfig: RequestConfig = {
    ...DEFAULT_REQUEST_CONFIG,
    url: "https://api.example.com/users",
  };

  it("builds a basic GET payload", () => {
    const payload = buildProxyPayload(baseConfig, 30000);
    expect(payload.method).toBe("GET");
    expect(payload.url).toBe("https://api.example.com/users");
    expect(payload.body).toBeNull();
    expect(payload.timeout).toBe(30000);
  });

  it("merges params into URL query string", () => {
    const config: RequestConfig = {
      ...baseConfig,
      params: [
        { key: "page", value: "1", enabled: true },
        { key: "limit", value: "10", enabled: true },
      ],
    };
    const payload = buildProxyPayload(config, null);
    expect(payload.url).toBe("https://api.example.com/users?page=1&limit=10");
  });

  it("skips disabled params", () => {
    const config: RequestConfig = {
      ...baseConfig,
      params: [
        { key: "page", value: "1", enabled: true },
        { key: "disabled", value: "x", enabled: false },
      ],
    };
    const payload = buildProxyPayload(config, null);
    expect(payload.url).toBe("https://api.example.com/users?page=1");
  });

  it("preserves existing query params in URL", () => {
    const config: RequestConfig = {
      ...baseConfig,
      url: "https://api.example.com/users?existing=yes",
      params: [{ key: "new", value: "1", enabled: true }],
    };
    const payload = buildProxyPayload(config, null);
    expect(payload.url).toContain("existing=yes");
    expect(payload.url).toContain("new=1");
  });

  it("adds JSON body with Content-Type header", () => {
    const config: RequestConfig = {
      ...baseConfig,
      method: "POST",
      bodyType: "json",
      bodyContent: '{"name":"test"}',
    };
    const payload = buildProxyPayload(config, null);
    expect(payload.method).toBe("POST");
    expect(payload.headers["Content-Type"]).toBe("application/json");
    expect(payload.body).toBe('{"name":"test"}');
  });

  it("adds urlencoded body with Content-Type header", () => {
    const config: RequestConfig = {
      ...baseConfig,
      method: "POST",
      bodyType: "urlencoded",
      formData: [
        { key: "user", value: "john", enabled: true },
        { key: "pass", value: "secret", enabled: true },
      ],
    };
    const payload = buildProxyPayload(config, null);
    expect(payload.headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    expect(payload.body).toBe("user=john&pass=secret");
  });

  it("adds raw body without explicit Content-Type header", () => {
    const config: RequestConfig = {
      ...baseConfig,
      method: "POST",
      bodyType: "raw",
      bodyContent: "plain text body",
    };
    const payload = buildProxyPayload(config, null);
    expect(payload.body).toBe("plain text body");
    expect(payload.headers["Content-Type"]).toBeUndefined();
  });

  it("adds no body for none type", () => {
    const config: RequestConfig = {
      ...baseConfig,
      method: "GET",
      bodyType: "none",
    };
    const payload = buildProxyPayload(config, null);
    expect(payload.body).toBeNull();
  });

  it("adds Bearer auth header", () => {
    const config: RequestConfig = {
      ...baseConfig,
      authType: "bearer",
      bearerToken: "my-token-123",
    };
    const payload = buildProxyPayload(config, null);
    expect(payload.headers["Authorization"]).toBe("Bearer my-token-123");
  });

  it("adds Basic auth header", () => {
    const config: RequestConfig = {
      ...baseConfig,
      authType: "basic",
      basicUser: "user",
      basicPass: "pass",
    };
    const payload = buildProxyPayload(config, null);
    expect(payload.headers["Authorization"]).toBe(`Basic ${btoa("user:pass")}`);
  });

  it("adds custom headers from config", () => {
    const config: RequestConfig = {
      ...baseConfig,
      headers: [
        { key: "X-Custom", value: "value1", enabled: true },
        { key: "X-Another", value: "value2", enabled: true },
      ],
    };
    const payload = buildProxyPayload(config, null);
    expect(payload.headers["X-Custom"]).toBe("value1");
    expect(payload.headers["X-Another"]).toBe("value2");
  });

  it("skips disabled custom headers", () => {
    const config: RequestConfig = {
      ...baseConfig,
      headers: [
        { key: "X-Enabled", value: "yes", enabled: true },
        { key: "X-Disabled", value: "no", enabled: false },
      ],
    };
    const payload = buildProxyPayload(config, null);
    expect(payload.headers["X-Enabled"]).toBe("yes");
    expect(payload.headers["X-Disabled"]).toBeUndefined();
  });

  it("sets body to null for GET and HEAD regardless of bodyType", () => {
    const config: RequestConfig = {
      ...baseConfig,
      method: "GET",
      bodyType: "json",
      bodyContent: '{"data":1}',
    };
    const payload = buildProxyPayload(config, null);
    expect(payload.body).toBeNull();
  });
});

describe("parseProxyResponse", () => {
  it("parses a JSON proxy response", () => {
    const data = {
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      body: '{"status":"ok"}',
      size: 15,
      timing: { total: 120 },
      redirected: false,
      finalUrl: "https://api.example.com/users",
    };
    const result = parseProxyResponse(data, Date.now() - 50);
    expect(result.status).toBe(200);
    expect(result.statusText).toBe("OK");
    expect(result.bodyType).toBe("json");
    expect(result.body).toBe('{"status":"ok"}');
    expect(result.size).toBe(15);
    expect(result.redirected).toBe(false);
    expect(result.cookies).toEqual([]);
  });

  it("parses response with set-cookie header", () => {
    const data = {
      status: 200,
      statusText: "OK",
      headers: { "content-type": "text/plain", "set-cookie": "sid=abc; Path=/" },
      body: "ok",
      size: 2,
      timing: { total: 50 },
      redirected: false,
      finalUrl: "https://example.com",
    };
    const result = parseProxyResponse(data, Date.now());
    expect(result.cookies).toHaveLength(1);
    expect(result.cookies[0].name).toBe("sid");
    expect(result.cookies[0].value).toBe("abc");
    expect(result.cookies[0].path).toBe("/");
  });

  it("detects HTML response", () => {
    const data = {
      status: 200,
      statusText: "OK",
      headers: { "content-type": "text/html" },
      body: "<html><body>Hello</body></html>",
      size: 33,
      timing: { total: 30 },
      redirected: false,
      finalUrl: "https://example.com",
    };
    const result = parseProxyResponse(data, Date.now());
    expect(result.bodyType).toBe("html");
  });

  it("records timestamp", () => {
    const data = {
      status: 200,
      statusText: "OK",
      headers: {},
      body: "ok",
      size: 2,
      timing: { total: 10 },
      redirected: false,
      finalUrl: "https://example.com",
    };
    const before = Date.now();
    const result = parseProxyResponse(data, Date.now());
    expect(result.timestamp).toBeGreaterThanOrEqual(before);
  });
});
