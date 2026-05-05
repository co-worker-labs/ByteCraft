import { describe, it, expect } from "vitest";
import { analyzeStrength } from "../strength";

describe("analyzeStrength", () => {
  it('gives score 0 for "password"', async () => {
    const result = await analyzeStrength("password");
    expect(result.score).toBe(0);
    expect(result.warningKey).not.toBeNull();
  });

  it('gives score 0 for "123456"', async () => {
    const result = await analyzeStrength("123456");
    expect(result.score).toBe(0);
  });

  it("gives score 4 for a strong passphrase", async () => {
    const result = await analyzeStrength("correcthorsebatterystaple");
    expect(result.score).toBe(4);
  });

  it("gives score 4 for a long random-looking password", async () => {
    const result = await analyzeStrength("Kx!9mPq$2vRzNw7&jL4c");
    expect(result.score).toBe(4);
  });

  it("returns crack time in seconds", async () => {
    const result = await analyzeStrength("password");
    expect(result.crackTimeSeconds).toBeGreaterThan(0);
    expect(typeof result.crackTimeUnit).toBe("string");
  });

  it("returns instant crack time for very weak passwords", async () => {
    const result = await analyzeStrength("a");
    expect(result.crackTimeUnit).toBe("instant");
  });

  it("returns centuries for strong passwords", async () => {
    const result = await analyzeStrength("correcthorsebatterystaple");
    expect(result.crackTimeUnit).toBe("centuries");
  });

  it("maps warning keys", async () => {
    const result = await analyzeStrength("password");
    expect(result.warningKey).toMatch(/^zxcvbnWarning/);
  });

  it("maps suggestion keys", async () => {
    const result = await analyzeStrength("abc");
    expect(result.suggestionKeys.length).toBeGreaterThan(0);
    result.suggestionKeys.forEach((key) => {
      expect(key).toMatch(/^zxcvbnSuggestion/);
    });
  });

  it("returns null warning for strong passwords", async () => {
    const result = await analyzeStrength("Kx!9mPq$2vRzNw7&jL4c");
    expect(result.warningKey).toBeNull();
  });

  it("returns empty suggestions for strong passwords", async () => {
    const result = await analyzeStrength("Kx!9mPq$2vRzNw7&jL4c");
    expect(result.suggestionKeys).toEqual([]);
  });

  it("caches the zxcvbn instance (second call works)", async () => {
    const r1 = await analyzeStrength("test");
    const r2 = await analyzeStrength("test");
    expect(r1.score).toBe(r2.score);
  });
});
