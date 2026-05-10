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
import {
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  ChevronUp,
  CircleHelp,
} from "lucide-react";

const PRIVATE_KEY_REVEAL_MS = 5000;

function loadChainsFromStorage(): string[] {
  if (typeof window === "undefined") return DEFAULT_SELECTED_CHAINS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.walletSelectedChains);
    const saved = raw ? JSON.parse(raw) : null;
    return saved && saved.length > 0 ? saved : DEFAULT_SELECTED_CHAINS;
  } catch {
    return DEFAULT_SELECTED_CHAINS;
  }
}

export default function WalletPage() {
  const t = useTranslations("wallet");
  const tc = useTranslations("common");
  const ts = useTranslations("tools");

  const [mnemonic, setMnemonic] = useState("");
  const [wordCount, setWordCount] = useState<128 | 256>(128);
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);

  const [purpose, setPurpose] = useState(44);
  const [account, setAccount] = useState(0);
  const [change, setChange] = useState(0);
  const [addressCount, setAddressCount] = useState(5);

  const [selectedChains, setSelectedChains] = useState<string[]>(() => loadChainsFromStorage());
  const [activeChain, setActiveChain] = useState(0);

  const [expandedRows, setExpandedRows] = useState<Record<string, number | null>>({});
  const [revealedKeys, setRevealedKeys] = useState<Record<string, Set<number>>>({});
  const revealTimers = useRef<Record<string, Record<number, ReturnType<typeof setTimeout>>>>({});

  const validation: MnemonicValidationResult = mnemonic.trim()
    ? validateMnemonicPhrase(mnemonic)
    : { valid: false };

  const derivedResults: Record<string, DerivedAccount[]> =
    validation.valid && selectedChains.length > 0
      ? (() => {
          const seed = mnemonicToSeed(mnemonic, passphrase || undefined);
          const results: Record<string, DerivedAccount[]> = {};
          for (const chainKey of selectedChains) {
            const chain = CHAINS.find((c) => c.key === chainKey);
            if (!chain) continue;
            try {
              results[chainKey] = deriveAccounts(
                seed,
                chain,
                purpose,
                account,
                change,
                addressCount
              );
            } catch {
              results[chainKey] = [];
            }
          }
          return results;
        })()
      : {};

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

  function getActiveChainConfig(): ChainConfig | undefined {
    return CHAINS.find((c) => c.key === selectedChains[activeChain]);
  }

  function handleGenerate() {
    const mn = generateMnemonic(wordCount);
    setMnemonic(mn);
  }

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

  const secpChains = CHAINS.filter((c) => c.curve === "secp256k1");
  const edChains = CHAINS.filter((c) => c.curve === "ed25519");

  return (
    <Layout
      title={ts("wallet.shortTitle")}
      categoryLabel={ts("categories.security")}
      categorySlug="security-crypto"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner />

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

        <section className="mt-6 space-y-3">
          <label className="text-sm font-medium text-fg-primary">{t("chainSelection.label")}</label>

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
                      {accounts.length > 0 && (
                        <p className="text-xs text-fg-muted font-mono">
                          {t("results.pathUsed")}: {accounts[0].path.replace(/\/\d+['"]?$/, "/{i}")}
                        </p>
                      )}

                      <div className="divide-y divide-border-default">
                        {accounts.map((acc, idx) => {
                          const isExpanded = expandedRows[chainKey] === idx;
                          const isRevealed = revealedKeys[chainKey]?.has(idx) ?? false;
                          return (
                            <div key={idx}>
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() =>
                                  setExpandedRows((prev) => ({
                                    ...prev,
                                    [chainKey]: prev[chainKey] === idx ? null : idx,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setExpandedRows((prev) => ({
                                      ...prev,
                                      [chainKey]: prev[chainKey] === idx ? null : idx,
                                    }));
                                  }
                                }}
                                className="w-full flex items-center gap-3 py-2.5 px-2 hover:bg-bg-surface/50 rounded text-left cursor-pointer"
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
                              </div>

                              {isExpanded && (
                                <div className="pl-8 pr-2 pb-3 space-y-2">
                                  {chain.showPublicKey && acc.publicKey && (
                                    <DetailRow
                                      label={acc.publicKeyLabel ?? t("results.publicKey")}
                                      value={acc.publicKey}
                                    />
                                  )}

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
                                      <CopyButton getContent={() => acc.privateKey} />
                                    </div>
                                  </div>

                                  {acc.privateKeyAlt && (
                                    <SensitiveRow
                                      label={acc.privateKeyAltLabel ?? ""}
                                      value={acc.privateKeyAlt}
                                      isRevealed={
                                        revealedKeys[chainKey + ":alt"]?.has(idx) ?? false
                                      }
                                      onToggle={() => toggleReveal(chainKey + ":alt", idx)}
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

        <Description />
        <RelatedTools currentTool="wallet" />
      </div>
    </Layout>
  );
}

function Description() {
  const t = useTranslations("wallet");
  const tc = useTranslations("common");

  const descriptionSections = [
    { title: t("descriptions.whatIsTitle"), content: t("descriptions.whatIs") },
    { title: t("descriptions.bip39Title"), content: t("descriptions.bip39") },
    { title: t("descriptions.bip32Title"), content: t("descriptions.bip32") },
    { title: t("descriptions.bip44Title"), content: t("descriptions.bip44") },
    { title: t("descriptions.securityTitle"), content: t("descriptions.security") },
  ];

  const faqItems = [1, 2, 3].map((i) => ({
    title: t(`descriptions.faq${i}Q`),
    content: (
      <p className="text-sm text-fg-secondary leading-relaxed">{t(`descriptions.faq${i}A`)}</p>
    ),
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
      {hardened && <span className="text-fg-muted text-sm ml-0.5">{"'"}</span>}
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

function SensitiveRow({
  label,
  value,
  isRevealed,
  onToggle,
}: {
  label: string;
  value: string;
  isRevealed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-fg-muted w-32 shrink-0 pt-0.5">{label}</span>
      <div className="flex-1 flex items-start gap-2">
        <code className="text-xs font-mono text-fg-primary break-all flex-1">
          {isRevealed ? value : "•••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
        </code>
        <button
          type="button"
          onClick={onToggle}
          className="text-fg-muted hover:text-fg-secondary shrink-0 mt-0.5"
        >
          {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <CopyButton getContent={() => value} />
      </div>
    </div>
  );
}
