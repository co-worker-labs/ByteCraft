"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import { StyledInput, StyledSelect, StyledTextarea } from "../../../components/ui/input";
import { CopyButton } from "../../../components/ui/copy-btn";
import { NeonTabs } from "../../../components/ui/tabs";
import DescriptionSection from "../../../components/description-section";
import RelatedTools from "../../../components/related-tools";
import {
  type CSSUnit,
  type ConvertConfig,
  CSS_UNITS,
  VIEWPORT_PRESETS,
  PX_REFERENCE_VALUES,
  BATCH_DIRECTIONS,
  convert,
  convertCssCode,
} from "../../../libs/cssunit/main";

function ConfigBar({
  config,
  onChange,
}: {
  config: ConvertConfig;
  onChange: (config: ConvertConfig) => void;
}) {
  const t = useTranslations("cssunit");
  const activePreset = VIEWPORT_PRESETS.findIndex(
    (p) => p.width === config.viewportW && p.height === config.viewportH
  );

  return (
    <div>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs text-fg-muted font-mono mb-1">
            {t("rootFontSize")} (px)
          </label>
          <StyledInput
            type="number"
            min={0}
            value={config.rootFontSize}
            onChange={(e) => onChange({ ...config, rootFontSize: Number(e.target.value) })}
            className="font-mono text-center"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs text-fg-muted font-mono mb-1">
            {t("parentFontSize")} (px)
          </label>
          <StyledInput
            type="number"
            min={0}
            value={config.parentFontSize}
            onChange={(e) => onChange({ ...config, parentFontSize: Number(e.target.value) })}
            className="font-mono text-center"
          />
        </div>
        <div className="flex-1 min-w-[100px]">
          <label className="block text-xs text-fg-muted font-mono mb-1">{t("width")} (px)</label>
          <StyledInput
            type="number"
            min={1}
            value={config.viewportW}
            onChange={(e) => onChange({ ...config, viewportW: Number(e.target.value) })}
            className="font-mono text-center"
          />
        </div>
        <span className="text-fg-muted font-bold">×</span>
        <div className="flex-1 min-w-[100px]">
          <label className="block text-xs text-fg-muted font-mono mb-1">{t("height")} (px)</label>
          <StyledInput
            type="number"
            min={1}
            value={config.viewportH}
            onChange={(e) => onChange({ ...config, viewportH: Number(e.target.value) })}
            className="font-mono text-center"
          />
        </div>
        <div className="w-[100px]">
          <label className="block text-xs text-fg-muted font-mono mb-1">{t("precision")}</label>
          <StyledInput
            type="number"
            min={0}
            max={10}
            value={config.precision}
            onChange={(e) => onChange({ ...config, precision: Number(e.target.value) })}
            className="font-mono text-center"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {VIEWPORT_PRESETS.map((preset, i) => (
          <button
            key={i}
            type="button"
            onClick={() =>
              onChange({ ...config, viewportW: preset.width, viewportH: preset.height })
            }
            className={
              "px-2.5 py-1 rounded-full text-xs font-mono transition-colors cursor-pointer " +
              (activePreset === i
                ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40"
                : "bg-bg-elevated text-fg-secondary border border-border-default hover:border-accent-cyan/40")
            }
          >
            {t(preset.label)} {preset.width}×{preset.height}
          </button>
        ))}
      </div>
    </div>
  );
}

function ConverterTab({ config }: { config: ConvertConfig }) {
  const t = useTranslations("cssunit");
  const [inputValue, setInputValue] = useState("16");
  const [inputUnit, setInputUnit] = useState<CSSUnit>("px");

  const numValue = parseFloat(inputValue);
  const isValid = inputValue !== "" && !isNaN(numValue);

  const results = CSS_UNITS.map((unit) => {
    if (unit.key === inputUnit) {
      return { unit: unit.key, value: numValue, isOriginal: true };
    }
    if (!isValid) {
      return { unit: unit.key, value: null, isOriginal: false };
    }
    const converted = convert(numValue, inputUnit, unit.key, config);
    return { unit: unit.key, value: converted, isOriginal: false };
  });

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <StyledInput
            type="number"
            placeholder={t("enterValue")}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="text-lg font-mono font-bold text-center"
          />
        </div>
        <div className="w-[100px]">
          <StyledSelect
            value={inputUnit}
            onChange={(e) => setInputUnit(e.target.value as CSSUnit)}
            className="font-mono font-bold text-center"
          >
            {CSS_UNITS.map((u) => (
              <option key={u.key} value={u.key}>
                {u.label}
              </option>
            ))}
          </StyledSelect>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border-default overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-default bg-bg-elevated/40">
              <th className="py-2 px-4 text-fg-muted text-xs font-mono font-medium text-left whitespace-nowrap uppercase tracking-wider">
                {t("unit")}
              </th>
              <th className="py-2 px-4 text-fg-muted text-xs font-mono font-medium text-left whitespace-nowrap uppercase tracking-wider">
                {t("result")}
              </th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {results.map((row) => (
              <tr
                key={row.unit}
                className={
                  "border-b border-border-default last:border-b-0 " +
                  (row.isOriginal ? "bg-accent-cyan/5" : "hover:bg-bg-elevated/60")
                }
              >
                <td className="py-2.5 px-4 text-fg-secondary text-xs font-mono font-medium whitespace-nowrap">
                  <span className={row.isOriginal ? "text-accent-cyan" : ""}>{row.unit}</span>
                </td>
                <td className="py-2.5 px-4 font-mono text-sm">
                  {row.value !== null ? (
                    <span className={row.isOriginal ? "text-accent-cyan font-semibold" : ""}>
                      {row.value}
                    </span>
                  ) : (
                    <span className="text-fg-muted">—</span>
                  )}
                </td>
                <td className="py-2.5 px-1">
                  {row.value !== null && (
                    <CopyButton
                      getContent={() => `${row.value}${row.unit}`}
                      className="opacity-60 hover:opacity-100 transition-opacity"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BatchTab({ config }: { config: ConvertConfig }) {
  const t = useTranslations("cssunit");
  const [directionIdx, setDirectionIdx] = useState(0);
  const [sourceCode, setSourceCode] = useState("");

  const direction = BATCH_DIRECTIONS[directionIdx];
  const result = convertCssCode(sourceCode, direction.from, direction.to, config);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {BATCH_DIRECTIONS.map((d, i) => (
          <button
            key={d.key}
            type="button"
            onClick={() => setDirectionIdx(i)}
            className={
              "px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-colors cursor-pointer " +
              (directionIdx === i
                ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40"
                : "bg-bg-elevated text-fg-secondary border border-border-default hover:border-accent-cyan/40")
            }
          >
            {d.from} → {d.to}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-fg-muted font-mono uppercase tracking-wider">
              {t("sourceCss")}
            </span>
            {sourceCode && (
              <button
                type="button"
                onClick={() => setSourceCode("")}
                className="text-danger text-xs hover:text-danger/80 transition-colors cursor-pointer"
              >
                {t("clear")}
              </button>
            )}
          </div>
          <StyledTextarea
            rows={10}
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            className="font-mono text-sm"
            placeholder="font-size: 16px; margin: 8px; padding: 24px;"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-fg-muted font-mono uppercase tracking-wider">
              {t("convertedCss")}
            </span>
            {result.matchCount > 0 && <CopyButton getContent={() => result.code} />}
          </div>
          <div className="relative">
            <StyledTextarea
              rows={10}
              value={result.code}
              readOnly
              className="font-mono text-sm bg-bg-input"
            />
          </div>
        </div>
      </div>

      {sourceCode && (
        <p className="mt-2 text-xs text-fg-muted font-mono">
          {t("valuesConverted", { count: result.matchCount })}
        </p>
      )}
    </div>
  );
}

function ReferenceTab({ config }: { config: ConvertConfig }) {
  const t = useTranslations("cssunit");
  const [pairIdx, setPairIdx] = useState(0);

  const pairs = [
    { from: "px" as CSSUnit, to: "rem" as CSSUnit, label: "px → rem" },
    { from: "px" as CSSUnit, to: "em" as CSSUnit, label: "px → em" },
    { from: "px" as CSSUnit, to: "vw" as CSSUnit, label: "px → vw" },
  ];

  const pair = pairs[pairIdx];

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {pairs.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPairIdx(i)}
            className={
              "px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-colors cursor-pointer " +
              (pairIdx === i
                ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40"
                : "bg-bg-elevated text-fg-secondary border border-border-default hover:border-accent-cyan/40")
            }
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border-default overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-default bg-bg-elevated/40">
              <th className="py-2 px-4 text-fg-muted text-xs font-mono font-medium text-left whitespace-nowrap uppercase tracking-wider">
                {pair.from}
              </th>
              <th className="py-2 px-4 text-fg-muted text-xs font-mono font-medium text-left whitespace-nowrap uppercase tracking-wider">
                {pair.to}
              </th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {PX_REFERENCE_VALUES.map((px) => {
              const converted = convert(px, pair.from, pair.to, config);
              return (
                <tr
                  key={px}
                  className="border-b border-border-default last:border-b-0 hover:bg-bg-elevated/60"
                >
                  <td className="py-2.5 px-4 font-mono text-sm text-fg-secondary">
                    {px}
                    <span className="text-accent-cyan">{pair.from}</span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-sm">
                    {converted !== null ? (
                      <>
                        {converted}
                        <span className="text-accent-cyan">{pair.to}</span>
                      </>
                    ) : (
                      <span className="text-fg-muted">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-1">
                    {converted !== null && (
                      <CopyButton
                        getContent={() => `${converted}${pair.to}`}
                        className="opacity-60 hover:opacity-100 transition-opacity"
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-fg-muted font-mono">
        {t("basedOn", { rootFontSize: config.rootFontSize, precision: config.precision })}
      </p>
    </div>
  );
}

export default function CssUnitPage() {
  const t = useTranslations("tools");
  const tc = useTranslations("cssunit");
  const [config, setConfig] = useState<ConvertConfig>({
    rootFontSize: 16,
    parentFontSize: 16,
    viewportW: 1920,
    viewportH: 1080,
    precision: 4,
  });

  const title = t("cssunit.shortTitle");

  return (
    <Layout
      title={title}
      categoryLabel={t("categories.encoding")}
      categorySlug="encoding-conversion"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <ConfigBar config={config} onChange={setConfig} />

        <div className="mt-6">
          <NeonTabs
            tabs={[
              {
                label: tc("converter"),
                content: <ConverterTab config={config} />,
              },
              {
                label: tc("batchConvert"),
                content: <BatchTab config={config} />,
              },
              {
                label: tc("reference"),
                content: <ReferenceTab config={config} />,
              },
            ]}
          />
        </div>

        <DescriptionSection namespace="cssunit" />
        <RelatedTools currentTool="cssunit" />
      </div>
    </Layout>
  );
}
