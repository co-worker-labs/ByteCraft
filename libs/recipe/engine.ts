import type { DataType, RecipeStepDef, RecipeStepInstance, StepOutput, StepResult } from "./types";

export interface PipelineResult {
  steps: StepOutput[];
  finalOutput: string | null;
  finalOutputType: DataType | null;
  errorStepIndex: number | null;
  cacheKeys: { stepId: string; params: Record<string, string> }[];
}

export { type StepOutput, type StepResult };

export function isCompatible(prevOutputType: DataType | null, nextStep: RecipeStepDef): boolean {
  if (nextStep.inputType === "none") return false;
  if (prevOutputType === null) return true;
  return prevOutputType === nextStep.inputType;
}

export function getPipelineInputType(
  steps: RecipeStepInstance[],
  stepDefs: Map<string, RecipeStepDef>
): DataType {
  if (steps.length === 0) return "text";
  for (const s of steps) {
    if (!s.enabled) continue;
    const def = stepDefs.get(s.stepId);
    if (!def) return "text";
    if (def.inputType !== "none") return def.inputType;
  }
  return "none";
}

function paramsEqual(a: Record<string, string>, b: Record<string, string>): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => a[k] === b[k]);
}

function cacheKeyMatches(
  prev: { stepId: string; params: Record<string, string> } | undefined,
  current: RecipeStepInstance
): boolean {
  if (!prev) return false;
  if (prev.stepId !== current.stepId) return false;
  return paramsEqual(prev.params, current.params);
}

export async function executePipeline(
  input: string | null,
  inputType: DataType,
  steps: RecipeStepInstance[],
  stepDefs: Map<string, RecipeStepDef>,
  previousResult?: PipelineResult
): Promise<PipelineResult> {
  const emptyResult: PipelineResult = {
    steps: [],
    finalOutput: input ?? null,
    finalOutputType: input !== null ? inputType : null,
    errorStepIndex: null,
    cacheKeys: [],
  };

  if (steps.length === 0) return emptyResult;

  const outputs: StepOutput[] = [];
  const cacheKeys: PipelineResult["cacheKeys"] = [];
  let currentInput: string | null = input;
  let lastOutputType: DataType | null = input !== null ? inputType : null;
  let enabledIdx = 0;
  let reuseCache = true;

  for (let i = 0; i < steps.length; i++) {
    const instance = steps[i];
    if (!instance.enabled) continue;

    const def = stepDefs.get(instance.stepId);
    if (!def) {
      return {
        steps: outputs,
        finalOutput: null,
        finalOutputType: lastOutputType,
        errorStepIndex: i,
        cacheKeys,
      };
    }

    const cached = previousResult?.steps[enabledIdx];
    const prevKey = previousResult?.cacheKeys[enabledIdx];

    const canReuse =
      reuseCache &&
      cached &&
      cached.result.ok &&
      cacheKeyMatches(prevKey, instance) &&
      (def.inputType === "none" ? cached.input === "" : cached.input === currentInput);

    if (canReuse && cached.result.ok) {
      outputs.push(cached);
      cacheKeys.push({ stepId: instance.stepId, params: { ...instance.params } });
      currentInput = cached.result.output;
      lastOutputType = cached.outputType;
      enabledIdx++;
      continue;
    }

    reuseCache = false;

    if (def.inputType === "none") {
      const result = await def.execute("", instance.params);
      outputs.push({ input: "", result, outputType: def.outputType });
      cacheKeys.push({ stepId: instance.stepId, params: { ...instance.params } });
      if (!result.ok) {
        return {
          steps: outputs,
          finalOutput: null,
          finalOutputType: lastOutputType,
          errorStepIndex: i,
          cacheKeys,
        };
      }
      currentInput = result.output;
      lastOutputType = def.outputType;
      enabledIdx++;
      continue;
    }

    if (currentInput === null) break;

    if (lastOutputType !== null && lastOutputType !== def.inputType) {
      outputs.push({
        input: currentInput,
        result: {
          ok: false,
          error: `Input type mismatch: expected ${def.inputType}, got ${lastOutputType}`,
        },
        outputType: def.outputType,
      });
      cacheKeys.push({ stepId: instance.stepId, params: { ...instance.params } });
      return {
        steps: outputs,
        finalOutput: null,
        finalOutputType: lastOutputType,
        errorStepIndex: i,
        cacheKeys,
      };
    }

    const result = await def.execute(currentInput, instance.params);
    outputs.push({ input: currentInput, result, outputType: def.outputType });
    cacheKeys.push({ stepId: instance.stepId, params: { ...instance.params } });

    if (!result.ok) {
      return {
        steps: outputs,
        finalOutput: null,
        finalOutputType: lastOutputType,
        errorStepIndex: i,
        cacheKeys,
      };
    }

    currentInput = result.output;
    lastOutputType = def.outputType;
    enabledIdx++;
  }

  return {
    steps: outputs,
    finalOutput: currentInput,
    finalOutputType: lastOutputType,
    errorStepIndex: null,
    cacheKeys,
  };
}
