import MarkdownIt from "markdown-it";
import taskLists from "markdown-it-task-lists";
import { Prism, resolveLanguage } from "./highlight";

const SAFE_PROTOCOL = /^(https?|mailto|tel):/i;
const SAFE_DATA_IMAGE = /^data:image\/(gif|png|jpe?g|webp);base64,/i;
const RELATIVE_OR_ANCHOR = /^(#|\/|\.\.?\/)/;

const md: MarkdownIt = new MarkdownIt({
  html: false, // No raw HTML — XSS protection layer 1
  linkify: true, // Auto-link URLs
  typographer: true, // Smart quotes, dashes
  breaks: true, // GFM newline → <br>
});

// XSS protection layer 2: explicit allowlist (defense-in-depth).
md.validateLink = (url: string): boolean => {
  if (RELATIVE_OR_ANCHOR.test(url)) return true;
  if (SAFE_PROTOCOL.test(url)) return true;
  if (SAFE_DATA_IMAGE.test(url)) return true;
  return false;
};

// GFM checkbox list (read-only render).
md.use(taskLists, { enabled: false });

// Code block highlighting via Prism.
md.renderer.rules.fence = (tokens, idx) => {
  const token = tokens[idx];
  const code = token.content;
  const raw = (token.info || "").trim().toLowerCase();
  const lang = resolveLanguage(raw);
  const escaped = md.utils.escapeHtml(code);

  if (!lang) {
    return `<pre class="language-text"><code>${escaped}</code></pre>`;
  }

  const highlighted = Prism.highlight(code, Prism.languages[lang], lang);
  return `<pre class="language-${lang}"><code class="language-${lang}">${highlighted}</code></pre>`;
};

export function renderMarkdown(input: string): string {
  return md.render(input);
}
