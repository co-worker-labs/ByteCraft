import { describe, it, expect } from "vitest";
import { byteCapacity, checkCapacity } from "../capacity";

describe("byteCapacity", () => {
  it("returns the lookup table values", () => {
    expect(byteCapacity("L")).toBe(2953);
    expect(byteCapacity("M")).toBe(2331);
    expect(byteCapacity("Q")).toBe(1663);
    expect(byteCapacity("H")).toBe(1273);
  });
});

describe("checkCapacity", () => {
  it("returns ok for short content", () => {
    const r = checkCapacity("hello", "Q");
    expect(r.status).toBe("ok");
    expect(r.bytes).toBe(5);
    expect(r.limit).toBe(1663);
  });
  it("returns near when bytes > 90% of limit", () => {
    const limit = byteCapacity("Q");
    const near = "a".repeat(Math.ceil(limit * 0.91));
    expect(checkCapacity(near, "Q").status).toBe("near");
  });
  it("returns over when bytes > limit", () => {
    const limit = byteCapacity("Q");
    const over = "a".repeat(limit + 1);
    expect(checkCapacity(over, "Q").status).toBe("over");
  });
  it("counts UTF-8 bytes, not chars (中 = 3 bytes)", () => {
    const r = checkCapacity("中", "H");
    expect(r.bytes).toBe(3);
  });
});
