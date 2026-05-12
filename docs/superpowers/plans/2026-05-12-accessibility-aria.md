# Accessibility (aria-\*) Improvement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all high and medium priority a11y issues across shared UI components, layout/navigation components, and enforce them with ESLint rules and automated axe-core tests.

**Architecture:** Three-layer approach: (1) fix component-level a11y issues (label association, aria attributes, keyboard support), (2) enforce via ESLint jsx-a11y rules, (3) automated testing with jest-axe. Each layer is independent but complementary.

**Tech Stack:** React 19 useId(), Tailwind `sr-only`, jest-axe + Vitest + jsdom, eslint-plugin-jsx-a11y

---

## File Structure

| File                                                               | Action | Responsibility                                                        |
| ------------------------------------------------------------------ | ------ | --------------------------------------------------------------------- |
| `public/locales/en/common.json`                                    | Modify | Source of truth — new i18n keys                                       |
| `public/locales/{zh-CN,zh-TW,ja,ko,es,pt-BR,fr,de,ru}/common.json` | Modify | Translated new i18n keys                                              |
| `components/ui/input.tsx`                                          | Modify | Add `useId` + `htmlFor` for StyledInput, StyledTextarea, StyledSelect |
| `components/ui/line-numbered-textarea.tsx`                         | Modify | Add `useId` + `htmlFor` for label association                         |
| `components/ui/toast.tsx`                                          | Modify | Add container `aria-live="polite"`, close button `aria-label`         |
| `components/ui/copy-btn.tsx`                                       | Modify | Add `aria-label` for icon mode                                        |
| `components/ui/card.tsx`                                           | Modify | Add keyboard interaction when clickable                               |
| `components/color/color-picker.tsx`                                | Modify | Wrap picker with `role="group"` + `aria-label`                        |
| `components/layout.tsx`                                            | Modify | Add skip link + `id="main-content"`                                   |
| `components/header.tsx`                                            | Modify | Add `aria-label` to `<nav>`                                           |
| `components/floating-toolbar.tsx`                                  | Modify | Add `role="toolbar"` + `aria-label`                                   |
| `components/language_switcher.tsx`                                 | Modify | i18n the `aria-label`                                                 |
| `components/privacy-banner.tsx`                                    | Modify | Add lock icon `aria-hidden`                                           |
| `components/tools-drawer.tsx`                                      | Modify | Add search input `aria-label`                                         |
| `components/httpclient/key-value-editor.tsx`                       | Modify | Add ARIA roles, `aria-expanded`, delete `aria-label`                  |
| `eslint.config.mjs`                                                | Modify | Add jsx-a11y rule overrides                                           |
| `package.json`                                                     | Modify | Add `jest-axe` dependency + `test:a11y` script                        |
| `vitest.config.a11y.ts`                                            | Create | a11y test config                                                      |
| `tests/a11y-setup.ts`                                              | Create | Test setup for jest-axe                                               |
| `components/ui/input.a11y.test.tsx`                                | Create | a11y tests for input components                                       |
| `components/ui/card.a11y.test.tsx`                                 | Create | a11y tests for card component                                         |
| `components/ui/copy-btn.a11y.test.tsx`                             | Create | a11y tests for copy button                                            |
| `components/ui/toast.a11y.test.tsx`                                | Create | a11y tests for toast                                                  |

---

## Task 1: i18n — Add New Keys to English

**Files:**

- Modify: `public/locales/en/common.json`

- [ ] **Step 1: Add new i18n keys to `public/locales/en/common.json`**

Add 5 new keys after the `"indent"` key at line 107. Insert into the top-level of the JSON object:

```json
  "skipToMain": "Skip to main content",
  "floatingToolbar": "Floating toolbar",
  "removeItem": "Remove item",
  "searchTools": "Search tools"
```

And add `"mainNavigation"` to the existing `"nav"` object:

```json
  "nav": {
    "brand": "OmniKit",
    "search": "Search",
    "searchPlaceholder": "Search",
    "switchToLight": "Switch to light mode",
    "switchToDark": "Switch to dark mode",
    "tools": "Tools",
    "clearClipboard": "Clear clipboard",
    "fullscreen": "Fullscreen",
    "exitFullscreen": "Exit fullscreen",
    "searchTools": "Search tools… (Ctrl+K)",
    "searchToolsHint": "Tools (⌘K)",
    "noMatchingTools": "No matching tools found",
    "quickAccess": "Quick Access",
    "recentTools": "Recent",
    "mainNavigation": "Main navigation"
  },
```

The full modified file should have these keys added. The new top-level keys go after `"indent": "Indent"` and the `"nav.mainNavigation"` key goes inside the `"nav"` block.

- [ ] **Step 2: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('public/locales/en/common.json','utf8')); console.log('OK')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add public/locales/en/common.json
git commit -m "feat(a11y): add English i18n keys for accessibility"
```

---

## Task 2: i18n — Add New Keys to All Non-English Locales

**Files:**

- Modify: `public/locales/zh-CN/common.json`
- Modify: `public/locales/zh-TW/common.json`
- Modify: `public/locales/ja/common.json`
- Modify: `public/locales/ko/common.json`
- Modify: `public/locales/es/common.json`
- Modify: `public/locales/pt-BR/common.json`
- Modify: `public/locales/fr/common.json`
- Modify: `public/locales/de/common.json`
- Modify: `public/locales/ru/common.json`

- [ ] **Step 1: Add new i18n keys to zh-CN**

Add to top-level after `"indent"`:

```json
  "skipToMain": "跳转到主要内容",
  "floatingToolbar": "浮动工具栏",
  "removeItem": "移除项目",
  "searchTools": "搜索工具"
```

Add inside `"nav"` object:

```json
    "mainNavigation": "主导航"
```

- [ ] **Step 2: Add new i18n keys to zh-TW**

Add to top-level after `"indent"`:

```json
  "skipToMain": "跳至主要內容",
  "floatingToolbar": "浮動工具列",
  "removeItem": "移除項目",
  "searchTools": "搜尋工具"
```

Add inside `"nav"` object:

```json
    "mainNavigation": "主導覽"
```

- [ ] **Step 3: Add new i18n keys to ja**

Add to top-level after `"indent"`:

```json
  "skipToMain": "メインコンテンツへスキップ",
  "floatingToolbar": "フローティングツールバー",
  "removeItem": "項目を削除",
  "searchTools": "ツールを検索"
```

Add inside `"nav"` object:

```json
    "mainNavigation": "メインナビゲーション"
```

- [ ] **Step 4: Add new i18n keys to ko**

Add to top-level after `"indent"`:

```json
  "skipToMain": "메인 콘텐츠로 건너뛰기",
  "floatingToolbar": "플로팅 도구 모음",
  "removeItem": "항목 제거",
  "searchTools": "도구 검색"
```

Add inside `"nav"` object:

```json
    "mainNavigation": "메인 내비게이션"
```

- [ ] **Step 5: Add new i18n keys to es**

Add to top-level after `"indent"`:

```json
  "skipToMain": "Ir al contenido principal",
  "floatingToolbar": "Barra de herramientas flotante",
  "removeItem": "Eliminar elemento",
  "searchTools": "Buscar herramientas"
```

Add inside `"nav"` object:

```json
    "mainNavigation": "Navegación principal"
```

- [ ] **Step 6: Add new i18n keys to pt-BR**

Add to top-level after `"indent"`:

```json
  "skipToMain": "Pular para o conteúdo principal",
  "floatingToolbar": "Barra de ferramentas flutuante",
  "removeItem": "Remover item",
  "searchTools": "Buscar ferramentas"
```

Add inside `"nav"` object:

```json
    "mainNavigation": "Navegação principal"
```

- [ ] **Step 7: Add new i18n keys to fr**

Add to top-level after `"indent"`:

```json
  "skipToMain": "Aller au contenu principal",
  "floatingToolbar": "Barre d'outils flottante",
  "removeItem": "Supprimer l'élément",
  "searchTools": "Rechercher un outil"
```

Add inside `"nav"` object:

```json
    "mainNavigation": "Navigation principale"
```

- [ ] **Step 8: Add new i18n keys to de**

Add to top-level after `"indent"`:

```json
  "skipToMain": "Zum Hauptinhalt springen",
  "floatingToolbar": "Schwebende Werkzeugleiste",
  "removeItem": "Element entfernen",
  "searchTools": "Tools suchen"
```

Add inside `"nav"` object:

```json
    "mainNavigation": "Hauptnavigation"
```

- [ ] **Step 9: Add new i18n keys to ru**

Add to top-level after `"indent"`:

```json
  "skipToMain": "Перейти к основному содержимому",
  "floatingToolbar": "Плавающая панель инструментов",
  "removeItem": "Удалить элемент",
  "searchTools": "Поиск инструментов"
```

Add inside `"nav"` object:

```json
    "mainNavigation": "Основная навигация"
```

- [ ] **Step 10: Verify all JSON files are valid**

Run: `for f in public/locales/*/common.json; do node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" || echo "FAIL: $f"; done && echo "ALL OK"`
Expected: `ALL OK`

- [ ] **Step 11: Commit**

```bash
git add public/locales/*/common.json
git commit -m "feat(a11y): add i18n keys for accessibility in all locales"
```

---

## Task 3: Shared UI — Input Label Association

**Files:**

- Modify: `components/ui/input.tsx`

- [ ] **Step 1: Add `useId` import and label association to `StyledInput`, `StyledTextarea`, `StyledSelect`**

Replace the import at lines 1-7:

```tsx
import {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  forwardRef,
  ReactNode,
  useId,
} from "react";
```

Replace `StyledInput` (lines 9-23):

```tsx
export const StyledInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode }
>(({ label, className = "", id: externalId, ...props }, ref) => {
  const id = externalId ?? useId();
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-fg-secondary mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`w-full bg-bg-input border border-border-default rounded-lg px-3 py-2 text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan focus:shadow-input-focus transition-all duration-200 ${className}`}
        {...props}
      />
    </div>
  );
});
StyledInput.displayName = "StyledInput";
```

Replace `StyledTextarea` (lines 26-41):

```tsx
export const StyledTextarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: ReactNode }
>(({ label, className = "", id: externalId, ...props }, ref) => {
  const id = externalId ?? useId();
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-fg-secondary mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={`w-full bg-bg-input border border-border-default rounded-lg px-3 py-2 text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan focus:shadow-input-focus transition-all duration-200 resize-y ${className}`}
        {...props}
      />
    </div>
  );
});
StyledTextarea.displayName = "StyledTextarea";
```

Replace `StyledSelect` (lines 43-60):

```tsx
export const StyledSelect = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { label?: ReactNode }
>(({ label, className = "", children, id: externalId, ...props }, ref) => {
  const id = externalId ?? useId();
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-fg-secondary mb-1">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`w-full bg-bg-input border border-border-default rounded-lg px-3 py-2 text-fg-primary focus:outline-none focus:border-accent-cyan focus:shadow-input-focus transition-all duration-200 ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
});
StyledSelect.displayName = "StyledSelect";
```

- [ ] **Step 2: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `input.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/ui/input.tsx
git commit -m "feat(a11y): add label association to StyledInput, StyledTextarea, StyledSelect"
```

---

## Task 4: Shared UI — LineNumberedTextarea Label Association

**Files:**

- Modify: `components/ui/line-numbered-textarea.tsx`

- [ ] **Step 1: Add `useId` import and label association**

Add `useId` to the import (line 4):

```tsx
import {
  forwardRef,
  useRef,
  useEffect,
  useId,
  type TextareaHTMLAttributes,
  type ReactNode,
  type UIEvent,
} from "react";
```

Update the component destructuring at line 19 to extract `id: externalId`:

```tsx
export const LineNumberedTextarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, className = "", showLineNumbers, autoGrow = false, value, onScroll, id: externalId, ...rest }, ref) => {
    const gutterRef = useRef<HTMLDivElement | null>(null);
    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    const generatedId = useId();
    const id = externalId ?? generatedId;
```

Update both `<label>` elements (line 49 and line 83) to add `htmlFor`:

```tsx
<label htmlFor={id} className="block text-sm font-medium text-fg-secondary mb-1 flex-shrink-0">
```

Update both `<textarea>` elements (line 53 and line 93) to add `id`:

The textarea at line 53 (no line numbers path):

```tsx
<textarea ref={setRef} id={id} value={value} onScroll={onScroll} className={taClass} {...rest} />
```

The textarea at line 93 (with line numbers path):

```tsx
<textarea
  ref={setRef}
  id={id}
  wrap="off"
  value={value}
  onScroll={handleScroll}
  className={taClass}
  {...rest}
/>
```

- [ ] **Step 2: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `line-numbered-textarea.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/ui/line-numbered-textarea.tsx
git commit -m "feat(a11y): add label association to LineNumberedTextarea"
```

---

## Task 5: Shared UI — Toast Accessibility

**Files:**

- Modify: `components/ui/toast.tsx`

- [ ] **Step 1: Add `aria-live` to container, `aria-label` to close button**

Add `useTranslations` import at line 3:

```tsx
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
```

Update the toast container `<div>` at line 51 to add `aria-live`:

```tsx
<div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2" aria-live="polite" aria-atomic="false">
```

Update the close `<button>` at line 58 to add `aria-label`. Add `useTranslations` hook call at the top of `ToastProvider` function (after line 34):

```tsx
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const tc = useTranslations("common");
```

Update the close button (line 58):

```tsx
<button
  onClick={() => removeToast(toast.id)}
  className="text-fg-muted hover:text-fg-primary transition-colors"
  aria-label={tc("close")}
>
  <X size={14} />
</button>
```

- [ ] **Step 2: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `toast.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/ui/toast.tsx
git commit -m "feat(a11y): add aria-live to toast container and aria-label to close button"
```

---

## Task 6: Shared UI — CopyButton Icon Label

**Files:**

- Modify: `components/ui/copy-btn.tsx`

- [ ] **Step 1: Add `aria-label` to icon mode button**

Add `useTranslations` import:

```tsx
"use client";

import { useState } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { showToast } from "../../libs/toast";
import { Button } from "./button";
```

Add hook call inside component, after line 27:

```tsx
export function CopyButton({
  getContent,
  className = "",
  toast = true,
  timeout = 3000,
  alwaysShow = false,
  label,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const tc = useTranslations("common");
  const content = getContent();
```

Update icon mode `<button>` (line 66) to add `aria-label`:

```tsx
return (
  <button
    type="button"
    onClick={handleCopy}
    disabled={disabled}
    className={`text-fg-muted hover:text-accent-cyan transition-colors duration-200 ${disabled ? "opacity-30 cursor-not-allowed" : ""} ${className}`}
    title="Copy"
    aria-label={tc("copy")}
  >
    {icon}
  </button>
);
```

- [ ] **Step 2: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `copy-btn.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/ui/copy-btn.tsx
git commit -m "feat(a11y): add aria-label to CopyButton icon mode"
```

---

## Task 7: Shared UI — Card Keyboard Support

**Files:**

- Modify: `components/ui/card.tsx`

- [ ] **Step 1: Add keyboard interaction when `onClick` is present**

Replace the entire file:

```tsx
import { KeyboardEvent, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = "", hover = false, onClick }: CardProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <div
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`
        bg-bg-surface border border-border-default rounded-xl p-4
        transition-all duration-200
        ${hover ? "hover:-translate-y-0.5 hover:shadow-card-hover hover:border-glow cursor-pointer" : "shadow-card"}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `card.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/ui/card.tsx
git commit -m "feat(a11y): add keyboard support to clickable Card"
```

---

## Task 8: Shared UI — Color Picker Group Label

**Files:**

- Modify: `components/color/color-picker.tsx`

- [ ] **Step 1: Wrap `HexAlphaColorPicker` with `role="group"` + `aria-label`**

Update the `<div>` wrapping `<HexAlphaColorPicker>` at line 48:

```tsx
<div className="w-full max-w-[280px] aspect-square" role="group" aria-label={t("converter")}>
  <HexAlphaColorPicker
    color={value}
    onChange={onChange}
    style={{ width: "100%", height: "100%" }}
  />
</div>
```

- [ ] **Step 2: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `color-picker.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/color/color-picker.tsx
git commit -m "feat(a11y): add group role and aria-label to ColorPicker"
```

---

## Task 9: Layout — Skip to Main Content

**Files:**

- Modify: `components/layout.tsx`

- [ ] **Step 1: Add skip link and `id="main-content"`**

Add `useTranslations` to imports (line 3-12):

```tsx
import {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  Context,
  createContext,
  useContext,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import Footer, { FooterPosition } from "./footer";
import Header, { HeaderPosition } from "./header";
import FloatingToolbar from "./floating-toolbar";
import { ArrowUp } from "lucide-react";
import { usePathname } from "../i18n/navigation";
import { pathTrim } from "../utils/path";
import { useFullscreen } from "../hooks/use-fullscreen";
```

Add hook call inside `Layout` function, after line 62 (after `const fullscreen = useFullscreen();`):

```tsx
const tc = useTranslations("common");
```

Add skip link before `<Header>` (before line 104). Insert between `<LayoutContext.Provider>` opening and `<Header>`:

```tsx
    <LayoutContext.Provider value={config}>
      <div
        hidden={isHidden}
        className={`min-h-screen flex flex-col ${footerPos === "fixed" ? "pb-5" : ""} ${bodyClassName || ""}`}
        style={bodyStyle}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-bg-elevated focus:text-fg-primary focus:border focus:border-accent-cyan focus:shadow-lg focus:outline-none"
        >
          {tc("skipToMain")}
        </a>
        <Header
```

Add `id="main-content"` to `<main>` (line 127):

```tsx
<main
  id="main-content"
  className={`flex-1 ${isInFullscreen ? "w-full" : "mb-6"} ${className || ""}`}
  style={style}
>
```

- [ ] **Step 2: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `layout.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/layout.tsx
git commit -m "feat(a11y): add skip-to-main-content link"
```

---

## Task 10: Layout — Header Navigation Label

**Files:**

- Modify: `components/header.tsx`

- [ ] **Step 1: Add `aria-label` to `<nav>`**

Update the `<nav>` element at line 73:

```tsx
<nav className={`${positionClass} bg-bg-surface/80 backdrop-blur-md`} aria-label={t("nav.mainNavigation")}>
```

Note: `t` is already `useTranslations("common")` at line 31.

- [ ] **Step 2: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `header.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/header.tsx
git commit -m "feat(a11y): add aria-label to header nav"
```

---

## Task 11: Layout — Floating Toolbar Role

**Files:**

- Modify: `components/floating-toolbar.tsx`

- [ ] **Step 1: Add `role="toolbar"` and `aria-label` to container**

Update the outermost `<div>` at line 78:

```tsx
<div
  ref={ref}
  style={style}
  onPointerDown={handlePointerDown}
  role="toolbar"
  aria-label={t("floatingToolbar")}
  className="z-[40] flex items-center gap-0 bg-bg-surface/80 backdrop-blur-xl rounded-xl shadow-lg border border-border-default transition-opacity duration-200"
>
```

Note: `t` is already `useTranslations("common")` at line 32.

- [ ] **Step 2: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `floating-toolbar.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/floating-toolbar.tsx
git commit -m "feat(a11y): add toolbar role and aria-label to FloatingToolbar"
```

---

## Task 12: Layout — Language Switcher i18n

**Files:**

- Modify: `components/language_switcher.tsx`

- [ ] **Step 1: Replace hardcoded `aria-label="Language"` with i18n**

Add `useTranslations` import:

```tsx
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "../i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { Dropdown } from "./ui/dropdown";
import { languages } from "../libs/i18n/languages";
```

Add hook call inside the component:

```tsx
export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations("common");
  const [bouncing, setBouncing] = useState(false);
```

Update the `aria-label` at line 28:

```tsx
aria-label={t("language")}
```

- [ ] **Step 2: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `language_switcher.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/language_switcher.tsx
git commit -m "feat(a11y): i18n language switcher aria-label"
```

---

## Task 13: Layout — Privacy Banner Decorative Icon

**Files:**

- Modify: `components/privacy-banner.tsx`

- [ ] **Step 1: Add `aria-hidden="true"` to lock icon**

Update the `<Lock>` icon at line 16:

```tsx
<Lock size={16} className="text-accent-cyan mt-0.5 shrink-0" aria-hidden="true" />
```

- [ ] **Step 2: Commit**

```bash
git add components/privacy-banner.tsx
git commit -m "feat(a11y): add aria-hidden to privacy banner lock icon"
```

---

## Task 14: Layout — Tools Drawer Search Input Label

**Files:**

- Modify: `components/tools-drawer.tsx`

- [ ] **Step 1: Add `aria-label` to search `<input>`**

Update the search `<input>` at line 334:

```tsx
<input
  ref={inputRef}
  type="text"
  name="tools-search"
  value={query}
  onChange={(e) => {
    setQuery(e.target.value);
    setFocusedIndex(-1);
  }}
  onKeyDown={handleKeyDown}
  placeholder={t("nav.searchTools")}
  aria-label={t("searchTools")}
  autoComplete="off"
  className="w-full bg-transparent text-sm text-fg-primary placeholder:text-fg-muted outline-none focus-visible:ring-0"
/>
```

Note: `t` is already `useTranslations("common")` at line 229.

- [ ] **Step 2: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `tools-drawer.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/tools-drawer.tsx
git commit -m "feat(a11y): add aria-label to tools drawer search input"
```

---

## Task 15: Layout — Key-Value Editor ARIA

**Files:**

- Modify: `components/httpclient/key-value-editor.tsx`

- [ ] **Step 1: Add ARIA roles, `aria-expanded`, and delete button `aria-label`**

Add `useTranslations` import:

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { KeyValue } from "../../libs/httpclient/types";
```

Add `t` hook call at top of `KeyValueEditor` function:

```tsx
export function KeyValueEditor({
  pairs,
  onChange,
  suggestions,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
}: KeyValueEditorProps) {
  const tc = useTranslations("common");
```

Pass `tc` to `KVRow`:

```tsx
<KVRow
  key={index}
  row={row}
  index={index}
  suggestions={suggestions}
  keyPlaceholder={keyPlaceholder}
  valuePlaceholder={valuePlaceholder}
  onUpdate={updateRow}
  onRemove={removeRow}
  isLast={index === rows.length - 1}
  tc={tc}
/>
```

Add `tc` to `KVRow` props type:

```tsx
function KVRow({
  row,
  index,
  suggestions,
  keyPlaceholder,
  valuePlaceholder,
  onUpdate,
  onRemove,
  isLast,
  tc,
}: {
  row: KeyValue;
  index: number;
  suggestions?: string[];
  keyPlaceholder: string;
  valuePlaceholder: string;
  onUpdate: (index: number, field: keyof KeyValue, value: string | boolean) => void;
  onRemove: (index: number) => void;
  isLast: boolean;
  tc: ReturnType<typeof useTranslations>;
}) {
```

Update the key `<input>` at line 116 to add `aria-expanded` and `aria-autocomplete`:

```tsx
<input
  type="text"
  value={row.key}
  onChange={(e) => handleKeyChange(e.target.value)}
  placeholder={keyPlaceholder}
  aria-expanded={showSuggestions && filtered.length > 0}
  aria-autocomplete="list"
  className="w-full bg-bg-input border border-border-default rounded-lg px-3 py-1.5 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan transition-colors"
  onFocus={() => {
    if (suggestions && row.key) {
      const lower = row.key.toLowerCase();
      setFiltered(suggestions.filter((s) => s.toLowerCase().includes(lower)));
      setShowSuggestions(true);
    }
  }}
/>
```

Update the autocomplete dropdown container `<div>` at line 131:

```tsx
<div className="absolute top-full left-0 mt-1 min-w-[200px] max-h-40 overflow-y-auto bg-bg-elevated border border-border-default rounded-lg shadow-lg z-50" role="listbox">
```

Update each suggestion `<button>` at line 133:

```tsx
<button
  key={s}
  type="button"
  role="option"
  className="w-full text-left px-3 py-1.5 text-sm text-fg-primary hover:bg-accent-cyan-dim transition-colors"
  onClick={() => selectSuggestion(s)}
>
  {s}
</button>
```

Update the delete `<button>` at line 153:

```tsx
<button
  type="button"
  onClick={() => onRemove(index)}
  className="text-fg-muted hover:text-danger transition-colors shrink-0 cursor-pointer"
  aria-label={tc("removeItem")}
>
  <Trash2 size={16} />
</button>
```

- [ ] **Step 2: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `key-value-editor.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/httpclient/key-value-editor.tsx
git commit -m "feat(a11y): add ARIA roles and labels to KeyValueEditor"
```

---

## Task 16: ESLint — Add jsx-a11y Rules

**Files:**

- Modify: `eslint.config.mjs`

- [ ] **Step 1: Add jsx-a11y rule overrides to ESLint config**

Replace the entire file:

```js
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/interactive-supports-focus": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/no-static-element-interactions": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
    },
  },
  prettier,
];

export default eslintConfig;
```

- [ ] **Step 2: Run lint to assess impact**

Run: `npx eslint --max-warnings=9999 . 2>&1 | tail -20`
Expected: May show new warnings/errors in existing code. These are the issues we need to fix or suppress with targeted `eslint-disable` comments.

- [ ] **Step 3: Fix genuine lint issues or add targeted suppressions**

For any legitimate false positives (e.g., Headless UI wrappers that handle keyboard internally), add targeted `// eslint-disable-next-line` comments with a brief justification. Run lint again:

Run: `npx eslint . 2>&1 | tail -20`
Expected: No new unresolved errors (existing errors in other files may remain)

- [ ] **Step 4: Commit**

```bash
git add eslint.config.mjs
git add -u
git commit -m "feat(a11y): add jsx-a11y ESLint rule enforcement"
```

---

## Task 17: axe-core — Install jest-axe and Configure

**Files:**

- Modify: `package.json`
- Create: `vitest.config.a11y.ts`
- Create: `tests/a11y-setup.ts`

- [ ] **Step 1: Install jest-axe**

Run: `npm install --save-dev jest-axe`

- [ ] **Step 2: Add `test:a11y` script to `package.json`**

Add to `"scripts"` section after `"test:watch"`:

```json
"test:a11y": "vitest run --config vitest.config.a11y.ts"
```

- [ ] **Step 3: Create `vitest.config.a11y.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["components/**/*.a11y.test.tsx"],
    environment: "jsdom",
    setupFiles: ["./tests/a11y-setup.ts"],
  },
});
```

- [ ] **Step 4: Create `tests/a11y-setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 5: Verify config works (no tests yet, should pass)**

Run: `npm run test:a11y`
Expected: No test files found, exits successfully

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.a11y.ts tests/a11y-setup.ts
git commit -m "feat(a11y): add jest-axe and a11y test configuration"
```

---

## Task 18: axe-core — Input a11y Tests

**Files:**

- Create: `components/ui/input.a11y.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
import { axe, toHaveNoViolations } from "jest-axe";
import { render } from "@testing-library/react";
import { StyledInput, StyledTextarea, StyledSelect } from "./input";

expect.extend(toHaveNoViolations);

it("StyledInput with label has no a11y violations", async () => {
  const { container } = render(<StyledInput label="Username" />);
  expect(await axe(container)).toHaveNoViolations();
});

it("StyledInput without label has no a11y violations", async () => {
  const { container } = render(<StyledInput placeholder="Enter text" />);
  expect(await axe(container)).toHaveNoViolations();
});

it("StyledInput disabled has no a11y violations", async () => {
  const { container } = render(<StyledInput label="Username" disabled />);
  expect(await axe(container)).toHaveNoViolations();
});

it("StyledTextarea with label has no a11y violations", async () => {
  const { container } = render(<StyledTextarea label="Description" />);
  expect(await axe(container)).toHaveNoViolations();
});

it("StyledSelect with label has no a11y violations", async () => {
  const { container } = render(
    <StyledSelect label="Color">
      <option value="red">Red</option>
      <option value="blue">Blue</option>
    </StyledSelect>
  );
  expect(await axe(container)).toHaveNoViolations();
});
```

- [ ] **Step 2: Run the test**

Run: `npm run test:a11y`
Expected: All 5 tests pass

- [ ] **Step 3: Commit**

```bash
git add components/ui/input.a11y.test.tsx
git commit -m "test(a11y): add axe-core tests for input components"
```

---

## Task 19: axe-core — Card a11y Tests

**Files:**

- Create: `components/ui/card.a11y.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
import { axe, toHaveNoViolations } from "jest-axe";
import { render } from "@testing-library/react";
import { Card } from "./card";

expect.extend(toHaveNoViolations);

it("non-clickable Card has no a11y violations", async () => {
  const { container } = render(<Card>Content</Card>);
  expect(await axe(container)).toHaveNoViolations();
});

it("clickable Card has no a11y violations", async () => {
  const { container } = render(<Card onClick={() => {}}>Click me</Card>);
  expect(await axe(container)).toHaveNoViolations();
});

it("hoverable Card has no a11y violations", async () => {
  const { container } = render(
    <Card hover onClick={() => {}}>
      Hover me
    </Card>
  );
  expect(await axe(container)).toHaveNoViolations();
});
```

- [ ] **Step 2: Run the test**

Run: `npm run test:a11y`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add components/ui/card.a11y.test.tsx
git commit -m "test(a11y): add axe-core tests for Card component"
```

---

## Task 20: axe-core — CopyButton a11y Tests

**Files:**

- Create: `components/ui/copy-btn.a11y.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
import { axe, toHaveNoViolations } from "jest-axe";
import { render } from "@testing-library/react";
import { CopyButton } from "./copy-btn";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("../../libs/toast", () => ({
  showToast: () => {},
}));

expect.extend(toHaveNoViolations);

it("CopyButton icon mode has no a11y violations", async () => {
  const { container } = render(<CopyButton getContent={() => "hello"} />);
  expect(await axe(container)).toHaveNoViolations();
});

it("CopyButton with label has no a11y violations", async () => {
  const { container } = render(<CopyButton getContent={() => "hello"} label="Copy" />);
  expect(await axe(container)).toHaveNoViolations();
});
```

- [ ] **Step 2: Run the test**

Run: `npm run test:a11y`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add components/ui/copy-btn.a11y.test.tsx
git commit -m "test(a11y): add axe-core tests for CopyButton"
```

---

## Task 21: axe-core — Toast a11y Tests

**Files:**

- Create: `components/ui/toast.a11y.test.tsx`

- [ ] **Step 1: Create the test file**

The `ToastProvider` uses `useTranslations` which requires a next-intl provider. We need to mock `next-intl` in the test setup.

```tsx
import { axe, toHaveNoViolations } from "jest-axe";
import { render, act } from "@testing-library/react";
import { ToastProvider, useToastContext } from "./toast";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

expect.extend(toHaveNoViolations);

function ToastTrigger({ type }: { type: "success" | "danger" | "info" | "warning" }) {
  const { addToast } = useToastContext();
  return <button onClick={() => addToast(`Test ${type}`, type)}>Trigger</button>;
}

it("ToastProvider empty has no a11y violations", async () => {
  const { container } = render(
    <ToastProvider>
      <div />
    </ToastProvider>
  );
  expect(await axe(container)).toHaveNoViolations();
});

it("ToastProvider with success toast has no a11y violations", async () => {
  const { container } = render(
    <ToastProvider>
      <ToastTrigger type="success" />
    </ToastProvider>
  );

  const btn = container.querySelector("button")!;
  await act(async () => {
    btn.click();
  });

  expect(await axe(container)).toHaveNoViolations();
});

it("ToastProvider with danger toast has no a11y violations", async () => {
  const { container } = render(
    <ToastProvider>
      <ToastTrigger type="danger" />
    </ToastProvider>
  );

  const btn = container.querySelector("button")!;
  await act(async () => {
    btn.click();
  });

  expect(await axe(container)).toHaveNoViolations();
});

it("ToastProvider with info toast has no a11y violations", async () => {
  const { container } = render(
    <ToastProvider>
      <ToastTrigger type="info" />
    </ToastProvider>
  );

  const btn = container.querySelector("button")!;
  await act(async () => {
    btn.click();
  });

  expect(await axe(container)).toHaveNoViolations();
});
```

- [ ] **Step 2: Run the test**

Run: `npm run test:a11y`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add components/ui/toast.a11y.test.tsx
git commit -m "test(a11y): add axe-core tests for Toast"
```

---

## Task 22: Final Verification

- [ ] **Step 1: Run all a11y tests**

Run: `npm run test:a11y`
Expected: All tests pass

- [ ] **Step 2: Run all existing tests**

Run: `npm run test`
Expected: All existing tests pass (no regressions)

- [ ] **Step 3: Run lint**

Run: `npx eslint . 2>&1 | tail -20`
Expected: No new a11y-related errors beyond what was addressed

- [ ] **Step 4: Run typecheck**

Run: `npx tsc --noEmit --pretty 2>&1 | tail -20`
Expected: No type errors
