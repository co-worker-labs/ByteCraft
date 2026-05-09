import Prism from "prismjs";

import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";

const EXTRA_LANGS = ["typescript", "python", "bash", "json", "sql", "yaml", "go", "rust"];

const loadedLangs = new Set<string>();

export async function loadPrismLanguage(lang: string): Promise<void> {
  const resolved = LANGUAGE_ALIASES[lang] ?? lang;
  if (loadedLangs.has(resolved) || Prism.languages[resolved]) return;
  try {
    await import(`prismjs/components/prism-${resolved}`);
    loadedLangs.add(resolved);
  } catch {
    // Language not available, fallback to plain text
  }
}

export async function ensureLanguagesLoaded(): Promise<void> {
  await Promise.all(EXTRA_LANGS.map((lang) => loadPrismLanguage(lang)));
}

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  golang: "go",
  rs: "rust",
  html: "markup",
  xml: "markup",
};

/** Resolve a fence info-string lang to a registered Prism grammar key, or null. */
export function resolveLanguage(raw: string): string | null {
  if (!raw) return null;
  const normalized = LANGUAGE_ALIASES[raw] ?? raw;
  return Prism.languages[normalized] ? normalized : null;
}

export { Prism };
