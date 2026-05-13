import { describe, it, expect, vi } from "vitest";
import { executeBatch, MAX_BATCH_ITEMS } from "../engine";
import type { BatchConfig, BatchAbortSignal } from "../types";
import type { RecipeStepDef } from "../../recipe/types";

vi.mock("../../recipe/registry", () => ({
  STEP_REGISTRY: new Map<string, RecipeStepDef>(),
  getStep: vi.fn(),
}));

import { getStep } from "../../recipe/registry";
const mockedGetStep = vi.mocked(getStep);

function makeConfig(stepId = "test-step"): BatchConfig {
  return { stepId, stepParams: {} };
}

function makeTextDef(
  execute: (
    input: string,
    params: Record<string, string>
  ) => Promise<{ ok: boolean; output?: string; error?: string }>
): RecipeStepDef {
  return {
    id: "test-step",
    name: "Test Step",
    category: "encoding",
    icon: "🔧",
    description: "Test",
    inputType: "text",
    outputType: "text",
    parameters: [],
    execute,
  };
}

describe("executeBatch", () => {
  it("executes step on each input item", async () => {
    const def = makeTextDef(async (input) => ({ ok: true, output: input.toUpperCase() }));
    mockedGetStep.mockReturnValue(def);
    const inputs = [
      { id: "1", name: "hello", content: "hello", type: "text" as const, size: 5 },
      { id: "2", name: "world", content: "world", type: "text" as const, size: 5 },
    ];
    const results = await executeBatch(makeConfig(), inputs);
    expect(results).toHaveLength(2);
    expect(results[0].output).toBe("HELLO");
    expect(results[1].output).toBe("WORLD");
    expect(results[0].status).toBe("success");
  });

  it("isolates errors — one failure does not stop others", async () => {
    let callCount = 0;
    const def = makeTextDef(async (input) => {
      callCount++;
      if (input === "fail") return { ok: false, error: "bad input" };
      return { ok: true, output: input.toUpperCase() };
    });
    mockedGetStep.mockReturnValue(def);
    const inputs = [
      { id: "1", name: "ok1", content: "ok1", type: "text" as const, size: 3 },
      { id: "2", name: "fail", content: "fail", type: "text" as const, size: 4 },
      { id: "3", name: "ok2", content: "ok2", type: "text" as const, size: 3 },
    ];
    const results = await executeBatch(makeConfig(), inputs);
    expect(results[0].status).toBe("success");
    expect(results[1].status).toBe("error");
    expect(results[1].error).toBe("bad input");
    expect(results[2].status).toBe("success");
    expect(callCount).toBe(3);
  });

  it("returns empty array for empty inputs", async () => {
    const def = makeTextDef(async (input) => ({ ok: true, output: input }));
    mockedGetStep.mockReturnValue(def);
    const results = await executeBatch(makeConfig(), []);
    expect(results).toEqual([]);
  });

  it("reports progress after each item", async () => {
    const def = makeTextDef(async (input) => ({ ok: true, output: input }));
    mockedGetStep.mockReturnValue(def);
    const progress = vi.fn();
    const inputs = [
      { id: "1", name: "a", content: "a", type: "text" as const, size: 1 },
      { id: "2", name: "b", content: "b", type: "text" as const, size: 1 },
      { id: "3", name: "c", content: "c", type: "text" as const, size: 1 },
    ];
    await executeBatch(makeConfig(), inputs, progress);
    expect(progress).toHaveBeenCalledTimes(3);
    expect(progress).toHaveBeenNthCalledWith(1, 1, 3);
    expect(progress).toHaveBeenNthCalledWith(2, 2, 3);
    expect(progress).toHaveBeenNthCalledWith(3, 3, 3);
  });

  it("throws if inputs exceed MAX_BATCH_ITEMS", async () => {
    const def = makeTextDef(async (input) => ({ ok: true, output: input }));
    mockedGetStep.mockReturnValue(def);
    const tooMany = Array.from({ length: MAX_BATCH_ITEMS + 1 }, (_, i) => ({
      id: String(i),
      name: String(i),
      content: String(i),
      type: "text" as const,
      size: 1,
    }));
    await expect(executeBatch(makeConfig(), tooMany)).rejects.toThrow(
      `Maximum ${MAX_BATCH_ITEMS} items allowed`
    );
  });

  it("stops on abort signal and returns partial results", async () => {
    const def = makeTextDef(async (input) => ({ ok: true, output: input }));
    mockedGetStep.mockReturnValue(def);
    const signal: BatchAbortSignal = { cancelled: false };
    const inputs = [
      { id: "1", name: "a", content: "a", type: "text" as const, size: 1 },
      { id: "2", name: "b", content: "b", type: "text" as const, size: 1 },
      { id: "3", name: "c", content: "c", type: "text" as const, size: 1 },
    ];
    const progress = vi.fn((_completed: number, _total: number) => {
      if (_completed === 1) signal.cancelled = true;
    });
    const results = await executeBatch(makeConfig(), inputs, progress, signal);
    expect(results.length).toBeLessThan(3);
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it("returns error for all items when step not found", async () => {
    mockedGetStep.mockReturnValue(undefined);
    const inputs = [{ id: "1", name: "a", content: "a", type: "text" as const, size: 1 }];
    const results = await executeBatch(makeConfig(), inputs);
    expect(results[0].status).toBe("error");
    expect(results[0].error).toContain("not found");
  });

  it("tracks duration per item", async () => {
    const def = makeTextDef(async (input) => ({ ok: true, output: input }));
    mockedGetStep.mockReturnValue(def);
    const inputs = [{ id: "1", name: "a", content: "a", type: "text" as const, size: 1 }];
    const results = await executeBatch(makeConfig(), inputs);
    expect(results[0].duration).toBeGreaterThanOrEqual(0);
  });
});
