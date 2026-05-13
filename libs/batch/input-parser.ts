import type { BatchInputItem } from "./types";

let idCounter = 0;

function generateId(): string {
  return `batch-${Date.now()}-${++idCounter}`;
}

export function parseTextInput(text: string): BatchInputItem[] {
  if (!text.trim()) return [];

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => ({
      id: generateId(),
      name: line.length > 50 ? line.slice(0, 47) + "..." : line,
      content: line,
      type: "text" as const,
      size: new TextEncoder().encode(line).byteLength,
    }));
}

export function parseFileInput(file: File, readContent: string): BatchInputItem {
  const isImage = file.type.startsWith("image/");
  return {
    id: generateId(),
    name: file.name,
    content: readContent,
    type: isImage ? "image" : "text",
    size: file.size,
  };
}
