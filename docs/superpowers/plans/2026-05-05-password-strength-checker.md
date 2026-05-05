# Password Strength Checker — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a zxcvbn-based password strength checker tab to the existing Password Generator page.

**Architecture:** Lazy-load `@zxcvbn-ts/core` via a wrapper module (`libs/password/strength.ts`). Add `NeonTabs` to the Password page for Generator/Checker toggle. Shared state (`activeTab`, `checkerInput`) lives in `PasswordPage`. Both tabs and saved passwords use the same async `analyzeStrength()` function. Warning/suggestion strings from zxcvbn are mapped to i18n keys via a static lookup.

**Tech Stack:** `@zxcvbn-ts/core`, `@zxcvbn-ts/language-common`, `@zxcvbn-ts/language-en`, NeonTabs (Headless UI), next-intl, Tailwind CSS

---

### Task 1: Install dependencies

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install zxcvbn-ts packages**

```bash
npm install @zxcvbn-ts/core @zxcvbn-ts/language-common @zxcvbn-ts/language-en
```

- [ ] **Step 2: Verify installation**

```bash
npm ls @zxcvbn-ts/core @zxcvbn-ts/language-common @zxcvbn-ts/language-en
```

Expected: all three listed with versions, no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @zxcvbn-ts dependencies for password strength checker"
```

---

### Task 2: Create `libs/password/strength.ts` — core strength analysis

**Files:**

- Create: `libs/password/strength.ts`

This module lazy-loads zxcvbn on first call and caches the instance. It returns raw data for the component to format via i18n.

**zxcvbn-ts API notes:**

- `ZxcvbnFactory` from `@zxcvbn-ts/core` — constructor accepts `{ dictionary, translations }` options
- `zxcvbn.check(password)` returns `ZxcvbnResult` with `.score` (0-4), `.crackTimes`, `.feedback`
- `crackTimes.offlineSlowHashingXPerSecond` has `{ base, seconds, display }` — we use this scenario
- `feedback.warning` is a string key (from `translationKeys.ts`) or `null`
- `feedback.suggestions` is an array of string keys

**Important:** We pass `translations` from `@zxcvbn-ts/language-en` so zxcvbn produces English strings for feedback. We map those to i18n keys in a separate file (Task 3). For crack time, we extract raw seconds and compute the unit/value ourselves.

- [ ] **Step 1: Create `libs/password/strength.ts`**

```typescript
import type { Score } from "@zxcvbn-ts/core/dist/types";

export type StrengthScore = 0 | 1 | 2 | 3 | 4;

export type CrackTimeUnit =
  | "instant"
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "months"
  | "years"
  | "centuries";

export interface StrengthResult {
  score: StrengthScore;
  crackTimeSeconds: number;
  crackTimeUnit: CrackTimeUnit;
  crackTimeValue: number;
  warningKey: string | null;
  suggestionKeys: string[];
}

const SECOND = 1;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const MONTH = DAY * 31;
const YEAR = MONTH * 12;

const TIME_UNITS: { unit: CrackTimeUnit; seconds: number }[] = [
  { unit: "seconds", seconds: SECOND },
  { unit: "minutes", seconds: MINUTE },
  { unit: "hours", seconds: HOUR },
  { unit: "days", seconds: DAY },
  { unit: "months", seconds: MONTH },
  { unit: "years", seconds: YEAR },
  { unit: "centuries", seconds: YEAR * 100 },
];

function computeCrackTimeUnit(totalSeconds: number): {
  unit: CrackTimeUnit;
  value: number;
} {
  if (totalSeconds < SECOND) {
    return { unit: "instant", value: 0 };
  }
  for (let i = 0; i < TIME_UNITS.length; i++) {
    const nextSeconds = i + 1 < TIME_UNITS.length ? TIME_UNITS[i + 1].seconds : Infinity;
    if (totalSeconds < nextSeconds) {
      return {
        unit: TIME_UNITS[i].unit,
        value: Math.round(totalSeconds / TIME_UNITS[i].seconds),
      };
    }
  }
  return { unit: "centuries", value: Math.round(totalSeconds / (YEAR * 100)) };
}

let cachedCheck: ((password: string) => import("@zxcvbn-ts/core/dist/types").ZxcvbnResult) | null =
  null;

async function getChecker() {
  if (cachedCheck) return cachedCheck;
  const [{ ZxcvbnFactory }, commonPackage, enPackage] = await Promise.all([
    import("@zxcvbn-ts/core"),
    import("@zxcvbn-ts/language-common"),
    import("@zxcvbn-ts/language-en"),
  ]);
  const options = {
    dictionary: {
      ...(commonPackage.default?.dictionary ?? (commonPackage as any).dictionary),
      ...(enPackage.default?.dictionary ?? (enPackage as any).dictionary),
    },
    translations: enPackage.default?.translations ?? (enPackage as any).translations,
  };
  const zxcvbn = new ZxcvbnFactory(options);
  cachedCheck = (password: string) => zxcvbn.check(password);
  return cachedCheck;
}

export async function analyzeStrength(password: string): Promise<StrengthResult> {
  const check = await getChecker();
  const result = check(password);

  const crackSeconds = result.crackTimes.offlineSlowHashingXPerSecond.seconds;
  const { unit, value } = computeCrackTimeUnit(crackSeconds);

  return {
    score: result.score as StrengthScore,
    crackTimeSeconds: crackSeconds,
    crackTimeUnit: unit,
    crackTimeValue: value,
    warningKey: result.feedback.warning ?? null,
    suggestionKeys: result.feedback.suggestions.filter(Boolean),
  };
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit libs/password/strength.ts
```

Expected: no errors (may show import resolution warnings for zxcvbn-ts types — acceptable at this stage).

- [ ] **Step 3: Commit**

```bash
git add libs/password/strength.ts
git commit -m "feat(password): add zxcvbn-based strength analysis module"
```

---

### Task 3: Create `libs/password/warnings-map.ts` — i18n key mapping

**Files:**

- Create: `libs/password/warnings-map.ts`

Maps zxcvbn-ts translation keys (the string keys from `translationKeys.ts`, not the English display strings) to our own i18n keys. zxcvbn returns keys like `"topTen"`, `"anotherWord"` — we map those to `"zxcvbnWarningTopTen"`, `"zxcvbnSuggestionAnotherWord"` etc.

**Source of truth:** The complete list from `@zxcvbn-ts/core` `translationKeys.ts`:

Warnings (16): `straightRow`, `keyPattern`, `simpleRepeat`, `extendedRepeat`, `sequences`, `recentYears`, `dates`, `topTen`, `topHundred`, `common`, `similarToCommon`, `wordByItself`, `namesByThemselves`, `commonNames`, `userInputs`, `pwned`

Suggestions (14): `l33t`, `reverseWords`, `allUppercase`, `capitalization`, `dates`, `recentYears`, `associatedYears`, `sequences`, `repeated`, `longerKeyboardPattern`, `anotherWord`, `useWords`, `noNeed`, `pwned`

- [ ] **Step 1: Create `libs/password/warnings-map.ts`**

```typescript
export const warningMap: Record<string, string> = {
  straightRow: "zxcvbnWarningStraightRow",
  keyPattern: "zxcvbnWarningKeyPattern",
  simpleRepeat: "zxcvbnWarningSimpleRepeat",
  extendedRepeat: "zxcvbnWarningExtendedRepeat",
  sequences: "zxcvbnWarningSequences",
  recentYears: "zxcvbnWarningRecentYears",
  dates: "zxcvbnWarningDates",
  topTen: "zxcvbnWarningTopTen",
  topHundred: "zxcvbnWarningTopHundred",
  common: "zxcvbnWarningCommon",
  similarToCommon: "zxcvbnWarningSimilarToCommon",
  wordByItself: "zxcvbnWarningWordByItself",
  namesByThemselves: "zxcvbnWarningNamesByThemselves",
  commonNames: "zxcvbnWarningCommonNames",
  userInputs: "zxcvbnWarningUserInputs",
  pwned: "zxcvbnWarningPwned",
};

export const suggestionMap: Record<string, string> = {
  l33t: "zxcvbnSuggestionL33t",
  reverseWords: "zxcvbnSuggestionReverseWords",
  allUppercase: "zxcvbnSuggestionAllUppercase",
  capitalization: "zxcvbnSuggestionCapitalization",
  dates: "zxcvbnSuggestionDates",
  recentYears: "zxcvbnSuggestionRecentYears",
  associatedYears: "zxcvbnSuggestionAssociatedYears",
  sequences: "zxcvbnSuggestionSequences",
  repeated: "zxcvbnSuggestionRepeated",
  longerKeyboardPattern: "zxcvbnSuggestionLongerKeyboardPattern",
  anotherWord: "zxcvbnSuggestionAnotherWord",
  useWords: "zxcvbnSuggestionUseWords",
  noNeed: "zxcvbnSuggestionNoNeed",
  pwned: "zxcvbnSuggestionPwned",
};

export function mapWarning(key: string | null): string | null {
  if (!key) return null;
  return warningMap[key] ?? key;
}

export function mapSuggestions(keys: string[]): string[] {
  return keys.map((key) => suggestionMap[key] ?? key);
}
```

- [ ] **Step 2: Update `strength.ts` to use the mapping**

In `libs/password/strength.ts`, import and apply `mapWarning` and `mapSuggestions`:

Add at top of file:

```typescript
import { mapWarning, mapSuggestions } from "./warnings-map";
```

In the `analyzeStrength` return statement, change:

```typescript
    warningKey: mapWarning(result.feedback.warning ?? null),
    suggestionKeys: mapSuggestions(result.feedback.suggestions.filter(Boolean)),
```

(Replace the existing `warningKey` and `suggestionKeys` lines.)

- [ ] **Step 3: Commit**

```bash
git add libs/password/warnings-map.ts libs/password/strength.ts
git commit -m "feat(password): add warning/suggestion i18n key mapping"
```

---

### Task 4: Add i18n keys to `en/password.json`

**Files:**

- Modify: `public/locales/en/password.json`

Add new keys for: tab labels, checker UI, crack time display, zxcvbn warnings/suggestions, and the replacement info card text. Remove `strengthGood`, `entropyVerified`, `entropyVerifiedDesc`.

- [ ] **Step 1: Update `public/locales/en/password.json`**

The final file should be:

```json
{
  "needRandomPlaceholder": "Need a random password? Try it.",
  "generateSubtext": "Generate strong, unique passwords to keep your accounts safe.",
  "generatedPassword": "Your Password",
  "generatePassword": "Generate",
  "copyPassword": "Copy",
  "bookmarkPassword": "Bookmark",
  "showPassword": "Show",
  "hidePassword": "Hide",
  "customizeYourPassword": "Customize Options",
  "memorable": "Memorable",
  "random": "Random",
  "passwordLength": "Length",
  "uppercase": "Uppercase (A-Z)",
  "lowercase": "Lowercase (a-z)",
  "numbers": "Numbers (0-9)",
  "symbols": "Symbols (!@#$%)",
  "avoidAmbiguous": "Avoid Ambiguous (0O1lI)",
  "capitalize": "Capitalize",
  "fullWords": "Full Words",
  "savedTitle": "Saved Passwords",
  "clearAllWithCount": "Clear All",
  "alertNotTransferred": "* All generated passwords are not transferred or saved to the server. All generations are performed directly in the browser",
  "fullyLocal": "Fully Local",
  "fullyLocalDesc": "All calculations are performed in the browser using crypto.getRandomValues(). No server, no network, no tracking.",
  "auditReady": "Audit Ready",
  "auditReadyDesc": "Open source algorithm with transparent character set. You can verify security yourself.",
  "securityTip": "For best security, use 16+ characters with uppercase, lowercase, numbers, and symbols enabled.",
  "localGenerated": "Cryptographically secure passwords generated entirely in your browser. Your data never leaves your device.",
  "strengthVeryWeak": "Very Weak",
  "strengthWeak": "Weak",
  "strengthFair": "Fair",
  "strengthStrong": "Strong",
  "strengthVeryStrong": "Very Strong",
  "tabGenerator": "Password Generator",
  "tabChecker": "Strength Checker",
  "checkThisPassword": "Check this password",
  "enterPassword": "Enter a password to check",
  "crackTimeLabel": "to crack",
  "crackTimeInstant": "Instant",
  "crackTimeSeconds": "{n} seconds",
  "crackTimeMinutes": "{n} minutes",
  "crackTimeHours": "{n} hours",
  "crackTimeDays": "{n} days",
  "crackTimeMonths": "{n} months",
  "crackTimeYears": "{n} years",
  "crackTimeCenturies": "Centuries",
  "strengthInfoDesc": "Password strength is analyzed by zxcvbn, an open-source library that detects common patterns and estimates crack time. All analysis runs entirely in your browser.",
  "zxcvbnWarningStraightRow": "Straight rows of keys on your keyboard are easy to guess.",
  "zxcvbnWarningKeyPattern": "Short keyboard patterns are easy to guess.",
  "zxcvbnWarningSimpleRepeat": "Repeated characters like \"aaa\" are easy to guess.",
  "zxcvbnWarningExtendedRepeat": "Repeated character patterns like \"abcabcabc\" are easy to guess.",
  "zxcvbnWarningSequences": "Common character sequences like \"abc\" are easy to guess.",
  "zxcvbnWarningRecentYears": "Recent years are easy to guess.",
  "zxcvbnWarningDates": "Dates are easy to guess.",
  "zxcvbnWarningTopTen": "This is a heavily used password.",
  "zxcvbnWarningTopHundred": "This is a frequently used password.",
  "zxcvbnWarningCommon": "This is a commonly used password.",
  "zxcvbnWarningSimilarToCommon": "This is similar to a commonly used password.",
  "zxcvbnWarningWordByItself": "Single words are easy to guess.",
  "zxcvbnWarningNamesByThemselves": "Single names or surnames are easy to guess.",
  "zxcvbnWarningCommonNames": "Common names and surnames are easy to guess.",
  "zxcvbnWarningUserInputs": "There should not be any personal or page related data.",
  "zxcvbnWarningPwned": "Your password was exposed by a data breach on the Internet.",
  "zxcvbnSuggestionL33t": "Avoid predictable letter substitutions like '@' for 'a'.",
  "zxcvbnSuggestionReverseWords": "Avoid reversed spellings of common words.",
  "zxcvbnSuggestionAllUppercase": "Capitalize some, but not all letters.",
  "zxcvbnSuggestionCapitalization": "Capitalize more than the first letter.",
  "zxcvbnSuggestionDates": "Avoid dates and years that are associated with you.",
  "zxcvbnSuggestionRecentYears": "Avoid recent years.",
  "zxcvbnSuggestionAssociatedYears": "Avoid years that are associated with you.",
  "zxcvbnSuggestionSequences": "Avoid common character sequences.",
  "zxcvbnSuggestionRepeated": "Avoid repeated words and characters.",
  "zxcvbnSuggestionLongerKeyboardPattern": "Use longer keyboard patterns and change typing direction multiple times.",
  "zxcvbnSuggestionAnotherWord": "Add more words that are less common.",
  "zxcvbnSuggestionUseWords": "Use multiple words, but avoid common phrases.",
  "zxcvbnSuggestionNoNeed": "You can create strong passwords without using symbols, numbers, or uppercase letters.",
  "zxcvbnSuggestionPwned": "If you use this password elsewhere, you should change it."
}
```

Note: Removed `strengthGood`, `entropyVerified`, `entropyVerifiedDesc`. Added all new keys.

- [ ] **Step 2: Commit**

```bash
git add public/locales/en/password.json
git commit -m "feat(password): add checker i18n keys to en locale"
```

---

### Task 5: Add i18n keys to all non-English locales

**Files:**

- Modify: `public/locales/zh-CN/password.json`
- Modify: `public/locales/zh-TW/password.json`
- Modify: `public/locales/ja/password.json`
- Modify: `public/locales/ko/password.json`
- Modify: `public/locales/es/password.json`
- Modify: `public/locales/pt-BR/password.json`
- Modify: `public/locales/fr/password.json`
- Modify: `public/locales/de/password.json`
- Modify: `public/locales/ru/password.json`

For each locale:

1. Remove `strengthGood`, `entropyVerified`, `entropyVerifiedDesc` keys
2. Add the same new keys as en (tab labels, checker UI, crack time, strengthInfoDesc) with translated values
3. For zxcvbn warnings/suggestions: copy the English values as placeholders — these can be translated later (the UI falls back to English if the key is missing, so this is safe)

The zxcvbn warning/suggestion keys should have English text in all non-English locales initially. They will function via the fallback mechanism. Proper translations can be added incrementally.

**Per-locale details for non-zxcvbn keys:**

`zh-CN`:

- `tabGenerator`: "密码生成器"
- `tabChecker`: "强度检测"
- `checkThisPassword`: "检测此密码"
- `enterPassword`: "输入要检测的密码"
- `crackTimeLabel`: "即可破解"
- `crackTimeInstant`: "瞬间"
- `crackTimeSeconds`: "{n} 秒"
- `crackTimeMinutes`: "{n} 分钟"
- `crackTimeHours`: "{n} 小时"
- `crackTimeDays`: "{n} 天"
- `crackTimeMonths`: "{n} 个月"
- `crackTimeYears`: "{n} 年"
- `crackTimeCenturies`: "数百年"
- `strengthInfoDesc`: "密码强度由 zxcvbn 开源库分析，可检测常见模式并估算破解时间。所有分析均在浏览器中完成。"

`zh-TW`:

- `tabGenerator`: "密碼產生器"
- `tabChecker`: "強度檢測"
- `checkThisPassword`: "檢測此密碼"
- `enterPassword`: "輸入要檢測的密碼"
- `crackTimeLabel`: "即可破解"
- `crackTimeInstant`: "瞬間"
- `crackTimeSeconds`: "{n} 秒"
- `crackTimeMinutes`: "{n} 分鐘"
- `crackTimeHours`: "{n} 小時"
- `crackTimeDays`: "{n} 天"
- `crackTimeMonths`: "{n} 個月"
- `crackTimeYears`: "{n} 年"
- `crackTimeCenturies`: "數百年"
- `strengthInfoDesc`: "密碼強度由 zxcvbn 開源庫分析，可偵測常見模式並估算破解時間。所有分析皆在瀏覽器中完成。"

`ja`:

- `tabGenerator`: "パスワード生成"
- `tabChecker`: "強度チェッカー"
- `checkThisPassword`: "このパスワードをチェック"
- `enterPassword`: "チェックするパスワードを入力"
- `crackTimeLabel`: "で破解可能"
- `crackTimeInstant`: "瞬時"
- `crackTimeSeconds`: "{n} 秒"
- `crackTimeMinutes`: "{n} 分"
- `crackTimeHours`: "{n} 時間"
- `crackTimeDays`: "{n} 日"
- `crackTimeMonths`: "{n} ヶ月"
- `crackTimeYears`: "{n} 年"
- `crackTimeCenturies": "数世紀"
- `strengthInfoDesc`: "パスワードの強度は、一般的なパターンを検出し解読時間を推定するオープンソースライブラリ zxcvbn によって分析されます。すべての分析はブラウザ内で実行されます。"

`ko`:

- `tabGenerator`: "비밀번호 생성기"
- `tabChecker`: "강도 검사기"
- `checkThisPassword`: "이 비밀번호 검사"
- `enterPassword`: "검사할 비밀번호 입력"
- `crackTimeLabel`: "소요"
- `crackTimeInstant`: "즉시"
- `crackTimeSeconds`: "{n}초"
- `crackTimeMinutes`: "{n}분"
- `crackTimeHours`: "{n}시간"
- `crackTimeDays`: "{n}일"
- `crackTimeMonths`: "{n}개월"
- `crackTimeYears`: "{n}년"
- `crackTimeCenturies`: "수세기"
- `strengthInfoDesc`: "비밀번호 강도는 일반적인 패턴을 감지하고 해독 시간을 추정하는 오픈 소스 라이브러리 zxcvbn으로 분석됩니다. 모든 분석은 브라우저에서 실행됩니다."

`es`:

- `tabGenerator`: "Generador de contraseñas"
- `tabChecker`: "Comprobador de fortaleza"
- `checkThisPassword`: "Comprobar esta contraseña"
- `enterPassword`: "Introduce una contraseña para comprobar"
- `crackTimeLabel`: "para descifrarla"
- `crackTimeInstant`: "Instantáneo"
- `crackTimeSeconds`: "{n} segundos"
- `crackTimeMinutes`: "{n} minutos"
- `crackTimeHours`: "{n} horas"
- `crackTimeDays`: "{n} días"
- `crackTimeMonths`: "{n} meses"
- `crackTimeYears`: "{n} años"
- `crackTimeCenturies`: "Siglos"
- `strengthInfoDesc`: "La fortaleza de la contraseña se analiza con zxcvbn, una biblioteca de código abierto que detecta patrones comunes y estima el tiempo de descifrado. Todo el análisis se ejecuta en tu navegador."

`pt-BR`:

- `tabGenerator`: "Gerador de Senhas"
- `tabChecker`: "Verificador de Força"
- `checkThisPassword`: "Verificar esta senha"
- `enterPassword`: "Digite uma senha para verificar"
- `crackTimeLabel`: "para decifrar"
- `crackTimeInstant`: "Instantâneo"
- `crackTimeSeconds`: "{n} segundos"
- `crackTimeMinutes`: "{n} minutos"
- `crackTimeHours`: "{n} horas"
- `crackTimeDays`: "{n} dias"
- `crackTimeMonths`: "{n} meses"
- `crackTimeYears`: "{n} anos"
- `crackTimeCenturies`: "Séculos"
- `strengthInfoDesc`: "A força da senha é analisada pelo zxcvbn, uma biblioteca de código aberto que detecta padrões comuns e estima o tempo de decifração. Toda a análise é executada no seu navegador."

`fr`:

- `tabGenerator`: "Générateur de mots de passe"
- `tabChecker`: "Vérificateur de robustesse"
- `checkThisPassword`: "Vérifier ce mot de passe"
- `enterPassword`: "Entrez un mot de passe à vérifier"
- `crackTimeLabel`: "pour le craquer"
- `crackTimeInstant`: "Instantané"
- `crackTimeSeconds`: "{n} secondes"
- `crackTimeMinutes`: "{n} minutes"
- `crackTimeHours`: "{n} heures"
- `crackTimeDays`: "{n} jours"
- `crackTimeMonths`: "{n} mois"
- `crackTimeYears`: "{n} ans"
- `crackTimeCenturies`: "Des siècles"
- `strengthInfoDesc`: "La robustesse du mot de passe est analysée par zxcvbn, une bibliothèque open source qui détecte les motifs courants et estime le temps de craquage. Toute l'analyse s'exécute dans votre navigateur."

`de`:

- `tabGenerator`: "Passwort-Generator"
- `tabChecker`: "Stärke-Prüfer"
- `checkThisPassword`: "Dieses Passwort prüfen"
- `enterPassword`: "Passwort zum Prüfen eingeben"
- `crackTimeLabel`: "zum Knacken"
- `crackTimeInstant`: "Sofort"
- `crackTimeSeconds`: "{n} Sekunden"
- `crackTimeMinutes`: "{n} Minuten"
- `crackTimeHours`: "{n} Stunden"
- `crackTimeDays`: "{n} Tage"
- `crackTimeMonths`: "{n} Monate"
- `crackTimeYears`: "{n} Jahre"
- `crackTimeCenturies`: "Jahrhunderte"
- `strengthInfoDesc`: "Die Passwortstärke wird von zxcvbn analysiert, einer Open-Source-Bibliothek, die häufige Muster erkennt und die Knackzeit schätzt. Die gesamte Analyse läuft in Ihrem Browser."

`ru`:

- `tabGenerator`: "Генератор паролей"
- `tabChecker`: "Проверка надёжности"
- `checkThisPassword`: "Проверить этот пароль"
- `enterPassword`: "Введите пароль для проверки"
- `crackTimeLabel`: "на взлом"
- `crackTimeInstant`: "Мгновенно"
- `crackTimeSeconds`: "{n} секунд"
- `crackTimeMinutes`: "{n} минут"
- `crackTimeHours`: "{n} часов"
- `crackTimeDays`: "{n} дней"
- `crackTimeMonths`: "{n} месяцев"
- `crackTimeYears`: "{n} лет"
- `crackTimeCenturies`: "Века"
- `strengthInfoDesc`: "Надёжность пароля анализируется zxcvbn — библиотекой с открытым исходным кодом, которая определяет распространённые шаблоны и оценивает время взлома. Весь анализ выполняется в вашем браузере."

- [ ] **Step 1: Update each locale file**

Update all 9 non-English `password.json` files. For each: remove `strengthGood`, `entropyVerified`, `entropyVerifiedDesc`; add all new keys with locale-specific translations for UI keys and English fallback for zxcvbn keys.

- [ ] **Step 2: Commit**

```bash
git add public/locales/*/password.json
git commit -m "feat(password): add checker i18n keys to all locales"
```

---

### Task 6: Update SEO metadata in `tools.json`

**Files:**

- Modify: `public/locales/en/tools.json`
- Modify: `public/locales/zh-CN/tools.json`
- Modify: `public/locales/zh-TW/tools.json`
- Modify: `public/locales/ja/tools.json`
- Modify: `public/locales/ko/tools.json`

Update the password tool entry in `tools.json` for all locales: update `title` and `description` to reflect the new strength checker feature. Update `searchTerms` for CJK locales to include checker-related keywords.

**English (`en/tools.json`):**

```json
"password": {
  "title": "Secure Password Generator & Strength Checker",
  "shortTitle": "Password Generator",
  "description": "Generate cryptographically secure passwords and check password strength instantly. Free online tool with customizable options and real-time analysis."
}
```

**zh-CN (`zh-CN/tools.json`):**

```json
"password": {
  "title": "密码生成器 & 强度检测 - 安全密码在线工具",
  "shortTitle": "密码生成器",
  "description": "生成加密安全的随机密码，实时检测密码强度。免费在线工具，支持自定义选项和 zxcvbn 强度分析。",
  "searchTerms": "mimashengchengqi mmscq mimaqiangdu mimajiance anquan"
}
```

**zh-TW (`zh-TW/tools.json`):**

```json
"password": {
  "title": "密碼產生器 & 強度檢測 - 安全密碼線上工具",
  "shortTitle": "密碼產生器",
  "description": "產生加密安全的隨機密碼，即時檢測密碼強度。免費線上工具，支援自訂選項和 zxcvbn 強度分析。",
  "searchTerms": "mimachanshengqi mcscq mimaqiangdu mimajiance anquan"
}
```

**ja (`ja/tools.json`):**

```json
"password": {
  "title": "パスワード生成 & 強度チェックツール",
  "shortTitle": "パスワード生成",
  "description": "暗号論的に安全なパスワードを生成し、強度をリアルタイムでチェック。無料のオンラインツール。zxcvbnによる強度分析。",
  "searchTerms": "pasuwaadoseisei pws tsuyosa kensa anzen"
}
```

**ko (`ko/tools.json`):**

```json
"password": {
  "title": "비밀번호 생성기 & 강도 검사 도구",
  "shortTitle": "비밀번호 생성기",
  "description": "암호학적으로 안전한 비밀번호를 생성하고 강도를 실시간으로 검사합니다. 무료 온라인 도구, zxcvbn 강도 분석.",
  "searchTerms": "bimilbeonhosaengseonggi bbhs gangdo jeomgeom anjeon"
}
```

Latin-script locales (es, pt-BR, fr, de, ru): update `title` and `description` only (no `searchTerms` needed).

- [ ] **Step 1: Update each `tools.json`**

Apply the changes above to all locale `tools.json` files.

- [ ] **Step 2: Commit**

```bash
git add public/locales/*/tools.json
git commit -m "feat(password): update SEO metadata for strength checker"
```

---

### Task 7: Refactor `password-page.tsx` — add NeonTabs, Checker component, async strength

**Files:**

- Modify: `app/[locale]/password/password-page.tsx`

This is the largest task. The changes are:

1. **Remove `getPasswordLevelStyle()` function** (lines 54-88) and the `calculateEntropy` import
2. **Add imports:** `NeonTabs`, `analyzeStrength`, `StrengthResult`, `ShieldCheck` from Lucide
3. **Add `StrengthBar` component** — shared async strength display used by Generator, Checker, and SavedPasswords
4. **Add `Checker` component** — the new strength checker tab
5. **Modify `PasswordPage`** — add `activeTab`/`checkerInput` state, NeonTabs, replace info cards
6. **Modify `Generator`** — accept `onCheckPassword` callback, replace synchronous `levelStyle` with async strength
7. **Modify `SavedPasswords`** — replace synchronous `getPasswordLevelStyle` call with async strength per card

**Detailed changes:**

- [ ] **Step 1: Update imports**

Remove `calculateEntropy` from imports. Add:

```typescript
import { NeonTabs } from "../../../components/ui/tabs";
import { analyzeStrength } from "../../../libs/password/strength";
import type { StrengthResult, CrackTimeUnit } from "../../../libs/password/strength";
import {
  Clipboard,
  RefreshCw,
  Trash2,
  BookmarkPlus,
  Eye,
  EyeOff,
  Lock,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
```

Remove `BarChart3` from Lucide imports (no longer used after removing entropy card).

- [ ] **Step 2: Add strength bar color/label helper**

Replace `getPasswordLevelStyle()` with a simple score-based lookup:

```typescript
function getScoreStyle(score: 0 | 1 | 2 | 3 | 4) {
  const styles = [
    { width: "20%", color: "var(--color-danger)", label: "strengthVeryWeak" },
    { width: "40%", color: "var(--color-danger)", label: "strengthWeak" },
    { width: "60%", color: "orange", label: "strengthFair" },
    { width: "80%", color: "var(--color-accent-cyan)", label: "strengthStrong" },
    { width: "100%", color: "var(--color-accent-cyan)", label: "strengthVeryStrong" },
  ];
  return styles[score];
}
```

- [ ] **Step 3: Add `StrengthBar` component**

A reusable component that calls `analyzeStrength` and renders the bar + label:

```typescript
function StrengthBar({ password }: { password: string }) {
  const t = useTranslations("password");
  const [result, setResult] = useState<StrengthResult | null>(null);

  useEffect(() => {
    if (!password) {
      setResult(null);
      return;
    }
    analyzeStrength(password).then(setResult);
  }, [password]);

  if (!result) {
    return <div className="h-2 w-full bg-bg-elevated overflow-hidden rounded-full" />;
  }

  const style = getScoreStyle(result.score);

  return (
    <>
      <div className="h-2 w-full bg-bg-elevated overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: style.width, backgroundColor: style.color }}
        />
      </div>
      <div className="flex justify-between items-center mt-2.5 px-3 pb-1">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: style.color }}
          />
          <span className="text-sm font-semibold" style={{ color: style.color }}>
            {t(style.label)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-fg-muted">
            {result.score} / 4
          </span>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Add `CrackTimeDisplay` helper component**

```typescript
function CrackTimeDisplay({ result }: { result: StrengthResult }) {
  const t = useTranslations("password");

  let timeText: string;
  if (result.crackTimeUnit === "instant") {
    timeText = t("crackTimeInstant");
  } else {
    const unitKey = `crackTime${result.crackTimeUnit.charAt(0).toUpperCase()}${result.crackTimeUnit.slice(1)}` as string;
    timeText = t(unitKey, { n: result.crackTimeValue });
  }

  return (
    <div className="mt-3 px-3">
      <span className="text-xl font-bold" style={{ color: getScoreStyle(result.score).color }}>
        {timeText}
      </span>
      <span className="text-sm text-fg-muted ml-2">{t("crackTimeLabel")}</span>
    </div>
  );
}
```

- [ ] **Step 5: Add `Checker` component**

```typescript
function Checker({ initialInput }: { initialInput: string }) {
  const t = useTranslations("password");
  const [input, setInput] = useState(initialInput);
  const [visible, setVisible] = useState(false);
  const [result, setResult] = useState<StrengthResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInput(initialInput);
  }, [initialInput]);

  useEffect(() => {
    if (!input) {
      setResult(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      analyzeStrength(input).then(setResult);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input]);

  const style = result ? getScoreStyle(result.score) : null;

  return (
    <section>
      <div className="flex items-start gap-2 border-l-2 border-accent-cyan bg-accent-cyan-dim/30 rounded-r-lg p-3 my-4">
        <Lock size={18} className="text-accent-cyan mt-0.5 shrink-0" />
        <span className="text-sm text-fg-secondary leading-relaxed">{t("localGenerated")}</span>
      </div>

      <div className="relative mt-2">
        <div className="flex items-center relative py-3 px-4">
          <input
            type={visible ? "text" : "password"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("enterPassword")}
            className="w-full text-xl font-mono bg-transparent outline-none text-fg-primary placeholder:text-fg-muted pr-20"
            autoFocus
          />
          <div className="flex items-center gap-1">
            {input && (
              <button
                type="button"
                className="text-fg-muted hover:text-danger transition-colors cursor-pointer p-1"
                onClick={() => { setInput(""); setResult(null); }}
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              type="button"
              className="text-fg-muted hover:text-accent-cyan transition-colors cursor-pointer p-1"
              onClick={() => setVisible(!visible)}
            >
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {result && style && (
          <>
            <div className="h-2 w-full bg-bg-elevated overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: style.width, backgroundColor: style.color }}
              />
            </div>
            <div className="flex justify-between items-center mt-2.5 px-3 pb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: style.color }} />
                <span className="text-sm font-semibold" style={{ color: style.color }}>
                  {t(style.label)}
                </span>
              </div>
              <span className="text-sm text-fg-muted">{result.score} / 4</span>
            </div>
            <CrackTimeDisplay result={result} />

            {result.warningKey && (
              <div className="mt-4 mx-3 flex items-start gap-2 border-l-2 border-danger bg-danger/10 rounded-r-lg p-3">
                <span className="text-sm text-danger leading-relaxed">
                  {t.has(result.warningKey) ? t(result.warningKey) : result.warningKey}
                </span>
              </div>
            )}

            {result.suggestionKeys.length > 0 && (
              <ul className="mt-3 mx-3 space-y-1">
                {result.suggestionKeys.map((key, i) => (
                  <li key={i} className="text-sm text-fg-muted flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-fg-muted shrink-0" />
                    <span>{t.has(key) ? t(key) : key}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {!result && input && (
          <div className="h-2 w-full bg-bg-elevated overflow-hidden rounded-full" />
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Modify `Generator` component**

Add `onCheckPassword` prop:

```typescript
function Generator({
  saved,
  setSaved,
  onCheckPassword,
}: {
  saved: SavedRecord[];
  setSaved: React.Dispatch<React.SetStateAction<SavedRecord[]>>;
  onCheckPassword: (password: string) => void;
}) {
```

Remove the `levelStyle` computation (lines 285-288). Replace the strength bar and entropy display section in the JSX.

In the generated password display area, replace lines 420-443 (the `h-2` bar + strength label + bits display) with:

```tsx
<StrengthBar password={password.length > 0 ? copyPassword(passwordType, password) : ""} />
```

In the action buttons area (after Bookmark button, before `</div>` of the button grid), add the "Check this password" button inside the grid. Change the grid from `grid-cols-2` to `grid-cols-3` and add:

```tsx
<Button
  variant="outline-cyan"
  size="lg"
  onClick={() => onCheckPassword(copyPassword(passwordType, password))}
  className="w-full rounded-full font-bold"
>
  <ShieldCheck size={16} />
  {t("checkThisPassword")}
</Button>
```

- [ ] **Step 7: Modify `SavedPasswords` component**

Replace the `getPasswordLevelStyle` call (line 205-208) with per-card async strength. Add a small inline component or use `StrengthBar` directly.

In each card's render, replace lines 247-252 (the `h-1` bar) with:

```tsx
<SavedCardStrengthBar password={copyPassword(record.type, record.password)} />
```

Add the `SavedCardStrengthBar` component (simple wrapper):

```typescript
function SavedCardStrengthBar({ password }: { password: string }) {
  const [result, setResult] = useState<StrengthResult | null>(null);

  useEffect(() => {
    if (!password) return;
    analyzeStrength(password).then(setResult);
  }, [password]);

  if (!result) {
    return <div className="h-1 bg-bg-elevated" />;
  }

  const style = getScoreStyle(result.score);
  return (
    <div className="h-1 bg-bg-elevated">
      <div
        className="h-full transition-all"
        style={{ width: style.width, backgroundColor: style.color }}
      />
    </div>
  );
}
```

- [ ] **Step 8: Modify `PasswordPage` component**

Add state for tabs and checker input:

```typescript
export default function PasswordPage() {
  const t = useTranslations("password");
  const tTools = useTranslations("tools");
  const title = tTools("password.shortTitle");

  const [activeTab, setActiveTab] = useState<"generator" | "checker">("generator");
  const [checkerInput, setCheckerInput] = useState("");

  const rawSaved = useSyncExternalStore(subscribeToSavedPasswords, getSnapshot, getServerSnapshot);
  const saved = parseSavedPasswords(rawSaved);

  const setSaved = (updater: SavedRecord[] | ((prev: SavedRecord[]) => SavedRecord[])) => {
    const current = parseSavedPasswords(localStorage.getItem(SAVED_PASSWORDS_KEY) ?? "[]");
    const next = typeof updater === "function" ? updater(current) : updater;
    localStorage.setItem(SAVED_PASSWORDS_KEY, JSON.stringify(next));
    window.dispatchEvent(new StorageEvent("storage", { key: SAVED_PASSWORDS_KEY }));
  };

  return (
    <Layout title={title}>
      <div className="container mx-auto px-4 pt-3 pb-6">
        <NeonTabs
          tabs={[
            {
              label: t("tabGenerator"),
              content: (
                <Generator
                  saved={saved}
                  setSaved={setSaved}
                  onCheckPassword={(pw) => {
                    setCheckerInput(pw);
                    setActiveTab("checker");
                  }}
                />
              ),
            },
            {
              label: t("tabChecker"),
              content: <Checker initialInput={checkerInput} />,
            },
          ]}
        />
        <div className="mt-8 flex flex-col gap-3">
          <div className="flex items-start gap-2 border-l-2 border-accent-cyan bg-accent-cyan-dim/30 rounded-r-lg p-3">
            <KeyRound size={18} className="text-accent-cyan mt-0.5 shrink-0" />
            <span className="text-sm text-fg-secondary leading-relaxed">{t("securityTip")}</span>
          </div>
          <div className="flex items-start gap-2 border-l-2 border-accent-purple bg-accent-purple-dim/30 rounded-r-lg p-3">
            <ShieldCheck size={16} className="text-accent-purple mt-0.5 shrink-0" />
            <span className="text-sm text-fg-secondary leading-relaxed">
              {t("strengthInfoDesc")}
            </span>
          </div>
        </div>
        <SavedPasswords
          list={saved}
          delCallback={(index) => {
            const temp = saved.slice(0, index);
            temp.push(...saved.slice(index + 1));
            setSaved(temp);
          }}
          clearAll={() => {
            setSaved([]);
          }}
        />
      </div>
    </Layout>
  );
}
```

Note: `BarChart3` replaced by `ShieldCheck` icon for the info card. `entropyVerifiedDesc` replaced by `strengthInfoDesc`.

- [ ] **Step 9: Verify the page compiles**

```bash
npx next build --no-lint
```

Expected: build succeeds (may have lint warnings, addressed in next step).

- [ ] **Step 10: Run linter**

```bash
npx eslint app/[locale]/password/password-page.tsx --fix
```

Expected: no errors. Fix any issues.

- [ ] **Step 11: Commit**

```bash
git add app/[locale]/password/password-page.tsx
git commit -m "feat(password): add strength checker tab with NeonTabs and async zxcvbn analysis"
```

---

### Task 8: Remove `calculateEntropy` from `libs/password/main.ts`

**Files:**

- Modify: `libs/password/main.ts`

Remove the `calculateEntropy` export and its helper `getPoolSize` since they are no longer used by any code.

- [ ] **Step 1: Remove `calculateEntropy` and `getPoolSize`**

Delete the `getPoolSize` function (lines 24-34) and the `calculateEntropy` function (lines 36-49).

Also remove `calculateEntropy` from the import in `password-page.tsx` if not already done in Task 7.

- [ ] **Step 2: Verify nothing imports `calculateEntropy`**

```bash
npx grep-r "calculateEntropy" --include="*.ts" --include="*.tsx" .
```

Expected: no matches (already removed from `password-page.tsx` import in Task 7).

- [ ] **Step 3: Commit**

```bash
git add libs/password/main.ts
git commit -m "refactor(password): remove unused calculateEntropy function"
```

---

### Task 9: Add tests

**Files:**

- Create: `libs/password/__tests__/strength.test.ts`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Create test file `libs/password/__tests__/strength.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import { analyzeStrength } from "../strength";

describe("analyzeStrength", () => {
  it('gives score 0 for "password"', async () => {
    const result = await analyzeStrength("password");
    expect(result.score).toBe(0);
    expect(result.warningKey).not.toBeNull();
  });

  it('gives score 0 for "123456"', async () => {
    const result = await analyzeStrength("123456");
    expect(result.score).toBe(0);
  });

  it("gives score 4 for a strong passphrase", async () => {
    const result = await analyzeStrength("correcthorsebatterystaple");
    expect(result.score).toBe(4);
  });

  it("gives score 4 for a long random-looking password", async () => {
    const result = await analyzeStrength("Kx!9mPq$2vRzNw7&jL4c");
    expect(result.score).toBe(4);
  });

  it("returns crack time in seconds", async () => {
    const result = await analyzeStrength("password");
    expect(result.crackTimeSeconds).toBeGreaterThan(0);
    expect(typeof result.crackTimeUnit).toBe("string");
  });

  it("returns instant crack time for very weak passwords", async () => {
    const result = await analyzeStrength("a");
    expect(result.crackTimeUnit).toBe("instant");
  });

  it("returns centuries for strong passwords", async () => {
    const result = await analyzeStrength("correcthorsebatterystaple");
    expect(result.crackTimeUnit).toBe("centuries");
  });

  it("maps warning keys", async () => {
    const result = await analyzeStrength("password");
    expect(result.warningKey).toMatch(/^zxcvbnWarning/);
  });

  it("maps suggestion keys", async () => {
    const result = await analyzeStrength("abc");
    expect(result.suggestionKeys.length).toBeGreaterThan(0);
    result.suggestionKeys.forEach((key) => {
      expect(key).toMatch(/^zxcvbnSuggestion/);
    });
  });

  it("returns null warning for strong passwords", async () => {
    const result = await analyzeStrength("Kx!9mPq$2vRzNw7&jL4c");
    expect(result.warningKey).toBeNull();
  });

  it("returns empty suggestions for strong passwords", async () => {
    const result = await analyzeStrength("Kx!9mPq$2vRzNw7&jL4c");
    expect(result.suggestionKeys).toEqual([]);
  });

  it("caches the zxcvbn instance (second call works)", async () => {
    const r1 = await analyzeStrength("test");
    const r2 = await analyzeStrength("test");
    expect(r1.score).toBe(r2.score);
  });
});
```

- [ ] **Step 2: Add test scope to `vitest.config.ts`**

Add `"libs/password/**/*.test.ts"` to the `include` array in `vitest.config.ts`:

```typescript
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
  "libs/password/**/*.test.ts",
  "libs/__tests__/*.test.ts",
  "hooks/**/*.test.ts",
],
```

- [ ] **Step 3: Run tests**

```bash
npm run test -- --run libs/password
```

Expected: all 11 tests pass.

- [ ] **Step 4: Commit**

```bash
git add libs/password/__tests__/strength.test.ts vitest.config.ts
git commit -m "test(password): add zxcvbn strength analysis tests"
```

---

### Task 10: Manual verification & final checks

**Files:** None (verification only)

- [ ] **Step 1: Run full lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 2: Run full test suite**

```bash
npm run test -- --run
```

Expected: all tests pass (existing + new password tests).

- [ ] **Step 3: Run dev server and manually verify**

```bash
npm run dev
```

Manually check:

1. `/password` loads with Generator tab active
2. Strength bar shows colored bar + score "X / 4" under generated password
3. Click "Check this password" → switches to Checker tab with password pre-filled
4. Checker shows debounced analysis with strength bar, crack time, warning, suggestions
5. Type a weak password ("password") → score 0, warning shown
6. Type a strong password → score 4, centuries crack time
7. Saved Passwords section shows colored strength bars (may be briefly empty while loading)
8. Info cards show security tip + zxcvbn info (no Shannon entropy reference)
9. Switch locale (e.g., zh-CN) → tab labels and checker UI are translated
10. All existing functionality still works (generate, copy, bookmark, save, delete)

- [ ] **Step 4: Final commit if any fixes needed**

If any issues found during manual verification, fix and commit.
