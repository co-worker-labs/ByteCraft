"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import Layout from "../../../components/layout";
import DescriptionSection from "../../../components/description-section";
import RelatedTools from "../../../components/related-tools";
import PrivacyBanner from "../../../components/privacy-banner";
import { CopyButton } from "../../../components/ui/copy-btn";
import { Button } from "../../../components/ui/button";
import { StyledTextarea, StyledInput } from "../../../components/ui/input";
import { showToast } from "../../../libs/toast";
import { jsonToTs, PRIMITIVE_ERROR } from "../../../libs/jsonts/main";

type OutputMode = "interface" | "type";

function Conversion() {
  const t = useTranslations("jsonts");
  const tc = useTranslations("common");

  const [jsonInput, setJsonInput] = useState("");
  const [rootName, setRootName] = useState("Root");
  const [outputMode, setOutputMode] = useState<OutputMode>("interface");
  const [exportKeyword, setExportKeyword] = useState(false);

  const trimmed = jsonInput.trim();
  let tsOutput = "";
  let error: string | null = null;

  if (trimmed) {
    const result = jsonToTs(jsonInput, {
      rootName: rootName || "Root",
      useTypeAlias: outputMode === "type",
      exportKeyword,
    });
    if (result.success) {
      tsOutput = result.types ?? "";
    } else {
      error = result.error ?? "Unknown error";
    }
  }

  return (
    <section id="conversion">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan/60" />
              <span className="font-mono text-sm font-semibold text-accent-cyan">
                {t("jsonInput")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="text-danger text-xs hover:text-danger/80 transition-colors cursor-pointer"
                onClick={() => {
                  setJsonInput("");
                  showToast(tc("cleared"), "danger", 2000);
                }}
              >
                {tc("clear")}
              </button>
            </div>
          </div>
          <div className="relative">
            <StyledTextarea
              id="jsonInput"
              placeholder={t("jsonPlaceholder")}
              rows={15}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="font-mono text-sm"
            />
            <CopyButton getContent={() => jsonInput} className="absolute end-2 top-2" />
          </div>
          {error && (
            <div role="alert" aria-live="polite" className="text-danger text-sm mt-2">
              {error === PRIMITIVE_ERROR ? t("primitiveError") : `${t("invalidJson")}: ${error}`}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-purple/60" />
              <span className="font-mono text-sm font-semibold text-accent-purple">
                {t("tsOutput")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="text-danger text-xs hover:text-danger/80 transition-colors cursor-pointer"
                disabled={!tsOutput}
                onClick={() => {
                  setJsonInput("");
                  showToast(tc("cleared"), "danger", 2000);
                }}
              >
                {tc("clear")}
              </button>
            </div>
          </div>
          <div className="relative">
            <StyledTextarea
              id="tsOutput"
              placeholder={t("tsPlaceholder")}
              rows={15}
              value={tsOutput}
              readOnly
              className="font-mono text-sm"
            />
            <CopyButton getContent={() => tsOutput} className="absolute end-2 top-2" />
          </div>
        </div>
      </div>

      <div className="mt-4 px-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-4 rounded-full bg-accent-cyan" />
          <span className="font-mono text-xs font-semibold text-fg-muted uppercase tracking-wider">
            Options
          </span>
        </div>
        <div className="w-full h-px bg-border-default" />
        <div className="flex flex-wrap items-center gap-6 px-3 mt-3">
          <div className="flex items-center gap-2">
            <label htmlFor="rootName" className="font-mono text-sm font-medium text-fg-secondary">
              {t("rootName")}
            </label>
            <StyledInput
              id="rootName"
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
              className="w-28 font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <div
              role="radiogroup"
              aria-label="Output format"
              className="inline-flex rounded-full border border-border-default p-0.5 text-xs font-mono font-semibold"
            >
              <button
                type="button"
                role="radio"
                aria-checked={outputMode === "interface"}
                onClick={() => setOutputMode("interface")}
                className={`px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                  outputMode === "interface"
                    ? "bg-accent-cyan text-bg-base shadow-glow"
                    : "text-fg-muted hover:text-fg-secondary"
                }`}
              >
                {t("interface")}
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={outputMode === "type"}
                onClick={() => setOutputMode("type")}
                className={`px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                  outputMode === "type"
                    ? "bg-accent-cyan text-bg-base shadow-glow"
                    : "text-fg-muted hover:text-fg-secondary"
                }`}
              >
                {t("type")}
              </button>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={exportKeyword}
            aria-label={t("addExport")}
            onClick={() => setExportKeyword(!exportKeyword)}
            className={
              "rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer border font-mono " +
              (exportKeyword
                ? "bg-accent-purple text-bg-base border-accent-purple"
                : "bg-transparent text-fg-muted border-border-default hover:text-fg-secondary hover:bg-bg-elevated")
            }
          >
            {t("addExport")}
          </button>

          <div className="flex-1" />

          <Button
            variant="danger"
            size="sm"
            disabled={!jsonInput.trim() && !tsOutput.trim()}
            onClick={() => {
              setJsonInput("");
              setRootName("Root");
              setOutputMode("interface");
              setExportKeyword(false);
              showToast(tc("allCleared"), "danger", 2000);
            }}
            className="rounded-full font-bold"
          >
            {tc("clearAll")}
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function JsontsPage() {
  const t = useTranslations("tools");
  const title = t("jsonts.shortTitle");

  return (
    <Layout
      title={title}
      categoryLabel={t("categories.encoding")}
      categorySlug="encoding-conversion"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner />
        <Conversion />
        <DescriptionSection namespace="jsonts" />
        <RelatedTools currentTool="jsonts" />
      </div>
    </Layout>
  );
}
