"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, ChevronDown, ChevronUp, CircleHelp } from "lucide-react";
import Layout from "../../../components/layout";
import { StyledInput } from "../../../components/ui/input";
import { Accordion } from "../../../components/ui/accordion";
import RelatedTools from "../../../components/related-tools";
import { wordlist } from "@scure/bip39/wordlists/english.js";

const WORDS: string[] = wordlist;

function TopDescription() {
  const t = useTranslations("bip39");
  const tc = useTranslations("common");
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="pb-3">
      <div className="relative">
        <div
          className={`overflow-hidden transition-all duration-300 ${
            expanded ? "max-h-[500px]" : "max-h-20"
          }`}
        >
          <p className="text-fg-secondary text-sm leading-8 indent-12">{t("descriptions.text")}</p>
        </div>
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-bg-base to-transparent pointer-events-none" />
        )}
      </div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mt-1 flex items-center gap-1 text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors"
      >
        {expanded ? (
          <>
            <ChevronUp size={14} />
            {tc("showLess")}
          </>
        ) : (
          <>
            <ChevronDown size={14} />
            {tc("showMore")}
          </>
        )}
      </button>
    </section>
  );
}

function highlightMatch(word: string, query: string): React.ReactNode {
  if (!query) return word;
  const idx = word.indexOf(query);
  if (idx === -1) return word;
  return (
    <>
      {word.slice(0, idx)}
      <span className="text-accent-cyan">{word.slice(idx, idx + query.length)}</span>
      {word.slice(idx + query.length)}
    </>
  );
}

function WordGrid() {
  const t = useTranslations("bip39");
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const filtered = !q ? WORDS : WORDS.filter((word) => word.includes(q));

  return (
    <div>
      <div className="relative mb-3">
        <StyledInput
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none"
          size={16}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-8 text-fg-muted text-sm text-center">{t("noResults")}</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-px bg-border-default rounded-lg overflow-hidden">
          {filtered.map((word) => {
            const index = WORDS.indexOf(word) + 1;
            return (
              <div
                key={word}
                className="bg-bg-surface px-2 py-1.5 flex items-center gap-1.5 hover:bg-bg-elevated/60 transition-colors duration-150"
              >
                <span className="text-fg-muted text-xs w-7 shrink-0 text-right">{index}</span>
                <span className="text-fg-primary font-mono text-sm truncate">
                  {highlightMatch(word, q)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-2 text-xs text-fg-muted text-right">
        {filtered.length} / {WORDS.length} words
      </div>
    </div>
  );
}

function BottomDescription() {
  const t = useTranslations("bip39");
  const tc = useTranslations("common");

  const descriptionSections = [
    { title: t("descriptions.whatIsTitle"), content: t("descriptions.whatIs") },
    { title: t("descriptions.purposeTitle"), content: t("descriptions.purpose") },
    { title: t("descriptions.securityTitle"), content: t("descriptions.security") },
  ];

  const faqItems = [1, 2].map((i) => ({
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
      {descriptionSections.map((section) => (
        <div key={section.title} className="mb-4">
          <h2 className="font-semibold text-fg-primary text-base">{section.title}</h2>
          <div className="mt-1 text-fg-secondary text-sm leading-relaxed">
            <p>{section.content}</p>
          </div>
        </div>
      ))}
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

export default function BIP39Page() {
  const t = useTranslations("tools");
  return (
    <Layout
      title={t("bip39.shortTitle")}
      categoryLabel={t("categories.reference")}
      categorySlug="reference-lookup"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <TopDescription />
        <WordGrid />
        <BottomDescription />
        <RelatedTools currentTool="bip39" />
      </div>
    </Layout>
  );
}
