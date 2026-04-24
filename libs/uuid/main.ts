import CryptoJS from "crypto-js";

export type UuidVersion = "v1" | "v3" | "v4" | "v5" | "v7";
export type UuidFormat = "standard" | "no-hyphens" | "braces";
export type UuidBytes = Uint8Array; // always length 16

export const NAMESPACES = {
  DNS: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  URL: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
  OID: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
  X500: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
} as const;

export type NamespaceLabel = keyof typeof NAMESPACES;

export interface GenerateOptions {
  version: UuidVersion;
  count: number;
  namespace?: string;
  name?: string;
}

const HEX = "0123456789abcdef";

function bytesToHex(bytes: UuidBytes): string {
  let s = "";
  for (const b of bytes) s += HEX[b >> 4] + HEX[b & 0x0f];
  return s;
}

export function formatUuid(bytes: UuidBytes, fmt: UuidFormat, upper: boolean): string {
  const h = bytesToHex(bytes);
  const dashed = `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
  let out: string;
  switch (fmt) {
    case "standard":
      out = dashed;
      break;
    case "no-hyphens":
      out = h;
      break;
    case "braces":
      out = `{${dashed}}`;
      break;
  }
  return upper ? out.toUpperCase() : out;
}

// Accept standard/no-hyphens/braces/any-case, ignore leading/trailing whitespace.
const UUID_HEX_RE = /^[0-9a-f]{32}$/i;

export function parseUuid(input: string): UuidBytes {
  let s = input.trim().toLowerCase();
  if (s.startsWith("{") && s.endsWith("}")) s = s.slice(1, -1);
  s = s.replace(/-/g, "");
  if (!UUID_HEX_RE.test(s)) {
    throw new Error("Invalid UUID");
  }
  const out = new Uint8Array(16);
  for (let i = 0; i < 16; i++) out[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export function isValidUuid(input: string): boolean {
  try {
    parseUuid(input);
    return true;
  } catch {
    return false;
  }
}

function randomBytes(n: number): Uint8Array {
  const out = new Uint8Array(n);
  crypto.getRandomValues(out);
  return out;
}

function generateV4(): UuidBytes {
  if (typeof crypto.randomUUID === "function") {
    return parseUuid(crypto.randomUUID());
  }
  const b = randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  return b;
}

function generateV7(): UuidBytes {
  const b = new Uint8Array(16);
  const ts = Date.now();
  b[0] = (ts / 2 ** 40) & 0xff;
  b[1] = (ts / 2 ** 32) & 0xff;
  b[2] = (ts >>> 24) & 0xff;
  b[3] = (ts >>> 16) & 0xff;
  b[4] = (ts >>> 8) & 0xff;
  b[5] = ts & 0xff;
  const rand = randomBytes(10);
  for (let i = 0; i < 10; i++) b[6 + i] = rand[i];
  b[6] = (b[6] & 0x0f) | 0x70;
  b[8] = (b[8] & 0x3f) | 0x80;
  return b;
}

const UUID_EPOCH_OFFSET_MS = 12219292800000;

function generateV1(): UuidBytes {
  const nowMs = Date.now();
  const base100ns = (nowMs + UUID_EPOCH_OFFSET_MS) * 10000;
  const subMs = Math.floor(Math.random() * 10000);
  const ts = base100ns + subMs;

  const b = new Uint8Array(16);
  const high = Math.floor(ts / 2 ** 32);
  const low = ts >>> 0;
  const timeLow = low;
  const timeMid = high & 0xffff;
  const timeHi = (high >>> 16) & 0x0fff;

  b[0] = (timeLow >>> 24) & 0xff;
  b[1] = (timeLow >>> 16) & 0xff;
  b[2] = (timeLow >>> 8) & 0xff;
  b[3] = timeLow & 0xff;
  b[4] = (timeMid >>> 8) & 0xff;
  b[5] = timeMid & 0xff;
  b[6] = ((timeHi >>> 8) & 0x0f) | 0x10;
  b[7] = timeHi & 0xff;

  const csRand = randomBytes(2);
  const clockSeq = ((csRand[0] << 8) | csRand[1]) & 0x3fff;
  b[8] = ((clockSeq >>> 8) & 0x3f) | 0x80;
  b[9] = clockSeq & 0xff;

  const node = randomBytes(6);
  node[0] |= 0x01;
  for (let i = 0; i < 6; i++) b[10 + i] = node[i];

  return b;
}

function bytesToWordArray(bytes: Uint8Array): CryptoJS.lib.WordArray {
  const words: number[] = [];
  for (let i = 0; i < bytes.length; i++) {
    words[i >>> 2] = (words[i >>> 2] || 0) | (bytes[i] << (24 - (i % 4) * 8));
  }
  return CryptoJS.lib.WordArray.create(words, bytes.length);
}

function wordArrayToBytes(wa: CryptoJS.lib.WordArray, length: number): Uint8Array {
  const out = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    out[i] = (wa.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return out;
}

function namespaceAndName(namespace: string, name: string): CryptoJS.lib.WordArray {
  const nsBytes = parseUuid(namespace);
  const nameBytes = new TextEncoder().encode(name);
  const combined = new Uint8Array(nsBytes.length + nameBytes.length);
  combined.set(nsBytes, 0);
  combined.set(nameBytes, nsBytes.length);
  return bytesToWordArray(combined);
}

function generateV3(namespace: string, name: string): UuidBytes {
  const digest = CryptoJS.MD5(namespaceAndName(namespace, name));
  const b = wordArrayToBytes(digest, 16);
  b[6] = (b[6] & 0x0f) | 0x30;
  b[8] = (b[8] & 0x3f) | 0x80;
  return b;
}

function generateV5(namespace: string, name: string): UuidBytes {
  const digest = CryptoJS.SHA1(namespaceAndName(namespace, name));
  const b = wordArrayToBytes(digest, 16);
  b[6] = (b[6] & 0x0f) | 0x50;
  b[8] = (b[8] & 0x3f) | 0x80;
  return b;
}

export function generate(opts: GenerateOptions): UuidBytes[] {
  const count = Math.max(1, Math.floor(opts.count));
  switch (opts.version) {
    case "v4": {
      const out: UuidBytes[] = [];
      for (let i = 0; i < count; i++) out.push(generateV4());
      return out;
    }
    case "v7": {
      const out: UuidBytes[] = [];
      for (let i = 0; i < count; i++) out.push(generateV7());
      return out;
    }
    case "v1": {
      const out: UuidBytes[] = [];
      for (let i = 0; i < count; i++) out.push(generateV1());
      return out;
    }
    case "v3":
    case "v5": {
      if (!opts.namespace) throw new Error("namespace is required for v3/v5");
      if (opts.name === undefined) throw new Error("name is required for v3/v5");
      const fn = opts.version === "v3" ? generateV3 : generateV5;
      return [fn(opts.namespace, opts.name)];
    }
  }
}
