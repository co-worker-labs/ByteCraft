import { describe, it, expect } from "vitest";
import { isCompatible } from "../engine";
import type { RecipeStepDef } from "../types";

function makeStep(
  inputType: "text" | "image" | "none",
  outputType: "text" | "image" | "none"
): RecipeStepDef {
  return {
    id: "test-step",
    name: "Test Step",
    category: "encoding",
    icon: "🔧",
    description: "A test step",
    inputType,
    outputType,
    parameters: [],
    execute: async () => ({ ok: true, output: "" }),
  };
}

describe("isCompatible", () => {
  it("returns true when prevOutputType is null and next step accepts text", () => {
    const step = makeStep("text", "text");
    expect(isCompatible(null, step)).toBe(true);
  });

  it("returns true when prevOutputType is null and next step accepts image", () => {
    const step = makeStep("image", "image");
    expect(isCompatible(null, step)).toBe(true);
  });

  it("returns false when next step inputType is none", () => {
    const step = makeStep("none", "text");
    expect(isCompatible("text", step)).toBe(false);
  });

  it("returns false when prevOutputType is null and next step inputType is none", () => {
    const step = makeStep("none", "text");
    expect(isCompatible(null, step)).toBe(false);
  });

  it("returns true when prevOutputType matches next step inputType (text→text)", () => {
    const step = makeStep("text", "text");
    expect(isCompatible("text", step)).toBe(true);
  });

  it("returns true when prevOutputType matches next step inputType (image→image)", () => {
    const step = makeStep("image", "text");
    expect(isCompatible("image", step)).toBe(true);
  });

  it("returns false when prevOutputType does not match next step inputType (text→image)", () => {
    const step = makeStep("image", "text");
    expect(isCompatible("text", step)).toBe(false);
  });

  it("returns false when prevOutputType does not match next step inputType (image→text)", () => {
    const step = makeStep("text", "text");
    expect(isCompatible("image", step)).toBe(false);
  });
});
