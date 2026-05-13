# Recipe System — Part 5: Tool Page Integration ("Send to Recipe")

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-step. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Send to Recipe" button to tool pages that have a corresponding recipe step, allowing users to send the tool's current output to the Recipe page as a pre-configured step.

**Architecture:** A `TOOL_STEP_MAP` maps tool paths to step IDs (or functions that inspect tool state). A `SendToRecipe` component reads tool state, resolves the step ID, writes a draft to localStorage, and navigates to `/recipe`. The Recipe page consumes the draft on load (already implemented in Part 4).

**Tech Stack:** React, next-intl, localStorage, next/navigation

**Depends on:** Part 1-4 (engine, steps, i18n, UI)

**Produces:** "Send to Recipe" button on 17 tool pages.

---

## File Structure

| Action | File                                   | Responsibility                    |
| ------ | -------------------------------------- | --------------------------------- |
| Create | `libs/recipe/tool-step-map.ts`         | Maps tool paths → recipe step IDs |
| Create | `components/recipe/send-to-recipe.tsx` | "Send to Recipe" button component |
| Modify | 17 tool `*-page.tsx` files             | Add `<SendToRecipe />` button     |

---

### Task 1: Tool Step Map

**Files:**

- Create: `libs/recipe/tool-step-map.ts`

- [ ] **Step 1: Write the tool-step-map**

```ts
type StepMapping = string | ((toolState: Record<string, unknown>) => string);

export const TOOL_STEP_MAP: Record<string, StepMapping> = {
  "/base64": (state) => (state.mode === "decode" ? "base64-decode" : "base64-encode"),
  "/urlencoder": (state) => {
    const mode = state.mode as string;
    if (mode === "full")
      return state.direction === "decode" ? "url-decode-full" : "url-encode-full";
    return state.direction === "decode" ? "url-decode-component" : "url-encode-component";
  },
  "/json": "json-format",
  "/hashing": (state) => {
    const algo = (state.algorithm as string) || "sha256";
    const stepId = `hash-${algo === "sha-1" ? "sha1" : algo === "sha-512" ? "sha512" : algo === "md5" ? "md5" : "sha256"}`;
    return stepId;
  },
  "/textcase": (state) => {
    const caseMap: Record<string, string> = {
      camel: "text-camel",
      pascal: "text-pascal",
      snake: "text-snake",
      kebab: "text-kebab",
      upper: "text-upper",
      lower: "text-lower",
    };
    return caseMap[(state.case as string) || "camel"] || "text-camel";
  },
  "/cipher": "aes-encrypt",
  "/yaml": "json-yaml",
  "/jsonts": "json-ts",
  "/csv": "json-csv",
  "/sqlformat": "sql-format",
  "/deduplines": "dedup-lines",
  "/extractor": (state) => ((state.type as string) === "url" ? "extract-urls" : "extract-emails"),
  "/password": "password-gen",
  "/qrcode": "qrcode-gen",
  "/image": "image-compress",
};

export function resolveStepId(toolPath: string, toolState: Record<string, unknown>): string | null {
  const mapping = TOOL_STEP_MAP[toolPath];
  if (!mapping) return null;
  if (typeof mapping === "string") return mapping;
  return mapping(toolState);
}
```

- [ ] **Step 2: Commit**

```bash
git add libs/recipe/tool-step-map.ts
git commit -m "feat(recipe): add tool-to-step mapping for Send to Recipe"
```

---

### Task 2: SendToRecipe Component

**Files:**

- Create: `components/recipe/send-to-recipe.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useRouter, usePathname } from "../../i18n/navigation";
import { useTranslations } from "next-intl";
import { FlaskConical } from "lucide-react";
import { Button } from "../ui/button";
import { resolveStepId } from "../../libs/recipe/tool-step-map";
import { STORAGE_KEYS } from "../../libs/storage-keys";
import { showToast } from "../../libs/toast";

interface SendToRecipeProps {
  output: string;
  toolState: Record<string, unknown>;
}

export default function SendToRecipe({ output, toolState }: SendToRecipeProps) {
  const t = useTranslations("recipe");
  const router = useRouter();
  const pathname = usePathname();

  function handleSend() {
    const stepId = resolveStepId(pathname, toolState);
    if (!stepId) return;

    const draft = {
      input: output,
      stepId,
      params: {} as Record<string, string>,
      sourceTool: pathname,
    };

    localStorage.setItem(STORAGE_KEYS.recipeDraft, JSON.stringify(draft));
    showToast(t("sendToRecipe"), "success", 2000);
    router.push("/recipe");
  }

  if (!output) return null;

  return (
    <Button variant="outline" size="sm" onClick={handleSend} className="gap-1.5">
      <FlaskConical size={14} />
      {t("sendToRecipe")}
    </Button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/recipe/send-to-recipe.tsx
git commit -m "feat(recipe): add SendToRecipe button component"
```

---

### Task 3: Add SendToRecipe to Tool Pages

**Files:**

- Modify: 15 tool `*-page.tsx` files

Each tool page needs:

1. Import `SendToRecipe`
2. Place the `<SendToRecipe />` component near the output area (next to CopyButton)
3. Pass the tool's output and current state

The exact state shape varies per tool. The engineer must read each tool page to understand what state to pass.

**Important:** The engineer must read each tool page to find the output variable and the relevant state variables (mode, direction, algorithm, case type, etc.) before adding the button. The placement pattern is: next to the existing `CopyButton` in the output area.

Below is guidance for each tool page. The engineer should read each file first to find the exact output variable name and placement location.

#### Tool pages to modify:

| Tool Page   | File                                          | Output Variable                                         | State to Pass            |
| ----------- | --------------------------------------------- | ------------------------------------------------------- | ------------------------ |
| Base64      | `app/[locale]/base64/base64-page.tsx`         | `rawContent` or `encodedContent` depending on direction | `{ mode }`               |
| URL Encoder | `app/[locale]/urlencoder/urlencoder-page.tsx` | Output textarea value                                   | `{ mode, direction }`    |
| JSON        | `app/[locale]/json/json-page.tsx`             | Output textarea value                                   | `{}` (always formats)    |
| Hashing     | `app/[locale]/hashing/hashing-page.tsx`       | Hash output                                             | `{ algorithm }`          |
| Text Case   | `app/[locale]/textcase/textcase-page.tsx`     | Output for selected case                                | `{ case: selectedCase }` |
| Cipher      | `app/[locale]/cipher/cipher-page.tsx`         | Encrypted output                                        | `{}`                     |
| YAML        | `app/[locale]/yaml/yaml-page.tsx`             | Output textarea value                                   | `{}`                     |
| JSON→TS     | `app/[locale]/jsonts/jsonts-page.tsx`         | TypeScript output                                       | `{}`                     |
| CSV         | `app/[locale]/csv/csv-page.tsx`               | Output textarea value                                   | `{}`                     |
| SQL Format  | `app/[locale]/sqlformat/sqlformat-page.tsx`   | Output textarea value                                   | `{}`                     |
| Dedup Lines | `app/[locale]/deduplines/deduplines-page.tsx` | Output textarea value                                   | `{}`                     |
| Extractor   | `app/[locale]/extractor/extractor-page.tsx`   | Extracted results                                       | `{ type }`               |
| Password    | `app/[locale]/password/password-page.tsx`     | Generated password                                      | `{}`                     |
| QR Code     | `app/[locale]/qrcode/qrcode-page.tsx`         | QR data URL                                             | `{}`                     |
| Image       | `app/[locale]/image/image-page.tsx`           | Output image data URL                                   | `{}`                     |

- [ ] **Step 1: For each tool page, read the file, find the output area, and add SendToRecipe**

Pattern for each file:

1. Add import at the top:

```tsx
import SendToRecipe from "../../../components/recipe/send-to-recipe";
```

2. Find the CopyButton in the output area and add SendToRecipe next to it:

```tsx
<SendToRecipe
  output={outputVariable}
  toolState={
    {
      /* relevant state */
    }
  }
/>
```

**Note:** Since each tool page has different state management, the engineer must read the file and determine:

- Which variable holds the current output text
- Which state variables correspond to the tool's mode/direction/algorithm

Commit after every 3-5 tool pages to keep commits manageable.

- [ ] **Step 2: Commit all tool page changes**

```bash
git add app/[locale]/base64/base64-page.tsx app/[locale]/urlencoder/urlencoder-page.tsx app/[locale]/json/json-page.tsx app/[locale]/hashing/hashing-page.tsx app/[locale]/textcase/textcase-page.tsx app/[locale]/cipher/cipher-page.tsx app/[locale]/yaml/yaml-page.tsx app/[locale]/jsonts/jsonts-page.tsx app/[locale]/csv/csv-page.tsx app/[locale]/sqlformat/sqlformat-page.tsx app/[locale]/deduplines/deduplines-page.tsx app/[locale]/extractor/extractor-page.tsx app/[locale]/password/password-page.tsx app/[locale]/qrcode/qrcode-page.tsx app/[locale]/image/image-page.tsx
git commit -m "feat(recipe): add Send to Recipe button to 15 tool pages"
```

---

### Task 4: Verify Build

- [ ] **Step 1: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run build**

Run: `npm run build 2>&1 | tail -30`
Expected: Build succeeds

- [ ] **Step 3: Run all tests**

Run: `npm run test`
Expected: All tests pass
