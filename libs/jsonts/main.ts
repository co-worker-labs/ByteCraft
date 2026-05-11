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
    if (!props) return `${exp}type ${def.name} = {};`;
    return `${exp}type ${def.name} = {\n${props}\n};`;
  }
  if (!props) return `${exp}interface ${def.name} {}`;
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
