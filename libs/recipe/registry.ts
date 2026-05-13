import fuzzysort from "fuzzysort";
import type { RecipeStepDef, StepCategory, DataType } from "./types";
import { isCompatible } from "./engine";

export const STEP_REGISTRY: Map<string, RecipeStepDef> = new Map();

export interface StepCategoryGroup {
  id: StepCategory;
  label: string;
  steps: RecipeStepDef[];
}

const CATEGORY_ORDER: StepCategory[] = [
  "encoding",
  "crypto",
  "text",
  "format",
  "generators",
  "visual",
];

const CATEGORY_LABELS: Record<StepCategory, string> = {
  encoding: "Encoding",
  crypto: "Crypto",
  text: "Text",
  format: "Format",
  generators: "Generators",
  visual: "Visual",
};

export let STEP_CATEGORIES: StepCategoryGroup[] = [];

export function registerSteps(defs: RecipeStepDef[]): void {
  for (const def of defs) {
    STEP_REGISTRY.set(def.id, def);
  }
  STEP_CATEGORIES = CATEGORY_ORDER.map((id) => ({
    id,
    label: CATEGORY_LABELS[id],
    steps: defs.filter((d) => d.category === id),
  })).filter((c) => c.steps.length > 0);
}

export function getStep(id: string): RecipeStepDef | undefined {
  return STEP_REGISTRY.get(id);
}

export function searchSteps(query: string): RecipeStepDef[] {
  const allSteps = Array.from(STEP_REGISTRY.values());
  if (!query.trim()) return allSteps;
  const results = fuzzysort.go(query, allSteps, {
    keys: ["name", "description", "id"],
    scoreFn: (r) => {
      const nameScore = r[0]?.score ?? 0;
      const descScore = r[1]?.score ?? 0;
      const idScore = r[2]?.score ?? 0;
      return Math.max(nameScore * 2, descScore, idScore);
    },
  });
  return results.map((r) => r.obj);
}

export function getCompatibleSteps(
  insertPosition: number,
  previousOutputType: DataType | null,
  allSteps: RecipeStepDef[]
): RecipeStepDef[] {
  return allSteps.filter((step) => {
    if (insertPosition === 0) {
      if (previousOutputType === null) return true;
    }
    return isCompatible(previousOutputType, step);
  });
}
