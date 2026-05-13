# Batch Processor Design Spec

## Overview

Batch Processor applies a single operation to multiple inputs simultaneously. It is orthogonal to Recipe: Recipe is multi-step single-input, Batch is single-step multi-input.

- **Route**: `/batch`
- **Category**: `workflows`
- **MVP scope**: Independent page, architecture reserves Recipe combination possibility for future

## Dependencies

| Package  | Purpose                                | Why                                                      |
| -------- | -------------------------------------- | -------------------------------------------------------- |
| `fflate` | ZIP packaging for multi-file downloads | Pure WASM, zero deps, tree-shakeable, lighter than JSZip |

Add to `package.json` dependencies before implementation.

## Data Model

### Core Types (`libs/batch/types.ts`)

```typescript
type BatchInputItem = {
  id: string;
  name: string; // text preview or filename
  content: string; // text content or data URI
  type: "text" | "image";
  size: number; // raw byte size
};

type BatchResultItem = {
  id: string; // maps to BatchInputItem.id
  status: "success" | "error";
  output?: string; // processing result
  error?: string; // error message
  duration: number; // ms
};

type BatchConfig = {
  stepId: string; // reuses Recipe step id
  stepParams: Record<string, string>; // matches RecipeStepDef.execute() signature
  outputTemplate?: string; // e.g. "{name}_hashed"
};

// Page component state aggregate (not persisted)
type BatchJob = {
  id: string;
  config: BatchConfig;
  inputs: BatchInputItem[];
  results: BatchResultItem[];
  status: "idle" | "running" | "done" | "partial-error";
  createdAt: number;
};
```

### Data Flow

```
User selects Step → provides input list → executeBatch(config, inputs, onProgress, abortSignal) → results list
```

## Engine (`libs/batch/engine.ts`)

Executes step on each input item on the **main thread** (same as Recipe). No Web Worker in MVP — many Recipe steps use DOM APIs (`createImageBitmap`, `document.createElement`, `FileReader`, `Image`) that are unavailable in Worker context. Worker support for pure-compute steps (hashing, encoding) is deferred to Future Extensibility.

```typescript
const MAX_BATCH_ITEMS = 1000;

type AbortSignal = { cancelled: boolean };

async function executeBatch(
  config: BatchConfig,
  inputs: BatchInputItem[],
  onProgress?: (completed: number, total: number) => void,
  abortSignal?: AbortSignal
): Promise<BatchResultItem[]>;
```

**Key behaviors:**

- Resolves step definition from Recipe registry via `stepId`
- **Max items**: Throws `Error` if `inputs.length > MAX_BATCH_ITEMS`. UI layer prevents adding beyond limit; engine throw is a safety net
- Executes sequentially on main thread; reports progress after each item via `onProgress`
- **Cancellation**: Checks `abortSignal.cancelled` before each item; if `true`, stops and returns partial results collected so far. Page component passes a `{ cancelled: boolean }` object via useEffect cleanup (see State Management below)
- **Debounce**: Page component debounces execution (300ms) on input/param changes to avoid thrashing
- Individual errors do not halt remaining items; failed items get `status: "error"`
- Progress callback for UI updates

## Step Compatibility

Batch reuses Recipe's existing `RecipeStepDef` definitions. Steps are resolved from `libs/recipe/registry.ts` via `getStep(config.stepId)`.

### Batch Extension on RecipeStepDef

One modification to `libs/recipe/types.ts` — add optional `batch` field:

```typescript
interface RecipeStepDef {
  // ... existing fields unchanged
  batch?: {
    supported?: boolean; // default true
    maxInputs?: number; // no limit if unset
    outputFilenameTemplate?: string; // e.g. "{name}_compressed"
    mimeType?: string; // output MIME type for downloads
  };
}
```

Backward compatible: all existing Step definitions omit `batch`, defaulting to `supported: true`.

### Step Behavior by Type

| Input type    | Batch behavior                                                         | Example                  |
| ------------- | ---------------------------------------------------------------------- | ------------------------ |
| `text→text`   | Text list, one input per line/paragraph                                | Base64 encode 50 strings |
| `none→text`   | Generator class, not shown in Batch picker (use `count` param instead) | UUID batch gen           |
| `text→image`  | Text list generates multiple images                                    | Batch QR Code generation |
| `image→image` | File drop, one input per file                                          | Compress 100 images      |

### Step Picker Filtering

- Show all steps where `batch.supported !== false`
- Filter by `inputType` matching current batch input type (text/image)
- Hide `none→text` generator steps (they have `count` param built-in)

### DOM API Constraint

Steps with `inputType: "image"` or `outputType: "image"` use browser DOM APIs that preclude Web Worker execution:

- `image-compress`: `createImageBitmap()`, `document.createElement("canvas")` — `visual.ts:10-18,131`
- `qrcode-gen`: `document.createElement("div")`, `FileReader` — `generator.ts:114,131-136`

Future Worker support requires refactoring these steps to use OffscreenCanvas or providing Worker-compatible alternative implementations.

## Input Interaction

### Adding Inputs

Two modes:

1. **Paste text**: Multi-line textarea, each line = one input item. Auto-parses to `BatchInputItem[]`
2. **Drop files**: Multi-file drag-and-drop (`multiple` attribute). Each file becomes one `BatchInputItem`

### Multi-File Drop

Existing `useDropZone` hook (`hooks/useDropZone.ts`) only handles single file (`ev.dataTransfer.files?.[0]`). Batch needs a new `useMultiFileDropZone` hook that:

- Accepts `onFiles: (files: File[]) => void` callback
- Iterates `ev.dataTransfer.files` (all items, not just `[0]`)
- Shares the same drag counter pattern for `isDragging` state

### Input List UI

```
Left panel:
┌──────────────────────────┐
│ INPUTS (4 items)         │  ← title + count
│ [+ Paste] [Drop Files]   │  ← add methods
├──────────────────────────┤
│ ☐ hello world     46B  × │  ← checkable, deletable
│ ☐ test input 2    32B  × │
│ ☐ another one     28B  × │
│ ☐ long text...   1.2KB × │
├──────────────────────────┤
│ ▼ Paste multiple lines   │  ← collapsible paste area
│ ┌────────────────────┐   │
│ │                    │   │
│ └────────────────────┘   │
└──────────────────────────┘
```

- Each item individually deletable
- Select/deselect all (for subset batch operations)
- Collapsible paste area to save space when not in use

### Auto-execution with Debounce

Execution triggers automatically on input or parameter changes (like Recipe's real-time computation). No manual "Run" button needed. To prevent thrashing with large input lists:

- **Debounce**: 300ms delay before triggering execution
- **Stale result cancellation**: `signal` object pattern — each useEffect creates a fresh `{ cancelled: false }` signal, passed to engine. Cleanup sets `signal.cancelled = true`, engine checks before each item. `cancelled` flag in useEffect prevents stale results from being written to state. (See State Management below for full code)

## Page Layout

**Two-column layout (Option B)**, consistent with Recipe's 5:7 ratio.

```
┌──────────────────────────────────────────────────┐
│  Step Selector: [SHA-256 Hash ▼]  [Params]       │
├─────────────────────┬────────────────────────────┤
│  INPUTS (4 items)   │  RESULTS (4/4)             │
│  [+ Paste][Drop]    │  [ZIP] [Copy All]          │
│  ┌───────────────┐  │  ┌──────────────────────┐  │
│  │ item 1   46B ×│  │  │ item 1 → b94d27... 📋│  │
│  │ item 2   32B ×│  │  │ item 2 → d7a5f0... 📋│  │
│  │ item 3   28B ×│  │  │ item 3 → 3af7a6... 📋│  │
│  │ item 4  1.2KB ×│  │  │ item 4 → e8f2d1... 📋│  │
│  └───────────────┘  │  └──────────────────────┘  │
├─────────────────────┴────────────────────────────┤
│  Total: 4/4 success · 0.3s                       │
├──────────────────────────────────────────────────┤
│  DescriptionSection (What Is / Use Cases / FAQ)  │
└──────────────────────────────────────────────────┘
```

- **Responsive**: Mobile falls back to single-column stacked layout
- **Right panel**: `lg:sticky lg:top-16` for scroll persistence

## Output Handling

| Action            | Text results (`text→text`)              | Image results (`text→image`, `image→image`) |
| ----------------- | --------------------------------------- | ------------------------------------------- |
| Per-item display  | Text truncation preview (max 500 chars) | Thumbnail preview (`max-h-16 rounded`)      |
| Per-item copy     | Copy text to clipboard                  | Download single file                        |
| Copy All          | Join all text (newline-separated), copy | —                                           |
| Download All      | Export as `.txt` file                   | Pack as ZIP download via `fflate`           |
| Filename template | —                                       | `{name}_hashed.txt`, user-customizable      |

### ResultItem Display Modes

Based on step's `outputType`:

- **`text` output**: Monospace text preview, truncated at 500 chars, with CopyButton
- **`image` output**: Thumbnail preview (`<img src={dataURI} />`), with download button
- **Error**: Red badge with error message. Uses `t.has()` fallback pattern from Recipe (`step-card.tsx:345-347`): check i18n key first, fall back to raw error string

## Progress & Status

- Running: progress bar + `12/50 processed`
- Individual failures: red `error` badge, non-blocking
- Summary bar: `47/50 success · 3 errors · 2.1s`
- Summary `totalSaved` (size comparison): only shown for `image→image` steps where size reduction is meaningful. Hidden for `text→text` steps.

## File Structure

### New Files

```
libs/batch/
├── types.ts              # BatchInputItem, BatchResultItem, BatchConfig, BatchJob
├── engine.ts             # executeBatch(), MAX_BATCH_ITEMS, abort signal, progress callback
├── input-parser.ts       # text/file parsing into BatchInputItem[]
├── output.ts             # merge output, ZIP packaging via fflate, filename templates
└── __tests__/
    ├── engine.test.ts
    ├── input-parser.test.ts
    └── output.test.ts

hooks/
└── use-multi-file-drop.ts  # Multi-file drag-and-drop (existing useDropZone only handles single file)

components/batch/
├── step-selector.tsx     # Step picker with Batch filtering (reuses Recipe's picker UI pattern)
├── step-params.tsx       # Step parameter renderer (extracted from recipe/step-card.tsx param logic)
├── input-panel.tsx       # Left: input list + paste/drop
├── result-panel.tsx      # Right: result list + bulk actions
├── result-item.tsx       # Single result row (text preview / image thumbnail / error state)
├── batch-summary.tsx     # Bottom summary bar
└── progress-bar.tsx      # Execution progress indicator

app/[locale]/batch/
├── page.tsx              # Route entry (SEO, metadata, JSON-LD)
└── batch-page.tsx        # "use client" page component

public/locales/{en,zh-CN,...}/batch.json   # 10 locale files
```

### `step-params.tsx` Extraction

The parameter rendering logic in `components/recipe/step-card.tsx:147-311` (select, slider, checkbox, text input with `dependsOn` conditional display) should be extracted into a shared `step-params.tsx` component. Both Recipe's `step-card.tsx` and Batch's `step-selector.tsx` can then use it.

Interface:

```typescript
interface StepParamsProps {
  params: StepParam[];
  values: Record<string, string>;
  onChange: (params: Record<string, string>) => void;
  translationNamespace: string; // "recipe" or "batch"
}
```

### Modified Files

| File                                | Change                                                   |
| ----------------------------------- | -------------------------------------------------------- |
| `libs/recipe/types.ts`              | Add optional `batch` field to `RecipeStepDef`            |
| `libs/tools.ts` → `TOOLS`           | Add `batch` ToolEntry (see Tool Registration below)      |
| `libs/tools.ts` → `TOOL_CATEGORIES` | Add `"batch"` to `workflows` tools array                 |
| `libs/tools.ts` → `TOOL_RELATIONS`  | Add `batch` relation entry (see Tool Registration below) |
| `public/locales/*/tools.json`       | Add `batch` entry (10 files)                             |
| `vitest.config.ts`                  | Add `batch` to test scopes                               |

### Reused Modules (read-only)

| Module                               | Usage                                           |
| ------------------------------------ | ----------------------------------------------- |
| `libs/recipe/registry.ts`            | `getStep(stepId)` to resolve step definitions   |
| `libs/recipe/types.ts`               | `RecipeStepDef.execute()` function              |
| `components/ui/*`                    | Button, Input, Textarea, CopyButton, Card, etc. |
| `components/description-section.tsx` | SEO description block                           |
| `components/privacy-banner.tsx`      | Privacy notice                                  |

Note: `app/sitemap.ts` auto-generates from `TOOLS` array, so adding batch to `TOOLS` automatically includes it in the sitemap.

## Tool Registration

### ToolEntry (`libs/tools.ts` → `TOOLS`)

```typescript
{
  key: "batch",
  path: "/batch",
  icon: Layers,      // from lucide-react — represents stacking/batching
  emoji: "📦",
  sameAs: ["https://en.wikipedia.org/wiki/Batch_processing"],
}
```

Requires adding `Layers` to lucide-react imports in `libs/tools.ts`.

### TOOL_CATEGORIES

```typescript
{ key: "workflows", tools: ["recipe", "batch"] },
```

### TOOL_RELATIONS

```typescript
batch: ["recipe", "hashing", "base64", "image"],
```

## Page Component Structure

### `app/[locale]/batch/page.tsx`

Follows Recipe's `page.tsx` pattern:

- `generateMetadata()` — SEO metadata via `generatePageMeta()`
- `buildToolSchemas()` — JSON-LD (WebApplication + BreadcrumbList)
- Renders `<BatchPage />`
- Must include `import "../../../libs/recipe/steps/index"` side-effect to register steps (same as Recipe)

### `app/[locale]/batch/batch-page.tsx`

```tsx
<Layout title={t("batch.shortTitle")} categoryLabel={...} categorySlug="workflows">
  <div className="min-h-[calc(100vh-4rem)]">
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <PrivacyBanner />
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5 space-y-5">
          <StepSelector />
          <InputPanel />
        </div>
        <div className="lg:col-span-7 lg:sticky lg:top-16 lg:self-start mt-5 lg:mt-0">
          <ResultPanel />
          <BatchSummary />
        </div>
      </div>
      <DescriptionSection namespace="batch" />
    </div>
  </div>
</Layout>
```

### State Management & Execution Flow

```tsx
const [inputs, setInputs] = useState<BatchInputItem[]>([]);
const [results, setResults] = useState<BatchResultItem[]>([]);
const [config, setConfig] = useState<BatchConfig | null>(null);
const [status, setStatus] = useState<"idle" | "running" | "done" | "partial-error">("idle");

// Debounced execution (300ms) triggered by inputs/config changes
useEffect(() => {
  const signal = { cancelled: false };
  let cancelled = false;

  async function run() {
    if (signal.cancelled) return;
    if (!config || inputs.length === 0) {
      setStatus("idle");
      setResults([]);
      return;
    }
    setStatus("running");
    const batchResults = await executeBatch(config, inputs, onProgress, signal);
    if (cancelled) return;
    setResults(batchResults);
    setStatus(batchResults.every((r) => r.status === "success") ? "done" : "partial-error");
  }

  const timer = setTimeout(run, 300);
  return () => {
    clearTimeout(timer);
    cancelled = true;
    signal.cancelled = true;
  };
}, [inputs, config]);
```

## i18n

### `batch.json` Structure

```json
{
  "stepSelector": {
    "title": "Processing Step",
    "changeStep": "Change Step",
    "params": "Parameters",
    "placeholder": "Select a step..."
  },
  "inputPanel": {
    "title": "Inputs",
    "itemCount": "{count} items",
    "pasteText": "Paste Text",
    "dropFiles": "Drop Files",
    "pastePlaceholder": "Paste multiple lines, one item per line...",
    "removeAll": "Remove All",
    "selectAll": "Select All",
    "maxItemsWarning": "Maximum {max} items allowed"
  },
  "resultPanel": {
    "title": "Results",
    "copyAll": "Copy All",
    "downloadAll": "Download All",
    "downloadZip": "Download ZIP",
    "copySuccess": "Copied {count} items",
    "noResults": "No results yet"
  },
  "summary": {
    "success": "{success}/{total} success",
    "errors": "{errors} errors",
    "duration": "{time}s",
    "totalSaved": "Total: {before} → {after} ({percent}%)"
  },
  "descriptions": {
    "aeoDefinition": "Batch Processor is a tool that applies a single processing operation to multiple inputs simultaneously, saving time when you need to transform, encode, hash, or convert many items at once.",
    "whatIs": "Batch Processor lets you apply one operation—like hashing, encoding, or compression—to dozens or hundreds of inputs in one go. Drop multiple files or paste multiple lines, pick a step, and get all results instantly.",
    "useCasesP1": "Batch hash hundreds of strings for database imports, compress entire image folders in one click, or encode multiple files to Base64 simultaneously.",
    "howToStep1": "Select a processing step from the picker",
    "howToStep2": "Add multiple inputs by pasting text or dropping files",
    "howToStep3": "View individual results and download or copy all at once",
    "faq1Q": "Is there a limit to how many items I can process?",
    "faq1A": "Batch Processor handles up to 1,000 items per batch. All processing happens in your browser—no data is sent to any server.",
    "faq2Q": "Can I use multiple processing steps?",
    "faq2A": "Batch applies a single step to all inputs. For multi-step processing, use the Recipe tool to build a pipeline, then use Batch with a Recipe step.",
    "faq3Q": "What happens if one item fails?",
    "faq3A": "Failed items are marked with an error badge and skipped. All other items continue processing normally."
  }
}
```

### `tools.json` Entry

```json
{
  "batch": {
    "shortTitle": "Batch Processor",
    "title": "Batch Processor - Bulk Operation Tool | OmniKit",
    "description": "Apply a single operation to multiple inputs at once. Batch encode, hash, compress, and convert files and text."
  }
}
```

searchTerms rules: English omits; CJK locales add romanization + domain keywords per existing convention.

### Error Message Handling

Recipe steps return error strings (e.g., `"keyRequired"`, `"noImageInput"`, `"patternRequired"`). Batch ResultItem displays these using the same `t.has()` fallback pattern as Recipe (`step-card.tsx:345-347`):

```tsx
const message = t.has(`errors.${error}`) ? t(`errors.${error}`) : error;
```

For MVP, Batch reuses Recipe's `errors.*` i18n keys. If Batch-specific errors are needed later, add them to `batch.json`.

## Testing

| Test file              | Coverage                                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `engine.test.ts`       | Single-step execution, error isolation (one failure doesn't stop others), progress callback, empty input handling, abort signal cancellation, MAX_BATCH_ITEMS enforcement |
| `input-parser.test.ts` | Single-line parsing, multi-line parsing, empty-line separation, file metadata extraction, edge cases (empty input, single item, 1000+ items)                              |
| `output.test.ts`       | Filename template replacement, text join/merge, ZIP generation via fflate                                                                                                 |

Registered in `vitest.config.ts` test scopes.

## Future Extensibility

- **Web Worker for pure-compute steps**: Add Worker execution path for `text→text` steps that don't use DOM APIs (hashing, encoding, text case). Steps declare a `batch.workerSafe?: boolean` flag. Engine selects Worker vs main thread per step.
- **Batch + Recipe combination**: Add a `recipe-pipeline` step type that wraps `PipelineEngine.execute()` in a Batch step. The `batch` extension field on `RecipeStepDef` already reserves this path.
- **Step-specific batch config**: Gradually add `batch` fields to individual Step definitions (e.g., `maxInputs: 200` for image compression).
- **Batch presets**: Save frequently-used Batch configs (step + params + template) like Recipe presets, persisted via a new `STORAGE_KEYS.batchConfig` entry.
