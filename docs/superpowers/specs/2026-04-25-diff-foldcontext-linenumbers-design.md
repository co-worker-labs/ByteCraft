# Diff Tool v2 — Context Folding & Input Line Numbers (Incremental Design Spec)

## Overview

Incremental enhancement on top of [v1 diff tool design](./2026-04-25-diff-design.md). Adds two pure UX features:

1. **Context folding** — collapse long unchanged spans in the diff viewer (GitHub-standard).
2. **Input line numbers** — show line-number gutters next to both `Original` and `Modified` textareas.

Both features are render-layer concerns; the Web Worker protocol, jsdiff invocation, normalization, binary-sniff, JSON formatter/tokenizer, persistence schema, and translation namespaces from v1 are **unchanged**.

This spec is meant to be implemented as a **separate plan** (`2026-04-25-diff-tool-v2-*.md`) executed after v1's plan reaches a green build.

## Project Context

- **Repo / stack**: same as v1 — Next.js 16 + React 19 + TypeScript + Tailwind 4 + next-intl, all in-browser.
- **Pre-condition**: v1's 24-task plan must be merged. v2 modifies/adds files **on top of** the v1 file structure.
- **Sibling alignment**: same as v1 — no theme switch in the tool, no new heavyweight deps, project-internal `components/ui/*` only.

## Goals

1. **Folding**: Match GitHub PR conventions so users can scan diffs of large files without scrolling past hundreds of unchanged lines. Default to folded; one-click expand/collapse.
2. **Line numbers**: Make the two inputs feel like proper code editors — line numbers always visible, aligned with the text, syncing on scroll. Useful for "patch line 142" style discussions before a diff is even computed.
3. **Stay within v1's weight budget**: no new runtime dependencies. Both features implemented with plain React + Tailwind.

## Non-Goals (explicit)

- Per-block expand-up / expand-down (GitHub's `+10/-10` arrows). One-click full expand only.
- Persisting the per-block expanded/folded state across reloads. Each diff session starts folded.
- Click-to-jump from input line numbers to anywhere. Numbers are display-only.
- Sticky / fixed line-number gutter that stays visible during page scroll. Gutter scrolls with the textarea.
- Code editor replacement (CodeMirror, Monaco). The `<textarea>` stays.
- Syntax highlighting in inputs (still out of scope).
- Showing line numbers when input exceeds 5000 lines OR ≥ 512KB (gutter is auto-hidden — see Functional Requirements).
- Folding within `kind: "result"` when `hasChanges === false` (the "No differences found" state never reaches the folder).

## Functional Requirements

### Feature A — Context Folding

| Item                        | Behavior                                                                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| When folding kicks in       | Diff has `hasChanges === true` AND at least one run of `≥ 8` consecutive `kind: "context"` rows                                                             |
| Default state               | All eligible runs collapsed                                                                                                                                 |
| Context window              | 3 unchanged rows kept visible **before** and **after** every change region (head and tail of the file are also trimmed to 3)                                |
| Placeholder row             | A single non-virtualized-equivalent row showing `… N unchanged lines …` (translated) with an `Expand` button                                                |
| Expand interaction          | Click the placeholder (whole row clickable) → injects all hidden rows back; placeholder swaps to `Collapse` button at the **top** of the now-expanded block |
| Collapse interaction        | Click `Collapse` → restore the placeholder; scroll position attempts to keep the topmost previously-visible changed line in view                            |
| Persistence                 | None. Reloading the page or re-running the diff resets all blocks to folded                                                                                 |
| Applies to                  | Both `side-by-side` and `inline` views                                                                                                                      |
| Worker protocol             | **Unchanged** — worker still returns full `DiffRowData[]`. Folding happens in `libs/diff/fold-context.ts` on the main thread                                |
| Virtualization              | Triggered against the **post-fold** block list. Threshold (`VIRTUALIZATION_THRESHOLD = 2000`) compares against `blocks.length`, not raw rows                |
| Empty / equal / idle states | Pass through unchanged. Folding is skipped entirely when `hasChanges === false`                                                                             |

### Feature B — Input Line Numbers

| Item                | Behavior                                                                                                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Where shown         | Both `Original` and `Modified` `DiffInput` blocks                                                                                                                                  |
| Counted by          | `value.split("\n").length` — counts logical newlines, ignores soft-wrap                                                                                                            |
| Wrap behavior       | Textarea uses `wrap="off"` so soft-wrap never visually breaks the alignment; long lines scroll horizontally                                                                        |
| Font / line-height  | Strictly `font-mono text-sm leading-5` (20px line-height); gutter inherits the same rules so each number aligns to its row                                                         |
| Scroll sync         | `onScroll` on the textarea writes `scrollTop` back to the gutter's `<div>`                                                                                                         |
| Resize              | Vertical resize on textarea must keep the gutter the same height (CSS-only via wrapper flex)                                                                                       |
| Auto-hide threshold | When `value.split("\n").length > 5000` OR `value.length ≥ 512 * 1024` bytes, the gutter is hidden and the textarea reverts to `wrap="soft"` (default). Toast hint **not** required |
| Empty input         | Show line `1` only (matches every editor)                                                                                                                                          |
| Drag/drop overlay   | Unaffected; drag-to-upload still works because the gutter sits outside the drop zone                                                                                               |

### Edge Cases

| Case                                                                            | Behavior                                                                                                                                                                 |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Diff has no `≥ 8`-run unchanged spans                                           | No fold placeholders rendered; output identical to v1                                                                                                                    |
| Single fold spans the entire file (no changes at all)                           | Cannot happen — folding is gated by `hasChanges === true`                                                                                                                |
| User expands every block, then re-runs diff (e.g., toggles "Ignore whitespace") | All blocks reset to folded — no carry-over                                                                                                                               |
| 50k-line input pasted                                                           | Line numbers hidden (over 5000-line threshold); auto-compute also disabled (≥ 512KB threshold from v1); user clicks `Compare` and the diff itself still renders normally |
| Mixed indentation in long line + `wrap="off"`                                   | Horizontal scroll inside the textarea; gutter does not scroll horizontally (it has no overflow on x-axis)                                                                |
| Browser zoom changes line-height                                                | Both gutter and textarea inherit the same `leading-5` class; alignment holds. No JS work needed                                                                          |
| Folded state while switching between side-by-side and inline                    | Re-fold from scratch on view switch (cheap; same input)                                                                                                                  |

## Architecture

### File Changes

```
# New
libs/diff/
└── fold-context.ts              # Pure: rows[] → blocks[]; default folding rules
                                 # Exports CONTEXT_LINES = 3, FOLD_THRESHOLD = 8

components/ui/
└── line-numbered-textarea.tsx   # Wraps StyledTextarea with a gutter; same props + new {showLineNumbers, maxLines}

# Modified (v1 files)
app/[locale]/diff/components/
├── DiffInput.tsx                # Swap StyledTextarea → LineNumberedTextarea
├── DiffSideBySide.tsx           # Consume Block[] (not Rows[]); render fold placeholder rows
├── DiffInline.tsx               # Same as above
└── DiffViewer.tsx               # Run fold-context.ts before passing to side/inline; manage per-block expanded state

# Translations
public/locales/{en,zh-CN,zh-TW}/diff.json   # Add fold.expand / fold.collapse / fold.hiddenLines keys
```

No changes to: `libs/diff/diff.worker.ts`, `libs/diff/compute.ts`, `libs/diff/types.ts` (worker contract preserved), `libs/diff/normalize.ts`, `libs/diff/binary-sniff.ts`, `libs/diff/json-format.ts`, `libs/diff/json-tokenizer.ts`, `libs/storage-keys.ts`, `i18n/request.ts`, `app/[locale]/diff/diff-page.tsx`, `app/[locale]/diff/page.tsx`, `app/[locale]/diff/components/DiffRow.tsx`, `app/[locale]/diff/components/DiffToolbar.tsx`, `libs/tools.ts`, `app/[locale]/home-page.tsx`.

### Data Flow Change

```
worker → DiffRowData[]  (unchanged)
            │
            ▼
  fold-context.ts: rows → Block[]
            │
            ▼
  DiffViewer holds {expandedSet: Set<number>}
            │
            ├──> DiffSideBySide: render Block[] with paired columns
            └──> DiffInline:     render Block[] sequentially
```

### `fold-context.ts` Contract

```ts
import type { DiffRowData } from "./types";

export const CONTEXT_LINES = 3;
export const FOLD_THRESHOLD = 8;

export type Block =
  | { kind: "row"; row: DiffRowData }
  | { kind: "fold"; id: number; hidden: DiffRowData[] };

export function foldContext(rows: DiffRowData[], hasChanges: boolean): Block[];
```

- If `!hasChanges` → return `rows.map(row => ({ kind: "row", row }))` unchanged.
- Otherwise: walk `rows`, detect runs of `kind: "context"` of length `≥ 8`, keep `CONTEXT_LINES` at the head/tail of each run (or only at one end for file-edge runs), wrap the middle in a single `kind: "fold"` block.
- `id` is a stable monotonic int per call — used as React key and as the `expandedSet` membership token.

### `DiffViewer` State Additions

- `blocks: Block[]` — recomputed when `rows` or `viewMode` changes (cheap; pure function).
- `expandedSet: Set<number>` — IDs of folds currently expanded. Reset when `rows` changes.
- Pass `{ blocks, expandedSet, onToggle }` down to `DiffSideBySide` / `DiffInline`.

### Side-by-Side Pairing With Folds

Folding only ever wraps `kind: "context"` rows; consecutive `del`/`add` runs are **never** split by a fold. The v1 `pairRows` walk therefore applies unchanged to any contiguous sequence of `kind: "row"` blocks. Folded blocks render as a single full-width placeholder row that spans both columns (no per-column rendering); they interrupt the walk only by ending an unchanged span (which had no del/add to pair anyway). When the user expands a fold, its hidden rows are spliced back into the `Block[]` stream and pairing re-runs over the now-larger sequence — same algorithm, same outputs.

### `LineNumberedTextarea` Component

```tsx
type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode;
  /** When true, line-number gutter renders. Caller decides based on input size. */
  showLineNumbers: boolean;
  /** When line count exceeds this, parent should pass showLineNumbers={false}. */
  maxLines?: number; // default 5000
};
```

- Internally: a flex row → `<div>` gutter (auto-grow vertical, fixed `w-12 text-end pr-2 select-none text-fg-muted`) + `<textarea>` (the existing `StyledTextarea` styling stripped to a raw `<textarea>` since the wrapper now provides the border container).
- Gutter renders `1..N` divs inside a scroll-tracking inner `<div>`; `onScroll` of textarea sets `gutterRef.current.scrollTop = e.currentTarget.scrollTop`.
- When `showLineNumbers === false`, the component returns the v1 `StyledTextarea` shape verbatim (no gutter, no `wrap="off"`).

The decision to show or hide is made by `DiffInput` based on its own `value`:

```ts
const lineCount = value.split("\n").length;
const showLineNumbers = lineCount <= 5000 && value.length < 512 * 1024;
```

## UI / UX

### Fold Placeholder

- Renders as one row at `font-mono text-xs leading-5`, height matches a normal `DiffRow` (20px) — keeps virtualization estimateSize stable.
- Background: `bg-bg-elevated`, border-y `border-border-default`, full width spanning both side-by-side columns.
- Content (centered): `… {N} unchanged lines …` followed by a small `Expand` chip (uses `Button variant="outline" size="sm"`).
- Expanded state: same row appears at the top of the now-revealed range with the chip changed to `Collapse`.
- Hover: subtle background brightening (`hover:bg-bg-surface`) to signal clickability across the whole row.
- ARIA: `role="button"` on the placeholder row; `aria-expanded` reflects state; `aria-label` reads the translated "Show N hidden lines" / "Hide N lines".

### Line-Number Gutter

- Width `w-12` (48px) — fits up to 99,999 (we cap at 5000 anyway).
- Right-aligned mono digits, `text-fg-muted text-xs leading-5`.
- Background `bg-bg-input` (matches textarea), with a `border-r border-border-default` to visually separate.
- No interactivity (no hover, no click, no cursor change). Pure indicator.

### `wrap="off"` Consequence

When line numbers are visible, the textarea is `wrap="off"` and overflows horizontally. The wrapping container shows a horizontal scrollbar; the gutter does **not** scroll horizontally (it stays anchored). This matches every code editor and is the correct trade-off for a tool whose primary input is code.

### Mobile (`< 768px`)

- Gutter still shown if input qualifies (`< 5000` lines AND `< 512KB`). Width unchanged.
- The `wrap="off"` horizontal-scroll behavior may feel cramped on narrow screens, but is acceptable for the same reason editors do it.
- Folding behavior identical to desktop — placeholders still clickable.

### Accessibility

- Fold placeholders are full keyboard-reachable buttons with focus indicators.
- Line-number gutter has `aria-hidden="true"` (decorative; the textarea's own line context is what AT users navigate by).
- Color contrast for fold-placeholder background and text passes WCAG AA, same as v1's add/del row tokens.

## Translations

Add to `public/locales/{en,zh-CN,zh-TW}/diff.json` (flat keys under existing namespace):

```jsonc
{
  // ... v1 keys unchanged ...
  "fold": {
    "hiddenLines": "{count} unchanged lines",
    "expand": "Expand",
    "collapse": "Collapse",
    "ariaExpand": "Show {count} hidden lines",
    "ariaCollapse": "Hide {count} lines",
  },
}
```

Chinese translations to be authored at implementation time. English shown as canonical source.

No changes to `tools.json` (the tool's title/shortTitle/description still cover both v1 and v2 functionality).

## Dependencies

**No new dependencies.** The fold logic is a ~60-line pure function; the line-numbered textarea is plain React + Tailwind.

## Acceptance Criteria

(numbered to continue from v1's 25)

26. With a diff containing a run of `≥ 8` unchanged lines between changes, those lines fold by default into a single placeholder row showing the count.
27. Each change region keeps exactly 3 unchanged lines visible above and below it (or fewer if the file edge is closer than 3 lines).
28. Clicking a fold placeholder reveals the hidden lines; the placeholder turns into a `Collapse` control at the top of the revealed block.
29. Clicking `Collapse` re-folds the block; folds **never persist** across diff re-runs or page reloads.
30. Folding works identically in side-by-side and inline views.
31. Diffs with `hasChanges === false` (identical input) still show "No differences found" (no fold placeholders).
32. The Web Worker protocol (`DiffRequest`/`DiffResponse`) is unchanged from v1.
33. Both inputs show a line-number gutter on the left when input is `≤ 5000` lines AND `< 512KB`.
34. The gutter scrolls in lock-step with its textarea — no visible misalignment during fast scrolling.
35. Each input uses `wrap="off"` while line numbers are shown; long lines scroll horizontally inside the textarea (the gutter does not scroll horizontally).
36. When input exceeds the 5000-line OR 512KB threshold, the gutter is hidden and the textarea reverts to default soft-wrap behavior (matching v1).
37. With both inputs empty, both gutters show only `1` and the textarea is empty (matches every editor).
38. Drag-and-drop file upload still works — the drop zone is the textarea, not the gutter.
39. Translations for `fold.*` keys exist and pass type checking in `en`, `zh-CN`, `zh-TW`.
40. No new runtime dependencies are added (`package.json` `dependencies` unchanged from v1).
41. The DOM-node count for a 10,000-row diff stays bounded (virtualization runs against the post-fold block list).

## Implementation Notes

- `foldContext` is a pure synchronous walk — no useMemo needed (React Compiler will memoize). Recompute it directly inside `DiffViewer`'s render body when `rows` changes.
- `expandedSet` lives in `DiffViewer` local state. Reset via `useEffect(..., [rows])` to wipe expanded IDs whenever a new diff arrives.
- Fold placeholder height (20px) **must** match a normal row to keep `useVirtualizer.estimateSize: () => 20` accurate. If the placeholder gets taller (e.g., wrapping on small viewports), pass a real `getItemSize` to the virtualizer.
- Gutter scroll-sync: write through a `ref`, not via React state, to avoid one render per scroll event. A single `gutterRef.current.scrollTop = e.currentTarget.scrollTop` in the textarea's `onScroll` handler is enough.
- Do **not** memoize the line-number array (`[1..N].map(...)`); React Compiler handles it. For inputs at the cap (5000 lines), this is 5000 stable `<div>` nodes per gutter — measured at < 5ms paint.
- The `LineNumberedTextarea` component should `forwardRef<HTMLTextAreaElement>` so external file-drop handlers and focus management still work.
- Plan step 1 of v2: write a unit-style sanity check inline (see v1 Task 10 pattern) that exercises `foldContext` with: (a) no changes, (b) one short context run (< 8 lines, no fold), (c) one long context run (≥ 8, exactly one fold), (d) edge run at start, (e) edge run at end. Do this in a Node REPL one-liner; project still has no test runner.
