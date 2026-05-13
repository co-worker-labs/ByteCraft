import { camelCase, pascalCase, snakeCase, kebabCase } from "change-case";
import { dedupLines, defaultOptions } from "../../deduplines/main";
import { extract } from "../../extractor/main";
import type { RecipeStepDef } from "../types";

export const textSteps: RecipeStepDef[] = [
  {
    id: "text-camel",
    name: "camelCase",
    category: "text",
    icon: "🔤",
    description: "Convert text to camelCase",
    inputType: "text",
    outputType: "text",
    parameters: [],
    async execute(input: string) {
      return { ok: true as const, output: camelCase(input) };
    },
  },
  {
    id: "text-pascal",
    name: "PascalCase",
    category: "text",
    icon: "🔤",
    description: "Convert text to PascalCase",
    inputType: "text",
    outputType: "text",
    parameters: [],
    async execute(input: string) {
      return { ok: true as const, output: pascalCase(input) };
    },
  },
  {
    id: "text-snake",
    name: "snake_case",
    category: "text",
    icon: "🔤",
    description: "Convert text to snake_case",
    inputType: "text",
    outputType: "text",
    parameters: [],
    async execute(input: string) {
      return { ok: true as const, output: snakeCase(input) };
    },
  },
  {
    id: "text-kebab",
    name: "kebab-case",
    category: "text",
    icon: "🔤",
    description: "Convert text to kebab-case",
    inputType: "text",
    outputType: "text",
    parameters: [],
    async execute(input: string) {
      return { ok: true as const, output: kebabCase(input) };
    },
  },
  {
    id: "text-upper",
    name: "UPPERCASE",
    category: "text",
    icon: "⬆️",
    description: "Convert text to uppercase",
    inputType: "text",
    outputType: "text",
    parameters: [],
    async execute(input: string) {
      return { ok: true as const, output: input.toUpperCase() };
    },
  },
  {
    id: "text-lower",
    name: "lowercase",
    category: "text",
    icon: "⬇️",
    description: "Convert text to lowercase",
    inputType: "text",
    outputType: "text",
    parameters: [],
    async execute(input: string) {
      return { ok: true as const, output: input.toLowerCase() };
    },
  },
  {
    id: "regex-replace",
    name: "Regex Replace",
    category: "text",
    icon: "🔄",
    description: "Replace text using regex",
    inputType: "text",
    outputType: "text",
    parameters: [
      {
        id: "pattern",
        type: "text",
        label: "Pattern",
        defaultValue: "",
        placeholder: "Regular expression pattern",
      },
      {
        id: "replacement",
        type: "text",
        label: "Replacement",
        defaultValue: "",
        placeholder: "Replacement string",
      },
      {
        id: "flags",
        type: "text",
        label: "Flags",
        defaultValue: "g",
        placeholder: "Regex flags (e.g. g, gi)",
      },
    ],
    async execute(input: string, params: Record<string, string>) {
      const pattern = params.pattern || "";
      if (!pattern) return { ok: false as const, error: "Pattern is required" };
      try {
        const re = new RegExp(pattern, params.flags || "g");
        return { ok: true as const, output: input.replace(re, params.replacement || "") };
      } catch (e) {
        return { ok: false as const, error: String(e) };
      }
    },
  },
  {
    id: "dedup-lines",
    name: "Deduplicate Lines",
    category: "text",
    icon: "📋",
    description: "Remove duplicate lines",
    inputType: "text",
    outputType: "text",
    parameters: [
      {
        id: "caseSensitive",
        type: "select",
        label: "Case Sensitive",
        defaultValue: "true",
        options: [
          { label: "Yes", value: "true" },
          { label: "No", value: "false" },
        ],
      },
      {
        id: "trimWhitespace",
        type: "select",
        label: "Trim Whitespace",
        defaultValue: "true",
        options: [
          { label: "Yes", value: "true" },
          { label: "No", value: "false" },
        ],
      },
    ],
    async execute(input: string, params: Record<string, string>) {
      const result = dedupLines(input, {
        ...defaultOptions,
        caseSensitive: params.caseSensitive !== "false",
        trimLines: params.trimWhitespace !== "false",
      });
      return { ok: true as const, output: result.output };
    },
  },
  {
    id: "extract-emails",
    name: "Extract Emails",
    category: "text",
    icon: "📧",
    description: "Extract email addresses from text",
    inputType: "text",
    outputType: "text",
    parameters: [],
    async execute(input: string) {
      const results = extract(input, ["email"]);
      const emails = [...new Set(results.map((r) => r.value))];
      return { ok: true as const, output: emails.join("\n") };
    },
  },
  {
    id: "extract-urls",
    name: "Extract URLs",
    category: "text",
    icon: "🔗",
    description: "Extract URLs from text",
    inputType: "text",
    outputType: "text",
    parameters: [],
    async execute(input: string) {
      const results = extract(input, ["url"]);
      const urls = [...new Set(results.map((r) => r.value))];
      return { ok: true as const, output: urls.join("\n") };
    },
  },
];
