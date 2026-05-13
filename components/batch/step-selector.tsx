"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { Dialog, DialogPanel } from "@headlessui/react";
import dynamic from "next/dynamic";
import type { RecipeStepDef, StepParam, DataType } from "../../libs/recipe/types";
import { STEP_CATEGORIES, searchSteps } from "../../libs/recipe/registry";
import { StyledInput, StyledSelect } from "../ui/input";
import { Button } from "../ui/button";

const Slider = dynamic(() => import("rc-slider"), {
  ssr: false,
  loading: () => <div className="h-6 w-full animate-pulse bg-bg-input rounded" />,
});

import "rc-slider/assets/index.css";

const CATEGORY_STYLES: Record<string, { dot: string }> = {
  encoding: { dot: "bg-blue-400" },
  crypto: { dot: "bg-amber-400" },
  text: { dot: "bg-emerald-400" },
  format: { dot: "bg-violet-400" },
  generators: { dot: "bg-rose-400" },
  visual: { dot: "bg-cyan-400" },
};

const OPTION_KEY_MAP: Record<string, string> = {
  "resizeMode.none": "options.none",
  "resizeMode.percent": "options.byPercent",
  "resizeMode.custom": "options.custom",
  "errorLevel.L": "options.lowL",
  "errorLevel.M": "options.mediumM",
  "errorLevel.Q": "options.quartileQ",
  "errorLevel.H": "options.highH",
  "indent.2": "options.indent2",
  "indent.4": "options.indent4",
  "indent.8": "options.indent8",
  "delimiter.,": "options.delimiterComma",
  "delimiter.;": "options.delimiterSemicolon",
  "delimiter.\\t": "options.delimiterTab",
  "version.v4": "options.uuidV4",
  "version.v7": "options.uuidV7",
  "size.300": "options.size300",
  "size.600": "options.size600",
  "size.1024": "options.size1024",
};

interface StepSelectorProps {
  selectedStep: RecipeStepDef | null;
  stepParams: Record<string, string>;
  onStepChange: (step: RecipeStepDef) => void;
  onParamsChange: (params: Record<string, string>) => void;
  inputType: DataType;
}

export default function StepSelector({
  selectedStep,
  stepParams,
  onStepChange,
  onParamsChange,
  inputType,
}: StepSelectorProps) {
  const t = useTranslations("batch");
  const tr = useTranslations("recipe");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");

  function handleParamChange(paramId: string, value: string) {
    onParamsChange({ ...stepParams, [paramId]: value });
  }

  function isBatchCompatible(step: RecipeStepDef): boolean {
    if (step.batch?.supported === false) return false;
    if (step.inputType === "none") return false;
    return step.inputType === inputType;
  }

  const allDefs = STEP_CATEGORIES.flatMap((c) => c.steps);
  const compatibleSteps = allDefs.filter(isBatchCompatible);
  const filtered = query.trim() ? searchSteps(query) : allDefs;

  function selectStep(def: RecipeStepDef) {
    const defaults: Record<string, string> = {};
    for (const p of def.parameters) {
      defaults[p.id] = p.defaultValue;
    }
    onParamsChange(defaults);
    onStepChange(def);
    setPickerOpen(false);
    setQuery("");
  }

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-fg-primary">{t("stepSelector.title")}</h3>
        {selectedStep && (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="text-xs text-accent-cyan hover:underline cursor-pointer"
          >
            {t("stepSelector.changeStep")}
          </button>
        )}
      </div>

      {!selectedStep ? (
        <Button variant="outline-cyan" size="sm" onClick={() => setPickerOpen(true)}>
          {t("stepSelector.placeholder")}
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-base">{selectedStep.icon}</span>
          <span className="text-sm font-medium text-fg-primary">
            {tr(`steps.${selectedStep.id}.name`)}
          </span>
        </div>
      )}

      {selectedStep && selectedStep.parameters.length > 0 && (
        <div className="space-y-2.5 border-t border-border-default/60 pt-3">
          <p className="text-[10px] font-medium text-fg-muted/60 uppercase tracking-wider">
            {t("stepSelector.params")}
          </p>
          {renderParams(selectedStep, stepParams, handleParamChange, tr)}
        </div>
      )}

      <Dialog open={pickerOpen} onClose={() => setPickerOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-lg max-h-[75vh] bg-bg-surface border border-border-default rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border-default">
              <Search size={16} className="text-fg-muted shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("stepSelector.placeholder")}
                className="flex-1 bg-transparent text-sm text-fg-primary placeholder:text-fg-muted outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="p-1 rounded-lg text-fg-muted hover:text-fg-secondary hover:bg-bg-elevated transition-all duration-200"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {STEP_CATEGORIES.map((cat) => {
                const catSteps = filtered.filter(
                  (s) => s.category === cat.id && compatibleSteps.some((c) => c.id === s.id)
                );
                if (catSteps.length === 0) return null;
                const catStyle = CATEGORY_STYLES[cat.id] ?? CATEGORY_STYLES.text;
                return (
                  <div key={cat.id} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                      <p className="text-[11px] font-semibold text-fg-muted uppercase tracking-widest">
                        {tr(`categories.${cat.id}`)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      {catSteps.map((def) => (
                        <button
                          key={def.id}
                          type="button"
                          onClick={() => selectStep(def)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all duration-200 hover:bg-bg-elevated text-fg-primary cursor-pointer"
                        >
                          <span className="text-base shrink-0">{def.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-[13px]">
                              {tr(`steps.${def.id}.name`)}
                            </p>
                            <p className="text-[11px] text-fg-muted truncate mt-0.5">
                              {tr(`steps.${def.id}.desc`)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}

function renderParams(
  def: RecipeStepDef,
  params: Record<string, string>,
  onChange: (id: string, value: string) => void,
  t: ReturnType<typeof useTranslations>
) {
  const visibleParams = def.parameters.filter((param) => {
    if (!param.dependsOn) return true;
    const depVal =
      params[param.dependsOn.paramId] ??
      def.parameters.find((p) => p.id === param.dependsOn!.paramId)?.defaultValue ??
      "";
    return param.dependsOn.values.includes(depVal);
  });

  type P = (typeof visibleParams)[number];
  const groups: P[][] = [];
  let buf: P[] = [];
  const flush = () => {
    if (buf.length > 0) {
      groups.push(buf);
      buf = [];
    }
  };
  for (const p of visibleParams) {
    if (p.type === "checkbox") buf.push(p);
    else {
      flush();
      groups.push([p]);
    }
  }
  flush();

  function renderCb(param: P) {
    const checked = (params[param.id] ?? param.defaultValue) === "true";
    const label = t.has(`params.${param.label}`) ? t(`params.${param.label}`) : param.label;
    return (
      <label key={param.id} className="flex items-center gap-2.5 cursor-pointer select-none group">
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          aria-label={label}
          onClick={() => onChange(param.id, checked ? "false" : "true")}
          className={`recipe-toggle relative h-[20px] w-[36px] rounded-full transition-colors duration-200 shrink-0 hover:shadow-[0_0_6px_var(--accent-cyan)] ${
            checked ? "bg-accent-cyan" : "bg-border-default hover:bg-fg-muted/40"
          }`}
        >
          <span
            className={`absolute top-[2px] left-[2px] h-[16px] w-[16px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
              checked ? "translate-x-[16px]" : "translate-x-0"
            }`}
          />
        </button>
        <span className="text-xs font-medium text-fg-secondary group-hover:text-fg-primary transition-colors">
          {label}
        </span>
      </label>
    );
  }

  return (
    <div className="space-y-2.5">
      {groups.flatMap((grp) => {
        if (grp.length >= 2 && grp.every((p) => p.type === "checkbox")) {
          return [
            <div
              key={grp.map((p) => p.id).join("-")}
              className="grid grid-cols-2 gap-x-6 gap-y-1.5"
            >
              {grp.map(renderCb)}
            </div>,
          ];
        }
        return grp.map((param) => {
          const label = t.has(`params.${param.label}`) ? t(`params.${param.label}`) : param.label;
          if (param.type === "select") {
            return (
              <StyledSelect
                key={param.id}
                label={label}
                value={params[param.id] ?? param.defaultValue}
                onChange={(e) => onChange(param.id, e.target.value)}
              >
                {param.options?.map((opt) => {
                  const key = OPTION_KEY_MAP[`${param.id}.${opt.value}`];
                  const optLabel = key && t.has(key) ? t(key) : opt.label;
                  return (
                    <option key={opt.value} value={opt.value}>
                      {optLabel}
                    </option>
                  );
                })}
              </StyledSelect>
            );
          }
          if (param.type === "checkbox") return renderCb(param);
          if (param.type === "slider") {
            const min = param.min ?? 0;
            const max = param.max ?? 100;
            const step = param.step ?? 1;
            const val = Number(params[param.id] ?? param.defaultValue) || min;
            return (
              <div key={param.id}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-fg-secondary">{label}</label>
                  <span className="font-mono text-xs font-bold text-accent-cyan">{val}</span>
                </div>
                <div className="px-1">
                  <Slider
                    min={min}
                    max={max}
                    step={step}
                    value={val}
                    onChange={(v) => onChange(param.id, String(typeof v === "number" ? v : v[0]))}
                    styles={{
                      rail: { backgroundColor: "var(--border-default)", height: 4 },
                      track: { backgroundColor: "var(--accent-cyan)", height: 4 },
                      handle: {
                        borderColor: "var(--accent-cyan)",
                        backgroundColor: "var(--bg-surface)",
                        height: 16,
                        width: 16,
                        marginLeft: -6,
                        marginTop: -6,
                        boxShadow: "0 0 4px var(--accent-cyan)",
                      },
                    }}
                  />
                </div>
              </div>
            );
          }
          return (
            <StyledInput
              key={param.id}
              label={label}
              value={params[param.id] ?? param.defaultValue}
              onChange={(e) => onChange(param.id, e.target.value)}
              placeholder={
                param.placeholder
                  ? t.has(`placeholders.${param.placeholder}`)
                    ? t(`placeholders.${param.placeholder}`)
                    : param.placeholder
                  : undefined
              }
            />
          );
        });
      })}
    </div>
  );
}
