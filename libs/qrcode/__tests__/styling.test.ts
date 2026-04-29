import { describe, it, expect } from "vitest";
import { DEFAULT_STYLING, buildOptions } from "../styling";
import type { StylingOptions } from "../types";

const baseStyling: StylingOptions = {
  foregroundColor: "#000000",
  backgroundColor: "#ffffff",
  dotStyle: "rounded",
  errorCorrection: "Q",
  size: 300,
  margin: 10,
};

describe("DEFAULT_STYLING", () => {
  it("matches spec defaults", () => {
    expect(DEFAULT_STYLING).toMatchObject({
      foregroundColor: "#000000",
      backgroundColor: "#ffffff",
      dotStyle: "rounded",
      errorCorrection: "Q",
      size: 300,
      margin: 10,
    });
    expect(DEFAULT_STYLING.logo).toBeUndefined();
  });
});

describe("buildOptions", () => {
  it("maps foreground to dots + corners", () => {
    const opts = buildOptions("hello", { ...baseStyling, foregroundColor: "#ff0000" });
    expect(opts.dotsOptions?.color).toBe("#ff0000");
    expect(opts.cornersSquareOptions?.color).toBe("#ff0000");
    expect(opts.cornersDotOptions?.color).toBe("#ff0000");
  });
  it("maps background to backgroundOptions", () => {
    const opts = buildOptions("hello", { ...baseStyling, backgroundColor: "#abcdef" });
    expect(opts.backgroundOptions?.color).toBe("#abcdef");
  });
  it("maps dotStyle to dotsOptions.type", () => {
    const opts = buildOptions("hello", { ...baseStyling, dotStyle: "classy" });
    expect(opts.dotsOptions?.type).toBe("classy");
  });
  it("maps errorCorrection to qrOptions.errorCorrectionLevel", () => {
    const opts = buildOptions("hello", { ...baseStyling, errorCorrection: "H" });
    expect(opts.qrOptions?.errorCorrectionLevel).toBe("H");
  });
  it("maps size to width and height", () => {
    const opts = buildOptions("hello", { ...baseStyling, size: 256 });
    expect(opts.width).toBe(256);
    expect(opts.height).toBe(256);
  });
  it("maps margin to top-level margin", () => {
    const opts = buildOptions("hello", { ...baseStyling, margin: 20 });
    expect(opts.margin).toBe(20);
  });
  it("includes data field", () => {
    const opts = buildOptions("hi there", baseStyling);
    expect(opts.data).toBe("hi there");
  });
  it("omits image when no logo", () => {
    const opts = buildOptions("hello", baseStyling);
    expect(opts.image).toBeUndefined();
  });
  it("maps logo into image + imageOptions", () => {
    const opts = buildOptions("hello", {
      ...baseStyling,
      logo: {
        dataUrl: "data:image/png;base64,AAA",
        size: 0.4,
        margin: 4,
        hideBackgroundDots: true,
      },
    });
    expect(opts.image).toBe("data:image/png;base64,AAA");
    expect(opts.imageOptions?.imageSize).toBe(0.4);
    expect(opts.imageOptions?.margin).toBe(4);
    expect(opts.imageOptions?.hideBackgroundDots).toBe(true);
    expect(opts.imageOptions?.crossOrigin).toBe("anonymous");
  });
});
