import { describe, it, expect, beforeEach } from "vitest";
import {
  STEP_REGISTRY,
  registerSteps,
  getStep,
  searchSteps,
  getCompatibleSteps,
} from "../registry";
import type { RecipeStepDef, StepResult } from "../types";

function makeDef(
  id: string,
  name: string,
  category: "encoding" | "text" | "crypto" | "format" | "generators" | "visual" = "encoding",
  inputType: "text" | "image" | "none" = "text",
  outputType: "text" | "image" | "none" = "text"
): RecipeStepDef {
  return {
    id,
    name,
    category,
    icon: "🔧",
    description: `${name} step`,
    inputType,
    outputType,
    parameters: [],
    execute: async () => ({ ok: true as const, output: "" }),
  };
}

describe("registry", () => {
  beforeEach(() => {
    STEP_REGISTRY.clear();
  });

  describe("registerSteps", () => {
    it("registers steps into the registry", () => {
      const defs = [
        makeDef("base64-encode", "Base64 Encode"),
        makeDef("base64-decode", "Base64 Decode"),
      ];
      registerSteps(defs);
      expect(STEP_REGISTRY.get("base64-encode")).toBeDefined();
      expect(STEP_REGISTRY.get("base64-decode")).toBeDefined();
    });

    it("overwrites existing step with same id", () => {
      const v1 = makeDef("step", "Version 1");
      const v2 = makeDef("step", "Version 2");
      registerSteps([v1]);
      registerSteps([v2]);
      expect(STEP_REGISTRY.get("step")!.name).toBe("Version 2");
    });
  });

  describe("getStep", () => {
    it("returns undefined for unknown id", () => {
      expect(getStep("nonexistent")).toBeUndefined();
    });

    it("returns step by id", () => {
      const def = makeDef("test", "Test");
      registerSteps([def]);
      expect(getStep("test")!.name).toBe("Test");
    });
  });

  describe("searchSteps", () => {
    it("returns all steps for empty query", () => {
      const defs = [makeDef("a", "Alpha"), makeDef("b", "Beta")];
      registerSteps(defs);
      const results = searchSteps("");
      expect(results).toHaveLength(2);
    });

    it("returns matching steps by name", () => {
      const defs = [makeDef("base64-enc", "Base64 Encode"), makeDef("hash-sha", "SHA Hash")];
      registerSteps(defs);
      const results = searchSteps("base64");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.id === "base64-enc")).toBe(true);
    });
  });

  describe("getCompatibleSteps", () => {
    it("returns all steps for position 0 with null previous output", () => {
      const defs = [makeDef("a", "A"), makeDef("b", "B")];
      const result = getCompatibleSteps(0, null, defs);
      expect(result).toHaveLength(2);
    });

    it("filters by input type compatibility", () => {
      const defs = [
        makeDef("text", "Text Step", "encoding", "text", "text"),
        makeDef("img", "Image Step", "visual", "image", "image"),
      ];
      const result = getCompatibleSteps(1, "text", defs);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("text");
    });
  });
});
