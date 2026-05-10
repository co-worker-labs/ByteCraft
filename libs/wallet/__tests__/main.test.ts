import { describe, it, expect } from "vitest";
import {
  generateMnemonic,
  validateMnemonicPhrase,
  mnemonicToSeed,
  parsePath,
  validatePathForCurve,
  deriveAccounts,
  CHAINS,
} from "../main";
import { deriveEVM } from "../chains/evm";
import { deriveBitcoinLegacy, deriveBitcoinSegWit, deriveBitcoinTaproot } from "../chains/bitcoin";
import { deriveSolana } from "../chains/solana";
import { deriveTron } from "../chains/tron";
import { deriveCosmos, deriveOsmosis, deriveSei, deriveInjective } from "../chains/cosmos";
import { hexToBytes } from "../crypto-utils";

const TEST_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
const TEST_SEED_HEX =
  "5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4";

const TEST_SEED = hexToBytes(TEST_SEED_HEX);

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

describe("EVM derivation", () => {
  it("derives correct address at m/44'/60'/0'/0/0", () => {
    const account = deriveEVM(TEST_SEED, "m/44'/60'/0'/0/0");
    expect(account.address).toBe("0x9858effd232b4033e47d90003d41ec34ecaeda94");
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

describe("Bitcoin Legacy (P2PKH)", () => {
  it("derives correct address at m/44'/0'/0'/0/0", () => {
    const account = deriveBitcoinLegacy(TEST_SEED, "m/44'/0'/0'/0/0");
    expect(account.address).toBe("1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA");
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

describe("deriveAccounts (orchestrator)", () => {
  it("derives multiple EVM addresses", () => {
    const evmChain = CHAINS.find((c) => c.key === "evm")!;
    const accounts = deriveAccounts(TEST_SEED, evmChain, 44, 0, 0, 5);
    expect(accounts).toHaveLength(5);
    expect(accounts[0].address).toBe("0x9858effd232b4033e47d90003d41ec34ecaeda94");
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
