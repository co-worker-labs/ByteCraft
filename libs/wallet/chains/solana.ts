import * as ed from "@noble/ed25519";
import { hmac } from "@noble/hashes/hmac.js";
import { sha512 } from "@noble/hashes/sha2.js";
import { base58 } from "@scure/base";
import type { DerivedAccount, ChainConfig } from "../types";

ed.hashes.sha512 = sha512;

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

  const pubKey32 = ed.getPublicKey(key);
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
