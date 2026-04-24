import { v1, v3, v4, v5, v7, parse, stringify, validate } from "uuid";

export type UuidVersion = "v1" | "v3" | "v4" | "v5" | "v7";
export type UuidFormat = "standard" | "no-hyphens" | "braces";
export type UuidBytes = Uint8Array; // always length 16

export const NAMESPACES = {
  DNS: v3.DNS,
  URL: v3.URL,
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

export function formatUuid(bytes: UuidBytes, fmt: UuidFormat, upper: boolean): string {
  const dashed = stringify(bytes);
  let out: string;
  switch (fmt) {
    case "standard":
      out = dashed;
      break;
    case "no-hyphens":
      out = dashed.replace(/-/g, "");
      break;
    case "braces":
      out = `{${dashed}}`;
      break;
  }
  return upper ? out.toUpperCase() : out;
}

// Accept standard/no-hyphens/braces/any-case, ignore leading/trailing whitespace.
export function parseUuid(input: string): UuidBytes {
  let s = input.trim();
  if (s.startsWith("{") && s.endsWith("}")) s = s.slice(1, -1);
  if (!s.includes("-") && /^[0-9a-f]{32}$/i.test(s)) {
    s = `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
  }
  if (!validate(s)) {
    throw new Error("Invalid UUID");
  }
  return new Uint8Array(parse(s));
}

export function isValidUuid(input: string): boolean {
  try {
    parseUuid(input);
    return true;
  } catch {
    return false;
  }
}

function toBytes(s: string): UuidBytes {
  return new Uint8Array(parse(s));
}

export function generate(opts: GenerateOptions): UuidBytes[] {
  const count = Math.max(1, Math.floor(opts.count));
  switch (opts.version) {
    case "v4": {
      const out: UuidBytes[] = [];
      for (let i = 0; i < count; i++) out.push(toBytes(v4()));
      return out;
    }
    case "v7": {
      const out: UuidBytes[] = [];
      for (let i = 0; i < count; i++) out.push(toBytes(v7()));
      return out;
    }
    case "v1": {
      const out: UuidBytes[] = [];
      for (let i = 0; i < count; i++) out.push(toBytes(v1()));
      return out;
    }
    case "v3":
    case "v5": {
      if (!opts.namespace) throw new Error("namespace is required for v3/v5");
      if (opts.name === undefined) throw new Error("name is required for v3/v5");
      const fn = opts.version === "v3" ? v3 : v5;
      return [toBytes(fn(opts.name, opts.namespace))];
    }
  }
}
