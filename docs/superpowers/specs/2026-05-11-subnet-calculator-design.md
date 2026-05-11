# IP Subnet Calculator — Design Spec

## Overview

A browser-based IPv4/IPv6 subnet calculator for OmniKit. All computation runs entirely client-side using BigInt bit operations — zero external dependencies.

**Route:** `/subnet`
**Category:** `reference`
**Icon:** `Network` (lucide-react)

## Features

1. **CIDR Calculator** — Input IP/CIDR, get network address, broadcast, host range, usable hosts, subnet mask, address type, IP class
2. **Subnet Splitter** — Split a network into equal-sized subnets by count or host count
3. **VLSM Allocator** — Allocate variable-length subnets driven by per-subnet host requirements
4. **IP Belongs to Subnet** — Check if two IPs are in the same subnet
5. **CIDR ↔ Mask Conversion** — Inline in CIDR calculator results
6. **Binary Bit Visualization** — Visual network/host bit boundary in CIDR calculator results

## Page Structure

```
app/[locale]/subnet/
├── page.tsx          # Route entry
└── subnet-page.tsx   # Page component
```

### Navigation Hierarchy

- **Top level:** IPv4 / IPv6 toggle (pill-style buttons, same pattern as numbase BitWidthSelector)
- **Second level:** 3 tabs (NeonTabs or Headless UI Tab):
  - Tab 1: CIDR Calculator
  - Tab 2: Subnet Splitter
  - Tab 3: VLSM Allocator
- **IP Belongs to Subnet:** Accordion below CIDR calculator results
- **CIDR ↔ Mask:** Inline in CIDR calculator result card
- **Binary Visualization:** Inline in CIDR calculator result card (right column)

Auto-detect IPv4/IPv6 from input and switch the top-level toggle accordingly.

## Tool Registration

### `libs/tools.ts` — TOOLS array

Insert after the `bip39` entry:

```ts
import { Network } from "lucide-react";

{
  key: "subnet",
  path: "/subnet",
  icon: Network,
  emoji: "🧮",
  sameAs: [
    "https://datatracker.ietf.org/doc/html/rfc4632",
    "https://datatracker.ietf.org/doc/html/rfc4291",
    "https://en.wikipedia.org/wiki/Subnetwork",
  ],
}
```

### `libs/tools.ts` — TOOL_CATEGORIES

Add `"subnet"` to the `reference` category, after `"bip39"`:

```ts
{ key: "reference", tools: ["httpstatus", "httpclient", "dbviewer", "ascii", "htmlcode", "bip39", "subnet"] },
```

### `libs/tools.ts` — TOOL_RELATIONS

```ts
subnet: ["numbase", "httpstatus", "ascii"],
```

Update reverse relations:

- `numbase`: add `"subnet"` → `["color", "storageunit", "ascii", "subnet"]`
- `ascii`: add `"subnet"` → `["htmlcode", "numbase", "httpstatus", "subnet"]`
- `httpstatus`: already lists `"httpclient", "urlencoder"` — add `"subnet"` → `["httpclient", "urlencoder", "subnet"]`

Note: TOOL_RELATIONS test requires 2–5 bidirectional entries per tool. The above satisfies this constraint.

### `libs/tools.ts` — lucide-react import

Add `Network` to the existing import:

```ts
import { ..., BookOpen, Network } from "lucide-react";
```

## Core Engine

**File:** `libs/subnet/main.ts` (~500 lines)
**Dependencies:** None (pure BigInt bit operations)

### Types

```ts
type IPVersion = 4 | 6;

type AddressType = "private" | "public" | "loopback" | "linkLocal" | "multicast" | "reserved";

interface ParsedIP {
  version: IPVersion;
  value: bigint;
}

interface CIDRInfo {
  version: IPVersion;
  input: string;
  networkAddress: string;
  broadcastAddress: string | null; // null for IPv6
  firstHost: string;
  lastHost: string;
  totalHosts: bigint;
  usableHosts: bigint;
  subnetMask: string; // dotted-decimal for IPv4, empty string "" for IPv6
  prefixLength: number;
  ipClass: string | null; // "A"|"B"|"C"|"D"|"E" for IPv4, null for IPv6
  addressType: AddressType; // single discriminant replaces multiple booleans
}

interface SubnetResult {
  index: number;
  networkAddress: string;
  broadcastAddress: string | null;
  firstHost: string;
  lastHost: string;
  usableHosts: bigint;
  subnetMask: string;
  prefixLength: number;
}

interface VLSMEntry {
  name: string;
  requiredHosts: number;
  allocatedPrefix: number;
  networkAddress: string;
  broadcastAddress: string | null;
  firstHost: string;
  lastHost: string;
  usableHosts: bigint;
  subnetMask: string;
}

interface BitsVisualization {
  version: IPVersion;
  bits: string[]; // "0" or "1" per bit position (MSB first)
  prefixLength: number; // boundary index
}
```

### Core Functions

| Function               | Signature                                                                                                         | Purpose                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `parseIP`              | `(input: string) => ParsedIP`                                                                                     | Parse IP string → `{ version, value: bigint }`                    |
| `formatIP`             | `(value: bigint, version: IPVersion) => string`                                                                   | BigInt → IP string (IPv6: RFC 5952 abbreviation)                  |
| `parseCIDR`            | `(input: string) => { ip: ParsedIP; prefixLength: number }`                                                       | Parse `IP/prefix`                                                 |
| `calculateCIDR`        | `(input: string) => CIDRInfo`                                                                                     | CIDR calculator core                                              |
| `subnetSplitByCount`   | `(network: string, parentPrefix: number, subnetCount: number) => SubnetResult[]`                                  | Split into N equal subnets                                        |
| `subnetSplitByHosts`   | `(network: string, parentPrefix: number, hostsPerSubnet: number) => SubnetResult[]`                               | Split by minimum hosts per subnet                                 |
| `vlsmAllocate`         | `(network: string, parentPrefix: number, entries: Array<{ name: string; requiredHosts: number }>) => VLSMEntry[]` | VLSM allocation by host requirements                              |
| `isSameSubnet`         | `(ip1: string, ip2: string, prefixLength: number) => boolean`                                                     | IP subnet membership check                                        |
| `cidrToMask`           | `(prefix: number, version: IPVersion) => string`                                                                  | CIDR prefix → subnet mask string (IPv4 only, returns "" for IPv6) |
| `maskToCidr`           | `(mask: string) => number`                                                                                        | Subnet mask → CIDR prefix length (IPv4 only)                      |
| `getBitsVisualization` | `(value: bigint, prefixLength: number, version: IPVersion) => BitsVisualization`                                  | Binary visualization data                                         |
| `getAddressType`       | `(ip: ParsedIP) => AddressType`                                                                                   | Classify IP address type                                          |

### IPv6 Specifics

- No broadcast address concept — `broadcastAddress` returns `null`
- `usableHosts` does not subtract 2 (except /127 per RFC 6164)
- Address abbreviation follows RFC 5952 (`::` longest-run zero compression, lowercase hex)
- Special ranges: `::1/128` loopback, `fe80::/10` link-local, `fc00::/7` ULA, `ff00::/8` multicast
- `subnetMask` returns `""` (IPv6 has no dotted-decimal mask concept)

### Edge Cases

- IPv4 /31: point-to-point (RFC 3021) — `usableHosts = 2`, `firstHost = networkAddress`, `lastHost = broadcastAddress` (both addresses are usable hosts, no traditional broadcast)
- IPv4 /32: single host — `usableHosts = 1`, `firstHost = lastHost = networkAddress`, `broadcastAddress = networkAddress`
- IPv4 /0: entire address space — `totalHosts = 2^32`
- IPv6 /127: point-to-point (RFC 6164) — `usableHosts = 2`
- IPv6 /128: single host — `usableHosts = 1`
- Input validation: invalid IP format, prefix out of range (IPv4: 0–32, IPv6: 0–128), insufficient space for subnet splitting

## UI Components

### Tab 1: CIDR Calculator

**Input:** Single `StyledInput` for IP/CIDR (e.g. `192.168.1.100/24`). Real-time computation on input change.

**Results (2-column grid):**

Left column — Result card:

- Network Address, Broadcast Address (shows "—" for IPv6), First/Last Usable Host, Usable Hosts, Total Addresses, Subnet Mask (shows "N/A for IPv6" for IPv6), CIDR Notation, IP Class (IPv4 only, shows "—" for IPv6), Address Type
- Each field with `CopyButton`
- CIDR ↔ Mask conversion inline (IPv4 only)

Right column — Binary bit visualization:

- IPv4: single row of 32 bits, dotted every 8, network bits in `--accent-cyan`, host bits in `--accent-purple`
- IPv6: collapsed view (show first 64 bits + "…" summary), click "Expand" `Button` (variant="outline", size="sm") to reveal full 128 bits. Use local state `isExpanded` to toggle.
- Network/host bit boundary line with labels ("Network bits" / "Host bits")

**IP Belongs to Subnet (Accordion):**

- Two `StyledInput` fields: IP 1, IP 2
- Uses the CIDR prefix from calculator input
- Result: green Badge "Same Subnet" or red Badge "Different Subnet"

### Tab 2: Subnet Splitter

**Input:**

- `StyledInput`: parent network CIDR (e.g. `192.168.0.0/16`)
- `StyledSelect`: split mode = "by subnet count" | "by host count" — options from i18n keys `split.bySubnetCount` / `split.byHostCount`
- `StyledInput`: subnet count or hosts per subnet

**Results:**

1. **Address space visualization** — horizontal bar chart using `<div>` elements with percentage widths. Each subnet colored with `--tool-icon-N` (index = subnet.index modulo 20). On hover, native `title` attribute shows "Network: X, Usable: Y hosts". If result count > 256, skip the visualization (show a note "Too many subnets for visual display").
2. **Subnet table** — columns: #, Network Address, Broadcast, Host Range, Usable Hosts, Subnet Mask, CIDR. Rows copyable. Virtualized via CSS `overflow-y: auto; max-height: 480px` if > 50 rows.

### Tab 3: VLSM Allocator

**Input:**

- `StyledInput`: parent network CIDR
- Dynamic row list, each row: `StyledInput` (subnet name) + `StyledInput` (required hosts, type="number") + delete `Button` (variant="danger", size="sm")
- "Add Subnet" `Button` (variant="outline")

**Results:**

1. **Address space visualization** — same pattern as Tab 2, but blocks are unevenly sized. Free space blocks shown in `--fg-muted` color with diagonal stripe pattern (`repeating-linear-gradient`).
2. **VLSM result table** — columns: #, Name, Network Address, Broadcast, Host Range, Usable Hosts, Subnet Mask, Prefix. Allocation order shown. Free space rows interspersed.
3. **Sort order:** Internal allocation uses first-fit decreasing (largest host requirement allocated first, ties broken by original input order). Result table displayed in allocation order (not original input order). Each row annotated with its original input index.

### Description Section

Uses the standard `DescriptionSection` component (not a custom Accordion):

```tsx
<DescriptionSection namespace="subnet" />
```

i18n keys follow the `descriptions.*` pattern (see i18n section below).

### Responsive

- Desktop: result area 2-column grid
- Mobile (<768px): single column stack, tables horizontal scroll

## i18n

### Tool-specific keys (`public/locales/{locale}/subnet.json`)

```jsonc
{
  "cidr": {
    "placeholder": "Enter IP/CIDR (e.g. 192.168.1.0/24)",
    "networkAddress": "Network Address",
    "broadcastAddress": "Broadcast Address",
    "firstHost": "First Usable Host",
    "lastHost": "Last Usable Host",
    "usableHosts": "Usable Hosts",
    "totalHosts": "Total Addresses",
    "subnetMask": "Subnet Mask",
    "cidrNotation": "CIDR Notation",
    "ipClass": "IP Class",
    "addressType": "Address Type",
    "binaryView": "Binary View",
    "networkBits": "Network bits",
    "hostBits": "Host bits",
    "expand": "Expand",
    "collapse": "Collapse",
  },
  "ipCheck": {
    "title": "IP Belongs to Subnet?",
    "ip1": "IP Address 1",
    "ip2": "IP Address 2",
    "sameSubnet": "Same Subnet",
    "differentSubnet": "Different Subnet",
  },
  "split": {
    "title": "Subnet Splitter",
    "parentCidr": "Parent Network (CIDR)",
    "splitBy": "Split By",
    "bySubnetCount": "Number of Subnets",
    "byHostCount": "Hosts per Subnet",
    "subnetCount": "Number of Subnets",
    "hostCount": "Hosts per Subnet",
    "tooManyToVisualize": "Too many subnets for visual display",
    "tableHeaders": {
      "index": "#",
      "network": "Network Address",
      "broadcast": "Broadcast",
      "hostRange": "Host Range",
      "usableHosts": "Usable Hosts",
      "subnetMask": "Subnet Mask",
      "cidr": "CIDR",
    },
  },
  "vlsm": {
    "title": "VLSM Allocator",
    "parentCidr": "Parent Network (CIDR)",
    "subnetName": "Subnet Name",
    "requiredHosts": "Required Hosts",
    "addSubnet": "Add Subnet",
    "freeSpace": "Free Space",
    "deleteRow": "Delete",
  },
  "addressType": {
    "private": "Private",
    "public": "Public",
    "loopback": "Loopback",
    "linkLocal": "Link-Local",
    "multicast": "Multicast",
    "reserved": "Reserved",
  },
  "ipClass": {
    "a": "Class A",
    "b": "Class B",
    "c": "Class C",
    "d": "Class D (Multicast)",
    "e": "Class E (Reserved)",
  },
  "descriptions": {
    "aeoDefinition": "IP Subnet Calculator is a free online tool for IPv4/IPv6 CIDR calculation, subnet splitting, and VLSM allocation. Computes network address, broadcast, host range, and subnet mask entirely in your browser.",
    "whatIsTitle": "What is a Subnet Calculator?",
    "whatIs": "A subnet calculator computes network properties from a CIDR notation input. It determines the network address, broadcast address, usable host range, and subnet mask for both IPv4 and IPv6 networks.",
    "useCasesTitle": "Common Use Cases",
    "useCasesDesc1": "Network Design",
    "useCasesP1": "Plan IP address allocation for subnets, determine appropriate CIDR prefixes for given host counts, and verify subnet configurations.",
    "useCasesDesc2": "VLSM Planning",
    "useCasesP2": "Allocate variable-length subnet masks to efficiently use address space when different subnets have different host requirements.",
    "stepsTitle": "How to Use the Subnet Calculator",
    "step1Title": "Enter a CIDR address",
    "step1Text": "Type an IP address with CIDR prefix (e.g. 192.168.1.0/24) to see network properties including broadcast, host range, and subnet mask.",
    "step2Title": "Split or allocate subnets",
    "step2Text": "Switch to the Subnet Splitter tab to divide a network into equal subnets, or use the VLSM Allocator for variable-length allocation.",
    "step3Title": "Copy results",
    "step3Text": "Click the copy button next to any result field to copy it to your clipboard.",
    "faq1Q": "What is the difference between /24 and /16?",
    "faq1A": "A /24 network has 256 total addresses (254 usable hosts), while a /16 network has 65,536 total addresses (65,534 usable hosts). The prefix length determines how many bits are used for the network portion — fewer host bits means fewer addresses.",
    "faq2Q": "Why does IPv6 not have a broadcast address?",
    "faq2A": "IPv6 eliminated the broadcast address concept. Instead, IPv6 uses multicast addresses for one-to-many communication. The first and last addresses in an IPv6 subnet are both usable (except on /127 point-to-point links per RFC 6164).",
    "faq3Q": "What is VLSM?",
    "faq3A": "Variable Length Subnet Masking (VLSM) allows dividing a network into subnets of different sizes. This is more efficient than fixed-length subnetting because each subnet gets only the number of addresses it needs, reducing wasted address space.",
  },
}
```

### Tool card (`public/locales/{locale}/tools.json`)

```json
{
  "subnet": {
    "title": "IP Subnet Calculator - IPv4/IPv6 CIDR & VLSM",
    "shortTitle": "Subnet Calculator",
    "description": "IPv4/IPv6 CIDR calculator with subnet splitter and VLSM allocator. Compute network address, broadcast, host range, and subnet mask — 100% client-side.",
    "searchTerms": "..."
  }
}
```

### searchTerms

| Locale       | searchTerms                                     | Rationale                                              |
| ------------ | ----------------------------------------------- | ------------------------------------------------------ |
| `en`         | (omit)                                          | shortTitle already in English                          |
| `zh-CN`      | `"ziwangjisuanqi zwjsq ziwang CIDR"`            | 子网计算器 → ziwang (子网, subnet-specific) + CIDR     |
| `zh-TW`      | `"ziwangjisuanqi zwjsq ziwang CIDR"`            | 子網計算器 → same pinyin root, ziwang is tool-specific |
| `ja`         | `"sabunettokarakyurator sbntkr sabunetto CIDR"` | サブネット計算機 → sabunetto (subnet-specific) + CIDR  |
| `ko`         | `"seobinetgyesangi sbnCIDR somak"`              | 서브넷계산기 → somak (소망/subnet-specific) + CIDR     |
| Latin-script | (omit unless locale-specific synonyms exist)    | shortTitle already searchable                          |

## page.tsx

Follows the exact pattern from `app/[locale]/numbase/page.tsx`:

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

## SEO

- `generatePageMeta()` for canonical, alternates (10 locales), OG, Twitter metadata — handled in `page.tsx`
- JSON-LD via `buildToolSchemas()`: generates WebApplication + BreadcrumbList + FAQPage + HowTo schemas. Uses `applicationCategory: "DeveloperApplication"`, `operatingSystem: "Any"`, `offers: { price: "0" }` (all standard across OmniKit tools).
- Sitemap: auto-included via `app/sitemap.ts` TOOLS traversal

## Testing

**File:** `libs/subnet/__tests__/main.test.ts`
**Config:** Add `"libs/subnet/**/*.test.ts"` to `vitest.config.ts` include array

### Test Cases

| Category                | Cases                                                                                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parse                   | IPv4 decimal, invalid IPv4, IPv6 full, IPv6 abbreviated, IPv6 `::` compression                                                                                                              |
| Format                  | IPv4 BigInt → string, IPv6 RFC 5952 abbreviation                                                                                                                                            |
| CIDR calc               | /24 typical, /31 point-to-point (usableHosts=2, firstHost=network, lastHost=broadcast), /32 single host (usableHosts=1, broadcast=network), /0 full range, IPv6 /64, IPv6 /127, IPv6 /128   |
| Address type            | 10.x private, 172.16.x private, 192.168.x private, 127.x loopback, 169.254.x link-local, 224.x multicast, IPv6 fe80:: link-local, IPv6 fc00:: ULA, IPv6 ff00:: multicast, IPv6 ::1 loopback |
| Subnet split (by count) | /24 → 4×/26, /16 → 256×/24, insufficient space error, IPv6 split                                                                                                                            |
| Subnet split (by hosts) | /24 with 30 hosts → 8×/27, /24 with 2 hosts → 128×/30                                                                                                                                       |
| VLSM                    | 3 unequal subnets, free space calculation, overflow error, tie-breaking preserves input order                                                                                               |
| IP membership           | same subnet, different subnet, cross-boundary                                                                                                                                               |
| Mask conversion         | /24 → 255.255.255.0, 255.255.255.0 → /24, IPv6 returns ""                                                                                                                                   |
| Bits vis                | IPv4 32-bit, IPv6 128-bit, correct network/host boundary                                                                                                                                    |
| getAddressType          | returns correct AddressType union value for all ranges                                                                                                                                      |

## Error Handling

**Input validation (inline red text below input):**

- Invalid IP address format
- Invalid CIDR prefix (e.g. IPv4 /33)
- Empty input → show placeholder, no results

**Business logic errors (Toast):**

- Subnet split insufficient space → `"Insufficient address space for N /M subnets"`
- VLSM total exceeds parent → `"Total required hosts exceed parent network capacity"`
- VLSM empty rows → silently skip (no error)

**Edge case display (no error, correct values):**

- /31: broadcast shown normally, usableHosts=2
- /32: broadcast = network, usableHosts=1
- IPv6 broadcast shows "—" (not an error)
- IPv6 subnet mask shows "N/A" (not an error)

## Performance

- BigInt operations: microseconds, no Web Worker needed
- Subnet split table: max 4096 rows (IPv4 /32 → /20), prompt to narrow if exceeded
- Address space visualization: skip rendering if > 256 subnets
- VLSM dynamic rows: UI limit of 50 input rows
- All computation: pure synchronous functions

## File Summary

| File                                      | Purpose                                                                                 |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `libs/subnet/main.ts`                     | Core computation engine (~500 lines)                                                    |
| `libs/subnet/__tests__/main.test.ts`      | Vitest tests                                                                            |
| `app/[locale]/subnet/page.tsx`            | Route entry + SEO metadata + JSON-LD                                                    |
| `app/[locale]/subnet/subnet-page.tsx`     | Page component (UI + interaction)                                                       |
| `public/locales/{locale}/subnet.json`     | Tool-specific translations (10 locales)                                                 |
| `public/locales/{locale}/tools.json`      | Tool card entry (update existing)                                                       |
| `libs/tools.ts`                           | Tool registration (update existing)                                                     |
| `vitest.config.ts`                        | Add `subnet` test scope                                                                 |
| `public/locales/{locale}/categories.json` | Update reference category intro/faq (change "5 tools" to "6 tools", add subnet mention) |
