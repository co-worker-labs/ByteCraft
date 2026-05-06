"use client";

import { useState } from "react";
import { Download, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import { Button } from "../../../components/ui/button";
import { CopyButton } from "../../../components/ui/copy-btn";
import { NeonTabs } from "../../../components/ui/tabs";
import { LineNumberedTextarea } from "../../../components/ui/line-numbered-textarea";
import { showToast } from "../../../libs/toast";
import { STORAGE_KEYS } from "../../../libs/storage-keys";
import { generateKeyPair, parsePublicKey } from "../../../libs/sshkey/main";
import type { SshKeyResult, PublicKeyInfo } from "../../../libs/sshkey/main";

type KeyType = "rsa" | "ed25519";

const INPUT_CLASS =
  "bg-bg-input border border-border-default rounded-lg px-3 py-2 text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan focus:shadow-input-focus transition-all duration-200";

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function GeneratePanel() {
  const t = useTranslations("sshkey");

  const [keyType, setKeyType] = useState<KeyType>("ed25519");
  const [rsaBits, setRsaBits] = useState(4096);
  const [comment, setComment] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<SshKeyResult | null>(null);
  const [deployTarget, setDeployTarget] = useState(() => {
    if (typeof window === "undefined") return "user@host";
    return localStorage.getItem(STORAGE_KEYS.sshkeyDeployTarget) || "user@host";
  });

  const privFilename = keyType === "rsa" ? "id_rsa" : "id_ed25519";
  const pubFilename = keyType === "rsa" ? "id_rsa.pub" : "id_ed25519.pub";

  async function handleGenerate() {
    setGenerating(true);
    try {
      const r = await generateKeyPair({
        type: keyType,
        rsaBits: rsaBits as 2048 | 3072 | 4096,
        comment: comment || undefined,
        passphrase: passphrase || undefined,
      });
      setResult(r);
    } catch (e: any) {
      showToast(e.message || "Generation failed", "danger");
    } finally {
      setGenerating(false);
    }
  }

  function handleDeployTargetChange(val: string) {
    setDeployTarget(val);
    localStorage.setItem(STORAGE_KEYS.sshkeyDeployTarget, val);
  }

  const deployCmd = result ? `ssh-copy-id -i ${pubFilename} ${deployTarget}` : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg overflow-hidden border border-border-default">
          <button
            onClick={() => setKeyType("rsa")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${keyType === "rsa" ? "bg-accent-cyan text-bg-base" : "bg-bg-surface text-fg-primary hover:bg-bg-elevated"}`}
          >
            RSA
          </button>
          <button
            onClick={() => setKeyType("ed25519")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${keyType === "ed25519" ? "bg-accent-cyan text-bg-base" : "bg-bg-surface text-fg-primary hover:bg-bg-elevated"}`}
          >
            Ed25519
          </button>
        </div>

        {keyType === "rsa" && (
          <select
            value={rsaBits}
            onChange={(e) => setRsaBits(Number(e.target.value))}
            className={INPUT_CLASS}
          >
            <option value={2048}>2048</option>
            <option value={3072}>3072</option>
            <option value={4096}>4096</option>
          </select>
        )}

        <input
          placeholder={t("commentPlaceholder")}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className={`${INPUT_CLASS} flex-1 min-w-[150px]`}
        />

        <div className="relative flex-1 min-w-[150px]">
          <input
            type={showPass ? "text" : "password"}
            placeholder={t("passphrasePlaceholder")}
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className={`${INPUT_CLASS} w-full pr-8`}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg-primary"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <Button variant="primary" onClick={handleGenerate} disabled={generating}>
          <RefreshCw size={14} className={generating ? "animate-spin" : ""} />
          {generating ? t("generating") : t("generate")}
        </Button>
      </div>

      {result && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-fg-primary">{t("privateKey")}</span>
              <CopyButton getContent={() => result.privateKey} />
              <button
                onClick={() => downloadFile(result.privateKey + "\n", privFilename)}
                className="text-fg-muted hover:text-accent-cyan transition-colors"
                title={t("downloadPrivate")}
              >
                <Download size={14} />
              </button>
            </div>
            <LineNumberedTextarea
              value={result.privateKey}
              readOnly
              showLineNumbers
              autoGrow
              className="font-mono text-xs"
              rows={4}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-fg-primary">{t("publicKey")}</span>
              <CopyButton getContent={() => result.publicKey} />
              <button
                onClick={() => downloadFile(result.publicKey + "\n", pubFilename)}
                className="text-fg-muted hover:text-accent-cyan transition-colors"
                title={t("downloadPublic")}
              >
                <Download size={14} />
              </button>
            </div>
            <LineNumberedTextarea
              value={result.publicKey}
              readOnly
              showLineNumbers
              autoGrow
              className="font-mono text-xs"
              rows={2}
            />
          </div>

          <div>
            <span className="text-sm font-medium text-fg-primary">{t("fingerprint")}</span>
            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-2">
                <code className="text-xs text-fg-secondary">{result.fingerprintSha256}</code>
                <CopyButton getContent={() => result.fingerprintSha256} />
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs text-fg-secondary">{result.fingerprintMd5}</code>
                <CopyButton getContent={() => result.fingerprintMd5} />
              </div>
            </div>
          </div>

          <div>
            <span className="text-sm font-medium text-fg-primary">{t("randomart")}</span>
            <pre className="mt-1 text-xs text-fg-muted leading-tight font-mono">
              {result.randomart}
            </pre>
          </div>

          <div>
            <span className="text-sm font-medium text-fg-primary">{t("quickDeploy")}</span>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-xs text-fg-secondary flex-1 break-all">
                ssh-copy-id -i {pubFilename}{" "}
                <input
                  type="text"
                  value={deployTarget}
                  onChange={(e) => handleDeployTargetChange(e.target.value)}
                  className="bg-transparent border-b border-border-default text-xs text-fg-secondary outline-none w-28"
                />
              </code>
              <CopyButton getContent={() => deployCmd} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InspectPanel() {
  const t = useTranslations("sshkey");
  const [input, setInput] = useState("");
  const [info, setInfo] = useState<PublicKeyInfo | null>(null);
  const [error, setError] = useState("");

  async function handleInput(val: string) {
    setInput(val);
    if (!val.trim()) {
      setInfo(null);
      setError("");
      return;
    }
    const result = await parsePublicKey(val);
    if ("error" in result) {
      setError(result.error);
      setInfo(null);
    } else {
      setError("");
      setInfo(result);
    }
  }

  return (
    <div className="space-y-4">
      <textarea
        value={input}
        onChange={(e) => handleInput(e.target.value)}
        placeholder={t("inspectPlaceholder")}
        className="w-full bg-bg-input border border-border-default rounded-lg px-3 py-2 text-sm text-fg-primary font-mono focus:outline-none focus:border-accent-cyan"
        rows={3}
      />

      {error && <p className="text-sm text-danger">{error}</p>}

      {info && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-fg-muted">{t("inspectKeyType")}</span>
              <p className="text-sm font-medium text-fg-primary">{info.type}</p>
            </div>
            <div>
              <span className="text-xs text-fg-muted">{t("inspectBits")}</span>
              <p className="text-sm font-medium text-fg-primary">{info.bits} bits</p>
            </div>
            <div>
              <span className="text-xs text-fg-muted">{t("inspectComment")}</span>
              <p className="text-sm font-medium text-fg-primary">{info.comment || "—"}</p>
            </div>
          </div>

          <div>
            <span className="text-sm font-medium text-fg-primary">{t("fingerprint")}</span>
            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-2">
                <code className="text-xs text-fg-secondary">{info.fingerprintSha256}</code>
                <CopyButton getContent={() => info.fingerprintSha256} />
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs text-fg-secondary">{info.fingerprintMd5}</code>
                <CopyButton getContent={() => info.fingerprintMd5} />
              </div>
            </div>
          </div>

          <div>
            <span className="text-sm font-medium text-fg-primary">{t("randomart")}</span>
            <pre className="mt-1 text-xs text-fg-muted leading-tight font-mono">
              {info.randomart}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SshKeyPage() {
  const t = useTranslations("sshkey");
  const ts = useTranslations("tools");

  return (
    <Layout title={ts("sshkey.shortTitle")}>
      <div className="space-y-4">
        <span className="text-sm text-fg-secondary leading-relaxed">{t("localGenerated")}</span>

        <NeonTabs
          tabs={[
            { label: t("tabGenerate"), content: <GeneratePanel /> },
            { label: t("tabInspect"), content: <InspectPanel /> },
          ]}
        />
      </div>
    </Layout>
  );
}
