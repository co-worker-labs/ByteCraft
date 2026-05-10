# HD Wallet Generator — Design Spec

## Overview

A browser-based HD (Hierarchical Deterministic) wallet tool that generates mnemonic phrases and derives addresses across multiple blockchain networks. All operations run entirely client-side — no data leaves the browser.

**Route**: `/wallet`  
**Tool key**: `wallet`  
**Category**: `security`  
**Icon**: `Wallet` (lucide-react)

## Features

### 1. Mnemonic Input

- Textarea for entering a BIP39 mnemonic phrase (12/15/18/21/24 words, space-separated)
- **Generate** button to create a random mnemonic (word count selector: 12 or 24)
- Optional **Passphrase** input (BIP39 passphrase / "25th word"), collapsed by default, click to expand
- Real-time mnemonic validation status displayed below textarea:
  - Invalid word count → "Invalid mnemonic length"
  - Unknown word → highlight which word is invalid
  - Checksum failure → "Invalid checksum"
  - Uses `@scure/bip39` `validateMnemonic(mnemonic, wordlist)` with English wordlist only (`wordlists.english`)
- BIP39 supports multiple language wordlists (Japanese, Spanish, etc.), but this tool only supports **English** to keep scope minimal

### 2. HD Path Editor

- Five inline editable fields representing the BIP44 path: `m / 44' / {coin_type}' / {account}' / {change}' / {index}`
- Each field is a small Input with path separators displayed between them
- Switching chain Tab auto-fills the standard `coin_type` for that chain; user can override
- **Address Count** input (default 5, range 1–20) controls how many addresses to derive (index 0 to N-1)

#### Path validation

- Each segment must be a valid number (0 to 2^31 - 1)
- Hardened segments indicated by `'` suffix
- Invalid segments highlighted red; derivation paused until fixed
- For ed25519 chains (Solana, Cardano): per SLIP-0010, **all segments must be hardened**. If non-hardened segments are detected, show a warning and block derivation (not just warn)

### 3. Chain Selection

- **Checkbox group** above the derivation results to select which chains to derive
- Checking/unchecking a chain **immediately triggers derivation** for that chain (no Derive button)
- Default selection: **EVM**, **Bitcoin**, **Solana** (covers the three most popular ecosystems)
- Checkbox state persisted to localStorage (`okrun:wallet:selectedChains`) so user's preference survives page reload
- Unchecking a chain clears its cached results from state
- Only checked chains appear as NeonTabs — avoids 8-9 tab clutter
- Chains grouped visually by curve type (secp256k1 vs ed25519) with subtle dividers

### 4. Derivation Results

- **NeonTabs** for chain switching (one tab per selected chain/group)
- Inside each tab: **Table with row expansion**
  - Table columns: `#` (index) | `Address` | expand toggle (`▶`/`▼`)
  - Click a row to expand inline detail panel showing:
    - **Public Key** — full hex/base58 (hidden for Solana where address = public key)
    - **Private Key** — masked by default (`••••••`), Show button reveals for 5 seconds then auto-hides
    - Each field has a Copy button
- Tab footer shows the full derivation path used

### 5. Chain-Aware Display

- Solana: address equals public key (ed25519), so public key row is omitted. Private key shown in **two formats**: Base58 (standard) + u8 array `[12, 34, ...]` (SDK programming use), both with separate Copy buttons
- Bitcoin: private key shown in **WIF format** (Wallet Import Format, standard for wallet import), not raw hex
- Injective: uses coin_type 60 (same as EVM) but addresses are **Bech32-encoded** (`inj1...`), NOT EVM hex format. Address = Bech32(`inj`, SHA256(last 20 bytes of Keccak256(uncompressed_pubkey))). Implemented in `cosmos.ts` with `inj` prefix
- All other chains: show Address + Public Key + Private Key (hex)
- EVM chains grouped into single "EVM" tab (all share coin_type 60); address works across all EVM networks

### 6. Security

- **PrivacyBanner** component at top reminding users not to use generated mnemonics in production
- Private keys masked by default, auto-hide after 5 seconds
- All computation client-side, zero network requests

### 7. Performance

- Derivation runs on the main thread — only selected chains are derived (typically 2-3), each taking < 10ms per address
- No Web Worker needed at this scale (contrast with diff/regex which handle hundreds of KB of text)
- Mnemonic, passphrase, path, or chain selection changes trigger re-derivation synchronously
- If performance proves insufficient in practice, a Worker can be added later

## Dependencies

New packages to install:

| Package            | Purpose                                                                                         | Approx Size            |
| ------------------ | ----------------------------------------------------------------------------------------------- | ---------------------- |
| `@scure/bip39`     | Mnemonic generation, validation, seed derivation (requires explicit `wordlists.english` import) | ~5KB                   |
| `@scure/bip32`     | BIP32 HD key tree derivation                                                                    | ~5KB                   |
| `@noble/secp256k1` | secp256k1 curve (EVM, BTC, Tron, Cosmos)                                                        | ~50KB                  |
| `@noble/hashes`    | SHA-256/512, Keccak-256, RIPEMD-160, HMAC, PBKDF2                                               | ~30KB (tree-shakeable) |
| `@noble/ed25519`   | ed25519 curve (Solana, Cardano) — already in project                                            | 0 (existing)           |
| `@scure/base`      | Base58, Bech32, Bech32m encoding                                                                | ~3KB                   |

Total new bundle: ~93KB gzipped.

## Supported Chains

### secp256k1 chains

| Chain                                                        | Coin Type | Address Format        | Notes                                                |
| ------------------------------------------------------------ | --------- | --------------------- | ---------------------------------------------------- |
| EVM (ETH, BSC, Polygon, Arbitrum, Optimism, Avalanche, etc.) | 60        | `0x` + hex20          | Single tab, shared address                           |
| Bitcoin (Legacy)                                             | 0         | Base58Check (`1...`)  | P2PKH, private key in WIF format                     |
| Bitcoin (SegWit)                                             | 0         | Bech32 (`bc1q...`)    | P2WPKH, path m/84'/0'                                |
| Bitcoin (Taproot)                                            | 0         | Bech32m (`bc1p...`)   | P2TR, path m/86'/0'                                  |
| Tron                                                         | 195       | Base58Check (`T...`)  |                                                      |
| Cosmos (ATOM)                                                | 118       | Bech32 (`cosmos1...`) |                                                      |
| Osmosis (OSMO)                                               | 606       | Bech32 (`osmo1...`)   |                                                      |
| Sei (SEI)                                                    | 713       | Bech32 (`sei1...`)    | SLIP-0044 registered                                 |
| Injective (INJ)                                              | 60        | Bech32 (`inj1...`)    | coin_type=60 but Bech32 address, NOT EVM hex. See §5 |

### ed25519 chains

| Chain   | Coin Type | Address Format     | Notes                                                                                                           |
| ------- | --------- | ------------------ | --------------------------------------------------------------------------------------------------------------- |
| Solana  | 501       | Base58(public key) | Address = public key; private key also shown as u8 array. Path: `m/44'/501'/0'/0'` (all hardened per SLIP-0010) |
| Cardano | 1815      | Bech32             | If time permits                                                                                                 |

> BTC uses three separate checkboxes (Legacy / SegWit / Taproot) with different default purpose fields (44'/84'/86').

## Chain Configuration

Each chain is defined as a `ChainConfig`:

```ts
interface DerivedAccount {
  address: string;
  addressLabel?: string; // e.g. "WIF", "Base58", "Hex" for UI display
  publicKey?: string; // omitted for Solana
  publicKeyLabel?: string;
  privateKey: string;
  privateKeyLabel: string; // e.g. "Private Key (Hex)", "Private Key (WIF)", "Private Key (Base58)"
  privateKeyAlt?: string; // e.g. Solana u8 array string
  privateKeyAltLabel?: string; // e.g. "Private Key (u8 Array)"
  path: string;
}

interface ChainConfig {
  key: string; // "evm", "bitcoin-legacy", "solana"...
  name: string; // i18n key for display name
  coinType: number; // BIP44 coin type
  curve: "secp256k1" | "ed25519";
  showPublicKey: boolean;
  defaultPurpose: number; // 44, 49, 84, 86...
  deriveFromSeed: (seed: Uint8Array, path: string) => DerivedAccount;
}
```

## File Structure

```
libs/wallet/
├── main.ts              # generateMnemonic, validateMnemonic, deriveAccounts
├── chains/
│   ├── registry.ts      # ChainConfig registry, chain list
│   ├── evm.ts           # EVM derivation + address encoding
│   ├── bitcoin.ts       # BTC Legacy/SegWit/Taproot
│   ├── solana.ts        # Solana ed25519 derivation
│   ├── tron.ts          # Tron address encoding
│   ├── cosmos.ts        # Cosmos ecosystem Bech32 (Cosmos, Osmosis, Sei, Injective)
│   └── cardano.ts       # Cardano (stretch goal)
└── __tests__/
    └── main.test.ts     # Unit tests with known test vectors

app/[locale]/wallet/
├── page.tsx             # Route entry
└── wallet-page.tsx      # Page component with all UI and logic
```

## Tool Registration

**`libs/tools.ts`**:

```ts
import { Wallet } from "lucide-react";

// Add to TOOLS array:
{ key: "wallet", path: "/wallet", icon: Wallet }

// Add to security category:
{ key: "security", tools: ["jwt", "hashing", "password", "sshkey", "wallet", "cipher", "checksum"] }

// Add to TOOL_RELATIONS:
wallet: ["sshkey", "password", "hashing", "jwt"],
```

**`i18n/request.ts`**: Add `"wallet"` to the `namespaces` array.

**`libs/seo.ts`**: Add wallet to the tool list for SEO metadata generation.

**`app/sitemap.ts`**: Wallet route will be auto-covered by the dynamic sitemap generator (it iterates `TOOLS` array), no manual change needed.

## i18n

New file per locale: `public/locales/{locale}/wallet.json`

Keys needed:

- Input area labels (mnemonic, passphrase, generate button)
- Validation error messages
- Path editor labels
- Chain selection labels (checkbox names)
- Table headers (index, address, public key, private key)
- Show/hide/copy buttons
- Description section (what is HD wallet, BIP39, BIP32, BIP44)
- FAQ items

Update `public/locales/{locale}/tools.json`:

- Add `wallet.shortTitle`, `wallet.description`, `wallet.searchTerms` (per CJK keyword rules)

Update `i18n/request.ts`:

- Add `"wallet"` to the namespaces array (required for `useTranslations("wallet")` to work)

## Testing

Test framework: Vitest (existing)

**`vitest.config.ts`**: Add `"libs/wallet/**/*.test.ts"` to the `include` array.

Test cases using BIP39 test vector `"abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"`:

- Mnemonic validation (valid, invalid word, invalid checksum, wrong word count)
- Seed derivation matches known test vector
- EVM address derivation at m/44'/60'/0'/0/0 matches expected `0x9858EfFD232B4033E47d90003D41EC34EcaEda94`
- Bitcoin address derivation at m/44'/0'/0'/0/0 matches expected value
- Solana address derivation at m/44'/501'/0'/0' matches expected value (all hardened per SLIP-0010)
- Multi-address derivation (count > 1, indices 0-4)
- Path parsing and validation (valid paths, invalid segments, non-hardened on ed25519 chains)
- Injective address derivation: verify Bech32 encoding with `inj` prefix, NOT EVM hex
