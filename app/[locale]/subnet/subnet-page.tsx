"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import { StyledInput } from "../../../components/ui/input";
import { StyledSelect } from "../../../components/ui/input";
import { CopyButton } from "../../../components/ui/copy-btn";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { NeonTabs } from "../../../components/ui/tabs";
import { Accordion } from "../../../components/ui/accordion";
import RelatedTools from "../../../components/related-tools";
import DescriptionSection from "../../../components/description-section";
import {
  type IPVersion,
  type CIDRInfo,
  type SubnetResult,
  type VLSMEntry,
  type BitsVisualization as BitsViz,
  calculateCIDR,
  parseIP,
  parseCIDR,
  getBitsVisualization,
  isSameSubnet,
  subnetSplitByCount,
  subnetSplitByHosts,
  vlsmAllocate,
  cidrToMask,
} from "../../../libs/subnet/main";
import { Trash2, Plus, Check, X } from "lucide-react";

function IPVersionToggle({
  value,
  onChange,
}: {
  value: IPVersion;
  onChange: (v: IPVersion) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-border-default overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(4)}
        className={
          "px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer " +
          (value === 4
            ? "bg-accent-cyan text-bg-base"
            : "bg-transparent text-fg-secondary hover:bg-bg-elevated")
        }
      >
        IPv4
      </button>
      <button
        type="button"
        onClick={() => onChange(6)}
        className={
          "px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer " +
          (value === 6
            ? "bg-accent-cyan text-bg-base"
            : "bg-transparent text-fg-secondary hover:bg-bg-elevated")
        }
      >
        IPv6
      </button>
    </div>
  );
}

function ResultField({ label, value }: { label: string; value: string }) {
  if (!value && value !== "0") return null;
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm text-fg-secondary shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-mono text-sm text-fg-primary truncate">{value}</span>
        <CopyButton getContent={() => value} />
      </div>
    </div>
  );
}

function BitsView({ viz, version }: { viz: BitsViz; version: IPVersion }) {
  const t = useTranslations("subnet");
  const [expanded, setExpanded] = useState(false);

  if (version === 4) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-fg-muted mb-1">
          <span className="text-accent-cyan">{t("cidr.networkBits")}</span>
          <span className="text-accent-purple">{t("cidr.hostBits")}</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-xs">
          {Array.from({ length: 4 }, (_, octet) => (
            <span key={octet} className="flex items-center gap-0.5">
              {octet > 0 && <span className="text-fg-muted mx-0.5">.</span>}
              {Array.from({ length: 8 }, (_, bit) => {
                const idx = octet * 8 + bit;
                const isNetwork = idx < viz.prefixLength;
                return (
                  <span
                    key={bit}
                    className={isNetwork ? "text-accent-cyan font-bold" : "text-accent-purple"}
                  >
                    {viz.bits[idx]}
                  </span>
                );
              })}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const displayBits = expanded ? viz.bits : viz.bits.slice(0, 32);
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs text-fg-muted mb-1">
        <span className="text-accent-cyan">{t("cidr.networkBits")}</span>
        <span className="text-accent-purple">{t("cidr.hostBits")}</span>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-accent-cyan hover:underline cursor-pointer"
        >
          {expanded ? t("cidr.collapse") : t("cidr.expand")}
        </button>
      </div>
      <div className="font-mono text-xs leading-relaxed break-all">
        {Array.from({ length: Math.ceil(displayBits.length / 16) }, (_, group) => (
          <span key={group}>
            {group > 0 && <span className="text-fg-muted">{group % 4 === 0 ? "  " : " "}</span>}
            {Array.from({ length: 16 }, (_, bit) => {
              const idx = group * 16 + bit;
              if (idx >= displayBits.length) return null;
              const isNetwork = idx < viz.prefixLength;
              return (
                <span
                  key={bit}
                  className={isNetwork ? "text-accent-cyan font-bold" : "text-accent-purple"}
                >
                  {displayBits[idx]}
                </span>
              );
            })}
          </span>
        ))}
        {!expanded && <span className="text-fg-muted">…</span>}
      </div>
    </div>
  );
}

function CIDRCalculator({ version }: { version: IPVersion }) {
  const t = useTranslations("subnet");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<CIDRInfo | null>(null);
  const [error, setError] = useState("");
  const [ip1, setIp1] = useState("");
  const [ip2, setIp2] = useState("");

  function handleInput(value: string) {
    setInput(value);
    if (!value.trim()) {
      setResult(null);
      setError("");
      return;
    }
    try {
      const info = calculateCIDR(value);
      setResult(info);
      setError("");
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Invalid input");
    }
  }

  let bitsViz: BitsViz | null = null;
  if (result) {
    try {
      const parsed = parseIP(result.networkAddress);
      bitsViz = getBitsVisualization(parsed.value, result.prefixLength, result.version);
    } catch {}
  }

  const sameSubnetResult =
    ip1.trim() && ip2.trim() && result
      ? (() => {
          try {
            return isSameSubnet(ip1, ip2, result.prefixLength);
          } catch {
            return null;
          }
        })()
      : null;

  return (
    <div className="space-y-4">
      <StyledInput
        value={input}
        onChange={(e) => handleInput(e.target.value)}
        placeholder={t("cidr.placeholder")}
        className="font-mono"
      />

      {error && <p className="text-danger text-sm">{error}</p>}

      {result && (
        <div className="space-y-1">
          <ResultField label={t("cidr.networkAddress")} value={result.networkAddress} />
          {result.broadcastAddress && (
            <ResultField label={t("cidr.broadcastAddress")} value={result.broadcastAddress} />
          )}
          <ResultField label={t("cidr.firstHost")} value={result.firstHost} />
          <ResultField label={t("cidr.lastHost")} value={result.lastHost} />
          <ResultField label={t("cidr.usableHosts")} value={result.usableHosts.toString()} />
          <ResultField label={t("cidr.totalHosts")} value={result.totalHosts.toString()} />
          {result.subnetMask && (
            <ResultField label={t("cidr.subnetMask")} value={result.subnetMask} />
          )}
          <ResultField
            label={t("cidr.cidrNotation")}
            value={`${result.networkAddress}/${result.prefixLength}`}
          />
          {result.ipClass && (
            <div className="flex items-center justify-between gap-3 py-1.5">
              <span className="text-sm text-fg-secondary">{t("cidr.ipClass")}</span>
              <Badge variant="cyan">{t(`ipClass.${result.ipClass.toLowerCase()}` as any)}</Badge>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 py-1.5">
            <span className="text-sm text-fg-secondary">{t("cidr.addressType")}</span>
            <Badge variant="purple">{t(`addressType.${result.addressType}` as any)}</Badge>
          </div>

          {bitsViz && (
            <div className="mt-3 p-3 bg-bg-input rounded-lg border border-border-subtle">
              <div className="text-xs font-medium text-fg-muted mb-2">{t("cidr.binaryView")}</div>
              <BitsView viz={bitsViz} version={version} />
            </div>
          )}
        </div>
      )}

      <Accordion
        items={[
          {
            title: t("ipCheck.title"),
            content: (
              <div className="space-y-3">
                <StyledInput
                  value={ip1}
                  onChange={(e) => setIp1(e.target.value)}
                  placeholder={t("ipCheck.ip1")}
                  className="font-mono"
                />
                <StyledInput
                  value={ip2}
                  onChange={(e) => setIp2(e.target.value)}
                  placeholder={t("ipCheck.ip2")}
                  className="font-mono"
                />
                {sameSubnetResult !== null && (
                  <div className="flex items-center gap-2">
                    {sameSubnetResult ? (
                      <>
                        <Check size={16} className="text-accent-cyan" />
                        <span className="text-sm text-accent-cyan font-medium">
                          {t("ipCheck.sameSubnet")}
                        </span>
                      </>
                    ) : (
                      <>
                        <X size={16} className="text-danger" />
                        <span className="text-sm text-danger font-medium">
                          {t("ipCheck.differentSubnet")}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

function SubnetSplitter({ version }: { version: IPVersion }) {
  const t = useTranslations("subnet");
  const tc = useTranslations("common");
  const [parentCidr, setParentCidr] = useState("");
  const [splitMode, setSplitMode] = useState<"count" | "hosts">("count");
  const [count, setCount] = useState("2");
  const [results, setResults] = useState<SubnetResult[]>([]);
  const [error, setError] = useState("");

  function handleCalculate() {
    if (!parentCidr.trim()) {
      setError(tc("fillRequired"));
      return;
    }
    try {
      const { ip, prefixLength } = parseCIDR(parentCidr);
      const networkAddr =
        ip.version === 4
          ? `${((ip.value >> 24n) & 0xffn).toString()}.${((ip.value >> 16n) & 0xffn).toString()}.${((ip.value >> 8n) & 0xffn).toString()}.${(ip.value & 0xffn).toString()}`
          : parentCidr.split("/")[0].trim();
      const num = parseInt(count, 10);
      if (isNaN(num) || num <= 0) {
        setError(tc("fillRequired"));
        return;
      }
      const subnets =
        splitMode === "count"
          ? subnetSplitByCount(networkAddr, prefixLength, num)
          : subnetSplitByHosts(networkAddr, prefixLength, num);
      setResults(subnets);
      setError("");
    } catch (e) {
      setResults([]);
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StyledInput
          value={parentCidr}
          onChange={(e) => setParentCidr(e.target.value)}
          placeholder={t("split.parentCidr")}
          className="font-mono"
        />
        <div className="flex gap-2">
          <StyledSelect
            value={splitMode}
            onChange={(e) => setSplitMode(e.target.value as "count" | "hosts")}
            className="shrink-0"
          >
            <option value="count">{t("split.bySubnetCount")}</option>
            <option value="hosts">{t("split.byHostCount")}</option>
          </StyledSelect>
          <StyledInput
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder={splitMode === "count" ? t("split.subnetCount") : t("split.hostCount")}
            className="font-mono"
            min="1"
          />
        </div>
      </div>
      <Button variant="primary" size="sm" onClick={handleCalculate}>
        {t("split.title")}
      </Button>

      {error && <p className="text-danger text-sm">{error}</p>}

      {results.length > 0 && (
        <div className="overflow-x-auto">
          {results.length > 256 && (
            <p className="text-fg-muted text-xs mb-2">{t("split.tooManyToVisualize")}</p>
          )}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default text-fg-muted text-xs">
                <th className="py-2 px-2 text-left">{t("split.tableHeaders.index")}</th>
                <th className="py-2 px-2 text-left">{t("split.tableHeaders.network")}</th>
                {version === 4 && (
                  <th className="py-2 px-2 text-left">{t("split.tableHeaders.broadcast")}</th>
                )}
                <th className="py-2 px-2 text-left">{t("split.tableHeaders.hostRange")}</th>
                <th className="py-2 px-2 text-left">{t("split.tableHeaders.usableHosts")}</th>
                {version === 4 && (
                  <th className="py-2 px-2 text-left">{t("split.tableHeaders.subnetMask")}</th>
                )}
                <th className="py-2 px-2 text-left">{t("split.tableHeaders.cidr")}</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.index} className="border-b border-border-subtle hover:bg-bg-elevated/50">
                  <td className="py-2 px-2 text-fg-muted">{r.index + 1}</td>
                  <td className="py-2 px-2 font-mono text-fg-primary">{r.networkAddress}</td>
                  {version === 4 && (
                    <td className="py-2 px-2 font-mono text-fg-primary">
                      {r.broadcastAddress ?? ""}
                    </td>
                  )}
                  <td className="py-2 px-2 font-mono text-fg-secondary text-xs">
                    {r.firstHost} – {r.lastHost}
                  </td>
                  <td className="py-2 px-2 font-mono text-fg-primary">
                    {r.usableHosts.toString()}
                  </td>
                  {version === 4 && (
                    <td className="py-2 px-2 font-mono text-fg-secondary">{r.subnetMask}</td>
                  )}
                  <td className="py-2 px-2 font-mono text-accent-cyan">/{r.prefixLength}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function VLSMAllocator({ version }: { version: IPVersion }) {
  const t = useTranslations("subnet");
  const tc = useTranslations("common");
  const [parentCidr, setParentCidr] = useState("");
  const [entries, setEntries] = useState<Array<{ name: string; hosts: string }>>([
    { name: "", hosts: "" },
  ]);
  const [results, setResults] = useState<VLSMEntry[]>([]);
  const [error, setError] = useState("");
  const [freeSpace, setFreeSpace] = useState<string>("");

  function addRow() {
    setEntries([...entries, { name: "", hosts: "" }]);
  }

  function removeRow(index: number) {
    setEntries(entries.filter((_, i) => i !== index));
  }

  function updateEntry(index: number, field: "name" | "hosts", value: string) {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  }

  function handleAllocate() {
    if (!parentCidr.trim()) {
      setError(tc("fillRequired"));
      return;
    }
    const validEntries = entries
      .filter((e) => e.hosts.trim())
      .map((e) => ({
        name: e.name.trim() || `Subnet ${entries.indexOf(e) + 1}`,
        requiredHosts: parseInt(e.hosts, 10),
      }))
      .filter((e) => !isNaN(e.requiredHosts) && e.requiredHosts > 0);

    if (validEntries.length === 0) {
      setError(tc("fillRequired"));
      return;
    }

    try {
      const { ip, prefixLength } = parseCIDR(parentCidr);
      const maxBits = ip.version === 4 ? 32 : 128;
      const networkAddr = parentCidr.split("/")[0].trim();
      const allocated = vlsmAllocate(networkAddr, prefixLength, validEntries);
      setResults(allocated);
      setError("");

      const totalParentSize = 1n << BigInt(maxBits - prefixLength);
      const networkValue =
        ip.value &
        ((maxBits === 32 ? 0xffffffffn : (1n << 128n) - 1n) << BigInt(maxBits - prefixLength));
      let usedSize = 0n;
      for (const entry of allocated) {
        const entryPrefix = entry.allocatedPrefix;
        usedSize += 1n << BigInt(maxBits - entryPrefix);
      }
      const free = totalParentSize - usedSize;
      setFreeSpace(free.toString());
    } catch (e) {
      setResults([]);
      setFreeSpace("");
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div className="space-y-4">
      <StyledInput
        value={parentCidr}
        onChange={(e) => setParentCidr(e.target.value)}
        placeholder={t("vlsm.parentCidr")}
        className="font-mono"
      />

      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_120px_32px] gap-2 text-xs text-fg-muted">
          <span>{t("vlsm.subnetName")}</span>
          <span>{t("vlsm.requiredHosts")}</span>
          <span></span>
        </div>
        {entries.map((entry, i) => (
          <div key={i} className="grid grid-cols-[1fr_120px_32px] gap-2 items-center">
            <StyledInput
              value={entry.name}
              onChange={(e) => updateEntry(i, "name", e.target.value)}
              placeholder={t("vlsm.subnetName")}
              className="text-sm"
            />
            <StyledInput
              type="number"
              value={entry.hosts}
              onChange={(e) => updateEntry(i, "hosts", e.target.value)}
              placeholder={t("vlsm.requiredHosts")}
              className="font-mono text-sm"
              min="1"
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="text-fg-muted hover:text-danger transition-colors cursor-pointer"
              title={t("vlsm.deleteRow")}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline-cyan" size="sm" onClick={addRow}>
          <Plus size={14} />
          {t("vlsm.addSubnet")}
        </Button>
        <Button variant="primary" size="sm" onClick={handleAllocate}>
          {t("vlsm.title")}
        </Button>
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default text-fg-muted text-xs">
                  <th className="py-2 px-2 text-left">Name</th>
                  <th className="py-2 px-2 text-left">{t("split.tableHeaders.network")}</th>
                  <th className="py-2 px-2 text-left">/{t("split.tableHeaders.cidr")}</th>
                  <th className="py-2 px-2 text-left">{t("split.tableHeaders.hostRange")}</th>
                  <th className="py-2 px-2 text-left">{t("split.tableHeaders.usableHosts")}</th>
                  {version === 4 && (
                    <th className="py-2 px-2 text-left">{t("split.tableHeaders.subnetMask")}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-b border-border-subtle hover:bg-bg-elevated/50">
                    <td className="py-2 px-2 text-fg-primary font-medium">{r.name}</td>
                    <td className="py-2 px-2 font-mono text-fg-primary">{r.networkAddress}</td>
                    <td className="py-2 px-2 font-mono text-accent-cyan">/{r.allocatedPrefix}</td>
                    <td className="py-2 px-2 font-mono text-fg-secondary text-xs">
                      {r.firstHost} – {r.lastHost}
                    </td>
                    <td className="py-2 px-2 font-mono text-fg-primary">
                      {r.usableHosts.toString()}
                    </td>
                    {version === 4 && (
                      <td className="py-2 px-2 font-mono text-fg-secondary">{r.subnetMask}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {freeSpace && (
            <div className="text-sm text-fg-secondary">
              {t("vlsm.freeSpace")}: <span className="font-mono text-fg-primary">{freeSpace}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SubnetConverter() {
  const t = useTranslations("subnet");
  const [version, setVersion] = useState<IPVersion>(4);
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <div className="space-y-4">
      <IPVersionToggle value={version} onChange={setVersion} />
      <NeonTabs
        selectedIndex={tabIndex}
        onChange={setTabIndex}
        tabs={[
          {
            label: "CIDR",
            content: <CIDRCalculator version={version} />,
          },
          {
            label: t("split.title"),
            content: <SubnetSplitter version={version} />,
          },
          {
            label: t("vlsm.title"),
            content: <VLSMAllocator version={version} />,
          },
        ]}
      />
    </div>
  );
}

export default function SubnetPage() {
  const ts = useTranslations("tools");
  const title = ts("subnet.shortTitle");

  return (
    <Layout
      title={title}
      categoryLabel={ts("categories.reference")}
      categorySlug="reference-lookup"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <SubnetConverter />
        <DescriptionSection namespace="subnet" />
        <RelatedTools currentTool="subnet" />
      </div>
    </Layout>
  );
}
