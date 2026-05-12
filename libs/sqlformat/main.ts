import { format as sqlFormat } from "sql-formatter";
import type { SqlLanguage } from "./dialects";

export interface FormatOptions {
  language: SqlLanguage;
  tabWidth: number;
  useTabs: boolean;
  keywordCase: "upper" | "lower" | "preserve";
  functionCase: "upper" | "lower" | "preserve";
  indentStyle: "standard";
  linesBetweenQueries: number;
}

export function formatSql(input: string, options: FormatOptions): string {
  if (!input.trim()) return "";
  return sqlFormat(input, {
    language: options.language,
    tabWidth: options.tabWidth,
    useTabs: options.useTabs,
    keywordCase: options.keywordCase,
    functionCase: options.functionCase,
    indentStyle: options.indentStyle,
    linesBetweenQueries: options.linesBetweenQueries,
  });
}

export function compressSql(input: string): string {
  if (!input.trim()) return "";
  let out = "";
  let i = 0;
  const n = input.length;
  while (i < n) {
    const ch = input[i];
    if (ch === "-" && input[i + 1] === "-") {
      const nl = input.indexOf("\n", i + 2);
      i = nl === -1 ? n : nl;
      if (out.length > 0 && out[out.length - 1] !== " ") out += " ";
      continue;
    }
    if (ch === "/" && input[i + 1] === "*") {
      const end = input.indexOf("*/", i + 2);
      i = end === -1 ? n : end + 2;
      if (out.length > 0 && out[out.length - 1] !== " ") out += " ";
      continue;
    }
    if (ch === "'") {
      let j = i + 1;
      while (j < n) {
        if (input[j] === "'" && input[j + 1] === "'") {
          j += 2;
          continue;
        }
        if (input[j] === "'") {
          j++;
          break;
        }
        j++;
      }
      out += input.slice(i, j);
      i = j;
      continue;
    }
    if (ch === '"') {
      let j = i + 1;
      while (j < n && input[j] !== '"') j++;
      if (input[j] === '"') j++;
      out += input.slice(i, j);
      i = j;
      continue;
    }
    if (ch === "\n" || ch === "\r" || ch === "\t" || ch === " ") {
      if (out.length > 0 && out[out.length - 1] !== " ") out += " ";
      i++;
      continue;
    }
    out += ch;
    i++;
  }
  return out.trim();
}
