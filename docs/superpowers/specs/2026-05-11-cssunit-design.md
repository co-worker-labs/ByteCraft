# CSS Unit Converter — Design Spec

## Overview

A browser-based CSS unit conversion tool supporting px, rem, em, vw, vh, vmin, vmax. Single input with full results table, CSS code batch conversion, and a reference lookup table. All computation runs client-side.

**Route**: `/cssunit`
**Category**: `encoding` (alongside storageunit, numbase)
**Icon**: `Ruler` (lucide-react)
**Emoji**: `📐`
**sameAs**: `["https://www.w3.org/TR/css-values-4/"]`

---

## UI Structure

Three tabs: **Converter** | **Batch Convert** | **Reference**

### Global Config Bar (shared across tabs)

Horizontal bar at the top of the page:

| Field            | Default    | Controls                 |
| ---------------- | ---------- | ------------------------ |
| Root font-size   | 16 px      | rem conversion base      |
| Parent font-size | 16 px      | em conversion base       |
| Precision        | 4 decimals | rounding for all results |

### Viewport Section (shared across tabs)

Grouped card below config bar — input row with quick-select tags:

- **Input row**: Width × Height (px), always editable
- **Quick tags**: `1920×1080` | `1440×900` | `1024×768` | `390×844` | `3840×2160`
- Active tag highlighted with accent-cyan, click fills both inputs
- User can still type custom values directly

Preset list:

| Label   | Width | Height |
| ------- | ----- | ------ |
| Desktop | 1920  | 1080   |
| Laptop  | 1440  | 900    |
| iPad    | 1024  | 768    |
| iPhone  | 390   | 844    |
| 4K      | 3840  | 2160   |

### Tab 1: Converter

- **Input row**: numeric input + unit dropdown (px/rem/em/vw/vh/vmin/vmax)
- **Results table**: 7 rows, one per unit, each with Copy button
- Input unit's row shows the original value; other rows show converted values
- All conversions happen on every keystroke (no submit button)

### Tab 2: Batch Convert

- **Direction selector**: pill-style tabs — `px → rem` | `rem → px` | `px → em` | `em → px` | `px → vw` | `px → vh`
- **Source CSS**: textarea, paste CSS code. Matched values highlighted with cyan background.
- **Converted CSS**: read-only textarea, replaced values shown in cyan. "Copy All" button.
- **Stats**: "N values converted" below the output
- Uses global precision and viewport settings

#### Batch conversion rules

- Only replaces values with explicit unit suffix (e.g. `16px`, `1.5rem`)
- Regex pattern: `(-?\d+\.?\d*)(px|rem|em|vw|vh)\b` — matches a signed decimal number followed by a known CSS unit at a word boundary
- `0` (no unit) is NOT replaced
- Negative values ARE converted (e.g. `-8px` → `-0.5rem`)
- Decimal values supported (e.g. `1.5px` → `0.0938rem`)
- Property names and non-numeric content untouched
- **`calc()` expressions**: values inside `calc()` ARE matched and replaced individually (e.g. `calc(16px + 2vw)` → `calc(1rem + 2vw)` when direction is `px → rem`). The regex matches numeric values regardless of surrounding context.

### Tab 3: Reference

- **Pair selector**: pill-style tabs — `px → rem` | `px → em` | `px → vw`
- **Table**: two columns (source unit / target unit), each row has Copy button
- Copy copies the target value with unit suffix (e.g. `1.5rem`)
- Footer note: "Based on root font-size: 16px · Precision: 4 decimals"

Reference px values: `1, 2, 4, 8, 12, 14, 16, 20, 24, 32, 48, 64, 96, 128`

These cover Tailwind spacing scale and common design system values.

---

## Architecture

### File structure

```
app/[locale]/cssunit/
├── page.tsx              # Route entry (generateMetadata + JSON-LD schemas)
└── cssunit-page.tsx      # Client component (3 tabs + config + description + related tools)

libs/cssunit/
├── main.ts               # Unit definitions, conversion functions, presets, reference values
└── __tests__/
    └── cssunit.test.ts   # Unit tests
```

### `page.tsx` structure

Follows the same pattern as `app/[locale]/storageunit/page.tsx`:

1. `generateMetadata()` — calls `generatePageMeta()` with locale, path, title, description, ogImage (emoji `📐`)
2. Default export renders JSON-LD schemas via `buildToolSchemas()` then the client component
3. JSON-LD schemas: WebApplication, BreadcrumbList, HowTo (3 steps), FAQ (3 items)
4. How-to steps and FAQ items loaded from `cssunit` namespace: `descriptions.step{N}Title/Text`, `descriptions.faq{N}Q/A`
5. `aeoDefinition` used for schema description if available

### `cssunit-page.tsx` structure

```
Layout (title, categoryLabel, categorySlug)
├── ConfigBar          — rootFontSize, parentFontSize, precision
├── ViewportSection    — width × height + presets
├── Tabs (NeonTabs)    — Converter | Batch Convert | Reference
├── DescriptionSection — namespace="cssunit", SEO content
└── RelatedTools       — currentTool="cssunit"
```

### Exports from `libs/cssunit/main.ts`

| Export                                   | Type                         | Purpose                                                     |
| ---------------------------------------- | ---------------------------- | ----------------------------------------------------------- |
| `CSSUnit`                                | type                         | `'px' \| 'rem' \| 'em' \| 'vw' \| 'vh' \| 'vmin' \| 'vmax'` |
| `CSS_UNITS`                              | `CSSUnitMeta[]`              | Unit metadata (key, label)                                  |
| `VIEWPORT_PRESETS`                       | `{ label, width, height }[]` | Quick-select viewport sizes                                 |
| `PX_REFERENCE_VALUES`                    | `number[]`                   | Reference table px values                                   |
| `BATCH_DIRECTIONS`                       | `{ key, from, to }[]`        | `[{key:'px-rem', from:'px', to:'rem'}, ...]` — 6 directions |
| `convert(value, from, to, config)`       | function                     | Core unit conversion                                        |
| `convertCssCode(code, from, to, config)` | function                     | Batch CSS replacement, returns `{ code, matchCount }`       |

### Conversion formulas

All conversions go through px as intermediate:

| From → To | Formula                                         |
| --------- | ----------------------------------------------- |
| px → rem  | `px / rootFontSize`                             |
| rem → px  | `rem * rootFontSize`                            |
| px → em   | `px / parentFontSize`                           |
| em → px   | `em * parentFontSize`                           |
| px → vw   | `(px / viewportW) * 100`                        |
| vw → px   | `(vw / 100) * viewportW`                        |
| px → vh   | `(px / viewportH) * 100`                        |
| vh → px   | `(vh / 100) * viewportH`                        |
| px → vmin | `(px / Math.min(viewportW, viewportH)) * 100`   |
| vmin → px | `(vmin / 100) * Math.min(viewportW, viewportH)` |
| px → vmax | `(px / Math.max(viewportW, viewportH)) * 100`   |
| vmax → px | `(vmax / 100) * Math.max(viewportW, viewportH)` |

Cross-unit (e.g. rem → vw): `rem → px → vw` via two-step conversion.

Config type:

```ts
interface ConvertConfig {
  rootFontSize: number; // default: 16
  parentFontSize: number; // default: 16
  viewportW: number; // default: 1920
  viewportH: number; // default: 1080
  precision: number; // default: 4
}
```

---

## State Management

All state in component `useState`, React Compiler auto-memoizes. No external state library.

```
ConfigState (top-level, passed as props to tab components)
├── rootFontSize: number (16)
├── parentFontSize: number (16)
├── viewportW: number (1920)
├── viewportH: number (1080)
└── precision: number (4)

ConverterTab
├── inputValue: string
└── inputUnit: CSSUnit

BatchTab
├── direction: string (key from BATCH_DIRECTIONS)
└── sourceCode: string

ReferenceTab
└── pair: 'px→rem' | 'px→em' | 'px→vw'
```

All results are derived computations — no cached/stored results.

---

## Edge Cases & Error Handling

| Scenario                      | Behavior                                         |
| ----------------------------- | ------------------------------------------------ |
| Empty / non-numeric input     | Results table shows empty                        |
| viewportW or viewportH = 0    | vw/vh/vmin/vmax rows show "—"                    |
| rootFontSize = 0              | rem rows show "—"                                |
| parentFontSize = 0            | em rows show "—"                                 |
| Negative input                | Allowed (CSS supports negative values)           |
| Batch: no matches             | Output shows original code, "0 values converted" |
| Batch: `0` without unit       | Not replaced                                     |
| Batch: decimal values (1.5px) | Converted normally                               |
| Batch: `calc()` expressions   | Values inside calc() are replaced individually   |

---

## Excluded Units

The following CSS units are intentionally excluded:

- **`%` (percentage)**: No fixed conversion base — depends on the element's containing block or parent, which varies per property. Cannot produce correct results without knowing the specific rendering context.
- **`ch`, `ex`, `lh`, `rlh`, `cap`, `ic`**: Font-relative units that depend on the actual rendered font metrics, not just a configurable number.
- **`cm`, `mm`, `in`, `pt`, `pc`, `Q`**: Absolute physical units. Rarely used in modern web development; conversion is trivial (1in = 96px per CSS spec).

---

## Tool Registration

In `libs/tools.ts`:

```ts
// TOOL_CATEGORIES → encoding.tools array, add "cssunit"
// TOOL_RELATIONS → cssunit: ["storageunit", "numbase", "color"]
// Also add backlinks:
//   color.relations → append "cssunit"
//   storageunit.relations → append "cssunit"
// TOOLS array → {
//   key: "cssunit",
//   path: "/cssunit",
//   icon: Ruler,
//   emoji: "📐",
//   sameAs: ["https://www.w3.org/TR/css-values-4/"]
// }
```

In `vitest.config.ts`:

```ts
// Add to test.include array:
"libs/cssunit/**/*.test.ts",
```

---

## i18n

**Namespace**: `cssunit`

### `public/locales/en/tools.json` addition

```json
"cssunit": {
  "title": "CSS Unit Converter - px to rem, em, vw, vh",
  "shortTitle": "CSS Unit Converter",
  "description": "Convert between CSS units (px, rem, em, vw, vh) with customizable base values. Batch convert CSS code and reference lookup table."
}
```

### CJK `searchTerms` (`public/locales/{zh-CN,zh-TW,ja,ko}/tools.json`)

| Locale | searchTerms                                        |
| ------ | -------------------------------------------------- |
| zh-CN  | `cssdanweizhuanhqi csdwzhq rem em xiangying`       |
| zh-TW  | `cssdanweizhuanhqi csdwzhq rem em xiangying`       |
| ja     | `cssunit tanibengou rem em responsive`             |
| ko     | `cssdangwibyeonhwan cssdwbh rem em bandeunghyeong` |

Token rationale:

- `cssdanweizhuanhqi` / `csdwzhq`: full pinyin + initials of "CSS单位转换器"
- `rem`, `em`: high-frequency English terms in CJK CSS workflows
- `xiangying`: "响应" (responsive) — unique to CSS viewport units context

### `public/locales/en/cssunit.json` keys

- Tab labels: `converter`, `batchConvert`, `reference`
- Config: `rootFontSize`, `parentFontSize`, `viewport`, `precision`, `decimals`
- Converter: `enterValue`, `unit`, `result`, `copy`
- Batch: `sourceCss`, `convertedCss`, `copyAll`, `clear`, `valuesConverted`
- Reference: `basedOn`, `copyValue`
- Viewport presets: `desktop`, `laptop`, `ipad`, `iphone`, `fourK`
- **Description/SEO keys** (under `descriptions` object):
  - `aeoDefinition`: AEO-optimized one-liner for JSON-LD
  - `whatIsTitle`, `whatIsP1`, `whatIsP2`: "What is" section
  - `stepsTitle`, `step1Title`/`step1Text`, `step2Title`/`step2Text`, `step3Title`/`step3Text`: How-to steps
  - `faq1Q`/`faq1A`, `faq2Q`/`faq2A`, `faq3Q`/`faq3A`: FAQ items

---

## Testing

Test file: `libs/cssunit/__tests__/cssunit.test.ts`
Vitest config: add `"libs/cssunit/**/*.test.ts"` to `vitest.config.ts` include array.

Coverage:

- `convert()` — every direction (px↔rem, px↔em, px↔vw, px↔vh, px↔vmin, px↔vmax, rem→vw cross-unit, etc.)
- Zero division guards
- Negative values
- Precision rounding
- `convertCssCode()` — replacement accuracy, `0` not replaced, negative values, decimal values, no-match passthrough, calc() expression handling
