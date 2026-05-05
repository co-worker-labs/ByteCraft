export type ExtractorType = "email" | "url" | "phone";

export type ExtractionResult = {
  type: ExtractorType;
  value: string;
  index: number;
};

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const URL_RE =
  /https?:\/\/[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/g;

const PHONE_RE = /(?:\+?\d{1,4}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g;

const PHONE_MIN_DIGITS = 7;

const TRAILING_PUNCT_RE = /[.,;)]+$/;

function stripTrailingPunctuation(value: string): string {
  return value.replace(TRAILING_PUNCT_RE, "");
}

function countDigits(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] >= "0" && s[i] <= "9") n++;
  }
  return n;
}

const PATTERNS: Record<ExtractorType, RegExp> = {
  email: EMAIL_RE,
  url: URL_RE,
  phone: PHONE_RE,
};

export function extract(input: string, types: ExtractorType[]): ExtractionResult[] {
  if (!input || types.length === 0) return [];

  const results: ExtractionResult[] = [];

  for (const type of types) {
    const re = new RegExp(PATTERNS[type].source, "g");
    let match: RegExpExecArray | null;

    while ((match = re.exec(input)) !== null) {
      let value = match[0];

      value = stripTrailingPunctuation(value);

      if (type === "phone" && countDigits(value) < PHONE_MIN_DIGITS) {
        continue;
      }

      results.push({ type, value, index: match.index });
    }
  }

  results.sort((a, b) => a.index - b.index);

  return results;
}
