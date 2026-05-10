# BIP39 Word List Tool — Design Spec

## Summary

Add a new standalone tool at `/bip39` that displays the complete BIP39 English word list (2048 words) in a searchable grid layout. The wallet tool page links to it for reference and SEO discoverability.

## Approach

Client-side only. Import `wordlist` directly from `@scure/bip39/wordlists/english.js` in the page component — no new libs files needed. Consistent with how ASCII Table (`libs/ascii.ts`) and HTML Code (`libs/htmlcode.ts`) handle static reference data.

## File Structure

```
app/[locale]/bip39/
├── page.tsx          # Route entry, SEO metadata, JSON-LD
└── bip39-page.tsx    # Page component: word grid + search + description
```

No new `libs/` files.

## Tool Registration

In `libs/tools.ts`:

- `TOOLS` array: add `{ key: "bip39", path: "/bip39", icon: BookOpen }` (or similar list/reference icon)
- `TOOL_CATEGORIES`: add `"bip39"` to the `security-crypto` category
- `RELATED_TOOLS`:
  - `wallet` array: add `"bip39"`
  - `bip39` array: add `["wallet", "password"]`

## Page Component: bip39-page.tsx

### Structure

```tsx
"use client";

function WordGrid() {
  // Search input + filtered word grid
}

function Description() {
  // BIP39 explanation, FAQ
}

export default function BIP39Page() {
  return (
    <Layout title={...} categoryLabel={...} categorySlug="security-crypto">
      <PrivacyBanner />
      <WordGrid />
      <Description />
      <RelatedTools currentTool="bip39" />
    </Layout>
  );
}
```

### WordGrid Component

**Data source:** `import { wordlist } from "@scure/bip39/wordlists/english.js"`

**Search bar:** `StyledInput` at top, placeholder from i18n key `searchPlaceholder`.

**Stats line:** Below search bar — "Showing {count} of 2048 words" (i18n key `showingCount`).

**Grid layout:** Responsive CSS grid.

| Breakpoint | Columns |
| ---------- | ------- |
| Mobile     | 3       |
| Tablet     | 4       |
| Desktop    | 5–6     |

**Grid cell:** Each cell shows:

- Word index (1-based): `text-fg-muted text-xs`
- Word text: `text-fg-primary font-mono text-sm`
- Hover: `bg-bg-surface/50` highlight
- Search match highlight: matched portion in `text-accent-cyan`

**Search logic:**

- Input trimmed, lowercased
- `filter(word => word.startsWith(query))`
- Empty query shows all 2048 words
- React Compiler auto-memoizes the filtered list

## Wallet Page Integration

### RelatedTools

Already covered by `RELATED_TOOLS` mapping — the `<RelatedTools currentTool="wallet" />` component will automatically show the bip39 link.

### Description Link

Add a sentence in the wallet page's BIP39 description section linking to `/bip39`. Update i18n key `descriptions.bip39` to include link text like "View the complete BIP39 word list →".

Two options for implementation:

- Option A: Use a rich-text i18n approach (e.g., splitting the key into `bip39Prefix` + `bip39LinkText`)
- Option B: Keep it simple — add the link as a separate element below the paragraph, not embedded in the translated string

**Chosen: Option B** — add a small link element after the BIP39 description paragraph. Avoids complex ICU message formatting for a single link.

## i18n

### New file: `public/locales/{locale}/bip39.json`

Keys:

- `searchPlaceholder` — "Search BIP39 words..."
- `showingCount` — "Showing {count} of 2048 words"
- `viewWordList` — "View complete BIP39 word list →" (used in wallet description link)
- `descriptions.whatIsTitle` / `descriptions.whatIs` — What is BIP39
- `descriptions.purposeTitle` / `descriptions.purpose` — Purpose of the word list
- `descriptions.securityTitle` / `descriptions.security` — Security notes
- `descriptions.faq1Q` / `descriptions.faq1A` — FAQ items (2-3 items)

### Update: `public/locales/{locale}/tools.json`

Add `bip39` entry with:

- `shortTitle` — "BIP39 Word List"
- `description` — "Complete BIP39 mnemonic word list reference with search"
- `searchTerms` (CJK only) — romanized tokens per AGENTS.md convention

### Locales

All 10 locales: en, zh-CN, zh-TW, ja, ko, es, pt-BR, fr, de, ru.

## SEO

- `page.tsx` uses `generatePageMeta()` for canonical URL, alternates, OG, Twitter
- `buildToolSchemas()` for JSON-LD (WebApplication, BreadcrumbList)
- `app/sitemap.ts` automatically includes the new route via tool registry

## Files Modified

| File                                  | Change                                             |
| ------------------------------------- | -------------------------------------------------- |
| `libs/tools.ts`                       | Register bip39 tool, icon, category, related tools |
| `app/[locale]/bip39/page.tsx`         | New — route entry                                  |
| `app/[locale]/bip39/bip39-page.tsx`   | New — page component                               |
| `app/[locale]/wallet/wallet-page.tsx` | Add link to bip39 in Description                   |
| `public/locales/{locale}/bip39.json`  | New × 10 — tool translations                       |
| `public/locales/{locale}/tools.json`  | Update × 10 — bip39 entry                          |
| `public/locales/{locale}/wallet.json` | Update × 10 — add viewWordList key                 |
| `libs/storage-keys.ts`                | No change needed                                   |
