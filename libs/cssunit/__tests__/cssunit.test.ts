import { describe, it, expect } from "vitest";
import {
  convert,
  convertCssCode,
  CSS_UNITS,
  VIEWPORT_PRESETS,
  PX_REFERENCE_VALUES,
  BATCH_DIRECTIONS,
  type CSSUnit,
} from "../main";

const defaultConfig = {
  rootFontSize: 16,
  parentFontSize: 16,
  viewportW: 1920,
  viewportH: 1080,
  precision: 4,
};

describe("convert", () => {
  it("converts px to rem", () => {
    expect(convert(16, "px", "rem", defaultConfig)).toBe(1);
    expect(convert(32, "px", "rem", defaultConfig)).toBe(2);
    expect(convert(8, "px", "rem", defaultConfig)).toBe(0.5);
  });

  it("converts rem to px", () => {
    expect(convert(1, "rem", "px", defaultConfig)).toBe(16);
    expect(convert(2, "rem", "px", defaultConfig)).toBe(32);
    expect(convert(0.5, "rem", "px", defaultConfig)).toBe(8);
  });

  it("converts px to em", () => {
    expect(convert(16, "px", "em", defaultConfig)).toBe(1);
    expect(convert(24, "px", "em", { ...defaultConfig, parentFontSize: 12 })).toBe(2);
  });

  it("converts em to px", () => {
    expect(convert(1, "em", "px", defaultConfig)).toBe(16);
    expect(convert(2, "em", "px", { ...defaultConfig, parentFontSize: 12 })).toBe(24);
  });

  it("converts px to vw", () => {
    expect(convert(1920, "px", "vw", defaultConfig)).toBe(100);
    expect(convert(960, "px", "vw", defaultConfig)).toBe(50);
  });

  it("converts vw to px", () => {
    expect(convert(100, "vw", "px", defaultConfig)).toBe(1920);
    expect(convert(50, "vw", "px", defaultConfig)).toBe(960);
  });

  it("converts px to vh", () => {
    expect(convert(1080, "px", "vh", defaultConfig)).toBe(100);
    expect(convert(540, "px", "vh", defaultConfig)).toBe(50);
  });

  it("converts vh to px", () => {
    expect(convert(100, "vh", "px", defaultConfig)).toBe(1080);
  });

  it("converts px to vmin", () => {
    expect(convert(1080, "px", "vmin", defaultConfig)).toBe(100);
    expect(convert(540, "px", "vmin", defaultConfig)).toBe(50);
  });

  it("converts vmin to px", () => {
    expect(convert(100, "vmin", "px", defaultConfig)).toBe(1080);
  });

  it("converts px to vmax", () => {
    expect(convert(1920, "px", "vmax", defaultConfig)).toBe(100);
  });

  it("converts vmax to px", () => {
    expect(convert(100, "vmax", "px", defaultConfig)).toBe(1920);
  });

  it("converts cross-unit (rem to vw)", () => {
    expect(convert(1, "rem", "vw", defaultConfig)).toBe(
      Number((((1 * 16) / 1920) * 100).toFixed(4))
    );
  });

  it("converts cross-unit (vw to rem)", () => {
    const result = convert(50, "vw", "rem", defaultConfig);
    const px = (50 / 100) * 1920;
    expect(result).toBe(Number((px / 16).toFixed(4)));
  });

  it("same unit returns same value", () => {
    expect(convert(16, "px", "px", defaultConfig)).toBe(16);
    expect(convert(1, "rem", "rem", defaultConfig)).toBe(1);
  });

  it("handles negative values", () => {
    expect(convert(-16, "px", "rem", defaultConfig)).toBe(-1);
    expect(convert(-1, "rem", "px", defaultConfig)).toBe(-16);
  });

  it("handles zero", () => {
    expect(convert(0, "px", "rem", defaultConfig)).toBe(0);
  });

  it("respects precision", () => {
    const result = convert(1, "px", "vw", defaultConfig);
    expect(result).toBe(0.0521);
  });

  it("returns null on division by zero for rem when rootFontSize=0", () => {
    expect(convert(16, "px", "rem", { ...defaultConfig, rootFontSize: 0 })).toBeNull();
  });

  it("returns null on division by zero for em when parentFontSize=0", () => {
    expect(convert(16, "px", "em", { ...defaultConfig, parentFontSize: 0 })).toBeNull();
  });

  it("returns null on division by zero for vw when viewportW=0", () => {
    expect(convert(16, "px", "vw", { ...defaultConfig, viewportW: 0 })).toBeNull();
  });

  it("returns null on division by zero for vh when viewportH=0", () => {
    expect(convert(16, "px", "vh", { ...defaultConfig, viewportH: 0 })).toBeNull();
  });
});

describe("convertCssCode", () => {
  it("replaces px values with rem", () => {
    const result = convertCssCode("font-size: 16px;", "px", "rem", defaultConfig);
    expect(result.code).toBe("font-size: 1rem;");
    expect(result.matchCount).toBe(1);
  });

  it("replaces rem values with px", () => {
    const result = convertCssCode("font-size: 1rem;", "rem", "px", defaultConfig);
    expect(result.code).toBe("font-size: 16px;");
    expect(result.matchCount).toBe(1);
  });

  it("replaces multiple values", () => {
    const css = "margin: 16px; padding: 8px;";
    const result = convertCssCode(css, "px", "rem", defaultConfig);
    expect(result.code).toBe("margin: 1rem; padding: 0.5rem;");
    expect(result.matchCount).toBe(2);
  });

  it("handles negative values", () => {
    const result = convertCssCode("margin-top: -8px;", "px", "rem", defaultConfig);
    expect(result.code).toBe("margin-top: -0.5rem;");
    expect(result.matchCount).toBe(1);
  });

  it("handles decimal values", () => {
    const result = convertCssCode("font-size: 1.5px;", "px", "rem", defaultConfig);
    expect(result.code).toBe("font-size: 0.0938rem;");
    expect(result.matchCount).toBe(1);
  });

  it("does not replace 0 without unit", () => {
    const css = "margin: 0; padding: 0;";
    const result = convertCssCode(css, "px", "rem", defaultConfig);
    expect(result.code).toBe("margin: 0; padding: 0;");
    expect(result.matchCount).toBe(0);
  });

  it("handles calc() expressions", () => {
    const css = "width: calc(16px + 2vw);";
    const result = convertCssCode(css, "px", "rem", defaultConfig);
    expect(result.code).toBe("width: calc(1rem + 2vw);");
    expect(result.matchCount).toBe(1);
  });

  it("passes through non-matching code", () => {
    const css = "color: red;";
    const result = convertCssCode(css, "px", "rem", defaultConfig);
    expect(result.code).toBe("color: red;");
    expect(result.matchCount).toBe(0);
  });

  it("handles px to em", () => {
    const result = convertCssCode("font-size: 16px;", "px", "em", defaultConfig);
    expect(result.code).toBe("font-size: 1em;");
  });

  it("handles px to vw", () => {
    const result = convertCssCode("width: 960px;", "px", "vw", defaultConfig);
    expect(result.code).toBe("width: 50vw;");
    expect(result.matchCount).toBe(1);
  });

  it("handles px to vh", () => {
    const result = convertCssCode("height: 540px;", "px", "vh", defaultConfig);
    expect(result.code).toBe("height: 50vh;");
    expect(result.matchCount).toBe(1);
  });
});

describe("constants", () => {
  it("CSS_UNITS has 7 units", () => {
    expect(CSS_UNITS).toHaveLength(7);
    expect(CSS_UNITS.map((u) => u.key)).toEqual(["px", "rem", "em", "vw", "vh", "vmin", "vmax"]);
  });

  it("VIEWPORT_PRESETS has 5 presets", () => {
    expect(VIEWPORT_PRESETS).toHaveLength(5);
    expect(VIEWPORT_PRESETS[0]).toEqual({ label: "desktop", width: 1920, height: 1080 });
  });

  it("PX_REFERENCE_VALUES has expected values", () => {
    expect(PX_REFERENCE_VALUES).toEqual([1, 2, 4, 8, 12, 14, 16, 20, 24, 32, 48, 64, 96, 128]);
  });

  it("BATCH_DIRECTIONS has 6 directions", () => {
    expect(BATCH_DIRECTIONS).toHaveLength(6);
    expect(BATCH_DIRECTIONS[0]).toEqual({ key: "px-rem", from: "px", to: "rem" });
  });
});
