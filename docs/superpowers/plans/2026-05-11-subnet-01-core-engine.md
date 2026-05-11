# Subnet Calculator — Core Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the pure-function computation engine (`libs/subnet/main.ts`) with full test coverage for IPv4/IPv6 subnet calculations.

**Architecture:** Zero-dependency TypeScript module using BigInt bit operations. All functions are pure/synchronous. Types exported for UI consumption.

**Tech Stack:** TypeScript, BigInt, Vitest

---

## File Structure

| File                                 | Action | Responsibility                       |
| ------------------------------------ | ------ | ------------------------------------ |
| `libs/subnet/main.ts`                | Create | Core computation engine (~500 lines) |
| `libs/subnet/__tests__/main.test.ts` | Create | Vitest unit tests                    |

---

### Task 1: Types, parseIP, formatIP, parseCIDR, getIPClass

**Files:**

- Create: `libs/subnet/main.ts`
- Create: `libs/subnet/__tests__/main.test.ts`

- [ ] **Step 1: Create the test file with parse/format tests**

Create `libs/subnet/__tests__/main.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { parseIP, formatIP, parseCIDR, getIPClass } from "../main";

describe("parseIP", () => {
  it("parses IPv4 decimal", () => {
    const result = parseIP("192.168.1.100");
    expect(result.version).toBe(4);
    expect(result.value).toBe(3232235876n);
  });

  it("parses IPv4 0.0.0.0", () => {
    const result = parseIP("0.0.0.0");
    expect(result.version).toBe(4);
    expect(result.value).toBe(0n);
  });

  it("parses IPv4 255.255.255.255", () => {
    const result = parseIP("255.255.255.255");
    expect(result.version).toBe(4);
    expect(result.value).toBe(4294967295n);
  });

  it("throws on invalid IPv4", () => {
    expect(() => parseIP("999.1.1.1")).toThrow();
    expect(() => parseIP("1.2.3")).toThrow();
    expect(() => parseIP("abc")).toThrow();
    expect(() => parseIP("")).toThrow();
  });

  it("parses IPv6 full form", () => {
    const result = parseIP("2001:0db8:0000:0000:0000:0000:0000:0001");
    expect(result.version).toBe(6);
    expect(result.value).toBe(0x20010db8000000000000000000000001n);
  });

  it("parses IPv6 abbreviated with ::", () => {
    const result = parseIP("2001:db8::1");
    expect(result.version).toBe(6);
    expect(result.value).toBe(0x20010db8000000000000000000000001n);
  });

  it("parses IPv6 :: (all zeros)", () => {
    const result = parseIP("::");
    expect(result.version).toBe(6);
    expect(result.value).toBe(0n);
  });

  it("parses IPv6 ::1 (loopback)", () => {
    const result = parseIP("::1");
    expect(result.version).toBe(6);
    expect(result.value).toBe(1n);
  });

  it("parses IPv6 with :: in middle", () => {
    const result = parseIP("fe80::1");
    expect(result.version).toBe(6);
    expect(result.value).toBe(0xfe800000000000000000000000000001n);
  });

  it("throws on invalid IPv6", () => {
    expect(() => parseIP("gggg::1")).toThrow();
    expect(() => parseIP("1:2:3:4:5:6:7:8:9")).toThrow();
  });
});

describe("formatIP", () => {
  it("formats IPv4", () => {
    expect(formatIP(3232235876n, 4)).toBe("192.168.1.100");
  });

  it("formats IPv4 0.0.0.0", () => {
    expect(formatIP(0n, 4)).toBe("0.0.0.0");
  });

  it("formats IPv6 with RFC 5952 abbreviation", () => {
    expect(formatIP(0x20010db8000000000000000000000001n, 6)).toBe("2001:db8::1");
  });

  it("formats IPv6 :: (all zeros)", () => {
    expect(formatIP(0n, 6)).toBe("::");
  });

  it("formats IPv6 ::1", () => {
    expect(formatIP(1n, 6)).toBe("::1");
  });

  it("formats IPv6 without compression (no zeros)", () => {
    expect(formatIP(0x20010db8abcd01234567000000000001n, 6)).toBe("2001:db8:abcd:123:4567::1");
  });

  it("formats IPv6 link-local", () => {
    expect(formatIP(0xfe800000000000000000000000000001n, 6)).toBe("fe80::1");
  });
});

describe("parseCIDR", () => {
  it("parses IPv4 CIDR", () => {
    const result = parseCIDR("192.168.1.0/24");
    expect(result.ip.version).toBe(4);
    expect(result.ip.value).toBe(3232235776n);
    expect(result.prefixLength).toBe(24);
  });

  it("parses IPv6 CIDR", () => {
    const result = parseCIDR("2001:db8::/32");
    expect(result.ip.version).toBe(6);
    expect(result.prefixLength).toBe(32);
  });

  it("throws on invalid prefix", () => {
    expect(() => parseCIDR("1.2.3.4/33")).toThrow();
    expect(() => parseCIDR("::1/129")).toThrow();
  });

  it("throws on missing prefix", () => {
    expect(() => parseCIDR("192.168.1.0")).toThrow();
  });
});

describe("getIPClass", () => {
  it("returns Class A for 10.x.x.x", () => {
    expect(getIPClass(parseIP("10.0.0.1"))).toBe("A");
  });
  it("returns Class B for 172.16.x.x", () => {
    expect(getIPClass(parseIP("172.16.0.1"))).toBe("B");
  });
  it("returns Class C for 192.168.x.x", () => {
    expect(getIPClass(parseIP("192.168.0.1"))).toBe("C");
  });
  it("returns Class D for 224.x.x.x", () => {
    expect(getIPClass(parseIP("224.0.0.1"))).toBe("D");
  });
  it("returns Class E for 240.x.x.x", () => {
    expect(getIPClass(parseIP("240.0.0.1"))).toBe("E");
  });
  it("returns null for IPv6", () => {
    expect(getIPClass(parseIP("2001:db8::1"))).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run libs/subnet --reporter=verbose 2>&1 | head -20`
Expected: FAIL — module not found

- [ ] **Step 3: Create `libs/subnet/main.ts` with types, parseIP, formatIP, parseCIDR, getIPClass**

Create `libs/subnet/main.ts`:

```ts
export type IPVersion = 4 | 6;

export type AddressType =
  | "private"
  | "public"
  | "loopback"
  | "linkLocal"
  | "multicast"
  | "reserved";

export interface ParsedIP {
  version: IPVersion;
  value: bigint;
}

export interface CIDRInfo {
  version: IPVersion;
  input: string;
  networkAddress: string;
  broadcastAddress: string | null;
  firstHost: string;
  lastHost: string;
  totalHosts: bigint;
  usableHosts: bigint;
  subnetMask: string;
  prefixLength: number;
  ipClass: string | null;
  addressType: AddressType;
}

export interface SubnetResult {
  index: number;
  networkAddress: string;
  broadcastAddress: string | null;
  firstHost: string;
  lastHost: string;
  usableHosts: bigint;
  subnetMask: string;
  prefixLength: number;
}

export interface VLSMEntry {
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

export interface BitsVisualization {
  version: IPVersion;
  bits: string[];
  prefixLength: number;
}

const IPV4_REGEX = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const IPV6_REGEX = /^[0-9a-fA-F:]+$/;

export function parseIP(input: string): ParsedIP {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Empty IP address");

  if (trimmed.includes(":")) {
    return parseIPv6(trimmed);
  }
  return parseIPv4(trimmed);
}

function parseIPv4(input: string): ParsedIP {
  const match = input.match(IPV4_REGEX);
  if (!match) throw new Error(`Invalid IPv4 address: ${input}`);

  const parts = [match[1], match[2], match[3], match[4]].map(Number);
  for (const p of parts) {
    if (p < 0 || p > 255) throw new Error(`Invalid IPv4 address: ${input}`);
  }

  let value = 0n;
  for (const p of parts) {
    value = (value << 8n) | BigInt(p);
  }
  return { version: 4, value };
}

function parseIPv6(input: string): ParsedIP {
  if (!IPV6_REGEX.test(input)) {
    throw new Error(`Invalid IPv6 address: ${input}`);
  }

  let halves: string[];
  if (input.includes("::")) {
    halves = input.split("::");
    if (halves.length > 2) throw new Error(`Invalid IPv6 address: ${input}`);
  } else {
    halves = [input, ""];
  }

  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves[1] ? halves[1].split(":") : [];
  const missing = 8 - left.length - right.length;

  if (missing < 0) throw new Error(`Invalid IPv6 address: ${input}`);

  const groups = [...left, ...Array(missing).fill("0"), ...right];
  if (groups.length !== 8) throw new Error(`Invalid IPv6 address: ${input}`);

  let value = 0n;
  for (const g of groups) {
    const n = parseInt(g || "0", 16);
    if (isNaN(n) || n < 0 || n > 0xffff) {
      throw new Error(`Invalid IPv6 address: ${input}`);
    }
    value = (value << 16n) | BigInt(n);
  }
  return { version: 6, value };
}

export function formatIP(value: bigint, version: IPVersion): string {
  if (version === 4) {
    const bytes = [
      Number((value >> 24n) & 0xffn),
      Number((value >> 16n) & 0xffn),
      Number((value >> 8n) & 0xffn),
      Number(value & 0xffn),
    ];
    return bytes.join(".");
  }
  return formatIPv6(value);
}

function formatIPv6(value: bigint): string {
  const groups: number[] = [];
  for (let i = 7; i >= 0; i--) {
    groups[i] = Number((value >> BigInt(i * 16)) & 0xffffn);
  }

  const hex = groups.map((g) => g.toString(16));

  let bestStart = -1;
  let bestLen = 0;
  let curStart = -1;
  let curLen = 0;

  for (let i = 0; i < 8; i++) {
    if (groups[i] === 0) {
      if (curStart === -1) curStart = i;
      curLen = i - curStart + 1;
      if (curLen > bestLen) {
        bestStart = curStart;
        bestLen = curLen;
      }
    } else {
      curStart = -1;
      curLen = 0;
    }
  }

  if (bestLen < 2) return hex.join(":");

  const left = hex.slice(0, bestStart).join(":");
  const right = hex.slice(bestStart + bestLen).join(":");

  if (left && right) return `${left}::${right}`;
  if (left) return `${left}::`;
  if (right) return `::${right}`;
  return "::";
}

export function parseCIDR(input: string): { ip: ParsedIP; prefixLength: number } {
  const trimmed = input.trim();
  const slashIdx = trimmed.lastIndexOf("/");
  if (slashIdx === -1) throw new Error(`Invalid CIDR notation: ${input}`);

  const ipStr = trimmed.slice(0, slashIdx);
  const prefixStr = trimmed.slice(slashIdx + 1);

  const ip = parseIP(ipStr);
  const prefixLength = parseInt(prefixStr, 10);

  if (isNaN(prefixLength)) throw new Error(`Invalid prefix length: ${prefixStr}`);
  if (ip.version === 4 && (prefixLength < 0 || prefixLength > 32)) {
    throw new Error(`IPv4 prefix length must be 0-32, got ${prefixLength}`);
  }
  if (ip.version === 6 && (prefixLength < 0 || prefixLength > 128)) {
    throw new Error(`IPv6 prefix length must be 0-128, got ${prefixLength}`);
  }

  return { ip, prefixLength };
}

export function getIPClass(ip: ParsedIP): string | null {
  if (ip.version === 6) return null;
  const firstOctet = Number((ip.value >> 24n) & 0xffn);
  if (firstOctet < 128) return "A";
  if (firstOctet < 192) return "B";
  if (firstOctet < 224) return "C";
  if (firstOctet < 240) return "D";
  return "E";
}

function prefixMask(prefix: number, version: IPVersion): bigint {
  const bits = version === 4 ? 32 : 128;
  if (prefix === 0) return 0n;
  const max = version === 4 ? 0xffffffffn : (1n << 128n) - 1n;
  return max << BigInt(bits - prefix);
}

function hostMask(prefix: number, version: IPVersion): bigint {
  const bits = version === 4 ? 32 : 128;
  const max = version === 4 ? 0xffffffffn : (1n << 128n) - 1n;
  return max ^ prefixMask(prefix, version);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run libs/subnet --reporter=verbose`
Expected: All parse/format/parseCIDR/getIPClass tests PASS

- [ ] **Step 5: Commit**

```bash
git add libs/subnet/main.ts libs/subnet/__tests__/main.test.ts
git commit -m "feat(subnet): add types, parseIP, formatIP, parseCIDR, getIPClass"
```

---

### Task 2: getAddressType

**Files:**

- Modify: `libs/subnet/main.ts`
- Modify: `libs/subnet/__tests__/main.test.ts`

- [ ] **Step 1: Add getAddressType tests**

Append to `libs/subnet/__tests__/main.test.ts` (add import for `getAddressType`):

```ts
import { describe, it, expect } from "vitest";
import { parseIP, formatIP, parseCIDR, getIPClass, getAddressType } from "../main";
```

Append test block:

```ts
describe("getAddressType", () => {
  it("classifies 10.x as private", () => {
    expect(getAddressType(parseIP("10.0.0.1"))).toBe("private");
    expect(getAddressType(parseIP("10.255.255.255"))).toBe("private");
  });

  it("classifies 172.16.x - 172.31.x as private", () => {
    expect(getAddressType(parseIP("172.16.0.1"))).toBe("private");
    expect(getAddressType(parseIP("172.31.255.255"))).toBe("private");
  });

  it("classifies 192.168.x as private", () => {
    expect(getAddressType(parseIP("192.168.0.1"))).toBe("private");
    expect(getAddressType(parseIP("192.168.255.255"))).toBe("private");
  });

  it("classifies 127.x as loopback", () => {
    expect(getAddressType(parseIP("127.0.0.1"))).toBe("loopback");
    expect(getAddressType(parseIP("127.255.255.255"))).toBe("loopback");
  });

  it("classifies 169.254.x as linkLocal", () => {
    expect(getAddressType(parseIP("169.254.0.1"))).toBe("linkLocal");
  });

  it("classifies 224.x as multicast", () => {
    expect(getAddressType(parseIP("224.0.0.1"))).toBe("multicast");
    expect(getAddressType(parseIP("239.255.255.255"))).toBe("multicast");
  });

  it("classifies 240.x as reserved", () => {
    expect(getAddressType(parseIP("240.0.0.1"))).toBe("reserved");
    expect(getAddressType(parseIP("255.255.255.255"))).toBe("reserved");
  });

  it("classifies public IPv4", () => {
    expect(getAddressType(parseIP("8.8.8.8"))).toBe("public");
    expect(getAddressType(parseIP("172.32.0.1"))).toBe("public");
  });

  it("classifies IPv6 ::1 as loopback", () => {
    expect(getAddressType(parseIP("::1"))).toBe("loopback");
  });

  it("classifies IPv6 fe80:: as linkLocal", () => {
    expect(getAddressType(parseIP("fe80::1"))).toBe("linkLocal");
  });

  it("classifies IPv6 fc00:: as private (ULA)", () => {
    expect(getAddressType(parseIP("fc00::1"))).toBe("private");
    expect(getAddressType(parseIP("fd00::1"))).toBe("private");
  });

  it("classifies IPv6 ff00:: as multicast", () => {
    expect(getAddressType(parseIP("ff00::1"))).toBe("multicast");
  });

  it("classifies IPv6 public", () => {
    expect(getAddressType(parseIP("2001:db8::1"))).toBe("public");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run libs/subnet --reporter=verbose`
Expected: FAIL — getAddressType is not exported

- [ ] **Step 3: Add getAddressType to `libs/subnet/main.ts`**

Append to end of file:

```ts
export function getAddressType(ip: ParsedIP): AddressType {
  if (ip.version === 4) {
    const v = ip.value;
    const first = Number((v >> 24n) & 0xffn);
    const second = Number((v >> 16n) & 0xffn);

    if (first === 127) return "loopback";
    if (first === 169 && second === 254) return "linkLocal";
    if (first >= 224 && first <= 239) return "multicast";
    if (first >= 240) return "reserved";
    if (first === 10) return "private";
    if (first === 172 && second >= 16 && second <= 31) return "private";
    if (first === 192 && second === 168) return "private";
    return "public";
  }

  const v = ip.value;
  if (v === 1n) return "loopback";
  const top16 = Number((v >> 112n) & 0xffffn);
  const top10 = top16 >> 6;
  if (top10 === 0x3fa) return "linkLocal";
  const top7 = top16 >> 9;
  if (top7 === 0x7e) return "private";
  const top8 = top16 >> 8;
  if (top8 === 0xff) return "multicast";
  return "public";
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run libs/subnet --reporter=verbose`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add libs/subnet/main.ts libs/subnet/__tests__/main.test.ts
git commit -m "feat(subnet): add getAddressType for IPv4/IPv6 classification"
```

---

### Task 3: calculateCIDR, cidrToMask, maskToCidr

**Files:**

- Modify: `libs/subnet/main.ts`
- Modify: `libs/subnet/__tests__/main.test.ts`

- [ ] **Step 1: Add CIDR calculator tests**

Update import in test file to add `calculateCIDR`, `cidrToMask`, `maskToCidr`. Append test blocks:

```ts
describe("calculateCIDR", () => {
  it("calculates /24 typical", () => {
    const info = calculateCIDR("192.168.1.100/24");
    expect(info.networkAddress).toBe("192.168.1.0");
    expect(info.broadcastAddress).toBe("192.168.1.255");
    expect(info.firstHost).toBe("192.168.1.1");
    expect(info.lastHost).toBe("192.168.1.254");
    expect(info.totalHosts).toBe(256n);
    expect(info.usableHosts).toBe(254n);
    expect(info.subnetMask).toBe("255.255.255.0");
    expect(info.prefixLength).toBe(24);
    expect(info.ipClass).toBe("C");
    expect(info.addressType).toBe("private");
  });

  it("calculates /31 point-to-point (RFC 3021)", () => {
    const info = calculateCIDR("192.168.1.0/31");
    expect(info.networkAddress).toBe("192.168.1.0");
    expect(info.broadcastAddress).toBe("192.168.1.1");
    expect(info.firstHost).toBe("192.168.1.0");
    expect(info.lastHost).toBe("192.168.1.1");
    expect(info.usableHosts).toBe(2n);
    expect(info.totalHosts).toBe(2n);
  });

  it("calculates /32 single host", () => {
    const info = calculateCIDR("192.168.1.100/32");
    expect(info.networkAddress).toBe("192.168.1.100");
    expect(info.broadcastAddress).toBe("192.168.1.100");
    expect(info.firstHost).toBe("192.168.1.100");
    expect(info.lastHost).toBe("192.168.1.100");
    expect(info.usableHosts).toBe(1n);
    expect(info.totalHosts).toBe(1n);
  });

  it("calculates /0 full range", () => {
    const info = calculateCIDR("0.0.0.0/0");
    expect(info.networkAddress).toBe("0.0.0.0");
    expect(info.broadcastAddress).toBe("255.255.255.255");
    expect(info.totalHosts).toBe(4294967296n);
    expect(info.usableHosts).toBe(4294967294n);
  });

  it("calculates IPv6 /64", () => {
    const info = calculateCIDR("2001:db8::1/64");
    expect(info.version).toBe(6);
    expect(info.networkAddress).toBe("2001:db8::");
    expect(info.broadcastAddress).toBeNull();
    expect(info.firstHost).toBe("2001:db8::1");
    expect(info.lastHost).toBe("2001:db8::ffff:ffff:ffff:ffff");
    expect(info.totalHosts).toBe(1n << 64n);
    expect(info.usableHosts).toBe(1n << 64n);
    expect(info.subnetMask).toBe("");
    expect(info.ipClass).toBeNull();
  });

  it("calculates IPv6 /127 point-to-point", () => {
    const info = calculateCIDR("2001:db8::/127");
    expect(info.usableHosts).toBe(2n);
    expect(info.firstHost).toBe("2001:db8::");
    expect(info.lastHost).toBe("2001:db8::1");
  });

  it("calculates IPv6 /128 single host", () => {
    const info = calculateCIDR("2001:db8::1/128");
    expect(info.usableHosts).toBe(1n);
    expect(info.firstHost).toBe("2001:db8::1");
    expect(info.lastHost).toBe("2001:db8::1");
  });
});

describe("cidrToMask", () => {
  it("converts /24 to 255.255.255.0", () => {
    expect(cidrToMask(24, 4)).toBe("255.255.255.0");
  });
  it("converts /0 to 0.0.0.0", () => {
    expect(cidrToMask(0, 4)).toBe("0.0.0.0");
  });
  it("converts /32 to 255.255.255.255", () => {
    expect(cidrToMask(32, 4)).toBe("255.255.255.255");
  });
  it("returns empty string for IPv6", () => {
    expect(cidrToMask(64, 6)).toBe("");
  });
});

describe("maskToCidr", () => {
  it("converts 255.255.255.0 to /24", () => {
    expect(maskToCidr("255.255.255.0")).toBe(24);
  });
  it("converts 0.0.0.0 to /0", () => {
    expect(maskToCidr("0.0.0.0")).toBe(0);
  });
  it("converts 255.255.255.255 to /32", () => {
    expect(maskToCidr("255.255.255.255")).toBe(32);
  });
  it("converts 255.255.255.252 to /30", () => {
    expect(maskToCidr("255.255.255.252")).toBe(30);
  });
  it("throws on invalid mask", () => {
    expect(() => maskToCidr("255.0.255.0")).toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run libs/subnet --reporter=verbose`
Expected: FAIL — calculateCIDR is not exported

- [ ] **Step 3: Add cidrToMask, maskToCidr, calculateCIDR to `libs/subnet/main.ts`**

Append to end of file:

```ts
export function cidrToMask(prefix: number, version: IPVersion): string {
  if (version === 6) return "";
  if (prefix < 0 || prefix > 32) throw new Error(`Invalid prefix: ${prefix}`);
  return formatIP(prefixMask(prefix, 4), 4);
}

export function maskToCidr(mask: string): number {
  const ip = parseIP(mask);
  if (ip.version !== 4) throw new Error("Mask must be IPv4");

  const v = ip.value;
  if (v === 0n) return 0;

  let count = 0;
  let foundZero = false;
  for (let i = 31; i >= 0; i--) {
    const bit = (v >> BigInt(i)) & 1n;
    if (bit === 1n) {
      if (foundZero) throw new Error(`Invalid subnet mask: ${mask}`);
      count++;
    } else {
      foundZero = true;
    }
  }
  return count;
}

export function calculateCIDR(input: string): CIDRInfo {
  const { ip, prefixLength } = parseCIDR(input);
  const bits = ip.version === 4 ? 32 : 128;
  const mask = prefixMask(prefixLength, ip.version);
  const networkValue = ip.value & mask;
  const hostBitsCount = BigInt(bits - prefixLength);
  const totalHosts = 1n << hostBitsCount;
  const broadcastValue =
    ip.version === 4 ? networkValue | hostMask(prefixLength, ip.version) : null;

  let usableHosts: bigint;
  let firstHost: bigint;
  let lastHost: bigint;

  if (ip.version === 4) {
    if (prefixLength === 32) {
      usableHosts = 1n;
      firstHost = networkValue;
      lastHost = networkValue;
    } else if (prefixLength === 31) {
      usableHosts = 2n;
      firstHost = networkValue;
      lastHost = broadcastValue!;
    } else {
      usableHosts = totalHosts - 2n;
      firstHost = networkValue + 1n;
      lastHost = broadcastValue! - 1n;
    }
  } else {
    if (prefixLength === 128) {
      usableHosts = 1n;
      firstHost = networkValue;
      lastHost = networkValue;
    } else if (prefixLength === 127) {
      usableHosts = 2n;
      firstHost = networkValue;
      lastHost = networkValue + 1n;
    } else {
      usableHosts = totalHosts;
      firstHost = networkValue + 1n;
      lastHost = networkValue + totalHosts - 1n;
    }
  }

  return {
    version: ip.version,
    input: input.trim(),
    networkAddress: formatIP(networkValue, ip.version),
    broadcastAddress: broadcastValue !== null ? formatIP(broadcastValue, ip.version) : null,
    firstHost: formatIP(firstHost, ip.version),
    lastHost: formatIP(lastHost, ip.version),
    totalHosts,
    usableHosts,
    subnetMask: ip.version === 4 ? cidrToMask(prefixLength, 4) : "",
    prefixLength,
    ipClass: getIPClass(ip),
    addressType: getAddressType(ip),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run libs/subnet --reporter=verbose`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add libs/subnet/main.ts libs/subnet/__tests__/main.test.ts
git commit -m "feat(subnet): add calculateCIDR, cidrToMask, maskToCidr"
```

---

### Task 4: subnetSplitByCount, subnetSplitByHosts, vlsmAllocate

**Files:**

- Modify: `libs/subnet/main.ts`
- Modify: `libs/subnet/__tests__/main.test.ts`

- [ ] **Step 1: Add subnet split and VLSM tests**

Update import to add `subnetSplitByCount`, `subnetSplitByHosts`, `vlsmAllocate`. Append test blocks:

```ts
describe("subnetSplitByCount", () => {
  it("splits /24 into 4 subnets", () => {
    const results = subnetSplitByCount("192.168.1.0", 24, 4);
    expect(results).toHaveLength(4);
    expect(results[0].networkAddress).toBe("192.168.1.0");
    expect(results[0].prefixLength).toBe(26);
    expect(results[0].broadcastAddress).toBe("192.168.1.63");
    expect(results[1].networkAddress).toBe("192.168.1.64");
    expect(results[1].broadcastAddress).toBe("192.168.1.127");
    expect(results[2].networkAddress).toBe("192.168.1.128");
    expect(results[3].networkAddress).toBe("192.168.1.192");
  });

  it("splits /16 into 256 /24 subnets", () => {
    const results = subnetSplitByCount("192.168.0.0", 16, 256);
    expect(results).toHaveLength(256);
    expect(results[0].networkAddress).toBe("192.168.0.0");
    expect(results[255].networkAddress).toBe("192.168.255.0");
    expect(results[0].prefixLength).toBe(24);
  });

  it("throws when insufficient space", () => {
    expect(() => subnetSplitByCount("192.168.1.0", 24, 1024)).toThrow();
  });

  it("splits IPv6", () => {
    const results = subnetSplitByCount("2001:db8::", 32, 4);
    expect(results).toHaveLength(4);
    expect(results[0].prefixLength).toBe(34);
    expect(results[0].networkAddress).toBe("2001:db8::");
    expect(results[1].networkAddress).toBe("2001:db8:4000::");
  });
});

describe("subnetSplitByHosts", () => {
  it("splits /24 with 30 hosts into 8 /27 subnets", () => {
    const results = subnetSplitByHosts("192.168.1.0", 24, 30);
    expect(results).toHaveLength(8);
    expect(results[0].prefixLength).toBe(27);
    expect(results[0].usableHosts).toBe(30n);
  });

  it("splits /24 with 2 hosts into 64 /30 subnets", () => {
    const results = subnetSplitByHosts("192.168.1.0", 24, 2);
    expect(results).toHaveLength(64);
    expect(results[0].prefixLength).toBe(30);
  });
});

describe("vlsmAllocate", () => {
  it("allocates 3 unequal subnets (first-fit decreasing)", () => {
    const entries = [
      { name: "Subnet A", requiredHosts: 100 },
      { name: "Subnet B", requiredHosts: 50 },
      { name: "Subnet C", requiredHosts: 10 },
    ];
    const results = vlsmAllocate("192.168.1.0", 24, entries);
    expect(results).toHaveLength(3);
    expect(results[0].name).toBe("Subnet A");
    expect(results[0].allocatedPrefix).toBe(25);
    expect(results[0].usableHosts).toBe(126n);
    expect(results[0].networkAddress).toBe("192.168.1.0");

    expect(results[1].name).toBe("Subnet B");
    expect(results[1].allocatedPrefix).toBe(26);
    expect(results[1].usableHosts).toBe(62n);
    expect(results[1].networkAddress).toBe("192.168.1.128");

    expect(results[2].name).toBe("Subnet C");
    expect(results[2].allocatedPrefix).toBe(28);
    expect(results[2].networkAddress).toBe("192.168.1.192");
  });

  it("preserves input order on ties", () => {
    const entries = [
      { name: "First", requiredHosts: 10 },
      { name: "Second", requiredHosts: 10 },
    ];
    const results = vlsmAllocate("10.0.0.0", 24, entries);
    expect(results[0].name).toBe("First");
    expect(results[1].name).toBe("Second");
  });

  it("throws when total exceeds parent", () => {
    const entries = [
      { name: "Big", requiredHosts: 200 },
      { name: "Also Big", requiredHosts: 200 },
    ];
    expect(() => vlsmAllocate("192.168.1.0", 24, entries)).toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run libs/subnet --reporter=verbose`
Expected: FAIL — subnetSplitByCount is not exported

- [ ] **Step 3: Add subnet split and VLSM functions to `libs/subnet/main.ts`**

Append to end of file:

```ts
function nextPowerOf2(n: number): number {
  if (n <= 0) return 1;
  return 1 << Math.ceil(Math.log2(n));
}

function hostsToPrefix(hosts: number, version: IPVersion): number {
  const maxBits = version === 4 ? 32 : 128;
  const needed = nextPowerOf2(hosts + 2);
  return maxBits - Math.log2(needed);
}

function buildSubnetResult(
  index: number,
  networkValue: bigint,
  prefixLength: number,
  version: IPVersion
): SubnetResult {
  const bits = version === 4 ? 32 : 128;
  const totalHosts = 1n << BigInt(bits - prefixLength);
  const broadcastValue = version === 4 ? networkValue | hostMask(prefixLength, version) : null;

  let usableHosts: bigint;
  let firstHost: bigint;
  let lastHost: bigint;

  if (version === 4) {
    if (prefixLength === 32) {
      usableHosts = 1n;
      firstHost = networkValue;
      lastHost = networkValue;
    } else if (prefixLength === 31) {
      usableHosts = 2n;
      firstHost = networkValue;
      lastHost = broadcastValue!;
    } else {
      usableHosts = totalHosts - 2n;
      firstHost = networkValue + 1n;
      lastHost = broadcastValue! - 1n;
    }
  } else {
    if (prefixLength === 128) {
      usableHosts = 1n;
      firstHost = networkValue;
      lastHost = networkValue;
    } else if (prefixLength === 127) {
      usableHosts = 2n;
      firstHost = networkValue;
      lastHost = networkValue + 1n;
    } else {
      usableHosts = totalHosts;
      firstHost = networkValue + 1n;
      lastHost = networkValue + totalHosts - 1n;
    }
  }

  return {
    index,
    networkAddress: formatIP(networkValue, version),
    broadcastAddress: broadcastValue !== null ? formatIP(broadcastValue, version) : null,
    firstHost: formatIP(firstHost, version),
    lastHost: formatIP(lastHost, version),
    usableHosts,
    subnetMask: version === 4 ? cidrToMask(prefixLength, 4) : "",
    prefixLength,
  };
}

export function subnetSplitByCount(
  network: string,
  parentPrefix: number,
  subnetCount: number
): SubnetResult[] {
  const ip = parseIP(network);
  const bits = ip.version === 4 ? 32 : 128;
  const extraBits = Math.ceil(Math.log2(subnetCount));
  const newPrefix = parentPrefix + extraBits;

  if (newPrefix > bits) {
    throw new Error(
      `Insufficient address space: cannot fit ${subnetCount} subnets in /${parentPrefix}`
    );
  }

  if (subnetCount > 1 << (bits - parentPrefix)) {
    throw new Error(
      `Insufficient address space: cannot fit ${subnetCount} subnets in /${parentPrefix}`
    );
  }

  const networkValue = ip.value & prefixMask(parentPrefix, ip.version);
  const subnetSize = 1n << BigInt(bits - newPrefix);
  const results: SubnetResult[] = [];

  for (let i = 0; i < subnetCount; i++) {
    const subnetAddr = networkValue + BigInt(i) * subnetSize;
    results.push(buildSubnetResult(i, subnetAddr, newPrefix, ip.version));
  }

  return results;
}

export function subnetSplitByHosts(
  network: string,
  parentPrefix: number,
  hostsPerSubnet: number
): SubnetResult[] {
  const ip = parseIP(network);
  const newPrefix = hostsToPrefix(hostsPerSubnet, ip.version);

  if (newPrefix < parentPrefix) {
    throw new Error(
      `Host count ${hostsPerSubnet} requires /${newPrefix} which is larger than parent /${parentPrefix}`
    );
  }

  const availableSubnets = 1 << (newPrefix - parentPrefix);
  return subnetSplitByCount(network, parentPrefix, availableSubnets);
}

export function vlsmAllocate(
  network: string,
  parentPrefix: number,
  entries: Array<{ name: string; requiredHosts: number }>
): VLSMEntry[] {
  const ip = parseIP(network);
  const bits = ip.version === 4 ? 32 : 128;
  const networkValue = ip.value & prefixMask(parentPrefix, ip.version);
  const parentSize = 1n << BigInt(bits - parentPrefix);
  const parentEnd = networkValue + parentSize;

  const sorted = entries
    .map((e, i) => ({ ...e, originalIndex: i }))
    .sort((a, b) => {
      if (b.requiredHosts !== a.requiredHosts) return b.requiredHosts - a.requiredHosts;
      return a.originalIndex - b.originalIndex;
    });

  const results: VLSMEntry[] = [];
  let currentAddr = networkValue;

  for (const entry of sorted) {
    const allocatedPrefix = hostsToPrefix(entry.requiredHosts, ip.version);
    const subnetSize = 1n << BigInt(bits - allocatedPrefix);

    if (currentAddr + subnetSize > parentEnd) {
      throw new Error("Total required hosts exceed parent network capacity");
    }

    const subnetAddr = currentAddr & prefixMask(allocatedPrefix, ip.version);
    const broadcastValue =
      ip.version === 4 ? subnetAddr | hostMask(allocatedPrefix, ip.version) : null;

    let usableHosts: bigint;
    let firstHost: bigint;
    let lastHost: bigint;

    if (ip.version === 4) {
      if (allocatedPrefix === 32) {
        usableHosts = 1n;
        firstHost = subnetAddr;
        lastHost = subnetAddr;
      } else if (allocatedPrefix === 31) {
        usableHosts = 2n;
        firstHost = subnetAddr;
        lastHost = broadcastValue!;
      } else {
        usableHosts = subnetSize - 2n;
        firstHost = subnetAddr + 1n;
        lastHost = broadcastValue! - 1n;
      }
    } else {
      if (allocatedPrefix === 128) {
        usableHosts = 1n;
        firstHost = subnetAddr;
        lastHost = subnetAddr;
      } else if (allocatedPrefix === 127) {
        usableHosts = 2n;
        firstHost = subnetAddr;
        lastHost = subnetAddr + 1n;
      } else {
        usableHosts = subnetSize;
        firstHost = subnetAddr + 1n;
        lastHost = subnetAddr + subnetSize - 1n;
      }
    }

    results.push({
      name: entry.name,
      requiredHosts: entry.requiredHosts,
      allocatedPrefix,
      networkAddress: formatIP(subnetAddr, ip.version),
      broadcastAddress: broadcastValue !== null ? formatIP(broadcastValue, ip.version) : null,
      firstHost: formatIP(firstHost, ip.version),
      lastHost: formatIP(lastHost, ip.version),
      usableHosts,
      subnetMask: ip.version === 4 ? cidrToMask(allocatedPrefix, 4) : "",
    });

    currentAddr = subnetAddr + subnetSize;
  }

  return results;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run libs/subnet --reporter=verbose`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add libs/subnet/main.ts libs/subnet/__tests__/main.test.ts
git commit -m "feat(subnet): add subnetSplitByCount, subnetSplitByHosts, vlsmAllocate"
```

---

### Task 5: isSameSubnet, getBitsVisualization

**Files:**

- Modify: `libs/subnet/main.ts`
- Modify: `libs/subnet/__tests__/main.test.ts`

- [ ] **Step 1: Add isSameSubnet and getBitsVisualization tests**

Update import to add `isSameSubnet`, `getBitsVisualization`. Append test blocks:

```ts
describe("isSameSubnet", () => {
  it("returns true for same subnet", () => {
    expect(isSameSubnet("192.168.1.1", "192.168.1.100", 24)).toBe(true);
  });

  it("returns false for different subnet", () => {
    expect(isSameSubnet("192.168.1.1", "192.168.2.1", 24)).toBe(false);
  });

  it("returns false for cross-boundary", () => {
    expect(isSameSubnet("192.168.1.127", "192.168.1.128", 25)).toBe(false);
  });

  it("works with IPv6", () => {
    expect(isSameSubnet("2001:db8::1", "2001:db8::100", 32)).toBe(true);
    expect(isSameSubnet("2001:db8::1", "2001:db9::1", 32)).toBe(false);
  });
});

describe("getBitsVisualization", () => {
  it("returns 32 bits for IPv4", () => {
    const vis = getBitsVisualization(0xc0a80164n, 24, 4);
    expect(vis.version).toBe(4);
    expect(vis.bits).toHaveLength(32);
    expect(vis.prefixLength).toBe(24);
    expect(vis.bits[0]).toBe("1");
    expect(vis.bits[1]).toBe("1");
    expect(vis.bits[2]).toBe("0");
  });

  it("returns 128 bits for IPv6", () => {
    const vis = getBitsVisualization(0x20010db8000000000000000000000001n, 32, 6);
    expect(vis.version).toBe(6);
    expect(vis.bits).toHaveLength(128);
    expect(vis.prefixLength).toBe(32);
  });

  it("correct boundary for /0", () => {
    const vis = getBitsVisualization(0n, 0, 4);
    expect(vis.prefixLength).toBe(0);
    expect(vis.bits.every((b) => b === "0")).toBe(true);
  });

  it("correct boundary for /32", () => {
    const vis = getBitsVisualization(0xffffffffn, 32, 4);
    expect(vis.prefixLength).toBe(32);
    expect(vis.bits.every((b) => b === "1")).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run libs/subnet --reporter=verbose`
Expected: FAIL — isSameSubnet is not exported

- [ ] **Step 3: Add isSameSubnet and getBitsVisualization to `libs/subnet/main.ts`**

Append to end of file:

```ts
export function isSameSubnet(ip1: string, ip2: string, prefixLength: number): boolean {
  const a = parseIP(ip1);
  const b = parseIP(ip2);

  if (a.version !== b.version) return false;

  const mask = prefixMask(prefixLength, a.version);
  return (a.value & mask) === (b.value & mask);
}

export function getBitsVisualization(
  value: bigint,
  prefixLength: number,
  version: IPVersion
): BitsVisualization {
  const totalBits = version === 4 ? 32 : 128;
  const bits: string[] = [];

  for (let i = totalBits - 1; i >= 0; i--) {
    bits.push(String(Number((value >> BigInt(i)) & 1n)));
  }

  return {
    version,
    bits,
    prefixLength,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run libs/subnet --reporter=verbose`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add libs/subnet/main.ts libs/subnet/__tests__/main.test.ts
git commit -m "feat(subnet): add isSameSubnet, getBitsVisualization"
```
