import { generate as generateUuid, formatUuid } from "../../uuid/main";
import type { RecipeStepDef } from "../types";

export const generatorSteps: RecipeStepDef[] = [
  {
    id: "uuid-gen",
    name: "Generate UUID",
    category: "generators",
    icon: "🆔",
    description: "Generate UUID v4 or v7",
    inputType: "none",
    outputType: "text",
    parameters: [
      {
        id: "version",
        type: "select",
        label: "Version",
        defaultValue: "v4",
        options: [
          { label: "UUID v4", value: "v4" },
          { label: "UUID v7", value: "v7" },
        ],
      },
      {
        id: "count",
        type: "text",
        label: "Count",
        defaultValue: "1",
        placeholder: "Number of UUIDs",
      },
    ],
    async execute(_input: string, params: Record<string, string>) {
      try {
        const version = (params.version || "v4") as "v4" | "v7";
        const count = Math.max(1, parseInt(params.count || "1", 10) || 1);
        const bytes = generateUuid({ version, count });
        const uuids = bytes.map((b) => formatUuid(b, "standard", false));
        return { ok: true as const, output: uuids.join("\n") };
      } catch (e) {
        return { ok: false as const, error: String(e) };
      }
    },
  },
  {
    id: "qrcode-gen",
    name: "Generate QR Code",
    category: "generators",
    icon: "📱",
    description: "Generate a QR code image",
    inputType: "text",
    outputType: "image",
    parameters: [
      {
        id: "size",
        type: "text",
        label: "Size",
        defaultValue: "300",
        placeholder: "Image size in px",
      },
      {
        id: "errorLevel",
        type: "select",
        label: "Error Correction",
        defaultValue: "M",
        options: [
          { label: "Low (L)", value: "L" },
          { label: "Medium (M)", value: "M" },
          { label: "Quartile (Q)", value: "Q" },
          { label: "High (H)", value: "H" },
        ],
      },
      {
        id: "format",
        type: "select",
        label: "Format",
        defaultValue: "png",
        options: [
          { label: "PNG", value: "png" },
          { label: "SVG", value: "svg" },
        ],
      },
    ],
    async execute(_input: string, _params: Record<string, string>) {
      return { ok: false as const, error: "QR code generation requires browser environment" };
    },
  },
];
