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
