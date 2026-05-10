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
