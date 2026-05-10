# Token Counter — Plan 1: Core Module & Tool Registration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install `gpt-tokenizer`, create the `tokenize()` core module with tests, and register the tool in the OmniKit tool registry.

**Architecture:** A pure-JS wrapper around `gpt-tokenizer`'s `encode`/`decode` that returns token IDs mapped back to their text slices. The tool is registered in `libs/tools.ts` so it appears in the tool navigation and category system.

**Tech Stack:** TypeScript, `gpt-tokenizer` (o200k_base), Vitest

---

## File Structure

| Action  | File                                        | Responsibility                                                                         |
| ------- | ------------------------------------------- | -------------------------------------------------------------------------------------- |
| Install | `gpt-tokenizer` npm package                 | BPE tokenization engine                                                                |
| Create  | `libs/token-counter/main.ts`                | `tokenize()` function, `TokenInfo`/`TokenResult` interfaces, `CONTEXT_WINDOW` constant |
| Create  | `libs/token-counter/__tests__/main.test.ts` | Unit tests for `tokenize()`                                                            |
| Modify  | `vitest.config.ts`                          | Add `libs/token-counter/**/*.test.ts` to test include                                  |
| Modify  | `libs/tools.ts`                             | Add `tokencounter` to `TOOLS`, `TOOL_CATEGORIES`, `TOOL_RELATIONS`                     |

---

### Task 1: Install gpt-tokenizer

- [ ] **Step 1: Install the dependency**

Run:

```bash
npm install gpt-tokenizer
```

Expected: `gpt-tokenizer` added to `package.json` dependencies, `node_modules` populated.

- [ ] **Step 2: Verify import resolves**

Run:

```bash
node -e "const { encode, decode } = require('gpt-tokenizer'); console.log(typeof encode, typeof decode)"
```

Expected: `function function`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add gpt-tokenizer dependency for token counter"
```

---

### Task 2: Core Module — Write Failing Test

**Files:**

- Create: `libs/token-counter/__tests__/main.test.ts`

- [ ] **Step 1: Update vitest.config.ts to include token-counter tests**

In `vitest.config.ts`, add a new entry to the `test.include` array (after the `libs/wordcounter/**/*.test.ts` line):

```ts
      "libs/token-counter/**/*.test.ts",
```

The full `include` array should now contain:

```ts
    include: [
      "libs/dbviewer/**/*.test.ts",
      "libs/unixtime/**/*.test.ts",
      "libs/cron/**/*.test.ts",
      "libs/qrcode/**/*.test.ts",
      "libs/textcase/**/*.test.ts",
      "libs/color/**/*.test.ts",
      "libs/regex/**/*.test.ts",
      "libs/csv/**/*.test.ts",
      "libs/numbase/**/*.test.ts",
      "libs/deduplines/**/*.test.ts",
      "libs/image/**/*.test.ts",
      "libs/extractor/**/*.test.ts",
      "libs/password/**/*.test.ts",
      "libs/wordcounter/**/*.test.ts",
      "libs/token-counter/**/*.test.ts",
      "libs/sshkey/**/*.test.ts",
      "libs/httpclient/**/*.test.ts",
      "libs/__tests__/*.test.ts",
      "utils/__tests__/*.test.{ts,tsx}",
      "hooks/**/*.test.ts",
    ],
```

- [ ] **Step 2: Write the test file**

Create `libs/token-counter/__tests__/main.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { tokenize, CONTEXT_WINDOW } from "../main";

describe("tokenize", () => {
  it("returns zero for empty string", () => {
    const result = tokenize("");
    expect(result.tokenCount).toBe(0);
    expect(result.charCount).toBe(0);
    expect(result.tokens).toEqual([]);
  });

  it("tokenizes simple English text", () => {
    const result = tokenize("hello world");
    expect(result.charCount).toBe(11);
    expect(result.tokenCount).toBe(result.tokens.length);
    expect(result.tokenCount).toBeGreaterThan(0);
    const reconstructed = result.tokens.map((t) => t.text).join("");
    expect(reconstructed).toBe("hello world");
  });

  it("preserves special characters in roundtrip", () => {
    const text = "hello\nworld\t!";
    const result = tokenize(text);
    expect(result.charCount).toBe(text.length);
    const reconstructed = result.tokens.map((t) => t.text).join("");
    expect(reconstructed).toBe(text);
  });

  it("handles unicode text", () => {
    const text = "你好世界";
    const result = tokenize(text);
    expect(result.charCount).toBe(4);
    expect(result.tokenCount).toBeGreaterThan(0);
    const reconstructed = result.tokens.map((t) => t.text).join("");
    expect(reconstructed).toBe(text);
  });

  it("each token has valid id and text", () => {
    const result = tokenize("test");
    for (const token of result.tokens) {
      expect(typeof token.id).toBe("number");
      expect(typeof token.text).toBe("string");
      expect(token.text.length).toBeGreaterThan(0);
    }
  });

  it("CONTEXT_WINDOW is 128000", () => {
    expect(CONTEXT_WINDOW).toBe(128_000);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run:

```bash
npx vitest run libs/token-counter
```

Expected: FAIL — `Cannot find module '../main'` (module does not exist yet).

---

### Task 3: Core Module — Write Implementation

**Files:**

- Create: `libs/token-counter/main.ts`

- [ ] **Step 1: Create the core module**

Create `libs/token-counter/main.ts`:

```ts
import { encode, decode } from "gpt-tokenizer";

export interface TokenInfo {
  id: number;
  text: string;
}

export interface TokenResult {
  tokenCount: number;
  charCount: number;
  tokens: TokenInfo[];
}

export const CONTEXT_WINDOW = 128_000;

export function tokenize(text: string): TokenResult {
  if (!text) {
    return { tokenCount: 0, charCount: 0, tokens: [] };
  }

  const ids = encode(text);
  const tokens: TokenInfo[] = ids.map((id) => ({
    id,
    text: decode([id]),
  }));

  return {
    tokenCount: tokens.length,
    charCount: text.length,
    tokens,
  };
}
```

- [ ] **Step 2: Run tests to verify they pass**

Run:

```bash
npx vitest run libs/token-counter
```

Expected: All 6 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add libs/token-counter/ vitest.config.ts
git commit -m "feat(token-counter): add tokenize core module with tests"
```

---

### Task 4: Tool Registration

**Files:**

- Modify: `libs/tools.ts`

**Context:** The `Hash` icon is already imported on line 13 of `libs/tools.ts` and used by the `hashing` tool. We reuse the same import — no new import needed.

- [ ] **Step 1: Add `tokencounter` to the `TOOLS` array**

In `libs/tools.ts`, add a new entry at the end of the `TOOLS` array (after the `httpclient` entry on line 177, before `] as const;`):

```ts
  { key: "tokencounter", path: "/token-counter", icon: Hash },
```

The surrounding context should look like:

```ts
  { key: "httpclient", path: "/httpclient", icon: Send },
  { key: "tokencounter", path: "/token-counter", icon: Hash },
] as const;
```

- [ ] **Step 2: Add `tokencounter` to `TOOL_CATEGORIES` text group**

In the `TOOL_CATEGORIES` array, find the `text` category (line 69–81). Add `"tokencounter"` after `"wordcounter"` and before `"deduplines"`:

```ts
    tools: [
      "json",
      "regex",
      "diff",
      "markdown",
      "textcase",
      "extractor",
      "wordcounter",
      "tokencounter",
      "deduplines",
    ],
```

- [ ] **Step 3: Add `tokencounter` to `TOOL_RELATIONS`**

Add a new entry to the `TOOL_RELATIONS` record (after the `wordcounter` line at line 125):

```ts
  tokencounter: ["wordcounter", "regex", "textcase"],
```

Then update the existing `wordcounter` relations. Change line 125 from:

```ts
  wordcounter: ["textcase", "extractor", "deduplines"],
```

to:

```ts
  wordcounter: ["textcase", "extractor", "deduplines", "tokencounter"],
```

The surrounding context after changes:

```ts
  wordcounter: ["textcase", "extractor", "deduplines", "tokencounter"],
  tokencounter: ["wordcounter", "regex", "textcase"],
  httpclient: ["httpstatus", "urlencoder", "json"],
```

- [ ] **Step 4: Verify TypeScript compiles**

Run:

```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: No errors related to `tools.ts`.

- [ ] **Step 5: Commit**

```bash
git add libs/tools.ts
git commit -m "feat(token-counter): register tool in TOOLS, categories, and relations"
```

---

## Verification

After completing all tasks:

- [ ] **Run full test suite**

```bash
npm run test
```

Expected: All existing tests + 6 new token-counter tests pass.

- [ ] **Run linter**

```bash
npm run lint
```

Expected: No new errors.
