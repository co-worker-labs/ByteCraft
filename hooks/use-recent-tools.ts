"use client";

import { useState } from "react";
import { STORAGE_KEYS } from "../libs/storage-keys";

const MAX_RECENT_TOOLS = 10;

function loadRecentTools(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.recentTools);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function saveRecentTools(tools: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.recentTools, JSON.stringify(tools));
  } catch {
    // quota exceeded or unavailable
  }
}

export function useRecentTools() {
  const [recentTools, setRecentTools] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    return loadRecentTools();
  });

  const trackUsage = (toolKey: string) => {
    setRecentTools((prev) => {
      const filtered = prev.filter((k) => k !== toolKey);
      const updated = [toolKey, ...filtered].slice(0, MAX_RECENT_TOOLS);
      saveRecentTools(updated);
      return updated;
    });
  };

  return { recentTools, trackUsage };
}
