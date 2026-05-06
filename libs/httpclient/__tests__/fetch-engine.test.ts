import { describe, it, expect } from "vitest";
import {
  detectBodyType,
  parseSetCookieHeaders,
  buildRequest,
  parseResponse,
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

  it("adds raw body without explicit Content-Type header", async () => {
    const config: RequestConfig = {
      ...baseConfig,
      method: "POST",
      bodyType: "raw",
      bodyContent: "plain text body",
    };
    const { request, controller } = buildRequest(config, null);
    const ct = request.headers.get("Content-Type");
    expect(ct === null || (ct && ct.includes("text/plain"))).toBe(true);
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
