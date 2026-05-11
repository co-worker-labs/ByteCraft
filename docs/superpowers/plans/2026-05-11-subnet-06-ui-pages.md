# Subnet Calculator — UI Pages

## Overview

Create the two page files for the Subnet Calculator tool (`/subnet`):

- `app/[locale]/subnet/page.tsx` — route entry with SEO metadata + JSON-LD
- `app/[locale]/subnet/subnet-page.tsx` — "use client" component with all UI and logic

---

## Task 10: Create `page.tsx`

**File:** `app/[locale]/subnet/page.tsx`

Follow the exact pattern from `numbase/page.tsx`. Use the spec-provided code below — it is complete and requires no modification.

```tsx
import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import SubnetPage from "./subnet-page";

const PATH = "/subnet";
const TOOL_KEY = "subnet";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("subnet.title"),
    description: t("subnet.description"),
    ogImage: {
      title: t("subnet.shortTitle"),
      emoji: tool.emoji,
      desc: t("subnet.description"),
    },
  });
}

export default async function SubnetRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "subnet" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

  const faqCount = 3;
  const faqItems = Array.from({ length: faqCount }, (_, i) => {
    const qKey = `descriptions.faq${i + 1}Q`;
    return tx.has(qKey) ? { q: tx(qKey), a: tx(`descriptions.faq${i + 1}A`) } : null;
  }).filter((item): item is { q: string; a: string } => item !== null);

  const howToStepCount = 3;
  const howToSteps = Array.from({ length: howToStepCount }, (_, i) => {
    const nameKey = `descriptions.step${i + 1}Title`;
    return tx.has(nameKey)
      ? {
          name: tx(nameKey),
          text: tx.has(`descriptions.step${i + 1}Text`) ? tx(`descriptions.step${i + 1}Text`) : "",
        }
      : null;
  }).filter((step): step is { name: string; text: string } => step !== null);

  const schemas = buildToolSchemas({
    name: t("subnet.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("subnet.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems,
    howToSteps,
    sameAs: tool.sameAs,
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
      <SubnetPage />
    </>
  );
}
```

### Acceptance Criteria

- [ ] File imports compile without errors
- [ ] `generateMetadata` returns valid Next.js metadata for the `/subnet` route
- [ ] JSON-LD schemas are injected via `<script>` tags
- [ ] `<SubnetPage />` is rendered as the client component

---

## Task 11: Create `subnet-page.tsx`

**File:** `app/[locale]/subnet/subnet-page.tsx`

This is the largest task. The file will be ~700-800 lines. It must be a complete `"use client"` component with all three tabs, IP version toggle, and all UI interactions.

### Architecture

```
subnet-page.tsx
├── IPVersionToggle        — pill-style IPv4/IPv6 selector
├── NeonTabs               — 3 tabs (CIDR / Splitter / VLSM)
│   ├── CIDRCalculator     — Tab 1
│   │   ├── StyledInput    — IP/CIDR input
│   │   ├── ResultGrid     — 2-col results + bit viz
│   │   └── IPBelongsToSubnet — Accordion below results
│   ├── SubnetSplitter     — Tab 2
│   │   ├── Inputs         — parent CIDR + split mode + count
│   │   ├── AddressSpaceViz — horizontal bar chart
│   │   └── SubnetTable    — result table
│   └── VLSMAllocator      — Tab 3
│       ├── DynamicRows    — name + hosts inputs
│       ├── AddressSpaceViz — uneven bar chart
│       └── VLSMTable      — result table
├── DescriptionSection     — from components
└── RelatedTools           — from components
```

### Complete Code

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";
import NeonTabs from "../../../components/ui/tabs";
import { StyledInput, StyledSelect } from "../../../components/ui/input";
import StyledTextarea from "../../../components/ui/styled-textarea";
import CopyButton from "../../../components/ui/copy-btn";
import Badge from "../../../components/ui/badge";
import Button from "../../../components/ui/button";
import Accordion from "../../../components/ui/accordion";
import DescriptionSection from "../../../components/description-section";
import RelatedTools from "../../../components/related-tools";
import { showToast } from "../../../libs/toast";
import {
  parseIP,
  formatIP,
  parseCIDR,
  calculateCIDR,
  isSameSubnet,
  getBitsVisualization,
  getAddressType,
  getIPClass,
  cidrToMask,
  maskToCidr,
  subnetSplitByCount,
  subnetSplitByHosts,
  vlsmAllocate,
  type CIDRInfo,
  type SubnetResult,
  type VLSMEntry,
  type BitsVisualization,
  type IPVersion,
} from "../../../libs/subnet/main";

const TOOL_ICON_COLORS = [
  "var(--tool-icon-0)",
  "var(--tool-icon-1)",
  "var(--tool-icon-2)",
  "var(--tool-icon-3)",
  "var(--tool-icon-4)",
  "var(--tool-icon-5)",
  "var(--tool-icon-6)",
  "var(--tool-icon-7)",
  "var(--tool-icon-8)",
  "var(--tool-icon-9)",
  "var(--tool-icon-10)",
  "var(--tool-icon-11)",
  "var(--tool-icon-12)",
  "var(--tool-icon-13)",
  "var(--tool-icon-14)",
  "var(--tool-icon-15)",
  "var(--tool-icon-16)",
  "var(--tool-icon-17)",
  "var(--tool-icon-18)",
  "var(--tool-icon-19)",
];

function detectIPVersion(input: string): IPVersion | null {
  if (!input.trim()) return null;
  if (input.includes(":")) return "ipv6";
  if (/^\d{1,3}(\.\d{1,3}){0,3}/.test(input.trim())) return "ipv4";
  return null;
}

function IPVersionToggle({
  version,
  onChange,
}: {
  version: IPVersion;
  onChange: (v: IPVersion) => void;
}) {
  const t = useTranslations("subnet");
  return (
    <div className="mb-4 flex items-center gap-1 rounded-lg bg-bg-input p-1 w-fit">
      {(["ipv4", "ipv6"] as IPVersion[]).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
            version === v
              ? "bg-bg-surface text-accent-cyan shadow-sm border border-border-default"
              : "text-fg-secondary hover:text-fg-primary"
          }`}
        >
          {v === "ipv4" ? "IPv4" : "IPv6"}
        </button>
      ))}
    </div>
  );
}

function BitsVisualization({
  bits,
  version,
  prefixLength,
}: {
  bits: BitsVisualization;
  version: IPVersion;
  prefixLength: number;
}) {
  const t = useTranslations("subnet");
  const [expanded, setExpanded] = useState(false);

  if (version === "ipv4") {
    const totalBits = 32;
    const bitGroups: { network: number[]; host: number[] }[] = [];
    for (let i = 0; i < totalBits; i += 8) {
      const group: { network: number[]; host: number[] } = { network: [], host: [] };
      for (let j = i; j < i + 8 && j < bits.bits.length; j++) {
        if (j < prefixLength) {
          group.network.push(bits.bits[j]);
        } else {
          group.host.push(bits.bits[j]);
        }
      }
      bitGroups.push(group);
    }

    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-fg-secondary">{t("bitsVisualization")}</div>
        <div className="flex items-center gap-1">
          {bitGroups.map((group, gi) => (
            <span key={gi} className="flex items-center gap-0.5">
              {gi > 0 && <span className="text-fg-muted mx-0.5">.</span>}
              {group.network.map((b, bi) => (
                <span
                  key={`n-${bi}`}
                  className="inline-flex h-5 w-3.5 items-center justify-center rounded-sm bg-accent-cyan/20 text-[10px] font-mono text-accent-cyan"
                >
                  {b}
                </span>
              ))}
              {group.host.map((b, bi) => (
                <span
                  key={`h-${bi}`}
                  className="inline-flex h-5 w-3.5 items-center justify-center rounded-sm bg-accent-purple/20 text-[10px] font-mono text-accent-purple"
                >
                  {b}
                </span>
              ))}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-fg-muted">
          <div className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-accent-cyan/40" />
            {t("networkBits")} ({prefixLength})
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-accent-purple/40" />
            {t("hostBits")} ({totalBits - prefixLength})
          </div>
        </div>
      </div>
    );
  }

  // IPv6
  const totalBits = 128;
  const displayBits = expanded ? bits.bits : bits.bits.slice(0, 64);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-fg-secondary">{t("bitsVisualization")}</div>
      <div className="flex flex-wrap items-center gap-0.5">
        {displayBits.map((b, i) => {
          const isNetwork = i < prefixLength;
          return (
            <span
              key={i}
              className={`inline-flex h-5 w-3.5 items-center justify-center rounded-sm text-[10px] font-mono ${
                isNetwork
                  ? "bg-accent-cyan/20 text-accent-cyan"
                  : "bg-accent-purple/20 text-accent-purple"
              }`}
            >
              {b}
            </span>
          );
        })}
        {!expanded && (
          <>
            <span className="text-fg-muted text-xs mx-1">…</span>
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-accent-cyan hover:underline"
            >
              {t("showAllBits")}
            </button>
          </>
        )}
        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="text-xs text-accent-cyan hover:underline ml-1"
          >
            {t("collapseBits")}
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-fg-muted">
        <div className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-accent-cyan/40" />
          {t("networkBits")} ({Math.min(prefixLength, totalBits)})
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-accent-purple/40" />
          {t("hostBits")} ({totalBits - prefixLength})
        </div>
      </div>
    </div>
  );
}

function ResultField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <span className="text-sm text-fg-secondary whitespace-nowrap">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-mono text-fg-primary break-all text-right">{value}</span>
        <CopyButton getContent={() => value} />
      </div>
    </div>
  );
}

function CIDRCalculator({ version }: { version: IPVersion }) {
  const t = useTranslations("subnet");
  const tc = useTranslations("common");

  const [input, setInput] = useState("");
  const [result, setResult] = useState<CIDRInfo | null>(null);
  const [error, setError] = useState("");

  const [subnetIP1, setSubnetIP1] = useState("");
  const [subnetIP2, setSubnetIP2] = useState("");
  const [subnetResult, setSubnetResult] = useState<boolean | null>(null);

  function handleInputChange(value: string) {
    setInput(value);
    setError("");
    setResult(null);

    const detected = detectIPVersion(value);
    if (detected && detected !== version) return;

    const trimmed = value.trim();
    if (!trimmed) return;

    try {
      const parsed = parseCIDR(trimmed, version);
      if (!parsed) {
        setError(t("invalidCIDR"));
        return;
      }
      const info = calculateCIDR(parsed.ip, parsed.prefix);
      setResult(info);
    } catch {
      setError(t("invalidCIDR"));
    }
  }

  function handleSubnetCheck() {
    if (!result) return;
    const ip1 = subnetIP1.trim();
    const ip2 = subnetIP2.trim();
    if (!ip1 || !ip2) {
      showToast(tc("fillRequired"), "error");
      return;
    }
    try {
      const parsed1 = parseIP(ip1, version);
      const parsed2 = parseIP(ip2, version);
      const same = isSameSubnet(parsed1, parsed2, result.prefixLength);
      setSubnetResult(same);
    } catch {
      showToast(t("invalidIP"), "error");
    }
  }

  const bitsViz = result
    ? getBitsVisualization(result.networkAddress, result.prefixLength, version)
    : null;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-fg-secondary mb-1.5">
          {t("cidrInput")}
        </label>
        <StyledInput
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={version === "ipv4" ? "192.168.1.0/24" : "2001:db8::/32"}
          className="font-mono"
        />
        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
            <ResultField label={t("networkAddress")} value={formatIP(result.networkAddress)} />
            <ResultField label={t("broadcastAddress")} value={formatIP(result.broadcastAddress)} />
            <ResultField label={t("firstHost")} value={formatIP(result.firstHost)} />
            <ResultField label={t("lastHost")} value={formatIP(result.lastHost)} />
            <ResultField label={t("usableHosts")} value={result.usableHosts.toLocaleString()} />
            <ResultField
              label={t("totalAddresses")}
              value={result.totalAddresses.toLocaleString()}
            />
            <ResultField label={t("subnetMask")} value={formatIP(result.subnetMask)} />
            <ResultField label={t("cidrNotation")} value={`/${result.prefixLength}`} />
            {version === "ipv4" && (
              <ResultField label={t("ipClass")} value={getIPClass(result.networkAddress)} />
            )}
            <ResultField
              label={t("addressType")}
              value={getAddressType(result.networkAddress, version)}
            />
          </div>

          <div className="rounded-lg border border-border-default bg-bg-surface p-4">
            {bitsViz && (
              <BitsVisualization
                bits={bitsViz}
                version={version}
                prefixLength={result.prefixLength}
              />
            )}
          </div>
        </div>
      )}

      {result && (
        <Accordion title={t("ipBelongsToSubnet")} defaultOpen={false}>
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-fg-secondary mb-1">{t("ipAddress")} 1</label>
                <StyledInput
                  value={subnetIP1}
                  onChange={(e) => {
                    setSubnetIP1(e.target.value);
                    setSubnetResult(null);
                  }}
                  placeholder={version === "ipv4" ? "192.168.1.100" : "2001:db8::1"}
                  className="font-mono"
                />
              </div>
              <div>
                <label className="block text-sm text-fg-secondary mb-1">{t("ipAddress")} 2</label>
                <StyledInput
                  value={subnetIP2}
                  onChange={(e) => {
                    setSubnetIP2(e.target.value);
                    setSubnetResult(null);
                  }}
                  placeholder={version === "ipv4" ? "192.168.1.200" : "2001:db8::2"}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={handleSubnetCheck}>
                {t("check")}
              </Button>
              {subnetResult !== null && (
                <Badge variant={subnetResult ? "cyan" : "danger"}>
                  {subnetResult ? t("sameSubnet") : t("differentSubnet")}
                </Badge>
              )}
            </div>
          </div>
        </Accordion>
      )}
    </div>
  );
}

function AddressSpaceVisualization({
  subnets,
  parentTotal,
}: {
  subnets: { start: number; end: number }[];
  parentTotal: number;
}) {
  if (!subnets.length || parentTotal === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex rounded-md overflow-hidden h-6">
        {subnets.map((subnet, i) => {
          const width = ((subnet.end - subnet.start) / parentTotal) * 100;
          return (
            <div
              key={i}
              style={{
                width: `${Math.max(width, 0.5)}%`,
                backgroundColor: TOOL_ICON_COLORS[i % TOOL_ICON_COLORS.length],
              }}
              className="h-full transition-all"
              title={`Subnet ${i + 1}: ${(subnet.end - subnet.start).toLocaleString()} addresses`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-fg-muted font-mono">
        <span>{subnets[0]?.start ?? 0}</span>
        <span>{subnets[subnets.length - 1]?.end ?? 0}</span>
      </div>
    </div>
  );
}

function SubnetSplitter({ version }: { version: IPVersion }) {
  const t = useTranslations("subnet");
  const tc = useTranslations("common");

  const [parentCIDR, setParentCIDR] = useState("");
  const [splitMode, setSplitMode] = useState<"count" | "hosts">("count");
  const [count, setCount] = useState("");
  const [results, setResults] = useState<SubnetResult[]>([]);
  const [error, setError] = useState("");

  function handleCalculate() {
    setError("");
    setResults([]);

    const trimmed = parentCIDR.trim();
    if (!trimmed || !count.trim()) {
      showToast(tc("fillRequired"), "error");
      return;
    }

    try {
      const parsed = parseCIDR(trimmed, version);
      if (!parsed) {
        setError(t("invalidCIDR"));
        return;
      }

      const n = parseInt(count, 10);
      if (isNaN(n) || n <= 0) {
        setError(t("invalidCount"));
        return;
      }

      let subnets: SubnetResult[];
      if (splitMode === "count") {
        subnets = subnetSplitByCount(parsed.ip, parsed.prefix, n);
      } else {
        subnets = subnetSplitByHosts(parsed.ip, parsed.prefix, n);
      }

      if (subnets.length === 0) {
        setError(t("insufficientSpace"));
        return;
      }

      setResults(subnets);
    } catch (e) {
      setError(t("calculationError"));
    }
  }

  const parentInfo = (() => {
    try {
      const parsed = parseCIDR(parentCIDR.trim(), version);
      if (!parsed) return null;
      return calculateCIDR(parsed.ip, parsed.prefix);
    } catch {
      return null;
    }
  })();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <label className="block text-sm font-medium text-fg-secondary mb-1.5">
            {t("parentCIDR")}
          </label>
          <StyledInput
            value={parentCIDR}
            onChange={(e) => {
              setParentCIDR(e.target.value);
              setError("");
            }}
            placeholder={version === "ipv4" ? "192.168.0.0/16" : "2001:db8::/32"}
            className="font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-fg-secondary mb-1.5">
            {t("splitMode")}
          </label>
          <StyledSelect
            value={splitMode}
            onChange={(e) => setSplitMode(e.target.value as "count" | "hosts")}
          >
            <option value="count">{t("bySubnetCount")}</option>
            <option value="hosts">{t("byHostCount")}</option>
          </StyledSelect>
        </div>
        <div>
          <label className="block text-sm font-medium text-fg-secondary mb-1.5">
            {splitMode === "count" ? t("subnetCount") : t("hostsPerSubnet")}
          </label>
          <StyledInput
            value={count}
            onChange={(e) => {
              setCount(e.target.value);
              setError("");
            }}
            type="number"
            min="1"
            placeholder={splitMode === "count" ? "4" : "256"}
            className="font-mono"
          />
        </div>
      </div>

      <Button size="sm" onClick={handleCalculate}>
        {t("calculate")}
      </Button>

      {error && <p className="text-sm text-danger">{error}</p>}

      {results.length > 0 && parentInfo && (
        <>
          <AddressSpaceVisualization
            subnets={results.map((r) => ({
              start: Number(r.networkAddress & r.subnetMask),
              end: Number(r.broadcastAddress),
            }))}
            parentTotal={Number(parentInfo.totalAddresses)}
          />

          <div className="overflow-x-auto rounded-lg border border-border-default">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default bg-bg-surface">
                  <th className="px-3 py-2 text-left text-fg-secondary">#</th>
                  <th className="px-3 py-2 text-left text-fg-secondary">{t("networkCol")}</th>
                  <th className="px-3 py-2 text-left text-fg-secondary">{t("broadcastCol")}</th>
                  <th className="px-3 py-2 text-left text-fg-secondary">{t("hostRangeCol")}</th>
                  <th className="px-3 py-2 text-right text-fg-secondary">{t("usableHostsCol")}</th>
                  <th className="px-3 py-2 text-left text-fg-secondary">{t("maskCol")}</th>
                  <th className="px-3 py-2 text-left text-fg-secondary">CIDR</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b border-border-subtle last:border-0 hover:bg-bg-surface/50"
                  >
                    <td className="px-3 py-2">
                      <Badge variant="default">{i + 1}</Badge>
                    </td>
                    <td className="px-3 py-2 font-mono text-fg-primary">
                      {formatIP(r.networkAddress)}
                    </td>
                    <td className="px-3 py-2 font-mono text-fg-primary">
                      {formatIP(r.broadcastAddress)}
                    </td>
                    <td className="px-3 py-2 font-mono text-fg-primary text-xs">
                      {formatIP(r.firstHost)} – {formatIP(r.lastHost)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-fg-primary">
                      {r.usableHosts.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 font-mono text-fg-primary text-xs">
                      {formatIP(r.subnetMask)}
                    </td>
                    <td className="px-3 py-2 font-mono text-fg-primary">/{r.prefixLength}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function VLSMAllocator({ version }: { version: IPVersion }) {
  const t = useTranslations("subnet");
  const tc = useTranslations("common");

  const [parentCIDR, setParentCIDR] = useState("");
  const [entries, setEntries] = useState<{ name: string; hosts: string }[]>([
    { name: "", hosts: "" },
  ]);
  const [results, setResults] = useState<VLSMEntry[]>([]);
  const [error, setError] = useState("");
  const [freeSpace, setFreeSpace] = useState<number>(0);

  function addEntry() {
    setEntries([...entries, { name: "", hosts: "" }]);
  }

  function removeEntry(index: number) {
    if (entries.length <= 1) return;
    setEntries(entries.filter((_, i) => i !== index));
  }

  function updateEntry(index: number, field: "name" | "hosts", value: string) {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  }

  function handleCalculate() {
    setError("");
    setResults([]);
    setFreeSpace(0);

    const trimmed = parentCIDR.trim();
    if (!trimmed) {
      showToast(tc("fillRequired"), "error");
      return;
    }

    const validEntries = entries.filter((e) => e.hosts.trim() && parseInt(e.hosts, 10) > 0);
    if (validEntries.length === 0) {
      showToast(t("addAtLeastOneSubnet"), "error");
      return;
    }

    try {
      const parsed = parseCIDR(trimmed, version);
      if (!parsed) {
        setError(t("invalidCIDR"));
        return;
      }

      const hostEntries = validEntries.map((e) => ({
        name: e.name || `Subnet ${entries.indexOf(e) + 1}`,
        hosts: parseInt(e.hosts, 10),
      }));

      const allocResult = vlsmAllocate(parsed.ip, parsed.prefix, hostEntries);
      if (!allocResult || allocResult.subnets.length === 0) {
        setError(t("insufficientSpace"));
        return;
      }

      setResults(allocResult.subnets);
      setFreeSpace(allocResult.freeSpace);
    } catch {
      setError(t("calculationError"));
    }
  }

  const parentInfo = (() => {
    try {
      const parsed = parseCIDR(parentCIDR.trim(), version);
      if (!parsed) return null;
      return calculateCIDR(parsed.ip, parsed.prefix);
    } catch {
      return null;
    }
  })();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-fg-secondary mb-1.5">
          {t("parentCIDR")}
        </label>
        <StyledInput
          value={parentCIDR}
          onChange={(e) => {
            setParentCIDR(e.target.value);
            setError("");
          }}
          placeholder={version === "ipv4" ? "192.168.0.0/16" : "2001:db8::/32"}
          className="font-mono"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-fg-secondary">{t("subnets")}</label>
          <Button size="sm" variant="outline" onClick={addEntry}>
            + {t("addSubnet")}
          </Button>
        </div>
        {entries.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <StyledInput
              value={entry.name}
              onChange={(e) => updateEntry(i, "name", e.target.value)}
              placeholder={`${t("subnetName")} ${i + 1}`}
              className="flex-1"
            />
            <StyledInput
              value={entry.hosts}
              onChange={(e) => updateEntry(i, "hosts", e.target.value)}
              placeholder={t("hosts")}
              type="number"
              min="1"
              className="w-28 font-mono"
            />
            <Button
              size="sm"
              variant="danger"
              onClick={() => removeEntry(i)}
              disabled={entries.length <= 1}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>

      <Button size="sm" onClick={handleCalculate}>
        {t("calculate")}
      </Button>

      {error && <p className="text-sm text-danger">{error}</p>}

      {results.length > 0 && parentInfo && (
        <>
          <div className="space-y-1.5">
            <div className="flex rounded-md overflow-hidden h-6">
              {results.map((r, i) => {
                const size = Number(r.broadcastAddress) - Number(r.networkAddress) + 1;
                const width = (size / Number(parentInfo.totalAddresses)) * 100;
                return (
                  <div
                    key={i}
                    style={{
                      width: `${Math.max(width, 0.5)}%`,
                      backgroundColor: TOOL_ICON_COLORS[i % TOOL_ICON_COLORS.length],
                    }}
                    className="h-full transition-all"
                    title={`${r.name}: ${size.toLocaleString()} addresses`}
                  />
                );
              })}
              {freeSpace > 0 && (
                <div
                  style={{
                    width: `${(freeSpace / Number(parentInfo.totalAddresses)) * 100}%`,
                    backgroundImage:
                      "repeating-linear-gradient(45deg, transparent, transparent 3px, var(--fg-muted) 3px, var(--fg-muted) 4px)",
                    backgroundColor: "var(--fg-muted)",
                    opacity: 0.15,
                  }}
                  className="h-full"
                  title={`${t("freeSpace")}: ${freeSpace.toLocaleString()} addresses`}
                />
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border-default">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default bg-bg-surface">
                  <th className="px-3 py-2 text-left text-fg-secondary">{t("nameCol")}</th>
                  <th className="px-3 py-2 text-left text-fg-secondary">{t("networkCol")}</th>
                  <th className="px-3 py-2 text-left text-fg-secondary">CIDR</th>
                  <th className="px-3 py-2 text-left text-fg-secondary">{t("maskCol")}</th>
                  <th className="px-3 py-2 text-left text-fg-secondary">{t("hostRangeCol")}</th>
                  <th className="px-3 py-2 text-right text-fg-secondary">{t("usableHostsCol")}</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b border-border-subtle last:border-0 hover:bg-bg-surface/50"
                  >
                    <td className="px-3 py-2 text-fg-primary">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: TOOL_ICON_COLORS[i % TOOL_ICON_COLORS.length] }}
                        />
                        {r.name}
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-fg-primary">
                      {formatIP(r.networkAddress)}
                    </td>
                    <td className="px-3 py-2 font-mono text-fg-primary">/{r.prefixLength}</td>
                    <td className="px-3 py-2 font-mono text-fg-primary text-xs">
                      {formatIP(r.subnetMask)}
                    </td>
                    <td className="px-3 py-2 font-mono text-fg-primary text-xs">
                      {formatIP(r.firstHost)} – {formatIP(r.lastHost)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-fg-primary">
                      {r.usableHosts.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {freeSpace > 0 && (
            <p className="text-xs text-fg-muted">
              {t("freeSpaceRemaining")}: {freeSpace.toLocaleString()} {t("addresses")}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default function SubnetPage() {
  const t = useTranslations("tools");
  const ts = useTranslations("subnet");

  const [ipVersion, setIPVersion] = useState<IPVersion>("ipv4");
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      label: ts("cidrCalculator"),
      content: <CIDRCalculator version={ipVersion} />,
    },
    {
      label: ts("subnetSplitter"),
      content: <SubnetSplitter version={ipVersion} />,
    },
    {
      label: ts("vlsmAllocator"),
      content: <VLSMAllocator version={ipVersion} />,
    },
  ];

  return (
    <Layout
      title={t("subnet.shortTitle")}
      categoryLabel={t("categories.referenceLookup")}
      categorySlug="reference-lookup"
    >
      <div className="container mx-auto px-4 pt-3 pb-6">
        <IPVersionToggle version={ipVersion} onChange={setIPVersion} />
        <NeonTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        <DescriptionSection namespace="subnet" />
        <RelatedTools currentTool="subnet" />
      </div>
    </Layout>
  );
}
```

### Sub-sections Breakdown

#### 11.1 — Helper Components

- `detectIPVersion(input)` — auto-detects IPv4 vs IPv6 from input string
- `IPVersionToggle` — pill-style toggle using bg-bg-input surface with rounded-md active state
- `ResultField` — single row with label + monospace value + CopyButton
- `BitsVisualization` — renders bit blocks, network=accent-cyan, host=accent-purple; IPv6 has collapsed/expanded toggle

#### 11.2 — Tab 1: CIDRCalculator

- Single StyledInput for IP/CIDR, real-time computation on change
- Calls `parseCIDR` → `calculateCIDR` → `getBitsVisualization`
- Results in 2-column grid (desktop), single column (mobile)
- Left column: card with all result fields
- Right column: BitsVisualization
- Accordion below: IP Belongs to Subnet checker with two inputs + Badge result

#### 11.3 — Tab 2: SubnetSplitter

- Parent CIDR input + split mode select + count input
- Button to trigger calculation
- Calls `subnetSplitByCount` or `subnetSplitByHosts`
- AddressSpaceVisualization: horizontal bar with TOOL_ICON_COLORS
- Result table with 7 columns
- Error handling with showToast

#### 11.4 — Tab 3: VLSMAllocator

- Parent CIDR input + dynamic rows (name + hosts + delete)
- "Add Subnet" button
- Calls `vlsmAllocate`
- Address space viz with free space (diagonal stripes using CSS repeating-linear-gradient)
- VLSM result table with color dots matching bars
- Free space remaining message

#### 11.5 — Main Export

- `SubnetPage` — default export, wraps everything in Layout
- State: ipVersion, activeTab
- NeonTabs with 3 tab definitions
- DescriptionSection + RelatedTools at bottom

### Acceptance Criteria

- [ ] File compiles without TypeScript errors
- [ ] No useMemo/useCallback/React.memo usage (React Compiler handles memoization)
- [ ] All 3 tabs render correctly
- [ ] IP version toggle switches between IPv4 and IPv6
- [ ] CIDR Calculator computes in real-time as user types
- [ ] Bits visualization renders correctly for both IPv4 and IPv6
- [ ] IPv6 bits visualization has collapsed/expanded toggle
- [ ] IP Belongs to Subnet accordion works with correct badge colors
- [ ] Subnet Splitter handles both split modes
- [ ] Address space visualization renders with correct colors
- [ ] VLSM Allocator supports adding/removing rows
- [ ] VLSM free space shown with diagonal stripes
- [ ] Error states show danger-colored messages
- [ ] showToast used for business logic validation errors
- [ ] CopyButton on every result field
- [ ] All text uses translation keys from `useTranslations("subnet")`
- [ ] Layout wraps content with correct categorySlug

---

## File Summary

| #   | File                                  | Lines (est.) | Purpose                   |
| --- | ------------------------------------- | ------------ | ------------------------- |
| 10  | `app/[locale]/subnet/page.tsx`        | ~75          | Route entry, SEO, JSON-LD |
| 11  | `app/[locale]/subnet/subnet-page.tsx` | ~700         | Full UI component         |

## Dependencies

These files depend on:

- `libs/subnet/main.ts` — all core subnet computation functions and types (Tasks 1-9)
- `public/locales/{locale}/subnet.json` — translation keys (i18n task)
- `public/locales/{locale}/tools.json` — tool title/description entries
- All shared components listed in imports
