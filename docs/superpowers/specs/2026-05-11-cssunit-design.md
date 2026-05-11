# CSS Unit Converter — Design Spec

## Overview

A browser-based CSS unit conversion tool supporting px, rem, em, vw, vh. Single input with full results table, CSS code batch conversion, and a reference lookup table. All computation runs client-side.

**Route**: `/cssunit`
**Category**: `encoding` (alongside storageunit, numbase)
**Icon**: `Ruler` (lucide-react)
**Emoji**: `📐`

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

- **Input row**: numeric input + unit dropdown (px/rem/em/vw/vh)
- **Results table**: 5 rows, one per unit, each with Copy button
- Input unit's row shows the original value; other rows show converted values
- All conversions happen on every keystroke (no submit button)

### Tab 2: Batch Convert

- **Direction selector**: pill-style tabs — `px → rem` | `rem → px` | `px → vw`
- **Source CSS**: textarea, paste CSS code. Matched values highlighted with cyan background.
- **Converted CSS**: read-only textarea, replaced values shown in cyan. "Copy All" button.
- **Stats**: "N values converted" below the output
- Uses global precision setting

#### Batch conversion rules

- Only replaces values with explicit unit suffix (e.g. `16px`, `1.5rem`)
- `0` (no unit) is NOT replaced
- Negative values ARE converted (e.g. `-8px` → `-0.5rem`)
- Decimal values supported (e.g. `1.5px` → `0.0938rem`)
- Property names and non-numeric content untouched

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
├── page.tsx              # Route entry (metadata + JSON-LD)
└── cssunit-page.tsx      # Client component (3 tabs + config)

utils/cssunit.ts           # Unit definitions, conversion functions, presets, reference values
```

### Exports from `utils/cssunit.ts`

| Export                                   | Type                         | Purpose                                               |
| ---------------------------------------- | ---------------------------- | ----------------------------------------------------- |
| `CSSUnit`                                | type                         | `'px' \| 'rem' \| 'em' \| 'vw' \| 'vh'`               |
| `CSS_UNITS`                              | `CSSUnitMeta[]`              | Unit metadata (key, label)                            |
| `VIEWPORT_PRESETS`                       | `{ label, width, height }[]` | Quick-select viewport sizes                           |
| `PX_REFERENCE_VALUES`                    | `number[]`                   | Reference table px values                             |
| `BATCH_DIRECTIONS`                       | `string[]`                   | `['px→rem', 'rem→px', 'px→vw']`                       |
| `convert(value, from, to, config)`       | function                     | Core unit conversion                                  |
| `convertCssCode(code, from, to, config)` | function                     | Batch CSS replacement, returns `{ code, matchCount }` |

### Conversion formulas

All conversions go through px as intermediate:

| From → To | Formula                  |
| --------- | ------------------------ |
| px → rem  | `px / rootFontSize`      |
| rem → px  | `rem * rootFontSize`     |
| px → em   | `px / parentFontSize`    |
| em → px   | `em * parentFontSize`    |
| px → vw   | `(px / viewportW) * 100` |
| vw → px   | `(vw / 100) * viewportW` |
| px → vh   | `(px / viewportH) * 100` |
| vh → px   | `(vh / 100) * viewportH` |

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
├── direction: 'px→rem' | 'rem→px' | 'px→vw'
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
| viewportW or viewportH = 0    | vw/vh rows show "—"                              |
| rootFontSize = 0              | rem rows show "—"                                |
| parentFontSize = 0            | em rows show "—"                                 |
| Negative input                | Allowed (CSS supports negative values)           |
| Batch: no matches             | Output shows original code, "0 values converted" |
| Batch: `0` without unit       | Not replaced                                     |
| Batch: decimal values (1.5px) | Converted normally                               |

---

## Tool Registration

In `libs/tools.ts`:

```ts
// TOOL_CATEGORIES → encoding section, add "cssunit"
// TOOL_RELATIONS → cssunit: ["storageunit", "numbase", "color"]
// TOOLS array → { key: "cssunit", path: "/cssunit", icon: Ruler, emoji: "📐" }
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

### `public/locales/en/cssunit.json` keys

- Tab labels: `converter`, `batchConvert`, `reference`
- Config: `rootFontSize`, `parentFontSize`, `viewport`, `precision`, `decimals`
- Converter: `enterValue`, `unit`, `result`, `copy`
- Batch: `sourceCss`, `convertedCss`, `copyAll`, `clear`, `valuesConverted`
- Reference: `basedOn`, `copyValue`
- Viewport presets: `desktop`, `laptop`, `ipad`, `iphone`, `fourK`

---

## Testing

Test file: `utils/cssunit/__tests__/cssunit.test.ts`

Coverage:

- `convert()` — every direction (px↔rem, px↔em, px↔vw, px↔vh, rem→vw cross-unit, etc.)
- Zero division guards
- Negative values
- Precision rounding
- `convertCssCode()` — replacement accuracy, `0` not replaced, negative values, decimal values, no-match passthrough
