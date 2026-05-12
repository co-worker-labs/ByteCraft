import type { SqlLanguage } from "sql-formatter";

export type { SqlLanguage };

export interface DialectOption {
  value: SqlLanguage;
  label: string;
}

export const DIALECTS: DialectOption[] = [
  { value: "sql", label: "SQL" },
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mariadb", label: "MariaDB" },
  { value: "sqlite", label: "SQLite" },
  { value: "plsql", label: "PL/SQL" },
  { value: "transactsql", label: "TransactSQL" },
  { value: "bigquery", label: "BigQuery" },
  { value: "hive", label: "Hive" },
  { value: "db2", label: "DB2" },
  { value: "db2i", label: "DB2 for i" },
  { value: "n1ql", label: "N1QL" },
  { value: "redshift", label: "Redshift" },
  { value: "singlestoredb", label: "SingleStoreDB" },
  { value: "snowflake", label: "Snowflake" },
  { value: "spark", label: "Spark SQL" },
  { value: "trino", label: "Trino" },
  { value: "tidb", label: "TiDB" },
];

export const INDENT_SIZES = [2, 4, 8] as const;
export type IndentSize = (typeof INDENT_SIZES)[number];

export interface IndentOption {
  size: IndentSize;
  useTabs: boolean;
  i18nKey: string;
}

export const INDENT_OPTIONS: IndentOption[] = [
  { size: 2, useTabs: false, i18nKey: "indentSpaces2" },
  { size: 4, useTabs: false, i18nKey: "indentSpaces4" },
  { size: 8, useTabs: false, i18nKey: "indentSpaces8" },
  { size: 2, useTabs: true, i18nKey: "indentTab" },
];

export const KEYWORD_CASES = ["upper", "lower", "preserve"] as const;
export type KeywordCase = (typeof KEYWORD_CASES)[number];

export const FUNCTION_CASES = ["upper", "lower", "preserve"] as const;
export type FunctionCase = (typeof FUNCTION_CASES)[number];

export const LINES_BETWEEN = [0, 1, 2] as const;
export type LinesBetween = (typeof LINES_BETWEEN)[number];
