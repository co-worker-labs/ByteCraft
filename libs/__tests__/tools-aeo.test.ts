import { describe, it, expect } from "vitest";
import { CATEGORY_SLUGS, TOOL_PATHS, getToolCategory, TOOLS, TOOL_CATEGORIES } from "../tools";

describe("CATEGORY_SLUGS", () => {
  it("has a slug for every ToolCategory", () => {
    const categories: string[] = TOOL_CATEGORIES.map((c) => c.key);
    for (const cat of categories) {
      expect(
        CATEGORY_SLUGS[cat as keyof typeof CATEGORY_SLUGS],
        `Missing slug for ${cat}`
      ).toBeDefined();
    }
  });

  it("slugs are lowercase-with-hyphens", () => {
    for (const slug of Object.values(CATEGORY_SLUGS)) {
      expect(slug).toMatch(/^[a-z]+(-[a-z]+)*$/);
    }
  });
});

describe("TOOL_PATHS", () => {
  it("contains every tool path from TOOLS", () => {
    for (const tool of TOOLS) {
      expect(TOOL_PATHS.has(tool.path), `Missing path ${tool.path}`).toBe(true);
    }
  });

  it("size matches TOOLS length", () => {
    expect(TOOL_PATHS.size).toBe(TOOLS.length);
  });
});

describe("getToolCategory", () => {
  it("returns correct category for each tool", () => {
    for (const cat of TOOL_CATEGORIES) {
      for (const toolKey of cat.tools) {
        expect(getToolCategory(toolKey), `${toolKey} should be ${cat.key}`).toBe(cat.key);
      }
    }
  });

  it("returns undefined for unknown tool", () => {
    expect(getToolCategory("nonexistent")).toBeUndefined();
  });
});
