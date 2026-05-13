import YAML from "yaml";
import { convert } from "../../csv/convert";
import { formatSql, compressSql } from "../../sqlformat/main";
import { jsonToTs } from "../../jsonts/main";
import type { RecipeStepDef } from "../types";

export const formatSteps: RecipeStepDef[] = [
  {
    id: "json-format",
    name: "JSON Format",
    category: "format",
    icon: "📐",
    description: "Format JSON with indentation",
    inputType: "text",
    outputType: "text",
    parameters: [
      {
        id: "indent",
        type: "text",
        label: "Indent",
        defaultValue: "2",
        placeholder: "Number of spaces",
      },
    ],
    async execute(input: string, params: Record<string, string>) {
      try {
        const indent = parseInt(params.indent || "2", 10) || 2;
        const parsed = JSON.parse(input);
        return { ok: true as const, output: JSON.stringify(parsed, null, indent) };
      } catch (e) {
        return { ok: false as const, error: e instanceof SyntaxError ? e.message : String(e) };
      }
    },
  },
  {
    id: "json-minify",
    name: "JSON Minify",
    category: "format",
    icon: "📦",
    description: "Minify JSON",
    inputType: "text",
    outputType: "text",
    parameters: [],
    async execute(input: string) {
      try {
        const parsed = JSON.parse(input);
        return { ok: true as const, output: JSON.stringify(parsed) };
      } catch (e) {
        return { ok: false as const, error: e instanceof SyntaxError ? e.message : String(e) };
      }
    },
  },
  {
    id: "json-yaml",
    name: "JSON to YAML",
    category: "format",
    icon: "📄",
    description: "Convert JSON to YAML",
    inputType: "text",
    outputType: "text",
    parameters: [],
    async execute(input: string) {
      try {
        const parsed = JSON.parse(input);
        return { ok: true as const, output: YAML.stringify(parsed) };
      } catch (e) {
        return { ok: false as const, error: e instanceof SyntaxError ? e.message : String(e) };
      }
    },
  },
  {
    id: "yaml-json",
    name: "YAML to JSON",
    category: "format",
    icon: "📄",
    description: "Convert YAML to JSON",
    inputType: "text",
    outputType: "text",
    parameters: [
      {
        id: "indent",
        type: "text",
        label: "Indent",
        defaultValue: "2",
        placeholder: "Number of spaces",
      },
    ],
    async execute(input: string, params: Record<string, string>) {
      try {
        const indent = parseInt(params.indent || "2", 10) || 2;
        const docs = YAML.parseAllDocuments(input);
        const data = docs.length === 1 ? docs[0].toJSON() : docs.map((d) => d.toJSON());
        return { ok: true as const, output: JSON.stringify(data, null, indent) };
      } catch (e) {
        return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
      }
    },
  },
  {
    id: "json-ts",
    name: "JSON to TypeScript",
    category: "format",
    icon: "🔷",
    description: "Convert JSON to TypeScript interfaces",
    inputType: "text",
    outputType: "text",
    parameters: [
      {
        id: "rootName",
        type: "text",
        label: "Root Name",
        defaultValue: "Root",
        placeholder: "Root interface name",
      },
    ],
    async execute(input: string, params: Record<string, string>) {
      const result = jsonToTs(input, {
        rootName: params.rootName || "Root",
        useTypeAlias: false,
        exportKeyword: false,
      });
      if (result.success && result.types) return { ok: true as const, output: result.types };
      return { ok: false as const, error: result.error ?? "Conversion failed" };
    },
  },
  {
    id: "json-csv",
    name: "JSON to CSV",
    category: "format",
    icon: "📊",
    description: "Convert JSON to CSV",
    inputType: "text",
    outputType: "text",
    parameters: [
      {
        id: "delimiter",
        type: "text",
        label: "Delimiter",
        defaultValue: ",",
        placeholder: "Column delimiter",
      },
    ],
    async execute(input: string, params: Record<string, string>) {
      const result = convert(input, "json", "csv", { delimiter: params.delimiter || "," });
      if (result.error) return { ok: false as const, error: result.error };
      return { ok: true as const, output: result.output };
    },
  },
  {
    id: "csv-json",
    name: "CSV to JSON",
    category: "format",
    icon: "📊",
    description: "Convert CSV to JSON",
    inputType: "text",
    outputType: "text",
    parameters: [
      {
        id: "delimiter",
        type: "text",
        label: "Delimiter",
        defaultValue: ",",
        placeholder: "Column delimiter",
      },
      {
        id: "indent",
        type: "text",
        label: "Indent",
        defaultValue: "2",
        placeholder: "Number of spaces",
      },
    ],
    async execute(input: string, params: Record<string, string>) {
      const indent = parseInt(params.indent || "2", 10) || 2;
      const result = convert(input, "csv", "json", {
        delimiter: params.delimiter || ",",
        indent,
      });
      if (result.error) return { ok: false as const, error: result.error };
      return { ok: true as const, output: result.output };
    },
  },
  {
    id: "sql-format",
    name: "SQL Format",
    category: "format",
    icon: "🗃️",
    description: "Format SQL query",
    inputType: "text",
    outputType: "text",
    parameters: [
      {
        id: "dialect",
        type: "select",
        label: "Dialect",
        defaultValue: "sql",
        options: [
          { label: "SQL", value: "sql" },
          { label: "MySQL", value: "mysql" },
          { label: "PostgreSQL", value: "postgresql" },
          { label: "MariaDB", value: "mariadb" },
          { label: "SQLite", value: "sqlite" },
          { label: "PL/SQL", value: "plsql" },
          { label: "TransactSQL", value: "transactsql" },
        ],
      },
    ],
    async execute(input: string, params: Record<string, string>) {
      try {
        const output = formatSql(input, {
          language: (params.dialect || "sql") as any,
          tabWidth: 2,
          useTabs: false,
          keywordCase: "upper",
          functionCase: "upper",
          indentStyle: "standard",
          linesBetweenQueries: 1,
        });
        return { ok: true as const, output };
      } catch (e) {
        return { ok: false as const, error: String(e) };
      }
    },
  },
  {
    id: "sql-minify",
    name: "SQL Minify",
    category: "format",
    icon: "🗃️",
    description: "Minify SQL query",
    inputType: "text",
    outputType: "text",
    parameters: [
      {
        id: "dialect",
        type: "select",
        label: "Dialect",
        defaultValue: "sql",
        options: [
          { label: "SQL", value: "sql" },
          { label: "MySQL", value: "mysql" },
          { label: "PostgreSQL", value: "postgresql" },
          { label: "MariaDB", value: "mariadb" },
          { label: "SQLite", value: "sqlite" },
          { label: "PL/SQL", value: "plsql" },
          { label: "TransactSQL", value: "transactsql" },
        ],
      },
    ],
    async execute(input: string) {
      try {
        const output = compressSql(input);
        return { ok: true as const, output };
      } catch (e) {
        return { ok: false as const, error: String(e) };
      }
    },
  },
];
