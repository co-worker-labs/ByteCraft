import type { RecipeStepDef } from "../types";

export const visualSteps: RecipeStepDef[] = [
  {
    id: "image-compress",
    name: "Compress Image",
    category: "visual",
    icon: "🖼️",
    description: "Compress and resize images",
    inputType: "image",
    outputType: "image",
    parameters: [
      {
        id: "quality",
        type: "text",
        label: "Quality",
        defaultValue: "80",
        placeholder: "Quality (1-100)",
      },
      {
        id: "maxWidth",
        type: "text",
        label: "Max Width",
        defaultValue: "",
        placeholder: "Max width in px",
      },
      {
        id: "maxHeight",
        type: "text",
        label: "Max Height",
        defaultValue: "",
        placeholder: "Max height in px",
      },
      {
        id: "format",
        type: "select",
        label: "Format",
        defaultValue: "png",
        options: [
          { label: "PNG", value: "png" },
          { label: "JPEG", value: "jpeg" },
          { label: "WebP", value: "webp" },
        ],
      },
    ],
    async execute(_input: string, _params: Record<string, string>) {
      return { ok: false as const, error: "Image compression requires browser environment" };
    },
  },
];
