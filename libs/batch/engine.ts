import type { BatchConfig, BatchInputItem, BatchResultItem, BatchAbortSignal } from "./types";
import { getStep } from "../recipe/registry";

export const MAX_BATCH_ITEMS = 1000;

export async function executeBatch(
  config: BatchConfig,
  inputs: BatchInputItem[],
  onProgress?: (completed: number, total: number) => void,
  abortSignal?: BatchAbortSignal
): Promise<BatchResultItem[]> {
  if (inputs.length > MAX_BATCH_ITEMS) {
    throw new Error(`Maximum ${MAX_BATCH_ITEMS} items allowed`);
  }
  if (inputs.length === 0) return [];

  const stepDef = getStep(config.stepId);
  const results: BatchResultItem[] = [];

  for (let i = 0; i < inputs.length; i++) {
    if (abortSignal?.cancelled) break;
    const input = inputs[i];

    if (!stepDef) {
      results.push({
        id: input.id,
        status: "error",
        error: `Step "${config.stepId}" not found`,
        duration: 0,
      });
      onProgress?.(i + 1, inputs.length);
      continue;
    }

    const start = performance.now();
    try {
      const result = await stepDef.execute(input.content, config.stepParams);
      const duration = performance.now() - start;
      results.push({
        id: input.id,
        status: result.ok ? "success" : "error",
        output: result.ok ? result.output : undefined,
        error: result.ok ? undefined : result.error,
        duration,
      });
    } catch (e) {
      const duration = performance.now() - start;
      results.push({
        id: input.id,
        status: "error",
        error: e instanceof Error ? e.message : String(e),
        duration,
      });
    }
    onProgress?.(i + 1, inputs.length);
  }
  return results;
}
