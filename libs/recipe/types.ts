export type DataType = "text" | "image" | "none";

export type StepResult = { ok: true; output: string } | { ok: false; error: string };

export interface StepOutput {
  input: string;
  result: StepResult;
  outputType: DataType;
}

export interface StepParam {
  id: string;
  type: "text" | "select" | "slider" | "checkbox";
  label: string;
  defaultValue: string;
  options?: { label: string; value: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  dependsOn?: { paramId: string; values: string[] };
}

export type StepCategory = "encoding" | "crypto" | "text" | "format" | "generators" | "visual";

export interface RecipeStepDef {
  id: string;
  name: string;
  category: StepCategory;
  icon: string;
  description: string;
  inputType: DataType;
  outputType: DataType;
  parameters: StepParam[];
  execute(input: string, params: Record<string, string>): Promise<StepResult>;
}

export interface RecipeStepInstance {
  stepId: string;
  params: Record<string, string>;
  enabled: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  steps: RecipeStepInstance[];
  createdAt: number;
  updatedAt: number;
}

export interface RecipeDraft {
  input: string;
  stepId: string;
  params: Record<string, string>;
  sourceTool: string;
}
