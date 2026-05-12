import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";

const sqlHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: "#06d6a0", fontWeight: "bold" },
  { tag: tags.definitionKeyword, color: "#06d6a0", fontWeight: "bold" },
  { tag: tags.controlKeyword, color: "#06d6a0" },
  { tag: tags.operatorKeyword, color: "#06d6a0" },
  { tag: tags.string, color: "#f59e0b" },
  { tag: tags.special(tags.string), color: "#f59e0b" },
  { tag: tags.character, color: "#f59e0b" },
  { tag: tags.number, color: "#8b5cf6" },
  { tag: tags.integer, color: "#8b5cf6" },
  { tag: tags.float, color: "#8b5cf6" },
  { tag: tags.bool, color: "#06d6a0" },
  { tag: tags.null, color: "#06d6a0" },
  { tag: tags.comment, color: "#64748b", fontStyle: "italic" },
  { tag: tags.lineComment, color: "#64748b", fontStyle: "italic" },
  { tag: tags.blockComment, color: "#64748b", fontStyle: "italic" },
  { tag: tags.operator, color: "#94a3b8" },
  { tag: tags.punctuation, color: "#94a3b8" },
  { tag: tags.bracket, color: "#94a3b8" },
  { tag: tags.paren, color: "#94a3b8" },
  { tag: tags.variableName, color: "#38bdf8" },
  { tag: tags.special(tags.variableName), color: "#38bdf8" },
  { tag: tags.typeName, color: "#f472b6" },
  { tag: tags.tagName, color: "#f472b6" },
  { tag: tags.attributeName, color: "#fbbf24" },
  { tag: tags.attributeValue, color: "#f59e0b" },
  { tag: tags.separator, color: "#94a3b8" },
  { tag: tags.meta, color: "#64748b" },
]);

const sqlHighlightExt = syntaxHighlighting(sqlHighlight);

export function commonTheme(dark: boolean): Extension {
  return [
    EditorView.theme(
      {
        "&": {
          backgroundColor: "var(--bg-input)",
          color: "var(--fg-primary)",
          height: "100%",
        },
        ".cm-content": {
          caretColor: "var(--accent-cyan)",
          fontFamily: "JetBrains Mono, ui-monospace, monospace",
          fontSize: "13px",
        },
        ".cm-cursor, .cm-dropCursor": {
          borderLeftColor: "var(--accent-cyan)",
        },
        "&.cm-focused .cm-selectionBackground, ::selection": {
          backgroundColor: "var(--accent-cyan-dim)",
        },
        ".cm-gutters": {
          backgroundColor: "var(--bg-input)",
          color: "var(--fg-muted)",
          border: "none",
          borderRight: "1px solid var(--border-default)",
        },
        ".cm-activeLineGutter": {
          backgroundColor: "transparent",
          color: "var(--fg-secondary)",
        },
        ".cm-activeLine": {
          backgroundColor: "color-mix(in oklab, var(--accent-cyan) 6%, transparent)",
        },
        ".cm-matchingBracket, .cm-nonmatchingBracket": {
          outline: "1px solid var(--accent-cyan)",
          backgroundColor: "transparent",
        },
        ".cm-tooltip": {
          backgroundColor: "var(--bg-elevated)",
          color: "var(--fg-primary)",
          border: "1px solid var(--border-default)",
          borderRadius: "8px",
        },
        ".cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]": {
          backgroundColor: "var(--accent-cyan-dim)",
          color: "var(--fg-primary)",
        },
        ".cm-panels": {
          backgroundColor: "var(--bg-elevated)",
          color: "var(--fg-primary)",
        },
        ".cm-diagnostic": {
          borderLeft: "3px solid var(--danger)",
          backgroundColor: "var(--bg-elevated)",
          color: "var(--fg-primary)",
          padding: "4px 8px",
          fontSize: "12px",
        },
        ".cm-diagnostic-error": {
          borderLeftColor: "var(--danger)",
        },
        ".cm-lintRange-error": {
          backgroundImage: `lch(56% 80 26)`,
        },
        ".cm-lintRange-warning": {
          backgroundImage: `lch(75% 80 80)`,
        },
        ".cm-tooltip-lint": {
          borderRadius: "6px",
          border: "1px solid var(--border-default)",
        },
      },
      { dark }
    ),
    sqlHighlightExt,
  ];
}

export const lightTheme: Extension = commonTheme(false);
export const darkTheme: Extension = commonTheme(true);
