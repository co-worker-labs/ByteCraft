# Recipe Page i18n Fix

## Problem

The Recipe page (`/recipe`) has multiple untranslated/hardcoded English strings and is missing a DescriptionSection that all other tools have.

## Issues

### 1. Step description not translated in StepPicker

**File:** `components/recipe/step-picker.tsx:127`

`def.description` reads the hardcoded English string from the step definition object. The translated `desc` field exists in all `recipe.json` files under `steps.<id>.desc` but is never used.

**Fix:** Replace `def.description` with `t("steps.${def.id}.desc")`.

### 2. Hardcoded toast messages in RecipePanel

**File:** `components/recipe/recipe-panel.tsx:162-179`

Three toast messages are hardcoded English:

- `"Please enter a name"` (line 162)
- `"No steps to save"` (line 165)
- `"Recipe saved"` (line 179)

**Fix:** Add keys `toast.enterName`, `toast.noSteps`, `toast.saved` to all `recipe.json` files. Replace hardcoded strings with `t(...)` calls.

### 3. Hardcoded search placeholder in StepPicker

**File:** `components/recipe/step-picker.tsx:80`

`"Search steps..."` is hardcoded.

**Fix:** Add key `searchSteps` to all `recipe.json` files. Replace with `t("searchSteps")`.

### 4. formatRelativeTime not localized

**File:** `components/recipe/recipe-panel.tsx:35-46`

The `formatRelativeTime` function returns English strings like `"5s ago"`, `"3m ago"`. The httpclient tool already has a localized `timeAgo` function using `ago.*` keys.

**Fix:** Add `ago.seconds`, `ago.minutes`, `ago.hours`, `ago.days` keys to all `recipe.json` files. Modify `formatRelativeTime` to accept a translation function parameter, following the httpclient pattern.

### 5. Missing DescriptionSection

The recipe page has no description/FAQ section. All other tool pages include `<DescriptionSection namespace="<tool>" />`.

**Fix:**

- Add `descriptions` block to all 10 `recipe.json` files with: `aeoDefinition`, `whatIsTitle`, `whatIsP1-P2`, `useCasesTitle`, `useCasesP1-P3` (plain mode, no `useCasesDesc{i}`), `stepsTitle`, `step1-3Title`/`step1-3Text`, `faq1-3Q`/`faq1-3A`.
- Import and render `<DescriptionSection namespace="recipe" />` in `recipe-page.tsx`.

### 6. `<select>` option labels not translated

**File:** `components/recipe/step-card.tsx:212`

`opt.label` renders the hardcoded English string from step definitions in `libs/recipe/steps/*.ts`. Example hardcoded labels: `"PNG"` / `"JPEG"` / `"WebP"` (visual.ts), `"None"` / `"By Percent"` / `"Custom"` (visual.ts), `"Yes"` / `"No"` (text.ts), `"Low (L)"` / `"Medium (M)"` (generator.ts), `"SQL"` / `"MySQL"` / `"PostgreSQL"` (format.ts).

The `recipe.json` already has `options.yes` / `options.no` keys but they are never used.

**Fix:** Add option label keys to all `recipe.json` files under `options` namespace (e.g., `options.png`, `options.jpeg`, `options.webp`, `options.none`, `options.byPercent`, `options.custom`, `options.lowL`, `options.mediumM`, etc.). In `step-card.tsx`, use `t.has()` guard for each `opt.label`, falling back to `opt.label` when no translation key exists (for format names like "PNG" that are universal). Use a naming convention: `options.<paramId>.<value>`.

### 7. Download filenames hardcoded

**File:** `components/recipe/recipe-panel.tsx:209,217`

`"recipe-output.png"` and `"recipe-output.txt"` are hardcoded download filenames.

**Fix:** Add keys `downloadImageName` and `downloadTextName` to all `recipe.json` files. Replace hardcoded strings with `t(...)` calls.

## Files Modified

| File                                                                  | Change                                                               |
| --------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `components/recipe/step-picker.tsx`                                   | Use translated step desc, localize search placeholder                |
| `components/recipe/recipe-panel.tsx`                                  | Localize toast messages, localize `formatRelativeTime`, filenames    |
| `components/recipe/step-card.tsx`                                     | Localize select option labels via `t.has()` guard                    |
| `app/[locale]/recipe/recipe-page.tsx`                                 | Add `DescriptionSection` component                                   |
| `public/locales/{en,zh-CN,zh-TW,ja,ko,es,pt-BR,fr,de,ru}/recipe.json` | Add missing i18n keys (toast, ago, descriptions, options, filenames) |

## No Architecture Changes

This is a pure i18n fix. No new components, no API changes, no structural refactoring.
