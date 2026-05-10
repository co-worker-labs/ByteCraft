import { sha256 } from "@noble/hashes/sha2.js";
import { ripemd160 } from "@noble/hashes/legacy.js";
import { keccak_256 } from "@noble/hashes/sha3.js";
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
