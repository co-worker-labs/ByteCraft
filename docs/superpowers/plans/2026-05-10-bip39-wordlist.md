# BIP39 Word List Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `/bip39` route that displays the complete BIP39 English word list (2048 words) in a searchable grid, following the reference tool pattern (ascii, httpstatus).

**Architecture:** Two-file page structure (`page.tsx` + `bip39-page.tsx`). Imports `wordlist` from `@scure/bip39/wordlists/english.js` — no new libs files. Client-side only, consistent with existing reference tools.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, next-intl, @scure/bip39, lucide-react

---

## File Structure

| File                                       | Responsibility                                                                |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| `app/[locale]/bip39/page.tsx`              | Route entry — SEO metadata, JSON-LD schemas                                   |
| `app/[locale]/bip39/bip39-page.tsx`        | Page component — TopDescription + WordGrid + BottomDescription + RelatedTools |
| `libs/tools.ts`                            | Tool registry — add bip39 entry, category, relations                          |
| `app/[locale]/wallet/wallet-page.tsx`      | Add "View complete BIP39 word list →" link after BIP39 description            |
| `public/locales/{locale}/bip39.json` × 10  | Tool-specific translations                                                    |
| `public/locales/{locale}/tools.json` × 10  | bip39 tool card entry                                                         |
| `public/locales/{locale}/wallet.json` × 10 | Add `viewWordList` key                                                        |

---

### Task 1: Register bip39 in Tool Registry

**Files:**

- Modify: `libs/tools.ts`

- [ ] **Step 1: Add BookOpen icon import and bip39 tool entry**

In `libs/tools.ts`, add `BookOpen` to the lucide-react import block, then add the bip39 entry to `TOOLS` array, `TOOL_CATEGORIES`, and `TOOL_RELATIONS`.

Add `BookOpen` to the import from `lucide-react` (line 36, after `Wallet`):

```ts
import {
  // ... existing imports ...
  Wallet,
  BookOpen,
} from "lucide-react";
```

Add to `TOOLS` array (after the `wallet` entry at line 186):

```ts
  { key: "wallet", path: "/wallet", icon: Wallet },
  { key: "bip39", path: "/bip39", icon: BookOpen },
```

Add `"bip39"` to the `reference` category in `TOOL_CATEGORIES` (line 94):

```ts
  { key: "reference", tools: ["httpstatus", "httpclient", "dbviewer", "ascii", "htmlcode", "bip39"] },
```

Add relations in `TOOL_RELATIONS` (after `httpclient` entry at line 133):

```ts
  httpclient: ["httpstatus", "urlencoder", "json"],
  bip39: ["wallet", "password"],
```

Also update the `wallet` entry (line 110) to include `"bip39"`:

```ts
  wallet: ["sshkey", "password", "hashing", "jwt", "bip39"],
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `tools.ts`

- [ ] **Step 3: Commit**

```bash
git add libs/tools.ts
git commit -m "feat(bip39): register bip39 tool in registry"
```

---

### Task 2: Create English i18n Files

**Files:**

- Create: `public/locales/en/bip39.json`
- Modify: `public/locales/en/tools.json`
- Modify: `public/locales/en/wallet.json`

- [ ] **Step 1: Create `public/locales/en/bip39.json`**

```json
{
  "searchPlaceholder": "Search BIP39 words...",
  "noResults": "No words found",
  "descriptions": {
    "text": "BIP39 (Bitcoin Improvement Proposal 39) defines a standard for creating mnemonic phrases — human-readable sequences of 12 to 24 words that encode a deterministic wallet seed. The English word list contains exactly 2048 words, chosen for distinctiveness: no two words share the first four letters, minimizing the risk of transcription errors. Each word maps to an 11-bit number, so a 12-word phrase encodes 132 bits (128 bits of entropy + 4-bit checksum). Use the search bar below to look up any BIP39 word by index or substring.",
    "aeoDefinition": "BIP39 Word List is a free online reference for the complete BIP39 mnemonic word list with search. All 2048 words in the standard English BIP39 word list, searchable by index or substring. Runs entirely in your browser.",
    "whatIsTitle": "What is BIP39?",
    "whatIs": "BIP39 is a Bitcoin Improvement Proposal that defines how to represent a random seed as a list of human-readable words. This makes it easier to back up and recover cryptocurrency wallets by writing down a sequence of words instead of a long hexadecimal string.",
    "purposeTitle": "Purpose of the Word List",
    "purpose": "The BIP39 word list is designed so that no two words share the same first four characters (when typed). This means you only need to type the first four letters for any word to be uniquely identified, reducing errors when entering recovery phrases.",
    "securityTitle": "Security Notes",
    "security": "The word list itself is public and not secret. Security comes from the random selection and ordering of words in your mnemonic phrase. Never share your mnemonic phrase with anyone, and store it offline in a secure location.",
    "faq1Q": "How many words are in the BIP39 list?",
    "faq1A": "The BIP39 English word list contains exactly 2048 words. Each word encodes 11 bits of data, so a 12-word mnemonic phrase represents 132 bits (128 bits of entropy + 4-bit checksum), and a 24-word phrase represents 264 bits.",
    "faq2Q": "Can I use BIP39 words in any language?",
    "faq2A": "BIP39 supports multiple languages including English, Japanese, Korean, Spanish, Chinese (Simplified and Traditional), French, Italian, Portuguese, and Czech. However, English is the most widely used and recommended for compatibility."
  }
}
```

- [ ] **Step 2: Add bip39 entry to `public/locales/en/tools.json`**

Add after the `"wallet"` entry (before `"categories"`):

```json
  "bip39": {
    "title": "BIP39 Word List - Complete Mnemonic Word Reference",
    "shortTitle": "BIP39 Word List",
    "description": "Complete BIP39 mnemonic word list reference with search. All 2048 words in the standard English BIP39 word list, searchable by index or substring."
  },
```

Note: No `searchTerms` needed for English (per AGENTS.md convention).

- [ ] **Step 3: Add `viewWordList` key to `public/locales/en/wallet.json`**

Add at the top level of the JSON (after `"descriptions"`):

```json
  "viewWordList": "View complete BIP39 word list →"
```

- [ ] **Step 4: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('public/locales/en/bip39.json','utf8')); console.log('bip39.json OK')" && node -e "JSON.parse(require('fs').readFileSync('public/locales/en/tools.json','utf8')); console.log('tools.json OK')" && node -e "JSON.parse(require('fs').readFileSync('public/locales/en/wallet.json','utf8')); console.log('wallet.json OK')"`

- [ ] **Step 5: Commit**

```bash
git add public/locales/en/bip39.json public/locales/en/tools.json public/locales/en/wallet.json
git commit -m "feat(bip39): add English i18n translations"
```

---

### Task 3: Create Non-English i18n Files

**Files:**

- Create: `public/locales/{zh-CN,zh-TW,ja,ko,es,pt-BR,fr,de,ru}/bip39.json`
- Modify: `public/locales/{zh-CN,zh-TW,ja,ko,es,pt-BR,fr,de,ru}/tools.json`
- Modify: `public/locales/{zh-CN,zh-TW,ja,ko,es,pt-BR,fr,de,ru}/wallet.json`

- [ ] **Step 1: Create `public/locales/zh-CN/bip39.json`**

```json
{
  "searchPlaceholder": "搜索 BIP39 单词...",
  "noResults": "未找到匹配的单词",
  "descriptions": {
    "text": "BIP39（比特币改进提案 39）定义了创建助记词短语的标准——即人类可读的 12 至 24 个单词序列，用于编码确定性钱包种子。英文单词表恰好包含 2048 个单词，这些单词经过精心挑选：任意两个单词的前四个字母都不相同，从而最大限度地降低转录错误的风险。每个单词映射到一个 11 位数字，因此 12 个单词的短语编码 132 位（128 位熵 + 4 位校验和）。使用下方的搜索栏按索引或子字符串查找任何 BIP39 单词。",
    "aeoDefinition": "BIP39 单词表是一款免费的在线参考工具，提供完整的 BIP39 助记词单词列表及搜索功能。包含标准英文 BIP39 单词表中的全部 2048 个单词，支持按索引或子字符串搜索。完全在浏览器中运行。",
    "whatIsTitle": "什么是 BIP39？",
    "whatIs": "BIP39 是一项比特币改进提案，定义了如何将随机种子表示为人类可读的单词列表。这使得备份和恢复加密货币钱包更加容易——只需写下单词序列，而不是一长串十六进制字符串。",
    "purposeTitle": "单词表的用途",
    "purpose": "BIP39 单词表的设计确保任意两个单词的前四个字符不重复。这意味着输入恢复短语时只需输入前四个字母即可唯一识别该单词，从而减少输入错误。",
    "securityTitle": "安全提示",
    "security": "单词表本身是公开的，不具有保密性。安全性来自助记词短语中单词的随机选择和排列。切勿与任何人分享你的助记词短语，并将其离线存储在安全的位置。",
    "faq1Q": "BIP39 单词表包含多少个单词？",
    "faq1A": "BIP39 英文单词表恰好包含 2048 个单词。每个单词编码 11 位数据，因此 12 个单词的助记词表示 132 位（128 位熵 + 4 位校验和），24 个单词的助记词表示 264 位。",
    "faq2Q": "可以使用其他语言的 BIP39 单词吗？",
    "faq2A": "BIP39 支持多种语言，包括英语、日语、韩语、西班牙语、中文（简体和繁体）、法语、意大利语、葡萄牙语和捷克语。但英语是最广泛使用且兼容性最好的选择。"
  }
}
```

- [ ] **Step 2: Add bip39 entry to `public/locales/zh-CN/tools.json`**

Add after the `"wallet"` entry (before `"categories"`):

```json
  "bip39": {
    "title": "BIP39 单词表 - 完整助记词参考",
    "shortTitle": "BIP39 单词表",
    "description": "完整的 BIP39 助记词单词表参考，支持搜索。标准英文 BIP39 单词表全部 2048 个单词，可按索引或子字符串查找。",
    "searchTerms": "bip39dancibiao bip39dcb zhujici zhuci cibiao"
  },
```

- [ ] **Step 3: Add `viewWordList` to `public/locales/zh-CN/wallet.json`**

Add at the top level:

```json
  "viewWordList": "查看完整 BIP39 单词表 →"
```

- [ ] **Step 4: Create `public/locales/zh-TW/bip39.json`**

```json
{
  "searchPlaceholder": "搜尋 BIP39 單字...",
  "noResults": "未找到符合的單字",
  "descriptions": {
    "text": "BIP39（比特幣改進提案 39）定義了建立助記詞短語的標準——即人類可讀的 12 至 24 個單字序列，用於編碼確定性錢包種子。英文單字表恰好包含 2048 個單字，這些單字經過精心挑選：任意兩個單字的前四個字母都不相同，從而最大限度地降低轉錄錯誤的風險。每個單字映射到一個 11 位元數字，因此 12 個單字的短語編碼 132 位元（128 位元熵 + 4 位元校驗和）。使用下方的搜尋欄按索引或子字串尋找任何 BIP39 單字。",
    "aeoDefinition": "BIP39 單字表是一款免費的線上參考工具，提供完整的 BIP39 助記詞單字列表及搜尋功能。包含標準英文 BIP39 單字表中的全部 2048 個單字，支援按索引或子字串搜尋。完全在瀏覽器中執行。",
    "whatIsTitle": "什麼是 BIP39？",
    "whatIs": "BIP39 是一項比特幣改進提案，定義了如何將隨機種子表示為人類可讀的單字列表。這使得備份和恢復加密貨幣錢包更加容易——只需寫下單字序列，而不是一長串十六進位字串。",
    "purposeTitle": "單字表的用途",
    "purpose": "BIP39 單字表的設計確保任意兩個單字的前四個字元不重複。這意味著輸入恢復短語時只需輸入前四個字母即可唯一識別該單字，從而減少輸入錯誤。",
    "securityTitle": "安全提示",
    "security": "單字表本身是公開的，不具有保密性。安全性來自助記詞短語中單字的隨機選擇和排列。切勿與任何人分享你的助記詞短語，並將其離線儲存在安全的位置。",
    "faq1Q": "BIP39 單字表包含多少個單字？",
    "faq1A": "BIP39 英文單字表恰好包含 2048 個單字。每個單字編碼 11 位元資料，因此 12 個單字的助記詞表示 132 位元（128 位元熵 + 4 位元校驗和），24 個單字的助記詞表示 264 位元。",
    "faq2Q": "可以使用其他語言的 BIP39 單字嗎？",
    "faq2A": "BIP39 支援多種語言，包括英語、日語、韓語、西班牙語、中文（簡體和繁體）、法語、義大利語、葡萄牙語和捷克語。但英語是最廣泛使用且相容性最好的選擇。"
  }
}
```

- [ ] **Step 5: Add bip39 entry to `public/locales/zh-TW/tools.json`**

After the `"wallet"` entry, before `"categories"`:

```json
  "bip39": {
    "title": "BIP39 單字表 - 完整助記詞參考",
    "shortTitle": "BIP39 單字表",
    "description": "完整的 BIP39 助記詞單字表參考，支援搜尋。標準英文 BIP39 單字表全部 2048 個單字，可按索引或子字串尋找。",
    "searchTerms": "bip39danzibiao bip39dzb zhujici cibiao"
  },
```

- [ ] **Step 6: Add `viewWordList` to `public/locales/zh-TW/wallet.json`**

```json
  "viewWordList": "檢視完整 BIP39 單字表 →"
```

- [ ] **Step 7: Create `public/locales/ja/bip39.json`**

```json
{
  "searchPlaceholder": "BIP39 ワードを検索...",
  "noResults": "一致するワードが見つかりません",
  "descriptions": {
    "text": "BIP39（Bitcoin Improvement Proposal 39）は、ニーモニックフレーズを作成する標準を定義しています。これは人間が読める 12〜24 語のシーケンスで、決定論的ウォレットシードをエンコードします。英語のワードリストには正確に 2048 語が含まれており、各ワードは最初の 4 文字が一意になるように選ばれているため、書き間違いのリスクを最小限に抑えます。各ワードは 11 ビットの数値にマッピングされるため、12 語のフレーズは 132 ビット（128 ビットのエントロピー + 4 ビットのチェックサム）をエンコードします。下の検索バーでインデックスまたは部分文字列から BIP39 ワードを検索できます。",
    "aeoDefinition": "BIP39 ワードリストは、検索機能付きの完全な BIP39 ニーモニックワードリストを無料で参照できるオンラインツールです。標準英語 BIP39 ワードリストの全 2048 語をインデックスまたは部分文字列で検索できます。ブラウザ内で完全に動作します。",
    "whatIsTitle": "BIP39 とは？",
    "whatIs": "BIP39 は Bitcoin 改善提案の一つで、ランダムシードを人間が読めるワードのリストとして表現する方法を定義しています。これにより、長い 16 進数文字列の代わりにワードのシーケンスを書き留めることで、暗号通貨ウォレットのバックアップとリカバリが容易になります。",
    "purposeTitle": "ワードリストの目的",
    "purpose": "BIP39 ワードリストは、どの 2 つのワードも最初の 4 文字が重複しないように設計されています。つまり、リカバリフレーズを入力する際、最初の 4 文字を入力するだけでワードを一意に識別でき、入力ミスを減らすことができます。",
    "securityTitle": "セキュリティに関する注意",
    "security": "ワードリスト自体は公開情報であり、秘密ではありません。安全性はニーモニックフレーズ内のワードのランダムな選択と順序に由来します。ニーモニックフレーズを誰とも共有せず、安全な場所にオフラインで保管してください。",
    "faq1Q": "BIP39 リストには何語含まれていますか？",
    "faq1A": "BIP39 英語ワードリストには正確に 2048 語が含まれています。各ワードは 11 ビットのデータをエンコードするため、12 語のニーモニックは 132 ビット（128 ビットのエントロピー + 4 ビットのチェックサム）、24 語のニーモニックは 264 ビットを表します。",
    "faq2Q": "他の言語の BIP39 ワードを使用できますか？",
    "faq2A": "BIP39 は英語、日本語、韓国語、スペイン語、中国語（簡体字・繁体字）、フランス語、イタリア語、ポルトガル語、チェコ語など複数の言語をサポートしています。ただし、互換性の観点から英語が最も広く使用されており、推奨されています。"
  }
}
```

- [ ] **Step 8: Add bip39 entry to `public/locales/ja/tools.json`**

After the `"wallet"` entry, before `"categories"`:

```json
  "bip39": {
    "title": "BIP39 ワードリスト - ニーモニック単語リファレンス",
    "shortTitle": "BIP39 ワードリスト",
    "description": "検索機能付きの完全な BIP39 ニーモニックワードリスト。標準英語 BIP39 ワードリストの全 2048 語をインデックスまたは部分文字列で検索。",
    "searchTerms": "bip39wadorisuto bip39wdlst tanigou nemonikku"
  },
```

- [ ] **Step 9: Add `viewWordList` to `public/locales/ja/wallet.json`**

```json
  "viewWordList": "完全な BIP39 ワードリストを見る →"
```

- [ ] **Step 10: Create `public/locales/ko/bip39.json`**

```json
{
  "searchPlaceholder": "BIP39 단어 검색...",
  "noResults": "일치하는 단어가 없습니다",
  "descriptions": {
    "text": "BIP39(비트코인 개선 제안 39)는 니모닉 구문을 만드는 표준을 정의합니다. 이것은 인간이 읽을 수 있는 12~24개 단어의 시퀀스로, 결정론적 지갑 시드를 인코딩합니다. 영어 단어 목록에는 정확히 2048개의 단어가 포함되어 있으며, 각 단어의 처음 4글자가 고유하도록 선택되어 전사 오류의 위험을 최소화합니다. 각 단어는 11비트 숫자에 매핑되므로, 12단어 구문은 132비트(128비트 엔트로피 + 4비트 체크섬)를 인코딩합니다. 아래 검색창에서 인덱스 또는 부분 문자열로 BIP39 단어를 검색하세요.",
    "aeoDefinition": "BIP39 단어 목록은 검색 기능이 있는 완전한 BIP39 니모닉 단어 목록을 무료로 참조할 수 있는 온라인 도구입니다. 표준 영어 BIP39 단어 목록의 2048개 단어를 인덱스 또는 부분 문자열로 검색할 수 있습니다. 브라우저에서 완전히 실행됩니다.",
    "whatIsTitle": "BIP39란?",
    "whatIs": "BIP39는 임의의 시드를 인간이 읽을 수 있는 단어 목록으로 표현하는 방법을 정의하는 비트코인 개선 제안입니다. 긴 16진수 문자열 대신 단어 시퀀스를 적어둠으로써 암호화폐 지갑의 백업과 복구가 쉬워집니다.",
    "purposeTitle": "단어 목록의 목적",
    "purpose": "BIP39 단어 목록은 어떤 두 단어도 처음 4글자가 겹치지 않도록 설계되었습니다. 복구 구문을 입력할 때 처음 4글자만 입력하면 단어를 고유하게 식별할 수 있어 입력 오류를 줄일 수 있습니다.",
    "securityTitle": "보안 주의사항",
    "security": "단어 목록 자체는 공개되어 있으며 비밀이 아닙니다. 보안은 니모닉 구문 내 단어의 무작위 선택과 순서에서 비롯됩니다. 니모닉 구문을 누구와도 공유하지 말고 안전한 장소에 오프라인으로 보관하세요.",
    "faq1Q": "BIP39 목록에 몇 개의 단어가 있나요?",
    "faq1A": "BIP39 영어 단어 목록에는 정확히 2048개의 단어가 있습니다. 각 단어는 11비트의 데이터를 인코딩하므로, 12단어 니모닉은 132비트(128비트 엔트로피 + 4비트 체크섬), 24단어 니모닉은 264비트를 나타냅니다.",
    "faq2Q": "다른 언어의 BIP39 단어를 사용할 수 있나요?",
    "faq2A": "BIP39는 영어, 일본어, 한국어, 스페인어, 중국어(간체·번체), 프랑스어, 이탈리아어, 포르투갈어, 체코어를 포함한 여러 언어를 지원합니다. 하지만 호환성 측면에서 영어가 가장 널리 사용되며 권장됩니다."
  }
}
```

- [ ] **Step 11: Add bip39 entry to `public/locales/ko/tools.json`**

After the `"wallet"` entry, before `"categories"`:

```json
  "bip39": {
    "title": "BIP39 단어 목록 - 니모닉 단어 참조",
    "shortTitle": "BIP39 단어 목록",
    "description": "검색 기능이 있는 완전한 BIP39 니모닉 단어 목록 참조. 표준 영어 BIP39 단어 목록의 2048개 단어를 인덱스 또는 부분 문자열로 검색.",
    "searchTerms": "bip39daneomokrok bip39dnmr nimonik daneo"
  },
```

- [ ] **Step 12: Add `viewWordList` to `public/locales/ko/wallet.json`**

```json
  "viewWordList": "전체 BIP39 단어 목록 보기 →"
```

- [ ] **Step 13: Create `public/locales/es/bip39.json`**

```json
{
  "searchPlaceholder": "Buscar palabras BIP39...",
  "noResults": "No se encontraron palabras",
  "descriptions": {
    "text": "BIP39 (Propuesta de Mejora de Bitcoin 39) define un estándar para crear frases mnemotécnicas: secuencias de 12 a 24 palabras legibles por humanos que codifican una semilla de billetera determinista. La lista de palabras en inglés contiene exactamente 2048 palabras, elegidas por su distintividad: ninguna pareja de palabras comparte las primeras cuatro letras, minimizando el riesgo de errores de transcripción. Cada palabra se mapea a un número de 11 bits, por lo que una frase de 12 palabras codifica 132 bits (128 bits de entropía + 4 bits de checksum). Use la barra de búsqueda para buscar cualquier palabra BIP39 por índice o subcadena.",
    "aeoDefinition": "Lista de palabras BIP39 es una referencia en línea gratuita de la lista completa de palabras mnemotécnicas BIP39 con búsqueda. Las 2048 palabras de la lista estándar en inglés, con búsqueda por índice o subcadena. Se ejecuta completamente en su navegador.",
    "whatIsTitle": "¿Qué es BIP39?",
    "whatIs": "BIP39 es una Propuesta de Mejora de Bitcoin que define cómo representar una semilla aleatoria como una lista de palabras legibles por humanos. Esto facilita hacer copias de seguridad y recuperar billeteras de criptomonedas escribiendo una secuencia de palabras en lugar de una larga cadena hexadecimal.",
    "purposeTitle": "Propósito de la lista de palabras",
    "purpose": "La lista de palabras BIP39 está diseñada para que ninguna pareja de palabras comparta los mismos primeros cuatro caracteres. Esto significa que solo necesita escribir las primeras cuatro letras para identificar de forma única cualquier palabra, reduciendo errores al ingresar frases de recuperación.",
    "securityTitle": "Notas de seguridad",
    "security": "La lista de palabras en sí es pública y no es secreta. La seguridad proviene de la selección aleatoria y el orden de las palabras en su frase mnemotécnica. Nunca comparta su frase mnemotécnica con nadie y guárdela offline en un lugar seguro.",
    "faq1Q": "¿Cuántas palabras hay en la lista BIP39?",
    "faq1A": "La lista de palabras BIP39 en inglés contiene exactamente 2048 palabras. Cada palabra codifica 11 bits de datos, por lo que una frase mnemotécnica de 12 palabras representa 132 bits (128 bits de entropía + 4 bits de checksum) y una de 24 palabras representa 264 bits.",
    "faq2Q": "¿Puedo usar palabras BIP39 en otros idiomas?",
    "faq2A": "BIP39 soporta múltiples idiomas incluyendo inglés, japonés, coreano, español, chino (simplificado y tradicional), francés, italiano, portugués y checo. Sin embargo, el inglés es el más utilizado y recomendado por compatibilidad."
  }
}
```

- [ ] **Step 14: Add bip39 entry to `public/locales/es/tools.json`**

After `"wallet"`, before `"categories"`:

```json
  "bip39": {
    "title": "Lista de palabras BIP39 - Referencia completa de palabras mnemotécnicas",
    "shortTitle": "Lista BIP39",
    "description": "Referencia completa de la lista de palabras mnemotécnicas BIP39 con búsqueda. Las 2048 palabras estándar en inglés, con búsqueda por índice o subcadena."
  },
```

- [ ] **Step 15: Add `viewWordList` to `public/locales/es/wallet.json`**

```json
  "viewWordList": "Ver lista completa de palabras BIP39 →"
```

- [ ] **Step 16: Create `public/locales/pt-BR/bip39.json`**

```json
{
  "searchPlaceholder": "Buscar palavras BIP39...",
  "noResults": "Nenhuma palavra encontrada",
  "descriptions": {
    "text": "BIP39 (Proposta de Melhoria do Bitcoin 39) define um padrão para criar frases mnemônicas — sequências de 12 a 24 palavras legíveis por humanos que codificam uma semente de carteira determinística. A lista de palavras em inglês contém exatamente 2048 palavras, escolhidas por sua distintividade: nenhum par de palavras compartilha as mesmas quatro primeiras letras, minimizando o risco de erros de transcrição. Cada palavra mapeia para um número de 11 bits, então uma frase de 12 palavras codifica 132 bits (128 bits de entropia + 4 bits de checksum). Use a barra de busca para procurar qualquer palavra BIP39 por índice ou substring.",
    "aeoDefinition": "Lista de Palavras BIP39 é uma referência online gratuita da lista completa de palavras mnemônicas BIP39 com busca. Todas as 2048 palavras da lista padrão em inglês, com busca por índice ou substring. Executa inteiramente no seu navegador.",
    "whatIsTitle": "O que é BIP39?",
    "whatIs": "BIP39 é uma Proposta de Melhoria do Bitcoin que define como representar uma semente aleatória como uma lista de palavras legíveis por humanos. Isso facilita o backup e a recuperação de carteiras de criptomoedas escrevendo uma sequência de palavras em vez de uma longa string hexadecimal.",
    "purposeTitle": "Propósito da lista de palavras",
    "purpose": "A lista de palavras BIP39 é projetada para que nenhum par de palavras compartilhe os mesmos primeiros quatro caracteres. Isso significa que você só precisa digitar as primeiras quatro letras para identificar unicamente qualquer palavra, reduzindo erros ao inserir frases de recuperação.",
    "securityTitle": "Notas de segurança",
    "security": "A lista de palavras em si é pública e não é secreta. A segurança vem da seleção aleatória e ordenação das palavras na sua frase mnemônica. Nunca compartilhe sua frase mnemônica com ninguém e armazene-a offline em um local seguro.",
    "faq1Q": "Quantas palavras há na lista BIP39?",
    "faq1A": "A lista de palavras BIP39 em inglês contém exatamente 2048 palavras. Cada palavra codifica 11 bits de dados, então uma frase mnemônica de 12 palavras representa 132 bits (128 bits de entropia + 4 bits de checksum) e uma de 24 palavras representa 264 bits.",
    "faq2Q": "Posso usar palavras BIP39 em outros idiomas?",
    "faq2A": "BIP39 suporta múltiplos idiomas incluindo inglês, japonês, coreano, espanhol, chinês (simplificado e tradicional), francês, italiano, português e tcheco. No entanto, o inglês é o mais utilizado e recomendado para compatibilidade."
  }
}
```

- [ ] **Step 17: Add bip39 entry to `public/locales/pt-BR/tools.json`**

After `"wallet"`, before `"categories"`:

```json
  "bip39": {
    "title": "Lista de Palavras BIP39 - Referência Completa de Mnemônicos",
    "shortTitle": "Lista BIP39",
    "description": "Referência completa da lista de palavras mnemônicas BIP39 com busca. Todas as 2048 palavras padrão em inglês, com busca por índice ou substring."
  },
```

- [ ] **Step 18: Add `viewWordList` to `public/locales/pt-BR/wallet.json`**

```json
  "viewWordList": "Ver lista completa de palavras BIP39 →"
```

- [ ] **Step 19: Create `public/locales/fr/bip39.json`**

```json
{
  "searchPlaceholder": "Rechercher des mots BIP39...",
  "noResults": "Aucun mot trouvé",
  "descriptions": {
    "text": "BIP39 (Proposition d'Amélioration Bitcoin 39) définit une norme pour créer des phrases mnémoniques — des séquences de 12 à 24 mots lisibles par l'humain qui codent une graine de portefeuille déterministe. La liste de mots anglais contient exactement 2048 mots, choisis pour leur caractère distinctif : aucune paire de mots ne partage les quatre mêmes premières lettres, minimisant le risque d'erreurs de transcription. Chaque mot correspond à un nombre de 11 bits, donc une phrase de 12 mots code 132 bits (128 bits d'entropie + 4 bits de somme de contrôle). Utilisez la barre de recherche pour trouver n'importe quel mot BIP39 par index ou sous-chaîne.",
    "aeoDefinition": "Liste de mots BIP39 est une référence en ligne gratuite de la liste complète des mots mnémoniques BIP39 avec recherche. Les 2048 mots de la liste standard anglaise, recherchables par index ou sous-chaîne. Fonctionne entièrement dans votre navigateur.",
    "whatIsTitle": "Qu'est-ce que BIP39 ?",
    "whatIs": "BIP39 est une Proposition d'Amélioration Bitcoin qui définit comment représenter une graine aléatoire sous forme de liste de mots lisibles par l'humain. Cela facilite la sauvegarde et la restauration de portefeuilles de cryptomonnaies en notant une séquence de mots au lieu d'une longue chaîne hexadécimale.",
    "purposeTitle": "Objectif de la liste de mots",
    "purpose": "La liste de mots BIP39 est conçue pour qu'aucune paire de mots ne partage les mêmes quatre premiers caractères. Cela signifie qu'il suffit de taper les quatre premières lettres pour identifier de manière unique n'importe quel mot, réduisant les erreurs lors de la saisie des phrases de récupération.",
    "securityTitle": "Notes de sécurité",
    "security": "La liste de mots elle-même est publique et n'est pas secrète. La sécurité provient de la sélection aléatoire et de l'ordre des mots dans votre phrase mnémonique. Ne partagez jamais votre phrase mnémonique avec qui que ce soit et stockez-la hors ligne dans un endroit sûr.",
    "faq1Q": "Combien de mots contient la liste BIP39 ?",
    "faq1A": "La liste de mots BIP39 en anglais contient exactement 2048 mots. Chaque mot code 11 bits de données, donc une phrase mnémonique de 12 mots représente 132 bits (128 bits d'entropie + 4 bits de somme de contrôle) et une de 24 mots représente 264 bits.",
    "faq2Q": "Puis-je utiliser des mots BIP39 dans d'autres langues ?",
    "faq2A": "BIP39 prend en charge plusieurs langues dont l'anglais, le japonais, le coréen, l'espagnol, le chinois (simplifié et traditionnel), le français, l'italien, le portugais et le tchèque. Cependant, l'anglais est le plus largement utilisé et recommandé pour la compatibilité."
  }
}
```

- [ ] **Step 20: Add bip39 entry to `public/locales/fr/tools.json`**

After `"wallet"`, before `"categories"`:

```json
  "bip39": {
    "title": "Liste de mots BIP39 - Référence complète des mnémoniques",
    "shortTitle": "Liste BIP39",
    "description": "Référence complète de la liste de mots mnémoniques BIP39 avec recherche. Les 2048 mots standards en anglais, recherchables par index ou sous-chaîne."
  },
```

- [ ] **Step 21: Add `viewWordList` to `public/locales/fr/wallet.json`**

```json
  "viewWordList": "Voir la liste complète des mots BIP39 →"
```

- [ ] **Step 22: Create `public/locales/de/bip39.json`**

```json
{
  "searchPlaceholder": "BIP39-Wörter suchen...",
  "noResults": "Keine Wörter gefunden",
  "descriptions": {
    "text": "BIP39 (Bitcoin Improvement Proposal 39) definiert einen Standard zur Erstellung von mnemonischen Phrasen — menschenlesbare Sequenzen aus 12 bis 24 Wörtern, die einen deterministischen Wallet-Seed kodieren. Die englische Wortliste enthält genau 2048 Wörter, die nach ihrer Eindeutigkeit ausgewählt wurden: Keine zwei Wörter teilen die gleichen ersten vier Buchstaben, was das Risiko von Übertragungsfehlern minimiert. Jedes Wort wird einer 11-Bit-Zahl zugeordnet, sodass eine 12-Wort-Phrase 132 Bits kodiert (128 Bits Entropie + 4 Bits Prüfsumme). Verwenden Sie die Suchleiste, um ein beliebiges BIP39-Wort nach Index oder Teilzeichenfolge zu suchen.",
    "aeoDefinition": "BIP39-Wortliste ist eine kostenlose Online-Referenz für die vollständige BIP39-mnemonische Wortliste mit Suche. Alle 2048 Wörter der englischen Standardliste, durchsuchbar nach Index oder Teilzeichenfolge. Läuft vollständig in Ihrem Browser.",
    "whatIsTitle": "Was ist BIP39?",
    "whatIs": "BIP39 ist ein Bitcoin-Verbesserungsvorschlag, der definiert, wie ein zufälliger Seed als menschenlesbare Wortliste dargestellt wird. Dies erleichtert das Sichern und Wiederherstellen von Krypto-Wallets, indem man eine Wortsequenz anstelle einer langen hexadezimalen Zeichenfolge aufschreibt.",
    "purposeTitle": "Zweck der Wortliste",
    "purpose": "Die BIP39-Wortliste ist so konzipiert, dass keine zwei Wörter dieselben ersten vier Zeichen teilen. Das bedeutet, dass Sie nur die ersten vier Buchstaben eingeben müssen, um ein Wort eindeutig zu identifizieren, was Eingabefehler bei Wiederherstellungsphrasen reduziert.",
    "securityTitle": "Sicherheitshinweise",
    "security": "Die Wortliste selbst ist öffentlich und nicht geheim. Die Sicherheit ergibt sich aus der zufälligen Auswahl und Reihenfolge der Wörter in Ihrer mnemonischen Phrase. Teilen Sie Ihre mnemonische Phrase niemals mit jemandem und bewahren Sie sie offline an einem sicheren Ort auf.",
    "faq1Q": "Wie viele Wörter enthält die BIP39-Liste?",
    "faq1A": "Die englische BIP39-Wortliste enthält genau 2048 Wörter. Jedes Wort kodiert 11 Bits Daten, sodass eine 12-Wort-mnemonische Phrase 132 Bits (128 Bits Entropie + 4 Bits Prüfsumme) und eine 24-Wort-Phrase 264 Bits darstellt.",
    "faq2Q": "Kann ich BIP39-Wörter in anderen Sprachen verwenden?",
    "faq2A": "BIP39 unterstützt mehrere Sprachen, darunter Englisch, Japanisch, Koreanisch, Spanisch, Chinesisch (vereinfacht und traditionell), Französisch, Italienisch, Portugiesisch und Tschechisch. Englisch ist jedoch am weitesten verbreitet und wird aus Kompatibilitätsgründen empfohlen."
  }
}
```

- [ ] **Step 23: Add bip39 entry to `public/locales/de/tools.json`**

After `"wallet"`, before `"categories"`:

```json
  "bip39": {
    "title": "BIP39-Wortliste - Vollständige mnemonische Wortreferenz",
    "shortTitle": "BIP39-Wortliste",
    "description": "Vollständige Referenz der BIP39-mnemonischen Wortliste mit Suche. Alle 2048 Wörter der englischen Standardliste, durchsuchbar nach Index oder Teilzeichenfolge."
  },
```

- [ ] **Step 24: Add `viewWordList` to `public/locales/de/wallet.json`**

```json
  "viewWordList": "Vollständige BIP39-Wortliste anzeigen →"
```

- [ ] **Step 25: Create `public/locales/ru/bip39.json`**

```json
{
  "searchPlaceholder": "Поиск слов BIP39...",
  "noResults": "Слова не найдены",
  "descriptions": {
    "text": "BIP39 (Предложение по улучшению Bitcoin 39) определяет стандарт создания мнемонических фраз — удобочитаемых последовательностей от 12 до 24 слов, кодирующих seed детерминированного кошелька. Английский список слов содержит ровно 2048 слов, отобранных по принципу уникальности: никакие два слова не имеют одинаковых первых четырёх букв, что минимизирует риск ошибок при записи. Каждое слово отображается в 11-битное число, поэтому фраза из 12 слов кодирует 132 бита (128 бит энтропии + 4 бита контрольной суммы). Используйте строку поиска для поиска любого слова BIP39 по индексу или подстроке.",
    "aeoDefinition": "Список слов BIP39 — бесплатная онлайн-справка полного мнемонического списка слов BIP39 с поиском. Все 2048 слов стандартного английского списка, с поиском по индексу или подстроке. Работает полностью в вашем браузере.",
    "whatIsTitle": "Что такое BIP39?",
    "whatIs": "BIP39 — это предложение по улучшению Bitcoin, определяющее способ представления случайного seed в виде списка удобочитаемых слов. Это упрощает резервное копирование и восстановление криптовалютных кошельков — достаточно записать последовательность слов вместо длинной шестнадцатеричной строки.",
    "purposeTitle": "Назначение списка слов",
    "purpose": "Список слов BIP39 спроектирован так, чтобы никакие два слова не имели одинаковых первых четырёх символов. Это означает, что для однозначной идентификации слова достаточно ввести первые четыре буквы, что снижает количество ошибок при вводе фраз восстановления.",
    "securityTitle": "Примечания по безопасности",
    "security": "Сам список слов является открытым и не представляет секрета. Безопасность обеспечивается случайным выбором и порядком слов в мнемонической фразе. Никогда не делитесь мнемонической фразой и храните её в безопасном месте в офлайн-режиме.",
    "faq1Q": "Сколько слов в списке BIP39?",
    "faq1A": "Английский список слов BIP39 содержит ровно 2048 слов. Каждое слово кодирует 11 бит данных, поэтому мнемоническая фраза из 12 слов представляет 132 бита (128 бит энтропии + 4 бита контрольной суммы), а из 24 слов — 264 бита.",
    "faq2Q": "Можно ли использовать слова BIP39 на других языках?",
    "faq2A": "BIP39 поддерживает несколько языков: английский, японский, корейский, испанский, китайский (упрощённый и традиционный), французский, итальянский, португальский и чешский. Однако английский является наиболее распространённым и рекомендуемым для совместимости."
  }
}
```

- [ ] **Step 26: Add bip39 entry to `public/locales/ru/tools.json`**

After `"wallet"`, before `"categories"`:

```json
  "bip39": {
    "title": "Список слов BIP39 - Полный справочник мнемонических слов",
    "shortTitle": "Список BIP39",
    "description": "Полный справочник мнемонического списка слов BIP39 с поиском. Все 2048 слов стандартного английского списка с поиском по индексу или подстроке."
  },
```

- [ ] **Step 27: Add `viewWordList` to `public/locales/ru/wallet.json`**

```json
  "viewWordList": "Смотреть полный список слов BIP39 →"
```

- [ ] **Step 28: Validate all JSON files**

Run: `for f in public/locales/*/bip39.json; do node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" && echo "$f OK" || echo "$f FAIL"; done`

- [ ] **Step 29: Commit**

```bash
git add public/locales/
git commit -m "feat(bip39): add i18n translations for all 10 locales"
```

---

### Task 4: Create Route Entry (page.tsx)

**Files:**

- Create: `app/[locale]/bip39/page.tsx`

- [ ] **Step 1: Create directory and file**

Create `app/[locale]/bip39/` directory and `page.tsx`:

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import BIP39Page from "./bip39-page";

const PATH = "/bip39";
const TOOL_KEY = "bip39";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("bip39.title"),
    description: t("bip39.description"),
  });
}

export default async function BIP39Route({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "bip39" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const schemas = buildToolSchemas({
    name: t("bip39.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("bip39.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems: [1, 2].map((i) => ({
      q: tx(`descriptions.faq${i}Q`),
      a: tx(`descriptions.faq${i}A`),
    })),
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
      <BIP39Page />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/bip39/page.tsx
git commit -m "feat(bip39): add route entry with SEO metadata"
```

---

### Task 5: Create Page Component (bip39-page.tsx)

**Files:**

- Create: `app/[locale]/bip39/bip39-page.tsx`

- [ ] **Step 1: Create the full page component**

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, ChevronDown, ChevronUp, CircleHelp } from "lucide-react";
import Layout from "../../../components/layout";
import { StyledInput } from "../../../components/ui/input";
import { Accordion } from "../../../components/ui/accordion";
import RelatedTools from "../../../components/related-tools";
import { wordlist } from "@scure/bip39/wordlists/english";

const WORDS: string[] = wordlist;

function TopDescription() {
  const t = useTranslations("bip39");
  const tc = useTranslations("common");
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="pb-3">
      <div className="relative">
        <div
          className={`overflow-hidden transition-all duration-300 ${
            expanded ? "max-h-[500px]" : "max-h-20"
          }`}
        >
          <p className="text-fg-secondary text-sm leading-8 indent-12">{t("descriptions.text")}</p>
        </div>
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-bg-base to-transparent pointer-events-none" />
        )}
      </div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mt-1 flex items-center gap-1 text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors"
      >
        {expanded ? (
          <>
            <ChevronUp size={14} />
            {tc("showLess")}
          </>
        ) : (
          <>
            <ChevronDown size={14} />
            {tc("showMore")}
          </>
        )}
      </button>
    </section>
  );
}

function highlightMatch(word: string, query: string): React.ReactNode {
  if (!query) return word;
  const idx = word.indexOf(query);
  if (idx === -1) return word;
  return (
    <>
      {word.slice(0, idx)}
      <span className="text-accent-cyan">{word.slice(idx, idx + query.length)}</span>
      {word.slice(idx + query.length)}
    </>
  );
}

function WordGrid() {
  const t = useTranslations("bip39");
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const filtered = !q ? WORDS : WORDS.filter((word) => word.includes(q));

  return (
    <div>
      <div className="relative mb-3">
        <StyledInput
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none"
          size={16}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-8 text-fg-muted text-sm text-center">{t("noResults")}</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-px bg-border-default rounded-lg overflow-hidden">
          {filtered.map((word) => {
            const index = WORDS.indexOf(word) + 1;
            return (
              <div
                key={word}
                className="bg-bg-surface px-2 py-1.5 flex items-center gap-1.5 hover:bg-bg-elevated/60 transition-colors duration-150"
              >
                <span className="text-fg-muted text-xs w-7 shrink-0 text-right">{index}</span>
                <span className="text-fg-primary font-mono text-sm truncate">
                  {highlightMatch(word, q)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-2 text-xs text-fg-muted text-right">
        {filtered.length} / {WORDS.length} words
      </div>
    </div>
  );
}

function BottomDescription() {
  const t = useTranslations("bip39");
  const tc = useTranslations("common");

  const descriptionSections = [
    { title: t("descriptions.whatIsTitle"), content: t("descriptions.whatIs") },
    { title: t("descriptions.purposeTitle"), content: t("descriptions.purpose") },
    { title: t("descriptions.securityTitle"), content: t("descriptions.security") },
  ];

  const faqItems = [1, 2].map((i) => ({
    title: t(`descriptions.faq${i}Q`),
    content: <p>{t(`descriptions.faq${i}A`)}</p>,
  }));

  return (
    <section id="description" className="mt-8">
      <div className="border-l-2 border-accent-cyan/40 pl-4 py-2.5 mb-4">
        <p className="text-fg-secondary text-sm leading-relaxed">
          {t("descriptions.aeoDefinition")}
        </p>
      </div>
      {descriptionSections.map((section) => (
        <div key={section.title} className="mb-4">
          <h2 className="font-semibold text-fg-primary text-base">{section.title}</h2>
          <div className="mt-1 text-fg-secondary text-sm leading-relaxed">
            <p>{section.content}</p>
          </div>
        </div>
      ))}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <CircleHelp size={16} className="text-accent-cyan shrink-0" aria-hidden="true" />
          <h2 className="font-semibold text-fg-primary text-base text-pretty">
            {tc("descriptions.faqTitle")}
          </h2>
        </div>
        <Accordion items={faqItems} />
      </div>
    </section>
  );
}

export default function BIP39Page() {
  const t = useTranslations("tools");
  return (
    <Layout
      title={t("bip39.shortTitle")}
      categoryLabel={t("categories.reference")}
      categorySlug="reference-lookup"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <TopDescription />
        <WordGrid />
        <BottomDescription />
        <RelatedTools currentTool="bip39" />
      </div>
    </Layout>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `bip39-page.tsx`

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/bip39/bip39-page.tsx
git commit -m "feat(bip39): add page component with word grid and search"
```

---

### Task 6: Add BIP39 Link to Wallet Page

**Files:**

- Modify: `app/[locale]/wallet/wallet-page.tsx`

- [ ] **Step 1: Add link after BIP39 description in the Description component**

In `wallet-page.tsx`, find the `Description` function (line 450). After the `descriptionSections.map` block (line 476-483), add a link element. Also add necessary imports at the top.

Add `Link` import from `next/link` and `useLocale` from `next-intl`:

After line 5 (`import Layout from "../../../components/layout";`), update the imports:

Add at the top imports:

```tsx
import Link from "next/link";
import { useLocale } from "next-intl";
```

(Keep the existing `useTranslations` import from `next-intl` — just add `useLocale` alongside it.)

Wait — check the existing imports. Line 5 already imports from `next-intl` via `useTranslations` at line 6. Add `useLocale` there:

```tsx
import { useTranslations, useLocale } from "next-intl";
```

Then add `Link` import:

```tsx
import Link from "next/link";
```

In the `Description` function, after the `descriptionSections.map` closing `)` (line 483), add the link:

```tsx
{
  descriptionSections.map((section) => (
    <div key={section.title} className="mb-4">
      <h2 className="font-semibold text-fg-primary text-base">{section.title}</h2>
      <div className="mt-1 text-fg-secondary text-sm leading-relaxed">
        <p>{section.content}</p>
      </div>
    </div>
  ));
}
<div className="mb-4">
  <Link
    href={locale === "en" ? "/bip39" : `/${locale}/bip39`}
    className="text-sm text-accent-cyan hover:text-accent-cyan/80 transition-colors"
  >
    {t("viewWordList")}
  </Link>
</div>;
```

And add `const locale = useLocale();` at the beginning of the `Description` function (after `const tc = useTranslations("common");` on line 453):

```tsx
function Description() {
  const t = useTranslations("wallet");
  const tc = useTranslations("common");
  const locale = useLocale();
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/wallet/wallet-page.tsx
git commit -m "feat(bip39): add link to BIP39 word list from wallet page"
```

---

### Task 7: Build Verification

**Files:** None

- [ ] **Step 1: Run ESLint**

Run: `npx eslint app/[locale]/bip39/ libs/tools.ts --max-warnings=0 2>&1 | tail -20`
Expected: No errors or warnings

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit --pretty 2>&1 | tail -20`
Expected: No errors

- [ ] **Step 3: Run dev server smoke test**

Run: `npx next build 2>&1 | tail -30`
Expected: Build succeeds, `/bip39` route listed in output

- [ ] **Step 4: Commit (if any fixes were needed)**

Only if fixes were applied in Steps 1-3.

---

## Self-Review Checklist

### Spec Coverage

| Spec Requirement                                                     | Task                        |
| -------------------------------------------------------------------- | --------------------------- |
| Tool at `/bip39` with searchable grid                                | Task 4 + 5                  |
| Import wordlist from `@scure/bip39/wordlists/english.js`             | Task 5                      |
| Register in `libs/tools.ts` (TOOLS, TOOL_CATEGORIES, TOOL_RELATIONS) | Task 1                      |
| Route entry with SEO metadata + JSON-LD                              | Task 4                      |
| TopDescription expand/collapse pattern                               | Task 5                      |
| WordGrid with search, responsive grid, stats                         | Task 5                      |
| BottomDescription with FAQ accordion                                 | Task 5                      |
| RelatedTools integration                                             | Task 1 (via TOOL_RELATIONS) |
| Wallet page link to bip39                                            | Task 6                      |
| i18n for all 10 locales                                              | Task 2 + 3                  |
| searchTerms for CJK locales                                          | Task 3                      |
| ESLint/TypeScript pass                                               | Task 7                      |

### Placeholder Scan

No TBD, TODO, "implement later", or vague instructions found. All steps contain complete code.

### Type Consistency

- `wordlist` from `@scure/bip39/wordlists/english.js` is `string[]` (confirmed from `.d.ts`)
- `WORDS` typed as `string[]`
- `filtered` derived from `WORDS.filter()` → `string[]`
- `TOOLS` entry uses `BookOpen` icon from lucide-react (confirmed available)
- `TOOL_RELATIONS` keys match `TOOLS` entries
- All i18n keys used in components match keys defined in JSON files
