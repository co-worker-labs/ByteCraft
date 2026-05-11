export type CSSUnit = "px" | "rem" | "em" | "vw" | "vh" | "vmin" | "vmax";

export interface CSSUnitMeta {
  key: CSSUnit;
  label: string;
}

export interface ConvertConfig {
  rootFontSize: number;
  parentFontSize: number;
  viewportW: number;
  viewportH: number;
  precision: number;
}

export const CSS_UNITS: CSSUnitMeta[] = [
  { key: "px", label: "px" },
  { key: "rem", label: "rem" },
  { key: "em", label: "em" },
  { key: "vw", label: "vw" },
  { key: "vh", label: "vh" },
  { key: "vmin", label: "vmin" },
  { key: "vmax", label: "vmax" },
];

export const VIEWPORT_PRESETS = [
  { label: "desktop", width: 1920, height: 1080 },
  { label: "laptop", width: 1440, height: 900 },
  { label: "ipad", width: 1024, height: 768 },
  { label: "iphone", width: 390, height: 844 },
  { label: "fourK", width: 3840, height: 2160 },
] as const;

export const PX_REFERENCE_VALUES = [1, 2, 4, 8, 12, 14, 16, 20, 24, 32, 48, 64, 96, 128];

export const BATCH_DIRECTIONS = [
  { key: "px-rem", from: "px" as CSSUnit, to: "rem" as CSSUnit },
  { key: "rem-px", from: "rem" as CSSUnit, to: "px" as CSSUnit },
  { key: "px-em", from: "px" as CSSUnit, to: "em" as CSSUnit },
  { key: "em-px", from: "em" as CSSUnit, to: "px" as CSSUnit },
  { key: "px-vw", from: "px" as CSSUnit, to: "vw" as CSSUnit },
  { key: "px-vh", from: "px" as CSSUnit, to: "vh" as CSSUnit },
];

function toPx(value: number, unit: CSSUnit, config: ConvertConfig): number | null {
  switch (unit) {
    case "px":
      return value;
    case "rem":
      return value * config.rootFontSize;
    case "em":
      return value * config.parentFontSize;
    case "vw":
      return (value / 100) * config.viewportW;
    case "vh":
      return (value / 100) * config.viewportH;
    case "vmin":
      return (value / 100) * Math.min(config.viewportW, config.viewportH);
    case "vmax":
      return (value / 100) * Math.max(config.viewportW, config.viewportH);
  }
}

function fromPx(px: number, unit: CSSUnit, config: ConvertConfig): number | null {
  switch (unit) {
    case "px":
      return px;
    case "rem":
      if (config.rootFontSize === 0) return null;
      return px / config.rootFontSize;
    case "em":
      if (config.parentFontSize === 0) return null;
      return px / config.parentFontSize;
    case "vw":
      if (config.viewportW === 0) return null;
      return (px / config.viewportW) * 100;
    case "vh":
      if (config.viewportH === 0) return null;
      return (px / config.viewportH) * 100;
    case "vmin": {
      const min = Math.min(config.viewportW, config.viewportH);
      if (min === 0) return null;
      return (px / min) * 100;
    }
    case "vmax": {
      const max = Math.max(config.viewportW, config.viewportH);
      if (max === 0) return null;
      return (px / max) * 100;
    }
  }
}

export function convert(
  value: number,
  from: CSSUnit,
  to: CSSUnit,
  config: ConvertConfig
): number | null {
  if (from === to) return value;
  const px = toPx(value, from, config);
  if (px === null) return null;
  const result = fromPx(px, to, config);
  if (result === null) return null;
  return Number(result.toFixed(config.precision));
}

export function convertCssCode(
  code: string,
  from: CSSUnit,
  to: CSSUnit,
  config: ConvertConfig
): { code: string; matchCount: number } {
  let matchCount = 0;
  const regex = new RegExp(`(-?\\d+\\.?\\d*)(${from})\\b`, "g");
  const result = code.replace(regex, (_match, numStr: string, _unit: string) => {
    const num = parseFloat(numStr);
    const converted = convert(num, from, to, config);
    if (converted === null) return _match;
    matchCount++;
    return `${converted}${to}`;
  });
  return { code: result, matchCount };
}
