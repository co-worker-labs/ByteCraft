import { describe, it, expect } from "vitest";
import { renderLinkedText } from "../linked-text";
import { TOOL_PATHS } from "../../libs/tools";
import React from "react";

describe("renderLinkedText", () => {
  it("returns plain text when no links", () => {
    const result = renderLinkedText("Hello world", "en");
    expect(result).toEqual(["Hello world"]);
  });

  it("renders a valid tool path as a link element", () => {
    const result = renderLinkedText("Use the [CSV converter](/csv) to convert.", "en");
    expect(result).toHaveLength(3);
    expect(result[0]).toBe("Use the ");
    expect(result[2]).toBe(" to convert.");
    const link = result[1] as React.ReactElement<{ href: string; children: string }>;
    expect(link.type).toBe("a");
    expect(link.props.href).toBe("/csv");
    expect(link.props.children).toBe("CSV converter");
  });

  it("adds locale prefix for non-en locale", () => {
    const result = renderLinkedText("Use the [CSV converter](/csv) now.", "zh-CN");
    const link = result[1] as React.ReactElement<{ href: string }>;
    expect(link.props.href).toBe("/zh-CN/csv");
  });

  it("leaves invalid paths as plain text", () => {
    const result = renderLinkedText("Use the [broken](/nonexistent) link.", "en");
    expect(result).toHaveLength(1);
    expect(result[0]).toBe("Use the [broken](/nonexistent) link.");
  });

  it("handles multiple links", () => {
    const result = renderLinkedText("Use [JSON](/json) and [CSV](/csv) tools.", "en");
    const links = result.filter((r) => React.isValidElement(r));
    expect(links).toHaveLength(2);
  });

  it("handles adjacent links with no text between", () => {
    const result = renderLinkedText("[JSON](/json)[CSV](/csv)", "en");
    const links = result.filter((r) => React.isValidElement(r));
    expect(links).toHaveLength(2);
    const emptyStrings = result.filter((r) => typeof r === "string" && r === "");
    expect(emptyStrings.length).toBeGreaterThanOrEqual(0);
  });
});
