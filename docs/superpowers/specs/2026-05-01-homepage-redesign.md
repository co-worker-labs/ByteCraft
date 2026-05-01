# Homepage Redesign — Design Spec

## Overview

Redesign the OmniKit homepage to improve user experience, tool discoverability, reachability, and page load performance. The current flat grid of 26 tools lacks categorization, prioritization, and search affordance, making it difficult for users to find tools quickly.

**Core principle**: "3-second rule" — users should see and reach their desired tool within 3 seconds of landing.

## Current State Analysis

### Existing Structure

```
HomePage
├── Layout (headerPosition="none") ← no navigation header
├── Introduce (Hero)
│   ├── subtitle + tagline
│   └── decorative divider
└── ToolCollection
    └── 26 tools × 4-col uniform grid (no grouping, no priority)
```

### Identified Problems

| Dimension               | Problem                                                                                                                | Severity    |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------- |
| **User Experience**     | 26 tools in a flat grid, no categories, no visual hierarchy — users must scan all cards to find a tool                 | 🔴 Critical |
| **Discoverability**     | No search box on homepage; search is hidden in `Cmd+K` drawer only, new users won't discover it                        | 🔴 Critical |
| **Tool Popularity**     | All tool cards are identical in size and style; JSON (most popular) has same visual weight as ASCII (lookup reference) | 🟡 Medium   |
| **Page Load**           | `"use client"` on entire page; all 26 cards render at once; no server/client split                                     | 🟡 Medium   |
| **Navigation Gap**      | `headerPosition="none"` removes the header entirely from homepage — inconsistent with all other pages                  | 🔴 Critical |
| **Mobile**              | Single column on mobile = 26 cards to scroll through sequentially                                                      | 🔴 Critical |
| **Information Density** | Each card shows only icon + title + 2-line description; no contextual differentiation                                  | 🟡 Medium   |

## Proposed Redesign

### New Layout Structure

```
page.tsx (Server Component)
├── Hero Section (Server Component — static tagline)
└── HomeClient (Client Component — interactive parts)
    ├── SearchBox
    ├── QuickAccess (dynamic: recent + defaults)
    ├── ViewToggle [Grouped | All]
    └── ToolSections (or FlatGrid based on toggle)
        ├── 📝 Text Processing    → JSON / Regex / Text Case / Diff / Markdown
        ├── 🔄 Encoding & Conversion → Base64 / URL Encoder / YAML / CSV / NumBase / Storage Unit
        ├── 🔐 Security & Crypto  → JWT / Hashing / Cipher / Password / Checksum
        ├── ⚡ Generators         → UUID / QR Code / Cron / Unix Timestamp
        ├── 🎨 Visual & Media     → Color / Image
        └── 📚 Reference & Lookup → ASCII / HTML Code / HTTP Status / DB Viewer

Layout (headerPosition="sticky") wraps everything.
```

### A. Hero Section with Search

```
┌─────────────────────────────────────────┐
│                                         │
│      Your Swiss Army Knife for Dev      │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🔍  Search tools...        ⌘K  │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

- Search box is **visibly prominent**, no shortcut required
- Hint `⌘K` inside the input teaches power users the shortcut
- Hero tagline is a **Server Component** (static, no JS cost)

### B. Search Interaction — In-Place Filtering

When the user types in the search box, the content below (Quick Access + Categories) is **replaced** by filtered results. No dropdown, no overlay.

**States:**

| State                     | What's Visible                                                                |
| ------------------------- | ----------------------------------------------------------------------------- |
| **Default** (empty query) | Quick Access + Categories (or All Tools based on toggle)                      |
| **Searching** (has query) | "N tools found" label + filtered card grid (same Card component)              |
| **No match**              | Empty state: icon + "No tools matching '{query}'" + "Try a different keyword" |

**Interaction rules:**

- Instant filtering on every keystroke — no debounce needed (26 tools, fuzzysort is sub-ms)
- Clear button (✕) appears in search box when query is non-empty
- `Escape` key clears the query and restores default view
- `↑↓` arrow keys navigate between result cards
- `Enter` on focused card navigates to that tool
- View toggle (Grouped/All) is **hidden** during search (results are always flat)
- Clicking a tool navigates to it; search state is NOT persisted (next visit shows default)

**Relationship with existing ⌘K ToolsDrawer:**

Both coexist, serving different purposes:

| Dimension   | Hero Search                    | ⌘K ToolsDrawer                  |
| ----------- | ------------------------------ | ------------------------------- |
| Entry point | Visible search box on homepage | Keyboard shortcut from any page |
| Display     | Card grid (rich info)          | Compact list (quick scan)       |
| Use case    | Homepage tool discovery        | Cross-page tool navigation      |
| Input       | Mouse + keyboard               | Keyboard-first                  |
| Engine      | Shared `searchTools()`         | Shared `searchTools()`          |

**Search scope expansion:**

Extend `searchTools()` to search `description` and `key` fields with weighted scoring:

```typescript
// libs/tools-search.ts
export function searchTools(query: string, tools: ToolCard[]): ToolCard[] {
  if (!query.trim()) return tools;
  const results = fuzzysort.go(query, tools, {
    keys: ["title", "searchTerms", "description", "key"],
    // title/searchTerms ×2 weight, description/key ×1
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

This ensures:

- Searching "sql" finds DB Viewer (via description)
- Searching "sha256" finds Hashing (via description)
- Searching "jwt" finds JWT (via title + key)
- Searching "图片" finds Image (via zh-CN searchTerms)

### C. Quick Access — Dynamic Personalization

Three-layer strategy based on user history:

| Visit type       | Quick Access content                                         |
| ---------------- | ------------------------------------------------------------ |
| **First visit**  | Default top 6: JSON / Base64 / JWT / Regex / Diff / Hashing  |
| **Return visit** | [Recently used ≤3] + [defaults to fill remaining slots to 6] |

**Implementation:**

- New hook `hooks/use-recent-tools.ts` manages a localStorage-backed MRU list (max 10 entries, FIFO eviction)
- `getToolCards()` result filtered by recent tool keys
- Storage key: defined in `libs/storage-keys.ts`

**Visual treatment:**

- Horizontal row, larger icon (40px) + bold title
- Hover: slight float-up + glow border (reuse `shadow-card-hover`)
- Desktop: 6 in a row; Tablet: 3+3; Mobile: 2×3 grid

### D. View Toggle — Grouped / All

A toggle at the top of the tool sections area:

```
[◎ Grouped by Category]  [○ All Tools]
```

- **Grouped** (default for first visit): 6 category sections with headings
- **All**: flat 4-column grid of all 26 tools (same as current homepage, but with header + search)
- **Persistence**: user preference saved to localStorage
- **Hidden during search**: when search is active, toggle is hidden (results are always flat)

### E. Category Sections

Each category is a visual section:

- **Section heading**: with icon, concise label (i18n translated)
- **Tool grid**: 2-6 tools per category, using existing `Card` component
- **Responsive**: Desktop 4 cols → Tablet 3 cols → Mobile 2 cols
- **Default state**: All expanded (no accordion — reduces clicks)

### F. Restored Header

- Change `headerPosition` from `"none"` to `"sticky"`
- Maintains navigation consistency across all pages
- Users can access ToolsDrawer, theme toggle, language switcher from homepage

### G. Performance Optimizations

**Primary: Server/Client Component split**

```
page.tsx (Server Component)
├── Hero tagline (SSR, zero JS)
└── HomeClient (Client Component — "use client")
    ├── SearchBox
    ├── QuickAccess
    ├── ViewToggle
    └── ToolSections
```

This reduces the client JS bundle by keeping the Hero section server-rendered.

**Secondary: Below-fold lazy rendering** (low priority)

- IntersectionObserver for categories below the fold
- 26 tools is a small DOM — lazy rendering is a nice-to-have, not critical
- First paint renders: Hero + Search + Quick Access + first 2 categories

### H. Accessibility

Search interaction accessibility:

- **Keyboard navigation**: `↑↓` arrows move focus between result cards, `Enter` navigates, `Escape` clears search
- **ARIA roles**: search box has `role="searchbox"`, result container has `role="listbox"`, each result card has `role="option"`
- **Focus management**: when results appear, first result receives visual focus indicator; focus stays in search area while navigating
- **Announcements**: result count changes announced via `aria-live="polite"` region

## Data Model Changes

### `libs/tools.ts` — Add Category Definitions

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

export const QUICK_ACCESS_DEFAULT = ["json", "base64", "jwt", "regex", "diff", "hashing"];
```

### `hooks/use-recent-tools.ts` — New Hook

```typescript
export function useRecentTools(): {
  recentTools: string[]; // tool keys sorted by recency (max 10)
  trackUsage: (key: string) => void;
};
```

- Backed by localStorage (key in `storage-keys.ts`)
- FIFO eviction when exceeding max 10 entries
- Quick Access reads first 3 entries + fills remaining from `QUICK_ACCESS_DEFAULT`

### i18n — Category Names

Add to `public/locales/{locale}/tools.json`:

```json
// en/tools.json
{
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

```json
// zh-CN/tools.json
{
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

```json
// zh-TW/tools.json
{
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

### `libs/tools-search.ts` — Expand Search Scope

See Section B for the updated `searchTools()` implementation with weighted scoring across `title`, `searchTerms`, `description`, and `key`.

## Files to Modify

| File                              | Change                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------ |
| `libs/tools.ts`                   | Add `ToolCategory`, `CategoryGroup`, `TOOL_CATEGORIES`, `QUICK_ACCESS_DEFAULT`, helper functions |
| `libs/tools-search.ts`            | Expand keys to include `description` + `key`, add weighted `scoreFn`                             |
| `libs/storage-keys.ts`            | Add storage keys for recent tools + view preference                                              |
| `hooks/use-recent-tools.ts`       | **New file** — localStorage-backed MRU tool usage tracking                                       |
| `app/[locale]/page.tsx`           | Split into Server (Hero) + Client (HomeClient) components                                        |
| `app/[locale]/home-page.tsx`      | Full rewrite → `HomeClient` component: Search + QuickAccess + Toggle + Categories                |
| `public/locales/en/tools.json`    | Add `categories` section                                                                         |
| `public/locales/zh-CN/tools.json` | Add `categories` section                                                                         |
| `public/locales/zh-TW/tools.json` | Add `categories` section                                                                         |
| `public/locales/en/home.json`     | Update subtitle/tagline for new hero                                                             |
| `public/locales/zh-CN/home.json`  | Update subtitle/tagline for new hero                                                             |
| `public/locales/zh-TW/home.json`  | Update subtitle/tagline for new hero                                                             |
| `components/json-ld.tsx`          | Verify structured data compatibility with new layout                                             |

## Expected Outcomes

| Metric                        | Current                          | Target                                             |
| ----------------------------- | -------------------------------- | -------------------------------------------------- |
| Tool reachability (most used) | Scroll + scan all 26             | 1 click from Quick Access (personalized)           |
| Search discoverability        | Hidden (Cmd+K only)              | Visible search box in hero + expanded search scope |
| Mobile scroll distance        | ~2600px (26 cards × 1 col)       | ~800px (grouped 2-col)                             |
| First meaningful paint        | All 26 cards render as client JS | Hero SSR + 6 quick access only                     |
| Navigation consistency        | Homepage has no header           | Consistent header across all pages                 |
| Category awareness            | None (flat list)                 | 6 clearly labeled sections                         |
| View preference               | None                             | Grouped/All toggle, persisted per user             |

## Scope

### In Scope

- Category data model in `libs/tools.ts`
- Homepage layout redesign (Hero, Search, Quick Access, View Toggle, Categories)
- Search interaction (in-place filtering, expanded scope, weighted scoring)
- Dynamic Quick Access (recent usage tracking)
- View toggle (Grouped / All) with persistence
- i18n category translations + updated home hero text
- Restored header navigation on homepage
- Server/Client Component split for performance
- Accessibility (keyboard nav, ARIA, focus management)

### Out of Scope

- Individual tool page redesigns
- ToolsDrawer changes (already functional)
- Analytics / usage tracking for "actual" popularity (beyond localStorage)
- PWA-specific homepage behavior
- Dark mode design changes (existing tokens sufficient)
- Tool-to-tool navigation ("Related Tools" links on tool pages) — future TODO
- Content-aware paste detection in search box — future TODO
