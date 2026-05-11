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
