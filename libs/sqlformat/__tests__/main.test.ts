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
