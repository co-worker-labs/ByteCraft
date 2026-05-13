"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import GlobalInput from "../../../components/recipe/global-input";
import Pipeline from "../../../components/recipe/pipeline";
import RecipePanel from "../../../components/recipe/recipe-panel";
import type { DataType, RecipeStepInstance } from "../../../libs/recipe/types";
import { STEP_REGISTRY } from "../../../libs/recipe/registry";
import {
  executePipeline,
  getPipelineInputType,
  type PipelineResult,
} from "../../../libs/recipe/engine";
import { consumeDraft } from "../../../libs/recipe/storage";
import "../../../libs/recipe/steps/index";

function loadDraft(): { input: string; inputType: DataType; steps: RecipeStepInstance[] } {
  const draft = consumeDraft();
  if (draft) {
    const def = STEP_REGISTRY.get(draft.stepId);
    if (def) {
      const input = draft.input ?? "";
      const inputType: DataType = input.startsWith("data:image") ? "image" : "text";
      return {
        input,
        inputType,
        steps: [
          {
            stepId: draft.stepId,
            params: {
              ...Object.fromEntries(def.parameters.map((p) => [p.id, p.defaultValue])),
              ...draft.params,
            },
            enabled: true,
          },
        ],
      };
    }
  }
  return { input: "", inputType: "text", steps: [] };
}

const draft = loadDraft();

export default function RecipePage() {
  const t = useTranslations("tools");
  const [input, setInput] = useState(draft.input);
  const [inputDataType, setInputDataType] = useState<DataType>(draft.inputType);
  const [steps, setSteps] = useState<RecipeStepInstance[]>(draft.steps);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult>({
    steps: [],
    finalOutput: null,
    finalOutputType: null,
    errorStepIndex: null,
    cacheKeys: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef(false);
  const pipelineResultRef = useRef<PipelineResult>({
    steps: [],
    finalOutput: null,
    finalOutputType: null,
    errorStepIndex: null,
    cacheKeys: [],
  });

  useEffect(() => {
    abortRef.current = true;
    abortRef.current = false;

    const currentAbort = abortRef;
    let cancelled = false;

    async function run() {
      if (currentAbort.current) return;
      setIsLoading(true);
      const result = await executePipeline(
        input || null,
        inputDataType,
        steps,
        STEP_REGISTRY,
        pipelineResultRef.current
      );
      if (cancelled) return;
      setPipelineResult(result);
      pipelineResultRef.current = result;
      setIsLoading(false);
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [input, inputDataType, steps]);

  const resolvedInputType = getPipelineInputType(steps, STEP_REGISTRY);
  const inputType = input
    ? inputDataType
    : resolvedInputType === "none" && steps.length > 0
      ? inputDataType
      : resolvedInputType;

  return (
    <Layout
      title={t("recipe.shortTitle")}
      categoryLabel={t("categories.workflows")}
      categorySlug="workflows"
    >
      <div className="min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5 space-y-5">
              {resolvedInputType !== "none" && (
                <GlobalInput
                  expectedType={inputType}
                  inputDataType={inputDataType}
                  value={input}
                  onChange={(val, type) => {
                    setInput(val);
                    setInputDataType(type);
                  }}
                />
              )}
              <Pipeline
                steps={steps}
                outputs={pipelineResult.steps}
                errorStepIndex={pipelineResult.errorStepIndex}
                isLoading={isLoading}
                onStepsChange={setSteps}
              />
            </div>
            <div className="lg:col-span-7 lg:sticky lg:top-16 lg:self-start mt-5 lg:mt-0">
              <RecipePanel
                finalOutput={pipelineResult.finalOutput}
                finalOutputType={pipelineResult.finalOutputType}
                isLoading={isLoading}
                steps={steps}
                onLoadRecipe={setSteps}
                onAppendRecipe={(newSteps) => setSteps((prev) => [...prev, ...newSteps])}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
