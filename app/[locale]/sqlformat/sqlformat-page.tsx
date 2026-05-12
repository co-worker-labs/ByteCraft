"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { IndentIncrease, Minimize2, Trash2, FileCode } from "lucide-react";
import {
  EditorView,
  lineNumbers,
  highlightActiveLine,
  drawSelection,
  keymap,
  placeholder as cmPlaceholder,
} from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { sql, MySQL, PostgreSQL, SQLite, PLSQL, MSSQL, type SQLDialect } from "@codemirror/lang-sql";
import { Dropdown } from "../../../components/ui/dropdown";
import { Button } from "../../../components/ui/button";
import { CopyButton } from "../../../components/ui/copy-btn";
import Layout from "../../../components/layout";
import PrivacyBanner from "../../../components/privacy-banner";
import DescriptionSection from "../../../components/description-section";
import RelatedTools from "../../../components/related-tools";
import { useTheme } from "../../../libs/theme";
import { lightTheme, darkTheme } from "../../../libs/dbviewer/codemirror-theme";
import { formatSql, compressSql } from "../../../libs/sqlformat/main";
import {
  DIALECTS,
  INDENT_SIZES,
  KEYWORD_CASES,
  FUNCTION_CASES,
  USE_TABS_OPTIONS,
  LINES_BETWEEN,
} from "../../../libs/sqlformat/dialects";
import type {
  SqlLanguage,
  IndentSize,
  KeywordCase,
  FunctionCase,
  LinesBetween,
} from "../../../libs/sqlformat/dialects";

const SAMPLE_SQL = `SELECT u.id, u.name, u.email, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
  AND u.status = 'active'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 5
ORDER BY order_count DESC
LIMIT 20;`;

function getDialectExtension(language: SqlLanguage) {
  const dialectMap: Partial<Record<SqlLanguage, SQLDialect>> = {
    mysql: MySQL,
    postgresql: PostgreSQL,
    sqlite: SQLite,
    plsql: PLSQL,
    transactsql: MSSQL,
  };
  const dialect = dialectMap[language];
  return sql({ dialect, upperCaseKeywords: true });
}

function Conversion() {
  const t = useTranslations("sqlformat");
  const tc = useTranslations("common");
  const { theme } = useTheme();

  const [language, setLanguage] = useState<SqlLanguage>("sql");
  const [indentSize, setIndentSize] = useState<IndentSize>(2);
  const [keywordCase, setKeywordCase] = useState<KeywordCase>("upper");
  const [functionCase, setFunctionCase] = useState<FunctionCase>("upper");
  const [useTabs, setUseTabs] = useState(false);
  const [linesBetween, setLinesBetween] = useState<LinesBetween>(1);

  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const inputHostRef = useRef<HTMLDivElement>(null);
  const outputHostRef = useRef<HTMLDivElement>(null);
  const inputViewRef = useRef<EditorView | null>(null);
  const outputViewRef = useRef<EditorView | null>(null);
  const [inputThemeComp] = useState(() => new Compartment());
  const [inputLangComp] = useState(() => new Compartment());
  const [outputThemeComp] = useState(() => new Compartment());
  const [outputLangComp] = useState(() => new Compartment());

  const readOnlyExt = EditorState.readOnly.of(true);

  function createExtensions(themeComp: Compartment, langComp: Compartment, isReadOnly: boolean) {
    const themeExt = theme === "dark" ? darkTheme : lightTheme;
    const langExt = getDialectExtension(language);
    const base = [
      lineNumbers(),
      history(),
      highlightActiveLine(),
      drawSelection(),
      langComp.of(langExt),
      themeComp.of(themeExt),
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
      EditorView.lineWrapping,
    ];
    if (isReadOnly) base.push(readOnlyExt);
    return base;
  }

  useEffect(() => {
    if (!inputHostRef.current || inputViewRef.current) return;
    const extensions = createExtensions(inputThemeComp, inputLangComp, false);
    extensions.push(cmPlaceholder(t("inputPlaceholder")));
    const state = EditorState.create({ doc: "", extensions });
    inputViewRef.current = new EditorView({ state, parent: inputHostRef.current });
    return () => {
      inputViewRef.current?.destroy();
      inputViewRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!outputHostRef.current || outputViewRef.current) return;
    const extensions = createExtensions(outputThemeComp, outputLangComp, true);
    const state = EditorState.create({ doc: "", extensions });
    outputViewRef.current = new EditorView({ state, parent: outputHostRef.current });
    return () => {
      outputViewRef.current?.destroy();
      outputViewRef.current = null;
    };
  }, []);

  useEffect(() => {
    inputViewRef.current?.dispatch({
      effects: inputThemeComp.reconfigure(theme === "dark" ? darkTheme : lightTheme),
    });
    outputViewRef.current?.dispatch({
      effects: outputThemeComp.reconfigure(theme === "dark" ? darkTheme : lightTheme),
    });
  }, [theme, inputThemeComp, outputThemeComp]);

  useEffect(() => {
    inputViewRef.current?.dispatch({
      effects: inputLangComp.reconfigure(getDialectExtension(language)),
    });
    outputViewRef.current?.dispatch({
      effects: outputLangComp.reconfigure(getDialectExtension(language)),
    });
  }, [language, inputLangComp, outputLangComp]);

  function getInputValue(): string {
    return inputViewRef.current?.state.doc.toString() ?? "";
  }

  function setOutputValue(text: string) {
    const v = outputViewRef.current;
    if (!v) return;
    v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: text } });
  }

  function handleFormat() {
    setError(null);
    const input = getInputValue();
    try {
      const result = formatSql(input, {
        language,
        tabWidth: indentSize,
        useTabs,
        keywordCase,
        functionCase,
        indentStyle: "standard",
        linesBetweenQueries: linesBetween,
      });
      setOutput(result);
      setOutputValue(result);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
    }
  }

  function handleCompress() {
    setError(null);
    const input = getInputValue();
    const result = compressSql(input);
    setOutput(result);
    setOutputValue(result);
  }

  function handleClear() {
    setError(null);
    setOutput("");
    const iv = inputViewRef.current;
    if (iv) iv.dispatch({ changes: { from: 0, to: iv.state.doc.length, insert: "" } });
    const ov = outputViewRef.current;
    if (ov) ov.dispatch({ changes: { from: 0, to: ov.state.doc.length, insert: "" } });
  }

  function handleSample() {
    setError(null);
    const iv = inputViewRef.current;
    if (iv) iv.dispatch({ changes: { from: 0, to: iv.state.doc.length, insert: SAMPLE_SQL } });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Dropdown
          trigger={
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border-default rounded-lg hover:border-accent-cyan transition-colors text-fg-primary">
              {DIALECTS.find((d) => d.value === language)?.label}
            </button>
          }
          items={DIALECTS.map((d) => ({
            label: d.label,
            onClick: () => setLanguage(d.value),
            active: d.value === language,
          }))}
        />
        <Dropdown
          trigger={
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border-default rounded-lg hover:border-accent-cyan transition-colors text-fg-primary">
              {t("indentSize")}: {indentSize}
            </button>
          }
          items={INDENT_SIZES.map((s) => ({
            label: String(s),
            onClick: () => setIndentSize(s),
            active: s === indentSize,
          }))}
        />
        <Dropdown
          trigger={
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border-default rounded-lg hover:border-accent-cyan transition-colors text-fg-primary">
              {t("keywordCase")}: {keywordCase}
            </button>
          }
          items={KEYWORD_CASES.map((c) => ({
            label: c,
            onClick: () => setKeywordCase(c),
            active: c === keywordCase,
          }))}
        />
        <Dropdown
          trigger={
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border-default rounded-lg hover:border-accent-cyan transition-colors text-fg-primary">
              {t("functionCase")}: {functionCase}
            </button>
          }
          items={FUNCTION_CASES.map((c) => ({
            label: c,
            onClick: () => setFunctionCase(c),
            active: c === functionCase,
          }))}
        />
        <Dropdown
          trigger={
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border-default rounded-lg hover:border-accent-cyan transition-colors text-fg-primary">
              {useTabs ? t("tabs") : t("spaces")}
            </button>
          }
          items={USE_TABS_OPTIONS.map((v) => ({
            label: v ? t("tabs") : t("spaces"),
            onClick: () => setUseTabs(v),
            active: v === useTabs,
          }))}
        />
        <Dropdown
          trigger={
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border-default rounded-lg hover:border-accent-cyan transition-colors text-fg-primary">
              {t("linesBetweenQueries")}: {linesBetween}
            </button>
          }
          items={LINES_BETWEEN.map((n) => ({
            label: String(n),
            onClick: () => setLinesBetween(n),
            active: n === linesBetween,
          }))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-1.5 text-sm font-medium text-fg-secondary">{t("input")}</label>
          <div
            className="border border-border-default rounded-lg overflow-hidden"
            style={{ height: 400 }}
          >
            <div ref={inputHostRef} className="h-full" />
          </div>
        </div>
        <div className="flex flex-col">
          <label className="mb-1.5 text-sm font-medium text-fg-secondary">{t("output")}</label>
          <div
            className="border border-border-default rounded-lg overflow-hidden"
            style={{ height: 400 }}
          >
            <div ref={outputHostRef} className="h-full" />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-danger bg-red-500/10 p-3 text-sm text-danger">
          {t("formatError")}: {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleFormat} variant="primary" size="sm">
          <IndentIncrease size={14} />
          {t("format")}
        </Button>
        <Button onClick={handleCompress} variant="outline-cyan" size="sm">
          <Minimize2 size={14} />
          {t("compress")}
        </Button>
        <CopyButton getContent={() => output} alwaysShow label={tc("copy")} />
        <Button onClick={handleClear} variant="outline" size="sm">
          <Trash2 size={14} />
          {t("clear")}
        </Button>
        <Button onClick={handleSample} variant="outline-purple" size="sm">
          <FileCode size={14} />
          {t("sample")}
        </Button>
      </div>
    </div>
  );
}

export default function SqlFormatPage() {
  const t = useTranslations("tools");
  const title = t("sqlformat.shortTitle");

  return (
    <Layout title={title} categoryLabel={t("categories.text")} categorySlug="text-processing">
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner />
        <Conversion />
        <DescriptionSection namespace="sqlformat" />
        <RelatedTools currentTool="sqlformat" />
      </div>
    </Layout>
  );
}
