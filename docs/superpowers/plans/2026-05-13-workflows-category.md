# Workflows Category Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a new "Workflows" category and move the Recipe tool from Generators into it.

**Architecture:** Add `"workflows"` to the `ToolCategory` union, `CATEGORY_SLUGS`, and `TOOL_CATEGORIES` in `libs/tools.ts`. Create a category page following the existing pattern. Add breadcrumb props to Recipe's `<Layout>`. Add i18n keys across all 10 locales.

**Tech Stack:** Next.js App Router, TypeScript, next-intl, Tailwind CSS

---

## File Structure

| File                                                                      | Action | Responsibility                                                                |
| ------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------- |
| `libs/tools.ts`                                                           | Modify | Add `workflows` to type, slugs, categories; remove `recipe` from `generators` |
| `app/[locale]/workflows/page.tsx`                                         | Create | New category page (mirrors `text-processing/page.tsx`)                        |
| `app/[locale]/recipe/recipe-page.tsx`                                     | Modify | Add `categoryLabel`/`categorySlug` props to `<Layout>`                        |
| `public/locales/{en,zh-CN,zh-TW,ja,ko,es,pt-BR,fr,de,ru}/tools.json`      | Modify | Add `"workflows"` to `categories` object                                      |
| `public/locales/{en,zh-CN,zh-TW,ja,ko,es,pt-BR,fr,de,ru}/categories.json` | Modify | Add `workflows` top-level key                                                 |
| `public/locales/{en,zh-CN,zh-TW,ja,ko,es,pt-BR,fr,de,ru}/home.json`       | Modify | Add `catWorkflows` key                                                        |

---

### Task 1: Update Core Registry (`libs/tools.ts`)

**Files:**

- Modify: `libs/tools.ts:60` (ToolCategory type)
- Modify: `libs/tools.ts:67-74` (CATEGORY_SLUGS)
- Modify: `libs/tools.ts:110` (generators tools array)
- Modify: `libs/tools.ts:116` (TOOL_CATEGORIES end)

- [ ] **Step 1: Update ToolCategory union type**

In `libs/tools.ts` line 60, add `"workflows"` to the union:

```typescript
export type ToolCategory =
  | "text"
  | "encoding"
  | "security"
  | "generators"
  | "visual"
  | "reference"
  | "workflows";
```

- [ ] **Step 2: Add workflows to CATEGORY_SLUGS**

In `libs/tools.ts`, add to the `CATEGORY_SLUGS` object (after the `reference` entry):

```typescript
  workflows: "workflows",
```

- [ ] **Step 3: Remove recipe from generators and add workflows category**

In `libs/tools.ts`, change the generators entry at line 110 from:

```typescript
  { key: "generators", tools: ["uuid", "cron", "unixtime", "qrcode", "recipe"] },
```

to:

```typescript
  { key: "generators", tools: ["uuid", "cron", "unixtime", "qrcode"] },
```

Then add a new entry at the end of `TOOL_CATEGORIES` (after the `reference` entry):

```typescript
  { key: "workflows", tools: ["recipe"] },
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `tools.ts`. (Other pre-existing errors may exist.)

- [ ] **Step 5: Commit**

```bash
git add libs/tools.ts
git commit -m "feat(workflows): add workflows category to tool registry"
```

---

### Task 2: Create Workflows Category Page

**Files:**

- Create: `app/[locale]/workflows/page.tsx`
- Reference: `app/[locale]/text-processing/page.tsx`

- [ ] **Step 1: Create the category page**

Create `app/[locale]/workflows/page.tsx` with this content (following the exact pattern from `text-processing/page.tsx` but with `workflows` category key and only 2 FAQ items):

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildCategorySchema } from "../../../components/json-ld";
import { TOOL_CATEGORIES, TOOLS } from "../../../libs/tools";
import { SITE_URL } from "../../../libs/site";
import CategoryPage from "../../../components/category-page";

const CATEGORY_KEY = "workflows" as const;
const PATH = "/workflows";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "categories" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t(`${CATEGORY_KEY}.title`),
    description: t(`${CATEGORY_KEY}.description`),
    ogImage: { type: "category", key: CATEGORY_KEY },
  });
}

export default async function WorkflowsRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tc = await getTranslations({ locale, namespace: "categories" });

  const categoryTools = TOOL_CATEGORIES.find((c) => c.key === CATEGORY_KEY)!;
  const toolSchemas = categoryTools.tools.map((key) => ({
    name: t(`${key}.shortTitle`),
    url: `${SITE_URL}/${TOOLS.find((tool) => tool.key === key)!.path}`,
  }));

  const schemas = buildCategorySchema({
    name: tc(`${CATEGORY_KEY}.shortTitle`),
    description: tc(`${CATEGORY_KEY}.description`),
    path: PATH,
    tools: toolSchemas,
    faqItems: [1, 2]
      .map((i) =>
        tc.has(`${CATEGORY_KEY}.faq${i}Q`)
          ? { q: tc(`${CATEGORY_KEY}.faq${i}Q`), a: tc(`${CATEGORY_KEY}.faq${i}A`) }
          : null
      )
      .filter(Boolean) as { q: string; a: string }[],
  });

  return (
    <>
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
      <CategoryPage categoryKey={CATEGORY_KEY} />
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `workflows/page.tsx`.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/workflows/page.tsx
git commit -m "feat(workflows): add workflows category page"
```

---

### Task 3: Add Breadcrumb to Recipe Page

**Files:**

- Modify: `app/[locale]/recipe/recipe-page.tsx:107`

- [ ] **Step 1: Add categoryLabel and categorySlug to Layout**

In `app/[locale]/recipe/recipe-page.tsx`, change line 107 from:

```tsx
    <Layout title={t("recipe.shortTitle")}>
```

to:

```tsx
    <Layout title={t("recipe.shortTitle")} categoryLabel={t("categories.workflows")} categorySlug="workflows">
```

- [ ] **Step 2: Verify the app builds**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/recipe/recipe-page.tsx
git commit -m "feat(workflows): add workflows breadcrumb to recipe page"
```

---

### Task 4: English i18n (`en`)

**Files:**

- Modify: `public/locales/en/tools.json` (add `workflows` to `categories`)
- Modify: `public/locales/en/categories.json` (add `workflows` key)
- Modify: `public/locales/en/home.json` (add `catWorkflows`)

- [ ] **Step 1: Add workflows to tools.json categories**

In `public/locales/en/tools.json`, add to the `"categories"` object (after `"reference": "Reference & Lookup"`):

```json
    "workflows": "Workflows"
```

- [ ] **Step 2: Add workflows to categories.json**

In `public/locales/en/categories.json`, add a new top-level `"workflows"` key after the `"reference"` object:

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

- [ ] **Step 3: Add catWorkflows to home.json**

In `public/locales/en/home.json`, add after the `"catReferenceLookup"` line:

```json
  "catWorkflows": "Chain multiple operations into data processing pipelines and recipes.",
```

- [ ] **Step 4: Verify JSON is valid**

Run: `python3 -c "import json; [json.load(open(f'public/locales/en/{f}')) for f in ['tools.json','categories.json','home.json']]" && echo "OK"`
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add public/locales/en/tools.json public/locales/en/categories.json public/locales/en/home.json
git commit -m "feat(workflows): add English i18n for workflows category"
```

---

### Task 5: Simplified Chinese i18n (`zh-CN`)

**Files:**

- Modify: `public/locales/zh-CN/tools.json`
- Modify: `public/locales/zh-CN/categories.json`
- Modify: `public/locales/zh-CN/home.json`

- [ ] **Step 1: Add workflows to zh-CN/tools.json categories**

Add to the `"categories"` object:

```json
    "workflows": "工作流"
```

- [ ] **Step 2: Add workflows to zh-CN/categories.json**

Add a new top-level `"workflows"` key:

```json
  "workflows": {
    "title": "数据流水线与工作流工具 - Recipe 构建器",
    "shortTitle": "工作流",
    "description": "免费在线数据流水线与工作流工具。将多个文本、编码、加密操作串联为 Recipe。100% 浏览器端运行。",
    "intro": "1 个工作流工具，可让你将多个操作串联为数据处理流水线。通过组合文本处理、编码、哈希等步骤构建 Recipe，类似 CyberChef。所有数据留在你的浏览器中。",
    "faq1Q": "Recipe 工具是什么？",
    "faq1A": "Recipe 是一个数据流水线构建器，可以将多个操作串联在一起。例如，你可以先对文本进行 Base64 编码，然后哈希结果，再转换为大写——全部在一个流程中完成。",
    "faq2Q": "Recipe 支持哪些操作？",
    "faq2A": "Recipe 支持文本转换、编码/解码（Base64、URL、HTML）、哈希（MD5、SHA 系列）、加密、JSON/YAML 转换、正则操作等。新步骤持续添加中。"
  }
```

- [ ] **Step 3: Add catWorkflows to zh-CN/home.json**

Add:

```json
  "catWorkflows": "将多个操作串联为数据处理流水线和 Recipe。",
```

- [ ] **Step 4: Verify JSON is valid**

Run: `python3 -c "import json; [json.load(open(f'public/locales/zh-CN/{f}')) for f in ['tools.json','categories.json','home.json']]" && echo "OK"`
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add public/locales/zh-CN/tools.json public/locales/zh-CN/categories.json public/locales/zh-CN/home.json
git commit -m "feat(workflows): add zh-CN i18n for workflows category"
```

---

### Task 6: Traditional Chinese i18n (`zh-TW`)

**Files:**

- Modify: `public/locales/zh-TW/tools.json`
- Modify: `public/locales/zh-TW/categories.json`
- Modify: `public/locales/zh-TW/home.json`

- [ ] **Step 1: Add workflows to zh-TW/tools.json categories**

Add to the `"categories"` object:

```json
    "workflows": "工作流"
```

- [ ] **Step 2: Add workflows to zh-TW/categories.json**

Add a new top-level `"workflows"` key:

```json
  "workflows": {
    "title": "資料管線與工作流工具 - Recipe 建構器",
    "shortTitle": "工作流",
    "description": "免費線上資料管線與工作流工具。將多個文字、編碼、加密操作串聯為 Recipe。100% 瀏覽器端執行。",
    "intro": "1 個工作流工具，讓你將多個操作串聯為資料處理管線。透過組合文字處理、編碼、雜湊等步驟建構 Recipe，類似 CyberChef。所有資料留在你的瀏覽器中。",
    "faq1Q": "Recipe 工具是什麼？",
    "faq1A": "Recipe 是一個資料管線建構器，可以將多個操作串聯在一起。例如，你可以先對文字進行 Base64 編碼，然後雜湊結果，再轉換為大寫——全部在一個流程中完成。",
    "faq2Q": "Recipe 支援哪些操作？",
    "faq2A": "Recipe 支援文字轉換、編碼/解碼（Base64、URL、HTML）、雜湊（MD5、SHA 系列）、加密、JSON/YAML 轉換、正規表示式操作等。新步驟持續新增中。"
  }
```

- [ ] **Step 3: Add catWorkflows to zh-TW/home.json**

Add:

```json
  "catWorkflows": "將多個操作串聯為資料處理管線和 Recipe。",
```

- [ ] **Step 4: Verify JSON is valid**

Run: `python3 -c "import json; [json.load(open(f'public/locales/zh-TW/{f}')) for f in ['tools.json','categories.json','home.json']]" && echo "OK"`
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add public/locales/zh-TW/tools.json public/locales/zh-TW/categories.json public/locales/zh-TW/home.json
git commit -m "feat(workflows): add zh-TW i18n for workflows category"
```

---

### Task 7: Japanese i18n (`ja`)

**Files:**

- Modify: `public/locales/ja/tools.json`
- Modify: `public/locales/ja/categories.json`
- Modify: `public/locales/ja/home.json`

- [ ] **Step 1: Add workflows to ja/tools.json categories**

Add to the `"categories"` object:

```json
    "workflows": "ワークフロー"
```

- [ ] **Step 2: Add workflows to ja/categories.json**

Add a new top-level `"workflows"` key:

```json
  "workflows": {
    "title": "データパイプライン＆ワークフローツール - Recipe Builder",
    "shortTitle": "ワークフロー",
    "description": "無料のオンラインデータパイプライン＆ワークフローツール。テキスト、エンコーディング、暗号化操作をRecipeにチェーンできます。100%ブラウザ実行。",
    "intro": "1つのワークフローツールで、複数の操作をデータ処理パイプラインにチェーンできます。テキスト処理、エンコーディング、ハッシュなどのステップを組み合わせてRecipeを構築 — CyberChefスタイル。すべてのデータはブラウザ内に留まります。",
    "faq1Q": "Recipeツールとは？",
    "faq1A": "Recipeはデータパイプラインビルダーで、複数の操作をチェーンできます。例えば、テキストをBase64エンコードし、結果をハッシュし、大文字に変換 — すべて1つのフローで実行できます。",
    "faq2Q": "Recipeでどんな操作が使えますか？",
    "faq2A": "Recipeはテキスト変換、エンコード/デコード（Base64、URL、HTML）、ハッシュ（MD5、SHAファミリー）、暗号化、JSON/YAML変換、正規表現操作などをサポートしています。新しいステップは随時追加されています。"
  }
```

- [ ] **Step 3: Add catWorkflows to ja/home.json**

Add:

```json
  "catWorkflows": "複数の操作をデータ処理パイプラインとRecipeにチェーンできます。",
```

- [ ] **Step 4: Verify JSON is valid**

Run: `python3 -c "import json; [json.load(open(f'public/locales/ja/{f}')) for f in ['tools.json','categories.json','home.json']]" && echo "OK"`
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add public/locales/ja/tools.json public/locales/ja/categories.json public/locales/ja/home.json
git commit -m "feat(workflows): add ja i18n for workflows category"
```

---

### Task 8: Korean i18n (`ko`)

**Files:**

- Modify: `public/locales/ko/tools.json`
- Modify: `public/locales/ko/categories.json`
- Modify: `public/locales/ko/home.json`

- [ ] **Step 1: Add workflows to ko/tools.json categories**

Add to the `"categories"` object:

```json
    "workflows": "워크플로"
```

- [ ] **Step 2: Add workflows to ko/categories.json**

Add a new top-level `"workflows"` key:

```json
  "workflows": {
    "title": "데이터 파이프라인 & 워크플로 도구 - Recipe Builder",
    "shortTitle": "워크플로",
    "description": "무료 온라인 데이터 파이프라인 & 워크플로 도구. 텍스트, 인코딩, 암호화 작업을 Recipe로 체인할 수 있습니다. 100% 브라우저 실행.",
    "intro": "1개의 워크플로 도구로 여러 작업을 데이터 처리 파이프라인으로 체인할 수 있습니다. 텍스트 처리, 인코딩, 해시 등의 단계를 조합하여 Recipe를 구축 — CyberChef 스타일. 모든 데이터는 브라우저에 남습니다.",
    "faq1Q": "Recipe 도구란 무엇인가요?",
    "faq1A": "Recipe는 데이터 파이프라인 빌더로, 여러 작업을 체인할 수 있습니다. 예를 들어, 텍스트를 Base64로 인코딩하고, 결과를 해시하고, 대문자로 변환 — 모든 것을 하나의 흐름에서 처리할 수 있습니다.",
    "faq2Q": "Recipe에서 어떤 작업을 사용할 수 있나요?",
    "faq2A": "Recipe는 텍스트 변환, 인코딩/디코딩(Base64, URL, HTML), 해시(MD5, SHA 패밀리), 암호화, JSON/YAML 변환, 정규식 작업 등을 지원합니다. 새로운 단계는 계속 추가되고 있습니다."
  }
```

- [ ] **Step 3: Add catWorkflows to ko/home.json**

Add:

```json
  "catWorkflows": "여러 작업을 데이터 처리 파이프라인과 Recipe로 체인하세요.",
```

- [ ] **Step 4: Verify JSON is valid**

Run: `python3 -c "import json; [json.load(open(f'public/locales/ko/{f}')) for f in ['tools.json','categories.json','home.json']]" && echo "OK"`
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add public/locales/ko/tools.json public/locales/ko/categories.json public/locales/ko/home.json
git commit -m "feat(workflows): add ko i18n for workflows category"
```

---

### Task 9: Spanish i18n (`es`)

**Files:**

- Modify: `public/locales/es/tools.json`
- Modify: `public/locales/es/categories.json`
- Modify: `public/locales/es/home.json`

- [ ] **Step 1: Add workflows to es/tools.json categories**

Add to the `"categories"` object:

```json
    "workflows": "Flujos de trabajo"
```

- [ ] **Step 2: Add workflows to es/categories.json**

Add a new top-level `"workflows"` key:

```json
  "workflows": {
    "title": "Herramientas de Pipeline de Datos y Flujos de Trabajo - Recipe Builder",
    "shortTitle": "Flujos de trabajo",
    "description": "Herramientas gratuitas de pipeline de datos y flujos de trabajo para desarrolladores. Encadena operaciones de texto, codificación y criptografía en recetas. 100% en el navegador.",
    "intro": "1 herramienta de flujo de trabajo que te permite encadenar múltiples operaciones en un pipeline de procesamiento de datos. Construye recetas combinando pasos de procesamiento de texto, codificación, hashing y más — estilo CyberChef. Todos los datos permanecen en tu navegador.",
    "faq1Q": "¿Qué es la herramienta Recipe?",
    "faq1A": "Recipe es un constructor de pipelines de datos que te permite encadenar múltiples operaciones. Por ejemplo, puedes codificar texto en Base64, luego aplicar hash al resultado y convertir a mayúsculas — todo en un solo flujo.",
    "faq2Q": "¿Qué operaciones están disponibles en Recipe?",
    "faq2A": "Recipe soporta transformaciones de texto, codificación/decodificación (Base64, URL, HTML), hashing (MD5, familia SHA), cifrado, conversión JSON/YAML, operaciones con expresiones regulares y más. Nuevos pasos se añaden regularmente."
  }
```

- [ ] **Step 3: Add catWorkflows to es/home.json**

Add:

```json
  "catWorkflows": "Encadena múltiples operaciones en pipelines de procesamiento de datos y recetas.",
```

- [ ] **Step 4: Verify JSON is valid**

Run: `python3 -c "import json; [json.load(open(f'public/locales/es/{f}')) for f in ['tools.json','categories.json','home.json']]" && echo "OK"`
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add public/locales/es/tools.json public/locales/es/categories.json public/locales/es/home.json
git commit -m "feat(workflows): add es i18n for workflows category"
```

---

### Task 10: Brazilian Portuguese i18n (`pt-BR`)

**Files:**

- Modify: `public/locales/pt-BR/tools.json`
- Modify: `public/locales/pt-BR/categories.json`
- Modify: `public/locales/pt-BR/home.json`

- [ ] **Step 1: Add workflows to pt-BR/tools.json categories**

Add to the `"categories"` object:

```json
    "workflows": "Fluxos de trabalho"
```

- [ ] **Step 2: Add workflows to pt-BR/categories.json**

Add a new top-level `"workflows"` key:

```json
  "workflows": {
    "title": "Ferramentas de Pipeline de Dados e Fluxos de Trabalho - Recipe Builder",
    "shortTitle": "Fluxos de trabalho",
    "description": "Ferramentas gratuitas de pipeline de dados e fluxos de trabalho para desenvolvedores. Encadeie operações de texto, codificação e criptografia em receitas. 100% no navegador.",
    "intro": "1 ferramenta de fluxo de trabalho que permite encadear múltiplas operações em um pipeline de processamento de dados. Construa receitas combinando etapas de processamento de texto, codificação, hashing e mais — estilo CyberChef. Todos os dados permanecem no seu navegador.",
    "faq1Q": "O que é a ferramenta Recipe?",
    "faq1A": "Recipe é um construtor de pipelines de dados que permite encadear múltiplas operações. Por exemplo, você pode codificar texto em Base64, depois aplicar hash ao resultado e converter para maiúsculas — tudo em um único fluxo.",
    "faq2Q": "Quais operações estão disponíveis no Recipe?",
    "faq2A": "Recipe suporta transformações de texto, codificação/decodificação (Base64, URL, HTML), hashing (MD5, família SHA), criptografia, conversão JSON/YAML, operações com expressões regulares e mais. Novas etapas são adicionadas regularmente."
  }
```

- [ ] **Step 3: Add catWorkflows to pt-BR/home.json**

Add:

```json
  "catWorkflows": "Encadeie múltiplas operações em pipelines de processamento de dados e receitas.",
```

- [ ] **Step 4: Verify JSON is valid**

Run: `python3 -c "import json; [json.load(open(f'public/locales/pt-BR/{f}')) for f in ['tools.json','categories.json','home.json']]" && echo "OK"`
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add public/locales/pt-BR/tools.json public/locales/pt-BR/categories.json public/locales/pt-BR/home.json
git commit -m "feat(workflows): add pt-BR i18n for workflows category"
```

---

### Task 11: French i18n (`fr`)

**Files:**

- Modify: `public/locales/fr/tools.json`
- Modify: `public/locales/fr/categories.json`
- Modify: `public/locales/fr/home.json`

- [ ] **Step 1: Add workflows to fr/tools.json categories**

Add to the `"categories"` object:

```json
    "workflows": "Flux de travail"
```

- [ ] **Step 2: Add workflows to fr/categories.json**

Add a new top-level `"workflows"` key:

```json
  "workflows": {
    "title": "Outils de Pipeline de Données et Flux de Travail - Recipe Builder",
    "shortTitle": "Flux de travail",
    "description": "Outils gratuits de pipeline de données et flux de travail pour développeurs. Chaînez des opérations de texte, encodage et cryptographie en recettes. 100% côté client.",
    "intro": "1 outil de flux de travail qui vous permet de chaîner plusieurs opérations en un pipeline de traitement de données. Construisez des recettes en combinant des étapes de traitement de texte, d'encodage, de hachage et plus encore — style CyberChef. Toutes les données restent dans votre navigateur.",
    "faq1Q": "Qu'est-ce que l'outil Recipe ?",
    "faq1A": "Recipe est un constructeur de pipelines de données qui vous permet de chaîner plusieurs opérations. Par exemple, vous pouvez encoder du texte en Base64, puis hacher le résultat, puis convertir en majuscules — le tout en un seul flux.",
    "faq2Q": "Quelles opérations sont disponibles dans Recipe ?",
    "faq2A": "Recipe prend en charge les transformations de texte, l'encodage/décodage (Base64, URL, HTML), le hachage (MD5, famille SHA), le chiffrement, la conversion JSON/YAML, les opérations d'expressions régulières et plus encore. De nouvelles étapes sont ajoutées régulièrement."
  }
```

- [ ] **Step 3: Add catWorkflows to fr/home.json**

Add:

```json
  "catWorkflows": "Chaînez plusieurs opérations en pipelines de traitement de données et recettes.",
```

- [ ] **Step 4: Verify JSON is valid**

Run: `python3 -c "import json; [json.load(open(f'public/locales/fr/{f}')) for f in ['tools.json','categories.json','home.json']]" && echo "OK"`
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add public/locales/fr/tools.json public/locales/fr/categories.json public/locales/fr/home.json
git commit -m "feat(workflows): add fr i18n for workflows category"
```

---

### Task 12: German i18n (`de`)

**Files:**

- Modify: `public/locales/de/tools.json`
- Modify: `public/locales/de/categories.json`
- Modify: `public/locales/de/home.json`

- [ ] **Step 1: Add workflows to de/tools.json categories**

Add to the `"categories"` object:

```json
    "workflows": "Workflows"
```

- [ ] **Step 2: Add workflows to de/categories.json**

Add a new top-level `"workflows"` key:

```json
  "workflows": {
    "title": "Daten-Pipeline- & Workflow-Tools - Recipe Builder",
    "shortTitle": "Workflows",
    "description": "Kostenlose Online-Daten-Pipeline- und Workflow-Tools für Entwickler. Verketten Sie Text-, Codierungs- und Krypto-Operationen in Rezepten. 100% clientseitig.",
    "intro": "1 Workflow-Tool, mit dem Sie mehrere Operationen zu einer Datenverarbeitungspipeline verketten können. Erstellen Sie Rezepte durch Kombinieren von Textverarbeitungs-, Codierungs-, Hashing- und weiteren Schritten — CyberChef-Stil. Alle Daten bleiben in Ihrem Browser.",
    "faq1Q": "Was ist das Recipe-Tool?",
    "faq1A": "Recipe ist ein Daten-Pipeline-Builder, mit dem Sie mehrere Operationen verketten können. Beispielsweise können Sie Text Base64-kodieren, dann das Ergebnis hashen und in Großbuchstaben umwandeln — alles in einem Ablauf.",
    "faq2Q": "Welche Operationen sind in Recipe verfügbar?",
    "faq2A": "Recipe unterstützt Texttransformationen, Kodierung/Dekodierung (Base64, URL, HTML), Hashing (MD5, SHA-Familie), Verschlüsselung, JSON/YAML-Konvertierung, Regex-Operationen und mehr. Neue Schritte werden regelmäßig hinzugefügt."
  }
```

- [ ] **Step 3: Add catWorkflows to de/home.json**

Add:

```json
  "catWorkflows": "Verketten Sie mehrere Operationen zu Datenverarbeitungspipelines und Rezepten.",
```

- [ ] **Step 4: Verify JSON is valid**

Run: `python3 -c "import json; [json.load(open(f'public/locales/de/{f}')) for f in ['tools.json','categories.json','home.json']]" && echo "OK"`
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add public/locales/de/tools.json public/locales/de/categories.json public/locales/de/home.json
git commit -m "feat(workflows): add de i18n for workflows category"
```

---

### Task 13: Russian i18n (`ru`)

**Files:**

- Modify: `public/locales/ru/tools.json`
- Modify: `public/locales/ru/categories.json`
- Modify: `public/locales/ru/home.json`

- [ ] **Step 1: Add workflows to ru/tools.json categories**

Add to the `"categories"` object:

```json
    "workflows": "Рабочие процессы"
```

- [ ] **Step 2: Add workflows to ru/categories.json**

Add a new top-level `"workflows"` key:

```json
  "workflows": {
    "title": "Инструменты конвейеров данных и рабочих процессов - Recipe Builder",
    "shortTitle": "Рабочие процессы",
    "description": "Бесплатные онлайн-инструменты конвейеров данных и рабочих процессов для разработчиков. Объединяйте текстовые операции, кодирование и криптографию в рецепты. 100% в браузере.",
    "intro": "1 инструмент рабочих процессов, позволяющий объединять несколько операций в конвейер обработки данных. Создавайте рецепты, комбинируя шаги обработки текста, кодирования, хеширования и другие — в стиле CyberChef. Все данные остаются в вашем браузере.",
    "faq1Q": "Что такое инструмент Recipe?",
    "faq1A": "Recipe — это конструктор конвейеров данных, позволяющий объединять несколько операций. Например, вы можете кодировать текст в Base64, затем хешировать результат и преобразовать в верхний регистр — всё в одном потоке.",
    "faq2Q": "Какие операции доступны в Recipe?",
    "faq2A": "Recipe поддерживает преобразования текста, кодирование/декодирование (Base64, URL, HTML), хеширование (MD5, семейство SHA), шифрование, конвертацию JSON/YAML, операции с регулярными выражениями и многое другое. Новые шаги добавляются регулярно."
  }
```

- [ ] **Step 3: Add catWorkflows to ru/home.json**

Add:

```json
  "catWorkflows": "Объединяйте несколько операций в конвейеры обработки данных и рецепты.",
```

- [ ] **Step 4: Verify JSON is valid**

Run: `python3 -c "import json; [json.load(open(f'public/locales/ru/{f}')) for f in ['tools.json','categories.json','home.json']]" && echo "OK"`
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add public/locales/ru/tools.json public/locales/ru/categories.json public/locales/ru/home.json
git commit -m "feat(workflows): add ru i18n for workflows category"
```

---

### Task 14: Final Verification

- [ ] **Step 1: Run TypeScript check**

Run: `npx tsc --noEmit --pretty 2>&1 | tail -5`
Expected: No new errors.

- [ ] **Step 2: Run ESLint**

Run: `npx eslint libs/tools.ts app/[locale]/workflows/page.tsx app/[locale]/recipe/recipe-page.tsx 2>&1 | tail -10`
Expected: No errors.

- [ ] **Step 3: Run tests**

Run: `npm run test 2>&1 | tail -20`
Expected: All tests pass.

- [ ] **Step 4: Verify all 10 locale JSON files are valid**

Run: `python3 -c "
import json, os
locales = ['en','zh-CN','zh-TW','ja','ko','es','pt-BR','fr','de','ru']
files = ['tools.json','categories.json','home.json']
for loc in locales:
    for f in files:
        path = f'public/locales/{loc}/{f}'
        json.load(open(path))
        d = json.load(open(path))
        if f == 'tools.json':
            assert 'workflows' in d['categories'], f'{loc}/tools.json missing workflows category'
        if f == 'categories.json':
            assert 'workflows' in d, f'{loc}/categories.json missing workflows'
        if f == 'home.json':
            assert 'catWorkflows' in d, f'{loc}/home.json missing catWorkflows'
print('All 10 locales validated OK')
"`
Expected: `All 10 locales validated OK`

- [ ] **Step 5: Verify Recipe tool is not in generators anymore**

Run: `python3 -c "
import json

# This is a runtime check — verify the TypeScript source

content = open('libs/tools.ts').read()
assert '\"recipe\"' not in content.split('key: \"generators\"')[1].split('key: \"visual\"')[0], 'recipe still in generators'
assert '{ key: \"workflows\", tools: [\"recipe\"] }' in content, 'workflows category missing'
print('Registry check OK')
"`Expected:`Registry check OK`
