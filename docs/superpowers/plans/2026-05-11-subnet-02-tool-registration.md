# Subnet Calculator — Tool Registration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Register the subnet tool in OmniKit's tool registry and vitest config.

**Architecture:** Add tool entry to `TOOLS`, `TOOL_CATEGORIES`, `TOOL_RELATIONS` in `libs/tools.ts`. Add test scope to `vitest.config.ts`. Must pass existing `tool-relations.test.ts`.

**Tech Stack:** TypeScript, Vitest, lucide-react

**Depends on:** Plan 01 (core engine must exist for tests to pass)

---

## File Structure

| File               | Action | Responsibility                                                 |
| ------------------ | ------ | -------------------------------------------------------------- |
| `vitest.config.ts` | Modify | Add `subnet` test scope                                        |
| `libs/tools.ts`    | Modify | Register tool (TOOLS, TOOL_CATEGORIES, TOOL_RELATIONS, import) |

---

### Task 6: Vitest Config and Tool Registration

**Files:**

- Modify: `vitest.config.ts`
- Modify: `libs/tools.ts`

- [ ] **Step 1: Add subnet test scope to `vitest.config.ts`**

In the `include` array, add after `"libs/wallet/**/*.test.ts"` (line 23):

```ts
"libs/subnet/**/*.test.ts",
```

- [ ] **Step 2: Add `Network` import to `libs/tools.ts`**

Update the lucide-react import (line 37-38) to add `Network`:

```ts
import {
  ...,
  BookOpen,
  Network,
} from "lucide-react";
```

- [ ] **Step 3: Add subnet tool entry to TOOLS array in `libs/tools.ts`**

Insert after the `bip39` entry (after line 338, before the closing `];`):

```ts
  {
    key: "subnet",
    path: "/subnet",
    icon: Network,
    emoji: "🧮",
    sameAs: [
      "https://datatracker.ietf.org/doc/html/rfc4632",
      "https://datatracker.ietf.org/doc/html/rfc4291",
      "https://en.wikipedia.org/wiki/Subnetwork",
    ],
  },
```

- [ ] **Step 4: Add subnet to reference category in `libs/tools.ts`**

Change the `reference` category's `tools` array (line 99) from:

```ts
tools: ["httpstatus", "httpclient", "dbviewer", "ascii", "htmlcode", "bip39"],
```

to:

```ts
tools: ["httpstatus", "httpclient", "dbviewer", "ascii", "htmlcode", "bip39", "subnet"],
```

- [ ] **Step 5: Add TOOL_RELATIONS for subnet and update reverse relations in `libs/tools.ts`**

Add after the `bip39` line (line 140):

```ts
  subnet: ["numbase", "httpstatus", "ascii"],
```

Update `numbase` (line 127) from:

```ts
  numbase: ["color", "storageunit", "ascii"],
```

to:

```ts
  numbase: ["color", "storageunit", "ascii", "subnet"],
```

Update `ascii` (line 135) from:

```ts
  ascii: ["htmlcode", "numbase", "httpstatus"],
```

to:

```ts
  ascii: ["htmlcode", "numbase", "httpstatus", "subnet"],
```

Update `httpstatus` (line 131) from:

```ts
  httpstatus: ["httpclient", "urlencoder"],
```

to:

```ts
  httpstatus: ["httpclient", "urlencoder", "subnet"],
```

- [ ] **Step 6: Run tool-relations tests to verify**

Run: `npx vitest run libs/__tests__/tool-relations.test.ts --reporter=verbose`
Expected: All tests PASS

Key constraints verified:

- `subnet` has 3 relations (within 2-5 range)
- `numbase` now has 4 relations (within 2-5 range)
- `ascii` now has 4 relations (within 2-5 range)
- `httpstatus` now has 3 relations (within 2-5 range)
- All relations are bidirectional

- [ ] **Step 7: Run subnet tests to confirm vitest picks up new scope**

Run: `npx vitest run libs/subnet --reporter=verbose`
Expected: All subnet tests PASS (same as Plan 01 final state)

- [ ] **Step 8: Commit**

```bash
git add vitest.config.ts libs/tools.ts
git commit -m "feat(subnet): register tool in TOOLS, TOOL_CATEGORIES, TOOL_RELATIONS"
```
