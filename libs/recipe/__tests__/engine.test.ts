import { describe, it, expect } from "vitest";
import { executePipeline, getPipelineInputType } from "../engine";
import type { RecipeStepDef, RecipeStepInstance, StepResult } from "../types";

function makeDef(
  id: string,
  inputType: "text" | "image" | "none",
  outputType: "text" | "image" | "none",
  execute: (input: string, params: Record<string, string>) => Promise<StepResult>
): RecipeStepDef {
  return {
    id,
    name: id,
    category: "encoding",
    icon: "🔧",
    description: `Step ${id}`,
    inputType,
    outputType,
    parameters: [],
    execute,
  };
}

function makeInstance(
  stepId: string,
  enabled = true,
  params: Record<string, string> = {}
): RecipeStepInstance {
  return { stepId, params, enabled };
}

describe("executePipeline", () => {
  it("returns input as finalOutput when no steps", async () => {
    const result = await executePipeline("hello", [], new Map());
    expect(result).toEqual({ steps: [], finalOutput: "hello", errorStepIndex: null });
  });

  it("returns null finalOutput when no steps and null input", async () => {
    const result = await executePipeline(null, [], new Map());
    expect(result).toEqual({ steps: [], finalOutput: null, errorStepIndex: null });
  });

  it("executes single step successfully", async () => {
    const upper = makeDef("upper", "text", "text", async (input) => ({
      ok: true,
      output: input.toUpperCase(),
    }));
    const defs = new Map([["upper", upper]]);
    const steps = [makeInstance("upper")];

    const result = await executePipeline("hello", steps, defs);
    expect(result.finalOutput).toBe("HELLO");
    expect(result.steps).toHaveLength(1);
    expect(result.errorStepIndex).toBeNull();
  });

  it("chains multiple steps", async () => {
    const upper = makeDef("upper", "text", "text", async (input) => ({
      ok: true,
      output: input.toUpperCase(),
    }));
    const reverse = makeDef("reverse", "text", "text", async (input) => ({
      ok: true,
      output: input.split("").reverse().join(""),
    }));
    const defs = new Map([
      ["upper", upper],
      ["reverse", reverse],
    ]);
    const steps = [makeInstance("upper"), makeInstance("reverse")];

    const result = await executePipeline("hello", steps, defs);
    expect(result.finalOutput).toBe("OLLEH");
    expect(result.steps).toHaveLength(2);
  });

  it("returns errorStepIndex on failure", async () => {
    const fail = makeDef("fail", "text", "text", async () => ({ ok: false, error: "boom" }));
    const defs = new Map([["fail", fail]]);
    const steps = [makeInstance("fail")];

    const result = await executePipeline("hello", steps, defs);
    expect(result.finalOutput).toBeNull();
    expect(result.errorStepIndex).toBe(0);
    expect(result.steps[0].result).toEqual({ ok: false, error: "boom" });
  });

  it("stops pipeline at first error", async () => {
    const fail = makeDef("fail", "text", "text", async () => ({ ok: false, error: "err" }));
    const upper = makeDef("upper", "text", "text", async (input) => ({
      ok: true,
      output: input.toUpperCase(),
    }));
    const defs = new Map([
      ["fail", fail],
      ["upper", upper],
    ]);
    const steps = [makeInstance("fail"), makeInstance("upper")];

    const result = await executePipeline("hello", steps, defs);
    expect(result.steps).toHaveLength(1);
    expect(result.errorStepIndex).toBe(0);
  });

  it("skips disabled steps", async () => {
    const upper = makeDef("upper", "text", "text", async (input) => ({
      ok: true,
      output: input.toUpperCase(),
    }));
    const reverse = makeDef("reverse", "text", "text", async (input) => ({
      ok: true,
      output: input.split("").reverse().join(""),
    }));
    const defs = new Map([
      ["upper", upper],
      ["reverse", reverse],
    ]);
    const steps = [makeInstance("upper", false), makeInstance("reverse")];

    const result = await executePipeline("hello", steps, defs);
    expect(result.finalOutput).toBe("olleh");
    expect(result.steps).toHaveLength(1);
  });

  it("returns error when step def not found", async () => {
    const defs = new Map<string, RecipeStepDef>();
    const steps = [makeInstance("missing")];

    const result = await executePipeline("hello", steps, defs);
    expect(result.errorStepIndex).toBe(0);
    expect(result.finalOutput).toBeNull();
  });

  it("passes empty string to first step with none inputType", async () => {
    const gen = makeDef("gen", "none", "text", async (input) => ({
      ok: true,
      output: input + "generated",
    }));
    const defs = new Map([["gen", gen]]);
    const steps = [makeInstance("gen")];

    const result = await executePipeline(null, steps, defs);
    expect(result.finalOutput).toBe("generated");
  });

  it("uses empty string as currentInput when input is null", async () => {
    const upper = makeDef("upper", "text", "text", async (input) => ({
      ok: true,
      output: input.toUpperCase(),
    }));
    const defs = new Map([["upper", upper]]);
    const steps = [makeInstance("upper")];

    const result = await executePipeline(null, steps, defs);
    expect(result.finalOutput).toBe("");
  });
});

describe("getPipelineInputType", () => {
  it("returns text for empty steps", () => {
    expect(getPipelineInputType([], new Map())).toBe("text");
  });

  it("returns first step inputType", () => {
    const def = makeDef("s", "image", "text", async () => ({ ok: true, output: "" }));
    const defs = new Map([["s", def]]);
    expect(getPipelineInputType([makeInstance("s")], defs)).toBe("image");
  });

  it("returns text when step def not found", () => {
    expect(getPipelineInputType([makeInstance("missing")], new Map())).toBe("text");
  });

  it("returns second step inputType when first has none", () => {
    const gen = makeDef("gen", "none", "text", async () => ({ ok: true, output: "" }));
    const proc = makeDef("proc", "image", "text", async () => ({ ok: true, output: "" }));
    const defs = new Map([
      ["gen", gen],
      ["proc", proc],
    ]);
    expect(getPipelineInputType([makeInstance("gen"), makeInstance("proc")], defs)).toBe("image");
  });

  it("returns text when only step has none inputType", () => {
    const gen = makeDef("gen", "none", "text", async () => ({ ok: true, output: "" }));
    const defs = new Map([["gen", gen]]);
    expect(getPipelineInputType([makeInstance("gen")], defs)).toBe("text");
  });
});
