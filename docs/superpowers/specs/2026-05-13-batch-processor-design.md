# Batch Processor Design Spec

## Overview

Batch Processor applies a single operation to multiple inputs simultaneously. It is orthogonal to Recipe: Recipe is multi-step single-input, Batch is single-step multi-input.

- **Route**: `/batch`
- **Category**: `workflows`
- **MVP scope**: Independent page, architecture预留 Recipe 组合可能性

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
  stepParams: Record<string, unknown>;
  outputTemplate?: string; // e.g. "{name}_hashed"
};

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
User selects Step → provides input list → BatchEngine.map(step, inputs) → results list
```

## Engine (`libs/batch/engine.ts`)

Flat engine that directly calls `step.execute()` per input item. No pipeline orchestration.

```typescript
async function executeBatch(
  config: BatchConfig,
  inputs: BatchInputItem[],
  onProgress?: (completed: number, total: number) => void
): Promise<BatchResultItem[]>;
```

**Key behaviors:**

- Resolves step definition from Recipe registry via `stepId`
- All execution runs in a single Web Worker to avoid blocking the main thread. The worker processes items sequentially within itself but reports progress via `postMessage`. Concurrency is achieved by the worker's async I/O (file reading, compression), not parallel workers.
- Individual errors do not halt remaining items; failed items get `status: "error"`
- Progress callback for UI updates

## Step Compatibility

Batch reuses Recipe's existing `RecipeStepDef` definitions. Steps are resolved from `libs/recipe/registry.ts` via `getStepById(config.stepId)`.

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

## Input Interaction

### Adding Inputs

Two modes:

1. **Paste text**: Multi-line textarea, each line = one input item. Auto-parses to `BatchInputItem[]`
2. **Drop files**: Multi-file drag-and-drop (`multiple` attribute). Each file becomes one `BatchInputItem`

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

### Auto-execution

Execution triggers automatically on input or parameter changes (like Recipe's real-time computation). No manual "Run" button needed.

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

| Action            | Text results                            | File results                           |
| ----------------- | --------------------------------------- | -------------------------------------- |
| Per-item copy     | Copy text to clipboard                  | Download single file                   |
| Copy All          | Join all text (newline-separated), copy | —                                      |
| Download All      | Export as `.txt` file                   | Pack as ZIP download                   |
| Filename template | —                                       | `{name}_hashed.txt`, user-customizable |

## Progress & Status

- Running: progress bar + `12/50 processed`
- Individual failures: red `error` badge, non-blocking
- Summary bar: `47/50 success · 3 errors · 2.1s`

## File Structure

### New Files

```
libs/batch/
├── types.ts              # BatchInputItem, BatchResultItem, BatchConfig, BatchJob
├── engine.ts             # executeBatch(), concurrency control, progress callback
├── input-parser.ts       # text/file parsing into BatchInputItem[]
├── output.ts             # merge output, ZIP packaging, filename templates
└── __tests__/
    ├── engine.test.ts
    ├── input-parser.test.ts
    └── output.test.ts

components/batch/
├── step-selector.tsx     # Step picker with Batch filtering
├── input-panel.tsx       # Left: input list + paste/drop
├── result-panel.tsx      # Right: result list + bulk actions
├── result-item.tsx       # Single result row (success/error state)
├── batch-summary.tsx     # Bottom summary bar
└── progress-bar.tsx      # Execution progress indicator

app/[locale]/batch/
├── page.tsx              # Route entry (SEO, metadata, JSON-LD)
└── batch-page.tsx        # "use client" page component

public/locales/{en,zh-CN,...}/batch.json   # 10 locale files
```

### Modified Files (1 existing file)

| File                          | Change                                        |
| ----------------------------- | --------------------------------------------- |
| `libs/recipe/types.ts`        | Add optional `batch` field to `RecipeStepDef` |
| `libs/tools.ts`               | Register `batch` tool entry                   |
| `public/locales/*/tools.json` | Add `batch` entry (10 files)                  |
| `vitest.config.ts`            | Add `batch` to test scopes                    |

### Reused Modules (read-only)

| Module                               | Usage                                             |
| ------------------------------------ | ------------------------------------------------- |
| `libs/recipe/registry.ts`            | `getStepById(stepId)` to resolve step definitions |
| `libs/recipe/types.ts`               | `RecipeStepDef.execute()` function                |
| `components/ui/*`                    | Button, Input, Textarea, CopyButton, Card, etc.   |
| `components/description-section.tsx` | SEO description block                             |
| `components/privacy-banner.tsx`      | Privacy notice                                    |

## Page Component Structure

### `app/[locale]/batch/page.tsx`

Follows Recipe's `page.tsx` pattern:

- `generateMetadata()` — SEO metadata via `generatePageMeta()`
- `buildToolSchemas()` — JSON-LD (WebApplication + BreadcrumbList)
- Renders `<BatchPage />`

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
    "selectAll": "Select All"
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

## Testing

| Test file              | Coverage                                                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `engine.test.ts`       | Single-step execution, concurrency control, error isolation (one failure doesn't stop others), progress callback, empty input handling       |
| `input-parser.test.ts` | Single-line parsing, multi-line parsing, empty-line separation, file metadata extraction, edge cases (empty input, single item, 1000+ items) |
| `output.test.ts`       | Filename template replacement, text join/merge, ZIP generation                                                                               |

Registered in `vitest.config.ts` test scopes.

## Future Extensibility

- **Batch + Recipe combination**: Add a `recipe-pipeline` step type that wraps `PipelineEngine.execute()` in a Batch step. The `batch` extension field on `RecipeStepDef` already预留 this path.
- **Step-specific batch config**: Gradually add `batch` fields to individual Step definitions (e.g., `maxInputs: 200` for image compression).
- **Batch presets**: Save frequently-used Batch configs (step + params + template) like Recipe presets.
