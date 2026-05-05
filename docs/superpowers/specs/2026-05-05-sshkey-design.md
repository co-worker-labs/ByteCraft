# SSH Key Generator — Design Spec

**Date**: 2026-05-05
**Route**: `/sshkey`
**Tool key**: `sshkey`
**Category**: `security`
**Target audience**: DevOps, server administrators, developers who need SSH key pairs

## Overview

A browser-based SSH key pair generator that runs entirely client-side. Supports RSA (2048/3072/4096) and Ed25519 key types with optional passphrase encryption. Includes a public key inspector, fingerprint display, randomart visualization, and a quick deploy command.

## Approach

**Web Crypto API + `@noble/ed25519` + custom OpenSSH format serializers.**

- RSA: Native `crypto.subtle.generateKey()` — zero bundle cost
- Ed25519: `@noble/ed25519` (~15KB gzipped, audited, zero-dependency)
- OpenSSH wire format: Custom serializers (public key blob, private key format)
- Passphrase encryption: In-house bcrypt-pbkdf (~300 lines including Blowfish cipher) + `crypto.subtle` AES-256-CTR (no new dependency)

Rejected alternatives:

- Heavy SSH libraries (`sshpk`, `ssh2`) — large bundle, Node-centric, polyfill overhead
- Web Crypto only (no Ed25519) — missing the most recommended modern key type

## Architecture

### File structure

```
libs/sshkey/
├── main.ts              # High-level API: generateKeyPair(), parsePublicKey()
├── formats.ts           # OpenSSH wire format, unencrypted private key
├── formats-encrypted.ts # OpenSSH private key with passphrase (bcrypt KDF + AES-256-CTR)
├── fingerprint.ts       # SHA-256/MD5 fingerprint, randomart
└── __tests__/
    └── sshkey.test.ts

app/[locale]/sshkey/
├── page.tsx             # Route entry, SEO metadata
└── sshkey-page.tsx      # UI component

public/locales/{locale}/
├── sshkey.json          # Tool-specific translations (10 locales)
└── tools.json           # Add "sshkey" entry
```

### Public API

```ts
type KeyType = "rsa" | "ed25519";
type RsaBits = 2048 | 3072 | 4096;

interface SshKeyOptions {
  type: KeyType;
  rsaBits?: RsaBits; // default 4096
  comment?: string; // default ""
  passphrase?: string; // default "" (no encryption)
}

interface SshKeyResult {
  privateKey: string; // -----BEGIN OPENSSH PRIVATE KEY-----
  publicKey: string; // ssh-rsa AAAA... or ssh-ed25519 AAAA...
  fingerprintSha256: string;
  fingerprintMd5: string;
  randomart: string;
  keyType: string; // "RSA 4096" | "ED25519 256"
  comment: string;
}

interface PublicKeyInfo {
  type: string; // "ssh-rsa" | "ssh-ed25519"
  bits: number; // key bit length
  comment: string;
  fingerprintSha256: string;
  fingerprintMd5: string;
  randomart: string;
}

function generateKeyPair(opts: SshKeyOptions): Promise<SshKeyResult>;
function parsePublicKey(publicKey: string): PublicKeyInfo | { error: string };
```

## Key Generation Logic

### RSA

1. `crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"])`
2. Export as `pkcs8` (private) and `spki` (public) — raw ArrayBuffer
3. Parse DER/ASN.1 to extract RSA components (n, e, d, p, q, dp, dq, qi) — requires a minimal ASN.1 DER parser (~100 lines) since no browser API extracts these raw integers
4. Serialize to OpenSSH wire format for both public and private keys

> **Note:** `RSA-OAEP` is an encryption algorithm, not suitable for SSH signatures. `RSASSA-PKCS1-v1_5` is the correct algorithm name for `ssh-rsa` keys.

### Ed25519

1. `ed25519.utils.randomPrivateKey()` → 32-byte seed
2. `await ed25519.getPublicKeyAsync(seed)` → 32-byte public key (async API uses WebCrypto SHA-512, no extra setup needed)
3. Serialize public key: `<len>"ssh-ed25519"<len><pub>` → base64
4. Serialize private key with 64-byte value: `seed (32 bytes) || publicKey (32 bytes)` in OpenSSH format. This is NOT the expanded hash key — OpenSSH stores the raw seed concatenated with the public key.

### OpenSSH Private Key Format

```
"openssh-key-v1\0"          // null-terminated magic
ciphername: "none"           // "aes256-ctr" when passphrase
kdfname: "none"             // "bcrypt" when passphrase
kdfoptions: ""              // salt (16 bytes) + rounds (uint32) when passphrase
number-of-keys: 1
public-key-blob
private-section:
  check-int (random uint32, repeated twice for verification)
  key-type string
  key-data (type-specific)
  comment
  padding (1, 2, 3, ... to block size)
```

### Passphrase Encryption

When a passphrase is provided:

1. Generate 16-byte random salt
2. bcrypt-pbkdf (16 rounds) → derive 48 bytes (32 for AES-256 key, 16 for CTR IV/nonce)
3. AES-256-CTR encrypt the private section
4. Set `ciphername: "aes256-ctr"`, `kdfname: "bcrypt"`

bcrypt-pbkdf is OpenSSH's custom key derivation function — it is NOT standard bcrypt password hashing. It uses the Blowfish cipher in a PBKDF2-like construction. `bcryptjs` (30KB) only implements bcrypt password hashing and does NOT provide `bcrypt-pbkdf`. Implementation requires: Blowfish cipher (~150 lines) + PBKDF2 wrapper (~100 lines) + AES-256-CTR encryption using `crypto.subtle` (~50 lines) = ~300 lines total in `formats-encrypted.ts`. No additional npm dependency needed since `crypto.subtle` handles AES-256-CTR natively.

### Fingerprint & Randomart

- **SHA-256**: `SHA256:<base64-no-padding>` of the raw public key blob
- **MD5**: Colon-separated hex bytes of MD5 hash (legacy format)
- **Randomart**: 8×17 ASCII art grid, algorithm from OpenSSH source — start at center, walk based on each bit of SHA-256 hash, display character density with border

## UI Layout

Standard OmniKit pattern: `Layout` wrapper, privacy notice banner, then main content.

Two `NeonTabs` at the top level: **Generate** (default) and **Inspect Public Key**.

### Tab 1: Generate (default active)

**Configuration panel**:

- **Key type**: Two mutually-exclusive buttons — `RSA` / `Ed25519` (styled like segmented control, not a tab)
- **RSA bits**: Dropdown `2048 / 3072 / 4096` (visible only when RSA selected, default 4096)
- **Comment**: `Input`, placeholder `user@host`
- **Passphrase**: `Input` with `type="password"` toggle visibility
- **Generate button**: `Button variant="primary"`, disabled during generation, shows spinner for RSA (RSA-4096 can take several seconds via WebCrypto)

**Output panel** (below config):

- **Private key**: `LineNumberedTextarea` (read-only) + `CopyButton` + Download button (`id_rsa` or `id_ed25519`, content type `text/plain;charset=utf-8`, trailing newline)
- **Public key**: `LineNumberedTextarea` (read-only) + `CopyButton` + Download button (`id_rsa.pub` or `id_ed25519.pub`, content type `text/plain;charset=utf-8`, trailing newline)
- **Fingerprint**: Inline SHA-256 + MD5 fingerprints, each with `CopyButton`
- **Randomart**: `<pre>` block, monospace font, `--fg-muted` color
- **Quick deploy**: Readonly `Input` with `ssh-copy-id -i <pubkey_filename> user@host` + `CopyButton`. The `user@host` part is a small editable input next to it. Persisted to `localStorage` via `STORAGE_KEYS` so it survives page reloads.

### Tab 2: Inspect Public Key

- `Textarea` for pasting a public key
- Auto-parse on input, display: key type, bit length, comment, fingerprint, randomart
- Invalid input shows inline error below the textarea

## Dependencies

| Package          | Size          | Purpose                |
| ---------------- | ------------- | ---------------------- |
| `@noble/ed25519` | ~15KB gzipped | Ed25519 key generation |

bcrypt-pbkdf implemented in-house (~300 lines including Blowfish cipher) — no additional npm dependency.

All RSA operations use `crypto.subtle` (native browser API, zero bundle cost). AES-256-CTR for passphrase encryption also uses `crypto.subtle`.

Next.js code-splitting ensures `@noble/ed25519` and format serializers only load on the `/sshkey` route.

## Error Handling

### Generation

- `crypto.subtle` unavailable → show error in UI
- **Generation failure** → catch, show toast via `showToast()`
- **RSA generation latency** → disable Generate button and show spinner while `crypto.subtle.generateKey()` runs (RSA-4096 can take 2-5 seconds)

### Passphrase

- Empty passphrase → unencrypted private key (`cipher: none`)
- No minimum length enforced (matches `ssh-keygen` behavior)
- UTF-8 encoded before KDF

### Public key inspector

- Malformed input (missing `ssh-` prefix, invalid base64, wrong structure) → inline error message
- Unsupported key type (e.g. `ssh-dss`, `ecdsa-sha2-*`) → message: only `ssh-rsa` and `ssh-ed25519` supported

### Download naming

- RSA: `id_rsa` / `id_rsa.pub` (content type `text/plain;charset=utf-8`, trailing newline)
- Ed25519: `id_ed25519` / `id_ed25519.pub` (content type `text/plain;charset=utf-8`, trailing newline)

## Testing

Test file: `libs/sshkey/__tests__/sshkey.test.ts`, run via `npm run test`.

**Vitest config**: Add `"libs/sshkey/**/*.test.ts"` to `include` array in `vitest.config.ts`.

### Format serializers

- RSA public key blob → valid base64 starting with `ssh-rsa`
- Ed25519 public key blob → valid base64 starting with `ssh-ed25519`
- Private key starts/ends with OpenSSH PEM markers
- Unencrypted private key contains `cipher: none`
- Round-trip: generate → parse public key → fingerprints match

### Encrypted format

- Encrypted private key has `cipher: aes256-ctr` and `kdf: bcrypt`
- Correct passphrase decrypts to match unencrypted private key
- Wrong passphrase fails to produce valid output

### Fingerprint

- SHA-256 format: `SHA256:<base64-no-padding>`
- MD5 format: `xx:xx:xx:...` (16 colon-separated hex octets)
- Randomart is 8×17 grid with border characters

### Public key parser

- Valid `ssh-rsa ...` → correct type, bit length, comment
- Valid `ssh-ed25519 ...` → correct type, comment
- Invalid input → error result
- Public key with no comment → empty string

### Tool registration

- `sshkey` entry exists in `TOOLS` array
- Appears in `security` category

## i18n

New translation namespace `sshkey` across all 10 locales.

English `tools.json` entry:

```json
"sshkey": {
  "title": "SSH Key Generator - Generate RSA & Ed25519 Key Pairs Online",
  "shortTitle": "SSH Key Generator",
  "description": "Generate SSH key pairs (RSA, Ed25519) entirely in your browser. Supports passphrase encryption, fingerprint display, and public key inspection. No data sent to any server."
}
```

CJK locales include `searchTerms` following the existing convention (romanized full + romanized initials + up to 3 specific keywords).

## Tool Registration

In `libs/tools.ts`:

- Import `Terminal` icon from `lucide-react`
- Add to `TOOLS` array: `{ key: "sshkey", path: "/sshkey", icon: Terminal }`
- Add `"sshkey"` to `TOOL_CATEGORIES.security` after `"password"` (same domain — key/auth tools): `["jwt", "hashing", "password", "sshkey", "cipher", "checksum"]`
