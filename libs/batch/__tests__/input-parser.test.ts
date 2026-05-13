import { describe, it, expect } from "vitest";
import { parseTextInput, parseFileInput } from "../input-parser";

describe("parseTextInput", () => {
  it("splits multi-line text into individual items", () => {
    const result = parseTextInput("hello\nworld\nfoo");
    expect(result).toHaveLength(3);
    expect(result[0].content).toBe("hello");
    expect(result[0].name).toBe("hello");
    expect(result[0].type).toBe("text");
    expect(result[0].size).toBe(5);
  });

  it("skips empty lines", () => {
    const result = parseTextInput("hello\n\n\nworld");
    expect(result).toHaveLength(2);
  });

  it("handles single line", () => {
    const result = parseTextInput("hello");
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe("hello");
  });

  it("handles empty string", () => {
    const result = parseTextInput("");
    expect(result).toHaveLength(0);
  });

  it("handles whitespace-only lines", () => {
    const result = parseTextInput("hello\n   \nworld");
    expect(result).toHaveLength(2);
  });

  it("trims whitespace from lines", () => {
    const result = parseTextInput("  hello  \n  world  ");
    expect(result[0].content).toBe("hello");
    expect(result[0].name).toBe("hello");
  });

  it("generates unique IDs", () => {
    const result = parseTextInput("a\nb\nc");
    const ids = result.map((r) => r.id);
    expect(new Set(ids).size).toBe(3);
  });

  it("truncates long names", () => {
    const longLine = "a".repeat(200);
    const result = parseTextInput(longLine);
    expect(result[0].name.length).toBeLessThanOrEqual(50);
  });

  it("computes byte size", () => {
    const result = parseTextInput("hello");
    expect(result[0].size).toBe(5);
  });

  it("computes byte size for multi-byte characters", () => {
    const result = parseTextInput("你好");
    expect(result[0].size).toBe(new TextEncoder().encode("你好").byteLength);
  });
});

describe("parseFileInput", () => {
  it("creates item from File with text type for text files", () => {
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    const result = parseFileInput(file, "read-result");
    expect(result.name).toBe("test.txt");
    expect(result.content).toBe("read-result");
    expect(result.type).toBe("text");
    expect(result.size).toBe(7);
  });

  it("creates item with image type for image files", () => {
    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    const result = parseFileInput(file, "data:image/jpeg;base64,abc");
    expect(result.type).toBe("image");
    expect(result.name).toBe("photo.jpg");
  });

  it("treats unknown MIME types as text", () => {
    const file = new File(["data"], "file.xyz", { type: "application/octet-stream" });
    const result = parseFileInput(file, "content");
    expect(result.type).toBe("text");
  });
});
