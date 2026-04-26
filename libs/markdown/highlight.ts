import Prism from "prismjs";

// Core langs (javascript, css, markup, clike) are bundled in prism core.
// We import the component file anyway for explicitness — these are no-ops.
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";

// Extra langs (require explicit import).
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";

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
