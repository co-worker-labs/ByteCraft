"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { RecipeStepInstance, StepOutput } from "../../libs/recipe/types";
import { STEP_REGISTRY } from "../../libs/recipe/registry";
import StepCard from "./step-card";
import StepPicker from "./step-picker";
import { Button } from "../ui/button";
import { Plus, FlaskConical } from "lucide-react";

interface PipelineProps {
  steps: RecipeStepInstance[];
  outputs: StepOutput[];
  errorStepIndex: number | null;
  isLoading: boolean;
  onStepsChange: (steps: RecipeStepInstance[]) => void;
}

function FlowConnector({ type }: { type: "text" | "image" | "none" }) {
  const colorMap = {
    text: "bg-accent-cyan",
    image: "bg-accent-purple",
    none: "bg-fg-muted",
  };

  return (
    <div className="flex items-center justify-center h-5 py-1">
      <div className="flex items-center gap-1.5">
        <div className={`w-6 h-[2px] rounded-full ${colorMap[type]} opacity-40`} />
        <div className={`w-1 h-1 rounded-full ${colorMap[type]} opacity-50`} />
        <div className={`w-6 h-[2px] rounded-full ${colorMap[type]} opacity-40`} />
      </div>
    </div>
  );
}

export default function Pipeline({
  steps,
  outputs,
  errorStepIndex,
  isLoading,
  onStepsChange,
}: PipelineProps) {
  const t = useTranslations("recipe");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [insertPos, setInsertPos] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    index: number;
    position: "before" | "after";
  } | null>(null);

  function handleAddStep(position: number) {
    setInsertPos(position);
    setPickerOpen(true);
  }

  function handleSelectStep(def: import("../../libs/recipe/types").RecipeStepDef) {
    const newInstance: RecipeStepInstance = {
      stepId: def.id,
      params: Object.fromEntries(def.parameters.map((p) => [p.id, p.defaultValue])),
      enabled: true,
    };
    const newSteps = [...steps];
    newSteps.splice(insertPos, 0, newInstance);
    onStepsChange(newSteps);
    if (def.parameters.length > 0) {
      setExpandedIndex(insertPos);
    }
  }

  function handleDelete(index: number) {
    onStepsChange(steps.filter((_, i) => i !== index));
    setExpandedIndex((prev) => {
      if (prev === null) return null;
      if (prev === index) return null;
      if (prev > index) return prev - 1;
      return prev;
    });
  }

  function handleToggleEnabled(index: number) {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], enabled: !newSteps[index].enabled };
    onStepsChange(newSteps);
  }

  function handleParamsChange(index: number, params: Record<string, string>) {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], params };
    onStepsChange(newSteps);
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
    setDropTarget(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDropTarget(null);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? "before" : "after";
    setDropTarget({ index, position });
  }

  function handleDragLeave() {
    setDropTarget(null);
  }

  function handleDrop() {
    if (dragIndex === null || !dropTarget) return;
    if (dragIndex === dropTarget.index) {
      setDragIndex(null);
      setDropTarget(null);
      return;
    }

    const newSteps = [...steps];
    const [moved] = newSteps.splice(dragIndex, 1);
    let targetIndex = dropTarget.index;
    if (dragIndex < dropTarget.index) targetIndex--;
    if (dropTarget.position === "after") targetIndex++;
    newSteps.splice(targetIndex, 0, moved);
    onStepsChange(newSteps);
    setDragIndex(null);
    setDropTarget(null);
  }

  function getOutputForStep(index: number): StepOutput | undefined {
    let outputIdx = 0;
    for (let i = 0; i <= index; i++) {
      if (steps[i].enabled) {
        if (i === index) return outputs[outputIdx];
        outputIdx++;
      }
    }
    return undefined;
  }

  function getErrorForStep(index: number): boolean {
    if (errorStepIndex === null) return false;
    let enabledIdx = 0;
    for (let i = 0; i <= index; i++) {
      if (steps[i].enabled) {
        if (i === index) return enabledIdx === errorStepIndex;
        enabledIdx++;
      }
    }
    return false;
  }

  function getFlowType(index: number): "text" | "image" | "none" {
    if (!outputs.length) {
      const def = STEP_REGISTRY.get(steps[index]?.stepId);
      return def?.outputType ?? "text";
    }
    const output = getOutputForStep(index);
    return output?.outputType ?? "text";
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => handleAddStep(0)}
        className="w-full group flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border-default hover:border-accent-cyan/50 bg-transparent hover:bg-accent-cyan-dim/30 text-fg-muted hover:text-accent-cyan transition-all duration-200 cursor-pointer"
      >
        <Plus size={14} className="transition-transform duration-200 group-hover:rotate-90" />
        <span className="text-xs font-medium">{t("addStep")}</span>
      </button>

      {steps.flatMap((instance, index) => {
        const def = STEP_REGISTRY.get(instance.stepId);
        if (!def) return [];

        const isDropBefore = dropTarget?.index === index && dropTarget.position === "before";
        const isDropAfter = dropTarget?.index === index && dropTarget.position === "after";
        const isDragging = dragIndex === index;
        const flowType = getFlowType(index);

        const card = (
          <div
            key={`step-${index}`}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            role="listitem"
            className={`transition-all duration-200 ${isDragging ? "opacity-40 scale-[0.98]" : ""}`}
          >
            {isDropBefore && (
              <div className="h-1 rounded-full bg-accent-cyan mx-3 mb-1 opacity-70 shadow-[0_0_8px_rgba(6,214,160,0.3)]" />
            )}
            <StepCard
              def={def}
              instance={instance}
              output={getOutputForStep(index)}
              isErrored={getErrorForStep(index)}
              isLoading={isLoading && index === steps.length - 1}
              isOpen={expandedIndex === index}
              onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
              onToggleEnabled={() => handleToggleEnabled(index)}
              onDelete={() => handleDelete(index)}
              onParamsChange={(params) => handleParamsChange(index, params)}
              dragHandleProps={{
                draggable: true,
                onDragStart: () => handleDragStart(index),
              }}
            />
            {isDropAfter && (
              <div className="h-1 rounded-full bg-accent-cyan mx-3 mt-1 opacity-70 shadow-[0_0_8px_rgba(6,214,160,0.3)]" />
            )}
          </div>
        );

        if (index < steps.length - 1) {
          return [
            card,
            <div key={`connector-${index}`} className="flex items-center justify-center">
              <FlowConnector type={flowType} />
            </div>,
          ];
        }

        return [card];
      })}

      {steps.length > 0 && (
        <button
          type="button"
          onClick={() => handleAddStep(steps.length)}
          className="w-full group flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border-default hover:border-accent-cyan/50 bg-transparent hover:bg-accent-cyan-dim/30 text-fg-muted hover:text-accent-cyan transition-all duration-200 cursor-pointer"
        >
          <Plus size={14} className="transition-transform duration-200 group-hover:rotate-90" />
          <span className="text-xs font-medium">{t("addStep")}</span>
        </button>
      )}

      {steps.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed border-border-default/60">
          <FlaskConical size={28} className="text-fg-muted/40 mb-3" />
          <p className="text-xs text-fg-muted text-center leading-relaxed">
            {t("addStepsToBuild")}
          </p>
        </div>
      )}

      <StepPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelectStep}
        insertPosition={insertPos}
        currentSteps={steps}
      />
    </div>
  );
}
