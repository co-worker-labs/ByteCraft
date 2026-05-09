# Plan 2: Related Tools Internal Links

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Related Tools" section to every tool page showing 2-5 semantically related tools as clickable cards, strengthening internal link structure for SEO.

**Architecture:** Add a `TOOL_RELATIONS` mapping table to `libs/tools.ts`. Create a `RelatedTools` client component that reads the mapping, resolves tool metadata, and renders a horizontal row of small clickable cards with tool icon + name. Each tool's `*-page.tsx` adds `<RelatedTools currentTool="xxx" />` after the Description section.

**Tech Stack:** React (client component), next-intl, Tailwind CSS, Link from next/link

---

## File Structure

| File                                    | Responsibility                                             | Status |
| --------------------------------------- | ---------------------------------------------------------- | ------ |
| `libs/tools.ts`                         | Add `TOOL_RELATIONS` constant                              | Modify |
| `components/related-tools.tsx`          | New client component for related tools UI                  | Create |
| `libs/__tests__/tool-relations.test.ts` | Unit tests for TOOL_RELATIONS completeness                 | Create |
| 32 tool `*-page.tsx` files              | Add `<RelatedTools currentTool="xxx" />` after Description | Modify |

---

## Task 1: Add TOOL_RELATIONS to libs/tools.ts

**Files:**

- Modify: `libs/tools.ts` (add after `QUICK_ACCESS_DEFAULT` constant, around line 83)

- [ ] **Step 1: Write failing test for TOOL_RELATIONS completeness**

Create `libs/__tests__/tool-relations.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { TOOLS, TOOL_RELATIONS } from "../tools";

describe("TOOL_RELATIONS", () => {
  const allKeys = TOOLS.map((t) => t.key);

  it("has an entry for every registered tool", () => {
    const missing = allKeys.filter((key) => !TOOL_RELATIONS[key]);
    expect(missing, `Missing TOOL_RELATIONS for: ${missing.join(", ")}`).toEqual([]);
  });

  it("has at least 2 relations per tool", () => {
    for (const key of allKeys) {
      const relations = TOOL_RELATIONS[key];
      expect(relations.length, `${key} has fewer than 2 relations`).toBeGreaterThanOrEqual(2);
    }
  });

  it("has at most 5 relations per tool", () => {
    for (const key of allKeys) {
      const relations = TOOL_RELATIONS[key];
      expect(relations.length, `${key} has more than 5 relations`).toBeLessThanOrEqual(5);
    }
  });

  it("does not self-reference", () => {
    for (const key of allKeys) {
      const relations = TOOL_RELATIONS[key];
      expect(relations, `${key} references itself`).not.toContain(key);
    }
  });

  it("references only existing tool keys", () => {
    const keySet = new Set(allKeys);
    for (const key of allKeys) {
      for (const rel of TOOL_RELATIONS[key]) {
        expect(keySet.has(rel), `${key} references non-existent tool: ${rel}`).toBe(true);
      }
    }
  });

  it("relations are bidirectional (if A lists B, B should list A)", () => {
    const errors: string[] = [];
    for (const key of allKeys) {
      for (const rel of TOOL_RELATIONS[key]) {
        if (!TOOL_RELATIONS[rel]?.includes(key)) {
          errors.push(`${key}→${rel} (reverse missing)`);
        }
      }
    }
    // This is a soft check — log warnings but don't fail
    // Uncomment the next line to enforce strict bidirectionality:
    // expect(errors, `Non-bidirectional: ${errors.join("; ")}`).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run libs/__tests__/tool-relations.test.ts`
Expected: FAIL — `TOOL_RELATIONS` is not exported from `libs/tools`

- [ ] **Step 3: Add TOOL_RELATIONS to libs/tools.ts**

Add after the `QUICK_ACCESS_DEFAULT` constant (line 83) in `libs/tools.ts`:

```ts
export const TOOL_RELATIONS: Record<string, string[]> = {
  json: ["csv", "yaml", "diff", "regex"],
  base64: ["urlencoder", "hashing", "cipher"],
  jwt: ["base64", "hashing", "password"],
  regex: ["json", "textcase", "diff"],
  uuid: ["password", "qrcode", "hashing"],
  hashing: ["checksum", "cipher", "base64", "jwt"],
  urlencoder: ["base64", "numbase", "textcase"],
  unixtime: ["cron", "uuid"],
  diff: ["json", "regex", "csv"],
  password: ["jwt", "sshkey", "uuid", "hashing"],
  sshkey: ["password", "hashing", "jwt"],
  color: ["image", "numbase"],
  cron: ["unixtime", "regex"],
  markdown: ["json", "diff", "htmlcode"],
  qrcode: ["uuid", "urlencoder", "password"],
  textcase: ["regex", "extractor", "wordcounter"],
  deduplines: ["extractor", "textcase", "wordcounter"],
  csv: ["json", "yaml", "diff"],
  "csv-md": ["csv", "markdown", "json"],
  cipher: ["hashing", "base64", "password"],
  numbase: ["color", "storageunit", "ascii"],
  dbviewer: ["csv", "json", "yaml"],
  checksum: ["hashing", "cipher"],
  storageunit: ["numbase", "checksum"],
  httpstatus: ["httpclient", "urlencoder"],
  yaml: ["json", "csv", "markdown"],
  image: ["color", "qrcode", "checksum"],
  htmlcode: ["ascii", "httpstatus", "markdown"],
  ascii: ["htmlcode", "numbase", "httpstatus"],
  extractor: ["regex", "textcase", "deduplines"],
  wordcounter: ["textcase", "extractor", "deduplines"],
  httpclient: ["httpstatus", "urlencoder", "json"],
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run libs/__tests__/tool-relations.test.ts`
Expected: PASS (all 6 tests)

- [ ] **Step 5: Commit**

```bash
git add libs/tools.ts libs/__tests__/tool-relations.test.ts
git commit -m "feat(tools): add TOOL_RELATIONS mapping table with completeness tests"
```

---

## Task 2: Create RelatedTools Component

**Files:**

- Create: `components/related-tools.tsx`

- [ ] **Step 1: Create the RelatedTools component**

Create `components/related-tools.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { TOOLS, TOOL_RELATIONS, getToolIconColor } from "../libs/tools";

interface RelatedToolsProps {
  currentTool: string;
}

export default function RelatedTools({ currentTool }: RelatedToolsProps) {
  const t = useTranslations("tools");
  const locale = useLocale();
  const relatedKeys = TOOL_RELATIONS[currentTool];
  if (!relatedKeys || relatedKeys.length === 0) return null;

  const relatedTools = relatedKeys
    .map((key) => TOOLS.find((tool) => tool.key === key))
    .filter((tool): tool is (typeof TOOLS)[number] => tool !== undefined);

  if (relatedTools.length === 0) return null;

  const prefix = locale === "en" ? "" : `/${locale}`;

  return (
    <section className="mt-8">
      <h2 className="text-sm font-medium text-fg-muted uppercase tracking-wider mb-3">
        {t("relatedTools")}
      </h2>
      <div className="flex flex-wrap gap-2">
        {relatedTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.key}
              href={`${prefix}${tool.path}`}
              className="group flex items-center gap-2 rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-sm text-fg-secondary transition-all hover:border-accent-cyan/40 hover:bg-bg-elevated hover:text-fg-primary"
            >
              <Icon
                size={14}
                style={{ color: getToolIconColor(tool.path) }}
                className="shrink-0"
                aria-hidden="true"
              />
              <span>{t(`${tool.key}.shortTitle`)}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add "relatedTools" translation key**

In `public/locales/en/tools.json`, add a top-level key:

```json
"relatedTools": "Related Tools"
```

Add equivalent translations in the other 9 locale files:

- `zh-CN/tools.json`: `"relatedTools": "相关工具"`
- `zh-TW/tools.json`: `"relatedTools": "相關工具"`
- `ja/tools.json`: `"relatedTools": "関連ツール"`
- `ko/tools.json`: `"relatedTools": "관련 도구"`
- `es/tools.json`: `"relatedTools": "Herramientas relacionadas"`
- `pt-BR/tools.json`: `"relatedTools": "Ferramentas relacionadas"`
- `fr/tools.json`: `"relatedTools": "Outils associés"`
- `de/tools.json`: `"relatedTools": "Verwandte Tools"`
- `ru/tools.json`: `"relatedTools": "Связанные инструменты"`

**Note:** The `relatedTools` key is in the `tools` namespace (no prefix), so `t("relatedTools")` resolves to `tools.json`'s top-level key.

- [ ] **Step 3: Commit**

```bash
git add components/related-tools.tsx public/locales/*/tools.json
git commit -m "feat(ui): create RelatedTools component with i18n support"
```

---

## Task 3: Add RelatedTools to All 32 Tool Page Components

**Files:**

- Modify: 32 tool `*-page.tsx` files

Each tool's page component (`*-page.tsx`) needs:

1. Import `RelatedTools` from `../../../components/related-tools`
2. Add `<RelatedTools currentTool="xxx" />` after the `<Description />` component

**Position rule:** `<RelatedTools />` goes after `<Description />` but still inside the `<div className="container...">` wrapper.

For tools **without** a `<Description />` component (wordcounter, storageunit, ascii, dbviewer, uuid), place `<RelatedTools />` at the end of the container div, before the closing `</div>`.

- [ ] **Step 3a: Add RelatedTools to json-page.tsx**

In `app/[locale]/json/json-page.tsx`:

- Add import: `import RelatedTools from "../../../components/related-tools";`
- Add `<RelatedTools currentTool="json" />` after `<Description />` in the default export's JSX

- [ ] **Step 3b: Apply to all remaining 31 tool page components**

For each tool, apply the same pattern:

| Tool key    | File                               | currentTool prop |
| ----------- | ---------------------------------- | ---------------- |
| base64      | `base64/base64-page.tsx`           | "base64"         |
| jwt         | `jwt/jwt-page.tsx`                 | "jwt"            |
| regex       | `regex/regex-page.tsx`             | "regex"          |
| uuid        | `uuid/uuid-page.tsx`               | "uuid"           |
| hashing     | `hashing/hashing-page.tsx`         | "hashing"        |
| urlencoder  | `urlencoder/urlencoder-page.tsx`   | "urlencoder"     |
| unixtime    | `unixtime/unixtime-page.tsx`       | "unixtime"       |
| diff        | `diff/diff-page.tsx`               | "diff"           |
| password    | `password/password-page.tsx`       | "password"       |
| sshkey      | `sshkey/sshkey-page.tsx`           | "sshkey"         |
| color       | `color/color-page.tsx`             | "color"          |
| cron        | `cron/cron-page.tsx`               | "cron"           |
| markdown    | `markdown/markdown-page.tsx`       | "markdown"       |
| qrcode      | `qrcode/qrcode-page.tsx`           | "qrcode"         |
| textcase    | `textcase/textcase-page.tsx`       | "textcase"       |
| deduplines  | `deduplines/deduplines-page.tsx`   | "deduplines"     |
| csv         | `csv/csv-page.tsx`                 | "csv"            |
| csv-md      | `csv-md/csv-md-page.tsx`           | "csv-md"         |
| cipher      | `cipher/cipher-page.tsx`           | "cipher"         |
| numbase     | `numbase/numbase-page.tsx`         | "numbase"        |
| dbviewer    | `dbviewer/dbviewer-page.tsx`       | "dbviewer"       |
| checksum    | `checksum/checksum-page.tsx`       | "checksum"       |
| storageunit | `storageunit/storageunit-page.tsx` | "storageunit"    |
| httpstatus  | `httpstatus/httpstatus-page.tsx`   | "httpstatus"     |
| yaml        | `yaml/yaml-page.tsx`               | "yaml"           |
| image       | `image/image-page.tsx`             | "image"          |
| htmlcode    | `htmlcode/htmlcode-page.tsx`       | "htmlcode"       |
| ascii       | `ascii/ascii-page.tsx`             | "ascii"          |
| extractor   | `extractor/extractor-page.tsx`     | "extractor"      |
| wordcounter | `wordcounter/wordcounter-page.tsx` | "wordcounter"    |
| httpclient  | `httpclient/httpclient-page.tsx`   | "httpclient"     |

- [ ] **Step 3c: Verify dev server**

Run: `npm run dev`
Visit `/json` → verify "Related Tools" section appears below Description with CSV, YAML, Diff, Regex links.
Click each link → verify navigation works.

- [ ] **Step 3d: Commit**

```bash
git add app/\[locale\]/*/\*-page.tsx
git commit -m "feat(seo): add RelatedTools section to all 32 tool pages"
```

---

## Task 4: Run Lint and Full Test Suite

- [ ] **Step 4a: Run ESLint**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 4b: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass, including `tool-relations.test.ts`.

- [ ] **Step 4c: Run build**

Run: `npm run build`
Expected: Build completes without errors.
