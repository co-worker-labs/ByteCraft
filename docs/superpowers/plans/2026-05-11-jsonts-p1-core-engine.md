# JSON to TypeScript — Plan 1: Core Engine & Tests

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the JSON-to-TypeScript conversion engine (`libs/jsonts/main.ts`) with full Vitest test coverage.

**Architecture:** A `TypeContext` class traverses parsed JSON to build type definitions, then renders them as TypeScript. Nested objects are extracted as separate named types. Arrays of objects are merged. Identical structures are deduplicated. The public API is a single `jsonToTs()` function.

**Tech Stack:** TypeScript, `pluralize` (new), `json5` (existing), Vitest

---

## File Structure

| Action  | File                                 | Responsibility                            |
| ------- | ------------------------------------ | ----------------------------------------- |
| Install | `pluralize` npm package              | Singularize array element names           |
| Create  | `libs/jsonts/main.ts`                | Core conversion engine (~300 lines)       |
| Create  | `libs/jsonts/__tests__/main.test.ts` | Vitest unit tests (~250 lines)            |
| Modify  | `vitest.config.ts`                   | Add `libs/jsonts/**/*.test.ts` to include |

---

### Task 1: Install pluralize + Update Vitest Config

- [ ] **Step 1: Install pluralize**

Run:

```bash
npm install pluralize && npm install -D @types/pluralize
```

Expected: `pluralize` and `@types/pluralize` added to `package.json`.

- [ ] **Step 2: Update vitest.config.ts**

In `vitest.config.ts`, add a new entry to the `test.include` array (after the `libs/wallet/**/*.test.ts` line):

```ts
      "libs/jsonts/**/*.test.ts",
```

The full `include` array should now contain:

```ts
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
      "libs/jsonts/**/*.test.ts",
      "libs/__tests__/*.test.ts",
      "utils/__tests__/*.test.{ts,tsx}",
      "hooks/**/*.test.ts",
    ],
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add pluralize dependency and vitest config for jsonts"
```

---

### Task 2: Write All Tests

**Files:**

- Create: `libs/jsonts/__tests__/main.test.ts`

- [ ] **Step 1: Create the complete test file**

Create `libs/jsonts/__tests__/main.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { jsonToTs, PRIMITIVE_ERROR } from "../main";

describe("jsonToTs - primitive types", () => {
  it("converts string field", () => {
    const result = jsonToTs('{"name":"hello"}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("name: string");
  });

  it("converts number field", () => {
    const result = jsonToTs('{"age":42}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("age: number");
  });

  it("converts boolean field", () => {
    const result = jsonToTs('{"active":true}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("active: boolean");
  });

  it("converts empty object", () => {
    const result = jsonToTs("{}");
    expect(result.success).toBe(true);
    expect(result.types).toContain("interface Root {}");
  });

  it("converts empty array at root", () => {
    const result = jsonToTs("[]");
    expect(result.success).toBe(true);
    expect(result.types).toContain("type Root = any[]");
  });
});

describe("jsonToTs - null handling", () => {
  it("standalone null → optional any | null", () => {
    const result = jsonToTs('{"a":null}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("a?: any | null");
  });

  it("null in array union → inferred type", () => {
    const result = jsonToTs("[1, null]");
    expect(result.success).toBe(true);
    expect(result.types).toContain("type Root = (number | null)[]");
  });

  it("null mixed with other fields", () => {
    const result = jsonToTs('{"a":null,"b":1}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("a?: any | null");
    expect(result.types).toContain("b: number");
  });

  it("null in object array → union with null", () => {
    const result = jsonToTs('[{"a":1},{"a":null}]');
    expect(result.success).toBe(true);
    expect(result.types).toContain("a: number | null");
  });
});

describe("jsonToTs - nested objects", () => {
  it("single-level nesting", () => {
    const result = jsonToTs('{"user":{"name":"John"}}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("interface User");
    expect(result.types).toContain("name: string");
    expect(result.types).toContain("user: User");
  });

  it("multi-level nesting", () => {
    const result = jsonToTs('{"person":{"address":{"city":"NYC"}}}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("interface Address");
    expect(result.types).toContain("interface Person");
    expect(result.types).toContain("interface Root");
  });

  it("PascalCase naming from snake_case key", () => {
    const result = jsonToTs('{"user_profile":{"bio":"dev"}}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("interface UserProfile");
  });
});

describe("jsonToTs - arrays", () => {
  it("primitive array", () => {
    const result = jsonToTs('{"items":[1,2,3]}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("items: number[]");
  });

  it("object array with singularized name", () => {
    const result = jsonToTs('{"users":[{"name":"John"}]}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("interface User");
    expect(result.types).toContain("users: User[]");
  });

  it("mixed array → union type", () => {
    const result = jsonToTs('{"data":[1,"a",true]}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("data: (number | string | boolean)[]");
  });

  it("empty array field → any[]", () => {
    const result = jsonToTs('{"items":[]}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("items: any[]");
  });

  it("nested arrays", () => {
    const result = jsonToTs('{"matrix":[[1,2],[3,4]]}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("matrix: number[][]");
  });

  it("object array merging — partial fields optional", () => {
    const result = jsonToTs('[{"a":1},{"a":1,"b":2}]');
    expect(result.success).toBe(true);
    expect(result.types).toContain("a: number");
    expect(result.types).toContain("b?: number");
  });

  it("root-level object array", () => {
    const result = jsonToTs('[{"name":"John"},{"name":"Jane"}]');
    expect(result.success).toBe(true);
    expect(result.types).toContain("interface Root");
    expect(result.types).toContain("name: string");
  });
});

describe("jsonToTs - union types", () => {
  it("mixed primitives → union", () => {
    const result = jsonToTs('[1, "a"]');
    expect(result.success).toBe(true);
    expect(result.types).toContain("type Root = (number | string)[]");
  });

  it("same types deduplicated", () => {
    const result = jsonToTs("[1, 2, 3]");
    expect(result.success).toBe(true);
    expect(result.types).toContain("type Root = number[]");
  });
});

describe("jsonToTs - options", () => {
  it("custom rootName", () => {
    const result = jsonToTs('{"name":"test"}', { rootName: "MyType" });
    expect(result.success).toBe(true);
    expect(result.types).toContain("interface MyType");
  });

  it("useTypeAlias → type instead of interface", () => {
    const result = jsonToTs('{"name":"test"}', { useTypeAlias: true });
    expect(result.success).toBe(true);
    expect(result.types).toContain("type Root = {");
    expect(result.types).not.toContain("interface Root");
  });

  it("exportKeyword → add export", () => {
    const result = jsonToTs('{"name":"test"}', { exportKeyword: true });
    expect(result.success).toBe(true);
    expect(result.types).toContain("export interface Root");
  });

  it("exportKeyword + useTypeAlias combined", () => {
    const result = jsonToTs('{"name":"test"}', {
      useTypeAlias: true,
      exportKeyword: true,
    });
    expect(result.success).toBe(true);
    expect(result.types).toContain("export type Root = {");
  });

  it("export with nested types", () => {
    const result = jsonToTs('{"user":{"name":"John"}}', {
      exportKeyword: true,
    });
    expect(result.success).toBe(true);
    expect(result.types).toContain("export interface User");
    expect(result.types).toContain("export interface Root");
  });
});

describe("jsonToTs - JSON5", () => {
  it("single quotes", () => {
    const result = jsonToTs("{'name':'hello'}");
    expect(result.success).toBe(true);
    expect(result.types).toContain("name: string");
  });

  it("trailing commas", () => {
    const result = jsonToTs('{"a":1,"b":2,}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("a: number");
  });

  it("comments", () => {
    const result = jsonToTs('{"a":1 /* comment */}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("a: number");
  });

  it("unquoted keys", () => {
    const result = jsonToTs('{name:"hello"}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("name: string");
  });
});

describe("jsonToTs - errors", () => {
  it("invalid JSON → error", () => {
    const result = jsonToTs("{invalid}");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("string root → error", () => {
    const result = jsonToTs('"hello"');
    expect(result.success).toBe(false);
    expect(result.error).toBe(PRIMITIVE_ERROR);
  });

  it("number root → error", () => {
    const result = jsonToTs("42");
    expect(result.success).toBe(false);
    expect(result.error).toBe(PRIMITIVE_ERROR);
  });

  it("null root → error", () => {
    const result = jsonToTs("null");
    expect(result.success).toBe(false);
  });

  it("boolean root → error", () => {
    const result = jsonToTs("true");
    expect(result.success).toBe(false);
  });

  it("empty input → success with empty types", () => {
    const result = jsonToTs("");
    expect(result.success).toBe(true);
    expect(result.types).toBe("");
  });

  it("whitespace-only input → success with empty types", () => {
    const result = jsonToTs("   ");
    expect(result.success).toBe(true);
    expect(result.types).toBe("");
  });
});

describe("jsonToTs - edge cases", () => {
  it("numeric keys → quoted", () => {
    const result = jsonToTs('{"0":"a","1":"b"}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("'0': string");
    expect(result.types).toContain("'1': string");
  });

  it("special character keys → quoted", () => {
    const result = jsonToTs('{"hello world":"a"}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("'hello world': string");
  });

  it("empty string key → quoted", () => {
    const result = jsonToTs('{"":"a"}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("'': string");
  });

  it("reserved word keys kept as-is (no quotes)", () => {
    const result = jsonToTs('{"class":"a","return":"b"}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("class: string");
    expect(result.types).toContain("return: string");
  });

  it("key with single quote → escaped", () => {
    const result = jsonToTs('{"a\\"b":"c"}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("'a\"b': string");
  });
});

describe("jsonToTs - deduplication", () => {
  it("identical nested structures share the same type", () => {
    const result = jsonToTs('{"home":{"city":"NYC"},"work":{"city":"SF"}}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("interface Home");
    expect(result.types).toContain("home: Home");
    expect(result.types).toContain("work: Home");
    expect(result.types).not.toContain("interface Work");
  });

  it("different structures kept separate", () => {
    const result = jsonToTs('{"a":{"x":1},"b":{"y":2}}');
    expect(result.success).toBe(true);
    expect(result.types).toContain("interface A");
    expect(result.types).toContain("interface B");
  });
});

describe("jsonToTs - sub-type ordering", () => {
  it("referenced types appear before referencing types", () => {
    const result = jsonToTs('{"person":{"address":{"city":"NYC"}}}');
    expect(result.success).toBe(true);
    const lines = result.types!.split("\n");
    const addressIdx = lines.findIndex((l) => l.includes("interface Address"));
    const personIdx = lines.findIndex((l) => l.includes("interface Person"));
    const rootIdx = lines.findIndex((l) => l.includes("interface Root"));
    expect(addressIdx).toBeLessThan(personIdx);
    expect(personIdx).toBeLessThan(rootIdx);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npx vitest run libs/jsonts --reporter=verbose 2>&1 | head -20
```

Expected: FAIL — `Cannot find module '../main'` or similar import error.

---

### Task 3: Implement the Core Engine

**Files:**

- Create: `libs/jsonts/main.ts`

- [ ] **Step 1: Create the complete engine**

Create `libs/jsonts/main.ts`:

```ts
import JSON5 from "json5";
import pluralize from "pluralize";

export interface ConvertOptions {
  rootName: string;
  useTypeAlias: boolean;
  exportKeyword: boolean;
}

export interface ConvertResult {
  success: boolean;
  types?: string;
  error?: string;
}

const DEFAULT_OPTIONS: ConvertOptions = {
  rootName: "Root",
  useTypeAlias: false,
  exportKeyword: false,
};

type TypeExpr =
  | { tag: "primitive"; name: string }
  | { tag: "null" }
  | { tag: "array"; element: TypeExpr }
  | { tag: "union"; members: TypeExpr[] }
  | { tag: "ref"; id: number };

interface PropDef {
  key: string;
  type: TypeExpr;
  optional: boolean;
}

interface ObjectTypeDef {
  id: number;
  name: string;
  properties: PropDef[];
}

class TypeContext {
  private nextId = 0;
  private defs: ObjectTypeDef[] = [];

  private allocId(): number {
    return this.nextId++;
  }

  getDef(id: number): ObjectTypeDef | undefined {
    return this.defs.find((d) => d.id === id);
  }

  inferValue(value: unknown, nameHint: string): TypeExpr {
    if (value === undefined) return { tag: "primitive", name: "any" };
    if (value === null) return { tag: "null" };
    if (typeof value === "string") return { tag: "primitive", name: "string" };
    if (typeof value === "number") return { tag: "primitive", name: "number" };
    if (typeof value === "boolean") return { tag: "primitive", name: "boolean" };
    if (Array.isArray(value)) return this.inferArray(value, nameHint);
    if (typeof value === "object") {
      return this.inferObject(value as Record<string, unknown>, nameHint);
    }
    return { tag: "primitive", name: "any" };
  }

  private inferObject(obj: Record<string, unknown>, name: string): TypeExpr {
    const id = this.allocId();
    const properties: PropDef[] = [];
    for (const [key, val] of Object.entries(obj)) {
      const childName = pascalCase(singularize(key));
      const type = this.inferValue(val, childName);
      const optional = val === null || val === undefined;
      properties.push({ key, type, optional });
    }
    this.defs.push({ id, name: pascalCase(name), properties });
    return { tag: "ref", id };
  }

  private inferArray(arr: unknown[], nameHint: string): TypeExpr {
    if (arr.length === 0) {
      return { tag: "array", element: { tag: "primitive", name: "any" } };
    }
    const singular = pascalCase(singularize(nameHint)) || "Item";
    const nonNull = arr.filter((v) => v !== null && v !== undefined);
    const allObjects =
      nonNull.length > 0 && nonNull.every((v) => typeof v === "object" && !Array.isArray(v));

    if (allObjects) {
      const elementType = this.inferMergedObject(nonNull as Record<string, unknown>[], singular);
      const hasNull = arr.some((v) => v === null);
      if (hasNull) {
        return {
          tag: "array",
          element: {
            tag: "union",
            members: [elementType, { tag: "null" }],
          },
        };
      }
      return { tag: "array", element: elementType };
    }

    const elementTypes = arr.map((v) => this.inferValue(v, singular));
    const merged = this.mergeTypes(elementTypes);
    return { tag: "array", element: merged };
  }

  private inferMergedObject(objs: Record<string, unknown>[], name: string): TypeExpr {
    const properties = this.mergeObjectProperties(objs);
    const id = this.allocId();
    this.defs.push({ id, name: pascalCase(name), properties });
    return { tag: "ref", id };
  }

  private mergeObjectProperties(objs: Record<string, unknown>[]): PropDef[] {
    const keyMap = new Map<string, { values: unknown[]; count: number }>();
    for (const obj of objs) {
      for (const [key, val] of Object.entries(obj)) {
        if (!keyMap.has(key)) keyMap.set(key, { values: [], count: 0 });
        const entry = keyMap.get(key)!;
        entry.count++;
        entry.values.push(val);
      }
    }

    const result: PropDef[] = [];
    for (const [key, { values, count }] of keyMap) {
      const childName = pascalCase(singularize(key));
      const allObjVals = values.every(
        (v) => v !== null && v !== undefined && typeof v === "object" && !Array.isArray(v)
      );
      let type: TypeExpr;
      if (allObjVals && values.length > 0) {
        type = this.inferMergedObject(values as Record<string, unknown>[], childName);
      } else {
        const types = values.map((v) => this.inferValue(v, childName));
        type = this.mergeTypes(types);
      }
      const optional = count < objs.length;
      result.push({ key, type, optional });
    }
    return result;
  }

  private mergeTypes(types: TypeExpr[]): TypeExpr {
    if (types.length === 0) return { tag: "primitive", name: "any" };
    if (types.length === 1) return types[0];

    const nonNull = types.filter((t) => t.tag !== "null");
    const hasNull = types.some((t) => t.tag === "null");

    if (nonNull.length === 0) {
      return { tag: "null" };
    }

    const deduped: TypeExpr[] = [];
    for (const t of nonNull) {
      if (!deduped.some((d) => this.typeEquals(d, t))) {
        deduped.push(t);
      }
    }

    let result: TypeExpr;
    if (deduped.length === 1) {
      result = deduped[0];
    } else {
      result = { tag: "union", members: deduped };
    }

    if (hasNull) {
      if (result.tag === "union") {
        return {
          tag: "union",
          members: [...result.members, { tag: "null" }],
        };
      }
      return { tag: "union", members: [result, { tag: "null" }] };
    }

    return result;
  }

  dedupDefs(): void {
    const aliases = new Map<number, number>();
    for (let i = 0; i < this.defs.length; i++) {
      if (aliases.has(this.defs[i].id)) continue;
      for (let j = i + 1; j < this.defs.length; j++) {
        if (aliases.has(this.defs[j].id)) continue;
        if (this.defEquals(this.defs[i], this.defs[j])) {
          aliases.set(this.defs[j].id, this.defs[i].id);
        }
      }
    }
    if (aliases.size === 0) return;

    this.defs = this.defs.filter((d) => !aliases.has(d.id));
    const update = (t: TypeExpr): TypeExpr => {
      if (t.tag === "ref" && aliases.has(t.id)) {
        return { tag: "ref", id: aliases.get(t.id)! };
      }
      if (t.tag === "array") return { tag: "array", element: update(t.element) };
      if (t.tag === "union") return { tag: "union", members: t.members.map(update) };
      return t;
    };
    for (const def of this.defs) {
      for (const prop of def.properties) {
        prop.type = update(prop.type);
      }
    }
  }

  private typeEquals(a: TypeExpr, b: TypeExpr): boolean {
    if (a.tag !== b.tag) return false;
    switch (a.tag) {
      case "primitive":
        return a.name === (b as typeof a).name;
      case "null":
        return true;
      case "array":
        return this.typeEquals(a.element, (b as typeof a).element);
      case "union": {
        const bm = (b as typeof a).members;
        if (a.members.length !== bm.length) return false;
        return a.members.every((m) => bm.some((n) => this.typeEquals(m, n)));
      }
      case "ref": {
        const defA = this.getDef(a.id);
        const defB = this.getDef((b as typeof a).id);
        return defA !== undefined && defB !== undefined && this.defEquals(defA, defB);
      }
    }
  }

  private defEquals(a: ObjectTypeDef, b: ObjectTypeDef): boolean {
    if (a.properties.length !== b.properties.length) return false;
    for (const pa of a.properties) {
      const pb = b.properties.find((p) => p.key === pa.key);
      if (!pb || pa.optional !== pb.optional) return false;
      if (!this.typeEquals(pa.type, pb.type)) return false;
    }
    return true;
  }

  sortByDependency(): ObjectTypeDef[] {
    const defMap = new Map(this.defs.map((d) => [d.id, d]));
    const visited = new Set<number>();
    const result: ObjectTypeDef[] = [];
    const visit = (id: number) => {
      if (visited.has(id)) return;
      visited.add(id);
      const def = defMap.get(id);
      if (!def) return;
      for (const prop of def.properties) {
        collectRefs(prop.type).forEach(visit);
      }
      result.push(def);
    };
    for (const def of this.defs) {
      visit(def.id);
    }
    return result;
  }

  renderType(t: TypeExpr): string {
    switch (t.tag) {
      case "primitive":
        return t.name;
      case "null":
        return "null";
      case "array": {
        const elem = this.renderType(t.element);
        if (t.element.tag === "union") return `(${elem})[]`;
        return `${elem}[]`;
      }
      case "union":
        return t.members.map((m) => this.renderType(m)).join(" | ");
      case "ref": {
        const def = this.getDef(t.id);
        return def ? def.name : "any";
      }
    }
  }
}

function collectRefs(t: TypeExpr): number[] {
  const refs: number[] = [];
  const visit = (expr: TypeExpr) => {
    if (expr.tag === "ref") refs.push(expr.id);
    if (expr.tag === "array") visit(expr.element);
    if (expr.tag === "union") expr.members.forEach(visit);
  };
  visit(t);
  return refs;
}

function singularize(word: string): string {
  return pluralize.singular(word);
}

function pascalCase(str: string): string {
  if (!str) return "";
  return str
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function needsQuotes(key: string): boolean {
  return !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
}

function formatKey(key: string): string {
  if (!needsQuotes(key)) return key;
  return `'${key.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function renderProperty(ctx: TypeContext, prop: PropDef, indent: string): string {
  const key = formatKey(prop.key);
  if (prop.type.tag === "null") {
    return `${indent}${key}?: any | null;`;
  }
  const typeStr = ctx.renderType(prop.type);
  if (prop.optional) {
    return `${indent}${key}?: ${typeStr};`;
  }
  return `${indent}${key}: ${typeStr};`;
}

function renderDef(ctx: TypeContext, def: ObjectTypeDef, opts: ConvertOptions): string {
  const exp = opts.exportKeyword ? "export " : "";
  const props = def.properties.map((p) => renderProperty(ctx, p, "  ")).join("\n");

  if (opts.useTypeAlias) {
    return `${exp}type ${def.name} = {\n${props}\n};`;
  }
  return `${exp}interface ${def.name} {\n${props}\n}`;
}

export const PRIMITIVE_ERROR = "Please enter a JSON object or array";

export function jsonToTs(json: string, options?: Partial<ConvertOptions>): ConvertResult {
  if (!json.trim()) {
    return { success: true, types: "" };
  }

  const opts: ConvertOptions = { ...DEFAULT_OPTIONS, ...options };

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    try {
      parsed = JSON5.parse(json);
    } catch (e) {
      const msg = e instanceof SyntaxError ? e.message : String(e);
      return { success: false, error: msg };
    }
  }

  if (parsed === null || (typeof parsed !== "object" && !Array.isArray(parsed))) {
    return { success: false, error: PRIMITIVE_ERROR };
  }

  const ctx = new TypeContext();
  const rootType = ctx.inferValue(parsed, opts.rootName);

  ctx.dedupDefs();
  const sortedDefs = ctx.sortByDependency();

  const parts: string[] = [];
  for (const def of sortedDefs) {
    parts.push(renderDef(ctx, def, opts));
  }

  if (rootType.tag === "array" && rootType.element.tag !== "ref") {
    const exp = opts.exportKeyword ? "export " : "";
    const typeStr = ctx.renderType(rootType);
    parts.push(`${exp}type ${opts.rootName} = ${typeStr};`);
  }

  return { success: true, types: parts.join("\n\n") };
}
```

- [ ] **Step 2: Run all tests**

Run:

```bash
npx vitest run libs/jsonts --reporter=verbose
```

Expected: All tests PASS (green). If any test fails, examine the actual output vs expected and fix the engine code.

- [ ] **Step 3: Commit**

```bash
git add libs/jsonts/
git commit -m "feat(jsonts): add JSON-to-TypeScript conversion engine with tests"
```
