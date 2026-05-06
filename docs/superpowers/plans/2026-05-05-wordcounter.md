# Word Counter + Reading Time Estimator — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based word counter and text analysis tool with keyword density analysis, reading/speaking time estimation, and CJK character counting.

**Architecture:** Pure function library (`libs/wordcounter/`) with TDD. Client page component with three zones: stats grid, textarea, and NeonTabs detail section. Keyword extraction debounced at 300ms; stats update immediately. Keyword extraction scoped to space-delimited text only (no CJK segmentation).

**Tech Stack:** TypeScript, React (Next.js 16 App Router), Tailwind CSS 4, Vitest, lucide-react icons, next-intl for i18n.

---

## File Structure

### New Files

| File                                            | Responsibility                                                                                           |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `libs/wordcounter/stop-words.ts`                | English stop word set                                                                                    |
| `libs/wordcounter/main.ts`                      | Pure functions: analyzeText, extractKeywords, trackKeywords, calculateReadingTime, calculateSpeakingTime |
| `libs/wordcounter/__tests__/main.test.ts`       | Vitest tests for all business logic                                                                      |
| `app/[locale]/wordcounter/page.tsx`             | Route entry with SEO metadata                                                                            |
| `app/[locale]/wordcounter/wordcounter-page.tsx` | Client page component with all UI and logic                                                              |
| `public/locales/en/wordcounter.json`            | English tool-specific i18n                                                                               |
| `public/locales/zh-CN/wordcounter.json`         | Simplified Chinese i18n                                                                                  |
| `public/locales/zh-TW/wordcounter.json`         | Traditional Chinese i18n                                                                                 |
| `public/locales/ja/wordcounter.json`            | Japanese i18n                                                                                            |
| `public/locales/ko/wordcounter.json`            | Korean i18n                                                                                              |
| `public/locales/es/wordcounter.json`            | Spanish i18n                                                                                             |
| `public/locales/pt-BR/wordcounter.json`         | Brazilian Portuguese i18n                                                                                |
| `public/locales/fr/wordcounter.json`            | French i18n                                                                                              |
| `public/locales/de/wordcounter.json`            | German i18n                                                                                              |
| `public/locales/ru/wordcounter.json`            | Russian i18n                                                                                             |

### Modified Files

| File                              | Change                                                         |
| --------------------------------- | -------------------------------------------------------------- |
| `libs/tools.ts`                   | Add `AlignLeft` import, add tool entry, add to `text` category |
| `vitest.config.ts`                | Add `libs/wordcounter/**/*.test.ts` to `include`               |
| `public/locales/en/tools.json`    | Add `wordcounter` entry                                        |
| `public/locales/zh-CN/tools.json` | Add `wordcounter` entry with searchTerms                       |
| `public/locales/zh-TW/tools.json` | Add `wordcounter` entry with searchTerms                       |
| `public/locales/ja/tools.json`    | Add `wordcounter` entry with searchTerms                       |
| `public/locales/ko/tools.json`    | Add `wordcounter` entry with searchTerms                       |
| `public/locales/es/tools.json`    | Add `wordcounter` entry                                        |
| `public/locales/pt-BR/tools.json` | Add `wordcounter` entry                                        |
| `public/locales/fr/tools.json`    | Add `wordcounter` entry                                        |
| `public/locales/de/tools.json`    | Add `wordcounter` entry                                        |
| `public/locales/ru/tools.json`    | Add `wordcounter` entry with searchTerms                       |

---

## Task 1: Stop Words Module

**Files:**

- Create: `libs/wordcounter/stop-words.ts`

- [ ] **Step 1: Create stop words file**

```ts
// libs/wordcounter/stop-words.ts

export const ENGLISH_STOP_WORDS: Set<string> = new Set([
  "a",
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "aren't",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "by",
  "can",
  "can't",
  "cannot",
  "could",
  "couldn't",
  "did",
  "didn't",
  "do",
  "does",
  "doesn't",
  "doing",
  "don't",
  "down",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "get",
  "got",
  "had",
  "hadn't",
  "has",
  "hasn't",
  "have",
  "haven't",
  "having",
  "he",
  "he'd",
  "he'll",
  "he's",
  "her",
  "here",
  "here's",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "how's",
  "i",
  "i'd",
  "i'll",
  "i'm",
  "i've",
  "if",
  "in",
  "into",
  "is",
  "isn't",
  "it",
  "it's",
  "its",
  "itself",
  "just",
  "let's",
  "me",
  "might",
  "more",
  "most",
  "must",
  "mustn't",
  "my",
  "myself",
  "no",
  "nor",
  "not",
  "of",
  "off",
  "on",
  "once",
  "only",
  "or",
  "other",
  "ought",
  "our",
  "ours",
  "ourselves",
  "out",
  "over",
  "own",
  "same",
  "shan't",
  "she",
  "she'd",
  "she'll",
  "she's",
  "should",
  "shouldn't",
  "so",
  "some",
  "such",
  "than",
  "that",
  "that's",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "there's",
  "these",
  "they",
  "they'd",
  "they'll",
  "they're",
  "they've",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "us",
  "very",
  "was",
  "wasn't",
  "we",
  "we'd",
  "we'll",
  "we're",
  "we've",
  "were",
  "weren't",
  "what",
  "what's",
  "when",
  "when's",
  "where",
  "where's",
  "which",
  "while",
  "who",
  "who's",
  "whom",
  "why",
  "why's",
  "will",
  "with",
  "won't",
  "would",
  "wouldn't",
  "you",
  "you'd",
  "you'll",
  "you're",
  "you've",
  "your",
  "yours",
  "yourself",
  "yourselves",
]);
```

- [ ] **Step 2: Commit**

```bash
git add libs/wordcounter/stop-words.ts
git commit -m "feat(wordcounter): add English stop word set"
```

---

## Task 2: Core Analysis Logic (TDD)

**Files:**

- Create: `libs/wordcounter/__tests__/main.test.ts`
- Create: `libs/wordcounter/main.ts`

### 2a: Write tests for `analyzeText`

- [ ] **Step 1: Write failing tests for analyzeText**

Create `libs/wordcounter/__tests__/main.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { analyzeText } from "../main";

describe("analyzeText", () => {
  it("returns zeros for empty string", () => {
    const stats = analyzeText("");
    expect(stats).toEqual({
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      cjkCharacters: 0,
      sentences: 0,
      paragraphs: 0,
    });
  });

  it("counts words split by spaces", () => {
    expect(analyzeText("hello world").words).toBe(2);
    expect(analyzeText("one two three four").words).toBe(4);
  });

  it("counts a single word as 1", () => {
    expect(analyzeText("hello").words).toBe(1);
  });

  it("handles multiple spaces between words", () => {
    expect(analyzeText("hello   world").words).toBe(2);
  });

  it("handles leading and trailing whitespace", () => {
    expect(analyzeText("  hello world  ").words).toBe(2);
  });

  it("counts total characters including spaces", () => {
    expect(analyzeText("hello world").characters).toBe(11);
  });

  it("counts characters excluding spaces", () => {
    expect(analyzeText("hello world").charactersNoSpaces).toBe(10);
  });

  it("counts CJK ideographs", () => {
    expect(analyzeText("你好世界").cjkCharacters).toBe(4);
  });

  it("counts Hiragana and Katakana", () => {
    expect(analyzeText("こんにちは").cjkCharacters).toBe(5);
    expect(analyzeText("コンニチハ").cjkCharacters).toBe(5);
  });

  it("counts Hangul", () => {
    expect(analyzeText("안녕하세요").cjkCharacters).toBe(5);
  });

  it("counts words and CJK separately in mixed text", () => {
    const stats = analyzeText("Hello 你好 World 世界");
    expect(stats.words).toBe(2);
    expect(stats.cjkCharacters).toBe(4);
  });

  it("splits sentences on terminal punctuation", () => {
    expect(analyzeText("Hello. World! How?").sentences).toBe(3);
    expect(analyzeText("First sentence. Second sentence.").sentences).toBe(2);
  });

  it("splits sentences on CJK punctuation", () => {
    expect(analyzeText("你好。世界！怎么？").sentences).toBe(3);
  });

  it("counts empty trailing punctuation as 0 sentences", () => {
    expect(analyzeText("").sentences).toBe(0);
  });

  it("counts single sentence without trailing punctuation as 1", () => {
    expect(analyzeText("Hello world").sentences).toBe(1);
  });

  it("splits paragraphs on double newlines", () => {
    expect(analyzeText("Para 1\n\nPara 2\n\nPara 3").paragraphs).toBe(3);
  });

  it("counts single block as 1 paragraph", () => {
    expect(analyzeText("Single paragraph").paragraphs).toBe(1);
  });

  it("counts empty string as 0 paragraphs", () => {
    expect(analyzeText("").paragraphs).toBe(0);
  });

  it("handles mixed English + CJK in one paragraph", () => {
    const stats = analyzeText("This is 中文 mixed text.");
    expect(stats.words).toBe(4);
    expect(stats.cjkCharacters).toBe(2);
    expect(stats.sentences).toBe(1);
    expect(stats.paragraphs).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run libs/wordcounter`
Expected: FAIL — `analyzeText` is not defined.

- [ ] **Step 3: Implement `analyzeText`**

Create `libs/wordcounter/main.ts`:

```ts
// libs/wordcounter/main.ts

const CJK_REGEX =
  /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g;
const TERMINAL_PUNCTUATION = /[.!?。！？]+/g;

export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  cjkCharacters: number;
  sentences: number;
  paragraphs: number;
}

export function analyzeText(text: string): TextStats {
  if (text.length === 0) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      cjkCharacters: 0,
      sentences: 0,
      paragraphs: 0,
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;

  const cjkMatches = text.match(CJK_REGEX);
  const cjkCharacters = cjkMatches ? cjkMatches.length : 0;

  const trimmed = text.trim();
  const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;

  const sentences = (() => {
    const stripped = text.trim();
    if (stripped.length === 0) return 0;
    const replaced = stripped.replace(TERMINAL_PUNCTUATION, ".");
    const parts = replaced.split(".").filter((s) => s.trim().length > 0);
    return parts.length === 0 ? (stripped.length > 0 ? 1 : 0) : parts.length;
  })();

  const paragraphs = (() => {
    const stripped = text.trim();
    if (stripped.length === 0) return 0;
    return stripped.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  })();

  return {
    characters,
    charactersNoSpaces,
    words,
    cjkCharacters,
    sentences,
    paragraphs,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run libs/wordcounter`
Expected: All `analyzeText` tests PASS.

### 2b: Write tests + implement `calculateReadingTime` and `calculateSpeakingTime`

- [ ] **Step 5: Add time calculation tests**

Append to `libs/wordcounter/__tests__/main.test.ts`:

```ts
import { calculateReadingTime, calculateSpeakingTime } from "../main";

describe("calculateReadingTime", () => {
  it('shows "< 1 sec" for 0 total', () => {
    expect(calculateReadingTime(0, 0, 200)).toBe("< 1 sec");
  });

  it("shows seconds for under 1 minute", () => {
    expect(calculateReadingTime(50, 0, 200)).toBe("15 sec");
    expect(calculateReadingTime(100, 0, 200)).toBe("30 sec");
  });

  it("shows min + sec for over 1 minute", () => {
    expect(calculateReadingTime(400, 0, 200)).toBe("2 min 0 sec");
    expect(calculateReadingTime(450, 0, 200)).toBe("2 min 15 sec");
  });

  it("shows hours for 60+ minutes", () => {
    expect(calculateReadingTime(12000, 0, 200)).toBe("1h 0m");
    expect(calculateReadingTime(15000, 0, 200)).toBe("1h 15m");
  });

  it("adds CJK chars to word count", () => {
    expect(calculateReadingTime(100, 100, 200)).toBe("1 min 0 sec");
  });

  it("respects custom WPM", () => {
    expect(calculateReadingTime(130, 0, 130)).toBe("1 min 0 sec");
  });
});

describe("calculateSpeakingTime", () => {
  it('shows "< 1 sec" for 0 total', () => {
    expect(calculateSpeakingTime(0, 0, 130)).toBe("< 1 sec");
  });

  it("uses speaking WPM default of 130", () => {
    expect(calculateSpeakingTime(130, 0, 130)).toBe("1 min 0 sec");
  });
});
```

- [ ] **Step 6: Run tests to verify they fail**

Run: `npx vitest run libs/wordcounter`
Expected: FAIL — `calculateReadingTime` is not defined.

- [ ] **Step 7: Implement time calculation functions**

Append to `libs/wordcounter/main.ts`:

```ts
function formatTime(seconds: number): string {
  if (seconds < 1) return "< 1 sec";
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    return `${mins > 0 ? `${hours}h ${mins}m` : `${hours}h 0m`}`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins === 0) return `${secs} sec`;
  return `${mins} min ${secs} sec`;
}

export function calculateReadingTime(words: number, cjkChars: number, wpm: number): string {
  const total = words + cjkChars;
  if (total === 0) return "< 1 sec";
  const seconds = (total / wpm) * 60;
  return formatTime(seconds);
}

export function calculateSpeakingTime(words: number, cjkChars: number, wpm: number): string {
  const total = words + cjkChars;
  if (total === 0) return "< 1 sec";
  const seconds = (total / wpm) * 60;
  return formatTime(seconds);
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npx vitest run libs/wordcounter`
Expected: All time calculation tests PASS.

### 2c: Write tests + implement `extractKeywords`

- [ ] **Step 9: Add keyword extraction tests**

Append to `libs/wordcounter/__tests__/main.test.ts`:

```ts
import { extractKeywords } from "../main";
import { ENGLISH_STOP_WORDS } from "../stop-words";

describe("extractKeywords", () => {
  it("returns empty arrays for empty text", () => {
    const result = extractKeywords("", ENGLISH_STOP_WORDS);
    expect(result.words).toEqual([]);
    expect(result.bigrams).toEqual([]);
  });

  it("filters stop words", () => {
    const result = extractKeywords("the quick brown fox", ENGLISH_STOP_WORDS);
    const terms = result.words.map((w) => w.term);
    expect(terms).not.toContain("the");
    expect(terms).toContain("quick");
  });

  it("limits to top 10 words", () => {
    const words = Array.from({ length: 15 }, (_, i) => `word${i}`);
    const repeated = words
      .map((w, i) =>
        Array(i + 1)
          .fill(w)
          .join(" ")
      )
      .join(" ");
    const result = extractKeywords(repeated, new Set());
    expect(result.words.length).toBeLessThanOrEqual(10);
  });

  it("limits to top 10 bigrams", () => {
    const bigrams = Array.from({ length: 15 }, (_, i) => `alpha${i} beta${i}`);
    const text = bigrams.join(" ");
    const result = extractKeywords(text, new Set());
    expect(result.bigrams.length).toBeLessThanOrEqual(10);
  });

  it("calculates density as percentage of total words", () => {
    const result = extractKeywords("apple apple orange", ENGLISH_STOP_WORDS);
    const apple = result.words.find((w) => w.term === "apple");
    expect(apple).toBeDefined();
    expect(apple!.count).toBe(2);
    expect(apple!.density).toBeCloseTo(66.67, 1);
  });

  it("returns 0 density when no words", () => {
    const result = extractKeywords("", ENGLISH_STOP_WORDS);
    expect(result.words).toEqual([]);
  });

  it("generates bigrams from consecutive words", () => {
    const result = extractKeywords("quick brown fox jumps", ENGLISH_STOP_WORDS);
    const bigramTerms = result.bigrams.map((b) => b.term);
    expect(bigramTerms).toContain("quick brown");
    expect(bigramTerms).toContain("brown fox");
    expect(bigramTerms).toContain("fox jumps");
  });

  it("filters bigrams containing stop words", () => {
    const result = extractKeywords("the quick brown fox", ENGLISH_STOP_WORDS);
    const bigramTerms = result.bigrams.map((b) => b.term);
    expect(bigramTerms).not.toContain("the quick");
  });

  it("sorts words by count descending", () => {
    const result = extractKeywords("orange apple apple orange orange", ENGLISH_STOP_WORDS);
    expect(result.words[0].term).toBe("orange");
    expect(result.words[0].count).toBe(3);
  });
});
```

- [ ] **Step 10: Run tests to verify they fail**

Run: `npx vitest run libs/wordcounter`
Expected: FAIL — `extractKeywords` is not defined.

- [ ] **Step 11: Implement `extractKeywords`**

Append to `libs/wordcounter/main.ts`:

```ts
export interface KeywordEntry {
  term: string;
  count: number;
  density: number;
}

export interface KeywordResult {
  words: KeywordEntry[];
  bigrams: KeywordEntry[];
}

export function extractKeywords(text: string, stopWords: Set<string>): KeywordResult {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { words: [], bigrams: [] };
  }

  const rawTokens = trimmed.toLowerCase().split(/\s+/);
  const tokens = rawTokens.filter((t) => t.length > 0);
  const totalWords = tokens.length;

  if (totalWords === 0) {
    return { words: [], bigrams: [] };
  }

  const contentWords = tokens.filter((t) => !stopWords.has(t));

  const wordFreq = new Map<string, number>();
  for (const w of contentWords) {
    wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
  }

  const sortedWords = [...wordFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([term, count]) => ({
      term,
      count,
      density: (count / totalWords) * 100,
    }));

  const bigramFreq = new Map<string, number>();
  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i];
    const b = tokens[i + 1];
    if (stopWords.has(a) || stopWords.has(b)) continue;
    const bigram = `${a} ${b}`;
    bigramFreq.set(bigram, (bigramFreq.get(bigram) || 0) + 1);
  }

  const sortedBigrams = [...bigramFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([term, count]) => ({
      term,
      count,
      density: (count / totalWords) * 100,
    }));

  return { words: sortedWords, bigrams: sortedBigrams };
}
```

- [ ] **Step 12: Run tests to verify they pass**

Run: `npx vitest run libs/wordcounter`
Expected: All keyword extraction tests PASS.

### 2d: Write tests + implement `trackKeywords`

- [ ] **Step 13: Add keyword tracking tests**

Append to `libs/wordcounter/__tests__/main.test.ts`:

```ts
import { trackKeywords } from "../main";

describe("trackKeywords", () => {
  it("returns empty array for no keywords", () => {
    expect(trackKeywords("some text", [])).toEqual([]);
  });

  it("counts keyword occurrences", () => {
    const results = trackKeywords("apple orange apple", ["apple"]);
    expect(results[0].count).toBe(2);
  });

  it("matches case-insensitively for Latin script", () => {
    const results = trackKeywords("Apple APPLE apple", ["apple"]);
    expect(results[0].count).toBe(3);
  });

  it("matches CJK exactly (case does not apply)", () => {
    const results = trackKeywords("你好世界你好", ["你好"]);
    expect(results[0].count).toBe(2);
  });

  it("calculates density correctly", () => {
    const results = trackKeywords("apple orange apple", ["apple"]);
    expect(results[0].density).toBeCloseTo(66.67, 1);
  });

  it("returns 0 density for empty text", () => {
    const results = trackKeywords("", ["apple"]);
    expect(results[0].count).toBe(0);
    expect(results[0].density).toBe(0);
  });

  it("tracks multiple keywords independently", () => {
    const results = trackKeywords("apple orange banana", ["apple", "orange", "grape"]);
    expect(results).toHaveLength(3);
    expect(results.find((r) => r.keyword === "apple")!.count).toBe(1);
    expect(results.find((r) => r.keyword === "grape")!.count).toBe(0);
  });
});
```

- [ ] **Step 14: Run tests to verify they fail**

Run: `npx vitest run libs/wordcounter`
Expected: FAIL — `trackKeywords` is not defined.

- [ ] **Step 15: Implement `trackKeywords`**

Append to `libs/wordcounter/main.ts`:

```ts
export interface TrackedKeyword {
  keyword: string;
  count: number;
  density: number;
}

export function trackKeywords(text: string, keywords: string[]): TrackedKeyword[] {
  if (keywords.length === 0) return [];

  const trimmed = text.trim();
  const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
  const cjkMatches = trimmed.match(CJK_REGEX);
  const cjkChars = cjkMatches ? cjkMatches.length : 0;
  const total = words + cjkChars;

  return keywords.map((keyword) => {
    if (trimmed.length === 0) {
      return { keyword, count: 0, density: 0 };
    }

    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    let count = 0;
    let pos = 0;
    while (true) {
      const idx = lowerText.indexOf(lowerKeyword, pos);
      if (idx === -1) break;
      count++;
      pos = idx + 1;
    }

    const density = total === 0 ? 0 : (count / total) * 100;
    return { keyword, count, density };
  });
}
```

- [ ] **Step 16: Run all tests**

Run: `npx vitest run libs/wordcounter`
Expected: ALL tests PASS.

- [ ] **Step 17: Commit**

```bash
git add libs/wordcounter/
git commit -m "feat(wordcounter): add core analysis logic with tests"
```

---

## Task 3: Tool Registration

**Files:**

- Modify: `libs/tools.ts`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Add AlignLeft import to tools.ts**

In `libs/tools.ts`, add `AlignLeft` to the lucide-react import block:

```ts
import {
  FileJson,
  FileCode,
  FileBraces,
  ShieldCheck,
  Percent,
  FingerprintPattern,
  Regex,
  QrCode,
  GitCompare,
  Hash,
  KeyRound,
  CaseSensitive,
  Lock,
  Clock,
  Timer,
  FileText,
  Database,
  FileCheck,
  HardDrive,
  Type,
  Code,
  Globe,
  Palette,
  Binary,
  Table,
  FileSpreadsheet,
  ImageDown,
  AlignLeft, // <-- ADD THIS
} from "lucide-react";
```

- [ ] **Step 2: Add wordcounter entry to TOOLS array**

In `libs/tools.ts`, add after the `{ key: "ascii", ... }` entry (last item in `TOOLS` array):

```ts
  { key: "ascii", path: "/ascii", icon: Type },
  { key: "wordcounter", path: "/wordcounter", icon: AlignLeft },   // <-- ADD THIS
] as const;
```

- [ ] **Step 3: Add wordcounter to text category**

In `libs/tools.ts`, update the `text` category:

```ts
  { key: "text", tools: ["json", "regex", "diff", "markdown", "textcase", "wordcounter"] },
```

- [ ] **Step 4: Add test scope to vitest.config.ts**

In `vitest.config.ts`, add a new entry to the `include` array:

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
      "libs/image/**/*.test.ts",
      "libs/wordcounter/**/*.test.ts",   // <-- ADD THIS
      "libs/__tests__/*.test.ts",
      "hooks/**/*.test.ts",
    ],
```

- [ ] **Step 5: Verify tests still pass**

Run: `npx vitest run libs/wordcounter`
Expected: ALL tests PASS.

- [ ] **Step 6: Commit**

```bash
git add libs/tools.ts vitest.config.ts
git commit -m "feat(wordcounter): register tool in tools.ts and vitest config"
```

---

## Task 4: i18n — tools.json Entries (10 Locales)

Each step adds a `"wordcounter"` entry to the existing `tools.json` file. Insert the entry in alphabetical order by key — `"wordcounter"` goes at the end of the file (just before the closing `}`).

### 4a: English

- [ ] **Step 1: Add entry to `public/locales/en/tools.json`**

Add before the closing `}`:

```json
  "wordcounter": {
    "title": "Word Counter - Character Count, Reading Time, Keyword Density",
    "shortTitle": "Word Counter",
    "description": "Count words, characters, sentences, and paragraphs. Estimate reading and speaking time. Analyze keyword frequency and density for SEO. Free online word counter, 100% client-side."
  }
```

### 4b: Simplified Chinese

- [ ] **Step 2: Add entry to `public/locales/zh-CN/tools.json`**

```json
  "wordcounter": {
    "title": "字数统计 - 字符计数、阅读时间、关键词密度",
    "shortTitle": "字数统计",
    "description": "统计字数、字符数、句子和段落。估算阅读和朗读时间。分析关键词频率和密度。免费在线字数统计工具，100% 客户端处理。",
    "searchTerms": "zishutongji zstj guanjianci yuedushijian guanjianmidu"
  }
```

### 4c: Traditional Chinese

- [ ] **Step 3: Add entry to `public/locales/zh-TW/tools.json`**

```json
  "wordcounter": {
    "title": "字數統計 - 字元計數、閱讀時間、關鍵詞密度",
    "shortTitle": "字數統計",
    "description": "統計字數、字元數、句子和段落。估算閱讀和朗讀時間。分析關鍵詞頻率和密度。免費線上字數統計工具，100% 客戶端處理。",
    "searchTerms": "zishutongji zstj guanjianci yuedushijian guanjianmidu"
  }
```

### 4d: Japanese

- [ ] **Step 4: Add entry to `public/locales/ja/tools.json`**

```json
  "wordcounter": {
    "title": "文字数カウンター - 文字数、読書時間、キーワード密度",
    "shortTitle": "文字数カウンター",
    "description": "単語数、文字数、文、段落を数えます。読書時間と朗読時間を推定します。キーワードの出現頻度と密度を分析します。無料のオンライン文字数カウンター、100%ブラウザ上で処理。",
    "searchTerms": "mojisukazyou dokushojikan kiwaado"
  }
```

### 4e: Korean

- [ ] **Step 5: Add entry to `public/locales/ko/tools.json`**

```json
  "wordcounter": {
    "title": "단어 카운터 - 문자 수, 독서 시간, 키워드 밀도",
    "shortTitle": "단어 카운터",
    "description": "단어 수, 문자 수, 문장 및 단락을 계산합니다. 읽기 및 말하기 시간을 추정합니다. 키워드 빈도와 밀도를 분석합니다. 무료 온라인 단어 카운터, 100% 클라이언트 처리.",
    "searchTerms": "geulsujatonggye gstj teukseongeo dokseo sigan"
  }
```

### 4f: Spanish

- [ ] **Step 6: Add entry to `public/locales/es/tools.json`**

```json
  "wordcounter": {
    "title": "Contador de Palabras - Caracteres, Tiempo de Lectura, Densidad de Palabras Clave",
    "shortTitle": "Contador de Palabras",
    "description": "Cuenta palabras, caracteres, oraciones y párrafos. Estima el tiempo de lectura y habla. Analiza la frecuencia y densidad de palabras clave para SEO. Herramienta gratuita, 100% en el navegador."
  }
```

### 4g: Brazilian Portuguese

- [ ] **Step 7: Add entry to `public/locales/pt-BR/tools.json`**

```json
  "wordcounter": {
    "title": "Contador de Palavras - Caracteres, Tempo de Leitura, Densidade de Palavras-chave",
    "shortTitle": "Contador de Palavras",
    "description": "Conte palavras, caracteres, frases e parágrafos. Estime o tempo de leitura e fala. Analise a frequência e densidade de palavras-chave para SEO. Ferramenta gratuita, 100% no navegador."
  }
```

### 4h: French

- [ ] **Step 8: Add entry to `public/locales/fr/tools.json`**

```json
  "wordcounter": {
    "title": "Compteur de Mots - Caractères, Temps de Lecture, Densité des Mots-clés",
    "shortTitle": "Compteur de Mots",
    "description": "Comptez les mots, caractères, phrases et paragraphes. Estimez le temps de lecture et de parole. Analysez la fréquence et la densité des mots-clés pour le SEO. Outil gratuit, 100% dans le navigateur."
  }
```

### 4i: German

- [ ] **Step 9: Add entry to `public/locales/de/tools.json`**

```json
  "wordcounter": {
    "title": "Wortzähler - Zeichen, Lesezeit, Schlüsselwort-Dichte",
    "shortTitle": "Wortzähler",
    "description": "Zählt Wörter, Zeichen, Sätze und Absätze. Schätzt Lese- und Sprechzeit. Analysiert Schlüsselwort-Häufigkeit und -Dichte für SEO. Kostenloses Online-Tool, 100% im Browser."
  }
```

### 4j: Russian

- [ ] **Step 10: Add entry to `public/locales/ru/tools.json`**

```json
  "wordcounter": {
    "title": "Счётчик слов — символы, время чтения, плотность ключевых слов",
    "shortTitle": "Счётчик слов",
    "description": "Подсчитывает слова, символы, предложения и абзацы. Оценивает время чтения и речи. Анализирует частоту и плотность ключевых слов для SEO. Бесплатный онлайн-инструмент, 100% в браузере.",
    "searchTerms": "schetchikslov sch slov vremya chteniya plotnost"
  }
```

- [ ] **Step 11: Commit**

```bash
git add "public/locales/*/tools.json"
git commit -m "feat(wordcounter): add tool entries to tools.json for all locales"
```

---

## Task 5: i18n — Tool-Specific Namespace Files (10 Locales)

Each step creates a new `wordcounter.json` file in the locale directory.

### 5a: English

- [ ] **Step 1: Create `public/locales/en/wordcounter.json`**

```json
{
  "textareaPlaceholder": "Type or paste your text here...",
  "tabOverview": "Overview",
  "tabKeywords": "Keywords",
  "tabCustomTrack": "Custom Track",
  "words": "Words",
  "characters": "Characters",
  "charactersNoSpaces": "Characters (no spaces)",
  "sentences": "Sentences",
  "paragraphs": "Paragraphs",
  "cjkCharacters": "CJK Characters",
  "readingTime": "Reading Time",
  "speakingTime": "Speaking Time",
  "readingSpeed": "Reading speed",
  "speakingSpeed": "Speaking speed",
  "wpm": "WPM",
  "topWords": "Top Words",
  "topPhrases": "Top Phrases (2-word)",
  "addKeyword": "Add keyword",
  "add": "Add",
  "noKeywords": "No space-delimited words found for keyword analysis.",
  "noTrackedKeywords": "Add keywords above to start tracking."
}
```

### 5b: Simplified Chinese

- [ ] **Step 2: Create `public/locales/zh-CN/wordcounter.json`**

```json
{
  "textareaPlaceholder": "在此输入或粘贴文本...",
  "tabOverview": "概览",
  "tabKeywords": "关键词",
  "tabCustomTrack": "自定义追踪",
  "words": "词数",
  "characters": "字符数",
  "charactersNoSpaces": "字符数（不含空格）",
  "sentences": "句子数",
  "paragraphs": "段落数",
  "cjkCharacters": "CJK 字符数",
  "readingTime": "阅读时间",
  "speakingTime": "朗读时间",
  "readingSpeed": "阅读速度",
  "speakingSpeed": "朗读速度",
  "wpm": "词/分钟",
  "topWords": "高频词",
  "topPhrases": "高频词组（2词）",
  "addKeyword": "添加关键词",
  "add": "添加",
  "noKeywords": "未找到可用于关键词分析的空格分隔词汇。",
  "noTrackedKeywords": "请在上方添加关键词以开始追踪。"
}
```

### 5c: Traditional Chinese

- [ ] **Step 3: Create `public/locales/zh-TW/wordcounter.json`**

```json
{
  "textareaPlaceholder": "在此輸入或貼上文字...",
  "tabOverview": "概覽",
  "tabKeywords": "關鍵詞",
  "tabCustomTrack": "自訂追蹤",
  "words": "詞數",
  "characters": "字元數",
  "charactersNoSpaces": "字元數（不含空格）",
  "sentences": "句子數",
  "paragraphs": "段落数",
  "cjkCharacters": "CJK 字元數",
  "readingTime": "閱讀時間",
  "speakingTime": "朗讀時間",
  "readingSpeed": "閱讀速度",
  "speakingSpeed": "朗讀速度",
  "wpm": "詞/分鐘",
  "topWords": "高頻詞",
  "topPhrases": "高頻詞組（2詞）",
  "addKeyword": "新增關鍵詞",
  "add": "新增",
  "noKeywords": "未找到可用於關鍵詞分析的空格分隔詞彙。",
  "noTrackedKeywords": "請在上方新增關鍵詞以開始追蹤。"
}
```

### 5d: Japanese

- [ ] **Step 4: Create `public/locales/ja/wordcounter.json`**

```json
{
  "textareaPlaceholder": "テキストを入力または貼り付け...",
  "tabOverview": "概要",
  "tabKeywords": "キーワード",
  "tabCustomTrack": "カスタム追跡",
  "words": "単語数",
  "characters": "文字数",
  "charactersNoSpaces": "文字数（スペースなし）",
  "sentences": "文数",
  "paragraphs": "段落",
  "cjkCharacters": "CJK文字数",
  "readingTime": "読書時間",
  "speakingTime": "朗読時間",
  "readingSpeed": "読書速度",
  "speakingSpeed": "朗読速度",
  "wpm": "語/分",
  "topWords": "高頻度語",
  "topPhrases": "高頻度フレーズ（2語）",
  "addKeyword": "キーワードを追加",
  "add": "追加",
  "noKeywords": "キーワード分析に使用できるスペース区切りの単語が見つかりません。",
  "noTrackedKeywords": "上記にキーワードを追加して追跡を開始してください。"
}
```

### 5e: Korean

- [ ] **Step 5: Create `public/locales/ko/wordcounter.json`**

```json
{
  "textareaPlaceholder": "텍스트를 입력하거나 붙여넣기...",
  "tabOverview": "개요",
  "tabKeywords": "키워드",
  "tabCustomTrack": "맞춤 추적",
  "words": "단어 수",
  "characters": "문자 수",
  "charactersNoSpaces": "문자 수 (공백 제외)",
  "sentences": "문장 수",
  "paragraphs": "단락 수",
  "cjkCharacters": "CJK 문자 수",
  "readingTime": "읽기 시간",
  "speakingTime": "말하기 시간",
  "readingSpeed": "읽기 속도",
  "speakingSpeed": "말하기 속도",
  "wpm": "단어/분",
  "topWords": "고빈도 단어",
  "topPhrases": "고빈도 구 (2단어)",
  "addKeyword": "키워드 추가",
  "add": "추가",
  "noKeywords": "키워드 분석에 사용할 수 있는 공백으로 구분된 단어가 없습니다.",
  "noTrackedKeywords": "위에 키워드를 추가하여 추적을 시작하세요."
}
```

### 5f: Spanish

- [ ] **Step 6: Create `public/locales/es/wordcounter.json`**

```json
{
  "textareaPlaceholder": "Escribe o pega tu texto aquí...",
  "tabOverview": "Resumen",
  "tabKeywords": "Palabras clave",
  "tabCustomTrack": "Seguimiento personalizado",
  "words": "Palabras",
  "characters": "Caracteres",
  "charactersNoSpaces": "Caracteres (sin espacios)",
  "sentences": "Oraciones",
  "paragraphs": "Párrafos",
  "cjkCharacters": "Caracteres CJK",
  "readingTime": "Tiempo de lectura",
  "speakingTime": "Tiempo de habla",
  "readingSpeed": "Velocidad de lectura",
  "speakingSpeed": "Velocidad de habla",
  "wpm": "PPM",
  "topWords": "Palabras frecuentes",
  "topPhrases": "Frases frecuentes (2 palabras)",
  "addKeyword": "Añadir palabra clave",
  "add": "Añadir",
  "noKeywords": "No se encontraron palabras separadas por espacios para el análisis de palabras clave.",
  "noTrackedKeywords": "Añade palabras clave arriba para comenzar el seguimiento."
}
```

### 5g: Brazilian Portuguese

- [ ] **Step 7: Create `public/locales/pt-BR/wordcounter.json`**

```json
{
  "textareaPlaceholder": "Digite ou cole seu texto aqui...",
  "tabOverview": "Visão geral",
  "tabKeywords": "Palavras-chave",
  "tabCustomTrack": "Rastreamento personalizado",
  "words": "Palavras",
  "characters": "Caracteres",
  "charactersNoSpaces": "Caracteres (sem espaços)",
  "sentences": "Frases",
  "paragraphs": "Parágrafos",
  "cjkCharacters": "Caracteres CJK",
  "readingTime": "Tempo de leitura",
  "speakingTime": "Tempo de fala",
  "readingSpeed": "Velocidade de leitura",
  "speakingSpeed": "Velocidade de fala",
  "wpm": "PPM",
  "topWords": "Palavras frequentes",
  "topPhrases": "Frases frequentes (2 palavras)",
  "addKeyword": "Adicionar palavra-chave",
  "add": "Adicionar",
  "noKeywords": "Nenhuma palavra separada por espaços encontrada para análise de palavras-chave.",
  "noTrackedKeywords": "Adicione palavras-chave acima para começar o rastreamento."
}
```

### 5h: French

- [ ] **Step 8: Create `public/locales/fr/wordcounter.json`**

```json
{
  "textareaPlaceholder": "Saisissez ou collez votre texte ici...",
  "tabOverview": "Aperçu",
  "tabKeywords": "Mots-clés",
  "tabCustomTrack": "Suivi personnalisé",
  "words": "Mots",
  "characters": "Caractères",
  "charactersNoSpaces": "Caractères (sans espaces)",
  "sentences": "Phrases",
  "paragraphs": "Paragraphes",
  "cjkCharacters": "Caractères CJK",
  "readingTime": "Temps de lecture",
  "speakingTime": "Temps de parole",
  "readingSpeed": "Vitesse de lecture",
  "speakingSpeed": "Vitesse de parole",
  "wpm": "MPM",
  "topWords": "Mots fréquents",
  "topPhrases": "Expressions fréquentes (2 mots)",
  "addKeyword": "Ajouter un mot-clé",
  "add": "Ajouter",
  "noKeywords": "Aucun mot séparé par des espaces trouvé pour l'analyse des mots-clés.",
  "noTrackedKeywords": "Ajoutez des mots-clés ci-dessus pour commencer le suivi."
}
```

### 5i: German

- [ ] **Step 9: Create `public/locales/de/wordcounter.json`**

```json
{
  "textareaPlaceholder": "Text eingeben oder einfügen...",
  "tabOverview": "Übersicht",
  "tabKeywords": "Schlüsselwörter",
  "tabCustomTrack": "Benutzerdefiniertes Tracking",
  "words": "Wörter",
  "characters": "Zeichen",
  "charactersNoSpaces": "Zeichen (ohne Leerzeichen)",
  "sentences": "Sätze",
  "paragraphs": "Absätze",
  "cjkCharacters": "CJK-Zeichen",
  "readingTime": "Lesezeit",
  "speakingTime": "Sprechzeit",
  "readingSpeed": "Lesegeschwindigkeit",
  "speakingSpeed": "Sprechgeschwindigkeit",
  "wpm": "WPM",
  "topWords": "Häufige Wörter",
  "topPhrases": "Häufige Phrasen (2 Wörter)",
  "addKeyword": "Schlüsselwort hinzufügen",
  "add": "Hinzufügen",
  "noKeywords": "Keine durch Leerzeichen getrennten Wörter für die Schlüsselwortanalyse gefunden.",
  "noTrackedKeywords": "Fügen Sie oben Schlüsselwörter hinzu, um mit dem Tracking zu beginnen."
}
```

### 5j: Russian

- [ ] **Step 10: Create `public/locales/ru/wordcounter.json`**

```json
{
  "textareaPlaceholder": "Введите или вставьте текст...",
  "tabOverview": "Обзор",
  "tabKeywords": "Ключевые слова",
  "tabCustomTrack": "Отслеживание",
  "words": "Слова",
  "characters": "Символы",
  "charactersNoSpaces": "Символы (без пробелов)",
  "sentences": "Предложения",
  "paragraphs": "Абзацы",
  "cjkCharacters": "CJK символы",
  "readingTime": "Время чтения",
  "speakingTime": "Время речи",
  "readingSpeed": "Скорость чтения",
  "speakingSpeed": "Скорость речи",
  "wpm": "С/мин",
  "topWords": "Частые слова",
  "topPhrases": "Частые фразы (2 слова)",
  "addKeyword": "Добавить ключевое слово",
  "add": "Добавить",
  "noKeywords": "Не найдено слов, разделённых пробелами, для анализа ключевых слов.",
  "noTrackedKeywords": "Добавьте ключевые слова выше, чтобы начать отслеживание."
}
```

- [ ] **Step 11: Commit**

```bash
git add "public/locales/*/wordcounter.json"
git commit -m "feat(wordcounter): add tool-specific i18n for all locales"
```

---

## Task 6: Route Entry Page

**Files:**

- Create: `app/[locale]/wordcounter/page.tsx`

- [ ] **Step 1: Create route entry**

Create `app/[locale]/wordcounter/page.tsx`:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import WordCounterPage from "./wordcounter-page";

const PATH = "/wordcounter";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("wordcounter.title"),
    description: t("wordcounter.description"),
  });
}

export default function WordCounterRoute() {
  return <WordCounterPage />;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/wordcounter/page.tsx
git commit -m "feat(wordcounter): add route entry page"
```

---

## Task 7: Client Page Component

**Files:**

- Create: `app/[locale]/wordcounter/wordcounter-page.tsx`

- [ ] **Step 1: Create the full client page component**

Create `app/[locale]/wordcounter/wordcounter-page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import { StyledTextarea } from "../../../components/ui/textarea";
import { StyledInput } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { NeonTabs } from "../../../components/ui/tabs";
import {
  analyzeText,
  extractKeywords,
  trackKeywords,
  calculateReadingTime,
  calculateSpeakingTime,
} from "../../../libs/wordcounter/main";
import { ENGLISH_STOP_WORDS } from "../../../libs/wordcounter/stop-words";

function Conversion() {
  const t = useTranslations("wordcounter");
  const tc = useTranslations("common");
  const [text, setText] = useState("");
  const [readingWpm, setReadingWpm] = useState(200);
  const [speakingWpm, setSpeakingWpm] = useState(130);
  const [trackedKeywords, setTrackedKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [debouncedText, setDebouncedText] = useState("");

  const stats = analyzeText(text);
  const readingTime = calculateReadingTime(stats.words, stats.cjkCharacters, readingWpm);
  const speakingTime = calculateSpeakingTime(stats.words, stats.cjkCharacters, speakingWpm);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedText(text), 300);
    return () => clearTimeout(timer);
  }, [text]);

  const keywords = extractKeywords(debouncedText, ENGLISH_STOP_WORDS);
  const trackedResults = trackKeywords(debouncedText, trackedKeywords);

  const addKeyword = () => {
    const trimmed = newKeyword.trim();
    if (trimmed && !trackedKeywords.some((k) => k.toLowerCase() === trimmed.toLowerCase())) {
      setTrackedKeywords([...trackedKeywords, trimmed]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (kw: string) => {
    setTrackedKeywords(trackedKeywords.filter((k) => k !== kw));
  };

  const statCards = [
    { label: t("words"), value: stats.words },
    { label: t("characters"), value: stats.characters },
    { label: t("readingTime"), value: readingTime },
    { label: t("speakingTime"), value: speakingTime },
  ];

  return (
    <section id="conversion">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-bg-surface border border-border-default rounded-xl p-4 text-center"
          >
            <div className="text-xs text-fg-muted mb-1">{card.label}</div>
            <div className="text-2xl font-bold text-accent-cyan font-mono">{card.value}</div>
          </div>
        ))}
      </div>

      <StyledTextarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("textareaPlaceholder")}
        rows={10}
        className="font-mono"
      />

      <div className="mt-2 text-xs text-fg-muted font-mono">
        {t("charactersNoSpaces")}: {stats.charactersNoSpaces} · {t("sentences")}: {stats.sentences}{" "}
        · {t("paragraphs")}: {stats.paragraphs} · {t("cjkCharacters")}: {stats.cjkCharacters}
      </div>

      <div className="mt-4">
        <NeonTabs
          tabs={[
            {
              label: <span className="font-mono text-sm">{t("tabOverview")}</span>,
              content: (
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <label className="flex items-center gap-2 text-sm text-fg-secondary">
                    {t("readingSpeed")}:
                    <input
                      type="number"
                      value={readingWpm}
                      onChange={(e) => setReadingWpm(Number(e.target.value) || 200)}
                      min={1}
                      className="w-20 bg-bg-input border border-border-default rounded px-2 py-1 text-sm font-mono text-fg-primary"
                    />
                    {t("wpm")}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-fg-secondary">
                    {t("speakingSpeed")}:
                    <input
                      type="number"
                      value={speakingWpm}
                      onChange={(e) => setSpeakingWpm(Number(e.target.value) || 130)}
                      min={1}
                      className="w-20 bg-bg-input border border-border-default rounded px-2 py-1 text-sm font-mono text-fg-primary"
                    />
                    {t("wpm")}
                  </label>
                </div>
              ),
            },
            {
              label: <span className="font-mono text-sm">{t("tabKeywords")}</span>,
              content: (
                <div className="mt-4">
                  {keywords.words.length === 0 && keywords.bigrams.length === 0 ? (
                    <p className="text-sm text-fg-muted">{t("noKeywords")}</p>
                  ) : (
                    <>
                      <div>
                        <h4 className="text-sm font-semibold text-fg-secondary mb-2">
                          {t("topWords")}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {keywords.words.map((kw) => (
                            <span
                              key={kw.term}
                              className="inline-flex items-center gap-1 bg-bg-elevated border border-border-default rounded-full px-3 py-1 text-xs font-mono"
                            >
                              {kw.term} <span className="text-accent-cyan">{kw.count}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      {keywords.bigrams.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-fg-secondary mb-2">
                            {t("topPhrases")}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {keywords.bigrams.map((kw) => (
                              <span
                                key={kw.term}
                                className="inline-flex items-center gap-1 bg-bg-elevated border border-border-default rounded-full px-3 py-1 text-xs font-mono"
                              >
                                {kw.term} <span className="text-accent-cyan">{kw.count}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ),
            },
            {
              label: <span className="font-mono text-sm">{t("tabCustomTrack")}</span>,
              content: (
                <div className="mt-4">
                  <div className="flex gap-2">
                    <StyledInput
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder={t("addKeyword")}
                      className="font-mono text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addKeyword();
                      }}
                    />
                    <Button variant="primary" size="sm" onClick={addKeyword}>
                      {t("add")}
                    </Button>
                  </div>
                  {trackedKeywords.length === 0 ? (
                    <p className="mt-3 text-sm text-fg-muted">{t("noTrackedKeywords")}</p>
                  ) : (
                    <div className="mt-3 space-y-1">
                      {trackedResults.map((tk) => (
                        <div
                          key={tk.keyword}
                          className="flex items-center gap-3 text-sm font-mono py-1 px-2 rounded hover:bg-bg-elevated/40"
                        >
                          <span className="flex-1 text-fg-primary">{tk.keyword}</span>
                          <span className="text-accent-cyan">{tk.count}</span>
                          <span className="text-fg-muted w-16 text-right">
                            {tk.density.toFixed(1)}%
                          </span>
                          <button
                            onClick={() => removeKeyword(tk.keyword)}
                            className="text-fg-muted hover:text-danger cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}

export default function WordCounterPage() {
  const t = useTranslations("tools");
  const tc = useTranslations("common");
  return (
    <Layout title={t("wordcounter.shortTitle")}>
      <div className="container mx-auto px-4 pt-3 pb-6">
        <div className="flex items-start gap-2 border-l-2 border-accent-cyan bg-accent-cyan-dim/30 rounded-r-lg p-3 my-4">
          <span className="text-sm text-fg-secondary leading-relaxed">
            {tc("alert.notTransferred")}
          </span>
        </div>
        <Conversion />
      </div>
    </Layout>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `npx next build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Run linter**

Run: `npx eslint app/[locale]/wordcounter/ libs/wordcounter/`
Expected: No errors.

- [ ] **Step 4: Run all tests**

Run: `npx vitest run libs/wordcounter`
Expected: ALL tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/wordcounter/wordcounter-page.tsx
git commit -m "feat(wordcounter): add client page component"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Every section in the spec maps to a task:
  - Metrics → Task 2 (analyzeText, calculateReadingTime, calculateSpeakingTime)
  - Keyword Analysis → Task 2 (extractKeywords, trackKeywords)
  - UI Layout → Task 7 (stats grid, textarea, NeonTabs)
  - Architecture → Tasks 1-7 (all files)
  - SEO → Task 4 (tools.json entries) + Task 6 (generatePageMeta)
  - Testing → Task 2
  - Edge Cases → Task 2 (test cases)
- [x] **No placeholders:** Every step has complete code.
- [x] **Type consistency:** All interfaces match between test and implementation files.
