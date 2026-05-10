# Plan 5: Bundle Optimization

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce initial bundle size for tool pages by converting static imports of large dependencies (`@uiw/react-json-view`, `json5`, `rc-slider`) to dynamic imports, and replacing static Prism.js language pack imports with on-demand loading.

**Architecture:** Use Next.js `dynamic()` for React components (`JsonView`, `Slider`) and async dynamic `import()` for libraries (`json5`). Replace 12 static Prism.js language imports with a lazy `loadPrismLanguage()` function. Lucide icons are kept as-is (they're in the global shared chunk via `ToolsDrawer` — no optimization possible at the icon level).

**Tech Stack:** Next.js `dynamic()`, dynamic `import()`, Prism.js

---

## File Structure

| File                                          | Responsibility                                    | Status |
| --------------------------------------------- | ------------------------------------------------- | ------ |
| `app/[locale]/json/json-page.tsx`             | Dynamic import `@uiw/react-json-view` + `json5`   | Modify |
| `app/[locale]/jwt/jwt-page.tsx`               | Dynamic import `@uiw/react-json-view`             | Modify |
| `app/[locale]/httpclient/httpclient-page.tsx` | Dynamic import `@uiw/react-json-view`             | Modify |
| `app/[locale]/yaml/yaml-page.tsx`             | Dynamic import `json5`                            | Modify |
| `app/[locale]/password/password-page.tsx`     | Dynamic import `rc-slider`                        | Modify |
| `app/[locale]/uuid/uuid-page.tsx`             | Dynamic import `rc-slider`                        | Modify |
| `app/[locale]/image/image-page.tsx`           | Dynamic import `rc-slider`                        | Modify |
| `app/[locale]/qrcode/qrcode-page.tsx`         | Dynamic import `rc-slider`                        | Modify |
| `libs/markdown/highlight.ts`                  | Replace static imports with `loadPrismLanguage()` | Modify |

---

## Task 1: Dynamic Import for @uiw/react-json-view

**Files:**

- Modify: `json/json-page.tsx`, `jwt/jwt-page.tsx`, `httpclient/httpclient-page.tsx`

Current import pattern:

```tsx
import JsonView from "@uiw/react-json-view";
```

Target pattern:

```tsx
import dynamic from "next/dynamic";

const JsonView = dynamic(() => import("@uiw/react-json-view"), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse bg-bg-input rounded" />,
});
```

- [ ] **Step 1a: Migrate json-page.tsx**

In `app/[locale]/json/json-page.tsx`:

1. Add `import dynamic from "next/dynamic";` at the top
2. Replace `import JsonView from "@uiw/react-json-view";` with:
   ```tsx
   const JsonView = dynamic(() => import("@uiw/react-json-view"), {
     ssr: false,
     loading: () => <div className="h-48 animate-pulse bg-bg-input rounded" />,
   });
   ```
3. No other changes — `JsonView` is used the same way in JSX

- [ ] **Step 1b: Migrate jwt-page.tsx**

Same pattern as Step 1a for `app/[locale]/jwt/jwt-page.tsx`.

- [ ] **Step 1c: Migrate httpclient-page.tsx**

Same pattern for `app/[locale]/httpclient/httpclient-page.tsx`.

**Note:** `httpclient-page.tsx` is the file that also uses `WebApplicationJsonLd` — but by this point, Plan 1 has already migrated that to `buildToolSchemas` in `page.tsx`. The `JsonView` import here is independent.

- [ ] **Step 1d: Verify dev server renders JsonView correctly**

Run: `npm run dev`
Visit `/json` → paste some JSON → verify the formatted view renders (may show skeleton briefly).
Visit `/jwt` → decode a token → verify JsonView renders.

- [ ] **Step 1e: Commit**

```bash
git add app/\[locale\]/json/json-page.tsx app/\[locale\]/jwt/jwt-page.tsx app/\[locale\]/httpclient/httpclient-page.tsx
git commit -m "perf: dynamic import @uiw/react-json-view in json, jwt, httpclient"
```

---

## Task 2: Dynamic Import for json5

**Files:**

- Modify: `json/json-page.tsx`, `yaml/yaml-page.tsx`

Current import pattern:

```tsx
import json5 from "json5";
// Used as: json5.parse(input)
// Used as: json5.stringify(obj)
```

Target pattern — use async dynamic import:

```tsx
async function parseJson5(input: string) {
  const { default: JSON5 } = await import("json5");
  return JSON5.parse(input);
}

async function stringifyJson5(obj: unknown) {
  const { default: JSON5 } = await import("json5");
  return JSON5.stringify(obj);
}
```

**Important:** Review how `json5` is used in each file. If it's only used in event handlers or async functions, converting to dynamic import is straightforward. If it's used at module top-level, the approach needs adjustment.

- [ ] **Step 2a: Analyze json5 usage in json-page.tsx**

Read `json/json-page.tsx` to find all `json5.parse()` and `json5.stringify()` call sites. These should be inside event handlers (e.g., format button click) or async functions.

Convert to:

```tsx
// Remove: import json5 from "json5";
// Add:
const parseJson5 = async (input: string) => {
  const { default: JSON5 } = await import("json5");
  return JSON5.parse(input);
};

const stringifyJson5 = async (input: unknown, space?: string | number) => {
  const { default: JSON5 } = await import("json5");
  return JSON5.stringify(input, null, space);
};
```

Update all call sites from `json5.parse(x)` to `await parseJson5(x)` and `json5.stringify(x, null, 2)` to `await stringifyJson5(x, 2)`.

**Note:** If any calling function is not already `async`, add `async` keyword.

- [ ] **Step 2b: Analyze json5 usage in yaml-page.tsx**

Same approach for `yaml/yaml-page.tsx`. Find all `json5` call sites and convert them.

- [ ] **Step 2c: Verify**

Run: `npm run dev`
Visit `/json` → paste JSON5 content → format → verify correct parsing.
Visit `/yaml` → paste YAML → convert to JSON → verify json5 usage works.

- [ ] **Step 2d: Commit**

```bash
git add app/\[locale\]/json/json-page.tsx app/\[locale\]/yaml/yaml-page.tsx
git commit -m "perf: dynamic import json5 in json and yaml tools"
```

---

## Task 3: Dynamic Import for rc-slider

**Files:**

- Modify: `password/password-page.tsx`
- Modify: `uuid/uuid-page.tsx`
- Modify: `image/image-page.tsx`
- Modify: `qrcode/qrcode-page.tsx`

Current import pattern:

```tsx
import "rc-slider/assets/index.css";
import Slider from "rc-slider";
```

Target pattern:

```tsx
import dynamic from "next/dynamic";

const Slider = dynamic(() => import("rc-slider"), {
  ssr: false,
  loading: () => <div className="h-6 w-full animate-pulse bg-bg-input rounded" />,
});
```

**Important:** The CSS import `import "rc-slider/assets/index.css"` must remain as a static import — it's needed for slider styling.

- [ ] **Step 3a: Migrate password-page.tsx**

In `app/[locale]/password/password-page.tsx`:

1. Add `import dynamic from "next/dynamic";`
2. Keep `import "rc-slider/assets/index.css";`
3. Replace `import Slider from "rc-slider";` with dynamic import
4. Verify `Slider` usage in JSX works the same way (props don't change)

- [ ] **Step 3b: Migrate uuid-page.tsx**

Same pattern for `app/[locale]/uuid/uuid-page.tsx`.

- [ ] **Step 3c: Migrate image-page.tsx**

Same pattern for `app/[locale]/image/image-page.tsx`.

- [ ] **Step 3d: Migrate qrcode-page.tsx**

Same pattern for `app/[locale]/qrcode/qrcode-page.tsx`.

- [ ] **Step 3e: Verify**

Run: `npm run dev`
Visit `/password` → verify slider renders and works for password length.
Visit `/uuid` → verify slider works for UUID count.
Visit `/image` → verify slider works for resize quality.
Visit `/qrcode` → verify slider works for size/quality.

- [ ] **Step 3f: Commit**

```bash
git add app/\[locale\]/password/password-page.tsx app/\[locale\]/uuid/uuid-page.tsx app/\[locale\]/image/image-page.tsx app/\[locale\]/qrcode/qrcode-page.tsx
git commit -m "perf: dynamic import rc-slider in password, uuid, image, qrcode"
```

---

## Task 4: On-Demand Prism.js Language Loading

**Files:**

- Modify: `libs/markdown/highlight.ts`

Current state — 12 static imports:

```ts
import Prism from "prismjs";

// Core (no-ops):
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";

// Extra:
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
```

Target — lazy loading with core langs kept static:

```ts
import Prism from "prismjs";

import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";

const EXTRA_LANGS = ["typescript", "python", "bash", "json", "sql", "yaml", "go", "rust"];

const loadedLangs = new Set<string>();

export async function loadPrismLanguage(lang: string): Promise<void> {
  const resolved = LANGUAGE_ALIASES[lang] ?? lang;
  if (loadedLangs.has(resolved) || Prism.languages[resolved]) return;
  try {
    await import(`prismjs/components/prism-${resolved}`);
    loadedLangs.add(resolved);
  } catch {
    // Language not available, fallback to plain text
  }
}

export async function ensureLanguagesLoaded(): Promise<void> {
  await Promise.all(EXTRA_LANGS.map((lang) => loadPrismLanguage(lang)));
}
```

**Important:** The `resolveLanguage()` function and `LANGUAGE_ALIASES` constant stay unchanged.

- [ ] **Step 4a: Update highlight.ts**

In `libs/markdown/highlight.ts`:

1. Keep `import Prism from "prismjs";`
2. Keep the 4 core language imports (markup, css, clike, javascript)
3. Remove the 8 extra language static imports
4. Add the `EXTRA_LANGS`, `loadedLangs`, `loadPrismLanguage`, and `ensureLanguagesLoaded` code above

- [ ] **Step 4b: Update render.ts to use lazy loading**

In `libs/markdown/render.ts`, update the highlight call to ensure languages are loaded before highlighting:

Find where `Prism.highlight()` is called. Change the approach:

1. Import `loadPrismLanguage` from `./highlight`
2. Before calling `Prism.highlight()`, call `await loadPrismLanguage(resolvedLang)`
3. This requires the `highlight` function to become async

If `render.ts`'s highlighting function is synchronous and called from a synchronous context (like a `markdown-it` rule), the approach needs to be:

**Option A (simpler):** Pre-load all extra languages on first render. Add an `initHighlight()` async function that the Markdown component calls once:

```ts
// In the markdown page component:
useEffect(() => {
  ensureLanguagesLoaded();
}, []);
```

**Option B (true lazy):** Make the highlight function async. This requires the markdown-it rendering pipeline to be async, which may be complex.

**Recommended:** Use Option A — call `ensureLanguagesLoaded()` once on component mount. The 8 language packs will load in a single parallel `Promise.all` on first visit to `/markdown`, rather than being in the initial page bundle.

- [ ] **Step 4c: Update markdown-page.tsx**

In `app/[locale]/markdown/markdown-page.tsx`:

1. Import `ensureLanguagesLoaded` from `../../../libs/markdown/highlight`
2. Add `useEffect(() => { ensureLanguagesLoaded(); }, []);` to trigger loading on mount

```tsx
import { ensureLanguagesLoaded } from "../../../libs/markdown/highlight";

// Inside the component:
useEffect(() => {
  ensureLanguagesLoaded();
}, []);
```

- [ ] **Step 4d: Verify**

Run: `npm run dev`
Visit `/markdown` → type a code block with `typescript`, `python`, `go`, etc. → verify syntax highlighting works.
Check network tab → verify language packs load on demand (not in initial bundle).

- [ ] **Step 4e: Commit**

```bash
git add libs/markdown/highlight.ts libs/markdown/render.ts app/\[locale\]/markdown/markdown-page.tsx
git commit -m "perf: on-demand Prism.js language loading for Markdown tool"
```

---

## Task 5: Measurement and Verification

- [ ] **Step 5a: Run build and compare bundle sizes**

Run: `npm run build`

Review the build output:

- Check the per-route bundle sizes
- Verify that `@uiw/react-json-view`, `json5`, and `rc-slider` are no longer in the initial bundle for their respective routes
- Verify Prism.js language packs are not in the initial `/markdown` route bundle

- [ ] **Step 5b: Run ESLint**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 5c: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 5d: Functional verification**

Run: `npm run dev`
Verify each affected tool works correctly:

| Tool          | What to verify                                                       |
| ------------- | -------------------------------------------------------------------- |
| `/json`       | JsonView renders, JSON5 parsing works, formatting/minification works |
| `/jwt`        | JsonView renders in decoded payload                                  |
| `/httpclient` | JsonView renders in response body                                    |
| `/yaml`       | YAML→JSON conversion works (uses json5)                              |
| `/password`   | Password length slider works                                         |
| `/uuid`       | UUID count slider works                                              |
| `/image`      | Resize quality slider works                                          |
| `/qrcode`     | Size/quality slider works                                            |
| `/markdown`   | Code syntax highlighting works for all languages                     |

- [ ] **Step 5e: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: address bundle optimization issues found during verification"
```
