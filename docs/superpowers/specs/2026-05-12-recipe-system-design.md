# Recipe System Design

CyberChef-style pipeline tool for chaining multiple operations together. Users build "recipes" by composing text/image processing steps that pass data through a vertical pipeline.

## Core Decisions

| Decision        | Choice                                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----- | ------ |
| Data model      | Type-compatible pipeline (`DataType: text                                                                                            | image | none`) |
| Pipeline input  | Fixed global input area at top, dynamically switches between textarea and file drop zone based on first consuming step's `inputType` |
| Source steps    | `none→text` steps (password-gen, uuid-gen) restricted to pipeline position 0 only                                                    |
| Entry point     | Standalone `/recipe` page + "Send to Recipe" shortcut on tool pages                                                                  |
| Interaction     | Vertical pipeline (CyberChef style), drag-to-reorder step cards                                                                      |
| Persistence     | localStorage, manual save only, no auto-save/restore                                                                                 |
| Operation scope | 36 steps across 6 categories                                                                                                         |
| Parameters      | Inline in step cards                                                                                                                 |
| Error handling  | Stop at first error, mark red, subsequent steps show "waiting"                                                                       |
| Computation     | Async execution, recompute on any input/step/param change                                                                            |
| Empty pipeline  | Right panel shows passthrough (input = output)                                                                                       |

## Data Model

### Types (`libs/recipe/types.ts`)

```ts
type DataType = "text" | "image" | "none";

type StepResult = { ok: true; output: string } | { ok: false; error: string };

interface StepParam {
  id: string;
  type: "text" | "select";
  label: string; // i18n key
  defaultValue: string;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

type StepCategory = "encoding" | "crypto" | "text" | "format" | "generators" | "visual";

interface RecipeStepDef {
  id: string; // e.g. "base64-encode"
  name: string; // i18n key
  category: StepCategory;
  icon: string; // Lucide icon name
  description: string; // i18n key
  inputType: DataType;
  outputType: DataType;
  parameters: StepParam[];
  execute(input: string, params: Record<string, string>): Promise<StepResult>;
}

interface RecipeStepInstance {
  stepId: string; // references RecipeStepDef.id
  params: Record<string, string>;
  enabled: boolean;
}

interface Recipe {
  id: string; // crypto.randomUUID()
  name: string;
  steps: RecipeStepInstance[];
  createdAt: number;
  updatedAt: number;
}
```

### Key design points

- `RecipeStepDef` is a static definition (declared in code, immutable) describing "what can be done"
- `RecipeStepInstance` is a runtime instance (specific step in a user's recipe) describing "what was configured"
- `execute()` is an async pure function — synchronous steps return `Promise.resolve(result)` with zero overhead; async steps (qrcode-gen, image-compress) use `await` naturally
- `StepResult` discriminated union ensures exhaustive type checking in the pipeline engine
- `DataType` replaces the earlier `source`/`terminal` concepts — steps declare input/output types and compatibility is checked dynamically
- All pipeline data flows as `string`; image data uses data URI format (`data:image/png;base64,...`); `DataType` is used only for compatibility checking and UI adaptation

## Pipeline Engine

### File: `libs/recipe/engine.ts`

```ts
interface PipelineResult {
  steps: StepOutput[];
  finalOutput: string | null;
  errorStepIndex: number | null;
}

interface StepOutput {
  input: string;
  result: StepResult;
}

async function executePipeline(
  input: string | null,
  steps: RecipeStepInstance[],
  stepDefs: Map<string, RecipeStepDef>
): Promise<PipelineResult>;

function isCompatible(prevOutputType: DataType | null, nextStep: RecipeStepDef): boolean;
function getPipelineInputType(
  steps: RecipeStepInstance[],
  stepDefs: Map<string, RecipeStepDef>
): DataType;
```

### Execution logic

1. Start from `input` (may be `null` if pipeline begins with a source step)
2. Iterate `steps`, skip `enabled: false` steps
3. For each enabled step:
   - If step is at position 0 and `inputType === "none"`: pass `""` as input, step generates its own data
   - Otherwise: pass `currentInput` from previous step
4. `await stepDef.execute(currentInput, step.params)`
5. If `result.ok === true`, use `output` as input for next step
6. If `result.ok === false`, stop immediately, record `errorStepIndex`, set `finalOutput = null`
7. Return full `StepOutput[]` array (for UI to show intermediate results per step)

### Empty pipeline

When `steps` is empty, `executePipeline` returns `{ steps: [], finalOutput: input, errorStepIndex: null }`. Right panel displays the input as-is (passthrough).

### Compatibility check

```ts
function isCompatible(prevOutputType: DataType | null, nextStep: RecipeStepDef): boolean {
  if (nextStep.inputType === "none") return false; // source steps cannot be placed after other steps
  if (prevOutputType === null) return true; // first position, any non-source step accepted
  return prevOutputType === nextStep.inputType;
}
```

Source steps (`inputType === "none"`) are restricted to position 0. The Step Picker enforces this — source steps are only available when adding at position 0, and non-source steps are not available at position 0 if a source step already exists there.

### Pipeline input type resolution

```ts
function getPipelineInputType(
  steps: RecipeStepInstance[],
  stepDefs: Map<string, RecipeStepDef>
): DataType {
  if (steps.length === 0) return "text"; // default to textarea
  const first = stepDefs.get(steps[0].stepId);
  if (!first) return "text";
  if (first.inputType === "none") {
    // Source step at position 0 — look at step 1
    if (steps.length > 1) {
      const second = stepDefs.get(steps[1].stepId);
      return second?.inputType ?? "text";
    }
    return "text"; // only source steps, no global input needed
  }
  return first.inputType;
}
```

The UI uses this to render the global input area: `"text"` → textarea, `"image"` → file drop zone. If all steps are source steps, the global input area is hidden entirely.

### Recomputation triggers

The engine is a pure async function. In the React component, re-execute whenever:

- Global input text/file changes
- Steps are added/removed/reordered
- Any step parameter changes
- Any step is enabled/disabled

React Compiler handles memoization automatically — no manual debounce. UI shows a loading indicator (spinner on step cards, "Computing..." on right panel) while the async pipeline is executing.

## Step Registry

### File: `libs/recipe/registry.ts`

```ts
const STEP_REGISTRY: Map<string, RecipeStepDef>;
const STEP_CATEGORIES: { id: StepCategory; label: string; steps: RecipeStepDef[] }[];
function getStep(id: string): RecipeStepDef | undefined;
function searchSteps(query: string): RecipeStepDef[];
function getCompatibleSteps(
  insertPosition: number,
  previousOutputType: DataType | null,
  allSteps: RecipeStepDef[]
): RecipeStepDef[];
```

### Complete step list (36 steps)

#### Encoding (6) — all `text → text`

| Step ID                | Name                   | Params |
| ---------------------- | ---------------------- | ------ |
| `base64-encode`        | Base64 Encode          | none   |
| `base64-decode`        | Base64 Decode          | none   |
| `url-encode-component` | URL Encode (Component) | none   |
| `url-decode-component` | URL Decode (Component) | none   |
| `url-encode-full`      | URL Encode (Full URL)  | none   |
| `url-decode-full`      | URL Decode (Full URL)  | none   |

#### Crypto (8) — password-gen is `none → text` (source step, position 0 only)

| Step ID        | Name               | inputType | outputType | Params                                                                                                                                                                                                       |
| -------------- | ------------------ | --------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `hash-md5`     | MD5 Hash           | text      | text       | none                                                                                                                                                                                                         |
| `hash-sha1`    | SHA-1 Hash         | text      | text       | none                                                                                                                                                                                                         |
| `hash-sha256`  | SHA-256 Hash       | text      | text       | none                                                                                                                                                                                                         |
| `hash-sha512`  | SHA-512 Hash       | text      | text       | none                                                                                                                                                                                                         |
| `aes-encrypt`  | AES Encrypt        | text      | text       | `key` (text)                                                                                                                                                                                                 |
| `aes-decrypt`  | AES Decrypt        | text      | text       | `key` (text)                                                                                                                                                                                                 |
| `hmac-sha256`  | HMAC-SHA256        | text      | text       | `key` (text)                                                                                                                                                                                                 |
| `password-gen` | Password Generator | none      | text       | `length` (text, default "16"), `uppercase` (select: yes/no, default "yes"), `lowercase` (select: yes/no, default "yes"), `numbers` (select: yes/no, default "yes"), `symbols` (select: yes/no, default "no") |

#### Text (10) — all `text → text`

| Step ID          | Name                   | Params                                                                                            |
| ---------------- | ---------------------- | ------------------------------------------------------------------------------------------------- |
| `text-camel`     | camelCase              | none                                                                                              |
| `text-pascal`    | PascalCase             | none                                                                                              |
| `text-snake`     | snake_case             | none                                                                                              |
| `text-kebab`     | kebab-case             | none                                                                                              |
| `text-upper`     | UPPERCASE              | none                                                                                              |
| `text-lower`     | lowercase              | none                                                                                              |
| `regex-replace`  | Regex Replace          | `pattern` (text), `replacement` (text), `flags` (text, default "g")                               |
| `dedup-lines`    | Remove Duplicate Lines | `caseSensitive` (select: yes/no, default "yes"), `trimWhitespace` (select: yes/no, default "yes") |
| `extract-emails` | Extract Emails         | none                                                                                              |
| `extract-urls`   | Extract URLs           | none                                                                                              |

#### Format (9) — all `text → text`

| Step ID       | Name              | Params                                                                                   |
| ------------- | ----------------- | ---------------------------------------------------------------------------------------- |
| `json-format` | JSON Format       | `indent` (select: 2/4/tab, default "2")                                                  |
| `json-minify` | JSON Minify       | none                                                                                     |
| `json-yaml`   | JSON → YAML       | none                                                                                     |
| `yaml-json`   | YAML → JSON       | `indent` (select: 2/4/tab, default "2")                                                  |
| `json-ts`     | JSON → TypeScript | `rootName` (text, default "Root")                                                        |
| `json-csv`    | JSON → CSV        | `delimiter` (select: comma/tab/semicolon, default "comma")                               |
| `csv-json`    | CSV → JSON        | `delimiter` (select: comma/tab/semicolon, default "comma")                               |
| `sql-format`  | SQL Format        | `dialect` (select: sql/mysql/postgresql/mariadb/sqlite/transactsql/plsql, default "sql") |
| `sql-minify`  | SQL Minify        | `dialect` (select: same as above, default "sql")                                         |

#### Generators (2)

| Step ID      | Name              | inputType | outputType | Params                                                                                                                              |
| ------------ | ----------------- | --------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `uuid-gen`   | UUID Generator    | none      | text       | `version` (select: v4/v7, default "v4"), `count` (text, default "1"). Multiple UUIDs output as newline-separated text               |
| `qrcode-gen` | QR Code Generator | text      | image      | `size` (select: 128/256/512, default "256"), `errorLevel` (select: L/M/Q/H, default "M"), `format` (select: SVG/PNG, default "SVG") |

#### Visual (1)

| Step ID          | Name           | inputType | outputType | Params                                                                                                                |
| ---------------- | -------------- | --------- | ---------- | --------------------------------------------------------------------------------------------------------------------- |
| `image-compress` | Image Compress | image     | image      | `quality` (text, default "80"), `maxWidth` (text), `maxHeight` (text), `format` (select: PNG/JPG/WebP, default "JPG") |

### Implementation reuse

Steps reuse existing `libs/` functions where available:

| Step                          | Source                                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| text-camel/pascal/snake/kebab | `libs/textcase/main.ts`                                                                                  |
| json-yaml, yaml-json          | `libs/yaml/`                                                                                             |
| json-ts                       | `libs/jsonts/`                                                                                           |
| json-csv, csv-json            | `libs/csv/`                                                                                              |
| sql-format, sql-minify        | `libs/sqlformat/`                                                                                        |
| dedup-lines                   | `libs/deduplines/`                                                                                       |
| extract-emails, extract-urls  | `libs/extractor/`                                                                                        |
| password-gen                  | `libs/password/main.ts` — call `generate("Random", charFlags, length)`, wrap result via `copyPassword()` |
| qrcode-gen                    | `libs/qrcode/` — async, returns data URI string                                                          |
| image-compress                | `libs/image/` — async, uses `canvas.toBlob()`, returns data URI string                                   |

Simple operations (base64, url-encoding, hashing, case conversion) use lightweight inline implementations.

### Image data boundary

File → data URI conversion happens in the **UI layer** (React component). When a user drops a file into the global input area, the component reads it via `FileReader.readAsDataURL()` and passes the resulting data URI string to the engine. The engine and all `execute()` functions only ever receive and return `string`.

## UI Design

### Page Layout: Two-Panel (Layout B+)

**Left panel** — Global input + Step pipeline:

- Global input area at top (textarea for text, file drop zone for image, hidden when all steps are source steps)
- Recipe header bar (name, expand/collapse all toggle, save, recipe list dropdown)
- Step cards stacked vertically with connectors
- "+ Add Step" button between and after steps

**Right panel** — Final output + recipe management:

- Final output area (text → textarea + copy; image → preview + download; empty pipeline → passthrough of input)
- Loading indicator while pipeline is computing
- Saved recipes list (click to load, inline rename, delete)

### Step Card Anatomy

Each step card has:

1. **Header**: `⠿ [Step Name] [Category Badge] | [Toggle ON/OFF] [✕ Delete]`
   - Drag handle on left
   - Toggle + Delete grouped on right with `border-left` separator
   - Enabled: normal appearance
   - Disabled: dimmed (opacity 0.5), step name struck through, shows "Step disabled — skipped in pipeline"

2. **Input section** (collapsible):
   - Always collapsed — global input at top handles data entry
   - Shows truncated preview of input received from previous step
   - `none` input → Input section hidden entirely

3. **Params section** (if step has parameters):
   - Inline inputs/dropdowns within the card

4. **Output section** (collapsible):
   - Collapsed by default, shows truncated preview
   - Image outputs render as image preview
   - Error outputs show red error message
   - Loading: spinner icon while async execute is in progress

### Global toggle

- **Expand All**: show all steps' input + output sections
- **Collapse All**: hide all intermediate I/O, only show headers + params

### Step Picker

Triggered by clicking "+ Add Step". Uses a searchable drawer similar to the existing `ToolsDrawer` (Ctrl+K):

- Top: search box with fuzzysort fuzzy search
- Below: steps grouped by category, collapsible
- Each step shows: icon + name + short description
- Position-aware filtering:
  - Position 0: show source steps (`none→text`) + all `text→*` steps
  - Position > 0: only steps compatible with previous output type (`isCompatible` check)
  - Source steps greyed out with reason ("Source steps can only be placed at the beginning")
  - Incompatible steps greyed out with reason (e.g. "Requires text input, but current output is image")

### Error handling UI

- Failed step: card border turns `var(--danger)` (#ef4444), header shows error icon, output area shows error message on red background
- Subsequent steps: grey dashed border, "Waiting for input..." message
- Type mismatch: yellow warning border, tooltip explains incompatibility
- Loading: step cards show subtle spinner, right panel shows "Computing..." text

## Tool Page Integration

### "Send to Recipe" button

Added to existing tool pages that have a corresponding recipe step. Placed next to the Copy button in the output area.

### Mapping

For tools with a single direction (e.g. JSON Format always formats), the mapping is straightforward. For bidirectional tools (e.g. Base64 can encode or decode), the button reads the tool's current mode and selects the matching step.

```ts
// libs/recipe/tool-step-map.ts
// Value can be a fixed stepId or a function that inspects tool state
type StepMapping = string | ((toolState: Record<string, unknown>) => string);

const TOOL_STEP_MAP: Record<string, StepMapping> = {
  "/base64": (state) => (state.mode === "decode" ? "base64-decode" : "base64-encode"),
  "/urlencoder": (state) => {
    const mode = state.mode as string;
    if (mode === "full")
      return state.direction === "decode" ? "url-decode-full" : "url-encode-full";
    return state.direction === "decode" ? "url-decode-component" : "url-encode-component";
  },
  "/json": "json-format",
  "/hashing": (state) => {
    const algo = (state.algorithm as string) || "sha256";
    const stepId = `hash-${algo === "sha-1" ? "sha1" : algo === "sha-512" ? "sha512" : algo === "md5" ? "md5" : "sha256"}`;
    return stepId;
  },
  "/textcase": (state) => {
    const caseMap: Record<string, string> = {
      camel: "text-camel",
      pascal: "text-pascal",
      snake: "text-snake",
      kebab: "text-kebab",
      upper: "text-upper",
      lower: "text-lower",
    };
    return caseMap[(state.case as string) || "camel"] || "text-camel";
  },
  "/cipher": "aes-encrypt",
  "/yaml": "json-yaml",
  "/jsonts": "json-ts",
  "/csv": "json-csv",
  "/sqlformat": "sql-format",
  "/deduplines": "dedup-lines",
  "/extractor": (state) => ((state.type as string) === "url" ? "extract-urls" : "extract-emails"),
  "/password": "password-gen",
  "/qrcode": "qrcode-gen",
  "/image": "image-compress",
};
```

### Flow

1. User clicks "Send to Recipe" on a tool page
2. Component resolves the step ID via `TOOL_STEP_MAP` (calling the function with current tool state if needed)
3. Current tool output + resolved step ID + params written to `localStorage` key `okrun:recipe:draft`
4. Navigate to `/recipe`
5. Recipe page detects draft, creates recipe with that step pre-filled, sets global input to the tool's output
6. Draft consumed and cleared

### Draft format

```ts
interface RecipeDraft {
  input: string;
  stepId: string;
  params: Record<string, string>;
  sourceTool: string;
}
```

Only tools with a `TOOL_STEP_MAP` entry show the button.

## Persistence

### File: `libs/recipe/storage.ts`

### localStorage keys

| Key                  | Type                  | Purpose                         |
| -------------------- | --------------------- | ------------------------------- |
| `okrun:recipe:list`  | `Recipe[]`            | All saved recipes               |
| `okrun:recipe:draft` | `RecipeDraft \| null` | Temporary draft from tool pages |

### API

```ts
function listRecipes(): Recipe[];
function getRecipe(id: string): Recipe | undefined;
function saveRecipe(recipe: Recipe): void;
function deleteRecipe(id: string): void;
function consumeDraft(): RecipeDraft | null;
```

### Behavior

- Opening `/recipe` always starts with a blank recipe
- Manual save only — user clicks "Save" to name and persist
- No auto-save, no auto-restore last recipe
- Draft is consumed once on `/recipe` page load (if present from tool page shortcut)

## SEO

### `page.tsx`

Follows existing tool page pattern — calls `generatePageMeta()` with:

- `path: "/recipe"`
- `title`: from i18n `tools.recipe.shortTitle`
- `description`: from i18n `tools.recipe.description`
- `ogImage: { type: "custom", title: "Recipe", desc: "..." }`

### JSON-LD

Include `JsonLd` component with `WebApplication` schema, consistent with other tool pages.

### Sitemap

`app/sitemap.ts` auto-includes `/recipe` once added to `TOOLS` array — no separate sitemap change needed.

## i18n

### Namespace

Add `recipe` to `i18n/request.ts` namespaces.

### Files

| File                                  | Content                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------- |
| `public/locales/en/recipe.json`       | All step names, param labels, button text, error messages, category names |
| `public/locales/{locale}/recipe.json` | Translations for 9 other locales                                          |
| `public/locales/en/tools.json`        | Add `recipe` tool entry with `shortTitle` + `description`                 |

### Translation key structure

```json
{
  "title": "Recipe",
  "input": "Input",
  "output": "Output",
  "addStep": "Add Step",
  "save": "Save",
  "delete": "Delete",
  "untitled": "Untitled Recipe",
  "expandAll": "Expand All",
  "collapseAll": "Collapse All",
  "disabled": "Step disabled — skipped in pipeline",
  "waitingInput": "Waiting for input...",
  "computing": "Computing...",
  "sourceStepOnlyAtStart": "Source steps can only be placed at the beginning",
  "typeMismatch": "Expected {expected} input, but received {received} output",
  "dropImageHere": "Drop image here or click to select",
  "noInputNeeded": "No input needed — source steps generate data",
  "categories": {
    "encoding": "Encoding",
    "crypto": "Crypto",
    "text": "Text",
    "format": "Format",
    "generators": "Generators",
    "visual": "Visual"
  },
  "steps": {
    "base64-encode": { "name": "Base64 Encode", "desc": "Encode text to Base64" },
    "base64-decode": { "name": "Base64 Decode", "desc": "Decode Base64 to text" },
    "url-encode-component": { "name": "URL Encode (Component)", "desc": "Encode URL component" },
    "url-decode-component": { "name": "URL Decode (Component)", "desc": "Decode URL component" },
    "url-encode-full": { "name": "URL Encode (Full)", "desc": "Encode full URL" },
    "url-decode-full": { "name": "URL Decode (Full)", "desc": "Decode full URL" },
    "hash-md5": { "name": "MD5 Hash", "desc": "Generate MD5 hash" },
    "hash-sha1": { "name": "SHA-1 Hash", "desc": "Generate SHA-1 hash" },
    "hash-sha256": { "name": "SHA-256 Hash", "desc": "Generate SHA-256 hash" },
    "hash-sha512": { "name": "SHA-512 Hash", "desc": "Generate SHA-512 hash" },
    "aes-encrypt": { "name": "AES Encrypt", "desc": "Encrypt text with AES" },
    "aes-decrypt": { "name": "AES Decrypt", "desc": "Decrypt AES-encrypted text" },
    "hmac-sha256": { "name": "HMAC-SHA256", "desc": "Generate HMAC-SHA256 signature" },
    "password-gen": { "name": "Password Generator", "desc": "Generate a secure password" },
    "text-camel": { "name": "camelCase", "desc": "Convert to camelCase" },
    "text-pascal": { "name": "PascalCase", "desc": "Convert to PascalCase" },
    "text-snake": { "name": "snake_case", "desc": "Convert to snake_case" },
    "text-kebab": { "name": "kebab-case", "desc": "Convert to kebab-case" },
    "text-upper": { "name": "UPPERCASE", "desc": "Convert to uppercase" },
    "text-lower": { "name": "lowercase", "desc": "Convert to lowercase" },
    "regex-replace": { "name": "Regex Replace", "desc": "Find and replace using regex" },
    "dedup-lines": { "name": "Remove Duplicate Lines", "desc": "Remove duplicate lines from text" },
    "extract-emails": { "name": "Extract Emails", "desc": "Extract email addresses from text" },
    "extract-urls": { "name": "Extract URLs", "desc": "Extract URLs from text" },
    "json-format": { "name": "JSON Format", "desc": "Format and beautify JSON" },
    "json-minify": { "name": "JSON Minify", "desc": "Minify JSON to compact form" },
    "json-yaml": { "name": "JSON → YAML", "desc": "Convert JSON to YAML" },
    "yaml-json": { "name": "YAML → JSON", "desc": "Convert YAML to JSON" },
    "json-ts": { "name": "JSON → TypeScript", "desc": "Generate TypeScript interfaces from JSON" },
    "json-csv": { "name": "JSON → CSV", "desc": "Convert JSON to CSV" },
    "csv-json": { "name": "CSV → JSON", "desc": "Convert CSV to JSON" },
    "sql-format": { "name": "SQL Format", "desc": "Format SQL query" },
    "sql-minify": { "name": "SQL Minify", "desc": "Minify SQL query" },
    "uuid-gen": { "name": "UUID Generator", "desc": "Generate UUID v4 or v7" },
    "qrcode-gen": { "name": "QR Code Generator", "desc": "Generate QR code from text" },
    "image-compress": { "name": "Image Compress", "desc": "Compress and resize images" }
  },
  "params": {
    "key": "Key",
    "length": "Length",
    "pattern": "Pattern",
    "replacement": "Replacement",
    "indent": "Indent",
    "delimiter": "Delimiter",
    "dialect": "Dialect",
    "quality": "Quality",
    "size": "Size",
    "errorLevel": "Error Correction",
    "format": "Format",
    "version": "Version",
    "count": "Count",
    "caseSensitive": "Case Sensitive",
    "trimWhitespace": "Trim Whitespace",
    "flags": "Flags",
    "rootName": "Root Name",
    "maxWidth": "Max Width",
    "maxHeight": "Max Height",
    "uppercase": "Uppercase (A-Z)",
    "lowercase": "Lowercase (a-z)",
    "numbers": "Numbers (0-9)",
    "symbols": "Symbols (!@#)"
  },
  "options": {
    "yes": "Yes",
    "no": "No"
  },
  "sendToRecipe": "Send to Recipe",
  "savedRecipes": "Saved Recipes",
  "stepsCount": "{count} steps"
}
```

## Testing

### Test files

| File                                     | Scope                                                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `libs/recipe/__tests__/engine.test.ts`   | Normal chain execution, disabled step skipping, error stop, source steps at position 0, empty pipeline passthrough, async steps |
| `libs/recipe/__tests__/registry.test.ts` | Step lookup, category grouping, fuzzy search, position-aware compatibility filtering                                            |
| `libs/recipe/__tests__/steps.test.ts`    | Each step's typical input/output, edge cases, parameter validation, error returns                                               |
| `libs/recipe/__tests__/storage.test.ts`  | CRUD, draft consumption, empty state                                                                                            |
| `libs/recipe/__tests__/compat.test.ts`   | `isCompatible` all combinations (text→text, text→image, image→image, none→text blocked after step 0, etc.)                      |

### vitest.config.ts

Add recipe scope: `"libs/recipe/**/*.test.ts"` to the `include` array.

### Not tested

- UI components (consistent with project convention)
- Drag-to-reorder interaction

## File Structure

### New files

```
libs/recipe/
├── types.ts
├── registry.ts
├── engine.ts
├── storage.ts
├── tool-step-map.ts
├── steps/
│   ├── encoding.ts
│   ├── crypto.ts
│   ├── text.ts
│   ├── format.ts
│   ├── generators.ts
│   └── visual.ts
└── __tests__/
    ├── engine.test.ts
    ├── registry.test.ts
    ├── steps.test.ts
    ├── storage.test.ts
    └── compat.test.ts

app/[locale]/recipe/
├── page.tsx
└── recipe-page.tsx

components/recipe/
├── pipeline.tsx
├── step-card.tsx
├── step-picker.tsx
├── recipe-panel.tsx
├── global-input.tsx
└── send-to-recipe.tsx

public/locales/{locale}/
├── recipe.json
└── tools.json (updated)
```

### Modified existing files

| File                           | Change                                                                                                                                                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `libs/tools.ts`                | Add `recipe` tool entry to `TOOLS` array (key: "recipe", path: "/recipe"), add to `TOOL_CATEGORIES` under "generators" category, add `TOOL_RELATIONS["recipe"]` with links to json/base64/hashing/textcase |
| `i18n/request.ts`              | Add "recipe" to namespaces array                                                                                                                                                                           |
| `libs/storage-keys.ts`         | Add `recipeList: "okrun:recipe:list"` and `recipeDraft: "okrun:recipe:draft"`                                                                                                                              |
| `vitest.config.ts`             | Add `"libs/recipe/**/*.test.ts"` to test include array                                                                                                                                                     |
| `app/sitemap.ts`               | No change needed — auto-included via TOOLS array                                                                                                                                                           |
| Tool page files (`*-page.tsx`) | Add `<SendToRecipe />` button where TOOL_STEP_MAP has entry                                                                                                                                                |

## Tool Registration Details

### `libs/tools.ts` changes

```ts
// Add to TOOLS array:
{ key: "recipe", path: "/recipe", icon: FlaskConical, emoji: "🧪", sameAs: ["https://gchq.github.io/CyberChef/"] }

// Add to TOOL_CATEGORIES "generators" group:
generators: ["uuid", "cron", "unixtime", "qrcode", "recipe"]

// Add TOOL_RELATIONS (respect max 5 per tool, bidirectional invariant):
recipe: ["json", "base64", "hashing"]
```

Reverse relations (maintain bidirectional invariant tested in `tool-relations.test.ts`):

- `json` (currently 5 relations: csv/yaml/diff/regex/jsonts) — swap least relevant ("jsonts") for "recipe": `["csv", "yaml", "diff", "regex", "recipe"]`
- `base64` (currently 3 relations: urlencoder/hashing/cipher) — append "recipe": `["urlencoder", "hashing", "cipher", "recipe"]`
- `hashing` (currently 4 relations: checksum/cipher/base64/jwt) — append "recipe": `["checksum", "cipher", "base64", "jwt", "recipe"]`

## Example Pipelines

```
Password Gen (none→text, position 0) → UPPERCASE (text→text) → QR Code (text→image)
[Global input hidden, source step generates data]

Input: JSON string
→ JSON Format (text→text)
→ JSON → YAML (text→text)
→ Output: formatted YAML

Input: raw text with emails
→ Extract Emails (text→text)
→ Deduplicate Lines (text→text)
→ Output: unique emails

UUID Gen (none→text, position 0) → Base64 Encode (text→text)
[Global input hidden, UUID generated then encoded]
```
