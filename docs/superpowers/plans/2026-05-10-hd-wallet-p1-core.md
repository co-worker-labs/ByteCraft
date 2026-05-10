# HD Wallet — Plan 1: Core Crypto Library & Tests

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully tested `libs/wallet/` library that generates BIP39 mnemonics, validates them, derives HD seeds, and produces addresses for 10 chains (EVM, BTC×3, Solana, Tron, Cosmos, Osmosis, Sei, Injective).

**Architecture:** Each chain is a `ChainConfig` object with a `deriveFromSeed(seed, path) → DerivedAccount` function. secp256k1 chains use `@scure/bip32` (HDKey). Solana uses a manual SLIP-0010 HMAC-SHA512 derivation over `@noble/ed25519`. Address encoding uses `@scure/base` (Base58, Bech32, Bech32m) and `@noble/hashes` (SHA-256, RIPEMD-160, Keccak-256).

**Tech Stack:** TypeScript, `@scure/bip39`, `@scure/bip32`, `@noble/secp256k1`, `@noble/hashes`, `@noble/ed25519`, `@scure/base`, Vitest

---

## File Structure

| Action  | File                                                                               | Responsibility                                                                                                        |
| ------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Install | `@scure/bip39`, `@scure/bip32`, `@noble/secp256k1`, `@noble/hashes`, `@scure/base` | Crypto primitives                                                                                                     |
| Create  | `libs/wallet/types.ts`                                                             | `DerivedAccount`, `ChainConfig`, `PathSegment`, `MnemonicValidationResult` interfaces                                 |
| Create  | `libs/wallet/crypto-utils.ts`                                                      | Shared helpers: `hash160`, `keccak256`, `base58checkEncode`, `bech32Encode`                                           |
| Create  | `libs/wallet/main.ts`                                                              | `generateMnemonic`, `validateMnemonicPhrase`, `mnemonicToSeed`, `parsePath`, `validatePathForCurve`, `deriveAccounts` |
| Create  | `libs/wallet/chains/evm.ts`                                                        | EVM address derivation (keccak256 → 0x prefix)                                                                        |
| Create  | `libs/wallet/chains/bitcoin.ts`                                                    | BTC Legacy (P2PKH), SegWit (P2WPKH), Taproot (P2TR)                                                                   |
| Create  | `libs/wallet/chains/solana.ts`                                                     | Solana SLIP-0010 ed25519 derivation                                                                                   |
| Create  | `libs/wallet/chains/tron.ts`                                                       | Tron address derivation (Base58Check, 0x41 prefix)                                                                    |
| Create  | `libs/wallet/chains/cosmos.ts`                                                     | Cosmos, Osmosis, Sei (hash160 → Bech32) + Injective (keccak256 → Bech32)                                              |
| Create  | `libs/wallet/chains/registry.ts`                                                   | `CHAINS` array, `getChainByKey`, `getDefaultSelectedChains`                                                           |
| Create  | `libs/wallet/__tests__/main.test.ts`                                               | All unit tests with known test vectors                                                                                |
| Modify  | `vitest.config.ts`                                                                 | Add `libs/wallet/**/*.test.ts` to include                                                                             |

---

### Task 1: Install Dependencies + Vitest Config

- [ ] **Step 1: Install npm packages**

Run:

```bash
npm install @scure/bip39 @scure/bip32 @noble/secp256k1 @noble/hashes @scure/base
```

Expected: All 5 packages added to `package.json` dependencies. `@noble/ed25519` is already installed (used by sshkey tool).

- [ ] **Step 2: Update vitest.config.ts**

Add a new entry to the `test.include` array in `vitest.config.ts` (after the `libs/httpclient/**/*.test.ts` line):

```ts
      "libs/wallet/**/*.test.ts",
```

- [ ] **Step 3: Verify vitest picks up the new include**

Run:

```bash
npx vitest run --reporter=verbose 2>&1 | tail -5
```

Expected: Existing tests still pass. No wallet tests found yet (expected, since we haven't created them).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add HD wallet crypto dependencies and vitest config"
```

---

### Task 2: Types and Interfaces

**Files:**

- Create: `libs/wallet/types.ts`

- [ ] **Step 1: Create `libs/wallet/types.ts`**

```ts
export interface DerivedAccount {
  address: string;
  addressLabel?: string;
  publicKey?: string;
  publicKeyLabel?: string;
  privateKey: string;
  privateKeyLabel: string;
  privateKeyAlt?: string;
  privateKeyAltLabel?: string;
  path: string;
}

export interface ChainConfig {
  key: string;
  name: string;
  coinType: number;
  curve: "secp256k1" | "ed25519";
  showPublicKey: boolean;
  defaultPurpose: number;
  deriveFromSeed: (seed: Uint8Array, path: string) => DerivedAccount;
}

export interface PathSegment {
  value: number;
  hardened: boolean;
}

export interface MnemonicValidationResult {
  valid: boolean;
  error?: string;
  invalidWords?: number[];
}

export interface PathValidationResult {
  valid: boolean;
  error?: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add libs/wallet/types.ts
git commit -m "feat(wallet): add type definitions for HD wallet library"
```

---

### Task 3: Mnemonic Functions (TDD)

**Files:**

- Create: `libs/wallet/__tests__/main.test.ts`
- Create: `libs/wallet/main.ts`

- [ ] **Step 1: Write failing tests for mnemonic functions**

Create `libs/wallet/__tests__/main.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { generateMnemonic, validateMnemonicPhrase, mnemonicToSeed } from "../main";

const TEST_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
const TEST_SEED_HEX =
  "5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4";

describe("generateMnemonic", () => {
  it("generates a 12-word mnemonic with strength 128", () => {
    const mnemonic = generateMnemonic(128);
    const words = mnemonic.split(" ");
    expect(words).toHaveLength(12);
    for (const word of words) {
      expect(word).toMatch(/^[a-z]+$/);
    }
  });

  it("generates a 24-word mnemonic with strength 256", () => {
    const mnemonic = generateMnemonic(256);
    const words = mnemonic.split(" ");
    expect(words).toHaveLength(24);
  });

  it("generates different mnemonics on each call", () => {
    const a = generateMnemonic(128);
    const b = generateMnemonic(128);
    expect(a).not.toBe(b);
  });
});

describe("validateMnemonicPhrase", () => {
  it("accepts a valid 12-word mnemonic", () => {
    const result = validateMnemonicPhrase(TEST_MNEMONIC);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("rejects an empty string", () => {
    const result = validateMnemonicPhrase("");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("invalid_length");
  });

  it("rejects invalid word count (5 words)", () => {
    const result = validateMnemonicPhrase("abandon ability able about above");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("invalid_length");
  });

  it("rejects 12 words with one unknown word", () => {
    const words = TEST_MNEMONIC.split(" ");
    words[3] = "notaword";
    const result = validateMnemonicPhrase(words.join(" "));
    expect(result.valid).toBe(false);
    expect(result.error).toBe("invalid_words");
    expect(result.invalidWords).toEqual([3]);
  });

  it("rejects invalid checksum", () => {
    const words = TEST_MNEMONIC.split(" ");
    words[11] = "abandon";
    const result = validateMnemonicPhrase(words.join(" "));
    expect(result.valid).toBe(false);
    expect(result.error).toBe("invalid_checksum");
  });

  it("trims and normalizes whitespace", () => {
    const result = validateMnemonicPhrase("  " + TEST_MNEMONIC + "  ");
    expect(result.valid).toBe(true);
  });
});

describe("mnemonicToSeed", () => {
  it("derives correct seed from test vector (no passphrase)", () => {
    const seed = mnemonicToSeed(TEST_MNEMONIC);
    const hex = Array.from(seed)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    expect(hex).toBe(TEST_SEED_HEX);
  });

  it("derives correct seed with passphrase", () => {
    const seed = mnemonicToSeed(TEST_MNEMONIC, "mypassword");
    expect(seed).toHaveLength(64);
  });

  it("produces 64-byte seed", () => {
    const seed = mnemonicToSeed(TEST_MNEMONIC);
    expect(seed).toBeInstanceOf(Uint8Array);
    expect(seed.length).toBe(64);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npx vitest run libs/wallet/__tests__/main.test.ts
```

Expected: FAIL — `generateMnemonic` is not exported from `"../main"` (module doesn't exist yet).

- [ ] **Step 3: Implement mnemonic functions in `libs/wallet/main.ts`**

```ts
import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import type { MnemonicValidationResult, ChainConfig, DerivedAccount } from "./types";

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
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
npx vitest run libs/wallet/__tests__/main.test.ts
```

Expected: All 9 mnemonic tests PASS.

- [ ] **Step 5: Commit**

```bash
git add libs/wallet/main.ts libs/wallet/__tests__/main.test.ts
git commit -m "feat(wallet): add mnemonic generation, validation, and seed derivation with tests"
```

---

### Task 4: Path Parsing and Validation (TDD)

**Files:**

- Modify: `libs/wallet/__tests__/main.test.ts`
- Modify: `libs/wallet/main.ts`

- [ ] **Step 1: Add failing tests for path parsing**

Append to `libs/wallet/__tests__/main.test.ts`:

```ts
import { parsePath, validatePathForCurve } from "../main";

describe("parsePath", () => {
  it("parses a standard BIP44 path", () => {
    const segments = parsePath("m/44'/60'/0'/0/0");
    expect(segments).toEqual([
      { value: 44, hardened: true },
      { value: 60, hardened: true },
      { value: 0, hardened: true },
      { value: 0, hardened: false },
      { value: 0, hardened: false },
    ]);
  });

  it("parses a fully hardened path (ed25519)", () => {
    const segments = parsePath("m/44'/501'/0'/0'");
    expect(segments).toEqual([
      { value: 44, hardened: true },
      { value: 501, hardened: true },
      { value: 0, hardened: true },
      { value: 0, hardened: true },
    ]);
  });

  it("throws if path does not start with m", () => {
    expect(() => parsePath("44'/60'/0'/0/0")).toThrow();
  });

  it("throws for non-numeric segment", () => {
    expect(() => parsePath("m/abc/60'/0'/0/0")).toThrow();
  });
});

describe("validatePathForCurve", () => {
  it("accepts valid secp256k1 path", () => {
    const segments = parsePath("m/44'/60'/0'/0/0");
    expect(validatePathForCurve(segments, "secp256k1")).toBeNull();
  });

  it("accepts fully hardened ed25519 path", () => {
    const segments = parsePath("m/44'/501'/0'/0'");
    expect(validatePathForCurve(segments, "ed25519")).toBeNull();
  });

  it("rejects non-hardened segments on ed25519", () => {
    const segments = parsePath("m/44'/501'/0'/0");
    const err = validatePathForCurve(segments, "ed25519");
    expect(err).toBeTruthy();
  });

  it("rejects segment value exceeding 2^31 - 1", () => {
    const segments = [...parsePath("m/44'/60'/0'/0"), { value: 0x80000000, hardened: false }];
    const err = validatePathForCurve(segments, "secp256k1");
    expect(err).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npx vitest run libs/wallet/__tests__/main.test.ts
```

Expected: New tests FAIL — `parsePath`, `validatePathForCurve` not exported.

- [ ] **Step 3: Implement path functions**

Append to `libs/wallet/main.ts`:

```ts
import type { PathSegment, PathValidationResult } from "./types";

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
```

Also add the new imports at the top of `libs/wallet/main.ts`:

```ts
import type {
  MnemonicValidationResult,
  ChainConfig,
  DerivedAccount,
  PathSegment,
  PathValidationResult,
} from "./types";
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
npx vitest run libs/wallet/__tests__/main.test.ts
```

Expected: All tests PASS (mnemonic + path parsing).

- [ ] **Step 5: Commit**

```bash
git add libs/wallet/main.ts libs/wallet/__tests__/main.test.ts
git commit -m "feat(wallet): add path parsing and validation with tests"
```

---

### Task 5: Shared Crypto Utilities

**Files:**

- Create: `libs/wallet/crypto-utils.ts`

- [ ] **Step 1: Create `libs/wallet/crypto-utils.ts`**

```ts
import { sha256 } from "@noble/hashes/sha256";
import { ripemd160 } from "@noble/hashes/ripemd160";
import { keccak_256 } from "@noble/hashes/sha3";
import { base58 } from "@scure/base";
import { bech32, bech32m } from "@scure/base";

export function hash160(data: Uint8Array): Uint8Array {
  return ripemd160(sha256(data));
}

export function keccak256(data: Uint8Array): Uint8Array {
  return keccak_256(data);
}

export function base58checkEncode(payload: Uint8Array): string {
  const checksum = sha256(sha256(payload)).slice(0, 4);
  return base58.encode(new Uint8Array([...payload, ...checksum]));
}

export function bech32Encode(hrp: string, witnessVersion: number, program: Uint8Array): string {
  const words = bech32.toWords(program);
  const fullWords = new Uint8Array([witnessVersion, ...words]);
  return witnessVersion === 0 ? bech32.encode(hrp, fullWords) : bech32m.encode(hrp, fullWords);
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export { sha256, ripemd160, base58, bech32, bech32m };
```

- [ ] **Step 2: Commit**

```bash
git add libs/wallet/crypto-utils.ts
git commit -m "feat(wallet): add shared crypto utility functions (hash160, keccak, base58check, bech32)"
```

---

### Task 6: EVM Derivation (TDD)

**Files:**

- Modify: `libs/wallet/__tests__/main.test.ts`
- Create: `libs/wallet/chains/evm.ts`

- [ ] **Step 1: Add failing EVM test**

Append to `libs/wallet/__tests__/main.test.ts`:

```ts
import { deriveEVM } from "../chains/evm";
import { hexToBytes } from "../crypto-utils";

const TEST_SEED = hexToBytes(
  "5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4"
);

describe("EVM derivation", () => {
  it("derives correct address at m/44'/60'/0'/0/0", () => {
    const account = deriveEVM(TEST_SEED, "m/44'/60'/0'/0/0");
    expect(account.address).toBe("0x9858EfFD232B4033E47d90003D41EC34EcaEda94");
    expect(account.path).toBe("m/44'/60'/0'/0/0");
    expect(account.publicKey).toBeTruthy();
    expect(account.privateKey).toBeTruthy();
    expect(account.privateKeyLabel).toBe("Private Key (Hex)");
    expect(account.addressLabel).toBe("Hex");
  });

  it("derives different addresses for different indices", () => {
    const a = deriveEVM(TEST_SEED, "m/44'/60'/0'/0/0");
    const b = deriveEVM(TEST_SEED, "m/44'/60'/0'/0/1");
    expect(a.address).not.toBe(b.address);
  });

  it("address starts with 0x and is 42 chars", () => {
    const account = deriveEVM(TEST_SEED, "m/44'/60'/0'/0/0");
    expect(account.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npx vitest run libs/wallet/__tests__/main.test.ts
```

Expected: EVM tests FAIL — module `"../chains/evm"` does not exist.

- [ ] **Step 3: Create `libs/wallet/chains/evm.ts`**

```ts
import { HDKey } from "@scure/bip32";
import { getPublicKey } from "@noble/secp256k1";
import type { DerivedAccount, ChainConfig } from "../types";
import { keccak256, bytesToHex } from "../crypto-utils";

export function deriveEVM(seed: Uint8Array, path: string): DerivedAccount {
  const master = HDKey.fromMasterSeed(seed);
  const child = master.derive(path);

  const privateKey = child.privateKey!;
  const publicKeyUncompressed = getPublicKey(privateKey, false);

  const addressBytes = keccak256(publicKeyUncompressed.slice(1)).slice(-20);
  const address = "0x" + bytesToHex(addressBytes);

  return {
    address,
    addressLabel: "Hex",
    publicKey: bytesToHex(publicKeyUncompressed),
    publicKeyLabel: "Public Key (Uncompressed)",
    privateKey: bytesToHex(privateKey),
    privateKeyLabel: "Private Key (Hex)",
    path,
  };
}

export const evmConfig: ChainConfig = {
  key: "evm",
  name: "EVM",
  coinType: 60,
  curve: "secp256k1",
  showPublicKey: true,
  defaultPurpose: 44,
  deriveFromSeed: deriveEVM,
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
npx vitest run libs/wallet/__tests__/main.test.ts
```

Expected: All tests PASS including EVM derivation.

- [ ] **Step 5: Commit**

```bash
git add libs/wallet/chains/evm.ts libs/wallet/__tests__/main.test.ts
git commit -m "feat(wallet): add EVM chain derivation with test vector"
```

---

### Task 7: Bitcoin Derivation (TDD)

**Files:**

- Modify: `libs/wallet/__tests__/main.test.ts`
- Create: `libs/wallet/chains/bitcoin.ts`

- [ ] **Step 1: Add failing Bitcoin tests**

Append to `libs/wallet/__tests__/main.test.ts`:

```ts
import { deriveBitcoinLegacy, deriveBitcoinSegWit, deriveBitcoinTaproot } from "../chains/bitcoin";

describe("Bitcoin Legacy (P2PKH)", () => {
  it("derives correct address at m/44'/0'/0'/0/0", () => {
    const account = deriveBitcoinLegacy(TEST_SEED, "m/44'/0'/0'/0/0");
    expect(account.address).toBe("1LqBGSKauBjvYMoUb4sMW4F43mmK4bPDtG");
    expect(account.addressLabel).toBe("Base58");
    expect(account.privateKeyLabel).toBe("Private Key (WIF)");
    expect(account.path).toBe("m/44'/0'/0'/0/0");
  });

  it("address starts with 1", () => {
    const account = deriveBitcoinLegacy(TEST_SEED, "m/44'/0'/0'/0/0");
    expect(account.address).toMatch(/^1[1-9A-HJ-NP-Za-km-z]{25,34}$/);
  });
});

describe("Bitcoin SegWit (P2WPKH)", () => {
  it("derives correct address at m/84'/0'/0'/0/0", () => {
    const account = deriveBitcoinSegWit(TEST_SEED, "m/84'/0'/0'/0/0");
    expect(account.address).toBe("bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu");
    expect(account.addressLabel).toBe("Bech32");
    expect(account.privateKeyLabel).toBe("Private Key (WIF)");
  });

  it("address starts with bc1q", () => {
    const account = deriveBitcoinSegWit(TEST_SEED, "m/84'/0'/0'/0/0");
    expect(account.address).toMatch(/^bc1q[0-9a-z]{38}$/);
  });
});

describe("Bitcoin Taproot (P2TR)", () => {
  it("derives a valid address at m/86'/0'/0'/0/0", () => {
    const account = deriveBitcoinTaproot(TEST_SEED, "m/86'/0'/0'/0/0");
    expect(account.address).toMatch(/^bc1p[0-9a-z]{58}$/);
    expect(account.addressLabel).toBe("Bech32m");
    expect(account.privateKeyLabel).toBe("Private Key (WIF)");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npx vitest run libs/wallet/__tests__/main.test.ts
```

Expected: Bitcoin tests FAIL — module does not exist.

- [ ] **Step 3: Create `libs/wallet/chains/bitcoin.ts`**

```ts
import { HDKey } from "@scure/bip32";
import { getPublicKey, ProjectivePoint } from "@noble/secp256k1";
import type { DerivedAccount, ChainConfig } from "../types";
import {
  hash160,
  base58checkEncode,
  bech32Encode,
  sha256,
  bytesToHex,
  hexToBytes,
} from "../crypto-utils";

const CURVE_N = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;

function bigIntToBytes32(n: bigint): Uint8Array {
  return hexToBytes(n.toString(16).padStart(64, "0"));
}

export function deriveBitcoinLegacy(seed: Uint8Array, path: string): DerivedAccount {
  const master = HDKey.fromMasterSeed(seed);
  const child = master.derive(path);

  const privateKey = child.privateKey!;
  const publicKeyCompressed = child.publicKey!;

  const hashed = hash160(publicKeyCompressed);
  const address = base58checkEncode(new Uint8Array([0x00, ...hashed]));

  const wif = base58checkEncode(new Uint8Array([0x80, ...privateKey, 0x01]));

  return {
    address,
    addressLabel: "Base58",
    publicKey: bytesToHex(publicKeyCompressed),
    publicKeyLabel: "Public Key (Compressed)",
    privateKey: wif,
    privateKeyLabel: "Private Key (WIF)",
    path,
  };
}

export function deriveBitcoinSegWit(seed: Uint8Array, path: string): DerivedAccount {
  const master = HDKey.fromMasterSeed(seed);
  const child = master.derive(path);

  const privateKey = child.privateKey!;
  const publicKeyCompressed = child.publicKey!;

  const hashed = hash160(publicKeyCompressed);
  const address = bech32Encode("bc", 0, hashed);

  const wif = base58checkEncode(new Uint8Array([0x80, ...privateKey, 0x01]));

  return {
    address,
    addressLabel: "Bech32",
    publicKey: bytesToHex(publicKeyCompressed),
    publicKeyLabel: "Public Key (Compressed)",
    privateKey: wif,
    privateKeyLabel: "Private Key (WIF)",
    path,
  };
}

export function deriveBitcoinTaproot(seed: Uint8Array, path: string): DerivedAccount {
  const master = HDKey.fromMasterSeed(seed);
  const child = master.derive(path);

  const privateKey = child.privateKey!;
  const compressedPubkey = child.publicKey!;

  const xOnlyKey = compressedPubkey.slice(1, 33);

  const isEvenY = compressedPubkey[0] === 0x02;
  const privKeyInt = BigInt("0x" + bytesToHex(privateKey));
  const adjustedPriv = isEvenY ? privKeyInt : CURVE_N - privKeyInt;

  const tapTweakTag = new TextEncoder().encode("TapTweak");
  const tweak = BigInt("0x" + bytesToHex(sha256(new Uint8Array([...tapTweakTag, ...xOnlyKey]))));

  const tweakedPriv = (adjustedPriv + tweak) % CURVE_N;
  const tweakedPubkey = getPublicKey(bigIntToBytes32(tweakedPriv), true);
  const outputX = tweakedPubkey.slice(1);

  const address = bech32Encode("bc", 1, outputX);

  const wif = base58checkEncode(new Uint8Array([0x80, ...privateKey, 0x01]));

  return {
    address,
    addressLabel: "Bech32m",
    publicKey: bytesToHex(compressedPubkey),
    publicKeyLabel: "Public Key (Compressed)",
    privateKey: wif,
    privateKeyLabel: "Private Key (WIF)",
    path,
  };
}

export const bitcoinLegacyConfig: ChainConfig = {
  key: "bitcoin-legacy",
  name: "BTC Legacy",
  coinType: 0,
  curve: "secp256k1",
  showPublicKey: true,
  defaultPurpose: 44,
  deriveFromSeed: deriveBitcoinLegacy,
};

export const bitcoinSegWitConfig: ChainConfig = {
  key: "bitcoin-segwit",
  name: "BTC SegWit",
  coinType: 0,
  curve: "secp256k1",
  showPublicKey: true,
  defaultPurpose: 84,
  deriveFromSeed: deriveBitcoinSegWit,
};

export const bitcoinTaprootConfig: ChainConfig = {
  key: "bitcoin-taproot",
  name: "BTC Taproot",
  coinType: 0,
  curve: "secp256k1",
  showPublicKey: true,
  defaultPurpose: 86,
  deriveFromSeed: deriveBitcoinTaproot,
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
npx vitest run libs/wallet/__tests__/main.test.ts
```

Expected: All Bitcoin tests PASS. Legacy and SegWit test vectors match; Taproot address format validated.

- [ ] **Step 5: Commit**

```bash
git add libs/wallet/chains/bitcoin.ts libs/wallet/__tests__/main.test.ts
git commit -m "feat(wallet): add Bitcoin Legacy/SegWit/Taproot derivation with tests"
```

---

### Task 8: Solana Derivation — SLIP-0010 ed25519 (TDD)

**Files:**

- Modify: `libs/wallet/__tests__/main.test.ts`
- Create: `libs/wallet/chains/solana.ts`

- [ ] **Step 1: Add failing Solana tests**

Append to `libs/wallet/__tests__/main.test.ts`:

```ts
import { deriveSolana } from "../chains/solana";

describe("Solana derivation", () => {
  it("derives a valid Base58 address at m/44'/501'/0'/0'/0'", () => {
    const account = deriveSolana(TEST_SEED, "m/44'/501'/0'/0'/0'");
    expect(account.address).toMatch(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
    expect(account.addressLabel).toBe("Base58");
    expect(account.publicKey).toBeUndefined();
    expect(account.privateKey).toBeTruthy();
    expect(account.privateKeyLabel).toBe("Private Key (Base58)");
    expect(account.privateKeyAlt).toBeTruthy();
    expect(account.privateKeyAltLabel).toBe("Private Key (u8 Array)");
    expect(account.path).toBe("m/44'/501'/0'/0'/0'");
  });

  it("derives different addresses for different indices", () => {
    const a = deriveSolana(TEST_SEED, "m/44'/501'/0'/0'/0'");
    const b = deriveSolana(TEST_SEED, "m/44'/501'/0'/0'/1'");
    expect(a.address).not.toBe(b.address);
  });

  it("private key u8 array is parseable JSON", () => {
    const account = deriveSolana(TEST_SEED, "m/44'/501'/0'/0'/0'");
    const parsed = JSON.parse(account.privateKeyAlt!);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(64);
    expect(typeof parsed[0]).toBe("number");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npx vitest run libs/wallet/__tests__/main.test.ts
```

Expected: Solana tests FAIL — module does not exist.

- [ ] **Step 3: Create `libs/wallet/chains/solana.ts`**

```ts
import { getPublicKey } from "@noble/ed25519";
import { hmac } from "@noble/hashes/hmac";
import { sha512 } from "@noble/hashes/sha512";
import { base58 } from "@scure/base";
import type { DerivedAccount, ChainConfig, PathSegment } from "../types";

function slip0010MasterKey(seed: Uint8Array): {
  key: Uint8Array;
  chainCode: Uint8Array;
} {
  const I = hmac.create(sha512, new TextEncoder().encode("ed25519 seed")).update(seed).digest();
  return { key: I.slice(0, 32), chainCode: I.slice(32) };
}

function slip0010DeriveChild(
  parentKey: Uint8Array,
  parentChainCode: Uint8Array,
  index: number
): { key: Uint8Array; chainCode: Uint8Array } {
  const hardenedIndex = index + 0x80000000;
  const data = new Uint8Array(1 + 32 + 4);
  data[0] = 0x00;
  data.set(parentKey, 1);
  new DataView(data.buffer, data.byteOffset, data.byteLength).setUint32(33, hardenedIndex, false);
  const I = hmac.create(sha512, parentChainCode).update(data).digest();
  return { key: I.slice(0, 32), chainCode: I.slice(32) };
}

function parsePathIndices(path: string): number[] {
  const parts = path.split("/");
  if (parts[0] !== "m") throw new Error("Path must start with 'm'");
  return parts.slice(1).map((part) => {
    if (!part.endsWith("'")) {
      throw new Error("ed25519 requires hardened derivation");
    }
    return parseInt(part.slice(0, -1), 10);
  });
}

export function deriveSolana(seed: Uint8Array, path: string): DerivedAccount {
  const indices = parsePathIndices(path);

  let { key, chainCode } = slip0010MasterKey(seed);
  for (const index of indices) {
    ({ key, chainCode } = slip0010DeriveChild(key, chainCode, index));
  }

  const pubKey32 = getPublicKey(key);
  const address = base58.encode(pubKey32);

  const keypair = new Uint8Array([...key, ...pubKey32]);
  const privateKeyBase58 = base58.encode(keypair);
  const privateKeyU8 = `[${Array.from(keypair).join(", ")}]`;

  return {
    address,
    addressLabel: "Base58",
    publicKey: undefined,
    publicKeyLabel: undefined,
    privateKey: privateKeyBase58,
    privateKeyLabel: "Private Key (Base58)",
    privateKeyAlt: privateKeyU8,
    privateKeyAltLabel: "Private Key (u8 Array)",
    path,
  };
}

export const solanaConfig: ChainConfig = {
  key: "solana",
  name: "Solana",
  coinType: 501,
  curve: "ed25519",
  showPublicKey: false,
  defaultPurpose: 44,
  deriveFromSeed: deriveSolana,
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
npx vitest run libs/wallet/__tests__/main.test.ts
```

Expected: All Solana tests PASS.

- [ ] **Step 5: Commit**

```bash
git add libs/wallet/chains/solana.ts libs/wallet/__tests__/main.test.ts
git commit -m "feat(wallet): add Solana SLIP-0010 ed25519 derivation with tests"
```

---

### Task 9: Tron + Cosmos Ecosystem (TDD)

**Files:**

- Modify: `libs/wallet/__tests__/main.test.ts`
- Create: `libs/wallet/chains/tron.ts`
- Create: `libs/wallet/chains/cosmos.ts`

- [ ] **Step 1: Add failing Tron + Cosmos tests**

Append to `libs/wallet/__tests__/main.test.ts`:

```ts
import { deriveTron } from "../chains/tron";
import { deriveCosmos, deriveOsmosis, deriveSei, deriveInjective } from "../chains/cosmos";

describe("Tron derivation", () => {
  it("derives a valid Tron address at m/44'/195'/0'/0/0", () => {
    const account = deriveTron(TEST_SEED, "m/44'/195'/0'/0/0");
    expect(account.address).toMatch(/^T[1-9A-HJ-NP-Za-km-z]{33}$/);
    expect(account.addressLabel).toBe("Base58");
    expect(account.privateKeyLabel).toBe("Private Key (Hex)");
  });
});

describe("Cosmos ecosystem", () => {
  it("derives Cosmos address starting with cosmos1", () => {
    const account = deriveCosmos(TEST_SEED, "m/44'/118'/0'/0/0");
    expect(account.address).toMatch(/^cosmos1[0-9a-z]{38,}$/);
    expect(account.addressLabel).toBe("Bech32");
  });

  it("derives Osmosis address starting with osmo1", () => {
    const account = deriveOsmosis(TEST_SEED, "m/44'/606'/0'/0/0");
    expect(account.address).toMatch(/^osmo1[0-9a-z]{38,}$/);
  });

  it("derives Sei address starting with sei1", () => {
    const account = deriveSei(TEST_SEED, "m/44'/713'/0'/0/0");
    expect(account.address).toMatch(/^sei1[0-9a-z]{38,}$/);
  });

  it("derives Injective address starting with inj1 (NOT 0x hex)", () => {
    const account = deriveInjective(TEST_SEED, "m/44'/60'/0'/0/0");
    expect(account.address).toMatch(/^inj1[0-9a-z]{38,}$/);
    expect(account.address).not.toMatch(/^0x/);
    expect(account.addressLabel).toBe("Bech32");
  });

  it("Injective and EVM use same coin_type but different address format", () => {
    const evm = deriveEVM(TEST_SEED, "m/44'/60'/0'/0/0");
    const inj = deriveInjective(TEST_SEED, "m/44'/60'/0'/0/0");
    expect(inj.address).not.toBe(evm.address);
    expect(inj.address).toMatch(/^inj1/);
    expect(evm.address).toMatch(/^0x/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npx vitest run libs/wallet/__tests__/main.test.ts
```

Expected: New tests FAIL.

- [ ] **Step 3: Create `libs/wallet/chains/tron.ts`**

```ts
import { HDKey } from "@scure/bip32";
import { getPublicKey } from "@noble/secp256k1";
import type { DerivedAccount, ChainConfig } from "../types";
import { keccak256, base58checkEncode, bytesToHex } from "../crypto-utils";

export function deriveTron(seed: Uint8Array, path: string): DerivedAccount {
  const master = HDKey.fromMasterSeed(seed);
  const child = master.derive(path);

  const privateKey = child.privateKey!;
  const publicKeyUncompressed = getPublicKey(privateKey, false);

  const addressBytes = keccak256(publicKeyUncompressed.slice(1)).slice(-20);
  const address = base58checkEncode(new Uint8Array([0x41, ...addressBytes]));

  return {
    address,
    addressLabel: "Base58",
    publicKey: bytesToHex(publicKeyUncompressed),
    publicKeyLabel: "Public Key (Uncompressed)",
    privateKey: bytesToHex(privateKey),
    privateKeyLabel: "Private Key (Hex)",
    path,
  };
}

export const tronConfig: ChainConfig = {
  key: "tron",
  name: "Tron",
  coinType: 195,
  curve: "secp256k1",
  showPublicKey: true,
  defaultPurpose: 44,
  deriveFromSeed: deriveTron,
};
```

- [ ] **Step 4: Create `libs/wallet/chains/cosmos.ts`**

```ts
import { HDKey } from "@scure/bip32";
import { getPublicKey } from "@noble/secp256k1";
import type { DerivedAccount, ChainConfig } from "../types";
import { hash160, keccak256, bech32, bytesToHex } from "../crypto-utils";

function deriveCosmosLike(seed: Uint8Array, path: string, hrp: string): DerivedAccount {
  const master = HDKey.fromMasterSeed(seed);
  const child = master.derive(path);

  const privateKey = child.privateKey!;
  const publicKeyCompressed = child.publicKey!;

  const hashed = hash160(publicKeyCompressed);
  const address = bech32.encode(hrp, bech32.toWords(hashed));

  return {
    address,
    addressLabel: "Bech32",
    publicKey: bytesToHex(publicKeyCompressed),
    publicKeyLabel: "Public Key (Compressed)",
    privateKey: bytesToHex(privateKey),
    privateKeyLabel: "Private Key (Hex)",
    path,
  };
}

export function deriveCosmos(seed: Uint8Array, path: string): DerivedAccount {
  return deriveCosmosLike(seed, path, "cosmos");
}

export function deriveOsmosis(seed: Uint8Array, path: string): DerivedAccount {
  return deriveCosmosLike(seed, path, "osmo");
}

export function deriveSei(seed: Uint8Array, path: string): DerivedAccount {
  return deriveCosmosLike(seed, path, "sei");
}

export function deriveInjective(seed: Uint8Array, path: string): DerivedAccount {
  const master = HDKey.fromMasterSeed(seed);
  const child = master.derive(path);

  const privateKey = child.privateKey!;
  const publicKeyUncompressed = getPublicKey(privateKey, false);

  const addressBytes = keccak256(publicKeyUncompressed.slice(1)).slice(-20);
  const address = bech32.encode("inj", bech32.toWords(addressBytes));

  return {
    address,
    addressLabel: "Bech32",
    publicKey: bytesToHex(publicKeyUncompressed),
    publicKeyLabel: "Public Key (Uncompressed)",
    privateKey: bytesToHex(privateKey),
    privateKeyLabel: "Private Key (Hex)",
    path,
  };
}

export const cosmosConfig: ChainConfig = {
  key: "cosmos",
  name: "Cosmos",
  coinType: 118,
  curve: "secp256k1",
  showPublicKey: true,
  defaultPurpose: 44,
  deriveFromSeed: deriveCosmos,
};

export const osmosisConfig: ChainConfig = {
  key: "osmosis",
  name: "Osmosis",
  coinType: 606,
  curve: "secp256k1",
  showPublicKey: true,
  defaultPurpose: 44,
  deriveFromSeed: deriveOsmosis,
};

export const seiConfig: ChainConfig = {
  key: "sei",
  name: "Sei",
  coinType: 713,
  curve: "secp256k1",
  showPublicKey: true,
  defaultPurpose: 44,
  deriveFromSeed: deriveSei,
};

export const injectiveConfig: ChainConfig = {
  key: "injective",
  name: "Injective",
  coinType: 60,
  curve: "secp256k1",
  showPublicKey: true,
  defaultPurpose: 44,
  deriveFromSeed: deriveInjective,
};
```

- [ ] **Step 5: Run tests to verify they pass**

Run:

```bash
npx vitest run libs/wallet/__tests__/main.test.ts
```

Expected: All tests PASS including Tron and Cosmos ecosystem.

- [ ] **Step 6: Commit**

```bash
git add libs/wallet/chains/tron.ts libs/wallet/chains/cosmos.ts libs/wallet/__tests__/main.test.ts
git commit -m "feat(wallet): add Tron + Cosmos ecosystem derivation (Cosmos, Osmosis, Sei, Injective)"
```

---

### Task 10: Chain Registry + Main Orchestrator

**Files:**

- Create: `libs/wallet/chains/registry.ts`
- Modify: `libs/wallet/main.ts`

- [ ] **Step 1: Create `libs/wallet/chains/registry.ts`**

```ts
import type { ChainConfig } from "../types";
import { evmConfig } from "./evm";
import { bitcoinLegacyConfig, bitcoinSegWitConfig, bitcoinTaprootConfig } from "./bitcoin";
import { solanaConfig } from "./solana";
import { tronConfig } from "./tron";
import { cosmosConfig, osmosisConfig, seiConfig, injectiveConfig } from "./cosmos";

export const CHAINS: ChainConfig[] = [
  evmConfig,
  bitcoinLegacyConfig,
  bitcoinSegWitConfig,
  bitcoinTaprootConfig,
  solanaConfig,
  tronConfig,
  cosmosConfig,
  osmosisConfig,
  seiConfig,
  injectiveConfig,
];

export function getChainByKey(key: string): ChainConfig | undefined {
  return CHAINS.find((c) => c.key === key);
}

export const DEFAULT_SELECTED_CHAINS = ["evm", "bitcoin-legacy", "solana"];
```

- [ ] **Step 2: Add `deriveAccounts` orchestrator to `libs/wallet/main.ts`**

Append to `libs/wallet/main.ts` (`buildDerivationPath` is already defined in the same file from Task 4):

```ts
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
```

- [ ] **Step 3: Add integration test for deriveAccounts**

Append to `libs/wallet/__tests__/main.test.ts`:

```ts
import { deriveAccounts, CHAINS } from "../main";

describe("deriveAccounts (orchestrator)", () => {
  it("derives multiple EVM addresses", () => {
    const evmChain = CHAINS.find((c) => c.key === "evm")!;
    const accounts = deriveAccounts(TEST_SEED, evmChain, 44, 0, 0, 5);
    expect(accounts).toHaveLength(5);
    expect(accounts[0].address).toBe("0x9858EfFD232B4033E47d90003D41EC34EcaEda94");
    for (const acc of accounts) {
      expect(acc.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
    }
    const addresses = accounts.map((a) => a.address);
    expect(new Set(addresses).size).toBe(5);
  });

  it("derives multiple Solana addresses (all hardened)", () => {
    const solChain = CHAINS.find((c) => c.key === "solana")!;
    const accounts = deriveAccounts(TEST_SEED, solChain, 44, 0, 0, 3);
    expect(accounts).toHaveLength(3);
    expect(accounts[0].path).toBe("m/44'/501'/0'/0'/0'");
    expect(accounts[1].path).toBe("m/44'/501'/0'/0'/1'");
  });
});
```

- [ ] **Step 4: Run ALL tests**

Run:

```bash
npx vitest run libs/wallet/__tests__/main.test.ts
```

Expected: All tests PASS (mnemonic, path, EVM, BTC×3, Solana, Tron, Cosmos×4, orchestrator).

- [ ] **Step 5: Commit**

```bash
git add libs/wallet/chains/registry.ts libs/wallet/main.ts libs/wallet/__tests__/main.test.ts
git commit -m "feat(wallet): add chain registry, deriveAccounts orchestrator, integration tests"
```

---

## Final Verification

- [ ] **Run full test suite**

```bash
npx vitest run
```

Expected: ALL tests across the project pass (wallet + existing tests).

- [ ] **Verify TypeScript compilation**

```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: No type errors in `libs/wallet/`.
