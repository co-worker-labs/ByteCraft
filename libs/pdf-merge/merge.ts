import { PDFDocument } from "pdf-lib";

export async function getPdfPageCount(data: ArrayBuffer): Promise<number> {
  const doc = await PDFDocument.load(new Uint8Array(data.slice(0)), { ignoreEncryption: true });
  const count = doc.getPageCount();
  return count;
}

export async function mergePdfs(
  files: ArrayBuffer[],
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    onProgress?.(i + 1, total);
    const src = await PDFDocument.load(new Uint8Array(files[i].slice(0)), {
      ignoreEncryption: true,
    });
    const pages = await merged.copyPages(src, src.getPageIndices());
    for (const page of pages) {
      merged.addPage(page);
    }
  }

  return merged.save();
}
