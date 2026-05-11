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
  for (let i = 0; i < 8; i++) {
    groups[i] = Number((value >> BigInt((7 - i) * 16)) & 0xffffn);
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
