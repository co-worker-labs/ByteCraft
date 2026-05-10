# Token Counter — Plan 3: Non-English Locales

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `tokencounter` translations for all 9 non-English locales (zh-CN, zh-TW, ja, ko, es, pt-BR, fr, de, ru).

**Prerequisite:** Plan 2 completed — page component renders with English i18n.

**Architecture:** Each locale needs two changes: (1) a new `token-counter.json` file with tool-specific UI strings and SEO description content, and (2) a `tokencounter` entry added to the locale's `tools.json`. CJK locales include `searchTerms` with romanized tokens per project convention.

**Locale Convention:**

- **CJK (zh-CN, zh-TW, ja, ko):** Include `searchTerms` — romanized full + romanized initials + 2-3 discriminating keywords
- **Latin (es, pt-BR, fr, de):** No `searchTerms` — shortTitle is already Latin script, fuzzysort matches directly
- **Cyrillic (ru):** Include `searchTerms` — transliterated + English alternatives

---

## File Structure

| Action | File                                         | Locale(s)                                   |
| ------ | -------------------------------------------- | ------------------------------------------- |
| Create | `public/locales/{locale}/token-counter.json` | All 9 locales                               |
| Modify | `public/locales/{locale}/tools.json`         | All 9 locales — insert `tokencounter` entry |

**Insert position in each `tools.json`:** Between `"wordcounter"` and `"sshkey"` entries (matching the en/tools.json structure).

---

### Task 1: zh-CN Locale

**Files:**

- Create: `public/locales/zh-CN/token-counter.json`
- Modify: `public/locales/zh-CN/tools.json`

- [ ] **Step 1: Create `public/locales/zh-CN/token-counter.json`**

```json
{
  "textareaPlaceholder": "输入或粘贴文本以计算 Token 数量...",
  "tokens": "Token 数",
  "characters": "字符数",
  "charsPerToken": "字符/Token",
  "contextUsage": "上下文用量",
  "contextWindow": "基于 GPT-4o 128K 上下文窗口",
  "showingPartial": "显示前 {limit} 个 Token（共 {total} 个）",
  "descriptions": {
    "aeoDefinition": "Token 计数器是一款免费的在线工具，使用 o200k_base 编码计算 OpenAI GPT Token 数量（支持 GPT-4o、GPT-4.1、o1、o3、o4-mini、GPT-5）。通过彩色高亮可视化文本如何被分割为 BPE Token。所有数据在浏览器本地处理，不会发送到任何服务器。",
    "whatIsTitle": "什么是 Token 计数器？",
    "whatIsP1": "Token 计数器用于测量文本在发送到 GPT-4o、GPT-4.1 等 OpenAI 模型时会消耗多少 Token。了解 Token 数量有助于优化提示词并避免超出上下文限制。配合 [文本差异对比](/diff) 工具可以比较不同版本提示词的 Token 用量。",
    "whatIsP2": "本工具使用 o200k_base 编码，即 GPT-4o、o1、o3、o4-mini 和 GPT-5 所使用的分词器。可视化中每个彩色片段代表一个 BPE（字节对编码）Token。",
    "faq1Q": "什么是 Token？",
    "faq1A": "Token 是语言模型处理文本的基本单位。在英文中，一个 Token 大约相当于 4 个字符或 0.75 个单词。常见单词通常是一个 Token，而罕见或复杂的单词可能被拆分为多个 Token。",
    "faq2Q": "哪些模型使用 o200k_base 编码？",
    "faq2A": "o200k_base 编码用于 GPT-4o、GPT-4.1、o1、o3、o4-mini 和 GPT-5。它支持约 20 万个 Token 的词表，相比早期的 cl100k_base 编码在多语言覆盖方面有显著提升。",
    "faq3Q": "Token 计数有多准确？",
    "faq3A": "对于标准文本，计数非常准确。本工具使用与 OpenAI 分词器相同的 BPE 算法。对于聊天格式的消息（包含 system/user/assistant 角色），可能会有微小差异，因为本工具计算的是原始文本 Token，而非聊天模板 Token。"
  }
}
```

- [ ] **Step 2: Add entry to `public/locales/zh-CN/tools.json`**

Insert between `"wordcounter"` and `"sshkey"`:

```json
  "tokencounter": {
    "title": "Token 计数器 - OpenAI GPT Token 计数与 BPE 可视化",
    "shortTitle": "Token 计数器",
    "description": "使用 o200k_base 编码计算 OpenAI GPT Token 数量，实时 BPE 分词可视化。支持 GPT-4o、GPT-4.1、o1、o3、o4-mini、GPT-5。",
    "searchTerms": "tokenjishuqi tjsq BPE fenci"
  },
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/zh-CN/token-counter.json public/locales/zh-CN/tools.json
git commit -m "feat(token-counter): add zh-CN locale"
```

---

### Task 2: zh-TW Locale

**Files:**

- Create: `public/locales/zh-TW/token-counter.json`
- Modify: `public/locales/zh-TW/tools.json`

- [ ] **Step 1: Create `public/locales/zh-TW/token-counter.json`**

```json
{
  "textareaPlaceholder": "輸入或貼上文字以計算 Token 數量...",
  "tokens": "Token 數",
  "characters": "字元數",
  "charsPerToken": "字元/Token",
  "contextUsage": "上下文用量",
  "contextWindow": "基於 GPT-4o 128K 上下文視窗",
  "showingPartial": "顯示前 {limit} 個 Token（共 {total} 個）",
  "descriptions": {
    "aeoDefinition": "Token 計數器是一款免費的線上工具，使用 o200k_base 編碼計算 OpenAI GPT Token 數量（支援 GPT-4o、GPT-4.1、o1、o3、o4-mini、GPT-5）。透過彩色高亮視覺化文字如何被分割為 BPE Token。所有資料在瀏覽器本機處理，不會傳送到任何伺服器。",
    "whatIsTitle": "什麼是 Token 計數器？",
    "whatIsP1": "Token 計數器用於測量文字在傳送到 GPT-4o、GPT-4.1 等 OpenAI 模型時會消耗多少 Token。了解 Token 數量有助於最佳化提示詞並避免超出上下文限制。搭配[文字差異比對](/diff)工具可以比較不同版本提示詞的 Token 用量。",
    "whatIsP2": "本工具使用 o200k_base 編碼，即 GPT-4o、o1、o3、o4-mini 和 GPT-5 所使用的分詞器。視覺化中每個彩色片段代表一個 BPE（位元組對編碼）Token。",
    "faq1Q": "什麼是 Token？",
    "faq1A": "Token 是語言模型處理文字的基本單位。在英文中，一個 Token 大約相當於 4 個字元或 0.75 個單字。常見單字通常是一個 Token，而罕見或複雜的單字可能被拆分為多個 Token。",
    "faq2Q": "哪些模型使用 o200k_base 編碼？",
    "faq2A": "o200k_base 編碼用於 GPT-4o、GPT-4.1、o1、o3、o4-mini 和 GPT-5。它支援約 20 萬個 Token 的詞彙表，相比早期的 cl100k_base 編碼在多語言覆蓋方面有顯著提升。",
    "faq3Q": "Token 計數有多準確？",
    "faq3A": "對於標準文字，計數非常準確。本工具使用與 OpenAI 分詞器相同的 BPE 演算法。對於聊天格式的訊息（包含 system/user/assistant 角色），可能會有微小差異，因為本工具計算的是原始文字 Token，而非聊天範本 Token。"
  }
}
```

- [ ] **Step 2: Add entry to `public/locales/zh-TW/tools.json`**

Insert between `"wordcounter"` and `"sshkey"`:

```json
  "tokencounter": {
    "title": "Token 計數器 - OpenAI GPT Token 計數與 BPE 視覺化",
    "shortTitle": "Token 計數器",
    "description": "使用 o200k_base 編碼計算 OpenAI GPT Token 數量，即時 BPE 分詞視覺化。支援 GPT-4o、GPT-4.1、o1、o3、o4-mini、GPT-5。",
    "searchTerms": "tokenjishuqi tjsq BPE fenci"
  },
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/zh-TW/token-counter.json public/locales/zh-TW/tools.json
git commit -m "feat(token-counter): add zh-TW locale"
```

---

### Task 3: ja Locale

**Files:**

- Create: `public/locales/ja/token-counter.json`
- Modify: `public/locales/ja/tools.json`

- [ ] **Step 1: Create `public/locales/ja/token-counter.json`**

```json
{
  "textareaPlaceholder": "トークン数をカウントするテキストを入力または貼り付け...",
  "tokens": "トークン数",
  "characters": "文字数",
  "charsPerToken": "文字/トークン",
  "contextUsage": "コンテキスト使用量",
  "contextWindow": "GPT-4o 128K コンテキストウィンドウ基準",
  "showingPartial": "最初の {limit} トークンを表示（全 {total} トークン中）",
  "descriptions": {
    "aeoDefinition": "Token カウンターは、o200k_base エンコーディング（GPT-4o、GPT-4.1、o1、o3、o4-mini、GPT-5 対応）を使用して OpenAI GPT トークン数を計算する無料オンラインツールです。BPE トークンの分割をカラー ハイライトで視覚化。全データはブラウザ上で処理され、サーバーには送信されません。",
    "whatIsTitle": "Token カウンターとは？",
    "whatIsP1": "Token カウンターは、テキストが GPT-4o や GPT-4.1 などの OpenAI モデルに送信される際に消費されるトークン数を測定します。トークン数を把握することで、プロンプトの最適化やコンテキスト制限の超過を防ぐことができます。[テキスト差分](/diff)ツールと組み合わせて、プロンプト改訂間のトークン使用量を比較できます。",
    "whatIsP2": "このツールは GPT-4o、o1、o3、o4-mini、GPT-5 で使用される o200k_base エンコーディングを採用しています。視覚化の各色付きセグメントは 1 つの BPE（バイトペアエンコーディング）トークンを表します。",
    "faq1Q": "トークンとは何ですか？",
    "faq1A": "トークンは言語モデルがテキストを処理するための基本単位です。英語では、1 トークンは約 4 文字または 0.75 語に相当します。一般的な単語は 1 トークンですが、珍しい単語や複雑な単語は複数のトークンに分割される場合があります。",
    "faq2Q": "o200k_base エンコーディングを使用するモデルは？",
    "faq2A": "o200k_base エンコーディングは GPT-4o、GPT-4.1、o1、o3、o4-mini、GPT-5 で使用されています。約 20 万トークンの語彙をサポートし、以前の cl100k_base エンコーディングより多言語対応が大幅に向上しています。",
    "faq3Q": "トークン数の精度は？",
    "faq3A": "通常のテキストでは非常に正確です。OpenAI のトークナイザーと同じ BPE アルゴリズムを使用しています。チャット形式のメッセージ（system/user/assistant ロールを含む）では、このツールが生テキストのトークンをカウントするため、チャットテンプレートのトークンとは微小な差異が生じる場合があります。"
  }
}
```

- [ ] **Step 2: Add entry to `public/locales/ja/tools.json`**

Insert between `"wordcounter"` and `"sshkey"`:

```json
  "tokencounter": {
    "title": "Token カウンター - OpenAI GPT トークン数カウント & BPE 視覚化",
    "shortTitle": "Token カウンター",
    "description": "o200k_base エンコーディングで OpenAI GPT トークン数をカウント。リアルタイム BPE トークン化視覚化。GPT-4o、GPT-4.1、o1、o3、o4-mini、GPT-5 対応。",
    "searchTerms": "tokunkaunta tkkt BPE bunri"
  },
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/ja/token-counter.json public/locales/ja/tools.json
git commit -m "feat(token-counter): add ja locale"
```

---

### Task 4: ko Locale

**Files:**

- Create: `public/locales/ko/token-counter.json`
- Modify: `public/locales/ko/tools.json`

- [ ] **Step 1: Create `public/locales/ko/token-counter.json`**

```json
{
  "textareaPlaceholder": "토큰 수를 계산할 텍스트를 입력하거나 붙여넣으세요...",
  "tokens": "토큰 수",
  "characters": "문자 수",
  "charsPerToken": "문자/토큰",
  "contextUsage": "컨텍스트 사용량",
  "contextWindow": "GPT-4o 128K 컨텍스트 윈도우 기준",
  "showingPartial": "처음 {limit}개 토큰 표시 (전체 {total}개 중)",
  "descriptions": {
    "aeoDefinition": "Token 카운터는 o200k_base 인코딩(GPT-4o, GPT-4.1, o1, o3, o4-mini, GPT-5 지원)을 사용하여 OpenAI GPT 토큰 수를 계산하는 무료 온라인 도구입니다. BPE 토큰 분할을 컬러 하이라이트로 시각화합니다. 모든 데이터는 브라우저에서 처리되며 서버로 전송되지 않습니다.",
    "whatIsTitle": "Token 카운터란?",
    "whatIsP1": "Token 카운터는 텍스트가 GPT-4o, GPT-4.1 등 OpenAI 모델에 전송될 때 소비되는 토큰 수를 측정합니다. 토큰 수를 파악하면 프롬프트를 최적화하고 컨텍스트 제한 초과를 방지할 수 있습니다. [텍스트 Diff](/diff) 도구와 함께 사용하여 프롬프트 버전 간 토큰 사용량을 비교할 수 있습니다.",
    "whatIsP2": "이 도구는 GPT-4o, o1, o3, o4-mini, GPT-5에서 사용하는 o200k_base 인코딩을 사용합니다. 시각화의 각 색상 세그먼트는 하나의 BPE(바이트 쌍 인코딩) 토큰을 나타냅니다.",
    "faq1Q": "토큰이란 무엇인가요?",
    "faq1A": "토큰은 언어 모델이 텍스트를 처리하는 기본 단위입니다. 영어에서 1개 토큰은 약 4자 또는 0.75단어에 해당합니다. 일반적인 단어는 1개 토큰이지만, 드물거나 복잡한 단어는 여러 토큰으로 분할될 수 있습니다.",
    "faq2Q": "o200k_base 인코딩을 사용하는 모델은?",
    "faq2A": "o200k_base 인코딩은 GPT-4o, GPT-4.1, o1, o3, o4-mini, GPT-5에서 사용됩니다. 약 20만 개 토큰 어휘를 지원하며, 이전 cl100k_base 인코딩보다 다국어 지원이 크게 향상되었습니다.",
    "faq3Q": "토큰 수 계산이 정확한가요?",
    "faq3A": "일반 텍스트의 경우 매우 정확합니다. OpenAI 토크나이저와 동일한 BPE 알고리즘을 사용합니다. 채팅 형식 메시지(system/user/assistant 역할 포함)의 경우, 이 도구는 원시 텍스트 토큰을 계산하므로 채팅 템플릿 토큰과 약간의 차이가 있을 수 있습니다."
  }
}
```

- [ ] **Step 2: Add entry to `public/locales/ko/tools.json`**

Insert between `"wordcounter"` and `"sshkey"`:

```json
  "tokencounter": {
    "title": "Token 카운터 - OpenAI GPT 토큰 수 계산 & BPE 시각화",
    "shortTitle": "Token 카운터",
    "description": "o200k_base 인코딩으로 OpenAI GPT 토큰 수를 계산합니다. 실시간 BPE 토큰화 시각화. GPT-4o, GPT-4.1, o1, o3, o4-mini, GPT-5 지원.",
    "searchTerms": "tokenkaunteo teokt BPE bunseok"
  },
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/ko/token-counter.json public/locales/ko/tools.json
git commit -m "feat(token-counter): add ko locale"
```

---

### Task 5: es Locale

**Files:**

- Create: `public/locales/es/token-counter.json`
- Modify: `public/locales/es/tools.json`

- [ ] **Step 1: Create `public/locales/es/token-counter.json`**

```json
{
  "textareaPlaceholder": "Introduce o pega texto para contar tokens...",
  "tokens": "Tokens",
  "characters": "Caracteres",
  "charsPerToken": "Caracteres/Token",
  "contextUsage": "Uso de Contexto",
  "contextWindow": "Basado en la ventana de contexto de 128K de GPT-4o",
  "showingPartial": "Mostrando los primeros {limit} de {total} tokens",
  "descriptions": {
    "aeoDefinition": "El Contador de Tokens es una herramienta online gratuita que cuenta tokens de OpenAI GPT usando la codificación o200k_base (GPT-4o, GPT-4.1, o1, o3, o4-mini, GPT-5). Visualiza cómo el texto se divide en tokens BPE con resaltado en color. Todo se procesa en el navegador, sin enviar datos a ningún servidor.",
    "whatIsTitle": "¿Qué es un Contador de Tokens?",
    "whatIsP1": "Un Contador de Tokens mide cuántos tokens consumirá tu texto al enviarlo a modelos de OpenAI como GPT-4o y GPT-4.1. Comprender el recuento de tokens ayuda a optimizar prompts y evitar exceder los límites de contexto. Combínalo con la herramienta [Diff de Texto](/diff) para comparar el uso de tokens entre versiones de prompts.",
    "whatIsP2": "Esta herramienta usa la codificación o200k_base, el tokenizador empleado por GPT-4o, o1, o3, o4-mini y GPT-5. Cada segmento coloreado en la visualización representa un token BPE (Byte Pair Encoding).",
    "faq1Q": "¿Qué son los tokens?",
    "faq1A": "Los tokens son las unidades básicas que los modelos de lenguaje usan para procesar texto. En inglés, un token equivale aproximadamente a 4 caracteres o 0.75 palabras. Las palabras comunes suelen ser un solo token, mientras que las palabras raras o complejas pueden dividirse en múltiples tokens.",
    "faq2Q": "¿Qué modelos usan la codificación o200k_base?",
    "faq2A": "La codificación o200k_base se usa en GPT-4o, GPT-4.1, o1, o3, o4-mini y GPT-5. Soporta un vocabulario de aproximadamente 200.000 tokens con mejor cobertura multilingüe respecto a la codificación anterior cl100k_base.",
    "faq3Q": "¿Qué tan preciso es el conteo de tokens?",
    "faq3A": "El conteo es muy preciso para texto estándar. Usa el mismo algoritmo BPE que el tokenizador de OpenAI. Pueden existir ligeras discrepancias en mensajes con formato de chat (roles system/user/assistant), ya que esta herramienta cuenta tokens de texto plano, no tokens de plantilla de chat."
  }
}
```

- [ ] **Step 2: Add entry to `public/locales/es/tools.json`**

Insert between `"wordcounter"` and `"sshkey"`:

```json
  "tokencounter": {
    "title": "Contador de Tokens - OpenAI GPT & Visualización BPE",
    "shortTitle": "Contador de Tokens",
    "description": "Cuenta tokens de OpenAI GPT (o200k_base) con visualización de tokenización BPE en tiempo real. Compatible con GPT-4o, GPT-4.1, o1, o3, o4-mini, GPT-5."
  },
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/es/token-counter.json public/locales/es/tools.json
git commit -m "feat(token-counter): add es locale"
```

---

### Task 6: pt-BR Locale

**Files:**

- Create: `public/locales/pt-BR/token-counter.json`
- Modify: `public/locales/pt-BR/tools.json`

- [ ] **Step 1: Create `public/locales/pt-BR/token-counter.json`**

```json
{
  "textareaPlaceholder": "Digite ou cole texto para contar tokens...",
  "tokens": "Tokens",
  "characters": "Caracteres",
  "charsPerToken": "Caracteres/Token",
  "contextUsage": "Uso de Contexto",
  "contextWindow": "Baseado na janela de contexto 128K do GPT-4o",
  "showingPartial": "Mostrando os primeiros {limit} de {total} tokens",
  "descriptions": {
    "aeoDefinition": "O Contador de Tokens é uma ferramenta online gratuita que conta tokens do OpenAI GPT usando a codificação o200k_base (GPT-4o, GPT-4.1, o1, o3, o4-mini, GPT-5). Visualize como o texto é dividido em tokens BPE com destaque colorido. Todo o processamento é feito no navegador, sem enviar dados para nenhum servidor.",
    "whatIsTitle": "O que é um Contador de Tokens?",
    "whatIsP1": "Um Contador de Tokens mede quantos tokens seu texto consumirá ao ser enviado para modelos OpenAI como GPT-4o e GPT-4.1. Compreender a contagem de tokens ajuda a otimizar prompts e evitar exceder limites de contexto. Combine com a ferramenta [Diff de Texto](/diff) para comparar o uso de tokens entre versões de prompts.",
    "whatIsP2": "Esta ferramenta usa a codificação o200k_base, o tokenizador utilizado pelo GPT-4o, o1, o3, o4-mini e GPT-5. Cada segmento colorido na visualização representa um token BPE (Byte Pair Encoding).",
    "faq1Q": "O que são tokens?",
    "faq1A": "Tokens são as unidades básicas que modelos de linguagem usam para processar texto. Em inglês, um token equivale a aproximadamente 4 caracteres ou 0,75 palavras. Palavras comuns geralmente formam um único token, enquanto palavras raras ou complexas podem ser divididas em múltiplos tokens.",
    "faq2Q": "Quais modelos usam a codificação o200k_base?",
    "faq2A": "A codificação o200k_base é usada pelo GPT-4o, GPT-4.1, o1, o3, o4-mini e GPT-5. Suporta um vocabulário de aproximadamente 200.000 tokens com cobertura multilíngue aprimorada em relação à codificação anterior cl100k_base.",
    "faq3Q": "Quão precisa é a contagem de tokens?",
    "faq3A": "A contagem é muito precisa para texto padrão. Usa o mesmo algoritmo BPE do tokenizador da OpenAI. Pequenas discrepâncias podem ocorrer em mensagens formatadas como chat (com funções system/user/assistant), pois esta ferramenta conta tokens de texto bruto, não tokens de template de chat."
  }
}
```

- [ ] **Step 2: Add entry to `public/locales/pt-BR/tools.json`**

Insert between `"wordcounter"` and `"sshkey"`:

```json
  "tokencounter": {
    "title": "Contador de Tokens - OpenAI GPT & Visualização BPE",
    "shortTitle": "Contador de Tokens",
    "description": "Conte tokens do OpenAI GPT (o200k_base) com visualização de tokenização BPE em tempo real. Suporta GPT-4o, GPT-4.1, o1, o3, o4-mini, GPT-5."
  },
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/pt-BR/token-counter.json public/locales/pt-BR/tools.json
git commit -m "feat(token-counter): add pt-BR locale"
```

---

### Task 7: fr Locale

**Files:**

- Create: `public/locales/fr/token-counter.json`
- Modify: `public/locales/fr/tools.json`

- [ ] **Step 1: Create `public/locales/fr/token-counter.json`**

```json
{
  "textareaPlaceholder": "Saisissez ou collez du texte pour compter les tokens...",
  "tokens": "Tokens",
  "characters": "Caractères",
  "charsPerToken": "Caractères/Token",
  "contextUsage": "Utilisation du Contexte",
  "contextWindow": "Basé sur la fenêtre de contexte 128K de GPT-4o",
  "showingPartial": "Affichage des {limit} premiers tokens sur {total}",
  "descriptions": {
    "aeoDefinition": "Le Compteur de Tokens est un outil en ligne gratuit qui compte les tokens OpenAI GPT en utilisant l'encodage o200k_base (GPT-4o, GPT-4.1, o1, o3, o4-mini, GPT-5). Visualisez comment le texte est découpé en tokens BPE avec un surlignage coloré. Tout le traitement se fait dans le navigateur, aucune donnée n'est envoyée à un serveur.",
    "whatIsTitle": "Qu'est-ce qu'un Compteur de Tokens ?",
    "whatIsP1": "Un Compteur de Tokens mesure le nombre de tokens que votre texte consommera lors de l'envoi aux modèles OpenAI comme GPT-4o et GPT-4.1. Comprendre le nombre de tokens aide à optimiser les prompts et à éviter de dépasser les limites de contexte. Combinez-le avec l'outil [Diff de Texte](/diff) pour comparer l'utilisation de tokens entre les versions de prompts.",
    "whatIsP2": "Cet outil utilise l'encodage o200k_base, le tokenisateur utilisé par GPT-4o, o1, o3, o4-mini et GPT-5. Chaque segment coloré dans la visualisation représente un token BPE (Byte Pair Encoding).",
    "faq1Q": "Que sont les tokens ?",
    "faq1A": "Les tokens sont les unités de base que les modèles de langage utilisent pour traiter le texte. En anglais, un token correspond à environ 4 caractères ou 0,75 mot. Les mots courants constituent généralement un seul token, tandis que les mots rares ou complexes peuvent être divisés en plusieurs tokens.",
    "faq2Q": "Quels modèles utilisent l'encodage o200k_base ?",
    "faq2A": "L'encodage o200k_base est utilisé par GPT-4o, GPT-4.1, o1, o3, o4-mini et GPT-5. Il prend en charge un vocabulaire d'environ 200 000 tokens avec une couverture multilingue améliorée par rapport à l'encodage précédent cl100k_base.",
    "faq3Q": "Quelle est la précision du comptage des tokens ?",
    "faq3A": "Le comptage est très précis pour le texte standard. Il utilise le même algorithme BPE que le tokenisateur d'OpenAI. De légères divergences peuvent survenir pour les messages au format chat (avec rôles system/user/assistant), car cet outil compte les tokens du texte brut, pas les tokens du modèle de chat."
  }
}
```

- [ ] **Step 2: Add entry to `public/locales/fr/tools.json`**

Insert between `"wordcounter"` and `"sshkey"`:

```json
  "tokencounter": {
    "title": "Compteur de Tokens - OpenAI GPT & Visualisation BPE",
    "shortTitle": "Compteur de Tokens",
    "description": "Comptez les tokens OpenAI GPT (o200k_base) avec visualisation BPE en temps réel. Compatible GPT-4o, GPT-4.1, o1, o3, o4-mini, GPT-5."
  },
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/fr/token-counter.json public/locales/fr/tools.json
git commit -m "feat(token-counter): add fr locale"
```

---

### Task 8: de Locale

**Files:**

- Create: `public/locales/de/token-counter.json`
- Modify: `public/locales/de/tools.json`

- [ ] **Step 1: Create `public/locales/de/token-counter.json`**

```json
{
  "textareaPlaceholder": "Text eingeben oder einfügen, um Tokens zu zählen...",
  "tokens": "Tokens",
  "characters": "Zeichen",
  "charsPerToken": "Zeichen/Token",
  "contextUsage": "Kontextnutzung",
  "contextWindow": "Basierend auf dem 128K-Kontextfenster von GPT-4o",
  "showingPartial": "Zeige die ersten {limit} von {total} Tokens",
  "descriptions": {
    "aeoDefinition": "Der Token-Zähler ist ein kostenloses Online-Tool, das OpenAI GPT-Token mit der o200k_base-Kodierung zählt (GPT-4o, GPT-4.1, o1, o3, o4-mini, GPT-5). Visualisieren Sie, wie Text in BPE-Tokens aufgeteilt wird, mit farbiger Hervorhebung. Alle Verarbeitung erfolgt im Browser, keine Daten werden an Server gesendet.",
    "whatIsTitle": "Was ist ein Token-Zähler?",
    "whatIsP1": "Ein Token-Zähler misst, wie viele Tokens Ihr Text verbraucht, wenn er an OpenAI-Modelle wie GPT-4o und GPT-4.1 gesendet wird. Das Verständnis der Token-Anzahl hilft bei der Optimierung von Prompts und vermeidet das Überschreiten von Kontextgrenzen. Kombinieren Sie es mit dem [Text-Diff](/diff)-Tool, um den Token-Verbrauch zwischen Prompt-Versionen zu vergleichen.",
    "whatIsP2": "Dieses Tool verwendet die o200k_base-Kodierung, den Tokenizer von GPT-4o, o1, o3, o4-mini und GPT-5. Jedes farbige Segment in der Visualisierung repräsentiert ein BPE-Token (Byte Pair Encoding).",
    "faq1Q": "Was sind Tokens?",
    "faq1A": "Tokens sind die Grundeinheiten, die Sprachmodelle zur Textverarbeitung verwenden. Im Englischen entspricht ein Token etwa 4 Zeichen oder 0,75 Wörtern. Häufige Wörter sind meist ein einzelnes Token, während seltene oder komplexe Wörter in mehrere Tokens aufgeteilt werden können.",
    "faq2Q": "Welche Modelle verwenden die o200k_base-Kodierung?",
    "faq2A": "Die o200k_base-Kodierung wird von GPT-4o, GPT-4.1, o1, o3, o4-mini und GPT-5 verwendet. Sie unterstützt ein Vokabular von etwa 200.000 Tokens mit verbesserter mehrsprachiger Abdeckung gegenüber der früheren cl100k_base-Kodierung.",
    "faq3Q": "Wie genau ist die Token-Zählung?",
    "faq3A": "Die Zählung ist für Standardtext sehr genau. Sie verwendet denselben BPE-Algorithmus wie der OpenAI-Tokenizer. Geringe Abweichungen können bei Chat-formatierten Nachrichten (mit System-/Benutzer-/Assistent-Rollen) auftreten, da dieses Tool rohe Text-Tokens zählt, keine Chat-Vorlagen-Tokens."
  }
}
```

- [ ] **Step 2: Add entry to `public/locales/de/tools.json`**

Insert between `"wordcounter"` and `"sshkey"`:

```json
  "tokencounter": {
    "title": "Token-Zähler - OpenAI GPT & BPE-Visualisierung",
    "shortTitle": "Token-Zähler",
    "description": "Zählt OpenAI GPT-Tokens (o200k_base) mit Echtzeit-BPE-Tokenisierungs-Visualisierung. Unterstützt GPT-4o, GPT-4.1, o1, o3, o4-mini, GPT-5."
  },
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/de/token-counter.json public/locales/de/tools.json
git commit -m "feat(token-counter): add de locale"
```

---

### Task 9: ru Locale

**Files:**

- Create: `public/locales/ru/token-counter.json`
- Modify: `public/locales/ru/tools.json`

- [ ] **Step 1: Create `public/locales/ru/token-counter.json`**

```json
{
  "textareaPlaceholder": "Введите или вставьте текст для подсчёта токенов...",
  "tokens": "Токены",
  "characters": "Символы",
  "charsPerToken": "Символов/Токен",
  "contextUsage": "Использование контекста",
  "contextWindow": "На основе контекстного окна 128K GPT-4o",
  "showingPartial": "Показаны первые {limit} из {total} токенов",
  "descriptions": {
    "aeoDefinition": "Счётчик токенов — бесплатный онлайн-инструмент, подсчитывающий токены OpenAI GPT с использованием кодировки o200k_base (GPT-4o, GPT-4.1, o1, o3, o4-mini, GPT-5). Визуализируйте разбиение текста на BPE-токены с цветовой подсветкой. Все данные обрабатываются в браузере и не отправляются на серверы.",
    "whatIsTitle": "Что такое счётчик токенов?",
    "whatIsP1": "Счётчик токенов измеряет, сколько токенов потребует ваш текст при отправке в модели OpenAI, такие как GPT-4o и GPT-4.1. Понимание количества токенов помогает оптимизировать промпты и избежать превышения контекстных ограничений. Используйте вместе с инструментом [Сравнение текстов](/diff) для сравнения расхода токенов между версиями промптов.",
    "whatIsP2": "Этот инструмент использует кодировку o200k_base — токенизатор, применяемый в GPT-4o, o1, o3, o4-mini и GPT-5. Каждый цветной сегмент в визуализации представляет один BPE-токен (Byte Pair Encoding).",
    "faq1Q": "Что такое токены?",
    "faq1A": "Токены — базовые единицы, которые языковые модели используют для обработки текста. В английском языке один токен соответствует примерно 4 символам или 0,75 слова. Частые слова обычно составляют один токен, а редкие или сложные могут разбиваться на несколько токенов.",
    "faq2Q": "Какие модели используют кодировку o200k_base?",
    "faq2A": "Кодировка o200k_base используется в GPT-4o, GPT-4.1, o1, o3, o4-mini и GPT-5. Она поддерживает словарь примерно из 200 000 токенов с улучшенной многоязычной поддержкой по сравнению с предыдущей кодировкой cl100k_base.",
    "faq3Q": "Насколько точен подсчёт токенов?",
    "faq3A": "Подсчёт очень точен для стандартного текста. Используется тот же алгоритм BPE, что и в токенизаторе OpenAI. Незначительные расхождения возможны для сообщений в формате чата (с ролями system/user/assistant), так как этот инструмент считает токены сырого текста, а не токены шаблона чата."
  }
}
```

- [ ] **Step 2: Add entry to `public/locales/ru/tools.json`**

Insert between `"wordcounter"` and `"sshkey"`:

```json
  "tokencounter": {
    "title": "Счётчик токенов - OpenAI GPT & Визуализация BPE",
    "shortTitle": "Счётчик токенов",
    "description": "Подсчёт токенов OpenAI GPT (o200k_base) с визуализацией BPE-токенизации в реальном времени. Поддержка GPT-4o, GPT-4.1, o1, o3, o4-mini, GPT-5.",
    "searchTerms": "schetchiktokenov schtok token BPE"
  },
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/ru/token-counter.json public/locales/ru/tools.json
git commit -m "feat(token-counter): add ru locale"
```

---

## Verification

After completing all locale tasks:

- [ ] **Verify all locale files exist**

```bash
for locale in zh-CN zh-TW ja ko es pt-BR fr de ru; do
  test -f "public/locales/$locale/token-counter.json" && echo "$locale: OK" || echo "$locale: MISSING"
done
```

Expected: All 9 locales print "OK".

- [ ] **Verify all tools.json contain tokencounter entry**

```bash
for locale in zh-CN zh-TW ja ko es pt-BR fr de ru; do
  grep -q '"tokencounter"' "public/locales/$locale/tools.json" && echo "$locale: OK" || echo "$locale: MISSING"
done
```

Expected: All 9 locales print "OK".

- [ ] **Run build to verify no i18n errors**

```bash
npm run build
```

Expected: Build succeeds, all locale routes for `/token-counter` generated.

- [ ] **Run linter**

```bash
npm run lint
```

Expected: No new errors.
