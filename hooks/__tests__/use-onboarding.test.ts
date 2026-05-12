// @vitest-environment jsdom
import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOnboarding, getOnboardingState } from "../use-onboarding";

function createLocalStorage(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i: number) => Object.keys(store)[i] ?? null,
  };
}

beforeAll(() => {
  if (!globalThis.localStorage) {
    Object.defineProperty(globalThis, "localStorage", {
      value: createLocalStorage(),
      writable: true,
      configurable: true,
    });
  }
});

describe("useOnboarding", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns shouldShow: true when flag is absent", () => {
    const { result } = renderHook(() => useOnboarding("test-key"));
    expect(result.current.shouldShow).toBe(true);
  });

  it("returns shouldShow: false when flag is already set", () => {
    localStorage.setItem("test-key", "true");
    const { result } = renderHook(() => useOnboarding("test-key"));
    expect(result.current.shouldShow).toBe(false);
  });

  it("dismiss() writes flag and sets shouldShow to false", () => {
    const { result } = renderHook(() => useOnboarding("test-key"));
    expect(result.current.shouldShow).toBe(true);

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.shouldShow).toBe(false);
    expect(localStorage.getItem("test-key")).toBe("true");
  });

  it("returns shouldShow: false when window is undefined (SSR)", () => {
    const originalWindow = globalThis.window;
    try {
      Object.defineProperty(globalThis, "window", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      expect(getOnboardingState("ssr-key")).toBe(true);
    } finally {
      globalThis.window = originalWindow;
    }
  });
});
