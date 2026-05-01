# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the OmniKit homepage from a flat 26-tool grid into a categorized, searchable, personalized experience with Hero+Search, dynamic Quick Access, and 6 category sections.

**Architecture:** Server/Client Component split — Hero section is SSR, interactive parts (search, quick access, categories) are a single Client Component. Search uses in-place filtering with expanded fuzzysort scope. Quick Access is personalized via localStorage-backed recent usage tracking.

**Tech Stack:** Next.js 16 (App Router), React Compiler (no useMemo/useCallback), fuzzysort 3.x, Tailwind CSS 4, next-intl, Vitest

**Spec:** `docs/superpowers/specs/2026-05-01-homepage-redesign.md`

---

## File Structure

| File                              | Action                 | Responsibility                                                                                   |
| --------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------ |
| `libs/storage-keys.ts`            | Modify                 | Add `recentTools` and `homeViewMode` storage keys                                                |
| `libs/tools.ts`                   | Modify                 | Add `ToolCategory`, `CategoryGroup`, `TOOL_CATEGORIES`, `QUICK_ACCESS_DEFAULT`, helper functions |
| `libs/tools-search.ts`            | Modify                 | Expand search keys + weighted `scoreFn`                                                          |
| `libs/tools-search.test.ts`       | Modify (vitest.config) | Add search test to vitest includes                                                               |
| `hooks/use-recent-tools.ts`       | Create                 | localStorage-backed MRU tool usage tracker                                                       |
| `hooks/use-recent-tools.test.ts`  | Create                 | Unit tests for use-recent-tools                                                                  |
| `app/[locale]/page.tsx`           | Modify                 | Server/Client split — Hero SSR + HomeClient                                                      |
| `app/[locale]/home-page.tsx`      | Modify                 | Full rewrite → `HomeClient` with Search + QuickAccess + Toggle + Categories                      |
| `public/locales/en/tools.json`    | Modify                 | Add `categories` section                                                                         |
| `public/locales/zh-CN/tools.json` | Modify                 | Add `categories` section                                                                         |
| `public/locales/zh-TW/tools.json` | Modify                 | Add `categories` section                                                                         |
| `public/locales/en/home.json`     | Modify                 | Update hero text                                                                                 |
| `public/locales/zh-CN/home.json`  | Modify                 | Update hero text                                                                                 |
| `public/locales/zh-TW/home.json`  | Modify                 | Update hero text                                                                                 |
| `vitest.config.ts`                | Modify                 | Add `libs/__tests__/tools-search.test.ts` to includes                                            |

---

### Task 1: Data Model — Category Definitions

**Files:**

- Modify: `libs/tools.ts`

- [ ] **Step 1: Add category types and constants to `libs/tools.ts`**

Add after the existing `ToolEntry` interface (around line 44), before `const PALETTE_SIZE`:

```typescript
export type ToolCategory =
  | "text" // Text Processing
  | "encoding" // Encoding & Conversion
  | "security" // Security & Crypto
  | "generators" // Generators
  | "visual" // Visual & Media
  | "reference"; // Reference & Lookup

export interface CategoryGroup {
  key: ToolCategory;
  tools: string[]; // tool keys in display order
}

export const TOOL_CATEGORIES: CategoryGroup[] = [
  { key: "text", tools: ["json", "regex", "textcase", "diff", "markdown"] },
  { key: "encoding", tools: ["base64", "urlencoder", "yaml", "csv", "numbase", "storageunit"] },
  { key: "security", tools: ["jwt", "hashing", "cipher", "password", "checksum"] },
  { key: "generators", tools: ["uuid", "qrcode", "cron", "unixtime"] },
  { key: "visual", tools: ["color", "image"] },
  { key: "reference", tools: ["ascii", "htmlcode", "httpstatus", "dbviewer"] },
];

export const QUICK_ACCESS_DEFAULT: string[] = ["json", "base64", "jwt", "regex", "diff", "hashing"];
```

Add a helper function after `getToolCards()`:

```typescript
export function getToolCardMap(t: ReturnType<typeof useTranslations>): Map<string, ToolCard> {
  const cards = getToolCards(t);
  return new Map(cards.map((card) => [card.path, card]));
}

export function getToolCardsByKeys(keys: string[], cardMap: Map<string, ToolCard>): ToolCard[] {
  return keys
    .map((key) => {
      const path = `/${key}`;
      return cardMap.get(path);
    })
    .filter((card): card is ToolCard => card !== undefined);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `libs/tools.ts`

- [ ] **Step 3: Verify every tool in TOOL_CATEGORIES exists in TOOLS**

Visually confirm that all 26 tool keys in `TOOL_CATEGORIES` match entries in the `TOOLS` array:

- text: json ✓, regex ✓, textcase ✓, diff ✓, markdown ✓ (5)
- encoding: base64 ✓, urlencoder ✓, yaml ✓, csv ✓, numbase ✓, storageunit ✓ (6)
- security: jwt ✓, hashing ✓, cipher ✓, password ✓, checksum ✓ (5)
- generators: uuid ✓, qrcode ✓, cron ✓, unixtime ✓ (4)
- visual: color ✓, image ✓ (2)
- reference: ascii ✓, htmlcode ✓, httpstatus ✓, dbviewer ✓ (4)
- Total: 5+6+5+4+2+4 = 26 ✓

- [ ] **Step 4: Commit**

```bash
git add libs/tools.ts
git commit -m "feat(homepage): add category definitions and quick access defaults to tools.ts"
```

---

### Task 2: Storage Keys + Recent Tools Hook

**Files:**

- Modify: `libs/storage-keys.ts`
- Create: `hooks/use-recent-tools.ts`
- Create: `hooks/__tests__/use-recent-tools.test.ts`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Add storage keys**

Add to `libs/storage-keys.ts` `STORAGE_KEYS` object:

```typescript
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
} as const;
```

- [ ] **Step 2: Create `hooks/use-recent-tools.ts`**

```typescript
"use client";

import { useState, useCallback } from "react";
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

  const trackUsage = useCallback((toolKey: string) => {
    setRecentTools((prev) => {
      // Remove if already exists, then prepend
      const filtered = prev.filter((k) => k !== toolKey);
      const updated = [toolKey, ...filtered].slice(0, MAX_RECENT_TOOLS);
      saveRecentTools(updated);
      return updated;
    });
  }, []);

  return { recentTools, trackUsage };
}
```

- [ ] **Step 3: Create `hooks/__tests__/use-recent-tools.test.ts`**

```typescript
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
    // Most recent first
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
```

- [ ] **Step 4: Update `vitest.config.ts` to include hook tests**

Add `hooks/**/*.test.ts` to the `include` array in `vitest.config.ts`:

```typescript
include: [
  // ... existing entries ...
  "hooks/**/*.test.ts",
],
```

- [ ] **Step 5: Install test dependency if needed and run tests**

Run: `npm run test -- --reporter=verbose hooks/__tests__/use-recent-tools.test.ts`
Expected: All 5 tests PASS

- [ ] **Step 6: Commit**

```bash
git add libs/storage-keys.ts hooks/use-recent-tools.ts hooks/__tests__/use-recent-tools.test.ts vitest.config.ts
git commit -m "feat(homepage): add recent tools hook with localStorage persistence"
```

---

### Task 3: Search Scope Expansion

**Files:**

- Modify: `libs/tools-search.ts`
- Create: `libs/__tests__/tools-search.test.ts`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Update `libs/tools-search.ts`**

Replace the entire file content:

```typescript
import fuzzysort from "fuzzysort";
import type { ToolCard } from "./tools";

export function searchTools(query: string, tools: ToolCard[]): ToolCard[] {
  if (!query.trim()) return tools;
  const results = fuzzysort.go(query, tools, {
    keys: ["title", "searchTerms", "description", "key"],
    // Weight title and searchTerms 2x higher than description and key
    scoreFn: (r) => {
      const titleScore = r[0]?.score ?? 0;
      const termsScore = r[1]?.score ?? 0;
      const descScore = r[2]?.score ?? 0;
      const keyScore = r[3]?.score ?? 0;
      return Math.max(titleScore * 2, termsScore * 2, descScore, keyScore);
    },
  });
  return results.map((r) => r.obj);
}
```

- [ ] **Step 2: Create `libs/__tests__/tools-search.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import { searchTools } from "../tools-search";
import type { ToolCard } from "../tools";

// Minimal mock ToolCard for testing
function makeCard(overrides: Partial<ToolCard> & { key?: string }): ToolCard & { key?: string } {
  return {
    path: overrides.path ?? "/test",
    title: overrides.title ?? "Test Tool",
    description: overrides.description ?? "A test tool",
    icon: (() => null) as any,
    searchTerms: overrides.searchTerms ?? "",
    key: overrides.key,
  } as ToolCard & { key?: string };
}

const TOOLS = [
  makeCard({
    path: "/json",
    title: "JSON Format / Compress",
    key: "json",
    description: "Format, compress, and validate JSON online.",
  }),
  makeCard({
    path: "/jwt",
    title: "JWT",
    key: "jwt",
    description: "Encode, decode, and verify JSON Web Tokens.",
  }),
  makeCard({
    path: "/base64",
    title: "Base64 Encode/Decode",
    key: "base64",
    description: "Encode and decode Base64 strings.",
  }),
  makeCard({
    path: "/cipher",
    title: "Text Encrypt/Decrypt",
    key: "cipher",
    description: "Encrypt and decrypt text using AES, DES.",
  }),
  makeCard({
    path: "/hashing",
    title: "Text Hashing",
    key: "hashing",
    description: "Generate MD5, SHA-256, SHA-512 hashes.",
  }),
  makeCard({
    path: "/dbviewer",
    title: "DB Viewer",
    key: "dbviewer",
    description: "Open SQLite databases, run SQL queries.",
  }),
  makeCard({
    path: "/color",
    title: "Color Converter",
    key: "color",
    description: "Convert HEX, RGB, HSL. Visual picker with eyedropper.",
    searchTerms: "yansezhuanhuan yszh",
  }),
];

describe("searchTools", () => {
  it("returns all tools when query is empty", () => {
    expect(searchTools("", TOOLS)).toHaveLength(TOOLS.length);
  });

  it("returns all tools when query is whitespace", () => {
    expect(searchTools("   ", TOOLS)).toHaveLength(TOOLS.length);
  });

  it("finds tools by title", () => {
    const results = searchTools("json", TOOLS);
    const paths = results.map((r) => r.path);
    expect(paths).toContain("/json");
  });

  it("finds tools by key", () => {
    const results = searchTools("jwt", TOOLS);
    const paths = results.map((r) => r.path);
    expect(paths).toContain("/jwt");
  });

  it("finds tools by description", () => {
    const results = searchTools("sql", TOOLS);
    const paths = results.map((r) => r.path);
    expect(paths).toContain("/dbviewer");
  });

  it("finds tools by searchTerms", () => {
    const results = searchTools("yanse", TOOLS);
    const paths = results.map((r) => r.path);
    expect(paths).toContain("/color");
  });

  it("title match ranks higher than description match", () => {
    const results = searchTools("hash", TOOLS);
    // "Text Hashing" should rank higher than description matches
    expect(results[0].path).toBe("/hashing");
  });

  it("returns empty array when nothing matches", () => {
    const results = searchTools("zzzzznonexistent", TOOLS);
    expect(results).toHaveLength(0);
  });
});
```

- [ ] **Step 3: Update `vitest.config.ts` to include search tests**

Add `libs/__tests__/*.test.ts` to the `include` array:

```typescript
include: [
  // ... existing entries ...
  "libs/__tests__/*.test.ts",
],
```

- [ ] **Step 4: Run tests**

Run: `npm run test -- --reporter=verbose libs/__tests__/tools-search.test.ts`
Expected: All 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add libs/tools-search.ts libs/__tests__/tools-search.test.ts vitest.config.ts
git commit -m "feat(homepage): expand search scope with weighted scoring across title/searchTerms/description/key"
```

---

### Task 4: i18n — Category Translations + Updated Hero Text

**Files:**

- Modify: `public/locales/en/tools.json`
- Modify: `public/locales/zh-CN/tools.json`
- Modify: `public/locales/zh-TW/tools.json`
- Modify: `public/locales/en/home.json`
- Modify: `public/locales/zh-CN/home.json`
- Modify: `public/locales/zh-TW/home.json`

- [ ] **Step 1: Add `categories` section to `public/locales/en/tools.json`**

Add a top-level `"categories"` key at the end of the JSON object (before the closing `}`):

```json
{
  ...existing tool entries...,
  "categories": {
    "text": "Text Processing",
    "encoding": "Encoding & Conversion",
    "security": "Security & Crypto",
    "generators": "Generators",
    "visual": "Visual & Media",
    "reference": "Reference & Lookup"
  }
}
```

- [ ] **Step 2: Add `categories` section to `public/locales/zh-CN/tools.json`**

```json
{
  ...existing tool entries...,
  "categories": {
    "text": "文本处理",
    "encoding": "编码转换",
    "security": "安全加密",
    "generators": "生成器",
    "visual": "视觉媒体",
    "reference": "参考速查"
  }
}
```

- [ ] **Step 3: Add `categories` section to `public/locales/zh-TW/tools.json`**

```json
{
  ...existing tool entries...,
  "categories": {
    "text": "文本處理",
    "encoding": "編碼轉換",
    "security": "安全加密",
    "generators": "生成器",
    "visual": "視覺媒體",
    "reference": "參考速查"
  }
}
```

- [ ] **Step 4: Update hero text in `public/locales/en/home.json`**

```json
{
  "title": "OmniKit - Free Online Developer Tools",
  "metaDescription": "A collection of free, browser-based developer tools. Base64 encoder, password generator, hash generator, encryption, checksum, and more. 100% client-side, no data sent to server.",
  "badge": "Free & Open Source",
  "subtitle": "Your Swiss Army Knife for Dev",
  "tagline": "No sign-up, no tracking — just results.",
  "searchPlaceholder": "Search tools...",
  "noResults": "No tools matching \"{query}\"",
  "resultsCount": "{count} tools found",
  "allTools": "All Tools",
  "viewGrouped": "Grouped",
  "viewAll": "All",
  "clearSearch": "Clear search"
}
```

- [ ] **Step 5: Update hero text in `public/locales/zh-CN/home.json`**

```json
{
  "title": "OmniKit - 免费在线开发者工具",
  "metaDescription": "免费的浏览器端开发者工具集合。Base64编码、密码生成器、哈希生成器、加密工具、文件校验等。100%客户端处理，数据不上传服务器。",
  "badge": "免费 · 开源",
  "subtitle": "开发者的瑞士军刀",
  "tagline": "无需注册、无需追踪，即开即用。",
  "searchPlaceholder": "搜索工具...",
  "noResults": "没有找到匹配 \"{query}\" 的工具",
  "resultsCount": "找到 {count} 个工具",
  "allTools": "全部工具",
  "viewGrouped": "分类",
  "viewAll": "全部",
  "clearSearch": "清除搜索"
}
```

- [ ] **Step 6: Update hero text in `public/locales/zh-TW/home.json`**

```json
{
  "title": "OmniKit - 免費線上開發者工具",
  "metaDescription": "免費的瀏覽器端開發者工具集合。Base64編碼、密碼產生器、雜湊產生器、加密工具、檔案校驗等。100%客戶端處理，資料不上傳伺服器。",
  "badge": "免費 · 開源",
  "subtitle": "開發者的瑞士軍刀",
  "tagline": "無需註冊、無需追蹤，即開即用。",
  "searchPlaceholder": "搜尋工具...",
  "noResults": "沒有找到匹配 \"{query}\" 的工具",
  "resultsCount": "找到 {count} 個工具",
  "allTools": "全部工具",
  "viewGrouped": "分類",
  "viewAll": "全部",
  "clearSearch": "清除搜尋"
}
```

- [ ] **Step 7: Verify JSON is valid**

Run: `for f in public/locales/*/tools.json public/locales/*/home.json; do node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" && echo "$f OK" || echo "$f FAIL"; done`
Expected: All files print OK

- [ ] **Step 8: Commit**

```bash
git add public/locales/en/tools.json public/locales/zh-CN/tools.json public/locales/zh-TW/tools.json public/locales/en/home.json public/locales/zh-CN/home.json public/locales/zh-TW/home.json
git commit -m "feat(homepage): add category translations and update hero text for all locales"
```

---

### Task 5: Homepage Rewrite — Server/Client Split + Full Layout

**Files:**

- Modify: `app/[locale]/page.tsx`
- Modify: `app/[locale]/home-page.tsx`

This is the core task. The homepage is split into:

- `page.tsx` (Server Component) — renders Hero + HomeClient
- `home-page.tsx` (Client Component, renamed conceptually to HomeClient) — all interactive parts

- [ ] **Step 1: Rewrite `app/[locale]/page.tsx` to Server/Client split**

```typescript
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../libs/seo";
import HomeClient from "./home-page";

const PATH = "";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return generatePageMeta({
    locale,
    path: PATH,
    description: t("metaDescription"),
  });
}

export default function HomeRoute() {
  return <HomeClient />;
}
```

(Note: `page.tsx` itself stays as a Server Component. `HomeClient` is imported from `home-page.tsx` which has `"use client"`.)

- [ ] **Step 2: Rewrite `app/[locale]/home-page.tsx`**

This is the largest change. The full component hierarchy:

```
HomeClient (default export)
├── Layout (headerPosition="sticky")
├── HeroSection
│   ├── Tagline (from home.subtitle)
│   └── SearchBox (input + clear + ⌘K hint)
├── ToolContent (conditional rendering)
│   ├── [Searching state] → SearchResultGrid
│   ├── [Default state with search empty]
│   │   ├── QuickAccess (dynamic from recent + defaults)
│   │   ├── ViewToggle [Grouped | All]
│   │   └── [Grouped] CategorySections or [All] FlatGrid
└── Footer (via Layout)
```

```typescript
"use client";

import { useState, useRef, useCallback } from "react";
import Layout from "../../components/layout";
import { useRouter } from "../../i18n/navigation";
import { useTranslations } from "next-intl";
import {
  getToolCards,
  getToolIconColor,
  getToolCardMap,
  getToolCardsByKeys,
  TOOL_CATEGORIES,
  QUICK_ACCESS_DEFAULT,
} from "../../libs/tools";
import type { ToolCategory } from "../../libs/tools";
import { searchTools } from "../../libs/tools-search";
import { Card } from "../../components/ui/card";
import { useRecentTools } from "../../hooks/use-recent-tools";
import { useIsMobile } from "../../hooks/use-is-mobile";
import { Search, X, LayoutGrid, Grid3X3 } from "lucide-react";
// Note: useIsMobile is available but not needed in HomeClient —
// responsive layout is handled via Tailwind breakpoints (grid-cols-2/3/4)

type ViewMode = "grouped" | "all";

function HeroSection({
  query,
  onQueryChange,
  onClear,
  onKeyDown,
  searchPlaceholder,
  subtitle,
  clearLabel,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  onClear: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  searchPlaceholder: string;
  subtitle: string;
  clearLabel: string;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-bg-base via-bg-base to-bg-surface">
      <div className="bg-grid-pattern absolute inset-0" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[200px] w-[500px] rounded-full bg-accent-cyan/5 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-5xl px-6 py-10 md:py-14 text-center">
        <h1 className="text-2xl md:text-3xl font-mono font-bold text-fg-primary tracking-tight">
          {subtitle}
        </h1>
        <div className="mx-auto mt-6 max-w-xl">
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-4 text-fg-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-border-default bg-bg-input py-3 pl-11 pr-16 text-sm text-fg-primary placeholder:text-fg-muted outline-none focus:border-accent-cyan/50 focus:shadow-[0_0_0_3px_rgba(6,214,160,0.1)] transition-all"
              role="searchbox"
              aria-label={searchPlaceholder}
              aria-expanded={query.trim().length > 0}
              aria-autocomplete="list"
            />
            {query && (
              <button
                type="button"
                onClick={onClear}
                className="absolute right-14 flex h-6 w-6 items-center justify-center rounded-full text-fg-muted hover:text-fg-primary hover:bg-bg-elevated transition-colors"
                aria-label={clearLabel}
              >
                <X size={14} />
              </button>
            )}
            <kbd className="absolute right-4 hidden sm:inline-flex items-center gap-0.5 rounded border border-border-default bg-bg-elevated px-1.5 py-0.5 text-[10px] font-mono text-fg-muted">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>
    </section>
  );
}

function ToolCardItem({
  tool,
  onClick,
}: {
  tool: ReturnType<typeof getToolCards>[0];
  onClick: () => void;
}) {
  const Icon = tool.icon;
  return (
    <Card hover className="group flex flex-col cursor-pointer" onClick={onClick}>
      <div className="flex flex-1 flex-col items-center p-5">
        {Icon && (
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-colors group-hover:brightness-110"
            style={{ backgroundColor: `${getToolIconColor(tool.path)}15` }}
          >
            <Icon size={28} style={{ color: getToolIconColor(tool.path) }} />
          </div>
        )}
        <h3 className="font-semibold text-fg-primary text-center">{tool.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-fg-secondary text-center leading-relaxed">
          {tool.description}
        </p>
      </div>
    </Card>
  );
}

function QuickAccessSection({
  tools,
  onToolClick,
}: {
  tools: ReturnType<typeof getToolCards>;
  onToolClick: (path: string, key: string) => void;
}) {
  if (tools.length === 0) return null;
  const router = useRouter();

  return (
    <section className="container mx-auto px-4 pt-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-medium text-fg-muted uppercase tracking-wider">Quick Access</span>
        <div className="flex-1 h-px bg-border-default" />
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const key = tool.path.slice(1);
          return (
            <Card
              key={tool.path}
              hover
              className="group flex flex-col items-center cursor-pointer py-4"
              onClick={() => onToolClick(tool.path, key)}
            >
              {Icon && (
                <div
                  className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg transition-colors group-hover:brightness-110"
                  style={{ backgroundColor: `${getToolIconColor(tool.path)}15` }}
                >
                  <Icon size={22} style={{ color: getToolIconColor(tool.path) }} />
                </div>
              )}
              <span className="text-xs font-semibold text-fg-primary text-center leading-tight">
                {tool.title}
              </span>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function ViewModeToggle({
  mode,
  onChange,
  labels,
}: {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
  labels: { grouped: string; all: string };
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-bg-input p-0.5">
      <button
        type="button"
        onClick={() => onChange("grouped")}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
          mode === "grouped"
            ? "bg-bg-surface text-fg-primary shadow-sm"
            : "text-fg-muted hover:text-fg-secondary"
        }`}
      >
        <Grid3X3 size={12} />
        {labels.grouped}
      </button>
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
          mode === "all"
            ? "bg-bg-surface text-fg-primary shadow-sm"
            : "text-fg-muted hover:text-fg-secondary"
        }`}
      >
        <LayoutGrid size={12} />
        {labels.all}
      </button>
    </div>
  );
}

function CategorySections({
  categories,
  cardMap,
  onToolClick,
  categoryNames,
}: {
  categories: typeof TOOL_CATEGORIES;
  cardMap: Map<string, ReturnType<typeof getToolCards>[0]>;
  onToolClick: (path: string, key: string) => void;
  categoryNames: Record<string, string>;
}) {
  return (
    <div className="space-y-8">
      {categories.map((cat) => {
        const tools = getToolCardsByKeys(cat.tools, cardMap);
        if (tools.length === 0) return null;
        return (
          <section key={cat.key}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-medium text-fg-muted uppercase tracking-wider">
                {categoryNames[cat.key] ?? cat.key}
              </span>
              <div className="flex-1 h-px bg-border-default" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {tools.map((tool) => (
                <ToolCardItem
                  key={tool.path}
                  tool={tool}
                  onClick={() => onToolClick(tool.path, tool.path.slice(1))}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function SearchResults({
  query,
  results,
  onToolClick,
  noResultsText,
  resultsCountText,
  focusedIndex,
  onCardRef,
}: {
  query: string;
  results: ReturnType<typeof getToolCards>;
  onToolClick: (path: string, key: string) => void;
  noResultsText: string;
  resultsCountText: string;
  focusedIndex: number;
  onCardRef: (index: number, el: HTMLDivElement | null) => void;
}) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Search size={32} className="text-fg-muted mb-3" />
        <p className="text-sm text-fg-muted">{noResultsText}</p>
      </div>
    );
  }

  return (
    <div role="listbox" aria-label={resultsCountText}>
      <p className="mb-4 text-sm text-fg-muted">{resultsCountText}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map((tool, index) => {
          const Icon = tool.icon;
          const isFocused = index === focusedIndex;
          return (
            <div
              key={tool.path}
              ref={(el) => onCardRef(index, el)}
              role="option"
              aria-selected={isFocused}
              onClick={() => onToolClick(tool.path, tool.path.slice(1))}
              className={`rounded-xl border bg-bg-surface p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-glow ${
                isFocused ? "border-accent-cyan ring-2 ring-accent-cyan/20" : "border-border-default"
              }`}
            >
              <div className="flex flex-col items-center">
                {Icon && (
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${getToolIconColor(tool.path)}15` }}
                  >
                    <Icon size={28} style={{ color: getToolIconColor(tool.path) }} />
                  </div>
                )}
                <h3 className="font-semibold text-fg-primary text-center">{tool.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-fg-secondary text-center leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HomeClient() {
  const router = useRouter();
  const t = useTranslations("tools");
  const tHome = useTranslations("home");
  const isMobile = useIsMobile();
  const { recentTools, trackUsage } = useRecentTools();

  const [query, setQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "grouped";
    try {
      const saved = localStorage.getItem("okrun:home-view");
      if (saved === "all" || saved === "grouped") return saved;
    } catch {}
    return "grouped";
  });

  const allTools = getToolCards(t);
  const cardMap = getToolCardMap(t);
  const filteredTools = searchTools(query, allTools);
  const isSearching = query.trim().length > 0;

  // Build Quick Access: recent ≤3 + defaults to fill 6
  const quickAccessKeys = (() => {
    const recent = recentTools.slice(0, 3);
    const fillCount = 6 - recent.length;
    const defaults = QUICK_ACCESS_DEFAULT.filter((k) => !recent.includes(k)).slice(0, fillCount);
    return [...recent, ...defaults];
  })();
  const quickAccessTools = getToolCardsByKeys(quickAccessKeys, cardMap);

  // Category names from i18n
  const categoryNames: Record<string, string> = {};
  for (const cat of TOOL_CATEGORIES) {
    const i18nKey = `categories.${cat.key}`;
    if (t.has(i18nKey)) {
      categoryNames[cat.key] = t(i18nKey);
    }
  }

  // i18n text with fallbacks
  const noResultsText = tHome("noResults").replace("{query}", query);
  const resultsCountText = tHome("resultsCount").replace("{count}", String(filteredTools.length));

  const handleToolClick = (path: string, key: string) => {
    trackUsage(key);
    router.push(path);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem("okrun:home-view", mode);
    } catch {}
  };

  const handleClearSearch = () => {
    setQuery("");
    setFocusedIndex(-1);
    cardRefs.current.clear();
  };

  const handleQueryChange = (q: string) => {
    setQuery(q);
    setFocusedIndex(-1);
  };

  // Keyboard navigation for search results
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClearSearch();
      return;
    }
    if (!isSearching) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = focusedIndex + 1;
      setFocusedIndex(next >= filteredTools.length ? 0 : next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = focusedIndex - 1;
      setFocusedIndex(prev < 0 ? filteredTools.length - 1 : prev);
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      const tool = filteredTools[focusedIndex];
      if (tool) handleToolClick(tool.path, tool.path.slice(1));
    }
  };

  // Scroll focused card into view
  const handleCardRef = (index: number, el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(index, el);
    } else {
      cardRefs.current.delete(index);
    }
  };

  // Scroll to focused card when index changes
  if (focusedIndex >= 0 && cardRefs.current.has(focusedIndex)) {
    cardRefs.current.get(focusedIndex)?.scrollIntoView({ block: "nearest" });
  }

  return (
    <Layout headerPosition="sticky">
      <HeroSection
        query={query}
        onQueryChange={handleQueryChange}
        onClear={handleClearSearch}
        onKeyDown={handleSearchKeyDown}
        searchPlaceholder={tHome("searchPlaceholder")}
        subtitle={tHome("subtitle")}
        clearLabel={tHome("clearSearch")}
      />

      <section className="container mx-auto px-4 pb-20 pt-6">
        {isSearching ? (
          <SearchResults
            query={query}
            results={filteredTools}
            onToolClick={handleToolClick}
            noResultsText={noResultsText}
            resultsCountText={resultsCountText}
            focusedIndex={focusedIndex}
            onCardRef={handleCardRef}
          />
        ) : (
          <>
            <QuickAccessSection tools={quickAccessTools} onToolClick={handleToolClick} />

            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-fg-muted uppercase tracking-wider">
                  {tHome("allTools")}
                </span>
                <ViewModeToggle
                  mode={viewMode}
                  onChange={handleViewModeChange}
                  labels={{
                    grouped: tHome("viewGrouped"),
                    all: tHome("viewAll"),
                  }}
                />
              </div>

              {viewMode === "grouped" ? (
                <CategorySections
                  categories={TOOL_CATEGORIES}
                  cardMap={cardMap}
                  onToolClick={handleToolClick}
                  categoryNames={categoryNames}
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allTools.map((tool) => (
                    <ToolCardItem
                      key={tool.path}
                      tool={tool}
                      onClick={() => handleToolClick(tool.path, tool.path.slice(1))}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </Layout>
  );
}
```

**Note on i18n:** All home.json keys (`noResults`, `resultsCount`, `allTools`, `viewGrouped`, `viewAll`, `clearSearch`, `searchPlaceholder`) are added in Task 4. The component references them directly via `tHome()`.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

- [ ] **Step 4: Run dev server and visually verify**

Run: `npm run dev`
Expected: Homepage shows sticky header + Hero with search + Quick Access + 6 category sections. Search filters tools in-place. Toggle switches between Grouped and All views.

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/page.tsx app/[locale]/home-page.tsx
git commit -m "feat(homepage): redesign homepage with search, quick access, categories, and view toggle"
```

---

### Task 6: Integration Verification

**Files:** None (verification only)

- [ ] **Step 1: Run full TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: Exit code 0, no errors

- [ ] **Step 2: Run all tests**

Run: `npm run test`
Expected: All existing tests pass + new tests pass

- [ ] **Step 3: Run ESLint**

Run: `npx eslint app/[locale]/home-page.tsx libs/tools.ts libs/tools-search.ts hooks/use-recent-tools.ts`
Expected: No errors (React Compiler will flag any `useMemo`/`useCallback` usage — verify none present)

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: Build succeeds without errors

- [ ] **Step 5: Visual QA — verify all 3 locales**

Open in browser and verify:

- `/` (en) — English category names, hero text
- `/zh-CN` — Chinese simplified category names, hero text
- `/zh-TW` — Chinese traditional category names, hero text

For each locale, verify:

- [ ] Sticky header visible
- [ ] Hero with search box shows
- [ ] Quick Access section shows 6 tools
- [ ] 6 category sections render with correct tools
- [ ] Search filters tools in-place (try "json", "sql", empty)
- [ ] View toggle switches between Grouped and All
- [ ] Clicking a tool navigates to it
- [ ] After returning, Quick Access shows recently used tools

- [ ] **Step 6: Commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix(homepage): address integration issues found during QA"
```
