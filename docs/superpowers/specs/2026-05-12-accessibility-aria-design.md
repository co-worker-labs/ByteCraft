# Accessibility (aria-\*) Improvement Design

**Date**: 2026-05-12
**Status**: Approved
**Scope**: High + Medium priority a11y fixes across shared components, layout/navigation components, ESLint rules, and automated testing

## Context

OmniKit's a11y foundation is decent (7/10): Headless UI provides automatic a11y for Dialog/Tab/Menu/Disclosure, semantic HTML is widely used, decorative icons are properly `aria-hidden`. However, systematic issues exist in form label association, dynamic content notifications, and keyboard accessibility.

This design addresses all high and medium priority a11y issues with a three-layer approach: component fixes, lint enforcement, and automated testing.

## Design Decisions

| Decision                  | Choice                                      | Rationale                                                                              |
| ------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------- |
| Label association pattern | `htmlFor` + `useId()`                       | Native browser behavior (click label → focus input), no custom wiring                  |
| sr-only utility           | Tailwind built-in `sr-only` / `not-sr-only` | No custom CSS needed, framework-native                                                 |
| Toast notification role   | Container `aria-live="polite"`              | Container-level live region avoids duplicate announcements when multiple toasts appear |
| axe-core integration      | `jest-axe` with Vitest + jsdom              | Project already has `@testing-library/react` and `jsdom` installed                     |

## Section 1: Shared UI Component Fixes

### 1.1 `components/ui/input.tsx` — Label Association

**Problem**: `<label>` and `<input>` are sibling elements with no association. Screen readers cannot announce the input's purpose.

**Fix**:

- Use `React.useId()` to generate a unique id
- Apply `<label htmlFor={id}>` + `<input id={id}>`
- If an external `id` prop is provided, use it instead of generating one
- Apply to all three components: `StyledInput`, `StyledTextarea`, `StyledSelect`

### 1.1b `components/ui/line-numbered-textarea.tsx` — Label Association

**Problem**: Same as 1.1 — `<label>` and `<textarea>` are sibling elements with no `htmlFor`/`id` association.

**Fix**:

- Same pattern as 1.1: `useId()` + `<label htmlFor={id}>` + `<textarea id={id}>`
- If an external `id` prop is provided via `{...rest}`, use it instead of generating one

### 1.2 `components/ui/toast.tsx` — Notification Accessibility

**Problem**: No aria attributes. Screen readers cannot perceive toast notifications.

**Fix**:

- Toast **container** (the fixed-position wrapper `div`): add `aria-live="polite"` + `aria-atomic="false"`
  - Using container-level `aria-live` instead of per-toast `role="status"` avoids duplicate announcements when multiple toasts appear simultaneously
- Each individual toast `div`: no extra role needed (the live region on the container auto-announces new children)
- Close button: add `aria-label` (i18n via `tc("close")`)

### 1.3 `components/ui/copy-btn.tsx` — Icon Button Label

**Problem**: Icon mode has only `title="Copy"` (hardcoded English). No `aria-label`.

**Fix**:

- Icon mode: add `aria-label` (i18n via `tc("copy")`)
- Keep `title` as visual tooltip

### 1.4 `components/ui/card.tsx` — Clickable Card Keyboard Support

**Problem**: When `onClick` exists, `<div onClick={...}>` has no keyboard interaction.

**Fix**:

- When `onClick` prop is present, automatically add:
  - `role="button"`
  - `tabIndex={0}`
  - `onKeyDown` handler for Enter and Space keys
- Non-clickable cards remain plain `<div>` with no extra attributes

### 1.5 `components/color/color-picker.tsx` — Color Picker Group Label

**Problem**: Third-party `HexAlphaColorPicker` from `react-colorful` has no accessible name. Screen readers cannot identify its purpose.

**Fix**:

- Wrap `<HexAlphaColorPicker>` with `<div role="group" aria-label={t("converter")}>`
- Uses existing i18n key `color.converter.converter` — no new keys needed
- Low cost, no component replacement needed

## Section 2: Layout & Navigation Component Fixes

### 2.1 `components/layout.tsx` — Skip to Main Content

**Problem**: No skip link. Keyboard users must tab through entire navigation.

**Fix**:

- Add `<a href="#main-content" className="sr-only focus:not-sr-only ...">` before `<Header>`
- Add `id="main-content"` to `<main>`
- Skip link text uses i18n (`tc("skipToMain")`)
- Focused style follows project theme (`bg-bg-elevated text-fg-primary` etc.)

### 2.1b `components/header.tsx` — Navigation Landmark Label

**Problem**: Header `<nav>` has no `aria-label`. When multiple `<nav>` elements exist (header + footer), screen readers cannot distinguish them.

**Fix**:

- Add `aria-label={t("nav.mainNavigation")}` to the header `<nav>`

### 2.2 `components/floating-toolbar.tsx` — Toolbar Role

**Problem**: Button group has no `role="toolbar"`.

**Fix**:

- Container: add `role="toolbar"` + `aria-label` (i18n)

### 2.3 `components/language_switcher.tsx` — i18n aria-label

**Problem**: `aria-label="Language"` hardcoded in English.

**Fix**:

- Change to `aria-label={t("language")}` via i18n

### 2.4 `components/privacy-banner.tsx` — Decorative Icon

**Problem**: Decorative lock icon missing `aria-hidden`.

**Fix**:

- Lock icon: add `aria-hidden="true"`
- No `role` needed — this is a static informational banner, not a dynamic notification. Adding `role="status"` would cause screen readers to announce it on page load, creating noise.

### 2.5 `components/tools-drawer.tsx` — Search Input Label

**Problem**: Search input has only `placeholder`, no `aria-label`.

**Fix**:

- Add `aria-label` (i18n, e.g., "Search tools")

### 2.6 `components/httpclient/key-value-editor.tsx` — Autocomplete + Delete Buttons

**Problem**: Autocomplete list has no ARIA roles. Key input has no `aria-expanded` to indicate dropdown state. Delete buttons (Trash2 icon) lack `aria-label`.

**Fix**:

- Autocomplete dropdown container: add `role="listbox"`
- Each suggestion button: add `role="option"`
- Key `<input>`: add `aria-expanded={showSuggestions}` + `aria-autocomplete="list"`
- Delete buttons: add `aria-label` (i18n)

## Section 3: ESLint a11y Rule Enforcement

### 3.1 Extend `eslint.config.mjs`

Add `jsx-a11y` rule overrides beyond what `eslint-config-next/core-web-vitals` provides:

```js
{
  files: ["**/*.{js,jsx,ts,tsx}"],
  rules: {
    "jsx-a11y/label-has-associated-control": "error",
    "jsx-a11y/interactive-supports-focus": "error",
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/no-static-element-interactions": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/role-has-required-aria-props": "error",
  }
}
```

**Process**:

1. Add rules to config
2. Run lint to assess impact on existing code
3. Fix genuine issues; for unavoidable false positives, add targeted `eslint-disable-next-line` comments with justification

## Section 4: axe-core Automated Testing

### 4.1 Dependencies

Add `jest-axe` (compatible with Vitest). Project already has `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, and `vitest`.

### 4.2 Test Configuration

Create `vitest.config.a11y.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["components/**/*.a11y.test.tsx"],
    environment: "jsdom",
    setupFiles: ["./tests/a11y-setup.ts"],
  },
});
```

Add npm script: `"test:a11y": "vitest run --config vitest.config.a11y.ts"`

### 4.3 Test File Structure

One a11y test file per shared UI component, co-located:

```
components/ui/
├── toast.tsx
├── toast.a11y.test.tsx
├── copy-btn.tsx
├── copy-btn.a11y.test.tsx
├── input.tsx
├── input.a11y.test.tsx
└── card.tsx
    └── card.a11y.test.tsx
```

### 4.4 Test Content

Each test renders component in different states and asserts no axe violations:

```tsx
import { axe } from "jest-axe";
import { render } from "@testing-library/react";
import { ToastProvider } from "./toast";

it("has no a11y violations (success toast)", async () => {
  const { container } = render(
    <ToastProvider>
      <div />
    </ToastProvider>
  );
  // Trigger toast via context, or render a pre-populated toast state
  expect(await axe(container)).toHaveNoViolations();
});
```

**Note**: `toast.tsx` exports `ToastProvider` (a context provider with internal toast rendering), not a standalone `Toast` component. Tests need to render `ToastProvider` and trigger toasts via `useToastContext()`.

**Covered states**:

- **Toast**: success / error / info types
- **CopyButton**: icon mode / with label mode
- **Input**: with label / without label / disabled
- **Card**: clickable / non-clickable

### 4.5 Excluded from Testing

- Headless UI wrappers (Tabs, Dropdown, Accordion) — Headless UI guarantees a11y
- Pure display components (Badge) — no interaction, no a11y risk

## i18n Keys Required

### New keys (need to be added to all 10 locales)

| Key                  | Namespace | English Value          | Purpose                                                                                                        |
| -------------------- | --------- | ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| `skipToMain`         | `common`  | "Skip to main content" | Skip link text                                                                                                 |
| `floatingToolbar`    | `common`  | "Floating toolbar"     | Toolbar `aria-label`                                                                                           |
| `removeItem`         | `common`  | "Remove item"          | Key-value editor delete button `aria-label`                                                                    |
| `searchTools`        | `common`  | "Search tools"         | Tools drawer search input `aria-label` (separate from `nav.searchTools` which includes keyboard shortcut text) |
| `nav.mainNavigation` | `common`  | "Main navigation"      | Header `<nav>` `aria-label`                                                                                    |

### Existing keys (reused, no changes needed)

| Key        | Namespace | Used For                          |
| ---------- | --------- | --------------------------------- |
| `close`    | `common`  | Toast close button `aria-label`   |
| `language` | `common`  | Language switcher `aria-label`    |
| `copy`     | `common`  | CopyButton icon mode `aria-label` |

## Files Modified (Summary)

| File                                         | Change Type                                                         |
| -------------------------------------------- | ------------------------------------------------------------------- |
| `components/ui/input.tsx`                    | Add `useId` + `htmlFor` association                                 |
| `components/ui/line-numbered-textarea.tsx`   | Add `useId` + `htmlFor` association                                 |
| `components/ui/toast.tsx`                    | Add container `aria-live="polite"`, close button `aria-label`       |
| `components/ui/copy-btn.tsx`                 | Add `aria-label` for icon mode                                      |
| `components/ui/card.tsx`                     | Add keyboard interaction when clickable                             |
| `components/color/color-picker.tsx`          | Wrap `HexAlphaColorPicker` with `role="group"` + `aria-label`       |
| `components/layout.tsx`                      | Add skip link + `id="main-content"` on main                         |
| `components/header.tsx`                      | Add `aria-label` to `<nav>`                                         |
| `components/floating-toolbar.tsx`            | Add `role="toolbar"` + `aria-label`                                 |
| `components/language_switcher.tsx`           | i18n the `aria-label`                                               |
| `components/privacy-banner.tsx`              | Add lock icon `aria-hidden`                                         |
| `components/tools-drawer.tsx`                | Add search input `aria-label`                                       |
| `components/httpclient/key-value-editor.tsx` | Add `role="listbox"/"option"`, `aria-expanded`, delete `aria-label` |
| `eslint.config.mjs`                          | Add jsx-a11y rule overrides                                         |
| `vitest.config.a11y.ts`                      | New file — a11y test config                                         |
| `tests/a11y-setup.ts`                        | New file — test setup                                               |
| `components/ui/toast.a11y.test.tsx`          | New file                                                            |
| `components/ui/copy-btn.a11y.test.tsx`       | New file                                                            |
| `components/ui/input.a11y.test.tsx`          | New file                                                            |
| `components/ui/card.a11y.test.tsx`           | New file                                                            |
| `package.json`                               | Add `jest-axe` dependency + `test:a11y` script                      |
| `public/locales/*/common.json`               | Add new i18n keys (10 locales)                                      |

## Out of Scope

- 8 pages with zero aria attributes (low priority, page-specific)
- `react-colorful` internal a11y improvements (third-party library internals, beyond our `role="group"` wrapper)
- `sr-only` / visually-hidden CSS class definition (using Tailwind built-in)
- Full WCAG 2.1 AA audit
- Color contrast fixes (separate concern)
