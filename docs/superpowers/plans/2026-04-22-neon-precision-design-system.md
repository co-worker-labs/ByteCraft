# Neon Precision Design System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Bootstrap 5 with Tailwind CSS 4 and a cyberpunk "Neon Precision" design system across the entire ByteCraft website.

**Architecture:** Dark-first design using CSS custom properties for theme switching. UI primitives from `@headlessui/react`. Icons from `lucide-react`. All Bootstrap utility classes replaced with Tailwind equivalents. Component library in `components/ui/`.

**Tech Stack:** Next.js 16 (Pages Router), React 19, TypeScript, Tailwind CSS 4, @headlessui/react, lucide-react

**Design Spec:** `docs/superpowers/specs/2026-04-22-neon-precision-design-system.md`

---

## Bootstrap → Tailwind Class Mapping Reference

Agents converting pages should use this mapping:

| Bootstrap Class                   | Tailwind Equivalent                                                                |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| `container`                       | `container mx-auto px-4`                                                           |
| `container-fluid`                 | `mx-auto px-4` or `w-full px-4`                                                    |
| `row`                             | `flex flex-wrap` or `grid grid-cols-12`                                            |
| `col`                             | `flex-1`                                                                           |
| `col-{n}`                         | `basis-{n}/12` or `col-span-{n}`                                                   |
| `col-lg-{n}`                      | `lg:col-span-{n}`                                                                  |
| `col-md-{n}`                      | `md:col-span-{n}`                                                                  |
| `col-auto`                        | `w-auto`                                                                           |
| `col-12`                          | `w-full`                                                                           |
| `mt-{n}`                          | `mt-{n*0.25}rem` (same in Tailwind)                                                |
| `ms-{n}`                          | `ms-{n}`                                                                           |
| `me-{n}`                          | `me-{n}`                                                                           |
| `px-{n}`                          | `px-{n}`                                                                           |
| `py-{n}`                          | `py-{n}`                                                                           |
| `fw-bold`                         | `font-bold`                                                                        |
| `fw-bolder`                       | `font-extrabold`                                                                   |
| `fw-light`                        | `font-light`                                                                       |
| `fs-{n}`                          | `text-{size}` (see scale)                                                          |
| `text-center`                     | `text-center`                                                                      |
| `text-start`                      | `text-left`                                                                        |
| `text-end`                        | `text-right`                                                                       |
| `text-primary`                    | `text-accent-cyan`                                                                 |
| `text-secondary`                  | `text-fg-secondary`                                                                |
| `text-success`                    | `text-success`                                                                     |
| `text-danger`                     | `text-danger`                                                                      |
| `text-muted`                      | `text-fg-muted`                                                                    |
| `text-truncate`                   | `truncate`                                                                         |
| `text-break`                      | `break-all`                                                                        |
| `text-wrap`                       | (default in Tailwind)                                                              |
| `text-nowrap`                     | `whitespace-nowrap`                                                                |
| `text-uppercase`                  | `uppercase`                                                                        |
| `text-capitalize`                 | `capitalize`                                                                       |
| `fst-italic`                      | `italic`                                                                           |
| `d-flex`                          | `flex`                                                                             |
| `d-none`                          | `hidden`                                                                           |
| `d-md-flex`                       | `md:flex`                                                                          |
| `d-lg-block`                      | `lg:block`                                                                         |
| `justify-content-center`          | `justify-center`                                                                   |
| `justify-content-start`           | `justify-start`                                                                    |
| `justify-content-end`             | `justify-end`                                                                      |
| `justify-content-between`         | `justify-between`                                                                  |
| `align-items-center`              | `items-center`                                                                     |
| `flex-col`                        | `flex-col`                                                                         |
| `position-relative`               | `relative`                                                                         |
| `position-absolute`               | `absolute`                                                                         |
| `position-fixed`                  | `fixed`                                                                            |
| `top-0`                           | `top-0`                                                                            |
| `end-0`                           | `right-0`                                                                          |
| `start-0`                         | `left-0`                                                                           |
| `w-100`                           | `w-full`                                                                           |
| `h-100`                           | `h-full`                                                                           |
| `rounded-circle`                  | `rounded-full`                                                                     |
| `rounded-pill`                    | `rounded-full`                                                                     |
| `rounded`                         | `rounded`                                                                          |
| `form-control`                    | See `components/ui/input.tsx`                                                      |
| `form-select`                     | See `components/ui/input.tsx` Select                                               |
| `form-check`                      | `flex items-center gap-2`                                                          |
| `form-check-input`                | `accent-accent-cyan w-4 h-4`                                                       |
| `form-check-label`                | `text-fg-secondary`                                                                |
| `form-label`                      | `block text-sm font-medium text-fg-secondary mb-1`                                 |
| `form-switch`                     | `relative inline-flex items-center cursor-pointer`                                 |
| `btn`                             | See `components/ui/button.tsx`                                                     |
| `btn-primary`                     | `Button variant="primary"`                                                         |
| `btn-success`                     | `Button variant="primary"`                                                         |
| `btn-danger`                      | `Button variant="danger"`                                                          |
| `btn-dark`                        | `Button variant="secondary"`                                                       |
| `btn-sm`                          | `Button size="sm"`                                                                 |
| `btn-lg`                          | `Button size="lg"`                                                                 |
| `btn-outline-secondary`           | `Button variant="outline"`                                                         |
| `card`                            | See `components/ui/card.tsx`                                                       |
| `card-body`                       | `p-4`                                                                              |
| `card-title`                      | `font-semibold text-fg-primary`                                                    |
| `card-text`                       | `text-sm text-fg-secondary`                                                        |
| `alert alert-danger`              | Neon styled alert div                                                              |
| `table table-hover table-striped` | See spec Tables section                                                            |
| `nav nav-tabs`                    | See `components/ui/tabs.tsx`                                                       |
| `nav-link`                        | Tab button                                                                         |
| `dropdown`                        | See `components/ui/dropdown.tsx`                                                   |
| `dropdown-menu`                   | Menu panel                                                                         |
| `dropdown-item`                   | Menu item                                                                          |
| `badge`                           | See `components/ui/badge.tsx`                                                      |
| `progress`                        | `h-1.5 w-full rounded-full bg-bg-elevated`                                         |
| `progress-bar`                    | `h-full rounded-full bg-accent-cyan transition-all`                                |
| `collapse`                        | See `components/ui/accordion.tsx`                                                  |
| `accordion`                       | See `components/ui/accordion.tsx`                                                  |
| `spinner-border`                  | Lucide `Loader2` with `animate-spin`                                               |
| `visually-hidden`                 | `sr-only`                                                                          |
| `sticky-top`                      | `sticky top-0 z-50`                                                                |
| `bg-dark`                         | `bg-bg-surface`                                                                    |
| `bg-light`                        | `bg-bg-surface`                                                                    |
| `bg-body-tertiary`                | `bg-bg-elevated`                                                                   |
| `navbar`                          | Custom header component                                                            |
| `navbar-brand`                    | Brand link in header                                                               |
| `hidden`                          | `hidden`                                                                           |
| `input-group`                     | `flex`                                                                             |
| `input-group-text`                | `flex items-center px-3 text-fg-muted bg-bg-elevated border border-border-default` |

## Bootstrap Icon → Lucide Icon Mapping

| Bootstrap Icon           | Lucide Icon      | Import         |
| ------------------------ | ---------------- | -------------- |
| `bi-grid-3x3-gap`        | `LayoutGrid`     | `lucide-react` |
| `bi-sun`                 | `Sun`            | `lucide-react` |
| `bi-moon`                | `Moon`           | `lucide-react` |
| `bi-arrow-bar-up`        | `ArrowUp`        | `lucide-react` |
| `bi-clipboard`           | `Clipboard`      | `lucide-react` |
| `bi-clipboard-check`     | `ClipboardCheck` | `lucide-react` |
| `bi-chevron-double-down` | `ChevronsDown`   | `lucide-react` |
| `bi-chevron-double-up`   | `ChevronsUp`     | `lucide-react` |
| `bi-chevron-down`        | `ChevronDown`    | `lucide-react` |
| `bi-chevron-up`          | `ChevronUp`      | `lucide-react` |
| `bi-x`                   | `X`              | `lucide-react` |
| `bi-globe`               | `Globe`          | `lucide-react` |
| `bi-trash3`              | `Trash2`         | `lucide-react` |
| `bi-arrow-clockwise`     | `RefreshCw`      | `lucide-react` |
| `bi-save`                | `BookmarkPlus`   | `lucide-react` |
| `bi-search`              | `Search`         | `lucide-react` |

---

## Phase 1: Infrastructure

### Task 1: Install Dependencies & Configure Tailwind

**Files:**

- Create: `postcss.config.mjs`
- Create: `styles/globals.css`
- Modify: `package.json`
- Modify: `next.config.js`
- Delete: `styles/globals.scss` (after migration complete, not yet)

- [ ] **Step 1: Install new dependencies**

```bash
npm install tailwindcss @tailwindcss/postcss @headlessui/react lucide-react
```

- [ ] **Step 2: Create PostCSS config**

Create `postcss.config.mjs`:

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

- [ ] **Step 3: Create new globals.css**

Create `styles/globals.css`:

```css
@import "tailwindcss";

/* ===== Theme Variables ===== */
@layer base {
  :root {
    --bg-base: #f8fafc;
    --bg-surface: #ffffff;
    --bg-elevated: #ffffff;
    --bg-input: #f1f5f9;
    --fg-primary: #0f172a;
    --fg-secondary: #475569;
    --fg-muted: #94a3b8;
    --border-default: #e2e8f0;
    --border-subtle: #f1f5f9;
  }

  .dark {
    --bg-base: #0b0f1a;
    --bg-surface: #111827;
    --bg-elevated: #1e293b;
    --bg-input: #0d1117;
    --fg-primary: #f1f5f9;
    --fg-secondary: #94a3b8;
    --fg-muted: #64748b;
    --border-default: #1e293b;
    --border-subtle: #334155;
  }
}

/* ===== Tailwind Theme ===== */
@theme {
  --color-bg-base: var(--bg-base);
  --color-bg-surface: var(--bg-surface);
  --color-bg-elevated: var(--bg-elevated);
  --color-bg-input: var(--bg-input);
  --color-fg-primary: var(--fg-primary);
  --color-fg-secondary: var(--fg-secondary);
  --color-fg-muted: var(--fg-muted);
  --color-border-default: var(--border-default);
  --color-border-subtle: var(--border-subtle);
  --color-accent-cyan: #06d6a0;
  --color-accent-purple: #8b5cf6;
  --color-accent-cyan-dim: rgba(6, 214, 160, 0.15);
  --color-accent-purple-dim: rgba(139, 92, 246, 0.15);

  --font-family-mono: "JetBrains Mono", monospace;
  --font-family-sans: "Inter", ui-sans-serif, system-ui, sans-serif;

  --shadow-card: 0 0 0 1px rgba(6, 214, 160, 0.1), 0 4px 24px rgba(0, 0, 0, 0.4);
  --shadow-card-hover:
    0 0 0 1px rgba(6, 214, 160, 0.4), 0 0 20px rgba(6, 214, 160, 0.1), 0 8px 32px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 15px rgba(6, 214, 160, 0.3);
  --shadow-input-focus: 0 0 0 2px rgba(6, 214, 160, 0.5);
}

/* ===== Google Fonts ===== */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap");

/* ===== Base Styles ===== */
@layer base {
  html {
    font-family: var(--font-family-sans);
    background-color: var(--bg-base);
    color: var(--fg-primary);
  }

  body {
    min-height: 100vh;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  /* Custom scrollbar for dark mode */
  .dark ::-webkit-scrollbar {
    width: 8px;
  }
  .dark ::-webkit-scrollbar-track {
    background: var(--bg-base);
  }
  .dark ::-webkit-scrollbar-thumb {
    background: var(--border-subtle);
    border-radius: 4px;
  }
}

/* ===== Utility Classes ===== */
@layer utilities {
  .text-shadow-glow {
    text-shadow: 0 0 30px rgba(6, 214, 160, 0.3);
  }

  .border-glow {
    border-color: rgba(6, 214, 160, 0.4);
  }

  .border-glow-strong {
    border-color: rgba(6, 214, 160, 0.8);
  }

  .bg-grid-pattern {
    background-image:
      linear-gradient(rgba(6, 214, 160, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(6, 214, 160, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .paragraph p {
    text-indent: 3rem;
    line-height: 2rem;
  }

  .sentence {
    line-height: 2rem;
  }
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: Build succeeds. Tailwind is installed and configured.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(deps): install tailwind css 4, headless ui, lucide react"
```

---

### Task 2: Update Theme System

**Files:**

- Modify: `libs/theme.tsx`

The theme system currently uses `data-bs-theme` attribute. Switch to toggling `dark` class on `<html>`.

- [ ] **Step 1: Update theme.tsx**

Replace the `applyTheme` function. The full file becomes:

```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
});

const STORAGE_KEY = "bytecraft-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add libs/theme.tsx
git commit -m "refactor(theme): switch from data-bs-theme to dark class"
```

---

### Task 3: Update \_app.tsx and \_document.tsx

**Files:**

- Modify: `pages/_app.tsx`
- Modify: `pages/_document.tsx`

- [ ] **Step 1: Update \_app.tsx**

Replace Bootstrap imports with Tailwind globals. Remove Bootstrap JS require.

```typescript
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "../libs/theme";
import { appWithTranslation } from "next-i18next/pages";

function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default appWithTranslation(App);
```

- [ ] **Step 2: Update \_document.tsx**

Read current `_document.tsx` first. Update the theme initialization script to use `dark` class instead of `data-bs-theme`. Remove Bootstrap Toast container HTML if present — we will build a React-based toast.

```typescript
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('bytecraft-theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

- [ ] **Step 3: Update next.config.js**

Remove `sassOptions` since we no longer use SCSS:

```javascript
/** @type {import('next').NextConfig} */
const { i18n } = require("./next-i18next.config");

const nextConfig = {
  reactStrictMode: true,
  i18n,
};

module.exports = nextConfig;
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add pages/_app.tsx pages/_document.tsx next.config.js
git commit -m "refactor(app): replace bootstrap imports with tailwind"
```

---

## Phase 2: UI Component Library

### Task 4: Button Component

**Files:**

- Create: `components/ui/button.tsx`

- [ ] **Step 1: Create button component**

```typescript
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-cyan text-bg-base hover:brightness-110 focus:shadow-glow active:scale-95",
  secondary:
    "border border-accent-purple text-accent-purple hover:bg-accent-purple-dim active:scale-95",
  danger:
    "text-danger hover:bg-red-500/10 active:scale-95",
  outline:
    "border border-fg-muted text-fg-muted hover:border-fg-secondary hover:text-fg-secondary active:scale-95",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-sm rounded-lg",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-6 py-3 text-base rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-1.5 font-medium
          transition-all duration-200 cursor-pointer
          disabled:opacity-40 disabled:pointer-events-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/button.tsx
git commit -m "feat(ui): add button component with neon variants"
```

---

### Task 5: Card Component

**Files:**

- Create: `components/ui/card.tsx`

- [ ] **Step 1: Create card component**

```typescript
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
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

- [ ] **Step 2: Verify build and commit**

```bash
npm run build && git add components/ui/card.tsx && git commit -m "feat(ui): add neon card component"
```

---

### Task 6: Input & Textarea Component

**Files:**

- Create: `components/ui/input.tsx`

- [ ] **Step 1: Create input component with styled variants**

```typescript
import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef, ReactNode } from "react";

// Styled Input
interface StyledInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
}

export const StyledInput = forwardRef<HTMLInputElement, StyledInputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div>
        {label && <label className="block text-sm font-medium text-fg-secondary mb-1">{label}</label>}
        <input
          ref={ref}
          className={`
            w-full bg-bg-input border border-border-default rounded-lg
            px-3 py-2 text-fg-primary placeholder:text-fg-muted
            focus:outline-none focus:border-accent-cyan focus:shadow-input-focus
            transition-all duration-200
            ${error ? "border-danger" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-danger text-xs mt-1">{error}</p>}
      </div>
    );
  }
);
StyledInput.displayName = "StyledInput";

// Styled Textarea
interface StyledTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
}

export const StyledTextarea = forwardRef<HTMLTextAreaElement, StyledTextareaProps>(
  ({ label, className = "", ...props }, ref) => {
    return (
      <div>
        {label && <label className="block text-sm font-medium text-fg-secondary mb-1">{label}</label>}
        <textarea
          ref={ref}
          className={`
            w-full bg-bg-input border border-border-default rounded-lg
            px-3 py-2 text-fg-primary placeholder:text-fg-muted
            focus:outline-none focus:border-accent-cyan focus:shadow-input-focus
            transition-all duration-200 resize-y
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);
StyledTextarea.displayName = "StyledTextarea";

// Styled Select
interface StyledSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
}

export const StyledSelect = forwardRef<HTMLSelectElement, StyledSelectProps>(
  ({ label, className = "", children, ...props }, ref) => {
    return (
      <div>
        {label && <label className="block text-sm font-medium text-fg-secondary mb-1">{label}</label>}
        <select
          ref={ref}
          className={`
            w-full bg-bg-input border border-border-default rounded-lg
            px-3 py-2 text-fg-primary
            focus:outline-none focus:border-accent-cyan focus:shadow-input-focus
            transition-all duration-200
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);
StyledSelect.displayName = "StyledSelect";

// Styled Checkbox
interface StyledCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
}

export function StyledCheckbox({ label, className = "", ...props }: StyledCheckboxProps) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        className="w-4 h-4 rounded accent-[#06D6A0] bg-bg-input border-border-default cursor-pointer"
        {...props}
      />
      <span className="text-fg-secondary text-sm">{label}</span>
    </label>
  );
}
```

- [ ] **Step 2: Verify build and commit**

```bash
npm run build && git add components/ui/input.tsx && git commit -m "feat(ui): add styled input, textarea, select, checkbox"
```

---

### Task 7: Toast Notification System

**Files:**

- Create: `components/ui/toast.tsx`
- Modify: `libs/toast.ts`

- [ ] **Step 1: Create toast UI component**

Read `libs/toast.ts` first to understand the existing `showToast` API. Then create a React-based toast that replaces the Bootstrap toast:

Create `components/ui/toast.tsx`:

```typescript
"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X } from "lucide-react";

type ToastType = "success" | "danger" | "info" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  timeout: number;
}

interface ToastContextValue {
  addToast: (message: string, type: ToastType, timeout?: number) => void;
}

const ToastContext = createContext<ToastContextValue>({
  addToast: () => {},
});

export function useToastContext() {
  return useContext(ToastContext);
}

const typeStyles: Record<ToastType, string> = {
  success: "border-l-[#06D6A0]",
  danger: "border-l-[#EF4444]",
  info: "border-l-[#06D6A0]",
  warning: "border-l-[#F59E0B]",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let nextId = 0;

  const addToast = useCallback((message: string, type: ToastType, timeout = 3000) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type, timeout }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, timeout);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg
              bg-bg-elevated border border-border-default border-l-[3px]
              shadow-lg min-w-[280px]
              animate-[slideIn_0.2s_ease-out]
              ${typeStyles[toast.type]}
            `}
          >
            <span className="text-fg-primary text-sm flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-fg-muted hover:text-fg-primary transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
```

- [ ] **Step 2: Update libs/toast.ts**

Read the existing file. The current `showToast` function manipulates DOM directly. Replace it to use the new React context:

```typescript
// This module provides a bridge between non-React code and the toast context.
// For React components, use useToastContext() directly instead.

let addToastFn:
  | ((message: string, type: "success" | "danger" | "info" | "warning", timeout?: number) => void)
  | null = null;

export function registerToastFn(
  fn: (message: string, type: "success" | "danger" | "info" | "warning", timeout?: number) => void
) {
  addToastFn = fn;
}

export function showToast(
  message: string,
  type: "success" | "danger" | "info" | "warning" = "success",
  timeout = 3000,
  id?: string
) {
  if (addToastFn) {
    addToastFn(message, type, timeout);
  }
}
```

- [ ] **Step 3: Wire up toast in \_app.tsx**

Update `pages/_app.tsx` to wrap with `ToastProvider` and register the toast function:

```typescript
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { ThemeProvider } from "../libs/theme";
import { ToastProvider, useToastContext } from "../components/ui/toast";
import { registerToastFn } from "../libs/toast";
import { appWithTranslation } from "next-i18next/pages";

function ToastBridge() {
  const { addToast } = useToastContext();
  useEffect(() => {
    registerToastFn(addToast);
  }, [addToast]);
  return null;
}

function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ToastBridge />
        <Component {...pageProps} />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default appWithTranslation(App);
```

- [ ] **Step 4: Delete old toast component**

Delete `components/toast.tsx` (the old Bootstrap toast container).

- [ ] **Step 5: Verify build and commit**

```bash
npm run build && git add -A && git commit -m "feat(ui): replace bootstrap toast with react toast system"
```

---

### Task 8: Tabs Component

**Files:**

- Create: `components/ui/tabs.tsx`

- [ ] **Step 1: Create tabs component using Headless UI**

```typescript
"use client";

import { Tab } from "@headlessui/react";
import { ReactNode, Fragment } from "react";

interface TabItem {
  label: ReactNode;
  content: ReactNode;
}

interface NeonTabsProps {
  tabs: TabItem[];
  className?: string;
}

export function NeonTabs({ tabs, className = "" }: NeonTabsProps) {
  return (
    <Tab.Group>
      <Tab.List className={`flex border-b border-border-default ${className}`}>
        {tabs.map((tab, index) => (
          <Tab key={index} as={Fragment}>
            {({ selected }) => (
              <button
                className={`
                  px-4 py-2.5 text-sm font-medium transition-colors duration-200
                  border-b-2 -mb-px outline-none
                  ${selected
                    ? "text-accent-cyan border-accent-cyan"
                    : "text-fg-muted border-transparent hover:text-fg-secondary"
                  }
                `}
              >
                {tab.label}
              </button>
            )}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-4">
        {tabs.map((tab, index) => (
          <Tab.Panel key={index}>{tab.content}</Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
}
```

- [ ] **Step 2: Verify build and commit**

```bash
npm run build && git add components/ui/tabs.tsx && git commit -m "feat(ui): add neon tabs component"
```

---

### Task 9: Accordion Component

**Files:**

- Create: `components/ui/accordion.tsx`

- [ ] **Step 1: Create accordion component using Headless UI Disclosure**

```typescript
"use client";

import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { ReactNode } from "react";

interface AccordionItem {
  title: ReactNode;
  content: ReactNode;
  defaultOpen?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export function Accordion({ items, className = "" }: AccordionProps) {
  return (
    <div className={`divide-y divide-border-default border border-border-default rounded-xl overflow-hidden ${className}`}>
      {items.map((item, index) => (
        <Disclosure key={index} defaultOpen={item.defaultOpen}>
          {({ open }) => (
            <>
              <DisclosureButton className="flex w-full items-center justify-between px-4 py-3 text-left text-fg-primary font-semibold transition-colors hover:bg-bg-elevated/50">
                <span>{item.title}</span>
                <ChevronDown
                  size={18}
                  className={`text-fg-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
              </DisclosureButton>
              <DisclosurePanel className="px-4 pb-3 pt-1 text-fg-secondary text-sm border-l-2 border-accent-cyan ml-2">
                {item.content}
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify build and commit**

```bash
npm run build && git add components/ui/accordion.tsx && git commit -m "feat(ui): add neon accordion component"
```

---

### Task 10: Dropdown Menu Component

**Files:**

- Create: `components/ui/dropdown.tsx`

- [ ] **Step 1: Create dropdown using Headless UI Menu**

```typescript
"use client";

import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ReactNode } from "react";

interface DropdownItem {
  label: ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  className?: string;
}

export function Dropdown({ trigger, items, className = "" }: DropdownProps) {
  return (
    <Menu as="div" className={`relative inline-block ${className}`}>
      <MenuButton as="div">{trigger}</MenuButton>
      <MenuItems className="absolute right-0 mt-2 min-w-[180px] bg-bg-elevated border border-border-default rounded-xl shadow-lg overflow-hidden z-50 focus:outline-none">
        {items.map((item, index) => (
          <MenuItem key={index} disabled={item.disabled}>
            {({ focus }) => (
              <button
                className={`
                  w-full text-left px-4 py-2.5 text-sm transition-colors
                  ${focus ? "bg-accent-cyan-dim text-accent-cyan" : "text-fg-primary"}
                  ${item.active ? "text-accent-cyan font-medium" : ""}
                  ${item.disabled ? "opacity-40 pointer-events-none" : ""}
                `}
                onClick={item.onClick}
              >
                {item.label}
              </button>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
```

- [ ] **Step 2: Verify build and commit**

```bash
npm run build && git add components/ui/dropdown.tsx && git commit -m "feat(ui): add neon dropdown component"
```

---

### Task 11: Badge & CopyButton Components

**Files:**

- Create: `components/ui/badge.tsx`
- Create: `components/ui/copy-btn.tsx`

- [ ] **Step 1: Create badge component**

```typescript
import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "cyan" | "purple" | "danger";
  className?: string;
}

const variantStyles = {
  default: "bg-bg-elevated text-fg-muted",
  cyan: "bg-accent-cyan-dim text-accent-cyan",
  purple: "bg-accent-purple-dim text-accent-purple",
  danger: "bg-red-500/10 text-danger",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Create copy button component**

Read the existing `components/copybtn.tsx` to understand the current API. Recreate with Lucide icons:

```typescript
"use client";

import { useState } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import { showToast } from "../libs/toast";

interface CopyButtonProps {
  getContent: () => string;
  className?: string;
  toast?: boolean;
  timeout?: number;
}

export function CopyButton({ getContent, className = "", toast = true, timeout = 3000 }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  if (!getContent()) return null;

  function handleCopy() {
    const content = getContent();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), timeout);
    if (toast) {
      showToast("Copied", "success", timeout);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`text-fg-muted hover:text-accent-cyan transition-colors duration-200 ${className}`}
      title="Copy"
    >
      {copied ? <ClipboardCheck size={18} className="text-accent-cyan" /> : <Clipboard size={18} />}
    </button>
  );
}
```

- [ ] **Step 3: Verify build and commit**

```bash
npm run build && git add components/ui/badge.tsx components/ui/copy-btn.tsx && git commit -m "feat(ui): add badge and copy button components"
```

---

### Task 12: Update Simple Components (Spinner, NoData, Error, HeadBuilder)

**Files:**

- Modify: `components/spinner.tsx`
- Modify: `components/nodata.tsx`
- Modify: `components/error.tsx`
- Modify: `components/code.tsx`
- Modify: `components/head_builder.tsx`

- [ ] **Step 1: Update spinner.tsx**

```typescript
import { Loader2 } from "lucide-react";

export default function Spinner() {
  return (
    <div className="w-full text-center py-20">
      <Loader2 className="inline-block animate-spin text-accent-cyan" size={32} />
    </div>
  );
}
```

- [ ] **Step 2: Update nodata.tsx**

```typescript
export default function NoData() {
  return (
    <div className="w-full py-3 text-center text-fg-muted text-sm">
      Nothing Found.
    </div>
  );
}
```

- [ ] **Step 3: Update error.tsx**

```typescript
export default function Error({ err }: { err: any }) {
  return (
    <div className="container text-center w-full py-10">
      <h3 className="text-fg-primary">Oops, there is an error when requesting data</h3>
    </div>
  );
}
```

- [ ] **Step 4: Update code.tsx — replace CSS module with Tailwind classes**

```typescript
import { ReactNode } from "react";

export type CodeType = "comment" | "keyword" | "punctuation" | "operator" | "string";

const typeStyles: Record<CodeType, string> = {
  comment: "text-[#467790]",
  keyword: "text-accent-cyan",
  operator: "text-accent-purple font-medium",
  punctuation: "text-accent-purple",
  string: "text-[#10B981]",
};

export function CodeItem({ type, data, children }: { type: CodeType; data?: ReactNode; children?: ReactNode }) {
  return <span className={typeStyles[type]}>{data}{children}</span>;
}

export function CodeFunc({ name, children }: { name: ReactNode; children?: ReactNode }) {
  return (
    <>
      <span className="text-[#A78BFA]">{name}</span>
      <CodeItem type="punctuation" data="(" />
      {children}
      <CodeItem type="punctuation" data=")" />
    </>
  );
}

export function CodeSnipt({ children }: { children?: ReactNode }) {
  return (
    <pre className="w-full bg-bg-input rounded-lg p-4 overflow-x-auto">
      <code>{children}</code>
    </pre>
  );
}
```

- [ ] **Step 5: Delete old CSS module files for code**

Delete `components/Code.module.css`.

- [ ] **Step 6: Verify build and commit**

```bash
npm run build && git add -A && git commit -m "refactor: convert simple components to tailwind"
```

---

## Phase 3: Layout Components

### Task 13: Header Component

**Files:**

- Modify: `components/header.tsx`
- Delete: `components/Header.module.css` (already empty)
- Delete: `components/copybtn.tsx` (replaced by `components/ui/copy-btn.tsx`)

- [ ] **Step 1: Rewrite header.tsx**

Read the existing header first. Key changes:

- Replace Bootstrap navbar with Tailwind
- Replace Bootstrap dropdown with `Dropdown` from `components/ui/dropdown.tsx`
- Replace Bootstrap Icons with Lucide
- Add frosted glass effect + gradient border

```typescript
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { getTranslatedTools, ToolData } from "../libs/tools";
import logoIcon from "../public/favicon.ico";
import { useTheme } from "../libs/theme";
import { useTranslation } from "next-i18next/pages";
import LanguageSwitcher from "./language_switcher";
import { Dropdown } from "./ui/dropdown";
import { LayoutGrid, Sun, Moon } from "lucide-react";

export type HeaderPosition = "sticky" | "none" | "hidden";

export default function Header({ position, title }: { position: HeaderPosition; title?: string }) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation("common");

  if (position == "hidden") {
    return <></>;
  }

  const tools = getTranslatedTools(t);
  const positionClass = position === "sticky" ? "sticky top-0 z-50" : "";

  return (
    <header
      className={`
        bg-bg-surface/80 backdrop-blur-md border-b border-border-default
        ${positionClass}
      `}
    >
      {/* Subtle gradient border at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/20 to-transparent" />

      <div className="mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <Link className="flex items-center gap-2 font-mono font-bold text-fg-primary" href="/">
            <Image src={logoIcon} alt="Logo" height={24} width={24} />
            <span className={`text-sm ${!title ? "" : "hidden md:inline"}`}>{t("nav.brand")}</span>
          </Link>

          {/* Title */}
          {title && (
            <Link
              className="hidden md:block text-fg-secondary font-semibold text-sm truncate mx-4 text-center flex-1"
              href=""
              onClick={(e) => { e.preventDefault(); router.reload(); }}
            >
              {title}
            </Link>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Tools dropdown */}
            <Dropdown
              trigger={
                <button
                  type="button"
                  className="p-2 text-fg-muted hover:text-fg-secondary border border-border-default rounded-lg transition-colors"
                >
                  <LayoutGrid size={18} />
                </button>
              }
              items={tools.map((tool) => ({
                label: tool.title,
                active: tool.path === router.asPath,
                onClick: () => router.push(tool.path),
              }))}
            />

            {/* Theme toggle */}
            <button
              type="button"
              className="p-2 text-fg-muted hover:text-fg-secondary border border-border-default rounded-lg transition-colors"
              onClick={toggleTheme}
              aria-label={t(theme === "dark" ? "nav.switchToLight" : "nav.switchToDark")}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Language switcher */}
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify build and commit**

```bash
npm run build && git add components/header.tsx && git commit -m "refactor(header): replace bootstrap navbar with tailwind neon header"
```

---

### Task 14: Footer Component

**Files:**

- Modify: `components/footer.tsx`

- [ ] **Step 1: Rewrite footer.tsx**

```typescript
import Link from "next/link";
import { useTranslation } from "next-i18next/pages";

export type FooterPosition = "sticky" | "fixed" | "none" | "hidden";

export default function Footer({ position }: { position: FooterPosition }) {
  const { t } = useTranslation("common");

  if (position == "hidden") {
    return <></>;
  }

  const positionClass = (() => {
    switch (position) {
      case "fixed": return "fixed bottom-0 left-0 right-0";
      case "sticky": return "sticky bottom-0";
      default: return "";
    }
  })();

  return (
    <footer className={`bg-bg-surface border-t border-border-default pt-2 pb-3 ${positionClass}`}>
      <div className="mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-2">
          <div className="text-fg-muted text-xs text-center lg:text-left">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-fg-muted text-xs hover:text-accent-cyan transition-colors">
              {t("footer.home")}
            </Link>
            <Link href="/tnc/terms" className="text-fg-muted text-xs hover:text-accent-cyan transition-colors">
              {t("footer.terms")}
            </Link>
            <Link href="/tnc/privacy" className="text-fg-muted text-xs hover:text-accent-cyan transition-colors">
              {t("footer.privacy")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify build and commit**

```bash
npm run build && git add components/footer.tsx && git commit -m "refactor(footer): replace bootstrap footer with tailwind neon footer"
```

---

### Task 15: Layout Component

**Files:**

- Modify: `components/layout.tsx`
- Delete: `components/Layout.module.css`

- [ ] **Step 1: Rewrite layout.tsx**

Read existing layout first. Key changes:

- Replace Bootstrap grid with Tailwind
- Replace back-to-top button with Lucide icon
- Replace Bootstrap scroll listener with same logic but Tailwind styles

```typescript
import { CSSProperties, ReactNode, useEffect } from "react";
import Footer, { FooterPosition } from "./footer";
import Header, { HeaderPosition } from "./header";
import { Context, createContext, useContext, useState } from "react";
import { useRouter } from "next/router";
import { pathTrim } from "../utils/path";
import { ArrowUp } from "lucide-react";

interface LayoutSettings {
  reset: () => void;
  isHidden: boolean;
  hidden: (hidden: boolean) => void;
}

const LayoutContext: Context<LayoutSettings> = createContext<LayoutSettings>({
  reset: () => {},
  isHidden: false,
  hidden: () => {},
});

export default function Layout({
  children,
  title,
  headerPosition,
  footerPosition,
  hidden,
  aside = true,
  className,
  style,
  bodyClassName,
  bodyStyle,
}: {
  children: ReactNode;
  title?: string;
  headerPosition?: HeaderPosition;
  footerPosition?: FooterPosition;
  hidden?: boolean;
  aside?: boolean;
  className?: string;
  style?: CSSProperties;
  bodyClassName?: string;
  bodyStyle?: CSSProperties;
}) {
  const [isHidden, setIsHidden] = useState<boolean>(hidden || false);
  const [showBackTop, setShowBackTop] = useState(false);

  const footerPos = footerPosition || "none";
  const headerPos = headerPosition || "sticky";

  const router = useRouter();
  const path = pathTrim(router.asPath);

  const config = {
    reset: () => { setIsHidden(hidden || false); },
    isHidden: isHidden,
    hidden: (hidden: boolean) => { setIsHidden(hidden); },
  };

  useEffect(() => {
    function onScroll() {
      setShowBackTop(document.documentElement.scrollTop > 400 || document.body.scrollTop > 400);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [path]);

  return (
    <LayoutContext.Provider value={config}>
      <div
        hidden={isHidden}
        className={`min-h-screen flex flex-col ${footerPos === "fixed" ? "pb-16" : ""} ${bodyClassName || ""}`}
        style={bodyStyle}
      >
        <Header position={headerPos} title={title} />

        {/* Back to top */}
        <a
          href="#"
          className={`
            fixed bottom-16 right-8 z-[9999] p-2.5
            bg-bg-surface border border-border-default rounded-full
            hover:border-glow hover:shadow-glow
            transition-all duration-200
            ${showBackTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
          `}
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        >
          <ArrowUp size={20} className="text-fg-secondary" />
        </a>

        <main className={`flex-1 ${className || ""}`} style={style}>
          {aside ? (
            <div className="flex justify-center">
              <div className="hidden lg:block w-full"></div>
              <div className="w-full max-w-3xl px-4">{children}</div>
              <div className="hidden lg:block w-full"></div>
            </div>
          ) : (
            <>{children}</>
          )}
        </main>

        <Footer position={footerPos} />
      </div>
    </LayoutContext.Provider>
  );
}

export const useLayout = () => useContext(LayoutContext);
```

- [ ] **Step 2: Verify build and commit**

```bash
npm run build && git add components/layout.tsx && git commit -m "refactor(layout): replace bootstrap grid with tailwind layout"
```

---

### Task 16: Language Switcher Component

**Files:**

- Modify: `components/language_switcher.tsx`

- [ ] **Step 1: Rewrite language switcher using Dropdown component**

```typescript
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next/pages";
import { Dropdown } from "./ui/dropdown";
import { Globe } from "lucide-react";

const languages = [
  { code: "en", label: "English" },
  { code: "zh-CN", label: "简体中文" },
  { code: "zh-TW", label: "繁體中文" },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const currentLocale = router.locale || "en";

  function switchLocale(locale: string) {
    router.push(router.pathname, router.asPath, { locale });
  }

  return (
    <Dropdown
      trigger={
        <button
          type="button"
          className="p-2 text-fg-muted hover:text-fg-secondary border border-border-default rounded-lg transition-colors"
          aria-label={t("common.language")}
        >
          <Globe size={18} />
        </button>
      }
      items={languages.map((lang) => ({
        label: lang.label,
        active: lang.code === currentLocale,
        onClick: () => switchLocale(lang.code),
      }))}
    />
  );
}
```

- [ ] **Step 2: Verify build and commit**

```bash
npm run build && git add components/language_switcher.tsx && git commit -m "refactor(language-switcher): replace bootstrap dropdown with headless ui"
```

---

## Phase 4: Page Conversions

Each page conversion follows the same pattern:

1. Replace all Bootstrap class names with Tailwind equivalents (use mapping table)
2. Replace `<i className="bi bi-*">` with Lucide icon components
3. Replace Bootstrap form controls with `StyledInput`/`StyledTextarea`/`StyledSelect`/`StyledCheckbox`
4. Replace Bootstrap button classes with `Button` component
5. Replace Bootstrap cards with `Card` component
6. Replace Bootstrap tabs with `NeonTabs` component
7. Replace Bootstrap accordion/collapse with `Accordion` component
8. Remove CSS module imports (`import styles from "..."`)
9. Delete the corresponding `.module.css` file

### Task 17: Home Page (index.tsx)

**Files:**

- Modify: `pages/index.tsx`
- Delete: `styles/Home.module.css`

- [ ] **Step 1: Rewrite the Introduce section as Neon Hero**

Replace the gradient hero with the neon cyberpunk hero:

- Dark gradient background `from-bg-base to-[#1a1040]`
- Grid pattern overlay via `bg-grid-pattern` utility
- JetBrains Mono title with text shadow glow
- Cyan outline CTA button

- [ ] **Step 2: Rewrite ToolCollection with neon cards**

- Use `Card` component with `hover` prop
- Each card gets a Lucide icon (map tool paths to icons):
  - `/hashing` → `Hash`
  - `/base64` → `FileCode`
  - `/cipher` → `Lock`
  - `/password` → `KeyRound`
  - `/checksum` → `FileCheck`
  - `/ascii` → `Type`
  - `/htmlcode` → `Code`
  - `/storageunit` → `HardDrive`
- CTA button: outline cyan, hover fills cyan
- Disabled cards: muted styling

- [ ] **Step 3: Verify build and commit**

```bash
npm run build && git add pages/index.tsx && git rm styles/Home.module.css && git commit -m "refactor(home): convert to neon precision design"
```

---

### Task 18: Hashing Page

**Files:**

- Modify: `pages/hashing.tsx`
- Delete: `styles/Hashing.module.css`

- [ ] **Step 1: Convert all Bootstrap classes to Tailwind**

Key conversions in this page:

- `alert alert-danger` → `bg-accent-cyan-dim/20 border border-accent-cyan/30 rounded-xl p-3 text-fg-secondary text-sm`
- `form-control` → `StyledTextarea` component
- `form-check` / `form-check-input` / `form-check-label` → `StyledCheckbox`
- `btn btn-sm btn-danger rounded-pill` → `Button variant="danger" size="sm" className="rounded-full"`
- `table table-hover table-striped` → custom table with `bg-bg-surface`, striped rows via `even:bg-bg-elevated/50`
- `nav nav-tabs` → `NeonTabs` component
- Remove `import styles from "../styles/Hashing.module.css"`
- Replace `className={styles.clearLink}` with `text-danger text-xs ml-2`

- [ ] **Step 2: Replace Bootstrap Icons with Lucide**

- `bi bi-clipboard` → Use `CopyButton` from `components/ui/copy-btn.tsx`

- [ ] **Step 3: Verify build and commit**

```bash
npm run build && git add pages/hashing.tsx && git rm styles/Hashing.module.css && git commit -m "refactor(hashing): convert to neon precision design"
```

---

### Task 19: Base64 Page

**Files:**

- Modify: `pages/base64.tsx`
- Delete: `styles/Base64.module.css`

- [ ] **Step 1: Convert page following the same pattern as Task 18**

Same conversion approach. Key elements:

- Two textareas (plain + encoded) → `StyledTextarea`
- Encode/Decode buttons → `Button variant="primary"` / `Button variant="primary"`
- Clear buttons → `Button variant="danger"`
- Select → `StyledSelect`
- Description section → `text-fg-secondary` paragraphs

- [ ] **Step 2: Verify build and commit**

```bash
npm run build && git add pages/base64.tsx && git rm styles/Base64.module.css && git commit -m "refactor(base64): convert to neon precision design"
```

---

### Task 20: Cipher Page

**Files:**

- Modify: `pages/cipher.tsx`
- Delete: `styles/Cipher.module.css`

- [ ] **Step 1: Convert page following the standard pattern**

Key elements:

- Three selects (algorithm, block mode, padding) → `StyledSelect`
- Two textareas (plaintext + ciphertext) → `StyledTextarea`
- Encrypt/Decrypt/Clear buttons → `Button` components
- Description section with `h5` → `text-accent-cyan font-semibold`

- [ ] **Step 2: Verify build and commit**

```bash
npm run build && git add pages/cipher.tsx && git rm styles/Cipher.module.css && git commit -m "refactor(cipher): convert to neon precision design"
```

---

### Task 21: Password Page

**Files:**

- Modify: `pages/password.tsx`
- Delete: `styles/Password.module.css`

- [ ] **Step 1: Convert page — this is the most complex page**

Key elements:

- Password display card → `Card` with custom styling
- Strength bar → `div` with `bg-bg-elevated rounded-full` container, colored child
- rc-slider → keep but update track/handle colors from `#dd2222` to `#06D6A0`
- Comparison list → cards with neon styling
- Accordion FAQ → use `Accordion` component from `components/ui/accordion.tsx`
- Buttons (generate, copy, clear clipboard) → `Button` components with `rounded-full`
- Form switch (Random/Memorable) → custom toggle with Tailwind
- Checkboxes → `StyledCheckbox`

- [ ] **Step 2: Verify build and commit**

```bash
npm run build && git add pages/password.tsx && git rm styles/Password.module.css && git commit -m "refactor(password): convert to neon precision design"
```

---

### Task 22: Checksum Page

**Files:**

- Modify: `pages/checksum.tsx`

- [ ] **Step 1: Convert page following standard pattern**

- [ ] **Step 2: Verify build and commit**

```bash
npm run build && git add pages/checksum.tsx && git commit -m "refactor(checksum): convert to neon precision design"
```

---

### Task 23: ASCII Page

**Files:**

- Modify: `pages/ascii.tsx`
- Delete: `styles/Ascii.module.css`

- [ ] **Step 1: Convert page — tables and tabs**

- Tables → neon styled tables with `bg-bg-surface`, `font-mono` for codes
- Tabs → `NeonTabs` component

- [ ] **Step 2: Verify build and commit**

```bash
npm run build && git add pages/ascii.tsx && git rm styles/Ascii.module.css && git commit -m "refactor(ascii): convert to neon precision design"
```

---

### Task 24: HTML Code Page

**Files:**

- Modify: `pages/htmlcode.tsx`
- Delete: `styles/HtmlCode.module.css`

- [ ] **Step 1: Convert page — tables and tabs**

- Same pattern as ASCII page
- Tabs for different entity categories → `NeonTabs`
- Code blocks → `CodeSnipt` component

- [ ] **Step 2: Verify build and commit**

```bash
npm run build && git add pages/htmlcode.tsx && git rm styles/HtmlCode.module.css && git commit -m "refactor(htmlcode): convert to neon precision design"
```

---

### Task 25: Storage Unit Page

**Files:**

- Modify: `pages/storageunit.tsx`

- [ ] **Step 1: Convert page following standard pattern**

- Input fields → `StyledInput`
- Result table → neon styled table

- [ ] **Step 2: Verify build and commit**

```bash
npm run build && git add pages/storageunit.tsx && git commit -m "refactor(storageunit): convert to neon precision design"
```

---

### Task 26: TnC Pages (Terms & Privacy)

**Files:**

- Modify: `pages/tnc/terms.tsx`
- Modify: `pages/tnc/privacy.tsx`

- [ ] **Step 1: Convert both pages**

These are text-heavy pages. Replace Bootstrap text utilities with Tailwind equivalents.

- [ ] **Step 2: Verify build and commit**

```bash
npm run build && git add pages/tnc/ && git commit -m "refactor(tnc): convert terms and privacy to neon precision design"
```

---

## Phase 5: Cleanup

### Task 27: Remove Bootstrap & Old Files

**Files:**

- Delete: `styles/globals.scss`
- Delete: `components/toast.tsx` (old)
- Delete: `components/copybtn.tsx` (old)
- Delete: `components/Header.module.css`
- Delete: `components/Layout.module.css`
- Delete: `components/Code.module.css`
- Modify: `package.json` (remove bootstrap, bootstrap-icons, sass)

- [ ] **Step 1: Remove old Bootstrap dependencies**

```bash
npm uninstall bootstrap bootstrap-icons sass
```

- [ ] **Step 2: Delete all old files**

```bash
rm styles/globals.scss components/toast.tsx components/copybtn.tsx components/Header.module.css components/Layout.module.css components/Code.module.css
```

Note: Only delete files that have been fully replaced. Verify each file is no longer imported anywhere.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds with zero Bootstrap references.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: remove bootstrap and legacy style files"
```

---

### Task 28: Final Verification

- [ ] **Step 1: Full build test**

```bash
npm run build
```

Expected: Exit code 0, no warnings about missing modules.

- [ ] **Step 2: Grep for remaining Bootstrap references**

```bash
grep -r "bootstrap" --include="*.tsx" --include="*.ts" --include="*.css" pages/ components/ libs/ styles/
grep -r "className=\"btn " --include="*.tsx" pages/ components/
grep -r "className=\"form-" --include="*.tsx" pages/ components/
grep -r "className=\"card\"" --include="*.tsx" pages/ components/
grep -r "className=\"alert " --include="*.tsx" pages/ components/
grep -r "className=\"table " --include="*.tsx" pages/ components/
grep -r "bi bi-" --include="*.tsx" pages/ components/
grep -r "data-bs-" --include="*.tsx" pages/ components/
```

Expected: Zero matches. If any remain, fix them.

- [ ] **Step 3: Visual verification**

Run `npm run dev` and manually verify:

- [ ] Home page: hero gradient + grid pattern, neon cards with hover glow
- [ ] Dark mode: all pages display correctly
- [ ] Light mode: toggle works, all pages readable
- [ ] Theme persistence: refresh keeps theme
- [ ] Language switching: EN/中/繁 work
- [ ] Tool dropdown: opens, items clickable
- [ ] Each tool page: inputs work, buttons work, copy works, toasts show
- [ ] Responsive: mobile (375px), tablet (768px), desktop (1280px)
- [ ] Back to top button appears on scroll
- [ ] No console errors

- [ ] **Step 4: Commit final state**

```bash
git add -A && git commit -m "chore: verify neon precision design system complete"
```

---

## Self-Review Checklist

- [x] Every spec section has a corresponding task
- [x] No placeholders (TBD, TODO, "implement later")
- [x] All file paths are exact
- [x] All new dependencies specified
- [x] Bootstrap → Tailwind mapping table provided
- [x] Icon mapping table provided
- [x] Build verification at every task boundary
- [x] Commits at every task boundary
- [x] All .module.css deletions accounted for
- [x] Toast system has a bridge for non-React code
