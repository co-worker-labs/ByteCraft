"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Search, X } from "lucide-react";
import type { RecipeStepDef, RecipeStepInstance, DataType } from "../../libs/recipe/types";
import { STEP_CATEGORIES, searchSteps, getCompatibleSteps } from "../../libs/recipe/registry";
import { getStep } from "../../libs/recipe/registry";

const CATEGORY_STYLES: Record<string, { dot: string; border: string }> = {
  encoding: { dot: "bg-blue-400", border: "border-blue-500/20" },
  crypto: { dot: "bg-amber-400", border: "border-amber-500/20" },
  text: { dot: "bg-emerald-400", border: "border-emerald-500/20" },
  format: { dot: "bg-violet-400", border: "border-violet-500/20" },
  generators: { dot: "bg-rose-400", border: "border-rose-500/20" },
  visual: { dot: "bg-cyan-400", border: "border-cyan-500/20" },
};

const TYPE_COLORS: Record<string, string> = {
  text: "text-fg-secondary",
  image: "text-accent-purple",
  none: "text-fg-muted",
};

interface StepPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (def: RecipeStepDef) => void;
  insertPosition: number;
  currentSteps: RecipeStepInstance[];
}

export default function StepPicker({
  open,
  onClose,
  onSelect,
  insertPosition,
  currentSteps,
}: StepPickerProps) {
  const t = useTranslations("recipe");
  const [query, setQuery] = useState("");

  const allDefs = STEP_CATEGORIES.flatMap((c) => c.steps);

  let prevOutputType: DataType | null = null;
  if (insertPosition > 0 && currentSteps.length > 0) {
    const prevIndex = Math.min(insertPosition - 1, currentSteps.length - 1);
    for (let i = prevIndex; i >= 0; i--) {
      const prevDef = getStep(currentSteps[i].stepId);
      if (prevDef && currentSteps[i].enabled) {
        prevOutputType = prevDef.outputType;
        break;
      }
    }
  }

  const compatibleSteps = getCompatibleSteps(insertPosition, prevOutputType, allDefs);
  const compatibleIds = new Set(compatibleSteps.map((s) => s.id));
  const filtered = query.trim() ? searchSteps(query) : allDefs;

  function handleSelect(def: RecipeStepDef) {
    if (!compatibleIds.has(def.id)) return;
    onSelect(def);
    setQuery("");
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-lg max-h-[75vh] bg-bg-surface border border-border-default rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border-default">
            <Search size={16} className="text-fg-muted shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchSteps")}
              className="flex-1 bg-transparent text-sm text-fg-primary placeholder:text-fg-muted outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-fg-muted hover:text-fg-secondary hover:bg-bg-elevated transition-all duration-200"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {STEP_CATEGORIES.map((cat) => {
              const catSteps = filtered.filter((s) => s.category === cat.id);
              if (catSteps.length === 0) return null;
              const catStyle = CATEGORY_STYLES[cat.id] ?? CATEGORY_STYLES.text;

              return (
                <div key={cat.id} className="mb-4 last:mb-0">
                  <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                    <p className="text-[11px] font-semibold text-fg-muted uppercase tracking-widest">
                      {t(`categories.${cat.id}`)}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    {catSteps.map((def) => {
                      const isCompatible = compatibleIds.has(def.id);
                      const stepName = t(`steps.${def.id}.name`);
                      return (
                        <button
                          key={def.id}
                          type="button"
                          disabled={!isCompatible}
                          onClick={() => handleSelect(def)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all duration-200 ${
                            isCompatible
                              ? "hover:bg-bg-elevated text-fg-primary cursor-pointer"
                              : "opacity-30 cursor-not-allowed text-fg-muted"
                          }`}
                        >
                          <span className="text-base shrink-0">{def.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-[13px]">{stepName}</p>
                            <p className="text-[11px] text-fg-muted truncate mt-0.5">
                              {t(`steps.${def.id}.desc`)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[10px] font-mono ${TYPE_COLORS[def.inputType]}`}>
                              {def.inputType}
                            </span>
                            <span className="text-[10px] text-fg-muted/40">→</span>
                            <span
                              className={`text-[10px] font-mono ${TYPE_COLORS[def.outputType]}`}
                            >
                              {def.outputType}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
