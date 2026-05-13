"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import PrivacyBanner from "../../../components/privacy-banner";
import DescriptionSection from "../../../components/description-section";
import StepSelector from "../../../components/batch/step-selector";
import InputPanel from "../../../components/batch/input-panel";
import ResultPanel from "../../../components/batch/result-panel";
import BatchSummary from "../../../components/batch/batch-summary";
import ProgressBar from "../../../components/batch/progress-bar";
import type {
  BatchInputItem,
  BatchResultItem,
  BatchStatus,
  BatchAbortSignal,
} from "../../../libs/batch/types";
import type { RecipeStepDef, DataType } from "../../../libs/recipe/types";
import { executeBatch } from "../../../libs/batch/engine";
import "../../../libs/recipe/steps/index";

export default function BatchPage() {
  const t = useTranslations("tools");
  const [selectedStep, setSelectedStep] = useState<RecipeStepDef | null>(null);
  const [stepParams, setStepParams] = useState<Record<string, string>>({});
  const [inputs, setInputs] = useState<BatchInputItem[]>([]);
  const [results, setResults] = useState<BatchResultItem[]>([]);
  const [status, setStatus] = useState<BatchStatus>("idle");
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const startTimeRef = useRef(0);
  const [duration, setDuration] = useState(0);

  const inputType: DataType = selectedStep?.inputType ?? "text";
  const outputType: DataType = selectedStep?.outputType ?? "text";

  useEffect(() => {
    const signal: BatchAbortSignal = { cancelled: false };
    let cancelled = false;
    startTimeRef.current = performance.now();

    async function run() {
      if (signal.cancelled) return;

      if (!selectedStep || inputs.length === 0) {
        setStatus("idle");
        setResults([]);
        return;
      }

      setStatus("running");
      setProgress({ completed: 0, total: inputs.length });

      const batchResults = await executeBatch(
        { stepId: selectedStep.id, stepParams },
        inputs,
        (completed, total) => {
          if (!cancelled) setProgress({ completed, total });
        },
        signal
      );

      if (cancelled) return;
      setResults(batchResults);
      setDuration(performance.now() - startTimeRef.current);
      const allSuccess =
        batchResults.length > 0 && batchResults.every((r) => r.status === "success");
      setStatus(allSuccess ? "done" : "partial-error");
    }

    const timer = setTimeout(run, 300);

    return () => {
      clearTimeout(timer);
      cancelled = true;
      signal.cancelled = true;
    };
  }, [selectedStep, stepParams, inputs]);

  const filenameTemplate = selectedStep?.batch?.outputFilenameTemplate ?? "{name}_output";

  return (
    <Layout
      title={t("batch.shortTitle")}
      categoryLabel={t("categories.workflows")}
      categorySlug="workflows"
    >
      <div className="min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <PrivacyBanner />
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5 space-y-5">
              <StepSelector
                selectedStep={selectedStep}
                stepParams={stepParams}
                onStepChange={setSelectedStep}
                onParamsChange={setStepParams}
                inputType={inputType}
              />
              <InputPanel
                inputs={inputs}
                onInputsChange={setInputs}
                inputType={inputType === "image" ? "image" : "text"}
              />
            </div>
            <div className="lg:col-span-7 lg:sticky lg:top-16 lg:self-start mt-5 lg:mt-0 space-y-3">
              {status === "running" && (
                <ProgressBar current={progress.completed} total={progress.total} />
              )}
              <ResultPanel
                results={results}
                inputs={inputs}
                outputType={outputType}
                filenameTemplate={filenameTemplate}
              />
              <BatchSummary
                results={results}
                inputs={inputs}
                outputType={outputType}
                duration={duration}
              />
            </div>
          </div>
          <DescriptionSection namespace="batch" />
        </div>
      </div>
    </Layout>
  );
}
