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
