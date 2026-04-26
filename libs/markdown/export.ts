import { domToPng } from "modern-screenshot";

/** Trigger a download of `text` as `filename`.md. */
export function downloadMd(text: string, filename = "document.md"): void {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Open the browser's print dialog. CSS @media print handles layout. */
export function printPdf(): void {
  window.print();
}

/** Capture `el` as a PNG and trigger a download. Throws on failure. */
export async function exportPng(el: HTMLElement, filename = "preview.png"): Promise<void> {
  const bodyBg = getComputedStyle(document.body).backgroundColor;
  const isTransparent = !bodyBg || bodyBg === "rgba(0, 0, 0, 0)" || bodyBg === "transparent";
  const bg = isTransparent
    ? getComputedStyle(document.documentElement).backgroundColor || "#ffffff"
    : bodyBg;
  const dataUrl = await domToPng(el, {
    scale: 2,
    backgroundColor: bg,
  });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
