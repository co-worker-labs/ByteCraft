import { generate as generateUuid, formatUuid } from "../../uuid/main";
import { buildOptions } from "../../qrcode/styling";
import type { RecipeStepDef } from "../types";
import type { StylingOptions } from "../../qrcode/types";

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
        type: "select",
        label: "Resolution",
        defaultValue: "300",
        options: [
          { label: "300 × 300", value: "300" },
          { label: "600 × 600", value: "600" },
          { label: "1024 × 1024", value: "1024" },
        ],
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
    async execute(input: string, params: Record<string, string>) {
      try {
        const size = Math.max(64, Math.min(1024, parseInt(params.size || "300", 10) || 300));
        const errorLevel = (params.errorLevel || "M") as "L" | "M" | "Q" | "H";
        const format = params.format || "png";

        const data = input || "https://omnikit.run";

        const styling: StylingOptions = {
          foregroundColor: "#000000",
          backgroundColor: "#ffffff",
          dotStyle: "rounded",
          errorCorrection: errorLevel,
          size,
          margin: 10,
        };

        const opts = buildOptions(data, styling);
        const QRCodeStyling = (await import("qr-code-styling")).default;

        if (format === "svg") {
          opts.type = "svg";
          const qr = new QRCodeStyling(opts);
          const container = document.createElement("div");
          qr.append(container);
          await new Promise((r) => setTimeout(r, 50));
          const svgEl = container.querySelector("svg");
          if (!svgEl) return { ok: false as const, error: "Failed to generate SVG" };
          const svgStr = new XMLSerializer().serializeToString(svgEl);
          return {
            ok: true as const,
            output: `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgStr)))}`,
          };
        }

        const qr = new QRCodeStyling(opts);
        opts.type = "canvas";
        qr.update(opts);
        const blob = await qr.getRawData("png");
        if (!blob) return { ok: false as const, error: "Failed to generate QR code" };
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        return { ok: true as const, output: dataUrl };
      } catch (e) {
        return { ok: false as const, error: String(e) };
      }
    },
  },
];
