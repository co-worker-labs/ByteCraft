import type { DataType, RecipeStepDef, RecipeStepInstance, StepOutput, StepResult } from "./types";

export interface PipelineResult {
  steps: StepOutput[];
  finalOutput: string | null;
  errorStepIndex: number | null;
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
  const first = stepDefs.get(steps[0].stepId);
  if (!first) return "text";
  if (first.inputType === "none") {
    if (steps.length > 1) {
      const second = stepDefs.get(steps[1].stepId);
      return second?.inputType ?? "text";
    }
    return "text";
  }
  return first.inputType;
}

export async function executePipeline(
  input: string | null,
  steps: RecipeStepInstance[],
  stepDefs: Map<string, RecipeStepDef>
): Promise<PipelineResult> {
  if (steps.length === 0) {
    return { steps: [], finalOutput: input ?? null, errorStepIndex: null };
  }

  const outputs: StepOutput[] = [];
  let currentInput: string = input ?? "";
  let lastOutputType: DataType | null = input !== null ? "text" : null;

  for (let i = 0; i < steps.length; i++) {
    const instance = steps[i];
    if (!instance.enabled) continue;

    const def = stepDefs.get(instance.stepId);
    if (!def) {
      return {
        steps: outputs,
        finalOutput: null,
        errorStepIndex: i,
      };
    }

    const stepInput = i === 0 && def.inputType === "none" ? "" : currentInput;

    const result = await def.execute(stepInput, instance.params);
    outputs.push({ input: stepInput, result });

    if (!result.ok) {
      return { steps: outputs, finalOutput: null, errorStepIndex: i };
    }

    currentInput = result.output;
    lastOutputType = def.outputType;
  }

  return { steps: outputs, finalOutput: currentInput, errorStepIndex: null };
}
