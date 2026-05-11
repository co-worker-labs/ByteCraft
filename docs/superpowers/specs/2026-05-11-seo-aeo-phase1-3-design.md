# SEO/AEO Phase 1-3 全量优化设计

> 日期：2026-05-11
> 基于：`docs/analysis/seo-aeo-audit-report.md`
> 工具总数：35

## 执行策略

分层并行：**内容层**（翻译文件）和**代码层**（组件/基础设施）无依赖，同时推进。

内容层先确定 key schema，代码层基于 schema 实现组件。

**增量交付原则**：内容补全按优先级分批推进，DescriptionSection 组件用 `t.has()` 守卫可选 key，确保翻译未就绪时 UI 不报错。

---

## 一、内容层

### 1.1 工具翻译文件 Key Schema

所有 35 个工具的 `public/locales/{locale}/{tool}.json` 统一遵循以下 schema。**已有内容的工具保持不动，只补全缺失 keys。**

```jsonc
{
  "descriptions": {
    // ✅ 必需：AEO 直接回答式描述（非 "X is a free online tool for..."）
    "aeoDefinition": "A JWT Debugger lets you decode and inspect JSON Web Tokens locally in your browser...",

    // ✅ 必需：What is X? — 支持两种格式，新内容统一用单段落
    "whatIsTitle": "What is a Hash?",
    "whatIs": "A hash is a fixed-size string generated from input data using a cryptographic algorithm. The same input always produces the same hash, but even a tiny change completely alters the output.",
    // 已有多段落格式的工具（json/base64/regex/diff 等）保留现有 whatIsP1/P2/P3，DescriptionSection 自动检测格式

    // ✅ 必需：使用场景（至少 2 个）— 标题+描述对格式
    "useCasesTitle": "Common Use Cases",
    "useCasesP1": "File Integrity Verification",
    "useCasesDesc1": "Verify that downloaded files haven't been tampered with by comparing their hash values.",
    "useCasesP2": "Password Storage",
    "useCasesDesc2": "Store password hashes instead of plaintext to protect user credentials.",
    // 可选：第 3 个使用场景
    "useCasesP3": "Digital Signatures",
    "useCasesDesc3": "Hash documents before signing to create compact, verifiable signatures.",

    // ✅ 必需：HowTo Steps（至少 3 步，高搜索量工具 4-5 步）
    "stepsTitle": "How to Calculate a Hash",
    "step1Title": "Enter your text",
    "step1Desc": "Type or paste the text you want to hash into the input field.",
    "step2Title": "Select algorithm",
    "step2Desc": "Choose from MD5, SHA-1, SHA-256, SHA-512, SHA3, or RIPEMD-160.",
    "step3Title": "Copy the result",
    "step3Desc": "Click the copy button next to the hash value you need.",
    // 可选：第 4/5 步
    "step4Title": "...",
    "step4Desc": "...",

    // ✅ 必需：FAQ（至少 3 个）
    "faq1Q": "What is cryptographic hashing?",
    "faq1A": "Cryptographic hashing converts input data into a fixed-size fingerprint (hash). The same input always produces the same hash, but even a tiny change completely alters the output.",
    "faq2Q": "Is hashing the same as encryption?",
    "faq2A": "No. Hashing is one-way — you cannot reverse a hash back to the original input. Encryption is two-way. Hashing is used for verification, not confidentiality.",
    "faq3Q": "Which hash algorithm should I use?",
    "faq3A": "For general purpose, SHA-256 offers the best balance of security and performance. Avoid MD5 and SHA-1 for security-sensitive applications.",
  },
}
```

**已有 key 格式兼容规则**：

| 现有格式                              | 示例工具                                                                | DescriptionSection 处理方式                                                  |
| ------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `whatIsP1/P2/P3`（多段落）            | json, base64, regex, diff, urlencoder                                   | 自动检测 `whatIs` 或 `whatIsP1`，用对应渲染方式                              |
| `whatIs`（单段落）                    | jwt, cron, numbase, wallet, bip39                                       | 直接渲染                                                                     |
| 无 whatIs                             | hashing, password, sshkey, color, qrcode, textcase, cipher, checksum 等 | `showWhatIs={false}` 或不设置（默认 true，`t.has()` 守卫跳过缺失 key）       |
| `useCasesP1`（纯段落，无标题+描述对） | json, base64, regex, diff, deduplines, csv, csv-md, yaml                | 保留现有格式，DescriptionSection 检测 `useCasesDesc1` 是否存在来决定渲染方式 |

**工具特定扩展保持不动**（如 Hashing 的 `hmacTitle`/`hmac`、Color 的颜色空间说明、Cipher 的算法说明），通过 `extraSections` slot 注入。

### 1.2 首页翻译文件（`home.json`）

更新已有 keys 并新增 keys：

```jsonc
{
  // 更新：嵌入工具关键词
  "title": "OmniKit - Free Online JSON, Base64, JWT, Regex Developer Tools",
  "metaDescription": "Free browser-based developer tools: JSON formatter, Base64 encoder, JWT debugger, regex tester, QR generator, hash calculator, and 25+ more. No data leaves your browser.",

  // 更新：工具数量（当前实际 35 个）
  "toolCount": "35+ free developer tools",
  "brandDescription": "OmniKit is a collection of 35+ free, browser-based developer tools — all processing happens locally in your browser. No sign-up, no tracking, no data ever leaves your device. Tools include a JSON formatter and validator, Base64 encoder and decoder, JWT debugger with signature verification, regex tester with real-time matching, QR code generator with logo support, hash calculator supporting MD5 through SHA-512 and beyond, encryption and decryption for AES and other ciphers, UUID generator, cron expression builder, text diff viewer, and many more. Built as a PWA, OmniKit works offline after the first visit. Open source and free forever.",

  // 新增：Why OmniKit?
  "whyTitle": "Why OmniKit?",
  "whyPrivacyTitle": "Privacy First",
  "whyPrivacyDesc": "All processing happens in your browser. No data is ever sent to any server.",
  "whyOfflineTitle": "Works Offline",
  "whyOfflineDesc": "Install as a PWA and use tools without internet connection.",
  "whyFreeTitle": "Free Forever",
  "whyFreeDesc": "Open source, no sign-up, no tracking, no premium tiers.",

  // 新增：分类简介
  "categoryIntroTitle": "Explore by Category",
  "catTextProcessing": "Format, transform, and analyze text and code with tools for JSON, regex, diff, and more.",
  "catEncodingConversion": "Convert between encodings and formats — Base64, URL encoding, number bases, YAML, CSV.",
  "catSecurityCrypto": "Encrypt, hash, and secure your data with JWT, hashing, cipher, SSH key, and password tools.",
  "catGenerators": "Generate UUIDs, QR codes, cron expressions, and timestamps.",
  "catVisualMedia": "Work with colors, images, and visual content.",
  "catReferenceLookup": "Look up ASCII codes, HTTP status codes, HTML entities, and more.",
}
```

### 1.3 语言覆盖

英文先行作为 source of truth，其余 9 种语言（zh-CN, zh-TW, ja, ko, es, pt-BR, fr, de, ru）基于英文本地化翻译。

翻译原则（参照 AGENTS.md）：

- 使用当地开发者社区的自然表达
- CJK 语言包含 searchTerms
- FAQ 针对**对话式搜索**优化（"How do I..." / "What's the difference..."）

### 1.4 内容补全工具列表（35 个）

所有工具全量补全，以 Password 工具为标杆：

json, base64, jwt, regex, uuid, hashing, urlencoder, unixtime, diff, password, sshkey, color, cron, markdown, qrcode, textcase, deduplines, csv, csv-md, cipher, numbase, dbviewer, checksum, storageunit, httpstatus, yaml, image, htmlcode, ascii, extractor, wordcounter, httpclient, **token-counter**, wallet, bip39

> 注意：`token-counter` 的翻译文件名是 `public/locales/{locale}/token-counter.json`，TOOLS key 是 `tokencounter`，路径是 `/token-counter`。

### 1.5 内容补全优先级矩阵

按内容完整度分三批，优先补全最薄弱的工具：

**第一批（内容最少，≤7 个 description keys，缺 3+ 核心区块）：**

| 工具       | 现有 FAQ | 需补全                        | 缺失项 |
| ---------- | -------- | ----------------------------- | ------ |
| textcase   | 2        | whatIs, useCases, steps, faq3 | 全部   |
| checksum   | 2        | whatIs, useCases, steps, faq3 | 全部   |
| hashing    | 2        | whatIs, useCases, steps, faq3 | 全部   |
| numbase    | 1        | useCases, steps, faq2, faq3   | 多项   |
| htmlcode   | 2        | whatIs, useCases, steps, faq3 | 多项   |
| httpstatus | 2        | whatIs, useCases, steps, faq3 | 多项   |

**第二批（有基础内容但缺 HowTo Steps）：**

| 工具     | 现有 FAQ | 需补全                              |
| -------- | -------- | ----------------------------------- |
| jwt      | 1        | steps, useCases, faq2, faq3         |
| qrcode   | 1        | whatIs, steps, useCases, faq2, faq3 |
| markdown | 1        | steps, useCases, faq2, faq3         |
| diff     | 1        | steps, faq2, faq3                   |
| cipher   | 1        | whatIs, steps, useCases, faq2, faq3 |
| color    | 3        | whatIs, steps, useCases             |
| uuid     | 2        | steps, useCases, faq3               |
| password | 3        | whatIs, useCases                    |
| sshkey   | 4        | whatIs, useCases                    |

**第三批（内容较完整，微调）：**

| 工具          | 现有 FAQ | 需补全                  |
| ------------- | -------- | ----------------------- |
| json          | 2        | steps, faq3             |
| base64        | 2        | steps, faq3             |
| regex         | 2        | steps, faq3             |
| urlencoder    | 3        | steps                   |
| deduplines    | 3        | steps                   |
| csv           | 2        | steps, faq3             |
| csv-md        | 3        | steps                   |
| yaml          | 3        | steps                   |
| cron          | 2        | steps, faq3             |
| unixtime      | 3        | steps                   |
| storageunit   | 2        | steps, faq3             |
| image         | 3        | whatIs, steps, useCases |
| extractor     | 3        | whatIs, steps, useCases |
| wordcounter   | 3        | steps, useCases         |
| httpclient    | 3        | whatIs, steps, useCases |
| token-counter | 3        | steps, useCases         |
| wallet        | 3        | steps, useCases         |
| bip39         | 2        | steps, faq3             |
| dbviewer      | 3        | steps, useCases         |
| ascii         | 2        | steps, faq3             |

---

## 二、代码层

### 2.1 共享 DescriptionSection 组件

**新文件**：`components/description-section.tsx`

```tsx
type DescriptionSectionProps = {
  namespace: string; // e.g. "hashing" → useTranslations("hashing")
  faqCount?: number; // 默认 3
  howToStepCount?: number; // 默认 3
  extraSections?: ReactNode; // 工具特定内容 slot
  showWhatIs?: boolean; // 默认 true
  showUseCases?: boolean; // 默认 true
  showHowTo?: boolean; // 默认 true
  showFaq?: boolean; // 默认 true
};
```

**渲染结构**：

```
DescriptionSection
├── aeoDefinition（左侧青色竖线引用块）— 复用现有样式
├── What is X?（h2 + 段落/多段落，自动检测格式）
├── Use Cases（h2 + 渲染方式自动检测：有 useCasesDesc1 → 标题/描述对；无 → 纯段落列表）
├── HowTo Steps（有序列表，带序号圆形标记）
├── extraSections（工具特定内容 slot）
└── FAQ（Accordion 组件）— 统一使用 Accordion
```

**key 检测逻辑**：

```tsx
// What is X? — 自动检测单段落 vs 多段落
const hasWhatIsP1 = t.has(`${ns}.descriptions.whatIsP1`);
// hasWhatIsP1 ? 渲染多段落 : 渲染单 whatIs

// Use Cases — 自动检测标题+描述对 vs 纯段落
const hasUseCasesDesc1 = t.has(`${ns}.descriptions.useCasesDesc1`);
// hasUseCasesDesc1 ? 标题/描述对渲染 : 纯段落列表渲染

// Steps — 用 howToStepCount 遍历，t.has() 守卫每步
// FAQ — 用 faqCount 遍历
```

**所有可选内容使用 `t.has()` 守卫**：key 不存在时整个区块静默跳过，不报错。这确保翻译分批交付时组件不会崩溃。

**迁移方式**：各工具 `*-page.tsx` 中，用 `DescriptionSection` 替换现有手写的 `Description` 组件。

```tsx
// 之前：每个工具手写 Description
// 之后：
<DescriptionSection namespace="hashing" extraSections={<HmacInfo />} />
```

工具特定内容（如 Hashing 的 HMAC 说明、Color 的色板说明、Cipher 的算法说明）通过 `extraSections` slot 注入。

**已知需特殊处理的工具**：

| 工具       | 特殊处理                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------- |
| hashing    | `extraSections` 注入 HMAC + 各算法说明（使用 `common` namespace 的 `algorithms.*` keys） |
| color      | `extraSections` 注入颜色空间说明 + 对比度说明 + 色觉模拟说明                             |
| cipher     | `extraSections` 注入 AES/DES/TripleDES/Rabbit/RC4 说明                                   |
| urlencoder | `extraSections` 注入三种模式对比表                                                       |
| base64     | `extraSections` 注入 Base64 字符表 + 编码方式说明                                        |
| json       | `extraSections` 注入 JSON5 说明 + 局限性                                                 |
| regex      | `extraSections` 注入 Features 列表 + 局限性                                              |
| extractor  | `extraSections` 注入格式表格 + Tips                                                      |

### 2.2 JSON-LD 数据流

DescriptionSection 组件只负责**客户端 UI 渲染**。JSON-LD 结构化数据由 `page.tsx`（Server Component）独立生成。

**数据流**：

```
page.tsx (Server Component)
  ├── getTranslations("tool-name") → 读取 descriptions.faq*Q/A, descriptions.step*Title/Desc
  ├── buildToolSchemas({ faqItems, howToSteps, sameAs, ... }) → 生成 JSON-LD <script>
  └── <ToolPage /> → 客户端组件

*-page.tsx (Client Component)
  └── <DescriptionSection namespace="tool-name" /> → useTranslations 读取同样的 keys 渲染 UI
```

**两侧读取相同的翻译 keys，确保 UI 和 JSON-LD 始终一致。** 这是解决审计报告 3.2 "FAQ UI 与 Schema 不一致"的根本方案。

**page.tsx FAQ/HowTo 数据提取模式**：

```ts
// page.tsx 中提取 FAQ 数据（复用已有模式）
const faqCount = 3; // 或工具特定数量
const faqItems = Array.from({ length: faqCount }, (_, i) => ({
  q: t(`descriptions.faq${i + 1}Q`),
  a: t(`descriptions.faq${i + 1}A`),
})).filter((item) => item.q); // 过滤掉空 key

const howToStepCount = 3; // 或工具特定数量
const howToSteps = Array.from({ length: howToStepCount }, (_, i) => ({
  name: t(`descriptions.step${i + 1}Title`),
  text: t(`descriptions.step${i + 1}Desc`),
})).filter((step) => step.name);
```

**各工具的 `page.tsx` 需要更新**：添加 HowTo 和 sameAs 数据传入 `buildToolSchemas()`。当前大多数 `page.tsx` 只传入 `faqItems`，需新增 `howToSteps` 和 `sameAs`。

### 2.3 OG Image 动态生成

**方案**：API route + `next/og` ImageResponse

**新文件**：`app/api/og/route.tsx`

- 接受 `?title=&icon=&desc=` 查询参数
- 使用 `next/og` 的 `ImageResponse` 生成 1200×630 图片
- Vercel Edge Runtime

**icon 参数**：使用 emoji 字符串（非 Lucide icon），每个工具在 `libs/tools.ts` 中映射：

```ts
// libs/tools.ts — ToolEntry 新增 emoji 字段
export interface ToolEntry {
  key: string;
  path: string;
  icon: LucideIcon;
  emoji: string; // OG image 用途
  sameAs?: string[];
}
```

emoji 映射示例：

| 工具     | emoji |
| -------- | ----- |
| json     | `{}`  |
| base64   | `🔢`  |
| jwt      | `🔐`  |
| regex    | `🔍`  |
| uuid     | `🆔`  |
| hashing  | `#️⃣`  |
| password | `🔑`  |
| qrcode   | `📱`  |
| color    | `🎨`  |

**视觉风格**（渐变品牌）：

- 深色背景（`#0b0f1a` → `#111827` 微渐变）
- emoji 图标（大号）+ 工具名称（白色粗体 monospace）
- 一句话描述（灰色）
- 底部 "OmniKit · omnikit.run"（青色）

**集成方式**：`libs/seo.ts` 的 `generatePageMeta()` 扩展 `openGraph.images` 参数：

```ts
type GenerateMetaOptions = {
  locale: string;
  path: string;
  title?: string;
  description: string;
  ogImage?: {
    title: string;
    emoji: string;
    desc: string;
  };
};
```

各工具 `page.tsx` 传入工具特定参数，`generatePageMeta()` 生成对应 URL：

```ts
openGraph: {
  // ... 现有字段
  images: ogImage
    ? [`/api/og?title=${encodeURIComponent(ogImage.title)}&icon=${encodeURIComponent(ogImage.emoji)}&desc=${encodeURIComponent(ogImage.desc)}`]
    : undefined,
}
```

**默认 OG Image**：`app/[locale]/layout.tsx` 中当前硬编码 `/og-image.svg`（第 69 行），更新为通用品牌 OG Image（不含工具特定内容），用于首页和非工具页面。

**部署注意**：README 中注明此方案依赖 Vercel Edge Runtime。自托管部署时需替换为 Satori + @resvg/resvg-js 方案。

### 2.4 sameAs 权威外链

`libs/tools.ts` 中 `ToolEntry` 新增可选 `sameAs` 字段：

```ts
export interface ToolEntry {
  key: string;
  path: string;
  icon: LucideIcon;
  emoji: string;
  sameAs?: string[];
}
```

`components/json-ld.tsx` 的 `buildToolSchemas()` 新增 `sameAs` option：

```ts
export function buildToolSchemas(options: {
  name: string;
  description: string;
  path: string;
  faqItems?: { q: string; a: string }[];
  howToSteps?: { name: string; text: string }[];
  categoryName?: string;
  categoryPath?: string;
  sameAs?: string[]; // 新增
}): object[];
```

WebApplication schema 中注入 sameAs：

```ts
schemas.push({
  "@type": ["WebApplication", "SoftwareApplication"],
  name,
  description,
  url,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  ...(sameAs ? { sameAs } : {}),
});
```

每个工具的 `page.tsx` 从 `TOOLS` 中获取 `sameAs`，传入 `buildToolSchemas()`。

**权威链接映射**（每个工具 1-2 个）：

| 工具       | sameAs                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------ |
| json       | `https://www.json.org`, `https://datatracker.ietf.org/doc/html/rfc8259`                          |
| base64     | `https://datatracker.ietf.org/doc/html/rfc4648`                                                  |
| jwt        | `https://datatracker.ietf.org/doc/html/rfc7519`, `https://en.wikipedia.org/wiki/JSON_Web_Token`  |
| regex      | `https://en.wikipedia.org/wiki/Regular_expression`                                               |
| uuid       | `https://datatracker.ietf.org/doc/html/rfc4122`, `https://datatracker.ietf.org/doc/html/rfc9562` |
| hashing    | `https://en.wikipedia.org/wiki/Cryptographic_hash_function`                                      |
| urlencoder | `https://developer.mozilla.org/en-US/docs/Glossary/percent-encoding`                             |
| password   | `https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html`                 |
| color      | `https://www.w3.org/TR/css-color-4/`                                                             |
| cron       | `https://en.wikipedia.org/wiki/Cron`                                                             |
| qrcode     | `https://en.wikipedia.org/wiki/QR_code`, `https://www.iso.org/standard/62021.html`               |
| cipher     | `https://en.wikipedia.org/wiki/Encryption`                                                       |
| checksum   | `https://en.wikipedia.org/wiki/Checksum`                                                         |
| diff       | `https://en.wikipedia.org/wiki/Diff_utility`                                                     |
| markdown   | `https://commonmark.org/`                                                                        |
| yaml       | `https://yaml.org/spec/`                                                                         |
| csv        | `https://datatracker.ietf.org/doc/html/rfc4180`                                                  |
| sshkey     | `https://datatracker.ietf.org/doc/html/rfc4251`                                                  |
| uuid       | `https://datatracker.ietf.org/doc/html/rfc4122`                                                  |
| 其他工具   | 相关标准/Wikipedia 页面（实现时逐个确定）                                                        |

### 2.5 loading.tsx / error.tsx

**新文件**：`app/[locale]/loading.tsx`

- 非客户端组件（自动 Suspense boundary）
- 全屏居中 spinner（accent-cyan 配色）
- "Loading..." 文字
- 参考 `app/[locale]/not-found.tsx` 的居中布局样式

```tsx
// 无需 "use client"
export default function Loading() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
        <p className="text-fg-secondary">Loading...</p>
      </div>
    </Layout>
  );
}
```

**新文件**：`app/[locale]/error.tsx`

- **必须是 `"use client"` 组件**（Next.js 要求 error boundary 是客户端组件）
- "Something went wrong" 标题
- 错误信息展示
- "Try again" 按钮（调用 `reset()`）
- 参考 `not-found.tsx` 的样式

```tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <h1 className="text-4xl font-bold text-fg-muted">Error</h1>
        <p className="text-fg-secondary">{error.message || "Something went wrong"}</p>
        <button
          onClick={reset}
          className="mt-2 rounded-full bg-accent-cyan px-6 py-2 text-sm font-semibold text-bg-base"
        >
          Try again
        </button>
      </div>
    </Layout>
  );
}
```

### 2.6 首页增强

`home-page.tsx` 底部结构变为：

```
HomeClient
├── HeroSection (不变)
├── QuickAccessSection (不变)
├── CategorySections / AllTools grid (不变)
├── brandDescription section (文案更新为 1.2 中的扩展版)
├── 🆕 Why OmniKit? section（三列卖点卡片：Privacy/Offline/Free）
├── 🆕 Explore by Category（6 个分类简介段落）
└── FAQ Accordion (不变)
```

`page.tsx` 同步更新 JSON-LD 注入：

- `metaDescription` 使用新内容
- WebSite/Organization schema description 同步更新

### 2.7 品牌 SEO 修正

**涉及文件和位置**：

- `components/json-ld.tsx` → `buildOrganizationSchema()` (第 29-39 行)
  - `description` → `"Browser-based developer tools platform"`
  - 渲染位置：`app/[locale]/layout.tsx` 第 108-111 行
- `components/json-ld.tsx` → `WebsiteJsonLd()` (第 3-27 行)
  - `description` 同步更新为新的 metaDescription
  - 渲染位置：`app/[locale]/layout.tsx` 第 107 行
- `app/[locale]/layout.tsx` 第 69 行
  - `openGraph.images` 默认图片更新（从 `/og-image.svg` 改为通用品牌 OG Image 或 `/api/og?title=OmniKit&icon=🛠&desc=...`）
- 确保首页 `<title>` 不单独使用 "Kit"
- `home.json` `toolCount` 从 "32+" 更新为 "35+"
- `home.json` `brandDescription` 从 "32+" 更新为 "35+"

### 2.8 AboutPage Schema（审计报告 P2 4.1）

**涉及文件**：`components/json-ld.tsx`、`app/[locale]/page.tsx`

在首页 `page.tsx` 的 JSON-LD 中新增 `AboutPage` schema：

```ts
schemas.push({
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About OmniKit",
  description: t("brandDescription"),
  url: `${SITE_URL}`,
  mainEntity: {
    "@type": "Organization",
    name: "OmniKit",
    url: SITE_URL,
  },
});
```

与现有的 WebApplication + FAQPage schema 并列注入。

### 2.9 JSON 工具 FAQ UI 修复（审计报告 3.2）

**问题**：JSON 工具的 `page.tsx` 注入了 FAQ JSON-LD schema，但 `json-page.tsx` 的 `Description` 组件中**没有渲染 FAQ 区块**。

**修复**：迁移到 `DescriptionSection` 后自动解决 — 统一渲染 FAQ Accordion。JSON 工具已有 2 个 FAQ keys (`faq1Q/A`, `faq2Q/A`)，迁移时补充 `faq3Q/A`。

同样的问题可能存在于其他工具（如 Diff 只有 1 个 FAQ 在 UI 中但 schema 注入了更多）。迁移到 `DescriptionSection` 时统一修复。

---

## 三、涉及文件清单

### 内容层

| 文件模式                              | 数量          | 变更                                         |
| ------------------------------------- | ------------- | -------------------------------------------- |
| `public/locales/{locale}/{tool}.json` | 35 × 10 = 350 | 补全 aeoDefinition/WhatIs/UseCases/HowTo/FAQ |
| `public/locales/{locale}/home.json`   | 10            | 更新 title/metaDescription + 新增 keys       |

### 代码层

| 文件                                 | 变更                                                                                          |
| ------------------------------------ | --------------------------------------------------------------------------------------------- |
| `components/description-section.tsx` | **新增** — 共享 Description 渲染组件                                                          |
| `app/api/og/route.tsx`               | **新增** — OG Image 动态生成                                                                  |
| `libs/seo.ts`                        | 扩展 `GenerateMetaOptions` 支持 `ogImage`                                                     |
| `libs/tools.ts`                      | `ToolEntry` 新增 `emoji` + `sameAs`                                                           |
| `components/json-ld.tsx`             | `buildToolSchemas()` 支持 `sameAs`；更新 WebsiteJsonLd 和 buildOrganizationSchema description |
| `app/[locale]/layout.tsx`            | 更新默认 OG image；依赖 json-ld.tsx 更新                                                      |
| `app/[locale]/home-page.tsx`         | 新增 Why OmniKit + Category Intro sections                                                    |
| `app/[locale]/page.tsx`              | 更新 JSON-LD（新增 AboutPage schema）+ metadata                                               |
| `app/[locale]/loading.tsx`           | **新增** — Suspense loading fallback                                                          |
| `app/[locale]/error.tsx`             | **新增** — Error boundary（必须 "use client"）                                                |
| 35 个 `*-page.tsx`                   | Description 替换为 `DescriptionSection`                                                       |
| 35 个 `page.tsx`                     | 传入 `ogImage` + `sameAs` + `howToSteps` 参数                                                 |

### 不在本次范围（P3/Phase 4-5）

| 项目                                       | 原因                                                    |
| ------------------------------------------ | ------------------------------------------------------- |
| 分类页面（`app/[locale]/categories/`）路由 | P3 长期战略，`categories.json` 翻译已就绪但路由暂未创建 |
| 新工具开发（JSON to TS, SQL Formatter 等） | Phase 4                                                 |
| Chrome 扩展 / GitHub 生态 / 社区渗透       | Phase 5                                                 |
