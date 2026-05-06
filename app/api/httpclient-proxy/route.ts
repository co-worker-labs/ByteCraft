import { NextRequest, NextResponse } from "next/server";

const MAX_BODY_SIZE = 5 * 1024 * 1024;
const DEFAULT_TIMEOUT = 30_000;
const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
  "host",
]);

interface ProxyRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
  timeout: number | null;
}

export async function POST(req: NextRequest) {
  let payload: ProxyRequest;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { url, method, headers: reqHeaders, body, timeout } = payload;

  if (!url || !method) {
    return NextResponse.json({ error: "url and method are required" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return NextResponse.json({ error: "only http/https allowed" }, { status: 400 });
  }

  const headers = new Headers();
  for (const [key, value] of Object.entries(reqHeaders)) {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower)) continue;
    headers.set(key, value);
  }

  const timeoutMs = timeout ?? DEFAULT_TIMEOUT;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const startTime = Date.now();

  try {
    const res = await fetch(parsedUrl.toString(), {
      method,
      headers,
      body: ["GET", "HEAD"].includes(method.toUpperCase()) ? null : body,
      signal: controller.signal,
      redirect: "manual",
    });

    const elapsed = Date.now() - startTime;

    const resHeaders: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      if (!HOP_BY_HOP.has(key)) {
        resHeaders[key] = value;
      }
    });

    const contentType = res.headers.get("content-type") || "";
    let resBody: string;
    const buffer = await res.arrayBuffer();

    if (buffer.byteLength > MAX_BODY_SIZE) {
      resBody = `[Response body too large: ${buffer.byteLength} bytes]`;
    } else {
      resBody = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
    }

    return NextResponse.json({
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
      body: resBody,
      size: buffer.byteLength,
      timing: { total: elapsed },
      redirected: [301, 302, 303, 307, 308].includes(res.status),
      finalUrl: res.headers.get("location") || url,
    });
  } catch (err: unknown) {
    const elapsed = Date.now() - startTime;
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeout =
      err instanceof DOMException && err.name === "AbortError" && elapsed >= timeoutMs - 500;

    return NextResponse.json({
      proxyError: true,
      error: isTimeout ? "timeout" : msg,
      isTimeout,
      timing: { total: elapsed },
    });
  } finally {
    clearTimeout(timer);
  }
}
