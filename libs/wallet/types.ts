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
