"use client";

import { useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { renderLinkedText } from "../../../utils/linked-text";
import { FolderOpen, Upload, X, CircleHelp } from "lucide-react";
import Layout from "../../../components/layout";
import { StyledTextarea } from "../../../components/ui/input";
import { showToast } from "../../../libs/toast";
import { useDropZone } from "../../../hooks/useDropZone";
import { tokenize, CONTEXT_WINDOW } from "../../../libs/token-counter/main";
import RelatedTools from "../../../components/related-tools";
import PrivacyBanner from "../../../components/privacy-banner";
import { Accordion } from "../../../components/ui/accordion";

const MAX_VIS_TOKENS = 2000;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function renderTokenText(tokenText: string) {
  const lines = tokenText.split("\n");
  const nodes: React.ReactNode[] = [];
  lines.forEach((line, i) => {
    if (i > 0) {
      nodes.push(
        <span key={`nl-${i}`} className="text-fg-muted">
          {"\u21B5"}
        </span>
      );
      nodes.push(<br key={`br-${i}`} />);
    }
    if (line) nodes.push(line);
  });
  return nodes;
}

function Conversion() {
  const t = useTranslations("tokencounter");
  const tc = useTranslations("common");
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const result = tokenize(text);

  const dropZone = useDropZone(async (file) => {
    if (file.size > MAX_FILE_SIZE) {
      showToast(tc("tooLarge"), "danger", 3000);
      return;
    }
    const content = await file.text();
    setText(content);
    showToast(tc("fileLoaded"), "success", 2000);
  });

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      showToast(tc("tooLarge"), "danger", 3000);
      e.target.value = "";
      return;
    }
    file.text().then((content) => {
      setText(content);
      showToast(tc("fileLoaded"), "success", 2000);
    });
    e.target.value = "";
  }

  const showPartial = result.tokens.length > MAX_VIS_TOKENS;
  const displayTokens = result.tokens.slice(0, MAX_VIS_TOKENS);

  const statCards = [
    { label: t("tokens"), value: result.tokenCount },
    { label: t("characters"), value: result.charCount },
    {
      label: t("charsPerToken"),
      value: result.tokenCount > 0 ? (result.charCount / result.tokenCount).toFixed(2) : "0",
    },
    {
      label: t("contextUsage"),
      value: `${((result.tokenCount / CONTEXT_WINDOW) * 100).toFixed(3)}%`,
    },
  ];

  return (
    <section id="conversion">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-bg-surface border border-border-default rounded-xl p-4 text-center"
          >
            <div className="text-xs text-fg-muted mb-1">{card.label}</div>
            <div className="text-2xl font-bold text-accent-cyan font-mono">{card.value}</div>
          </div>
        ))}
      </div>

      <div
        className="relative"
        onDragOver={dropZone.onDragOver}
        onDragEnter={dropZone.onDragEnter}
        onDragLeave={dropZone.onDragLeave}
        onDrop={dropZone.onDrop}
      >
        {dropZone.isDragging && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl border-2 border-dashed border-accent-cyan bg-accent-cyan/5 backdrop-blur-sm pointer-events-none">
            <div className="text-center">
              <Upload size={40} className="mx-auto mb-3 text-accent-cyan" />
              <p className="text-lg font-semibold text-accent-cyan">{tc("dropActive")}</p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mb-1.5">
          <button
            type="button"
            className="text-fg-secondary text-xs hover:text-fg-primary transition-colors cursor-pointer inline-flex items-center gap-1"
            onClick={() => fileInputRef.current?.click()}
          >
            <FolderOpen size={12} />
            {tc("loadFile")}
          </button>
          {text && (
            <button
              type="button"
              className="text-danger text-xs hover:text-danger/80 transition-colors cursor-pointer inline-flex items-center gap-1"
              onClick={() => {
                setText("");
                showToast(tc("cleared"), "danger", 2000);
              }}
            >
              <X size={12} />
              {tc("clear")}
            </button>
          )}
        </div>
        <StyledTextarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("textareaPlaceholder")}
          className="font-mono h-[30vh] resize-y"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.log,.csv,.json,.html,.xml,.yaml,.yml,.text"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {result.tokens.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-fg-muted mb-2 font-mono">{t("contextWindow")}</div>
          {showPartial && (
            <div className="text-xs text-fg-muted mb-2">
              {t("showingPartial", { limit: MAX_VIS_TOKENS, total: result.tokens.length })}
            </div>
          )}
          <div className="bg-bg-surface border border-border-default rounded-xl p-4 font-mono text-sm leading-relaxed break-all">
            {displayTokens.map((token, i) => (
              <span
                key={i}
                className="rounded px-0.5 mx-px"
                style={{
                  backgroundColor: `color-mix(in srgb, var(--tool-icon-${i % 20}) 25%, transparent)`,
                }}
                title={`Token #${i}\nText: "${token.text}"\nID: ${token.id}`}
              >
                {renderTokenText(token.text)}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Description() {
  const t = useTranslations("tokencounter");
  const tc = useTranslations("common");
  const locale = useLocale();

  const faqItems = [1, 2, 3].map((i) => ({
    title: t(`descriptions.faq${i}Q`),
    content: <p>{t(`descriptions.faq${i}A`)}</p>,
  }));

  return (
    <section id="description" className="mt-8">
      <div className="border-l-2 border-accent-cyan/40 pl-4 py-2.5 mb-4">
        <p className="text-fg-secondary text-sm leading-relaxed">
          {t("descriptions.aeoDefinition")}
        </p>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold text-fg-primary text-base">{t("descriptions.whatIsTitle")}</h2>
        <div className="mt-1 space-y-1.5 text-fg-secondary text-sm leading-relaxed">
          <p>{renderLinkedText(t("descriptions.whatIsP1"), locale)}</p>
          <p>{t("descriptions.whatIsP2")}</p>
        </div>
      </div>
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <CircleHelp size={16} className="text-accent-cyan shrink-0" aria-hidden="true" />
          <h2 className="font-semibold text-fg-primary text-base text-pretty">
            {tc("descriptions.faqTitle")}
          </h2>
        </div>
        <Accordion items={faqItems} />
      </div>
    </section>
  );
}

export default function TokenCounterPage() {
  const t = useTranslations("tools");
  const title = t("tokencounter.shortTitle");
  return (
    <Layout title={title} categoryLabel={t("categories.text")} categorySlug="text-processing">
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner />
        <Conversion />
        <Description />
        <RelatedTools currentTool="tokencounter" />
      </div>
    </Layout>
  );
}
