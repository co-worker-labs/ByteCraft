"use client";

import { useState, useCallback } from "react";
import type { RequestConfig, ResponseData, RequestError, HistoryEntry, TimingInfo } from "./types";
import { DEFAULT_REQUEST_CONFIG } from "./types";
import { STORAGE_KEYS } from "../storage-keys";
import { buildRequest, parseResponse } from "./fetch-engine";

const MAX_HISTORY = 50;

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.httpclientHistory);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.httpclientHistory, JSON.stringify(entries));
  } catch {
    // localStorage quota exceeded
  }
}

function extractTiming(url: string, startTime: number, endTime: number): TimingInfo {
  const total = endTime - startTime;
  const entries = performance.getEntriesByName(url, "resource") as PerformanceResourceTiming[];
  const entry = entries[entries.length - 1];
  if (entry && entry.responseStart > 0) {
    return {
      ttfb: Math.round(entry.responseStart - entry.startTime),
      download: Math.round(entry.responseEnd - entry.responseStart),
      total,
    };
  }
  return { total };
}

export function useHttpClient() {
  const [requestConfig, setRequestConfig] = useState<RequestConfig>(DEFAULT_REQUEST_CONFIG);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [error, setError] = useState<RequestError | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [timeout, setTimeoutValue] = useState<number | null>(30000);

  const sendRequest = useCallback(
    async (config?: RequestConfig) => {
      const cfg = config ?? requestConfig;
      if (!cfg.url.trim()) return;

      setLoading(true);
      setError(null);
      setResponse(null);

      const startTime = Date.now();

      try {
        const { request, controller } = buildRequest(cfg, timeout);
        const fetchResponse = await fetch(request);
        const endTime = Date.now();

        let parsed = await parseResponse(fetchResponse, startTime);
        const timing = extractTiming(request.url, startTime, endTime);
        parsed = { ...parsed, timing };

        setResponse(parsed);

        const entry: HistoryEntry = {
          id: crypto.randomUUID(),
          request: cfg,
          responseStatus: parsed.status,
          responseStatusText: parsed.statusText,
          createdAt: Date.now(),
        };
        setHistory((prev) => {
          const next = [entry, ...prev].slice(0, MAX_HISTORY);
          saveHistory(next);
          return next;
        });
      } catch (err: unknown) {
        const endTime = Date.now();
        const msg = err instanceof Error ? err.message : String(err);
        const isCors =
          err instanceof TypeError ||
          msg.includes("CORS") ||
          msg.includes("NetworkError") ||
          msg.includes("Failed to fetch");
        const isTimeout =
          err instanceof DOMException &&
          err.name === "AbortError" &&
          endTime - startTime >= (timeout ?? Infinity) - 500;

        setError({
          message: isTimeout ? "timeout" : isCors ? "cors" : msg,
          isCors,
          isTimeout,
          timestamp: Date.now(),
        });
      } finally {
        setLoading(false);
      }
    },
    [requestConfig, timeout]
  );

  const restoreFromHistory = useCallback((entry: HistoryEntry) => {
    setRequestConfig(entry.request);
    setResponse(null);
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  return {
    requestConfig,
    setRequestConfig,
    response,
    error,
    loading,
    history,
    timeout,
    setTimeoutValue,
    sendRequest,
    restoreFromHistory,
    clearHistory,
  };
}
