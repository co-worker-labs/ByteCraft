# Recipe System — Part 4: UI Components

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Recipe page UI — two-panel layout with left panel (global input + step pipeline) and right panel (output + recipe management). Includes step cards, step picker, and global input area.

**Architecture:** Single page component `recipe-page.tsx` orchestrates state. Sub-components handle specific UI: `pipeline.tsx` renders step cards vertically, `step-card.tsx` is a single step, `step-picker.tsx` is the searchable drawer, `recipe-panel.tsx` is the right panel with output + saved recipes, `global-input.tsx` handles the input area (textarea or file drop zone). Pipeline execution is triggered by `executePipeline()` from the engine.

**Tech Stack:** React 19, Next.js 16, Tailwind CSS 4, next-intl, Lucide icons, @headlessui/react, fuzzysort

**Depends on:** Part 1 (engine), Part 2 (step definitions), Part 3 (i18n)

**Produces:** Fully functional Recipe page at `/recipe` route.

---

## File Structure

| Action | File                                  | Responsibility                                     |
| ------ | ------------------------------------- | -------------------------------------------------- |
| Create | `app/[locale]/recipe/page.tsx`        | Route entry, metadata, JSON-LD                     |
| Create | `app/[locale]/recipe/recipe-page.tsx` | Main page component, state management              |
| Create | `components/recipe/global-input.tsx`  | Global input area (textarea or file drop zone)     |
| Create | `components/recipe/step-card.tsx`     | Single step card with header, params, I/O sections |
| Create | `components/recipe/step-picker.tsx`   | Searchable drawer for adding steps                 |
| Create | `components/recipe/pipeline.tsx`      | Vertical step pipeline with connectors             |
| Create | `components/recipe/recipe-panel.tsx`  | Right panel: output area + saved recipes list      |

---

### Task 1: Recipe Page Entry (page.tsx)

**Files:**

- Create: `app/[locale]/recipe/page.tsx`

- [ ] **Step 1: Write page.tsx**

Follow the existing pattern from `app/[locale]/base64/page.tsx`:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import RecipePage from "./recipe-page";

const PATH = "/recipe";
const TOOL_KEY = "recipe";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("recipe.title"),
    description: t("recipe.description"),
    ogImage: { type: "tool", key: TOOL_KEY },
  });
}

export default async function RecipeRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "recipe" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const schemas = buildToolSchemas({
    name: t("recipe.title"),
    description: t("recipe.description"),
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
      <RecipePage />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/recipe/page.tsx
git commit -m "feat(recipe): add recipe page route entry with SEO metadata"
```

---

### Task 2: Global Input Component

**Files:**

- Create: `components/recipe/global-input.tsx`

- [ ] **Step 1: Write global-input.tsx**

```tsx
"use client";

import { useRef, type DragEvent } from "react";
import { useTranslations } from "next-intl";
import { Upload } from "lucide-react";
import { StyledTextarea } from "../ui/input";

interface GlobalInputProps {
  inputType: "text" | "image" | "none";
  value: string;
  onChange: (value: string) => void;
}

export default function GlobalInput({ inputType, value, onChange }: GlobalInputProps) {
  const t = useTranslations("recipe");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);

  if (inputType === "none") return null;

  function handleFileDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = false;
    const file = e.dataTransfer.files?.[0];
    if (file) readFileAsDataUri(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) readFileAsDataUri(file);
  }

  function readFileAsDataUri(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  if (inputType === "image") {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-fg-secondary">{t("input")}</label>
        <div
          className="relative rounded-lg border-2 border-dashed border-border-default bg-bg-input p-8 text-center transition-colors hover:border-accent-cyan/40"
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {value ? (
            <div className="space-y-2">
              <img src={value} alt="Input" className="mx-auto max-h-48 rounded" />
              <p className="text-xs text-fg-muted">Click or drop to replace</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="mx-auto h-8 w-8 text-fg-muted" />
              <p className="text-sm text-fg-muted">{t("dropImageHere")}</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-fg-secondary">{t("input")}</label>
      <StyledTextarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        placeholder={t("input")}
        className="font-mono text-sm"
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/recipe/global-input.tsx
git commit -m "feat(recipe): add global input component (textarea + file drop zone)"
```

---

### Task 3: Step Card Component

**Files:**

- Create: `components/recipe/step-card.tsx`

- [ ] **Step 1: Write step-card.tsx**

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { RecipeStepDef, RecipeStepInstance, StepOutput } from "../../libs/recipe/types";
import { StyledInput, StyledSelect } from "../ui/input";

interface StepCardProps {
  def: RecipeStepDef;
  instance: RecipeStepInstance;
  output: StepOutput | undefined;
  isErrored: boolean;
  isWaiting: boolean;
  isLoading: boolean;
  expanded: boolean;
  onToggleEnabled: () => void;
  onDelete: () => void;
  onParamsChange: (params: Record<string, string>) => void;
  dragHandleProps?: Record<string, unknown>;
}

export default function StepCard({
  def,
  instance,
  output,
  isErrored,
  isWaiting,
  isLoading,
  expanded,
  onToggleEnabled,
  onDelete,
  onParamsChange,
  dragHandleProps,
}: StepCardProps) {
  const t = useTranslations("recipe");
  const [showIO, setShowIO] = useState(expanded);

  function handleParamChange(paramId: string, value: string) {
    onParamsChange({ ...instance.params, [paramId]: value });
  }

  const borderClass = isErrored
    ? "border-danger"
    : isWaiting
      ? "border-dashed border-fg-muted/40"
      : "border-border-default";

  return (
    <div
      className={`rounded-lg border bg-bg-surface shadow-sm transition-all ${borderClass} ${!instance.enabled ? "opacity-50" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        <div {...dragHandleProps} className="cursor-grab text-fg-muted hover:text-fg-primary">
          <GripVertical size={16} />
        </div>
        {isErrored && <AlertCircle size={14} className="text-danger shrink-0" />}
        {isLoading && <Loader2 size={14} className="text-accent-cyan animate-spin shrink-0" />}
        <span
          className={`text-sm font-medium text-fg-primary truncate flex-1 ${!instance.enabled ? "line-through" : ""}`}
        >
          {t(`steps.${def.id}.name`)}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-purple/10 text-accent-purple font-medium uppercase tracking-wider">
          {t(`categories.${def.category}`)}
        </span>
        <div className="flex items-center gap-1 border-l border-border-default pl-2 ml-1">
          <button
            onClick={onToggleEnabled}
            className="p-1 rounded hover:bg-bg-elevated transition-colors text-fg-muted hover:text-fg-primary"
            title={instance.enabled ? "Disable" : "Enable"}
          >
            {instance.enabled ? (
              <ToggleRight size={16} className="text-accent-cyan" />
            ) : (
              <ToggleLeft size={16} />
            )}
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-danger/10 transition-colors text-fg-muted hover:text-danger"
            title={t("delete")}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {!instance.enabled && (
        <div className="px-3 pb-2 text-xs text-fg-muted italic">{t("disabled")}</div>
      )}

      {/* Params */}
      {instance.enabled && def.parameters.length > 0 && (
        <div className="px-3 pb-2 grid grid-cols-2 gap-2">
          {def.parameters.map((param) => (
            <div key={param.id} className={param.type === "select" ? "" : "col-span-2"}>
              <label className="text-xs text-fg-muted mb-1 block">
                {t(`params.${param.label}`) || param.label}
              </label>
              {param.type === "select" ? (
                <StyledSelect
                  value={instance.params[param.id] ?? param.defaultValue}
                  onChange={(e) => handleParamChange(param.id, e.target.value)}
                  className="text-xs"
                >
                  {param.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </StyledSelect>
              ) : (
                <StyledInput
                  value={instance.params[param.id] ?? param.defaultValue}
                  onChange={(e) => handleParamChange(param.id, e.target.value)}
                  placeholder={param.placeholder}
                  className="text-xs"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* IO Toggle */}
      {instance.enabled && (output || def.inputType === "none") && (
        <div className="px-3 pb-1">
          <button
            onClick={() => setShowIO(!showIO)}
            className="flex items-center gap-1 text-[11px] text-fg-muted hover:text-fg-primary transition-colors"
          >
            {showIO ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {showIO ? "Hide" : "Show"} I/O
          </button>
        </div>
      )}

      {/* IO Section */}
      {instance.enabled && showIO && output && (
        <div className="px-3 pb-2 space-y-1 border-t border-border-subtle pt-2">
          {def.inputType !== "none" && (
            <div>
              <span className="text-[10px] text-fg-muted uppercase tracking-wider">
                {t("input")}
              </span>
              <pre className="text-xs text-fg-secondary bg-bg-input rounded p-1.5 mt-0.5 max-h-20 overflow-auto font-mono whitespace-pre-wrap break-all">
                {truncate(output.input, 500)}
              </pre>
            </div>
          )}
          <div>
            <span className="text-[10px] text-fg-muted uppercase tracking-wider">
              {t("output")}
            </span>
            {output.result.ok ? (
              output.result.output.startsWith("data:image/") ? (
                <img src={output.result.output} alt="Output" className="mt-0.5 max-h-32 rounded" />
              ) : (
                <pre className="text-xs text-fg-secondary bg-bg-input rounded p-1.5 mt-0.5 max-h-20 overflow-auto font-mono whitespace-pre-wrap break-all">
                  {truncate(output.result.output, 500)}
                </pre>
              )
            ) : (
              <div className="text-xs text-danger bg-danger/10 rounded p-1.5 mt-0.5">
                {output.result.error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Waiting state */}
      {isWaiting && (
        <div className="px-3 pb-2 text-xs text-fg-muted italic">{t("waitingInput")}</div>
      )}
    </div>
  );
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + `... (${str.length} chars total)`;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/recipe/step-card.tsx
git commit -m "feat(recipe): add step card component with params, I/O, error states"
```

---

### Task 4: Step Picker Component

**Files:**

- Create: `components/recipe/step-picker.tsx`

- [ ] **Step 1: Write step-picker.tsx**

Searchable drawer similar to `ToolsDrawer`. Uses fuzzysort to search step names/descriptions.

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  searchSteps,
  STEP_CATEGORIES,
  STEP_REGISTRY,
  getCompatibleSteps,
} from "../../libs/recipe/registry";
import { getPipelineInputType } from "../../libs/recipe/engine";
import type { RecipeStepDef, RecipeStepInstance, DataType } from "../../libs/recipe/types";

interface StepPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (def: RecipeStepDef) => void;
  insertPosition: number;
  currentSteps: RecipeStepInstance[];
}

export default function StepPicker({
  open,
  onClose,
  onSelect,
  insertPosition,
  currentSteps,
}: StepPickerProps) {
  const t = useTranslations("recipe");
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const allSteps = Array.from(STEP_REGISTRY.values());
  const inputType = getPipelineInputType(currentSteps, STEP_REGISTRY);

  let prevOutputType: DataType | null = null;
  if (currentSteps.length > 0 && insertPosition > 0) {
    const prevStep = currentSteps[insertPosition - 1];
    const prevDef = STEP_REGISTRY.get(prevStep.stepId);
    if (prevDef) prevOutputType = prevDef.outputType;
  } else if (currentSteps.length === 0 || insertPosition === 0) {
    prevOutputType = inputType === "image" ? "image" : null;
    if (currentSteps.length > 0) {
      const firstDef = STEP_REGISTRY.get(currentSteps[0].stepId);
      if (firstDef && firstDef.inputType === "none") {
        if (insertPosition === 0) prevOutputType = null;
      }
    }
  }

  const compatibleSteps = getCompatibleSteps(insertPosition, prevOutputType, allSteps);
  const compatibleIds = new Set(compatibleSteps.map((s) => s.id));
  const searched = query.trim() ? searchSteps(query) : allSteps;
  const categorized = STEP_CATEGORIES;

  function handleSelect(def: RecipeStepDef) {
    if (!compatibleIds.has(def.id)) return;
    onSelect(def);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-start justify-center pt-[10vh]">
        <DialogPanel className="w-full max-w-lg rounded-xl border border-border-default bg-bg-surface shadow-xl">
          <div className="flex items-center gap-2 border-b border-border-default px-4 py-3">
            <Search size={16} className="text-fg-muted shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search steps..."
              className="flex-1 bg-transparent text-sm text-fg-primary outline-none placeholder:text-fg-muted"
            />
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {categorized.map((cat) => {
              const catSteps = searched.filter((s) => s.category === cat.id);
              if (catSteps.length === 0) return null;
              return (
                <div key={cat.id} className="mb-2">
                  <div className="px-2 py-1 text-[11px] font-medium text-fg-muted uppercase tracking-wider">
                    {t(`categories.${cat.id}`)}
                  </div>
                  {catSteps.map((step) => {
                    const isCompatible = compatibleIds.has(step.id);
                    return (
                      <button
                        key={step.id}
                        onClick={() => isCompatible && handleSelect(step)}
                        disabled={!isCompatible}
                        className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors ${
                          isCompatible
                            ? "hover:bg-accent-cyan/8 text-fg-primary"
                            : "opacity-40 cursor-not-allowed"
                        }`}
                        title={!isCompatible ? t("sourceStepOnlyAtStart") : undefined}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {t(`steps.${step.id}.name`)}
                          </div>
                          <div className="text-xs text-fg-muted truncate">
                            {t(`steps.${step.id}.desc`)}
                          </div>
                        </div>
                        <div className="text-[10px] text-fg-muted shrink-0">
                          {step.inputType === "none"
                            ? "source"
                            : `${step.inputType}→${step.outputType}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/recipe/step-picker.tsx
git commit -m "feat(recipe): add step picker with search and compat filtering"
```

---

### Task 5: Pipeline Component

**Files:**

- Create: `components/recipe/pipeline.tsx`

- [ ] **Step 1: Write pipeline.tsx**

Renders the vertical step card stack with connectors and "+ Add Step" buttons.

```tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { RecipeStepInstance, StepOutput, DataType } from "../../libs/recipe/types";
import { STEP_REGISTRY } from "../../libs/recipe/registry";
import StepCard from "./step-card";
import StepPicker from "./step-picker";

interface PipelineProps {
  steps: RecipeStepInstance[];
  outputs: StepOutput[];
  errorStepIndex: number | null;
  isLoading: boolean;
  expanded: boolean;
  onStepsChange: (steps: RecipeStepInstance[]) => void;
}

function makeDefaultParams(stepId: string): Record<string, string> {
  const def = STEP_REGISTRY.get(stepId);
  if (!def) return {};
  const params: Record<string, string> = {};
  for (const p of def.parameters) {
    params[p.id] = p.defaultValue;
  }
  return params;
}

export default function Pipeline({
  steps,
  outputs,
  errorStepIndex,
  isLoading,
  expanded,
  onStepsChange,
}: PipelineProps) {
  const t = useTranslations("recipe");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerPosition, setPickerPosition] = useState(0);
  const dragIndex = useRef<number | null>(null);

  function addStep(stepId: string, position: number) {
    const newStep: RecipeStepInstance = {
      stepId,
      params: makeDefaultParams(stepId),
      enabled: true,
    };
    const newSteps = [...steps];
    newSteps.splice(position, 0, newStep);
    onStepsChange(newSteps);
  }

  function removeStep(index: number) {
    const newSteps = steps.filter((_, i) => i !== index);
    onStepsChange(newSteps);
  }

  function toggleStep(index: number) {
    const newSteps = steps.map((s, i) => (i === index ? { ...s, enabled: !s.enabled } : s));
    onStepsChange(newSteps);
  }

  function updateParams(index: number, params: Record<string, string>) {
    const newSteps = steps.map((s, i) => (i === index ? { ...s, params } : s));
    onStepsChange(newSteps);
  }

  function openPicker(position: number) {
    setPickerPosition(position);
    setPickerOpen(true);
  }

  function handleDragStart(index: number) {
    dragIndex.current = index;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === index) return;
    const newSteps = [...steps];
    const [moved] = newSteps.splice(dragIndex.current, 1);
    newSteps.splice(index, 0, moved);
    onStepsChange(newSteps);
    dragIndex.current = null;
  }

  function getOutputForStep(index: number): StepOutput | undefined {
    let outputIdx = 0;
    for (let i = 0; i < steps.length; i++) {
      if (!steps[i].enabled) continue;
      if (i === index) return outputs[outputIdx];
      outputIdx++;
    }
    return undefined;
  }

  function isStepWaiting(index: number): boolean {
    if (errorStepIndex === null) return false;
    return index > errorStepIndex;
  }

  return (
    <div className="space-y-2">
      {/* Add step at top */}
      <button
        onClick={() => openPicker(0)}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border-default py-2 text-xs text-fg-muted hover:border-accent-cyan/40 hover:text-accent-cyan transition-colors"
      >
        <Plus size={14} />
        {t("addStep")}
      </button>

      {/* Step cards */}
      {steps.map((step, index) => {
        const def = STEP_REGISTRY.get(step.stepId);
        if (!def) return null;
        const stepOutput = getOutputForStep(index);
        const isErrored = errorStepIndex === index;
        const isWaiting = isStepWaiting(index);
        const isStepLoading = isLoading && stepOutput === undefined && !isErrored && !isWaiting;

        return (
          <div key={index}>
            <div
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
            >
              <StepCard
                def={def}
                instance={step}
                output={stepOutput}
                isErrored={isErrored}
                isWaiting={isWaiting}
                isLoading={isStepLoading}
                expanded={expanded}
                onToggleEnabled={() => toggleStep(index)}
                onDelete={() => removeStep(index)}
                onParamsChange={(params) => updateParams(index, params)}
              />
            </div>
            {/* Add step after this card */}
            <button
              onClick={() => openPicker(index + 1)}
              className="w-full flex items-center justify-center gap-1 py-1 text-[11px] text-fg-muted hover:text-accent-cyan transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
        );
      })}

      <StepPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(def) => addStep(def.id, pickerPosition)}
        insertPosition={pickerPosition}
        currentSteps={steps}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/recipe/pipeline.tsx
git commit -m "feat(recipe): add pipeline component with drag-reorder and step management"
```

---

### Task 6: Recipe Panel (Right Panel)

**Files:**

- Create: `components/recipe/recipe-panel.tsx`

- [ ] **Step 1: Write recipe-panel.tsx**

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Save, Trash2, Download, Loader2 } from "lucide-react";
import { StyledTextarea } from "../ui/input";
import { Button } from "../ui/button";
import { CopyButton } from "../ui/copy-btn";
import { showToast } from "../../libs/toast";
import { listRecipes, saveRecipe, deleteRecipe } from "../../libs/recipe/storage";
import type { Recipe, RecipeStepInstance } from "../../libs/recipe/types";

interface RecipePanelProps {
  finalOutput: string | null;
  isLoading: boolean;
  steps: RecipeStepInstance[];
  onLoadRecipe: (recipe: Recipe) => void;
}

export default function RecipePanel({
  finalOutput,
  isLoading,
  steps,
  onLoadRecipe,
}: RecipePanelProps) {
  const t = useTranslations("recipe");
  const tc = useTranslations("common");
  const [recipeName, setRecipeName] = useState(t("untitled"));
  const [showSaved, setShowSaved] = useState(false);
  const [savedList, setSavedList] = useState<Recipe[]>([]);

  function handleSave() {
    const recipe: Recipe = {
      id: crypto.randomUUID(),
      name: recipeName || t("untitled"),
      steps,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveRecipe(recipe);
    showToast("Recipe saved", "success", 2000);
  }

  function handleShowSaved() {
    setSavedList(listRecipes());
    setShowSaved(!showSaved);
  }

  function handleDelete(id: string) {
    deleteRecipe(id);
    setSavedList(listRecipes());
  }

  function handleDownload() {
    if (!finalOutput) return;
    if (finalOutput.startsWith("data:image/")) {
      const link = document.createElement("a");
      link.href = finalOutput;
      const ext = finalOutput.includes("image/png")
        ? "png"
        : finalOutput.includes("image/svg")
          ? "svg"
          : "jpg";
      link.download = `recipe-output.${ext}`;
      link.click();
    } else {
      const blob = new Blob([finalOutput], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "recipe-output.txt";
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  const isImage = finalOutput?.startsWith("data:image/");

  return (
    <div className="space-y-4">
      {/* Final Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-fg-secondary">{t("output")}</label>
          <div className="flex items-center gap-1">
            {finalOutput && !isLoading && (
              <>
                <CopyButton getContent={() => (isImage ? "" : finalOutput)} className="text-xs" />
                <button
                  onClick={handleDownload}
                  className="p-1.5 rounded hover:bg-bg-elevated text-fg-muted hover:text-fg-primary transition-colors"
                  title="Download"
                >
                  <Download size={14} />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-border-default bg-bg-input min-h-[200px]">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-fg-muted">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">{t("computing")}</span>
            </div>
          ) : isImage ? (
            <div className="p-4 flex items-center justify-center">
              <img src={finalOutput!} alt="Output" className="max-h-[400px] rounded" />
            </div>
          ) : (
            <pre className="p-3 text-sm font-mono text-fg-primary whitespace-pre-wrap break-all overflow-auto max-h-[400px]">
              {finalOutput ?? ""}
            </pre>
          )}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-2">
        <input
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          className="flex-1 rounded-lg border border-border-default bg-bg-input px-3 py-1.5 text-sm text-fg-primary outline-none focus:border-accent-cyan/40"
          placeholder={t("untitled")}
        />
        <Button variant="outline" size="sm" onClick={handleSave} disabled={steps.length === 0}>
          <Save size={14} />
          {t("save")}
        </Button>
      </div>

      {/* Saved Recipes */}
      <div>
        <button
          onClick={handleShowSaved}
          className="text-xs text-fg-muted hover:text-fg-primary transition-colors"
        >
          {t("savedRecipes")} ({t("stepsCount", { count: savedList.length })})
        </button>
        {showSaved && savedList.length > 0 && (
          <div className="mt-2 space-y-1">
            {savedList.map((recipe) => (
              <div
                key={recipe.id}
                className="flex items-center gap-2 rounded-lg border border-border-default px-3 py-2"
              >
                <button
                  onClick={() => onLoadRecipe(recipe)}
                  className="flex-1 text-left text-sm text-fg-primary hover:text-accent-cyan transition-colors truncate"
                >
                  {recipe.name}
                </button>
                <span className="text-[10px] text-fg-muted">{recipe.steps.length} steps</span>
                <button
                  onClick={() => handleDelete(recipe.id)}
                  className="p-1 rounded hover:bg-danger/10 text-fg-muted hover:text-danger transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/recipe/recipe-panel.tsx
git commit -m "feat(recipe): add recipe panel with output display, save/load, download"
```

---

### Task 7: Main Recipe Page Component

**Files:**

- Create: `app/[locale]/recipe/recipe-page.tsx`

- [ ] **Step 1: Write recipe-page.tsx**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";
import Layout from "../../../components/layout";
import GlobalInput from "../../../components/recipe/global-input";
import Pipeline from "../../../components/recipe/pipeline";
import RecipePanel from "../../../components/recipe/recipe-panel";
import { executePipeline, getPipelineInputType } from "../../../libs/recipe/engine";
import { STEP_REGISTRY } from "../../../libs/recipe/registry";
import { consumeDraft } from "../../../libs/recipe/storage";
import "../../steps/index";
import type {
  RecipeStepInstance,
  Recipe,
  StepOutput,
  PipelineResult,
} from "../../../libs/recipe/types";

export default function RecipePage() {
  const t = useTranslations("recipe");
  const ts = useTranslations("tools");
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState<RecipeStepInstance[]>([]);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const draft = consumeDraft();
    if (draft) {
      setInput(draft.input);
      const def = STEP_REGISTRY.get(draft.stepId);
      if (def) {
        const params: Record<string, string> = {};
        for (const p of def.parameters) {
          params[p.id] = draft.params[p.id] ?? p.defaultValue;
        }
        setSteps([{ stepId: draft.stepId, params, enabled: true }]);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    async function run() {
      const result = await executePipeline(input || null, steps, STEP_REGISTRY);
      if (!cancelled) {
        setPipelineResult(result);
        setIsLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [input, steps]);

  const pipelineInputType = getPipelineInputType(steps, STEP_REGISTRY);

  return (
    <Layout title={ts("recipe.shortTitle")}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {/* Left Panel */}
        <div className="space-y-4">
          <GlobalInput inputType={pipelineInputType} value={input} onChange={setInput} />

          {/* Header bar */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-fg-secondary">
              Pipeline ({steps.length} {steps.length === 1 ? "step" : "steps"})
            </h2>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-fg-muted hover:text-fg-primary transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp size={12} /> {t("collapseAll")}
                </>
              ) : (
                <>
                  <ChevronDown size={12} /> {t("expandAll")}
                </>
              )}
            </button>
          </div>

          <Pipeline
            steps={steps}
            outputs={pipelineResult?.steps ?? []}
            errorStepIndex={pipelineResult?.errorStepIndex ?? null}
            isLoading={isLoading}
            expanded={expanded}
            onStepsChange={setSteps}
          />
        </div>

        {/* Right Panel */}
        <div>
          <RecipePanel
            finalOutput={pipelineResult?.finalOutput ?? (steps.length === 0 ? input : null)}
            isLoading={isLoading}
            steps={steps}
            onLoadRecipe={(recipe) => {
              setSteps(recipe.steps);
            }}
          />
        </div>
      </div>
    </Layout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/recipe/recipe-page.tsx
git commit -m "feat(recipe): add recipe page component with pipeline execution"
```

---

### Task 8: Verify Build

- [ ] **Step 1: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run build to verify no import errors**

Run: `npm run build 2>&1 | tail -30`
Expected: Build succeeds or only has pre-existing issues, no recipe-related errors

- [ ] **Step 3: Run all tests**

Run: `npm run test`
Expected: All tests pass
