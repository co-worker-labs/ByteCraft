import type { RequestConfig, ResponseBodyType, CookieData } from "./types";
import type { ResponseData } from "./types";

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
    if (
      trimmed.toLowerCase().startsWith("<!doctype") ||
      trimmed.toLowerCase().startsWith("<html")
    ) {
      return "html";
    }
    if (trimmed.startsWith("<?xml")) {
      return "xml";
    }
  }

  return "text";
}

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
