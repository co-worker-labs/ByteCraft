# Recipe System — Part 2: Step Definitions (36 Steps)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all 36 step `execute()` functions across 6 categories, register them in the registry, and test each step's typical input/output and edge cases.

**Architecture:** Each category is a separate file (`libs/recipe/steps/encoding.ts`, etc.) that exports a `RecipeStepDef[]` array. A central `libs/recipe/steps/index.ts` barrel file collects all arrays and registers them. Steps reuse existing `libs/` functions where available (textcase, yaml, jsonts, csv, sqlformat, deduplines, extractor, password, qrcode, image). Simple operations (base64, url-encoding, hashing, case conversion) use lightweight inline implementations.

**Tech Stack:** TypeScript, Vitest, CryptoJS (for hashing/HMAC/AES), existing libs (textcase, csv, sqlformat, etc.)

**Depends on:** Part 1 (types, engine, registry)

**Produces:** Fully registered registry with 36 tested steps.

---

## File Structure

| Action | File                                  | Responsibility                                                                       |
| ------ | ------------------------------------- | ------------------------------------------------------------------------------------ |
| Create | `libs/recipe/steps/encoding.ts`       | 6 encoding steps (base64 encode/decode, url encode/decode ×2)                        |
| Create | `libs/recipe/steps/crypto.ts`         | 8 crypto steps (4 hashes, AES encrypt/decrypt, HMAC-SHA256, password-gen)            |
| Create | `libs/recipe/steps/text.ts`           | 10 text steps (6 case conversions, regex replace, dedup, extract emails/urls)        |
| Create | `libs/recipe/steps/format.ts`         | 9 format steps (json format/minify, json↔yaml, json-ts, json↔csv, sql format/minify) |
| Create | `libs/recipe/steps/generators.ts`     | 2 generator steps (uuid-gen, qrcode-gen)                                             |
| Create | `libs/recipe/steps/visual.ts`         | 1 visual step (image-compress)                                                       |
| Create | `libs/recipe/steps/index.ts`          | Barrel file that registers all steps                                                 |
| Create | `libs/recipe/__tests__/steps.test.ts` | Tests for each step                                                                  |

---

### Task 1: Encoding Steps (6 steps)

**Files:**

- Create: `libs/recipe/steps/encoding.ts`

- [ ] **Step 1: Write encoding steps**

```ts
import type { RecipeStepDef } from "../types";

export const encodingSteps: RecipeStepDef[] = [
  {
    id: "base64-encode",
    name: "Base64 Encode",
    category: "encoding",
    icon: "Binary",
    description: "Encode text to Base64",
    inputType: "text",
    outputType: "text",
    parameters: [],
    execute: async (input) => {
      try {
        const encoded = btoa(unescape(encodeURIComponent(input)));
        return { ok: true as const, output: encoded };
      } catch (e) {
        return { ok: false as const, error: `Base64 encode failed: ${(e as Error).message}` };
      }
    },
  },
  {
    id: "base64-decode",
    name: "Base64 Decode",
    category: "encoding",
    icon: "Binary",
    description: "Decode Base64 to text",
    inputType: "text",
    outputType: "text",
    parameters: [],
    execute: async (input) => {
      try {
        const decoded = decodeURIComponent(escape(atob(input.trim())));
        return { ok: true as const, output: decoded };
      } catch (e) {
        return { ok: false as const, error: `Base64 decode failed: ${(e as Error).message}` };
      }
    },
  },
  {
    id: "url-encode-component",
    name: "URL Encode (Component)",
    category: "encoding",
    icon: "Link",
    description: "Encode URL component",
    inputType: "text",
    outputType: "text",
    parameters: [],
    execute: async (input) => {
      try {
        return { ok: true as const, output: encodeURIComponent(input) };
      } catch (e) {
        return { ok: false as const, error: `URL encode failed: ${(e as Error).message}` };
      }
    },
  },
  {
    id: "url-decode-component",
    name: "URL Decode (Component)",
    category: "encoding",
    icon: "Link",
    description: "Decode URL component",
    inputType: "text",
    outputType: "text",
    parameters: [],
    execute: async (input) => {
      try {
        return { ok: true as const, output: decodeURIComponent(input) };
      } catch (e) {
        return { ok: false as const, error: `URL decode failed: ${(e as Error).message}` };
      }
    },
  },
  {
    id: "url-encode-full",
    name: "URL Encode (Full)",
    category: "encoding",
    icon: "Link",
    description: "Encode full URL",
    inputType: "text",
    outputType: "text",
    parameters: [],
    execute: async (input) => {
      try {
        return { ok: true as const, output: encodeURI(input) };
      } catch (e) {
        return { ok: false as const, error: `URL encode failed: ${(e as Error).message}` };
      }
    },
  },
  {
    id: "url-decode-full",
    name: "URL Decode (Full)",
    category: "encoding",
    icon: "Link",
    description: "Decode full URL",
    inputType: "text",
    outputType: "text",
    parameters: [],
    execute: async (input) => {
      try {
        return { ok: true as const, output: decodeURI(input) };
      } catch (e) {
        return { ok: false as const, error: `URL decode failed: ${(e as Error).message}` };
      }
    },
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add libs/recipe/steps/encoding.ts
git commit -m "feat(recipe): add encoding step definitions (base64, url)"
```

---

### Task 2: Crypto Steps (8 steps)

**Files:**

- Create: `libs/recipe/steps/crypto.ts`

- [ ] **Step 1: Write crypto steps**

CryptoJS is already a project dependency. Import it for hashing, HMAC, and AES.

```ts
import CryptoJS from "crypto-js";
import type { RecipeStepDef, StepParam } from "../types";
import {
  generate as generatePassword,
  copyPassword,
  random_uppercase_checked,
  random_lowercase_checked,
  random_numbers_checked,
  random_symbols_checked,
} from "../../password/main";

const keyParam: StepParam = {
  id: "key",
  type: "text",
  label: "Key",
  defaultValue: "",
  placeholder: "Enter key",
};

function makeHashStep(
  id: string,
  name: string,
  description: string,
  hashFn: (input: string) => string
): RecipeStepDef {
  return {
    id,
    name,
    category: "crypto",
    icon: "Hash",
    description,
    inputType: "text",
    outputType: "text",
    parameters: [],
    execute: async (input) => {
      try {
        return { ok: true as const, output: hashFn(input) };
      } catch (e) {
        return { ok: false as const, error: `${name} failed: ${(e as Error).message}` };
      }
    },
  };
}

export const cryptoSteps: RecipeStepDef[] = [
  makeHashStep("hash-md5", "MD5 Hash", "Generate MD5 hash", (input) =>
    CryptoJS.MD5(input).toString()
  ),
  makeHashStep("hash-sha1", "SHA-1 Hash", "Generate SHA-1 hash", (input) =>
    CryptoJS.SHA1(input).toString()
  ),
  makeHashStep("hash-sha256", "SHA-256 Hash", "Generate SHA-256 hash", (input) =>
    CryptoJS.SHA256(input).toString()
  ),
  makeHashStep("hash-sha512", "SHA-512 Hash", "Generate SHA-512 hash", (input) =>
    CryptoJS.SHA512(input).toString()
  ),
  {
    id: "aes-encrypt",
    name: "AES Encrypt",
    category: "crypto",
    icon: "Lock",
    description: "Encrypt text with AES",
    inputType: "text",
    outputType: "text",
    parameters: [keyParam],
    execute: async (input, params) => {
      const key = params.key ?? "";
      if (!key) return { ok: false as const, error: "Encryption key is required" };
      try {
        const encrypted = CryptoJS.AES.encrypt(input, key).toString();
        return { ok: true as const, output: encrypted };
      } catch (e) {
        return { ok: false as const, error: `AES encrypt failed: ${(e as Error).message}` };
      }
    },
  },
  {
    id: "aes-decrypt",
    name: "AES Decrypt",
    category: "crypto",
    icon: "Lock",
    description: "Decrypt AES-encrypted text",
    inputType: "text",
    outputType: "text",
    parameters: [keyParam],
    execute: async (input, params) => {
      const key = params.key ?? "";
      if (!key) return { ok: false as const, error: "Decryption key is required" };
      try {
        const bytes = CryptoJS.AES.decrypt(input, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted)
          return {
            ok: false as const,
            error: "Decryption failed — wrong key or invalid ciphertext",
          };
        return { ok: true as const, output: decrypted };
      } catch (e) {
        return { ok: false as const, error: `AES decrypt failed: ${(e as Error).message}` };
      }
    },
  },
  {
    id: "hmac-sha256",
    name: "HMAC-SHA256",
    category: "crypto",
    icon: "Shield",
    description: "Generate HMAC-SHA256 signature",
    inputType: "text",
    outputType: "text",
    parameters: [keyParam],
    execute: async (input, params) => {
      const key = params.key ?? "";
      if (!key) return { ok: false as const, error: "HMAC key is required" };
      try {
        const hmac = CryptoJS.HmacSHA256(input, key).toString();
        return { ok: true as const, output: hmac };
      } catch (e) {
        return { ok: false as const, error: `HMAC-SHA256 failed: ${(e as Error).message}` };
      }
    },
  },
  {
    id: "password-gen",
    name: "Password Generator",
    category: "crypto",
    icon: "KeyRound",
    description: "Generate a secure password",
    inputType: "none",
    outputType: "text",
    parameters: [
      { id: "length", type: "text", label: "Length", defaultValue: "16" },
      {
        id: "uppercase",
        type: "select",
        label: "Uppercase (A-Z)",
        defaultValue: "yes",
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      },
      {
        id: "lowercase",
        type: "select",
        label: "Lowercase (a-z)",
        defaultValue: "yes",
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      },
      {
        id: "numbers",
        type: "select",
        label: "Numbers (0-9)",
        defaultValue: "yes",
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      },
      {
        id: "symbols",
        type: "select",
        label: "Symbols (!@#)",
        defaultValue: "no",
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      },
    ],
    execute: async (_input, params) => {
      try {
        const length = parseInt(params.length ?? "16", 10);
        if (isNaN(length) || length < 4 || length > 128) {
          return { ok: false as const, error: "Length must be between 4 and 128" };
        }
        let flags = 0;
        if (params.uppercase !== "no") flags |= random_uppercase_checked;
        if (params.lowercase !== "no") flags |= random_lowercase_checked;
        if (params.numbers !== "no") flags |= random_numbers_checked;
        if (params.symbols === "yes") flags |= random_symbols_checked;
        if (flags === 0) flags = random_uppercase_checked | random_lowercase_checked;
        const pwArray = generatePassword("Random", flags, length);
        const pw = copyPassword("Random", pwArray);
        return { ok: true as const, output: pw };
      } catch (e) {
        return { ok: false as const, error: `Password generation failed: ${(e as Error).message}` };
      }
    },
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add libs/recipe/steps/crypto.ts
git commit -m "feat(recipe): add crypto step definitions (hash, AES, HMAC, password)"
```

---

### Task 3: Text Steps (10 steps)

**Files:**

- Create: `libs/recipe/steps/text.ts`

- [ ] **Step 1: Write text steps**

Reuses `libs/textcase/main.ts` FORMATS map, `libs/deduplines/main.ts`, `libs/extractor/main.ts`.

```ts
import { camelCase, pascalCase, snakeCase, kebabCase } from "change-case";
import type { RecipeStepDef, StepParam } from "../types";
import { dedupLines, defaultOptions } from "../../deduplines/main";
import { extract } from "../../extractor/main";

function makeCaseStep(
  id: string,
  name: string,
  description: string,
  convert: (input: string) => string
): RecipeStepDef {
  return {
    id,
    name,
    category: "text",
    icon: "CaseSensitive",
    description,
    inputType: "text",
    outputType: "text",
    parameters: [],
    execute: async (input) => {
      try {
        return { ok: true as const, output: convert(input) };
      } catch (e) {
        return { ok: false as const, error: `${name} failed: ${(e as Error).message}` };
      }
    },
  };
}

const selectYesNo = (id: string, label: string, defaultValue: string): StepParam => ({
  id,
  type: "select",
  label,
  defaultValue,
  options: [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ],
});

export const textSteps: RecipeStepDef[] = [
  makeCaseStep("text-camel", "camelCase", "Convert to camelCase", camelCase),
  makeCaseStep("text-pascal", "PascalCase", "Convert to PascalCase", pascalCase),
  makeCaseStep("text-snake", "snake_case", "Convert to snake_case", snakeCase),
  makeCaseStep("text-kebab", "kebab-case", "Convert to kebab-case", kebabCase),
  makeCaseStep("text-upper", "UPPERCASE", "Convert to uppercase", (s) => s.toUpperCase()),
  makeCaseStep("text-lower", "lowercase", "Convert to lowercase", (s) => s.toLowerCase()),
  {
    id: "regex-replace",
    name: "Regex Replace",
    category: "text",
    icon: "Regex",
    description: "Find and replace using regex",
    inputType: "text",
    outputType: "text",
    parameters: [
      { id: "pattern", type: "text", label: "Pattern", defaultValue: "", placeholder: "e.g. \\d+" },
      { id: "replacement", type: "text", label: "Replacement", defaultValue: "" },
      { id: "flags", type: "text", label: "Flags", defaultValue: "g" },
    ],
    execute: async (input, params) => {
      try {
        const { pattern, replacement, flags } = params;
        if (!pattern) return { ok: false as const, error: "Pattern is required" };
        const re = new RegExp(pattern, flags || "g");
        return { ok: true as const, output: input.replace(re, replacement ?? "") };
      } catch (e) {
        return { ok: false as const, error: `Regex replace failed: ${(e as Error).message}` };
      }
    },
  },
  {
    id: "dedup-lines",
    name: "Remove Duplicate Lines",
    category: "text",
    icon: "ListFilter",
    description: "Remove duplicate lines from text",
    inputType: "text",
    outputType: "text",
    parameters: [
      selectYesNo("caseSensitive", "Case Sensitive", "yes"),
      selectYesNo("trimWhitespace", "Trim Whitespace", "yes"),
    ],
    execute: async (input, params) => {
      try {
        const result = dedupLines(input, {
          ...defaultOptions,
          caseSensitive: params.caseSensitive !== "no",
          trimLines: params.trimWhitespace !== "no",
          removeEmpty: true,
        });
        return { ok: true as const, output: result.output };
      } catch (e) {
        return { ok: false as const, error: `Dedup failed: ${(e as Error).message}` };
      }
    },
  },
  {
    id: "extract-emails",
    name: "Extract Emails",
    category: "text",
    icon: "Mail",
    description: "Extract email addresses from text",
    inputType: "text",
    outputType: "text",
    parameters: [],
    execute: async (input) => {
      try {
        const results = extract(input, ["email"]);
        const emails = [...new Set(results.map((r) => r.value))];
        return { ok: true as const, output: emails.join("\n") };
      } catch (e) {
        return { ok: false as const, error: `Extract emails failed: ${(e as Error).message}` };
      }
    },
  },
  {
    id: "extract-urls",
    name: "Extract URLs",
    category: "text",
    icon: "Globe",
    description: "Extract URLs from text",
    inputType: "text",
    outputType: "text",
    parameters: [],
    execute: async (input) => {
      try {
        const results = extract(input, ["url"]);
        const urls = [...new Set(results.map((r) => r.value))];
        return { ok: true as const, output: urls.join("\n") };
      } catch (e) {
        return { ok: false as const, error: `Extract URLs failed: ${(e as Error).message}` };
      }
    },
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add libs/recipe/steps/text.ts
git commit -m "feat(recipe): add text step definitions (case, regex, dedup, extract)"
```

---

### Task 4: Format Steps (9 steps)

**Files:**

- Create: `libs/recipe/steps/format.ts`

- [ ] **Step 1: Write format steps**

Reuses `libs/csv/convert.ts`, `libs/sqlformat/main.ts`, `libs/jsonts/main.ts`. For YAML, uses the `yaml` package directly (already a dependency — see `app/[locale]/yaml/yaml-page.tsx` using `import { stringify, parseAllDocuments } from "yaml"`).

```ts
import { stringify as yamlStringify, parseAllDocuments } from "yaml";
import { formatSql, compressSql } from "../../sqlformat/main";
import { convert as csvConvert } from "../../csv/convert";
import type { ConvertOptions as JsontsConvertOptions, ConvertResult } from "../../jsonts/main";
import type { RecipeStepDef, StepParam } from "../types";

const indentParam: StepParam = {
  id: "indent",
  type: "select",
  label: "Indent",
  defaultValue: "2",
  options: [
    { label: "2 spaces", value: "2" },
    { label: "4 spaces", value: "4" },
    { label: "Tab", value: "tab" },
  ],
};

const delimiterParam: StepParam = {
  id: "delimiter",
  type: "select",
  label: "Delimiter",
  defaultValue: "comma",
  options: [
    { label: "Comma", value: "comma" },
    { label: "Tab", value: "tab" },
    { label: "Semicolon", value: "semicolon" },
  ],
};

const dialectParam: StepParam = {
  id: "dialect",
  type: "select",
  label: "Dialect",
  defaultValue: "sql",
  options: [
    { label: "SQL", value: "sql" },
    { label: "MySQL", value: "mysql" },
    { label: "PostgreSQL", value: "postgresql" },
    { label: "MariaDB", value: "mariadb" },
    { label: "SQLite", value: "sqlite" },
    { label: "TransactSQL", value: "transactsql" },
    { label: "PL/SQL", value: "plsql" },
  ],
};

function resolveIndent(indent: string): number | string {
  if (indent === "tab") return "\t";
  return parseInt(indent, 10) || 2;
}

function resolveDelimiter(delimiter: string): string {
  switch (delimiter) {
    case "tab":
      return "\t";
    case "semicolon":
      return ";";
    default:
      return ",";
  }
}

export const formatSteps: RecipeStepDef[] = [
  {
    id: "json-format",
    name: "JSON Format",
    category: "format",
    icon: "Braces",
    description: "Format and beautify JSON",
    inputType: "text",
    outputType: "text",
    parameters: [indentParam],
    execute: async (input, params) => {
      try {
        const parsed = JSON.parse(input);
        const indent = resolveIndent(params.indent ?? "2");
        return { ok: true as const, output: JSON.stringify(parsed, null, indent) };
      } catch (e) {
        return { ok: false as const, error: `JSON parse failed: ${(e as Error).message}` };
      }
    },
  },
  {
    id: "json-minify",
    name: "JSON Minify",
    category: "format",
    icon: "Minimize2",
    description: "Minify JSON to compact form",
    inputType: "text",
    outputType: "text",
    parameters: [],
    execute: async (input) => {
      try {
        const parsed = JSON.parse(input);
        return { ok: true as const, output: JSON.stringify(parsed) };
      } catch (e) {
        return { ok: false as const, error: `JSON parse failed: ${(e as Error).message}` };
      }
    },
  },
  {
    id: "json-yaml",
    name: "JSON → YAML",
    category: "format",
    icon: "FileText",
    description: "Convert JSON to YAML",
    inputType: "text",
    outputType: "text",
    parameters: [],
    execute: async (input) => {
      try {
        const parsed = JSON.parse(input);
        return { ok: true as const, output: yamlStringify(parsed) };
      } catch (e) {
        return { ok: false as const, error: `JSON→YAML failed: ${(e as Error).message}` };
      }
    },
  },
  {
    id: "yaml-json",
    name: "YAML → JSON",
    category: "format",
    icon: "FileText",
    description: "Convert YAML to JSON",
    inputType: "text",
    outputType: "text",
    parameters: [indentParam],
    execute: async (input, params) => {
      try {
        const docs = parseAllDocuments(input);
        const indent = resolveIndent(params.indent ?? "2");
        if (docs.length === 1) {
          const obj = docs[0].toJSON();
          return { ok: true as const, output: JSON.stringify(obj, null, indent) };
        }
        const arr = docs.map((d) => d.toJSON());
        return { ok: true as const, output: JSON.stringify(arr, null, indent) };
      } catch (e) {
        return { ok: false as const, error: `YAML→JSON failed: ${(e as Error).message}` };
      }
    },
  },
  {
    id: "json-ts",
    name: "JSON → TypeScript",
    category: "format",
    icon: "FileCode2",
    description: "Generate TypeScript interfaces from JSON",
    inputType: "text",
    outputType: "text",
    parameters: [{ id: "rootName", type: "text", label: "Root Name", defaultValue: "Root" }],
    execute: async (input, params) => {
      try {
        const { convert: jsontsConvert } = await import("../../jsonts/main");
        const result: ConvertResult = jsontsConvert(input, {
          rootName: params.rootName || "Root",
          useTypeAlias: false,
          exportKeyword: false,
        });
        if (result.success && result.types) {
          return { ok: true as const, output: result.types };
        }
        return { ok: false as const, error: result.error ?? "Conversion failed" };
      } catch (e) {
        return { ok: false as const, error: `JSON→TS failed: ${(e as Error).message}` };
      }
    },
  },
  {
    id: "json-csv",
    name: "JSON → CSV",
    category: "format",
    icon: "Table",
    description: "Convert JSON to CSV",
    inputType: "text",
    outputType: "text",
    parameters: [delimiterParam],
    execute: async (input, params) => {
      try {
        const result = csvConvert(input, "json", "csv", {
          delimiter: resolveDelimiter(params.delimiter ?? "comma"),
        });
        if (result.error) return { ok: false as const, error: result.error };
        return { ok: true as const, output: result.output };
      } catch (e) {
        return { ok: false as const, error: `JSON→CSV failed: ${(e as Error).message}` };
      }
    },
  },
  {
    id: "csv-json",
    name: "CSV → JSON",
    category: "format",
    icon: "Table",
    description: "Convert CSV to JSON",
    inputType: "text",
    outputType: "text",
    parameters: [delimiterParam, indentParam],
    execute: async (input, params) => {
      try {
        const indent = resolveIndent(params.indent ?? "2");
        const result = csvConvert(input, "csv", "json", {
          delimiter: resolveDelimiter(params.delimiter ?? "comma"),
          indent: typeof indent === "string" ? 2 : indent,
        });
        if (result.error) return { ok: false as const, error: result.error };
        return { ok: true as const, output: result.output };
      } catch (e) {
        return { ok: false as const, error: `CSV→JSON failed: ${(e as Error).message}` };
      }
    },
  },
  {
    id: "sql-format",
    name: "SQL Format",
    category: "format",
    icon: "FileCode",
    description: "Format SQL query",
    inputType: "text",
    outputType: "text",
    parameters: [dialectParam],
    execute: async (input, params) => {
      try {
        const output = formatSql(input, {
          language: (params.dialect ?? "sql") as any,
          tabWidth: 2,
          useTabs: false,
          keywordCase: "upper",
          functionCase: "preserve",
          indentStyle: "standard",
          linesBetweenQueries: 1,
        });
        return { ok: true as const, output };
      } catch (e) {
        return { ok: false as const, error: `SQL format failed: ${(e as Error).message}` };
      }
    },
  },
  {
    id: "sql-minify",
    name: "SQL Minify",
    category: "format",
    icon: "Minimize2",
    description: "Minify SQL query",
    inputType: "text",
    outputType: "text",
    parameters: [dialectParam],
    execute: async (input, params) => {
      try {
        const output = compressSql(input);
        return { ok: true as const, output };
      } catch (e) {
        return { ok: false as const, error: `SQL minify failed: ${(e as Error).message}` };
      }
    },
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add libs/recipe/steps/format.ts
git commit -m "feat(recipe): add format step definitions (json, yaml, csv, sql)"
```

---

### Task 5: Generator Steps (2 steps)

**Files:**

- Create: `libs/recipe/steps/generators.ts`

- [ ] **Step 1: Write generator steps**

`uuid-gen` reuses `libs/uuid/main.ts`. `qrcode-gen` uses `qr-code-styling` (already a dependency) to generate QR code, then converts to data URI. Note: `qrcode-gen` is async and requires DOM (canvas), so it only works in browser context.

```ts
import { generate as uuidGenerate, formatUuid } from "../../uuid/main";
import type { RecipeStepDef } from "../types";

export const generatorSteps: RecipeStepDef[] = [
  {
    id: "uuid-gen",
    name: "UUID Generator",
    category: "generators",
    icon: "Fingerprint",
    description: "Generate UUID v4 or v7",
    inputType: "none",
    outputType: "text",
    parameters: [
      {
        id: "version",
        type: "select",
        label: "Version",
        defaultValue: "v4",
        options: [
          { label: "v4", value: "v4" },
          { label: "v7", value: "v7" },
        ],
      },
      { id: "count", type: "text", label: "Count", defaultValue: "1" },
    ],
    execute: async (_input, params) => {
      try {
        const version = (params.version ?? "v4") as "v4" | "v7";
        const count = Math.max(1, Math.min(100, parseInt(params.count ?? "1", 10) || 1));
        const bytes = uuidGenerate({ version, count });
        const uuids = bytes.map((b) => formatUuid(b, "standard", false));
        return { ok: true as const, output: uuids.join("\n") };
      } catch (e) {
        return { ok: false as const, error: `UUID generation failed: ${(e as Error).message}` };
      }
    },
  },
  {
    id: "qrcode-gen",
    name: "QR Code Generator",
    category: "generators",
    icon: "QrCode",
    description: "Generate QR code from text",
    inputType: "text",
    outputType: "image",
    parameters: [
      {
        id: "size",
        type: "select",
        label: "Size",
        defaultValue: "256",
        options: [
          { label: "128px", value: "128" },
          { label: "256px", value: "256" },
          { label: "512px", value: "512" },
        ],
      },
      {
        id: "errorLevel",
        type: "select",
        label: "Error Correction",
        defaultValue: "M",
        options: [
          { label: "L (7%)", value: "L" },
          { label: "M (15%)", value: "M" },
          { label: "Q (25%)", value: "Q" },
          { label: "H (30%)", value: "H" },
        ],
      },
      {
        id: "format",
        type: "select",
        label: "Format",
        defaultValue: "SVG",
        options: [
          { label: "SVG", value: "SVG" },
          { label: "PNG", value: "PNG" },
        ],
      },
    ],
    execute: async (input, params) => {
      try {
        if (!input.trim()) return { ok: false as const, error: "Input text is required" };
        const size = parseInt(params.size ?? "256", 10);
        const errorLevel = (params.errorLevel ?? "M") as "L" | "M" | "Q" | "H";
        const format = (params.format ?? "SVG") as "SVG" | "PNG";

        const QrCodeStyling = (await import("qr-code-styling")).default;
        const qr = new QrCodeStyling({
          width: size,
          height: size,
          type: format === "PNG" ? "canvas" : "svg",
          data: input,
          qrOptions: { errorCorrectionLevel: errorLevel },
          dotsOptions: { color: "#000000", type: "rounded" },
          backgroundOptions: { color: "#ffffff" },
        });

        const blob = await qr.getRawData(format === "PNG" ? "png" : "svg");
        if (!blob) return { ok: false as const, error: "QR code generation failed" };

        const dataUri = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });

        return { ok: true as const, output: dataUri };
      } catch (e) {
        return { ok: false as const, error: `QR code failed: ${(e as Error).message}` };
      }
    },
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add libs/recipe/steps/generators.ts
git commit -m "feat(recipe): add generator step definitions (uuid, qrcode)"
```

---

### Task 6: Visual Steps (1 step)

**Files:**

- Create: `libs/recipe/steps/visual.ts`

- [ ] **Step 1: Write visual step**

`image-compress` reuses `libs/image/encode.ts` and `libs/image/resize.ts`. It expects a data URI as input.

```ts
import { encode } from "../../image/encode";
import { calculateDimensions } from "../../image/resize";
import type { RecipeStepDef } from "../types";
import type { OutputFormat } from "../../image/types";

export const visualSteps: RecipeStepDef[] = [
  {
    id: "image-compress",
    name: "Image Compress",
    category: "visual",
    icon: "ImageDown",
    description: "Compress and resize images",
    inputType: "image",
    outputType: "image",
    parameters: [
      { id: "quality", type: "text", label: "Quality", defaultValue: "80" },
      { id: "maxWidth", type: "text", label: "Max Width", defaultValue: "", placeholder: "px" },
      { id: "maxHeight", type: "text", label: "Max Height", defaultValue: "", placeholder: "px" },
      {
        id: "format",
        type: "select",
        label: "Format",
        defaultValue: "jpeg",
        options: [
          { label: "PNG", value: "png" },
          { label: "JPG", value: "jpeg" },
          { label: "WebP", value: "webp" },
        ],
      },
    ],
    execute: async (input, params) => {
      try {
        if (!input.startsWith("data:image/")) {
          return { ok: false as const, error: "Input is not a valid image data URI" };
        }

        const quality = Math.max(1, Math.min(100, parseInt(params.quality ?? "80", 10) || 80));
        const maxWidth = params.maxWidth ? parseInt(params.maxWidth, 10) : undefined;
        const maxHeight = params.maxHeight ? parseInt(params.maxHeight, 10) : undefined;
        const format = (params.format ?? "jpeg") as OutputFormat;

        const response = await fetch(input);
        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob);

        let targetWidth = bitmap.width;
        let targetHeight = bitmap.height;

        if (maxWidth && maxWidth > 0 && targetWidth > maxWidth) {
          const scale = maxWidth / targetWidth;
          targetWidth = maxWidth;
          targetHeight = Math.round(targetHeight * scale);
        }
        if (maxHeight && maxHeight > 0 && targetHeight > maxHeight) {
          const scale = maxHeight / targetHeight;
          targetHeight = maxHeight;
          targetWidth = Math.round(targetWidth * scale);
        }

        const outputBlob = await encode(bitmap, {
          format,
          quality,
          width: Math.max(1, targetWidth),
          height: Math.max(1, targetHeight),
        });

        const dataUri = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(outputBlob);
        });

        return { ok: true as const, output: dataUri };
      } catch (e) {
        return { ok: false as const, error: `Image compress failed: ${(e as Error).message}` };
      }
    },
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add libs/recipe/steps/visual.ts
git commit -m "feat(recipe): add visual step definition (image-compress)"
```

---

### Task 7: Barrel File + Register All Steps

**Files:**

- Create: `libs/recipe/steps/index.ts`

- [ ] **Step 1: Write barrel file**

```ts
import { registerSteps } from "../registry";
import { encodingSteps } from "./encoding";
import { cryptoSteps } from "./crypto";
import { textSteps } from "./text";
import { formatSteps } from "./format";
import { generatorSteps } from "./generators";
import { visualSteps } from "./visual";

const allSteps = [
  ...encodingSteps,
  ...cryptoSteps,
  ...textSteps,
  ...formatSteps,
  ...generatorSteps,
  ...visualSteps,
];

registerSteps(allSteps);

export { allSteps };
```

- [ ] **Step 2: Verify registration works with a quick test**

Run: `npx vitest run libs/recipe/__tests__/registry.test.ts`
Expected: All existing registry tests still pass

- [ ] **Step 3: Commit**

```bash
git add libs/recipe/steps/index.ts
git commit -m "feat(recipe): register all 36 step definitions in barrel file"
```

---

### Task 8: Step Tests

**Files:**

- Create: `libs/recipe/__tests__/steps.test.ts`

Note: `qrcode-gen` and `image-compress` require DOM APIs (canvas, ImageBitmap, FileReader) and cannot be tested in node. They are excluded from the test file.

- [ ] **Step 1: Write step tests**

```ts
import { describe, it, expect, beforeAll } from "vitest";
import { getStep } from "../registry";
import "../../steps/index";
import type { RecipeStepDef } from "../types";

async function execStep(stepId: string, input: string, params: Record<string, string> = {}) {
  const def = getStep(stepId);
  if (!def) throw new Error(`Step ${stepId} not found`);
  return def.execute(input, params);
}

describe("encoding steps", () => {
  it("base64-encode encodes text", async () => {
    const r = await execStep("base64-encode", "hello");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toBe(btoa("hello"));
  });

  it("base64-decode decodes text", async () => {
    const encoded = btoa("hello");
    const r = await execStep("base64-decode", encoded);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toBe("hello");
  });

  it("base64-encode then base64-decode roundtrips", async () => {
    const enc = await execStep("base64-encode", "Test 123!");
    expect(enc.ok).toBe(true);
    if (!enc.ok) return;
    const dec = await execStep("base64-decode", enc.output);
    expect(dec.ok).toBe(true);
    if (dec.ok) expect(dec.output).toBe("Test 123!");
  });

  it("url-encode-component encodes special chars", async () => {
    const r = await execStep("url-encode-component", "hello world");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toBe("hello%20world");
  });

  it("url-decode-component decodes", async () => {
    const r = await execStep("url-decode-component", "hello%20world");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toBe("hello world");
  });

  it("url-encode-full preserves structure", async () => {
    const r = await execStep("url-encode-full", "https://example.com/path?q=hello");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toContain("https://example.com/path?q=hello");
  });

  it("url-decode-full decodes", async () => {
    const r = await execStep("url-decode-full", "https://example.com/path%20space");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toBe("https://example.com/path space");
  });

  it("base64-decode returns error for invalid input", async () => {
    const r = await execStep("base64-decode", "not-valid-base64!!!");
    expect(r.ok).toBe(false);
  });
});

describe("crypto steps", () => {
  it("hash-sha256 produces hex output", async () => {
    const r = await execStep("hash-sha256", "hello");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.output).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it("hash-md5 produces hex output", async () => {
    const r = await execStep("hash-md5", "hello");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toMatch(/^[0-9a-f]{32}$/);
  });

  it("aes-encrypt then aes-decrypt roundtrips", async () => {
    const enc = await execStep("aes-encrypt", "secret message", { key: "mykey" });
    expect(enc.ok).toBe(true);
    if (!enc.ok) return;
    const dec = await execStep("aes-decrypt", enc.output, { key: "mykey" });
    expect(dec.ok).toBe(true);
    if (dec.ok) expect(dec.output).toBe("secret message");
  });

  it("aes-encrypt fails without key", async () => {
    const r = await execStep("aes-encrypt", "test", { key: "" });
    expect(r.ok).toBe(false);
  });

  it("aes-decrypt fails with wrong key", async () => {
    const enc = await execStep("aes-encrypt", "secret", { key: "rightkey" });
    expect(enc.ok).toBe(true);
    if (!enc.ok) return;
    const dec = await execStep("aes-decrypt", enc.output, { key: "wrongkey" });
    expect(dec.ok).toBe(false);
  });

  it("hmac-sha256 produces output", async () => {
    const r = await execStep("hmac-sha256", "message", { key: "secret" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output.length).toBeGreaterThan(0);
  });

  it("hmac-sha256 fails without key", async () => {
    const r = await execStep("hmac-sha256", "message", { key: "" });
    expect(r.ok).toBe(false);
  });

  it("password-gen generates password", async () => {
    const r = await execStep("password-gen", "", { length: "20" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output.length).toBe(20);
  });

  it("password-gen rejects invalid length", async () => {
    const r = await execStep("password-gen", "", { length: "0" });
    expect(r.ok).toBe(false);
  });
});

describe("text steps", () => {
  it("text-camel converts to camelCase", async () => {
    const r = await execStep("text-camel", "hello world");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toBe("helloWorld");
  });

  it("text-pascal converts to PascalCase", async () => {
    const r = await execStep("text-pascal", "hello world");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toBe("HelloWorld");
  });

  it("text-snake converts to snake_case", async () => {
    const r = await execStep("text-snake", "hello world");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toBe("hello_world");
  });

  it("text-kebab converts to kebab-case", async () => {
    const r = await execStep("text-kebab", "hello world");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toBe("hello-world");
  });

  it("text-upper converts to uppercase", async () => {
    const r = await execStep("text-upper", "hello");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toBe("HELLO");
  });

  it("text-lower converts to lowercase", async () => {
    const r = await execStep("text-lower", "HELLO");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toBe("hello");
  });

  it("regex-replace replaces pattern", async () => {
    const r = await execStep("regex-replace", "hello 123 world 456", {
      pattern: "\\d+",
      replacement: "NUM",
      flags: "g",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toBe("hello NUM world NUM");
  });

  it("regex-replace fails without pattern", async () => {
    const r = await execStep("regex-replace", "hello", { pattern: "" });
    expect(r.ok).toBe(false);
  });

  it("dedup-lines removes duplicates", async () => {
    const r = await execStep("dedup-lines", "apple\nbanana\napple", {
      caseSensitive: "yes",
      trimWhitespace: "yes",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toBe("apple\nbanana");
  });

  it("extract-emails extracts emails", async () => {
    const r = await execStep("extract-emails", "Contact alice@example.com and bob@test.org");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toBe("alice@example.com\nbob@test.org");
  });

  it("extract-urls extracts urls", async () => {
    const r = await execStep("extract-urls", "Visit https://example.com and http://test.org");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toBe("https://example.com\nhttp://test.org");
  });
});

describe("format steps", () => {
  it("json-format formats JSON", async () => {
    const r = await execStep("json-format", '{"a":1}', { indent: "2" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toBe('{\n  "a": 1\n}');
  });

  it("json-format fails on invalid JSON", async () => {
    const r = await execStep("json-format", "not json");
    expect(r.ok).toBe(false);
  });

  it("json-minify minifies JSON", async () => {
    const r = await execStep("json-minify", '{ "a" : 1 }');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toBe('{"a":1}');
  });

  it("json-yaml converts JSON to YAML", async () => {
    const r = await execStep("json-yaml", '{"name":"test"}');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toContain("name: test");
  });

  it("yaml-json converts YAML to JSON", async () => {
    const r = await execStep("yaml-json", "name: test", { indent: "2" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      const parsed = JSON.parse(r.output);
      expect(parsed.name).toBe("test");
    }
  });

  it("json-ts generates TypeScript interfaces", async () => {
    const r = await execStep("json-ts", '{"name":"test","age":1}', { rootName: "User" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.output).toContain("User");
      expect(r.output).toContain("string");
      expect(r.output).toContain("number");
    }
  });

  it("json-csv converts JSON to CSV", async () => {
    const r = await execStep("json-csv", '[{"a":1,"b":2},{"a":3,"b":4}]', { delimiter: "comma" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toContain("a,b");
  });

  it("csv-json converts CSV to JSON", async () => {
    const r = await execStep("csv-json", "a,b\n1,2\n3,4", { delimiter: "comma", indent: "2" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      const parsed = JSON.parse(r.output);
      expect(parsed).toHaveLength(2);
    }
  });

  it("sql-format formats SQL", async () => {
    const r = await execStep("sql-format", "select * from users where id = 1", { dialect: "sql" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toContain("SELECT");
  });

  it("sql-minify minifies SQL", async () => {
    const r = await execStep("sql-minify", "SELECT  *  FROM  users", { dialect: "sql" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toBe("SELECT * FROM users");
  });
});

describe("generator steps", () => {
  it("uuid-gen generates v4 UUIDs", async () => {
    const r = await execStep("uuid-gen", "", { version: "v4", count: "1" });
    expect(r.ok).toBe(true);
    if (r.ok)
      expect(r.output).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
  });

  it("uuid-gen generates multiple UUIDs", async () => {
    const r = await execStep("uuid-gen", "", { version: "v4", count: "3" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output.split("\n")).toHaveLength(3);
  });

  it("uuid-gen generates v7 UUIDs", async () => {
    const r = await execStep("uuid-gen", "", { version: "v7", count: "1" });
    expect(r.ok).toBe(true);
    if (r.ok)
      expect(r.output).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
  });
});
```

- [ ] **Step 2: Run step tests**

Run: `npx vitest run libs/recipe/__tests__/steps.test.ts`
Expected: PASS (all tests)

- [ ] **Step 3: Run all recipe tests**

Run: `npx vitest run libs/recipe/`
Expected: PASS (all tests across all files)

- [ ] **Step 4: Commit**

```bash
git add libs/recipe/__tests__/steps.test.ts
git commit -m "test(recipe): add tests for all 36 step definitions"
```

---

### Task 9: Run Full Test Suite

- [ ] **Step 1: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run all tests**

Run: `npm run test`
Expected: All tests pass, no regressions
