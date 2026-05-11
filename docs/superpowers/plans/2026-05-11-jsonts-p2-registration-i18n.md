# JSON to TypeScript — Plan 2: Tool Registration & i18n

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Register the jsonts tool in the OmniKit tool registry and create translation files for all 10 locales.

**Prerequisite:** Plan 1 completed — `pluralize` installed, `libs/jsonts/main.ts` exists.

**Architecture:** Add the tool entry to `libs/tools.ts` (TOOLS, TOOL_CATEGORIES, TOOL_RELATIONS), add `jsonts` entries to all `tools.json` files, and create `jsonts.json` translation files for each locale.

**Tech Stack:** TypeScript, JSON (i18n)

---

## File Structure

| Action | File                               | Responsibility                                       |
| ------ | ---------------------------------- | ---------------------------------------------------- |
| Modify | `libs/tools.ts`                    | Add jsonts to TOOLS, TOOL_CATEGORIES, TOOL_RELATIONS |
| Modify | `public/locales/en/tools.json`     | English tool registration entry                      |
| Modify | `public/locales/zh-CN/tools.json`  | Simplified Chinese tool registration entry           |
| Modify | `public/locales/zh-TW/tools.json`  | Traditional Chinese tool registration entry          |
| Modify | `public/locales/ja/tools.json`     | Japanese tool registration entry                     |
| Modify | `public/locales/ko/tools.json`     | Korean tool registration entry                       |
| Modify | `public/locales/es/tools.json`     | Spanish tool registration entry                      |
| Modify | `public/locales/pt-BR/tools.json`  | Brazilian Portuguese tool registration entry         |
| Modify | `public/locales/fr/tools.json`     | French tool registration entry                       |
| Modify | `public/locales/de/tools.json`     | German tool registration entry                       |
| Modify | `public/locales/ru/tools.json`     | Russian tool registration entry                      |
| Create | `public/locales/en/jsonts.json`    | English tool-specific translations                   |
| Create | `public/locales/zh-CN/jsonts.json` | Simplified Chinese tool-specific translations        |
| Create | `public/locales/zh-TW/jsonts.json` | Traditional Chinese tool-specific translations       |
| Create | `public/locales/ja/jsonts.json`    | Japanese tool-specific translations                  |
| Create | `public/locales/ko/jsonts.json`    | Korean tool-specific translations                    |
| Create | `public/locales/es/jsonts.json`    | Spanish tool-specific translations                   |
| Create | `public/locales/pt-BR/jsonts.json` | Brazilian Portuguese tool-specific translations      |
| Create | `public/locales/fr/jsonts.json`    | French tool-specific translations                    |
| Create | `public/locales/de/jsonts.json`    | German tool-specific translations                    |
| Create | `public/locales/ru/jsonts.json`    | Russian tool-specific translations                   |

---

### Task 1: Tool Registration in libs/tools.ts

**Files:**

- Modify: `libs/tools.ts`

- [ ] **Step 1: Add FileCode2 import**

At the top of `libs/tools.ts`, add `FileCode2` to the lucide-react import. The import line currently starts with:

```ts
import {
  FileJson,
  FileCode,
```

Change to:

```ts
import {
  FileJson,
  FileCode,
  FileCode2,
```

- [ ] **Step 2: Add jsonts to TOOLS array**

In `libs/tools.ts`, find the `json` tool entry in the `TOOLS` array:

```ts
  {
    key: "json",
    path: "/json",
    icon: FileJson,
    emoji: "{}",
    sameAs: ["https://www.json.org", "https://datatracker.ietf.org/doc/html/rfc8259"],
  },
```

Insert the following **immediately after** the `json` entry (before the `base64` entry):

```ts
  {
    key: "jsonts",
    path: "/jsonts",
    icon: FileCode2,
    emoji: "🔷",
    sameAs: ["https://www.typescriptlang.org/"],
  },
```

- [ ] **Step 3: Add jsonts to TOOL_CATEGORIES**

In `libs/tools.ts`, find the `encoding` category in `TOOL_CATEGORIES`:

```ts
  {
    key: "encoding",
    tools: ["base64", "urlencoder", "csv", "csv-md", "numbase", "yaml", "storageunit"],
  },
```

Change to:

```ts
  {
    key: "encoding",
    tools: ["base64", "urlencoder", "jsonts", "csv", "csv-md", "numbase", "yaml", "storageunit"],
  },
```

- [ ] **Step 4: Add jsonts to TOOL_RELATIONS**

In `libs/tools.ts`, find `TOOL_RELATIONS` and make these changes:

**Add jsonts entry** — add a new key to `TOOL_RELATIONS` (after the `json` entry, before `base64`):

```ts
  jsonts: ["json", "csv", "yaml"],
```

**Add jsonts to json** — find the `json` entry:

```ts
  json: ["csv", "yaml", "diff", "regex"],
```

Change to:

```ts
  json: ["csv", "yaml", "diff", "regex", "jsonts"],
```

**Add jsonts to csv** — find the `csv` entry:

```ts
  csv: ["json", "yaml", "diff"],
```

Change to:

```ts
  csv: ["json", "yaml", "diff", "jsonts"],
```

**Add jsonts to yaml** — find the `yaml` entry:

```ts
  yaml: ["json", "csv", "markdown"],
```

Change to:

```ts
  yaml: ["json", "csv", "markdown", "jsonts"],
```

- [ ] **Step 5: Commit**

```bash
git add libs/tools.ts
git commit -m "feat(jsonts): register tool in TOOLS, TOOL_CATEGORIES, TOOL_RELATIONS"
```

---

### Task 2: English i18n Files

**Files:**

- Create: `public/locales/en/jsonts.json`
- Modify: `public/locales/en/tools.json`

- [ ] **Step 1: Create `public/locales/en/jsonts.json`**

```json
{
  "jsonInput": "JSON Input",
  "tsOutput": "TypeScript Output",
  "jsonPlaceholder": "Paste JSON or JSON5 here…",
  "tsPlaceholder": "TypeScript output will appear here",
  "rootName": "Root Name",
  "invalidJson": "Invalid JSON",
  "primitiveError": "Please enter a JSON object or array",
  "interface": "interface",
  "type": "type",
  "addExport": "Add export",
  "descriptions": {
    "aeoDefinition": "JSON to TypeScript is a free online tool that converts JSON or JSON5 into TypeScript interfaces and type definitions instantly in your browser. Supports nested objects, union types, array merging, and JSON5. No data is sent to any server.",
    "whatIsTitle": "What is JSON to TypeScript?",
    "whatIsP1": "JSON to TypeScript converts JSON data into TypeScript interface and type definitions. Paste any JSON — including JSON5 with comments and trailing commas — and get ready-to-use TypeScript types. Nested objects are automatically extracted into separate named types, and arrays of objects are intelligently merged.",
    "stepsTitle": "How to Use",
    "step1Title": "Paste your JSON",
    "step1Text": "Paste JSON or JSON5 data into the input area. The tool auto-detects JSON5 syntax.",
    "step2Title": "Configure options",
    "step2Text": "Set the root type name, choose between interface and type alias, and toggle the export keyword.",
    "step3Title": "Copy TypeScript output",
    "step3Text": "The TypeScript definitions appear instantly. Click copy to use them in your project.",
    "useCasesP1": "Generating TypeScript types from API responses. Creating type definitions for JSON config files. Converting JSON Schema data to TypeScript for static typing. Building type-safe data layers from mock data.",
    "limitationsP1": "The tool generates types from a single JSON sample — it cannot infer optional vs required fields unless an array of objects is provided. Union types are based on observed values only. Circular references are not supported.",
    "faq1Q": "Does it support JSON5?",
    "faq1A": "Yes. The tool automatically falls back to JSON5 parsing when standard JSON parsing fails. This means you can paste JSON with single quotes, trailing commas, comments, and unquoted keys.",
    "faq2Q": "What about nested objects?",
    "faq2A": "Nested objects are automatically extracted into separate named types. For example, a 'user' property containing an object will create a 'User' interface. Types are ordered so that referenced types appear before the types that use them.",
    "faq3Q": "Can I export the types?",
    "faq3A": "Yes. Toggle the 'Add export' switch to prepend the export keyword to each generated type. You can also choose between interface and type alias syntax."
  }
}
```

- [ ] **Step 2: Add jsonts entry to `public/locales/en/tools.json`**

Find the `json` entry in `public/locales/en/tools.json`:

```json
  "json": {
    "title": "JSON Formatter & Validator",
    "shortTitle": "JSON Format / Compress",
    "description": "Format, compress, and validate JSON. Pretty-print with configurable indentation, minify to single line, or parse JSON5."
  },
```

Insert immediately after the `json` entry (before `dbviewer`):

```json
  "jsonts": {
    "title": "JSON to TypeScript - Generate Interfaces & Types from JSON",
    "shortTitle": "JSON / TypeScript",
    "description": "Convert JSON or JSON5 to TypeScript interfaces and type definitions. Supports nested objects, union types, array merging, and JSON5."
  },
```

No `searchTerms` needed for English.

- [ ] **Step 3: Commit**

```bash
git add public/locales/en/jsonts.json public/locales/en/tools.json
git commit -m "feat(jsonts): add English i18n translations"
```

---

### Task 3: CJK Locale i18n (zh-CN, zh-TW, ja, ko)

**Files:**

- Modify: `public/locales/zh-CN/tools.json`
- Create: `public/locales/zh-CN/jsonts.json`
- Modify: `public/locales/zh-TW/tools.json`
- Create: `public/locales/zh-TW/jsonts.json`
- Modify: `public/locales/ja/tools.json`
- Create: `public/locales/ja/jsonts.json`
- Modify: `public/locales/ko/tools.json`
- Create: `public/locales/ko/jsonts.json`

- [ ] **Step 1: zh-CN tools.json entry**

Find the `json` entry in `public/locales/zh-CN/tools.json` and insert immediately after it:

```json
  "jsonts": {
    "title": "JSON 转 TypeScript - 生成接口和类型定义",
    "shortTitle": "JSON 转 TypeScript",
    "description": "将 JSON 或 JSON5 转换为 TypeScript 接口和类型定义。支持嵌套对象、联合类型、数组合并和 JSON5。100% 浏览器端处理。",
    "searchTerms": "jsonzhuantypescript jsonzts leixing jiekou"
  },
```

- [ ] **Step 2: Create `public/locales/zh-CN/jsonts.json`**

```json
{
  "jsonInput": "JSON 输入",
  "tsOutput": "TypeScript 输出",
  "jsonPlaceholder": "在此粘贴 JSON 或 JSON5…",
  "tsPlaceholder": "TypeScript 输出将在此显示",
  "rootName": "根类型名称",
  "invalidJson": "无效 JSON",
  "primitiveError": "请输入 JSON 对象或数组",
  "interface": "interface",
  "type": "type",
  "addExport": "添加 export",
  "descriptions": {
    "aeoDefinition": "JSON 转 TypeScript 是一款免费的在线工具，可将 JSON 或 JSON5 即时转换为 TypeScript 接口和类型定义。支持嵌套对象、联合类型、数组合并和 JSON5。所有处理均在浏览器中完成。",
    "whatIsTitle": "什么是 JSON 转 TypeScript？",
    "whatIsP1": "JSON 转 TypeScript 将 JSON 数据转换为 TypeScript 接口和类型定义。粘贴任意 JSON（包括带注释和尾随逗号的 JSON5），即可获得可直接使用的 TypeScript 类型。嵌套对象会自动提取为独立的命名类型，对象数组会智能合并。",
    "stepsTitle": "使用方法",
    "step1Title": "粘贴 JSON",
    "step1Text": "将 JSON 或 JSON5 数据粘贴到输入区域。工具会自动检测 JSON5 语法。",
    "step2Title": "配置选项",
    "step2Text": "设置根类型名称，选择 interface 或 type，开关 export 关键字。",
    "step3Title": "复制 TypeScript 输出",
    "step3Text": "TypeScript 定义即时生成。点击复制即可在项目中使用。",
    "useCasesP1": "从 API 响应生成 TypeScript 类型。为 JSON 配置文件创建类型定义。将 JSON 数据转换为 TypeScript 以实现静态类型检查。从 mock 数据构建类型安全的数据层。",
    "limitationsP1": "工具基于单个 JSON 样本生成类型，除非提供对象数组，否则无法推断可选字段与必填字段。联合类型仅基于观察到的值。不支持循环引用。",
    "faq1Q": "支持 JSON5 吗？",
    "faq1A": "支持。当标准 JSON 解析失败时，工具会自动回退到 JSON5 解析。你可以粘贴带单引号、尾随逗号、注释和无引号键的 JSON。",
    "faq2Q": "嵌套对象如何处理？",
    "faq2A": "嵌套对象会自动提取为独立的命名类型。例如，包含对象的 'user' 属性会创建 'User' 接口。类型按依赖顺序排列，被引用的类型出现在引用它的类型之前。",
    "faq3Q": "可以导出类型吗？",
    "faq3A": "可以。切换「添加 export」开关可为每个生成的类型添加 export 关键字。你还可以在 interface 和 type alias 语法之间选择。"
  }
}
```

- [ ] **Step 3: zh-TW tools.json entry**

Find the `json` entry in `public/locales/zh-TW/tools.json` and insert immediately after it:

```json
  "jsonts": {
    "title": "JSON 轉 TypeScript - 產生介面與型別定義",
    "shortTitle": "JSON 轉 TypeScript",
    "description": "將 JSON 或 JSON5 轉換為 TypeScript 介面與型別定義。支援巢狀物件、聯合型別、陣列合併和 JSON5。100% 瀏覽器端處理。",
    "searchTerms": "jsonzhuantypescript jsonzts leixing jiekou"
  },
```

- [ ] **Step 4: Create `public/locales/zh-TW/jsonts.json`**

```json
{
  "jsonInput": "JSON 輸入",
  "tsOutput": "TypeScript 輸出",
  "jsonPlaceholder": "在此貼上 JSON 或 JSON5…",
  "tsPlaceholder": "TypeScript 輸出將在此顯示",
  "rootName": "根型別名稱",
  "invalidJson": "無效 JSON",
  "primitiveError": "請輸入 JSON 物件或陣列",
  "interface": "interface",
  "type": "type",
  "addExport": "加入 export",
  "descriptions": {
    "aeoDefinition": "JSON 轉 TypeScript 是一款免費的線上工具，可將 JSON 或 JSON5 即時轉換為 TypeScript 介面與型別定義。支援巢狀物件、聯合型別、陣列合併和 JSON5。所有處理均在瀏覽器中完成。",
    "whatIsTitle": "什麼是 JSON 轉 TypeScript？",
    "whatIsP1": "JSON 轉 TypeScript 將 JSON 資料轉換為 TypeScript 介面與型別定義。貼上任意 JSON（包括帶註解和尾隨逗號的 JSON5），即可獲得可直接使用的 TypeScript 型別。巢狀物件會自動提取為獨立的命名型別，物件陣列會智慧合併。",
    "stepsTitle": "使用方法",
    "step1Title": "貼上 JSON",
    "step1Text": "將 JSON 或 JSON5 資料貼上到輸入區域。工具會自動偵測 JSON5 語法。",
    "step2Title": "設定選項",
    "step2Text": "設定根型別名稱，選擇 interface 或 type，切換 export 關鍵字。",
    "step3Title": "複製 TypeScript 輸出",
    "step3Text": "TypeScript 定義即時產生。點擊複製即可在專案中使用。",
    "useCasesP1": "從 API 回應產生 TypeScript 型別。為 JSON 設定檔建立型別定義。將 JSON 資料轉換為 TypeScript 以實現靜態型別檢查。從 mock 資料建構型別安全的資料層。",
    "limitationsP1": "工具基於單一 JSON 樣本產生型別，除非提供物件陣列，否則無法推斷可選欄位與必填欄位。聯合型別僅基於觀察到的值。不支援循環參考。",
    "faq1Q": "支援 JSON5 嗎？",
    "faq1A": "支援。當標準 JSON 解析失敗時，工具會自動回退到 JSON5 解析。你可以貼上帶單引號、尾隨逗號、註解和無引號鍵的 JSON。",
    "faq2Q": "巢狀物件如何處理？",
    "faq2A": "巢狀物件會自動提取為獨立的命名型別。例如，包含物件的 'user' 屬性會建立 'User' 介面。型別按依賴順序排列，被參考的型別出現在參考它的型別之前。",
    "faq3Q": "可以匯出型別嗎？",
    "faq3A": "可以。切換「加入 export」開關可為每個產生的型別加入 export 關鍵字。你還可以在 interface 和 type alias 語法之間選擇。"
  }
}
```

- [ ] **Step 5: ja tools.json entry**

Find the `json` entry in `public/locales/ja/tools.json` and insert immediately after it:

```json
  "jsonts": {
    "title": "JSON → TypeScript - インターフェースと型定義を生成",
    "shortTitle": "JSON → TypeScript",
    "description": "JSON または JSON5 を TypeScript のインターフェースと型定義に変換。ネストされたオブジェクト、ユニオン型、配列のマージ、JSON5 に対応。100%ブラウザ処理。",
    "searchTerms": "jsontotypescript jtts kata taipu"
  },
```

- [ ] **Step 6: Create `public/locales/ja/jsonts.json`**

```json
{
  "jsonInput": "JSON 入力",
  "tsOutput": "TypeScript 出力",
  "jsonPlaceholder": "JSON または JSON5 を貼り付けてください…",
  "tsPlaceholder": "TypeScript の出力がここに表示されます",
  "rootName": "ルート型名",
  "invalidJson": "無効な JSON",
  "primitiveError": "JSON オブジェクトまたは配列を入力してください",
  "interface": "interface",
  "type": "type",
  "addExport": "export を追加",
  "descriptions": {
    "aeoDefinition": "JSON to TypeScript は、JSON または JSON5 を TypeScript のインターフェースと型定義に即座に変換する無料オンラインツールです。ネストされたオブジェクト、ユニオン型、配列のマージ、JSON5 に対応。データはサーバーに送信されません。",
    "whatIsTitle": "JSON to TypeScript とは？",
    "whatIsP1": "JSON to TypeScript は JSON データを TypeScript のインターフェースと型定義に変換します。コメントや末尾カンマを含む JSON5 を貼り付けるだけで、すぐに使える TypeScript の型が得られます。ネストされたオブジェクトは自動的に別の名前付き型として抽出され、オブジェクトの配列はインテリジェントにマージされます。",
    "stepsTitle": "使い方",
    "step1Title": "JSON を貼り付け",
    "step1Text": "JSON または JSON5 データを入力エリアに貼り付けます。JSON5 構文は自動検出されます。",
    "step2Title": "オプションを設定",
    "step2Text": "ルート型名を設定し、interface または type を選択し、export キーワードを切り替えます。",
    "step3Title": "TypeScript 出力をコピー",
    "step3Text": "TypeScript 定義が即座に生成されます。コピーをクリックしてプロジェクトで使用してください。",
    "useCasesP1": "API レスポンスから TypeScript の型を生成。JSON 設定ファイルの型定義を作成。JSON データを TypeScript に変換して静的型付けを実現。モックデータから型安全なデータレイヤーを構築。",
    "limitationsP1": "単一の JSON サンプルから型を生成するため、オブジェクトの配列が提供されない限り、オプショナルフィールドと必須フィールドを推測できません。ユニオン型は観測された値のみに基づきます。循環参照には対応していません。",
    "faq1Q": "JSON5 に対応していますか？",
    "faq1A": "はい。標準の JSON パースに失敗すると、自動的に JSON5 パースにフォールバックします。シングルクォート、末尾カンマ、コメント、クォートなしのキーを含む JSON を貼り付けることができます。",
    "faq2Q": "ネストされたオブジェクトはどうなりますか？",
    "faq2A": "ネストされたオブジェクトは自動的に別の名前付き型として抽出されます。例えば、オブジェクトを含む 'user' プロパティは 'User' インターフェースを作成します。型は参照される型が参照する型の前にくるよう並べられます。",
    "faq3Q": "型をエクスポートできますか？",
    "faq3A": "はい。「export を追加」スイッチを切り替えて、生成された各型に export キーワードを追加できます。また、interface と type alias 構文のどちらかを選択できます。"
  }
}
```

- [ ] **Step 7: ko tools.json entry**

Find the `json` entry in `public/locales/ko/tools.json` and insert immediately after it:

```json
  "jsonts": {
    "title": "JSON → TypeScript - 인터페이스 및 타입 정의 생성",
    "shortTitle": "JSON → TypeScript",
    "description": "JSON 또는 JSON5를 TypeScript 인터페이스와 타입 정의로 변환합니다. 중첩 객체, 유니온 타입, 배열 병합, JSON5를 지원합니다. 100% 브라우저 처리.",
    "searchTerms": "jsontotypescript jtts taipu inteopeiseeu"
  },
```

- [ ] **Step 8: Create `public/locales/ko/jsonts.json`**

```json
{
  "jsonInput": "JSON 입력",
  "tsOutput": "TypeScript 출력",
  "jsonPlaceholder": "JSON 또는 JSON5를 여기에 붙여넣으세요…",
  "tsPlaceholder": "TypeScript 출력이 여기에 표시됩니다",
  "rootName": "루트 타입 이름",
  "invalidJson": "잘못된 JSON",
  "primitiveError": "JSON 객체 또는 배열을 입력하세요",
  "interface": "interface",
  "type": "type",
  "addExport": "export 추가",
  "descriptions": {
    "aeoDefinition": "JSON to TypeScript는 JSON 또는 JSON5를 TypeScript 인터페이스와 타입 정의로 즉시 변환하는 무료 온라인 도구입니다. 중첩 객체, 유니온 타입, 배열 병합, JSON5를 지원합니다. 데이터는 서버로 전송되지 않습니다.",
    "whatIsTitle": "JSON to TypeScript란?",
    "whatIsP1": "JSON to TypeScript는 JSON 데이터를 TypeScript 인터페이스와 타입 정의로 변환합니다. 주석과 후행 쉼표가 포함된 JSON5를 포함하여 모든 JSON을 붙여넣으면 바로 사용할 수 있는 TypeScript 타입을 얻을 수 있습니다. 중첩 객체는 자동으로 별도의 명명된 타입으로 추출되며, 객체 배열은 지능적으로 병합됩니다.",
    "stepsTitle": "사용 방법",
    "step1Title": "JSON 붙여넣기",
    "step1Text": "JSON 또는 JSON5 데이터를 입력 영역에 붙여넣습니다. JSON5 구문은 자동으로 감지됩니다.",
    "step2Title": "옵션 설정",
    "step2Text": "루트 타입 이름을 설정하고, interface 또는 type을 선택하고, export 키워드를 전환합니다.",
    "step3Title": "TypeScript 출력 복사",
    "step3Text": "TypeScript 정의가 즉시 생성됩니다. 복사를 클릭하여 프로젝트에서 사용하세요.",
    "useCasesP1": "API 응답에서 TypeScript 타입 생성. JSON 설정 파일의 타입 정의 작성. JSON 데이터를 TypeScript로 변환하여 정적 타입 검사 구현. 모의 데이터에서 타입 안전한 데이터 레이어 구축.",
    "limitationsP1": "이 도구는 단일 JSON 샘플에서 타입을 생성하므로, 객체 배열이 제공되지 않으면 선택 필드와 필수 필드를 추론할 수 없습니다. 유니온 타입은 관찰된 값만 기반으로 합니다. 순환 참조는 지원되지 않습니다.",
    "faq1Q": "JSON5를 지원하나요?",
    "faq1A": "네. 표준 JSON 파싱이 실패하면 자동으로 JSON5 파싱으로 대체됩니다. 작은따옴표, 후행 쉼표, 주석, 따옴표 없는 키가 포함된 JSON을 붙여넣을 수 있습니다.",
    "faq2Q": "중첩 객체는 어떻게 처리되나요?",
    "faq2A": "중첩 객체는 자동으로 별도의 명명된 타입으로 추출됩니다. 예를 들어, 객체를 포함하는 'user' 속성은 'User' 인터페이스를 생성합니다. 타입은 참조되는 타입이 참조하는 타입 앞에 오도록 정렬됩니다.",
    "faq3Q": "타입을 내보낼 수 있나요?",
    "faq3A": "네. 'export 추가' 스위치를 전환하여 생성된 각 타입에 export 키워드를 추가할 수 있습니다. 또한 interface와 type alias 구문 중에서 선택할 수 있습니다."
  }
}
```

- [ ] **Step 9: Commit CJK locales**

```bash
git add public/locales/zh-CN/jsonts.json public/locales/zh-CN/tools.json public/locales/zh-TW/jsonts.json public/locales/zh-TW/tools.json public/locales/ja/jsonts.json public/locales/ja/tools.json public/locales/ko/jsonts.json public/locales/ko/tools.json
git commit -m "feat(jsonts): add CJK locale translations (zh-CN, zh-TW, ja, ko)"
```

---

### Task 4: Latin-Script Locales (es, pt-BR, fr, de, ru)

**Files:**

- Modify: `public/locales/es/tools.json`
- Create: `public/locales/es/jsonts.json`
- Modify: `public/locales/pt-BR/tools.json`
- Create: `public/locales/pt-BR/jsonts.json`
- Modify: `public/locales/fr/tools.json`
- Create: `public/locales/fr/jsonts.json`
- Modify: `public/locales/de/tools.json`
- Create: `public/locales/de/jsonts.json`
- Modify: `public/locales/ru/tools.json`
- Create: `public/locales/ru/jsonts.json`

- [ ] **Step 1: es tools.json entry**

Find the `json` entry in `public/locales/es/tools.json` and insert immediately after it:

```json
  "jsonts": {
    "title": "JSON a TypeScript - Generar Interfaces y Tipos desde JSON",
    "shortTitle": "JSON → TypeScript",
    "description": "Convierte JSON o JSON5 a interfaces y definiciones de tipos TypeScript. Soporta objetos anidados, tipos unión, fusión de arrays y JSON5. 100% en el navegador."
  },
```

- [ ] **Step 2: Create `public/locales/es/jsonts.json`**

```json
{
  "jsonInput": "Entrada JSON",
  "tsOutput": "Salida TypeScript",
  "jsonPlaceholder": "Pega JSON o JSON5 aquí…",
  "tsPlaceholder": "La salida de TypeScript aparecerá aquí",
  "rootName": "Nombre raíz",
  "invalidJson": "JSON inválido",
  "primitiveError": "Introduce un objeto o array JSON",
  "interface": "interface",
  "type": "type",
  "addExport": "Añadir export",
  "descriptions": {
    "aeoDefinition": "JSON a TypeScript es una herramienta online gratuita que convierte JSON o JSON5 en interfaces y definiciones de tipos TypeScript al instante en tu navegador. Soporta objetos anidados, tipos unión, fusión de arrays y JSON5. No se envían datos a ningún servidor.",
    "whatIsTitle": "¿Qué es JSON a TypeScript?",
    "whatIsP1": "JSON a TypeScript convierte datos JSON en interfaces y definiciones de tipos TypeScript. Pega cualquier JSON — incluyendo JSON5 con comentarios y comas finales — y obtén tipos TypeScript listos para usar. Los objetos anidados se extraen automáticamente como tipos con nombre separados, y los arrays de objetos se fusionan inteligentemente.",
    "stepsTitle": "Cómo usar",
    "step1Title": "Pega tu JSON",
    "step1Text": "Pega datos JSON o JSON5 en el área de entrada. La herramienta detecta automáticamente la sintaxis JSON5.",
    "step2Title": "Configura las opciones",
    "step2Text": "Establece el nombre del tipo raíz, elige entre interface y type alias, y activa o desactiva la palabra clave export.",
    "step3Title": "Copia la salida TypeScript",
    "step3Text": "Las definiciones TypeScript aparecen al instante. Haz clic en copiar para usarlas en tu proyecto.",
    "useCasesP1": "Generar tipos TypeScript a partir de respuestas de API. Crear definiciones de tipos para archivos de configuración JSON. Convertir datos JSON a TypeScript para tipado estático. Construir capas de datos con seguridad de tipos a partir de datos mock.",
    "limitationsP1": "La herramienta genera tipos a partir de una sola muestra JSON — no puede inferir campos opcionales vs obligatorios a menos que se proporcione un array de objetos. Los tipos unión se basan únicamente en los valores observados. No se soportan referencias circulares.",
    "faq1Q": "¿Soporta JSON5?",
    "faq1A": "Sí. La herramienta recurre automáticamente al análisis JSON5 cuando el análisis JSON estándar falla. Puedes pegar JSON con comillas simples, comas finales, comentarios y claves sin comillas.",
    "faq2Q": "¿Qué pasa con los objetos anidados?",
    "faq2A": "Los objetos anidados se extraen automáticamente como tipos con nombre separados. Por ejemplo, una propiedad 'user' que contiene un objeto creará una interfaz 'User'. Los tipos se ordenan para que los tipos referenciados aparezcan antes que los que los usan.",
    "faq3Q": "¿Puedo exportar los tipos?",
    "faq3A": "Sí. Activa el interruptor 'Añadir export' para anteponer la palabra clave export a cada tipo generado. También puedes elegir entre sintaxis de interface y type alias."
  }
}
```

- [ ] **Step 3: pt-BR tools.json entry**

Find the `json` entry in `public/locales/pt-BR/tools.json` and insert immediately after it:

```json
  "jsonts": {
    "title": "JSON para TypeScript - Gerar Interfaces e Tipos a partir de JSON",
    "shortTitle": "JSON → TypeScript",
    "description": "Converta JSON ou JSON5 em interfaces e definições de tipos TypeScript. Suporta objetos aninhados, tipos união, mesclagem de arrays e JSON5. 100% no navegador."
  },
```

- [ ] **Step 4: Create `public/locales/pt-BR/jsonts.json`**

```json
{
  "jsonInput": "Entrada JSON",
  "tsOutput": "Saída TypeScript",
  "jsonPlaceholder": "Cole JSON ou JSON5 aqui…",
  "tsPlaceholder": "A saída TypeScript aparecerá aqui",
  "rootName": "Nome raiz",
  "invalidJson": "JSON inválido",
  "primitiveError": "Insira um objeto ou array JSON",
  "interface": "interface",
  "type": "type",
  "addExport": "Adicionar export",
  "descriptions": {
    "aeoDefinition": "JSON para TypeScript é uma ferramenta online gratuita que converte JSON ou JSON5 em interfaces e definições de tipos TypeScript instantaneamente no seu navegador. Suporta objetos aninhados, tipos união, mesclagem de arrays e JSON5. Nenhum dado é enviado a servidores.",
    "whatIsTitle": "O que é JSON para TypeScript?",
    "whatIsP1": "JSON para TypeScript converte dados JSON em interfaces e definições de tipos TypeScript. Cole qualquer JSON — incluindo JSON5 com comentários e vírgulas finais — e obtenha tipos TypeScript prontos para uso. Objetos aninhados são automaticamente extraídos como tipos nomeados separados, e arrays de objetos são mesclados inteligentemente.",
    "stepsTitle": "Como usar",
    "step1Title": "Cole seu JSON",
    "step1Text": "Cole dados JSON ou JSON5 na área de entrada. A ferramenta detecta automaticamente a sintaxe JSON5.",
    "step2Title": "Configure as opções",
    "step2Text": "Defina o nome do tipo raiz, escolha entre interface e type alias, e alterne a palavra-chave export.",
    "step3Title": "Copie a saída TypeScript",
    "step3Text": "As definições TypeScript aparecem instantaneamente. Clique em copiar para usá-las no seu projeto.",
    "useCasesP1": "Gerar tipos TypeScript a partir de respostas de API. Criar definições de tipos para arquivos de configuração JSON. Converter dados JSON para TypeScript para tipagem estática. Construir camadas de dados type-safe a partir de dados mock.",
    "limitationsP1": "A ferramenta gera tipos a partir de uma única amostra JSON — não pode inferir campos opcionais vs obrigatórios a menos que um array de objetos seja fornecido. Tipos união são baseados apenas nos valores observados. Referências circulares não são suportadas.",
    "faq1Q": "Suporta JSON5?",
    "faq1A": "Sim. A ferramenta recorre automaticamente à análise JSON5 quando a análise JSON padrão falha. Você pode colar JSON com aspas simples, vírgulas finais, comentários e chaves sem aspas.",
    "faq2Q": "E objetos aninhados?",
    "faq2A": "Objetos aninhados são automaticamente extraídos como tipos nomeados separados. Por exemplo, uma propriedade 'user' contendo um objeto criará uma interface 'User'. Os tipos são ordenados para que os tipos referenciados apareçam antes dos que os utilizam.",
    "faq3Q": "Posso exportar os tipos?",
    "faq3A": "Sim. Ative o interruptor 'Adicionar export' para adicionar a palavra-chave export a cada tipo gerado. Você também pode escolher entre a sintaxe de interface e type alias."
  }
}
```

- [ ] **Step 5: fr tools.json entry**

Find the `json` entry in `public/locales/fr/tools.json` and insert immediately after it:

```json
  "jsonts": {
    "title": "JSON vers TypeScript - Générer des Interfaces et Types depuis JSON",
    "shortTitle": "JSON → TypeScript",
    "description": "Convertissez du JSON ou JSON5 en interfaces et définitions de types TypeScript. Supporte les objets imbriqués, les types union, la fusion de tableaux et JSON5. 100% dans le navigateur."
  },
```

- [ ] **Step 6: Create `public/locales/fr/jsonts.json`**

```json
{
  "jsonInput": "Entrée JSON",
  "tsOutput": "Sortie TypeScript",
  "jsonPlaceholder": "Collez du JSON ou JSON5 ici…",
  "tsPlaceholder": "La sortie TypeScript apparaîtra ici",
  "rootName": "Nom racine",
  "invalidJson": "JSON invalide",
  "primitiveError": "Veuillez entrer un objet ou un tableau JSON",
  "interface": "interface",
  "type": "type",
  "addExport": "Ajouter export",
  "descriptions": {
    "aeoDefinition": "JSON vers TypeScript est un outil en ligne gratuit qui convertit du JSON ou JSON5 en interfaces et définitions de types TypeScript instantanément dans votre navigateur. Supporte les objets imbriqués, les types union, la fusion de tableaux et JSON5. Aucune donnée n'est envoyée à un serveur.",
    "whatIsTitle": "Qu'est-ce que JSON vers TypeScript ?",
    "whatIsP1": "JSON vers TypeScript convertit des données JSON en interfaces et définitions de types TypeScript. Collez n'importe quel JSON — y compris du JSON5 avec des commentaires et des virgules finales — et obtenez des types TypeScript prêts à l'emploi. Les objets imbriqués sont automatiquement extraits en types nommés séparés, et les tableaux d'objets sont fusionnés intelligemment.",
    "stepsTitle": "Comment utiliser",
    "step1Title": "Collez votre JSON",
    "step1Text": "Collez des données JSON ou JSON5 dans la zone de saisie. L'outil détecte automatiquement la syntaxe JSON5.",
    "step2Title": "Configurez les options",
    "step2Text": "Définissez le nom du type racine, choisissez entre interface et type alias, et activez ou désactivez le mot-clé export.",
    "step3Title": "Copiez la sortie TypeScript",
    "step3Text": "Les définitions TypeScript apparaissent instantanément. Cliquez sur copier pour les utiliser dans votre projet.",
    "useCasesP1": "Générer des types TypeScript à partir de réponses d'API. Créer des définitions de types pour des fichiers de configuration JSON. Convertir des données JSON en TypeScript pour un typage statique. Construire des couches de données type-safe à partir de données mock.",
    "limitationsP1": "L'outil génère des types à partir d'un seul échantillon JSON — il ne peut pas déduire les champs optionnels vs obligatoires sauf si un tableau d'objets est fourni. Les types union sont basés uniquement sur les valeurs observées. Les références circulaires ne sont pas supportées.",
    "faq1Q": "Supporte-t-il le JSON5 ?",
    "faq1A": "Oui. L'outil passe automatiquement à l'analyse JSON5 lorsque l'analyse JSON standard échoue. Vous pouvez coller du JSON avec des guillemets simples, des virgules finales, des commentaires et des clés sans guillemets.",
    "faq2Q": "Qu'en est-il des objets imbriqués ?",
    "faq2A": "Les objets imbriqués sont automatiquement extraits en types nommés séparés. Par exemple, une propriété 'user' contenant un objet créera une interface 'User'. Les types sont ordonnés de sorte que les types référencés apparaissent avant ceux qui les utilisent.",
    "faq3Q": "Puis-je exporter les types ?",
    "faq3A": "Oui. Activez l'interrupteur 'Ajouter export' pour ajouter le mot-clé export à chaque type généré. Vous pouvez également choisir entre la syntaxe interface et type alias."
  }
}
```

- [ ] **Step 7: de tools.json entry**

Find the `json` entry in `public/locales/de/tools.json` and insert immediately after it:

```json
  "jsonts": {
    "title": "JSON zu TypeScript - Interfaces und Typen aus JSON generieren",
    "shortTitle": "JSON → TypeScript",
    "description": "Konvertiert JSON oder JSON5 in TypeScript-Interfaces und Typdefinitionen. Unterstützt verschachtelte Objekte, Union-Typen, Array-Zusammenführung und JSON5. 100% im Browser."
  },
```

- [ ] **Step 8: Create `public/locales/de/jsonts.json`**

```json
{
  "jsonInput": "JSON-Eingabe",
  "tsOutput": "TypeScript-Ausgabe",
  "jsonPlaceholder": "JSON oder JSON5 hier einfügen…",
  "tsPlaceholder": "TypeScript-Ausgabe wird hier angezeigt",
  "rootName": "Root-Name",
  "invalidJson": "Ungültiges JSON",
  "primitiveError": "Bitte ein JSON-Objekt oder Array eingeben",
  "interface": "interface",
  "type": "type",
  "addExport": "Export hinzufügen",
  "descriptions": {
    "aeoDefinition": "JSON zu TypeScript ist ein kostenloses Online-Tool, das JSON oder JSON5 sofort in TypeScript-Interfaces und Typdefinitionen umwandelt. Unterstützt verschachtelte Objekte, Union-Typen, Array-Zusammenführung und JSON5. Keine Daten werden an Server gesendet.",
    "whatIsTitle": "Was ist JSON zu TypeScript?",
    "whatIsP1": "JSON zu TypeScript konvertiert JSON-Daten in TypeScript-Interfaces und Typdefinitionen. Fügen Sie beliebige JSON-Daten ein — einschließlich JSON5 mit Kommentaren und abschließenden Kommas — und erhalten Sie sofort verwendbare TypeScript-Typen. Verschachtelte Objekte werden automatisch als separate benannte Typen extrahiert, und Objekt-Arrays werden intelligent zusammengeführt.",
    "stepsTitle": "Verwendung",
    "step1Title": "JSON einfügen",
    "step1Text": "JSON- oder JSON5-Daten in den Eingabebereich einfügen. Das Tool erkennt JSON5-Syntax automatisch.",
    "step2Title": "Optionen konfigurieren",
    "step2Text": "Root-Typnamen festlegen, zwischen interface und type alias wählen und das export-Schlüsselwort umschalten.",
    "step3Title": "TypeScript-Ausgabe kopieren",
    "step3Text": "Die TypeScript-Definitionen erscheinen sofort. Auf Kopieren klicken, um sie im Projekt zu verwenden.",
    "useCasesP1": "TypeScript-Typen aus API-Antworten generieren. Typdefinitionen für JSON-Konfigurationsdateien erstellen. JSON-Daten für statische Typisierung in TypeScript konvertieren. Typsichere Datenschichten aus Mock-Daten aufbauen.",
    "limitationsP1": "Das Tool generiert Typen aus einer einzelnen JSON-Stichprobe — es kann optionale und Pflichtfelder nur ableiten, wenn ein Objekt-Array bereitgestellt wird. Union-Typen basieren nur auf beobachteten Werten. Zirkelverweise werden nicht unterstützt.",
    "faq1Q": "Wird JSON5 unterstützt?",
    "faq1A": "Ja. Das Tool greift automatisch auf JSON5-Parsing zurück, wenn das Standard-JSON-Parsing fehlschlägt. Sie können JSON mit einfachen Anführungszeichen, abschließenden Kommas, Kommentaren und Schlüsseln ohne Anführungszeichen einfügen.",
    "faq2Q": "Was passiert mit verschachtelten Objekten?",
    "faq2A": "Verschachtelte Objekte werden automatisch als separate benannte Typen extrahiert. Beispielsweise erstellt eine 'user'-Eigenschaft mit einem Objekt ein 'User'-Interface. Typen werden so angeordnet, dass referenzierte Typen vor den Typen erscheinen, die sie verwenden.",
    "faq3Q": "Kann ich die Typen exportieren?",
    "faq3A": "Ja. Schalten Sie den Schalter 'Export hinzufügen' um, um jedem generierten Typ das export-Schlüsselwort hinzuzufügen. Sie können auch zwischen Interface- und Type-Alias-Syntax wählen."
  }
}
```

- [ ] **Step 9: ru tools.json entry**

Find the `json` entry in `public/locales/ru/tools.json` and insert immediately after it:

```json
  "jsonts": {
    "title": "JSON в TypeScript - Генерация интерфейсов и типов из JSON",
    "shortTitle": "JSON → TypeScript",
    "description": "Конвертируйте JSON или JSON5 в интерфейсы и определения типов TypeScript. Поддерживает вложенные объекты, типы объединения, слияние массивов и JSON5. 100% в браузере."
  },
```

- [ ] **Step 10: Create `public/locales/ru/jsonts.json`**

```json
{
  "jsonInput": "Ввод JSON",
  "tsOutput": "Вывод TypeScript",
  "jsonPlaceholder": "Вставьте JSON или JSON5 сюда…",
  "tsPlaceholder": "Вывод TypeScript появится здесь",
  "rootName": "Имя корневого типа",
  "invalidJson": "Неверный JSON",
  "primitiveError": "Введите объект или массив JSON",
  "interface": "interface",
  "type": "type",
  "addExport": "Добавить export",
  "descriptions": {
    "aeoDefinition": "JSON в TypeScript — бесплатный онлайн-инструмент, который мгновенно конвертирует JSON или JSON5 в интерфейсы и определения типов TypeScript прямо в браузере. Поддерживает вложенные объекты, типы объединения, слияние массивов и JSON5. Данные не отправляются на сервер.",
    "whatIsTitle": "Что такое JSON в TypeScript?",
    "whatIsP1": "JSON в TypeScript конвертирует данные JSON в интерфейсы и определения типов TypeScript. Вставьте любой JSON — включая JSON5 с комментариями и конечными запятыми — и получите готовые к использованию типы TypeScript. Вложенные объекты автоматически извлекаются как отдельные именованные типы, а массивы объектов интеллектуально сливаются.",
    "stepsTitle": "Как использовать",
    "step1Title": "Вставьте JSON",
    "step1Text": "Вставьте данные JSON или JSON5 в область ввода. Инструмент автоматически определит синтаксис JSON5.",
    "step2Title": "Настройте параметры",
    "step2Text": "Установите имя корневого типа, выберите между interface и type alias, переключите ключевое слово export.",
    "step3Title": "Скопируйте вывод TypeScript",
    "step3Text": "Определения TypeScript появятся мгновенно. Нажмите «Копировать», чтобы использовать их в проекте.",
    "useCasesP1": "Генерация типов TypeScript из ответов API. Создание определений типов для JSON-файлов конфигурации. Конвертация данных JSON в TypeScript для статической типизации. Построение типобезопасных слоёв данных из моковых данных.",
    "limitationsP1": "Инструмент генерирует типы из одного образца JSON — он не может определить необязательные и обязательные поля, если не предоставлен массив объектов. Типы объединения основаны только на наблюдаемых значениях. Циклические ссылки не поддерживаются.",
    "faq1Q": "Поддерживается ли JSON5?",
    "faq1A": "Да. Инструмент автоматически переключается на парсинг JSON5, когда стандартный парсинг JSON не удаётся. Вы можете вставить JSON с одинарными кавычками, конечными запятыми, комментариями и ключами без кавычек.",
    "faq2Q": "Как обрабатываются вложенные объекты?",
    "faq2A": "Вложенные объекты автоматически извлекаются как отдельные именованные типы. Например, свойство 'user', содержащее объект, создаст интерфейс 'User'. Типы упорядочены так, что ссылочные типы появляются перед типами, которые их используют.",
    "faq3Q": "Можно ли экспортировать типы?",
    "faq3A": "Да. Переключите переключатель «Добавить export», чтобы добавить ключевое слово export к каждому сгенерированному типу. Вы также можете выбрать между синтаксисом interface и type alias."
  }
}
```

- [ ] **Step 11: Commit Latin locales**

```bash
git add public/locales/es/ public/locales/pt-BR/ public/locales/fr/ public/locales/de/ public/locales/ru/
git commit -m "feat(jsonts): add Latin locale translations (es, pt-BR, fr, de, ru)"
```

---

### Task 5: Verify Build

- [ ] **Step 1: Run TypeScript check**

Run:

```bash
npx tsc --noEmit --pretty 2>&1 | tail -20
```

Expected: No errors related to `jsonts` or `tools.ts`. If `FileCode2` import fails, verify `lucide-react` version supports it.

- [ ] **Step 2: Verify dev server starts**

Run:

```bash
npm run dev &
sleep 5
curl -s http://localhost:3000/jsonts 2>&1 | head -5
kill %1
```

Expected: HTML response (not 404). The page will show without styles since the page component doesn't exist yet (Plan 3).
