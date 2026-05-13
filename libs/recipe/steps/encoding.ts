import type { RecipeStepDef } from "../types";

function base64Encode(input: string): string {
  return btoa(unescape(encodeURIComponent(input)));
}

function base64Decode(input: string): string {
  return decodeURIComponent(escape(atob(input)));
}

export const encodingSteps: RecipeStepDef[] = [
  {
    id: "base64-encode",
    name: "Base64 Encode",
    category: "encoding",
    icon: "🔒",
    description: "Encode text to Base64",
    inputType: "text",
    outputType: "text",
    parameters: [],
    async execute(input: string) {
      try {
        return { ok: true as const, output: base64Encode(input) };
      } catch (e) {
        return { ok: false as const, error: String(e) };
      }
    },
  },
  {
    id: "base64-decode",
    name: "Base64 Decode",
    category: "encoding",
    icon: "🔓",
    description: "Decode Base64 to text",
    inputType: "text",
    outputType: "text",
    parameters: [],
    async execute(input: string) {
      try {
        return { ok: true as const, output: base64Decode(input) };
      } catch (e) {
        return { ok: false as const, error: String(e) };
      }
    },
  },
  {
    id: "url-encode-component",
    name: "URL Encode (Component)",
    category: "encoding",
    icon: "🔗",
    description: "Encode text as a URL component",
    inputType: "text",
    outputType: "text",
    parameters: [],
    async execute(input: string) {
      try {
        return { ok: true as const, output: encodeURIComponent(input) };
      } catch (e) {
        return { ok: false as const, error: String(e) };
      }
    },
  },
  {
    id: "url-decode-component",
    name: "URL Decode (Component)",
    category: "encoding",
    icon: "🔗",
    description: "Decode a URL-encoded component",
    inputType: "text",
    outputType: "text",
    parameters: [],
    async execute(input: string) {
      try {
        return { ok: true as const, output: decodeURIComponent(input) };
      } catch (e) {
        return { ok: false as const, error: String(e) };
      }
    },
  },
  {
    id: "url-encode-full",
    name: "URL Encode (Full)",
    category: "encoding",
    icon: "🌐",
    description: "Encode a full URL",
    inputType: "text",
    outputType: "text",
    parameters: [],
    async execute(input: string) {
      try {
        return { ok: true as const, output: encodeURI(input) };
      } catch (e) {
        return { ok: false as const, error: String(e) };
      }
    },
  },
  {
    id: "url-decode-full",
    name: "URL Decode (Full)",
    category: "encoding",
    icon: "🌐",
    description: "Decode a full URL",
    inputType: "text",
    outputType: "text",
    parameters: [],
    async execute(input: string) {
      try {
        return { ok: true as const, output: decodeURI(input) };
      } catch (e) {
        return { ok: false as const, error: String(e) };
      }
    },
  },
];
