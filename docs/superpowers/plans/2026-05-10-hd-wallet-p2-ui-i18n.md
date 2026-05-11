# HD Wallet — Plan 2: UI Page, Tool Registration & i18n

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Register the wallet tool, build the full page UI at `/wallet`, and add i18n for all 10 locales. After this plan, `/wallet` is a fully functional, translated tool.

**Architecture:** Single `wallet-page.tsx` with internal sections (MnemonicInput, PathEditor, ChainSelector, DerivationResults, Description). Uses existing UI primitives (Layout, NeonTabs, Accordion, Button, StyledInput, StyledTextarea, CopyButton, PrivacyBanner, RelatedTools). State management is plain `useState` with React Compiler auto-memoization.

**Tech Stack:** Next.js App Router, React, next-intl, Tailwind CSS 4, Vitest (tool-relations test)

---

## File Structure

| Action | File                                             | Responsibility                                       |
| ------ | ------------------------------------------------ | ---------------------------------------------------- |
| Modify | `libs/tools.ts`                                  | Add wallet to TOOLS, TOOL_CATEGORIES, TOOL_RELATIONS |
| Modify | `libs/storage-keys.ts`                           | Add `walletSelectedChains` key                       |
| Modify | `i18n/request.ts`                                | Add `"wallet"` to namespaces                         |
| Create | `public/locales/en/wallet.json`                  | English i18n strings                                 |
| Modify | `public/locales/en/tools.json`                   | Add wallet title/description                         |
| Create | `app/[locale]/wallet/page.tsx`                   | Route entry with SEO/JSON-LD                         |
| Create | `app/[locale]/wallet/wallet-page.tsx`            | Full page component                                  |
| Create | `public/locales/{zh-CN,zh-TW,ja,ko}/wallet.json` | CJK translations                                     |
| Modify | `public/locales/{zh-CN,zh-TW,ja,ko}/tools.json`  | CJK wallet entries with searchTerms                  |
| Create | `public/locales/{es,pt-BR,fr,de,ru}/wallet.json` | Latin translations                                   |
| Modify | `public/locales/{es,pt-BR,fr,de,ru}/tools.json`  | Latin wallet entries                                 |

---

### Task 1: Tool Registration

**Files:**

- Modify: `libs/tools.ts`
- Modify: `libs/storage-keys.ts`

- [ ] **Step 1: Add wallet to TOOLS array in `libs/tools.ts`**

Add `Wallet` to the lucide-react import block (line ~30):

```ts
  Send,
  Wallet,
} from "lucide-react";
```

Add entry to `TOOLS` array (after the `tokencounter` entry, before `] as const;`):

```ts
  { key: "wallet", path: "/wallet", icon: Wallet },
```

- [ ] **Step 2: Add wallet to security category in TOOL_CATEGORIES**

In `libs/tools.ts`, change the security tools array from:

```ts
  { key: "security", tools: ["jwt", "hashing", "password", "sshkey", "cipher", "checksum"] },
```

to:

```ts
  { key: "security", tools: ["jwt", "hashing", "password", "sshkey", "wallet", "cipher", "checksum"] },
```

- [ ] **Step 3: Add wallet to TOOL_RELATIONS**

In `libs/tools.ts`, add after the `sshkey` line:

```ts
  wallet: ["sshkey", "password", "hashing", "jwt"],
```

Also update `sshkey` relations to include wallet:

```ts
  sshkey: ["password", "hashing", "jwt", "wallet"],
```

- [ ] **Step 4: Add storage key in `libs/storage-keys.ts`**

Add to the `STORAGE_KEYS` object (after `httpclientHistory`):

```ts
  walletSelectedChains: "okrun:wallet:chains",
```

- [ ] **Step 5: Verify tool-relations test passes**

Run:

```bash
npx vitest run libs/__tests__/tool-relations.test.ts
```

Expected: All tests PASS (wallet has 2–5 relations, bidirectional, no self-reference).

- [ ] **Step 6: Commit**

```bash
git add libs/tools.ts libs/storage-keys.ts
git commit -m "feat(wallet): register wallet tool in tools registry and storage keys"
```

---

### Task 2: i18n Namespace Registration

**Files:**

- Modify: `i18n/request.ts`

- [ ] **Step 1: Add wallet namespace**

In `i18n/request.ts`, add `"wallet"` after `"token-counter"` in the namespaces array:

```ts
  "token-counter",
  "wallet",
];
```

- [ ] **Step 2: Commit**

```bash
git add i18n/request.ts
git commit -m "feat(wallet): add wallet namespace to i18n config"
```

---

### Task 3: English i18n Files

**Files:**

- Create: `public/locales/en/wallet.json`
- Modify: `public/locales/en/tools.json`

- [ ] **Step 1: Create `public/locales/en/wallet.json`**

```json
{
  "mnemonicLabel": "Mnemonic Phrase",
  "mnemonicPlaceholder": "Enter your BIP39 mnemonic phrase (12/15/18/21/24 words)",
  "generate": "Generate",
  "wordCount12": "12 words",
  "wordCount24": "24 words",
  "passphraseToggle": "Passphrase (BIP39)",
  "passphrasePlaceholder": "Optional passphrase (25th word)",
  "validation": {
    "invalidLength": "Invalid mnemonic length (must be 12, 15, 18, 21, or 24 words)",
    "invalidWords": "Unknown word(s) at position(s): {positions}",
    "invalidChecksum": "Invalid checksum"
  },
  "pathEditor": {
    "label": "Derivation Path",
    "purpose": "Purpose",
    "coinType": "Coin Type",
    "account": "Account",
    "change": "Change",
    "addressCount": "Address Count",
    "allHardenedWarning": "ed25519 chains require all path segments to be hardened"
  },
  "chainSelection": {
    "label": "Select Chains",
    "groupSecp256k1": "secp256k1",
    "groupEd25519": "ed25519"
  },
  "results": {
    "index": "#",
    "address": "Address",
    "publicKey": "Public Key",
    "privateKey": "Private Key",
    "show": "Show",
    "hide": "Hide",
    "copy": "Copy",
    "pathUsed": "Path used",
    "expand": "Expand",
    "collapse": "Collapse",
    "noMnemonic": "Enter or generate a mnemonic to derive addresses"
  },
  "descriptions": {
    "aeoDefinition": "HD Wallet Generator is a free online tool for generating BIP39 mnemonic phrases and deriving cryptocurrency addresses across multiple blockchains. Supports EVM, Bitcoin, Solana, Tron, and Cosmos chains. All computation runs entirely in your browser — no data is sent to any server.",
    "whatIsTitle": "What is an HD Wallet?",
    "whatIs": "An HD (Hierarchical Deterministic) Wallet generates all private keys from a single master seed using a tree structure. This means you only need to back up one mnemonic phrase to recover all addresses across all derived paths.",
    "bip39Title": "BIP39 Mnemonic",
    "bip39": "BIP39 defines how to represent a random seed as a list of human-readable words (12 or 24 words). The mnemonic phrase is the backup of your wallet — store it securely and never share it.",
    "bip32Title": "BIP32 HD Key Derivation",
    "bip32": "BIP32 specifies how to derive a tree of keypairs from a master seed. Each node in the tree is addressed by a derivation path like m/44'/60'/0'/0/0.",
    "bip44Title": "BIP44 Multi-Account",
    "bip44": "BIP44 defines a standard path structure: m / purpose' / coin_type' / account' / change / address_index. Each blockchain has a registered coin_type (e.g. 60 for Ethereum, 0 for Bitcoin).",
    "securityTitle": "Security Notice",
    "security": "This tool is for educational and development purposes only. Never use a mnemonic generated in a browser-based tool for real funds. Use a hardware wallet for production use.",
    "faq1Q": "What is a BIP39 passphrase?",
    "faq1A": "Also called the '25th word', a BIP39 passphrase is an optional additional word that adds extra security to your mnemonic. The same mnemonic with different passphrases produces completely different wallets. If you use a passphrase, you must remember it to recover your wallet.",
    "faq2Q": "Why do Solana paths require all hardened segments?",
    "faq2A": "Solana uses the ed25519 curve via SLIP-0010, which only supports hardened derivation. Non-hardened derivation is not possible with ed25519 keys, so all path segments must include the ' (hardened) suffix.",
    "faq3Q": "What is the difference between Legacy, SegWit, and Taproot Bitcoin addresses?",
    "faq3A": "Legacy (P2PKH, starts with 1) is the original format. SegWit (P2WPKH, starts with bc1q) uses Bech32 encoding for lower fees. Taproot (P2TR, starts with bc1p) is the newest format with enhanced privacy and smart contract capabilities."
  }
}
```

- [ ] **Step 2: Add wallet entry to `public/locales/en/tools.json`**

Add after the last tool entry:

```json
  "wallet": {
    "title": "HD Wallet Generator - BIP39 Mnemonic & Multi-Chain Address Derivation",
    "shortTitle": "HD Wallet",
    "description": "Generate BIP39 mnemonic phrases and derive cryptocurrency addresses for EVM, Bitcoin, Solana, Tron, and Cosmos chains. Free online HD wallet tool — 100% client-side."
  }
```

- [ ] **Step 3: Commit**

```bash
git add public/locales/en/wallet.json public/locales/en/tools.json
git commit -m "feat(wallet): add English i18n strings for wallet tool"
```

---

### Task 4: Route Entry — page.tsx

**Files:**

- Create: `app/[locale]/wallet/page.tsx`

- [ ] **Step 1: Create `app/[locale]/wallet/page.tsx`**

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import WalletPage from "./wallet-page";

const PATH = "/wallet";
const TOOL_KEY = "wallet";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("wallet.title"),
    description: t("wallet.description"),
  });
}

export default async function WalletRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "wallet" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const schemas = buildToolSchemas({
    name: t("wallet.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("wallet.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems: [1, 2, 3].map((i) => ({
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
      <WalletPage />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/wallet/page.tsx
git commit -m "feat(wallet): add wallet route entry with SEO and JSON-LD"
```

---

### Task 5: Page Component — Full Implementation

**Files:**

- Create: `app/[locale]/wallet/wallet-page.tsx`

This is the largest task. The file contains all UI sections: MnemonicInput, PathEditor, ChainSelector, DerivationResults, and Description.

- [ ] **Step 1: Create `app/[locale]/wallet/wallet-page.tsx`**

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Layout from "../../../components/layout";
import { useTranslations } from "next-intl";
import { NeonTabs } from "../../../components/ui/tabs";
import { Accordion } from "../../../components/ui/accordion";
import { Button } from "../../../components/ui/button";
import { StyledInput, StyledTextarea } from "../../../components/ui/input";
import { CopyButton } from "../../../components/ui/copy-btn";
import PrivacyBanner from "../../../components/privacy-banner";
import RelatedTools from "../../../components/related-tools";
import {
  generateMnemonic,
  validateMnemonicPhrase,
  mnemonicToSeed,
  parsePath,
  validatePathForCurve,
  buildDerivationPath,
  deriveAccounts,
  CHAINS,
  DEFAULT_SELECTED_CHAINS,
} from "../../../libs/wallet/main";
import { STORAGE_KEYS } from "../../../libs/storage-keys";
import type {
  DerivedAccount,
  ChainConfig,
  MnemonicValidationResult,
} from "../../../libs/wallet/types";
import { RefreshCw, ChevronDown, ChevronRight, Eye, EyeOff, ChevronUp } from "lucide-react";

const PRIVATE_KEY_REVEAL_MS = 5000;

export default function WalletPage() {
  const t = useTranslations("wallet");
  const tc = useTranslations("common");
  const ts = useTranslations("tools");

  // --- Mnemonic state ---
  const [mnemonic, setMnemonic] = useState("");
  const [wordCount, setWordCount] = useState<128 | 256>(128);
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [validation, setValidation] = useState<MnemonicValidationResult>({
    valid: false,
  });

  // --- Path state ---
  const [purpose, setPurpose] = useState(44);
  const [account, setAccount] = useState(0);
  const [change, setChange] = useState(0);
  const [addressCount, setAddressCount] = useState(5);

  // --- Chain state ---
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [activeChain, setActiveChain] = useState(0);

  // --- Results state ---
  const [derivedResults, setDerivedResults] = useState<Record<string, DerivedAccount[]>>({});
  const [expandedRows, setExpandedRows] = useState<Record<string, number | null>>({});
  const [revealedKeys, setRevealedKeys] = useState<Record<string, Set<number>>>({});
  const revealTimers = useRef<Record<string, Record<number, ReturnType<typeof setTimeout>>>>({});

  // --- Load persisted chain selection ---
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.walletSelectedChains);
      const saved = raw ? JSON.parse(raw) : null;
      setSelectedChains(saved && saved.length > 0 ? saved : DEFAULT_SELECTED_CHAINS);
    } catch {
      setSelectedChains(DEFAULT_SELECTED_CHAINS);
    }
  }, []);

  // --- Validate mnemonic on change ---
  useEffect(() => {
    if (!mnemonic.trim()) {
      setValidation({ valid: false });
      return;
    }
    const result = validateMnemonicPhrase(mnemonic);
    setValidation(result);
  }, [mnemonic]);

  // --- Derive addresses when inputs change ---
  useEffect(() => {
    if (!validation.valid || selectedChains.length === 0) {
      setDerivedResults({});
      return;
    }
    const seed = mnemonicToSeed(mnemonic, passphrase || undefined);
    const results: Record<string, DerivedAccount[]> = {};
    for (const chainKey of selectedChains) {
      const chain = CHAINS.find((c) => c.key === chainKey);
      if (!chain) continue;
      try {
        results[chainKey] = deriveAccounts(seed, chain, purpose, account, change, addressCount);
      } catch {
        results[chainKey] = [];
      }
    }
    setDerivedResults(results);
  }, [
    validation.valid,
    mnemonic,
    passphrase,
    selectedChains,
    purpose,
    account,
    change,
    addressCount,
  ]);

  // --- Chain toggle ---
  function toggleChain(chainKey: string) {
    setSelectedChains((prev) => {
      const next = prev.includes(chainKey)
        ? prev.filter((k) => k !== chainKey)
        : [...prev, chainKey];
      localStorage.setItem(STORAGE_KEYS.walletSelectedChains, JSON.stringify(next));
      return next;
    });
    setActiveChain(0);
  }

  // --- Update purpose when active chain changes ---
  function getActiveChainConfig(): ChainConfig | undefined {
    return CHAINS.find((c) => c.key === selectedChains[activeChain]);
  }

  // --- Generate mnemonic ---
  function handleGenerate() {
    const mn = generateMnemonic(wordCount);
    setMnemonic(mn);
  }

  // --- Private key reveal with auto-hide ---
  function toggleReveal(chainKey: string, index: number) {
    setRevealedKeys((prev) => {
      const current = prev[chainKey] ?? new Set<number>();
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
        if (revealTimers.current[chainKey]?.[index]) {
          clearTimeout(revealTimers.current[chainKey][index]);
        }
      } else {
        next.add(index);
        if (!revealTimers.current[chainKey]) revealTimers.current[chainKey] = {};
        revealTimers.current[chainKey][index] = setTimeout(() => {
          setRevealedKeys((p) => {
            const s = new Set(p[chainKey] ?? []);
            s.delete(index);
            return { ...p, [chainKey]: s };
          });
        }, PRIVATE_KEY_REVEAL_MS);
      }
      return { ...prev, [chainKey]: next };
    });
  }

  // --- Validation display ---
  function renderValidationStatus() {
    if (!mnemonic.trim()) return null;
    if (validation.valid) {
      return <p className="text-sm text-accent-cyan mt-1">✓ Valid mnemonic</p>;
    }
    if (validation.error === "invalid_length") {
      return <p className="text-sm text-danger mt-1">{t("validation.invalidLength")}</p>;
    }
    if (validation.error === "invalid_words" && validation.invalidWords) {
      return (
        <p className="text-sm text-danger mt-1">
          {t("validation.invalidWords", {
            positions: validation.invalidWords.map((i) => i + 1).join(", "),
          })}
        </p>
      );
    }
    if (validation.error === "invalid_checksum") {
      return <p className="text-sm text-danger mt-1">{t("validation.invalidChecksum")}</p>;
    }
    return null;
  }

  // --- Path validation for active chain ---
  const activeChainConfig = getActiveChainConfig();
  const pathSegments = parsePath(
    buildDerivationPath(
      purpose,
      activeChainConfig?.coinType ?? 60,
      account,
      change,
      0,
      activeChainConfig?.curve ?? "secp256k1"
    )
  );
  const pathError = activeChainConfig
    ? validatePathForCurve(pathSegments, activeChainConfig.curve)
    : null;

  // --- Group chains by curve ---
  const secpChains = CHAINS.filter((c) => c.curve === "secp256k1");
  const edChains = CHAINS.filter((c) => c.curve === "ed25519");

  return (
    <Layout title={ts("wallet.shortTitle")}>
      <PrivacyBanner />

      {/* ====== Mnemonic Input ====== */}
      <section className="mt-4 space-y-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-fg-primary">{t("mnemonicLabel")}</label>
          <div className="flex items-center gap-2 ml-auto">
            <select
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value) as 128 | 256)}
              className="bg-bg-input text-fg-primary text-sm rounded-md border border-border-default px-2 py-1"
            >
              <option value={128}>{t("wordCount12")}</option>
              <option value={256}>{t("wordCount24")}</option>
            </select>
            <Button variant="outline-cyan" size="sm" onClick={handleGenerate}>
              <RefreshCw size={14} />
              {t("generate")}
            </Button>
          </div>
        </div>
        <StyledTextarea
          value={mnemonic}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMnemonic(e.target.value)}
          placeholder={t("mnemonicPlaceholder")}
          rows={3}
        />
        {renderValidationStatus()}

        {/* Passphrase */}
        <div>
          <button
            type="button"
            onClick={() => setShowPassphrase((v) => !v)}
            className="text-sm text-fg-muted hover:text-fg-secondary flex items-center gap-1"
          >
            {showPassphrase ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {t("passphraseToggle")}
          </button>
          {showPassphrase && (
            <StyledInput
              type="password"
              value={passphrase}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassphrase(e.target.value)}
              placeholder={t("passphrasePlaceholder")}
              className="mt-2"
            />
          )}
        </div>
      </section>

      {/* ====== Path Editor ====== */}
      <section className="mt-6 space-y-2">
        <label className="text-sm font-medium text-fg-primary">{t("pathEditor.label")}</label>
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-fg-muted text-sm font-mono">m</span>
          <span className="text-fg-muted">/</span>
          <PathField value={purpose} hardened onChange={setPurpose} />
          <span className="text-fg-muted">/</span>
          <PathField
            value={activeChainConfig?.coinType ?? 60}
            hardened
            onChange={() => {}}
            disabled
          />
          <span className="text-fg-muted">/</span>
          <PathField value={account} hardened onChange={setAccount} />
          <span className="text-fg-muted">/</span>
          <PathField
            value={change}
            hardened={activeChainConfig?.curve === "ed25519"}
            onChange={setChange}
          />
          <span className="text-fg-muted">/</span>
          <span className="text-fg-muted text-sm font-mono">{"{index}"}</span>
        </div>
        {pathError && <p className="text-sm text-danger">{pathError}</p>}
        {activeChainConfig?.curve === "ed25519" && !pathError && (
          <p className="text-sm text-fg-muted">{t("pathEditor.allHardenedWarning")}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <label className="text-sm text-fg-secondary">{t("pathEditor.addressCount")}</label>
          <input
            type="number"
            min={1}
            max={20}
            value={addressCount}
            onChange={(e) => setAddressCount(Math.max(1, Math.min(20, Number(e.target.value))))}
            className="w-16 bg-bg-input text-fg-primary text-sm rounded-md border border-border-default px-2 py-1 text-center"
          />
        </div>
      </section>

      {/* ====== Chain Selection ====== */}
      <section className="mt-6 space-y-3">
        <label className="text-sm font-medium text-fg-primary">{t("chainSelection.label")}</label>

        {/* secp256k1 group */}
        <div>
          <p className="text-xs text-fg-muted mb-1">{t("chainSelection.groupSecp256k1")}</p>
          <div className="flex flex-wrap gap-3">
            {secpChains.map((chain) => (
              <label
                key={chain.key}
                className="flex items-center gap-1.5 text-sm text-fg-secondary cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedChains.includes(chain.key)}
                  onChange={() => toggleChain(chain.key)}
                  className="accent-accent-cyan"
                />
                {chain.name}
              </label>
            ))}
          </div>
        </div>

        {/* ed25519 group */}
        <div>
          <p className="text-xs text-fg-muted mb-1">{t("chainSelection.groupEd25519")}</p>
          <div className="flex flex-wrap gap-3">
            {edChains.map((chain) => (
              <label
                key={chain.key}
                className="flex items-center gap-1.5 text-sm text-fg-secondary cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedChains.includes(chain.key)}
                  onChange={() => toggleChain(chain.key)}
                  className="accent-accent-cyan"
                />
                {chain.name}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* ====== Derivation Results ====== */}
      <section className="mt-6">
        {!validation.valid && (
          <p className="text-sm text-fg-muted text-center py-8">{t("results.noMnemonic")}</p>
        )}
        {validation.valid && selectedChains.length > 0 && (
          <NeonTabs
            selectedIndex={activeChain}
            onChange={setActiveChain}
            tabs={selectedChains.map((chainKey) => {
              const chain = CHAINS.find((c) => c.key === chainKey)!;
              const accounts = derivedResults[chainKey] ?? [];
              return {
                label: chain.name,
                content: (
                  <div className="space-y-3">
                    {/* Path footer */}
                    {accounts.length > 0 && (
                      <p className="text-xs text-fg-muted font-mono">
                        {t("results.pathUsed")}: {accounts[0].path.replace(/\/\d+['"]?$/, "/{i}")}
                      </p>
                    )}

                    {/* Address table */}
                    <div className="divide-y divide-border-default">
                      {accounts.map((acc, idx) => {
                        const isExpanded = expandedRows[chainKey] === idx;
                        const isRevealed = revealedKeys[chainKey]?.has(idx) ?? false;
                        return (
                          <div key={idx}>
                            {/* Row header */}
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedRows((prev) => ({
                                  ...prev,
                                  [chainKey]: prev[chainKey] === idx ? null : idx,
                                }))
                              }
                              className="w-full flex items-center gap-3 py-2.5 px-2 hover:bg-bg-surface/50 rounded text-left"
                            >
                              <span className="text-fg-muted text-sm w-6 shrink-0">{idx}</span>
                              <span className="text-sm text-fg-primary font-mono truncate flex-1">
                                {acc.address}
                              </span>
                              <CopyButton getContent={() => acc.address} />
                              {isExpanded ? (
                                <ChevronDown size={16} className="text-fg-muted shrink-0" />
                              ) : (
                                <ChevronRight size={16} className="text-fg-muted shrink-0" />
                              )}
                            </button>

                            {/* Expanded detail */}
                            {isExpanded && (
                              <div className="pl-8 pr-2 pb-3 space-y-2">
                                {/* Public Key */}
                                {chain.showPublicKey && acc.publicKey && (
                                  <DetailRow
                                    label={acc.publicKeyLabel ?? t("results.publicKey")}
                                    value={acc.publicKey}
                                  />
                                )}

                                {/* Private Key */}
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-fg-muted w-32 shrink-0">
                                    {acc.privateKeyLabel}
                                  </span>
                                  <div className="flex-1 flex items-center gap-2">
                                    <code className="text-xs font-mono text-fg-primary break-all flex-1">
                                      {isRevealed
                                        ? acc.privateKey
                                        : "•••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
                                    </code>
                                    <button
                                      type="button"
                                      onClick={() => toggleReveal(chainKey, idx)}
                                      className="text-fg-muted hover:text-fg-secondary shrink-0"
                                    >
                                      {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                    {isRevealed && <CopyButton getContent={() => acc.privateKey} />}
                                  </div>
                                </div>

                                {/* Alt Private Key (Solana u8 array) */}
                                {acc.privateKeyAlt && (
                                  <DetailRow
                                    label={acc.privateKeyAltLabel ?? ""}
                                    value={acc.privateKeyAlt}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ),
              };
            })}
          />
        )}
      </section>

      {/* ====== Description & FAQ ====== */}
      <section className="mt-8">
        <Accordion
          items={[
            {
              title: t("descriptions.whatIsTitle"),
              content: (
                <p className="text-sm text-fg-secondary leading-relaxed">
                  {t("descriptions.whatIs")}
                </p>
              ),
            },
            {
              title: t("descriptions.bip39Title"),
              content: (
                <p className="text-sm text-fg-secondary leading-relaxed">
                  {t("descriptions.bip39")}
                </p>
              ),
            },
            {
              title: t("descriptions.bip32Title"),
              content: (
                <p className="text-sm text-fg-secondary leading-relaxed">
                  {t("descriptions.bip32")}
                </p>
              ),
            },
            {
              title: t("descriptions.bip44Title"),
              content: (
                <p className="text-sm text-fg-secondary leading-relaxed">
                  {t("descriptions.bip44")}
                </p>
              ),
            },
            {
              title: t("descriptions.securityTitle"),
              content: (
                <p className="text-sm text-fg-secondary leading-relaxed">
                  {t("descriptions.security")}
                </p>
              ),
            },
            {
              title: t("descriptions.faq1Q"),
              content: (
                <p className="text-sm text-fg-secondary leading-relaxed">
                  {t("descriptions.faq1A")}
                </p>
              ),
            },
            {
              title: t("descriptions.faq2Q"),
              content: (
                <p className="text-sm text-fg-secondary leading-relaxed">
                  {t("descriptions.faq2A")}
                </p>
              ),
            },
            {
              title: t("descriptions.faq3Q"),
              content: (
                <p className="text-sm text-fg-secondary leading-relaxed">
                  {t("descriptions.faq3A")}
                </p>
              ),
            },
          ]}
        />
      </section>

      <RelatedTools currentTool="wallet" />
    </Layout>
  );
}

// --- Sub-components ---

function PathField({
  value,
  hardened,
  onChange,
  disabled = false,
}: {
  value: number;
  hardened: boolean;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-14 bg-bg-input text-fg-primary text-sm rounded-md border border-border-default px-2 py-1 text-center font-mono"
      />
      {hardened && <span className="text-fg-muted text-sm ml-0.5">'</span>}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-fg-muted w-32 shrink-0 pt-0.5">{label}</span>
      <code className="text-xs font-mono text-fg-primary break-all flex-1">{value}</code>
      <CopyButton getContent={() => value} />
    </div>
  );
}
```

- [ ] **Step 2: Verify the page renders**

Run:

```bash
npx next dev --port 3099 &
sleep 8
curl -s http://localhost:3099/wallet | head -20
```

Expected: HTML response with wallet page content (no 500 error).

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/wallet/wallet-page.tsx
git commit -m "feat(wallet): add full wallet page UI with mnemonic input, path editor, chain selector, derivation results"
```

---

### Task 6: CJK Translations (zh-CN, zh-TW, ja, ko)

**Files:**

- Create: `public/locales/{zh-CN,zh-TW,ja,ko}/wallet.json`
- Modify: `public/locales/{zh-CN,zh-TW,ja,ko}/tools.json`

This task creates 4 locale files. Each wallet.json follows the same key structure as the English version. The tools.json entries add `searchTerms` per CJK keyword rules.

- [ ] **Step 1: Create `public/locales/zh-CN/wallet.json`**

```json
{
  "mnemonicLabel": "助记词",
  "mnemonicPlaceholder": "输入 BIP39 助记词（12/15/18/21/24 个英文单词）",
  "generate": "生成",
  "wordCount12": "12 个单词",
  "wordCount24": "24 个单词",
  "passphraseToggle": "密码短语（BIP39）",
  "passphrasePlaceholder": "可选密码短语（第 25 个词）",
  "validation": {
    "invalidLength": "助记词长度无效（必须是 12、15、18、21 或 24 个单词）",
    "invalidWords": "以下位置存在无效单词：{positions}",
    "invalidChecksum": "校验和不正确"
  },
  "pathEditor": {
    "label": "派生路径",
    "purpose": "用途",
    "coinType": "币种类型",
    "account": "账户",
    "change": "找零",
    "addressCount": "地址数量",
    "allHardenedWarning": "ed25519 链要求所有路径段都必须为强化派生"
  },
  "chainSelection": {
    "label": "选择链",
    "groupSecp256k1": "secp256k1",
    "groupEd25519": "ed25519"
  },
  "results": {
    "index": "#",
    "address": "地址",
    "publicKey": "公钥",
    "privateKey": "私钥",
    "show": "显示",
    "hide": "隐藏",
    "copy": "复制",
    "pathUsed": "使用路径",
    "expand": "展开",
    "collapse": "收起",
    "noMnemonic": "输入或生成助记词以派生地址"
  },
  "descriptions": {
    "aeoDefinition": "HD 钱包生成器是一款免费的在线工具，用于生成 BIP39 助记词并在多条区块链上派生加密货币地址。支持 EVM、Bitcoin、Solana、Tron 和 Cosmos 生态。所有计算完全在浏览器端进行，不会向任何服务器发送数据。",
    "whatIsTitle": "什么是 HD 钱包？",
    "whatIs": "HD（分层确定性）钱包使用树形结构从单个主种子生成所有私钥。这意味着你只需备份一个助记词即可恢复所有派生路径下的所有地址。",
    "bip39Title": "BIP39 助记词",
    "bip39": "BIP39 定义了如何将随机种子表示为人类可读的单词列表（12 或 24 个单词）。助记词是钱包的备份——请安全存储，切勿分享。",
    "bip32Title": "BIP32 HD 密钥派生",
    "bip32": "BIP32 规定了如何从主种子派生密钥对树。树中的每个节点通过派生路径寻址，如 m/44'/60'/0'/0/0。",
    "bip44Title": "BIP44 多账户",
    "bip44": "BIP44 定义了标准路径结构：m / purpose' / coin_type' / account' / change / address_index。每条区块链都有注册的 coin_type（例如以太坊为 60，比特币为 0）。",
    "securityTitle": "安全提示",
    "security": "本工具仅供教育和开发目的。请勿在浏览器生成的助记词中存储真实资金。生产环境请使用硬件钱包。",
    "faq1Q": "什么是 BIP39 密码短语？",
    "faq1A": "BIP39 密码短语也被称为"第 25 个词"，是为助记词增加额外安全性的可选项。相同的助记词搭配不同的密码短语会产生完全不同的钱包。如果使用了密码短语，恢复钱包时必须记住它。",
    "faq2Q": "为什么 Solana 路径要求所有段都是强化派生？",
    "faq2A": "Solana 通过 SLIP-0010 使用 ed25519 曲线，该标准仅支持强化派生。ed25519 密钥无法进行非强化派生，因此所有路径段必须包含 '（强化）后缀。",
    "faq3Q": "比特币 Legacy、SegWit 和 Taproot 地址有什么区别？",
    "faq3A": "Legacy（P2PKH，以 1 开头）是最初的格式。SegWit（P2WPKH，以 bc1q 开头）使用 Bech32 编码，手续费更低。Taproot（P2TR，以 bc1p 开头）是最新的格式，提供更强的隐私和智能合约功能。"
  }
}
```

- [ ] **Step 2: Add wallet entry to `public/locales/zh-CN/tools.json`**

Add after the last tool entry in the JSON object:

```json
  "wallet": {
    "title": "HD 钱包生成器 - BIP39 助记词 & 多链地址派生",
    "shortTitle": "HD 钱包",
    "description": "生成 BIP39 助记词，为 EVM、Bitcoin、Solana、Tron、Cosmos 等多链派生加密货币地址。免费在线 HD 钱包工具，100% 浏览器端处理。",
    "searchTerms": "hdaobaoqiandai hdbqzhujici paisheng"
  }
```

- [ ] **Step 3: Create `public/locales/zh-TW/wallet.json`**

```json
{
  "mnemonicLabel": "助記詞",
  "mnemonicPlaceholder": "輸入 BIP39 助記詞（12/15/18/21/24 個英文單字）",
  "generate": "產生",
  "wordCount12": "12 個單字",
  "wordCount24": "24 個單字",
  "passphraseToggle": "密碼短語（BIP39）",
  "passphrasePlaceholder": "選用密碼短語（第 25 個詞）",
  "validation": {
    "invalidLength": "助記詞長度無效（必須是 12、15、18、21 或 24 個單字）",
    "invalidWords": "以下位置存在無效單字：{positions}",
    "invalidChecksum": "校驗和不正確"
  },
  "pathEditor": {
    "label": "衍生路徑",
    "purpose": "用途",
    "coinType": "幣種類型",
    "account": "帳戶",
    "change": "找零",
    "addressCount": "地址數量",
    "allHardenedWarning": "ed25519 鏈要求所有路徑段都必須為強化衍生"
  },
  "chainSelection": {
    "label": "選擇鏈",
    "groupSecp256k1": "secp256k1",
    "groupEd25519": "ed25519"
  },
  "results": {
    "index": "#",
    "address": "地址",
    "publicKey": "公鑰",
    "privateKey": "私鑰",
    "show": "顯示",
    "hide": "隱藏",
    "copy": "複製",
    "pathUsed": "使用路徑",
    "expand": "展開",
    "collapse": "收合",
    "noMnemonic": "輸入或產生助記詞以衍生地址"
  },
  "descriptions": {
    "aeoDefinition": "HD 錢包產生器是一款免費的線上工具，用於產生 BIP39 助記詞並在多條區塊鏈上衍生加密貨幣地址。支援 EVM、Bitcoin、Solana、Tron 和 Cosmos 生態。所有運算完全在瀏覽器端進行，不會向任何伺服器傳送資料。",
    "whatIsTitle": "什麼是 HD 錢包？",
    "whatIs": "HD（分層確定性）錢包使用樹狀結構從單一主種子產生所有私鑰。這意味著你只需備份一個助記詞即可還原所有衍生路徑下的所有地址。",
    "bip39Title": "BIP39 助記詞",
    "bip39": "BIP39 定義了如何將隨機種子表示為人類可讀的單字列表（12 或 24 個單字）。助記詞是錢包的備份——請安全儲存，切勿分享。",
    "bip32Title": "BIP32 HD 金鑰衍生",
    "bip32": "BIP32 規定了如何從主種子衍生金鑰對樹。樹中的每個節點透過衍生路徑定址，如 m/44'/60'/0'/0/0。",
    "bip44Title": "BIP44 多帳戶",
    "bip44": "BIP44 定義了標準路徑結構：m / purpose' / coin_type' / account' / change / address_index。每條區塊鏈都有註冊的 coin_type（例如以太坊為 60，比特幣為 0）。",
    "securityTitle": "安全提示",
    "security": "本工具僅供教育和開發用途。請勿在瀏覽器產生的助記詞中儲存真實資金。正式環境請使用硬體錢包。",
    "faq1Q": "什麼是 BIP39 密碼短語？",
    "faq1A": "BIP39 密碼短語也被稱為「第 25 個詞」，是為助記詞增加額外安全性的可選項。相同的助記詞搭配不同的密碼短語會產生完全不同的錢包。如果使用了密碼短語，還原錢包時必須記住它。",
    "faq2Q": "為什麼 Solana 路徑要求所有段都是強化衍生？",
    "faq2A": "Solana 透過 SLIP-0010 使用 ed25519 曲線，該標準僅支援強化衍生。ed25519 金鑰無法進行非強化衍生，因此所有路徑段必須包含 '（強化）後綴。",
    "faq3Q": "比特幣 Legacy、SegWit 和 Taproot 地址有什麼區別？",
    "faq3A": "Legacy（P2PKH，以 1 開頭）是最初的格式。SegWit（P2WPKH，以 bc1q 開頭）使用 Bech32 編碼，手續費更低。Taproot（P2TR，以 bc1p 開頭）是最新的格式，提供更強的隱私和智慧合約功能。"
  }
}
```

- [ ] **Step 4: Add wallet entry to `public/locales/zh-TW/tools.json`**

```json
  "wallet": {
    "title": "HD 錢包產生器 - BIP39 助記詞 & 多鏈地址衍生",
    "shortTitle": "HD 錢包",
    "description": "產生 BIP39 助記詞，為 EVM、Bitcoin、Solana、Tron、Cosmos 等多鏈衍生加密貨幣地址。免費線上 HD 錢包工具，100% 瀏覽器端處理。",
    "searchTerms": "hdaqianbaoshengchengqi hdqbzhujici paisheng"
  }
```

- [ ] **Step 5: Create `public/locales/ja/wallet.json`**

```json
{
  "mnemonicLabel": "ニーモニックフレーズ",
  "mnemonicPlaceholder": "BIP39 ニーモニックを入力（12/15/18/21/24 語）",
  "generate": "生成",
  "wordCount12": "12 語",
  "wordCount24": "24 語",
  "passphraseToggle": "パスフレーズ（BIP39）",
  "passphrasePlaceholder": "オプションのパスフレーズ（25番目の単語）",
  "validation": {
    "invalidLength": "ニーモニックの長さが無効です（12、15、18、21、または 24 語である必要があります）",
    "invalidWords": "次の位置に無効な単語があります：{positions}",
    "invalidChecksum": "チェックサムが正しくありません"
  },
  "pathEditor": {
    "label": "導出パス",
    "purpose": "Purpose",
    "coinType": "Coin Type",
    "account": "アカウント",
    "change": "チェンジ",
    "addressCount": "アドレス数",
    "allHardenedWarning": "ed25519 チェーンではすべてのパスセグメントをハードened導出にする必要があります"
  },
  "chainSelection": {
    "label": "チェーン選択",
    "groupSecp256k1": "secp256k1",
    "groupEd25519": "ed25519"
  },
  "results": {
    "index": "#",
    "address": "アドレス",
    "publicKey": "公開鍵",
    "privateKey": "秘密鍵",
    "show": "表示",
    "hide": "非表示",
    "copy": "コピー",
    "pathUsed": "使用パス",
    "expand": "展開",
    "collapse": "折りたたむ",
    "noMnemonic": "ニーモニックを入力または生成してアドレスを導出してください"
  },
  "descriptions": {
    "aeoDefinition": "HD ウォレットジェネレーターは、BIP39 ニーモニックフレーズを生成し、複数のブロックチェーンで暗号通貨アドレスを導出する無料のオンラインツールです。EVM、Bitcoin、Solana、Tron、Cosmos チェーンに対応。すべての計算はブラウザ内で完結し、サーバーにデータを送信しません。",
    "whatIsTitle": "HD ウォレットとは？",
    "whatIs": "HD（階層的決定性）ウォレットは、ツリー構造を使用して単一のマスターシードからすべての秘密鍵を生成します。つまり、1つのニーモニックフレーズをバックアップするだけで、すべての導出パスのすべてのアドレスを復元できます。",
    "bip39Title": "BIP39 ニーモニック",
    "bip39": "BIP39 は、ランダムシードを人間が読める単語リスト（12または24語）として表現する方法を定義しています。ニーモニックフレーズはウォレットのバックアップです。安全に保管し、決して共有しないでください。",
    "bip32Title": "BIP32 HD キー導出",
    "bip32": "BIP32 は、マスターシードからキーペアのツリーを導出する方法を規定しています。ツリーの各ノードは m/44'/60'/0'/0/0 のような導出パスでアドレス指定されます。",
    "bip44Title": "BIP44 マルチアカウント",
    "bip44": "BIP44 は標準パス構造を定義します：m / purpose' / coin_type' / account' / change / address_index。各ブロックチェーンには登録された coin_type があります（例：Ethereum は 60、Bitcoin は 0）。",
    "securityTitle": "セキュリティに関する注意",
    "security": "このツールは教育・開発目的のみです。ブラウザで生成されたニーモニックを実際の資金に使用しないでください。本番環境ではハードウェアウォレットを使用してください。",
    "faq1Q": "BIP39 パスフレーズとは何ですか？",
    "faq1A": "BIP39 パスフレーズは「25番目の単語」とも呼ばれ、ニーモニックに追加のセキュリティを加えるオプションです。同じニーモニックでもパスフレーズが異なると、全く異なるウォレットが生成されます。パスフレーズを使用する場合は、ウォレットの復元に必要です。",
    "faq2Q": "なぜ Solana のパスはすべてハードenedセグメントを要求するのですか？",
    "faq2A": "Solana は SLIP-0010 を通じて ed25519 曲線を使用しており、この標準はハードened導出のみをサポートしています。ed25519 キーでは非ハードened導出が不可能なため、すべてのパスセグメントに '（ハードened）サフィックスを含める必要があります。",
    "faq3Q": "Bitcoin の Legacy、SegWit、Taproot アドレスの違いは何ですか？",
    "faq3A": "Legacy（P2PKH、1 で始まる）は元のフォーマットです。SegWit（P2WPKH、bc1q で始まる）は Bech32 エンコーディングを使用し、手数料が低くなります。Taproot（P2TR、bc1p で始まる）は最新のフォーマットで、プライバシーとスマートコントラクト機能が強化されています。"
  }
}
```

- [ ] **Step 6: Add wallet entry to `public/locales/ja/tools.json`**

```json
  "wallet": {
    "title": "HD ウォレットジェネレーター - BIP39 ニーモニック & マルチチェーンアドレス導出",
    "shortTitle": "HD ウォレット",
    "description": "BIP39 ニーモニックを生成し、EVM、Bitcoin、Solana、Tron、Cosmos チェーンの暗号通貨アドレスを導出。無料のオンライン HD ウォレットツール。100% ブラウザ内処理。",
    "searchTerms": "hdworetto nemunikku paishutsu"
  }
```

- [ ] **Step 7: Create `public/locales/ko/wallet.json`**

```json
{
  "mnemonicLabel": "니모닉 구문",
  "mnemonicPlaceholder": "BIP39 니모닉 구문을 입력하세요 (12/15/18/21/24 단어)",
  "generate": "생성",
  "wordCount12": "12 단어",
  "wordCount24": "24 단어",
  "passphraseToggle": "암호 구문 (BIP39)",
  "passphrasePlaceholder": "선택적 암호 구문 (25번째 단어)",
  "validation": {
    "invalidLength": "니모닉 길이가 유효하지 않습니다 (12, 15, 18, 21 또는 24 단어여야 함)",
    "invalidWords": "다음 위치에 유효하지 않은 단어가 있습니다: {positions}",
    "invalidChecksum": "체크섬이 유효하지 않습니다"
  },
  "pathEditor": {
    "label": "파생 경로",
    "purpose": "용도",
    "coinType": "코인 유형",
    "account": "계정",
    "change": "체인지",
    "addressCount": "주소 수",
    "allHardenedWarning": "ed25519 체인은 모든 경로 세그먼트가 강화 파생이어야 합니다"
  },
  "chainSelection": {
    "label": "체인 선택",
    "groupSecp256k1": "secp256k1",
    "groupEd25519": "ed25519"
  },
  "results": {
    "index": "#",
    "address": "주소",
    "publicKey": "공개키",
    "privateKey": "개인키",
    "show": "표시",
    "hide": "숨기기",
    "copy": "복사",
    "pathUsed": "사용 경로",
    "expand": "펼치기",
    "collapse": "접기",
    "noMnemonic": "니모닉을 입력하거나 생성하여 주소를 파생하세요"
  },
  "descriptions": {
    "aeoDefinition": "HD 지갑 생성기는 BIP39 니모닉 구문을 생성하고 여러 블록체인에서 암호화폐 주소를 파생하는 무료 온라인 도구입니다. EVM, Bitcoin, Solana, Tron, Cosmos 체인을 지원합니다. 모든 계산은 브라우저에서 수행되며 어떤 서버에도 데이터를 전송하지 않습니다.",
    "whatIsTitle": "HD 지갑이란?",
    "whatIs": "HD(계층적 결정론적) 지갑은 트리 구조를 사용하여 단일 마스터 시드에서 모든 개인키를 생성합니다. 즉, 하나의 니모닉 구문만 백업하면 모든 파생 경로의 모든 주소를 복구할 수 있습니다.",
    "bip39Title": "BIP39 니모닉",
    "bip39": "BIP39는 무작위 시드를 사람이 읽을 수 있는 단어 목록(12 또는 24단어)으로 표현하는 방법을 정의합니다. 니모닉 구문은 지갑의 백업입니다. 안전하게 보관하고 절대 공유하지 마세요.",
    "bip32Title": "BIP32 HD 키 파생",
    "bip32": "BIP32는 마스터 시드에서 키페어 트리를 파생하는 방법을 규정합니다. 트리의 각 노드는 m/44'/60'/0'/0/0과 같은 파생 경로로 주소 지정됩니다.",
    "bip44Title": "BIP44 다중 계정",
    "bip44": "BIP44는 표준 경로 구조를 정의합니다: m / purpose' / coin_type' / account' / change / address_index. 각 블록체인에는 등록된 coin_type이 있습니다 (예: Ethereum은 60, Bitcoin은 0).",
    "securityTitle": "보안 주의사항",
    "security": "이 도구는 교육 및 개발 목적으로만 사용하세요. 브라우저에서 생성된 니모닉을 실제 자산에 사용하지 마세요. 프로덕션 환경에서는 하드웨어 지갑을 사용하세요.",
    "faq1Q": "BIP39 암호 구문이란 무엇인가요?",
    "faq1A": "BIP39 암호 구문은 '25번째 단어'라고도 불리며, 니모닉에 추가 보안을 제공하는 선택 사항입니다. 같은 니모닉이라도 다른 암호 구문을 사용하면 완전히 다른 지갑이 생성됩니다. 암호 구문을 사용한 경우 지갑 복구에 필요합니다.",
    "faq2Q": "왜 Solana 경로는 모든 세그먼트가 강화 파생이어야 하나요?",
    "faq2A": "Solana는 SLIP-0010을 통해 ed25519 곡선을 사용하며, 이 표준은 강화 파생만 지원합니다. ed25519 키로는 비강화 파생이 불가능하므로 모든 경로 세그먼트에 '(강화) 접미사가 포함되어야 합니다.",
    "faq3Q": "Bitcoin Legacy, SegWit, Taproot 주소의 차이점은 무엇인가요?",
    "faq3A": "Legacy(P2PKH, 1로 시작)는 원래 형식입니다. SegWit(P2WPKH, bc1q로 시작)는 Bech32 인코딩을 사용하여 수수료가 낮습니다. Taproot(P2TR, bc1p로 시작)는 최신 형식으로 향상된 프라이버시와 스마트 컨트랙트 기능을 제공합니다."
  }
}
```

- [ ] **Step 8: Add wallet entry to `public/locales/ko/tools.json`**

```json
  "wallet": {
    "title": "HD 지갑 생성기 - BIP39 니모닉 & 멀티체인 주소 파생",
    "shortTitle": "HD 지갑",
    "description": "BIP39 니모닉 구문을 생성하고 EVM, Bitcoin, Solana, Tron, Cosmos 체인의 암호화폐 주소를 파생합니다. 무료 온라인 HD 지갑 도구. 100% 브라우저 처리.",
    "searchTerms": "hdjibsaengseonggi nimonic paesaeng"
  }
```

- [ ] **Step 9: Commit CJK translations**

```bash
git add public/locales/zh-CN/wallet.json public/locales/zh-CN/tools.json public/locales/zh-TW/wallet.json public/locales/zh-TW/tools.json public/locales/ja/wallet.json public/locales/ja/tools.json public/locales/ko/wallet.json public/locales/ko/tools.json
git commit -m "feat(wallet): add CJK translations (zh-CN, zh-TW, ja, ko)"
```

---

### Task 7: Latin Translations (es, pt-BR, fr, de, ru)

**Files:**

- Create: `public/locales/{es,pt-BR,fr,de,ru}/wallet.json`
- Modify: `public/locales/{es,pt-BR,fr,de,ru}/tools.json`

Latin-script locales don't need `searchTerms` unless they have alternative terms. These locales' `shortTitle` is already searchable by fuzzysort.

- [ ] **Step 1: Create `public/locales/es/wallet.json`**

```json
{
  "mnemonicLabel": "Frase mnemónica",
  "mnemonicPlaceholder": "Introduce tu frase mnemónica BIP39 (12/15/18/21/24 palabras)",
  "generate": "Generar",
  "wordCount12": "12 palabras",
  "wordCount24": "24 palabras",
  "passphraseToggle": "Contraseña (BIP39)",
  "passphrasePlaceholder": "Contraseña opcional (25ª palabra)",
  "validation": {
    "invalidLength": "Longitud de frase mnemónica inválida (debe tener 12, 15, 18, 21 o 24 palabras)",
    "invalidWords": "Palabras inválidas en la posición: {positions}",
    "invalidChecksum": "Checksum inválido"
  },
  "pathEditor": {
    "label": "Ruta de derivación",
    "purpose": "Propósito",
    "coinType": "Tipo de moneda",
    "account": "Cuenta",
    "change": "Cambio",
    "addressCount": "Cantidad de direcciones",
    "allHardenedWarning": "Las cadenas ed25519 requieren que todos los segmentos de ruta sean endurecidos"
  },
  "chainSelection": {
    "label": "Seleccionar cadenas",
    "groupSecp256k1": "secp256k1",
    "groupEd25519": "ed25519"
  },
  "results": {
    "index": "#",
    "address": "Dirección",
    "publicKey": "Clave pública",
    "privateKey": "Clave privada",
    "show": "Mostrar",
    "hide": "Ocultar",
    "copy": "Copiar",
    "pathUsed": "Ruta utilizada",
    "expand": "Expandir",
    "collapse": "Colapsar",
    "noMnemonic": "Introduce o genera una frase mnemónica para derivar direcciones"
  },
  "descriptions": {
    "aeoDefinition": "El generador de carteras HD es una herramienta gratuita para generar frases mnemónicas BIP39 y derivar direcciones de criptomonedas en múltiples blockchains. Compatible con EVM, Bitcoin, Solana, Tron y Cosmos. Todo el procesamiento se realiza en tu navegador.",
    "whatIsTitle": "¿Qué es una cartera HD?",
    "whatIs": "Una cartera HD (Jerárquica Determinista) genera todas las claves privadas desde una única semilla maestra usando una estructura de árbol. Esto significa que solo necesitas respaldar una frase mnemónica para recuperar todas las direcciones.",
    "bip39Title": "Frase mnemónica BIP39",
    "bip39": "BIP39 define cómo representar una semilla aleatoria como una lista de palabras legibles (12 o 24 palabras). La frase mnemónica es la copia de seguridad de tu cartera. Guárdala de forma segura y nunca la compartas.",
    "bip32Title": "Derivación de claves BIP32",
    "bip32": "BIP32 especifica cómo derivar un árbol de pares de claves desde una semilla maestra. Cada nodo se direcciona mediante una ruta de derivación como m/44'/60'/0'/0/0.",
    "bip44Title": "BIP44 Multi-cuenta",
    "bip44": "BIP44 define una estructura de ruta estándar: m / purpose' / coin_type' / account' / change / address_index. Cada blockchain tiene un coin_type registrado (ej. 60 para Ethereum, 0 para Bitcoin).",
    "securityTitle": "Aviso de seguridad",
    "security": "Esta herramienta es solo con fines educativos y de desarrollo. Nunca uses una frase mnemónica generada en el navegador para fondos reales. Usa una cartera hardware para producción.",
    "faq1Q": "¿Qué es una contraseña BIP39?",
    "faq1A": "También llamada la «25ª palabra», una contraseña BIP39 añade seguridad adicional a tu frase mnemónica. La misma frase mnemónica con diferentes contraseñas produce carteras completamente diferentes. Si usas una contraseña, debes recordarla para recuperar tu cartera.",
    "faq2Q": "¿Por qué las rutas de Solana requieren todos los segmentos endurecidos?",
    "faq2A": "Solana usa la curva ed25519 mediante SLIP-0010, que solo admite derivación endurecida. La derivación no endurecida no es posible con claves ed25519.",
    "faq3Q": "¿Cuál es la diferencia entre direcciones Bitcoin Legacy, SegWit y Taproot?",
    "faq3A": "Legacy (P2PKH, empieza por 1) es el formato original. SegWit (P2WPKH, bc1q) usa codificación Bech32 con comisiones más bajas. Taproot (P2TR, bc1p) es el formato más reciente con privacidad mejorada."
  }
}
```

- [ ] **Step 2: Add wallet entry to `public/locales/es/tools.json`**

```json
  "wallet": {
    "title": "Generador de Cartera HD - Frase Mnemónica BIP39 y Derivación Multicadena",
    "shortTitle": "Cartera HD",
    "description": "Genera frases mnemónicas BIP39 y deriva direcciones de criptomonedas para EVM, Bitcoin, Solana, Tron y Cosmos. Herramienta gratuita 100% en el navegador."
  }
```

- [ ] **Step 3: Create `public/locales/pt-BR/wallet.json`**

```json
{
  "mnemonicLabel": "Frase mnemônica",
  "mnemonicPlaceholder": "Insira sua frase mnemônica BIP39 (12/15/18/21/24 palavras)",
  "generate": "Gerar",
  "wordCount12": "12 palavras",
  "wordCount24": "24 palavras",
  "passphraseToggle": "Senha (BIP39)",
  "passphrasePlaceholder": "Senha opcional (25ª palavra)",
  "validation": {
    "invalidLength": "Comprimento de frase mnemônica inválido (deve ter 12, 15, 18, 21 ou 24 palavras)",
    "invalidWords": "Palavras inválidas na posição: {positions}",
    "invalidChecksum": "Checksum inválido"
  },
  "pathEditor": {
    "label": "Caminho de derivação",
    "purpose": "Propósito",
    "coinType": "Tipo de moeda",
    "account": "Conta",
    "change": "Troco",
    "addressCount": "Quantidade de endereços",
    "allHardenedWarning": "Cadeias ed25519 exigem que todos os segmentos sejam endurecidos"
  },
  "chainSelection": {
    "label": "Selecionar cadeias",
    "groupSecp256k1": "secp256k1",
    "groupEd25519": "ed25519"
  },
  "results": {
    "index": "#",
    "address": "Endereço",
    "publicKey": "Chave pública",
    "privateKey": "Chave privada",
    "show": "Mostrar",
    "hide": "Ocultar",
    "copy": "Copiar",
    "pathUsed": "Caminho usado",
    "expand": "Expandir",
    "collapse": "Recolher",
    "noMnemonic": "Insira ou gere uma frase mnemônica para derivar endereços"
  },
  "descriptions": {
    "aeoDefinition": "O gerador de carteira HD é uma ferramenta gratuita para gerar frases mnemônicas BIP39 e derivar endereços de criptomoedas em múltiplas blockchains. Suporta EVM, Bitcoin, Solana, Tron e Cosmos. Todo o processamento é feito no seu navegador.",
    "whatIsTitle": "O que é uma carteira HD?",
    "whatIs": "Uma carteira HD (Hierárquica Determinística) gera todas as chaves privadas a partir de uma única semente mestra usando uma estrutura de árvore. Isso significa que você só precisa fazer backup de uma frase mnemônica para recuperar todos os endereços.",
    "bip39Title": "Frase mnemônica BIP39",
    "bip39": "BIP39 define como representar uma semente aleatória como uma lista de palavras legíveis (12 ou 24 palavras). A frase mnemônica é o backup da sua carteira. Armazene-a com segurança e nunca a compartilhe.",
    "bip32Title": "Derivação de chaves BIP32",
    "bip32": "BIP32 especifica como derivar uma árvore de pares de chaves a partir de uma semente mestra. Cada nó é endereçado por um caminho de derivação como m/44'/60'/0'/0/0.",
    "bip44Title": "BIP44 Multi-conta",
    "bip44": "BIP44 define uma estrutura de caminho padrão: m / purpose' / coin_type' / account' / change / address_index. Cada blockchain tem um coin_type registrado (ex: 60 para Ethereum, 0 para Bitcoin).",
    "securityTitle": "Aviso de segurança",
    "security": "Esta ferramenta é apenas para fins educacionais e de desenvolvimento. Nunca use uma frase mnemônica gerada no navegador para fundos reais. Use uma carteira hardware para produção.",
    "faq1Q": "O que é uma senha BIP39?",
    "faq1A": "Também chamada de «25ª palavra», uma senha BIP39 adiciona segurança extra à sua frase mnemônica. A mesma frase com senhas diferentes produz carteiras completamente diferentes. Se usar uma senha, você deve lembrá-la para recuperar sua carteira.",
    "faq2Q": "Por que os caminhos da Solana exigem todos os segmentos endurecidos?",
    "faq2A": "A Solana usa a curva ed25519 via SLIP-0010, que suporta apenas derivação endurecida. Derivação não endurecida não é possível com chaves ed25519.",
    "faq3Q": "Qual a diferença entre endereços Bitcoin Legacy, SegWit e Taproot?",
    "faq3A": "Legacy (P2PKH, começa com 1) é o formato original. SegWit (P2WPKH, bc1q) usa codificação Bech32 com taxas menores. Taproot (P2TR, bc1p) é o formato mais recente com privacidade aprimorada."
  }
}
```

- [ ] **Step 4: Add wallet entry to `public/locales/pt-BR/tools.json`**

```json
  "wallet": {
    "title": "Gerador de Carteira HD - Frase Mnemônica BIP39 e Derivação Multichain",
    "shortTitle": "Carteira HD",
    "description": "Gere frases mnemônicas BIP39 e derive endereços de criptomoedas para EVM, Bitcoin, Solana, Tron e Cosmos. Ferramenta gratuita 100% no navegador."
  }
```

- [ ] **Step 5: Create `public/locales/fr/wallet.json`**

```json
{
  "mnemonicLabel": "Phrase mnémonique",
  "mnemonicPlaceholder": "Entrez votre phrase mnémonique BIP39 (12/15/18/21/24 mots)",
  "generate": "Générer",
  "wordCount12": "12 mots",
  "wordCount24": "24 mots",
  "passphraseToggle": "Phrase de passe (BIP39)",
  "passphrasePlaceholder": "Phrase de passe facultative (25e mot)",
  "validation": {
    "invalidLength": "Longueur de phrase mnémonique invalide (doit contenir 12, 15, 18, 21 ou 24 mots)",
    "invalidWords": "Mots invalides à la position : {positions}",
    "invalidChecksum": "Somme de contrôle invalide"
  },
  "pathEditor": {
    "label": "Chemin de dérivation",
    "purpose": "Objectif",
    "coinType": "Type de monnaie",
    "account": "Compte",
    "change": "Change",
    "addressCount": "Nombre d'adresses",
    "allHardenedWarning": "Les chaînes ed25519 exigent que tous les segments soient endurcis"
  },
  "chainSelection": {
    "label": "Sélectionner les chaînes",
    "groupSecp256k1": "secp256k1",
    "groupEd25519": "ed25519"
  },
  "results": {
    "index": "#",
    "address": "Adresse",
    "publicKey": "Clé publique",
    "privateKey": "Clé privée",
    "show": "Afficher",
    "hide": "Masquer",
    "copy": "Copier",
    "pathUsed": "Chemin utilisé",
    "expand": "Développer",
    "collapse": "Réduire",
    "noMnemonic": "Entrez ou générez une phrase mnémonique pour dériver des adresses"
  },
  "descriptions": {
    "aeoDefinition": "Le générateur de portefeuille HD est un outil gratuit pour générer des phrases mnémoniques BIP39 et dériver des adresses de cryptomonnaies sur plusieurs blockchains. Compatible EVM, Bitcoin, Solana, Tron et Cosmos. Tout le traitement est effectué dans votre navigateur.",
    "whatIsTitle": "Qu'est-ce qu'un portefeuille HD ?",
    "whatIs": "Un portefeuille HD (Hiérarchique Déterministe) génère toutes les clés privées à partir d'une seule graine maîtresse en utilisant une structure arborescente. Vous n'avez besoin de sauvegarder qu'une seule phrase mnémonique pour récupérer toutes les adresses.",
    "bip39Title": "Phrase mnémonique BIP39",
    "bip39": "BIP39 définit comment représenter une graine aléatoire sous forme de liste de mots lisibles (12 ou 24 mots). La phrase mnémonique est la sauvegarde de votre portefeuille. Conservez-la en sécurité et ne la partagez jamais.",
    "bip32Title": "Dérivation de clés BIP32",
    "bip32": "BIP32 spécifie comment dériver un arbre de paires de clés à partir d'une graine maîtresse. Chaque nœud est adressé par un chemin de dérivation comme m/44'/60'/0'/0/0.",
    "bip44Title": "BIP44 Multi-comptes",
    "bip44": "BIP44 définit une structure de chemin standard : m / purpose' / coin_type' / account' / change / address_index. Chaque blockchain a un coin_type enregistré (ex : 60 pour Ethereum, 0 pour Bitcoin).",
    "securityTitle": "Avertissement de sécurité",
    "security": "Cet outil est destiné uniquement à des fins éducatives et de développement. N'utilisez jamais une phrase mnémonique générée dans le navigateur pour des fonds réels. Utilisez un portefeuille matériel en production.",
    "faq1Q": "Qu'est-ce qu'une phrase de passe BIP39 ?",
    "faq1A": "Aussi appelée le « 25e mot », une phrase de passe BIP39 ajoute une sécurité supplémentaire à votre phrase mnémonique. La même phrase mnémonique avec des phrases de passe différentes produit des portefeuilles complètement différents.",
    "faq2Q": "Pourquoi les chemins Solana exigent-ils tous les segments endurcis ?",
    "faq2A": "Solana utilise la courbe ed25519 via SLIP-0010, qui ne prend en charge que la dérivation endurcie. La dérivation non endurcie n'est pas possible avec les clés ed25519.",
    "faq3Q": "Quelle est la différence entre les adresses Bitcoin Legacy, SegWit et Taproot ?",
    "faq3A": "Legacy (P2PKH, commence par 1) est le format original. SegWit (P2WPKH, bc1q) utilise l'encodage Bech32 avec des frais plus bas. Taproot (P2TR, bc1p) est le format le plus récent avec une confidentialité améliorée."
  }
}
```

- [ ] **Step 6: Add wallet entry to `public/locales/fr/tools.json`**

```json
  "wallet": {
    "title": "Générateur de Portefeuille HD - Phrase Mnémonique BIP39 et Dérivation Multichaîne",
    "shortTitle": "Portefeuille HD",
    "description": "Générez des phrases mnémoniques BIP39 et dérivez des adresses de cryptomonnaies pour EVM, Bitcoin, Solana, Tron et Cosmos. Outil gratuit 100% dans le navigateur."
  }
```

- [ ] **Step 7: Create `public/locales/de/wallet.json`**

```json
{
  "mnemonicLabel": "Mnemonische Phrase",
  "mnemonicPlaceholder": "Geben Sie Ihre BIP39-mnemonische Phrase ein (12/15/18/21/24 Wörter)",
  "generate": "Generieren",
  "wordCount12": "12 Wörter",
  "wordCount24": "24 Wörter",
  "passphraseToggle": "Passphrase (BIP39)",
  "passphrasePlaceholder": "Optionale Passphrase (25. Wort)",
  "validation": {
    "invalidLength": "Ungültige Länge der mnemonischen Phrase (muss 12, 15, 18, 21 oder 24 Wörter haben)",
    "invalidWords": "Ungültige Wörter an Position: {positions}",
    "invalidChecksum": "Ungültige Prüfsumme"
  },
  "pathEditor": {
    "label": "Ableitungspfad",
    "purpose": "Zweck",
    "coinType": "Coin-Typ",
    "account": "Konto",
    "change": "Wechsel",
    "addressCount": "Anzahl der Adressen",
    "allHardenedWarning": "ed25519-Blockchains erfordern, dass alle Pfadsegmente gehärtet sind"
  },
  "chainSelection": {
    "label": "Blockchains auswählen",
    "groupSecp256k1": "secp256k1",
    "groupEd25519": "ed25519"
  },
  "results": {
    "index": "#",
    "address": "Adresse",
    "publicKey": "Öffentlicher Schlüssel",
    "privateKey": "Privater Schlüssel",
    "show": "Anzeigen",
    "hide": "Verbergen",
    "copy": "Kopieren",
    "pathUsed": "Verwendeter Pfad",
    "expand": "Aufklappen",
    "collapse": "Zuklappen",
    "noMnemonic": "Geben Sie eine mnemonische Phrase ein oder generieren Sie eine, um Adressen abzuleiten"
  },
  "descriptions": {
    "aeoDefinition": "Der HD-Wallet-Generator ist ein kostenloses Online-Tool zum Generieren von BIP39-mnemonischen Phrasen und Ableiten von Kryptowährungsadressen über mehrere Blockchains. Unterstützt EVM, Bitcoin, Solana, Tron und Cosmos. Die gesamte Verarbeitung erfolgt in Ihrem Browser.",
    "whatIsTitle": "Was ist ein HD-Wallet?",
    "whatIs": "Ein HD-Wallet (Hierarchisch Deterministisch) generiert alle privaten Schlüssel aus einem einzigen Master-Seed mithilfe einer Baumstruktur. Das bedeutet, Sie müssen nur eine mnemonische Phrase sichern, um alle Adressen wiederherzustellen.",
    "bip39Title": "BIP39 Mnemonische Phrase",
    "bip39": "BIP39 definiert, wie ein zufälliger Seed als Liste lesbarer Wörter (12 oder 24 Wörter) dargestellt wird. Die mnemonische Phrase ist das Backup Ihres Wallets. Bewahren Sie sie sicher auf und teilen Sie sie nie.",
    "bip32Title": "BIP32 HD-Schlüsselableitung",
    "bip32": "BIP32 spezifiziert, wie ein Baum von Schlüsselpaaren aus einem Master-Seed abgeleitet wird. Jeder Knoten wird durch einen Ableitungspfad wie m/44'/60'/0'/0/0 adressiert.",
    "bip44Title": "BIP44 Multi-Konto",
    "bip44": "BIP44 definiert eine Standardpfadstruktur: m / purpose' / coin_type' / account' / change / address_index. Jede Blockchain hat einen registrierten coin_type (z.B. 60 für Ethereum, 0 für Bitcoin).",
    "securityTitle": "Sicherheitshinweis",
    "security": "Dieses Tool dient nur Bildungs- und Entwicklungszwecken. Verwenden Sie niemals eine im Browser generierte mnemonische Phrase für echte Guthaben. Verwenden Sie ein Hardware-Wallet für den produktiven Einsatz.",
    "faq1Q": "Was ist eine BIP39-Passphrase?",
    "faq1A": "Auch als „25. Wort" bezeichnet, fügt eine BIP39-Passphrase Ihrer mnemonischen Phrase zusätzliche Sicherheit hinzu. Dieselbe mnemonische Phrase mit unterschiedlichen Passphrasen erzeugt völlig unterschiedliche Wallets.",
    "faq2Q": "Warum erfordern Solana-Pfade alle gehärteten Segmente?",
    "faq2A": "Solana verwendet die ed25519-Kurve über SLIP-0010, das nur gehärtete Ableitung unterstützt. Nicht-gehärtete Ableitung ist mit ed25519-Schlüsseln nicht möglich.",
    "faq3Q": "Was ist der Unterschied zwischen Bitcoin Legacy-, SegWit- und Taproot-Adressen?",
    "faq3A": "Legacy (P2PKH, beginnt mit 1) ist das ursprüngliche Format. SegWit (P2WPKH, bc1q) verwendet Bech32-Kodierung mit niedrigeren Gebühren. Taproot (P2TR, bc1p) ist das neueste Format mit verbessertem Datenschutz."
  }
}
```

- [ ] **Step 8: Add wallet entry to `public/locales/de/tools.json`**

```json
  "wallet": {
    "title": "HD-Wallet-Generator - BIP39 Mnemonische Phrase & Multichain-Adressableitung",
    "shortTitle": "HD-Wallet",
    "description": "Generieren Sie BIP39-mnemonische Phrasen und leiten Sie Kryptowährungsadressen für EVM, Bitcoin, Solana, Tron und Cosmos ab. Kostenloses Online-Tool, 100% im Browser."
  }
```

- [ ] **Step 9: Create `public/locales/ru/wallet.json`**

```json
{
  "mnemonicLabel": "Мнемоническая фраза",
  "mnemonicPlaceholder": "Введите мнемоническую фразу BIP39 (12/15/18/21/24 слова)",
  "generate": "Сгенерировать",
  "wordCount12": "12 слов",
  "wordCount24": "24 слова",
  "passphraseToggle": "Парольная фраза (BIP39)",
  "passphrasePlaceholder": "Дополнительная парольная фраза (25-е слово)",
  "validation": {
    "invalidLength": "Неверная длина мнемонической фразы (должно быть 12, 15, 18, 21 или 24 слова)",
    "invalidWords": "Неверные слова в позиции: {positions}",
    "invalidChecksum": "Неверная контрольная сумма"
  },
  "pathEditor": {
    "label": "Путь деривации",
    "purpose": "Назначение",
    "coinType": "Тип монеты",
    "account": "Аккаунт",
    "change": "Сдача",
    "addressCount": "Количество адресов",
    "allHardenedWarning": "Цепочки ed25519 требуют, чтобы все сегменты пути были усилены"
  },
  "chainSelection": {
    "label": "Выбор цепочек",
    "groupSecp256k1": "secp256k1",
    "groupEd25519": "ed25519"
  },
  "results": {
    "index": "#",
    "address": "Адрес",
    "publicKey": "Публичный ключ",
    "privateKey": "Приватный ключ",
    "show": "Показать",
    "hide": "Скрыть",
    "copy": "Копировать",
    "pathUsed": "Используемый путь",
    "expand": "Развернуть",
    "collapse": "Свернуть",
    "noMnemonic": "Введите или сгенерируйте мнемоническую фразу для деривации адресов"
  },
  "descriptions": {
    "aeoDefinition": "Генератор HD-кошелька — бесплатный онлайн-инструмент для генерации мнемонических фраз BIP39 и деривации адресов криптовалют на нескольких блокчейнах. Поддерживает EVM, Bitcoin, Solana, Tron и Cosmos. Вся обработка выполняется в вашем браузере.",
    "whatIsTitle": "Что такое HD-кошелёк?",
    "whatIs": "HD-кошелёк (Иерархический Детерминированный) генерирует все приватные ключи из одного мастер-сидa, используя древовидную структуру. Это значит, что вам нужно сохранить только одну мнемоническую фразу для восстановления всех адресов.",
    "bip39Title": "Мнемоническая фраза BIP39",
    "bip39": "BIP39 определяет, как представить случайный сид в виде списка читаемых слов (12 или 24 слова). Мнемоническая фраза — это резервная копия вашего кошелька. Храните её в безопасности и никогда не делитесь ею.",
    "bip32Title": "Деривация ключей BIP32",
    "bip32": "BIP32 определяет, как деривировать дерево пар ключей из мастер-сида. Каждый узел адресуется путём деривации, например m/44'/60'/0'/0/0.",
    "bip44Title": "BIP44 Мультиаккаунт",
    "bip44": "BIP44 определяет стандартную структуру пути: m / purpose' / coin_type' / account' / change / address_index. Каждый блокчейн имеет зарегистрированный coin_type (например, 60 для Ethereum, 0 для Bitcoin).",
    "securityTitle": "Предупреждение безопасности",
    "security": "Этот инструмент предназначен только для образовательных целей и разработки. Никогда не используйте мнемоническую фразу, сгенерированную в браузере, для реальных средств. Используйте аппаратный кошелёк для продакшена.",
    "faq1Q": "Что такое парольная фраза BIP39?",
    "faq1A": "Также называемая «25-м словом», парольная фраза BIP39 добавляет дополнительную безопасность к вашей мнемонической фразе. Одна и та же мнемоническая фраза с разными парольными фразами создаёт совершенно разные кошельки.",
    "faq2Q": "Почему пути Solana требуют все усиленные сегменты?",
    "faq2A": "Solana использует кривую ed25519 через SLIP-0010, который поддерживает только усиленную деривацию. Неусиленная деривация невозможна с ключами ed25519.",
    "faq3Q": "В чём разница между адресами Bitcoin Legacy, SegWit и Taproot?",
    "faq3A": "Legacy (P2PKH, начинается с 1) — оригинальный формат. SegWit (P2WPKH, bc1q) использует кодировку Bech32 с более низкими комиссиями. Taproot (P2TR, bc1p) — новейший формат с улучшенной конфиденциальностью."
  }
}
```

- [ ] **Step 10: Add wallet entry to `public/locales/ru/tools.json`**

```json
  "wallet": {
    "title": "Генератор HD-кошелька - Мнемоническая фраза BIP39 и мультичейн-адресная деривация",
    "shortTitle": "HD-кошелёк",
    "description": "Генерируйте мнемонические фразы BIP39 и деривируйте адреса криптовалют для EVM, Bitcoin, Solana, Tron и Cosmos. Бесплатный онлайн-инструмент, 100% в браузере."
  }
```

- [ ] **Step 11: Commit Latin translations**

```bash
git add public/locales/es/wallet.json public/locales/es/tools.json public/locales/pt-BR/wallet.json public/locales/pt-BR/tools.json public/locales/fr/wallet.json public/locales/fr/tools.json public/locales/de/wallet.json public/locales/de/tools.json public/locales/ru/wallet.json public/locales/ru/tools.json
git commit -m "feat(wallet): add Latin translations (es, pt-BR, fr, de, ru)"
```

---

## Final Verification

- [ ] **Run full test suite**

```bash
npx vitest run
```

Expected: All tests pass (wallet + existing tests including tool-relations).

- [ ] **Verify page loads in browser**

```bash
npx next dev --port 3099
```

Open `http://localhost:3099/wallet` and verify:

1. Page renders with Layout, PrivacyBanner
2. Mnemonic textarea visible with Generate button
3. Path editor shows m / 44' / 60' / 0' / 0 / {index}
4. Chain checkboxes visible and grouped by curve type
5. Clicking Generate creates a valid 12-word mnemonic
6. Selecting chains shows NeonTabs with derivation results
7. Switching locales (`/zh-CN/wallet`) shows Chinese text
