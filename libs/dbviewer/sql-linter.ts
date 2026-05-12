import type { EditorView } from "@codemirror/view";
import type { Diagnostic } from "@codemirror/lint";
import type { SqlLanguage } from "../sqlformat/dialects";

const DB_MAP: Partial<Record<SqlLanguage, string>> = {
  sql: "MySQL",
  mysql: "MySQL",
  postgresql: "PostgreSQL",
  transactsql: "TransactSQL",
  sqlite: "SQLite",
  bigquery: "BigQuery",
  snowflake: "Snowflake",
  mariadb: "MariaDB",
};

function resolveDb(lang: SqlLanguage): string {
  return DB_MAP[lang] ?? "MySQL";
}

function formatMessage(msg: string): string {
  const m = msg.match(/but\s+"([^"]*)"\s+found/);
  if (m) return `Unexpected token: ${m[1]}`;
  return "Syntax error";
}

export function createSqlLintSource(lang: SqlLanguage) {
  return async function sqlLint(view: EditorView): Promise<Diagnostic[]> {
    const doc = view.state.doc;
    const input = doc.toString();
    if (!input.trim()) return [];

    let Parser: any;
    try {
      Parser = (await import("node-sql-parser")).Parser;
    } catch {
      return [];
    }

    const diagnostics: Diagnostic[] = [];
    const sqls = input.split(";").filter((s) => s.trim());
    let offset = 0;

    for (const part of sqls) {
      const stmt = part.trimStart();
      const leading = part.indexOf(stmt);
      const stmtOffset = offset + leading;

      try {
        const parser = new Parser();
        parser.astify(stmt, { database: resolveDb(lang) as any });
      } catch (e: any) {
        const loc = e.location?.start;
        const from = loc ? Math.min(stmtOffset + loc.offset - 1, doc.length) : stmtOffset;
        const to = Math.min(from + 1, doc.length);
        diagnostics.push({
          from,
          to,
          severity: "error",
          message: formatMessage(e.message),
        });
      }

      offset += part.length + 1;
    }

    return diagnostics;
  };
}
