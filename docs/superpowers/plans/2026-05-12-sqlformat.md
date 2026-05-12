# SQL Formatter Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a browser-based SQL formatting and compression tool at `/sqlformat` supporting 18 SQL dialects with dual CodeMirror editors.

**Architecture:** Two-layer design — business logic in `libs/sqlformat/` (format via `sql-formatter`, compress hand-written) and UI in `app/[locale]/sqlformat/`. Dual CodeMirror editors for input/output, config bar with 6 dropdowns, manual format/compress buttons.

**Tech Stack:** sql-formatter ^15.4.10, @codemirror/lang-sql ^6.10.0, CodeMirror 6 (EditorView/EditorState/Compartment), next-intl, Tailwind CSS 4

---

## File Structure

| Action | File                                          | Responsibility                                            |
| ------ | --------------------------------------------- | --------------------------------------------------------- |
| Create | `libs/sqlformat/main.ts`                      | `formatSql()`, `compressSql()`                            |
| Create | `libs/sqlformat/dialects.ts`                  | Dialect list, option lists for config bar                 |
| Create | `libs/sqlformat/__tests__/main.test.ts`       | Tests for format/compress/edge cases                      |
| Create | `app/[locale]/sqlformat/page.tsx`             | Server route — SEO metadata, JSON-LD                      |
| Create | `app/[locale]/sqlformat/sqlformat-page.tsx`   | Client UI — dual editors, config bar, actions             |
| Modify | `libs/tools.ts`                               | Add `sqlformat` to TOOLS, TOOL_CATEGORIES, TOOL_RELATIONS |
| Modify | `vitest.config.ts`                            | Add `libs/sqlformat/**/*.test.ts` to include              |
| Create | `public/locales/en/sqlformat.json`            | English tool UI strings + descriptions                    |
| Create | `public/locales/zh-CN/sqlformat.json`         | Simplified Chinese                                        |
| Create | `public/locales/zh-TW/sqlformat.json`         | Traditional Chinese                                       |
| Create | `public/locales/ja/sqlformat.json`            | Japanese                                                  |
| Create | `public/locales/ko/sqlformat.json`            | Korean                                                    |
| Create | `public/locales/es/sqlformat.json`            | Spanish                                                   |
| Create | `public/locales/pt-BR/sqlformat.json`         | Portuguese (Brazil)                                       |
| Create | `public/locales/fr/sqlformat.json`            | French                                                    |
| Create | `public/locales/de/sqlformat.json`            | German                                                    |
| Create | `public/locales/ru/sqlformat.json`            | Russian                                                   |
| Modify | `public/locales/en/tools.json`                | Add `sqlformat` entry                                     |
| Modify | `public/locales/{9 other locales}/tools.json` | Add `sqlformat` entry with searchTerms                    |

---

### Task 1: Core Logic — `libs/sqlformat/dialects.ts`

**Files:**

- Create: `libs/sqlformat/dialects.ts`

- [ ] **Step 1: Create dialect definitions**

```ts
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

export const KEYWORD_CASES = ["upper", "lower", "preserve"] as const;
export type KeywordCase = (typeof KEYWORD_CASES)[number];

export const FUNCTION_CASES = ["upper", "lower", "preserve"] as const;
export type FunctionCase = (typeof FUNCTION_CASES)[number];

export const USE_TABS_OPTIONS = [false, true] as const;

export const LINES_BETWEEN = [0, 1, 2] as const;
export type LinesBetween = (typeof LINES_BETWEEN)[number];
```

- [ ] **Step 2: Commit**

```bash
git add libs/sqlformat/dialects.ts
git commit -m "feat(sqlformat): add dialect definitions and option types"
```

---

### Task 2: Core Logic — `libs/sqlformat/main.ts`

**Files:**

- Create: `libs/sqlformat/main.ts`

- [ ] **Step 1: Write the implementation**

```ts
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
      out += " ";
      continue;
    }
    if (ch === "/" && input[i + 1] === "*") {
      const end = input.indexOf("*/", i + 2);
      i = end === -1 ? n : end + 2;
      out += " ";
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
```

- [ ] **Step 2: Commit**

```bash
git add libs/sqlformat/main.ts
git commit -m "feat(sqlformat): add formatSql and compressSql functions"
```

---

### Task 3: Tests — `libs/sqlformat/__tests__/main.test.ts`

**Files:**

- Create: `libs/sqlformat/__tests__/main.test.ts`
- Modify: `vitest.config.ts:5-30`

- [ ] **Step 1: Write tests**

```ts
import { describe, it, expect } from "vitest";
import { formatSql, compressSql } from "../main";
import type { FormatOptions } from "../main";

const defaultOptions: FormatOptions = {
  language: "sql",
  tabWidth: 2,
  useTabs: false,
  keywordCase: "upper",
  functionCase: "upper",
  indentStyle: "standard",
  linesBetweenQueries: 1,
};

describe("formatSql", () => {
  it("formats a basic SELECT statement", () => {
    const result = formatSql("SELECT id, name FROM users WHERE active = 1;", defaultOptions);
    expect(result).toContain("SELECT");
    expect(result).toContain("FROM");
    expect(result).toContain("WHERE");
    expect(result).not.toBe("SELECT id, name FROM users WHERE active = 1;");
  });

  it("returns empty string for empty input", () => {
    expect(formatSql("", defaultOptions)).toBe("");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(formatSql("   \n\t  ", defaultOptions)).toBe("");
  });

  it("respects keywordCase lower", () => {
    const opts = { ...defaultOptions, keywordCase: "lower" as const };
    const result = formatSql("SELECT id FROM users", opts);
    expect(result).toContain("select");
    expect(result).toContain("from");
  });

  it("respects keywordCase preserve", () => {
    const opts = { ...defaultOptions, keywordCase: "preserve" as const };
    const result = formatSql("SeLeCt id FrOm users", opts);
    expect(result).toContain("SeLeCt");
    expect(result).toContain("FrOm");
  });

  it("respects tabWidth 4", () => {
    const opts = { ...defaultOptions, tabWidth: 4 };
    const result = formatSql("SELECT id FROM users", opts);
    expect(result).toContain("    ");
  });

  it("respects useTabs true", () => {
    const opts = { ...defaultOptions, useTabs: true };
    const result = formatSql("SELECT id FROM users", opts);
    expect(result).toContain("\t");
  });

  it("formats MySQL dialect", () => {
    const opts = { ...defaultOptions, language: "mysql" as const };
    const result = formatSql("SELECT id FROM users LIMIT 10", opts);
    expect(result).toContain("SELECT");
    expect(result).toContain("LIMIT");
  });

  it("formats PostgreSQL dialect", () => {
    const opts = { ...defaultOptions, language: "postgresql" as const };
    const result = formatSql("SELECT id FROM users", opts);
    expect(result).toContain("SELECT");
  });

  it("separates multiple queries with linesBetweenQueries", () => {
    const opts = { ...defaultOptions, linesBetweenQueries: 2 };
    const result = formatSql("SELECT 1; SELECT 2;", opts);
    const firstSelect = result.indexOf("SELECT", 0);
    const secondSelect = result.indexOf("SELECT", firstSelect + 1);
    const between = result.slice(firstSelect, secondSelect);
    const newlines = between.match(/\n/g);
    expect(newlines ? newlines.length : 0).toBeGreaterThanOrEqual(3);
  });
});

describe("compressSql", () => {
  it("compresses a formatted SELECT statement", () => {
    const formatted = "SELECT\n  id,\n  name\nFROM\n  users\nWHERE\n  active = 1;";
    const result = compressSql(formatted);
    expect(result).toBe("SELECT id, name FROM users WHERE active = 1;");
  });

  it("removes single-line comments", () => {
    const result = compressSql("SELECT id -- user id\nFROM users");
    expect(result).toBe("SELECT id FROM users");
  });

  it("removes multi-line comments", () => {
    const result = compressSql("SELECT id /* comment */ FROM users");
    expect(result).toBe("SELECT id FROM users");
  });

  it("removes block comments spanning lines", () => {
    const result = compressSql("SELECT id /* line1\nline2 */ FROM users");
    expect(result).toBe("SELECT id FROM users");
  });

  it("preserves single-quoted string literals", () => {
    const result = compressSql("SELECT 'hello   world' FROM users");
    expect(result).toBe("SELECT 'hello   world' FROM users");
  });

  it("preserves double-quoted identifiers", () => {
    const result = compressSql('SELECT "column name" FROM users');
    expect(result).toBe('SELECT "column name" FROM users');
  });

  it("handles escaped single quotes", () => {
    const result = compressSql("SELECT 'it''s fine' FROM users");
    expect(result).toBe("SELECT 'it''s fine' FROM users");
  });

  it("collapses multiple spaces to one", () => {
    const result = compressSql("SELECT   id   FROM   users");
    expect(result).toBe("SELECT id FROM users");
  });

  it("collapses newlines and tabs to single space", () => {
    const result = compressSql("SELECT\tid\nFROM\t\tusers");
    expect(result).toBe("SELECT id FROM users");
  });

  it("returns empty string for empty input", () => {
    expect(compressSql("")).toBe("");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(compressSql("   \n\t  ")).toBe("");
  });

  it("trims leading and trailing whitespace", () => {
    const result = compressSql("  SELECT id FROM users  ");
    expect(result).toBe("SELECT id FROM users");
  });

  it("handles already-minified SQL", () => {
    const minified = "SELECT id FROM users WHERE active = 1;";
    expect(compressSql(minified)).toBe(minified);
  });
});
```

- [ ] **Step 2: Add test scope to vitest config**

Add this line to the `include` array in `vitest.config.ts` (after `"libs/__tests__/*.test.ts"`):

```ts
"libs/sqlformat/**/*.test.ts",
```

The full `include` array becomes:

```ts
include: [
  "libs/dbviewer/**/*.test.ts",
  "libs/unixtime/**/*.test.ts",
  "libs/cron/**/*.test.ts",
  "libs/qrcode/**/*.test.ts",
  "libs/textcase/**/*.test.ts",
  "libs/color/**/*.test.ts",
  "libs/regex/**/*.test.ts",
  "libs/csv/**/*.test.ts",
  "libs/numbase/**/*.test.ts",
  "libs/deduplines/**/*.test.ts",
  "libs/image/**/*.test.ts",
  "libs/extractor/**/*.test.ts",
  "libs/password/**/*.test.ts",
  "libs/wordcounter/**/*.test.ts",
  "libs/token-counter/**/*.test.ts",
  "libs/sshkey/**/*.test.ts",
  "libs/httpclient/**/*.test.ts",
  "libs/wallet/**/*.test.ts",
  "libs/cssunit/**/*.test.ts",
  "libs/jsonts/**/*.test.ts",
  "libs/subnet/**/*.test.ts",
  "libs/sqlformat/**/*.test.ts",
  "libs/__tests__/*.test.ts",
  "utils/__tests__/*.test.{ts,tsx}",
  "hooks/**/*.test.ts",
],
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `npm run test -- --run libs/sqlformat`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add libs/sqlformat/__tests__/main.test.ts vitest.config.ts
git commit -m "test(sqlformat): add formatSql and compressSql tests"
```

---

### Task 4: Tool Registration — `libs/tools.ts`

**Files:**

- Modify: `libs/tools.ts:3` (import `FileCode`)
- Modify: `libs/tools.ts:75-89` (TOOL_CATEGORIES `text` array)
- Modify: `libs/tools.ts:118-157` (TOOL_RELATIONS)
- Modify: `libs/tools.ts:175-380` (TOOLS array)

- [ ] **Step 1: Verify `FileCode` is already imported**

The import at line 5 already exists:

```ts
import { FileCode } from "lucide-react";
```

No change needed for imports.

- [ ] **Step 2: Add `sqlformat` to TOOL_CATEGORIES `text` array**

In the `text` category tools array (line 78), insert `"sqlformat"` after `"json"`:

```ts
{
  key: "text",
  tools: [
    "json",
    "sqlformat",
    "regex",
    "diff",
    "markdown",
    "textcase",
    "extractor",
    "wordcounter",
    "tokencounter",
    "deduplines",
  ],
},
```

- [ ] **Step 3: Add `sqlformat` to TOOL_RELATIONS**

Add this entry to the `TOOL_RELATIONS` object (after the `json` key at line 119):

```ts
sqlformat: ["dbviewer", "json", "yaml"],
```

Also add `"sqlformat"` to the `dbviewer` relations array:

```ts
dbviewer: ["csv", "json", "yaml", "sqlformat"],
```

- [ ] **Step 4: Add `sqlformat` to TOOLS array**

Insert after the `json` entry (after line 182). The `sqlformat` entry:

```ts
{
  key: "sqlformat",
  path: "/sqlformat",
  icon: FileCode,
  emoji: "🗃️",
  sameAs: ["https://en.wikipedia.org/wiki/SQL"],
},
```

- [ ] **Step 5: Verify the build**

Run: `npm run build 2>&1 | head -20`
Expected: No errors related to tools.ts

- [ ] **Step 6: Commit**

```bash
git add libs/tools.ts
git commit -m "feat(sqlformat): register tool in TOOLS, TOOL_CATEGORIES, TOOL_RELATIONS"
```

---

### Task 5: English i18n — `public/locales/en/sqlformat.json` and `tools.json`

**Files:**

- Create: `public/locales/en/sqlformat.json`
- Modify: `public/locales/en/tools.json`

- [ ] **Step 1: Create `public/locales/en/sqlformat.json`**

```json
{
  "input": "SQL Input",
  "output": "SQL Output",
  "inputPlaceholder": "Enter or paste SQL here",
  "format": "Format",
  "compress": "Compress",
  "copy": "Copy",
  "clear": "Clear",
  "sample": "Sample",
  "language": "Dialect",
  "indentSize": "Indent Size",
  "keywordCase": "Keyword Case",
  "functionCase": "Function Case",
  "useTabs": "Use Tabs",
  "linesBetweenQueries": "Line Gap",
  "formatError": "Formatting failed",
  "spaces": "Spaces",
  "tabs": "Tabs",
  "descriptions": {
    "aeoDefinition": "SQL Formatter is a free online tool that formats and minifies SQL queries instantly in your browser. Supports MySQL, PostgreSQL, SQL Server, Oracle, SQLite, BigQuery, Snowflake and 18 dialects. No data is sent to any server.",
    "whatIsTitle": "What is SQL Formatting?",
    "whatIsP1": "SQL (Structured Query Language) is the standard language for interacting with relational databases. Whether you write queries for MySQL, PostgreSQL, SQL Server, Oracle, or cloud platforms like BigQuery and Snowflake, well-formatted SQL is dramatically easier to read, review, and debug. Pair it with the [DB Viewer](/dbviewer) to run formatted queries against SQLite databases.",
    "whatIsP2": "Formatting (pretty-printing) takes dense, hard-to-scan SQL and adds consistent indentation, line breaks, and keyword casing — so you can spot JOIN conditions, WHERE clauses, and subqueries at a glance. Compression (minification) does the reverse: it strips comments and collapses whitespace for the smallest possible SQL string.",
    "whatIsP3": "This tool runs entirely in your browser. No data is ever sent to any server.",
    "stepsTitle": "How to Format SQL",
    "step1Title": "Paste your SQL",
    "step1Text": "Paste or type SQL into the input editor. Select the correct dialect (MySQL, PostgreSQL, etc.) for syntax-aware formatting.",
    "step2Title": "Configure options",
    "step2Text": "Choose indent size, keyword casing (UPPER, lower, preserve), function casing, tabs vs spaces, and the number of blank lines between statements.",
    "step3Title": "Format or compress",
    "step3Text": "Click Format to beautify the SQL, or Compress to minify it. Copy the result with one click.",
    "faq1Q": "What SQL dialects are supported?",
    "faq1A": "This tool supports 18 SQL dialects including MySQL, PostgreSQL, SQL Server (TransactSQL), Oracle (PL/SQL), SQLite, MariaDB, BigQuery, Snowflake, Hive, DB2, Redshift, Spark SQL, Trino, TiDB, N1QL, SingleStoreDB, and standard SQL.",
    "faq2Q": "Does this tool validate SQL?",
    "faq2A": "The formatter performs syntax-aware formatting and may surface errors for severely malformed SQL. However, it is not a full SQL validator — valid formatting does not guarantee the SQL will execute correctly against your database.",
    "faq3Q": "How does SQL compression work?",
    "faq3A": "Compression removes single-line comments (--), block comments (/* */), and collapses all unnecessary whitespace while preserving string literals and quoted identifiers. The result is the smallest equivalent SQL string."
  }
}
```

- [ ] **Step 2: Add `sqlformat` entry to `public/locales/en/tools.json`**

Insert after the `"json"` entry (after line 82). English `tools.json` does NOT include `searchTerms`:

```json
"sqlformat": {
  "title": "SQL Formatter - Format & Minify SQL Online",
  "shortTitle": "SQL Formatter",
  "description": "Format and minify SQL queries with syntax highlighting. Supports MySQL, PostgreSQL, Oracle, SQL Server and more."
},
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/en/sqlformat.json public/locales/en/tools.json
git commit -m "feat(sqlformat): add English i18n strings"
```

---

### Task 6: CJK i18n — zh-CN, zh-TW, ja, ko

**Files:**

- Create: `public/locales/zh-CN/sqlformat.json`
- Create: `public/locales/zh-TW/sqlformat.json`
- Create: `public/locales/ja/sqlformat.json`
- Create: `public/locales/ko/sqlformat.json`
- Modify: `public/locales/zh-CN/tools.json`
- Modify: `public/locales/zh-TW/tools.json`
- Modify: `public/locales/ja/tools.json`
- Modify: `public/locales/ko/tools.json`

- [ ] **Step 1: Create `public/locales/zh-CN/sqlformat.json`**

```json
{
  "input": "SQL 输入",
  "output": "SQL 输出",
  "inputPlaceholder": "在此输入或粘贴 SQL",
  "format": "格式化",
  "compress": "压缩",
  "copy": "复制",
  "clear": "清空",
  "sample": "示例",
  "language": "方言",
  "indentSize": "缩进大小",
  "keywordCase": "关键字大小写",
  "functionCase": "函数名大小写",
  "useTabs": "使用制表符",
  "linesBetweenQueries": "语句间隔",
  "formatError": "格式化失败",
  "spaces": "空格",
  "tabs": "制表符",
  "descriptions": {
    "aeoDefinition": "SQL 格式化工具是一个免费的在线 SQL 处理器，可以在浏览器中即时格式化和压缩 SQL 查询。支持 MySQL、PostgreSQL、SQL Server、Oracle、SQLite、BigQuery、Snowflake 等 18 种方言。所有操作均在本地完成，不会上传任何数据。",
    "whatIsTitle": "什么是 SQL 格式化？",
    "whatIsP1": "SQL（结构化查询语言）是与关系型数据库交互的标准语言。无论你使用 MySQL、PostgreSQL、SQL Server、Oracle 还是 BigQuery、Snowflake 等云平台编写查询，格式良好的 SQL 能显著提高可读性，便于审查和调试。配合 [DB Viewer](/dbviewer) 可以对 SQLite 数据库运行格式化后的查询。",
    "whatIsP2": "格式化（美化打印）将密集的 SQL 添加一致的缩进、换行和关键字大小写，让你一眼就能看到 JOIN 条件、WHERE 子句和子查询。压缩（最小化）则相反：去除注释并折叠空白，生成最小的 SQL 字符串。",
    "whatIsP3": "此工具完全在浏览器中运行，不会将任何数据发送到服务器。",
    "stepsTitle": "如何格式化 SQL",
    "step1Title": "粘贴 SQL",
    "step1Text": "在输入编辑器中粘贴或输入 SQL，选择正确的方言（MySQL、PostgreSQL 等）以获得语法感知的格式化结果。",
    "step2Title": "配置选项",
    "step2Text": "选择缩进大小、关键字大小写（大写、小写、保留原样）、函数名大小写、使用空格或制表符、语句之间的空行数。",
    "step3Title": "格式化或压缩",
    "step3Text": "点击「格式化」美化 SQL，或点击「压缩」最小化 SQL。一键复制结果。",
    "faq1Q": "支持哪些 SQL 方言？",
    "faq1A": "支持 18 种 SQL 方言，包括 MySQL、PostgreSQL、SQL Server (TransactSQL)、Oracle (PL/SQL)、SQLite、MariaDB、BigQuery、Snowflake、Hive、DB2、Redshift、Spark SQL、Trino、TiDB、N1QL、SingleStoreDB 以及标准 SQL。",
    "faq2Q": "此工具会验证 SQL 吗？",
    "faq2A": "格式化器执行语法感知的格式化，对于严重错误的 SQL 可能会报错。但它不是完整的 SQL 验证器——格式化成功不代表 SQL 在数据库中一定能正确执行。",
    "faq3Q": "SQL 压缩是如何工作的？",
    "faq3A": "压缩会移除单行注释（--）、块注释（/* */）并折叠所有不必要的空白字符，同时保留字符串字面量和引号标识符。结果是最小的等效 SQL 字符串。"
  }
}
```

- [ ] **Step 2: Create `public/locales/zh-TW/sqlformat.json`**

```json
{
  "input": "SQL 輸入",
  "output": "SQL 輸出",
  "inputPlaceholder": "在此輸入或貼上 SQL",
  "format": "格式化",
  "compress": "壓縮",
  "copy": "複製",
  "clear": "清空",
  "sample": "範例",
  "language": "方言",
  "indentSize": "縮排大小",
  "keywordCase": "關鍵字大小寫",
  "functionCase": "函式名稱大小寫",
  "useTabs": "使用定位字元",
  "linesBetweenQueries": "陳述式間隔",
  "formatError": "格式化失敗",
  "spaces": "空格",
  "tabs": "定位字元",
  "descriptions": {
    "aeoDefinition": "SQL 格式化工具是一個免費的線上 SQL 處理器，可以在瀏覽器中即時格式化和壓縮 SQL 查詢。支援 MySQL、PostgreSQL、SQL Server、Oracle、SQLite、BigQuery、Snowflake 等 18 種方言。所有操作均在本地完成，不會上傳任何資料。",
    "whatIsTitle": "什麼是 SQL 格式化？",
    "whatIsP1": "SQL（結構化查詢語言）是與關聯式資料庫互動的標準語言。無論你使用 MySQL、PostgreSQL、SQL Server、Oracle 還是 BigQuery、Snowflake 等雲端平台撰寫查詢，格式良好的 SQL 能顯著提高可讀性，便於審查和除錯。搭配 [DB Viewer](/dbviewer) 可以對 SQLite 資料庫執行格式化後的查詢。",
    "whatIsP2": "格式化（美化列印）將密集的 SQL 加入一致的縮排、換行和關鍵字大小寫，讓你一眼就能看到 JOIN 條件、WHERE 子句和子查詢。壓縮（最小化）則相反：移除註解並摺疊空白，產生最小的 SQL 字串。",
    "whatIsP3": "此工具完全在瀏覽器中執行，不會將任何資料傳送到伺服器。",
    "stepsTitle": "如何格式化 SQL",
    "step1Title": "貼上 SQL",
    "step1Text": "在輸入編輯器中貼上或輸入 SQL，選擇正確的方言（MySQL、PostgreSQL 等）以獲得語法感知的格式化結果。",
    "step2Title": "設定選項",
    "step2Text": "選擇縮排大小、關鍵字大小寫（大寫、小寫、保留原樣）、函式名稱大小寫、使用空格或定位字元、陳述式之間的空行數。",
    "step3Title": "格式化或壓縮",
    "step3Text": "點擊「格式化」美化 SQL，或點擊「壓縮」最小化 SQL。一鍵複製結果。",
    "faq1Q": "支援哪些 SQL 方言？",
    "faq1A": "支援 18 種 SQL 方言，包括 MySQL、PostgreSQL、SQL Server (TransactSQL)、Oracle (PL/SQL)、SQLite、MariaDB、BigQuery、Snowflake、Hive、DB2、Redshift、Spark SQL、Trino、TiDB、N1QL、SingleStoreDB 以及標準 SQL。",
    "faq2Q": "此工具會驗證 SQL 嗎？",
    "faq2A": "格式化工具執行語法感知的格式化，對於嚴重錯誤的 SQL 可能會報錯。但它不是完整的 SQL 驗證器——格式化成功不代表 SQL 在資料庫中一定能正確執行。",
    "faq3Q": "SQL 壓縮是如何運作的？",
    "faq3A": "壓縮會移除單行註解（--）、區塊註解（/* */）並摺疊所有不必要的空白字元，同時保留字串字面值和引號識別項。結果是最小的等效 SQL 字串。"
  }
}
```

- [ ] **Step 3: Create `public/locales/ja/sqlformat.json`**

```json
{
  "input": "SQL 入力",
  "output": "SQL 出力",
  "inputPlaceholder": "ここに SQL を入力または貼り付け",
  "format": "フォーマット",
  "compress": "圧縮",
  "copy": "コピー",
  "clear": "クリア",
  "sample": "サンプル",
  "language": "ダイアレクト",
  "indentSize": "インデント幅",
  "keywordCase": "キーワードの大文字小文字",
  "functionCase": "関数名の大文字小文字",
  "useTabs": "タブを使用",
  "linesBetweenQueries": "クエリ間の改行",
  "formatError": "フォーマットに失敗しました",
  "spaces": "スペース",
  "tabs": "タブ",
  "descriptions": {
    "aeoDefinition": "SQL フォーマッターは、ブラウザ上で SQL クエリを瞬時にフォーマット・圧縮できる無料オンラインツールです。MySQL、PostgreSQL、SQL Server、Oracle、SQLite、BigQuery、Snowflake など 18 種類のダイアレクトに対応。データはサーバーに送信されません。",
    "whatIsTitle": "SQL フォーマットとは？",
    "whatIsP1": "SQL（Structured Query Language）はリレーショナルデータベースとやり取りするための標準言語です。MySQL、PostgreSQL、SQL Server、Oracle、BigQuery、Snowflake など、どのプラットフォームでも、整形された SQL は読みやすく、レビューやデバッグが容易になります。[DB Viewer](/dbviewer) と組み合わせて、フォーマットしたクエリを SQLite データベースで実行できます。",
    "whatIsP2": "フォーマット（整形）は、密集した SQL に一貫したインデント、改行、キーワードの大文字小文字を適用し、JOIN 条件、WHERE 句、サブクエリを一目で確認できるようにします。圧縮（最小化）はその逆で、コメントを削除し空白を詰めて、最小の SQL 文字列を生成します。",
    "whatIsP3": "このツールはブラウザ上で完全に動作します。データがサーバーに送信されることはありません。",
    "stepsTitle": "SQL のフォーマット方法",
    "step1Title": "SQL を貼り付け",
    "step1Text": "入力エディタに SQL を貼り付けるか入力します。構文に合わせたフォーマットのために、正しいダイアレクト（MySQL、PostgreSQL など）を選択してください。",
    "step2Title": "オプションを設定",
    "step2Text": "インデント幅、キーワードの大文字小文字（大文字、小文字、そのまま）、関数名の大文字小文字、スペースまたはタブ、クエリ間の空行数を選択します。",
    "step3Title": "フォーマットまたは圧縮",
    "step3Text": "「フォーマット」をクリックして SQL を整形するか、「圧縮」で最小化します。ワンクリックで結果をコピーできます。",
    "faq1Q": "どの SQL ダイアレクトに対応していますか？",
    "faq1A": "MySQL、PostgreSQL、SQL Server (TransactSQL)、Oracle (PL/SQL)、SQLite、MariaDB、BigQuery、Snowflake、Hive、DB2、Redshift、Spark SQL、Trino、TiDB、N1QL、SingleStoreDB、標準 SQL を含む 18 種類のダイアレクトに対応しています。",
    "faq2Q": "SQL のバリデーションは行いますか？",
    "faq2A": "フォーマッターは構文認識ベースのフォーマットを行い、著しく不正な SQL ではエラーを報告することがあります。ただし、完全な SQL バリデーターではないため、フォーマット成功がデータベースでの実行可能性を保証するものではありません。",
    "faq3Q": "SQL の圧縮はどのように機能しますか？",
    "faq3A": "圧縮は単行コメント（--）、ブロックコメント（/* */）を削除し、不要な空白をすべて詰めます。ただし、文字列リテラルと引用符付き識別子は保持されます。結果は最小の等価な SQL 文字列です。"
  }
}
```

- [ ] **Step 4: Create `public/locales/ko/sqlformat.json`**

```json
{
  "input": "SQL 입력",
  "output": "SQL 출력",
  "inputPlaceholder": "여기에 SQL을 입력하거나 붙여넣기",
  "format": "포맷",
  "compress": "압축",
  "copy": "복사",
  "clear": "지우기",
  "sample": "예제",
  "language": "방언",
  "indentSize": "들여쓰기 크기",
  "keywordCase": "키워드 대소문자",
  "functionCase": "함수명 대소문자",
  "useTabs": "탭 사용",
  "linesBetweenQueries": "쿼리 간 간격",
  "formatError": "포맷 실패",
  "spaces": "공백",
  "tabs": "탭",
  "descriptions": {
    "aeoDefinition": "SQL 포매터는 브라우저에서 SQL 쿼리를 즉시 포맷하고 압축할 수 있는 무료 온라인 도구입니다. MySQL, PostgreSQL, SQL Server, Oracle, SQLite, BigQuery, Snowflake 등 18개 방언을 지원합니다. 데이터는 서버로 전송되지 않습니다.",
    "whatIsTitle": "SQL 포맷팅이란?",
    "whatIsP1": "SQL(구조화된 쿼리 언어)는 관계형 데이터베이스와 상호작용하는 표준 언어입니다. MySQL, PostgreSQL, SQL Server, Oracle 또는 BigQuery, Snowflake 같은 클라우드 플랫폼에서 쿼리를 작성할 때, 잘 포맷된 SQL은 가독성을 크게 높여 코드 리뷰와 디버깅을 쉽게 만듭니다. [DB Viewer](/dbviewer)와 함께 사용하면 포맷된 쿼리를 SQLite 데이터베이스에서 실행할 수 있습니다.",
    "whatIsP2": "포맷팅(예쁘게 인쇄)은 조밀한 SQL에 일관된 들여쓰기, 줄바꿈, 키워드 대소문자를 적용하여 JOIN 조건, WHERE 절, 서브쿼리를 한눈에 파악할 수 있게 합니다. 압축(최소화)은 그 반대로, 주석을 제거하고 공백을 줄여 가장 작은 SQL 문자열을 생성합니다.",
    "whatIsP3": "이 도구는 브라우저에서 완전히 실행됩니다. 데이터가 서버로 전송되지 않습니다.",
    "stepsTitle": "SQL 포맷 방법",
    "step1Title": "SQL 붙여넣기",
    "step1Text": "입력 편집기에 SQL을 붙여넣거나 입력합니다. 구문 인식 포맷팅을 위해 올바른 방언(MySQL, PostgreSQL 등)을 선택하세요.",
    "step2Title": "옵션 설정",
    "step2Text": "들여쓰기 크기, 키워드 대소문자(대문자, 소문자, 그대로), 함수명 대소문자, 공백 또는 탭 사용, 쿼리 사이 빈 줄 수를 선택합니다.",
    "step3Title": "포맷 또는 압축",
    "step3Text": "「포맷」을 클릭하여 SQL을 정리하거나, 「압축」을 클릭하여 최소화합니다. 원클릭으로 결과를 복사할 수 있습니다.",
    "faq1Q": "어떤 SQL 방언을 지원하나요?",
    "faq1A": "MySQL, PostgreSQL, SQL Server (TransactSQL), Oracle (PL/SQL), SQLite, MariaDB, BigQuery, Snowflake, Hive, DB2, Redshift, Spark SQL, Trino, TiDB, N1QL, SingleStoreDB, 표준 SQL을 포함한 18개 방언을 지원합니다.",
    "faq2Q": "SQL 유효성 검사를 하나요?",
    "faq2A": "포매터는 구문 인식 기반 포맷팅을 수행하며, 심각하게 잘못된 SQL에 대해서는 오류를 표시할 수 있습니다. 단, 완전한 SQL 검증기는 아니므로 포맷 성공이 데이터베이스에서의 실행을 보장하지는 않습니다.",
    "faq3Q": "SQL 압축은 어떻게 작동하나요?",
    "faq3A": "압축은 단행 주석(--), 블록 주석(/* */)을 제거하고 불필요한 공백을 모두 줄입니다. 단, 문자열 리터럴과 따옴표로 묶인 식별자는 유지됩니다. 결과는 최소 크기의 동등한 SQL 문자열입니다."
  }
}
```

- [ ] **Step 5: Add `sqlformat` to CJK `tools.json` files**

For each of the 4 CJK locale `tools.json` files, add a `sqlformat` entry with `searchTerms`. Insert after the `"json"` entry.

**`public/locales/zh-CN/tools.json`** — add after the `"json"` entry:

```json
"sqlformat": {
  "title": "SQL 格式化工具 - 在线格式化和压缩 SQL",
  "shortTitle": "SQL 格式化",
  "description": "格式化和压缩 SQL 查询，支持语法高亮。支持 MySQL、PostgreSQL、Oracle、SQL Server 等多种方言。",
  "searchTerms": "sqlgeshihua sqlgsh yasuo geeshi"
},
```

**`public/locales/zh-TW/tools.json`** — add after the `"json"` entry:

```json
"sqlformat": {
  "title": "SQL 格式化工具 - 線上格式化和壓縮 SQL",
  "shortTitle": "SQL 格式化",
  "description": "格式化和壓縮 SQL 查詢，支援語法高亮。支援 MySQL、PostgreSQL、Oracle、SQL Server 等多種方言。",
  "searchTerms": "sqlgeshihua sqlgsh yasuo geeshi"
},
```

**`public/locales/ja/tools.json`** — add after the `"json"` entry:

```json
"sqlformat": {
  "title": "SQL フォーマッター - SQL のフォーマット・圧縮",
  "shortTitle": "SQL フォーマッター",
  "description": "SQL クエリのフォーマットと圧縮。シンタックスハイライト対応。MySQL、PostgreSQL、Oracle、SQL Server など多数のダイアレクトに対応。",
  "searchTerms": "sqlhyoukisei sqlhyk ysaaku kakouchi"
},
```

**`public/locales/ko/tools.json`** — add after the `"json"` entry:

```json
"sqlformat": {
  "title": "SQL 포매터 - SQL 포맷 및 압축",
  "shortTitle": "SQL 포매터",
  "description": "SQL 쿼리 포맷 및 압축 도구. 구문 강조 지원. MySQL, PostgreSQL, Oracle, SQL Server 등 다양한 방언 지원.",
  "searchTerms": "sqlhyeonshikwa sqlhsw yakhuk hyeonsik"
},
```

- [ ] **Step 6: Commit**

```bash
git add public/locales/zh-CN/ public/locales/zh-TW/ public/locales/ja/ public/locales/ko/
git commit -m "feat(sqlformat): add CJK i18n (zh-CN, zh-TW, ja, ko)"
```

---

### Task 7: Latin i18n — es, pt-BR, fr, de, ru

**Files:**

- Create: `public/locales/es/sqlformat.json`
- Create: `public/locales/pt-BR/sqlformat.json`
- Create: `public/locales/fr/sqlformat.json`
- Create: `public/locales/de/sqlformat.json`
- Create: `public/locales/ru/sqlformat.json`
- Modify: `public/locales/es/tools.json`
- Modify: `public/locales/pt-BR/tools.json`
- Modify: `public/locales/fr/tools.json`
- Modify: `public/locales/de/tools.json`
- Modify: `public/locales/ru/tools.json`

- [ ] **Step 1: Create `public/locales/es/sqlformat.json`**

```json
{
  "input": "Entrada SQL",
  "output": "Salida SQL",
  "inputPlaceholder": "Introduce o pega SQL aquí",
  "format": "Formatear",
  "compress": "Comprimir",
  "copy": "Copiar",
  "clear": "Limpiar",
  "sample": "Ejemplo",
  "language": "Dialecto",
  "indentSize": "Tamaño de sangría",
  "keywordCase": "Mayúsculas/minúsculas de palabras clave",
  "functionCase": "Mayúsculas/minúsculas de funciones",
  "useTabs": "Usar tabulaciones",
  "linesBetweenQueries": "Espacio entre consultas",
  "formatError": "Error al formatear",
  "spaces": "Espacios",
  "tabs": "Tabulaciones",
  "descriptions": {
    "aeoDefinition": "El formateador SQL es una herramienta online gratuita que formatea y comprime consultas SQL al instante en tu navegador. Compatible con MySQL, PostgreSQL, SQL Server, Oracle, SQLite, BigQuery, Snowflake y 18 dialectos. No se envían datos a ningún servidor.",
    "whatIsTitle": "¿Qué es el formateo SQL?",
    "whatIsP1": "SQL (Structured Query Language) es el lenguaje estándar para interactuar con bases de datos relacionales. Tanto si escribes consultas para MySQL, PostgreSQL, SQL Server, Oracle o plataformas en la nube como BigQuery y Snowflake, el SQL bien formateado es mucho más fácil de leer, revisar y depurar. Combínalo con [DB Viewer](/dbviewer) para ejecutar consultas formateadas en bases de datos SQLite.",
    "whatIsP2": "El formateo (impresión bonita) toma SQL denso y añade sangría consistente, saltos de línea y mayúsculas/minúsculas en palabras clave para que puedas identificar JOINs, cláusulas WHERE y subconsultas de un vistazo. La compresión (minificación) hace lo contrario: elimina comentarios y colapsa espacios en blanco para obtener la cadena SQL más pequeña posible.",
    "whatIsP3": "Esta herramienta se ejecuta completamente en tu navegador. Ningún dato se envía a ningún servidor.",
    "stepsTitle": "Cómo formatear SQL",
    "step1Title": "Pega tu SQL",
    "step1Text": "Pega o escribe SQL en el editor de entrada. Selecciona el dialecto correcto (MySQL, PostgreSQL, etc.) para un formateo con reconocimiento de sintaxis.",
    "step2Title": "Configura las opciones",
    "step2Text": "Elige el tamaño de sangría, mayúsculas/minúsculas de palabras clave (MAYÚSCULAS, minúsculas, conservar), de funciones, espacios o tabulaciones y el número de líneas en blanco entre sentencias.",
    "step3Title": "Formatea o comprime",
    "step3Text": "Haz clic en Formatear para embellecer el SQL o en Comprimir para minificarlo. Copia el resultado con un clic.",
    "faq1Q": "¿Qué dialectos SQL son compatibles?",
    "faq1A": "Esta herramienta es compatible con 18 dialectos SQL incluyendo MySQL, PostgreSQL, SQL Server (TransactSQL), Oracle (PL/SQL), SQLite, MariaDB, BigQuery, Snowflake, Hive, DB2, Redshift, Spark SQL, Trino, TiDB, N1QL, SingleStoreDB y SQL estándar.",
    "faq2Q": "¿Esta herramienta valida el SQL?",
    "faq2A": "El formateador realiza un formateo con reconocimiento de sintaxis y puede mostrar errores para SQL muy mal formado. Sin embargo, no es un validador SQL completo: un formateo exitoso no garantiza que el SQL se ejecute correctamente en tu base de datos.",
    "faq3Q": "¿Cómo funciona la compresión SQL?",
    "faq3A": "La compresión elimina comentarios de una sola línea (--), comentarios de bloque (/* */) y colapsa todos los espacios en blanco innecesarios, preservando literales de cadena e identificadores entre comillas. El resultado es la cadena SQL equivalente más pequeña."
  }
}
```

- [ ] **Step 2: Create `public/locales/pt-BR/sqlformat.json`**

```json
{
  "input": "Entrada SQL",
  "output": "Saída SQL",
  "inputPlaceholder": "Digite ou cole SQL aqui",
  "format": "Formatar",
  "compress": "Comprimir",
  "copy": "Copiar",
  "clear": "Limpar",
  "sample": "Exemplo",
  "language": "Dialeto",
  "indentSize": "Tamanho da indentação",
  "keywordCase": "Maiúsculas/minúsculas de palavras-chave",
  "functionCase": "Maiúsculas/minúsculas de funções",
  "useTabs": "Usar tabulações",
  "linesBetweenQueries": "Espaço entre consultas",
  "formatError": "Falha ao formatar",
  "spaces": "Espaços",
  "tabs": "Tabulações",
  "descriptions": {
    "aeoDefinition": "O Formatador SQL é uma ferramenta online gratuita que formata e comprime consultas SQL instantaneamente no seu navegador. Suporta MySQL, PostgreSQL, SQL Server, Oracle, SQLite, BigQuery, Snowflake e 18 dialetos. Nenhum dado é enviado a servidores.",
    "whatIsTitle": "O que é formatação SQL?",
    "whatIsP1": "SQL (Structured Query Language) é a linguagem padrão para interagir com bancos de dados relacionais. Seja escrevendo consultas para MySQL, PostgreSQL, SQL Server, Oracle ou plataformas em nuvem como BigQuery e Snowflake, SQL bem formatado é muito mais fácil de ler, revisar e depurar. Combine com o [DB Viewer](/dbviewer) para executar consultas formatadas em bancos de dados SQLite.",
    "whatIsP2": "A formatação (pretty-printing) pega SQL denso e adiciona indentação consistente, quebras de linha e maiúsculas/minúsculas em palavras-chave para que você possa identificar JOINs, cláusulas WHERE e subconsultas de relance. A compressão (minificação) faz o oposto: remove comentários e recolhe espaços em branco para a menor string SQL possível.",
    "whatIsP3": "Esta ferramenta roda inteiramente no seu navegador. Nenhum dado é enviado a nenhum servidor.",
    "stepsTitle": "Como formatar SQL",
    "step1Title": "Cole seu SQL",
    "step1Text": "Cole ou digite SQL no editor de entrada. Selecione o dialeto correto (MySQL, PostgreSQL, etc.) para formatação com reconhecimento de sintaxe.",
    "step2Title": "Configure as opções",
    "step2Text": "Escolha o tamanho da indentação, maiúsculas/minúsculas de palavras-chave (MAIÚSCULAS, minúsculas, preservar), de funções, espaços ou tabulações e o número de linhas em branco entre instruções.",
    "step3Title": "Formate ou comprima",
    "step3Text": "Clique em Formatar para embelezar o SQL ou em Comprimir para minificá-lo. Copie o resultado com um clique.",
    "faq1Q": "Quais dialetos SQL são suportados?",
    "faq1A": "Esta ferramenta suporta 18 dialetos SQL incluindo MySQL, PostgreSQL, SQL Server (TransactSQL), Oracle (PL/SQL), SQLite, MariaDB, BigQuery, Snowflake, Hive, DB2, Redshift, Spark SQL, Trino, TiDB, N1QL, SingleStoreDB e SQL padrão.",
    "faq2Q": "Esta ferramenta valida o SQL?",
    "faq2A": "O formatador realiza formatação com reconhecimento de sintaxe e pode reportar erros para SQL gravemente malformado. Porém, não é um validador SQL completo — formatação bem-sucedida não garante que o SQL será executado corretamente no banco de dados.",
    "faq3Q": "Como funciona a compressão SQL?",
    "faq3A": "A compressão remove comentários de linha única (--), comentários de bloco (/* */) e recolhe todos os espaços em branco desnecessários, preservando literais de string e identificadores entre aspas. O resultado é a menor string SQL equivalente."
  }
}
```

- [ ] **Step 3: Create `public/locales/fr/sqlformat.json`**

```json
{
  "input": "Entrée SQL",
  "output": "Sortie SQL",
  "inputPlaceholder": "Saisissez ou collez du SQL ici",
  "format": "Formater",
  "compress": "Compresser",
  "copy": "Copier",
  "clear": "Effacer",
  "sample": "Exemple",
  "language": "Dialecte",
  "indentSize": "Taille d'indentation",
  "keywordCase": "Casse des mots-clés",
  "functionCase": "Casse des fonctions",
  "useTabs": "Utiliser les tabulations",
  "linesBetweenQueries": "Espacement entre requêtes",
  "formatError": "Échec du formatage",
  "spaces": "Espaces",
  "tabs": "Tabulations",
  "descriptions": {
    "aeoDefinition": "Le formateur SQL est un outil en ligne gratuit qui formate et compresse les requêtes SQL instantanément dans votre navigateur. Prend en charge MySQL, PostgreSQL, SQL Server, Oracle, SQLite, BigQuery, Snowflake et 18 dialectes. Aucune donnée n'est envoyée à un serveur.",
    "whatIsTitle": "Qu'est-ce que le formatage SQL ?",
    "whatIsP1": "SQL (Structured Query Language) est le langage standard pour interagir avec les bases de données relationnelles. Que vous écriviez des requêtes pour MySQL, PostgreSQL, SQL Server, Oracle ou des plateformes cloud comme BigQuery et Snowflake, un SQL bien formaté est nettement plus facile à lire, réviser et déboguer. Combinez-le avec [DB Viewer](/dbviewer) pour exécuter des requêtes formatées sur des bases SQLite.",
    "whatIsP2": "Le formatage (pretty-printing) transforme un SQL dense en ajoutant une indentation cohérente, des sauts de ligne et une casse uniforme des mots-clés pour repérer d'un coup d'œil les JOIN, les clauses WHERE et les sous-requêtes. La compression (minification) fait l'inverse : elle supprime les commentaires et réduit les espaces pour obtenir la chaîne SQL la plus courte possible.",
    "whatIsP3": "Cet outil fonctionne entièrement dans votre navigateur. Aucune donnée n'est envoyée à un serveur.",
    "stepsTitle": "Comment formater du SQL",
    "step1Title": "Collez votre SQL",
    "step1Text": "Collez ou saisissez du SQL dans l'éditeur d'entrée. Sélectionnez le dialecte correct (MySQL, PostgreSQL, etc.) pour un formatage adapté à la syntaxe.",
    "step2Title": "Configurez les options",
    "step2Text": "Choisissez la taille d'indentation, la casse des mots-clés (MAJUSCULES, minuscules, conserver), la casse des fonctions, espaces ou tabulations, et le nombre de lignes vides entre les instructions.",
    "step3Title": "Formatez ou compressez",
    "step3Text": "Cliquez sur Formater pour embellir le SQL ou sur Compresser pour le minifier. Copiez le résultat en un clic.",
    "faq1Q": "Quels dialectes SQL sont pris en charge ?",
    "faq1A": "Cet outil prend en charge 18 dialectes SQL : MySQL, PostgreSQL, SQL Server (TransactSQL), Oracle (PL/SQL), SQLite, MariaDB, BigQuery, Snowflake, Hive, DB2, Redshift, Spark SQL, Trino, TiDB, N1QL, SingleStoreDB et SQL standard.",
    "faq2Q": "Cet outil valide-t-il le SQL ?",
    "faq2A": "Le formateur effectue un formatage sensible à la syntaxe et peut signaler des erreurs pour du SQL gravement malformé. Cependant, ce n'est pas un validateur SQL complet — un formatage réussi ne garantit pas que le SQL s'exécutera correctement sur votre base de données.",
    "faq3Q": "Comment fonctionne la compression SQL ?",
    "faq3A": "La compression supprime les commentaires sur une ligne (--), les commentaires de bloc (/* */) et réduit tous les espaces superflus tout en préservant les littéraux de chaîne et les identificateurs entre guillemets. Le résultat est la chaîne SQL équivalente la plus courte."
  }
}
```

- [ ] **Step 4: Create `public/locales/de/sqlformat.json`**

```json
{
  "input": "SQL-Eingabe",
  "output": "SQL-Ausgabe",
  "inputPlaceholder": "SQL hier eingeben oder einfügen",
  "format": "Formatieren",
  "compress": "Komprimieren",
  "copy": "Kopieren",
  "clear": "Leeren",
  "sample": "Beispiel",
  "language": "Dialekt",
  "indentSize": "Einrückungsgröße",
  "keywordCase": "Schlüsselwort-Groß-/Kleinschreibung",
  "functionCase": "Funktionsnamen-Groß-/Kleinschreibung",
  "useTabs": "Tabulatoren verwenden",
  "linesBetweenQueries": "Abstand zwischen Abfragen",
  "formatError": "Formatierung fehlgeschlagen",
  "spaces": "Leerzeichen",
  "tabs": "Tabulatoren",
  "descriptions": {
    "aeoDefinition": "Der SQL-Formatierer ist ein kostenloses Online-Tool, das SQL-Abfragen sofort in Ihrem Browser formatiert und komprimiert. Unterstützt MySQL, PostgreSQL, SQL Server, Oracle, SQLite, BigQuery, Snowflake und 18 Dialekte. Keine Daten werden an einen Server gesendet.",
    "whatIsTitle": "Was ist SQL-Formatierung?",
    "whatIsP1": "SQL (Structured Query Language) ist die Standardsprache für die Interaktion mit relationalen Datenbanken. Egal, ob Sie Abfragen für MySQL, PostgreSQL, SQL Server, Oracle oder Cloud-Plattformen wie BigQuery und Snowflake schreiben — gut formatiertes SQL ist deutlich leichter zu lesen, zu überprüfen und zu debuggen. Kombinieren Sie es mit dem [DB Viewer](/dbviewer), um formatierte Abfragen auf SQLite-Datenbanken auszuführen.",
    "whatIsP2": "Die Formatierung (Pretty-Printing) nimmt kompaktes SQL und fügt einheitliche Einrückungen, Zeilenumbrüche und Schlüsselwort-Groß-/Kleinschreibung hinzu, sodass Sie JOIN-Bedingungen, WHERE-Klauseln und Unterabfragen auf einen Blick erkennen. Die Komprimierung (Minifizierung) macht das Gegenteil: Sie entfernt Kommentare und reduziert Leerzeichen auf die kleinstmögliche SQL-Zeichenkette.",
    "whatIsP3": "Dieses Tool läuft vollständig in Ihrem Browser. Es werden keine Daten an einen Server gesendet.",
    "stepsTitle": "So formatieren Sie SQL",
    "step1Title": "SQL einfügen",
    "step1Text": "Fügen Sie SQL in den Eingabe-Editor ein oder geben Sie es ein. Wählen Sie den richtigen Dialekt (MySQL, PostgreSQL usw.) für eine syntaxbewusste Formatierung.",
    "step2Title": "Optionen konfigurieren",
    "step2Text": "Wählen Sie Einrückungsgröße, Schlüsselwort-Groß-/Kleinschreibung (GROSS, klein, beibehalten), Funktionsnamen-Groß-/Kleinschreibung, Leerzeichen oder Tabulatoren und die Anzahl der Leerzeilen zwischen Anweisungen.",
    "step3Title": "Formatieren oder komprimieren",
    "step3Text": "Klicken Sie auf Formatieren, um das SQL zu verschönern, oder auf Komprimieren, um es zu minifizieren. Kopieren Sie das Ergebnis mit einem Klick.",
    "faq1Q": "Welche SQL-Dialekte werden unterstützt?",
    "faq1A": "Dieses Tool unterstützt 18 SQL-Dialekte: MySQL, PostgreSQL, SQL Server (TransactSQL), Oracle (PL/SQL), SQLite, MariaDB, BigQuery, Snowflake, Hive, DB2, Redshift, Spark SQL, Trino, TiDB, N1QL, SingleStoreDB und Standard-SQL.",
    "faq2Q": "Validiert dieses Tool SQL?",
    "faq2A": "Der Formatierer führt eine syntaxbewusste Formatierung durch und kann bei stark fehlerhaftem SQL Fehler melden. Es ist jedoch kein vollständiger SQL-Validator — erfolgreiche Formatierung garantiert nicht, dass das SQL in Ihrer Datenbank korrekt ausgeführt wird.",
    "faq3Q": "Wie funktioniert die SQL-Komprimierung?",
    "faq3A": "Die Komprimierung entfernt einzeilige Kommentare (--), Blockkommentare (/* */) und reduziert alle überflüssigen Leerzeichen, wobei Zeichenfolgenliterale und Bezeichner in Anführungszeichen erhalten bleiben. Das Ergebnis ist die kürzeste äquivalente SQL-Zeichenkette."
  }
}
```

- [ ] **Step 5: Create `public/locales/ru/sqlformat.json`**

```json
{
  "input": "Ввод SQL",
  "output": "Вывод SQL",
  "inputPlaceholder": "Введите или вставьте SQL здесь",
  "format": "Форматировать",
  "compress": "Сжать",
  "copy": "Копировать",
  "clear": "Очистить",
  "sample": "Пример",
  "language": "Диалект",
  "indentSize": "Размер отступа",
  "keywordCase": "Регистр ключевых слов",
  "functionCase": "Регистр функций",
  "useTabs": "Использовать табуляцию",
  "linesBetweenQueries": "Интервал между запросами",
  "formatError": "Ошибка форматирования",
  "spaces": "Пробелы",
  "tabs": "Табуляция",
  "descriptions": {
    "aeoDefinition": "Форматер SQL — бесплатный онлайн-инструмент для мгновенного форматирования и сжатия SQL-запросов в браузере. Поддерживает MySQL, PostgreSQL, SQL Server, Oracle, SQLite, BigQuery, Snowflake и 18 диалектов. Данные не отправляются на сервер.",
    "whatIsTitle": "Что такое форматирование SQL?",
    "whatIsP1": "SQL (Structured Query Language) — стандартный язык для работы с реляционными базами данных. Независимо от того, пишете ли вы запросы для MySQL, PostgreSQL, SQL Server, Oracle или облачных платформ вроде BigQuery и Snowflake, хорошо отформатированный SQL значительно легче читать, проверять и отлаживать. Используйте вместе с [DB Viewer](/dbviewer) для выполнения отформатированных запросов к базам SQLite.",
    "whatIsP2": "Форматирование (pretty-printing) превращает плотный SQL в читаемый код с единообразными отступами, переносами строк и регистром ключевых слов. Сжатие (минификация) делает обратное: удаляет комментарии и схлопывает пробелы, создавая минимальную SQL-строку.",
    "whatIsP3": "Этот инструмент полностью работает в вашем браузере. Данные не отправляются ни на какой сервер.",
    "stepsTitle": "Как форматировать SQL",
    "step1Title": "Вставьте SQL",
    "step1Text": "Вставьте или введите SQL в редактор ввода. Выберите правильный диалект (MySQL, PostgreSQL и т.д.) для форматирования с учётом синтаксиса.",
    "step2Title": "Настройте параметры",
    "step2Text": "Выберите размер отступа, регистр ключевых слов (ВЕРХНИЙ, нижний, как есть), регистр функций, пробелы или табуляцию и количество пустых строк между операторами.",
    "step3Title": "Отформатируйте или сожмите",
    "step3Text": "Нажмите «Форматировать» для оформления SQL или «Сжать» для минификации. Скопируйте результат одним кликом.",
    "faq1Q": "Какие диалекты SQL поддерживаются?",
    "faq1A": "Инструмент поддерживает 18 диалектов SQL: MySQL, PostgreSQL, SQL Server (TransactSQL), Oracle (PL/SQL), SQLite, MariaDB, BigQuery, Snowflake, Hive, DB2, Redshift, Spark SQL, Trino, TiDB, N1QL, SingleStoreDB и стандартный SQL.",
    "faq2Q": "Инструмент проверяет правильность SQL?",
    "faq2A": "Форматер выполняет форматирование с учётом синтаксиса и может сообщать об ошибках для сильно искажённого SQL. Однако это не полноценный валидатор SQL — успешное форматирование не гарантирует, что SQL корректно выполнится в базе данных.",
    "faq3Q": "Как работает сжатие SQL?",
    "faq3A": "Сжатие удаляет однострочные комментарии (--), блочные комментарии (/* */) и схлопывает все лишние пробелы, сохраняя строковые литералы и идентификаторы в кавычках. Результат — минимальная эквивалентная SQL-строка."
  }
}
```

- [ ] **Step 6: Add `sqlformat` to Latin locale `tools.json` files**

For each locale, add after the `"json"` entry. These locales don't need `searchTerms` (or only optional ones).

**`public/locales/es/tools.json`**:

```json
"sqlformat": {
  "title": "Formateador SQL - Formatear y comprimir SQL online",
  "shortTitle": "Formateador SQL",
  "description": "Formatea y comprime consultas SQL con resaltado de sintaxis. Compatible con MySQL, PostgreSQL, Oracle, SQL Server y más."
},
```

**`public/locales/pt-BR/tools.json`**:

```json
"sqlformat": {
  "title": "Formatador SQL - Formatar e Comprimir SQL Online",
  "shortTitle": "Formatador SQL",
  "description": "Formate e comprima consultas SQL com destaque de sintaxe. Suporta MySQL, PostgreSQL, Oracle, SQL Server e mais."
},
```

**`public/locales/fr/tools.json`**:

```json
"sqlformat": {
  "title": "Formateur SQL - Formater et compresser du SQL en ligne",
  "shortTitle": "Formateur SQL",
  "description": "Formatez et compressez des requêtes SQL avec coloration syntaxique. Prend en charge MySQL, PostgreSQL, Oracle, SQL Server et plus."
},
```

**`public/locales/de/tools.json`**:

```json
"sqlformat": {
  "title": "SQL-Formatierer - SQL online formatieren und komprimieren",
  "shortTitle": "SQL-Formatierer",
  "description": "Formatieren und komprimieren Sie SQL-Abfragen mit Syntaxhervorhebung. Unterstützt MySQL, PostgreSQL, Oracle, SQL Server und mehr."
},
```

**`public/locales/ru/tools.json`**:

```json
"sqlformat": {
  "title": "Форматер SQL — форматирование и сжатие SQL онлайн",
  "shortTitle": "Форматер SQL",
  "description": "Форматируйте и сжимайте SQL-запросы с подсветкой синтаксиса. Поддержка MySQL, PostgreSQL, Oracle, SQL Server и других."
},
```

- [ ] **Step 7: Commit**

```bash
git add public/locales/es/ public/locales/pt-BR/ public/locales/fr/ public/locales/de/ public/locales/ru/
git commit -m "feat(sqlformat): add Latin locale i18n (es, pt-BR, fr, de, ru)"
```

---

### Task 8: Server Route — `app/[locale]/sqlformat/page.tsx`

**Files:**

- Create: `app/[locale]/sqlformat/page.tsx`

- [ ] **Step 1: Create the server component**

Follows the exact pattern from `app/[locale]/json/page.tsx`:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import ToolPage from "./sqlformat-page";

const PATH = "/sqlformat";
const TOOL_KEY = "sqlformat";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("sqlformat.title"),
    description: t("sqlformat.description"),
    ogImage: {
      title: t("sqlformat.shortTitle"),
      emoji: tool.emoji,
      desc: t("sqlformat.description"),
    },
  });
}

export default async function SqlFormatRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "sqlformat" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("sqlformat.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("sqlformat.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems: [1, 2, 3].map((i) => ({
      q: tx(`descriptions.faq${i}Q`),
      a: tx(`descriptions.faq${i}A`),
    })),
    howToSteps,
    sameAs: tool.sameAs,
  });

  return (
    <>
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
      <ToolPage />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\\[locale\\]/sqlformat/page.tsx
git commit -m "feat(sqlformat): add server route with SEO and JSON-LD"
```

---

### Task 9: Client UI — `app/[locale]/sqlformat/sqlformat-page.tsx`

**Files:**

- Create: `app/[locale]/sqlformat/sqlformat-page.tsx`

This is the largest task. The file creates dual CodeMirror editors (input + output), a config bar with 6 dropdowns, and action buttons.

- [ ] **Step 1: Create the client page component**

```tsx
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
import { sql, MySQL, PostgreSQL, SQLite, PLSQL, MsSQL } from "@codemirror/lang-sql";
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
  const dialectMap: Partial<Record<SqlLanguage, ReturnType<typeof MySQL>>> = {
    mysql: MySQL,
    postgresql: PostgreSQL,
    sqlite: SQLite,
    plsql: PLSQL,
    transactsql: MsSQL,
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
```

- [ ] **Step 2: Verify the build**

Run: `npm run build 2>&1 | tail -30`
Expected: Build succeeds with no errors related to sqlformat

- [ ] **Step 3: Commit**

```bash
git add app/\\[locale\\]/sqlformat/sqlformat-page.tsx
git commit -m "feat(sqlformat): add client UI with dual CodeMirror editors"
```

---

### Task 10: Update categories tool count

**Files:**

- Modify: `public/locales/en/categories.json` (text intro mentions "8 tools", now 9)

- [ ] **Step 1: Update text category intro and FAQ in `public/locales/en/categories.json`**

In the `"text"` object, update:

- `"intro"`: Change "A suite of 8 text processing tools" → "A suite of 9 text processing tools" and add "format SQL" to the description
- `"faq1A"`: Change "8 text processing tools" → "9 text processing tools" and add "SQL Formatter" to the list

The updated `"text"` section:

```json
"text": {
  "title": "Text Processing Tools - JSON, Regex, Diff & More | OmniKit",
  "shortTitle": "Text Processing",
  "description": "Free online text processing tools for developers. Format JSON, test regex, compare diffs, convert cases, and more. All tools run 100% in your browser.",
  "intro": "A suite of 9 text processing tools designed for developers who work with structured and unstructured text daily. Format and validate JSON, format and minify SQL, test regular expressions with real-time matching, compare text differences, write Markdown with live preview, convert text cases, extract emails and URLs, count words and characters, and remove duplicate lines — all without sending any data to a server.",
  "faq1Q": "What text processing tools does OmniKit offer?",
  "faq1A": "OmniKit provides 9 text processing tools: JSON Formatter (with JSON5 support), SQL Formatter, Regex Tester, Text Diff, Markdown Editor, Text Case Converter, Email & URL Extractor, Word Counter, and Deduplicate Lines.",
  "faq2Q": "Are these text processing tools free?",
  "faq2A": "Yes, all OmniKit text processing tools are completely free and run entirely in your browser. No data is sent to any server.",
  "faq3Q": "Can I use these tools with large files?",
  "faq3A": "Yes. Most tools handle files up to several MB. JSON Formatter, Diff, and Markdown Editor use Web Workers for smooth performance on large inputs."
}
```

- [ ] **Step 2: Commit**

```bash
git add public/locales/en/categories.json
git commit -m "feat(sqlformat): update text category tool count to 9"
```

---

### Task 11: Final Verification

- [ ] **Step 1: Run all tests**

Run: `npm run test -- --run`
Expected: All tests pass, including new sqlformat tests

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No lint errors

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`
Open: `http://localhost:3000/sqlformat`
Verify:

1. Page loads with dual editors
2. Click Sample → input fills with sample SQL
3. Click Format → output shows formatted SQL
4. Click Compress → output shows compressed SQL
5. Change dialect dropdown → editors re-render
6. Click Clear → both editors empty
7. Click Copy → output copied to clipboard
8. Error banner appears on invalid SQL format attempt
