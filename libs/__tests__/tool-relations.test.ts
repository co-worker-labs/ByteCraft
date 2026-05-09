import { describe, it, expect } from "vitest";
import { TOOLS, TOOL_RELATIONS } from "../tools";

describe("TOOL_RELATIONS", () => {
  const allKeys = TOOLS.map((t) => t.key);

  it("has an entry for every registered tool", () => {
    const missing = allKeys.filter((key) => !TOOL_RELATIONS[key]);
    expect(missing, `Missing TOOL_RELATIONS for: ${missing.join(", ")}`).toEqual([]);
  });

  it("has at least 2 relations per tool", () => {
    for (const key of allKeys) {
      const relations = TOOL_RELATIONS[key];
      expect(relations.length, `${key} has fewer than 2 relations`).toBeGreaterThanOrEqual(2);
    }
  });

  it("has at most 5 relations per tool", () => {
    for (const key of allKeys) {
      const relations = TOOL_RELATIONS[key];
      expect(relations.length, `${key} has more than 5 relations`).toBeLessThanOrEqual(5);
    }
  });

  it("does not self-reference", () => {
    for (const key of allKeys) {
      const relations = TOOL_RELATIONS[key];
      expect(relations, `${key} references itself`).not.toContain(key);
    }
  });

  it("references only existing tool keys", () => {
    const keySet = new Set(allKeys);
    for (const key of allKeys) {
      for (const rel of TOOL_RELATIONS[key]) {
        expect(keySet.has(rel), `${key} references non-existent tool: ${rel}`).toBe(true);
      }
    }
  });

  it("relations are bidirectional (if A lists B, B should list A)", () => {
    const errors: string[] = [];
    for (const key of allKeys) {
      for (const rel of TOOL_RELATIONS[key]) {
        if (!TOOL_RELATIONS[rel]?.includes(key)) {
          errors.push(`${key}→${rel} (reverse missing)`);
        }
      }
    }
  });
});
