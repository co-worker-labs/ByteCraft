import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import type {
  MnemonicValidationResult,
  ChainConfig,
  DerivedAccount,
  PathSegment,
  PathValidationResult,
} from "./types";

const VALID_WORD_COUNTS = [12, 15, 18, 21, 24];

export function generateMnemonic(strength: 128 | 256 = 128): string {
  return bip39.generateMnemonic(wordlist, strength);
}

export function validateMnemonicPhrase(mnemonic: string): MnemonicValidationResult {
  const words = mnemonic.trim().split(/\s+/).filter(Boolean);

  if (!VALID_WORD_COUNTS.includes(words.length)) {
    return { valid: false, error: "invalid_length" };
  }

  const lower = words.map((w) => w.toLowerCase());
  const invalidIndices: number[] = [];
  for (let i = 0; i < lower.length; i++) {
    if (!wordlist.includes(lower[i])) {
      invalidIndices.push(i);
    }
  }
  if (invalidIndices.length > 0) {
    return { valid: false, error: "invalid_words", invalidWords: invalidIndices };
  }

  if (!bip39.validateMnemonic(mnemonic.trim(), wordlist)) {
    return { valid: false, error: "invalid_checksum" };
  }

  return { valid: true };
}

export function mnemonicToSeed(mnemonic: string, passphrase?: string): Uint8Array {
  return bip39.mnemonicToSeedSync(mnemonic, passphrase);
}

const MAX_INDEX = 0x7fffffff;

export function parsePath(path: string): PathSegment[] {
  const parts = path.split("/");
  if (parts[0] !== "m") {
    throw new Error("Path must start with 'm'");
  }
  return parts.slice(1).map((part) => {
    const hardened = part.endsWith("'");
    const raw = hardened ? part.slice(0, -1) : part;
    const value = parseInt(raw, 10);
    if (isNaN(value)) {
      throw new Error(`Invalid path segment: ${part}`);
    }
    return { value, hardened };
  });
}

export function validatePathForCurve(
  segments: PathSegment[],
  curve: "secp256k1" | "ed25519"
): string | null {
  for (let i = 0; i < segments.length; i++) {
    const { value, hardened } = segments[i];
    if (value < 0 || value > MAX_INDEX) {
      return `Segment ${i + 1} value out of range (0–${MAX_INDEX})`;
    }
    if (curve === "ed25519" && !hardened) {
      return `ed25519 chains require all path segments to be hardened (segment ${i + 1} is not hardened)`;
    }
  }
  return null;
}

export function pathToString(segments: PathSegment[]): string {
  return "m/" + segments.map((s) => (s.hardened ? `${s.value}'` : `${s.value}`)).join("/");
}

export function buildDerivationPath(
  purpose: number,
  coinType: number,
  account: number,
  change: number,
  index: number,
  curve: "secp256k1" | "ed25519"
): string {
  if (curve === "ed25519") {
    return `m/${purpose}'/${coinType}'/${account}'/${change}'/${index}'`;
  }
  return `m/${purpose}'/${coinType}'/${account}'/${change}/${index}`;
}

export function deriveAccounts(
  seed: Uint8Array,
  chain: ChainConfig,
  purpose: number,
  account: number,
  change: number,
  count: number
): DerivedAccount[] {
  const accounts: DerivedAccount[] = [];
  for (let i = 0; i < count; i++) {
    const path = buildDerivationPath(purpose, chain.coinType, account, change, i, chain.curve);
    accounts.push(chain.deriveFromSeed(seed, path));
  }
  return accounts;
}

export { CHAINS, DEFAULT_SELECTED_CHAINS } from "./chains/registry";
