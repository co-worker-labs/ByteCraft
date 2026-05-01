// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRecentTools } from "../use-recent-tools";
import { STORAGE_KEYS } from "../../libs/storage-keys";

describe("useRecentTools", () => {
  it("returns empty array on first use", () => {
    localStorage.clear();
    const { result } = renderHook(() => useRecentTools());
    expect(result.current.recentTools).toEqual([]);
  });

  it("tracks tool usage and prepends to list", () => {
    localStorage.clear();
    const { result } = renderHook(() => useRecentTools());

    act(() => {
      result.current.trackUsage("json");
    });
    expect(result.current.recentTools).toEqual(["json"]);

    act(() => {
      result.current.trackUsage("base64");
    });
    expect(result.current.recentTools).toEqual(["base64", "json"]);
  });

  it("moves existing tool to front on re-use", () => {
    localStorage.clear();
    const { result } = renderHook(() => useRecentTools());

    act(() => {
      result.current.trackUsage("json");
      result.current.trackUsage("base64");
      result.current.trackUsage("jwt");
    });
    expect(result.current.recentTools).toEqual(["jwt", "base64", "json"]);

    act(() => {
      result.current.trackUsage("json");
    });
    expect(result.current.recentTools).toEqual(["json", "jwt", "base64"]);
  });

  it("caps at MAX_RECENT_TOOLS (10)", () => {
    localStorage.clear();
    const { result } = renderHook(() => useRecentTools());

    const tools = Array.from({ length: 12 }, (_, i) => `tool-${i}`);
    act(() => {
      tools.forEach((t) => result.current.trackUsage(t));
    });

    expect(result.current.recentTools).toHaveLength(10);
    expect(result.current.recentTools[0]).toBe("tool-11");
  });

  it("persists to localStorage", () => {
    localStorage.clear();
    const { result } = renderHook(() => useRecentTools());

    act(() => {
      result.current.trackUsage("json");
      result.current.trackUsage("base64");
    });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.recentTools) ?? "[]");
    expect(stored).toEqual(["base64", "json"]);
  });
});
