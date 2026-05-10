import { describe, it, expect } from "vitest";
import { tokenize, CONTEXT_WINDOW } from "../main";

describe("tokenize", () => {
  it("returns zero for empty string", () => {
    const result = tokenize("");
    expect(result.tokenCount).toBe(0);
    expect(result.charCount).toBe(0);
    expect(result.tokens).toEqual([]);
  });

  it("tokenizes simple English text", () => {
    const result = tokenize("hello world");
    expect(result.charCount).toBe(11);
    expect(result.tokenCount).toBe(result.tokens.length);
    expect(result.tokenCount).toBeGreaterThan(0);
    const reconstructed = result.tokens.map((t) => t.text).join("");
    expect(reconstructed).toBe("hello world");
  });

  it("preserves special characters in roundtrip", () => {
    const text = "hello\nworld\t!";
    const result = tokenize(text);
    expect(result.charCount).toBe(text.length);
    const reconstructed = result.tokens.map((t) => t.text).join("");
    expect(reconstructed).toBe(text);
  });

  it("handles unicode text", () => {
    const text = "你好世界";
    const result = tokenize(text);
    expect(result.charCount).toBe(4);
    expect(result.tokenCount).toBeGreaterThan(0);
    const reconstructed = result.tokens.map((t) => t.text).join("");
    expect(reconstructed).toBe(text);
  });

  it("each token has valid id and text", () => {
    const result = tokenize("test");
    for (const token of result.tokens) {
      expect(typeof token.id).toBe("number");
      expect(typeof token.text).toBe("string");
      expect(token.text.length).toBeGreaterThan(0);
    }
  });

  it("CONTEXT_WINDOW is 128000", () => {
    expect(CONTEXT_WINDOW).toBe(128_000);
  });
});
