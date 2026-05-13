import { describe, it, expect } from "vitest";
import { applyFilenameTemplate, mergeTextResults } from "../output";

describe("applyFilenameTemplate", () => {
  it("replaces {name} placeholder", () => {
    expect(applyFilenameTemplate("{name}_hashed", "photo.jpg")).toBe("photo.jpg_hashed");
  });

  it("replaces {base} placeholder (name without extension)", () => {
    expect(applyFilenameTemplate("{base}_hashed.txt", "photo.jpg")).toBe("photo_hashed.txt");
  });

  it("returns template as-is when no placeholders", () => {
    expect(applyFilenameTemplate("output.txt", "photo.jpg")).toBe("output.txt");
  });

  it("handles filename without extension for {base}", () => {
    expect(applyFilenameTemplate("{base}_out", "README")).toBe("README_out");
  });

  it("handles multiple extensions", () => {
    expect(applyFilenameTemplate("{base}_processed.txt", "archive.tar.gz")).toBe(
      "archive.tar_processed.txt"
    );
  });
});

describe("mergeTextResults", () => {
  it("joins outputs with newlines", () => {
    const results = [
      { id: "1", status: "success" as const, output: "hello", duration: 0 },
      { id: "2", status: "success" as const, output: "world", duration: 0 },
    ];
    expect(mergeTextResults(results)).toBe("hello\nworld");
  });

  it("skips error items", () => {
    const results = [
      { id: "1", status: "success" as const, output: "hello", duration: 0 },
      { id: "2", status: "error" as const, error: "fail", duration: 0 },
      { id: "3", status: "success" as const, output: "world", duration: 0 },
    ];
    expect(mergeTextResults(results)).toBe("hello\nworld");
  });

  it("returns empty string for no successful results", () => {
    const results = [{ id: "1", status: "error" as const, error: "fail", duration: 0 }];
    expect(mergeTextResults(results)).toBe("");
  });
});
