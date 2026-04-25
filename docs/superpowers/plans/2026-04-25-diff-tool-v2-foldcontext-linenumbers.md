# Diff Tool v2 — Context Folding & Input Line Numbers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add GitHub-style context folding to the diff viewer and line-number gutters to both inputs, on top of v1.

**Architecture:** Pure render-layer enhancement. The Web Worker contract, jsdiff invocation, normalization, persistence schema, and i18n namespace all stay identical to v1. A new pure helper `libs/diff/fold-context.ts` rewrites the worker's `DiffRowData[]` into a `Block[]` stream where long unchanged spans become a single collapsible block. `DiffViewer` owns an `expandedSet: Set<number>` and passes the block list down to both viewer flavors. A new `LineNumberedTextarea` wraps a `<textarea wrap="off">` with a left-aligned, scroll-synced gutter; `DiffInput` switches between gutter mode and v1 soft-wrap mode based on the input's line count and byte size.

**Tech Stack:** Same as v1. **No new runtime dependencies.** Builds on existing React 19 + Tailwind 4 + next-intl + `@tanstack/react-virtual` (v1 dep).

---

## Pre-conditions

This plan **requires v1 to be merged and green**. Verify before starting:

- [ ] **Pre-1: Confirm v1 plan tasks are complete**

```bash
rtk git log --oneline | head -30
```

Expect to see the 24 v1 commits ending with the acceptance-sweep commit (`feat(diff): …` family). The branch must build:

```bash
rtk npx tsc --noEmit
rtk npx next build
```

Expected: both clean.

- [ ] **Pre-2: Re-read project conventions**

This plan inherits **all** of v1 plan's conventions section verbatim — see `docs/superpowers/plans/2026-04-25-diff-tool.md` § "Project conventions you must follow". The most load-bearing rules:

1. **React Compiler is enabled** — never write `useMemo` / `useCallback` / `React.memo` manually.
2. **No new heavyweight deps** — no editor framework, no syntax highlighter.
3. **Component imports under `app/[locale]/diff/components/` use 4 levels of `../`** to reach project root — `../../../../libs/...`, `../../../../components/...`.
4. **Comments in English.**
5. **Always `rtk git …`** for commits.
6. **No test framework** — verification is `rtk npx tsc --noEmit` + Node REPL one-liners + manual sweep in dev server.

---

## Design decisions pinned by this plan

| Decision                    | Value                                                                                                                                                                                              | Rationale                                                                                                                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CONTEXT_LINES`             | `3`                                                                                                                                                                                                | GitHub-standard surrounding context                                                                                                                                           |
| `FOLD_THRESHOLD`            | `8`                                                                                                                                                                                                | GitHub-standard minimum unchanged-run length to fold                                                                                                                          |
| Line-number show threshold  | `value.split("\n").length <= 5000 && value.length < 512 * 1024`                                                                                                                                    | Two ANDed gates; either trips → gutter hidden                                                                                                                                 |
| Gutter width                | `w-12` (48px)                                                                                                                                                                                      | Fits up to 99,999 (capped at 5000 anyway)                                                                                                                                     |
| Gutter font                 | `font-mono text-sm leading-5`                                                                                                                                                                      | Must match the textarea's text metrics or numbers misalign                                                                                                                    |
| Textarea wrap               | `wrap="off"` while gutter visible; default soft-wrap when hidden                                                                                                                                   | Required to keep one logical line on one visual row                                                                                                                           |
| `expandedSet` reset trigger | `useEffect(..., [state.rows])` in `DiffViewer`                                                                                                                                                     | Identity check on the rows array — `diff-page.tsx` replaces it on every fresh result                                                                                          |
| `FoldPlaceholder` location  | `app/[locale]/diff/components/FoldPlaceholder.tsx`                                                                                                                                                 | Used by both side-by-side and inline; extracting avoids duplication                                                                                                           |
| `DiffSideBySide` row layout | Per-row `grid grid-cols-2` (was: outer grid + two stacked column divs in v1)                                                                                                                       | Refactor required so a fold placeholder can occupy a single row that spans both columns. Visually identical because both layouts produce the same 50/50 split with `divide-x` |
| `ViewerState` shape         | Unchanged (`kind: "result"; rows: DiffRowData[]`) — `DiffViewer` calls `foldContext(rows, true)` because reaching `kind: "result"` already implies `hasChanges === true` per v1 viewer-state logic | Lets `diff-page.tsx` stay untouched (spec File Changes commitment)                                                                                                            |

---

## File Structure

```
# New
libs/diff/
└── fold-context.ts                                # Pure: rows[] → Block[] with fold blocks; sanity-checked via Node REPL

components/ui/
└── line-numbered-textarea.tsx                     # Wraps <textarea> with synced line-number gutter

app/[locale]/diff/components/
└── FoldPlaceholder.tsx                            # Clickable full-width row used by both viewer flavors

# Modified (v1 files)
app/[locale]/diff/components/
├── DiffInput.tsx                                  # Swap StyledTextarea → LineNumberedTextarea
├── DiffViewer.tsx                                 # Run foldContext, hold expandedSet, pass blocks down
├── DiffSideBySide.tsx                             # Consume Block[]; refactor to per-row grid; render fold placeholder
└── DiffInline.tsx                                 # Consume Block[]; render fold placeholder

public/locales/{en,zh-CN,zh-TW}/diff.json          # +fold.* keys
```

No other files change.

---

## Task 1: `libs/diff/fold-context.ts`

**Files:**

- Create: `libs/diff/fold-context.ts`

- [ ] **Step 1: Write the module**

Create `libs/diff/fold-context.ts`:

```ts
// Pure context-folding for the diff viewer.
// Input: full DiffRowData[] from the worker.
// Output: Block[] where unchanged runs of length >= FOLD_THRESHOLD become
// a single "fold" block surrounded by CONTEXT_LINES rows on each non-edge side.
// Folding is gated by hasChanges; identical inputs pass through unchanged.

import type { DiffRowData } from "./types";

export const CONTEXT_LINES = 3;
export const FOLD_THRESHOLD = 8;

export type Block =
  | { kind: "row"; row: DiffRowData }
  | { kind: "fold"; id: number; hidden: DiffRowData[] };

export function foldContext(rows: DiffRowData[], hasChanges: boolean): Block[] {
  if (!hasChanges) {
    return rows.map((row) => ({ kind: "row" as const, row }));
  }

  const out: Block[] = [];
  let nextFoldId = 1;
  let i = 0;

  while (i < rows.length) {
    if (rows[i].kind !== "context") {
      out.push({ kind: "row", row: rows[i] });
      i++;
      continue;
    }

    // Collect a contiguous run of context rows.
    const runStart = i;
    while (i < rows.length && rows[i].kind === "context") i++;
    const runEnd = i; // exclusive
    const runLen = runEnd - runStart;

    if (runLen < FOLD_THRESHOLD) {
      for (let k = runStart; k < runEnd; k++) {
        out.push({ kind: "row", row: rows[k] });
      }
      continue;
    }

    const isHead = runStart === 0;
    const isTail = runEnd === rows.length;
    const keepBefore = isHead ? 0 : CONTEXT_LINES;
    const keepAfter = isTail ? 0 : CONTEXT_LINES;
    const hiddenStart = runStart + keepBefore;
    const hiddenEnd = runEnd - keepAfter;

    // After trimming for visible context, the hidden middle should still be
    // worth folding — otherwise just render the whole run.
    if (hiddenEnd - hiddenStart < FOLD_THRESHOLD - keepBefore - keepAfter) {
      for (let k = runStart; k < runEnd; k++) {
        out.push({ kind: "row", row: rows[k] });
      }
      continue;
    }

    for (let k = runStart; k < hiddenStart; k++) {
      out.push({ kind: "row", row: rows[k] });
    }
    out.push({
      kind: "fold",
      id: nextFoldId++,
      hidden: rows.slice(hiddenStart, hiddenEnd),
    });
    for (let k = hiddenEnd; k < runEnd; k++) {
      out.push({ kind: "row", row: rows[k] });
    }
  }

  return out;
}
```

- [ ] **Step 2: Sanity-check the algorithm in Node**

Project has no test runner; verify via inline JS (mirrors the algorithm exactly). Run:

```bash
rtk node --input-type=module -e "
const FOLD_THRESHOLD = 8;
const CONTEXT_LINES = 3;
const ctx = (n) => Array.from({length: n}, (_, i) => ({ kind: 'context', oldNo: i+1, newNo: i+1, text: 'c'+(i+1) }));
const del = (n) => ({ kind: 'del', oldNo: n, segments: [{text:'-', changed:true}] });
const add = (n) => ({ kind: 'add', newNo: n, segments: [{text:'+', changed:true}] });

function foldContext(rows, hasChanges) {
  if (!hasChanges) return rows.map(r => ({ kind: 'row', row: r }));
  const out = []; let nextFoldId = 1; let i = 0;
  while (i < rows.length) {
    if (rows[i].kind !== 'context') { out.push({ kind: 'row', row: rows[i] }); i++; continue; }
    const runStart = i;
    while (i < rows.length && rows[i].kind === 'context') i++;
    const runEnd = i; const runLen = runEnd - runStart;
    if (runLen < FOLD_THRESHOLD) { for (let k = runStart; k < runEnd; k++) out.push({ kind: 'row', row: rows[k] }); continue; }
    const isHead = runStart === 0, isTail = runEnd === rows.length;
    const keepBefore = isHead ? 0 : CONTEXT_LINES;
    const keepAfter = isTail ? 0 : CONTEXT_LINES;
    const hiddenStart = runStart + keepBefore;
    const hiddenEnd = runEnd - keepAfter;
    if (hiddenEnd - hiddenStart < FOLD_THRESHOLD - keepBefore - keepAfter) {
      for (let k = runStart; k < runEnd; k++) out.push({ kind: 'row', row: rows[k] }); continue;
    }
    for (let k = runStart; k < hiddenStart; k++) out.push({ kind: 'row', row: rows[k] });
    out.push({ kind: 'fold', id: nextFoldId++, hidden: rows.slice(hiddenStart, hiddenEnd) });
    for (let k = hiddenEnd; k < runEnd; k++) out.push({ kind: 'row', row: rows[k] });
  }
  return out;
}

// (a) hasChanges=false → all rows
let r = foldContext(ctx(20), false);
console.assert(r.every(b => b.kind === 'row') && r.length === 20, 'a: pass-through');

// (b) short context run between changes, no fold
r = foldContext([del(1), add(2), ...ctx(5), del(8), add(9)], true);
console.assert(r.every(b => b.kind === 'row'), 'b: short run not folded');

// (c) long context run between changes → 1 fold, 14 hidden
r = foldContext([del(1), add(2), ...ctx(20), del(23), add(24)], true);
const folds_c = r.filter(b => b.kind === 'fold');
console.assert(folds_c.length === 1, 'c: one fold');
console.assert(folds_c[0].hidden.length === 14, 'c: hidden=' + folds_c[0].hidden.length + ' want 14');

// (d) long run at head: fold at index 0, hidden=17
r = foldContext([...ctx(20), del(21), add(22)], true);
console.assert(r[0].kind === 'fold', 'd: fold at index 0');
console.assert(r[0].hidden.length === 17, 'd: head hidden=' + r[0].hidden.length + ' want 17');

// (e) long run at tail: last is fold, hidden=17
r = foldContext([del(1), add(2), ...ctx(20)], true);
console.assert(r[r.length-1].kind === 'fold', 'e: fold at tail');
console.assert(r[r.length-1].hidden.length === 17, 'e: tail hidden=' + r[r.length-1].hidden.length + ' want 17');

// (f) two long runs → ids 1 and 2
r = foldContext([del(1), add(2), ...ctx(20), del(23), add(24), ...ctx(20), del(45), add(46)], true);
const folds_f = r.filter(b => b.kind === 'fold');
console.assert(folds_f.length === 2, 'f: two folds');
console.assert(folds_f[0].id === 1 && folds_f[1].id === 2, 'f: ids 1,2 got ' + folds_f.map(b=>b.id).join(','));

console.log('foldContext ok');
"
```

Expected stdout: `foldContext ok` with no `Assertion failed` lines.

- [ ] **Step 3: Type-check**

```bash
rtk npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
rtk git add libs/diff/fold-context.ts
rtk git commit -m "feat(diff): add pure context-folding helper for the diff viewer"
```

---

## Task 2: i18n keys for fold UI (three locales)

**Files:**

- Modify: `public/locales/en/diff.json`
- Modify: `public/locales/zh-CN/diff.json`
- Modify: `public/locales/zh-TW/diff.json`

- [ ] **Step 1: Add `fold` block to `public/locales/en/diff.json`**

Open the file. Find the `"options": { … }` object (already exists in v1). Insert a new `"fold"` object **immediately after** the closing brace of `"options"`, before `"noChanges"`. The result around that region must read:

```json
  "options": {
    "ignoreWhitespace": "Ignore whitespace",
    "ignoreCase": "Ignore case"
  },
  "fold": {
    "hiddenLines": "{count} unchanged lines",
    "expand": "Expand",
    "collapse": "Collapse",
    "ariaExpand": "Show {count} hidden lines",
    "ariaCollapse": "Hide {count} lines"
  },
  "noChanges": "No differences found",
```

- [ ] **Step 2: Add `fold` block to `public/locales/zh-CN/diff.json`**

Same insertion point. Resulting region:

```json
  "options": {
    "ignoreWhitespace": "忽略空白字符",
    "ignoreCase": "忽略大小写"
  },
  "fold": {
    "hiddenLines": "{count} 行未改动",
    "expand": "展开",
    "collapse": "收回",
    "ariaExpand": "展开 {count} 行未显示内容",
    "ariaCollapse": "收回 {count} 行"
  },
  "noChanges": "未发现差异",
```

- [ ] **Step 3: Add `fold` block to `public/locales/zh-TW/diff.json`**

Same insertion point. Resulting region:

```json
  "options": {
    "ignoreWhitespace": "忽略空白字元",
    "ignoreCase": "忽略大小寫"
  },
  "fold": {
    "hiddenLines": "{count} 行未變動",
    "expand": "展開",
    "collapse": "收合",
    "ariaExpand": "展開 {count} 行未顯示內容",
    "ariaCollapse": "收合 {count} 行"
  },
  "noChanges": "未發現差異",
```

- [ ] **Step 4: Prettier check**

```bash
rtk npx prettier --check public/locales/en/diff.json public/locales/zh-CN/diff.json public/locales/zh-TW/diff.json
```

Expected: all pass. If any fails, run with `--write` then re-check.

- [ ] **Step 5: Type-check**

```bash
rtk npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
rtk git add public/locales/en/diff.json public/locales/zh-CN/diff.json public/locales/zh-TW/diff.json
rtk git commit -m "feat(diff): add fold.* translations for context-folding UI"
```

---

## Task 3: `LineNumberedTextarea` component

**Files:**

- Create: `components/ui/line-numbered-textarea.tsx`

- [ ] **Step 1: Write the component**

Create `components/ui/line-numbered-textarea.tsx`:

```tsx
"use client";

import {
  forwardRef,
  useRef,
  type TextareaHTMLAttributes,
  type ReactNode,
  type UIEvent,
} from "react";

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "wrap"> & {
  label?: ReactNode;
  /** When true, the gutter renders and the textarea uses wrap="off". */
  showLineNumbers: boolean;
};

export const LineNumberedTextarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, className = "", showLineNumbers, value, onScroll, ...rest }, ref) => {
    const gutterRef = useRef<HTMLDivElement | null>(null);

    if (!showLineNumbers) {
      // Mirrors v1 StyledTextarea exactly — soft wrap, no gutter.
      return (
        <div>
          {label && (
            <label className="block text-sm font-medium text-fg-secondary mb-1">{label}</label>
          )}
          <textarea
            ref={ref}
            value={value}
            onScroll={onScroll}
            className={`w-full bg-bg-input border border-border-default rounded-lg px-3 py-2 text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan focus:shadow-input-focus transition-all duration-200 resize-y ${className}`}
            {...rest}
          />
        </div>
      );
    }

    const text = typeof value === "string" ? value : Array.isArray(value) ? value.join("") : "";
    const lineCount = Math.max(1, text.split("\n").length);

    function handleScroll(e: UIEvent<HTMLTextAreaElement>) {
      if (gutterRef.current) {
        gutterRef.current.scrollTop = e.currentTarget.scrollTop;
      }
      if (onScroll) onScroll(e);
    }

    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-fg-secondary mb-1">{label}</label>
        )}
        <div className="flex w-full bg-bg-input border border-border-default rounded-lg overflow-hidden focus-within:border-accent-cyan focus-within:shadow-input-focus transition-all duration-200">
          <div
            ref={gutterRef}
            aria-hidden="true"
            className="w-12 flex-shrink-0 overflow-hidden border-r border-border-default text-end pr-2 pl-2 select-none text-fg-muted text-sm font-mono leading-5 py-2"
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i + 1}>{i + 1}</div>
            ))}
          </div>
          <textarea
            ref={ref}
            wrap="off"
            value={value}
            onScroll={handleScroll}
            className={`flex-1 bg-bg-input px-3 py-2 text-fg-primary placeholder:text-fg-muted focus:outline-none resize-y font-mono text-sm leading-5 overflow-auto ${className}`}
            {...rest}
          />
        </div>
      </div>
    );
  }
);

LineNumberedTextarea.displayName = "LineNumberedTextarea";
```

- [ ] **Step 2: Type-check**

```bash
rtk npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
rtk git add components/ui/line-numbered-textarea.tsx
rtk git commit -m "feat(ui): add LineNumberedTextarea with synced gutter"
```

---

## Task 4: Wire `LineNumberedTextarea` into `DiffInput`

**Files:**

- Modify: `app/[locale]/diff/components/DiffInput.tsx`

- [ ] **Step 1: Replace the import**

In `app/[locale]/diff/components/DiffInput.tsx`, change the line:

```tsx
import { StyledTextarea } from "../../../../components/ui/input";
```

to:

```tsx
import { LineNumberedTextarea } from "../../../../components/ui/line-numbered-textarea";
```

- [ ] **Step 2: Compute the visibility flag inside the component**

Inside `function DiffInput(...)`, just before the `return (` statement, insert:

```tsx
const lineCount = value.split("\n").length;
const showLineNumbers = lineCount <= 5000 && value.length < 512 * 1024;
```

- [ ] **Step 3: Replace the `<StyledTextarea …/>` JSX**

Find the existing JSX:

```tsx
<StyledTextarea
  placeholder={placeholder}
  rows={12}
  value={value}
  onChange={(e) => onChange(e.target.value)}
  className="font-mono text-sm min-h-[240px]"
/>
```

Replace with:

```tsx
<LineNumberedTextarea
  placeholder={placeholder}
  rows={12}
  value={value}
  onChange={(e) => onChange(e.target.value)}
  className="font-mono text-sm min-h-[240px]"
  showLineNumbers={showLineNumbers}
/>
```

- [ ] **Step 4: Type-check**

```bash
rtk npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 5: Smoke-test in browser**

```bash
rtk npm run dev
```

Open `http://localhost:3000/diff`. Type a few short lines into the Original textarea. Confirm:

- Line numbers `1`, `2`, `3`, … appear in a left gutter that scrolls with the text.
- Long single-line content (paste 1000 chars into one line) scrolls horizontally inside the textarea; the gutter does NOT scroll horizontally.
- Pasting a file > 5000 lines (or > 512KB) hides the gutter and the textarea reverts to soft-wrap.

Stop the dev server (Ctrl+C).

- [ ] **Step 6: Commit**

```bash
rtk git add "app/[locale]/diff/components/DiffInput.tsx"
rtk git commit -m "feat(diff): show line-number gutter on small inputs"
```

---

## Task 5: `DiffViewer` — fold + expandedSet

**Files:**

- Modify: `app/[locale]/diff/components/DiffViewer.tsx`

- [ ] **Step 1: Replace the file content with the v2 version**

Open `app/[locale]/diff/components/DiffViewer.tsx`. Replace the entire file content with:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { DiffRowData } from "../../../../libs/diff/types";
import { foldContext, type Block } from "../../../../libs/diff/fold-context";
import { DiffSideBySide } from "./DiffSideBySide";
import { DiffInline } from "./DiffInline";
import { Button } from "../../../../components/ui/button";

export type ViewMode = "side" | "inline";
export type ViewerState =
  | { kind: "idle" }
  | { kind: "computing" }
  | { kind: "manualHint"; onCompare: () => void }
  | { kind: "equal" }
  | { kind: "result"; rows: DiffRowData[] };

export interface DiffViewerProps {
  state: ViewerState;
  viewMode: ViewMode;
  jsonMode: boolean;
}

export function DiffViewer({ state, viewMode, jsonMode }: DiffViewerProps) {
  const t = useTranslations("diff");
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set());

  // Reset expanded folds whenever a new diff result arrives.
  // Identity check is fine: diff-page.tsx replaces the array on every fresh result.
  const rowsKey = state.kind === "result" ? state.rows : null;
  useEffect(() => {
    setExpandedSet(new Set());
  }, [rowsKey]);

  if (state.kind === "idle") return null;

  if (state.kind === "computing") {
    return (
      <div className="flex items-center justify-center h-40 text-fg-muted">{t("computing")}</div>
    );
  }

  if (state.kind === "manualHint") {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-3">
        <span className="text-fg-muted text-sm">{t("manualHint")}</span>
        <Button onClick={state.onCompare}>{t("compare")}</Button>
      </div>
    );
  }

  if (state.kind === "equal") {
    return (
      <div className="flex items-center justify-center h-40 text-fg-muted">{t("noChanges")}</div>
    );
  }

  // state.kind === "result". Reaching this branch already implies hasChanges === true
  // per diff-page.tsx's viewerState computation (kind: "equal" gates !hasChanges).
  const blocks: Block[] = foldContext(state.rows, true);

  function onToggle(id: number) {
    const next = new Set(expandedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedSet(next);
  }

  return viewMode === "side" ? (
    <DiffSideBySide
      blocks={blocks}
      expandedSet={expandedSet}
      onToggle={onToggle}
      jsonMode={jsonMode}
    />
  ) : (
    <DiffInline blocks={blocks} expandedSet={expandedSet} onToggle={onToggle} jsonMode={jsonMode} />
  );
}
```

- [ ] **Step 2: Type-check (will fail until Tasks 6–8 land)**

```bash
rtk npx tsc --noEmit
```

Expected: failures complaining about `DiffSideBySide` / `DiffInline` props (they still take `rows`, not `blocks`). This is expected. **Do not commit yet** — Task 5 is intentionally unfinishable on its own; it is committed together with Tasks 6–8 once the new prop shape lines up.

---

## Task 6: `FoldPlaceholder` shared component

**Files:**

- Create: `app/[locale]/diff/components/FoldPlaceholder.tsx`

- [ ] **Step 1: Write the component**

Create `app/[locale]/diff/components/FoldPlaceholder.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";

export interface FoldPlaceholderProps {
  hiddenCount: number;
  expanded: boolean;
  onClick: () => void;
}

export function FoldPlaceholder({ hiddenCount, expanded, onClick }: FoldPlaceholderProps) {
  const t = useTranslations("diff");
  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-label={
        expanded
          ? t("fold.ariaCollapse", { count: hiddenCount })
          : t("fold.ariaExpand", { count: hiddenCount })
      }
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="flex items-center justify-center gap-3 w-full h-5 leading-5 text-xs font-mono bg-bg-elevated border-y border-border-default text-fg-muted hover:bg-bg-surface cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-accent-cyan"
    >
      <span>{t("fold.hiddenLines", { count: hiddenCount })}</span>
      <span className="px-2 rounded border border-border-default text-[10px] uppercase tracking-wider">
        {expanded ? t("fold.collapse") : t("fold.expand")}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Type-check (Tasks 5/7/8 still unfinished — keep failures expected)**

Skipped intentionally; commit gating happens at Task 8.

---

## Task 7: `DiffSideBySide` — consume `Block[]` + render fold placeholder

**Files:**

- Modify: `app/[locale]/diff/components/DiffSideBySide.tsx`

- [ ] **Step 1: Replace the file content with the v2 version**

Open `app/[locale]/diff/components/DiffSideBySide.tsx`. Replace the entire file content with:

```tsx
"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { DiffRowData } from "../../../../libs/diff/types";
import type { Block } from "../../../../libs/diff/fold-context";
import { VIRTUALIZATION_THRESHOLD } from "../../../../libs/diff/compute";
import { DiffRow, EmptyRow } from "./DiffRow";
import { FoldPlaceholder } from "./FoldPlaceholder";

type WorkItem =
  | { kind: "row"; row: DiffRowData }
  | { kind: "fold"; id: number; hidden: DiffRowData[] };

type RenderItem =
  | { kind: "pair"; left: DiffRowData | null; right: DiffRowData | null }
  | { kind: "fold"; id: number; hiddenCount: number; expanded: boolean };

// Walk the Block stream and pair consecutive del/add rows column-by-column.
// Folded blocks become a single full-width placeholder; expanded folds splice
// their hidden rows back in (preceded by the placeholder so it can be collapsed).
function pairBlocks(blocks: Block[], expandedSet: Set<number>): RenderItem[] {
  // Step 1: flatten Block[] into a working list, expanding folds as needed.
  const work: WorkItem[] = [];
  for (const b of blocks) {
    if (b.kind === "row") {
      work.push({ kind: "row", row: b.row });
    } else {
      work.push({ kind: "fold", id: b.id, hidden: b.hidden });
      if (expandedSet.has(b.id)) {
        for (const r of b.hidden) work.push({ kind: "row", row: r });
      }
    }
  }

  // Step 2: walk and pair.
  const out: RenderItem[] = [];
  let i = 0;
  while (i < work.length) {
    const item = work[i];
    if (item.kind === "fold") {
      out.push({
        kind: "fold",
        id: item.id,
        hiddenCount: item.hidden.length,
        expanded: expandedSet.has(item.id),
      });
      i++;
      continue;
    }
    const r = item.row;
    if (r.kind === "context") {
      out.push({ kind: "pair", left: r, right: r });
      i++;
      continue;
    }
    if (r.kind === "del") {
      const delStart = i;
      while (
        i < work.length &&
        work[i].kind === "row" &&
        (work[i] as { kind: "row"; row: DiffRowData }).row.kind === "del"
      ) {
        i++;
      }
      const delEnd = i;
      const addStart = i;
      while (
        i < work.length &&
        work[i].kind === "row" &&
        (work[i] as { kind: "row"; row: DiffRowData }).row.kind === "add"
      ) {
        i++;
      }
      const addEnd = i;
      const delCount = delEnd - delStart;
      const addCount = addEnd - addStart;
      const paired = Math.min(delCount, addCount);
      for (let k = 0; k < paired; k++) {
        out.push({
          kind: "pair",
          left: (work[delStart + k] as { kind: "row"; row: DiffRowData }).row,
          right: (work[addStart + k] as { kind: "row"; row: DiffRowData }).row,
        });
      }
      for (let k = paired; k < delCount; k++) {
        out.push({
          kind: "pair",
          left: (work[delStart + k] as { kind: "row"; row: DiffRowData }).row,
          right: null,
        });
      }
      for (let k = paired; k < addCount; k++) {
        out.push({
          kind: "pair",
          left: null,
          right: (work[addStart + k] as { kind: "row"; row: DiffRowData }).row,
        });
      }
      continue;
    }
    // Stray add without preceding del.
    out.push({ kind: "pair", left: null, right: r });
    i++;
  }
  return out;
}

const ROW_HEIGHT = 20;

export interface DiffSideBySideProps {
  blocks: Block[];
  expandedSet: Set<number>;
  onToggle: (id: number) => void;
  jsonMode: boolean;
}

export function DiffSideBySide({ blocks, expandedSet, onToggle, jsonMode }: DiffSideBySideProps) {
  const items = pairBlocks(blocks, expandedSet);
  const virtualize = items.length > VIRTUALIZATION_THRESHOLD;

  const parentRef = useRef<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: virtualize ? items.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  });

  if (!virtualize) {
    return (
      <div className="overflow-x-auto border border-border-default rounded-lg bg-bg-elevated">
        {items.map((it, i) => {
          if (it.kind === "fold") {
            return (
              <FoldPlaceholder
                key={`f${it.id}`}
                hiddenCount={it.hiddenCount}
                expanded={it.expanded}
                onClick={() => onToggle(it.id)}
              />
            );
          }
          return (
            <div key={i} className="grid grid-cols-2 divide-x divide-border-default">
              {it.left ? (
                <DiffRow row={it.left} jsonMode={jsonMode} side="left" />
              ) : (
                <EmptyRow side="left" />
              )}
              {it.right ? (
                <DiffRow row={it.right} jsonMode={jsonMode} side="right" />
              ) : (
                <EmptyRow side="right" />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();
  return (
    <div
      ref={parentRef}
      className="border border-border-default rounded-lg bg-bg-elevated h-[600px] overflow-auto"
    >
      <div style={{ height: `${virtualizer.getTotalSize()}px` }} className="relative">
        {virtualItems.map((vi) => {
          const it = items[vi.index];
          if (it.kind === "fold") {
            return (
              <div
                key={vi.key}
                className="absolute inset-x-0"
                style={{ transform: `translateY(${vi.start}px)` }}
              >
                <FoldPlaceholder
                  hiddenCount={it.hiddenCount}
                  expanded={it.expanded}
                  onClick={() => onToggle(it.id)}
                />
              </div>
            );
          }
          return (
            <div
              key={vi.key}
              className="absolute inset-x-0 grid grid-cols-2 divide-x divide-border-default"
              style={{ transform: `translateY(${vi.start}px)` }}
            >
              {it.left ? (
                <DiffRow row={it.left} jsonMode={jsonMode} side="left" />
              ) : (
                <EmptyRow side="left" />
              )}
              {it.right ? (
                <DiffRow row={it.right} jsonMode={jsonMode} side="right" />
              ) : (
                <EmptyRow side="right" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check (Task 8 still pending — DiffInline still on v1 props)**

Skipped; commit gate at Task 8.

---

## Task 8: `DiffInline` — consume `Block[]` + render fold placeholder, then commit Tasks 5–8

**Files:**

- Modify: `app/[locale]/diff/components/DiffInline.tsx`

- [ ] **Step 1: Replace the file content with the v2 version**

Open `app/[locale]/diff/components/DiffInline.tsx`. Replace the entire file content with:

```tsx
"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { DiffRowData } from "../../../../libs/diff/types";
import type { Block } from "../../../../libs/diff/fold-context";
import { VIRTUALIZATION_THRESHOLD } from "../../../../libs/diff/compute";
import { DiffRow } from "./DiffRow";
import { FoldPlaceholder } from "./FoldPlaceholder";

type InlineItem =
  | { kind: "row"; row: DiffRowData }
  | { kind: "fold"; id: number; hiddenCount: number; expanded: boolean };

function flattenBlocks(blocks: Block[], expandedSet: Set<number>): InlineItem[] {
  const out: InlineItem[] = [];
  for (const b of blocks) {
    if (b.kind === "row") {
      out.push({ kind: "row", row: b.row });
      continue;
    }
    out.push({
      kind: "fold",
      id: b.id,
      hiddenCount: b.hidden.length,
      expanded: expandedSet.has(b.id),
    });
    if (expandedSet.has(b.id)) {
      for (const r of b.hidden) out.push({ kind: "row", row: r });
    }
  }
  return out;
}

const ROW_HEIGHT = 20;

export interface DiffInlineProps {
  blocks: Block[];
  expandedSet: Set<number>;
  onToggle: (id: number) => void;
  jsonMode: boolean;
}

export function DiffInline({ blocks, expandedSet, onToggle, jsonMode }: DiffInlineProps) {
  const items = flattenBlocks(blocks, expandedSet);
  const virtualize = items.length > VIRTUALIZATION_THRESHOLD;

  const parentRef = useRef<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: virtualize ? items.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  });

  if (!virtualize) {
    return (
      <div className="overflow-x-auto border border-border-default rounded-lg bg-bg-elevated">
        {items.map((it, i) =>
          it.kind === "fold" ? (
            <FoldPlaceholder
              key={`f${it.id}`}
              hiddenCount={it.hiddenCount}
              expanded={it.expanded}
              onClick={() => onToggle(it.id)}
            />
          ) : (
            <DiffRow key={i} row={it.row} jsonMode={jsonMode} side="both" />
          )
        )}
      </div>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();
  return (
    <div
      ref={parentRef}
      className="border border-border-default rounded-lg bg-bg-elevated h-[600px] overflow-auto"
    >
      <div style={{ height: `${virtualizer.getTotalSize()}px` }} className="relative">
        {virtualItems.map((vi) => {
          const it = items[vi.index];
          return (
            <div
              key={vi.key}
              className="absolute inset-x-0"
              style={{ transform: `translateY(${vi.start}px)` }}
            >
              {it.kind === "fold" ? (
                <FoldPlaceholder
                  hiddenCount={it.hiddenCount}
                  expanded={it.expanded}
                  onClick={() => onToggle(it.id)}
                />
              ) : (
                <DiffRow row={it.row} jsonMode={jsonMode} side="both" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check (now everything should line up)**

```bash
rtk npx tsc --noEmit
```

Expected: clean. If any error remains, the most likely cause is a missed import path or a stale prop name in `DiffViewer.tsx`. Re-read Task 5 / Task 7 / Task 8.

- [ ] **Step 3: Quick smoke check in dev server**

```bash
rtk npm run dev
```

Open `http://localhost:3000/diff`. Paste two ~30-line texts that differ on lines 5 and 25 (so there's an unchanged span ≥ 8 between them). Confirm:

- A `… N unchanged lines …  Expand` placeholder appears between the two changed regions.
- Clicking the placeholder reveals the hidden lines and the chip swaps to `Collapse`.
- Clicking `Collapse` re-folds the block.
- Switching between Side-by-side and Inline views keeps fold behavior consistent (state resets per the design).
- Editing one of the inputs and waiting for re-compute → all expanded folds reset to folded.

Stop the dev server.

- [ ] **Step 4: Commit Tasks 5–8 together**

```bash
rtk git add "app/[locale]/diff/components/DiffViewer.tsx" "app/[locale]/diff/components/DiffSideBySide.tsx" "app/[locale]/diff/components/DiffInline.tsx" "app/[locale]/diff/components/FoldPlaceholder.tsx"
rtk git commit -m "feat(diff): collapse long unchanged spans in side-by-side and inline views"
```

---

## Task 9: End-to-end acceptance sweep

**Files:**

- No code changes expected. This task verifies the v2 spec against a running dev server. Edits happen only if a bug surfaces.

- [ ] **Step 1: Start the dev server**

```bash
rtk npm run dev
```

Open `http://localhost:3000/diff`.

- [ ] **Step 2: Walk through every v2 acceptance criterion**

Tick each as you confirm. If a step fails, open a focused fix commit and rerun the relevant subset.

| #   | Criterion                                                                         | How to verify                                                                                                                                                           |
| --- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 26  | ≥ 8-row unchanged span between changes folds by default                           | Two texts differing on lines 5 and 25 (20 unchanged in between) → one `… 14 unchanged lines …` placeholder                                                              |
| 27  | Each change region keeps exactly 3 unchanged lines above and below                | Same input as 26: confirm 3 context lines visible just above the lower change and 3 just below the upper change                                                         |
| 28  | Click placeholder → reveals hidden lines, placeholder turns to Collapse           | Click the placeholder; rows expand; same row at the top of the expanded region now reads `Collapse`                                                                     |
| 29  | Collapse closes; folds never persist across reloads or re-runs                    | Click Collapse → reverts. Toggle "Ignore whitespace" to trigger a re-run → all folds reset to folded. Reload page → still folded                                        |
| 30  | Folding identical in side-by-side and inline                                      | Switch view modes; placeholder + expand/collapse behave the same                                                                                                        |
| 31  | `hasChanges === false` shows "No differences found", no placeholders              | Paste identical text on both sides → `No differences found`, no fold UI                                                                                                 |
| 32  | Worker protocol unchanged from v1                                                 | DevTools → Sources → workers → `diff.worker.*` still loaded; no new message types in the network/worker panel                                                           |
| 33  | Both inputs show gutter when ≤ 5000 lines AND < 512KB                             | Type a few lines; numbered gutter appears on both sides                                                                                                                 |
| 34  | Gutter scrolls in lock-step with the textarea                                     | Paste 100 lines; scroll the textarea; gutter scrolls together with no visible drift                                                                                     |
| 35  | `wrap="off"` while gutter visible; long lines scroll horizontally; gutter doesn't | Paste a 1000-char single line; horizontal scrollbar appears inside the textarea; gutter remains stationary horizontally                                                 |
| 36  | Above 5000 lines OR ≥ 512KB → gutter hidden, soft-wrap restored                   | Paste a 6000-line text; gutter disappears; long lines now wrap                                                                                                          |
| 37  | Empty input shows only line `1`                                                   | Clear an input; gutter shows `1`                                                                                                                                        |
| 38  | Drag-and-drop file upload still works                                             | Drag a small `.txt` onto each textarea; content fills in                                                                                                                |
| 39  | `fold.*` translations exist in en, zh-CN, zh-TW                                   | Switch to `/zh-CN/diff` and `/zh-TW/diff`; placeholder text and aria-labels render in the locale                                                                        |
| 40  | No new runtime deps                                                               | `rtk git diff main -- package.json` shows no `dependencies` changes since v1                                                                                            |
| 41  | DOM node count stays bounded for a 10k-row diff                                   | Paste two 6000-line texts that differ on a few lines; DevTools → Elements; expand the scroll container; node count under the virtualizer stays small (a few dozen rows) |

- [ ] **Step 3: Re-verify v1 acceptance criteria that touch refactored code**

Quick spot-checks to make sure the v2 refactor didn't regress v1 behavior.

| v1 # | Criterion                                  | How to verify                                                                            |
| ---- | ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| 8    | Side-by-side two columns + line numbers    | Default view; each row has both gutters; column divider visible                          |
| 9    | Word-level highlight within paired lines   | Type `foo bar` vs `foo qux`; `bar`/`qux` keep deeper-color emphasis                      |
| 10   | View toggle hidden < 768px → forced inline | Resize below 768px; toggle gone, inline layout active                                    |
| 14   | Per-input clear and Clear all              | Both still work                                                                          |
| 15   | Copy diff copies unified patch             | Click Copy diff with diff present → unified-diff text on clipboard                       |
| 18   | > 2000 rows virtualizes (now over Block[]) | Paste two ~3000-line texts; DevTools shows bounded DOM nodes inside the scroll container |

- [ ] **Step 4: Switch locales and re-sweep fold UI**

Navigate to `/zh-CN/diff` and `/zh-TW/diff`. Confirm `fold.hiddenLines`, `fold.expand`, `fold.collapse` and the aria-labels render in the active locale.

- [ ] **Step 5: Final lint + build**

```bash
rtk npx tsc --noEmit
rtk npx next build
```

Expected: both succeed.

- [ ] **Step 6: Final commit (only if any files changed during the sweep)**

```bash
rtk git status
```

If clean, no commit needed. Otherwise add the touched files and commit with a focused `fix(diff): …` message per issue.

---

## Acceptance criteria → task index

| AC  | Task(s)              |
| --- | -------------------- |
| 26  | 1, 5, 6, 7, 8, 9     |
| 27  | 1, 9                 |
| 28  | 6, 7, 8, 9           |
| 29  | 5, 9                 |
| 30  | 7, 8, 9              |
| 31  | 5, 9                 |
| 32  | (no-op verification) |
| 33  | 3, 4, 9              |
| 34  | 3, 9                 |
| 35  | 3, 9                 |
| 36  | 3, 4, 9              |
| 37  | 3, 9                 |
| 38  | 4, 9                 |
| 39  | 2, 9                 |
| 40  | (no-op verification) |
| 41  | 1, 7, 8, 9           |

---

## Known trade-offs and follow-up candidates

- **Per-block expand-up / expand-down arrows** (GitHub `+10/-10`) are not implemented. One-click full-expand / full-collapse only. `// TODO(claude): revisit if users ask for partial expansion`.
- **Folds reset on every diff re-compute and on view-mode switch.** Persisting per-block state across runs would require keying by content hash; out of scope. Behavior matches GitHub.
- **Side-by-side row layout changed from "outer grid + two stacked columns" (v1) to "per-row grid"** (v2). Visually identical; required so a fold placeholder can occupy a single row spanning both columns. If a future feature demands per-column virtualization, this will need to change again.
- **Line-number gutter is plain `<div>`s, not virtualized.** At the 5000-line cap this is ~5000 stable nodes per gutter; measured fine. If we ever raise the cap, switch the gutter to `react-virtual` too (cheap because line numbers are uniform-height).
- **`wrap="off"` is opinionated.** Some users may prefer soft-wrap with line-wrap-aware numbering (CodeMirror-style). Not done — would require a real editor framework, which the v1 spec explicitly rules out.
