import type { DataType, RecipeStepInstance } from "./types";

export interface RecipeExample {
  id: string;
  input: string;
  inputType: DataType;
  steps: RecipeStepInstance[];
}

export const RECIPE_EXAMPLES: RecipeExample[] = [
  {
    id: "encode-hash",
    input: "Hello, OmniKit!",
    inputType: "text",
    steps: [
      { stepId: "base64-encode", params: {}, enabled: true },
      { stepId: "hash-sha256", params: {}, enabled: true },
    ],
  },
  {
    id: "json-typescript",
    input: '{"name":"OmniKit","url":"https://omnikit.run","tags":["json","regex","base64"]}',
    inputType: "text",
    steps: [
      { stepId: "json-format", params: { indent: "2" }, enabled: true },
      { stepId: "json-ts", params: { rootName: "OmniKit" }, enabled: true },
    ],
  },
  {
    id: "text-cleanup",
    input: [
      "Hello World",
      "hello world",
      "HELLO WORLD",
      "Hello World",
      "Visit https://omnikit.run for tools",
      "Check https://omnikit.run/json",
    ].join("\n"),
    inputType: "text",
    steps: [
      { stepId: "text-lower", params: {}, enabled: true },
      {
        stepId: "dedup-lines",
        params: { caseSensitive: "true", trimWhitespace: "true" },
        enabled: true,
      },
      { stepId: "extract-urls", params: {}, enabled: true },
    ],
  },
];
