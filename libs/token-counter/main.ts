import { encode, decode } from "gpt-tokenizer";

export interface TokenInfo {
  id: number;
  text: string;
}

export interface TokenResult {
  tokenCount: number;
  charCount: number;
  tokens: TokenInfo[];
}

export const CONTEXT_WINDOW = 128_000;

export function tokenize(text: string): TokenResult {
  if (!text) {
    return { tokenCount: 0, charCount: 0, tokens: [] };
  }

  const ids = encode(text);
  const tokens: TokenInfo[] = ids.map((id) => ({
    id,
    text: decode([id]),
  }));

  return {
    tokenCount: tokens.length,
    charCount: text.length,
    tokens,
  };
}
