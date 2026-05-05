# Deduplicate Lines Tool — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "Deduplicate Lines" tool at `/deduplines` that removes duplicate lines from text with options for case sensitivity, whitespace trimming, and empty line removal.

**Architecture:** Single-page tool following OmniKit's standard two-file pattern (`page.tsx` + `deduplines-page.tsx`). Core dedup logic in a pure function in `libs/deduplines/main.ts`, tested with Vitest. 10-locale translations.

**Tech Stack:** TypeScript, React (useState), next-intl, Tailwind CSS, Vitest, lucide-react

---

### Task 1: Core Logic — Failing Tests

**Files:**

- Create: `libs/deduplines/__tests__/main.test.ts`

- [ ] **Step 1: Create test file with all test cases**

```ts
import { describe, it, expect } from "vitest";
import { dedupLines, defaultOptions } from "../main";

describe("dedupLines", () => {
  it("returns empty output for empty input", () => {
    const result = dedupLines("", defaultOptions);
    expect(result.output).toBe("");
    expect(result.originalCount).toBe(1);
    expect(result.resultCount).toBe(0);
    expect(result.removedCount).toBe(1);
  });

  it("returns identical output when no duplicates exist", () => {
    const input = "apple\nbanana\ncherry";
    const result = dedupLines(input, defaultOptions);
    expect(result.output).toBe("apple\nbanana\ncherry");
    expect(result.originalCount).toBe(3);
    expect(result.resultCount).toBe(3);
    expect(result.removedCount).toBe(0);
  });

  it("removes exact duplicates keeping first occurrence", () => {
    const input = "apple\nbanana\napple\ncherry\nbanana";
    const result = dedupLines(input, defaultOptions);
    expect(result.output).toBe("apple\nbanana\ncherry");
    expect(result.originalCount).toBe(5);
    expect(result.resultCount).toBe(3);
    expect(result.removedCount).toBe(2);
  });

  it("is case insensitive when caseSensitive=false", () => {
    const input = "Hello\nhello\nHELLO";
    const result = dedupLines(input, { ...defaultOptions, caseSensitive: false });
    expect(result.output).toBe("Hello");
    expect(result.resultCount).toBe(1);
    expect(result.removedCount).toBe(2);
  });

  it("is case sensitive when caseSensitive=true", () => {
    const input = "Hello\nhello\nHELLO";
    const result = dedupLines(input, { ...defaultOptions, caseSensitive: true });
    expect(result.output).toBe("Hello\nhello\nHELLO");
    expect(result.resultCount).toBe(3);
  });

  it("trims whitespace for comparison when trimLines=true", () => {
    const input = "hello\n  hello  \nhello";
    const result = dedupLines(input, { ...defaultOptions, trimLines: true });
    expect(result.output).toBe("hello");
    expect(result.resultCount).toBe(1);
  });

  it("does not trim for comparison when trimLines=false", () => {
    const input = "hello\n  hello  ";
    const result = dedupLines(input, { ...defaultOptions, trimLines: false });
    expect(result.output).toBe("hello\n  hello  ");
    expect(result.resultCount).toBe(2);
  });

  it("preserves original text in output even when trimLines=true", () => {
    const input = "  hello  \nhello";
    const result = dedupLines(input, { ...defaultOptions, trimLines: true });
    expect(result.output).toBe("  hello  ");
  });

  it("removes empty lines when removeEmpty=true", () => {
    const input = "apple\n\nbanana\n  \ncherry";
    const result = dedupLines(input, { ...defaultOptions, removeEmpty: true });
    expect(result.output).toBe("apple\nbanana\ncherry");
    expect(result.originalCount).toBe(5);
    expect(result.resultCount).toBe(3);
  });

  it("keeps empty lines when removeEmpty=false", () => {
    const input = "apple\n\nbanana";
    const result = dedupLines(input, { ...defaultOptions, removeEmpty: false });
    expect(result.output).toBe("apple\n\nbanana");
    expect(result.resultCount).toBe(3);
  });

  it("normalizes \\r\\n line endings", () => {
    const input = "apple\r\nbanana\r\napple";
    const result = dedupLines(input, defaultOptions);
    expect(result.output).toBe("apple\nbanana");
  });

  it("normalizes \\r line endings", () => {
    const input = "apple\rbanana\rapple";
    const result = dedupLines(input, defaultOptions);
    expect(result.output).toBe("apple\nbanana");
  });

  it("handles mixed line endings", () => {
    const input = "a\r\nb\rc\na";
    const result = dedupLines(input, defaultOptions);
    expect(result.output).toBe("a\nb\nc");
  });

  it("preserves first-occurrence order", () => {
    const input = "cherry\napple\nbanana\napple\ncherry";
    const result = dedupLines(input, defaultOptions);
    expect(result.output).toBe("cherry\napple\nbanana");
  });

  it("handles trailing newline with removeEmpty=true", () => {
    const input = "apple\nbanana\n";
    const result = dedupLines(input, { ...defaultOptions, removeEmpty: true });
    expect(result.output).toBe("apple\nbanana");
    expect(result.originalCount).toBe(3);
    expect(result.resultCount).toBe(2);
  });

  it("handles trailing newline with removeEmpty=false", () => {
    const input = "apple\nbanana\n";
    const result = dedupLines(input, { ...defaultOptions, removeEmpty: false, trimLines: false });
    expect(result.output).toBe("apple\nbanana\n");
    expect(result.resultCount).toBe(3);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run libs/deduplines`
Expected: FAIL — module `../main` not found.

---

### Task 2: Core Logic — Implementation

**Files:**

- Create: `libs/deduplines/main.ts`

- [ ] **Step 1: Implement `dedupLines` function**

```ts
export interface DedupOptions {
  caseSensitive: boolean;
  trimLines: boolean;
  removeEmpty: boolean;
}

export const defaultOptions: DedupOptions = {
  caseSensitive: true,
  trimLines: true,
  removeEmpty: true,
};

export interface DedupResult {
  output: string;
  originalCount: number;
  resultCount: number;
  removedCount: number;
}

export function dedupLines(input: string, options: DedupOptions): DedupResult {
  const normalized = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const allLines = normalized.split("\n");
  const originalCount = allLines.length;

  let lines = allLines;
  if (options.removeEmpty) {
    lines = lines.filter((line) => line.trim() !== "");
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const line of lines) {
    let key = line;
    if (options.trimLines) {
      key = key.trim();
    }
    if (!options.caseSensitive) {
      key = key.toLowerCase();
    }
    if (!seen.has(key)) {
      seen.add(key);
      result.push(line);
    }
  }

  const resultCount = result.length;
  return {
    output: result.join("\n"),
    originalCount,
    resultCount,
    removedCount: originalCount - resultCount,
  };
}
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npx vitest run libs/deduplines`
Expected: All 16 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add libs/deduplines/main.ts libs/deduplines/__tests__/main.test.ts
git commit -m "feat(deduplines): add core dedup logic with tests"
```

---

### Task 3: Vitest Config

**Files:**

- Modify: `vitest.config.ts:5-18`

- [ ] **Step 1: Add deduplines to test include array**

Add `"libs/deduplines/**/*.test.ts"` to the `include` array in `vitest.config.ts`, after the existing `"libs/csv/**/*.test.ts"` line.

The `include` array becomes:

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
  "libs/deduplines/**/*.test.ts",
  "libs/__tests__/*.test.ts",
  "hooks/**/*.test.ts",
],
```

- [ ] **Step 2: Verify full test suite still passes**

Run: `npx vitest run`
Expected: All tests pass (including new deduplines tests).

- [ ] **Step 3: Commit**

```bash
git add vitest.config.ts
git commit -m "chore: add deduplines to vitest test scopes"
```

---

### Task 4: Tool Registration

**Files:**

- Modify: `libs/tools.ts:3-31` (imports)
- Modify: `libs/tools.ts:84-112` (TOOLS array)
- Modify: `libs/tools.ts:54-64` (TOOL_CATEGORIES)

- [ ] **Step 1: Add `ListFilter` import**

In `libs/tools.ts`, add `ListFilter` to the lucide-react import block (line 3-31). Add it after `ImageDown` on line 31.

The import becomes:

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
  ListFilter,
} from "lucide-react";
```

- [ ] **Step 2: Add entry to TOOLS array**

Add after the `textcase` entry (line 99):

```ts
  { key: "deduplines", path: "/deduplines", icon: ListFilter },
```

The TOOLS array becomes (showing context around insertion point):

```ts
  { key: "textcase", path: "/textcase", icon: CaseSensitive },
  { key: "deduplines", path: "/deduplines", icon: ListFilter },
  { key: "csv", path: "/csv", icon: FileSpreadsheet },
```

- [ ] **Step 3: Add to "text" category in TOOL_CATEGORIES**

In `TOOL_CATEGORIES`, add `"deduplines"` to the `text` tools array after `"textcase"`:

```ts
{ key: "text", tools: ["json", "regex", "diff", "markdown", "textcase", "deduplines"] },
```

- [ ] **Step 4: Commit**

```bash
git add libs/tools.ts
git commit -m "feat(deduplines): register tool in TOOLS array and categories"
```

---

### Task 5: English Translations

**Files:**

- Create: `public/locales/en/deduplines.json`
- Modify: `public/locales/en/tools.json` (add deduplines entry)

- [ ] **Step 1: Create `public/locales/en/deduplines.json`**

```json
{
  "inputPlaceholder": "Paste your text here...",
  "outputPlaceholder": "Unique lines will appear here...",
  "stats": "{original} lines → {result} lines (-{removed} duplicates)",
  "statsNoDupes": "{original} lines → no duplicates found",
  "options": {
    "caseSensitive": "Case Sensitive",
    "trimLines": "Trim Whitespace",
    "removeEmpty": "Remove Empty Lines"
  },
  "descriptions": {
    "whatIsTitle": "What is Line Deduplication?",
    "whatIsP1": "Line deduplication removes duplicate lines from text, keeping only the first occurrence of each unique line. The original order is preserved.",
    "howTitle": "How to Use",
    "howP1": "Paste your text in the input area. The result updates in real time. Use the options to control comparison behavior.",
    "howCase": "Case Sensitive: When checked, 'Hello' and 'hello' are treated as different lines.",
    "howTrim": "Trim Whitespace: When checked, leading and trailing spaces are ignored during comparison.",
    "howEmpty": "Remove Empty Lines: When checked, empty lines and whitespace-only lines are removed.",
    "useCasesTitle": "Common Use Cases",
    "useCasesP1": "Removing duplicate entries from log files.",
    "useCasesP2": "Cleaning up configuration files with repeated directives.",
    "useCasesP3": "Deduplicating rows in CSV data before processing."
  }
}
```

- [ ] **Step 2: Add entry to `public/locales/en/tools.json`**

Insert after the `textcase` entry (after line 106), before the `color` entry:

```json
  "deduplines": {
    "title": "Remove Duplicate Lines - Deduplicate Text Online",
    "shortTitle": "Deduplicate Lines",
    "description": "Remove duplicate lines from text. Options for case sensitivity, trim, empty lines. 100% client-side."
  },
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/en/deduplines.json public/locales/en/tools.json
git commit -m "feat(deduplines): add English translations"
```

---

### Task 6: CJK Translations (zh-CN, zh-TW, ja, ko)

**Files:**

- Create: `public/locales/zh-CN/deduplines.json`
- Create: `public/locales/zh-TW/deduplines.json`
- Create: `public/locales/ja/deduplines.json`
- Create: `public/locales/ko/deduplines.json`
- Modify: `public/locales/zh-CN/tools.json`
- Modify: `public/locales/zh-TW/tools.json`
- Modify: `public/locales/ja/tools.json`
- Modify: `public/locales/ko/tools.json`

- [ ] **Step 1: Create `public/locales/zh-CN/deduplines.json`**

```json
{
  "inputPlaceholder": "在此粘贴文本...",
  "outputPlaceholder": "去重后的行将显示在这里...",
  "stats": "{original} 行 → {result} 行（移除 {removed} 个重复行）",
  "statsNoDupes": "{original} 行 → 未发现重复行",
  "options": {
    "caseSensitive": "区分大小写",
    "trimLines": "去除首尾空白",
    "removeEmpty": "移除空行"
  },
  "descriptions": {
    "whatIsTitle": "什么是行去重？",
    "whatIsP1": "行去重工具可以移除文本中的重复行，仅保留每个唯一行的首次出现，并保持原始顺序。",
    "howTitle": "使用方法",
    "howP1": "将文本粘贴到输入区域，结果会实时更新。通过选项控制比较行为。",
    "howCase": "区分大小写：勾选后，'Hello' 和 'hello' 将被视为不同的行。",
    "howTrim": "去除首尾空白：勾选后，比较时会忽略每行首尾的空格。",
    "howEmpty": "移除空行：勾选后，空行和仅含空白的行将被移除。",
    "useCasesTitle": "常见用例",
    "useCasesP1": "清理日志文件中的重复条目。",
    "useCasesP2": "整理含有重复指令的配置文件。",
    "useCasesP3": "在处理前对 CSV 数据进行行去重。"
  }
}
```

- [ ] **Step 2: Create `public/locales/zh-TW/deduplines.json`**

```json
{
  "inputPlaceholder": "在此貼上文字...",
  "outputPlaceholder": "去重後的行將顯示在這裡...",
  "stats": "{original} 行 → {result} 行（移除 {removed} 個重複行）",
  "statsNoDupes": "{original} 行 → 未發現重複行",
  "options": {
    "caseSensitive": "區分大小寫",
    "trimLines": "去除首尾空白",
    "removeEmpty": "移除空行"
  },
  "descriptions": {
    "whatIsTitle": "什麼是行去重？",
    "whatIsP1": "行去重工具可以移除文字中的重複行，僅保留每個唯一行的首次出現，並保持原始順序。",
    "howTitle": "使用方法",
    "howP1": "將文字貼上到輸入區域，結果會即時更新。透過選項控制比較行為。",
    "howCase": "區分大小寫：勾選後，'Hello' 和 'hello' 將被視為不同的行。",
    "howTrim": "去除首尾空白：勾選後，比較時會忽略每行首尾的空格。",
    "howEmpty": "移除空行：勾選後，空行和僅含空白的行將被移除。",
    "useCasesTitle": "常見用途",
    "useCasesP1": "清理日誌檔案中的重複條目。",
    "useCasesP2": "整理含有重複指令的設定檔。",
    "useCasesP3": "在處理前對 CSV 資料進行行去重。"
  }
}
```

- [ ] **Step 3: Create `public/locales/ja/deduplines.json`**

```json
{
  "inputPlaceholder": "テキストをここに貼り付け...",
  "outputPlaceholder": "重複除去後の行がここに表示されます...",
  "stats": "{original} 行 → {result} 行（{removed} 件の重複を除去）",
  "statsNoDupes": "{original} 行 → 重複は見つかりませんでした",
  "options": {
    "caseSensitive": "大文字小文字を区別",
    "trimLines": "前後の空白を無視",
    "removeEmpty": "空行を削除"
  },
  "descriptions": {
    "whatIsTitle": "行の重複除去とは？",
    "whatIsP1": "行の重複除去ツールは、テキスト内の重複行を削除し、各一意行の最初の出現のみを残します。元の順序は維持されます。",
    "howTitle": "使い方",
    "howP1": "入力エリアにテキストを貼り付けると、リアルタイムで結果が更新されます。オプションで比較動作を制御できます。",
    "howCase": "大文字小文字を区別：チェックすると、'Hello' と 'hello' は異なる行として扱われます。",
    "howTrim": "前後の空白を無視：チェックすると、比較時に各行の前後のスペースを無視します。",
    "howEmpty": "空行を削除：チェックすると、空行と空白のみの行が削除されます。",
    "useCasesTitle": "よくある用途",
    "useCasesP1": "ログファイルの重複エントリの削除。",
    "useCasesP2": "重複ディレクティブを含む設定ファイルの整理。",
    "useCasesP3": "CSVデータの処理前の重複行除去。"
  }
}
```

- [ ] **Step 4: Create `public/locales/ko/deduplines.json`**

```json
{
  "inputPlaceholder": "여기에 텍스트를 붙여넣으세요...",
  "outputPlaceholder": "중복 제거된 행이 여기에 표시됩니다...",
  "stats": "{original}행 → {result}행 ({removed}개 중복 제거)",
  "statsNoDupes": "{original}행 → 중복이 없습니다",
  "options": {
    "caseSensitive": "대소문자 구분",
    "trimLines": "앞뒤 공백 무시",
    "removeEmpty": "빈 줄 제거"
  },
  "descriptions": {
    "whatIsTitle": "행 중복 제거란?",
    "whatIsP1": "행 중복 제거 도구는 텍스트에서 중복된 행을 제거하고, 각 고유 행의 첫 번째 항목만 유지합니다. 원래 순서는 유지됩니다.",
    "howTitle": "사용 방법",
    "howP1": "입력 영역에 텍스트를 붙여넣으면 결과가 실시간으로 업데이트됩니다. 옵션으로 비교 동작을 제어할 수 있습니다.",
    "howCase": "대소문자 구분: 체크하면 'Hello'와 'hello'가 다른 행으로 처리됩니다.",
    "howTrim": "앞뒤 공백 무시: 체크하면 비교 시 각 행 앞뒤의 공백을 무시합니다.",
    "howEmpty": "빈 줄 제거: 체크하면 빈 줄과 공백만 있는 줄이 제거됩니다.",
    "useCasesTitle": "일반적인 사용 사례",
    "useCasesP1": "로그 파일에서 중복 항목 제거.",
    "useCasesP2": "반복된 지시문이 있는 구성 파일 정리.",
    "useCasesP3": "CSV 데이터 처리 전 중복 행 제거."
  }
}
```

- [ ] **Step 5: Add `tools.json` entries for all 4 CJK locales**

For each CJK locale, insert a `"deduplines"` entry after the `"textcase"` entry, before `"color"`, in `public/locales/{locale}/tools.json`.

**zh-CN:**

```json
"deduplines": {
  "title": "文本行去重 - 在线去除重复行",
  "shortTitle": "行去重",
  "description": "移除文本中的重复行。支持大小写敏感、去除空白、移除空行等选项。100% 客户端处理。",
  "searchTerms": "quchonghang qrch quchong chongfu wenben"
},
```

**zh-TW:**

```json
"deduplines": {
  "title": "文字行去重 - 線上去除重複行",
  "shortTitle": "行去重",
  "description": "移除文字中的重複行。支援大小寫敏感、去除空白、移除空行等選項。100% 客戶端處理。",
  "searchTerms": "quchonghang qrch quchong chongfu wenben"
},
```

**ja:**

```json
"deduplines": {
  "title": "重複行削除 - テキストの重複行をオンラインで削除",
  "shortTitle": "重複行削除",
  "description": "テキストから重複行を削除。大文字小文字区別、前後空白無視、空行削除のオプション付き。100%ブラウザ上で処理。",
  "searchTerms": "jufukudousakujyo jfkdsk joufuku dyuipuriku hairetsu"
},
```

**ko:**

```json
"deduplines": {
  "title": "중복 행 제거 - 온라인 텍스트 중복 행 제거",
  "shortTitle": "중복 행 제거",
  "description": "텍스트에서 중복된 행을 제거합니다. 대소문자 구분, 공백 무시, 빈 줄 제거 옵션 제공. 100% 클라이언트 처리.",
  "searchTerms": "jungbokhaeng jbhg jungbok jaegidoeeonaen jungbokjegeo"
},
```

- [ ] **Step 6: Commit**

```bash
git add public/locales/zh-CN/deduplines.json public/locales/zh-TW/deduplines.json public/locales/ja/deduplines.json public/locales/ko/deduplines.json public/locales/zh-CN/tools.json public/locales/zh-TW/tools.json public/locales/ja/tools.json public/locales/ko/tools.json
git commit -m "feat(deduplines): add CJK translations (zh-CN, zh-TW, ja, ko)"
```

---

### Task 7: Latin-script Translations (es, pt-BR, fr, de, ru)

**Files:**

- Create: `public/locales/es/deduplines.json`
- Create: `public/locales/pt-BR/deduplines.json`
- Create: `public/locales/fr/deduplines.json`
- Create: `public/locales/de/deduplines.json`
- Create: `public/locales/ru/deduplines.json`
- Modify: `public/locales/es/tools.json`
- Modify: `public/locales/pt-BR/tools.json`
- Modify: `public/locales/fr/tools.json`
- Modify: `public/locales/de/tools.json`
- Modify: `public/locales/ru/tools.json`

- [ ] **Step 1: Create `public/locales/es/deduplines.json`**

```json
{
  "inputPlaceholder": "Pegue su texto aquí...",
  "outputPlaceholder": "Las líneas únicas aparecerán aquí...",
  "stats": "{original} líneas → {result} líneas (-{removed} duplicados)",
  "statsNoDupes": "{original} líneas → sin duplicados",
  "options": {
    "caseSensitive": "Distinguir mayúsculas",
    "trimLines": "Ignorar espacios",
    "removeEmpty": "Eliminar líneas vacías"
  },
  "descriptions": {
    "whatIsTitle": "¿Qué es la deduplicación de líneas?",
    "whatIsP1": "La deduplicación de líneas elimina las líneas duplicadas del texto, conservando solo la primera aparición de cada línea única. Se mantiene el orden original.",
    "howTitle": "Cómo usar",
    "howP1": "Pegue su texto en el área de entrada. El resultado se actualiza en tiempo real. Use las opciones para controlar el comportamiento de comparación.",
    "howCase": "Distinguir mayúsculas: Al marcar, 'Hola' y 'hola' se tratan como líneas diferentes.",
    "howTrim": "Ignorar espacios: Al marcar, los espacios al inicio y final se ignoran durante la comparación.",
    "howEmpty": "Eliminar líneas vacías: Al marcar, las líneas vacías y las que solo contienen espacios se eliminan.",
    "useCasesTitle": "Casos de uso comunes",
    "useCasesP1": "Eliminar entradas duplicadas en archivos de registro.",
    "useCasesP2": "Limpiar archivos de configuración con directivas repetidas.",
    "useCasesP3": "Deduplicar filas en datos CSV antes de procesarlos."
  }
}
```

- [ ] **Step 2: Create `public/locales/pt-BR/deduplines.json`**

```json
{
  "inputPlaceholder": "Cole seu texto aqui...",
  "outputPlaceholder": "As linhas únicas aparecerão aqui...",
  "stats": "{original} linhas → {result} linhas (-{removed} duplicatas)",
  "statsNoDupes": "{original} linhas → sem duplicatas",
  "options": {
    "caseSensitive": "Diferenciar maiúsculas",
    "trimLines": "Ignorar espaços",
    "removeEmpty": "Remover linhas vazias"
  },
  "descriptions": {
    "whatIsTitle": "O que é deduplicação de linhas?",
    "whatIsP1": "A deduplicação de linhas remove linhas duplicadas do texto, mantendo apenas a primeira ocorrência de cada linha única. A ordem original é preservada.",
    "howTitle": "Como usar",
    "howP1": "Cole seu texto na área de entrada. O resultado é atualizado em tempo real. Use as opções para controlar o comportamento de comparação.",
    "howCase": "Diferenciar maiúsculas: Quando marcado, 'Olá' e 'olá' são tratados como linhas diferentes.",
    "howTrim": "Ignorar espaços: Quando marcado, espaços no início e fim são ignorados durante a comparação.",
    "howEmpty": "Remover linhas vazias: Quando marcado, linhas vazias e com apenas espaços são removidas.",
    "useCasesTitle": "Casos de uso comuns",
    "useCasesP1": "Remover entradas duplicadas em arquivos de log.",
    "useCasesP2": "Limpar arquivos de configuração com diretivas repetidas.",
    "useCasesP3": "Deduplicar linhas em dados CSV antes do processamento."
  }
}
```

- [ ] **Step 3: Create `public/locales/fr/deduplines.json`**

```json
{
  "inputPlaceholder": "Collez votre texte ici...",
  "outputPlaceholder": "Les lignes uniques apparaîtront ici...",
  "stats": "{original} lignes → {result} lignes (-{removed} doublons)",
  "statsNoDupes": "{original} lignes → aucun doublon trouvé",
  "options": {
    "caseSensitive": "Sensible à la casse",
    "trimLines": "Ignorer les espaces",
    "removeEmpty": "Supprimer les lignes vides"
  },
  "descriptions": {
    "whatIsTitle": "Qu'est-ce que la déduplication de lignes ?",
    "whatIsP1": "La déduplication de lignes supprime les lignes en double du texte, en ne conservant que la première occurrence de chaque ligne unique. L'ordre original est préservé.",
    "howTitle": "Comment utiliser",
    "howP1": "Collez votre texte dans la zone de saisie. Le résultat se met à jour en temps réel. Utilisez les options pour contrôler le comportement de comparaison.",
    "howCase": "Sensible à la casse : si coché, 'Bonjour' et 'bonjour' sont traités comme des lignes différentes.",
    "howTrim": "Ignorer les espaces : si coché, les espaces en début et fin de ligne sont ignorés lors de la comparaison.",
    "howEmpty": "Supprimer les lignes vides : si coché, les lignes vides et les lignes ne contenant que des espaces sont supprimées.",
    "useCasesTitle": "Cas d'utilisation courants",
    "useCasesP1": "Suppression des entrées en double dans les fichiers de journalisation.",
    "useCasesP2": "Nettoyage des fichiers de configuration avec des directives répétées.",
    "useCasesP3": "Déduplication des lignes dans les données CSV avant traitement."
  }
}
```

- [ ] **Step 4: Create `public/locales/de/deduplines.json`**

```json
{
  "inputPlaceholder": "Text hier einfügen...",
  "outputPlaceholder": "Einzelne Zeilen werden hier angezeigt...",
  "stats": "{original} Zeilen → {result} Zeilen (-{removed} Duplikate)",
  "statsNoDupes": "{original} Zeilen → keine Duplikate gefunden",
  "options": {
    "caseSensitive": "Groß-/Kleinschreibung",
    "trimLines": "Leerzeichen ignorieren",
    "removeEmpty": "Leere Zeilen entfernen"
  },
  "descriptions": {
    "whatIsTitle": "Was ist Zeilendeduplizierung?",
    "whatIsP1": "Die Zeilendeduplizierung entfernt doppelte Zeilen aus dem Text und behält nur das erste Vorkommen jeder eindeutigen Zeile. Die ursprüngliche Reihenfolge bleibt erhalten.",
    "howTitle": "Verwendung",
    "howP1": "Fügen Sie Ihren Text in den Eingabebereich ein. Das Ergebnis wird in Echtzeit aktualisiert. Verwenden Sie die Optionen, um das Vergleichsverhalten zu steuern.",
    "howCase": "Groß-/Kleinschreibung: Wenn aktiviert, werden 'Hallo' und 'hallo' als unterschiedliche Zeilen behandelt.",
    "howTrim": "Leerzeichen ignorieren: Wenn aktiviert, werden führende und nachfolgende Leerzeichen beim Vergleich ignoriert.",
    "howEmpty": "Leere Zeilen entfernen: Wenn aktiviert, werden leere Zeilen und Zeilen mit nur Leerzeichen entfernt.",
    "useCasesTitle": "Häufige Anwendungsfälle",
    "useCasesP1": "Entfernen doppelter Einträge aus Protokolldateien.",
    "useCasesP2": "Bereinigen von Konfigurationsdateien mit wiederholten Direktiven.",
    "useCasesP3": "Deduplizierung von Zeilen in CSV-Daten vor der Verarbeitung."
  }
}
```

- [ ] **Step 5: Create `public/locales/ru/deduplines.json`**

```json
{
  "inputPlaceholder": "Вставьте текст сюда...",
  "outputPlaceholder": "Уникальные строки появятся здесь...",
  "stats": "{original} строк → {result} строк (-{removed} дубликатов)",
  "statsNoDupes": "{original} строк → дубликаты не найдены",
  "options": {
    "caseSensitive": "Учитывать регистр",
    "trimLines": "Игнорировать пробелы",
    "removeEmpty": "Удалить пустые строки"
  },
  "descriptions": {
    "whatIsTitle": "Что такое дедупликация строк?",
    "whatIsP1": "Дедупликация строк удаляет повторяющиеся строки из текста, оставляя только первое вхождение каждой уникальной строки. Исходный порядок сохраняется.",
    "howTitle": "Как использовать",
    "howP1": "Вставьте текст в область ввода. Результат обновляется в реальном времени. Используйте параметры для управления поведением сравнения.",
    "howCase": "Учитывать регистр: если отмечено, 'Привет' и 'привет' считаются разными строками.",
    "howTrim": "Игнорировать пробелы: если отмечено, начальные и конечные пробелы игнорируются при сравнении.",
    "howEmpty": "Удалить пустые строки: если отмечено, пустые строки и строки, содержащие только пробелы, удаляются.",
    "useCasesTitle": "Типичные случаи использования",
    "useCasesP1": "Удаление дубликатов из файлов журналов.",
    "useCasesP2": "Очистка файлов конфигурации с повторяющимися директивами.",
    "useCasesP3": "Дедупликация строк в данных CSV перед обработкой."
  }
}
```

- [ ] **Step 6: Add `tools.json` entries for all 5 Latin-script locales**

For each locale, insert a `"deduplines"` entry after the `"textcase"` entry, before `"color"`, in `public/locales/{locale}/tools.json`.

**es:**

```json
"deduplines": {
  "title": "Eliminar Líneas Duplicadas - Deduplicar Texto Online",
  "shortTitle": "Deduplicar Líneas",
  "description": "Elimina líneas duplicadas del texto. Opciones de sensibilidad a mayúsculas, espacios y líneas vacías. 100% del lado del cliente."
},
```

**pt-BR:**

```json
"deduplines": {
  "title": "Remover Linhas Duplicadas - Deduplicar Texto Online",
  "shortTitle": "Deduplicar Linhas",
  "description": "Remove linhas duplicadas do texto. Opções de diferenciação de maiúsculas, espaços e linhas vazias. 100% no navegador."
},
```

**fr:**

```json
"deduplines": {
  "title": "Supprimer les Lignes en Double - Dédupliquer le Texte en Ligne",
  "shortTitle": "Dédupliquer les Lignes",
  "description": "Supprime les lignes en double du texte. Options pour la casse, les espaces et les lignes vides. 100% côté client."
},
```

**de:**

```json
"deduplines": {
  "title": "Doppelte Zeilen Entfernen - Text Online Deduplizieren",
  "shortTitle": "Zeilen Deduplizieren",
  "description": "Entfernt doppelte Zeilen aus Text. Optionen für Groß-/Kleinschreibung, Leerzeichen und leere Zeilen. 100% clientseitig."
},
```

**ru:**

```json
"deduplines": {
  "title": "Удаление Дублирующихся Строк - Дедупликация Текста Онлайн",
  "shortTitle": "Дедупликация Строк",
  "description": "Удаляет дублирующиеся строки из текста. Настройки регистра, пробелов и пустых строк. 100% в браузере."
},
```

> Russian uses Cyrillic script which fuzzysort matches directly. No `searchTerms` needed — the `shortTitle` "Дедупликация Строк" is already searchable.

- [ ] **Step 7: Commit**

```bash
git add public/locales/es/deduplines.json public/locales/pt-BR/deduplines.json public/locales/fr/deduplines.json public/locales/de/deduplines.json public/locales/ru/deduplines.json public/locales/es/tools.json public/locales/pt-BR/tools.json public/locales/fr/tools.json public/locales/de/tools.json public/locales/ru/tools.json
git commit -m "feat(deduplines): add Latin-script translations (es, pt-BR, fr, de, ru)"
```

---

### Task 8: Route Entry Page

**Files:**

- Create: `app/[locale]/deduplines/page.tsx`

- [ ] **Step 1: Create the route entry file**

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import DeduplinesPage from "./deduplines-page";

const PATH = "/deduplines";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("deduplines.title"),
    description: t("deduplines.description"),
  });
}

export default function DeduplinesRoute() {
  return <DeduplinesPage />;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/deduplines/page.tsx
git commit -m "feat(deduplines): add route entry page"
```

---

### Task 9: Page Component

**Files:**

- Create: `app/[locale]/deduplines/deduplines-page.tsx`

- [ ] **Step 1: Create the page component**

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import { StyledTextarea, StyledCheckbox } from "../../../components/ui/input";
import { CopyButton } from "../../../components/ui/copy-btn";
import { showToast } from "../../../libs/toast";
import { dedupLines, defaultOptions } from "../../../libs/deduplines/main";
import type { DedupOptions } from "../../../libs/deduplines/main";

function Conversion() {
  const t = useTranslations("deduplines");
  const tc = useTranslations("common");
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<DedupOptions>(defaultOptions);

  const result = dedupLines(input, options);
  const hasInput = input.length > 0;
  const hasDuplicates = result.removedCount > 0;

  return (
    <section id="conversion">
      <div>
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan/60" />
            <span className="font-mono text-sm font-semibold text-accent-cyan">
              {tc("plainText")}
            </span>
          </div>
          <button
            type="button"
            className="text-danger text-xs hover:text-danger/80 transition-colors cursor-pointer"
            onClick={() => {
              setInput("");
              showToast(tc("cleared"), "danger", 2000);
            }}
          >
            {tc("clear")}
          </button>
        </div>
        <div className="relative mt-1">
          <StyledTextarea
            placeholder={t("inputPlaceholder")}
            rows={8}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="font-mono text-sm"
          />
          <CopyButton getContent={() => input} className="absolute end-2 top-2" />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <StyledCheckbox
          label={t("options.caseSensitive")}
          checked={options.caseSensitive}
          onChange={(e) => setOptions({ ...options, caseSensitive: e.target.checked })}
        />
        <StyledCheckbox
          label={t("options.trimLines")}
          checked={options.trimLines}
          onChange={(e) => setOptions({ ...options, trimLines: e.target.checked })}
        />
        <StyledCheckbox
          label={t("options.removeEmpty")}
          checked={options.removeEmpty}
          onChange={(e) => setOptions({ ...options, removeEmpty: e.target.checked })}
        />
      </div>

      {hasInput && (
        <>
          <div className="mt-3 flex flex-wrap justify-between items-center">
            <span className="text-fg-muted text-sm font-mono">
              {hasDuplicates
                ? t("stats", {
                    original: result.originalCount,
                    result: result.resultCount,
                    removed: result.removedCount,
                  })
                : t("statsNoDupes", { original: result.originalCount })}
            </span>
            <CopyButton getContent={() => result.output} />
          </div>
          <div className="relative mt-1">
            <StyledTextarea
              readOnly
              placeholder={t("outputPlaceholder")}
              rows={8}
              value={result.output}
              className="font-mono text-sm"
            />
          </div>
        </>
      )}
    </section>
  );
}

function Description() {
  const t = useTranslations("deduplines");
  return (
    <section id="description" className="mt-8">
      <div className="mb-4">
        <h2 className="font-semibold text-fg-primary text-base">{t("descriptions.whatIsTitle")}</h2>
        <div className="mt-1 space-y-1.5 text-fg-secondary text-sm leading-relaxed">
          <p>{t("descriptions.whatIsP1")}</p>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="font-semibold text-fg-primary text-base">{t("descriptions.howTitle")}</h2>
        <div className="mt-1 space-y-1.5 text-fg-secondary text-sm leading-relaxed">
          <p>{t("descriptions.howP1")}</p>
          <p>{t("descriptions.howCase")}</p>
          <p>{t("descriptions.howTrim")}</p>
          <p>{t("descriptions.howEmpty")}</p>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="font-semibold text-fg-primary text-base">
          {t("descriptions.useCasesTitle")}
        </h2>
        <div className="mt-1 space-y-1.5 text-fg-secondary text-sm leading-relaxed">
          <p>{t("descriptions.useCasesP1")}</p>
          <p>{t("descriptions.useCasesP2")}</p>
          <p>{t("descriptions.useCasesP3")}</p>
        </div>
      </div>
    </section>
  );
}

export default function DeduplinesPage() {
  const t = useTranslations("tools");
  const tc = useTranslations("common");
  return (
    <Layout title={t("deduplines.shortTitle")}>
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

- [ ] **Step 2: Verify the app builds**

Run: `npm run build`
Expected: Build succeeds with no TypeScript or compilation errors.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/deduplines/deduplines-page.tsx
git commit -m "feat(deduplines): add page component with Conversion and Description"
```

---

### Task 10: Final Verification

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No lint errors.

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Start dev server and smoke-test**

Run: `npm run dev`
Visit `http://localhost:3000/deduplines` and verify:

- Page loads with title "Deduplicate Lines"
- Privacy banner is visible
- Input textarea accepts text
- Three checkboxes are checked by default
- Typing duplicated lines shows deduplicated output in real time
- Stats line shows correct counts
- Clear button empties input
- Copy buttons work
- Description section renders

- [ ] **Step 5: Test with a different locale**

Visit `http://localhost:3000/zh-CN/deduplines` and verify:

- Title shows "行去重"
- All labels are in Chinese
- Functionality works the same
