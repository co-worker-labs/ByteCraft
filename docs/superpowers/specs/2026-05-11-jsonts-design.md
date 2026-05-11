# JSON to TypeScript Tool — Design Spec

## Overview

Add a new tool at `/jsonts` that converts JSON or JSON5 input into TypeScript interface/type definitions. All processing runs in the browser. Nested objects are automatically extracted into separate named types. Users can customize root name, output format (interface vs type), and export modifier.

## Approach

Fork `json-to-ts` core logic inline (remove `es7-shim` and `hash.js` dependencies, keep `pluralize`). Extend with JSON5 support, export toggle, and null-handling improvements.

- **Why not quicktype**: 2MB+ bundle with 14 dependencies, overkill for single-target conversion.
- **Why not vanilla hand-write**: The array merging, union type inference, and smart naming logic is ~400 lines of non-trivial code. Standing on proven logic reduces risk.

## File Structure

### New Files

| File                                  | Purpose                                                       |
| ------------------------------------- | ------------------------------------------------------------- |
| `app/[locale]/jsonts/page.tsx`        | Route entry — SEO metadata, JSON-LD, renders client component |
| `app/[locale]/jsonts/jsonts-page.tsx` | Client page component — UI and business logic                 |
| `libs/jsonts/main.ts`                 | Core conversion engine                                        |
| `libs/jsonts/__tests__/main.test.ts`  | Vitest tests                                                  |
| `public/locales/{locale}/jsonts.json` | 10 locale files                                               |

### Modified Files

| File                                 | Change                                                            |
| ------------------------------------ | ----------------------------------------------------------------- |
| `libs/tools.ts`                      | Add `jsonts` to TOOLS, TOOL_CATEGORIES (encoding), TOOL_RELATIONS |
| `public/locales/{locale}/tools.json` | Add `jsonts` entry (10 locales)                                   |
| `package.json`                       | Add `pluralize` dependency                                        |

## Tool Registration

- **key**: `jsonts`
- **path**: `/jsonts`
- **icon**: `FileCode2` (lucide-react) — distinct from `FileCode` used by base64
- **emoji**: `🔷`
- **category**: `encoding`
- **sameAs**: `["https://www.typescriptlang.org/"]`
- **related tools**: `json`, `csv`, `yaml` (bidirectional — all four get reverse links)

### TOOL_RELATIONS changes

```ts
// New entry
jsonts: ["json", "csv", "yaml"],

// Add "jsonts" to existing entries
json: [...existing, "jsonts"],
csv: [...existing, "jsonts"],
yaml: [...existing, "jsonts"],
```

## Dependencies

- `pluralize` (28KB) — singularize array element names for smart type naming
- `json5` (already in project) — relaxed JSON parsing

## Core Conversion Engine (`libs/jsonts/main.ts`)

### API

```ts
interface ConvertOptions {
  rootName: string; // default "Root"
  useTypeAlias: boolean; // false → interface, true → type
  exportKeyword: boolean; // prepend export
}

interface ConvertResult {
  success: boolean;
  types?: string; // generated TypeScript code
  error?: string; // error message
}

function jsonToTs(json: string, options: ConvertOptions): ConvertResult;
```

### Processing Pipeline

1. **Parse**: Try `JSON.parse` first, fall back to `JSON5.parse`, return error if both fail
2. **Type inference**: Recursively traverse parsed value, build type structure tree
   - Auto-increment counter replaces hash.js for type IDs
   - `pluralize` singularizes array element names (e.g. `users` → `User`)
3. **Code generation**: Render type tree to TypeScript
   - `useTypeAlias` selects `interface` or `type`
   - Nested objects extracted as separate types, sub-types ordered before referencing types
   - `exportKeyword` wraps each type with `export`
4. **Output**: Single string with types separated by blank lines

### Type Inference Rules

| JSON value                                  | TypeScript type                                                 |
| ------------------------------------------- | --------------------------------------------------------------- |
| `"hello"`                                   | `string`                                                        |
| `42`                                        | `number`                                                        |
| `true` / `false`                            | `boolean`                                                       |
| `null` (standalone field)                   | `field?: any \| null` — type unknown when only null is observed |
| `null` (in union context, e.g. `[1, null]`) | `number \| null` — type inferred from non-null siblings         |
| `undefined`                                 | field marked optional `field?: any`                             |
| `{}`                                        | empty `interface {}`                                            |
| `[]`                                        | `any[]`                                                         |
| `{ nested: { ... } }`                       | extracted as separate named type                                |
| `[1, "a", true]`                            | `(number \| string \| boolean)[]`                               |
| `[{a:1}, {a:1,b:2}]`                        | merged: `a: number; b?: number`                                 |

### Input Validation

- Empty input → output shows placeholder, no error
- Primitive root value (string/number/boolean/null) → error: "Please enter a JSON object or array"
- Invalid syntax → red error below input with line/column number

### Key Name Handling

- Valid identifiers: `name` → `name: string`
- Special characters/spaces: `hello world` → `'hello world': string`
- Empty string key: `""` → `"": string`
- Reserved words: kept as-is (TypeScript allows reserved words as property names)

## UI (`jsonts-page.tsx`)

### Layout

1. **JSON Input** (cyan label) — StyledTextarea with CopyButton, Clear link
2. **Options Bar** — Root name input, interface/type toggle, export switch, Clear All button
3. **TypeScript Output** (purple label) — StyledTextarea with CopyButton, syntax-colored output, Clear link
4. **Description Section** — What is, How to use, Use cases, Limitations, FAQ
5. **Related Tools** — json, csv, yaml

### Interaction

- **Real-time conversion**: Output updates automatically as input or options change. No Convert button — consistent with JSON Formatter, Hashing, and most other tools in the project.
- **Error display**: Red error bar below input area showing line/column for parse errors
- **Sub-type ordering**: Referenced types appear before referencing types

## Testing (`libs/jsonts/__tests__/main.test.ts`)

### Test Groups

| Group           | Cases                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------- |
| Primitive types | string, number, boolean, null, empty object, empty array                                           |
| Null handling   | standalone null → `any \| null`, null in array union → inferred type, null mixed with other fields |
| Nested objects  | single-level, multi-level, PascalCase naming                                                       |
| Arrays          | primitive arrays, object arrays, mixed arrays, empty arrays, nested arrays                         |
| Union types     | `[1, "a"]` → `number \| string`, same-type deduplication                                           |
| Optional fields | null → optional, undefined → optional, partial object fields in arrays                             |
| Options         | custom rootName, interface vs type, export toggle                                                  |
| JSON5           | single quotes, trailing commas, comments, unquoted keys                                            |
| Errors          | invalid JSON, primitive root value, empty input                                                    |
| Edge cases      | numeric keys, special character keys, empty string keys, reserved word keys                        |
| Deduplication   | identical nested structures share the same type reference                                          |

## i18n

### Tool Registration (`tools.json`)

Each locale needs `title`, `description`, `shortTitle`, and optionally `searchTerms`.

**English (source of truth)**:

```json
{
  "jsonts": {
    "title": "JSON to TypeScript - Generate Interfaces & Types from JSON",
    "shortTitle": "JSON / TypeScript",
    "description": "Convert JSON or JSON5 to TypeScript interfaces and type definitions. Supports nested objects, union types, array merging, and JSON5."
  }
}
```

**All locales**:

| Locale | shortTitle         | searchTerms                                  |
| ------ | ------------------ | -------------------------------------------- |
| en     | JSON / TypeScript  | _(none needed)_                              |
| zh-CN  | JSON 转 TypeScript | `jsonzhuantypescript jsonzts leixing jiekou` |
| zh-TW  | JSON 轉 TypeScript | `jsonzhuantypescript jsonzts leixing jiekou` |
| ja     | JSON → TypeScript  | `jsontotypescript jtts kata taipu`           |
| ko     | JSON → TypeScript  | `jsontotypescript jtts taipu inteopeiseeu`   |
| es     | JSON → TypeScript  | _(optional)_                                 |
| pt-BR  | JSON → TypeScript  | _(optional)_                                 |
| fr     | JSON → TypeScript  | _(optional)_                                 |
| de     | JSON → TypeScript  | _(optional)_                                 |
| ru     | JSON → TypeScript  | _(optional)_                                 |

### Translation Keys (`jsonts.json`)

- `jsonPlaceholder` — input textarea placeholder (e.g. "Paste JSON here…")
- `tsPlaceholder` — output textarea placeholder (e.g. "TypeScript output will appear here")
- `rootName` — label for root name input (e.g. "Root Name")
- `invalidJson` — parse error prefix (e.g. "Invalid JSON")
- `primitiveError` — primitive input error message (e.g. "Please enter a JSON object or array")
- `interface` — label for interface option toggle
- `type` — label for type alias option toggle
- `addExport` — label for export switch (e.g. "Add export")
- `descriptions.*` — see below

### Description Section Keys (`descriptions.*`)

| Key                        | Purpose                                    |
| -------------------------- | ------------------------------------------ |
| `aeoDefinition`            | One-sentence SEO summary (used in JSON-LD) |
| `whatIsTitle`              | "What is JSON to TypeScript?" heading      |
| `whatIsP1`                 | Explanation paragraph                      |
| `stepsTitle`               | "How to use" heading                       |
| `step1Title` / `step1Text` | Step 1: Paste JSON                         |
| `step2Title` / `step2Text` | Step 2: Configure options                  |
| `step3Title` / `step3Text` | Step 3: Copy TypeScript output             |
| `useCasesP1`               | Common use cases paragraph                 |
| `limitationsP1`            | Limitations note                           |
| `faq1Q` / `faq1A`          | FAQ: Does it support JSON5?                |
| `faq2Q` / `faq2A`          | FAQ: What about nested objects?            |
| `faq3Q` / `faq3A`          | FAQ: Can I export types?                   |

### Shared Keys (reuse from `common.json`)

`copy`, `clear`, `clearAll` — no `export` key exists in `common.json`; use a tool-specific key `addExport` instead.

## Vitest Config

Add `"libs/jsonts/**/*.test.ts"` to the test scopes in `vitest.config.ts`.
