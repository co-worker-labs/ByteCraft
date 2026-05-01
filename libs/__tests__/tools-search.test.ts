import { describe, it, expect } from "vitest";
import { searchTools } from "../tools-search";
import type { ToolCard } from "../tools";

function makeCard(overrides: Partial<ToolCard> & { key?: string }): ToolCard & { key?: string } {
  return {
    path: overrides.path ?? "/test",
    title: overrides.title ?? "Test Tool",
    description: overrides.description ?? "A test tool",
    icon: (() => null) as any,
    searchTerms: overrides.searchTerms ?? "",
    key: overrides.key,
  } as ToolCard & { key?: string };
}

const TOOLS = [
  makeCard({
    path: "/json",
    title: "JSON Format / Compress",
    key: "json",
    description: "Format, compress, and validate JSON online.",
  }),
  makeCard({
    path: "/jwt",
    title: "JWT",
    key: "jwt",
    description: "Encode, decode, and verify JSON Web Tokens.",
  }),
  makeCard({
    path: "/base64",
    title: "Base64 Encode/Decode",
    key: "base64",
    description: "Encode and decode Base64 strings.",
  }),
  makeCard({
    path: "/cipher",
    title: "Text Encrypt/Decrypt",
    key: "cipher",
    description: "Encrypt and decrypt text using AES, DES.",
  }),
  makeCard({
    path: "/hashing",
    title: "Text Hashing",
    key: "hashing",
    description: "Generate MD5, SHA-256, SHA-512 hashes.",
  }),
  makeCard({
    path: "/dbviewer",
    title: "DB Viewer",
    key: "dbviewer",
    description: "Open SQLite databases, run SQL queries.",
  }),
  makeCard({
    path: "/color",
    title: "Color Converter",
    key: "color",
    description: "Convert HEX, RGB, HSL. Visual picker with eyedropper.",
    searchTerms: "yansezhuanhuan yszh",
  }),
];

describe("searchTools", () => {
  it("returns all tools when query is empty", () => {
    expect(searchTools("", TOOLS)).toHaveLength(TOOLS.length);
  });

  it("returns all tools when query is whitespace", () => {
    expect(searchTools("   ", TOOLS)).toHaveLength(TOOLS.length);
  });

  it("finds tools by title", () => {
    const results = searchTools("json", TOOLS);
    const paths = results.map((r) => r.path);
    expect(paths).toContain("/json");
  });

  it("finds tools by key", () => {
    const results = searchTools("jwt", TOOLS);
    const paths = results.map((r) => r.path);
    expect(paths).toContain("/jwt");
  });

  it("finds tools by description", () => {
    const results = searchTools("sql", TOOLS);
    const paths = results.map((r) => r.path);
    expect(paths).toContain("/dbviewer");
  });

  it("finds tools by searchTerms", () => {
    const results = searchTools("yanse", TOOLS);
    const paths = results.map((r) => r.path);
    expect(paths).toContain("/color");
  });

  it("title match ranks higher than description match", () => {
    const results = searchTools("hash", TOOLS);
    expect(results[0].path).toBe("/hashing");
  });

  it("returns empty array when nothing matches", () => {
    const results = searchTools("zzzzznonexistent", TOOLS);
    expect(results).toHaveLength(0);
  });
});
