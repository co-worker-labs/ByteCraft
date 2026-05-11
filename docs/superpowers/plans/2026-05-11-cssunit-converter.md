# CSS Unit Converter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based CSS unit conversion tool with single-value converter, CSS code batch conversion, and reference lookup table.

**Architecture:** Core conversion logic in `libs/cssunit/main.ts` with px-as-intermediate two-step conversion. UI is a single client component with NeonTabs for 3 views. All state managed via `useState` with React Compiler auto-memoization.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS 4, next-intl, lucide-react (Ruler icon), Vitest

---

## File Map

| Action | File                                     | Responsibility                                                           |
| ------ | ---------------------------------------- | ------------------------------------------------------------------------ |
| Create | `libs/cssunit/main.ts`                   | Type defs, unit metadata, conversion functions, presets, batch converter |
| Create | `libs/cssunit/__tests__/cssunit.test.ts` | Unit tests for convert() and convertCssCode()                            |
| Create | `app/[locale]/cssunit/page.tsx`          | Route entry: metadata, JSON-LD schemas                                   |
| Create | `app/[locale]/cssunit/cssunit-page.tsx`  | Client component: 3 tabs, config, viewport, description, related tools   |
| Create | `public/locales/en/cssunit.json`         | English tool translations                                                |
| Create | `public/locales/zh-CN/cssunit.json`      | Simplified Chinese translations                                          |
| Create | `public/locales/zh-TW/cssunit.json`      | Traditional Chinese translations                                         |
| Create | `public/locales/ja/cssunit.json`         | Japanese translations                                                    |
| Create | `public/locales/ko/cssunit.json`         | Korean translations                                                      |
| Create | `public/locales/es/cssunit.json`         | Spanish translations                                                     |
| Create | `public/locales/pt-BR/cssunit.json`      | Brazilian Portuguese translations                                        |
| Create | `public/locales/fr/cssunit.json`         | French translations                                                      |
| Create | `public/locales/de/cssunit.json`         | German translations                                                      |
| Create | `public/locales/ru/cssunit.json`         | Russian translations                                                     |
| Modify | `libs/tools.ts`                          | Register cssunit in TOOLS, TOOL_CATEGORIES, TOOL_RELATIONS               |
| Modify | `vitest.config.ts`                       | Add cssunit test path                                                    |
| Modify | `public/locales/en/tools.json`           | Add cssunit entry                                                        |
| Modify | `public/locales/zh-CN/tools.json`        | Add cssunit entry with searchTerms                                       |
| Modify | `public/locales/zh-TW/tools.json`        | Add cssunit entry with searchTerms                                       |
| Modify | `public/locales/ja/tools.json`           | Add cssunit entry with searchTerms                                       |
| Modify | `public/locales/ko/tools.json`           | Add cssunit entry with searchTerms                                       |
| Modify | `public/locales/es/tools.json`           | Add cssunit entry                                                        |
| Modify | `public/locales/pt-BR/tools.json`        | Add cssunit entry                                                        |
| Modify | `public/locales/fr/tools.json`           | Add cssunit entry                                                        |
| Modify | `public/locales/de/tools.json`           | Add cssunit entry                                                        |
| Modify | `public/locales/ru/tools.json`           | Add cssunit entry                                                        |

---

### Task 1: Core Library — Types, Conversion Logic, Presets

**Files:**

- Create: `libs/cssunit/main.ts`
- Create: `libs/cssunit/__tests__/cssunit.test.ts`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Add test path to vitest.config.ts**

Add `"libs/cssunit/**/*.test.ts"` to the `test.include` array, after the existing `"libs/wallet/**/*.test.ts"` entry.

```ts
// In the test.include array, add this line after "libs/wallet/**/*.test.ts":
"libs/cssunit/**/*.test.ts",
```

- [ ] **Step 2: Write the failing tests**

Create `libs/cssunit/__tests__/cssunit.test.ts`:

```ts
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
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run libs/cssunit`
Expected: FAIL — module not found

- [ ] **Step 4: Write the implementation**

Create `libs/cssunit/main.ts`:

```ts
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run libs/cssunit`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add libs/cssunit/ vitest.config.ts
git commit -m "feat(cssunit): add core conversion library with tests"
```

---

### Task 2: Tool Registration

**Files:**

- Modify: `libs/tools.ts`

- [ ] **Step 1: Register cssunit in tools.ts**

Add `Ruler` to the lucide-react import (alphabetical order after `Regex`):

```ts
import {
  // ...existing imports...
  Ruler,
  // ...
} from "lucide-react";
```

Add `"cssunit"` to the `encoding` category tools array in `TOOL_CATEGORIES`, after `"storageunit"`:

```ts
{
  key: "encoding",
  tools: ["base64", "urlencoder", "csv", "csv-md", "numbase", "yaml", "storageunit", "cssunit"],
},
```

Add `"cssunit"` entry to `TOOL_RELATIONS`:

```ts
cssunit: ["storageunit", "numbase", "color"],
```

Add backlinks to existing tools:

```ts
color: ["image", "numbase", "cssunit"],
// ...
storageunit: ["numbase", "checksum", "cssunit"],
```

Add `"cssunit"` entry to `TOOLS` array (after the `storageunit` entry):

```ts
{
  key: "cssunit",
  path: "/cssunit",
  icon: Ruler,
  emoji: "📐",
  sameAs: ["https://www.w3.org/TR/css-values-4/"],
},
```

- [ ] **Step 2: Verify build passes**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add libs/tools.ts
git commit -m "feat(cssunit): register tool in categories, relations, and tools array"
```

---

### Task 3: English i18n Files

**Files:**

- Modify: `public/locales/en/tools.json`
- Create: `public/locales/en/cssunit.json`

- [ ] **Step 1: Add cssunit entry to `public/locales/en/tools.json`**

Add after the `storageunit` entry:

```json
"cssunit": {
  "title": "CSS Unit Converter - px to rem, em, vw, vh",
  "shortTitle": "CSS Unit Converter",
  "description": "Convert between CSS units (px, rem, em, vw, vh) with customizable base values. Batch convert CSS code and reference lookup table."
},
```

- [ ] **Step 2: Create `public/locales/en/cssunit.json`**

```json
{
  "converter": "Converter",
  "batchConvert": "Batch Convert",
  "reference": "Reference",
  "rootFontSize": "Root Font Size",
  "parentFontSize": "Parent Font Size",
  "viewport": "Viewport",
  "precision": "Precision",
  "decimals": "decimals",
  "enterValue": "Enter value",
  "unit": "Unit",
  "result": "Result",
  "copy": "Copy",
  "sourceCss": "Source CSS",
  "convertedCss": "Converted CSS",
  "copyAll": "Copy All",
  "clear": "Clear",
  "valuesConverted": "{count} values converted",
  "basedOn": "Based on root font-size: {rootFontSize}px · Precision: {precision} decimals",
  "copyValue": "Copy value",
  "desktop": "Desktop",
  "laptop": "Laptop",
  "ipad": "iPad",
  "iphone": "iPhone",
  "fourK": "4K",
  "width": "Width",
  "height": "Height",
  "descriptions": {
    "aeoDefinition": "CSS Unit Converter is a free online tool for converting between px, rem, em, vw, vh, vmin, and vmax. Batch convert CSS code with customizable root font size and viewport dimensions. Runs entirely in your browser.",
    "whatIsTitle": "What is the CSS Unit Converter?",
    "whatIsP1": "The CSS Unit Converter lets you instantly convert between CSS length units — px, rem, em, vw, vh, vmin, and vmax. Set your root font size, parent font size, and viewport dimensions for accurate results.",
    "whatIsP2": "Paste CSS code for batch conversion, or use the reference table for common px-to-rem and px-to-vw mappings.",
    "stepsTitle": "How to Convert CSS Units",
    "step1Title": "Enter a value",
    "step1Text": "Type a numeric value and select the source unit. All equivalent values are calculated in real time.",
    "step2Title": "Batch convert CSS",
    "step2Text": "Paste your CSS code, choose a conversion direction, and get the converted output with matched values highlighted.",
    "step3Title": "Check the reference table",
    "step3Text": "Use the reference tab for quick lookups of common px-to-rem, px-to-em, and px-to-vw conversions.",
    "faq1Q": "When should I use rem vs em?",
    "faq1A": "Use rem for consistent sizing relative to the root font size — ideal for margins, padding, and layout. Use em for typography that should scale with its parent element, like nested font sizes in components.",
    "faq2Q": "How do viewport units (vw, vh) work?",
    "faq2A": "1vw equals 1% of the viewport width, and 1vh equals 1% of the viewport height. They are useful for full-width or full-height layouts that adapt to the browser window size.",
    "faq3Q": "Why are percentages (%) not included?",
    "faq3A": "Percentages depend on the containing element and the specific CSS property, so there is no universal conversion factor. This tool only supports units with fixed, predictable conversion bases."
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/en/
git commit -m "feat(cssunit): add English i18n translations"
```

---

### Task 4: CJK i18n Files (zh-CN, zh-TW, ja, ko)

**Files:**

- Modify: `public/locales/zh-CN/tools.json`
- Modify: `public/locales/zh-TW/tools.json`
- Modify: `public/locales/ja/tools.json`
- Modify: `public/locales/ko/tools.json`
- Create: `public/locales/zh-CN/cssunit.json`
- Create: `public/locales/zh-TW/cssunit.json`
- Create: `public/locales/ja/cssunit.json`
- Create: `public/locales/ko/cssunit.json`

- [ ] **Step 1: Add cssunit to zh-CN/tools.json**

Insert before `"categories"`, after the `"bip39"` entry:

```json
"cssunit": {
  "title": "CSS 单位转换器 - px 转 rem、em、vw、vh",
  "shortTitle": "CSS 单位转换",
  "description": "在 CSS 单位（px、rem、em、vw、vh）之间转换，支持自定义基准值。批量转换 CSS 代码，提供参考对照表。",
  "searchTerms": "cssdanweizhuanhuanqi csdwzhq rem em xiangying"
},
```

- [ ] **Step 2: Add cssunit to zh-TW/tools.json**

Insert before `"categories"`, after the `"bip39"` entry:

```json
"cssunit": {
  "title": "CSS 單位轉換器 - px 轉 rem、em、vw、vh",
  "shortTitle": "CSS 單位轉換",
  "description": "在 CSS 單位（px、rem、em、vw、vh）之間轉換，支援自訂基準值。批次轉換 CSS 程式碼，提供參考對照表。",
  "searchTerms": "cssdanweizhuanhuanqi csdwzhq rem em xiangying"
},
```

- [ ] **Step 3: Add cssunit to ja/tools.json**

Insert before `"categories"`, after the `"bip39"` entry:

```json
"cssunit": {
  "title": "CSS 単位変換 - px ↔ rem, em, vw, vh",
  "shortTitle": "CSS 単位変換",
  "description": "CSS 単位（px、rem、em、vw、vh）を相互変換。ルートフォントサイズとビューポート寸法をカスタマイズ可能。CSS コードの一括変換と参照テーブル付き。",
  "searchTerms": "css tanibengou rem em responsive"
},
```

- [ ] **Step 4: Add cssunit to ko/tools.json**

Insert before `"categories"`, after the `"bip39"` entry:

```json
"cssunit": {
  "title": "CSS 단위 변환기 - px ↔ rem, em, vw, vh",
  "shortTitle": "CSS 단위 변환",
  "description": "CSS 단위(px, rem, em, vw, vh) 간 변환. 루트 폰트 크기와 뷰포트 크기 설정 가능. CSS 코드 일괄 변환 및 참조 테이블 제공.",
  "searchTerms": "cssdangwibyeonhwan cssdwbh rem em bandeunghyeong"
},
```

- [ ] **Step 5: Create `public/locales/zh-CN/cssunit.json`**

```json
{
  "converter": "转换器",
  "batchConvert": "批量转换",
  "reference": "参考表",
  "rootFontSize": "根字体大小",
  "parentFontSize": "父级字体大小",
  "viewport": "视口",
  "precision": "精度",
  "decimals": "位小数",
  "enterValue": "输入数值",
  "unit": "单位",
  "result": "结果",
  "copy": "复制",
  "sourceCss": "源 CSS",
  "convertedCss": "转换结果",
  "copyAll": "全部复制",
  "clear": "清空",
  "valuesConverted": "已转换 {count} 个值",
  "basedOn": "基于根字体大小：{rootFontSize}px · 精度：{precision} 位小数",
  "copyValue": "复制值",
  "desktop": "桌面",
  "laptop": "笔记本",
  "ipad": "iPad",
  "iphone": "iPhone",
  "fourK": "4K",
  "width": "宽度",
  "height": "高度",
  "descriptions": {
    "aeoDefinition": "CSS 单位转换器是一款免费在线工具，支持 px、rem、em、vw、vh、vmin、vmax 之间的相互转换。支持自定义根字体大小和视口尺寸，可批量转换 CSS 代码。完全在浏览器中运行。",
    "whatIsTitle": "什么是 CSS 单位转换器？",
    "whatIsP1": "CSS 单位转换器可以即时在 CSS 长度单位之间转换——px、rem、em、vw、vh、vmin、vmax。设置根字体大小、父级字体大小和视口尺寸即可获得准确的转换结果。",
    "whatIsP2": "粘贴 CSS 代码进行批量转换，或使用参考表查询常用的 px 到 rem、px 到 vw 的对照值。",
    "stepsTitle": "如何使用 CSS 单位转换",
    "step1Title": "输入数值",
    "step1Text": "输入数值并选择源单位，所有等价值将实时计算显示。",
    "step2Title": "批量转换 CSS",
    "step2Text": "粘贴 CSS 代码，选择转换方向，即可获得转换结果并高亮匹配的值。",
    "step3Title": "查看参考表",
    "step3Text": "使用参考表快速查询常用的 px→rem、px→em、px→vw 转换值。",
    "faq1Q": "什么时候用 rem，什么时候用 em？",
    "faq1A": "rem 相对于根字体大小，适合用于边距、内边距和布局等需要一致性的场景。em 相对于父元素字体大小，适合组件中需要随父级缩放的嵌套字体大小。",
    "faq2Q": "视口单位（vw、vh）是怎么计算的？",
    "faq2A": "1vw 等于视口宽度的 1%，1vh 等于视口高度的 1%。适合用于需要自适应浏览器窗口大小的全宽或全高布局。",
    "faq3Q": "为什么没有百分比（%）？",
    "faq3A": "百分比取决于所在元素和具体 CSS 属性，没有通用的转换系数。本工具仅支持具有固定、可预测转换基准的单位。"
  }
}
```

- [ ] **Step 6: Create `public/locales/zh-TW/cssunit.json`**

```json
{
  "converter": "轉換器",
  "batchConvert": "批次轉換",
  "reference": "參考表",
  "rootFontSize": "根字體大小",
  "parentFontSize": "父層字體大小",
  "viewport": "視口",
  "precision": "精度",
  "decimals": "位小數",
  "enterValue": "輸入數值",
  "unit": "單位",
  "result": "結果",
  "copy": "複製",
  "sourceCss": "來源 CSS",
  "convertedCss": "轉換結果",
  "copyAll": "全部複製",
  "clear": "清空",
  "valuesConverted": "已轉換 {count} 個值",
  "basedOn": "基於根字體大小：{rootFontSize}px · 精度：{precision} 位小數",
  "copyValue": "複製值",
  "desktop": "桌面",
  "laptop": "筆記型電腦",
  "ipad": "iPad",
  "iphone": "iPhone",
  "fourK": "4K",
  "width": "寬度",
  "height": "高度",
  "descriptions": {
    "aeoDefinition": "CSS 單位轉換器是一款免費線上工具，支援 px、rem、em、vw、vh、vmin、vmax 之間的相互轉換。支援自訂根字體大小和視口尺寸，可批次轉換 CSS 程式碼。完全在瀏覽器中執行。",
    "whatIsTitle": "什麼是 CSS 單位轉換器？",
    "whatIsP1": "CSS 單位轉換器可以即時在 CSS 長度單位之間轉換——px、rem、em、vw、vh、vmin、vmax。設定根字體大小、父層字體大小和視口尺寸即可獲得準確的轉換結果。",
    "whatIsP2": "貼上 CSS 程式碼進行批次轉換，或使用參考表查詢常用的 px 到 rem、px 到 vw 的對照值。",
    "stepsTitle": "如何使用 CSS 單位轉換",
    "step1Title": "輸入數值",
    "step1Text": "輸入數值並選擇來源單位，所有等價值將即時計算顯示。",
    "step2Title": "批次轉換 CSS",
    "step2Text": "貼上 CSS 程式碼，選擇轉換方向，即可獲得轉換結果並標示匹配的值。",
    "step3Title": "查看參考表",
    "step3Text": "使用參考表快速查詢常用的 px→rem、px→em、px→vw 轉換值。",
    "faq1Q": "什麼時候用 rem，什麼時候用 em？",
    "faq1A": "rem 相對於根字體大小，適合用於邊距、內距和版面配置等需要一致性的場景。em 相對於父元素字體大小，適合元件中需要隨父層縮放的巢狀字體大小。",
    "faq2Q": "視口單位（vw、vh）是怎麼計算的？",
    "faq2A": "1vw 等於視口寬度的 1%，1vh 等於視口高度的 1%。適合用於需要自適應瀏覽器視窗大小的全寬或全高版面配置。",
    "faq3Q": "為什麼沒有百分比（%）？",
    "faq3A": "百分比取決於所在元素和具體 CSS 屬性，沒有通用的轉換係數。本工具僅支援具有固定、可預測轉換基準的單位。"
  }
}
```

- [ ] **Step 7: Create `public/locales/ja/cssunit.json`**

```json
{
  "converter": "変換",
  "batchConvert": "一括変換",
  "reference": "参照表",
  "rootFontSize": "ルートフォントサイズ",
  "parentFontSize": "親フォントサイズ",
  "viewport": "ビューポート",
  "precision": "精度",
  "decimals": "桁",
  "enterValue": "値を入力",
  "unit": "単位",
  "result": "結果",
  "copy": "コピー",
  "sourceCss": "変換元 CSS",
  "convertedCss": "変換結果",
  "copyAll": "すべてコピー",
  "clear": "クリア",
  "valuesConverted": "{count} 件の値を変換",
  "basedOn": "ルートフォントサイズ: {rootFontSize}px ・ 精度: {precision} 桁",
  "copyValue": "値をコピー",
  "desktop": "デスクトップ",
  "laptop": "ノート PC",
  "ipad": "iPad",
  "iphone": "iPhone",
  "fourK": "4K",
  "width": "幅",
  "height": "高さ",
  "descriptions": {
    "aeoDefinition": "CSS 単位変換ツールは、px、rem、em、vw、vh、vmin、vmax 間の相互変換をサポートする無料オンラインツールです。ルートフォントサイズとビューポート寸法をカスタマイズでき、CSS コードの一括変換も可能。完全にブラウザで動作します。",
    "whatIsTitle": "CSS 単位変換ツールとは？",
    "whatIsP1": "CSS 単位変換ツールを使うと、px、rem、em、vw、vh、vmin、vmax などの CSS 長さ単位を即座に変換できます。ルートフォントサイズ、親フォントサイズ、ビューポート寸法を設定して正確な変換結果を取得できます。",
    "whatIsP2": "CSS コードを貼り付けて一括変換するか、参照テーブルで一般的な px→rem、px→vw の対応値を確認できます。",
    "stepsTitle": "CSS 単位の変換方法",
    "step1Title": "値を入力",
    "step1Text": "数値を入力し、変換元の単位を選択すると、すべての等価値がリアルタイムで計算されます。",
    "step2Title": "CSS を一括変換",
    "step2Text": "CSS コードを貼り付け、変換方向を選択すると、マッチした値がハイライトされた変換結果が得られます。",
    "step3Title": "参照テーブルを確認",
    "step3Text": "参照タブを使って、一般的な px→rem、px→em、px→vw 変換値をすばやく検索できます。",
    "faq1Q": "rem と em はいつ使い分けるべきですか？",
    "faq1A": "rem はルートフォントサイズに対する相対値で、マージン、パディング、レイアウトなど一貫性が必要な場面に適しています。em は親要素のフォントサイズに対する相対値で、コンポーネント内で親に連動してスケールするネストされたフォントサイズに適しています。",
    "faq2Q": "ビューポート単位（vw、vh）の仕組みは？",
    "faq2A": "1vw はビューポート幅の 1%、1vh はビューポート高さの 1% に相当します。ブラウザウィンドウサイズに適応する全幅・全高レイアウトに便利です。",
    "faq3Q": "なぜパーセント（%）は含まれていませんか？",
    "faq3A": "パーセントは包含要素と具体的な CSS プロパティに依存するため、汎用的な変換係数がありません。このツールは固定された予測可能な変換基準を持つ単位のみをサポートしています。"
  }
}
```

- [ ] **Step 8: Create `public/locales/ko/cssunit.json`**

```json
{
  "converter": "변환기",
  "batchConvert": "일괄 변환",
  "reference": "참조표",
  "rootFontSize": "루트 폰트 크기",
  "parentFontSize": "부모 폰트 크기",
  "viewport": "뷰포트",
  "precision": "정밀도",
  "decimals": "자리",
  "enterValue": "값 입력",
  "unit": "단위",
  "result": "결과",
  "copy": "복사",
  "sourceCss": "원본 CSS",
  "convertedCss": "변환 결과",
  "copyAll": "모두 복사",
  "clear": "지우기",
  "valuesConverted": "{count}개 값 변환됨",
  "basedOn": "루트 폰트 크기: {rootFontSize}px · 정밀도: {precision}자리",
  "copyValue": "값 복사",
  "desktop": "데스크톱",
  "laptop": "노트북",
  "ipad": "iPad",
  "iphone": "iPhone",
  "fourK": "4K",
  "width": "너비",
  "height": "높이",
  "descriptions": {
    "aeoDefinition": "CSS 단위 변환기는 px, rem, em, vw, vh, vmin, vmax 간 변환을 지원하는 무료 온라인 도구입니다. 루트 폰트 크기와 뷰포트 크기를 설정할 수 있고 CSS 코드 일괄 변환도 가능합니다. 브라우저에서 완전히 실행됩니다.",
    "whatIsTitle": "CSS 단위 변환기란?",
    "whatIsP1": "CSS 단위 변환기를 사용하면 px, rem, em, vw, vh, vmin, vmax 등 CSS 길이 단위 간 즉시 변환할 수 있습니다. 루트 폰트 크기, 부모 폰트 크기, 뷰포트 크기를 설정하여 정확한 변환 결과를 얻을 수 있습니다.",
    "whatIsP2": "CSS 코드를 붙여넣어 일괄 변환하거나, 참조 테이블에서 일반적인 px→rem, px→vw 변환값을 확인할 수 있습니다.",
    "stepsTitle": "CSS 단위 변환 방법",
    "step1Title": "값 입력",
    "step1Text": "숫자를 입력하고 원본 단위를 선택하면 모든 동등 값이 실시간으로 계산됩니다.",
    "step2Title": "CSS 일괄 변환",
    "step2Text": "CSS 코드를 붙여넣고 변환 방향을 선택하면 일치하는 값이 강조된 변환 결과를 얻을 수 있습니다.",
    "step3Title": "참조표 확인",
    "step3Text": "참조 탭을 사용하여 일반적인 px→rem, px→em, px→vw 변환값을 빠르게 조회할 수 있습니다.",
    "faq1Q": "rem과 em은 언제 사용해야 하나요?",
    "faq1A": "rem은 루트 폰트 크기에 대한 상대값으로 마진, 패딩, 레이아웃 등 일관성이 필요한 곳에 적합합니다. em은 부모 요소의 폰트 크기에 대한 상대값으로 부모에 따라 스케일되는 컴포넌트 내 중첩 폰트 크기에 적합합니다.",
    "faq2Q": "뷰포트 단位(vw, vh)은 어떻게 작동하나요?",
    "faq2A": "1vw는 뷰포트 너비의 1%, 1vh는 뷰포트 높이의 1%와 같습니다. 브라우저 창 크기에 적응하는 전체 너비 또는 전체 높이 레이아웃에 유용합니다.",
    "faq3Q": "왜 퍼센트(%)는 포함되지 않나요?",
    "faq3A": "퍼센트는 포함 요소와 특정 CSS 속성에 따라 달라지므로 보편적인 변환 계수가 없습니다. 이 도구는 고정되고 예측 가능한 변환 기준이 있는 단위만 지원합니다."
  }
}
```

- [ ] **Step 9: Commit**

```bash
git add public/locales/zh-CN/ public/locales/zh-TW/ public/locales/ja/ public/locales/ko/
git commit -m "feat(cssunit): add CJK i18n translations (zh-CN, zh-TW, ja, ko)"
```

---

### Task 5: Latin-script i18n Files (es, pt-BR, fr, de, ru)

**Files:**

- Modify: `public/locales/es/tools.json`
- Modify: `public/locales/pt-BR/tools.json`
- Modify: `public/locales/fr/tools.json`
- Modify: `public/locales/de/tools.json`
- Modify: `public/locales/ru/tools.json`
- Create: `public/locales/es/cssunit.json`
- Create: `public/locales/pt-BR/cssunit.json`
- Create: `public/locales/fr/cssunit.json`
- Create: `public/locales/de/cssunit.json`
- Create: `public/locales/ru/cssunit.json`

- [ ] **Step 1: Add cssunit to each locale's tools.json**

For each locale, insert the cssunit entry before `"categories"` after the `"bip39"` entry.

**es:**

```json
"cssunit": {
  "title": "Conversor de unidades CSS - px a rem, em, vw, vh",
  "shortTitle": "Conversor de unidades CSS",
  "description": "Convierte entre unidades CSS (px, rem, em, vw, vh) con valores base personalizables. Conversión por lotes de código CSS y tabla de referencia."
},
```

**pt-BR:**

```json
"cssunit": {
  "title": "Conversor de unidades CSS - px para rem, em, vw, vh",
  "shortTitle": "Conversor de unidades CSS",
  "description": "Converta entre unidades CSS (px, rem, em, vw, vh) com valores base personalizáveis. Conversão em lote de código CSS e tabela de referência."
},
```

**fr:**

```json
"cssunit": {
  "title": "Convertisseur d'unités CSS - px vers rem, em, vw, vh",
  "shortTitle": "Convertisseur d'unités CSS",
  "description": "Convertissez entre unités CSS (px, rem, em, vw, vh) avec des valeurs de base personnalisables. Conversion par lot de code CSS et table de référence."
},
```

**de:**

```json
"cssunit": {
  "title": "CSS-Einheitenumrechner - px zu rem, em, vw, vh",
  "shortTitle": "CSS-Einheitenumrechner",
  "description": "Umrechnung zwischen CSS-Einheiten (px, rem, em, vw, vh) mit anpassbaren Basiswerten. Batch-Umrechnung von CSS-Code und Referenztabelle."
},
```

**ru:**

```json
"cssunit": {
  "title": "Конвертер единиц CSS — px в rem, em, vw, vh",
  "shortTitle": "Конвертер единиц CSS",
  "description": "Конвертируйте единицы CSS (px, rem, em, vw, vh) с настраиваемыми базовыми значениями. Пакетная конвертация CSS-кода и справочная таблица."
},
```

- [ ] **Step 2: Create `public/locales/es/cssunit.json`**

```json
{
  "converter": "Convertidor",
  "batchConvert": "Conversión por lotes",
  "reference": "Referencia",
  "rootFontSize": "Tamaño de fuente raíz",
  "parentFontSize": "Tamaño de fuente padre",
  "viewport": "Viewport",
  "precision": "Precisión",
  "decimals": "decimales",
  "enterValue": "Introduce un valor",
  "unit": "Unidad",
  "result": "Resultado",
  "copy": "Copiar",
  "sourceCss": "CSS origen",
  "convertedCss": "CSS convertido",
  "copyAll": "Copiar todo",
  "clear": "Limpiar",
  "valuesConverted": "{count} valores convertidos",
  "basedOn": "Basado en tamaño de fuente raíz: {rootFontSize}px · Precisión: {precision} decimales",
  "copyValue": "Copiar valor",
  "desktop": "Escritorio",
  "laptop": "Portátil",
  "ipad": "iPad",
  "iphone": "iPhone",
  "fourK": "4K",
  "width": "Ancho",
  "height": "Alto",
  "descriptions": {
    "aeoDefinition": "El Conversor de unidades CSS es una herramienta online gratuita para convertir entre px, rem, em, vw, vh, vmin y vmax. Conversión por lotes de código CSS con tamaño de fuente raíz y dimensiones de viewport personalizables. Se ejecuta completamente en tu navegador.",
    "whatIsTitle": "¿Qué es el Conversor de unidades CSS?",
    "whatIsP1": "El Conversor de unidades CSS te permite convertir instantáneamente entre unidades de longitud CSS — px, rem, em, vw, vh, vmin y vmax. Configura el tamaño de fuente raíz, el tamaño de fuente padre y las dimensiones del viewport para obtener resultados precisos.",
    "whatIsP2": "Pega código CSS para conversión por lotes, o usa la tabla de referencia para mapeos comunes de px a rem y px a vw.",
    "stepsTitle": "Cómo convertir unidades CSS",
    "step1Title": "Introduce un valor",
    "step1Text": "Escribe un valor numérico y selecciona la unidad de origen. Todos los valores equivalentes se calculan en tiempo real.",
    "step2Title": "Convierte CSS por lotes",
    "step2Text": "Pega tu código CSS, elige una dirección de conversión y obtén el resultado con los valores coincidentes resaltados.",
    "step3Title": "Consulta la tabla de referencia",
    "step3Text": "Usa la pestaña de referencia para buscar conversiones comunes de px→rem, px→em y px→vw.",
    "faq1Q": "¿Cuándo debo usar rem vs em?",
    "faq1A": "Usa rem para tamaños consistentes relativos al tamaño de fuente raíz — ideal para márgenes, padding y layout. Usa em para tipografía que deba escalar con su elemento padre, como tamaños de fuente anidados en componentes.",
    "faq2Q": "¿Cómo funcionan las unidades de viewport (vw, vh)?",
    "faq2A": "1vw equivale al 1% del ancho del viewport y 1vh equivale al 1% de su altura. Son útiles para layouts de ancho o alto completo que se adaptan al tamaño de la ventana del navegador.",
    "faq3Q": "¿Por qué no se incluyen los porcentajes (%)?",
    "faq3A": "Los porcentajes dependen del elemento contenedor y de la propiedad CSS específica, por lo que no existe un factor de conversión universal. Esta herramienta solo soporta unidades con bases de conversión fijas y predecibles."
  }
}
```

- [ ] **Step 3: Create `public/locales/pt-BR/cssunit.json`**

```json
{
  "converter": "Conversor",
  "batchConvert": "Conversão em lote",
  "reference": "Referência",
  "rootFontSize": "Tamanho da fonte raiz",
  "parentFontSize": "Tamanho da fonte pai",
  "viewport": "Viewport",
  "precision": "Precisão",
  "decimals": "decimais",
  "enterValue": "Digite um valor",
  "unit": "Unidade",
  "result": "Resultado",
  "copy": "Copiar",
  "sourceCss": "CSS de origem",
  "convertedCss": "CSS convertido",
  "copyAll": "Copiar tudo",
  "clear": "Limpar",
  "valuesConverted": "{count} valores convertidos",
  "basedOn": "Baseado no tamanho da fonte raiz: {rootFontSize}px · Precisão: {precision} decimais",
  "copyValue": "Copiar valor",
  "desktop": "Desktop",
  "laptop": "Notebook",
  "ipad": "iPad",
  "iphone": "iPhone",
  "fourK": "4K",
  "width": "Largura",
  "height": "Altura",
  "descriptions": {
    "aeoDefinition": "O Conversor de unidades CSS é uma ferramenta online gratuita para converter entre px, rem, em, vw, vh, vmin e vmax. Conversão em lote de código CSS com tamanho de fonte raiz e dimensões de viewport personalizáveis. Funciona inteiramente no seu navegador.",
    "whatIsTitle": "O que é o Conversor de unidades CSS?",
    "whatIsP1": "O Conversor de unidades CSS permite converter instantaneamente entre unidades de comprimento CSS — px, rem, em, vw, vh, vmin e vmax. Configure o tamanho da fonte raiz, da fonte pai e as dimensões do viewport para resultados precisos.",
    "whatIsP2": "Cole código CSS para conversão em lote, ou use a tabela de referência para mapeamentos comuns de px para rem e px para vw.",
    "stepsTitle": "Como converter unidades CSS",
    "step1Title": "Digite um valor",
    "step1Text": "Digite um valor numérico e selecione a unidade de origem. Todos os valores equivalentes são calculados em tempo real.",
    "step2Title": "Converta CSS em lote",
    "step2Text": "Cole seu código CSS, escolha uma direção de conversão e obtenha a saída convertida com valores correspondentes destacados.",
    "step3Title": "Consulte a tabela de referência",
    "step3Text": "Use a aba de referência para buscas rápidas de conversões comuns de px→rem, px→em e px→vw.",
    "faq1Q": "Quando devo usar rem vs em?",
    "faq1A": "Use rem para tamanhos consistentes relativos ao tamanho da fonte raiz — ideal para margens, padding e layout. Use em para tipografia que deve escalar com seu elemento pai, como tamanhos de fonte aninhados em componentes.",
    "faq2Q": "Como funcionam as unidades de viewport (vw, vh)?",
    "faq2A": "1vw equivale a 1% da largura do viewport e 1vh equivale a 1% da altura. São úteis para layouts de largura ou altura total que se adaptam ao tamanho da janela do navegador.",
    "faq3Q": "Por que porcentagens (%) não estão incluídas?",
    "faq3A": "Porcentagens dependem do elemento contêiner e da propriedade CSS específica, então não há fator de conversão universal. Esta ferramenta suporta apenas unidades com bases de conversão fixas e previsíveis."
  }
}
```

- [ ] **Step 4: Create `public/locales/fr/cssunit.json`**

```json
{
  "converter": "Convertisseur",
  "batchConvert": "Conversion par lot",
  "reference": "Référence",
  "rootFontSize": "Taille de police racine",
  "parentFontSize": "Taille de police parente",
  "viewport": "Viewport",
  "precision": "Précision",
  "decimals": "décimales",
  "enterValue": "Entrez une valeur",
  "unit": "Unité",
  "result": "Résultat",
  "copy": "Copier",
  "sourceCss": "CSS source",
  "convertedCss": "CSS converti",
  "copyAll": "Tout copier",
  "clear": "Effacer",
  "valuesConverted": "{count} valeurs converties",
  "basedOn": "Basé sur la taille de police racine : {rootFontSize}px · Précision : {precision} décimales",
  "copyValue": "Copier la valeur",
  "desktop": "Bureau",
  "laptop": "Portable",
  "ipad": "iPad",
  "iphone": "iPhone",
  "fourK": "4K",
  "width": "Largeur",
  "height": "Hauteur",
  "descriptions": {
    "aeoDefinition": "Le Convertisseur d'unités CSS est un outil en ligne gratuit pour convertir entre px, rem, em, vw, vh, vmin et vmax. Conversion par lot de code CSS avec taille de police racine et dimensions de viewport personnalisables. Fonctionne entièrement dans votre navigateur.",
    "whatIsTitle": "Qu'est-ce que le Convertisseur d'unités CSS ?",
    "whatIsP1": "Le Convertisseur d'unités CSS vous permet de convertir instantanément entre les unités de longueur CSS — px, rem, em, vw, vh, vmin et vmax. Configurez la taille de police racine, la taille de police parente et les dimensions du viewport pour des résultats précis.",
    "whatIsP2": "Collez du code CSS pour une conversion par lot, ou utilisez la table de référence pour les correspondances courantes px vers rem et px vers vw.",
    "stepsTitle": "Comment convertir les unités CSS",
    "step1Title": "Entrez une valeur",
    "step1Text": "Saisissez une valeur numérique et sélectionnez l'unité source. Toutes les valeurs équivalentes sont calculées en temps réel.",
    "step2Title": "Convertissez du CSS par lot",
    "step2Text": "Collez votre code CSS, choisissez une direction de conversion et obtenez le résultat avec les valeurs correspondantes surlignées.",
    "step3Title": "Consultez la table de référence",
    "step3Text": "Utilisez l'onglet de référence pour rechercher rapidement les conversions courantes px→rem, px→em et px→vw.",
    "faq1Q": "Quand utiliser rem ou em ?",
    "faq1A": "Utilisez rem pour des tailles cohérentes relatives à la taille de police racine — idéal pour les marges, le padding et la mise en page. Utilisez em pour la typographie qui doit s'adapter à son élément parent, comme les tailles de police imbriquées dans les composants.",
    "faq2Q": "Comment fonctionnent les unités viewport (vw, vh) ?",
    "faq2A": "1vw correspond à 1% de la largeur du viewport et 1vh à 1% de sa hauteur. Elles sont utiles pour les mises en page pleine largeur ou pleine hauteur qui s'adaptent à la taille de la fenêtre du navigateur.",
    "faq3Q": "Pourquoi les pourcentages (%) ne sont-ils pas inclus ?",
    "faq3A": "Les pourcentages dépendent de l'élément conteneur et de la propriété CSS spécifique, il n'y a donc pas de facteur de conversion universel. Cet outil ne prend en charge que les unités avec des bases de conversion fixes et prévisibles."
  }
}
```

- [ ] **Step 5: Create `public/locales/de/cssunit.json`**

```json
{
  "converter": "Umrechner",
  "batchConvert": "Batch-Umrechnung",
  "reference": "Referenz",
  "rootFontSize": "Root-Schriftgröße",
  "parentFontSize": "Eltern-Schriftgröße",
  "viewport": "Viewport",
  "precision": "Genauigkeit",
  "decimals": "Nachkommastellen",
  "enterValue": "Wert eingeben",
  "unit": "Einheit",
  "result": "Ergebnis",
  "copy": "Kopieren",
  "sourceCss": "Quell-CSS",
  "convertedCss": "Konvertiertes CSS",
  "copyAll": "Alles kopieren",
  "clear": "Leeren",
  "valuesConverted": "{count} Werte umgerechnet",
  "basedOn": "Basierend auf Root-Schriftgröße: {rootFontSize}px · Genauigkeit: {precision} Nachkommastellen",
  "copyValue": "Wert kopieren",
  "desktop": "Desktop",
  "laptop": "Laptop",
  "ipad": "iPad",
  "iphone": "iPhone",
  "fourK": "4K",
  "width": "Breite",
  "height": "Höhe",
  "descriptions": {
    "aeoDefinition": "Der CSS-Einheitenumrechner ist ein kostenloses Online-Tool zur Umrechnung zwischen px, rem, em, vw, vh, vmin und vmax. Batch-Umrechnung von CSS-Code mit anpassbarer Root-Schriftgröße und Viewport-Abmessungen. Läuft vollständig im Browser.",
    "whatIsTitle": "Was ist der CSS-Einheitenumrechner?",
    "whatIsP1": "Der CSS-Einheitenumrechner ermöglicht die sofortige Umrechnung zwischen CSS-Längeneinheiten — px, rem, em, vw, vh, vmin und vmax. Legen Sie Root-Schriftgröße, Eltern-Schriftgröße und Viewport-Abmessungen für genaue Ergebnisse fest.",
    "whatIsP2": "Fügen Sie CSS-Code für die Batch-Umrechnung ein oder nutzen Sie die Referenztabelle für gängige px-zu-rem- und px-zu-vw-Zuordnungen.",
    "stepsTitle": "So rechnen Sie CSS-Einheiten um",
    "step1Title": "Wert eingeben",
    "step1Text": "Geben Sie einen numerischen Wert ein und wählen Sie die Quell-Einheit. Alle äquivalenten Werte werden in Echtzeit berechnet.",
    "step2Title": "CSS batch-umrechnen",
    "step2Text": "Fügen Sie Ihren CSS-Code ein, wählen Sie eine Umrechnungsrichtung und erhalten Sie die Ausgabe mit hervorgehobenen übereinstimmenden Werten.",
    "step3Title": "Referenztabelle prüfen",
    "step3Text": "Nutzen Sie die Referenz-Registerkarte für schnelle Nachschläge gängiger px→rem-, px→em- und px→vw-Umrechnungen.",
    "faq1Q": "Wann sollte ich rem vs em verwenden?",
    "faq1A": "Verwenden Sie rem für konsistente Größen relativ zur Root-Schriftgröße — ideal für Margins, Padding und Layout. Verwenden Sie em für Typografie, die mit ihrem Elternelement skalieren soll, wie verschachtelte Schriftgrößen in Komponenten.",
    "faq2Q": "Wie funktionieren Viewport-Einheiten (vw, vh)?",
    "faq2A": "1vw entspricht 1% der Viewport-Breite und 1vh entspricht 1% der Viewport-Höhe. Sie sind nützlich für Layouts mit voller Breite oder Höhe, die sich an die Browserfenstergröße anpassen.",
    "faq3Q": "Warum sind Prozent (%) nicht enthalten?",
    "faq3A": "Prozent hängen vom Containerelement und der spezifischen CSS-Eigenschaft ab, daher gibt es keinen universellen Umrechnungsfaktor. Dieses Tool unterstützt nur Einheiten mit festen, vorhersagbaren Umrechnungsbasen."
  }
}
```

- [ ] **Step 6: Create `public/locales/ru/cssunit.json`**

```json
{
  "converter": "Конвертер",
  "batchConvert": "Пакетная конвертация",
  "reference": "Справочная таблица",
  "rootFontSize": "Корневой размер шрифта",
  "parentFontSize": "Размер шрифта родителя",
  "viewport": "Viewport",
  "precision": "Точность",
  "decimals": "знаков",
  "enterValue": "Введите значение",
  "unit": "Единица",
  "result": "Результат",
  "copy": "Копировать",
  "sourceCss": "Исходный CSS",
  "convertedCss": "Результат конвертации",
  "copyAll": "Копировать всё",
  "clear": "Очистить",
  "valuesConverted": "{count} значений конвертировано",
  "basedOn": "На основе корневого размера шрифта: {rootFontSize}px · Точность: {precision} знаков",
  "copyValue": "Копировать значение",
  "desktop": "Десктоп",
  "laptop": "Ноутбук",
  "ipad": "iPad",
  "iphone": "iPhone",
  "fourK": "4K",
  "width": "Ширина",
  "height": "Высота",
  "descriptions": {
    "aeoDefinition": "Конвертер единиц CSS — бесплатный онлайн-инструмент для конвертации между px, rem, em, vw, vh, vmin и vmax. Пакетная конвертация CSS-кода с настраиваемым корневым размером шрифта и размерами viewport. Работает полностью в браузере.",
    "whatIsTitle": "Что такое конвертер единиц CSS?",
    "whatIsP1": "Конвертер единиц CSS позволяет мгновенно конвертировать между единицами длины CSS — px, rem, em, vw, vh, vmin и vmax. Настройте корневой размер шрифта, размер шрифта родителя и размеры viewport для точных результатов.",
    "whatIsP2": "Вставьте CSS-код для пакетной конвертации или используйте справочную таблицу для частых соответствий px→rem и px→vw.",
    "stepsTitle": "Как конвертировать единицы CSS",
    "step1Title": "Введите значение",
    "step1Text": "Введите числовое значение и выберите исходную единицу. Все эквивалентные значения вычисляются в реальном времени.",
    "step2Title": "Пакетная конвертация CSS",
    "step2Text": "Вставьте CSS-код, выберите направление конвертации и получите результат с подсвеченными совпадающими значениями.",
    "step3Title": "Проверьте справочную таблицу",
    "step3Text": "Используйте вкладку справки для быстрого поиска частых конвертаций px→rem, px→em и px→vw.",
    "faq1Q": "Когда использовать rem, а когда em?",
    "faq1A": "Используйте rem для согласованных размеров относительно корневого шрифта — идеально для отступов, padding и макета. Используйте em для типографики, которая должна масштабироваться относительно родительского элемента, например, вложенные размеры шрифта в компонентах.",
    "faq2Q": "Как работают единицы viewport (vw, vh)?",
    "faq2A": "1vw равен 1% ширины viewport, а 1vh — 1% высоты. Они полезны для макетов на полную ширину или высоту, адаптирующихся к размеру окна браузера.",
    "faq3Q": "Почему не включены проценты (%)?",
    "faq3A": "Проценты зависят от родительского элемента и конкретного CSS-свойства, поэтому универсального коэффициента конвертации не существует. Этот инструмент поддерживает только единицы с фиксированными, предсказуемыми базами конвертации."
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add public/locales/es/ public/locales/pt-BR/ public/locales/fr/ public/locales/de/ public/locales/ru/
git commit -m "feat(cssunit): add Latin-script i18n translations (es, pt-BR, fr, de, ru)"
```

---

### Task 6: Route Entry (page.tsx)

**Files:**

- Create: `app/[locale]/cssunit/page.tsx`

- [ ] **Step 1: Create the route entry file**

Create `app/[locale]/cssunit/page.tsx` following the numbase pattern:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import CssUnitPage from "./cssunit-page";

const PATH = "/cssunit";
const TOOL_KEY = "cssunit";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("cssunit.title"),
    description: t("cssunit.description"),
    ogImage: {
      title: t("cssunit.shortTitle"),
      emoji: tool.emoji,
      desc: t("cssunit.description"),
    },
  });
}

export default async function CssUnitRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "cssunit" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

  const faqCount = 3;
  const faqItems = Array.from({ length: faqCount }, (_, i) => {
    const qKey = `descriptions.faq${i + 1}Q`;
    return tx.has(qKey) ? { q: tx(qKey), a: tx(`descriptions.faq${i + 1}A`) } : null;
  }).filter((item): item is { q: string; a: string } => item !== null);

  const howToStepCount = 3;
  const howToSteps = Array.from({ length: howToStepCount }, (_, i) => {
    const nameKey = `descriptions.step${i + 1}Title`;
    return tx.has(nameKey)
      ? {
          name: tx(nameKey),
          text: tx.has(`descriptions.step${i + 1}Text`) ? tx(`descriptions.step${i + 1}Text`) : "",
        }
      : null;
  }).filter((step): step is { name: string; text: string } => step !== null);

  const schemas = buildToolSchemas({
    name: t("cssunit.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("cssunit.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems,
    howToSteps,
    sameAs: tool.sameAs,
  });

  return (
    <>
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
      <CssUnitPage />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/cssunit/page.tsx
git commit -m "feat(cssunit): add route entry with metadata and JSON-LD schemas"
```

---

### Task 7: Client Component (cssunit-page.tsx)

**Files:**

- Create: `app/[locale]/cssunit/cssunit-page.tsx`

This is the largest task. The component has:

1. **ConfigBar** — rootFontSize, parentFontSize, precision inputs
2. **ViewportSection** — width × height inputs + preset quick-select tags
3. **ConverterTab** — numeric input + unit dropdown + 7-row results table
4. **BatchTab** — direction selector + source/converted CSS textareas + stats
5. **ReferenceTab** — pair selector + reference table with copy buttons
6. **DescriptionSection** + **RelatedTools**

- [ ] **Step 1: Create the client component**

Create `app/[locale]/cssunit/cssunit-page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import { StyledInput } from "../../../components/ui/input";
import { StyledSelect } from "../../../components/ui/input";
import { StyledTextarea } from "../../../components/ui/textarea";
import { CopyButton } from "../../../components/ui/copy-btn";
import { NeonTabs } from "../../../components/ui/tabs";
import { showToast } from "../../../libs/toast";
import DescriptionSection from "../../../components/description-section";
import RelatedTools from "../../../components/related-tools";
import {
  type CSSUnit,
  type ConvertConfig,
  CSS_UNITS,
  VIEWPORT_PRESETS,
  PX_REFERENCE_VALUES,
  BATCH_DIRECTIONS,
  convert,
  convertCssCode,
} from "../../../libs/cssunit/main";

function ConfigBar({
  config,
  onChange,
}: {
  config: ConvertConfig;
  onChange: (config: ConvertConfig) => void;
}) {
  const t = useTranslations("cssunit");
  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[120px]">
        <label className="block text-xs text-fg-muted font-mono mb-1">
          {t("rootFontSize")} (px)
        </label>
        <StyledInput
          type="number"
          min={0}
          value={config.rootFontSize}
          onChange={(e) => onChange({ ...config, rootFontSize: Number(e.target.value) })}
          className="font-mono text-center"
        />
      </div>
      <div className="flex-1 min-w-[120px]">
        <label className="block text-xs text-fg-muted font-mono mb-1">
          {t("parentFontSize")} (px)
        </label>
        <StyledInput
          type="number"
          min={0}
          value={config.parentFontSize}
          onChange={(e) => onChange({ ...config, parentFontSize: Number(e.target.value) })}
          className="font-mono text-center"
        />
      </div>
      <div className="w-[100px]">
        <label className="block text-xs text-fg-muted font-mono mb-1">{t("precision")}</label>
        <StyledInput
          type="number"
          min={0}
          max={10}
          value={config.precision}
          onChange={(e) => onChange({ ...config, precision: Number(e.target.value) })}
          className="font-mono text-center"
        />
      </div>
    </div>
  );
}

function ViewportSection({
  viewportW,
  viewportH,
  onChange,
}: {
  viewportW: number;
  viewportH: number;
  onChange: (w: number, h: number) => void;
}) {
  const t = useTranslations("cssunit");
  const activePreset = VIEWPORT_PRESETS.findIndex(
    (p) => p.width === viewportW && p.height === viewportH
  );

  return (
    <div className="mt-4 p-3 rounded-lg border border-border-default bg-bg-surface">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[100px]">
          <label className="block text-xs text-fg-muted font-mono mb-1">{t("width")} (px)</label>
          <StyledInput
            type="number"
            min={1}
            value={viewportW}
            onChange={(e) => onChange(Number(e.target.value), viewportH)}
            className="font-mono text-center"
          />
        </div>
        <span className="text-fg-muted font-bold">×</span>
        <div className="flex-1 min-w-[100px]">
          <label className="block text-xs text-fg-muted font-mono mb-1">{t("height")} (px)</label>
          <StyledInput
            type="number"
            min={1}
            value={viewportH}
            onChange={(e) => onChange(viewportW, Number(e.target.value))}
            className="font-mono text-center"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {VIEWPORT_PRESETS.map((preset, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(preset.width, preset.height)}
            className={
              "px-2.5 py-1 rounded-full text-xs font-mono transition-colors cursor-pointer " +
              (activePreset === i
                ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40"
                : "bg-bg-elevated text-fg-secondary border border-border-default hover:border-accent-cyan/40")
            }
          >
            {t(preset.label)} {preset.width}×{preset.height}
          </button>
        ))}
      </div>
    </div>
  );
}

function ConverterTab({ config }: { config: ConvertConfig }) {
  const t = useTranslations("cssunit");
  const [inputValue, setInputValue] = useState("16");
  const [inputUnit, setInputUnit] = useState<CSSUnit>("px");

  const numValue = parseFloat(inputValue);
  const isValid = inputValue !== "" && !isNaN(numValue);

  const results = CSS_UNITS.map((unit) => {
    if (unit.key === inputUnit) {
      return { unit: unit.key, value: numValue, isOriginal: true };
    }
    if (!isValid) {
      return { unit: unit.key, value: null, isOriginal: false };
    }
    const converted = convert(numValue, inputUnit, unit.key, config);
    return { unit: unit.key, value: converted, isOriginal: false };
  });

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <StyledInput
            type="number"
            placeholder={t("enterValue")}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="text-lg font-mono font-bold text-center"
          />
        </div>
        <div className="w-[100px]">
          <StyledSelect
            value={inputUnit}
            onChange={(e) => setInputUnit(e.target.value as CSSUnit)}
            className="font-mono font-bold text-center"
          >
            {CSS_UNITS.map((u) => (
              <option key={u.key} value={u.key}>
                {u.label}
              </option>
            ))}
          </StyledSelect>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border-default overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-default bg-bg-elevated/40">
              <th className="py-2 px-4 text-fg-muted text-xs font-mono font-medium text-left whitespace-nowrap uppercase tracking-wider">
                {t("unit")}
              </th>
              <th className="py-2 px-4 text-fg-muted text-xs font-mono font-medium text-left whitespace-nowrap uppercase tracking-wider">
                {t("result")}
              </th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {results.map((row) => (
              <tr
                key={row.unit}
                className={
                  "border-b border-border-default last:border-b-0 " +
                  (row.isOriginal ? "bg-accent-cyan/5" : "hover:bg-bg-elevated/60")
                }
              >
                <td className="py-2.5 px-4 text-fg-secondary text-xs font-mono font-medium whitespace-nowrap">
                  <span className={row.isOriginal ? "text-accent-cyan" : ""}>{row.unit}</span>
                </td>
                <td className="py-2.5 px-4 font-mono text-sm">
                  {row.value !== null ? (
                    <span className={row.isOriginal ? "text-accent-cyan font-semibold" : ""}>
                      {row.value}
                    </span>
                  ) : (
                    <span className="text-fg-muted">—</span>
                  )}
                </td>
                <td className="py-2.5 px-1">
                  {row.value !== null && (
                    <CopyButton
                      getContent={() => `${row.value}${row.unit}`}
                      className="opacity-60 hover:opacity-100 transition-opacity"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BatchTab({ config }: { config: ConvertConfig }) {
  const t = useTranslations("cssunit");
  const [directionIdx, setDirectionIdx] = useState(0);
  const [sourceCode, setSourceCode] = useState("");

  const direction = BATCH_DIRECTIONS[directionIdx];
  const result = convertCssCode(sourceCode, direction.from, direction.to, config);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {BATCH_DIRECTIONS.map((d, i) => (
          <button
            key={d.key}
            type="button"
            onClick={() => setDirectionIdx(i)}
            className={
              "px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-colors cursor-pointer " +
              (directionIdx === i
                ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40"
                : "bg-bg-elevated text-fg-secondary border border-border-default hover:border-accent-cyan/40")
            }
          >
            {d.from} → {d.to}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-fg-muted font-mono uppercase tracking-wider">
              {t("sourceCss")}
            </span>
            {sourceCode && (
              <button
                type="button"
                onClick={() => setSourceCode("")}
                className="text-danger text-xs hover:text-danger/80 transition-colors cursor-pointer"
              >
                {t("clear")}
              </button>
            )}
          </div>
          <StyledTextarea
            rows={10}
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            className="font-mono text-sm"
            placeholder="font-size: 16px; margin: 8px; padding: 24px;"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-fg-muted font-mono uppercase tracking-wider">
              {t("convertedCss")}
            </span>
            {result.matchCount > 0 && <CopyButton getContent={() => result.code} />}
          </div>
          <div className="relative">
            <StyledTextarea
              rows={10}
              value={result.code}
              readOnly
              className="font-mono text-sm bg-bg-input"
            />
          </div>
        </div>
      </div>

      {sourceCode && (
        <p className="mt-2 text-xs text-fg-muted font-mono">
          {t("valuesConverted", { count: result.matchCount })}
        </p>
      )}
    </div>
  );
}

function ReferenceTab({ config }: { config: ConvertConfig }) {
  const t = useTranslations("cssunit");
  const [pairIdx, setPairIdx] = useState(0);

  const pairs = [
    { from: "px" as CSSUnit, to: "rem" as CSSUnit, label: "px → rem" },
    { from: "px" as CSSUnit, to: "em" as CSSUnit, label: "px → em" },
    { from: "px" as CSSUnit, to: "vw" as CSSUnit, label: "px → vw" },
  ];

  const pair = pairs[pairIdx];

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {pairs.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPairIdx(i)}
            className={
              "px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-colors cursor-pointer " +
              (pairIdx === i
                ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40"
                : "bg-bg-elevated text-fg-secondary border border-border-default hover:border-accent-cyan/40")
            }
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border-default overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-default bg-bg-elevated/40">
              <th className="py-2 px-4 text-fg-muted text-xs font-mono font-medium text-left whitespace-nowrap uppercase tracking-wider">
                {pair.from}
              </th>
              <th className="py-2 px-4 text-fg-muted text-xs font-mono font-medium text-left whitespace-nowrap uppercase tracking-wider">
                {pair.to}
              </th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {PX_REFERENCE_VALUES.map((px) => {
              const converted = convert(px, pair.from, pair.to, config);
              return (
                <tr
                  key={px}
                  className="border-b border-border-default last:border-b-0 hover:bg-bg-elevated/60"
                >
                  <td className="py-2.5 px-4 font-mono text-sm text-fg-secondary">
                    {px}
                    <span className="text-accent-cyan">{pair.from}</span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-sm">
                    {converted !== null ? (
                      <>
                        {converted}
                        <span className="text-accent-cyan">{pair.to}</span>
                      </>
                    ) : (
                      <span className="text-fg-muted">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-1">
                    {converted !== null && (
                      <CopyButton
                        getContent={() => `${converted}${pair.to}`}
                        className="opacity-60 hover:opacity-100 transition-opacity"
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-fg-muted font-mono">
        {t("basedOn", { rootFontSize: config.rootFontSize, precision: config.precision })}
      </p>
    </div>
  );
}

export default function CssUnitPage() {
  const t = useTranslations("tools");
  const tc = useTranslations("cssunit");
  const [config, setConfig] = useState<ConvertConfig>({
    rootFontSize: 16,
    parentFontSize: 16,
    viewportW: 1920,
    viewportH: 1080,
    precision: 4,
  });

  const handleViewportChange = (w: number, h: number) => {
    setConfig((prev) => ({ ...prev, viewportW: w, viewportH: h }));
  };

  const title = t("cssunit.shortTitle");

  return (
    <Layout
      title={title}
      categoryLabel={t("categories.encoding")}
      categorySlug="encoding-conversion"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <ConfigBar config={config} onChange={setConfig} />
        <ViewportSection
          viewportW={config.viewportW}
          viewportH={config.viewportH}
          onChange={handleViewportChange}
        />

        <div className="mt-6">
          <NeonTabs
            tabs={[
              {
                label: tc("converter"),
                content: <ConverterTab config={config} />,
              },
              {
                label: tc("batchConvert"),
                content: <BatchTab config={config} />,
              },
              {
                label: tc("reference"),
                content: <ReferenceTab config={config} />,
              },
            ]}
          />
        </div>

        <DescriptionSection namespace="cssunit" />
        <RelatedTools currentTool="cssunit" />
      </div>
    </Layout>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/cssunit/cssunit-page.tsx
git commit -m "feat(cssunit): add client component with converter, batch, and reference tabs"
```

---

### Task 8: Final Verification

- [ ] **Step 1: Run tests**

Run: `npx vitest run libs/cssunit`
Expected: All tests pass

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run lint**

Run: `npx eslint libs/cssunit/ app/[locale]/cssunit/`
Expected: No errors

- [ ] **Step 4: Verify dev server**

Run: `npm run dev` then visit `/cssunit`
Expected: Page renders with all 3 tabs, config bar, and viewport section
