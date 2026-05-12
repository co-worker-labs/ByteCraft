# Recipe System — Part 1: Core Engine

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the pure-logic layer for the Recipe pipeline system — types, engine, registry, compatibility checks, and localStorage persistence.

**Architecture:** The engine is a pure async function that takes input + step instances + step definitions and returns a `PipelineResult`. The registry is a `Map<string, RecipeStepDef>` populated from step definition files (added in Part 2). Storage wraps localStorage for recipe CRUD and draft consumption. No React, no UI.

**Tech Stack:** TypeScript, Vitest, fuzzysort

**Depends on:** Nothing — this is the foundation.

**Produces:** Testable, importable modules: `libs/recipe/types.ts`, `libs/recipe/engine.ts`, `libs/recipe/registry.ts`, `libs/recipe/storage.ts`, `libs/storage-keys.ts` updates, `vitest.config.ts` updates.

---

## File Structure

| Action | File                                     | Responsibility                                                                                                           |
| ------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Create | `libs/recipe/types.ts`                   | All shared types (DataType, StepResult, RecipeStepDef, RecipeStepInstance, Recipe, StepParam, StepCategory, RecipeDraft) |
| Create | `libs/recipe/engine.ts`                  | `executePipeline`, `isCompatible`, `getPipelineInputType`, `PipelineResult`, `StepOutput`                                |
| Create | `libs/recipe/registry.ts`                | `STEP_REGISTRY`, `STEP_CATEGORIES`, `getStep`, `searchSteps`, `getCompatibleSteps`, `registerSteps`                      |
| Create | `libs/recipe/storage.ts`                 | `listRecipes`, `getRecipe`, `saveRecipe`, `deleteRecipe`, `consumeDraft`                                                 |
| Create | `libs/recipe/__tests__/engine.test.ts`   | Engine + compat tests                                                                                                    |
| Create | `libs/recipe/__tests__/registry.test.ts` | Registry + search tests                                                                                                  |
| Create | `libs/recipe/__tests__/storage.test.ts`  | Storage CRUD + draft tests                                                                                               |
| Create | `libs/recipe/__tests__/compat.test.ts`   | `isCompatible` all combinations                                                                                          |
| Modify | `libs/storage-keys.ts`                   | Add `recipeList` and `recipeDraft` keys                                                                                  |
| Modify | `vitest.config.ts`                       | Add recipe test scope                                                                                                    |

---

### Task 1: Types

**Files:**

- Create: `libs/recipe/types.ts`

- [ ] **Step 1: Write the types file**

```ts
export type DataType = "text" | "image" | "none";

export type StepResult = { ok: true; output: string } | { ok: false; error: string };

export interface StepParam {
  id: string;
  type: "text" | "select";
  label: string;
  defaultValue: string;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export type StepCategory = "encoding" | "crypto" | "text" | "format" | "generators" | "visual";

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
}

export interface RecipeStepInstance {
  stepId: string;
  params: Record<string, string>;
  enabled: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  steps: RecipeStepInstance[];
  createdAt: number;
  updatedAt: number;
}

export interface RecipeDraft {
  input: string;
  stepId: string;
  params: Record<string, string>;
  sourceTool: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add libs/recipe/types.ts
git commit -m "feat(recipe): add core types for recipe pipeline system"
```

---

### Task 2: Pipeline Engine

**Files:**

- Create: `libs/recipe/engine.ts`
- Create: `libs/recipe/__tests__/compat.test.ts`
- Create: `libs/recipe/__tests__/engine.test.ts`

- [ ] **Step 1: Write compat tests**

```ts
import { describe, it, expect } from "vitest";
import { isCompatible } from "../engine";
import type { RecipeStepDef } from "../types";

function makeStep(inputType: string, outputType: string): RecipeStepDef {
  return {
    id: "test-step",
    name: "Test",
    category: "text",
    icon: "Type",
    description: "test",
    inputType: inputType as any,
    outputType: outputType as any,
    parameters: [],
    execute: async () => ({ ok: true, output: "" }),
  };
}

describe("isCompatible", () => {
  it("allows text→text steps at any position", () => {
    const step = makeStep("text", "text");
    expect(isCompatible("text", step)).toBe(true);
  });

  it("allows image→image steps when prev output is image", () => {
    const step = makeStep("image", "image");
    expect(isCompatible("image", step)).toBe(true);
  });

  it("rejects image→image when prev output is text", () => {
    const step = makeStep("image", "image");
    expect(isCompatible("text", step)).toBe(false);
  });

  it("rejects text step when prev output is image", () => {
    const step = makeStep("text", "text");
    expect(isCompatible("image", step)).toBe(false);
  });

  it("rejects source steps (inputType=none) regardless of prev output", () => {
    const step = makeStep("none", "text");
    expect(isCompatible(null, step)).toBe(false);
    expect(isCompatible("text", step)).toBe(false);
    expect(isCompatible("image", step)).toBe(false);
  });

  it("allows any non-source step when prevOutputType is null (first position)", () => {
    const textStep = makeStep("text", "text");
    const imageStep = makeStep("image", "image");
    expect(isCompatible(null, textStep)).toBe(true);
    expect(isCompatible(null, imageStep)).toBe(true);
  });

  it("allows text→image step when prev output is text", () => {
    const step = makeStep("text", "image");
    expect(isCompatible("text", step)).toBe(true);
  });

  it("rejects text→image step when prev output is image", () => {
    const step = makeStep("text", "image");
    expect(isCompatible("image", step)).toBe(false);
  });
});
```

- [ ] **Step 2: Run compat tests to verify they fail**

Run: `npx vitest run libs/recipe/__tests__/compat.test.ts`
Expected: FAIL — `../engine` does not exist

- [ ] **Step 3: Write the engine**

```ts
import type { DataType, RecipeStepDef, RecipeStepInstance, StepOutput, StepResult } from "./types";

export interface PipelineResult {
  steps: StepOutput[];
  finalOutput: string | null;
  errorStepIndex: number | null;
}

export { type StepOutput, type StepResult };

export function isCompatible(prevOutputType: DataType | null, nextStep: RecipeStepDef): boolean {
  if (nextStep.inputType === "none") return false;
  if (prevOutputType === null) return true;
  return prevOutputType === nextStep.inputType;
}

export function getPipelineInputType(
  steps: RecipeStepInstance[],
  stepDefs: Map<string, RecipeStepDef>
): DataType {
  if (steps.length === 0) return "text";
  const first = stepDefs.get(steps[0].stepId);
  if (!first) return "text";
  if (first.inputType === "none") {
    if (steps.length > 1) {
      const second = stepDefs.get(steps[1].stepId);
      return second?.inputType ?? "text";
    }
    return "text";
  }
  return first.inputType;
}

export async function executePipeline(
  input: string | null,
  steps: RecipeStepInstance[],
  stepDefs: Map<string, RecipeStepDef>
): Promise<PipelineResult> {
  if (steps.length === 0) {
    return { steps: [], finalOutput: input ?? null, errorStepIndex: null };
  }

  const outputs: StepOutput[] = [];
  let currentInput: string = input ?? "";
  let lastOutputType: DataType | null = input !== null ? "text" : null;

  for (let i = 0; i < steps.length; i++) {
    const instance = steps[i];
    if (!instance.enabled) continue;

    const def = stepDefs.get(instance.stepId);
    if (!def) {
      return {
        steps: outputs,
        finalOutput: null,
        errorStepIndex: i,
      };
    }

    const stepInput = i === 0 && def.inputType === "none" ? "" : currentInput;

    const result = await def.execute(stepInput, instance.params);
    outputs.push({ input: stepInput, result });

    if (!result.ok) {
      return { steps: outputs, finalOutput: null, errorStepIndex: i };
    }

    currentInput = result.output;
    lastOutputType = def.outputType;
  }

  return { steps: outputs, finalOutput: currentInput, errorStepIndex: null };
}
```

- [ ] **Step 4: Run compat tests to verify they pass**

Run: `npx vitest run libs/recipe/__tests__/compat.test.ts`
Expected: PASS (all 8 tests)

- [ ] **Step 5: Write engine tests**

```ts
import { describe, it, expect } from "vitest";
import { executePipeline, getPipelineInputType } from "../engine";
import type { RecipeStepDef, RecipeStepInstance, StepResult } from "../types";

function makeDef(
  id: string,
  executeFn: (input: string, params: Record<string, string>) => Promise<StepResult>,
  inputType: "text" | "image" | "none" = "text",
  outputType: "text" | "image" | "none" = "text"
): RecipeStepDef {
  return {
    id,
    name: id,
    category: "text",
    icon: "Type",
    description: id,
    inputType,
    outputType,
    parameters: [],
    execute: executeFn,
  };
}

function makeInstance(
  stepId: string,
  params: Record<string, string> = {},
  enabled = true
): RecipeStepInstance {
  return { stepId, params, enabled };
}

const upperDef = makeDef("upper", async (input) => ({
  ok: true,
  output: input.toUpperCase(),
}));

const reverseDef = makeDef("reverse", async (input) => ({
  ok: true,
  output: input.split("").reverse().join(""),
}));

const failDef = makeDef("fail", async () => ({
  ok: false,
  error: "intentional failure",
}));

const sourceDef = makeDef(
  "source",
  async () => ({ ok: true, output: "generated-data" }),
  "none",
  "text"
);

function buildDefs(...defs: RecipeStepDef[]): Map<string, RecipeStepDef> {
  return new Map(defs.map((d) => [d.id, d]));
}

describe("executePipeline", () => {
  it("returns passthrough for empty pipeline with input", async () => {
    const result = await executePipeline("hello", [], new Map());
    expect(result.finalOutput).toBe("hello");
    expect(result.steps).toEqual([]);
    expect(result.errorStepIndex).toBeNull();
  });

  it("returns null output for empty pipeline with null input", async () => {
    const result = await executePipeline(null, [], new Map());
    expect(result.finalOutput).toBeNull();
  });

  it("executes a single step", async () => {
    const defs = buildDefs(upperDef);
    const steps = [makeInstance("upper")];
    const result = await executePipeline("hello", steps, defs);
    expect(result.finalOutput).toBe("HELLO");
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].input).toBe("hello");
  });

  it("chains two steps", async () => {
    const defs = buildDefs(upperDef, reverseDef);
    const steps = [makeInstance("upper"), makeInstance("reverse")];
    const result = await executePipeline("abc", steps, defs);
    expect(result.finalOutput).toBe("CBA");
    expect(result.steps).toHaveLength(2);
    expect(result.steps[1].input).toBe("ABC");
  });

  it("stops at first error", async () => {
    const defs = buildDefs(upperDef, failDef, reverseDef);
    const steps = [makeInstance("upper"), makeInstance("fail"), makeInstance("reverse")];
    const result = await executePipeline("hi", steps, defs);
    expect(result.errorStepIndex).toBe(1);
    expect(result.finalOutput).toBeNull();
    expect(result.steps).toHaveLength(2);
    expect(result.steps[1].result.ok).toBe(false);
  });

  it("skips disabled steps", async () => {
    const defs = buildDefs(upperDef, reverseDef);
    const steps = [makeInstance("upper"), makeInstance("reverse", {}, false)];
    const result = await executePipeline("abc", steps, defs);
    expect(result.finalOutput).toBe("ABC");
    expect(result.steps).toHaveLength(1);
  });

  it("handles source step at position 0", async () => {
    const defs = buildDefs(sourceDef, upperDef);
    const steps = [makeInstance("source"), makeInstance("upper")];
    const result = await executePipeline(null, steps, defs);
    expect(result.finalOutput).toBe("GENERATED-DATA");
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].input).toBe("");
  });

  it("returns error for unknown step definition", async () => {
    const steps = [makeInstance("nonexistent")];
    const result = await executePipeline("hi", steps, new Map());
    expect(result.errorStepIndex).toBe(0);
    expect(result.finalOutput).toBeNull();
  });

  it("passes null input as empty string when first step is not a source", async () => {
    const defs = buildDefs(upperDef);
    const steps = [makeInstance("upper")];
    const result = await executePipeline(null, steps, defs);
    expect(result.finalOutput).toBe("");
    expect(result.steps[0].input).toBe("");
  });
});

describe("getPipelineInputType", () => {
  it("defaults to text for empty pipeline", () => {
    expect(getPipelineInputType([], new Map())).toBe("text");
  });

  it("returns inputType of first step", () => {
    const defs = buildDefs(upperDef);
    const steps = [makeInstance("upper")];
    expect(getPipelineInputType(steps, defs)).toBe("text");
  });

  it("looks at second step when first is source", () => {
    const defs = buildDefs(sourceDef, upperDef);
    const steps = [makeInstance("source"), makeInstance("upper")];
    expect(getPipelineInputType(steps, defs)).toBe("text");
  });

  it("returns text when only source steps exist", () => {
    const defs = buildDefs(sourceDef);
    const steps = [makeInstance("source")];
    expect(getPipelineInputType(steps, defs)).toBe("text");
  });
});
```

- [ ] **Step 6: Run engine tests**

Run: `npx vitest run libs/recipe/__tests__/engine.test.ts`
Expected: PASS (all tests)

- [ ] **Step 7: Commit**

```bash
git add libs/recipe/engine.ts libs/recipe/__tests__/compat.test.ts libs/recipe/__tests__/engine.test.ts
git commit -m "feat(recipe): add pipeline engine with compat checks and tests"
```

---

### Task 3: Step Registry

**Files:**

- Create: `libs/recipe/registry.ts`
- Create: `libs/recipe/__tests__/registry.test.ts`

- [ ] **Step 1: Write registry tests**

```ts
import { describe, it, expect } from "vitest";
import {
  STEP_REGISTRY,
  STEP_CATEGORIES,
  getStep,
  registerSteps,
  searchSteps,
  getCompatibleSteps,
} from "../registry";
import type { RecipeStepDef } from "../types";
import { isCompatible } from "../engine";

function makeDef(
  id: string,
  category: any,
  inputType: any = "text",
  outputType: any = "text"
): RecipeStepDef {
  return {
    id,
    name: id,
    category,
    icon: "Type",
    description: `Description for ${id}`,
    inputType,
    outputType,
    parameters: [],
    execute: async () => ({ ok: true, output: "" }),
  };
}

describe("registry", () => {
  const testDefs = [
    makeDef("base64-encode", "encoding"),
    makeDef("base64-decode", "encoding"),
    makeDef("hash-sha256", "crypto"),
    makeDef("password-gen", "crypto", "none", "text"),
    makeDef("text-camel", "text"),
    makeDef("json-format", "format"),
    makeDef("uuid-gen", "generators", "none", "text"),
    makeDef("qrcode-gen", "generators", "text", "image"),
    makeDef("image-compress", "visual", "image", "image"),
  ];

  it("registers steps and makes them available via getStep", () => {
    registerSteps(testDefs);
    expect(getStep("base64-encode")).toBeDefined();
    expect(getStep("base64-encode")!.id).toBe("base64-encode");
    expect(getStep("nonexistent")).toBeUndefined();
  });

  it("groups steps by category", () => {
    registerSteps(testDefs);
    const cat = STEP_CATEGORIES.find((c) => c.id === "encoding");
    expect(cat).toBeDefined();
    expect(cat!.steps.length).toBeGreaterThanOrEqual(2);
    const catCrypto = STEP_CATEGORIES.find((c) => c.id === "crypto");
    expect(catCrypto).toBeDefined();
  });

  it("searches steps by name", () => {
    registerSteps(testDefs);
    const results = searchSteps("base64");
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(
      results.every((r) => r.name.includes("base64") || r.description.includes("base64"))
    ).toBe(true);
  });

  it("returns all steps for empty query", () => {
    registerSteps(testDefs);
    const results = searchSteps("");
    expect(results.length).toBe(testDefs.length);
  });

  it("getCompatibleSteps filters by position", () => {
    registerSteps(testDefs);
    const allDefs = Array.from(STEP_REGISTRY.values());
    const pos0 = getCompatibleSteps(0, null, allDefs);
    expect(pos0.some((s) => s.id === "password-gen")).toBe(true);
    expect(pos0.some((s) => s.id === "base64-encode")).toBe(true);
  });

  it("getCompatibleSteps filters by output type for position > 0", () => {
    registerSteps(testDefs);
    const allDefs = Array.from(STEP_REGISTRY.values());
    const afterText = getCompatibleSteps(1, "text", allDefs);
    expect(afterText.some((s) => s.id === "base64-encode")).toBe(true);
    expect(afterText.some((s) => s.id === "image-compress")).toBe(false);
    expect(afterText.some((s) => s.id === "password-gen")).toBe(false);
  });

  it("getCompatibleSteps for image output allows image steps", () => {
    registerSteps(testDefs);
    const allDefs = Array.from(STEP_REGISTRY.values());
    const afterImage = getCompatibleSteps(1, "image", allDefs);
    expect(afterImage.some((s) => s.id === "image-compress")).toBe(true);
    expect(afterImage.some((s) => s.id === "base64-encode")).toBe(false);
  });
});
```

- [ ] **Step 2: Run registry tests to verify they fail**

Run: `npx vitest run libs/recipe/__tests__/registry.test.ts`
Expected: FAIL — `../registry` does not exist

- [ ] **Step 3: Write the registry**

```ts
import fuzzysort from "fuzzysort";
import type { RecipeStepDef, StepCategory, DataType } from "./types";
import { isCompatible } from "./engine";

export const STEP_REGISTRY: Map<string, RecipeStepDef> = new Map();

export interface StepCategoryGroup {
  id: StepCategory;
  label: string;
  steps: RecipeStepDef[];
}

const CATEGORY_ORDER: StepCategory[] = [
  "encoding",
  "crypto",
  "text",
  "format",
  "generators",
  "visual",
];

const CATEGORY_LABELS: Record<StepCategory, string> = {
  encoding: "Encoding",
  crypto: "Crypto",
  text: "Text",
  format: "Format",
  generators: "Generators",
  visual: "Visual",
};

export let STEP_CATEGORIES: StepCategoryGroup[] = [];

export function registerSteps(defs: RecipeStepDef[]): void {
  for (const def of defs) {
    STEP_REGISTRY.set(def.id, def);
  }
  STEP_CATEGORIES = CATEGORY_ORDER.map((id) => ({
    id,
    label: CATEGORY_LABELS[id],
    steps: defs.filter((d) => d.category === id),
  })).filter((c) => c.steps.length > 0);
}

export function getStep(id: string): RecipeStepDef | undefined {
  return STEP_REGISTRY.get(id);
}

export function searchSteps(query: string): RecipeStepDef[] {
  const allSteps = Array.from(STEP_REGISTRY.values());
  if (!query.trim()) return allSteps;
  const results = fuzzysort.go(query, allSteps, {
    keys: ["name", "description", "id"],
    scoreFn: (r) => {
      const nameScore = r[0]?.score ?? 0;
      const descScore = r[1]?.score ?? 0;
      const idScore = r[2]?.score ?? 0;
      return Math.max(nameScore * 2, descScore, idScore);
    },
  });
  return results.map((r) => r.obj);
}

export function getCompatibleSteps(
  insertPosition: number,
  previousOutputType: DataType | null,
  allSteps: RecipeStepDef[]
): RecipeStepDef[] {
  return allSteps.filter((step) => {
    if (insertPosition === 0) {
      if (previousOutputType === null) return true;
    }
    return isCompatible(previousOutputType, step);
  });
}
```

- [ ] **Step 4: Run registry tests**

Run: `npx vitest run libs/recipe/__tests__/registry.test.ts`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add libs/recipe/registry.ts libs/recipe/__tests__/registry.test.ts
git commit -m "feat(recipe): add step registry with fuzzy search and compat filtering"
```

---

### Task 4: Storage

**Files:**

- Create: `libs/recipe/storage.ts`
- Create: `libs/recipe/__tests__/storage.test.ts`
- Modify: `libs/storage-keys.ts`

- [ ] **Step 1: Update storage-keys.ts**

Add two new keys to the `STORAGE_KEYS` object:

```ts
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
  sshkeyDeployTarget: "okrun:sshkey:deploy",
  httpclientHistory: "okrun:httpclient:history",
  walletSelectedChains: "okrun:wallet:chains",
  onboardingClearClipboard: "okrun:onboarding:clear-clipboard",
  recipeList: "okrun:recipe:list",
  recipeDraft: "okrun:recipe:draft",
} as const;
```

- [ ] **Step 2: Write storage tests**

Storage tests need to mock `localStorage`. Vitest in node environment doesn't have `localStorage`, so we use `vi.stubGlobal` or a manual mock.

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { listRecipes, getRecipe, saveRecipe, deleteRecipe, consumeDraft } from "../storage";
import type { Recipe, RecipeDraft } from "../types";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

beforeEach(() => {
  localStorageMock.clear();
  vi.stubGlobal("localStorage", localStorageMock);
});

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "test-id",
    name: "Test Recipe",
    steps: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe("storage", () => {
  describe("listRecipes", () => {
    it("returns empty array when no recipes exist", () => {
      expect(listRecipes()).toEqual([]);
    });

    it("returns saved recipes", () => {
      const recipe = makeRecipe();
      saveRecipe(recipe);
      const list = listRecipes();
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe("test-id");
    });
  });

  describe("getRecipe", () => {
    it("returns undefined for nonexistent recipe", () => {
      expect(getRecipe("nonexistent")).toBeUndefined();
    });

    it("returns recipe by id", () => {
      const recipe = makeRecipe();
      saveRecipe(recipe);
      expect(getRecipe("test-id")).toEqual(recipe);
    });
  });

  describe("saveRecipe", () => {
    it("adds a new recipe", () => {
      saveRecipe(makeRecipe());
      expect(listRecipes()).toHaveLength(1);
    });

    it("updates existing recipe by id", () => {
      saveRecipe(makeRecipe());
      saveRecipe(makeRecipe({ name: "Updated" }));
      const list = listRecipes();
      expect(list).toHaveLength(1);
      expect(list[0].name).toBe("Updated");
    });
  });

  describe("deleteRecipe", () => {
    it("removes a recipe", () => {
      saveRecipe(makeRecipe());
      deleteRecipe("test-id");
      expect(listRecipes()).toHaveLength(0);
    });

    it("does nothing for nonexistent recipe", () => {
      deleteRecipe("nonexistent");
      expect(listRecipes()).toHaveLength(0);
    });
  });

  describe("consumeDraft", () => {
    it("returns null when no draft exists", () => {
      expect(consumeDraft()).toBeNull();
    });

    it("returns and clears draft", () => {
      const draft: RecipeDraft = {
        input: "test input",
        stepId: "base64-encode",
        params: {},
        sourceTool: "/base64",
      };
      localStorage.setItem("okrun:recipe:draft", JSON.stringify(draft));
      const consumed = consumeDraft();
      expect(consumed).toEqual(draft);
      expect(consumeDraft()).toBeNull();
    });
  });
});
```

- [ ] **Step 3: Run storage tests to verify they fail**

Run: `npx vitest run libs/recipe/__tests__/storage.test.ts`
Expected: FAIL — `../storage` does not exist

- [ ] **Step 4: Write the storage module**

```ts
import type { Recipe, RecipeDraft } from "./types";
import { STORAGE_KEYS } from "../storage-keys";

const LIST_KEY = STORAGE_KEYS.recipeList;
const DRAFT_KEY = STORAGE_KEYS.recipeDraft;

export function listRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getRecipe(id: string): Recipe | undefined {
  return listRecipes().find((r) => r.id === id);
}

export function saveRecipe(recipe: Recipe): void {
  const recipes = listRecipes().filter((r) => r.id !== recipe.id);
  recipes.push(recipe);
  localStorage.setItem(LIST_KEY, JSON.stringify(recipes));
}

export function deleteRecipe(id: string): void {
  const recipes = listRecipes().filter((r) => r.id !== id);
  localStorage.setItem(LIST_KEY, JSON.stringify(recipes));
}

export function consumeDraft(): RecipeDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft: RecipeDraft = JSON.parse(raw);
    localStorage.removeItem(DRAFT_KEY);
    return draft;
  } catch {
    return null;
  }
}
```

- [ ] **Step 5: Run storage tests**

Run: `npx vitest run libs/recipe/__tests__/storage.test.ts`
Expected: PASS (all tests)

- [ ] **Step 6: Commit**

```bash
git add libs/recipe/storage.ts libs/recipe/__tests__/storage.test.ts libs/storage-keys.ts
git commit -m "feat(recipe): add recipe storage layer with CRUD and draft consumption"
```

---

### Task 5: Update Vitest Config

**Files:**

- Modify: `vitest.config.ts`

- [ ] **Step 1: Add recipe test scope to vitest.config.ts**

Add `"libs/recipe/**/*.test.ts"` to the `include` array:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "libs/dbviewer/**/*.test.ts",
      "libs/unixtime/**/*.test.ts",
      "libs/cron/**/*.test.ts",
      "libs/qrcode/**/*.test.ts",
      "libs/textcase/**/*.test.ts",
      "libs/color/**/*.test.ts",
      "libs/regex/**/*.test.ts",
      "libs/csv/**/*.test.ts",
      "libs/numbase/**/*.test.ts",
      "libs/deduplines/**/*.test.ts",
      "libs/image/**/*.test.ts",
      "libs/extractor/**/*.test.ts",
      "libs/password/**/*.test.ts",
      "libs/wordcounter/**/*.test.ts",
      "libs/token-counter/**/*.test.ts",
      "libs/sshkey/**/*.test.ts",
      "libs/httpclient/**/*.test.ts",
      "libs/wallet/**/*.test.ts",
      "libs/cssunit/**/*.test.ts",
      "libs/jsonts/**/*.test.ts",
      "libs/subnet/**/*.test.ts",
      "libs/sqlformat/**/*.test.ts",
      "libs/recipe/**/*.test.ts",
      "libs/__tests__/*.test.ts",
      "utils/__tests__/*.test.{ts,tsx}",
      "hooks/**/*.test.ts",
    ],
    environment: "node",
    pool: "forks",
    globals: false,
  },
});
```

- [ ] **Step 2: Run all recipe tests together**

Run: `npx vitest run libs/recipe/`
Expected: PASS (all tests across all 4 test files)

- [ ] **Step 3: Run full test suite to verify no regressions**

Run: `npm run test`
Expected: PASS (no regressions)

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts
git commit -m "chore(recipe): add recipe test scope to vitest config"
```

---

### Task 6: Final Verification

- [ ] **Step 1: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run all recipe tests one more time**

Run: `npx vitest run libs/recipe/`
Expected: All tests pass

- [ ] **Step 3: Run full test suite**

Run: `npm run test`
Expected: All tests pass, no regressions
