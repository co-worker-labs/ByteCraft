import { encode } from "../../image/encode";
import { calculateDimensions } from "../../image/resize";
import type { RecipeStepDef } from "../types";

function isSvgDataUrl(dataUrl: string): boolean {
  return dataUrl.startsWith("data:image/svg+xml");
}

function rasterizeSvg(dataUrl: string): Promise<ImageBitmap> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to rasterize SVG"));
          return;
        }
        createImageBitmap(blob).then(resolve, reject);
      }, "image/png");
    };
    img.onerror = () => reject(new Error("Failed to load SVG image"));
    img.src = dataUrl;
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, data] = dataUrl.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] || "application/octet-stream";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

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
        id: "format",
        type: "select",
        label: "Format",
        defaultValue: "webp",
        options: [
          { label: "PNG", value: "png" },
          { label: "JPEG", value: "jpeg" },
          { label: "WebP", value: "webp" },
        ],
      },
      {
        id: "quality",
        type: "slider",
        label: "Quality",
        defaultValue: "80",
        min: 1,
        max: 100,
        step: 1,
        dependsOn: { paramId: "format", values: ["jpeg", "webp"] },
      },
      {
        id: "resizeMode",
        type: "select",
        label: "Resize",
        defaultValue: "none",
        options: [
          { label: "None", value: "none" },
          { label: "By Percent", value: "percent" },
          { label: "Custom", value: "custom" },
        ],
      },
      {
        id: "resizePercent",
        type: "slider",
        label: "Percent",
        defaultValue: "100",
        min: 1,
        max: 400,
        step: 1,
        dependsOn: { paramId: "resizeMode", values: ["percent"] },
      },
      {
        id: "targetWidth",
        type: "text",
        label: "Width",
        defaultValue: "",
        placeholder: "Width in px",
        dependsOn: { paramId: "resizeMode", values: ["custom"] },
      },
      {
        id: "targetHeight",
        type: "text",
        label: "Height",
        defaultValue: "",
        placeholder: "Height in px",
        dependsOn: { paramId: "resizeMode", values: ["custom"] },
      },
    ],
    async execute(input: string, params: Record<string, string>) {
      try {
        if (!input) return { ok: false as const, error: "No image input" };

        const quality = Math.max(1, Math.min(100, parseInt(params.quality || "80", 10) || 80));
        const format = (params.format || "webp") as "png" | "jpeg" | "webp";
        const resizeMode = (params.resizeMode || "none") as "none" | "percent" | "custom";
        const resizePercent = parseInt(params.resizePercent || "100", 10) || 100;
        const targetWidth = parseInt(params.targetWidth || "", 10) || undefined;
        const targetHeight = parseInt(params.targetHeight || "", 10) || undefined;

        const bitmap = isSvgDataUrl(input)
          ? await rasterizeSvg(input)
          : await createImageBitmap(dataUrlToBlob(input));

        const dims = calculateDimensions(
          bitmap.width,
          bitmap.height,
          resizeMode,
          resizePercent,
          targetWidth,
          targetHeight,
          true
        );

        const result = await encode(bitmap, {
          format,
          quality,
          width: dims.width,
          height: dims.height,
        });

        const dataUrl = await blobToDataUrl(result);
        return { ok: true as const, output: dataUrl };
      } catch (e) {
        return { ok: false as const, error: String(e) };
      }
    },
  },
];
