# Batch Processor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Batch Processor page that applies a single Recipe step to multiple inputs simultaneously, with auto-execution, progress tracking, and bulk download/copy.

**Architecture:** Two-column layout (5:7 ratio) reusing Recipe's `RecipeStepDef` registry. Engine runs on main thread (DOM API constraints), executes sequentially with per-item error isolation. Debounced auto-execution with abort-signal cancellation pattern. ZIP download via `fflate` for image outputs.

**Tech Stack:** React 19, Next.js 16 App Router, next-intl, fflate, lucide-react, vitest

---

## File Map

### New Files

| File                                        | Responsibility                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------ |
| `libs/batch/types.ts`                       | Type definitions: BatchInputItem, BatchResultItem, BatchConfig, BatchJob |
| `libs/batch/engine.ts`                      | executeBatch() with sequential execution, progress, abort signal         |
| `libs/batch/input-parser.ts`                | Parse text lines / File objects into BatchInputItem[]                    |
| `libs/batch/output.ts`                      | Filename template, text merge, ZIP packaging via fflate                  |
| `libs/batch/__tests__/engine.test.ts`       | Engine unit tests                                                        |
| `libs/batch/__tests__/input-parser.test.ts` | Input parser unit tests                                                  |
| `libs/batch/__tests__/output.test.ts`       | Output unit tests                                                        |
| `hooks/use-multi-file-drop.ts`              | Multi-file drag-and-drop hook                                            |
| `components/batch/step-selector.tsx`        | Step picker + parameter controls                                         |
| `components/batch/input-panel.tsx`          | Input list with paste/drop/add/remove                                    |
| `components/batch/result-panel.tsx`         | Result list with bulk actions                                            |
| `components/batch/result-item.tsx`          | Single result row (text/image/error)                                     |
| `components/batch/batch-summary.tsx`        | Bottom summary bar                                                       |
| `components/batch/progress-bar.tsx`         | Progress indicator                                                       |
| `app/[locale]/batch/page.tsx`               | Route entry, SEO, JSON-LD                                                |
| `app/[locale]/batch/batch-page.tsx`         | "use client" page component with state management                        |
| `public/locales/en/batch.json`              | English i18n                                                             |
| `public/locales/zh-CN/batch.json`           | Simplified Chinese i18n                                                  |
| `public/locales/zh-TW/batch.json`           | Traditional Chinese i18n                                                 |
| `public/locales/ja/batch.json`              | Japanese i18n                                                            |
| `public/locales/ko/batch.json`              | Korean i18n                                                              |
| `public/locales/es/batch.json`              | Spanish i18n                                                             |
| `public/locales/pt-BR/batch.json`           | Portuguese (BR) i18n                                                     |
| `public/locales/fr/batch.json`              | French i18n                                                              |
| `public/locales/de/batch.json`              | German i18n                                                              |
| `public/locales/ru/batch.json`              | Russian i18n                                                             |

### Modified Files

| File                                   | Change                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------ |
| `libs/recipe/types.ts`                 | Add optional `batch` field to `RecipeStepDef`                            |
| `libs/tools.ts`                        | Add `batch` ToolEntry, add to `TOOL_CATEGORIES`, add to `TOOL_RELATIONS` |
| `vitest.config.ts`                     | Add `libs/batch/**/*.test.ts` to test scopes                             |
| `public/locales/en/tools.json`         | Add `batch` entry                                                        |
| `public/locales/zh-CN/tools.json`      | Add `batch` entry with searchTerms                                       |
| `public/locales/zh-TW/tools.json`      | Add `batch` entry with searchTerms                                       |
| `public/locales/ja/tools.json`         | Add `batch` entry with searchTerms                                       |
| `public/locales/ko/tools.json`         | Add `batch` entry with searchTerms                                       |
| `public/locales/es/tools.json`         | Add `batch` entry                                                        |
| `public/locales/pt-BR/tools.json`      | Add `batch` entry                                                        |
| `public/locales/fr/tools.json`         | Add `batch` entry                                                        |
| `public/locales/de/tools.json`         | Add `batch` entry                                                        |
| `public/locales/ru/tools.json`         | Add `batch` entry                                                        |
| `public/locales/en/categories.json`    | Update workflows intro text                                              |
| `public/locales/zh-CN/categories.json` | Update workflows intro text                                              |
| `public/locales/*/categories.json`     | Update workflows intro text (8 more locales)                             |

---

## Task 1: Add `batch` field to RecipeStepDef type

**Files:**

- Modify: `libs/recipe/types.ts:26-36`

- [ ] **Step 1: Add optional `batch` field to `RecipeStepDef` interface**

In `libs/recipe/types.ts`, add the `batch` field after the `execute` method:

```typescript
export interface RecipeStepDef {
  id: string;
  name: string;
  category: StepCategory;
  icon: string;
  description: string;
  inputType: DataType;
  outputType: DataType;
  parameters: StepParam[];
  execute(input: string, params: Record<string, string>): Promise<StepResult>;
  batch?: {
    supported?: boolean;
    maxInputs?: number;
    outputFilenameTemplate?: string;
    mimeType?: string;
  };
}
```

- [ ] **Step 2: Verify existing recipe tests still pass**

Run: `npx vitest run libs/recipe`
Expected: All existing tests pass (no behavior change, purely additive type)

- [ ] **Step 3: Commit**

```bash
git add libs/recipe/types.ts
git commit -m "feat(batch): add optional batch field to RecipeStepDef"
```

---

## Task 2: Install fflate dependency

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install fflate**

Run: `npm install fflate`

- [ ] **Step 2: Verify installation**

Run: `node -e "require('fflate'); console.log('ok')"`
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add fflate dependency for batch ZIP packaging"
```

---

## Task 3: Create Batch types

**Files:**

- Create: `libs/batch/types.ts`

- [ ] **Step 1: Create types file**

```typescript
export type BatchInputItem = {
  id: string;
  name: string;
  content: string;
  type: "text" | "image";
  size: number;
};

export type BatchResultItem = {
  id: string;
  status: "success" | "error";
  output?: string;
  error?: string;
  duration: number;
};

export type BatchConfig = {
  stepId: string;
  stepParams: Record<string, string>;
  outputTemplate?: string;
};

export type BatchStatus = "idle" | "running" | "done" | "partial-error";

export type BatchAbortSignal = { cancelled: boolean };
```

Note: `BatchJob` from spec is not needed as a separate type — page component state is managed via individual `useState` hooks (matching Recipe pattern). The `BatchAbortSignal` type is extracted for reuse between engine and page component.

- [ ] **Step 2: Commit**

```bash
git add libs/batch/types.ts
git commit -m "feat(batch): add core batch type definitions"
```

---

## Task 4: Create input parser with tests

**Files:**

- Create: `libs/batch/input-parser.ts`
- Create: `libs/batch/__tests__/input-parser.test.ts`

- [ ] **Step 1: Write failing tests for input-parser**

```typescript
// libs/batch/__tests__/input-parser.test.ts
import { describe, it, expect } from "vitest";
import { parseTextInput, parseFileInput } from "../input-parser";

describe("parseTextInput", () => {
  it("splits multi-line text into individual items", () => {
    const result = parseTextInput("hello\nworld\nfoo");
    expect(result).toHaveLength(3);
    expect(result[0].content).toBe("hello");
    expect(result[0].name).toBe("hello");
    expect(result[0].type).toBe("text");
    expect(result[0].size).toBe(5);
  });

  it("skips empty lines", () => {
    const result = parseTextInput("hello\n\n\nworld");
    expect(result).toHaveLength(2);
  });

  it("handles single line", () => {
    const result = parseTextInput("hello");
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe("hello");
  });

  it("handles empty string", () => {
    const result = parseTextInput("");
    expect(result).toHaveLength(0);
  });

  it("handles whitespace-only lines", () => {
    const result = parseTextInput("hello\n   \nworld");
    expect(result).toHaveLength(2);
  });

  it("trims whitespace from lines", () => {
    const result = parseTextInput("  hello  \n  world  ");
    expect(result[0].content).toBe("hello");
    expect(result[0].name).toBe("hello");
  });

  it("generates unique IDs", () => {
    const result = parseTextInput("a\nb\nc");
    const ids = result.map((r) => r.id);
    expect(new Set(ids).size).toBe(3);
  });

  it("truncates long names", () => {
    const longLine = "a".repeat(200);
    const result = parseTextInput(longLine);
    expect(result[0].name.length).toBeLessThanOrEqual(50);
  });

  it("computes byte size", () => {
    const result = parseTextInput("hello");
    expect(result[0].size).toBe(5);
  });

  it("computes byte size for multi-byte characters", () => {
    const result = parseTextInput("你好");
    expect(result[0].size).toBe(new TextEncoder().encode("你好").byteLength);
  });
});

describe("parseFileInput", () => {
  it("creates item from File with text type for text files", () => {
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    const result = parseFileInput(file, "read-result");
    expect(result.name).toBe("test.txt");
    expect(result.content).toBe("read-result");
    expect(result.type).toBe("text");
    expect(result.size).toBe(7);
  });

  it("creates item with image type for image files", () => {
    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    const result = parseFileInput(file, "data:image/jpeg;base64,abc");
    expect(result.type).toBe("image");
    expect(result.name).toBe("photo.jpg");
  });

  it("treats unknown MIME types as text", () => {
    const file = new File(["data"], "file.xyz", { type: "application/octet-stream" });
    const result = parseFileInput(file, "content");
    expect(result.type).toBe("text");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run libs/batch/__tests__/input-parser.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement input-parser**

```typescript
// libs/batch/input-parser.ts
import type { BatchInputItem } from "./types";

let idCounter = 0;

function generateId(): string {
  return `batch-${Date.now()}-${++idCounter}`;
}

export function parseTextInput(text: string): BatchInputItem[] {
  if (!text.trim()) return [];

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => ({
      id: generateId(),
      name: line.length > 50 ? line.slice(0, 47) + "..." : line,
      content: line,
      type: "text" as const,
      size: new TextEncoder().encode(line).byteLength,
    }));
}

export function parseFileInput(file: File, readContent: string): BatchInputItem {
  const isImage = file.type.startsWith("image/");
  return {
    id: generateId(),
    name: file.name,
    content: readContent,
    type: isImage ? "image" : "text",
    size: file.size,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run libs/batch/__tests__/input-parser.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add libs/batch/input-parser.ts libs/batch/__tests__/input-parser.test.ts
git commit -m "feat(batch): add input parser with tests"
```

---

## Task 5: Create batch engine with tests

**Files:**

- Create: `libs/batch/engine.ts`
- Create: `libs/batch/__tests__/engine.test.ts`

- [ ] **Step 1: Write failing tests for engine**

```typescript
// libs/batch/__tests__/engine.test.ts
import { describe, it, expect, vi } from "vitest";
import { executeBatch, MAX_BATCH_ITEMS } from "../engine";
import type { BatchConfig, BatchAbortSignal } from "../types";
import type { RecipeStepDef } from "../../recipe/types";

vi.mock("../../recipe/registry", () => ({
  STEP_REGISTRY: new Map<string, RecipeStepDef>(),
  getStep: vi.fn(),
}));

import { getStep } from "../../recipe/registry";
const mockedGetStep = vi.mocked(getStep);

function makeConfig(stepId = "test-step"): BatchConfig {
  return { stepId, stepParams: {} };
}

function makeTextDef(
  execute: (
    input: string,
    params: Record<string, string>
  ) => Promise<{ ok: boolean; output?: string; error?: string }>
): RecipeStepDef {
  return {
    id: "test-step",
    name: "Test Step",
    category: "encoding",
    icon: "🔧",
    description: "Test",
    inputType: "text",
    outputType: "text",
    parameters: [],
    execute,
  };
}

describe("executeBatch", () => {
  it("executes step on each input item", async () => {
    const def = makeTextDef(async (input) => ({ ok: true, output: input.toUpperCase() }));
    mockedGetStep.mockReturnValue(def);

    const config = makeConfig();
    const inputs = [
      { id: "1", name: "hello", content: "hello", type: "text" as const, size: 5 },
      { id: "2", name: "world", content: "world", type: "text" as const, size: 5 },
    ];

    const results = await executeBatch(config, inputs);
    expect(results).toHaveLength(2);
    expect(results[0].output).toBe("HELLO");
    expect(results[1].output).toBe("WORLD");
    expect(results[0].status).toBe("success");
  });

  it("isolates errors — one failure does not stop others", async () => {
    let callCount = 0;
    const def = makeTextDef(async (input) => {
      callCount++;
      if (input === "fail") return { ok: false, error: "bad input" };
      return { ok: true, output: input.toUpperCase() };
    });
    mockedGetStep.mockReturnValue(def);

    const config = makeConfig();
    const inputs = [
      { id: "1", name: "ok1", content: "ok1", type: "text" as const, size: 3 },
      { id: "2", name: "fail", content: "fail", type: "text" as const, size: 4 },
      { id: "3", name: "ok2", content: "ok2", type: "text" as const, size: 3 },
    ];

    const results = await executeBatch(config, inputs);
    expect(results[0].status).toBe("success");
    expect(results[1].status).toBe("error");
    expect(results[1].error).toBe("bad input");
    expect(results[2].status).toBe("success");
    expect(callCount).toBe(3);
  });

  it("returns empty array for empty inputs", async () => {
    const def = makeTextDef(async (input) => ({ ok: true, output: input }));
    mockedGetStep.mockReturnValue(def);

    const results = await executeBatch(makeConfig(), []);
    expect(results).toEqual([]);
  });

  it("reports progress after each item", async () => {
    const def = makeTextDef(async (input) => ({ ok: true, output: input }));
    mockedGetStep.mockReturnValue(def);

    const progress = vi.fn();
    const inputs = [
      { id: "1", name: "a", content: "a", type: "text" as const, size: 1 },
      { id: "2", name: "b", content: "b", type: "text" as const, size: 1 },
      { id: "3", name: "c", content: "c", type: "text" as const, size: 1 },
    ];

    await executeBatch(makeConfig(), inputs, progress);
    expect(progress).toHaveBeenCalledTimes(3);
    expect(progress).toHaveBeenNthCalledWith(1, 1, 3);
    expect(progress).toHaveBeenNthCalledWith(2, 2, 3);
    expect(progress).toHaveBeenNthCalledWith(3, 3, 3);
  });

  it("throws if inputs exceed MAX_BATCH_ITEMS", async () => {
    const def = makeTextDef(async (input) => ({ ok: true, output: input }));
    mockedGetStep.mockReturnValue(def);

    const tooMany = Array.from({ length: MAX_BATCH_ITEMS + 1 }, (_, i) => ({
      id: String(i),
      name: String(i),
      content: String(i),
      type: "text" as const,
      size: 1,
    }));

    await expect(executeBatch(makeConfig(), tooMany)).rejects.toThrow(
      `Maximum ${MAX_BATCH_ITEMS} items allowed`
    );
  });

  it("stops on abort signal and returns partial results", async () => {
    const def = makeTextDef(async (input) => ({ ok: true, output: input }));
    mockedGetStep.mockReturnValue(def);

    const signal: BatchAbortSignal = { cancelled: false };
    const inputs = [
      { id: "1", name: "a", content: "a", type: "text" as const, size: 1 },
      { id: "2", name: "b", content: "b", type: "text" as const, size: 1 },
      { id: "3", name: "c", content: "c", type: "text" as const, size: 1 },
    ];

    const progress = vi.fn((_completed: number, _total: number) => {
      if (_completed === 1) signal.cancelled = true;
    });

    const results = await executeBatch(makeConfig(), inputs, progress, signal);
    expect(results.length).toBeLessThan(3);
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it("returns error for all items when step not found", async () => {
    mockedGetStep.mockReturnValue(undefined);

    const inputs = [{ id: "1", name: "a", content: "a", type: "text" as const, size: 1 }];

    const results = await executeBatch(makeConfig(), inputs);
    expect(results[0].status).toBe("error");
    expect(results[0].error).toContain("not found");
  });

  it("tracks duration per item", async () => {
    const def = makeTextDef(async (input) => ({ ok: true, output: input }));
    mockedGetStep.mockReturnValue(def);

    const inputs = [{ id: "1", name: "a", content: "a", type: "text" as const, size: 1 }];

    const results = await executeBatch(makeConfig(), inputs);
    expect(results[0].duration).toBeGreaterThanOrEqual(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run libs/batch/__tests__/engine.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement engine**

```typescript
// libs/batch/engine.ts
import type { BatchConfig, BatchInputItem, BatchResultItem, BatchAbortSignal } from "./types";
import { getStep } from "../recipe/registry";

export const MAX_BATCH_ITEMS = 1000;

export async function executeBatch(
  config: BatchConfig,
  inputs: BatchInputItem[],
  onProgress?: (completed: number, total: number) => void,
  abortSignal?: BatchAbortSignal
): Promise<BatchResultItem[]> {
  if (inputs.length > MAX_BATCH_ITEMS) {
    throw new Error(`Maximum ${MAX_BATCH_ITEMS} items allowed`);
  }

  if (inputs.length === 0) return [];

  const stepDef = getStep(config.stepId);
  const results: BatchResultItem[] = [];

  for (let i = 0; i < inputs.length; i++) {
    if (abortSignal?.cancelled) break;

    const input = inputs[i];

    if (!stepDef) {
      results.push({
        id: input.id,
        status: "error",
        error: `Step "${config.stepId}" not found`,
        duration: 0,
      });
      onProgress?.(i + 1, inputs.length);
      continue;
    }

    const start = performance.now();
    try {
      const result = await stepDef.execute(input.content, config.stepParams);
      const duration = performance.now() - start;
      results.push({
        id: input.id,
        status: result.ok ? "success" : "error",
        output: result.ok ? result.output : undefined,
        error: result.ok ? undefined : result.error,
        duration,
      });
    } catch (e) {
      const duration = performance.now() - start;
      results.push({
        id: input.id,
        status: "error",
        error: e instanceof Error ? e.message : String(e),
        duration,
      });
    }

    onProgress?.(i + 1, inputs.length);
  }

  return results;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run libs/batch/__tests__/engine.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add libs/batch/engine.ts libs/batch/__tests__/engine.test.ts
git commit -m "feat(batch): add batch engine with tests"
```

---

## Task 6: Create output utilities with tests

**Files:**

- Create: `libs/batch/output.ts`
- Create: `libs/batch/__tests__/output.test.ts`

- [ ] **Step 1: Write failing tests for output**

```typescript
// libs/batch/__tests__/output.test.ts
import { describe, it, expect } from "vitest";
import { applyFilenameTemplate, mergeTextResults } from "../output";

describe("applyFilenameTemplate", () => {
  it("replaces {name} placeholder", () => {
    expect(applyFilenameTemplate("{name}_hashed", "photo.jpg")).toBe("photo.jpg_hashed");
  });

  it("replaces {base} placeholder (name without extension)", () => {
    expect(applyFilenameTemplate("{base}_hashed.txt", "photo.jpg")).toBe("photo_hashed.txt");
  });

  it("returns template as-is when no placeholders", () => {
    expect(applyFilenameTemplate("output.txt", "photo.jpg")).toBe("output.txt");
  });

  it("handles filename without extension for {base}", () => {
    expect(applyFilenameTemplate("{base}_out", "README")).toBe("README_out");
  });

  it("handles multiple extensions", () => {
    expect(applyFilenameTemplate("{base}_processed.txt", "archive.tar.gz")).toBe(
      "archive.tar_processed.txt"
    );
  });
});

describe("mergeTextResults", () => {
  it("joins outputs with newlines", () => {
    const results = [
      { id: "1", status: "success" as const, output: "hello", duration: 0 },
      { id: "2", status: "success" as const, output: "world", duration: 0 },
    ];
    expect(mergeTextResults(results)).toBe("hello\nworld");
  });

  it("skips error items", () => {
    const results = [
      { id: "1", status: "success" as const, output: "hello", duration: 0 },
      { id: "2", status: "error" as const, error: "fail", duration: 0 },
      { id: "3", status: "success" as const, output: "world", duration: 0 },
    ];
    expect(mergeTextResults(results)).toBe("hello\nworld");
  });

  it("returns empty string for no successful results", () => {
    const results = [{ id: "1", status: "error" as const, error: "fail", duration: 0 }];
    expect(mergeTextResults(results)).toBe("");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run libs/batch/__tests__/output.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement output**

```typescript
// libs/batch/output.ts
import type { BatchResultItem } from "./types";

export function applyFilenameTemplate(template: string, filename: string): string {
  const dotIndex = filename.lastIndexOf(".");
  const base = dotIndex > 0 ? filename.slice(0, dotIndex) : filename;

  return template.replace(/\{name\}/g, filename).replace(/\{base\}/g, base);
}

export function mergeTextResults(results: BatchResultItem[]): string {
  return results
    .filter((r) => r.status === "success" && r.output !== undefined)
    .map((r) => r.output!)
    .join("\n");
}

export async function createZipFromResults(
  results: BatchResultItem[],
  filenameTemplate: string,
  inputs: { id: string; name: string }[]
): Promise<Blob> {
  const fflate = await import("fflate");
  const files: Record<string, Uint8Array> = {};

  for (const result of results) {
    if (result.status !== "success" || !result.output) continue;
    const input = inputs.find((i) => i.id === result.id);
    const name = input
      ? applyFilenameTemplate(filenameTemplate, input.name)
      : `output-${result.id}.txt`;

    if (result.output.startsWith("data:")) {
      const base64 = result.output.split(",")[1];
      files[name] = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    } else {
      files[name] = new TextEncoder().encode(result.output);
    }
  }

  const zipped = fflate.zipSync(files);
  return new Blob([zipped], { type: "application/zip" });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run libs/batch/__tests__/output.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add libs/batch/output.ts libs/batch/__tests__/output.test.ts
git commit -m "feat(batch): add output utilities with tests"
```

---

## Task 7: Add batch to vitest config

**Files:**

- Modify: `vitest.config.ts:28`

- [ ] **Step 1: Add batch test scope**

In `vitest.config.ts`, add after the `libs/recipe/**/*.test.ts` line:

```typescript
"libs/batch/**/*.test.ts",
```

- [ ] **Step 2: Run all tests to verify no regression**

Run: `npx vitest run`
Expected: All existing + new batch tests pass

- [ ] **Step 3: Commit**

```bash
git add vitest.config.ts
git commit -m "chore(batch): add batch to vitest test scopes"
```

---

## Task 8: Create useMultiFileDropZone hook

**Files:**

- Create: `hooks/use-multi-file-drop.ts`

- [ ] **Step 1: Implement multi-file drop hook**

Following the same pattern as `hooks/useDropZone.ts` but accepting `File[]`:

```typescript
// hooks/use-multi-file-drop.ts
"use client";

import { useRef, useState, type DragEvent } from "react";

export function useMultiFileDrop(onFiles: (files: File[]) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const counterRef = useRef(0);

  function onDragOver(ev: DragEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    ev.dataTransfer.dropEffect = "copy";
  }

  function onDragEnter(ev: DragEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    counterRef.current++;
    if (ev.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  }

  function onDragLeave(ev: DragEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    counterRef.current--;
    if (counterRef.current === 0) {
      setIsDragging(false);
    }
  }

  function onDrop(ev: DragEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    counterRef.current = 0;
    setIsDragging(false);
    const fileArray = Array.from(ev.dataTransfer.files ?? []);
    if (fileArray.length > 0) onFiles(fileArray);
  }

  return { isDragging, onDragOver, onDragEnter, onDragLeave, onDrop };
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/use-multi-file-drop.ts
git commit -m "feat(batch): add multi-file drag-and-drop hook"
```

---

## Task 9: Register batch tool in libs/tools.ts

**Files:**

- Modify: `libs/tools.ts`

- [ ] **Step 1: Add `Layers` to lucide-react imports**

In `libs/tools.ts`, add `Layers` to the import from `lucide-react` (around line 41):

```typescript
import {
  // ... existing imports ...
  FlaskConical,
  Layers,
} from "lucide-react";
```

- [ ] **Step 2: Add batch ToolEntry to TOOLS array**

Add after the `recipe` entry (around line 406):

```typescript
{
  key: "batch",
  path: "/batch",
  icon: Layers,
  emoji: "📦",
  sameAs: ["https://en.wikipedia.org/wiki/Batch_processing"],
},
```

- [ ] **Step 3: Add batch to TOOL_CATEGORIES workflows**

Change the workflows entry (line 124):

```typescript
{ key: "workflows", tools: ["recipe", "batch"] },
```

- [ ] **Step 4: Add batch to TOOL_RELATIONS**

Add after the `recipe` entry (around line 169):

```typescript
batch: ["recipe", "hashing", "base64", "image"],
```

- [ ] **Step 5: Commit**

```bash
git add libs/tools.ts
git commit -m "feat(batch): register batch tool in tools registry"
```

---

## Task 10: Create English i18n files

**Files:**

- Create: `public/locales/en/batch.json`
- Modify: `public/locales/en/tools.json`

- [ ] **Step 1: Create `public/locales/en/batch.json`**

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
    "maxItemsWarning": "Maximum {max} items allowed",
    "removeItem": "Remove"
  },
  "resultPanel": {
    "title": "Results",
    "copyAll": "Copy All",
    "downloadAll": "Download All",
    "downloadZip": "Download ZIP",
    "copySuccess": "Copied {count} items",
    "noResults": "No results yet",
    "downloadSingle": "Download"
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

- [ ] **Step 2: Add batch entry to `public/locales/en/tools.json`**

Add a `batch` entry in the tools.json object (before the closing `}`):

```json
"batch": {
  "shortTitle": "Batch Processor",
  "title": "Batch Processor - Bulk Operation Tool | OmniKit",
  "description": "Apply a single operation to multiple inputs at once. Batch encode, hash, compress, and convert files and text."
}
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/en/batch.json public/locales/en/tools.json
git commit -m "feat(batch): add English i18n strings"
```

---

## Task 11: Create 9 non-English locale batch.json and tools.json entries

**Files:**

- Create: `public/locales/{zh-CN,zh-TW,ja,ko,es,pt-BR,fr,de,ru}/batch.json`
- Modify: `public/locales/{zh-CN,zh-TW,ja,ko,es,pt-BR,fr,de,ru}/tools.json`

This task adds batch.json and tools.json entries for all 9 non-English locales. Each locale needs:

1. A `batch.json` with translated strings
2. A `batch` entry added to the existing `tools.json`

- [ ] **Step 1: Create `public/locales/zh-CN/batch.json`**

```json
{
  "stepSelector": {
    "title": "处理步骤",
    "changeStep": "更换步骤",
    "params": "参数",
    "placeholder": "选择一个步骤..."
  },
  "inputPanel": {
    "title": "输入",
    "itemCount": "{count} 项",
    "pasteText": "粘贴文本",
    "dropFiles": "拖放文件",
    "pastePlaceholder": "粘贴多行文本，每行一项...",
    "removeAll": "全部删除",
    "selectAll": "全选",
    "maxItemsWarning": "最多允许 {max} 项",
    "removeItem": "删除"
  },
  "resultPanel": {
    "title": "结果",
    "copyAll": "全部复制",
    "downloadAll": "全部下载",
    "downloadZip": "下载 ZIP",
    "copySuccess": "已复制 {count} 项",
    "noResults": "暂无结果",
    "downloadSingle": "下载"
  },
  "summary": {
    "success": "{success}/{total} 成功",
    "errors": "{errors} 个错误",
    "duration": "{time}秒",
    "totalSaved": "总计: {before} → {after} ({percent}%)"
  },
  "descriptions": {
    "aeoDefinition": "批量处理器是一种将单个处理操作同时应用于多个输入的工具，在需要一次性转换、编码、哈希或处理大量数据时节省时间。",
    "whatIs": "批量处理器让你将一个操作——如哈希、编码或压缩——一次性应用于数十或数百个输入。拖放多个文件或粘贴多行文本，选择步骤，即可获得所有结果。",
    "useCasesP1": "批量哈希数百个字符串用于数据库导入，一键压缩整个图片文件夹，或同时将多个文件编码为 Base64。",
    "howToStep1": "从选择器中选择一个处理步骤",
    "howToStep2": "通过粘贴文本或拖放文件添加多个输入",
    "howToStep3": "查看各项结果，一键全部下载或复制",
    "faq1Q": "有处理数量限制吗？",
    "faq1A": "批量处理器每次最多处理 1,000 项。所有处理在浏览器中进行——不会向任何服务器发送数据。",
    "faq2Q": "可以使用多个处理步骤吗？",
    "faq2A": "批量处理将单个步骤应用于所有输入。如需多步骤处理，请使用 Recipe 工具构建流水线。",
    "faq3Q": "如果某一项处理失败怎么办？",
    "faq3A": "失败的项会标记错误徽章并跳过，其余项继续正常处理。"
  }
}
```

- [ ] **Step 2: Add batch to `public/locales/zh-CN/tools.json`**

Add `batch` entry with searchTerms:

```json
"batch": {
  "shortTitle": "批量处理器",
  "title": "批量处理器 - 批量操作工具 | OmniKit",
  "description": "将单个操作同时应用于多个输入。批量编码、哈希、压缩和转换文件与文本。",
  "searchTerms": "piliangchuliqi plcq piliang hash bianma yasuo"
}
```

- [ ] **Step 3: Create `public/locales/zh-TW/batch.json`**

```json
{
  "stepSelector": {
    "title": "處理步驟",
    "changeStep": "更換步驟",
    "params": "參數",
    "placeholder": "選擇一個步驟..."
  },
  "inputPanel": {
    "title": "輸入",
    "itemCount": "{count} 項",
    "pasteText": "貼上文字",
    "dropFiles": "拖放檔案",
    "pastePlaceholder": "貼上多行文字，每行一項...",
    "removeAll": "全部刪除",
    "selectAll": "全選",
    "maxItemsWarning": "最多允許 {max} 項",
    "removeItem": "刪除"
  },
  "resultPanel": {
    "title": "結果",
    "copyAll": "全部複製",
    "downloadAll": "全部下載",
    "downloadZip": "下載 ZIP",
    "copySuccess": "已複製 {count} 項",
    "noResults": "暫無結果",
    "downloadSingle": "下載"
  },
  "summary": {
    "success": "{success}/{total} 成功",
    "errors": "{errors} 個錯誤",
    "duration": "{time}秒",
    "totalSaved": "總計: {before} → {after} ({percent}%)"
  },
  "descriptions": {
    "aeoDefinition": "批量處理器是一種將單個處理操作同時應用於多個輸入的工具，在需要一次轉換、編碼、雜湊或處理大量資料時節省時間。",
    "whatIs": "批量處理器讓你將一個操作——如雜湊、編碼或壓縮——一次應用於數十或數百個輸入。拖放多個檔案或貼上多行文字，選擇步驟，即可獲得所有結果。",
    "useCasesP1": "批量雜湊數百個字串用於資料庫匯入，一鍵壓縮整個圖片資料夾，或同時將多個檔案編碼為 Base64。",
    "howToStep1": "從選擇器中選擇一個處理步驟",
    "howToStep2": "透過貼上文字或拖放檔案新增多個輸入",
    "howToStep3": "檢視各項結果，一鍵全部下載或複製",
    "faq1Q": "有處理數量限制嗎？",
    "faq1A": "批量處理器每次最多處理 1,000 項。所有處理在瀏覽器中進行——不會向任何伺服器傳送資料。",
    "faq2Q": "可以使用多個處理步驟嗎？",
    "faq2A": "批量處理將單個步驟應用於所有輸入。如需多步驟處理，請使用 Recipe 工具建構管線。",
    "faq3Q": "如果某一項處理失敗怎麼辦？",
    "faq3A": "失敗的項會標記錯誤徽章並跳過，其餘項繼續正常處理。"
  }
}
```

- [ ] **Step 4: Add batch to `public/locales/zh-TW/tools.json`**

```json
"batch": {
  "shortTitle": "批量處理器",
  "title": "批量處理器 - 批量操作工具 | OmniKit",
  "description": "將單個操作同時應用於多個輸入。批量編碼、雜湊、壓縮和轉換檔案與文字。",
  "searchTerms": "piliangchuliqi plcq piliang hash bianma yasuo"
}
```

- [ ] **Step 5: Create `public/locales/ja/batch.json`**

```json
{
  "stepSelector": {
    "title": "処理ステップ",
    "changeStep": "ステップを変更",
    "params": "パラメータ",
    "placeholder": "ステップを選択..."
  },
  "inputPanel": {
    "title": "入力",
    "itemCount": "{count} 件",
    "pasteText": "テキストを貼り付け",
    "dropFiles": "ファイルをドロップ",
    "pastePlaceholder": "複数行のテキストを貼り付け、1行につき1項目...",
    "removeAll": "すべて削除",
    "selectAll": "すべて選択",
    "maxItemsWarning": "最大 {max} 件まで",
    "removeItem": "削除"
  },
  "resultPanel": {
    "title": "結果",
    "copyAll": "すべてコピー",
    "downloadAll": "すべてダウンロード",
    "downloadZip": "ZIP ダウンロード",
    "copySuccess": "{count} 件をコピーしました",
    "noResults": "結果なし",
    "downloadSingle": "ダウンロード"
  },
  "summary": {
    "success": "{success}/{total} 成功",
    "errors": "{errors} 件エラー",
    "duration": "{time}秒",
    "totalSaved": "合計: {before} → {after} ({percent}%)"
  },
  "descriptions": {
    "aeoDefinition": "バッチプロセッサは、単一の処理操作を複数の入力に同時に適用するツールで、変換、エンコード、ハッシュ、変換を一括で行う際の時間を節約します。",
    "whatIs": "バッチプロセッサを使うと、ハッシュ、エンコード、圧縮などの操作を数十〜数百の入力に一括適用できます。複数ファイルをドロップするか、複数行のテキストを貼り付け、ステップを選ぶだけで、すべての結果がすぐに得られます。",
    "useCasesP1": "データベースインポート用に数百の文字列を一括ハッシュ、画像フォルダをワンクリックで圧縮、複数ファイルを同時に Base64 エンコード。",
    "howToStep1": "ピッカーから処理ステップを選択",
    "howToStep2": "テキストの貼り付けやファイルのドロップで複数の入力を追加",
    "howToStep3": "個々の結果を確認し、すべてを一括ダウンロードまたはコピー",
    "faq1Q": "処理できる項目数に上限はありますか？",
    "faq1A": "バッチプロセッサは1回あたり最大 1,000 件を処理します。すべての処理はブラウザ内で行われ、データはサーバーに送信されません。",
    "faq2Q": "複数の処理ステップを使えますか？",
    "faq2A": "バッチ処理はすべての入力に単一のステップを適用します。複数ステップの処理には Recipe ツールでパイプラインを構築してください。",
    "faq3Q": "ある項目が失敗した場合はどうなりますか？",
    "faq3A": "失敗した項目にはエラーバッジが付き、スキップされます。他の項目は正常に処理が続行されます。"
  }
}
```

- [ ] **Step 6: Add batch to `public/locales/ja/tools.json`**

```json
"batch": {
  "shortTitle": "バッチプロセッサ",
  "title": "バッチプロセッサ - 一括操作ツール | OmniKit",
  "description": "単一の操作を複数の入力に一括適用。一括エンコード、ハッシュ、圧縮、変換。",
  "searchTerms": "batchburosesa btpcs ikkatsu handy gurobaru"
}
```

- [ ] **Step 7: Create `public/locales/ko/batch.json`**

```json
{
  "stepSelector": {
    "title": "처리 단계",
    "changeStep": "단계 변경",
    "params": "매개변수",
    "placeholder": "단계를 선택하세요..."
  },
  "inputPanel": {
    "title": "입력",
    "itemCount": "{count}개",
    "pasteText": "텍스트 붙여넣기",
    "dropFiles": "파일 드롭",
    "pastePlaceholder": "여러 줄의 텍스트를 붙여넣으세요. 한 줄에 하나씩...",
    "removeAll": "모두 삭제",
    "selectAll": "모두 선택",
    "maxItemsWarning": "최대 {max}개까지 가능",
    "removeItem": "삭제"
  },
  "resultPanel": {
    "title": "결과",
    "copyAll": "모두 복사",
    "downloadAll": "모두 다운로드",
    "downloadZip": "ZIP 다운로드",
    "copySuccess": "{count}개 복사됨",
    "noResults": "결과 없음",
    "downloadSingle": "다운로드"
  },
  "summary": {
    "success": "{success}/{total} 성공",
    "errors": "{errors}개 오류",
    "duration": "{time}초",
    "totalSaved": "합계: {before} → {after} ({percent}%)"
  },
  "descriptions": {
    "aeoDefinition": "배치 프로세서는 단일 처리 작업을 여러 입력에 동시에 적용하는 도구로, 변환, 인코딩, 해시, 변환을 한 번에 수행할 때 시간을 절약합니다.",
    "whatIs": "배치 프로세서를 사용하면 해시, 인코딩, 압축 등의 작업을 수십~수백 개의 입력에 한 번에 적용할 수 있습니다. 여러 파일을 드롭하거나 여러 줄의 텍스트를 붙여넣고, 단계를 선택하면 모든 결과를 즉시 확인할 수 있습니다.",
    "useCasesP1": "데이터베이스 가져오기를 위해 수백 개의 문자열을 일괄 해시, 이미지 폴더를 원클릭으로 압축, 여러 파일을 동시에 Base64로 인코딩.",
    "howToStep1": "피커에서 처리 단계를 선택",
    "howToStep2": "텍스트 붙여넣기 또는 파일 드롭으로 여러 입력 추가",
    "howToStep3": "개별 결과를 확인하고 모두 다운로드하거나 복사",
    "faq1Q": "처리할 수 있는 항목 수에 제한이 있나요?",
    "faq1A": "배치 프로세서는 한 번에 최대 1,000개의 항목을 처리합니다. 모든 처리는 브라우저에서 이루어지며 서버로 데이터가 전송되지 않습니다.",
    "faq2Q": "여러 처리 단계를 사용할 수 있나요?",
    "faq2A": "배치 처리는 모든 입력에 단일 단계를 적용합니다. 다단계 처리를 위해서는 Recipe 도구로 파이프라인을 구축하세요.",
    "faq3Q": "한 항목이 실패하면 어떻게 되나요?",
    "faq3A": "실패한 항목은 오류 배지가 표시되고 건너뜁니다. 나머지 항목은 정상적으로 계속 처리됩니다."
  }
}
```

- [ ] **Step 8: Add batch to `public/locales/ko/tools.json`**

```json
"batch": {
  "shortTitle": "배치 프로세서",
  "title": "배치 프로세서 - 일괄 작업 도구 | OmniKit",
  "description": "단일 작업을 여러 입력에 동시에 적용. 일괄 인코딩, 해시, 압축 및 변환.",
  "searchTerms": "baeCHIPUROSESEO bcps ilgwal haseu enkoding"
}
```

- [ ] **Step 9: Create `public/locales/es/batch.json`**

```json
{
  "stepSelector": {
    "title": "Paso de procesamiento",
    "changeStep": "Cambiar paso",
    "params": "Parámetros",
    "placeholder": "Selecciona un paso..."
  },
  "inputPanel": {
    "title": "Entradas",
    "itemCount": "{count} elementos",
    "pasteText": "Pegar texto",
    "dropFiles": "Soltar archivos",
    "pastePlaceholder": "Pega múltiples líneas, un elemento por línea...",
    "removeAll": "Eliminar todo",
    "selectAll": "Seleccionar todo",
    "maxItemsWarning": "Máximo {max} elementos permitidos",
    "removeItem": "Eliminar"
  },
  "resultPanel": {
    "title": "Resultados",
    "copyAll": "Copiar todo",
    "downloadAll": "Descargar todo",
    "downloadZip": "Descargar ZIP",
    "copySuccess": "{count} elementos copiados",
    "noResults": "Sin resultados aún",
    "downloadSingle": "Descargar"
  },
  "summary": {
    "success": "{success}/{total} exitosos",
    "errors": "{errors} errores",
    "duration": "{time}s",
    "totalSaved": "Total: {before} → {after} ({percent}%)"
  },
  "descriptions": {
    "aeoDefinition": "Batch Processor es una herramienta que aplica una única operación de procesamiento a múltiples entradas simultáneamente, ahorrando tiempo cuando necesitas transformar, codificar, hashear o convertir muchos elementos a la vez.",
    "whatIs": "Batch Processor te permite aplicar una operación —como hashing, codificación o compresión— a docenas o cientos de entradas de una sola vez. Suelta múltiples archivos o pega múltiples líneas, elige un paso y obtén todos los resultados al instante.",
    "useCasesP1": "Hashea cientos de cadenas para importaciones a bases de datos, comprime carpetas enteras de imágenes con un clic o codifica múltiples archivos a Base64 simultáneamente.",
    "howToStep1": "Selecciona un paso de procesamiento del selector",
    "howToStep2": "Agrega múltiples entradas pegando texto o soltando archivos",
    "howToStep3": "Ve los resultados individuales y descarga o copia todo a la vez",
    "faq1Q": "¿Hay un límite de elementos a procesar?",
    "faq1A": "Batch Processor maneja hasta 1,000 elementos por lote. Todo el procesamiento ocurre en tu navegador — no se envían datos a ningún servidor.",
    "faq2Q": "¿Puedo usar múltiples pasos de procesamiento?",
    "faq2A": "Batch aplica un único paso a todas las entradas. Para procesamiento multi-paso, usa la herramienta Recipe para construir un pipeline.",
    "faq3Q": "¿Qué pasa si un elemento falla?",
    "faq3A": "Los elementos fallidos se marcan con una insignia de error y se omiten. Los demás elementos continúan procesándose normalmente."
  }
}
```

- [ ] **Step 10: Add batch to `public/locales/es/tools.json`**

```json
"batch": {
  "shortTitle": "Procesador por lotes",
  "title": "Procesador por lotes - Herramienta de operaciones masivas | OmniKit",
  "description": "Aplica una operación a múltiples entradas a la vez. Codifica, hashea, comprime y convierte archivos y texto por lotes."
}
```

- [ ] **Step 11: Create `public/locales/pt-BR/batch.json`**

```json
{
  "stepSelector": {
    "title": "Etapa de processamento",
    "changeStep": "Alterar etapa",
    "params": "Parâmetros",
    "placeholder": "Selecione uma etapa..."
  },
  "inputPanel": {
    "title": "Entradas",
    "itemCount": "{count} itens",
    "pasteText": "Colar texto",
    "dropFiles": "Soltar arquivos",
    "pastePlaceholder": "Cole múltiplas linhas, um item por linha...",
    "removeAll": "Remover tudo",
    "selectAll": "Selecionar tudo",
    "maxItemsWarning": "Máximo de {max} itens permitidos",
    "removeItem": "Remover"
  },
  "resultPanel": {
    "title": "Resultados",
    "copyAll": "Copiar tudo",
    "downloadAll": "Baixar tudo",
    "downloadZip": "Baixar ZIP",
    "copySuccess": "{count} itens copiados",
    "noResults": "Sem resultados ainda",
    "downloadSingle": "Baixar"
  },
  "summary": {
    "success": "{success}/{total} com sucesso",
    "errors": "{errors} erros",
    "duration": "{time}s",
    "totalSaved": "Total: {before} → {after} ({percent}%)"
  },
  "descriptions": {
    "aeoDefinition": "O Batch Processor é uma ferramenta que aplica uma única operação de processamento a múltiplas entradas simultaneamente, economizando tempo quando você precisa transformar, codificar, fazer hash ou converter muitos itens de uma vez.",
    "whatIs": "O Batch Processor permite aplicar uma operação — como hashing, codificação ou compressão — a dezenas ou centenas de entradas de uma só vez. Solte múltiplos arquivos ou cole múltiplas linhas, escolha uma etapa e obtenha todos os resultados instantaneamente.",
    "useCasesP1": "Faça hash de centenas de strings para importações de banco de dados, comprima pastas inteiras de imagens com um clique ou codifique múltiplos arquivos em Base64 simultaneamente.",
    "howToStep1": "Selecione uma etapa de processamento no seletor",
    "howToStep2": "Adicione múltiplas entradas colando texto ou soltando arquivos",
    "howToStep3": "Veja os resultados individuais e baixe ou copie tudo de uma vez",
    "faq1Q": "Existe um limite de itens para processar?",
    "faq1A": "O Batch Processor manipula até 1.000 itens por lote. Todo o processamento ocorre no seu navegador — nenhum dado é enviado a qualquer servidor.",
    "faq2Q": "Posso usar múltiplas etapas de processamento?",
    "faq2A": "O Batch aplica uma única etapa a todas as entradas. Para processamento em múltiplas etapas, use a ferramenta Recipe para construir um pipeline.",
    "faq3Q": "O que acontece se um item falhar?",
    "faq3A": "Itens com falha são marcados com um selo de erro e ignorados. Os demais itens continuam sendo processados normalmente."
  }
}
```

- [ ] **Step 12: Add batch to `public/locales/pt-BR/tools.json`**

```json
"batch": {
  "shortTitle": "Processador em lote",
  "title": "Processador em lote - Ferramenta de operações em massa | OmniKit",
  "description": "Aplique uma única operação a múltiplas entradas de uma vez. Codifique, faça hash, comprima e converta arquivos e textos em lote."
}
```

- [ ] **Step 13: Create `public/locales/fr/batch.json`**

```json
{
  "stepSelector": {
    "title": "Étape de traitement",
    "changeStep": "Changer l'étape",
    "params": "Paramètres",
    "placeholder": "Sélectionnez une étape..."
  },
  "inputPanel": {
    "title": "Entrées",
    "itemCount": "{count} éléments",
    "pasteText": "Coller le texte",
    "dropFiles": "Déposer des fichiers",
    "pastePlaceholder": "Collez plusieurs lignes, un élément par ligne...",
    "removeAll": "Tout supprimer",
    "selectAll": "Tout sélectionner",
    "maxItemsWarning": "Maximum {max} éléments autorisés",
    "removeItem": "Supprimer"
  },
  "resultPanel": {
    "title": "Résultats",
    "copyAll": "Tout copier",
    "downloadAll": "Tout télécharger",
    "downloadZip": "Télécharger ZIP",
    "copySuccess": "{count} éléments copiés",
    "noResults": "Aucun résultat pour le moment",
    "downloadSingle": "Télécharger"
  },
  "summary": {
    "success": "{success}/{total} réussis",
    "errors": "{errors} erreurs",
    "duration": "{time}s",
    "totalSaved": "Total : {before} → {after} ({percent}%)"
  },
  "descriptions": {
    "aeoDefinition": "Batch Processor est un outil qui applique une seule opération de traitement à plusieurs entrées simultanément, vous faisant gagner du temps lorsque vous devez transformer, encoder, hacher ou convertir de nombreux éléments à la fois.",
    "whatIs": "Batch Processor vous permet d'appliquer une opération — comme le hachage, l'encodage ou la compression — à des dizaines ou des centaines d'entrées en une seule fois. Déposez plusieurs fichiers ou collez plusieurs lignes, choisissez une étape et obtenez tous les résultats instantanément.",
    "useCasesP1": "Hachez des centaines de chaînes pour des importations en base de données, compressez des dossiers entiers d'images en un clic ou encodez plusieurs fichiers en Base64 simultanément.",
    "howToStep1": "Sélectionnez une étape de traitement dans le sélecteur",
    "howToStep2": "Ajoutez plusieurs entrées en collant du texte ou en déposant des fichiers",
    "howToStep3": "Consultez les résultats individuels et téléchargez ou copiez tout d'un coup",
    "faq1Q": "Y a-t-il une limite au nombre d'éléments à traiter ?",
    "faq1A": "Batch Processor gère jusqu'à 1 000 éléments par lot. Tout le traitement s'effectue dans votre navigateur — aucune donnée n'est envoyée à un serveur.",
    "faq2Q": "Puis-je utiliser plusieurs étapes de traitement ?",
    "faq2A": "Batch applique une seule étape à toutes les entrées. Pour un traitement multi-étapes, utilisez l'outil Recipe pour construire un pipeline.",
    "faq3Q": "Que se passe-t-il si un élément échoue ?",
    "faq3A": "Les éléments en échec sont marqués d'un badge d'erreur et ignorés. Les autres éléments continuent d'être traités normalement."
  }
}
```

- [ ] **Step 14: Add batch to `public/locales/fr/tools.json`**

```json
"batch": {
  "shortTitle": "Processeur par lots",
  "title": "Processeur par lots - Outil d'opérations en masse | OmniKit",
  "description": "Appliquez une seule opération à plusieurs entrées à la fois. Encodez, hachez, compressez et convertissez des fichiers et du texte par lots."
}
```

- [ ] **Step 15: Create `public/locales/de/batch.json`**

```json
{
  "stepSelector": {
    "title": "Verarbeitungsschritt",
    "changeStep": "Schritt ändern",
    "params": "Parameter",
    "placeholder": "Wähle einen Schritt..."
  },
  "inputPanel": {
    "title": "Eingaben",
    "itemCount": "{count} Elemente",
    "pasteText": "Text einfügen",
    "dropFiles": "Dateien ablegen",
    "pastePlaceholder": "Mehrere Zeilen einfügen, eine pro Zeile...",
    "removeAll": "Alle entfernen",
    "selectAll": "Alle auswählen",
    "maxItemsWarning": "Maximal {max} Elemente erlaubt",
    "removeItem": "Entfernen"
  },
  "resultPanel": {
    "title": "Ergebnisse",
    "copyAll": "Alle kopieren",
    "downloadAll": "Alle herunterladen",
    "downloadZip": "ZIP herunterladen",
    "copySuccess": "{count} Elemente kopiert",
    "noResults": "Noch keine Ergebnisse",
    "downloadSingle": "Herunterladen"
  },
  "summary": {
    "success": "{success}/{total} erfolgreich",
    "errors": "{errors} Fehler",
    "duration": "{time}s",
    "totalSaved": "Gesamt: {before} → {after} ({percent}%)"
  },
  "descriptions": {
    "aeoDefinition": "Batch Processor ist ein Werkzeug, das einen einzigen Verarbeitungsschritt auf mehrere Eingaben gleichzeitig anwendet und Zeit spart, wenn Sie viele Elemente gleichzeitig transformieren, codieren, hashen oder konvertieren müssen.",
    "whatIs": "Batch Processor ermöglicht es Ihnen, eine Operation — wie Hashing, Codierung oder Komprimierung — auf Dutzende oder Hunderte von Eingaben gleichzeitig anzuwenden. Mehrere Dateien ablegen oder mehrere Zeilen einfügen, einen Schritt auswählen und alle Ergebnisse sofort erhalten.",
    "useCasesP1": "Hunderte von Zeichenketten für Datenbankimporte hashen, ganze Bildordner mit einem Klick komprimieren oder mehrere Dateien gleichzeitig in Base64 codieren.",
    "howToStep1": "Wähle einen Verarbeitungsschritt aus der Auswahl",
    "howToStep2": "Füge mehrere Eingaben durch Einfügen von Text oder Ablegen von Dateien hinzu",
    "howToStep3": "Sieh dir die einzelnen Ergebnisse an und lade alles auf einmal herunter oder kopiere es",
    "faq1Q": "Gibt es ein Limit für die Anzahl der zu verarbeitenden Elemente?",
    "faq1A": "Batch Processor verarbeitet bis zu 1.000 Elemente pro Batch. Die gesamte Verarbeitung erfolgt in deinem Browser — es werden keine Daten an einen Server gesendet.",
    "faq2Q": "Kann ich mehrere Verarbeitungsschritte verwenden?",
    "faq2A": "Batch wendet einen einzelnen Schritt auf alle Eingaben an. Für mehrstufige Verarbeitung verwende das Recipe-Werkzeug, um eine Pipeline zu erstellen.",
    "faq3Q": "Was passiert, wenn ein Element fehlschlägt?",
    "faq3A": "Fehlgeschlagene Elemente werden mit einem Fehler-Badge markiert und übersprungen. Alle anderen Elemente werden normal weiterverarbeitet."
  }
}
```

- [ ] **Step 16: Add batch to `public/locales/de/tools.json`**

```json
"batch": {
  "shortTitle": "Stapelverarbeitung",
  "title": "Stapelverarbeitung - Massenverarbeitungswerkzeug | OmniKit",
  "description": "Wende eine einzelne Operation auf mehrere Eingaben gleichzeitig an. Stapelweises Codieren, Hashen, Komprimieren und Konvertieren."
}
```

- [ ] **Step 17: Create `public/locales/ru/batch.json`**

```json
{
  "stepSelector": {
    "title": "Шаг обработки",
    "changeStep": "Изменить шаг",
    "params": "Параметры",
    "placeholder": "Выберите шаг..."
  },
  "inputPanel": {
    "title": "Входные данные",
    "itemCount": "{count} элементов",
    "pasteText": "Вставить текст",
    "dropFiles": "Перетащить файлы",
    "pastePlaceholder": "Вставьте несколько строк, по одному элементу на строку...",
    "removeAll": "Удалить все",
    "selectAll": "Выбрать все",
    "maxItemsWarning": "Максимум {max} элементов",
    "removeItem": "Удалить"
  },
  "resultPanel": {
    "title": "Результаты",
    "copyAll": "Копировать все",
    "downloadAll": "Скачать все",
    "downloadZip": "Скачать ZIP",
    "copySuccess": "Скопировано {count} элементов",
    "noResults": "Пока нет результатов",
    "downloadSingle": "Скачать"
  },
  "summary": {
    "success": "{success}/{total} успешно",
    "errors": "{errors} ошибок",
    "duration": "{time}с",
    "totalSaved": "Итого: {before} → {after} ({percent}%)"
  },
  "descriptions": {
    "aeoDefinition": "Batch Processor — это инструмент, который применяет одну операцию обработки к нескольким входным данным одновременно, экономя время при необходимости преобразовать, закодировать, хешировать или конвертировать множество элементов за раз.",
    "whatIs": "Batch Processor позволяет применить одну операцию — хеширование, кодирование или сжатие — к десяткам или сотням входных данных за один раз. Перетащите несколько файлов или вставьте несколько строк, выберите шаг и мгновенно получите все результаты.",
    "useCasesP1": "Пакетное хеширование сотен строк для импорта в базу данных, сжатие целых папок с изображениями в один клик или одновременное кодирование нескольких файлов в Base64.",
    "howToStep1": "Выберите шаг обработки из списка",
    "howToStep2": "Добавьте несколько входных данных, вставив текст или перетащив файлы",
    "howToStep3": "Просмотрите отдельные результаты и скачайте или скопируйте все сразу",
    "faq1Q": "Есть ли ограничение на количество обрабатываемых элементов?",
    "faq1A": "Batch Processor обрабатывает до 1 000 элементов за пакет. Вся обработка выполняется в вашем браузере — данные не отправляются на сервер.",
    "faq2Q": "Можно ли использовать несколько шагов обработки?",
    "faq2A": "Batch применяет один шаг ко всем входным данным. Для многоступенчатой обработки используйте инструмент Recipe для создания конвейера.",
    "faq3Q": "Что произойдёт, если один элемент завершится с ошибкой?",
    "faq3A": "Элементы с ошибками помечаются значком ошибки и пропускаются. Остальные элементы продолжают обрабатываться в обычном режиме."
  }
}
```

- [ ] **Step 18: Add batch to `public/locales/ru/tools.json`**

```json
"batch": {
  "shortTitle": "Пакетный процессор",
  "title": "Пакетный процессор - Инструмент массовых операций | OmniKit",
  "description": "Применяйте одну операцию к нескольким входным данным одновременно. Пакетное кодирование, хеширование, сжатие и конвертация."
}
```

- [ ] **Step 19: Commit**

```bash
git add public/locales/
git commit -m "feat(batch): add i18n strings for all 10 locales"
```

---

## Task 12: Update categories.json for all locales

**Files:**

- Modify: `public/locales/en/categories.json:64-73`
- Modify: `public/locales/zh-CN/categories.json:64-74`
- Modify: 8 more `public/locales/*/categories.json`

- [ ] **Step 1: Update English `categories.json` workflows section**

Change `intro` from "1 workflow tool" to "2 workflow tools" and update the description:

```json
"workflows": {
  "title": "Data Pipeline & Workflow Tools - Recipe Builder, Batch Processor",
  "shortTitle": "Workflows",
  "description": "Free online data pipeline and workflow tools for developers. Chain operations into recipes, or apply a single step to multiple inputs with Batch Processor. 100% client-side.",
  "intro": "2 workflow tools: Recipe chains multiple operations into a data processing pipeline, and Batch Processor applies a single operation to many inputs at once. Both run entirely in your browser.",
  "faq1Q": "What is the Recipe tool?",
  "faq1A": "Recipe is a data pipeline builder that lets you chain multiple operations together. For example, you can Base64-encode text, then hash the result, then convert to uppercase — all in one flow.",
  "faq2Q": "What is Batch Processor?",
  "faq2A": "Batch Processor applies a single processing step — like hashing, encoding, or compression — to multiple inputs simultaneously. Paste text or drop files, pick a step, and get all results instantly."
}
```

- [ ] **Step 2: Update zh-CN `categories.json` workflows section**

```json
"workflows": {
  "title": "数据流水线与工作流工具 - Recipe 构建器, 批量处理器",
  "shortTitle": "工作流",
  "description": "免费在线数据流水线与工作流工具。将操作串联为 Recipe，或使用批量处理器将单个步骤应用于多个输入。100% 浏览器端运行。",
  "intro": "2 个工作流工具：Recipe 将多个操作串联为数据处理流水线，批量处理器将单个操作同时应用于多个输入。全部在浏览器中运行。",
  "faq1Q": "Recipe 工具是什么？",
  "faq1A": "Recipe 是一个数据流水线构建器，可以将多个操作串联在一起。例如，你可以先对文本进行 Base64 编码，然后哈希结果，再转换为大写——全部在一个流程中完成。",
  "faq2Q": "批量处理器是什么？",
  "faq2A": "批量处理器将单个处理步骤——如哈希、编码或压缩——同时应用于多个输入。粘贴文本或拖放文件，选择步骤，即可获得所有结果。"
}
```

- [ ] **Step 3: Update remaining 8 locales' categories.json**

Apply the same pattern (update title, description, intro, and add FAQ about Batch Processor) for: zh-TW, ja, ko, es, pt-BR, fr, de, ru. Each translation follows the same structure as English but in the respective language. The key changes are:

- `title`: Add "Batch Processor" (or translated name)
- `description`: Mention Batch Processor
- `intro`: Change "1 workflow tool" to "2 workflow tools" and describe both
- Update/add `faq2Q`/`faq2A` to describe Batch Processor

The engineer should read each locale's current `categories.json` and make analogous changes.

- [ ] **Step 4: Commit**

```bash
git add public/locales/*/categories.json
git commit -m "feat(batch): update categories.json for all locales"
```

---

## Task 13: Create batch UI components

**Files:**

- Create: `components/batch/step-selector.tsx`
- Create: `components/batch/input-panel.tsx`
- Create: `components/batch/result-item.tsx`
- Create: `components/batch/result-panel.tsx`
- Create: `components/batch/batch-summary.tsx`
- Create: `components/batch/progress-bar.tsx`

This is the largest task. Each component is created as a separate file. They share props interfaces defined inline.

- [ ] **Step 1: Create `components/batch/progress-bar.tsx`**

```tsx
"use client";

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-fg-muted">
        <span>
          {current}/{total} processed
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-border-default rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-cyan rounded-full transition-all duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/batch/step-selector.tsx`**

This component renders a dropdown to select a Recipe step, plus parameter controls. It reuses the same parameter rendering logic from `step-card.tsx:147-311` but inline (extraction into a shared component is deferred to keep scope manageable — the code is self-contained here).

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, X, Search } from "lucide-react";
import { Dialog, DialogPanel } from "@headlessui/react";
import dynamic from "next/dynamic";
import type { RecipeStepDef, StepParam } from "../../libs/recipe/types";
import type { DataType } from "../../libs/recipe/types";
import { STEP_CATEGORIES, searchSteps } from "../../libs/recipe/registry";
import { StyledInput, StyledSelect } from "../ui/input";
import { Button } from "../ui/button";

const Slider = dynamic(() => import("rc-slider"), {
  ssr: false,
  loading: () => <div className="h-6 w-full animate-pulse bg-bg-input rounded" />,
});

import "rc-slider/assets/index.css";

const CATEGORY_STYLES: Record<string, { dot: string }> = {
  encoding: { dot: "bg-blue-400" },
  crypto: { dot: "bg-amber-400" },
  text: { dot: "bg-emerald-400" },
  format: { dot: "bg-violet-400" },
  generators: { dot: "bg-rose-400" },
  visual: { dot: "bg-cyan-400" },
};

const OPTION_KEY_MAP: Record<string, string> = {
  "resizeMode.none": "options.none",
  "resizeMode.percent": "options.byPercent",
  "resizeMode.custom": "options.custom",
  "errorLevel.L": "options.lowL",
  "errorLevel.M": "options.mediumM",
  "errorLevel.Q": "options.quartileQ",
  "errorLevel.H": "options.highH",
  "indent.2": "options.indent2",
  "indent.4": "options.indent4",
  "indent.8": "options.indent8",
  "delimiter.,": "options.delimiterComma",
  "delimiter.;": "options.delimiterSemicolon",
  "delimiter.\\t": "options.delimiterTab",
  "version.v4": "options.uuidV4",
  "version.v7": "options.uuidV7",
  "size.300": "options.size300",
  "size.600": "options.size600",
  "size.1024": "options.size1024",
};

interface StepSelectorProps {
  selectedStep: RecipeStepDef | null;
  stepParams: Record<string, string>;
  onStepChange: (step: RecipeStepDef) => void;
  onParamsChange: (params: Record<string, string>) => void;
  inputType: DataType;
}

export default function StepSelector({
  selectedStep,
  stepParams,
  onStepChange,
  onParamsChange,
  inputType,
}: StepSelectorProps) {
  const t = useTranslations("batch");
  const tr = useTranslations("recipe");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");

  function handleParamChange(paramId: string, value: string) {
    onParamsChange({ ...stepParams, [paramId]: value });
  }

  function isBatchCompatible(step: RecipeStepDef): boolean {
    if (step.batch?.supported === false) return false;
    if (step.inputType === "none") return false;
    return step.inputType === inputType;
  }

  const allDefs = STEP_CATEGORIES.flatMap((c) => c.steps);
  const compatibleSteps = allDefs.filter(isBatchCompatible);
  const filtered = query.trim() ? searchSteps(query) : allDefs;

  function selectStep(def: RecipeStepDef) {
    const defaults: Record<string, string> = {};
    for (const p of def.parameters) {
      defaults[p.id] = p.defaultValue;
    }
    onParamsChange(defaults);
    onStepChange(def);
    setPickerOpen(false);
    setQuery("");
  }

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-fg-primary">{t("stepSelector.title")}</h3>
        {selectedStep && (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="text-xs text-accent-cyan hover:underline cursor-pointer"
          >
            {t("stepSelector.changeStep")}
          </button>
        )}
      </div>

      {!selectedStep ? (
        <Button variant="outline-cyan" size="sm" onClick={() => setPickerOpen(true)}>
          {t("stepSelector.placeholder")}
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-base">{selectedStep.icon}</span>
          <span className="text-sm font-medium text-fg-primary">
            {tr(`steps.${selectedStep.id}.name`)}
          </span>
        </div>
      )}

      {selectedStep && selectedStep.parameters.length > 0 && (
        <div className="space-y-2.5 border-t border-border-default/60 pt-3">
          <p className="text-[10px] font-medium text-fg-muted/60 uppercase tracking-wider">
            {t("stepSelector.params")}
          </p>
          {renderParams(selectedStep, stepParams, handleParamChange, tr)}
        </div>
      )}

      <Dialog open={pickerOpen} onClose={() => setPickerOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-lg max-h-[75vh] bg-bg-surface border border-border-default rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border-default">
              <Search size={16} className="text-fg-muted shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("stepSelector.placeholder")}
                className="flex-1 bg-transparent text-sm text-fg-primary placeholder:text-fg-muted outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="p-1 rounded-lg text-fg-muted hover:text-fg-secondary hover:bg-bg-elevated transition-all duration-200"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {STEP_CATEGORIES.map((cat) => {
                const catSteps = filtered.filter(
                  (s) => s.category === cat.id && compatibleSteps.some((c) => c.id === s.id)
                );
                if (catSteps.length === 0) return null;
                const catStyle = CATEGORY_STYLES[cat.id] ?? CATEGORY_STYLES.text;

                return (
                  <div key={cat.id} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                      <p className="text-[11px] font-semibold text-fg-muted uppercase tracking-widest">
                        {tr(`categories.${cat.id}`)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      {catSteps.map((def) => (
                        <button
                          key={def.id}
                          type="button"
                          onClick={() => selectStep(def)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all duration-200 hover:bg-bg-elevated text-fg-primary cursor-pointer"
                        >
                          <span className="text-base shrink-0">{def.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-[13px]">
                              {tr(`steps.${def.id}.name`)}
                            </p>
                            <p className="text-[11px] text-fg-muted truncate mt-0.5">
                              {tr(`steps.${def.id}.desc`)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}

function renderParams(
  def: RecipeStepDef,
  params: Record<string, string>,
  onChange: (id: string, value: string) => void,
  t: ReturnType<typeof useTranslations>
) {
  const visibleParams = def.parameters.filter((param) => {
    if (!param.dependsOn) return true;
    const depVal =
      params[param.dependsOn.paramId] ??
      def.parameters.find((p) => p.id === param.dependsOn!.paramId)?.defaultValue ??
      "";
    return param.dependsOn.values.includes(depVal);
  });

  type P = (typeof visibleParams)[number];
  const groups: P[][] = [];
  let buf: P[] = [];
  const flush = () => {
    if (buf.length > 0) {
      groups.push(buf);
      buf = [];
    }
  };
  for (const p of visibleParams) {
    if (p.type === "checkbox") buf.push(p);
    else {
      flush();
      groups.push([p]);
    }
  }
  flush();

  function renderCb(param: P) {
    const checked = (params[param.id] ?? param.defaultValue) === "true";
    const label = t.has(`params.${param.label}`) ? t(`params.${param.label}`) : param.label;
    return (
      <label key={param.id} className="flex items-center gap-2.5 cursor-pointer select-none group">
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          aria-label={label}
          onClick={() => onChange(param.id, checked ? "false" : "true")}
          className={`recipe-toggle relative h-[20px] w-[36px] rounded-full transition-colors duration-200 shrink-0 hover:shadow-[0_0_6px_var(--accent-cyan)] ${
            checked ? "bg-accent-cyan" : "bg-border-default hover:bg-fg-muted/40"
          }`}
        >
          <span
            className={`absolute top-[2px] left-[2px] h-[16px] w-[16px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
              checked ? "translate-x-[16px]" : "translate-x-0"
            }`}
          />
        </button>
        <span className="text-xs font-medium text-fg-secondary group-hover:text-fg-primary transition-colors">
          {label}
        </span>
      </label>
    );
  }

  return (
    <div className="space-y-2.5">
      {groups.flatMap((grp) => {
        if (grp.length >= 2 && grp.every((p) => p.type === "checkbox")) {
          return [<div className="grid grid-cols-2 gap-x-6 gap-y-1.5">{grp.map(renderCb)}</div>];
        }
        return grp.map((param) => {
          const label = t.has(`params.${param.label}`) ? t(`params.${param.label}`) : param.label;

          if (param.type === "select") {
            return (
              <StyledSelect
                key={param.id}
                label={label}
                value={params[param.id] ?? param.defaultValue}
                onChange={(e) => onChange(param.id, e.target.value)}
              >
                {param.options?.map((opt) => {
                  const key = OPTION_KEY_MAP[`${param.id}.${opt.value}`];
                  const optLabel = key && t.has(key) ? t(key) : opt.label;
                  return (
                    <option key={opt.value} value={opt.value}>
                      {optLabel}
                    </option>
                  );
                })}
              </StyledSelect>
            );
          }

          if (param.type === "checkbox") return renderCb(param);

          if (param.type === "slider") {
            const min = param.min ?? 0;
            const max = param.max ?? 100;
            const step = param.step ?? 1;
            const val = Number(params[param.id] ?? param.defaultValue) || min;
            return (
              <div key={param.id}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-fg-secondary">{label}</label>
                  <span className="font-mono text-xs font-bold text-accent-cyan">{val}</span>
                </div>
                <div className="px-1">
                  <Slider
                    min={min}
                    max={max}
                    step={step}
                    value={val}
                    onChange={(v) => onChange(param.id, String(typeof v === "number" ? v : v[0]))}
                    styles={{
                      rail: { backgroundColor: "var(--border-default)", height: 4 },
                      track: { backgroundColor: "var(--accent-cyan)", height: 4 },
                      handle: {
                        borderColor: "var(--accent-cyan)",
                        backgroundColor: "var(--bg-surface)",
                        height: 16,
                        width: 16,
                        marginLeft: -6,
                        marginTop: -6,
                        boxShadow: "0 0 4px var(--accent-cyan)",
                      },
                    }}
                  />
                </div>
              </div>
            );
          }

          return (
            <StyledInput
              key={param.id}
              label={label}
              value={params[param.id] ?? param.defaultValue}
              onChange={(e) => onChange(param.id, e.target.value)}
              placeholder={
                param.placeholder
                  ? t.has(`placeholders.${param.placeholder}`)
                    ? t(`placeholders.${param.placeholder}`)
                    : param.placeholder
                  : undefined
              }
            />
          );
        });
      })}
    </div>
  );
}
```

- [ ] **Step 3: Create `components/batch/input-panel.tsx`**

```tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, FileUp, ChevronDown, ChevronRight } from "lucide-react";
import type { BatchInputItem } from "../../libs/batch/types";
import { parseTextInput } from "../../libs/batch/input-parser";
import { useMultiFileDrop } from "../../hooks/use-multi-file-drop";
import { MAX_BATCH_ITEMS } from "../../libs/batch/engine";
import { Button } from "../ui/button";
import { StyledTextarea } from "../ui/input";

interface InputPanelProps {
  inputs: BatchInputItem[];
  onInputsChange: (inputs: BatchInputItem[]) => void;
  inputType: "text" | "image";
}

export default function InputPanel({ inputs, onInputsChange, inputType }: InputPanelProps) {
  const t = useTranslations("batch");
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePasteSubmit() {
    if (!pasteText.trim()) return;
    const newItems = parseTextInput(pasteText).slice(0, MAX_BATCH_ITEMS - inputs.length);
    onInputsChange([...inputs, ...newItems]);
    setPasteText("");
    setShowPaste(false);
  }

  function handleRemoveItem(id: string) {
    onInputsChange(inputs.filter((item) => item.id !== id));
  }

  function handleRemoveAll() {
    onInputsChange([]);
  }

  const handleFiles = useCallback(
    (files: File[]) => {
      const remaining = MAX_BATCH_ITEMS - inputs.length;
      const toProcess = files.slice(0, remaining);
      let loaded = 0;
      const newItems: BatchInputItem[] = [];

      toProcess.forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = () => {
            newItems.push({
              id: `batch-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              name: file.name,
              content: reader.result as string,
              type: "image",
              size: file.size,
            });
            loaded++;
            if (loaded === toProcess.length) {
              onInputsChange([...inputs, ...newItems]);
            }
          };
          reader.readAsDataURL(file);
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            newItems.push({
              id: `batch-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              name: file.name,
              content: reader.result as string,
              type: "text",
              size: file.size,
            });
            loaded++;
            if (loaded === toProcess.length) {
              onInputsChange([...inputs, ...newItems]);
            }
          };
          reader.readAsText(file);
        }
      });
    },
    [inputs, onInputsChange]
  );

  const { isDragging, onDragOver, onDragEnter, onDragLeave, onDrop } =
    useMultiFileDrop(handleFiles);

  return (
    <div
      className={`rounded-xl border bg-bg-surface transition-colors ${
        isDragging ? "border-accent-cyan bg-accent-cyan-dim/10" : "border-border-default"
      }`}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="text-sm font-semibold text-fg-primary">
          {t("inputPanel.title")}
          {inputs.length > 0 && (
            <span className="ml-2 text-xs font-normal text-fg-muted">
              {t("inputPanel.itemCount", { count: inputs.length })}
            </span>
          )}
        </h3>
        {inputs.length > 0 && (
          <button
            type="button"
            onClick={handleRemoveAll}
            className="text-xs text-danger hover:underline cursor-pointer"
          >
            {t("inputPanel.removeAll")}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 px-4 pb-3">
        {inputType === "text" && (
          <Button variant="outline-cyan" size="sm" onClick={() => setShowPaste(!showPaste)}>
            <Plus size={12} />
            {t("inputPanel.pasteText")}
          </Button>
        )}
        <Button variant="outline-cyan" size="sm" onClick={() => fileInputRef.current?.click()}>
          <FileUp size={12} />
          {t("inputPanel.dropFiles")}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length > 0) handleFiles(files);
            e.target.value = "";
          }}
        />
        {inputs.length >= MAX_BATCH_ITEMS && (
          <span className="text-xs text-danger">
            {t("inputPanel.maxItemsWarning", { max: MAX_BATCH_ITEMS })}
          </span>
        )}
      </div>

      {inputType === "text" && showPaste && (
        <div className="px-4 pb-3">
          <div
            className="flex items-center gap-1 mb-2 cursor-pointer text-xs text-fg-muted hover:text-fg-secondary"
            onClick={() => setShowPaste(false)}
          >
            <ChevronDown size={12} className="rotate-180" />
            <span>Close</span>
          </div>
          <StyledTextarea
            rows={4}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={t("inputPanel.pastePlaceholder")}
          />
          <div className="mt-2 flex justify-end">
            <Button variant="primary" size="sm" onClick={handlePasteSubmit}>
              {t("inputPanel.pasteText")}
            </Button>
          </div>
        </div>
      )}

      {inputs.length > 0 && (
        <div className="border-t border-border-default/60 max-h-64 overflow-y-auto">
          {inputs.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 px-4 py-2 border-b border-border-default/30 last:border-b-0 hover:bg-bg-elevated/50 transition-colors"
            >
              <span className="flex-1 text-sm text-fg-primary truncate min-w-0">{item.name}</span>
              <span className="text-[11px] text-fg-muted shrink-0">{formatSize(item.size)}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                className="p-1 rounded text-fg-muted/40 hover:text-danger hover:bg-red-500/10 transition-all duration-200 cursor-pointer shrink-0"
                aria-label={t("inputPanel.removeItem")}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-surface/80 rounded-xl pointer-events-none">
          <p className="text-sm text-accent-cyan font-medium">{t("inputPanel.dropFiles")}</p>
        </div>
      )}
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
```

- [ ] **Step 4: Create `components/batch/result-item.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, Download } from "lucide-react";
import type { BatchResultItem as BatchResultItemType } from "../../libs/batch/types";
import type { DataType } from "../../libs/recipe/types";
import { CopyButton } from "../ui/copy-btn";

interface ResultItemProps {
  item: BatchResultItemType;
  inputName: string;
  outputType: DataType;
}

export default function ResultItem({ item, inputName, outputType }: ResultItemProps) {
  const t = useTranslations("recipe");

  if (item.status === "error") {
    return (
      <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/5 border border-danger/20">
        <AlertCircle size={13} className="text-danger shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-fg-secondary truncate">{inputName}</p>
          <p className="text-xs text-danger mt-0.5">
            {t.has(`errors.${item.error}`) ? t(`errors.${item.error}`) : item.error}
          </p>
        </div>
      </div>
    );
  }

  const output = item.output ?? "";

  if (outputType === "image" && output.startsWith("data:")) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-default/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={output} alt={inputName} className="max-h-10 rounded object-contain shrink-0" />
        <span className="flex-1 text-sm text-fg-primary truncate min-w-0">{inputName}</span>
        <button
          type="button"
          onClick={() => {
            const a = document.createElement("a");
            a.href = output;
            a.download = `${inputName}`;
            a.click();
          }}
          className="p-1.5 rounded-lg text-fg-muted hover:text-accent-cyan hover:bg-accent-cyan-dim/30 transition-all cursor-pointer"
          aria-label={t("output")}
        >
          <Download size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-default/50">
      <pre className="flex-1 text-xs font-mono text-fg-primary truncate min-w-0">
        {output.length > 500 ? output.slice(0, 500) + "..." : output}
      </pre>
      <CopyButton getContent={() => output} className="shrink-0" />
    </div>
  );
}
```

- [ ] **Step 5: Create `components/batch/result-panel.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Download, FileArchive } from "lucide-react";
import type { BatchResultItem, BatchInputItem } from "../../libs/batch/types";
import type { DataType } from "../../libs/recipe/types";
import { CopyButton } from "../ui/copy-btn";
import { Button } from "../ui/button";
import ResultItem from "./result-item";
import { mergeTextResults, createZipFromResults, downloadBlob } from "../../libs/batch/output";

interface ResultPanelProps {
  results: BatchResultItem[];
  inputs: BatchInputItem[];
  outputType: DataType;
  filenameTemplate: string;
}

export default function ResultPanel({
  results,
  inputs,
  outputType,
  filenameTemplate,
}: ResultPanelProps) {
  const t = useTranslations("batch");
  const successCount = results.filter((r) => r.status === "success").length;

  async function handleDownloadZip() {
    const blob = await createZipFromResults(results, filenameTemplate, inputs);
    downloadBlob(blob, "batch-output.zip");
  }

  function handleDownloadText() {
    const text = mergeTextResults(results);
    const blob = new Blob([text], { type: "text/plain" });
    downloadBlob(blob, "batch-output.txt");
  }

  function handleCopyAll() {
    const text = mergeTextResults(results);
    if (text) {
      navigator.clipboard.writeText(text);
    }
  }

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface">
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="text-sm font-semibold text-fg-primary">
          {t("resultPanel.title")}
          {results.length > 0 && (
            <span className="ml-2 text-xs font-normal text-fg-muted">
              {successCount}/{results.length}
            </span>
          )}
        </h3>
        {successCount > 0 && (
          <div className="flex items-center gap-2">
            {outputType === "text" && (
              <>
                <CopyButton
                  getContent={() => mergeTextResults(results)}
                  label={t("resultPanel.copyAll")}
                  toast={false}
                />
                <Button variant="secondary" size="sm" onClick={handleDownloadText}>
                  <Download size={12} />
                  {t("resultPanel.downloadAll")}
                </Button>
              </>
            )}
            {outputType === "image" && (
              <Button variant="secondary" size="sm" onClick={handleDownloadZip}>
                <FileArchive size={12} />
                {t("resultPanel.downloadZip")}
              </Button>
            )}
          </div>
        )}
      </div>

      {results.length === 0 ? (
        <div className="px-4 pb-4">
          <p className="text-xs text-fg-muted">{t("resultPanel.noResults")}</p>
        </div>
      ) : (
        <div className="px-4 pb-4 space-y-1.5">
          {results.map((result) => {
            const input = inputs.find((i) => i.id === result.id);
            return (
              <ResultItem
                key={result.id}
                item={result}
                inputName={input?.name ?? ""}
                outputType={outputType}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create `components/batch/batch-summary.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";
import type { BatchResultItem, BatchInputItem } from "../../libs/batch/types";
import type { DataType } from "../../libs/recipe/types";

interface BatchSummaryProps {
  results: BatchResultItem[];
  inputs: BatchInputItem[];
  outputType: DataType;
  duration: number;
}

export default function BatchSummary({ results, inputs, outputType, duration }: BatchSummaryProps) {
  const t = useTranslations("batch");

  if (results.length === 0) return null;

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;
  const timeStr = (duration / 1000).toFixed(1);

  const totalSaved =
    outputType === "image" && successCount > 0 ? computeSavings(results, inputs) : null;

  return (
    <div className="mt-3 flex items-center gap-4 text-xs text-fg-muted">
      <span className="text-fg-secondary font-medium">
        {t("summary.success", { success: successCount, total: results.length })}
      </span>
      {errorCount > 0 && (
        <span className="text-danger">{t("summary.errors", { errors: errorCount })}</span>
      )}
      <span>{t("summary.duration", { time: timeStr })}</span>
      {totalSaved && (
        <span className="text-accent-cyan">
          {t("summary.totalSaved", {
            before: formatSize(totalSaved.before),
            after: formatSize(totalSaved.after),
            percent: totalSaved.percent,
          })}
        </span>
      )}
    </div>
  );
}

function computeSavings(
  results: BatchResultItem[],
  inputs: BatchInputItem[]
): { before: number; after: number; percent: number } | null {
  let before = 0;
  let after = 0;
  for (const r of results) {
    if (r.status !== "success" || !r.output) continue;
    const input = inputs.find((i) => i.id === r.id);
    if (!input) continue;
    before += input.size;
    if (r.output.startsWith("data:")) {
      const base64 = r.output.split(",")[1] ?? "";
      after += Math.ceil((base64.length * 3) / 4);
    } else {
      after += new TextEncoder().encode(r.output).byteLength;
    }
  }
  if (before === 0) return null;
  return { before, after, percent: Math.round(((before - after) / before) * 100) };
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
```

- [ ] **Step 7: Commit**

```bash
git add components/batch/
git commit -m "feat(batch): add batch UI components"
```

---

## Task 14: Create batch page route and page component

**Files:**

- Create: `app/[locale]/batch/page.tsx`
- Create: `app/[locale]/batch/batch-page.tsx`

- [ ] **Step 1: Create `app/[locale]/batch/page.tsx`**

Following the exact same pattern as `app/[locale]/recipe/page.tsx`:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import BatchPage from "./batch-page";
import "../../../libs/recipe/steps/index";

const PATH = "/batch";
const TOOL_KEY = "batch";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("batch.title"),
    description: t("batch.description"),
    ogImage: { type: "tool", key: TOOL_KEY },
  });
}

export default async function BatchRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const schemas = buildToolSchemas({
    name: t("batch.title"),
    description: t("batch.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems: [],
    howToSteps: [],
    sameAs: tool.sameAs,
  });

  return (
    <>
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
      <BatchPage />
    </>
  );
}
```

- [ ] **Step 2: Create `app/[locale]/batch/batch-page.tsx`**

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import PrivacyBanner from "../../../components/privacy-banner";
import DescriptionSection from "../../../components/description-section";
import StepSelector from "../../../components/batch/step-selector";
import InputPanel from "../../../components/batch/input-panel";
import ResultPanel from "../../../components/batch/result-panel";
import BatchSummary from "../../../components/batch/batch-summary";
import ProgressBar from "../../../components/batch/progress-bar";
import type {
  BatchInputItem,
  BatchResultItem,
  BatchConfig,
  BatchStatus,
  BatchAbortSignal,
} from "../../../libs/batch/types";
import type { RecipeStepDef, DataType } from "../../../libs/recipe/types";
import { executeBatch, MAX_BATCH_ITEMS } from "../../../libs/batch/engine";
import "../../../libs/recipe/steps/index";

export default function BatchPage() {
  const t = useTranslations("tools");
  const [selectedStep, setSelectedStep] = useState<RecipeStepDef | null>(null);
  const [stepParams, setStepParams] = useState<Record<string, string>>({});
  const [inputs, setInputs] = useState<BatchInputItem[]>([]);
  const [results, setResults] = useState<BatchResultItem[]>([]);
  const [status, setStatus] = useState<BatchStatus>("idle");
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const startTimeRef = useRef(0);
  const [duration, setDuration] = useState(0);

  const config: BatchConfig | null = selectedStep ? { stepId: selectedStep.id, stepParams } : null;

  const inputType: DataType = selectedStep?.inputType ?? "text";
  const outputType: DataType = selectedStep?.outputType ?? "text";

  useEffect(() => {
    if (!config || inputs.length === 0) {
      setStatus("idle");
      setResults([]);
      return;
    }

    const signal: BatchAbortSignal = { cancelled: false };
    let cancelled = false;
    startTimeRef.current = performance.now();

    async function run() {
      if (signal.cancelled) return;
      setStatus("running");
      setProgress({ completed: 0, total: inputs.length });

      const batchResults = await executeBatch(
        config,
        inputs,
        (completed, total) => {
          if (!cancelled) setProgress({ completed, total });
        },
        signal
      );

      if (cancelled) return;
      setResults(batchResults);
      setDuration(performance.now() - startTimeRef.current);
      const allSuccess =
        batchResults.length > 0 && batchResults.every((r) => r.status === "success");
      setStatus(allSuccess ? "done" : "partial-error");
    }

    const timer = setTimeout(run, 300);

    return () => {
      clearTimeout(timer);
      cancelled = true;
      signal.cancelled = true;
    };
  }, [inputs, config]);

  const filenameTemplate = selectedStep?.batch?.outputFilenameTemplate ?? "{name}_output";

  return (
    <Layout
      title={t("batch.shortTitle")}
      categoryLabel={t("categories.workflows")}
      categorySlug="workflows"
    >
      <div className="min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <PrivacyBanner />
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5 space-y-5">
              <StepSelector
                selectedStep={selectedStep}
                stepParams={stepParams}
                onStepChange={setSelectedStep}
                onParamsChange={setStepParams}
                inputType={inputType}
              />
              <InputPanel
                inputs={inputs}
                onInputsChange={setInputs}
                inputType={inputType === "image" ? "image" : "text"}
              />
            </div>
            <div className="lg:col-span-7 lg:sticky lg:top-16 lg:self-start mt-5 lg:mt-0 space-y-3">
              {status === "running" && (
                <ProgressBar current={progress.completed} total={progress.total} />
              )}
              <ResultPanel
                results={results}
                inputs={inputs}
                outputType={outputType}
                filenameTemplate={filenameTemplate}
              />
              <BatchSummary
                results={results}
                inputs={inputs}
                outputType={outputType}
                duration={duration}
              />
            </div>
          </div>
          <DescriptionSection namespace="batch" />
        </div>
      </div>
    </Layout>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/batch/
git commit -m "feat(batch): add batch page route and page component"
```

---

## Task 15: Verify build and tests

- [ ] **Step 1: Run all batch tests**

Run: `npx vitest run libs/batch`
Expected: All tests PASS

- [ ] **Step 2: Run full test suite**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 3: Run linting**

Run: `npx eslint libs/batch/ components/batch/ app/\[locale\]/batch/ --ext .ts,.tsx`
Expected: No errors

- [ ] **Step 4: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 5: Verify dev server starts**

Run: `npm run dev` (then Ctrl+C after it compiles)
Expected: Compiles successfully, `/batch` route accessible
