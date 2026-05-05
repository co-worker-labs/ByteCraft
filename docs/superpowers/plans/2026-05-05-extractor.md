# Email / URL / Phone Extractor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based extraction tool at `/extractor` that parses text and pulls out emails, URLs, and phone numbers with toggle chips, deduplication, and CSV/JSON/TXT export.

**Architecture:** Pure-function business logic in `libs/extractor/main.ts` (three regex patterns + post-processing). UI in `app/[locale]/extractor/extractor-page.tsx` as a single client component with toggle chips for type filtering and a flat results list. All 10 locales supported via next-intl.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS 4, next-intl, Vitest, lucide-react

**Design spec:** `docs/superpowers/specs/2026-05-05-extractor-design.md`

---

## File Map

| File                                          | Responsibility                                             |
| --------------------------------------------- | ---------------------------------------------------------- |
| `libs/extractor/main.ts`                      | Types, regex patterns, `extract()` pure function           |
| `libs/extractor/__tests__/main.test.ts`       | Vitest tests for all patterns and edge cases               |
| `app/[locale]/extractor/page.tsx`             | Route entry — `generateMetadata` + render client component |
| `app/[locale]/extractor/extractor-page.tsx`   | Client component — all UI, state, export logic             |
| `libs/tools.ts`                               | Add `extractor` tool entry + category placement            |
| `vitest.config.ts`                            | Add test include for `libs/extractor/**/*.test.ts`         |
| `public/locales/{locale}/tools.json` × 10     | Add `extractor` metadata entry                             |
| `public/locales/{locale}/extractor.json` × 10 | UI strings (input placeholder, labels, description)        |

---

### Task 1: Business Logic — Types and Regex Patterns

**Files:**

- Create: `libs/extractor/main.ts`

- [ ] **Step 1: Create `libs/extractor/main.ts` with types, regex patterns, and the `extract()` function**

```ts
export type ExtractorType = "email" | "url" | "phone";

export type ExtractionResult = {
  type: ExtractorType;
  value: string;
  index: number;
};

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const URL_RE =
  /https?:\/\/[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/g;

const PHONE_RE = /(?:\+?\d{1,4}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g;

const PHONE_MIN_DIGITS = 7;

const TRAILING_PUNCT_RE = /[.,;)]+$/;

function stripTrailingPunctuation(value: string): string {
  return value.replace(TRAILING_PUNCT_RE, "");
}

function countDigits(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] >= "0" && s[i] <= "9") n++;
  }
  return n;
}

const PATTERNS: Record<ExtractorType, RegExp> = {
  email: EMAIL_RE,
  url: URL_RE,
  phone: PHONE_RE,
};

export function extract(input: string, types: ExtractorType[]): ExtractionResult[] {
  if (!input || types.length === 0) return [];

  const results: ExtractionResult[] = [];

  for (const type of types) {
    const re = new RegExp(PATTERNS[type].source, "g");
    let match: RegExpExecArray | null;

    while ((match = re.exec(input)) !== null) {
      let value = match[0];

      value = stripTrailingPunctuation(value);

      if (type === "phone" && countDigits(value) < PHONE_MIN_DIGITS) {
        continue;
      }

      results.push({ type, value, index: match.index });
    }
  }

  results.sort((a, b) => a.index - b.index);

  return results;
}
```

- [ ] **Step 2: Commit**

```bash
git add libs/extractor/main.ts
git commit -m "feat(extractor): add extraction logic with email, URL, phone patterns"
```

---

### Task 2: Business Logic — Tests

**Files:**

- Create: `libs/extractor/__tests__/main.test.ts`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Add test include to `vitest.config.ts`**

Add `"libs/extractor/**/*.test.ts",` after the existing `"libs/image/**/*.test.ts"` line in the `include` array.

- [ ] **Step 2: Create `libs/extractor/__tests__/main.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { extract, type ExtractorType } from "../main";

describe("extract — email", () => {
  it("extracts a basic email", () => {
    const results = extract("Contact us at hello@example.com please", ["email"]);
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({ type: "email", value: "hello@example.com", index: 14 });
  });

  it("extracts email with plus tag", () => {
    const results = extract("user+tag@domain.co.uk", ["email"]);
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe("user+tag@domain.co.uk");
  });

  it("extracts email with subdomains", () => {
    const results = extract("first.last@sub.domain.org", ["email"]);
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe("first.last@sub.domain.org");
  });

  it("extracts multiple emails", () => {
    const results = extract("a@b.com and c@d.com", ["email"]);
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.value)).toEqual(["a@b.com", "c@d.com"]);
  });

  it("does not match bare @domain.com", () => {
    const results = extract("@domain.com", ["email"]);
    expect(results).toHaveLength(0);
  });

  it("does not match bare domain.com", () => {
    const results = extract("domain.com", ["email"]);
    expect(results).toHaveLength(0);
  });
});

describe("extract — URL", () => {
  it("extracts https URL", () => {
    const results = extract("Visit https://example.com/page?q=1 for details", ["url"]);
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe("https://example.com/page?q=1");
  });

  it("extracts http URL", () => {
    const results = extract("See http://test.org", ["url"]);
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe("http://test.org");
  });

  it("extracts URL with fragment", () => {
    const results = extract("https://example.com/page#section", ["url"]);
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe("https://example.com/page#section");
  });

  it("extracts multiple URLs", () => {
    const results = extract("https://a.com and https://b.com/path", ["url"]);
    expect(results).toHaveLength(2);
  });

  it("does not match bare domain without scheme", () => {
    const results = extract("example.com", ["url"]);
    expect(results).toHaveLength(0);
  });
});

describe("extract — phone", () => {
  it("extracts US phone with dashes", () => {
    const results = extract("Call 555-987-6543 now", ["phone"]);
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe("555-987-6543");
  });

  it("extracts international phone with country code", () => {
    const results = extract("+1 (555) 123-4567", ["phone"]);
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe("+1 (555) 123-4567");
  });

  it("extracts UK phone format", () => {
    const results = extract("+44 20 7946 0958", ["phone"]);
    expect(results).toHaveLength(1);
  });

  it("extracts phone with dots", () => {
    const results = extract("(555) 123.4567", ["phone"]);
    expect(results).toHaveLength(1);
  });

  it("discards phone-like match with fewer than 7 digits", () => {
    const results = extract("Call 123-456", ["phone"]);
    expect(results).toHaveLength(0);
  });

  it("does not match dates with slashes", () => {
    const results = extract("2024/01/05", ["phone"]);
    expect(results).toHaveLength(0);
  });

  it("does not match version strings", () => {
    const results = extract("version 3.14.159", ["phone"]);
    expect(results).toHaveLength(0);
  });
});

describe("extract — mixed types", () => {
  it("extracts all types from mixed text", () => {
    const text = "Email: hello@world.com, URL: https://example.com, Phone: 555-123-4567";
    const results = extract(text, ["email", "url", "phone"]);
    expect(results).toHaveLength(3);
    const types = results.map((r) => r.type);
    expect(types).toContain("email");
    expect(types).toContain("url");
    expect(types).toContain("phone");
  });

  it("filters by type — email only", () => {
    const text = "hello@world.com https://example.com 555-123-4567";
    const results = extract(text, ["email"]);
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe("email");
  });

  it("filters by type — url only", () => {
    const text = "hello@world.com https://example.com 555-123-4567";
    const results = extract(text, ["url"]);
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe("url");
  });

  it("returns empty for empty input", () => {
    expect(extract("", ["email", "url", "phone"])).toEqual([]);
  });

  it("returns empty for empty types array", () => {
    expect(extract("hello@world.com", [])).toEqual([]);
  });

  it("returns empty when no matches found", () => {
    expect(extract("plain text no matches", ["email", "url", "phone"])).toEqual([]);
  });
});

describe("extract — trailing punctuation stripping", () => {
  it("strips trailing period", () => {
    const results = extract("Email: hello@world.com.", ["email"]);
    expect(results[0].value).toBe("hello@world.com");
  });

  it("strips trailing comma", () => {
    const results = extract("hello@world.com,", ["email"]);
    expect(results[0].value).toBe("hello@world.com");
  });

  it("strips trailing semicolon", () => {
    const results = extract("hello@world.com;", ["email"]);
    expect(results[0].value).toBe("hello@world.com");
  });

  it("strips trailing closing paren", () => {
    const results = extract("(hello@world.com)", ["email"]);
    expect(results[0].value).toBe("hello@world.com");
  });
});

describe("extract — sort order", () => {
  it("returns results sorted by position in input", () => {
    const text = "https://b.com a@b.com 555-123-4567";
    const results = extract(text, ["email", "url", "phone"]);
    expect(results[0].type).toBe("url");
    expect(results[1].type).toBe("email");
    expect(results[2].type).toBe("phone");
  });
});
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `npx vitest run libs/extractor`
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add libs/extractor/__tests__/main.test.ts vitest.config.ts
git commit -m "test(extractor): add extraction logic tests"
```

---

### Task 3: Tool Registration

**Files:**

- Modify: `libs/tools.ts`

- [ ] **Step 1: Add `Search` import from lucide-react**

At the top of `libs/tools.ts`, add `Search` to the import from `lucide-react` (line 3-31).

- [ ] **Step 2: Add tool entry to `TOOLS` array**

After the last entry (`{ key: "ascii", path: "/ascii", icon: Type }`), add:

```ts
{ key: "extractor", path: "/extractor", icon: Search },
```

- [ ] **Step 3: Add tool to `TOOL_CATEGORIES` text group**

In the `TOOL_CATEGORIES` array, update the `"text"` group from:

```ts
{ key: "text", tools: ["json", "regex", "diff", "markdown", "textcase"] },
```

to:

```ts
{ key: "text", tools: ["json", "regex", "diff", "markdown", "textcase", "extractor"] },
```

- [ ] **Step 4: Commit**

```bash
git add libs/tools.ts
git commit -m "feat(extractor): register tool in tools.ts"
```

---

### Task 4: i18n — English Locale

**Files:**

- Modify: `public/locales/en/tools.json`
- Create: `public/locales/en/extractor.json`

- [ ] **Step 1: Add `extractor` entry to `public/locales/en/tools.json`**

Add before the `"categories"` key:

```json
"extractor": {
  "title": "Email & URL Extractor — Extract Emails, URLs, Phone Numbers Online",
  "shortTitle": "Email / URL / Phone Extractor",
  "description": "Extract emails, URLs, and phone numbers from any text instantly. Free online extraction tool, 100% client-side."
},
```

- [ ] **Step 2: Create `public/locales/en/extractor.json`**

```json
{
  "inputPlaceholder": "Paste text to extract emails, URLs, and phone numbers...",
  "toggleEmail": "Email",
  "toggleUrl": "URL",
  "togglePhone": "Phone",
  "showDuplicates": "Show duplicates",
  "resultsCount": "{unique} unique items found ({total} total matches)",
  "resultsCountAll": "{total} items found",
  "noResults": "No items found",
  "emptyState": "Paste or type text above to extract emails, URLs, and phone numbers",
  "copyAll": "Copy All",
  "exportTxt": "TXT",
  "exportCsv": "CSV",
  "exportJson": "JSON",
  "copied": "Copied!",
  "downloaded": "Downloaded!",
  "typeEmail": "Email",
  "typeUrl": "URL",
  "typePhone": "Phone",
  "summaryEmails": "{count} emails",
  "summaryUrls": "{count} URLs",
  "summaryPhones": "{count} phones",
  "summaryUnique": "{count} unique",
  "summaryTotal": "{count} total",
  "occurrences": "×{count}",
  "descriptions": {
    "formatsTitle": "Supported Formats",
    "formatsEmail": "Email",
    "formatsEmailDesc": "local-part@domain.tld — supports +tags, subdomains, multi-part TLDs",
    "formatsUrl": "URL",
    "formatsUrlDesc": "http:// and https:// — paths, query strings, fragments",
    "formatsPhone": "Phone",
    "formatsPhoneDesc": "International formats — country code, parentheses, dashes, dots, spaces",
    "tipsTitle": "Tips",
    "tip1": "Extraction is permissive, not validation — all plausible matches are returned",
    "tip2": "Toggle individual types on/off with the chip buttons",
    "tip3": "Results are deduplicated by default; enable \"Show duplicates\" to see all occurrences"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/en/tools.json public/locales/en/extractor.json
git commit -m "feat(extractor): add English locale strings"
```

---

### Task 5: i18n — CJK Locales (zh-CN, zh-TW, ja, ko)

**Files:**

- Modify: `public/locales/zh-CN/tools.json`, `public/locales/zh-TW/tools.json`, `public/locales/ja/tools.json`, `public/locales/ko/tools.json`
- Create: `public/locales/zh-CN/extractor.json`, `public/locales/zh-TW/extractor.json`, `public/locales/ja/extractor.json`, `public/locales/ko/extractor.json`

- [ ] **Step 1: Add `extractor` entry to each CJK `tools.json`**

Add before the `"categories"` key in each file.

**zh-CN:**

```json
"extractor": {
  "title": "邮箱 / URL / 电话提取器 — 在线提取邮箱、网址、电话号码",
  "shortTitle": "邮箱 / URL / 电话提取",
  "description": "从任意文本中即时提取邮箱、URL 和电话号码。免费在线提取工具，100% 浏览器端处理。",
  "searchTerms": "youxiangtiqu yxtq url dianhua"
},
```

**zh-TW:**

```json
"extractor": {
  "title": "信箱 / URL / 電話提取器 — 線上提取信箱、網址、電話號碼",
  "shortTitle": "信箱 / URL / 電話提取",
  "description": "從任意文字中即時提取信箱、URL 和電話號碼。免費線上提取工具，100% 瀏覽器端處理。",
  "searchTerms": "youxiangtiqu yxtq url dianhua"
},
```

**ja:**

```json
"extractor": {
  "title": "メール / URL / 電話番号抽出 — オンラインでメール、URL、電話番号を抽出",
  "shortTitle": "メール / URL / 電話抽出",
  "description": "テキストからメールアドレス、URL、電話番号を即座に抽出。無料オンライン抽出ツール、100%ブラウザ処理。",
  "searchTerms": "meeruchuushutsu mrchu url denwa"
},
```

**ko:**

```json
"extractor": {
  "title": "이메일 / URL / 전화번호 추출기 — 온라인 이메일, URL, 전화번호 추출",
  "shortTitle": "이메일 / URL / 전화 추출",
  "description": "텍스트에서 이메일, URL, 전화번호를 즉시 추출합니다. 무료 온라인 추출 도구, 100% 브라우저 처리.",
  "searchTerms": "imeilchuchul imicc url jeonhwa"
},
```

- [ ] **Step 2: Create `public/locales/zh-CN/extractor.json`**

```json
{
  "inputPlaceholder": "粘贴文本以提取邮箱、URL 和电话号码...",
  "toggleEmail": "邮箱",
  "toggleUrl": "URL",
  "togglePhone": "电话",
  "showDuplicates": "显示重复项",
  "resultsCount": "找到 {unique} 个唯一项（共 {total} 个匹配）",
  "resultsCountAll": "找到 {total} 个项目",
  "noResults": "未找到项目",
  "emptyState": "在上方粘贴或输入文本以提取邮箱、URL 和电话号码",
  "copyAll": "全部复制",
  "exportTxt": "TXT",
  "exportCsv": "CSV",
  "exportJson": "JSON",
  "copied": "已复制！",
  "downloaded": "已下载！",
  "typeEmail": "邮箱",
  "typeUrl": "URL",
  "typePhone": "电话",
  "summaryEmails": "{count} 个邮箱",
  "summaryUrls": "{count} 个 URL",
  "summaryPhones": "{count} 个电话",
  "summaryUnique": "{count} 个唯一",
  "summaryTotal": "{count} 个总计",
  "occurrences": "×{count}",
  "descriptions": {
    "formatsTitle": "支持的格式",
    "formatsEmail": "邮箱",
    "formatsEmailDesc": "local-part@domain.tld — 支持 +标签、子域名、多段 TLD",
    "formatsUrl": "URL",
    "formatsUrlDesc": "http:// 和 https:// — 路径、查询字符串、片段",
    "formatsPhone": "电话",
    "formatsPhoneDesc": "国际格式 — 国家代码、括号、连字符、点号、空格",
    "tipsTitle": "提示",
    "tip1": "提取是宽松的，非验证 — 所有可能的匹配都会返回",
    "tip2": "使用切换按钮开启/关闭单个类型",
    "tip3": "默认去重；启用\"显示重复项\"查看所有匹配"
  }
}
```

- [ ] **Step 3: Create `public/locales/zh-TW/extractor.json`**

```json
{
  "inputPlaceholder": "貼上文字以提取信箱、URL 和電話號碼...",
  "toggleEmail": "信箱",
  "toggleUrl": "URL",
  "togglePhone": "電話",
  "showDuplicates": "顯示重複項",
  "resultsCount": "找到 {unique} 個唯一項（共 {total} 個匹配）",
  "resultsCountAll": "找到 {total} 個項目",
  "noResults": "未找到項目",
  "emptyState": "在上方貼上或輸入文字以提取信箱、URL 和電話號碼",
  "copyAll": "全部複製",
  "exportTxt": "TXT",
  "exportCsv": "CSV",
  "exportJson": "JSON",
  "copied": "已複製！",
  "downloaded": "已下載！",
  "typeEmail": "信箱",
  "typeUrl": "URL",
  "typePhone": "電話",
  "summaryEmails": "{count} 個信箱",
  "summaryUrls": "{count} 個 URL",
  "summaryPhones": "{count} 個電話",
  "summaryUnique": "{count} 個唯一",
  "summaryTotal": "{count} 個總計",
  "occurrences": "×{count}",
  "descriptions": {
    "formatsTitle": "支援的格式",
    "formatsEmail": "信箱",
    "formatsEmailDesc": "local-part@domain.tld — 支援 +標籤、子網域、多段 TLD",
    "formatsUrl": "URL",
    "formatsUrlDesc": "http:// 和 https:// — 路徑、查詢字串、片段",
    "formatsPhone": "電話",
    "formatsPhoneDesc": "國際格式 — 國家代碼、括號、連字號、點號、空格",
    "tipsTitle": "提示",
    "tip1": "提取是寬鬆的，非驗證 — 所有可能的匹配都會返回",
    "tip2": "使用切換按鈕開啟/關閉單個類型",
    "tip3": "預設去重；啟用\"顯示重複項\"查看所有匹配"
  }
}
```

- [ ] **Step 4: Create `public/locales/ja/extractor.json`**

```json
{
  "inputPlaceholder": "テキストを貼り付けてメール、URL、電話番号を抽出...",
  "toggleEmail": "メール",
  "toggleUrl": "URL",
  "togglePhone": "電話",
  "showDuplicates": "重複を表示",
  "resultsCount": "{unique} 件のユニーク項目が見つかりました（合計 {total} 件の一致）",
  "resultsCountAll": "{total} 件の項目が見つかりました",
  "noResults": "項目が見つかりません",
  "emptyState": "上にテキストを貼り付けるか入力して、メール、URL、電話番号を抽出",
  "copyAll": "すべてコピー",
  "exportTxt": "TXT",
  "exportCsv": "CSV",
  "exportJson": "JSON",
  "copied": "コピーしました！",
  "downloaded": "ダウンロードしました！",
  "typeEmail": "メール",
  "typeUrl": "URL",
  "typePhone": "電話",
  "summaryEmails": "{count} 件のメール",
  "summaryUrls": "{count} 件の URL",
  "summaryPhones": "{count} 件の電話",
  "summaryUnique": "{count} 件ユニーク",
  "summaryTotal": "{count} 件合計",
  "occurrences": "×{count}",
  "descriptions": {
    "formatsTitle": "対応フォーマット",
    "formatsEmail": "メール",
    "formatsEmailDesc": "local-part@domain.tld — +タグ、サブドメイン、マルチパートTLD対応",
    "formatsUrl": "URL",
    "formatsUrlDesc": "http:// および https:// — パス、クエリ文字列、フラグメント",
    "formatsPhone": "電話",
    "formatsPhoneDesc": "国際形式 — 国コード、括弧、ハイフン、ドット、スペース",
    "tipsTitle": "ヒント",
    "tip1": "抽出は寛容であり、検証ではありません — 妥当な一致はすべて返されます",
    "tip2": "チップボタンで各タイプのオン/オフを切り替え",
    "tip3": "デフォルトで重複排除；「重複を表示」で全一致を表示"
  }
}
```

- [ ] **Step 5: Create `public/locales/ko/extractor.json`**

```json
{
  "inputPlaceholder": "텍스트를 붙여넣어 이메일, URL, 전화번호 추출...",
  "toggleEmail": "이메일",
  "toggleUrl": "URL",
  "togglePhone": "전화",
  "showDuplicates": "중복 표시",
  "resultsCount": "{unique}개의 고유 항목 발견 (총 {total}개 일치)",
  "resultsCountAll": "{total}개의 항목 발견",
  "noResults": "항목을 찾을 수 없습니다",
  "emptyState": "위에 텍스트를 붙여넣거나 입력하여 이메일, URL, 전화번호를 추출하세요",
  "copyAll": "모두 복사",
  "exportTxt": "TXT",
  "exportCsv": "CSV",
  "exportJson": "JSON",
  "copied": "복사됨!",
  "downloaded": "다운로드됨!",
  "typeEmail": "이메일",
  "typeUrl": "URL",
  "typePhone": "전화",
  "summaryEmails": "{count}개 이메일",
  "summaryUrls": "{count}개 URL",
  "summaryPhones": "{count}개 전화",
  "summaryUnique": "{count}개 고유",
  "summaryTotal": "{count}개 총계",
  "occurrences": "×{count}",
  "descriptions": {
    "formatsTitle": "지원 형식",
    "formatsEmail": "이메일",
    "formatsEmailDesc": "local-part@domain.tld — +태그, 서브도메인, 다중 파트 TLD 지원",
    "formatsUrl": "URL",
    "formatsUrlDesc": "http:// 및 https:// — 경로, 쿼리 문자열, 프래그먼트",
    "formatsPhone": "전화",
    "formatsPhoneDesc": "국제 형식 — 국가 코드, 괄호, 하이픈, 마침표, 공백",
    "tipsTitle": "팁",
    "tip1": "추출은 허용적이며, 검증이 아닙니다 — 가능한 모든 일치 항목이 반환됩니다",
    "tip2": "칩 버튼으로 각 유형을 켜고 끌 수 있습니다",
    "tip3": "기본적으로 중복 제거; \"중복 표시\"를 활성화하여 모든 일치 항목 보기"
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add public/locales/zh-CN/ public/locales/zh-TW/ public/locales/ja/ public/locales/ko/
git commit -m "feat(extractor): add CJK locale strings (zh-CN, zh-TW, ja, ko)"
```

---

### Task 6: i18n — Latin-Script Locales (es, pt-BR, fr, de, ru)

**Files:**

- Modify: `public/locales/{es,pt-BR,fr,de,ru}/tools.json`
- Create: `public/locales/{es,pt-BR,fr,de,ru}/extractor.json`

- [ ] **Step 1: Add `extractor` entry to each Latin-script `tools.json`**

Add before the `"categories"` key in each file. No `searchTerms` needed.

**es:**

```json
"extractor": {
  "title": "Extractor de Emails, URLs y Teléfonos — Extracción en Línea",
  "shortTitle": "Extractor Email / URL / Teléfono",
  "description": "Extrae emails, URLs y números de teléfono de cualquier texto al instante. Herramienta de extracción gratuita, 100% en el navegador."
},
```

**pt-BR:**

```json
"extractor": {
  "title": "Extrator de Emails, URLs e Telefones — Extração Online",
  "shortTitle": "Extrator Email / URL / Telefone",
  "description": "Extraia emails, URLs e números de telefone de qualquer texto instantaneamente. Ferramenta de extração gratuita, 100% no navegador."
},
```

**fr:**

```json
"extractor": {
  "title": "Extracteur d'Emails, URLs et Téléphones — Extraction en Ligne",
  "shortTitle": "Extracteur Email / URL / Téléphone",
  "description": "Extrayez les emails, URLs et numéros de téléphone de tout texte instantanément. Outil d'extraction gratuit, 100% côté client."
},
```

**de:**

```json
"extractor": {
  "title": "E-Mail / URL / Telefon-Extraktor — Online-Extraktion",
  "shortTitle": "E-Mail / URL / Telefon Extraktor",
  "description": "Extrahieren Sie E-Mails, URLs und Telefonnummern aus beliebigem Text sofort. Kostenloses Online-Extraktionstool, 100% clientseitig."
},
```

**ru:**

```json
"extractor": {
  "title": "Извлечение Email / URL / Телефон — Онлайн-экстрактор",
  "shortTitle": "Извлечение Email / URL / Телефон",
  "description": "Мгновенное извлечение email-адресов, URL и телефонных номеров из любого текста. Бесплатный онлайн-инструмент, 100% в браузере."
},
```

- [ ] **Step 2: Create `public/locales/es/extractor.json`**

```json
{
  "inputPlaceholder": "Pegue texto para extraer emails, URLs y números de teléfono...",
  "toggleEmail": "Email",
  "toggleUrl": "URL",
  "togglePhone": "Teléfono",
  "showDuplicates": "Mostrar duplicados",
  "resultsCount": "{unique} elementos únicos encontrados ({total} coincidencias totales)",
  "resultsCountAll": "{total} elementos encontrados",
  "noResults": "No se encontraron elementos",
  "emptyState": "Pegue o escriba texto arriba para extraer emails, URLs y números de teléfono",
  "copyAll": "Copiar todo",
  "exportTxt": "TXT",
  "exportCsv": "CSV",
  "exportJson": "JSON",
  "copied": "¡Copiado!",
  "downloaded": "¡Descargado!",
  "typeEmail": "Email",
  "typeUrl": "URL",
  "typePhone": "Teléfono",
  "summaryEmails": "{count} emails",
  "summaryUrls": "{count} URLs",
  "summaryPhones": "{count} teléfonos",
  "summaryUnique": "{count} únicos",
  "summaryTotal": "{count} total",
  "occurrences": "×{count}",
  "descriptions": {
    "formatsTitle": "Formatos compatibles",
    "formatsEmail": "Email",
    "formatsEmailDesc": "local-part@domain.tld — soporta etiquetas +, subdominios, TLD multiparte",
    "formatsUrl": "URL",
    "formatsUrlDesc": "http:// y https:// — rutas, cadenas de consulta, fragmentos",
    "formatsPhone": "Teléfono",
    "formatsPhoneDesc": "Formatos internacionales — código de país, paréntesis, guiones, puntos, espacios",
    "tipsTitle": "Consejos",
    "tip1": "La extracción es permisiva, no validación — se devuelven todas las coincidencias plausibles",
    "tip2": "Active/desactive tipos individuales con los botones de alternancia",
    "tip3": "Los resultados se deduplican por defecto; active \"Mostrar duplicados\" para ver todas las ocurrencias"
  }
}
```

- [ ] **Step 3: Create `public/locales/pt-BR/extractor.json`**

```json
{
  "inputPlaceholder": "Cole texto para extrair emails, URLs e números de telefone...",
  "toggleEmail": "Email",
  "toggleUrl": "URL",
  "togglePhone": "Telefone",
  "showDuplicates": "Mostrar duplicados",
  "resultsCount": "{unique} itens únicos encontrados ({total} correspondências totais)",
  "resultsCountAll": "{total} itens encontrados",
  "noResults": "Nenhum item encontrado",
  "emptyState": "Cole ou digite texto acima para extrair emails, URLs e números de telefone",
  "copyAll": "Copiar tudo",
  "exportTxt": "TXT",
  "exportCsv": "CSV",
  "exportJson": "JSON",
  "copied": "Copiado!",
  "downloaded": "Baixado!",
  "typeEmail": "Email",
  "typeUrl": "URL",
  "typePhone": "Telefone",
  "summaryEmails": "{count} emails",
  "summaryUrls": "{count} URLs",
  "summaryPhones": "{count} telefones",
  "summaryUnique": "{count} únicos",
  "summaryTotal": "{count} total",
  "occurrences": "×{count}",
  "descriptions": {
    "formatsTitle": "Formatos suportados",
    "formatsEmail": "Email",
    "formatsEmailDesc": "local-part@domain.tld — suporta tags +, subdomínios, TLD multipartes",
    "formatsUrl": "URL",
    "formatsUrlDesc": "http:// e https:// — caminhos, query strings, fragmentos",
    "formatsPhone": "Telefone",
    "formatsPhoneDesc": "Formatos internacionais — código do país, parênteses, hifens, pontos, espaços",
    "tipsTitle": "Dicas",
    "tip1": "A extração é permissiva, não validação — todas as correspondências plausíveis são retornadas",
    "tip2": "Ative/desative tipos individuais com os botões de alternância",
    "tip3": "Resultados são deduplicados por padrão; ative \"Mostrar duplicados\" para ver todas as ocorrências"
  }
}
```

- [ ] **Step 4: Create `public/locales/fr/extractor.json`**

```json
{
  "inputPlaceholder": "Collez du texte pour extraire les emails, URLs et numéros de téléphone...",
  "toggleEmail": "Email",
  "toggleUrl": "URL",
  "togglePhone": "Téléphone",
  "showDuplicates": "Afficher les doublons",
  "resultsCount": "{unique} éléments uniques trouvés ({total} correspondances totales)",
  "resultsCountAll": "{total} éléments trouvés",
  "noResults": "Aucun élément trouvé",
  "emptyState": "Collez ou saisissez du texte ci-dessus pour extraire les emails, URLs et numéros de téléphone",
  "copyAll": "Tout copier",
  "exportTxt": "TXT",
  "exportCsv": "CSV",
  "exportJson": "JSON",
  "copied": "Copié !",
  "downloaded": "Téléchargé !",
  "typeEmail": "Email",
  "typeUrl": "URL",
  "typePhone": "Téléphone",
  "summaryEmails": "{count} emails",
  "summaryUrls": "{count} URLs",
  "summaryPhones": "{count} téléphones",
  "summaryUnique": "{count} uniques",
  "summaryTotal": "{count} total",
  "occurrences": "×{count}",
  "descriptions": {
    "formatsTitle": "Formats pris en charge",
    "formatsEmail": "Email",
    "formatsEmailDesc": "local-part@domain.tld — prend en charge les tags +, sous-domaines, TLD multi-parties",
    "formatsUrl": "URL",
    "formatsUrlDesc": "http:// et https:// — chemins, chaînes de requête, fragments",
    "formatsPhone": "Téléphone",
    "formatsPhoneDesc": "Formats internationaux — indicatif pays, parenthèses, tirets, points, espaces",
    "tipsTitle": "Conseils",
    "tip1": "L'extraction est permissive, pas une validation — toutes les correspondances plausibles sont retournées",
    "tip2": "Activez/désactivez les types individuels avec les boutons de bascule",
    "tip3": "Les résultats sont dédupliqués par défaut ; activez \"Afficher les doublons\" pour voir toutes les occurrences"
  }
}
```

- [ ] **Step 5: Create `public/locales/de/extractor.json`**

```json
{
  "inputPlaceholder": "Text einfügen, um E-Mails, URLs und Telefonnummern zu extrahieren...",
  "toggleEmail": "E-Mail",
  "toggleUrl": "URL",
  "togglePhone": "Telefon",
  "showDuplicates": "Duplikate anzeigen",
  "resultsCount": "{unique} eindeutige Elemente gefunden ({total} Treffer gesamt)",
  "resultsCountAll": "{total} Elemente gefunden",
  "noResults": "Keine Elemente gefunden",
  "emptyState": "Fügen Sie oben Text ein oder geben Sie ihn ein, um E-Mails, URLs und Telefonnummern zu extrahieren",
  "copyAll": "Alle kopieren",
  "exportTxt": "TXT",
  "exportCsv": "CSV",
  "exportJson": "JSON",
  "copied": "Kopiert!",
  "downloaded": "Heruntergeladen!",
  "typeEmail": "E-Mail",
  "typeUrl": "URL",
  "typePhone": "Telefon",
  "summaryEmails": "{count} E-Mails",
  "summaryUrls": "{count} URLs",
  "summaryPhones": "{count} Telefonnummern",
  "summaryUnique": "{count} eindeutig",
  "summaryTotal": "{count} gesamt",
  "occurrences": "×{count}",
  "descriptions": {
    "formatsTitle": "Unterstützte Formate",
    "formatsEmail": "E-Mail",
    "formatsEmailDesc": "local-part@domain.tld — unterstützt +-Tags, Subdomains, mehrteilige TLDs",
    "formatsUrl": "URL",
    "formatsUrlDesc": "http:// und https:// — Pfade, Abfragezeichenfolgen, Fragmente",
    "formatsPhone": "Telefon",
    "formatsPhoneDesc": "Internationale Formate — Ländervorwahl, Klammern, Bindestriche, Punkte, Leerzeichen",
    "tipsTitle": "Tipps",
    "tip1": "Die Extraktion ist permisiv, keine Validierung — alle plausiblen Treffer werden zurückgegeben",
    "tip2": "Einzelne Typen mit den Umschaltbuttons ein-/ausschalten",
    "tip3": "Ergebnisse werden standardmäßig dedupliziert; \"Duplikate anzeigen\" aktivieren, um alle Treffer zu sehen"
  }
}
```

- [ ] **Step 6: Create `public/locales/ru/extractor.json`**

```json
{
  "inputPlaceholder": "Вставьте текст для извлечения email, URL и телефонных номеров...",
  "toggleEmail": "Email",
  "toggleUrl": "URL",
  "togglePhone": "Телефон",
  "showDuplicates": "Показать дубликаты",
  "resultsCount": "Найдено {unique} уникальных элементов ({total} совпадений всего)",
  "resultsCountAll": "Найдено {total} элементов",
  "noResults": "Элементы не найдены",
  "emptyState": "Вставьте или введите текст выше для извлечения email, URL и телефонных номеров",
  "copyAll": "Копировать все",
  "exportTxt": "TXT",
  "exportCsv": "CSV",
  "exportJson": "JSON",
  "copied": "Скопировано!",
  "downloaded": "Скачано!",
  "typeEmail": "Email",
  "typeUrl": "URL",
  "typePhone": "Телефон",
  "summaryEmails": "{count} email",
  "summaryUrls": "{count} URL",
  "summaryPhones": "{count} телефонов",
  "summaryUnique": "{count} уникальных",
  "summaryTotal": "{count} всего",
  "occurrences": "×{count}",
  "descriptions": {
    "formatsTitle": "Поддерживаемые форматы",
    "formatsEmail": "Email",
    "formatsEmailDesc": "local-part@domain.tld — поддержка +тегов, поддоменов, составных TLD",
    "formatsUrl": "URL",
    "formatsUrlDesc": "http:// и https:// — пути, строки запроса, фрагменты",
    "formatsPhone": "Телефон",
    "formatsPhoneDesc": "Международные форматы — код страны, скобки, дефисы, точки, пробелы",
    "tipsTitle": "Советы",
    "tip1": "Извлечение — не валидация, возвращаются все правдоподобные совпадения",
    "tip2": "Включайте/выключайте типы кнопками-переключателями",
    "tip3": "Результаты дедуплицируются по умолчанию; включите \"Показать дубликаты\" для всех совпадений"
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add public/locales/es/ public/locales/pt-BR/ public/locales/fr/ public/locales/de/ public/locales/ru/
git commit -m "feat(extractor): add Latin-script locale strings (es, pt-BR, fr, de, ru)"
```

---

### Task 7: Route Entry Page

**Files:**

- Create: `app/[locale]/extractor/page.tsx`

- [ ] **Step 1: Create `app/[locale]/extractor/page.tsx`**

Follow the same pattern as `textcase/page.tsx`:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import ExtractorPage from "./extractor-page";

const PATH = "/extractor";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("extractor.title"),
    description: t("extractor.description"),
  });
}

export default function ExtractorRoute() {
  return <ExtractorPage />;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/extractor/page.tsx
git commit -m "feat(extractor): add route entry page"
```

---

### Task 8: Page Component — UI and Logic

**Files:**

- Create: `app/[locale]/extractor/extractor-page.tsx`

This is the largest task. The component contains: input textarea, toggle chips, results list with dedup, export buttons, summary stats, and description section.

- [ ] **Step 1: Create `app/[locale]/extractor/extractor-page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download, Copy, FileText } from "lucide-react";
import Layout from "../../../components/layout";
import { StyledTextarea, StyledCheckbox } from "../../../components/ui/input";
import { CopyButton } from "../../../components/ui/copy-btn";
import { Button } from "../../../components/ui/button";
import { showToast } from "../../../libs/toast";
import { extract, type ExtractorType, type ExtractionResult } from "../../../libs/extractor/main";

const TYPE_COLORS: Record<ExtractorType, string> = {
  email: "bg-[#06d6a0]/15 text-[#06d6a0] border-[#06d6a0]/30",
  url: "bg-[#8b5cf6]/15 text-[#8b5cf6] border-[#8b5cf6]/30",
  phone: "bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/30",
};

const TYPE_ACTIVE_COLORS: Record<ExtractorType, string> = {
  email: "bg-[#06d6a0]/20 text-[#06d6a0] border-[#06d6a0] ring-1 ring-[#06d6a0]/40",
  url: "bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6] ring-1 ring-[#8b5cf6]/40",
  phone: "bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6] ring-1 ring-[#3b82f6]/40",
};

const TOGGLE_KEYS: ExtractorType[] = ["email", "url", "phone"];

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function Conversion() {
  const t = useTranslations("extractor");
  const tc = useTranslations("common");
  const [input, setInput] = useState("");
  const [enabledTypes, setEnabledTypes] = useState<Set<ExtractorType>>(
    new Set(["email", "url", "phone"])
  );
  const [showDuplicates, setShowDuplicates] = useState(false);

  const rawResults = extract(input, [...enabledTypes]);

  const dedupMap = new Map<string, { result: ExtractionResult; count: number }>();
  for (const r of rawResults) {
    const existing = dedupMap.get(r.value);
    if (existing) {
      existing.count++;
    } else {
      dedupMap.set(r.value, { result: r, count: 1 });
    }
  }

  const displayResults = showDuplicates ? rawResults : [...dedupMap.values()].map((d) => d.result);

  const stats = {
    email: rawResults.filter((r) => r.type === "email").length,
    url: rawResults.filter((r) => r.type === "url").length,
    phone: rawResults.filter((r) => r.type === "phone").length,
    total: rawResults.length,
    unique: dedupMap.size,
  };

  const hasResults = displayResults.length > 0;
  const hasInput = input.trim().length > 0;

  function toggleType(type: ExtractorType) {
    setEnabledTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  function getExportValues(): string[] {
    return displayResults.map((r) => r.value);
  }

  function handleCopyAll() {
    navigator.clipboard.writeText(getExportValues().join("\n"));
    showToast(t("copied"), "success");
  }

  function handleExportTxt() {
    downloadFile(getExportValues().join("\n"), "extracted.txt", "text/plain");
    showToast(t("downloaded"), "success");
  }

  function handleExportCsv() {
    const header = '"type","value"';
    const rows = displayResults.map((r) => `"${r.type}","${r.value.replace(/"/g, '""')}"`);
    downloadFile([header, ...rows].join("\n"), "extracted.csv", "text/csv");
    showToast(t("downloaded"), "success");
  }

  function handleExportJson() {
    const data = displayResults.map((r) => ({ type: r.type, value: r.value }));
    downloadFile(JSON.stringify(data, null, 2), "extracted.json", "application/json");
    showToast(t("downloaded"), "success");
  }

  return (
    <section id="conversion">
      <div className="relative">
        <StyledTextarea
          autoFocus
          rows={6}
          value={input}
          placeholder={t("inputPlaceholder")}
          onChange={(e) => setInput(e.target.value)}
          className="text-sm font-mono pr-9"
        />
        {input && (
          <button
            type="button"
            aria-label={tc("clear")}
            onClick={() => setInput("")}
            className="absolute right-3 top-3 text-fg-muted hover:text-fg-primary transition-colors cursor-pointer"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {TOGGLE_KEYS.map((type) => {
          const active = enabledTypes.has(type);
          const labelKey = `toggle${type.charAt(0).toUpperCase() + type.slice(1)}` as const;
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                active
                  ? TYPE_ACTIVE_COLORS[type]
                  : "bg-bg-elevated/40 text-fg-muted border-border-default hover:border-border-subtle"
              }`}
            >
              {t(labelKey)}
              {active && <span className="text-[10px]">✓</span>}
            </button>
          );
        })}
        <div className="ml-auto">
          <StyledCheckbox
            checked={showDuplicates}
            onChange={(e) => setShowDuplicates(e.target.checked)}
            label={t("showDuplicates")}
          />
        </div>
      </div>

      {hasInput && (
        <>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="text-sm text-fg-secondary font-medium">
              {showDuplicates
                ? t("resultsCountAll", { total: stats.total })
                : t("resultsCount", { unique: stats.unique, total: stats.total })}
            </span>
            {hasResults && (
              <div className="flex items-center gap-1.5 ml-auto">
                <Button variant="outline" size="sm" onClick={handleCopyAll} className="gap-1.5">
                  <Copy className="w-3.5 h-3.5" />
                  {t("copyAll")}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportTxt} className="gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  {t("exportTxt")}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5">
                  {t("exportCsv")}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportJson} className="gap-1.5">
                  {t("exportJson")}
                </Button>
              </div>
            )}
          </div>

          {hasResults ? (
            <div className="mt-3 rounded-lg border border-border-default overflow-hidden">
              <div className="divide-y divide-border-default">
                {displayResults.map((r, i) => {
                  const dupInfo = dedupMap.get(r.value);
                  const count = dupInfo ? dupInfo.count : 1;
                  return (
                    <div
                      key={`${r.value}-${i}`}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-accent-cyan/5 transition-colors"
                    >
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${TYPE_COLORS[r.type]}`}
                      >
                        {t(`type${r.type.charAt(0).toUpperCase() + r.type.slice(1)}` as const)}
                      </span>
                      <span className="flex-1 font-mono text-sm break-all">{r.value}</span>
                      {!showDuplicates && count > 1 && (
                        <span className="text-xs text-fg-muted font-mono">
                          {t("occurrences", { count })}
                        </span>
                      )}
                      <CopyButton
                        getContent={() => r.value}
                        className="opacity-60 hover:opacity-100 transition-opacity"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-3 text-center py-8 text-fg-muted text-sm">{t("noResults")}</div>
          )}

          {hasResults && (
            <div className="flex flex-wrap items-center gap-4 mt-3 px-1 text-xs text-fg-muted font-mono">
              {stats.email > 0 && <span>{t("summaryEmails", { count: stats.email })}</span>}
              {stats.url > 0 && <span>{t("summaryUrls", { count: stats.url })}</span>}
              {stats.phone > 0 && <span>{t("summaryPhones", { count: stats.phone })}</span>}
              <span className="ml-auto">
                {t("summaryUnique", { count: stats.unique })} /{" "}
                {t("summaryTotal", { count: stats.total })}
              </span>
            </div>
          )}
        </>
      )}

      {!hasInput && (
        <div className="mt-4 text-center py-8 text-fg-muted text-sm">{t("emptyState")}</div>
      )}
    </section>
  );
}

function Description() {
  const t = useTranslations("extractor");
  return (
    <section id="reference" className="mt-6">
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border-default" />
        <span className="font-mono text-xs font-semibold text-fg-muted uppercase tracking-wider">
          {t("descriptions.formatsTitle")}
        </span>
        <div className="flex-1 h-px bg-border-default" />
      </div>
      <div className="rounded-lg border border-border-default overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-default bg-bg-elevated/40">
              <th className="py-2 px-4 text-fg-muted text-xs font-mono font-medium text-left whitespace-nowrap uppercase tracking-wider">
                {t("descriptions.formatsTitle")}
              </th>
              <th className="py-2 px-4 text-fg-muted text-xs font-mono font-medium text-left whitespace-nowrap uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {(["email", "url", "phone"] as const).map((type) => {
              const labelKey = `formats${type.charAt(0).toUpperCase() + type.slice(1)}` as const;
              const descKey = `formats${type.charAt(0).toUpperCase() + type.slice(1)}Desc` as const;
              return (
                <tr
                  key={type}
                  className="border-b border-border-default last:border-b-0 odd:bg-bg-elevated/40 hover:bg-accent-cyan/10"
                >
                  <th
                    scope="row"
                    className="py-2.5 px-4 text-fg-secondary text-xs font-mono font-medium text-left whitespace-nowrap"
                  >
                    {t(`descriptions.${labelKey}`)}
                  </th>
                  <td className="py-2.5 px-4 text-sm text-fg-secondary">
                    {t(`descriptions.${descKey}`)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <h3 className="font-mono text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">
          {t("descriptions.tipsTitle")}
        </h3>
        <ul className="space-y-1 text-sm text-fg-secondary">
          <li>• {t("descriptions.tip1")}</li>
          <li>• {t("descriptions.tip2")}</li>
          <li>• {t("descriptions.tip3")}</li>
        </ul>
      </div>
    </section>
  );
}

export default function ExtractorPage() {
  const t = useTranslations("tools");
  const tc = useTranslations("common");
  return (
    <Layout title={t("extractor.shortTitle")}>
      <div className="container mx-auto px-4 pt-3 pb-6">
        <div className="flex items-start gap-2 border-l-2 border-accent-cyan bg-accent-cyan-dim/30 rounded-r-lg p-3 my-4">
          <span className="text-sm text-fg-secondary leading-relaxed">
            {tc("alert.notTransferred")}
          </span>
        </div>
        <Conversion />
        <Description />
      </div>
    </Layout>
  );
}
```

- [ ] **Step 2: Verify build compiles**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/extractor/extractor-page.tsx
git commit -m "feat(extractor): add page component with UI, export, and description"
```

---

### Task 9: Final Verification

- [ ] **Step 1: Run all tests**

Run: `npm run test`
Expected: All existing + new extractor tests pass.

- [ ] **Step 2: Run linter**

Run: `npx eslint libs/extractor/ app/[locale]/extractor/`
Expected: No errors.

- [ ] **Step 3: Verify dev server loads the page**

Run: `npm run dev`
Navigate to `http://localhost:3000/extractor` — should render the tool with input, toggles, and description.
Navigate to `http://localhost:3000/zh-CN/extractor` — should render Chinese version.
