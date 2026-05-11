import { HDKey } from "@scure/bip32";
import { getPublicKey } from "@noble/secp256k1";
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
