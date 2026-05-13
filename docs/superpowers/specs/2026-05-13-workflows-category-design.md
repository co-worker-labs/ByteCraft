# Workflows Category — Design Spec

## Summary

Create a new "Workflows" category (`/workflows`) for the Recipe tool. Recipe is a data pipeline orchestration tool (CyberChef-style) that doesn't fit existing categories. This move improves semantic accuracy in navigation and SEO.

## Naming

| Property             | Value                          |
| -------------------- | ------------------------------ |
| ToolCategory key     | `"workflows"`                  |
| CATEGORY_SLUGS entry | `workflows: "workflows"`       |
| Display name (i18n)  | Workflows                      |
| URL path             | `/workflows`                   |
| Header breadcrumb    | `OmniKit · Workflows · Recipe` |

## Position

Last category in `TOOL_CATEGORIES`, after `reference`.

Order: text → encoding → security → generators → visual → reference → **workflows**

## Changes

### 1. `libs/tools.ts` — Core registry

- Add `"workflows"` to `ToolCategory` union type
- Add `workflows: "workflows"` to `CATEGORY_SLUGS`
- Add `{ key: "workflows", tools: ["recipe"] }` as last entry in `TOOL_CATEGORIES`
- Remove `"recipe"` from `generators` tools array

### 2. `app/[locale]/workflows/page.tsx` — New category page

Follow the same pattern as `text-processing/page.tsx`:

- Import `CategoryPage`, `buildCategorySchema`, `generatePageMeta`
- `CATEGORY_KEY = "workflows"`, `PATH = "/workflows"`
- Render `CategoryPage` + JSON-LD schemas

### 3. `app/[locale]/recipe/recipe-page.tsx` — Header breadcrumb

Add `categoryLabel` and `categorySlug` props to `<Layout>`:

```tsx
<Layout title={t("recipe.shortTitle")} categoryLabel={t("categories.workflows")} categorySlug="workflows">
```

### 4. i18n — 10 locales

#### `public/locales/{locale}/tools.json`

Add to `categories` object:

```json
"workflows": "Workflows"
```

#### `public/locales/{locale}/categories.json`

Add new top-level `workflows` key with: `title`, `shortTitle`, `description`, `intro`, FAQ items.

English source of truth:

```json
"workflows": {
  "title": "Data Pipeline & Workflow Tools - Recipe Builder",
  "shortTitle": "Workflows",
  "description": "Free online data pipeline and workflow tools for developers. Chain multiple text, encoding, and crypto operations into recipes. 100% client-side.",
  "intro": "1 workflow tool that lets you chain multiple operations into a data processing pipeline. Build recipes by composing text processing, encoding, hashing, and other steps — CyberChef-style. All data stays in your browser.",
  "faq1Q": "What is the Recipe tool?",
  "faq1A": "Recipe is a data pipeline builder that lets you chain multiple operations together. For example, you can Base64-encode text, then hash the result, then convert to uppercase — all in one flow.",
  "faq2Q": "What operations are available in Recipe?",
  "faq2A": "Recipe supports text transformations, encoding/decoding (Base64, URL, HTML), hashing (MD5, SHA family), encryption, JSON/YAML conversion, regex operations, and more. New steps are added regularly."
}
```

#### `public/locales/{locale}/home.json`

Add category description:

```json
"catWorkflows": "Chain multiple operations into data processing pipelines and recipes."
```

> **Note:** Generators category text (intro, faq1A) already correctly describes 4 tools (UUID, Cron, Unix Timestamp, QR Code) and never counted Recipe. No generators text changes needed.

### 5. Auto-propagated (no changes needed)

- **Sitemap** (`app/sitemap.ts`): reads `TOOL_CATEGORIES` dynamically
- **JSON-LD** (`components/json-ld.tsx`): reads from tool/category config
- **Homepage** (`home-page.tsx`): iterates `TOOL_CATEGORIES` dynamically
- **ToolsDrawer** (`components/tools-drawer.tsx`): iterates `TOOL_CATEGORIES` dynamically
- **Recipe `page.tsx`**: already finds category dynamically via `TOOL_CATEGORIES.find()`

## Scope

- Structural/category changes only
- No changes to Recipe tool functionality
- No new UI components
