# SQL Formatter Tool Design

## Overview

A browser-based SQL formatting and compression tool. Users paste or type SQL, select a dialect and formatting options, then format or compress the output. All processing runs entirely client-side.

- **Tool key**: `sqlformat`
- **Route**: `/sqlformat`
- **Category**: `text` (alongside JSON, Regex, Diff)
- **Icon**: `FileCode` (Lucide)
- **Emoji**: `🗃️`
- **sameAs**: `https://en.wikipedia.org/wiki/SQL`

## Architecture

### Dependencies

| Package                                                         | Version  | Purpose                 | Status                  |
| --------------------------------------------------------------- | -------- | ----------------------- | ----------------------- |
| `sql-formatter`                                                 | ^15.4.10 | Format SQL              | Already in package.json |
| `@codemirror/lang-sql`                                          | ^6.10.0  | SQL syntax highlighting | Already in package.json |
| `@codemirror/view`, `@codemirror/state`, `@codemirror/commands` | existing | CodeMirror editor       | Already in package.json |

No new dependencies. `sql-formatter` does not provide minify/compress — `compressSql()` is hand-written. No `node-sql-parser` — validation is not a standalone feature; errors surface only when format/compress operations fail (matching the JSON tool's pattern).

### File Structure

```
libs/sqlformat/
├── main.ts              # formatSql(), compressSql()
├── dialects.ts          # Dialect definitions and option lists
└── __tests__/main.test.ts

app/[locale]/sqlformat/
├── page.tsx             # Server route (SEO + JSON-LD)
└── sqlformat-page.tsx   # Client UI component

libs/dbviewer/codemirror-theme.ts  # Reused as-is (no changes)
```

### Two-Layer Design

| Layer           | File                     | Responsibility                                                        |
| --------------- | ------------------------ | --------------------------------------------------------------------- |
| Format/Compress | `libs/sqlformat/main.ts` | Calls `sql-formatter`, exposes `formatSql()` and `compressSql()`      |
| UI              | `sqlformat-page.tsx`     | Dual CodeMirror editors + config bar + action buttons + error display |

## Core Logic (`libs/sqlformat/main.ts`)

### `formatSql(input, options)`

Wraps `sql-formatter`'s `format()` with all configurable options passed through:

```ts
type FormatOptions = {
  language: SqlLanguage;
  tabWidth: number;
  useTabs: boolean;
  keywordCase: "upper" | "lower" | "preserve";
  functionCase: "upper" | "lower" | "preserve";
  indentStyle: "standard";
  linesBetweenQueries: number;
};
```

Returns formatted SQL string. Returns `""` for empty/whitespace-only input. Throws on unrecoverable formatting errors — the UI layer catches these and displays them in the Error Banner.

### `compressSql(input)`

Strips comments (`--` and `/* */`), collapses whitespace, preserves string literals (`'...'` and `"..."`). Hand-written (same logic as `libs/dbviewer/format.ts:compressSql()`, which is not dialect-specific despite its location). Returns `""` for empty/whitespace-only input. Does not throw — invalid SQL is passed through as-is.

### `dialects.ts`

Defines the list of supported SQL dialects and their display labels, matching `sql-formatter` v15's `SqlLanguage` type exactly:

| Value           | Display Label |
| --------------- | ------------- |
| `sql`           | SQL           |
| `mysql`         | MySQL         |
| `postgresql`    | PostgreSQL    |
| `mariadb`       | MariaDB       |
| `sqlite`        | SQLite        |
| `plsql`         | PL/SQL        |
| `transactsql`   | TransactSQL   |
| `bigquery`      | BigQuery      |
| `hive`          | Hive          |
| `db2`           | DB2           |
| `db2i`          | DB2 for i     |
| `n1ql`          | N1QL          |
| `redshift`      | Redshift      |
| `singlestoredb` | SingleStoreDB |
| `snowflake`     | Snowflake     |
| `spark`         | Spark SQL     |
| `trino`         | Trino         |
| `tidb`          | TiDB          |

## UI Layout (`sqlformat-page.tsx`)

### Page Structure (top to bottom)

```
┌─────────────────────────────────────────────────────────┐
│  Config Bar                                             │
│  [Dialect ▼] [Indent Size ▼] [Keyword Case ▼]          │
│  [Function Case ▼] [Use Tabs ▼] [Line Gap ▼]           │
├─────────────────────────┬───────────────────────────────┤
│  Input (CodeMirror)     │  Output (CodeMirror, readonly) │
│  Editable, SQL hl       │  Format/compress result        │
│  Line numbers, wrapping │  Line numbers, wrapping        │
│  Placeholder: "Enter.." │                                │
├─────────────────────────┴───────────────────────────────┤
│  Error Banner (visible only on format/compress failure) │
├─────────────────────────────────────────────────────────┤
│  [Format] [Compress] [Copy] [Clear] [Sample]            │
└─────────────────────────────────────────────────────────┘
```

### CodeMirror Editor Configuration

Both editors share the same configuration:

- **Extensions**: `@codemirror/lang-sql` (with selected dialect), `codemirror-theme.ts` (light/dark via CSS variables), line numbers (gutters), line wrapping
- **Input editor**: editable, placeholder text via i18n key `inputPlaceholder`
- **Output editor**: read-only, no placeholder
- **Height**: fixed `400px` with scroll (consistent with other dual-editor tools)
- **Theme**: reuses `libs/dbviewer/codemirror-theme.ts` as-is (light/dark variants using CSS variables)

### Config Bar Options

| Option              | Type     | Values                             | Default |
| ------------------- | -------- | ---------------------------------- | ------- |
| language            | Dropdown | All 18 dialects from `dialects.ts` | `sql`   |
| tabWidth            | Dropdown | 2, 4, 8                            | 2       |
| keywordCase         | Dropdown | upper, lower, preserve             | upper   |
| functionCase        | Dropdown | upper, lower, preserve             | upper   |
| useTabs             | Dropdown | spaces, tabs                       | spaces  |
| linesBetweenQueries | Dropdown | 0, 1, 2                            | 1       |

### Action Buttons

| Button   | Behavior                                                                    |
| -------- | --------------------------------------------------------------------------- |
| Format   | Calls `formatSql()`, writes result to output editor, shows error on failure |
| Compress | Calls `compressSql()`, writes result to output editor                       |
| Copy     | Copies output editor content to clipboard (disabled when output is empty)   |
| Clear    | Clears both input and output                                                |
| Sample   | Fills input with sample SQL statement                                       |

### Sample SQL

```sql
SELECT u.id, u.name, u.email, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
  AND u.status = 'active'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 5
ORDER BY order_count DESC
LIMIT 20;
```

### Interaction Model

- Format and Compress are manual actions (button click), not auto-triggered on input change
- Error Banner appears only when `formatSql()` throws — caught by the UI layer and displayed inline
- `compressSql()` does not throw; errors are silently passed through
- Clear resets both editors and hides any error banner

### Error Display

- Red banner below editors, visible only when formatting fails
- Shows the error message from `sql-formatter` (typically `"SyntaxError: ..."`)
- Auto-dismissed on next successful format/compress or clear

### Page Assembly (`sqlformat-page.tsx`)

Follows the standard tool page pattern:

```tsx
// Fixed four-layer structure inside <Layout>
<Layout title={t("sqlformat.shortTitle")} categoryLabel={...} categorySlug={...}>
  <div className="container mx-auto px-4 pt-3 pb-6">
    <PrivacyBanner />
    <Conversion />        {/* Config bar + dual editors + error banner + action buttons */}
    <DescriptionSection namespace="sqlformat" />
    <RelatedTools currentTool="sqlformat" />
  </div>
</Layout>
```

## Tool Registration (`libs/tools.ts`)

### TOOLS array

```ts
{
  key: "sqlformat",
  path: "/sqlformat",
  icon: FileCode,
  emoji: "🗃️",
  sameAs: ["https://en.wikipedia.org/wiki/SQL"],
}
```

### TOOL_CATEGORIES

Add `sqlformat` to the `text` category, after `json`:

```ts
{ key: "text", tools: ["json", "sqlformat", "regex", ...] }
```

### TOOL_RELATIONS

```ts
sqlformat: ["dbviewer", "json", "yaml"],
// Add "sqlformat" to dbviewer's relations array
```

## i18n

### `public/locales/en/tools.json`

```json
"sqlformat": {
  "title": "SQL Formatter - Format & Minify SQL Online",
  "shortTitle": "SQL Formatter",
  "description": "Format and minify SQL queries with syntax highlighting. Supports MySQL, PostgreSQL, Oracle, SQL Server and more."
}
```

### `public/locales/en/sqlformat.json`

Top-level keys:

- UI labels: `input`, `output`, `inputPlaceholder`, `format`, `compress`, `copy`, `clear`, `sample`
- Config labels: `language`, `indentSize`, `keywordCase`, `functionCase`, `useTabs`, `linesBetweenQueries`
- Error: `formatError`
- `descriptions` nested object: `aeoDefinition`, `whatIsTitle`, `whatIsP1`~`whatIsP3`, `stepsTitle`, `step1Title`/`step1Text` ~ `step3Title`/`step3Text`, `faq1Q`/`faq1A` ~ `faq3Q`/`faq3A`

### searchTerms (CJK locales only)

| Locale | searchTerms                             |
| ------ | --------------------------------------- |
| zh-CN  | `sqlgeshihua sqlgsh yasuo geeshi`       |
| zh-TW  | `sqlgeshihua sqlgsh yasuo geeshi`       |
| ja     | `sqlhyoukisei sqlhyk ysaaku kakouchi`   |
| ko     | `sqlhyeonshikwa sqlhsw yakhuk hyeonsik` |

### All 10 locales

en, zh-CN, zh-TW, ja, ko, es, pt-BR, fr, de, ru — full translations for both `tools.json` and `sqlformat.json`.

## Testing (`libs/sqlformat/__tests__/main.test.ts`)

| Scenario    | Coverage                                                          |
| ----------- | ----------------------------------------------------------------- |
| Formatting  | Standard SQL formatting, dialect-specific formatting              |
| Compression | Comment removal, whitespace collapse, string literal preservation |
| Edge cases  | Empty input returns "", whitespace-only returns "", long SQL      |

Add `"libs/sqlformat/**/*.test.ts"` to `vitest.config.ts` `include` array.

## `page.tsx` (Server Component)

Follows the standard pattern (same as dbviewer/diff/json):

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import ToolPage from "./sqlformat-page";

const PATH = "/sqlformat";
const TOOL_KEY = "sqlformat";

export async function generateMetadata({ params }) {
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

export default async function SqlFormatRoute({ params }) {
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

## SEO

- `page.tsx` uses `generatePageMeta()` for canonical URLs, OG, Twitter, and alternates across all 10 locales
- `buildToolSchemas()` generates WebApplication + FAQ + HowTo JSON-LD
- `app/sitemap.ts` automatically includes the new route (driven by TOOLS array)
