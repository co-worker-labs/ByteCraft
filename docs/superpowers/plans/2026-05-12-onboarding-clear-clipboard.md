# Onboarding: Clear Clipboard Button Guide — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a one-time onboarding popover on the "Clear Clipboard" button after a first-time user uses any tool, teaching them about this security feature.

**Architecture:** A `useOnboarding` hook reads/writes a localStorage dismissal flag. A reusable `OnboardingPopover` component renders via `createPortal` with fixed positioning, focus management, and Escape key handling. Both Header and FloatingToolbar integrate the hook + popover on their clipboard buttons, gated by `isClipboardSupported` and `recentTools.length > 0`.

**Tech Stack:** React (useState, useEffect, useRef, useCallback, createPortal), Tailwind CSS 4, next-intl, Vitest + @testing-library/react

---

## File Structure

| Action | File                                                  | Responsibility                           |
| ------ | ----------------------------------------------------- | ---------------------------------------- |
| Create | `hooks/use-onboarding.ts`                             | Hook: read/dismiss localStorage flag     |
| Create | `hooks/__tests__/use-onboarding.test.ts`              | Unit tests for the hook                  |
| Create | `components/ui/onboarding-popover.tsx`                | Reusable popover component               |
| Create | `components/ui/__tests__/onboarding-popover.test.tsx` | Component tests                          |
| Modify | `libs/storage-keys.ts`                                | Add `onboardingClearClipboard` key       |
| Modify | `app/globals.css`                                     | Add pulse animation + reduced-motion     |
| Modify | `public/locales/en/common.json`                       | Add onboarding i18n keys                 |
| Modify | `public/locales/zh-CN/common.json`                    | Add onboarding i18n keys                 |
| Modify | `public/locales/zh-TW/common.json`                    | Add onboarding i18n keys                 |
| Modify | `public/locales/ja/common.json`                       | Add onboarding i18n keys                 |
| Modify | `public/locales/ko/common.json`                       | Add onboarding i18n keys                 |
| Modify | `public/locales/es/common.json`                       | Add onboarding i18n keys                 |
| Modify | `public/locales/pt-BR/common.json`                    | Add onboarding i18n keys                 |
| Modify | `public/locales/fr/common.json`                       | Add onboarding i18n keys                 |
| Modify | `public/locales/de/common.json`                       | Add onboarding i18n keys                 |
| Modify | `public/locales/ru/common.json`                       | Add onboarding i18n keys                 |
| Modify | `components/header.tsx`                               | Integrate onboarding on clipboard button |
| Modify | `components/floating-toolbar.tsx`                     | Integrate onboarding on clipboard button |

---

### Task 1: Add storage key

**Files:**

- Modify: `libs/storage-keys.ts:14`

- [ ] **Step 1: Add `onboardingClearClipboard` key**

Add the new key to `STORAGE_KEYS` before the closing `} as const`:

```ts
// In libs/storage-keys.ts, add this line before the closing brace of STORAGE_KEYS:
onboardingClearClipboard: "okrun:onboarding:clear-clipboard",
```

The full `STORAGE_KEYS` object becomes:

```ts
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
  sshkeyDeployTarget: "okrun:sshkey:deploy",
  httpclientHistory: "okrun:httpclient:history",
  walletSelectedChains: "okrun:wallet:chains",
  onboardingClearClipboard: "okrun:onboarding:clear-clipboard",
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add libs/storage-keys.ts
git commit -m "feat(onboarding): add clear-clipboard storage key"
```

---

### Task 2: Create `useOnboarding` hook

**Files:**

- Create: `hooks/use-onboarding.ts`
- Create: `hooks/__tests__/use-onboarding.test.ts`

- [ ] **Step 1: Write the failing test**

Create `hooks/__tests__/use-onboarding.test.ts`:

```ts
// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOnboarding } from "../use-onboarding";

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
      const { result } = renderHook(() => useOnboarding("ssr-key"));
      expect(result.current.shouldShow).toBe(false);
    } finally {
      globalThis.window = originalWindow;
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run hooks/__tests__/use-onboarding.test.ts`
Expected: FAIL — `Cannot find module '../use-onboarding'`

- [ ] **Step 3: Write the hook implementation**

Create `hooks/use-onboarding.ts`:

```ts
"use client";

import { useState } from "react";

export function useOnboarding(storageKey: string) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(storageKey) === "true";
  });

  const dismiss = () => {
    localStorage.setItem(storageKey, "true");
    setDismissed(true);
  };

  return { shouldShow: !dismissed, dismiss };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run hooks/__tests__/use-onboarding.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add hooks/use-onboarding.ts hooks/__tests__/use-onboarding.test.ts
git commit -m "feat(onboarding): add useOnboarding hook with tests"
```

---

### Task 3: Add i18n keys (all 10 locales)

**Files:**

- Modify: `public/locales/en/common.json`
- Modify: `public/locales/zh-CN/common.json`
- Modify: `public/locales/zh-TW/common.json`
- Modify: `public/locales/ja/common.json`
- Modify: `public/locales/ko/common.json`
- Modify: `public/locales/es/common.json`
- Modify: `public/locales/pt-BR/common.json`
- Modify: `public/locales/fr/common.json`
- Modify: `public/locales/de/common.json`
- Modify: `public/locales/ru/common.json`

- [ ] **Step 1: Add onboarding keys to `en/common.json`**

Add an `"onboarding"` section after the `"searchTools"` key at the top level (before the closing `}`):

```json
  "onboarding": {
    "clearClipboardTitle": "Clear Clipboard",
    "clearClipboardDesc": "One-click to clear sensitive data from your browser clipboard",
    "gotIt": "Got it"
  }
```

The end of `en/common.json` should look like:

```json
  "removeItem": "Remove item",
  "searchTools": "Search tools",
  "onboarding": {
    "clearClipboardTitle": "Clear Clipboard",
    "clearClipboardDesc": "One-click to clear sensitive data from your browser clipboard",
    "gotIt": "Got it"
  }
}
```

- [ ] **Step 2: Add onboarding keys to `zh-CN/common.json`**

```json
  "onboarding": {
    "clearClipboardTitle": "清空剪贴板",
    "clearClipboardDesc": "一键清除浏览器剪贴板中的敏感数据",
    "gotIt": "知道了"
  }
```

- [ ] **Step 3: Add onboarding keys to `zh-TW/common.json`**

```json
  "onboarding": {
    "clearClipboardTitle": "清空剪貼簿",
    "clearClipboardDesc": "一鍵清除瀏覽器剪貼簿中的敏感資料",
    "gotIt": "知道了"
  }
```

- [ ] **Step 4: Add onboarding keys to `ja/common.json`**

```json
  "onboarding": {
    "clearClipboardTitle": "クリップボードをクリア",
    "clearClipboardDesc": "ブラウザのクリップボードに残った機密データをワンクリックで消去",
    "gotIt": "了解"
  }
```

- [ ] **Step 5: Add onboarding keys to `ko/common.json`**

```json
  "onboarding": {
    "clearClipboardTitle": "클립보드 지우기",
    "clearClipboardDesc": "브라우저 클립보드에 남은 민감한 데이터를 원클릭으로 삭제",
    "gotIt": "알겠습니다"
  }
```

- [ ] **Step 6: Add onboarding keys to `es/common.json`**

```json
  "onboarding": {
    "clearClipboardTitle": "Limpiar portapapeles",
    "clearClipboardDesc": "Un clic para eliminar datos sensibles del portapapeles de tu navegador",
    "gotIt": "Entendido"
  }
```

- [ ] **Step 7: Add onboarding keys to `pt-BR/common.json`**

```json
  "onboarding": {
    "clearClipboardTitle": "Limpar área de transferência",
    "clearClipboardDesc": "Um clique para remover dados sensíveis da área de transferência do navegador",
    "gotIt": "Entendi"
  }
```

- [ ] **Step 8: Add onboarding keys to `fr/common.json`**

```json
  "onboarding": {
    "clearClipboardTitle": "Vider le presse-papiers",
    "clearClipboardDesc": "En un clic, supprimez les données sensibles de votre presse-papiers",
    "gotIt": "Compris"
  }
```

- [ ] **Step 9: Add onboarding keys to `de/common.json`**

```json
  "onboarding": {
    "clearClipboardTitle": "Zwischenablage leeren",
    "clearClipboardDesc": "Mit einem Klick sensible Daten aus der Zwischenablage entfernen",
    "gotIt": "Verstanden"
  }
```

- [ ] **Step 10: Add onboarding keys to `ru/common.json`**

```json
  "onboarding": {
    "clearClipboardTitle": "Очистить буфер",
    "clearClipboardDesc": "Очистите буфер обмена от конфиденциальных данных одним нажатием",
    "gotIt": "Понятно"
  }
```

- [ ] **Step 11: Commit**

```bash
git add public/locales/*/common.json
git commit -m "feat(onboarding): add clear-clipboard i18n keys for all locales"
```

---

### Task 4: Add CSS pulse animation

**Files:**

- Modify: `app/globals.css:280-282` (after `.nav-btn-clear` block)

- [ ] **Step 1: Add keyframes and utility class**

Add the following CSS after the `.nav-btn-clear` block (after line 282) and before the `/* ===== Tools Drawer Animations ===== */` comment:

```css
@keyframes onboarding-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(6, 214, 160, 0.6);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(6, 214, 160, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(6, 214, 160, 0);
  }
}

.onboarding-pulse {
  animation: onboarding-pulse 2s ease-out infinite;
  background-color: rgba(6, 214, 160, 0.1);
}
```

Also add a `prefers-reduced-motion` rule inside the existing `@media (prefers-reduced-motion: reduce)` block (around line 324-330). Add `.onboarding-pulse` to the list:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-drawer-right,
  .animate-drawer-up,
  .animate-backdrop,
  .onboarding-pulse {
    animation: none !important;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "feat(onboarding): add pulse animation with reduced-motion support"
```

---

### Task 5: Create `OnboardingPopover` component

**Files:**

- Create: `components/ui/onboarding-popover.tsx`
- Create: `components/ui/__tests__/onboarding-popover.test.tsx`

- [ ] **Step 1: Write the failing component test**

Create `components/ui/__tests__/onboarding-popover.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OnboardingPopover } from "../onboarding-popover";

describe("OnboardingPopover", () => {
  const mockDismiss = vi.fn();
  let targetElement: HTMLButtonElement;

  beforeEach(() => {
    mockDismiss.mockClear();
    targetElement = document.createElement("button");
    document.body.appendChild(targetElement);
    Object.defineProperty(targetElement, "getBoundingClientRect", {
      value: () => ({
        top: 50,
        bottom: 80,
        left: 300,
        right: 340,
        width: 40,
        height: 30,
        x: 300,
        y: 50,
        toJSON: () => {},
      }),
    });
  });

  afterEach(() => {
    document.body.removeChild(targetElement);
    document.body.innerHTML = "";
  });

  it("renders popover in portal when show is true", () => {
    render(
      <OnboardingPopover
        show={true}
        onDismiss={mockDismiss}
        targetRef={{ current: targetElement }}
        icon={<span data-testid="icon">shield</span>}
        title="Test Title"
        description="Test Description"
        buttonLabel="Got it"
      />
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("Got it")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("does not render when show is false", () => {
    render(
      <OnboardingPopover
        show={false}
        onDismiss={mockDismiss}
        targetRef={{ current: targetElement }}
        icon={null}
        title="Title"
        description="Desc"
        buttonLabel="OK"
      />
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onDismiss when Got it button is clicked", () => {
    render(
      <OnboardingPopover
        show={true}
        onDismiss={mockDismiss}
        targetRef={{ current: targetElement }}
        icon={null}
        title="Title"
        description="Desc"
        buttonLabel="Got it"
      />
    );
    fireEvent.click(screen.getByText("Got it"));
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it("calls onDismiss when Escape key is pressed", () => {
    render(
      <OnboardingPopover
        show={true}
        onDismiss={mockDismiss}
        targetRef={{ current: targetElement }}
        icon={null}
        title="Title"
        description="Desc"
        buttonLabel="Got it"
      />
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it("has correct ARIA attributes", () => {
    render(
      <OnboardingPopover
        show={true}
        onDismiss={mockDismiss}
        targetRef={{ current: targetElement }}
        icon={null}
        title="Test Title"
        description="Test Description"
        buttonLabel="Got it"
      />
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(dialog).toHaveAttribute("aria-describedby");

    const titleId = dialog.getAttribute("aria-labelledby");
    const descId = dialog.getAttribute("aria-describedby");
    expect(document.getElementById(titleId!)).toHaveTextContent("Test Title");
    expect(document.getElementById(descId!)).toHaveTextContent("Test Description");
  });

  it("does not call onDismiss on non-Escape key", () => {
    render(
      <OnboardingPopover
        show={true}
        onDismiss={mockDismiss}
        targetRef={{ current: targetElement }}
        icon={null}
        title="Title"
        description="Desc"
        buttonLabel="Got it"
      />
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Enter" });
    expect(mockDismiss).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/ui/__tests__/onboarding-popover.test.tsx`
Expected: FAIL — `Cannot find module '../onboarding-popover'`

- [ ] **Step 3: Write the component implementation**

Create `components/ui/onboarding-popover.tsx`:

```tsx
"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

interface OnboardingPopoverProps {
  show: boolean;
  onDismiss: () => void;
  targetRef: RefObject<HTMLElement | null>;
  icon: ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
}

export function OnboardingPopover({
  show,
  onDismiss,
  targetRef,
  icon,
  title,
  description,
  buttonLabel,
}: OnboardingPopoverProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = "onboarding-title";
  const descId = "onboarding-desc";

  const updatePosition = useCallback(() => {
    if (!targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    const popoverWidth = 280;
    let left = rect.right - popoverWidth;
    if (left < 8) left = 8;
    const top = rect.bottom + 8;
    setPosition({ top, left });
  }, [targetRef]);

  useEffect(() => {
    if (!show) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [show, updatePosition]);

  useEffect(() => {
    if (!show) return;
    requestAnimationFrame(() => {
      const btn = dialogRef.current?.querySelector<HTMLElement>("[data-onboarding-dismiss]");
      btn?.focus();
    });
  }, [show]);

  const handleDismiss = useCallback(() => {
    onDismiss();
    previousFocusRef.current?.focus();
  }, [onDismiss]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleDismiss();
      }
    },
    [handleDismiss]
  );

  if (!show) return null;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onKeyDown={handleKeyDown}
      className="fixed z-[9999] max-w-[280px] rounded-lg border border-border-default bg-bg-elevated shadow-lg"
      style={{ top: position.top, left: position.left }}
    >
      <div className="absolute -top-2 right-6 h-0 w-0 border-x-[8px] border-b-[8px] border-x-transparent border-b-accent-cyan" />

      <div className="flex items-start gap-3 p-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-cyan/15 text-accent-cyan">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 id={titleId} className="text-sm font-semibold text-fg-primary">
            {title}
          </h3>
          <p id={descId} className="mt-1 text-xs leading-relaxed text-fg-secondary">
            {description}
          </p>
        </div>
      </div>

      <div className="border-t border-border-default px-3 py-2">
        <button
          type="button"
          data-onboarding-dismiss
          onClick={handleDismiss}
          className="w-full rounded-md bg-accent-cyan/15 px-3 py-1.5 text-xs font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/25"
        >
          {buttonLabel}
        </button>
      </div>
    </div>,
    document.body
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/ui/__tests__/onboarding-popover.test.tsx`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add components/ui/onboarding-popover.tsx components/ui/__tests__/onboarding-popover.test.tsx
git commit -m "feat(onboarding): add OnboardingPopover component with tests"
```

---

### Task 6: Integrate onboarding into Header

**Files:**

- Modify: `components/header.tsx`

- [ ] **Step 1: Add imports and hook logic to Header**

Add these imports at the top of `components/header.tsx` (after existing imports):

```ts
import { useRef } from "react";
import { ShieldCheck } from "lucide-react";
import { STORAGE_KEYS } from "../libs/storage-keys";
import { useOnboarding } from "../hooks/use-onboarding";
import { useRecentTools } from "../hooks/use-recent-tools";
import { OnboardingPopover } from "./ui/onboarding-popover";
```

Note: `useState`, `useEffect`, `useSyncExternalStore` are already imported from React. Add `useRef` to that import.

Inside the `Header` function, after the existing `isClipboardSupported` declaration (line 41), add:

```ts
const clipboardBtnRef = useRef<HTMLButtonElement>(null);
const { shouldShow: notGuided, dismiss } = useOnboarding(STORAGE_KEYS.onboardingClearClipboard);
const { recentTools } = useRecentTools();
const shouldShowOnboarding = notGuided && recentTools.length > 0 && isClipboardSupported;
```

- [ ] **Step 2: Add ref and pulse class to the clipboard button**

In the clipboard button JSX (lines 130-139), add the `ref` and conditional `onboarding-pulse` class. The button becomes:

```tsx
{
  isClipboardSupported && (
    <>
      <button
        ref={clipboardBtnRef}
        type="button"
        className={`flex h-8 w-8 items-center justify-center rounded-lg text-fg-secondary hover:text-accent-cyan hover:bg-accent-cyan/10 transition-colors ${clipAnimating ? "nav-btn-clear" : ""} ${shouldShowOnboarding ? "onboarding-pulse" : ""}`}
        onClick={handleClearClipboard}
        onAnimationEnd={() => setClipAnimating(false)}
        aria-label={t("nav.clearClipboard")}
        title={t("nav.clearClipboard")}
      >
        <ClipboardX size={16} />
      </button>
      <OnboardingPopover
        show={shouldShowOnboarding}
        onDismiss={dismiss}
        targetRef={clipboardBtnRef}
        icon={<ShieldCheck size={16} />}
        title={t("onboarding.clearClipboardTitle")}
        description={t("onboarding.clearClipboardDesc")}
        buttonLabel={t("onboarding.gotIt")}
      />
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/header.tsx
git commit -m "feat(onboarding): integrate clear-clipboard onboarding into Header"
```

---

### Task 7: Integrate onboarding into FloatingToolbar

**Files:**

- Modify: `components/floating-toolbar.tsx`

- [ ] **Step 1: Add imports and hook logic to FloatingToolbar**

Add these imports at the top of `components/floating-toolbar.tsx` (after existing imports):

```ts
import { useRef } from "react";
import { ShieldCheck } from "lucide-react";
import { STORAGE_KEYS } from "../libs/storage-keys";
import { useOnboarding } from "../hooks/use-onboarding";
import { useRecentTools } from "../hooks/use-recent-tools";
import { OnboardingPopover } from "./ui/onboarding-popover";
```

Note: `useState`, `useEffect`, `useSyncExternalStore` are already imported. Add `useRef` to that import.

Inside the `FloatingToolbar` function, after the `isClipboardSupported` declaration (line 44), add:

```ts
const clipboardBtnRef = useRef<HTMLButtonElement>(null);
const { shouldShow: notGuided, dismiss } = useOnboarding(STORAGE_KEYS.onboardingClearClipboard);
const { recentTools } = useRecentTools();
const shouldShowOnboarding = notGuided && recentTools.length > 0 && isClipboardSupported;
```

- [ ] **Step 2: Add ref and pulse class to the clipboard button**

In the FloatingToolbar's clipboard button JSX (lines 108-119), add the `ref`, conditional `onboarding-pulse` class, and the `OnboardingPopover`. The block becomes:

```tsx
{
  isClipboardSupported && (
    <>
      <button
        ref={clipboardBtnRef}
        type="button"
        className={`flex h-[34px] w-[34px] items-center justify-center text-fg-secondary hover:text-accent-cyan hover:bg-accent-cyan/10 transition-colors border-r border-border-default ${clipAnimating ? "nav-btn-clear" : ""} ${shouldShowOnboarding ? "onboarding-pulse" : ""}`}
        onClick={handleClearClipboard}
        onAnimationEnd={() => setClipAnimating(false)}
        aria-label={t("nav.clearClipboard")}
        title={t("nav.clearClipboard")}
      >
        <ClipboardX size={16} />
      </button>
      <OnboardingPopover
        show={shouldShowOnboarding}
        onDismiss={dismiss}
        targetRef={clipboardBtnRef}
        icon={<ShieldCheck size={16} />}
        title={t("onboarding.clearClipboardTitle")}
        description={t("onboarding.clearClipboardDesc")}
        buttonLabel={t("onboarding.gotIt")}
      />
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/floating-toolbar.tsx
git commit -m "feat(onboarding): integrate clear-clipboard onboarding into FloatingToolbar"
```

---

### Task 8: Verify and finalize

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: All tests pass, including the 4 new hook tests and 6 new component tests.

- [ ] **Step 2: Run lint**

Run: `npx eslint components/header.tsx components/floating-toolbar.tsx components/ui/onboarding-popover.tsx hooks/use-onboarding.ts`
Expected: No errors.

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: No type errors.
