# Quick Actions: Clear Clipboard & Fullscreen Toggle

## Overview

Add two quick-access utility buttons to the ByteCraft Header, accessible from every page: clear system clipboard and toggle browser fullscreen. Both follow the established Header icon-button pattern.

## Problem Statement

Users currently lack two convenience actions:

- **Clear clipboard**: After copying sensitive data (passwords, hashes, encrypted text), users may want to clear the system clipboard for privacy. There is no quick way to do this from within ByteCraft.
- **Fullscreen**: When working on a tool in a focused session, browser chrome (tabs, address bar, bookmarks) is visual noise. Users want a one-click way to enter browser fullscreen and exit when done.

Both should be immediately accessible without navigating away from the current tool.

## Solution

Two icon buttons appended to the Header's right-side action group, styled identically to the existing theme toggle and language switcher buttons:

```
[Logo] ... [Tools ▼] [☀ Theme] [🌐 Lang] [🗑 Clear] [⛶ Fullscreen]
```

## Architecture

### File Changes

| File                      | Change  | Purpose                                   |
| ------------------------- | ------- | ----------------------------------------- |
| `hooks/use-fullscreen.ts` | **New** | Encapsulate Fullscreen API state + toggle |
| `components/header.tsx`   | Modify  | Add two icon buttons                      |
| `messages/en.json`        | Modify  | Add i18n keys                             |
| `messages/zh-CN.json`     | Modify  | Add i18n keys                             |
| `messages/zh-TW.json`     | Modify  | Add i18n keys                             |

### Data Flow

```
Header button click
  ├─ 🗑 Clear Clipboard
  │     ├─ navigator.clipboard.writeText('')
  │     ├─ Button engages bounce animation
  │     └─ Toast: "Clipboard cleared"
  │
  └─ ⛶ Fullscreen
        ├─ !isFullscreen → document.documentElement.requestFullscreen()
        ├─ isFullscreen  → document.exitFullscreen()
        ├─ Button engages bounce animation
        └─ Icon toggles Maximize ↔ Minimize
```

### Button Visibility

| Button          | Condition                                       | Rationale                             |
| --------------- | ----------------------------------------------- | ------------------------------------- |
| Clear Clipboard | `navigator.clipboard && window.isSecureContext` | Clipboard API requires secure context |
| Fullscreen      | `document.fullscreenEnabled`                    | Browser must support Fullscreen API   |

If the browser does not support the feature, the corresponding button is not rendered. This is common on mobile browsers where Fullscreen API support is limited.

## Component Design

### `useFullscreen` Hook

```typescript
// hooks/use-fullscreen.ts
"use client";

import { useState, useEffect, useCallback } from "react";

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(!!document.fullscreenEnabled);
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  return { isFullscreen, toggle, isSupported };
}
```

**Key design decisions:**

- Only one listener for `fullscreenchange` — this handles ALL exit paths (button click, Esc key, F11).
- `isSupported` is split from the state (never changes after mount, avoids re-renders).
- SSR-safe: all `document` access happens in `useEffect`.

### Header Button Integration

```tsx
// Inside components/header.tsx, after the language switcher button

const fullscreen = useFullscreen();
const [clipClearing, setClipClearing] = useState(false);

const handleClearClipboard = async () => {
  setClipClearing(true);
  try {
    await navigator.clipboard.writeText("");
    showToast(t("clipboard.cleared"), "success");
  } catch {
    showToast(t("clipboard.clearFailed"), "error");
  }
};
```

## UI & Interaction

### Button Style

Identical to existing header action buttons:

```css
h-8 w-8 rounded-lg text-fg-secondary
hover:text-accent-cyan hover:bg-accent-cyan/10
transition-colors
```

### Icons (Lucide)

| Button          | Normal State           | Active State                           |
| --------------- | ---------------------- | -------------------------------------- |
| Clear Clipboard | `ClipboardX` size={16} | Same (no toggle)                       |
| Fullscreen      | `Maximize` size={16}   | `Minimize` size={16} (when fullscreen) |

### Click Animation

Both buttons use the existing `nav-btn-bounce` animation (scale bounce), matching the user-facing click feedback pattern.

### Toast Feedback

| Action            | Type      | Message (en)              | Message (zh-CN) |
| ----------------- | --------- | ------------------------- | --------------- |
| Clipboard cleared | `success` | Clipboard cleared         | 剪切板已清空    |
| Clipboard failed  | `error`   | Failed to clear clipboard | 清空剪切板失败  |

Fullscreen toggle produces no Toast — the visual change (icon swap + browser entering fullscreen) is sufficient feedback.

## i18n Keys

### common namespace

| Key                     | en                        | zh-CN          | zh-TW          |
| ----------------------- | ------------------------- | -------------- | -------------- |
| `nav.clearClipboard`    | Clear clipboard           | 清空剪切板     | 清空剪貼簿     |
| `nav.fullscreen`        | Fullscreen                | 全屏           | 全螢幕         |
| `nav.exitFullscreen`    | Exit fullscreen           | 退出全屏       | 退出全螢幕     |
| `clipboard.cleared`     | Clipboard cleared         | 剪切板已清空   | 剪貼簿已清空   |
| `clipboard.clearFailed` | Failed to clear clipboard | 清空剪切板失败 | 清空剪貼簿失敗 |

## Edge Cases

| Scenario                                         | Handling                                                                                                  |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Clipboard API unavailable (HTTP, old browser)    | Button not rendered (`navigator.clipboard` check)                                                         |
| Fullscreen API unsupported (mobile, old browser) | Button not rendered (`document.fullscreenEnabled` check)                                                  |
| User exits fullscreen via Esc/F11                | `fullscreenchange` event listener syncs icon state automatically                                          |
| Clipboard already empty                          | Still executes `writeText('')` — user intent is explicit, no pre-check needed                             |
| Fullscreen request denied (user gesture missing) | Browser raises a `fullscreenerror` event; no special handling needed (browser shows native error)         |
| Print styles with fullscreen tool                | `@media print` in `globals.css` hides header/footer via `[data-no-print]` — fullscreen does not interfere |

## What We Are NOT Building

- No keyboard shortcuts (YAGNI — not requested, adds complexity)
- No fullscreen confirmation dialog
- No clipboard history or clipboard viewer
- No per-page visibility toggles (all pages, as confirmed)
- No separate dropdown or submenu for quick actions

## Testing

Manual verification checklist:

1. **Clear Clipboard** — click button on any page → toast appears → paste elsewhere → clipboard is empty
2. **Fullscreen Enter** — click fullscreen button → browser enters fullscreen → icon shows Minimize
3. **Fullscreen Exit (button)** — click Minimize icon → browser exits fullscreen → icon shows Maximize
4. **Fullscreen Exit (Esc)** — press Esc in fullscreen → icon auto-syncs to Maximize
5. **Unsupported** — test on mobile Safari → fullscreen button hidden, clipboard button still works
6. **i18n** — switch to zh-CN, zh-TW → all aria-labels and toasts display correctly
7. **Click animation** — both buttons show bounce animation on click
