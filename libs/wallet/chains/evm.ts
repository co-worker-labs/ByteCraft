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
